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
import type {OnboardingTask} from '@libs/actions/Welcome/OnboardingFlow';
import StringUtils from '@libs/StringUtils';
import dedent from '@libs/StringUtils/dedent';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import type {OriginalMessageSettlementAccountLocked, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';
import ObjectUtils from '@src/types/utils/ObjectUtils';
import type en from './en';
import type {
    ChangeFieldParams,
    ConnectionNameParams,
    CreatedReportForUnapprovedTransactionsParams,
    DelegateRoleParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    EditActionParams,
    ExportAgainModalDescriptionParams,
    ExportIntegrationSelectedParams,
    IntacctMappingTitleParams,
    IntegrationExportParams,
    IntegrationSyncFailedParams,
    InvalidPropertyParams,
    InvalidValueParams,
    IssueVirtualCardParams,
    LastSyncAccountingParams,
    LastSyncDateParams,
    LearnMoreRouteParams,
    LeftWorkspaceParams,
    LocalTimeParams,
    LogSizeParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    MergeAccountIntoParams,
    MergeFailureDescriptionGenericParams,
    MergeFailureUncreatedAccountDescriptionParams,
    MergeSuccessDescriptionParams,
    MissingPropertyParams,
    MovedActionParams,
    MovedFromPersonalSpaceParams,
    MovedFromReportParams,
    MovedTransactionParams,
    MultifactorAuthenticationTranslationParams,
    NeedCategoryForExportToIntegrationParams,
    NewWorkspaceNameParams,
    NextStepParams,
    NoLongerHaveAccessParams,
    NotAllowedExtensionParams,
    NotYouParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    OptionalParam,
    OurEmailProviderParams,
    OwnerOwesAmountParams,
    PaidElsewhereParams,
    ParentNavigationSummaryParams,
    PayAndDowngradeDescriptionParams,
    PayerOwesParams,
    PayerPaidParams,
    PaySomeoneParams,
    PhoneErrorRouteParams,
    PolicyAddedReportFieldOptionParams,
    PolicyDisabledReportFieldAllOptionsParams,
    PolicyDisabledReportFieldOptionParams,
    PolicyExpenseChatNameParams,
    QBDSetupErrorBodyParams,
    RailTicketParams,
    ReceiptPartnersUberSubtitleParams,
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
    ReportFieldParams,
    ReportPolicyNameParams,
    RequestAmountParams,
    RequiredFieldParams,
    ResolutionConstraintsParams,
    ReviewParams,
    RoleNamesParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    RoutedDueToDEWParams,
    RulesEnableWorkflowsParams,
    SecondaryLoginParams,
    SetTheDistanceMerchantParams,
    SetTheRequestParams,
    SettledAfterAddedBankAccountParams,
    SettleExpensifyCardParams,
    SettlementAccountInfoParams,
    SettlementAccountReconciliationParams,
    SettlementDateParams,
    ShareParams,
    SignerInfoMessageParams,
    SignUpNewFaceCodeParams,
    SizeExceededParams,
    SplitAmountParams,
    SplitDateRangeParams,
    SplitExpenseEditTitleParams,
    SplitExpenseSubtitleParams,
    StatementTitleParams,
    StepCounterParams,
    StripePaidParams,
    SubmitsToParams,
    SubmittedToVacationDelegateParams,
    SubmittedWithMemoParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsLearnMoreParams,
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
    ToggleImportTitleParams,
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
    UpdatedPolicyCustomUnitRateEnabledParams,
    UpdatedPolicyCustomUnitRateParams,
    UpdatedPolicyCustomUnitTaxClaimablePercentageParams,
    UpdatedPolicyCustomUnitTaxRateExternalIDParams,
    UpdatedPolicyDescriptionParams,
    UpdatedPolicyFieldWithNewAndOldValueParams,
    UpdatedPolicyFieldWithValueParam,
    UpdatedPolicyFrequencyParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedPolicyPreventSelfApprovalParams,
    UpdatedPolicyReimbursementEnabledParams,
    UpdatedPolicyReimburserParams,
    UpdatedPolicyReportFieldDefaultValueParams,
    UpdatedPolicyTagFieldParams,
    UpdatedPolicyTagNameParams,
    UpdatedPolicyTagParams,
    UpdatedPolicyTaxParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdatePolicyCustomUnitParams,
    UpdatePolicyCustomUnitTaxEnabledParams,
    UpdateRoleParams,
    UpgradeSuccessMessageParams,
    UsePlusButtonParams,
    UserIsAlreadyMemberParams,
    UserSplitParams,
    VacationDelegateParams,
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
    WalletAgreementParams,
    WalletProgramParams,
    WelcomeEnterMagicCodeParams,
    WelcomeToRoomParams,
    WeSentYouMagicSignInLinkParams,
    WorkEmailMergingBlockedParams,
    WorkEmailResendCodeParams,
    WorkflowSettingsParam,
    WorkspaceLockedPlanTypeParams,
    WorkspaceMemberList,
    WorkspaceMembersCountParams,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    WorkspaceRouteParams,
    WorkspaceShareNoteParams,
    WorkspacesListRouteParams,
    WorkspaceUpgradeNoteParams,
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
const translations: TranslationDeepObject<typeof en> = {
    common: {
        count: 'Liczba',
        cancel: 'Anuluj',
        dismiss: 'Zamknij',
        proceed: 'Kontynuuj',
        unshare: 'Przestań udostępniać',
        yes: 'Tak',
        no: 'Nie',
        ok: 'OK',
        notNow: 'Nie teraz',
        noThanks: 'Nie, dziękuję',
        learnMore: 'Dowiedz się więcej',
        buttonConfirm: 'Rozumiem',
        name: 'Imię',
        attachment: 'Załącznik',
        attachments: 'Załączniki',
        center: 'Środek',
        from: 'Od',
        to: 'Do',
        in: 'Wprowadzone',
        optional: 'Opcjonalne',
        new: 'Nowe',
        newFeature: 'Nowa funkcja',
        search: 'Szukaj',
        reports: 'Raporty',
        find: 'Znajdź',
        searchWithThreeDots: 'Szukaj...',
        next: 'Dalej',
        previous: 'Wstecz',
        goBack: 'Wróć',
        create: 'Utwórz',
        add: 'Dodaj',
        resend: 'Wyślij ponownie',
        save: 'Zapisz',
        select: 'Wybierz',
        deselect: 'Odznacz',
        selectMultiple: 'Wielokrotny wybór',
        saveChanges: 'Zapisz zmiany',
        submit: 'Wyślij',
        submitted: 'Przesłano',
        rotate: 'Obróć',
        zoom: 'Powiększenie',
        password: 'Hasło',
        magicCode: 'Kod magiczny',
        digits: 'cyfry',
        twoFactorCode: 'Kod dwuskładnikowy',
        workspaces: 'Przestrzenie robocze',
        home: 'Strona główna',
        inbox: 'Skrzynka odbiorcza',
        success: 'Sukces',
        group: 'Grupa',
        profile: 'Profil',
        referral: 'Polecenie',
        payments: 'Płatności',
        approvals: 'Zatwierdzenia',
        wallet: 'Portfel',
        preferences: 'Preferencje',
        view: 'Wyświetl',
        review: (reviewParams?: ReviewParams) => `Przejrzyj${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Nie',
        signIn: 'Zaloguj się',
        signInWithGoogle: 'Zaloguj się przez Google',
        signInWithApple: 'Zaloguj się przez Apple',
        signInWith: 'Zaloguj się przez',
        continue: 'Kontynuuj',
        firstName: 'Imię',
        lastName: 'Nazwisko',
        scanning: 'Skanowanie',
        analyzing: 'Analizowanie...',
        addCardTermsOfService: 'Warunki korzystania z usługi Expensify',
        perPerson: 'na osobę',
        phone: 'Telefon',
        phoneNumber: 'Numer telefonu',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'E-mail',
        and: 'i',
        or: 'lub',
        details: 'Szczegóły',
        privacy: 'Prywatność',
        privacyPolicy: 'Polityka prywatności',
        hidden: 'Ukryte',
        visible: 'Widoczny',
        delete: 'Usuń',
        archived: 'zarchiwizowane',
        contacts: 'Kontakty',
        recents: 'Ostatnie',
        close: 'Zamknij',
        comment: 'Komentarz',
        download: 'Pobierz',
        downloading: 'Pobieranie',
        uploading: 'Przesyłanie',
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
        currentYear: 'Bieżący rok',
        currentMonth: 'Bieżący miesiąc',
        ssnLast4: 'Ostatnie 4 cyfry numeru SSN',
        ssnFull9: 'Pełne 9 cyfr numeru SSN',
        addressLine: (lineNumber: number) => `Wiersz adresu ${lineNumber}`,
        personalAddress: 'Adres domowy',
        companyAddress: 'Adres firmy',
        noPO: 'Prosimy, bez skrytek pocztowych ani adresów skrytek/punktów odbioru.',
        city: 'Miasto',
        state: 'Stan',
        streetAddress: 'Ulica i numer domu',
        stateOrProvince: 'Stan / prowincja',
        country: 'Kraj',
        zip: 'Kod pocztowy',
        zipPostCode: 'Kod pocztowy',
        whatThis: 'Co to jest?',
        iAcceptThe: 'Akceptuję',
        acceptTermsAndPrivacy: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi Expensify</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politykę prywatności</a>`,
        acceptTermsAndConditions: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">regulamin</a>`,
        acceptTermsOfService: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi Expensify</a>`,
        remove: 'Usuń',
        admin: 'Administrator',
        owner: 'Właściciel',
        dateFormat: 'RRRR-MM-DD',
        send: 'Wyślij',
        na: 'nie dotyczy',
        noResultsFound: 'Nie znaleziono wyników',
        noResultsFoundMatching: (searchString: string) => `Brak wyników pasujących do „${searchString}”`,
        recentDestinations: 'Ostatnie miejsca',
        timePrefix: 'Jest',
        conjunctionFor: 'dla',
        todayAt: 'Dzisiaj o',
        tomorrowAt: 'Jutro o',
        yesterdayAt: 'Wczoraj o',
        conjunctionAt: 'o',
        conjunctionTo: 'do',
        genericErrorMessage: 'Ups... coś poszło nie tak i nie udało się zrealizować Twojego żądania. Spróbuj ponownie później.',
        percentage: 'Procent',
        converted: 'Przekonwertowano',
        error: {
            invalidAmount: 'Nieprawidłowa kwota',
            acceptTerms: 'Aby kontynuować, musisz zaakceptować Warunki korzystania z usługi',
            phoneNumber: `Wprowadź pełny numer telefonu
(np. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'To pole jest wymagane',
            requestModified: 'Toje żądanie jest modyfikowane przez innego członka',
            characterLimitExceedCounter: (length: number, limit: number) => `Przekroczono limit znaków (${length}/${limit})`,
            dateInvalid: 'Wybierz prawidłową datę',
            invalidDateShouldBeFuture: 'Wybierz dzisiejszą lub przyszłą datę',
            invalidTimeShouldBeFuture: 'Wybierz godzinę co najmniej o minutę późniejszą',
            invalidCharacter: 'Nieprawidłowy znak',
            enterMerchant: 'Wpisz nazwę sprzedawcy',
            enterAmount: 'Wprowadź kwotę',
            missingMerchantName: 'Brak nazwy sprzedawcy',
            missingAmount: 'Brakująca kwota',
            missingDate: 'Brak daty',
            enterDate: 'Wprowadź datę',
            invalidTimeRange: 'Wpisz godzinę w formacie 12-godzinnym (np. 2:30 PM)',
            pleaseCompleteForm: 'Wypełnij formularz powyżej, aby kontynuować',
            pleaseSelectOne: 'Wybierz jedną z powyższych opcji',
            invalidRateError: 'Wprowadź poprawną stawkę',
            lowRateError: 'Stawka musi być większa niż 0',
            email: 'Wprowadź prawidłowy adres e-mail',
            login: 'Wystąpił błąd podczas logowania. Spróbuj ponownie.',
        },
        comma: 'przecinek',
        semicolon: 'średnik',
        please: 'Proszę',
        contactUs: 'skontaktuj się z nami',
        pleaseEnterEmailOrPhoneNumber: 'Wprowadź adres e-mail lub numer telefonu',
        fixTheErrors: 'napraw błędy',
        inTheFormBeforeContinuing: 'w formularzu przed kontynuowaniem',
        confirm: 'Potwierdź',
        reset: 'Resetuj',
        done: 'Gotowe',
        more: 'Więcej',
        debitCard: 'Karta debetowa',
        bankAccount: 'Konto bankowe',
        personalBankAccount: 'Prywatne konto bankowe',
        businessBankAccount: 'Firmowe konto bankowe',
        join: 'Dołącz',
        leave: 'Opuść',
        decline: 'Odrzuć',
        reject: 'Odrzuć',
        transferBalance: 'Przenieś saldo',
        enterManually: 'Wprowadź to ręcznie',
        message: 'Wiadomość',
        leaveThread: 'Opuść wątek',
        you: 'Ty',
        me: 'ja',
        youAfterPreposition: 'ty',
        your: 'twój',
        conciergeHelp: 'Skontaktuj się z Concierge, aby uzyskać pomoc.',
        youAppearToBeOffline: 'Wygląda na to, że jesteś offline.',
        thisFeatureRequiresInternet: 'Ta funkcja wymaga aktywnego połączenia z internetem.',
        attachmentWillBeAvailableOnceBackOnline: 'Załącznik będzie dostępny, gdy znów będziesz online.',
        errorOccurredWhileTryingToPlayVideo: 'Wystąpił błąd podczas próby odtworzenia tego wideo.',
        areYouSure: 'Czy na pewno?',
        verify: 'Potwierdź',
        yesContinue: 'Tak, kontynuuj',
        websiteExample: 'np. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `np. ${zipSampleFormat}` : ''),
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
        letsDoThis: `Do dzieła!`,
        letsStart: `Zacznijmy`,
        showMore: 'Pokaż więcej',
        showLess: 'Pokaż mniej',
        merchant: 'Sprzedawca',
        change: 'Zmień',
        category: 'Kategoria',
        report: 'Raport',
        billable: 'Fakturowalne',
        nonBillable: 'Nierozliczalne',
        tag: 'Tag',
        receipt: 'Paragon',
        verified: 'Zweryfikowano',
        replace: 'Zastąp',
        distance: 'Dystans',
        mile: 'mila',
        miles: 'mile',
        kilometer: 'kilometr',
        kilometers: 'kilometry',
        recent: 'Ostatnie',
        all: 'Wszystko',
        am: 'AM',
        pm: 'PM',
        tbd: 'Do ustalenia',
        selectCurrency: 'Wybierz walutę',
        selectSymbolOrCurrency: 'Wybierz symbol lub walutę',
        card: 'Karta',
        whyDoWeAskForThis: 'Dlaczego o to prosimy?',
        required: 'Wymagane',
        showing: 'Wyświetlanie',
        of: 'z',
        default: 'Domyślne',
        update: 'Zaktualizuj',
        member: 'Członek',
        auditor: 'Audytor',
        role: 'Rola',
        currency: 'Waluta',
        groupCurrency: 'Waluta grupy',
        rate: 'Oceń',
        emptyLHN: {
            title: 'Hurra! Wszystko nadrobione.',
            subtitleText1: 'Znajdź czat za pomocą',
            subtitleText2: 'przycisk powyżej lub utwórz coś za pomocą',
            subtitleText3: 'przycisk poniżej.',
        },
        businessName: 'Nazwa firmy',
        clear: 'Wyczyść',
        type: 'Typ',
        reportName: 'Nazwa raportu',
        action: 'Działanie',
        expenses: 'Wydatki',
        totalSpend: 'Łączne wydatki',
        tax: 'Podatek',
        shared: 'Udostępnione',
        drafts: 'Szkice',
        draft: 'Szkic',
        finished: 'Zakończono',
        upgrade: 'Ulepsz',
        downgradeWorkspace: 'Zdegraduj przestrzeń roboczą',
        companyID: 'ID firmy',
        userID: 'Identyfikator użytkownika',
        disable: 'Wyłącz',
        export: 'Eksportuj',
        initialValue: 'Wartość początkowa',
        currentDate: 'Bieżąca data',
        value: 'Wartość',
        downloadFailedTitle: 'Pobieranie nie powiodło się',
        downloadFailedDescription: 'Nie udało się zakończyć pobierania. Spróbuj ponownie później.',
        filterLogs: 'Filtruj dzienniki',
        network: 'Sieć',
        reportID: 'Identyfikator raportu',
        longReportID: 'Długi identyfikator raportu',
        withdrawalID: 'Identyfikator wypłaty',
        bankAccounts: 'Konta bankowe',
        chooseFile: 'Wybierz plik',
        chooseFiles: 'Wybierz pliki',
        dropTitle: 'Upuść tutaj',
        dropMessage: 'Upuść tutaj swój plik',
        ignore: 'Ignoruj',
        enabled: 'Włączone',
        disabled: 'Wyłączone',
        import: 'Importuj',
        offlinePrompt: 'Nie możesz teraz wykonać tej akcji.',
        outstanding: 'Pozostałe',
        chats: 'Czaty',
        tasks: 'Zadania',
        unread: 'Nieprzeczytane',
        sent: 'Wysłano',
        links: 'Linki',
        day: 'dzień',
        days: 'dni',
        rename: 'Zmień nazwę',
        address: 'Adres',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        secondAbbreviation: 's',
        skip: 'Pomiń',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Potrzebujesz czegoś konkretnego? Porozmawiaj ze swoim opiekunem konta, ${accountManagerDisplayName}.`,
        chatNow: 'Czat teraz',
        workEmail: 'Służbowy e-mail',
        destination: 'Cel',
        subrate: 'Stawka dodatkowa',
        perDiem: 'Dieta',
        validate: 'Zweryfikuj',
        downloadAsPDF: 'Pobierz jako PDF',
        downloadAsCSV: 'Pobierz jako CSV',
        help: 'Pomoc',
        expenseReport: 'Raport wydatków',
        expenseReports: 'Raporty wydatków',
        rateOutOfPolicy: 'Stawka poza zasadami',
        leaveWorkspace: 'Opuść przestrzeń roboczą',
        leaveWorkspaceConfirmation: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mieć możliwości rozliczania do niej wydatków.',
        leaveWorkspaceConfirmationAuditor: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mieć dostępu do jej raportów ani ustawień.',
        leaveWorkspaceConfirmationAdmin: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mógł/mogła zarządzać jej ustawieniami.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, w ścieżce zatwierdzania zastąpi Cię ${workspaceOwner}, właściciel przestrzeni roboczej.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, zostaniesz zastąpiony jako preferowany eksporter przez ${workspaceOwner}, właściciela przestrzeni roboczej.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, zostaniesz zastąpiony jako kontakt techniczny przez ${workspaceOwner}, właściciela przestrzeni roboczej.`,
        leaveWorkspaceReimburser:
            "Nie możesz opuścić tego workspace'u jako osoba dokonująca zwrotów. Ustaw nową osobę dokonującą zwrotów w Workspace'y > Dokonuj lub śledź płatności, a następnie spróbuj ponownie.",
        reimbursable: 'Podlegające zwrotowi',
        editYourProfile: 'Edytuj swój profil',
        comments: 'Komentarze',
        sharedIn: 'Udostępnione w',
        unreported: 'Nierozliczone',
        explore: 'Eksploruj',
        insights: 'Insights',
        todo: 'Do zrobienia',
        invoice: 'Faktura',
        expense: 'Wydatek',
        chat: 'Czat',
        task: 'Zadanie',
        trip: 'Podróż',
        apply: 'Zastosuj',
        status: 'Status',
        on: 'Włączony',
        before: 'Przed',
        after: 'PoPo',
        reschedule: 'Przełóż',
        general: 'Ogólne',
        workspacesTabTitle: 'Przestrzenie robocze',
        headsUp: 'Uwaga!',
        submitTo: 'Prześlij do',
        forwardTo: 'Prześlij dalej do',
        merge: 'Scalaj',
        none: 'Brak',
        unstableInternetConnection: 'Niestabilne połączenie internetowe. Sprawdź swoją sieć i spróbuj ponownie.',
        enableGlobalReimbursements: 'Włącz globalne zwroty kosztów',
        purchaseAmount: 'Kwota zakupu',
        originalAmount: 'Kwota pierwotna',
        frequency: 'Częstotliwość',
        link: 'Link',
        pinned: 'Przypięte',
        read: 'Przeczytaj',
        copyToClipboard: 'Skopiuj do schowka',
        thisIsTakingLongerThanExpected: 'To trwa dłużej niż oczekiwano...',
        domains: 'Domeny',
        actionRequired: 'Wymagane działanie',
        duplicate: 'Duplikuj',
        duplicated: 'Zduplikowano',
        duplicateExpense: 'Duplikuj wydatek',
        exchangeRate: 'Kurs wymiany',
        reimbursableTotal: 'Łączna kwota do zwrotu',
        nonReimbursableTotal: 'Suma bez zwrotu',
        month: 'Miesiąc',
        week: 'Tydzień',
        year: 'Rok',
        quarter: 'Kwartał',
    },
    supportalNoAccess: {
        title: 'Nie tak szybko',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Nie masz uprawnień do wykonania tej akcji, gdy wsparcie jest zalogowane (polecenie: ${command ?? ''}). Jeśli uważasz, że Success powinien móc wykonać tę akcję, rozpocznij rozmowę na Slacku.`,
    },
    lockedAccount: {
        title: 'Zablokowane konto',
        description: 'Nie możesz wykonać tej akcji, ponieważ to konto zostało zablokowane. Skontaktuj się z concierge@expensify.com, aby poznać dalsze kroki.',
    },
    location: {
        useCurrent: 'Użyj bieżącej lokalizacji',
        notFound: 'Nie udało się ustalić Twojej lokalizacji. Spróbuj ponownie lub wprowadź adres ręcznie.',
        permissionDenied: 'Wygląda na to, że odmówiłeś(-aś) dostępu do swojej lokalizacji.',
        please: 'Proszę',
        allowPermission: 'zezwól na dostęp do lokalizacji w ustawieniach',
        tryAgain: 'i spróbuj ponownie.',
    },
    contact: {
        importContacts: 'Importuj kontakty',
        importContactsTitle: 'Zaimportuj swoje kontakty',
        importContactsText: 'Zaimportuj kontakty z telefonu, aby Twoje ulubione osoby były zawsze na wyciągnięcie ręki.',
        importContactsExplanation: 'dzięki czemu Twoi ulubieni ludzie są zawsze o jedno stuknięcie dalej.',
        importContactsNativeText: 'Jeszcze tylko jeden krok! Daj nam zielone światło na zaimportowanie Twoich kontaktów.',
    },
    anonymousReportFooter: {
        logoTagline: 'Dołącz do dyskusji.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Dostęp do aparatu',
        expensifyDoesNotHaveAccessToCamera: 'Expensify nie może robić zdjęć bez dostępu do aparatu. Stuknij „Ustawienia”, aby zaktualizować uprawnienia.',
        attachmentError: 'Błąd załącznika',
        errorWhileSelectingAttachment: 'Wystąpił błąd podczas wybierania załącznika. Spróbuj ponownie.',
        errorWhileSelectingCorruptedAttachment: 'Wystąpił błąd podczas wybierania uszkodzonego załącznika. Spróbuj wybrać inny plik.',
        takePhoto: 'Zrób zdjęcie',
        chooseFromGallery: 'Wybierz z galerii',
        chooseDocument: 'Wybierz plik',
        attachmentTooLarge: 'Załącznik jest zbyt duży',
        sizeExceeded: 'Rozmiar załącznika przekracza limit 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Rozmiar załącznika jest większy niż limit ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Załącznik jest zbyt mały',
        sizeNotMet: 'Rozmiar załącznika musi być większy niż 240 bajtów',
        wrongFileType: 'Nieprawidłowy typ pliku',
        notAllowedExtension: 'Ten typ pliku nie jest dozwolony. Spróbuj użyć innego typu pliku.',
        folderNotAllowedMessage: 'Przesyłanie folderu jest niedozwolone. Spróbuj użyć innego pliku.',
        protectedPDFNotSupported: 'Pliki PDF chronione hasłem nie są obsługiwane',
        attachmentImageResized: 'Ten obraz został zmieniony na potrzeby podglądu. Pobierz go, aby zobaczyć w pełnej rozdzielczości.',
        attachmentImageTooLarge: 'Ten obraz jest zbyt duży, aby wyświetlić podgląd przed przesłaniem.',
        tooManyFiles: (fileLimit: number) => `Możesz jednocześnie przesłać maksymalnie ${fileLimit} plików.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Plik przekracza ${maxUploadSizeInMB} MB. Spróbuj ponownie.`,
        someFilesCantBeUploaded: 'Niektórych plików nie można przesłać',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Pliki muszą mieć mniej niż ${maxUploadSizeInMB} MB. Większe pliki nie zostaną przesłane.`,
        maxFileLimitExceeded: 'Możesz jednocześnie przesłać maksymalnie 30 paragonów. Dodatkowe paragony nie zostaną przesłane.',
        unsupportedFileType: (fileType: string) => `Pliki typu ${fileType} nie są obsługiwane. Przesłane zostaną tylko obsługiwane typy plików.`,
        learnMoreAboutSupportedFiles: 'Dowiedz się więcej o obsługiwanych formatach.',
        passwordProtected: 'Pliki PDF zabezpieczone hasłem nie są obsługiwane. Przesłane zostaną tylko obsługiwane pliki.',
    },
    dropzone: {
        addAttachments: 'Dodaj załączniki',
        addReceipt: 'Dodaj paragon',
        scanReceipts: 'Skanuj paragony',
        replaceReceipt: 'Zastąp paragon',
    },
    filePicker: {
        fileError: 'Błąd pliku',
        errorWhileSelectingFile: 'Wystąpił błąd podczas wybierania pliku. Spróbuj ponownie.',
    },
    connectionComplete: {
        title: 'Połączono',
        supportingText: 'Możesz zamknąć to okno i wrócić do aplikacji Expensify.',
    },
    avatarCropModal: {
        title: 'Edytuj zdjęcie',
        description: 'Przeciągaj, powiększaj i obracaj swój obraz tak, jak chcesz.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nie znaleziono rozszerzenia dla typu MIME',
        problemGettingImageYouPasted: 'Wystąpił problem z pobraniem wklejonego obrazu',
        commentExceededMaxLength: (formattedMaxLength: string) => `Maksymalna długość komentarza to ${formattedMaxLength} znaków.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `Maksymalna długość tytułu zadania to ${formattedMaxLength} znaków.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Zaktualizuj aplikację',
        updatePrompt: 'Nowa wersja tej aplikacji jest dostępna.\nZaktualizuj ją teraz lub uruchom ponownie później, aby pobrać najnowsze zmiany.',
    },
    deeplinkWrapper: {
        launching: 'Uruchamianie Expensify',
        expired: 'Twoja sesja wygasła.',
        signIn: 'Zaloguj się ponownie.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Test biometrii',
            authenticationSuccessful: 'Uwierzytelnianie zakończone powodzeniem',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `Pomyślnie uwierzytelniłeś(-aś) się za pomocą ${authType}.`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Dane biometryczne (${registered ? 'Zarejestrowano' : 'Niezarejestrowany'})`,
            yourAttemptWasUnsuccessful: 'Twoja próba uwierzytelnienia nie powiodła się.',
            youCouldNotBeAuthenticated: 'Nie udało się uwierzytelnić użytkownika',
            areYouSureToReject: 'Na pewno? Próba uwierzytelnienia zostanie odrzucona, jeśli zamkniesz ten ekran.',
            rejectAuthentication: 'Odrzuć uwierzytelnianie',
            test: 'Test',
            biometricsAuthentication: 'Uwierzytelnianie biometryczne',
        },
        pleaseEnableInSystemSettings: {
            start: 'Włącz weryfikację twarzą/odciskiem palca lub ustaw kod dostępu do urządzenia w swoim',
            link: 'ustawienia systemowe',
            end: '.',
        },
        oops: 'Ups, coś poszło nie tak',
        looksLikeYouRanOutOfTime: 'Wygląda na to, że skończył ci się czas! Spróbuj ponownie u sprzedawcy.',
        youRanOutOfTime: 'Skończył Ci się czas',
        letsVerifyItsYou: 'Zweryfikujmy, czy to na pewno Ty',
        verifyYourself: {
            biometrics: 'Zweryfikuj się za pomocą twarzy lub odcisku palca',
        },
        enableQuickVerification: {
            biometrics: 'Włącz szybkie, bezpieczne uwierzytelnianie twarzą lub odciskiem palca. Nie są wymagane hasła ani kody.',
        },
        revoke: {
            remove: 'Usuń',
            title: 'Twarz/odcisk palca i klucze dostępu',
            explanation:
                'Weryfikacja twarzą/odciskiem palca lub kluczem dostępu jest włączona na jednym lub kilku urządzeniach. Odwołanie dostępu spowoduje, że przy następnej weryfikacji na dowolnym urządzeniu wymagany będzie magiczny kod.',
            confirmationPrompt: 'Czy na pewno? Będziesz potrzebować magicznego kodu przy następnym potwierdzeniu na dowolnym urządzeniu.',
            cta: 'Odwołaj dostęp',
            noDevices:
                'Nie masz zarejestrowanych żadnych urządzeń do weryfikacji twarzą/odciskiem palca ani kluczem dostępu. Jeśli jakieś zarejestrujesz, będziesz mógł/mogła cofnąć ten dostęp tutaj.',
            dismiss: 'Rozumiem',
            error: 'Żądanie nie powiodło się. Spróbuj ponownie później.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abrakadabra,
            jesteś zalogowany!
        `),
        successfulSignInDescription: 'Wróć do swojej pierwotnej karty, aby kontynuować.',
        title: 'Oto Twój magiczny kod',
        description: dedent(`
            Wprowadź kod z urządzenia, na którym został pierwotnie zażądany
        `),
        doNotShare: dedent(`
            Nie udostępniaj nikomu swojego kodu.
            Expensify nigdy nie poprosi Cię o jego podanie!
        `),
        or: 'lub',
        signInHere: 'po prostu zaloguj się tutaj',
        expiredCodeTitle: 'Kod magiczny wygasł',
        expiredCodeDescription: 'Wróć do oryginalnego urządzenia i poproś o nowy kod',
        successfulNewCodeRequest: 'Kod został wysłany. Sprawdź swoje urządzenie.',
        tfaRequiredTitle: dedent(`
            Wymagane uwierzytelnianie dwuskładnikowe
        `),
        tfaRequiredDescription: dedent(`
            Wprowadź kod uwierzytelniania dwuskładnikowego
            w miejscu, w którym próbujesz się zalogować.
        `),
        requestOneHere: 'złóż wniosek tutaj.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Zapłacono przez',
        whatsItFor: 'Do czego to służy?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Imię, e-mail lub numer telefonu',
        findMember: 'Znajdź członka',
        searchForSomeone: 'Wyszukaj osobę',
    },
    customApprovalWorkflow: {
        title: 'Niestandardowy proces zatwierdzania',
        description: 'Twoja firma ma niestandardowy proces zatwierdzania w tym obszarze roboczym. Wykonaj tę akcję w Expensify Classic',
        goToExpensifyClassic: 'Przełącz na Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Zgłoś wydatek, poleć swój zespół',
            subtitleText: 'Chcesz, aby Twój zespół też korzystał z Expensify? Po prostu prześlij im wydatek, a my zajmiemy się resztą.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Umów rozmowę',
    },
    hello: 'Cześć',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Zacznij poniżej.',
        anotherLoginPageIsOpen: 'Inna strona logowania jest otwarta.',
        anotherLoginPageIsOpenExplanation: 'Otworzyłeś stronę logowania w osobnej karcie. Zaloguj się proszę w tamtej karcie.',
        welcome: 'Witamy!',
        welcomeWithoutExclamation: 'Witamy',
        phrase2: 'Pieniądze mówią. A teraz, gdy czat i płatności są w jednym miejscu, jest to także proste.',
        phrase3: 'Twoje płatności docierają do Ciebie tak szybko, jak szybko potrafisz przekazać swoją myśl.',
        enterPassword: 'Wprowadź swoje hasło',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, zawsze miło widzieć tu nową twarz!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Wprowadź magiczny kod wysłany na ${login}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
    },
    login: {
        hero: {
            header: 'Podróże służbowe i wydatki w tempie rozmowy',
            body: 'Witamy w nowej generacji Expensify, gdzie Twoje podróże i wydatki przebiegają szybciej dzięki kontekstowemu czatowi w czasie rzeczywistym.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Kontynuuj logowanie za pomocą logowania jednokrotnego (SSO):',
        orContinueWithMagicCode: 'Możesz też zalogować się za pomocą magicznego kodu',
        useSingleSignOn: 'Użyj logowania jednokrotnego',
        useMagicCode: 'Użyj magicznego kodu',
        launching: 'Uruchamianie...',
        oneMoment: 'Chwileczkę, przekierowujemy Cię do firmowego portalu logowania jednokrotnego (SSO).',
    },
    reportActionCompose: {
        dropToUpload: 'Upuść, aby przesłać',
        sendAttachment: 'Wyślij załącznik',
        addAttachment: 'Dodaj załącznik',
        writeSomething: 'Napisz coś...',
        blockedFromConcierge: 'Komunikacja jest zablokowana',
        fileUploadFailed: 'Przesyłanie nie powiodło się. Plik nie jest obsługiwany.',
        localTime: ({user, time}: LocalTimeParams) => `Jest ${time} dla ${user}`,
        edited: '(edytowano)',
        emoji: 'Emoji',
        collapse: 'Zwiń',
        expand: 'Rozwiń',
    },
    reportActionContextMenu: {
        copyMessage: 'Kopiuj wiadomość',
        copied: 'Skopiowano!',
        copyLink: 'Kopiuj link',
        copyURLToClipboard: 'Skopiuj adres URL do schowka',
        copyEmailToClipboard: 'Skopiuj e-mail do schowka',
        markAsUnread: 'Oznacz jako nieprzeczytane',
        markAsRead: 'Oznacz jako przeczytane',
        editAction: ({action}: EditActionParams) => `Edytuj ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'komentarz'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'komentarz';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Usuń ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'komentarz';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Czy na pewno chcesz usunąć ten/ to ${type}?`;
        },
        onlyVisible: 'Widoczne tylko dla',
        explain: 'Wyjaśnij',
        explainMessage: 'Proszę, wyjaśnij mi to.',
        replyInThread: 'Odpowiedz w wątku',
        joinThread: 'Dołącz do wątku',
        leaveThread: 'Opuść wątek',
        copyOnyxData: 'Skopiuj dane Onyx',
        flagAsOffensive: 'Oznacz jako obraźliwe',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Dodaj reakcję',
        reactedWith: 'zareagował(a) reakcją',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Przegapiłeś(-aś) imprezę w <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, nie ma tu już nic do zobaczenia.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Ten czat obejmuje wszystkich członków Expensify w domenie <strong>${domainRoom}</strong>. Używaj go do rozmów ze współpracownikami, dzielenia się wskazówkami i zadawania pytań.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Ten czat jest z administratorem <strong>${workspaceName}</strong>. Użyj go, aby porozmawiać o konfiguracji przestrzeni roboczej i nie tylko.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Ten czat obejmuje wszystkich w <strong>${workspaceName}</strong>. Używaj go do najważniejszych ogłoszeń.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Ten czat jest przeznaczony na wszystko, co dotyczy <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Ten czat służy do faktur między <strong>${invoicePayer}</strong> a <strong>${invoiceReceiver}</strong>. Użyj przycisku +, aby wysłać fakturę.`,
        beginningOfChatHistory: (users: string) => `Ten czat jest z ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Tutaj <strong>${submitterDisplayName}</strong> będzie przesyłać wydatki do <strong>${workspaceName}</strong>. Po prostu użyj przycisku +.`,
        beginningOfChatHistorySelfDM: 'To jest Twoja osobista przestrzeń. Używaj jej na notatki, zadania, szkice i przypomnienia.',
        beginningOfChatHistorySystemDM: 'Witaj! Zacznijmy konfigurację.',
        chatWithAccountManager: 'Porozmawiaj tutaj ze swoim opiekunem konta',
        askMeAnything: 'Zapytaj mnie o cokolwiek!',
        sayHello: 'Przywitaj się!',
        yourSpace: 'Twoja przestrzeń',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Witaj w ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Użyj przycisku +, aby ${additionalText} wydatek.`,
        askConcierge: 'Zadawaj pytania i korzystaj z całodobowego wsparcia w czasie rzeczywistym.',
        conciergeSupport: 'Całodobowe wsparcie',
        create: 'utwórz',
        iouTypes: {
            pay: 'zapłać',
            split: 'podziel',
            submit: 'prześlij',
            track: 'śledź',
            invoice: 'faktura',
        },
    },
    adminOnlyCanPost: 'Tylko administratorzy mogą wysyłać wiadomości w tym pokoju.',
    reportAction: {
        asCopilot: 'jako drugi pilot dla',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `utworzył ten raport, aby przechować wszystkie wydatki z <a href="${reportUrl}">${reportName}</a>, których nie można było złożyć z wybraną przez Ciebie częstotliwością`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `utworzył(-a) ten raport dla wszystkich wstrzymanych wydatków z <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Powiadom wszystkich w tej konwersacji',
    },
    newMessages: 'Nowe wiadomości',
    latestMessages: 'Najnowsze wiadomości',
    youHaveBeenBanned: 'Uwaga: Zostałeś zablokowany przed czatowaniem na tym kanale.',
    reportTypingIndicator: {
        isTyping: 'pisze...',
        areTyping: 'piszą...',
        multipleMembers: 'Wielu członków',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Ten czat został zarchiwizowany.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Ten czat nie jest już aktywny, ponieważ ${displayName} zamknął(a) swoje konto.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${oldDisplayName} połączył swoje konto z ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Ten czat nie jest już aktywny, ponieważ <strong>nie jesteś</strong> już członkiem(-inią) przestrzeni roboczej ${policyName}.`
                : `Ten czat nie jest już aktywny, ponieważ ${displayName} nie jest już członkiem przestrzeni roboczej ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${policyName} nie jest już aktywną przestrzenią roboczą.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${policyName} nie jest już aktywną przestrzenią roboczą.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Ta rezerwacja jest zarchiwizowana.',
    },
    writeCapabilityPage: {
        label: 'Kto może publikować',
        writeCapability: {
            all: 'Wszyscy członkowie',
            admins: 'Tylko administratorzy',
        },
    },
    sidebarScreen: {
        buttonFind: 'Znajdź coś...',
        buttonMySettings: 'Moje ustawienia',
        fabNewChat: 'Rozpocznij czat',
        fabNewChatExplained: 'Otwórz menu działań',
        fabScanReceiptExplained: 'Zeskanuj paragon',
        chatPinned: 'Czat przypięty',
        draftedMessage: 'Wiadomość w wersji roboczej',
        listOfChatMessages: 'Lista wiadomości na czacie',
        listOfChats: 'Lista czatów',
        saveTheWorld: 'Ocal świat',
        tooltip: 'Zacznij tutaj!',
        redirectToExpensifyClassicModal: {
            title: 'Wkrótce dostępne',
            description: 'Dopracowujemy jeszcze kilka elementów New Expensify, aby dostosować ją do Twojej konfiguracji. W międzyczasie przejdź do Expensify Classic.',
        },
    },
    homePage: {
        forYou: 'Dla Ciebie',
        timeSensitiveSection: {
            title: 'Czas wrażliwy',
            cta: 'Roszczenie',
            offer50off: {
                title: 'Zyskaj 50% zniżki na pierwszy rok!',
                subtitle: ({formattedTime}: {formattedTime: string}) => `Pozostało ${formattedTime}`,
            },
            offer25off: {
                title: 'Otrzymaj 25% zniżki na pierwszy rok!',
                subtitle: ({days}: {days: number}) => `Pozostało ${days} ${days === 1 ? 'dzień' : 'dni'}`,
            },
            addShippingAddress: {
                title: 'Potrzebujemy Twojego adresu wysyłki',
                subtitle: 'Podaj adres do otrzymania swojej karty Expensify.',
                cta: 'Dodaj adres',
            },
            activateCard: {
                title: 'Aktywuj swoją kartę Expensify',
                subtitle: 'Zweryfikuj swoją kartę i zacznij wydawać.',
                cta: 'Aktywuj',
            },
        },
        announcements: 'Ogłoszenia',
        discoverSection: {
            title: 'Odkryj',
            menuItemTitleNonAdmin: 'Dowiedz się, jak tworzyć wydatki i wysyłać raporty.',
            menuItemTitleAdmin: 'Dowiedz się, jak zapraszać członków, edytować schematy zatwierdzania i uzgadniać karty firmowe.',
            menuItemDescription: 'Zobacz, co Expensify potrafi w 2 minuty',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `Prześlij ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            approve: ({count}: {count: number}) => `Zatwierdź ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            pay: ({count}: {count: number}) => `Zapłać ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            export: ({count}: {count: number}) => `Eksportuj ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            begin: 'Rozpocznij',
            emptyStateMessages: {
                nicelyDone: 'Świetna robota',
                keepAnEyeOut: 'Wypatruj tego, co nadejdzie!',
                allCaughtUp: 'Wszystko nadrobione',
                upcomingTodos: 'Nadchodzące zadania do wykonania pojawią się tutaj.',
            },
        },
    },
    allSettingsScreen: {
        subscription: 'Subskrypcja',
        domains: 'Domeny',
    },
    tabSelector: {
        chat: 'Czat',
        room: 'Pokój',
        distance: 'Dystans',
        manual: 'Podręcznik',
        scan: 'Skanuj',
        map: 'Mapa',
        gps: 'GPS',
        odometer: 'Licznik przebiegu',
    },
    spreadsheet: {
        upload: 'Prześlij arkusz kalkulacyjny',
        import: 'Zaimportuj arkusz kalkulacyjny',
        dragAndDrop: '<muted-link>Przeciągnij i upuść tutaj swój arkusz kalkulacyjny lub wybierz plik poniżej. Obsługiwane formaty: .csv, .txt, .xls i .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Przeciągnij i upuść tutaj swój arkusz kalkulacyjny lub wybierz plik poniżej. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Dowiedz się więcej</a> o obsługiwanych formatach plików.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Wybierz plik arkusza kalkulacyjnego do zaimportowania. Obsługiwane formaty: .csv, .txt, .xls i .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Wybierz plik arkusza kalkulacyjnego do zaimportowania. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Dowiedz się więcej</a> o obsługiwanych formatach plików.</muted-link>`,
        fileContainsHeader: 'Plik zawiera nagłówki kolumn',
        column: (name: string) => `Kolumna ${name}`,
        fieldNotMapped: (fieldName: string) => `Ups! Wymagane pole („${fieldName}”) nie zostało zmapowane. Sprawdź i spróbuj ponownie.`,
        singleFieldMultipleColumns: (fieldName: string) => `Ups! Przypisałeś jedno pole („${fieldName}”) do wielu kolumn. Sprawdź ustawienia i spróbuj ponownie.`,
        emptyMappedField: (fieldName: string) => `Ups! Pole („${fieldName}”) zawiera jedną lub więcej pustych wartości. Sprawdź je i spróbuj ponownie.`,
        importSuccessfulTitle: 'Import zakończony powodzeniem',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `Dodano ${categories} kategorie.` : 'Dodano 1 kategorię.'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'Nie dodano ani nie zaktualizowano żadnych członków.';
            }
            if (added && updated) {
                return `Dodano ${added} członka${added > 1 ? 's' : ''}, zaktualizowano ${updated} członka${updated > 1 ? 's' : ''}.`;
            }
            if (updated) {
                return updated > 1 ? `Zaktualizowano ${updated} członków.` : 'Zaktualizowano 1 członka.';
            }
            return added > 1 ? `Dodano ${added} członków.` : 'Dodano 1 członka.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `Dodano ${tags} tagów.` : 'Dodano 1 znacznik.'),
        importMultiLevelTagsSuccessfulDescription: 'Dodano wielopoziomowe znaczniki.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `Dodano stawki diety: ${rates}.` : 'Dodano 1 stawkę diety.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) => (transactions > 1 ? `Zaimportowano ${transactions} transakcje.` : 'Zaimportowano 1 transakcję.'),
        importFailedTitle: 'Import nie powiódł się',
        importFailedDescription: 'Upewnij się, że wszystkie pola zostały wypełnione poprawnie i spróbuj ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z Concierge.',
        importDescription: 'Wybierz, które pola zmapować z arkusza kalkulacyjnego, klikając menu rozwijane obok każdej zaimportowanej kolumny poniżej.',
        sizeNotMet: 'Rozmiar pliku musi być większy niż 0 bajtów',
        invalidFileMessage: 'Przesłany plik jest pusty lub zawiera nieprawidłowe dane. Upewnij się, że plik ma prawidłowy format i zawiera wymagane informacje, zanim prześlesz go ponownie.',
        importSpreadsheetLibraryError: 'Nie udało się wczytać modułu arkusza kalkulacyjnego. Sprawdź swoje połączenie internetowe i spróbuj ponownie.',
        importSpreadsheet: 'Zaimportuj arkusz kalkulacyjny',
        downloadCSV: 'Pobierz plik CSV',
        importMemberConfirmation: () => ({
            one: `Potwierdź poniższe dane nowego członka przestrzeni roboczej, który zostanie dodany w ramach tego przesyłania. Istniejący członkowie nie otrzymają żadnych aktualizacji ról ani wiadomości z zaproszeniem.`,
            other: (count: number) =>
                `Potwierdź poniższe szczegóły dla ${count} nowych członków przestrzeni roboczej, którzy zostaną dodani w ramach tego przesłania. Istniejący członkowie nie otrzymają żadnych aktualizacji ról ani zaproszeń.`,
        }),
    },
    receipt: {
        upload: 'Prześlij paragon',
        uploadMultiple: 'Prześlij paragony',
        desktopSubtitleSingle: `lub przeciągnij i upuść go tutaj`,
        desktopSubtitleMultiple: `lub przeciągnij i upuść je tutaj`,
        alternativeMethodsTitle: 'Inne sposoby dodawania paragonów:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Pobierz aplikację</a>, aby skanować z telefonu</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Przekaż paragony na adres <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Dodaj swój numer</a>, aby wysyłać paragony SMS-em na ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Wyślij paragony SMS-em na ${phoneNumber} (tylko numery z USA)</label-text>`,
        takePhoto: 'Zrób zdjęcie',
        cameraAccess: 'Dostęp do aparatu jest wymagany, aby zrobić zdjęcia paragonów.',
        deniedCameraAccess: `Dostęp do aparatu nadal nie został przyznany, postępuj zgodnie z <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">tymi instrukcjami</a>.`,
        cameraErrorTitle: 'Błąd aparatu',
        cameraErrorMessage: 'Wystąpił błąd podczas robienia zdjęcia. Spróbuj ponownie.',
        locationAccessTitle: 'Zezwól na dostęp do lokalizacji',
        locationAccessMessage: 'Dostęp do lokalizacji pomaga nam zachować poprawną strefę czasową i walutę, gdziekolwiek jesteś.',
        locationErrorTitle: 'Zezwól na dostęp do lokalizacji',
        locationErrorMessage: 'Dostęp do lokalizacji pomaga nam zachować poprawną strefę czasową i walutę, gdziekolwiek jesteś.',
        allowLocationFromSetting: `Dostęp do lokalizacji pomaga nam utrzymywać prawidłową strefę czasową i walutę, gdziekolwiek jesteś. Zezwól proszę na dostęp do lokalizacji w uprawnieniach swojego urządzenia.`,
        dropTitle: 'Odpuść to',
        dropMessage: 'Upuść tutaj plik',
        flash: 'błysk',
        multiScan: 'wieloskanowanie',
        shutter: 'migawka',
        gallery: 'galeria',
        deleteReceipt: 'Usuń paragon',
        deleteConfirmation: 'Czy na pewno chcesz usunąć ten paragon?',
        addReceipt: 'Dodaj paragon',
        scanFailed: 'Nie można zeskanować paragonu, ponieważ brakuje sprzedawcy, daty lub kwoty.',
        addAReceipt: {
            phrase1: 'Dodaj paragon',
            phrase2: 'lub przeciągnij i upuść tutaj',
        },
    },
    quickAction: {
        scanReceipt: 'Zeskanuj paragon',
        recordDistance: 'Śledź dystans',
        requestMoney: 'Utwórz wydatek',
        perDiem: 'Utwórz dietę',
        splitBill: 'Podziel wydatek',
        splitScan: 'Podziel paragon',
        splitDistance: 'Podziel odległość',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zapłać ${name ?? 'ktoś'}`,
        assignTask: 'Przypisz zadanie',
        header: 'Szybka akcja',
        noLongerHaveReportAccess: 'Nie masz już dostępu do swojego poprzedniego miejsca szybkiego działania. Wybierz nowe poniżej.',
        updateDestination: 'Zaktualizuj miejsce docelowe',
        createReport: 'Utwórz raport',
    },
    iou: {
        amount: 'Kwota',
        percent: 'Procent',
        date: 'Data',
        taxAmount: 'Kwota podatku',
        taxRate: 'Stawka podatku',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Zatwierdź ${formattedAmount}` : 'Zatwierdź'),
        approved: 'Zatwierdzone',
        cash: 'Gotówka',
        card: 'Karta',
        original: 'Oryginał',
        split: 'Podziel',
        splitExpense: 'Podziel wydatek',
        splitDates: 'Podziel daty',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} – ${endDate} (${count} dni)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} od ${merchant}`,
        splitByPercentage: 'Podziel według procentu',
        splitByDate: 'Podziel według daty',
        addSplit: 'Dodaj podział',
        makeSplitsEven: 'Podziel równo',
        editSplits: 'Edytuj podziały',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Kwota całkowita jest o ${amount} wyższa niż pierwotny wydatek.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Kwota całkowita jest o ${amount} mniejsza niż pierwotny wydatek.`,
        splitExpenseZeroAmount: 'Wprowadź prawidłową kwotę przed kontynuowaniem.',
        splitExpenseOneMoreSplit: 'Nie dodano podziałów. Dodaj co najmniej jeden, aby zapisać.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Edytuj ${amount} dla ${merchant}`,
        removeSplit: 'Usuń podział',
        splitExpenseCannotBeEditedModalTitle: 'Tego wydatku nie można edytować',
        splitExpenseCannotBeEditedModalDescription: 'Zatwierdzonych ani opłaconych wydatków nie można edytować',
        splitExpenseDistanceErrorModalDescription: 'Usuń błąd stawki za odległość i spróbuj ponownie.',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zapłać ${name ?? 'ktoś'}`,
        expense: 'Wydatek',
        categorize: 'Sklasyfikuj',
        share: 'Udostępnij',
        participants: 'Uczestnicy',
        createExpense: 'Utwórz wydatek',
        trackDistance: 'Śledź dystans',
        createExpenses: (expensesNumber: number) => `Utwórz ${expensesNumber} wydatki`,
        removeExpense: 'Usuń wydatek',
        removeThisExpense: 'Usuń ten wydatek',
        removeExpenseConfirmation: 'Na pewno chcesz usunąć ten paragon? Tego działania nie można cofnąć.',
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
        findExpense: 'Znajdź wydatek',
        deletedTransaction: (amount: string, merchant: string) => `usunął(-ę) wydatek (${amount} dla ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `przeniesiono wydatek${reportName ? `z ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `przeniesiono ten wydatek${reportName ? `do <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `przeniósł ten wydatek${reportName ? `z <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `przeniósł ten wydatek do Twojej <a href="${reportUrl}">przestrzeni osobistej</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `przeniósł(-ę) ten raport do przestrzeni roboczej <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `przeniósł ten <a href="${movedReportUrl}">raport</a> do przestrzeni roboczej <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Oczekuje na dopasowanie paragonu do transakcji kartą',
        pendingMatch: 'Oczekujące dopasowanie',
        pendingMatchWithCreditCardDescription: 'Paragon oczekuje na dopasowanie z transakcją kartą. Oznacz jako gotówka, aby anulować.',
        markAsCash: 'Oznacz jako gotówkę',
        routePending: 'Trasa w toku…',
        receiptScanning: () => ({
            one: 'Skanowanie paragonu...',
            other: 'Skanowanie paragonów...',
        }),
        scanMultipleReceipts: 'Zeskanuj wiele paragonów',
        scanMultipleReceiptsDescription: 'Zrób zdjęcia wszystkich paragonów naraz, a następnie samodzielnie potwierdź szczegóły lub zrobimy to za Ciebie.',
        receiptScanInProgress: 'Trwa skanowanie paragonu',
        receiptScanInProgressDescription: 'Trwa skanowanie paragonu. Sprawdź później lub wprowadź dane teraz.',
        removeFromReport: 'Usuń z raportu',
        moveToPersonalSpace: 'Przenieś wydatki do swojej przestrzeni osobistej',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Wykryto potencjalnie zduplikowane wydatki. Przejrzyj duplikaty, aby umożliwić wysłanie.'
                : 'Wykryto potencjalnie zduplikowane wydatki. Przejrzyj duplikaty, aby umożliwić zatwierdzenie.',
        receiptIssuesFound: () => ({
            one: 'Znaleziono problem',
            other: 'Znalezione problemy',
        }),
        fieldPending: 'Oczekuje...',
        defaultRate: 'Domyślna stawka',
        receiptMissingDetails: 'Brakujące dane na paragonie',
        missingAmount: 'Brakująca kwota',
        missingMerchant: 'Brak sprzedawcy',
        receiptStatusTitle: 'Skanowanie…',
        receiptStatusText: 'Tylko ty widzisz ten paragon podczas skanowania. Wróć tu później lub wprowadź dane teraz.',
        receiptScanningFailed: 'Skanowanie paragonu nie powiodło się. Wprowadź szczegóły ręcznie.',
        transactionPendingDescription: 'Transakcja w toku. Zaksięgowanie może potrwać kilka dni.',
        companyInfo: 'Informacje o firmie',
        companyInfoDescription: 'Potrzebujemy jeszcze kilku informacji, zanim będziesz mógł wysłać swoją pierwszą fakturę.',
        yourCompanyName: 'Nazwa Twojej firmy',
        yourCompanyWebsite: 'Strona internetowa Twojej firmy',
        yourCompanyWebsiteNote: 'Jeśli nie masz strony internetowej, możesz zamiast niej podać profil swojej firmy na LinkedInie lub w mediach społecznościowych.',
        invalidDomainError: 'Wprowadzono nieprawidłową domenę. Aby kontynuować, wprowadź prawidłową domenę.',
        publicDomainError: 'Wprowadziłeś domenę publiczną. Aby kontynuować, wprowadź domenę prywatną.',
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
        settledElsewhere: 'Zapłacono gdzie indziej',
        individual: 'Osoba',
        business: 'Firma',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} przez Expensify` : `Zapłać z Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako osoba prywatna` : `Zapłać z konta osobistego`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} portfelem` : `Zapłać portfelem`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Zapłać ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako firma` : `Zapłać z konta firmowego`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Oznacz ${formattedAmount} jako zapłacone` : `Oznacz jako zapłacone`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z prywatnego konta ${last4Digits}` : `Opłacono z konta prywatnego`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z firmowego konta ${last4Digits}` : `Zapłacono z firmowego konta`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Zapłać ${formattedAmount} przez ${policyName}` : `Zapłać przez ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z konta bankowego ${last4Digits}` : `zapłacono z konta bankowego ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `opłacono ${amount ? `${amount} ` : ''} z konta bankowego ${last4Digits} za pomocą <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reguł przestrzeni roboczej</a>`,
        invoicePersonalBank: (lastFour: string) => `Konto osobiste • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Konto firmowe • ${lastFour}`,
        nextStep: 'Następne kroki',
        finished: 'Zakończono',
        flip: 'Odwróć',
        sendInvoice: ({amount}: RequestAmountParams) => `Wyślij fakturę na kwotę ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `wysłano${memo ? `, wpisując ${memo}` : ''}`,
        automaticallySubmitted: `przesłane przez <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">opóźnienie zgłoszeń</a>`,
        queuedToSubmitViaDEW: 'oczekuje na przesłanie poprzez niestandardowy proces zatwierdzania',
        queuedToApproveViaDEW: 'oczekuje na zatwierdzenie w ramach niestandardowego procesu zatwierdzania',
        trackedAmount: (formattedAmount: string, comment?: string) => `śledzenie ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `podziel ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `podziel ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Twój podział ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} jest winny ${amount}${comment ? `dla ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} jest winien:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}zapłacił(a) ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} zapłacił:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} wydał(-a) ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} wydał(a):`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} zatwierdzono:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} zatwierdził(a) ${amount}`,
        payerSettled: (amount: number | string) => `zapłacono ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `zapłacono ${amount}. Dodaj konto bankowe, aby otrzymać płatność.`,
        automaticallyApproved: `zatwierdzono przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reguły miejsca pracy</a>`,
        approvedAmount: (amount: number | string) => `zatwierdzono ${amount}`,
        approvedMessage: `zatwierdzono`,
        unapproved: `niezatwierdzone`,
        automaticallyForwarded: `zatwierdzono przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reguły miejsca pracy</a>`,
        forwarded: `zatwierdzono`,
        rejectedThisReport: 'odrzucił(a) ten raport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `rozpoczął(-ęła) płatność, ale czeka, aż ${submitterDisplayName} doda konto bankowe.`,
        adminCanceledRequest: 'anulowano płatność',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `anulował(-a) płatność ${amount}, ponieważ ${submitterDisplayName} nie włączył(-a) swojego portfela Expensify w ciągu 30 dni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} dodał konto bankowe. Płatność na kwotę ${amount} została dokonana.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}oznaczono jako opłacone${comment ? `, mówiąc „${comment}”` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}zapłacono portfelem`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}zapłacono za pomocą Expensify poprzez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        noReimbursableExpenses: 'Ten raport ma nieprawidłową kwotę',
        pendingConversionMessage: 'Suma zostanie zaktualizowana, gdy będziesz z powrotem online',
        changedTheExpense: 'zmieniono wydatek',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} na ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `ustawiono ${translatedChangedField} na ${newMerchant}, co ustawiło kwotę na ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName} (wcześniej ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} na ${newValueToDisplay} (wcześniej ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `zmienił(a) ${translatedChangedField} na ${newMerchant} (wcześniej ${oldMerchant}), co zaktualizowało kwotę na ${newAmountToDisplay} (wcześniej ${oldAmountToDisplay})`,
        basedOnAI: 'na podstawie wcześniejszej aktywności',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `na podstawie <a href="${rulesLink}">reguł przestrzeni roboczej</a>` : 'na podstawie reguły przestrzeni roboczej'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `dla ${comment}` : 'wydatek'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Raport faktury nr ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `Wysłano ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `przeniesiono wydatek z przestrzeni prywatnej do ${workspaceName ?? `czat z ${reportName}`}`,
        movedToPersonalSpace: 'przeniesiono wydatek do przestrzeni osobistej',
        error: {
            invalidCategoryLength: 'Nazwa kategorii przekracza 255 znaków. Skróć ją lub wybierz inną kategorię.',
            invalidTagLength: 'Nazwa tagu przekracza 255 znaków. Skróć ją lub wybierz inny tag.',
            invalidAmount: 'Wprowadź prawidłową kwotę przed kontynuowaniem',
            invalidDistance: 'Wprowadź prawidłowy dystans przed kontynuowaniem',
            invalidReadings: 'Wprowadź zarówno odczyt początkowy, jak i końcowy',
            negativeDistanceNotAllowed: 'Odczyt końcowy musi być większy niż odczyt początkowy',
            invalidIntegerAmount: 'Przed kontynuowaniem wprowadź kwotę w pełnych dolarach',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maksymalna kwota podatku to ${amount}`,
            invalidSplit: 'Suma podziałów musi być równa całkowitej kwocie',
            invalidSplitParticipants: 'Wprowadź kwotę większą niż zero dla co najmniej dwóch uczestników',
            invalidSplitYourself: 'Wprowadź niezerową kwotę dla swojego podziału',
            noParticipantSelected: 'Wybierz uczestnika',
            other: 'Nieoczekiwany błąd. Spróbuj ponownie później.',
            genericCreateFailureMessage: 'Nieoczekiwany błąd podczas przesyłania tego wydatku. Spróbuj ponownie później.',
            genericCreateInvoiceFailureMessage: 'Nieoczekiwany błąd podczas wysyłania tej faktury. Spróbuj ponownie później.',
            genericHoldExpenseFailureMessage: 'Nieoczekiwany błąd podczas wstrzymywania tego wydatku. Spróbuj ponownie później.',
            genericUnholdExpenseFailureMessage: 'Wystąpił nieoczekiwany błąd podczas zdejmowania tego wydatku z wstrzymania. Spróbuj ponownie później.',
            receiptDeleteFailureError: 'Niespodziewany błąd podczas usuwania tego paragonu. Spróbuj ponownie później.',
            receiptFailureMessage: '<rbr>Wystąpił błąd podczas przesyłania rachunku. Proszę <a href="download">zapisz rachunek</a> i <a href="retry">spróbuj ponownie</a> później.</rbr>',
            receiptFailureMessageShort: 'Wystąpił błąd podczas przesyłania paragonu.',
            genericDeleteFailureMessage: 'Nieoczekiwany błąd podczas usuwania tego wydatku. Spróbuj ponownie później.',
            genericEditFailureMessage: 'Nieoczekiwany błąd podczas edytowania tego wydatku. Spróbuj ponownie później.',
            genericSmartscanFailureMessage: 'W transakcji brakuje pól',
            duplicateWaypointsErrorMessage: 'Usuń duplikujące się punkty trasy',
            atLeastTwoDifferentWaypoints: 'Wprowadź co najmniej dwa różne adresy',
            splitExpenseMultipleParticipantsErrorMessage: 'Wydatek nie może być podzielony między przestrzeń roboczą a innych członków. Zaktualizuj swój wybór.',
            invalidMerchant: 'Wprowadź prawidłowego sprzedawcę',
            atLeastOneAttendee: 'Co najmniej jeden uczestnik musi zostać wybrany',
            invalidQuantity: 'Wprowadź prawidłową ilość',
            quantityGreaterThanZero: 'Ilość musi być większa niż zero',
            invalidSubrateLength: 'Musi istnieć co najmniej jedna podstawowa stawka',
            invalidRate: 'Stawka nie jest prawidłowa dla tego obszaru roboczego. Wybierz dostępną stawkę z tego obszaru roboczego.',
            endDateBeforeStartDate: 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia',
            endDateSameAsStartDate: 'Data zakończenia nie może być taka sama jak data rozpoczęcia',
            manySplitsProvided: `Maksymalna dozwolona liczba podziałów to ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Zakres dat nie może przekraczać ${CONST.IOU.SPLITS_LIMIT} dni.`,
        },
        dismissReceiptError: 'Odrzuć błąd',
        dismissReceiptErrorConfirmation: 'Uwaga! Zamknięcie tego błędu całkowicie usunie Twój przesłany paragon. Na pewno chcesz kontynuować?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `zaczął/a rozliczanie. Płatność jest wstrzymana, dopóki ${submitterDisplayName} nie włączy swojego portfela.`,
        enableWallet: 'Włącz portfel',
        hold: 'Wstrzymaj',
        unhold: 'Usuń blokadę',
        holdExpense: () => ({
            one: 'Wstrzymaj wydatek',
            other: 'Wstrzymaj wydatki',
        }),
        unholdExpense: 'Zdejmij blokadę wydatku',
        heldExpense: 'wstrzymał(-a) ten wydatek',
        unheldExpense: 'odblokował(-a) ten wydatek',
        moveUnreportedExpense: 'Przenieś niezgłoszony wydatek',
        addUnreportedExpense: 'Dodaj nierozliczony wydatek',
        selectUnreportedExpense: 'Wybierz co najmniej jeden wydatek, aby dodać go do raportu.',
        emptyStateUnreportedExpenseTitle: 'Brak nierozliczonych wydatków',
        emptyStateUnreportedExpenseSubtitle: 'Wygląda na to, że nie masz żadnych nierozliczonych wydatków. Spróbuj utworzyć jeden poniżej.',
        addUnreportedExpenseConfirm: 'Dodaj do raportu',
        newReport: 'Nowy raport',
        explainHold: () => ({
            one: 'Wyjaśnij, dlaczego wstrzymujesz ten wydatek.',
            other: 'Wyjaśnij, dlaczego wstrzymujesz te wydatki.',
        }),
        retracted: 'wycofano',
        retract: 'Cofnij',
        reopened: 'ponownie otwarto',
        reopenReport: 'Otwórz raport ponownie',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Ten raport został już wyeksportowany do ${connectionName}. Wprowadzenie zmian może doprowadzić do rozbieżności w danych. Czy na pewno chcesz ponownie otworzyć ten raport?`,
        reason: 'Powód',
        holdReasonRequired: 'Powód jest wymagany podczas wstrzymywania.',
        expenseWasPutOnHold: 'Wydatek został wstrzymany',
        expenseOnHold: 'Ten wydatek został wstrzymany. Sprawdź komentarze, aby poznać dalsze kroki.',
        expensesOnHold: 'Wszystkie wydatki zostały wstrzymane. Sprawdź komentarze, aby poznać dalsze kroki.',
        expenseDuplicate: 'Ten wydatek ma szczegóły podobne do innego. Przejrzyj duplikaty, aby kontynuować.',
        someDuplicatesArePaid: 'Niektóre z tych duplikatów zostały już zatwierdzone lub opłacone.',
        reviewDuplicates: 'Przejrzyj duplikaty',
        keepAll: 'Zachowaj wszystkie',
        confirmApprove: 'Potwierdź kwotę zatwierdzenia',
        confirmApprovalAmount: 'Zatwierdź tylko zgodne wydatki lub zatwierdź cały raport.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz go zatwierdzić?',
            other: 'Te wydatki są wstrzymane. Czy mimo to chcesz je zatwierdzić?',
        }),
        confirmPay: 'Potwierdź kwotę płatności',
        confirmPayAmount: 'Zapłać to, co nie jest wstrzymane, lub zapłać cały raport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz zapłacić?',
            other: 'Te wydatki są wstrzymane. Czy mimo to chcesz zapłacić?',
        }),
        payOnly: 'Płać tylko',
        approveOnly: 'Tylko zatwierdź',
        holdEducationalTitle: 'Czy powinieneś zatrzymać ten wydatek?',
        whatIsHoldExplain: 'Zawieszenie wydatku działa jak naciśnięcie „pauzy” na koszcie, dopóki nie będziesz gotów go przesłać.',
        holdIsLeftBehind: 'Wstrzymane wydatki są pomijane, nawet jeśli przesyłasz cały raport.',
        unholdWhenReady: 'Zdejmij blokadę z wydatków, gdy będziesz gotowy(-a) je przesłać.',
        changePolicyEducational: {
            title: 'Przeniesiono ten raport!',
            description: 'Sprawdź ponownie te elementy, które zwykle się zmieniają przy przenoszeniu raportów do nowej przestrzeni roboczej.',
            reCategorize: '<strong>Przeklasyfikuj wszystkie wydatki</strong>, aby były zgodne z zasadami przestrzeni roboczej.',
            workflows: 'Ten raport może teraz podlegać innemu <strong>procesowi zatwierdzania.</strong>',
        },
        changeWorkspace: 'Zmień przestrzeń roboczą',
        set: 'ustaw',
        changed: 'zmieniono',
        removed: 'usunięto',
        transactionPending: 'Transakcja w toku.',
        chooseARate: 'Wybierz stawkę zwrotu kosztów za milę lub kilometr dla przestrzeni roboczej',
        unapprove: 'Cofnij zatwierdzenie',
        unapproveReport: 'Cofnij zatwierdzenie raportu',
        headsUp: 'Uwaga!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Ten raport został już wyeksportowany do ${accountingIntegration}. Zmiana może prowadzić do rozbieżności w danych. Czy na pewno chcesz cofnąć zatwierdzenie tego raportu?`,
        reimbursable: 'podlegający zwrotowi',
        nonReimbursable: 'niepodlegający zwrotowi',
        bookingPending: 'Ta rezerwacja oczekuje',
        bookingPendingDescription: 'Rezerwacja oczekuje, ponieważ nie została jeszcze opłacona.',
        bookingArchived: 'Ta rezerwacja jest zarchiwizowana',
        bookingArchivedDescription: 'Ta rezerwacja została zarchiwizowana, ponieważ data podróży już minęła. W razie potrzeby dodaj wydatek na ostateczną kwotę.',
        attendees: 'Uczestnicy',
        whoIsYourAccountant: 'Kto jest twoim księgowym?',
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
            other: (count: number) => `Pierwszy dzień: ${count.toFixed(2)} godziny`,
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
        reject: {
            educationalTitle: 'Czy powinieneś zatrzymać czy odrzucić?',
            educationalText: 'Jeśli nie jesteś gotowy, aby zatwierdzić lub opłacić wydatek, możesz go wstrzymać lub odrzucić.',
            holdExpenseTitle: 'Wstrzymaj wydatek, aby poprosić o więcej szczegółów przed jego zatwierdzeniem lub opłaceniem.',
            approveExpenseTitle: 'Zatwierdzaj inne wydatki, podczas gdy wstrzymane wydatki pozostaną przypisane do Ciebie.',
            heldExpenseLeftBehindTitle: 'Wstrzymane wydatki są pomijane, gdy zatwierdzasz cały raport.',
            rejectExpenseTitle: 'Odrzuć wydatek, którego nie zamierzasz zaakceptować ani opłacić.',
            reasonPageTitle: 'Odrzuć wydatek',
            reasonPageDescription: 'Wyjaśnij, dlaczego odrzucasz ten wydatek.',
            rejectReason: 'Powód odrzucenia',
            markAsResolved: 'Oznacz jako rozwiązane',
            rejectedStatus: 'Ten wydatek został odrzucony. Czekamy, aż naprawisz problemy i oznaczysz go jako rozwiązany, aby umożliwić ponowne złożenie.',
            reportActions: {
                rejectedExpense: 'odrzucił(-a) ten wydatek',
                markedAsResolved: 'oznaczył(a) powód odrzucenia jako rozwiązany',
            },
        },
        moveExpenses: () => ({one: 'Przenieś wydatek', other: 'Przenieś wydatki'}),
        moveExpensesError:
            'Nie możesz przenosić wydatków ryczałtowych do raportów w innych przestrzeniach roboczych, ponieważ stawki ryczałtu mogą się różnić między przestrzeniami roboczymi.',
        changeApprover: {
            title: 'Zmień zatwierdzającego',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Wybierz opcję, aby zmienić osobę zatwierdzającą ten raport. (Zaktualizuj swoje <a href="${workflowSettingLink}">ustawienia przestrzeni roboczej</a>, aby zmienić to na stałe dla wszystkich raportów).`,
            changedApproverMessage: (managerID: number) => `zmieniono osobę zatwierdzającą na <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Dodaj osobę zatwierdzającą',
                addApproverSubtitle: 'Dodaj dodatkowego akceptującego do istniejącego procesu zatwierdzania.',
                bypassApprovers: 'Pomiń zatwierdzających',
                bypassApproversSubtitle: 'Przydziel siebie jako ostatecznego akceptującego i pomiń wszystkich pozostałych akceptujących.',
            },
            addApprover: {
                subtitle: 'Wybierz dodatkową osobę zatwierdzającą ten raport, zanim przekażemy go dalej w procesie akceptacji.',
            },
        },
        chooseWorkspace: 'Wybierz przestrzeń roboczą',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `raport przekazany do ${to} z powodu niestandardowego przepływu akceptacji`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'godzina' : 'godziny'} @ ${rate} / godzinę`,
            hrs: 'godz.',
            hours: 'Godziny',
            ratePreview: (rate: string) => `${rate} / godzinę`,
            amountTooLargeError: 'Całkowita kwota jest zbyt wysoka. Zmniejsz liczbę godzin lub obniż stawkę.',
        },
        correctDistanceRateError: 'Napraw błąd stawki za dystans i spróbuj ponownie.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>Wyjaśnij</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);
            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;
                if (key === 'reimbursable') {
                    return value ? 'oznaczył(a) wydatek jako „podlegający zwrotowi”' : 'oznaczył(a) wydatek jako „niepodlegający zwrotowi”';
                }
                if (key === 'billable') {
                    return value ? 'oznaczył/a wydatek jako „fakturowalny”' : 'oznaczył(a) wydatek jako „niefakturowalny”';
                }
                if (key === 'tax') {
                    const taxEntry = value as PolicyRulesModifiedFields['tax'];
                    const taxRateName = taxEntry?.field_id_TAX.name ?? '';
                    if (isFirst) {
                        return `ustaw stawkę podatku na „${taxRateName}”`;
                    }
                    return `stawka podatku na „${taxRateName}”`;
                }
                const updatedValue = value as string | boolean;
                if (isFirst) {
                    return `ustaw ${translations.common[key].toLowerCase()} na „${updatedValue}”`;
                }
                return `${translations.common[key].toLowerCase()} na "${updatedValue}"`;
            });
            return `${formatList(fragments)} przez <a href="${policyRulesRoute}">zasady przestrzeni roboczej</a>`;
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Scal pozycje wydatków',
            noEligibleExpenseFound: 'Nie znaleziono kwalifikujących się wydatków',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Nie masz żadnych wydatków, które można połączyć z tym. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Dowiedz się więcej</a> o kwalifikujących się wydatkach.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Wybierz <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">kwalifikujący się wydatek</a>, aby scalić go z raportem <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Wybierz paragon',
            pageTitle: 'Wybierz paragon, który chcesz zachować:',
        },
        detailsPage: {
            header: 'Wybierz szczegóły',
            pageTitle: 'Wybierz szczegóły, które chcesz zachować:',
            noDifferences: 'Nie znaleziono różnic między transakcjami',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'do' : 'a';
                return `Wybierz ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Wybierz uczestników',
            selectAllDetailsError: 'Zaznacz wszystkie szczegóły przed kontynuowaniem.',
        },
        confirmationPage: {
            header: 'Potwierdź szczegóły',
            pageTitle: 'Potwierdź dane, które chcesz zachować. Dane, których nie zachowasz, zostaną usunięte.',
            confirmButton: 'Scal pozycje wydatków',
        },
    },
    share: {
        shareToExpensify: 'Udostępnij w Expensify',
        messageInputLabel: 'Wiadomość',
    },
    notificationPreferencesPage: {
        header: 'Preferencje powiadomień',
        label: 'Powiadamiaj mnie o nowych wiadomościach',
        notificationPreferences: {
            always: 'Natychmiast',
            daily: 'Codziennie',
            mute: 'Wycisz',
            hidden: 'Ukryte',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Numer nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny SMS-em.',
        emailHasNotBeenValidated: 'Adres e-mail nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny SMS-em.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Prześlij zdjęcie',
        removePhoto: 'Usuń zdjęcie',
        editImage: 'Edytuj zdjęcie',
        viewPhoto: 'Zobacz zdjęcie',
        imageUploadFailed: 'Przesyłanie obrazu nie powiodło się',
        deleteWorkspaceError: 'Przepraszamy, wystąpił nieoczekiwany problem podczas usuwania awatara Twojej przestrzeni roboczej',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Wybrany obraz przekracza maksymalny rozmiar przesyłania ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Prześlij obraz większy niż ${minHeightInPx}x${minWidthInPx} pikseli i mniejszy niż ${maxHeightInPx}x${maxWidthInPx} pikseli.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Zdjęcie profilowe musi być jednym z następujących typów: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Edytuj zdjęcie profilowe',
        upload: 'Prześlij',
        uploadPhoto: 'Prześlij zdjęcie',
        selectAvatar: 'Wybierz awatar',
        choosePresetAvatar: 'Lub wybierz własny awatar',
    },
    modal: {
        backdropLabel: 'Tło modalu',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> dodasz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> doda wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie, aż administrator doda wydatki.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekuje na <strong>Ciebie</strong>, abyś przesłał(a) wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> złoży raport wydatków.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na zgłoszenie wydatków przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Nie są wymagane żadne dalsze działania!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Czekamy, aż <strong>Ty</strong> dodasz konto bankowe.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> doda konto bankowe.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na dodanie konta bankowego przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `o ${eta}` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie na automatyczne przesłanie <strong>Twoich</strong> wydatków${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie na automatyczne przesłanie wydatków użytkownika <strong>${actor}</strong>${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na automatyczne przesłanie wydatków administratora${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Czekamy, aż <strong>Ty</strong> naprawisz problemy.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> naprawi problemy.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na administratora, który naprawi problemy.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Czekamy, aż <strong>Ty</strong> zaakceptujesz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie na zatwierdzenie wydatków przez <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na zatwierdzenie wydatków przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> wyeksportujesz ten raport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> wyeksportuje ten raport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na administratora, aby wyeksportował ten raport.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie na to, aż <strong>Ty</strong> opłacisz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> zapłaci wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na rozliczenie wydatków przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Czekamy, aż <strong>Ty</strong> zakończysz konfigurację firmowego konta bankowego.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> zakończy zakładanie firmowego konta bankowego.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie, aż administrator zakończy konfigurację firmowego konta bankowego.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `do ${eta}` : ` ${eta}`;
                }
                return `Oczekiwanie na zakończenie płatności${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Ups! Wygląda na to, że wysyłasz zgłoszenie <strong>do siebie</strong>. Zatwierdzanie własnych raportów jest <strong>zabronione</strong> w tym workspace. Wyślij ten raport do kogoś innego lub skontaktuj się z administratorem, aby zmienić osobę, do której wysyłasz.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'wkrótce',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'później dzisiaj',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'w niedzielę',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '1. i 16. dnia każdego miesiąca',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'w ostatni dzień roboczy miesiąca',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'w ostatnim dniu miesiąca',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'pod koniec Twojej podróży',
        },
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Preferowane zaimki',
        selectYourPronouns: 'Wybierz swoje zaimki',
        selfSelectYourPronoun: 'Samodzielnie wybierz swoje zaimki',
        emailAddress: 'Adres e-mail',
        setMyTimezoneAutomatically: 'Ustaw mój czas lokalny automatycznie',
        timezone: 'Strefa czasowa',
        invalidFileMessage: 'Nieprawidłowy plik. Spróbuj użyć innego obrazu.',
        avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Spróbuj ponownie.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronizowanie',
        profileAvatar: 'Awatar profilu',
        publicSection: {
            title: 'Public',
            subtitle: 'Te informacje są wyświetlane w Twoim publicznym profilu. Każdy może je zobaczyć.',
        },
        privateSection: {
            title: 'Prywatne',
            subtitle: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane w Twoim publicznym profilu.',
        },
    },
    securityPage: {
        title: 'Opcje zabezpieczeń',
        subtitle: 'Włącz uwierzytelnianie dwuskładnikowe, aby zabezpieczyć swoje konto.',
        goToSecurity: 'Wróć do strony zabezpieczeń',
    },
    shareCodePage: {
        title: 'Twój kod',
        subtitle: 'Zaproś członków do Expensify, udostępniając swój osobisty kod QR lub link polecający.',
    },
    pronounsPage: {
        pronouns: 'Zaimki',
        isShownOnProfile: 'Twoje zaimki są wyświetlane w Twoim profilu.',
        placeholderText: 'Wyszukaj, aby zobaczyć opcje',
    },
    contacts: {
        contactMethods: 'Metody kontaktu',
        featureRequiresValidate: 'Ta funkcja wymaga, abyś zweryfikował(-a) swoje konto.',
        validateAccount: 'Zweryfikuj swoje konto',
        helpText: ({email}: {email: string}) =>
            `Dodaj więcej sposobów logowania i wysyłania paragonów do Expensify.<br/><br/>Dodaj adres e-mail, aby przekazywać paragony na <a href="mailto:${email}">${email}</a>, lub dodaj numer telefonu, aby wysyłać paragony SMS-em na numer 47777 (tylko numery z USA).`,
        pleaseVerify: 'Zweryfikuj tę metodę kontaktu.',
        getInTouch: 'Użyjemy tej metody, aby się z Tobą skontaktować.',
        enterMagicCode: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        setAsDefault: 'Ustaw jako domyślne',
        yourDefaultContactMethod: 'To jest Twoja domyślna metoda kontaktu. Zanim będziesz mógł ją usunąć, wybierz inną metodę kontaktu i kliknij „Ustaw jako domyślną”.',
        removeContactMethod: 'Usuń metodę kontaktu',
        removeAreYouSure: 'Czy na pewno chcesz usunąć tę metodę kontaktu? Tej akcji nie można cofnąć.',
        failedNewContact: 'Nie udało się dodać tej metody kontaktu.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Nie udało się wysłać nowego magicznego kodu. Poczekaj chwilę i spróbuj ponownie.',
            validateSecondaryLogin: 'Nieprawidłowy lub nieaktualny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
            deleteContactMethod: 'Nie udało się usunąć metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            setDefaultContactMethod: 'Nie udało się ustawić nowej domyślnej metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            addContactMethod: 'Nie udało się dodać tej metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            enteredMethodIsAlreadySubmitted: 'Ta metoda kontaktu już istnieje',
            passwordRequired: 'wymagane hasło.',
            contactMethodRequired: 'Metoda kontaktu jest wymagana',
            invalidContactMethod: 'Nieprawidłowa metoda kontaktu',
        },
        newContactMethod: 'Nowa metoda kontaktu',
        goBackContactMethods: 'Wróć do metod kontaktu',
    },
    pronouns: {
        coCos: 'Co / Coś',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'On / Jego / Jemu',
        heHimHisTheyThemTheirs: 'On / Jego / Jemu / Oni / Ich / Im',
        sheHerHers: 'Ona / Ją / Jej',
        sheHerHersTheyThemTheirs: 'Ona / Ją / Jej / Oni / Ich / Ich',
        merMers: 'Identyfikator / Identyfikatory',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Na osobę / Osób',
        theyThemTheirs: 'Oni / Ich / Ich',
        thonThons: 'Thon / Thony',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Pan / Pani',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Zwracaj się do mnie po imieniu',
    },
    displayNamePage: {
        headerTitle: 'Wyświetlana nazwa',
        isShownOnProfile: 'Twoja nazwa wyświetlana jest widoczna na Twoim profilu.',
    },
    timezonePage: {
        timezone: 'Strefa czasowa',
        isShownOnProfile: 'Twoja strefa czasowa jest wyświetlana w Twoim profilu.',
        getLocationAutomatically: 'Automatycznie ustalaj swoją lokalizację',
    },
    updateRequiredView: {
        updateRequired: 'Wymagana aktualizacja',
        pleaseInstall: 'Zaktualizuj do najnowszej wersji New Expensify',
        pleaseInstallExpensifyClassic: 'Zainstaluj najnowszą wersję Expensify',
        toGetLatestChanges: 'Na urządzeniu mobilnym pobierz i zainstaluj najnowszą wersję. W przeglądarce internetowej odśwież stronę.',
        newAppNotAvailable: 'Aplikacja New Expensify nie jest już dostępna.',
    },
    initialSettingsPage: {
        about: 'Informacje',
        aboutPage: {
            description: 'Nowa aplikacja Expensify jest tworzona przez społeczność programistów open source z całego świata. Pomóż nam budować przyszłość Expensify.',
            appDownloadLinks: 'Linki do pobrania aplikacji',
            viewKeyboardShortcuts: 'Zobacz skróty klawiaturowe',
            viewTheCode: 'Wyświetl kod',
            viewOpenJobs: 'Wyświetl otwarte oferty pracy',
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
        },
        troubleshoot: {
            clearCacheAndRestart: 'Wyczyść pamięć podręczną i uruchom ponownie',
            viewConsole: 'Wyświetl konsolę debugowania',
            debugConsole: 'Konsola debugowania',
            description:
                '<muted-text>Skorzystaj z poniższych narzędzi, aby rozwiązać problemy z działaniem Expensify. Jeśli napotkasz jakiekolwiek problemy, prosimy <concierge-link>zgłosić błąd</concierge-link>.</muted-text>',
            confirmResetDescription: 'Wszystkie niewysłane wiadomości robocze zostaną utracone, ale reszta Twoich danych jest bezpieczna.',
            resetAndRefresh: 'Resetuj i odśwież',
            clientSideLogging: 'Rejestrowanie po stronie klienta',
            noLogsToShare: 'Brak dzienników do udostępnienia',
            useProfiling: 'Użyj profilowania',
            profileTrace: 'Śledzenie profilu',
            results: 'Wyniki',
            releaseOptions: 'Opcje wydania',
            testingPreferences: 'Preferencje testowe',
            useStagingServer: 'Użyj serwera testowego',
            forceOffline: 'Wymuś tryb offline',
            simulatePoorConnection: 'Symuluj słabe połączenie internetowe',
            simulateFailingNetworkRequests: 'Symuluj nieudane żądania sieciowe',
            authenticationStatus: 'Status uwierzytelniania',
            deviceCredentials: 'Dane logowania urządzenia',
            invalidate: 'Unieważnij',
            destroy: 'Zniszcz',
            maskExportOnyxStateData: 'Maskuj wrażliwe dane członków podczas eksportu stanu Onyx',
            exportOnyxState: 'Eksportuj stan Onyx',
            importOnyxState: 'Zaimportuj stan Onyx',
            testCrash: 'Test awarii',
            resetToOriginalState: 'Przywróć stan początkowy',
            usingImportedState: 'Używasz zaimportowanego stanu. Naciśnij tutaj, aby go wyczyścić.',
            debugMode: 'Tryb debugowania',
            invalidFile: 'Nieprawidłowy plik',
            invalidFileDescription: 'Plik, który próbujesz zaimportować, jest nieprawidłowy. Spróbuj ponownie.',
            invalidateWithDelay: 'Unieważnij z opóźnieniem',
            leftHandNavCache: 'Pamięć podręczna lewego panelu nawigacyjnego',
            clearleftHandNavCache: 'Wyczyść',
            recordTroubleshootData: 'Nagraj dane diagnostyczne',
            softKillTheApp: 'Delikatnie wyłącz aplikację',
            kill: 'Zabij',
            sentryDebug: 'Debugowanie Sentry',
            sentryDebugDescription: 'Loguj żądania Sentry w konsoli',
            sentryHighlightedSpanOps: 'Wyróżnione nazwy zakresów',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, nawigacja, ui.load',
        },
        debugConsole: {
            saveLog: 'Zapisz dziennik',
            shareLog: 'Udostępnij dziennik',
            enterCommand: 'Wpisz polecenie',
            execute: 'Wykonaj',
            noLogsAvailable: 'Brak dostępnych dzienników',
            logSizeTooLarge: ({size}: LogSizeParams) => `Rozmiar dziennika przekracza limit ${size} MB. Użyj polecenia „Zapisz dziennik”, aby zamiast tego pobrać plik dziennika.`,
            logs: 'Dzienniki',
            viewConsole: 'Pokaż konsolę',
        },
        security: 'Bezpieczeństwo',
        signOut: 'Wyloguj się',
        restoreStashed: 'Przywróć zapisane logowanie',
        signOutConfirmationText: 'Utracisz wszystkie zmiany w trybie offline, jeśli się wylogujesz.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Przeczytaj <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki świadczenia usług</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politykę prywatności</a>.</muted-text-micro>`,
        help: 'Pomoc',
        whatIsNew: 'Co nowego',
        accountSettings: 'Ustawienia konta',
        account: 'Konto',
        general: 'Ogólne',
    },
    closeAccountPage: {
        closeAccount: 'Zamknij konto',
        reasonForLeavingPrompt: 'Byłoby nam bardzo przykro, gdybyś odszedł! Czy mógłbyś powiedzieć nam, dlaczego, abyśmy mogli się poprawić?',
        enterMessageHere: 'Wpisz tutaj wiadomość',
        closeAccountWarning: 'Zamknięcia konta nie można cofnąć.',
        closeAccountPermanentlyDeleteData: 'Czy na pewno chcesz usunąć swoje konto? Spowoduje to trwałe usunięcie wszystkich oczekujących wydatków.',
        enterDefaultContactToConfirm: 'Wprowadź domyślną metodę kontaktu, aby potwierdzić, że chcesz zamknąć konto. Twoja domyślna metoda kontaktu to:',
        enterDefaultContact: 'Wprowadź swoją domyślną metodę kontaktu',
        defaultContact: 'Domyślna metoda kontaktu:',
        enterYourDefaultContactMethod: 'Podaj domyślny sposób kontaktu, aby zamknąć swoje konto.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Połącz konta',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Wprowadź konto, które chcesz scalić z <strong>${login}</strong>.`,
            notReversibleConsent: 'Rozumiem, że tego nie da się cofnąć',
        },
        accountValidate: {
            confirmMerge: 'Czy na pewno chcesz scalić konta?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Połączenie Twoich kont jest nieodwracalne i spowoduje utratę wszystkich niewysłanych wydatków dla użytkownika <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Aby kontynuować, wprowadź magiczny kod wysłany na <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Nieprawidłowy lub nieaktualny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
                fallback: 'Coś poszło nie tak. Spróbuj ponownie później.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konta połączone!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Pomyślnie połączono wszystkie dane z <strong>${from}</strong> z kontem <strong>${to}</strong>. Od teraz możesz używać dowolnego loginu dla tego konta.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Pracujemy nad tym',
            limitedSupport: 'Nie obsługujemy jeszcze łączenia kont w nowym Expensify. Wykonaj tę akcję w Expensify Classic.',
            reachOutForHelp: '<muted-text><centered-text>W razie pytań śmiało <concierge-link>skontaktuj się z Concierge</concierge-link>!</centered-text></muted-text>',
            goToExpensifyClassic: 'Przejdź do Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić <strong>${email}</strong>, ponieważ jest kontrolowany przez <strong>${email.split('@').at(1) ?? ''}</strong>. Prosimy <concierge-link>skontaktować się z Concierge</concierge-link> w celu uzyskania pomocy.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić konta <strong>${email}</strong> z innymi kontami, ponieważ administrator Twojej domeny ustawił je jako Twoje główne logowanie. Zamiast tego scal inne konta z tym kontem.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Nie możesz scalić kont, ponieważ dla adresu <strong>${email}</strong> jest włączone uwierzytelnianie dwuskładnikowe (2FA). Wyłącz 2FA dla <strong>${email}</strong> i spróbuj ponownie.</centered-text></muted-text>`,
            learnMore: 'Dowiedz się więcej o łączeniu kont.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz połączyć <strong>${email}</strong>, ponieważ jest zablokowany. Proszę <concierge-link>skontaktuj się z Concierge</concierge-link>, aby uzyskać pomoc.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Nie możesz scalić kont, ponieważ <strong>${email}</strong> nie ma konta w Expensify. Zamiast tego <a href="${contactMethodLink}">dodaj go jako metodę kontaktu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić konta <strong>${email}</strong> z innymi kontami. Zamiast tego scal z nim inne konta.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić kont z kontem <strong>${email}</strong>, ponieważ to konto jest właścicielem rozliczonej relacji rozliczeniowej.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Spróbuj ponownie później',
            description: 'Było zbyt wiele prób połączenia kont. Spróbuj ponownie później.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Nie możesz scalić z innymi kontami, ponieważ to konto nie jest zweryfikowane. Zweryfikuj konto i spróbuj ponownie.',
        },
        mergeFailureSelfMerge: {
            description: 'Nie można scalić konta z nim samym.',
        },
        mergeFailureGenericHeading: 'Nie można scalić kont',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Zgłoś podejrzaną aktywność',
        lockAccount: 'Zablokuj konto',
        unlockAccount: 'Odblokuj konto',
        compromisedDescription:
            'Zauważyłeś coś niepokojącego na swoim koncie? Zgłoszenie tego natychmiast zablokuje Twoje konto, wstrzyma nowe transakcje kartą Expensify i uniemożliwi wprowadzanie zmian na koncie.',
        domainAdminsDescription: 'Dla administratorów domeny: to również wstrzymuje całą aktywność kart Expensify oraz działania administracyjne w Twoich domenach.',
        areYouSure: 'Czy na pewno chcesz zablokować swoje konto Expensify?',
        onceLocked: 'Po zablokowaniu Twoje konto będzie ograniczone do czasu złożenia prośby o odblokowanie i przeprowadzenia kontroli bezpieczeństwa',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Nie udało się zablokować konta',
        failedToLockAccountDescription: `Nie mogliśmy zablokować Twojego konta. Skontaktuj się z Concierge na czacie, aby rozwiązać ten problem.`,
        chatWithConcierge: 'Czat z Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto zablokowane',
        yourAccountIsLocked: 'Twoje konto jest zablokowane',
        chatToConciergeToUnlock: 'Porozmawiaj z Concierge, aby rozwiązać kwestie bezpieczeństwa i odblokować swoje konto.',
        chatWithConcierge: 'Czat z Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Uwierzytelnianie dwuskładnikowe',
        twoFactorAuthEnabled: 'Włączono uwierzytelnianie dwuskładnikowe',
        whatIsTwoFactorAuth:
            'Uwierzytelnianie dwuskładnikowe (2FA) pomaga chronić Twoje konto. Podczas logowania musisz wprowadzić kod wygenerowany przez wybraną aplikację uwierzytelniającą.',
        disableTwoFactorAuth: 'Wyłącz uwierzytelnianie dwuskładnikowe',
        explainProcessToRemove: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź poprawny kod z aplikacji uwierzytelniającej.',
        explainProcessToRemoveWithRecovery: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod odzyskiwania.',
        disabled: 'Uwierzytelnianie dwuskładnikowe jest teraz wyłączone',
        noAuthenticatorApp: 'Aplikacja uwierzytelniająca nie będzie już wymagana do logowania się do Expensify.',
        stepCodes: 'Kody odzyskiwania',
        keepCodesSafe: 'Zachowaj te kody odzyskiwania w bezpiecznym miejscu!',
        codesLoseAccess: dedent(`
            Jeśli utracisz dostęp do swojej aplikacji uwierzytelniającej i nie będziesz mieć tych kodów, stracisz dostęp do swojego konta.

            Uwaga: Skonfigurowanie uwierzytelniania dwuskładnikowego spowoduje wylogowanie Cię ze wszystkich innych aktywnych sesji.
        `),
        errorStepCodes: 'Skopiuj lub pobierz kody przed kontynuowaniem',
        stepVerify: 'Potwierdź',
        scanCode: 'Zeskanuj kod QR za pomocą swojego',
        authenticatorApp: 'aplikacja uwierzytelniająca',
        addKey: 'Lub dodaj ten tajny klucz do swojej aplikacji uwierzytelniającej:',
        enterCode: 'Następnie wprowadź sześciocyfrowy kod wygenerowany przez swoją aplikację uwierzytelniającą.',
        stepSuccess: 'Zakończono',
        enabled: 'Włączono uwierzytelnianie dwuskładnikowe',
        congrats: 'Gratulacje! Teraz masz dodatkowe zabezpieczenie.',
        copy: 'Kopiuj',
        disable: 'Wyłącz',
        enableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe',
        pleaseEnableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe.',
        twoFactorAuthIsRequiredDescription: 'Ze względów bezpieczeństwa Xero wymaga uwierzytelniania dwuskładnikowego, aby połączyć integrację.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Wymagane uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredForAdminsTitle: 'Włącz uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredXero: 'Twoje połączenie z księgowością Xero wymaga uwierzytelniania dwuskładnikowego.',
        twoFactorAuthIsRequiredCompany: 'Twoetapowe uwierzytelnianie jest wymagane przez Twoją firmę.',
        twoFactorAuthCannotDisable: 'Nie można wyłączyć 2FA',
        twoFactorAuthRequired: 'Dwuskładnikowe uwierzytelnianie (2FA) jest wymagane dla Twojego połączenia z Xero i nie może zostać wyłączone.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Wprowadź swój kod odzyskiwania',
            incorrectRecoveryCode: 'Nieprawidłowy kod odzyskiwania. Spróbuj ponownie.',
        },
        useRecoveryCode: 'Użyj kodu odzyskiwania',
        recoveryCode: 'Kod odzyskiwania',
        use2fa: 'Użyj kodu uwierzytelniania dwuskładnikowego',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Wprowadź swój kod uwierzytelniania dwuskładnikowego',
            incorrect2fa: 'Nieprawidłowy kod uwierzytelniania dwuskładnikowego. Spróbuj ponownie.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Hasło zaktualizowane!',
        allSet: 'Wszystko gotowe. Zachowaj swoje nowe hasło w bezpiecznym miejscu.',
    },
    privateNotes: {
        title: 'Prywatne notatki',
        personalNoteMessage: 'Zapisuj tutaj notatki z tej rozmowy. Tylko Ty możesz je dodawać, edytować lub wyświetlać.',
        sharedNoteMessage: 'Zapisuj tutaj notatki z tej rozmowy. Pracownicy Expensify i inni członkowie z domeny team.expensify.com mogą je zobaczyć.',
        composerLabel: 'Notatki',
        myNote: 'Moja notatka',
        error: {
            genericFailureMessage: 'Nie udało się zapisać prywatnych notatek',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Wprowadź prawidłowy kod zabezpieczający',
        },
        securityCode: 'Kod zabezpieczający',
        changeBillingCurrency: 'Zmień walutę rozliczeniową',
        changePaymentCurrency: 'Zmień walutę płatności',
        paymentCurrency: 'Waluta płatności',
        paymentCurrencyDescription: 'Wybierz standardową walutę, na którą mają być przeliczane wszystkie wydatki osobiste',
        note: `Uwaga: Zmiana waluty płatności może wpłynąć na to, ile zapłacisz za Expensify. Pełne informacje znajdziesz na naszej <a href="${CONST.PRICING}">stronie z cennikiem</a>.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Dodaj kartę debetową',
        nameOnCard: 'Imię i nazwisko na karcie',
        debitCardNumber: 'Numer karty debetowej',
        expiration: 'Data wygaśnięcia',
        expirationDate: 'MMRR',
        cvv: 'CVV',
        billingAddress: 'Adres rozliczeniowy',
        growlMessageOnSave: 'Twoja karta debetowa została pomyślnie dodana',
        expensifyPassword: 'Hasło do Expensify',
        error: {
            invalidName: 'Imię może zawierać tylko litery',
            addressZipCode: 'Wprowadź prawidłowy kod pocztowy',
            debitCardNumber: 'Wprowadź prawidłowy numer karty debetowej',
            expirationDate: 'Wybierz prawidłową datę ważności',
            securityCode: 'Wprowadź prawidłowy kod zabezpieczający',
            addressStreet: 'Wprowadź prawidłowy adres rozliczeniowy, który nie jest skrytką pocztową',
            addressState: 'Wybierz stan',
            addressCity: 'Wprowadź miasto',
            genericFailureMessage: 'Wystąpił błąd podczas dodawania Twojej karty. Spróbuj ponownie.',
            password: 'Wprowadź swoje hasło do Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Dodaj kartę płatniczą',
        nameOnCard: 'Imię i nazwisko na karcie',
        paymentCardNumber: 'Numer karty',
        expiration: 'Data wygaśnięcia',
        expirationDate: 'MM/RR',
        cvv: 'CVV',
        billingAddress: 'Adres rozliczeniowy',
        growlMessageOnSave: 'Twoja karta płatnicza została pomyślnie dodana',
        expensifyPassword: 'Hasło do Expensify',
        error: {
            invalidName: 'Imię może zawierać tylko litery',
            addressZipCode: 'Wprowadź prawidłowy kod pocztowy',
            paymentCardNumber: 'Wprowadź prawidłowy numer karty',
            expirationDate: 'Wybierz prawidłową datę ważności',
            securityCode: 'Wprowadź prawidłowy kod zabezpieczający',
            addressStreet: 'Wprowadź prawidłowy adres rozliczeniowy, który nie jest skrytką pocztową',
            addressState: 'Wybierz stan',
            addressCity: 'Wprowadź miasto',
            genericFailureMessage: 'Wystąpił błąd podczas dodawania Twojej karty. Spróbuj ponownie.',
            password: 'Wprowadź swoje hasło do Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Metody płatności',
        setDefaultConfirmation: 'Ustaw jako domyślną metodę płatności',
        setDefaultSuccess: 'Domyślna metoda płatności ustawiona!',
        deleteAccount: 'Usuń konto',
        deleteConfirmation: 'Czy na pewno chcesz usunąć to konto?',
        deleteCard: 'Usuń kartę',
        deleteCardConfirmation: 'Wszystkie niewysłane transakcje kartą, w tym te na otwartych raportach, zostaną usunięte. Na pewno chcesz usunąć tę kartę? Tej czynności nie można cofnąć.',
        error: {
            notOwnerOfBankAccount: 'Wystąpił błąd podczas ustawiania tego konta bankowego jako Twojej domyślnej metody płatności',
            invalidBankAccount: 'To konto bankowe jest tymczasowo zawieszone',
            notOwnerOfFund: 'Wystąpił błąd podczas ustawiania tej karty jako domyślnej metody płatności',
            setDefaultFailure: 'Coś poszło nie tak. Skontaktuj się z Concierge, aby uzyskać dalszą pomoc.',
        },
        addBankAccountFailure: 'Wystąpił nieoczekiwany błąd podczas próby dodania Twojego konta bankowego. Spróbuj ponownie.',
        getPaidFaster: 'Otrzymuj płatności szybciej',
        addPaymentMethod: 'Dodaj metodę płatności, aby wysyłać i odbierać płatności bezpośrednio w aplikacji.',
        getPaidBackFaster: 'Otrzymuj zwroty szybciej',
        secureAccessToYourMoney: 'Bezpieczny dostęp do Twoich pieniędzy',
        receiveMoney: 'Otrzymuj pieniądze w swojej lokalnej walucie',
        expensifyWallet: 'Portfel Expensify (beta)',
        sendAndReceiveMoney: 'Wysyłaj i otrzymuj pieniądze ze znajomymi. Tylko rachunki bankowe w USA.',
        enableWallet: 'Włącz portfel',
        addBankAccountToSendAndReceive: 'Dodaj konto bankowe, aby wysyłać i odbierać płatności.',
        addDebitOrCreditCard: 'Dodaj kartę debetową lub kredytową',
        assignedCards: 'Przypisane karty',
        assignedCardsDescription: 'Transakcje z tych kart synchronizują się automatycznie.',
        expensifyCard: 'Karta Expensify',
        walletActivationPending: 'Przeglądamy Twoje informacje. Sprawdź ponownie za kilka minut!',
        walletActivationFailed: 'Niestety, w tym momencie nie można włączyć Twojego portfela. Skontaktuj się proszę na czacie z Concierge, aby uzyskać dalszą pomoc.',
        addYourBankAccount: 'Dodaj swoje konto bankowe',
        addBankAccountBody: 'Połączmy Twoje konto bankowe z Expensify, aby jeszcze łatwiej wysyłać i otrzymywać płatności bezpośrednio w aplikacji.',
        chooseYourBankAccount: 'Wybierz swoje konto bankowe',
        chooseAccountBody: 'Upewnij się, że wybierasz właściwą.',
        confirmYourBankAccount: 'Potwierdź swoje konto bankowe',
        personalBankAccounts: 'Prywatne konta bankowe',
        businessBankAccounts: 'Firmowe konta bankowe',
        shareBankAccount: 'Udostępnij konto bankowe',
        bankAccountShared: 'Udostępniono konto bankowe',
        shareBankAccountTitle: 'Wybierz administratorów, z którymi chcesz udostępnić to konto bankowe:',
        shareBankAccountSuccess: 'Udostępniono konto bankowe!',
        shareBankAccountSuccessDescription: 'Wybrani administratorzy otrzymają wiadomość z potwierdzeniem od Concierge.',
        shareBankAccountFailure: 'Wystąpił nieoczekiwany błąd podczas próby udostępnienia konta bankowego. Spróbuj ponownie.',
        shareBankAccountEmptyTitle: 'Brak dostępnych administratorów',
        shareBankAccountEmptyDescription: 'Nie ma żadnych administratorów przestrzeni roboczej, z którymi możesz udostępnić to konto bankowe.',
        shareBankAccountNoAdminsSelected: 'Wybierz administratora przed kontynuowaniem',
        unshareBankAccount: 'Przestań udostępniać konto bankowe',
        unshareBankAccountDescription:
            'Wszyscy poniżej mają dostęp do tego konta bankowego. Możesz w każdej chwili odebrać im dostęp. Nadal zrealizujemy wszystkie płatności w trakcie przetwarzania.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} utraci dostęp do tego firmowego rachunku bankowego. Nadal zrealizujemy wszystkie płatności w toku.`,
        reachOutForHelp: 'Jest używany z kartą Expensify. <concierge-link>Skontaktuj się z Concierge</concierge-link>, jeśli musisz przestać go udostępniać.',
        unshareErrorModalTitle: 'Nie można cofnąć udostępnienia konta bankowego',
    },
    cardPage: {
        expensifyCard: 'Karta Expensify',
        expensifyTravelCard: 'Karta podróżna Expensify',
        availableSpend: 'Pozostały limit',
        smartLimit: {
            name: 'Inteligentny limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Możesz wydać do ${formattedLimit} na tej karcie, a limit będzie się odnawiał w miarę zatwierdzania Twoich złożonych wydatków.`,
        },
        fixedLimit: {
            name: 'Stały limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Możesz wydać na tej karcie maksymalnie ${formattedLimit}, a potem zostanie dezaktywowana.`,
        },
        monthlyLimit: {
            name: 'Limit miesięczny',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Możesz wydać do ${formattedLimit} miesięcznie na tej karcie. Limit zostanie zresetowany pierwszego dnia każdego miesiąca kalendarzowego.`,
        },
        virtualCardNumber: 'Numer wirtualnej karty',
        travelCardCvv: 'Kod CVV karty podróżnej',
        physicalCardNumber: 'Numer karty fizycznej',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Zamów kartę fizyczną',
        reportFraud: 'Zgłoś oszustwo na wirtualnej karcie',
        reportTravelFraud: 'Zgłoś oszustwo na karcie podróżnej',
        reviewTransaction: 'Przejrzyj transakcję',
        suspiciousBannerTitle: 'Podejrzana transakcja',
        suspiciousBannerDescription: 'Zauważyliśmy podejrzane transakcje na Twojej karcie. Stuknij poniżej, aby je przejrzeć.',
        cardLocked: 'Twoja karta jest tymczasowo zablokowana, podczas gdy nasz zespół przegląda konto Twojej firmy.',
        markTransactionsAsReimbursable: 'Oznacz transakcje jako podlegające zwrotowi',
        markTransactionsDescription: 'Gdy ta opcja jest włączona, transakcje zaimportowane z tej karty domyślnie są oznaczane jako podlegające zwrotowi.',
        csvCardDescription: 'Import CSV',
        cardDetails: {
            cardNumber: 'Numer wirtualnej karty',
            expiration: 'Data ważności',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Pokaż szczegóły',
            revealCvv: 'Pokaż kod CVV',
            copyCardNumber: 'Skopiuj numer karty',
            updateAddress: 'Zaktualizuj adres',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Dodano do portfela ${platform}`,
        cardDetailsLoadingFailure: 'Wystąpił błąd podczas ładowania szczegółów karty. Sprawdź swoje połączenie z internetem i spróbuj ponownie.',
        validateCardTitle: 'Upewnijmy się, że to Ty',
        enterMagicCode: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby wyświetlić szczegóły swojej karty. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Proszę <a href="${missingDetailsLink}">dodaj swoje dane osobowe</a>, a następnie spróbuj ponownie.`,
        unexpectedError: 'Wystąpił błąd podczas pobierania szczegółów Twojej karty Expensify. Spróbuj ponownie.',
        cardFraudAlert: {
            confirmButtonText: 'Tak, robię',
            reportFraudButtonText: 'Nie, to nie byłem ja',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `usunął/ęła podejrzaną aktywność i ponownie aktywował/a kartę x${cardLastFour}. Możesz dalej rozliczać wydatki!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `dezaktywowano kartę kończącą się na ${cardLastFour}`,
            alertMessage: ({
                cardLastFour,
                amount,
                merchant,
                date,
            }: {
                cardLastFour: string;
                amount: string;
                merchant: string;
                date: string;
            }) => `wykryliśmy podejrzaną aktywność na karcie kończącej się na ${cardLastFour}. Czy rozpoznajesz tę transakcję?

${amount} dla ${merchant} – ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Wydatki',
        workflowDescription: 'Skonfiguruj przepływ pracy od momentu poniesienia wydatku, łącznie z akceptacją i płatnością.',
        submissionFrequency: 'Zgłoszenia',
        submissionFrequencyDescription: 'Wybierz niestandardowy harmonogram przesyłania wydatków.',
        submissionFrequencyDateOfMonth: 'Dzień miesiąca',
        disableApprovalPromptDescription: 'Wyłączenie zatwierdzania spowoduje usunięcie wszystkich istniejących procesów zatwierdzania.',
        addApprovalsTitle: 'Zatwierdzenia',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `wydatki od ${members}, a zatwierdzający to ${approvers}`,
        addApprovalButton: 'Dodaj proces zatwierdzania',
        addApprovalTip: 'Ten domyślny przepływ pracy ma zastosowanie do wszystkich członków, o ile nie istnieje bardziej szczegółowy przepływ pracy.',
        approver: 'Osoba zatwierdzająca',
        addApprovalsDescription: 'Wymagaj dodatkowej akceptacji przed autoryzacją płatności.',
        makeOrTrackPaymentsTitle: 'Płatności',
        makeOrTrackPaymentsDescription: 'Dodaj upoważnioną osobę płacącą do płatności dokonywanych w Expensify lub śledź płatności dokonane gdzie indziej.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Na tym obszarze roboczym jest włączony niestandardowy proces zatwierdzania. Aby przejrzeć lub zmienić ten proces, skontaktuj się ze swoim <account-manager-link>Opiekunem klienta</account-manager-link> lub <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>W tym obszarze roboczym jest włączony niestandardowy proces zatwierdzania. Aby go przejrzeć lub zmienić, skontaktuj się z <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wybierz, jak długo Expensify ma czekać przed udostępnieniem wydatków bez błędów.',
        },
        frequencyDescription: 'Wybierz, jak często wydatki mają być wysyłane automatycznie, lub ustaw ręczne wysyłanie',
        frequencies: {
            instant: 'Natychmiast',
            weekly: 'Co tydzień',
            monthly: 'Miesięcznie',
            twiceAMonth: 'Dwa razy w miesiącu',
            byTrip: 'Według podróży',
            manually: 'Ręcznie',
            daily: 'Codziennie',
            lastDayOfMonth: 'Ostatni dzień miesiąca',
            lastBusinessDayOfMonth: 'Ostatni dzień roboczy miesiąca',
            ordinals: {
                one: 'śr',
                two: 'nd',
                few: 'rd',
                other: 'czw.',
                '1': 'Pierwszy',
                '2': 'Sekunda',
                '3': 'Trzeci',
                '4': 'Czwarty',
                '5': 'Piąty',
                '6': 'Szósty',
                '7': 'Siódmy',
                '8': 'Ósmy',
                '9': 'Dziewiąty',
                '10': 'Dziesiąty',
            },
        },
        approverInMultipleWorkflows: 'Ten członek należy już do innego procesu zatwierdzania. Wszelkie zmiany wprowadzone tutaj będą widoczne także tam.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> już zatwierdza raporty do <strong>${name2}</strong>. Wybierz innego akceptującego, aby uniknąć cyklicznego obiegu zatwierdzania.`,
        emptyContent: {
            title: 'Brak członków do wyświetlenia',
            expensesFromSubtitle: 'Wszyscy członkowie przestrzeni roboczej już należą do istniejącego procesu zatwierdzania.',
            approverSubtitle: 'Wszyscy zatwierdzający należą do istniejącego przepływu pracy.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Nie udało się zmienić częstotliwości wysyłania. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        monthlyOffsetErrorMessage: 'Nie udało się zmienić częstotliwości miesięcznej. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Potwierdź',
        header: 'Dodaj więcej zatwierdzających i potwierdź.',
        additionalApprover: 'Dodatkowy zatwierdzający',
        submitButton: 'Dodaj przepływ pracy',
    },
    workflowsEditApprovalsPage: {
        title: 'Edytuj przepływ akceptacji',
        deleteTitle: 'Usuń proces zatwierdzania',
        deletePrompt: 'Na pewno chcesz usunąć ten proces zatwierdzania? Wszyscy członkowie będą następnie korzystać z domyślnego procesu.',
    },
    workflowsExpensesFromPage: {
        title: 'Wydatki z',
        header: 'Gdy następujący członkowie przesyłają wydatki:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Nie można było zmienić osoby zatwierdzającej. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        title: 'Ustaw zatwierdzającego',
        description: 'Ta osoba będzie zatwierdzać wydatki.',
    },
    workflowsApprovalLimitPage: {
        title: 'Osoba zatwierdzająca',
        header: '(Opcjonalnie) Chcesz dodać limit zatwierdzania?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Dodaj kolejnego akceptującego, gdy <strong>${approverName}</strong> jest akceptującym, a raport przekracza kwotę poniżej:`
                : 'Dodaj kolejnego zatwierdzającego, gdy raport przekroczy kwotę poniżej:',
        reportAmountLabel: 'Kwota raportu',
        additionalApproverLabel: 'Dodatkowy zatwierdzający',
        skip: 'Pomiń',
        next: 'Dalej',
        removeLimit: 'Usuń limit',
        enterAmountError: 'Wprowadź prawidłową kwotę',
        enterApproverError: 'Zatwierdzający jest wymagany, gdy ustawiasz limit raportu',
        enterBothError: 'Wprowadź kwotę raportu i dodatkowego zatwierdzającego',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Raporty powyżej ${approvalLimit} przekazuj do ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Upoważniony płatnik',
        genericErrorMessage: 'Nie udało się zmienić upoważnionej osoby płacącej. Spróbuj ponownie.',
        admins: 'Administratorzy',
        payer: 'Płatnik',
        paymentAccount: 'Konto płatnicze',
    },
    reportFraudPage: {
        title: 'Zgłoś oszustwo na wirtualnej karcie',
        description: 'Jeśli dane Twojej wirtualnej karty zostały skradzione lub przejęte, trwale dezaktywujemy obecną kartę i wydamy Ci nową wirtualną kartę z nowym numerem.',
        deactivateCard: 'Dezaktywuj kartę',
        reportVirtualCardFraud: 'Zgłoś oszustwo na wirtualnej karcie',
    },
    reportFraudConfirmationPage: {
        title: 'Zgłoszono oszustwo kartą',
        description: 'Trwale dezaktywowaliśmy Twoją dotychczasową kartę. Gdy wrócisz do szczegółów karty, będzie tam dostępna nowa wirtualna karta.',
        buttonText: 'Rozumiem, dzięki!',
    },
    activateCardPage: {
        activateCard: 'Aktywuj kartę',
        pleaseEnterLastFour: 'Wprowadź ostatnie cztery cyfry swojej karty.',
        activatePhysicalCard: 'Aktywuj kartę fizyczną',
        error: {
            thatDidNotMatch: 'To nie zgadza się z ostatnimi 4 cyframi Twojej karty. Spróbuj ponownie.',
            throttled:
                'Zbyt wiele razy błędnie wprowadziłeś ostatnie 4 cyfry swojej karty Expensify. Jeśli masz pewność, że numery są poprawne, skontaktuj się z Concierge, aby rozwiązać problem. W przeciwnym razie spróbuj ponownie później.',
        },
    },
    getPhysicalCard: {
        header: 'Zamów kartę fizyczną',
        nameMessage: 'Wpisz swoje imię i nazwisko, ponieważ będzie ono widoczne na Twojej karcie.',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        legalFirstName: 'Imię zgodne z dokumentem tożsamości',
        legalLastName: 'Nazwisko rodowe',
        phoneMessage: 'Wprowadź swój numer telefonu.',
        phoneNumber: 'Numer telefonu',
        address: 'Adres',
        addressMessage: 'Wprowadź swój adres wysyłki.',
        streetAddress: 'Ulica i numer domu',
        city: 'Miasto',
        state: 'Stan',
        zipPostcode: 'Kod pocztowy',
        country: 'Kraj',
        confirmMessage: 'Potwierdź poniżej swoje dane.',
        estimatedDeliveryMessage: 'Twoja fizyczna karta dotrze w ciągu 2–3 dni roboczych.',
        next: 'Dalej',
        getPhysicalCard: 'Zamów kartę fizyczną',
        shipCard: 'Wyślij kartę',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Natychmiastowa (karta debetowa)',
        instantSummary: (rate: string, minAmount: string) => `Opłata ${rate}% (minimum ${minAmount})`,
        ach: '1–3 dni robocze (konto bankowe)',
        achSummary: 'Bez opłaty',
        whichAccount: 'Które konto?',
        fee: 'Opłata',
        transferSuccess: 'Przelew zakończony powodzeniem!',
        transferDetailBankAccount: 'Twoje pieniądze powinny dotrzeć w ciągu 1–3 dni roboczych.',
        transferDetailDebitCard: 'Twoje pieniądze powinny dotrzeć natychmiast.',
        failedTransfer: 'Twoje saldo nie jest w pełni rozliczone. Przelej środki na konto bankowe.',
        notHereSubTitle: 'Przelej swoje saldo ze strony portfela',
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
        defaultPaymentMethod: 'Domyślne',
        bankAccountLastFour: (lastFour: string) => `Konto bankowe • ${lastFour}`,
    },
    expenseRulesPage: {
        title: 'Reguły wydatków',
        subtitle: 'Te zasady będą miały zastosowanie do Twoich wydatków. Jeśli wyślesz je do przestrzeni roboczej, zasady tej przestrzeni mogą je zastąpić.',
        findRule: 'Znajdź regułę',
        emptyRules: {
            title: 'Nie utworzyłeś żadnych reguł',
            subtitle: 'Dodaj regułę, aby zautomatyzować raportowanie wydatków.',
        },
        changes: {
            billableUpdate: (value: boolean) => `Zaktualizuj wydatek ${value ? 'fakturowalne' : 'niepodlegające fakturowaniu'}`,
            categoryUpdate: (value: string) => `Zaktualizuj kategorię na „${value}”`,
            commentUpdate: (value: string) => `Zaktualizuj opis na „${value}”`,
            merchantUpdate: (value: string) => `Zaktualizuj sprzedawcę na „${value}”`,
            reimbursableUpdate: (value: boolean) => `Zaktualizuj wydatek ${value ? 'podlegający zwrotowi' : 'niepodlegający zwrotowi'}`,
            tagUpdate: (value: string) => `Zaktualizuj znacznik na „${value}”`,
            taxUpdate: (value: string) => `Zaktualizuj stawkę podatku na „${value}”`,
            billable: (value: boolean) => `wydatek ${value ? 'fakturowalne' : 'niepodlegające fakturowaniu'}`,
            category: (value: string) => `kategoria na „${value}”`,
            comment: (value: string) => `opis dla „${value}”`,
            merchant: (value: string) => `sprzedawcy na „${value}”`,
            reimbursable: (value: boolean) => `wydatek ${value ? 'podlegający zwrotowi' : 'niepodlegający zwrotowi'}`,
            tag: (value: string) => `oznacz jako "${value}"`,
            tax: (value: string) => `stawka podatku na „${value}”`,
            report: (value: string) => `dodaj do raportu o nazwie „${value}”`,
        },
        newRule: 'Nowa reguła',
        addRule: {
            title: 'Dodaj regułę',
            expenseContains: 'Jeśli wydatek zawiera:',
            applyUpdates: 'Następnie zastosuj te aktualizacje:',
            merchantHint: 'Wpisz . , aby utworzyć regułę, która ma zastosowanie do wszystkich sprzedawców',
            addToReport: 'Dodaj do raportu o nazwie',
            createReport: 'Utwórz raport, jeśli to konieczne',
            applyToExistingExpenses: 'Zastosuj do istniejących pasujących wydatków',
            confirmError: 'Wprowadź sprzedawcę i zastosuj co najmniej jedną zmianę',
            confirmErrorMerchant: 'Wprowadź sprzedawcę',
            confirmErrorUpdate: 'Zastosuj co najmniej jedną aktualizację',
            saveRule: 'Zapisz regułę',
        },
        editRule: {
            title: 'Edytuj regułę',
        },
        deleteRule: {
            deleteSingle: 'Usuń regułę',
            deleteMultiple: 'Usuń reguły',
            deleteSinglePrompt: 'Na pewno chcesz usunąć tę regułę?',
            deleteMultiplePrompt: 'Czy na pewno chcesz usunąć te reguły?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'Preferencje aplikacji',
        },
        testSection: {
            title: 'Preferencje testowe',
            subtitle: 'Ustawienia pomagające debugować i testować aplikację na środowisku staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Otrzymuj istotne aktualizacje funkcji i wiadomości od Expensify',
        muteAllSounds: 'Wycisz wszystkie dźwięki z Expensify',
    },
    priorityModePage: {
        priorityMode: 'Tryb priorytetowy',
        explainerText: 'Wybierz, czy #skupiać się tylko na nieprzeczytanych i przypiętych czatach, czy wyświetlać wszystkie, z najnowszymi i przypiętymi czatami na górze.',
        priorityModes: {
            default: {
                label: 'Najnowsze',
                description: 'Pokaż wszystkie czaty posortowane od najnowszych',
            },
            gsd: {
                label: '#skupienie',
                description: 'Pokazuj tylko nieprzeczytane, posortowane alfabetycznie',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `w ${policyName}`,
        generatingPDF: 'Utwórz PDF',
        waitForPDF: 'Poczekaj, aż wygenerujemy plik PDF.',
        errorPDF: 'Wystąpił błąd podczas próby wygenerowania Twojego pliku PDF',
        successPDF: 'Twój plik PDF został wygenerowany! Jeśli nie został pobrany automatycznie, użyj przycisku poniżej.',
    },
    reportDescriptionPage: {
        roomDescription: 'Opis pokoju',
        roomDescriptionOptional: 'Opis pokoju (opcjonalnie)',
        explainerText: 'Ustaw własny opis pokoju.',
    },
    groupChat: {
        lastMemberTitle: 'Uwaga!',
        lastMemberWarning: 'Ponieważ jesteś tu ostatnią osobą, wyjście spowoduje, że ten czat stanie się niedostępny dla wszystkich członków. Czy na pewno chcesz opuścić czat?',
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
                label: 'Jasny',
            },
            system: {
                label: 'Użyj ustawień urządzenia',
            },
        },
        chooseThemeBelowOrSync: 'Wybierz motyw poniżej lub zsynchronizuj z ustawieniami urządzenia.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Logując się, akceptujesz <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politykę prywatności</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Przekazy pieniężne są świadczone przez ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) zgodnie z jego <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licencjami</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Nie otrzymano magicznego kodu?',
        enterAuthenticatorCode: 'Wprowadź swój kod z aplikacji uwierzytelniającej',
        enterRecoveryCode: 'Wprowadź swój kod odzyskiwania',
        requiredWhen2FAEnabled: 'Wymagane, gdy włączone jest uwierzytelnianie dwuskładnikowe (2FA)',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Poproś o nowy kod za <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Poproś o nowy kod',
        error: {
            pleaseFillMagicCode: 'Wprowadź swój magiczny kod',
            incorrectMagicCode: 'Nieprawidłowy lub nieaktualny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
            pleaseFillTwoFactorAuth: 'Wprowadź swój kod uwierzytelniania dwuskładnikowego',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Proszę wypełnić wszystkie pola',
        pleaseFillPassword: 'Wprowadź swoje hasło',
        pleaseFillTwoFactorAuth: 'Wprowadź swój kod dwuskładnikowy',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Wprowadź swój kod uwierzytelniania dwuskładnikowego, aby kontynuować',
        forgot: 'Zapomniałeś?',
        requiredWhen2FAEnabled: 'Wymagane, gdy włączone jest uwierzytelnianie dwuskładnikowe (2FA)',
        error: {
            incorrectPassword: 'Nieprawidłowe hasło. Spróbuj ponownie.',
            incorrectLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie.',
            incorrect2fa: 'Nieprawidłowy kod uwierzytelniania dwuskładnikowego. Spróbuj ponownie.',
            twoFactorAuthenticationEnabled: 'Masz włączone uwierzytelnianie dwuskładnikowe (2FA) na tym koncie. Zaloguj się, używając adresu e-mail lub numeru telefonu.',
            invalidLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie lub zresetuj hasło.',
            unableToResetPassword:
                'Nie udało się zmienić hasła. Prawdopodobnie powodem jest wygasły link do resetowania hasła w starszej wiadomości e-mail. Wysłaliśmy Ci nowy link, abyś mógł spróbować ponownie. Sprawdź swoją skrzynkę odbiorczą i folder ze spamem; wiadomość powinna dotrzeć w ciągu kilku minut.',
            noAccess: 'Nie masz dostępu do tej aplikacji. Dodaj swoją nazwę użytkownika GitHub, aby uzyskać dostęp.',
            accountLocked: 'Twoje konto zostało zablokowane po zbyt wielu nieudanych próbach. Spróbuj ponownie za 1 godzinę.',
            fallback: 'Coś poszło nie tak. Spróbuj ponownie później.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon lub e-mail',
        error: {
            invalidFormatEmailLogin: 'Wprowadzony adres e-mail jest nieprawidłowy. Popraw jego format i spróbuj ponownie.',
        },
        cannotGetAccountDetails: 'Nie można pobrać szczegółów konta. Spróbuj zalogować się ponownie.',
        loginForm: 'Formularz logowania',
        notYou: ({user}: NotYouParams) => `Nie ${user}?`,
    },
    onboarding: {
        welcome: 'Witamy!',
        welcomeSignOffTitleManageTeam: 'Gdy ukończysz powyższe zadania, będziemy mogli odkrywać więcej funkcji, takich jak przepływy zatwierdzania i reguły!',
        welcomeSignOffTitle: 'Miło cię poznać!',
        explanationModal: {
            title: 'Witamy w Expensify',
            description: 'Jedna aplikacja do obsługi firmowych i prywatnych wydatków w tempie czatu. Wypróbuj ją i daj nam znać, co o niej sądzisz. To dopiero początek!',
            secondaryDescription: 'Aby wrócić do Expensify Classic, wystarczy stuknąć swoje zdjęcie profilowe > Przejdź do Expensify Classic.',
        },
        getStarted: 'Rozpocznij',
        whatsYourName: 'Jak masz na imię?',
        peopleYouMayKnow: 'Osoby, które możesz znać, są już tutaj! Zweryfikuj swój adres e-mail, aby do nich dołączyć.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Ktoś z ${domain} utworzył już przestrzeń roboczą. Wprowadź magiczny kod wysłany na adres ${email}.`,
        joinAWorkspace: 'Dołącz do przestrzeni roboczej',
        listOfWorkspaces: 'Oto lista przestrzeni roboczych, do których możesz dołączyć. Nie martw się, zawsze możesz dołączyć do nich później, jeśli wolisz.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} członk${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Gdzie pracujesz?',
        errorSelection: 'Wybierz opcję, aby przejść dalej',
        purpose: {
            title: 'Co chcesz dzisiaj zrobić?',
            errorContinue: 'Naciśnij „Dalej”, aby się skonfigurować',
            errorBackButton: 'Aby rozpocząć korzystanie z aplikacji, odpowiedz na pytania konfiguracyjne',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Otrzymuję zwrot od pracodawcy',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Zarządzaj wydatkami mojego zespołu',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Śledź wydatki i planuj budżet',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Czatuj i dziel wydatki ze znajomymi',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Coś innego',
        },
        employees: {
            title: 'Ilu masz pracowników?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1–10 pracowników',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11–50 pracowników',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51–100 pracowników',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101–1 000 pracowników',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Ponad 1000 pracowników',
        },
        accounting: {
            title: 'Czy korzystasz z jakiegoś oprogramowania księgowego?',
            none: 'Brak',
        },
        interestedFeatures: {
            title: 'Jakimi funkcjami jesteś zainteresowany(-a)?',
            featuresAlreadyEnabled: 'Oto nasze najpopularniejsze funkcje:',
            featureYouMayBeInterestedIn: 'Włącz dodatkowe funkcje:',
        },
        error: {
            requiredFirstName: 'Wprowadź swoje imię, aby kontynuować',
        },
        workEmail: {
            title: 'Jaki jest Twój służbowy adres e-mail?',
            subtitle: 'Expensify działa najlepiej, gdy połączysz swój służbowy adres e-mail.',
            explanationModal: {
                descriptionOne: 'Przekaż na adres receipts@expensify.com do zeskanowania',
                descriptionTwo: 'Dołącz do współpracowników, którzy już korzystają z Expensify',
                descriptionThree: 'Korzystaj z bardziej spersonalizowanego doświadczenia',
            },
            addWorkEmail: 'Dodaj służbowy e-mail',
        },
        workEmailValidation: {
            title: 'Zweryfikuj służbowy adres e-mail',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Wpisz magiczny kod wysłany na adres ${workEmail}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        },
        workEmailValidationError: {
            publicEmail: 'Wprowadź prawidłowy służbowy adres e-mail z prywatnej domeny, np. mitch@company.com',
            offline: 'Nie mogliśmy dodać Twojego służbowego adresu e‑mail, ponieważ wydajesz się być offline',
        },
        mergeBlockScreen: {
            title: 'Nie udało się dodać służbowego adresu e-mail',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nie mogliśmy dodać ${workEmail}. Spróbuj ponownie później w Ustawieniach lub porozmawiaj na czacie z Concierge, aby uzyskać wskazówki.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Wybierz się na [jazdę próbną](${testDriveURL})`,
                description: ({testDriveURL}) => `[Weź krótką wycieczkę po produkcie](${testDriveURL}), aby zobaczyć, dlaczego Expensify to najszybszy sposób rozliczania wydatków.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Wybierz się na [jazdę próbną](${testDriveURL})`,
                description: ({testDriveURL}) => `Wypróbuj nas podczas [jazdy próbnej](${testDriveURL}) i zapewnij swojemu zespołowi *3 darmowe miesiące Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Dodaj akceptacje wydatków',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Dodaj akceptacje wydatków*, aby przeglądać wydatki swojego zespołu i utrzymać je pod kontrolą.

                        Jak to zrobić:

                        1. Przejdź do *Workspace’ów*.
                        2. Wybierz swój workspace.
                        3. Kliknij *Więcej funkcji*.
                        4. Włącz *Workflows*.
                        5. Przejdź do *Workflows* w edytorze workspace’u.
                        6. Włącz *Akceptacje*.
                        7. Zostaniesz ustawiony jako zatwierdzający wydatki. Możesz zmienić tę osobę na dowolnego administratora po zaproszeniu zespołu.

                        [Przejdź do więcej funkcji](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Utwórz](${workspaceConfirmationLink}) przestrzeń roboczą`,
                description: 'Utwórz przestrzeń roboczą i skonfiguruj ustawienia z pomocą swojego specjalisty ds. konfiguracji!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Utwórz [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Utwórz przestrzeń roboczą*, aby śledzić wydatki, skanować paragony, czatować i nie tylko.

                        1. Kliknij *Przestrzenie robocze* > *Nowa przestrzeń robocza*.

                        *Twoja nowa przestrzeń robocza jest gotowa!* [Zobacz ją](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Skonfiguruj [kategorie](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Skonfiguruj kategorie*, aby Twój zespół mógł kategoryzować wydatki dla łatwego raportowania.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Categories*.
                        4. Wyłącz wszystkie kategorie, których nie potrzebujesz.
                        5. Dodaj własne kategorie w prawym górnym rogu.

                        [Przejdź do ustawień kategorii przestrzeni roboczej](${workspaceCategoriesLink}).

                        ![Skonfiguruj kategorie](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Zgłoś wydatek',
                description: dedent(`
                    *Zgłoś wydatek*, wpisując kwotę lub skanując paragon.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz wydatek*.
                    3. Wpisz kwotę lub zeskanuj paragon.
                    4. Dodaj adres e‑mail lub numer telefonu swojego przełożonego.
                    5. Kliknij *Utwórz*.

                    I gotowe!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Zgłoś wydatek',
                description: dedent(`
                    *Zgłoś wydatek*, wpisując kwotę lub skanując paragon.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz wydatek*.
                    3. Wpisz kwotę lub zeskanuj paragon.
                    4. Potwierdź szczegóły.
                    5. Kliknij *Utwórz*.

                    I gotowe!
                `),
            },
            trackExpenseTask: {
                title: 'Śledź wydatek',
                description: dedent(`
                    *Zarejestruj wydatek* w dowolnej walucie, niezależnie od tego, czy masz paragon, czy nie.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz wydatek*.
                    3. Wprowadź kwotę lub zeskanuj paragon.
                    4. Wybierz swoją *przestrzeń osobistą*.
                    5. Kliknij *Utwórz*.

                    I gotowe! Tak, to naprawdę takie proste.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Połącz${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'do'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'twój' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Połącz ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'twój' : 'do'} ${integrationName}, aby automatycznie kategoryzować wydatki i synchronizować dane, co znacznie ułatwi zamknięcie miesiąca.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swój workspace.
                        3. Kliknij *Accounting*.
                        4. Znajdź ${integrationName}.
                        5. Kliknij *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Przejdź do księgowości](${workspaceAccountingLink}).

                        ![Połącz z ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Przejdź do księgowości](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Połącz [swoje firmowe karty](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Podłącz posiadane już karty, aby automatycznie importować transakcje, dopasowywać paragony i przeprowadzać uzgadnianie.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoje miejsce pracy.
                        3. Kliknij *Company cards*.
                        4. Postępuj zgodnie ze wskazówkami, aby podłączyć swoje karty.

                        [Przejdź do kart firmowych](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Zaproś [swój zespół](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Zaproś swój zespół* do Expensify, aby mógł zacząć śledzić wydatki już dziś.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swój workspace.
                        3. Kliknij *Members* > *Invite member*.
                        4. Wpisz adresy e-mail lub numery telefonów.
                        5. Dodaj własną wiadomość z zaproszeniem, jeśli chcesz!

                        [Przejdź do członków workspace](${workspaceMembersLink}).

                        ![Zaproś swój zespół](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Skonfiguruj [kategorie](${workspaceCategoriesLink}) i [tagi](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Skonfiguruj kategorie i tagi*, aby Twój zespół mógł księgować wydatki dla łatwego raportowania.

                        Zaimportuj je automatycznie, [łącząc swój program księgowy](${workspaceAccountingLink}), albo skonfiguruj je ręcznie w [ustawieniach swojego miejsca pracy](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Skonfiguruj [tagi](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Używaj tagów, aby dodać do wydatków dodatkowe informacje, takie jak projekty, klienci, lokalizacje i działy. Jeśli potrzebujesz wielu poziomów tagów, możesz uaktualnić do planu Control.

                        1. Kliknij *Przestrzenie robocze*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Więcej funkcji*.
                        4. Włącz *Tagi*.
                        5. Przejdź do *Tagi* w edytorze przestrzeni roboczej.
                        6. Kliknij *+ Dodaj tag*, aby utworzyć własne.

                        [Przejdź do sekcji „Więcej funkcji”](${workspaceMoreFeaturesLink}).

                        ![Skonfiguruj tagi](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Zaproś swojego [księgowego](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Zaproś swojego księgowego* do współpracy w Twojej przestrzeni roboczej i zarządzania wydatkami firmowymi.

                        1. Kliknij *Przestrzenie robocze*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Członkowie*.
                        4. Kliknij *Zaproś członka*.
                        5. Wpisz adres e-mail swojego księgowego.

                        [Zaproś księgowego teraz](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Rozpocznij czat',
                description: dedent(`
                    *Rozpocznij czat* z dowolną osobą, używając jej adresu e‑mail lub numeru telefonu.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Rozpocznij czat*.
                    3. Wpisz adres e‑mail lub numer telefonu.

                    Jeśli ktoś jeszcze nie korzysta z Expensify, zaprosimy go automatycznie.

                    Każdy czat zostanie też wysłany jako e‑mail lub SMS, na który można odpowiedzieć bezpośrednio.
                `),
            },
            splitExpenseTask: {
                title: 'Podziel wydatek',
                description: dedent(`
                    *Podziel wydatki* z jedną lub większą liczbą osób.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Rozpocznij czat*.
                    3. Wpisz adresy e-mail lub numery telefonów.
                    4. Kliknij szary przycisk *+* na czacie > *Podziel wydatek*.
                    5. Utwórz wydatek, wybierając *Ręcznie*, *Skan* lub *Dystans*.

                    Możesz dodać więcej szczegółów, jeśli chcesz, albo po prostu wyślij. Pomożemy Ci odzyskać pieniądze!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Sprawdź swoje [ustawienia przestrzeni roboczej](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Oto jak sprawdzić i zaktualizować ustawienia swojego przestrzeni roboczej:
                        1. Kliknij Przestrzenie robocze.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Sprawdź i zaktualizuj swoje ustawienia.
                        [Przejdź do swojej przestrzeni roboczej.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Utwórz swój pierwszy raport',
                description: dedent(`
                    Oto jak utworzyć raport:

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz raport*.
                    3. Kliknij *Dodaj wydatek*.
                    4. Dodaj swój pierwszy wydatek.

                    I gotowe!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Wybierz się na [jazdę próbną](${testDriveURL})` : 'Wypróbuj w praktyce'),
            embeddedDemoIframeTitle: 'Jazda próbna',
            employeeFakeReceipt: {
                description: 'Mój paragon z jazdy próbnej!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Otrzymanie zwrotu jest tak proste jak wysłanie wiadomości. Przejdźmy przez podstawy.',
            onboardingPersonalSpendMessage: 'Oto jak w kilku kliknięciach śledzić swoje wydatki.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Twój bezpłatny okres próbny został rozpoczęty! Skonfigurujmy wszystko.
                        👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Utworzyłem już przestrzeń roboczą, aby pomóc zarządzać paragonami i wydatkami Twojego zespołu. Aby jak najlepiej wykorzystać 30-dniowy bezpłatny okres próbny, wykonaj pozostałe kroki konfiguracji poniżej!
                    `)
                    : dedent(`
                        # Twój bezpłatny okres próbny właśnie się rozpoczął! Skonfigurujmy wszystko.
                        👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Skoro utworzyłeś(-aś) już przestrzeń roboczą, wykorzystaj w pełni swój 30-dniowy bezpłatny okres próbny, wykonując poniższe kroki!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Skonfigurujmy wszystko dla Ciebie\n👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Utworzyłem już przestrzeń roboczą, aby pomóc Ci zarządzać paragonami i wydatkami. Aby w pełni wykorzystać 30-dniowy darmowy okres próbny, po prostu wykonaj pozostałe kroki konfiguracji poniżej!',
            onboardingChatSplitMessage: 'Dzieleniе się rachunkami ze znajomymi jest tak proste jak wysłanie wiadomości. Oto jak to działa.',
            onboardingAdminMessage: 'Dowiedz się, jak zarządzać przestrzenią roboczą swojego zespołu jako administrator i jak przesyłać własne wydatki.',
            onboardingLookingAroundMessage:
                'Expensify jest najlepiej znane z rozliczania wydatków, podróży i zarządzania kartami służbowymi, ale robimy znacznie więcej. Daj znać, czym jesteś zainteresowany/zainteresowana, a pomogę Ci zacząć.',
            onboardingTestDriveReceiverMessage: '*Masz 3 miesiące za darmo! Zacznij poniżej.*',
        },
        workspace: {
            title: 'Zachowaj porządek dzięki przestrzeni roboczej',
            subtitle: 'Odblokuj zaawansowane narzędzia, które uproszczą zarządzanie wydatkami – wszystko w jednym miejscu. Dzięki przestrzeni roboczej możesz:',
            explanationModal: {
                descriptionOne: 'Śledź i porządkuj paragony',
                descriptionTwo: 'Kategoryzuj i taguj wydatki',
                descriptionThree: 'Twórz i udostępniaj raporty',
            },
            price: 'Wypróbuj za darmo przez 30 dni, a potem przejdź na wyższy plan za jedyne <strong>5 USD/użytkownika/miesiąc</strong>.',
            createWorkspace: 'Utwórz przestrzeń roboczą',
        },
        confirmWorkspace: {
            title: 'Potwierdź workspace',
            subtitle: 'Utwórz przestrzeń roboczą, aby śledzić paragony, rozliczać wydatki, zarządzać podróżami, tworzyć raporty i nie tylko — wszystko z szybkością czatu.',
        },
        inviteMembers: {
            title: 'Zaproś członków',
            subtitle: 'Dodaj swój zespół lub zaproś księgowego. Im więcej, tym weselej!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nie pokazuj mi tego ponownie',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'Nazwa nie może zawierać znaków specjalnych',
            containsReservedWord: 'Nazwa nie może zawierać słów Expensify ani Concierge',
            hasInvalidCharacter: 'Nazwa nie może zawierać przecinka ani średnika',
            requiredFirstName: 'Imię nie może być puste',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Jak brzmi twoje imię i nazwisko zgodnie z dokumentami?',
        enterDateOfBirth: 'Jaka jest twoja data urodzenia?',
        enterAddress: 'Jaki jest Twój adres?',
        enterPhoneNumber: 'Jaki jest Twój numer telefonu?',
        personalDetails: 'Dane osobiste',
        privateDataMessage: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane w Twoim publicznym profilu.',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        legalFirstName: 'Imię zgodne z dokumentem tożsamości',
        legalLastName: 'Nazwisko rodowe',
        address: 'Adres',
        error: {
            dateShouldBeBefore: (dateString: string) => `Data powinna być wcześniejsza niż ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `Data powinna być późniejsza niż ${dateString}`,
            hasInvalidCharacter: 'Nazwa może zawierać tylko znaki łacińskie',
            incorrectZipFormat: (zipFormat?: string) => `Nieprawidłowy format kodu pocztowego${zipFormat ? `Akceptowalny format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Upewnij się, że numer telefonu jest prawidłowy (np. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link został wysłany ponownie',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Wysłałem magiczny link logowania na adres ${login}. Sprawdź swój ${loginType}, aby się zalogować.`,
        resendLink: 'Wyślij link ponownie',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Aby zweryfikować ${secondaryLogin}, wyślij ponownie magiczny kod z Ustawień konta użytkownika ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Jeśli nie masz już dostępu do ${primaryLogin}, odłącz swoje konta.`,
        unlink: 'Odłącz',
        linkSent: 'Link wysłany!',
        successfullyUnlinkedLogin: 'Dodatkowe logowanie zostało pomyślnie odłączone!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Nasz dostawca usług e-mail tymczasowo wstrzymał wysyłanie wiadomości na adres ${login} z powodu problemów z dostarczaniem. Aby odblokować swój login, wykonaj następujące kroki:`,
        confirmThat: (login: string) =>
            `<strong>Potwierdź, że ${login} jest wpisany poprawnie i jest prawdziwym, dostarczalnym adresem e‑mail.</strong> Aliasy e‑mail, takie jak „expenses@domain.com”, muszą mieć dostęp do własnej skrzynki odbiorczej, aby były ważnym loginem do Expensify.`,
        ensureYourEmailClient: `<strong>Upewnij się, że Twój klient e-mail akceptuje wiadomości z domeny expensify.com.</strong> Instrukcje, jak wykonać ten krok, znajdziesz <a href="${CONST.SET_NOTIFICATION_LINK}">tutaj</a>, ale możesz potrzebować pomocy działu IT przy konfiguracji ustawień poczty.`,
        onceTheAbove: `Po wykonaniu powyższych kroków skontaktuj się z <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, aby odblokować swój login.`,
    },
    openAppFailureModal: {
        title: 'Coś poszło nie tak...',
        subtitle: `Nie udało nam się wczytać wszystkich Twoich danych. Otrzymaliśmy powiadomienie i sprawdzamy ten problem. Jeśli będzie się powtarzał, skontaktuj się z`,
        refreshAndTryAgain: 'Odśwież i spróbuj ponownie',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nie możemy dostarczyć wiadomości SMS na ${login}, dlatego tymczasowo go zawiesiliśmy. Spróbuj zweryfikować swój numer:`,
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
                return 'Odczekaj chwilę przed ponowną próbą.';
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
            return `Chwileczkę! Musisz odczekać ${timeText}, zanim ponownie spróbujesz zweryfikować swój numer.`;
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
        selectYear: 'Wybierz rok',
    },
    focusModeUpdateModal: {
        title: 'Witaj w trybie #focus!',
        prompt: (priorityModePageUrl: string) =>
            `Bądź na bieżąco, wyświetlając tylko nieprzeczytane czaty lub czaty wymagające Twojej uwagi. Nie martw się, możesz to zmienić w dowolnym momencie w <a href="${priorityModePageUrl}">ustawieniach</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Nie można znaleźć czatu, którego szukasz.',
        getMeOutOfHere: 'Wyprowadź mnie stąd',
        iouReportNotFound: 'Nie można znaleźć szczegółów płatności, których szukasz.',
        notHere: 'Hmm... nie ma tego tutaj',
        pageNotFound: 'Ups, nie można znaleźć tej strony',
        noAccess: 'Ten czat lub wydatek mógł zostać usunięty albo nie masz do niego dostępu.\n\nW razie pytań skontaktuj się pod adresem concierge@expensify.com',
        goBackHome: 'Wróć do strony głównej',
        commentYouLookingForCannotBeFound: 'Nie można znaleźć komentarza, którego szukasz.',
        goToChatInstead: 'Zamiast tego przejdź do czatu.',
        contactConcierge: 'W razie pytań skontaktuj się z concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups... ${isBreakLine ? '\n' : ''}Coś poszło nie tak`,
        subtitle: 'Nie można było zrealizować Twojego żądania. Spróbuj ponownie później.',
        wrongTypeSubtitle: 'To wyszukiwanie jest nieprawidłowe. Spróbuj dostosować kryteria wyszukiwania.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Dodaj emotikon, aby ułatwić współpracownikom i znajomym zorientowanie się, co się dzieje. Opcjonalnie możesz dodać też wiadomość!',
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
        whenClearStatus: 'Kiedy mamy wyczyścić Twój status?',
        vacationDelegate: 'Zastępca na czas urlopu',
        setVacationDelegate: `Ustaw zastępcę na czas urlopu, aby zatwierdzał raporty w Twoim imieniu, gdy jesteś poza biurem.`,
        vacationDelegateError: 'Wystąpił błąd podczas aktualizowania Twojego zastępcy urlopowego.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `jako zastępca urlopowy ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `do ${submittedToName} jako zastępca urlopowy dla ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Przydzielasz ${nameOrEmail} jako swojego zastępcę na czas urlopu. Ta osoba nie jest jeszcze we wszystkich Twoich przestrzeniach roboczych. Jeśli zdecydujesz się kontynuować, do wszystkich administratorów Twoich przestrzeni roboczych zostanie wysłany e‑mail z prośbą o dodanie jej.`,
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
        bankInfo: 'Dane bankowe',
        confirmBankInfo: 'Potwierdź dane bankowe',
        manuallyAdd: 'Ręcznie dodaj swoje konto bankowe',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        accountEnding: 'Konto zakończone cyframi',
        thisBankAccount: 'To konto bankowe będzie używane do płatności firmowych w Twoim workspace',
        accountNumber: 'Numer konta',
        routingNumber: 'Numer rozliczeniowy',
        chooseAnAccountBelow: 'Wybierz konto poniżej',
        addBankAccount: 'Dodaj konto bankowe',
        chooseAnAccount: 'Wybierz konto',
        connectOnlineWithPlaid: 'Zaloguj się do swojego banku',
        connectManually: 'Połącz ręcznie',
        desktopConnection: 'Uwaga: aby połączyć się z Chase, Wells Fargo, Capital One lub Bank of America, kliknij tutaj, aby dokończyć ten proces w przeglądarce.',
        yourDataIsSecure: 'Twoje dane są bezpieczne',
        toGetStarted: 'Dodaj konto bankowe, aby zwracać wydatki, wydawać karty Expensify, pobierać płatności za faktury i opłacać rachunki — wszystko w jednym miejscu.',
        plaidBodyCopy: 'Daj swoim pracownikom prostszy sposób płacenia – i otrzymywania zwrotów – za wydatki firmowe.',
        checkHelpLine: 'Twój numer rozliczeniowy i numer konta znajdziesz na czeku powiązanym z tym kontem.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Aby połączyć konto bankowe, <a href="${contactMethodRoute}">dodaj adres e‑mail jako główny login</a> i spróbuj ponownie. Numer telefonu możesz dodać jako login dodatkowy.`,
        hasBeenThrottledError: 'Wystąpił błąd podczas dodawania Twojego konta bankowego. Poczekaj kilka minut i spróbuj ponownie.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Wygląda na to, że waluta Twojego workspace’u jest ustawiona na inną niż USD. Aby kontynuować, przejdź do <a href="${workspaceRoute}">ustawień swojego workspace’u</a>, ustaw ją na USD i spróbuj ponownie.`,
        bbaAdded: 'Dodano firmowe konto bankowe!',
        bbaAddedDescription: 'Jest gotowe do używania do płatności.',
        error: {
            youNeedToSelectAnOption: 'Wybierz opcję, aby kontynuować',
            noBankAccountAvailable: 'Przepraszamy, brak dostępnego konta bankowego',
            noBankAccountSelected: 'Wybierz konto',
            taxID: 'Wprowadź prawidłowy numer identyfikacji podatkowej',
            website: 'Wprowadź prawidłową stronę internetową',
            zipCode: `Wprowadź prawidłowy kod ZIP w formacie: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Wprowadź prawidłowy numer telefonu',
            email: 'Wprowadź prawidłowy adres e-mail',
            companyName: 'Wprowadź prawidłową nazwę firmy',
            addressCity: 'Wprowadź prawidłowe miasto',
            addressStreet: 'Wpisz prawidłowy adres ulicy',
            addressState: 'Wybierz prawidłowy stan',
            incorporationDateFuture: 'Data rejestracji nie może być w przyszłości',
            incorporationState: 'Wybierz prawidłowy stan',
            industryCode: 'Wprowadź prawidłowy sześciocyfrowy kod klasyfikacji branżowej',
            restrictedBusiness: 'Potwierdź, że firma nie znajduje się na liście działalności objętych ograniczeniami',
            routingNumber: 'Wprowadź prawidłowy numer rozliczeniowy',
            accountNumber: 'Wprowadź prawidłowy numer konta',
            routingAndAccountNumberCannotBeSame: 'Numery rozliczeniowy i konta nie mogą być takie same',
            companyType: 'Wybierz prawidłowy typ firmy',
            tooManyAttempts: 'Ze względu na dużą liczbę prób logowania ta opcja została wyłączona na 24 godziny. Spróbuj ponownie później lub wprowadź dane ręcznie.',
            address: 'Wprowadź prawidłowy adres',
            dob: 'Wybierz prawidłową datę urodzenia',
            age: 'Musisz mieć ponad 18 lat',
            ssnLast4: 'Wpisz prawidłowe ostatnie 4 cyfry numeru SSN',
            firstName: 'Wprowadź prawidłowe imię',
            lastName: 'Wpisz prawidłowe nazwisko',
            noDefaultDepositAccountOrDebitCardAvailable: 'Dodaj domyślne konto depozytowe lub kartę debetową',
            validationAmounts: 'Wprowadzone kwoty weryfikacyjne są nieprawidłowe. Sprawdź wyciąg bankowy i spróbuj ponownie.',
            fullName: 'Wprowadź poprawne imię i nazwisko',
            ownershipPercentage: 'Wprowadź prawidłową wartość procentową',
            deletePaymentBankAccount:
                'To tego konta bankowego nie można usunąć, ponieważ jest używane do płatności kartą Expensify. Jeśli mimo to chcesz usunąć to konto, skontaktuj się z Concierge.',
            sameDepositAndWithdrawalAccount: 'Konto wpłaty i wypłaty jest takie samo.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Gdzie znajduje się Twoje konto bankowe?',
        accountDetailsStepHeader: 'Jakie są dane Twojego konta?',
        accountTypeStepHeader: 'Jakiego typu jest to konto?',
        bankInformationStepHeader: 'Jakie są dane Twojego konta bankowego?',
        accountHolderInformationStepHeader: 'Jakie są dane posiadacza konta?',
        howDoWeProtectYourData: 'Jak chronimy Twoje dane?',
        currencyHeader: 'W jakiej walucie jest Twoje konto bankowe?',
        confirmationStepHeader: 'Sprawdź swoje dane.',
        confirmationStepSubHeader: 'Sprawdź poniższe szczegóły i zaznacz pole z warunkami, aby potwierdzić.',
        toGetStarted: 'Dodaj osobiste konto bankowe, aby otrzymywać zwroty kosztów, opłacać faktury lub włączyć Expensify Wallet.',
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
        passwordRequired: 'Wprowadź hasło',
        passwordIncorrect: 'Nieprawidłowe hasło. Spróbuj ponownie.',
        failedToLoadPDF: 'Nie udało się wczytać pliku PDF',
        pdfPasswordForm: {
            title: 'PDF chroniony hasłem',
            infoText: 'Ten plik PDF jest zabezpieczony hasłem.',
            beforeLinkText: 'Proszę',
            linkText: 'wprowadź hasło',
            afterLinkText: 'aby to wyświetlić.',
            formLabel: 'Wyświetl PDF',
        },
        attachmentNotFound: 'Załącznik nie został znaleziony',
        retry: 'Ponów próbę',
    },
    messages: {
        errorMessageInvalidPhone: `Wprowadź prawidłowy numer telefonu bez nawiasów i myślników. Jeśli jesteś poza USA, dodaj swój kod kraju (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Nieprawidłowy adres e-mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest już członkiem ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest już administratorem ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Kontynuując wniosek o aktywację portfela Expensify, potwierdzasz, że przeczytałeś(-aś), rozumiesz i akceptujesz',
        facialScan: 'Polityka i zgoda na skan twarzy Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>zasady i zgoda na skan twarzy Onfido</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Polityka prywatności</a> oraz <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Warunki korzystania z usługi</a>.</muted-text-micro>`,
        tryAgain: 'Spróbuj ponownie',
        verifyIdentity: 'Zweryfikuj tożsamość',
        letsVerifyIdentity: 'Zweryfikujmy Twoją tożsamość',
        butFirst: `Ale najpierw ta nudna część. Przeczytaj prawniczy żargon w następnym kroku i kliknij „Akceptuję”, gdy będziesz gotowy.`,
        genericError: 'Wystąpił błąd podczas przetwarzania tego kroku. Spróbuj ponownie.',
        cameraPermissionsNotGranted: 'Włącz dostęp do aparatu',
        cameraRequestMessage: 'Potrzebujemy dostępu do aparatu, aby zakończyć weryfikację konta bankowego. Włącz go w Ustawienia > New Expensify.',
        microphonePermissionsNotGranted: 'Włącz dostęp do mikrofonu',
        microphoneRequestMessage: 'Potrzebujemy dostępu do Twojego mikrofonu, aby dokończyć weryfikację konta bankowego. Włącz go w Ustawienia > New Expensify.',
        originalDocumentNeeded: 'Prześlij oryginalne zdjęcie swojego dokumentu tożsamości, a nie zrzut ekranu ani skan.',
        documentNeedsBetterQuality:
            'Wygląda na to, że Twój dokument tożsamości jest uszkodzony lub brakuje mu zabezpieczeń. Prześlij proszę oryginalne zdjęcie nieuszkodzonego dokumentu tożsamości, który będzie w całości widoczny.',
        imageNeedsBetterQuality: 'Wystąpił problem z jakością zdjęcia Twojego dokumentu tożsamości. Prześlij nowe zdjęcie, na którym cały dokument będzie wyraźnie widoczny.',
        selfieIssue: 'Wystąpił problem z Twoim selfie/wideo. Prześlij proszę aktualne selfie/wideo.',
        selfieNotMatching: 'Twoje selfie/wideo nie pasuje do Twojego dokumentu tożsamości. Prześlij nowe selfie/wideo, na którym Twoja twarz będzie wyraźnie widoczna.',
        selfieNotLive: 'Twoje selfie/wideo nie wygląda na wykonane na żywo. Prześlij proszę selfie/wideo wykonane na żywo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dodatkowe szczegóły',
        helpText: 'Musimy potwierdzić poniższe informacje, zanim będziesz mógł przesyłać i otrzymywać pieniądze ze swojego portfela.',
        helpTextIdologyQuestions: 'Musimy zadać Ci jeszcze kilka pytań, aby dokończyć weryfikację Twojej tożsamości.',
        helpLink: 'Dowiedz się, dlaczego jest to potrzebne.',
        legalFirstNameLabel: 'Imię zgodne z dokumentem tożsamości',
        legalMiddleNameLabel: 'Drugie imię (zgodne z dokumentami)',
        legalLastNameLabel: 'Nazwisko rodowe',
        selectAnswer: 'Wybierz odpowiedź, aby kontynuować',
        ssnFull9Error: 'Wprowadź prawidłowy dziewięciocyfrowy numer SSN',
        needSSNFull9: 'Mamy problem ze zweryfikowaniem Twojego numeru SSN. Wprowadź pełne dziewięć cyfr swojego numeru SSN.',
        weCouldNotVerify: 'Nie mogliśmy zweryfikować',
        pleaseFixIt: 'Popraw te informacje, zanim przejdziesz dalej',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Nie udało się zweryfikować Twojej tożsamości. Spróbuj ponownie później lub skontaktuj się z <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, jeśli masz jakieś pytania.`,
    },
    termsStep: {
        headerTitle: 'Warunki i opłaty',
        headerTitleRefactor: 'Opłaty i warunki',
        haveReadAndAgreePlain: 'Przeczytałem(-am) i wyrażam zgodę na otrzymywanie ujawnień w formie elektronicznej.',
        haveReadAndAgree: `Przeczytałem(-am) i zgadzam się na otrzymywanie <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">ujawnień elektronicznych</a>.`,
        agreeToThePlain: 'Zgadzam się na warunki Polityki prywatności i Portfela.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politykę prywatności</a> oraz <a href="${walletAgreementUrl}">Warunki korzystania z portfela</a>.`,
        enablePayments: 'Włącz płatności',
        monthlyFee: 'Miesięczna opłata',
        inactivity: 'Brak aktywności',
        noOverdraftOrCredit: 'Brak funkcji debetu/kredytu.',
        electronicFundsWithdrawal: 'Elektroniczne wypłaty środków',
        standard: 'Standard',
        reviewTheFees: 'Sprawdź niektóre opłaty.',
        checkTheBoxes: 'Zaznacz pola poniżej.',
        agreeToTerms: 'Zaakceptuj warunki, a wszystko będzie gotowe!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Portfel Expensify jest wydawany przez ${walletProgram}.`,
            perPurchase: 'Za zakup',
            atmWithdrawal: 'Wypłata z bankomatu',
            cashReload: 'Doładowanie gotówką',
            inNetwork: 'w sieci',
            outOfNetwork: 'poza siecią',
            atmBalanceInquiry: 'Sprawdzenie salda w bankomacie (w sieci lub poza siecią)',
            customerService: 'Obsługa klienta (automatyczna lub przez konsultanta na żywo)',
            inactivityAfterTwelveMonths: 'Nieaktywność (po 12 miesiącach bez transakcji)',
            weChargeOneFee: 'Pobieramy 1 inny rodzaj opłaty. Jest to:',
            fdicInsurance: 'Twoje środki kwalifikują się do ubezpieczenia FDIC.',
            generalInfo: `Aby uzyskać ogólne informacje o rachunkach przedpłaconych, odwiedź <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Aby zapoznać się ze szczegółami i warunkami wszystkich opłat i usług, odwiedź <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> lub zadzwoń pod numer +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektroniczne obciążenie rachunku (natychmiastowe)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Lista wszystkich opłat za portfel Expensify',
            typeOfFeeHeader: 'Wszystkie opłaty',
            feeAmountHeader: 'Kwota',
            moreDetailsHeader: 'Szczegóły',
            openingAccountTitle: 'Otwarcie konta',
            openingAccountDetails: 'Otwarcie konta jest bezpłatne.',
            monthlyFeeDetails: 'Brak miesięcznej opłaty.',
            customerServiceTitle: 'Obsługa klienta',
            customerServiceDetails: 'Nie ma żadnych opłat za obsługę klienta.',
            inactivityDetails: 'Nie ma opłaty za nieaktywność.',
            sendingFundsTitle: 'Wysyłanie środków do innego posiadacza konta',
            sendingFundsDetails: 'Nie ma opłat za przesyłanie środków do innego posiadacza konta przy użyciu salda, konta bankowego lub karty debetowej.',
            electronicFundsStandardDetails:
                'Przelew środków z Twojego portfela Expensify na konto bankowe przy użyciu standardowej opcji jest bezpłatny. Taki przelew zwykle realizowany jest w ciągu 1–3 dni roboczych.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Przelew środków z portfela Expensify na powiązaną kartę debetową z użyciem opcji szybkiego przelewu wiąże się z opłatą. Taki przelew zwykle kończy się w ciągu kilku minut.' +
                `Opłata wynosi ${percentage}% kwoty przelewu (z minimalną opłatą ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Twoje środki kwalifikują się do ubezpieczenia FDIC. Twoje środki będą przechowywane w instytucji ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} lub przekazane do niej; jest to instytucja ubezpieczona przez FDIC.` +
                `Gdy tam się znajdą, Twoje środki są ubezpieczone do kwoty ${amount} przez FDIC na wypadek, gdyby ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} upadł, pod warunkiem spełnienia określonych wymogów dotyczących ubezpieczenia depozytów oraz zarejestrowania karty. Szczegóły znajdziesz w ${CONST.TERMS.FDIC_PREPAID}.`,
            contactExpensifyPayments: `Skontaktuj się z ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}, dzwoniąc pod numer +1 833-400-0904, wysyłając e-mail na adres ${CONST.EMAIL.CONCIERGE} lub logując się na ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Aby uzyskać ogólne informacje na temat rachunków przedpłaconych, odwiedź ${CONST.TERMS.CFPB_PREPAID}. Jeśli chcesz złożyć skargę dotyczącą rachunku przedpłaconego, zadzwoń do Biura Ochrony Finansowej Konsumentów pod numer 1-855-411-2372 lub odwiedź ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Zobacz wersję przyjazną dla druku',
            automated: 'Zautomatyzowane',
            liveAgent: 'Agent na żywo',
            instant: 'Natychmiastowy',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min. ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Włącz płatności',
        activatedTitle: 'Portfel aktywowany!',
        activatedMessage: 'Gratulacje, Twój portfel jest skonfigurowany i gotowy do wykonywania płatności.',
        checkBackLaterTitle: 'Chwileczkę...',
        checkBackLaterMessage: 'Wciąż sprawdzamy Twoje dane. Sprawdź ponownie później.',
        continueToPayment: 'Przejdź do płatności',
        continueToTransfer: 'Kontynuuj transfer',
    },
    companyStep: {
        headerTitle: 'Informacje o firmie',
        subtitle: 'Prawie gotowe! Ze względów bezpieczeństwa musimy potwierdzić kilka informacji:',
        legalBusinessName: 'Prawna nazwa firmy',
        companyWebsite: 'Strona internetowa firmy',
        taxIDNumber: 'Numer NIP',
        taxIDNumberPlaceholder: '9 cyfr',
        companyType: 'Typ firmy',
        incorporationDate: 'Data rejestracji',
        incorporationState: 'Stan rejestracji',
        industryClassificationCode: 'Kod klasyfikacji branży',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        incorporationDatePlaceholder: 'Data początkowa (rrrr-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Korporacja',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Spółdzielnia',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        industryClassification: 'W jakiej branży jest sklasyfikowana firma?',
        industryClassificationCodePlaceholder: 'Wyszukaj kod klasyfikacji branżowej',
    },
    requestorStep: {
        headerTitle: 'Dane osobowe',
        learnMore: 'Dowiedz się więcej',
        isMyDataSafe: 'Czy moje dane są bezpieczne?',
    },
    personalInfoStep: {
        personalInfo: 'Dane osobowe',
        enterYourLegalFirstAndLast: 'Jak brzmi twoje imię i nazwisko zgodnie z dokumentami?',
        legalFirstName: 'Imię zgodne z dokumentem tożsamości',
        legalLastName: 'Nazwisko rodowe',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        enterYourDateOfBirth: 'Jaka jest twoja data urodzenia?',
        enterTheLast4: 'Jakie są ostatnie cztery cyfry Twojego numeru Social Security?',
        dontWorry: 'Spokojnie, nie sprawdzamy Twojej osobistej zdolności kredytowej!',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        enterYourAddress: 'Jaki jest Twój adres?',
        address: 'Adres',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś(-aś), rozumiesz i akceptujesz',
        whatsYourLegalName: 'Jak brzmi Twoje imię i nazwisko zgodnie z dokumentem tożsamości?',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatsYourSSN: 'Jakie są ostatnie cztery cyfry Twojego numeru Social Security?',
        noPersonalChecks: 'Spokojnie, tutaj nie sprawdzamy historii kredytowej osób prywatnych!',
        whatsYourPhoneNumber: 'Jaki jest Twój numer telefonu?',
        weNeedThisToVerify: 'Potrzebujemy tego, aby zweryfikować Twój portfel.',
    },
    businessInfoStep: {
        businessInfo: 'Informacje o firmie',
        enterTheNameOfYourBusiness: 'Jak nazywa się Twoja firma?',
        businessName: 'Prawna nazwa firmy',
        enterYourCompanyTaxIdNumber: 'Jaki jest numer identyfikacji podatkowej Twojej firmy?',
        taxIDNumber: 'Numer NIP',
        taxIDNumberPlaceholder: '9 cyfr',
        enterYourCompanyWebsite: 'Jaka jest strona internetowa Twojej firmy?',
        companyWebsite: 'Strona internetowa firmy',
        enterYourCompanyPhoneNumber: 'Jaki jest numer telefonu twojej firmy?',
        enterYourCompanyAddress: 'Jaki jest adres Twojej firmy?',
        selectYourCompanyType: 'Jakiego typu jest to firma?',
        companyType: 'Typ firmy',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Korporacja',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Spółdzielnia',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        selectYourCompanyIncorporationDate: 'Jaka jest data rejestracji Twojej firmy?',
        incorporationDate: 'Data rejestracji',
        incorporationDatePlaceholder: 'Data początkowa (rrrr-mm-dd)',
        incorporationState: 'Stan rejestracji',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'W którym stanie została zarejestrowana Twoja firma?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        companyAddress: 'Adres firmy',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        businessInfoTitle: 'Informacje o firmie',
        legalBusinessName: 'Prawna nazwa firmy',
        whatsTheBusinessName: 'Jak nazywa się firma?',
        whatsTheBusinessAddress: 'Jaki jest adres firmowy?',
        whatsTheBusinessContactInformation: 'Jakie są dane kontaktowe firmy?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Jaki jest numer rejestracyjny firmy (CRN)?';
                default:
                    return 'Jaki jest numer rejestracyjny firmy?';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Jaki jest numer identyfikacyjny pracodawcy (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Co to jest numer identyfikacyjny firmy (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Jaki jest numer VAT (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Co to jest Australian Business Number (ABN)?';
                default:
                    return 'Jaki jest numer VAT UE?';
            }
        },
        whatsThisNumber: 'Co to za numer?',
        whereWasTheBusinessIncorporated: 'Gdzie została zarejestrowana firma?',
        whatTypeOfBusinessIsIt: 'Jaki to rodzaj działalności?',
        whatsTheBusinessAnnualPayment: 'Jaki jest roczny wolumen płatności firmy?',
        whatsYourExpectedAverageReimbursements: 'Jaka jest oczekiwana średnia kwota zwrotu kosztów?',
        registrationNumber: 'Numer rejestracyjny',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'NR VAT';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'VAT UE';
            }
        },
        businessAddress: 'Adres firmowy',
        businessType: 'Typ działalności',
        incorporation: 'Rejestracja spółki',
        incorporationCountry: 'Kraj rejestracji',
        incorporationTypeName: 'Forma prawna spółki',
        businessCategory: 'Kategoria firmowa',
        annualPaymentVolume: 'Roczna wartość płatności',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Roczna wartość płatności w ${currencyCode}`,
        averageReimbursementAmount: 'Średnia kwota zwrotu',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Średnia kwota zwrotu w ${currencyCode}`,
        selectIncorporationType: 'Wybierz formę prawną firmy',
        selectBusinessCategory: 'Wybierz kategorię biznesową',
        selectAnnualPaymentVolume: 'Wybierz roczną wartość płatności',
        selectIncorporationCountry: 'Wybierz kraj rejestracji firmy',
        selectIncorporationState: 'Wybierz stan rejestracji',
        selectAverageReimbursement: 'Wybierz średnią kwotę zwrotu',
        selectBusinessType: 'Wybierz typ działalności',
        findIncorporationType: 'Znajdź formę prawną',
        findBusinessCategory: 'Znajdź kategorię firmową',
        findAnnualPaymentVolume: 'Znajdź roczną kwotę płatności',
        findIncorporationState: 'Znajdź stan rejestracji',
        findAverageReimbursement: 'Znajdź średnią kwotę zwrotu',
        findBusinessType: 'Znajdź rodzaj działalności',
        error: {
            registrationNumber: 'Podaj prawidłowy numer rejestracyjny',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Podaj prawidłowy numer identyfikacyjny pracodawcy (EIN)';
                    case CONST.COUNTRY.CA:
                        return 'Podaj prawidłowy numer Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return 'Podaj prawidłowy numer rejestracyjny VAT (VRN)';
                    case CONST.COUNTRY.AU:
                        return 'Podaj prawidłowy Australian Business Number (ABN)';
                    default:
                        return 'Podaj prawidłowy numer VAT UE';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Czy posiadasz 25% lub więcej udziałów w ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Czy którykolwiek z udziałowców posiada 25% lub więcej udziałów w ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Czy są inne osoby, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        companyOwner: 'Właściciel firmy',
        enterLegalFirstAndLastName: 'Jakie jest pełne imię i nazwisko właściciela zgodnie z dokumentami prawnymi?',
        legalFirstName: 'Imię zgodne z dokumentem tożsamości',
        legalLastName: 'Nazwisko rodowe',
        enterTheDateOfBirthOfTheOwner: 'Jaka jest data urodzenia właściciela?',
        enterTheLast4: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        dontWorry: 'Spokojnie, nie sprawdzamy Twojej osobistej zdolności kredytowej!',
        enterTheOwnersAddress: 'Jaki jest adres właściciela?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        address: 'Adres',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś(-aś), rozumiesz i akceptujesz',
        owners: 'Właściciele',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informacje o właścicielu',
        businessOwner: 'Właściciel firmy',
        signerInfo: 'Informacje o podpisującym',
        doYouOwn: (companyName: string) => `Czy posiadasz 25% lub więcej udziałów w ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Czy którykolwiek z udziałowców posiada 25% lub więcej udziałów w ${companyName}?`,
        regulationsRequire: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        legalFirstName: 'Imię zgodne z dokumentem tożsamości',
        legalLastName: 'Nazwisko rodowe',
        whatsTheOwnersName: 'Jakie jest pełne imię i nazwisko właściciela zgodnie z dokumentami prawnymi?',
        whatsYourName: 'Jak brzmi twoje imię i nazwisko zgodnie z dokumentami?',
        whatPercentage: 'Jaki procent firmy należy do właściciela?',
        whatsYoursPercentage: 'Jaki procent firmy posiadasz?',
        ownership: 'Własność',
        whatsTheOwnersDOB: 'Jaka jest data urodzenia właściciela?',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        whatsTheOwnersAddress: 'Jaki jest adres właściciela?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatAreTheLast: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        whatsYourLast: 'Jakie są ostatnie 4 cyfry Twojego numeru Social Security?',
        whatsYourNationality: 'Jaki jest Twój kraj obywatelstwa?',
        whatsTheOwnersNationality: 'Jaki jest kraj obywatelstwa właściciela?',
        countryOfCitizenship: 'Kraj obywatelstwa',
        dontWorry: 'Spokojnie, nie sprawdzamy Twojej osobistej zdolności kredytowej!',
        last4: 'Ostatnie 4 cyfry numeru SSN',
        whyDoWeAsk: 'Dlaczego o to prosimy?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        ownershipPercentage: 'Procent udziałów',
        areThereOther: (companyName: string) => `Czy są inne osoby fizyczne, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        owners: 'Właściciele',
        addCertified: 'Dodaj uwierzytelniony schemat organizacyjny przedstawiający beneficjentów rzeczywistych',
        regulationRequiresChart:
            'Przepisy wymagają od nas zebrania poświadczonej kopii schematu własności, który pokazuje każdą osobę fizyczną lub podmiot posiadający 25% lub więcej udziałów w firmie.',
        uploadEntity: 'Prześlij schemat własności podmiotu',
        noteEntity: 'Uwaga: schemat własności podmiotu musi być podpisany przez Twojego księgowego, doradcę prawnego lub poświadczony notarialnie.',
        certified: 'Poświadczony wykres struktury własności podmiotów',
        selectCountry: 'Wybierz kraj',
        findCountry: 'Znajdź kraj',
        address: 'Adres',
        chooseFile: 'Wybierz plik',
        uploadDocuments: 'Prześlij dodatkową dokumentację',
        pleaseUpload:
            'Prześlij poniżej dodatkową dokumentację, aby pomóc nam zweryfikować Twoją tożsamość jako bezpośredniego lub pośredniego właściciela co najmniej 25% podmiotu gospodarczego.',
        acceptedFiles: 'Akceptowane formaty plików: PDF, PNG, JPEG. Łączny rozmiar plików dla każdej sekcji nie może przekroczyć 5 MB.',
        proofOfBeneficialOwner: 'Potwierdzenie beneficjenta rzeczywistego',
        proofOfBeneficialOwnerDescription:
            'Podaj podpisane oświadczenie oraz schemat organizacyjny od biegłego księgowego, notariusza lub prawnika, potwierdzające posiadanie 25% lub więcej udziałów w firmie. Dokument musi być opatrzony datą z ostatnich trzech miesięcy i zawierać numer licencji osoby podpisującej.',
        copyOfID: 'Kopia dokumentu tożsamości beneficjenta rzeczywistego',
        copyOfIDDescription: 'Przykłady: paszport, prawo jazdy itp.',
        proofOfAddress: 'Potwierdzenie adresu dla beneficjenta rzeczywistego',
        proofOfAddressDescription: 'Przykłady: rachunek za media, umowa najmu itp.',
        codiceFiscale: 'Codice fiscale/Identyfikator podatkowy',
        codiceFiscaleDescription:
            'Prześlij nagranie wideo z wizyty w siedzibie firmy lub z zarejestrowanej rozmowy z osobą uprawnioną do podpisu. Osoba ta musi podać: imię i nazwisko, datę urodzenia, nazwę firmy, numer rejestrowy, numer identyfikacji podatkowej, adres siedziby, rodzaj działalności oraz cel prowadzenia rachunku.',
    },
    completeVerificationStep: {
        completeVerification: 'Zakończ weryfikację',
        confirmAgreements: 'Potwierdź poniższe zgody.',
        certifyTrueAndAccurate: 'Oświadczam, że podane informacje są prawdziwe i dokładne',
        certifyTrueAndAccurateError: 'Potwierdź, że informacje są prawdziwe i dokładne',
        isAuthorizedToUseBankAccount: 'Jestem upoważniony(-a) do korzystania z tego firmowego rachunku bankowego na wydatki służbowe',
        isAuthorizedToUseBankAccountError: 'Musisz być osobą sprawującą kontrolę z upoważnieniem do obsługi firmowego rachunku bankowego',
        termsAndConditions: 'regulamin',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Zweryfikuj swoje konto bankowe',
        validateButtonText: 'Zweryfikuj',
        validationInputLabel: 'Transakcja',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego została wyłączona z powodu zbyt wielu nieprawidłowych prób.',
        description: `W ciągu 1–2 dni roboczych wyślemy na Twoje konto bankowe trzy (3) małe transakcje z nazwą nadawcy podobną do „Expensify, Inc. Validation”.`,
        descriptionCTA: 'Wprowadź kwotę każdej transakcji w poniższych polach. Przykład: 1,51.',
        letsChatText: 'Już prawie gotowe! Potrzebujemy Twojej pomocy, aby zweryfikować jeszcze kilka ostatnich informacji na czacie. Gotowy/-a?',
        enable2FATitle: 'Zabezpiecz się przed oszustwami, włącz uwierzytelnianie dwuskładnikowe (2FA)',
        enable2FAText: 'Poważnie podchodzimy do kwestii bezpieczeństwa. Skonfiguruj teraz uwierzytelnianie dwuskładnikowe (2FA), aby dodać dodatkową warstwę ochrony swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    countryStep: {
        confirmBusinessBank: 'Potwierdź walutę i kraj firmowego konta bankowego',
        confirmCurrency: 'Potwierdź walutę i kraj',
        yourBusiness: 'Waluta firmowego konta bankowego musi być taka sama jak waluta Twojego miejsca pracy.',
        youCanChange: 'Możesz zmienić walutę swojego workspace’u w swoim',
        findCountry: 'Znajdź kraj',
        selectCountry: 'Wybierz kraj',
    },
    bankInfoStep: {
        whatAreYour: 'Jakie są dane Twojego firmowego konta bankowego?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda w porządku.',
        thisBankAccount: 'To konto bankowe będzie używane do płatności firmowych w Twoim workspace',
        accountNumber: 'Numer konta',
        accountHolderNameDescription: 'Imię i nazwisko upoważnionego podpisującego',
    },
    signerInfoStep: {
        signerInfo: 'Informacje o podpisującym',
        areYouDirector: (companyName: string) => `Czy jesteś dyrektorem w firmie ${companyName}?`,
        regulationRequiresUs: 'Przepisy wymagają od nas zweryfikowania, czy osoba podpisująca ma uprawnienia do podjęcia tej czynności w imieniu firmy.',
        whatsYourName: 'Jak brzmi Twoje imię i nazwisko zgodnie z dokumentami',
        fullName: 'Imię i nazwisko (pełne)',
        whatsYourJobTitle: 'Jakie jest Twoje stanowisko?',
        jobTitle: 'Stanowisko',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        uploadID: 'Prześlij dokument tożsamości i potwierdzenie adresu',
        personalAddress: 'Potwierdzenie adresu zamieszkania (np. rachunek za media)',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        proofOf: 'Potwierdzenie adresu zamieszkania',
        enterOneEmail: (companyName: string) => `Wpisz adres e-mail dyrektora w firmie ${companyName}`,
        regulationRequiresOneMoreDirector: 'Przepisy wymagają co najmniej jeszcze jednego dyrektora jako sygnatariusza.',
        hangTight: 'Chwileczkę…',
        enterTwoEmails: (companyName: string) => `Wpisz adresy e-mail dwóch dyrektorów w firmie ${companyName}`,
        sendReminder: 'Wyślij przypomnienie',
        chooseFile: 'Wybierz plik',
        weAreWaiting: 'Czekamy, aż inne osoby potwierdzą swoją tożsamość jako dyrektorzy firmy.',
        id: 'Kopia dokumentu tożsamości',
        proofOfDirectors: 'Potwierdzenie dyrektora/dyrektorów',
        proofOfDirectorsDescription: 'Przykłady: profil korporacyjny Oncorp lub rejestracja działalności.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale dla sygnatariuszy, upoważnionych użytkowników i beneficjentów rzeczywistych.',
        PDSandFSG: 'Dokumenty ujawnieniowe PDS i FSG',
        PDSandFSGDescription: dedent(`
            Nasze partnerstwo z Corpay wykorzystuje połączenie API, aby skorzystać z ich rozległej sieci międzynarodowych partnerów bankowych do obsługi globalnych zwrotów w Expensify. Zgodnie z australijskimi przepisami udostępniamy Ci Przewodnik po usługach finansowych (FSG) oraz Dokument ujawniający informacje o produkcie (PDS) firmy Corpay.

            Przeczytaj uważnie dokumenty FSG i PDS, ponieważ zawierają one pełne informacje oraz ważne szczegóły dotyczące produktów i usług oferowanych przez Corpay. Zachowaj te dokumenty na przyszłość.
        `),
        pleaseUpload: 'Prześlij poniżej dodatkowe dokumenty, aby pomóc nam zweryfikować Twoją tożsamość jako dyrektora firmy.',
        enterSignerInfo: 'Wprowadź dane sygnatariusza',
        thisStep: 'Ten krok został ukończony',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `łączy firmowe konto bankowe w ${currency} z numerem kończącym się na ${bankAccountLastFour} z Expensify, aby wypłacać wynagrodzenia pracownikom w ${currency}. Następny krok wymaga danych sygnatariusza będącego dyrektorem.`,
        error: {
            emailsMustBeDifferent: 'Adresy e-mail muszą być różne',
        },
    },
    agreementsStep: {
        agreements: 'Umowy',
        pleaseConfirm: 'Potwierdź poniższe zgody',
        regulationRequiresUs: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        iAmAuthorized: 'Mam upoważnienie do korzystania z firmowego konta bankowego na wydatki służbowe.',
        iCertify: 'Oświadczam, że podane informacje są prawdziwe i dokładne.',
        iAcceptTheTermsAndConditions: `Akceptuję <a href="https://cross-border.corpay.com/tc/">warunki i zasady</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Akceptuję warunki.',
        accept: 'Zaakceptuj i dodaj konto bankowe',
        iConsentToThePrivacyNotice: 'Wyrażam zgodę na <a href="https://payments.corpay.com/compliance">informację o ochronie prywatności</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Wyrażam zgodę na informację o ochronie prywatności.',
        error: {
            authorized: 'Musisz być osobą sprawującą kontrolę z upoważnieniem do obsługi firmowego rachunku bankowego',
            certify: 'Potwierdź, że informacje są prawdziwe i dokładne',
            consent: 'Wyraź zgodę na informację o prywatności',
        },
    },
    docusignStep: {
        subheader: 'Formularz DocuSign',
        pleaseComplete:
            'Wypełnij formularz autoryzacji ACH za pomocą poniższego linku DocuSign, a następnie prześlij tutaj podpisaną kopię, abyśmy mogli pobierać środki bezpośrednio z Twojego konta bankowego',
        pleaseCompleteTheBusinessAccount: 'Proszę wypełnić wniosek o rachunek firmowy dotyczący polecenia zapłaty',
        pleaseCompleteTheDirect:
            'Prosimy o wypełnienie ustalenia dotyczącego polecenia zapłaty za pomocą linku DocuSign poniżej, a następnie przesłanie tutaj podpisanej kopii, abyśmy mogli pobierać środki bezpośrednio z Twojego konta bankowego.',
        takeMeTo: 'Przejdź do DocuSign',
        uploadAdditional: 'Prześlij dodatkową dokumentację',
        pleaseUpload: 'Prześlij formularz DEFT i stronę z podpisem DocuSign',
        pleaseUploadTheDirect: 'Prześlij proszę Uzgodnienia dotyczące polecenia zapłaty oraz stronę z podpisem DocuSign',
    },
    finishStep: {
        letsFinish: 'Dokończmy to na czacie!',
        thanksFor:
            'Dziękujemy za te informacje. Dedykowany agent wsparcia przejrzy teraz Twoje dane. Skontaktujemy się z Tobą, jeśli będziemy potrzebować czegoś więcej, ale w międzyczasie możesz śmiało pisać do nas z wszelkimi pytaniami.',
        iHaveA: 'Mam pytanie',
        enable2FA: 'Włącz uwierzytelnianie dwuskładnikowe (2FA), aby zapobiegać oszustwom',
        weTake: 'Poważnie podchodzimy do kwestii bezpieczeństwa. Skonfiguruj teraz uwierzytelnianie dwuskładnikowe (2FA), aby dodać dodatkową warstwę ochrony swojego konta.',
        secure: 'Zabezpiecz swoje konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Chwileczkę',
        explanationLine: 'Sprawdzamy Twoje informacje. Wkrótce będziesz mógł/mogła przejść do kolejnych kroków.',
    },
    session: {
        offlineMessageRetry: 'Wygląda na to, że jesteś offline. Sprawdź swoje połączenie i spróbuj ponownie.',
    },
    travel: {
        header: 'Zarezerwuj podróż',
        title: 'Podróżuj mądrze',
        subtitle: 'Użyj Expensify Travel, aby uzyskać najlepsze oferty podróży i zarządzać wszystkimi wydatkami służbowymi w jednym miejscu.',
        features: {
            saveMoney: 'Oszczędzaj pieniądze na swoich rezerwacjach',
            alerts: 'Otrzymuj powiadomienia w czasie rzeczywistym, gdy Twoje plany podróży się zmienią',
        },
        bookTravel: 'Zarezerwuj podróż',
        bookDemo: 'Umów demo',
        bookADemo: 'Zarezerwuj demo',
        toLearnMore: 'aby dowiedzieć się więcej.',
        termsAndConditions: {
            header: 'Zanim przejdziemy dalej...',
            title: 'Regulamin i warunki',
            label: 'Akceptuję regulamin i warunki',
            subtitle: `Zgadzam się na <a href="${CONST.TRAVEL_TERMS_URL}">warunki korzystania z usługi Expensify Travel</a>.`,
            error: 'Aby kontynuować, musisz zaakceptować regulamin Expensify Travel',
            defaultWorkspaceError:
                'Musisz ustawić domyślne środowisko pracy, aby włączyć Expensify Travel. Przejdź do Ustawienia > Środowiska pracy > kliknij trzy pionowe kropki obok środowiska pracy > Ustaw jako domyślne środowisko pracy, a następnie spróbuj ponownie!',
        },
        flight: 'Lot',
        flightDetails: {
            passenger: 'Pasażer',
            layover: (layover: string) => `<muted-text-label>Masz <strong>${layover} międzylądowanie</strong> przed tym lotem</muted-text-label>`,
            takeOff: 'Odlot',
            landing: 'Strona główna',
            seat: 'Miejsce',
            class: 'Klasa kabiny',
            recordLocator: 'Kod rezerwacji',
            cabinClasses: {
                unknown: 'Nieznane',
                economy: 'Ekonomia',
                premiumEconomy: 'Premium Economy',
                business: 'Firma',
                first: 'Pierwszy',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Gość',
            checkIn: 'Zameldowanie',
            checkOut: 'Wymeldowanie',
            roomType: 'Typ pokoju',
            cancellation: 'Zasady anulowania',
            cancellationUntil: 'Bezpłatne anulowanie do',
            confirmation: 'Numer potwierdzenia',
            cancellationPolicies: {
                unknown: 'Nieznane',
                nonRefundable: 'Bezzwrotne',
                freeCancellationUntil: 'Bezpłatne anulowanie do',
                partiallyRefundable: 'Częściowo podlegający zwrotowi',
            },
        },
        car: 'Samochód',
        carDetails: {
            rentalCar: 'Wypożyczenie samochodu',
            pickUp: 'Odbiór',
            dropOff: 'Miejsce zwrotu',
            driver: 'Kierowca',
            carType: 'Typ samochodu',
            cancellation: 'Zasady anulowania',
            cancellationUntil: 'Bezpłatne anulowanie do',
            freeCancellation: 'Bezpłatne anulowanie',
            confirmation: 'Numer potwierdzenia',
        },
        train: 'Szyna',
        trainDetails: {
            passenger: 'Pasażer',
            departs: 'Odjazd',
            arrives: 'Przybywa',
            coachNumber: 'Numer wagonu',
            seat: 'Miejsce',
            fareDetails: 'Szczegóły taryfy',
            confirmation: 'Numer potwierdzenia',
        },
        viewTrip: 'Zobacz podróż',
        modifyTrip: 'Zmień podróż',
        tripSupport: 'Wsparcie podróży',
        tripDetails: 'Szczegóły podróży',
        viewTripDetails: 'Zobacz szczegóły podróży',
        trip: 'Podróż',
        trips: 'Podróże',
        tripSummary: 'Podsumowanie podróży',
        departs: 'Odjazd',
        errorMessage: 'Coś poszło nie tak. Spróbuj ponownie później.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Aby zarezerwować podróż, <a href="${phoneErrorMethodsRoute}">dodaj służbowy adres e-mail jako swój główny login</a>.</rbr>`,
        domainSelector: {
            title: 'Domena',
            subtitle: 'Wybierz domenę do konfiguracji Expensify Travel.',
            recommended: 'Polecane',
        },
        domainPermissionInfo: {
            title: 'Domena',
            restriction: (domain: string) =>
                `Nie masz uprawnień, aby włączyć Expensify Travel dla domeny <strong>${domain}</strong>. Musisz poprosić kogoś z tej domeny, aby zamiast tego włączył usługę Travel.`,
            accountantInvitation: `Jeśli jesteś księgowym, rozważ dołączenie do programu <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! dla księgowych</a>, aby włączyć podróże dla tej domeny.`,
        },
        publicDomainError: {
            title: 'Rozpocznij korzystanie z Expensify Travel',
            message: `Musisz użyć służbowego adresu e-mail (np. name@company.com) z Expensify Travel, a nie prywatnego (np. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel zostało wyłączone',
            message: `Administrator wyłączył Expensify Travel. Postępuj zgodnie z firmową polityką rezerwacji przy organizowaniu podróży.`,
        },
        verifyCompany: {
            title: 'Przeglądamy Twoje zgłoszenie...',
            message: `Po naszej stronie wykonujemy kilka sprawdzeń, aby upewnić się, że Twoje konto jest gotowe na Expensify Travel. Wkrótce się z Tobą skontaktujemy!`,
            confirmText: 'Rozumiem',
            conciergeMessage: ({domain}: {domain: string}) => `Włączenie podróży nie powiodło się dla domeny: ${domain}. Sprawdź i włącz podróże dla tej domeny.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zarezerwowany. Kod potwierdzenia: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój bilet na lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został unieważniony.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój bilet na lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zrefundowany lub wymieniony.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate}} został odwołany przez linię lotniczą.`,
            flightScheduleChangePending: (airlineCode: string) => `Linie lotnicze zaproponowały zmianę rozkładu lotu ${airlineCode}; oczekujemy na potwierdzenie.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Zmiana rozkładu potwierdzona: lot ${airlineCode} odlatuje teraz o ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zaktualizowany.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Twoja klasa podróży została zaktualizowana na ${cabinClass} w locie ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Przydział miejsca na lot ${airlineCode} został potwierdzony.`,
            flightSeatChanged: (airlineCode: string) => `Twoje miejsce w samolocie linii ${airlineCode} zostało zmienione.`,
            flightSeatCancelled: (airlineCode: string) => `Przydział Twojego miejsca na locie ${airlineCode} został usunięty.`,
            paymentDeclined: 'Płatność za rezerwację lotu nie powiodła się. Spróbuj ponownie.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Anulowano Twoją rezerwację typu ${type} o numerze ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Dostawca anulował Twoją rezerwację typu ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Twoja rezerwacja typu ${type} została ponownie zarezerwowana. Nowy numer potwierdzenia: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Twoja rezerwacja typu ${type} została zaktualizowana. Sprawdź nowe szczegóły w planie podróży.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Twój bilet kolejowy z ${origin} → ${destination} na ${startDate} został zwrócony. Środki zostaną zaksięgowane jako kredyt.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Twój bilet kolejowy z ${origin} do ${destination} na ${startDate} został wymieniony.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Twój bilet kolejowy z ${origin} → ${destination} na ${startDate} został zaktualizowany.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Twoja rezerwacja (${type}) została zaktualizowana.`,
        },
        flightTo: 'Lot do',
        trainTo: 'Pociąg do',
        carRental: 'wynajem samochodu',
        nightIn: 'nocleg w',
        nightsIn: 'noce w',
    },
    workspace: {
        common: {
            card: 'Karty',
            expensifyCard: 'Karta Expensify',
            companyCards: 'Firmowe karty',
            workflows: 'Przepływy pracy',
            workspace: 'Przestrzeń robocza',
            findWorkspace: 'Znajdź przestrzeń roboczą',
            edit: 'Edytuj przestrzeń roboczą',
            enabled: 'Włączone',
            disabled: 'Wyłączone',
            everyone: 'Wszyscy',
            delete: 'Usuń przestrzeń roboczą',
            settings: 'Ustawienia',
            reimburse: 'Zwroty kosztów',
            categories: 'Kategorie',
            tags: 'Tagi',
            customField1: 'Pole niestandardowe 1',
            customField2: 'Niestandardowe pole 2',
            customFieldHint: 'Dodaj niestandardowe kodowanie, które będzie stosowane do wszystkich wydatków tego członka.',
            reports: 'Raporty',
            reportFields: 'Pola raportu',
            reportTitle: 'Tytuł raportu',
            reportField: 'Pole raportu',
            taxes: 'Podatki',
            bills: 'Rachunki',
            invoices: 'Faktury',
            perDiem: 'Dieta',
            travel: 'Podróże',
            members: 'Członkowie',
            accounting: 'Księgowość',
            receiptPartners: 'Partnerzy paragonów',
            rules: 'Zasady',
            displayedAs: 'Wyświetlane jako',
            plan: 'Plan',
            profile: 'Przegląd',
            bankAccount: 'Konto bankowe',
            testTransactions: 'Testowe transakcje',
            issueAndManageCards: 'Wydawaj i zarządzaj kartami',
            reconcileCards: 'Uzgadnianie kart',
            selectAll: 'Zaznacz wszystko',
            selected: () => ({
                one: 'Wybrano 1',
                other: (count: number) => `Wybrano: ${count}`,
            }),
            settlementFrequency: 'Częstotliwość rozliczeń',
            setAsDefault: 'Ustaw jako domyślne miejsce pracy',
            defaultNote: `Paragony wysłane na adres ${CONST.EMAIL.RECEIPTS} pojawią się w tym obszarze roboczym.`,
            deleteConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą?',
            deleteWithCardsConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą? Spowoduje to usunięcie wszystkich strumieni kart i przypisanych kart.',
            unavailable: 'Niedostępne miejsce pracy',
            memberNotFound: 'Nie znaleziono członka. Aby zaprosić nową osobę do przestrzeni roboczej, użyj przycisku zapraszania powyżej.',
            notAuthorized: `Nie masz dostępu do tej strony. Jeśli próbujesz dołączyć do tego obszaru roboczego, poproś właściciela obszaru roboczego, aby dodał Cię jako członka. Coś innego? Skontaktuj się z ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Przejdź do przestrzeni roboczej',
            duplicateWorkspace: 'Zduplikuj przestrzeń roboczą',
            duplicateWorkspacePrefix: 'Duplikuj',
            goToWorkspaces: 'Przejdź do przestrzeni roboczych',
            clearFilter: 'Wyczyść filtr',
            workspaceName: 'Nazwa przestrzeni roboczej',
            workspaceOwner: 'Właściciel',
            workspaceType: 'Typ przestrzeni roboczej',
            workspaceAvatar: 'Awatar przestrzeni roboczej',
            mustBeOnlineToViewMembers: 'Musisz być online, aby wyświetlić członków tego obszaru roboczego.',
            moreFeatures: 'Więcej funkcji',
            requested: 'Żądano',
            distanceRates: 'Stawki za odległość',
            defaultDescription: 'Jedno miejsce na wszystkie Twoje paragony i wydatki.',
            descriptionHint: 'Udostępnij informacje o tym obszarze roboczym wszystkim członkom.',
            welcomeNote: 'Prosimy o przesyłanie paragonów do zwrotu kosztów za pomocą Expensify, dziękujemy!',
            subscription: 'Subskrypcja',
            markAsEntered: 'Oznacz jako wprowadzone ręcznie',
            markAsExported: 'Oznacz jako wyeksportowane',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Eksportuj do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
            lineItemLevel: 'Poziom pozycji liniowej',
            reportLevel: 'Poziom raportu',
            topLevel: 'Najwyższy poziom',
            appliedOnExport: 'Nie zaimportowano do Expensify, zastosowano przy eksporcie',
            shareNote: {
                header: 'Udostępnij swój workspace innym członkom',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Udostępnij ten kod QR lub skopiuj poniższy link, aby ułatwić członkom proszenie o dostęp do Twojej przestrzeni roboczej. Wszystkie prośby o dołączenie do przestrzeni roboczej pojawią się w pokoju <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> do Twojej weryfikacji.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Połącz z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Utwórz nowe połączenie',
            reuseExistingConnection: 'Użyj istniejącego połączenia',
            existingConnections: 'Istniejące połączenia',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Ponieważ wcześniej połączono już z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, możesz ponownie użyć istniejącego połączenia lub utworzyć nowe.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} – Ostatnia synchronizacja: ${formattedDate}`,
            authenticationError: (connectionName: string) => `Nie można połączyć się z ${connectionName} z powodu błędu uwierzytelniania.`,
            learnMore: 'Dowiedz się więcej',
            memberAlternateText: 'Przesyłaj i zatwierdzaj raporty.',
            adminAlternateText: 'Zarządzaj raportami i ustawieniami przestrzeni roboczej.',
            auditorAlternateText: 'Przeglądaj i komentuj raporty.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Administrator';
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
                weekly: 'Co tydzień',
                semimonthly: 'Dwa razy w miesiącu',
                monthly: 'Miesięcznie',
            },
            planType: 'Typ planu',
            youCantDowngradeInvoicing:
                'Nie możesz zmienić planu na tańszy w przypadku subskrypcji rozliczanej fakturą. Aby omówić lub wprowadzić zmiany w swojej subskrypcji, skontaktuj się z opiekunem konta lub z Concierge, aby uzyskać pomoc.',
            defaultCategory: 'Domyślna kategoria',
            viewTransactions: 'Wyświetl transakcje',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Wydatki ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Transakcje kartą Expensify będą automatycznie eksportowane do „konta zobowiązań karty Expensify” utworzonego za pomocą <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">naszej integracji</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Połączono z ${organizationName}` : 'Automatyzuj wydatki na podróże i dostawę posiłków w całej organizacji.',
                sendInvites: 'Wyślij zaproszenia',
                sendInvitesDescription: 'Ci członkowie przestrzeni roboczej nie mają jeszcze konta Uber for Business. Odznacz tych członków, których nie chcesz teraz zapraszać.',
                confirmInvite: 'Potwierdź zaproszenie',
                manageInvites: 'Zarządzaj zaproszeniami',
                confirm: 'Potwierdź',
                allSet: 'Wszystko gotowe',
                readyToRoll: 'Wszystko gotowe',
                takeBusinessRideMessage: 'Weź przejazd służbowy, a Twoje rachunki z Ubera zostaną zaimportowane do Expensify. Ruszaj!',
                all: 'Wszystko',
                linked: 'Połączono',
                outstanding: 'Nierozliczone',
                status: {
                    resend: 'Wyślij ponownie',
                    invite: 'Zaproś',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Połączono',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Oczekujące',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Zawieszone',
                },
                centralBillingAccount: 'Centralne konto rozliczeniowe',
                centralBillingDescription: 'Wybierz miejsce importu wszystkich paragonów z Ubera.',
                invitationFailure: 'Nie udało się zaprosić członka do Uber for Business',
                autoInvite: 'Zaproś nowych członków przestrzeni roboczej do Uber for Business',
                autoRemove: 'Dezaktywuj usuniętych członków przestrzeni roboczej w Uber for Business',
                emptyContent: {
                    title: 'Brak oczekujących zaproszeń',
                    subtitle: 'Hurra! Szukaliśmy wszędzie i nie znaleźliśmy żadnych oczekujących zaproszeń.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Ustaw stawki diet, aby kontrolować dzienne wydatki pracowników. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Dowiedz się więcej</a>.</muted-text>`,
            amount: 'Kwota',
            deleteRates: () => ({
                one: 'Usuń stawkę',
                other: 'Usuń stawki',
            }),
            deletePerDiemRate: 'Usuń stawkę ryczałtową',
            findPerDiemRate: 'Znajdź stawkę dzienną',
            areYouSureDelete: () => ({
                one: 'Czy na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }),
            emptyList: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki diet, aby kontrolować dzienne wydatki pracowników. Zaimportuj stawki z arkusza kalkulacyjnego, aby rozpocząć.',
            },
            importPerDiemRates: 'Zaimportuj stawki diet',
            editPerDiemRate: 'Edytuj stawkę ryczałtową',
            editPerDiemRates: 'Edytuj stawki ryczałtowe',
            editDestinationSubtitle: (destination: string) => `Zaktualizowanie tego miejsca docelowego spowoduje zmianę we wszystkich podstawkach diet dla ${destination}.`,
            editCurrencySubtitle: (destination: string) => `Zaktualizowanie tej waluty zmieni ją dla wszystkich podstawek diet ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportu wydatków z własnej kieszeni do QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Oznacz czeki jako „do wydruku później”',
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do QuickBooks Desktop.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje karty Expensify jako',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie księgować zapisy w dzienniku.',
            accountsPayable: 'Zobowiązania z tytułu zobowiązań wobec dostawców',
            accountsPayableDescription: 'Wybierz miejsce tworzenia rachunków od dostawców.',
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
                        description: 'Data wyeksportowania raportu do QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data przesłania',
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            exportCheckDescription: 'Utworzymy wyszczególniony czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy zapis w dzienniku dla każdego raportu Expensify i zaksięgujemy go na koncie poniżej.',
            exportVendorBillDescription:
                'Utworzymy pozycjonowaną fakturę od dostawcy dla każdego raportu Expensify i dodamy ją do poniższego konta. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop nie obsługuje podatków w eksportach zapisów w dzienniku. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Zapisy księgowe są niedostępne, gdy włączone są podatki. Wybierz inną opcję eksportu.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Polecenie księgowania',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawdź',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Utworzymy wyszczególniony czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą kredytową do odpowiednich dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Credit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy zindywidualizowaną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji z karty kredytowej.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wybierz dostawcę, którego zastosować do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wybierz, skąd wysyłać czeki.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Rachunki od dostawców są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Zapisy księgowe są niedostępne, gdy włączone są podatki. Wybierz inną opcję eksportu.',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Desktop i ponownie zsynchronizuj połączenie',
            qbdSetup: 'Konfiguracja QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Nie można połączyć się z tego urządzenia',
                body1: 'Musisz skonfigurować to połączenie z komputera, na którym znajduje się plik firmy QuickBooks Desktop.',
                body2: 'Po połączeniu będziesz mógł synchronizować i eksportować z dowolnego miejsca.',
            },
            setupPage: {
                title: 'Otwórz ten link, aby się połączyć',
                body: 'Aby zakończyć konfigurację, otwórz poniższy link na komputerze, na którym działa QuickBooks Desktop.',
                setupErrorTitle: 'Coś poszło nie tak',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>Połączenie z QuickBooks Desktop nie działa w tej chwili. Spróbuj ponownie później lub <a href="${conciergeLink}">skontaktuj się z Concierge</a>, jeśli problem będzie się powtarzał.</centered-text></muted-text>`,
            },
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z QuickBooks Desktop do Expensify.',
            classes: 'Klasy',
            items: 'Pozycje',
            customers: 'Klienci/projekty',
            exportCompanyCardsDescription: 'Ustaw sposób eksportu zakupów z kart firmowych do QuickBooks Desktop.',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który zostanie zastosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            accountsDescription: 'Twój plan kont z QuickBooks Desktop zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz sposób obsługi klas QuickBooks Desktop w Expensify.',
            tagsDisplayedAsDescription: 'Poziom pozycji linii',
            reportFieldsDisplayedAsDescription: 'Poziom raportu',
            customersDescription: 'Wybierz sposób obsługi klientów/projektów QuickBooks Desktop w Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie codziennie automatycznie synchronizować się z QuickBooks Desktop.',
                createEntities: 'Automatycznie twórz jednostki',
                createEntitiesDescription: 'Expensify automatycznie utworzy dostawców w QuickBooks Desktop, jeśli jeszcze nie istnieją.',
            },
            itemsDescription: 'Wybierz sposób obsługi elementów QuickBooks Desktop w Expensify.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy wyeksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriałów',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ich opłaceniu',
                },
            },
        },
        qbo: {
            connectedTo: 'Połączono z',
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z QuickBooks Online do Expensify.',
            classes: 'Klasy',
            locations: 'Lokalizacje',
            customers: 'Klienci/projekty',
            accountsDescription: 'Plan kont z QuickBooks Online zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz sposób obsługi klas QuickBooks Online w Expensify.',
            customersDescription: 'Wybierz, jak obsługiwać klientów/projekty QuickBooks Online w Expensify.',
            locationsDescription: 'Wybierz, jak obsługiwać lokalizacje QuickBooks Online w Expensify.',
            taxesDescription: 'Wybierz sposób obsługi podatków QuickBooks Online w Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online nie obsługuje lokalizacji na poziomie pozycji dla czeków ani rachunków dostawców. Jeśli chcesz mieć lokalizacje na poziomie pozycji, upewnij się, że używasz zapisów księgowych (Journal Entries) oraz wydatków kartą kredytową/debetową.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online nie obsługuje podatków w zapisach dziennika. Zmień proszę opcję eksportu na rachunek od dostawcy lub czek.',
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do QuickBooks Online.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje karty Expensify jako',
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
                        description: 'Data wyeksportowania raportu do QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data przesłania',
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            receivable: 'Należności z tytułu dostaw i usług',
            archive: 'Archiwum należności',
            exportInvoicesDescription: 'Użyj tego konta podczas eksportowania faktur do QuickBooks Online.',
            exportCompanyCardsDescription: 'Ustaw sposób eksportu zakupów z kart służbowych do QuickBooks Online.',
            vendor: 'Dostawca',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który zostanie zastosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportu wydatków z własnej kieszeni do QuickBooks Online.',
            exportCheckDescription: 'Utworzymy wyszczególniony czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy zapis w dzienniku dla każdego raportu Expensify i zaksięgujemy go na koncie poniżej.',
            exportVendorBillDescription:
                'Utworzymy pozycjonowaną fakturę od dostawcy dla każdego raportu Expensify i dodamy ją do poniższego konta. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie księgować zapisy w dzienniku.',
            accountsPayable: 'Zobowiązania z tytułu zobowiązań wobec dostawców',
            accountsPayableDescription: 'Wybierz miejsce tworzenia rachunków od dostawców.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nieskonfigurowane',
            bankAccountDescription: 'Wybierz, skąd wysyłać czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online nie obsługuje lokalizacji w eksporcie rachunków od dostawców. Ponieważ w Twoim obszarze roboczym są włączone lokalizacje, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online nie obsługuje podatków przy eksporcie zapisów w dzienniku. Ponieważ masz włączone podatki w swoim przestrzeni roboczej, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Zapisy księgowe są niedostępne, gdy włączone są podatki. Wybierz inną opcję eksportu.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z QuickBooks Online każdego dnia.',
                inviteEmployees: 'Zaproś pracowników',
                inviteEmployeesDescription: 'Zaimportuj dane pracowników z QuickBooks Online i zaproś pracowników do tego workspace’a.',
                createEntities: 'Automatycznie twórz jednostki',
                createEntitiesDescription:
                    'Expensify automatycznie utworzy dostawców w QuickBooks Online, jeśli jeszcze nie istnieją, oraz automatycznie utworzy klientów podczas eksportowania faktur.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na koncie QuickBooks Online poniżej.',
                qboBillPaymentAccount: 'Konto zapłaty rachunków QuickBooks',
                qboInvoiceCollectionAccount: 'Konto windykacji faktur QuickBooks',
                accountSelectDescription: 'Wybierz, z którego konta chcesz opłacać rachunki, a my utworzymy płatność w QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie mają trafiać płatności faktur, a my utworzymy płatność w QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Karta debetowa',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Polecenie księgowania',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawdź',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą debetową do odpowiadających jej dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Debit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą kredytową do odpowiednich dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Credit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy zindywidualizowaną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji z karty debetowej.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji z karty kredytowej.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wybierz dostawcę, którego zastosować do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Rachunki od dostawców są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Zapisy księgowe są niedostępne, gdy włączone są podatki. Wybierz inną opcję eksportu.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wybierz prawidłowe konto do eksportu rachunku dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wybierz prawidłowe konto do eksportu zapisu w dzienniku',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wybierz prawidłowe konto do eksportu czeków',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Aby korzystać z eksportu rachunków od dostawców, skonfiguruj konto zobowiązań w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Aby użyć eksportu zapisów w dzienniku, skonfiguruj konto dziennika w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Aby korzystać z eksportu czeków, skonfiguruj konto bankowe w QuickBooks Online',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Online i zsynchronizuj połączenie ponownie.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy wyeksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriałów',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ich opłaceniu',
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
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia ich wydatków.',
            trackingCategories: 'Kategorie śledzenia',
            trackingCategoriesDescription: 'Wybierz, jak obsługiwać kategorie śledzenia Xero w Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `Mapuj Xero ${categoryName} na`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Wybierz, gdzie mapować ${categoryName} podczas eksportu do Xero.`,
            customers: 'Ponownie obciąż klientów',
            customersDescription:
                'Wybierz, czy ponownie obciążać klientów w Expensify. Kontakty klientów z Xero mogą być przypisywane do wydatków i zostaną wyeksportowane do Xero jako faktury sprzedaży.',
            taxesDescription: 'Wybierz sposób obsługi podatków Xero w Expensify.',
            notImported: 'Nie zaimportowano',
            notConfigured: 'Nieskonfigurowane',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Domyślny kontakt Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tagi',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Pola raportu',
            },
            exportDescription: 'Skonfiguruj sposób eksportowania danych z Expensify do Xero.',
            purchaseBill: 'Rachunek zakupu',
            exportDeepDiveCompanyCard:
                'Wyeksportowane wydatki zostaną zaksięgowane jako transakcje bankowe na poniższym koncie bankowym Xero, a daty transakcji będą zgodne z datami na wyciągu bankowym.',
            bankTransactions: 'Transakcje bankowe',
            xeroBankAccount: 'Konto bankowe Xero',
            xeroBankAccountDescription: 'Wybierz, gdzie wydatki będą księgowane jako transakcje bankowe.',
            exportExpensesDescription: 'Raporty zostaną wyeksportowane jako rachunek zakupu z datą i statusem wybranymi poniżej.',
            purchaseBillDate: 'Data zakupu faktury',
            exportInvoices: 'Eksportuj faktury jako',
            salesInvoice: 'Faktura sprzedaży',
            exportInvoicesDescription: 'Na fakturach sprzedażowych zawsze widoczna jest data wysłania faktury.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Xero każdego dnia.',
                purchaseBillStatusTitle: 'Status rachunku zakupu',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Xero.',
                xeroBillPaymentAccount: 'Konto płatności rachunków Xero',
                xeroInvoiceCollectionAccount: 'Konto windykacji faktur Xero',
                xeroBillPaymentAccountDescription: 'Wybierz, z jakiego konta chcesz opłacać rachunki, a my utworzymy płatność w Xero.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie mają trafiać płatności za faktury, a my utworzymy płatność w Xero.',
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
                        description: 'Data wyeksportowania raportu do Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data przesłania',
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status rachunku zakupu',
                description: 'Użyj tego statusu podczas eksportowania rachunków zakupowych do Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Wersja robocza',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Oczekuje na zatwierdzenie',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Oczekuje na płatność',
                },
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w Xero i zsynchronizuj połączenie ponownie',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy wyeksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriałów',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ich opłaceniu',
                },
            },
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
                        description: 'Data wyeksportowania raportu do Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data przesłania',
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Ustaw sposób eksportu wydatków z własnej kieszeni do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Raporty wydatków',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Rachunki od dostawców',
                },
            },
            nonReimbursableExpenses: {
                description: 'Ustaw sposób eksportowania zakupów kartą firmową do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Karty kredytowe',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Rachunki od dostawców',
                },
            },
            creditCardAccount: 'Konto karty kredytowej',
            defaultVendor: 'Domyślny dostawca',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Ustaw domyślnego dostawcę, który zostanie zastosowany do ${isReimbursable ? '' : 'nie-'}wydatków podlegających zwrotowi, które nie mają pasującego dostawcy w Sage Intacct.`,
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do Sage Intacct.',
            exportPreferredExporterNote:
                'Preferowanym eksporterem może być dowolny administrator przestrzeni roboczej, ale musi on być także administratorem domeny, jeśli ustawisz różne konta eksportu dla poszczególnych kart firmowych w ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy w swoim koncie raporty do eksportu.',
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: `Dodaj konto w Sage Intacct i ponownie zsynchronizuj połączenie`,
            autoSync: 'Automatyczna synchronizacja',
            autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Sage Intacct każdego dnia.',
            inviteEmployees: 'Zaproś pracowników',
            inviteEmployeesDescription:
                'Zaimportuj rekordy pracowników z Sage Intacct i zaproś pracowników do tego przestrzeni roboczej. Twój proces zatwierdzania domyślnie będzie oparty na akceptacji przez menedżera i można go dalej skonfigurować na stronie Członkowie.',
            syncReimbursedReports: 'Synchronizuj rozliczone raporty',
            syncReimbursedReportsDescription:
                'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Sage Intacct.',
            paymentAccount: 'Konto płatnicze Sage Intacct',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy wyeksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriałów',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ich opłaceniu',
                },
            },
        },
        netsuite: {
            subsidiary: 'Spółka zależna',
            subsidiarySelectDescription: 'Wybierz spółkę zależną w NetSuite, z której chcesz zaimportować dane.',
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do NetSuite.',
            exportInvoices: 'Eksportuj faktury do',
            journalEntriesTaxPostingAccount: 'Konto księgowania podatku zapisów w dzienniku',
            journalEntriesProvTaxPostingAccount: 'Konto księgowania podatku prowincjonalnego w zapisach księgowych',
            foreignCurrencyAmount: 'Eksportuj kwotę w walucie obcej',
            exportToNextOpenPeriod: 'Wyeksportuj do następnego otwartego okresu',
            nonReimbursableJournalPostingAccount: 'Konto księgowania nierozliczanych kosztów',
            reimbursableJournalPostingAccount: 'Konto księgowania zwrotów kosztów',
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
                        label: 'Utwórz jedną dla mnie',
                        description: 'Utworzymy dla Ciebie „pozycję faktury Expensify” podczas eksportu (jeśli jeszcze nie istnieje).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Wybierz istniejący',
                        description: 'Powiążemy faktury z Expensify z pozycją wybraną poniżej.',
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
                        description: 'Data wyeksportowania raportu do NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data przesłania',
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Raporty wydatków',
                        reimbursableDescription: 'Wydatki z własnej kieszeni zostaną wyeksportowane do NetSuite jako raporty wydatków.',
                        nonReimbursableDescription: 'Wydatki z firmowych kart zostaną wyeksportowane do NetSuite jako raporty wydatków.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Rachunki od dostawców',
                        reimbursableDescription: dedent(`
                            Wydatki z własnej kieszeni zostaną wyeksportowane jako rachunki płatne na rzecz dostawcy NetSuite określonego poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Wydatki z kart firmowych zostaną wyeksportowane jako rachunki płatne na rzecz wskazanego poniżej dostawcy w NetSuite.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Zapisy księgowe',
                        reimbursableDescription: dedent(`
                            Wydatki z własnej kieszeni zostaną wyeksportowane jako zapisy w dzienniku do konta NetSuite określonego poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Wydatki z kart firmowych zostaną wyeksportowane jako zapisy w dzienniku do konta NetSuite wskazanego poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Jeśli zmienisz ustawienie eksportu firmowych kart na raporty wydatków, dostawcy NetSuite i konta księgowe dla poszczególnych kart zostaną wyłączone.\n\nNie martw się, zachowamy Twoje poprzednie wybory na wypadek, gdybyś później chciał(a) wrócić do poprzedniego ustawienia.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z NetSuite każdego dnia.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na koncie NetSuite poniżej.',
                reimbursementsAccount: 'Konto zwrotów',
                reimbursementsAccountDescription: 'Wybierz konto bankowe, którego będziesz używać do zwrotów, a my utworzymy powiązaną płatność w NetSuite.',
                collectionsAccount: 'Konto windykacyjne',
                collectionsAccountDescription: 'Gdy faktura zostanie oznaczona jako opłacona w Expensify i wyeksportowana do NetSuite, pojawi się poniżej przy tym koncie.',
                approvalAccount: 'Konto akceptacji zobowiązań A/P',
                approvalAccountDescription:
                    'Wybierz konto, względem którego transakcje będą zatwierdzane w NetSuite. Jeśli synchronizujesz rozliczone raporty, będzie to również konto, względem którego będą tworzone płatności rachunków.',
                defaultApprovalAccount: 'Domyślne NetSuite',
                inviteEmployees: 'Zaproś pracowników i ustaw zatwierdzanie',
                inviteEmployeesDescription:
                    'Zaimportuj rekordy pracowników NetSuite i zaproś pracowników do tego obszaru roboczego. Twój proces akceptacji będzie domyślnie oparty na akceptacji przez menedżera i może zostać dalej skonfigurowany na stronie *Członkowie*.',
                autoCreateEntities: 'Automatycznie twórz pracowników/dostawców',
                enableCategories: 'Włącz nowo zaimportowane kategorie',
                customFormID: 'Identyfikator niestandardowego formularza',
                customFormIDDescription:
                    'Domyślnie Expensify będzie tworzyć zapisy, używając preferowanego formularza transakcji ustawionego w NetSuite. Alternatywnie możesz wskazać konkretny formularz transakcji, który ma być używany.',
                customFormIDReimbursable: 'Wydatek z własnej kieszeni',
                customFormIDNonReimbursable: 'Wydatek z firmowej karty',
                exportReportsTo: {
                    label: 'Poziom akceptacji raportu wydatków',
                    description:
                        'Po zatwierdzeniu raportu wydatków w Expensify i wyeksportowaniu go do NetSuite możesz w NetSuite ustawić dodatkowy poziom akceptacji przed jego zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Tylko zatwierdzone przez przełożonego',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Zatwierdzone tylko przez dział księgowości',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Zatwierdzone przez przełożonego i dział księgowości',
                    },
                },
                accountingMethods: {
                    label: 'Kiedy eksportować',
                    description: 'Wybierz, kiedy wyeksportować wydatki:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriałów',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ich opłaceniu',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Poziom zatwierdzania rachunku dostawcy',
                    description:
                        'Gdy rachunek od dostawcy zostanie zatwierdzony w Expensify i wyeksportowany do NetSuite, możesz ustawić w NetSuite dodatkowy poziom zatwierdzania przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zatwierdzone do zaksięgowania',
                    },
                },
                exportJournalsTo: {
                    label: 'Poziom zatwierdzania zapisu w dzienniku',
                    description:
                        'Po zatwierdzeniu zapisu księgowego w Expensify i wyeksportowaniu go do NetSuite, możesz w NetSuite ustawić dodatkowy poziom zatwierdzania przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zatwierdzone do zaksięgowania',
                    },
                },
                error: {
                    customFormID: 'Wprowadź prawidłowy numeryczny identyfikator niestandardowego formularza',
                },
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w NetSuite i ponownie zsynchronizuj połączenie',
            noVendorsFound: 'Nie znaleziono dostawców',
            noVendorsFoundDescription: 'Dodaj proszę dostawców w NetSuite i ponownie zsynchronizuj połączenie',
            noItemsFound: 'Nie znaleziono pozycji faktury',
            noItemsFoundDescription: 'Dodaj pozycje faktury w NetSuite i zsynchronizuj połączenie ponownie',
            noSubsidiariesFound: 'Nie znaleziono spółek zależnych',
            noSubsidiariesFoundDescription: 'Dodaj proszę spółkę zależną w NetSuite i ponownie zsynchronizuj połączenie',
            tokenInput: {
                title: 'Konfiguracja NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Zainstaluj pakiet Expensify',
                        description: 'W NetSuite przejdź do *Customization > SuiteBundler > Search & Install Bundles* > wyszukaj „Expensify” > zainstaluj pakiet.',
                    },
                    enableTokenAuthentication: {
                        title: 'Włącz uwierzytelnianie oparte na tokenach',
                        description: 'W NetSuite przejdź do *Setup > Company > Enable Features > SuiteCloud* i włącz *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Włącz usługi sieciowe SOAP',
                        description: 'W NetSuite przejdź do *Setup > Company > Enable Features > SuiteCloud* > włącz *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Utwórz token dostępu',
                        description:
                            'W NetSuite przejdź do *Setup > Users/Roles > Access Tokens* > utwórz token dostępu dla aplikacji „Expensify” oraz roli „Expensify Integration” lub „Administrator”.\n\n*Ważne:* Upewnij się, że zapiszesz *Token ID* i *Token Secret* z tego kroku. Będziesz ich potrzebować w kolejnym kroku.',
                    },
                    enterCredentials: {
                        title: 'Wprowadź swoje dane logowania do NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'Identyfikator konta NetSuite',
                            netSuiteTokenID: 'Identyfikator tokena',
                            netSuiteTokenSecret: 'Tajny token',
                        },
                        netSuiteAccountIDDescription: 'W NetSuite przejdź do *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Kategorie wydatków',
                expenseCategoriesDescription: 'Twoje kategorie wydatków z NetSuite zostaną zaimportowane do Expensify jako kategorie.',
                crossSubsidiaryCustomers: 'Klienci/projekty międzyspółkowe',
                importFields: {
                    departments: {
                        title: 'Działy',
                        subtitle: 'Wybierz, jak obsługiwać *działy* NetSuite w Expensify.',
                    },
                    classes: {
                        title: 'Klasy',
                        subtitle: 'Wybierz sposób obsługi *klas* w Expensify.',
                    },
                    locations: {
                        title: 'Lokalizacje',
                        subtitle: 'Wybierz, jak obsługiwać *lokalizacje* w Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Klienci/projekty',
                    subtitle: 'Wybierz sposób obsługi *klientów* i *projektów* NetSuite w Expensify.',
                    importCustomers: 'Importuj klientów',
                    importJobs: 'Importuj projekty',
                    customers: 'klienci',
                    jobs: 'projekty',
                    label: (importFields: string[], importType: string) => `${importFields.join('i')}, ${importType}`,
                },
                importTaxDescription: 'Zaimportuj grupy podatkowe z NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Wybierz jedną z opcji poniżej:',
                    label: (importedTypes: string[]) => `Zaimportowano jako ${importedTypes.join('i')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Wprowadź ${fieldName}`,
                    customSegments: {
                        title: 'Niestandardowe segmenty/rejestry',
                        addText: 'Dodaj niestandardowy segment/rekord',
                        recordTitle: 'Niestandardowy segment/rekord',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Zobacz szczegółowe instrukcje',
                        helpText: 'przy konfigurowaniu niestandardowych segmentów/rejestrów.',
                        emptyTitle: 'Dodaj własny segment lub własny rekord',
                        fields: {
                            segmentName: 'Imię',
                            internalID: 'Wewnętrzny identyfikator',
                            scriptID: 'ID skryptu',
                            customRecordScriptID: 'ID kolumny transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń niestandardowy segment/rekord',
                        removePrompt: 'Czy na pewno chcesz usunąć ten niestandardowy segment/rejestr?',
                        addForm: {
                            customSegmentName: 'nazwa niestandardowego segmentu',
                            customRecordName: 'nazwa niestandardowego rekordu',
                            segmentTitle: 'Niestandardowy segment',
                            customSegmentAddTitle: 'Dodaj własny segment',
                            customRecordAddTitle: 'Dodaj niestandardowy rekord',
                            recordTitle: 'Niestandardowy rekord',
                            segmentRecordType: 'Czy chcesz dodać niestandardowy segment czy niestandardowy rekord?',
                            customSegmentNameTitle: 'Jaka jest nazwa niestandardowego segmentu?',
                            customRecordNameTitle: 'Jaka jest nazwa niestandardowego rekordu?',
                            customSegmentNameFooter: `Nazwy niestandardowych segmentów znajdziesz w NetSuite na stronie *Customizations > Links, Records & Fields > Custom Segments*.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customRecordNameFooter: `Możesz znaleźć niestandardowe nazwy rekordów w NetSuite, wpisując „Transaction Column Field” w globalnym wyszukiwaniu.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Jaki jest identyfikator wewnętrzny?',
                            customSegmentInternalIDFooter: `Najpierw upewnij się, że włączyłeś(-aś) wewnętrzne ID w NetSuite w *Home > Set Preferences > Show Internal ID.*

Wewnętrzne ID segmentów niestandardowych znajdziesz w NetSuite w:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Kliknij dany segment niestandardowy.
3. Kliknij hiperłącze obok *Custom Record Type*.
4. Znajdź wewnętrzne ID w tabeli na dole.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Możesz znaleźć wewnętrzne ID niestandardowych rekordów w NetSuite, wykonując poniższe kroki:

1. Wpisz „Transaction Line Fields” w wyszukiwaniu globalnym.
2. Otwórz niestandardowy rekord.
3. Znajdź wewnętrzne ID po lewej stronie.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Jaki jest identyfikator skryptu?',
                            customSegmentScriptIDFooter: `Identyfikatory skryptów niestandardowych segmentów znajdziesz w NetSuite w: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Kliknij wybrany niestandardowy segment.
3. Kliknij kartę *Application and Sourcing* na dole, a następnie:
    a. Jeśli chcesz wyświetlać niestandardowy segment jako *tag* (na poziomie pozycji) w Expensify, kliknij podkartę *Transaction Columns* i użyj *Field ID*.
    b. Jeśli chcesz wyświetlać niestandardowy segment jako *pole raportu* (na poziomie raportu) w Expensify, kliknij podkartę *Transactions* i użyj *Field ID*.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Jaki jest identyfikator kolumny transakcji?',
                            customRecordScriptIDFooter: `Identyfikatory skryptów rekordów niestandardowych znajdziesz w NetSuite w następujący sposób:

1. Wprowadź „Transaction Line Fields” w globalnym wyszukiwaniu.
2. Otwórz rekord niestandardowy.
3. Znajdź identyfikator skryptu (script ID) po lewej stronie.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Jak ten niestandardowy segment powinien być wyświetlany w Expensify?',
                            customRecordMappingTitle: 'Jak powinien być wyświetlany ten niestandardowy rekord w Expensify?',
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
                        helpText: 'konfigurowania list niestandardowych.',
                        emptyTitle: 'Dodaj niestandardową listę',
                        fields: {
                            listName: 'Imię',
                            internalID: 'Wewnętrzny identyfikator',
                            transactionFieldID: 'Identyfikator pola transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń listę niestandardową',
                        removePrompt: 'Czy na pewno chcesz usunąć tę listę niestandardową?',
                        addForm: {
                            listNameTitle: 'Wybierz listę niestandardową',
                            transactionFieldIDTitle: 'Jaki jest identyfikator pola transakcji?',
                            transactionFieldIDFooter: `Identyfikatory pól transakcji możesz znaleźć w NetSuite, wykonując następujące kroki:

1. Wpisz „Transaction Line Fields” w globalnym wyszukiwaniu.
2. Kliknij niestandardową listę.
3. Znajdź identyfikator pola transakcji po lewej stronie.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Jak ta lista niestandardowa powinna być wyświetlana w Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Niestandardowa lista z tym identyfikatorem pola transakcji już istnieje`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Domyślne ustawienie pracownika NetSuite',
                        description: 'Nie zaimportowano do Expensify, zastosowano przy eksporcie',
                        footerContent: (importField: string) =>
                            `Jeśli używasz ${importField} w NetSuite, zastosujemy domyślną wartość ustawioną w kartotece pracownika podczas eksportu do raportu wydatków lub zapisu dziennika.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tagi',
                        description: 'Poziom pozycji liniowej',
                        footerContent: (importField: string) => `${startCase(importField)} będzie można wybrać dla każdego pojedynczego wydatku w raporcie pracownika.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Pola raportu',
                        description: 'Poziom raportu',
                        footerContent: (importField: string) => `Wybranie opcji ${startCase(importField)} zostanie zastosowane do wszystkich wydatków w raporcie pracownika.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Konfiguracja Sage Intacct',
            prerequisitesTitle: 'Zanim się połączysz…',
            downloadExpensifyPackage: 'Pobierz pakiet Expensify dla Sage Intacct',
            followSteps: 'Postępuj zgodnie z krokami w naszej instrukcji „Jak połączyć się z Sage Intacct”',
            enterCredentials: 'Wprowadź swoje dane logowania do Sage Intacct',
            entity: 'Jednostka',
            employeeDefault: 'Domyślne ustawienie pracownika Sage Intacct',
            employeeDefaultDescription: 'Domyślny dział pracownika zostanie zastosowany do jego wydatków w Sage Intacct, jeśli istnieje.',
            displayedAsTagDescription: 'Dział będzie można wybrać osobno dla każdego wydatku w raporcie pracownika.',
            displayedAsReportFieldDescription: 'Wybrany dział zostanie zastosowany do wszystkich wydatków w raporcie pracownika.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wybierz sposób obsługi Sage Intacct <strong>${mappingTitle}</strong> w Expensify.`,
            expenseTypes: 'Typy wydatków',
            expenseTypesDescription: 'Twoje typy wydatków Sage Intacct zostaną zaimportowane do Expensify jako kategorie.',
            accountTypesDescription: 'Twój plan kont Sage Intacct zostanie zaimportowany do Expensify jako kategorie.',
            importTaxDescription: 'Zaimportuj stawkę podatku od zakupu z Sage Intacct.',
            userDefinedDimensions: 'Wymiary zdefiniowane przez użytkownika',
            addUserDefinedDimension: 'Dodaj zdefiniowany przez użytkownika wymiar',
            integrationName: 'Nazwa integracji',
            dimensionExists: 'Wymiar o tej nazwie już istnieje.',
            removeDimension: 'Usuń zdefiniowany przez użytkownika wymiar',
            removeDimensionPrompt: 'Czy na pewno chcesz usunąć ten wymiar zdefiniowany przez użytkownika?',
            userDefinedDimension: 'Wymiar zdefiniowany przez użytkownika',
            addAUserDefinedDimension: 'Dodaj zdefiniowany przez użytkownika wymiar',
            detailedInstructionsLink: 'Zobacz szczegółowe instrukcje',
            detailedInstructionsRestOfSentence: 'na temat dodawania wymiarów zdefiniowanych przez użytkownika.',
            userDimensionsAdded: () => ({
                one: 'Dodano 1 UDD',
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
                        return 'projekty (zadania)';
                    default:
                        return 'mapowania';
                }
            },
        },
        type: {
            free: 'Darmowe',
            control: 'Sterowanie',
            collect: 'Pobierz',
        },
        companyCards: {
            addCards: 'Dodaj karty',
            selectCards: 'Wybierz karty',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Nie udało się wczytać kanałów kart',
                workspaceFeedsCouldNotBeLoadedMessage: 'Wystąpił błąd podczas ładowania kanałów kart w przestrzeni roboczej. Spróbuj ponownie lub skontaktuj się z administratorem.',
                feedCouldNotBeLoadedTitle: 'Nie można wczytać tego kanału',
                feedCouldNotBeLoadedMessage: 'Wystąpił błąd podczas ładowania tego kanału. Spróbuj ponownie lub skontaktuj się z administratorem.',
                tryAgain: 'Spróbuj ponownie',
            },
            addNewCard: {
                other: 'Inne',
                cardProviders: {
                    gl1025: 'Firmowe karty American Express',
                    cdf: 'Karty komercyjne Mastercard',
                    vcf: 'Biznesowe karty Visa',
                    stripe: 'Karty Stripe',
                },
                yourCardProvider: `Kto jest wystawcą Twojej karty?`,
                whoIsYourBankAccount: 'Jaki jest Twój bank?',
                whereIsYourBankLocated: 'Gdzie znajduje się Twój bank?',
                howDoYouWantToConnect: 'Jak chcesz połączyć się ze swoim bankiem?',
                learnMoreAboutOptions: `<muted-text>Dowiedz się więcej o tych <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opcjach</a>.</muted-text>`,
                commercialFeedDetails: 'Wymaga konfiguracji z Twoim bankiem. Zazwyczaj jest używane przez większe firmy i często jest najlepszą opcją, jeśli się kwalifikujesz.',
                commercialFeedPlaidDetails: `Wymaga konfiguracji z Twoim bankiem, ale poprowadzimy Cię przez ten proces. Zazwyczaj jest to dostępne tylko dla większych firm.`,
                directFeedDetails: 'Najprostsze podejście. Połącz się od razu, używając swoich głównych danych logowania. Ta metoda jest najczęściej stosowana.',
                enableFeed: {
                    title: (provider: string) => `Włącz swój kanał ${provider}`,
                    heading:
                        'Mamy bezpośrednią integrację z wystawcą Twojej karty i możemy szybko oraz dokładnie zaimportować dane o Twoich transakcjach do Expensify.\n\nAby rozpocząć, po prostu:',
                    visa: 'Mamy globalne integracje z Visa, choć kwalifikowalność zależy od banku i programu karty.\n\nAby rozpocząć, po prostu:',
                    mastercard: 'Mamy globalne integracje z Mastercard, choć kwalifikowalność zależy od banku i programu karty.\n\nAby rozpocząć, po prostu:',
                    vcf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby uzyskać szczegółowe instrukcje dotyczące konfiguracji kart Visa Commercial.

2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby potwierdzić, że obsługuje on firmowy kanał danych dla Twojego programu, i poproś o jego włączenie.

3. *Gdy kanał zostanie włączony i będziesz mieć jego szczegóły, przejdź do następnego ekranu.*`,
                    gl1025: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), aby sprawdzić, czy American Express może włączyć komercyjny feed dla Twojego programu.

2. Gdy feed zostanie włączony, Amex wyśle do Ciebie list produkcyjny.

3. *Gdy masz już informacje o feedzie, przejdź do następnego ekranu.*`,
                    cdf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby uzyskać szczegółowe instrukcje dotyczące konfiguracji kart Mastercard Commercial Cards.

2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby potwierdzić, że obsługuje on komercyjny kanał danych dla Twojego programu, i poproś o jego włączenie.

3. *Gdy kanał danych zostanie włączony i będziesz mieć jego szczegóły, przejdź do następnego ekranu.*`,
                    stripe: `1. Wejdź na Stripe Dashboard i przejdź do [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. W sekcji Product Integrations kliknij Enable obok Expensify.

3. Gdy kanał zostanie włączony, kliknij poniżej przycisk Submit, a my zajmiemy się jego dodaniem.`,
                },
                whatBankIssuesCard: 'Jaki bank wydaje te karty?',
                enterNameOfBank: 'Wprowadź nazwę banku',
                feedDetails: {
                    vcf: {
                        title: 'Jakie są szczegóły zasilania danymi Visa?',
                        processorLabel: 'Identyfikator procesora',
                        bankLabel: 'Identyfikator instytucji finansowej (banku)',
                        companyLabel: 'ID firmy',
                        helpLabel: 'Gdzie znajdę te identyfikatory?',
                    },
                    gl1025: {
                        title: `Jaka jest nazwa pliku dostarczanego do Amex?`,
                        fileNameLabel: 'Nazwa pliku dostawy',
                        helpLabel: 'Gdzie znajdę nazwę pliku dostawy?',
                    },
                    cdf: {
                        title: `Jaki jest identyfikator dystrybucyjny Mastercard?`,
                        distributionLabel: 'Identyfikator dystrybucji',
                        helpLabel: 'Gdzie znajdę identyfikator dystrybucji?',
                    },
                },
                amexCorporate: 'Wybierz tę opcję, jeśli z przodu Twoich kart widnieje napis „Corporate”',
                amexBusiness: 'Wybierz tę opcję, jeśli na przodzie Twoich kart widnieje napis „Business”',
                amexPersonal: 'Wybierz tę opcję, jeśli Twoje karty są prywatne',
                error: {
                    pleaseSelectProvider: 'Wybierz wystawcę karty przed kontynuowaniem',
                    pleaseSelectBankAccount: 'Wybierz konto bankowe przed kontynuowaniem',
                    pleaseSelectBank: 'Wybierz bank przed kontynuowaniem',
                    pleaseSelectCountry: 'Najpierw wybierz kraj, zanim przejdziesz dalej',
                    pleaseSelectFeedType: 'Wybierz typ kanału przed kontynuowaniem',
                },
                exitModal: {
                    title: 'Coś nie działa?',
                    prompt: 'Zauważyliśmy, że nie dokończono dodawania kart. Jeśli napotkasz jakiś problem, daj nam znać, abyśmy mogli pomóc wszystko przywrócić na właściwe tory.',
                    confirmText: 'Zgłoś problem',
                    cancelText: 'Pomiń',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Ostatni dzień miesiąca',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Ostatni dzień roboczy miesiąca',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Niestandardowy dzień miesiąca',
            },
            assign: 'Przypisz',
            assignCard: 'Przypisz kartę',
            findCard: 'Znajdź kartę',
            cardNumber: 'Numer karty',
            commercialFeed: 'Komercyjny kanał',
            feedName: (feedName: string) => `Karty ${feedName}`,
            directFeed: 'Bezpośredni kanał',
            whoNeedsCardAssigned: 'Kto potrzebuje przypisanej karty?',
            chooseTheCardholder: 'Wybierz posiadacza karty',
            chooseCard: 'Wybierz kartę',
            chooseCardFor: (assignee: string) => `Wybierz kartę dla <strong>${assignee}</strong>. Nie możesz znaleźć karty, której szukasz? <concierge-link>Daj nam znać.</concierge-link>`,
            noActiveCards: 'Brak aktywnych kart w tym kanale',
            somethingMightBeBroken:
                '<muted-text><centered-text>Albo coś może nie działać. Tak czy inaczej, jeśli masz jakieś pytania, po prostu <concierge-link>skontaktuj się z Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wybierz datę rozpoczęcia transakcji',
            startDateDescription: 'Wybierz początkową datę importu. Zsynchronizujemy wszystkie transakcje od tej daty wzwyż.',
            editStartDateDescription: 'Wybierz nową datę początkową transakcji. Zsynchronizujemy wszystkie transakcje od tej daty, z wyłączeniem tych, które już zaimportowaliśmy.',
            fromTheBeginning: 'Od początku',
            customStartDate: 'Niestandardowa data rozpoczęcia',
            customCloseDate: 'Niestandardowa data zamknięcia',
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
            confirmationDescription: 'Natychmiast rozpoczniemy importowanie transakcji.',
            card: 'Karta',
            cardName: 'Nazwa karty',
            brokenConnectionError: '<rbr>Połączenie z kartą jest przerwane. Proszę <a href="#">zalogować się do swojego banku</a>, abyśmy mogli ponownie nawiązać połączenie.</rbr>',
            assignedCard: (assignee: string, link: string) => `przypisał(-a) ${assignee} ${link}! Zaimportowane transakcje pojawią się w tym czacie.`,
            companyCard: 'karta służbowa',
            chooseCardFeed: 'Wybierz źródło karty',
            ukRegulation:
                'Expensify Limited jest agentem Plaid Financial Ltd., autoryzowanej instytucji płatniczej regulowanej przez Financial Conduct Authority na podstawie Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid świadczy Tobie regulowane usługi dostępu do informacji o rachunku za pośrednictwem Expensify Limited jako swojego agenta.',
            assignCardFailedError: 'Przypisanie karty nie powiodło się.',
            unassignCardFailedError: 'Odłączenie karty nie powiodło się.',
            cardAlreadyAssignedError: 'Ta karta jest już przypisana do użytkownika w innej przestrzeni roboczej.',
            importTransactions: {
                title: 'Zaimportuj transakcje z pliku',
                description: 'Dostosuj ustawienia dla swojego pliku, które zostaną zastosowane podczas importu.',
                cardDisplayName: 'Wyświetlana nazwa karty',
                currency: 'Waluta',
                transactionsAreReimbursable: 'Transakcje podlegają zwrotowi kosztów',
                flipAmountSign: 'Odwróć znak kwoty',
                importButton: 'Importuj transakcje',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Wydawaj i zarządzaj swoimi kartami Expensify',
            getStartedIssuing: 'Zacznij od wydania swojej pierwszej wirtualnej lub fizycznej karty.',
            verificationInProgress: 'Trwa weryfikacja...',
            verifyingTheDetails: 'Sprawdzamy kilka szczegółów. Concierge da Ci znać, gdy karty Expensify będą gotowe do wydania.',
            disclaimer:
                'Firmowa karta Expensify Visa® jest wydawana przez The Bancorp Bank, N.A., członka FDIC, na podstawie licencji udzielonej przez Visa U.S.A. Inc. i może nie być akceptowana u wszystkich sprzedawców akceptujących karty Visa. Apple® i logo Apple® są znakami towarowymi firmy Apple Inc., zarejestrowanymi w USA i innych krajach. App Store jest znakiem usługowym firmy Apple Inc. Google Play i logo Google Play są znakami towarowymi Google LLC.',
            euUkDisclaimer:
                'Karty wydawane rezydentom EOG są emitowane przez Transact Payments Malta Limited, a karty wydawane rezydentom Zjednoczonego Królestwa są emitowane przez Transact Payments Limited na podstawie licencji udzielonej przez Visa Europe Limited. Transact Payments Malta Limited jest należycie upoważniona i regulowana przez Malta Financial Services Authority jako instytucja finansowa na mocy Financial Institution Act 1994. Numer rejestracyjny C 91879. Transact Payments Limited jest upoważniona i regulowana przez Gibraltar Financial Service Commission.',
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
                'Bierzemy pod uwagę szereg czynników przy obliczaniu Twojego pozostałego limitu: Twój staż jako klienta, informacje biznesowe podane podczas rejestracji oraz dostępne środki pieniężne na firmowym koncie bankowym. Twój pozostały limit może zmieniać się każdego dnia.',
            earnedCashback: 'Zwrot gotówki',
            earnedCashbackDescription: 'Saldo zwrotu gotówki jest oparte na rozliczonych miesięcznych wydatkach kartą Expensify w Twojej przestrzeni roboczej.',
            issueNewCard: 'Wydaj nową kartę',
            finishSetup: 'Dokończ konfigurację',
            chooseBankAccount: 'Wybierz konto bankowe',
            chooseExistingBank: 'Wybierz istniejące firmowe konto bankowe do spłaty salda karty Expensify lub dodaj nowe konto bankowe',
            accountEndingIn: 'Konto zakończone cyframi',
            addNewBankAccount: 'Dodaj nowe konto bankowe',
            settlementAccount: 'Konto rozliczeniowe',
            settlementAccountDescription: 'Wybierz konto, z którego spłacisz saldo karty Expensify.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Upewnij się, że to konto jest zgodne z Twoim <a href="${reconciliationAccountSettingsLink}">kontem uzgadniania</a> (${accountNumber}), aby Ciągłe uzgadnianie działało prawidłowo.`,
            settlementFrequency: 'Częstotliwość rozliczeń',
            settlementFrequencyDescription: 'Wybierz, jak często będziesz spłacać saldo karty Expensify.',
            settlementFrequencyInfo: 'Jeśli chcesz przejść na miesięczne rozliczenie, musisz połączyć swoje konto bankowe przez Plaid i mieć dodatnią historię salda z ostatnich 90 dni.',
            frequency: {
                daily: 'Codziennie',
                monthly: 'Miesięcznie',
            },
            cardDetails: 'Szczegóły karty',
            cardPending: ({name}: {name: string}) => `Karta jest obecnie w toku i zostanie wydana, gdy konto ${name} zostanie zweryfikowane.`,
            virtual: 'Wirtualna',
            physical: 'Fizyczne',
            deactivate: 'Dezaktywuj kartę',
            changeCardLimit: 'Zmień limit karty',
            changeLimit: 'Zmień limit',
            smartLimitWarning: (limit: number | string) =>
                `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane, dopóki nie zatwierdzisz kolejnych wydatków na karcie.`,
            monthlyLimitWarning: (limit: number | string) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane do przyszłego miesiąca.`,
            fixedLimitWarning: (limit: number | string) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje zostaną odrzucone.`,
            changeCardLimitType: 'Zmień typ limitu karty',
            changeLimitType: 'Zmień typ limitu',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Jeśli zmienisz typ limitu tej karty na Smart Limit, nowe transakcje zostaną odrzucone, ponieważ niezatwierdzony limit ${limit} został już osiągnięty.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Jeśli zmienisz typ limitu tej karty na Miesięczny, nowe transakcje zostaną odrzucone, ponieważ miesięczny limit ${limit} został już osiągnięty.`,
            addShippingDetails: 'Dodaj dane wysyłki',
            issuedCard: (assignee: string) => `wysłano ${assignee} kartę Expensify! Karta dotrze w ciągu 2–3 dni roboczych.`,
            issuedCardNoShippingDetails: (assignee: string) => `przyznał(-a) ${assignee} kartę Expensify! Karta zostanie wysłana po potwierdzeniu danych wysyłkowych.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `wydał(-a) ${assignee} wirtualną kartę Expensify! ${link} można używać od razu.`,
            addedShippingDetails: (assignee: string) => `${assignee} dodał(-a) dane wysyłki. Karta Expensify dotrze w ciągu 2–3 dni roboczych.`,
            replacedCard: (assignee: string) => `${assignee} wymienił(-a) swoją kartę Expensify. Nowa karta dotrze w ciągu 2–3 dni roboczych.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} wymienił(-a) swoją wirtualną kartę Expensify! ${link} można użyć od razu.`,
            card: 'karta',
            replacementCard: 'karta zastępcza',
            verifyingHeader: 'Weryfikowanie',
            bankAccountVerifiedHeader: 'Konto bankowe zweryfikowane',
            verifyingBankAccount: 'Weryfikowanie konta bankowego...',
            verifyingBankAccountDescription: 'Poczekaj, aż potwierdzimy, że to konto może być użyte do wydawania kart Expensify.',
            bankAccountVerified: 'Konto bankowe zostało zweryfikowane!',
            bankAccountVerifiedDescription: 'Możesz teraz wydawać karty Expensify członkom swojego przestrzeni roboczej.',
            oneMoreStep: 'Jeszcze jeden krok…',
            oneMoreStepDescription: 'Wygląda na to, że musimy ręcznie zweryfikować Twoje konto bankowe. Przejdź do Concierge, gdzie czekają na Ciebie dalsze instrukcje.',
            gotIt: 'Rozumiem',
            goToConcierge: 'Przejdź do Concierge',
        },
        categories: {
            deleteCategories: 'Usuń kategorie',
            deleteCategoriesPrompt: 'Na pewno chcesz usunąć te kategorie?',
            deleteCategory: 'Usuń kategorię',
            deleteCategoryPrompt: 'Czy na pewno chcesz usunąć tę kategorię?',
            disableCategories: 'Wyłącz kategorie',
            disableCategory: 'Wyłącz kategorię',
            enableCategories: 'Włącz kategorie',
            enableCategory: 'Włącz kategorię',
            defaultSpendCategories: 'Domyślne kategorie wydatków',
            spendCategoriesDescription: 'Dostosuj sposób kategoryzowania wydatków u sprzedawców dla transakcji kartą kredytową i zeskanowanych paragonów.',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania kategorii, spróbuj ponownie',
            categoryName: 'Nazwa kategorii',
            requiresCategory: 'Członkowie muszą kategoryzować wszystkie wydatki',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Wszystkie wydatki muszą zostać skategoryzowane, aby można je było wyeksportować do ${connectionName}.`,
            subtitle: 'Uzyskaj lepszy wgląd w to, na co wydawane są pieniądze. Skorzystaj z naszych domyślnych kategorii lub dodaj własne.',
            emptyCategories: {
                title: 'Nie utworzyłeś jeszcze żadnych kategorii',
                subtitle: 'Dodaj kategorię, aby uporządkować swoje wydatki.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Twoje kategorie są obecnie importowane z połączenia księgowego. Przejdź do sekcji <a href="${accountingPageURL}">księgowość</a>, aby wprowadzić zmiany.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Wystąpił błąd podczas aktualizowania kategorii, spróbuj ponownie',
            createFailureMessage: 'Wystąpił błąd podczas tworzenia kategorii, spróbuj ponownie',
            addCategory: 'Dodaj kategorię',
            editCategory: 'Edytuj kategorię',
            editCategories: 'Edytuj kategorie',
            findCategory: 'Znajdź kategorię',
            categoryRequiredError: 'Nazwa kategorii jest wymagana',
            existingCategoryError: 'Kategoria o tej nazwie już istnieje',
            invalidCategoryName: 'Nieprawidłowa nazwa kategorii',
            importedFromAccountingSoftware: 'Kategorie poniżej są importowane z Twojego',
            payrollCode: 'Kod listy płac',
            updatePayrollCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu listy płac, spróbuj ponownie',
            glCode: 'Kod księgowy GL',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu GL, spróbuj ponownie',
            importCategories: 'Importuj kategorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Nie można usunąć ani wyłączyć wszystkich kategorii',
                description: `Co najmniej jedna kategoria musi pozostać włączona, ponieważ w Twoim obszarze roboczym kategorie są wymagane.`,
            },
        },
        moreFeatures: {
            subtitle: 'Użyj poniższych przełączników, aby w miarę rozwoju włączyć więcej funkcji. Każda funkcja pojawi się w menu nawigacji, aby można ją było dalej dostosowywać.',
            spendSection: {
                title: 'Wydatki',
                subtitle: 'Włącz funkcje, które pomogą Ci skalować zespół.',
            },
            manageSection: {
                title: 'Zarządzaj',
                subtitle: 'Dodaj kontrolki, które pomagają utrzymać wydatki w ramach budżetu.',
            },
            earnSection: {
                title: 'Zarabiaj',
                subtitle: 'Usprawnij swoje przychody i otrzymuj płatności szybciej.',
            },
            organizeSection: {
                title: 'Porządkuj',
                subtitle: 'Grupuj i analizuj wydatki, zapisuj każdy zapłacony podatek.',
            },
            integrateSection: {
                title: 'Zintegruj',
                subtitle: 'Połącz Expensify z popularnymi produktami finansowymi.',
            },
            distanceRates: {
                title: 'Stawki za odległość',
                subtitle: 'Dodawaj, aktualizuj i egzekwuj stawki.',
            },
            perDiem: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki diet, aby kontrolować dzienne wydatki pracowników.',
            },
            travel: {
                title: 'Podróże',
                subtitle: 'Rezerwuj, zarządzaj i rozliczaj wszystkie podróże służbowe.',
                getStarted: {
                    title: 'Rozpocznij korzystanie z Expensify Travel',
                    subtitle: 'Potrzebujemy jeszcze kilku informacji o Twojej firmie, a potem będziesz gotowy do startu.',
                    ctaText: 'Zaczynajmy',
                },
                reviewingRequest: {
                    title: 'Spakuj torbę, zajmiemy się twoją prośbą…',
                    subtitle: 'Aktualnie rozpatrujemy Twoją prośbę o włączenie Expensify Travel. Nie martw się, damy Ci znać, gdy będzie gotowe.',
                    ctaText: 'Wniosek wysłany',
                },
                bookOrManageYourTrip: {
                    title: 'Zarezerwuj lub zarządzaj swoją podróżą',
                    subtitle: 'Korzystaj z Expensify Travel, aby otrzymywać najlepsze oferty podróży i zarządzać wszystkimi wydatkami służbowymi w jednym miejscu.',
                    ctaText: 'Zarezerwuj lub zarządzaj',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Rezerwacja podróży',
                        subtitle: 'Gratulacje! Możesz już rezerwować i zarządzać podróżami w tym obszarze roboczym.',
                        manageTravelLabel: 'Zarządzaj podróżami',
                    },
                    centralInvoicingSection: {
                        title: 'Centralne fakturowanie',
                        subtitle: 'Skonsoliduj wszystkie wydatki na podróże w jednym miesięcznym rachunku zamiast płacić w momencie zakupu.',
                        learnHow: 'Dowiedz się jak.',
                        subsections: {
                            currentTravelSpendLabel: 'Bieżące wydatki na podróże',
                            currentTravelSpendCta: 'Spłać saldo',
                            currentTravelLimitLabel: 'Obecny limit podróży',
                            settlementAccountLabel: 'Konto rozliczeniowe',
                            settlementFrequencyLabel: 'Częstotliwość rozliczeń',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Karta Expensify',
                subtitle: 'Zyskaj wgląd i kontrolę nad wydatkami.',
                disableCardTitle: 'Wyłącz kartę Expensify',
                disableCardPrompt: 'Nie możesz wyłączyć karty Expensify, ponieważ jest już używana. Skontaktuj się z Concierge, aby poznać kolejne kroki.',
                disableCardButton: 'Czat z Concierge',
                feed: {
                    title: 'Zdobądź kartę Expensify',
                    subTitle: 'Usprawnij wydatki firmowe i zaoszczędź do 50% na swoim rachunku w Expensify, a dodatkowo:',
                    features: {
                        cashBack: 'Zwrot gotówki przy każdym zakupie w USA',
                        unlimited: 'Nielimitowane karty wirtualne',
                        spend: 'Kontrola wydatków i limity niestandardowe',
                    },
                    ctaTitle: 'Wydaj nową kartę',
                },
            },
            companyCards: {
                title: 'Firmowe karty',
                subtitle: 'Podłącz karty, które już masz.',
                feed: {
                    title: 'Użyj własnych kart (BYOC)',
                    subtitle: 'Połącz karty, które już masz, aby automatycznie importować transakcje, dopasowywać paragony i przeprowadzać uzgodnienia.',
                    features: {
                        support: 'Połącz karty z ponad 10 000 banków',
                        assignCards: 'Połącz istniejące karty Twojego zespołu',
                        automaticImport: 'Automatycznie pobierzemy transakcje',
                    },
                },
                bankConnectionError: 'Problem z połączeniem z bankiem',
                connectWithPlaid: 'połącz przez Plaid',
                connectWithExpensifyCard: 'wypróbuj kartę Expensify.',
                bankConnectionDescription: `Spróbuj dodać swoje karty ponownie. W przeciwnym razie możesz`,
                disableCardTitle: 'Wyłącz karty firmowe',
                disableCardPrompt: 'Nie możesz wyłączyć kart firmowych, ponieważ ta funkcja jest w użyciu. Skontaktuj się z Concierge, aby poznać dalsze kroki.',
                disableCardButton: 'Czat z Concierge',
                cardDetails: 'Szczegóły karty',
                cardNumber: 'Numer karty',
                cardholder: 'Posiadacz karty',
                cardName: 'Nazwa karty',
                allCards: 'Wszystkie karty',
                assignedCards: 'Przypisano',
                unassignedCards: 'Nieprzypisane',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `Eksport ${integration} ${type.toLowerCase()}` : `Eksport ${integration}`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Wybierz konto ${integration}, do którego mają być eksportowane transakcje.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Wybierz konto ${integration}, do którego mają być eksportowane transakcje. Wybierz inną <a href="${exportPageLink}">opcję eksportu</a>, aby zmienić dostępne konta.`,
                lastUpdated: 'Ostatnia aktualizacja',
                transactionStartDate: 'Data rozpoczęcia transakcji',
                updateCard: 'Zaktualizuj kartę',
                unassignCard: 'Usuń przypisanie karty',
                unassign: 'Cofnij przypisanie',
                unassignCardDescription: 'Usunięcie przypisania tej karty spowoduje usunięcie wszystkich transakcji w raportach roboczych z konta posiadacza karty.',
                assignCard: 'Przypisz kartę',
                cardFeedName: 'Nazwa źródła karty',
                cardFeedNameDescription: 'Nadaj źródłu karty unikalną nazwę, aby móc odróżnić je od innych.',
                cardFeedTransaction: 'Usuń transakcje',
                cardFeedTransactionDescription: 'Wybierz, czy posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą podlegać tym zasadom.',
                cardFeedRestrictDeletingTransaction: 'Ogranicz usuwanie transakcji',
                cardFeedAllowDeletingTransaction: 'Zezwól na usuwanie transakcji',
                removeCardFeed: 'Usuń źródło karty',
                removeCardFeedTitle: (feedName: string) => `Usuń źródło ${feedName}`,
                removeCardFeedDescription: 'Czy na pewno chcesz usunąć ten kanał kart? Spowoduje to odłączenie wszystkich kart.',
                error: {
                    feedNameRequired: 'Nazwa źródła karty jest wymagana',
                    statementCloseDateRequired: 'Wybierz datę zamknięcia wyciągu.',
                },
                corporate: 'Ogranicz usuwanie transakcji',
                personal: 'Zezwól na usuwanie transakcji',
                setFeedNameDescription: 'Nadaj temu źródłu danych karty unikalną nazwę, aby odróżnić je od pozostałych',
                setTransactionLiabilityDescription: 'Po włączeniu posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą podlegały tej zasadzie.',
                emptyAddedFeedTitle: 'Brak kart w tym kanale',
                emptyAddedFeedDescription: 'Upewnij się, że w strumieniu kart Twojego banku znajdują się jakieś karty.',
                pendingFeedTitle: `Przeglądamy Twoje zgłoszenie...`,
                pendingFeedDescription: `Obecnie sprawdzamy szczegóły Twojego kanału. Gdy to zakończymy, skontaktujemy się z Tobą przez`,
                pendingBankTitle: 'Sprawdź okno przeglądarki',
                pendingBankDescription: (bankName: string) => `Połącz się z ${bankName} w oknie przeglądarki, które właśnie się otworzyło. Jeśli się nie otworzyło,`,
                pendingBankLink: 'kliknij tutaj',
                giveItNameInstruction: 'Nadaj karcie nazwę, która odróżni ją od innych.',
                updating: 'Aktualizowanie...',
                neverUpdated: 'Nigdy',
                noAccountsFound: 'Nie znaleziono kont',
                defaultCard: 'Domyślna karta',
                downgradeTitle: `Nie można zdegradować przestrzeni roboczej`,
                downgradeSubTitle: `Nie można obniżyć planu tego przestrzeni roboczej, ponieważ jest podłączonych wiele strumieni kart (z wyłączeniem kart Expensify). Aby kontynuować, prosimy <a href="#">pozostawić tylko jeden strumień kart</a>.`,
                noAccountsFoundDescription: (connection: string) => `Dodaj konto w ${connection} i zsynchronizuj to połączenie ponownie`,
                expensifyCardBannerTitle: 'Zdobądź kartę Expensify',
                expensifyCardBannerSubtitle:
                    'Korzystaj z cashbacku przy każdym zakupie w USA, zniżki do 50% na swój rachunek Expensify, nielimitowanych wirtualnych kart i wielu innych korzyści.',
                expensifyCardBannerLearnMoreButton: 'Dowiedz się więcej',
                statementCloseDateTitle: 'Data zamknięcia wyciągu',
                statementCloseDateDescription: 'Daj nam znać, kiedy kończy się okres rozliczeniowy Twojej karty, a utworzymy pasujące zestawienie w Expensify.',
            },
            workflows: {
                title: 'Przepływy pracy',
                subtitle: 'Skonfiguruj sposób zatwierdzania i opłacania wydatków.',
                disableApprovalPrompt:
                    'Karty Expensify z tego obszaru roboczego obecnie polegają na zatwierdzaniu przy określaniu swoich inteligentnych limitów. Zmień typy limitów wszystkich kart Expensify z inteligentnymi limitami, zanim wyłączysz zatwierdzanie.',
            },
            invoices: {
                title: 'Faktury',
                subtitle: 'Wysyłaj i otrzymuj faktury.',
            },
            categories: {
                title: 'Kategorie',
                subtitle: 'Śledź i porządkuj wydatki.',
            },
            tags: {
                title: 'Tagi',
                subtitle: 'Klasyfikuj koszty i śledź wydatki podlegające refakturowaniu.',
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
                subtitle: 'Synchronizuj plan kont i więcej.',
            },
            receiptPartners: {
                title: 'Partnerzy paragonów',
                subtitle: 'Automatycznie importuj paragony.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nie tak prędko...',
                featureEnabledText: 'Aby włączyć lub wyłączyć tę funkcję, musisz zmienić ustawienia importu księgowego.',
                disconnectText: 'Aby wyłączyć księgowość, musisz odłączyć połączenie księgowe od swojego workspace’u.',
                manageSettings: 'Zarządzaj ustawieniami',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Odłącz Uber',
                disconnectText: 'Aby wyłączyć tę funkcję, najpierw odłącz integrację Uber for Business.',
                description: 'Czy na pewno chcesz odłączyć tę integrację?',
                confirmText: 'Rozumiem',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nie tak prędko...',
                featureEnabledText:
                    'Karty Expensify w tym obszarze roboczym opierają się na przepływach akceptacji, aby określić swoje Inteligentne Limity.\n\nZmień typ limitu dla wszystkich kart z Inteligentnymi Limitami przed wyłączeniem przepływów pracy.',
                confirmText: 'Przejdź do kart Expensify',
            },
            rules: {
                title: 'Zasady',
                subtitle: 'Wymagaj paragonów, oznaczaj wysokie wydatki i więcej.',
            },
            timeTracking: {
                title: 'Czas',
                subtitle: 'Ustaw godzinową stawkę rozliczeniową do śledzenia czasu.',
                defaultHourlyRate: 'Domyślna stawka godzinowa',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Przykłady:',
            customReportNamesSubtitle: `<muted-text>Dostosuj tytuły raportów za pomocą naszych <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">rozbudowanych formuł</a>.</muted-text>`,
            customNameTitle: 'Domyślny tytuł raportu',
            customNameDescription: `Wybierz własną nazwę raportów wydatków, korzystając z naszych <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">zaawansowanych formuł</a>.`,
            customNameInputLabel: 'Imię',
            customNameEmailPhoneExample: 'E-mail lub telefon członka: {report:submit:from}',
            customNameStartDateExample: 'Data początkowa raportu: {report:startdate}',
            customNameWorkspaceNameExample: 'Nazwa przestrzeni roboczej: {report:workspacename}',
            customNameReportIDExample: 'ID raportu: {report:id}',
            customNameTotalExample: 'Suma: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Uniemożliwiaj członkom zmianę niestandardowych tytułów raportów',
        },
        reportFields: {
            addField: 'Dodaj pole',
            delete: 'Usuń pole',
            deleteFields: 'Usuń pola',
            findReportField: 'Znajdź pole raportu',
            deleteConfirmation: 'Czy na pewno chcesz usunąć to pole raportu?',
            deleteFieldsConfirmation: 'Czy na pewno chcesz usunąć te pola raportu?',
            emptyReportFields: {
                title: 'Nie utworzono żadnych pól raportu',
                subtitle: 'Dodaj własne pole (tekst, data lub lista rozwijana), które będzie widoczne na raportach.',
            },
            subtitle: 'Pola raportu dotyczą całych wydatków i mogą być pomocne, gdy chcesz poprosić o dodatkowe informacje.',
            disableReportFields: 'Wyłącz pola raportu',
            disableReportFieldsConfirmation: 'Na pewno? Pola tekstowe i daty zostaną usunięte, a listy wyłączone.',
            importedFromAccountingSoftware: 'Pola raportu poniżej są importowane z Twojego',
            textType: 'Tekst',
            dateType: 'Data',
            dropdownType: 'Lista',
            formulaType: 'Formuła',
            textAlternateText: 'Dodaj pole na dowolny tekst.',
            dateAlternateText: 'Dodaj kalendarz do wyboru daty.',
            dropdownAlternateText: 'Dodaj listę opcji do wyboru.',
            formulaAlternateText: 'Dodaj pole formuły.',
            nameInputSubtitle: 'Wybierz nazwę dla pola raportu.',
            typeInputSubtitle: 'Wybierz, jakiego typu pola raportu chcesz użyć.',
            initialValueInputSubtitle: 'Wprowadź wartość początkową, którą chcesz wyświetlić w polu raportu.',
            listValuesInputSubtitle: 'Te wartości pojawią się na liście rozwijanej pola raportu. Włączone wartości mogą być wybierane przez członków.',
            listInputSubtitle: 'Te wartości pojawią się na liście pól w Twoim raporcie. Włączeni członkowie mogą je wybierać.',
            deleteValue: 'Usuń wartość',
            deleteValues: 'Usuń wartości',
            disableValue: 'Wyłącz wartość',
            disableValues: 'Wyłącz wartości',
            enableValue: 'Włącz wartość',
            enableValues: 'Włącz wartości',
            emptyReportFieldsValues: {
                title: 'Nie utworzono żadnych wartości listy',
                subtitle: 'Dodaj niestandardowe wartości, które będą wyświetlane w raportach.',
            },
            deleteValuePrompt: 'Czy na pewno chcesz usunąć tę wartość listy?',
            deleteValuesPrompt: 'Czy na pewno chcesz usunąć te wartości listy?',
            listValueRequiredError: 'Wprowadź nazwę wartości listy',
            existingListValueError: 'Wartość listy o tej nazwie już istnieje',
            editValue: 'Edytuj wartość',
            listValues: 'Wypisz wartości',
            addValue: 'Dodaj wartość',
            existingReportFieldNameError: 'Pole raportu o tej nazwie już istnieje',
            reportFieldNameRequiredError: 'Wprowadź nazwę pola raportu',
            reportFieldTypeRequiredError: 'Wybierz typ pola raportu',
            circularReferenceError: 'To pole nie może odwoływać się do siebie. Zaktualizuj je.',
            reportFieldInitialValueRequiredError: 'Wybierz początkową wartość pola raportu',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania pola raportu. Spróbuj ponownie.',
        },
        tags: {
            tagName: 'Nazwa tagu',
            requiresTag: 'Członkowie muszą oznaczyć wszystkie wydatki',
            trackBillable: 'Śledź rozliczalne wydatki',
            customTagName: 'Niestandardowa nazwa tagu',
            enableTag: 'Włącz znacznik',
            enableTags: 'Włącz tagi',
            requireTag: 'Wymagaj znacznika',
            requireTags: 'Wymagaj tagów',
            notRequireTags: 'Nie wymagaj',
            disableTag: 'Wyłącz znacznik',
            disableTags: 'Wyłącz tagi',
            addTag: 'Dodaj tag',
            editTag: 'Edytuj znacznik',
            editTags: 'Edytuj tagi',
            findTag: 'Znajdź tag',
            subtitle: 'Tagi umożliwiają bardziej szczegółowe kategoryzowanie kosztów.',
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Używasz <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">tagów zależnych</a>. Możesz <a href="${importSpreadsheetLink}">zaimportować ponownie arkusz kalkulacyjny</a>, aby zaktualizować swoje tagi.</muted-text>`,
            emptyTags: {
                title: 'Nie utworzyłeś żadnych tagów',
                subtitle: 'Dodaj znacznik, aby śledzić projekty, lokalizacje, działy i nie tylko.',
                subtitleHTML: `<muted-text><centered-text>Dodaj tagi, aby śledzić projekty, lokalizacje, działy i nie tylko. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Dowiedz się więcej</a> o formatowaniu plików tagów do importu.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Twoje tagi są obecnie importowane z połączenia księgowego. Przejdź do sekcji <a href="${accountingPageURL}">księgowość</a>, aby wprowadzić zmiany.</centered-text></muted-text>`,
            },
            deleteTag: 'Usuń znacznik',
            deleteTags: 'Usuń tagi',
            deleteTagConfirmation: 'Czy na pewno chcesz usunąć ten znacznik?',
            deleteTagsConfirmation: 'Czy na pewno chcesz usunąć te tagi?',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania tagu, spróbuj ponownie',
            tagRequiredError: 'Nazwa tagu jest wymagana',
            existingTagError: 'Znacznik o tej nazwie już istnieje',
            invalidTagNameError: 'Nazwa tagu nie może wynosić 0. Wybierz inną wartość.',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania tagu, spróbuj ponownie',
            importedFromAccountingSoftware: 'Poniższe tagi zostały zaimportowane z Twojego',
            glCode: 'Kod księgowy GL',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu GL, spróbuj ponownie',
            tagRules: 'Zasady tagów',
            approverDescription: 'Osoba zatwierdzająca',
            importTags: 'Importuj tagi',
            importTagsSupportingText: 'Oznaczaj wydatki jednym typem tagu lub wieloma.',
            configureMultiLevelTags: 'Skonfiguruj swoją listę tagów do tagowania wielopoziomowego.',
            importMultiLevelTagsSupportingText: `Oto podgląd Twoich tagów. Jeśli wszystko wygląda dobrze, kliknij poniżej, aby je zaimportować.`,
            importMultiLevelTags: {
                firstRowTitle: 'Pierwszy wiersz to tytuł każdej listy tagów',
                independentTags: 'To są niezależne tagi',
                glAdjacentColumn: 'W sąsiedniej kolumnie znajduje się kod GL',
            },
            tagLevel: {
                singleLevel: 'Pojedynczy poziom tagów',
                multiLevel: 'Wielopoziomowe tagi',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Przełącz poziomy znaczników',
                prompt1: 'Zmiana poziomów tagów spowoduje usunięcie wszystkich obecnych tagów.',
                prompt2: 'Najpierw sugerujemy, abyś',
                prompt3: 'pobierz kopię zapasową',
                prompt4: 'poprzez wyeksportowanie Twoich tagów.',
                prompt5: 'Dowiedz się więcej',
                prompt6: 'o poziomach tagów.',
            },
            overrideMultiTagWarning: {
                title: 'Importuj tagi',
                prompt1: 'Czy na pewno?',
                prompt2: 'Istniejące tagi zostaną nadpisane, ale możesz',
                prompt3: 'pobierz kopię zapasową',
                prompt4: 'najpierw.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `Znaleźliśmy *${columnCounts} kolumn* w Twoim arkuszu kalkulacyjnym. Wybierz *Nazwa* obok kolumny, która zawiera nazwy tagów. Możesz też wybrać *Włączone* obok kolumny, która ustawia status tagów.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Nie można usunąć ani wyłączyć wszystkich tagów',
                description: `Co najmniej jeden znacznik musi pozostać włączony, ponieważ w Twoim workspace używanie znaczników jest wymagane.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Nie można ustawić wszystkich tagów jako opcjonalnych',
                description: `Co najmniej jeden znacznik musi pozostać wymagany, ponieważ ustawienia Twojego workspace’u wymagają znaczników.`,
            },
            cannotMakeTagListRequired: {
                title: 'Nie można ustawić listy tagów jako wymaganej',
                description: 'Możesz ustawić listę tagów jako wymaganą tylko wtedy, gdy w Twojej polityce skonfigurowano wiele poziomów tagów.',
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
            taxReclaimableOn: 'Podatek możliwy do odzyskania z',
            taxRate: 'Stawka podatku',
            findTaxRate: 'Znajdź stawkę podatku',
            error: {
                taxRateAlreadyExists: 'Ta nazwa podatku jest już używana',
                taxCodeAlreadyExists: 'Ten kod podatkowy jest już w użyciu',
                valuePercentageRange: 'Wprowadź prawidłowy procent w zakresie od 0 do 100',
                customNameRequired: 'Niestandardowa nazwa podatku jest wymagana',
                deleteFailureMessage: 'Wystąpił błąd podczas usuwania stawki podatku. Spróbuj ponownie lub poproś o pomoc Concierge.',
                updateFailureMessage: 'Wystąpił błąd podczas aktualizowania stawki podatku. Spróbuj ponownie lub poproś o pomoc Concierge.',
                createFailureMessage: 'Wystąpił błąd podczas tworzenia stawki podatku. Spróbuj ponownie lub poproś Concierge o pomoc.',
                updateTaxClaimableFailureMessage: 'Część podlegająca zwrotowi musi być mniejsza niż kwota stawki za kilometr',
            },
            deleteTaxConfirmation: 'Czy na pewno chcesz usunąć ten podatek?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Czy na pewno chcesz usunąć ${taxAmount} podatków?`,
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
            importedFromAccountingSoftware: 'Poniższe podatki są zaimportowane z Twojego',
            taxCode: 'Kod podatkowy',
            updateTaxCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu podatkowego, spróbuj ponownie',
        },
        duplicateWorkspace: {
            title: 'Nazwij nową przestrzeń roboczą',
            selectFeatures: 'Wybierz funkcje do skopiowania',
            whichFeatures: 'Które funkcje chcesz skopiować do swojego nowego obszaru roboczego?',
            confirmDuplicate: 'Czy chcesz kontynuować?',
            categories: 'kategorie i twoje reguły automatycznego kategoryzowania',
            reimbursementAccount: 'konto zwrotu kosztów',
            welcomeNote: 'Zacznij proszę korzystać z mojego nowego przestrzeni roboczej',
            delayedSubmission: 'opóźnione przesłanie',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Za chwilę utworzysz i udostępnisz ${newWorkspaceName ?? ''} ${totalMembers ?? 0} członkom z oryginalnej przestrzeni roboczej.`,
            error: 'Wystąpił błąd podczas duplikowania Twojego nowego obszaru roboczego. Spróbuj ponownie.',
        },
        emptyWorkspace: {
            title: 'Nie masz żadnych przestrzeni roboczych',
            subtitle: 'Śledź paragony, rozliczaj wydatki, zarządzaj podróżami, wysyłaj faktury i nie tylko.',
            createAWorkspaceCTA: 'Rozpocznij',
            features: {
                trackAndCollect: 'Śledź i zbieraj paragony',
                reimbursements: 'Zwracaj wydatki pracownikom',
                companyCards: 'Zarządzaj kartami firmowymi',
            },
            notFound: 'Nie znaleziono żadnego przestrzeni roboczej',
            description: 'Pokoje świetnie nadają się do dyskusji i współpracy z wieloma osobami. Aby rozpocząć współpracę, utwórz lub dołącz do przestrzeni roboczej',
        },
        new: {
            newWorkspace: 'Nowa przestrzeń robocza',
            getTheExpensifyCardAndMore: 'Zdobądź kartę Expensify i więcej',
            confirmWorkspace: 'Potwierdź przestrzeń roboczą',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mój obszar roboczy grupy${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Wystąpił błąd podczas usuwania członka z przestrzeni roboczej, spróbuj ponownie',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Czy na pewno chcesz usunąć ${memberName}?`,
                other: 'Czy na pewno chcesz usunąć tych członków?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} jest osobą zatwierdzającą w tym obszarze roboczym. Gdy przestaniesz udostępniać im ten obszar roboczy, zastąpimy ich w przepływie zatwierdzania właścicielem obszaru roboczego, ${ownerName}`,
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
            makeMember: () => ({
                one: 'Uczyń członkiem',
                other: 'Ustaw jako członków',
            }),
            makeAdmin: () => ({
                one: 'Ustaw jako administratora',
                other: 'Ustaw jako administratorów',
            }),
            makeAuditor: () => ({
                one: 'Utwórz audytora',
                other: 'Utwórz audytorów',
            }),
            selectAll: 'Zaznacz wszystko',
            error: {
                genericAdd: 'Wystąpił problem z dodaniem tego członka przestrzeni roboczej',
                cannotRemove: 'Nie możesz usunąć siebie ani właściciela przestrzeni roboczej',
                genericRemove: 'Wystąpił problem z usunięciem tego członka przestrzeni roboczej',
            },
            addedWithPrimary: 'Niektóre osoby zostały dodane przy użyciu swoich głównych loginów.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Dodane przez dodatkowy login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Łączna liczba członków przestrzeni roboczej: ${count}`,
            importMembers: 'Zaimportuj członków',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${approver} z tej przestrzeni roboczej, zastąpimy tę osobę w procesie zatwierdzania przez ${workspaceOwner}, właściciela przestrzeni roboczej.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} ma zaległe raporty wydatków do zatwierdzenia. Poproś tę osobę o ich zatwierdzenie lub przejmij kontrolę nad jej raportami, zanim usuniesz ją z przestrzeni roboczej.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Nie możesz usunąć ${memberName} z tego obszaru roboczego. Ustaw nową osobę rozliczającą w Workflows > Make or track payments, a następnie spróbuj ponownie.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${memberName} z tego workspace’u, zastąpimy go jako preferowaną osobę eksportującą przez ${workspaceOwner}, właściciela workspace’u.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${memberName} z tego obszaru roboczego, zastąpimy tę osobę jako kontakt techniczny użytkownikiem ${workspaceOwner}, właścicielem obszaru roboczego.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} ma zaległy raport w trakcie przetwarzania, który wymaga działania. Poproś tę osobę o wykonanie wymaganej akcji przed usunięciem jej ze przestrzeni roboczej.`,
        },
        card: {
            getStartedIssuing: 'Zacznij od wydania swojej pierwszej wirtualnej lub fizycznej karty.',
            issueCard: 'Wydaj kartę',
            issueNewCard: {
                whoNeedsCard: 'Kto potrzebuje karty?',
                inviteNewMember: 'Zaproś nowego członka',
                findMember: 'Znajdź członka',
                chooseCardType: 'Wybierz typ karty',
                physicalCard: 'Karta fizyczna',
                physicalCardDescription: 'Świetne dla osób często wydających pieniądze',
                virtualCard: 'Karta wirtualna',
                virtualCardDescription: 'Natychmiastowe i elastyczne',
                chooseLimitType: 'Wybierz typ limitu',
                smartLimit: 'Inteligentny limit',
                smartLimitDescription: 'Wydawaj do określonej kwoty przed wymaganiem zatwierdzenia',
                monthly: 'Miesięcznie',
                monthlyDescription: 'Wydawaj do określonej kwoty miesięcznie',
                fixedAmount: 'Stała kwota',
                fixedAmountDescription: 'Wydaj jednorazowo do określonej kwoty',
                setLimit: 'Ustaw limit',
                cardLimitError: 'Wprowadź kwotę mniejszą niż 21 474 836 $',
                giveItName: 'Nadaj nazwę',
                giveItNameInstruction: 'Uczyń ją na tyle unikalną, by można ją było odróżnić od innych kart. Konkretne zastosowania są jeszcze lepsze!',
                cardName: 'Nazwa karty',
                letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
                willBeReadyToUse: 'Ta karta będzie gotowa do użycia natychmiast.',
                willBeReadyToShip: 'Ta karta będzie gotowa do natychmiastowej wysyłki.',
                cardholder: 'Posiadacz karty',
                cardType: 'Typ karty',
                limit: 'Limit',
                limitType: 'Typ limitu',
                disabledApprovalForSmartLimitError: 'Włącz zatwierdzanie w <strong>Przepływy pracy > Dodaj zatwierdzanie</strong> przed skonfigurowaniem inteligentnych limitów',
            },
            deactivateCardModal: {
                deactivate: 'Dezaktywuj',
                deactivateCard: 'Dezaktywuj kartę',
                deactivateConfirmation: 'Dezaktywacja tej karty spowoduje odrzucenie wszystkich przyszłych transakcji i nie będzie można jej cofnąć.',
            },
        },
        accounting: {
            settings: 'ustawienia',
            title: 'Połączenia',
            subtitle: 'Połącz się ze swoim systemem księgowym, aby księgować transakcje według planu kont, automatycznie dopasowywać płatności i utrzymywać finanse w synchronizacji.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Porozmawiaj ze swoim specjalistą ds. konfiguracji.',
            talkYourAccountManager: 'Porozmawiaj z opiekunem swojego konta.',
            talkToConcierge: 'Czat z Concierge.',
            needAnotherAccounting: 'Potrzebujesz innego programu księgowego?',
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
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `Wystąpił błąd z połączeniem skonfigurowanym w Expensify Classic. [Przejdź do Expensify Classic, aby rozwiązać ten problem.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Przejdź do Expensify Classic, aby zarządzać swoimi ustawieniami.',
            setup: 'Połącz',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Ostatnia synchronizacja: ${relativeDate}`,
            notSync: 'Niezsynchronizowane',
            import: 'Importuj',
            export: 'Eksportuj',
            advanced: 'Zaawansowane',
            other: 'Inne',
            syncNow: 'Synchronizuj teraz',
            disconnect: 'Odłącz',
            reinstall: 'Zainstaluj ponownie łącznik',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integracja';
                return `Odłącz ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Połącz ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integracja z księgowością'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Nie można połączyć się z QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Nie można połączyć z Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Nie można połączyć z NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Nie można połączyć z QuickBooks Desktop';
                    default: {
                        return 'Nie można połączyć z integracją';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Domyślne ustawienie pracownika NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'ta integracja';
                return `Czy na pewno chcesz odłączyć ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Czy na pewno chcesz połączyć ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'ta integracja księgowa'}? Spowoduje to usunięcie wszystkich istniejących połączeń księgowych.`,
            enterCredentials: 'Wprowadź swoje dane logowania',
            claimOffer: {
                badgeText: 'Oferta dostępna!',
                xero: {
                    headline: 'Korzystaj z Xero za darmo przez 6 miesięcy!',
                    description: '<muted-text><centered-text>Nowy w Xero? Klienci Expensify otrzymują 6 miesięcy za darmo. Skorzystaj z oferty poniżej.</centered-text></muted-text>',
                    connectButton: 'Połącz z Xero',
                },
                uber: {
                    headerTitle: 'Uber dla Firm',
                    headline: 'Otrzymaj 5% zniżki na przejazdy Uberem',
                    description: `<muted-text><centered-text>Aktywuj Uber for Business przez Expensify i oszczędzaj 5% na wszystkich przejazdach służbowych do czerwca. <a href="${CONST.UBER_TERMS_LINK}">Obowiązują warunki.</a></centered-text></muted-text>`,
                    connectButton: 'Połącz z Uber for Business',
                },
            },
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
                            return 'Synchronizowanie rozliczonych raportów i płatności rachunków';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importowanie kodów podatkowych';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Sprawdzanie połączenia z QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importowanie danych z QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importowanie danych z Xero';
                        case 'startingImportQBO':
                            return 'Importowanie danych z QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importowanie danych z QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importowanie tytułu';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importowanie certyfikatu zatwierdzania';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importowanie wymiarów';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importowanie polityki zapisu';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Trwa nadal synchronizacja danych z QuickBooks... Upewnij się, że Web Connector jest uruchomiony';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Synchronizowanie danych QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Wczytywanie danych';
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
                            return 'Oznaczanie rachunków i faktur Xero jako opłaconych';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronizowanie kategorii śledzenia';
                        case 'xeroSyncImportBankAccounts':
                            return 'Synchronizowanie kont bankowych';
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
                            return 'Importowanie pozycji';
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
                            return 'Importowanie danych jako tagów Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Aktualizowanie informacji o połączeniu';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Oznaczanie raportów Expensify jako zrefundowane';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Oznaczanie rachunków i faktur NetSuite jako opłaconych';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importowanie dostawców';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importowanie list niestandardowych';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importowanie list niestandardowych';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importowanie spółek zależnych';
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
                            return `Brak tłumaczenia dla etapu: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Preferowany eksporter',
            exportPreferredExporterNote:
                'Preferowanym eksporterem może być dowolny administrator przestrzeni roboczej, ale musi on być także administratorem domeny, jeśli ustawisz różne konta eksportu dla poszczególnych kart firmowych w ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy w swoim koncie raporty do eksportu.',
            exportAs: 'Eksportuj jako',
            exportOutOfPocket: 'Eksportuj wydatki z własnej kieszeni jako',
            exportCompanyCard: 'Eksportuj wydatki z firmowych kart jako',
            exportDate: 'Data eksportu',
            defaultVendor: 'Domyślny dostawca',
            autoSync: 'Automatyczna synchronizacja',
            autoSyncDescription: 'Synchronizuj NetSuite i Expensify automatycznie, każdego dnia. Eksportuj sfinalizowany raport w czasie rzeczywistym',
            reimbursedReports: 'Synchronizuj rozliczone raporty',
            cardReconciliation: 'Uzgadnianie karty',
            reconciliationAccount: 'Konto rozliczeniowe',
            continuousReconciliation: 'Ciągła rekonsyliacja',
            saveHoursOnReconciliation:
                'Zaoszczędź wiele godzin na uzgadnianiu sald w każdym okresie rozliczeniowym, pozwalając Expensify na ciągłe uzgadnianie w Twoim imieniu wyciągów i rozliczeń karty Expensify Card.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Aby włączyć Ciągłe uzgadnianie, włącz proszę <a href="${accountingAdvancedSettingsLink}">automatyczną synchronizację</a> dla ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wybierz konto bankowe, z którym zostaną uzgodnione płatności kartą Expensify.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Upewnij się, że to konto jest zgodne z <a href="${settlementAccountUrl}">kontem rozliczeniowym karty Expensify</a> (kończącym się na ${lastFourPAN}), aby Ciągłe Uzgadnianie działało prawidłowo.`,
            },
        },
        export: {
            notReadyHeading: 'Niegotowe do eksportu',
            notReadyDescription: 'Szkiców ani oczekujących raportów wydatków nie można wyeksportować do systemu księgowego. Zatwierdź lub opłać te wydatki przed ich eksportem.',
        },
        invoices: {
            sendInvoice: 'Wyślij fakturę',
            sendFrom: 'Wyślij z',
            invoicingDetails: 'Szczegóły faktury',
            invoicingDetailsDescription: 'Te informacje pojawią się na Twoich fakturach.',
            companyName: 'Nazwa firmy',
            companyWebsite: 'Strona internetowa firmy',
            paymentMethods: {
                personal: 'Osobiste',
                business: 'Firma',
                chooseInvoiceMethod: 'Wybierz poniższą metodę płatności:',
                payingAsIndividual: 'Płacenie jako osoba prywatna',
                payingAsBusiness: 'Płacę jako firma',
            },
            invoiceBalance: 'Saldo faktury',
            invoiceBalanceSubtitle: 'To jest Twoje bieżące saldo z tytułu otrzymanych płatności faktur. Zostanie automatycznie przelane na Twoje konto bankowe, jeśli je dodałeś.',
            bankAccountsSubtitle: 'Dodaj konto bankowe, aby wysyłać i odbierać płatności za faktury.',
        },
        invite: {
            member: 'Zaproś członka',
            members: 'Zaproś członków',
            invitePeople: 'Zaproś nowych członków',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Spróbuj ponownie.',
            pleaseEnterValidLogin: `Upewnij się, że adres e-mail lub numer telefonu jest prawidłowy (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'użytkownik',
            users: 'użytkownicy',
            invited: 'zaproszono',
            removed: 'usunięto',
            to: 'do',
            from: 'od',
        },
        inviteMessage: {
            confirmDetails: 'Potwierdź szczegóły',
            inviteMessagePrompt: 'Spraw, aby Twoje zaproszenie było jeszcze bardziej wyjątkowe, dodając poniżej wiadomość!',
            personalMessagePrompt: 'Wiadomość',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Spróbuj ponownie.',
            inviteNoMembersError: 'Wybierz co najmniej jednego członka do zaproszenia',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} poprosił(-a) o dołączenie do ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nie tak szybko…',
            workspaceNeeds: 'Obszar roboczy musi mieć włączoną co najmniej jedną stawkę za przejazd.',
            distance: 'Dystans',
            centrallyManage: 'Centralnie zarządzaj stawkami, śledź przejazdy w milach lub kilometrach i ustaw domyślną kategorię.',
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
            taxFeatureNotEnabledMessage:
                '<muted-text>Podatki muszą być włączone w przestrzeni roboczej, aby korzystać z tej funkcji. Przejdź do <a href="#">Więcej funkcji</a>, aby to zmienić.</muted-text>',
            deleteDistanceRate: 'Usuń stawkę za dystans',
            areYouSureDelete: () => ({
                one: 'Czy na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }),
            errors: {
                rateNameRequired: 'Nazwa stawki jest wymagana',
                existingRateName: 'Stawka za dystans o tej nazwie już istnieje',
            },
        },
        editor: {
            descriptionInputLabel: 'Opis',
            nameInputLabel: 'Imię',
            typeInputLabel: 'Typ',
            initialValueInputLabel: 'Wartość początkowa',
            nameInputHelpText: 'Ta nazwa będzie widoczna w Twojej przestrzeni roboczej.',
            nameIsRequiredError: 'Musisz nadać swojej przestrzeni roboczej nazwę',
            currencyInputLabel: 'Domyślna waluta',
            currencyInputHelpText: 'Wszystkie wydatki w tym obszarze roboczym zostaną przeliczone na tę walutę.',
            currencyInputDisabledText: (currency: string) => `Domyślna waluta nie może zostać zmieniona, ponieważ to miejsce pracy jest powiązane z rachunkiem bankowym w ${currency}.`,
            save: 'Zapisz',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania przestrzeni roboczej. Spróbuj ponownie.',
            avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Spróbuj ponownie.',
            addressContext: 'Adres przestrzeni roboczej jest wymagany, aby włączyć Expensify Travel. Wprowadź adres powiązany z Twoją firmą.',
            policy: 'Polityka wydatków',
        },
        bankAccount: {
            continueWithSetup: 'Kontynuuj konfigurację',
            youAreAlmostDone: 'Prawie skończyłeś(aś) konfigurowanie konta bankowego, które pozwoli Ci wydawać karty firmowe, zwracać wydatki, pobierać faktury i opłacać rachunki.',
            streamlinePayments: 'Usprawnij płatności',
            connectBankAccountNote: 'Uwaga: Prywatne konta bankowe nie mogą być używane do płatności w przestrzeniach roboczych.',
            oneMoreThing: 'Jeszcze jedna rzecz!',
            allSet: 'Wszystko gotowe!',
            accountDescriptionWithCards: 'To to konto bankowe będzie używane do wydawania kart firmowych, zwrotu wydatków, pobierania faktur i opłacania rachunków.',
            letsFinishInChat: 'Dokończmy to na czacie!',
            finishInChat: 'Zakończ na czacie',
            almostDone: 'Prawie gotowe!',
            disconnectBankAccount: 'Odłącz konto bankowe',
            startOver: 'Zacznij od początku',
            updateDetails: 'Zaktualizuj szczegóły',
            yesDisconnectMyBankAccount: 'Tak, odłącz moje konto bankowe',
            yesStartOver: 'Tak, zacznij od nowa',
            disconnectYourBankAccount: (bankName: string) =>
                `Odłącz swoje konto bankowe <strong>${bankName}</strong>. Wszystkie oczekujące transakcje dla tego konta zostaną nadal zrealizowane.`,
            clearProgress: 'Rozpoczęcie od nowa spowoduje usunięcie dotychczasowych postępów.',
            areYouSure: 'Czy na pewno?',
            workspaceCurrency: 'Waluta przestrzeni roboczej',
            updateCurrencyPrompt: 'Wygląda na to, że Twoje miejsce pracy ma obecnie ustawioną inną walutę niż USD. Kliknij przycisk poniżej, aby teraz zmienić walutę na USD.',
            updateToUSD: 'Zaktualizuj na USD',
            updateWorkspaceCurrency: 'Zaktualizuj walutę przestrzeni roboczej',
            workspaceCurrencyNotSupported: 'Waluta workspace’u nie jest obsługiwana',
            yourWorkspace: `Twoje środowisko pracy jest ustawione na nieobsługiwaną walutę. Zobacz <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">listę obsługiwanych walut</a>.`,
            chooseAnExisting: 'Wybierz istniejące konto bankowe do opłacania wydatków lub dodaj nowe.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Przenieś właściciela',
            addPaymentCardTitle: 'Wprowadź swoją kartę płatniczą, aby przenieść własność',
            addPaymentCardButtonText: 'Zaakceptuj warunki i dodaj kartę płatniczą',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Przeczytaj i zaakceptuj <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">warunki</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">politykę prywatności</a>, aby dodać kartę.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Zgodne z PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Szyfrowanie na poziomie bankowym',
            addPaymentCardRedundant: 'Nadmiarowa infrastruktura',
            addPaymentCardLearnMore: `<muted-text>Dowiedz się więcej o naszym <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">zabezpieczeniu danych</a>.</muted-text>`,
            amountOwedTitle: 'Zaległe saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Na tym koncie jest zaległe saldo z poprzedniego miesiąca.\n\nCzy chcesz uregulować to saldo i przejąć rozliczanie tego obszaru roboczego?',
            ownerOwesAmountTitle: 'Zaległe saldo',
            ownerOwesAmountButtonText: 'Przenieś saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Konto będące właścicielem tego obszaru roboczego (${email}) ma zaległe saldo z poprzedniego miesiąca.

Czy chcesz przenieść tę kwotę (${amount}), aby przejąć rozliczenia za ten obszar roboczy? Twoja karta płatnicza zostanie obciążona natychmiast.`,
            subscriptionTitle: 'Przejmij roczną subskrypcję',
            subscriptionButtonText: 'Przenieś subskrypcję',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Przejęcie tej przestrzeni roboczej połączy jej roczną subskrypcję z Twoją obecną subskrypcją. Zwiększy to wielkość Twojej subskrypcji o ${usersCount} członków, dzięki czemu nowa wielkość subskrypcji wyniesie ${finalCount}. Czy chcesz kontynuować?`,
            duplicateSubscriptionTitle: 'Alert o zduplikowanej subskrypcji',
            duplicateSubscriptionButtonText: 'Kontynuuj',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Wygląda na to, że próbujesz przejąć rozliczenia dla przestrzeni roboczych użytkownika ${email}, ale aby to zrobić, najpierw musisz być administratorem wszystkich jego przestrzeni roboczych.

Kliknij „Kontynuuj”, jeśli chcesz przejąć rozliczenia tylko dla przestrzeni roboczej ${workspaceName}.

Jeśli chcesz przejąć rozliczenia całej ich subskrypcji, poproś ich najpierw o dodanie Cię jako administratora do wszystkich ich przestrzeni roboczych, a dopiero potem przejmij rozliczenia.`,
            hasFailedSettlementsTitle: 'Nie można przenieść własności',
            hasFailedSettlementsButtonText: 'Rozumiem',
            hasFailedSettlementsText: (email: string) =>
                `Nie możesz przejąć rozliczeń, ponieważ ${email} ma zaległe rozliczenie karty Expensify Card. Poproś tę osobę o kontakt z concierge@expensify.com w celu rozwiązania problemu. Następnie będziesz mógł/mogła przejąć rozliczenia dla tego miejsca pracy.`,
            failedToClearBalanceTitle: 'Nie udało się wyczyścić salda',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Nie udało się wyczyścić salda. Spróbuj ponownie później.',
            successTitle: 'Juhu! Wszystko gotowe.',
            successDescription: 'Jesteś teraz właścicielem tego obszaru roboczego.',
            errorTitle: 'Ups! Nie tak szybko…',
            errorDescription: `<muted-text><centered-text>Wystąpił problem podczas przenoszenia własności tego workspace’u. Spróbuj ponownie lub <concierge-link>skontaktuj się z Concierge</concierge-link>, aby uzyskać pomoc.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Uwaga!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Następujące raporty zostały już wyeksportowane do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Na pewno chcesz wyeksportować je ponownie?`,
            confirmText: 'Tak, wyeksportuj ponownie',
            cancelText: 'Anuluj',
        },
        upgrade: {
            reportFields: {
                title: 'Pola raportu',
                description: `Pola raportu pozwalają określić szczegóły na poziomie nagłówka, inne niż tagi odnoszące się do wydatków w poszczególnych pozycjach. Te szczegóły mogą obejmować konkretne nazwy projektów, informacje o podróży służbowej, lokalizacje i inne.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Pola raportu są dostępne tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Korzystaj z automatycznej synchronizacji i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + NetSuite. Uzyskaj szczegółowe, aktualne w czasie rzeczywistym informacje finansowe dzięki obsłudze natywnych i niestandardowych segmentów, w tym mapowania projektów i klientów.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z NetSuite jest dostępna tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Korzystaj z automatycznej synchronizacji i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + Sage Intacct. Uzyskaj szczegółowe, aktualizowane w czasie rzeczywistym informacje finansowe z wykorzystaniem zdefiniowanych przez użytkownika wymiarów, a także kodowania wydatków według działu, klasy, lokalizacji, klienta i projektu (zadań).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z Sage Intacct jest dostępna tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Korzystaj z automatycznej synchronizacji i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + QuickBooks Desktop. Zyskaj maksymalną efektywność dzięki dwukierunkowemu połączeniu w czasie rzeczywistym oraz kategoryzacji wydatków według klasy, pozycji, klienta i projektu.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z QuickBooks Desktop jest dostępna tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Zaawansowane zatwierdzanie',
                description: `Jeśli chcesz dodać więcej poziomów zatwierdzania – albo po prostu upewnić się, że największe wydatki zostaną sprawdzone przez dodatkową osobę – mamy na to rozwiązanie. Zaawansowane zatwierdzanie pomaga wdrożyć odpowiednie mechanizmy kontroli na każdym poziomie, aby utrzymać wydatki zespołu pod kontrolą.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Zaawansowane zatwierdzanie jest dostępne tylko w planie Control, który zaczyna się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            categories: {
                title: 'Kategorie',
                description: 'Kategorie umożliwiają śledzenie i porządkowanie wydatków. Skorzystaj z naszych domyślnych kategorii lub dodaj własne.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorie są dostępne w planie Collect, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            glCodes: {
                title: 'Konta księgi głównej',
                description: `Dodaj kody GL do swoich kategorii i tagów, aby łatwo eksportować wydatki do systemów księgowych i kadrowo-płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody GL są dostępne tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Kody księgi głównej i płacowe',
                description: `Dodaj kody księgowe i płacowe do swoich kategorii, aby łatwo eksportować wydatki do systemów księgowych i kadrowo‑płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Konta księgi głównej i kody płacowe są dostępne wyłącznie w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Kody podatkowe',
                description: `Dodaj kody podatkowe do swoich podatków, aby łatwo eksportować wydatki do systemów księgowych i kadrowo‑płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody podatkowe są dostępne tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            companyCards: {
                title: 'Nielimitowane karty firmowe',
                description: `Potrzebujesz dodać więcej zasileń kart? Odblokuj nielimitowane karty firmowe, aby synchronizować transakcje od wszystkich głównych wydawców kart.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>To jest dostępne tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            rules: {
                title: 'Zasady',
                description: `Reguły działają w tle i utrzymują Twoje wydatki pod kontrolą, dzięki czemu nie musisz przejmować się drobiazgami.

Wymagaj szczegółów wydatków, takich jak paragony i opisy, ustawiaj limity i wartości domyślne oraz automatyzuj akceptacje i płatności – wszystko w jednym miejscu.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Zasady są dostępne tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            perDiem: {
                title: 'Dieta',
                description:
                    'Ryczałt dzienny to świetny sposób, aby utrzymać codzienne koszty zgodne z zasadami i przewidywalne, gdy Twoi pracownicy podróżują. Korzystaj z funkcji takich jak stawki niestandardowe, domyślne kategorie oraz bardziej szczegółowe dane, na przykład miejsca docelowe i podstawkowania.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Ryczałty dzienne są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            travel: {
                title: 'Podróże',
                description:
                    'Expensify Travel to nowa korporacyjna platforma do rezerwowania i zarządzania podróżami służbowymi, która umożliwia członkom rezerwację noclegów, lotów, transportu i nie tylko.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Podróże są dostępne w planie Collect, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            reports: {
                title: 'Raporty',
                description: 'Raporty pozwalają grupować wydatki, aby ułatwić ich śledzenie i organizację.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Raporty są dostępne w planie Collect, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Wielopoziomowe tagi',
                description:
                    'Wielopoziomowe tagi pomagają precyzyjniej śledzić wydatki. Przypisuj wiele tagów do każdej pozycji — na przykład dział, klienta lub ośrodek kosztów — aby uchwycić pełny kontekst każdego wydatku. Umożliwia to bardziej szczegółowe raportowanie, przepływy akceptacji i eksporty księgowe.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Wielopoziomowe tagi są dostępne wyłącznie w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Stawki za odległość',
                description: 'Twórz i zarządzaj własnymi stawkami, śledź przejazdy w milach lub kilometrach oraz ustaw domyślne kategorie dla wydatków odległościowych.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Stawki za przejazdy są dostępne w planie Collect, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            auditor: {
                title: 'Audytor',
                description: 'Audytorzy otrzymują dostęp tylko do odczytu do wszystkich raportów, zapewniający pełną widoczność i monitorowanie zgodności.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Audytorzy są dostępni tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Wiele poziomów zatwierdzania',
                description:
                    'Wiele poziomów zatwierdzania to narzędzie do zarządzania procesem dla firm, które wymagają, aby więcej niż jedna osoba zatwierdziła raport, zanim zostanie on rozliczony.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Wiele poziomów akceptacji jest dostępnych tylko w planie Control, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'na aktywnego członka miesięcznie.',
                perMember: 'za członka za miesiąc.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Przejdź na wyższy plan, aby uzyskać dostęp do tej funkcji, lub <a href="${subscriptionLink}">dowiedz się więcej</a> o naszych planach i cenach.</muted-text>`,
            upgradeToUnlock: 'Odblokuj tę funkcję',
            completed: {
                headline: `Zaktualizowano Twoją przestrzeń roboczą!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Udało się pomyślnie uaktualnić ${policyName} do planu Control! <a href="${subscriptionLink}">Wyświetl swoją subskrypcję</a>, aby uzyskać więcej szczegółów.</centered-text>`,
                categorizeMessage: `Pomyślnie uaktualniono do planu Collect. Teraz możesz kategoryzować swoje wydatki!`,
                travelMessage: `Pomyślnie uaktualniono do planu Collect. Teraz możesz zacząć rezerwować i zarządzać podróżami!`,
                distanceRateMessage: `Pomyślnie uaktualniono plan do Collect. Teraz możesz zmienić stawkę za dystans!`,
                gotIt: 'Jasne, dzięki',
                createdWorkspace: `Utworzono miejsce pracy!`,
            },
            commonFeatures: {
                title: 'Uaktualnij do planu Control',
                note: 'Odblokuj nasze najmocniejsze funkcje, w tym:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Plan Control zaczyna się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `na aktywnego członka miesięcznie.`} <a href="${learnMoreMethodsRoute}">Dowiedz się więcej</a> o naszych planach i cenach.</muted-text>`,
                    benefit1: 'Zaawansowane integracje księgowe (NetSuite, Sage Intacct i inne)',
                    benefit2: 'Inteligentne reguły wydatków',
                    benefit3: 'Wielopoziomowe procesy zatwierdzania',
                    benefit4: 'Zaawansowane zabezpieczenia',
                    toUpgrade: 'Aby uaktualnić, kliknij',
                    selectWorkspace: 'wybierz przestrzeń roboczą i zmień typ planu na',
                },
                upgradeWorkspaceWarning: `Nie można uaktualnić przestrzeni roboczej`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt:
                    'Twoja firma ograniczyła możliwość tworzenia przestrzeni roboczych. Skontaktuj się z administratorem, aby uzyskać pomoc.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Zmień plan na Collect',
                note: 'Jeśli zmienisz plan na tańszy, stracisz dostęp do tych i innych funkcji:',
                benefits: {
                    note: 'Aby zobaczyć pełne porównanie naszych planów, sprawdź nasze',
                    pricingPage: 'strona cennika',
                    confirm: 'Czy na pewno chcesz przejść na niższy plan i usunąć swoją konfigurację?',
                    warning: 'Tej operacji nie można cofnąć.',
                    benefit1: 'Połączenia księgowe (z wyjątkiem QuickBooks Online i Xero)',
                    benefit2: 'Inteligentne reguły wydatków',
                    benefit3: 'Wielopoziomowe procesy zatwierdzania',
                    benefit4: 'Zaawansowane zabezpieczenia',
                    headsUp: 'Uwaga!',
                    multiWorkspaceNote:
                        'Przed pierwszą miesięczną płatnością musisz obniżyć plan wszystkich swoich przestrzeni roboczych, aby rozpocząć subskrypcję w taryfie Collect. Kliknij',
                    selectStep: '> wybierz każdą przestrzeń roboczą > zmień typ planu na',
                },
            },
            completed: {
                headline: 'Twoje środowisko pracy zostało zdegradowane',
                description: 'Masz inne przestrzenie robocze w planie Control. Aby być rozliczanym według stawki Collect, musisz obniżyć plan wszystkich przestrzeni roboczych.',
                gotIt: 'Jasne, dzięki',
            },
        },
        payAndDowngrade: {
            title: 'Zapłać i obniż plan',
            headline: 'Twoja ostatnia płatność',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Twój ostatni rachunek za tę subskrypcję wyniesie <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Zobacz swoje zestawienie poniżej za ${date}:`,
            subscription:
                'Uwaga! Ta akcja zakończy Twoją subskrypcję Expensify, usunie tę przestrzeń roboczą i usunie wszystkich jej członków. Jeśli chcesz zachować tę przestrzeń roboczą i usunąć tylko siebie, poproś innego administratora, aby najpierw przejął rozliczenia.',
            genericFailureMessage: 'Wystąpił błąd podczas opłacania rachunku. Spróbuj ponownie.',
        },
        restrictedAction: {
            restricted: 'Ograniczone',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Działania w przestrzeni roboczej ${workspaceName} są obecnie ograniczone`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Właściciel przestrzeni roboczej, ${workspaceOwnerName}, musi dodać lub zaktualizować zapisaną kartę płatniczą, aby odblokować nowe działania w przestrzeni.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Aby odblokować nowe działania w przestrzeni roboczej, musisz dodać lub zaktualizować zapisaną kartę płatniczą.',
            addPaymentCardToUnlock: 'Dodaj kartę płatniczą, aby odblokować!',
            addPaymentCardToContinueUsingWorkspace: 'Dodaj kartę płatniczą, aby dalej korzystać z tego obszaru roboczego',
            pleaseReachOutToYourWorkspaceAdmin: 'W razie pytań skontaktuj się z administratorem swojego przestrzeni roboczej.',
            chatWithYourAdmin: 'Czatuj ze swoim administratorem',
            chatInAdmins: 'Czatuj na #admins',
            addPaymentCard: 'Dodaj kartę płatniczą',
            goToSubscription: 'Przejdź do subskrypcji',
        },
        rules: {
            individualExpenseRules: {
                title: 'Wydatki',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Ustaw limity wydatków i domyślne wartości dla poszczególnych wydatków. Możesz też utworzyć reguły dla <a href="${categoriesPageLink}">kategorii</a> i <a href="${tagsPageLink}">tagów</a>.</muted-text>`,
                receiptRequiredAmount: 'Wymagana kwota z paragonu',
                receiptRequiredAmountDescription: 'Wymagaj paragonów, gdy wydatki przekraczają tę kwotę, chyba że zastąpi to reguła kategorii.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Kwota nie może być większa niż wymagana kwota z wyszczególnionego rachunku (${amount})`,
                itemizedReceiptRequiredAmount: 'Wymagana kwota z rozbitego paragonu',
                itemizedReceiptRequiredAmountDescription: 'Wymagaj wyszczególnionych paragonów, gdy wydatek przekracza tę kwotę, chyba że zostanie zastąpione regułą kategorii.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Kwota nie może być niższa niż kwota wymagana dla zwykłych paragonów (${amount})`,
                maxExpenseAmount: 'Maksymalna kwota wydatku',
                maxExpenseAmountDescription: 'Oznacz wydatki przekraczające tę kwotę, chyba że zostanie to nadpisane przez regułę kategorii.',
                maxAge: 'Maksymalny wiek',
                maxExpenseAge: 'Maksymalny wiek wydatku',
                maxExpenseAgeDescription: 'Oznaczaj wydatki starsze niż określona liczba dni.',
                maxExpenseAgeDays: () => ({
                    one: '1 dzień',
                    other: (count: number) => `${count} dni`,
                }),
                cashExpenseDefault: 'Domyślne wydatki gotówkowe',
                cashExpenseDefaultDescription:
                    'Wybierz sposób tworzenia wydatków gotówkowych. Wydatek jest uznawany za wydatek gotówkowy, jeśli nie jest zaimportowaną transakcją z firmowej karty. Obejmuje to ręcznie utworzone wydatki, paragony, diety, przejechany dystans oraz wydatki za czas.',
                reimbursableDefault: 'Podlegające zwrotowi',
                reimbursableDefaultDescription: 'Wydatki najczęściej są zwracane pracownikom',
                nonReimbursableDefault: 'Nierefundowalne',
                nonReimbursableDefaultDescription: 'Wydatki są czasami zwracane pracownikom',
                alwaysReimbursable: 'Zawsze podlega zwrotowi',
                alwaysReimbursableDescription: 'Wydatki są zawsze zwracane pracownikom',
                alwaysNonReimbursable: 'Zawsze bez zwrotu kosztów',
                alwaysNonReimbursableDescription: 'Wydatki nigdy nie są zwracane pracownikom',
                billableDefault: 'Domyślnie fakturowane',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Wybierz, czy wydatki gotówkowe i kartą kredytową powinny być domyślnie fakturowalne. Fakturowanie wydatków włącza się lub wyłącza w <a href="${tagsPageLink}">tagach</a>.</muted-text>`,
                billable: 'Fakturowalne',
                billableDescription: 'Wydatki są najczęściej refakturowane klientom',
                nonBillable: 'Nierozliczalne',
                nonBillableDescription: 'Wydatki są okazjonalnie refakturowane klientom',
                eReceipts: 'eParagony',
                eReceiptsHint: `eParagony są automatycznie tworzone [dla większości transakcji kartą kredytową w USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Śledzenie uczestników',
                attendeeTrackingHint: 'Śledź koszt na osobę dla każdego wydatku.',
                prohibitedDefaultDescription:
                    'Oznacz wszelkie paragony, na których pojawia się alkohol, hazard lub inne zabronione pozycje. Wydatki z paragonami zawierającymi takie pozycje będą wymagały ręcznego sprawdzenia.',
                prohibitedExpenses: 'Wydatki niedozwolone',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Dodatkowe opłaty hotelowe',
                gambling: 'Hazard',
                tobacco: 'Tytoń',
                adultEntertainment: 'Rozrywka dla dorosłych',
                requireCompanyCard: 'Wymagaj używania kart firmowych do wszystkich zakupów',
                requireCompanyCardDescription: 'Oznacz wszystkie wydatki gotówkowe, w tym koszty za przejazdy i diety.',
            },
            expenseReportRules: {
                title: 'Zaawansowane',
                subtitle: 'Zautomatyzuj zgodność raportów wydatków, ich zatwierdzanie oraz płatności.',
                preventSelfApprovalsTitle: 'Zapobiegaj samodzielnemu zatwierdzaniu',
                preventSelfApprovalsSubtitle: 'Uniemożliwiaj członkom przestrzeni roboczej zatwierdzanie własnych raportów wydatków.',
                autoApproveCompliantReportsTitle: 'Automatycznie zatwierdzaj zgodne raporty',
                autoApproveCompliantReportsSubtitle: 'Skonfiguruj, które raporty wydatków kwalifikują się do automatycznego zatwierdzania.',
                autoApproveReportsUnderTitle: 'Automatycznie akceptuj raporty poniżej',
                autoApproveReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty będą zatwierdzane automatycznie.',
                randomReportAuditTitle: 'Losowa kontrola raportów',
                randomReportAuditDescription: 'Wymagaj ręcznego zatwierdzania niektórych raportów, nawet jeśli kwalifikują się do automatycznego zatwierdzenia.',
                autoPayApprovedReportsTitle: 'Automatycznie opłacaj zatwierdzone raporty',
                autoPayApprovedReportsSubtitle: 'Skonfiguruj, które raporty wydatków kwalifikują się do automatycznej płatności.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Wprowadź kwotę mniejszą niż ${currency ?? ''}20 000`,
                autoPayApprovedReportsLockedSubtitle: 'Przejdź do dodatkowych funkcji i włącz przepływy pracy, a następnie dodaj płatności, aby odblokować tę funkcję.',
                autoPayReportsUnderTitle: 'Automatycznie opłacaj raporty w ramach',
                autoPayReportsUnderDescription: 'W pełni zgodne raporty wydatków do tej kwoty zostaną automatycznie opłacone.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Dodaj ${featureName}, aby odblokować tę funkcję.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Przejdź do [więcej funkcji](${moreFeaturesLink}) i włącz ${featureName}, aby odblokować tę funkcję.`,
            },
            merchantRules: {
                title: 'Sprzedawca',
                subtitle: 'Ustaw reguły dla sprzedawców, aby wydatki trafiały z prawidłowym oznaczeniem i wymagały mniej poprawek.',
                addRule: 'Dodaj regułę sprzedawcy',
                addRuleTitle: 'Dodaj regułę',
                editRuleTitle: 'Edytuj regułę',
                expensesWith: 'Dla wydatków z:',
                expensesExactlyMatching: 'Dla wydatków dokładnie pasujących:',
                applyUpdates: 'Zastosuj te aktualizacje:',
                saveRule: 'Zapisz regułę',
                previewMatches: 'Podgląd dopasowań',
                confirmError: 'Wprowadź sprzedawcę i zastosuj co najmniej jedną zmianę',
                confirmErrorMerchant: 'Wprowadź sprzedawcę',
                confirmErrorUpdate: 'Zastosuj co najmniej jedną aktualizację',
                previewMatchesEmptyStateTitle: 'Nic do wyświetlenia',
                previewMatchesEmptyStateSubtitle: 'Żadne niewysłane wydatki nie pasują do tej reguły.',
                deleteRule: 'Usuń regułę',
                deleteRuleConfirmation: 'Na pewno chcesz usunąć tę regułę?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Jeśli sprzedawca ${isExactMatch ? 'dokładnie pasuje' : 'zawiera'} „${merchantName}”`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Zmień nazwę sprzedawcy na „${merchantName}”`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Zaktualizuj ${fieldName} na „${fieldValue}”`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Oznacz jako „${reimbursable ? 'podlegający zwrotowi' : 'niepodlegający zwrotowi'}”`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Oznacz jako „${billable ? 'fakturowalne' : 'niepodlegające fakturowaniu'}”`,
                matchType: 'Typ dopasowania',
                matchTypeContains: 'Zawiera',
                matchTypeExact: 'Dokładnie pasuje',
                duplicateRuleTitle: 'Podobna reguła sprzedawcy już istnieje',
                duplicateRulePrompt: (merchantName: string) => `Czy chcesz zapisać nową regułę dla „${merchantName}”, mimo że masz już istniejącą?`,
                saveAnyway: 'Zapisz mimo to',
                applyToExistingUnsubmittedExpenses: 'Zastosuj do istniejących niewysłanych wydatków',
            },
            categoryRules: {
                title: 'Reguły kategorii',
                approver: 'Osoba zatwierdzająca',
                requireDescription: 'Wymagany opis',
                requireFields: 'Wymagaj pól',
                requiredFieldsTitle: 'Pola obowiązkowe',
                requiredFieldsDescription: (categoryName: string) => `Zostanie to zastosowane do wszystkich wydatków zaklasyfikowanych jako <strong>${categoryName}</strong>.`,
                requireAttendees: 'Wymagaj uczestników',
                descriptionHint: 'Podpowiedź opisu',
                descriptionHintDescription: (categoryName: string) =>
                    `Przypomnij pracownikom o podaniu dodatkowych informacji dla wydatków w kategorii „${categoryName}”. Ta podpowiedź pojawi się w polu opisu wydatków.`,
                descriptionHintLabel: 'Podpowiedź',
                descriptionHintSubtitle: 'Pro tip: im krótsze, tym lepiej!',
                maxAmount: 'Maksymalna kwota',
                flagAmountsOver: 'Oznacz kwoty powyżej',
                flagAmountsOverDescription: (categoryName: string) => `Dotyczy kategorii „${categoryName}”.`,
                flagAmountsOverSubtitle: 'To zastępuje maksymalną kwotę dla wszystkich wydatków.',
                expenseLimitTypes: {
                    expense: 'Pojedynczy wydatek',
                    expenseSubtitle: 'Oflaguj kwoty wydatków według kategorii. Ta reguła zastępuje ogólną regułę maksymalnej kwoty wydatku w przestrzeni roboczej.',
                    daily: 'Suma kategorii',
                    dailySubtitle: 'Oznaczaj łączną dzienną kwotę wydatków według kategorii w każdym raporcie wydatków.',
                },
                requireReceiptsOver: 'Wymagaj paragonów powyżej',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Domyślna`,
                    never: 'Nigdy nie wymagaj paragonów',
                    always: 'Zawsze wymagaj paragonów',
                },
                requireItemizedReceiptsOver: 'Wymagaj wyszczególnionych paragonów powyżej',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Domyślna`,
                    never: 'Nigdy nie wymagaj wyszczególnionych paragonów',
                    always: 'Zawsze wymagaj wyszczególnionych paragonów',
                },
                defaultTaxRate: 'Domyślna stawka podatku',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Przejdź do [Więcej funkcji](${moreFeaturesLink}) i włącz przepływy pracy, a następnie dodaj zatwierdzenia, aby odblokować tę funkcję.`,
            },
            customRules: {
                title: 'Polityka wydatków',
                cardSubtitle: 'Tutaj znajduje się polityka wydatków Twojego zespołu, aby wszyscy mieli jasność co do tego, co jest objęte.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Pobierz',
                    description: 'Dla zespołów, które chcą zautomatyzować swoje procesy.',
                },
                corporate: {
                    label: 'Sterowanie',
                    description: 'Dla organizacji z zaawansowanymi wymaganiami.',
                },
            },
            description: 'Wybierz plan odpowiedni dla siebie. Szczegółową listę funkcji i cen znajdziesz w naszym',
            subscriptionLink: 'strona pomocy dotycząca typów planów i cen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Zobowiązałeś się do 1 aktywnego członka w planie Control do końca rocznej subskrypcji, czyli do ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję z płatnością za użycie i zmienić plan na Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
                other: `Zobowiązałeś(-aś) się do ${count} aktywnych członków w planie Control do zakończenia rocznej subskrypcji w dniu ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję z opłatą za użycie i zmienić plan na Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
            }),
            subscriptions: 'Subskrypcje',
        },
    },
    getAssistancePage: {
        title: 'Uzyskaj pomoc',
        subtitle: 'Jesteśmy tu, by utorować Ci drogę do wielkości!',
        description: 'Wybierz jedną z poniższych opcji wsparcia:',
        chatWithConcierge: 'Czat z Concierge',
        scheduleSetupCall: 'Umów rozmowę wdrożeniową',
        scheduleACall: 'Umów rozmowę',
        questionMarkButtonTooltip: 'Uzyskaj pomoc od naszego zespołu',
        exploreHelpDocs: 'Przeglądaj artykuły pomocy',
        registerForWebinar: 'Zarejestruj się na webinar',
        onboardingHelp: 'Pomoc przy wdrożeniu',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Zmień domyślny odcień skóry',
        headers: {
            frequentlyUsed: 'Często używane',
            smileysAndEmotion: 'Uśmieszki i emocje',
            peopleAndBody: 'Ludzie i ciało',
            animalsAndNature: 'Zwierzęta i przyroda',
            foodAndDrink: 'Jedzenie i napoje',
            travelAndPlaces: 'Podróże i miejsca',
            activities: 'Aktywności',
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
        privateDescription: 'Osoby zaproszone do tego pokoju mogą go znaleźć',
        publicDescription: 'Każdy może znaleźć ten pokój',
        public_announceDescription: 'Każdy może znaleźć ten pokój',
        createRoom: 'Utwórz pokój',
        roomAlreadyExistsError: 'Pokój o tej nazwie już istnieje',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} to domyślny pokój we wszystkich przestrzeniach roboczych. Wybierz inną nazwę.`,
        roomNameInvalidError: 'Nazwy pokoi mogą zawierać tylko małe litery, cyfry i myślniki',
        pleaseEnterRoomName: 'Wprowadź nazwę pokoju',
        pleaseSelectWorkspace: 'Wybierz przestrzeń roboczą',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}zmienił(a) nazwę na „${newName}” (wcześniej „${oldName}”)` : `${actor} zmienił(a) nazwę tego pokoju na „${newName}” (wcześniej „${oldName}”)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Pokój został przemianowany na ${newName}`,
        social: 'społecznościowe',
        selectAWorkspace: 'Wybierz przestrzeń roboczą',
        growlMessageOnRenameError: 'Nie można zmienić nazwy pokoju w przestrzeni roboczej. Sprawdź połączenie i spróbuj ponownie.',
        visibilityOptions: {
            restricted: 'Przestrzeń robocza',
            private: 'Prywatne',
            public: 'Public',
            public_announce: 'Ogłoszenie publiczne',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Wyślij i zamknij',
        submitAndApprove: 'Prześlij i zatwierdź',
        advanced: 'ZAAWANSOWANE',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `ustaw domyślne firmowe konto bankowe na „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}”`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `usunął(-ę) domyślne firmowe konto bankowe „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}”`,
        changedDefaultBankAccount: ({
            bankAccountName,
            maskedBankAccountNumber,
            oldBankAccountName,
            oldMaskedBankAccountNumber,
        }: {
            bankAccountName: string;
            maskedBankAccountNumber: string;
            oldBankAccountName: string;
            oldMaskedBankAccountNumber: string;
        }) =>
            `zmieniono domyślne firmowe konto bankowe na „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}” (wcześniej „${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}”)`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `zmienił(a) adres firmy na „${newAddress}” (wcześniej: „${previousAddress}”)` : `ustaw adres firmy na „${newAddress}”`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `dodano ${approverName} (${approverEmail}) jako osobę zatwierdzającą dla pola ${field} „${name}”`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `usunięto ${approverName} (${approverEmail}) jako osobę zatwierdzającą dla pola ${field} „${name}”`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `zmienił(a) akceptującego dla pola ${field} „${name}” na ${formatApprover(newApproverName, newApproverEmail)} (wcześniej ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `dodano kategorię „${categoryName}”`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `usunął(a) kategorię „${categoryName}”`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'wyłączone' : 'włączone'} kategoria „${categoryName}”`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodano kod płacowy „${newValue}” do kategorii „${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `usunięto kod płacowy „${oldValue}” z kategorii „${categoryName}”`;
            }
            return `zmienił kod płacowy kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodano kod GL „${newValue}” do kategorii „${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `usunął(-ę) kod GL „${oldValue}” z kategorii „${categoryName}”`;
            }
            return `zmieniono kod księgowy konta dla kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `zmienił(a) opis kategorii „${categoryName}” na ${!oldValue ? 'wymagane' : 'niewymagane'} (wcześniej ${!oldValue ? 'niewymagane' : 'wymagane'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `dodano maksymalną kwotę ${newAmount} do kategorii „${categoryName}”`;
            }
            if (oldAmount && !newAmount) {
                return `usunięto maksymalną kwotę ${oldAmount} z kategorii „${categoryName}”`;
            }
            return `zmieniono maksymalną kwotę kategorii „${categoryName}” na ${newAmount} (wcześniej ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `dodano typ limitu ${newValue} do kategorii „${categoryName}”`;
            }
            return `zmienił(a) typ limitu kategorii „${categoryName}” na ${newValue} (poprzednio ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `zaktualizowano kategorię „${categoryName}”, zmieniając paragony na ${newValue}`;
            }
            return `zmienił(-a) kategorię „${categoryName}” na ${newValue} (wcześniej ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `zaktualizowano kategorię „${categoryName}”, zmieniając Pozycjonowane paragony na ${newValue}`;
            }
            return `zmienił(a) pozycję „${categoryName}” dla zitemizowanych paragonów na ${newValue} (wcześniej ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmieniono nazwę kategorii „${oldName}” na „${newName}”`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `usunął(-ę) podpowiedź opisu „${oldValue}” z kategorii „${categoryName}”`;
            }
            return !oldValue
                ? `dodano podpowiedź opisu „${newValue}” do kategorii „${categoryName}”`
                : `zmieniono podpowiedź opisu kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmieniono nazwę listy tagów na „${newName}” (poprzednio „${oldName}”)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `dodano tag „${tagName}” do listy „${tagListName}”`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `zaktualizowano listę tagów „${tagListName}”, zmieniając tag „${oldName}” na „${newName}”`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'włączone' : 'wyłączone'} znacznik „${tagName}” na liście „${tagListName}”`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `usunięto tag „${tagName}” z listy „${tagListName}”`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `usunięto „${count}” tagów z listy „${tagListName}”`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `zaktualizowano znacznik „${tagName}” na liście „${tagListName}”, zmieniając ${updatedField} na „${newValue}” (wcześniej „${oldValue}”)`;
            }
            return `zaktualizowano znacznik „${tagName}” na liście „${tagListName}”, dodając ${updatedField} „${newValue}”`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `zmienił(a) ${updatedField} jednostki ${customUnitName} na „${newValue}” (wcześniej „${oldValue}”)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'włączone' : 'wyłączone'} śledzenie podatku przy stawkach za dystans`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `dodano nową stawkę „${rateName}” dla „${customUnitName}”`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `zmienił(a) stawkę jednostki ${customUnitName} ${updatedField} „${customUnitRateName}” na „${newValue}” (wcześniej „${oldValue}”)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `zmienił(a) stawkę podatku w stawce za dystans „${customUnitRateName}” na „${newValue} (${newTaxPercentage})” (wcześniej „${oldValue} (${oldTaxPercentage})”)`;
            }
            return `dodano stawkę podatku „${newValue} (${newTaxPercentage})” do stawki za dystans „${customUnitRateName}”`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `zmieniono odzyskiwalną część podatku w stawce za dystans „${customUnitRateName}” na „${newValue}” (wcześniej „${oldValue}”)`;
            }
            return `dodano część podatku do odzyskania w wysokości „${newValue}” do stawki za dystans „${customUnitRateName}`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'włączone' : 'wyłączone'} stawkę ${customUnitName} „${customUnitRateName}”`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `usunął(a) stawkę jednostki „${customUnitName}” „${rateName}”`,
        addedReportField: (fieldType: string, fieldName?: string) => `dodano pole raportu ${fieldType} „${fieldName}”`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) => `ustaw domyślną wartość pola raportu „${fieldName}” na „${defaultValue}”`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `dodano opcję „${optionName}” do pola raportu „${fieldName}”`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `usunął/(-nęła) opcję „${optionName}” z pola raportu „${fieldName}”`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'włączone' : 'wyłączone'} opcję „${optionName}” dla pola raportu „${fieldName}”`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'włączone' : 'wyłączone'} wszystkie opcje dla pola raportu "${fieldName}"`;
            }
            return `${allEnabled ? 'włączone' : 'wyłączone'} opcję „${optionName}” dla pola raportu „${fieldName}”, ustawiając wszystkie opcje jako ${allEnabled ? 'włączone' : 'wyłączone'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `usunięto pole raportu ${fieldType} „${fieldName}”`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `zaktualizowano „Zapobiegaj samodzielnemu zatwierdzaniu” na „${newValue === 'true' ? 'Włączone' : 'Wyłączone'}” (wcześniej „${oldValue === 'true' ? 'Włączone' : 'Wyłączone'}”)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `ustaw comiesięczną datę wysyłania raportu na „${newValue}”`;
            }
            return `zaktualizowano datę składania comiesięcznego raportu na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano „Obciąż kolejnymi kosztami klientów” na „${newValue}” (wcześniej „${oldValue}”)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano „Domyślny wydatek gotówkowy” na „${newValue}” (wcześniej „${oldValue}”)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `włączył opcję „Wymuszaj domyślne tytuły raportów” ${value ? 'włączone' : 'wyłączone'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zmienił(a) formułę nazwy raportu niestandardowego na „${newValue}” (poprzednio „${oldValue}”)`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `zaktualizowano nazwę tej przestrzeni roboczej na „${newName}” (wcześniej „${oldName}”)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `ustaw opis tego obszaru roboczego na „${newDescription}”`
                : `zaktualizowano opis tej przestrzeni roboczej na „${newDescription}” (wcześniej „${oldDescription}”)`,
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
                one: `usunął(-ę) Cię ze schematu zatwierdzania wydatków i czatu wydatków użytkownika ${joinedNames}. Wcześniej przesłane raporty nadal będą dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
                other: `usunął Cię z przepływów zatwierdzania i czatów wydatków użytkownika ${joinedNames}. Wcześniej przesłane raporty pozostaną dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `zaktualizował(a) Twoją rolę w ${policyName} z ${oldRole} na użytkownika. Zostałeś(-aś) usunięty(-a) ze wszystkich czatów wydatków przesyłających, z wyjątkiem własnych.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `zaktualizowano domyślną walutę na ${newCurrency} (wcześniej ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `zaktualizowano częstotliwość automatycznego raportowania na „${newFrequency}” (wcześniej „${oldFrequency}”)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `zaktualizowano tryb zatwierdzania na „${newValue}” (wcześniej „${oldValue}”)`,
        upgradedWorkspace: 'ulepszył(-a) tę przestrzeń roboczą do planu Control',
        forcedCorporateUpgrade: `Ta przestrzeń robocza została zaktualizowana do planu Control. Kliknij <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">tutaj</a>, aby uzyskać więcej informacji.`,
        downgradedWorkspace: 'zmienił(-a) ten workspace na plan Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `zmienił(a) odsetek raportów losowo kierowanych do ręcznej akceptacji na ${Math.round(newAuditRate * 100)}% (wcześniej ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `zmienił(a) ręczny limit zatwierdzania dla wszystkich wydatków na ${newLimit} (wcześniej ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'włączone' : 'wyłączone'} kategorie`;
                case 'tags':
                    return `${enabled ? 'włączone' : 'wyłączone'} tagi`;
                case 'workflows':
                    return `Przepływy pracy ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'distance rates':
                    return `stawki za przejechany dystans ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'accounting':
                    return `${enabled ? 'włączone' : 'wyłączone'} księgowość`;
                case 'Expensify Cards':
                    return `${enabled ? 'włączone' : 'wyłączone'} Karty Expensify`;
                case 'company cards':
                    return `${enabled ? 'włączone' : 'wyłączone'} firmowych kart`;
                case 'invoicing':
                    return `Fakturowanie ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'per diem':
                    return `${enabled ? 'włączone' : 'wyłączone'} dzienna dieta`;
                case 'receipt partners':
                    return `partnerzy paragonów ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'rules':
                    return `${enabled ? 'włączone' : 'wyłączone'} reguły`;
                case 'tax tracking':
                    return `${enabled ? 'włączone' : 'wyłączone'} śledzenie podatków`;
                default:
                    return `${enabled ? 'włączone' : 'wyłączone'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `Śledzenie uczestników ${enabled ? 'włączone' : 'wyłączone'}`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'włączone' : 'wyłączone'} raportów zatwierdzonych do automatycznej płatności`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `ustaw próg automatycznej płatności zatwierdzonych raportów na „${newLimit}”`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `zmienił(a) próg automatycznego opłacania zatwierdzonych raportów na „${newLimit}” (wcześniej „${oldLimit}”)`,
        removedAutoPayApprovedReportsLimit: 'usunął próg automatycznego opłacania zatwierdzonych raportów',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `zmieniono domyślnego akceptującego na ${newApprover} (wcześniej ${previousApprover})` : `zmieniono domyślnego zatwierdzającego na ${newApprover}`,
        changedSubmitsToApprover: ({
            members,
            approver,
            previousApprover,
            wasDefaultApprover,
        }: {
            members: string;
            approver: string;
            previousApprover?: string;
            wasDefaultApprover?: boolean;
        }) => {
            let text = `zmienił(a) proces zatwierdzania dla ${members}, aby przesyłali raporty do ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `(wcześniej domyślny zatwierdzający ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(wcześniej domyślny aprobatant)';
            } else if (previousApprover) {
                text += `(wcześniej ${previousApprover})`;
            }
            return text;
        },
        changedSubmitsToDefault: ({
            members,
            approver,
            previousApprover,
            wasDefaultApprover,
        }: {
            members: string;
            approver?: string;
            previousApprover?: string;
            wasDefaultApprover?: boolean;
        }) => {
            let text = approver
                ? `zmienił(a) proces zatwierdzania dla ${members}, aby wysyłali raporty do domyślnego akceptującego ${approver}`
                : `zmienił(a) proces zatwierdzania dla ${members}, aby wysyłali raporty do domyślnego akceptującego`;
            if (wasDefaultApprover && previousApprover) {
                text += `(wcześniej domyślny zatwierdzający ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(wcześniej domyślny aprobatant)';
            } else if (previousApprover) {
                text += `(wcześniej ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `zmienił(a) proces akceptacji dla ${approver}, aby przekazywać zatwierdzone raporty do ${forwardsTo} (wcześniej przekazywane do ${previousForwardsTo})`
                : `zmienił(a) proces zatwierdzania dla ${approver}, aby przekazywać zatwierdzone raporty do ${forwardsTo} (wcześniej przekazywał(a) ostatecznie zatwierdzone raporty)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `zmienił obieg zatwierdzania dla ${approver}, aby zatrzymać przekazywanie zatwierdzonych raportów (wcześniej przekazywane do ${previousForwardsTo})`
                : `zmienił(a) proces akceptacji dla ${approver}, aby zatrzymać przekazywanie zatwierdzonych raportów`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `zmieniono nazwę firmy na fakturze na „${newValue}” (wcześniej „${oldValue}”)` : `ustaw nazwę firmy na fakturze na „${newValue}”`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `zmienił stronę internetową firmy na fakturze na „${newValue}” (wcześniej „${oldValue}”)` : `ustawiono firmową stronę internetową faktury na „${newValue}”`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `zmieniono upoważnionego płatnika na „${newReimburser}” (wcześniej „${previousReimburser}”)`
                : `zmieniono upoważnioną osobę dokonującą zwrotu na „${newReimburser}”`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `Zwroty ${enabled ? 'włączone' : 'wyłączone'}`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `dodano podatek „${taxName}”`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `usunął(-ę) podatek „${taxName}”`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `zmienił(a) nazwę podatku „${oldValue}” na „${newValue}”`;
                }
                case 'code': {
                    return `zmienił(-a) kod podatku dla „${taxName}” z „${oldValue}” na „${newValue}”`;
                }
                case 'rate': {
                    return `zmieniono stawkę podatku dla „${taxName}” z „${oldValue}” na „${newValue}”`;
                }
                case 'enabled': {
                    return `${oldValue ? 'wyłączone' : 'włączone'} podatek „${taxName}”`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `ustaw wymaganą kwotę paragonu na „${newValue}”`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `zmieniono wymaganą kwotę paragonu na „${newValue}” (wcześniej „${oldValue}”)`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `usunięto wymaganą kwotę paragonu (wcześniej „${oldValue}”)`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `ustaw maksymalną kwotę wydatku na „${newValue}”`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `zmieniono maksymalną kwotę wydatku na „${newValue}” (wcześniej „${oldValue}”)`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `usunięto maksymalną kwotę wydatku (wcześniej „${oldValue}”)`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `ustaw maksymalny wiek wydatku na „${newValue}” dni`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `zmieniono maksymalny wiek wydatku na „${newValue}” dni (wcześniej „${oldValue}”)`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `usunięto maksymalny wiek wydatku (wcześniej „${oldValue}” dni)`,
    },
    roomMembersPage: {
        memberNotFound: 'Nie znaleziono członka.',
        useInviteButton: 'Aby zaprosić nową osobę do czatu, skorzystaj z przycisku „Zaproś” powyżej.',
        notAuthorized: `Nie masz dostępu do tej strony. Jeśli próbujesz dołączyć do tego pokoju, poproś członka pokoju, aby Cię dodał. Coś innego? Skontaktuj się z ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Wygląda na to, że ten pokój został zarchiwizowany. W razie pytań skontaktuj się z ${CONST.EMAIL.CONCIERGE}.`,
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
        confirmError: 'Wpisz tytuł i wybierz miejsce udostępnienia',
        descriptionOptional: 'Opis (opcjonalnie)',
        pleaseEnterTaskName: 'Wpisz tytuł',
        pleaseEnterTaskDestination: 'Wybierz, gdzie chcesz udostępnić to zadanie',
    },
    task: {
        task: 'Zadanie',
        title: 'Tytuł',
        description: 'Opis',
        assignee: 'Przypisany',
        completed: 'Ukończono',
        action: 'Zakończ',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `zadanie dla ${title}`,
            completed: 'oznaczono jako ukończone',
            canceled: 'usunięte zadanie',
            reopened: 'oznaczone jako niekompletne',
            error: 'Nie masz uprawnień do wykonania żądanej akcji',
        },
        markAsComplete: 'Oznacz jako ukończone',
        markAsIncomplete: 'Oznacz jako nieukończone',
        assigneeError: 'Wystąpił błąd podczas przypisywania tego zadania. Spróbuj wybrać innego wykonawcę.',
        genericCreateTaskFailureMessage: 'Wystąpił błąd podczas tworzenia tego zadania. Spróbuj ponownie później.',
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
            openShortcutDialog: 'Otwiera okno skrótów klawiaturowych',
            markAllMessagesAsRead: 'Oznacz wszystkie wiadomości jako przeczytane',
            escape: 'Okna dialogowe wyjścia',
            search: 'Otwórz okno wyszukiwania',
            newChat: 'Nowy ekran czatu',
            copy: 'Skopiuj komentarz',
            openDebug: 'Otwórz okno preferencji testowania',
        },
    },
    guides: {
        screenShare: 'Udostępnianie ekranu',
        screenShareRequest: 'Expensify zaprasza Cię do udostępnienia ekranu',
    },
    search: {
        resultsAreLimited: 'Wyniki wyszukiwania są ograniczone.',
        viewResults: 'Zobacz wyniki',
        resetFilters: 'Resetuj filtry',
        searchResults: {
            emptyResults: {
                title: 'Nic do wyświetlenia',
                subtitle: `Spróbuj dostosować kryteria wyszukiwania lub utworzyć coś za pomocą przycisku +.`,
            },
            emptyExpenseResults: {
                title: 'Nie utworzyłeś(-aś) jeszcze żadnych wydatków',
                subtitle: 'Utwórz wydatek lub skorzystaj z wersji testowej Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby utworzyć wydatek.',
            },
            emptyReportResults: {
                title: 'Nie utworzyłeś jeszcze żadnych raportów',
                subtitle: 'Utwórz raport lub skorzystaj z jazdy próbnej Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby utworzyć raport.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Nie utworzyłeś(-aś) jeszcze żadnych faktur
                `),
                subtitle: 'Wyślij fakturę lub wypróbuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby wysłać fakturę.',
            },
            emptyTripResults: {
                title: 'Brak podróży do wyświetlenia',
                subtitle: 'Zacznij, rezerwując poniższą pierwszą podróż.',
                buttonText: 'Zarezerwuj podróż',
            },
            emptySubmitResults: {
                title: 'Brak wydatków do przesłania',
                subtitle: 'Wszystko gotowe. Możesz świętować sukces!',
                buttonText: 'Utwórz raport',
            },
            emptyApproveResults: {
                title: 'Brak wydatków do zatwierdzenia',
                subtitle: 'Zero wydatków. Maksymalny luz. Dobra robota!',
            },
            emptyPayResults: {
                title: 'Brak wydatków do zapłaty',
                subtitle: 'Gratulacje! Przekroczyłeś linię mety.',
            },
            emptyExportResults: {
                title: 'Brak wydatków do wyeksportowania',
                subtitle: 'Czas trochę odetchnąć, dobra robota.',
            },
            emptyStatementsResults: {
                title: 'Brak wydatków do wyświetlenia',
                subtitle: 'Brak wyników. Spróbuj zmienić filtry.',
            },
            emptyUnapprovedResults: {
                title: 'Brak wydatków do zatwierdzenia',
                subtitle: 'Zero wydatków. Maksymalny luz. Dobra robota!',
            },
        },
        columns: 'Kolumny',
        resetColumns: 'Resetuj kolumny',
        groupColumns: 'Grupuj kolumny',
        expenseColumns: 'Kolumny wydatków',
        statements: 'Wyciągi',
        unapprovedCash: 'Niezaakceptowana gotówka',
        unapprovedCard: 'Niezatwierdzona karta',
        reconciliation: 'Uzgodnienie',
        topSpenders: 'Najwięksi wydający',
        saveSearch: 'Zapisz wyszukiwanie',
        deleteSavedSearch: 'Usuń zapisaną wyszukiwarkę',
        deleteSavedSearchConfirm: 'Czy na pewno chcesz usunąć to wyszukiwanie?',
        searchName: 'Wyszukaj nazwę',
        savedSearchesMenuItemTitle: 'Zapisano',
        topCategories: 'Najpopularniejsze kategorie',
        topMerchants: 'Najczęściej używani sprzedawcy',
        groupedExpenses: 'grupowane wydatki',
        bulkActions: {
            approve: 'Zatwierdź',
            pay: 'Zapłać',
            delete: 'Usuń',
            hold: 'Wstrzymaj',
            unhold: 'Usuń blokadę',
            reject: 'Odrzuć',
            noOptionsAvailable: 'Brak dostępnych opcji dla wybranej grupy wydatków.',
        },
        filtersHeader: 'Filtry',
        filters: {
            date: {
                before: (date?: string) => `Przed ${date ?? ''}`,
                after: (date?: string) => `Po ${date ?? ''}`,
                on: (date?: string) => `Na ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nigdy',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Zeszły miesiąc',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Ten miesiąc',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Od początku roku',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Ostatnie zestawienie',
                },
            },
            status: 'Status',
            keyword: 'Słowo kluczowe',
            keywords: 'Słowa kluczowe',
            limit: 'Limit',
            limitDescription: 'Ustaw limit dla wyników wyszukiwania.',
            currency: 'Waluta',
            completed: 'Ukończono',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Mniej niż ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Większe niż ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `Między ${greaterThan} a ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Równe ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Indywidualne karty',
                closedCards: 'Zamknięte karty',
                cardFeeds: 'Strumienie kart',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Wszystkie ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Wszystkie zaimportowane karty CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} ma wartość ${value}`,
            current: 'Bieżące',
            past: 'Przeszłe',
            submitted: 'Przesłano',
            approved: 'Zatwierdzone',
            paid: 'Zapłacono',
            exported: 'Wyeksportowano',
            posted: 'Opublikowano',
            withdrawn: 'Wycofano',
            billable: 'Fakturowalne',
            reimbursable: 'Podlegające zwrotowi',
            purchaseCurrency: 'Waluta zakupu',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'Od',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Karta',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Identyfikator wypłaty',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Kategoria',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Sprzedawca',
                [CONST.SEARCH.GROUP_BY.TAG]: 'Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: 'Miesiąc',
                [CONST.SEARCH.GROUP_BY.WEEK]: 'Tydzień',
                [CONST.SEARCH.GROUP_BY.YEAR]: 'Rok',
                [CONST.SEARCH.GROUP_BY.QUARTER]: 'Kwartał',
            },
            feed: 'Kanał',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Karta Expensify',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Zwrot kosztów',
            },
            is: 'Jest',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Wyślij',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Zatwierdź',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Zapłać',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Eksportuj',
            },
        },
        has: 'Ma',
        groupBy: 'Grupuj według',
        view: {
            label: 'Wyświetl',
            table: 'Tabela',
            bar: 'Pasek',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: 'Od',
            [CONST.SEARCH.GROUP_BY.CARD]: 'Karty',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Eksporty',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Kategorie',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Sprzedawcy',
            [CONST.SEARCH.GROUP_BY.TAG]: 'Tagi',
            [CONST.SEARCH.GROUP_BY.MONTH]: 'Miesiące',
            [CONST.SEARCH.GROUP_BY.WEEK]: 'Tygodnie',
            [CONST.SEARCH.GROUP_BY.YEAR]: 'Lata',
            [CONST.SEARCH.GROUP_BY.QUARTER]: 'Kwartały',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Ten raport nie zawiera wydatków.',
            accessPlaceHolder: 'Otwórz, aby zobaczyć szczegóły',
        },
        noCategory: 'Brak kategorii',
        noMerchant: 'Brak sprzedawcy',
        noTag: 'Brak tagu',
        expenseType: 'Rodzaj wydatku',
        withdrawalType: 'Typ wypłaty',
        recentSearches: 'Ostatnie wyszukiwania',
        recentChats: 'Ostatnie czaty',
        searchIn: 'Szukaj w',
        searchPlaceholder: 'Wyszukaj coś',
        suggestions: 'Sugestie',
        exportSearchResults: {
            title: 'Utwórz eksport',
            description: 'Wow, to całkiem sporo pozycji! Zbierzemy je w jeden plik, a Concierge wkrótce Ci go wyśle.',
        },
        exportedTo: 'Wyeksportowano do',
        exportAll: {
            selectAllMatchingItems: 'Zaznacz wszystkie pasujące elementy',
            allMatchingItemsSelected: 'Wybrano wszystkie pasujące elementy',
        },
    },
    genericErrorPage: {
        title: 'Ups, coś poszło nie tak!',
        body: {
            helpTextMobile: 'Zamknij i ponownie otwórz aplikację lub przełącz się na',
            helpTextWeb: 'sieć.',
            helpTextConcierge: 'Jeśli problem będzie się powtarzał, skontaktuj się z',
        },
        refresh: 'Odśwież',
    },
    fileDownload: {
        success: {
            title: 'Pobrano!',
            message: 'Załącznik został pomyślnie pobrany!',
            qrMessage:
                'Sprawdź swoje zdjęcia lub folder pobranych, aby znaleźć kopię swojego kodu QR. Wskazówka: dodaj go do prezentacji, aby Twoi odbiorcy mogli go zeskanować i połączyć się z Tobą bezpośrednio.',
        },
        generalError: {
            title: 'Błąd załącznika',
            message: 'Załącznika nie można pobrać',
        },
        permissionError: {
            title: 'Dostęp do pamięci',
            message: 'Expensify nie może zapisywać załączników bez dostępu do pamięci. Stuknij „Ustawienia”, aby zaktualizować uprawnienia.',
        },
    },
    settlement: {
        status: {
            pending: 'Oczekujące',
            cleared: 'Wyczyszczone',
            failed: 'Nieudane',
        },
        failedError: ({link}: {link: string}) => `Ponowimy tę wypłatę, gdy <a href="${link}">odblokujesz swoje konto</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • ID wypłaty: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Układ raportu',
        groupByLabel: 'Grupuj według:',
        selectGroupByOption: 'Wybierz sposób grupowania wydatków raportu',
        uncategorized: 'Bez kategorii',
        noTag: 'Brak tagu',
        selectGroup: ({groupName}: {groupName: string}) => `Zaznacz wszystkie wydatki w ${groupName}`,
        groupBy: {
            category: 'Kategoria',
            tag: 'Tag',
        },
    },
    report: {
        newReport: {
            createExpense: 'Utwórz wydatek',
            createReport: 'Utwórz raport',
            chooseWorkspace: 'Wybierz przestrzeń roboczą dla tego raportu.',
            emptyReportConfirmationTitle: 'Masz już pusty raport',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Czy na pewno chcesz utworzyć kolejny raport w ${workspaceName}? Do swoich pustych raportów możesz przejść w`,
            emptyReportConfirmationPromptLink: 'Raporty',
            emptyReportConfirmationDontShowAgain: 'Nie pokazuj mi tego ponownie',
            genericWorkspaceName: 'ta przestrzeń robocza',
        },
        genericCreateReportFailureMessage: 'Nieoczekiwany błąd podczas tworzenia tego czatu. Spróbuj ponownie później.',
        genericAddCommentFailureMessage: 'Nieoczekiwany błąd podczas publikowania komentarza. Spróbuj ponownie później.',
        genericUpdateReportFieldFailureMessage: 'Nieoczekiwany błąd podczas aktualizowania pola. Spróbuj ponownie później.',
        genericUpdateReportNameEditFailureMessage: 'Nieoczekiwany błąd podczas zmiany nazwy raportu. Spróbuj ponownie później.',
        noActivityYet: 'Brak aktywności',
        connectionSettings: 'Ustawienia połączenia',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `zmieniono ${fieldName} na „${newValue}” (wcześniej „${oldValue}”)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `ustaw ${fieldName} na „${newValue}”`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `zmienił(-a) przestrzeń roboczą${fromPolicyName ? `(wcześniej ${fromPolicyName})` : ''}`;
                    }
                    return `zmienił(-a) przestrzeń roboczą na ${toPolicyName}${fromPolicyName ? `(wcześniej ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `zmieniono typ z ${oldType} na ${newType}`,
                exportedToCSV: `wyeksportowano do pliku CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `wyeksportowano do ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `wyeksportowano do ${label} przez`,
                    automaticActionTwo: 'ustawienia księgowe',
                    manual: (label: string) => `oznaczył ten raport jako ręcznie wyeksportowany do ${label}.`,
                    automaticActionThree: 'i pomyślnie utworzono rekord dla',
                    reimburseableLink: 'wydatki z własnej kieszeni',
                    nonReimbursableLink: 'wydatki związane z kartą firmową',
                    pending: (label: string) => `rozpoczęto eksportowanie tego raportu do ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `nie udało się wyeksportować tego raportu do ${label} („${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}”)`,
                managerAttachReceipt: `dodano paragon`,
                managerDetachReceipt: `usunięto paragon`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `zapłacono ${amount} ${currency} gdzie indziej`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `zapłacono ${currency}${amount} przez integrację`,
                outdatedBankAccount: `nie można było przetworzyć płatności z powodu problemu z kontem bankowym płatnika`,
                reimbursementACHBounce: `nie można było przetworzyć płatności z powodu problemu z kontem bankowym`,
                reimbursementACHCancelled: `anulowano płatność`,
                reimbursementAccountChanged: `nie udało się przetworzyć płatności, ponieważ płatnik zmienił konto bankowe`,
                reimbursementDelayed: `przetworzył płatność, ale jest ona opóźniona o kolejne 1–2 dni robocze`,
                selectedForRandomAudit: `wybrane losowo do weryfikacji`,
                selectedForRandomAuditMarkdown: `losowo wybrany do weryfikacji`,
                share: ({to}: ShareParams) => `zaproszono członka ${to}`,
                unshare: ({to}: UnshareParams) => `usunięto członka ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `zapłacono ${currency}${amount}`,
                takeControl: `przejął kontrolę`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `wystąpił problem z synchronizacją z ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Napraw problem w <a href="${workspaceAccountingLink}">ustawieniach przestrzeni roboczej</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `Połączenie ${feedName} jest zerwane. Aby przywrócić importy z karty, <a href='${workspaceCompanyCardRoute}'>zaloguj się do swojego banku</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `połączenie Plaid z Twoim firmowym kontem bankowym jest przerwane. Prosimy, <a href='${walletRoute}'>połącz ponownie swoje konto bankowe ${maskedAccountNumber}</a>, aby móc dalej korzystać z kart Expensify.`,
                addEmployee: (email: string, role: string) => `dodano ${email} jako ${role === 'member' ? 'a' : 'do'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `zaktualizowano rolę ${email} na ${newRole} (wcześniej ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usunięto pole niestandardowe 1 użytkownika ${email} (wcześniej „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `dodano „${newValue}” do pola niestandardowego 1 użytkownika ${email}`
                        : `zmieniono pole niestandardowe 1 użytkownika ${email} na „${newValue}” (wcześniej „${previousValue}”)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usunięto pole niestandardowe 2 użytkownika ${email} (wcześniej „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `dodano „${newValue}” do pola niestandardowego 2 użytkownika ${email}`
                        : `zmieniono drugie pole niestandardowe użytkownika ${email} na „${newValue}” (poprzednio „${previousValue}”)`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} opuścił(-a) przestrzeń roboczą`,
                removeMember: (email: string, role: string) => `usunięto ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `usunięto połączenie z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `połączono z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'opuścił czat',
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `firmowe konto bankowe ${maskedBankAccountNumber} zostało automatycznie zablokowane z powodu problemu z rozliczeniem zwrotów kosztów lub kart Expensify. Napraw ten problem w <a href="${linkURL}">ustawieniach swojego workspace</a>.`,
            },
            error: {
                invalidCredentials: 'Nieprawidłowe dane logowania, sprawdź konfigurację swojego połączenia.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} za ${dayCount} ${dayCount === 1 ? 'dzień' : 'dni'} do ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} z ${timePeriod} dnia ${date}`,
    },
    footer: {
        features: 'Funkcje',
        expenseManagement: 'Zarządzanie wydatkami',
        spendManagement: 'Zarządzanie wydatkami',
        expenseReports: 'Raporty wydatków',
        companyCreditCard: 'Firmowa karta kredytowa',
        receiptScanningApp: 'Aplikacja do skanowania paragonów',
        billPay: 'Płatności rachunków',
        invoicing: 'Fakturowanie',
        CPACard: 'Karta CPA',
        payroll: 'Lista płac',
        travel: 'Podróże',
        resources: 'Zasoby',
        expensifyApproved: 'Zatwierdzone w Expensify!',
        pressKit: 'Zestaw prasowy',
        support: 'Pomoc',
        expensifyHelp: 'ExpensifyPomoc',
        terms: 'Warunki korzystania z usługi',
        privacy: 'Prywatność',
        learnMore: 'Dowiedz się więcej',
        aboutExpensify: 'O Expensify',
        blog: 'Blog',
        jobs: 'Zadania',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relacje inwestorskie',
        getStarted: 'Rozpocznij',
        createAccount: 'Utwórz nowe konto',
        logIn: 'Zaloguj się',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Wróć do listy czatów',
        chatWelcomeMessage: 'Powitalna wiadomość czatu',
        navigatesToChat: 'Przechodzi do czatu',
        newMessageLineIndicator: 'Wskaźnik nowej linii wiadomości',
        chatMessage: 'Wiadomość na czacie',
        lastChatMessagePreview: 'Podgląd ostatniej wiadomości na czacie',
        workspaceName: 'Nazwa przestrzeni roboczej',
        chatUserDisplayNames: 'Wyświetlane nazwy członków czatu',
        scrollToNewestMessages: 'Przewiń do najnowszych wiadomości',
        preStyledText: 'Wstępnie ostylowany tekst',
        viewAttachment: 'Zobacz załącznik',
    },
    parentReportAction: {
        deletedReport: 'Usunięty raport',
        deletedMessage: 'Usunięta wiadomość',
        deletedExpense: 'Usunięty wydatek',
        reversedTransaction: 'Stornowana transakcja',
        deletedTask: 'Usunięte zadanie',
        hiddenMessage: 'Ukryta wiadomość',
    },
    threads: {
        thread: 'Wątek',
        replies: 'Odpowiedzi',
        reply: 'Odpowiedz',
        from: 'Od',
        in: 'w',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `Z ${reportName}${workspaceName ? `w ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'Kopiuj adres URL',
        copied: 'Skopiowano!',
    },
    moderation: {
        flagDescription: 'Wszystkie oflagowane wiadomości zostaną wysłane do moderatora do przeanalizowania.',
        chooseAReason: 'Wybierz poniższy powód oznaczenia:',
        spam: 'Spam',
        spamDescription: 'Niechciana, nie na temat promocja',
        inconsiderate: 'Nieuprzejmy',
        inconsiderateDescription: 'Obraźliwe lub niepełne szacunku sformułowania o wątpliwych intencjach',
        intimidation: 'Zastraszanie',
        intimidationDescription: 'Agresywne forsowanie własnej agendy pomimo uzasadnionych zastrzeżeń',
        bullying: 'Zastraszanie',
        bullyingDescription: 'Wymierzanie działań w konkretną osobę, aby wymusić posłuszeństwo',
        harassment: 'Nękanie',
        harassmentDescription: 'Rasistowskie, mizoginistyczne lub inne powszechnie dyskryminujące zachowanie',
        assault: 'Napaść',
        assaultDescription: 'Specyficznie ukierunkowany atak emocjonalny z zamiarem wyrządzenia szkody',
        flaggedContent: 'Ta wiadomość została oznaczona jako naruszająca nasze zasady społeczności i jej treść została ukryta.',
        hideMessage: 'Ukryj wiadomość',
        revealMessage: 'Odkryj wiadomość',
        levelOneResult: 'Wysyła anonimowe ostrzeżenie, a wiadomość zostaje zgłoszona do sprawdzenia.',
        levelTwoResult: 'Wiadomość ukryta na kanale, dodatkowo wysłano anonimowe ostrzeżenie, a wiadomość została zgłoszona do weryfikacji.',
        levelThreeResult: 'Wiadomość usunięta z kanału, wysłano anonimowe ostrzeżenie, a wiadomość została zgłoszona do weryfikacji.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Zaproś do złożenia wydatków',
        inviteToChat: 'Zaproś tylko do czatu',
        nothing: 'Nic nie rób',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Akceptuj',
        decline: 'Odrzuć',
    },
    actionableMentionTrackExpense: {
        submit: 'Przekaż to komuś',
        categorize: 'Sklasyfikuj to',
        share: 'Udostępnij to mojemu księgowemu',
        nothing: 'Na razie nic',
    },
    teachersUnitePage: {
        teachersUnite: 'Nauczyciele razem',
        joinExpensifyOrg:
            'Dołącz do Expensify.org, aby eliminować niesprawiedliwość na całym świecie. Obecna kampania „Teachers Unite” wspiera nauczycieli wszędzie, współfinansując koszty niezbędnych przyborów szkolnych.',
        iKnowATeacher: 'Znam nauczyciela',
        iAmATeacher: 'Jestem nauczycielem',
        getInTouch: 'Świetnie! Udostępnij proszę ich dane kontaktowe, żebyśmy mogli się z nimi skontaktować.',
        introSchoolPrincipal: 'Wprowadzenie do dyrektora szkoły',
        schoolPrincipalVerifyExpense:
            'Expensify.org dzieli koszt podstawowych przyborów szkolnych, aby uczniowie z gospodarstw domowych o niskich dochodach mogli mieć lepsze warunki do nauki. Twoje wydatki zostaną przekazane do weryfikacji dyrektorowi szkoły.',
        principalFirstName: 'Imię właściciela',
        principalLastName: 'Nazwisko właściciela',
        principalWorkEmail: 'Główny służbowy e‑mail',
        updateYourEmail: 'Zaktualizuj swój adres e-mail',
        updateEmail: 'Zaktualizuj adres e-mail',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Zanim przejdziesz dalej, upewnij się, że ustawiłeś swój szkolny adres e-mail jako domyślną metodę kontaktu. Możesz to zrobić w Ustawienia > Profil > <a href="${contactMethodsRoute}">Metody kontaktu</a>.`,
        error: {
            enterPhoneEmail: 'Wprowadź prawidłowy adres e-mail lub numer telefonu',
            enterEmail: 'Wpisz adres e-mail',
            enterValidEmail: 'Wprowadź prawidłowy adres e-mail',
            tryDifferentEmail: 'Spróbuj użyć innego adresu e‑mail',
        },
    },
    cardTransactions: {
        notActivated: 'Nieaktywne',
        outOfPocket: 'Wydatki z własnej kieszeni',
        companySpend: 'Wydatki firmowe',
    },
    distance: {
        addStop: 'Dodaj przystanek',
        deleteWaypoint: 'Usuń punkt pośredni',
        deleteWaypointConfirmation: 'Czy na pewno chcesz usunąć ten punkt trasy?',
        address: 'Adres',
        waypointDescription: {
            start: 'Start',
            stop: 'Zatrzymaj',
        },
        mapPending: {
            title: 'Oczekuje na przypisanie mapy',
            subtitle: 'Mapa zostanie wygenerowana, gdy wrócisz do trybu online',
            onlineSubtitle: 'Chwileczkę, konfigurujemy mapę',
            errorTitle: 'Błąd mapy',
            errorSubtitle: 'Wystąpił błąd podczas wczytywania mapy. Spróbuj ponownie.',
        },
        error: {
            selectSuggestedAddress: 'Wybierz sugerowany adres lub użyj bieżącej lokalizacji',
        },
        odometer: {
            startReading: 'Zacznij czytać',
            endReading: 'Zakończ czytanie',
            saveForLater: 'Zapisz na później',
            totalDistance: 'Całkowity dystans',
        },
    },
    gps: {
        disclaimer: 'Użyj GPS, aby utworzyć wydatek z podróży. Stuknij „Start” poniżej, aby rozpocząć śledzenie.',
        error: {
            failedToStart: 'Nie udało się uruchomić śledzenia lokalizacji.',
            failedToGetPermissions: 'Nie udało się uzyskać wymaganych uprawnień lokalizacji.',
        },
        trackingDistance: 'Śledzenie dystansu...',
        stopped: 'Zatrzymano',
        start: 'Start',
        stop: 'Zatrzymaj',
        discard: 'Odrzuć',
        stopGpsTrackingModal: {
            title: 'Zatrzymaj śledzenie GPS',
            prompt: 'Na pewno? Spowoduje to zakończenie bieżącej ścieżki.',
            cancel: 'Wznów śledzenie',
            confirm: 'Zatrzymaj śledzenie GPS',
        },
        discardDistanceTrackingModal: {
            title: 'Odrzuć śledzenie dystansu',
            prompt: 'Na pewno? To przerwie Twoją obecną ścieżkę i tej operacji nie można cofnąć.',
            confirm: 'Odrzuć śledzenie dystansu',
        },
        zeroDistanceTripModal: {
            title: 'Nie można utworzyć wydatku',
            prompt: 'Nie możesz utworzyć wydatku z takim samym miejscem początkowym i końcowym.',
        },
        locationRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji',
            prompt: 'Zezwól na dostęp do lokalizacji w ustawieniach urządzenia, aby rozpocząć śledzenie dystansu za pomocą GPS.',
            allow: 'Zezwól',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji w tle',
            prompt: 'Aby rozpocząć śledzenie dystansu GPS, w ustawieniach urządzenia zezwól na dostęp do lokalizacji w tle (wybierz opcję „Zawsze zezwalaj”).',
        },
        preciseLocationRequiredModal: {
            title: 'Wymagana dokładna lokalizacja',
            prompt: 'Włącz w ustawieniach urządzenia opcję „dokładna lokalizacja”, aby rozpocząć śledzenie dystansu GPS.',
        },
        desktop: {
            title: 'Śledź pokonaną odległość na swoim telefonie',
            subtitle: 'Automatycznie rejestruj mile lub kilometry za pomocą GPS i natychmiast zamieniaj przejazdy w wydatki.',
            button: 'Pobierz aplikację',
        },
        notification: {
            title: 'Trwa śledzenie GPS',
            body: 'Przejdź do aplikacji, aby dokończyć',
        },
        continueGpsTripModal: {
            title: 'Kontynuować nagrywanie trasy GPS?',
            prompt: 'Wygląda na to, że aplikacja została zamknięta podczas Twojej ostatniej trasy GPS. Czy chcesz kontynuować nagrywanie z tamtej trasy?',
            confirm: 'Kontynuuj podróż',
            cancel: 'Zobacz podróż',
        },
        signOutWarningTripInProgress: {
            title: 'Trwa śledzenie GPS',
            prompt: 'Na pewno chcesz odrzucić podróż i się wylogować?',
            confirm: 'Odrzuć i wyloguj się',
        },
        locationServicesRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji',
            confirm: 'Otwórz ustawienia',
            prompt: 'Zezwól na dostęp do lokalizacji w ustawieniach urządzenia, aby rozpocząć śledzenie dystansu za pomocą GPS.',
        },
        fabGpsTripExplained: 'Przejdź do ekranu GPS (akcja pływająca)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Świadectwo zgubione lub uszkodzone',
        nextButtonLabel: 'Dalej',
        reasonTitle: 'Dlaczego potrzebujesz nowej karty?',
        cardDamaged: 'Moja karta została uszkodzona',
        cardLostOrStolen: 'Moja karta została zgubiona lub skradziona',
        confirmAddressTitle: 'Potwierdź adres korespondencyjny dla swojej nowej karty.',
        cardDamagedInfo: 'Twoja nowa karta dotrze w ciągu 2–3 dni roboczych. Obecna karta będzie działać do momentu aktywacji nowej.',
        cardLostOrStolenInfo: 'Twoja obecna karta zostanie trwale dezaktywowana, gdy tylko złożysz zamówienie. Większość kart dociera w ciągu kilku dni roboczych.',
        address: 'Adres',
        deactivateCardButton: 'Dezaktywuj kartę',
        shipNewCardButton: 'Wyślij nową kartę',
        addressError: 'Adres jest wymagany',
        reasonError: 'Powód jest wymagany',
        successTitle: 'Twoja nowa karta jest w drodze!',
        successDescription: 'Musisz ją aktywować, gdy dotrze za kilka dni roboczych. W międzyczasie możesz używać karty wirtualnej.',
    },
    eReceipt: {
        guaranteed: 'Gwarantowany e‑paragon',
        transactionDate: 'Data transakcji',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Rozpocznij czat, <success><strong>poleć znajomego</strong></success>.',
            header: 'Rozpocznij czat, poleć znajomego',
            body: 'Chcesz, żeby Twoi znajomi też korzystali z Expensify? Po prostu rozpocznij z nimi czat, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Złóż raport wydatków, <success><strong>poleć swój zespół</strong></success>.',
            header: 'Zgłoś wydatek, poleć swój zespół',
            body: 'Chcesz, aby Twój zespół też korzystał z Expensify? Po prostu prześlij im wydatek, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Poleć znajomego',
            body: 'Chcesz, żeby Twoi znajomi też korzystali z Expensify? Po prostu czatuj, płać lub dziel wydatki razem z nimi, a my zajmiemy się resztą. Albo po prostu udostępnij im swój link zapraszający!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Poleć znajomego',
            header: 'Poleć znajomego',
            body: 'Chcesz, żeby Twoi znajomi też korzystali z Expensify? Po prostu czatuj, płać lub dziel wydatki razem z nimi, a my zajmiemy się resztą. Albo po prostu udostępnij im swój link zapraszający!',
        },
        copyReferralLink: 'Skopiuj link z zaproszeniem',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Porozmawiaj ze swoim specjalistą ds. konfiguracji w <a href="${href}">${adminReportName}</a>, aby uzyskać pomoc`,
        default: `Napisz do <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>, aby uzyskać pomoc z konfiguracją`,
    },
    violations: {
        allTagLevelsRequired: 'Wszystkie tagi są wymagane',
        autoReportedRejectedExpense: 'Ten wydatek został odrzucony.',
        billableExpense: 'Pozycja fakturowana nie jest już prawidłowa',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Wymagany paragon${formattedLimit ? `powyżej ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategoria nie jest już ważna',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Zastosowano ${surcharge}% opłaty za przewalutowanie`,
        customUnitOutOfPolicy: 'Stawka nie jest prawidłowa dla tego workspace’u',
        duplicatedTransaction: 'Potencjalny duplikat',
        fieldRequired: 'Pola raportu są wymagane',
        futureDate: 'Przyszła data jest niedozwolona',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Marża ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data starsza niż ${maxAge} dni`,
        missingCategory: 'Brak kategorii',
        missingComment: 'Opis wymagany dla wybranej kategorii',
        missingAttendees: 'Wymaganych jest wielu uczestników dla tej kategorii',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Brak ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Kwota różni się od obliczonego dystansu';
                case 'card':
                    return 'Kwota większa niż transakcja kartą';
                default:
                    if (displayPercentVariance) {
                        return `Kwota o ${displayPercentVariance}% wyższa niż zeskanowany paragon`;
                    }
                    return 'Kwota większa niż zeskanowany paragon';
            }
        },
        modifiedDate: 'Data różni się od zeskanowanego paragonu',
        nonExpensiworksExpense: 'Wydatek spoza Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Wydatek przekracza automatyczny limit akceptacji ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Kwota przekracza limit kategorii ${formattedLimit}/osobę`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekraczająca limit ${formattedLimit}/osobę`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota powyżej limitu ${formattedLimit} na podróż`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekraczająca limit ${formattedLimit}/osobę`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Kwota przekracza dzienny limit kategorii ${formattedLimit}/osobę`,
        receiptNotSmartScanned: 'Szczegóły paragonu i wydatku dodano ręcznie.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Wymagany paragon powyżej limitu kategorii ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Wymagany paragon powyżej ${formattedLimit}`;
            }
            if (category) {
                return `Paragon wymagany powyżej limitu kategorii`;
            }
            return 'Wymagany paragon';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Wymagany paragon z wyszczególnieniem pozycji${formattedLimit ? `powyżej ${formattedLimit}` : ''}`,
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Zabroniony wydatek:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `alkohol`;
                    case 'gambling':
                        return `hazard`;
                    case 'tobacco':
                        return `tytoń`;
                    case 'adultEntertainment':
                        return `treści dla dorosłych`;
                    case 'hotelIncidentals':
                        return `płatności dodatkowe w hotelu`;
                    default:
                        return `${prohibitedExpenseType}`;
                }
            };
            let types: string[] = [];
            if (Array.isArray(prohibitedExpenseTypes)) {
                types = prohibitedExpenseTypes;
            } else if (prohibitedExpenseTypes) {
                types = [prohibitedExpenseTypes];
            }
            if (types.length === 0) {
                return preMessage;
            }
            return `${preMessage} ${types.map(getProhibitedExpenseTypeText).join(', ')}`;
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: 'Wymagana weryfikacja',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Nie można automatycznie dopasować paragonu z powodu przerwanego połączenia z bankiem';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Połączenie z bankiem przerwane. <a href="${companyCardPageURL}">Połącz ponownie, aby dopasować paragon</a>`
                    : 'Połączenie z bankiem przerwane. Poproś administratora o ponowne połączenie, aby dopasować paragon.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Poproś ${member}, aby oznaczył(a) to jako gotówkę, albo poczekaj 7 dni i spróbuj ponownie` : 'Oczekiwanie na połączenie z transakcją kartową.';
            }
            return '';
        },
        brokenConnection530Error: 'Oczekujący paragon z powodu zerwanego połączenia z bankiem',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Paragon oczekuje z powodu przerwanego połączenia z bankiem. Rozwiąż problem w <a href="${workspaceCompanyCardRoute}">Kartach służbowych</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Paragon oczekuje z powodu zerwanego połączenia z bankiem. Poproś administratora przestrzeni roboczej o rozwiązanie problemu.',
        markAsCashToIgnore: 'Oznacz jako gotówkę, aby zignorować i poprosić o płatność.',
        smartscanFailed: ({canEdit = true}) => `Skanowanie paragonu nie powiodło się.${canEdit ? 'Wprowadź szczegóły ręcznie.' : ''}`,
        receiptGeneratedWithAI: 'Potencjalny paragon wygenerowany przez AI',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Brak ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nie jest już prawidłowy`,
        taxAmountChanged: 'Kwota podatku została zmodyfikowana',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Podatek'} nie jest już ważny`,
        taxRateChanged: 'Stawka podatku została zmodyfikowana',
        taxRequired: 'Brak stawki podatku',
        none: 'Brak',
        taxCodeToKeep: 'Wybierz, który kod podatkowy zachować',
        tagToKeep: 'Wybierz, który znacznik zachować',
        isTransactionReimbursable: 'Wybierz, czy transakcja podlega zwrotowi kosztów',
        merchantToKeep: 'Wybierz, którego sprzedawcę zachować',
        descriptionToKeep: 'Wybierz, który opis zachować',
        categoryToKeep: 'Wybierz kategorię, którą chcesz zachować',
        isTransactionBillable: 'Wybierz, czy transakcja jest refakturowalna',
        keepThisOne: 'Zachowaj ten',
        confirmDetails: `Potwierdź szczegóły, które zachowujesz`,
        confirmDuplicatesInfo: `Zduplikowane pozycje, których nie zachowasz, zostaną przekazane osobie składającej rozliczenie do usunięcia.`,
        hold: 'Ten wydatek został wstrzymany',
        resolvedDuplicates: 'rozwiązano duplikat',
        companyCardRequired: 'Wymagane zakupy kartą firmową',
        noRoute: 'Wybierz prawidłowy adres',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `Pole ${fieldName} jest wymagane`,
        reportContainsExpensesWithViolations: 'Raport zawiera wydatki z naruszeniami.',
    },
    violationDismissal: {
        rter: {
            manual: 'oznaczył(-a) ten paragon jako gotówkę',
        },
        duplicatedTransaction: {
            manual: 'rozwiązano duplikat',
        },
    },
    videoPlayer: {
        play: 'Odtwórz',
        pause: 'Wstrzymaj',
        fullscreen: 'Pełny ekran',
        playbackSpeed: 'Prędkość odtwarzania',
        expand: 'Rozwiń',
        mute: 'Wycisz',
        unmute: 'Włącz dźwięk',
        normal: 'Zwykły',
    },
    exitSurvey: {
        header: 'Zanim wyjdziesz',
        reasonPage: {
            title: 'Powiedz nam, dlaczego odchodzisz',
            subtitle: 'Zanim odejdziesz, powiedz nam proszę, dlaczego chcesz przełączyć się na Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Potrzebuję funkcji, która jest dostępna tylko w Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Nie rozumiem, jak korzystać z New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Rozumiem, jak korzystać z Nowego Expensify, ale wolę klasyczną wersję Expensify.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Jakiej funkcji potrzebujesz, której nie ma w New Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Co próbujesz zrobić?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Dlaczego wolisz Expensify Classic?',
        },
        responsePlaceholder: 'Twoja odpowiedź',
        thankYou: 'Dziękujemy za opinię!',
        thankYouSubtitle: 'Twoje odpowiedzi pomogą nam stworzyć lepszy produkt do załatwiania spraw. Bardzo dziękujemy!',
        goToExpensifyClassic: 'Przełącz na Expensify Classic',
        offlineTitle: 'Wygląda na to, że utknąłeś tutaj…',
        offline:
            'Wygląda na to, że jesteś offline. Niestety Expensify Classic nie działa w trybie offline, ale Nowy Expensify tak. Jeśli wolisz korzystać z Expensify Classic, spróbuj ponownie, gdy będziesz mieć połączenie z internetem.',
        quickTip: 'Szybka wskazówka...',
        quickTipSubTitle: 'Możesz przejść bezpośrednio do Expensify Classic, odwiedzając expensify.com. Dodaj stronę do zakładek, aby mieć szybki skrót!',
        bookACall: 'Umów rozmowę',
        bookACallTitle: 'Czy chcesz porozmawiać z product managerem?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Bezpośrednie czatowanie na wydatkach i raportach',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Możliwość zrobienia wszystkiego na telefonie',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Podróże i wydatki z prędkością czatu',
        },
        bookACallTextTop: 'Przechodząc na Expensify Classic, stracisz dostęp do:',
        bookACallTextBottom: 'Chętnie porozmawiamy z Tobą, aby zrozumieć dlaczego. Możesz umówić się na rozmowę z jednym z naszych starszych menedżerów produktu, aby omówić swoje potrzeby.',
        takeMeToExpensifyClassic: 'Przejdź do Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Wystąpił błąd podczas ładowania kolejnych wiadomości',
        tryAgain: 'Spróbuj ponownie',
    },
    systemMessage: {
        mergedWithCashTransaction: 'dopasował(-a) paragon do tej transakcji',
    },
    subscription: {
        authenticatePaymentCard: 'Uwierzytelnij kartę płatniczą',
        mobileReducedFunctionalityMessage: 'Nie możesz wprowadzać zmian w swojej subskrypcji w aplikacji mobilnej.',
        badge: {
            freeTrial: (numOfDays: number) => `Bezpłatny okres próbny: pozostało ${numOfDays} ${numOfDays === 1 ? 'dzień' : 'dni'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Twoje dane płatnicze są nieaktualne',
                subtitle: (date: string) => `Zaktualizuj swoją kartę płatniczą do ${date}, aby nadal korzystać ze wszystkich ulubionych funkcji.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Nie można przetworzyć Twojej płatności',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Twoja opłata z dnia ${date} na kwotę ${purchaseAmountOwed} nie mogła zostać przetworzona. Dodaj kartę płatniczą, aby uregulować należną kwotę.`
                        : 'Dodaj kartę płatniczą, aby uregulować należną kwotę.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Twoje dane płatnicze są nieaktualne',
                subtitle: (date: string) => `Twoja płatność jest zaległa. Prosimy uregulować fakturę do ${date}, aby uniknąć przerwy w świadczeniu usług.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Twoje dane płatnicze są nieaktualne',
                subtitle: 'Twoja płatność jest przeterminowana. Prosimy o opłacenie faktury.',
            },
            billingDisputePending: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Zakwestionowano obciążenie na kwotę ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto będzie zablokowane do czasu rozwiązania sporu z Twoim bankiem.`,
            },
            cardAuthenticationRequired: {
                title: 'Twoja karta płatnicza nie została w pełni uwierzytelniona.',
                subtitle: (cardEnding: string) => `Aby aktywować swoją kartę płatniczą kończącą się na ${cardEnding}, ukończ proces uwierzytelniania.`,
            },
            insufficientFunds: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: (amountOwed: number) =>
                    `Twoja karta płatnicza została odrzucona z powodu niewystarczających środków. Spróbuj ponownie lub dodaj nową kartę płatniczą, aby spłacić zaległe saldo w wysokości ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: (amountOwed: number) => `Twoja karta płatnicza wygasła. Dodaj nową kartę płatniczą, aby uregulować zaległe saldo w wysokości ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Twoja karta wkrótce wygaśnie',
                subtitle:
                    'Twoja karta płatnicza wygaśnie z końcem tego miesiąca. Kliknij poniższe menu z trzema kropkami, aby ją zaktualizować i dalej korzystać ze wszystkich ulubionych funkcji.',
            },
            retryBillingSuccess: {
                title: 'Sukces!',
                subtitle: 'Twoja karta została pomyślnie obciążona.',
            },
            retryBillingError: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle:
                    'Zanim spróbujesz ponownie, skontaktuj się bezpośrednio ze swoim bankiem, aby autoryzować obciążenia Expensify i usunąć wszelkie blokady. W przeciwnym razie spróbuj dodać inną kartę płatniczą.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Zakwestionowano obciążenie na kwotę ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto będzie zablokowane do czasu rozwiązania sporu z Twoim bankiem.`,
            preTrial: {
                title: 'Rozpocznij bezpłatny okres próbny',
                subtitle: 'Jako kolejny krok <a href="#">zakończ listę zadań konfiguracji</a>, aby Twój zespół mógł zacząć rozliczać wydatki.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Okres próbny: pozostało ${numOfDays} ${numOfDays === 1 ? 'dzień' : 'dni'}!`,
                subtitle: 'Dodaj kartę płatniczą, aby dalej korzystać ze wszystkich ulubionych funkcji.',
            },
            trialEnded: {
                title: 'Twój bezpłatny okres próbny dobiegł końca',
                subtitle: 'Dodaj kartę płatniczą, aby dalej korzystać ze wszystkich ulubionych funkcji.',
            },
            earlyDiscount: {
                claimOffer: 'Odbierz ofertę',
                subscriptionPageTitle: (discountType: number) => `<strong>${discountType}% zniżki na pierwszy rok!</strong> Po prostu dodaj kartę płatniczą i rozpocznij subskrypcję roczną.`,
                onboardingChatTitle: (discountType: number) => `Oferta ograniczona czasowo: ${discountType}% zniżki na pierwszy rok!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Zgłoś w ciągu ${days > 0 ? `${days}d :` : ''}${hours}g : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Płatność',
            subtitle: 'Dodaj kartę, aby opłacić swoją subskrypcję Expensify.',
            addCardButton: 'Dodaj kartę płatniczą',
            cardInfo: (name: string, expiration: string, currency: string) => `Nazwa: ${name}, Data ważności: ${expiration}, Waluta: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Twoja następna data płatności to ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Karta kończąca się na ${cardNumber}`,
            changeCard: 'Zmień kartę płatniczą',
            changeCurrency: 'Zmień walutę płatności',
            cardNotFound: 'Nie dodano karty płatniczej',
            retryPaymentButton: 'Ponów płatność',
            authenticatePayment: 'Uwierzytelnij płatność',
            requestRefund: 'Poproś o zwrot kosztów',
            requestRefundModal: {
                full: 'Otrzymanie zwrotu jest proste – po prostu obniż swój plan przed następną datą rozliczenia, a otrzymasz zwrot. <br /> <br /> Uwaga: Obniżenie planu oznacza, że Twoje przestrzenie robocze zostaną usunięte. Tej czynności nie można cofnąć, ale zawsze możesz utworzyć nową przestrzeń roboczą, jeśli zmienisz zdanie.',
                confirm: 'Usuń przestrzenie robocze i obniż plan',
            },
            viewPaymentHistory: 'Wyświetl historię płatności',
        },
        yourPlan: {
            title: 'Twój plan',
            exploreAllPlans: 'Poznaj wszystkie plany',
            customPricing: 'Niestandardowe ceny',
            asLowAs: ({price}: YourPlanPriceValueParams) => `już od ${price} za aktywnego członka/miesiąc`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} za członka/miesiąc`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} za członka miesięcznie`,
            perMemberMonth: 'na członka/miesiąc',
            collect: {
                title: 'Pobierz',
                description: 'Plan dla małych firm, który zapewnia wydatki, podróże i czat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, do ${upper}/aktywnego członka bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, do ${upper}/aktywnego członka bez karty Expensify.`,
                benefit1: 'Skanowanie paragonów',
                benefit2: 'Zwroty kosztów',
                benefit3: 'Zarządzanie kartami służbowymi',
                benefit4: 'Zatwierdzanie wydatków i podróży',
                benefit5: 'Rezerwacje podróży i zasady',
                benefit6: 'Integracje z QuickBooks/Xero',
                benefit7: 'Czat o wydatkach, raportach i pokojach',
                benefit8: 'Wsparcie AI i człowieka',
            },
            control: {
                title: 'Sterowanie',
                description: 'Wydatki, podróże i czat dla większych firm.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, do ${upper}/aktywnego członka bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, do ${upper}/aktywnego członka bez karty Expensify.`,
                benefit1: 'Wszystko z planu Collect',
                benefit2: 'Wielopoziomowe procesy zatwierdzania',
                benefit3: 'Niestandardowe reguły wydatków',
                benefit4: 'Integracje z systemami ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integracje HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Niestandardowe analizy i raportowanie',
                benefit8: 'Budżetowanie',
            },
            thisIsYourCurrentPlan: 'To jest Twój obecny plan',
            downgrade: 'Zmień plan na Collect',
            upgrade: 'Przejdź na Control',
            addMembers: 'Dodaj członków',
            saveWithExpensifyTitle: 'Oszczędzaj z kartą Expensify',
            saveWithExpensifyDescription: 'Skorzystaj z naszego kalkulatora oszczędności, aby zobaczyć, jak zwrot gotówki z karty Expensify może obniżyć Twój rachunek w Expensify.',
            saveWithExpensifyButton: 'Dowiedz się więcej',
        },
        compareModal: {
            comparePlans: 'Porównaj plany',
            subtitle: `<muted-text>Odblokuj potrzebne funkcje dzięki planowi odpowiedniemu dla Ciebie. <a href="${CONST.PRICING}">Zobacz naszą stronę z cenami</a>, aby poznać pełne porównanie funkcji w każdym z planów.</muted-text>`,
        },
        details: {
            title: 'Szczegóły subskrypcji',
            annual: 'Subskrypcja roczna',
            taxExempt: 'Poproś o status zwolnienia z podatku',
            taxExemptEnabled: 'Zwolnione z podatku',
            taxExemptStatus: 'Status zwolnienia z podatku',
            payPerUse: 'Płać za użycie',
            subscriptionSize: 'Rozmiar subskrypcji',
            headsUp:
                'Uwaga: jeśli teraz nie ustawisz rozmiaru swojej subskrypcji, automatycznie ustawimy go na liczbę aktywnych członków w pierwszym miesiącu. Zobowiążesz się wtedy do opłacania co najmniej tylu członków przez następne 12 miesięcy. Możesz w każdej chwili zwiększyć rozmiar subskrypcji, ale nie możesz go zmniejszyć, dopóki subskrypcja się nie zakończy.',
            zeroCommitment: 'Zero zobowiązań przy obniżonej rocznej stawce subskrypcji',
        },
        subscriptionSize: {
            title: 'Rozmiar subskrypcji',
            yourSize: 'Rozmiar Twojej subskrypcji to liczba wolnych miejsc, które w danym miesiącu mogą zostać zajęte przez dowolnego aktywnego członka.',
            eachMonth:
                'Każdego miesiąca Twoja subskrypcja obejmuje liczbę aktywnych członków ustawioną powyżej. Za każdym razem, gdy zwiększysz rozmiar subskrypcji, rozpocznie się nowa 12-miesięczna subskrypcja w nowym rozmiarze.',
            note: 'Uwaga: Aktywnym członkiem jest każda osoba, która utworzyła, edytowała, przesłała, zatwierdziła, zrefundowała lub wyeksportowała dane wydatków powiązane z przestrzenią roboczą Twojej firmy.',
            confirmDetails: 'Potwierdź szczegóły nowej subskrypcji rocznej:',
            subscriptionSize: 'Rozmiar subskrypcji',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktywnych członków/miesiąc`,
            subscriptionRenews: 'Subskrypcja odnawia się',
            youCantDowngrade: 'Nie możesz zmienić planu na tańszy w trakcie rocznej subskrypcji.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Zobowiązałeś(-aś) się już do rocznej subskrypcji na ${size} aktywnych członków miesięcznie do ${date}. Możesz przejść na subskrypcję z opłatą za użycie w dniu ${date}, wyłączając automatyczne odnawianie.`,
            error: {
                size: 'Wprowadź prawidłowy rozmiar subskrypcji',
                sameSize: 'Wpisz liczbę inną niż rozmiar Twojej obecnej subskrypcji',
            },
        },
        paymentCard: {
            addPaymentCard: 'Dodaj kartę płatniczą',
            enterPaymentCardDetails: 'Wprowadź dane swojej karty płatniczej',
            security: 'Expensify jest zgodny ze standardem PCI-DSS, stosuje szyfrowanie na poziomie bankowym i wykorzystuje redundantną infrastrukturę, aby chronić Twoje dane.',
            learnMoreAboutSecurity: 'Dowiedz się więcej o naszym zabezpieczeniu.',
        },
        subscriptionSettings: {
            title: 'Ustawienia subskrypcji',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Typ subskrypcji: ${subscriptionType}, Rozmiar subskrypcji: ${subscriptionSize}, Automatyczne odnawianie: ${autoRenew}, Automatyczne zwiększanie rocznych miejsc: ${autoIncrease}`,
            none: 'brak',
            on: 'włączone',
            off: 'wyłączone',
            annual: 'Rocznie',
            autoRenew: 'Automatyczne odnawianie',
            autoIncrease: 'Automatyczne zwiększanie rocznych miejsc',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Oszczędzaj do ${amountWithCurrency}/miesiąc na aktywnego członka`,
            automaticallyIncrease:
                'Automatycznie zwiększaj liczbę rocznych miejsc, aby uwzględnić aktywnych członków przekraczających rozmiar Twojej subskrypcji. Uwaga: spowoduje to przedłużenie daty zakończenia rocznej subskrypcji.',
            disableAutoRenew: 'Wyłącz automatyczne odnawianie',
            helpUsImprove: 'Pomóż nam ulepszyć Expensify',
            whatsMainReason: 'Jaki jest główny powód, dla którego wyłączasz automatyczne odnawianie?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Odnowi się ${date}.`,
            pricingConfiguration: 'Cena zależy od konfiguracji. Aby uzyskać najniższą cenę, wybierz subskrypcję roczną i zdobądź kartę Expensify.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Dowiedz się więcej na naszej <a href="${CONST.PRICING}">stronie z cenami</a> lub porozmawiaj z naszym zespołem w swoim ${hasAdminsRoom ? `<a href="adminsRoom">Pokój #admins.</a>` : 'pokój #admins'}</muted-text>`,
            estimatedPrice: 'Szacowana cena',
            changesBasedOn: 'To się zmienia w zależności od korzystania z karty Expensify i poniższych opcji subskrypcji.',
        },
        requestEarlyCancellation: {
            title: 'Poproś o wcześniejsze anulowanie',
            subtitle: 'Jaki jest główny powód, dla którego prosisz o wcześniejsze anulowanie?',
            subscriptionCanceled: {
                title: 'Subskrypcja anulowana',
                subtitle: 'Twoja subskrypcja roczna została anulowana.',
                info: 'Jeśli chcesz nadal korzystać ze swojego(-ich) konta(-nt) na zasadzie płatności za użycie, wszystko jest gotowe.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Jeśli chcesz zapobiec przyszłej aktywności i opłatom, musisz <a href="${workspacesListRoute}">usunąć swoje przestrzenie robocze</a>. Pamiętaj, że po usunięciu przestrzeni roboczych zostanie pobrana opłata za wszelką nierozliczoną aktywność z bieżącego miesiąca kalendarzowego.`,
            },
            requestSubmitted: {
                title: 'Żądanie zostało wysłane',
                subtitle:
                    'Dziękujemy za informację, że rozważasz anulowanie subskrypcji. Rozpatrujemy Twoją prośbę i wkrótce skontaktujemy się z Tobą na czacie z <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Żądając wcześniejszego rozwiązania umowy, potwierdzam i zgadzam się, że Expensify nie ma obowiązku uwzględnienia takiego żądania na mocy <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Regulaminu świadczenia usług</a> Expensify ani innej obowiązującej umowy o świadczenie usług zawartej między mną a Expensify oraz że Expensify zachowuje pełną swobodę decyzji w zakresie uwzględnienia takiego żądania.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funkcjonalność wymaga poprawy',
        tooExpensive: 'Zbyt drogie',
        inadequateSupport: 'Niewystarczające wsparcie klienta',
        businessClosing: 'Zamknięcie firmy, redukcja etatów lub przejęcie',
        additionalInfoTitle: 'Na jakie oprogramowanie przechodzisz i dlaczego?',
        additionalInfoInputLabel: 'Twoja odpowiedź',
    },
    roomChangeLog: {
        updateRoomDescription: 'ustaw opis pokoju na:',
        clearRoomDescription: 'wyczyścił opis pokoju',
        changedRoomAvatar: 'zmienił(a) awatar pokoju',
        removedRoomAvatar: 'usunął(-ę) awatar pokoju',
    },
    delegate: {
        switchAccount: 'Przełącz konta:',
        copilotDelegatedAccess: 'Copilot: Dostęp delegowany',
        copilotDelegatedAccessDescription: 'Zezwól innym członkom na dostęp do Twojego konta.',
        addCopilot: 'Dodaj pilota',
        membersCanAccessYourAccount: 'Ci członkowie mają dostęp do Twojego konta:',
        youCanAccessTheseAccounts: 'Możesz uzyskać dostęp do tych kont za pomocą przełącznika kont:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Pełny';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Ograniczone';
                default:
                    return '';
            }
        },
        genericError: 'Ups, coś poszło nie tak. Spróbuj ponownie.',
        onBehalfOfMessage: (delegator: string) => `w imieniu użytkownika ${delegator}`,
        accessLevel: 'Poziom dostępu',
        confirmCopilot: 'Potwierdź swojego drugiego pilota poniżej.',
        accessLevelDescription: 'Wybierz poziom dostępu poniżej. Zarówno Pełny, jak i Ograniczony dostęp pozwalają kopilotom wyświetlać wszystkie rozmowy i wydatki.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Pozwól innemu członkowi wykonywać w Twoim imieniu wszystkie działania na Twoim koncie. Obejmuje to czat, wysyłanie raportów, zatwierdzanie, płatności, aktualizacje ustawień i inne.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Pozwól innemu członkowi wykonywać w Twoim imieniu większość działań na Twoim koncie. Nie obejmuje to zatwierdzania, płatności, odrzuceń i wstrzymań.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Usuń copilot',
        removeCopilotConfirmation: 'Czy na pewno chcesz usunąć tego copilota?',
        changeAccessLevel: 'Zmień poziom dostępu',
        makeSureItIsYou: 'Upewnijmy się, że to Ty',
        enterMagicCode: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby dodać copilota. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby zaktualizować swojego kopilota.`,
        notAllowed: 'Nie tak prędko...',
        noAccessMessage: dedent(`
            Jako kopilot nie masz dostępu do
            tej strony. Przepraszamy!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Jako <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">kopilot</a> dla ${accountOwnerEmail} nie masz uprawnień do wykonania tej akcji. Przepraszamy!`,
        copilotAccess: 'Dostęp do Copilot',
    },
    debug: {
        debug: 'Debug',
        details: 'Szczegóły',
        JSON: 'JSON',
        reportActions: 'Działania',
        reportActionPreview: 'Podgląd',
        nothingToPreview: 'Brak podglądu',
        editJson: 'Edytuj JSON:',
        preview: 'Podgląd:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Brak ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Nieprawidłowa właściwość: ${propertyName} – Oczekiwano: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Nieprawidłowa wartość – oczekiwano: ${expectedValues}`,
        missingValue: 'Brakująca wartość',
        createReportAction: 'Utwórz raport',
        reportAction: 'Działanie raportu',
        report: 'Raport',
        transaction: 'Transakcja',
        violations: 'Naruszenia',
        transactionViolation: 'Naruszenie transakcji',
        hint: 'Zmiany danych nie zostaną wysłane do backendu',
        textFields: 'Pola tekstowe',
        numberFields: 'Pola liczbowe',
        booleanFields: 'Pola logiczne',
        constantFields: 'Pola stałe',
        dateTimeFields: 'Pola DateTime',
        date: 'Data',
        time: 'Czas',
        none: 'Brak',
        visibleInLHN: 'Widoczne w LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'prawda',
        false: 'fałsz',
        viewReport: 'Wyświetl raport',
        viewTransaction: 'Wyświetl transakcję',
        createTransactionViolation: 'Utwórz naruszenie transakcji',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ma szkic komentarza',
            hasGBR: 'Ma Wielką Brytanię',
            hasRBR: 'Ma RBR',
            pinnedByUser: 'Przypięte przez członka',
            hasIOUViolations: 'Ma naruszenia IOU',
            hasAddWorkspaceRoomErrors: 'Ma błędy dodawania pokoju w przestrzeni roboczej',
            isUnread: 'Nieprzeczytane (tryb skupienia)',
            isArchived: 'Jest zarchiwizowane (najnowszy tryb)',
            isSelfDM: 'Własny DM',
            isFocused: 'Jest tymczasowo skupiony',
        },
        reasonGBR: {
            hasJoinRequest: 'Ma prośbę o dołączenie (pokój administratora)',
            isUnreadWithMention: 'Nieprzeczytane z wzmianką',
            isWaitingForAssigneeToCompleteAction: 'Oczekuje, aż osoba przypisana do zadania wykona działanie',
            hasChildReportAwaitingAction: 'Ma podrzędny raport oczekujący na działanie',
            hasMissingInvoiceBankAccount: 'Brak rachunku bankowego faktury',
            hasUnresolvedCardFraudAlert: 'Ma nierozwiązaną blokadę oszustwa kartowego',
            hasDEWApproveFailed: 'Zgoda DEW nie powiodła się',
        },
        reasonRBR: {
            hasErrors: 'Zawiera błędy w raporcie lub danych działań na raporcie',
            hasViolations: 'Ma naruszenia',
            hasTransactionThreadViolations: 'Ma naruszenia wątków transakcji',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Raport oczekuje na działanie',
            theresAReportWithErrors: 'Jest raport z błędami',
            theresAWorkspaceWithCustomUnitsErrors: 'Występują błędy jednostek niestandardowych w przestrzeni roboczej',
            theresAProblemWithAWorkspaceMember: 'Problem z członkiem przestrzeni roboczej',
            theresAProblemWithAWorkspaceQBOExport: 'Wystąpił problem z ustawieniem eksportu połączenia przestrzeni roboczej.',
            theresAProblemWithAContactMethod: 'Wystąpił problem z metodą kontaktu',
            aContactMethodRequiresVerification: 'Metoda kontaktu wymaga weryfikacji',
            theresAProblemWithAPaymentMethod: 'Wystąpił problem z metodą płatności',
            theresAProblemWithAWorkspace: 'Wystąpił problem z przestrzenią roboczą',
            theresAProblemWithYourReimbursementAccount: 'Wystąpił problem z Twoim kontem zwrotów',
            theresABillingProblemWithYourSubscription: 'Wystąpił problem z rozliczeniem Twojej subskrypcji',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Twoja subskrypcja została pomyślnie odnowiona',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Wystąpił problem podczas synchronizacji połączenia przestrzeni roboczej',
            theresAProblemWithYourWallet: 'Wystąpił problem z Twoim portfelem',
            theresAProblemWithYourWalletTerms: 'Wystąpił problem z warunkami Twojego portfela',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Wypróbuj w praktyce',
    },
    migratedUserWelcomeModal: {
        title: 'Witamy w Nowym Expensify!',
        subtitle: 'Ma wszystko, co lubisz w naszym klasycznym rozwiązaniu, plus całą masę ulepszeń, które jeszcze bardziej ułatwią Ci życie:',
        confirmText: 'Ruszajmy!',
        helpText: 'Wypróbuj 2‑minutowe demo',
        features: {
            search: 'Bardziej zaawansowane wyszukiwanie na telefonie, w przeglądarce i na komputerze',
            concierge: 'Wbudowana Concierge AI, która pomoże zautomatyzować Twoje wydatki',
            chat: 'Rozmawiaj przy każdym wydatku, aby szybko wyjaśnić wątpliwości',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '<tooltip>Zacznij <strong>tutaj!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Zmień nazwę zapisanych wyszukiwań</strong> tutaj!</tooltip>',
        accountSwitcher: '<tooltip>Uzyskaj dostęp do swoich <strong>kont Copilot</strong> tutaj</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Zeskanuj nasz przykładowy paragon</strong>, aby zobaczyć, jak to działa!</tooltip>',
            manager: '<tooltip>Wybierz naszego <strong>menedżera testów</strong>, aby go wypróbować!</tooltip>',
            confirmation: '<tooltip>Teraz <strong>prześlij swój wydatek</strong> i zobacz, jak dzieje się magia!</tooltip>',
            tryItOut: 'Wypróbuj to',
        },
        outstandingFilter: '<tooltip>Filtruj wydatki,\nktóre <strong>wymagają zatwierdzenia</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Wyślij ten paragon, aby\n<strong>ukończyć jazdę próbną!</strong></tooltip>',
        gpsTooltip: '<tooltip>Śledzenie GPS w toku! Gdy skończysz, zatrzymaj śledzenie poniżej.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Odrzucić zmiany?',
        body: 'Czy na pewno chcesz odrzucić wprowadzone zmiany?',
        confirmText: 'Odrzuć zmiany',
    },
    scheduledCall: {
        book: {
            title: 'Umów rozmowę',
            description: 'Znajdź termin, który Ci odpowiada.',
            slots: ({date}: {date: string}) => `<muted-text>Dostępne godziny na <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Potwierdź połączenie',
            description: 'Upewnij się, że poniższe szczegóły wyglądają dla Ciebie dobrze. Gdy potwierdzisz rozmowę, wyślemy zaproszenie z dodatkowymi informacjami.',
            setupSpecialist: 'Twój specjalista ds. konfiguracji',
            meetingLength: 'Długość spotkania',
            dateTime: 'Data i godzina',
            minutes: '30 minut',
        },
        callScheduled: 'Rozmowa zaplanowana',
    },
    autoSubmitModal: {
        title: 'Wszystko jasne i przesłane!',
        description: 'Wszystkie ostrzeżenia i naruszenia zostały usunięte, więc:',
        submittedExpensesTitle: 'Te wydatki zostały przesłane',
        submittedExpensesDescription: 'Te wydatki zostały wysłane do osoby akceptującej, ale wciąż można je edytować, dopóki nie zostaną zatwierdzone.',
        pendingExpensesTitle: 'Oczekujące wydatki zostały przeniesione',
        pendingExpensesDescription: 'Wszystkie oczekujące wydatki z karty zostały przeniesione do osobnego raportu, dopóki nie zostaną zaksięgowane.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Wypróbuj w 2‑minutowym teście',
        },
        modal: {
            title: 'Wypróbuj nas w praktyce',
            description: 'Szybko przejdź krótki przewodnik po produkcie, aby od razu być na bieżąco.',
            confirmText: 'Rozpocznij jazdę próbną',
            helpText: 'Pomiń',
            employee: {
                description:
                    '<muted-text>Daj swojej firmie <strong>3 darmowe miesiące Expensify!</strong> Po prostu wpisz poniżej adres e-mail swojego szefa i wyślij mu przykładowy wydatek.</muted-text>',
                email: 'Wprowadź adres e-mail swojego szefa',
                error: 'Ten członek jest właścicielem przestrzeni roboczej, wprowadź innego członka do przetestowania.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Aktualnie testujesz Expensify',
            readyForTheRealThing: 'Gotowy na prawdziwe wyzwanie?',
            getStarted: 'Rozpocznij',
        },
        employeeInviteMessage: (name: string) => `# ${name} zaprosił(a) Cię do przetestowania Expensify
Cześć! Właśnie załatwiłem(-am) nam *3 miesiące za darmo*, żeby przetestować Expensify – najszybszy sposób rozliczania wydatków.

Oto *paragon testowy*, który pokaże Ci, jak to działa:`,
    },
    export: {
        basicExport: 'Podstawowy eksport',
        reportLevelExport: 'Wszystkie dane – poziom raportu',
        expenseLevelExport: 'Wszystkie dane – poziom wydatku',
        exportInProgress: 'Trwa eksport',
        conciergeWillSend: 'Concierge wkrótce wyśle Ci plik.',
    },
    domain: {
        notVerified: 'Niezweryfikowane',
        retry: 'Ponów próbę',
        verifyDomain: {
            title: 'Zweryfikuj domenę',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Przed kontynuowaniem zweryfikuj, że jesteś właścicielem domeny <strong>${domainName}</strong>, aktualizując jej ustawienia DNS.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Uzyskaj dostęp do swojego dostawcy DNS i otwórz ustawienia DNS dla <strong>${domainName}</strong>.`,
            addTXTRecord: 'Dodaj następujący rekord TXT:',
            saveChanges: 'Zapisz zmiany i wróć tutaj, aby zweryfikować swoją domenę.',
            youMayNeedToConsult: `Aby ukończyć weryfikację, może być konieczne skontaktowanie się z działem IT Twojej organizacji. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Dowiedz się więcej</a>.`,
            warning: 'Po weryfikacji wszyscy członkowie Expensify w Twojej domenie otrzymają e-mail z informacją, że ich konto będzie zarządzane w ramach Twojej domeny.',
            codeFetchError: 'Nie można pobrać kodu weryfikacyjnego',
            genericError: 'Nie udało się zweryfikować Twojej domeny. Spróbuj ponownie i skontaktuj się z Concierge, jeśli problem będzie się powtarzał.',
        },
        domainVerified: {
            title: 'Domena zweryfikowana',
            header: 'Jej! Twoja domena została zweryfikowana',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Domena <strong>${domainName}</strong> została pomyślnie zweryfikowana i możesz teraz skonfigurować SAML oraz inne funkcje zabezpieczeń.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Logowanie jednokrotne SAML (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> to funkcja zabezpieczeń, która daje Ci większą kontrolę nad tym, jak członkowie z adresami e-mail w domenie <strong>${domainName}</strong> logują się do Expensify. Aby ją włączyć, musisz potwierdzić, że jesteś upoważnionym administratorem firmowym.</muted-text>`,
            fasterAndEasierLogin: 'Szybsze i łatwiejsze logowanie',
            moreSecurityAndControl: 'Większe bezpieczeństwo i kontrola',
            onePasswordForAnything: 'Jedno hasło do wszystkiego',
        },
        goToDomain: 'Przejdź do domeny',
        samlLogin: {
            title: 'Logowanie SAML',
            subtitle: `<muted-text>Skonfiguruj logowanie członków za pomocą <a href="${CONST.SAML_HELP_URL}">jednokrotnego logowania SAML (SSO).</a></muted-text>`,
            enableSamlLogin: 'Włącz logowanie SAML',
            allowMembers: 'Zezwól członkom logować się za pomocą SAML.',
            requireSamlLogin: 'Wymagaj logowania SAML',
            anyMemberWillBeRequired: 'Każdy członek zalogowany inną metodą będzie musiał ponownie się uwierzytelnić przy użyciu SAML.',
            enableError: 'Nie można było zaktualizować ustawienia włączenia SAML',
            requireError: 'Nie można było zaktualizować ustawienia wymogu SAML',
            disableSamlRequired: 'Wyłącz wymóg SAML',
            oktaWarningPrompt: 'Czy na pewno? To również wyłączy Okta SCIM.',
            requireWithEmptyMetadataError: 'Dodaj poniżej metadane dostawcy tożsamości, aby włączyć',
        },
        samlConfigurationDetails: {
            title: 'Szczegóły konfiguracji SAML',
            subtitle: 'Użyj tych danych, aby skonfigurować SAML.',
            identityProviderMetadata: 'Metadane dostawcy tożsamości',
            entityID: 'Identyfikator jednostki',
            nameIDFormat: 'Format identyfikatora nazwy',
            loginUrl: 'Adres URL logowania',
            acsUrl: 'Adres URL ACS (Assertion Consumer Service)',
            logoutUrl: 'URL wylogowania',
            sloUrl: 'Adres URL SLO (Single Logout)',
            serviceProviderMetaData: 'Metadane usługodawcy',
            oktaScimToken: 'Token SCIM Okta',
            revealToken: 'Pokaż token',
            fetchError: 'Nie można było pobrać szczegółów konfiguracji SAML',
            setMetadataGenericError: 'Nie można ustawić metadanych SAML',
        },
        accessRestricted: {
            title: 'Dostęp ograniczony',
            subtitle: (domainName: string) => `Zweryfikuj, że jesteś uprawnionym administratorem firmy dla <strong>${domainName}</strong>, jeśli potrzebujesz kontroli nad:`,
            companyCardManagement: 'Zarządzanie kartami firmowymi',
            accountCreationAndDeletion: 'Tworzenie i usuwanie konta',
            workspaceCreation: 'Tworzenie przestrzeni roboczej',
            samlSSO: 'SSO SAML',
        },
        addDomain: {
            title: 'Dodaj domenę',
            subtitle: 'Wprowadź nazwę prywatnej domeny, do której chcesz uzyskać dostęp (np. expensify.com).',
            domainName: 'Nazwa domeny',
            newDomain: 'Nowa domena',
        },
        domainAdded: {
            title: 'Dodano domenę',
            description: 'Następnie musisz zweryfikować własność domeny i dostosować ustawienia zabezpieczeń.',
            configure: 'Skonfiguruj',
        },
        enhancedSecurity: {
            title: 'Zwiększone bezpieczeństwo',
            subtitle: 'Wymagaj od członków swojej domeny logowania za pomocą logowania jednokrotnego (SSO), ograniczaj tworzenie przestrzeni roboczych i nie tylko.',
            enable: 'Włącz',
        },
        domainAdmins: 'Administratorzy domeny',
        admins: {
            title: 'Administratorzy',
            findAdmin: 'Znajdź administratora',
            primaryContact: 'Główny kontakt',
            addPrimaryContact: 'Dodaj główny kontakt',
            setPrimaryContactError: 'Nie można ustawić głównego kontaktu. Spróbuj ponownie później.',
            settings: 'Ustawienia',
            consolidatedDomainBilling: 'Zbiorcze rozliczanie domeny',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Po włączeniu główny kontakt będzie opłacać wszystkie przestrzenie robocze należące do członków <strong>${domainName}</strong> i otrzymywać wszystkie potwierdzenia rozliczeń.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'Nie można było zmienić skonsolidowanego rozliczania domen. Spróbuj ponownie później.',
            addAdmin: 'Dodaj administratora',
            addAdminError: 'Nie można dodać tego członka jako administratora. Spróbuj ponownie.',
            revokeAdminAccess: 'Cofnij dostęp administratora',
            cantRevokeAdminAccess: 'Nie można odebrać dostępu administratora od kontaktu technicznego',
            error: {
                removeAdmin: 'Nie można usunąć tego użytkownika jako administratora. Spróbuj ponownie.',
                removeDomain: 'Nie można usunąć tej domeny. Spróbuj ponownie.',
                removeDomainNameInvalid: 'Wprowadź swoją nazwę domeny, aby ją zresetować.',
            },
            resetDomain: 'Zresetuj domenę',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Wpisz proszę <strong>${domainName}</strong>, aby potwierdzić reset domeny.`,
            enterDomainName: 'Wpisz tutaj swoją nazwę domeny',
            resetDomainInfo: `Ta czynność jest <strong>trwała</strong> i spowoduje usunięcie następujących danych: <br/> <ul><li>Połączenia z firmowymi kartami oraz wszystkie nierozliczone wydatki z tych kart</li> <li>Ustawienia SAML i grup</li> </ul> Wszystkie konta, przestrzenie robocze, raporty, wydatki i inne dane pozostaną nienaruszone. <br/><br/>Uwaga: Możesz usunąć tę domenę z listy domen, usuwając powiązany adres e‑mail z swoich <a href="#">metod kontaktu</a>.`,
        },
        members: {
            title: 'Członkowie',
            findMember: 'Znajdź członka',
            addMember: 'Dodaj członka',
            email: 'Adres e-mail',
            errors: {
                addMember: 'Nie można dodać tego członka. Spróbuj ponownie.',
            },
        },
    },
};
export default translations;
