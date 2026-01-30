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
import {OriginalMessageSettlementAccountLocked, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';
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
        proceed: 'Kontynuuj',
        unshare: 'Cofnij udostępnianie',
        yes: 'Tak',
        no: 'Nie',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Nie teraz',
        noThanks: 'Nie, dziękuję',
        learnMore: 'Dowiedz się więcej',
        buttonConfirm: 'Rozumiem',
        name: 'Imię',
        attachment: 'Załącznik',
        attachments: 'Załączniki',
        center: 'Wyśrodkuj',
        from: 'Od',
        to: 'Do',
        in: 'W',
        optional: 'Opcjonalne',
        new: 'Nowy',
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
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Wielokrotny wybór',
        saveChanges: 'Zapisz zmiany',
        submit: 'Prześlij',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Przesłano',
        rotate: 'Obróć',
        zoom: 'Zoom',
        password: 'Hasło',
        magicCode: 'Kod magiczny',
        digits: 'cyfr',
        twoFactorCode: 'Kod dwuskładnikowy',
        workspaces: 'Przestrzenie robocze',
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
        signInWith: 'Zaloguj się za pomocą',
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
        archived: 'Zarchiwizowane',
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
        addressLine: (lineNumber: number) => `Linia adresu ${lineNumber}`,
        personalAddress: 'Adres domowy',
        companyAddress: 'Adres firmy',
        noPO: 'Prosimy, bez skrytek pocztowych ani adresów typu mail-drop.',
        city: 'Miasto',
        state: 'Stan',
        streetAddress: 'Ulica i numer domu',
        stateOrProvince: 'Stan / Prowincja',
        country: 'Kraj',
        zip: 'Kod pocztowy',
        zipPostCode: 'Kod pocztowy',
        whatThis: 'Co to jest?',
        iAcceptThe: 'Akceptuję',
        acceptTermsAndPrivacy: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi Expensify</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politykę prywatności</a>`,
        acceptTermsAndConditions: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">warunki i postanowienia</a>`,
        acceptTermsOfService: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi Expensify</a>`,
        remove: 'Usuń',
        admin: 'Administrator',
        owner: 'Właściciel',
        dateFormat: 'RRRR-MM-DD',
        send: 'Wyślij',
        na: 'Nie dotyczy',
        noResultsFound: 'Nie znaleziono wyników',
        noResultsFoundMatching: (searchString: string) => `Nie znaleziono wyników pasujących do „${searchString}”`,
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
        converted: 'Przekonwertowane',
        error: {
            invalidAmount: 'Nieprawidłowa kwota',
            acceptTerms: 'Musisz zaakceptować Regulamin świadczenia usług, aby kontynuować',
            phoneNumber: `Proszę wprowadzić pełny numer telefonu
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
            invalidTimeRange: 'Wprowadź godzinę w 12-godzinnym formacie (np. 2:30 PM)',
            pleaseCompleteForm: 'Aby kontynuować, wypełnij powyższy formularz',
            pleaseSelectOne: 'Wybierz jedną z powyższych opcji',
            invalidRateError: 'Wprowadź prawidłową stawkę',
            lowRateError: 'Stawka musi być większa niż 0',
            email: 'Wprowadź prawidłowy adres e‑mail',
            login: 'Wystąpił błąd podczas logowania. Spróbuj ponownie.',
        },
        comma: 'Przecinek',
        semicolon: 'średnik',
        please: 'Proszę',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'Skontaktuj się z nami',
        pleaseEnterEmailOrPhoneNumber: 'Wprowadź adres e‑mail lub numer telefonu',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'Napraw błędy',
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
        me: 'Ja',
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
        assignee: 'Cesjonariusz',
        createdBy: 'Utworzone przez',
        with: 'z',
        shareCode: 'Udostępnij kod',
        share: 'Udostępnij',
        per: 'na',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: 'mila',
        km: 'kilometr',
        copied: 'Skopiowano!',
        someone: 'Ktoś',
        total: 'Razem',
        edit: 'Edytuj',
        letsDoThis: `Do dzieła!`,
        letsStart: `Zacznijmy`,
        showMore: 'Pokaż więcej',
        showLess: 'Pokaż mniej',
        merchant: 'Sprzedawca',
        change: 'Zmień',
        category: 'Kategoria',
        report: 'Raport',
        billable: 'Do zafakturowania',
        nonBillable: 'Niefakturowalne',
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
        update: 'Aktualizuj',
        member: 'Członek',
        auditor: 'Audytor',
        role: 'Rola',
        currency: 'Waluta',
        groupCurrency: 'Waluta grupy',
        rate: 'Stawka',
        emptyLHN: {
            title: 'Juhu! Wszystko nadrobione.',
            subtitleText1: 'Znajdź czat za pomocą',
            subtitleText2: 'przycisk powyżej lub utwórz coś, używając',
            subtitleText3: 'przycisku poniżej.',
        },
        businessName: 'Nazwa firmy',
        clear: 'Wyczyść',
        type: 'Typ',
        reportName: 'Nazwa raportu',
        action: 'Akcja',
        expenses: 'Wydatki',
        totalSpend: 'Całkowite wydatki',
        tax: 'Podatek',
        shared: 'Udostępnione',
        drafts: 'Szkice',
        // @context as a noun, not a verb
        draft: 'Wersja robocza',
        finished: 'Zakończono',
        upgrade: 'Ulepsz',
        downgradeWorkspace: 'Obniż poziom przestrzeni roboczej',
        companyID: 'ID firmy',
        userID: 'ID użytkownika',
        disable: 'Wyłącz',
        export: 'Eksport',
        initialValue: 'Wartość początkowa',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Aktualna data',
        value: 'Wartość',
        downloadFailedTitle: 'Pobieranie nie powiodło się',
        downloadFailedDescription: 'Nie udało się zakończyć pobierania. Spróbuj ponownie później.',
        filterLogs: 'Filtruj logi',
        network: 'Sieć',
        reportID: 'ID raportu',
        longReportID: 'Długi identyfikator raportu',
        withdrawalID: 'ID wypłaty',
        bankAccounts: 'Konta bankowe',
        chooseFile: 'Wybierz plik',
        chooseFiles: 'Wybierz pliki',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Upuść',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Upuść tutaj swój plik',
        ignore: 'Ignoruj',
        enabled: 'Włączone',
        disabled: 'Wyłączone',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'Importuj',
        offlinePrompt: 'Nie możesz teraz wykonać tej akcji.',
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: 'Nierozliczone',
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
        secondAbbreviation: 's',
        skip: 'Pomiń',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Potrzebujesz czegoś konkretnego? Porozmawiaj ze swoim opiekunem konta, ${accountManagerDisplayName}.`,
        chatNow: 'Czat teraz',
        workEmail: 'Służbowy e-mail',
        destination: 'Miejsce docelowe',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Stawka podrzędna',
        perDiem: 'Dieta',
        validate: 'Zatwierdź',
        downloadAsPDF: 'Pobierz jako PDF',
        downloadAsCSV: 'Pobierz jako CSV',
        help: 'Pomoc',
        expenseReport: 'Raport wydatków',
        expenseReports: 'Raporty wydatków',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Stawka poza polityką',
        leaveWorkspace: 'Opuść przestrzeń roboczą',
        leaveWorkspaceConfirmation: 'Jeśli opuścisz ten obszar roboczy, nie będziesz mógł przesyłać do niego wydatków.',
        leaveWorkspaceConfirmationAuditor: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mógł wyświetlać jej raportów ani ustawień.',
        leaveWorkspaceConfirmationAdmin: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mógł zarządzać jej ustawieniami.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz ten workspace, zostaniesz zastąpiony w ścieżce akceptacji przez ${workspaceOwner}, właściciela workspace.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, zostaniesz zastąpiony jako preferowany eksporter przez ${workspaceOwner}, właściciela przestrzeni roboczej.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, zostaniesz zastąpiony jako kontakt techniczny przez ${workspaceOwner}, właściciela przestrzeni roboczej.`,
        leaveWorkspaceReimburser:
            'Nie możesz opuścić tej przestrzeni roboczej jako wypłacający zwrot. Ustaw nową osobę wypłacającą zwrot w Przestrzenie robocze > Dokonuj lub śledź płatności, a następnie spróbuj ponownie.',
        reimbursable: 'Podlegające zwrotowi',
        editYourProfile: 'Edytuj profil',
        comments: 'Komentarze',
        sharedIn: 'Udostępnione w',
        unreported: 'Niezgłoszone',
        explore: 'Odkrywaj',
        todo: 'Lista zadań',
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
        reschedule: 'Przełóż',
        general: 'Ogólne',
        workspacesTabTitle: 'Przestrzenie robocze',
        headsUp: 'Uwaga!',
        submitTo: 'Prześlij do',
        forwardTo: 'Przekaż do',
        merge: 'Scal',
        none: 'Brak',
        unstableInternetConnection: 'Niestabilne połączenie internetowe. Sprawdź swoją sieć i spróbuj ponownie.',
        enableGlobalReimbursements: 'Włącz globalne zwroty kosztów',
        purchaseAmount: 'Kwota zakupu',
        frequency: 'Częstotliwość',
        link: 'Link',
        pinned: 'Przypięte',
        read: 'Przeczytaj',
        copyToClipboard: 'Kopiuj do schowka',
        thisIsTakingLongerThanExpected: 'To trwa dłużej, niż się spodziewaliśmy…',
        domains: 'Domeny',
        actionRequired: 'Wymagane działanie',
        duplicate: 'Duplikat',
        duplicated: 'Zduplikowano',
        exchangeRate: 'Kurs wymiany',
        reimbursableTotal: 'Łączna kwota podlegająca zwrotowi',
        nonReimbursableTotal: 'Suma niepodlegająca zwrotowi',
        originalAmount: 'Kwota pierwotna',
        insights: 'Analizy',
        duplicateExpense: 'Zduplikowany wydatek',
        newFeature: 'Nowa funkcja',
        month: 'Miesiąc',
        home: 'Strona główna',
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
        description: 'Nie możesz wykonać tej akcji, ponieważ to konto zostało zablokowane. Skontaktuj się z concierge@expensify.com, aby uzyskać informacje o dalszych krokach',
    },
    location: {
        useCurrent: 'Użyj bieżącej lokalizacji',
        notFound: 'Nie udało nam się ustalić Twojej lokalizacji. Spróbuj ponownie lub wprowadź adres ręcznie.',
        permissionDenied: 'Wygląda na to, że odmówiłeś dostępu do swojej lokalizacji.',
        please: 'Proszę',
        allowPermission: 'zezwól na dostęp do lokalizacji w ustawieniach',
        tryAgain: 'i spróbuj ponownie.',
    },
    contact: {
        importContacts: 'Importuj kontakty',
        importContactsTitle: 'Zaimportuj kontakty',
        importContactsText: 'Zaimportuj kontakty z telefonu, aby Twoi ulubieni znajomi byli zawsze na wyciągnięcie ręki.',
        importContactsExplanation: 'dzięki czemu Twoi ulubieni ludzie są zawsze o jedno dotknięcie dalej.',
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
        folderNotAllowedMessage: 'Przesyłanie folderu nie jest dozwolone. Spróbuj użyć innego pliku.',
        protectedPDFNotSupported: 'Plik PDF zabezpieczony hasłem nie jest obsługiwany',
        attachmentImageResized: 'Ten obraz został zmniejszony na potrzeby podglądu. Pobierz go, aby zobaczyć w pełnej rozdzielczości.',
        attachmentImageTooLarge: 'Ten obraz jest zbyt duży, aby wyświetlić podgląd przed przesłaniem.',
        tooManyFiles: (fileLimit: number) => `Możesz przesłać jednocześnie maksymalnie ${fileLimit} plików.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Plik przekracza ${maxUploadSizeInMB} MB. Spróbuj ponownie.`,
        someFilesCantBeUploaded: 'Niektórych plików nie można przesłać',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Pliki muszą mieć mniej niż ${maxUploadSizeInMB} MB. Większe pliki nie zostaną przesłane.`,
        maxFileLimitExceeded: 'Możesz jednorazowo przesłać maksymalnie 30 paragonów. Dodatkowe nie zostaną przesłane.',
        unsupportedFileType: (fileType: string) => `Pliki ${fileType} nie są obsługiwane. Przesłane zostaną tylko obsługiwane typy plików.`,
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
        updatePrompt: 'Nowa wersja tej aplikacji jest dostępna.\nZaktualizuj teraz lub uruchom aplikację ponownie później, aby pobrać najnowsze zmiany.',
    },
    deeplinkWrapper: {
        launching: 'Uruchamianie Expensify',
        expired: 'Twoja sesja wygasła.',
        signIn: 'Zaloguj się ponownie.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Test biometryczny',
            authenticationSuccessful: 'Autentykacja zakończona sukcesem',
            successfullyAuthenticatedUsing: ({authType}) => `Pomyślnie uwierzytelniono za pomocą ${authType}.`,
            troubleshootBiometricsStatus: ({registered}) => `Biometria (${registered ? 'Zarejestrowana' : 'Nie zarejestrowana'})`,
            yourAttemptWasUnsuccessful: 'Twoja próba autentykacji była nieudana.',
            youCouldNotBeAuthenticated: 'Nie udało się uwierzytelnić',
            areYouSureToReject: 'Czy jesteś pewien? Próba autentykacji zostanie odrzucona, jeśli zamkniesz ten ekran.',
            rejectAuthentication: 'Odrzuć autentykację',
            test: 'Test',
            biometricsAuthentication: 'Autentykacja biometryczna',
        },
        pleaseEnableInSystemSettings: {
            start: 'Włącz weryfikację twarzy/odcisku palca lub ustaw kod dostępu do urządzenia w ',
            link: 'ustawieniach systemowych',
            end: '.',
        },
        oops: 'Ups, coś poszło nie tak',
        looksLikeYouRanOutOfTime: 'Wygląda na to, że zabrakło ci czasu! Spróbuj ponownie u sprzedawcy.',
        youRanOutOfTime: 'Czas minął',
        letsVerifyItsYou: 'Sprawdźmy, czy to ty',
        verifyYourself: {
            biometrics: 'Zweryfikuj się za pomocą twarzy lub odcisku palca',
        },
        enableQuickVerification: {
            biometrics: 'Włącz szybką i bezpieczną weryfikację za pomocą twarzy lub odcisku palca. Bez haseł ani kodów.',
        },
        revoke: {
            revoke: 'Unieważnij',
            title: 'Rozpoznawanie twarzy/odcisk palca i klucze dostępu',
            explanation:
                'Weryfikacja za pomocą twarzy/odcisku palca lub klucza dostępu (passkey) jest włączona na jednym lub większej liczbie urządzeń. Cofnięcie dostępu spowoduje, że przy następnej weryfikacji na dowolnym urządzeniu wymagany będzie magiczny kod',
            confirmationPrompt: 'Czy na pewno? Będziesz potrzebować magicznego kodu do następnej weryfikacji na dowolnym urządzeniu',
            cta: 'Cofnij dostęp',
            noDevices:
                'Nie masz żadnych urządzeń zarejestrowanych do weryfikacji twarzą, odciskiem palca ani kluczem dostępu. Jeśli jakieś zarejestrujesz, będziesz mógł/mogła cofnąć ten dostęp w tym miejscu.',
            dismiss: 'Rozumiem',
            error: 'Żądanie nie powiodło się. Spróbuj ponownie później.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abrakadabra,
            zostałeś zalogowany!
        `),
        successfulSignInDescription: 'Wróć do swojej oryginalnej karty, aby kontynuować.',
        title: 'Oto Twój magiczny kod',
        description: dedent(`
            Wprowadź kod z urządzenia,
            na którym został pierwotnie wygenerowany
        `),
        doNotShare: dedent(`
            Nie udostępniaj nikomu swojego kodu.
            Expensify nigdy o niego nie poprosi!
        `),
        or: ', lub',
        signInHere: 'po prostu zaloguj się tutaj',
        expiredCodeTitle: 'Kod magiczny wygasł',
        expiredCodeDescription: 'Wróć do oryginalnego urządzenia i poproś o nowy kod',
        successfulNewCodeRequest: 'Kod został wysłany. Sprawdź swoje urządzenie.',
        tfaRequiredTitle: dedent(`
            Dwuskładnikowe uwierzytelnianie
            wymagane
        `),
        tfaRequiredDescription: dedent(`
            Wprowadź kod uwierzytelniania dwuskładnikowego tam, gdzie próbujesz się zalogować.
        `),
        requestOneHere: 'żądanie pierwsze tutaj.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Opłacone przez',
        whatsItFor: 'Do czego to służy?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Imię, adres e‑mail lub numer telefonu',
        findMember: 'Znajdź członka',
        searchForSomeone: 'Wyszukaj osobę',
    },
    customApprovalWorkflow: {
        title: 'Niestandardowy proces zatwierdzania',
        description: 'Twoja firma ma niestandardowy proces akceptacji w tym obszarze roboczym. Wykonaj tę akcję w Expensify Classic',
        goToExpensifyClassic: 'Przełącz na Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Zgłoś wydatek, poleć swój zespół',
            subtitleText: 'Chcesz, aby Twój zespół też korzystał z Expensify? Po prostu wyślij im raport wydatków, a my zajmiemy się resztą.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Umów rozmowę',
    },
    hello: 'Cześć',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Rozpocznij poniżej.',
        anotherLoginPageIsOpen: 'Otwarta jest inna strona logowania.',
        anotherLoginPageIsOpenExplanation: 'Otworzyłeś stronę logowania w osobnej karcie. Zaloguj się z tamtej karty.',
        welcome: 'Witamy!',
        welcomeWithoutExclamation: 'Witamy',
        phrase2: 'Pieniądze mówią. A teraz, gdy czat i płatności są w jednym miejscu, jest to również łatwe.',
        phrase3: 'Twoje płatności docierają do Ciebie tak szybko, jak szybko potrafisz przekazać swoją myśl.',
        enterPassword: 'Wprowadź hasło',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, zawsze miło widzieć tu nową twarz!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Wprowadź kod magiczny wysłany na ${login}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
    },
    login: {
        hero: {
            header: 'Podróże i wydatki w tempie rozmowy',
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
        copyURLToClipboard: 'Skopiuj URL do schowka',
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
            return `Czy na pewno chcesz usunąć ten element typu ${type}?`;
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
        reactedWith: 'zareagował(a) za pomocą',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Przegapiłeś imprezę w <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, nie ma tu nic do zobaczenia.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Ten czat jest dostępny dla wszystkich członków Expensify w domenie <strong>${domainRoom}</strong>. Używaj go do rozmów ze współpracownikami, dzielenia się poradami i zadawania pytań.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Ta rozmowa jest z administratorem <strong>${workspaceName}</strong>. Użyj jej, aby porozmawiać o konfiguracji przestrzeni roboczej i nie tylko.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Ten czat jest z wszystkimi w <strong>${workspaceName}</strong>. Używaj go do najważniejszych ogłoszeń.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Ten czat jest przeznaczony na wszystko, co dotyczy <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Ten czat służy do faktur między <strong>${invoicePayer}</strong> a <strong>${invoiceReceiver}</strong>. Użyj przycisku +, aby wysłać fakturę.`,
        beginningOfChatHistory: (users: string) => `Ta rozmowa jest z ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Tutaj <strong>${submitterDisplayName}</strong> będzie przesyłać wydatki do <strong>${workspaceName}</strong>. Wystarczy użyć przycisku +.`,
        beginningOfChatHistorySelfDM: 'To jest Twoja osobista przestrzeń. Używaj jej do notatek, zadań, szkiców i przypomnień.',
        beginningOfChatHistorySystemDM: 'Witamy! Skonfigurujmy wszystko.',
        chatWithAccountManager: 'Czat z Twoim opiekunem klienta tutaj',
        askMeAnything: 'Zapytaj mnie o cokolwiek!',
        sayHello: 'Przywitaj się!',
        yourSpace: 'Twoja przestrzeń',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Witamy w ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Użyj przycisku +, aby ${additionalText} wydatek.`,
        askConcierge: 'Zadawaj pytania i otrzymuj całodobowe wsparcie w czasie rzeczywistym.',
        conciergeSupport: 'Całodobowa pomoc',
        create: 'Utwórz',
        iouTypes: {
            pay: 'Zapłać',
            split: 'Podziel',
            submit: 'Prześlij',
            track: 'śledzić',
            invoice: 'Faktura',
        },
    },
    adminOnlyCanPost: 'Tylko administratorzy mogą wysyłać wiadomości w tym pokoju.',
    reportAction: {
        asCopilot: 'jako kopilot dla',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `utworzył ten raport, aby zawrzeć wszystkie wydatki z <a href="${reportUrl}">${reportName}</a>, które nie mogły zostać przesłane zgodnie z wybraną przez ciebie częstotliwością`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `utworzył ten raport dla wszystkich wstrzymanych wydatków z <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Powiadom wszystkich w tej konwersacji',
    },
    newMessages: 'Nowe wiadomości',
    latestMessages: 'Najnowsze wiadomości',
    youHaveBeenBanned: 'Uwaga: Zostałeś zablokowany na czacie w tym kanale.',
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
            `Ten czat nie jest już aktywny, ponieważ ${oldDisplayName} połączył swoje konto z ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Ta rozmowa nie jest już aktywna, ponieważ <strong>nie jesteś już</strong> członkiem przestrzeni roboczej ${policyName}.`
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
        fabNewChatExplained: 'Otwórz menu akcji',
        fabScanReceiptExplained: 'Zeskanuj paragon (Akcja pływająca)',
        chatPinned: 'Czat przypięty',
        draftedMessage: 'Wiadomość robocza',
        listOfChatMessages: 'Lista wiadomości na czacie',
        listOfChats: 'Lista czatów',
        saveTheWorld: 'Ocal świat',
        tooltip: 'Rozpocznij tutaj!',
        redirectToExpensifyClassicModal: {
            title: 'Wkrótce dostępne',
            description: 'Dopieszczamy jeszcze kilka elementów Nowego Expensify, aby dostosować je do Twojej konkretnej konfiguracji. W międzyczasie przejdź do Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Subskrypcja',
        domains: 'Domeny',
    },
    tabSelector: {chat: 'Czat', room: 'Pokój', distance: 'Dystans', manual: 'Ręczny', scan: 'Skanuj', map: 'Mapa', gps: 'GPS', odometer: 'Licznik przebiegu'},
    spreadsheet: {
        upload: 'Prześlij arkusz kalkulacyjny',
        import: 'Importuj arkusz kalkulacyjny',
        dragAndDrop: '<muted-link>Przeciągnij i upuść tutaj swój arkusz kalkulacyjny lub wybierz plik poniżej. Obsługiwane formaty: .csv, .txt, .xls i .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Przeciągnij i upuść tutaj swój arkusz kalkulacyjny lub wybierz plik poniżej. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Dowiedz się więcej</a> o obsługiwanych formatach plików.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Wybierz plik arkusza kalkulacyjnego do zaimportowania. Obsługiwane formaty: .csv, .txt, .xls i .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Wybierz plik arkusza kalkulacyjnego do zaimportowania. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Dowiedz się więcej</a> o obsługiwanych formatach plików.</muted-link>`,
        fileContainsHeader: 'Plik zawiera nagłówki kolumn',
        column: (name: string) => `Kolumna ${name}`,
        fieldNotMapped: (fieldName: string) => `Ups! Wymagane pole („${fieldName}”) nie zostało zmapowane. Sprawdź wszystko i spróbuj ponownie.`,
        singleFieldMultipleColumns: (fieldName: string) => `Ups! Przypisałeś jedno pole („${fieldName}”) do wielu kolumn. Sprawdź ustawienia i spróbuj ponownie.`,
        emptyMappedField: (fieldName: string) => `Ups! Pole („${fieldName}”) zawiera jedną lub więcej pustych wartości. Sprawdź je i spróbuj ponownie.`,
        importSuccessfulTitle: 'Import zakończony pomyślnie',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `Dodano ${categories} kategorii.` : 'Dodano 1 kategorię.'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'Nie dodano ani nie zaktualizowano żadnych członków.';
            }
            if (added && updated) {
                return `Dodano ${added} członek${added > 1 ? 's' : ''}, zaktualizowano ${updated} członek${updated > 1 ? 's' : ''}.`;
            }
            if (updated) {
                return updated > 1 ? `Zaktualizowano ${updated} członków.` : 'Zaktualizowano 1 członka.';
            }
            return added > 1 ? `Dodano ${added} członków.` : 'Dodano 1 członka.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `Dodano ${tags} tagów.` : 'Dodano 1 tag.'),
        importMultiLevelTagsSuccessfulDescription: 'Dodano tagi wielopoziomowe.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `Dodano ${rates} stawek ryczałtowych.` : 'Dodano 1 stawkę diety.'),
        importFailedTitle: 'Import zakończony niepowodzeniem',
        importFailedDescription: 'Upewnij się, że wszystkie pola zostały wypełnione poprawnie i spróbuj ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z Concierge.',
        importDescription: 'Wybierz pola do zmapowania z arkusza kalkulacyjnego, klikając menu rozwijane obok każdej zaimportowanej kolumny poniżej.',
        sizeNotMet: 'Rozmiar pliku musi być większy niż 0 bajtów',
        invalidFileMessage:
            'Przesłany plik jest pusty lub zawiera nieprawidłowe dane. Upewnij się, że plik jest poprawnie sformatowany i zawiera wymagane informacje, zanim prześlesz go ponownie.',
        importSpreadsheetLibraryError: 'Nie udało się załadować modułu arkusza kalkulacyjnego. Sprawdź swoje połączenie internetowe i spróbuj ponownie.',
        importSpreadsheet: 'Importuj arkusz kalkulacyjny',
        downloadCSV: 'Pobierz CSV',
        importMemberConfirmation: () => ({
            one: `Potwierdź poniższe szczegóły nowego członka przestrzeni roboczej, który zostanie dodany w ramach tego przesłania. Istniejący członkowie nie otrzymają żadnych aktualizacji ról ani wiadomości z zaproszeniami.`,
            other: (count: number) =>
                `Potwierdź poniższe szczegóły dla ${count} nowych członków przestrzeni roboczej, którzy zostaną dodani w ramach tego przesyłania. Istniejący członkowie nie otrzymają żadnych aktualizacji ról ani wiadomości z zaproszeniem.`,
        }),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) => (transactions > 1 ? `Zaimportowano ${transactions} transakcji.` : 'Zaimportowano 1 transakcję.'),
    },
    receipt: {
        upload: 'Prześlij paragon',
        uploadMultiple: 'Prześlij paragony',
        desktopSubtitleSingle: `lub przeciągnij i upuść go tutaj`,
        desktopSubtitleMultiple: `lub przeciągnij je i upuść tutaj`,
        alternativeMethodsTitle: 'Inne sposoby dodawania paragonów:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Pobierz aplikację</a>, aby skanować z telefonu</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Przekaż paragony na adres <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Dodaj swój numer</a>, aby wysyłać potwierdzenia SMS na numer ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Wyślij paragony SMS-em na ${phoneNumber} (tylko numery z USA)</label-text>`,
        takePhoto: 'Zrób zdjęcie',
        cameraAccess: 'Dostęp do aparatu jest wymagany, aby robić zdjęcia paragonów.',
        deniedCameraAccess: `Dostęp do aparatu nadal nie został przyznany, prosimy postępować zgodnie z <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">tymi instrukcjami</a>.`,
        cameraErrorTitle: 'Błąd aparatu',
        cameraErrorMessage: 'Wystąpił błąd podczas robienia zdjęcia. Spróbuj ponownie.',
        locationAccessTitle: 'Zezwól na dostęp do lokalizacji',
        locationAccessMessage: 'Dostęp do lokalizacji pomaga nam zachować prawidłową strefę czasową i walutę, gdziekolwiek jesteś.',
        locationErrorTitle: 'Zezwól na dostęp do lokalizacji',
        locationErrorMessage: 'Dostęp do lokalizacji pomaga nam zachować prawidłową strefę czasową i walutę, gdziekolwiek jesteś.',
        allowLocationFromSetting: `Dostęp do lokalizacji pomaga nam utrzymywać prawidłową strefę czasową i walutę, gdziekolwiek jesteś. Zezwól proszę na dostęp do lokalizacji w ustawieniach uprawnień swojego urządzenia.`,
        dropTitle: 'Odpuść',
        dropMessage: 'Upuść tutaj swój plik',
        flash: 'błysk',
        multiScan: 'Wielokrotne skanowanie',
        shutter: 'migawka',
        gallery: 'Galeria',
        deleteReceipt: 'Usuń paragon',
        deleteConfirmation: 'Czy na pewno chcesz usunąć ten paragon?',
        addReceipt: 'Dodaj paragon',
        scanFailed: 'Nie można było zeskanować paragonu, ponieważ brakuje na nim sprzedawcy, daty lub kwoty.',
        addAReceipt: {
            phrase1: 'Dodaj paragon',
            phrase2: 'lub przeciągnij i upuść go tutaj',
        },
    },
    quickAction: {
        scanReceipt: 'Zeskanuj paragon',
        recordDistance: 'Śledź dystans',
        requestMoney: 'Utwórz wydatek',
        perDiem: 'Utwórz dietę',
        splitBill: 'Podziel wydatki',
        splitScan: 'Podziel rachunek',
        splitDistance: 'Podziel dystans',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zapłać ${name ?? 'ktoś'}`,
        assignTask: 'Przypisz zadanie',
        header: 'Szybka akcja',
        noLongerHaveReportAccess: 'Nie masz już dostępu do swojego poprzedniego szybkiego działania. Wybierz nowe poniżej.',
        updateDestination: 'Zaktualizuj miejsce docelowe',
        createReport: 'Utwórz raport',
    },
    iou: {
        amount: 'Kwota',
        percent: 'Procent',
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
        splitExpense: 'Podziel wydatki',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} od ${merchant}`,
        splitByPercentage: 'Podziel procentowo',
        addSplit: 'Dodaj podział',
        makeSplitsEven: 'Podziel równo',
        editSplits: 'Edytuj podziały',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Całkowita kwota jest o ${amount} wyższa niż pierwotny wydatek.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Kwota całkowita jest o ${amount} mniejsza niż pierwotny wydatek.`,
        splitExpenseZeroAmount: 'Wprowadź prawidłową kwotę przed kontynuowaniem.',
        splitExpenseOneMoreSplit: 'Nie dodano żadnych podziałów. Dodaj co najmniej jeden, aby zapisać.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Edytuj ${amount} dla ${merchant}`,
        removeSplit: 'Usuń podział',
        splitExpenseCannotBeEditedModalTitle: 'Ten wydatek nie może zostać edytowany',
        splitExpenseCannotBeEditedModalDescription: 'Zatwierdzonych lub opłaconych wydatków nie można edytować',
        splitExpenseDistanceErrorModalDescription: 'Popraw błąd stawki odległości i spróbuj ponownie.',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zapłać ${name ?? 'ktoś'}`,
        expense: 'Wydatek',
        categorize: 'Kategoryzuj',
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
        deletedTransaction: (amount: string, merchant: string) => `usunął wydatek (${amount} dla ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `przeniesiono wydatek${reportName ? `z ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `przeniósł ten wydatek${reportName ? `do <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `przeniósł ten wydatek${reportName ? `z <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `przeniósł ten wydatek do twojej <a href="${reportUrl}">przestrzeni osobistej</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `przeniósł ten raport do przestrzeni roboczej <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `przeniósł ten <a href="${movedReportUrl}">raport</a> do przestrzeni roboczej <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Oczekujący paragon do dopasowania z transakcją kartową',
        pendingMatch: 'Oczekujące dopasowanie',
        pendingMatchWithCreditCardDescription: 'Oczekuje na dopasowanie paragonu do transakcji kartą. Oznacz jako gotówkową, aby anulować.',
        markAsCash: 'Oznacz jako gotówkę',
        routePending: 'Trasa w toku…',
        receiptScanning: () => ({
            one: 'Skanowanie paragonu...',
            other: 'Skanowanie paragonów...',
        }),
        scanMultipleReceipts: 'Skanuj wiele paragonów',
        scanMultipleReceiptsDescription: 'Zrób zdjęcia wszystkim swoim paragonom naraz, a następnie samodzielnie potwierdź szczegóły lub pozwól, abyśmy zrobili to za Ciebie.',
        receiptScanInProgress: 'Skanowanie paragonu w toku',
        receiptScanInProgressDescription: 'Trwa skanowanie paragonu. Sprawdź ponownie później lub wprowadź dane teraz.',
        removeFromReport: 'Usuń z raportu',
        moveToPersonalSpace: 'Przenieś wydatki do swojej przestrzeni osobistej',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Wykryto potencjalne zduplikowane wydatki. Sprawdź duplikaty, aby umożliwić ich przesłanie.'
                : 'Wykryto potencjalnie zduplikowane wydatki. Przejrzyj duplikaty, aby umożliwić zatwierdzenie.',
        receiptIssuesFound: () => ({
            one: 'Znaleziono problem',
            other: 'Znalezione problemy',
        }),
        fieldPending: 'Oczekujące...',
        defaultRate: 'Domyślna stawka',
        receiptMissingDetails: 'Brak danych na paragonie',
        missingAmount: 'Brakująca kwota',
        missingMerchant: 'Brak sprzedawcy',
        receiptStatusTitle: 'Skanowanie…',
        receiptStatusText: 'Tylko ty widzisz ten paragon podczas skanowania. Sprawdź ponownie później lub wprowadź szczegóły teraz.',
        receiptScanningFailed: 'Skanowanie paragonu nie powiodło się. Wprowadź szczegóły ręcznie.',
        transactionPendingDescription: 'Transakcja w toku. Zaksięgowanie może zająć kilka dni.',
        companyInfo: 'Informacje o firmie',
        companyInfoDescription: 'Potrzebujemy jeszcze kilku informacji, zanim będziesz mógł wysłać swoją pierwszą fakturę.',
        yourCompanyName: 'Nazwa Twojej firmy',
        yourCompanyWebsite: 'Strona internetowa Twojej firmy',
        yourCompanyWebsiteNote: 'Jeśli nie masz strony internetowej, możesz zamiast niej podać firmowy profil na LinkedIn lub w mediach społecznościowych.',
        invalidDomainError: 'Wpisałeś nieprawidłową domenę. Aby kontynuować, wprowadź prawidłową domenę.',
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
        settledExpensify: 'Opłacone',
        done: 'Gotowe',
        settledElsewhere: 'Opłacone gdzie indziej',
        individual: 'Indywidualny',
        business: 'Biznes',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} z Expensify` : `Zapłać za pomocą Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako osoba prywatna` : `Zapłać z konta prywatnego`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} z portfela` : `Zapłać portfelem`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Zapłać ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako firma` : `Zapłać z konta firmowego`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Oznacz ${formattedAmount} jako opłacone` : `Oznacz jako zapłacone`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z konta osobistego ${last4Digits}` : `Opłacone z konta prywatnego`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z firmowego konta ${last4Digits}` : `Opłacono z konta firmowego`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Zapłać ${formattedAmount} przez ${policyName}` : `Zapłać przez ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `zapłacono ${amount} z konta bankowego ${last4Digits}` : `zapłacono z konta bankowego ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `zapłacono ${amount ? `${amount} ` : ''} z konta bankowego ${last4Digits} za pomocą <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reguł miejsca pracy</a>`,
        invoicePersonalBank: (lastFour: string) => `Konto osobiste • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Konto firmowe • ${lastFour}`,
        nextStep: 'Następne kroki',
        finished: 'Zakończono',
        flip: 'Odwróć',
        sendInvoice: ({amount}: RequestAmountParams) => `Wyślij fakturę na kwotę ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `wysłano${memo ? `, mówiąc ${memo}` : ''}`,
        automaticallySubmitted: `wysłane przez <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">opóźnij przesyłanie</a>`,
        queuedToSubmitViaDEW: 'w kolejce do przesłania przez niestandardowy przepływ zatwierdzania',
        queuedToApproveViaDEW: 'w kolejce do zatwierdzenia przez niestandardowy przepływ zatwierdzania',
        trackedAmount: (formattedAmount: string, comment?: string) => `śledzenie ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `podziel ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `podziel ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Twój podział ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} jest winien ${amount}${comment ? `dla ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} jest winien:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}zapłacił ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} zapłacił:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} wydał(a) ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} wydał:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} zatwierdził(a):`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} zatwierdził(-a) ${amount}`,
        payerSettled: (amount: number | string) => `zapłacono ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `zapłacono ${amount}. Dodaj konto bankowe, aby otrzymać płatność.`,
        automaticallyApproved: `zatwierdzone przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        approvedAmount: (amount: number | string) => `zatwierdzono ${amount}`,
        approvedMessage: `Zatwierdzone`,
        unapproved: `Niezatwierdzone`,
        automaticallyForwarded: `zatwierdzone przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        forwarded: `Zatwierdzone`,
        rejectedThisReport: 'odrzucił(a) ten raport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `rozpoczął(-ęła) płatność, ale czeka, aż ${submitterDisplayName} doda konto bankowe.`,
        adminCanceledRequest: 'anulował płatność',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `anulował/anulowała płatność ${amount}, ponieważ ${submitterDisplayName} nie włączył/włączyła swojego portfela Expensify w ciągu 30 dni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} dodał konto bankowe. Płatność w wysokości ${amount} została wykonana.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}oznaczono jako opłacone${comment ? `, mówiąc "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''} zapłacono portfelem`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}zapłacono za pomocą Expensify poprzez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady miejsca pracy</a>`,
        noReimbursableExpenses: 'Ten raport ma nieprawidłową kwotę',
        pendingConversionMessage: 'Suma zostanie zaktualizowana, gdy będziesz z powrotem online',
        changedTheExpense: 'zmienił wydatek',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} na ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `ustaw ${translatedChangedField} na ${newMerchant}, co ustawiło kwotę na ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName} (wcześniej ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} na ${newValueToDisplay} (wcześniej ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `zmienił(a) ${translatedChangedField} na ${newMerchant} (wcześniej ${oldMerchant}), co zaktualizowało kwotę na ${newAmountToDisplay} (wcześniej ${oldAmountToDisplay})`,
        basedOnAI: 'na podstawie wcześniejszej aktywności',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `na podstawie <a href="${rulesLink}">zasad przestrzeni roboczej</a>` : 'na podstawie reguły przestrzeni roboczej'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `dla ${comment}` : 'wydatek'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Faktura raport nr ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} wysłano${comment ? `dla ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `przeniósł wydatek z przestrzeni osobistej do ${workspaceName ?? `czat z ${reportName}`}`,
        movedToPersonalSpace: 'przeniesiono wydatek do przestrzeni osobistej',
        error: {
            invalidCategoryLength: 'Nazwa kategorii przekracza 255 znaków. Skróć ją lub wybierz inną kategorię.',
            invalidTagLength: 'Nazwa tagu przekracza 255 znaków. Skróć ją lub wybierz inny tag.',
            invalidAmount: 'Wprowadź poprawną kwotę przed kontynuowaniem',
            invalidDistance: 'Wprowadź prawidłowy dystans, aby kontynuować',
            invalidIntegerAmount: 'Wprowadź pełną kwotę w dolarach, zanim przejdziesz dalej',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maksymalna kwota podatku to ${amount}`,
            invalidSplit: 'Suma podziałów musi być równa całkowitej kwocie',
            invalidSplitParticipants: 'Wprowadź kwotę większą niż zero dla co najmniej dwóch uczestników',
            invalidSplitYourself: 'Wprowadź kwotę różną od zera dla swojego podziału',
            noParticipantSelected: 'Wybierz uczestnika',
            other: 'Nieoczekiwany błąd. Spróbuj ponownie później.',
            genericCreateFailureMessage: 'Nieoczekiwany błąd podczas przesyłania tego wydatku. Spróbuj ponownie później.',
            genericCreateInvoiceFailureMessage: 'Nieoczekiwany błąd podczas wysyłania tej faktury. Spróbuj ponownie później.',
            genericHoldExpenseFailureMessage: 'Nieoczekiwany błąd podczas wstrzymywania tego wydatku. Spróbuj ponownie później.',
            genericUnholdExpenseFailureMessage: 'Nieoczekiwany błąd podczas zdejmowania tego wydatku z wstrzymania. Spróbuj ponownie później.',
            receiptDeleteFailureError: 'Nieoczekiwany błąd podczas usuwania tego paragonu. Spróbuj ponownie później.',
            receiptFailureMessage: '<rbr>Wystąpił błąd podczas przesyłania paragonu. Proszę <a href="download">zapisz paragon</a> i <a href="retry">spróbuj ponownie</a> później.</rbr>',
            receiptFailureMessageShort: 'Wystąpił błąd podczas przesyłania Twojego paragonu.',
            genericDeleteFailureMessage: 'Nieoczekiwany błąd podczas usuwania tego wydatku. Spróbuj ponownie później.',
            genericEditFailureMessage: 'Nieoczekiwany błąd podczas edytowania tego wydatku. Spróbuj ponownie później.',
            genericSmartscanFailureMessage: 'Transakcji brakuje pól',
            duplicateWaypointsErrorMessage: 'Usuń zduplikowane punkty pośrednie',
            atLeastTwoDifferentWaypoints: 'Wprowadź co najmniej dwa różne adresy',
            splitExpenseMultipleParticipantsErrorMessage: 'Wydatek nie może zostać podzielony między przestrzeń roboczą a innych członków. Proszę zaktualizować swój wybór.',
            invalidMerchant: 'Wprowadź poprawnego sprzedawcę',
            atLeastOneAttendee: 'Co najmniej jeden uczestnik musi zostać wybrany',
            invalidQuantity: 'Wprowadź prawidłową ilość',
            quantityGreaterThanZero: 'Ilość musi być większa niż zero',
            invalidSubrateLength: 'Musi istnieć co najmniej jedna podstawka',
            invalidRate: 'Stawka nie jest prawidłowa dla tego przestrzeni roboczej. Wybierz dostępną stawkę z tej przestrzeni roboczej.',
            endDateBeforeStartDate: 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia',
            endDateSameAsStartDate: 'Data zakończenia nie może być taka sama jak data rozpoczęcia',
            manySplitsProvided: `Maksymalna liczba dozwolonych podziałów wynosi ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Zakres dat nie może przekraczać ${CONST.IOU.SPLITS_LIMIT} dni.`,
            negativeDistanceNotAllowed: 'Odczyt końcowy musi być większy niż odczyt początkowy',
            invalidReadings: 'Wprowadź zarówno odczyt początkowy, jak i końcowy',
        },
        dismissReceiptError: 'Odrzuć błąd',
        dismissReceiptErrorConfirmation: 'Uwaga! Odrzucenie tego błędu spowoduje całkowite usunięcie przesłanego paragonu. Czy na pewno chcesz kontynuować?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `rozpoczął rozliczanie. Płatność jest wstrzymana, dopóki ${submitterDisplayName} nie włączy swojego portfela.`,
        enableWallet: 'Włącz portfel',
        hold: 'Wstrzymaj',
        unhold: 'Usuń blokadę',
        holdExpense: () => ({
            one: 'Wstrzymaj wydatek',
            other: 'Wstrzymaj wydatki',
        }),
        unholdExpense: 'Odblokuj wydatek',
        heldExpense: 'wstrzymał ten wydatek',
        unheldExpense: 'odblokował ten wydatek',
        moveUnreportedExpense: 'Przenieś nierozliczony wydatek',
        addUnreportedExpense: 'Dodaj nieraportowany wydatek',
        selectUnreportedExpense: 'Wybierz co najmniej jeden wydatek, aby dodać go do raportu.',
        emptyStateUnreportedExpenseTitle: 'Brak nierozliczonych wydatków',
        emptyStateUnreportedExpenseSubtitle: 'Wygląda na to, że nie masz żadnych nierozliczonych wydatków. Spróbuj utworzyć jeden poniżej.',
        addUnreportedExpenseConfirm: 'Dodaj do raportu',
        newReport: 'Nowy raport',
        explainHold: () => ({
            one: 'Wyjaśnij, dlaczego wstrzymujesz ten wydatek.',
            other: 'Wyjaśnij, dlaczego wstrzymujesz te wydatki.',
        }),
        retracted: 'Wycofano',
        retract: 'Wycofaj',
        reopened: 'Ponownie otwarte',
        reopenReport: 'Otwórz ponownie raport',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Ten raport został już wyeksportowany do ${connectionName}. Wprowadzenie zmian może prowadzić do rozbieżności danych. Czy na pewno chcesz ponownie otworzyć ten raport?`,
        reason: 'Powód',
        holdReasonRequired: 'Powód jest wymagany podczas wstrzymywania.',
        expenseWasPutOnHold: 'Wydatek został wstrzymany',
        expenseOnHold: 'Ten wydatek został wstrzymany. Sprawdź komentarze, aby poznać kolejne kroki.',
        expensesOnHold: 'Wszystkie wydatki zostały wstrzymane. Sprawdź komentarze, aby poznać kolejne kroki.',
        expenseDuplicate: 'Ten wydatek ma szczegóły podobne do innego. Aby kontynuować, przejrzyj duplikaty.',
        someDuplicatesArePaid: 'Niektóre z tych duplikatów zostały już zatwierdzone lub opłacone.',
        reviewDuplicates: 'Przejrzyj duplikaty',
        keepAll: 'Zachowaj wszystko',
        confirmApprove: 'Potwierdź kwotę zatwierdzenia',
        confirmApprovalAmount: 'Zatwierdzaj tylko zgodne wydatki lub zatwierdź cały raport.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz go zatwierdzić?',
            other: 'Te wydatki są wstrzymane. Czy mimo to chcesz je zatwierdzić?',
        }),
        confirmPay: 'Potwierdź kwotę płatności',
        confirmPayAmount: 'Zapłać kwotę, która nie jest wstrzymana, lub opłać cały raport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz zapłacić?',
            other: 'Te wydatki są wstrzymane. Czy mimo to chcesz zapłacić?',
        }),
        payOnly: 'Tylko zapłać',
        approveOnly: 'Zatwierdź tylko',
        holdEducationalTitle: 'Czy powinieneś zatrzymać ten wydatek?',
        whatIsHoldExplain: 'Wstrzymanie wydatku działa jak naciśnięcie „pauzy” na wydatek, dopóki nie będziesz gotowy, aby go złożyć.',
        holdIsLeftBehind: 'Wstrzymane wydatki pozostają nierozliczone, nawet jeśli złożysz cały raport.',
        unholdWhenReady: 'Zdejmij wstrzymanie z wydatków, gdy będziesz gotowy(-a) je złożyć.',
        changePolicyEducational: {
            title: 'Przeniosłeś ten raport!',
            description: 'Sprawdź ponownie te elementy, które zwykle się zmieniają podczas przenoszenia raportów do nowego workspace.',
            reCategorize: '<strong>Zmodyfikuj kategorie wydatków</strong>, aby były zgodne z zasadami przestrzeni roboczej.',
            workflows: 'Ten raport może teraz podlegać innemu <strong>procesowi zatwierdzania.</strong>',
        },
        changeWorkspace: 'Zmień przestrzeń roboczą',
        set: 'Ustaw',
        changed: 'Zmieniono',
        removed: 'Usunięto',
        transactionPending: 'Transakcja w toku.',
        chooseARate: 'Wybierz stawkę zwrotu kosztów za milę lub kilometr dla przestrzeni roboczej',
        unapprove: 'Cofnij zatwierdzenie',
        unapproveReport: 'Cofnij zatwierdzenie raportu',
        headsUp: 'Uwaga!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Ten raport został już wyeksportowany do ${accountingIntegration}. Zmiana może prowadzić do rozbieżności w danych. Czy na pewno chcesz cofnąć zatwierdzenie tego raportu?`,
        reimbursable: 'podlegające zwrotowi',
        nonReimbursable: 'nierefundowalne',
        bookingPending: 'Ta rezerwacja jest oczekująca',
        bookingPendingDescription: 'Ta rezerwacja jest w toku, ponieważ nie została jeszcze opłacona.',
        bookingArchived: 'Ta rezerwacja jest zarchiwizowana',
        bookingArchivedDescription: 'Rezerwacja została zarchiwizowana, ponieważ data podróży już minęła. W razie potrzeby dodaj wydatek na ostateczną kwotę.',
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
            other: (count: number) => `Ostatni dzień: ${count.toFixed(2)} godziny`,
        }),
        tripLengthText: () => ({
            one: `Podróż: 1 pełny dzień`,
            other: (count: number) => `Podróż: ${count} pełne dni`,
        }),
        dates: 'Daty',
        rates: 'Stawki',
        submitsTo: ({name}: SubmitsToParams) => `Wysyła do ${name}`,
        reject: {
            educationalTitle: 'Czy powinieneś zatrzymać czy odrzucić?',
            educationalText: 'Jeśli nie jesteś gotowy, aby zatwierdzić lub opłacić wydatek, możesz go wstrzymać lub odrzucić.',
            holdExpenseTitle: 'Wstrzymaj wydatek, aby poprosić o więcej szczegółów przed zatwierdzeniem lub płatnością.',
            approveExpenseTitle: 'Zatwierdzaj inne wydatki, podczas gdy wstrzymane wydatki pozostają przypisane do Ciebie.',
            heldExpenseLeftBehindTitle: 'Zatrzymane wydatki są pomijane, gdy zatwierdzasz cały raport.',
            rejectExpenseTitle: 'Odrzuć wydatek, którego nie zamierzasz zatwierdzić ani opłacić.',
            reasonPageTitle: 'Odrzuć wydatek',
            reasonPageDescription: 'Wyjaśnij, dlaczego odrzucasz ten wydatek.',
            rejectReason: 'Powód odrzucenia',
            markAsResolved: 'Oznacz jako rozwiązane',
            rejectedStatus: 'Ten wydatek został odrzucony. Oczekujemy, aż naprawisz problemy i oznaczysz go jako rozwiązany, aby umożliwić wysłanie.',
            reportActions: {
                rejectedExpense: 'odrzucił ten wydatek',
                markedAsResolved: 'oznaczono powód odrzucenia jako rozwiązany',
            },
        },
        moveExpenses: () => ({one: 'Przenieś wydatek', other: 'Przenieś wydatki'}),
        moveExpensesError: 'Nie możesz przenosić wydatków do raportów w innych obszarach roboczych, ponieważ stawki diety mogą się różnić między obszarami roboczymi.',
        changeApprover: {
            title: 'Zmień akceptującego',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Wybierz opcję, aby zmienić osobę zatwierdzającą ten raport. (Zaktualizuj swoje <a href="${workflowSettingLink}">ustawienia przestrzeni roboczej</a>, aby na stałe zmienić osobę zatwierdzającą dla wszystkich raportów.)`,
            changedApproverMessage: (managerID: number) => `zmieniono zatwierdzającego na <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Dodaj osobę zatwierdzającą',
                addApproverSubtitle: 'Dodaj dodatkowego akceptującego do istniejącego procesu zatwierdzania.',
                bypassApprovers: 'Pomiń zatwierdzających',
                bypassApproversSubtitle: 'Przypisz siebie jako ostatecznego akceptującego i pomiń pozostałych akceptujących.',
            },
            addApprover: {
                subtitle: 'Wybierz dodatkową osobę zatwierdzającą ten raport, zanim uruchomimy dalszą część procesu akceptacji.',
            },
        },
        chooseWorkspace: 'Wybierz przestrzeń roboczą',
        date: 'Data',
        splitDates: 'Podziel daty',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} do ${endDate} (${count} dni)`,
        splitByDate: 'Podziel według daty',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `raport przekazany do ${to} z powodu niestandardowego procesu zatwierdzania`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'godzina' : 'godziny'} @ ${rate} / godzinę`,
            hrs: 'godz.',
            hours: 'Godziny',
            ratePreview: (rate: string) => `${rate} / godzina`,
            amountTooLargeError: 'Całkowita kwota jest zbyt wysoka. Zmniejsz liczbę godzin lub obniż stawkę.',
        },
        correctDistanceRateError: 'Napraw błąd stawki za dystans i spróbuj ponownie.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>Wyjaśnij</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);
            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;
                if (key === 'reimbursable') {
                    return value ? 'oznaczył wydatek jako „podlegający zwrotowi”' : 'oznaczył wydatek jako „niepodlegający zwrotowi”';
                }
                if (key === 'billable') {
                    return value ? 'oznaczył wydatek jako „refakturowalny”' : 'oznaczył wydatek jako „niepodlegający refakturowaniu”';
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
            header: 'Scal wydatki',
            noEligibleExpenseFound: 'Nie znaleziono kwalifikujących się wydatków',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Nie masz żadnych wydatków, które można połączyć z tym. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Dowiedz się więcej</a> o kwalifikujących się wydatkach.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Wybierz <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">kwalifikujący się wydatek</a>, aby scalić go z <strong>${reportName}</strong>.`,
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
                const article = StringUtils.startsWithVowel(field) ? 'jeden' : 'a';
                return `Wybierz ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Wybierz uczestników',
            selectAllDetailsError: 'Zaznacz wszystkie szczegóły przed kontynuowaniem.',
        },
        confirmationPage: {
            header: 'Potwierdź szczegóły',
            pageTitle: 'Potwierdź dane, które zachowujesz. Dane, których nie zachowasz, zostaną usunięte.',
            confirmButton: 'Scal wydatki',
        },
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
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Ukryte',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Numer nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny w wiadomości SMS.',
        emailHasNotBeenValidated: 'Adres e‑mail nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny w wiadomości SMS.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Prześlij zdjęcie',
        removePhoto: 'Usuń zdjęcie',
        editImage: 'Edytuj zdjęcie',
        viewPhoto: 'Zobacz zdjęcie',
        imageUploadFailed: 'Przesyłanie obrazu nie powiodło się',
        deleteWorkspaceError: 'Przepraszamy, wystąpił nieoczekiwany problem podczas usuwania awatara Twojego workspace’u',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Wybrany obraz przekracza maksymalny rozmiar przesyłania wynoszący ${maxUploadSizeInMB} MB.`,
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
        backdropLabel: 'Tło okna modalnego',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
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
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> prześlesz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> prześle wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na zatwierdzenie wydatków przez administratora.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Nie są wymagane dalsze działania!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> dodasz konto bankowe.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> doda konto bankowe.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na dodanie rachunku bankowego przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `o ${eta}` : ` ${eta}`;
                }
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Czekamy, aż <strong>Twoje</strong> wydatki zostaną automatycznie przesłane${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż wydatki użytkownika <strong>${actor}</strong> zostaną automatycznie przesłane${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na automatyczne przesłanie wydatków administratora${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> naprawisz problemy.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> naprawi problemy.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na administratora, aby naprawił problemy.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> zatwierdzisz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie na zatwierdzenie wydatków przez <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na zatwierdzenie wydatków przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> wyeksportujesz ten raport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> wyeksportuje ten raport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na eksportowanie tego raportu przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> zapłacisz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie na <strong>${actor}</strong>, aby opłacił wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na rozliczenie wydatków przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> zakończysz konfigurowanie firmowego konta bankowego.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> zakończy zakładanie firmowego konta bankowego.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na administratora, aby dokończył konfigurowanie firmowego konta bankowego.`;
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
                `Ups! Wygląda na to, że wysyłasz zgłoszenie do <strong>siebie</strong>. Zatwierdzanie własnych raportów jest <strong>zabronione</strong> w Twoim obszarze roboczym. Prześlij ten raport do kogoś innego lub skontaktuj się z administratorem, aby zmienić osobę, do której wysyłasz zgłoszenia.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'wkrótce',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'później dzisiaj',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'w niedzielę',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '1. i 16. dnia każdego miesiąca',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'w ostatnim dniu roboczym miesiąca',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'w ostatnim dniu miesiąca',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'na końcu Twojej podróży',
        },
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Preferowane zaimki',
        selectYourPronouns: 'Wybierz swoje zaimki',
        selfSelectYourPronoun: 'Samodzielnie wybierz swój zaimek',
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
            title: 'Publiczne',
            subtitle: 'Te szczegóły są wyświetlane w Twoim publicznym profilu. Każdy może je zobaczyć.',
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
        isShownOnProfile: 'Twoje zaimki są widoczne w Twoim profilu.',
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
        removeAreYouSure: 'Czy na pewno chcesz usunąć tę metodę kontaktu? Tej operacji nie można cofnąć.',
        failedNewContact: 'Nie udało się dodać tej metody kontaktu.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Nie udało się wysłać nowego magicznego kodu. Proszę chwilę poczekać i spróbować ponownie.',
            validateSecondaryLogin: 'Nieprawidłowy lub niepoprawny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
            deleteContactMethod: 'Nie udało się usunąć metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            setDefaultContactMethod: 'Nie udało się ustawić nowej domyślnej metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            addContactMethod: 'Nie udało się dodać tej metody kontaktu. Skontaktuj się z Concierge, aby uzyskać pomoc.',
            enteredMethodIsAlreadySubmitted: 'Ta metoda kontaktu już istnieje',
            passwordRequired: 'wymagane hasło',
            contactMethodRequired: 'Metoda kontaktu jest wymagana',
            invalidContactMethod: 'Nieprawidłowa metoda kontaktu',
        },
        newContactMethod: 'Nowa metoda kontaktu',
        goBackContactMethods: 'Wróć do metod kontaktu',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Coś',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'On / Jego / Jemu',
        heHimHisTheyThemTheirs: 'On / Jego / Jemu / Oni / Ich / Ich',
        sheHerHers: 'Ona / Ją / Jej',
        sheHerHersTheyThemTheirs: 'Ona / Ją / Jej / Oni / Ich / Ich',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Osoba / Osoby',
        theyThemTheirs: 'Oni / Ich / Ich',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Zwracaj się do mnie po imieniu',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Wyświetlana nazwa',
        isShownOnProfile: 'Twoja nazwa wyświetlana jest widoczna na Twoim profilu.',
    },
    timezonePage: {
        timezone: 'Strefa czasowa',
        isShownOnProfile: 'Twoja strefa czasowa jest wyświetlana w Twoim profilu.',
        getLocationAutomatically: 'Automatycznie ustalaj Twoją lokalizację',
    },
    updateRequiredView: {
        updateRequired: 'Wymagana aktualizacja',
        pleaseInstall: 'Zaktualizuj proszę do najnowszej wersji New Expensify',
        pleaseInstallExpensifyClassic: 'Zainstaluj najnowszą wersję Expensify',
        toGetLatestChanges: 'Na urządzeniu mobilnym pobierz i zainstaluj najnowszą wersję. W przeglądarce odśwież stronę.',
        newAppNotAvailable: 'Nowa aplikacja Expensify nie jest już dostępna.',
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
                '<muted-text>Użyj poniższych narzędzi, aby pomóc rozwiązywać problemy z działaniem Expensify. Jeśli napotkasz jakiekolwiek problemy, <concierge-link>zgłoś błąd</concierge-link>.</muted-text>',
            confirmResetDescription: 'Wszystkie niewysłane szkice wiadomości zostaną utracone, ale reszta Twoich danych jest bezpieczna.',
            resetAndRefresh: 'Resetuj i odśwież',
            clientSideLogging: 'Rejestrowanie po stronie klienta',
            noLogsToShare: 'Brak dzienników do udostępnienia',
            useProfiling: 'Użyj profilowania',
            profileTrace: 'Ślad profilowania',
            results: 'Wyniki',
            releaseOptions: 'Opcje wydania',
            testingPreferences: 'Preferencje testowe',
            useStagingServer: 'Użyj serwera testowego',
            forceOffline: 'Wymuś tryb offline',
            simulatePoorConnection: 'Symuluj słabe połączenie internetowe',
            simulateFailingNetworkRequests: 'Symuluj nieudane żądania sieciowe',
            authenticationStatus: 'Status uwierzytelniania',
            deviceCredentials: 'Poświadczenia urządzenia',
            invalidate: 'Unieważnij',
            destroy: 'Zniszcz',
            maskExportOnyxStateData: 'Maskuj wrażliwe dane członków podczas eksportu stanu Onyx',
            exportOnyxState: 'Eksportuj stan Onyx',
            importOnyxState: 'Importuj stan Onyx',
            testCrash: 'Test awarii',
            resetToOriginalState: 'Przywróć do stanu początkowego',
            usingImportedState: 'Używasz zaimportowanego stanu. Naciśnij tutaj, aby go wyczyścić.',
            debugMode: 'Tryb debugowania',
            invalidFile: 'Nieprawidłowy plik',
            invalidFileDescription: 'Plik, który próbujesz zaimportować, jest nieprawidłowy. Spróbuj ponownie.',
            invalidateWithDelay: 'Unieważnij z opóźnieniem',
            recordTroubleshootData: 'Rejestruj dane diagnostyczne',
            softKillTheApp: 'Delikatnie zakończ działanie aplikacji',
            kill: 'Zakończ',
            sentryDebug: 'Debugowanie Sentry',
            sentryDebugDescription: 'Rejestruj żądania Sentry w konsoli',
            sentryHighlightedSpanOps: 'Nazwy wyróżnionych spanów',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, navigation, ui.load',
            leftHandNavCache: 'Pamięć podręczna lewego panelu nawigacyjnego',
            clearleftHandNavCache: 'Wyczyść',
        },
        debugConsole: {
            saveLog: 'Zapisz log',
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
        readTheTermsAndPrivacy: `<muted-text-micro>Przeczytaj <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politykę prywatności</a>.</muted-text-micro>`,
        help: 'Pomoc',
        whatIsNew: 'Co nowego',
        accountSettings: 'Ustawienia konta',
        account: 'Konto',
        general: 'Ogólne',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Zamknij konto',
        reasonForLeavingPrompt: 'Nie chcielibyśmy, żebyś odchodził! Czy mógłbyś powiedzieć nam, dlaczego, abyśmy mogli się poprawić?',
        enterMessageHere: 'Wpisz tutaj wiadomość',
        closeAccountWarning: 'Zamknięcie Twojego konta jest nieodwracalne.',
        closeAccountPermanentlyDeleteData: 'Czy na pewno chcesz usunąć swoje konto? Spowoduje to trwałe usunięcie wszystkich nierozliczonych wydatków.',
        enterDefaultContactToConfirm: 'Wprowadź swoją domyślną metodę kontaktu, aby potwierdzić, że chcesz zamknąć konto. Twoja domyślna metoda kontaktu to:',
        enterDefaultContact: 'Wprowadź domyślną metodę kontaktu',
        defaultContact: 'Domyślna metoda kontaktu:',
        enterYourDefaultContactMethod: 'Podaj domyślną metodę kontaktu, aby zamknąć swoje konto.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Połącz konta',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Wprowadź konto, które chcesz połączyć z <strong>${login}</strong>.`,
            notReversibleConsent: 'Rozumiem, że jest to nieodwracalne',
        },
        accountValidate: {
            confirmMerge: 'Czy na pewno chcesz scalić konta?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Łączenie Twoich kont jest nieodwracalne i spowoduje utratę wszystkich niewysłanych wydatków dla <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Aby kontynuować, wprowadź magiczny kod wysłany na <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Nieprawidłowy lub niepoprawny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
                fallback: 'Coś poszło nie tak. Spróbuj ponownie później.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konta zostały połączone!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Pomyślnie scalono wszystkie dane z <strong>${from}</strong> do <strong>${to}</strong>. Od teraz możesz używać dowolnego logowania dla tego konta.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Pracujemy nad tym',
            limitedSupport: 'Nie obsługujemy jeszcze łączenia kont w nowym Expensify. Wykonaj tę akcję w Expensify Classic.',
            reachOutForHelp: '<muted-text><centered-text>Jeśli masz jakieś pytania, śmiało <concierge-link>skontaktuj się z Concierge</concierge-link>!</centered-text></muted-text>',
            goToExpensifyClassic: 'Przejdź do Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić <strong>${email}</strong>, ponieważ jest kontrolowany przez <strong>${email.split('@').at(1) ?? ''}</strong>. Prosimy <concierge-link>skontaktować się z Concierge</concierge-link> w celu uzyskania pomocy.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić konta <strong>${email}</strong> z innymi kontami, ponieważ administrator Twojej domeny ustawił je jako Twoje główne logowanie. Zamiast tego połącz inne konta z tym kontem.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Nie można scalić kont, ponieważ <strong>${email}</strong> ma włączone uwierzytelnianie dwuskładnikowe (2FA). Wyłącz 2FA dla <strong>${email}</strong> i spróbuj ponownie.</centered-text></muted-text>`,
            learnMore: 'Dowiedz się więcej o łączeniu kont.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić <strong>${email}</strong>, ponieważ jest zablokowany. <concierge-link>Skontaktuj się z Concierge</concierge-link>, aby uzyskać pomoc.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Nie można połączyć kont, ponieważ <strong>${email}</strong> nie ma konta w Expensify. Zamiast tego prosimy <a href="${contactMethodLink}">dodać go jako metodę kontaktu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie można scalić konta <strong>${email}</strong> z innymi kontami. Zamiast tego scal inne konta z tym kontem.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić kont z <strong>${email}</strong>, ponieważ to konto jest właścicielem rozliczonej relacji rozliczeniowej.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Spróbuj ponownie później',
            description: 'Podjęto zbyt wiele prób połączenia kont. Spróbuj ponownie później.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Nie można scalić z innymi kontami, ponieważ to konto nie zostało zweryfikowane. Zweryfikuj konto i spróbuj ponownie.',
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
        domainAdminsDescription: 'Dla administratorów domen: To także wstrzymuje wszystkie działania związane z kartą Expensify oraz akcje administracyjne w Twoich domenach.',
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
        twoFactorAuthEnabled: 'Uwierzytelnianie dwuskładnikowe włączone',
        whatIsTwoFactorAuth:
            'Uwierzytelnianie dwuskładnikowe (2FA) pomaga utrzymać bezpieczeństwo Twojego konta. Podczas logowania będziesz musiał(-a) wprowadzić kod wygenerowany przez wybraną aplikację uwierzytelniającą.',
        disableTwoFactorAuth: 'Wyłącz uwierzytelnianie dwuskładnikowe',
        explainProcessToRemove: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod z aplikacji uwierzytelniającej.',
        explainProcessToRemoveWithRecovery: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod odzyskiwania.',
        disabled: 'Uwierzytelnianie dwuskładnikowe jest teraz wyłączone',
        noAuthenticatorApp: 'Nie będziesz już potrzebować aplikacji uwierzytelniającej, aby zalogować się do Expensify.',
        stepCodes: 'Kody odzyskiwania',
        keepCodesSafe: 'Zachowaj te kody odzyskiwania w bezpiecznym miejscu!',
        codesLoseAccess: dedent(`
            Jeśli utracisz dostęp do aplikacji uwierzytelniającej i nie będziesz mieć tych kodów, utracisz dostęp do swojego konta.

            Uwaga: Skonfigurowanie uwierzytelniania dwuskładnikowego spowoduje wylogowanie Cię ze wszystkich innych aktywnych sesji.
        `),
        errorStepCodes: 'Skopiuj lub pobierz kody przed kontynuowaniem',
        stepVerify: 'Zweryfikuj',
        scanCode: 'Zeskanuj kod QR za pomocą swojego',
        authenticatorApp: 'aplikacja uwierzytelniająca',
        addKey: 'Lub dodaj ten tajny klucz do swojej aplikacji uwierzytelniającej:',
        enterCode: 'Następnie wprowadź sześciocyfrowy kod wygenerowany przez swoją aplikację uwierzytelniającą.',
        stepSuccess: 'Zakończono',
        enabled: 'Uwierzytelnianie dwuskładnikowe włączone',
        congrats: 'Gratulacje! Teraz masz dodatkowe zabezpieczenie.',
        copy: 'Kopiuj',
        disable: 'Wyłącz',
        enableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe',
        pleaseEnableTwoFactorAuth: 'Proszę włączyć uwierzytelnianie dwuskładnikowe.',
        twoFactorAuthIsRequiredDescription: 'Ze względów bezpieczeństwa Xero wymaga uwierzytelniania dwuskładnikowego, aby połączyć integrację.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Wymagane uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredForAdminsTitle: 'Włącz uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredXero: 'Twoje połączenie księgowe z Xero wymaga uwierzytelniania dwuskładnikowego.',
        twoFactorAuthIsRequiredCompany: 'Twoja firma wymaga uwierzytelniania dwuskładnikowego.',
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
        personalNoteMessage: 'Zapisuj notatki na temat tej rozmowy tutaj. Jesteś jedyną osobą, która może dodawać, edytować lub przeglądać te notatki.',
        sharedNoteMessage: 'Zapisuj tutaj notatki dotyczące tej rozmowy. Pracownicy Expensify i inni członkowie z domeny team.expensify.com mogą je przeglądać.',
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
        securityCode: 'Kod zabezpieczający',
        changeBillingCurrency: 'Zmień walutę rozliczeniową',
        changePaymentCurrency: 'Zmień walutę płatności',
        paymentCurrency: 'Waluta płatności',
        paymentCurrencyDescription: 'Wybierz standardową walutę, na którą mają być przeliczane wszystkie wydatki osobiste',
        note: `Uwaga: Zmiana waluty płatności może mieć wpływ na to, ile zapłacisz za Expensify. Zapoznaj się z naszą <a href="${CONST.PRICING}">stroną z cennikiem</a>, aby poznać pełne szczegóły.`,
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
            addressCity: 'Proszę wprowadzić miasto',
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
            addressCity: 'Proszę wprowadzić miasto',
            genericFailureMessage: 'Wystąpił błąd podczas dodawania Twojej karty. Spróbuj ponownie.',
            password: 'Wprowadź swoje hasło do Expensify',
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
            notOwnerOfBankAccount: 'Wystąpił błąd podczas ustawiania tego konta bankowego jako Twojej domyślnej metody płatności',
            invalidBankAccount: 'To konto bankowe jest tymczasowo zawieszone',
            notOwnerOfFund: 'Wystąpił błąd podczas ustawiania tej karty jako domyślnej metody płatności',
            setDefaultFailure: 'Coś poszło nie tak. Skontaktuj się z Concierge, aby uzyskać dalszą pomoc.',
        },
        addBankAccountFailure: 'Wystąpił nieoczekiwany błąd podczas próby dodania Twojego konta bankowego. Spróbuj ponownie.',
        getPaidFaster: 'Otrzymuj płatności szybciej',
        addPaymentMethod: 'Dodaj metodę płatności, aby wysyłać i odbierać płatności bezpośrednio w aplikacji.',
        getPaidBackFaster: 'Otrzymuj zwroty szybciej',
        secureAccessToYourMoney: 'Zabezpieczony dostęp do Twoich pieniędzy',
        receiveMoney: 'Otrzymuj pieniądze w swojej lokalnej walucie',
        expensifyWallet: 'Portfel Expensify (Beta)',
        sendAndReceiveMoney: 'Wysyłaj i otrzymuj pieniądze ze znajomymi. Tylko konta bankowe w USA.',
        enableWallet: 'Włącz portfel',
        addBankAccountToSendAndReceive: 'Dodaj konto bankowe, aby wysyłać lub otrzymywać płatności.',
        addDebitOrCreditCard: 'Dodaj kartę debetową lub kredytową',
        assignedCards: 'Przypisane karty',
        assignedCardsDescription: 'Transakcje z tych kart synchronizują się automatycznie.',
        expensifyCard: 'Karta Expensify',
        walletActivationPending: 'Przeglądamy Twoje informacje. Sprawdź ponownie za kilka minut!',
        walletActivationFailed: 'Niestety Twojego portfela nie można teraz włączyć. Skontaktuj się z Concierge, aby uzyskać dalszą pomoc.',
        addYourBankAccount: 'Dodaj swoje konto bankowe',
        addBankAccountBody: 'Połączmy Twoje konto bankowe z Expensify, aby wysyłanie i odbieranie płatności bezpośrednio w aplikacji było łatwiejsze niż kiedykolwiek.',
        chooseYourBankAccount: 'Wybierz swoje konto bankowe',
        chooseAccountBody: 'Upewnij się, że wybierasz właściwą opcję.',
        confirmYourBankAccount: 'Potwierdź swoje konto bankowe',
        personalBankAccounts: 'Prywatne konta bankowe',
        businessBankAccounts: 'Firmowe konta bankowe',
        shareBankAccount: 'Udostępnij konto bankowe',
        bankAccountShared: 'Konto bankowe udostępnione',
        shareBankAccountTitle: 'Wybierz administratorów, z którymi chcesz udostępnić to konto bankowe:',
        shareBankAccountSuccess: 'Konto bankowe udostępnione!',
        shareBankAccountSuccessDescription: 'Wybrani administratorzy otrzymają wiadomość z potwierdzeniem od Concierge.',
        shareBankAccountFailure: 'Wystąpił nieoczekiwany błąd podczas próby udostępnienia konta bankowego. Spróbuj ponownie.',
        shareBankAccountEmptyTitle: 'Brak dostępnych administratorów',
        shareBankAccountEmptyDescription: 'Brak administratorów obszaru roboczego, z którymi można udostępnić to konto bankowe.',
        shareBankAccountNoAdminsSelected: 'Wybierz administratora przed kontynuowaniem',
        unshareBankAccount: 'Anuluj udostępnianie konta bankowego',
        unshareBankAccountDescription: 'Wszyscy poniżej mają dostęp do tego konta bankowego. Możesz go usunąć w dowolnym momencie. Nadal będziemy realizować wszystkie płatności w toku.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} utraci dostęp do tego firmowego konta bankowego. Nadal będziemy realizować wszystkie płatności w toku.`,
        reachOutForHelp: 'Jest ono używane z kartą Expensify. <concierge-link>Skontaktuj się z Concierge</concierge-link>, jeśli chcesz je anulować.',
        unshareErrorModalTitle: 'Nie można anulować udostępniania konta bankowego',
        deleteCard: 'Usuń kartę',
        deleteCardConfirmation:
            'Wszystkie niewysłane transakcje kartą, w tym znajdujące się w otwartych raportach, zostaną usunięte. Czy na pewno chcesz usunąć tę kartę? Nie można cofnąć tej czynności.',
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
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Możesz wydać do ${formattedLimit} na tej karcie, a następnie zostanie ona dezaktywowana.`,
        },
        monthlyLimit: {
            name: 'Miesięczny limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Możesz wydawać do ${formattedLimit} miesięcznie na tej karcie. Limit zostanie zresetowany pierwszego dnia każdego miesiąca kalendarzowego.`,
        },
        virtualCardNumber: 'Numer wirtualnej karty',
        travelCardCvv: 'CVV karty podróżnej',
        physicalCardNumber: 'Numer fizycznej karty',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Zamów kartę fizyczną',
        reportFraud: 'Zgłoś oszustwo dotyczące karty wirtualnej',
        reportTravelFraud: 'Zgłoś oszustwo związane z kartą podróżną',
        reviewTransaction: 'Przejrzyj transakcję',
        suspiciousBannerTitle: 'Podejrzana transakcja',
        suspiciousBannerDescription: 'Zauważyliśmy podejrzane transakcje na Twojej karcie. Stuknij poniżej, aby je sprawdzić.',
        cardLocked: 'Twoja karta jest tymczasowo zablokowana, podczas gdy nasz zespół sprawdza konto Twojej firmy.',
        markTransactionsAsReimbursable: 'Oznacz transakcje jako podlegające zwrotowi',
        markTransactionsDescription: 'Gdy ta opcja jest włączona, transakcje zaimportowane z tej karty są domyślnie oznaczane jako podlegające zwrotowi.',
        cardDetails: {
            cardNumber: 'Numer wirtualnej karty',
            expiration: 'Wygaśnięcie',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Pokaż szczegóły',
            revealCvv: 'Pokaż kod CVV',
            copyCardNumber: 'Skopiuj numer karty',
            updateAddress: 'Zaktualizuj adres',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Dodano do portfela ${platform}`,
        cardDetailsLoadingFailure: 'Wystąpił błąd podczas ładowania szczegółów karty. Sprawdź swoje połączenie internetowe i spróbuj ponownie.',
        validateCardTitle: 'Upewnijmy się, że to naprawdę Ty',
        enterMagicCode: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby wyświetlić szczegóły karty. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Prosimy <a href="${missingDetailsLink}">dodaj swoje dane osobowe</a>, a następnie spróbuj ponownie.`,
        unexpectedError: 'Wystąpił błąd podczas pobierania szczegółów Twojej karty Expensify. Spróbuj ponownie.',
        cardFraudAlert: {
            confirmButtonText: 'Tak, zgadzam się',
            reportFraudButtonText: 'Nie, to nie ja.',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `usunął podejrzaną aktywność i ponownie aktywował kartę x${cardLastFour}. Wszystko gotowe, by dalej rozliczać wydatki!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `dezaktywował(-a) kartę kończącą się na ${cardLastFour}`,
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
            }) => `wykryto podejrzaną aktywność na karcie kończącej się na ${cardLastFour}. Czy rozpoznajesz tę opłatę?

${amount} dla ${merchant} - ${date}`,
        },
        csvCardDescription: 'Import CSV',
    },
    workflowsPage: {
        workflowTitle: 'Wydatki',
        workflowDescription: 'Skonfiguruj proces od momentu poniesienia wydatku, obejmujący akceptację i płatność.',
        submissionFrequency: 'Zgłoszenia',
        submissionFrequencyDescription: 'Wybierz niestandardowy harmonogram przesyłania wydatków.',
        submissionFrequencyDateOfMonth: 'Dzień miesiąca',
        disableApprovalPromptDescription: 'Wyłączenie zatwierdzeń usunie wszystkie istniejące przepływy pracy zatwierdzania.',
        addApprovalsTitle: 'Zatwierdzenia',
        addApprovalButton: 'Dodaj proces zatwierdzania',
        addApprovalTip: 'Ten domyślny przepływ pracy ma zastosowanie do wszystkich członków, chyba że istnieje bardziej szczegółowy przepływ pracy.',
        approver: 'Akceptujący',
        addApprovalsDescription: 'Wymagaj dodatkowej akceptacji przed autoryzacją płatności.',
        makeOrTrackPaymentsTitle: 'Płatności',
        makeOrTrackPaymentsDescription: 'Dodaj upoważnioną osobę dokonującą płatności w Expensify lub śledź płatności dokonane gdzie indziej.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>W tym obszarze roboczym włączono niestandardowy proces zatwierdzania. Aby przejrzeć lub zmienić ten proces, skontaktuj się ze swoim <account-manager-link>Opiekunem klienta</account-manager-link> lub <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>W tej przestrzeni roboczej włączono niestandardowy proces zatwierdzania. Aby przejrzeć lub zmienić ten proces, skontaktuj się z <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wybierz, jak długo Expensify ma czekać przed udostępnieniem wydatków bez błędów.',
        },
        frequencyDescription: 'Wybierz, jak często wydatki mają być wysyłane automatycznie, lub ustaw je na tryb ręczny',
        frequencies: {
            instant: 'Natychmiast',
            weekly: 'Tygodniowo',
            monthly: 'Miesięcznie',
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
                other: '.',
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
        approverInMultipleWorkflows: 'Ten członek należy już do innego procesu zatwierdzania. Wszelkie zmiany wprowadzone tutaj będą widoczne także tam.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> już zatwierdza raporty dla <strong>${name2}</strong>. Wybierz innego akceptującego, aby uniknąć zapętlenia obiegu.`,
        emptyContent: {
            title: 'Brak członków do wyświetlenia',
            expensesFromSubtitle: 'Wszyscy członkowie przestrzeni roboczej należą już do istniejącego obiegu zatwierdzania.',
            approverSubtitle: 'Wszyscy zatwierdzający należą do istniejącego przepływu pracy.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Nie udało się zmienić częstotliwości wysyłania. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
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
        deletePrompt: 'Czy na pewno chcesz usunąć ten proces zatwierdzania? Wszyscy członkowie będą od tej pory korzystać z domyślnego procesu.',
    },
    workflowsExpensesFromPage: {
        title: 'Wydatki z',
        header: 'Gdy następujący członkowie składają wydatki:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Nie można było zmienić osoby zatwierdzającej. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        title: 'Wyślij do tego członka do zatwierdzenia:',
        description: 'Ta osoba zatwierdzi wydatki.',
    },
    workflowsApprovalLimitPage: {
        title: 'Zatwierdzający',
        header: '(Opcjonalnie) Czy chcesz dodać limit zatwierdzenia?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Dodaj innego zatwierdzającego, gdy <strong>${approverName}</strong> jest zatwierdzającym, a raport przekracza poniższą kwotę:`
                : 'Dodaj innego zatwierdzającego, gdy raport przekracza poniższą kwotę:',
        reportAmountLabel: 'Kwota raportu',
        additionalApproverLabel: 'Dodatkowy zatwierdzający',
        skip: 'Pomiń',
        next: 'Dalej',
        removeLimit: 'Usuń limit',
        enterAmountError: 'Wprowadź prawidłową kwotę',
        enterApproverError: 'Zatwierdzający jest wymagany, gdy ustawisz limit raportu',
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
        title: 'Zgłoś oszustwo dotyczące karty wirtualnej',
        description: 'Jeśli dane Twojej wirtualnej karty zostały skradzione lub naruszone, trwale dezaktywujemy Twoją obecną kartę i zapewnimy Ci nową wirtualną kartę z nowym numerem.',
        deactivateCard: 'Dezaktywuj kartę',
        reportVirtualCardFraud: 'Zgłoś oszustwo dotyczące karty wirtualnej',
    },
    reportFraudConfirmationPage: {
        title: 'Zgłoszono oszustwo kartą',
        description: 'Trwale dezaktywowaliśmy Twoją obecną kartę. Gdy wrócisz, aby wyświetlić szczegóły karty, będzie dostępna nowa wirtualna karta.',
        buttonText: 'Zrozumiałem, dziękuję!',
    },
    activateCardPage: {
        activateCard: 'Aktywuj kartę',
        pleaseEnterLastFour: 'Wprowadź ostatnie cztery cyfry swojej karty.',
        activatePhysicalCard: 'Aktywuj kartę fizyczną',
        error: {
            thatDidNotMatch: 'To nie zgadza się z ostatnimi 4 cyframi Twojej karty. Spróbuj ponownie.',
            throttled:
                'Zbyt wiele razy błędnie wprowadziłeś ostatnie 4 cyfry swojej karty Expensify. Jeśli jesteś pewien, że numery są poprawne, skontaktuj się z Concierge, aby rozwiązać problem. W przeciwnym razie spróbuj ponownie później.',
        },
    },
    getPhysicalCard: {
        header: 'Zamów kartę fizyczną',
        nameMessage: 'Wpisz swoje imię i nazwisko, ponieważ będzie ono widoczne na Twojej karcie.',
        legalName: 'Nazwa prawna',
        legalFirstName: 'Imię (zgodne z dokumentem)',
        legalLastName: 'Prawne nazwisko',
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
        transfer: ({amount}: TransferParams) => `Przelej${amount ? ` ${amount}` : ''}`,
        instant: 'Natychmiastowa (karta debetowa)',
        instantSummary: (rate: string, minAmount: string) => `Opłata ${rate}% (minimum ${minAmount})`,
        ach: '1–3 dni robocze (konto bankowe)',
        achSummary: 'Bez opłaty',
        whichAccount: 'Które konto?',
        fee: 'Opłata',
        transferSuccess: 'Przelew zakończony powodzeniem!',
        transferDetailBankAccount: 'Twoje środki powinny dotrzeć w ciągu 1–3 dni roboczych.',
        transferDetailDebitCard: 'Twoje pieniądze powinny dotrzeć natychmiast.',
        failedTransfer: 'Twoje saldo nie jest w pełni rozliczone. Przelej środki na konto bankowe.',
        notHereSubTitle: 'Przelej proszę swoje saldo z strony portfela',
        goToWallet: 'Przejdź do portfela',
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
        title: 'Zasady wydatków',
        subtitle: 'Te zasady będą miały zastosowanie do Twoich wydatków. Jeśli wysyłasz je do przestrzeni roboczej, zasady tej przestrzeni roboczej mogą je zastąpić.',
        findRule: 'Znajdź regułę',
        emptyRules: {title: 'Nie utworzyłeś żadnych reguł', subtitle: 'Dodaj regułę, aby zautomatyzować raportowanie wydatków.'},
        changes: {
            billableUpdate: (value: boolean) => `Zaktualizuj wydatek ${value ? 'Fakturowalne' : 'niefakturowalne'}`,
            categoryUpdate: (value: string) => `Zaktualizuj kategorię na „${value}”`,
            commentUpdate: (value: string) => `Zmień opis na „${value}”`,
            merchantUpdate: (value: string) => `Zaktualizuj sprzedawcę na „${value}”`,
            reimbursableUpdate: (value: boolean) => `Zaktualizuj wydatek ${value ? 'podlegający zwrotowi' : 'niepodlegający zwrotowi'}`,
            tagUpdate: (value: string) => `Zaktualizuj znacznik na „${value}”`,
            taxUpdate: (value: string) => `Zaktualizuj stawkę podatku na ${value}`,
            billable: (value: boolean) => `wydatek ${value ? 'fakturowalne' : 'niefakturowalne'}`,
            category: (value: string) => `kategorię na „${value}”`,
            comment: (value: string) => `opis na „${value}”`,
            merchant: (value: string) => `sprzedawcę na „${value}”`,
            reimbursable: (value: boolean) => `wydatek ${value ? 'podlegający zwrotowi' : 'niepodlegający zwrotowi'}`,
            tag: (value: string) => `znacznik na „${value}”`,
            tax: (value: string) => `stawkę podatku na ${value}`,
            report: (value: string) => `dodaj do raportu o nazwie „${value}”`,
        },
        newRule: 'Nowa reguła',
        addRule: {
            title: 'Dodaj regułę',
            expenseContains: 'Jeśli wydatek zawiera:',
            applyUpdates: 'Następnie zastosuj te aktualizacje:',
            merchantHint: 'Wpisz * , aby utworzyć regułę, która ma zastosowanie do wszystkich sprzedawców',
            addToReport: 'Dodaj do raportu o nazwie',
            createReport: 'Utwórz raport, jeśli to konieczne',
            applyToExistingExpenses: 'Zastosuj do istniejących pasujących wydatków',
            confirmError: 'Wprowadź sprzedawcę i zastosuj co najmniej jedną zmianę',
            confirmErrorMerchant: 'Wprowadź sprzedawcę',
            confirmErrorUpdate: 'Proszę wprowadzić co najmniej jedną zmianę',
            saveRule: 'Zapisz regułę',
        },
        editRule: {title: 'Edytuj regułę'},
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
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Otrzymuj istotne aktualizacje funkcji i informacje o Expensify',
        muteAllSounds: 'Wycisz wszystkie dźwięki z Expensify',
    },
    priorityModePage: {
        priorityMode: 'Tryb priorytetowy',
        explainerText: 'Wybierz, czy #skupiać się tylko na nieprzeczytanych i przypiętych czatach, czy wyświetlać wszystko, z najbardziej aktualnymi i przypiętymi czatami na górze.',
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
        generatingPDF: 'Trwa generowanie pliku PDF...',
        waitForPDF: 'Proszę poczekać, generujemy plik PDF.',
        errorPDF: 'Wystąpił błąd podczas próby wygenerowania Twojego PDF-a.',
        successPDF: 'Twój plik PDF został wygenerowany! Jeśli nie został pobrany automatycznie, użyj przycisku poniżej.',
    },
    reportDescriptionPage: {
        roomDescription: 'Opis pokoju',
        roomDescriptionOptional: 'Opis pokoju (opcjonalnie)',
        explainerText: 'Ustaw własny opis pokoju.',
    },
    groupChat: {
        lastMemberTitle: 'Uwaga!',
        lastMemberWarning: 'Ponieważ jesteś ostatnią osobą w tym czacie, jego opuszczenie spowoduje, że stanie się on niedostępny dla wszystkich członków. Czy na pewno chcesz wyjść?',
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
        terms: `<muted-text-xs>Logując się, wyrażasz zgodę na <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politykę prywatności</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Przekazy pieniężne są świadczone przez ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) na podstawie jego <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licencji</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Nie otrzymano magicznego kodu?',
        enterAuthenticatorCode: 'Wprowadź kod z aplikacji uwierzytelniającej',
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
        pleaseFillPassword: 'Wprowadź hasło',
        pleaseFillTwoFactorAuth: 'Wprowadź swój kod weryfikacji dwuetapowej',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Wprowadź swój kod uwierzytelniania dwuskładnikowego, aby kontynuować',
        forgot: 'Zapomniałeś?',
        requiredWhen2FAEnabled: 'Wymagane, gdy włączone jest 2FA',
        error: {
            incorrectPassword: 'Nieprawidłowe hasło. Spróbuj ponownie.',
            incorrectLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie.',
            incorrect2fa: 'Nieprawidłowy kod uwierzytelniania dwuskładnikowego. Spróbuj ponownie.',
            twoFactorAuthenticationEnabled: 'Masz włączone uwierzytelnianie dwuskładnikowe (2FA) na tym koncie. Zaloguj się, używając swojego adresu e-mail lub numeru telefonu.',
            invalidLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie lub zresetuj hasło.',
            unableToResetPassword:
                'Nie udało nam się zmienić Twojego hasła. Prawdopodobnie jest to spowodowane wygasłym linkiem do resetowania hasła w starym e-mailu resetującym hasło. Wysłaliśmy Ci nowy link, abyś mógł spróbować ponownie. Sprawdź swoją skrzynkę odbiorczą i folder spam; powinien dotrzeć w ciągu kilku minut.',
            noAccess: 'Nie masz dostępu do tej aplikacji. Dodaj swoją nazwę użytkownika GitHub, aby uzyskać dostęp.',
            accountLocked: 'Twoje konto zostało zablokowane po zbyt wielu nieudanych próbach. Spróbuj ponownie za 1 godzinę.',
            fallback: 'Coś poszło nie tak. Spróbuj ponownie później.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon lub e-mail',
        error: {
            invalidFormatEmailLogin: 'Wprowadzony adres e-mail jest nieprawidłowy. Popraw format i spróbuj ponownie.',
        },
        cannotGetAccountDetails: 'Nie można pobrać szczegółów konta. Spróbuj zalogować się ponownie.',
        loginForm: 'Formularz logowania',
        notYou: ({user}: NotYouParams) => `Nie ${user}?`,
    },
    onboarding: {
        welcome: 'Witamy!',
        welcomeSignOffTitleManageTeam: 'Gdy ukończysz powyższe zadania, możemy odkrywać więcej funkcji, takich jak przepływy zatwierdzania i reguły!',
        welcomeSignOffTitle: 'Miło cię poznać!',
        explanationModal: {
            title: 'Witamy w Expensify',
            description: 'Jedna aplikacja do obsługi wydatków firmowych i osobistych z prędkością czatu. Wypróbuj ją i daj nam znać, co o niej sądzisz. To dopiero początek!',
            secondaryDescription: 'Aby przełączyć się z powrotem na Expensify Classic, stuknij swoje zdjęcie profilowe > Przejdź do Expensify Classic.',
        },
        getStarted: 'Rozpocznij',
        whatsYourName: 'Jak masz na imię?',
        peopleYouMayKnow: 'Osoby, które możesz znać, już tu są! Zweryfikuj swój adres e‑mail, aby do nich dołączyć.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Ktoś z ${domain} już utworzył przestrzeń roboczą. Wprowadź magiczny kod wysłany na ${email}.`,
        joinAWorkspace: 'Dołącz do przestrzeni roboczej',
        listOfWorkspaces: 'Oto lista przestrzeni roboczych, do których możesz dołączyć. Nie martw się, zawsze możesz zrobić to później, jeśli wolisz.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} członek${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Gdzie pracujesz?',
        errorSelection: 'Wybierz opcję, aby kontynuować',
        purpose: {
            title: 'Co chcesz dzisiaj zrobić?',
            errorContinue: 'Naciśnij przycisk „Kontynuuj”, aby dokończyć konfigurację',
            errorBackButton: 'Proszę dokończyć pytania konfiguracyjne, aby rozpocząć korzystanie z aplikacji',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Otrzymam zwrot kosztów od mojego pracodawcy',
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
            title: 'W jakich funkcjach jesteś zainteresowany?',
            featuresAlreadyEnabled: 'Oto nasze najpopularniejsze funkcje:',
            featureYouMayBeInterestedIn: 'Włącz dodatkowe funkcje:',
        },
        error: {
            requiredFirstName: 'Wprowadź swoje imię, aby kontynuować',
        },
        workEmail: {
            title: 'Jaki jest Twój służbowy e-mail?',
            subtitle: 'Expensify działa najlepiej, gdy połączysz swój służbowy adres e-mail.',
            explanationModal: {
                descriptionOne: 'Przekaż na adres receipts@expensify.com do zeskanowania',
                descriptionTwo: 'Dołącz do swoich współpracowników, którzy już korzystają z Expensify',
                descriptionThree: 'Ciesz się bardziej spersonalizowanym doświadczeniem',
            },
            addWorkEmail: 'Dodaj służbowy e‑mail',
        },
        workEmailValidation: {
            title: 'Zweryfikuj swój służbowy adres e-mail',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Wprowadź kod magiczny wysłany na adres ${workEmail}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        },
        workEmailValidationError: {
            publicEmail: 'Wprowadź prawidłowy służbowy adres e‑mail z prywatnej domeny, np. mitch@company.com',
            offline: 'Nie mogliśmy dodać Twojego służbowego adresu e-mail, ponieważ wydajesz się być offline',
        },
        mergeBlockScreen: {
            title: 'Nie można było dodać służbowego adresu e‑mail',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nie udało nam się dodać ${workEmail}. Spróbuj ponownie później w Ustawieniach lub porozmawiaj z Concierge, aby uzyskać wskazówki.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Wybierz się na [jazdę próbną](${testDriveURL})`,
                description: ({testDriveURL}) => `[Weź krótką wycieczkę po produkcie](${testDriveURL}), aby zobaczyć, dlaczego Expensify jest najszybszym sposobem na rozliczanie wydatków.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Wybierz się na [jazdę próbną](${testDriveURL})`,
                description: ({testDriveURL}) => `Wypróbuj nas podczas [jazdy próbnej](${testDriveURL}) i zapewnij swojemu zespołowi *3 darmowe miesiące Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Dodaj zatwierdzanie wydatków',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Dodaj zatwierdzanie wydatków*, aby przeglądać wydatki zespołu i utrzymać je pod kontrolą.

                        Oto jak:

                        1. Przejdź do *Workspaces*.
                        2. Wybierz swój workspace.
                        3. Kliknij *More features*.
                        4. Włącz *Workflows*.
                        5. Przejdź do *Workflows* w edytorze workspace.
                        6. Włącz *Approvals*.
                        7. Zostaniesz ustawiony jako zatwierdzający wydatki. Po zaproszeniu zespołu możesz zmienić tę osobę na dowolnego administratora.

                        [Przejdź do More features](${workspaceMoreFeaturesLink}).`),
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
                        2. Wybierz swój workspace.
                        3. Kliknij *Categories*.
                        4. Wyłącz wszystkie kategorie, których nie potrzebujesz.
                        5. Dodaj własne kategorie w prawym górnym rogu.

                        [Przejdź do ustawień kategorii workspace](${workspaceCategoriesLink}).

                        ![Skonfiguruj kategorie](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Zgłoś wydatek',
                description: dedent(`
                    *Zgłoś wydatek*, wpisując kwotę lub skanując paragon.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz wydatek*.
                    3. Wpisz kwotę lub zeskanuj paragon.
                    4. Dodaj e‑mail lub numer telefonu swojego szefa.
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
                        Połącz ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'twój' : 'do'} ${integrationName}, aby włączyć automatyczne kodowanie wydatków i synchronizację, co znacznie ułatwia zamknięcie miesiąca.

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
                title: ({corporateCardLink}) => `Połącz [swoje karty służbowe](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Połącz karty, które już masz, aby automatycznie importować transakcje, dopasowywać paragony i przeprowadzać uzgodnienia.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Company cards*.
                        4. Postępuj zgodnie z instrukcjami, aby połączyć swoje karty.

                        [Przejdź do Company cards](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Zaproś [swój zespół](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Zaproś swój zespół* do Expensify, aby mógł zacząć śledzić wydatki już dziś.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Members* > *Invite member*.
                        4. Wprowadź adresy e-mail lub numery telefonów.
                        5. Dodaj własną wiadomość z zaproszeniem, jeśli chcesz!

                        [Przejdź do członków przestrzeni roboczej](${workspaceMembersLink}).

                        ![Zaproś swój zespół](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Skonfiguruj [kategorie](${workspaceCategoriesLink}) i [tagi](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Skonfiguruj kategorie i tagi*, aby Twój zespół mógł księgować wydatki dla łatwego raportowania.

                        Zaimportuj je automatycznie, [łącząc swoje oprogramowanie księgowe](${workspaceAccountingLink}), lub skonfiguruj je ręcznie w [ustawieniach miejsca pracy](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Skonfiguruj [tagi](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Używaj tagów, aby dodać dodatkowe szczegóły wydatku, takie jak projekty, klienci, lokalizacje i działy. Jeśli potrzebujesz wielu poziomów tagów, możesz przejść na plan Control.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *More features*.
                        4. Włącz *Tags*.
                        5. Przejdź do *Tags* w edytorze przestrzeni roboczej.
                        6. Kliknij *+ Add tag*, aby utworzyć własny tag.

                        [Przejdź do more features](${workspaceMoreFeaturesLink}).

                        ![Skonfiguruj tagi](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Zaproś swojego [księgowego](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Zaproś swojego księgowego*, aby współpracował w Twoim obszarze roboczym i zarządzał wydatkami firmowymi.

                        1. Kliknij *Obszary robocze*.
                        2. Wybierz swój obszar roboczy.
                        3. Kliknij *Członkowie*.
                        4. Kliknij *Zaproś członka*.
                        5. Wpisz adres e-mail swojego księgowego.

                        [Zaproś swojego księgowego teraz](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Rozpocznij czat',
                description: dedent(`
                    *Rozpocznij czat* z dowolną osobą, używając jej adresu e-mail lub numeru telefonu.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Rozpocznij czat*.
                    3. Wpisz adres e-mail lub numer telefonu.

                    Jeśli ta osoba nie korzysta jeszcze z Expensify, zaproszenie zostanie wysłane automatycznie.

                    Każdy czat zostanie również przekształcony w e-mail lub SMS, na który ta osoba może odpowiedzieć bezpośrednio.
                `),
            },
            splitExpenseTask: {
                title: 'Podziel wydatki',
                description: dedent(`
                    *Podziel wydatki* z jedną lub większą liczbą osób.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Rozpocznij czat*.
                    3. Wpisz adresy e-mail lub numery telefonów.
                    4. Kliknij szary przycisk *+* na czacie > *Podziel wydatek*.
                    5. Utwórz wydatek, wybierając *Ręcznie*, *Skanowanie* lub *Dystans*.

                    Możesz dodać więcej szczegółów, jeśli chcesz, albo po prostu go wyślij. Czas, żeby Ci oddano pieniądze!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Przejrzyj swoje [ustawienia przestrzeni roboczej](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Oto jak przejrzeć i zaktualizować ustawienia swojego workspace’u:
                        1. Kliknij Workspaces.
                        2. Wybierz swój workspace.
                        3. Przejrzyj i zaktualizuj swoje ustawienia.
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
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Wybierz się na [jazdę próbną](${testDriveURL})` : 'Wypróbuj wersję testową'),
            embeddedDemoIframeTitle: 'Jazda próbna',
            employeeFakeReceipt: {
                description: 'Mój paragon z jazdy próbnej!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Otrzymanie zwrotu pieniędzy jest tak proste jak wysłanie wiadomości. Przejdźmy przez podstawy.',
            onboardingPersonalSpendMessage: 'Oto jak śledzić swoje wydatki w kilku kliknięciach.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Twój bezpłatny okres próbny właśnie się rozpoczął! Skonfigurujmy wszystko.

                        👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Utworzyłem już workspace, aby pomóc w zarządzaniu paragonami i wydatkami Twojego zespołu. Aby jak najlepiej wykorzystać 30-dniowy bezpłatny okres próbny, wykonaj poniższe kroki konfiguracji!
                    `)
                    : dedent(`
                        # Twój bezpłatny okres próbny właśnie się rozpoczął! Skonfigurujmy wszystko.

                        👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Teraz, gdy utworzyłeś miejsce pracy, wykorzystaj w pełni swój 30‑dniowy bezpłatny okres próbny, wykonując poniższe kroki!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Skonfigurujmy wszystko\n\n👋 Cześć! Jestem Twoim specjalistą ds. konfiguracji Expensify. Utworzyłem już miejsce pracy, które pomoże Ci zarządzać paragonami i wydatkami. Aby jak najlepiej wykorzystać 30-dniowy bezpłatny okres próbny, po prostu wykonaj pozostałe kroki konfiguracji poniżej!',
            onboardingChatSplitMessage: 'Dzieleniem rachunków ze znajomymi jest tak proste jak wysłanie wiadomości. Oto jak to działa.',
            onboardingAdminMessage: 'Dowiedz się, jak zarządzać przestrzenią roboczą swojego zespołu jako administrator oraz jak składać własne rozliczenia wydatków.',
            onboardingLookingAroundMessage:
                'Expensify jest najlepiej znane z rozliczania wydatków, podróży służbowych i zarządzania kartami firmowymi, ale robimy znacznie więcej. Daj znać, czym jesteś zainteresowany, a pomogę Ci zacząć.',
            onboardingTestDriveReceiverMessage: '*Masz 3 miesiące za darmo! Zacznij poniżej.*',
        },
        workspace: {
            title: 'Zachowaj porządek dzięki przestrzeni roboczej',
            subtitle: 'Odblokuj zaawansowane narzędzia, które uproszczą zarządzanie wydatkami – wszystko w jednym miejscu. Dzięki przestrzeni roboczej możesz:',
            explanationModal: {
                descriptionOne: 'Śledź i porządkuj paragony',
                descriptionTwo: 'Kategoryzuj i oznaczaj wydatki',
                descriptionThree: 'Twórz i udostępniaj raporty',
            },
            price: 'Wypróbuj za darmo przez 30 dni, a następnie uaktualnij za jedyne <strong>5 USD/użytkownik/miesiąc</strong>.',
            createWorkspace: 'Utwórz przestrzeń roboczą',
        },
        confirmWorkspace: {
            title: 'Potwierdź przestrzeń roboczą',
            subtitle: 'Utwórz przestrzeń roboczą, aby śledzić paragony, rozliczać wydatki, zarządzać podróżami, tworzyć raporty i nie tylko — wszystko z prędkością rozmowy na czacie.',
        },
        inviteMembers: {
            title: 'Zaproś członków',
            subtitle: 'Dodaj swój zespół lub zaproś swojego księgowego. Im więcej, tym weselej!',
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
            cannotContainSpecialCharacters: 'Nazwa nie może zawierać znaków specjalnych',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Jakie jest Twoje imię i nazwisko zgodnie z dokumentami?',
        enterDateOfBirth: 'Jaka jest Twoja data urodzenia?',
        enterAddress: 'Jaki jest Twój adres?',
        enterPhoneNumber: 'Jaki jest Twój numer telefonu?',
        personalDetails: 'Dane osobowe',
        privateDataMessage: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane w Twoim publicznym profilu.',
        legalName: 'Nazwa prawna',
        legalFirstName: 'Imię (zgodne z dokumentem)',
        legalLastName: 'Prawne nazwisko',
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
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) => `Aby zweryfikować ${secondaryLogin}, wyślij ponownie magiczny kod z ustawień konta ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Jeśli nie masz już dostępu do ${primaryLogin}, odłącz swoje konta.`,
        unlink: 'Odłącz',
        linkSent: 'Link wysłany!',
        successfullyUnlinkedLogin: 'Dodatkowe logowanie zostało pomyślnie odłączone!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Nasz dostawca poczty e-mail tymczasowo wstrzymał wysyłanie wiadomości na adres ${login} z powodu problemów z dostarczaniem. Aby odblokować swój login, wykonaj następujące kroki:`,
        confirmThat: (login: string) =>
            `<strong>Potwierdź, że ${login} jest wpisany poprawnie i jest prawdziwym, działającym adresem e‑mail.</strong> Aliasy e‑mail, takie jak „expenses@domain.com”, muszą mieć dostęp do własnej skrzynki odbiorczej, aby mogły być używane jako prawidłowy login do Expensify.`,
        ensureYourEmailClient: `<strong>Upewnij się, że Twój klient e-mail akceptuje wiadomości z domeny expensify.com.</strong> Instrukcje, jak wykonać ten krok, znajdziesz <a href="${CONST.SET_NOTIFICATION_LINK}">tutaj</a>, ale możesz potrzebować pomocy działu IT przy konfiguracji ustawień poczty.`,
        onceTheAbove: `Po wykonaniu powyższych kroków skontaktuj się z <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, aby odblokować swoje logowanie.`,
    },
    openAppFailureModal: {
        title: 'Coś poszło nie tak...',
        subtitle: `Nie udało nam się wczytać wszystkich Twoich danych. Zostaliśmy o tym powiadomieni i sprawdzamy problem. Jeśli będzie się to powtarzać, skontaktuj się z`,
        refreshAndTryAgain: 'Odśwież i spróbuj ponownie',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nie udało nam się dostarczyć wiadomości SMS na numer ${login}, więc tymczasowo go zawiesiliśmy. Spróbuj zweryfikować swój numer:`,
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
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'Minuta' : 'minuty'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Trzymaj się! Musisz poczekać ${timeText}, zanim ponownie spróbujesz zweryfikować swój numer.`;
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
            `Pozostań na bieżąco, wyświetlając tylko nieprzeczytane czaty lub czaty wymagające Twojej uwagi. Nie martw się, możesz to zmienić w dowolnym momencie w <a href="${priorityModePageUrl}">ustawieniach</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Nie można odnaleźć czatu, którego szukasz.',
        getMeOutOfHere: 'Wyprowadź mnie stąd',
        iouReportNotFound: 'Nie można znaleźć szczegółów płatności, których szukasz.',
        notHere: 'Hmm... nie ma tego tutaj',
        pageNotFound: 'Ups, nie można znaleźć tej strony',
        noAccess: 'Ten czat lub wydatek mógł zostać usunięty albo nie masz do niego dostępu.\n\nW razie pytań skontaktuj się pod adresem concierge@expensify.com',
        goBackHome: 'Wróć do strony głównej',
        commentYouLookingForCannotBeFound: 'Komentarz, którego szukasz, nie został znaleziony.',
        goToChatInstead: 'Zamiast tego przejdź do czatu.',
        contactConcierge: 'W razie pytań skontaktuj się pod adresem concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups... ${isBreakLine ? '\n' : ''}Coś poszło nie tak`,
        subtitle: 'Twoje żądanie nie mogło zostać zrealizowane. Spróbuj ponownie później.',
        wrongTypeSubtitle: 'To wyszukiwanie jest nieprawidłowe. Spróbuj dostosować kryteria wyszukiwania.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Dodaj emotikon, aby ułatwić współpracownikom i znajomym zorientowanie się, co się dzieje. Opcjonalnie możesz też dodać wiadomość!',
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
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `jako zastępca urlopowy ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `do ${submittedToName} jako zastępca urlopowy dla ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Przypisujesz ${nameOrEmail} jako swojego zastępcę na czas urlopu. Nie są jeszcze we wszystkich Twoich przestrzeniach roboczych. Jeśli zdecydujesz się kontynuować, do wszystkich administratorów Twoich przestrzeni roboczych zostanie wysłany e-mail z prośbą o ich dodanie.`,
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
        thisBankAccount: 'To to konto bankowe będzie używane do płatności firmowych w Twojej przestrzeni roboczej',
        accountNumber: 'Numer konta',
        routingNumber: 'Numer rozliczeniowy',
        chooseAnAccountBelow: 'Wybierz konto poniżej',
        addBankAccount: 'Dodaj konto bankowe',
        chooseAnAccount: 'Wybierz konto',
        connectOnlineWithPlaid: 'Zaloguj się do swojego banku',
        connectManually: 'Połącz ręcznie',
        desktopConnection: 'Uwaga: aby połączyć się z Chase, Wells Fargo, Capital One lub Bank of America, kliknij tutaj, aby dokończyć ten proces w przeglądarce.',
        yourDataIsSecure: 'Twoje dane są bezpieczne',
        toGetStarted: 'Dodaj konto bankowe, aby zwracać wydatki, wydawać karty Expensify, pobierać płatności za faktury i opłacać rachunki – wszystko z jednego miejsca.',
        plaidBodyCopy: 'Daj swoim pracownikom łatwiejszy sposób na płacenie – i otrzymywanie zwrotów – za wydatki firmowe.',
        checkHelpLine: 'Numer rozliczeniowy i numer rachunku możesz znaleźć na czeku powiązanym z tym kontem.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Aby połączyć konto bankowe, <a href="${contactMethodRoute}">dodaj adres e‑mail jako swój główny login</a> i spróbuj ponownie. Numer telefonu możesz dodać jako login dodatkowy.`,
        hasBeenThrottledError: 'Wystąpił błąd podczas dodawania Twojego konta bankowego. Poczekaj kilka minut i spróbuj ponownie.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Wygląda na to, że waluta Twojego workspace’u jest ustawiona na inną niż USD. Aby kontynuować, przejdź do <a href="${workspaceRoute}">ustawień workspace’u</a>, ustaw ją na USD i spróbuj ponownie.`,
        bbaAdded: 'Dodano firmowe konto bankowe!',
        bbaAddedDescription: 'Jest gotowe do użycia w płatnościach.',
        error: {
            youNeedToSelectAnOption: 'Wybierz opcję, aby kontynuować',
            noBankAccountAvailable: 'Przepraszamy, brak dostępnego konta bankowego',
            noBankAccountSelected: 'Proszę wybrać konto',
            taxID: 'Wprowadź prawidłowy numer identyfikacji podatkowej',
            website: 'Wprowadź prawidłową stronę internetową',
            zipCode: `Wprowadź prawidłowy kod ZIP w formacie: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Wprowadź prawidłowy numer telefonu',
            email: 'Wprowadź prawidłowy adres e‑mail',
            companyName: 'Wpisz prawidłową nazwę firmy',
            addressCity: 'Wprowadź prawidłowe miasto',
            addressStreet: 'Wprowadź poprawny adres ulicy',
            addressState: 'Wybierz prawidłowy stan',
            incorporationDateFuture: 'Data rejestracji nie może być w przyszłości',
            incorporationState: 'Wybierz prawidłowy stan',
            industryCode: 'Wprowadź prawidłowy sześciocyfrowy kod klasyfikacji branży',
            restrictedBusiness: 'Potwierdź, że firma nie znajduje się na liście działalności objętych ograniczeniami',
            routingNumber: 'Wprowadź prawidłowy numer rozliczeniowy',
            accountNumber: 'Wprowadź prawidłowy numer konta',
            routingAndAccountNumberCannotBeSame: 'Numer rozliczeniowy i numer konta nie mogą być takie same',
            companyType: 'Wybierz prawidłowy typ firmy',
            tooManyAttempts: 'Z powodu dużej liczby prób logowania ta opcja została wyłączona na 24 godziny. Spróbuj ponownie później lub wprowadź dane ręcznie.',
            address: 'Wprowadź prawidłowy adres',
            dob: 'Wybierz prawidłową datę urodzenia',
            age: 'Musi mieć ukończone 18 lat',
            ssnLast4: 'Wprowadź prawidłowe ostatnie 4 cyfry numeru SSN',
            firstName: 'Wprowadź prawidłowe imię',
            lastName: 'Wprowadź prawidłowe nazwisko',
            noDefaultDepositAccountOrDebitCardAvailable: 'Dodaj domyślne konto depozytowe lub kartę debetową',
            validationAmounts: 'Wprowadzone kwoty weryfikacyjne są nieprawidłowe. Sprawdź wyciąg bankowy i spróbuj ponownie.',
            fullName: 'Wprowadź prawidłowe pełne imię i nazwisko',
            ownershipPercentage: 'Wprowadź prawidłową wartość procentową',
            deletePaymentBankAccount:
                'To tego konta bankowego nie można usunąć, ponieważ jest używane do płatności Expensify Card. Jeśli mimo to chcesz usunąć to konto, skontaktuj się z Concierge.',
            sameDepositAndWithdrawalAccount: 'Konto do wpłaty i konto do wypłaty są takie same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Gdzie znajduje się Twoje konto bankowe?',
        accountDetailsStepHeader: 'Jakie są szczegóły Twojego konta?',
        accountTypeStepHeader: 'Jakiego typu jest to konto?',
        bankInformationStepHeader: 'Jakie są dane Twojego konta bankowego?',
        accountHolderInformationStepHeader: 'Jakie są dane posiadacza konta?',
        howDoWeProtectYourData: 'Jak chronimy Twoje dane?',
        currencyHeader: 'W jakiej walucie jest Twoje konto bankowe?',
        confirmationStepHeader: 'Sprawdź swoje dane.',
        confirmationStepSubHeader: 'Sprawdź poniższe szczegóły i zaznacz pole z warunkami, aby potwierdzić.',
        toGetStarted: 'Dodaj osobiste konto bankowe, aby otrzymywać zwroty kosztów, opłacać faktury lub włączyć portfel Expensify.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Wprowadź hasło do Expensify',
        alreadyAdded: 'To to konto zostało już dodane.',
        chooseAccountLabel: 'Konto',
        successTitle: 'Dodano prywatne konto bankowe!',
        successMessage: 'Gratulacje, Twoje konto bankowe jest skonfigurowane i gotowe do przyjmowania zwrotów.',
    },
    attachmentView: {
        unknownFilename: 'Nieznana nazwa pliku',
        passwordRequired: 'Proszę wprowadzić hasło',
        passwordIncorrect: 'Nieprawidłowe hasło. Spróbuj ponownie.',
        failedToLoadPDF: 'Nie udało się wczytać pliku PDF',
        pdfPasswordForm: {
            title: 'PDF zabezpieczony hasłem',
            infoText: 'Ten plik PDF jest zabezpieczony hasłem.',
            beforeLinkText: 'Proszę',
            linkText: 'wprowadź hasło',
            afterLinkText: 'aby to wyświetlić.',
            formLabel: 'Wyświetl PDF',
        },
        attachmentNotFound: 'Załącznik nie został znaleziony',
        retry: 'Spróbuj ponownie',
    },
    messages: {
        errorMessageInvalidPhone: `Wprowadź prawidłowy numer telefonu bez nawiasów i myślników. Jeśli jesteś poza USA, dołącz kod kraju (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Nieprawidłowy adres e-mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest już członkiem ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest już administratorem ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Kontynuując żądanie aktywacji portfela Expensify, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
        facialScan: 'Polityka i zgoda na skan twarzy Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Polityka i zgoda na skan twarzy Onfido</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Prywatność</a> i <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Warunki korzystania z usługi</a>.</muted-text-micro>`,
        tryAgain: 'Spróbuj ponownie',
        verifyIdentity: 'Zweryfikuj tożsamość',
        letsVerifyIdentity: 'Zweryfikujmy Twoją tożsamość',
        butFirst: `Ale najpierw nudna część. Przeczytaj prawniczy żargon w następnym kroku i kliknij „Akceptuj”, gdy będziesz gotowy.`,
        genericError: 'Wystąpił błąd podczas przetwarzania tego kroku. Spróbuj ponownie.',
        cameraPermissionsNotGranted: 'Włącz dostęp do aparatu',
        cameraRequestMessage: 'Potrzebujemy dostępu do aparatu, aby zakończyć weryfikację konta bankowego. Włącz go w Ustawienia > New Expensify.',
        microphonePermissionsNotGranted: 'Włącz dostęp do mikrofonu',
        microphoneRequestMessage: 'Potrzebujemy dostępu do Twojego mikrofonu, aby dokończyć weryfikację konta bankowego. Proszę włączyć go w Ustawienia > New Expensify.',
        originalDocumentNeeded: 'Prześlij oryginalne zdjęcie swojego dokumentu tożsamości zamiast zrzutu ekranu lub skanu.',
        documentNeedsBetterQuality:
            'Wygląda na to, że Twój dokument tożsamości jest uszkodzony lub brakuje mu wymaganych zabezpieczeń. Prześlij proszę oryginalne zdjęcie nieuszkodzonego dokumentu tożsamości, który jest w całości widoczny.',
        imageNeedsBetterQuality: 'Wystąpił problem z jakością zdjęcia Twojego dokumentu tożsamości. Prześlij nowe zdjęcie, na którym cały dokument będzie wyraźnie widoczny.',
        selfieIssue: 'Wystąpił problem z Twoim selfie/wideo. Prześlij proszę aktualne (na żywo) selfie/wideo.',
        selfieNotMatching: 'Twoje selfie/wideo nie pasuje do Twojego dokumentu tożsamości. Prześlij nowe selfie/wideo, na którym Twoja twarz jest wyraźnie widoczna.',
        selfieNotLive: 'Twoje selfie/wideo nie wygląda na zdjęcie/wideo na żywo. Prześlij proszę selfie/wideo wykonane na żywo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dodatkowe szczegóły',
        helpText: 'Musimy potwierdzić poniższe informacje, zanim będziesz mógł wysyłać i otrzymywać pieniądze ze swojego portfela.',
        helpTextIdologyQuestions: 'Musimy zadać Ci jeszcze kilka pytań, aby dokończyć weryfikację Twojej tożsamości.',
        helpLink: 'Dowiedz się więcej, dlaczego tego potrzebujemy.',
        legalFirstNameLabel: 'Imię (zgodne z dokumentem)',
        legalMiddleNameLabel: 'Drugie imię (prawne)',
        legalLastNameLabel: 'Prawne nazwisko',
        selectAnswer: 'Wybierz odpowiedź, aby kontynuować',
        ssnFull9Error: 'Wprowadź prawidłowy dziewięciocyfrowy numer SSN',
        needSSNFull9: 'Mamy problem z weryfikacją Twojego numeru SSN. Wprowadź pełne dziewięć cyfr swojego SSN.',
        weCouldNotVerify: 'Nie udało nam się zweryfikować',
        pleaseFixIt: 'Popraw te informacje, zanim przejdziesz dalej',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Nie udało nam się zweryfikować Twojej tożsamości. Spróbuj ponownie później lub skontaktuj się z <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, jeśli masz jakieś pytania.`,
    },
    termsStep: {
        headerTitle: 'Warunki i opłaty',
        headerTitleRefactor: 'Opłaty i warunki',
        haveReadAndAgreePlain: 'Przeczytałem(-am) i zgadzam się na otrzymywanie elektronicznych powiadomień.',
        haveReadAndAgree: `Przeczytałem(-am) i wyrażam zgodę na otrzymywanie <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">ujawnień w formie elektronicznej</a>.`,
        agreeToThePlain: 'Zgadzam się z Polityką prywatności i Warunkami korzystania z portfela.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Zgadzam się z <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">polityką prywatności</a> oraz <a href="${walletAgreementUrl}">umową portfela</a>.`,
        enablePayments: 'Włącz płatności',
        monthlyFee: 'Miesięczna opłata',
        inactivity: 'Brak aktywności',
        noOverdraftOrCredit: 'Brak funkcji debetu/kredytu.',
        electronicFundsWithdrawal: 'Elektroniczne obciążenie rachunku bankowego',
        standard: 'Standardowy',
        reviewTheFees: 'Zapoznaj się z niektórymi opłatami.',
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
            customerService: 'Obsługa klienta (automatyczna lub z udziałem konsultanta na żywo)',
            inactivityAfterTwelveMonths: 'Nieaktywność (po 12 miesiącach bez transakcji)',
            weChargeOneFee: 'Pobieramy opłatę za 1 inny typ. Jest to:',
            fdicInsurance: 'Twoje środki kwalifikują się do ubezpieczenia FDIC.',
            generalInfo: `Aby uzyskać ogólne informacje na temat kont przedpłaconych, odwiedź <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Aby uzyskać szczegółowe informacje i warunki dotyczące wszystkich opłat i usług, odwiedź <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> lub zadzwoń pod numer +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektroniczne wycofanie środków (natychmiastowe)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Lista wszystkich opłat Expensify Wallet',
            typeOfFeeHeader: 'Wszystkie opłaty',
            feeAmountHeader: 'Kwota',
            moreDetailsHeader: 'Szczegóły',
            openingAccountTitle: 'Otwieranie konta',
            openingAccountDetails: 'Otwarcie konta jest bezpłatne.',
            monthlyFeeDetails: 'Nie ma miesięcznej opłaty.',
            customerServiceTitle: 'Obsługa klienta',
            customerServiceDetails: 'Nie ma żadnych opłat za obsługę klienta.',
            inactivityDetails: 'Nie ma opłaty za brak aktywności.',
            sendingFundsTitle: 'Wysyłanie środków do innego posiadacza konta',
            sendingFundsDetails: 'Wysyłanie środków do innego posiadacza konta za pomocą salda, konta bankowego lub karty debetowej jest bez opłat.',
            electronicFundsStandardDetails:
                'Przy użyciu standardowej opcji nie jest pobierana żadna opłata za przelanie środków z Twojego portfela Expensify na konto bankowe. Taki przelew zazwyczaj zostaje zrealizowany w ciągu 1–3 dni roboczych.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Przy korzystaniu z opcji natychmiastowego przelewu z portfela Expensify na powiązaną kartę debetową pobierana jest opłata. Ten przelew zazwyczaj zostaje zrealizowany w ciągu kilku minut.' +
                `Opłata wynosi ${percentage}% kwoty przelewu (z minimalną opłatą ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Twoje środki kwalifikują się do ubezpieczenia FDIC. Twoje środki będą przechowywane w ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, instytucji objętej ubezpieczeniem FDIC, lub zostaną do niej przetransferowane.` +
                `Gdy już tam będą, Twoje środki są ubezpieczone do kwoty ${amount} przez FDIC na wypadek, gdyby ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} upadł, o ile spełnione są określone wymogi dotyczące ubezpieczenia depozytów i Twoja karta jest zarejestrowana. Szczegóły znajdziesz w ${CONST.TERMS.FDIC_PREPAID}.`,
            contactExpensifyPayments: `Skontaktuj się z ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}, dzwoniąc pod numer +1 833-400-0904, wysyłając e-mail na adres ${CONST.EMAIL.CONCIERGE} lub logując się na ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Aby uzyskać ogólne informacje na temat kont przedpłaconych, odwiedź ${CONST.TERMS.CFPB_PREPAID}. Jeśli masz skargę dotyczącą konta przedpłaconego, zadzwoń do Biura Ochrony Finansowej Konsumenta pod numer 1-855-411-2372 lub odwiedź ${CONST.TERMS.CFPB_COMPLAINT}.`,
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
        activatedMessage: 'Gratulacje, Twój portfel jest skonfigurowany i gotowy do dokonywania płatności.',
        checkBackLaterTitle: 'Chwileczkę…',
        checkBackLaterMessage: 'Wciąż sprawdzamy Twoje informacje. Spróbuj ponownie później.',
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
        incorporationState: 'Stan rejestracji spółki',
        industryClassificationCode: 'Kod klasyfikacji branżowej',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        incorporationDatePlaceholder: 'Data rozpoczęcia (rrrr-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Korporacja',
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
        enterYourLegalFirstAndLast: 'Jakie jest Twoje imię i nazwisko zgodnie z dokumentami?',
        legalFirstName: 'Imię (zgodne z dokumentem)',
        legalLastName: 'Prawne nazwisko',
        legalName: 'Nazwa prawna',
        enterYourDateOfBirth: 'Jaka jest Twoja data urodzenia?',
        enterTheLast4: 'Jakie są ostatnie cztery cyfry Twojego numeru Social Security?',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych kontroli kredytowych!',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        enterYourAddress: 'Jaki jest Twój adres?',
        address: 'Adres',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś(-aś), rozumiesz i akceptujesz',
        whatsYourLegalName: 'Jakie jest Twoje imię i nazwisko zgodne z dokumentami?',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatsYourSSN: 'Jakie są ostatnie cztery cyfry Twojego numeru Social Security?',
        noPersonalChecks: 'Nie martw się, nie sprawdzamy tu żadnej osobistej zdolności kredytowej!',
        whatsYourPhoneNumber: 'Jaki jest Twój numer telefonu?',
        weNeedThisToVerify: 'Potrzebujemy tego, aby zweryfikować Twój portfel.',
    },
    businessInfoStep: {
        businessInfo: 'Informacje o firmie',
        enterTheNameOfYourBusiness: 'Jak nazywa się Twoja firma?',
        businessName: 'Pełna nazwa firmy',
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
            LLC: 'LLC',
            CORPORATION: 'Korporacja',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Spółdzielnia',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        selectYourCompanyIncorporationDate: 'Jaka jest data rejestracji Twojej firmy?',
        incorporationDate: 'Data rejestracji firmy',
        incorporationDatePlaceholder: 'Data rozpoczęcia (rrrr-mm-dd)',
        incorporationState: 'Stan rejestracji spółki',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'W którym stanie została zarejestrowana Twoja firma?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        companyAddress: 'Adres firmy',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        businessInfoTitle: 'Informacje o firmie',
        legalBusinessName: 'Prawna nazwa firmy',
        whatsTheBusinessName: 'Jaka jest nazwa firmy?',
        whatsTheBusinessAddress: 'Jaki jest adres firmowy?',
        whatsTheBusinessContactInformation: 'Jakie są dane kontaktowe firmy?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Jaki jest Numer Rejestracyjny Firmy (CRN)?';
                default:
                    return 'Jaki jest numer rejestracyjny firmy?';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Jaki jest Numer Identyfikacyjny Pracodawcy (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Jaki jest Numer Identyfikacyjny Firmy (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Jaki jest numer identyfikacyjny VAT (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Czym jest australijski numer biznesowy (ABN)?';
                default:
                    return 'Jaki jest numer VAT UE?';
            }
        },
        whatsThisNumber: 'Co to za numer?',
        whereWasTheBusinessIncorporated: 'Gdzie została zarejestrowana firma?',
        whatTypeOfBusinessIsIt: 'Jaki to rodzaj działalności?',
        whatsTheBusinessAnnualPayment: 'Jaki jest roczny wolumen płatności firmy?',
        whatsYourExpectedAverageReimbursements: 'Jakiej oczekiwanej średniej kwoty zwrotu kosztów się spodziewasz?',
        registrationNumber: 'Numer rejestracyjny',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'Numer rejestracyjny VAT';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'VAT UE';
            }
        },
        businessAddress: 'Adres firmowy',
        businessType: 'Typ działalności',
        incorporation: 'Inkorporacja',
        incorporationCountry: 'Kraj rejestracji spółki',
        incorporationTypeName: 'Typ osoby prawnej',
        businessCategory: 'Kategoria biznesowa',
        annualPaymentVolume: 'Roczna wartość płatności',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Roczna kwota płatności w ${currencyCode}`,
        averageReimbursementAmount: 'Średnia kwota zwrotu',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Średnia kwota zwrotu w ${currencyCode}`,
        selectIncorporationType: 'Wybierz typ formy prawnej',
        selectBusinessCategory: 'Wybierz kategorię firmy',
        selectAnnualPaymentVolume: 'Wybierz roczny wolumen płatności',
        selectIncorporationCountry: 'Wybierz kraj rejestracji',
        selectIncorporationState: 'Wybierz stan rejestracji',
        selectAverageReimbursement: 'Wybierz średnią kwotę zwrotu',
        selectBusinessType: 'Wybierz typ działalności',
        findIncorporationType: 'Znajdź typ inkorporacji',
        findBusinessCategory: 'Znajdź kategorię biznesową',
        findAnnualPaymentVolume: 'Znajdź roczny wolumen płatności',
        findIncorporationState: 'Znajdź stan rejestracji',
        findAverageReimbursement: 'Znajdź średnią kwotę zwrotu',
        findBusinessType: 'Znajdź typ działalności',
        error: {
            registrationNumber: 'Podaj poprawny numer rejestracyjny',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Podaj prawidłowy Numer Identyfikacyjny Pracodawcy (EIN)';
                    case CONST.COUNTRY.CA:
                        return 'Podaj prawidłowy numer identyfikacyjny firmy (BN)';
                    case CONST.COUNTRY.GB:
                        return 'Podaj prawidłowy numer identyfikacji podatkowej VAT (VRN)';
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
        doAnyIndividualOwn25percent: (companyName: string) => `Czy jakakolwiek osoba posiada 25% lub więcej udziałów w ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Czy są inne osoby, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        companyOwner: 'Właściciel firmy',
        enterLegalFirstAndLastName: 'Jakie jest prawne imię i nazwisko właściciela?',
        legalFirstName: 'Imię (zgodne z dokumentem)',
        legalLastName: 'Prawne nazwisko',
        enterTheDateOfBirthOfTheOwner: 'Jaka jest data urodzenia właściciela?',
        enterTheLast4: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych kontroli kredytowych!',
        enterTheOwnersAddress: 'Jaki jest adres właściciela?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Nazwa prawna',
        address: 'Adres',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś(-aś), rozumiesz i akceptujesz',
        owners: 'Właściciele',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informacje o właścicielu',
        businessOwner: 'Właściciel firmy',
        signerInfo: 'Informacje o podpisującym',
        doYouOwn: (companyName: string) => `Czy posiadasz 25% lub więcej udziałów w ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Czy jakakolwiek osoba posiada 25% lub więcej udziałów w ${companyName}?`,
        regulationsRequire: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby fizycznej, która posiada więcej niż 25% udziałów w firmie.',
        legalFirstName: 'Imię (zgodne z dokumentem)',
        legalLastName: 'Prawne nazwisko',
        whatsTheOwnersName: 'Jakie jest prawne imię i nazwisko właściciela?',
        whatsYourName: 'Jakie jest Twoje imię i nazwisko zgodnie z dokumentami?',
        whatPercentage: 'Jaki procent firmy należy do właściciela?',
        whatsYoursPercentage: 'Jaki procent udziałów w firmie posiadasz?',
        ownership: 'Własność',
        whatsTheOwnersDOB: 'Jaka jest data urodzenia właściciela?',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        whatsTheOwnersAddress: 'Jaki jest adres właściciela?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatAreTheLast: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        whatsYourLast: 'Jakie są ostatnie 4 cyfry Twojego numeru Social Security?',
        whatsYourNationality: 'Jakie jest twoje obywatelstwo?',
        whatsTheOwnersNationality: 'Jaki jest kraj obywatelstwa właściciela?',
        countryOfCitizenship: 'Kraj obywatelstwa',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych kontroli kredytowych!',
        last4: 'Ostatnie 4 cyfry numeru SSN',
        whyDoWeAsk: 'Dlaczego o to prosimy?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Nazwa prawna',
        ownershipPercentage: 'Procent udziałów',
        areThereOther: (companyName: string) => `Czy są inne osoby, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        owners: 'Właściciele',
        addCertified: 'Dodaj uwierzytelniony diagram organizacyjny przedstawiający beneficjentów rzeczywistych',
        regulationRequiresChart:
            'Przepisy wymagają od nas zebrania poświadczonej kopii schematu własności, który pokazuje każdą osobę lub podmiot posiadający 25% lub więcej udziałów w firmie.',
        uploadEntity: 'Prześlij schemat własności podmiotu',
        noteEntity: 'Uwaga: wykres własności podmiotów musi być podpisany przez Twojego księgowego, doradcę prawnego lub poświadczony notarialnie.',
        certified: 'Poświadczony wykres własności podmiotu',
        selectCountry: 'Wybierz kraj',
        findCountry: 'Znajdź kraj',
        address: 'Adres',
        chooseFile: 'Wybierz plik',
        uploadDocuments: 'Prześlij dodatkową dokumentację',
        pleaseUpload:
            'Prześlij poniżej dodatkową dokumentację, aby pomóc nam zweryfikować Twoją tożsamość jako bezpośredniego lub pośredniego właściciela co najmniej 25% udziałów w podmiocie gospodarczym.',
        acceptedFiles: 'Akceptowane formaty plików: PDF, PNG, JPEG. Łączny rozmiar plików dla każdej sekcji nie może przekraczać 5 MB.',
        proofOfBeneficialOwner: 'Dowód beneficjenta rzeczywistego',
        proofOfBeneficialOwnerDescription:
            'Prosimy o dostarczenie podpisanego oświadczenia oraz schematu organizacyjnego od biegłego księgowego, notariusza lub prawnika potwierdzającego posiadanie 25% lub więcej udziałów w firmie. Dokument musi być datowany na okres nie dłuższy niż ostatnie trzy miesiące i zawierać numer licencji osoby podpisującej.',
        copyOfID: 'Kopia dokumentu tożsamości beneficjenta rzeczywistego',
        copyOfIDDescription: 'Przykłady: paszport, prawo jazdy itp.',
        proofOfAddress: 'Potwierdzenie adresu dla beneficjenta rzeczywistego',
        proofOfAddressDescription: 'Przykłady: rachunek za media, umowa najmu itp.',
        codiceFiscale: 'Codice fiscale/Identyfikator podatkowy',
        codiceFiscaleDescription:
            'Prześlij nagranie wideo z wizyty w siedzibie firmy lub zarejestrowanej rozmowy z osobą upoważnioną do podpisu. Osoba ta musi podać: pełne imię i nazwisko, datę urodzenia, nazwę firmy, numer rejestracyjny, numer identyfikacji podatkowej, adres siedziby, rodzaj prowadzonej działalności oraz cel założenia konta.',
    },
    completeVerificationStep: {
        completeVerification: 'Zakończ weryfikację',
        confirmAgreements: 'Proszę potwierdzić poniższe zgody.',
        certifyTrueAndAccurate: 'Oświadczam, że podane informacje są prawdziwe i dokładne',
        certifyTrueAndAccurateError: 'Proszę poświadczyć, że informacje są prawdziwe i dokładne',
        isAuthorizedToUseBankAccount: 'Jestem upoważniony(-a) do korzystania z tego firmowego rachunku bankowego na potrzeby wydatków służbowych',
        isAuthorizedToUseBankAccountError: 'Musisz być osobą upoważnioną do zarządzania firmowym rachunkiem bankowym',
        termsAndConditions: 'regulamin',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Zweryfikuj swoje konto bankowe',
        validateButtonText: 'Zatwierdź',
        validationInputLabel: 'Transakcja',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego została wyłączona z powodu zbyt wielu nieprawidłowych prób.',
        description: `W ciągu 1–2 dni roboczych wyślemy trzy (3) małe transakcje na Twoje konto bankowe z nazwy podobnej do „Expensify, Inc. Validation”.`,
        descriptionCTA: 'Wprowadź kwotę każdej transakcji w polach poniżej. Przykład: 1,51.',
        letsChatText: 'Prawie gotowe! Potrzebujemy Twojej pomocy, aby zweryfikować jeszcze kilka ostatnich informacji na czacie. Gotowy?',
        enable2FATitle: 'Aby zapobiec oszustwom, włącz uwierzytelnianie dwuskładnikowe (2FA)',
        enable2FAText: 'Poważnie traktujemy Twoje bezpieczeństwo. Skonfiguruj teraz 2FA, aby dodać dodatkową warstwę ochrony swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    countryStep: {
        confirmBusinessBank: 'Potwierdź walutę i kraj firmowego konta bankowego',
        confirmCurrency: 'Potwierdź walutę i kraj',
        yourBusiness: 'Waluta firmowego konta bankowego musi być zgodna z walutą Twojego workspace.',
        youCanChange: 'Możesz zmienić walutę swojego przestrzeni roboczej w swojej',
        findCountry: 'Znajdź kraj',
        selectCountry: 'Wybierz kraj',
    },
    bankInfoStep: {
        whatAreYour: 'Jakie są dane Twojego firmowego konta bankowego?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda w porządku.',
        thisBankAccount: 'To to konto bankowe będzie używane do płatności firmowych w Twojej przestrzeni roboczej',
        accountNumber: 'Numer konta',
        accountHolderNameDescription: 'Imię i nazwisko upoważnionego podpisującego',
    },
    signerInfoStep: {
        signerInfo: 'Informacje o podpisującym',
        areYouDirector: (companyName: string) => `Czy jesteś dyrektorem w ${companyName}?`,
        regulationRequiresUs: 'Przepisy wymagają od nas zweryfikowania, czy osoba podpisująca ma uprawnienia do podjęcia tej czynności w imieniu firmy.',
        whatsYourName: 'Jak brzmi Twoje imię i nazwisko zgodne z dokumentami',
        fullName: 'Pełne imię i nazwisko',
        whatsYourJobTitle: 'Jakie jest twoje stanowisko?',
        jobTitle: 'Stanowisko',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        uploadID: 'Prześlij dokument tożsamości i potwierdzenie adresu',
        personalAddress: 'Potwierdzenie adresu zamieszkania (np. rachunek za media)',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Nazwa prawna',
        proofOf: 'Potwierdzenie adresu zamieszkania',
        enterOneEmail: (companyName: string) => `Wpisz adres e-mail dyrektora w ${companyName}`,
        regulationRequiresOneMoreDirector: 'Regulacje wymagają co najmniej jeszcze jednego dyrektora jako sygnatariusza.',
        hangTight: 'Proszę czekać…',
        enterTwoEmails: (companyName: string) => `Wpisz adresy e‑mail dwóch dyrektorów w ${companyName}`,
        sendReminder: 'Wyślij przypomnienie',
        chooseFile: 'Wybierz plik',
        weAreWaiting: 'Czekamy, aż inne osoby potwierdzą swoją tożsamość jako dyrektorzy firmy.',
        id: 'Kopia dokumentu tożsamości',
        proofOfDirectors: 'Dowód pełnienia funkcji dyrektora/dyrektorów',
        proofOfDirectorsDescription: 'Przykłady: Oncorp Corporate Profile lub Business Registration.',
        codiceFiscale: 'Kod podatkowy',
        codiceFiscaleDescription: 'Codice Fiscale dla sygnatariuszy, upoważnionych użytkowników i beneficjentów rzeczywistych.',
        PDSandFSG: 'Dokumenty ujawniające PDS + FSG',
        PDSandFSGDescription: dedent(`
            Nasze partnerstwo z Corpay wykorzystuje połączenie API, aby skorzystać z ich rozległej sieci międzynarodowych partnerów bankowych do obsługi Global Reimbursements w Expensify. Zgodnie z australijskimi przepisami przekazujemy Ci Przewodnik po usługach finansowych (Financial Services Guide, FSG) oraz Oświadczenie o ujawnieniu informacji o produkcie (Product Disclosure Statement, PDS) firmy Corpay.

            Prosimy o dokładne przeczytanie dokumentów FSG i PDS, ponieważ zawierają one pełne szczegóły oraz ważne informacje na temat produktów i usług oferowanych przez Corpay. Zachowaj te dokumenty do przyszłego wglądu.
        `),
        pleaseUpload: 'Prześlij poniżej dodatkową dokumentację, która pomoże nam zweryfikować Twoją tożsamość jako dyrektora firmy.',
        enterSignerInfo: 'Wprowadź dane sygnatariusza',
        thisStep: 'Ten krok został ukończony',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `łączy firmowe konto bankowe w ${currency} kończące się na ${bankAccountLastFour} z Expensify, aby wypłacać wynagrodzenia pracownikom w ${currency}. Następny krok wymaga informacji o sygnatariuszu od członka zarządu.`,
        error: {
            emailsMustBeDifferent: 'Adresy e‑mail muszą być różne',
        },
    },
    agreementsStep: {
        agreements: 'Umowy',
        pleaseConfirm: 'Potwierdź poniższe zgody',
        regulationRequiresUs: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        iAmAuthorized: 'Jestem upoważniony do korzystania z firmowego rachunku bankowego na wydatki służbowe.',
        iCertify: 'Oświadczam, że podane informacje są prawdziwe i dokładne.',
        iAcceptTheTermsAndConditions: `Akceptuję <a href="https://cross-border.corpay.com/tc/">warunki i zasady</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Akceptuję regulamin.',
        accept: 'Zaakceptuj i dodaj konto bankowe',
        iConsentToThePrivacyNotice: 'Wyrażam zgodę na <a href="https://payments.corpay.com/compliance">informację o prywatności</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Wyrażam zgodę na politykę prywatności.',
        error: {
            authorized: 'Musisz być osobą upoważnioną do zarządzania firmowym rachunkiem bankowym',
            certify: 'Proszę poświadczyć, że informacje są prawdziwe i dokładne',
            consent: 'Prosimy o wyrażenie zgody na informację o prywatności',
        },
    },
    docusignStep: {
        subheader: 'Formularz DocuSign',
        pleaseComplete:
            'Prosimy wypełnić formularz autoryzacji ACH, korzystając z poniższego linku Docusign, a następnie przesłać tutaj podpisaną kopię, abyśmy mogli pobierać środki bezpośrednio z Twojego konta bankowego',
        pleaseCompleteTheBusinessAccount: 'Proszę wypełnić wniosek o rachunek firmowy – Ustalenia dotyczące polecenia zapłaty',
        pleaseCompleteTheDirect:
            'Prosimy o wypełnienie Umowy Polecenia Zapłaty, korzystając z poniższego linku Docusign, a następnie przesłanie tutaj podpisanej kopii, abyśmy mogli pobierać środki bezpośrednio z Twojego konta bankowego.',
        takeMeTo: 'Przejdź do DocuSign',
        uploadAdditional: 'Prześlij dodatkową dokumentację',
        pleaseUpload: 'Proszę przesłać formularz DEFT oraz stronę z podpisem Docusign.',
        pleaseUploadTheDirect: 'Prześlij proszę Uzgodnienia dotyczące polecenia zapłaty oraz stronę z podpisem Docusign',
    },
    finishStep: {
        letsFinish: 'Dokończmy na czacie!',
        thanksFor:
            'Dziękujemy za te informacje. Dedykowany agent wsparcia teraz je przejrzy. Skontaktujemy się z Tobą ponownie, jeśli będziemy potrzebować od Ciebie czegoś jeszcze, ale w międzyczasie możesz śmiało pisać do nas z wszelkimi pytaniami.',
        iHaveA: 'Mam pytanie',
        enable2FA: 'Włącz uwierzytelnianie dwuskładnikowe (2FA), aby zapobiec oszustwom',
        weTake: 'Poważnie traktujemy Twoje bezpieczeństwo. Skonfiguruj teraz 2FA, aby dodać dodatkową warstwę ochrony swojego konta.',
        secure: 'Zabezpiecz swoje konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Chwileczkę',
        explanationLine: 'Sprawdzamy teraz Twoje informacje. Wkrótce będziesz mógł kontynuować kolejne kroki.',
    },
    session: {
        offlineMessageRetry: 'Wygląda na to, że jesteś offline. Sprawdź swoje połączenie i spróbuj ponownie.',
    },
    travel: {
        header: 'Zarezerwuj podróż',
        title: 'Podróżuj mądrze',
        subtitle: 'Skorzystaj z Expensify Travel, aby uzyskać najlepsze oferty podróży i zarządzać wszystkimi wydatkami biznesowymi w jednym miejscu.',
        features: {
            saveMoney: 'Oszczędzaj pieniądze na swoich rezerwacjach',
            alerts: 'Otrzymuj alerty w czasie rzeczywistym, jeśli Twoje plany podróży się zmienią',
        },
        bookTravel: 'Zarezerwuj podróż',
        bookDemo: 'Zarezerwuj demo',
        bookADemo: 'Umów prezentację',
        toLearnMore: 'aby dowiedzieć się więcej.',
        termsAndConditions: {
            header: 'Zanim przejdziemy dalej…',
            title: 'Regulamin i warunki',
            label: 'Zgadzam się z warunkami korzystania',
            subtitle: `Proszę zaakceptować <a href="${CONST.TRAVEL_TERMS_URL}">warunki korzystania z usługi i regulamin</a> Expensify Travel.`,
            error: 'Aby kontynuować, musisz zaakceptować regulamin Expensify Travel i warunki korzystania z usługi',
            defaultWorkspaceError:
                'Musisz ustawić domyślne miejsce pracy, aby włączyć Expensify Travel. Przejdź do Ustawienia > Miejsca pracy > kliknij trzy pionowe kropki obok miejsca pracy > Ustaw jako domyślne miejsce pracy, a następnie spróbuj ponownie!',
        },
        flight: 'Lot',
        flightDetails: {
            passenger: 'Pasażer',
            layover: (layover: string) => `<muted-text-label>Masz <strong>${layover} międzylądowanie</strong> przed tym lotem</muted-text-label>`,
            takeOff: 'Odlot',
            landing: 'Strona startowa',
            seat: 'Miejsce',
            class: 'Klasa kabiny',
            recordLocator: 'Identyfikator rezerwacji',
            cabinClasses: {
                unknown: 'Nieznane',
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
            cancellation: 'Zasady anulowania',
            cancellationUntil: 'Darmowa anulacja do',
            confirmation: 'Numer potwierdzenia',
            cancellationPolicies: {
                unknown: 'Nieznane',
                nonRefundable: 'Bezzwrotne',
                freeCancellationUntil: 'Darmowa anulacja do',
                partiallyRefundable: 'Częściowo zwracane',
            },
        },
        car: 'Samochód',
        carDetails: {
            rentalCar: 'Wypożyczenie samochodu',
            pickUp: 'Odbiór',
            dropOff: 'Miejsce odbioru',
            driver: 'Kierowca',
            carType: 'Typ samochodu',
            cancellation: 'Zasady anulowania',
            cancellationUntil: 'Darmowa anulacja do',
            freeCancellation: 'Bezpłatne anulowanie',
            confirmation: 'Numer potwierdzenia',
        },
        train: 'Kolej',
        trainDetails: {
            passenger: 'Pasażer',
            departs: 'Odjazd',
            arrives: 'Przylatuje',
            coachNumber: 'Numer wagonu',
            seat: 'Miejsce',
            fareDetails: 'Szczegóły opłaty',
            confirmation: 'Numer potwierdzenia',
        },
        viewTrip: 'Wyświetl podróż',
        modifyTrip: 'Edytuj podróż',
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
                `Nie masz uprawnień, aby włączyć Expensify Travel dla domeny <strong>${domain}</strong>. Musisz poprosić kogoś z tej domeny, aby zamiast tego włączył Travel.`,
            accountantInvitation: `Jeśli jesteś księgowym, rozważ dołączenie do <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">programu dla księgowych ExpensifyApproved!</a>, aby włączyć podróże dla tej domeny.`,
        },
        publicDomainError: {
            title: 'Rozpocznij pracę z Expensify Travel',
            message: `Musisz używać służbowego adresu e-mail (np. name@company.com) w Expensify Travel, a nie prywatnego adresu e-mail (np. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel zostało wyłączone',
            message: `Twój administrator wyłączył Expensify Travel. Postępuj zgodnie z firmową polityką rezerwacji przy organizowaniu podróży.`,
        },
        verifyCompany: {
            title: 'Przeglądamy Twoje zgłoszenie…',
            message: `Po naszej stronie przeprowadzamy kilka kontroli, aby upewnić się, że Twoje konto jest gotowe na Expensify Travel. Wkrótce się z Tobą skontaktujemy!`,
            confirmText: 'Rozumiem',
            conciergeMessage: ({domain}: {domain: string}) => `Konfigurowanie podróży nie powiodło się dla domeny: ${domain}. Sprawdź i włącz obsługę podróży dla tej domeny.`,
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
            flightScheduleChangePending: (airlineCode: string) => `Linie lotnicze zaproponowały zmianę rozkładu lotu ${airlineCode}; oczekujemy na potwierdzenie.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Zmiana planu potwierdzona: lot ${airlineCode} odlot teraz o ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zaktualizowany.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Twoja klasa kabiny została zaktualizowana do ${cabinClass} na locie ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Twoje miejsce na locie ${airlineCode} zostało potwierdzone.`,
            flightSeatChanged: (airlineCode: string) => `Twoje miejsce na locie ${airlineCode} zostało zmienione.`,
            flightSeatCancelled: (airlineCode: string) => `Twoje przydzielone miejsce na locie ${airlineCode} zostało usunięte.`,
            paymentDeclined: 'Płatność za rezerwację lotu nie powiodła się. Spróbuj ponownie.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Anulowano Twoją rezerwację ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Dostawca anulował Twoją rezerwację ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Twoja rezerwacja ${type} została ponownie zarezerwowana. Nowy numer potwierdzenia: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Twoja rezerwacja ${type} została zaktualizowana. Sprawdź nowe szczegóły w planie podróży.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Twój bilet kolejowy z ${origin} → ${destination} na ${startDate} został zwrócony. Zostanie przetworzony kredyt.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Twój bilet kolejowy z ${origin} → ${destination} na ${startDate} został wymieniony.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Twój bilet kolejowy z ${origin} → ${destination} na ${startDate} został zaktualizowany.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Twoja rezerwacja typu ${type} została zaktualizowana.`,
        },
        flightTo: 'Lot do',
        trainTo: 'Pociąg do',
        carRental: 'wynajem samochodu',
        nightIn: 'noc w',
        nightsIn: 'noce w',
    },
    workspace: {
        common: {
            card: 'Karty',
            expensifyCard: 'Karta Expensify',
            companyCards: 'Firmowe karty',
            workflows: 'Przepływy pracy',
            workspace: 'Workspace',
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
            customFieldHint: 'Dodaj niestandardowe kodowanie, które ma zastosowanie do wszystkich wydatków tego członka.',
            reports: 'Raporty',
            reportFields: 'Pola raportu',
            reportTitle: 'Tytuł raportu',
            reportField: 'Pole raportu',
            taxes: 'Podatki',
            bills: 'Rachunki',
            invoices: 'Faktury',
            perDiem: 'Dieta',
            travel: 'Podróż',
            members: 'Członkowie',
            accounting: 'Księgowość',
            receiptPartners: 'Partnerzy paragonów',
            rules: 'Zasady',
            displayedAs: 'Wyświetlane jako',
            plan: 'Plan',
            profile: 'Przegląd',
            bankAccount: 'Konto bankowe',
            testTransactions: 'Transakcje testowe',
            issueAndManageCards: 'Wystawiaj i zarządzaj kartami',
            reconcileCards: 'Uzgadniaj karty',
            selectAll: 'Zaznacz wszystko',
            selected: () => ({
                one: 'Wybrano 1',
                other: (count: number) => `Wybrano: ${count}`,
            }),
            settlementFrequency: 'Częstotliwość rozliczania',
            setAsDefault: 'Ustaw jako domyślną przestrzeń roboczą',
            defaultNote: `Paragony wysłane na ${CONST.EMAIL.RECEIPTS} pojawią się w tym obszarze roboczym.`,
            deleteConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą?',
            deleteWithCardsConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą? Spowoduje to usunięcie wszystkich źródeł kart i przypisanych kart.',
            unavailable: 'Niedostępne miejsce pracy',
            memberNotFound: 'Nie znaleziono członka. Aby zaprosić nowego członka do przestrzeni roboczej, skorzystaj z przycisku zaproszenia powyżej.',
            notAuthorized: `Nie masz dostępu do tej strony. Jeśli próbujesz dołączyć do tego obszaru roboczego, poproś jego właściciela, aby dodał Cię jako członka. Coś innego? Skontaktuj się z ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Przejdź do przestrzeni roboczej',
            duplicateWorkspace: 'Duplikuj przestrzeń roboczą',
            duplicateWorkspacePrefix: 'Duplikat',
            goToWorkspaces: 'Przejdź do przestrzeni roboczych',
            clearFilter: 'Wyczyść filtr',
            workspaceName: 'Nazwa przestrzeni roboczej',
            workspaceOwner: 'Właściciel',
            workspaceType: 'Typ przestrzeni roboczej',
            workspaceAvatar: 'Awatar przestrzeni roboczej',
            mustBeOnlineToViewMembers: 'Musisz być online, aby wyświetlić członków tego obszaru roboczego.',
            moreFeatures: 'Więcej funkcji',
            requested: 'Zażądano',
            distanceRates: 'Stawki za dystans',
            defaultDescription: 'Jedno miejsce na wszystkie Twoje paragony i wydatki.',
            descriptionHint: 'Udostępnij informacje o tym obszarze roboczym wszystkim członkom.',
            welcomeNote: 'Prosimy o przesłanie paragonów do zwrotu kosztów za pomocą Expensify, dziękujemy!',
            subscription: 'Subskrypcja',
            markAsEntered: 'Oznacz jako wprowadzony ręcznie',
            markAsExported: 'Oznacz jako wyeksportowane',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Eksportuj do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
            lineItemLevel: 'Na poziomie pozycji',
            reportLevel: 'Poziom raportu',
            topLevel: 'Najwyższy poziom',
            appliedOnExport: 'Niezaimportowane do Expensify, zastosowane przy eksporcie',
            shareNote: {
                header: 'Udostępnij swój obszar roboczy innym członkom',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Udostępnij ten kod QR lub skopiuj poniższy link, aby ułatwić członkom proszenie o dostęp do Twojej przestrzeni roboczej. Wszystkie prośby o dołączenie do przestrzeni roboczej pojawią się w pokoju <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> do Twojej weryfikacji.`,
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
            memberAlternateText: 'Zatwierdzaj i przesyłaj raporty.',
            adminAlternateText: 'Zarządzaj raportami i ustawieniami przestrzeni roboczej.',
            auditorAlternateText: 'Przeglądaj raporty i komentuj je.',
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
                weekly: 'Tygodniowo',
                semimonthly: 'Dwa razy w miesiącu',
                monthly: 'Miesięcznie',
            },
            planType: 'Typ planu',
            defaultCategory: 'Domyślna kategoria',
            viewTransactions: 'Wyświetl transakcje',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Wydatki użytkownika ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Transakcje kartą Expensify będą automatycznie eksportowane do „Konta zobowiązań karty Expensify”, utworzonego za pomocą <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">naszej integracji</a>.</muted-text-label>`,
            youCantDowngradeInvoicing:
                'Nie możesz zmienić swojego planu na niższy w ramach subskrypcji rozliczanej fakturą. Aby omówić lub wprowadzić zmiany w swojej subskrypcji, skontaktuj się ze swoim opiekunem klienta lub Concierge, aby uzyskać pomoc.',
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Połączono z ${organizationName}` : 'Automatyzuj wydatki na podróże i dostawy posiłków w całej swojej organizacji.',
                sendInvites: 'Wyślij zaproszenia',
                sendInvitesDescription:
                    'Ci członkowie przestrzeni roboczej nie mają jeszcze konta Uber for Business. Odznacz wszystkich członków, których nie chcesz zapraszać w tym momencie.',
                confirmInvite: 'Potwierdź zaproszenie',
                manageInvites: 'Zarządzaj zaproszeniami',
                confirm: 'Potwierdź',
                allSet: 'Wszystko gotowe',
                readyToRoll: 'Możesz zaczynać',
                takeBusinessRideMessage: 'Skorzystaj z przejazdu służbowego Uberem, a Twoje rachunki automatycznie zaimportują się do Expensify. Ruszaj!',
                all: 'Wszystkie',
                linked: 'Połączono',
                outstanding: 'Zaległe',
                status: {
                    resend: 'Wyślij ponownie',
                    invite: 'Zaproś',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Połączono',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Oczekujące',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Zawieszony',
                },
                centralBillingAccount: 'Centralne konto rozliczeniowe',
                centralBillingDescription: 'Wybierz, gdzie importować wszystkie paragony Uber.',
                invitationFailure: 'Nie udało się zaprosić członka do Uber for Business',
                autoInvite: 'Zaproś nowych członków przestrzeni roboczej do Uber for Business',
                autoRemove: 'Dezaktywuj usuniętych członków przestrzeni roboczej w Uber for Business',
                emptyContent: {
                    title: 'Brak oczekujących zaproszeń',
                    subtitle: 'Hura! Szukaliśmy wszędzie i nie znaleźliśmy żadnych zaległych zaproszeń.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Ustaw stawki diet, aby kontrolować dziennie wydatki pracowników. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Dowiedz się więcej</a>.</muted-text>`,
            amount: 'Kwota',
            deleteRates: () => ({
                one: 'Usuń stawkę',
                other: 'Usuń stawki',
            }),
            deletePerDiemRate: 'Usuń stawkę ryczałtu dziennego',
            findPerDiemRate: 'Znajdź stawkę ryczałtową',
            areYouSureDelete: () => ({
                one: 'Czy na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }),
            emptyList: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki diet, aby kontrolować dzienne wydatki pracowników. Zaimportuj stawki z arkusza kalkulacyjnego, aby rozpocząć.',
            },
            importPerDiemRates: 'Importuj stawki diet',
            editPerDiemRate: 'Edytuj stawkę ryczałtową',
            editPerDiemRates: 'Edytuj stawki diet',
            editDestinationSubtitle: (destination: string) => `Zaktualizowanie tego miejsca docelowego zmieni je dla wszystkich podstawek diet ${destination}.`,
            editCurrencySubtitle: (destination: string) => `Aktualizacja tej waluty zmieni ją dla wszystkich stawek dziennych ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportu wydatków z własnej kieszeni do QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Oznacza czeki jako „wydrukuj później”',
            exportDescription: 'Skonfiguruj sposób eksportowania danych z Expensify do QuickBooks Desktop.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje kart Expensify jako',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie zaksięgować wpisy do dziennika.',
            accountsPayable: 'Zobowiązania',
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
                        description: 'Data wyeksportowania raportu do QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data wysłania',
                        description: 'Data wysłania raportu do zatwierdzenia.',
                    },
                },
            },
            exportCheckDescription: 'Utworzymy wyszczególniony czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy zapis w dzienniku dla każdego raportu Expensify i zaksięgujemy go na poniższym koncie.',
            exportVendorBillDescription:
                'Utworzymy wyszczególnioną fakturę kosztową od dostawcy dla każdego raportu w Expensify i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop nie obsługuje podatków przy eksporcie zapisów księgowych. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Zapisy księgowe są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Zapis księgowy',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawdź',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Utworzymy wyszczególniony czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji na karcie kredytowej do odpowiadających jej dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Credit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy wyszczególniony rachunek dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy go do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy go na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji z karty kredytowej.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wybierz dostawcę, którego zastosować do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wybierz, skąd wysyłać czeki.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Rachunki od dostawców są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Zapisy księgowe są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Desktop i zsynchronizuj połączenie ponownie',
            qbdSetup: 'Konfiguracja QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Nie można połączyć z tego urządzenia',
                body1: 'Musisz skonfigurować to połączenie z komputera, na którym znajduje się plik firmy QuickBooks Desktop.',
                body2: 'Po połączeniu będziesz mógł synchronizować i eksportować dane z dowolnego miejsca.',
            },
            setupPage: {
                title: 'Otwórz ten link, aby się połączyć',
                body: 'Aby zakończyć konfigurację, otwórz poniższy link na komputerze, na którym działa QuickBooks Desktop.',
                setupErrorTitle: 'Coś poszło nie tak',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>Połączenie z QuickBooks Desktop nie działa w tej chwili. Spróbuj ponownie później lub <a href="${conciergeLink}">skontaktuj się z Concierge</a>, jeśli problem będzie się powtarzał.</centered-text></muted-text>`,
            },
            importDescription: 'Wybierz konfiguracje kodowania do zaimportowania z QuickBooks Desktop do Expensify.',
            classes: 'Klasy',
            items: 'Pozycje',
            customers: 'Klienci/projekty',
            exportCompanyCardsDescription: 'Ustaw sposób eksportowania zakupów na firmowe karty do QuickBooks Desktop.',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który będzie stosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            accountsDescription: 'Twój plan kont w QuickBooks Desktop zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone lub wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz sposób obsługi klas QuickBooks Desktop w Expensify.',
            tagsDisplayedAsDescription: 'Poziom pozycji',
            reportFieldsDisplayedAsDescription: 'Poziom raportu',
            customersDescription: 'Wybierz sposób obsługi klientów/projektów QuickBooks Desktop w Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z QuickBooks Desktop codziennie.',
                createEntities: 'Automatycznie twórz jednostki',
                createEntitiesDescription: 'Expensify automatycznie utworzy dostawców w QuickBooks Desktop, jeśli jeszcze nie istnieją.',
            },
            itemsDescription: 'Wybierz sposób obsługi elementów QuickBooks Desktop w Expensify.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz moment eksportu wydatków:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriał',
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
            accountsDescription: 'Twój plan kont QuickBooks Online zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone lub wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz sposób obsługi klas QuickBooks Online w Expensify.',
            customersDescription: 'Wybierz sposób obsługi klientów/projektów QuickBooks Online w Expensify.',
            locationsDescription: 'Wybierz sposób obsługi lokalizacji QuickBooks Online w Expensify.',
            taxesDescription: 'Wybierz sposób obsługi podatków QuickBooks Online w Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online nie obsługuje lokalizacji na poziomie wiersza dla czeków lub rachunków dostawców. Jeśli chcesz mieć lokalizacje na poziomie wiersza, upewnij się, że używasz zapisów w dzienniku oraz wydatków kartą kredytową/debetową.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online nie obsługuje podatków w zapisach w dzienniku. Zmień proszę opcję eksportu na rachunek dostawcy lub czek.',
            exportDescription: 'Skonfiguruj sposób eksportowania danych z Expensify do QuickBooks Online.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje kart Expensify jako',
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
                        description: 'Data wysłania raportu do zatwierdzenia.',
                    },
                },
            },
            receivable: 'Należności z tytułu dostaw i usług', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archiwum należności z tytułu dostaw i usług', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Użyj tego konta podczas eksportowania faktur do QuickBooks Online.',
            exportCompanyCardsDescription: 'Ustaw sposób eksportowania zakupów kartą służbową do QuickBooks Online.',
            vendor: 'Dostawca',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który będzie stosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportu wydatków z własnej kieszeni do QuickBooks Online.',
            exportCheckDescription: 'Utworzymy wyszczególniony czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy zapis w dzienniku dla każdego raportu Expensify i zaksięgujemy go na poniższym koncie.',
            exportVendorBillDescription:
                'Utworzymy wyszczególnioną fakturę kosztową od dostawcy dla każdego raportu w Expensify i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie zaksięgować wpisy do dziennika.',
            accountsPayable: 'Zobowiązania',
            accountsPayableDescription: 'Wybierz, gdzie utworzyć rachunki dostawców.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nieskonfigurowane',
            bankAccountDescription: 'Wybierz, skąd wysyłać czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online nie obsługuje lokalizacji w eksporcie rachunków od dostawców. Ponieważ masz włączone lokalizacje w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online nie obsługuje podatków przy eksporcie zapisów w dzienniku. Ponieważ w swoim obszarze roboczym masz włączone podatki, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Zapisy księgowe są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie codziennie automatycznie synchronizować się z QuickBooks Online.',
                inviteEmployees: 'Zaproś pracowników',
                inviteEmployeesDescription: 'Zaimportuj rekordy pracowników z QuickBooks Online i zaproś pracowników do tego obszaru roboczego.',
                createEntities: 'Automatycznie twórz jednostki',
                createEntitiesDescription:
                    'Expensify będzie automatycznie tworzyć dostawców w QuickBooks Online, jeśli jeszcze nie istnieją, oraz automatycznie tworzyć klientów podczas eksportowania faktur.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiadająca mu płatność rachunku zostanie utworzona na koncie QuickBooks Online poniżej.',
                qboBillPaymentAccount: 'Konto płatności rachunków QuickBooks',
                qboInvoiceCollectionAccount: 'Konto windykacji faktur QuickBooks',
                accountSelectDescription: 'Wybierz, z którego konta płacić rachunki, a my utworzymy płatność w QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie chcesz otrzymywać płatności za faktury, a my utworzymy płatność w QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Karta debetowa',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Zapis księgowy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawdź',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą debetową do odpowiadających jej dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Debit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji na karcie kredytowej do odpowiadających jej dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Credit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy wyszczególniony rachunek dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy go do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy go na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wybierz, dokąd eksportować transakcje kartą debetową.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji z karty kredytowej.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wybierz dostawcę, którego zastosować do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Rachunki od dostawców są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Zapisy księgowe są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wybierz prawidłowe konto do eksportu rachunku dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wybierz prawidłowe konto do eksportu zapisu w dzienniku',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wybierz prawidłowe konto do eksportu czeków',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Aby używać eksportu rachunków dostawców, skonfiguruj konto zobowiązań wobec dostawców w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Aby użyć eksportu zapisów w dzienniku, skonfiguruj konto dziennika w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Aby użyć eksportu czeków, skonfiguruj konto bankowe w QuickBooks Online',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Online i zsynchronizuj połączenie ponownie.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz moment eksportu wydatków:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriał',
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
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone lub wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne do wyboru dla członków podczas tworzenia ich wydatków.',
            trackingCategories: 'Kategorie śledzenia',
            trackingCategoriesDescription: 'Wybierz sposób obsługi kategorii śledzenia Xero w Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `Mapuj ${categoryName} w Xero do`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Wybierz, gdzie zmapować ${categoryName} podczas eksportu do Xero.`,
            customers: 'Refakturowanie klientów',
            customersDescription:
                'Wybierz, czy ponownie obciążać klientów w Expensify. Twoje kontakty klientów z Xero mogą być tagowane do wydatków i zostaną wyeksportowane do Xero jako faktura sprzedaży.',
            taxesDescription: 'Wybierz sposób obsługi podatków Xero w Expensify.',
            notImported: 'Niezainportowane',
            notConfigured: 'Nieskonfigurowane',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Domyślny kontakt Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tagi',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Pola raportu',
            },
            exportDescription: 'Skonfiguruj sposób eksportu danych z Expensify do Xero.',
            purchaseBill: 'Rachunek zakupu',
            exportDeepDiveCompanyCard:
                'Wyeksportowane wydatki zostaną zaksięgowane jako transakcje bankowe na poniższym koncie bankowym Xero, a daty transakcji będą zgodne z datami na Twoim wyciągu bankowym.',
            bankTransactions: 'Transakcje bankowe',
            xeroBankAccount: 'Konto bankowe Xero',
            xeroBankAccountDescription: 'Wybierz, gdzie wydatki będą księgowane jako transakcje bankowe.',
            exportExpensesDescription: 'Raporty zostaną wyeksportowane jako rachunek zakupu z datą i statusem wybranymi poniżej.',
            purchaseBillDate: 'Data zakupu rachunku',
            exportInvoices: 'Eksportuj faktury jako',
            salesInvoice: 'Faktura sprzedaży',
            exportInvoicesDescription: 'Faktury sprzedażowe zawsze wyświetlają datę wysłania faktury.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Xero każdego dnia.',
                purchaseBillStatusTitle: 'Status rachunku zakupu',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Xero.',
                xeroBillPaymentAccount: 'Konto płatności rachunków Xero',
                xeroInvoiceCollectionAccount: 'Konto do pobierania należności z faktur Xero',
                xeroBillPaymentAccountDescription: 'Wybierz, z którego konta chcesz opłacać rachunki, a my utworzymy płatność w Xero.',
                invoiceAccountSelectorDescription: 'Wybierz miejsce otrzymywania płatności za faktury, a my utworzymy płatność w Xero.',
            },
            exportDate: {
                label: 'Data zakupu rachunku',
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
                        description: 'Data wysłania raportu do zatwierdzenia.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status rachunku zakupu',
                description: 'Użyj tego statusu podczas eksportowania rachunków zakupu do Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Szkic',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Oczekuje na zatwierdzenie',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Oczekuje na płatność',
                },
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w Xero i ponownie zsynchronizuj połączenie',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz moment eksportu wydatków:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriał',
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
                        label: 'Data wysłania',
                        description: 'Data wysłania raportu do zatwierdzenia.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Ustaw sposób eksportowania wydatków pokrywanych z własnej kieszeni do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Raporty wydatków',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Faktury od dostawców',
                },
            },
            nonReimbursableExpenses: {
                description: 'Ustaw sposób eksportowania zakupów na firmowe karty do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Karty kredytowe',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Faktury od dostawców',
                },
            },
            creditCardAccount: 'Konto karty kredytowej',
            defaultVendor: 'Domyślny dostawca',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Ustaw domyślnego dostawcę, który będzie stosowany do ${isReimbursable ? '' : 'nie-'}wydatków podlegających zwrotowi, które nie mają pasującego dostawcy w Sage Intacct.`,
            exportDescription: 'Skonfiguruj sposób eksportowania danych z Expensify do Sage Intacct.',
            exportPreferredExporterNote:
                'Preferowany eksporter może być dowolnym administratorem przestrzeni roboczej, ale musi być także Administratorem Domeny, jeśli ustawisz różne konta eksportu dla poszczególnych firmowych kart w Ustawieniach Domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter będzie widzieć raporty do eksportu na swoim koncie.',
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: `Dodaj konto w Sage Intacct i ponownie zsynchronizuj połączenie`,
            autoSync: 'Automatyczna synchronizacja',
            autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Sage Intacct każdego dnia.',
            inviteEmployees: 'Zaproś pracowników',
            inviteEmployeesDescription:
                'Zaimportuj rekordy pracowników Sage Intacct i zaproś pracowników do tego obszaru roboczego. Twój proces akceptacji będzie domyślnie ustawiony na zatwierdzanie przez menedżera i może być dalej konfigurowany na stronie Członkowie.',
            syncReimbursedReports: 'Synchronizuj rozliczone raporty',
            syncReimbursedReportsDescription:
                'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Sage Intacct.',
            paymentAccount: 'Konto płatnicze Sage Intacct',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz moment eksportu wydatków:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriał',
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
            journalEntriesTaxPostingAccount: 'Konto księgowania podatku w zapisach księgowych',
            journalEntriesProvTaxPostingAccount: 'Konto księgowania podatku prowincjonalnego w zapisach dziennika',
            foreignCurrencyAmount: 'Eksportuj kwotę w walucie obcej',
            exportToNextOpenPeriod: 'Eksportuj do następnego otwartego okresu',
            nonReimbursableJournalPostingAccount: 'Konto księgowania dla kosztów niepodlegających zwrotowi',
            reimbursableJournalPostingAccount: 'Konto księgowania zwrotów',
            journalPostingPreference: {
                label: 'Preferencja księgowania zapisów w dzienniku',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Pojedynczy, zindywidualizowany wpis dla każdego raportu',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Pojedynczy wpis dla każdego wydatku',
                },
            },
            invoiceItem: {
                label: 'Pozycja faktury',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Stwórz jedną dla mnie',
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
                        label: 'Data wysłania',
                        description: 'Data wysłania raportu do zatwierdzenia.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Raporty wydatków',
                        reimbursableDescription: 'Wydatki z własnej kieszeni zostaną wyeksportowane jako raporty wydatków do NetSuite.',
                        nonReimbursableDescription: 'Wydatki z firmowych kart zostaną wyeksportowane jako raporty wydatków do NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Faktury od dostawców',
                        reimbursableDescription: dedent(`
                            Wydatki z własnej kieszeni zostaną wyeksportowane jako rachunki płatne na rzecz poniższego dostawcy w NetSuite.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Firmowe karty*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Wydatki z kart firmowych zostaną wyeksportowane jako rachunki płatne na rzecz dostawcy NetSuite określonego poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Zapisy w dzienniku',
                        reimbursableDescription: dedent(`
                            Wydatki pokrywane z własnych środków zostaną wyeksportowane jako zapisy księgowe na konto NetSuite określone poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Firmowe karty*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Wydatki z kart firmowych zostaną wyeksportowane jako zapisy w dzienniku do konta NetSuite określonego poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Jeśli zmienisz ustawienie eksportu firmowych kart na raporty wydatków, dostawcy NetSuite i konta księgowe przypisane do poszczególnych kart zostaną wyłączone.\n\nNie martw się, nadal zachowamy Twoje poprzednie wybory na wypadek, gdybyś chciał/chciała później wrócić do poprzednich ustawień.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z NetSuite każdego dnia.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiadająca mu płatność rachunku zostanie utworzona na poniższym koncie NetSuite.',
                reimbursementsAccount: 'Konto do zwrotów',
                reimbursementsAccountDescription: 'Wybierz konto bankowe, którego chcesz używać do zwrotów, a my utworzymy powiązaną płatność w NetSuite.',
                collectionsAccount: 'Konto windykacyjne',
                collectionsAccountDescription: 'Gdy faktura zostanie oznaczona jako opłacona w Expensify i wyeksportowana do NetSuite, pojawi się na koncie poniżej.',
                approvalAccount: 'Konto zatwierdzania zobowiązań (A/P)',
                approvalAccountDescription:
                    'Wybierz konto, względem którego transakcje będą zatwierdzane w NetSuite. Jeśli synchronizujesz rozliczone raporty, będzie to także konto, względem którego zostaną utworzone płatności rachunków.',
                defaultApprovalAccount: 'Domyślne ustawienie NetSuite',
                inviteEmployees: 'Zaproś pracowników i ustaw akceptacje',
                inviteEmployeesDescription:
                    'Zaimportuj rekordy pracowników z NetSuite i zaproś pracowników do tego obszaru roboczego. Twój proces zatwierdzania domyślnie będzie oparty na zatwierdzaniu przez menedżera i można go dalej konfigurować na stronie *Członkowie*.',
                autoCreateEntities: 'Automatyczne tworzenie pracowników/dostawców',
                enableCategories: 'Włącz nowo zaimportowane kategorie',
                customFormID: 'Niestandardowy identyfikator formularza',
                customFormIDDescription:
                    'Domyślnie Expensify będzie tworzyć wpisy, używając preferowanego formularza transakcji ustawionego w NetSuite. Alternatywnie możesz wskazać konkretny formularz transakcji, który ma być używany.',
                customFormIDReimbursable: 'Wydatek z własnej kieszeni',
                customFormIDNonReimbursable: 'Wydatek z karty firmowej',
                exportReportsTo: {
                    label: 'Poziom zatwierdzania raportu wydatków',
                    description:
                        'Po zatwierdzeniu raportu wydatków w Expensify i wyeksportowaniu go do NetSuite możesz w NetSuite ustawić dodatkowy poziom zatwierdzania przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Domyślne ustawienia NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Tylko zatwierdzone przez przełożonego',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Tylko zatwierdzone przez księgowość',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Zatwierdzone przez przełożonego i dział księgowości',
                    },
                },
                accountingMethods: {
                    label: 'Kiedy eksportować',
                    description: 'Wybierz moment eksportu wydatków:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Memoriał',
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
                        'Po zatwierdzeniu rachunku dostawcy w Expensify i wyeksportowaniu go do NetSuite, możesz ustawić w NetSuite dodatkowy poziom zatwierdzania przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Domyślne ustawienia NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zatwierdzono do opublikowania',
                    },
                },
                exportJournalsTo: {
                    label: 'Poziom zatwierdzania zapisu w dzienniku',
                    description:
                        'Po zatwierdzeniu zapisu w dzienniku w Expensify i wyeksportowaniu go do NetSuite możesz w NetSuite ustawić dodatkowy poziom zatwierdzania przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Domyślne ustawienia NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zatwierdzono do opublikowania',
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
            noItemsFoundDescription: 'Dodaj pozycje faktury w NetSuite i ponownie zsynchronizuj połączenie',
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
                            'W NetSuite przejdź do *Setup > Users/Roles > Access Tokens* > utwórz token dostępu dla aplikacji „Expensify” oraz roli „Expensify Integration” lub „Administrator”.\n\n*Ważne:* Upewnij się, że zapiszesz *Token ID* i *Token Secret* z tego kroku. Będziesz ich potrzebować w następnym kroku.',
                    },
                    enterCredentials: {
                        title: 'Wprowadź swoje dane logowania do NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID konta NetSuite',
                            netSuiteTokenID: 'Identyfikator tokena',
                            netSuiteTokenSecret: 'Tajny klucz tokenu',
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
                        subtitle: 'Wybierz, jak obsługiwać *klasy* w Expensify.',
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
                importTaxDescription: 'Importuj grupy podatkowe z NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Wybierz jedną z opcji poniżej:',
                    label: (importedTypes: string[]) => `Zaimportowano jako ${importedTypes.join('i')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Wprowadź ${fieldName}`,
                    customSegments: {
                        title: 'Niestandardowe segmenty/rejestry',
                        addText: 'Dodaj niestandardowy segment/rekord',
                        recordTitle: 'Niestandardowy segment/rekord',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Wyświetl szczegółowe instrukcje',
                        helpText: 'na konfigurowaniu niestandardowych segmentów/rekordów.',
                        emptyTitle: 'Dodaj niestandardowy segment lub niestandardowy rekord',
                        fields: {
                            segmentName: 'Imię',
                            internalID: 'Wewnętrzny identyfikator',
                            scriptID: 'Identyfikator skryptu',
                            customRecordScriptID: 'Identyfikator kolumny transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń niestandardowy segment/rekord',
                        removePrompt: 'Czy na pewno chcesz usunąć ten niestandardowy segment/rekord?',
                        addForm: {
                            customSegmentName: 'niestandardowa nazwa segmentu',
                            customRecordName: 'nazwa rekordu niestandardowego',
                            segmentTitle: 'Segment niestandardowy',
                            customSegmentAddTitle: 'Dodaj niestandardowy segment',
                            customRecordAddTitle: 'Dodaj niestandardowy rekord',
                            recordTitle: 'Rekord niestandardowy',
                            segmentRecordType: 'Czy chcesz dodać niestandardowy segment czy niestandardowy rekord?',
                            customSegmentNameTitle: 'Jaka jest nazwa niestandardowego segmentu?',
                            customRecordNameTitle: 'Jaka jest nazwa rekordu niestandardowego?',
                            customSegmentNameFooter: `Nazwy niestandardowych segmentów znajdziesz w NetSuite na stronie *Customizations > Links, Records & Fields > Custom Segments*.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Możesz znaleźć niestandardowe nazwy rekordów w NetSuite, wpisując „Transaction Column Field” w wyszukiwaniu globalnym.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Jaki jest identyfikator wewnętrzny?',
                            customSegmentInternalIDFooter: `Najpierw upewnij się, że włączyłeś wewnętrzne ID w NetSuite w *Home > Set Preferences > Show Internal ID.*

Wewnętrzne ID segmentów niestandardowych możesz znaleźć w NetSuite w:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Kliknij wybrany segment niestandardowy.
3. Kliknij hiperłącze obok *Custom Record Type*.
4. Znajdź wewnętrzne ID w tabeli na dole.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Możesz znaleźć wewnętrzne identyfikatory (internal ID) niestandardowych rekordów w NetSuite, wykonując następujące kroki:

1. Wpisz „Transaction Line Fields” w wyszukiwaniu globalnym.
2. Kliknij niestandardowy rekord.
3. Znajdź Internal ID po lewej stronie.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Jaki jest identyfikator skryptu?',
                            customSegmentScriptIDFooter: `Identyfikatory skryptów niestandardowych segmentów można znaleźć w NetSuite w:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Kliknij wybrany niestandardowy segment.
3. Kliknij kartę *Application and Sourcing* na dole, a następnie:
    a. Jeśli chcesz wyświetlać niestandardowy segment jako *tag* (na poziomie pozycji) w Expensify, kliknij podkartę *Transaction Columns* i użyj *Field ID*.
    b. Jeśli chcesz wyświetlać niestandardowy segment jako *report field* (na poziomie raportu) w Expensify, kliknij podkartę *Transactions* i użyj *Field ID*.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Jaki jest identyfikator kolumny transakcji?',
                            customRecordScriptIDFooter: `Identyfikatory skryptów rekordów niestandardowych można znaleźć w NetSuite w następujący sposób:

1. Wpisz „Transaction Line Fields” w globalnym wyszukiwaniu.
2. Kliknij rekord niestandardowy.
3. Znajdź identyfikator skryptu (script ID) po lewej stronie.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Jak ten własny segment powinien być wyświetlany w Expensify?',
                            customRecordMappingTitle: 'Jak ten niestandardowy rekord powinien być wyświetlany w Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Niestandardowy segment/rejestr z tym ${fieldName?.toLowerCase()} już istnieje`,
                        },
                    },
                    customLists: {
                        title: 'Listy niestandardowe',
                        addText: 'Dodaj niestandardową listę',
                        recordTitle: 'Lista niestandardowa',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Wyświetl szczegółowe instrukcje',
                        helpText: 'na temat konfigurowania list niestandardowych.',
                        emptyTitle: 'Dodaj listę niestandardową',
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
                            transactionFieldIDFooter: `Możesz znaleźć identyfikatory pól transakcji w NetSuite, wykonując następujące kroki:

1. Wpisz „Transaction Line Fields” w globalnym wyszukiwaniu.
2. Kliknij na listę niestandardową.
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
                        label: 'Domyślne ustawienia pracownika NetSuite',
                        description: 'Niezaimportowane do Expensify, zastosowane przy eksporcie',
                        footerContent: (importField: string) =>
                            `Jeśli używasz ${importField} w NetSuite, zastosujemy domyślną wartość ustawioną w rekordzie pracownika podczas eksportu do Raportu Wydatków lub Zapisu w Dzienniku.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tagi',
                        description: 'Na poziomie pozycji',
                        footerContent: (importField: string) => `${startCase(importField)} będzie można wybrać osobno dla każdego wydatku w raporcie pracownika.`,
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
            prerequisitesTitle: 'Zanim się połączysz...',
            downloadExpensifyPackage: 'Pobierz pakiet Expensify dla Sage Intacct',
            followSteps: 'Postępuj zgodnie z krokami opisanymi w naszych instrukcjach „Jak połączyć się z Sage Intacct”',
            enterCredentials: 'Wprowadź swoje dane logowania do Sage Intacct',
            entity: 'Podmiot',
            employeeDefault: 'Domyślne ustawienie pracownika Sage Intacct',
            employeeDefaultDescription: 'Domyślny dział pracownika zostanie zastosowany do jego wydatków w Sage Intacct, jeśli taki istnieje.',
            displayedAsTagDescription: 'Dział będzie można wybrać dla każdego poszczególnego wydatku w raporcie pracownika.',
            displayedAsReportFieldDescription: 'Wybrany dział zostanie zastosowany do wszystkich wydatków w raporcie pracownika.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wybierz sposób obsługi Sage Intacct <strong>${mappingTitle}</strong> w Expensify.`,
            expenseTypes: 'Typy wydatków',
            expenseTypesDescription: 'Twoje typy wydatków z Sage Intacct zostaną zaimportowane do Expensify jako kategorie.',
            accountTypesDescription: 'Twój plan kont Sage Intacct zostanie zaimportowany do Expensify jako kategorie.',
            importTaxDescription: 'Importuj stawkę podatku od zakupu z Sage Intacct.',
            userDefinedDimensions: 'Wymiary zdefiniowane przez użytkownika',
            addUserDefinedDimension: 'Dodaj zdefiniowany przez użytkownika wymiar',
            integrationName: 'Nazwa integracji',
            dimensionExists: 'Wymiar o tej nazwie już istnieje.',
            removeDimension: 'Usuń zdefiniowany przez użytkownika wymiar',
            removeDimensionPrompt: 'Czy na pewno chcesz usunąć ten zdefiniowany przez użytkownika wymiar?',
            userDefinedDimension: 'Zdefiniowany przez użytkownika wymiar',
            addAUserDefinedDimension: 'Dodaj wymiar zdefiniowany przez użytkownika',
            detailedInstructionsLink: 'Wyświetl szczegółowe instrukcje',
            detailedInstructionsRestOfSentence: 'przy dodawaniu zdefiniowanych przez użytkownika wymiarów.',
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
                        return 'projekty (zlecenia)';
                    default:
                        return 'mapowania';
                }
            },
        },
        type: {
            free: 'Bezpłatny',
            control: 'Kontrola',
            collect: 'Zbierz',
        },
        companyCards: {
            addCards: 'Dodaj karty',
            selectCards: 'Wybierz karty',
            addNewCard: {
                other: 'Inne',
                cardProviders: {
                    gl1025: 'Firmowe karty American Express',
                    cdf: 'Karty Komercyjne Mastercard',
                    vcf: 'Firmowe karty Visa',
                    stripe: 'Karty Stripe',
                },
                yourCardProvider: `Kto jest wystawcą Twojej karty?`,
                whoIsYourBankAccount: 'Jaki jest Twój bank?',
                whereIsYourBankLocated: 'Gdzie znajduje się Twój bank?',
                howDoYouWantToConnect: 'W jaki sposób chcesz połączyć się ze swoim bankiem?',
                learnMoreAboutOptions: `<muted-text>Dowiedz się więcej o tych <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opcjach</a>.</muted-text>`,
                commercialFeedDetails: 'Wymaga konfiguracji z Twoim bankiem. Zazwyczaj jest używane przez większe firmy i często jest najlepszą opcją, jeśli się kwalifikujesz.',
                commercialFeedPlaidDetails: `Wymaga konfiguracji z Twoim bankiem, ale poprowadzimy Cię przez ten proces. Zwykle jest to dostępne tylko dla większych firm.`,
                directFeedDetails: 'Najprostsze rozwiązanie. Połącz się od razu, używając swoich głównych danych logowania. Ta metoda jest najczęściej stosowana.',
                enableFeed: {
                    title: (provider: string) => `Włącz swój kanał ${provider}`,
                    heading:
                        'Mamy bezpośrednią integrację z wystawcą Twojej karty i możemy szybko oraz dokładnie zaimportować dane Twoich transakcji do Expensify.\n\nAby rozpocząć, po prostu:',
                    visa: 'Mamy globalne integracje z Visa, choć kwalifikowalność zależy od banku i programu karty.\n\nAby rozpocząć, po prostu:',
                    mastercard: 'Mamy globalne integracje z Mastercard, choć kwalifikowalność zależy od banku i programu kart.\n\nAby rozpocząć, po prostu:',
                    vcf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby uzyskać szczegółowe instrukcje dotyczące konfigurowania kart Visa Commercial.

2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby potwierdzić, że obsługują oni kanał komercyjny dla Twojego programu, i poproś o jego włączenie.

3. *Gdy kanał zostanie włączony i będziesz mieć jego szczegóły, przejdź do następnego ekranu.*`,
                    gl1025: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), aby sprawdzić, czy American Express może włączyć komercyjny kanał danych dla Twojego programu.

2. Gdy kanał zostanie włączony, Amex wyśle do Ciebie list produkcyjny.

3. *Gdy masz już informacje o kanale, przejdź do następnego ekranu.*`,
                    cdf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby uzyskać szczegółowe instrukcje dotyczące konfigurowania kart Mastercard Commercial Cards.

2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby potwierdzić, że obsługuje on firmowy kanał danych dla Twojego programu i poproś o jego włączenie.

3. *Gdy kanał danych zostanie włączony i będziesz mieć jego szczegóły, przejdź do następnego ekranu.*`,
                    stripe: `1. Odwiedź Stripe Dashboard i przejdź do [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. W sekcji Product Integrations kliknij Enable obok Expensify.

3. Gdy kanał zostanie włączony, kliknij poniżej Submit, a my zajmiemy się jego dodaniem.`,
                },
                whatBankIssuesCard: 'Jaki bank wydaje te karty?',
                enterNameOfBank: 'Wprowadź nazwę banku',
                feedDetails: {
                    vcf: {
                        title: 'Jakie są szczegóły zasilania danych Visa?',
                        processorLabel: 'Identyfikator procesora',
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
                        title: `Jaki jest identyfikator dystrybucyjny Mastercard?`,
                        distributionLabel: 'Identyfikator dystrybucji',
                        helpLabel: 'Gdzie znajdę identyfikator dystrybucji?',
                    },
                },
                amexCorporate: 'Wybierz tę opcję, jeśli na przodzie Twoich kart widnieje napis „Corporate”',
                amexBusiness: 'Wybierz tę opcję, jeśli na przodzie Twoich kart widnieje napis „Business”',
                amexPersonal: 'Wybierz tę opcję, jeśli Twoje karty są prywatne',
                error: {
                    pleaseSelectProvider: 'Wybierz dostawcę karty przed kontynuowaniem',
                    pleaseSelectBankAccount: 'Wybierz proszę konto bankowe przed kontynuowaniem',
                    pleaseSelectBank: 'Wybierz bank przed kontynuowaniem',
                    pleaseSelectCountry: 'Wybierz kraj przed kontynuowaniem',
                    pleaseSelectFeedType: 'Wybierz typ kanału przed kontynuowaniem',
                },
                exitModal: {
                    title: 'Coś nie działa?',
                    prompt: 'Zauważyliśmy, że nie dokończyłeś dodawania swoich kart. Jeśli napotkałeś problem, daj nam znać, abyśmy mogli pomóc wszystko naprawić.',
                    confirmText: 'Zgłoś problem',
                    cancelText: 'Pomiń',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Ostatni dzień miesiąca',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Ostatni dzień roboczy miesiąca',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Niestandardowy dzień miesiąca',
            },
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
                '<muted-text><centered-text>Albo coś mogło się zepsuć. Tak czy inaczej, jeśli masz jakiekolwiek pytania, po prostu <concierge-link>skontaktuj się z Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wybierz datę początkową transakcji',
            startDateDescription: 'Zaimportujemy wszystkie transakcje od tej daty. Jeśli nie określisz daty, sięgniemy tak daleko wstecz, jak pozwala Twój bank.',
            fromTheBeginning: 'Od początku',
            customStartDate: 'Niestandardowa data początkowa',
            customCloseDate: 'Niestandardowa data zamknięcia',
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
            confirmationDescription: 'Natychmiast rozpoczniemy importowanie transakcji.',
            card: 'Karta',
            cardName: 'Nazwa karty',
            brokenConnectionError: '<rbr>Połączenie z kartą zostało przerwane. Proszę <a href="#">zalogować się do swojego banku</a>, abyśmy mogli ponownie nawiązać połączenie.</rbr>',
            assignedCard: (assignee: string, link: string) => `przydzielił(-a) ${assignee} ${link}! Zaimportowane transakcje pojawią się w tym czacie.`,
            companyCard: 'karta firmowa',
            chooseCardFeed: 'Wybierz źródło kart',
            ukRegulation:
                'Expensify Limited jest agentem Plaid Financial Ltd., autoryzowanej instytucji płatniczej regulowanej przez Financial Conduct Authority na mocy Payment Services Regulations 2017 (Numer Referencyjny Firmy: 804718). Plaid świadczy Ci regulowane usługi informacji o rachunku za pośrednictwem Expensify Limited jako swojego agenta.',
            assign: 'Przypisz',
            assignCardFailedError: 'Przypisanie karty nie powiodło się.',
            cardAlreadyAssignedError: 'This card is already assigned to a user in another workspace.',
            editStartDateDescription: 'Wybierz nową datę początkową transakcji. Zsynchronizujemy wszystkie transakcje od tej daty, z wyłączeniem tych, które już zostały zaimportowane.',
            unassignCardFailedError: 'Nie udało się odłączyć karty.',
            importTransactions: {
                title: 'Importuj transakcje z pliku',
                description: 'Dostosuj ustawienia dla swojego pliku, które zostaną zastosowane podczas importu.',
                cardDisplayName: 'Wyświetlana nazwa karty',
                currency: 'Waluta',
                transactionsAreReimbursable: 'Transakcje podlegają zwrotowi',
                flipAmountSign: 'Odwróć znak kwoty',
                importButton: 'Importuj transakcje',
            },
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Nie można było wczytać kanałów kart',
                workspaceFeedsCouldNotBeLoadedMessage: 'Wystąpił błąd podczas ładowania kanałów kart w przestrzeni roboczej. Spróbuj ponownie lub skontaktuj się z administratorem.',
                feedCouldNotBeLoadedTitle: 'Nie można było wczytać tego kanału',
                feedCouldNotBeLoadedMessage: 'Wystąpił błąd podczas ładowania tego kanału. Spróbuj ponownie lub skontaktuj się ze swoim administratorem.',
                tryAgain: 'Spróbuj ponownie',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Wydawaj i zarządzaj swoimi kartami Expensify',
            getStartedIssuing: 'Zacznij, wydając swoją pierwszą wirtualną lub fizyczną kartę.',
            verificationInProgress: 'Weryfikacja w toku...',
            verifyingTheDetails: 'Weryfikujemy kilka szczegółów. Concierge da Ci znać, gdy Karty Expensify będą gotowe do wydania.',
            disclaimer:
                'Karta Expensify Visa® Commercial Card jest wydawana przez The Bancorp Bank, N.A., członka FDIC, na podstawie licencji udzielonej przez Visa U.S.A. Inc. i może nie być akceptowana u wszystkich sprzedawców honorujących karty Visa. Apple® i logo Apple® są znakami towarowymi firmy Apple Inc., zarejestrowanymi w USA i innych krajach. App Store jest znakiem usługowym firmy Apple Inc. Google Play i logo Google Play są znakami towarowymi firmy Google LLC.',
            euUkDisclaimer:
                'Karty wydawane rezydentom EOG są wydawane przez Transact Payments Malta Limited, a karty wydawane rezydentom Zjednoczonego Królestwa są wydawane przez Transact Payments Limited na podstawie licencji udzielonej przez Visa Europe Limited. Transact Payments Malta Limited jest należycie upoważniona i regulowana przez Malta Financial Services Authority jako Instytucja Finansowa na mocy Financial Institution Act 1994. Numer rejestracyjny C 91879. Transact Payments Limited jest upoważniona i regulowana przez Gibraltar Financial Service Commission.',
            issueCard: 'Wydaj kartę',
            findCard: 'Znajdź kartę',
            newCard: 'Nowa karta',
            name: 'Imię',
            lastFour: 'Ostatnie 4',
            limit: 'Limit',
            currentBalance: 'Aktualne saldo',
            currentBalanceDescription: 'Bieżące saldo to suma wszystkich zaksięgowanych transakcji kartą Expensify, które miały miejsce od ostatniej daty rozliczenia.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Saldo zostanie rozliczone dnia ${settlementDate}`,
            settleBalance: 'Ureguluj saldo',
            cardLimit: 'Limit karty',
            remainingLimit: 'Pozostały limit',
            requestLimitIncrease: 'Zwiększenie limitu żądań',
            remainingLimitDescription:
                'Przy obliczaniu Twojego pozostałego limitu bierzemy pod uwagę szereg czynników: staż jako klienta, informacje biznesowe podane podczas rejestracji oraz dostępne środki na koncie bankowym Twojej firmy. Twój pozostały limit może zmieniać się z dnia na dzień.',
            earnedCashback: 'Zwrot gotówki',
            earnedCashbackDescription: 'Saldo zwrotu gotówki opiera się na rozliczonych miesięcznych wydatkach kartą Expensify w Twojej przestrzeni roboczej.',
            issueNewCard: 'Wydaj nową kartę',
            finishSetup: 'Zakończ konfigurację',
            chooseBankAccount: 'Wybierz konto bankowe',
            chooseExistingBank: 'Wybierz istniejące firmowe konto bankowe, aby spłacić saldo karty Expensify, lub dodaj nowe konto bankowe',
            accountEndingIn: 'Konto kończące się na',
            addNewBankAccount: 'Dodaj nowe konto bankowe',
            settlementAccount: 'Konto rozliczeniowe',
            settlementAccountDescription: 'Wybierz konto, z którego chcesz spłacić saldo karty Expensify.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Upewnij się, że to konto odpowiada Twojemu <a href="${reconciliationAccountSettingsLink}">Konu uzgadniającemu</a> (${accountNumber}), aby Ciągłe uzgadnianie działało prawidłowo.`,
            settlementFrequency: 'Częstotliwość rozliczania',
            settlementFrequencyDescription: 'Wybierz, jak często będziesz spłacać saldo swojej karty Expensify.',
            settlementFrequencyInfo: 'Jeśli chcesz przejść na miesięczne rozliczenie, musisz połączyć swoje konto bankowe przez Plaid i mieć dodatnią historię salda z ostatnich 90 dni.',
            frequency: {
                daily: 'Codziennie',
                monthly: 'Miesięcznie',
            },
            cardDetails: 'Dane karty',
            cardPending: ({name}: {name: string}) => `Karta jest obecnie w toku i zostanie wydana, gdy konto ${name} zostanie zweryfikowane.`,
            virtual: 'Wirtualny',
            physical: 'Fizyczny',
            deactivate: 'Dezaktywuj kartę',
            changeCardLimit: 'Zmień limit karty',
            changeLimit: 'Zmień limit',
            smartLimitWarning: (limit: number | string) =>
                `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane, dopóki nie zatwierdzisz kolejnych wydatków na tej karcie.`,
            monthlyLimitWarning: (limit: number | string) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane do następnego miesiąca.`,
            fixedLimitWarning: (limit: number | string) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje zostaną odrzucone.`,
            changeCardLimitType: 'Zmień typ limitu karty',
            changeLimitType: 'Zmień typ limitu',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Jeśli zmienisz typ limitu tej karty na Smart Limit, nowe transakcje zostaną odrzucone, ponieważ niezatwierdzony limit ${limit} został już osiągnięty.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Jeśli zmienisz typ limitu tej karty na Miesięczny, nowe transakcje zostaną odrzucone, ponieważ miesięczny limit ${limit} został już osiągnięty.`,
            addShippingDetails: 'Dodaj dane wysyłki',
            issuedCard: (assignee: string) => `przyznał(a) ${assignee} kartę Expensify! Karta dotrze w ciągu 2–3 dni roboczych.`,
            issuedCardNoShippingDetails: (assignee: string) => `przyznano ${assignee} kartę Expensify! Karta zostanie wysłana po potwierdzeniu danych wysyłkowych.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `wystawił(a) ${assignee} wirtualną kartę Expensify! ${link} można używać od razu.`,
            addedShippingDetails: (assignee: string) => `${assignee} dodał dane wysyłki. Karta Expensify dotrze w ciągu 2–3 dni roboczych.`,
            replacedCard: (assignee: string) => `${assignee} wymienił(-a) swoją kartę Expensify. Nowa karta dotrze w ciągu 2–3 dni roboczych.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} wymienił swoją wirtualną Kartę Expensify! ${link} można używać od razu.`,
            card: 'karta',
            replacementCard: 'karta zastępcza',
            verifyingHeader: 'Weryfikowanie',
            bankAccountVerifiedHeader: 'Konto bankowe zweryfikowane',
            verifyingBankAccount: 'Weryfikowanie konta bankowego...',
            verifyingBankAccountDescription: 'Proszę czekać, sprawdzamy, czy to konto może zostać użyte do wydawania kart Expensify.',
            bankAccountVerified: 'Konto bankowe zweryfikowane!',
            bankAccountVerifiedDescription: 'Możesz teraz wydawać Karty Expensify członkom swojego obszaru roboczego.',
            oneMoreStep: 'Jeszcze jeden krok…',
            oneMoreStepDescription: 'Wygląda na to, że musimy ręcznie zweryfikować Twoje konto bankowe. Przejdź do Concierge, gdzie czekają na Ciebie instrukcje.',
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
                `Wszystkie wydatki muszą być skategoryzowane, aby można je było wyeksportować do ${connectionName}.`,
            subtitle: 'Zyskaj lepszy wgląd w to, na co wydawane są pieniądze. Skorzystaj z naszych domyślnych kategorii lub dodaj własne.',
            emptyCategories: {
                title: 'Nie utworzyłeś żadnych kategorii',
                subtitle: 'Dodaj kategorię, aby uporządkować swoje wydatki.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Twoje kategorie są obecnie importowane z połączenia księgowego. Przejdź do strony <a href="${accountingPageURL}">księgowości</a>, aby wprowadzić zmiany.</centered-text></muted-text>`,
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
            importedFromAccountingSoftware: 'Kategorie poniżej są importowane z twojego',
            payrollCode: 'Kod płacowy',
            updatePayrollCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu listy płac, spróbuj ponownie',
            glCode: 'Kod GL',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu GL, spróbuj ponownie',
            importCategories: 'Importuj kategorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Nie można usunąć ani wyłączyć wszystkich kategorii',
                description: `Co najmniej jedna kategoria musi pozostać włączona, ponieważ w Twoim workspace użycie kategorii jest wymagane.`,
            },
        },
        moreFeatures: {
            subtitle: 'Użyj przełączników poniżej, aby włączać kolejne funkcje w miarę rozwoju. Każda funkcja pojawi się w menu nawigacyjnym, umożliwiając dalszą personalizację.',
            spendSection: {
                title: 'Wydatki',
                subtitle: 'Włącz funkcje, które pomogą Ci skalować Twój zespół.',
            },
            manageSection: {
                title: 'Zarządzaj',
                subtitle: 'Dodaj narzędzia kontrolne, które pomagają utrzymać wydatki w ramach budżetu.',
            },
            earnSection: {
                title: 'Zarabiaj',
                subtitle: 'Usprawnij swój przychód i otrzymuj płatności szybciej.',
            },
            organizeSection: {
                title: 'Organizuj',
                subtitle: 'Grupuj i analizuj wydatki, rejestruj każdy zapłacony podatek.',
            },
            integrateSection: {
                title: 'Zintegruj',
                subtitle: 'Połącz Expensify z popularnymi produktami finansowymi.',
            },
            distanceRates: {
                title: 'Stawki za dystans',
                subtitle: 'Dodawaj, aktualizuj i egzekwuj stawki.',
            },
            perDiem: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki ryczałtu dziennego, aby kontrolować codzienne wydatki pracowników.',
            },
            travel: {
                title: 'Podróże',
                subtitle: 'Rezerwuj, zarządzaj i rozliczaj wszystkie swoje podróże służbowe.',
                getStarted: {
                    title: 'Rozpocznij z Expensify Travel',
                    subtitle: 'Potrzebujemy jeszcze kilku dodatkowych informacji o Twojej firmie, a następnie będziesz gotowy do startu.',
                    ctaText: 'Zaczynamy',
                },
                reviewingRequest: {
                    title: 'Spakuj walizki, mamy Twoją prośbę...',
                    subtitle: 'Obecnie przeglądamy Twoją prośbę o włączenie Expensify Travel. Nie martw się, damy Ci znać, gdy będzie gotowe.',
                    ctaText: 'Prośba wysłana',
                },
                bookOrManageYourTrip: {
                    title: 'Zarezerwuj lub zarządzaj swoją podróżą',
                    subtitle: 'Użyj Expensify Travel, aby uzyskać najlepsze oferty podróży i zarządzaj wszystkimi wydatkami służbowymi w jednym miejscu.',
                    ctaText: 'Rezerwuj lub zarządzaj',
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
                            currentTravelSpendCta: 'Zapłać saldo',
                            currentTravelLimitLabel: 'Obecny limit podróży',
                            settlementAccountLabel: 'Konto rozliczeniowe',
                            settlementFrequencyLabel: 'Częstotliwość rozliczeń',
                            settlementFrequencyDescription: 'Jak często Expensify będzie pobierać środki z firmowego konta bankowego, aby rozliczyć ostatnie transakcje Expensify Travel.',
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
                    subTitle: 'Usprawnij firmowe wydatki i zaoszczędź do 50% na swoim rachunku Expensify, a ponadto:',
                    features: {
                        cashBack: 'Zwrot gotówki za każdy zakup w USA',
                        unlimited: 'Nielimitowane karty wirtualne',
                        spend: 'Kontrola wydatków i niestandardowe limity',
                    },
                    ctaTitle: 'Wydaj nową kartę',
                },
            },
            companyCards: {
                title: 'Firmowe karty',
                subtitle: 'Połącz karty, które już masz.',
                feed: {
                    title: 'Użyj własnych kart (BYOC)',
                    features: {
                        support: 'Podłącz karty z ponad 10 000 banków',
                        assignCards: 'Połącz istniejące karty Twojego zespołu',
                        automaticImport: 'Automatycznie pobierzemy transakcje',
                    },
                    subtitle: 'Połącz karty, które już masz, aby automatycznie importować transakcje, dopasowywać paragony i przeprowadzać uzgodnienia.',
                },
                bankConnectionError: 'Problem z połączeniem bankowym',
                connectWithPlaid: 'połącz przez Plaid',
                connectWithExpensifyCard: 'wypróbuj Kartę Expensify.',
                bankConnectionDescription: `Spróbuj dodać swoje karty ponownie. W przeciwnym razie możesz`,
                disableCardTitle: 'Wyłącz firmowe karty',
                disableCardPrompt: 'Nie możesz wyłączyć firmowych kart, ponieważ ta funkcja jest w użyciu. Skontaktuj się z Concierge, aby poznać kolejne kroki.',
                disableCardButton: 'Czat z Concierge',
                cardDetails: 'Dane karty',
                cardNumber: 'Numer karty',
                cardholder: 'Posiadacz karty',
                cardName: 'Nazwa karty',
                allCards: 'Wszystkie karty',
                assignedCards: 'Przypisano',
                unassignedCards: 'Nieprzypisane',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} eksport` : `Eksport ${integration}`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Wybierz konto ${integration}, do którego mają być eksportowane transakcje.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Wybierz konto ${integration}, do którego mają być eksportowane transakcje. Wybierz inną <a href="${exportPageLink}">opcję eksportu</a>, aby zmienić dostępne konta.`,
                lastUpdated: 'Ostatnia aktualizacja',
                transactionStartDate: 'Data początkowa transakcji',
                updateCard: 'Zaktualizuj kartę',
                unassignCard: 'Cofnij przypisanie karty',
                unassign: 'Cofnij przypisanie',
                unassignCardDescription: 'Usunięcie przypisania tej karty spowoduje usunięcie wszystkich transakcji w wersjach roboczych raportów z konta posiadacza karty.',
                assignCard: 'Przypisz kartę',
                cardFeedName: 'Nazwa źródła karty',
                cardFeedNameDescription: 'Nadaj kanałowi karty unikalną nazwę, abyś mógł odróżnić go od pozostałych.',
                cardFeedTransaction: 'Usuń transakcje',
                cardFeedTransactionDescription: 'Wybierz, czy posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą podlegać tym zasadom.',
                cardFeedRestrictDeletingTransaction: 'Ogranicz usuwanie transakcji',
                cardFeedAllowDeletingTransaction: 'Zezwól na usuwanie transakcji',
                removeCardFeed: 'Usuń źródło kart',
                removeCardFeedTitle: (feedName: string) => `Usuń kanał ${feedName}`,
                removeCardFeedDescription: 'Czy na pewno chcesz usunąć to źródło kart? Spowoduje to odpięcie wszystkich kart.',
                error: {
                    feedNameRequired: 'Nazwa źródła karty jest wymagana',
                    statementCloseDateRequired: 'Wybierz proszę datę zamknięcia wyciągu.',
                },
                corporate: 'Ogranicz usuwanie transakcji',
                personal: 'Zezwól na usuwanie transakcji',
                setFeedNameDescription: 'Nadaj temu kanałowi kart unikalną nazwę, abyś mógł odróżnić go od pozostałych',
                setTransactionLiabilityDescription: 'Gdy ta opcja jest włączona, posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą stosować się do tej reguły.',
                emptyAddedFeedTitle: 'Przypisz firmowe karty',
                emptyAddedFeedDescription: 'Rozpocznij, przypisując swoją pierwszą kartę członkowi.',
                pendingFeedTitle: `Przeglądamy Twoje zgłoszenie…`,
                pendingFeedDescription: `Obecnie weryfikujemy szczegóły Twojego kanału. Gdy to będzie gotowe, skontaktujemy się z Tobą przez`,
                pendingBankTitle: 'Sprawdź okno przeglądarki',
                pendingBankDescription: (bankName: string) => `Połącz się z ${bankName} w oknie przeglądarki, które właśnie zostało otwarte. Jeśli się nie otworzyło,`,
                pendingBankLink: 'kliknij tutaj',
                giveItNameInstruction: 'Nadaj karcie nazwę, która wyróżni ją spośród innych.',
                updating: 'Aktualizowanie...',
                neverUpdated: 'Nigdy',
                noAccountsFound: 'Nie znaleziono kont',
                defaultCard: 'Domyślna karta',
                downgradeTitle: `Nie można obniżyć poziomu miejsca pracy`,
                downgradeSubTitle: `Nie można obniżyć poziomu tej przestrzeni roboczej, ponieważ podłączonych jest wiele źródeł kart (z wyłączeniem kart Expensify). Aby kontynuować, prosimy <a href="#">pozostawić tylko jedno źródło kart</a>.`,
                noAccountsFoundDescription: (connection: string) => `Dodaj konto w ${connection} i ponownie zsynchronizuj połączenie`,
                expensifyCardBannerTitle: 'Zdobądź kartę Expensify',
                expensifyCardBannerSubtitle:
                    'Korzystaj z cashbacku przy każdym zakupie w USA, zniżki do 50% na swój rachunek Expensify, nielimitowanych kart wirtualnych i wielu innych korzyści.',
                expensifyCardBannerLearnMoreButton: 'Dowiedz się więcej',
                statementCloseDateTitle: 'Data zamknięcia zestawienia',
                statementCloseDateDescription: 'Daj nam znać, kiedy zamyka się wyciąg Twojej karty, a utworzymy pasujący wyciąg w Expensify.',
            },
            workflows: {
                title: 'Przepływy pracy',
                subtitle: 'Skonfiguruj sposób zatwierdzania i opłacania wydatków.',
                disableApprovalPrompt:
                    'Karty Expensify w tym obszarze roboczym obecnie opierają się na zatwierdzaniu, aby określić swoje Inteligentne Limity. Przed wyłączeniem zatwierdzania zmień typy limitów wszystkich Kart Expensify z Inteligentnymi Limitami.',
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
                subtitle: 'Klasyfikuj koszty i śledź koszty refakturowane.',
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
                subtitle: 'Zsynchronizuj swój plan kont i nie tylko.',
            },
            receiptPartners: {
                title: 'Partnerzy paragonów',
                subtitle: 'Automatycznie importuj paragony.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nie tak szybko...',
                featureEnabledText: 'Aby włączyć lub wyłączyć tę funkcję, musisz zmienić ustawienia importu księgowości.',
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
                    'Karty Expensify w tym obszarze roboczym polegają na przepływach zatwierdzania, aby określić ich Inteligentne Limity.\n\nZmień typy limitów wszystkich kart z Inteligentnymi Limitami przed wyłączeniem przepływów pracy.',
                confirmText: 'Przejdź do kart Expensify',
            },
            rules: {
                title: 'Zasady',
                subtitle: 'Wymagaj paragonów, oznaczaj wysokie wydatki i nie tylko.',
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
            customNameDescription: `Wybierz niestandardową nazwę dla raportów wydatków, korzystając z naszych <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">rozbudowanych formuł</a>.`,
            customNameInputLabel: 'Imię',
            customNameEmailPhoneExample: 'Adres e-mail lub telefon członka: {report:submit:from}',
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
                title: 'Nie utworzyłeś żadnych pól raportu',
                subtitle: 'Dodaj niestandardowe pole (tekst, data lub lista rozwijana), które będzie wyświetlane na raportach.',
            },
            subtitle: 'Pola raportu mają zastosowanie do wszystkich wydatków i mogą być pomocne, gdy chcesz poprosić o dodatkowe informacje.',
            disableReportFields: 'Wyłącz pola raportu',
            disableReportFieldsConfirmation: 'Czy na pewno? Pola tekstowe i daty zostaną usunięte, a listy zostaną wyłączone.',
            importedFromAccountingSoftware: 'Pola raportu poniżej są importowane z Twojego',
            textType: 'Tekst',
            dateType: 'Data',
            dropdownType: 'Lista',
            formulaType: 'Formuła',
            textAlternateText: 'Dodaj pole do swobodnego wprowadzania tekstu.',
            dateAlternateText: 'Dodaj kalendarz do wyboru daty.',
            dropdownAlternateText: 'Dodaj listę opcji do wyboru.',
            formulaAlternateText: 'Dodaj pole formuły.',
            nameInputSubtitle: 'Wybierz nazwę dla pola raportu.',
            typeInputSubtitle: 'Wybierz typ pola raportu do użycia.',
            initialValueInputSubtitle: 'Wprowadź wartość początkową, która ma zostać wyświetlona w polu raportu.',
            listValuesInputSubtitle: 'Te wartości pojawią się na liście rozwijanej pola raportu. Włączone wartości mogą być wybierane przez członków.',
            listInputSubtitle: 'Te wartości pojawią się na liście pól raportu. Włączone wartości mogą być wybierane przez członków.',
            deleteValue: 'Usuń wartość',
            deleteValues: 'Usuń wartości',
            disableValue: 'Wyłącz wartość',
            disableValues: 'Wyłącz wartości',
            enableValue: 'Włącz wartość',
            enableValues: 'Włącz wartości',
            emptyReportFieldsValues: {
                title: 'Nie utworzono żadnych wartości listy',
                subtitle: 'Dodaj własne wartości, które będą wyświetlane w raportach.',
            },
            deleteValuePrompt: 'Czy na pewno chcesz usunąć tę wartość listy?',
            deleteValuesPrompt: 'Czy na pewno chcesz usunąć te wartości listy?',
            listValueRequiredError: 'Wprowadź nazwę wartości listy',
            existingListValueError: 'Wartość listy o tej nazwie już istnieje',
            editValue: 'Edytuj wartość',
            listValues: 'Wartości listy',
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
            trackBillable: 'Śledź fakturowalne wydatki',
            customTagName: 'Niestandardowa nazwa taga',
            enableTag: 'Włącz tag',
            enableTags: 'Włącz tagi',
            requireTag: 'Wymagany znacznik',
            requireTags: 'Wymagaj tagów',
            notRequireTags: 'Nie wymagaj',
            disableTag: 'Wyłącz tag',
            disableTags: 'Wyłącz tagi',
            addTag: 'Dodaj tag',
            editTag: 'Edytuj znacznik',
            editTags: 'Edytuj tagi',
            findTag: 'Znajdź tag',
            subtitle: 'Tagi dodają bardziej szczegółowe sposoby klasyfikacji kosztów.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Używasz <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">zależnych tagów</a>. Możesz <a href="${importSpreadsheetLink}">zaimportować arkusz ponownie</a>, aby zaktualizować swoje tagi.</muted-text>`,
            emptyTags: {
                title: 'Nie utworzyłeś jeszcze żadnych tagów',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Dodaj znacznik, aby śledzić projekty, lokalizacje, działy i nie tylko.',
                subtitleHTML: `<muted-text><centered-text>Dodaj tagi, aby śledzić projekty, lokalizacje, działy i więcej. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Dowiedz się więcej</a> o formatowaniu plików z tagami do importu.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Twoje tagi są obecnie importowane z połączenia księgowego. Przejdź do <a href="${accountingPageURL}">księgowości</a>, aby wprowadzić zmiany.</centered-text></muted-text>`,
            },
            deleteTag: 'Usuń tag',
            deleteTags: 'Usuń tagi',
            deleteTagConfirmation: 'Czy na pewno chcesz usunąć ten tag?',
            deleteTagsConfirmation: 'Czy na pewno chcesz usunąć te tagi?',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania tagu, spróbuj ponownie',
            tagRequiredError: 'Nazwa taga jest wymagana',
            existingTagError: 'Tag o tej nazwie już istnieje',
            invalidTagNameError: 'Nazwa taga nie może wynosić 0. Wybierz inną wartość.',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania tagu, spróbuj ponownie',
            importedFromAccountingSoftware: 'Poniższe tagi zostały zaimportowane z twojego',
            glCode: 'Kod GL',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu GL, spróbuj ponownie',
            tagRules: 'Reguły tagów',
            approverDescription: 'Akceptujący',
            importTags: 'Importuj tagi',
            importTagsSupportingText: 'Oznaczaj swoje wydatki jednym typem tagu lub wieloma.',
            configureMultiLevelTags: 'Skonfiguruj swoją listę tagów dla tagowania wielopoziomowego.',
            importMultiLevelTagsSupportingText: `Oto podgląd Twoich tagów. Jeśli wszystko wygląda dobrze, kliknij poniżej, aby je zaimportować.`,
            importMultiLevelTags: {
                firstRowTitle: 'Pierwszy wiersz jest tytułem każdej listy tagów',
                independentTags: 'To są niezależne tagi',
                glAdjacentColumn: 'W sąsiedniej kolumnie znajduje się kod GL',
            },
            tagLevel: {
                singleLevel: 'Pojedynczy poziom tagów',
                multiLevel: 'Tagi wielopoziomowe',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Przełącz poziomy tagów',
                prompt1: 'Przełączenie poziomów tagów spowoduje usunięcie wszystkich obecnych tagów.',
                prompt2: 'Sugerujemy najpierw',
                prompt3: 'pobierz kopię zapasową',
                prompt4: 'poprzez eksportowanie swoich tagów.',
                prompt5: 'Dowiedz się więcej',
                prompt6: 'o poziomach tagów.',
            },
            overrideMultiTagWarning: {
                title: 'Importuj tagi',
                prompt1: 'Czy na pewno?',
                prompt2: 'Istniejące tagi zostaną zastąpione, ale możesz',
                prompt3: 'pobierz kopię zapasową',
                prompt4: 'pierwszy.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `Znaleźliśmy *${columnCounts} kolumn* w Twoim arkuszu kalkulacyjnym. Wybierz *Name* obok kolumny, która zawiera nazwy tagów. Możesz także wybrać *Enabled* obok kolumny, która ustawia status tagów.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Nie można usunąć ani wyłączyć wszystkich tagów',
                description: `Co najmniej jeden tag musi pozostać włączony, ponieważ w Twoim workspace tagi są wymagane.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Nie można ustawić wszystkich tagów jako opcjonalnych',
                description: `Co najmniej jeden tag musi pozostać wymagany, ponieważ ustawienia Twojego obszaru roboczego wymagają użycia tagów.`,
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
            subtitle: 'Dodaj nazwy podatków, stawki i ustaw wartości domyślne.',
            addRate: 'Dodaj stawkę',
            workspaceDefault: 'Domyślna waluta przestrzeni roboczej',
            foreignDefault: 'Domyślna waluta obca',
            customTaxName: 'Niestandardowa nazwa podatku',
            value: 'Wartość',
            taxReclaimableOn: 'Podlegające zwrotowi podatki na',
            taxRate: 'Stawka podatku',
            findTaxRate: 'Znajdź stawkę podatku',
            error: {
                taxRateAlreadyExists: 'Ta nazwa podatku jest już używana',
                taxCodeAlreadyExists: 'Ten kod podatkowy jest już w użyciu',
                valuePercentageRange: 'Wprowadź prawidłowy procent w zakresie od 0 do 100',
                customNameRequired: 'Wymagana jest własna nazwa podatku',
                deleteFailureMessage: 'Wystąpił błąd podczas usuwania stawki podatku. Spróbuj ponownie lub poproś Concierge o pomoc.',
                updateFailureMessage: 'Wystąpił błąd podczas aktualizowania stawki podatkowej. Spróbuj ponownie lub poproś Concierge o pomoc.',
                createFailureMessage: 'Wystąpił błąd podczas tworzenia stawki podatku. Spróbuj ponownie lub poproś Concierge o pomoc.',
                updateTaxClaimableFailureMessage: 'Część podlegająca zwrotowi musi być mniejsza niż kwota stawki za przejazd',
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
            importedFromAccountingSoftware: 'Poniższe podatki zostały zaimportowane z Twojego',
            taxCode: 'Kod podatkowy',
            updateTaxCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu podatkowego, spróbuj ponownie',
        },
        duplicateWorkspace: {
            title: 'Nazwij swoje nowe miejsce pracy',
            selectFeatures: 'Wybierz funkcje do skopiowania',
            whichFeatures: 'Które funkcje chcesz skopiować do swojego nowego workspace?',
            confirmDuplicate: 'Czy chcesz kontynuować?',
            categories: 'kategorie i Twoje zasady automatycznego kategoryzowania',
            reimbursementAccount: 'konto zwrotu kosztów',
            welcomeNote: 'Proszę, zacznij używać mojego nowego workspace’u',
            delayedSubmission: 'opóźnione przesłanie',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Zaraz utworzysz i udostępnisz ${newWorkspaceName ?? ''} z ${totalMembers ?? 0} członkami z oryginalnego przestrzeni roboczej.`,
            error: 'Wystąpił błąd podczas duplikowania Twojej nowej przestrzeni roboczej. Spróbuj ponownie.',
        },
        emptyWorkspace: {
            title: 'Nie masz żadnych przestrzeni roboczych',
            subtitle: 'Śledź paragony, rozliczaj wydatki, zarządzaj podróżami, wysyłaj faktury i nie tylko.',
            createAWorkspaceCTA: 'Rozpocznij',
            features: {
                trackAndCollect: 'Śledź i zbieraj paragony',
                reimbursements: 'Zwracaj pracownikom koszty',
                companyCards: 'Zarządzaj firmowymi kartami',
            },
            notFound: 'Nie znaleziono żadnego przestrzeni roboczej',
            description: 'Pokoje to świetne miejsce do dyskusji i współpracy z wieloma osobami. Aby rozpocząć współpracę, utwórz lub dołącz do przestrzeni roboczej',
        },
        new: {
            newWorkspace: 'Nowa przestrzeń robocza',
            getTheExpensifyCardAndMore: 'Zdobądź kartę Expensify i więcej',
            confirmWorkspace: 'Potwierdź przestrzeń roboczą',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mój obszar roboczy grupy${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Przestrzeń robocza użytkownika ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
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
                one: 'Ustaw jako członka',
                other: 'Ustaw jako członków',
            }),
            makeAdmin: () => ({
                one: 'Uczyń administratorem',
                other: 'Uczyń administratorami',
            }),
            makeAuditor: () => ({
                one: 'Uczyń audytorem',
                other: 'Uczyń audytorami',
            }),
            selectAll: 'Zaznacz wszystko',
            error: {
                genericAdd: 'Wystąpił problem z dodaniem tego członka przestrzeni roboczej',
                cannotRemove: 'Nie możesz usunąć siebie ani właściciela przestrzeni roboczej',
                genericRemove: 'Wystąpił problem podczas usuwania tego członka przestrzeni roboczej',
            },
            addedWithPrimary: 'Niektórzy członkowie zostali dodani przy użyciu swoich głównych loginów.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Dodane przez dodatkowy login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Łączna liczba członków przestrzeni roboczej: ${count}`,
            importMembers: 'Importuj członków',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${approver} z tego obszaru roboczego, zastąpimy tę osobę w procesie zatwierdzania przez ${workspaceOwner}, właściciela obszaru roboczego.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} ma zaległe raporty wydatków do zatwierdzenia. Poproś tę osobę o ich zatwierdzenie lub przejmij kontrolę nad jej raportami, zanim usuniesz ją z przestrzeni roboczej.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Nie możesz usunąć ${memberName} z tego miejsca pracy. Ustaw nową osobę zwracającą wydatki w Workflows > Make or track payments, a następnie spróbuj ponownie.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${memberName} z tego obszaru roboczego, zastąpimy go jako preferowanego eksportującego użytkownikiem ${workspaceOwner}, właścicielem obszaru roboczego.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${memberName} z tej przestrzeni roboczej, zastąpimy go jako osobę kontaktową ds. kwestii technicznych użytkownikiem ${workspaceOwner}, właścicielem przestrzeni roboczej.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} ma zaległy raport w trakcie przetwarzania, który wymaga działania. Poproś tę osobę o wykonanie wymaganej czynności przed usunięciem jej z przestrzeni roboczej.`,
        },
        card: {
            getStartedIssuing: 'Zacznij, wydając swoją pierwszą wirtualną lub fizyczną kartę.',
            issueCard: 'Wydaj kartę',
            issueNewCard: {
                whoNeedsCard: 'Kto potrzebuje karty?',
                inviteNewMember: 'Zaproś nowego członka',
                findMember: 'Znajdź członka',
                chooseCardType: 'Wybierz typ karty',
                physicalCard: 'Fizyczna karta',
                physicalCardDescription: 'Świetne dla osoby często wydającej',
                virtualCard: 'Wirtualna karta',
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
                giveItName: 'Nadaj nazwę',
                giveItNameInstruction: 'Uczyń go na tyle unikalnym, aby dało się go odróżnić od innych kart. Jeszcze lepiej, jeśli opisujesz konkretne przypadki użycia!',
                cardName: 'Nazwa karty',
                letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
                willBeReadyToUse: 'Ta karta będzie gotowa do użycia od razu.',
                willBeReadyToShip: 'Ta karta będzie gotowa do natychmiastowej wysyłki.',
                cardholder: 'Posiadacz karty',
                cardType: 'Typ karty',
                limit: 'Limit',
                limitType: 'Typ limitu',
                disabledApprovalForSmartLimitError: 'Włącz zatwierdzanie w <strong>Workflows > Add approvals</strong> przed skonfigurowaniem inteligentnych limitów',
            },
            deactivateCardModal: {
                deactivate: 'Dezaktywuj',
                deactivateCard: 'Dezaktywuj kartę',
                deactivateConfirmation: 'Dezaktywacja tej karty spowoduje odrzucenie wszystkich przyszłych transakcji i nie może zostać cofnięta.',
            },
        },
        accounting: {
            settings: 'Ustawienia',
            title: 'Połączenia',
            subtitle: 'Połącz się ze swoim systemem księgowym, aby księgować transakcje na swoim planie kont, automatycznie dopasowywać płatności i utrzymywać finanse w synchronizacji.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Porozmawiaj ze swoim specjalistą ds. konfiguracji.',
            talkYourAccountManager: 'Porozmawiaj ze swoim opiekunem klienta.',
            talkToConcierge: 'Czatuj z Concierge.',
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
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `Wystąpił błąd z połączeniem skonfigurowanym w Expensify Classic. [Przejdź do Expensify Classic, aby rozwiązać ten problem.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Przejdź do Expensify Classic, aby zarządzać swoimi ustawieniami.',
            setup: 'Połącz',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Ostatnia synchronizacja: ${relativeDate}`,
            notSync: 'Niesynchronizowane',
            import: 'Importuj',
            export: 'Eksport',
            advanced: 'Zaawansowane',
            other: 'Inne',
            syncNow: 'Synchronizuj teraz',
            disconnect: 'Odłącz',
            reinstall: 'Zainstaluj ponownie łącznik',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'Integracja';
                return `Odłącz ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Połącz ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integracja księgowa'}`,
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
                        return 'Nie można połączyć się z integracją';
                    }
                }
            },
            accounts: 'Plan kont',
            taxes: 'Podatki',
            imported: 'Zaimportowano',
            notImported: 'Niezainportowane',
            importAsCategory: 'Zaimportowane jako kategorie',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Zaimportowano',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Zaimportowano jako tagi',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Zaimportowano',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Niezainportowane',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Niezainportowane',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Zaimportowano jako pola raportu',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Domyślne ustawienia pracownika NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'ta integracja';
                return `Czy na pewno chcesz odłączyć ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Czy na pewno chcesz połączyć ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'to połączenie z systemem księgowym'}? Spowoduje to usunięcie wszystkich istniejących połączeń księgowych.`,
            enterCredentials: 'Wprowadź swoje dane logowania',
            claimOffer: {
                badgeText: 'Oferta dostępna!',
                xero: {
                    headline: 'Otrzymaj Xero za darmo na 6 miesięcy!',
                    description: '<muted-text><centered-text>Nowy w Xero? Klienci Expensify otrzymują 6 miesięcy za darmo. Odbierz swoją ofertę poniżej.</centered-text></muted-text>',
                    connectButton: 'Połącz z Xero',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Otrzymaj 5% zniżki na przejazdy Uber',
                    description: `<muted-text><centered-text>Aktywuj Uber for Business przez Expensify i zaoszczędź 5% na wszystkich przejazdach służbowych do czerwca. <a href="${CONST.UBER_TERMS_LINK}">Obowiązują warunki.</a></centered-text></muted-text>`,
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
                            return 'Importowanie danych QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importowanie tytułu';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importowanie certyfikatu zatwierdzania';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importowanie wymiarów';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importowanie polityki zapisu';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Nadal synchronizujemy dane z QuickBooks... Upewnij się, że Web Connector jest uruchomiony';
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
                            return 'Importowanie danych jako pola raportu w Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importowanie danych jako tagów Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Aktualizowanie informacji o połączeniu';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Oznaczanie raportów Expensify jako zrefundowane';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Oznaczanie rachunków i faktur w NetSuite jako opłaconych';
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
                            return 'Sprawdzanie połączenia Sage Intacct';
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
                'Preferowany eksporter może być dowolnym administratorem przestrzeni roboczej, ale musi być także Administratorem Domeny, jeśli ustawisz różne konta eksportu dla poszczególnych firmowych kart w Ustawieniach Domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter będzie widzieć raporty do eksportu na swoim koncie.',
            exportAs: 'Eksportuj jako',
            exportOutOfPocket: 'Eksportuj wydatki z własnej kieszeni jako',
            exportCompanyCard: 'Eksportuj wydatki z kart firmowych jako',
            exportDate: 'Data eksportu',
            defaultVendor: 'Domyślny dostawca',
            autoSync: 'Automatyczna synchronizacja',
            autoSyncDescription: 'Automatycznie synchronizuj NetSuite i Expensify każdego dnia. Eksportuj sfinalizowany raport w czasie rzeczywistym',
            reimbursedReports: 'Synchronizuj rozliczone raporty',
            cardReconciliation: 'Uzgadnianie kart',
            reconciliationAccount: 'Konto rozrachunkowe',
            continuousReconciliation: 'Ciągłe uzgadnianie',
            saveHoursOnReconciliation:
                'Oszczędzaj godziny przy uzgadnianiu kont w każdym okresie rozliczeniowym, dzięki temu że Expensify będzie na bieżąco uzgadniać w Twoim imieniu zestawienia i rozliczenia kart Expensify Card.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Aby włączyć Ciągłą Rekonsyliację, włącz <a href="${accountingAdvancedSettingsLink}">automatyczną synchronizację</a> dla ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wybierz konto bankowe, z którym będą uzgadniane płatności kartą Expensify.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Upewnij się, że to konto jest zgodne z <a href="${settlementAccountUrl}">kontem rozliczeniowym karty Expensify</a> (zakończonym na ${lastFourPAN}), aby Ciągłe Uzgadnianie działało prawidłowo.`,
            },
        },
        export: {
            notReadyHeading: 'Niegotowe do eksportu',
            notReadyDescription: 'Szkice lub oczekujące raporty wydatków nie mogą zostać wyeksportowane do systemu księgowego. Zatwierdź lub opłać te wydatki przed ich eksportem.',
        },
        invoices: {
            sendInvoice: 'Wyślij fakturę',
            sendFrom: 'Wyślij z',
            invoicingDetails: 'Szczegóły fakturowania',
            invoicingDetailsDescription: 'Te informacje pojawią się na Twoich fakturach.',
            companyName: 'Nazwa firmy',
            companyWebsite: 'Strona internetowa firmy',
            paymentMethods: {
                personal: 'Prywatne',
                business: 'Biznes',
                chooseInvoiceMethod: 'Wybierz poniższą metodę płatności:',
                payingAsIndividual: 'Płacenie jako osoba prywatna',
                payingAsBusiness: 'Płacenie jako firma',
            },
            invoiceBalance: 'Saldo faktury',
            invoiceBalanceSubtitle: 'To jest Twoje bieżące saldo z zebranych płatności faktur. Zostanie automatycznie przelane na Twoje konto bankowe, jeśli je dodałeś.',
            bankAccountsSubtitle: 'Dodaj konto bankowe, aby wysyłać i otrzymywać płatności za faktury.',
        },
        invite: {
            member: 'Zaproś członka',
            members: 'Zaproś członków',
            invitePeople: 'Zaproś nowych członków',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Spróbuj ponownie.',
            pleaseEnterValidLogin: `Upewnij się, że adres e‑mail lub numer telefonu jest prawidłowy (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'użytkownik',
            users: 'użytkownicy',
            invited: 'zaproszony',
            removed: 'Usunięto',
            to: 'do',
            from: 'Od',
        },
        inviteMessage: {
            confirmDetails: 'Potwierdź szczegóły',
            inviteMessagePrompt: 'Uczyń swoje zaproszenie jeszcze bardziej wyjątkowym, dodając poniżej wiadomość!',
            personalMessagePrompt: 'Wiadomość',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Spróbuj ponownie.',
            inviteNoMembersError: 'Wybierz co najmniej jednego członka do zaproszenia',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} poprosił o dołączenie do ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nie tak szybko...',
            workspaceNeeds: 'Miejsce pracy wymaga co najmniej jednej włączonej stawki za przejechany dystans.',
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
                '<muted-text>Aby korzystać z tej funkcji, musisz włączyć podatki w przestrzeni roboczej. Przejdź do <a href="#">Więcej funkcji</a>, aby to zmienić.</muted-text>',
            deleteDistanceRate: 'Usuń stawkę za dystans',
            areYouSureDelete: () => ({
                one: 'Czy na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }),
            errors: {
                rateNameRequired: 'Nazwa stawki jest wymagana',
                existingRateName: 'Stawka za przejazd o tej nazwie już istnieje',
            },
        },
        editor: {
            descriptionInputLabel: 'Opis',
            nameInputLabel: 'Imię',
            typeInputLabel: 'Typ',
            initialValueInputLabel: 'Wartość początkowa',
            nameInputHelpText: 'To jest nazwa, którą zobaczysz w swoim obszarze roboczym.',
            nameIsRequiredError: 'Musisz nadać swojej przestrzeni roboczej nazwę',
            currencyInputLabel: 'Domyślna waluta',
            currencyInputHelpText: 'Wszystkie wydatki w tym obszarze roboczym zostaną przeliczone na tę walutę.',
            currencyInputDisabledText: (currency: string) => `Domyślna waluta nie może zostać zmieniona, ponieważ ten workspace jest połączony z kontem bankowym w ${currency}.`,
            save: 'Zapisz',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania przestrzeni roboczej. Spróbuj ponownie.',
            avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Spróbuj ponownie.',
            addressContext: 'Adres miejsca pracy jest wymagany, aby włączyć Expensify Travel. Wprowadź proszę adres powiązany z Twoją firmą.',
            policy: 'Polityka wydatków',
        },
        bankAccount: {
            continueWithSetup: 'Kontynuuj konfigurację',
            youAreAlmostDone: 'Prawie ukończono konfigurację konta bankowego, które pozwoli Ci wydawać karty firmowe, rozliczać wydatki, pobierać faktury i opłacać rachunki.',
            streamlinePayments: 'Uprość płatności',
            connectBankAccountNote: 'Uwaga: Prywatne konta bankowe nie mogą być używane do płatności w przestrzeniach roboczych.',
            oneMoreThing: 'Jeszcze jedna rzecz!',
            allSet: 'Wszystko gotowe!',
            accountDescriptionWithCards: 'To konto bankowe będzie używane do wydawania kart firmowych, zwrotu wydatków, pobierania faktur i opłacania rachunków.',
            letsFinishInChat: 'Dokończmy na czacie!',
            finishInChat: 'Dokończ na czacie',
            almostDone: 'Prawie gotowe!',
            disconnectBankAccount: 'Odłącz konto bankowe',
            startOver: 'Zacznij od nowa',
            updateDetails: 'Zaktualizuj szczegóły',
            yesDisconnectMyBankAccount: 'Tak, odłącz moje konto bankowe',
            yesStartOver: 'Tak, zacznij od nowa',
            disconnectYourBankAccount: (bankName: string) =>
                `Odłącz swoje konto bankowe <strong>${bankName}</strong>. Wszystkie nierozliczone transakcje dla tego konta zostaną nadal zrealizowane.`,
            clearProgress: 'Rozpoczęcie od nowa usunie dotychczasowo osiągnięte postępy.',
            areYouSure: 'Czy na pewno?',
            workspaceCurrency: 'Waluta przestrzeni roboczej',
            updateCurrencyPrompt:
                'Wygląda na to, że Twoje miejsce pracy jest obecnie ustawione na inną walutę niż USD. Kliknij poniższy przycisk, aby zaktualizować teraz swoją walutę na USD.',
            updateToUSD: 'Aktualizuj do USD',
            updateWorkspaceCurrency: 'Zaktualizuj walutę przestrzeni roboczej',
            workspaceCurrencyNotSupported: 'Waluta przestrzeni roboczej nie jest obsługiwana',
            yourWorkspace: `Twoje miejsce pracy jest ustawione na nieobsługiwaną walutę. Zobacz <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">listę obsługiwanych walut</a>.`,
            chooseAnExisting: 'Wybierz istniejące konto bankowe, aby opłacić wydatki, lub dodaj nowe.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Przenieś właściciela',
            addPaymentCardTitle: 'Wprowadź swoją kartę płatniczą, aby przenieść własność',
            addPaymentCardButtonText: 'Zaakceptuj warunki i dodaj kartę płatniczą',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Przeczytaj i zaakceptuj <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">warunki</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">politykę prywatności</a>, aby dodać swoją kartę.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Zgodne z PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Szyfrowanie na poziomie banku',
            addPaymentCardRedundant: 'Nadmiarowa infrastruktura',
            addPaymentCardLearnMore: `<muted-text>Dowiedz się więcej o naszym <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">zabezpieczeniu</a>.</muted-text>`,
            amountOwedTitle: 'Zaległe saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Na tym koncie pozostało do zapłaty saldo z poprzedniego miesiąca.\n\nCzy chcesz wyczyścić saldo i przejąć rozliczanie tego workspace?',
            ownerOwesAmountTitle: 'Zaległe saldo',
            ownerOwesAmountButtonText: 'Przenieś saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Konto będące właścicielem tego środowiska pracy (${email}) ma zaległe saldo z poprzedniego miesiąca.

Czy chcesz przenieść tę kwotę (${amount}), aby przejąć rozliczanie tego środowiska pracy? Twoja karta płatnicza zostanie obciążona natychmiast.`,
            subscriptionTitle: 'Przejmij roczną subskrypcję',
            subscriptionButtonText: 'Przenieś subskrypcję',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Przejęcie tego obszaru roboczego połączy jego roczną subskrypcję z Twoją bieżącą subskrypcją. Zwiększy to rozmiar Twojej subskrypcji o ${usersCount} członków, co sprawi, że nowy rozmiar subskrypcji wyniesie ${finalCount}. Czy chcesz kontynuować?`,
            duplicateSubscriptionTitle: 'Ostrzeżenie o zduplikowanej subskrypcji',
            duplicateSubscriptionButtonText: 'Kontynuuj',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Wygląda na to, że próbujesz przejąć rozliczenia dla przestrzeni roboczych użytkownika ${email}, ale aby to zrobić, musisz najpierw być administratorem wszystkich jego przestrzeni roboczych.

Kliknij „Kontynuuj”, jeśli chcesz przejąć rozliczenia tylko dla przestrzeni roboczej ${workspaceName}.

Jeśli chcesz przejąć rozliczenia dla całej ich subskrypcji, poproś ich najpierw o dodanie Cię jako administratora do wszystkich ich przestrzeni roboczych, zanim przejmiesz rozliczenia.`,
            hasFailedSettlementsTitle: 'Nie można przenieść własności',
            hasFailedSettlementsButtonText: 'Rozumiem',
            hasFailedSettlementsText: (email: string) =>
                `Nie możesz przejąć rozliczeń, ponieważ ${email} ma zaległe rozliczenie karty Expensify. Poproś tę osobę o kontakt z concierge@expensify.com, aby rozwiązać problem. Następnie będziesz mógł przejąć rozliczenia dla tego obszaru roboczego.`,
            failedToClearBalanceTitle: 'Nie udało się wyczyścić salda',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Nie udało się wyczyścić salda. Spróbuj ponownie później.',
            successTitle: 'Juhu! Wszystko gotowe.',
            successDescription: 'Jesteś teraz właścicielem tego obszaru roboczego.',
            errorTitle: 'Ups! Nie tak szybko...',
            errorDescription: `<muted-text><centered-text>Wystąpił problem z przekazaniem własności tego miejsca pracy. Spróbuj ponownie lub <concierge-link>skontaktuj się z Concierge</concierge-link>, aby uzyskać pomoc.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Uważaj!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Następujące raporty zostały już wyeksportowane do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Czy na pewno chcesz je wyeksportować ponownie?`,
            confirmText: 'Tak, eksportuj ponownie',
            cancelText: 'Anuluj',
        },
        upgrade: {
            reportFields: {
                title: 'Pola raportu',
                description: `Pola raportu pozwalają określić szczegóły na poziomie nagłówka, odrębne od tagów odnoszących się do wydatków w poszczególnych pozycjach. Szczegóły te mogą obejmować konkretne nazwy projektów, informacje o podróżach służbowych, lokalizacje i inne dane.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Pola raportu są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Korzystaj z automatycznej synchronizacji i ograniczaj ręczne wprowadzanie danych dzięki integracji Expensify + NetSuite. Uzyskaj szczegółowe, aktualne w czasie rzeczywistym informacje finansowe dzięki obsłudze natywnych i niestandardowych segmentów, w tym mapowania projektów i klientów.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Integracja z NetSuite jest dostępna tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Korzystaj z automatycznej synchronizacji i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + Sage Intacct. Uzyskaj szczegółowy, aktualny w czasie rzeczywistym wgląd w finanse dzięki zdefiniowanym przez użytkownika wymiarom, a także księgowaniu wydatków według działu, klasy, lokalizacji, klienta i projektu (zadania).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z Sage Intacct jest dostępna tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Ciesz się automatyczną synchronizacją i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + QuickBooks Desktop. Zyskaj maksymalną wydajność dzięki dwukierunkowemu połączeniu w czasie rzeczywistym oraz kategoryzacji wydatków według klasy, pozycji, klienta i projektu.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z QuickBooks Desktop jest dostępna wyłącznie w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Zaawansowane zatwierdzanie',
                description: `Jeśli chcesz dodać więcej poziomów akceptacji – albo po prostu upewnić się, że największe wydatki zostaną sprawdzone przez kolejną osobę – mamy na to rozwiązanie. Zaawansowane akceptacje pomagają wdrożyć odpowiednie zabezpieczenia na każdym poziomie, aby utrzymać wydatki zespołu pod kontrolą.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Zaawansowane zatwierdzanie jest dostępne tylko w planie Control, który zaczyna się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            categories: {
                title: 'Kategorie',
                description: 'Kategorie pozwalają śledzić i organizować wydatki. Skorzystaj z naszych domyślnych kategorii lub dodaj własne.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorie są dostępne w planie Collect, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            glCodes: {
                title: 'Konta księgi głównej',
                description: `Dodaj kody GL do swoich kategorii i tagów, aby łatwo eksportować wydatki do systemów księgowych i płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody GL są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Konta księgi głównej i kody płacowe',
                description: `Dodaj kody GL i płacowe do swoich kategorii, aby łatwo eksportować wydatki do systemów księgowych i kadrowo‑płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody GL i płacowe są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Kody podatkowe',
                description: `Dodaj kody podatkowe do swoich podatków, aby ułatwić eksport wydatków do systemów księgowych i kadrowo‑płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody podatkowe są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            companyCards: {
                title: 'Nielimitowane firmowe karty płatnicze',
                description: `Potrzebujesz dodać więcej kart firmowych? Odblokuj nielimitowaną liczbę kart służbowych, aby synchronizować transakcje od wszystkich głównych wydawców kart.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>To jest dostępne wyłącznie w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            rules: {
                title: 'Zasady',
                description: `Reguły działają w tle i utrzymują Twoje wydatki pod kontrolą, dzięki czemu nie musisz przejmować się drobiazgami.

Wymagaj szczegółów wydatków, takich jak paragony i opisy, ustawiaj limity i wartości domyślne oraz automatyzuj akceptacje i płatności – wszystko w jednym miejscu.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reguły są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            perDiem: {
                title: 'Dieta',
                description:
                    'Ryczałty dzienne (per diem) to świetny sposób, aby utrzymać Twoje codzienne koszty zgodne z przepisami i przewidywalne za każdym razem, gdy Twoi pracownicy podróżują. Korzystaj z funkcji takich jak niestandardowe stawki, domyślne kategorie oraz bardziej szczegółowe informacje, takie jak miejsca docelowe i stawki cząstkowe.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Diety są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            travel: {
                title: 'Podróż',
                description:
                    'Expensify Travel to nowa korporacyjna platforma do rezerwacji i zarządzania podróżami, która pozwala członkom rezerwować zakwaterowanie, loty, transport i nie tylko.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Podróże są dostępne w planie Collect, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            reports: {
                title: 'Raporty',
                description: 'Raporty pozwalają grupować wydatki, aby ułatwić ich śledzenie i organizację.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Raporty są dostępne w planie Collect, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tagi wielopoziomowe',
                description:
                    'Tagi wielopoziomowe pomagają dokładniej śledzić wydatki. Przypisz wiele tagów do każdej pozycji – takich jak dział, klient lub centrum kosztów – aby uchwycić pełny kontekst każdego wydatku. Umożliwia to bardziej szczegółowe raportowanie, przepływy zatwierdzania oraz eksporty do systemów księgowych.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Tagi wielopoziomowe są dostępne tylko w planie Control, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Stawki za dystans',
                description: 'Twórz i zarządzaj własnymi stawkami, śledź przejechany dystans w milach lub kilometrach i ustaw domyślne kategorie dla wydatków związanych z przejazdami.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Stawki za dystans są dostępne w planie Collect, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            auditor: {
                title: 'Audytor',
                description: 'Audytorzy otrzymują dostęp tylko do odczytu do wszystkich raportów, zapewniając pełną przejrzystość i monitorowanie zgodności.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Audytorzy są dostępni tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Wiele poziomów zatwierdzania',
                description:
                    'Wiele poziomów zatwierdzania to narzędzie do zarządzania przepływem pracy dla firm, które wymagają, aby więcej niż jedna osoba zatwierdziła raport, zanim będzie można go rozliczyć.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Wiele poziomów zatwierdzania jest dostępnych tylko w planie Control, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'za aktywnego członka za miesiąc.',
                perMember: 'za członka za miesiąc.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Zaktualizuj plan, aby uzyskać dostęp do tej funkcji lub <a href="${subscriptionLink}">dowiedz się więcej</a> o naszych planach i cenach.</muted-text>`,
            upgradeToUnlock: 'Odblokuj tę funkcję',
            completed: {
                headline: `Ulepszono Twoją przestrzeń roboczą!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Pomyślnie zaktualizowano ${policyName} do planu Control! <a href="${subscriptionLink}">Wyświetl swoją subskrypcję</a>, aby uzyskać więcej szczegółów.</centered-text>`,
                categorizeMessage: `Pomyślnie uaktualniono Twój plan do Collect. Teraz możesz kategoryzować swoje wydatki!`,
                travelMessage: `Pomyślnie uaktualniono do planu Collect. Teraz możesz zacząć rezerwować i zarządzać podróżami!`,
                distanceRateMessage: `Pomyślnie zaktualizowano Twój plan do Collect. Teraz możesz zmienić stawkę za przejechany dystans!`,
                gotIt: 'Zrozumiałem, dziękuję',
                createdWorkspace: `Utworzono przestrzeń roboczą!`,
            },
            commonFeatures: {
                title: 'Ulepsz do planu Control',
                note: 'Odblokuj nasze najmocniejsze funkcje, w tym:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Plan Control zaczyna się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za członka za miesiąc.` : `za aktywnego członka za miesiąc.`} <a href="${learnMoreMethodsRoute}">Dowiedz się więcej</a> o naszych planach i cenach.</muted-text>`,
                    benefit1: 'Zaawansowane połączenia księgowe (NetSuite, Sage Intacct i inne)',
                    benefit2: 'Inteligentne zasady wydatków',
                    benefit3: 'Wielopoziomowe procesy zatwierdzania',
                    benefit4: 'Zaawansowane mechanizmy zabezpieczeń',
                    toUpgrade: 'Aby zaktualizować, kliknij',
                    selectWorkspace: 'wybierz przestrzeń roboczą i zmień typ planu na',
                },
                upgradeWorkspaceWarning: 'Nie można ulepszyć przestrzeni roboczej',
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: 'Twoja firma ograniczyła tworzenie przestrzeni roboczych. Skontaktuj się z administratorem, aby uzyskać pomoc.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Zmień plan na Collect',
                note: 'Jeśli zmienisz plan na niższy, utracisz dostęp do tych funkcji i innych:',
                benefits: {
                    note: 'Aby zobaczyć pełne porównanie naszych planów, sprawdź nasze',
                    pricingPage: 'strona cennika',
                    confirm: 'Czy na pewno chcesz obniżyć plan i usunąć swoje konfiguracje?',
                    warning: 'Tej operacji nie można cofnąć.',
                    benefit1: 'Połączenia księgowe (z wyjątkiem QuickBooks Online i Xero)',
                    benefit2: 'Inteligentne zasady wydatków',
                    benefit3: 'Wielopoziomowe procesy zatwierdzania',
                    benefit4: 'Zaawansowane mechanizmy zabezpieczeń',
                    headsUp: 'Uwaga!',
                    multiWorkspaceNote:
                        'Aby rozpocząć subskrypcję w planie Collect, musisz obniżyć poziom wszystkich swoich przestrzeni roboczych przed pierwszą miesięczną płatnością. Kliknij',
                    selectStep: '> wybierz każdą przestrzeń roboczą > zmień typ planu na',
                },
            },
            completed: {
                headline: 'Twoje środowisko pracy zostało zdegradowane',
                description: 'Masz inne przestrzenie robocze w planie Control. Aby były rozliczane według stawki Collect, musisz obniżyć plan wszystkich przestrzeni roboczych.',
                gotIt: 'Zrozumiałem, dziękuję',
            },
        },
        payAndDowngrade: {
            title: 'Zapłać i zdegraduj',
            headline: 'Twoja płatność końcowa',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Twój ostateczny rachunek za tę subskrypcję wyniesie <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Zobacz swoje zestawienie poniżej dla ${date}:`,
            subscription:
                'Uwaga! Ta akcja zakończy Twoją subskrypcję Expensify, usunie ten obszar roboczy i usunie wszystkich jego członków. Jeśli chcesz zachować ten obszar roboczy i usunąć tylko siebie, najpierw poproś innego administratora o przejęcie rozliczeń.',
            genericFailureMessage: 'Wystąpił błąd podczas opłacania rachunku. Spróbuj ponownie.',
        },
        restrictedAction: {
            restricted: 'Ograniczone',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Działania w przestrzeni roboczej ${workspaceName} są obecnie ograniczone`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Właściciel przestrzeni roboczej, ${workspaceOwnerName}, musi dodać lub zaktualizować zapisaną kartę płatniczą, aby odblokować nową aktywność w przestrzeni roboczej.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Musisz dodać lub zaktualizować zapisaną kartę płatniczą, aby odblokować nową aktywność w przestrzeni roboczej.',
            addPaymentCardToUnlock: 'Dodaj kartę płatniczą, aby odblokować!',
            addPaymentCardToContinueUsingWorkspace: 'Dodaj kartę płatniczą, aby kontynuować korzystanie z tego miejsca pracy',
            pleaseReachOutToYourWorkspaceAdmin: 'W razie pytań skontaktuj się z administratorem swojego obszaru roboczego.',
            chatWithYourAdmin: 'Czat z administratorem',
            chatInAdmins: 'Czat w #admins',
            addPaymentCard: 'Dodaj kartę płatniczą',
            goToSubscription: 'Przejdź do subskrypcji',
        },
        rules: {
            individualExpenseRules: {
                title: 'Wydatki',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Ustaw limity wydatków i domyślne ustawienia dla poszczególnych wydatków. Możesz też utworzyć reguły dla <a href="${categoriesPageLink}">kategorii</a> i <a href="${tagsPageLink}">tagów</a>.</muted-text>`,
                receiptRequiredAmount: 'Wymagana kwota paragonu',
                receiptRequiredAmountDescription: 'Wymagaj paragonów, gdy wydatki przekraczają tę kwotę, chyba że zostanie to nadpisane przez regułę kategorii.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Kwota nie może być wyższa niż kwota wymagana dla szczegółowych paragonów (${amount})`,
                itemizedReceiptRequiredAmount: 'Wymagana kwota szczegółowego paragonu',
                itemizedReceiptRequiredAmountDescription: 'Wymagaj szczegółowych paragonów, gdy wydatki przekraczają tę kwotę, chyba że zostanie to zmienione przez regułę kategorii.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Kwota nie może być niższa niż kwota wymagana dla zwykłych paragonów (${amount})`,
                maxExpenseAmount: 'Maksymalna kwota wydatku',
                maxExpenseAmountDescription: 'Oznacz wydatki przekraczające tę kwotę, chyba że zostanie to nadpisane przez regułę kategorii.',
                maxAge: 'Maksymalny wiek',
                maxExpenseAge: 'Maksymalny wiek wydatku',
                maxExpenseAgeDescription: 'Oznacz wydatki starsze niż określona liczba dni.',
                maxExpenseAgeDays: () => ({
                    one: '1 dzień',
                    other: (count: number) => `${count} dni`,
                }),
                cashExpenseDefault: 'Domyślny wydatek gotówkowy',
                cashExpenseDefaultDescription:
                    'Wybierz sposób tworzenia wydatków gotówkowych. Wydatek jest uznawany za wydatek gotówkowy, jeśli nie jest zaimportowaną transakcją z firmowej karty. Obejmuje to ręcznie utworzone wydatki, paragony, diety, wydatki za przejazdy oraz wydatki za czas.',
                reimbursableDefault: 'Podlegające zwrotowi',
                reimbursableDefaultDescription: 'Wydatki są najczęściej zwracane pracownikom',
                nonReimbursableDefault: 'Nierefundowane',
                nonReimbursableDefaultDescription: 'Wydatki są sporadycznie zwracane pracownikom',
                alwaysReimbursable: 'Zawsze podlega zwrotowi',
                alwaysReimbursableDescription: 'Wydatki są zawsze zwracane pracownikom',
                alwaysNonReimbursable: 'Zawsze niepodlegające zwrotowi',
                alwaysNonReimbursableDescription: 'Wydatki nigdy nie są zwracane pracownikom',
                billableDefault: 'Domyślnie refakturowalne',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Wybierz, czy wydatki gotówkowe i kartą kredytową powinny być domyślnie fakturowalne. Wydatki fakturowalne są włączane lub wyłączane w <a href="${tagsPageLink}">tagach</a>.</muted-text>`,
                billable: 'Do zafakturowania',
                billableDescription: 'Wydatki są najczęściej refakturowane klientom',
                nonBillable: 'Niefakturowalne',
                nonBillableDescription: 'Wydatki są okazjonalnie ponownie fakturowane klientom',
                eReceipts: 'eParagony',
                eReceiptsHint: `eParagony są automatycznie tworzone [dla większości transakcji kredytowych w USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Śledzenie uczestników',
                attendeeTrackingHint: 'Śledź koszt przypadający na osobę dla każdego wydatku.',
                prohibitedDefaultDescription:
                    'Oznacz wszystkie paragony, na których pojawia się alkohol, hazard lub inne zabronione pozycje. Wydatki z paragonami zawierającymi takie pozycje będą wymagały ręcznej weryfikacji.',
                prohibitedExpenses: 'Wydatki niedozwolone',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Dodatkowe opłaty hotelowe',
                gambling: 'Hazard',
                tobacco: 'Tytoń',
                adultEntertainment: 'Rozrywka dla dorosłych',
                requireCompanyCard: 'Wymagaj kart firmowych dla wszystkich zakupów',
                requireCompanyCardDescription: 'Oznacz wszystkie wydatki gotówkowe, w tym koszty za przejechane kilometry i diety.',
            },
            expenseReportRules: {
                title: 'Zaawansowany',
                subtitle: 'Zautomatyzuj zgodność raportów wydatków, proces zatwierdzania i płatności.',
                preventSelfApprovalsTitle: 'Zapobiegaj samodzielnym zatwierdzeniom',
                preventSelfApprovalsSubtitle: 'Uniemożliwiaj członkom przestrzeni roboczej zatwierdzanie własnych raportów wydatków.',
                autoApproveCompliantReportsTitle: 'Automatyczne zatwierdzanie zgodnych raportów',
                autoApproveCompliantReportsSubtitle: 'Skonfiguruj, które raporty wydatków kwalifikują się do automatycznego zatwierdzania.',
                autoApproveReportsUnderTitle: 'Automatycznie zatwierdzaj raporty poniżej',
                autoApproveReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty będą automatycznie zatwierdzane.',
                randomReportAuditTitle: 'Losowa kontrola raportu',
                randomReportAuditDescription: 'Wymagaj ręcznego zatwierdzania niektórych raportów, nawet jeśli kwalifikują się do automatycznego zatwierdzenia.',
                autoPayApprovedReportsTitle: 'Zatwierdzone raporty z automatyczną płatnością',
                autoPayApprovedReportsSubtitle: 'Skonfiguruj, które raporty wydatków kwalifikują się do automatycznej płatności.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Wprowadź kwotę mniejszą niż ${currency ?? ''}20 000`,
                autoPayApprovedReportsLockedSubtitle: 'Przejdź do „Więcej funkcji” i włącz „Workflowy”, a następnie dodaj „Płatności”, aby odblokować tę funkcję.',
                autoPayReportsUnderTitle: 'Automatycznie opłacaj raporty poniżej',
                autoPayReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty zostaną automatycznie opłacone.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Dodaj ${featureName}, aby odblokować tę funkcję.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Przejdź do [więcej funkcji](${moreFeaturesLink}) i włącz ${featureName}, aby odblokować tę funkcję.`,
            },
            categoryRules: {
                title: 'Zasady kategorii',
                approver: 'Akceptujący',
                requireDescription: 'Wymagaj opisu',
                requireFields: 'Wymagaj pól',
                requiredFieldsTitle: 'Wymagane pola',
                requiredFieldsDescription: (categoryName: string) => `To będzie miało zastosowanie do wszystkich wydatków skategoryzowanych jako <strong>${categoryName}</strong>.`,
                requireAttendees: 'Wymagaj uczestników',
                descriptionHint: 'Podpowiedź opisu',
                descriptionHintDescription: (categoryName: string) =>
                    `Przypominaj pracownikom o podaniu dodatkowych informacji dotyczących wydatków w kategorii „${categoryName}”. Ta podpowiedź pojawia się w polu opisu przy wydatkach.`,
                descriptionHintLabel: 'Podpowiedź',
                descriptionHintSubtitle: 'Wskazówka: Im krócej, tym lepiej!',
                maxAmount: 'Maksymalna kwota',
                flagAmountsOver: 'Oznacz kwoty powyżej',
                flagAmountsOverDescription: (categoryName: string) => `Dotyczy kategorii „${categoryName}”.`,
                flagAmountsOverSubtitle: 'To zastępuje maksymalną kwotę dla wszystkich wydatków.',
                expenseLimitTypes: {
                    expense: 'Pojedynczy wydatek',
                    expenseSubtitle: 'Oznaczaj kwoty wydatków według kategorii. Ta reguła zastępuje ogólną regułę przestrzeni roboczej dotyczącą maksymalnej kwoty wydatku.',
                    daily: 'Suma kategorii',
                    dailySubtitle: 'Oznacz łączny dzienny wydatek w danej kategorii dla każdego raportu wydatków.',
                },
                requireReceiptsOver: 'Wymagaj paragonów powyżej',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Domyślne`,
                    never: 'Nigdy nie wymagaj paragonów',
                    always: 'Zawsze wymagaj rachunków',
                },
                requireItemizedReceiptsOver: 'Wymagaj szczegółowych paragonów powyżej',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Domyślny`,
                    never: 'Nigdy nie wymagaj szczegółowych paragonów',
                    always: 'Zawsze wymagaj szczegółowych paragonów',
                },
                defaultTaxRate: 'Domyślna stawka podatku',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Przejdź do [Więcej funkcji](${moreFeaturesLink}) i włącz przepływy pracy, a następnie dodaj zatwierdzenia, aby odblokować tę funkcję.`,
            },
            customRules: {
                title: 'Polityka wydatków',
                cardSubtitle: 'Tutaj znajduje się polityka wydatków Twojego zespołu, aby wszyscy mieli jasność, co jest objęte.',
            },
            merchantRules: {
                title: 'Sprzedawca',
                subtitle: 'Skonfiguruj reguły dla sprzedawców, aby wydatki trafiały z poprawnym kodowaniem i wymagały mniej poprawek.',
                addRule: 'Dodaj regułę sprzedawcy',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Jeśli sprzedawca ${isExactMatch ? 'dokładnie pasuje' : 'Zawiera'} „${merchantName}”`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Zmień sprzedawcę na „${merchantName}”`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Zaktualizuj ${fieldName} na „${fieldValue}”`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Oznacz jako "${reimbursable ? 'kwalifikujący się do zwrotu kosztów' : 'niepodlegający zwrotowi'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Oznacz jako „${billable ? 'fakturowalne' : 'poza fakturą'}”`,
                addRuleTitle: 'Dodaj regułę',
                expensesWith: 'Dla wydatków z:',
                applyUpdates: 'Zastosuj te aktualizacje:',
                saveRule: 'Zapisz regułę',
                confirmError: 'Wprowadź sprzedawcę i zastosuj co najmniej jedną aktualizację',
                confirmErrorMerchant: 'Wprowadź sprzedawcę',
                confirmErrorUpdate: 'Proszę wprowadzić co najmniej jedną zmianę',
                editRuleTitle: 'Edytuj regułę',
                deleteRule: 'Usuń regułę',
                deleteRuleConfirmation: 'Czy na pewno chcesz usunąć tę regułę?',
                previewMatches: 'Podgląd dopasowań',
                previewMatchesEmptyStateTitle: 'Nie ma nic do wyświetlenia',
                previewMatchesEmptyStateSubtitle: 'Żadne niewysłane wydatki nie pasują do tej reguły.',
                matchType: 'Typ dopasowania',
                matchTypeContains: 'Zawiera',
                matchTypeExact: 'Dokładne dopasowanie',
                expensesExactlyMatching: 'Dla wydatków dokładnie pasujących:',
                duplicateRuleTitle: 'Podobna reguła sprzedawcy już istnieje',
                duplicateRulePrompt: (merchantName: string) => `Czy chcesz zapisać nową regułę dla „${merchantName}”, mimo że masz już istniejącą?`,
                saveAnyway: 'Zapisz mimo to',
                applyToExistingUnsubmittedExpenses: 'Zastosuj do istniejących niewysłanych wydatków',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Zbierz',
                    description: 'Dla zespołów, które chcą zautomatyzować swoje procesy.',
                },
                corporate: {
                    label: 'Kontrola',
                    description: 'Dla organizacji o zaawansowanych wymaganiach.',
                },
            },
            description: 'Wybierz plan odpowiedni dla siebie. Aby zapoznać się ze szczegółową listą funkcji i cen, odwiedź naszą',
            subscriptionLink: 'strona pomocy dotycząca typów planów i cen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Zobowiązałeś się do 1 aktywnego członka w planie Control do końca rocznej subskrypcji dnia ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję płatną za użycie i zmienić plan na Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
                other: `Zobowiązałeś(-aś) się do ${count} aktywnych członków w planie Control do końca swojej rocznej subskrypcji w dniu ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję z opłatą za użycie i zmienić plan na Collect, zaczynając od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
            }),
            subscriptions: 'Subskrypcje',
        },
    },
    getAssistancePage: {
        title: 'Uzyskaj pomoc',
        subtitle: 'Jesteśmy tutaj, aby oczyścić Twoją drogę do wielkości!',
        description: 'Wybierz jedną z poniższych opcji wsparcia:',
        chatWithConcierge: 'Czat z Concierge',
        scheduleSetupCall: 'Umów rozmowę konfiguracyjną',
        scheduleACall: 'Zaplanuj rozmowę',
        questionMarkButtonTooltip: 'Uzyskaj pomoc od naszego zespołu',
        exploreHelpDocs: 'Przeglądaj dokumentację pomocy',
        registerForWebinar: 'Zarejestruj się na webinar',
        onboardingHelp: 'Pomoc przy wdrożeniu',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Zmień domyślny odcień skóry',
        headers: {
            frequentlyUsed: 'Często używane',
            smileysAndEmotion: 'Buźki i Emocje',
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
        roomNameInvalidError: 'Nazwy pokojów mogą zawierać wyłącznie małe litery, cyfry i łączniki',
        pleaseEnterRoomName: 'Wprowadź nazwę pokoju',
        pleaseSelectWorkspace: 'Wybierz przestrzeń roboczą',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}zmienił nazwę na „${newName}” (wcześniej „${oldName}”)` : `${actor}zmienił nazwę tego pokoju na „${newName}” (wcześniej „${oldName}”)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Pokój został przemianowany na ${newName}`,
        social: 'Społeczność',
        selectAWorkspace: 'Wybierz przestrzeń roboczą',
        growlMessageOnRenameError: 'Nie można zmienić nazwy pokoju w przestrzeni roboczej. Sprawdź swoje połączenie i spróbuj ponownie.',
        visibilityOptions: {
            restricted: 'Workspace', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Prywatne',
            public: 'Publiczne',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Publiczne ogłoszenie',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Zatwierdź i zamknij',
        submitAndApprove: 'Wyślij i zatwierdź',
        advanced: 'Zaawansowane',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'INTELIGENTNY RAPORT',
        billcom: 'Bill.com',
    },
    workspaceActions: {
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `zmienił adres firmy na „${newAddress}” (wcześniej „${previousAddress}”)` : `ustaw adres firmy na „${newAddress}”`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `dodano ${approverName} (${approverEmail}) jako osobę zatwierdzającą dla pola ${field} „${name}”`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `usunął(-ę) ${approverName} (${approverEmail}) jako zatwierdzającego dla ${field} „${name}”`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `zmieniono zatwierdzającego dla ${field} „${name}” na ${formatApprover(newApproverName, newApproverEmail)} (poprzednio ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `dodano kategorię „${categoryName}”`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `usunął kategorię „${categoryName}”`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'Wyłączone' : 'włączone'} kategoria „${categoryName}”`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodano kod płacowy „${newValue}” do kategorii „${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `usunął(-ę) kod płacowy „${oldValue}” z kategorii „${categoryName}”`;
            }
            return `zmienił kod płacowy kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodano kod GL „${newValue}” do kategorii „${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `usunięto kod GL „${oldValue}” z kategorii „${categoryName}”`;
            }
            return `zmieniono kod GL kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `zmienił opis kategorii „${categoryName}” na ${!oldValue ? 'Wymagane' : 'niewymagane'} (wcześniej ${!oldValue ? 'niewymagane' : 'Wymagane'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `dodano nowy maksymalny limit ${newAmount} do kategorii „${categoryName}”`;
            }
            if (oldAmount && !newAmount) {
                return `usunięto maksymalną kwotę ${oldAmount} z kategorii „${categoryName}”`;
            }
            return `zmienił maksymalną kwotę kategorii „${categoryName}” na ${newAmount} (wcześniej ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `dodano typ limitu ${newValue} do kategorii „${categoryName}”`;
            }
            return `zmieniono typ limitu kategorii „${categoryName}” na ${newValue} (poprzednio ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `zaktualizowano kategorię „${categoryName}”, zmieniając Poświadczenia na ${newValue}`;
            }
            return `zmienił kategorię „${categoryName}” na ${newValue} (wcześniej ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `zaktualizowano kategorię "${categoryName}", zmieniając Szczegółowe paragony na ${newValue}`;
            }
            return `zmieniono Szczegółowe paragony kategorii "${categoryName}" na ${newValue} (wcześniej ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmienił(a) nazwę kategorii z „${oldName}" na „${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `usunął podpowiedź opisu „${oldValue}” z kategorii „${categoryName}”`;
            }
            return !oldValue
                ? `dodano podpowiedź opisu „${newValue}” do kategorii „${categoryName}”`
                : `zmieniono podpowiedź opisu kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmienił nazwę listy tagów na „${newName}” (poprzednio „${oldName}”)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `dodano znacznik „${tagName}” do listy „${tagListName}”`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `zaktualizowano listę tagów „${tagListName}”, zmieniając tag „${oldName}” na „${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'włączone' : 'Wyłączone'} tag "${tagName}" na liście "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `usunięto tag „${tagName}” z listy „${tagListName}”`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `usunięto tagi „${count}” z listy „${tagListName}”`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `zaktualizowano znacznik „${tagName}” na liście „${tagListName}”, zmieniając ${updatedField} na „${newValue}” (wcześniej „${oldValue}”)`;
            }
            return `zaktualizowano znacznik „${tagName}” na liście „${tagListName}”, dodając ${updatedField} o wartości „${newValue}”`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `zmienił(a) ${customUnitName} ${updatedField} na „${newValue}” (wcześniej „${oldValue}”)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Śledzenie podatków ${newValue ? 'włączone' : 'Wyłączone'} przy stawkach za przejechany dystans`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `dodał nową stawkę „${customUnitName}” „${rateName}”`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `zmienił(a) stawkę ${customUnitName} ${updatedField} „${customUnitRateName}” na „${newValue}” (wcześniej „${oldValue}”)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `zmienił stawkę podatku na stawkę za odległość „${customUnitRateName}” na „${newValue} (${newTaxPercentage})” (wcześniej „${oldValue} (${oldTaxPercentage})”)`;
            }
            return `dodano stawkę podatku „${newValue} (${newTaxPercentage})” do stawki za odległość „${customUnitRateName}”`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `zmienił część podatku podlegającą zwrotowi w stawce za dystans „${customUnitRateName}” na „${newValue}” (wcześniej „${oldValue}”)`;
            }
            return `dodał(a) odzyskiwalną część podatku „${newValue}” do stawki za dystans „${customUnitRateName}`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'włączone' : 'Wyłączone'} stawka jednostki ${customUnitName} „${customUnitRateName}”`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `usunął stawkę „${rateName}” dla „${customUnitName}”`,
        addedReportField: (fieldType: string, fieldName?: string) => `dodano pole raportu ${fieldType} „${fieldName}”`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) => `ustaw domyślną wartość pola raportu „${fieldName}” na „${defaultValue}”`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `dodano opcję „${optionName}” do pola raportu „${fieldName}”`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `usunięto opcję „${optionName}” z pola raportu „${fieldName}”`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'włączone' : 'Wyłączone'} opcja „${optionName}” dla pola raportu „${fieldName}”`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'włączone' : 'Wyłączone'} wszystkie opcje dla pola raportu „${fieldName}”`;
            }
            return `${allEnabled ? 'włączone' : 'Wyłączone'} opcję „${optionName}” dla pola raportu „${fieldName}”, dzięki czemu wszystkie opcje są ${allEnabled ? 'włączone' : 'Wyłączone'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `usunięto pole raportu ${fieldType} „${fieldName}”`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `zaktualizowano „Uniemożliwiaj samodzielne zatwierdzanie” na „${newValue === 'true' ? 'Włączone' : 'Wyłączone'}” (wcześniej „${oldValue === 'true' ? 'Włączone' : 'Wyłączone'}”)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `ustaw comiesięczną datę przesyłania raportu na „${newValue}”`;
            }
            return `zaktualizowano datę składania miesięcznego raportu na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano „Obciążanie klientów kosztami poniesionymi w ich imieniu” na „${newValue}” (wcześniej „${oldValue}”)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano „Domyślny wydatek gotówkowy” na „${newValue}” (wcześniej „${oldValue}”)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `włączył „Wymuszaj domyślne tytuły raportów” ${value ? 'włączone' : 'Wył.'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `zaktualizowano nazwę tego workspace do „${newName}” (wcześniej „${oldName}”)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription ? `ustaw opis tego obszaru roboczego na „${newDescription}”` : `zaktualizował opis tego obszaru roboczego na „${newDescription}” (wcześniej „${oldDescription}”)`,
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
                one: `usunął Cię z procesu akceptacji wydatków i czatu wydatków użytkownika ${joinedNames}. Wcześniej przesłane raporty pozostaną dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
                other: `usunął Cię z przepływów zatwierdzania i czatów wydatków ${joinedNames}. Poprzednio złożone raporty pozostaną dostępne do zatwierdzenia w Twojej Skrzynce odbiorczej.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `zaktualizował(a) Twoją rolę w ${policyName} z ${oldRole} na użytkownika. Zostałeś/Zostałaś usunięty(a) ze wszystkich czatów wydatków przesyłających, z wyjątkiem własnych.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `zaktualizowano domyślną walutę na ${newCurrency} (wcześniej ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `zaktualizowano częstotliwość automatycznego raportowania na „${newFrequency}” (poprzednio „${oldFrequency}”)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `zaktualizowano tryb zatwierdzania na „${newValue}” (poprzednio „${oldValue}”)`,
        upgradedWorkspace: 'ulepszył ten obszar roboczy do planu Control',
        forcedCorporateUpgrade: `Ta przestrzeń robocza została uaktualniona do planu Control. Kliknij <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">tutaj</a>, aby uzyskać więcej informacji.`,
        downgradedWorkspace: 'zmienił(a) ten workspace na plan Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `zmienił(a) współczynnik raportów losowo kierowanych do ręcznego zatwierdzania na ${Math.round(newAuditRate * 100)}% (wcześniej ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `zmienił ręczny limit zatwierdzania dla wszystkich wydatków na ${newLimit} (wcześniej ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'włączone' : 'Wyłączone'} kategorii`;
                case 'tags':
                    return `${enabled ? 'włączone' : 'Wyłączone'} tagów`;
                case 'workflows':
                    return `${enabled ? 'włączone' : 'Wyłączone'} przepływów pracy`;
                case 'distance rates':
                    return `${enabled ? 'włączone' : 'Wyłączone'} stawki za dystans`;
                case 'accounting':
                    return `${enabled ? 'włączone' : 'Wyłączone'} księgowość`;
                case 'Expensify Cards':
                    return `${enabled ? 'włączone' : 'Wyłączone'} Karty Expensify`;
                case 'company cards':
                    return `${enabled ? 'włączone' : 'Wyłączone'} firmowe karty`;
                case 'invoicing':
                    return `Fakturowanie ${enabled ? 'włączone' : 'Wyłączone'}`;
                case 'per diem':
                    return `${enabled ? 'włączone' : 'Wyłączone'} dieta`;
                case 'receipt partners':
                    return `${enabled ? 'włączone' : 'Wyłączone'} partnerzy paragonów`;
                case 'rules':
                    return `${enabled ? 'włączone' : 'Wyłączone'} reguły`;
                case 'tax tracking':
                    return `Śledzenie podatku ${enabled ? 'włączone' : 'Wyłączone'}`;
                default:
                    return `${enabled ? 'włączone' : 'Wyłączone'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `śledzenie uczestników ${enabled ? 'włączone' : 'Wyłączone'}`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'włączone' : 'wyłączone'} zwroty kosztów`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `dodano podatek „${taxName}”`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `usunął podatek „${taxName}”`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `zmienił nazwę podatku z „${oldValue}” na „${newValue}”`;
                }
                case 'code': {
                    return `zmienił kod podatkowy dla „${taxName}” z „${oldValue}” na „${newValue}”`;
                }
                case 'rate': {
                    return `zmienił stawkę podatku dla „${taxName}” z „${oldValue}” na „${newValue}”`;
                }
                case 'enabled': {
                    return `${oldValue ? 'Wyłączone' : 'włączone'} podatek „${taxName}”`;
                }
                default: {
                    return '';
                }
            }
        },
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zmienił formułę nazwy raportu niestandardowego na „${newValue}” (wcześniej „${oldValue}”)`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `zmieniono domyślnego zatwierdzającego na ${newApprover} (wcześniej ${previousApprover})` : `zmieniono domyślnego zatwierdzającego na ${newApprover}`,
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
            let text = `zmieniono obieg zatwierdzania dla ${members}, aby przesyłali raporty do ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `(wcześniej domyślny zatwierdzający ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(wcześniej domyślny zatwierdzający)';
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
                ? `zmieniono przepływ zatwierdzania dla ${members}, aby składali raporty do domyślnego zatwierdzającego ${approver}`
                : `zmieniono przepływ zatwierdzania dla ${members}, aby raporty były przesyłane do domyślnego zatwierdzającego`;
            if (wasDefaultApprover && previousApprover) {
                text += `(wcześniej domyślny zatwierdzający ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(wcześniej domyślny zatwierdzający)';
            } else if (previousApprover) {
                text += `(wcześniej ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `zmieniono obieg zatwierdzania dla ${approver}, aby przekazywać zatwierdzone raporty do ${forwardsTo} (wcześniej przekazywano do ${previousForwardsTo})`
                : `zmieniono przepływ zatwierdzania dla ${approver}, aby przekazywać zatwierdzone raporty do ${forwardsTo} (wcześniej ostatecznie zatwierdzone raporty)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `zmieniono proces zatwierdzania dla ${approver}, aby przestać przekazywać zatwierdzone raporty (wcześniej przekazywane do ${previousForwardsTo})`
                : `zmieniono przepływ zatwierdzania dla ${approver}, aby nie przekazywać dalej zatwierdzonych raportów`,
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
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `zmienił nazwę firmy na fakturze na „${newValue}” (wcześniej „${oldValue}”)` : `ustaw nazwę firmy na fakturze na „${newValue}”`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `zmienił firmową stronę internetową faktury na „${newValue}” (wcześniej „${oldValue}”)` : `ustaw firmową stronę internetową faktury na „${newValue}”`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `zmieniono upoważnionego płatnika na „${newReimburser}” (wcześniej „${previousReimburser}”)`
                : `zmienił(a) upoważnioną osobę dokonującą płatności na „${newReimburser}”`,
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `ustaw wymaganą kwotę paragonu na „${newValue}”`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `zmieniono wymaganą kwotę paragonu na „${newValue}” (wcześniej „${oldValue}”)`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `usunięto wymaganą kwotę paragonu (wcześniej „${oldValue}”)`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `ustaw maksymalną kwotę wydatku na „${newValue}”`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `zmieniono maksymalną kwotę wydatku na „${newValue}” (wcześniej „${oldValue}”)`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `usunięto maksymalną kwotę wydatku (wcześniej „${oldValue}”)`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `ustaw maksymalny wiek wydatku na „${newValue}” dni`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `zmieniono maksymalny wiek wydatku na „${newValue}” dni (wcześniej „${oldValue}”)`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `usunięto maksymalny wiek wydatku (wcześniej „${oldValue}” dni)`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'Włączone' : 'wyłączone'} automatycznie opłacone zatwierdzone raporty`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `ustaw próg automatycznej płatności zatwierdzonych raportów na „${newLimit}”`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `zmienił próg automatycznej płatności dla zatwierdzonych raportów na „${newLimit}” (wcześniej „${oldLimit}”)`,
        removedAutoPayApprovedReportsLimit: 'usunął próg dla automatycznego opłacania zatwierdzonych raportów',
    },
    roomMembersPage: {
        memberNotFound: 'Użytkownik nie został znaleziony.',
        useInviteButton: 'Aby zaprosić nowego członka do czatu, użyj przycisku „Zaproś” powyżej.',
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
        assignMe: 'Przypisz mnie',
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
        assignee: 'Cesjonariusz',
        completed: 'Zakończone',
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
            openShortcutDialog: 'Otwiera okno dialogowe skrótów klawiaturowych',
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
        viewResults: 'Wyświetl wyniki',
        resetFilters: 'Resetuj filtry',
        searchResults: {
            emptyResults: {
                title: 'Nie ma nic do wyświetlenia',
                subtitle: `Spróbuj zmienić kryteria wyszukiwania lub utwórz coś za pomocą przycisku +.`,
            },
            emptyExpenseResults: {
                title: 'Nie utworzyłeś jeszcze żadnych wydatków',
                subtitle: 'Utwórz wydatek lub skorzystaj z wersji demonstracyjnej Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby utworzyć wydatek.',
            },
            emptyReportResults: {
                title: 'Nie utworzyłeś jeszcze żadnych raportów',
                subtitle: 'Utwórz raport lub wypróbuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby utworzyć raport.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Nie utworzyłeś jeszcze żadnych
                    faktur
                `),
                subtitle: 'Wyślij fakturę lub wypróbuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby wysłać fakturę.',
            },
            emptyTripResults: {
                title: 'Brak podróży do wyświetlenia',
                subtitle: 'Rozpocznij, rezerwując poniżej swoją pierwszą podróż.',
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
                title: 'Brak wydatków do opłacenia',
                subtitle: 'Gratulacje! Przekroczyłeś linię mety.',
            },
            emptyExportResults: {
                title: 'Brak wydatków do wyeksportowania',
                subtitle: 'Czas trochę odetchnąć, świetna robota.',
            },
            emptyStatementsResults: {
                title: 'Brak wydatków do wyświetlenia',
                subtitle: 'Brak wyników. Spróbuj dostosować filtry.',
            },
            emptyUnapprovedResults: {
                title: 'Brak wydatków do zatwierdzenia',
                subtitle: 'Zero wydatków. Maksymalny luz. Dobra robota!',
            },
        },
        columns: 'Kolumny',
        resetColumns: 'Resetuj kolumny',
        groupColumns: 'Kolumny grupy',
        expenseColumns: 'Kolumny wydatków',
        statements: 'Wyciągi',
        unapprovedCash: 'Niezaakceptowana gotówka',
        unapprovedCard: 'Niezatwierdzona karta',
        reconciliation: 'Uzgodnienie',
        saveSearch: 'Zapisz wyszukiwanie',
        deleteSavedSearch: 'Usuń zapisaną wyszukiwarkę',
        deleteSavedSearchConfirm: 'Czy na pewno chcesz usunąć to wyszukiwanie?',
        searchName: 'Wyszukaj nazwę',
        savedSearchesMenuItemTitle: 'Zapisano',
        topCategories: 'Najlepsze kategorie',
        topMerchants: 'Najlepsi sprzedawcy',
        groupedExpenses: 'pogrupowane wydatki',
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
            completed: 'Zakończone',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Mniej niż ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Większe niż ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `Pomiędzy ${greaterThan} a ${lessThan}`,
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
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} to ${value}`,
            current: 'Bieżący',
            past: 'Przeszłość',
            submitted: 'Przesłano',
            approved: 'Zatwierdzone',
            paid: 'Opłacone',
            exported: 'Wyeksportowano',
            posted: 'Opublikowano',
            withdrawn: 'Wycofano',
            billable: 'Do zafakturowania',
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
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Prześlij',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Zatwierdź',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Zapłać',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Eksport',
            },
        },
        has: 'Ma',
        groupBy: 'Grupuj według',
        moneyRequestReport: {
            emptyStateTitle: 'Ten raport nie ma żadnych wydatków.',
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
            description: 'Uff, to całkiem sporo pozycji! Spakujemy je, a Concierge wkrótce wyśle Ci plik.',
        },
        exportedTo: 'Exported to',
        exportAll: {
            selectAllMatchingItems: 'Zaznacz wszystkie pasujące elementy',
            allMatchingItemsSelected: 'Wybrano wszystkie pasujące elementy',
        },
        topSpenders: 'Najwięksi wydający',
        view: {label: 'Zobacz', table: 'Tabela', bar: 'Pasek'},
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
            message: 'Załącznik został pomyślnie pobrany!',
            qrMessage:
                'Sprawdź folder ze zdjęciami lub pobranymi plikami, aby znaleźć kopię swojego kodu QR. Protip: dodaj go do prezentacji, aby Twoja publiczność mogła go zeskanować i połączyć się z Tobą bezpośrednio.',
        },
        generalError: {
            title: 'Błąd załącznika',
            message: 'Załącznik nie może zostać pobrany',
        },
        permissionError: {
            title: 'Dostęp do pamięci',
            message: 'Expensify nie może zapisywać załączników bez dostępu do pamięci. Stuknij „Ustawienia”, aby zaktualizować uprawnienia.',
        },
    },
    settlement: {
        status: {
            pending: 'Oczekujące',
            cleared: 'Rozliczone',
            failed: 'Niepowodzenie',
        },
        failedError: ({link}: {link: string}) => `Ponowimy tę spłatę, gdy <a href="${link}">odblokujesz swoje konto</a>.`,
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
            emptyReportConfirmationDontShowAgain: 'Nie pokazuj tego ponownie',
            genericWorkspaceName: 'to miejsce pracy',
        },
        genericCreateReportFailureMessage: 'Nieoczekiwany błąd podczas tworzenia tego czatu. Spróbuj ponownie później.',
        genericAddCommentFailureMessage: 'Nieoczekiwany błąd podczas publikowania komentarza. Spróbuj ponownie później.',
        genericUpdateReportFieldFailureMessage: 'Wystąpił nieoczekiwany błąd podczas aktualizowania pola. Spróbuj ponownie później.',
        genericUpdateReportNameEditFailureMessage: 'Niespodziewany błąd podczas zmiany nazwy raportu. Spróbuj ponownie później.',
        noActivityYet: 'Brak aktywności',
        connectionSettings: 'Ustawienia połączenia',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `zmieniono ${fieldName} na „${newValue}” (wcześniej „${oldValue}”)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `ustaw ${fieldName} na „${newValue}”`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `zmienił(-a) przestrzeń roboczą${fromPolicyName ? `(uprzednio ${fromPolicyName})` : ''}`;
                    }
                    return `zmienił(a) przestrzeń roboczą na ${toPolicyName}${fromPolicyName ? `(uprzednio ${fromPolicyName})` : ''}`;
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
                    automaticActionTwo: 'ustawienia księgowości',
                    manual: (label: string) => `oznaczył ten raport jako ręcznie wyeksportowany do ${label}.`,
                    automaticActionThree: 'i pomyślnie utworzył rekord dla',
                    reimburseableLink: 'wydatki z własnej kieszeni',
                    nonReimbursableLink: 'wydatki z firmowej karty',
                    pending: (label: string) => `rozpoczęto eksportowanie tego raportu do ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `nie udało się wyeksportować tego raportu do ${label} („${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}”)`,
                managerAttachReceipt: `dodał(a) paragon`,
                managerDetachReceipt: `usunął paragon`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `zapłacono ${currency}${amount} gdzie indziej`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `zapłacono ${currency}${amount} przez integrację`,
                outdatedBankAccount: `nie udało się przetworzyć płatności z powodu problemu z rachunkiem bankowym płatnika`,
                reimbursementACHBounce: `nie można było przetworzyć płatności z powodu problemu z kontem bankowym`,
                reimbursementACHCancelled: `anulował płatność`,
                reimbursementAccountChanged: `nie można było przetworzyć płatności, ponieważ płatnik zmienił konto bankowe`,
                reimbursementDelayed: `przetworzone płatności, ale jest opóźnione o kolejne 1–2 dni robocze`,
                selectedForRandomAudit: `losowo wybrane do weryfikacji`,
                selectedForRandomAuditMarkdown: `[losowo wybrany](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) do sprawdzenia`,
                share: ({to}: ShareParams) => `zaproszony członek ${to}`,
                unshare: ({to}: UnshareParams) => `usunięto członka ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `zapłacono ${currency}${amount}`,
                takeControl: `przejął kontrolę`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `wystąpił problem z synchronizacją z ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Proszę naprawić problem w <a href="${workspaceAccountingLink}">ustawieniach przestrzeni roboczej</a>.`,
                addEmployee: (email: string, role: string) => `dodano ${email} jako ${role === 'member' ? 'a' : 'jeden'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `zaktualizowano rolę użytkownika ${email} na ${newRole} (poprzednio ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usunięto pole niestandardowe 1 użytkownika ${email} (wcześniej „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `dodano „${newValue}” do niestandardowego pola 1 użytkownika ${email}`
                        : `zmienił(a) własne pole 1 użytkownika ${email} na „${newValue}” (wcześniej „${previousValue}”)`;
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
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `Połączenie ${feedName} jest przerwane. Aby przywrócić importy kart, <a href='${workspaceCompanyCardRoute}'>zaloguj się do swojego banku</a>`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `połączenie Plaid z Twoim firmowym kontem bankowym jest przerwane. <a href='${walletRoute}'>Połącz ponownie swoje konto bankowe ${maskedAccountNumber}</a>, aby nadal korzystać z kart Expensify.`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `firmowy rachunek bankowy ${maskedBankAccountNumber} został automatycznie zablokowany z powodu problemu z rozliczeniem Zwrotu kosztów lub karty Expensify. Prosimy rozwiązać ten problem w <a href="${linkURL}">ustawieniach przestrzeni roboczej</a>.`,
            },
            error: {
                invalidCredentials: 'Nieprawidłowe dane logowania, sprawdź konfigurację swojego połączenia.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} za ${dayCount} ${dayCount === 1 ? 'dzień' : 'dni'} do ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} z ${timePeriod} w dniu ${date}`,
    },
    footer: {
        features: 'Funkcje',
        expenseManagement: 'Zarządzanie wydatkami',
        spendManagement: 'Zarządzanie wydatkami',
        expenseReports: 'Raporty wydatków',
        companyCreditCard: 'Karta firmowa',
        receiptScanningApp: 'Aplikacja do skanowania paragonów',
        billPay: 'Bill Pay',
        invoicing: 'Fakturowanie',
        CPACard: 'Karta CPA',
        payroll: 'Lista płac',
        travel: 'Podróż',
        resources: 'Zasoby',
        expensifyApproved: 'Zatwierdzone przez Expensify!',
        pressKit: 'Zestaw prasowy',
        support: 'Pomoc',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Warunki korzystania z usługi',
        privacy: 'Prywatność',
        learnMore: 'Dowiedz się więcej',
        aboutExpensify: 'O Expensify',
        blog: 'Blog',
        jobs: 'Prace',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relacje inwestorskie',
        getStarted: 'Rozpocznij',
        createAccount: 'Utwórz nowe konto',
        logIn: 'Zaloguj się',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Nawiguj z powrotem do listy czatów',
        chatWelcomeMessage: 'Powitalna wiadomość czatu',
        navigatesToChat: 'Przechodzi do czatu',
        newMessageLineIndicator: 'Wskaźnik nowej linii wiadomości',
        chatMessage: 'Wiadomość na czacie',
        lastChatMessagePreview: 'Podgląd ostatniej wiadomości na czacie',
        workspaceName: 'Nazwa przestrzeni roboczej',
        chatUserDisplayNames: 'Wyświetlane nazwy członków czatu',
        scrollToNewestMessages: 'Przewiń do najnowszych wiadomości',
        preStyledText: 'Wstępnie sformatowany tekst',
        viewAttachment: 'Wyświetl załącznik',
    },
    parentReportAction: {
        deletedReport: 'Usunięty raport',
        deletedMessage: 'Usunięta wiadomość',
        deletedExpense: 'Usunięty wydatek',
        reversedTransaction: 'Transakcja odwrócona',
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
        copy: 'Kopiuj adres URL',
        copied: 'Skopiowano!',
    },
    moderation: {
        flagDescription: 'Wszystkie oflagowane wiadomości zostaną wysłane do moderatora do weryfikacji.',
        chooseAReason: 'Wybierz powód oznaczenia poniżej:',
        spam: 'Spam',
        spamDescription: 'Niechciana, nie na temat promocja',
        inconsiderate: 'Niemiły',
        inconsiderateDescription: 'Obraźliwe lub lekceważące sformułowania, o wątpliwych intencjach',
        intimidation: 'Zastraszanie',
        intimidationDescription: 'Agresywne forsowanie agendy pomimo uzasadnionych zastrzeżeń',
        bullying: 'Nękanie',
        bullyingDescription: 'Celowanie w pojedynczą osobę w celu wymuszenia posłuszeństwa',
        harassment: 'Nękanie',
        harassmentDescription: 'Rasistowskie, mizoginistyczne lub inne szeroko pojęte dyskryminujące zachowania',
        assault: 'Napaść',
        assaultDescription: 'Celowy, ukierunkowany atak emocjonalny mający na celu wyrządzenie krzywdy',
        flaggedContent: 'Ta wiadomość została oznaczona jako naruszająca nasze zasady społeczności, a jej treść została ukryta.',
        hideMessage: 'Ukryj wiadomość',
        revealMessage: 'Pokaż wiadomość',
        levelOneResult: 'Wysyła anonimowe ostrzeżenie, a wiadomość zostaje zgłoszona do sprawdzenia.',
        levelTwoResult: 'Wiadomość ukryta w kanale, wraz z anonimowym ostrzeżeniem, a wiadomość została zgłoszona do weryfikacji.',
        levelThreeResult: 'Wiadomość usunięta z kanału wraz z anonimowym ostrzeżeniem, a wiadomość została zgłoszona do weryfikacji.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Zaproś do przesłania wydatków',
        inviteToChat: 'Zaproś tylko do czatu',
        nothing: 'Nie rób nic',
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
            'Dołącz do Expensify.org w eliminowaniu niesprawiedliwości na całym świecie. Obecna kampania „Teachers Unite” wspiera nauczycieli wszędzie, dzieląc koszty niezbędnych artykułów szkolnych.',
        iKnowATeacher: 'Znam nauczyciela',
        iAmATeacher: 'Jestem nauczycielem',
        getInTouch: 'Świetnie! Proszę podać ich dane kontaktowe, abyśmy mogli się z nimi skontaktować.',
        introSchoolPrincipal: 'Przedstawienie twojego dyrektora szkoły',
        schoolPrincipalVerifyExpense:
            'Expensify.org dzieli koszt podstawowych przyborów szkolnych, aby uczniowie z rodzin o niskich dochodach mogli mieć lepsze warunki do nauki. Twój dyrektor zostanie poproszony o potwierdzenie Twoich wydatków.',
        principalFirstName: 'Imię głównego kredytobiorcy',
        principalLastName: 'Nazwisko głównego zleceniodawcy',
        principalWorkEmail: 'Główny służbowy e-mail',
        updateYourEmail: 'Zaktualizuj swój adres e‑mail',
        updateEmail: 'Zaktualizuj adres e‑mail',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Zanim przejdziesz dalej, upewnij się, że ustawiłeś szkolny adres e‑mail jako domyślną metodę kontaktu. Możesz to zrobić w Ustawienia > Profil > <a href="${contactMethodsRoute}">Metody kontaktu</a>.`,
        error: {
            enterPhoneEmail: 'Wpisz prawidłowy adres e‑mail lub numer telefonu',
            enterEmail: 'Wprowadź adres e‑mail',
            enterValidEmail: 'Wpisz prawidłowy adres e‑mail',
            tryDifferentEmail: 'Spróbuj innego adresu e-mail',
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
            title: 'Oczekujące mapowanie',
            subtitle: 'Mapa zostanie wygenerowana, gdy wrócisz do trybu online',
            onlineSubtitle: 'Chwileczkę, przygotowujemy mapę',
            errorTitle: 'Błąd mapy',
            errorSubtitle: 'Wystąpił błąd podczas ładowania mapy. Spróbuj ponownie.',
        },
        error: {
            selectSuggestedAddress: 'Wybierz sugerowany adres lub użyj bieżącej lokalizacji',
        },
        odometer: {startReading: 'Rozpocznij czytanie', endReading: 'Zakończ czytanie', saveForLater: 'Zapisz na później', totalDistance: 'Całkowity dystans'},
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
        successDescription: 'Będziesz musiał(-a) ją aktywować, gdy dotrze za kilka dni roboczych. W międzyczasie możesz korzystać z karty wirtualnej.',
    },
    eReceipt: {
        guaranteed: 'Gwarantowany e-paragon',
        transactionDate: 'Data transakcji',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Rozpocznij czat, <success><strong>poleć znajomego</strong></success>.',
            header: 'Rozpocznij czat, poleć znajomego',
            body: 'Chcesz, żeby Twoi znajomi też korzystali z Expensify? Po prostu rozpocznij z nimi czat, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Złóż raport wydatku, <success><strong>poleć swój zespół</strong></success>.',
            header: 'Zgłoś wydatek, poleć swój zespół',
            body: 'Chcesz, aby Twój zespół też korzystał z Expensify? Po prostu wyślij im raport wydatków, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi też korzystali z Expensify? Po prostu zacznij z nimi czat, zapłać im lub podziel wydatek, a my zajmiemy się resztą. Albo po prostu udostępnij im swój link z zaproszeniem!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Poleć znajomego',
            header: 'Poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi też korzystali z Expensify? Po prostu zacznij z nimi czat, zapłać im lub podziel wydatek, a my zajmiemy się resztą. Albo po prostu udostępnij im swój link z zaproszeniem!',
        },
        copyReferralLink: 'Skopiuj link zaproszenia',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Porozmawiaj ze swoim specjalistą ds. konfiguracji w <a href="${href}">${adminReportName}</a>, aby uzyskać pomoc`,
        default: `Wyślij wiadomość do <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>, aby uzyskać pomoc z konfiguracją`,
    },
    violations: {
        allTagLevelsRequired: 'Wymagane wszystkie tagi',
        autoReportedRejectedExpense: 'Ten wydatek został odrzucony.',
        billableExpense: 'Fakturowalne już nieważne',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Wymagany paragon${formattedLimit ? `powyżej ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategoria nie jest już prawidłowa',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Zastosowano dodatkową opłatę za przewalutowanie w wysokości ${surcharge}%`,
        customUnitOutOfPolicy: 'Stawka nie jest prawidłowa dla tego obszaru roboczego',
        duplicatedTransaction: 'Potencjalny duplikat',
        fieldRequired: 'Pola raportu są wymagane',
        futureDate: 'Przyszła data niedozwolona',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Podwyższona o ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data starsza niż ${maxAge} dni`,
        missingCategory: 'Brak kategorii',
        missingComment: 'Opis jest wymagany dla wybranej kategorii',
        missingAttendees: 'Wymaganych jest wielu uczestników dla tej kategorii',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Brakujące ${tagName ?? 'tag'}`,
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
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Wydatek przekracza automatyczny limit zatwierdzania wynoszący ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Kwota przekraczająca limit kategorii ${formattedLimit}/osobę`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekraczająca limit ${formattedLimit}/osobę`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekraczająca limit ${formattedLimit}/podróż`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekraczająca limit ${formattedLimit}/osobę`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Kwota przekracza dzienny limit kategorii w wysokości ${formattedLimit}/osobę`,
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
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Wymagany szczegółowy paragon${formattedLimit ? ` powyżej ${formattedLimit}` : ''}`,
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
                        return `wydatki dodatkowe w hotelu`;
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
                return 'Nie można automatycznie dopasować paragonu z powodu zerwanego połączenia z bankiem';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Połączenie z bankiem zostało przerwane. <a href="${companyCardPageURL}">Połącz ponownie, aby dopasować paragon</a>`
                    : 'Połączenie z bankiem zostało przerwane. Poproś administratora o ponowne połączenie, aby dopasować paragon.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Poproś ${member}, aby oznaczył jako gotówkę lub poczekaj 7 dni i spróbuj ponownie` : 'Oczekiwanie na połączenie z transakcją z karty.';
            }
            return '';
        },
        brokenConnection530Error: 'Paragon oczekujący z powodu zerwanego połączenia z bankiem',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Paragon oczekuje z powodu przerwanego połączenia z bankiem. Rozwiąż problem w <a href="${workspaceCompanyCardRoute}">Kartach firmowych</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Paragon oczekuje z powodu przerwanego połączenia z bankiem. Poproś administratora przestrzeni roboczej o rozwiązanie problemu.',
        markAsCashToIgnore: 'Oznacz jako gotówkę, aby zignorować i poprosić o płatność.',
        smartscanFailed: ({canEdit = true}) => `Skanowanie paragonu nie powiodło się.${canEdit ? 'Wprowadź szczegóły ręcznie.' : ''}`,
        receiptGeneratedWithAI: 'Potencjalny paragon wygenerowany przez AI',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Brakujący ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nie jest już ważny`,
        taxAmountChanged: 'Kwota podatku została zmieniona',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Podatek'} nie jest już prawidłowy`,
        taxRateChanged: 'Stawka podatku została zmodyfikowana',
        taxRequired: 'Brak stawki podatku',
        none: 'Brak',
        taxCodeToKeep: 'Wybierz, który kod podatkowy zachować',
        tagToKeep: 'Wybierz, który znacznik zachować',
        isTransactionReimbursable: 'Wybierz, czy transakcja podlega zwrotowi kosztów',
        merchantToKeep: 'Wybierz, którego sprzedawcę zachować',
        descriptionToKeep: 'Wybierz opis, który chcesz zachować',
        categoryToKeep: 'Wybierz kategorię do zachowania',
        isTransactionBillable: 'Wybierz, czy transakcja jest refakturowalna',
        keepThisOne: 'Zachowaj ten',
        confirmDetails: `Potwierdź szczegóły, które zachowujesz`,
        confirmDuplicatesInfo: `Duplikaty, których nie zachowasz, zostaną pozostawione do usunięcia przez osobę przesyłającą.`,
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
        unmute: 'Wyłącz wyciszenie',
        normal: 'Normalny',
    },
    exitSurvey: {
        header: 'Zanim wyjdziesz',
        reasonPage: {
            title: 'Prosimy, powiedz nam, dlaczego odchodzisz',
            subtitle: 'Zanim odejdziesz, powiedz nam, dlaczego chcesz przełączyć się na Expensify Classic.',
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
        thankYou: 'Dziękujemy za opinię!',
        thankYouSubtitle: 'Twoje odpowiedzi pomogą nam stworzyć lepszy produkt, który ułatwi załatwianie spraw. Bardzo dziękujemy!',
        goToExpensifyClassic: 'Przełącz na Expensify Classic',
        offlineTitle: 'Wygląda na to, że utknąłeś tutaj…',
        offline:
            'Wygląda na to, że jesteś offline. Niestety Expensify Classic nie działa w trybie offline, ale Nowy Expensify działa. Jeśli wolisz korzystać z Expensify Classic, spróbuj ponownie, gdy będziesz mieć połączenie z internetem.',
        quickTip: 'Szybka wskazówka...',
        quickTipSubTitle: 'Możesz przejść bezpośrednio do Expensify Classic, odwiedzając expensify.com. Dodaj ją do zakładek jako łatwy skrót!',
        bookACall: 'Umów rozmowę',
        bookACallTitle: 'Czy chcesz porozmawiać z product managerem?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Bezpośrednie czatowanie przy wydatkach i raportach',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Możliwość robienia wszystkiego na urządzeniu mobilnym',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Podróże i wydatki w tempie czatu',
        },
        bookACallTextTop: 'Przechodząc na Expensify Classic, przegapisz:',
        bookACallTextBottom:
            'Bylibyśmy podekscytowani możliwością rozmowy telefonicznej, aby zrozumieć dlaczego. Możesz umówić rozmowę z jednym z naszych starszych menedżerów produktu, aby omówić swoje potrzeby.',
        takeMeToExpensifyClassic: 'Przenieś mnie do Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Wystąpił błąd podczas wczytywania kolejnych wiadomości',
        tryAgain: 'Spróbuj ponownie',
    },
    systemMessage: {
        mergedWithCashTransaction: 'dopasował(-a) paragon do tej transakcji',
    },
    subscription: {
        authenticatePaymentCard: 'Uwierzytelnij kartę płatniczą',
        mobileReducedFunctionalityMessage: 'Nie możesz wprowadzać zmian w swojej subskrypcji w aplikacji mobilnej.',
        badge: {
            freeTrial: (numOfDays: number) => `Darmowy okres próbny: pozostało ${numOfDays} ${numOfDays === 1 ? 'dzień' : 'dni'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Twoje informacje dotyczące płatności są nieaktualne',
                subtitle: (date: string) => `Zaktualizuj swoją kartę płatniczą do ${date}, aby nadal korzystać ze wszystkich swoich ulubionych funkcji.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Twoja płatność nie mogła zostać przetworzona',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Twoja należność z dnia ${date} w wysokości ${purchaseAmountOwed} nie mogła zostać przetworzona. Dodaj kartę płatniczą, aby uregulować zaległą kwotę.`
                        : 'Dodaj kartę płatniczą, aby spłacić należną kwotę.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Twoje informacje dotyczące płatności są nieaktualne',
                subtitle: (date: string) => `Twoja płatność jest zaległa. Prosimy opłacić fakturę do ${date}, aby uniknąć przerwy w świadczeniu usług.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Twoje informacje dotyczące płatności są nieaktualne',
                subtitle: 'Twoja płatność jest przeterminowana. Prosimy o opłacenie faktury.',
            },
            billingDisputePending: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Zakwestionowałeś/-aś obciążenie w wysokości ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto będzie zablokowane do czasu rozwiązania sporu z Twoim bankiem.`,
            },
            cardAuthenticationRequired: {
                title: 'Twoja karta płatnicza nie została w pełni uwierzytelniona.',
                subtitle: (cardEnding: string) => `Proszę dokończyć proces uwierzytelniania, aby aktywować kartę płatniczą z numerem kończącym się na ${cardEnding}.`,
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
                    'Twoja karta płatnicza wygaśnie z końcem tego miesiąca. Kliknij poniższe menu z trzema kropkami, aby ją zaktualizować i nadal korzystać ze wszystkich swoich ulubionych funkcji.',
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
                `Zakwestionowałeś/-aś obciążenie w wysokości ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto będzie zablokowane do czasu rozwiązania sporu z Twoim bankiem.`,
            preTrial: {
                title: 'Rozpocznij bezpłatny okres próbny',
                subtitle: 'Jako kolejny krok <a href="#">ukończ listę kontrolną konfiguracji</a>, aby Twój zespół mógł rozpocząć rozliczanie wydatków.',
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
                subscriptionPageTitle: (discountType: number) => `<strong>${discountType}% zniżki na pierwszy rok!</strong> Po prostu dodaj kartę płatniczą i rozpocznij roczną subskrypcję.`,
                onboardingChatTitle: (discountType: number) => `Oferta ograniczona czasowo: ${discountType}% zniżki na pierwszy rok!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Zgłoś w ciągu ${days > 0 ? `${days}d :` : ''}${hours}g : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Płatność',
            subtitle: 'Dodaj kartę, aby opłacać swoją subskrypcję Expensify.',
            addCardButton: 'Dodaj kartę płatniczą',
            cardInfo: (name: string, expiration: string, currency: string) => `Nazwa: ${name}, Wygaśnięcie: ${expiration}, Waluta: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Data Twojej następnej płatności to ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Karta kończąca się na ${cardNumber}`,
            changeCard: 'Zmień kartę płatniczą',
            changeCurrency: 'Zmień walutę płatności',
            cardNotFound: 'Nie dodano karty płatniczej',
            retryPaymentButton: 'Ponów płatność',
            authenticatePayment: 'Uwierzytelnij płatność',
            requestRefund: 'Poproś o zwrot',
            requestRefundModal: {
                full: 'Otrzymanie zwrotu jest proste, po prostu obniż swój plan przed kolejną datą rozliczenia, a otrzymasz zwrot. <br /> <br /> Uwaga: Obniżenie planu oznacza, że Twoje przestrzenie robocze zostaną usunięte. Tej operacji nie można cofnąć, ale zawsze możesz utworzyć nową przestrzeń roboczą, jeśli zmienisz zdanie.',
                confirm: 'Usuń obszar(y) roboczy(e) i zmień plan na niższy',
            },
            viewPaymentHistory: 'Wyświetl historię płatności',
        },
        yourPlan: {
            title: 'Twój plan',
            exploreAllPlans: 'Przeglądaj wszystkie plany',
            customPricing: 'Indywidualna wycena',
            asLowAs: ({price}: YourPlanPriceValueParams) => `już od ${price} za aktywnego użytkownika/miesiąc`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} za członka/miesiąc`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} za członka za miesiąc`,
            perMemberMonth: 'za członka/miesiąc',
            collect: {
                title: 'Zbierz',
                description: 'Plan dla małych firm, który zapewnia wydatki, podróże i czat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, ${upper}/aktywnego członka bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, ${upper}/aktywnego członka bez karty Expensify.`,
                benefit1: 'Skanowanie paragonów',
                benefit2: 'Zwroty kosztów',
                benefit3: 'Zarządzanie kartami służbowymi',
                benefit4: 'Akceptacje wydatków i podróży',
                benefit5: 'Rezerwacja podróży i zasady',
                benefit6: 'Integracje QuickBooks/Xero',
                benefit7: 'Czatuj o wydatkach, raportach i pokojach',
                benefit8: 'Wsparcie AI i człowieka',
            },
            control: {
                title: 'Kontrola',
                description: 'Wydatki, podróże służbowe i czat dla większych firm.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, ${upper}/aktywnego członka bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, ${upper}/aktywnego członka bez karty Expensify.`,
                benefit1: 'Wszystko z planu Collect',
                benefit2: 'Wielopoziomowe procesy zatwierdzania',
                benefit3: 'Niestandardowe reguły wydatków',
                benefit4: 'Integracje ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integracje HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Niestandardowe analizy i raportowanie',
                benefit8: 'Budżetowanie',
            },
            thisIsYourCurrentPlan: 'To jest Twój obecny plan',
            downgrade: 'Obniż do Collect',
            upgrade: 'Ulepsz do Control',
            addMembers: 'Dodaj członków',
            saveWithExpensifyTitle: 'Oszczędzaj z kartą Expensify',
            saveWithExpensifyDescription: 'Skorzystaj z naszego kalkulatora oszczędności, aby zobaczyć, jak zwrot gotówki z karty Expensify Card może obniżyć Twój rachunek w Expensify.',
            saveWithExpensifyButton: 'Dowiedz się więcej',
        },
        compareModal: {
            comparePlans: 'Porównaj plany',
            subtitle: `<muted-text>Odblokuj funkcje, których potrzebujesz, dzięki planowi odpowiedniemu dla Ciebie. <a href="${CONST.PRICING}">Zobacz naszą stronę z cenami</a> lub pełne zestawienie funkcji każdego z naszych planów.</muted-text>`,
        },
        details: {
            title: 'Szczegóły subskrypcji',
            annual: 'Subskrypcja roczna',
            taxExempt: 'Poproś o status zwolnienia z podatku',
            taxExemptEnabled: 'Zwolnione z podatku',
            taxExemptStatus: 'Status zwolnienia z podatku',
            payPerUse: 'Płatność za użycie',
            subscriptionSize: 'Rozmiar subskrypcji',
            headsUp:
                'Uwaga: jeśli nie ustawisz teraz rozmiaru swojej subskrypcji, automatycznie ustawimy go na liczbę aktywnych członków w pierwszym miesiącu. Zobowiążesz się wówczas do opłacania co najmniej tej liczby członków przez następne 12 miesięcy. W każdej chwili możesz zwiększyć rozmiar subskrypcji, ale nie możesz go zmniejszyć, dopóki subskrypcja się nie zakończy.',
            zeroCommitment: 'Brak zobowiązań przy obniżonej rocznej stawce subskrypcji',
        },
        subscriptionSize: {
            title: 'Rozmiar subskrypcji',
            yourSize: 'Rozmiar Twojej subskrypcji to liczba otwartych miejsc, które w danym miesiącu mogą zostać zajęte przez dowolnego aktywnego członka.',
            eachMonth:
                'Każdego miesiąca Twoja subskrypcja obejmuje do liczby aktywnych członków ustawionej powyżej. Za każdym razem, gdy zwiększysz rozmiar subskrypcji, rozpoczniesz nową 12‑miesięczną subskrypcję w tym nowym rozmiarze.',
            note: 'Uwaga: Aktywnym członkiem jest każda osoba, która utworzyła, edytowała, przesłała, zatwierdziła, zrefundowała lub wyeksportowała dane wydatków powiązane z przestrzenią roboczą Twojej firmy.',
            confirmDetails: 'Potwierdź szczegóły nowej subskrypcji rocznej:',
            subscriptionSize: 'Rozmiar subskrypcji',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktywnych użytkowników/miesiąc`,
            subscriptionRenews: 'Subskrypcja odnawia się',
            youCantDowngrade: 'Nie możesz zmienić planu na tańszy w trakcie rocznej subskrypcji.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Zobowiązałeś(-aś) się już do rocznej subskrypcji obejmującej ${size} aktywnych użytkowników miesięcznie do ${date}. Możesz przejść na subskrypcję w modelu pay-per-use w dniu ${date}, wyłączając automatyczne odnawianie.`,
            error: {
                size: 'Wprowadź prawidłowy rozmiar subskrypcji',
                sameSize: 'Wprowadź liczbę inną niż rozmiar Twojej obecnej subskrypcji',
            },
        },
        paymentCard: {
            addPaymentCard: 'Dodaj kartę płatniczą',
            enterPaymentCardDetails: 'Wprowadź dane swojej karty płatniczej',
            security: 'Expensify jest zgodny z PCI-DSS, używa szyfrowania na poziomie bankowym i wykorzystuje redundantną infrastrukturę, aby chronić Twoje dane.',
            learnMoreAboutSecurity: 'Dowiedz się więcej o naszych zabezpieczeniach.',
        },
        subscriptionSettings: {
            title: 'Ustawienia subskrypcji',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Typ subskrypcji: ${subscriptionType}, Rozmiar subskrypcji: ${subscriptionSize}, Automatyczne odnawianie: ${autoRenew}, Automatyczne zwiększanie rocznej liczby miejsc: ${autoIncrease}`,
            none: 'brak',
            on: 'włączone',
            off: 'Wył.',
            annual: 'Roczny',
            autoRenew: 'Automatyczne odnawianie',
            autoIncrease: 'Automatycznie zwiększaj roczną liczbę miejsc',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Oszczędzaj do ${amountWithCurrency}/miesiąc na aktywnego członka`,
            automaticallyIncrease:
                'Automatycznie zwiększaj liczbę rocznych miejsc, aby uwzględnić aktywnych członków przekraczających rozmiar Twojej subskrypcji. Uwaga: spowoduje to wydłużenie daty zakończenia rocznej subskrypcji.',
            disableAutoRenew: 'Wyłącz automatyczne odnawianie',
            helpUsImprove: 'Pomóż nam ulepszyć Expensify',
            whatsMainReason: 'Jaki jest główny powód wyłączenia automatycznego odnawiania?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Odnawia się ${date}.`,
            pricingConfiguration: 'Cena zależy od konfiguracji. Aby uzyskać najniższą cenę, wybierz subskrypcję roczną i zamów kartę Expensify.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Dowiedz się więcej na naszej <a href="${CONST.PRICING}">stronie z cennikiem</a> lub porozmawiaj z naszym zespołem w swoim ${hasAdminsRoom ? `<a href="adminsRoom">pokój #admins.</a>` : '#admins pokój.'}</muted-text>`,
            estimatedPrice: 'Szacowana cena',
            changesBasedOn: 'To zmienia się w zależności od korzystania z karty Expensify i opcji subskrypcji poniżej.',
        },
        requestEarlyCancellation: {
            title: 'Poproś o wcześniejsze anulowanie',
            subtitle: 'Jaki jest główny powód, dla którego prosisz o wcześniejsze anulowanie?',
            subscriptionCanceled: {
                title: 'Subskrypcja anulowana',
                subtitle: 'Twoja subskrypcja roczna została anulowana.',
                info: 'Jeśli chcesz dalej korzystać ze swojego/ swoich workspace’ów w modelu płatności za użycie, wszystko jest gotowe.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Jeśli chcesz zapobiec przyszłej aktywności i naliczeniom, musisz <a href="${workspacesListRoute}">usunąć swój(e) workspace(y)</a>. Pamiętaj, że po usunięciu workspace’ów zostaną naliczone opłaty za wszelką nierozliczoną aktywność z bieżącego miesiąca kalendarzowego.`,
            },
            requestSubmitted: {
                title: 'Żądanie zostało przesłane',
                subtitle:
                    'Dziękujemy za poinformowanie nas o chęci anulowania subskrypcji. Rozpatrujemy Twoją prośbę i wkrótce skontaktujemy się z Tobą przez czat z <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Wnioskując o wcześniejsze anulowanie, potwierdzam i zgadzam się, że Expensify nie ma obowiązku uwzględnienia takiego wniosku na mocy <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Warunków korzystania z usługi</a> Expensify ani innej obowiązującej umowy o świadczenie usług zawartej między mną a Expensify oraz że Expensify zachowuje pełną swobodę decyzji w zakresie uwzględnienia takiego wniosku.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funkcjonalność wymaga ulepszenia',
        tooExpensive: 'Zbyt drogie',
        inadequateSupport: 'Niewystarczające wsparcie klienta',
        businessClosing: 'Zamknięcie firmy, redukcja zatrudnienia lub przejęcie',
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
        switchAccount: 'Przełącz konto:',
        copilotDelegatedAccess: 'Copilot: Dostęp delegowany',
        copilotDelegatedAccessDescription: 'Pozwól innym członkom uzyskać dostęp do Twojego konta.',
        addCopilot: 'Dodaj kopilota',
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
        confirmCopilot: 'Potwierdź swojego Copilota poniżej.',
        accessLevelDescription: 'Wybierz poziom dostępu poniżej. Zarówno Pełny, jak i Ograniczony dostęp pozwalają kopilotom przeglądać wszystkie konwersacje i wydatki.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Pozwól innemu członkowi wykonywać w Twoim imieniu wszystkie działania na Twoim koncie. Obejmuje to czat, składanie wniosków, zatwierdzanie, płatności, aktualizacje ustawień i więcej.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Pozwól innemu członkowi wykonywać w Twoim imieniu większość działań na Twoim koncie. Nie obejmuje to zatwierdzania, płatności, odrzucania i wstrzymywania.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Usuń Copilot',
        removeCopilotConfirmation: 'Czy na pewno chcesz usunąć tego copilota?',
        changeAccessLevel: 'Zmień poziom dostępu',
        makeSureItIsYou: 'Upewnijmy się, że to naprawdę Ty',
        enterMagicCode: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby dodać współpilota. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby zaktualizować swojego copilota.`,
        notAllowed: 'Nie tak szybko...',
        noAccessMessage: dedent(`
            Jako kopilot nie masz dostępu do
            tej strony. Przepraszamy!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Jako <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">współpilot</a> użytkownika ${accountOwnerEmail} nie masz uprawnień do wykonania tej akcji. Przepraszamy!`,
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
        numberFields: 'Pola numeryczne',
        booleanFields: 'Pola logiczne',
        constantFields: 'Pola stałe',
        dateTimeFields: 'Pola daty i godziny',
        date: 'Data',
        time: 'Czas',
        none: 'Brak',
        visibleInLHN: 'Widoczne w LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'prawda',
        false: 'Fałsz',
        viewReport: 'Zobacz raport',
        viewTransaction: 'Zobacz transakcję',
        createTransactionViolation: 'Utwórz naruszenie transakcji',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ma szkic komentarza',
            hasGBR: 'Ma GBR',
            hasRBR: 'Ma RBR',
            pinnedByUser: 'Przypięte przez członka',
            hasIOUViolations: 'Ma naruszenia IOU',
            hasAddWorkspaceRoomErrors: 'Ma błędy dodawania pokoju w przestrzeni roboczej',
            isUnread: 'Jest nieprzeczytane (tryb skupienia)',
            isArchived: 'Jest zarchiwizowane (najnowszy tryb)',
            isSelfDM: 'To własny DM',
            isFocused: 'Jest tymczasowo aktywne',
        },
        reasonGBR: {
            hasJoinRequest: 'Ma prośbę o dołączenie (pokój administratora)',
            isUnreadWithMention: 'Nieprzeczytane z wzmianką',
            isWaitingForAssigneeToCompleteAction: 'Oczekuje na wykonanie działania przez osobę przypisaną',
            hasChildReportAwaitingAction: 'Ma raport podrzędny oczekujący na działanie',
            hasMissingInvoiceBankAccount: 'Brakujący rachunek bankowy faktury',
            hasUnresolvedCardFraudAlert: 'Ma nierozwiązane powiadomienie o oszustwie związanym z kartą',
            hasDEWApproveFailed: 'Zatwierdzenie DEW nie powiodło się',
        },
        reasonRBR: {
            hasErrors: 'Zawiera błędy w danych raportu lub danych działań na raporcie',
            hasViolations: 'Ma naruszenia',
            hasTransactionThreadViolations: 'Ma naruszenia wątku transakcji',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Raport oczekuje na działanie',
            theresAReportWithErrors: 'Istnieje raport z błędami',
            theresAWorkspaceWithCustomUnitsErrors: 'Istnieje przestrzeń robocza z błędami niestandardowych jednostek',
            theresAProblemWithAWorkspaceMember: 'Wystąpił problem z członkiem przestrzeni roboczej',
            theresAProblemWithAWorkspaceQBOExport: 'Wystąpił problem z ustawieniem eksportu połączenia przestrzeni roboczej.',
            theresAProblemWithAContactMethod: 'Wystąpił problem z metodą kontaktu',
            aContactMethodRequiresVerification: 'Metoda kontaktu wymaga weryfikacji',
            theresAProblemWithAPaymentMethod: 'Wystąpił problem z metodą płatności',
            theresAProblemWithAWorkspace: 'Wystąpił problem z przestrzenią roboczą',
            theresAProblemWithYourReimbursementAccount: 'Wystąpił problem z Twoim kontem zwrotów',
            theresABillingProblemWithYourSubscription: 'Wystąpił problem z rozliczeniami Twojej subskrypcji',
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
        subtitle: 'Zawiera wszystko, co kochasz w naszym klasycznym doświadczeniu, oraz całą masę ulepszeń, które jeszcze bardziej ułatwią Ci życie:',
        confirmText: 'Zaczynajmy!',
        helpText: 'Wypróbuj 2‑minutowe demo',
        features: {
            search: 'Bardziej zaawansowane wyszukiwanie na telefonie, w sieci i na komputerze',
            concierge: 'Wbudowana Concierge AI, która pomaga automatyzować Twoje wydatki',
            chat: 'Czatuj przy każdym wydatku, aby szybko rozwiązywać pytania',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Rozpocznij <strong>tutaj!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Zmień nazwę zapisanych wyszukiwań</strong> tutaj!</tooltip>',
        accountSwitcher: '<tooltip>Uzyskaj dostęp do swoich <strong>kont Copilot</strong> tutaj</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Zeskanuj nasz przykładowy paragon</strong>, aby zobaczyć, jak to działa!</tooltip>',
            manager: '<tooltip>Wybierz naszego <strong>menedżera testów</strong>, aby go wypróbować!</tooltip>',
            confirmation: '<tooltip>Teraz <strong>prześlij swój wydatek</strong> i zobacz,\njak dzieje się magia!</tooltip>',
            tryItOut: 'Wypróbuj',
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
            title: 'Zaplanuj rozmowę',
            description: 'Znajdź termin, który ci pasuje.',
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
        title: 'Wszystko jasne i wysłane!',
        description: 'Wszystkie ostrzeżenia i naruszenia zostały usunięte, więc:',
        submittedExpensesTitle: 'Te wydatki zostały złożone',
        submittedExpensesDescription: 'Te wydatki zostały wysłane do Twojego akceptującego, ale nadal można je edytować do momentu zatwierdzenia.',
        pendingExpensesTitle: 'Oczekujące wydatki zostały przeniesione',
        pendingExpensesDescription: 'Wszelkie oczekujące wydatki z karty zostały przeniesione do osobnego raportu, dopóki nie zostaną zaksięgowane.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Wypróbuj w 2‑minutowym teście',
        },
        modal: {
            title: 'Wypróbuj nas w praktyce',
            description: 'Skorzystaj z krótkiego przewodnika po produkcie, aby szybko się wdrożyć.',
            confirmText: 'Rozpocznij jazdę próbną',
            helpText: 'Pomiń',
            employee: {
                description:
                    '<muted-text>Zapewnij swojemu zespołowi <strong>3 darmowe miesiące Expensify!</strong> Po prostu wpisz poniżej adres e-mail swojego szefa i wyślij mu przykładowy wydatek.</muted-text>',
                email: 'Wprowadź adres e-mail swojego szefa',
                error: 'Ten członek jest właścicielem przestrzeni roboczej, wprowadź proszę nowego członka do testu.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Aktualnie testujesz Expensify',
            readyForTheRealThing: 'Gotowy na prawdziwą wersję?',
            getStarted: 'Rozpocznij',
        },
        employeeInviteMessage: (name: string) => `# ${name} zaprosił Cię do wypróbowania Expensify
Cześć! Właśnie załatwiłem(-am) nam *3 miesiące za darmo*, żebyś mógł/mogła wypróbować Expensify – najszybszy sposób rozliczania wydatków.

Oto *paragon testowy*, który pokazuje, jak to działa:`,
    },
    export: {
        basicExport: 'Podstawowy eksport',
        reportLevelExport: 'Wszystkie dane – poziom raportu',
        expenseLevelExport: 'Wszystkie dane – poziom wydatku',
        exportInProgress: 'Trwa eksport',
        conciergeWillSend: 'Concierge wkrótce wyśle Ci plik.',
    },
    domain: {
        notVerified: 'Niezweryfikowano',
        retry: 'Spróbuj ponownie',
        verifyDomain: {
            title: 'Zweryfikuj domenę',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Zanim przejdziesz dalej, zweryfikuj, że jesteś właścicielem domeny <strong>${domainName}</strong>, aktualizując jej ustawienia DNS.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Uzyskaj dostęp do swojego dostawcy DNS i otwórz ustawienia DNS dla <strong>${domainName}</strong>.`,
            addTXTRecord: 'Dodaj następujący rekord TXT:',
            saveChanges: 'Zapisz zmiany i wróć tutaj, aby zweryfikować swoją domenę.',
            youMayNeedToConsult: `Może być konieczne skontaktowanie się z działem IT Twojej firmy, aby zakończyć weryfikację. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Dowiedz się więcej</a>.`,
            warning:
                'Po zakończeniu weryfikacji wszyscy członkowie Expensify w Twojej domenie otrzymają wiadomość e-mail informującą, że ich konto będzie zarządzane w ramach Twojej domeny.',
            codeFetchError: 'Nie udało się pobrać kodu weryfikacyjnego',
            genericError: 'Nie mogliśmy zweryfikować Twojej domeny. Spróbuj ponownie i skontaktuj się z Concierge, jeśli problem będzie się powtarzał.',
        },
        domainVerified: {
            title: 'Domena zweryfikowana',
            header: 'Juhu! Twoja domena została zweryfikowana',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Domena <strong>${domainName}</strong> została pomyślnie zweryfikowana i możesz teraz skonfigurować SAML oraz inne funkcje zabezpieczeń.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Pojedyncze logowanie SAML (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> to funkcja zabezpieczeń, która daje Ci większą kontrolę nad tym, w jaki sposób członkowie z adresami e-mail <strong>${domainName}</strong> logują się do Expensify. Aby ją włączyć, musisz zweryfikować się jako upoważniony administrator firmowy.</muted-text>`,
            fasterAndEasierLogin: 'Szybsze i łatwiejsze logowanie',
            moreSecurityAndControl: 'Więcej bezpieczeństwa i kontroli',
            onePasswordForAnything: 'Jedno hasło do wszystkiego',
        },
        goToDomain: 'Przejdź do domeny',
        samlLogin: {
            title: 'Logowanie SAML',
            subtitle: `<muted-text>Skonfiguruj logowanie członków za pomocą <a href="${CONST.SAML_HELP_URL}">pojedynczego logowania SAML (SSO).</a></muted-text>`,
            enableSamlLogin: 'Włącz logowanie SAML',
            allowMembers: 'Zezwalaj członkom logować się za pomocą SAML.',
            requireSamlLogin: 'Wymagaj logowania SAML',
            anyMemberWillBeRequired: 'Każdy członek zalogowany inną metodą będzie musiał ponownie się uwierzytelnić, używając SAML.',
            enableError: 'Nie udało się zaktualizować ustawienia włączenia SAML',
            requireError: 'Nie można było zaktualizować ustawienia wymogu SAML',
            disableSamlRequired: 'Wyłącz wymóg SAML',
            oktaWarningPrompt: 'Czy na pewno? Spowoduje to również wyłączenie Okta SCIM.',
            requireWithEmptyMetadataError: 'Dodaj poniżej metadane dostawcy tożsamości, aby włączyć',
        },
        samlConfigurationDetails: {
            title: 'Szczegóły konfiguracji SAML',
            subtitle: 'Użyj tych danych, aby skonfigurować SAML.',
            identityProviderMetadata: 'Metadane dostawcy tożsamości',
            entityID: 'ID jednostki',
            nameIDFormat: 'Format identyfikatora nazwy',
            loginUrl: 'URL logowania',
            acsUrl: 'Adres URL ACS (Assertion Consumer Service)',
            logoutUrl: 'Adres URL wylogowania',
            sloUrl: 'Adres URL SLO (Single Logout)',
            serviceProviderMetaData: 'Metadane dostawcy usług',
            oktaScimToken: 'Token SCIM Okta',
            revealToken: 'Pokaż token',
            fetchError: 'Nie udało się pobrać szczegółów konfiguracji SAML',
            setMetadataGenericError: 'Nie można ustawić metadanych SAML',
        },
        accessRestricted: {
            title: 'Dostęp ograniczony',
            subtitle: (domainName: string) => `Proszę zweryfikować się jako autoryzowany administrator firmy dla <strong>${domainName}</strong>, jeśli potrzebujesz kontroli nad:`,
            companyCardManagement: 'Zarządzanie kartami firmowymi',
            accountCreationAndDeletion: 'Tworzenie i usuwanie konta',
            workspaceCreation: 'Tworzenie obszaru roboczego',
            samlSSO: 'SAML SSO',
        },
        addDomain: {
            title: 'Dodaj domenę',
            subtitle: 'Wprowadź nazwę prywatnej domeny, do której chcesz uzyskać dostęp (np. expensify.com).',
            domainName: 'Nazwa domeny',
            newDomain: 'Nowa domena',
        },
        domainAdded: {title: 'Dodano domenę', description: 'Następnie musisz zweryfikować własność domeny i dostosować ustawienia zabezpieczeń.', configure: 'Skonfiguruj'},
        enhancedSecurity: {
            title: 'Zwiększone bezpieczeństwo',
            subtitle: 'Wymagaj, aby członkowie Twojej domeny logowali się przez Single Sign-On (SSO), ograniczaj tworzenie obszarów roboczych i nie tylko.',
            enable: 'Włącz',
        },
        admins: {
            title: 'Administratorzy',
            findAdmin: 'Znajdź administratora',
            primaryContact: 'Główny kontakt',
            addPrimaryContact: 'Dodaj główny kontakt',
            setPrimaryContactError: 'Nie można ustawić głównego kontaktu. Spróbuj ponownie później.',
            settings: 'Ustawienia',
            consolidatedDomainBilling: 'Skonsolidowane rozliczanie domen',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Gdy ta opcja jest włączona, główny kontakt będzie opłacać wszystkie przestrzenie robocze należące do członków <strong>${domainName}</strong> i otrzymywać wszystkie potwierdzenia rozliczeń.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'Nie udało się zmienić zbiorczego rozliczania domeny. Spróbuj ponownie później.',
            addAdmin: 'Dodaj administratora',
            addAdminError: 'Nie można dodać tego członka jako administratora. Spróbuj ponownie.',
            revokeAdminAccess: 'Cofnij uprawnienia administratora',
            cantRevokeAdminAccess: 'Nie można odebrać uprawnień administratora kontaktowi technicznemu',
            error: {
                removeAdmin: 'Nie można usunąć tego użytkownika jako administratora. Spróbuj ponownie.',
                removeDomain: 'Nie można usunąć tej domeny. Spróbuj ponownie.',
                removeDomainNameInvalid: 'Wprowadź swoją nazwę domeny, aby ją zresetować.',
            },
            resetDomain: 'Resetuj domenę',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Wpisz proszę <strong>${domainName}</strong>, aby potwierdzić reset domeny.`,
            enterDomainName: 'Wpisz tutaj swoją nazwę domeny',
            resetDomainInfo: `Ta akcja jest <strong>trwała</strong> i następujące dane zostaną usunięte: <br/> <ul><li>Połączenia kart firmowych i wszystkie nierozliczone wydatki z tych kart</li> <li>Ustawienia SAML i grup</li> </ul> Wszystkie konta, przestrzenie robocze, raporty, wydatki i inne dane pozostaną bez zmian. <br/><br/>Uwaga: Możesz usunąć tę domenę z listy swoich domen, usuwając powiązany adres e-mail z <a href="#">metod kontaktu</a>.`,
        },
        members: {
            title: 'Członkowie',
            findMember: 'Znajdź członka',
            addMember: 'Dodaj członka',
            email: 'Adres e-mail',
            errors: {addMember: 'Nie można dodać tego członka. Spróbuj ponownie.'},
        },
        domainAdmins: 'Administratorzy domeny',
    },
    gps: {
        disclaimer: 'Użyj GPS, aby utworzyć wydatek z Twojej podróży. Stuknij „Start” poniżej, aby rozpocząć śledzenie.',
        error: {failedToStart: 'Nie udało się uruchomić śledzenia lokalizacji.', failedToGetPermissions: 'Nie udało się uzyskać wymaganych uprawnień do lokalizacji.'},
        trackingDistance: 'Śledzenie dystansu…',
        stopped: 'Zatrzymano',
        start: 'Start',
        stop: 'Zatrzymaj',
        discard: 'Odrzuć',
        stopGpsTrackingModal: {title: 'Zatrzymaj śledzenie GPS', prompt: 'Czy na pewno? To zakończy Twoją obecną podróż.', cancel: 'Wznów śledzenie', confirm: 'Zatrzymaj śledzenie GPS'},
        discardDistanceTrackingModal: {
            title: 'Odrzuć śledzenie dystansu',
            prompt: 'Czy na pewno? Spowoduje to odrzucenie Twojej obecnej ścieżki i nie będzie można tego cofnąć.',
            confirm: 'Odrzuć śledzenie dystansu',
        },
        zeroDistanceTripModal: {title: 'Nie można utworzyć wydatku', prompt: 'Nie możesz utworzyć wydatku z tym samym miejscem początkowym i końcowym.'},
        locationRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji',
            prompt: 'Aby rozpocząć śledzenie dystansu GPS, zezwól na dostęp do lokalizacji w ustawieniach swojego urządzenia.',
            allow: 'Zezwól',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji w tle',
            prompt: 'Zezwól aplikacji na dostęp do lokalizacji w tle w ustawieniach urządzenia (opcja „Zawsze zezwalaj”), aby rozpocząć śledzenie dystansu GPS.',
        },
        preciseLocationRequiredModal: {
            title: 'Wymagane dokładne położenie',
            prompt: 'Włącz proszę „dokładną lokalizację” w ustawieniach swojego urządzenia, aby rozpocząć śledzenie dystansu GPS.',
        },
        desktop: {
            title: 'Śledź dystans na swoim telefonie',
            subtitle: 'Automatycznie rejestruj mile lub kilometry za pomocą GPS i natychmiast zamieniaj podróże w wydatki.',
            button: 'Pobierz aplikację',
        },
        continueGpsTripModal: {
            title: 'Kontynuować rejestrowanie trasy GPS?',
            prompt: 'Wygląda na to, że aplikacja została zamknięta podczas Twojej ostatniej trasy GPS. Czy chcesz kontynuować rejestrowanie z tamtej trasy?',
            confirm: 'Kontynuuj podróż',
            cancel: 'Zobacz podróż',
        },
        notification: {title: 'Śledzenie GPS w toku', body: 'Przejdź do aplikacji, aby dokończyć'},
        signOutWarningTripInProgress: {title: 'Śledzenie GPS w toku', prompt: 'Czy na pewno chcesz porzucić podróż i się wylogować?', confirm: 'Odrzuć i wyloguj się'},
        locationServicesRequiredModal: {
            title: 'Wymagany dostęp do lokalizacji',
            confirm: 'Otwórz ustawienia',
            prompt: 'Zezwól na dostęp do lokalizacji w ustawieniach urządzenia, aby rozpocząć śledzenie dystansu za pomocą GPS.',
        },
        fabGpsTripExplained: 'Przejdź do ekranu GPS (przycisk akcji)',
    },
    homePage: {
        forYou: 'Dla Ciebie',
        announcements: 'Ogłoszenia',
        discoverSection: {
            title: 'Odkryj',
            menuItemTitleNonAdmin: 'Dowiedz się, jak tworzyć wydatki i przesyłać raporty.',
            menuItemTitleAdmin: 'Dowiedz się, jak zapraszać członków, edytować ścieżki zatwierdzania i uzgadniać karty firmowe.',
            menuItemDescription: 'Zobacz, co Expensify potrafi zrobić w 2 min',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `Prześlij ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            approve: ({count}: {count: number}) => `Zatwierdź ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            pay: ({count}: {count: number}) => `Zapłać ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            export: ({count}: {count: number}) => `Eksportuj ${count} ${count === 1 ? 'raport' : 'raporty'}`,
            begin: 'Rozpocznij',
            emptyStateMessages: {
                nicelyDone: 'Dobra robota',
                keepAnEyeOut: 'Wypatruj, co nadchodzi wkrótce!',
                allCaughtUp: 'Wszystko nadrobione',
                upcomingTodos: 'Nadchodzące zadania do wykonania pojawią się tutaj.',
            },
        },
        timeSensitiveSection: {
            title: 'Pilne',
            cta: 'Roszczenie',
            offer50off: {title: 'Uzyskaj 50% zniżki na pierwszy rok!', subtitle: ({formattedTime}: {formattedTime: string}) => `Pozostało: ${formattedTime}`},
            offer25off: {title: 'Uzyskaj 25% zniżki na pierwszy rok!', subtitle: ({days}: {days: number}) => `Pozostało ${days} ${days === 1 ? 'dzień' : 'dni'}`},
            addShippingAddress: {title: 'Potrzebujemy Twojego adresu do wysyłki', subtitle: 'Podaj adres, na który mamy wysłać Twoją kartę Expensify.', cta: 'Dodaj adres'},
            activateCard: {title: 'Aktywuj swoją kartę Expensify', subtitle: 'Zweryfikuj swoją kartę i zacznij wydawać.', cta: 'Aktywuj'},
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
