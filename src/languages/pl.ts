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
/* eslint-disable max-len */
const translations: TranslationDeepObject<typeof en> = {
    common: {
        // @context Used as a noun meaning a numerical total or quantity, not the verb “to count.”
        count: 'Liczba',
        cancel: 'Anuluj',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Zamknij',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Dalej',
        unshare: 'Cofnij udostępnianie',
        yes: 'Tak',
        no: 'Nie',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Nie teraz',
        noThanks: 'Nie, dziękuję',
        learnMore: 'Dowiedz się więcej',
        buttonConfirm: 'Rozumiem',
        name: 'Nazwa',
        attachment: 'Załącznik',
        attachments: 'Załączniki',
        center: 'Centrum',
        from: 'Od',
        to: 'Do',
        in: 'Włączone',
        optional: 'Opcjonalne',
        new: 'Nowe',
        search: 'Szukaj',
        reports: 'Raporty',
        find: 'Znajdź',
        searchWithThreeDots: 'Szukaj...',
        next: 'Dalej',
        previous: 'Wstecz',
        // @context Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.
        goBack: 'Wróć',
        create: 'Utwórz',
        add: 'Dodaj',
        resend: 'Wyślij ponownie',
        save: 'Zapisz',
        select: 'Wybierz',
        deselect: 'Odznacz',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Wielokrotny wybór',
        saveChanges: 'Zapisz zmiany',
        submit: 'Prześlij',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Wysłano',
        rotate: 'Obróć',
        zoom: 'Powiększenie',
        password: 'Hasło',
        magicCode: 'Kod magiczny',
        digits: 'cyfry',
        twoFactorCode: 'Kod dwuskładnikowy',
        workspaces: 'Obszary robocze',
        inbox: 'Skrzynka odbiorcza',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: 'Sukces',
        group: 'Grupa',
        profile: 'Profil',
        referral: 'Polecenie',
        payments: 'Płatności',
        approvals: 'Zatwierdzenia',
        wallet: 'Portfel',
        preferences: 'Preferencje',
        view: 'Zobacz',
        review: (reviewParams?: ReviewParams) => `Przejrzyj${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Nie',
        signIn: 'Zaloguj się',
        signInWithGoogle: 'Zaloguj się przez Google',
        signInWithApple: 'Zaloguj się z Apple',
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
        visible: 'Widoczne',
        delete: 'Usuń',
        // @context UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.
        archived: 'zarchiwizowano',
        contacts: 'Kontakty',
        recents: 'Ostatnie',
        close: 'Zamknij',
        comment: 'Komentarz',
        download: 'Pobierz',
        downloading: 'Pobieranie',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: 'Przesyłanie',
        // @context as a verb, not a noun
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
        noPO: 'Prosimy nie podawać skrytek pocztowych ani adresów punktów odbioru.',
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
        acceptTermsAndConditions: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">warunki i zasady</a>`,
        acceptTermsOfService: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi Expensify</a>`,
        remove: 'Usuń',
        admin: 'Administrator',
        owner: 'Właściciel',
        dateFormat: 'RRRR-MM-DD',
        send: 'Wyślij',
        na: 'brak danych',
        noResultsFound: 'Nie znaleziono wyników',
        noResultsFoundMatching: (searchString: string) => `Brak wyników pasujących do „${searchString}”`,
        recentDestinations: 'Ostatnie miejsca',
        timePrefix: 'To jest',
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
            acceptTerms: 'Musisz zaakceptować Warunki korzystania z usługi, aby kontynuować',
            phoneNumber: `Wprowadź pełny numer telefonu
(np. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'To pole jest wymagane',
            requestModified: 'Ten wniosek jest zmieniany przez innego członka',
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
            invalidTimeRange: 'Wprowadź godzinę w 12‑godzinnym formacie (np. 2:30 PM)',
            pleaseCompleteForm: 'Uzupełnij formularz powyżej, aby kontynuować',
            pleaseSelectOne: 'Wybierz jedną z powyższych opcji',
            invalidRateError: 'Wprowadź prawidłową stawkę',
            lowRateError: 'Stawka musi być większa niż 0',
            email: 'Wprowadź prawidłowy adres e‑mail',
            login: 'Wystąpił błąd podczas logowania. Spróbuj ponownie.',
        },
        comma: 'przecinek',
        semicolon: 'średnik',
        please: 'Proszę',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'skontaktuj się z nami',
        pleaseEnterEmailOrPhoneNumber: 'Wprowadź adres e-mail lub numer telefonu',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'napraw błędy',
        inTheFormBeforeContinuing: 'w formularzu przed kontynuowaniem',
        confirm: 'Potwierdź',
        reset: 'Resetuj',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
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
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: 'Wprowadź to ręcznie',
        message: 'Wiadomość',
        leaveThread: 'Opuść wątek',
        you: 'Ty',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'ja',
        youAfterPreposition: 'ty',
        your: 'twój',
        conciergeHelp: 'Skontaktuj się z Concierge, aby uzyskać pomoc.',
        youAppearToBeOffline: 'Wygląda na to, że jesteś offline.',
        thisFeatureRequiresInternet: 'Ta funkcja wymaga aktywnego połączenia z internetem.',
        attachmentWillBeAvailableOnceBackOnline: 'Załącznik będzie dostępny po ponownym połączeniu z internetem.',
        errorOccurredWhileTryingToPlayVideo: 'Wystąpił błąd podczas próby odtworzenia tego filmu.',
        areYouSure: 'Czy na pewno?',
        verify: 'Zweryfikuj',
        yesContinue: 'Tak, kontynuuj',
        // @context Provides an example format for a website URL.
        websiteExample: 'np. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `np. ${zipSampleFormat}` : ''),
        description: 'Opis',
        title: 'Tytuł',
        assignee: 'Przypisany',
        createdBy: 'Utworzono przez',
        with: 'z',
        shareCode: 'Udostępnij kod',
        share: 'Udostępnij',
        per: 'na',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
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
        nonBillable: 'Niefakturowane',
        tag: 'Tag',
        receipt: 'Paragon',
        verified: 'Zweryfikowano',
        replace: 'Zastąp',
        distance: 'Dystans',
        mile: 'mila',
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: 'mile',
        kilometer: 'kilometr',
        kilometers: 'kilometry',
        recent: 'Ostatnie',
        all: 'Wszystkie',
        am: 'AM',
        pm: 'PM',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
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
            title: 'Super! Wszystko nadrobione.',
            subtitleText1: 'Znajdź czat za pomocą',
            subtitleText2: 'przycisk powyżej lub utwórz coś, używając',
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
        // @context as a noun, not a verb
        draft: 'Wersja robocza',
        finished: 'Zakończono',
        upgrade: 'Ulepsz',
        downgradeWorkspace: 'Zmień pakiet przestrzeni roboczej na niższy',
        companyID: 'ID firmy',
        userID: 'Identyfikator użytkownika',
        disable: 'Wyłącz',
        export: 'Eksportuj',
        initialValue: 'Wartość początkowa',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Dzisiejsza data',
        value: 'Wartość',
        downloadFailedTitle: 'Pobieranie nie powiodło się',
        downloadFailedDescription: 'Nie udało się ukończyć pobierania. Spróbuj ponownie później.',
        filterLogs: 'Filtruj dzienniki',
        network: 'Sieć',
        reportID: 'ID raportu',
        longReportID: 'Długi identyfikator raportu',
        withdrawalID: 'ID wypłaty',
        bankAccounts: 'Konta bankowe',
        chooseFile: 'Wybierz plik',
        chooseFiles: 'Wybierz pliki',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Upuść tutaj',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Upuść tutaj plik',
        ignore: 'Ignoruj',
        enabled: 'Włączone',
        disabled: 'Wyłączone',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'Importuj',
        offlinePrompt: 'Nie możesz teraz wykonać tej akcji.',
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: 'Pozostałe',
        chats: 'Czaty',
        tasks: 'Zadania',
        unread: 'Nieprzeczytane',
        sent: 'Wysłano',
        links: 'Linki',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: 'dzień',
        days: 'dni',
        rename: 'Zmień nazwę',
        address: 'Adres',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Pomiń',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Potrzebujesz czegoś konkretnego? Porozmawiaj ze swoim opiekunem klienta, ${accountManagerDisplayName}.`,
        chatNow: 'Czat teraz',
        workEmail: 'Służbowy e-mail',
        destination: 'Miejsce docelowe',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Stawka dodatkowa',
        perDiem: 'Dieta',
        validate: 'Zatwierdź',
        downloadAsPDF: 'Pobierz jako PDF',
        downloadAsCSV: 'Pobierz jako CSV',
        help: 'Pomoc',
        expenseReport: 'Raport wydatków',
        expenseReports: 'Raporty wydatków',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Stawka poza zasadami',
        leaveWorkspace: 'Opuść przestrzeń roboczą',
        leaveWorkspaceConfirmation: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mógł(-mogła) przesyłać do niej wydatków.',
        leaveWorkspaceConfirmationAuditor: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mógł/mogła przeglądać jej raportów ani ustawień.',
        leaveWorkspaceConfirmationAdmin: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mógł zarządzać jej ustawieniami.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, w procesie zatwierdzania zastąpi Cię ${workspaceOwner}, właściciel przestrzeni roboczej.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, zostaniesz zastąpiony jako preferowany eksporter przez ${workspaceOwner}, właściciela przestrzeni roboczej.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, zostaniesz zastąpiony jako kontakt techniczny przez ${workspaceOwner}, właściciela przestrzeni roboczej.`,
        leaveWorkspaceReimburser:
            'Nie możesz opuścić tego obszaru roboczego jako osoba zwracająca wydatki. Ustaw nową osobę zwracającą wydatki w Obszary robocze > Dokonywanie lub śledzenie płatności, a następnie spróbuj ponownie.',
        reimbursable: 'Podlegające zwrotowi',
        editYourProfile: 'Edytuj swój profil',
        comments: 'Komentarze',
        sharedIn: 'Udostępnione w',
        unreported: 'Niezgłoszone',
        explore: 'Przeglądaj',
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
        after: 'Po',
        reschedule: 'Przełóż na inny termin',
        general: 'Ogólne',
        workspacesTabTitle: 'Obszary robocze',
        headsUp: 'Uwaga!',
        submitTo: 'Wyślij do',
        forwardTo: 'Przekaż do',
        merge: 'Połącz',
        none: 'Brak',
        unstableInternetConnection: 'Niestabilne połączenie z internetem. Sprawdź swoje łącze i spróbuj ponownie.',
        enableGlobalReimbursements: 'Włącz globalne zwroty',
        purchaseAmount: 'Kwota zakupu',
        originalAmount: 'Kwota pierwotna',
        frequency: 'Częstotliwość',
        link: 'Link',
        pinned: 'Przypięte',
        read: 'Przeczytane',
        copyToClipboard: 'Skopiuj do schowka',
        thisIsTakingLongerThanExpected: 'To trwa dłużej niż oczekiwano...',
        domains: 'Domeny',
        actionRequired: 'Wymagane działanie',
        duplicate: 'Duplikuj',
        duplicated: 'Zduplikowano',
        duplicateExpense: 'Duplikuj wydatek',
        exchangeRate: 'Kurs wymiany',
        reimbursableTotal: 'Suma do zwrotu',
        nonReimbursableTotal: 'Suma niepodlegająca zwrotowi',
    },
    supportalNoAccess: {
        title: 'Nie tak szybko',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Nie masz uprawnień do wykonania tej akcji, gdy wsparcie jest zalogowane (polecenie: ${command ?? ''}). Jeśli uważasz, że Success powinien mieć możliwość wykonania tej akcji, rozpocznij rozmowę na Slacku.`,
    },
    lockedAccount: {
        title: 'Zablokowane konto',
        description: 'Nie możesz wykonać tej akcji, ponieważ to konto zostało zablokowane. Skontaktuj się z concierge@expensify.com, aby poznać dalsze kroki.',
    },
    location: {
        useCurrent: 'Użyj bieżącej lokalizacji',
        notFound: 'Nie udało się ustalić Twojej lokalizacji. Spróbuj ponownie lub wprowadź adres ręcznie.',
        permissionDenied: 'Wygląda na to, że odmówiono dostępu do Twojej lokalizacji.',
        please: 'Proszę',
        allowPermission: 'zezwól na dostęp do lokalizacji w ustawieniach',
        tryAgain: 'i spróbuj ponownie.',
    },
    contact: {
        importContacts: 'Importuj kontakty',
        importContactsTitle: 'Zaimportuj swoje kontakty',
        importContactsText: 'Zaimportuj kontakty z telefonu, aby Twoje ulubione osoby były zawsze na wyciągnięcie ręki.',
        importContactsExplanation: 'więc Twoi ulubieni ludzie są zawsze na wyciągnięcie ręki.',
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
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Rozmiar załącznika przekracza limit ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Załącznik jest za mały',
        sizeNotMet: 'Rozmiar załącznika musi być większy niż 240 bajtów',
        wrongFileType: 'Nieprawidłowy typ pliku',
        notAllowedExtension: 'Ten typ pliku nie jest dozwolony. Spróbuj użyć innego typu pliku.',
        folderNotAllowedMessage: 'Przesyłanie folderu nie jest dozwolone. Spróbuj użyć innego pliku.',
        protectedPDFNotSupported: 'Plik PDF chroniony hasłem nie jest obsługiwany',
        attachmentImageResized: 'Ten obraz został zmieniony na potrzeby podglądu. Pobierz go, aby zobaczyć pełną rozdzielczość.',
        attachmentImageTooLarge: 'Ten obraz jest zbyt duży, aby wyświetlić jego podgląd przed przesłaniem.',
        tooManyFiles: (fileLimit: number) => `Możesz jednocześnie przesłać maksymalnie ${fileLimit} plików.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Plik przekracza ${maxUploadSizeInMB} MB. Spróbuj ponownie.`,
        someFilesCantBeUploaded: 'Niektórych plików nie można przesłać',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Pliki muszą mieć mniej niż ${maxUploadSizeInMB} MB. Większe pliki nie zostaną przesłane.`,
        maxFileLimitExceeded: 'Możesz przesłać jednocześnie maksymalnie 30 paragonów. Dodatkowe paragony nie zostaną przesłane.',
        unsupportedFileType: (fileType: string) => `Pliki typu ${fileType} nie są obsługiwane. Zostaną przesłane tylko obsługiwane typy plików.`,
        learnMoreAboutSupportedFiles: 'Dowiedz się więcej o obsługiwanych formatach.',
        passwordProtected: 'PDF-y chronione hasłem nie są obsługiwane. Zostaną przesłane tylko obsługiwane pliki.',
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
        updatePrompt: 'Nowa wersja tej aplikacji jest dostępna. Zaktualizuj ją teraz lub uruchom ponownie później, aby pobrać najnowsze zmiany.',
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
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Dane biometryczne (${registered ? 'Zarejestrowano' : 'Niezarejestrowany'})`,
            yourAttemptWasUnsuccessful: 'Próba uwierzytelnienia nie powiodła się.',
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
        youRanOutOfTime: 'Czas się skończył',
        letsVerifyItsYou: 'Zweryfikujmy, czy to na pewno Ty',
        verifyYourself: {
            biometrics: 'Zweryfikuj się twarzą lub odciskiem palca',
        },
        enableQuickVerification: {
            biometrics: 'Włącz szybkie i bezpieczne logowanie za pomocą twarzy lub odcisku palca. Bez haseł i kodów.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abrakadabra,
            jesteś zalogowany!
        `),
        successfulSignInDescription: 'Wróć do swojej pierwotnej karty, aby kontynuować.',
        title: 'Oto Twój kod magiczny',
        description: dedent(`
            Wprowadź kod z urządzenia, na którym został pierwotnie zażądany.
        `),
        doNotShare: dedent(`
            Nie udostępniaj nikomu swojego kodu.
            Expensify nigdy nie poprosi Cię o niego!
        `),
        or: 'lub',
        signInHere: 'wystarczy się tutaj zalogować',
        expiredCodeTitle: 'Kod magiczny wygasł',
        expiredCodeDescription: 'Wróć do oryginalnego urządzenia i poproś o nowy kod',
        successfulNewCodeRequest: 'Kod został wysłany. Sprawdź swoje urządzenie.',
        tfaRequiredTitle: dedent(`
            Wymagane uwierzytelnianie dwuskładnikowe
        `),
        tfaRequiredDescription: dedent(`
            Wprowadź kod uwierzytelniania dwuskładnikowego tam, gdzie próbujesz się zalogować.
        `),
        requestOneHere: 'złóż tutaj jedno żądanie.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Zapłacone przez',
        whatsItFor: 'Do czego to służy?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Imię, e-mail lub numer telefonu',
        findMember: 'Znajdź członka',
        searchForSomeone: 'Wyszukaj osobę',
    },
    customApprovalWorkflow: {
        title: 'Niestandardowy proces akceptacji',
        description: 'Twoja firma ma niestandardowy proces zatwierdzania w tym obszarze roboczym. Wykonaj tę akcję w Expensify Classic',
        goToExpensifyClassic: 'Przełącz na Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Zgłoś wydatek, poleć swój zespół',
            subtitleText: 'Chcesz, aby Twój zespół też korzystał z Expensify? Po prostu wyślij do nich wydatek, a my zajmiemy się resztą.',
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
        welcome: 'Witaj!',
        welcomeWithoutExclamation: 'Witamy',
        phrase2: 'Pieniądze mówią. A teraz, gdy czat i płatności są w jednym miejscu, to także proste.',
        phrase3: 'Twoje płatności docierają do Ciebie tak szybko, jak szybko potrafisz przekazać swoją myśl.',
        enterPassword: 'Wprowadź swoje hasło',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, zawsze miło widzieć tu nową twarz!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Wpisz magiczny kod wysłany na ${login}. Powinien dotrzeć w ciągu jednej lub dwóch minut.`,
    },
    login: {
        hero: {
            header: 'Podróże i wydatki w tempie czatu',
            body: 'Witamy w nowej generacji Expensify, gdzie Twoje podróże i wydatki przebiegają szybciej dzięki kontekstowemu czatowi w czasie rzeczywistym.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Kontynuuj logowanie za pomocą logowania jednokrotnego (SSO):',
        orContinueWithMagicCode: 'Możesz też zalogować się za pomocą magicznego kodu',
        useSingleSignOn: 'Użyj logowania jednokrotnego',
        useMagicCode: 'Użyj magicznego kodu',
        launching: 'Uruchamianie...',
        oneMoment: 'Chwileczkę, przekierowujemy Cię do firmowego portalu logowania jednokrotnego.',
    },
    reportActionCompose: {
        dropToUpload: 'Upuść, aby przesłać',
        sendAttachment: 'Wyślij załącznik',
        addAttachment: 'Dodaj załącznik',
        writeSomething: 'Napisz coś...',
        blockedFromConcierge: 'Komunikacja jest zabroniona',
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
            return `Czy na pewno chcesz usunąć ten/te ${type}?`;
        },
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
        reactedWith: 'zareagował(a) reakcją',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Przegapiłeś imprezę w <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, nie ma tu już nic do zobaczenia.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Ten czat obejmuje wszystkich członków Expensify w domenie <strong>${domainRoom}</strong>. Używaj go do rozmowy ze współpracownikami, dzielenia się wskazówkami i zadawania pytań.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Czatujesz z administratorem <strong>${workspaceName}</strong>. Użyj tego czatu, aby porozmawiać o konfiguracji przestrzeni roboczej i nie tylko.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Ten czat obejmuje wszystkich w <strong>${workspaceName}</strong>. Używaj go do najważniejszych ogłoszeń.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Ten pokój czatu służy do wszystkiego, co dotyczy <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Ta rozmowa służy do faktur między <strong>${invoicePayer}</strong> a <strong>${invoiceReceiver}</strong>. Użyj przycisku +, aby wysłać fakturę.`,
        beginningOfChatHistory: (users: string) => `Ta rozmowa jest z użytkownikami: ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Tutaj <strong>${submitterDisplayName}</strong> będzie przesyłać wydatki do <strong>${workspaceName}</strong>. Po prostu użyj przycisku +.`,
        beginningOfChatHistorySelfDM: 'To Twoja osobista przestrzeń. Używaj jej na notatki, zadania, szkice i przypomnienia.',
        beginningOfChatHistorySystemDM: 'Witamy! Przejdźmy do konfiguracji.',
        chatWithAccountManager: 'Porozmawiaj tutaj ze swoim opiekunem klienta',
        sayHello: 'Przywitaj się!',
        yourSpace: 'Twoja przestrzeń',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Witaj w ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Użyj przycisku +, aby ${additionalText} wydatek.`,
        askConcierge: 'Zadawaj pytania i korzystaj z całodobowego wsparcia w czasie rzeczywistym.',
        conciergeSupport: 'Wsparcie 24/7',
        create: 'utwórz',
        iouTypes: {
            pay: 'zapłać',
            split: 'podziel',
            submit: 'wyślij',
            track: 'śledzić',
            invoice: 'faktura',
        },
    },
    adminOnlyCanPost: 'Tylko administratorzy mogą wysyłać wiadomości w tym pokoju.',
    reportAction: {
        asCopilot: 'jako drugi pilot dla',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `utworzył(a) ten raport, aby zawierał wszystkie wydatki z <a href="${reportUrl}">${reportName}</a>, których nie można było przesłać z wybraną przez Ciebie częstotliwością`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `utworzył ten raport dla zatrzymanych wydatków z <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Powiadom wszystkich w tej rozmowie',
    },
    newMessages: 'Nowe wiadomości',
    latestMessages: 'Najnowsze wiadomości',
    youHaveBeenBanned: 'Uwaga: masz zakaz czatowania na tym kanale.',
    reportTypingIndicator: {
        isTyping: 'pisze...',
        areTyping: 'piszą...',
        multipleMembers: 'Wielu członków',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Ten czat został zarchiwizowany.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Ten czat nie jest już aktywny, ponieważ ${displayName} zamknął(a) swoje konto.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${oldDisplayName} połączył(-a) swoje konto z kontem ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Ten czat nie jest już aktywny, ponieważ <strong>nie jesteś</strong> już członkiem przestrzeni roboczej ${policyName}.`
                : `Ten czat nie jest już aktywny, ponieważ ${displayName} nie jest już członkiem przestrzeni roboczej ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${policyName} nie jest już aktywnym miejscem pracy.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${policyName} nie jest już aktywnym miejscem pracy.`,
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
        draftedMessage: 'Wiadomość robocza',
        listOfChatMessages: 'Lista wiadomości czatu',
        listOfChats: 'Lista czatów',
        saveTheWorld: 'Ocal świat',
        tooltip: 'Zacznij tutaj!',
        redirectToExpensifyClassicModal: {
            title: 'Wkrótce dostępne',
            description: 'Dopasowujemy jeszcze kilka elementów Nowego Expensify do Twojej konkretnej konfiguracji. W międzyczasie przejdź do Expensify Classic.',
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
        singleFieldMultipleColumns: (fieldName: string) => `Ups! Przypisałeś pojedyncze pole („${fieldName}”) do wielu kolumn. Sprawdź to i spróbuj ponownie.`,
        emptyMappedField: (fieldName: string) => `Ups! Pole („${fieldName}”) zawiera jedną lub więcej pustych wartości. Sprawdź je i spróbuj ponownie.`,
        importSuccessfulTitle: 'Import zakończony pomyślnie',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `Dodano ${categories} kategorii.` : 'Dodano 1 kategorię.'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'Nie dodano ani nie zaktualizowano żadnych członków.';
            }
            if (added && updated) {
                return `${added} member${added > 1 ? 's' : ''} added, ${updated} member${updated > 1 ? 's' : ''} updated.`;
            }
            if (updated) {
                return updated > 1 ? `Zaktualizowano ${updated} członków.` : 'Zaktualizowano 1 członka.';
            }
            return added > 1 ? `Dodano ${added} członków.` : 'Dodano 1 członka.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `Dodano ${tags} tagów.` : 'Dodano 1 znacznik.'),
        importMultiLevelTagsSuccessfulDescription: 'Dodano tagi wielopoziomowe.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `Dodano diety w liczbie ${rates}.` : 'Dodano 1 stawkę diety.'),
        importFailedTitle: 'Import zakończony niepowodzeniem',
        importFailedDescription: 'Upewnij się, że wszystkie pola zostały poprawnie wypełnione i spróbuj ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z Concierge.',
        importDescription: 'Wybierz, które pola zmapować z arkusza kalkulacyjnego, klikając menu rozwijane obok każdej zaimportowanej kolumny poniżej.',
        sizeNotMet: 'Rozmiar pliku musi być większy niż 0 bajtów',
        invalidFileMessage: 'Przesłany plik jest pusty lub zawiera nieprawidłowe dane. Upewnij się, że plik ma prawidłowy format i zawiera wymagane informacje, zanim prześlesz go ponownie.',
        importSpreadsheetLibraryError: 'Nie udało się wczytać modułu arkusza kalkulacyjnego. Sprawdź połączenie z internetem i spróbuj ponownie.',
        importSpreadsheet: 'Importuj arkusz kalkulacyjny',
        downloadCSV: 'Pobierz plik CSV',
        importMemberConfirmation: () => ({
            one: `Potwierdź poniższe dane nowego członka przestrzeni roboczej, który zostanie dodany w ramach tego przesyłania. Istniejący członkowie nie otrzymają żadnych aktualizacji ról ani zaproszeń.`,
            other: (count: number) =>
                `Potwierdź poniższe szczegóły dotyczące ${count} nowych członków przestrzeni roboczej, którzy zostaną dodani w ramach tego przesłania. Istniejący członkowie nie otrzymają żadnych aktualizacji ról ani wiadomości z zaproszeniami.`,
        }),
    },
    receipt: {
        upload: 'Prześlij paragon',
        uploadMultiple: 'Prześlij paragony',
        desktopSubtitleSingle: `lub przeciągnij i upuść go tutaj`,
        desktopSubtitleMultiple: `lub przeciągnij i upuść je tutaj`,
        alternativeMethodsTitle: 'Inne sposoby dodawania paragonów:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Pobierz aplikację</a>, aby skanować z telefonu</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Prześlij rachunki na adres <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Dodaj swój numer</a>, aby wysyłać paragony SMS-em na ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Wyślij paragony SMS-em na ${phoneNumber} (tylko numery z USA)</label-text>`,
        takePhoto: 'Zrób zdjęcie',
        cameraAccess: 'Dostęp do aparatu jest wymagany, aby robić zdjęcia paragonów.',
        deniedCameraAccess: `Uprawnienia dostępu do aparatu nadal nie zostały przyznane, postępuj zgodnie z <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">tymi instrukcjami</a>.`,
        cameraErrorTitle: 'Błąd aparatu',
        cameraErrorMessage: 'Wystąpił błąd podczas robienia zdjęcia. Spróbuj ponownie.',
        locationAccessTitle: 'Zezwól na dostęp do lokalizacji',
        locationAccessMessage: 'Dostęp do lokalizacji pomaga nam utrzymywać prawidłową strefę czasową i walutę, gdziekolwiek jesteś.',
        locationErrorTitle: 'Zezwól na dostęp do lokalizacji',
        locationErrorMessage: 'Dostęp do lokalizacji pomaga nam utrzymywać prawidłową strefę czasową i walutę, gdziekolwiek jesteś.',
        allowLocationFromSetting: `Dostęp do lokalizacji pomaga nam utrzymywać poprawną strefę czasową i walutę, gdziekolwiek jesteś. Prosimy o zezwolenie na dostęp do lokalizacji w ustawieniach uprawnień urządzenia.`,
        dropTitle: 'Odpuść to',
        dropMessage: 'Upuść tutaj swój plik',
        flash: 'błysk',
        multiScan: 'wielokrotne skanowanie',
        shutter: 'migawka',
        gallery: 'galeria',
        deleteReceipt: 'Usuń paragon',
        deleteConfirmation: 'Czy na pewno chcesz usunąć ten paragon?',
        addReceipt: 'Dodaj paragon',
        scanFailed: 'Nie można było zeskanować paragonu, ponieważ brakuje na nim sprzedawcy, daty lub kwoty.',
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
        noLongerHaveReportAccess: 'Nie masz już dostępu do swojego poprzedniego miejsca szybkiego działania. Wybierz poniżej nowe miejsce.',
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
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate}–${endDate} (${count} dni)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} od ${merchant}`,
        splitByPercentage: 'Podziel według procentów',
        splitByDate: 'Podziel według daty',
        addSplit: 'Dodaj podział',
        makeSplitsEven: 'Podziel po równo',
        editSplits: 'Edytuj podziały',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Kwota łączna jest o ${amount} wyższa niż pierwotny wydatek.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Kwota całkowita jest o ${amount} mniejsza niż pierwotny wydatek.`,
        splitExpenseZeroAmount: 'Wprowadź prawidłową kwotę przed kontynuowaniem.',
        splitExpenseOneMoreSplit: 'Nie dodano żadnych podziałów. Dodaj co najmniej jeden, aby zapisać.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Edytuj ${amount} dla ${merchant}`,
        removeSplit: 'Usuń podział',
        splitExpenseCannotBeEditedModalTitle: 'Tego wydatku nie można edytować',
        splitExpenseCannotBeEditedModalDescription: 'Zaakceptowane lub opłacone wydatki nie mogą być edytowane',
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
        removeExpenseConfirmation: 'Czy na pewno chcesz usunąć ten paragon? Tej czynności nie można cofnąć.',
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
        posted: 'Zaksięgowano',
        deleteReceipt: 'Usuń paragon',
        findExpense: 'Znajdź wydatek',
        deletedTransaction: (amount: string, merchant: string) => `usunął/ę wydatek (${amount} dla ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `przeniesiono wydatek${reportName ? `z ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `przeniósł ten wydatek${reportName ? `do <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `przeniósł ten wydatek${reportName ? `z <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `przeniósł ten wydatek do Twojej <a href="${reportUrl}">przestrzeni osobistej</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `przeniósł(-osła) ten raport do workspace’u <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `przeniósł ten <a href="${movedReportUrl}">raport</a> do przestrzeni roboczej <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Paragon oczekuje na dopasowanie do transakcji kartą',
        pendingMatch: 'Oczekujące dopasowanie',
        pendingMatchWithCreditCardDescription: 'Oczekujące dopasowanie rachunku do transakcji kartą. Oznacz jako gotówka, aby anulować.',
        markAsCash: 'Oznacz jako gotówkę',
        routePending: 'Trasowanie w toku...',
        receiptScanning: () => ({
            one: 'Skanowanie paragonu...',
            other: 'Skanowanie paragonów...',
        }),
        scanMultipleReceipts: 'Zeskanuj wiele paragonów',
        scanMultipleReceiptsDescription: 'Zrób zdjęcia wszystkich swoich paragonów naraz, a potem samodzielnie potwierdź szczegóły albo pozwól, byśmy zrobili to za Ciebie.',
        receiptScanInProgress: 'Trwa skanowanie paragonu',
        receiptScanInProgressDescription: 'Trwa skanowanie paragonu. Sprawdź później lub wprowadź szczegóły teraz.',
        removeFromReport: 'Usuń z raportu',
        moveToPersonalSpace: 'Przenieś wydatki do swojej przestrzeni osobistej',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Wykryto potencjalnie zduplikowane wydatki. Przejrzyj duplikaty, aby umożliwić wysłanie.'
                : 'Wykryto potencjalne zduplikowane wydatki. Przejrzyj duplikaty, aby umożliwić zatwierdzenie.',
        receiptIssuesFound: () => ({
            one: 'Wykryto problem',
            other: 'Znalezione problemy',
        }),
        fieldPending: 'Oczekuje…',
        defaultRate: 'Domyślna stawka',
        receiptMissingDetails: 'Brakujące dane na paragonie',
        missingAmount: 'Brakująca kwota',
        missingMerchant: 'Brak sprzedawcy',
        receiptStatusTitle: 'Skanowanie…',
        receiptStatusText: 'Tylko Ty widzisz ten paragon podczas skanowania. Sprawdź później lub wprowadź szczegóły teraz.',
        receiptScanningFailed: 'Skanowanie paragonu nie powiodło się. Wprowadź dane ręcznie.',
        transactionPendingDescription: 'Transakcja w toku. Zaksięgowanie może potrwać kilka dni.',
        companyInfo: 'Informacje o firmie',
        companyInfoDescription: 'Potrzebujemy jeszcze kilku informacji, zanim wyślesz swoją pierwszą fakturę.',
        yourCompanyName: 'Nazwa Twojej firmy',
        yourCompanyWebsite: 'Strona internetowa Twojej firmy',
        yourCompanyWebsiteNote: 'Jeśli nie masz strony internetowej, możesz zamiast niej podać firmowy profil na LinkedIn lub w mediach społecznościowych.',
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
        settledElsewhere: 'Opłacone gdzie indziej',
        individual: 'Osoba',
        business: 'Firma',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} z Expensify` : `Zapłać z Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako osoba prywatna` : `Zapłać z konta osobistego`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} z portfela` : `Zapłać portfelem`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Zapłać ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako firma` : `Zapłać z konta firmowego`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Oznacz ${formattedAmount} jako zapłacone` : `Oznacz jako opłacone`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z prywatnego konta ${last4Digits}` : `Zapłacono z konta prywatnego`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z firmowego konta ${last4Digits}` : `Zapłacono z konta firmowego`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Zapłać ${formattedAmount} przez ${policyName}` : `Zapłać przez ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z konta bankowego ${last4Digits}` : `zapłacono z konta bankowego ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `zapłacono ${amount ? `${amount} ` : ''} z konta bankowego ${last4Digits} przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady w przestrzeni roboczej</a>`,
        invoicePersonalBank: (lastFour: string) => `Konto osobiste • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Konto firmowe • ${lastFour}`,
        nextStep: 'Następne kroki',
        finished: 'Zakończono',
        flip: 'Odwróć',
        sendInvoice: ({amount}: RequestAmountParams) => `Wyślij fakturę na kwotę ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `przesłano${memo ? `, wpisując „${memo}”` : ''}`,
        automaticallySubmitted: `przesłane poprzez <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">opóźnianie zgłoszeń</a>`,
        queuedToSubmitViaDEW: 'w kolejce do przesłania przez niestandardowy proces zatwierdzania',
        trackedAmount: (formattedAmount: string, comment?: string) => `śledzenie ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `podziel ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `podziel ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Twój podział ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} jest winny ${amount}${comment ? `dla ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} jest winien:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}zapłacił(a) ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} zapłacił(a):`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} wydał(a) ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} wydał(a):`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} zatwierdził/a:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} zatwierdził(a) ${amount}`,
        payerSettled: (amount: number | string) => `zapłacono ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `zapłacono ${amount}. Dodaj konto bankowe, aby otrzymać płatność.`,
        automaticallyApproved: `zatwierdzone przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        approvedAmount: (amount: number | string) => `zatwierdzono ${amount}`,
        approvedMessage: `zatwierdzone`,
        unapproved: `niezatwierdzone`,
        automaticallyForwarded: `zatwierdzone przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        forwarded: `zatwierdzone`,
        rejectedThisReport: 'odrzucił(a) ten raport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `rozpoczął(-ęła) płatność, ale czeka, aż ${submitterDisplayName} doda konto bankowe.`,
        adminCanceledRequest: 'anulowano płatność',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `anulowano płatność ${amount}, ponieważ ${submitterDisplayName} nie włączył(-a) swojego portfela Expensify w ciągu 30 dni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} dodał(-a) konto bankowe. Płatność na kwotę ${amount} została dokonana.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}oznaczono jako opłacone${comment ? `, mówiąc „${comment}”` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}zapłacono z portfela`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}zapłacone w Expensify poprzez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        noReimbursableExpenses: 'Ten raport ma nieprawidłową kwotę',
        pendingConversionMessage: 'Suma zostanie zaktualizowana, gdy wrócisz do trybu online',
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
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} wysłano${comment ? `dla ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `przeniesiono wydatek z przestrzeni osobistej do ${workspaceName ?? `czat z ${reportName}`}`,
        movedToPersonalSpace: 'przeniesiono wydatek do przestrzeni osobistej',
        error: {
            invalidCategoryLength: 'Nazwa kategorii przekracza 255 znaków. Skróć ją lub wybierz inną kategorię.',
            invalidTagLength: 'Nazwa tagu przekracza 255 znaków. Skróć ją lub wybierz inny tag.',
            invalidAmount: 'Wprowadź prawidłową kwotę przed kontynuowaniem',
            invalidDistance: 'Przed kontynuowaniem wprowadź prawidłowy dystans',
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
            genericUnholdExpenseFailureMessage: 'Nieoczekiwany błąd podczas zdejmowania tego wydatku z wstrzymania. Spróbuj ponownie później.',
            receiptDeleteFailureError: 'Nieoczekiwany błąd podczas usuwania tego paragonu. Spróbuj ponownie później.',
            receiptFailureMessage: '<rbr>Wystąpił błąd podczas przesyłania paragonu. Prosimy <a href="download">zapisać paragon</a> i <a href="retry">spróbować ponownie</a> później.</rbr>',
            receiptFailureMessageShort: 'Wystąpił błąd podczas przesyłania paragonu.',
            genericDeleteFailureMessage: 'Nieoczekiwany błąd podczas usuwania tego wydatku. Spróbuj ponownie później.',
            genericEditFailureMessage: 'Nieoczekiwany błąd podczas edytowania tego wydatku. Spróbuj ponownie później.',
            genericSmartscanFailureMessage: 'W transakcji brakuje pól',
            duplicateWaypointsErrorMessage: 'Usuń duplikujące się punkty trasy',
            atLeastTwoDifferentWaypoints: 'Wprowadź co najmniej dwa różne adresy',
            splitExpenseMultipleParticipantsErrorMessage: 'Wydatek nie może zostać podzielony między przestrzeń roboczą a innych członków. Zaktualizuj swój wybór.',
            invalidMerchant: 'Wprowadź prawidłowego sprzedawcę',
            atLeastOneAttendee: 'Należy wybrać co najmniej jednego uczestnika',
            invalidQuantity: 'Wprowadź prawidłową ilość',
            quantityGreaterThanZero: 'Ilość musi być większa niż zero',
            invalidSubrateLength: 'Musi istnieć co najmniej jedna stawka podrzędna',
            invalidRate: 'Stawka jest nieprawidłowa dla tego obszaru roboczego. Wybierz dostępną stawkę z tego obszaru roboczego.',
            endDateBeforeStartDate: 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia',
            endDateSameAsStartDate: 'Data zakończenia nie może być taka sama jak data rozpoczęcia',
            manySplitsProvided: `Maksymalna dozwolona liczba podziałów to ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Zakres dat nie może przekraczać ${CONST.IOU.SPLITS_LIMIT} dni.`,
        },
        dismissReceiptError: 'Odrzuć błąd',
        dismissReceiptErrorConfirmation: 'Uwaga! Zamknięcie tego błędu spowoduje całkowite usunięcie przesłanego paragonu. Czy na pewno chcesz kontynuować?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `rozpoczął(a) rozliczanie. Płatność jest wstrzymana, dopóki ${submitterDisplayName} nie włączy swojego portfela.`,
        enableWallet: 'Włącz portfel',
        hold: 'Wstrzymaj',
        unhold: 'Usuń blokadę',
        holdExpense: () => ({
            one: 'Wstrzymaj wydatek',
            other: 'Wstrzymaj wydatki',
        }),
        unholdExpense: 'Odblokuj wydatek',
        heldExpense: 'wstrzymał ten wydatek',
        unheldExpense: 'zdjął(-ę) blokadę z tego wydatku',
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
        retract: 'Cofnij',
        reopened: 'ponownie otworzono',
        reopenReport: 'Otwórz raport ponownie',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Ten raport został już wyeksportowany do ${connectionName}. Zmiana może prowadzić do rozbieżności w danych. Czy na pewno chcesz ponownie otworzyć ten raport?`,
        reason: 'Powód',
        holdReasonRequired: 'Powód jest wymagany podczas wstrzymywania.',
        expenseWasPutOnHold: 'Wydatek został wstrzymany',
        expenseOnHold: 'Ten wydatek został wstrzymany. Przejrzyj komentarze, aby poznać kolejne kroki.',
        expensesOnHold: 'Wszystkie wydatki zostały wstrzymane. Przejrzyj komentarze, aby poznać kolejne kroki.',
        expenseDuplicate: 'Ten wydatek ma szczegóły podobne do innego. Sprawdź duplikaty, aby kontynuować.',
        someDuplicatesArePaid: 'Niektóre z tych duplikatów zostały już zatwierdzone lub opłacone.',
        reviewDuplicates: 'Sprawdź duplikaty',
        keepAll: 'Zachowaj wszystko',
        confirmApprove: 'Potwierdź kwotę zatwierdzenia',
        confirmApprovalAmount: 'Zatwierdź tylko zgodne wydatki lub zatwierdź cały raport.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz go zatwierdzić?',
            other: 'Te wydatki są wstrzymane. Czy mimo to chcesz je zatwierdzić?',
        }),
        confirmPay: 'Potwierdź kwotę płatności',
        confirmPayAmount: 'Zapłać tylko to, co nie jest wstrzymane, lub zapłać cały raport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz zapłacić?',
            other: 'Te wydatki są wstrzymane. Czy mimo to chcesz zapłacić?',
        }),
        payOnly: 'Tylko zapłać',
        approveOnly: 'Tylko zatwierdzaj',
        holdEducationalTitle: 'Czy powinieneś wstrzymać ten wydatek?',
        whatIsHoldExplain: 'Wstrzymanie to jak wciśnięcie „pauzy” na wydatku, dopóki nie będziesz gotowy, aby go przesłać.',
        holdIsLeftBehind: 'Wstrzymane wydatki nie są wysyłane, nawet jeśli prześlesz cały raport.',
        unholdWhenReady: 'Odblokuj wydatki, gdy będziesz gotów je złożyć.',
        changePolicyEducational: {
            title: 'Przeniosłeś(-aś) ten raport!',
            description: 'Sprawdź ponownie te elementy, które zwykle zmieniają się przy przenoszeniu raportów do nowej przestrzeni roboczej.',
            reCategorize: '<strong>Przeklasyfikuj wszystkie wydatki</strong>, aby były zgodne z zasadami przestrzeni roboczej.',
            workflows: 'Ten raport może teraz podlegać innemu <strong>obiegowi zatwierdzania.</strong>',
        },
        changeWorkspace: 'Zmień przestrzeń roboczą',
        set: 'ustaw',
        changed: 'zmieniono',
        removed: 'usunięto',
        transactionPending: 'Transakcja w trakcie przetwarzania.',
        chooseARate: 'Wybierz stawkę zwrotu kosztów za milę lub kilometr dla przestrzeni roboczej',
        unapprove: 'Cofnij zatwierdzenie',
        unapproveReport: 'Cofnij zatwierdzenie raportu',
        headsUp: 'Uwaga!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Ten raport został już wyeksportowany do ${accountingIntegration}. Zmiana może prowadzić do niezgodności danych. Czy na pewno chcesz cofnąć zatwierdzenie tego raportu?`,
        reimbursable: 'kwalifikujący się do zwrotu',
        nonReimbursable: 'bez zwrotu kosztów',
        bookingPending: 'Ta rezerwacja jest oczekująca',
        bookingPendingDescription: 'Ta rezerwacja jest w toku, ponieważ nie została jeszcze opłacona.',
        bookingArchived: 'Ta rezerwacja jest zarchiwizowana',
        bookingArchivedDescription: 'Ta rezerwacja została zarchiwizowana, ponieważ data podróży już minęła. W razie potrzeby dodaj wydatek na ostateczną kwotę.',
        attendees: 'Uczestnicy',
        whoIsYourAccountant: 'Kto jest Twoim księgowym?',
        paymentComplete: 'Płatność zakończona',
        time: 'Czas',
        startDate: 'Data rozpoczęcia',
        endDate: 'Data zakończenia',
        startTime: 'Czas rozpoczęcia',
        endTime: 'Czas zakończenia',
        deleteSubrate: 'Usuń podstawkę stawki',
        deleteSubrateConfirmation: 'Na pewno chcesz usunąć tę podstawkę?',
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
        submitsTo: ({name}: SubmitsToParams) => `Wysyła do ${name}`,
        reject: {
            educationalTitle: 'Wstrzymać czy odrzucić?',
            educationalText: 'Jeśli nie jesteś gotowy, aby zatwierdzić lub opłacić wydatek, możesz go wstrzymać lub odrzucić.',
            holdExpenseTitle: 'Wstrzymaj wydatek, aby poprosić o więcej szczegółów przed jego zatwierdzeniem lub opłaceniem.',
            approveExpenseTitle: 'Zatwierdzaj inne wydatki, podczas gdy wstrzymane wydatki pozostaną przypisane do Ciebie.',
            heldExpenseLeftBehindTitle: 'Zatrzymane wydatki zostają pominięte, gdy zatwierdzasz cały raport.',
            rejectExpenseTitle: 'Odrzuć wydatek, którego nie zamierzasz zatwierdzić ani opłacić.',
            reasonPageTitle: 'Odrzuć wydatek',
            reasonPageDescription: 'Wyjaśnij, dlaczego odrzucasz ten wydatek.',
            rejectReason: 'Powód odrzucenia',
            markAsResolved: 'Oznacz jako rozwiązane',
            rejectedStatus: 'Ten wydatek został odrzucony. Czekamy, aż naprawisz problemy i oznaczysz go jako rozwiązany, aby umożliwić przesłanie.',
            reportActions: {
                rejectedExpense: 'odrzucił(a) ten wydatek',
                markedAsResolved: 'oznaczył(-a) powód odrzucenia jako rozwiązany',
            },
        },
        moveExpenses: () => ({one: 'Przenieś wydatek', other: 'Przenieś wydatki'}),
        moveExpensesError: 'Nie możesz przenosić wydatków z tytułu diet do raportów w innych przestrzeniach roboczych, ponieważ stawki diet mogą się różnić między przestrzeniami roboczymi.',
        changeApprover: {
            title: 'Zmień zatwierdzającego',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Wybierz opcję, aby zmienić osobę zatwierdzającą ten raport. (Zaktualizuj swoje <a href="${workflowSettingLink}">ustawienia przestrzeni roboczej</a>, aby zmienić to na stałe dla wszystkich raportów.)`,
            changedApproverMessage: (managerID: number) => `zmienił(a) akceptującego na <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Dodaj akceptującego',
                addApproverSubtitle: 'Dodaj dodatkowego akceptującego do istniejącego procesu zatwierdzania.',
                bypassApprovers: 'Pomiń zatwierdzających',
                bypassApproversSubtitle: 'Przypisz siebie jako ostatecznego akceptującego i pomiń wszystkich pozostałych akceptujących.',
            },
            addApprover: {
                subtitle: 'Wybierz dodatkowego zatwierdzającego dla tego raportu, zanim przejdziemy dalej przez proces zatwierdzania.',
            },
        },
        chooseWorkspace: 'Wybierz przestrzeń roboczą',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `raport przekazano do ${to} z powodu niestandardowego procesu zatwierdzania`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'godzina' : 'godziny'} @ ${rate} / godzinę`,
            hrs: 'godz.',
            hours: 'Godziny',
            ratePreview: (rate: string) => `${rate} / godzina`,
            amountTooLargeError: 'Łączna kwota jest zbyt wysoka. Zmniejsz liczbę godzin lub obniż stawkę.',
        },
        correctDistanceRateError: 'Napraw błąd stawki za dystans i spróbuj ponownie.',
    },
    transactionMerge: {
        listPage: {
            header: 'Scal pozycje расходов',
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
                const article = StringUtils.startsWithVowel(field) ? 'an' : 'a';
                return `Wybierz ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Wybierz uczestników',
            selectAllDetailsError: 'Zaznacz wszystkie szczegóły przed kontynuowaniem.',
        },
        confirmationPage: {
            header: 'Potwierdź szczegóły',
            pageTitle: 'Potwierdź szczegóły, które zachowujesz. Szczegóły, których nie zachowasz, zostaną usunięte.',
            confirmButton: 'Scal pozycje расходов',
        },
    },
    share: {
        shareToExpensify: 'Udostępnij w Expensify',
        messageInputLabel: 'Wiadomość',
    },
    notificationPreferencesPage: {
        header: 'Preferencje powiadomień',
        label: 'Powiadom mnie o nowych wiadomościach',
        notificationPreferences: {
            always: 'Natychmiast',
            daily: 'Codziennie',
            mute: 'Wycisz',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Ukryte',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Numer nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny przez SMS.',
        emailHasNotBeenValidated: 'Adres e-mail nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny w wiadomości tekstowej.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Prześlij zdjęcie',
        removePhoto: 'Usuń zdjęcie',
        editImage: 'Edytuj zdjęcie',
        viewPhoto: 'Zobacz zdjęcie',
        imageUploadFailed: 'Przesyłanie obrazu nie powiodło się',
        deleteWorkspaceError: 'Przepraszamy, wystąpił nieoczekiwany problem podczas usuwania awatara Twojego workspace’u',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Wybrany obraz przekracza maksymalny rozmiar przesyłania ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Prześlij obraz o rozdzielczości większej niż ${minHeightInPx}x${minWidthInPx} pikseli i mniejszej niż ${maxHeightInPx}x${maxWidthInPx} pikseli.`,
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
        backdropLabel: 'Tło modala',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
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
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> prześlesz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> prześle wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na administratora, który prześle wydatki.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Nie są wymagane dalsze działania!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
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
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Twoje</strong> wydatki zostaną automatycznie złożone${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż wydatki użytkownika <strong>${actor}</strong> zostaną automatycznie przesłane${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na automatyczne przesłanie wydatków administratora${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
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
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie na <strong>Ciebie</strong> w sprawie zatwierdzenia wydatków.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie na zatwierdzenie wydatków przez <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na zatwierdzenie wydatków przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekuję, aż <strong>Ty</strong> wyeksportujesz ten raport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> wyeksportuje ten raport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na administratora, aby wyeksportował ten raport.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekuje na <strong>Ciebie</strong>, abyś opłacił(-a) wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie na to, aż <strong>${actor}</strong> zapłaci za wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na opłacenie wydatków przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> zakończysz konfigurację firmowego konta bankowego.`;
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Ups! Wygląda na to, że wysyłasz zgłoszenie do <strong>siebie</strong>. Zatwierdzanie własnych raportów jest <strong>zabronione</strong> w Twoim obszarze roboczym. Wyślij ten raport do kogoś innego lub skontaktuj się z administratorem, aby zmienić osobę, do której go wysyłasz.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'wkrótce',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'później dzisiaj',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'w niedzielę',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '1. i 16. dnia każdego miesiąca',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'w ostatnim dniu roboczym miesiąca',
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
        getInTouch: 'Będziemy używać tej metody, aby się z Tobą kontaktować.',
        enterMagicCode: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        setAsDefault: 'Ustaw jako domyślne',
        yourDefaultContactMethod: 'To jest Twoja domyślna metoda kontaktu. Zanim będziesz mógł ją usunąć, musisz wybrać inną metodę kontaktu i kliknąć „Ustaw jako domyślną”.',
        removeContactMethod: 'Usuń metodę kontaktu',
        removeAreYouSure: 'Czy na pewno chcesz usunąć tę metodę kontaktu? Tej akcji nie można cofnąć.',
        failedNewContact: 'Nie udało się dodać tej metody kontaktu.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Nie udało się wysłać nowego kodu magicznego. Proszę chwilę poczekać i spróbować ponownie.',
            validateSecondaryLogin: 'Nieprawidłowy lub nieważny kod jednorazowy. Spróbuj ponownie lub poproś o nowy kod.',
            deleteContactMethod: 'Nie udało się usunąć metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            setDefaultContactMethod: 'Nie udało się ustawić nowej domyślnej metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            addContactMethod: 'Nie udało się dodać tej metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            enteredMethodIsAlreadySubmitted: 'Ta metoda kontaktu już istnieje',
            passwordRequired: 'hasło jest wymagane.',
            contactMethodRequired: 'Metoda kontaktu jest wymagana',
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
        heHimHisTheyThemTheirs: 'On / Jego / Jemu / Oni / Ich / Ich',
        sheHerHers: 'Ona / Jej / Jej',
        sheHerHersTheyThemTheirs: 'Ona / Ją / Jej / Oni / Ich / Ich',
        merMers: 'Panie Mer / Państwo Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Za osobę / Na osobę',
        theyThemTheirs: 'Oni / Jego / Ich',
        thonThons: 'Ton / Tony',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vir / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Zaimek ze / hir',
        callMeByMyName: 'Zwracaj się do mnie po imieniu',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Nazwa wyświetlana',
        isShownOnProfile: 'Twoja nazwa wyświetlana jest pokazywana w Twoim profilu.',
    },
    timezonePage: {
        timezone: 'Strefa czasowa',
        isShownOnProfile: 'Twoja strefa czasowa jest wyświetlana w Twoim profilu.',
        getLocationAutomatically: 'Automatycznie określaj swoją lokalizację',
    },
    updateRequiredView: {
        updateRequired: 'Wymagana aktualizacja',
        pleaseInstall: 'Zaktualizuj proszę do najnowszej wersji New Expensify',
        pleaseInstallExpensifyClassic: 'Zainstaluj najnowszą wersję Expensify',
        toGetLatestChanges: 'Na telefonie pobierz i zainstaluj najnowszą wersję. W przeglądarce internetowej odśwież stronę.',
        newAppNotAvailable: 'Aplikacja New Expensify nie jest już dostępna.',
    },
    initialSettingsPage: {
        about: 'Informacje',
        aboutPage: {
            description: 'Nowa aplikacja Expensify jest tworzona przez społeczność programistów open-source z całego świata. Pomóż nam budować przyszłość Expensify.',
            appDownloadLinks: 'Linki do pobrania aplikacji',
            viewKeyboardShortcuts: 'Wyświetl skróty klawiaturowe',
            viewTheCode: 'Wyświetl kod',
            viewOpenJobs: 'Zobacz otwarte oferty pracy',
            reportABug: 'Zgłoś błąd',
            troubleshoot: 'Rozwiąż problemy',
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
                '<muted-text>Użyj poniższych narzędzi, aby pomóc rozwiązać problemy z działaniem Expensify. Jeśli napotkasz jakiekolwiek problemy, proszę <concierge-link>zgłoś błąd</concierge-link>.</muted-text>',
            confirmResetDescription: 'Wszystkie niewysłane wiadomości robocze zostaną utracone, ale reszta Twoich danych jest bezpieczna.',
            resetAndRefresh: 'Resetuj i odśwież',
            clientSideLogging: 'Rejestrowanie po stronie klienta',
            noLogsToShare: 'Brak dzienników do udostępnienia',
            useProfiling: 'Użyj profilowania',
            profileTrace: 'Śledzenie profilu',
            results: 'Wyniki',
            releaseOptions: 'Opcje wydania',
            testingPreferences: 'Preferencje testowe',
            useStagingServer: 'Użyj serwera stagingowego',
            forceOffline: 'Wymuś tryb offline',
            simulatePoorConnection: 'Symuluj słabe połączenie z internetem',
            simulateFailingNetworkRequests: 'Symuluj nieudane żądania sieciowe',
            authenticationStatus: 'Status uwierzytelniania',
            deviceCredentials: 'Dane uwierzytelniające urządzenia',
            invalidate: 'Unieważnij',
            destroy: 'Usuń',
            maskExportOnyxStateData: 'Maskuj wrażliwe dane członków podczas eksportu stanu Onyx',
            exportOnyxState: 'Eksportuj stan Onyx',
            importOnyxState: 'Importuj stan Onyx',
            testCrash: 'Test awarii',
            resetToOriginalState: 'Przywróć stan początkowy',
            usingImportedState: 'Używasz zaimportowanego stanu. Naciśnij tutaj, aby go wyczyścić.',
            debugMode: 'Tryb debugowania',
            invalidFile: 'Nieprawidłowy plik',
            invalidFileDescription: 'Plik, który próbujesz zaimportować, jest nieprawidłowy. Spróbuj ponownie.',
            invalidateWithDelay: 'Unieważnij z opóźnieniem',
            leftHandNavCache: 'Pamięć podręczna lewego panelu nawigacyjnego',
            clearleftHandNavCache: 'Wyczyść',
            recordTroubleshootData: 'Zapisz dane diagnostyczne',
            softKillTheApp: 'Miękko zamknij aplikację',
            kill: 'Zabij',
            sentryDebug: 'Debugowanie Sentry',
            sentryDebugDescription: 'Loguj żądania Sentry w konsoli',
            sentryHighlightedSpanOps: 'Nazwy wyróżnionych zakresów',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, nawigacja, ui.load',
        },
        debugConsole: {
            saveLog: 'Zapisz dziennik',
            shareLog: 'Udostępnij dziennik',
            enterCommand: 'Wpisz polecenie',
            execute: 'Wykonaj',
            noLogsAvailable: 'Brak dostępnych dzienników',
            logSizeTooLarge: ({size}: LogSizeParams) => `Rozmiar dziennika przekracza limit ${size} MB. Użyj opcji „Zapisz dziennik”, aby zamiast tego pobrać plik dziennika.`,
            logs: 'Dzienniki',
            viewConsole: 'Wyświetl konsolę',
        },
        security: 'Bezpieczeństwo',
        signOut: 'Wyloguj się',
        restoreStashed: 'Przywróć zapisane logowanie',
        signOutConfirmationText: 'Wylogowanie spowoduje utratę wszystkich zmian w trybie offline.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Przeczytaj <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki świadczenia usług</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politykę prywatności</a>.</muted-text-micro>`,
        help: 'Pomoc',
        whatIsNew: 'Nowości',
        accountSettings: 'Ustawienia konta',
        account: 'Konto',
        general: 'Ogólne',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Zamknij konto',
        reasonForLeavingPrompt: 'Byłoby nam bardzo przykro, gdybyś odszedł! Czy mógłbyś powiedzieć nam, dlaczego, abyśmy mogli się poprawić?',
        enterMessageHere: 'Wpisz tutaj wiadomość',
        closeAccountWarning: 'Zamknięcie konta jest nieodwracalne.',
        closeAccountPermanentlyDeleteData: 'Czy na pewno chcesz usunąć swoje konto? Spowoduje to trwałe usunięcie wszystkich nierozliczonych wydatków.',
        enterDefaultContactToConfirm: 'Wprowadź domyślną metodę kontaktu, aby potwierdzić, że chcesz zamknąć konto. Twoja domyślna metoda kontaktu to:',
        enterDefaultContact: 'Wprowadź domyślną metodę kontaktu',
        defaultContact: 'Domyślna metoda kontaktu:',
        enterYourDefaultContactMethod: 'Wprowadź domyślną metodę kontaktu, aby zamknąć swoje konto.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Połącz konta',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Wprowadź konto, które chcesz scalić z <strong>${login}</strong>.`,
            notReversibleConsent: 'Rozumiem, że to jest nieodwracalne',
        },
        accountValidate: {
            confirmMerge: 'Czy na pewno chcesz scalić konta?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Połączenie Twoich kont jest nieodwracalne i spowoduje utratę wszystkich niewysłanych wydatków dla użytkownika <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Aby kontynuować, wprowadź magiczny kod wysłany na <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Nieprawidłowy lub nieważny kod jednorazowy. Spróbuj ponownie lub poproś o nowy kod.',
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
            limitedSupport: 'Na razie nie obsługujemy łączenia kont w Nowym Expensify. Wykonaj tę akcję w Expensify Classic.',
            reachOutForHelp: '<muted-text><centered-text>Jeśli masz jakiekolwiek pytania, śmiało <concierge-link>skontaktuj się z Concierge</concierge-link>!</centered-text></muted-text>',
            goToExpensifyClassic: 'Przejdź do Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić <strong>${email}</strong>, ponieważ jest kontrolowany przez <strong>${email.split('@').at(1) ?? ''}</strong>. Prosimy <concierge-link>skontaktować się z Concierge</concierge-link> po pomoc.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić konta <strong>${email}</strong> z innymi kontami, ponieważ administrator Twojej domeny ustawił je jako główne logowanie. Zamiast tego scal inne konta z tym kontem.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Nie możesz scalić kont, ponieważ dla adresu <strong>${email}</strong> włączono uwierzytelnianie dwuskładnikowe (2FA). Wyłącz 2FA dla <strong>${email}</strong> i spróbuj ponownie.</centered-text></muted-text>`,
            learnMore: 'Dowiedz się więcej o łączeniu kont.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić <strong>${email}</strong>, ponieważ jest zablokowany. Prosimy <concierge-link>skontaktować się z Concierge</concierge-link> po pomoc.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Nie możesz scalić kont, ponieważ <strong>${email}</strong> nie ma konta w Expensify. Zamiast tego proszę <a href="${contactMethodLink}">dodać go jako metodę kontaktu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić konta <strong>${email}</strong> z innymi kontami. Zamiast tego scal inne konta z tym.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie można scalić kont z kontem <strong>${email}</strong>, ponieważ to konto jest właścicielem rozliczonej relacji rozliczeniowej.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Spróbuj ponownie później',
            description: 'Było zbyt wiele prób połączenia kont. Spróbuj ponownie później.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Nie możesz scalić z innymi kontami, ponieważ nie jest ono zweryfikowane. Zweryfikuj konto i spróbuj ponownie.',
        },
        mergeFailureSelfMerge: {
            description: 'Nie możesz scalić konta z nim samym.',
        },
        mergeFailureGenericHeading: 'Nie można scalić kont',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Zgłoś podejrzaną aktywność',
        lockAccount: 'Zablokuj konto',
        unlockAccount: 'Odblokuj konto',
        compromisedDescription:
            'Zauważyłeś coś niepokojącego na swoim koncie? Zgłoszenie tego natychmiast zablokuje Twoje konto, wstrzyma nowe transakcje kartą Expensify i uniemożliwi wprowadzanie jakichkolwiek zmian na koncie.',
        domainAdminsDescription: 'Dla administratorów domen: to również wstrzymuje całą aktywność Kart Expensify oraz działania administratorów we wszystkich Twoich domenach.',
        areYouSure: 'Czy na pewno chcesz zablokować swoje konto Expensify?',
        onceLocked: 'Po zablokowaniu Twoje konto będzie ograniczone do czasu złożenia prośby o odblokowanie i przeprowadzenia kontroli bezpieczeństwa',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Nie udało się zablokować konta',
        failedToLockAccountDescription: `Nie udało nam się zablokować Twojego konta. Skontaktuj się z Concierge na czacie, aby rozwiązać ten problem.`,
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
        twoFactorAuthEnabled: 'Uwierzytelnianie dwuskładnikowe włączone',
        whatIsTwoFactorAuth:
            'Uwierzytelnianie dwuskładnikowe (2FA) pomaga chronić Twoje konto. Podczas logowania musisz wprowadzić kod wygenerowany przez wybraną aplikację uwierzytelniającą.',
        disableTwoFactorAuth: 'Wyłącz uwierzytelnianie dwuskładnikowe',
        explainProcessToRemove: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod z aplikacji uwierzytelniającej.',
        explainProcessToRemoveWithRecovery: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod odzyskiwania.',
        disabled: 'Uwierzytelnianie dwuskładnikowe jest teraz wyłączone',
        noAuthenticatorApp: 'Nie będziesz już potrzebować aplikacji uwierzytelniającej, aby logować się do Expensify.',
        stepCodes: 'Kody odzyskiwania',
        keepCodesSafe: 'Zachowaj te kody odzyskiwania w bezpiecznym miejscu!',
        codesLoseAccess: dedent(`
            Jeśli utracisz dostęp do swojej aplikacji uwierzytelniającej i nie będziesz mieć tych kodów, utracisz dostęp do swojego konta.

            Uwaga: Skonfigurowanie logowania dwuskładnikowego spowoduje wylogowanie Cię ze wszystkich innych aktywnych sesji.
        `),
        errorStepCodes: 'Skopiuj lub pobierz kody przed kontynuowaniem',
        stepVerify: 'Zweryfikuj',
        scanCode: 'Zeskanuj kod QR za pomocą swojego',
        authenticatorApp: 'aplikacja uwierzytelniająca',
        addKey: 'Lub dodaj ten tajny klucz do swojej aplikacji uwierzytelniającej:',
        enterCode: 'Następnie wprowadź sześciocyfrowy kod wygenerowany przez aplikację uwierzytelniającą.',
        stepSuccess: 'Zakończono',
        enabled: 'Uwierzytelnianie dwuskładnikowe włączone',
        congrats: 'Gratulacje! Masz teraz dodatkowe zabezpieczenie.',
        copy: 'Kopiuj',
        disable: 'Wyłącz',
        enableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe',
        pleaseEnableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe.',
        twoFactorAuthIsRequiredDescription: 'Ze względów bezpieczeństwa Xero wymaga uwierzytelniania dwuskładnikowego, aby połączyć integrację.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Wymagane uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredForAdminsTitle: 'Włącz uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredXero: 'Twoje połączenie z Xero Accounting wymaga uwierzytelniania dwuskładnikowego.',
        twoFactorAuthIsRequiredCompany: 'Twoetapowe uwierzytelnianie jest wymagane przez Twoją firmę.',
        twoFactorAuthCannotDisable: 'Nie można wyłączyć 2FA',
        twoFactorAuthRequired: 'Uwierzytelnianie dwuskładnikowe (2FA) jest wymagane dla Twojego połączenia z Xero i nie może zostać wyłączone.',
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
        personalNoteMessage: 'Zapisuj notatki o tej rozmowie tutaj. Tylko Ty możesz je dodawać, edytować lub przeglądać.',
        sharedNoteMessage: 'Zapisuj tutaj notatki z tej rozmowy. Pracownicy Expensify i inni członkowie z domeny team.expensify.com mogą je wyświetlać.',
        composerLabel: 'Notatki',
        myNote: 'Moja notatka',
        error: {
            genericFailureMessage: 'Nie można było zapisać prywatnych notatek',
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
        paymentCurrencyDescription: 'Wybierz standardową walutę, na którą powinny być przeliczane wszystkie wydatki osobiste',
        note: `Uwaga: Zmiana waluty płatności może wpłynąć na to, ile zapłacisz za Expensify. Pełne informacje znajdziesz na naszej <a href="${CONST.PRICING}">stronie z cennikiem</a>.`,
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
        expiration: 'Data ważności',
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
        setDefaultConfirmation: 'Ustaw domyślną metodę płatności',
        setDefaultSuccess: 'Ustawiono domyślną metodę płatności!',
        deleteAccount: 'Usuń konto',
        deleteConfirmation: 'Czy na pewno chcesz usunąć to konto?',
        error: {
            notOwnerOfBankAccount: 'Wystąpił błąd podczas ustawiania tego konta bankowego jako domyślnej metody płatności',
            invalidBankAccount: 'To konto bankowe jest tymczasowo zawieszone',
            notOwnerOfFund: 'Wystąpił błąd podczas ustawiania tej karty jako domyślnej metody płatności',
            setDefaultFailure: 'Coś poszło nie tak. Skontaktuj się na czacie z Concierge, aby uzyskać dalszą pomoc.',
        },
        addBankAccountFailure: 'Wystąpił nieoczekiwany błąd podczas próby dodania Twojego konta bankowego. Spróbuj ponownie.',
        getPaidFaster: 'Otrzymuj płatności szybciej',
        addPaymentMethod: 'Dodaj metodę płatności, aby wysyłać i odbierać płatności bezpośrednio w aplikacji.',
        getPaidBackFaster: 'Otrzymuj zwroty szybciej',
        secureAccessToYourMoney: 'Bezpieczny dostęp do Twoich pieniędzy',
        receiveMoney: 'Otrzymuj pieniądze w swojej lokalnej walucie',
        expensifyWallet: 'Portfel Expensify (Beta)',
        sendAndReceiveMoney: 'Wysyłaj i odbieraj pieniądze ze znajomymi. Tylko rachunki bankowe w USA.',
        enableWallet: 'Włącz portfel',
        addBankAccountToSendAndReceive: 'Dodaj konto bankowe, aby wysyłać lub otrzymywać płatności.',
        addDebitOrCreditCard: 'Dodaj kartę debetową lub kredytową',
        assignedCards: 'Przydzielone karty',
        assignedCardsDescription: 'To są karty przypisane przez administratora przestrzeni roboczej do zarządzania wydatkami firmowymi.',
        expensifyCard: 'Karta Expensify',
        walletActivationPending: 'Sprawdzamy Twoje informacje. Sprawdź ponownie za kilka minut!',
        walletActivationFailed: 'Niestety, w tym momencie nie można włączyć Twojego portfela. Skontaktuj się z Concierge na czacie, aby uzyskać dalszą pomoc.',
        addYourBankAccount: 'Dodaj swoje konto bankowe',
        addBankAccountBody: 'Połącz swoje konto bankowe z Expensify, aby jeszcze łatwiej wysyłać i odbierać płatności bezpośrednio w aplikacji.',
        chooseYourBankAccount: 'Wybierz swoje konto bankowe',
        chooseAccountBody: 'Upewnij się, że wybierasz właściwą opcję.',
        confirmYourBankAccount: 'Potwierdź swoje konto bankowe',
        personalBankAccounts: 'Prywatne konta bankowe',
        businessBankAccounts: 'Firmowe konta bankowe',
        shareBankAccount: 'Udostępnij konto bankowe',
        bankAccountShared: 'Udostępniono konto bankowe',
        shareBankAccountTitle: 'Wybierz administratorów, z którymi chcesz udostępnić to konto bankowe:',
        shareBankAccountSuccess: 'Udostępniono konto bankowe!',
        shareBankAccountSuccessDescription: 'Wybrani administratorzy otrzymają wiadomość potwierdzającą od Concierge.',
        shareBankAccountFailure: 'Wystąpił nieoczekiwany błąd podczas próby udostępnienia konta bankowego. Spróbuj ponownie.',
        shareBankAccountEmptyTitle: 'Brak dostępnych administratorów',
        shareBankAccountEmptyDescription: 'Nie ma żadnych administratorów przestrzeni roboczej, z którymi możesz udostępnić to konto bankowe.',
        shareBankAccountNoAdminsSelected: 'Wybierz administratora przed kontynuowaniem',
        unshareBankAccount: 'Przestań udostępniać konto bankowe',
        unshareBankAccountDescription:
            'Wszyscy poniżej mają dostęp do tego konta bankowego. Możesz w każdej chwili odebrać dostęp. Nadal zrealizujemy wszystkie płatności w trakcie przetwarzania.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) =>
            `${admin} straci dostęp do tego firmowego konta bankowego. Nadal zrealizujemy wszystkie płatności w trakcie przetwarzania.`,
        reachOutForHelp: 'Jest używana z kartą Expensify. <concierge-link>Skontaktuj się z Concierge</concierge-link>, jeśli musisz cofnąć jej udostępnianie.',
        unshareErrorModalTitle: 'Nie można cofnąć udostępniania konta bankowego',
    },
    cardPage: {
        expensifyCard: 'Karta Expensify',
        expensifyTravelCard: 'Karta Podróżna Expensify',
        availableSpend: 'Pozostały limit',
        smartLimit: {
            name: 'Inteligentny limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Możesz wydać do ${formattedLimit} na tej karcie, a limit będzie się odnawiać w miarę zatwierdzania przesłanych przez Ciebie wydatków.`,
        },
        fixedLimit: {
            name: 'Stały limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Możesz wydać do ${formattedLimit} na tej karcie, a następnie zostanie ona dezaktywowana.`,
        },
        monthlyLimit: {
            name: 'Limit miesięczny',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Możesz wydawać do ${formattedLimit} miesięcznie na tej karcie. Limit będzie się resetować pierwszego dnia każdego miesiąca kalendarzowego.`,
        },
        virtualCardNumber: 'Numer karty wirtualnej',
        travelCardCvv: 'Kod CVV karty podróżnej',
        physicalCardNumber: 'Numer fizycznej karty',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Zamów kartę fizyczną',
        reportFraud: 'Zgłoś oszustwo kartą wirtualną',
        reportTravelFraud: 'Zgłoś oszustwo na karcie podróżnej',
        reviewTransaction: 'Sprawdź transakcję',
        suspiciousBannerTitle: 'Podejrzana transakcja',
        suspiciousBannerDescription: 'Wykryliśmy podejrzane transakcje na Twojej karcie. Stuknij poniżej, aby je sprawdzić.',
        cardLocked: 'Twoja karta jest tymczasowo zablokowana, podczas gdy nasz zespół sprawdza konto Twojej firmy.',
        cardDetails: {
            cardNumber: 'Numer karty wirtualnej',
            expiration: 'Wygaśnięcie',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Pokaż szczegóły',
            revealCvv: 'Pokaż kod CVV',
            copyCardNumber: 'Kopiuj numer karty',
            updateAddress: 'Zaktualizuj adres',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Dodano do portfela ${platform}`,
        cardDetailsLoadingFailure: 'Wystąpił błąd podczas wczytywania szczegółów karty. Sprawdź swoje połączenie internetowe i spróbuj ponownie.',
        validateCardTitle: 'Upewnijmy się, że to Ty',
        enterMagicCode: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby wyświetlić szczegóły swojej karty. Powinien dotrzeć w ciągu jednej–dwóch minut.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Proszę <a href="${missingDetailsLink}">dodaj swoje dane osobowe</a>, a następnie spróbuj ponownie.`,
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
        workflowDescription: 'Skonfiguruj proces od momentu poniesienia wydatku, łącznie z akceptacją i płatnością.',
        submissionFrequency: 'Zgłoszenia',
        submissionFrequencyDescription: 'Wybierz niestandardowy harmonogram przesyłania wydatków.',
        submissionFrequencyDateOfMonth: 'Dzień miesiąca',
        disableApprovalPromptDescription: 'Wyłączenie zatwierdzeń spowoduje usunięcie wszystkich istniejących procesów zatwierdzania.',
        addApprovalsTitle: 'Zatwierdzenia',
        addApprovalButton: 'Dodaj proces akceptacji',
        addApprovalTip: 'Ten domyślny przepływ pracy dotyczy wszystkich członków, chyba że istnieje bardziej szczegółowy przepływ pracy.',
        approver: 'Osoba zatwierdzająca',
        addApprovalsDescription: 'Wymagaj dodatkowej akceptacji przed autoryzacją płatności.',
        makeOrTrackPaymentsTitle: 'Płatności',
        makeOrTrackPaymentsDescription: 'Dodaj upoważnionego płatnika do płatności dokonywanych w Expensify lub śledź płatności dokonywane gdzie indziej.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>W tym workspace aktywny jest niestandardowy przepływ zatwierdzania. Aby go przejrzeć lub zmienić, skontaktuj się ze swoim <account-manager-link>Opiekunem konta</account-manager-link> lub z zespołem <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>W tym obszarze roboczym włączono niestandardowy proces zatwierdzania. Aby przejrzeć lub zmienić ten proces, skontaktuj się z <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wybierz, jak długo Expensify ma czekać przed udostępnieniem wydatków bez błędów.',
        },
        frequencyDescription: 'Wybierz, jak często wydatki mają być wysyłane automatycznie lub ustaw wysyłanie ręczne',
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
                one: 'św.',
                two: 'nd',
                few: 'rd',
                other: 'czw.',
                /* eslint-disable @typescript-eslint/naming-convention */
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
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Ten członek należy już do innego procesu zatwierdzania. Wszelkie zmiany wprowadzone tutaj będą widoczne także tam.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> już zatwierdza raporty dla <strong>${name2}</strong>. Wybierz innego zatwierdzającego, aby uniknąć cyklicznego obiegu.`,
        emptyContent: {
            title: 'Brak członków do wyświetlenia',
            expensesFromSubtitle: 'Wszyscy członkowie przestrzeni roboczej już należą do istniejącego procesu zatwierdzania.',
            approverSubtitle: 'Wszyscy zatwierdzający należą do istniejącego workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Nie udało się zmienić częstotliwości przesyłania. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        monthlyOffsetErrorMessage: 'Nie udało się zmienić miesięcznej częstotliwości. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Potwierdź',
        header: 'Dodaj więcej zatwierdzających i potwierdź.',
        additionalApprover: 'Dodatkowy zatwierdzający',
        submitButton: 'Dodaj przepływ pracy',
    },
    workflowsEditApprovalsPage: {
        title: 'Edytuj proces zatwierdzania',
        deleteTitle: 'Usuń proces zatwierdzania',
        deletePrompt: 'Czy na pewno chcesz usunąć ten proces akceptacji? Wszyscy członkowie będą następnie korzystać z domyślnego procesu.',
    },
    workflowsExpensesFromPage: {
        title: 'Wydatki od',
        header: 'Gdy następujący członkowie składają wydatki:',
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
                ? `Dodaj kolejnego zatwierdzającego, gdy <strong>${approverName}</strong> jest zatwierdzającym, a raport przekracza kwotę poniżej:`
                : 'Dodaj kolejnego akceptującego, gdy raport przekroczy kwotę poniżej:',
        reportAmountLabel: 'Kwota raportu',
        additionalApproverLabel: 'Dodatkowy zatwierdzający',
        skip: 'Pomiń',
        next: 'Dalej',
        removeLimit: 'Usuń limit',
        enterAmountError: 'Wprowadź prawidłową kwotę',
        enterApproverError: 'Osoba zatwierdzająca jest wymagana, gdy ustawisz limit raportu',
        enterBothError: 'Wprowadź kwotę raportu i dodatkowego zatwierdzającego',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Raporty powyżej ${approvalLimit} są przekazywane do ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Upoważniony płatnik',
        genericErrorMessage: 'Nie udało się zmienić upoważnionego płatnika. Spróbuj ponownie.',
        admins: 'Administratorzy',
        payer: 'Płatnik',
        paymentAccount: 'Konto płatnicze',
    },
    reportFraudPage: {
        title: 'Zgłoś oszustwo kartą wirtualną',
        description: 'Jeśli dane Twojej wirtualnej karty zostały skradzione lub przejęte, trwale dezaktywujemy Twoją obecną kartę i udostępnimy Ci nową wirtualną kartę z nowym numerem.',
        deactivateCard: 'Dezaktywuj kartę',
        reportVirtualCardFraud: 'Zgłoś oszustwo kartą wirtualną',
    },
    reportFraudConfirmationPage: {
        title: 'Zgłoszono oszustwo kartowe',
        description: 'Trwale dezaktywowaliśmy Twoją obecną kartę. Gdy wrócisz, aby zobaczyć szczegóły karty, będzie dostępna nowa karta wirtualna.',
        buttonText: 'Jasne, dziękuję!',
    },
    activateCardPage: {
        activateCard: 'Aktywuj kartę',
        pleaseEnterLastFour: 'Wprowadź ostatnie cztery cyfry swojej karty.',
        activatePhysicalCard: 'Aktywuj kartę fizyczną',
        error: {
            thatDidNotMatch: 'To nie pasuje do ostatnich 4 cyfr na Twojej karcie. Spróbuj ponownie.',
            throttled:
                'Zbyt wiele razy nieprawidłowo wprowadzono ostatnie 4 cyfry Twojej karty Expensify. Jeśli masz pewność, że numery są poprawne, skontaktuj się z Concierge, aby rozwiązać problem. W przeciwnym razie spróbuj ponownie później.',
        },
    },
    getPhysicalCard: {
        header: 'Zamów kartę fizyczną',
        nameMessage: 'Wpisz swoje imię i nazwisko, ponieważ będzie ono widoczne na Twojej karcie.',
        legalName: 'Imię i nazwisko (prawne)',
        legalFirstName: 'Imię (zgodne z dokumentem tożsamości)',
        legalLastName: 'Nazwisko zgodne z dokumentami',
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
        subtitle: 'Te zasady będą miały zastosowanie do Twoich wydatków. Jeśli przesyłasz je do przestrzeni roboczej, zasady tej przestrzeni mogą je zastąpić.',
        emptyRules: {
            title: 'Nie utworzono żadnych reguł',
            subtitle: 'Dodaj regułę, aby zautomatyzować raportowanie wydatków.',
        },
        changes: {
            billable: (value: boolean) => `Zaktualizuj wydatek ${value ? 'fakturowalne' : 'niepodlegające rozliczeniu'}`,
            category: (value: string) => `Zaktualizuj kategorię na „${value}”`,
            comment: (value: string) => `Zmień opis na „${value}”`,
            merchant: (value: string) => `Zaktualizuj sprzedawcę na „${value}”`,
            reimbursable: (value: boolean) => `Zaktualizuj wydatek ${value ? 'kwalifikujący się do zwrotu' : 'bez zwrotu kosztów'}`,
            report: (value: string) => `Dodaj do raportu o nazwie „${value}”`,
            tag: (value: string) => `Zaktualizuj tag na „${value}”`,
            tax: (value: string) => `Zaktualizuj stawkę podatku na „${value}”`,
        },
        newRule: 'Nowa reguła',
        addRule: {
            title: 'Dodaj regułę',
            expenseContains: 'Jeśli wydatek zawiera:',
            applyUpdates: 'Następnie zastosuj te aktualizacje:',
            merchantHint: 'Wpisz *, aby utworzyć regułę, która będzie stosowana do wszystkich sprzedawców',
            addToReport: 'Dodaj do raportu o nazwie',
            createReport: 'Utwórz raport, jeśli to konieczne',
            applyToExistingExpenses: 'Zastosuj do pasujących już wydatków',
            confirmError: 'Wpisz sprzedawcę i zastosuj co najmniej jedną zmianę',
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
            title: 'Preferencje testowe',
            subtitle: 'Ustawienia pomagające debugować i testować aplikację na środowisku staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Otrzymuj istotne aktualizacje funkcji i nowości Expensify',
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
                label: '#focus',
                description: 'Pokaż tylko nieprzeczytane, posortowane alfabetycznie',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `w ${policyName}`,
        generatingPDF: 'Wygeneruj PDF',
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
        lastMemberWarning: 'Ponieważ jesteś tu ostatnią osobą, wyjście spowoduje, że ten czat stanie się niedostępny dla wszystkich członków. Czy na pewno chcesz wyjść?',
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
        license: `<muted-text-xs>Usługę przekazu pieniężnego świadczy ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) na podstawie swoich <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licencji</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Nie otrzymano magicznego kodu?',
        enterAuthenticatorCode: 'Wprowadź swój kod z aplikacji uwierzytelniającej',
        enterRecoveryCode: 'Wprowadź swój kod odzyskiwania',
        requiredWhen2FAEnabled: 'Wymagane, gdy włączono 2FA',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Poproś o nowy kod za <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Poproś o nowy kod',
        error: {
            pleaseFillMagicCode: 'Wpisz swój magiczny kod',
            incorrectMagicCode: 'Nieprawidłowy lub nieważny kod jednorazowy. Spróbuj ponownie lub poproś o nowy kod.',
            pleaseFillTwoFactorAuth: 'Wprowadź swój kod uwierzytelniania dwuskładnikowego',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Proszę wypełnić wszystkie pola',
        pleaseFillPassword: 'Wprowadź swoje hasło',
        pleaseFillTwoFactorAuth: 'Wprowadź swój kod dwuskładnikowy',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Wprowadź swój kod uwierzytelniania dwuskładnikowego, aby kontynuować',
        forgot: 'Zapomniałeś?',
        requiredWhen2FAEnabled: 'Wymagane, gdy włączono 2FA',
        error: {
            incorrectPassword: 'Nieprawidłowe hasło. Spróbuj ponownie.',
            incorrectLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie.',
            incorrect2fa: 'Nieprawidłowy kod uwierzytelniania dwuskładnikowego. Spróbuj ponownie.',
            twoFactorAuthenticationEnabled: 'Masz włączone uwierzytelnianie dwuskładnikowe (2FA) na tym koncie. Zaloguj się, używając swojego adresu e-mail lub numeru telefonu.',
            invalidLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie lub zresetuj hasło.',
            unableToResetPassword:
                'Nie mogliśmy zmienić Twojego hasła. Prawdopodobnie wynika to z wygasłego linku do resetowania hasła w starym e-mailu resetującym hasło. Wysłaliśmy Ci nowy link, abyś mógł spróbować ponownie. Sprawdź swoją skrzynkę odbiorczą i folder spam; powinien dotrzeć w ciągu kilku minut.',
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
        cannotGetAccountDetails: 'Nie udało się pobrać szczegółów konta. Spróbuj zalogować się ponownie.',
        loginForm: 'Formularz logowania',
        notYou: ({user}: NotYouParams) => `To nie ${user}?`,
    },
    onboarding: {
        welcome: 'Witaj!',
        welcomeSignOffTitleManageTeam: 'Gdy ukończysz powyższe zadania, będziemy mogli poznać więcej funkcji, takich jak obiegi akceptacji i reguły!',
        welcomeSignOffTitle: 'Miło cię poznać!',
        explanationModal: {
            title: 'Witamy w Expensify',
            description: 'Jedna aplikacja do obsługi firmowych i prywatnych wydatków w tempie czatu. Wypróbuj ją i daj nam znać, co o niej myślisz. To dopiero początek!',
            secondaryDescription: 'Aby wrócić do Expensify Classic, stuknij swoje zdjęcie profilowe > Przejdź do Expensify Classic.',
        },
        getStarted: 'Rozpocznij',
        whatsYourName: 'Jak masz na imię?',
        peopleYouMayKnow: 'Osoby, które możesz znać, są już tutaj! Zweryfikuj swój adres e-mail, aby do nich dołączyć.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Ktoś z domeny ${domain} utworzył już przestrzeń roboczą. Wprowadź magiczny kod wysłany na adres ${email}.`,
        joinAWorkspace: 'Dołącz do przestrzeni roboczej',
        listOfWorkspaces: 'Oto lista przestrzeni roboczych, do których możesz dołączyć. Nie martw się, zawsze możesz zrobić to później, jeśli wolisz.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} członków${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Gdzie pracujesz?',
        errorSelection: 'Wybierz opcję, aby przejść dalej',
        purpose: {
            title: 'Co chcesz dzisiaj zrobić?',
            errorContinue: 'Naciśnij przycisk „Kontynuuj”, aby się skonfigurować',
            errorBackButton: 'Dokończ pytania konfiguracyjne, aby rozpocząć korzystanie z aplikacji',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Otrzymuję zwrot od mojego pracodawcy',
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
            title: 'Jakimi funkcjami jesteś zainteresowany?',
            featuresAlreadyEnabled: 'Oto nasze najpopularniejsze funkcje:',
            featureYouMayBeInterestedIn: 'Włącz dodatkowe funkcje:',
        },
        error: {
            requiredFirstName: 'Wprowadź swoje imię, aby kontynuować',
        },
        workEmail: {
            title: 'Jaki jest Twój służbowy e-mail?',
            subtitle: 'Expensify działa najlepiej, gdy połączysz swój służbowy e-mail.',
            explanationModal: {
                descriptionOne: 'Przekaż na adres receipts@expensify.com do zeskanowania',
                descriptionTwo: 'Dołącz do swoich współpracowników, którzy już korzystają z Expensify',
                descriptionThree: 'Korzystaj z bardziej spersonalizowanego doświadczenia',
            },
            addWorkEmail: 'Dodaj służbowy e-mail',
        },
        workEmailValidation: {
            title: 'Zweryfikuj swój służbowy adres e‑mail',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Wpisz magiczny kod wysłany na adres ${workEmail}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        },
        workEmailValidationError: {
            publicEmail: 'Wprowadź poprawny służbowy adres e-mail z prywatnej domeny, np. mitch@company.com',
            offline: 'Nie mogliśmy dodać Twojego służbowego adresu e-mail, ponieważ wyglądasz na offline',
        },
        mergeBlockScreen: {
            title: 'Nie można było dodać służbowego adresu e‑mail',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nie udało się dodać ${workEmail}. Spróbuj ponownie później w Ustawieniach lub porozmawiaj z Concierge, aby uzyskać wskazówki.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Wypróbuj w praktyce [jazdę próbną](${testDriveURL})`,
                description: ({testDriveURL}) => `[Weź szybką wycieczkę po produkcie](${testDriveURL}), aby zobaczyć, dlaczego Expensify jest najszybszym sposobem rozliczania wydatków.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Wypróbuj w praktyce [jazdę próbną](${testDriveURL})`,
                description: ({testDriveURL}) => `Wypróbuj nas w ramach [jazdy próbnej](${testDriveURL}) i zapewnij swojemu zespołowi *3 darmowe miesiące Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Dodaj zatwierdzanie wydatków',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Dodaj zatwierdzanie wydatków*, aby przeglądać wydatki swojego zespołu i utrzymywać je pod kontrolą.

                        Jak to zrobić:

                        1. Przejdź do *Obszary robocze*.
                        2. Wybierz swój obszar roboczy.
                        3. Kliknij *Więcej funkcji*.
                        4. Włącz *Workflows*.
                        5. Przejdź do *Workflows* w edytorze obszaru roboczego.
                        6. Włącz *Dodaj zatwierdzanie*.
                        7. Zostaniesz ustawiony jako osoba zatwierdzająca wydatki. Po zaproszeniu zespołu możesz zmienić to na dowolnego administratora.

                        [Przejdź do Więcej funkcji](${workspaceMoreFeaturesLink}).`),
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
                        *Skonfiguruj kategorie*, aby Twój zespół mógł księgować wydatki dla łatwiejszego raportowania.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Categories*.
                        4. Wyłącz wszystkie kategorie, których nie potrzebujesz.
                        5. Dodaj własne kategorie w prawym górnym rogu.

                        [Przejdź do ustawień kategorii w przestrzeni roboczej](${workspaceCategoriesLink}).

                        ![Skonfiguruj kategorie](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Zgłoś wydatek',
                description: dedent(`
                    *Zgłoś wydatek*, wpisując kwotę lub skanując paragon.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz wydatek*.
                    3. Wpisz kwotę lub zeskanuj paragon.
                    4. Dodaj adres e-mail lub numer telefonu swojego szefa.
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
                    *Śledź wydatek* w dowolnej walucie, niezależnie od tego, czy masz paragon, czy nie.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz wydatek*.
                    3. Wpisz kwotę lub zeskanuj paragon.
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
                        Połącz ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'twój' : 'do'} ${integrationName}, aby automatycznie księgować wydatki i synchronizować dane, co ułatwi zamknięcie miesiąca.

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
                title: ({corporateCardLink}) => `Podłącz [swoje karty firmowe](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Podłącz posiadane już karty, aby automatycznie importować transakcje, dopasowywać paragony i przeprowadzać uzgodnienia.

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
                        *Zaproś swój zespół* do Expensify, aby już dziś mógł zacząć śledzić wydatki.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoje miejsce pracy.
                        3. Kliknij *Members* > *Invite member*.
                        4. Wpisz adresy e‑mail lub numery telefonów.
                        5. Dodaj własną treść zaproszenia, jeśli chcesz!

                        [Przejdź do członków miejsca pracy](${workspaceMembersLink}).

                        ![Zaproś swój zespół](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Skonfiguruj [kategorie](${workspaceCategoriesLink}) i [tagi](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Skonfiguruj kategorie i tagi*, aby Twój zespół mógł księgować wydatki i ułatwić raportowanie.

                        Zaimportuj je automatycznie, [łącząc swój program księgowy](${workspaceAccountingLink}), lub skonfiguruj je ręcznie w [ustawieniach swojego workspace’u](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Skonfiguruj [tagi](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Używaj tagów, aby dodać do wydatków dodatkowe szczegóły, takie jak projekty, klienci, lokalizacje i działy. Jeśli potrzebujesz wielu poziomów tagów, możesz uaktualnić do planu Control.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *More features*.
                        4. Włącz *Tags*.
                        5. Przejdź do *Tags* w edytorze przestrzeni roboczej.
                        6. Kliknij *+ Add tag*, aby utworzyć własny.

                        [Przejdź do opcji *More features*](${workspaceMoreFeaturesLink}).

                        ![Skonfiguruj tagi](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Zaproś swoją(-ego) [księgową(-ego)](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Zaproś swojego księgowego*, aby współpracował przy Twoim obszarze roboczym i zarządzał wydatkami firmowymi.

                        1. Kliknij *Obszary robocze*.
                        2. Wybierz swój obszar roboczy.
                        3. Kliknij *Członkowie*.
                        4. Kliknij *Zaproś członka*.
                        5. Wpisz adres e-mail swojego księgowego.

                        [Zaproś księgowego teraz](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Rozpocznij czat',
                description: dedent(`
                    *Rozpocznij czat* z dowolną osobą, używając jej adresu e-mail lub numeru telefonu.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Rozpocznij czat*.
                    3. Wpisz adres e-mail lub numer telefonu.

                    Jeśli ta osoba nie korzysta jeszcze z Expensify, zaproszenie zostanie wysłane automatycznie.

                    Każdy czat zostanie też wysłany jako e-mail lub SMS, na który ta osoba może odpowiedzieć bezpośrednio.
                `),
            },
            splitExpenseTask: {
                title: 'Podziel wydatek',
                description: dedent(`
                    *Podziel wydatki* z jedną lub kilkoma osobami.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Rozpocznij czat*.
                    3. Wpisz adresy e-mail lub numery telefonów.
                    4. Kliknij szary przycisk *+* na czacie > *Podziel wydatek*.
                    5. Utwórz wydatek, wybierając *Ręcznie*, *Skanuj* lub *Dystans*.

                    Możesz dodać więcej szczegółów, jeśli chcesz, albo po prostu go wyślij. Odzyskaj swoje pieniądze!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Przejrzyj swoje [ustawienia przestrzeni roboczej](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Oto jak przejrzeć i zaktualizować ustawienia swojego workspace’u:
                        1. Kliknij Workspace’y.
                        2. Wybierz swój workspace.
                        3. Przejrzyj i zaktualizuj ustawienia.
                        [Przejdź do swojego workspace’u.](${workspaceSettingsLink})`),
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
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Wypróbuj w praktyce [jazdę próbną](${testDriveURL})` : 'Wypróbuj wersję testową'),
            embeddedDemoIframeTitle: 'Jazda próbna',
            employeeFakeReceipt: {
                description: 'Mój paragon za jazdę próbną!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Odzyskiwanie pieniędzy jest tak proste jak wysłanie wiadomości. Omówmy podstawy.',
            onboardingPersonalSpendMessage: 'Oto, jak śledzić swoje wydatki w kilku kliknięciach.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Twój bezpłatny okres próbny właśnie się rozpoczął! Skonfigurujmy wszystko.
                        👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Utworzyłem już przestrzeń roboczą, która pomoże zarządzać paragonami i wydatkami Twojego zespołu. Aby jak najlepiej wykorzystać 30-dniowy bezpłatny okres próbny, po prostu wykonaj pozostałe kroki konfiguracji poniżej!
                    `)
                    : dedent(`
                        # Twój bezpłatny okres próbny właśnie się rozpoczął! Skonfigurujmy wszystko.
                        👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Teraz, gdy utworzyłeś(-aś) przestrzeń roboczą, wykorzystaj w pełni 30-dniowy bezpłatny okres próbny, wykonując poniższe kroki!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Zaczynamy konfigurację\n👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Utworzyłem już przestrzeń roboczą, która pomoże Ci zarządzać paragonami i wydatkami. Aby jak najlepiej wykorzystać swój 30-dniowy bezpłatny okres próbny, wykonaj poniższe pozostałe kroki konfiguracji!',
            onboardingChatSplitMessage: 'Dzielenie rachunków ze znajomymi jest tak łatwe jak wysłanie wiadomości. Oto jak to działa.',
            onboardingAdminMessage: 'Dowiedz się, jak zarządzać przestrzenią roboczą swojego zespołu jako administrator i przesyłać własne wydatki.',
            onboardingLookingAroundMessage:
                'Expensify słynie przede wszystkim z rozliczania wydatków, podróży służbowych i obsługi kart firmowych, ale potrafi znacznie więcej. Daj znać, czym jesteś zainteresowany/zainteresowana, a pomogę Ci zacząć.',
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
            price: 'Wypróbuj za darmo przez 30 dni, a potem uaktualnij już od <strong>5 USD/użytkownika/miesiąc</strong>.',
            createWorkspace: 'Utwórz przestrzeń roboczą',
        },
        confirmWorkspace: {
            title: 'Potwierdź przestrzeń roboczą',
            subtitle: 'Utwórz przestrzeń roboczą do śledzenia paragonów, rozliczania wydatków, zarządzania podróżami, tworzenia raportów i nie tylko — wszystko w tempie czatu.',
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
        enterLegalName: 'Jakie jest twoje imię i nazwisko zgodne z dokumentami?',
        enterDateOfBirth: 'Jaka jest twoja data urodzenia?',
        enterAddress: 'Jaki jest Twój adres?',
        enterPhoneNumber: 'Jaki jest twój numer telefonu?',
        personalDetails: 'Dane osobowe',
        privateDataMessage: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane w Twoim publicznym profilu.',
        legalName: 'Imię i nazwisko (prawne)',
        legalFirstName: 'Imię (zgodne z dokumentem tożsamości)',
        legalLastName: 'Nazwisko zgodne z dokumentami',
        address: 'Adres',
        error: {
            dateShouldBeBefore: (dateString: string) => `Data musi być wcześniejsza niż ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `Data powinna być późniejsza niż ${dateString}`,
            hasInvalidCharacter: 'Nazwa może zawierać tylko znaki łacińskie',
            incorrectZipFormat: (zipFormat?: string) => `Nieprawidłowy format kodu pocztowego${zipFormat ? `Akceptowalny format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Upewnij się, że numer telefonu jest poprawny (np. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link został wysłany ponownie',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Wysłałem magiczny link logowania na adres ${login}. Sprawdź swój ${loginType}, aby się zalogować.`,
        resendLink: 'Wyślij link ponownie',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) => `Aby zweryfikować ${secondaryLogin}, wyślij ponownie magiczny kod z Ustawień konta ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Jeśli nie masz już dostępu do ${primaryLogin}, odłącz swoje konta.`,
        unlink: 'Odłącz',
        linkSent: 'Link wysłany!',
        successfullyUnlinkedLogin: 'Poboczne logowanie zostało pomyślnie odłączone!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Nasz dostawca poczty tymczasowo wstrzymał wysyłanie e-maili na adres ${login} z powodu problemów z dostarczaniem. Aby odblokować swój login, wykonaj następujące kroki:`,
        confirmThat: (login: string) =>
            `<strong>Potwierdź, że ${login} jest wpisany poprawnie i jest prawdziwym, dostarczalnym adresem e‑mail.</strong> Aliasy e‑mail, takie jak „expenses@domain.com”, muszą mieć dostęp do własnej skrzynki odbiorczej, aby mogły być używane jako prawidłowy login do Expensify.`,
        ensureYourEmailClient: `<strong>Upewnij się, że Twój klient poczty zezwala na wiadomości z expensify.com.</strong> Instrukcje, jak wykonać ten krok, znajdziesz <a href="${CONST.SET_NOTIFICATION_LINK}">tutaj</a>, ale możesz potrzebować pomocy działu IT przy konfiguracji ustawień poczty.`,
        onceTheAbove: `Po wykonaniu powyższych kroków skontaktuj się z <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, aby odblokować logowanie.`,
    },
    openAppFailureModal: {
        title: 'Coś poszło nie tak...',
        subtitle: `Nie udało nam się wczytać wszystkich Twoich danych. Zostaliśmy o tym poinformowani i sprawdzamy problem. Jeśli będzie się powtarzał, skontaktuj się z`,
        refreshAndTryAgain: 'Odśwież i spróbuj ponownie',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nie udało nam się dostarczyć wiadomości SMS na ${login}, więc tymczasowo go zawiesiliśmy. Spróbuj zweryfikować swój numer:`,
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
                return 'Proszę zaczekać chwilę przed ponowną próbą.';
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
            `Bądź na bieżąco, wyświetlając tylko nieprzeczytane czaty lub czaty wymagające Twojej uwagi. Nie martw się, możesz to zmienić w dowolnym momencie w <a href="${priorityModePageUrl}">ustawieniach</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Nie można znaleźć czatu, którego szukasz.',
        getMeOutOfHere: 'Zabierz mnie stąd',
        iouReportNotFound: 'Nie można odnaleźć szczegółów płatności, których szukasz.',
        notHere: 'Hmm... tego tu nie ma',
        pageNotFound: 'Ups, nie można znaleźć tej strony',
        noAccess: 'Ten czat lub wydatek mógł zostać usunięty albo nie masz do niego dostępu.\n\nW razie pytań skontaktuj się z concierge@expensify.com',
        goBackHome: 'Wróć do strony głównej',
        commentYouLookingForCannotBeFound: 'Nie można znaleźć komentarza, którego szukasz.',
        goToChatInstead: 'Zamiast tego przejdź do czatu.',
        contactConcierge: 'W razie pytań skontaktuj się z concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups... ${isBreakLine ? '\n' : ''}Coś poszło nie tak`,
        subtitle: 'Twoje żądanie nie mogło zostać zrealizowane. Spróbuj ponownie później.',
        wrongTypeSubtitle: 'To wyszukiwanie jest nieprawidłowe. Spróbuj zmienić kryteria wyszukiwania.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Dodaj emoji, aby ułatwić współpracownikom i znajomym zorientowanie się, co się dzieje. Opcjonalnie możesz też dodać wiadomość!',
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
        whenClearStatus: 'Kiedy mamy wyczyścić Twój status?',
        vacationDelegate: 'Zastępca urlopowy',
        setVacationDelegate: `Ustaw zastępcę na czas urlopu, aby zatwierdzał raporty w Twoim imieniu, gdy jesteś poza biurem.`,
        vacationDelegateError: 'Wystąpił błąd podczas aktualizowania Twojego zastępcy urlopowego.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `jako zastępca ${nameOrEmail} na czas urlopu`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `do ${submittedToName} jako zastępca urlopowy dla ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Przydzielasz ${nameOrEmail} jako swoją osobę zastępującą na czas urlopu. Nie uczestniczy ona jeszcze we wszystkich Twoich przestrzeniach roboczych. Jeśli zdecydujesz się kontynuować, do wszystkich administratorów Twoich przestrzeni roboczych zostanie wysłany e‑mail z prośbą o jej dodanie.`,
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
        desktopConnection: 'Uwaga: aby połączyć się z Chase, Wells Fargo, Capital One lub Bank of America, kliknij tutaj, aby dokończyć ten proces w przeglądarce.',
        yourDataIsSecure: 'Twoje dane są bezpieczne',
        toGetStarted: 'Dodaj konto bankowe, aby zwracać wydatki, wydawać karty Expensify, pobierać płatności za faktury i opłacać rachunki – wszystko w jednym miejscu.',
        plaidBodyCopy: 'Daj swoim pracownikom prostszy sposób płacenia – i otrzymywania zwrotów – za firmowe wydatki.',
        checkHelpLine: 'Twój numer rozliczeniowy i numer konta znajdziesz na czeku powiązanym z tym kontem.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Aby połączyć konto bankowe, <a href="${contactMethodRoute}">dodaj adres e-mail jako swój główny login</a> i spróbuj ponownie. Numer telefonu możesz dodać jako login dodatkowy.`,
        hasBeenThrottledError: 'Wystąpił błąd podczas dodawania Twojego konta bankowego. Poczekaj kilka minut i spróbuj ponownie.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Wygląda na to, że waluta Twojego workspace’u jest ustawiona na inną niż USD. Aby kontynuować, przejdź do <a href="${workspaceRoute}">ustawień workspace’u</a>, ustaw ją na USD i spróbuj ponownie.`,
        bbaAdded: 'Dodano firmowe konto bankowe!',
        bbaAddedDescription: 'Jest gotowe do użycia do płatności.',
        error: {
            youNeedToSelectAnOption: 'Wybierz opcję, aby kontynuować',
            noBankAccountAvailable: 'Przepraszamy, brak dostępnego konta bankowego',
            noBankAccountSelected: 'Wybierz konto',
            taxID: 'Wprowadź prawidłowy numer identyfikacji podatkowej',
            website: 'Wprowadź prawidłową stronę internetową',
            zipCode: `Wprowadź prawidłowy kod ZIP w formacie: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Wprowadź prawidłowy numer telefonu',
            email: 'Wprowadź prawidłowy adres e‑mail',
            companyName: 'Wprowadź prawidłową nazwę firmy',
            addressCity: 'Wprowadź prawidłowe miasto',
            addressStreet: 'Wpisz prawidłowy adres ulicy',
            addressState: 'Wybierz prawidłowy stan',
            incorporationDateFuture: 'Data rejestracji nie może być w przyszłości',
            incorporationState: 'Wybierz prawidłowy stan',
            industryCode: 'Wprowadź prawidłowy sześciocyfrowy kod klasyfikacji branży',
            restrictedBusiness: 'Potwierdź, że firma nie znajduje się na liście działalności objętych ograniczeniami',
            routingNumber: 'Wprowadź prawidłowy numer rozliczeniowy',
            accountNumber: 'Wpisz prawidłowy numer konta',
            routingAndAccountNumberCannotBeSame: 'Numery rozliczeniowy i konta nie mogą być takie same',
            companyType: 'Wybierz prawidłowy typ firmy',
            tooManyAttempts: 'Ze względu na dużą liczbę prób logowania ta opcja została wyłączona na 24 godziny. Spróbuj ponownie później lub wprowadź dane ręcznie.',
            address: 'Wprowadź prawidłowy adres',
            dob: 'Wybierz prawidłową datę urodzenia',
            age: 'Wymagany wiek powyżej 18 lat',
            ssnLast4: 'Wprowadź prawidłowe ostatnie 4 cyfry numeru SSN',
            firstName: 'Wprowadź poprawne imię',
            lastName: 'Wprowadź prawidłowe nazwisko',
            noDefaultDepositAccountOrDebitCardAvailable: 'Dodaj domyślne konto depozytowe lub kartę debetową',
            validationAmounts: 'Wprowadzone kwoty weryfikacyjne są nieprawidłowe. Sprawdź wyciąg bankowy i spróbuj ponownie.',
            fullName: 'Wprowadź prawidłowe pełne imię i nazwisko',
            ownershipPercentage: 'Wprowadź prawidłową wartość procentową',
            deletePaymentBankAccount:
                'To konto bankowe nie może zostać usunięte, ponieważ jest używane do płatności Expensify Card. Jeśli mimo to chcesz usunąć to konto, skontaktuj się z Concierge.',
            sameDepositAndWithdrawalAccount: 'Konto wpłaty i wypłaty jest takie samo.',
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
        confirmationStepSubHeader: 'Sprawdź dokładnie poniższe szczegóły i zaznacz pole z warunkami, aby potwierdzić.',
        toGetStarted: 'Dodaj osobiste konto bankowe, aby otrzymywać zwroty, opłacać faktury lub włączyć Portfel Expensify.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Wprowadź hasło do Expensify',
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
            title: 'PDF zabezpieczony hasłem',
            infoText: 'Ten plik PDF jest chroniony hasłem.',
            beforeLinkText: 'Proszę',
            linkText: 'wpisz hasło',
            afterLinkText: 'aby to wyświetlić.',
            formLabel: 'Wyświetl PDF',
        },
        attachmentNotFound: 'Załącznik nie został znaleziony',
        retry: 'Ponów próbę',
    },
    messages: {
        errorMessageInvalidPhone: `Wprowadź prawidłowy numer telefonu bez nawiasów i kresek. Jeśli jesteś poza USA, dodaj również kod kraju (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Nieprawidłowy adres e-mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest już członkiem ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest już administratorem ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Kontynuując wniosek o aktywację swojego Portfela Expensify, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
        facialScan: 'Polityka skanowania twarzy i zgoda Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Polityka i zgoda Onfido dotycząca skanowania twarzy</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Polityka prywatności</a> oraz <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Warunki korzystania z usługi</a>.</muted-text-micro>`,
        tryAgain: 'Spróbuj ponownie',
        verifyIdentity: 'Zweryfikuj tożsamość',
        letsVerifyIdentity: 'Zweryfikujmy Twoją tożsamość',
        butFirst: `Ale najpierw nudna część. Przeczytaj prawniczy żargon w następnym kroku i kliknij „Akceptuję”, kiedy będziesz gotowy.`,
        genericError: 'Wystąpił błąd podczas przetwarzania tego kroku. Spróbuj ponownie.',
        cameraPermissionsNotGranted: 'Włącz dostęp do aparatu',
        cameraRequestMessage: 'Potrzebujemy dostępu do aparatu, aby zakończyć weryfikację konta bankowego. Włącz go w Ustawieniach > New Expensify.',
        microphonePermissionsNotGranted: 'Włącz dostęp do mikrofonu',
        microphoneRequestMessage: 'Potrzebujemy dostępu do Twojego mikrofonu, aby ukończyć weryfikację konta bankowego. Włącz go w Ustawienia > New Expensify.',
        originalDocumentNeeded: 'Prześlij oryginalne zdjęcie swojego dokumentu tożsamości zamiast zrzutu ekranu lub zeskanowanego obrazu.',
        documentNeedsBetterQuality:
            'Wygląda na to, że Twój dokument tożsamości jest uszkodzony lub brakuje mu elementów zabezpieczających. Prześlij proszę oryginalne zdjęcie nieuszkodzonego dokumentu tożsamości, który będzie w całości widoczny.',
        imageNeedsBetterQuality: 'Wystąpił problem z jakością zdjęcia Twojego dokumentu. Prześlij nowe zdjęcie, na którym cały dokument będzie wyraźnie widoczny.',
        selfieIssue: 'Wystąpił problem z Twoim selfie/wideo. Prześlij proszę nowe, wykonane na żywo selfie/wideo.',
        selfieNotMatching: 'Twoje selfie/wideo nie pasuje do Twojego dokumentu tożsamości. Prześlij nowe selfie/wideo, na którym Twoja twarz będzie wyraźnie widoczna.',
        selfieNotLive: 'Twoje selfie/wideo nie wygląda na wykonane na żywo. Prześlij proszę selfie/wideo wykonane na żywo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dodatkowe szczegóły',
        helpText: 'Musimy potwierdzić poniższe informacje, zanim będziesz mógł wysyłać i otrzymywać pieniądze ze swojego portfela.',
        helpTextIdologyQuestions: 'Musimy zadać Ci jeszcze kilka pytań, aby dokończyć weryfikację Twojej tożsamości.',
        helpLink: 'Dowiedz się, dlaczego jest to potrzebne.',
        legalFirstNameLabel: 'Imię (zgodne z dokumentem tożsamości)',
        legalMiddleNameLabel: 'Drugie imię (oficjalne)',
        legalLastNameLabel: 'Nazwisko zgodne z dokumentami',
        selectAnswer: 'Wybierz odpowiedź, aby kontynuować',
        ssnFull9Error: 'Wprowadź prawidłowy dziewięciocyfrowy numer SSN',
        needSSNFull9: 'Mamy problem ze zweryfikowaniem Twojego numeru SSN. Wprowadź pełne dziewięć cyfr swojego numeru SSN.',
        weCouldNotVerify: 'Nie mogliśmy zweryfikować',
        pleaseFixIt: 'Popraw te informacje przed kontynuowaniem',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Nie udało się zweryfikować Twojej tożsamości. Spróbuj ponownie później lub skontaktuj się z <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, jeśli masz jakiekolwiek pytania.`,
    },
    termsStep: {
        headerTitle: 'Warunki i opłaty',
        headerTitleRefactor: 'Opłaty i warunki',
        haveReadAndAgreePlain: 'Przeczytałem(-am) i zgadzam się na otrzymywanie elektronicznych ujawnień.',
        haveReadAndAgree: `Przeczytałem(-am) i zgadzam się otrzymywać <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">ujawnienia elektroniczne</a>.`,
        agreeToThePlain: 'Akceptuję Politykę prywatności oraz regulamin Portfela.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Zgadzam się z <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Polityką prywatności</a> oraz <a href="${walletAgreementUrl}">Regulaminem portfela</a>.`,
        enablePayments: 'Włącz płatności',
        monthlyFee: 'Miesięczna opłata',
        inactivity: 'Brak aktywności',
        noOverdraftOrCredit: 'Brak funkcji debetu/kredytu.',
        electronicFundsWithdrawal: 'Elektroniczne wypłacenie środków',
        standard: 'Standard',
        reviewTheFees: 'Spójrz na niektóre opłaty.',
        checkTheBoxes: 'Zaznacz pola poniżej.',
        agreeToTerms: 'Zgódź się na warunki i wszystko będzie gotowe!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Portfel Expensify jest wydawany przez ${walletProgram}.`,
            perPurchase: 'Za zakup',
            atmWithdrawal: 'Wypłata z bankomatu',
            cashReload: 'Doładowanie gotówką',
            inNetwork: 'w sieci',
            outOfNetwork: 'poza siecią',
            atmBalanceInquiry: 'Sprawdzenie salda w bankomacie (w sieci lub poza siecią)',
            customerService: 'Obsługa klienta (zautomatyzowana lub z konsultantem na żywo)',
            inactivityAfterTwelveMonths: 'Brak aktywności (po 12 miesiącach bez transakcji)',
            weChargeOneFee: 'Pobieramy 1 inny rodzaj opłaty. Jest to:',
            fdicInsurance: 'Twoje środki kwalifikują się do ubezpieczenia FDIC.',
            generalInfo: `Ogólne informacje o rachunkach przedpłaconych znajdziesz na stronie <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Szczegółowe informacje i warunki dotyczące wszystkich opłat i usług znajdziesz na stronie <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> lub dzwoniąc pod numer +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektroniczne wycofanie środków (natychmiastowe)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Lista wszystkich opłat Expensify Wallet',
            typeOfFeeHeader: 'Wszystkie opłaty',
            feeAmountHeader: 'Kwota',
            moreDetailsHeader: 'Szczegóły',
            openingAccountTitle: 'Otwarcie konta',
            openingAccountDetails: 'Otworzenie konta jest bezpłatne.',
            monthlyFeeDetails: 'Brak miesięcznej opłaty.',
            customerServiceTitle: 'Obsługa klienta',
            customerServiceDetails: 'Nie ma żadnych opłat za obsługę klienta.',
            inactivityDetails: 'Brak opłaty za nieaktywność.',
            sendingFundsTitle: 'Wysyłanie środków do innego posiadacza konta',
            sendingFundsDetails: 'Nie ma opłat za przesyłanie środków do innego posiadacza konta przy użyciu Twojego salda, konta bankowego lub karty debetowej.',
            electronicFundsStandardDetails:
                'Przelew środków z Twojego portfela Expensify na konto bankowe przy użyciu standardowej opcji jest bezpłatny. Taki przelew zwykle zostaje zrealizowany w ciągu 1–3 dni roboczych.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Przelew środków z Twojego portfela Expensify na powiązaną kartę debetową przy użyciu opcji przelewu natychmiastowego wiąże się z opłatą. Taki przelew zazwyczaj zostaje zrealizowany w ciągu kilku minut.' +
                `Opłata wynosi ${percentage}% kwoty przelewu (z minimalną opłatą ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Twoje środki kwalifikują się do objęcia ubezpieczeniem FDIC. Twoje środki będą przechowywane w lub przeniesione do ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, instytucji ubezpieczonej przez FDIC.` +
                `Gdy już tam trafią, Twoje środki są ubezpieczone przez FDIC do kwoty ${amount} na wypadek upadku ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, jeśli zostaną spełnione określone wymogi dotyczące ubezpieczenia depozytów, a Twoja karta jest zarejestrowana. Szczegóły znajdziesz w ${CONST.TERMS.FDIC_PREPAID}.`,
            contactExpensifyPayments: `Skontaktuj się z ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}, dzwoniąc pod numer +1 833-400-0904, wysyłając e-mail na adres ${CONST.EMAIL.CONCIERGE} lub logując się na ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Aby uzyskać ogólne informacje na temat rachunków przedpłaconych, odwiedź ${CONST.TERMS.CFPB_PREPAID}. Jeśli masz skargę dotyczącą rachunku przedpłaconego, zadzwoń do Biura Ochrony Finansowej Konsumenta pod numer 1-855-411-2372 lub odwiedź ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Wyświetl wersję przyjazną dla drukarki',
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
        checkBackLaterMessage: 'Nadal sprawdzamy Twoje informacje. Sprawdź ponownie później.',
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
        incorporationDatePlaceholder: 'Data rozpoczęcia (rrrr-mm-dd)',
        incorporationTypes: {
            LLC: 'spółka z o.o.',
            CORPORATION: 'Firma',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Spółdzielnia',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        industryClassification: 'Do jakiej branży zaklasyfikowana jest firma?',
        industryClassificationCodePlaceholder: 'Wyszukaj kod klasyfikacji branżowej',
    },
    requestorStep: {
        headerTitle: 'Dane osobowe',
        learnMore: 'Dowiedz się więcej',
        isMyDataSafe: 'Czy moje dane są bezpieczne?',
    },
    personalInfoStep: {
        personalInfo: 'Dane osobowe',
        enterYourLegalFirstAndLast: 'Jakie jest twoje imię i nazwisko zgodne z dokumentami?',
        legalFirstName: 'Imię (zgodne z dokumentem tożsamości)',
        legalLastName: 'Nazwisko zgodne z dokumentami',
        legalName: 'Imię i nazwisko (prawne)',
        enterYourDateOfBirth: 'Jaka jest twoja data urodzenia?',
        enterTheLast4: 'Jakie są ostatnie cztery cyfry Twojego numeru Social Security?',
        dontWorry: 'Spokojnie, nie sprawdzamy Twojej osobistej zdolności kredytowej!',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        enterYourAddress: 'Jaki jest Twój adres?',
        address: 'Adres',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś(-aś), rozumiesz i akceptujesz',
        whatsYourLegalName: 'Jakie jest Twoje imię i nazwisko zgodne z dokumentami?',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatsYourSSN: 'Jakie są ostatnie cztery cyfry Twojego numeru Social Security?',
        noPersonalChecks: 'Spokojnie, tutaj nie sprawdzamy Twojej historii kredytowej!',
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
        selectYourCompanyType: 'Jakiego typu jest to firma?',
        companyType: 'Typ firmy',
        incorporationType: {
            LLC: 'spółka z o.o.',
            CORPORATION: 'Firma',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Spółdzielnia',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        selectYourCompanyIncorporationDate: 'Jaka jest data rejestracji Twojej firmy?',
        incorporationDate: 'Data rejestracji firmy',
        incorporationDatePlaceholder: 'Data rozpoczęcia (rrrr-mm-dd)',
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
                    return 'Czym jest Numer Identyfikacyjny Pracodawcy (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Co to jest numer BN (Business Number)?';
                case CONST.COUNTRY.GB:
                    return 'Jaki jest numer identyfikacyjny VAT (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Co to jest australijski numer identyfikacyjny ABN (Australian Business Number)?';
                default:
                    return 'Jaki jest numer VAT UE?';
            }
        },
        whatsThisNumber: 'Co to za numer?',
        whereWasTheBusinessIncorporated: 'Gdzie została zarejestrowana firma?',
        whatTypeOfBusinessIsIt: 'Jaki to rodzaj działalności?',
        whatsTheBusinessAnnualPayment: 'Jaki jest roczny wolumen płatności firmy?',
        whatsYourExpectedAverageReimbursements: 'Jaka jest Twoja oczekiwana średnia kwota zwrotu?',
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
        businessAddress: 'Adres firmowy',
        businessType: 'Rodzaj działalności',
        incorporation: 'Rejestracja firmy',
        incorporationCountry: 'Kraj rejestracji spółki',
        incorporationTypeName: 'Forma prawna firmy',
        businessCategory: 'Kategoria biznesowa',
        annualPaymentVolume: 'Roczny wolumen płatności',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Roczna kwota płatności w ${currencyCode}`,
        averageReimbursementAmount: 'Średnia kwota zwrotu',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Średnia kwota zwrotu w ${currencyCode}`,
        selectIncorporationType: 'Wybierz typ rejestracji firmy',
        selectBusinessCategory: 'Wybierz kategorię firmową',
        selectAnnualPaymentVolume: 'Wybierz roczny wolumen płatności',
        selectIncorporationCountry: 'Wybierz kraj rejestracji firmy',
        selectIncorporationState: 'Wybierz stan rejestracji',
        selectAverageReimbursement: 'Wybierz średnią kwotę zwrotu',
        selectBusinessType: 'Wybierz typ działalności',
        findIncorporationType: 'Znajdź formę prawną',
        findBusinessCategory: 'Znajdź kategorię biznesową',
        findAnnualPaymentVolume: 'Znajdź roczny wolumen płatności',
        findIncorporationState: 'Znajdź stan rejestracji spółki',
        findAverageReimbursement: 'Znajdź średnią kwotę zwrotu',
        findBusinessType: 'Znajdź typ działalności',
        error: {
            registrationNumber: 'Podaj prawidłowy numer rejestracyjny',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Podaj prawidłowy numer identyfikacyjny pracodawcy (EIN)';
                    case CONST.COUNTRY.CA:
                        return 'Podaj poprawny numer identyfikacyjny firmy (BN)';
                    case CONST.COUNTRY.GB:
                        return 'Podaj prawidłowy numer identyfikacyjny VAT (VRN)';
                    case CONST.COUNTRY.AU:
                        return 'Podaj prawidłowy australijski numer ABN (Australian Business Number)';
                    default:
                        return 'Podaj prawidłowy numer VAT UE';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Czy posiadasz 25% lub więcej udziałów w ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Czy którakolwiek osoba fizyczna posiada 25% lub więcej udziałów w ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Czy są jeszcze inne osoby, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        companyOwner: 'Właściciel firmy',
        enterLegalFirstAndLastName: 'Jakie jest oficjalne imię i nazwisko właściciela?',
        legalFirstName: 'Imię (zgodne z dokumentem tożsamości)',
        legalLastName: 'Nazwisko zgodne z dokumentami',
        enterTheDateOfBirthOfTheOwner: 'Jaka jest data urodzenia właściciela?',
        enterTheLast4: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        dontWorry: 'Spokojnie, nie sprawdzamy Twojej osobistej zdolności kredytowej!',
        enterTheOwnersAddress: 'Jaki jest adres właściciela?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko (prawne)',
        address: 'Adres',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś(-aś), rozumiesz i akceptujesz',
        owners: 'Właściciele',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informacje o właścicielu',
        businessOwner: 'Właściciel firmy',
        signerInfo: 'Informacje o sygnatariuszu',
        doYouOwn: (companyName: string) => `Czy posiadasz 25% lub więcej udziałów w ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Czy którakolwiek osoba fizyczna posiada 25% lub więcej udziałów w ${companyName}?`,
        regulationsRequire: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        legalFirstName: 'Imię (zgodne z dokumentem tożsamości)',
        legalLastName: 'Nazwisko zgodne z dokumentami',
        whatsTheOwnersName: 'Jakie jest oficjalne imię i nazwisko właściciela?',
        whatsYourName: 'Jakie jest twoje imię i nazwisko zgodne z dokumentami?',
        whatPercentage: 'Jaki procent firmy należy do właściciela?',
        whatsYoursPercentage: 'Jaki procent firmy posiadasz?',
        ownership: 'Własność',
        whatsTheOwnersDOB: 'Jaka jest data urodzenia właściciela?',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        whatsTheOwnersAddress: 'Jaki jest adres właściciela?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatAreTheLast: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        whatsYourLast: 'Jakie są ostatnie 4 cyfry Twojego numeru Social Security?',
        whatsYourNationality: 'Jaki jest twój kraj obywatelstwa?',
        whatsTheOwnersNationality: 'Jaki jest kraj obywatelstwa właściciela?',
        countryOfCitizenship: 'Kraj obywatelstwa',
        dontWorry: 'Spokojnie, nie sprawdzamy Twojej osobistej zdolności kredytowej!',
        last4: 'Ostatnie 4 cyfry numeru SSN',
        whyDoWeAsk: 'Dlaczego o to prosimy?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko (prawne)',
        ownershipPercentage: 'Procent udziałów',
        areThereOther: (companyName: string) => `Czy są inne osoby, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        owners: 'Właściciele',
        addCertified: 'Dodaj poświadczony schemat organizacyjny przedstawiający beneficjentów rzeczywistych',
        regulationRequiresChart:
            'Przepisy wymagają od nas zebrania poświadczonej kopii schematu własności, który pokazuje każdą osobę lub podmiot posiadający 25% lub więcej udziałów w firmie.',
        uploadEntity: 'Prześlij schemat własności podmiotu',
        noteEntity: 'Uwaga: wykres struktury własności podmiotu musi być podpisany przez Twojego księgowego, doradcę prawnego lub poświadczony notarialnie.',
        certified: 'Poświadczony schemat własności podmiotu',
        selectCountry: 'Wybierz kraj',
        findCountry: 'Znajdź kraj',
        address: 'Adres',
        chooseFile: 'Wybierz plik',
        uploadDocuments: 'Prześlij dodatkową dokumentację',
        pleaseUpload:
            'Prześlij poniżej dodatkową dokumentację, aby pomóc nam zweryfikować Twoją tożsamość jako bezpośredniego lub pośredniego właściciela co najmniej 25% podmiotu gospodarczego.',
        acceptedFiles: 'Akceptowane formaty plików: PDF, PNG, JPEG. Łączny rozmiar plików dla każdej sekcji nie może przekraczać 5 MB.',
        proofOfBeneficialOwner: 'Dowód beneficjenta rzeczywistego',
        proofOfBeneficialOwnerDescription:
            'Prosimy o dostarczenie podpisanego oświadczenia oraz schematu organizacyjnego od biegłego księgowego, notariusza lub prawnika, potwierdzających posiadanie 25% lub więcej udziałów w firmie. Dokument musi być opatrzony datą z ostatnich trzech miesięcy i zawierać numer licencji osoby podpisującej.',
        copyOfID: 'Kopia dokumentu tożsamości beneficjenta rzeczywistego',
        copyOfIDDescription: 'Przykłady: paszport, prawo jazdy itp.',
        proofOfAddress: 'Potwierdzenie adresu dla beneficjenta rzeczywistego',
        proofOfAddressDescription: 'Przykłady: rachunek za media, umowa najmu itp.',
        codiceFiscale: 'Codice fiscale/Identyfikator podatkowy',
        codiceFiscaleDescription:
            'Prześlij nagranie wideo z wizyty w siedzibie firmy lub nagraną rozmowę z osobą upoważnioną do podpisu. Osoba ta musi podać: imię i nazwisko, datę urodzenia, nazwę firmy, numer rejestrowy, numer identyfikacji podatkowej, adres siedziby, rodzaj prowadzonej działalności oraz cel założenia konta.',
    },
    completeVerificationStep: {
        completeVerification: 'Zakończ weryfikację',
        confirmAgreements: 'Potwierdź poniższe zgody.',
        certifyTrueAndAccurate: 'Oświadczam, że podane informacje są prawdziwe i dokładne',
        certifyTrueAndAccurateError: 'Potwierdź, że informacje są prawdziwe i dokładne',
        isAuthorizedToUseBankAccount: 'Jestem upoważniony(-a) do korzystania z tego firmowego konta bankowego na wydatki służbowe',
        isAuthorizedToUseBankAccountError: 'Musisz być osobą uprawnioną do reprezentowania firmy z upoważnieniem do obsługi firmowego rachunku bankowego',
        termsAndConditions: 'warunki i zasady',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Zwierzytelnij swoje konto bankowe',
        validateButtonText: 'Zatwierdź',
        validationInputLabel: 'Transakcja',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego została wyłączona z powodu zbyt wielu nieprawidłowych prób.',
        description: `W ciągu 1–2 dni roboczych wyślemy trzy (3) małe transakcje na Twoje konto bankowe z nazwą nadawcy w rodzaju „Expensify, Inc. Validation”.`,
        descriptionCTA: 'Wprowadź kwotę każdej transakcji w polach poniżej. Przykład: 1.51.',
        letsChatText: 'Prawie gotowe! Musimy z Twoją pomocą zweryfikować na czacie jeszcze kilka ostatnich informacji. Gotowy/-a?',
        enable2FATitle: 'Zapobiegaj oszustwom, włącz uwierzytelnianie dwuskładnikowe (2FA)',
        enable2FAText: 'Poważnie podchodzimy do kwestii bezpieczeństwa. Skonfiguruj teraz 2FA, aby dodać dodatkową warstwę ochrony swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    countryStep: {
        confirmBusinessBank: 'Potwierdź walutę i kraj firmowego konta bankowego',
        confirmCurrency: 'Potwierdź walutę i kraj',
        yourBusiness: 'Waluta firmowego rachunku bankowego musi być taka sama jak waluta Twojej przestrzeni roboczej.',
        youCanChange: 'Możesz zmienić walutę swojego workspace’u w swoim',
        findCountry: 'Znajdź kraj',
        selectCountry: 'Wybierz kraj',
    },
    bankInfoStep: {
        whatAreYour: 'Jakie są dane Twojego firmowego konta bankowego?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda w porządku.',
        thisBankAccount: 'To konto bankowe będzie używane do płatności firmowych w Twoim obszarze roboczym',
        accountNumber: 'Numer konta',
        accountHolderNameDescription: 'Imię i nazwisko upoważnionego podpisującego',
    },
    signerInfoStep: {
        signerInfo: 'Informacje o sygnatariuszu',
        areYouDirector: (companyName: string) => `Czy jesteś dyrektorem w ${companyName}?`,
        regulationRequiresUs: 'Przepisy wymagają, abyśmy zweryfikowali, czy sygnatariusz ma uprawnienia do podjęcia tej czynności w imieniu firmy.',
        whatsYourName: 'Jak brzmi Twoje imię i nazwisko zgodne z dokumentami',
        fullName: 'Pełne imię i nazwisko (zgodnie z dokumentem)',
        whatsYourJobTitle: 'Jakie jest Twoje stanowisko?',
        jobTitle: 'Stanowisko pracy',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        uploadID: 'Prześlij dokument tożsamości i potwierdzenie adresu',
        personalAddress: 'Potwierdzenie adresu zamieszkania (np. rachunek za media)',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko (prawne)',
        proofOf: 'Potwierdzenie adresu zamieszkania',
        enterOneEmail: (companyName: string) => `Wpisz adres e-mail dyrektora w firmie ${companyName}`,
        regulationRequiresOneMoreDirector: 'Przepisy wymagają co najmniej jeszcze jednego dyrektora jako podpisującego.',
        hangTight: 'Chwileczkę...',
        enterTwoEmails: (companyName: string) => `Podaj adresy e-mail dwóch dyrektorów w firmie ${companyName}`,
        sendReminder: 'Wyślij przypomnienie',
        chooseFile: 'Wybierz plik',
        weAreWaiting: 'Czekamy, aż inne osoby potwierdzą swoją tożsamość jako dyrektorzy firmy.',
        id: 'Kopia dokumentu tożsamości',
        proofOfDirectors: 'Potwierdzenie dyrektora/dyrektorów',
        proofOfDirectorsDescription: 'Przykłady: profil korporacyjny Oncorp lub rejestracja firmy.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Kod podatkowy (Codice Fiscale) dla sygnatariuszy, upoważnionych użytkowników i beneficjentów rzeczywistych.',
        PDSandFSG: 'Dokumenty ujawniające PDS + FSG',
        PDSandFSGDescription: dedent(`
            Nasze partnerstwo z Corpay wykorzystuje połączenie API, aby skorzystać z ich rozległej sieci międzynarodowych partnerów bankowych do obsługi globalnych zwrotów w Expensify. Zgodnie z australijskimi przepisami udostępniamy Ci Przewodnik po Usługach Finansowych (FSG) oraz Dokument Ujawniający Informacje o Produkcie (PDS) firmy Corpay.

            Przeczytaj uważnie dokumenty FSG i PDS, ponieważ zawierają pełne informacje oraz istotne szczegóły dotyczące produktów i usług oferowanych przez Corpay. Zachowaj te dokumenty na przyszłość.
        `),
        pleaseUpload: 'Prześlij poniżej dodatkową dokumentację, aby pomóc nam zweryfikować Twoją tożsamość jako dyrektora firmy.',
        enterSignerInfo: 'Wprowadź dane sygnatariusza',
        thisStep: 'Ten krok został ukończony',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `łączy firmowe konto bankowe w ${currency} kończące się na ${bankAccountLastFour} z Expensify, aby płacić pracownikom w ${currency}. Następny krok wymaga danych sygnatariusza od dyrektora.`,
        error: {
            emailsMustBeDifferent: 'Adresy e-mail muszą być różne',
        },
    },
    agreementsStep: {
        agreements: 'Umowy',
        pleaseConfirm: 'Potwierdź poniższe zgody',
        regulationRequiresUs: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        iAmAuthorized: 'Jestem upoważniony(-a) do korzystania z firmowego konta bankowego na wydatki służbowe.',
        iCertify: 'Oświadczam, że podane informacje są prawdziwe i dokładne.',
        iAcceptTheTermsAndConditions: `Akceptuję <a href="https://cross-border.corpay.com/tc/">warunki i postanowienia</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Akceptuję warunki i postanowienia.',
        accept: 'Zaakceptuj i dodaj konto bankowe',
        iConsentToThePrivacyNotice: 'Wyrażam zgodę na <a href="https://payments.corpay.com/compliance">informację o prywatności</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Wyrażam zgodę na informację o ochronie prywatności.',
        error: {
            authorized: 'Musisz być osobą uprawnioną do reprezentowania firmy z upoważnieniem do obsługi firmowego rachunku bankowego',
            certify: 'Potwierdź, że informacje są prawdziwe i dokładne',
            consent: 'Wyraź zgodę na politykę prywatności',
        },
    },
    docusignStep: {
        subheader: 'Formularz DocuSign',
        pleaseComplete:
            'Prosimy wypełnić formularz autoryzacji ACH, korzystając z poniższego linku DocuSign, a następnie przesłać tutaj podpisaną kopię, abyśmy mogli pobierać środki bezpośrednio z Twojego konta bankowego',
        pleaseCompleteTheBusinessAccount: 'Prosimy o wypełnienie wniosku o rachunek firmowy dotyczącym polecenia zapłaty',
        pleaseCompleteTheDirect:
            'Prosimy o wypełnienie umowy polecenia zapłaty za pomocą poniższego linku Docusign, a następnie przesłanie tutaj podpisanej kopii, abyśmy mogli pobierać środki bezpośrednio z Twojego konta bankowego.',
        takeMeTo: 'Przejdź do DocuSign',
        uploadAdditional: 'Prześlij dodatkową dokumentację',
        pleaseUpload: 'Prześlij formularz DEFT i stronę z podpisem DocuSign',
        pleaseUploadTheDirect: 'Prześlij proszę formularz polecenia zapłaty oraz stronę z podpisem DocuSign',
    },
    finishStep: {
        letsFinish: 'Dokończmy to na czacie!',
        thanksFor:
            'Dziękujemy za te informacje. Dedykowany agent wsparcia teraz je przeanalizuje. Wrócimy do Ciebie, jeśli będziemy potrzebować od Ciebie czegoś więcej, ale w międzyczasie śmiało skontaktuj się z nami w razie pytań.',
        iHaveA: 'Mam pytanie',
        enable2FA: 'Włącz uwierzytelnianie dwuskładnikowe (2FA), aby zapobiec oszustwom',
        weTake: 'Poważnie podchodzimy do kwestii bezpieczeństwa. Skonfiguruj teraz 2FA, aby dodać dodatkową warstwę ochrony swojego konta.',
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
        subtitle: 'Korzystaj z Expensify Travel, aby otrzymywać najlepsze oferty podróży i zarządzać wszystkimi wydatkami służbowymi w jednym miejscu.',
        features: {
            saveMoney: 'Oszczędzaj pieniądze na swoich rezerwacjach',
            alerts: 'Otrzymuj powiadomienia w czasie rzeczywistym, gdy zmienią się Twoje plany podróży',
        },
        bookTravel: 'Zarezerwuj podróż',
        bookDemo: 'Umów demo',
        bookADemo: 'Umów demo',
        toLearnMore: 'aby dowiedzieć się więcej.',
        termsAndConditions: {
            header: 'Zanim przejdziemy dalej...',
            title: 'Regulamin i warunki',
            label: 'Akceptuję regulamin i warunki',
            subtitle: `Prosimy o zaakceptowanie <a href="${CONST.TRAVEL_TERMS_URL}">regulaminu i warunków</a> usługi Expensify Travel.`,
            error: 'Aby kontynuować, musisz zaakceptować warunki korzystania z Expensify Travel',
            defaultWorkspaceError:
                'Musisz ustawić domyślne miejsce pracy, aby włączyć Expensify Travel. Przejdź do Ustawienia > Miejsca pracy > kliknij trzy pionowe kropki obok miejsca pracy > Ustaw jako domyślne miejsce pracy, a następnie spróbuj ponownie!',
        },
        flight: 'Lot',
        flightDetails: {
            passenger: 'Pasażer',
            layover: (layover: string) => `<muted-text-label>Masz <strong>${layover} przerwę w podróży</strong> przed tym lotem</muted-text-label>`,
            takeOff: 'StartStartStart',
            landing: 'Lądowanie',
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
            checkOut: 'Check-out',
            roomType: 'Typ pokoju',
            cancellation: 'Zasady anulowania',
            cancellationUntil: 'Darmowa anulacja do',
            confirmation: 'Numer potwierdzenia',
            cancellationPolicies: {
                unknown: 'Nieznane',
                nonRefundable: 'Bezzwrotne',
                freeCancellationUntil: 'Darmowa anulacja do',
                partiallyRefundable: 'Częściowo podlegające zwrotowi',
            },
        },
        car: 'Samochód',
        carDetails: {
            rentalCar: 'Wynajem samochodu',
            pickUp: 'Odbiór',
            dropOff: 'Zrzut',
            driver: 'Kierowca',
            carType: 'Typ samochodu',
            cancellation: 'Zasady anulowania',
            cancellationUntil: 'Darmowa anulacja do',
            freeCancellation: 'Darmowa anulacja',
            confirmation: 'Numer potwierdzenia',
        },
        train: 'Tor kolejowy',
        trainDetails: {
            passenger: 'Pasażer',
            departs: 'Odjazd',
            arrives: 'Przybywa',
            coachNumber: 'Numer autokaru',
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
            `<rbr>Aby rezerwować podróże, <a href="${phoneErrorMethodsRoute}">dodaj służbowy adres e‑mail jako swój główny login</a>.</rbr>`,
        domainSelector: {
            title: 'Domena',
            subtitle: 'Wybierz domenę dla konfiguracji Expensify Travel.',
            recommended: 'Polecane',
        },
        domainPermissionInfo: {
            title: 'Domena',
            restriction: (domain: string) =>
                `Nie masz uprawnień, aby włączyć Expensify Travel dla domeny <strong>${domain}</strong>. Musisz poprosić kogoś z tej domeny, aby zamiast tego włączył funkcję podróży.`,
            accountantInvitation: `Jeśli jesteś księgowym, rozważ dołączenie do <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">programu dla księgowych ExpensifyApproved!</a>, aby włączyć podróże dla tej domeny.`,
        },
        publicDomainError: {
            title: 'Zacznij korzystać z Expensify Travel',
            message: `Do korzystania z Expensify Travel musisz używać służbowego adresu e‑mail (np. name@company.com), a nie prywatnego (np. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel został wyłączony',
            message: `Administrator wyłączył Expensify Travel. Postępuj zgodnie z firmową polityką rezerwacji przy planowaniu podróży.`,
        },
        verifyCompany: {
            title: 'Przeglądamy Twoje zgłoszenie...',
            message: `Po naszej stronie wykonujemy kilka kontroli, aby potwierdzić, że Twoje konto jest gotowe na Expensify Travel. Wkrótce się z Tobą skontaktujemy!`,
            confirmText: 'Rozumiem',
            conciergeMessage: ({domain}: {domain: string}) => `Włączenie podróży nie powiodło się dla domeny: ${domain}. Sprawdź i włącz podróże dla tej domeny.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zarezerwowany. Kod potwierdzenia: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój bilet na lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został unieważniony.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój bilet na lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zwrócony lub wymieniony.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate}} został odwołany przez linię lotniczą.`,
            flightScheduleChangePending: (airlineCode: string) => `Linie lotnicze zaproponowały zmianę rozkładu dla lotu ${airlineCode}; oczekujemy na potwierdzenie.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Zmiana planu potwierdzona: lot ${airlineCode} odleci teraz o ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zaktualizowany.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Twoja klasa rezerwacji została zaktualizowana do ${cabinClass} na locie ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Twój przydział miejsca na locie ${airlineCode} został potwierdzony.`,
            flightSeatChanged: (airlineCode: string) => `Twoje miejsce na locie ${airlineCode} zostało zmienione.`,
            flightSeatCancelled: (airlineCode: string) => `Twoje przydzielone miejsce w locie ${airlineCode} zostało usunięte.`,
            paymentDeclined: 'Płatność za rezerwację lotu nie powiodła się. Spróbuj ponownie.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Anulowano Twoją rezerwację ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Dostawca anulował Twoją rezerwację ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Twoja rezerwacja ${type} została ponownie zarezerwowana. Nowy numer potwierdzenia: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Twoja rezerwacja (${type}) została zaktualizowana. Sprawdź nowe szczegóły w planie podróży.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Twój bilet kolejowy z ${origin} do ${destination} na ${startDate} został zwrócony. Zostanie przetworzony kredyt.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Twój bilet kolejowy z ${origin} do ${destination} na ${startDate} został wymieniony.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Twój bilet kolejowy z ${origin} → ${destination} na ${startDate} został zaktualizowany.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Twoja rezerwacja ${type} została zaktualizowana.`,
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
            companyCards: 'Karty firmowe',
            workflows: 'Przepływy pracy',
            workspace: 'Przestrzeń robocza',
            findWorkspace: 'Znajdź workspace',
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
            testTransactions: 'Testowe transakcje',
            issueAndManageCards: 'Wydawaj i zarządzaj kartami',
            reconcileCards: 'Uzgodnij karty',
            selectAll: 'Zaznacz wszystko',
            selected: () => ({
                one: 'Wybrano 1 element',
                other: (count: number) => `Wybrano: ${count}`,
            }),
            settlementFrequency: 'Częstotliwość rozliczania',
            setAsDefault: 'Ustaw jako domyślną przestrzeń roboczą',
            defaultNote: `Paragony wysłane na adres ${CONST.EMAIL.RECEIPTS} pojawią się w tym obszarze roboczym.`,
            deleteConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą?',
            deleteWithCardsConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą? Spowoduje to usunięcie wszystkich strumieni kart i przypisanych kart.',
            unavailable: 'Niedostępne miejsce pracy',
            memberNotFound: 'Nie znaleziono członka. Aby zaprosić nowego członka do przestrzeni roboczej, użyj przycisku zaproszenia powyżej.',
            notAuthorized: `Nie masz dostępu do tej strony. Jeśli próbujesz dołączyć do tego obszaru roboczego, poproś właściciela obszaru roboczego, aby dodał Cię jako członka. Coś innego? Skontaktuj się z ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Przejdź do przestrzeni roboczej',
            duplicateWorkspace: 'Duplikuj przestrzeń roboczą',
            duplicateWorkspacePrefix: 'Duplikuj',
            goToWorkspaces: 'Przejdź do przestrzeni roboczych',
            clearFilter: 'Wyczyść filtr',
            workspaceName: 'Nazwa przestrzeni roboczej',
            workspaceOwner: 'Właściciel',
            workspaceType: 'Typ przestrzeni roboczej',
            workspaceAvatar: 'Awatar przestrzeni roboczej',
            mustBeOnlineToViewMembers: 'Musisz być online, aby wyświetlić członków tego workspace.',
            moreFeatures: 'Więcej funkcji',
            requested: 'Zlecono',
            distanceRates: 'Stawki za odległość',
            defaultDescription: 'Jedno miejsce na wszystkie Twoje paragony i wydatki.',
            descriptionHint: 'Udostępnij informacje o tym zespole wszystkim członkom.',
            welcomeNote: 'Użyj Expensify, aby przesłać swoje paragony do zwrotu kosztów, dziękujemy!',
            subscription: 'Subskrypcja',
            markAsEntered: 'Oznacz jako wprowadzone ręcznie',
            markAsExported: 'Oznacz jako wyeksportowane',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Eksportuj do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
            lineItemLevel: 'Poziom pozycji liniowej',
            reportLevel: 'Poziom raportu',
            topLevel: 'Najwyższy poziom',
            appliedOnExport: 'Nie importowane do Expensify, stosowane przy eksporcie',
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
                `Ponieważ wcześniej połączyłeś(-aś) się z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, możesz ponownie użyć istniejącego połączenia lub utworzyć nowe.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} – ostatnia synchronizacja ${formattedDate}`,
            authenticationError: (connectionName: string) => `Nie można połączyć z ${connectionName} z powodu błędu uwierzytelniania.`,
            learnMore: 'Dowiedz się więcej',
            memberAlternateText: 'Przesyłaj i zatwierdzaj raporty.',
            adminAlternateText: 'Zarządzaj raportami i ustawieniami przestrzeni roboczej.',
            auditorAlternateText: 'Wyświetlaj i komentuj raporty.',
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
                'Nie możesz zmienić planu na niższy w subskrypcji rozliczanej fakturą. Aby omówić lub wprowadzić zmiany w swojej subskrypcji, skontaktuj się ze swoim opiekunem konta lub z Concierge, aby uzyskać pomoc.',
            defaultCategory: 'Domyślna kategoria',
            viewTransactions: 'Wyświetl transakcje',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Wydatki użytkownika ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Transakcje kartą Expensify będą automatycznie eksportowane do „konta zobowiązań karty Expensify” utworzonego za pomocą <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">naszej integracji</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Połączono z ${organizationName}` : 'Automatyzuj wydatki na podróże i dostawy posiłków w całej organizacji.',
                sendInvites: 'Wyślij zaproszenia',
                sendInvitesDescription: 'Ci członkowie przestrzeni roboczej nie mają jeszcze konta Uber for Business. Odznacz członków, których nie chcesz teraz zapraszać.',
                confirmInvite: 'Potwierdź zaproszenie',
                manageInvites: 'Zarządzaj zaproszeniami',
                confirm: 'Potwierdź',
                allSet: 'Wszystko gotowe',
                readyToRoll: 'Wszystko gotowe',
                takeBusinessRideMessage: 'Skorzystaj z przejazdu służbowego Uberem, a rachunki automatycznie zaimportują się do Expensify. Ruszaj!',
                all: 'Wszystkie',
                linked: 'Połączono',
                outstanding: 'Oczekujące',
                status: {
                    resend: 'Wyślij ponownie',
                    invite: 'Zaproś',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Połączono',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Oczekujące',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Zawieszony',
                },
                centralBillingAccount: 'Główne konto rozliczeniowe',
                centralBillingDescription: 'Wybierz miejsce importu wszystkich paragonów Uber.',
                invitationFailure: 'Nie udało się zaprosić członka do Uber for Business',
                autoInvite: 'Zaproś nowych członków przestrzeni roboczej do Uber for Business',
                autoRemove: 'Dezaktywuj usuniętych członków przestrzeni roboczej w Uber for Business',
                emptyContent: {
                    title: 'Brak oczekujących zaproszeń',
                    subtitle: 'Hurra! Szukaliśmy wszędzie i nie znaleźliśmy żadnych zaległych zaproszeń.',
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
            findPerDiemRate: 'Znajdź stawkę ryczałtową per diem',
            areYouSureDelete: () => ({
                one: 'Czy na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }),
            emptyList: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki diet, aby kontrolować dzienne wydatki pracowników. Zaimportuj stawki z arkusza kalkulacyjnego, aby rozpocząć.',
            },
            importPerDiemRates: 'Importuj stawki ryczałtowe diet',
            editPerDiemRate: 'Edytuj stawkę ryczałtową',
            editPerDiemRates: 'Edytuj stawki ryczałtowe',
            editDestinationSubtitle: (destination: string) => `Zaktualizowanie tego miejsca docelowego spowoduje zmianę dla wszystkich podstawek diet ${destination}.`,
            editCurrencySubtitle: (destination: string) => `Zaktualizowanie tej waluty spowoduje jej zmianę dla wszystkich podstawek diet dziennych ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportowania wydatków z własnej kieszeni do QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Oznacz czeki jako „wydrukuj później”',
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do QuickBooks Desktop.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje karty Expensify jako',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie zaksięgować zapisy w dzienniku.',
            accountsPayable: 'Zobowiązania z tytułu dostaw i usług',
            accountsPayableDescription: 'Wybierz, gdzie tworzyć rachunki od dostawców.',
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
                'Utworzymy złożoną z pozycji fakturę od dostawcy dla każdego raportu Expensify i dodamy ją do poniższego konta. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop nie obsługuje podatków przy eksporcie zapisów księgowych. Ponieważ podatki są włączone w Twoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Zapisy w dzienniku są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
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
                    'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do poniższego konta. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz, dokąd wyeksportować transakcje z karty kredytowej.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Wybierz dostawcę, który zostanie zastosowany do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wybierz, skąd wysyłać czeki.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Rachunki dostawców są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Zapisy w dzienniku są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Desktop i ponownie zsynchronizuj połączenie',
            qbdSetup: 'Konfiguracja QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Nie można połączyć z tego urządzenia',
                body1: 'Musisz skonfigurować to połączenie z komputera, na którym znajduje się plik firmowy QuickBooks Desktop.',
                body2: 'Po nawiązaniu połączenia będziesz mógł synchronizować i eksportować dane z dowolnego miejsca.',
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
            exportCompanyCardsDescription: 'Ustaw sposób eksportu zakupów kartą firmową do QuickBooks Desktop.',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który zostanie zastosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            accountsDescription: 'Twój plan kont z QuickBooks Desktop zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone, czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia wydatków.',
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
                description: 'Wybierz, kiedy wyeksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoria',
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
            classes: 'Klasy',
            locations: 'Lokalizacje',
            customers: 'Klienci/projekty',
            accountsDescription: 'Twój plan kont w QuickBooks Online zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone, czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia wydatków.',
            classesDescription: 'Wybierz sposób obsługi klas QuickBooks Online w Expensify.',
            customersDescription: 'Wybierz, jak obsługiwać klientów/projekty QuickBooks Online w Expensify.',
            locationsDescription: 'Wybierz, jak obsługiwać lokalizacje QuickBooks Online w Expensify.',
            taxesDescription: 'Wybierz sposób obsługi podatków QuickBooks Online w Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online nie obsługuje lokalizacji na poziomie pozycji dla czeków ani rachunków od dostawców. Jeśli chcesz mieć lokalizacje na poziomie pozycji, upewnij się, że używasz zapisów księgowych (Journal Entries) oraz wydatków z kart kredytowych/debetowych.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online nie obsługuje podatków w zapisach dziennika. Zmień opcję eksportu na rachunek od dostawcy lub czek.',
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
            receivable: 'Należności', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archiwum należności帳', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Użyj tego konta podczas eksportowania faktur do QuickBooks Online.',
            exportCompanyCardsDescription: 'Ustaw sposób eksportowania zakupów z kart firmowych do QuickBooks Online.',
            vendor: 'Dostawca',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który zostanie zastosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportowania wydatków z własnej kieszeni do QuickBooks Online.',
            exportCheckDescription: 'Utworzymy wyszczególniony czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy zapis w dzienniku dla każdego raportu Expensify i zaksięgujemy go na koncie poniżej.',
            exportVendorBillDescription:
                'Utworzymy złożoną z pozycji fakturę od dostawcy dla każdego raportu Expensify i dodamy ją do poniższego konta. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie zaksięgować zapisy w dzienniku.',
            accountsPayable: 'Zobowiązania z tytułu dostaw i usług',
            accountsPayableDescription: 'Wybierz, gdzie tworzyć rachunki od dostawców.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nieskonfigurowane',
            bankAccountDescription: 'Wybierz, skąd wysyłać czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online nie obsługuje lokalizacji w eksportach rachunków od dostawców. Ponieważ masz włączone lokalizacje w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online nie obsługuje podatków przy eksporcie zapisów w dzienniku. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Zapisy w dzienniku są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie codziennie automatycznie synchronizować się z QuickBooks Online.',
                inviteEmployees: 'Zaproś pracowników',
                inviteEmployeesDescription: 'Zaimportuj rekordy pracowników z QuickBooks Online i zaproś pracowników do tego obszaru roboczego.',
                createEntities: 'Automatycznie twórz jednostki',
                createEntitiesDescription:
                    'Expensify automatycznie utworzy dostawców w QuickBooks Online, jeśli jeszcze nie istnieją, oraz automatycznie utworzy klientów podczas eksportu faktur.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie QuickBooks Online.',
                qboBillPaymentAccount: 'Konto płatności rachunków QuickBooks',
                qboInvoiceCollectionAccount: 'Konto windykacji faktur QuickBooks',
                accountSelectDescription: 'Wybierz, z jakiego konta chcesz opłacać rachunki, a my utworzymy płatność w QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie chcesz otrzymywać płatności za faktury, a my utworzymy płatność w QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Karta debetowa',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Polecenie księgowania',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawdź',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy w transakcji kartą debetową do odpowiadających jej dostawców w QuickBooks. Jeśli tacy dostawcy nie istnieją, utworzymy dostawcę „Debit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą kredytową do odpowiednich dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Credit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do poniższego konta. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wybierz, dokąd eksportować transakcje karty debetowej.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz, dokąd wyeksportować transakcje z karty kredytowej.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wybierz dostawcę, który zostanie zastosowany do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Rachunki dostawców są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Zapisy w dzienniku są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wybierz prawidłowe konto do eksportu rachunku dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wybierz prawidłowe konto do eksportu zapisu w dzienniku',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wybierz prawidłowe konto do eksportu czeków',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Aby korzystać z eksportu rachunków dostawców, skonfiguruj konto zobowiązań w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Aby używać eksportu zapisów w dzienniku, skonfiguruj konto dziennika w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Aby korzystać z eksportu czeków, skonfiguruj konto bankowe w QuickBooks Online',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Online i zsynchronizuj połączenie ponownie.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy wyeksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoria',
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
            accountsDescription: 'Twój plan kont Xero zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone, czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia wydatków.',
            trackingCategories: 'Kategorie śledzenia',
            trackingCategoriesDescription: 'Wybierz sposób obsługi kategorii śledzenia Xero w Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `Mapuj Xero ${categoryName} do`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Wybierz, gdzie zmapować ${categoryName} podczas eksportowania do Xero.`,
            customers: 'Ponownie obciąż klientów',
            customersDescription:
                'Wybierz, czy ponownie obciążać klientów w Expensify. Twoje kontakty klientów z Xero mogą być przypisywane do wydatków i zostaną wyeksportowane do Xero jako faktury sprzedażowe.',
            taxesDescription: 'Wybierz, jak obsługiwać podatki Xero w Expensify.',
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
                'Wyeksportowane wydatki zostaną zaksięgowane jako transakcje bankowe na poniższym koncie bankowym w Xero, a daty transakcji będą zgodne z datami na Twoim wyciągu bankowym.',
            bankTransactions: 'Transakcje bankowe',
            xeroBankAccount: 'Konto bankowe Xero',
            xeroBankAccountDescription: 'Wybierz, gdzie wydatki będą księgowane jako transakcje bankowe.',
            exportExpensesDescription: 'Raporty zostaną wyeksportowane jako faktury zakupu z datą i statusem wybranymi poniżej.',
            purchaseBillDate: 'Data zakupu faktury',
            exportInvoices: 'Eksportuj faktury jako',
            salesInvoice: 'Faktura sprzedaży',
            exportInvoicesDescription: 'Faktury sprzedaży zawsze wyświetlają datę wysłania faktury.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Xero każdego dnia.',
                purchaseBillStatusTitle: 'Status rachunku zakupu',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Xero.',
                xeroBillPaymentAccount: 'Konto płatności rachunków Xero',
                xeroInvoiceCollectionAccount: 'Konto rozliczeniowe faktur Xero',
                xeroBillPaymentAccountDescription: 'Wybierz, z którego konta opłacać rachunki, a my utworzymy płatność w Xero.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie chcesz otrzymywać płatności za faktury, a my utworzymy płatność w Xero.',
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
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoria',
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
                description: 'Ustaw sposób eksportu wydatków gotówkowych do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Raporty wydatków',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Faktury od dostawców',
                },
            },
            nonReimbursableExpenses: {
                description: 'Ustaw sposób eksportowania zakupów kartą firmową do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Karty kredytowe',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Faktury od dostawców',
                },
            },
            creditCardAccount: 'Konto karty kredytowej',
            defaultVendor: 'Domyślny dostawca',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Ustaw domyślnego dostawcę, który zostanie zastosowany do ${isReimbursable ? '' : 'nie-'}wydatków podlegających zwrotowi, które nie mają pasującego dostawcy w Sage Intacct.`,
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do Sage Intacct.',
            exportPreferredExporterNote:
                'Preferowanym eksporterem może być dowolny administrator przestrzeni roboczej, ale musi on być także administratorem domeny, jeśli ustawisz różne konta eksportu dla poszczególnych firmowych kart w Ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy w swoim koncie raporty do eksportu.',
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: `Dodaj proszę konto w Sage Intacct i ponownie zsynchronizuj połączenie`,
            autoSync: 'Automatyczna synchronizacja',
            autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Sage Intacct każdego dnia.',
            inviteEmployees: 'Zaproś pracowników',
            inviteEmployeesDescription:
                'Zaimportuj rekordy pracowników z Sage Intacct i zaproś pracowników do tego obszaru roboczego. Twój przepływ zatwierdzania domyślnie będzie oparty na zatwierdzaniu przez menedżera i może zostać dalej skonfigurowany na stronie Członkowie.',
            syncReimbursedReports: 'Synchronizuj rozliczone raporty',
            syncReimbursedReportsDescription:
                'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiadająca mu płatność rachunku zostanie utworzona na koncie Sage Intacct poniżej.',
            paymentAccount: 'Konto płatnicze Sage Intacct',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy wyeksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoria',
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
            subsidiarySelectDescription: 'Wybierz spółkę zależną w NetSuite, z której chcesz zaimportować dane.',
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do NetSuite.',
            exportInvoices: 'Eksportuj faktury do',
            journalEntriesTaxPostingAccount: 'Konto księgowania podatku w zapisach dziennika',
            journalEntriesProvTaxPostingAccount: 'Konto księgowania prowincjonalnego podatku w zapisach dziennika',
            foreignCurrencyAmount: 'Eksportuj kwotę w walucie obcej',
            exportToNextOpenPeriod: 'Eksportuj do następnego otwartego okresu',
            nonReimbursableJournalPostingAccount: 'Konto księgowania kosztów niepodlegających zwrotowi',
            reimbursableJournalPostingAccount: 'Konto księgowe rozliczeń podlegających zwrotowi',
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
                        nonReimbursableDescription: 'Wydatki z kart firmowych zostaną wyeksportowane do NetSuite jako raporty wydatków.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Faktury od dostawców',
                        reimbursableDescription: dedent(`
                            Wydatki pokrywane z własnych środków zostaną wyeksportowane jako rachunki płatne na rzecz dostawcy NetSuite określonego poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Firmowe karty*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Wydatki z kart firmowych zostaną wyeksportowane jako rachunki płatne na rzecz dostawcy NetSuite określonego poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Zapisy księgowe',
                        reimbursableDescription: dedent(`
                            Wydatki z własnych środków zostaną wyeksportowane jako zapisy w dzienniku do konta NetSuite określonego poniżej.

                            Jeśli chcesz ustawić określonego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Wydatki z kart firmowych zostaną wyeksportowane jako zapisy w dzienniku do wskazanego poniżej konta NetSuite.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Jeśli zmienisz ustawienie eksportu firmowych kart na raporty wydatków, dostawcy NetSuite i konta księgowe dla poszczególnych kart zostaną wyłączone.\n\nNie martw się, nadal zachowamy Twoje poprzednie wybory na wypadek, gdybyś chciał/chciała wrócić do nich później.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z NetSuite każdego dnia.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie NetSuite.',
                reimbursementsAccount: 'Konto do zwrotów',
                reimbursementsAccountDescription: 'Wybierz konto bankowe, którego użyjesz do zwrotów, a my utworzymy powiązaną płatność w NetSuite.',
                collectionsAccount: 'Konto windykacyjne',
                collectionsAccountDescription: 'Gdy faktura zostanie oznaczona jako opłacona w Expensify i wyeksportowana do NetSuite, pojawi się na poniższym koncie.',
                approvalAccount: 'Konto zatwierdzania zobowiązań A/P',
                approvalAccountDescription:
                    'Wybierz konto, względem którego transakcje będą zatwierdzane w NetSuite. Jeśli synchronizujesz rozliczone raporty, będzie to również konto, względem którego zostaną utworzone płatności rachunków.',
                defaultApprovalAccount: 'Domyślne NetSuite',
                inviteEmployees: 'Zaproś pracowników i ustaw zatwierdzanie',
                inviteEmployeesDescription:
                    'Zaimportuj rekordy pracowników z NetSuite i zaproś pracowników do tego przestrzeni roboczej. Twój przepływ zatwierdzania domyślnie będzie oparty na zatwierdzaniu przez menedżera i można go dalej skonfigurować na stronie *Członkowie*.',
                autoCreateEntities: 'Automatycznie twórz pracowników/dostawców',
                enableCategories: 'Włącz nowo zaimportowane kategorie',
                customFormID: 'Niestandardowy identyfikator formularza',
                customFormIDDescription:
                    'Domyślnie Expensify będzie tworzyć zapisy, używając preferowanego formularza transakcji ustawionego w NetSuite. Alternatywnie możesz wskazać konkretny formularz transakcji do użycia.',
                customFormIDReimbursable: 'Wydatek z własnej kieszeni',
                customFormIDNonReimbursable: 'Wydatek z karty służbowej',
                exportReportsTo: {
                    label: 'Poziom zatwierdzania raportu wydatków',
                    description: 'Po zatwierdzeniu raportu wydatków w Expensify i wyeksportowaniu go do NetSuite możesz w NetSuite ustawić dodatkowy poziom akceptacji przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Tylko zatwierdzone przez przełożonego',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Zatwierdzone tylko przez księgowość',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Zatwierdzone przez przełożonego i księgowość',
                    },
                },
                accountingMethods: {
                    label: 'Kiedy eksportować',
                    description: 'Wybierz, kiedy wyeksportować wydatki:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoria',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po opłaceniu',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Poziom zatwierdzania rachunku dostawcy',
                    description:
                        'Gdy rachunek od dostawcy zostanie zatwierdzony w Expensify i wyeksportowany do NetSuite, możesz w NetSuite ustawić dodatkowy poziom akceptacji przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zatwierdzono do zaksięgowania',
                    },
                },
                exportJournalsTo: {
                    label: 'Poziom zatwierdzania zapisów w dzienniku',
                    description:
                        'Po zatwierdzeniu zapisu w dzienniku w Expensify i wyeksportowaniu go do NetSuite, możesz w NetSuite ustawić dodatkowy poziom akceptacji przed jego zaksięgowaniem.',
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
            noAccountsFoundDescription: 'Dodaj proszę konto w NetSuite i zsynchronizuj połączenie ponownie',
            noVendorsFound: 'Nie znaleziono dostawców',
            noVendorsFoundDescription: 'Dodaj proszę dostawców w NetSuite i ponownie zsynchronizuj połączenie',
            noItemsFound: 'Nie znaleziono pozycji faktury',
            noItemsFoundDescription: 'Dodaj pozycje faktury w NetSuite i ponownie zsynchronizuj połączenie',
            noSubsidiariesFound: 'Nie znaleziono spółek zależnych',
            noSubsidiariesFoundDescription: 'Dodaj proszę spółkę zależną w NetSuite i zsynchronizuj połączenie ponownie',
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
                            'W NetSuite przejdź do *Setup > Users/Roles > Access Tokens* > utwórz token dostępu dla aplikacji „Expensify” oraz roli „Expensify Integration” lub „Administrator”.\n\n*Ważne:* Pamiętaj, aby zapisać *Token ID* i *Token Secret* z tego kroku. Będą potrzebne w następnym kroku.',
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
                        title: 'Klasy',
                        subtitle: 'Wybierz sposób obsługi *klas* w Expensify.',
                    },
                    locations: {
                        title: 'Lokalizacje',
                        subtitle: 'Wybierz sposób obsługi *lokalizacji* w Expensify.',
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
                    chooseOptionBelow: 'Wybierz jedną z poniższych opcji:',
                    label: (importedTypes: string[]) => `Zaimportowano jako ${importedTypes.join('i')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Wprowadź ${fieldName}`,
                    customSegments: {
                        title: 'Niestandardowe segmenty/rejestry',
                        addText: 'Dodaj niestandardowy segment/rekord',
                        recordTitle: 'Niestandardowy segment/rekord',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Zobacz szczegółowe instrukcje',
                        helpText: 'dotyczące konfiguracji niestandardowych segmentów/rekordów.',
                        emptyTitle: 'Dodaj niestandardowy segment lub niestandardowy rekord',
                        fields: {
                            segmentName: 'Nazwa',
                            internalID: 'Wewnętrzny ID',
                            scriptID: 'Identyfikator skryptu',
                            customRecordScriptID: 'ID kolumny transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń niestandardowy segment/rekord',
                        removePrompt: 'Czy na pewno chcesz usunąć ten własny segment/rekord?',
                        addForm: {
                            customSegmentName: 'nazwa niestandardowego segmentu',
                            customRecordName: 'nazwa niestandardowego rekordu',
                            segmentTitle: 'Niestandardowy segment',
                            customSegmentAddTitle: 'Dodaj niestandardowy segment',
                            customRecordAddTitle: 'Dodaj niestandardowy rekord',
                            recordTitle: 'Rekord niestandardowy',
                            segmentRecordType: 'Czy chcesz dodać niestandardowy segment czy niestandardowy rekord?',
                            customSegmentNameTitle: 'Jaka jest nazwa segmentu niestandardowego?',
                            customRecordNameTitle: 'Jaka jest nazwa niestandardowego rekordu?',
                            customSegmentNameFooter: `Nazwy niestandardowych segmentów znajdziesz w NetSuite na stronie *Customizations > Links, Records & Fields > Custom Segments*.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Możesz znaleźć niestandardowe nazwy rekordów w NetSuite, wpisując „Transaction Column Field” w wyszukiwarkę globalną.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentInternalIDTitle: 'Jaki jest identyfikator wewnętrzny?',
                            customSegmentInternalIDFooter: `Najpierw upewnij się, że włączyłeś(-aś) wewnętrzne ID w NetSuite w menu *Home > Set Preferences > Show Internal ID.*

Wewnętrzne ID segmentów niestandardowych znajdziesz w NetSuite w:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Kliknij wybrany segment niestandardowy.
3. Kliknij hiperłącze obok *Custom Record Type*.
4. Znajdź wewnętrzne ID w tabeli na dole.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Możesz znaleźć wewnętrzne ID niestandardowych rekordów w NetSuite, wykonując następujące kroki:

1. Wpisz „Transaction Line Fields” w wyszukiwaniu globalnym.
2. Kliknij niestandardowy rekord.
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
                            customRecordScriptIDFooter: `Identyfikatory skryptów niestandardowych rekordów znajdziesz w NetSuite w następujący sposób:

1. Wpisz „Transaction Line Fields” w globalnym wyszukiwaniu.
2. Kliknij niestandardowy rekord.
3. Znajdź identyfikator skryptu po lewej stronie.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Jak ten niestandardowy segment powinien być wyświetlany w Expensify?',
                            customRecordMappingTitle: 'Jak ten niestandardowy rekord powinien być wyświetlany w Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Niestandardowy segment/rekord z tym ${fieldName?.toLowerCase()} już istnieje`,
                        },
                    },
                    customLists: {
                        title: 'Listy niestandardowe',
                        addText: 'Dodaj własną listę',
                        recordTitle: 'Lista niestandardowa',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Zobacz szczegółowe instrukcje',
                        helpText: 'dotyczące konfigurowania list niestandardowych.',
                        emptyTitle: 'Dodaj listę niestandardową',
                        fields: {
                            listName: 'Nazwa',
                            internalID: 'Wewnętrzny ID',
                            transactionFieldID: 'Identyfikator pola transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń listę niestandardową',
                        removePrompt: 'Czy na pewno chcesz usunąć tę listę niestandardową?',
                        addForm: {
                            listNameTitle: 'Wybierz listę niestandardową',
                            transactionFieldIDTitle: 'Jaki jest identyfikator pola transakcji?',
                            transactionFieldIDFooter: `Identyfikatory pól transakcji w NetSuite możesz znaleźć, wykonując następujące kroki:

1. Wpisz „Transaction Line Fields” w wyszukiwaniu globalnym.
2. Kliknij, aby otworzyć listę niestandardową.
3. Znajdź identyfikator pola transakcji po lewej stronie.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Jak ta niestandardowa lista powinna być wyświetlana w Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Niestandardowa lista z tym identyfikatorem pola transakcji już istnieje`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Domyślny pracownik NetSuite',
                        description: 'Nie importowane do Expensify, stosowane przy eksporcie',
                        footerContent: (importField: string) =>
                            `Jeśli używasz ${importField} w NetSuite, zastosujemy domyślną wartość ustawioną w kartotece pracownika podczas eksportu do raportu wydatków lub zapisu w dzienniku.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tagi',
                        description: 'Poziom pozycji liniowej',
                        footerContent: (importField: string) => `${startCase(importField)} będzie można wybrać dla każdego pojedynczego wydatku w raporcie pracownika.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Pola raportu',
                        description: 'Poziom raportu',
                        footerContent: (importField: string) => `Wybór ${startCase(importField)} zostanie zastosowany do wszystkich wydatków w raporcie pracownika.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Konfiguracja Sage Intacct',
            prerequisitesTitle: 'Zanim się połączysz…',
            downloadExpensifyPackage: 'Pobierz pakiet Expensify dla Sage Intacct',
            followSteps: 'Postępuj zgodnie z krokami w naszych instrukcjach „Jak połączyć się z Sage Intacct”',
            enterCredentials: 'Wprowadź swoje dane logowania do Sage Intacct',
            entity: 'Jednostka',
            employeeDefault: 'Domyślne ustawienia pracownika Sage Intacct',
            employeeDefaultDescription: 'Domyślny dział pracownika zostanie zastosowany do jego wydatków w Sage Intacct, jeśli istnieje.',
            displayedAsTagDescription: 'Dział będzie można wybrać dla każdego pojedynczego wydatku w raporcie pracownika.',
            displayedAsReportFieldDescription: 'Wybór działu zostanie zastosowany do wszystkich wydatków w raporcie pracownika.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wybierz, jak obsługiwać Sage Intacct <strong>${mappingTitle}</strong> w Expensify.`,
            expenseTypes: 'Typy wydatków',
            expenseTypesDescription: 'Twoje typy wydatków z Sage Intacct zostaną zaimportowane do Expensify jako kategorie.',
            accountTypesDescription: 'Twój plan kont Sage Intacct zostanie zaimportowany do Expensify jako kategorie.',
            importTaxDescription: 'Zaimportuj stawkę podatku od zakupu z Sage Intacct.',
            userDefinedDimensions: 'Wymiary zdefiniowane przez użytkownika',
            addUserDefinedDimension: 'Dodaj wymiar zdefiniowany przez użytkownika',
            integrationName: 'Nazwa integracji',
            dimensionExists: 'Wymiar o tej nazwie już istnieje.',
            removeDimension: 'Usuń zdefiniowany przez użytkownika wymiar',
            removeDimensionPrompt: 'Czy na pewno chcesz usunąć ten wymiar zdefiniowany przez użytkownika?',
            userDefinedDimension: 'Wymiar zdefiniowany przez użytkownika',
            addAUserDefinedDimension: 'Dodaj wymiar zdefiniowany przez użytkownika',
            detailedInstructionsLink: 'Zobacz szczegółowe instrukcje',
            detailedInstructionsRestOfSentence: 'podczas dodawania zdefiniowanych przez użytkownika wymiarów.',
            userDimensionsAdded: () => ({
                one: 'Dodano 1 UDD',
                other: (count: number) => `Dodano ${count} UDDs`,
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
            free: 'Darmowe',
            control: 'Kontrola',
            collect: 'Zbieraj',
        },
        companyCards: {
            addCards: 'Dodaj karty',
            selectCards: 'Wybierz karty',
            addNewCard: {
                other: 'Inne',
                cardProviders: {
                    gl1025: 'Firmowe karty American Express',
                    cdf: 'Firmowe karty Mastercard',
                    vcf: 'Firmowe karty Visa',
                    stripe: 'Karty Stripe',
                },
                yourCardProvider: `Kto jest wystawcą Twojej karty?`,
                whoIsYourBankAccount: 'Jaki jest Twój bank?',
                whereIsYourBankLocated: 'Gdzie znajduje się Twój bank?',
                howDoYouWantToConnect: 'Jak chcesz połączyć się ze swoim bankiem?',
                learnMoreAboutOptions: `<muted-text>Dowiedz się więcej o tych <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opcjach</a>.</muted-text>`,
                commercialFeedDetails: 'Wymaga konfiguracji z Twoim bankiem. Zazwyczaj używane przez większe firmy i często jest najlepszą opcją, jeśli się kwalifikujesz.',
                commercialFeedPlaidDetails: `Wymaga konfiguracji z Twoim bankiem, ale przeprowadzimy Cię przez ten proces. Zwykle jest to dostępne tylko dla większych firm.`,
                directFeedDetails: 'Najprostsze rozwiązanie. Połącz się od razu, używając swoich głównych danych logowania. Ta metoda jest najczęściej stosowana.',
                enableFeed: {
                    title: (provider: string) => `Włącz swój kanał ${provider}`,
                    heading:
                        'Mamy bezpośrednią integrację z wystawcą Twojej karty i możemy szybko oraz dokładnie zaimportować dane Twoich transakcji do Expensify.\n\nAby rozpocząć, po prostu:',
                    visa: 'Mamy globalne integracje z Visa, choć kwalifikowalność zależy od banku i programu kart.\n\nAby rozpocząć, po prostu:',
                    mastercard: 'Mamy globalne integracje z Mastercard, choć kwalifikowalność zależy od banku i programu kart.\n\nAby rozpocząć, po prostu:',
                    vcf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby uzyskać szczegółowe instrukcje dotyczące konfiguracji kart Visa Commercial.

2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby potwierdzić, że obsługuje on komercyjny feed dla Twojego programu, i poproś o jego włączenie.

3. *Gdy feed zostanie włączony i będziesz mieć jego dane, przejdź do następnego ekranu.*`,
                    gl1025: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), aby sprawdzić, czy American Express może włączyć komercyjny kanał dla Twojego programu.

2. Gdy kanał zostanie włączony, Amex wyśle Ci list produkcyjny.

3. *Gdy masz już informacje o kanale, przejdź do następnego ekranu.*`,
                    cdf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby uzyskać szczegółowe instrukcje dotyczące konfiguracji kart Mastercard Commercial Cards.

2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby potwierdzić, że obsługuje on komercyjny feed dla Twojego programu, i poproś o jego włączenie.

3. *Gdy feed zostanie włączony i będziesz mieć jego szczegóły, przejdź do następnego ekranu.*`,
                    stripe: `1. Odwiedź pulpit nawigacyjny Stripe i przejdź do [Ustawienia](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. W sekcji Integracje produktów kliknij Włącz obok Expensify.

3. Gdy kanał zostanie włączony, kliknij poniżej Prześlij, a my zajmiemy się jego dodaniem.`,
                },
                whatBankIssuesCard: 'Jaki bank wydaje te karty?',
                enterNameOfBank: 'Wpisz nazwę banku',
                feedDetails: {
                    vcf: {
                        title: 'Jakie są szczegóły zasilania danych Visa?',
                        processorLabel: 'Identyfikator procesora',
                        bankLabel: 'Identyfikator instytucji finansowej (banku)',
                        companyLabel: 'ID firmy',
                        helpLabel: 'Gdzie znajdę te identyfikatory?',
                    },
                    gl1025: {
                        title: `Jak nazywa się plik dostarczony przez Amex?`,
                        fileNameLabel: 'Nazwa pliku dostawy',
                        helpLabel: 'Gdzie znajdę nazwę pliku dostarczenia?',
                    },
                    cdf: {
                        title: `Jaki jest identyfikator dystrybucyjny Mastercard?`,
                        distributionLabel: 'Identyfikator dystrybucji',
                        helpLabel: 'Gdzie znajdę identyfikator dystrybucji?',
                    },
                },
                amexCorporate: 'Wybierz tę opcję, jeśli na przedniej stronie Twoich kart widnieje napis „Corporate”',
                amexBusiness: 'Zaznacz tę opcję, jeśli na przodzie Twoich kart widnieje napis „Business”',
                amexPersonal: 'Wybierz tę opcję, jeśli Twoje karty są prywatne',
                error: {
                    pleaseSelectProvider: 'Przed kontynuowaniem wybierz dostawcę karty',
                    pleaseSelectBankAccount: 'Przed kontynuowaniem wybierz konto bankowe',
                    pleaseSelectBank: 'Wybierz bank przed kontynuowaniem',
                    pleaseSelectCountry: 'Wybierz kraj przed kontynuowaniem',
                    pleaseSelectFeedType: 'Wybierz typ kanału przed kontynuowaniem',
                },
                exitModal: {
                    title: 'Coś nie działa?',
                    prompt: 'Zauważyliśmy, że nie dokończyłeś(-aś) dodawania swoich kart. Jeśli napotkałeś(-aś) jakiś problem, daj nam znać, abyśmy mogli pomóc wrócić na właściwe tory.',
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
                '<muted-text><centered-text>Albo coś może nie działać. Tak czy inaczej, jeśli masz jakieś pytania, po prostu <concierge-link>skontaktuj się z Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wybierz początkową datę transakcji',
            startDateDescription: 'Wybierz swoją datę początkową importu. Będziemy synchronizować wszystkie transakcje od tej daty.',
            fromTheBeginning: 'Od początku',
            customStartDate: 'Niestandardowa data początkowa',
            customCloseDate: 'Niestandardowa data zamknięcia',
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
            confirmationDescription: 'Zaczniemy natychmiast importować transakcje.',
            card: 'Karta',
            cardName: 'Nazwa karty',
            brokenConnectionError: '<rbr>Połączenie z kartą zostało przerwane. Proszę <a href="#">zalogować się do swojego banku</a>, abyśmy mogli ponownie nawiązać połączenie.</rbr>',
            assignedCard: (assignee: string, link: string) => `przypisał(a) ${assignee} ${link}! Zaimportowane transakcje pojawią się na tym czacie.`,
            companyCard: 'karta firmowa',
            chooseCardFeed: 'Wybierz źródło karty',
            ukRegulation:
                'Expensify Limited jest agentem Plaid Financial Ltd., autoryzowanej instytucji płatniczej regulowanej przez Financial Conduct Authority na mocy Payment Services Regulations 2017 (numer referencyjny firmy: 804718). Plaid świadczy na Twoją rzecz regulowane usługi dostępu do informacji o rachunku za pośrednictwem Expensify Limited jako swojego agenta.',
            assignCardFailedError: 'Przypisanie karty nie powiodło się.',
            cardAlreadyAssignedError: 'Ta karta jest już przypisana do użytkownika w innym obszarze roboczym.',
        },
        expensifyCard: {
            issueAndManageCards: 'Wydawaj i zarządzaj swoimi kartami Expensify',
            getStartedIssuing: 'Rozpocznij, wydając swoją pierwszą wirtualną lub fizyczną kartę.',
            verificationInProgress: 'Trwa weryfikacja...',
            verifyingTheDetails: 'Weryfikujemy kilka szczegółów. Concierge da Ci znać, gdy karty Expensify będą gotowe do wydania.',
            disclaimer:
                'Karta Expensify Visa® Commercial Card jest wydawana przez The Bancorp Bank, N.A., członka FDIC, na podstawie licencji udzielonej przez Visa U.S.A. Inc. i może nie być akceptowana u wszystkich sprzedawców przyjmujących karty Visa. Apple® i logo Apple® są znakami towarowymi firmy Apple Inc., zarejestrowanymi w USA i innych krajach. App Store jest znakiem usługowym firmy Apple Inc. Google Play i logo Google Play są znakami towarowymi Google LLC.',
            euUkDisclaimer:
                'Karty wydawane rezydentom EOG są emitowane przez Transact Payments Malta Limited, a karty wydawane rezydentom Zjednoczonego Królestwa są emitowane przez Transact Payments Limited na podstawie licencji udzielonej przez Visa Europe Limited. Transact Payments Malta Limited jest należycie upoważniona i regulowana przez Malta Financial Services Authority jako instytucja finansowa na mocy Financial Institution Act 1994. Numer rejestracyjny C 91879. Transact Payments Limited jest upoważniona i regulowana przez Gibraltar Financial Service Commission.',
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
            requestLimitIncrease: 'Poproś o zwiększenie limitu',
            remainingLimitDescription:
                'Bierzemy pod uwagę szereg czynników przy obliczaniu Twojego pozostałego limitu: staż jako klienta, informacje biznesowe podane podczas rejestracji oraz dostępne środki pieniężne na firmowym rachunku bankowym. Twój pozostały limit może zmieniać się z dnia na dzień.',
            earnedCashback: 'Zwrot gotówki',
            earnedCashbackDescription: 'Saldo zniżki gotówkowej jest obliczane na podstawie rozliczonych miesięcznych wydatków kartą Expensify w Twojej przestrzeni roboczej.',
            issueNewCard: 'Wydaj nową kartę',
            finishSetup: 'Dokończ konfigurację',
            chooseBankAccount: 'Wybierz konto bankowe',
            chooseExistingBank: 'Wybierz istniejące firmowe konto bankowe, aby spłacić saldo karty Expensify, lub dodaj nowe konto bankowe',
            accountEndingIn: 'Konto kończące się na',
            addNewBankAccount: 'Dodaj nowe konto bankowe',
            settlementAccount: 'Konto rozliczeniowe',
            settlementAccountDescription: 'Wybierz konto, z którego spłacisz saldo karty Expensify.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Upewnij się, że to konto zgadza się z Twoim <a href="${reconciliationAccountSettingsLink}">kontem uzgadniającym</a> (${accountNumber}), aby Ciągłe uzgadnianie działało poprawnie.`,
            settlementFrequency: 'Częstotliwość rozliczania',
            settlementFrequencyDescription: 'Wybierz, jak często będziesz spłacać saldo swojej karty Expensify.',
            settlementFrequencyInfo:
                'Jeśli chcesz przejść na miesięczne rozliczenia, musisz podłączyć swoje konto bankowe za pośrednictwem Plaid i mieć dodatnią historię salda z ostatnich 90 dni.',
            frequency: {
                daily: 'Codziennie',
                monthly: 'Miesięcznie',
            },
            cardDetails: 'Szczegóły karty',
            cardPending: ({name}: {name: string}) => `Karta jest obecnie w oczekiwaniu i zostanie wydana, gdy konto ${name} zostanie zweryfikowane.`,
            virtual: 'Wirtualna',
            physical: 'Fizyczne',
            deactivate: 'Dezaktywuj kartę',
            changeCardLimit: 'Zmień limit karty',
            changeLimit: 'Zmień limit',
            smartLimitWarning: (limit: number | string) =>
                `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane, dopóki nie zatwierdzisz dodatkowych wydatków na tej karcie.`,
            monthlyLimitWarning: (limit: number | string) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane do następnego miesiąca.`,
            fixedLimitWarning: (limit: number | string) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje zostaną odrzucone.`,
            changeCardLimitType: 'Zmień typ limitu karty',
            changeLimitType: 'Zmień typ limitu',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Jeśli zmienisz typ limitu tej karty na Smart Limit, nowe transakcje zostaną odrzucone, ponieważ niezatwierdzony limit ${limit} został już osiągnięty.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Jeśli zmienisz typ limitu tej karty na miesięczny, nowe transakcje zostaną odrzucone, ponieważ miesięczny limit ${limit} został już osiągnięty.`,
            addShippingDetails: 'Dodaj dane wysyłki',
            issuedCard: (assignee: string) => `wydał(-a) kartę Expensify dla ${assignee}! Karta dotrze w ciągu 2–3 dni roboczych.`,
            issuedCardNoShippingDetails: (assignee: string) => `wydał(-a) użytkownikowi ${assignee} kartę Expensify! Karta zostanie wysłana po potwierdzeniu danych wysyłkowych.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `wystawiono dla ${assignee} wirtualną kartę Expensify! Z ${link} można korzystać od razu.`,
            addedShippingDetails: (assignee: string) => `${assignee} dodał(-a) dane wysyłki. Karta Expensify dotrze w ciągu 2–3 dni roboczych.`,
            replacedCard: (assignee: string) => `${assignee} wymienił(-a) swoją kartę Expensify. Nowa karta dotrze w ciągu 2–3 dni roboczych.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} wymienił(a) swoją wirtualną kartę Expensify! ${link} można używać od razu.`,
            card: 'karta',
            replacementCard: 'karta zastępcza',
            verifyingHeader: 'Trwa weryfikacja',
            bankAccountVerifiedHeader: 'Konto bankowe zweryfikowane',
            verifyingBankAccount: 'Weryfikowanie konta bankowego...',
            verifyingBankAccountDescription: 'Proszę czekać, potwierdzamy, czy to konto może zostać użyte do wydawania kart Expensify.',
            bankAccountVerified: 'Konto bankowe zostało zweryfikowane!',
            bankAccountVerifiedDescription: 'Możesz teraz wydawać karty Expensify członkom swojego przestrzeni roboczej.',
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
            requiresCategory: 'Członkowie muszą skategoryzować wszystkie wydatki',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Wszystkie wydatki muszą zostać skategoryzowane, aby można je było wyeksportować do ${connectionName}.`,
            subtitle: 'Uzyskaj lepszy wgląd w to, na co wydawane są pieniądze. Skorzystaj z naszych domyślnych kategorii lub dodaj własne.',
            emptyCategories: {
                title: 'Nie utworzyłeś żadnych kategorii',
                subtitle: 'Dodaj kategorię, aby uporządkować swoje wydatki.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Twoje kategorie są obecnie importowane z połączenia księgowego. Przejdź do strony <a href="${accountingPageURL}">Księgowość</a>, aby wprowadzić zmiany.</centered-text></muted-text>`,
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
            payrollCode: 'Kod listy płac',
            updatePayrollCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu płacowego, spróbuj ponownie',
            glCode: 'Kod KG',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu GL, spróbuj ponownie',
            importCategories: 'Importuj kategorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Nie można usunąć ani wyłączyć wszystkich kategorii',
                description: `Co najmniej jedna kategoria musi pozostać włączona, ponieważ w Twoim workspace kategorie są wymagane.`,
            },
        },
        moreFeatures: {
            subtitle: 'Użyj przełączników poniżej, aby włączać kolejne funkcje w miarę rozwoju. Każda funkcja pojawi się w menu nawigacji, umożliwiając dalsze dostosowanie.',
            spendSection: {
                title: 'Wydatki',
                subtitle: 'Włącz funkcjonalność, która pomoże skalować Twój zespół.',
            },
            manageSection: {
                title: 'Zarządzaj',
                subtitle: 'Dodaj mechanizmy kontrolne, które pomagają utrzymać wydatki w ramach budżetu.',
            },
            earnSection: {
                title: 'Zarabiaj',
                subtitle: 'Usprawnij swój przychód i otrzymuj płatności szybciej.',
            },
            organizeSection: {
                title: 'Porządkuj',
                subtitle: 'Grupuj i analizuj wydatki, rejestruj każdy zapłacony podatek.',
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
                subtitle: 'Ustaw stawki ryczałtu dziennego, aby kontrolować codzienne wydatki pracowników.',
            },
            travel: {
                title: 'Podróże',
                subtitle: 'Rezerwuj, zarządzaj i uzgadniaj wszystkie swoje podróże służbowe.',
                getStarted: {
                    title: 'Zacznij korzystać z Expensify Travel',
                    subtitle: 'Potrzebujemy tylko kilku dodatkowych informacji o Twojej firmie, a potem będziesz gotowy do startu.',
                    ctaText: 'Zaczynajmy',
                },
                reviewingRequest: {
                    title: 'Pakuj się, otrzymaliśmy Twoją prośbę…',
                    subtitle: 'Obecnie rozpatrujemy Twoją prośbę o włączenie Expensify Travel. Nie martw się, damy Ci znać, gdy będzie gotowe.',
                    ctaText: 'Wysłano prośbę',
                },
                bookOrManageYourTrip: {
                    title: 'Zarezerwuj lub zarządzaj swoją podróżą',
                    subtitle: 'Skorzystaj z Expensify Travel, aby uzyskać najlepsze oferty podróży i zarządzać wszystkimi wydatkami służbowymi w jednym miejscu.',
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
                        subtitle: 'Scentralizuj wszystkie wydatki na podróże w miesięcznej fakturze zamiast płacić w momencie zakupu.',
                        learnHow: 'Dowiedz się jak.',
                        subsections: {
                            currentTravelSpendLabel: 'Aktualne wydatki na podróże',
                            currentTravelSpendCta: 'Spłać saldo',
                            currentTravelLimitLabel: 'Aktualny limit podróży',
                            settlementAccountLabel: 'Konto rozliczeniowe',
                            settlementFrequencyLabel: 'Częstotliwość rozliczania',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Karta Expensify',
                subtitle: 'Uzyskaj wgląd i kontrolę nad wydatkami.',
                disableCardTitle: 'Wyłącz kartę Expensify',
                disableCardPrompt: 'Nie możesz dezaktywować karty Expensify, ponieważ jest już w użyciu. Skontaktuj się z Concierge, aby poznać dalsze kroki.',
                disableCardButton: 'Czat z Concierge',
                feed: {
                    title: 'Zdobądź kartę Expensify',
                    subTitle: 'Usprawnij rozliczanie wydatków firmowych i zaoszczędź do 50% na swoim rachunku w Expensify, a dodatkowo:',
                    features: {
                        cashBack: 'Zwrot gotówki za każdy zakup w USA',
                        unlimited: 'Nielimitowane karty wirtualne',
                        spend: 'Kontrola wydatków i niestandardowe limity',
                    },
                    ctaTitle: 'Wydaj nową kartę',
                },
            },
            companyCards: {
                title: 'Karty firmowe',
                subtitle: 'Połącz karty, które już masz.',
                feed: {
                    title: 'Użyj swoich własnych kart (BYOC)',
                    subtitle: 'Połącz posiadane już karty, aby automatycznie importować transakcje, dopasowywać paragony i przeprowadzać uzgadnianie.',
                    features: {
                        support: 'Podłącz karty z ponad 10 000 banków',
                        assignCards: 'Połącz istniejące karty Twojego zespołu',
                        automaticImport: 'Automatycznie pobierzemy transakcje',
                    },
                },
                bankConnectionError: 'Problem z połączeniem z bankiem',
                connectWithPlaid: 'połącz przez Plaid',
                connectWithExpensifyCard: 'wypróbuj kartę Expensify.',
                bankConnectionDescription: `Spróbuj dodać swoje karty jeszcze raz. W przeciwnym razie możesz`,
                disableCardTitle: 'Wyłącz firmowe karty',
                disableCardPrompt: 'Nie możesz wyłączyć kart firmowych, ponieważ ta funkcja jest obecnie używana. Skontaktuj się z Concierge, aby poznać kolejne kroki.',
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
                    `Wybierz konto ${integration}, do którego mają być eksportowane transakcje. Aby zmienić dostępne konta, wybierz inną <a href="${exportPageLink}">opcję eksportu</a>.`,
                lastUpdated: 'Ostatnia aktualizacja',
                transactionStartDate: 'Data początkowa transakcji',
                updateCard: 'Zaktualizuj kartę',
                unassignCard: 'Cofnij przypisanie karty',
                unassign: 'Cofnij przypisanie',
                unassignCardDescription: 'Odłączenie tej karty usunie wszystkie transakcje w raportach w wersji roboczej z konta posiadacza karty.',
                assignCard: 'Przypisz kartę',
                cardFeedName: 'Nazwa kanału karty',
                cardFeedNameDescription: 'Nadaj źródłu danych karty unikalną nazwę, aby odróżnić je od innych.',
                cardFeedTransaction: 'Usuń transakcje',
                cardFeedTransactionDescription: 'Wybierz, czy posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą podlegały tym zasadom.',
                cardFeedRestrictDeletingTransaction: 'Ogranicz usuwanie transakcji',
                cardFeedAllowDeletingTransaction: 'Zezwalaj na usuwanie transakcji',
                removeCardFeed: 'Usuń kanał karty',
                removeCardFeedTitle: (feedName: string) => `Usuń strumień ${feedName}`,
                removeCardFeedDescription: 'Czy na pewno chcesz usunąć ten kanał kart? Spowoduje to odłączenie wszystkich kart.',
                error: {
                    feedNameRequired: 'Nazwa strumienia karty jest wymagana',
                    statementCloseDateRequired: 'Wybierz datę zamknięcia wyciągu.',
                },
                corporate: 'Ogranicz usuwanie transakcji',
                personal: 'Zezwalaj na usuwanie transakcji',
                setFeedNameDescription: 'Nadaj kanałowi karty unikalną nazwę, aby odróżnić go od pozostałych',
                setTransactionLiabilityDescription: 'Po włączeniu posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą stosować się do tej reguły.',
                emptyAddedFeedTitle: 'Brak kart w tym kanale',
                emptyAddedFeedDescription: 'Upewnij się, że w strumieniu kart Twojego banku znajdują się karty.',
                pendingFeedTitle: `Przeglądamy Twoje zgłoszenie...`,
                pendingFeedDescription: `Obecnie sprawdzamy szczegóły Twojego kanału. Gdy to zakończymy, skontaktujemy się z Tobą przez`,
                pendingBankTitle: 'Sprawdź okno przeglądarki',
                pendingBankDescription: (bankName: string) => `Połącz się z ${bankName} w oknie przeglądarki, które właśnie się otworzyło. Jeśli żadne się nie otworzyło,`,
                pendingBankLink: 'kliknij tutaj',
                giveItNameInstruction: 'Nadaj karcie nazwę, która wyróżni ją spośród innych.',
                updating: 'Aktualizowanie...',
                neverUpdated: 'Nigdy',
                noAccountsFound: 'Nie znaleziono kont',
                defaultCard: 'Domyślna karta',
                downgradeTitle: `Nie można obniżyć poziomu przestrzeni roboczej`,
                downgradeSubTitle: `Tego obszaru roboczego nie można zdegradować, ponieważ jest podłączonych wiele źródeł kart (z wyłączeniem kart Expensify). Aby kontynuować, proszę <a href="#">pozostawić tylko jedno źródło kart</a>.`,
                noAccountsFoundDescription: (connection: string) => `Dodaj konto w ${connection} i ponownie zsynchronizuj połączenie`,
                expensifyCardBannerTitle: 'Zdobądź kartę Expensify',
                expensifyCardBannerSubtitle:
                    'Korzystaj z cashbacku przy każdym zakupie w USA, zniżki do 50% na swój rachunek w Expensify, nielimitowanych kart wirtualnych i wielu innych korzyści.',
                expensifyCardBannerLearnMoreButton: 'Dowiedz się więcej',
                statementCloseDateTitle: 'Data zamknięcia wyciągu',
                statementCloseDateDescription: 'Daj nam znać, kiedy zamyka się wyciąg z Twojej karty, a my utworzymy pasujący wyciąg w Expensify.',
            },
            workflows: {
                title: 'Przepływy pracy',
                subtitle: 'Skonfiguruj sposób zatwierdzania i opłacania wydatków.',
                disableApprovalPrompt:
                    'Karty Expensify z tego obszaru roboczego obecnie opierają się na akceptacji przy definiowaniu swoich Inteligentnych limitów. Zmień typy limitów wszystkich kart Expensify z Inteligentnymi limitami przed wyłączeniem akceptacji.',
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
                subtitle: 'Klasyfikuj koszty i śledź wydatki podlegające refakturowaniu.',
            },
            taxes: {
                title: 'Podatki',
                subtitle: 'Udokumentuj i odzyskaj kwalifikujące się podatki.',
            },
            reportFields: {
                title: 'Pola raportu',
                subtitle: 'Skonfiguruj niestandardowe pola dla wydatków.',
            },
            connections: {
                title: 'Księgowość',
                subtitle: 'Synchronizuj plan kont i nie tylko.',
            },
            receiptPartners: {
                title: 'Partnerzy paragonów',
                subtitle: 'Automatycznie importuj paragony.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nie tak szybko...',
                featureEnabledText: 'Aby włączyć lub wyłączyć tę funkcję, musisz zmienić ustawienia importu księgowego.',
                disconnectText: 'Aby wyłączyć księgowość, musisz odłączyć połączenie księgowe od swojego miejsca pracy.',
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
                    'Karty Expensify w tym obszarze roboczym opierają się na obiegach akceptacji, aby definiować swoje Inteligentne Limity.\n\nZmień typy limitów wszystkich kart z Inteligentnymi Limitami przed wyłączeniem obiegów.',
                confirmText: 'Przejdź do kart Expensify',
            },
            rules: {
                title: 'Zasady',
                subtitle: 'Wymagaj paragonów, oznaczaj wysokie wydatki i nie tylko.',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Przykłady:',
            customReportNamesSubtitle: `<muted-text>Dostosuj tytuły raportów za pomocą naszych <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">rozbudowanych formuł</a>.</muted-text>`,
            customNameTitle: 'Domyślny tytuł raportu',
            customNameDescription: `Wybierz własną nazwę raportów wydatków, korzystając z naszych <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">rozbudowanych formuł</a>.`,
            customNameInputLabel: 'Nazwa',
            customNameEmailPhoneExample: 'E-mail lub telefon członka: {report:submit:from}',
            customNameStartDateExample: 'Data początkowa raportu: {report:startdate}',
            customNameWorkspaceNameExample: 'Nazwa przestrzeni roboczej: {report:workspacename}',
            customNameReportIDExample: 'Identyfikator raportu: {report:id}',
            customNameTotalExample: 'Suma: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Zabroń członkom zmieniać niestandardowe tytuły raportów',
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
                subtitle: 'Dodaj własne pole (tekst, data lub lista rozwijana), które pojawi się w raportach.',
            },
            subtitle: 'Pola raportu mają zastosowanie do wszystkich wydatków i mogą być pomocne, gdy chcesz poprosić o dodatkowe informacje.',
            disableReportFields: 'Wyłącz pola raportu',
            disableReportFieldsConfirmation: 'Czy na pewno? Pola tekstowe i daty zostaną usunięte, a listy wyłączone.',
            importedFromAccountingSoftware: 'Poniższe pola raportu są importowane z Twojego',
            textType: 'Tekst',
            dateType: 'Data',
            dropdownType: 'Lista',
            formulaType: 'Formuła',
            textAlternateText: 'Dodaj pole do swobodnego wprowadzania tekstu.',
            dateAlternateText: 'Dodaj kalendarz do wyboru daty.',
            dropdownAlternateText: 'Dodaj listę opcji do wyboru.',
            formulaAlternateText: 'Dodaj pole formuły.',
            nameInputSubtitle: 'Wybierz nazwę dla pola raportu.',
            typeInputSubtitle: 'Wybierz, jakiego typu pola raportu chcesz użyć.',
            initialValueInputSubtitle: 'Wprowadź wartość początkową, którą chcesz wyświetlać w polu raportu.',
            listValuesInputSubtitle: 'Te wartości będą wyświetlane na liście rozwijanej pola raportu. Włączone wartości mogą być wybierane przez członków.',
            listInputSubtitle: 'Te wartości pojawią się na liście pól raportu. Włączone wartości mogą być wybierane przez członków.',
            deleteValue: 'Usuń wartość',
            deleteValues: 'Usuń wartości',
            disableValue: 'Wyłącz wartość',
            disableValues: 'Wyłącz wartości',
            enableValue: 'Włącz wartość',
            enableValues: 'Włącz wartości',
            emptyReportFieldsValues: {
                title: 'Nie utworzyłeś(-aś) żadnych wartości listy',
                subtitle: 'Dodaj własne wartości, które będą widoczne na raportach.',
            },
            deleteValuePrompt: 'Czy na pewno chcesz usunąć tę wartość listy?',
            deleteValuesPrompt: 'Czy na pewno chcesz usunąć te wartości listy?',
            listValueRequiredError: 'Wprowadź nazwę wartości listy',
            existingListValueError: 'Wartość listy o tej nazwie już istnieje',
            editValue: 'Edytuj wartość',
            listValues: 'Wymień wartości',
            addValue: 'Dodaj wartość',
            existingReportFieldNameError: 'Pole raportu o tej nazwie już istnieje',
            reportFieldNameRequiredError: 'Wpisz nazwę pola raportu',
            reportFieldTypeRequiredError: 'Wybierz typ pola raportu',
            circularReferenceError: 'To pole nie może odwoływać się do siebie. Zaktualizuj je.',
            reportFieldInitialValueRequiredError: 'Wybierz początkową wartość pola raportu',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania pola raportu. Spróbuj ponownie.',
        },
        tags: {
            tagName: 'Nazwa tagu',
            requiresTag: 'Członkowie muszą tagować wszystkie wydatki',
            trackBillable: 'Śledź rozliczalne wydatki',
            customTagName: 'Niestandardowa nazwa tagu',
            enableTag: 'Włącz znacznik',
            enableTags: 'Włącz tagi',
            requireTag: 'Wymagany tag',
            requireTags: 'Wymagaj tagów',
            notRequireTags: 'Nie wymagaj',
            disableTag: 'Wyłącz tag',
            disableTags: 'Wyłącz tagi',
            addTag: 'Dodaj znacznik',
            editTag: 'Edytuj znacznik',
            editTags: 'Edytuj znaczniki',
            findTag: 'Znajdź znacznik',
            subtitle: 'Tagi umożliwiają bardziej szczegółowe klasyfikowanie kosztów.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Używasz <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">tagów zależnych</a>. Możesz <a href="${importSpreadsheetLink}">ponownie zaimportować arkusz kalkulacyjny</a>, aby zaktualizować swoje tagi.</muted-text>`,
            emptyTags: {
                title: 'Nie utworzyłeś(-aś) żadnych znaczników',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Dodaj znacznik, aby śledzić projekty, lokalizacje, działy i inne.',
                subtitleHTML: `<muted-text><centered-text>Dodaj tagi, aby śledzić projekty, lokalizacje, działy i nie tylko. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Dowiedz się więcej</a> o formatowaniu plików z tagami do importu.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Twoje tagi są obecnie importowane z połączenia księgowego. Przejdź do <a href="${accountingPageURL}">księgowości</a>, aby wprowadzić zmiany.</centered-text></muted-text>`,
            },
            deleteTag: 'Usuń znacznik',
            deleteTags: 'Usuń tagi',
            deleteTagConfirmation: 'Czy na pewno chcesz usunąć ten tag?',
            deleteTagsConfirmation: 'Czy na pewno chcesz usunąć te tagi?',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania tagu, spróbuj ponownie',
            tagRequiredError: 'Nazwa tagu jest wymagana',
            existingTagError: 'Etykieta o tej nazwie już istnieje',
            invalidTagNameError: 'Nazwa tagu nie może wynosić 0. Wybierz inną wartość.',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania tagu, spróbuj ponownie',
            importedFromAccountingSoftware: 'Poniższe znaczniki zostały zaimportowane z Twojego',
            glCode: 'Kod KG',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu GL, spróbuj ponownie',
            tagRules: 'Zasady tagów',
            approverDescription: 'Osoba zatwierdzająca',
            importTags: 'Importuj tagi',
            importTagsSupportingText: 'Kodekuj wydatki za pomocą jednego rodzaju tagu lub wielu.',
            configureMultiLevelTags: 'Skonfiguruj swoją listę tagów na potrzeby tagowania wielopoziomowego.',
            importMultiLevelTagsSupportingText: `Oto podgląd Twoich tagów. Jeśli wszystko wygląda dobrze, kliknij poniżej, aby je zaimportować.`,
            importMultiLevelTags: {
                firstRowTitle: 'Pierwszy wiersz jest tytułem każdej listy tagów',
                independentTags: 'To są niezależne tagi',
                glAdjacentColumn: 'W sąsiedniej kolumnie znajduje się kod GL',
            },
            tagLevel: {
                singleLevel: 'Pojedynczy poziom znaczników',
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
                `Znaleźliśmy *${columnCounts} kolumn* w Twoim arkuszu kalkulacyjnym. Wybierz *Name* obok kolumny, która zawiera nazwy tagów. Możesz także wybrać *Enabled* obok kolumny, która określa status tagów.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Nie można usunąć ani wyłączyć wszystkich tagów',
                description: `Przynajmniej jeden znacznik musi pozostać włączony, ponieważ w Twoim workspace korzystanie ze znaczników jest wymagane.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Nie można ustawić wszystkich tagów jako opcjonalnych',
                description: `Co najmniej jeden znacznik musi pozostać wymagany, ponieważ ustawienia Twojego workspace’u wymagają znaczników.`,
            },
            cannotMakeTagListRequired: {
                title: 'Nie można ustawić listy tagów jako wymaganej',
                description: 'Możesz ustawić listę znaczników jako wymaganą tylko wtedy, gdy w Twojej polityce skonfigurowano wiele poziomów znaczników.',
            },
            tagCount: () => ({
                one: '1 dzień',
                other: (count: number) => `${count} tagi`,
            }),
        },
        taxes: {
            subtitle: 'Dodaj nazwy podatków, stawki i ustaw domyślne wartości.',
            addRate: 'Dodaj stawkę',
            workspaceDefault: 'Domyślna waluta przestrzeni roboczej',
            foreignDefault: 'Domyślna waluta obca',
            customTaxName: 'Niestandardowa nazwa podatku',
            value: 'Wartość',
            taxReclaimableOn: 'Podatek możliwy do odzyskania od',
            taxRate: 'Stawka podatku',
            findTaxRate: 'Znajdź stawkę podatku',
            error: {
                taxRateAlreadyExists: 'Ta nazwa podatku jest już używana',
                taxCodeAlreadyExists: 'Ten kod podatkowy jest już w użyciu',
                valuePercentageRange: 'Wprowadź prawidłowy procent w przedziale od 0 do 100',
                customNameRequired: 'Wymagana jest niestandardowa nazwa podatku',
                deleteFailureMessage: 'Wystąpił błąd podczas usuwania stawki podatku. Spróbuj ponownie lub poproś Concierge o pomoc.',
                updateFailureMessage: 'Wystąpił błąd podczas aktualizowania stawki podatku. Spróbuj ponownie lub poproś Concierge o pomoc.',
                createFailureMessage: 'Wystąpił błąd podczas tworzenia stawki podatku. Spróbuj ponownie lub poproś Concierge o pomoc.',
                updateTaxClaimableFailureMessage: 'Część podlegająca zwrotowi musi być mniejsza niż kwota stawki za kilometr',
            },
            deleteTaxConfirmation: 'Czy na pewno chcesz usunąć ten podatek?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Czy na pewno chcesz usunąć podatek w wysokości ${taxAmount}?`,
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
            importedFromAccountingSoftware: 'Poniższe podatki zostały zaimportowane z Twojego',
            taxCode: 'Kod podatkowy',
            updateTaxCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu podatkowego, spróbuj ponownie',
        },
        duplicateWorkspace: {
            title: 'Nazwij swój nowy workspace',
            selectFeatures: 'Wybierz funkcje do skopiowania',
            whichFeatures: 'Które funkcje chcesz skopiować do swojego nowego obszaru roboczego?',
            confirmDuplicate: 'Czy chcesz kontynuować?',
            categories: 'kategorie i twoje reguły automatycznej kategoryzacji',
            reimbursementAccount: 'konto zwrotu kosztów',
            welcomeNote: 'Zacznij proszę korzystać z mojego nowego przestrzeni roboczej',
            delayedSubmission: 'opóźnione przesłanie',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Zaraz utworzysz i udostępnisz ${newWorkspaceName ?? ''} ${totalMembers ?? 0} członkom z oryginalnego obszaru roboczego.`,
            error: 'Wystąpił błąd podczas duplikowania Twojej nowej przestrzeni roboczej. Spróbuj ponownie.',
        },
        emptyWorkspace: {
            title: 'Nie masz żadnych przestrzeni roboczych',
            subtitle: 'Śledź paragony, rozliczaj wydatki, zarządzaj podróżami, wysyłaj faktury i nie tylko.',
            createAWorkspaceCTA: 'Rozpocznij',
            features: {
                trackAndCollect: 'Śledź i zbieraj paragony',
                reimbursements: 'Zwróć pracownikom wydatki',
                companyCards: 'Zarządzaj kartami firmowymi',
            },
            notFound: 'Nie znaleziono przestrzeni roboczej',
            description: 'Pokoje to świetne miejsce do dyskusji i współpracy z wieloma osobami. Aby rozpocząć współpracę, utwórz lub dołącz do przestrzeni roboczej',
        },
        new: {
            newWorkspace: 'Nowy workspace',
            getTheExpensifyCardAndMore: 'Zdobądź kartę Expensify i więcej',
            confirmWorkspace: 'Potwierdź przestrzeń roboczą',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mój obszar roboczy grupy${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Obszar roboczy użytkownika ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Wystąpił błąd podczas usuwania członka ze przestrzeni roboczej, spróbuj ponownie',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Czy na pewno chcesz usunąć ${memberName}?`,
                other: 'Czy na pewno chcesz usunąć tych członków?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} jest osobą zatwierdzającą w tym obszarze roboczym. Gdy przestaniesz współdzielić z nimi ten obszar roboczy, zastąpimy ich w przepływie zatwierdzania właścicielem obszaru roboczego, ${ownerName}`,
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
                other: 'Utwórz członków',
            }),
            makeAdmin: () => ({
                one: 'Uczyń administratorem',
                other: 'Uczyń administratorami',
            }),
            makeAuditor: () => ({
                one: 'Uczyń audytorem',
                other: 'Utwórz audytorów',
            }),
            selectAll: 'Zaznacz wszystko',
            error: {
                genericAdd: 'Wystąpił problem z dodaniem tego członka przestrzeni roboczej',
                cannotRemove: 'Nie możesz usunąć siebie ani właściciela przestrzeni roboczej',
                genericRemove: 'Wystąpił problem z usunięciem tego członka przestrzeni roboczej',
            },
            addedWithPrimary: 'Niektórzy członkowie zostali dodani z użyciem swoich głównych loginów.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Dodane przez dodatkowy login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Łączna liczba członków przestrzeni roboczej: ${count}`,
            importMembers: 'Importuj członków',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${approver} z tego obszaru roboczego, zastąpimy tę osobę w obiegu akceptacji przez ${workspaceOwner}, właściciela obszaru roboczego.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} ma zaległe raporty wydatków do zatwierdzenia. Poproś tę osobę o ich zatwierdzenie lub przejmij kontrolę nad jej raportami, zanim usuniesz ją z przestrzeni roboczej.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Nie możesz usunąć ${memberName} z tej przestrzeni roboczej. Ustaw nową osobę rozliczającą w Workflows > Make or track payments, a następnie spróbuj ponownie.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${memberName} z tej przestrzeni roboczej, zastąpimy tę osobę jako preferowanego eksportera użytkownikiem ${workspaceOwner}, właścicielem przestrzeni roboczej.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${memberName} z tej przestrzeni roboczej, zastąpimy tę osobę jako kontakt techniczny użytkownikiem ${workspaceOwner}, właścicielem przestrzeni roboczej.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} ma zaległy raport w trakcie przetwarzania, który wymaga działania. Poproś tę osobę o wykonanie wymaganej czynności przed usunięciem jej z przestrzeni roboczej.`,
        },
        card: {
            getStartedIssuing: 'Rozpocznij, wydając swoją pierwszą wirtualną lub fizyczną kartę.',
            issueCard: 'Wydaj kartę',
            issueNewCard: {
                whoNeedsCard: 'Kto potrzebuje karty?',
                inviteNewMember: 'Zaproś nową osobę',
                findMember: 'Znajdź członka',
                chooseCardType: 'Wybierz typ karty',
                physicalCard: 'Fizyczna karta',
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
                cardLimitError: 'Wprowadź kwotę mniejszą niż 21 474 836 USD',
                giveItName: 'Nadaj nazwę',
                giveItNameInstruction: 'Uczyń ją na tyle unikalną, aby odróżniała się od innych kart. Konkretne zastosowania są jeszcze lepsze!',
                cardName: 'Nazwa karty',
                letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
                willBeReadyToUse: 'Ta karta będzie od razu gotowa do użycia.',
                willBeReadyToShip: 'Ta karta będzie gotowa do natychmiastowej wysyłki.',
                cardholder: 'Posiadacz karty',
                cardType: 'Typ karty',
                limit: 'Limit',
                limitType: 'Typ limitu',
                disabledApprovalForSmartLimitError: 'Przed skonfigurowaniem inteligentnych limitów włącz zatwierdzanie w <strong>Workflows > Add approvals</strong>',
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
            subtitle: 'Połącz się ze swoim systemem księgowym, aby księgować transakcje z użyciem planu kont, automatycznie dopasowywać płatności i utrzymywać finanse w synchronizacji.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Porozmawiaj ze swoim specjalistą ds. konfiguracji.',
            talkYourAccountManager: 'Czat z opiekunem konta.',
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
                `Wystąpił błąd połączenia skonfigurowanego w Expensify Classic. [Przejdź do Expensify Classic, aby rozwiązać ten problem.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Przejdź do Expensify Classic, aby zarządzać swoimi ustawieniami.',
            setup: 'Połącz',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Ostatnia synchronizacja ${relativeDate}`,
            notSync: 'Niezsynchronizowane',
            import: 'Importuj',
            export: 'Eksportuj',
            advanced: 'Zaawansowane',
            other: 'Inne',
            syncNow: 'Synchronizuj teraz',
            disconnect: 'Odłącz',
            reinstall: 'Zainstaluj ponownie konektor',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integracja';
                return `Odłącz ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Połącz ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integracja z systemem księgowym'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Nie można połączyć się z QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Nie można połączyć z Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Nie można połączyć z NetSuite';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Zaimportowano jako pola raportu',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Domyślny pracownik NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'tę integrację';
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
                    headline: 'Uzyskaj 5% zniżki na przejazdy Uberem',
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
                            return 'Importowanie danych Xero';
                        case 'startingImportQBO':
                            return 'Importowanie danych z QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importowanie danych z QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importowanie tytułu';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importowanie certyfikatu zatwierdzającego';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importowanie wymiarów';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importowanie zapisanej polityki';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Trwa synchronizowanie danych z QuickBooks... Upewnij się, że Web Connector jest uruchomiony';
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
                            return 'Oznaczanie raportów Expensify jako zwrócone';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Oznaczanie rachunków i faktur w Xero jako opłaconych';
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
                            return 'Oznaczanie raportów Expensify jako zwrócone';
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
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Brak tłumaczenia dla etapu: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Preferowany eksporter',
            exportPreferredExporterNote:
                'Preferowanym eksporterem może być dowolny administrator przestrzeni roboczej, ale musi on być także administratorem domeny, jeśli ustawisz różne konta eksportu dla poszczególnych firmowych kart w Ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy w swoim koncie raporty do eksportu.',
            exportAs: 'Eksportuj jako',
            exportOutOfPocket: 'Eksportuj wydatki z własnej kieszeni jako',
            exportCompanyCard: 'Wyeksportuj wydatki z karty firmowej jako',
            exportDate: 'Data eksportu',
            defaultVendor: 'Domyślny dostawca',
            autoSync: 'Automatyczna synchronizacja',
            autoSyncDescription: 'Synchronizuj NetSuite i Expensify automatycznie, każdego dnia. Eksportuj sfinalizowany raport w czasie rzeczywistym',
            reimbursedReports: 'Synchronizuj rozliczone raporty',
            cardReconciliation: 'Uzgadnianie kart',
            reconciliationAccount: 'Konto rozliczeniowe',
            continuousReconciliation: 'Ciągłe uzgadnianie',
            saveHoursOnReconciliation:
                'Oszczędzaj godziny przy uzgadnianiu każego okresu rozliczeniowego, powierzając Expensify ciągłe uzgadnianie zestawień i rozliczeń karty Expensify Card w Twoim imieniu.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Aby włączyć ciągłe uzgadnianie, włącz proszę <a href="${accountingAdvancedSettingsLink}">automatyczną synchronizację</a> dla ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wybierz konto bankowe, z którym będą uzgadniane płatności Twoją kartą Expensify.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Upewnij się, że to konto odpowiada Twojemu <a href="${settlementAccountUrl}">rachunkowi rozliczeniowemu karty Expensify</a> (kończącemu się na ${lastFourPAN}), aby Ciągła Rekonsyliacja działała poprawnie.`,
            },
        },
        export: {
            notReadyHeading: 'Niegotowe do eksportu',
            notReadyDescription: 'Szkice ani oczekujące raporty wydatków nie mogą zostać wyeksportowane do systemu księgowego. Zatwierdź lub opłać te wydatki przed ich eksportem.',
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
                payingAsBusiness: 'Płacenie jako firma',
            },
            invoiceBalance: 'Saldo faktury',
            invoiceBalanceSubtitle: 'To jest Twoje bieżące saldo z zebranych płatności faktur. Zostanie automatycznie przelane na Twoje konto bankowe, jeśli je dodałeś.',
            bankAccountsSubtitle: 'Dodaj konto bankowe, aby wysyłać i odbierać płatności za faktury.',
        },
        invite: {
            member: 'Zaproś członka',
            members: 'Zaproś członków',
            invitePeople: 'Zaproś nowych członków',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Spróbuj ponownie.',
            pleaseEnterValidLogin: `Upewnij się, że adres e‑mail lub numer telefonu jest prawidłowy (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
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
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} poprosił(-a) o dołączenie do ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nie tak szybko…',
            workspaceNeeds: 'Miejsce pracy musi mieć włączoną co najmniej jedną stawkę za przejazd.',
            distance: 'Dystans',
            centrallyManage: 'Centralnie zarządzaj stawkami, śledź przejazdy w milach lub kilometrach i ustaw domyślną kategorię.',
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
                '<muted-text>Aby korzystać z tej funkcji, musisz włączyć podatki w przestrzeni roboczej. Przejdź do <a href="#">Więcej funkcji</a>, aby to zmienić.</muted-text>',
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
            nameInputLabel: 'Nazwa',
            typeInputLabel: 'Typ',
            initialValueInputLabel: 'Wartość początkowa',
            nameInputHelpText: 'To jest nazwa, którą zobaczysz w swoim obszarze roboczym.',
            nameIsRequiredError: 'Musisz nadać swojej przestrzeni roboczej nazwę',
            currencyInputLabel: 'Domyślna waluta',
            currencyInputHelpText: 'Wszystkie wydatki w tym obszarze roboczym zostaną przeliczone na tę walutę.',
            currencyInputDisabledText: (currency: string) => `Domyślnej waluty nie można zmienić, ponieważ to miejsce pracy jest powiązane z rachunkiem bankowym w ${currency}.`,
            save: 'Zapisz',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania przestrzeni roboczej. Spróbuj ponownie.',
            avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Spróbuj ponownie.',
            addressContext: 'Adres przestrzeni roboczej jest wymagany, aby włączyć Expensify Travel. Wprowadź adres powiązany z Twoją firmą.',
            policy: 'Polityka wydatków',
        },
        bankAccount: {
            continueWithSetup: 'Kontynuuj konfigurację',
            youAreAlmostDone: 'Prawie skończyłeś konfigurowanie konta bankowego, które pozwoli Ci wydawać karty służbowe, zwracać wydatki, pobierać faktury i opłacać rachunki.',
            streamlinePayments: 'Usprawnij płatności',
            connectBankAccountNote: 'Uwaga: Prywatne konta bankowe nie mogą być używane do płatności w przestrzeniach roboczych.',
            oneMoreThing: 'Jeszcze jedna rzecz!',
            allSet: 'Wszystko gotowe!',
            accountDescriptionWithCards: 'To to konto bankowe będzie używane do wydawania kart służbowych, zwrotu wydatków, pobierania należności z faktur i opłacania rachunków.',
            letsFinishInChat: 'Dokończmy to na czacie!',
            finishInChat: 'Dokończ na czacie',
            almostDone: 'Prawie gotowe!',
            disconnectBankAccount: 'Odłącz konto bankowe',
            startOver: 'Zacznij od nowa',
            updateDetails: 'Zaktualizuj dane',
            yesDisconnectMyBankAccount: 'Tak, odłącz moje konto bankowe',
            yesStartOver: 'Tak, zacznij od nowa',
            disconnectYourBankAccount: (bankName: string) =>
                `Odłącz swoje konto bankowe <strong>${bankName}</strong>. Wszystkie nierozliczone transakcje dla tego konta zostaną nadal zrealizowane.`,
            clearProgress: 'Rozpoczęcie od nowa spowoduje usunięcie dotychczasowych postępów.',
            areYouSure: 'Czy na pewno?',
            workspaceCurrency: 'Waluta przestrzeni roboczej',
            updateCurrencyPrompt: 'Wygląda na to, że Twoje środowisko pracy jest obecnie ustawione na inną walutę niż USD. Kliknij przycisk poniżej, aby teraz zmienić walutę na USD.',
            updateToUSD: 'Zaktualizuj na USD',
            updateWorkspaceCurrency: 'Zmień walutę przestrzeni roboczej',
            workspaceCurrencyNotSupported: 'Waluta przestrzeni roboczej nie jest obsługiwana',
            yourWorkspace: `Twoje środowisko pracy jest ustawione na niewspieraną walutę. Zobacz <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">listę obsługiwanych walut</a>.`,
            chooseAnExisting: 'Wybierz istniejące konto bankowe do opłacania wydatków lub dodaj nowe.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Przenieś właściciela',
            addPaymentCardTitle: 'Wprowadź swoją kartę płatniczą, aby przenieść własność',
            addPaymentCardButtonText: 'Zaakceptuj warunki i dodaj kartę płatniczą',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Przeczytaj i zaakceptuj <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">warunki</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">politykę prywatności</a>, aby dodać swoją kartę.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Zgodne z PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Szyfrowanie na poziomie bankowym',
            addPaymentCardRedundant: 'Redundantna infrastruktura',
            addPaymentCardLearnMore: `<muted-text>Dowiedz się więcej o naszym <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">zabezpieczeniu</a>.</muted-text>`,
            amountOwedTitle: 'Zaległe saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Toje konto ma zaległe saldo z poprzedniego miesiąca.\n\nCzy chcesz uregulować saldo i przejąć rozliczanie tego workspace?',
            ownerOwesAmountTitle: 'Zaległe saldo',
            ownerOwesAmountButtonText: 'Przenieś saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Konto będące właścicielem tego obszaru roboczego (${email}) ma zaległe saldo z poprzedniego miesiąca.

Czy chcesz przenieść tę kwotę (${amount}), aby przejąć rozliczanie tego obszaru roboczego? Twoja karta płatnicza zostanie obciążona natychmiast.`,
            subscriptionTitle: 'Przejmij roczną subskrypcję',
            subscriptionButtonText: 'Przenieś subskrypcję',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Przejęcie tego obszaru roboczego spowoduje połączenie jego rocznej subskrypcji z Twoją obecną subskrypcją. Zwiększy to rozmiar Twojej subskrypcji o ${usersCount} członków, co da nowy rozmiar subskrypcji ${finalCount}. Czy chcesz kontynuować?`,
            duplicateSubscriptionTitle: 'Alert zduplikowanej subskrypcji',
            duplicateSubscriptionButtonText: 'Kontynuuj',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Wygląda na to, że próbujesz przejąć rozliczenia za przestrzenie robocze użytkownika ${email}, ale aby to zrobić, musisz najpierw być administratorem wszystkich jego przestrzeni roboczych.

Kliknij „Kontynuuj”, jeśli chcesz przejąć rozliczenia tylko dla przestrzeni roboczej ${workspaceName}.

Jeśli chcesz przejąć rozliczenia za cały ich abonament, poproś ich najpierw o dodanie Cię jako administratora do wszystkich ich przestrzeni roboczych, zanim przejmiesz rozliczenia.`,
            hasFailedSettlementsTitle: 'Nie można przenieść własności',
            hasFailedSettlementsButtonText: 'Rozumiem',
            hasFailedSettlementsText: (email: string) =>
                `Nie możesz przejąć rozliczeń, ponieważ ${email} ma zaległą spłatę karty Expensify Card. Poproś tę osobę o kontakt z concierge@expensify.com w celu rozwiązania problemu. Następnie będziesz mógł/mogła przejąć rozliczenia dla tego obszaru roboczego.`,
            failedToClearBalanceTitle: 'Nie udało się wyczyścić salda',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Nie udało się wyczyścić salda. Spróbuj ponownie później.',
            successTitle: 'Juhu! Gotowe.',
            successDescription: 'Jesteś teraz właścicielem tego workspace’a.',
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

Czy na pewno chcesz wyeksportować je ponownie?`,
            confirmText: 'Tak, eksportuj ponownie',
            cancelText: 'Anuluj',
        },
        upgrade: {
            reportFields: {
                title: 'Pola raportu',
                description: `Pola raportu pozwalają określić szczegóły na poziomie nagłówka, odrębne od tagów odnoszących się do wydatków w poszczególnych pozycjach. Szczegóły te mogą obejmować konkretne nazwy projektów, informacje o podróżach służbowych, lokalizacje i inne.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Pola raportu są dostępne wyłącznie w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Korzystaj z automatycznej synchronizacji i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + NetSuite. Uzyskaj szczegółowy, aktualny w czasie rzeczywistym wgląd finansowy dzięki obsłudze natywnych i niestandardowych segmentów, w tym mapowania projektów i klientów.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z NetSuite jest dostępna wyłącznie w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Korzystaj z automatycznej synchronizacji i ograniczaj ręczne wprowadzanie danych dzięki integracji Expensify + Sage Intacct. Zyskaj szczegółowy, aktualny w czasie rzeczywistym wgląd w finanse dzięki definiowanym przez użytkownika wymiarom, a także kodowaniu wydatków według działu, klasy, lokalizacji, klienta i projektu (zadania).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z Sage Intacct jest dostępna tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Korzystaj z automatycznej synchronizacji i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + QuickBooks Desktop. Zyskaj maksymalną efektywność dzięki dwukierunkowemu połączeniu w czasie rzeczywistym oraz kategoryzacji wydatków według klasy, pozycji, klienta i projektu.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z QuickBooks Desktop jest dostępna tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Zaawansowane zatwierdzanie',
                description: `Jeśli chcesz dodać więcej poziomów zatwierdzania – lub po prostu upewnić się, że największe wydatki zostaną ponownie sprawdzone – mamy na to rozwiązanie. Zaawansowane zatwierdzanie pomaga wdrożyć odpowiednie mechanizmy kontroli na każdym poziomie, aby utrzymać wydatki zespołu pod kontrolą.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Zaawansowane zatwierdzanie jest dostępne tylko w planie Control, który zaczyna się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            categories: {
                title: 'Kategorie',
                description: 'Kategorie pozwalają śledzić i porządkować wydatki. Skorzystaj z naszych domyślnych kategorii lub dodaj własne.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorie są dostępne w planie Collect, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            glCodes: {
                title: 'Kody Księgi Głównej',
                description: `Dodaj kody GL do swoich kategorii i tagów, aby ułatwić eksport wydatków do systemów księgowych i płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody GL są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Konta K/G i kody płacowe',
                description: `Dodaj kody GL i kody płacowe do swoich kategorii, aby łatwo eksportować wydatki do systemów księgowych i płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody GL i płacowe są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Kody podatkowe',
                description: `Dodaj kody podatkowe do swoich podatków, aby ułatwić eksport wydatków do systemów księgowych i płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody podatkowe są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            companyCards: {
                title: 'Nielimitowane karty firmowe',
                description: `Musisz dodać więcej zasileń kart? Odblokuj nielimitowane karty firmowe, aby synchronizować transakcje od wszystkich głównych wydawców kart.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Funkcja dostępna tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            rules: {
                title: 'Zasady',
                description: `Reguły działają w tle i utrzymują Twoje wydatki pod kontrolą, żebyś nie musiał przejmować się drobiazgami.

Wymagaj szczegółów wydatku, takich jak paragony i opisy, ustawiaj limity i wartości domyślne oraz automatyzuj zatwierdzanie i płatności – wszystko w jednym miejscu.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Zasady są dostępne wyłącznie w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            perDiem: {
                title: 'Dieta',
                description:
                    'Diety to świetny sposób na utrzymanie dziennych kosztów w zgodzie z zasadami i przewidywalnych, gdy tylko Twoi pracownicy podróżują. Skorzystaj z funkcji takich jak niestandardowe stawki, domyślne kategorie oraz bardziej szczegółowe dane, np. miejsca docelowe i podstawkowania.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Diety są dostępne tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            travel: {
                title: 'Podróże',
                description:
                    'Expensify Travel to nowa platforma do rezerwacji i zarządzania podróżami służbowymi, która umożliwia członkom rezerwowanie noclegów, lotów, transportu i nie tylko.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Podróże są dostępne w planie Collect, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            reports: {
                title: 'Raporty',
                description: 'Raporty umożliwiają grupowanie wydatków, aby ułatwić ich śledzenie i organizację.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Raporty są dostępne w planie Collect, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Wielopoziomowe tagi',
                description:
                    'Wielopoziomowe tagi pomagają śledzić wydatki z większą precyzją. Przypisz wiele tagów do każdej pozycji, takich jak dział, klient lub centrum kosztów, aby uchwycić pełny kontekst każdego wydatku. Umożliwia to bardziej szczegółowe raportowanie, przepływy akceptacji i eksporty do systemów księgowych.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Wielopoziomowe tagi są dostępne tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Stawki za odległość',
                description: 'Twórz i zarządzaj własnymi stawkami, śledź przejechany dystans w milach lub kilometrach oraz ustaw domyślne kategorie dla wydatków odległościowych.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Stawki za dystans są dostępne w planie Collect, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            auditor: {
                title: 'Audytor',
                description: 'Rewidenci otrzymują dostęp tylko do odczytu do wszystkich raportów, zapewniając pełną przejrzystość i monitorowanie zgodności.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Audytorzy są dostępni tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Wiele poziomów zatwierdzania',
                description:
                    'Wiele poziomów zatwierdzania to narzędzie do obsługi procesów dla firm, które wymagają, aby więcej niż jedna osoba zatwierdziła raport, zanim zostanie on rozliczony.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Wiele poziomów akceptacji jest dostępnych tylko w planie Control, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'na aktywnego członka na miesiąc.',
                perMember: 'za członka miesięcznie.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Zaktualizuj plan, aby uzyskać dostęp do tej funkcji, lub <a href="${subscriptionLink}">dowiedz się więcej</a> o naszych planach i cenach.</muted-text>`,
            upgradeToUnlock: 'Odblokuj tę funkcję',
            completed: {
                headline: `Zaktualizowano Twoją przestrzeń roboczą!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Udało Ci się uaktualnić ${policyName} do planu Control! <a href="${subscriptionLink}">Zobacz swoją subskrypcję</a>, aby poznać więcej szczegółów.</centered-text>`,
                categorizeMessage: `Pomyślnie uaktualniono do planu Collect. Teraz możesz kategoryzować swoje wydatki!`,
                travelMessage: `Pomyślnie uaktualniono do planu Collect. Teraz możesz zacząć rezerwować i zarządzać podróżami!`,
                distanceRateMessage: `Pomyślnie uaktualniono do planu Collect. Teraz możesz zmienić stawkę za przejazd!`,
                gotIt: 'Jasne, dzięki',
                createdWorkspace: `Utworzono miejsce pracy!`,
            },
            commonFeatures: {
                title: 'Przejdź na plan Control',
                note: 'Odblokuj nasze najbardziej zaawansowane funkcje, w tym:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Plan Control zaczyna się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka miesięcznie.` : `na aktywnego członka na miesiąc.`} <a href="${learnMoreMethodsRoute}">Dowiedz się więcej</a> o naszych planach i cenach.</muted-text>`,
                    benefit1: 'Zaawansowane połączenia księgowe (NetSuite, Sage Intacct i inne)',
                    benefit2: 'Inteligentne reguły wydatków',
                    benefit3: 'Wielopoziomowe procesy zatwierdzania',
                    benefit4: 'Zaawansowane zabezpieczenia',
                    toUpgrade: 'Aby zaktualizować, kliknij',
                    selectWorkspace: 'wybierz przestrzeń roboczą i zmień typ planu na',
                },
                upgradeWorkspaceWarning: `Nie można zaktualizować przestrzeni roboczej`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: 'Twoja firma ograniczyła tworzenie przestrzeni roboczych. Skontaktuj się z administratorem, aby uzyskać pomoc.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Zmień plan na Collect',
                note: 'Jeśli zmienisz plan na niższy, utracisz dostęp do tych i innych funkcji:',
                benefits: {
                    note: 'Aby zobaczyć pełne porównanie naszych planów, sprawdź nasze',
                    pricingPage: 'strona cennika',
                    confirm: 'Czy na pewno chcesz obniżyć plan i usunąć swoje konfiguracje?',
                    warning: 'Tego nie można cofnąć.',
                    benefit1: 'Połączenia księgowe (z wyjątkiem QuickBooks Online i Xero)',
                    benefit2: 'Inteligentne reguły wydatków',
                    benefit3: 'Wielopoziomowe procesy zatwierdzania',
                    benefit4: 'Zaawansowane zabezpieczenia',
                    headsUp: 'Uwaga!',
                    multiWorkspaceNote: 'Musisz zdegradować wszystkie swoje przestrzenie robocze przed pierwszą miesięczną płatnością, aby rozpocząć subskrypcję w taryfie Collect. Kliknij',
                    selectStep: '> wybierz każdą przestrzeń roboczą > zmień typ planu na',
                },
            },
            completed: {
                headline: 'Twoje środowisko pracy zostało obniżone do niższego planu',
                description: 'Masz inne przestrzenie robocze w planie Control. Aby być rozliczanym według stawki Collect, musisz obniżyć plan wszystkich przestrzeni roboczych.',
                gotIt: 'Jasne, dzięki',
            },
        },
        payAndDowngrade: {
            title: 'Zapłać i obniż plan',
            headline: 'Twoja ostatnia płatność',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Twój ostatni rachunek za tę subskrypcję wyniesie <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Zobacz swój podział poniżej dla ${date}:`,
            subscription:
                'Uwaga! Ta akcja zakończy Twoją subskrypcję Expensify, usunie tę przestrzeń roboczą i usunie wszystkich jej członków. Jeśli chcesz zachować tę przestrzeń roboczą i usunąć tylko siebie, poproś innego administratora, aby najpierw przejął rozliczenia.',
            genericFailureMessage: 'Wystąpił błąd podczas opłacania rachunku. Spróbuj ponownie.',
        },
        restrictedAction: {
            restricted: 'Ograniczone',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Działania w przestrzeni roboczej ${workspaceName} są obecnie ograniczone`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Właściciel przestrzeni roboczej, ${workspaceOwnerName}, musi dodać lub zaktualizować zapisaną kartę płatniczą, aby odblokować nową aktywność w przestrzeni roboczej.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Aby odblokować nowe działania w przestrzeni roboczej, musisz dodać lub zaktualizować zapisany w systemie numer karty płatniczej.',
            addPaymentCardToUnlock: 'Dodaj kartę płatniczą, aby odblokować!',
            addPaymentCardToContinueUsingWorkspace: 'Dodaj kartę płatniczą, aby kontynuować korzystanie z tego obszaru roboczego',
            pleaseReachOutToYourWorkspaceAdmin: 'W razie pytań skontaktuj się z administratorem swojego przestrzeni roboczej.',
            chatWithYourAdmin: 'Porozmawiaj z administratorem',
            chatInAdmins: 'Czat na kanale #admins',
            addPaymentCard: 'Dodaj kartę płatniczą',
            goToSubscription: 'Przejdź do subskrypcji',
        },
        rules: {
            individualExpenseRules: {
                title: 'Wydatki',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Ustaw limity wydatków i domyślne ustawienia dla poszczególnych wydatków. Możesz też tworzyć reguły dla <a href="${categoriesPageLink}">kategorii</a> i <a href="${tagsPageLink}">tagów</a>.</muted-text>`,
                receiptRequiredAmount: 'Wymagana kwota paragonu',
                receiptRequiredAmountDescription: 'Wymagaj paragonów, gdy wydatki przekraczają tę kwotę, chyba że zastąpi to reguła kategorii.',
                maxExpenseAmount: 'Maksymalna kwota wydatku',
                maxExpenseAmountDescription: 'Oznacz wydatki przekraczające tę kwotę, chyba że nadpisze to reguła kategorii.',
                maxAge: 'Maksymalny wiek',
                maxExpenseAge: 'Maksymalny wiek wydatku',
                maxExpenseAgeDescription: 'Oznacz wydatki starsze niż określona liczba dni.',
                maxExpenseAgeDays: () => ({
                    one: '1 dzień',
                    other: (count: number) => `${count} dni`,
                }),
                cashExpenseDefault: 'Domyślny wydatek gotówkowy',
                cashExpenseDefaultDescription:
                    'Wybierz, w jaki sposób mają być tworzone wydatki gotówkowe. Wydatek jest uznawany za gotówkowy, jeśli nie jest zaimportowaną transakcją z firmowej karty. Dotyczy to ręcznie tworzonych wydatków, paragonów, diet, wydatków za przejechany dystans oraz wydatków za czas.',
                reimbursableDefault: 'Podlegające zwrotowi',
                reimbursableDefaultDescription: 'Wydatki najczęściej są zwracane pracownikom',
                nonReimbursableDefault: 'Nierefundowane',
                nonReimbursableDefaultDescription: 'Wydatki są czasami zwracane pracownikom',
                alwaysReimbursable: 'Zawsze refundowane',
                alwaysReimbursableDescription: 'Wydatki są zawsze zwracane pracownikom',
                alwaysNonReimbursable: 'Zawsze bez zwrotu kosztów',
                alwaysNonReimbursableDescription: 'Wydatki nigdy nie są zwracane pracownikom',
                billableDefault: 'Domyślnie fakturowalne',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Wybierz, czy wydatki gotówkowe i kartą kredytową mają być domyślnie fakturowane. Możliwość fakturowania wydatków jest włączana lub wyłączana w <a href="${tagsPageLink}">tagach</a>.</muted-text>`,
                billable: 'Fakturowalne',
                billableDescription: 'Wydatki są najczęściej refakturowane klientom',
                nonBillable: 'Niefakturowane',
                nonBillableDescription: 'Wydatki są okazjonalnie refakturowane klientom',
                eReceipts: 'e-Paragony',
                eReceiptsHint: `eParagony są tworzone automatycznie [dla większości transakcji kartą kredytową w USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Śledzenie uczestników',
                attendeeTrackingHint: 'Śledź koszt na osobę dla każdego wydatku.',
                prohibitedDefaultDescription:
                    'Oznacz wszystkie paragony, na których pojawia się alkohol, hazard lub inne zabronione pozycje. Wydatki z paragonami zawierającymi te pozycje będą wymagały ręcznego sprawdzenia.',
                prohibitedExpenses: 'Wydatki zabronione',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Dodatkowe opłaty hotelowe',
                gambling: 'Hazard',
                tobacco: 'Tytoń',
                adultEntertainment: 'Rozrywka dla dorosłych',
                requireCompanyCard: 'Wymagaj kart służbowych dla wszystkich zakupów',
                requireCompanyCardDescription: 'Oznacz wszystkie wydatki gotówkowe, w tym wydatki za przejazdy samochodem i diety.',
            },
            expenseReportRules: {
                title: 'Zaawansowane',
                subtitle: 'Zautomatyzuj zgodność raportów wydatków, akceptacje i płatności.',
                preventSelfApprovalsTitle: 'Zablokuj samodzielne zatwierdzanie',
                preventSelfApprovalsSubtitle: 'Zapobiegaj zatwierdzaniu własnych raportów wydatków przez członków przestrzeni roboczej.',
                autoApproveCompliantReportsTitle: 'Automatycznie zatwierdzaj zgodne raporty',
                autoApproveCompliantReportsSubtitle: 'Skonfiguruj, które raporty wydatków kwalifikują się do automatycznego zatwierdzania.',
                autoApproveReportsUnderTitle: 'Automatycznie zatwierdzaj raporty poniżej',
                autoApproveReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty będą automatycznie zatwierdzane.',
                randomReportAuditTitle: 'Losowa kontrola raportu',
                randomReportAuditDescription: 'Wymagaj ręcznego zatwierdzania niektórych raportów, nawet jeśli kwalifikują się do automatycznego zatwierdzenia.',
                autoPayApprovedReportsTitle: 'Automatycznie opłacaj zatwierdzone raporty',
                autoPayApprovedReportsSubtitle: 'Skonfiguruj, które raporty wydatków kwalifikują się do automatycznej płatności.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Wprowadź kwotę mniejszą niż ${currency ?? ''}20 000`,
                autoPayApprovedReportsLockedSubtitle: 'Przejdź do „Więcej funkcji” i włącz „Przepływy pracy”, a następnie dodaj „Płatności”, aby odblokować tę funkcję.',
                autoPayReportsUnderTitle: 'Automatycznie opłacaj raporty w ramach',
                autoPayReportsUnderDescription: 'W pełni zgodne raporty wydatków do tej kwoty będą opłacane automatycznie.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Dodaj ${featureName}, aby odblokować tę funkcję.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Przejdź do [więcej funkcji](${moreFeaturesLink}) i włącz ${featureName}, aby odblokować tę funkcję.`,
            },
            categoryRules: {
                title: 'Reguły kategorii',
                approver: 'Osoba zatwierdzająca',
                requireDescription: 'Opis jest wymagany',
                requireFields: 'Wymagaj pól',
                requiredFieldsTitle: 'Pola wymagane',
                requiredFieldsDescription: (categoryName: string) => `Zostanie to zastosowane do wszystkich wydatków sklasyfikowanych jako <strong>${categoryName}</strong>.`,
                requireAttendees: 'Wymagaj uczestników',
                descriptionHint: 'Podpowiedź opisu',
                descriptionHintDescription: (categoryName: string) =>
                    `Przypominaj pracownikom o podaniu dodatkowych informacji dla wydatków w kategorii „${categoryName}”. Ta podpowiedź pojawi się w polu opisu przy wydatkach.`,
                descriptionHintLabel: 'Podpowiedź',
                descriptionHintSubtitle: 'Wskazówka: im krócej, tym lepiej!',
                maxAmount: 'Maksymalna kwota',
                flagAmountsOver: 'Oznaczaj kwoty powyżej',
                flagAmountsOverDescription: (categoryName: string) => `Dotyczy kategorii „${categoryName}”.`,
                flagAmountsOverSubtitle: 'To zastępuje maksymalną kwotę dla wszystkich wydatków.',
                expenseLimitTypes: {
                    expense: 'Pojedynczy wydatek',
                    expenseSubtitle: 'Oznaczaj kwoty wydatków według kategorii. Ta reguła zastępuje ogólną regułę obszaru roboczego dotyczącą maksymalnej kwoty wydatku.',
                    daily: 'Suma kategorii',
                    dailySubtitle: 'Oznaczaj łączny dzienny wydatek według kategorii dla każdego raportu wydatków.',
                },
                requireReceiptsOver: 'Wymagaj paragonów powyżej',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Domyślne`,
                    never: 'Nigdy nie wymagaj paragonów',
                    always: 'Zawsze wymagaj paragonów',
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
                    label: 'Zbieraj',
                    description: 'Dla zespołów, które chcą zautomatyzować swoje procesy.',
                },
                corporate: {
                    label: 'Kontrola',
                    description: 'Dla organizacji z zaawansowanymi wymaganiami.',
                },
            },
            description: 'Wybierz plan odpowiedni dla siebie. Aby zapoznać się ze szczegółową listą funkcji i cen, odwiedź naszą',
            subscriptionLink: 'strona pomocy dotycząca rodzajów planów i cen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Zobowiązałeś(-aś) się do 1 aktywnego członka w planie Control do końca rocznej subskrypcji, czyli do ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję płatną za użycie i zmienić plan na Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
                other: `Zobowiązałeś(-aś) się do ${count} aktywnych członków w planie Control do końca swojej rocznej subskrypcji dnia ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję płatną za użycie i zmienić plan na Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
            }),
            subscriptions: 'Subskrypcje',
        },
    },
    getAssistancePage: {
        title: 'Uzyskaj pomoc',
        subtitle: 'Jesteśmy tu, by torować Ci drogę do wielkości!',
        description: 'Wybierz jedną z poniższych opcji wsparcia:',
        chatWithConcierge: 'Czat z Concierge',
        scheduleSetupCall: 'Umów rozmowę konfiguracyjną',
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
        restrictedDescription: 'Osoby w Twoim obszarze roboczym mogą znaleźć ten pokój',
        privateDescription: 'Osoby zaproszone do tego pokoju mogą go znaleźć',
        publicDescription: 'Każdy może znaleźć ten pokój',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Każdy może znaleźć ten pokój',
        createRoom: 'Utwórz pokój',
        roomAlreadyExistsError: 'Pokój o tej nazwie już istnieje',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} jest domyślnym pokojem we wszystkich przestrzeniach roboczych. Wybierz inną nazwę.`,
        roomNameInvalidError: 'Nazwy pokojów mogą zawierać tylko małe litery, cyfry i myślniki',
        pleaseEnterRoomName: 'Wpisz nazwę pokoju',
        pleaseSelectWorkspace: 'Wybierz przestrzeń roboczą',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}zmienił nazwę na „${newName}” (wcześniej „${oldName}”)` : `${actor}zmienił nazwę tego pokoju na „${newName}” (wcześniej „${oldName}”)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Pokój zmienił nazwę na ${newName}`,
        social: 'społecznościowe',
        selectAWorkspace: 'Wybierz przestrzeń roboczą',
        growlMessageOnRenameError: 'Nie można zmienić nazwy pokoju w przestrzeni roboczej. Sprawdź swoje połączenie i spróbuj ponownie.',
        visibilityOptions: {
            restricted: 'Przestrzeń robocza', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Prywatne',
            public: 'Public',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Publiczne ogłoszenie',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Wyślij i zamknij',
        submitAndApprove: 'Wyślij i zatwierdź',
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
            previousAddress ? `zmienił(-a) adres firmy na „${newAddress}” (wcześniej „${previousAddress}”)` : `ustaw adres firmy na „${newAddress}”`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `dodano ${approverName} (${approverEmail}) jako osobę zatwierdzającą dla pola ${field} „${name}”`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `usunięto ${approverName} (${approverEmail}) jako osobę zatwierdzającą dla pola ${field} „${name}”`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `zmieniono osobę zatwierdzającą dla pola ${field} „${name}” na ${formatApprover(newApproverName, newApproverEmail)} (wcześniej ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `dodano kategorię „${categoryName}”`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `usunięto kategorię „${categoryName}”`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'wyłączone' : 'włączone'} kategorię „${categoryName}”`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodano kod płacowy „${newValue}” do kategorii „${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `usunął(-ę) kod płacowy „${oldValue}” z kategorii „${categoryName}”`;
            }
            return `zmienił(-a) kod listy płac kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodano kod GL „${newValue}” do kategorii „${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `usunął(-ę) kod GL „${oldValue}” z kategorii „${categoryName}”`;
            }
            return `zmieniono kod GL kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `zmienił(a) opis kategorii „${categoryName}” na ${!oldValue ? 'wymagane' : 'niewymagane'} (poprzednio ${!oldValue ? 'niewymagane' : 'wymagane'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `dodano maksymalną kwotę ${newAmount} do kategorii „${categoryName}”`;
            }
            if (oldAmount && !newAmount) {
                return `usunął limit maksymalnej kwoty ${oldAmount} z kategorii „${categoryName}”`;
            }
            return `zmienił(a) maksymalną kwotę dla kategorii „${categoryName}” na ${newAmount} (wcześniej ${oldAmount})`;
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
            return `zmienił kategorię „${categoryName}” na ${newValue} (wcześniej ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmienił(a) nazwę kategorii „${oldName}” na „${newName}”`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `usunięto podpowiedź opisu „${oldValue}” z kategorii „${categoryName}”`;
            }
            return !oldValue
                ? `dodano podpowiedź opisu „${newValue}” do kategorii „${categoryName}”`
                : `zmienił(a) podpowiedź opisu kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmienił nazwę listy tagów na „${newName}” (wcześniej „${oldName}”)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `dodano znacznik „${tagName}” do listy „${tagListName}”`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `zaktualizowano listę tagów „${tagListName}”, zmieniając tag „${oldName}” na „${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'włączone' : 'wyłączone'} tag „${tagName}” na liście „${tagListName}”`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `usunięto znacznik „${tagName}” z listy „${tagListName}”`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `usunięto „${count}” tagów z listy „${tagListName}”`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `zaktualizowano znacznik „${tagName}” na liście „${tagListName}”, zmieniając ${updatedField} na „${newValue}” (poprzednio „${oldValue}”)`;
            }
            return `zaktualizowano tag „${tagName}” na liście „${tagListName}” przez dodanie ${updatedField} o wartości „${newValue}”`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `zmieniono ${updatedField} jednostki ${customUnitName} na „${newValue}” (poprzednio „${oldValue}”)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'włączone' : 'wyłączone'} śledzenie podatku przy stawkach za dystans`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `dodano nową stawkę „${rateName}” dla jednostki „${customUnitName}”`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `zmienił(a) stawkę ${customUnitName} ${updatedField} „${customUnitRateName}” na „${newValue}” (wcześniej „${oldValue}”)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `zmienił(a) stawkę podatku dla stawki za dystans „${customUnitRateName}” na „${newValue} (${newTaxPercentage})” (wcześniej „${oldValue} (${oldTaxPercentage})”)`;
            }
            return `dodano stawkę podatku „${newValue} (${newTaxPercentage})” do stawki za dystans „${customUnitRateName}”`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `zmienił(a) zwrotną podatkowo część stawki za odległość „${customUnitRateName}” na „${newValue}” (wcześniej „${oldValue}”)`;
            }
            return `dodano zwrotną podatkowo część „${newValue}” do stawki za dystans „${customUnitRateName}`;
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
            `${optionEnabled ? 'włączone' : 'wyłączone'} opcja „${optionName}” dla pola raportu „${fieldName}”`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'włączone' : 'wyłączone'} wszystkie opcje dla pola raportu „${fieldName}”`;
            }
            return `${allEnabled ? 'włączone' : 'wyłączone'} opcję „${optionName}” dla pola raportu „${fieldName}”, ustawiając wszystkie opcje jako ${allEnabled ? 'włączone' : 'wyłączone'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `usunięto pole raportu ${fieldType} „${fieldName}”`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `zaktualizowano „Prevent self-approval” na „${newValue === 'true' ? 'Włączone' : 'Wyłączone'}” (wcześniej „${oldValue === 'true' ? 'Włączone' : 'Wyłączone'}”)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `ustaw miesięczną datę wysyłki raportu na „${newValue}”`;
            }
            return `zaktualizowano termin składania miesięcznego raportu na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano „Refakturowanie wydatków klientom” na „${newValue}” (wcześniej „${oldValue}”)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano „Domyślny wydatek gotówkowy” na „${newValue}” (wcześniej „${oldValue}”)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `włączył(a) „Wymuszaj domyślne tytuły raportów” ${value ? 'włączone' : 'wyłączone'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zmienił(a) formułę nazwy raportu niestandardowego na „${newValue}” (wcześniej „${oldValue}”)`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `zaktualizowano nazwę tego workspace na „${newName}” (wcześniej „${oldName}”)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `ustaw opis tego przestrzeni roboczej na „${newDescription}”`
                : `zaktualizowano opis tego obszaru roboczego na „${newDescription}” (wcześniej „${oldDescription}”)`,
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
                one: `usunął(-nęła) Cię z procesu zatwierdzania i czatu wydatków użytkownika ${joinedNames}. Wcześniej przesłane raporty pozostaną dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
                other: `usunął(-nęła) Cię z procesów akceptacji i czatów dotyczących wydatków użytkownika ${joinedNames}. Wcześniej przesłane raporty nadal będą dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `zaktualizował(-a) Twoją rolę w ${policyName} z ${oldRole} na użytkownika. Zostałeś(-aś) usunięty(-a) ze wszystkich czatów wydatków przesyłających, z wyjątkiem własnych.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `zaktualizował(a) domyślną walutę na ${newCurrency} (wcześniej ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `zaktualizowano częstotliwość automatycznego raportowania na „${newFrequency}” (wcześniej „${oldFrequency}”)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `zaktualizowano tryb zatwierdzania na „${newValue}” (wcześniej „${oldValue}”)`,
        upgradedWorkspace: 'ulepszył(-a) tę przestrzeń roboczą do planu Control',
        forcedCorporateUpgrade: `Toje środowisko pracy zostało zaktualizowane do planu Control. Kliknij <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">tutaj</a>, aby uzyskać więcej informacji.`,
        downgradedWorkspace: 'zmienił/-a ten workspace na plan Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `zmienił(a) odsetek raportów losowo kierowanych do ręcznego zatwierdzenia na ${Math.round(newAuditRate * 100)}% (wcześniej ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `zmienił(a) ręczny limit zatwierdzania wszystkich wydatków na ${newLimit} (wcześniej ${oldLimit})`,
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
                    return `${enabled ? 'włączone' : 'wyłączone'} karty firmowe`;
                case 'invoicing':
                    return `Fakturowanie ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'per diem':
                    return `${enabled ? 'włączone' : 'wyłączone'} dzienna dieta`;
                case 'receipt partners':
                    return `partnerzy paragonów ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'rules':
                    return `${enabled ? 'włączone' : 'wyłączone'} reguł`;
                case 'tax tracking':
                    return `Śledzenie podatku ${enabled ? 'włączone' : 'wyłączone'}`;
                default:
                    return `${enabled ? 'włączone' : 'wyłączone'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `śledzenie uczestników ${enabled ? 'włączone' : 'wyłączone'}`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `zmienił(a) domyślnego akceptującego na ${newApprover} (wcześniej ${previousApprover})` : `zmieniono domyślnego akceptującego na ${newApprover}`,
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
                text += `(uprzednio domyślny zatwierdzający ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(poprzednio domyślny zatwierdzający)';
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
                ? `zmienił(a) proces zatwierdzania dla ${members}, aby przesyłali raporty do domyślnego akceptującego ${approver}`
                : `zmienił(a) proces zatwierdzania dla ${members}, aby wysyłali raporty do domyślnej osoby zatwierdzającej`;
            if (wasDefaultApprover && previousApprover) {
                text += `(uprzednio domyślny zatwierdzający ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(poprzednio domyślny zatwierdzający)';
            } else if (previousApprover) {
                text += `(wcześniej ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `zmienił(a) proces zatwierdzania dla ${approver}, aby przekazywać zatwierdzone raporty do ${forwardsTo} (wcześniej przekazywane do ${previousForwardsTo})`
                : `zmienił obieg akceptacji dla ${approver}, aby przekazywać zatwierdzone raporty do ${forwardsTo} (wcześniej ostatecznie zatwierdzone raporty)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `zmienił(a) proces zatwierdzania dla ${approver}, aby przestał przekazywać zatwierdzone raporty (wcześniej przekazywane do ${previousForwardsTo})`
                : `zmienił(a) proces zatwierdzania dla ${approver}, aby przestał przekazywać zatwierdzone raporty`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `zmieniono nazwę firmy na fakturze na „${newValue}” (wcześniej „${oldValue}”)` : `ustaw nazwę firmy na fakturze na „${newValue}”`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `zmienił(a) firmową stronę internetową faktury na „${newValue}” (wcześniej „${oldValue}”)` : `ustawiono firmową stronę internetową faktury na „${newValue}”`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser ? `zmienił(a) upoważnionego płatnika na „${newReimburser}” (wcześniej „${previousReimburser}”)` : `zmienił(a) upoważnionego płatnika na „${newReimburser}”`,
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
        useInviteButton: 'Aby zaprosić nowego członka do czatu, skorzystaj z przycisku zaproszenia powyżej.',
        notAuthorized: `Nie masz dostępu do tej strony. Jeśli próbujesz dołączyć do tego pokoju, poproś członka pokoju, aby cię dodał. Coś innego? Skontaktuj się z ${CONST.EMAIL.CONCIERGE}`,
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
        confirmError: 'Wprowadź tytuł i wybierz miejsce udostępniania',
        descriptionOptional: 'Opis (opcjonalnie)',
        pleaseEnterTaskName: 'Wprowadź tytuł',
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
            canceled: 'usunięto zadanie',
            reopened: 'oznaczono jako niekompletne',
            error: 'Nie masz uprawnień do wykonania żądanej akcji',
        },
        markAsComplete: 'Oznacz jako ukończone',
        markAsIncomplete: 'Oznacz jako nieukończone',
        assigneeError: 'Wystąpił błąd podczas przypisywania tego zadania. Spróbuj przypisać je do innej osoby.',
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
                title: 'Nic do wyświetlenia',
                subtitle: `Spróbuj zmienić kryteria wyszukiwania lub utwórz coś za pomocą przycisku +.`,
            },
            emptyExpenseResults: {
                title: 'Nie utworzyłeś(-aś) jeszcze żadnych wydatków',
                subtitle: 'Utwórz wydatek lub wypróbuj Expensify w trybie testowym, aby dowiedzieć się więcej.',
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
                subtitle: 'Wyślij fakturę lub przetestuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby wysłać fakturę.',
            },
            emptyTripResults: {
                title: 'Brak podróży do wyświetlenia',
                subtitle: 'Zacznij od zarezerwowania swojej pierwszej podróży poniżej.',
                buttonText: 'Zarezerwuj podróż',
            },
            emptySubmitResults: {
                title: 'Brak wydatków do wysłania',
                subtitle: 'Wszystko gotowe. Świętuj swój sukces!',
                buttonText: 'Utwórz raport',
            },
            emptyApproveResults: {
                title: 'Brak wydatków do zatwierdzenia',
                subtitle: 'Zero wydatków. Maksimum luzu. Dobra robota!',
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
                subtitle: 'Zero wydatków. Maksimum luzu. Dobra robota!',
            },
        },
        columns: 'Kolumny',
        resetColumns: 'Zresetuj kolumny',
        groupColumns: 'Grupuj kolumny',
        expenseColumns: 'Kolumny wydatków',
        statements: 'Wyciągi',
        unapprovedCash: 'Niezatwierdzona gotówka',
        unapprovedCard: 'Niezatwierdzona karta',
        reconciliation: 'Uzgodnienie',
        topSpenders: 'Najwięksi wydający',
        saveSearch: 'Zapisz wyszukiwanie',
        deleteSavedSearch: 'Usuń zapisaną wyszukiwarkę',
        deleteSavedSearchConfirm: 'Czy na pewno chcesz usunąć to wyszukiwanie?',
        searchName: 'Wyszukaj nazwę',
        savedSearchesMenuItemTitle: 'Zapisano',
        groupedExpenses: 'zgrupowane wydatki',
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
                on: (date?: string) => `W dniu ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nigdy',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'W zeszłym miesiącu',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'W tym miesiącu',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Ostatnie zestawienie',
                },
            },
            status: 'Status',
            keyword: 'Słowo kluczowe',
            keywords: 'Słowa kluczowe',
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
                individualCards: 'Karty indywidualne',
                closedCards: 'Zamknięte karty',
                cardFeeds: 'Źródła kart',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Wszystkie ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Wszystkie zaimportowane karty CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} jest ${value}`,
            current: 'Bieżące',
            past: 'Przeszłe',
            submitted: 'Przesłano',
            approved: 'Zatwierdzone',
            paid: 'Zapłacono',
            exported: 'Wyeksportowano',
            posted: 'Zaksięgowano',
            withdrawn: 'Wycofano',
            billable: 'Fakturowalne',
            reimbursable: 'Podlegające zwrotowi',
            purchaseCurrency: 'Waluta zakupu',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'Od',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Karta',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'ID wypłaty',
            },
            feed: 'Kanał',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Karta Expensify',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Zwrot kosztów',
            },
            is: 'Jest',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Prześlij',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Zatwierdź',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Zapłać',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Eksportuj',
            },
        },
        has: 'Ma',
        groupBy: 'Grupuj według',
        moneyRequestReport: {
            emptyStateTitle: 'Ten raport nie zawiera żadnych wydatków.',
            accessPlaceHolder: 'Otwórz, aby zobaczyć szczegóły',
        },
        noCategory: 'Brak kategorii',
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
            description: 'Wow, sporo pozycji! Spakujemy je, a Concierge wkrótce wyśle Ci plik.',
        },
        exportedTo: 'Wyeksportowano do',
        exportAll: {
            selectAllMatchingItems: 'Zaznacz wszystkie pasujące elementy',
            allMatchingItemsSelected: 'Wybrano wszystkie pasujące pozycje',
        },
    },
    genericErrorPage: {
        title: 'Ups, coś poszło nie tak!',
        body: {
            helpTextMobile: 'Zamknij i ponownie otwórz aplikację lub przełącz się na',
            helpTextWeb: 'strona internetowa.',
            helpTextConcierge: 'Jeśli problem będzie się powtarzał, skontaktuj się z',
        },
        refresh: 'Odśwież',
    },
    fileDownload: {
        success: {
            title: 'Pobrano!',
            message: 'Załącznik został pobrany pomyślnie!',
            qrMessage:
                'Sprawdź folder ze zdjęciami lub folder pobranych plików, aby znaleźć kopię swojego kodu QR. Wskazówka: Dodaj go do prezentacji, aby odbiorcy mogli go zeskanować i połączyć się z Tobą bezpośrednio.',
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
            cleared: 'Wyczyść',
            failed: 'Niepowodzenie',
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
                `Czy na pewno chcesz utworzyć kolejny raport w ${workspaceName}? Możesz uzyskać dostęp do swoich pustych raportów w`,
            emptyReportConfirmationPromptLink: 'Raporty',
            emptyReportConfirmationDontShowAgain: 'Nie pokazuj mi tego ponownie',
            genericWorkspaceName: 'ten workspace',
        },
        genericCreateReportFailureMessage: 'Nieoczekiwany błąd podczas tworzenia tego czatu. Spróbuj ponownie później.',
        genericAddCommentFailureMessage: 'Nieoczekiwany błąd podczas publikowania komentarza. Spróbuj ponownie później.',
        genericUpdateReportFieldFailureMessage: 'Niespodziewany błąd podczas aktualizowania pola. Spróbuj ponownie później.',
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
                    return `zmieniono przestrzeń roboczą na ${toPolicyName}${fromPolicyName ? `(wcześniej ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `zmienił(a) typ z ${oldType} na ${newType}`,
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
                    automaticActionThree: 'i pomyślnie utworzył(-a) rekord dla',
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
                reimbursementACHBounce: `nie można było przetworzyć płatności z powodu problemu z kontem bankowym`,
                reimbursementACHCancelled: `anulowano płatność`,
                reimbursementAccountChanged: `nie udało się przetworzyć płatności, ponieważ płatnik zmienił konto bankowe`,
                reimbursementDelayed: `przetworzono płatność, ale jest opóźniona o kolejne 1–2 dni robocze`,
                selectedForRandomAudit: `losowo wybrany do weryfikacji`,
                selectedForRandomAuditMarkdown: `wybrane losowo do sprawdzenia`,
                share: ({to}: ShareParams) => `zaproszono członka ${to}`,
                unshare: ({to}: UnshareParams) => `usunięto członka ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `zapłacono ${currency}${amount}`,
                takeControl: `przejął kontrolę`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `wystąpił problem z synchronizacją z ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Napraw problem w <a href="${workspaceAccountingLink}">ustawieniach przestrzeni roboczej</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `Połączenie ${feedName} jest zerwane. Aby przywrócić importy kart, <a href='${workspaceCompanyCardRoute}'>zaloguj się do swojego banku</a>`,
                addEmployee: (email: string, role: string) => `dodano ${email} jako ${role === 'member' ? 'a' : 'an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `zaktualizował(a) rolę użytkownika ${email} na ${newRole} (poprzednio ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usunięto pole niestandardowe 1 użytkownika ${email} (wcześniej „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `dodano „${newValue}” do pola niestandardowego 1 użytkownika ${email}`
                        : `zmienił(a) pole niestandardowe 1 użytkownika ${email} na „${newValue}” (wcześniej „${previousValue}”)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usunięto pole niestandardowe 2 użytkownika ${email} (wcześniej „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `dodano „${newValue}” do pola niestandardowego 2 użytkownika ${email}`
                        : `zmienił niestandardowe pole 2 użytkownika ${email} na „${newValue}” (poprzednio „${previousValue}”)`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} opuścił(a) przestrzeń roboczą`,
                removeMember: (email: string, role: string) => `usunięto ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `usunięto połączenie z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `połączono z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'opuścił(a) czat',
            },
            error: {
                invalidCredentials: 'Nieprawidłowe dane uwierzytelniające, sprawdź konfigurację swojego połączenia.',
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
        expensifyApproved: 'Zatwierdzone przez Expensify!',
        pressKit: 'Zestaw prasowy',
        support: 'Pomoc',
        expensifyHelp: 'ExpensifyPomoc',
        terms: 'Warunki korzystania z usługi',
        privacy: 'Prywatność',
        learnMore: 'Dowiedz się więcej',
        aboutExpensify: 'O Expensify',
        blog: 'Blog',
        jobs: 'Zlecenia',
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
        reversedTransaction: 'Transakcja odwrócona',
        deletedTask: 'Usunięto zadanie',
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
        flagDescription: 'Wszystkie oflagowane wiadomości zostaną wysłane do moderatora do weryfikacji.',
        chooseAReason: 'Wybierz powód zgłoszenia poniżej:',
        spam: 'Spam',
        spamDescription: 'Niechciana, nie na temat promocja',
        inconsiderate: 'Nieuprzejmy',
        inconsiderateDescription: 'Obraźliwe lub lekceważące sformułowania o wątpliwych intencjach',
        intimidation: 'Zastraszanie',
        intimidationDescription: 'Agresywne forsowanie agendy pomimo uzasadnionych zastrzeżeń',
        bullying: 'Nękanie',
        bullyingDescription: 'Celowanie w daną osobę, aby wymusić posłuszeństwo',
        harassment: 'Nękanie',
        harassmentDescription: 'Rasistowskie, mizoginistyczne lub inne szeroko rozumiane dyskryminujące zachowania',
        assault: 'Napaść',
        assaultDescription: 'Celowo ukierunkowany atak emocjonalny z zamiarem wyrządzenia szkody',
        flaggedContent: 'Ta wiadomość została oznaczona jako naruszająca nasze zasady społeczności, a jej treść została ukryta.',
        hideMessage: 'Ukryj wiadomość',
        revealMessage: 'Odsłoń wiadomość',
        levelOneResult: 'Wysyła anonimowe ostrzeżenie, a wiadomość zostaje zgłoszona do sprawdzenia.',
        levelTwoResult: 'Wiadomość ukryta na kanale, dodatkowo wysłano anonimowe ostrzeżenie i zgłoszono ją do recenzji.',
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
        submit: 'Prześlij to do kogoś',
        categorize: 'Skategoryzuj to',
        share: 'Udostępnij to mojemu księgowemu',
        nothing: 'Na razie nic',
    },
    teachersUnitePage: {
        teachersUnite: 'Nauczyciele razem',
        joinExpensifyOrg:
            'Dołącz do Expensify.org w eliminowaniu niesprawiedliwości na całym świecie. Obecna kampania „Teachers Unite” wspiera nauczycieli wszędzie, dzieląc koszty niezbędnych materiałów szkolnych.',
        iKnowATeacher: 'Znam nauczyciela',
        iAmATeacher: 'Jestem nauczycielem',
        getInTouch: 'Świetnie! Podaj ich dane kontaktowe, abyśmy mogli się z nimi skontaktować.',
        introSchoolPrincipal: 'Wprowadzenie do dyrektora szkoły',
        schoolPrincipalVerifyExpense:
            'Expensify.org dzieli koszt podstawowych przyborów szkolnych, aby uczniowie z gospodarstw domowych o niskich dochodach mogli mieć lepsze warunki do nauki. Twoje wydatki zostaną przekazane do weryfikacji dyrektorowi szkoły.',
        principalFirstName: 'Imię głównej osoby',
        principalLastName: 'Nazwisko właściciela',
        principalWorkEmail: 'Główny służbowy e-mail',
        updateYourEmail: 'Zaktualizuj swój adres e‑mail',
        updateEmail: 'Zaktualizuj adres e-mail',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Zanim przejdziesz dalej, upewnij się, że ustawiłeś(-aś) swój szkolny adres e-mail jako domyślną metodę kontaktu. Możesz to zrobić w Ustawieniach > Profil > <a href="${contactMethodsRoute}">Metody kontaktu</a>.`,
        error: {
            enterPhoneEmail: 'Wprowadź prawidłowy adres e-mail lub numer telefonu',
            enterEmail: 'Wpisz email',
            enterValidEmail: 'Wprowadź prawidłowy adres e-mail',
            tryDifferentEmail: 'Spróbuj użyć innego adresu e-mail',
        },
    },
    cardTransactions: {
        notActivated: 'Niesaktywowane',
        outOfPocket: 'Wydatki z własnej kieszeni',
        companySpend: 'Wydatki firmowe',
    },
    distance: {
        addStop: 'Dodaj przystanek',
        deleteWaypoint: 'Usuń punkt trasy',
        deleteWaypointConfirmation: 'Czy na pewno chcesz usunąć ten punkt pośredni?',
        address: 'Adres',
        waypointDescription: {
            start: 'Start',
            stop: 'Zatrzymaj',
        },
        mapPending: {
            title: 'Oczekiwanie na mapowanie',
            subtitle: 'Mapa zostanie wygenerowana, gdy wrócisz do trybu online',
            onlineSubtitle: 'Chwila, konfigurujemy mapę',
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
        tooltip: 'Śledzenie GPS w toku! Gdy skończysz, zatrzymaj śledzenie poniżej.',
        disclaimer: 'Użyj GPS, aby utworzyć wydatek z Twojej podróży. Stuknij przycisk „Start” poniżej, aby rozpocząć śledzenie.',
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
            prompt: 'Na pewno? To zakończy Twoją obecną ścieżkę.',
            cancel: 'Wznów śledzenie',
            confirm: 'Zatrzymaj śledzenie GPS',
        },
        discardDistanceTrackingModal: {
            title: 'Odrzuć śledzenie dystansu',
            prompt: 'Na pewno? Spowoduje to odrzucenie bieżącego procesu i nie będzie można tego cofnąć.',
            confirm: 'Odrzuć śledzenie dystansu',
        },
        zeroDistanceTripModal: {
            title: 'Nie można utworzyć wydatku',
            prompt: 'Nie możesz utworzyć wydatku z takim samym miejscem rozpoczęcia i zakończenia.',
        },
        locationRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji',
            prompt: 'Zezwól na dostęp do lokalizacji w ustawieniach urządzenia, aby rozpocząć śledzenie dystansu GPS.',
            allow: 'Zezwól',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji w tle',
            prompt: 'Aby rozpocząć śledzenie dystansu GPS, zezwól na dostęp do lokalizacji w tle w ustawieniach urządzenia (wybierz opcję „Zawsze zezwalaj”).',
        },
        preciseLocationRequiredModal: {
            title: 'Wymagana dokładna lokalizacja',
            prompt: 'Aby rozpocząć śledzenie dystansu GPS, włącz „dokładną lokalizację” w ustawieniach urządzenia.',
        },
        desktop: {
            title: 'Śledź dystans na swoim telefonie',
            subtitle: 'Automatycznie rejestruj mile lub kilometry za pomocą GPS i natychmiast zmieniaj przejazdy w wydatki.',
            button: 'Pobierz aplikację',
        },
        notification: {
            title: 'Trwa śledzenie GPS',
            body: 'Przejdź do aplikacji, aby zakończyć',
        },
        locationServicesRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji',
            confirm: 'Otwórz ustawienia',
            prompt: 'Zezwól na dostęp do lokalizacji w ustawieniach urządzenia, aby rozpocząć śledzenie dystansu GPS.',
        },
        fabGpsTripExplained: 'Przejdź do ekranu GPS (akcja pływająca)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Raport zaginął lub został uszkodzony',
        nextButtonLabel: 'Dalej',
        reasonTitle: 'Dlaczego potrzebujesz nowej karty?',
        cardDamaged: 'Moja karta została uszkodzona',
        cardLostOrStolen: 'Moja karta została zgubiona lub skradziona',
        confirmAddressTitle: 'Potwierdź adres korespondencyjny dla swojej nowej karty.',
        cardDamagedInfo: 'Twoja nowa karta dotrze w ciągu 2–3 dni roboczych. Obecna karta będzie działać do momentu aktywowania nowej.',
        cardLostOrStolenInfo: 'Twoja obecna karta zostanie trwale dezaktywowana, gdy tylko złożysz zamówienie. Większość kart dociera w ciągu kilku dni roboczych.',
        address: 'Adres',
        deactivateCardButton: 'Dezaktywuj kartę',
        shipNewCardButton: 'Wyślij nową kartę',
        addressError: 'Adres jest wymagany',
        reasonError: 'Powód jest wymagany',
        successTitle: 'Twoja nowa karta jest w drodze!',
        successDescription: 'Będziesz musieć aktywować ją, gdy dotrze za kilka dni roboczych. W międzyczasie możesz korzystać z karty wirtualnej.',
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
            buttonText: 'Zgłoś wydatek, <success><strong>poleć swój zespół</strong></success>.',
            header: 'Zgłoś wydatek, poleć swój zespół',
            body: 'Chcesz, aby Twój zespół też korzystał z Expensify? Po prostu wyślij do nich wydatek, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Poleć znajomego',
            body: 'Chcesz, żeby Twoi znajomi też korzystali z Expensify? Po prostu porozmawiaj z nimi na czacie, zapłać im lub podziel się z nimi wydatkiem, a my zajmiemy się resztą. Albo po prostu udostępnij im swój link zaproszeniowy!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Poleć znajomego',
            header: 'Poleć znajomego',
            body: 'Chcesz, żeby Twoi znajomi też korzystali z Expensify? Po prostu porozmawiaj z nimi na czacie, zapłać im lub podziel się z nimi wydatkiem, a my zajmiemy się resztą. Albo po prostu udostępnij im swój link zaproszeniowy!',
        },
        copyReferralLink: 'Skopiuj link zaproszenia',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Porozmawiaj ze swoim specjalistą ds. konfiguracji w <a href="${href}">${adminReportName}</a>, aby uzyskać pomoc`,
        default: `Napisz do <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>, aby uzyskać pomoc przy konfiguracji`,
    },
    violations: {
        allTagLevelsRequired: 'Wszystkie tagi wymagane',
        autoReportedRejectedExpense: 'Ten wydatek został odrzucony.',
        billableExpense: 'Pozycja rozliczalna nie jest już ważna',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Wymagany paragon${formattedLimit ? `powyżej ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategoria już nieaktualna',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Zastosowano dodatkową opłatę za przewalutowanie w wysokości ${surcharge}%`,
        customUnitOutOfPolicy: 'Stawka nie jest prawidłowa dla tego workspace’u',
        duplicatedTransaction: 'Potencjalny duplikat',
        fieldRequired: 'Pola raportu są wymagane',
        futureDate: 'Przyszła data jest niedozwolona',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Podwyższono o ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data starsza niż ${maxAge} dni`,
        missingCategory: 'Brak kategorii',
        missingComment: 'Wymagany opis dla wybranej kategorii',
        missingAttendees: 'Dla tej kategorii wymaganych jest wielu uczestników',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Brak ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Kwota różni się od obliczonej odległości';
                case 'card':
                    return 'Kwota wyższa niż transakcja kartą';
                default:
                    if (displayPercentVariance) {
                        return `Kwota jest o ${displayPercentVariance}% wyższa niż zeskanowany paragon`;
                    }
                    return 'Kwota większa niż zeskanowany paragon';
            }
        },
        modifiedDate: 'Data różni się od zeskanowanego paragonu',
        nonExpensiworksExpense: 'Wydatek spoza Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Wydatek przekracza automatyczny limit akceptacji w wysokości ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Kwota przekracza limit ${formattedLimit} na osobę w tej kategorii`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekraczająca limit ${formattedLimit}/osobę`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekracza limit ${formattedLimit} na podróż`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekraczająca limit ${formattedLimit}/osobę`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Kwota powyżej dziennego limitu kategorii ${formattedLimit}/osobę`,
        receiptNotSmartScanned: 'Szczegóły paragonu i wydatku dodane ręcznie.',
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
        reviewRequired: 'Wymagana kontrola',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Nie można automatycznie dopasować paragonu z powodu przerwanego połączenia z bankiem';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Połączenie z bankiem zostało zerwane. <a href="${companyCardPageURL}">Połącz ponownie, aby dopasować paragon</a>`
                    : 'Połączenie z bankiem zostało przerwane. Poproś administratora o ponowne połączenie, aby dopasować paragon.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Poproś ${member}, aby oznaczył to jako gotówkę lub poczekaj 7 dni i spróbuj ponownie` : 'Oczekiwanie na połączenie z transakcją z karty.';
            }
            return '';
        },
        brokenConnection530Error: 'Paragon w oczekiwaniu z powodu przerwanego połączenia z bankiem',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Oczekujący paragon z powodu przerwanego połączenia z bankiem. Rozwiąż problem w sekcji <a href="${workspaceCompanyCardRoute}">Karty firmowe</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Paragon oczekuje z powodu zerwanego połączenia z bankiem. Poproś administratora przestrzeni roboczej o rozwiązanie problemu.',
        markAsCashToIgnore: 'Oznacz jako gotówkę, aby pominąć i zażądać płatności.',
        smartscanFailed: ({canEdit = true}) => `Skanowanie paragonu nie powiodło się.${canEdit ? 'Wprowadź szczegóły ręcznie.' : ''}`,
        receiptGeneratedWithAI: 'Potencjalnie wygenerowany przez AI paragon',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Brak ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nie jest już prawidłowy`,
        taxAmountChanged: 'Kwota podatku została zmodyfikowana',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Podatek'} nie jest już ważny`,
        taxRateChanged: 'Zmodyfikowano stawkę podatku',
        taxRequired: 'Brak stawki podatku',
        none: 'Brak',
        taxCodeToKeep: 'Wybierz, który kod podatkowy zachować',
        tagToKeep: 'Wybierz, który znacznik zachować',
        isTransactionReimbursable: 'Wybierz, czy transakcja podlega zwrotowi',
        merchantToKeep: 'Wybierz sprzedawcę, którego chcesz zachować',
        descriptionToKeep: 'Wybierz, który opis zachować',
        categoryToKeep: 'Wybierz, którą kategorię zachować',
        isTransactionBillable: 'Wybierz, czy transakcja jest refakturowalna',
        keepThisOne: 'Zachowaj to',
        confirmDetails: `Potwierdź szczegóły, które zachowujesz`,
        confirmDuplicatesInfo: `Duplikaty, których nie zachowasz, zostaną pozostawione do usunięcia przez osobę, która je przesłała.`,
        hold: 'Ten wydatek został wstrzymany',
        resolvedDuplicates: 'rozwiązano duplikat',
        companyCardRequired: 'Zakup wymagany kartą firmową',
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
        unmute: 'Wyłącz wyciszenie',
        normal: 'Zwykły',
    },
    exitSurvey: {
        header: 'Zanim wyjdziesz',
        reasonPage: {
            title: 'Powiedz nam, dlaczego odchodzisz',
            subtitle: 'Zanim przełączysz się dalej, powiedz nam proszę, dlaczego chcesz przejść na Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Potrzebuję funkcji, która jest dostępna tylko w Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Nie rozumiem, jak korzystać z New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Rozumiem, jak korzystać z Nowego Expensify, ale wolę Expensify Classic.',
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
            'Wygląda na to, że jesteś offline. Niestety Expensify Classic nie działa w trybie offline, ale Nowy Expensify już tak. Jeśli wolisz korzystać z Expensify Classic, spróbuj ponownie, gdy będziesz mieć połączenie z internetem.',
        quickTip: 'Szybka wskazówka...',
        quickTipSubTitle: 'Możesz przejść bezpośrednio do Expensify Classic, odwiedzając stronę expensify.com. Dodaj ją do zakładek, aby mieć łatwy skrót!',
        bookACall: 'Umów rozmowę',
        bookACallTitle: 'Czy chcesz porozmawiać z menedżerem produktu?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Bezpośrednie czatowanie na wydatkach i raportach',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Możliwość robienia wszystkiego na telefonie',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Podróże i wydatki w tempie czatu',
        },
        bookACallTextTop: 'Przechodząc na Expensify Classic, stracisz dostęp do:',
        bookACallTextBottom: 'Chętnie porozmawiamy z Tobą, aby zrozumieć powody. Możesz umówić rozmowę z jednym z naszych starszych menedżerów produktu, aby omówić swoje potrzeby.',
        takeMeToExpensifyClassic: 'Przejdź do Expensify Classic',
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
        mobileReducedFunctionalityMessage: 'Nie możesz wprowadzać zmian w swoim abonamencie w aplikacji mobilnej.',
        badge: {
            freeTrial: (numOfDays: number) => `Bezpłatny okres próbny: pozostało ${numOfDays} ${numOfDays === 1 ? 'dzień' : 'dni'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Twoje informacje płatnicze są nieaktualne',
                subtitle: (date: string) => `Zaktualizuj swoją kartę płatniczą do ${date}, aby dalej korzystać ze wszystkich ulubionych funkcji.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Nie można było przetworzyć Twojej płatności',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Twoja opłata z dnia ${date} na kwotę ${purchaseAmountOwed} nie mogła zostać przetworzona. Dodaj proszę kartę płatniczą, aby uregulować należność.`
                        : 'Dodaj kartę płatniczą, aby spłacić należną kwotę.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Twoje informacje płatnicze są nieaktualne',
                subtitle: (date: string) => `Twoja płatność jest zaległa. Zapłać proszę fakturę do ${date}, aby uniknąć przerwy w działaniu usługi.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Twoje informacje płatnicze są nieaktualne',
                subtitle: 'Twoja płatność jest przeterminowana. Prosimy o opłacenie faktury.',
            },
            billingDisputePending: {
                title: 'Nie udało się obciążyć Twojej karty',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Zakwestionowano obciążenie na kwotę ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto będzie zablokowane do czasu rozstrzygnięcia reklamacji przez Twój bank.`,
            },
            cardAuthenticationRequired: {
                title: 'Twoja karta płatnicza nie została w pełni uwierzytelniona.',
                subtitle: (cardEnding: string) => `Dokończ proces uwierzytelniania, aby aktywować swoją kartę płatniczą kończącą się na ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Nie udało się obciążyć Twojej karty',
                subtitle: (amountOwed: number) =>
                    `Twoja karta płatnicza została odrzucona z powodu niewystarczających środków. Spróbuj ponownie lub dodaj nową kartę płatniczą, aby uregulować zaległe saldo w wysokości ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Nie udało się obciążyć Twojej karty',
                subtitle: (amountOwed: number) => `Twoja karta płatnicza wygasła. Dodaj nową kartę płatniczą, aby uregulować zaległe saldo w wysokości ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Twoja karta wkrótce wygaśnie',
                subtitle:
                    'Twoja karta płatnicza wygaśnie pod koniec tego miesiąca. Kliknij poniższe menu z trzema kropkami, aby ją zaktualizować i dalej korzystać ze wszystkich ulubionych funkcji.',
            },
            retryBillingSuccess: {
                title: 'Sukces!',
                subtitle: 'Twoja karta została pomyślnie obciążona.',
            },
            retryBillingError: {
                title: 'Nie udało się obciążyć Twojej karty',
                subtitle:
                    'Zanim spróbujesz ponownie, skontaktuj się bezpośrednio ze swoim bankiem, aby autoryzować obciążenia Expensify i usunąć wszelkie blokady. W przeciwnym razie spróbuj dodać inną kartę płatniczą.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Zakwestionowano obciążenie na kwotę ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto będzie zablokowane do czasu rozstrzygnięcia reklamacji przez Twój bank.`,
            preTrial: {
                title: 'Rozpocznij bezpłatny okres próbny',
                subtitle: 'Jako kolejny krok <a href="#">uzupełnij listę zadań konfiguracyjnych</a>, aby Twój zespół mógł zacząć rozliczać wydatki.',
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
                subscriptionPageTitle: (discountType: number) => `<strong>${discountType}% zniżki na pierwszy rok!</strong> Po prostu dodaj kartę płatniczą i rozpocznij subskrypcję roczną.`,
                onboardingChatTitle: (discountType: number) => `Oferta ograniczona czasowo: ${discountType}% zniżki na pierwszy rok!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Zgłoś w ciągu ${days > 0 ? `${days}d :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Płatność',
            subtitle: 'Dodaj kartę, aby opłacić swoją subskrypcję Expensify.',
            addCardButton: 'Dodaj kartę płatniczą',
            cardInfo: (name: string, expiration: string, currency: string) => `Nazwa: ${name}, Wygaśnięcie: ${expiration}, Waluta: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Data Twojej kolejnej płatności to ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Karta kończąca się na ${cardNumber}`,
            changeCard: 'Zmień kartę płatniczą',
            changeCurrency: 'Zmień walutę płatności',
            cardNotFound: 'Nie dodano karty płatniczej',
            retryPaymentButton: 'Ponów płatność',
            authenticatePayment: 'Uwierzytelnij płatność',
            requestRefund: 'Poproś o zwrot pieniędzy',
            requestRefundModal: {
                full: 'Uzyskanie zwrotu jest proste — po prostu obniż swój plan przed następną datą rozliczenia, a otrzymasz zwrot. <br /> <br /> Uwaga: Obniżenie planu oznacza, że Twoje przestrzenie robocze zostaną usunięte. Tej czynności nie można cofnąć, ale zawsze możesz utworzyć nową przestrzeń roboczą, jeśli zmienisz zdanie.',
                confirm: 'Usuń przestrzeń(e) roboczą(e) i obniż pakiet',
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
            perMemberMonth: 'za członka/miesiąc',
            collect: {
                title: 'Zbieraj',
                description: 'Plan dla małych firm, który zapewnia wydatki, podróże i czat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, ${upper}/aktywnego członka bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, ${upper}/aktywnego członka bez karty Expensify.`,
                benefit1: 'Skanowanie paragonów',
                benefit2: 'Zwroty kosztów',
                benefit3: 'Zarządzanie kartami służbowymi',
                benefit4: 'Zatwierdzanie wydatków i podróży',
                benefit5: 'Rezerwacja podróży i zasady',
                benefit6: 'Integracje z QuickBooks/Xero',
                benefit7: 'Czatuj o wydatkach, raportach i pokojach',
                benefit8: 'Wsparcie AI i ludzkie',
            },
            control: {
                title: 'Kontrola',
                description: 'Wydatki, podróże i czat dla większych firm.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, ${upper}/aktywnego członka bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, ${upper}/aktywnego członka bez karty Expensify.`,
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
            upgrade: 'Ulepsz do planu Control',
            addMembers: 'Dodaj członków',
            saveWithExpensifyTitle: 'Oszczędzaj z kartą Expensify',
            saveWithExpensifyDescription: 'Skorzystaj z naszego kalkulatora oszczędności, aby zobaczyć, jak zwrot gotówki z karty Expensify może obniżyć Twój rachunek w Expensify.',
            saveWithExpensifyButton: 'Dowiedz się więcej',
        },
        compareModal: {
            comparePlans: 'Porównaj plany',
            subtitle: `<muted-text>Odblokuj potrzebne funkcje dzięki planowi dopasowanemu do Twoich potrzeb. <a href="${CONST.PRICING}">Zobacz naszą stronę cennika</a>, aby poznać pełne zestawienie funkcji każdego z planów.</muted-text>`,
        },
        details: {
            title: 'Szczegóły subskrypcji',
            annual: 'Roczna subskrypcja',
            taxExempt: 'Poproś o status zwolnienia z podatku',
            taxExemptEnabled: 'Zwolnione z podatku',
            taxExemptStatus: 'Status zwolnienia z podatku',
            payPerUse: 'Płatność za użycie',
            subscriptionSize: 'Wielkość subskrypcji',
            headsUp:
                'Uwaga: jeśli teraz nie ustawisz rozmiaru swojej subskrypcji, automatycznie ustawimy go na liczbę aktywnych członków w pierwszym miesiącu. Zobowiążesz się wówczas do opłacania co najmniej tylu członków przez kolejne 12 miesięcy. Możesz zwiększyć rozmiar subskrypcji w dowolnym momencie, ale nie możesz go zmniejszyć, dopóki subskrypcja się nie zakończy.',
            zeroCommitment: 'Zero zobowiązań przy obniżonej rocznej stawce subskrypcji',
        },
        subscriptionSize: {
            title: 'Wielkość subskrypcji',
            yourSize: 'Rozmiar Twojej subskrypcji to liczba otwartych miejsc, które w danym miesiącu mogą zostać zajęte przez dowolnego aktywnego członka.',
            eachMonth:
                'Każdego miesiąca Twoja subskrypcja obejmuje liczbę aktywnych członków ustawioną powyżej. Za każdym razem, gdy zwiększysz rozmiar subskrypcji, rozpoczniesz nową 12‑miesięczną subskrypcję w tym nowym rozmiarze.',
            note: 'Uwaga: aktywny członek to każda osoba, która utworzyła, edytowała, przesłała, zatwierdziła, zwróciła lub wyeksportowała dane wydatków powiązane z przestrzenią roboczą Twojej firmy.',
            confirmDetails: 'Potwierdź szczegóły nowej subskrypcji rocznej:',
            subscriptionSize: 'Wielkość subskrypcji',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktywnych członków/miesiąc`,
            subscriptionRenews: 'Subskrypcja odnawia się',
            youCantDowngrade: 'Nie możesz obniżyć planu w trakcie rocznej subskrypcji.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Zobowiązałeś(-aś) się już do rocznej subskrypcji na ${size} aktywnych członków miesięcznie do ${date}. Możesz przejść na subskrypcję pay-per-use ${date}, wyłączając automatyczne odnawianie.`,
            error: {
                size: 'Wprowadź prawidłowy rozmiar subskrypcji',
                sameSize: 'Wprowadź liczbę inną niż rozmiar Twojej obecnej subskrypcji',
            },
        },
        paymentCard: {
            addPaymentCard: 'Dodaj kartę płatniczą',
            enterPaymentCardDetails: 'Wprowadź dane swojej karty płatniczej',
            security: 'Expensify jest zgodny z PCI-DSS, używa szyfrowania na poziomie bankowym i korzysta z redundantnej infrastruktury, aby chronić Twoje dane.',
            learnMoreAboutSecurity: 'Dowiedz się więcej o naszym zabezpieczeniu.',
        },
        subscriptionSettings: {
            title: 'Ustawienia subskrypcji',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Typ subskrypcji: ${subscriptionType}, Rozmiar subskrypcji: ${subscriptionSize}, Automatyczne odnawianie: ${autoRenew}, Automatyczne zwiększanie rocznych miejsc: ${autoIncrease}`,
            none: 'brak',
            on: 'włączone',
            off: 'wyłączone',
            annual: 'Roczny',
            autoRenew: 'Automatyczne odnowienie',
            autoIncrease: 'Automatycznie zwiększaj liczbę rocznych miejsc',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Oszczędzaj do ${amountWithCurrency}/miesiąc na aktywnego członka`,
            automaticallyIncrease:
                'Automatycznie zwiększaj liczbę rocznych licencji, aby uwzględnić aktywnych użytkowników przekraczających wielkość Twojej subskrypcji. Uwaga: spowoduje to przedłużenie daty zakończenia rocznej subskrypcji.',
            disableAutoRenew: 'Wyłącz automatyczne odnawianie',
            helpUsImprove: 'Pomóż nam ulepszyć Expensify',
            whatsMainReason: 'Jaki jest główny powód wyłączenia automatycznego odnawiania?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Odnowienie ${date}.`,
            pricingConfiguration: 'Cena zależy od konfiguracji. Aby uzyskać najniższą cenę, wybierz roczną subskrypcję i zamów kartę Expensify.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Dowiedz się więcej na naszej <a href="${CONST.PRICING}">stronie z cennikiem</a> lub porozmawiaj z naszym zespołem w swoim ${hasAdminsRoom ? `<a href="adminsRoom">pokój #admins.</a>` : 'Pokój #admins.'}</muted-text>`,
            estimatedPrice: 'Szacowana cena',
            changesBasedOn: 'To zmienia się w zależności od korzystania z karty Expensify oraz opcji subskrypcji poniżej.',
        },
        requestEarlyCancellation: {
            title: 'Poproś o wcześniejsze anulowanie',
            subtitle: 'Jaki jest główny powód, dla którego prosisz o wcześniejsze anulowanie?',
            subscriptionCanceled: {
                title: 'Subskrypcja anulowana',
                subtitle: 'Twoja subskrypcja roczna została anulowana.',
                info: 'Jeśli chcesz nadal korzystać ze swojego/ swoich przestrzeni roboczych w modelu płatności za użycie, wszystko jest gotowe.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Jeśli chcesz zapobiec przyszłej aktywności i obciążeniom, musisz <a href="${workspacesListRoute}">usunąć swój(e) workspace(y)</a>. Pamiętaj, że po usunięciu workspace’ów zostanie naliczona opłata za wszelką nierozliczoną aktywność powstałą w bieżącym miesiącu kalendarzowym.`,
            },
            requestSubmitted: {
                title: 'Wniosek został przesłany',
                subtitle:
                    'Dziękujemy za informację, że rozważasz anulowanie subskrypcji. Przeglądamy Twoją prośbę i wkrótce skontaktujemy się z Tobą za pośrednictwem czatu z <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Składając wniosek o wcześniejsze anulowanie, przyjmuję do wiadomości i zgadzam się, że Expensify nie ma obowiązku uwzględnienia takiego wniosku na mocy <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Warunków korzystania z usługi</a> Expensify ani innej obowiązującej umowy o świadczenie usług zawartej pomiędzy mną a Expensify oraz że Expensify zachowuje wyłączne prawo do podjęcia decyzji w sprawie uwzględnienia takiego wniosku.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funkcjonalność wymaga poprawy',
        tooExpensive: 'Zbyt drogie',
        inadequateSupport: 'Niewystarczające wsparcie klienta',
        businessClosing: 'Zamknięcie firmy, redukcja zatrudnienia lub przejęcie',
        additionalInfoTitle: 'Na jakie oprogramowanie przechodzisz i dlaczego?',
        additionalInfoInputLabel: 'Twoja odpowiedź',
    },
    roomChangeLog: {
        updateRoomDescription: 'ustaw opis pokoju na:',
        clearRoomDescription: 'wyczyścił(-a) opis pokoju',
        changedRoomAvatar: 'zmienił(-a) awatar pokoju',
        removedRoomAvatar: 'usunął(-ę) awatar pokoju',
    },
    delegate: {
        switchAccount: 'Przełącz konta:',
        copilotDelegatedAccess: 'Copilot: Dostęp delegowany',
        copilotDelegatedAccessDescription: 'Pozwól innym członkom uzyskać dostęp do Twojego konta.',
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
        onBehalfOfMessage: (delegator: string) => `w imieniu ${delegator}`,
        accessLevel: 'Poziom dostępu',
        confirmCopilot: 'Potwierdź swojego drugiego pilota poniżej.',
        accessLevelDescription: 'Wybierz poniższy poziom dostępu. Zarówno Pełny, jak i Ograniczony dostęp pozwalają współpilotom wyświetlać wszystkie konwersacje i wydatki.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Pozwól innemu członkowi wykonywać w Twoim imieniu wszystkie działania na Twoim koncie. Obejmuje to czat, wysyłanie, zatwierdzanie, płatności, aktualizacje ustawień i inne.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Pozwól innemu członkowi wykonywać w Twoim imieniu większość działań na Twoim koncie. Nie obejmuje to zatwierdzeń, płatności, odrzuceń ani wstrzymań.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Usuń kopilota',
        removeCopilotConfirmation: 'Czy na pewno chcesz usunąć tego copilota?',
        changeAccessLevel: 'Zmień poziom dostępu',
        makeSureItIsYou: 'Upewnijmy się, że to Ty',
        enterMagicCode: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby dodać kopilota. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby zaktualizować swojego kopilota.`,
        notAllowed: 'Nie tak szybko...',
        noAccessMessage: dedent(`
            Jako kopilot nie masz dostępu do tej strony. Przepraszamy!
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
            hasDraftComment: 'Ma wersję roboczą komentarza',
            hasGBR: 'Ma GBR',
            hasRBR: 'Ma RBR',
            pinnedByUser: 'Przypięte przez członka',
            hasIOUViolations: 'Ma naruszenia IOU',
            hasAddWorkspaceRoomErrors: 'Ma błędy dodawania pokoju w przestrzeni roboczej',
            isUnread: 'Jest nieprzeczytane (tryb skupienia)',
            isArchived: 'Zarchiwizowane (najnowszy tryb)',
            isSelfDM: 'Czy prywatna wiadomość do siebie',
            isFocused: 'Jest tymczasowo w fokusie',
        },
        reasonGBR: {
            hasJoinRequest: 'Ma prośbę o dołączenie (pokój administratora)',
            isUnreadWithMention: 'Nieprzeczytane z wzmianką',
            isWaitingForAssigneeToCompleteAction: 'Oczekuje na wykonanie działania przez osobę przypisaną',
            hasChildReportAwaitingAction: 'Dziecięcy raport oczekuje na działanie',
            hasMissingInvoiceBankAccount: 'Brak numeru rachunku bankowego na fakturze',
            hasUnresolvedCardFraudAlert: 'Ma nierozwiązaną blokadę z powodu oszustwa kartowego',
        },
        reasonRBR: {
            hasErrors: 'Zawiera błędy w raporcie lub danych działań raportu',
            hasViolations: 'Ma naruszenia',
            hasTransactionThreadViolations: 'Ma naruszenia wątków transakcji',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Raport oczekuje na działanie',
            theresAReportWithErrors: 'Jest raport z błędami',
            theresAWorkspaceWithCustomUnitsErrors: 'Istnieje przestrzeń robocza z błędami niestandardowych jednostek',
            theresAProblemWithAWorkspaceMember: 'Wystąpił problem z członkiem przestrzeni roboczej',
            theresAProblemWithAWorkspaceQBOExport: 'Wystąpił problem z ustawieniem eksportu połączenia przestrzeni roboczej.',
            theresAProblemWithAContactMethod: 'Wystąpił problem z metodą kontaktu',
            aContactMethodRequiresVerification: 'Metoda kontaktu wymaga weryfikacji',
            theresAProblemWithAPaymentMethod: 'Wystąpił problem z metodą płatności',
            theresAProblemWithAWorkspace: 'Wystąpił problem z przestrzenią roboczą',
            theresAProblemWithYourReimbursementAccount: 'Wystąpił problem z Twoim kontem do zwrotów',
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
        title: 'Witamy w New Expensify!',
        subtitle: 'Zawiera wszystko, co lubisz w naszym klasycznym doświadczeniu, plus całą masę ulepszeń, które jeszcze bardziej ułatwią Ci życie:',
        confirmText: 'Ruszajmy!',
        helpText: 'Wypróbuj 2-minutowe demo',
        features: {
            search: 'Bardziej zaawansowane wyszukiwanie na telefonie, w sieci i na komputerze',
            concierge: 'Wbudowana sztuczna inteligencja Concierge, która pomaga automatyzować Twoje wydatki',
            chat: 'Czatuj przy każdym wydatku, aby szybko rozwiązywać wątpliwości',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Zacznij <strong>tutaj!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Zmień nazwę zapisanych wyszukiwań</strong> tutaj!</tooltip>',
        accountSwitcher: '<tooltip>Uzyskaj dostęp do swoich <strong>kont Copilot</strong> tutaj</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Zeskanuj nasz przykładowy paragon</strong>, aby zobaczyć, jak to działa!</tooltip>',
            manager: '<tooltip>Wybierz naszego <strong>menedżera testów</strong>, aby go wypróbować!</tooltip>',
            confirmation: '<tooltip>Teraz <strong>prześlij swój wydatek</strong> i patrz, jak dzieje się magia!</tooltip>',
            tryItOut: 'Wypróbuj to',
        },
        outstandingFilter: '<tooltip>Filtruj wydatki,\nktóre <strong>wymagają zatwierdzenia</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Wyślij ten paragon, aby\n<strong>ukończyć jazdę testową!</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Odrzucić zmiany?',
        body: 'Na pewno chcesz odrzucić wprowadzone zmiany?',
        confirmText: 'Odrzuć zmiany',
    },
    scheduledCall: {
        book: {
            title: 'Zaplanuj rozmowę',
            description: 'Znajdź termin, który Ci odpowiada.',
            slots: ({date}: {date: string}) => `<muted-text>Dostępne godziny na dzień <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Potwierdź połączenie',
            description: 'Upewnij się, że poniższe szczegóły wyglądają dla Ciebie dobrze. Gdy potwierdzisz rozmowę, wyślemy zaproszenie z dodatkowymi informacjami.',
            setupSpecialist: 'Twój specjalista ds. konfiguracji',
            meetingLength: 'Czas trwania spotkania',
            dateTime: 'Data i godzina',
            minutes: '30 minut',
        },
        callScheduled: 'Rozmowa zaplanowana',
    },
    autoSubmitModal: {
        title: 'Wszystko jasne i przesłane!',
        description: 'Wszystkie ostrzeżenia i naruszenia zostały usunięte, więc:',
        submittedExpensesTitle: 'Te wydatki zostały przesłane',
        submittedExpensesDescription: 'Te wydatki zostały wysłane do osoby zatwierdzającej, ale nadal można je edytować, dopóki nie zostaną zatwierdzone.',
        pendingExpensesTitle: 'Oczekujące wydatki zostały przeniesione',
        pendingExpensesDescription: 'Wszystkie oczekujące wydatki z karty zostały przeniesione do osobnego raportu, dopóki nie zostaną zaksięgowane.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Wypróbuj w 2 minuty',
        },
        modal: {
            title: 'Wypróbuj nas w praktyce',
            description: 'Zrób krótką wycieczkę po produkcie, aby szybko się wdrożyć.',
            confirmText: 'Rozpocznij jazdę próbną',
            helpText: 'Pomiń',
            employee: {
                description:
                    '<muted-text>Daj swojej firmie <strong>3 darmowe miesiące Expensify!</strong> Wpisz poniżej adres e-mail swojego szefa i wyślij mu przykładowy wydatek.</muted-text>',
                email: 'Wpisz adres e-mail swojego szefa',
                error: 'Ten członek jest właścicielem przestrzeni roboczej, wprowadź innego członka do testu.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Aktualnie testujesz Expensify',
            readyForTheRealThing: 'Gotowy na prawdziwe wyzwanie?',
            getStarted: 'Rozpocznij',
        },
        employeeInviteMessage: (name: string) => `# ${name} zaprosił(a) Cię do przetestowania Expensify
Cześć! Właśnie załatwiłem(am) nam *3 miesiące za darmo*, żeby przetestować Expensify – najszybszy sposób rozliczania wydatków.

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
                `Przed kontynuacją zweryfikuj, że jesteś właścicielem domeny <strong>${domainName}</strong>, aktualizując jej ustawienia DNS.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Uzyskaj dostęp do swojego dostawcy DNS i otwórz ustawienia DNS dla domeny <strong>${domainName}</strong>.`,
            addTXTRecord: 'Dodaj następujący rekord TXT:',
            saveChanges: 'Zapisz zmiany i wróć tutaj, aby zweryfikować swoją domenę.',
            youMayNeedToConsult: `Aby dokończyć weryfikację, może być konieczne skonsultowanie się z działem IT Twojej organizacji. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Dowiedz się więcej</a>.`,
            warning: 'Po weryfikacji wszyscy członkowie Expensify w Twojej domenie otrzymają e-mail z informacją, że ich konto będzie zarządzane w ramach Twojej domeny.',
            codeFetchError: 'Nie można było pobrać kodu weryfikacyjnego',
            genericError: 'Nie udało się zweryfikować Twojej domeny. Spróbuj ponownie i skontaktuj się z Concierge, jeśli problem będzie się powtarzał.',
        },
        domainVerified: {
            title: 'Domena zweryfikowana',
            header: 'Juhu! Twoja domena została zweryfikowana',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Domena <strong>${domainName}</strong> została pomyślnie zweryfikowana i możesz teraz skonfigurować SAML oraz inne funkcje zabezpieczeń.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Logowanie jednokrotne SAML (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> to funkcja zabezpieczeń, która daje Ci większą kontrolę nad tym, jak członkowie z adresami e-mail <strong>${domainName}</strong> logują się do Expensify. Aby ją włączyć, musisz potwierdzić, że jesteś upoważnionym administratorem firmowym.</muted-text>`,
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
            anyMemberWillBeRequired: 'Każdy członek zalogowany inną metodą będzie musiał ponownie się uwierzytelnić za pomocą SAML.',
            enableError: 'Nie można było zaktualizować ustawienia włączenia SAML',
            requireError: 'Nie można było zaktualizować ustawienia wymogu SAML',
            disableSamlRequired: 'Wyłącz wymaganie SAML',
            oktaWarningPrompt: 'Czy na pewno? Spowoduje to również wyłączenie Okta SCIM.',
            requireWithEmptyMetadataError: 'Dodaj poniżej metadane dostawcy tożsamości, aby włączyć',
        },
        samlConfigurationDetails: {
            title: 'Szczegóły konfiguracji SAML',
            subtitle: 'Użyj tych danych, aby skonfigurować SAML.',
            identityProviderMetadata: 'Metadane dostawcy tożsamości',
            entityID: 'Identyfikator encji',
            nameIDFormat: 'Format identyfikatora nazwy',
            loginUrl: 'Adres URL logowania',
            acsUrl: 'Adres URL ACS (Assertion Consumer Service)',
            logoutUrl: 'Adres URL wylogowania',
            sloUrl: 'Adres URL SLO (Single Logout)',
            serviceProviderMetaData: 'Metadane dostawcy usług',
            oktaScimToken: 'Token SCIM Okta',
            revealToken: 'Pokaż token',
            fetchError: 'Nie udało się pobrać szczegółów konfiguracji SAML',
            setMetadataGenericError: 'Nie można było ustawić metadanych SAML',
        },
        accessRestricted: {
            title: 'Dostęp ograniczony',
            subtitle: (domainName: string) => `Potwierdź, że jesteś upoważnionym administratorem firmy dla <strong>${domainName}</strong>, jeśli potrzebujesz kontroli nad:`,
            companyCardManagement: 'Zarządzanie kartami firmowymi',
            accountCreationAndDeletion: 'Tworzenie i usuwanie konta',
            workspaceCreation: 'Tworzenie przestrzeni roboczej',
            samlSSO: 'Logowanie jednokrotne SAML',
        },
        addDomain: {
            title: 'Dodaj domenę',
            subtitle: 'Wpisz nazwę prywatnej domeny, do której chcesz uzyskać dostęp (np. expensify.com).',
            domainName: 'Nazwa domeny',
            newDomain: 'Nowa domena',
        },
        domainAdded: {
            title: 'Domena dodana',
            description: 'Następnie musisz zweryfikować własność domeny i dostosować ustawienia zabezpieczeń.',
            configure: 'Skonfiguruj',
        },
        enhancedSecurity: {
            title: 'Zwiększone bezpieczeństwo',
            subtitle: 'Wymagaj od członków swojej domeny logowania jednokrotnym logowaniem (SSO), ograniczaj tworzenie przestrzeni roboczych i nie tylko.',
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
            consolidatedDomainBilling: 'Zbiorcze rozliczanie domen',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Po włączeniu główny kontakt będzie opłacać wszystkie przestrzenie robocze należące do członków <strong>${domainName}</strong> i otrzymywać wszystkie potwierdzenia rozliczeń.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'Nie można było zmienić skonsolidowanego rozliczania domeny. Spróbuj ponownie później.',
            addAdmin: 'Dodaj administratora',
            invite: 'Zaproś',
            addAdminError: 'Nie można dodać tego członka jako administratora. Spróbuj ponownie.',
            revokeAdminAccess: 'Cofnij dostęp administratora',
            cantRevokeAdminAccess: 'Nie można odebrać dostępu administratora kontaktowi technicznemu',
            error: {
                removeAdmin: 'Nie można usunąć tego użytkownika jako administratora. Spróbuj ponownie.',
                removeDomain: 'Nie można usunąć tej domeny. Spróbuj ponownie.',
                removeDomainNameInvalid: 'Wprowadź nazwę swojej domeny, aby ją zresetować.',
            },
            resetDomain: 'Resetuj domenę',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Wpisz proszę <strong>${domainName}</strong>, aby potwierdzić reset domeny.`,
            enterDomainName: 'Wpisz tutaj swoją nazwę domeny',
            resetDomainInfo: `Ta czynność jest <strong>trwała</strong> i następujące dane zostaną usunięte: <br/> <ul><li>Połączenia kart firmowych oraz wszystkie nierozliczone wydatki z tych kart</li> <li>Ustawienia SAML i grup</li> </ul> Wszystkie konta, przestrzenie robocze, raporty, wydatki i inne dane pozostaną bez zmian. <br/><br/>Uwaga: Możesz usunąć tę domenę z listy swoich domen, usuwając powiązany adres e‑mail z <a href="#">metod kontaktu</a>.`,
        },
        members: {
            title: 'Członkowie',
            findMember: 'Znajdź członka',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
