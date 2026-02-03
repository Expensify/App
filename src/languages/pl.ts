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
        unshare: 'Cofnij udostępnianie',
        yes: 'Tak',
        no: 'Nie',
        ok: 'OK',
        notNow: 'Nie teraz',
        noThanks: 'Nie, dziękuję',
        learnMore: 'Dowiedz się więcej',
        buttonConfirm: 'Rozumiem',
        name: 'Nazwa',
        attachment: 'Załącznik',
        attachments: 'Załączniki',
        center: 'Środek',
        from: 'Od',
        to: 'Do',
        in: 'W',
        optional: 'Opcjonalne',
        new: 'Nowy',
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
        view: 'Pokaż',
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
        analyzing: 'Trwa analizowanie...',
        addCardTermsOfService: 'Regulamin Expensify',
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
        visible: 'Widoczne',
        delete: 'Usuń',
        archived: 'zarchiwizowano',
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
        personalAddress: 'Adres osobisty',
        companyAddress: 'Adres firmy',
        noPO: 'Prosimy, bez skrytek pocztowych ani adresów w punktach odbioru poczty.',
        city: 'Miasto',
        state: 'Stan',
        streetAddress: 'Ulica',
        stateOrProvince: 'Stan / prowincja',
        country: 'Kraj',
        zip: 'Kod pocztowy',
        zipPostCode: 'Kod pocztowy',
        whatThis: 'Co to jest?',
        iAcceptThe: 'Akceptuję',
        acceptTermsAndPrivacy: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki świadczenia usług Expensify</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politykę prywatności</a>`,
        acceptTermsAndConditions: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">warunki i zasady</a>`,
        acceptTermsOfService: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi Expensify</a>`,
        remove: 'Usuń',
        admin: 'Administrator',
        owner: 'Właściciel',
        dateFormat: 'YYYY-MM-DD',
        send: 'Wyślij',
        na: 'ND dotyczy',
        noResultsFound: 'Nie znaleziono wyników',
        noResultsFoundMatching: (searchString: string) => `Nie znaleziono wyników pasujących do „${searchString}”`,
        recentDestinations: 'Ostatnie miejsca docelowe',
        timePrefix: 'To jest',
        conjunctionFor: 'dla',
        todayAt: 'Dzisiaj o',
        tomorrowAt: 'Jutro o',
        yesterdayAt: 'Wczoraj o',
        conjunctionAt: 'o',
        conjunctionTo: 'do',
        genericErrorMessage: 'Ups... coś poszło nie tak i Twoje żądanie nie mogło zostać zrealizowane. Spróbuj ponownie później.',
        percentage: 'Procent',
        converted: 'Przekonwertowano',
        error: {
            invalidAmount: 'Nieprawidłowa kwota',
            acceptTerms: 'Aby kontynuować, musisz zaakceptować Warunki świadczenia usług',
            phoneNumber: `Proszę podać pełny numer telefonu
(np. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'To pole jest wymagane',
            requestModified: 'Inny członek właśnie modyfikuje to żądanie',
            characterLimitExceedCounter: (length: number, limit: number) => `Przekroczono limit znaków (${length}/${limit})`,
            dateInvalid: 'Wybierz prawidłową datę',
            invalidDateShouldBeFuture: 'Wybierz dzisiejszą lub przyszłą datę',
            invalidTimeShouldBeFuture: 'Wybierz godzinę co najmniej o minutę późniejszą',
            invalidCharacter: 'Nieprawidłowy znak',
            enterMerchant: 'Wprowadź nazwę sprzedawcy',
            enterAmount: 'Wprowadź kwotę',
            missingMerchantName: 'Brak nazwy sprzedawcy',
            missingAmount: 'Brakująca kwota',
            missingDate: 'Brak daty',
            enterDate: 'Wprowadź datę',
            invalidTimeRange: 'Wprowadź godzinę w 12‑godzinnym formacie (np. 2:30 PM)',
            pleaseCompleteForm: 'Aby kontynuować, wypełnij formularz powyżej',
            pleaseSelectOne: 'Wybierz jedną z powyższych opcji',
            invalidRateError: 'Wprowadź prawidłową stawkę',
            lowRateError: 'Stawka musi być większa niż 0',
            email: 'Wpisz prawidłowy adres e‑mail',
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
        reset: 'Reset',
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
        attachmentWillBeAvailableOnceBackOnline: 'Załącznik będzie dostępny po ponownym połączeniu z internetem.',
        errorOccurredWhileTryingToPlayVideo: 'Wystąpił błąd podczas próby odtworzenia tego wideo.',
        areYouSure: 'Czy na pewno?',
        verify: 'Zweryfikuj',
        yesContinue: 'Tak, kontynuuj',
        websiteExample: 'np. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `np. ${zipSampleFormat}` : ''),
        description: 'Opis',
        title: 'Tytuł',
        assignee: 'Osoba przypisana',
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
        update: 'Aktualizuj',
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
        drafts: 'Wersje robocze',
        draft: 'Szkic',
        finished: 'Zakończono',
        upgrade: 'Ulepsz',
        downgradeWorkspace: 'Obniż poziom przestrzeni roboczej',
        companyID: 'ID firmy',
        userID: 'Identyfikator użytkownika',
        disable: 'Wyłącz',
        export: 'Eksportuj',
        initialValue: 'Wartość początkowa',
        currentDate: 'Aktualna data',
        value: 'Wartość',
        downloadFailedTitle: 'Pobieranie nie powiodło się',
        downloadFailedDescription: 'Nie można było dokończyć pobierania. Spróbuj ponownie później.',
        filterLogs: 'Filtruj logi',
        network: 'Sieć',
        reportID: 'ID raportu',
        longReportID: 'Długi identyfikator raportu',
        withdrawalID: 'Identyfikator wypłaty',
        bankAccounts: 'Konta bankowe',
        chooseFile: 'Wybierz plik',
        chooseFiles: 'Wybierz pliki',
        dropTitle: 'Upuść tutaj',
        dropMessage: 'Upuść tutaj plik',
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
        validate: 'Zatwierdź',
        downloadAsPDF: 'Pobierz jako PDF',
        downloadAsCSV: 'Pobierz jako CSV',
        help: 'Pomoc',
        expenseReport: 'Raport wydatków',
        expenseReports: 'Raporty wydatków',
        rateOutOfPolicy: 'Stawka poza zasadami',
        leaveWorkspace: 'Opuść przestrzeń roboczą',
        leaveWorkspaceConfirmation: 'Jeśli opuścisz ten obszar roboczy, nie będziesz mógł przesyłać do niego wydatków.',
        leaveWorkspaceConfirmationAuditor: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mieć dostępu do jej raportów ani ustawień.',
        leaveWorkspaceConfirmationAdmin: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mógł zarządzać jej ustawieniami.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, w ścieżce zatwierdzania zastąpi Cię ${workspaceOwner}, właściciel przestrzeni roboczej.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, zostaniesz zastąpiony jako preferowany eksporter przez ${workspaceOwner}, właściciela przestrzeni roboczej.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, zostaniesz zastąpiony jako kontakt techniczny przez ${workspaceOwner}, właściciela przestrzeni roboczej.`,
        leaveWorkspaceReimburser:
            'Nie możesz opuścić tej przestrzeni roboczej jako osoba rozliczająca wydatki. Ustaw nową osobę rozliczającą w Przestrzenie robocze > Dokonuj lub śledź płatności, a następnie spróbuj ponownie.',
        reimbursable: 'Podlegające zwrotowi',
        editYourProfile: 'Edytuj swój profil',
        comments: 'Komentarze',
        sharedIn: 'Udostępnione w',
        unreported: 'Nierozliczone',
        explore: 'Odkrywaj',
        insights: 'Wgląd',
        todo: 'Do zrobienia',
        invoice: 'Faktura',
        expense: 'Wydatek',
        chat: 'Czat',
        task: 'Zadanie',
        trip: 'Podróż',
        apply: 'Zastosuj',
        status: 'Status',
        on: 'Włączone',
        before: 'Przed',
        after: 'PoPo',
        reschedule: 'Przełóż',
        general: 'Ogólne',
        workspacesTabTitle: 'Przestrzenie robocze',
        headsUp: 'Uwaga!',
        submitTo: 'Przekaż do',
        forwardTo: 'Przekaż do',
        merge: 'Scal',
        none: 'Brak',
        unstableInternetConnection: 'Niestabilne połączenie internetowe. Sprawdź swoją sieć i spróbuj ponownie.',
        enableGlobalReimbursements: 'Włącz globalne zwroty',
        purchaseAmount: 'Kwota zakupu',
        originalAmount: 'Kwota pierwotna',
        frequency: 'Częstotliwość',
        link: 'Link',
        pinned: 'Przypięte',
        read: 'Przeczytaj',
        copyToClipboard: 'Skopiuj do schowka',
        thisIsTakingLongerThanExpected: 'To trwa dłużej, niż się spodziewaliśmy...',
        domains: 'Domeny',
        actionRequired: 'Wymagane działanie',
        duplicate: 'Duplikuj',
        duplicated: 'Zduplikowano',
        duplicateExpense: 'Zduplikowany wydatek',
        exchangeRate: 'Kurs wymiany',
        reimbursableTotal: 'Łączna kwota do zwrotu',
        nonReimbursableTotal: 'Suma niepodlegająca zwrotowi',
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
            `Nie masz uprawnień do wykonania tej akcji, gdy wsparcie jest zalogowane (polecenie: ${command ?? ''}). Jeśli uważasz, że Success powinien móc wykonać tę akcję, rozpocznij proszę rozmowę na Slacku.`,
    },
    lockedAccount: {
        title: 'Zablokowane konto',
        description: 'Nie możesz wykonać tej akcji, ponieważ to konto zostało zablokowane. Skontaktuj się z concierge@expensify.com, aby poznać kolejne kroki',
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
        importContactsTitle: 'Zaimportuj kontakty',
        importContactsText: 'Zaimportuj kontakty z telefonu, aby Twoje ulubione osoby były zawsze na wyciągnięcie ręki.',
        importContactsExplanation: 'dzięki czemu twoi ulubieni znajomi są zawsze na wyciągnięcie ręki.',
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
        errorWhileSelectingCorruptedAttachment: 'Wystąpił błąd podczas wybierania uszkodzonego załącznika. Spróbuj użyć innego pliku.',
        takePhoto: 'Zrób zdjęcie',
        chooseFromGallery: 'Wybierz z galerii',
        chooseDocument: 'Wybierz plik',
        attachmentTooLarge: 'Załącznik jest zbyt duży',
        sizeExceeded: 'Rozmiar załącznika przekracza limit 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Rozmiar załącznika przekracza limit ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Załącznik jest za mały',
        sizeNotMet: 'Rozmiar załącznika musi być większy niż 240 bajtów',
        wrongFileType: 'Nieprawidłowy typ pliku',
        notAllowedExtension: 'Ten typ pliku jest niedozwolony. Spróbuj użyć innego typu pliku.',
        folderNotAllowedMessage: 'Przesyłanie folderu nie jest dozwolone. Spróbuj użyć innego pliku.',
        protectedPDFNotSupported: 'Plik PDF chroniony hasłem nie jest obsługiwany',
        attachmentImageResized: 'Ten obraz został przeskalowany na potrzeby podglądu. Pobierz go, aby zobaczyć w pełnej rozdzielczości.',
        attachmentImageTooLarge: 'Ten obraz jest zbyt duży, aby wyświetlić podgląd przed przesłaniem.',
        tooManyFiles: (fileLimit: number) => `Możesz jednorazowo przesłać maksymalnie ${fileLimit} plików.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Plik przekracza ${maxUploadSizeInMB} MB. Spróbuj ponownie.`,
        someFilesCantBeUploaded: 'Niektórych plików nie można przesłać',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Pliki muszą mieć mniej niż ${maxUploadSizeInMB} MB. Większe pliki nie zostaną przesłane.`,
        maxFileLimitExceeded: 'Możesz jednocześnie przesłać maksymalnie 30 paragonów. Dodatkowe paragony nie zostaną przesłane.',
        unsupportedFileType: (fileType: string) => `Pliki typu ${fileType} nie są obsługiwane. Zostaną przesłane tylko obsługiwane typy plików.`,
        learnMoreAboutSupportedFiles: 'Dowiedz się więcej o obsługiwanych formatach.',
        passwordProtected: 'Pliki PDF zabezpieczone hasłem nie są obsługiwane. Zostaną przesłane tylko obsługiwane pliki.',
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
        title: 'Połączenie zakończone',
        supportingText: 'Możesz zamknąć to okno i wrócić do aplikacji Expensify.',
    },
    avatarCropModal: {
        title: 'Edytuj zdjęcie',
        description: 'Przeciągaj, powiększaj i obracaj obraz tak, jak chcesz.',
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
            authenticationSuccessful: 'Uwierzytelnianie powiodło się',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `Pomyślnie uwierzytelniono przy użyciu ${authType}.`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Dane biometryczne (${registered ? 'Zarejestrowano' : 'Nie zarejestrowano'})`,
            yourAttemptWasUnsuccessful: 'Twoja próba uwierzytelnienia nie powiodła się.',
            youCouldNotBeAuthenticated: 'Nie udało się uwierzytelnić użytkownika',
            areYouSureToReject: 'Na pewno? Próba uwierzytelnienia zostanie odrzucona, jeśli zamkniesz ten ekran.',
            rejectAuthentication: 'Odrzuć uwierzytelnianie',
            test: 'Test',
            biometricsAuthentication: 'Uwierzytelnianie biometryczne',
        },
        pleaseEnableInSystemSettings: {
            start: 'Włącz weryfikację twarzą/odciskiem palca lub ustaw kod blokady urządzenia w swoim',
            link: 'ustawienia systemowe',
            end: '.',
        },
        oops: 'Ups, coś poszło nie tak',
        looksLikeYouRanOutOfTime: 'Wygląda na to, że skończył ci się czas! Spróbuj ponownie u sprzedawcy.',
        youRanOutOfTime: 'Czas się skończył',
        letsVerifyItsYou: 'Zweryfikujmy, czy to na pewno Ty',
        verifyYourself: {
            biometrics: 'Zweryfikuj się za pomocą twarzy lub odcisku palca',
        },
        enableQuickVerification: {
            biometrics: 'Włącz szybką i bezpieczną weryfikację za pomocą twarzy lub odcisku palca. Bez haseł i kodów.',
        },
        revoke: {
            remove: 'Usuń',
            title: 'Twarz/odcisk palca i klucze dostępu',
            explanation:
                'Weryfikacja twarzy/odciskiem palca lub kluczem dostępu jest włączona na jednym lub kilku urządzeniach. Cofnięcie dostępu spowoduje konieczność użycia magicznego kodu przy następnej weryfikacji na dowolnym urządzeniu.',
            confirmationPrompt: 'Na pewno? Do kolejnej weryfikacji na dowolnym urządzeniu będziesz potrzebować magicznego kodu.',
            cta: 'Cofnij dostęp',
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
            Wprowadź kod z urządzenia,
            na którym został pierwotnie wygenerowany
        `),
        doNotShare: dedent(`
            Nie udostępniaj nikomu swojego kodu.
            Expensify nigdy nie poprosi Cię o niego!
        `),
        or: 'lub',
        signInHere: 'po prostu zaloguj się tutaj',
        expiredCodeTitle: 'Kod magiczny wygasł',
        expiredCodeDescription: 'Wróć do oryginalnego urządzenia i poproś o nowy kod',
        successfulNewCodeRequest: 'Poproszono o kod. Sprawdź swoje urządzenie.',
        tfaRequiredTitle: dedent(`
            Wymagane uwierzytelnianie dwuskładnikowe
        `),
        tfaRequiredDescription: dedent(`
            Wprowadź kod uwierzytelniania dwuskładnikowego
            tam, gdzie próbujesz się zalogować.
        `),
        requestOneHere: 'złóż tutaj jedno żądanie.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Opłacone przez',
        whatsItFor: 'Do czego to służy?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Imię i nazwisko, e-mail lub numer telefonu',
        findMember: 'Znajdź członka',
        searchForSomeone: 'Wyszukaj osobę',
    },
    customApprovalWorkflow: {
        title: 'Niestandardowy przepływ zatwierdzania',
        description: 'Twoja firma ma niestandardowy proces zatwierdzania w tym obszarze roboczym. Wykonaj tę akcję w Expensify Classic',
        goToExpensifyClassic: 'Przełącz na Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Wyślij wydatek, poleć swój zespół',
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
        anotherLoginPageIsOpenExplanation: 'Otworzyłeś stronę logowania w osobnej karcie. Zaloguj się z tamtej karty.',
        welcome: 'Witamy!',
        welcomeWithoutExclamation: 'Witamy',
        phrase2: 'Pieniądze mają głos. A teraz, gdy czat i płatności są w jednym miejscu, jest to także proste.',
        phrase3: 'Twoje płatności docierają do Ciebie tak szybko, jak szybko potrafisz przekazać swoją myśl.',
        enterPassword: 'Wprowadź swoje hasło',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, zawsze miło zobaczyć tu nową twarz!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Wprowadź magiczny kod wysłany na ${login}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
    },
    login: {
        hero: {
            header: 'Podróże i wydatki w tempie czatu',
            body: 'Witamy w nowej generacji Expensify, gdzie Twoje podróże i wydatki są obsługiwane szybciej dzięki kontekstowemu czatowi w czasie rzeczywistym.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Kontynuuj logowanie za pomocą logowania jednokrotnego (SSO):',
        orContinueWithMagicCode: 'Możesz też zalogować się magicznym kodem',
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
            return `Czy na pewno chcesz usunąć ten/ tę ${type}?`;
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
            `Przegapiłeś imprezę w <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, nie ma tu nic do zobaczenia.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Ten czat obejmuje wszystkich członków Expensify w domenie <strong>${domainRoom}</strong>. Używaj go do rozmów ze współpracownikami, dzielenia się wskazówkami i zadawania pytań.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `To jest czat z administratorem <strong>${workspaceName}</strong>. Użyj go, aby porozmawiać o konfiguracji przestrzeni roboczej i nie tylko.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Ten czat jest z wszystkimi w <strong>${workspaceName}</strong>. Używaj go do najważniejszych ogłoszeń.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Ten czat jest przeznaczony na wszystko związane z <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Ten czat służy do faktur między <strong>${invoicePayer}</strong> a <strong>${invoiceReceiver}</strong>. Użyj przycisku +, aby wysłać fakturę.`,
        beginningOfChatHistory: (users: string) => `Ten czat jest z ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Tutaj <strong>${submitterDisplayName}</strong> będzie przesyłać wydatki do <strong>${workspaceName}</strong>. Po prostu użyj przycisku +.`,
        beginningOfChatHistorySelfDM: 'To Twoja osobista przestrzeń. Używaj jej na notatki, zadania, szkice i przypomnienia.',
        beginningOfChatHistorySystemDM: 'Witamy! Zacznijmy konfigurację.',
        chatWithAccountManager: 'Porozmawiaj tutaj z opiekunem konta',
        askMeAnything: 'Zapytaj mnie o cokolwiek!',
        sayHello: 'Przywitaj się!',
        yourSpace: 'Twoja przestrzeń',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Witaj w ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Użyj przycisku +, aby ${additionalText} wydatek.`,
        askConcierge: 'Zadawaj pytania i otrzymuj całodobowe wsparcie w czasie rzeczywistym.',
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
            `utworzył(-a) ten raport, aby zawierał wszystkie wydatki z <a href="${reportUrl}">${reportName}</a>, których nie można było złożyć z wybraną przez Ciebie częstotliwością`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `utworzył/-a ten raport dla wszystkich wstrzymanych wydatków z <a href="${reportUrl}">${reportName}</a>`,
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
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${displayName} zamknął(-ęła) swoje konto.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${oldDisplayName} połączył(-a) swoje konto z ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Ten czat nie jest już aktywny, ponieważ <strong>nie jesteś</strong> już członkiem przestrzeni roboczej ${policyName}.`
                : `Ten czat nie jest już aktywny, ponieważ ${displayName} nie jest już członkiem przestrzeni roboczej ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${policyName} nie jest już aktywnym obszarem roboczym.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${policyName} nie jest już aktywnym obszarem roboczym.`,
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
        chatPinned: 'Czatu przypięto',
        draftedMessage: 'Wiadomość robocza',
        listOfChatMessages: 'Lista wiadomości czatu',
        listOfChats: 'Lista czatów',
        saveTheWorld: 'Uratuj świat',
        tooltip: 'Zacznij tutaj!',
        redirectToExpensifyClassicModal: {
            title: 'Wkrótce dostępne',
            description: 'Dopasowujemy jeszcze kilka elementów Nowego Expensify do Twojej specyficznej konfiguracji. Tymczasem przejdź do klasycznej wersji Expensify.',
        },
    },
    homePage: {
        forYou: 'Dla ciebie',
        timeSensitiveSection: {
            title: 'Wymaga szybkiej reakcji',
            cta: 'Roszczenie',
            offer50off: {
                title: 'Otrzymaj 50% zniżki na pierwszy rok!',
                subtitle: ({formattedTime}: {formattedTime: string}) => `Pozostało ${formattedTime}`,
            },
            offer25off: {
                title: 'Uzyskaj 25% zniżki na pierwszy rok!',
                subtitle: ({days}: {days: number}) => `Pozostało ${days} ${days === 1 ? 'dzień' : 'dni'}`,
            },
            addShippingAddress: {
                title: 'Potrzebujemy Twojego adresu wysyłki',
                subtitle: 'Podaj adres, na który mamy wysłać Twoją kartę Expensify.',
                cta: 'Dodaj adres',
            },
            activateCard: {
                title: 'Aktywuj swoją kartę Expensify',
                subtitle: 'Zatwierdź swoją kartę i zacznij wydawać.',
                cta: 'Aktywuj',
            },
        },
        announcements: 'Ogłoszenia',
        discoverSection: {
            title: 'Odkryj',
            menuItemTitleNonAdmin: 'Dowiedz się, jak tworzyć wydatki i wysyłać raporty.',
            menuItemTitleAdmin: 'Dowiedz się, jak zapraszać członków, edytować procesy zatwierdzania i uzgadniać karty firmowe.',
            menuItemDescription: 'Zobacz, co Expensify potrafi w 2 minuty',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `Prześlij ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            approve: ({count}: {count: number}) => `Zatwierdź ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            pay: ({count}: {count: number}) => `Zapłać ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            export: ({count}: {count: number}) => `Eksportuj ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            begin: 'Rozpocznij',
            emptyStateMessages: {
                nicelyDone: 'Dobra robota',
                keepAnEyeOut: 'Wypatruj tego, co nadejdzie!',
                allCaughtUp: 'Wszystko odrobione',
                upcomingTodos: 'Nadchodzące zadania pojawią się tutaj.',
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
        manual: 'Instrukcja',
        scan: 'Skanuj',
        map: 'Mapa',
        gps: 'GPS',
        odometer: 'Licznik przebiegu',
    },
    spreadsheet: {
        upload: 'Prześlij arkusz kalkulacyjny',
        import: 'Importuj arkusz kalkulacyjny',
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
        importMultiLevelTagsSuccessfulDescription: 'Dodano wielopoziomowe tagi.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `Dodano stawki diety: ${rates}.` : 'Dodano 1 stawkę diety.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) => (transactions > 1 ? `Zaimportowano ${transactions} transakcje.` : 'Zaimportowano 1 transakcję.'),
        importFailedTitle: 'Import nieudany',
        importFailedDescription: 'Upewnij się, że wszystkie pola zostały poprawnie wypełnione i spróbuj ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z Concierge.',
        importDescription: 'Wybierz, które pola zmapować z arkusza kalkulacyjnego, klikając menu rozwijane obok każdej zaimportowanej kolumny poniżej.',
        sizeNotMet: 'Rozmiar pliku musi być większy niż 0 bajtów',
        invalidFileMessage:
            'Przesłany plik jest pusty lub zawiera nieprawidłowe dane. Upewnij się, że plik ma prawidłowy format i zawiera wszystkie wymagane informacje, zanim prześlesz go ponownie.',
        importSpreadsheetLibraryError: 'Nie udało się załadować modułu arkusza kalkulacyjnego. Sprawdź połączenie z internetem i spróbuj ponownie.',
        importSpreadsheet: 'Importuj arkusz kalkulacyjny',
        downloadCSV: 'Pobierz plik CSV',
        importMemberConfirmation: () => ({
            one: `Potwierdź poniższe dane nowego członka przestrzeni roboczej, który zostanie dodany w ramach tego przesyłania. Istniejący członkowie nie otrzymają żadnych aktualizacji ról ani zaproszeń.`,
            other: (count: number) =>
                `Potwierdź poniższe szczegóły dotyczące ${count} nowych członków przestrzeni roboczej, którzy zostaną dodani w ramach tego przesyłania. Istniejący członkowie nie otrzymają żadnych aktualizacji ról ani wiadomości z zaproszeniem.`,
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
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Wyślij paragony SMS-em na ${phoneNumber} (tylko numery w USA)</label-text>`,
        takePhoto: 'Zrób zdjęcie',
        cameraAccess: 'Dostęp do aparatu jest wymagany, aby robić zdjęcia paragonów.',
        deniedCameraAccess: `Dostęp do aparatu nadal nie został przyznany, postępuj zgodnie z <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">tymi instrukcjami</a>.`,
        cameraErrorTitle: 'Błąd aparatu',
        cameraErrorMessage: 'Wystąpił błąd podczas robienia zdjęcia. Spróbuj ponownie.',
        locationAccessTitle: 'Zezwól na dostęp do lokalizacji',
        locationAccessMessage: 'Dostęp do lokalizacji pomaga nam utrzymać poprawną strefę czasową i walutę, gdziekolwiek jesteś.',
        locationErrorTitle: 'Zezwól na dostęp do lokalizacji',
        locationErrorMessage: 'Dostęp do lokalizacji pomaga nam utrzymać poprawną strefę czasową i walutę, gdziekolwiek jesteś.',
        allowLocationFromSetting: `Dostęp do lokalizacji pomaga nam utrzymywać poprawne ustawienia strefy czasowej i waluty, gdziekolwiek jesteś. Zezwól proszę na dostęp do lokalizacji w ustawieniach uprawnień urządzenia.`,
        dropTitle: 'Odpuść to',
        dropMessage: 'Upuść tutaj plik',
        flash: 'błysk',
        multiScan: 'wielokrotne skanowanie',
        shutter: 'migawka',
        gallery: 'galeria',
        deleteReceipt: 'Usuń paragon',
        deleteConfirmation: 'Czy na pewno chcesz usunąć ten paragon?',
        addReceipt: 'Dodaj paragon',
        scanFailed: 'Nie można było zeskanować paragonu, ponieważ brakuje na nim sprzedawcy, daty lub kwoty.',
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
        noLongerHaveReportAccess: 'Nie masz już dostępu do swojego poprzedniego szybkiego działania. Wybierz poniżej nowe.',
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
        approved: 'Zatwierdzono',
        cash: 'Gotówka',
        card: 'Karta',
        original: 'Oryginał',
        split: 'Podziel',
        splitExpense: 'Podziel wydatek',
        splitDates: 'Podziel daty',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} do ${endDate} (${count} dni)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} od ${merchant}`,
        splitByPercentage: 'Podziel procentowo',
        splitByDate: 'Podziel według daty',
        addSplit: 'Dodaj podział',
        makeSplitsEven: 'Podziel równo',
        editSplits: 'Edytuj podziały',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Kwota łączna jest o ${amount} wyższa niż pierwotny wydatek.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Kwota całkowita jest o ${amount} mniejsza niż pierwotny wydatek.`,
        splitExpenseZeroAmount: 'Wprowadź prawidłową kwotę przed kontynuowaniem.',
        splitExpenseOneMoreSplit: 'Nie dodano podziałów. Dodaj co najmniej jeden, aby zapisać.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Edytuj ${amount} dla ${merchant}`,
        removeSplit: 'Usuń podział',
        splitExpenseCannotBeEditedModalTitle: 'Ten wydatek nie może zostać edytowany',
        splitExpenseCannotBeEditedModalDescription: 'Zatwierdzonych ani opłaconych wydatków nie można edytować',
        splitExpenseDistanceErrorModalDescription: 'Napraw błąd stawki za dystans i spróbuj ponownie.',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zapłać ${name ?? 'ktoś'}`,
        expense: 'Wydatek',
        categorize: 'Skategoryzuj',
        share: 'Udostępnij',
        participants: 'Uczestnicy',
        createExpense: 'Utwórz wydatek',
        trackDistance: 'Śledź dystans',
        createExpenses: (expensesNumber: number) => `Utwórz ${expensesNumber} wydatki`,
        removeExpense: 'Usuń wydatek',
        removeThisExpense: 'Usuń ten wydatek',
        removeExpenseConfirmation: 'Czy na pewno chcesz usunąć ten paragon? Tej operacji nie można cofnąć.',
        addExpense: 'Dodaj wydatek',
        chooseRecipient: 'Wybierz odbiorcę',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Utwórz wydatek ${amount}`,
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
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `przeniósł ten wydatek${reportName ? `do <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `przeniósł(-ę) ten wydatek${reportName ? `z <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `przeniósł ten wydatek do Twojej <a href="${reportUrl}">przestrzeni osobistej</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `przeniósł(-ę) ten raport do przestrzeni roboczej <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `przeniósł ten <a href="${movedReportUrl}">raport</a> do przestrzeni roboczej <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Oczekuje na dopasowanie paragonu do transakcji kartą',
        pendingMatch: 'Oczekujące dopasowanie',
        pendingMatchWithCreditCardDescription: 'Oczekuje na dopasowanie paragonu do transakcji kartą. Oznacz jako gotówkę, aby anulować.',
        markAsCash: 'Oznacz jako gotówkę',
        routePending: 'Trasa w toku…',
        receiptScanning: () => ({
            one: 'Skanowanie paragonu...',
            other: 'Skanowanie paragonów...',
        }),
        scanMultipleReceipts: 'Zeskanuj wiele paragonów',
        scanMultipleReceiptsDescription: 'Zrób zdjęcia wszystkich paragonów naraz, a potem samodzielnie potwierdź szczegóły albo pozwól, żebyśmy zrobili to za Ciebie.',
        receiptScanInProgress: 'Trwa skanowanie paragonu',
        receiptScanInProgressDescription: 'Trwa skanowanie paragonu. Sprawdź później lub wprowadź dane teraz.',
        removeFromReport: 'Usuń z raportu',
        moveToPersonalSpace: 'Przenieś wydatki do swojej przestrzeni osobistej',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Wykryto potencjalnie zduplikowane wydatki. Sprawdź duplikaty, aby umożliwić przesłanie.'
                : 'Wykryto potencjalnie zduplikowane wydatki. Przejrzyj duplikaty, aby umożliwić zatwierdzenie.',
        receiptIssuesFound: () => ({
            one: 'Wykryto problem',
            other: 'Znalezione problemy',
        }),
        fieldPending: 'Oczekuje…',
        defaultRate: 'Domyślna stawka',
        receiptMissingDetails: 'Brak danych na paragonie',
        missingAmount: 'Brakująca kwota',
        missingMerchant: 'Brak sprzedawcy',
        receiptStatusTitle: 'Skanowanie…',
        receiptStatusText: 'Tylko ty widzisz ten paragon podczas skanowania. Sprawdź ponownie później lub wprowadź szczegóły teraz.',
        receiptScanningFailed: 'Skanowanie paragonu nie powiodło się. Wprowadź dane ręcznie.',
        transactionPendingDescription: 'Transakcja w toku. Zaksięgowanie może potrwać kilka dni.',
        companyInfo: 'Informacje o firmie',
        companyInfoDescription: 'Potrzebujemy jeszcze kilku informacji, zanim będziesz mógł wysłać swoją pierwszą fakturę.',
        yourCompanyName: 'Nazwa Twojej firmy',
        yourCompanyWebsite: 'Strona internetowa Twojej firmy',
        yourCompanyWebsiteNote: 'Jeśli nie masz strony internetowej, możesz zamiast niej podać profil swojej firmy na LinkedIn lub w mediach społecznościowych.',
        invalidDomainError: 'Wprowadzone domena jest nieprawidłowa. Aby kontynuować, wprowadź prawidłową domenę.',
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
        settledElsewhere: 'Opłacone gdzie indziej',
        individual: 'Osoba',
        business: 'Firma',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} z Expensify` : `Zapłać przez Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako osoba prywatna` : `Zapłać z konta osobistego`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} z portfela` : `Zapłać portfelem`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Zapłać ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako firma` : `Zapłać z konta firmowego`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Oznacz ${formattedAmount} jako zapłaconą` : `Oznacz jako zapłacone`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z konta osobistego ${last4Digits}` : `Zapłacono z konta osobistego`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z firmowego konta ${last4Digits}` : `Zapłacono z konta firmowego`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Zapłać ${formattedAmount} przez ${policyName}` : `Zapłać przez ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z konta bankowego ${last4Digits}` : `zapłacono z konta bankowego ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `zapłacono ${amount ? `${amount} ` : ''} z konta bankowego ${last4Digits} przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        invoicePersonalBank: (lastFour: string) => `Konto osobiste • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Konto firmowe • ${lastFour}`,
        nextStep: 'Następne kroki',
        finished: 'Zakończono',
        flip: 'Odwróć',
        sendInvoice: ({amount}: RequestAmountParams) => `Wyślij fakturę na ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `za ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `przesłano${memo ? `, wpisując ${memo}` : ''}`,
        automaticallySubmitted: `przesłano przez <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">opóźnianie wysyłania</a>`,
        queuedToSubmitViaDEW: 'w kolejce do przesłania przez niestandardowy proces zatwierdzania',
        queuedToApproveViaDEW: 'oczekuje na zatwierdzenie w niestandardowym procesie akceptacji',
        trackedAmount: (formattedAmount: string, comment?: string) => `śledzenie ${formattedAmount}${comment ? `za ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `podziel ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `podziel ${formattedAmount}${comment ? `za ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Twój podział ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} jest winien ${amount}${comment ? `za ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} jest winien:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}zapłacił(a) ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} zapłacił(a):`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} wydał(-a) ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} wydał:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} zatwierdził(a):`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} zatwierdził(a) ${amount}`,
        payerSettled: (amount: number | string) => `zapłacono ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `zapłacono ${amount}. Dodaj konto bankowe, aby otrzymać płatność.`,
        automaticallyApproved: `zatwierdzone przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reguły przestrzeni roboczej</a>`,
        approvedAmount: (amount: number | string) => `zatwierdzono ${amount}`,
        approvedMessage: `zatwierdzono`,
        unapproved: `niezatwierdzone`,
        automaticallyForwarded: `zatwierdzone przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reguły przestrzeni roboczej</a>`,
        forwarded: `zatwierdzono`,
        rejectedThisReport: 'odrzucił(-a) ten raport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `rozpoczęto płatność, ale oczekuje na to, aż ${submitterDisplayName} doda konto bankowe.`,
        adminCanceledRequest: 'anulowano płatność',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `anulowano płatność ${amount}, ponieważ ${submitterDisplayName} nie aktywował(-a) swojego portfela Expensify w ciągu 30 dni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} dodał konto bankowe. Płatność w wysokości ${amount} została wykonana.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}oznaczone jako opłacone${comment ? `, mówiąc „${comment}”` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}zapłacono z portfela`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}zapłacono przez Expensify za pomocą <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reguł przestrzeni roboczej</a>`,
        noReimbursableExpenses: 'Ten raport ma nieprawidłową kwotę',
        pendingConversionMessage: 'Suma zaktualizuje się, gdy wrócisz do trybu online',
        changedTheExpense: 'zmienił(a) wydatek',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} na ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `ustawiono ${translatedChangedField} na ${newMerchant}, co ustawiło kwotę na ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName} (wcześniej ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} na ${newValueToDisplay} (wcześniej ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `zmienił(a) ${translatedChangedField} na ${newMerchant} (wcześniej ${oldMerchant}), co zaktualizowało kwotę na ${newAmountToDisplay} (wcześniej ${oldAmountToDisplay})`,
        basedOnAI: 'na podstawie dotychczasowej aktywności',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `na podstawie <a href="${rulesLink}">zasad przestrzeni roboczej</a>` : 'na podstawie reguły przestrzeni roboczej'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `dla ${comment}` : 'wydatek'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Raport faktury nr ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `Wysłano ${formattedAmount}${comment ? `za ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `przeniesiono wydatek z przestrzeni osobistej do ${workspaceName ?? `czat z ${reportName}`}`,
        movedToPersonalSpace: 'przeniesiono wydatek do przestrzeni prywatnej',
        error: {
            invalidCategoryLength: 'Nazwa kategorii przekracza 255 znaków. Skróć ją lub wybierz inną kategorię.',
            invalidTagLength: 'Nazwa taga przekracza 255 znaków. Skróć ją lub wybierz inny tag.',
            invalidAmount: 'Wprowadź poprawną kwotę przed kontynuowaniem',
            invalidDistance: 'Wprowadź prawidłowy dystans przed kontynuowaniem',
            invalidReadings: 'Wprowadź zarówno odczyt początkowy, jak i końcowy',
            negativeDistanceNotAllowed: 'Końcowy odczyt musi być większy niż początkowy odczyt',
            invalidIntegerAmount: 'Przed kontynuowaniem wprowadź kwotę w pełnych dolarach',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maksymalna kwota podatku to ${amount}`,
            invalidSplit: 'Suma podziałów musi być równa całkowitej kwocie',
            invalidSplitParticipants: 'Wprowadź kwotę większą od zera dla co najmniej dwóch uczestników',
            invalidSplitYourself: 'Wprowadź niezerową kwotę dla swojego podziału',
            noParticipantSelected: 'Wybierz uczestnika',
            other: 'Nieoczekiwany błąd. Spróbuj ponownie później.',
            genericCreateFailureMessage: 'Niespodziewany błąd podczas przesyłania tego wydatku. Spróbuj ponownie później.',
            genericCreateInvoiceFailureMessage: 'Nieoczekiwany błąd podczas wysyłania tej faktury. Spróbuj ponownie później.',
            genericHoldExpenseFailureMessage: 'Nieoczekiwany błąd podczas wstrzymywania tego wydatku. Spróbuj ponownie później.',
            genericUnholdExpenseFailureMessage: 'Nieoczekiwany błąd podczas zdejmowania tego wydatku z wstrzymania. Spróbuj ponownie później.',
            receiptDeleteFailureError: 'Nieoczekiwany błąd podczas usuwania tego paragonu. Spróbuj ponownie później.',
            receiptFailureMessage: '<rbr>Wystąpił błąd podczas przesyłania paragonu. Prosimy <a href="download">zapisać paragon</a> i <a href="retry">spróbować ponownie</a> później.</rbr>',
            receiptFailureMessageShort: 'Wystąpił błąd podczas przesyłania paragonu.',
            genericDeleteFailureMessage: 'Nieoczekiwany błąd podczas usuwania tego wydatku. Spróbuj ponownie później.',
            genericEditFailureMessage: 'Nieoczekiwany błąd podczas edycji tego wydatku. Spróbuj ponownie później.',
            genericSmartscanFailureMessage: 'W transakcji brakuje pól',
            duplicateWaypointsErrorMessage: 'Usuń zduplikowane punkty trasy',
            atLeastTwoDifferentWaypoints: 'Wprowadź co najmniej dwa różne adresy',
            splitExpenseMultipleParticipantsErrorMessage: 'Wydatek nie może być podzielony między przestrzeń roboczą a innych członków. Zaktualizuj swój wybór.',
            invalidMerchant: 'Wprowadź prawidłowego sprzedawcę',
            atLeastOneAttendee: 'Co najmniej jeden uczestnik musi zostać wybrany',
            invalidQuantity: 'Wprowadź prawidłową ilość',
            quantityGreaterThanZero: 'Ilość musi być większa niż zero',
            invalidSubrateLength: 'Musi istnieć co najmniej jedna podstawowa stawka',
            invalidRate: 'Stawka nie jest dostępna dla tego przestrzeni roboczej. Wybierz proszę jedną z dostępnych stawek w tej przestrzeni roboczej.',
            endDateBeforeStartDate: 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia',
            endDateSameAsStartDate: 'Data zakończenia nie może być taka sama jak data rozpoczęcia',
            manySplitsProvided: `Maksymalna dozwolona liczba podziałów to ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Zakres dat nie może przekraczać ${CONST.IOU.SPLITS_LIMIT} dni.`,
        },
        dismissReceiptError: 'Odrzuć błąd',
        dismissReceiptErrorConfirmation: 'Uwaga! Zamknięcie tego błędu spowoduje całkowite usunięcie przesłanego paragonu. Czy na pewno chcesz kontynuować?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `rozpoczął rozliczanie. Płatność jest wstrzymana, dopóki ${submitterDisplayName} nie włączy swojego portfela.`,
        enableWallet: 'Włącz portfel',
        hold: 'Wstrzymaj',
        unhold: 'Usuń blokadę',
        holdExpense: () => ({
            one: 'Wstrzymaj wydatek',
            other: 'Wstrzymaj wydatki',
        }),
        unholdExpense: 'Zdejmij blokadę z wydatku',
        heldExpense: 'wstrzymał ten wydatek',
        unheldExpense: 'zdjął wstrzymanie z tego wydatku',
        moveUnreportedExpense: 'Przenieś nierozliczony wydatek',
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
        retract: 'Wycofaj',
        reopened: 'ponownie otwarto',
        reopenReport: 'Otwórz ponownie raport',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Ten raport został już wyeksportowany do ${connectionName}. Zmiana może spowodować rozbieżności w danych. Czy na pewno chcesz ponownie otworzyć ten raport?`,
        reason: 'Powód',
        holdReasonRequired: 'Przy wstrzymaniu wymagane jest podanie powodu.',
        expenseWasPutOnHold: 'Wydatek został wstrzymany',
        expenseOnHold: 'Ten wydatek został wstrzymany. Sprawdź komentarze, aby poznać kolejne kroki.',
        expensesOnHold: 'Wszystkie wydatki zostały wstrzymane. Sprawdź komentarze, aby poznać kolejne kroki.',
        expenseDuplicate: 'Ten wydatek ma szczegóły podobne do innego. Sprawdź duplikaty, aby kontynuować.',
        someDuplicatesArePaid: 'Niektóre z tych duplikatów zostały już zatwierdzone lub opłacone.',
        reviewDuplicates: 'Przejrzyj duplikaty',
        keepAll: 'Zachowaj wszystko',
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
        payOnly: 'Zapłać tylko',
        approveOnly: 'Tylko zaakceptuj',
        holdEducationalTitle: 'Czy powinieneś wstrzymać ten wydatek?',
        whatIsHoldExplain: 'Wstrzymanie działa jak naciśnięcie „pauzy” na wydatku, dopóki nie będziesz gotowy, aby go przesłać.',
        holdIsLeftBehind: 'Wstrzymane wydatki pozostają nieprzetworzone, nawet jeśli prześlesz cały raport.',
        unholdWhenReady: 'Zdejmij wstrzymanie z wydatków, gdy będziesz gotowy(-a) je przesłać.',
        changePolicyEducational: {
            title: 'Przeniesiono ten raport!',
            description: 'Sprawdź dokładnie te elementy, które zwykle się zmieniają podczas przenoszenia raportów do nowej przestrzeni roboczej.',
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
        reimbursable: 'podlegające zwrotowi',
        nonReimbursable: 'bez zwrotu kosztów',
        bookingPending: 'Ta rezerwacja jest w toku',
        bookingPendingDescription: 'Ta rezerwacja jest oczekująca, ponieważ nie została jeszcze opłacona.',
        bookingArchived: 'Ta rezerwacja jest zarchiwizowana',
        bookingArchivedDescription: 'Ta rezerwacja została zarchiwizowana, ponieważ data podróży już minęła. W razie potrzeby dodaj wydatek na ostateczną kwotę.',
        attendees: 'Uczestnicy',
        whoIsYourAccountant: 'Kim jest twój księgowy?',
        paymentComplete: 'Płatność zakończona',
        time: 'Czas',
        startDate: 'Data początkowa',
        endDate: 'Data zakończenia',
        startTime: 'Czas rozpoczęcia',
        endTime: 'Czas zakończenia',
        deleteSubrate: 'Usuń stawkę podrzędną',
        deleteSubrateConfirmation: 'Czy na pewno chcesz usunąć tę stawkę podrzędną?',
        quantity: 'Ilość',
        subrateSelection: 'Wybierz podstawkę i wprowadź ilość.',
        qty: 'Ilość',
        firstDayText: () => ({
            one: `Pierwszy dzień: 1 godzina`,
            other: (count: number) => `Pierwszy dzień: ${count.toFixed(2)} godziny`,
        }),
        lastDayText: () => ({
            one: `Ostatni dzień: 1 godzina`,
            other: (count: number) => `Ostatni dzień: ${count.toFixed(2)} godziny`,
        }),
        tripLengthText: () => ({
            one: `Podróż: 1 pełny dzień`,
            other: (count: number) => `Podróż: ${count} pełne dni`,
        }),
        dates: 'Daty',
        rates: 'Stawki',
        submitsTo: ({name}: SubmitsToParams) => `Przesyła do ${name}`,
        reject: {
            educationalTitle: 'Zatrzymać czy odrzucić?',
            educationalText: 'Jeśli nie jesteś gotowy, aby zatwierdzić lub opłacić wydatek, możesz go wstrzymać lub odrzucić.',
            holdExpenseTitle: 'Wstrzymaj wydatek, aby poprosić o więcej szczegółów przed jego zatwierdzeniem lub wypłatą.',
            approveExpenseTitle: 'Zatwierdzaj inne wydatki, podczas gdy wstrzymane wydatki pozostają przypisane do Ciebie.',
            heldExpenseLeftBehindTitle: 'Wstrzymane wydatki są pomijane, gdy zatwierdzasz cały raport.',
            rejectExpenseTitle: 'Odrzuć wydatek, którego nie zamierzasz zatwierdzić ani opłacić.',
            reasonPageTitle: 'Odrzuć wydatek',
            reasonPageDescription: 'Wyjaśnij, dlaczego odrzucasz ten wydatek.',
            rejectReason: 'Powód odrzucenia',
            markAsResolved: 'Oznacz jako rozwiązane',
            rejectedStatus: 'Ten wydatek został odrzucony. Czekamy, aż naprawisz problemy i oznaczysz go jako rozwiązany, aby umożliwić przesłanie.',
            reportActions: {
                rejectedExpense: 'odrzucił ten wydatek',
                markedAsResolved: 'oznaczono powód odrzucenia jako rozwiązany',
            },
        },
        moveExpenses: () => ({one: 'Przenieś wydatek', other: 'Przenieś wydatki'}),
        moveExpensesError: 'Nie możesz przenosić diet do raportów w innych przestrzeniach roboczych, ponieważ stawki diet mogą się różnić między przestrzeniami roboczymi.',
        changeApprover: {
            title: 'Zmień osobę zatwierdzającą',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Wybierz opcję, aby zmienić osobę zatwierdzającą ten raport. (Zaktualizuj swoje <a href="${workflowSettingLink}">ustawienia przestrzeni roboczej</a>, aby zmienić to na stałe dla wszystkich raportów).`,
            changedApproverMessage: (managerID: number) => `zmienił(a) akceptującego na <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Dodaj zatwierdzającego',
                addApproverSubtitle: 'Dodaj dodatkową osobę zatwierdzającą do istniejącego przepływu zatwierdzania.',
                bypassApprovers: 'Pomiń zatwierdzających',
                bypassApproversSubtitle: 'Przypisz siebie jako ostatecznego akceptującego i pomiń wszystkich pozostałych akceptujących.',
            },
            addApprover: {
                subtitle: 'Wybierz dodatkowego akceptującego ten raport, zanim przekażemy go dalej w procesie akceptacji.',
            },
        },
        chooseWorkspace: 'Wybierz przestrzeń roboczą',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `raport skierowano do ${to} z powodu niestandardowego przepływu zatwierdzania`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'godzina' : 'godziny'} @ ${rate} / godzinę`,
            hrs: 'godz.',
            hours: 'Godziny',
            ratePreview: (rate: string) => `${rate} / godzinę`,
            amountTooLargeError: 'Łączna kwota jest zbyt wysoka. Zmniejsz liczbę godzin lub obniż stawkę.',
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
                    return value ? 'oznaczył(-a) wydatek jako „fakturowany”' : 'oznaczono wydatek jako „niefakturowalny”';
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
                return `${translations.common[key].toLowerCase()} na „${updatedValue}”`;
            });
            return `${formatList(fragments)} przez <a href="${policyRulesRoute}">zasady przestrzeni roboczej</a>`;
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Połącz wydatki',
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
                const article = StringUtils.startsWithVowel(field) ? 'włączony' : 'a';
                return `Wybierz ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Wybierz uczestników',
            selectAllDetailsError: 'Zaznacz wszystkie szczegóły przed kontynuowaniem.',
        },
        confirmationPage: {
            header: 'Potwierdź szczegóły',
            pageTitle: 'Potwierdź szczegóły, które zachowujesz. Szczegóły, których nie zachowasz, zostaną usunięte.',
            confirmButton: 'Połącz wydatki',
        },
    },
    share: {
        shareToExpensify: 'Udostępnij do Expensify',
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
        numberHasNotBeenValidated: 'Numer nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny w wiadomości tekstowej.',
        emailHasNotBeenValidated: 'Adres e-mail nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny w wiadomości tekstowej.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Prześlij zdjęcie',
        removePhoto: 'Usuń zdjęcie',
        editImage: 'Edytuj zdjęcie',
        viewPhoto: 'Zobacz zdjęcie',
        imageUploadFailed: 'Nie udało się przesłać obrazu',
        deleteWorkspaceError: 'Przepraszamy, wystąpił nieoczekiwany problem podczas usuwania awatara Twojego przestrzeni roboczej',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Wybrany obraz przekracza maksymalny rozmiar przesyłania ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Prześlij obraz o rozmiarze większym niż ${minHeightInPx}x${minWidthInPx} pikseli i mniejszym niż ${maxHeightInPx}x${maxWidthInPx} pikseli.`,
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
                        return `Czekamy, aż <strong>Ty</strong> dodasz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> doda wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na dodanie wydatków przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Czekamy, aż <strong>ty</strong> złożysz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> przesłał(a) wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie, aż administrator prześle wydatki.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Nie są wymagane dalsze działania!`,
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
                        return `Oczekiwanie na automatyczne zgłoszenie <strong>Twoich</strong> wydatków${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie na automatyczne przesłanie wydatków użytkownika <strong>${actor}</strong>${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na automatyczne złożenie wydatków administratora${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Czekamy, aż <strong>Ty</strong> naprawisz problemy.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> naprawi problemy.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na naprawienie problemów przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> zatwierdzisz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> zatwierdzi wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na zatwierdzenie wydatków przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekuje, aż <strong>Ty</strong> wyeksportujesz ten raport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> wyeksportuje ten raport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na administratora, aby wyeksportował ten raport.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> opłacisz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> zapłaci za wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na opłacenie wydatków przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Czekamy, aż <strong>Ty</strong> zakończysz konfigurację firmowego konta bankowego.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> zakończy zakładanie firmowego konta bankowego.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na ukończenie konfiguracji firmowego konta bankowego przez administratora.`;
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
                `Ups! Wygląda na to, że wysyłasz zgłoszenie <strong>do siebie</strong>. Zatwierdzanie własnych raportów jest <strong>zabronione</strong> w Twojej przestrzeni roboczej. Wyślij ten raport do kogoś innego lub skontaktuj się z administratorem, aby zmienić osobę, do której je przesyłasz.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'wkrótce',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'później dzisiaj',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'w niedzielę',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '1. i 16. dnia każdego miesiąca',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'w ostatnim dniu roboczym miesiąca',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'w ostatnim dniu miesiąca',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'na koniec Twojej podróży',
        },
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Preferowane zaimki',
        selectYourPronouns: 'Wybierz swoje zaimki',
        selfSelectYourPronoun: 'Wybierz własne zaimki',
        emailAddress: 'Adres e-mail',
        setMyTimezoneAutomatically: 'Ustaw moją strefę czasową automatycznie',
        timezone: 'Strefa czasowa',
        invalidFileMessage: 'Nieprawidłowy plik. Spróbuj użyć innego obrazu.',
        avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Spróbuj ponownie.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronizowanie',
        profileAvatar: 'Awatar profilu',
        publicSection: {
            title: 'Public',
            subtitle: 'Te dane są wyświetlane w Twoim publicznym profilu. Każdy może je zobaczyć.',
        },
        privateSection: {
            title: 'Prywatne',
            subtitle: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane w Twoim publicznym profilu.',
        },
    },
    securityPage: {
        title: 'Opcje zabezpieczeń',
        subtitle: 'Włącz uwierzytelnianie dwuskładnikowe, aby chronić swoje konto.',
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
        featureRequiresValidate: 'Ta funkcja wymaga zweryfikowania Twojego konta.',
        validateAccount: 'Zweryfikuj swoje konto',
        helpText: ({email}: {email: string}) =>
            `Dodaj więcej sposobów logowania i wysyłania paragonów do Expensify.<br/><br/>Dodaj adres e-mail, aby przekazywać paragony na <a href="mailto:${email}">${email}</a>, lub dodaj numer telefonu, aby wysyłać paragony SMS-em na 47777 (tylko numery z USA).`,
        pleaseVerify: 'Zweryfikuj tę metodę kontaktu.',
        getInTouch: 'Użyjemy tej metody, aby się z Tobą skontaktować.',
        enterMagicCode: (contactMethod: string) => `Wpisz magiczny kod wysłany na ${contactMethod}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        setAsDefault: 'Ustaw jako domyślne',
        yourDefaultContactMethod: 'To jest Twoja domyślna metoda kontaktu. Zanim będziesz mógł ją usunąć, musisz wybrać inną metodę kontaktu i kliknąć „Ustaw jako domyślną”.',
        removeContactMethod: 'Usuń metodę kontaktu',
        removeAreYouSure: 'Czy na pewno chcesz usunąć tę metodę kontaktu? Tej akcji nie można cofnąć.',
        failedNewContact: 'Nie udało się dodać tej metody kontaktu.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Nie udało się wysłać nowego magicznego kodu. Poczekaj chwilę i spróbuj ponownie.',
            validateSecondaryLogin: 'Nieprawidłowy lub niepoprawny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
            deleteContactMethod: 'Nie udało się usunąć metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            setDefaultContactMethod: 'Nie udało się ustawić nowej domyślnej metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            addContactMethod: 'Nie udało się dodać tej metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            enteredMethodIsAlreadySubmitted: 'Ta metoda kontaktu już istnieje',
            passwordRequired: 'wymagane hasło.',
            contactMethodRequired: 'Metoda kontaktu jest wymagana',
            invalidContactMethod: 'Nieprawidłowa metoda kontaktu',
        },
        newContactMethod: 'Nowy sposób kontaktu',
        goBackContactMethods: 'Wróć do metod kontaktu',
    },
    pronouns: {
        coCos: 'Co / Coś',
        eEyEmEir: 'On / Onx / Onu / One',
        faeFaer: 'Fae / Faer',
        heHimHis: 'On / Jego / Jemu',
        heHimHisTheyThemTheirs: 'On / Jego / Jemu / Oni / Ich / Im',
        sheHerHers: 'Ona / Ją / Jej',
        sheHerHersTheyThemTheirs: 'Ona / Jej / Jej / Oni / Ich / Ich',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Na osobę / Osoby',
        theyThemTheirs: 'Oni / Ich / Ich',
        thonThons: 'Thon / Thons',
        veVerVis: 'Manet / Menet / Mniej',
        viVir: 'Ty / Tobie',
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
        getLocationAutomatically: 'Automatycznie określ swoją lokalizację',
    },
    updateRequiredView: {
        updateRequired: 'Wymagana aktualizacja',
        pleaseInstall: 'Zaktualizuj do najnowszej wersji New Expensify',
        pleaseInstallExpensifyClassic: 'Zainstaluj najnowszą wersję Expensify',
        toGetLatestChanges: 'Na urządzeniu mobilnym pobierz i zainstaluj najnowszą wersję. W przeglądarce odśwież stronę.',
        newAppNotAvailable: 'Aplikacja Nowy Expensify nie jest już dostępna.',
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
                '<muted-text>Użyj poniższych narzędzi, aby rozwiązać problemy z działaniem Expensify. Jeśli napotkasz jakiekolwiek problemy, prosimy <concierge-link>zgłosić błąd</concierge-link>.</muted-text>',
            confirmResetDescription: 'Wszystkie niewysłane szkice wiadomości zostaną utracone, ale reszta Twoich danych jest bezpieczna.',
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
            destroy: 'Usuń',
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
            leftHandNavCache: 'Pamięć podręczna lewego panelu nawigacji',
            clearleftHandNavCache: 'Wyczyść',
            recordTroubleshootData: 'Rejestruj dane do rozwiązywania problemów',
            softKillTheApp: 'Miękko zamknij aplikację',
            kill: 'Zabij',
            sentryDebug: 'Debugowanie Sentry',
            sentryDebugDescription: 'Rejestruj żądania Sentry w konsoli',
            sentryHighlightedSpanOps: 'Wyróżnione nazwy zakresów',
            sentryHighlightedSpanOpsPlaceholder: 'kliknięcie interfejsu, nawigacja, ładowanie interfejsu',
        },
        debugConsole: {
            saveLog: 'Zapisz dziennik',
            shareLog: 'Udostępnij dziennik',
            enterCommand: 'Wpisz polecenie',
            execute: 'Wykonaj',
            noLogsAvailable: 'Brak dostępnych dzienników',
            logSizeTooLarge: ({size}: LogSizeParams) => `Rozmiar dziennika przekracza limit ${size} MB. Użyj proszę opcji „Zapisz dziennik”, aby zamiast tego pobrać plik dziennika.`,
            logs: 'Dzienniki',
            viewConsole: 'Wyświetl konsolę',
        },
        security: 'Bezpieczeństwo',
        signOut: 'Wyloguj się',
        restoreStashed: 'Przywróć zapisane logowanie',
        signOutConfirmationText: 'Utracisz wszystkie zmiany w trybie offline, jeśli się wylogujesz.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Przeczytaj <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi</a> i <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politykę prywatności</a>.</muted-text-micro>`,
        help: 'Pomoc',
        whatIsNew: 'Nowości',
        accountSettings: 'Ustawienia konta',
        account: 'Konto',
        general: 'Ogólne',
    },
    closeAccountPage: {
        closeAccount: 'Zamknij konto',
        reasonForLeavingPrompt: 'Byłoby nam bardzo przykro, gdybyś odszedł! Czy mógłbyś nam powiedzieć, dlaczego, abyśmy mogli się poprawić?',
        enterMessageHere: 'Wpisz tutaj wiadomość',
        closeAccountWarning: 'Zamknięcie konta jest nieodwracalne.',
        closeAccountPermanentlyDeleteData: 'Na pewno chcesz usunąć swoje konto? Spowoduje to trwałe usunięcie wszystkich nierozliczonych wydatków.',
        enterDefaultContactToConfirm: 'Wpisz swoją domyślną metodę kontaktu, aby potwierdzić, że chcesz zamknąć konto. Twoja domyślna metoda kontaktu to:',
        enterDefaultContact: 'Wprowadź swoją domyślną metodę kontaktu',
        defaultContact: 'Domyślna metoda kontaktu:',
        enterYourDefaultContactMethod: 'Aby zamknąć konto, wprowadź domyślną metodę kontaktu.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Połącz konta',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Wpisz konto, które chcesz połączyć z kontem <strong>${login}</strong>.`,
            notReversibleConsent: 'Rozumiem, że tego nie da się cofnąć',
        },
        accountValidate: {
            confirmMerge: 'Czy na pewno chcesz scalić konta?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Połączenie Twoich kont jest nieodwracalne i spowoduje utratę wszystkich niewysłanych wydatków dla użytkownika <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Aby kontynuować, wprowadź magiczny kod wysłany na adres <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Nieprawidłowy lub niepoprawny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
                fallback: 'Coś poszło nie tak. Spróbuj ponownie później.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konta połączone!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Pomyślnie połączono wszystkie dane z <strong>${from}</strong> z <strong>${to}</strong>. Od teraz możesz używać dowolnego loginu dla tego konta.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Pracujemy nad tym',
            limitedSupport: 'Nie obsługujemy jeszcze łączenia kont w Nowym Expensify. Wykonaj tę akcję w Expensify Classic.',
            reachOutForHelp: '<muted-text><centered-text>Jeśli masz jakieś pytania, śmiało <concierge-link>skontaktuj się z Concierge</concierge-link>!</centered-text></muted-text>',
            goToExpensifyClassic: 'Przejdź do Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz połączyć <strong>${email}</strong>, ponieważ jest kontrolowany przez <strong>${email.split('@').at(1) ?? ''}</strong>. Prosimy <concierge-link>skontaktować się z Concierge</concierge-link> po pomoc.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić konta <strong>${email}</strong> z innymi kontami, ponieważ administrator Twojej domeny ustawił je jako Twoje główne logowanie. Zamiast tego scal inne konta z tym kontem.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Nie można scalić kont, ponieważ dla adresu <strong>${email}</strong> włączono uwierzytelnianie dwuskładnikowe (2FA). Wyłącz 2FA dla <strong>${email}</strong> i spróbuj ponownie.</centered-text></muted-text>`,
            learnMore: 'Dowiedz się więcej o łączeniu kont.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić <strong>${email}</strong>, ponieważ jest zablokowany. <concierge-link>Skontaktuj się z Concierge</concierge-link>, aby uzyskać pomoc.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Nie możesz scalić kont, ponieważ <strong>${email}</strong> nie ma konta w Expensify. Zamiast tego prosimy <a href="${contactMethodLink}">dodać je jako metodę kontaktu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz połączyć konta <strong>${email}</strong> z innymi kontami. Zamiast tego połącz inne konta z nim.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić kont z kontem <strong>${email}</strong>, ponieważ to konto jest właścicielem rozliczanej fakturą relacji rozliczeniowej.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Spróbuj ponownie później',
            description: 'Wykonano zbyt wiele prób połączenia kont. Spróbuj ponownie później.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Nie możesz scalić z innymi kontami, ponieważ to konto nie jest zweryfikowane. Zweryfikuj konto i spróbuj ponownie.',
        },
        mergeFailureSelfMerge: {
            description: 'Nie można scalić konta samo ze sobą.',
        },
        mergeFailureGenericHeading: 'Nie można połączyć kont',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Zgłoś podejrzaną aktywność',
        lockAccount: 'Zablokuj konto',
        unlockAccount: 'Odblokuj konto',
        compromisedDescription:
            'Zauważyłeś coś niepokojącego na swoim koncie? Zgłoszenie tego natychmiast zablokuje Twoje konto, wstrzyma nowe transakcje kartą Expensify i uniemożliwi wprowadzanie zmian na koncie.',
        domainAdminsDescription: 'Dla administratorów domeny: to również wstrzymuje całą aktywność kart Expensify oraz działania administracyjne w Twojej domenie (domenach).',
        areYouSure: 'Czy na pewno chcesz zablokować swoje konto Expensify?',
        onceLocked: 'Po zablokowaniu Twoje konto będzie ograniczone do czasu złożenia prośby o odblokowanie i przeprowadzenia kontroli bezpieczeństwa',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Nie udało się zablokować konta',
        failedToLockAccountDescription: `Nie udało się zablokować Twojego konta. Porozmawiaj z Concierge, aby rozwiązać ten problem.`,
        chatWithConcierge: 'Czat z Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto zablokowane',
        yourAccountIsLocked: 'Twoje konto jest zablokowane',
        chatToConciergeToUnlock: 'Porozmawiaj z Concierge, aby rozwiązać problemy z bezpieczeństwem i odblokować swoje konto.',
        chatWithConcierge: 'Czat z Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Uwierzytelnianie dwuskładnikowe',
        twoFactorAuthEnabled: 'Włączono uwierzytelnianie dwuskładnikowe',
        whatIsTwoFactorAuth:
            'Uwierzytelnianie dwuskładnikowe (2FA) pomaga chronić Twoje konto. Podczas logowania musisz wprowadzić kod wygenerowany przez wybraną przez Ciebie aplikację uwierzytelniającą.',
        disableTwoFactorAuth: 'Wyłącz uwierzytelnianie dwuskładnikowe',
        explainProcessToRemove: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod z aplikacji uwierzytelniającej.',
        explainProcessToRemoveWithRecovery: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod odzyskiwania.',
        disabled: 'Uwierzytelnianie dwuskładnikowe jest teraz wyłączone',
        noAuthenticatorApp: 'Nie będziesz już potrzebować aplikacji uwierzytelniającej, aby logować się do Expensify.',
        stepCodes: 'Kody odzyskiwania',
        keepCodesSafe: 'Zachowaj te kody odzyskiwania w bezpiecznym miejscu!',
        codesLoseAccess: dedent(`
            Jeśli utracisz dostęp do aplikacji uwierzytelniającej i nie będziesz mieć tych kodów, stracisz dostęp do swojego konta.

            Uwaga: Włączenie uwierzytelniania dwuskładnikowego spowoduje wylogowanie Cię ze wszystkich innych aktywnych sesji.
        `),
        errorStepCodes: 'Skopiuj lub pobierz kody przed kontynuowaniem',
        stepVerify: 'Zweryfikuj',
        scanCode: 'Zeskanuj kod QR za pomocą swojego',
        authenticatorApp: 'aplikacja uwierzytelniająca',
        addKey: 'Lub dodaj ten tajny klucz do swojej aplikacji uwierzytelniającej:',
        enterCode: 'Następnie wprowadź sześciocyfrowy kod wygenerowany przez aplikację uwierzytelniającą.',
        stepSuccess: 'Zakończono',
        enabled: 'Włączono uwierzytelnianie dwuskładnikowe',
        congrats: 'Gratulacje! Masz teraz dodatkowe zabezpieczenie.',
        copy: 'Kopiuj',
        disable: 'Wyłącz',
        enableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe',
        pleaseEnableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe.',
        twoFactorAuthIsRequiredDescription: 'Ze względów bezpieczeństwa Xero wymaga uwierzytelniania dwuskładnikowego, aby połączyć integrację.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Wymagane uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredForAdminsTitle: 'Włącz uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredXero: 'Twoje połączenie księgowe z Xero wymaga uwierzytelniania dwuskładnikowego.',
        twoFactorAuthIsRequiredCompany: 'Twoetapowe uwierzytelnianie jest wymagane przez Twoją firmę.',
        twoFactorAuthCannotDisable: 'Nie można wyłączyć 2FA',
        twoFactorAuthRequired: 'Dla połączenia z Xero wymagana jest weryfikacja dwuetapowa (2FA) i nie można jej wyłączyć.',
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
        allSet: 'Wszystko gotowe. Zachowaj nowe hasło w bezpiecznym miejscu.',
    },
    privateNotes: {
        title: 'Prywatne notatki',
        personalNoteMessage: 'Zapisuj notatki o tej rozmowie tutaj. Tylko Ty możesz je dodawać, edytować lub przeglądać.',
        sharedNoteMessage: 'Zapisuj tutaj notatki dotyczące tej rozmowy. Pracownicy Expensify oraz inni członkowie w domenie team.expensify.com mogą je zobaczyć.',
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
        securityCode: 'Kod bezpieczeństwa',
        changeBillingCurrency: 'Zmień walutę rozliczeniową',
        changePaymentCurrency: 'Zmień walutę płatności',
        paymentCurrency: 'Waluta płatności',
        paymentCurrencyDescription: 'Wybierz standardową walutę, na którą mają być przeliczane wszystkie wydatki osobiste',
        note: `Uwaga: Zmiana waluty płatności może mieć wpływ na to, ile zapłacisz za Expensify. Pełne informacje znajdziesz na naszej <a href="${CONST.PRICING}">stronie z cennikiem</a>.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Dodaj kartę debetową',
        nameOnCard: 'Imię i nazwisko na karcie',
        debitCardNumber: 'Numer karty debetowej',
        expiration: 'Data ważności',
        expirationDate: 'MMRR',
        cvv: 'CVV',
        billingAddress: 'Adres rozliczeniowy',
        growlMessageOnSave: 'Twoja karta debetowa została pomyślnie dodana',
        expensifyPassword: 'Hasło do Expensify',
        error: {
            invalidName: 'Imię może zawierać tylko litery',
            addressZipCode: 'Wpisz prawidłowy kod pocztowy',
            debitCardNumber: 'Wprowadź prawidłowy numer karty debetowej',
            expirationDate: 'Wybierz poprawną datę ważności',
            securityCode: 'Wprowadź prawidłowy kod zabezpieczający',
            addressStreet: 'Wprowadź prawidłowy adres rozliczeniowy, który nie jest skrytką pocztową',
            addressState: 'Wybierz stan',
            addressCity: 'Wpisz miasto',
            genericFailureMessage: 'Wystąpił błąd podczas dodawania Twojej karty. Spróbuj ponownie.',
            password: 'Wprowadź swoje hasło do Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Dodaj kartę płatniczą',
        nameOnCard: 'Imię i nazwisko na karcie',
        paymentCardNumber: 'Numer karty',
        expiration: 'Data ważności',
        expirationDate: 'MM/RR',
        cvv: 'CVV',
        billingAddress: 'Adres rozliczeniowy',
        growlMessageOnSave: 'Twoja karta płatnicza została pomyślnie dodana',
        expensifyPassword: 'Hasło do Expensify',
        error: {
            invalidName: 'Imię może zawierać tylko litery',
            addressZipCode: 'Wpisz prawidłowy kod pocztowy',
            paymentCardNumber: 'Wprowadź prawidłowy numer karty',
            expirationDate: 'Wybierz poprawną datę ważności',
            securityCode: 'Wprowadź prawidłowy kod zabezpieczający',
            addressStreet: 'Wprowadź prawidłowy adres rozliczeniowy, który nie jest skrytką pocztową',
            addressState: 'Wybierz stan',
            addressCity: 'Wpisz miasto',
            genericFailureMessage: 'Wystąpił błąd podczas dodawania Twojej karty. Spróbuj ponownie.',
            password: 'Wprowadź swoje hasło do Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Metody płatności',
        setDefaultConfirmation: 'Ustaw domyślną metodę płatności',
        setDefaultSuccess: 'Ustawiono domyślną metodę płatności!',
        deleteAccount: 'Usuń konto',
        deleteConfirmation: 'Czy na pewno chcesz usunąć to konto?',
        deleteCard: 'Usuń kartę',
        deleteCardConfirmation:
            'Wszystkie niewysłane transakcje z karty, w tym te na otwartych raportach, zostaną usunięte. Na pewno chcesz usunąć tę kartę? Tej czynności nie można cofnąć.',
        error: {
            notOwnerOfBankAccount: 'Wystąpił błąd podczas ustawiania tego konta bankowego jako domyślnej metody płatności',
            invalidBankAccount: 'To konto bankowe jest tymczasowo zawieszone',
            notOwnerOfFund: 'Wystąpił błąd podczas ustawiania tej karty jako domyślnej metody płatności',
            setDefaultFailure: 'Coś poszło nie tak. Porozmawiaj z Concierge, aby uzyskać dalszą pomoc.',
        },
        addBankAccountFailure: 'Wystąpił nieoczekiwany błąd podczas próby dodania Twojego konta bankowego. Spróbuj ponownie.',
        getPaidFaster: 'Szybciej otrzymuj płatności',
        addPaymentMethod: 'Dodaj metodę płatności, aby wysyłać i odbierać płatności bezpośrednio w aplikacji.',
        getPaidBackFaster: 'Szybciej otrzymuj zwrot pieniędzy',
        secureAccessToYourMoney: 'Bezpieczny dostęp do Twoich pieniędzy',
        receiveMoney: 'Otrzymuj pieniądze w swojej lokalnej walucie',
        expensifyWallet: 'Portfel Expensify (beta)',
        sendAndReceiveMoney: 'Wysyłaj i odbieraj pieniądze ze znajomymi. Tylko konta bankowe w USA.',
        enableWallet: 'Włącz portfel',
        addBankAccountToSendAndReceive: 'Dodaj konto bankowe, aby wysyłać lub odbierać płatności.',
        addDebitOrCreditCard: 'Dodaj kartę debetową lub kredytową',
        assignedCards: 'Przypisane karty',
        assignedCardsDescription: 'Transakcje z tych kart synchronizują się automatycznie.',
        expensifyCard: 'Karta Expensify',
        walletActivationPending: 'Sprawdzamy Twoje informacje. Sprawdź ponownie za kilka minut!',
        walletActivationFailed: 'Niestety w tej chwili nie można włączyć Twojego portfela. Skontaktuj się z Concierge, aby uzyskać dalszą pomoc.',
        addYourBankAccount: 'Dodaj swoje konto bankowe',
        addBankAccountBody: 'Połącz swoje konto bankowe z Expensify, aby jeszcze łatwiej wysyłać i otrzymywać płatności bezpośrednio w aplikacji.',
        chooseYourBankAccount: 'Wybierz swoje konto bankowe',
        chooseAccountBody: 'Upewnij się, że wybierasz właściwą.',
        confirmYourBankAccount: 'Potwierdź swoje konto bankowe',
        personalBankAccounts: 'Prywatne konta bankowe',
        businessBankAccounts: 'Firmowe konta bankowe',
        shareBankAccount: 'Udostępnij konto bankowe',
        bankAccountShared: 'Udostępnione konto bankowe',
        shareBankAccountTitle: 'Wybierz administratorów, z którymi chcesz udostępnić to konto bankowe:',
        shareBankAccountSuccess: 'Udostępniono konto bankowe!',
        shareBankAccountSuccessDescription: 'Wybrani administratorzy otrzymają wiadomość z potwierdzeniem od Concierge.',
        shareBankAccountFailure: 'Wystąpił nieoczekiwany błąd podczas próby udostępnienia konta bankowego. Spróbuj ponownie.',
        shareBankAccountEmptyTitle: 'Brak dostępnych administratorów',
        shareBankAccountEmptyDescription: 'Nie ma żadnych administratorów przestrzeni roboczej, z którymi możesz udostępnić to konto bankowe.',
        shareBankAccountNoAdminsSelected: 'Wybierz administratora przed kontynuowaniem',
        unshareBankAccount: 'Przestań udostępniać konto bankowe',
        unshareBankAccountDescription: 'Wszyscy poniżej mają dostęp do tego konta bankowego. Możesz w każdej chwili odebrać im dostęp. Nadal zrealizujemy wszystkie płatności będące w toku.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} straci dostęp do tego firmowego konta bankowego. Nadal zrealizujemy wszystkie płatności w toku.`,
        reachOutForHelp: 'Jest używany z kartą Expensify. <concierge-link>Skontaktuj się z Concierge</concierge-link>, jeśli musisz przestać się nim dzielić.',
        unshareErrorModalTitle: 'Nie można cofnąć udostępniania konta bankowego',
    },
    cardPage: {
        expensifyCard: 'Karta Expensify',
        expensifyTravelCard: 'Karta podróżna Expensify',
        availableSpend: 'Pozostały limit',
        smartLimit: {
            name: 'Inteligentny limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Możesz wydać do ${formattedLimit} tą kartą, a limit będzie się odnawiał w miarę zatwierdzania zgłoszonych wydatków.`,
        },
        fixedLimit: {
            name: 'Stały limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Możesz wydać do ${formattedLimit} na tej karcie, a następnie zostanie ona dezaktywowana.`,
        },
        monthlyLimit: {
            name: 'Limit miesięczny',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Możesz wydawać do ${formattedLimit} miesięcznie na tej karcie. Limit zostanie zresetowany pierwszego dnia każdego miesiąca kalendarzowego.`,
        },
        virtualCardNumber: 'Numer karty wirtualnej',
        travelCardCvv: 'Kod CVV karty podróżnej',
        physicalCardNumber: 'Numer fizycznej karty',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Zamów kartę fizyczną',
        reportFraud: 'Zgłoś oszustwo kartą wirtualną',
        reportTravelFraud: 'Zgłoś oszustwo kartą podróżną',
        reviewTransaction: 'Sprawdź transakcję',
        suspiciousBannerTitle: 'Podejrzana transakcja',
        suspiciousBannerDescription: 'Wykryliśmy podejrzane transakcje na Twojej karcie. Stuknij poniżej, aby je sprawdzić.',
        cardLocked: 'Twoja karta jest tymczasowo zablokowana, podczas gdy nasz zespół sprawdza konto Twojej firmy.',
        markTransactionsAsReimbursable: 'Oznacz transakcje jako podlegające zwrotowi',
        markTransactionsDescription: 'Po włączeniu transakcje zaimportowane z tej karty są domyślnie oznaczane jako podlegające zwrotowi.',
        csvCardDescription: 'Import CSV',
        cardDetails: {
            cardNumber: 'Numer karty wirtualnej',
            expiration: 'Wygaśnięcie',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Pokaż szczegóły',
            revealCvv: 'Pokaż kod CVV',
            copyCardNumber: 'Skopiuj numer karty',
            updateAddress: 'Zaktualizuj adres',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Dodano do portfela ${platform}`,
        cardDetailsLoadingFailure: 'Wystąpił błąd podczas wczytywania szczegółów karty. Sprawdź swoje połączenie internetowe i spróbuj ponownie.',
        validateCardTitle: 'Upewnijmy się, że to Ty',
        enterMagicCode: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby wyświetlić szczegóły karty. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Dodaj proszę <a href="${missingDetailsLink}">swoje dane osobowe</a>, a następnie spróbuj ponownie.`,
        unexpectedError: 'Wystąpił błąd podczas pobierania szczegółów Twojej karty Expensify. Spróbuj ponownie.',
        cardFraudAlert: {
            confirmButtonText: 'Tak, robię',
            reportFraudButtonText: 'Nie, to nie byłem ja',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `usunął podejrzaną aktywność i ponownie aktywował kartę x${cardLastFour}. Możesz dalej rozliczać wydatki!`,
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
            }) => `wykryto podejrzaną aktywność na karcie kończącej się na ${cardLastFour}. Czy rozpoznajesz tę transakcję?

${amount} dla ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Wydatki',
        workflowDescription: 'Skonfiguruj workflow od momentu poniesienia wydatku, łącznie z akceptacją i płatnością.',
        submissionFrequency: 'Zgłoszenia',
        submissionFrequencyDescription: 'Wybierz niestandardowy harmonogram składania wydatków.',
        submissionFrequencyDateOfMonth: 'Dzień miesiąca',
        disableApprovalPromptDescription: 'Wyłączenie zatwierdzania usunie wszystkie istniejące procesy zatwierdzania.',
        addApprovalsTitle: 'Zatwierdzenia',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `wydatki od ${members}, a zatwierdzającym jest ${approvers}`,
        addApprovalButton: 'Dodaj proces akceptacji',
        addApprovalTip: 'Domyślny proces pracy ma zastosowanie do wszystkich członków, chyba że istnieje bardziej szczegółowy proces pracy.',
        approver: 'Osoba zatwierdzająca',
        addApprovalsDescription: 'Wymagaj dodatkowej akceptacji przed autoryzacją płatności.',
        makeOrTrackPaymentsTitle: 'Płatności',
        makeOrTrackPaymentsDescription: 'Dodaj upoważnionego płatnika dla płatności dokonywanych w Expensify lub śledź płatności wykonywane gdzie indziej.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>W tym obszarze roboczym jest włączony niestandardowy proces zatwierdzania. Aby przejrzeć lub zmienić ten proces, skontaktuj się ze swoim <account-manager-link>opiekunem klienta</account-manager-link> lub z <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>W tym obszarze roboczym jest włączony niestandardowy przepływ zatwierdzania. Aby przejrzeć lub zmienić ten przepływ pracy, skontaktuj się z <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wybierz, jak długo Expensify ma czekać, zanim udostępni wydatki bez błędów.',
        },
        frequencyDescription: 'Wybierz, jak często wydatki mają być wysyłane automatycznie, lub ustaw wysyłanie ręczne',
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
            `<strong>${name1}</strong> już zatwierdza raporty dla <strong>${name2}</strong>. Wybierz innego zatwierdzającego, aby uniknąć zapętlenia przepływu pracy.`,
        emptyContent: {
            title: 'Brak członków do wyświetlenia',
            expensesFromSubtitle: 'Wszyscy członkowie tego obszaru roboczego już należą do istniejącego obiegu zatwierdzania.',
            approverSubtitle: 'Wszyscy zatwierdzający należą do istniejącego przepływu pracy.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Nie udało się zmienić częstotliwości wysyłania. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        monthlyOffsetErrorMessage: 'Nie można było zmienić miesięcznej częstotliwości. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Potwierdź',
        header: 'Dodaj więcej zatwierdzających i potwierdź.',
        additionalApprover: 'Dodatkowy zatwierdzający',
        submitButton: 'Dodaj proces',
    },
    workflowsEditApprovalsPage: {
        title: 'Edytuj proces zatwierdzania',
        deleteTitle: 'Usuń proces zatwierdzania',
        deletePrompt: 'Czy na pewno chcesz usunąć ten proces zatwierdzania? Wszyscy członkowie będą następnie korzystać z domyślnego procesu.',
    },
    workflowsExpensesFromPage: {
        title: 'Wydatki od',
        header: 'Gdy następujący członkowie przesyłają wydatki:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Nie udało się zmienić osoby zatwierdzającej. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
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
        enterApproverError: 'Zatwierdzający jest wymagany, gdy ustawisz limit raportu',
        enterBothError: 'Wprowadź kwotę raportu i dodatkowego akceptującego',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Raporty powyżej ${approvalLimit} przekazuj do ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Upoważniony płatnik',
        genericErrorMessage: 'Nie można było zmienić upoważnionej osoby płacącej. Spróbuj ponownie.',
        admins: 'Administratorzy',
        payer: 'Płatnik',
        paymentAccount: 'Konto płatnicze',
    },
    reportFraudPage: {
        title: 'Zgłoś oszustwo kartą wirtualną',
        description: 'Jeśli dane Twojej wirtualnej karty zostały skradzione lub przejęte, trwale dezaktywujemy Twoją obecną kartę i zapewnimy Ci nową wirtualną kartę z nowym numerem.',
        deactivateCard: 'Dezaktywuj kartę',
        reportVirtualCardFraud: 'Zgłoś oszustwo kartą wirtualną',
    },
    reportFraudConfirmationPage: {
        title: 'Zgłoszono oszustwo kartowe',
        description: 'Trwale dezaktywowaliśmy Twoją dotychczasową kartę. Gdy wrócisz do szczegółów karty, będzie tam dostępna nowa wirtualna karta.',
        buttonText: 'Jasne, dzięki!',
    },
    activateCardPage: {
        activateCard: 'Aktywuj kartę',
        pleaseEnterLastFour: 'Wprowadź ostatnie cztery cyfry swojej karty.',
        activatePhysicalCard: 'Aktywuj kartę fizyczną',
        error: {
            thatDidNotMatch: 'To nie zgadza się z ostatnimi 4 cyframi Twojej karty. Spróbuj ponownie.',
            throttled:
                'Zbyt wiele razy błędnie wprowadziłeś(-aś) ostatnie 4 cyfry swojej karty Expensify. Jeśli jesteś pewien/pewna, że numery są poprawne, skontaktuj się z Concierge, aby rozwiązać problem. W przeciwnym razie spróbuj ponownie później.',
        },
    },
    getPhysicalCard: {
        header: 'Zamów kartę fizyczną',
        nameMessage: 'Wpisz swoje imię i nazwisko, ponieważ zostaną one wyświetlone na Twojej karcie.',
        legalName: 'Imię i nazwisko (pełne)',
        legalFirstName: 'Imię (zgodnie z dokumentem tożsamości)',
        legalLastName: 'Nazwisko zgodne z dokumentami',
        phoneMessage: 'Wprowadź swój numer telefonu.',
        phoneNumber: 'Numer telefonu',
        address: 'Adres',
        addressMessage: 'Wprowadź swój adres wysyłki.',
        streetAddress: 'Adres ulicy',
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
        transfer: ({amount}: TransferParams) => `Przelew${amount ? ` ${amount}` : ''}`,
        instant: 'Natychmiastowa (karta debetowa)',
        instantSummary: (rate: string, minAmount: string) => `Opłata ${rate}% (minimum ${minAmount})`,
        ach: '1–3 dni robocze (konto bankowe)',
        achSummary: 'Bez opłat',
        whichAccount: 'Które konto?',
        fee: 'Opłata',
        transferSuccess: 'Przelew zakończony sukcesem!',
        transferDetailBankAccount: 'Twoje pieniądze powinny dotrzeć w ciągu najbliższych 1–3 dni roboczych.',
        transferDetailDebitCard: 'Twoje pieniądze powinny dotrzeć natychmiast.',
        failedTransfer: 'Twoje saldo nie jest w pełni rozliczone. Przelej środki na konto bankowe.',
        notHereSubTitle: 'Przelej swoje środki z poziomu strony portfela',
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
            title: 'Nie utworzono żadnych reguł',
            subtitle: 'Dodaj regułę, aby zautomatyzować raportowanie wydatków.',
        },
        changes: {
            billableUpdate: (value: boolean) => `Zaktualizuj wydatek ${value ? 'rozliczalny' : 'niepodlegające fakturowaniu'}`,
            categoryUpdate: (value: string) => `Zaktualizuj kategorię na „${value}”`,
            commentUpdate: (value: string) => `Zaktualizuj opis na „${value}”`,
            merchantUpdate: (value: string) => `Zaktualizuj sprzedawcę na „${value}”`,
            reimbursableUpdate: (value: boolean) => `Zaktualizuj wydatek ${value ? 'podlegające zwrotowi' : 'bez zwrotu kosztów'}`,
            tagUpdate: (value: string) => `Zaktualizuj znacznik na „${value}”`,
            taxUpdate: (value: string) => `Zaktualizuj stawkę podatku na „${value}”`,
            billable: (value: boolean) => `wydatek ${value ? 'rozliczalny' : 'niepodlegające fakturowaniu'}`,
            category: (value: string) => `kategoria na „${value}”`,
            comment: (value: string) => `opis na „${value}”`,
            merchant: (value: string) => `sprzedawcę na „${value}”`,
            reimbursable: (value: boolean) => `wydatek ${value ? 'podlegające zwrotowi' : 'bez zwrotu kosztów'}`,
            tag: (value: string) => `oznacz jako „${value}”`,
            tax: (value: string) => `stawka podatku na „${value}”`,
            report: (value: string) => `dodaj do raportu o nazwie „${value}”`,
        },
        newRule: 'Nowa reguła',
        addRule: {
            title: 'Dodaj regułę',
            expenseContains: 'Jeśli wydatek zawiera:',
            applyUpdates: 'Następnie zastosuj te aktualizacje:',
            merchantHint: 'Wpisz . , aby utworzyć regułę, która będzie miała zastosowanie do wszystkich sprzedawców',
            addToReport: 'Dodaj do raportu o nazwie',
            createReport: 'Utwórz raport w razie potrzeby',
            applyToExistingExpenses: 'Zastosuj do pasujących istniejących wydatków',
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
            deleteSinglePrompt: 'Czy na pewno chcesz usunąć tę regułę?',
            deleteMultiplePrompt: 'Czy na pewno chcesz usunąć te reguły?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'Preferencje aplikacji',
        },
        testSection: {
            title: 'Preferencje testów',
            subtitle: 'Ustawienia pomocne przy debugowaniu i testowaniu aplikacji na środowisku staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Otrzymuj istotne aktualizacje funkcji i wiadomości od Expensify',
        muteAllSounds: 'Wycisz wszystkie dźwięki z Expensify',
    },
    priorityModePage: {
        priorityMode: 'Tryb priorytetowy',
        explainerText: 'Wybierz, czy #skupić się tylko na nieprzeczytanych i przypiętych czatach, czy wyświetlać wszystko, z najnowszymi i przypiętymi czatami na górze.',
        priorityModes: {
            default: {
                label: 'Najnowsze',
                description: 'Pokaż wszystkie czaty posortowane od najnowszych',
            },
            gsd: {
                label: '#skupienie',
                description: 'Pokaż tylko nieprzeczytane posortowane alfabetycznie',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `w ${policyName}`,
        generatingPDF: 'Wygeneruj PDF',
        waitForPDF: 'Poczekaj, aż wygenerujemy plik PDF.',
        errorPDF: 'Wystąpił błąd podczas próby wygenerowania Twojego pliku PDF',
        successPDF: 'Twój plik PDF został wygenerowany! Jeśli nie pobrał się automatycznie, użyj przycisku poniżej.',
    },
    reportDescriptionPage: {
        roomDescription: 'Opis pokoju',
        roomDescriptionOptional: 'Opis pokoju (opcjonalnie)',
        explainerText: 'Ustaw własny opis pokoju.',
    },
    groupChat: {
        lastMemberTitle: 'Uwaga!',
        lastMemberWarning: 'Ponieważ jesteś ostatnią osobą w tym czacie, wyjście spowoduje, że stanie się on niedostępny dla wszystkich członków. Czy na pewno chcesz opuścić czat?',
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
        terms: `<muted-text-xs>Logując się, wyrażasz zgodę na <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Prywatność</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Przekazy pieniężne są świadczone przez ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) na podstawie jego <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licencji</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Nie otrzymano magicznego kodu?',
        enterAuthenticatorCode: 'Wprowadź swój kod z aplikacji uwierzytelniającej',
        enterRecoveryCode: 'Wprowadź swój kod odzyskiwania',
        requiredWhen2FAEnabled: 'Wymagane, gdy włączone jest 2FA',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Poproś o nowy kod za <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Poproś o nowy kod',
        error: {
            pleaseFillMagicCode: 'Wprowadź swój magiczny kod',
            incorrectMagicCode: 'Nieprawidłowy lub niepoprawny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
            pleaseFillTwoFactorAuth: 'Wprowadź swój kod uwierzytelniania dwuskładnikowego',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Proszę wypełnić wszystkie pola',
        pleaseFillPassword: 'Wprowadź swoje hasło',
        pleaseFillTwoFactorAuth: 'Wprowadź swój kod dwuskładnikowy',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Wprowadź swój kod uwierzytelniania dwuskładnikowego, aby kontynuować',
        forgot: 'Zapomniałeś(-aś)?',
        requiredWhen2FAEnabled: 'Wymagane, gdy włączone jest 2FA',
        error: {
            incorrectPassword: 'Nieprawidłowe hasło. Spróbuj ponownie.',
            incorrectLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie.',
            incorrect2fa: 'Nieprawidłowy kod uwierzytelniania dwuskładnikowego. Spróbuj ponownie.',
            twoFactorAuthenticationEnabled: 'Masz włączone uwierzytelnianie dwuskładnikowe (2FA) na tym koncie. Zaloguj się, używając adresu e-mail lub numeru telefonu.',
            invalidLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie lub zresetuj swoje hasło.',
            unableToResetPassword:
                'Nie udało nam się zmienić Twojego hasła. Prawdopodobnie stało się tak z powodu wygasłego linku do resetowania hasła w starym e-mailu resetującym hasło. Wysłaliśmy Ci nowy link, abyś mógł/mogła spróbować ponownie. Sprawdź swoją skrzynkę odbiorczą i folder spamu; wiadomość powinna dotrzeć w ciągu kilku minut.',
            noAccess: 'Nie masz dostępu do tej aplikacji. Dodaj swoją nazwę użytkownika GitHub, aby uzyskać dostęp.',
            accountLocked: 'Twoje konto zostało zablokowane po zbyt wielu nieudanych próbach logowania. Spróbuj ponownie za 1 godzinę.',
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
        notYou: ({user}: NotYouParams) => `To nie ${user}?`,
    },
    onboarding: {
        welcome: 'Witamy!',
        welcomeSignOffTitleManageTeam: 'Gdy ukończysz powyższe zadania, będziemy mogli poznać więcej funkcji, takich jak przepływy akceptacji i reguły!',
        welcomeSignOffTitle: 'Miło cię poznać!',
        explanationModal: {
            title: 'Witamy w Expensify',
            description: 'Jedna aplikacja do obsługi firmowych i prywatnych wydatków w tempie czatu. Wypróbuj ją i daj nam znać, co o niej myślisz. To dopiero początek!',
            secondaryDescription: 'Aby wrócić do Expensify Classic, po prostu stuknij swoje zdjęcie profilowe > Przejdź do Expensify Classic.',
        },
        getStarted: 'Rozpocznij',
        whatsYourName: 'Jak masz na imię?',
        peopleYouMayKnow: 'Osoby, które możesz znać, są już tutaj! Zweryfikuj swój e-mail, aby do nich dołączyć.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Ktoś z domeny ${domain} utworzył już przestrzeń roboczą. Wprowadź magiczny kod wysłany na adres ${email}.`,
        joinAWorkspace: 'Dołącz do przestrzeni roboczej',
        listOfWorkspaces: 'Oto lista przestrzeni roboczych, do których możesz dołączyć. Nie martw się, zawsze możesz dołączyć do nich później, jeśli wolisz.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} członek${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Gdzie pracujesz?',
        errorSelection: 'Wybierz opcję, aby przejść dalej',
        purpose: {
            title: 'Co chcesz dzisiaj zrobić?',
            errorContinue: 'Naciśnij „Kontynuuj”, aby się skonfigurować',
            errorBackButton: 'Dokończ pytania konfiguracyjne, aby zacząć korzystać z aplikacji',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Otrzymuj zwrot od pracodawcy',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Zarządzaj wydatkami mojego zespołu',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Śledź i planuj wydatki',
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
            title: 'Jakie funkcje Cię interesują?',
            featuresAlreadyEnabled: 'Oto nasze najpopularniejsze funkcje:',
            featureYouMayBeInterestedIn: 'Włącz dodatkowe funkcje:',
        },
        error: {
            requiredFirstName: 'Podaj swoje imię, aby kontynuować',
        },
        workEmail: {
            title: 'Jaki jest Twój służbowy adres e-mail?',
            subtitle: 'Expensify działa najlepiej, gdy podłączysz swój służbowy adres e‑mail.',
            explanationModal: {
                descriptionOne: 'Przekaż na adres receipts@expensify.com do zeskanowania',
                descriptionTwo: 'Dołącz do swoich współpracowników, którzy już korzystają z Expensify',
                descriptionThree: 'Ciesz się bardziej spersonalizowanym doświadczeniem',
            },
            addWorkEmail: 'Dodaj służbowy e‑mail',
        },
        workEmailValidation: {
            title: 'Zweryfikuj służbowy adres e-mail',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Wprowadź magiczny kod wysłany na adres ${workEmail}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        },
        workEmailValidationError: {
            publicEmail: 'Wpisz poprawny służbowy adres e‑mail z prywatnej domeny, np. mitch@company.com',
            offline: 'Nie mogliśmy dodać Twojego służbowego adresu e‑mail, ponieważ wydajesz się być offline',
        },
        mergeBlockScreen: {
            title: 'Nie udało się dodać służbowego adresu e-mail',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nie udało się dodać ${workEmail}. Spróbuj ponownie później w Ustawieniach lub porozmawiaj z Concierge, aby uzyskać pomoc.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Zrób [jazdę próbną](${testDriveURL})`,
                description: ({testDriveURL}) => `[Weź krótką wycieczkę po produkcie](${testDriveURL}), aby zobaczyć, dlaczego Expensify jest najszybszym sposobem rozliczania wydatków.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Zrób [jazdę próbną](${testDriveURL})`,
                description: ({testDriveURL}) => `Wypróbuj nas w ramach [jazdy próbnej](${testDriveURL}) i zapewnij swojemu zespołowi *3 miesiące Expensify za darmo!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Dodaj zatwierdzanie wydatków',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Dodaj akceptacje wydatków*, aby przeglądać wydatki swojego zespołu i trzymać je pod kontrolą.

                        Oto jak to zrobić:

                        1. Przejdź do *Przestrzenie robocze*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Więcej funkcji*.
                        4. Włącz *Workflowy*.
                        5. Przejdź do *Workflowy* w edytorze przestrzeni roboczej.
                        6. Włącz *Akceptacje*.
                        7. Zostaniesz ustawiony jako akceptujący wydatki. Możesz zmienić tę osobę na dowolnego administratora po zaproszeniu zespołu.

                        [Przejdź do dodatkowych funkcji](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Utwórz](${workspaceConfirmationLink}) przestrzeń roboczą`,
                description: 'Utwórz przestrzeń roboczą i skonfiguruj ustawienia z pomocą swojego specjalisty ds. konfiguracji!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Utwórz [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Utwórz workspace*, aby śledzić wydatki, skanować paragony, czatować i nie tylko.

                        1. Kliknij *Workspaces* > *New workspace*.

                        *Twój nowy workspace jest gotowy!* [Zobacz go](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Skonfiguruj [kategorie](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Skonfiguruj kategorie*, aby Twój zespół mógł kategoryzować wydatki dla łatwiejszego raportowania.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoje środowisko pracy.
                        3. Kliknij *Categories*.
                        4. Wyłącz wszystkie kategorie, których nie potrzebujesz.
                        5. Dodaj własne kategorie w prawym górnym rogu.

                        [Przejdź do ustawień kategorii w środowisku pracy](${workspaceCategoriesLink}).

                        ![Skonfiguruj kategorie](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Wyślij wydatek',
                description: dedent(`
                    *Zgłoś wydatek*, wprowadzając kwotę lub skanując paragon.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz wydatek*.
                    3. Wprowadź kwotę lub zeskanuj paragon.
                    4. Dodaj adres e-mail lub numer telefonu swojego przełożonego.
                    5. Kliknij *Utwórz*.

                    I gotowe!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Wyślij wydatek',
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
                    *Śledź wydatek* w dowolnej walucie, niezależnie od tego, czy masz paragon, czy nie.

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
                        2. Wybierz swoją przestrzeń roboczą.
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
                title: ({corporateCardLink}) => `Połącz [swoje karty firmowe](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Podłącz karty, które już masz, aby automatycznie importować transakcje, dopasowywać paragony i uzgadniać wydatki.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Company cards*.
                        4. Postępuj zgodnie z instrukcjami, aby podłączyć swoje karty.

                        [Przejdź do kart firmowych](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Zaproś [swój zespół](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Zaproś swój zespół* do Expensify, aby mógł zacząć śledzić wydatki już dziś.

                        1. Kliknij *Workspace*.
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
                        *Skonfiguruj kategorie i tagi*, aby Twój zespół mógł oznaczać wydatki dla łatwego raportowania.

                        Zaimportuj je automatycznie, [łącząc swój program księgowy](${workspaceAccountingLink}), lub skonfiguruj je ręcznie w [ustawieniach przestrzeni roboczej](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Skonfiguruj [tagi](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Użyj tagów, aby dodać dodatkowe szczegóły wydatków, takie jak projekty, klienci, lokalizacje i działy. Jeśli potrzebujesz wielu poziomów tagów, możesz uaktualnić do planu Control.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swój workspace.
                        3. Kliknij *More features*.
                        4. Włącz *Tags*.
                        5. Przejdź do *Tags* w edytorze workspace’u.
                        6. Kliknij *+ Add tag*, aby utworzyć własny.

                        [Przejdź do dodatkowych funkcji](${workspaceMoreFeaturesLink}).

                        ![Skonfiguruj tagi](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Zaproś swojego [księgowego](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Zaproś swoją księgową / swojego księgowego* do współpracy w przestrzeni roboczej i zarządzania wydatkami firmowymi.

                        1. Kliknij *Przestrzenie robocze*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Członkowie*.
                        4. Kliknij *Zaproś członka*.
                        5. Wpisz adres e-mail swojej księgowej / swojego księgowego.

                        [Zaproś swoją księgową / swojego księgowego teraz](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Rozpocznij czat',
                description: dedent(`
                    *Rozpocznij czat* z dowolną osobą, używając jej adresu e-mail lub numeru telefonu.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Rozpocznij czat*.
                    3. Wpisz adres e-mail lub numer telefonu.

                    Jeśli nie korzystają jeszcze z Expensify, zaproszenie zostanie wysłane automatycznie.

                    Każdy czat zostanie też wysłany jako e-mail lub SMS, na który mogą odpowiedzieć bezpośrednio.
                `),
            },
            splitExpenseTask: {
                title: 'Podziel wydatki',
                description: dedent(`
                    *Podziel wydatki* z jedną lub większą liczbą osób.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Rozpocznij czat*.
                    3. Wpisz adresy e‑mail lub numery telefonów.
                    4. Kliknij szary przycisk *+* na czacie > *Podziel wydatek*.
                    5. Utwórz wydatek, wybierając *Ręcznie*, *Skanuj* lub *Dystans*.

                    Możesz dodać więcej szczegółów, jeśli chcesz, albo po prostu go wyślij. Odzyskaj swoje pieniądze!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Sprawdź swoje [ustawienia przestrzeni roboczej](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Oto jak przejrzeć i zaktualizować ustawienia swojego przestrzeni roboczej:
                        1. Kliknij Przestrzenie robocze.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Przejrzyj i zaktualizuj ustawienia.
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
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Zrób [jazdę próbną](${testDriveURL})` : 'Wypróbuj wersję testową'),
            embeddedDemoIframeTitle: 'Jazda próbna',
            employeeFakeReceipt: {
                description: 'Mój paragon za jazdę próbną!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Otrzymanie zwrotu jest tak proste jak wysłanie wiadomości. Omówmy podstawy.',
            onboardingPersonalSpendMessage: 'Oto jak w kilku kliknięciach śledzić swoje wydatki.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Twój bezpłatny okres próbny właśnie się rozpoczął! Skonfigurujmy wszystko.
                        👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Utworzyłem już przestrzeń roboczą, aby pomóc w zarządzaniu paragonami i wydatkami Twojego zespołu. Aby jak najlepiej wykorzystać 30-dniowy bezpłatny okres próbny, po prostu wykonaj poniższe pozostałe kroki konfiguracji!
                    `)
                    : dedent(`
                        # Twój bezpłatny okres próbny właśnie się rozpoczął! Skonfigurujmy wszystko.
                        👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Skoro utworzyłeś(-aś) już przestrzeń roboczą, wykorzystaj w pełni swój 30-dniowy bezpłatny okres próbny, wykonując poniższe kroki!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Skonfigurujmy wszystko\n👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Utworzyłem już przestrzeń roboczą, aby pomóc Ci zarządzać paragonami i wydatkami. Aby jak najlepiej wykorzystać 30-dniowy bezpłatny okres próbny, po prostu wykonaj pozostałe kroki konfiguracji poniżej!',
            onboardingChatSplitMessage: 'Dziel się rachunkami ze znajomymi tak łatwo, jak wysyłasz wiadomość. Oto jak to działa.',
            onboardingAdminMessage: 'Dowiedz się, jak zarządzać przestrzenią roboczą swojego zespołu jako administrator i rozliczać własne wydatki.',
            onboardingLookingAroundMessage:
                'Expensify jest najbardziej znane z obsługi wydatków, podróży i kart firmowych, ale robimy o wiele więcej. Daj znać, czym jesteś zainteresowany/zainteresowana, a pomogę Ci zacząć.',
            onboardingTestDriveReceiverMessage: '*Masz 3 miesiące za darmo! Zacznij poniżej.*',
        },
        workspace: {
            title: 'Zachowaj porządek dzięki przestrzeni roboczej',
            subtitle: 'Odblokuj zaawansowane narzędzia, które uproszczą zarządzanie wydatkami — wszystko w jednym miejscu. Dzięki przestrzeni roboczej możesz:',
            explanationModal: {
                descriptionOne: 'Śledź i porządkuj paragony',
                descriptionTwo: 'Kategoryzuj i taguj wydatki',
                descriptionThree: 'Twórz i udostępniaj raporty',
            },
            price: 'Wypróbuj za darmo przez 30 dni, a potem przejdź na wyższy plan za jedyne <strong>5 USD/użytkownika/miesiąc</strong>.',
            createWorkspace: 'Utwórz przestrzeń roboczą',
        },
        confirmWorkspace: {
            title: 'Potwierdź przestrzeń roboczą',
            subtitle: 'Utwórz przestrzeń roboczą, aby śledzić paragony, rozliczać wydatki, zarządzać podróżami, tworzyć raporty i więcej — wszystko z szybkością czatu.',
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
        enterLegalName: 'Jak brzmi Twoje oficjalne imię i nazwisko?',
        enterDateOfBirth: 'Jaka jest twoja data urodzenia?',
        enterAddress: 'Jaki jest twój adres?',
        enterPhoneNumber: 'Jaki jest Twój numer telefonu?',
        personalDetails: 'Dane osobiste',
        privateDataMessage: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane w Twoim publicznym profilu.',
        legalName: 'Imię i nazwisko (pełne)',
        legalFirstName: 'Imię (zgodnie z dokumentem tożsamości)',
        legalLastName: 'Nazwisko zgodne z dokumentami',
        address: 'Adres',
        error: {
            dateShouldBeBefore: (dateString: string) => `Data powinna być wcześniejsza niż ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `Data powinna być po ${dateString}`,
            hasInvalidCharacter: 'Nazwa może zawierać tylko znaki łacińskie',
            incorrectZipFormat: (zipFormat?: string) => `Nieprawidłowy format kodu pocztowego${zipFormat ? `Akceptowalny format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Upewnij się, że numer telefonu jest prawidłowy (np. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link został wysłany ponownie',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Wysłałem(-am) magiczny link logowania na adres ${login}. Sprawdź swój ${loginType}, aby się zalogować.`,
        resendLink: 'Wyślij ponownie link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) => `Aby zweryfikować ${secondaryLogin}, wyślij ponownie magiczny kod z Ustawień konta ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Jeśli nie masz już dostępu do ${primaryLogin}, odłącz swoje konta.`,
        unlink: 'Odłącz',
        linkSent: 'Link wysłany!',
        successfullyUnlinkedLogin: 'Dodatkowe logowanie zostało pomyślnie odłączone!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Nasz dostawca poczty tymczasowo wstrzymał wysyłanie e-maili na adres ${login} z powodu problemów z dostarczaniem. Aby odblokować swój login, wykonaj następujące kroki:`,
        confirmThat: (login: string) =>
            `<strong>Potwierdź, że ${login} jest wpisany poprawnie i jest prawdziwym, dostarczalnym adresem e‑mail.</strong> Alias taki jak „expenses@domain.com” musi mieć dostęp do własnej skrzynki odbiorczej, aby był ważnym loginem do Expensify.`,
        ensureYourEmailClient: `<strong>Upewnij się, że Twój klient poczty e-mail akceptuje wiadomości z domeny expensify.com.</strong> Instrukcje, jak wykonać ten krok, znajdziesz <a href="${CONST.SET_NOTIFICATION_LINK}">tutaj</a>, ale możesz potrzebować pomocy działu IT przy konfiguracji ustawień poczty.`,
        onceTheAbove: `Po wykonaniu powyższych kroków skontaktuj się z <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, aby odblokować swoje logowanie.`,
    },
    openAppFailureModal: {
        title: 'Coś poszło nie tak...',
        subtitle: `Nie udało nam się wczytać wszystkich Twoich danych. Zostaliśmy o tym powiadomieni i sprawdzamy problem. Jeśli będzie się powtarzał, skontaktuj się z`,
        refreshAndTryAgain: 'Odśwież i spróbuj ponownie',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nie mogliśmy dostarczyć wiadomości SMS na numer ${login}, więc tymczasowo go zawiesiliśmy. Spróbuj zweryfikować swój numer:`,
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
                return 'Poczekaj chwilę przed ponowną próbą.';
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
            return `Chwileczkę! Musisz odczekać ${timeText}, zanim spróbujesz ponownie zweryfikować swój numer.`;
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
        title: 'Witamy w trybie #focus!',
        prompt: (priorityModePageUrl: string) =>
            `Miej wszystko pod kontrolą, wyświetlając tylko nieprzeczytane czaty lub czaty wymagające Twojej uwagi. Nie martw się, możesz to zmienić w dowolnym momencie w <a href="${priorityModePageUrl}">ustawieniach</a>.`,
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
        subtitle: 'Nie można było ukończyć Twojego żądania. Spróbuj ponownie później.',
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
            custom: 'Niestandardowe',
        },
        untilTomorrow: 'Do jutra',
        untilTime: ({time}: UntilTimeParams) => `Do ${time}`,
        date: 'Data',
        time: 'Czas',
        clearAfter: 'Wyczyść po',
        whenClearStatus: 'Kiedy powinniśmy wyczyścić Twój status?',
        vacationDelegate: 'Zastępca urlopowy',
        setVacationDelegate: `Ustaw zastępcę na czas urlopu, aby zatwierdzał raporty w Twoim imieniu, gdy jesteś poza biurem.`,
        vacationDelegateError: 'Wystąpił błąd podczas aktualizowania Twojego zastępcy urlopowego.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `jako osoba zastępująca ${nameOrEmail} podczas urlopu`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `do ${submittedToName} jako zastępca urlopowy dla ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Przydzielasz ${nameOrEmail} jako osobę zastępującą Cię podczas urlopu. Nie jest ona jeszcze we wszystkich Twoich przestrzeniach roboczych. Jeśli zdecydujesz się kontynuować, do wszystkich administratorów Twoich przestrzeni roboczych zostanie wysłany e-mail z prośbą o dodanie jej.`,
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
        accountEnding: 'Konto kończące się na',
        thisBankAccount: 'To konto bankowe będzie używane do płatności firmowych w Twoim obszarze roboczym',
        accountNumber: 'Numer konta',
        routingNumber: 'Numer rozliczeniowy',
        chooseAnAccountBelow: 'Wybierz konto poniżej',
        addBankAccount: 'Dodaj konto bankowe',
        chooseAnAccount: 'Wybierz konto',
        connectOnlineWithPlaid: 'Zaloguj się do swojego banku',
        connectManually: 'Połącz ręcznie',
        desktopConnection: 'Uwaga: aby połączyć się z Chase, Wells Fargo, Capital One lub Bank of America, kliknij tutaj, aby zakończyć ten proces w przeglądarce.',
        yourDataIsSecure: 'Twoje dane są bezpieczne',
        toGetStarted: 'Dodaj konto bankowe, aby zwracać wydatki, wydawać karty Expensify, pobierać płatności za faktury i opłacać rachunki — wszystko w jednym miejscu.',
        plaidBodyCopy: 'Daj pracownikom łatwiejszy sposób płacenia – i otrzymywania zwrotów – za wydatki firmowe.',
        checkHelpLine: 'Numer rozliczeniowy i numer rachunku znajdziesz na czeku powiązanym z tym kontem.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Aby połączyć konto bankowe, <a href="${contactMethodRoute}">dodaj adres e‑mail jako swój główny login</a> i spróbuj ponownie. Numer telefonu możesz dodać jako login dodatkowy.`,
        hasBeenThrottledError: 'Wystąpił błąd podczas dodawania Twojego konta bankowego. Poczekaj kilka minut i spróbuj ponownie.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Wygląda na to, że waluta Twojego przestrzeni roboczej jest inna niż USD. Aby kontynuować, przejdź do <a href="${workspaceRoute}">ustawień swojej przestrzeni roboczej</a>, ustaw ją na USD i spróbuj ponownie.`,
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
            email: 'Wpisz prawidłowy adres e‑mail',
            companyName: 'Wprowadź prawidłową nazwę firmy',
            addressCity: 'Wpisz prawidłowe miasto',
            addressStreet: 'Wprowadź prawidłowy adres ulicy',
            addressState: 'Wybierz prawidłowy stan',
            incorporationDateFuture: 'Data rejestracji nie może być w przyszłości',
            incorporationState: 'Wybierz prawidłowy stan',
            industryCode: 'Wprowadź prawidłowy sześciocyfrowy kod klasyfikacji branży',
            restrictedBusiness: 'Potwierdź, że firma nie znajduje się na liście działalności objętych ograniczeniami',
            routingNumber: 'Wprowadź prawidłowy numer rozliczeniowy',
            accountNumber: 'Wprowadź prawidłowy numer konta',
            routingAndAccountNumberCannotBeSame: 'Numer rozliczeniowy i numer konta nie mogą być takie same',
            companyType: 'Wybierz prawidłowy typ firmy',
            tooManyAttempts: 'Ze względu na dużą liczbę prób logowania ta opcja została wyłączona na 24 godziny. Spróbuj ponownie później lub wprowadź dane ręcznie.',
            address: 'Wprowadź prawidłowy adres',
            dob: 'Wybierz prawidłową datę urodzenia',
            age: 'Musisz mieć ukończone 18 lat',
            ssnLast4: 'Wprowadź prawidłowe ostatnie 4 cyfry numeru SSN',
            firstName: 'Wprowadź poprawne imię',
            lastName: 'Wprowadź poprawne nazwisko',
            noDefaultDepositAccountOrDebitCardAvailable: 'Dodaj domyślne konto depozytowe lub kartę debetową',
            validationAmounts: 'Wprowadzone kwoty weryfikacyjne są nieprawidłowe. Sprawdź wyciąg bankowy i spróbuj ponownie.',
            fullName: 'Wpisz prawidłowe imię i nazwisko',
            ownershipPercentage: 'Wprowadź prawidłową liczbę procentową',
            deletePaymentBankAccount:
                'To konto bankowe nie może zostać usunięte, ponieważ jest używane do płatności kartą Expensify. Jeśli mimo to chcesz usunąć to konto, skontaktuj się z Concierge.',
            sameDepositAndWithdrawalAccount: 'Konta wpłat i wypłat są takie same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Gdzie znajduje się Twoje konto bankowe?',
        accountDetailsStepHeader: 'Jakie są szczegóły Twojego konta?',
        accountTypeStepHeader: 'Jakiego typu jest to konto?',
        bankInformationStepHeader: 'Jakie są dane Twojego konta bankowego?',
        accountHolderInformationStepHeader: 'Jakie są dane właściciela konta?',
        howDoWeProtectYourData: 'Jak chronimy Twoje dane?',
        currencyHeader: 'Jaka jest waluta Twojego konta bankowego?',
        confirmationStepHeader: 'Sprawdź swoje dane.',
        confirmationStepSubHeader: 'Sprawdź poniższe szczegóły i zaznacz pole z warunkami, aby potwierdzić.',
        toGetStarted: 'Dodaj osobiste konto bankowe, aby otrzymywać zwroty wydatków, opłacać faktury lub włączyć Portfel Expensify.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Wpisz hasło do Expensify',
        alreadyAdded: 'To konto zostało już dodane.',
        chooseAccountLabel: 'Konto',
        successTitle: 'Dodano osobiste konto bankowe!',
        successMessage: 'Gratulacje, Twoje konto bankowe zostało skonfigurowane i jest gotowe do otrzymywania zwrotów.',
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
        errorMessageInvalidPhone: `Wprowadź prawidłowy numer telefonu bez nawiasów i myślników. Jeśli jesteś poza USA, dodaj kod kraju (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Nieprawidłowy adres e-mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest już członkiem ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest już administratorem ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Kontynuując wniosek o aktywację portfela Expensify, potwierdzasz, że zapoznałeś(-aś) się, rozumiesz i akceptujesz',
        facialScan: 'Zasady skanów twarzy i zgoda Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Polityka skanowania twarzy i zgoda Onfido</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Prywatność</a> oraz <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Warunki korzystania z usługi</a>.</muted-text-micro>`,
        tryAgain: 'Spróbuj ponownie',
        verifyIdentity: 'Zweryfikuj tożsamość',
        letsVerifyIdentity: 'Zweryfikujmy Twoją tożsamość',
        butFirst: `Ale najpierw trochę nudnych rzeczy. Przeczytaj prawniczy żargon w następnym kroku i kliknij „Akceptuj”, gdy będziesz gotowy(-a).`,
        genericError: 'Wystąpił błąd podczas przetwarzania tego kroku. Spróbuj ponownie.',
        cameraPermissionsNotGranted: 'Włącz dostęp do aparatu',
        cameraRequestMessage: 'Potrzebujemy dostępu do aparatu, aby zakończyć weryfikację konta bankowego. Proszę włączyć go w Ustawienia > New Expensify.',
        microphonePermissionsNotGranted: 'Włącz dostęp do mikrofonu',
        microphoneRequestMessage: 'Potrzebujemy dostępu do Twojego mikrofonu, aby dokończyć weryfikację konta bankowego. Włącz go w Ustawienia > New Expensify.',
        originalDocumentNeeded: 'Prześlij oryginalne zdjęcie swojego dokumentu tożsamości zamiast zrzutu ekranu lub zeskanowanego obrazu.',
        documentNeedsBetterQuality:
            'Wygląda na to, że Twój dokument tożsamości jest uszkodzony lub brakuje mu niektórych zabezpieczeń. Prześlij proszę oryginalne zdjęcie nieuszkodzonego dokumentu, który jest w pełni widoczny.',
        imageNeedsBetterQuality: 'Wystąpił problem z jakością zdjęcia Twojego dokumentu tożsamości. Prześlij nowe zdjęcie, na którym cały dokument będzie wyraźnie widoczny.',
        selfieIssue: 'Wystąpił problem z Twoim selfie/wideo. Prześlij proszę aktualne selfie/wideo.',
        selfieNotMatching: 'Twoje selfie/wideo nie pasuje do Twojego dokumentu tożsamości. Prześlij nowe selfie/wideo, na którym Twoja twarz jest wyraźnie widoczna.',
        selfieNotLive: 'Twoje selfie/wideo nie wygląda na wykonane na żywo. Prześlij proszę selfie/wideo zrobione na żywo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dodatkowe szczegóły',
        helpText: 'Musimy potwierdzić następujące informacje, zanim będziesz mógł wysyłać i otrzymywać pieniądze ze swojego portfela.',
        helpTextIdologyQuestions: 'Musimy zadać Ci jeszcze kilka pytań, aby dokończyć weryfikację Twojej tożsamości.',
        helpLink: 'Dowiedz się więcej, dlaczego tego potrzebujemy.',
        legalFirstNameLabel: 'Imię (zgodnie z dokumentem tożsamości)',
        legalMiddleNameLabel: 'Drugie imię (zgodnie z dokumentami)',
        legalLastNameLabel: 'Nazwisko zgodne z dokumentami',
        selectAnswer: 'Wybierz odpowiedź, aby kontynuować',
        ssnFull9Error: 'Wprowadź prawidłowy dziewięciocyfrowy numer SSN',
        needSSNFull9: 'Mamy problem ze zweryfikowaniem Twojego numeru SSN. Wprowadź pełne dziewięć cyfr swojego numeru SSN.',
        weCouldNotVerify: 'Nie udało nam się zweryfikować',
        pleaseFixIt: 'Popraw te informacje przed kontynuowaniem',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Nie udało się potwierdzić Twojej tożsamości. Spróbuj ponownie później lub skontaktuj się z <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, jeśli masz jakiekolwiek pytania.`,
    },
    termsStep: {
        headerTitle: 'Warunki i opłaty',
        headerTitleRefactor: 'Opłaty i warunki',
        haveReadAndAgreePlain: 'Przeczytałem(-am) i zgadzam się na otrzymywanie ujawnień w formie elektronicznej.',
        haveReadAndAgree: `Przeczytałem(-am) i wyrażam zgodę na otrzymywanie <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronicznych powiadomień</a>.`,
        agreeToThePlain: 'Zgadzam się na Politykę prywatności i warunki portfela.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Zgadzam się z <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">polityką prywatności</a> oraz <a href="${walletAgreementUrl}">warunkami korzystania z portfela</a>.`,
        enablePayments: 'Włącz płatności',
        monthlyFee: 'Miesięczna opłata',
        inactivity: 'Brak aktywności',
        noOverdraftOrCredit: 'Brak możliwości debetu/kredytu.',
        electronicFundsWithdrawal: 'Elektroniczne wypłaty środków',
        standard: 'Standard',
        reviewTheFees: 'Sprawdź kilka opłat.',
        checkTheBoxes: 'Zaznacz pola poniżej.',
        agreeToTerms: 'Zaakceptuj warunki i wszystko będzie gotowe!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Portfel Expensify jest wydawany przez ${walletProgram}.`,
            perPurchase: 'Za zakup',
            atmWithdrawal: 'Wypłata z bankomatu',
            cashReload: 'Doładowanie gotówką',
            inNetwork: 'w sieci',
            outOfNetwork: 'poza siecią',
            atmBalanceInquiry: 'Sprawdzenie salda w bankomacie (w sieci lub poza siecią)',
            customerService: 'Obsługa klienta (zautomatyzowana lub z konsultantem na żywo)',
            inactivityAfterTwelveMonths: 'Nieaktywność (po 12 miesiącach bez transakcji)',
            weChargeOneFee: 'Pobieramy 1 inny rodzaj opłaty. Jest to:',
            fdicInsurance: 'Twoje środki kwalifikują się do ubezpieczenia FDIC.',
            generalInfo: `Aby uzyskać ogólne informacje o kontach przedpłaconych, odwiedź <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Aby zapoznać się ze szczegółami i warunkami wszystkich opłat i usług, odwiedź stronę <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> lub zadzwoń pod numer +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektroniczne wycofanie środków (natychmiastowe)',
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
            sendingFundsDetails: 'Nie ma opłat za wysyłanie środków do innego posiadacza konta przy użyciu salda, konta bankowego lub karty debetowej.',
            electronicFundsStandardDetails:
                'Przelew środków z portfela Expensify na konto bankowe przy użyciu standardowej opcji jest bezpłatny. Taki przelew zazwyczaj realizowany jest w ciągu 1–3 dni roboczych.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Przy natychmiastowym przelewie środków z Twojego Portfela Expensify na powiązaną kartę debetową pobierana jest opłata. Ten przelew zazwyczaj zostaje zrealizowany w ciągu kilku minut.' +
                `Opłata wynosi ${percentage}% kwoty przelewu (przy minimalnej opłacie ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Twoje środki kwalifikują się do objęcia ubezpieczeniem FDIC. Twoje środki będą przechowywane w lub przenoszone do ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, instytucji ubezpieczonej przez FDIC.` +
                `Gdy już tam trafią, Twoje środki są ubezpieczone przez FDIC do kwoty ${amount} na wypadek upadłości ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, jeśli spełnione są określone wymogi dotyczące ubezpieczenia depozytów i Twoja karta jest zarejestrowana. Szczegóły znajdziesz w ${CONST.TERMS.FDIC_PREPAID}.`,
            contactExpensifyPayments: `Skontaktuj się z ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}, dzwoniąc pod numer +1 833-400-0904, wysyłając e-mail na adres ${CONST.EMAIL.CONCIERGE} lub logując się na ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Aby uzyskać ogólne informacje na temat kont przedpłaconych, odwiedź ${CONST.TERMS.CFPB_PREPAID}. Jeśli masz skargę dotyczącą konta przedpłaconego, zadzwoń do Biura Ochrony Finansowej Konsumentów pod numer 1-855-411-2372 lub odwiedź ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Wyświetl wersję przyjazną dla drukarki',
            automated: 'Zautomatyzowane',
            liveAgent: 'Agent na żywo',
            instant: 'Natychmiast',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Włącz płatności',
        activatedTitle: 'Portfel aktywowany!',
        activatedMessage: 'Gratulacje, Twój portfel jest skonfigurowany i gotowy do wykonywania płatności.',
        checkBackLaterTitle: 'Chwileczkę…',
        checkBackLaterMessage: 'Wciąż sprawdzamy Twoje informacje. Sprawdź ponownie później.',
        continueToPayment: 'Przejdź do płatności',
        continueToTransfer: 'Kontynuuj transfer',
    },
    companyStep: {
        headerTitle: 'Informacje o firmie',
        subtitle: 'Prawie gotowe! Ze względów bezpieczeństwa musimy potwierdzić kilka informacji:',
        legalBusinessName: 'Prawna nazwa firmy',
        companyWebsite: 'Strona internetowa firmy',
        taxIDNumber: 'Numer identyfikacji podatkowej',
        taxIDNumberPlaceholder: '9 cyfr',
        companyType: 'Typ firmy',
        incorporationDate: 'Data rejestracji firmy',
        incorporationState: 'Stan rejestracji firmy',
        industryClassificationCode: 'Kod klasyfikacji branżowej',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        incorporationDatePlaceholder: 'Data początkowa (rrrr-mm-dd)',
        incorporationTypes: {
            LLC: 'spółka z o.o.',
            CORPORATION: 'Firma corp.',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Spółdzielnia',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        industryClassification: 'W jakiej branży sklasyfikowana jest firma?',
        industryClassificationCodePlaceholder: 'Wyszukaj kod klasyfikacji branżowej',
    },
    requestorStep: {
        headerTitle: 'Dane osobowe',
        learnMore: 'Dowiedz się więcej',
        isMyDataSafe: 'Czy moje dane są bezpieczne?',
    },
    personalInfoStep: {
        personalInfo: 'Dane osobowe',
        enterYourLegalFirstAndLast: 'Jak brzmi Twoje oficjalne imię i nazwisko?',
        legalFirstName: 'Imię (zgodnie z dokumentem tożsamości)',
        legalLastName: 'Nazwisko zgodne z dokumentami',
        legalName: 'Imię i nazwisko (pełne)',
        enterYourDateOfBirth: 'Jaka jest twoja data urodzenia?',
        enterTheLast4: 'Jakie są ostatnie cztery cyfry Twojego numeru Social Security?',
        dontWorry: 'Spokojnie, nie przeprowadzamy żadnych osobistych kontroli kredytowych!',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        enterYourAddress: 'Jaki jest twój adres?',
        address: 'Adres',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś(-aś), rozumiesz i akceptujesz',
        whatsYourLegalName: 'Jak brzmi twoje imię i nazwisko zgodnie z dokumentami?',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatsYourSSN: 'Jakie są ostatnie cztery cyfry Twojego numeru Social Security?',
        noPersonalChecks: 'Spokojnie, tu nie sprawdzamy Twojej historii kredytowej!',
        whatsYourPhoneNumber: 'Jaki jest Twój numer telefonu?',
        weNeedThisToVerify: 'Potrzebujemy tego, aby zweryfikować Twój portfel.',
    },
    businessInfoStep: {
        businessInfo: 'Informacje o firmie',
        enterTheNameOfYourBusiness: 'Jak nazywa się Twoja firma?',
        businessName: 'Prawna nazwa firmy',
        enterYourCompanyTaxIdNumber: 'Jaki jest numer identyfikacji podatkowej Twojej firmy?',
        taxIDNumber: 'Numer identyfikacji podatkowej',
        taxIDNumberPlaceholder: '9 cyfr',
        enterYourCompanyWebsite: 'Jaka jest strona internetowa Twojej firmy?',
        companyWebsite: 'Strona internetowa firmy',
        enterYourCompanyPhoneNumber: 'J jaki jest numer telefonu Twojej firmy?',
        enterYourCompanyAddress: 'Jaki jest adres Twojej firmy?',
        selectYourCompanyType: 'Jakiego rodzaju jest to firma?',
        companyType: 'Typ firmy',
        incorporationType: {
            LLC: 'spółka z o.o.',
            CORPORATION: 'Firma corp.',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Spółdzielnia',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        selectYourCompanyIncorporationDate: 'Jaka jest data rejestracji Twojej firmy?',
        incorporationDate: 'Data rejestracji firmy',
        incorporationDatePlaceholder: 'Data początkowa (rrrr-mm-dd)',
        incorporationState: 'Stan rejestracji firmy',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'W którym stanie została zarejestrowana Twoja firma?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        companyAddress: 'Adres firmy',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        businessInfoTitle: 'Informacje o firmie',
        legalBusinessName: 'Prawna nazwa firmy',
        whatsTheBusinessName: 'Jak nazywa się firma?',
        whatsTheBusinessAddress: 'Jaki jest adres firmy?',
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
                    return 'Czym jest numer identyfikacyjny firmy (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Jaki jest numer rejestracyjny VAT (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Czym jest australijski numer biznesowy (ABN)?';
                default:
                    return 'Jaki jest numer VAT UE?';
            }
        },
        whatsThisNumber: 'Co to za liczba?',
        whereWasTheBusinessIncorporated: 'Gdzie została zarejestrowana firma?',
        whatTypeOfBusinessIsIt: 'Jaki to rodzaj działalności?',
        whatsTheBusinessAnnualPayment: 'Jaki jest roczny wolumen płatności firmy?',
        whatsYourExpectedAverageReimbursements: 'Jaka jest oczekiwana średnia kwota zwrotu?',
        registrationNumber: 'Numer rejestracyjny',
        taxIDEIN: (country: string) => {
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
        businessAddress: 'Adres firmy',
        businessType: 'Rodzaj działalności',
        incorporation: 'Rejestracja firmy',
        incorporationCountry: 'Kraj rejestracji spółki',
        incorporationTypeName: 'Rodzaj formy prawnej',
        businessCategory: 'Kategoria firmowa',
        annualPaymentVolume: 'Roczna wartość płatności',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Roczna wartość płatności w ${currencyCode}`,
        averageReimbursementAmount: 'Średnia kwota zwrotu',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Średnia kwota zwrotu w ${currencyCode}`,
        selectIncorporationType: 'Wybierz typ formy prawnej firmy',
        selectBusinessCategory: 'Wybierz kategorię firmy',
        selectAnnualPaymentVolume: 'Wybierz roczną wartość płatności',
        selectIncorporationCountry: 'Wybierz kraj rejestracji firmy',
        selectIncorporationState: 'Wybierz stan rejestracji',
        selectAverageReimbursement: 'Wybierz średnią kwotę zwrotu',
        selectBusinessType: 'Wybierz typ działalności',
        findIncorporationType: 'Znajdź rodzaj rejestracji',
        findBusinessCategory: 'Znajdź kategorię firmową',
        findAnnualPaymentVolume: 'Znajdź roczny wolumen płatności',
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
                        return 'Podaj prawidłowy numer identyfikacji działalności (BN)';
                    case CONST.COUNTRY.GB:
                        return 'Podaj prawidłowy numer identyfikacyjny VAT (VRN)';
                    case CONST.COUNTRY.AU:
                        return 'Podaj prawidłowy australijski numer biznesowy (ABN)';
                    default:
                        return 'Podaj prawidłowy numer VAT UE';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Czy posiadasz 25% lub więcej udziałów w ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Czy którakolwiek osoba posiada 25% lub więcej udziałów w ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Czy są jeszcze inne osoby, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'Przepisy wymagają od nas weryfikacji tożsamości każdej osoby, która posiada ponad 25% udziałów w firmie.',
        companyOwner: 'Właściciel firmy',
        enterLegalFirstAndLastName: 'Jakie jest oficjalne imię i nazwisko właściciela?',
        legalFirstName: 'Imię (zgodnie z dokumentem tożsamości)',
        legalLastName: 'Nazwisko zgodne z dokumentami',
        enterTheDateOfBirthOfTheOwner: 'Jaka jest data urodzenia właściciela?',
        enterTheLast4: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        dontWorry: 'Spokojnie, nie przeprowadzamy żadnych osobistych kontroli kredytowych!',
        enterTheOwnersAddress: 'Jaki jest adres właściciela?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko (pełne)',
        address: 'Adres',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś(-aś), rozumiesz i akceptujesz',
        owners: 'Właściciele',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informacje o właścicielu',
        businessOwner: 'Właściciel firmy',
        signerInfo: 'Dane podpisującego',
        doYouOwn: (companyName: string) => `Czy posiadasz 25% lub więcej udziałów w ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Czy którakolwiek osoba posiada 25% lub więcej udziałów w ${companyName}?`,
        regulationsRequire: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        legalFirstName: 'Imię (zgodnie z dokumentem tożsamości)',
        legalLastName: 'Nazwisko zgodne z dokumentami',
        whatsTheOwnersName: 'Jakie jest oficjalne imię i nazwisko właściciela?',
        whatsYourName: 'Jak brzmi Twoje oficjalne imię i nazwisko?',
        whatPercentage: 'Jaki procent firmy należy do właściciela?',
        whatsYoursPercentage: 'Jaki procent firmy posiadasz?',
        ownership: 'Własność',
        whatsTheOwnersDOB: 'Jaka jest data urodzenia właściciela?',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        whatsTheOwnersAddress: 'Jaki jest adres właściciela?',
        whatsYourAddress: 'Jaki jest twój adres?',
        whatAreTheLast: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        whatsYourLast: 'Jakie są ostatnie 4 cyfry Twojego numeru Social Security?',
        whatsYourNationality: 'Jaki jest Twój kraj obywatelstwa?',
        whatsTheOwnersNationality: 'Jaki jest kraj obywatelstwa właściciela?',
        countryOfCitizenship: 'Kraj obywatelstwa',
        dontWorry: 'Spokojnie, nie przeprowadzamy żadnych osobistych kontroli kredytowych!',
        last4: 'Ostatnie 4 cyfry numeru SSN',
        whyDoWeAsk: 'Dlaczego o to prosimy?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko (pełne)',
        ownershipPercentage: 'Procent udziałów',
        areThereOther: (companyName: string) => `Czy są inne osoby, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        owners: 'Właściciele',
        addCertified: 'Dodaj potwierdzone drzewo organizacyjne pokazujące beneficjentów rzeczywistych',
        regulationRequiresChart:
            'Przepisy wymagają, abyśmy zebrali poświadczoną kopię schematu własności, który pokazuje każdą osobę fizyczną lub podmiot posiadający 25% lub więcej udziałów w firmie.',
        uploadEntity: 'Prześlij schemat własności podmiotu',
        noteEntity: 'Uwaga: wykres struktury własnościowej jednostki musi być podpisany przez Twojego księgowego, doradcę prawnego lub poświadczony notarialnie.',
        certified: 'Poświadczony schemat własności podmiotu',
        selectCountry: 'Wybierz kraj',
        findCountry: 'Znajdź kraj',
        address: 'Adres',
        chooseFile: 'Wybierz plik',
        uploadDocuments: 'Prześlij dodatkową dokumentację',
        pleaseUpload:
            'Prześlij poniżej dodatkową dokumentację, aby pomóc nam zweryfikować Twoją tożsamość jako bezpośredniego lub pośredniego właściciela co najmniej 25% podmiotu gospodarczego.',
        acceptedFiles: 'Akceptowane formaty plików: PDF, PNG, JPEG. Łączny rozmiar plików w każdej sekcji nie może przekroczyć 5 MB.',
        proofOfBeneficialOwner: 'Dowód beneficjenta rzeczywistego',
        proofOfBeneficialOwnerDescription:
            'Prosimy o dostarczenie podpisanego oświadczenia oraz schematu organizacyjnego od biegłego rewidenta, notariusza lub prawnika, potwierdzających posiadanie 25% lub więcej udziałów w firmie. Dokument musi być opatrzony datą z ostatnich trzech miesięcy i zawierać numer licencji osoby podpisującej.',
        copyOfID: 'Kopia dokumentu tożsamości rzeczywistego właściciela',
        copyOfIDDescription: 'Przykłady: paszport, prawo jazdy itp.',
        proofOfAddress: 'Potwierdzenie adresu rzeczywistego właściciela',
        proofOfAddressDescription: 'Przykłady: rachunek za media, umowa najmu itp.',
        codiceFiscale: 'Codice fiscale/ID podatkowy',
        codiceFiscaleDescription:
            'Prześlij nagranie wideo z wizyty w siedzibie firmy lub zarejestrowanej rozmowy z osobą uprawnioną do podpisu. Osoba ta musi podać: imię i nazwisko, datę urodzenia, nazwę firmy, numer rejestracyjny, numer identyfikacji podatkowej, adres siedziby, rodzaj prowadzonej działalności oraz cel prowadzenia rachunku.',
    },
    completeVerificationStep: {
        completeVerification: 'Zakończ weryfikację',
        confirmAgreements: 'Potwierdź poniższe zgody.',
        certifyTrueAndAccurate: 'Oświadczam, że podane informacje są prawdziwe i dokładne',
        certifyTrueAndAccurateError: 'Potwierdź, że informacje są prawdziwe i dokładne',
        isAuthorizedToUseBankAccount: 'Jestem upoważniony(-a) do korzystania z tego firmowego konta bankowego na wydatki służbowe',
        isAuthorizedToUseBankAccountError: 'Musisz być osobą zasiadającą we władzach firmy z upoważnieniem do obsługi firmowego rachunku bankowego',
        termsAndConditions: 'warunki i zasady',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Zweryfikuj swoje konto bankowe',
        validateButtonText: 'Zatwierdź',
        validationInputLabel: 'Transakcja',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego została wyłączona z powodu zbyt wielu nieprawidłowych prób.',
        description: `W ciągu 1–2 dni roboczych wyślemy na Twoje konto bankowe trzy (3) niewielkie transakcje z nadawcy o nazwie podobnej do „Expensify, Inc. Validation”.`,
        descriptionCTA: 'Wprowadź kwotę każdej transakcji w polach poniżej. Przykład: 1,51.',
        letsChatText: 'Już prawie gotowe! Musimy z Twoją pomocą zweryfikować jeszcze kilka ostatnich informacji na czacie. Gotowy/a?',
        enable2FATitle: 'Zabezpiecz się przed oszustwami, włącz uwierzytelnianie dwuskładnikowe (2FA)',
        enable2FAText: 'Poważnie podchodzimy do kwestii bezpieczeństwa. Skonfiguruj teraz uwierzytelnianie dwuskładnikowe (2FA), aby dodać dodatkową warstwę ochrony swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    countryStep: {
        confirmBusinessBank: 'Potwierdź walutę i kraj firmowego konta bankowego',
        confirmCurrency: 'Potwierdź walutę i kraj',
        yourBusiness: 'Waluta firmowego konta bankowego musi być taka sama jak waluta Twojej przestrzeni roboczej.',
        youCanChange: 'Możesz zmienić walutę swojego workspace’u w swoim',
        findCountry: 'Znajdź kraj',
        selectCountry: 'Wybierz kraj',
    },
    bankInfoStep: {
        whatAreYour: 'Jakie są dane Twojego firmowego konta bankowego?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda w porządku.',
        thisBankAccount: 'To konto bankowe będzie używane do płatności firmowych w Twoim obszarze roboczym',
        accountNumber: 'Numer konta',
        accountHolderNameDescription: 'Imię i nazwisko upoważnionego sygnatariusza',
    },
    signerInfoStep: {
        signerInfo: 'Dane podpisującego',
        areYouDirector: (companyName: string) => `Czy jesteś dyrektorem w firmie ${companyName}?`,
        regulationRequiresUs: 'Przepisy wymagają od nas potwierdzenia, czy podpisujący ma uprawnienia do podjęcia tej czynności w imieniu firmy.',
        whatsYourName: 'Jak brzmi Twoje imię i nazwisko zgodnie z dokumentami',
        fullName: 'Imię i nazwisko (pełne)',
        whatsYourJobTitle: 'Jakie jest Twoje stanowisko?',
        jobTitle: 'Stanowisko zawodowe',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        uploadID: 'Prześlij dokument tożsamości i potwierdzenie adresu',
        personalAddress: 'Potwierdzenie adresu zamieszkania (np. rachunek za media)',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko (pełne)',
        proofOf: 'Potwierdzenie adresu zamieszkania',
        enterOneEmail: (companyName: string) => `Wpisz adres e-mail dyrektora w firmie ${companyName}`,
        regulationRequiresOneMoreDirector: 'Przepisy wymagają co najmniej jednego dodatkowego dyrektora jako sygnatariusza.',
        hangTight: 'Chwileczkę…',
        enterTwoEmails: (companyName: string) => `Wpisz adresy e-mail dwóch dyrektorów w firmie ${companyName}`,
        sendReminder: 'Wyślij przypomnienie',
        chooseFile: 'Wybierz plik',
        weAreWaiting: 'Czekamy, aż pozostałe osoby potwierdzą swoją tożsamość jako dyrektorzy firmy.',
        id: 'Kopia dowodu tożsamości',
        proofOfDirectors: 'Potwierdzenie powołania dyrektora/dyrektorów',
        proofOfDirectorsDescription: 'Przykłady: profil korporacyjny Oncorp lub rejestracja firmy.',
        codiceFiscale: 'Kod fiskalny',
        codiceFiscaleDescription: 'Codice Fiscale dla sygnatariuszy, użytkowników upoważnionych i beneficjentów rzeczywistych.',
        PDSandFSG: 'Dokumenty ujawnieniowe PDS + FSG',
        PDSandFSGDescription: dedent(`
            Nasza współpraca z Corpay wykorzystuje połączenie API, aby korzystać z ich rozległej sieci międzynarodowych partnerów bankowych obsługujących Globalne Zwroty w Expensify. Zgodnie z regulacjami obowiązującymi w Australii udostępniamy Ci Przewodnik po usługach finansowych (Financial Services Guide, FSG) oraz Dokument ujawniający informacje o produkcie (Product Disclosure Statement, PDS) firmy Corpay.

            Przeczytaj uważnie dokumenty FSG i PDS, ponieważ zawierają one pełne informacje i ważne szczegóły dotyczące produktów i usług oferowanych przez Corpay. Zachowaj te dokumenty do wykorzystania w przyszłości.
        `),
        pleaseUpload: 'Prześlij poniżej dodatkową dokumentację, abyśmy mogli zweryfikować Twoją tożsamość jako dyrektora firmy.',
        enterSignerInfo: 'Wprowadź dane sygnatariusza',
        thisStep: 'Ten krok został ukończony',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `łączy firmowe konto bankowe w ${currency} z numerem kończącym się na ${bankAccountLastFour} z Expensify, aby wypłacać wynagrodzenia pracownikom w ${currency}. Następnym krokiem jest podanie danych sygnatariusza będącego dyrektorem.`,
        error: {
            emailsMustBeDifferent: 'Adresy e-mail muszą być różne',
        },
    },
    agreementsStep: {
        agreements: 'Umowy',
        pleaseConfirm: 'Potwierdź poniższe zgody',
        regulationRequiresUs: 'Przepisy wymagają od nas weryfikacji tożsamości każdej osoby, która posiada ponad 25% udziałów w firmie.',
        iAmAuthorized: 'Mam upoważnienie do korzystania z firmowego rachunku bankowego na wydatki służbowe.',
        iCertify: 'Oświadczam, że podane informacje są prawdziwe i dokładne.',
        iAcceptTheTermsAndConditions: `Akceptuję <a href="https://cross-border.corpay.com/tc/">warunki i zasady</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Akceptuję warunki.',
        accept: 'Zaakceptuj i dodaj konto bankowe',
        iConsentToThePrivacyNotice: 'Wyrażam zgodę na <a href="https://payments.corpay.com/compliance">informację o ochronie prywatności</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Wyrażam zgodę na informację o prywatności.',
        error: {
            authorized: 'Musisz być osobą zasiadającą we władzach firmy z upoważnieniem do obsługi firmowego rachunku bankowego',
            certify: 'Potwierdź, że informacje są prawdziwe i dokładne',
            consent: 'Wyraź zgodę na informację o prywatności',
        },
    },
    docusignStep: {
        subheader: 'Formularz DocuSign',
        pleaseComplete:
            'Wypełnij proszę formularz autoryzacji ACH, korzystając z poniższego linku DocuSign, a następnie prześlij tutaj podpisaną kopię, abyśmy mogli pobierać środki bezpośrednio z Twojego konta bankowego',
        pleaseCompleteTheBusinessAccount: 'Proszę wypełnić wniosek o konto firmowe – ustalenie polecenia zapłaty',
        pleaseCompleteTheDirect:
            'Uzupełnij proszę Uzgodnienie polecenia zapłaty, korzystając z poniższego linku DocuSign, a następnie prześlij tutaj podpisaną kopię, abyśmy mogli pobierać środki bezpośrednio z Twojego konta bankowego.',
        takeMeTo: 'Przejdź do DocuSign',
        uploadAdditional: 'Prześlij dodatkową dokumentację',
        pleaseUpload: 'Prześlij formularz DEFT i stronę z podpisem DocuSign',
        pleaseUploadTheDirect: 'Prześlij proszę Uzgodnienia Dotyczące Polecenia Zapłaty oraz stronę z podpisem DocuSign',
    },
    finishStep: {
        letsFinish: 'Dokończmy to na czacie!',
        thanksFor:
            'Dziękujemy za te informacje. Dedykowany agent wsparcia przejrzy teraz Twoje dane. Skontaktujemy się z Tobą, jeśli będziemy potrzebować czegoś jeszcze, ale w międzyczasie możesz śmiało pisać do nas z wszelkimi pytaniami.',
        iHaveA: 'Mam pytanie',
        enable2FA: 'Włącz uwierzytelnianie dwuskładnikowe (2FA), aby zapobiec oszustwom',
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
        subtitle: 'Użyj Expensify Travel, aby otrzymać najlepsze oferty podróży i zarządzać wszystkimi wydatkami służbowymi w jednym miejscu.',
        features: {
            saveMoney: 'Oszczędzaj na swoich rezerwacjach',
            alerts: 'Otrzymuj alerty w czasie rzeczywistym, gdy Twoje plany podróży się zmienią',
        },
        bookTravel: 'Zarezerwuj podróż',
        bookDemo: 'Umów demo',
        bookADemo: 'Umów demo',
        toLearnMore: 'aby dowiedzieć się więcej.',
        termsAndConditions: {
            header: 'Zanim przejdziemy dalej…',
            title: 'Regulamin i warunki',
            label: 'Zgadzam się z warunkami korzystania z usługi',
            subtitle: `Prosimy o zaakceptowanie <a href="${CONST.TRAVEL_TERMS_URL}">warunków korzystania z usługi i regulaminu</a> Expensify Travel.`,
            error: 'Aby kontynuować, musisz zaakceptować regulamin Expensify Travel',
            defaultWorkspaceError:
                'Aby włączyć Expensify Travel, musisz ustawić domyślne miejsce pracy. Przejdź do Ustawienia > Miejsca pracy > kliknij trzy pionowe kropki obok miejsca pracy > Ustaw jako domyślne miejsce pracy, a następnie spróbuj ponownie!',
        },
        flight: 'Lot',
        flightDetails: {
            passenger: 'Pasażer',
            layover: (layover: string) => `<muted-text-label>Masz <strong>${layover} międzylądowanie</strong> przed tym lotem</muted-text-label>`,
            takeOff: 'StartStart',
            landing: 'Strona główna',
            seat: 'Miejsce',
            class: 'Klasa kabiny',
            recordLocator: 'Kod rezerwacji',
            cabinClasses: {
                unknown: 'Nieznane',
                economy: 'Klasa ekonomiczna',
                premiumEconomy: 'Klasa Premium Economy',
                business: 'Firma',
                first: 'Pierwszy',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Gość',
            checkIn: 'Zameldowanie',
            checkOut: 'Wykwaterowanie',
            roomType: 'Rodzaj pokoju',
            cancellation: 'Zasady anulowania',
            cancellationUntil: 'Bezpłatne anulowanie do',
            confirmation: 'Numer potwierdzenia',
            cancellationPolicies: {
                unknown: 'Nieznane',
                nonRefundable: 'Bezzwrotne',
                freeCancellationUntil: 'Bezpłatne anulowanie do',
                partiallyRefundable: 'Częściowo podlegające zwrotowi',
            },
        },
        car: 'Samochód',
        carDetails: {
            rentalCar: 'Wynajem samochodu',
            pickUp: 'Odbiór',
            dropOff: 'Miejsce zwrotu',
            driver: 'Kierowca',
            carType: 'Typ samochodu',
            cancellation: 'Zasady anulowania',
            cancellationUntil: 'Bezpłatne anulowanie do',
            freeCancellation: 'Bezpłatne odwołanie',
            confirmation: 'Numer potwierdzenia',
        },
        train: 'Szyna',
        trainDetails: {
            passenger: 'Pasażer',
            departs: 'Odjazd',
            arrives: 'Przyjazd',
            coachNumber: 'Numer wagonu',
            seat: 'Miejsce',
            fareDetails: 'Szczegóły taryfy',
            confirmation: 'Numer potwierdzenia',
        },
        viewTrip: 'Zobacz podróż',
        modifyTrip: 'Zmodyfikuj podróż',
        tripSupport: 'Wsparcie podróży',
        tripDetails: 'Szczegóły podróży',
        viewTripDetails: 'Zobacz szczegóły podróży',
        trip: 'Podróż',
        trips: 'Podróże',
        tripSummary: 'Podsumowanie podróży',
        departs: 'Odjazd',
        errorMessage: 'Coś poszło nie tak. Spróbuj ponownie później.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Aby zarezerwować podróż, <a href="${phoneErrorMethodsRoute}">dodaj służbowy adres e‑mail jako swój główny login</a>.</rbr>`,
        domainSelector: {
            title: 'Domena',
            subtitle: 'Wybierz domenę do konfiguracji Expensify Travel.',
            recommended: 'Polecane',
        },
        domainPermissionInfo: {
            title: 'Domena',
            restriction: (domain: string) =>
                `Nie masz uprawnień, aby włączyć Expensify Travel dla domeny <strong>${domain}</strong>. Zamiast tego poproś kogoś z tej domeny o włączenie Travel.`,
            accountantInvitation: `Jeśli jesteś księgowym, rozważ dołączenie do programu <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! dla księgowych</a>, aby włączyć podróże dla tej domeny.`,
        },
        publicDomainError: {
            title: 'Pierwsze kroki z Expensify Travel',
            message: `Musisz używać służbowego adresu e-mail (np. name@company.com) z Expensify Travel, a nie prywatnego adresu e-mail (np. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel zostało wyłączone',
            message: `Twój administrator wyłączył Expensify Travel. Postępuj zgodnie z firmową polityką rezerwacji przy organizowaniu podróży.`,
        },
        verifyCompany: {
            title: 'Przeglądamy Twoje zgłoszenie…',
            message: `Po naszej stronie wykonujemy teraz kilka kontroli, aby upewnić się, że Twoje konto jest gotowe na Expensify Travel. Wkrótce się z Tobą skontaktujemy!`,
            confirmText: 'Rozumiem',
            conciergeMessage: ({domain}: {domain: string}) => `Włączenie podróży nie powiodło się dla domeny: ${domain}. Sprawdź i włącz podróże dla tej domeny.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zarezerwowany. Kod potwierdzający: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój bilet na lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został unieważniony.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój bilet na lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zwrócony lub wymieniony.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate}} został odwołany przez linię lotniczą.`,
            flightScheduleChangePending: (airlineCode: string) => `Linie lotnicze zaproponowały zmianę rozkładu dla lotu ${airlineCode}; oczekujemy na potwierdzenie.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Zmiana planu potwierdzona: lot ${airlineCode} odlatyje teraz o ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zaktualizowany.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Twoja klasa kabiny została zaktualizowana na ${cabinClass} w locie ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Twój przydział miejsca na locie ${airlineCode} został potwierdzony.`,
            flightSeatChanged: (airlineCode: string) => `Twoje miejsce na locie ${airlineCode} zostało zmienione.`,
            flightSeatCancelled: (airlineCode: string) => `Twoja przydzielona miejscówka na locie ${airlineCode} została usunięta.`,
            paymentDeclined: 'Płatność za rezerwację lotu nie powiodła się. Spróbuj ponownie.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Anulowano Twoją rezerwację ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Dostawca anulował Twoją rezerwację typu ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Twoja rezerwacja (${type}) została ponownie zarezerwowana. Nowy numer potwierdzenia: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Twoja rezerwacja (${type}) została zaktualizowana. Sprawdź nowe szczegóły w planie podróży.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Twój bilet kolejowy z ${origin} do ${destination} na ${startDate} został zwrócony. Zostanie przetworzony kredyt.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Twój bilet kolejowy z ${origin} → ${destination} na ${startDate} został wymieniony.`,
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
            customField1: 'Niestandardowe pole 1',
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
            testTransactions: 'Transakcje testowe',
            issueAndManageCards: 'Wydawaj i zarządzaj kartami',
            reconcileCards: 'Uzgodnij karty',
            selectAll: 'Zaznacz wszystko',
            selected: () => ({
                one: 'Wybrano 1 pozycję',
                other: (count: number) => `Wybrano: ${count}`,
            }),
            settlementFrequency: 'Częstotliwość rozliczeń',
            setAsDefault: 'Ustaw jako domyślne miejsce pracy',
            defaultNote: `Paragony wysłane na ${CONST.EMAIL.RECEIPTS} pojawią się w tym obszarze roboczym.`,
            deleteConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą?',
            deleteWithCardsConfirmation: 'Na pewno chcesz usunąć tę przestrzeń roboczą? Spowoduje to usunięcie wszystkich źródeł kart i przypisanych kart.',
            unavailable: 'Niedostępne miejsce pracy',
            memberNotFound: 'Nie znaleziono członka. Aby zaprosić nową osobę do przestrzeni roboczej, użyj przycisku zaproszenia powyżej.',
            notAuthorized: `Nie masz dostępu do tej strony. Jeśli próbujesz dołączyć do tego obszaru roboczego, poproś właściciela obszaru roboczego, aby dodał Cię jako członka. Coś innego? Skontaktuj się z ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Przejdź do przestrzeni roboczej',
            duplicateWorkspace: 'Zduplikuj przestrzeń roboczą',
            duplicateWorkspacePrefix: 'Duplikuj',
            goToWorkspaces: 'Przejdź do przestrzeni roboczych',
            clearFilter: 'Wyczyść filtr',
            workspaceName: 'Nazwa przestrzeni roboczej',
            workspaceOwner: 'Właściciel',
            keepMeAsAdmin: 'Zachowaj mnie jako administratora',
            workspaceType: 'Typ przestrzeni roboczej',
            workspaceAvatar: 'Awatar przestrzeni roboczej',
            mustBeOnlineToViewMembers: 'Musisz być online, aby wyświetlić członków tego workspace.',
            moreFeatures: 'Więcej funkcji',
            requested: 'Zamówiono',
            distanceRates: 'Stawki za dystans',
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
            appliedOnExport: 'Nie zaimportowano do Expensify, zastosowane przy eksporcie',
            shareNote: {
                header: 'Udostępnij swoją przestrzeń roboczą innym członkom',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Udostępnij ten kod QR lub skopiuj poniższy link, aby członkowie mogli łatwo poprosić o dostęp do Twojego obszaru roboczego. Wszystkie prośby o dołączenie do obszaru roboczego pojawią się w pokoju <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> do Twojej weryfikacji.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Połącz z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Utwórz nowe połączenie',
            reuseExistingConnection: 'Użyj istniejącego połączenia',
            existingConnections: 'Istniejące połączenia',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Ponieważ wcześniej połączyłeś(-aś) się z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, możesz ponownie użyć istniejącego połączenia lub utworzyć nowe.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} – Ostatnia synchronizacja ${formattedDate}`,
            authenticationError: (connectionName: string) => `Nie można połączyć z ${connectionName} z powodu błędu uwierzytelniania.`,
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
                instant: 'Natychmiast',
                immediate: 'Codziennie',
                trip: 'Według podróży',
                weekly: 'Co tydzień',
                semimonthly: 'Dwa razy w miesiącu',
                monthly: 'Miesięcznie',
            },
            planType: 'Typ planu',
            youCantDowngradeInvoicing:
                'Nie możesz obniżyć planu w subskrypcji rozliczanej fakturą. Aby omówić lub wprowadzić zmiany w swojej subskrypcji, skontaktuj się z opiekunem konta lub Concierge po pomoc.',
            defaultCategory: 'Domyślna kategoria',
            viewTransactions: 'Wyświetl transakcje',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Wydatki ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Transakcje kartą Expensify będą automatycznie eksportowane do „Konta zobowiązań karty Expensify” utworzonego za pomocą <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">naszej integracji</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Połączono z ${organizationName}` : 'Automatyzuj wydatki na podróże i dostawy posiłków w całej swojej organizacji.',
                sendInvites: 'Wyślij zaproszenia',
                sendInvitesDescription: 'Ci członkowie przestrzeni roboczej nie mają jeszcze konta Uber for Business. Odznacz wszystkich członków, których nie chcesz teraz zapraszać.',
                confirmInvite: 'Potwierdź zaproszenie',
                manageInvites: 'Zarządzaj zaproszeniami',
                confirm: 'Potwierdź',
                allSet: 'Wszystko gotowe',
                readyToRoll: 'Wszystko gotowe',
                takeBusinessRideMessage: 'Wybierz przejazd służbowy, a Twoje paragony Ubera zostaną zaimportowane do Expensify. Ruszaj!',
                all: 'Wszystko',
                linked: 'Powiązane',
                outstanding: 'Niewyjaśnione',
                status: {
                    resend: 'Wyślij ponownie',
                    invite: 'Zaproś',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Powiązane',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Oczekujące',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Zawieszono',
                },
                centralBillingAccount: 'Centralne konto rozliczeniowe',
                centralBillingDescription: 'Wybierz miejsce importu wszystkich paragonów z Uber.',
                invitationFailure: 'Nie udało się zaprosić członka do Uber for Business',
                autoInvite: 'Zaproś nowych członków przestrzeni roboczej do Uber for Business',
                autoRemove: 'Dezaktywuj usuniętych członków miejsca pracy w Uber for Business',
                emptyContent: {
                    title: 'Brak oczekujących zaproszeń',
                    subtitle: 'Hurra! Szukaliśmy wszędzie i nie znaleźliśmy żadnych zaległych zaproszeń.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Ustaw stawki dzienne (per diem), aby kontrolować dzienne wydatki pracowników. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Dowiedz się więcej</a>.</muted-text>`,
            amount: 'Kwota',
            deleteRates: () => ({
                one: 'Usuń stawkę',
                other: 'Usuń stawki',
            }),
            deletePerDiemRate: 'Usuń stawkę ryczałtową',
            findPerDiemRate: 'Znajdź stawkę ryczałtu dziennego',
            areYouSureDelete: () => ({
                one: 'Na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }),
            emptyList: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki dzienne (ryczałty), aby kontrolować dziennie wydatki pracowników. Zaimportuj stawki z arkusza kalkulacyjnego, aby rozpocząć.',
            },
            importPerDiemRates: 'Zaimportuj stawki diet',
            editPerDiemRate: 'Edytuj stawkę diety',
            editPerDiemRates: 'Edytuj stawki diet',
            editDestinationSubtitle: (destination: string) => `Zaktualizowanie tego miejsca docelowego zmieni je dla wszystkich podstawek diet ${destination}.`,
            editCurrencySubtitle: (destination: string) => `Zaktualizowanie tej waluty spowoduje jej zmianę dla wszystkich podrzędnych stawek diet w ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportu wydatków z własnej kieszeni do QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Oznacz czeki jako „do wydrukowania później”',
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do QuickBooks Desktop.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Wyeksportuj transakcje karty Expensify jako',
            account: 'Konto',
            accountDescription: 'Wybierz miejsce księgowania zapisów w dzienniku.',
            accountsPayable: 'Zobowiązania z tytułu dostaw i usług',
            accountsPayableDescription: 'Wybierz, gdzie tworzyć rachunki od dostawców.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nie skonfigurowano',
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
                        label: 'Data wysłania',
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            exportCheckDescription: 'Utworzymy wyszczególniony czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy zapis księgowy dla każdego raportu Expensify i zaksięgujemy go na koncie poniżej.',
            exportVendorBillDescription:
                'Utworzymy zindywidualizowaną fakturę od dostawcy dla każdego raportu Expensify i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop nie obsługuje podatków przy eksporcie zapisów w dzienniku. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Zapisy w dzienniku są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Polecenie księgowania',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Czek',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Utworzymy wyszczególniony czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą kredytową do odpowiednich dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Credit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy zindywidualizowaną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji z karty kredytowej.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Wybierz dostawcę, który zostanie zastosowany do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wybierz, skąd wysyłać czeki.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Rachunki dostawców są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Zapisy w dzienniku są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Desktop i zsynchronizuj połączenie ponownie',
            qbdSetup: 'Konfiguracja QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Nie można połączyć z tego urządzenia',
                body1: 'Musisz skonfigurować to połączenie z komputera, na którym znajduje się plik firmy QuickBooks Desktop.',
                body2: 'Po połączeniu będziesz mógł synchronizować i eksportować z dowolnego miejsca.',
            },
            setupPage: {
                title: 'Otwórz ten link, aby się połączyć',
                body: 'Aby dokończyć konfigurację, otwórz poniższy link na komputerze, na którym działa QuickBooks Desktop.',
                setupErrorTitle: 'Coś poszło nie tak',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>Połączenie z QuickBooks Desktop nie działa w tej chwili. Spróbuj ponownie później lub <a href="${conciergeLink}">skontaktuj się z Concierge</a>, jeśli problem będzie się powtarzał.</centered-text></muted-text>`,
            },
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z QuickBooks Desktop do Expensify.',
            classes: 'Zajęcia',
            items: 'Pozycje',
            customers: 'Klienci/projekty',
            exportCompanyCardsDescription: 'Ustaw sposób eksportu zakupów z kart firmowych do QuickBooks Desktop.',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który zostanie zastosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            accountsDescription: 'Plan kont w QuickBooks Desktop zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz sposób obsługi klas QuickBooks Desktop w Expensify.',
            tagsDisplayedAsDescription: 'Poziom pozycji liniowej',
            reportFieldsDisplayedAsDescription: 'Poziom raportu',
            customersDescription: 'Wybierz, jak obsługiwać klientów/projekty QuickBooks Desktop w Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z QuickBooks Desktop każdego dnia.',
                createEntities: 'Automatycznie twórz jednostki',
                createEntitiesDescription: 'Expensify automatycznie utworzy dostawców w QuickBooks Desktop, jeśli jeszcze nie istnieją.',
            },
            itemsDescription: 'Wybierz, jak obsługiwać elementy QuickBooks Desktop w Expensify.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy eksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriał',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po opłaceniu',
                },
            },
        },
        qbo: {
            connectedTo: 'Połączono z',
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z QuickBooks Online do Expensify.',
            classes: 'Zajęcia',
            locations: 'Lokalizacje',
            customers: 'Klienci/projekty',
            accountsDescription: 'Plan kont w QuickBooks Online zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz sposób obsługi klas QuickBooks Online w Expensify.',
            customersDescription: 'Wybierz sposób obsługi klientów/projektów z QuickBooks Online w Expensify.',
            locationsDescription: 'Wybierz sposób obsługi lokalizacji QuickBooks Online w Expensify.',
            taxesDescription: 'Wybierz sposób obsługi podatków QuickBooks Online w Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online nie obsługuje lokalizacji na poziomie wiersza dla czeków ani rachunków od dostawców. Jeśli chcesz mieć lokalizacje na poziomie wiersza, upewnij się, że używasz zapisów księgowych (Journal Entries) oraz wydatków z kart kredytowych/debetowych.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online nie obsługuje podatków w zapisach w dzienniku. Zmień opcję eksportu na rachunek od dostawcy lub czek.',
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do QuickBooks Online.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Wyeksportuj transakcje karty Expensify jako',
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
                        label: 'Data wysłania',
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            receivable: 'Należności',
            archive: 'Archiwum należności',
            exportInvoicesDescription: 'Użyj tego konta podczas eksportowania faktur do QuickBooks Online.',
            exportCompanyCardsDescription: 'Ustaw, w jaki sposób zakupy kartą firmową są eksportowane do QuickBooks Online.',
            vendor: 'Dostawca',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który zostanie zastosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportu wydatków z własnej kieszeni do QuickBooks Online.',
            exportCheckDescription: 'Utworzymy wyszczególniony czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy zapis księgowy dla każdego raportu Expensify i zaksięgujemy go na koncie poniżej.',
            exportVendorBillDescription:
                'Utworzymy zindywidualizowaną fakturę od dostawcy dla każdego raportu Expensify i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
            account: 'Konto',
            accountDescription: 'Wybierz miejsce księgowania zapisów w dzienniku.',
            accountsPayable: 'Zobowiązania z tytułu dostaw i usług',
            accountsPayableDescription: 'Wybierz, gdzie tworzyć rachunki od dostawców.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nie skonfigurowano',
            bankAccountDescription: 'Wybierz, skąd wysyłać czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online nie obsługuje lokalizacji w eksporcie rachunków do dostawców. Ponieważ masz włączone lokalizacje w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online nie obsługuje podatków przy eksporcie zapisów w dzienniku. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Zapisy w dzienniku są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z QuickBooks Online każdego dnia.',
                inviteEmployees: 'Zaproś pracowników',
                inviteEmployeesDescription: 'Zaimportuj rekordy pracowników z QuickBooks Online i zaproś pracowników do tego obszaru roboczego.',
                createEntities: 'Automatycznie twórz jednostki',
                createEntitiesDescription:
                    'Expensify automatycznie utworzy dostawców w QuickBooks Online, jeśli jeszcze nie istnieją, oraz automatycznie utworzy klientów podczas eksportowania faktur.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie QuickBooks Online.',
                qboBillPaymentAccount: 'Konto płatności rachunków QuickBooks',
                qboInvoiceCollectionAccount: 'konto rozliczeń należności z faktur QuickBooks',
                accountSelectDescription: 'Wybierz, z jakiego konta opłacać rachunki, a my utworzymy płatność w QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie otrzymywać płatności za faktury, a my utworzymy płatność w QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Karta debetowa',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Polecenie księgowania',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Czek',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą debetową do odpowiednich dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Debit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą kredytową do odpowiednich dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Credit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy zindywidualizowaną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji kartą debetową.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji z karty kredytowej.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wybierz dostawcę, który zostanie zastosowany do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Rachunki dostawców są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Zapisy w dzienniku są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wybierz prawidłowe konto do eksportu rachunków od dostawców',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wybierz prawidłowe konto do eksportu zapisu księgowego',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wybierz prawidłowe konto do eksportu czeku',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Aby korzystać z eksportu rachunków dostawców, skonfiguruj konto zobowiązań w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Aby korzystać z eksportu zapisów w dzienniku, skonfiguruj konto dziennika w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Aby korzystać z eksportu czeków, skonfiguruj konto bankowe w QuickBooks Online',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Online i zsynchronizuj połączenie ponownie.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy eksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriał',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
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
            accountsDescription: 'Twój plan kont w Xero zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia ich wydatków.',
            trackingCategories: 'Kategorie śledzenia',
            trackingCategoriesDescription: 'Wybierz sposób obsługi kategorii śledzenia Xero w Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `Mapuj Xero ${categoryName} do`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Wybierz, dokąd mapować ${categoryName} podczas eksportu do Xero.`,
            customers: 'Ponownie obciąż klientów',
            customersDescription:
                'Wybierz, czy ponownie zafakturować klientów w Expensify. Kontakty klientów z Xero mogą zostać oznaczone na wydatkach i zostaną wyeksportowane do Xero jako faktura sprzedaży.',
            taxesDescription: 'Wybierz sposób obsługi podatków Xero w Expensify.',
            notImported: 'Nie zaimportowano',
            notConfigured: 'Nie skonfigurowano',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Domyślny kontakt Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tagi',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Pola raportu',
            },
            exportDescription: 'Skonfiguruj sposób eksportu danych Expensify do Xero.',
            purchaseBill: 'Rachunek zakupu',
            exportDeepDiveCompanyCard:
                'Wyeksportowane wydatki zostaną zaksięgowane jako transakcje bankowe na poniższym koncie bankowym Xero, a daty transakcji będą zgodne z datami na Twoim wyciągu bankowym.',
            bankTransactions: 'Transakcje bankowe',
            xeroBankAccount: 'Konto bankowe Xero',
            xeroBankAccountDescription: 'Wybierz, gdzie wydatki będą księgowane jako transakcje bankowe.',
            exportExpensesDescription: 'Raporty zostaną wyeksportowane jako rachunek zakupu z datą i statusem wybranymi poniżej.',
            purchaseBillDate: 'Data rachunku zakupu',
            exportInvoices: 'Eksportuj faktury jako',
            salesInvoice: 'Faktura sprzedaży',
            exportInvoicesDescription: 'Faktury sprzedażowe zawsze wyświetlają datę wysłania faktury.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Xero każdego dnia.',
                purchaseBillStatusTitle: 'Status rachunku zakupu',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Xero.',
                xeroBillPaymentAccount: 'Konto płatności rachunków Xero',
                xeroInvoiceCollectionAccount: 'Konto rozliczeniowe faktur Xero',
                xeroBillPaymentAccountDescription: 'Wybierz, z jakiego konta opłacać rachunki, a my utworzymy płatność w Xero.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie chcesz otrzymywać płatności za faktury, a my utworzymy płatność w Xero.',
            },
            exportDate: {
                label: 'Data rachunku zakupu',
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
                        label: 'Data wysłania',
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status rachunku zakupu',
                description: 'Użyj tego statusu podczas eksportowania rachunków zakupów do Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Wersja robocza',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Oczekuje na zatwierdzenie',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Oczekuje na płatność',
                },
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj proszę konto w Xero i zsynchronizuj połączenie ponownie',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy eksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriał',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po opłaceniu',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Preferowany eksporter',
            taxSolution: 'Rozwiązanie podatkowe',
            notConfigured: 'Nie skonfigurowano',
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
                        label: 'Data wysłania',
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
                description: 'Ustaw sposób eksportu zakupów kartą firmową do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Karty kredytowe',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Rachunki od dostawców',
                },
            },
            creditCardAccount: 'Konto karty kredytowej',
            defaultVendor: 'Domyślny dostawca',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Ustaw domyślnego dostawcę, który zostanie zastosowany do ${isReimbursable ? '' : 'nie-'}wydatków podlegających zwrotowi, nieposiadających pasującego dostawcy w Sage Intacct.`,
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do Sage Intacct.',
            exportPreferredExporterNote:
                'Preferowanym eksporterem może być dowolny administrator przestrzeni roboczej, ale musi on również być administratorem domeny, jeśli w Ustawieniach domeny ustawisz różne konta eksportu dla poszczególnych kart firmowych.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy w swoim koncie raporty do eksportu.',
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: `Dodaj proszę konto w Sage Intacct i ponownie zsynchronizuj połączenie`,
            autoSync: 'Automatyczna synchronizacja',
            autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Sage Intacct każdego dnia.',
            inviteEmployees: 'Zaproś pracowników',
            inviteEmployeesDescription:
                'Zaimportuj rekordy pracowników Sage Intacct i zaproś pracowników do tego obszaru roboczego. Twój przepływ zatwierdzania domyślnie będzie oparty na zatwierdzeniu przez menedżera i można go dalej konfigurować na stronie Członkowie.',
            syncReimbursedReports: 'Synchronizuj rozliczone raporty',
            syncReimbursedReportsDescription:
                'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na koncie Sage Intacct poniżej.',
            paymentAccount: 'Konto płatnicze Sage Intacct',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy eksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriał',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po opłaceniu',
                },
            },
        },
        netsuite: {
            subsidiary: 'Spółka zależna',
            subsidiarySelectDescription: 'Wybierz jednostkę zależną w NetSuite, z której chcesz zaimportować dane.',
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do NetSuite.',
            exportInvoices: 'Eksportuj faktury do',
            journalEntriesTaxPostingAccount: 'Konto podatkowe zapisów w dzienniku',
            journalEntriesProvTaxPostingAccount: 'Konto księgowania prowincjonalnego podatku w dzienniku',
            foreignCurrencyAmount: 'Eksportuj kwotę w walucie obcej',
            exportToNextOpenPeriod: 'Eksportuj do następnego otwartego okresu',
            nonReimbursableJournalPostingAccount: 'Konto księgowania nierozliczanych wydatków',
            reimbursableJournalPostingAccount: 'Konto księgowe dla zwrotów kosztów',
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
                        label: 'Wybierz istniejące',
                        description: 'Połączymy faktury z Expensify z pozycją wybraną poniżej.',
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
                        label: 'Data wysłania',
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
                            Wydatki z własnej kieszeni zostaną wyeksportowane jako rachunki płatne na rzecz dostawcy NetSuite wskazanego poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Wydatki z kart firmowych zostaną wyeksportowane jako rachunki płatne na rzecz dostawcy NetSuite określonego poniżej.

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
                            Wydatki z kart firmowych zostaną wyeksportowane jako zapisy księgowe na konto NetSuite określone poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Jeśli zmienisz ustawienie eksportu firmowych kart płatniczych na raporty wydatków, dostawcy NetSuite i konta księgowe przypisane do poszczególnych kart zostaną wyłączone.\n\nNie martw się, nadal zachowamy Twoje poprzednie wybory na wypadek, gdybyś później chciał(a) wrócić do poprzednich ustawień.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z NetSuite każdego dnia.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiadająca mu płatność rachunku zostanie utworzona na poniższym koncie NetSuite.',
                reimbursementsAccount: 'Konto zwrotów',
                reimbursementsAccountDescription: 'Wybierz konto bankowe, którego użyjesz do zwrotów, a my utworzymy powiązaną płatność w NetSuite.',
                collectionsAccount: 'Konto przejęte przez windykację',
                collectionsAccountDescription: 'Gdy faktura zostanie oznaczona jako opłacona w Expensify i wyeksportowana do NetSuite, pojawi się na poniższym koncie.',
                approvalAccount: 'Konto do zatwierdzania zobowiązań A/P',
                approvalAccountDescription:
                    'Wybierz konto, względem którego transakcje będą zatwierdzane w NetSuite. Jeśli synchronizujesz rozliczone raporty, jest to również konto, względem którego będą tworzone płatności rachunków.',
                defaultApprovalAccount: 'Domyślne NetSuite',
                inviteEmployees: 'Zaproś pracowników i ustaw zatwierdzanie',
                inviteEmployeesDescription:
                    'Zaimportuj rekordy pracowników NetSuite i zaproś pracowników do tego obszaru roboczego. Twój przepływ akceptacji będzie domyślnie ustawiony na akceptację przez menedżera i może zostać dalej skonfigurowany na stronie *Członkowie*.',
                autoCreateEntities: 'Automatycznie twórz pracowników/dostawców',
                enableCategories: 'Włącz nowo zaimportowane kategorie',
                customFormID: 'Niestandardowy identyfikator formularza',
                customFormIDDescription:
                    'Domyślnie Expensify będzie tworzyć zapisy, używając preferowanego formularza transakcji ustawionego w NetSuite. Alternatywnie możesz wskazać konkretny formularz transakcji, który ma być używany.',
                customFormIDReimbursable: 'Wydatek z własnej kieszeni',
                customFormIDNonReimbursable: 'Wydatek z firmowej karty',
                exportReportsTo: {
                    label: 'Poziom zatwierdzania raportu wydatków',
                    description:
                        'Po zatwierdzeniu raportu wydatków w Expensify i wyeksportowaniu go do NetSuite możesz w NetSuite ustawić dodatkowy poziom akceptacji przed jego zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Tylko zatwierdzone przez przełożonego',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Tylko zatwierdzone przez księgowość',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Zatwierdzone przez przełożonego i dział księgowości',
                    },
                },
                accountingMethods: {
                    label: 'Kiedy eksportować',
                    description: 'Wybierz, kiedy eksportować wydatki:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriał',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po opłaceniu',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Poziom akceptacji rachunku dostawcy',
                    description:
                        'Po zatwierdzeniu rachunku od dostawcy w Expensify i wyeksportowaniu go do NetSuite, możesz ustawić w NetSuite dodatkowy poziom zatwierdzania przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zatwierdzono do zaksięgowania',
                    },
                },
                exportJournalsTo: {
                    label: 'Poziom zatwierdzania zapisów księgowych',
                    description:
                        'Po zatwierdzeniu zapisu w dzienniku w Expensify i wyeksportowaniu go do NetSuite możesz w NetSuite ustawić dodatkowy poziom zatwierdzania przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zatwierdzono do zaksięgowania',
                    },
                },
                error: {
                    customFormID: 'Wprowadź prawidłowy numeryczny identyfikator niestandardowego formularza',
                },
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w NetSuite i ponownie zsynchronizuj połączenie',
            noVendorsFound: 'Nie znaleziono dostawców',
            noVendorsFoundDescription: 'Dodaj proszę dostawców w NetSuite i zsynchronizuj połączenie ponownie',
            noItemsFound: 'Nie znaleziono pozycji faktury',
            noItemsFoundDescription: 'Dodaj pozycje faktury w NetSuite i zsynchronizuj połączenie ponownie',
            noSubsidiariesFound: 'Nie znaleziono spółek zależnych',
            noSubsidiariesFoundDescription: 'Dodaj proszę jednostkę zależną w NetSuite i ponownie zsynchronizuj połączenie',
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
                        description: 'W NetSuite przejdź do *Setup > Company > Enable Features > SuiteCloud* i włącz *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Utwórz token dostępu',
                        description:
                            'W NetSuite przejdź do *Setup > Users/Roles > Access Tokens* > utwórz token dostępu dla aplikacji „Expensify” i roli „Expensify Integration” lub „Administrator”.\n\n*Ważne:* Upewnij się, że zapiszesz *Token ID* i *Token Secret* z tego kroku. Będą potrzebne w kolejnym kroku.',
                    },
                    enterCredentials: {
                        title: 'Wprowadź swoje dane logowania do NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'Identyfikator konta NetSuite',
                            netSuiteTokenID: 'Identyfikator tokena',
                            netSuiteTokenSecret: 'Sekretny token',
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
                        subtitle: 'Wybierz sposób obsługi *działów* NetSuite w Expensify.',
                    },
                    classes: {
                        title: 'Zajęcia',
                        subtitle: 'Wybierz, jak obsługiwać *klasy* w Expensify.',
                    },
                    locations: {
                        title: 'Lokalizacje',
                        subtitle: 'Wybierz, jak obsługiwać *lokalizacje* w Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Klienci/projekty',
                    subtitle: 'Wybierz sposób obsługi *klientów* i *projektów* z NetSuite w Expensify.',
                    importCustomers: 'Importuj klientów',
                    importJobs: 'Importuj projekty',
                    customers: 'klienci',
                    jobs: 'projekty',
                    label: (importFields: string[], importType: string) => `${importFields.join('i')}, ${importType}`,
                },
                importTaxDescription: 'Zaimportuj grupy podatkowe z NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Wybierz jedną z poniższych opcji:',
                    label: (importedTypes: string[]) => `Zaimportowano jako ${importedTypes.join('i')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Wpisz proszę ${fieldName}`,
                    customSegments: {
                        title: 'Niestandardowe segmenty/rejestry',
                        addText: 'Dodaj własny segment/rejestr',
                        recordTitle: 'Niestandardowy segment/rejestr',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Zobacz szczegółowe instrukcje',
                        helpText: 'dotyczące konfigurowania niestandardowych segmentów/rekordów.',
                        emptyTitle: 'Dodaj niestandardowy segment lub niestandardowy rekord',
                        fields: {
                            segmentName: 'Nazwa',
                            internalID: 'Wewnętrzne ID',
                            scriptID: 'ID skryptu',
                            customRecordScriptID: 'Identyfikator kolumny transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń niestandardowy segment/rejestr',
                        removePrompt: 'Czy na pewno chcesz usunąć ten niestandardowy segment/rekord?',
                        addForm: {
                            customSegmentName: 'nazwa niestandardowego segmentu',
                            customRecordName: 'nazwa rekordu niestandardowego',
                            segmentTitle: 'Niestandardowy segment',
                            customSegmentAddTitle: 'Dodaj niestandardowy segment',
                            customRecordAddTitle: 'Dodaj niestandardowy rekord',
                            recordTitle: 'Niestandardowy rekord',
                            segmentRecordType: 'Czy chcesz dodać niestandardowy segment czy niestandardowy rekord?',
                            customSegmentNameTitle: 'Jaka jest nazwa własnego segmentu?',
                            customRecordNameTitle: 'Jaka jest nazwa niestandardowego rekordu?',
                            customSegmentNameFooter: `Nazwy niestandardowych segmentów znajdziesz w NetSuite na stronie *Customizations > Links, Records & Fields > Custom Segments*.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Nazwy niestandardowych rekordów w NetSuite możesz znaleźć, wpisując „Transaction Column Field” w wyszukiwarkę globalną.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Jaki jest identyfikator wewnętrzny?',
                            customSegmentInternalIDFooter: `Najpierw upewnij się, że włączyłeś(-aś) wewnętrzne ID w NetSuite w *Home > Set Preferences > Show Internal ID.*

Wewnętrzne ID segmentów niestandardowych w NetSuite znajdziesz tutaj:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Kliknij wybrany segment niestandardowy.
3. Kliknij hiperłącze obok *Custom Record Type*.
4. Odszukaj wewnętrzne ID w tabeli na dole.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Możesz znaleźć wewnętrzne ID niestandardowych rekordów w NetSuite, wykonując następujące kroki:

1. Wpisz „Transaction Line Fields” w wyszukiwaniu globalnym.
2. Kliknij niestandardowy rekord.
3. Znajdź wewnętrzne ID po lewej stronie.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Jaki jest identyfikator skryptu?',
                            customSegmentScriptIDFooter: `Możesz znaleźć identyfikatory skryptów niestandardowych segmentów w NetSuite w menu: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Wejdź w szczegóły wybranego niestandardowego segmentu.
3. Kliknij kartę *Application and Sourcing* na dole, a następnie:
    a. Jeśli chcesz wyświetlać niestandardowy segment jako *tag* (na poziomie pozycji) w Expensify, kliknij zakładkę podrzędną *Transaction Columns* i użyj *Field ID*.
    b. Jeśli chcesz wyświetlać niestandardowy segment jako *pole raportu* (na poziomie raportu) w Expensify, kliknij zakładkę podrzędną *Transactions* i użyj *Field ID*.

_Bardziej szczegółowe instrukcje znajdziesz, [odwiedzając naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Jaki jest identyfikator kolumny transakcji?',
                            customRecordScriptIDFooter: `Możesz znaleźć identyfikatory skryptów niestandardowych rekordów w NetSuite, w sekcji:

1. Wpisz „Transaction Line Fields” w wyszukiwaniu globalnym.
2. Kliknij niestandardowy rekord.
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
                        addText: 'Dodaj niestandardową listę',
                        recordTitle: 'Lista niestandardowa',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Zobacz szczegółowe instrukcje',
                        helpText: 'na temat konfigurowania list niestandardowych.',
                        emptyTitle: 'Dodaj listę niestandardową',
                        fields: {
                            listName: 'Nazwa',
                            internalID: 'Wewnętrzne ID',
                            transactionFieldID: 'Identyfikator pola transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń listę niestandardową',
                        removePrompt: 'Czy na pewno chcesz usunąć tę listę niestandardową?',
                        addForm: {
                            listNameTitle: 'Wybierz listę niestandardową',
                            transactionFieldIDTitle: 'Jaki jest identyfikator pola transakcji?',
                            transactionFieldIDFooter: `Identyfikatory pól transakcji w NetSuite możesz znaleźć, wykonując następujące kroki:

1. Wpisz „Transaction Line Fields” w globalnym wyszukiwaniu.
2. Kliknij wybraną listę niestandardową.
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
                        label: 'Domyślny pracownik NetSuite',
                        description: 'Nie zaimportowano do Expensify, zastosowane przy eksporcie',
                        footerContent: (importField: string) =>
                            `Jeśli używasz ${importField} w NetSuite, zastosujemy domyślną wartość ustawioną w rekordzie pracownika podczas eksportu do raportu wydatków lub zapisu w dzienniku.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tagi',
                        description: 'Poziom pozycji liniowej',
                        footerContent: (importField: string) => `${startCase(importField)} będzie można wybrać dla każdego pojedynczego wydatku w raporcie pracownika.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Pola raportu',
                        description: 'Poziom raportu',
                        footerContent: (importField: string) => `Zaznaczenie ${startCase(importField)} zostanie zastosowane do wszystkich wydatków w raporcie pracownika.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Konfiguracja Sage Intacct',
            prerequisitesTitle: 'Zanim się połączysz...',
            downloadExpensifyPackage: 'Pobierz pakiet Expensify dla Sage Intacct',
            followSteps: 'Postępuj zgodnie z krokami w naszej instrukcji „Jak połączyć się z Sage Intacct”',
            enterCredentials: 'Wprowadź swoje dane logowania do Sage Intacct',
            entity: 'Jednostka',
            employeeDefault: 'Domyślne ustawienie pracownika Sage Intacct',
            employeeDefaultDescription: 'Domyślny dział pracownika zostanie zastosowany do jego wydatków w Sage Intacct, jeśli istnieje.',
            displayedAsTagDescription: 'Dział będzie można wybrać osobno dla każdego wydatku w raporcie pracownika.',
            displayedAsReportFieldDescription: 'Wybór działu zostanie zastosowany do wszystkich wydatków w raporcie pracownika.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wybierz, jak obsługiwać Sage Intacct <strong>${mappingTitle}</strong> w Expensify.`,
            expenseTypes: 'Typy wydatków',
            expenseTypesDescription: 'Typy wydatków z Sage Intacct zostaną zaimportowane do Expensify jako kategorie.',
            accountTypesDescription: 'Twój plan kont Sage Intacct zostanie zaimportowany do Expensify jako kategorie.',
            importTaxDescription: 'Importuj stawkę podatku od zakupów z Sage Intacct.',
            userDefinedDimensions: 'Zdefiniowane przez użytkownika wymiary',
            addUserDefinedDimension: 'Dodaj zdefiniowany przez użytkownika wymiar',
            integrationName: 'Nazwa integracji',
            dimensionExists: 'Wymiar o tej nazwie już istnieje.',
            removeDimension: 'Usuń zdefiniowany przez użytkownika wymiar',
            removeDimensionPrompt: 'Czy na pewno chcesz usunąć ten zdefiniowany przez użytkownika wymiar?',
            userDefinedDimension: 'Wymiar zdefiniowany przez użytkownika',
            addAUserDefinedDimension: 'Dodaj zdefiniowany przez użytkownika wymiar',
            detailedInstructionsLink: 'Zobacz szczegółowe instrukcje',
            detailedInstructionsRestOfSentence: 'przy dodawaniu wymiarów zdefiniowanych przez użytkownika.',
            userDimensionsAdded: () => ({
                one: 'Dodano 1 UDD',
                other: (count: number) => `Dodano ${count} polecenia zapłaty UDD`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'działy';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'zajęcia';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'lokalizacje';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'klienci';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projekty (zlecenia)';
                    default:
                        return 'mapowania';
                }
            },
        },
        type: {
            free: 'Darmowy',
            control: 'Sterowanie',
            collect: 'Zbierz',
        },
        companyCards: {
            addCards: 'Dodaj karty',
            selectCards: 'Wybierz karty',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Nie można wczytać kanałów kart',
                workspaceFeedsCouldNotBeLoadedMessage: 'Wystąpił błąd podczas ładowania kanałów kart w przestrzeni roboczej. Spróbuj ponownie lub skontaktuj się ze swoim administratorem.',
                feedCouldNotBeLoadedTitle: 'Nie udało się wczytać tego kanału',
                feedCouldNotBeLoadedMessage: 'Wystąpił błąd podczas ładowania tego kanału. Spróbuj ponownie lub skontaktuj się z administratorem.',
                tryAgain: 'Spróbuj ponownie',
            },
            addNewCard: {
                other: 'Inne',
                cardProviders: {
                    gl1025: 'Karty korporacyjne American Express',
                    cdf: 'Firmowe karty Mastercard',
                    vcf: 'Firmowe karty Visa',
                    stripe: 'Karty Stripe',
                },
                yourCardProvider: `Kto jest wystawcą Twojej karty?`,
                whoIsYourBankAccount: 'Jaki jest Twój bank?',
                whereIsYourBankLocated: 'Gdzie znajduje się Twój bank?',
                howDoYouWantToConnect: 'W jaki sposób chcesz połączyć się ze swoim bankiem?',
                learnMoreAboutOptions: `<muted-text>Dowiedz się więcej o tych <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opcjach</a>.</muted-text>`,
                commercialFeedDetails: 'Wymaga konfiguracji z Twoim bankiem. Zwykle jest używana przez większe firmy i często jest najlepszą opcją, jeśli się kwalifikujesz.',
                commercialFeedPlaidDetails: `Wymaga konfiguracji z Twoim bankiem, ale przeprowadzimy Cię przez ten proces. Zwykle jest dostępne tylko dla większych firm.`,
                directFeedDetails: 'Najprostsze podejście. Połącz się od razu, używając swoich głównych danych logowania. Ta metoda jest najczęściej stosowana.',
                enableFeed: {
                    title: (provider: string) => `Włącz swój kanał ${provider}`,
                    heading:
                        'Mamy bezpośrednią integrację z wystawcą Twojej karty i możemy szybko oraz dokładnie zaimportować dane Twoich transakcji do Expensify.\n\nAby rozpocząć, po prostu:',
                    visa: 'Mamy globalne integracje z Visa, choć kwalifikowalność zależy od banku i programu karty.\n\nAby rozpocząć, po prostu:',
                    mastercard: 'Mamy globalne integracje z Mastercard, choć kwalifikowalność zależy od banku i programu kart.\n\nAby rozpocząć, po prostu:',
                    vcf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby uzyskać szczegółowe instrukcje dotyczące konfiguracji kart Visa Commercial.

2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby potwierdzić, że obsługuje on firmowy kanał danych dla Twojego programu, i poproś o jego włączenie.

3. *Gdy kanał zostanie włączony i będziesz mieć jego dane, przejdź do następnego ekranu.*`,
                    gl1025: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), aby sprawdzić, czy American Express może włączyć komercyjny kanał dla Twojego programu.

2. Gdy kanał zostanie włączony, Amex wyśle Ci list produkcyjny.

3. *Gdy masz już informacje o kanale, przejdź do następnego ekranu.*`,
                    cdf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby uzyskać szczegółowe instrukcje dotyczące konfiguracji kart Mastercard Commercial Cards.

2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby potwierdzić, że obsługuje on firmowy kanał danych dla Twojego programu i poprosić o jego włączenie.

3. *Gdy kanał danych zostanie włączony i będziesz mieć jego szczegóły, przejdź do następnego ekranu.*`,
                    stripe: `1. Odwiedź pulpit Stripe i przejdź do [Ustawienia](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. W sekcji Integracje produktów kliknij Włącz obok Expensify.

3. Gdy kanał zostanie włączony, kliknij poniżej Wyślij i zajmiemy się jego dodaniem.`,
                },
                whatBankIssuesCard: 'Który bank wydaje te karty?',
                enterNameOfBank: 'Wpisz nazwę banku',
                feedDetails: {
                    vcf: {
                        title: 'Jakie są szczegóły kanału Visa?',
                        processorLabel: 'Identyfikator procesora',
                        bankLabel: 'Identyfikator instytucji finansowej (banku)',
                        companyLabel: 'ID firmy',
                        helpLabel: 'Gdzie znajdę te identyfikatory?',
                    },
                    gl1025: {
                        title: `Jak nazywa się plik dostawy Amex?`,
                        fileNameLabel: 'Nazwa pliku dostawy',
                        helpLabel: 'Gdzie mogę znaleźć nazwę pliku dostawy?',
                    },
                    cdf: {
                        title: `Jaki jest identyfikator dystrybucji Mastercard?`,
                        distributionLabel: 'Identyfikator dystrybucji',
                        helpLabel: 'Gdzie znajdę identyfikator dystrybucji?',
                    },
                },
                amexCorporate: 'Wybierz tę opcję, jeśli na przedniej stronie Twoich kart widnieje napis „Corporate”',
                amexBusiness: 'Zaznacz to, jeśli na przodzie Twoich kart widnieje napis „Business”',
                amexPersonal: 'Wybierz to, jeśli Twoje karty są prywatne',
                error: {
                    pleaseSelectProvider: 'Wybierz dostawcę karty przed kontynuowaniem',
                    pleaseSelectBankAccount: 'Wybierz konto bankowe przed kontynuowaniem',
                    pleaseSelectBank: 'Wybierz bank przed kontynuowaniem',
                    pleaseSelectCountry: 'Wybierz kraj przed kontynuowaniem',
                    pleaseSelectFeedType: 'Wybierz typ kanału przed kontynuowaniem',
                },
                exitModal: {
                    title: 'Coś nie działa?',
                    prompt: 'Zauważyliśmy, że nie dokończono dodawania kart. Jeśli napotkano jakiś problem, daj nam znać, abyśmy mogli pomóc wszystko przywrócić na właściwe tory.',
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
            commercialFeed: 'Kanał komercyjny',
            feedName: (feedName: string) => `Karty ${feedName}`,
            directFeed: 'Bezpośredni kanał',
            whoNeedsCardAssigned: 'Kto potrzebuje przypisanej karty?',
            chooseTheCardholder: 'Wybierz posiadacza karty',
            chooseCard: 'Wybierz kartę',
            chooseCardFor: (assignee: string) => `Wybierz kartę dla <strong>${assignee}</strong>. Nie możesz znaleźć karty, której szukasz? <concierge-link>Daj nam znać.</concierge-link>`,
            noActiveCards: 'Brak aktywnych kart w tym kanale',
            somethingMightBeBroken:
                '<muted-text><centered-text>Albo coś może być zepsute. Tak czy inaczej, jeśli masz jakieś pytania, po prostu <concierge-link>skontaktuj się z Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wybierz datę początkową transakcji',
            startDateDescription: 'Wybierz datę rozpoczęcia importu. Zsynchronizujemy wszystkie transakcje od tego dnia.',
            editStartDateDescription: 'Wybierz nową datę początkową transakcji. Zsynchronizujemy wszystkie transakcje od tej daty wzwyż, z wyłączeniem tych, które już zaimportowaliśmy.',
            fromTheBeginning: 'Od początku',
            customStartDate: 'Niestandardowa data początkowa',
            customCloseDate: 'Niestandardowa data zamknięcia',
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
            confirmationDescription: 'Natychmiast rozpoczniemy importowanie transakcji.',
            card: 'Karta',
            cardName: 'Nazwa karty',
            brokenConnectionError: '<rbr>Połączenie z kartą jest przerwane. Proszę <a href="#">zalogować się do swojego banku</a>, abyśmy mogli ponownie nawiązać połączenie.</rbr>',
            assignedCard: (assignee: string, link: string) => `przypisał(-a) ${assignee} ${link}! Zaimportowane transakcje pojawią się na tym czacie.`,
            companyCard: 'karta firmowa',
            chooseCardFeed: 'Wybierz źródło karty',
            ukRegulation:
                'Expensify Limited jest agentem Plaid Financial Ltd., autoryzowanej instytucji płatniczej regulowanej przez Financial Conduct Authority na podstawie Payment Services Regulations 2017 (numer referencyjny firmy: 804718). Plaid świadczy Ci regulowane usługi dostępu do informacji o rachunku za pośrednictwem Expensify Limited jako swojego agenta.',
            assignCardFailedError: 'Przypisanie karty nie powiodło się.',
            unassignCardFailedError: 'Odłączenie karty nie powiodło się.',
            cardAlreadyAssignedError: 'Ta karta jest już przypisana do użytkownika w innej przestrzeni roboczej.',
            importTransactions: {
                title: 'Importuj transakcje z pliku',
                description: 'Dostosuj ustawienia dla swojego pliku, które zostaną zastosowane podczas importu.',
                cardDisplayName: 'Nazwa wyświetlana karty',
                currency: 'Waluta',
                transactionsAreReimbursable: 'Transakcje podlegają zwrotowi',
                flipAmountSign: 'Odwróć znak kwoty',
                importButton: 'Importuj transakcje',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Wydawaj i zarządzaj swoimi kartami Expensify',
            getStartedIssuing: 'Zacznij od wydania swojej pierwszej wirtualnej lub fizycznej karty.',
            verificationInProgress: 'Weryfikacja w toku...',
            verifyingTheDetails: 'Weryfikujemy kilka szczegółów. Concierge poinformuje Cię, gdy karty Expensify będą gotowe do wydania.',
            disclaimer:
                'Komercyjna karta Expensify Visa® jest wydawana przez The Bancorp Bank, N.A., członka FDIC, na podstawie licencji udzielonej przez Visa U.S.A. Inc. i może nie być akceptowana u wszystkich sprzedawców, którzy przyjmują karty Visa. Apple® i logo Apple® są znakami towarowymi Apple Inc., zarejestrowanymi w USA i innych krajach. App Store jest znakiem usługowym Apple Inc. Google Play i logo Google Play są znakami towarowymi Google LLC.',
            euUkDisclaimer:
                'Karty wydawane mieszkańcom EOG są emitowane przez Transact Payments Malta Limited, a karty wydawane mieszkańcom Zjednoczonego Królestwa są emitowane przez Transact Payments Limited na podstawie licencji udzielonej przez Visa Europe Limited. Transact Payments Malta Limited jest należycie upoważniona i nadzorowana przez Malta Financial Services Authority jako instytucja finansowa na mocy Financial Institution Act 1994. Numer rejestracyjny C 91879. Transact Payments Limited jest upoważniona i nadzorowana przez Gibraltar Financial Service Commission.',
            issueCard: 'Wydaj kartę',
            findCard: 'Znajdź kartę',
            newCard: 'Nowa karta',
            name: 'Nazwa',
            lastFour: 'Ostatnie 4',
            limit: 'Limit',
            currentBalance: 'Bieżące saldo',
            currentBalanceDescription: 'Bieżące saldo to suma wszystkich zaksięgowanych transakcji kartą Expensify, które miały miejsce od ostatniej daty rozliczenia.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Saldo zostanie rozliczone w dniu ${settlementDate}`,
            settleBalance: 'Ureguluj saldo',
            cardLimit: 'Limit karty',
            remainingLimit: 'Pozostały limit',
            requestLimitIncrease: 'Zwiększ limit żądań',
            remainingLimitDescription:
                'Bierzemy pod uwagę kilka czynników przy obliczaniu Twojego pozostałego limitu: staż jako klient, informacje biznesowe podane podczas rejestracji oraz dostępne środki na koncie firmowym. Twój pozostały limit może zmieniać się każdego dnia.',
            earnedCashback: 'Zwrot gotówki',
            earnedCashbackDescription: 'Saldo zwrotu gotówki opiera się na rozliczonych miesięcznych wydatkach kartą Expensify w całej Twojej przestrzeni roboczej.',
            issueNewCard: 'Wydaj nową kartę',
            finishSetup: 'Zakończ konfigurację',
            chooseBankAccount: 'Wybierz konto bankowe',
            chooseExistingBank: 'Wybierz istniejące firmowe konto bankowe, aby spłacić saldo karty Expensify, lub dodaj nowe konto bankowe',
            accountEndingIn: 'Konto kończące się na',
            addNewBankAccount: 'Dodaj nowe konto bankowe',
            settlementAccount: 'Konto rozliczeniowe',
            settlementAccountDescription: 'Wybierz konto, z którego spłacisz saldo karty Expensify.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Upewnij się, że to konto jest takie samo jak <a href="${reconciliationAccountSettingsLink}">konto do uzgadniania</a> (${accountNumber}), aby Ciągłe uzgadnianie działało poprawnie.`,
            settlementFrequency: 'Częstotliwość rozliczeń',
            settlementFrequencyDescription: 'Wybierz, jak często będziesz spłacać saldo karty Expensify.',
            settlementFrequencyInfo: 'Jeśli chcesz przejść na miesięczne rozliczenie, musisz podłączyć swoje konto bankowe przez Plaid i mieć dodatnią historię salda z ostatnich 90 dni.',
            frequency: {
                daily: 'Codziennie',
                monthly: 'Miesięcznie',
            },
            cardDetails: 'Dane karty',
            cardPending: ({name}: {name: string}) => `Karta jest obecnie w oczekiwaniu i zostanie wydana po zweryfikowaniu konta ${name}.`,
            virtual: 'Wirtualna',
            physical: 'Fizyczny',
            deactivate: 'Dezaktywuj kartę',
            changeCardLimit: 'Zmień limit karty',
            changeLimit: 'Zmień limit',
            smartLimitWarning: (limit: number | string) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane, dopóki nie zaakceptujesz na niej kolejnych wydatków.`,
            monthlyLimitWarning: (limit: number | string) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane aż do następnego miesiąca.`,
            fixedLimitWarning: (limit: number | string) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje zostaną odrzucone.`,
            changeCardLimitType: 'Zmień typ limitu karty',
            changeLimitType: 'Zmień typ limitu',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Jeśli zmienisz typ limitu tej karty na Smart Limit, nowe transakcje zostaną odrzucone, ponieważ niezatwierdzony limit ${limit} został już osiągnięty.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Jeśli zmienisz typ limitu tej karty na miesięczny, nowe transakcje zostaną odrzucone, ponieważ miesięczny limit ${limit} został już osiągnięty.`,
            addShippingDetails: 'Dodaj dane wysyłki',
            issuedCard: (assignee: string) => `wydano użytkownikowi ${assignee} kartę Expensify! Karta dotrze w ciągu 2–3 dni roboczych.`,
            issuedCardNoShippingDetails: (assignee: string) => `przyznał(-a) ${assignee} kartę Expensify! Karta zostanie wysłana po potwierdzeniu danych wysyłki.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `wydał(a) użytkownikowi ${assignee} wirtualną kartę Expensify! Z ${link} można korzystać od razu.`,
            addedShippingDetails: (assignee: string) => `${assignee} dodał(a) dane wysyłki. Karta Expensify dotrze w ciągu 2–3 dni roboczych.`,
            replacedCard: (assignee: string) => `${assignee} wymienił(-a) swoją kartę Expensify. Nowa karta dotrze w ciągu 2–3 dni roboczych.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} wymienił(-a) swoją wirtualną kartę Expensify! ${link} można używać od razu.`,
            card: 'karta',
            replacementCard: 'karta zastępcza',
            verifyingHeader: 'Weryfikowanie',
            bankAccountVerifiedHeader: 'Konto bankowe zweryfikowane',
            verifyingBankAccount: 'Weryfikowanie konta bankowego...',
            verifyingBankAccountDescription: 'Poczekaj, aż potwierdzimy, że to konto może być użyte do wydawania kart Expensify.',
            bankAccountVerified: 'Konto bankowe zostało zweryfikowane!',
            bankAccountVerifiedDescription: 'Możesz teraz wydawać karty Expensify członkom swojego obszaru roboczego.',
            oneMoreStep: 'Jeszcze jeden krok…',
            oneMoreStepDescription: 'Wygląda na to, że musimy ręcznie zweryfikować Twoje konto bankowe. Przejdź do Concierge, gdzie czekają na Ciebie dalsze instrukcje.',
            gotIt: 'Rozumiem',
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
            spendCategoriesDescription: 'Dostosuj sposób kategoryzowania wydatków u sprzedawców dla transakcji kartą kredytową i zeskanowanych paragonów.',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania kategorii, spróbuj ponownie',
            categoryName: 'Nazwa kategorii',
            requiresCategory: 'Członkowie muszą kategoryzować wszystkie wydatki',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Wszystkie wydatki muszą zostać skategoryzowane, aby można je było wyeksportować do ${connectionName}.`,
            subtitle: 'Uzyskaj lepszy wgląd w to, gdzie wydawane są pieniądze. Użyj naszych domyślnych kategorii lub dodaj własne.',
            emptyCategories: {
                title: 'Nie utworzyłeś(-aś) żadnych kategorii',
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
            importedFromAccountingSoftware: 'Poniższe kategorie są importowane z Twojego',
            payrollCode: 'Kod płacowy',
            updatePayrollCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu listy płac, spróbuj ponownie',
            glCode: 'Kod księgi głównej',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu GL, spróbuj ponownie',
            importCategories: 'Importuj kategorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Nie można usunąć ani wyłączyć wszystkich kategorii',
                description: `Co najmniej jedna kategoria musi pozostać włączona, ponieważ w Twoim workspace wymagane są kategorie.`,
            },
        },
        moreFeatures: {
            subtitle: 'Użyj poniższych przełączników, aby włączać kolejne funkcje w miarę rozwoju. Każda funkcja pojawi się w menu nawigacji, gdzie będzie można ją dalej dostosować.',
            spendSection: {
                title: 'Wydatki',
                subtitle: 'Włącz funkcje, które pomogą rozwinąć Twój zespół.',
            },
            manageSection: {
                title: 'Zarządzaj',
                subtitle: 'Dodaj kontrolki, które pomogą utrzymać wydatki w budżecie.',
            },
            earnSection: {
                title: 'Zarabiaj',
                subtitle: 'Usprawnij przychody i otrzymuj płatności szybciej.',
            },
            organizeSection: {
                title: 'Organizuj',
                subtitle: 'Grupuj i analizuj wydatki, zapisuj każdy zapłacony podatek.',
            },
            integrateSection: {
                title: 'Integruj',
                subtitle: 'Połącz Expensify z popularnymi produktami finansowymi.',
            },
            distanceRates: {
                title: 'Stawki za dystans',
                subtitle: 'Dodawaj, aktualizuj i egzekwuj stawki.',
            },
            perDiem: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki diet, aby kontrolować dzienne wydatki pracowników.',
            },
            travel: {
                title: 'Podróże',
                subtitle: 'Rezerwuj, zarządzaj i uzgadniaj wszystkie wyjazdy służbowe.',
                getStarted: {
                    title: 'Pierwsze kroki z Expensify Travel',
                    subtitle: 'Potrzebujemy jeszcze tylko kilku informacji o Twojej firmie, a potem będziesz gotowy do startu.',
                    ctaText: 'Zaczynajmy',
                },
                reviewingRequest: {
                    title: 'Spakuj walizki, mamy już Twoje zgłoszenie...',
                    subtitle: 'Obecnie rozpatrujemy Twoją prośbę o włączenie Expensify Travel. Nie martw się, damy Ci znać, gdy będzie gotowe.',
                    ctaText: 'Żądanie wysłane',
                },
                bookOrManageYourTrip: {
                    title: 'Zarezerwuj lub zarządzaj swoją podróżą',
                    subtitle: 'Korzystaj z Expensify Travel, aby uzyskać najlepsze oferty podróży i zarządzać wszystkimi wydatkami służbowymi w jednym miejscu.',
                    ctaText: 'Zarezerwuj lub zarządzaj',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Rezerwacja podróży',
                        subtitle: 'Gratulacje! Wszystko gotowe, aby rezerwować i zarządzać podróżami w tym obszarze roboczym.',
                        manageTravelLabel: 'Zarządzaj podróżami',
                    },
                    centralInvoicingSection: {
                        title: 'Centralne fakturowanie',
                        subtitle: 'Skonsoliduj wszystkie wydatki na podróże w jednym miesięcznym rachunku zamiast płacić w momencie zakupu.',
                        learnHow: 'Dowiedz się jak.',
                        subsections: {
                            currentTravelSpendLabel: 'Aktualne wydatki na podróże',
                            currentTravelSpendCta: 'Spłać saldo',
                            currentTravelLimitLabel: 'Aktualny limit podróży',
                            settlementAccountLabel: 'Konto rozliczeniowe',
                            settlementFrequencyLabel: 'Częstotliwość rozliczeń',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Karta Expensify',
                subtitle: 'Uzyskaj wgląd i kontrolę nad wydatkami.',
                disableCardTitle: 'Wyłącz kartę Expensify',
                disableCardPrompt: 'Nie możesz wyłączyć karty Expensify, ponieważ jest już w użyciu. Skontaktuj się z Concierge, aby poznać kolejne kroki.',
                disableCardButton: 'Czat z Concierge',
                feed: {
                    title: 'Zdobądź kartę Expensify',
                    subTitle: 'Usprawnij rozliczanie wydatków firmowych i zaoszczędź do 50% na rachunku Expensify, a dodatkowo:',
                    features: {
                        cashBack: 'Zwrot gotówki od każdego zakupu w USA',
                        unlimited: 'Nielimitowane karty wirtualne',
                        spend: 'Kontrola wydatków i niestandardowe limity',
                    },
                    ctaTitle: 'Wydaj nową kartę',
                },
            },
            companyCards: {
                title: 'Firmowe karty',
                subtitle: 'Podłącz karty, które już masz.',
                feed: {
                    title: 'Użyj własnych kart (BYOC)',
                    subtitle: 'Połącz karty, które już masz, aby automatycznie importować transakcje, dopasowywać paragony i uzgadniać operacje.',
                    features: {
                        support: 'Podłącz karty z ponad 10 000 banków',
                        assignCards: 'Połącz istniejące karty Twojego zespołu',
                        automaticImport: 'Automatycznie zaimportujemy transakcje',
                    },
                },
                bankConnectionError: 'Problem z połączeniem z bankiem',
                connectWithPlaid: 'połącz przez Plaid',
                connectWithExpensifyCard: 'wypróbuj Kartę Expensify.',
                bankConnectionDescription: `Spróbuj dodać swoje karty ponownie. W przeciwnym razie możesz`,
                disableCardTitle: 'Wyłącz karty firmowe',
                disableCardPrompt: 'Nie możesz wyłączyć kart firmowych, ponieważ ta funkcja jest w użyciu. Skontaktuj się z Concierge, aby poznać kolejne kroki.',
                disableCardButton: 'Czat z Concierge',
                cardDetails: 'Dane karty',
                cardNumber: 'Numer karty',
                cardholder: 'Posiadacz karty',
                cardName: 'Nazwa karty',
                allCards: 'Wszystkie karty',
                assignedCards: 'Przypisano',
                unassignedCards: 'Nieprzypisane',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `eksport ${integration} ${type.toLowerCase()}` : `Eksport z ${integration}`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Wybierz konto ${integration}, do którego mają być eksportowane transakcje.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Wybierz konto ${integration}, do którego mają być eksportowane transakcje. Wybierz inną <a href="${exportPageLink}">opcję eksportu</a>, aby zmienić dostępne konta.`,
                lastUpdated: 'Ostatnia aktualizacja',
                transactionStartDate: 'Data początkowa transakcji',
                updateCard: 'Zaktualizuj kartę',
                unassignCard: 'Cofnij przypisanie karty',
                unassign: 'Cofnij przypisanie',
                unassignCardDescription: 'Odłączenie tej karty spowoduje usunięcie wszystkich transakcji z raportów w wersji roboczej z konta posiadacza karty.',
                assignCard: 'Przypisz kartę',
                cardFeedName: 'Nazwa źródła karty',
                cardFeedNameDescription: 'Nadaj kanałowi karty unikalną nazwę, aby odróżnić go od pozostałych.',
                cardFeedTransaction: 'Usuń transakcje',
                cardFeedTransactionDescription: 'Wybierz, czy posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą podlegały tym zasadom.',
                cardFeedRestrictDeletingTransaction: 'Ogranicz usuwanie transakcji',
                cardFeedAllowDeletingTransaction: 'Zezwól na usuwanie transakcji',
                removeCardFeed: 'Usuń źródło karty',
                removeCardFeedTitle: (feedName: string) => `Usuń strumień ${feedName}`,
                removeCardFeedDescription: 'Na pewno chcesz usunąć ten kanał kart? Spowoduje to odłączenie wszystkich kart.',
                error: {
                    feedNameRequired: 'Nazwa źródła karty jest wymagana',
                    statementCloseDateRequired: 'Wybierz datę zamknięcia wyciągu.',
                },
                corporate: 'Ogranicz usuwanie transakcji',
                personal: 'Zezwól na usuwanie transakcji',
                setFeedNameDescription: 'Nadaj kanałowi karty unikalną nazwę, aby odróżnić go od pozostałych',
                setTransactionLiabilityDescription: 'Po włączeniu posiadacze kart mogą usuwać transakcje kartą. Nowe transakcje będą podlegać tej zasadzie.',
                emptyAddedFeedTitle: 'Brak kart w tym kanale',
                emptyAddedFeedDescription: 'Upewnij się, że w strumieniu kart Twojego banku znajdują się karty.',
                pendingFeedTitle: `Przeglądamy Twoje zgłoszenie…`,
                pendingFeedDescription: `Aktualnie sprawdzamy szczegóły Twojego kanału. Gdy skończymy, skontaktujemy się z Tobą przez`,
                pendingBankTitle: 'Sprawdź okno przeglądarki',
                pendingBankDescription: (bankName: string) => `Połącz się z ${bankName} w oknie przeglądarki, które właśnie się otworzyło. Jeśli żadne się nie otworzyło,`,
                pendingBankLink: 'kliknij tutaj',
                giveItNameInstruction: 'Nadaj karcie nazwę, która odróżni ją od innych.',
                updating: 'Aktualizowanie...',
                neverUpdated: 'Nigdy',
                noAccountsFound: 'Nie znaleziono kont',
                defaultCard: 'Domyślna karta',
                downgradeTitle: `Nie można obniżyć planu przestrzeni roboczej`,
                downgradeSubTitle: `Nie można obniżyć poziomu tej przestrzeni roboczej, ponieważ podłączonych jest wiele źródeł kart (z wyłączeniem kart Expensify). Aby kontynuować, prosimy <a href="#">pozostawić tylko jedno źródło kart</a>.`,
                noAccountsFoundDescription: (connection: string) => `Dodaj konto w ${connection} i zsynchronizuj to połączenie ponownie`,
                expensifyCardBannerTitle: 'Zdobądź kartę Expensify',
                expensifyCardBannerSubtitle:
                    'Korzystaj z cash backu przy każdym zakupie w USA, zniżki do 50% na swój rachunek w Expensify, nielimitowanych kart wirtualnych i wielu innych korzyści.',
                expensifyCardBannerLearnMoreButton: 'Dowiedz się więcej',
                statementCloseDateTitle: 'Data zamknięcia zestawienia',
                statementCloseDateDescription: 'Daj nam znać, kiedy kończy się okres rozliczeniowy Twojej karty, a utworzymy w Expensify pasujące zestawienie.',
            },
            workflows: {
                title: 'Przepływy pracy',
                subtitle: 'Skonfiguruj sposób zatwierdzania i opłacania wydatków.',
                disableApprovalPrompt:
                    'Karty Expensify z tego obszaru roboczego obecnie opierają swoje Inteligentne Limity na procesie zatwierdzania. Zmień typy limitów wszystkich Kart Expensify z Inteligentnymi Limitami przed wyłączeniem zatwierdzania.',
            },
            invoices: {
                title: 'Faktury',
                subtitle: 'Wysyłaj i odbieraj faktury.',
            },
            categories: {
                title: 'Kategorie',
                subtitle: 'Śledź i porządkuj wydatki.',
            },
            tags: {
                title: 'Tagi',
                subtitle: 'Klasyfikuj koszty i śledź wydatki refakturowane.',
            },
            taxes: {
                title: 'Podatki',
                subtitle: 'Udokumentuj i odzyskaj należne podatki.',
            },
            reportFields: {
                title: 'Pola raportu',
                subtitle: 'Skonfiguruj niestandardowe pola dla wydatków.',
            },
            connections: {
                title: 'Księgowość',
                subtitle: 'Synchronizuj swój plan kont i więcej.',
            },
            receiptPartners: {
                title: 'Partnerzy paragonów',
                subtitle: 'Automatycznie importuj paragony.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nie tak szybko...',
                featureEnabledText: 'Aby włączyć lub wyłączyć tę funkcję, musisz zmienić ustawienia importu księgowego.',
                disconnectText: 'Aby wyłączyć księgowość, musisz odłączyć połączenie księgowe od swojego obszaru roboczego.',
                manageSettings: 'Zarządzaj ustawieniami',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Odłącz Uber',
                disconnectText: 'Aby wyłączyć tę funkcję, najpierw odłącz integrację Uber for Business.',
                description: 'Czy na pewno chcesz odłączyć tę integrację?',
                confirmText: 'Rozumiem',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nie tak szybko...',
                featureEnabledText:
                    'Karty Expensify w tym obszarze roboczym opierają się na przepływach zatwierdzania, aby określić ich Inteligentne Limity.\n\nZmień typy limitów wszystkich kart z Inteligentnymi Limitami, zanim wyłączysz przepływy pracy.',
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
            customReportNamesSubtitle: `<muted-text>Dostosuj tytuły raportów, korzystając z naszych <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">rozbudowanych formuł</a>.</muted-text>`,
            customNameTitle: 'Domyślny tytuł raportu',
            customNameDescription: `Wybierz niestandardową nazwę dla raportów wydatków, korzystając z naszych <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">rozbudowanych formuł</a>.`,
            customNameInputLabel: 'Nazwa',
            customNameEmailPhoneExample: 'Adres e-mail lub telefon członka: {report:submit:from}',
            customNameStartDateExample: 'Data początkowa raportu: {report:startdate}',
            customNameWorkspaceNameExample: 'Nazwa przestrzeni roboczej: {report:workspacename}',
            customNameReportIDExample: 'ID raportu: {report:id}',
            customNameTotalExample: 'Suma: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Zabroń członkom zmiany niestandardowych tytułów raportów',
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
                subtitle: 'Dodaj niestandardowe pole (tekstowe, daty lub z listą wyboru), które będzie widoczne w raportach.',
            },
            subtitle: 'Pola raportu mają zastosowanie do wszystkich wydatków i mogą być pomocne, gdy chcesz poprosić o dodatkowe informacje.',
            disableReportFields: 'Wyłącz pola raportu',
            disableReportFieldsConfirmation: 'Na pewno? Pola tekstowe i daty zostaną usunięte, a listy wyłączone.',
            importedFromAccountingSoftware: 'Pola raportu poniżej są importowane z Twojego',
            textType: 'Tekst',
            dateType: 'Data',
            dropdownType: 'Lista',
            formulaType: 'Formuła',
            textAlternateText: 'Dodaj pole dla swobodnego wprowadzania tekstu.',
            dateAlternateText: 'Dodaj kalendarz do wyboru daty.',
            dropdownAlternateText: 'Dodaj listę opcji do wyboru.',
            formulaAlternateText: 'Dodaj pole formuły.',
            nameInputSubtitle: 'Wybierz nazwę dla pola raportu.',
            typeInputSubtitle: 'Wybierz, jakiego typu pola raportu chcesz użyć.',
            initialValueInputSubtitle: 'Wprowadź wartość początkową, która ma zostać wyświetlona w polu raportu.',
            listValuesInputSubtitle: 'Te wartości pojawią się na liście rozwijanej pola raportu. Włączeni członkowie mogą je wybierać.',
            listInputSubtitle: 'Te wartości pojawią się na liście pól raportu. Włączone wartości mogą być wybierane przez członków.',
            deleteValue: 'Usuń wartość',
            deleteValues: 'Usuń wartości',
            disableValue: 'Wyłącz wartość',
            disableValues: 'Wyłącz wartości',
            enableValue: 'Włącz wartość',
            enableValues: 'Włącz wartości',
            emptyReportFieldsValues: {
                title: 'Nie utworzyłeś(-aś) żadnych wartości listy',
                subtitle: 'Dodaj własne wartości, które będą wyświetlane w raportach.',
            },
            deleteValuePrompt: 'Czy na pewno chcesz usunąć tę wartość listy?',
            deleteValuesPrompt: 'Czy na pewno chcesz usunąć te wartości listy?',
            listValueRequiredError: 'Wpisz nazwę wartości listy',
            existingListValueError: 'Wartość listy o tej nazwie już istnieje',
            editValue: 'Edytuj wartość',
            listValues: 'Wymień wartości',
            addValue: 'Dodaj wartość',
            existingReportFieldNameError: 'Pole raportu o tej nazwie już istnieje',
            reportFieldNameRequiredError: 'Wprowadź nazwę pola raportu',
            reportFieldTypeRequiredError: 'Wybierz typ pola raportu',
            circularReferenceError: 'To pole nie może odnosić się do siebie. Zaktualizuj je.',
            reportFieldInitialValueRequiredError: 'Wybierz początkową wartość pola raportu',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania pola raportu. Spróbuj ponownie.',
        },
        tags: {
            tagName: 'Nazwa tagu',
            requiresTag: 'Członkowie muszą otagować wszystkie wydatki',
            trackBillable: 'Śledź fakturowalne wydatki',
            customTagName: 'Niestandardowa nazwa tagu',
            enableTag: 'Włącz tag',
            enableTags: 'Włącz tagi',
            requireTag: 'Wymagaj tagu',
            requireTags: 'Wymagaj etykiet',
            notRequireTags: 'Nie wymagaj',
            disableTag: 'Wyłącz tag',
            disableTags: 'Wyłącz tagi',
            addTag: 'Dodaj tag',
            editTag: 'Edytuj znacznik',
            editTags: 'Edytuj tagi',
            findTag: 'Znajdź tag',
            subtitle: 'Tagi umożliwiają bardziej szczegółowe klasyfikowanie kosztów.',
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Używasz <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">zależnych tagów</a>. Możesz <a href="${importSpreadsheetLink}">ponownie zaimportować arkusz kalkulacyjny</a>, aby zaktualizować swoje tagi.</muted-text>`,
            emptyTags: {
                title: 'Nie utworzono jeszcze żadnych tagów',
                subtitle: 'Dodaj tag, aby śledzić projekty, lokalizacje, działy i inne.',
                subtitleHTML: `<muted-text><centered-text>Dodaj tagi, aby śledzić projekty, lokalizacje, działy i nie tylko. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Dowiedz się więcej</a> o formatowaniu plików tagów do importu.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Twoje tagi są obecnie importowane z połączenia księgowego. Przejdź do sekcji <a href="${accountingPageURL}">Księgowość</a>, aby wprowadzić zmiany.</centered-text></muted-text>`,
            },
            deleteTag: 'Usuń tag',
            deleteTags: 'Usuń tagi',
            deleteTagConfirmation: 'Czy na pewno chcesz usunąć ten tag?',
            deleteTagsConfirmation: 'Czy na pewno chcesz usunąć te tagi?',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania tagu, spróbuj ponownie',
            tagRequiredError: 'Nazwa tagu jest wymagana',
            existingTagError: 'Tag o tej nazwie już istnieje',
            invalidTagNameError: 'Nazwa tagu nie może wynosić 0. Wybierz inną wartość.',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania taga, spróbuj ponownie',
            importedFromAccountingSoftware: 'Tagi są zarządzane w twoim',
            employeesSeeTagsAs: 'Pracownicy widzą tagi jako',
            glCode: 'Kod księgi głównej',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu GL, spróbuj ponownie',
            tagRules: 'Zasady tagów',
            approverDescription: 'Osoba zatwierdzająca',
            importTags: 'Importuj tagi',
            importTagsSupportingText: 'Oznaczaj wydatki jednym typem taga lub wieloma.',
            configureMultiLevelTags: 'Skonfiguruj swoją listę tagów do tagowania wielopoziomowego.',
            importMultiLevelTagsSupportingText: `Oto podgląd Twoich tagów. Jeśli wszystko wygląda dobrze, kliknij poniżej, aby je zaimportować.`,
            importMultiLevelTags: {
                firstRowTitle: 'Pierwszy wiersz jest tytułem każdej listy tagów',
                independentTags: 'To są niezależne tagi',
                glAdjacentColumn: 'W sąsiedniej kolumnie znajduje się kod GL',
            },
            tagLevel: {
                singleLevel: 'Pojedynczy poziom tagów',
                multiLevel: 'Wielopoziomowe tagi',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Przełącz poziomy tagów',
                prompt1: 'Zmiana poziomów tagów spowoduje usunięcie wszystkich obecnych tagów.',
                prompt2: 'Najpierw sugerujemy, abyś',
                prompt3: 'pobierz kopię zapasową',
                prompt4: 'eksportując swoje tagi.',
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
                description: `Co najmniej jeden znacznik musi pozostać włączony, ponieważ Twoje środowisko pracy wymaga znaczników.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Nie można ustawić wszystkich tagów jako opcjonalnych',
                description: `Co najmniej jeden tag musi pozostać wymagany, ponieważ ustawienia Twojego workspace’u wymagają tagów.`,
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
                taxRateAlreadyExists: 'Ta nazwa podatku jest już w użyciu',
                taxCodeAlreadyExists: 'Ten kod podatkowy jest już w użyciu',
                valuePercentageRange: 'Wprowadź prawidłowy procent w przedziale od 0 do 100',
                customNameRequired: 'Niestandardowa nazwa podatku jest wymagana',
                deleteFailureMessage: 'Wystąpił błąd podczas usuwania stawki podatku. Spróbuj ponownie lub poproś Concierge o pomoc.',
                updateFailureMessage: 'Wystąpił błąd podczas aktualizowania stawki podatku. Spróbuj ponownie lub poproś Concierge o pomoc.',
                createFailureMessage: 'Wystąpił błąd podczas tworzenia stawki podatku. Spróbuj ponownie lub poproś Concierge o pomoc.',
                updateTaxClaimableFailureMessage: 'Część podlegająca zwrotowi musi być mniejsza niż kwota stawki za przejazd',
            },
            deleteTaxConfirmation: 'Czy na pewno chcesz usunąć ten podatek?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Czy na pewno chcesz usunąć podatek ${taxAmount}?`,
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
            updateTaxCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu podatkowego, spróbuj ponownie',
        },
        duplicateWorkspace: {
            title: 'Nadaj nazwę swojemu nowemu workspace’owi',
            selectFeatures: 'Wybierz funkcje do skopiowania',
            whichFeatures: 'Które funkcje chcesz skopiować do swojego nowego obszaru roboczego?',
            confirmDuplicate: 'Czy chcesz kontynuować?',
            categories: 'kategorie i Twoje reguły automatycznego kategoryzowania',
            reimbursementAccount: 'konto zwrotów',
            welcomeNote: 'Proszę, zacznij używać mojego nowego obszaru roboczego',
            delayedSubmission: 'opóźnione przesłanie',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Za chwilę utworzysz i udostępnisz ${newWorkspaceName ?? ''} ${totalMembers ?? 0} członkom oryginalnego obszaru roboczego.`,
            error: 'Wystąpił błąd podczas duplikowania Twojego nowego obszaru roboczego. Spróbuj ponownie.',
        },
        emptyWorkspace: {
            title: 'Nie masz żadnych przestrzeni roboczych',
            subtitle: 'Śledź paragony, rozliczaj wydatki, zarządzaj podróżami, wysyłaj faktury i wiele więcej.',
            createAWorkspaceCTA: 'Rozpocznij',
            features: {
                trackAndCollect: 'Śledź i zbieraj paragony',
                reimbursements: 'Zwroć wydatki pracownikom',
                companyCards: 'Zarządzaj kartami firmowymi',
            },
            notFound: 'Nie znaleziono żadnej przestrzeni roboczej',
            description: 'Pokoje to świetne miejsce do dyskusji i współpracy z wieloma osobami. Aby rozpocząć współpracę, utwórz lub dołącz do przestrzeni roboczej',
        },
        new: {
            newWorkspace: 'Nowa przestrzeń robocza',
            getTheExpensifyCardAndMore: 'Zdobądź kartę Expensify i więcej',
            confirmWorkspace: 'Potwierdź przestrzeń roboczą',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Moja grupa robocza${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace użytkownika ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Wystąpił błąd podczas usuwania członka z przestrzeni roboczej, spróbuj ponownie',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Czy na pewno chcesz usunąć ${memberName}?`,
                other: 'Czy na pewno chcesz usunąć tych członków?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} jest osobą zatwierdzającą w tym obszarze roboczym. Gdy przestaniesz udostępniać im ten obszar roboczy, zastąpimy ich w procesie zatwierdzania właścicielem obszaru roboczego, ${ownerName}`,
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
                one: 'Nadaj status członka',
                other: 'Utwórz członków',
            }),
            makeAdmin: () => ({
                one: 'Ustaw jako administratora',
                other: 'Ustaw jako administratorów',
            }),
            makeAuditor: () => ({
                one: 'Ustaw jako audytora',
                other: 'Utwórz audytorów',
            }),
            selectAll: 'Zaznacz wszystko',
            error: {
                genericAdd: 'Wystąpił problem z dodaniem tego członka przestrzeni roboczej',
                cannotRemove: 'Nie możesz usunąć siebie ani właściciela przestrzeni roboczej',
                genericRemove: 'Wystąpił problem z usunięciem tego członka przestrzeni roboczej',
            },
            addedWithPrimary: 'Niektóre osoby zostały dodane za pomocą swoich głównych loginów.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Dodane przez dodatkowy login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Łączna liczba członków przestrzeni roboczej: ${count}`,
            importMembers: 'Zaimportuj członków',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${approver} z tego obszaru roboczego, zastąpimy tę osobę w procesie zatwierdzania przez ${workspaceOwner}, właściciela obszaru roboczego.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} ma zaległe raporty wydatków do zatwierdzenia. Poproś tę osobę o ich zatwierdzenie lub przejmij kontrolę nad jej raportami, zanim usuniesz ją z przestrzeni roboczej.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Nie możesz usunąć ${memberName} z tego przestrzeni roboczej. Ustaw nową osobę zwracającą wydatki w Workflows > Make or track payments, a następnie spróbuj ponownie.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${memberName} z tej przestrzeni roboczej, zastąpimy go jako preferowanego eksportującego użytkownikiem ${workspaceOwner}, właścicielem przestrzeni roboczej.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${memberName} z tej przestrzeni roboczej, zastąpimy tę osobę jako kontakt techniczny użytkownikiem ${workspaceOwner}, właścicielem przestrzeni roboczej.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} ma nierozliczony raport w trakcie przetwarzania, który wymaga działania. Poproś tę osobę o wykonanie wymaganej czynności przed jej usunięciem z przestrzeni roboczej.`,
        },
        card: {
            getStartedIssuing: 'Zacznij od wydania swojej pierwszej wirtualnej lub fizycznej karty.',
            issueCard: 'Wydaj kartę',
            issueNewCard: {
                whoNeedsCard: 'Kto potrzebuje karty?',
                inviteNewMember: 'Zaproś nowego członka',
                findMember: 'Znajdź członka',
                chooseCardType: 'Wybierz typ karty',
                physicalCard: 'Fizyczna karta',
                physicalCardDescription: 'Idealne dla osób często wydających',
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
                cardLimitError: 'Wprowadź kwotę mniejszą niż 21 474 836 USD',
                giveItName: 'Nadaj temu nazwę',
                giveItNameInstruction: 'Uczyń ją na tyle unikalną, by dało się ją odróżnić od innych kart. Jeszcze lepsze są konkretne przypadki użycia!',
                cardName: 'Nazwa karty',
                letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
                willBeReadyToUse: 'Ta karta będzie gotowa do użycia od razu.',
                willBeReadyToShip: 'Ta karta będzie gotowa do natychmiastowej wysyłki.',
                cardholder: 'Posiadacz karty',
                cardType: 'Typ karty',
                limit: 'Limit',
                limitType: 'Typ limitu',
                disabledApprovalForSmartLimitError: 'Przed skonfigurowaniem inteligentnych limitów włącz zatwierdzanie w <strong>Przepływy pracy > Dodaj zatwierdzenia</strong>',
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
            subtitle: 'Połącz się ze swoim systemem księgowym, aby kategoryzować transakcje za pomocą planu kont, automatycznie dopasowywać płatności i utrzymywać finanse w synchronizacji.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Porozmawiaj ze swoim specjalistą ds. konfiguracji.',
            talkYourAccountManager: 'Porozmawiaj ze swoim opiekunem konta.',
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
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Ostatnia synchronizacja ${relativeDate}`,
            notSync: 'Nie zsynchronizowano',
            import: 'Importuj',
            export: 'Eksportuj',
            advanced: 'Zaawansowane',
            other: 'Inne',
            syncNow: 'Synchronizuj teraz',
            disconnect: 'Rozłącz',
            reinstall: 'Zainstaluj ponownie konektor',
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
                        return 'Nie można połączyć się z Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Nie można połączyć się z NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Nie można połączyć z QuickBooks Desktop';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Zaimportowano jako pola raportu',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Domyślny pracownik NetSuite',
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
                    description: '<muted-text><centered-text>Nowy w Xero? Klienci Expensify otrzymują 6 miesięcy za darmo. Odbierz swoją ofertę poniżej.</centered-text></muted-text>',
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
                            return 'Trwa synchronizowanie danych z QuickBooks… Upewnij się, że Web Connector jest uruchomiony';
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
                            return 'Oznaczanie raportów Expensify jako zrekompensowane';
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
                            return 'Importowanie danych jako tagi Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Aktualizowanie informacji o połączeniu';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Oznaczanie raportów Expensify jako zrekompensowane';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Oznaczanie rachunków i faktur NetSuite jako opłaconych';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importowanie dostawców';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importowanie list niestandardowych';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importowanie list niestandardowych';
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
                            return `Brak tłumaczenia dla etapu: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Preferowany eksporter',
            exportPreferredExporterNote:
                'Preferowanym eksporterem może być dowolny administrator przestrzeni roboczej, ale musi on również być administratorem domeny, jeśli w Ustawieniach domeny ustawisz różne konta eksportu dla poszczególnych kart firmowych.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy w swoim koncie raporty do eksportu.',
            exportAs: 'Eksportuj jako',
            exportOutOfPocket: 'Eksportuj wydatki z własnej kieszeni jako',
            exportCompanyCard: 'Eksportuj wydatki z firmowej karty jako',
            exportDate: 'Data eksportu',
            defaultVendor: 'Domyślny dostawca',
            autoSync: 'Automatyczna synchronizacja',
            autoSyncDescription: 'Synchronizuj NetSuite i Expensify automatycznie, każdego dnia. Eksportuj sfinalizowany raport w czasie rzeczywistym',
            reimbursedReports: 'Synchronizuj rozliczone raporty',
            cardReconciliation: 'Uzgadnianie karty',
            reconciliationAccount: 'Konto rozliczeniowe',
            continuousReconciliation: 'Ciągłe uzgadnianie',
            saveHoursOnReconciliation:
                'Oszczędzaj godziny przy każdej zamknięciu okresu rozliczeniowego, powierzając Expensify ciągłe uzgadnianie wyciągów i rozliczeń karty Expensify Card w Twoim imieniu.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Aby włączyć ciągłe uzgadnianie, włącz proszę <a href="${accountingAdvancedSettingsLink}">auto-sync</a> dla ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wybierz konto bankowe, z którym będą uzgadniane płatności Twoją kartą Expensify.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Upewnij się, że to konto jest takie samo jak <a href="${settlementAccountUrl}">konto rozliczeniowe karty Expensify</a> (kończące się na ${lastFourPAN}), aby Ciągłe Uzgadnianie działało poprawnie.`,
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
                payingAsIndividual: 'Płacę jako osoba prywatna',
                payingAsBusiness: 'Płacę jako firma',
            },
            invoiceBalance: 'Saldo faktury',
            invoiceBalanceSubtitle: 'To jest Twój aktualny stan środków z zebranych płatności za faktury. Zostanie on automatycznie przelany na Twoje konto bankowe, jeśli je dodałeś(-aś).',
            bankAccountsSubtitle: 'Dodaj konto bankowe, aby wysyłać i otrzymywać płatności za faktury.',
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
            inviteMessagePrompt: 'Uczyń swoje zaproszenie jeszcze bardziej wyjątkowym, dodając poniżej wiadomość!',
            personalMessagePrompt: 'Wiadomość',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Spróbuj ponownie.',
            inviteNoMembersError: 'Wybierz co najmniej jednego członka do zaproszenia',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} poprosił(a) o dołączenie do ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nie tak szybko...',
            workspaceNeeds: 'Miejsce pracy musi mieć włączoną co najmniej jedną stawkę za dystans.',
            distance: 'Dystans',
            centrallyManage: 'Centralnie zarządzaj stawkami, śledź w milach lub kilometrach i ustaw domyślną kategorię.',
            rate: 'Oceń',
            addRate: 'Dodaj stawkę',
            findRate: 'Znajdź kurs',
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
                '<muted-text>Aby korzystać z tej funkcji, włącz podatki w przestrzeni roboczej. Przejdź do sekcji <a href="#">Więcej funkcji</a>, aby to zmienić.</muted-text>',
            deleteDistanceRate: 'Usuń stawkę za dystans',
            areYouSureDelete: () => ({
                one: 'Na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }),
            errors: {
                rateNameRequired: 'Nazwa stawki jest wymagana',
                existingRateName: 'Stawka za odległość o tej nazwie już istnieje',
            },
        },
        editor: {
            descriptionInputLabel: 'Opis',
            nameInputLabel: 'Nazwa',
            typeInputLabel: 'Typ',
            initialValueInputLabel: 'Wartość początkowa',
            nameInputHelpText: 'To jest nazwa, którą zobaczysz w swoim obszarze roboczym.',
            nameIsRequiredError: 'Musisz nadać swojej przestrzeni roboczej nazwę',
            currencyInputLabel: 'Domyślna waluta',
            currencyInputHelpText: 'Wszystkie wydatki w tym obszarze roboczym zostaną przeliczone na tę walutę.',
            currencyInputDisabledText: (currency: string) => `Domyślnej waluty nie można zmienić, ponieważ to miejsce pracy jest połączone z kontem bankowym w ${currency}.`,
            save: 'Zapisz',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania przestrzeni roboczej. Spróbuj ponownie.',
            avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Spróbuj ponownie.',
            addressContext: 'Adres miejsca pracy jest wymagany, aby włączyć Expensify Travel. Wprowadź adres powiązany z Twoją firmą.',
            policy: 'Polityka wydatków',
        },
        bankAccount: {
            continueWithSetup: 'Kontynuuj konfigurację',
            youAreAlmostDone: 'Prawie zakończyłeś konfigurację konta bankowego, które pozwoli Ci wydawać firmowe karty, zwracać wydatki, pobierać faktury i opłacać rachunki.',
            streamlinePayments: 'Usprawnij płatności',
            connectBankAccountNote: 'Uwaga: kont osobistych nie można używać do płatności w przestrzeniach roboczych.',
            oneMoreThing: 'Jeszcze jedna rzecz!',
            allSet: 'Wszystko gotowe!',
            accountDescriptionWithCards: 'To konto bankowe będzie używane do wydawania kart firmowych, zwrotu wydatków, pobierania faktur i opłacania rachunków.',
            letsFinishInChat: 'Dokończmy to na czacie!',
            finishInChat: 'Zakończ na czacie',
            almostDone: 'Prawie gotowe!',
            disconnectBankAccount: 'Odłącz konto bankowe',
            startOver: 'Zacznij od nowa',
            updateDetails: 'Zaktualizuj szczegóły',
            yesDisconnectMyBankAccount: 'Tak, odłącz moje konto bankowe',
            yesStartOver: 'Tak, zacznij od nowa',
            disconnectYourBankAccount: (bankName: string) =>
                `Odłącz swoje konto bankowe <strong>${bankName}</strong>. Wszystkie nierozliczone transakcje dla tego konta nadal zostaną zrealizowane.`,
            clearProgress: 'Rozpoczęcie od nowa usunie dotychczasowy postęp.',
            areYouSure: 'Czy na pewno?',
            workspaceCurrency: 'Waluta przestrzeni roboczej',
            updateCurrencyPrompt: 'Wygląda na to, że Twoje środowisko pracy jest obecnie ustawione na inną walutę niż USD. Kliknij przycisk poniżej, aby teraz zmienić walutę na USD.',
            updateToUSD: 'Zaktualizuj na USD',
            updateWorkspaceCurrency: 'Zaktualizuj walutę przestrzeni roboczej',
            workspaceCurrencyNotSupported: 'Waluta przestrzeni roboczej nie jest obsługiwana',
            yourWorkspace: `Twoje miejsce pracy jest ustawione na nieobsługiwaną walutę. Zobacz <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">listę obsługiwanych walut</a>.`,
            chooseAnExisting: 'Wybierz istniejące konto bankowe do opłacania wydatków lub dodaj nowe.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Przenieś właściciela',
            addPaymentCardTitle: 'Wprowadź swoją kartę płatniczą, aby przenieść własność',
            addPaymentCardButtonText: 'Zaakceptuj warunki i dodaj kartę płatniczą',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Przeczytaj i zaakceptuj <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">warunki</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">politykę prywatności</a>, aby dodać swoją kartę.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Zgodne ze standardem PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Szyfrowanie na poziomie bankowym',
            addPaymentCardRedundant: 'Redundantna infrastruktura',
            addPaymentCardLearnMore: `<muted-text>Dowiedz się więcej o naszym <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">zabezpieczeniu</a>.</muted-text>`,
            amountOwedTitle: 'Zaległe saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Na tym koncie pozostało nieuregulowane saldo z poprzedniego miesiąca.\n\nCzy chcesz wyczyścić saldo i przejąć rozliczanie tego obszaru roboczego?',
            ownerOwesAmountTitle: 'Zaległe saldo',
            ownerOwesAmountButtonText: 'Przenieś saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Konto będące właścicielem tego przestrzeni roboczej (${email}) ma zaległe saldo z poprzedniego miesiąca.

Czy chcesz przelać tę kwotę (${amount}), aby przejąć rozliczanie za tę przestrzeń roboczą? Twoja karta płatnicza zostanie obciążona natychmiast.`,
            subscriptionTitle: 'Przejmij roczną subskrypcję',
            subscriptionButtonText: 'Przenieś subskrypcję',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Przejęcie tego obszaru roboczego połączy jego roczną subskrypcję z Twoją obecną subskrypcją. Zwiększy to rozmiar Twojej subskrypcji o ${usersCount} członków, co da nowy rozmiar subskrypcji ${finalCount}. Czy chcesz kontynuować?`,
            duplicateSubscriptionTitle: 'Alert o zduplikowanej subskrypcji',
            duplicateSubscriptionButtonText: 'Kontynuuj',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Wygląda na to, że próbujesz przejąć rozliczenia za przestrzenie robocze użytkownika ${email}, ale żeby to zrobić, musisz najpierw być administratorem wszystkich jego przestrzeni roboczych.

Kliknij „Kontynuuj”, jeśli chcesz przejąć rozliczenia tylko za przestrzeń roboczą ${workspaceName}.

Jeśli chcesz przejąć rozliczenia za całą ich subskrypcję, poproś ich najpierw o dodanie Cię jako administratora do wszystkich ich przestrzeni roboczych, a dopiero potem przejmij rozliczenia.`,
            hasFailedSettlementsTitle: 'Nie można przenieść własności',
            hasFailedSettlementsButtonText: 'Rozumiem',
            hasFailedSettlementsText: (email: string) =>
                `Nie możesz przejąć rozliczeń, ponieważ ${email} ma zaległe rozliczenie karty Expensify Card. Poproś tę osobę o kontakt z concierge@expensify.com w celu rozwiązania problemu. Następnie będziesz mógł/mogła przejąć rozliczenia dla tego obszaru roboczego.`,
            failedToClearBalanceTitle: 'Nie udało się wyczyścić salda',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Nie udało się wyczyścić salda. Spróbuj ponownie później.',
            successTitle: 'Juhu! Gotowe.',
            successDescription: 'Jesteś teraz właścicielem tego workspace’u.',
            errorTitle: 'Ups! Nie tak szybko...',
            errorDescription: `<muted-text><centered-text>Wystąpił problem z przeniesieniem własności tego workspace’u. Spróbuj ponownie lub <concierge-link>skontaktuj się z Concierge</concierge-link>, aby uzyskać pomoc.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Uwaga!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Następujące raporty zostały już wyeksportowane do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Czy na pewno chcesz wyeksportować je ponownie?`,
            confirmText: 'Tak, wyeksportuj ponownie',
            cancelText: 'Anuluj',
        },
        upgrade: {
            reportFields: {
                title: 'Pola raportu',
                description: `Pola raportu pozwalają określić szczegóły na poziomie nagłówka, inne niż tagi odnoszące się do wydatków w poszczególnych pozycjach. Te szczegóły mogą obejmować konkretne nazwy projektów, informacje o podróżach służbowych, lokalizacje i inne.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Pola raportu są dostępne tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Korzystaj z automatycznej synchronizacji i ograniczaj ręczne wprowadzanie danych dzięki integracji Expensify + NetSuite. Uzyskaj dogłębny, aktualny w czasie rzeczywistym wgląd w finanse dzięki obsłudze natywnych i niestandardowych segmentów, w tym mapowaniu projektów i klientów.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z NetSuite jest dostępna tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Korzystaj z automatycznej synchronizacji i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + Sage Intacct. Zyskaj szczegółowy, aktualny w czasie rzeczywistym wgląd finansowy z użyciem zdefiniowanych przez użytkownika wymiarów, a także kategoryzowanie wydatków według działu, klasy, lokalizacji, klienta i projektu (zadania).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Integracja z Sage Intacct jest dostępna tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Korzystaj z automatycznej synchronizacji i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + QuickBooks Desktop. Zyskaj maksymalną wydajność dzięki dwukierunkowemu połączeniu w czasie rzeczywistym oraz kategoryzacji wydatków według klasy, pozycji, klienta i projektu.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z QuickBooks Desktop jest dostępna wyłącznie w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Zaawansowane zatwierdzanie',
                description: `Jeśli chcesz dodać więcej poziomów akceptacji – albo po prostu upewnić się, że największe wydatki zostaną przejrzane przez kolejną osobę – mamy na to rozwiązanie. Zaawansowane zatwierdzanie pomaga wdrożyć odpowiednie mechanizmy kontrolne na każdym poziomie, aby utrzymać wydatki zespołu pod kontrolą.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Zaawansowane zatwierdzanie jest dostępne tylko w planie Control, który zaczyna się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            categories: {
                title: 'Kategorie',
                description: 'Kategorie pozwalają śledzić i porządkować wydatki. Skorzystaj z naszych domyślnych kategorii lub dodaj własne.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorie są dostępne w planie Collect, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            glCodes: {
                title: 'Kody księgi głównej',
                description: `Dodaj kody GL do swoich kategorii i tagów, aby łatwo eksportować wydatki do systemów księgowych i kadrowo‑płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody GL są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Konta księgi głównej i kody płacowe',
                description: `Dodaj kody GL i płacowe do swoich kategorii, aby łatwo eksportować wydatki do systemów księgowych i kadrowo-płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody GL i płacowe są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Kody podatkowe',
                description: `Dodaj kody podatkowe do swoich podatków, aby łatwo eksportować wydatki do systemów księgowych i kadrowo‑płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody podatkowe są dostępne tylko w planie Control, rozpoczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            companyCards: {
                title: 'Nielimitowana liczba kart firmowych',
                description: `Potrzebujesz dodać więcej źródeł kart? Odblokuj nielimitowane firmowe karty, aby synchronizować transakcje od wszystkich głównych wydawców kart.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Ta funkcja jest dostępna tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            rules: {
                title: 'Zasady',
                description: `Reguły działają w tle i utrzymują Twoje wydatki pod kontrolą, żebyś nie musiał(-a) przejmować się drobiazgami.

Wymagaj szczegółów wydatków, takich jak paragony i opisy, ustawiaj limity i wartości domyślne oraz automatyzuj akceptacje i płatności – wszystko w jednym miejscu.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reguły są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            perDiem: {
                title: 'Dieta',
                description:
                    'Ryczałt dzienny to świetny sposób, aby koszty podróży służbowych pracowników były zgodne z zasadami i przewidywalne. Korzystaj z funkcji takich jak własne stawki, domyślne kategorie oraz bardziej szczegółowe dane, na przykład miejsca docelowe i podstawkowania.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Diety są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            travel: {
                title: 'Podróże',
                description:
                    'Expensify Travel to nowa platforma korporacyjna do rezerwacji i zarządzania podróżami służbowymi, która umożliwia członkom rezerwację noclegów, lotów, transportu i nie tylko.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Podróże są dostępne w planie Collect, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            reports: {
                title: 'Raporty',
                description: 'Raporty pozwalają grupować wydatki, aby ułatwić ich śledzenie i organizację.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Raporty są dostępne w planie Collect, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Wielopoziomowe tagi',
                description:
                    'Wielopoziomowe tagi pomagają śledzić wydatki z większą dokładnością. Przypisz wiele tagów do każdej pozycji – takich jak dział, klient lub centrum kosztów – aby uchwycić pełny kontekst każdego wydatku. Umożliwia to bardziej szczegółowe raportowanie, obiegi zatwierdzania i eksporty do systemów księgowych.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Wielopoziomowe tagi są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Stawki za dystans',
                description: 'Twórz i zarządzaj własnymi stawkami, śledź przejechany dystans w milach lub kilometrach i ustawiaj domyślne kategorie dla wydatków za przejazdy.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Stawki za przejazdy są dostępne w planie Collect, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            auditor: {
                title: 'Audytor',
                description: 'Biegli rewidentci otrzymują dostęp tylko do odczytu do wszystkich raportów, aby zapewnić pełną widoczność i monitorowanie zgodności.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Audytorzy są dostępni tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Wiele poziomów zatwierdzania',
                description:
                    'Wiele poziomów akceptacji to narzędzie do obsługi workflow dla firm, które wymagają, aby więcej niż jedna osoba zatwierdziła raport, zanim zostanie on rozliczony.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Wiele poziomów zatwierdzania jest dostępnych tylko w planie Control, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'na aktywnego członka miesięcznie.',
                perMember: 'za użytkownika miesięcznie.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Uaktualnij, aby uzyskać dostęp do tej funkcji, lub <a href="${subscriptionLink}">dowiedz się więcej</a> o naszych planach i cenach.</muted-text>`,
            upgradeToUnlock: 'Odblokuj tę funkcję',
            completed: {
                headline: `Zaktualizowano Twoją przestrzeń roboczą!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Udało Ci się uaktualnić ${policyName} do planu Control! <a href="${subscriptionLink}">Wyświetl swoją subskrypcję</a>, aby uzyskać więcej szczegółów.</centered-text>`,
                categorizeMessage: `Pomyślnie uaktualniono do planu Collect. Teraz możesz kategoryzować swoje wydatki!`,
                travelMessage: `Pomyślnie uaktualniono do planu Collect. Teraz możesz zacząć rezerwować i zarządzać podróżami!`,
                distanceRateMessage: `Pomyślnie zmieniono plan na Collect. Teraz możesz zmienić stawkę za przejazd!`,
                gotIt: 'Jasne, dzięki',
                createdWorkspace: `Utworzono przestrzeń roboczą!`,
            },
            commonFeatures: {
                title: 'Ulepsz do planu Control',
                note: 'Odblokuj nasze najpotężniejsze funkcje, w tym:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Plan Control zaczyna się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `na aktywnego członka miesięcznie.`} <a href="${learnMoreMethodsRoute}">Dowiedz się więcej</a> o naszych planach i cenach.</muted-text>`,
                    benefit1: 'Zaawansowane połączenia księgowe (NetSuite, Sage Intacct i inne)',
                    benefit2: 'Inteligentne reguły wydatków',
                    benefit3: 'Wielopoziomowe przepływy zatwierdzania',
                    benefit4: 'Zaawansowane mechanizmy zabezpieczeń',
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
                note: 'Jeśli przejdziesz na niższy plan, utracisz dostęp do tych funkcji i wielu innych:',
                benefits: {
                    note: 'Aby zobaczyć pełne porównanie naszych planów, sprawdź nasz',
                    pricingPage: 'strona cenowa',
                    confirm: 'Czy na pewno chcesz obniżyć plan i usunąć swoje konfiguracje?',
                    warning: 'Tej operacji nie można cofnąć.',
                    benefit1: 'Połączenia księgowe (z wyjątkiem QuickBooks Online i Xero)',
                    benefit2: 'Inteligentne reguły wydatków',
                    benefit3: 'Wielopoziomowe przepływy zatwierdzania',
                    benefit4: 'Zaawansowane mechanizmy zabezpieczeń',
                    headsUp: 'Uwaga!',
                    multiWorkspaceNote:
                        'Przed pierwszą miesięczną płatnością musisz obniżyć pakiet wszystkich swoich przestrzeni roboczych, aby rozpocząć subskrypcję w taryfie Collect. Kliknij',
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
            title: 'Zapłać i zdegraduj',
            headline: 'Twoja ostatnia płatność',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Twój końcowy rachunek za tę subskrypcję wyniesie <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Zobacz swoje podsumowanie poniżej dla ${date}:`,
            subscription:
                'Uwaga! Ta akcja zakończy Twoją subskrypcję Expensify, usunie ten obszar roboczy i usunie wszystkich jego członków. Jeśli chcesz zachować ten obszar roboczy i usunąć tylko siebie, poproś innego administratora, aby najpierw przejął rozliczenia.',
            genericFailureMessage: 'Wystąpił błąd podczas opłacania Twojego rachunku. Spróbuj ponownie.',
        },
        restrictedAction: {
            restricted: 'Ograniczone',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Działania w przestrzeni roboczej ${workspaceName} są obecnie ograniczone`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Właściciel przestrzeni roboczej, ${workspaceOwnerName}, musi dodać lub zaktualizować zapisaną kartę płatniczą, aby odblokować nową aktywność w przestrzeni roboczej.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Aby odblokować nowe działania w przestrzeni roboczej, musisz dodać lub zaktualizować zapisaną kartę płatniczą.',
            addPaymentCardToUnlock: 'Dodaj kartę płatniczą, aby odblokować!',
            addPaymentCardToContinueUsingWorkspace: 'Dodaj kartę płatniczą, aby dalej korzystać z tego workspace’u',
            pleaseReachOutToYourWorkspaceAdmin: 'W razie pytań skontaktuj się z administratorem swojego obszaru roboczego.',
            chatWithYourAdmin: 'Czat z administratorem',
            chatInAdmins: 'Czat na kanale #admins',
            addPaymentCard: 'Dodaj kartę płatniczą',
            goToSubscription: 'Przejdź do subskrypcji',
        },
        rules: {
            individualExpenseRules: {
                title: 'Wydatki',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Ustaw kontrolę wydatków i domyślne wartości dla pojedynczych wydatków. Możesz też tworzyć reguły dla <a href="${categoriesPageLink}">kategorii</a> i <a href="${tagsPageLink}">tagów</a>.</muted-text>`,
                receiptRequiredAmount: 'Wymagana kwota paragonu',
                receiptRequiredAmountDescription: 'Wymagaj paragonów, gdy wydatek przekracza tę kwotę, chyba że zastąpi to reguła kategorii.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Kwota nie może być większa niż wymagana kwota z wyszczególnionego paragonu (${amount})`,
                itemizedReceiptRequiredAmount: 'Wymagana kwota z wyszczególnionego paragonu',
                itemizedReceiptRequiredAmountDescription: 'Wymagaj zindywidualizowanych paragonów, gdy wydatki przekraczają tę kwotę, chyba że zastąpi to reguła kategorii.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Kwota nie może być niższa niż kwota wymagana dla zwykłych paragonów (${amount})`,
                maxExpenseAmount: 'Maksymalna kwota wydatku',
                maxExpenseAmountDescription: 'Oznacz wydatki przekraczające tę kwotę, chyba że zastąpi to reguła kategorii.',
                maxAge: 'Maksymalny wiek',
                maxExpenseAge: 'Maksymalny wiek wydatku',
                maxExpenseAgeDescription: 'Oznaczaj wydatki starsze niż określona liczba dni.',
                maxExpenseAgeDays: () => ({
                    one: '1 dzień',
                    other: (count: number) => `${count} dni`,
                }),
                cashExpenseDefault: 'Domyślny wydatek gotówkowy',
                cashExpenseDefaultDescription:
                    'Wybierz, w jaki sposób mają być tworzone wydatki gotówkowe. Wydatek jest uznawany za wydatek gotówkowy, jeśli nie jest zaimportowaną transakcją z firmowej karty. Obejmuje to ręcznie utworzone wydatki, paragony, diety, wydatki za przejechany dystans oraz wydatki za czas.',
                reimbursableDefault: 'Podlegające zwrotowi',
                reimbursableDefaultDescription: 'Wydatki są najczęściej zwracane pracownikom',
                nonReimbursableDefault: 'Nierefundowane',
                nonReimbursableDefaultDescription: 'Koszty są sporadycznie zwracane pracownikom',
                alwaysReimbursable: 'Zawsze podlegające zwrotowi',
                alwaysReimbursableDescription: 'Wydatki są zawsze zwracane pracownikom',
                alwaysNonReimbursable: 'Zawsze niepodlegające zwrotowi',
                alwaysNonReimbursableDescription: 'Wydatki nigdy nie są zwracane pracownikom',
                billableDefault: 'Domyślne obciążenie klienta',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Wybierz, czy wydatki gotówkowe i kartą kredytową mają być domyślnie fakturowalne. Fakturowanie wydatków jest włączane lub wyłączane w <a href="${tagsPageLink}">tagach</a>.</muted-text>`,
                billable: 'Fakturowalne',
                billableDescription: 'Wydatki są najczęściej refakturowane klientom',
                nonBillable: 'Nierozliczalne',
                nonBillableDescription: 'Wydatki są okazjonalnie refakturowane klientom',
                eReceipts: 'eParagony',
                eReceiptsHint: `eParagony są automatycznie tworzone [dla większości transakcji kartą kredytową w USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Śledzenie uczestników',
                attendeeTrackingHint: 'Śledź koszt na osobę dla każdego wydatku.',
                prohibitedDefaultDescription:
                    'Oznacz paragony, na których występują alkohol, hazard lub inne zabronione pozycje. Wydatki z paragonami zawierającymi takie pozycje będą wymagały ręcznego sprawdzenia.',
                prohibitedExpenses: 'Wydatki niedozwolone',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Dodatkowe opłaty hotelowe',
                gambling: 'Hazard',
                tobacco: 'Tytoń',
                adultEntertainment: 'Rozrywka dla dorosłych',
                requireCompanyCard: 'Wymagaj kart służbowych dla wszystkich zakupów',
                requireCompanyCardDescription: 'Oznacz wszystkie wydatki gotówkowe, w tym koszty za przejechane kilometry i ryczałty dzienne.',
            },
            expenseReportRules: {
                title: 'Zaawansowane',
                subtitle: 'Zautomatyzuj zgodność raportów wydatków, ich zatwierdzanie i płatności.',
                preventSelfApprovalsTitle: 'Zabroń samoakceptacji',
                preventSelfApprovalsSubtitle: 'Uniemożliwij członkom przestrzeni roboczej zatwierdzanie własnych raportów wydatków.',
                autoApproveCompliantReportsTitle: 'Automatycznie zatwierdzaj zgodne raporty',
                autoApproveCompliantReportsSubtitle: 'Skonfiguruj, które raporty wydatków kwalifikują się do automatycznego zatwierdzania.',
                autoApproveReportsUnderTitle: 'Automatycznie zatwierdzaj raporty poniżej',
                autoApproveReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty zostaną zatwierdzone automatycznie.',
                randomReportAuditTitle: 'Losowa kontrola raportów',
                randomReportAuditDescription: 'Wymagaj ręcznego zatwierdzania niektórych raportów, nawet jeśli kwalifikują się do automatycznego zatwierdzenia.',
                autoPayApprovedReportsTitle: 'Automatycznie opłacaj zatwierdzone raporty',
                autoPayApprovedReportsSubtitle: 'Skonfiguruj, które raporty wydatków kwalifikują się do automatycznej płatności.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Wprowadź kwotę mniejszą niż ${currency ?? ''}20 000`,
                autoPayApprovedReportsLockedSubtitle: 'Przejdź do „Więcej funkcji” i włącz Workflows, a następnie dodaj płatności, aby odblokować tę funkcję.',
                autoPayReportsUnderTitle: 'Automatycznie opłacaj raporty w ramach',
                autoPayReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty zostaną opłacone automatycznie.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Dodaj ${featureName}, aby odblokować tę funkcję.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Przejdź do [więcej funkcji](${moreFeaturesLink}) i włącz ${featureName}, aby odblokować tę funkcję.`,
            },
            merchantRules: {
                title: 'Sprzedawca',
                subtitle: 'Skonfiguruj reguły dla sprzedawców, aby wydatki trafiały z prawidłowym kodowaniem i wymagały mniej poprawek.',
                addRule: 'Dodaj regułę dla sprzedawcy',
                addRuleTitle: 'Dodaj regułę',
                editRuleTitle: 'Edytuj regułę',
                expensesWith: 'Dla wydatków z:',
                expensesExactlyMatching: 'Dla wydatków dokładnie pasujących do:',
                applyUpdates: 'Zastosuj te aktualizacje:',
                saveRule: 'Zapisz regułę',
                previewMatches: 'Podgląd dopasowań',
                confirmError: 'Wprowadź sprzedawcę i zastosuj co najmniej jedną zmianę',
                confirmErrorMerchant: 'Wprowadź sprzedawcę',
                confirmErrorUpdate: 'Zastosuj co najmniej jedną aktualizację',
                previewMatchesEmptyStateTitle: 'Brak danych do wyświetlenia',
                previewMatchesEmptyStateSubtitle: 'Żadne niewysłane wydatki nie pasują do tej reguły.',
                deleteRule: 'Usuń regułę',
                deleteRuleConfirmation: 'Czy na pewno chcesz usunąć tę regułę?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Jeśli sprzedawca ${isExactMatch ? 'dokładnie pasuje' : 'zawiera'} „${merchantName}”`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Zmień nazwę sprzedawcy na „${merchantName}”`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Zaktualizuj ${fieldName} na „${fieldValue}”`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Oznacz jako „${reimbursable ? 'podlegające zwrotowi' : 'bez zwrotu kosztów'}”`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Oznacz jako „${billable ? 'rozliczalny' : 'niepodlegające fakturowaniu'}”`,
                matchType: 'Typ dopasowania',
                matchTypeContains: 'Zawiera',
                matchTypeExact: 'Dokładnie pasuje',
                duplicateRuleTitle: 'Podobna reguła dla sprzedawcy już istnieje',
                duplicateRulePrompt: (merchantName: string) => `Czy chcesz zapisać nową regułę dla „${merchantName}”, mimo że masz już istniejącą?`,
                saveAnyway: 'Zapisz mimo to',
                applyToExistingUnsubmittedExpenses: 'Zastosuj do istniejących niewysłanych wydatków',
            },
            categoryRules: {
                title: 'Reguły kategorii',
                approver: 'Osoba zatwierdzająca',
                requireDescription: 'Wymagaj opisu',
                requireFields: 'Wymagaj pól',
                requiredFieldsTitle: 'Pola wymagane',
                requiredFieldsDescription: (categoryName: string) => `Zostanie to zastosowane do wszystkich wydatków zaklasyfikowanych jako <strong>${categoryName}</strong>.`,
                requireAttendees: 'Wymagaj uczestników',
                descriptionHint: 'Podpowiedź opisu',
                descriptionHintDescription: (categoryName: string) =>
                    `Przypominaj pracownikom o podaniu dodatkowych informacji dla wydatków w kategorii „${categoryName}”. Ta podpowiedź pojawi się w polu opisu wydatków.`,
                descriptionHintLabel: 'Podpowiedź',
                descriptionHintSubtitle: 'Wskazówka: im krócej, tym lepiej!',
                maxAmount: 'Maksymalna kwota',
                flagAmountsOver: 'Oznaczaj kwoty powyżej',
                flagAmountsOverDescription: (categoryName: string) => `Dotyczy kategorii „${categoryName}”.`,
                flagAmountsOverSubtitle: 'To zastępuje maksymalną kwotę dla wszystkich wydatków.',
                expenseLimitTypes: {
                    expense: 'Pojedynczy wydatek',
                    expenseSubtitle: 'Oznaczaj kwoty wydatków według kategorii. Ta reguła zastępuje ogólną regułę maksymalnej kwoty wydatku dla przestrzeni roboczej.',
                    daily: 'Suma kategorii',
                    dailySubtitle: 'Oznaczaj łączną dzienną kwotę wydatków według kategorii dla każdego raportu wydatków.',
                },
                requireReceiptsOver: 'Wymagaj paragonów powyżej',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Domyślne`,
                    never: 'Nigdy nie wymagaj paragonów',
                    always: 'Zawsze wymagaj paragonów',
                },
                requireItemizedReceiptsOver: 'Wymagaj wyszczegółowionych paragonów powyżej',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Domyślne`,
                    never: 'Nigdy nie wymagaj wyszczególnionych paragonów',
                    always: 'Zawsze wymagaj zewidencjonowanych paragonów',
                },
                defaultTaxRate: 'Domyślna stawka podatku',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Przejdź do [Więcej funkcji](${moreFeaturesLink}) i włącz przepływy pracy, a następnie dodaj zatwierdzenia, aby odblokować tę funkcję.`,
            },
            customRules: {
                title: 'Polityka wydatków',
                cardSubtitle: 'To tutaj znajduje się polityka wydatków Twojego zespołu, aby wszyscy mieli jasność co do tego, co jest objęte.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Zbierz',
                    description: 'Dla zespołów, które chcą zautomatyzować swoje procesy.',
                },
                corporate: {
                    label: 'Sterowanie',
                    description: 'Dla organizacji z zaawansowanymi wymaganiami.',
                },
            },
            description: 'Wybierz plan odpowiedni dla siebie. Szczegółową listę funkcji i cen znajdziesz w naszej',
            subscriptionLink: 'strona pomocy dotycząca typów planów i cen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Zobowiązałeś(-aś) się do 1 aktywnego członka w planie Control do końca rocznej subskrypcji ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję z rozliczaniem za użycie i zmienić plan na Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
                other: `Zobowiązałeś(-aś) się do ${count} aktywnych członków w planie Control do końca rocznej subskrypcji ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję płatną za użycie i zmienić plan na Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
            }),
            subscriptions: 'Subskrypcje',
        },
    },
    getAssistancePage: {
        title: 'Uzyskaj pomoc',
        subtitle: 'Jesteśmy tu, aby torować Ci drogę do wielkości!',
        description: 'Wybierz jedną z poniższych opcji pomocy:',
        chatWithConcierge: 'Czat z Concierge',
        scheduleSetupCall: 'Umów rozmowę wdrożeniową',
        scheduleACall: 'Zaplanuj rozmowę',
        questionMarkButtonTooltip: 'Uzyskaj pomoc od naszego zespołu',
        exploreHelpDocs: 'Przeglądaj centrum pomocy',
        registerForWebinar: 'Zarejestruj się na webinar',
        onboardingHelp: 'Pomoc przy wdrażaniu',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Zmień domyślny odcień skóry',
        headers: {
            frequentlyUsed: 'Często używane',
            smileysAndEmotion: 'Emotikony i emocje',
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
        roomNameInvalidError: 'Nazwy pokojów mogą zawierać tylko małe litery, cyfry i łączniki',
        pleaseEnterRoomName: 'Wprowadź nazwę pokoju',
        pleaseSelectWorkspace: 'Wybierz przestrzeń roboczą',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}zmieniono nazwę na „${newName}” (wcześniej „${oldName}”)` : `${actor} zmienił(a) nazwę tego pokoju na „${newName}” (wcześniej „${oldName}”)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Pokój zmieniono na ${newName}`,
        social: 'społeczny',
        selectAWorkspace: 'Wybierz przestrzeń roboczą',
        growlMessageOnRenameError: 'Nie można zmienić nazwy pokoju w przestrzeni roboczej. Sprawdź połączenie i spróbuj ponownie.',
        visibilityOptions: {
            restricted: 'Przestrzeń robocza',
            private: 'Prywatne',
            public: 'Public',
            public_announce: 'Publiczne ogłoszenie',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Przekaż i zamknij',
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
            `usunął domyślne firmowe konto bankowe „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}”`,
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
            previousAddress ? `zmieniono adres firmy na „${newAddress}” (poprzednio „${previousAddress}”)` : `ustaw adres firmy na „${newAddress}”`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `dodano ${approverName} (${approverEmail}) jako osobę zatwierdzającą dla pola ${field} „${name}”`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `usunięto ${approverName} (${approverEmail}) jako osobę zatwierdzającą dla pola ${field} „${name}”`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `zmieniono akceptującego dla pola ${field} „${name}” na ${formatApprover(newApproverName, newApproverEmail)} (wcześniej ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `dodano kategorię „${categoryName}”`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `usunięto kategorię „${categoryName}”`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'wyłączone' : 'włączone'} kategorię „${categoryName}”`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodano kod płacowy „${newValue}” do kategorii „${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `usunięto kod płacowy „${oldValue}” z kategorii „${categoryName}”`;
            }
            return `zmienił(a) kod płacowy kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodano kod KG „${newValue}” do kategorii „${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `usunął(-ę) kod GL „${oldValue}” z kategorii „${categoryName}”`;
            }
            return `zmienił(a) kod GL kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `zmienił opis kategorii „${categoryName}” na ${!oldValue ? 'wymagane' : 'niewymagane'} (wcześniej ${!oldValue ? 'niewymagane' : 'wymagane'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `dodano maksymalną kwotę ${newAmount} do kategorii „${categoryName}”`;
            }
            if (oldAmount && !newAmount) {
                return `usunął(-ę) maksymalną kwotę ${oldAmount} z kategorii „${categoryName}”`;
            }
            return `zmieniono maksymalną kwotę dla kategorii „${categoryName}” na ${newAmount} (wcześniej ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `dodano typ limitu ${newValue} do kategorii „${categoryName}”`;
            }
            return `zmienił(a) typ limitu kategorii „${categoryName}” na ${newValue} (wcześniej ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `zaktualizowano kategorię „${categoryName}”, zmieniając paragony na ${newValue}`;
            }
            return `zmieniono kategorię „${categoryName}” na ${newValue} (wcześniej ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `zaktualizowano kategorię „${categoryName}”, zmieniając Pozycjonowane paragony na ${newValue}`;
            }
            return `zmienił(a) pozycjonowanie paragonów dla kategorii „${categoryName}” na ${newValue} (wcześniej ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmieniono nazwę kategorii „${oldName}” na „${newName}”`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `usunięto podpowiedź opisu „${oldValue}” z kategorii „${categoryName}”`;
            }
            return !oldValue
                ? `dodano podpowiedź opisu „${newValue}” do kategorii „${categoryName}”`
                : `zmienił(-a) podpowiedź opisu kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmienił(a) nazwę listy tagów na „${newName}” (wcześniej „${oldName}”)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `dodano tag „${tagName}” do listy „${tagListName}”`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `zaktualizowano listę tagów „${tagListName}”, zmieniając tag „${oldName}” na „${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'włączone' : 'wyłączone'} znacznik „${tagName}” na liście „${tagListName}”`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `usunięto znacznik „${tagName}” z listy „${tagListName}”`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `usunięto „${count}” tagów z listy „${tagListName}”`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `zaktualizowano znacznik „${tagName}” na liście „${tagListName}”, zmieniając ${updatedField} na „${newValue}” (wcześniej „${oldValue}”)`;
            }
            return `zaktualizowano znacznik „${tagName}” na liście „${tagListName}”, dodając ${updatedField} o wartości „${newValue}”`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `zmienił(a) ${updatedField} jednostki ${customUnitName} na „${newValue}” (wcześniej „${oldValue}”)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'włączone' : 'wyłączone'} śledzenie podatku dla stawek za dystans`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `dodano nową stawkę „${rateName}” dla jednostki „${customUnitName}”`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `zmienił(a) stawkę ${customUnitName} ${updatedField} „${customUnitRateName}” na „${newValue}” (wcześniej „${oldValue}”)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `zmienił(a) stawkę podatku w stawce za dystans „${customUnitRateName}” na „${newValue} (${newTaxPercentage})” (poprzednio „${oldValue} (${oldTaxPercentage})”)`;
            }
            return `dodano stawkę podatku „${newValue} (${newTaxPercentage})” do stawki za dystans „${customUnitRateName}”`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `zmieniono zwrotną podatkowo część stawki za dystans „${customUnitRateName}” na „${newValue}” (wcześniej „${oldValue}”)`;
            }
            return `dodano część podatku podlegającą zwrotowi w wysokości „${newValue}” do stawki za dystans „${customUnitRateName}`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'włączone' : 'wyłączone'} stawkę jednostki niestandardowej ${customUnitName} „${customUnitRateName}”`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `usunięto stawkę „${rateName}” jednostki „${customUnitName}”`,
        addedReportField: (fieldType: string, fieldName?: string) => `dodano pole raportu ${fieldType} „${fieldName}”`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) => `ustaw domyślną wartość pola raportu „${fieldName}” na „${defaultValue}”`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `dodano opcję „${optionName}” do pola raportu „${fieldName}”`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `usunął opcję „${optionName}” z pola raportu „${fieldName}”`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'włączone' : 'wyłączone'} opcję „${optionName}” dla pola raportu „${fieldName}”`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'włączone' : 'wyłączone'} wszystkie opcje dla pola raportu „${fieldName}”`;
            }
            return `${allEnabled ? 'włączone' : 'wyłączone'} opcję „${optionName}” dla pola raportu „${fieldName}”, ustawiając wszystkie opcje jako ${allEnabled ? 'włączone' : 'wyłączone'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `usunięto pole raportu ${fieldType} „${fieldName}”`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `zaktualizowano „Zapobiegaj samodzielnemu zatwierdzaniu” na „${newValue === 'true' ? 'Włączone' : 'Wyłączone'}” (wcześniej „${oldValue === 'true' ? 'Włączone' : 'Wyłączone'}”)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `ustaw miesięczną datę przesyłania raportu na „${newValue}”`;
            }
            return `zaktualizowano termin przesyłania comiesięcznego raportu na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano „Refakturowanie wydatków klientom” na „${newValue}” (wcześniej „${oldValue}”)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano „Domyślne wydatki gotówkowe” na „${newValue}” (wcześniej „${oldValue}”)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `włączył(a) „Wymuszaj domyślne tytuły raportów” ${value ? 'włączony' : 'wyłączone'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zmieniono formułę nazwy raportu niestandardowego na „${newValue}” (wcześniej „${oldValue}”)`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `zaktualizowano nazwę tego obszaru roboczego na „${newName}” (wcześniej „${oldName}”)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription ? `ustaw opis tego obszaru roboczego na „${newDescription}”` : `zaktualizowano opis tego workspace’u na „${newDescription}” (wcześniej „${oldDescription}”)`,
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
                one: `usunął Cię z procesu zatwierdzania ${joinedNames} i czatu wydatków. Wcześniej przesłane raporty pozostaną dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
                other: `usunął(-ę) Cię z obiegów akceptacji i czatów kosztowych użytkownika ${joinedNames}. Wcześniej przesłane raporty pozostaną dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `zaktualizowano Twoją rolę w ${policyName} z ${oldRole} na użytkownika. Zostałeś usunięty ze wszystkich czatów wydatków osób rozliczających się, z wyjątkiem własnego czatu.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `zaktualizowano domyślną walutę na ${newCurrency} (wcześniej ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `zaktualizowano częstotliwość automatycznego raportowania na „${newFrequency}” (poprzednio „${oldFrequency}”)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `zaktualizowano tryb zatwierdzania na „${newValue}” (wcześniej „${oldValue}”)`,
        upgradedWorkspace: 'zaktualizowano ten workspace do planu Control',
        forcedCorporateUpgrade: `Ta przestrzeń robocza została zaktualizowana do planu Control. Kliknij <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">tutaj</a>, aby uzyskać więcej informacji.`,
        downgradedWorkspace: 'zmniejszono plan tego workspace’u do Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `zmienił(a) odsetek raportów losowo kierowanych do ręcznej akceptacji na ${Math.round(newAuditRate * 100)}% (wcześniej ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `zmienił(a) ręczny limit zatwierdzania dla wszystkich wydatków na ${newLimit} (wcześniej ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'włączone' : 'wyłączone'} kategorie`;
                case 'tags':
                    return `${enabled ? 'włączone' : 'wyłączone'} etykiety`;
                case 'workflows':
                    return `Procesy ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'distance rates':
                    return `stawki za odległość ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'accounting':
                    return `${enabled ? 'włączone' : 'wyłączone'} księgowość`;
                case 'Expensify Cards':
                    return `Karty Expensify ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'company cards':
                    return `${enabled ? 'włączone' : 'wyłączone'} karty służbowe`;
                case 'invoicing':
                    return `Fakturowanie ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'per diem':
                    return `${enabled ? 'włączone' : 'wyłączone'} diety`;
                case 'receipt partners':
                    return `Partnerzy paragonów ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'rules':
                    return `Zasady ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'tax tracking':
                    return `Śledzenie podatku ${enabled ? 'włączone' : 'wyłączone'}`;
                default:
                    return `${enabled ? 'włączone' : 'wyłączone'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `Śledzenie uczestników ${enabled ? 'włączone' : 'wyłączone'}`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'włączone' : 'wyłączone'} automatycznie opłaconych zatwierdzonych raportów`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `ustaw próg automatycznych płatności zatwierdzonych raportów na „${newLimit}”`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `zmieniono próg automatycznej akceptacji raportów do „${newLimit}” (wcześniej „${oldLimit}”)`,
        removedAutoPayApprovedReportsLimit: 'usunął próg automatycznego opłacania zatwierdzonych raportów',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `zmienił(a) domyślnego zatwierdzającego na ${newApprover} (wcześniej ${previousApprover})` : `zmieniono domyślnego akceptującego na ${newApprover}`,
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
            let text = `zmienił(a) proces zatwierdzania dla ${members}, aby przesyłać raporty do ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `(wcześniej domyślny zatwierdzający ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(wcześniej domyślny akceptujący)';
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
                ? `zmienił(a) proces akceptacji dla ${members}, aby wysyłali raporty do domyślnego akceptującego ${approver}`
                : `zmienił(a) proces zatwierdzania dla ${members}, aby wysyłali raporty do domyślnego zatwierdzającego`;
            if (wasDefaultApprover && previousApprover) {
                text += `(wcześniej domyślny zatwierdzający ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(wcześniej domyślny akceptujący)';
            } else if (previousApprover) {
                text += `(wcześniej ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `zmienił(a) obieg akceptacji dla ${approver}, aby przekazywać zatwierdzone raporty do ${forwardsTo} (wcześniej przekazywane do ${previousForwardsTo})`
                : `zmienił(a) proces zatwierdzania dla ${approver}, aby przekazywać zatwierdzone raporty do ${forwardsTo} (wcześniej raporty ostatecznie zatwierdzone)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `zmienił(a) proces zatwierdzania dla ${approver}, aby zatrzymać przekazywanie zatwierdzonych raportów (wcześniej przekazywane do ${previousForwardsTo})`
                : `zmienił(a) proces zatwierdzania dla ${approver}, aby zatrzymać przekazywanie zatwierdzonych raportów`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `zmieniono nazwę firmy na fakturze na „${newValue}” (poprzednio „${oldValue}”)` : `ustaw nazwę firmy na fakturze na „${newValue}”`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `zmienił(a) firmową stronę internetową faktury na „${newValue}” (poprzednio „${oldValue}”)` : `ustawiono firmową stronę internetową na fakturze na „${newValue}”`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `zmienił(a) upoważnioną osobę zwracającą wydatki na „${newReimburser}” (wcześniej „${previousReimburser}”)`
                : `zmienił(a) upoważnionego płatnika na „${newReimburser}”`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'włączone' : 'wyłączone'} zwrotów kosztów`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `dodano podatek „${taxName}”`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `usunął(-ę) podatek „${taxName}”`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `zmieniono nazwę podatku z „${oldValue}” na „${newValue}”`;
                }
                case 'code': {
                    return `zmienił(a) kod podatkowy dla „${taxName}” z „${oldValue}” na „${newValue}”`;
                }
                case 'rate': {
                    return `zmienił(a) stawkę podatku dla „${taxName}” z „${oldValue}” na „${newValue}”`;
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
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `zmienił(a) wymaganą kwotę paragonu na „${newValue}” (wcześniej „${oldValue}”)`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `usunięto wymagany limit paragonu (wcześniej „${oldValue}”)`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `ustaw maksymalną kwotę wydatku na „${newValue}”`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `zmieniono maksymalną kwotę wydatku na „${newValue}” (wcześniej „${oldValue}”)`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `usunięto maksymalną kwotę wydatku (wcześniej „${oldValue}”)`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `ustaw maksymalny wiek wydatku na „${newValue}” dni`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `zmieniono maksymalny wiek wydatku na „${newValue}” dni (wcześniej „${oldValue}”)`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `usunięto maksymalny wiek wydatku (wcześniej „${oldValue}” dni)`,
    },
    roomMembersPage: {
        memberNotFound: 'Nie znaleziono członka.',
        useInviteButton: 'Aby zaprosić nowego członka do czatu, użyj przycisku zapraszania powyżej.',
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
        confirmError: 'Wprowadź tytuł i wybierz miejsce udostępnienia',
        descriptionOptional: 'Opis (opcjonalnie)',
        pleaseEnterTaskName: 'Wprowadź tytuł',
        pleaseEnterTaskDestination: 'Wybierz, gdzie chcesz udostępnić to zadanie',
    },
    task: {
        task: 'Zadanie',
        title: 'Tytuł',
        description: 'Opis',
        assignee: 'Osoba przypisana',
        completed: 'Zakończono',
        action: 'Zakończ',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `zadanie dla ${title}`,
            completed: 'oznaczono jako ukończone',
            canceled: 'usunięte zadanie',
            reopened: 'oznaczono jako niekompletne',
            error: 'Nie masz uprawnień do wykonania żądanej akcji',
        },
        markAsComplete: 'Oznacz jako ukończone',
        markAsIncomplete: 'Oznacz jako nieukończone',
        assigneeError: 'Wystąpił błąd podczas przypisywania tego zadania. Spróbuj wybrać inną osobę odpowiedzialną.',
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
            escape: 'Zamknij okna dialogowe',
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
                title: 'Brak danych do wyświetlenia',
                subtitle: `Spróbuj zmienić kryteria wyszukiwania lub utworzyć coś za pomocą przycisku +.`,
            },
            emptyExpenseResults: {
                title: 'Nie utworzyłeś jeszcze żadnych wydatków',
                subtitle: 'Utwórz wydatek lub wypróbuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby utworzyć wydatek.',
            },
            emptyReportResults: {
                title: 'Nie utworzyłeś jeszcze żadnych raportów',
                subtitle: 'Utwórz raport lub wypróbuj Expensify, aby dowiedzieć się więcej.',
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
                subtitle: 'Zacznij od zarezerwowania swojej pierwszej podróży poniżej.',
                buttonText: 'Zarezerwuj podróż',
            },
            emptySubmitResults: {
                title: 'Brak wydatków do przesłania',
                subtitle: 'Wszystko gotowe. Czas na rundę zwycięstwa!',
                buttonText: 'Utwórz raport',
            },
            emptyApproveResults: {
                title: 'Brak wydatków do zatwierdzenia',
                subtitle: 'Zero wydatków. Maksymalny luz. Dobra robota!',
            },
            emptyPayResults: {
                title: 'Brak wydatków do opłacenia',
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
        unapprovedCard: 'Niezaakceptowana karta',
        reconciliation: 'Uzgodnienie',
        topSpenders: 'Najwięksi wydający',
        saveSearch: 'Zapisz wyszukiwanie',
        deleteSavedSearch: 'Usuń zapisaną wyszukiwanie',
        deleteSavedSearchConfirm: 'Na pewno chcesz usunąć to wyszukiwanie?',
        searchName: 'Wyszukaj nazwę',
        savedSearchesMenuItemTitle: 'Zapisano',
        topCategories: 'Najpopularniejsze kategorie',
        topMerchants: 'Najlepsi sprzedawcy',
        groupedExpenses: 'zgrupowane wydatki',
        bulkActions: {
            approve: 'Zatwierdź',
            pay: 'Zapłać',
            delete: 'Usuń',
            hold: 'Wstrzymaj',
            unhold: 'Usuń blokadę',
            reject: 'Odrzuć',
            noOptionsAvailable: 'Brak opcji dostępnych dla wybranej grupy wydatków.',
        },
        filtersHeader: 'Filtry',
        filters: {
            date: {
                before: (date?: string) => `Przed ${date ?? ''}`,
                after: (date?: string) => `Po ${date ?? ''}`,
                on: (date?: string) => `Na ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nigdy',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'W zeszłym miesiącu',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Ten miesiąc',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Od początku roku',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Ostatnie zestawienie',
                },
            },
            status: 'Status',
            keyword: 'Słowo kluczowe',
            keywords: 'Słowa kluczowe',
            limit: 'Limit',
            limitDescription: 'Ustaw limit wyników wyszukiwania.',
            currency: 'Waluta',
            completed: 'Zakończono',
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
                cardFeeds: 'Pobieranie danych kart',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Wszystkie ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Wszystkie zaimportowane karty CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} to ${value}`,
            current: 'Bieżące',
            past: 'Przeszłe',
            submitted: 'Przesłano',
            approved: 'Zatwierdzono',
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
            label: 'Pokaż',
            table: 'Tabela',
            bar: 'Bar',
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
            emptyStateTitle: 'Ten raport nie zawiera żadnych wydatków.',
            accessPlaceHolder: 'Otwórz, aby zobaczyć szczegóły',
        },
        noCategory: 'Brak kategorii',
        noMerchant: 'Brak sprzedawcy',
        noTag: 'Brak tagu',
        expenseType: 'Typ wydatku',
        withdrawalType: 'Typ wypłaty',
        recentSearches: 'Ostatnie wyszukiwania',
        recentChats: 'Ostatnie czaty',
        searchIn: 'Szukaj w',
        searchPlaceholder: 'Wyszukaj coś',
        suggestions: 'Sugestie',
        exportSearchResults: {
            title: 'Utwórz eksport',
            description: 'Wow, ale dużo pozycji! Spakujemy je, a Concierge wkrótce wyśle Ci plik.',
        },
        exportedTo: 'Wyeksportowano do',
        exportAll: {
            selectAllMatchingItems: 'Zaznacz wszystkie pasujące elementy',
            allMatchingItemsSelected: 'Zaznaczono wszystkie pasujące elementy',
        },
    },
    genericErrorPage: {
        title: 'Ups, coś poszło nie tak!',
        body: {
            helpTextMobile: 'Zamknij i ponownie otwórz aplikację lub przełącz na',
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
                'Sprawdź folder ze zdjęciami lub pobranymi plikami, aby znaleźć kopię swojego kodu QR. Wskazówka: dodaj go do prezentacji, aby Twoi odbiorcy mogli go zeskanować i połączyć się z Tobą bezpośrednio.',
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
            cleared: 'Wyczyszczono',
            failed: 'Niepowodzenie',
        },
        failedError: ({link}: {link: string}) => `Spróbujemy ponownie rozliczyć tę płatność, gdy <a href="${link}">odblokujesz swoje konto</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • ID wypłaty: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Układ raportu',
        groupByLabel: 'Grupuj według:',
        selectGroupByOption: 'Wybierz sposób grupowania wydatków raportu',
        uncategorized: 'Nieskategoryzowane',
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
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) => `Czy na pewno chcesz utworzyć kolejny raport w ${workspaceName}? Puste raporty znajdziesz w`,
            emptyReportConfirmationPromptLink: 'Raporty',
            emptyReportConfirmationDontShowAgain: 'Nie pokazuj mi tego ponownie',
            genericWorkspaceName: 'ten workspace',
        },
        genericCreateReportFailureMessage: 'Nieoczekiwany błąd podczas tworzenia tego czatu. Spróbuj ponownie później.',
        genericAddCommentFailureMessage: 'Nieoczekiwany błąd podczas wysyłania komentarza. Spróbuj ponownie później.',
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
                        return `zmieniono przestrzeń roboczą${fromPolicyName ? `(wcześniej ${fromPolicyName})` : ''}`;
                    }
                    return `zmienił(a) przestrzeń roboczą na ${toPolicyName}${fromPolicyName ? `(wcześniej ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `zmieniono typ z ${oldType} na ${newType}`,
                exportedToCSV: `wyeksportowano do CSV`,
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
                    nonReimbursableLink: 'wydatki z firmowej karty',
                    pending: (label: string) => `rozpoczęto eksport tego raportu do ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `nie udało się wyeksportować tego raportu do ${label} („${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}”)`,
                managerAttachReceipt: `dodano paragon`,
                managerDetachReceipt: `usunął(-ę) paragon`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `zapłacono ${currency}${amount} gdzie indziej`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `zapłacono ${currency}${amount} przez integrację`,
                outdatedBankAccount: `nie można było przetworzyć płatności z powodu problemu z kontem bankowym płatnika`,
                reimbursementACHBounce: `nie udało się przetworzyć płatności z powodu problemu z kontem bankowym`,
                reimbursementACHCancelled: `anulowano płatność`,
                reimbursementAccountChanged: `nie można było przetworzyć płatności, ponieważ płatnik zmienił konto bankowe`,
                reimbursementDelayed: `przetworzono płatność, ale jest opóźniona o kolejne 1–2 dni robocze`,
                selectedForRandomAudit: `losowo wybrane do weryfikacji`,
                selectedForRandomAuditMarkdown: `[losowo wybrany](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) do weryfikacji`,
                share: ({to}: ShareParams) => `zaprosił(-a) członka ${to}`,
                unshare: ({to}: UnshareParams) => `usunięto członka ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `zapłacono ${currency}${amount}`,
                takeControl: `przejął kontrolę`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `wystąpił problem z synchronizacją z ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Napraw problem w <a href="${workspaceAccountingLink}">ustawieniach przestrzeni roboczej</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `Połączenie ${feedName} jest przerwane. Aby przywrócić importy kart, <a href='${workspaceCompanyCardRoute}'>zaloguj się do swojego banku</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `połączenie Plaid z Twoim firmowym kontem bankowym jest przerwane. Prosimy, <a href='${walletRoute}'>ponownie połącz konto bankowe ${maskedAccountNumber}</a>, aby móc dalej korzystać z kart Expensify.`,
                addEmployee: (email: string, role: string) => `dodano ${email} jako ${role === 'member' ? 'a' : 'włączony'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `zaktualizowano rolę użytkownika ${email} na ${newRole} (wcześniej ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usunięto własne pole 1 użytkownika ${email} (wcześniej „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `dodano „${newValue}” do niestandardowego pola 1 użytkownika ${email}`
                        : `zmieniono pole niestandardowe 1 użytkownika ${email} na „${newValue}” (poprzednio „${previousValue}”)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usunięto pole niestandardowe 2 użytkownika ${email} (wcześniej „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `dodano „${newValue}” do pola niestandardowego 2 użytkownika ${email}`
                        : `zmieniono pole niestandardowe 2 użytkownika ${email} na „${newValue}” (wcześniej „${previousValue}”)`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} opuścił(-a) przestrzeń roboczą`,
                removeMember: (email: string, role: string) => `usunięto ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `usunięto połączenie z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `połączono z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'opuścił czat',
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `firmowe konto bankowe ${maskedBankAccountNumber} zostało automatycznie zablokowane z powodu problemu z rozliczeniem zwrotów lub rozliczeniem karty Expensify. Napraw problem w <a href="${linkURL}">ustawieniach swojego workspace</a>.`,
            },
            error: {
                invalidCredentials: 'Nieprawidłowe dane logowania, sprawdź konfigurację swojego połączenia.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} za ${dayCount} ${dayCount === 1 ? 'dzień' : 'dni'} do ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} z ${timePeriod} z dnia ${date}`,
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
        jobs: 'Oferty pracy',
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
        chatWelcomeMessage: 'Powitanie czatu',
        navigatesToChat: 'Przechodzi do czatu',
        newMessageLineIndicator: 'Wskaźnik nowej linii wiadomości',
        chatMessage: 'Wiadomość czatu',
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
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `Z raportu ${reportName}${workspaceName ? `w ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'Skopiuj URL',
        copied: 'Skopiowano!',
    },
    moderation: {
        flagDescription: 'Wszystkie oznaczone wiadomości zostaną wysłane do moderatora do weryfikacji.',
        chooseAReason: 'Wybierz poniższy powód zgłoszenia:',
        spam: 'Spam',
        spamDescription: 'Niechciana, nie na temat promocja',
        inconsiderate: 'Niemiły',
        inconsiderateDescription: 'Obrażające lub lekceważące sformułowanie, o wątpliwych intencjach',
        intimidation: 'Zastraszanie',
        intimidationDescription: 'Agresywne forsowanie własnej agendy mimo uzasadnionych zastrzeżeń',
        bullying: 'Nękanie',
        bullyingDescription: 'Obieranie za cel jednostki w celu uzyskania posłuszeństwa',
        harassment: 'Nękanie',
        harassmentDescription: 'Rasistowskie, mizoginistyczne lub inne szeroko dyskryminujące zachowania',
        assault: 'Napaść',
        assaultDescription: 'Celowo wymierzony atak emocjonalny z zamiarem wyrządzenia krzywdy',
        flaggedContent: 'Ta wiadomość została oznaczona jako naruszająca nasze zasady społeczności, a jej treść została ukryta.',
        hideMessage: 'Ukryj wiadomość',
        revealMessage: 'Pokaż wiadomość',
        levelOneResult: 'Wysyła anonimowe ostrzeżenie, a wiadomość zostaje zgłoszona do weryfikacji.',
        levelTwoResult: 'Wiadomość ukryta na kanale, wraz z anonimowym ostrzeżeniem, a wiadomość została zgłoszona do sprawdzenia.',
        levelThreeResult: 'Wiadomość usunięta z kanału, wysłano anonimowe ostrzeżenie, a wiadomość została zgłoszona do weryfikacji.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Zaproś do przesłania wydatków',
        inviteToChat: 'Zaproś tylko do czatu',
        nothing: 'Nic nie rób',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Akceptuj',
        decline: 'Odrzuć',
    },
    actionableMentionTrackExpense: {
        submit: 'Prześlij to do kogoś',
        categorize: 'Skategoryzuj to',
        share: 'Udostępnij to mojemu księgowemu',
        nothing: 'Na razie nic',
    },
    teachersUnitePage: {
        teachersUnite: 'Nauczyciele, łączcie się',
        joinExpensifyOrg:
            'Dołącz do Expensify.org w eliminowaniu niesprawiedliwości na całym świecie. Obecna kampania „Teachers Unite” wspiera nauczycieli wszędzie, dzieląc koszty niezbędnych przyborów szkolnych.',
        iKnowATeacher: 'Znam nauczyciela',
        iAmATeacher: 'Jestem nauczycielem',
        getInTouch: 'Świetnie! Udostępnij ich dane kontaktowe, abyśmy mogli się z nimi skontaktować.',
        introSchoolPrincipal: 'Wprowadzenie dla dyrektora szkoły',
        schoolPrincipalVerifyExpense:
            'Expensify.org dzieli koszt podstawowych przyborów szkolnych, aby uczniowie z rodzin o niskich dochodach mogli mieć lepsze warunki do nauki. Dyrektor Twojej szkoły zostanie poproszony o zweryfikowanie Twoich wydatków.',
        principalFirstName: 'Imię właściciela',
        principalLastName: 'Nazwisko osoby odpowiedzialnej',
        principalWorkEmail: 'Główny służbowy e-mail',
        updateYourEmail: 'Zaktualizuj swój adres e-mail',
        updateEmail: 'Zaktualizuj adres e-mail',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Zanim przejdziesz dalej, upewnij się, że ustawiłeś(-aś) swój szkolny e-mail jako domyślną metodę kontaktu. Możesz to zrobić w Ustawienia > Profil > <a href="${contactMethodsRoute}">Metody kontaktu</a>.`,
        error: {
            enterPhoneEmail: 'Wpisz prawidłowy adres e‑mail lub numer telefonu',
            enterEmail: 'Wpisz adres e-mail',
            enterValidEmail: 'Wpisz prawidłowy adres e‑mail',
            tryDifferentEmail: 'Spróbuj użyć innego adresu e-mail',
        },
    },
    cardTransactions: {
        notActivated: 'Nieaktywne',
        outOfPocket: 'Wydatki z własnej kieszeni',
        companySpend: 'Wydatki firmowe',
    },
    distance: {
        addStop: 'Dodaj przystanek',
        deleteWaypoint: 'Usuń punkt trasy',
        deleteWaypointConfirmation: 'Czy na pewno chcesz usunąć ten punkt trasy?',
        address: 'Adres',
        waypointDescription: {
            start: 'Start',
            stop: 'Zatrzymaj',
        },
        mapPending: {
            title: 'Trwa mapowanie',
            subtitle: 'Mapa zostanie wygenerowana, gdy wrócisz do trybu online',
            onlineSubtitle: 'Chwileczkę, konfigurujemy mapę',
            errorTitle: 'Błąd mapy',
            errorSubtitle: 'Wystąpił błąd podczas ładowania mapy. Spróbuj ponownie.',
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
        disclaimer: 'Użyj GPS, aby utworzyć wydatek z podróży. Stuknij przycisk „Start” poniżej, aby rozpocząć śledzenie.',
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
            prompt: 'Na pewno? Spowoduje to zakończenie Twojej obecnej ścieżki.',
            cancel: 'Wznów śledzenie',
            confirm: 'Zatrzymaj śledzenie GPS',
        },
        discardDistanceTrackingModal: {
            title: 'Odrzuć śledzenie dystansu',
            prompt: 'Na pewno? Spowoduje to porzucenie Twojej bieżącej ścieżki i nie będzie można tego cofnąć.',
            confirm: 'Odrzuć śledzenie dystansu',
        },
        zeroDistanceTripModal: {
            title: 'Nie można utworzyć wydatku',
            prompt: 'Nie możesz utworzyć wydatku z takim samym miejscem początkowym i końcowym.',
        },
        locationRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji',
            prompt: 'Zezwól na dostęp do lokalizacji w ustawieniach urządzenia, aby rozpocząć śledzenie dystansu GPS.',
            allow: 'Zezwól',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji w tle',
            prompt: 'Zezwól na dostęp do lokalizacji w tle w ustawieniach urządzenia (opcja „Zawsze zezwalaj”), aby uruchomić śledzenie dystansu GPS.',
        },
        preciseLocationRequiredModal: {
            title: 'Wymagana dokładna lokalizacja',
            prompt: 'Włącz proszę „dokładną lokalizację” w ustawieniach urządzenia, aby rozpocząć śledzenie dystansu GPS.',
        },
        desktop: {
            title: 'Śledź dystans na swoim telefonie',
            subtitle: 'Automatycznie rejestruj mile lub kilometry za pomocą GPS i natychmiast zamieniaj przejazdy w wydatki.',
            button: 'Pobierz aplikację',
        },
        notification: {
            title: 'Trwa śledzenie GPS',
            body: 'Przejdź do aplikacji, aby dokończyć',
        },
        continueGpsTripModal: {
            title: 'Kontynuować rejestrowanie trasy GPS?',
            prompt: 'Wygląda na to, że aplikacja została zamknięta podczas Twojej ostatniej trasy GPS. Czy chcesz kontynuować nagrywanie z tamtej trasy?',
            confirm: 'Kontynuuj podróż',
            cancel: 'Zobacz podróż',
        },
        signOutWarningTripInProgress: {
            title: 'Trwa śledzenie GPS',
            prompt: 'Czy na pewno chcesz odrzucić podróż i się wylogować?',
            confirm: 'Odrzuć i wyloguj się',
        },
        locationServicesRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji',
            confirm: 'Otwórz ustawienia',
            prompt: 'Zezwól na dostęp do lokalizacji w ustawieniach urządzenia, aby rozpocząć śledzenie dystansu GPS.',
        },
        fabGpsTripExplained: 'Przejdź do ekranu GPS (działanie pływające)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Świadectwo zgubione lub uszkodzone',
        nextButtonLabel: 'Dalej',
        reasonTitle: 'Dlaczego potrzebujesz nowej karty?',
        cardDamaged: 'Moja karta została uszkodzona',
        cardLostOrStolen: 'Moja karta została zgubiona lub skradziona',
        confirmAddressTitle: 'Potwierdź adres korespondencyjny dla swojej nowej karty.',
        cardDamagedInfo: 'Twoja nowa karta dotrze w ciągu 2–3 dni roboczych. Twoja obecna karta będzie działać do momentu aktywacji nowej.',
        cardLostOrStolenInfo: 'Twoja obecna karta zostanie trwale dezaktywowana, gdy tylko złożysz zamówienie. Większość kart dociera w ciągu kilku dni roboczych.',
        address: 'Adres',
        deactivateCardButton: 'Dezaktywuj kartę',
        shipNewCardButton: 'Wyślij nową kartę',
        addressError: 'Adres jest wymagany',
        reasonError: 'Powód jest wymagany',
        successTitle: 'Twoja nowa karta jest w drodze!',
        successDescription: 'Będziesz musieć aktywować ją, gdy dotrze za kilka dni roboczych. W międzyczasie możesz korzystać z wirtualnej karty.',
    },
    eReceipt: {
        guaranteed: 'Gwarantowany e-paragon',
        transactionDate: 'Data transakcji',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Rozpocznij czat, <success><strong>poleć znajomego</strong></success>.',
            header: 'Rozpocznij czat, poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi też korzystali z Expensify? Po prostu rozpocznij z nimi czat, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Złóż raport wydatków, <success><strong>poleć swój zespół</strong></success>.',
            header: 'Wyślij wydatek, poleć swój zespół',
            body: 'Chcesz, aby Twój zespół też korzystał z Expensify? Po prostu prześlij im wydatek, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Poleć znajomego',
            body: 'Chcesz, żeby Twoi znajomi też korzystali z Expensify? Po prostu czatuj, płać lub dziel z nimi wydatki, a my zajmiemy się resztą. Albo po prostu udostępnij swój link zaproszeniowy!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Poleć znajomego',
            header: 'Poleć znajomego',
            body: 'Chcesz, żeby Twoi znajomi też korzystali z Expensify? Po prostu czatuj, płać lub dziel z nimi wydatki, a my zajmiemy się resztą. Albo po prostu udostępnij swój link zaproszeniowy!',
        },
        copyReferralLink: 'Skopiuj link z zaproszeniem',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Porozmawiaj ze swoim specjalistą ds. konfiguracji w <a href="${href}">${adminReportName}</a>, aby uzyskać pomoc`,
        default: `Wyślij wiadomość do <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>, aby uzyskać pomoc z konfiguracją`,
    },
    violations: {
        allTagLevelsRequired: 'Wszystkie tagi są wymagane',
        autoReportedRejectedExpense: 'Ten wydatek został odrzucony.',
        billableExpense: 'Rozliczalne już nieważne',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Wymagany paragon${formattedLimit ? `powyżej ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategoria nie jest już prawidłowa',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Zastosowano prowizję za przewalutowanie w wysokości ${surcharge}%`,
        customUnitOutOfPolicy: 'Stawka nie jest ważna dla tego workspace’u',
        duplicatedTransaction: 'Potencjalny duplikat',
        fieldRequired: 'Pola raportu są wymagane',
        futureDate: 'Przyszła data jest niedozwolona',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Podwyższono o ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data starsza niż ${maxAge} dni`,
        missingCategory: 'Brak kategorii',
        missingComment: 'Wymagany opis dla wybranej kategorii',
        missingAttendees: 'Wymaganych jest wielu uczestników dla tej kategorii',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Brak ${tagName ?? 'etykieta'}`,
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
                    return 'Kwota wyższa niż zeskanowany paragon';
            }
        },
        modifiedDate: 'Data różni się od zeskanowanego paragonu',
        nonExpensiworksExpense: 'Wydatek spoza Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Wydatek przekracza automatyczny limit zatwierdzania w wysokości ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Kwota przekracza limit kategorii w wysokości ${formattedLimit}/osobę`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota powyżej limitu ${formattedLimit}/osobę`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota powyżej limitu ${formattedLimit}/podróż`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota powyżej limitu ${formattedLimit}/osobę`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Kwota przekraczająca dzienny limit kategorii ${formattedLimit}/osobę`,
        receiptNotSmartScanned: 'Ręcznie dodano paragon i szczegóły wydatku.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Wymagany paragon powyżej limitu kategorii ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Wymagany paragon powyżej ${formattedLimit}`;
            }
            if (category) {
                return `Wymagany paragon powyżej limitu kategorii`;
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
                        return `rozrywka dla dorosłych`;
                    case 'hotelIncidentals':
                        return `dodatkowe opłaty hotelowe`;
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
                    : 'Połączenie z bankiem zostało zerwane. Poproś administratora o ponowne połączenie, aby dopasować paragon.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Poproś ${member}, aby oznaczył to jako gotówkę lub poczekaj 7 dni i spróbuj ponownie` : 'Oczekuje na połączenie z transakcją kartową.';
            }
            return '';
        },
        brokenConnection530Error: 'Paragon oczekuje z powodu przerwanego połączenia z bankiem',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Oczekuje na rachunek z powodu przerwanego połączenia z bankiem. Rozwiąż problem w sekcji <a href="${workspaceCompanyCardRoute}">Karty firmowe</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Paragon oczekuje z powodu zerwanego połączenia z bankiem. Poproś administratora przestrzeni roboczej o rozwiązanie problemu.',
        markAsCashToIgnore: 'Oznacz jako gotówkę, aby zignorować i poprosić o płatność.',
        smartscanFailed: ({canEdit = true}) => `Skanowanie paragonu nie powiodło się.${canEdit ? 'Wpisz szczegóły ręcznie.' : ''}`,
        receiptGeneratedWithAI: 'Potencjalny paragon wygenerowany przez AI',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Brak ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nie jest już ważny`,
        taxAmountChanged: 'Kwota podatku została zmieniona',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Podatek'} nie jest już prawidłowy`,
        taxRateChanged: 'Zmodyfikowano stawkę podatku',
        taxRequired: 'Brak stawki podatku',
        none: 'Brak',
        taxCodeToKeep: 'Wybierz, który kod podatkowy zachować',
        tagToKeep: 'Wybierz, który znacznik zachować',
        isTransactionReimbursable: 'Wybierz, czy transakcja jest podlegająca zwrotowi',
        merchantToKeep: 'Wybierz, którego sprzedawcę zachować',
        descriptionToKeep: 'Wybierz, który opis zachować',
        categoryToKeep: 'Wybierz, którą kategorię zachować',
        isTransactionBillable: 'Wybierz, czy transakcja jest refakturowalna',
        keepThisOne: 'Zostaw ten',
        confirmDetails: `Potwierdź szczegóły, które zachowujesz`,
        confirmDuplicatesInfo: `Zduplikowane pozycje, których nie zachowasz, zostaną pozostawione do usunięcia przez osobę, która je przesłała.`,
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
            manual: 'oznaczył ten paragon jako gotówkę',
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
        normal: 'Normalny',
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
        quickTip: 'Szybka porada...',
        quickTipSubTitle: 'Możesz przejść bezpośrednio do Expensify Classic, odwiedzając expensify.com. Dodaj ją do zakładek, aby mieć łatwy skrót!',
        bookACall: 'Umów rozmowę',
        bookACallTitle: 'Czy chcesz porozmawiać z product managerem?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Bezpośrednie czatowanie na wydatkach i raportach',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Możliwość robienia wszystkiego na urządzeniu mobilnym',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Podróże i wydatki z prędkością czatu',
        },
        bookACallTextTop: 'Przechodząc na Expensify Classic, stracisz dostęp do:',
        bookACallTextBottom:
            'Chętnie umówimy się z Tobą na rozmowę, aby zrozumieć dlaczego. Możesz zarezerwować rozmowę z jednym z naszych starszych menedżerów produktu, aby omówić swoje potrzeby.',
        takeMeToExpensifyClassic: 'Przejdź do Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Wystąpił błąd podczas wczytywania kolejnych wiadomości',
        tryAgain: 'Spróbuj ponownie',
    },
    systemMessage: {
        mergedWithCashTransaction: 'dopasowano paragon do tej transakcji',
    },
    subscription: {
        authenticatePaymentCard: 'Uwierzytelnij kartę płatniczą',
        mobileReducedFunctionalityMessage: 'Nie możesz wprowadzać zmian w swoim abonamencie w aplikacji mobilnej.',
        badge: {
            freeTrial: (numOfDays: number) => `Darmowy okres próbny: pozostało ${numOfDays} ${numOfDays === 1 ? 'dzień' : 'dni'}`,
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
                        ? `Twoja opłata z ${date} w wysokości ${purchaseAmountOwed} nie mogła zostać przetworzona. Dodaj kartę płatniczą, aby uregulować należną kwotę.`
                        : 'Dodaj kartę płatniczą, aby spłacić należną kwotę.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Twoje dane płatnicze są nieaktualne',
                subtitle: (date: string) => `Twoja płatność jest przeterminowana. Prosimy opłacić fakturę do ${date}, aby uniknąć przerwy w świadczeniu usługi.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Twoje dane płatnicze są nieaktualne',
                subtitle: 'Twoja płatność jest zaległa. Proszę opłać swoją fakturę.',
            },
            billingDisputePending: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Zakwestionowano naliczenie ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto będzie zablokowane do czasu wyjaśnienia sporu z Twoim bankiem.`,
            },
            cardAuthenticationRequired: {
                title: 'Twoja karta płatnicza nie została w pełni uwierzytelniona.',
                subtitle: (cardEnding: string) => `Aby aktywować swoją kartę płatniczą kończącą się na ${cardEnding}, dokończ proces uwierzytelniania.`,
            },
            insufficientFunds: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: (amountOwed: number) =>
                    `Twoja karta płatnicza została odrzucona z powodu niewystarczających środków. Spróbuj ponownie lub dodaj nową kartę płatniczą, aby uregulować zaległe saldo w wysokości ${amountOwed}.`,
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
                    'Zanim spróbujesz ponownie, skontaktuj się bezpośrednio ze swoim bankiem, aby autoryzować obciążenia Expensify i usunąć ewentualne blokady. W przeciwnym razie spróbuj dodać inną kartę płatniczą.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Zakwestionowano naliczenie ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto będzie zablokowane do czasu wyjaśnienia sporu z Twoim bankiem.`,
            preTrial: {
                title: 'Rozpocznij bezpłatny okres próbny',
                subtitle: 'Jako następny krok <a href="#">wypełnij swoją listę kontrolną konfiguracji</a>, aby Twój zespół mógł zacząć rozliczać wydatki.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Okres próbny: pozostało ${numOfDays} ${numOfDays === 1 ? 'dzień' : 'dni'}!`,
                subtitle: 'Dodaj kartę płatniczą, aby nadal korzystać ze wszystkich swoich ulubionych funkcji.',
            },
            trialEnded: {
                title: 'Twój bezpłatny okres próbny dobiegł końca',
                subtitle: 'Dodaj kartę płatniczą, aby nadal korzystać ze wszystkich swoich ulubionych funkcji.',
            },
            earlyDiscount: {
                claimOffer: 'Odbierz ofertę',
                subscriptionPageTitle: (discountType: number) => `<strong>${discountType}% zniżki na pierwszy rok!</strong> Dodaj kartę płatniczą i rozpocznij roczną subskrypcję.`,
                onboardingChatTitle: (discountType: number) => `Oferta ograniczona czasowo: ${discountType}% zniżki na pierwszy rok!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Odbierz w ciągu ${days > 0 ? `${days}d :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Płatność',
            subtitle: 'Dodaj kartę, aby opłacić swoją subskrypcję Expensify.',
            addCardButton: 'Dodaj kartę płatniczą',
            cardInfo: (name: string, expiration: string, currency: string) => `Nazwa: ${name}, Data ważności: ${expiration}, Waluta: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Data Twojej następnej płatności to ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Karta kończąca się na ${cardNumber}`,
            changeCard: 'Zmień kartę płatniczą',
            changeCurrency: 'Zmień walutę płatności',
            cardNotFound: 'Nie dodano karty płatniczej',
            retryPaymentButton: 'Ponów płatność',
            authenticatePayment: 'Uwierzytelnij płatność',
            requestRefund: 'Poproś o zwrot',
            requestRefundModal: {
                full: 'Uzyskanie zwrotu jest proste – po prostu zdegraduj swoje konto przed następną datą rozliczenia, a otrzymasz zwrot. <br /> <br /> Uwaga: Degradacja konta oznacza, że Twoje przestrzenie robocze zostaną usunięte. Tego działania nie można cofnąć, ale zawsze możesz utworzyć nową przestrzeń roboczą, jeśli zmienisz zdanie.',
                confirm: 'Usuń przestrzeń(e) roboczą(e) i zdegraduj plan',
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
            perMemberMonth: 'za użytkownika/miesiąc',
            collect: {
                title: 'Zbierz',
                description: 'Plan dla małych firm, który zapewnia wydatki, podróże i czat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, do ${upper}/aktywnego członka bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, do ${upper}/aktywnego członka bez karty Expensify.`,
                benefit1: 'Skanowanie paragonów',
                benefit2: 'Zwroty kosztów',
                benefit3: 'Zarządzanie kartami służbowymi',
                benefit4: 'Zatwierdzanie wydatków i podróży',
                benefit5: 'Rezerwacja podróży i zasady',
                benefit6: 'Integracje QuickBooks/Xero',
                benefit7: 'Rozmawiaj o wydatkach, raportach i pokojach',
                benefit8: 'Wsparcie AI i człowieka',
            },
            control: {
                title: 'Sterowanie',
                description: 'Wydatki, podróże służbowe i czat dla większych firm.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, do ${upper}/aktywnego członka bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, do ${upper}/aktywnego członka bez karty Expensify.`,
                benefit1: 'Wszystko w pakiecie Collect',
                benefit2: 'Wielopoziomowe przepływy zatwierdzania',
                benefit3: 'Niestandardowe zasady wydatków',
                benefit4: 'Integracje ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integracje HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Niestandardowe analizy i raportowanie',
                benefit8: 'Budżetowanie',
            },
            thisIsYourCurrentPlan: 'To Twój obecny plan',
            downgrade: 'Zmień na Collect',
            upgrade: 'Ulepsz do Control',
            addMembers: 'Dodaj członków',
            saveWithExpensifyTitle: 'Oszczędzaj z kartą Expensify',
            saveWithExpensifyDescription: 'Skorzystaj z naszego kalkulatora oszczędności, aby zobaczyć, jak zwrot gotówki z karty Expensify może obniżyć Twój rachunek Expensify.',
            saveWithExpensifyButton: 'Dowiedz się więcej',
        },
        compareModal: {
            comparePlans: 'Porównaj plany',
            subtitle: `<muted-text>Odblokuj potrzebne funkcje dzięki planowi odpowiedniemu dla Ciebie. <a href="${CONST.PRICING}">Zobacz naszą stronę z cenami</a>, aby poznać pełne porównanie funkcji wszystkich planów.</muted-text>`,
        },
        details: {
            title: 'Szczegóły subskrypcji',
            annual: 'Abonament roczny',
            taxExempt: 'Poproś o status zwolnienia z podatku',
            taxExemptEnabled: 'Zwolnione z podatku',
            taxExemptStatus: 'Status zwolnienia z podatku',
            payPerUse: 'Płać za użycie',
            subscriptionSize: 'Rozmiar subskrypcji',
            headsUp:
                'Uwaga: jeśli teraz nie ustawisz rozmiaru swojej subskrypcji, automatycznie ustawimy go na liczbę aktywnych członków w pierwszym miesiącu. Następnie zobowiążesz się do opłacania co najmniej tej liczby członków przez kolejne 12 miesięcy. Możesz w każdej chwili zwiększyć rozmiar subskrypcji, ale nie możesz go zmniejszyć, dopóki subskrypcja się nie zakończy.',
            zeroCommitment: 'Zero zobowiązań przy obniżonej rocznej stawce subskrypcji',
        },
        subscriptionSize: {
            title: 'Rozmiar subskrypcji',
            yourSize: 'Rozmiar Twojej subskrypcji to liczba wolnych miejsc, które w danym miesiącu mogą zostać zajęte przez dowolnych aktywnych członków.',
            eachMonth:
                'Każdego miesiąca Twoja subskrypcja obejmuje do liczby aktywnych członków ustawionej powyżej. Za każdym razem, gdy zwiększysz rozmiar subskrypcji, rozpoczniesz nową 12‑miesięczną subskrypcję w tym nowym rozmiarze.',
            note: 'Uwaga: aktywny członek to każda osoba, która utworzyła, edytowała, przesłała, zatwierdziła, zrefundowała lub wyeksportowała dane wydatków powiązane z przestrzenią roboczą Twojej firmy.',
            confirmDetails: 'Potwierdź szczegóły nowej subskrypcji rocznej:',
            subscriptionSize: 'Rozmiar subskrypcji',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktywnych członków/miesiąc`,
            subscriptionRenews: 'Odnowienie subskrypcji',
            youCantDowngrade: 'Nie możesz przejść na niższy plan w trakcie rocznej subskrypcji.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Zobowiązałeś(-aś) się już do rocznej subskrypcji w rozmiarze ${size} aktywnych członków miesięcznie do ${date}. Możesz przejść na subskrypcję płatną za użycie w dniu ${date}, wyłączając automatyczne odnawianie.`,
            error: {
                size: 'Wprowadź prawidłowy rozmiar subskrypcji',
                sameSize: 'Wprowadź liczbę inną niż Twój obecny rozmiar subskrypcji',
            },
        },
        paymentCard: {
            addPaymentCard: 'Dodaj kartę płatniczą',
            enterPaymentCardDetails: 'Wprowadź dane swojej karty płatniczej',
            security: 'Expensify jest zgodny ze standardem PCI-DSS, używa szyfrowania na poziomie bankowym i wykorzystuje redundantną infrastrukturę, aby chronić Twoje dane.',
            learnMoreAboutSecurity: 'Dowiedz się więcej o naszym zabezpieczeniu.',
        },
        subscriptionSettings: {
            title: 'Ustawienia subskrypcji',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Typ subskrypcji: ${subscriptionType}, Rozmiar subskrypcji: ${subscriptionSize}, Automatyczne odnawianie: ${autoRenew}, Automatyczne zwiększanie rocznych miejsc: ${autoIncrease}`,
            none: 'brak',
            on: 'włączony',
            off: 'wyłączone',
            annual: 'Roczny',
            autoRenew: 'Automatyczne odnawianie',
            autoIncrease: 'Automatycznie zwiększaj liczbę rocznych stanowisk',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Oszczędzaj do ${amountWithCurrency}/miesiąc na aktywnego członka`,
            automaticallyIncrease:
                'Automatycznie zwiększ liczbę rocznych miejsc, aby uwzględnić aktywnych członków przekraczających rozmiar Twojej subskrypcji. Uwaga: spowoduje to wydłużenie daty zakończenia Twojej rocznej subskrypcji.',
            disableAutoRenew: 'Wyłącz automatyczne odnawianie',
            helpUsImprove: 'Pomóż nam ulepszyć Expensify',
            whatsMainReason: 'Jaki jest główny powód wyłączenia automatycznego odnawiania?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Odnawia się ${date}.`,
            pricingConfiguration: 'Cena zależy od konfiguracji. Aby uzyskać najniższą cenę, wybierz roczną subskrypcję i zdobądź kartę Expensify.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Dowiedz się więcej na naszej <a href="${CONST.PRICING}">stronie z cenami</a> lub porozmawiaj z naszym zespołem w swojej ${hasAdminsRoom ? `<a href="adminsRoom">Pokój #admins.</a>` : 'pokój #admins'}</muted-text>`,
            estimatedPrice: 'Szacunkowa cena',
            changesBasedOn: 'To się zmienia w zależności od korzystania z karty Expensify i opcji subskrypcji poniżej.',
        },
        requestEarlyCancellation: {
            title: 'Poproś o wcześniejsze anulowanie',
            subtitle: 'Jaki jest główny powód, dla którego prosisz o wcześniejsze anulowanie?',
            subscriptionCanceled: {
                title: 'Subskrypcja anulowana',
                subtitle: 'Twoja subskrypcja roczna została anulowana.',
                info: 'Jeśli chcesz nadal korzystać ze swojego(-ich) workspace’u(-ów) w modelu płatności za użycie, wszystko jest gotowe.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Jeśli chcesz zapobiec przyszłej aktywności i obciążeniom, musisz <a href="${workspacesListRoute}">usunąć swoje przestrzenie robocze</a>. Pamiętaj, że po usunięciu przestrzeni roboczych zostaniesz obciążony za wszelką nierozliczoną aktywność z bieżącego miesiąca kalendarzowego.`,
            },
            requestSubmitted: {
                title: 'Wniosek wysłany',
                subtitle:
                    'Dziękujemy za informację, że jesteś zainteresowany(-a) anulowaniem swojej subskrypcji. Rozpatrujemy Twoją prośbę i wkrótce skontaktujemy się z Tobą na czacie z <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Składając prośbę o wcześniejsze rozwiązanie, potwierdzam i zgadzam się, że Expensify nie ma obowiązku uwzględnienia takiej prośby na mocy <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Regulaminu świadczenia usług</a> Expensify ani innej obowiązującej umowy o świadczenie usług zawartej pomiędzy mną a Expensify oraz że Expensify zachowuje wyłączną dowolność w zakresie rozpatrzenia takiej prośby.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funkcjonalność wymaga poprawy',
        tooExpensive: 'Zbyt drogie',
        inadequateSupport: 'Niewystarczające wsparcie klienta',
        businessClosing: 'Likwidacja, redukcja zatrudnienia lub przejęcie firmy',
        additionalInfoTitle: 'Na jakie oprogramowanie przechodzisz i dlaczego?',
        additionalInfoInputLabel: 'Twoja odpowiedź',
    },
    roomChangeLog: {
        updateRoomDescription: 'ustaw opis pokoju na:',
        clearRoomDescription: 'wyczyścił(a) opis pokoju',
        changedRoomAvatar: 'zmienił(-a) awatar pokoju',
        removedRoomAvatar: 'usunął(-ę) awatar pokoju',
    },
    delegate: {
        switchAccount: 'Przełącz konta:',
        copilotDelegatedAccess: 'Copilot: Dostęp delegowany',
        copilotDelegatedAccessDescription: 'Zezwól innym członkom na dostęp do Twojego konta.',
        addCopilot: 'Dodaj pilota',
        membersCanAccessYourAccount: 'Ci członkowie mają dostęp do Twojego konta:',
        youCanAccessTheseAccounts: 'Masz dostęp do tych kont za pomocą przełącznika kont:',
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
        onBehalfOfMessage: (delegator: string) => `w imieniu ${delegator}`,
        accessLevel: 'Poziom dostępu',
        confirmCopilot: 'Potwierdź swojego kopilota poniżej.',
        accessLevelDescription: 'Wybierz poziom dostępu poniżej. Zarówno Pełny, jak i Ograniczony dostęp pozwalają współprowadzącym przeglądać wszystkie konwersacje i wydatki.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Pozwól innemu członkowi wykonywać w Twoim imieniu wszystkie działania na Twoim koncie. Obejmuje to czat, zgłoszenia, zatwierdzenia, płatności, aktualizacje ustawień i więcej.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Pozwól innemu członkowi wykonywać w Twoim imieniu większość działań na Twoim koncie. Nie obejmuje to akceptacji, płatności, odrzuceń i wstrzymań.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Usuń kopilota',
        removeCopilotConfirmation: 'Czy na pewno chcesz usunąć tego pilota współpracującego?',
        changeAccessLevel: 'Zmień poziom dostępu',
        makeSureItIsYou: 'Upewnijmy się, że to Ty',
        enterMagicCode: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby dodać pilota. Kod powinien dotrzeć w ciągu minuty lub dwóch.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby zaktualizować swojego copilota.`,
        notAllowed: 'Nie tak szybko...',
        noAccessMessage: dedent(`
            Jako kopilot nie masz dostępu do tej strony. Przepraszamy!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Jako <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">kopilot</a> dla ${accountOwnerEmail} nie masz uprawnień do wykonania tej akcji. Przepraszamy!`,
        copilotAccess: 'Dostęp do Copilota',
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
        missingProperty: ({propertyName}: MissingPropertyParams) => `Brak pola ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Nieprawidłowa właściwość: ${propertyName} – Oczekiwano: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Nieprawidłowa wartość – oczekiwano: ${expectedValues}`,
        missingValue: 'Brak wartości',
        createReportAction: 'Utwórz działanie raportu',
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
            hasGBR: 'Ma GBR',
            hasRBR: 'Ma RBR',
            pinnedByUser: 'Przypięte przez członka',
            hasIOUViolations: 'Ma naruszenia IOU',
            hasAddWorkspaceRoomErrors: 'Zawiera błędy dodawania pokoju przestrzeni roboczej',
            isUnread: 'Jest nieprzeczytane (tryb skupienia)',
            isArchived: 'Jest zarchiwizowane (najnowszy tryb)',
            isSelfDM: 'Własna wiadomość prywatna',
            isFocused: 'Jest tymczasowo w centrum uwagi',
        },
        reasonGBR: {
            hasJoinRequest: 'Ma prośbę o dołączenie (pokój administratora)',
            isUnreadWithMention: 'Nieprzeczytane z wzmianką',
            isWaitingForAssigneeToCompleteAction: 'Oczekuje, aż osoba przypisana wykona działanie',
            hasChildReportAwaitingAction: 'Posiada raport podrzędny oczekujący na działanie',
            hasMissingInvoiceBankAccount: 'Brakujący rachunek bankowy faktury',
            hasUnresolvedCardFraudAlert: 'Ma nierozwiązaną blokadę oszustwa na karcie',
            hasDEWApproveFailed: 'Zatwierdzenie DEW nie powiodło się',
        },
        reasonRBR: {
            hasErrors: 'Zawiera błędy w raporcie lub danych działań raportu',
            hasViolations: 'Ma naruszenia',
            hasTransactionThreadViolations: 'Ma naruszenia wątku transakcji',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Jest raport oczekujący na działanie',
            theresAReportWithErrors: 'Jest raport z błędami',
            theresAWorkspaceWithCustomUnitsErrors: 'Istnieje przestrzeń robocza z błędami niestandardowych jednostek',
            theresAProblemWithAWorkspaceMember: 'Wystąpił problem z członkiem przestrzeni roboczej',
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
        takeATestDrive: 'Wypróbuj wersję testową',
    },
    migratedUserWelcomeModal: {
        title: 'Witamy w Nowym Expensify!',
        subtitle: 'Zawiera wszystko, co lubisz w naszym klasycznym doświadczeniu, plus całą masę ulepszeń, które jeszcze bardziej ułatwią Ci życie:',
        confirmText: 'Ruszajmy!',
        helpText: 'Wypróbuj 2‑minutowe demo',
        features: {
            search: 'Potężniejsze wyszukiwanie w aplikacji mobilnej, w przeglądarce i na komputerze',
            concierge: 'Wbudowana Concierge AI, która pomaga zautomatyzować Twoje wydatki',
            chat: 'Czatuj przy każdym wydatku, aby szybko rozwiązać wątpliwości',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '<tooltip>Rozpocznij <strong>tutaj!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Zmień nazwę zapisanych wyszukiwań</strong> tutaj!</tooltip>',
        accountSwitcher: '<tooltip>Uzyskaj tutaj dostęp do <strong>kont Copilot</strong></tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Zeskanuj nasz przykładowy paragon</strong>, aby zobaczyć, jak to działa!</tooltip>',
            manager: '<tooltip>Wybierz naszego <strong>menedżera testów</strong>, aby go wypróbować!</tooltip>',
            confirmation: '<tooltip>Teraz <strong>wyślij swój wydatek</strong> i zobacz, jak dzieje się magia!</tooltip>',
            tryItOut: 'Wypróbuj to',
        },
        outstandingFilter: '<tooltip>Filtruj wydatki,\nktóre <strong>wymagają zatwierdzenia</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Wyślij ten paragon, aby\n<strong>zakończyć jazdę próbną!</strong></tooltip>',
        gpsTooltip: '<tooltip>Śledzenie GPS w toku! Gdy skończysz, zatrzymaj śledzenie poniżej.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Odrzucić zmiany?',
        body: 'Czy na pewno chcesz odrzucić wprowadzone zmiany?',
        confirmText: 'Odrzuć zmiany',
    },
    scheduledCall: {
        book: {
            title: 'Zaplanuj rozmowę',
            description: 'Znajdź termin, który Ci odpowiada.',
            slots: ({date}: {date: string}) => `<muted-text>Dostępne godziny na <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Potwierdź połączenie',
            description: 'Upewnij się, że poniższe szczegóły wyglądają dla Ciebie w porządku. Po potwierdzeniu rozmowy wyślemy zaproszenie z dodatkowymi informacjami.',
            setupSpecialist: 'Twój specjalista ds. konfiguracji',
            meetingLength: 'Długość spotkania',
            dateTime: 'Data i godzina',
            minutes: '30 minut',
        },
        callScheduled: 'Rozmowa zaplanowana',
    },
    autoSubmitModal: {
        title: 'Wszystko jasne i wysłane!',
        description: 'Wszystkie ostrzeżenia i naruszenia zostały usunięte, więc:',
        submittedExpensesTitle: 'Te wydatki zostały przesłane',
        submittedExpensesDescription: 'Te wydatki zostały wysłane do osoby zatwierdzającej, ale nadal można je edytować, dopóki nie zostaną zatwierdzone.',
        pendingExpensesTitle: 'Nierozliczone wydatki zostały przeniesione',
        pendingExpensesDescription: 'Wszystkie oczekujące wydatki z karty zostały przeniesione do osobnego raportu, dopóki nie zostaną zaksięgowane.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Wypróbuj w 2 minuty',
        },
        modal: {
            title: 'Wypróbuj nas w praktyce',
            description: 'Zrób krótkie wprowadzenie do produktu, aby szybko się wdrożyć.',
            confirmText: 'Rozpocznij jazdę testową',
            helpText: 'Pomiń',
            employee: {
                description:
                    '<muted-text>Zapewnij swojemu zespołowi <strong>3 darmowe miesiące Expensify!</strong> Wpisz poniżej adres e-mail swojego szefa i wyślij mu przykładowy wydatek.</muted-text>',
                email: 'Wpisz adres e-mail swojego szefa',
                error: 'Ten członek jest właścicielem przestrzeni roboczej, wprowadź nowego członka do przetestowania.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Aktualnie testujesz Expensify',
            readyForTheRealThing: 'Gotowy na prawdziwe wyzwanie?',
            getStarted: 'Rozpocznij',
        },
        employeeInviteMessage: (name: string) => `# ${name} zaprosił(a) Cię do wypróbowania Expensify
Cześć! Właśnie załatwiłem(am) nam *3 miesiące za darmo*, żeby wypróbować Expensify — najszybszy sposób rozliczania wydatków.

Oto *paragon testowy*, żeby pokazać Ci, jak to działa:`,
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
            accessYourDNS: ({domainName}: {domainName: string}) => `Przejdź do swojego dostawcy DNS i otwórz ustawienia DNS dla <strong>${domainName}</strong>.`,
            addTXTRecord: 'Dodaj następujący rekord TXT:',
            saveChanges: 'Zapisz zmiany i wróć tutaj, aby zweryfikować swoją domenę.',
            youMayNeedToConsult: `Aby zakończyć weryfikację, może być konieczne skontaktowanie się z działem IT Twojej organizacji. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Dowiedz się więcej</a>.`,
            warning: 'Po weryfikacji wszyscy członkowie Expensify w Twojej domenie otrzymają e-mail z informacją, że ich konto będzie zarządzane w ramach Twojej domeny.',
            codeFetchError: 'Nie udało się pobrać kodu weryfikacyjnego',
            genericError: 'Nie udało się zweryfikować Twojej domeny. Spróbuj ponownie i skontaktuj się z Concierge, jeśli problem będzie się powtarzał.',
        },
        domainVerified: {
            title: 'Domena zweryfikowana',
            header: 'Jest! Twoja domena została zweryfikowana',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Domena <strong>${domainName}</strong> została pomyślnie zweryfikowana i możesz teraz skonfigurować SAML oraz inne funkcje zabezpieczeń.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Pojedyncze logowanie SAML (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text>Funkcja <a href="${CONST.SAML_HELP_URL}">SAML SSO</a> zwiększa bezpieczeństwo i daje Ci większą kontrolę nad tym, jak członkowie z adresami e-mail <strong>${domainName}</strong> logują się do Expensify. Aby ją włączyć, musisz potwierdzić, że jesteś upoważnionym administratorem firmy.</muted-text>`,
            fasterAndEasierLogin: 'Szybsze i łatwiejsze logowanie',
            moreSecurityAndControl: 'Większe bezpieczeństwo i kontrola',
            onePasswordForAnything: 'Jedno hasło do wszystkiego',
        },
        goToDomain: 'Przejdź do domeny',
        samlLogin: {
            title: 'Logowanie SAML',
            subtitle: `<muted-text>Skonfiguruj logowanie członków za pomocą <a href="${CONST.SAML_HELP_URL}">jednokrotnego logowania SAML (SSO).</a></muted-text>`,
            enableSamlLogin: 'Włącz logowanie SAML',
            allowMembers: 'Zezwól członkom logować się przy użyciu SAML.',
            requireSamlLogin: 'Wymagaj logowania SAML',
            anyMemberWillBeRequired: 'Każda osoba należąca do zespołu, która jest zalogowana inną metodą, będzie musiała ponownie się uwierzytelnić za pomocą SAML.',
            enableError: 'Nie udało się zaktualizować ustawienia włączenia SAML',
            requireError: 'Nie można było zaktualizować ustawienia wymogu SAML',
            disableSamlRequired: 'Wyłącz wymaganie SAML',
            oktaWarningPrompt: 'Na pewno? Spowoduje to również wyłączenie Okta SCIM.',
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
            logoutUrl: 'Adres URL wylogowania',
            sloUrl: 'Adres URL SLO (Single Logout)',
            serviceProviderMetaData: 'Metadane usługodawcy',
            oktaScimToken: 'Token SCIM Okta',
            revealToken: 'Pokaż token',
            fetchError: 'Nie udało się pobrać szczegółów konfiguracji SAML',
            setMetadataGenericError: 'Nie można było ustawić metadanych SAML',
        },
        accessRestricted: {
            title: 'Dostęp ograniczony',
            subtitle: (domainName: string) => `Zwierzyń się proszę jako upoważniony administrator firmy dla <strong>${domainName}</strong>, jeśli potrzebujesz kontroli nad:`,
            companyCardManagement: 'Zarządzanie kartami służbowymi',
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
            description: 'Następnie musisz potwierdzić własność domeny i dostosować ustawienia zabezpieczeń.',
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
            consolidatedDomainBillingError: 'Nie można było zmienić zbiorczego rozliczania domeny. Spróbuj ponownie później.',
            addAdmin: 'Dodaj administratora',
            addAdminError: 'Nie można dodać tego członka jako administratora. Spróbuj ponownie.',
            revokeAdminAccess: 'Wycofaj dostęp administratora',
            cantRevokeAdminAccess: 'Nie można odebrać dostępu administratora osobie kontaktowej ds. technicznych',
            error: {
                removeAdmin: 'Nie można usunąć tego użytkownika jako administratora. Spróbuj ponownie.',
                removeDomain: 'Nie można usunąć tej domeny. Spróbuj ponownie.',
                removeDomainNameInvalid: 'Wpisz swoją nazwę domeny, aby ją zresetować.',
            },
            resetDomain: 'Resetuj domenę',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Wpisz proszę <strong>${domainName}</strong>, aby potwierdzić reset domeny.`,
            enterDomainName: 'Wprowadź tutaj swoją nazwę domeny',
            resetDomainInfo: `Ta czynność jest <strong>trwała</strong> i spowoduje usunięcie następujących danych: <br/> <ul><li>Połączeń z kartami firmowymi oraz wszystkich nierozliczonych wydatków z tych kart</li> <li>Ustawień SAML i grup</li> </ul> Wszystkie konta, przestrzenie robocze, raporty, wydatki i inne dane pozostaną bez zmian. <br/><br/>Uwaga: Możesz usunąć tę domenę z listy swoich domen, usuwając powiązany adres e-mail z <a href="#">metod kontaktu</a>.`,
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
