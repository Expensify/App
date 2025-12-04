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
    AccountOwnerParams,
    ActionsAreCurrentlyRestricted,
    AddedOrDeletedPolicyReportFieldParams,
    AddedPolicyApprovalRuleParams,
    AddEmployeeParams,
    AddOrDeletePolicyCustomUnitRateParams,
    AddressLineParams,
    AirlineParams,
    AlreadySignedInParams,
    ApprovalWorkflowErrorParams,
    ApprovedAmountParams,
    AssignedCardParams,
    AssigneeParams,
    AuthenticationErrorParams,
    AutoPayApprovedReportsLimitErrorParams,
    BadgeFreeTrialParams,
    BankAccountLastFourParams,
    BeginningOfArchivedRoomParams,
    BeginningOfChatHistoryAdminRoomParams,
    BeginningOfChatHistoryAnnounceRoomParams,
    BeginningOfChatHistoryDomainRoomParams,
    BeginningOfChatHistoryInvoiceRoomParams,
    BeginningOfChatHistoryPolicyExpenseChatParams,
    BeginningOfChatHistoryUserRoomParams,
    BillableDefaultDescriptionParams,
    BillingBannerCardAuthenticationRequiredParams,
    BillingBannerCardExpiredParams,
    BillingBannerCardOnDisputeParams,
    BillingBannerDisputePendingParams,
    BillingBannerInsufficientFundsParams,
    BillingBannerOwnerAmountOwedOverdueParams,
    BillingBannerSubtitleWithDateParams,
    BusinessBankAccountParams,
    BusinessRegistrationNumberParams,
    BusinessTaxIDParams,
    CanceledRequestParams,
    CardEndingParams,
    CardInfoParams,
    CardNextPaymentParams,
    CategoryNameParams,
    ChangedApproverMessageParams,
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
    DateParams,
    DateShouldBeAfterParams,
    DateShouldBeBeforeParams,
    DefaultAmountParams,
    DefaultVendorDescriptionParams,
    DelegateRoleParams,
    DelegatorParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    DeleteTransactionParams,
    DemotedFromWorkspaceParams,
    DependentMultiLevelTagsSubtitleParams,
    DidSplitAmountMessageParams,
    DisconnectYourBankAccountParams,
    DomainPermissionInfoRestrictionParams,
    DuplicateTransactionParams,
    EarlyDiscountSubtitleParams,
    EarlyDiscountTitleParams,
    EditActionParams,
    EditDestinationSubtitleParams,
    ElectronicFundsParams,
    EmployeeInviteMessageParams,
    EmptyCategoriesSubtitleWithAccountingParams,
    EmptyTagsSubtitleWithAccountingParams,
    EnableContinuousReconciliationParams,
    EnterMagicCodeParams,
    ErrorODIntegrationParams,
    ExportAgainModalDescriptionParams,
    ExportedToIntegrationParams,
    ExportIntegrationSelectedParams,
    FeatureNameParams,
    FileLimitParams,
    FileTypeParams,
    FiltersAmountBetweenParams,
    FlightLayoverParams,
    FlightParams,
    FocusModeUpdateParams,
    FormattedMaxLengthParams,
    GoBackMessageParams,
    ImportedTagsMessageParams,
    ImportedTypesParams,
    ImportFieldParams,
    ImportMembersSuccessfulDescriptionParams,
    ImportPerDiemRatesSuccessfulDescriptionParams,
    ImportTagsSuccessfulDescriptionParams,
    IncorrectZipFormatParams,
    IndividualExpenseRulesSubtitleParams,
    InstantSummaryParams,
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
    LoggedInAsParams,
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
    PaidWithExpensifyParams,
    ParentNavigationSummaryParams,
    PayAndDowngradeDescriptionParams,
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
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
    RequestCountParams,
    RequestedAmountMessageParams,
    RequiredFieldParams,
    ResolutionConstraintsParams,
    ReviewParams,
    RoleNamesParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
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
    SubmittedWithMemoParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsRenewsOnParams,
    SubscriptionSettingsSaveUpToParams,
    SubscriptionSettingsSummaryParams,
    SubscriptionSizeParams,
    SyncStageNameConnectionsParams,
    TagSelectionParams,
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
        in: 'W',
        optional: 'Opcjonalne',
        new: 'Nowy',
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
        submit: 'Wyślij',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Wysłane',
        rotate: 'Obróć',
        zoom: 'Zoom',
        password: 'Hasło',
        magicCode: 'Kod magiczny',
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
        signInWithApple: 'Zaloguj się przez Apple',
        signInWith: 'Zaloguj się przez',
        continue: 'Kontynuuj',
        firstName: 'Imię',
        lastName: 'Nazwisko',
        scanning: 'Skanowanie',
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
        addressLine: ({lineNumber}: AddressLineParams) => `Linia adresu ${lineNumber}`,
        personalAddress: 'Adres domowy',
        companyAddress: 'Adres firmy',
        noPO: 'Prosimy nie podawać skrytek pocztowych ani adresów typu mail‑drop.',
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
        acceptTermsAndConditions: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">regulamin</a>`,
        acceptTermsOfService: `Akceptuję <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Warunki korzystania z usługi Expensify</a>`,
        remove: 'Usuń',
        admin: 'Administrator',
        owner: 'Właściciel',
        dateFormat: 'YYYY-MM-DD',
        send: 'Wyślij',
        na: 'Nie dotyczy',
        noResultsFound: 'Nie znaleziono wyników',
        noResultsFoundMatching: (searchString: string) => `Nie znaleziono wyników pasujących do „${searchString}”`,
        recentDestinations: 'Ostatnie miejsca',
        timePrefix: 'To',
        conjunctionFor: 'dla',
        todayAt: 'Dzisiaj o',
        tomorrowAt: 'Jutro o',
        yesterdayAt: 'Wczoraj o',
        conjunctionAt: 'o',
        conjunctionTo: 'do',
        genericErrorMessage: 'Ups... coś poszło nie tak i nie udało się zrealizować Twojego żądania. Spróbuj ponownie później.',
        percentage: 'Procent',
        error: {
            invalidAmount: 'Nieprawidłowa kwota',
            acceptTerms: 'Aby kontynuować, musisz zaakceptować Warunki korzystania z usługi',
            phoneNumber: `Proszę wprowadzić pełny numer telefonu
(np. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'To pole jest wymagane',
            requestModified: 'Toje żądanie jest modyfikowane przez innego członka',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Przekroczono limit znaków (${length}/${limit})`,
            dateInvalid: 'Wybierz prawidłową datę',
            invalidDateShouldBeFuture: 'Proszę wybrać dzisiejszą lub przyszłą datę',
            invalidTimeShouldBeFuture: 'Wybierz godzinę co najmniej o minutę późniejszą',
            invalidCharacter: 'Nieprawidłowy znak',
            enterMerchant: 'Wpisz nazwę sprzedawcy',
            enterAmount: 'Wprowadź kwotę',
            missingMerchantName: 'Brak nazwy sprzedawcy',
            missingAmount: 'Brakująca kwota',
            missingDate: 'Brak daty',
            enterDate: 'Wprowadź datę',
            invalidTimeRange: 'Wprowadź godzinę w 12‑godzinnym formacie (np. 2:30 PM)',
            pleaseCompleteForm: 'Proszę wypełnić powyższy formularz, aby kontynuować',
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
        contactUs: 'Skontaktuj się z nami',
        pleaseEnterEmailOrPhoneNumber: 'Wprowadź adres e‑mail lub numer telefonu',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'Popraw błędy',
        inTheFormBeforeContinuing: 'w formularzu przed kontynuowaniem',
        confirm: 'Potwierdź',
        reset: 'Resetuj',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: 'Gotowe',
        more: 'Więcej',
        debitCard: 'Karta debetowa',
        bankAccount: 'Konto bankowe',
        personalBankAccount: 'Osobiste konto bankowe',
        businessBankAccount: 'Firmowe konto bankowe',
        join: 'Dołącz',
        leave: 'Urlop',
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
        errorOccurredWhileTryingToPlayVideo: 'Wystąpił błąd podczas próby odtworzenia tego wideo.',
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
        createdBy: 'Utworzone przez',
        with: 'z',
        shareCode: 'Udostępnij kod',
        share: 'Udostępnij',
        per: 'za',
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
        category: 'Kategoria',
        report: 'Raport',
        billable: 'Fakturowalne',
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
        rate: 'Oceń',
        emptyLHN: {
            title: 'Hurra! Wszystko nadrobione.',
            subtitleText1: 'Znajdź czat za pomocą',
            subtitleText2: 'przycisk powyżej lub utwórz coś, używając',
            subtitleText3: 'przycisk poniżej.',
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
        drafts: 'Wersje robocze',
        // @context as a noun, not a verb
        draft: 'Szkic',
        finished: 'Zakończono',
        upgrade: 'Uaktualnij',
        downgradeWorkspace: 'Obniż plan przestrzeni roboczej',
        companyID: 'ID firmy',
        userID: 'ID użytkownika',
        disable: 'Wyłącz',
        export: 'Eksportuj',
        initialValue: 'Wartość początkowa',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Aktualna data',
        value: 'Wartość',
        downloadFailedTitle: 'Pobieranie nie powiodło się',
        downloadFailedDescription: 'Nie udało się zakończyć pobierania. Spróbuj ponownie później.',
        filterLogs: 'Filtruj logi',
        network: 'Sieć',
        reportID: 'Identyfikator raportu',
        longID: 'Długie ID',
        withdrawalID: 'ID wypłaty',
        bankAccounts: 'Konta bankowe',
        chooseFile: 'Wybierz plik',
        chooseFiles: 'Wybierz pliki',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Upuść tutaj',
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
        skip: 'Pomiń',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Potrzebujesz czegoś konkretnego? Porozmawiaj ze swoim opiekunem konta, ${accountManagerDisplayName}.`,
        chatNow: 'Czat teraz',
        workEmail: 'Służbowy e-mail',
        destination: 'Miejsce docelowe',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Stawka dodatkowa',
        perDiem: 'Dieta',
        validate: 'Zweryfikuj',
        downloadAsPDF: 'Pobierz jako PDF',
        downloadAsCSV: 'Pobierz jako CSV',
        help: 'Pomoc',
        expenseReport: 'Raport wydatków',
        expenseReports: 'Raporty wydatków',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Stawka poza polityką',
        leaveWorkspace: 'Opuść przestrzeń roboczą',
        leaveWorkspaceConfirmation: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mógł przesyłać do niej wydatków.',
        leaveWorkspaceConfirmationAuditor: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mógł(-mogła) przeglądać jej raportów ani ustawień.',
        leaveWorkspaceConfirmationAdmin: 'Jeśli opuścisz tę przestrzeń roboczą, nie będziesz mógł zarządzać jej ustawieniami.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz tę przestrzeń roboczą, w procesie zatwierdzania zastąpi Cię ${workspaceOwner}, właściciel przestrzeni roboczej.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz to miejsce pracy, zostaniesz zastąpiony jako preferowany eksporter przez ${workspaceOwner}, właściciela miejsca pracy.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Jeśli opuścisz ten obszar roboczy, zostaniesz zastąpiony jako kontakt techniczny przez ${workspaceOwner}, właściciela obszaru roboczego.`,
        leaveWorkspaceReimburser:
            'Nie możesz opuścić tej przestrzeni roboczej jako rozliczający. Ustaw nowego rozliczającego w Workspaces > Make or track payments, a następnie spróbuj ponownie.',
        reimbursable: 'Podlegające zwrotowi',
        editYourProfile: 'Edytuj swój profil',
        comments: 'Komentarze',
        sharedIn: 'Udostępniono w',
        unreported: 'Niezgłoszone',
        explore: 'Odkrywaj',
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
        workspacesTabTitle: 'Przestrzenie robocze',
        headsUp: 'Uwaga!',
        submitTo: 'Prześlij do',
        forwardTo: 'Przekaż do',
        merge: 'Scal',
        none: 'Brak',
        unstableInternetConnection: 'Niestabilne połączenie internetowe. Sprawdź swoje połączenie sieciowe i spróbuj ponownie.',
        enableGlobalReimbursements: 'Włącz globalne zwroty',
        purchaseAmount: 'Kwota zakupu',
        frequency: 'Częstotliwość',
        link: 'Link',
        pinned: 'Przypięte',
        read: 'Przeczytaj',
        copyToClipboard: 'Kopiuj do schowka',
        thisIsTakingLongerThanExpected: 'To trwa dłużej niż oczekiwano...',
        domains: 'Domeny',
        actionRequired: 'Wymagane działanie',
    },
    supportalNoAccess: {
        title: 'Nie tak szybko',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Nie masz uprawnień do wykonania tej akcji, gdy wsparcie jest zalogowane (komenda: ${command ?? ''}). Jeśli uważasz, że zespół Success powinien móc wykonać tę akcję, rozpocznij rozmowę na Slacku.`,
    },
    lockedAccount: {
        title: 'Zablokowane konto',
        description: 'Nie możesz wykonać tej akcji, ponieważ to konto zostało zablokowane. Skontaktuj się z concierge@expensify.com, aby poznać dalsze kroki',
    },
    location: {
        useCurrent: 'Użyj bieżącej lokalizacji',
        notFound: 'Nie udało się ustalić Twojej lokalizacji. Spróbuj ponownie lub wprowadź adres ręcznie.',
        permissionDenied: 'Wygląda na to, że odmówiłeś dostępu do swojej lokalizacji.',
        please: 'Proszę',
        allowPermission: 'zezwól na dostęp do lokalizacji w ustawieniach',
        tryAgain: 'i spróbuj ponownie.',
    },
    contact: {
        importContacts: 'Importuj kontakty',
        importContactsTitle: 'Zaimportuj kontakty',
        importContactsText: 'Zaimportuj kontakty z telefonu, aby twoi ulubieni znajomi byli zawsze na wyciągnięcie ręki.',
        importContactsExplanation: 'dzięki czemu Twoje ulubione osoby są zawsze na wyciągnięcie ręki.',
        importContactsNativeText: 'Jeszcze tylko jeden krok! Daj nam zielone światło na zaimportowanie Twoich kontaktów.',
    },
    anonymousReportFooter: {
        logoTagline: 'Dołącz do dyskusji.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Dostęp do aparatu',
        expensifyDoesNotHaveAccessToCamera: 'Expensify nie może robić zdjęć bez dostępu do aparatu. Naciśnij „Ustawienia”, aby zaktualizować uprawnienia.',
        attachmentError: 'Błąd załącznika',
        errorWhileSelectingAttachment: 'Wystąpił błąd podczas wybierania załącznika. Spróbuj ponownie.',
        errorWhileSelectingCorruptedAttachment: 'Wystąpił błąd podczas wybierania uszkodzonego załącznika. Spróbuj wybrać inny plik.',
        takePhoto: 'Zrób zdjęcie',
        chooseFromGallery: 'Wybierz z galerii',
        chooseDocument: 'Wybierz plik',
        attachmentTooLarge: 'Załącznik jest zbyt duży',
        sizeExceeded: 'Rozmiar załącznika przekracza limit 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Rozmiar załącznika jest większy niż limit ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Załącznik jest za mały',
        sizeNotMet: 'Rozmiar załącznika musi być większy niż 240 bajtów',
        wrongFileType: 'Nieprawidłowy typ pliku',
        notAllowedExtension: 'Ten typ pliku jest niedozwolony. Spróbuj użyć innego typu pliku.',
        folderNotAllowedMessage: 'Przesyłanie folderu jest niedozwolone. Spróbuj przesłać inny plik.',
        protectedPDFNotSupported: 'Plik PDF chroniony hasłem nie jest obsługiwany',
        attachmentImageResized: 'Ten obraz został zmieniony na potrzeby podglądu. Pobierz go, aby zobaczyć w pełnej rozdzielczości.',
        attachmentImageTooLarge: 'Ten obraz jest zbyt duży, aby wyświetlić jego podgląd przed przesłaniem.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Możesz przesłać jednocześnie maksymalnie ${fileLimit} plików.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Pliki przekraczają ${maxUploadSizeInMB} MB. Spróbuj ponownie.`,
        someFilesCantBeUploaded: 'Niektórych plików nie można przesłać',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Pliki muszą mieć mniej niż ${maxUploadSizeInMB} MB. Większe pliki nie zostaną przesłane.`,
        maxFileLimitExceeded: 'Możesz przesłać jednorazowo maksymalnie 30 paragonów. Dodatkowe nie zostaną przesłane.',
        unsupportedFileType: ({fileType}: FileTypeParams) => `Pliki typu ${fileType} nie są obsługiwane. Zostaną przesłane tylko obsługiwane typy plików.`,
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
        description: 'Przeciągaj, powiększaj i obracaj swój obraz w dowolny sposób.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nie znaleziono rozszerzenia dla typu MIME',
        problemGettingImageYouPasted: 'Wystąpił problem z pobraniem wklejonego obrazu',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Maksymalna długość komentarza to ${formattedMaxLength} znaków.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Maksymalna długość tytułu zadania to ${formattedMaxLength} znaków.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Zaktualizuj aplikację',
        updatePrompt: 'Nowa wersja tej aplikacji jest dostępna.\nZaktualizuj ją teraz lub uruchom ponownie później, aby pobrać najnowsze zmiany.',
    },
    deeplinkWrapper: {
        launching: 'Uruchamianie Expensify',
        expired: 'Twoja sesja wygasła.',
        signIn: 'Zaloguj się ponownie.',
        redirectedToDesktopApp: 'Przekierowaliśmy Cię do aplikacji desktopowej.',
        youCanAlso: 'Możesz także',
        openLinkInBrowser: 'otwórz ten link w swojej przeglądarce',
        loggedInAs: ({email}: LoggedInAsParams) => `Jesteś zalogowany jako ${email}. Kliknij „Otwórz link” w monicie, aby zalogować się do aplikacji desktopowej przy użyciu tego konta.`,
        doNotSeePrompt: 'Nie widzisz monitu?',
        tryAgain: 'Spróbuj ponownie',
        or: ', lub',
        continueInWeb: 'kontynuuj do aplikacji internetowej',
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
            na którym został on pierwotnie zażądany
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
            Wymagane uwierzytelnianie dwuskładnikowe
        `),
        tfaRequiredDescription: dedent(`
            Wprowadź kod uwierzytelniania dwuskładnikowego
            w miejscu, w którym próbujesz się zalogować.
        `),
        requestOneHere: 'prośba pierwsza tutaj.',
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
        title: 'Niestandardowy proces zatwierdzania',
        description: 'Twoja firma ma niestandardowy proces zatwierdzania w tym obszarze roboczym. Wykonaj tę akcję w Expensify Classic',
        goToExpensifyClassic: 'Przełącz na Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Zgłoś wydatek, poleć swój zespół',
            subtitleText: 'Chcesz, aby Twój zespół też korzystał z Expensify? Po prostu wyślij im wydatek, a my zajmiemy się resztą.',
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
        phrase2: 'Pieniądze mówią. A teraz, gdy czat i płatności są w jednym miejscu, jest to też łatwe.',
        phrase3: 'Twoje płatności docierają do Ciebie tak szybko, jak szybko potrafisz wyrazić swoją myśl.',
        enterPassword: 'Wprowadź swoje hasło',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, zawsze miło zobaczyć tu nową twarz!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Wprowadź magiczny kod wysłany na ${login}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
    },
    login: {
        hero: {
            header: 'Podróże służbowe i wydatki w tempie rozmowy',
            body: 'Witamy w nowej generacji Expensify, gdzie Twoje podróże i wydatki przebiegają szybciej dzięki kontekstowemu czatowi w czasie rzeczywistym.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Jesteś już zalogowany jako ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Nie chcesz logować się za pomocą ${provider}?`,
        continueWithMyCurrentSession: 'Kontynuuj moją bieżącą sesję',
        redirectToDesktopMessage: 'Przekierujemy Cię do aplikacji desktopowej, gdy tylko zakończysz logowanie.',
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
        fileUploadFailed: 'Przesyłanie nieudane. Plik nie jest obsługiwany.',
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
        copyURLToClipboard: 'Kopiuj adres URL do schowka',
        copyEmailToClipboard: 'Skopiuj e-mail do schowka',
        markAsUnread: 'Oznacz jako nieprzeczytane',
        markAsRead: 'Oznacz jako przeczytane',
        editAction: ({action}: EditActionParams) => `Edytuj ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'Komentarz'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'Komentarz';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Usuń ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'Komentarz';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Czy na pewno chcesz usunąć ten/ą ${type}?`;
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
        reactedWith: 'zareagował(a)',
    },
    reportActionsView: {
        beginningOfArchivedRoom: ({reportName, reportDetailsLink}: BeginningOfArchivedRoomParams) =>
            `Przegapiłeś imprezę w <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, nie ma tu nic do zobaczenia.`,
        beginningOfChatHistoryDomainRoom: ({domainRoom}: BeginningOfChatHistoryDomainRoomParams) =>
            `Ten czat obejmuje wszystkich członków Expensify w domenie <strong>${domainRoom}</strong>. Używaj go do rozmów ze współpracownikami, dzielenia się wskazówkami i zadawania pytań.`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `Ten czat jest z administratorem <strong>${workspaceName}</strong>. Użyj go, aby rozmawiać o konfiguracji przestrzeni roboczej i nie tylko.`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `Ten czat jest ze wszystkimi w <strong>${workspaceName}</strong>. Używaj go do najważniejszych ogłoszeń.`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `Ten pokój czatu służy do wszystkiego, co dotyczy <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `Ten czat służy do faktur między <strong>${invoicePayer}</strong> a <strong>${invoiceReceiver}</strong>. Użyj przycisku +, aby wysłać fakturę.`,
        beginningOfChatHistory: 'Ta rozmowa jest z',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `Tutaj <strong>${submitterDisplayName}</strong> będzie przesyłać wydatki do <strong>${workspaceName}</strong>. Wystarczy użyć przycisku +.`,
        beginningOfChatHistorySelfDM: 'To jest Twoja osobista przestrzeń. Używaj jej do notatek, zadań, szkiców i przypomnień.',
        beginningOfChatHistorySystemDM: 'Witamy! Ustawmy wszystko dla Ciebie.',
        chatWithAccountManager: 'Czat z Twoim opiekunem konta tutaj',
        sayHello: 'Przywitaj się!',
        yourSpace: 'Twoja przestrzeń',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Witamy w ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Użyj przycisku +, aby ${additionalText} wydatek.`,
        askConcierge: 'Zadawaj pytania i otrzymuj całodobowe wsparcie w czasie rzeczywistym.',
        conciergeSupport: 'Wsparcie 24/7',
        create: 'Utwórz',
        iouTypes: {
            pay: 'Zapłać',
            split: 'Podziel',
            submit: 'prześlij',
            track: 'Śledzić',
            invoice: 'Faktura',
        },
    },
    adminOnlyCanPost: 'Tylko administratorzy mogą wysyłać wiadomości w tym pokoju.',
    reportAction: {
        asCopilot: 'jako kopilot dla',
    },
    mentionSuggestions: {
        hereAlternateText: 'Powiadom wszystkich w tej rozmowie',
    },
    newMessages: 'Nowe wiadomości',
    latestMessages: 'Najnowsze wiadomości',
    youHaveBeenBanned: 'Uwaga: Zostałeś zablokowany w tym kanale czatu.',
    reportTypingIndicator: {
        isTyping: 'pisze...',
        areTyping: 'piszą...',
        multipleMembers: 'Wielu członków',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Ten czat został zarchiwizowany.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Ten czat nie jest już aktywny, ponieważ ${displayName} zamknął swoje konto.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${oldDisplayName} połączył swoje konto z ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Ten czat nie jest już aktywny, ponieważ <strong>nie jesteś</strong> już członkiem przestrzeni roboczej ${policyName}.`
                : `Ta rozmowa nie jest już aktywna, ponieważ ${displayName} nie jest już członkiem przestrzeni roboczej ${policyName}.`,
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
        fabNewChatExplained: 'Rozpocznij czat (akcja pływająca)',
        fabScanReceiptExplained: 'Zeskanuj paragon (Działanie pływające)',
        chatPinned: 'Czat przypięty',
        draftedMessage: 'Wiadomość robocza',
        listOfChatMessages: 'Lista wiadomości czatu',
        listOfChats: 'Lista czatów',
        saveTheWorld: 'Ocal świat',
        tooltip: 'Zacznij tutaj!',
        redirectToExpensifyClassicModal: {
            title: 'Wkrótce dostępne',
            description: 'Doprecyzowujemy jeszcze kilka elementów Nowego Expensify, aby dostosować je do Twojej konkretnej konfiguracji. W międzyczasie przejdź do Expensify Classic.',
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
        manual: 'Ręczny',
        scan: 'Skanuj',
        map: 'Mapa',
    },
    spreadsheet: {
        upload: 'Prześlij arkusz kalkulacyjny',
        import: 'Zaimportuj arkusz kalkulacyjny',
        dragAndDrop: '<muted-link>Przeciągnij i upuść tutaj swój arkusz kalkulacyjny lub wybierz plik poniżej. Obsługiwane formaty: .csv, .txt, .xls i .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Przeciągnij i upuść swój arkusz kalkulacyjny tutaj lub wybierz plik poniżej. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Dowiedz się więcej</a> o obsługiwanych formatach plików.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Wybierz plik arkusza kalkulacyjnego do zaimportowania. Obsługiwane formaty: .csv, .txt, .xls i .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Wybierz plik arkusza kalkulacyjnego do zaimportowania. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Dowiedz się więcej</a> o obsługiwanych formatach plików.</muted-link>`,
        fileContainsHeader: 'Plik zawiera nagłówki kolumn',
        column: ({name}: SpreadSheetColumnParams) => `Kolumna ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Ups! Wymagane pole („${fieldName}”) nie zostało zmapowane. Sprawdź ustawienia i spróbuj ponownie.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `Ups! Przypisałeś jedno pole („${fieldName}”) do wielu kolumn. Sprawdź ustawienia i spróbuj ponownie.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Ups! Pole („${fieldName}”) zawiera jedną lub więcej pustych wartości. Sprawdź je i spróbuj ponownie.`,
        importSuccessfulTitle: 'Import zakończony powodzeniem',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `Dodano ${categories} kategorii.` : 'Dodano 1 kategorię.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Nie dodano ani nie zaktualizowano żadnych członków.';
            }
            if (added && updated) {
                return `${added} członek${added > 1 ? 's' : ''} dodany, ${updated} członek${updated > 1 ? 's' : ''} zaktualizowany.`;
            }
            if (updated) {
                return updated > 1 ? `Zaktualizowano ${updated} członków.` : 'Zaktualizowano 1 członka.';
            }
            return added > 1 ? `Dodano ${added} członków.` : 'Dodano 1 członka.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `Dodano tagi: ${tags}.` : 'Dodano 1 tag.'),
        importMultiLevelTagsSuccessfulDescription: 'Dodano tagi wielopoziomowe.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `Dodano stawki diet w wysokości ${rates}.` : 'Dodano 1 stawkę diety.',
        importFailedTitle: 'Import nieudany',
        importFailedDescription: 'Upewnij się, że wszystkie pola zostały poprawnie wypełnione i spróbuj ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z Concierge.',
        importDescription: 'Wybierz pola do zmapowania z arkusza kalkulacyjnego, klikając menu rozwijane obok każdej zaimportowanej kolumny poniżej.',
        sizeNotMet: 'Rozmiar pliku musi być większy niż 0 bajtów',
        invalidFileMessage:
            'Przesłany plik jest pusty lub zawiera nieprawidłowe dane. Upewnij się, że plik ma poprawny format i zawiera wszystkie wymagane informacje, a następnie prześlij go ponownie.',
        importSpreadsheetLibraryError: 'Nie udało się załadować modułu arkusza kalkulacyjnego. Sprawdź połączenie z internetem i spróbuj ponownie.',
        importSpreadsheet: 'Zaimportuj arkusz kalkulacyjny',
        downloadCSV: 'Pobierz CSV',
        importMemberConfirmation: () => ({
            one: `Potwierdź poniższe szczegóły nowego członka przestrzeni roboczej, który zostanie dodany w ramach tego przesyłania. Istniejący członkowie nie otrzymają żadnych aktualizacji ról ani wiadomości z zaproszeniami.`,
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
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Prześlij paragony na <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Dodaj swój numer</a>, aby wysyłać paragony SMS-em na ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Wyślij zdjęcia paragonów SMS-em na ${phoneNumber} (tylko numery w USA)</label-text>`,
        takePhoto: 'Zrób zdjęcie',
        cameraAccess: 'Aby robić zdjęcia paragonów, wymagany jest dostęp do aparatu.',
        deniedCameraAccess: `Dostęp do aparatu nadal nie został przyznany, postępuj zgodnie z <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">tymi instrukcjami</a>.`,
        cameraErrorTitle: 'Błąd aparatu',
        cameraErrorMessage: 'Wystąpił błąd podczas robienia zdjęcia. Spróbuj ponownie.',
        locationAccessTitle: 'Zezwól na dostęp do lokalizacji',
        locationAccessMessage: 'Dostęp do lokalizacji pomaga nam utrzymywać poprawną strefę czasową i walutę, gdziekolwiek jesteś.',
        locationErrorTitle: 'Zezwól na dostęp do lokalizacji',
        locationErrorMessage: 'Dostęp do lokalizacji pomaga nam utrzymywać poprawną strefę czasową i walutę, gdziekolwiek jesteś.',
        allowLocationFromSetting: `Dostęp do lokalizacji pomaga nam utrzymać poprawną strefę czasową i walutę, gdziekolwiek jesteś. Zezwól proszę na dostęp do lokalizacji w ustawieniach uprawnień swojego urządzenia.`,
        dropTitle: 'Odpuść',
        dropMessage: 'Upuść tutaj swój plik',
        flash: 'błysk',
        multiScan: 'wielokrotne skanowanie',
        shutter: 'migawka',
        gallery: 'Galeria',
        deleteReceipt: 'Usuń paragon',
        deleteConfirmation: 'Czy na pewno chcesz usunąć ten paragon?',
        addReceipt: 'Dodaj paragon',
        scanFailed: 'Nie można zeskanować paragonu, ponieważ brakuje na nim sprzedawcy, daty lub kwoty.',
    },
    quickAction: {
        scanReceipt: 'Skanuj paragon',
        recordDistance: 'Śledź dystans',
        requestMoney: 'Utwórz wydatek',
        perDiem: 'Utwórz dietę',
        splitBill: 'Podziel wydatek',
        splitScan: 'Podziel paragon',
        splitDistance: 'Podziel dystans',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zapłać ${name ?? 'ktoś'}`,
        assignTask: 'Przydziel zadanie',
        header: 'Szybkie działanie',
        noLongerHaveReportAccess: 'Nie masz już dostępu do poprzedniego szybkiego działania. Wybierz nowe poniżej.',
        updateDestination: 'Zaktualizuj miejsce docelowe',
        createReport: 'Utwórz raport',
    },
    iou: {
        amount: 'Kwota',
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
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} od ${merchant}`,
        addSplit: 'Dodaj podział',
        makeSplitsEven: 'Podziel równo',
        editSplits: 'Edytuj podziały',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Kwota całkowita jest o ${amount} wyższa niż pierwotny wydatek.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Kwota całkowita jest o ${amount} mniejsza niż pierwotny wydatek.`,
        splitExpenseZeroAmount: 'Wprowadź prawidłową kwotę przed kontynuowaniem.',
        splitExpenseOneMoreSplit: 'Nie dodano żadnych podziałów. Dodaj co najmniej jeden, aby zapisać.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Edytuj ${amount} dla ${merchant}`,
        removeSplit: 'Usuń podział',
        splitExpenseCannotBeEditedModalTitle: 'Ten wydatek nie może zostać edytowany',
        splitExpenseCannotBeEditedModalDescription: 'Zatwierdzone lub opłacone wydatki nie mogą być edytowane',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zapłać ${name ?? 'ktoś'}`,
        expense: 'Wydatek',
        categorize: 'Skategoryzuj',
        share: 'Udostępnij',
        participants: 'Uczestnicy',
        createExpense: 'Utwórz wydatek',
        trackDistance: 'Śledź dystans',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Utwórz ${expensesNumber} wydatki`,
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
        viewDetails: 'Wyświetl szczegóły',
        pending: 'Oczekujące',
        canceled: 'Anulowano',
        posted: 'Opublikowano',
        deleteReceipt: 'Usuń paragon',
        findExpense: 'Znajdź wydatek',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `usunął wydatek (${amount} dla ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `przeniósł wydatek${reportName ? `z ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `przeniesiono ten wydatek${reportName ? `do <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `przeniósł ten wydatek${reportName ? `z <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedUnreportedTransaction: ({reportUrl}: MovedTransactionParams) => `przeniósł ten wydatek z twojej <a href="${reportUrl}">przestrzeni osobistej</a>`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `przeniósł ten wydatek do Twojej <a href="${reportUrl}">przestrzeni osobistej</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `przeniósł ten raport do przestrzeni roboczej <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `przeniósł ten <a href="${movedReportUrl}">raport</a> do przestrzeni roboczej <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Oczekujące dopasowanie paragonu z transakcją kartą',
        pendingMatch: 'Oczekujące dopasowanie',
        pendingMatchWithCreditCardDescription: 'Oczekuje na dopasowanie do transakcji z karty. Oznacz jako gotówkę, aby anulować.',
        markAsCash: 'Oznacz jako gotówkę',
        routePending: 'Trasowanie w toku...',
        receiptScanning: () => ({
            one: 'Skanowanie paragonu...',
            other: 'Skanowanie paragonów...',
        }),
        scanMultipleReceipts: 'Skanuj wiele paragonów',
        scanMultipleReceiptsDescription: 'Zrób zdjęcia wszystkich paragonów naraz, a następnie samodzielnie potwierdź szczegóły lub pozwól nam zrobić to za Ciebie.',
        receiptScanInProgress: 'Trwa skanowanie paragonu',
        receiptScanInProgressDescription: 'Skanowanie rachunku w toku. Sprawdź ponownie później lub wprowadź dane teraz.',
        removeFromReport: 'Usuń z raportu',
        moveToPersonalSpace: 'Przenieś wydatki do swojej przestrzeni osobistej',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Potencjalne zduplikowane wydatki wykryte. Przejrzyj duplikaty, aby włączyć przesyłanie.'
                : 'Wykryto potencjalnie zduplikowane wydatki. Przejrzyj duplikaty, aby umożliwić zatwierdzenie.',
        receiptIssuesFound: () => ({
            one: 'Znaleziono problem',
            other: 'Znalezione problemy',
        }),
        fieldPending: 'Oczekujące...',
        defaultRate: 'Domyślna stawka',
        receiptMissingDetails: 'Brakujące dane na paragonie',
        missingAmount: 'Brakująca kwota',
        missingMerchant: 'Brak sprzedawcy',
        receiptStatusTitle: 'Skanowanie…',
        receiptStatusText: 'Tylko Ty widzisz ten paragon podczas skanowania. Wróć tu później lub wprowadź szczegóły teraz.',
        receiptScanningFailed: 'Skanowanie paragonu nie powiodło się. Wprowadź dane ręcznie.',
        transactionPendingDescription: 'Transakcja w toku. Jej zaksięgowanie może zająć kilka dni.',
        companyInfo: 'Informacje o firmie',
        companyInfoDescription: 'Potrzebujemy jeszcze kilku informacji, zanim będziesz mógł wysłać swoją pierwszą fakturę.',
        yourCompanyName: 'Nazwa Twojej firmy',
        yourCompanyWebsite: 'Strona internetowa Twojej firmy',
        yourCompanyWebsiteNote: 'Jeśli nie masz strony internetowej, możesz zamiast tego podać firmowy profil na LinkedIn lub w mediach społecznościowych.',
        invalidDomainError: 'Wprowadzono nieprawidłową domenę. Aby kontynuować, wprowadź prawidłową domenę.',
        publicDomainError: 'Wprowadziłeś publiczną domenę. Aby kontynuować, wprowadź prywatną domenę.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} skanowanie`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} w oczekiwaniu`);
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
        settledExpensify: 'Zapłacone',
        done: 'Gotowe',
        settledElsewhere: 'Opłacone gdzie indziej',
        individual: 'Indywidualny',
        business: 'Firma',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} z Expensify` : `Zapłać z Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako osoba prywatna` : `Zapłać z konta osobistego`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} z portfela` : `Zapłać portfelem`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Zapłać ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako firma` : `Zapłać z konta firmowego`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Oznacz ${formattedAmount} jako zapłacone` : `Oznacz jako opłacone`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `zapłacono ${amount} z konta osobistego ${last4Digits}` : `Opłacone z konta osobistego`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `zapłacono ${amount} z firmowego konta ${last4Digits}` : `Opłacono z konta firmowego`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Zapłać ${formattedAmount} przez ${policyName}` : `Zapłać przez ${policyName}`),
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `zapłacono ${amount} z konta bankowego ${last4Digits}` : `zapłacono z konta bankowego ${last4Digits}`,
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `zapłacono ${amount ? `${amount} ` : ''} z konta bankowego ${last4Digits} za pomocą <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">reguł przestrzeni roboczej</a>`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `Konto osobiste • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `Konto firmowe • ${lastFour}`,
        nextStep: 'Następne kroki',
        finished: 'Zakończono',
        flip: 'Przełącz',
        sendInvoice: ({amount}: RequestAmountParams) => `Wyślij fakturę na kwotę ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `przesłano${memo ? `, mówiąc ${memo}` : ''}`,
        automaticallySubmitted: `wysłane za pośrednictwem <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">opóźnij wysyłanie</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `śledzenie ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `podziel ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `podziel ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Twój podział ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} jest winien ${amount}${comment ? `dla ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} jest winien:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}zapłacił(a) ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} zapłacił:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} wydał ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} wydał:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} zatwierdził(a):`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} zatwierdził(a) ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `zapłacono ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `zapłacono ${amount}. Dodaj konto bankowe, aby otrzymać swoją płatność.`,
        automaticallyApproved: `zatwierdzone przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `zatwierdzono ${amount}`,
        approvedMessage: `zatwierdzono`,
        unapproved: `Niezatwierdzone`,
        automaticallyForwarded: `zatwierdzone przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        forwarded: `zatwierdzono`,
        rejectedThisReport: 'odrzucił ten raport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `rozpoczął(-ęła) płatność, ale czeka, aż ${submitterDisplayName} doda konto bankowe.`,
        adminCanceledRequest: 'anulował płatność',
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `anulował(-a) płatność ${amount}, ponieważ ${submitterDisplayName} nie włączył(-a) swojego portfela Expensify w ciągu 30 dni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} dodał konto bankowe. Płatność w wysokości ${amount} została dokonana.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}oznaczono jako opłacone`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}zapłacono portfelem`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}zapłacono za pomocą Expensify poprzez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady miejsca pracy</a>`,
        noReimbursableExpenses: 'Ten raport ma nieprawidłową kwotę',
        pendingConversionMessage: 'Suma zostanie zaktualizowana, gdy znów będziesz online',
        changedTheExpense: 'zmienił wydatek',
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
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} wysłano${comment ? `dla ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `przeniesiono wydatek z przestrzeni osobistej do ${workspaceName ?? `czat z ${reportName}`}`,
        movedToPersonalSpace: 'przeniósł wydatek do przestrzeni osobistej',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => {
            const article = policyTagListName && StringUtils.startsWithVowel(policyTagListName) ? 'jakiś' : 'a';
            const tag = policyTagListName ?? 'tag';
            return `Wybierz ${article} ${tag}, aby lepiej zorganizować swoje wydatki.`;
        },
        categorySelection: 'Wybierz kategorię, aby lepiej uporządkować swoje wydatki.',
        error: {
            invalidCategoryLength: 'Nazwa kategorii przekracza 255 znaków. Skróć ją lub wybierz inną kategorię.',
            invalidTagLength: 'Nazwa tagu przekracza 255 znaków. Skróć ją lub wybierz inny tag.',
            invalidAmount: 'Wprowadź poprawną kwotę przed kontynuowaniem',
            invalidDistance: 'Wprowadź prawidłową odległość przed kontynuowaniem',
            invalidIntegerAmount: 'Przed kontynuowaniem wprowadź kwotę w pełnych dolarach',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maksymalna kwota podatku to ${amount}`,
            invalidSplit: 'Suma podziałów musi być równa całkowitej kwocie',
            invalidSplitParticipants: 'Wprowadź kwotę większą niż zero dla co najmniej dwóch uczestników',
            invalidSplitYourself: 'Wprowadź kwotę różną od zera dla swojego podziału',
            noParticipantSelected: 'Wybierz uczestnika',
            other: 'Nieoczekiwany błąd. Spróbuj ponownie później.',
            genericCreateFailureMessage: 'Nieoczekiwany błąd podczas przesyłania tego wydatku. Spróbuj ponownie później.',
            genericCreateInvoiceFailureMessage: 'Niespodziewany błąd podczas wysyłania tej faktury. Spróbuj ponownie później.',
            genericHoldExpenseFailureMessage: 'Nieoczekiwany błąd podczas wstrzymywania tego wydatku. Spróbuj ponownie później.',
            genericUnholdExpenseFailureMessage: 'Wystąpił nieoczekiwany błąd podczas zdejmowania tego wydatku z wstrzymania. Spróbuj ponownie później.',
            receiptDeleteFailureError: 'Nieoczekiwany błąd podczas usuwania tego paragonu. Spróbuj ponownie później.',
            receiptFailureMessage: '<rbr>Wystąpił błąd podczas przesyłania paragonu. Proszę <a href="download">zapisz paragon</a> i <a href="retry">spróbuj ponownie</a> później.</rbr>',
            receiptFailureMessageShort: 'Wystąpił błąd podczas przesyłania Twojego paragonu.',
            genericDeleteFailureMessage: 'Nieoczekiwany błąd podczas usuwania tego wydatku. Spróbuj ponownie później.',
            genericEditFailureMessage: 'Nieoczekiwany błąd podczas edytowania tego wydatku. Spróbuj ponownie później.',
            genericSmartscanFailureMessage: 'W transakcji brakuje pól',
            duplicateWaypointsErrorMessage: 'Usuń zduplikowane punkty pośrednie',
            atLeastTwoDifferentWaypoints: 'Wprowadź co najmniej dwa różne adresy',
            splitExpenseMultipleParticipantsErrorMessage: 'Wydatek nie może zostać podzielony między przestrzeń roboczą a innych członków. Zaktualizuj swój wybór.',
            invalidMerchant: 'Wprowadź prawidłowego sprzedawcę',
            atLeastOneAttendee: 'Należy wybrać co najmniej jednego uczestnika',
            invalidQuantity: 'Wprowadź prawidłową ilość',
            quantityGreaterThanZero: 'Ilość musi być większa niż zero',
            invalidSubrateLength: 'Musi istnieć co najmniej jedna podstawowa stawka',
            invalidRate: 'Stawka jest nieprawidłowa dla tego obszaru roboczego. Wybierz dostępną stawkę z obszaru roboczego.',
        },
        dismissReceiptError: 'Odrzuć błąd',
        dismissReceiptErrorConfirmation: 'Uwaga! Odrzucenie tego błędu spowoduje całkowite usunięcie przesłanego paragonu. Czy na pewno chcesz kontynuować?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `rozpoczęto rozliczanie. Płatność jest wstrzymana, dopóki ${submitterDisplayName} nie włączy swojego portfela.`,
        enableWallet: 'Włącz portfel',
        hold: 'Wstrzymane',
        unhold: 'Usuń wstrzymanie',
        holdExpense: () => ({
            one: 'Wstrzymaj wydatek',
            other: 'Wstrzymane wydatki',
        }),
        unholdExpense: 'Odblokuj wydatek',
        heldExpense: 'wstrzymał ten wydatek',
        unheldExpense: 'usunął blokadę tego wydatku',
        moveUnreportedExpense: 'Przenieś nierozliczony wydatek',
        addUnreportedExpense: 'Dodaj nierozliczony wydatek',
        selectUnreportedExpense: 'Wybierz co najmniej jeden wydatek, aby dodać go do raportu.',
        emptyStateUnreportedExpenseTitle: 'Brak niezgłoszonych wydatków',
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
            `Ten raport został już wyeksportowany do ${connectionName}. Zmiana może prowadzić do rozbieżności w danych. Czy na pewno chcesz ponownie otworzyć ten raport?`,
        reason: 'Powód',
        holdReasonRequired: 'Przy wstrzymaniu wymagane jest podanie powodu.',
        expenseWasPutOnHold: 'Wydatek został wstrzymany',
        expenseOnHold: 'Ten wydatek został wstrzymany. Zapoznaj się z komentarzami, aby poznać kolejne kroki.',
        expensesOnHold: 'Wszystkie wydatki zostały wstrzymane. Sprawdź komentarze, aby poznać kolejne kroki.',
        expenseDuplicate: 'Ten wydatek ma podobne szczegóły do innego. Przejrzyj duplikaty, aby kontynuować.',
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
        approveOnly: 'Tylko zatwierdzanie',
        holdEducationalTitle: 'Czy powinieneś wstrzymać ten wydatek?',
        whatIsHoldExplain: 'Wstrzymanie wydatku działa jak naciśnięcie „pauzy” na wydatek, dopóki nie będziesz gotowy, aby go przesłać.',
        holdIsLeftBehind: 'Wstrzymane wydatki pozostają bez zmian, nawet jeśli złożysz cały raport.',
        unholdWhenReady: 'Zdejmij wstrzymanie wydatków, gdy będziesz gotowy je złożyć.',
        changePolicyEducational: {
            title: 'Przeniosłeś ten raport!',
            description: 'Sprawdź ponownie te elementy, które zwykle zmieniają się przy przenoszeniu raportów do nowego obszaru roboczego.',
            reCategorize: '<strong>Przeklasyfikuj wszelkie wydatki</strong>, aby były zgodne z zasadami przestrzeni roboczej.',
            workflows: 'Ten raport może teraz podlegać innemu <strong>procesowi zatwierdzania.</strong>',
        },
        changeWorkspace: 'Zmień przestrzeń roboczą',
        set: 'ustaw',
        changed: 'Zmieniono',
        removed: 'Usunięto',
        transactionPending: 'Transakcja oczekuje.',
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
        bookingArchivedDescription: 'Ta rezerwacja jest zarchiwizowana, ponieważ data podróży już minęła. W razie potrzeby dodaj wydatek na ostateczną kwotę.',
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
            approveExpenseTitle: 'Zatwierdzaj inne wydatki, podczas gdy wstrzymane wydatki pozostaną przypisane do Ciebie.',
            heldExpenseLeftBehindTitle: 'Wstrzymane wydatki są pomijane, gdy zatwierdzasz cały raport.',
            rejectExpenseTitle: 'Odrzuć wydatek, którego nie zamierzasz zatwierdzić ani opłacić.',
            reasonPageTitle: 'Odrzuć wydatek',
            reasonPageDescription: 'Wyjaśnij, dlaczego odrzucasz ten wydatek.',
            rejectReason: 'Powód odrzucenia',
            markAsResolved: 'Oznacz jako rozwiązane',
            rejectedStatus: 'Ten wydatek został odrzucony. Czekamy, aż naprawisz problemy i oznaczysz go jako rozwiązany, aby umożliwić wysłanie.',
            reportActions: {
                rejectedExpense: 'odrzucił ten wydatek',
                markedAsResolved: 'oznaczył(a) powód odrzucenia jako rozwiązany',
            },
        },
        moveExpenses: () => ({one: 'Przenieś wydatek', other: 'Przenieś wydatki'}),
        changeApprover: {
            title: 'Zmień zatwierdzającego',
            subtitle: 'Wybierz opcję, aby zmienić osobę zatwierdzającą ten raport.',
            description: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Możesz także na stałe zmienić osobę zatwierdzającą dla wszystkich raportów w swoich <a href="${workflowSettingLink}">ustawieniach przepływu pracy</a>.`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `zmieniono zatwierdzającego na <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Dodaj zatwierdzającego',
                addApproverSubtitle: 'Dodaj dodatkowego akceptującego do istniejącego procesu zatwierdzania.',
                bypassApprovers: 'Pomiń zatwierdzających',
                bypassApproversSubtitle: 'Przypisz siebie jako ostatecznego akceptującego i pomiń pozostałych akceptujących.',
            },
            addApprover: {
                subtitle: 'Wybierz dodatkowego zatwierdzającego dla tego raportu, zanim przekażemy go dalej w pozostałym procesie zatwierdzania.',
            },
        },
        chooseWorkspace: 'Wybierz przestrzeń roboczą',
    },
    transactionMerge: {
        listPage: {
            header: 'Połącz wydatki',
            noEligibleExpenseFound: 'Nie znaleziono kwalifikujących się wydatków',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Nie masz żadnych wydatków, które można połączyć z tym. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Dowiedz się więcej</a> o kwalifikujących się wydatkach.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Wybierz <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">kwalifikujący się wydatek</a>, aby scalić z <strong>${reportName}</strong>.`,
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
                const article = StringUtils.startsWithVowel(field) ? 'jakiś' : 'a';
                return `Wybierz ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Wybierz uczestników',
            selectAllDetailsError: 'Zaznacz wszystkie szczegóły przed kontynuowaniem.',
        },
        confirmationPage: {
            header: 'Potwierdź szczegóły',
            pageTitle: 'Potwierdź, które dane zachowujesz. Dane, których nie zachowasz, zostaną usunięte.',
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
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Ukryte',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Numer nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny SMS-em.',
        emailHasNotBeenValidated: 'Adres e-mail nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny w wiadomości SMS.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Prześlij zdjęcie',
        removePhoto: 'Usuń zdjęcie',
        editImage: 'Edytuj zdjęcie',
        viewPhoto: 'Wyświetl zdjęcie',
        imageUploadFailed: 'Przesyłanie obrazu nie powiodło się',
        deleteWorkspaceError: 'Przepraszamy, wystąpił nieoczekiwany problem podczas usuwania awatara Twojego przestrzeni roboczej',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Wybrany obraz przekracza maksymalny dozwolony rozmiar przesyłania ${maxUploadSizeInMB} MB.`,
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
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Nie są wymagane żadne dalsze działania!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>ty</strong> dodasz konto bankowe.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> doda konto bankowe.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na dodanie konta bankowego przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `w dniu ${eta}` : ` ${eta}`;
                }
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Twoje</strong> wydatki zostaną automatycznie złożone${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie na automatyczne przesłanie wydatków użytkownika <strong>${actor}</strong>${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na automatyczne złożenie wydatków administratora${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Czekamy, aż <strong>Ty</strong> naprawisz problem(y).`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie na poprawienie problemu(-ów) przez <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na rozwiązanie problemu(-ów) przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
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
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> wyeksportujesz ten raport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie, aż <strong>${actor}</strong> wyeksportuje ten raport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Oczekiwanie na wyeksportowanie tego raportu przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Oczekiwanie, aż <strong>Ty</strong> opłacisz wydatki.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Oczekiwanie na <strong>${actor}</strong> w celu opłacenia wydatków.`;
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
                        return `Oczekiwanie na zakończenie konfiguracji firmowego konta bankowego przez administratora.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `do ${eta}` : ` ${eta}`;
                }
                return `Oczekiwanie na zakończenie płatności${formattedETA}.`;
            },
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
        selfSelectYourPronoun: 'Samodzielnie wybierz swój zaimek',
        emailAddress: 'Adres e-mail',
        setMyTimezoneAutomatically: 'Ustaw mój czas lokalny automatycznie',
        timezone: 'Strefa czasowa',
        invalidFileMessage: 'Nieprawidłowy plik. Spróbuj użyć innego obrazu.',
        avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Spróbuj ponownie.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronizowanie',
        profileAvatar: 'Avatar profilu',
        publicSection: {
            title: 'Publiczne',
            subtitle: 'Te informacje są wyświetlane na Twoim publicznym profilu. Każdy może je zobaczyć.',
        },
        privateSection: {
            title: 'Prywatne',
            subtitle: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane w Twoim publicznym profilu.',
        },
    },
    securityPage: {
        title: 'Opcje bezpieczeństwa',
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
        featureRequiresValidate: 'Ta funkcja wymaga zweryfikowania Twojego konta.',
        validateAccount: 'Zweryfikuj swoje konto',
        helpText: ({email}: {email: string}) =>
            `Dodaj więcej sposobów logowania i wysyłania paragonów do Expensify.<br/><br/>Dodaj adres e-mail, aby przekazywać paragony na adres <a href="mailto:${email}">${email}</a>, lub dodaj numer telefonu, aby wysyłać paragony SMS-em na numer 47777 (tylko numery z USA).`,
        pleaseVerify: 'Zweryfikuj tę metodę kontaktu.',
        getInTouch: 'Użyjemy tej metody, aby się z Tobą skontaktować.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Wprowadź magiczny kod wysłany na ${contactMethod}. Powinien dotrzeć w ciągu jednej lub dwóch minut.`,
        setAsDefault: 'Ustaw jako domyślne',
        yourDefaultContactMethod: 'To jest Twoja domyślna metoda kontaktu. Zanim będziesz mógł ją usunąć, musisz wybrać inną metodę kontaktu i kliknąć „Ustaw jako domyślną”.',
        removeContactMethod: 'Usuń metodę kontaktu',
        removeAreYouSure: 'Czy na pewno chcesz usunąć tę metodę kontaktu? Tej akcji nie można cofnąć.',
        failedNewContact: 'Nie udało się dodać tej metody kontaktu.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Nie udało się wysłać nowego magicznego kodu. Proszę chwilę poczekać i spróbować ponownie.',
            validateSecondaryLogin: 'Nieprawidłowy lub niepoprawny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
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
    // cspell:disable
    pronouns: {
        coCos: 'Co / Coś',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'On / Jego / Jemu',
        heHimHisTheyThemTheirs: 'On / Jego / Jego / Oni / Ich / Ich',
        sheHerHers: 'Ona / Jej / Jej',
        sheHerHersTheyThemTheirs: 'Ona / Ją / Jej / Oni / Ich / Ich',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Os / Osób',
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
        isShownOnProfile: 'Twoja wyświetlana nazwa jest widoczna na Twoim profilu.',
    },
    timezonePage: {
        timezone: 'Strefa czasowa',
        isShownOnProfile: 'Twoja strefa czasowa jest wyświetlana w Twoim profilu.',
        getLocationAutomatically: 'Automatycznie określaj Twoją lokalizację',
    },
    updateRequiredView: {
        updateRequired: 'Wymagana aktualizacja',
        pleaseInstall: 'Zaktualizuj proszę do najnowszej wersji New Expensify',
        pleaseInstallExpensifyClassic: 'Zainstaluj najnowszą wersję Expensify',
        toGetLatestChanges: 'Na urządzeniu mobilnym lub komputerze pobierz i zainstaluj najnowszą wersję. W przypadku wersji webowej odśwież przeglądarkę.',
        newAppNotAvailable: 'Nowa aplikacja Expensify nie jest już dostępna.',
    },
    initialSettingsPage: {
        about: 'Informacje',
        aboutPage: {
            description: 'Nowa aplikacja Expensify jest tworzona przez społeczność programistów open source z całego świata. Pomóż nam budować przyszłość Expensify.',
            appDownloadLinks: 'Linki do pobrania aplikacji',
            viewKeyboardShortcuts: 'Zobacz skróty klawiaturowe',
            viewTheCode: 'Wyświetl kod',
            viewOpenJobs: 'Zobacz otwarte oferty pracy',
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
            description:
                '<muted-text>Użyj poniższych narzędzi, aby pomóc rozwiązać problemy z korzystaniem z Expensify. Jeśli napotkasz jakiekolwiek problemy, prosimy <concierge-link>zgłosić błąd</concierge-link>.</muted-text>',
            confirmResetDescription: 'Wszystkie niewysłane szkice wiadomości zostaną utracone, ale reszta Twoich danych jest bezpieczna.',
            resetAndRefresh: 'Resetuj i odśwież',
            clientSideLogging: 'Rejestrowanie po stronie klienta',
            noLogsToShare: 'Brak dzienników do udostępnienia',
            useProfiling: 'Użyj profilowania',
            profileTrace: 'Ślad profilowania',
            results: 'Wyniki',
            releaseOptions: 'Opcje wydania',
            testingPreferences: 'Preferencje testowe',
            useStagingServer: 'Użyj serwera staging',
            forceOffline: 'Wymuś tryb offline',
            simulatePoorConnection: 'Symuluj słabe połączenie internetowe',
            simulateFailingNetworkRequests: 'Symuluj nieudane żądania sieciowe',
            authenticationStatus: 'Status uwierzytelniania',
            deviceCredentials: 'Dane uwierzytelniające urządzenia',
            invalidate: 'Unieważnij',
            destroy: 'Usuń',
            maskExportOnyxStateData: 'Maskuj wrażliwe dane członków podczas eksportowania stanu Onyx',
            exportOnyxState: 'Eksportuj stan Onyx',
            importOnyxState: 'Zaimportuj stan Onyx',
            testCrash: 'Testuj awarię',
            resetToOriginalState: 'Przywróć do stanu początkowego',
            usingImportedState: 'Używasz zaimportowanego stanu. Naciśnij tutaj, aby go wyczyścić.',
            debugMode: 'Tryb debugowania',
            invalidFile: 'Nieprawidłowy plik',
            invalidFileDescription: 'Plik, który próbujesz zaimportować, jest nieprawidłowy. Spróbuj ponownie.',
            invalidateWithDelay: 'Unieważnij z opóźnieniem',
            recordTroubleshootData: 'Rejestruj dane diagnostyczne',
            softKillTheApp: 'Miękko zakończ działanie aplikacji',
            kill: 'Zabij',
        },
        debugConsole: {
            saveLog: 'Zapisz dziennik',
            shareLog: 'Udostępnij log',
            enterCommand: 'Wpisz polecenie',
            execute: 'Wykonaj',
            noLogsAvailable: 'Brak dostępnych logów',
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
        reasonForLeavingPrompt: 'Nie chcielibyśmy, żebyś odchodził! Czy mógłbyś powiedzieć nam dlaczego, abyśmy mogli się poprawić?',
        enterMessageHere: 'Wpisz wiadomość tutaj',
        closeAccountWarning: 'Zamknięcie Twojego konta jest nieodwracalne.',
        closeAccountPermanentlyDeleteData: 'Czy na pewno chcesz usunąć swoje konto? Spowoduje to trwałe usunięcie wszystkich zaległych wydatków.',
        enterDefaultContactToConfirm: 'Wprowadź swoją domyślną metodę kontaktu, aby potwierdzić, że chcesz zamknąć konto. Twoja domyślna metoda kontaktu to:',
        enterDefaultContact: 'Wprowadź domyślną metodę kontaktu',
        defaultContact: 'Domyślna metoda kontaktu:',
        enterYourDefaultContactMethod: 'Wprowadź domyślną metodę kontaktu, aby zamknąć swoje konto.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Połącz konta',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Wprowadź konto, które chcesz połączyć z <strong>${login}</strong>.`,
            notReversibleConsent: 'Rozumiem, że jest to nieodwracalne',
        },
        accountValidate: {
            confirmMerge: 'Czy na pewno chcesz połączyć konta?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Scalenie Twoich kont jest nieodwracalne i spowoduje utratę wszystkich niewysłanych wydatków dla <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Aby kontynuować, wprowadź magiczny kod wysłany na <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Nieprawidłowy lub niepoprawny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
                fallback: 'Coś poszło nie tak. Spróbuj ponownie później.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konta połączone!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Pomyślnie połączono wszystkie dane z <strong>${from}</strong> do <strong>${to}</strong>. Od teraz możesz używać dowolnego logowania do tego konta.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Pracujemy nad tym',
            limitedSupport: 'Nie obsługujemy jeszcze łączenia kont w Nowym Expensify. Wykonaj tę akcję w Expensify Classic.',
            reachOutForHelp: '<muted-text><centered-text>Jeśli masz jakiekolwiek pytania, śmiało <concierge-link>skontaktuj się z Concierge</concierge-link>!</centered-text></muted-text>',
            goToExpensifyClassic: 'Przejdź do Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić <strong>${email}</strong>, ponieważ jest kontrolowany przez <strong>${email.split('@').at(1) ?? ''}</strong>. Proszę <concierge-link>skontaktuj się z Concierge</concierge-link>, aby uzyskać pomoc.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić konta <strong>${email}</strong> z innymi kontami, ponieważ administrator Twojej domeny ustawił je jako Twój główny login. Zamiast tego scal inne konta z tym kontem.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Nie możesz połączyć kont, ponieważ dla <strong>${email}</strong> włączone jest uwierzytelnianie dwuskładnikowe (2FA). Wyłącz 2FA dla <strong>${email}</strong> i spróbuj ponownie.</centered-text></muted-text>`,
            learnMore: 'Dowiedz się więcej o łączeniu kont.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie można scalić <strong>${email}</strong>, ponieważ jest zablokowany. Proszę <concierge-link>skontaktować się z Concierge</concierge-link>, aby uzyskać pomoc.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Nie możesz scalić kont, ponieważ <strong>${email}</strong> nie ma konta w Expensify. Zamiast tego <a href="${contactMethodLink}">dodaj go jako metodę kontaktu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz scalić konta <strong>${email}</strong> z innymi kontami. Zamiast tego scal inne konta z nim.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Nie możesz połączyć kont w <strong>${email}</strong>, ponieważ to konto jest właścicielem rozliczonej relacji rozliczeniowej.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Spróbuj ponownie później',
            description: 'Było zbyt wiele prób połączenia kont. Spróbuj ponownie później.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Nie można scalić z innymi kontami, ponieważ konto nie jest zweryfikowane. Zweryfikuj konto i spróbuj ponownie.',
        },
        mergeFailureSelfMerge: {
            description: 'Nie można scalić konta z nim samym.',
        },
        mergeFailureGenericHeading: 'Nie można połączyć kont',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Zgłoś podejrzaną aktywność',
        lockAccount: 'Zablokuj konto',
        unlockAccount: 'Odblokuj konto',
        compromisedDescription:
            'Zauważyłeś coś nieprawidłowego na swoim koncie? Zgłoszenie tego natychmiast zablokuje Twoje konto, wstrzyma nowe transakcje kartą Expensify i uniemożliwi wprowadzanie jakichkolwiek zmian na koncie.',
        domainAdminsDescription: 'Dla administratorów domen: Spowoduje to również wstrzymanie całej aktywności kart Expensify oraz działań administracyjnych we wszystkich Twoich domenach.',
        areYouSure: 'Czy na pewno chcesz zablokować swoje konto Expensify?',
        onceLocked: 'Po zablokowaniu Twoje konto będzie ograniczone do czasu złożenia prośby o odblokowanie i przeprowadzenia kontroli bezpieczeństwa',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Nie udało się zablokować konta',
        failedToLockAccountDescription: `Nie mogliśmy zablokować Twojego konta. Porozmawiaj z Concierge, aby rozwiązać ten problem.`,
        chatWithConcierge: 'Czat z Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto zablokowane',
        yourAccountIsLocked: 'Twoje konto jest zablokowane',
        chatToConciergeToUnlock: 'Porozmawiaj z Concierge, aby rozwiązać problemy z bezpieczeństwem i odblokować swoje konto.',
        chatWithConcierge: 'Czat z Concierge',
    },
    passwordPage: {
        changePassword: 'Zmień hasło',
        changingYourPasswordPrompt: 'Zmiana hasła zaktualizuje je zarówno dla Twojego konta na Expensify.com, jak i konta w New Expensify.',
        currentPassword: 'Obecne hasło',
        newPassword: 'Nowe hasło',
        newPasswordPrompt: 'Twoje nowe hasło musi różnić się od starego i zawierać co najmniej 8 znaków, 1 wielką literę, 1 małą literę oraz 1 cyfrę.',
    },
    twoFactorAuth: {
        headerTitle: 'Uwierzytelnianie dwuskładnikowe',
        twoFactorAuthEnabled: 'Uwierzytelnianie dwuskładnikowe włączone',
        whatIsTwoFactorAuth:
            'Uwierzytelnianie dwuskładnikowe (2FA) pomaga chronić Twoje konto. Podczas logowania musisz wprowadzić kod wygenerowany przez wybraną przez Ciebie aplikację uwierzytelniającą.',
        disableTwoFactorAuth: 'Wyłącz uwierzytelnianie dwuskładnikowe',
        explainProcessToRemove: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod z aplikacji uwierzytelniającej.',
        explainProcessToRemoveWithRecovery: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod odzyskiwania.',
        disabled: 'Uwierzytelnianie dwuskładnikowe zostało teraz wyłączone',
        noAuthenticatorApp: 'Nie będziesz już potrzebować aplikacji uwierzytelniającej, aby logować się do Expensify.',
        stepCodes: 'Kody odzyskiwania',
        keepCodesSafe: 'Zachowaj te kody odzyskiwania w bezpiecznym miejscu!',
        codesLoseAccess: dedent(`
            Jeśli utracisz dostęp do aplikacji uwierzytelniającej i nie będziesz mieć tych kodów, utracisz dostęp do swojego konta.

            Uwaga: Włączenie uwierzytelniania dwuskładnikowego wyloguje Cię ze wszystkich innych aktywnych sesji.
        `),
        errorStepCodes: 'Skopiuj lub pobierz kody przed kontynuowaniem',
        stepVerify: 'Zweryfikuj',
        scanCode: 'Zeskanuj kod QR za pomocą swojego',
        authenticatorApp: 'aplikacja uwierzytelniająca',
        addKey: 'Lub dodaj ten tajny klucz do swojej aplikacji uwierzytelniającej:',
        enterCode: 'Następnie wprowadź sześciocyfrowy kod wygenerowany przez swoją aplikację uwierzytelniającą.',
        stepSuccess: 'Zakończono',
        enabled: 'Uwierzytelnianie dwuskładnikowe włączone',
        congrats: 'Gratulacje! Masz teraz dodatkowe zabezpieczenie.',
        copy: 'Kopiuj',
        disable: 'Wyłącz',
        enableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe',
        pleaseEnableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe.',
        twoFactorAuthIsRequiredDescription: 'Ze względów bezpieczeństwa Xero wymaga uwierzytelniania dwuskładnikowego, aby połączyć integrację.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Wymagane uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredForAdminsTitle: 'Włącz dwuskładnikowe uwierzytelnianie',
        twoFactorAuthIsRequiredXero: 'Twoetapowe uwierzytelnianie jest wymagane dla Twojego połączenia księgowego z Xero. Aby dalej korzystać z Expensify, włącz je.',
        twoFactorAuthIsRequiredCompany: 'Twoja firma wymaga używania uwierzytelniania dwuskładnikowego. Aby dalej korzystać z Expensify, włącz je.',
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
        personalNoteMessage: 'Prowadź notatki dotyczące tej rozmowy tutaj. Tylko Ty możesz je dodawać, edytować lub wyświetlać.',
        sharedNoteMessage: 'Zapisuj notatki na temat tej rozmowy tutaj. Pracownicy Expensify i inni członkowie z domeną team.expensify.com mogą wyświetlać te notatki.',
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
        paymentCurrencyDescription: 'Wybierz standardową walutę, na którą powinny być przeliczane wszystkie wydatki osobiste',
        note: `Uwaga: Zmiana waluty płatności może wpłynąć na to, ile zapłacisz za Expensify. Szczegółowe informacje znajdziesz na naszej <a href="${CONST.PRICING}">stronie z cennikiem</a>.`,
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
        addPaymentMethod: 'Dodaj metodę płatności, aby wysyłać i otrzymywać płatności bezpośrednio w aplikacji.',
        getPaidBackFaster: 'Otrzymuj zwroty pieniędzy szybciej',
        secureAccessToYourMoney: 'Zapewnij bezpieczny dostęp do swoich pieniędzy',
        receiveMoney: 'Otrzymuj pieniądze w swojej lokalnej walucie',
        expensifyWallet: 'Portfel Expensify (beta)',
        sendAndReceiveMoney: 'Wysyłaj i odbieraj pieniądze ze znajomymi. Tylko konta bankowe w USA.',
        enableWallet: 'Włącz portfel',
        addBankAccountToSendAndReceive: 'Dodaj konto bankowe, aby dokonywać lub otrzymywać płatności.',
        addDebitOrCreditCard: 'Dodaj kartę debetową lub kredytową',
        assignedCards: 'Przypisane karty',
        assignedCardsDescription: 'To są karty przypisane przez administratora przestrzeni roboczej do zarządzania wydatkami firmy.',
        expensifyCard: 'Karta Expensify',
        walletActivationPending: 'Przeglądamy Twoje informacje. Sprawdź ponownie za kilka minut!',
        walletActivationFailed: 'Niestety, w tym momencie Twojego portfela nie można włączyć. Skontaktuj się z Concierge, aby uzyskać dalszą pomoc.',
        addYourBankAccount: 'Dodaj swoje konto bankowe',
        addBankAccountBody: 'Połączmy Twoje konto bankowe z Expensify, aby wysyłanie i otrzymywanie płatności bezpośrednio w aplikacji było łatwiejsze niż kiedykolwiek.',
        chooseYourBankAccount: 'Wybierz swoje konto bankowe',
        chooseAccountBody: 'Upewnij się, że wybierasz właściwą.',
        confirmYourBankAccount: 'Potwierdź swoje konto bankowe',
        personalBankAccounts: 'Osobiste konta bankowe',
        businessBankAccounts: 'Firmowe konta bankowe',
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
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Możesz wydać do ${formattedLimit} przy użyciu tej karty, a następnie zostanie ona dezaktywowana.`,
        },
        monthlyLimit: {
            name: 'Miesięczny limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Możesz wydać do ${formattedLimit} miesięcznie przy użyciu tej karty. Limit zostanie zresetowany 1. dnia każdego miesiąca kalendarzowego.`,
        },
        virtualCardNumber: 'Numer wirtualnej karty',
        travelCardCvv: 'CVV karty podróżnej',
        physicalCardNumber: 'Numer fizycznej karty',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Zamów fizyczną kartę',
        reportFraud: 'Zgłoś oszustwo związane z kartą wirtualną',
        reportTravelFraud: 'Zgłoś oszustwo związane z kartą podróżną',
        reviewTransaction: 'Przejrzyj transakcję',
        suspiciousBannerTitle: 'Podejrzana transakcja',
        suspiciousBannerDescription: 'Zauważyliśmy podejrzane transakcje na Twojej karcie. Stuknij poniżej, aby je przejrzeć.',
        cardLocked: 'Twoja karta jest tymczasowo zablokowana, podczas gdy nasz zespół sprawdza konto Twojej firmy.',
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
        validateCardTitle: 'Upewnijmy się, że to Ty',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Wprowadź kod weryfikacyjny wysłany na ${contactMethod}, aby wyświetlić szczegóły swojej karty. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Proszę <a href="${missingDetailsLink}">dodaj swoje dane osobowe</a>, a następnie spróbuj ponownie.`,
        unexpectedError: 'Wystąpił błąd podczas pobierania szczegółów Twojej karty Expensify. Spróbuj ponownie.',
        cardFraudAlert: {
            confirmButtonText: 'Tak, zgadzam się',
            reportFraudButtonText: 'Nie, to nie ja',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `usunił podejrzaną aktywność i ponownie aktywował kartę x${cardLastFour}. Wszystko gotowe, by dalej rozliczać wydatki!`,
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
    },
    workflowsPage: {
        workflowTitle: 'Wydatki',
        workflowDescription: 'Skonfiguruj proces pracy od momentu poniesienia wydatku, obejmujący zatwierdzanie i płatność.',
        submissionFrequency: 'Częstotliwość składania',
        submissionFrequencyDescription: 'Wybierz niestandardowy harmonogram wysyłania wydatków.',
        submissionFrequencyDateOfMonth: 'Data miesiąca',
        disableApprovalPromptDescription: 'Wyłączenie zatwierdzania spowoduje usunięcie wszystkich istniejących procesów zatwierdzania.',
        addApprovalsTitle: 'Dodaj zatwierdzenia',
        addApprovalButton: 'Dodaj proces zatwierdzania',
        addApprovalTip: 'Ten domyślny proces pracy ma zastosowanie do wszystkich członków, chyba że istnieje bardziej specyficzny proces pracy.',
        approver: 'Aprobujący',
        addApprovalsDescription: 'Wymagaj dodatkowej akceptacji przed autoryzacją płatności.',
        makeOrTrackPaymentsTitle: 'Dokonaj lub śledź płatności',
        makeOrTrackPaymentsDescription: 'Dodaj upoważnionego płatnika dla płatności dokonanych w Expensify lub śledź płatności dokonane gdzie indziej.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>W tej przestrzeni roboczej jest włączony niestandardowy proces zatwierdzania. Aby przejrzeć lub zmienić ten proces, skontaktuj się ze swoim <account-manager-link>Opiekunem klienta</account-manager-link> lub z <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>W tym obszarze roboczym jest włączony niestandardowy proces zatwierdzania. Aby przejrzeć lub zmienić ten proces, skontaktuj się z <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wybierz, jak długo Expensify ma czekać przed udostępnieniem wydatków bez błędów.',
        },
        frequencyDescription: 'Wybierz, jak często wydatki mają być wysyłane automatycznie, lub ustaw tryb ręczny',
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
                one: 'ul.',
                two: '.',
                few: 'ul.',
                other: 'th',
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
        approverInMultipleWorkflows: 'Ten członek należy już do innego procesu zatwierdzania. Wszelkie zmiany wprowadzone tutaj zostaną odzwierciedlone także tam.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> już zatwierdza raporty dla <strong>${name2}</strong>. Wybierz innego akceptującego, aby uniknąć cyklicznego przepływu pracy.`,
        emptyContent: {
            title: 'Brak członków do wyświetlenia',
            expensesFromSubtitle: 'Wszyscy członkowie tego workspace’u należą już do istniejącego procesu zatwierdzania.',
            approverSubtitle: 'Wszyscy zatwierdzający należą do istniejącego przepływu pracy.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Częstotliwość składania nie mogła zostać zmieniona. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        monthlyOffsetErrorMessage: 'Nie udało się zmienić częstotliwości miesięcznej. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Potwierdź',
        header: 'Dodaj więcej akceptujących i potwierdź.',
        additionalApprover: 'Dodatkowy zatwierdzający',
        submitButton: 'Dodaj przepływ pracy',
    },
    workflowsEditApprovalsPage: {
        title: 'Edytuj proces zatwierdzania',
        deleteTitle: 'Usuń proces zatwierdzania',
        deletePrompt: 'Czy na pewno chcesz usunąć ten proces akceptacji? Wszyscy członkowie będą następnie korzystać z domyślnego procesu.',
    },
    workflowsExpensesFromPage: {
        title: 'Wydatki z',
        header: 'Gdy następujący członkowie przesyłają wydatki:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Nie udało się zmienić akceptującego. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        header: 'Wyślij do tego członka do zatwierdzenia:',
    },
    workflowsPayerPage: {
        title: 'Upoważniony płatnik',
        genericErrorMessage: 'Nie można było zmienić uprawnionego płatnika. Spróbuj ponownie.',
        admins: 'Administratorzy',
        payer: 'Płatnik',
        paymentAccount: 'Konto płatnicze',
    },
    reportFraudPage: {
        title: 'Zgłoś oszustwo związane z kartą wirtualną',
        description: 'Jeśli dane Twojej wirtualnej karty zostały skradzione lub naruszone, trwale dezaktywujemy Twoją obecną kartę i wydamy Ci nową wirtualną kartę oraz numer.',
        deactivateCard: 'Dezaktywuj kartę',
        reportVirtualCardFraud: 'Zgłoś oszustwo związane z kartą wirtualną',
    },
    reportFraudConfirmationPage: {
        title: 'Zgłoszono oszustwo kartą',
        description: 'Trwale dezaktywowaliśmy Twoją obecną kartę. Gdy wrócisz, aby wyświetlić szczegóły karty, będzie na Ciebie czekała nowa wirtualna karta.',
        buttonText: 'Jasne, dziękuję!',
    },
    activateCardPage: {
        activateCard: 'Aktywuj kartę',
        pleaseEnterLastFour: 'Proszę wprowadzić ostatnie cztery cyfry swojej karty.',
        activatePhysicalCard: 'Aktywuj fizyczną kartę',
        error: {
            thatDidNotMatch: 'To nie zgadza się z ostatnimi 4 cyframi Twojej karty. Spróbuj ponownie.',
            throttled:
                'Zbyt wiele razy niepoprawnie wprowadzono ostatnie 4 cyfry Twojej karty Expensify. Jeśli jesteś pewien, że liczby są poprawne, skontaktuj się z Concierge, aby rozwiązać problem. W przeciwnym razie spróbuj ponownie później.',
        },
    },
    getPhysicalCard: {
        header: 'Zamów fizyczną kartę',
        nameMessage: 'Wpisz swoje imię i nazwisko, ponieważ będzie ono widoczne na Twojej karcie.',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        legalFirstName: 'Imię zgodne z dokumentem tożsamości',
        legalLastName: 'Prawne nazwisko',
        phoneMessage: 'Wprowadź swój numer telefonu.',
        phoneNumber: 'Numer telefonu',
        address: 'Adres',
        addressMessage: 'Wprowadź swój adres wysyłki.',
        streetAddress: 'Adres uliczny',
        city: 'Miasto',
        state: 'Stan',
        zipPostcode: 'Kod pocztowy',
        country: 'Kraj',
        confirmMessage: 'Proszę potwierdzić swoje dane poniżej.',
        estimatedDeliveryMessage: 'Twoja fizyczna karta dotrze w ciągu 2–3 dni roboczych.',
        next: 'Dalej',
        getPhysicalCard: 'Zamów fizyczną kartę',
        shipCard: 'Wyślij kartę',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Przelew${amount ? ` ${amount}` : ''}`,
        instant: 'Natychmiastowe (karta debetowa)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `Opłata ${rate}% (minimum ${minAmount})`,
        ach: '1–3 dni robocze (konto bankowe)',
        achSummary: 'Bez opłaty',
        whichAccount: 'Które konto?',
        fee: 'Opłata',
        transferSuccess: 'Przelew zakończony powodzeniem!',
        transferDetailBankAccount: 'Twoje pieniądze powinny dotrzeć w ciągu 1–3 dni roboczych.',
        transferDetailDebitCard: 'Twoje pieniądze powinny dotrzeć natychmiast.',
        failedTransfer: 'Twoje saldo nie jest w pełni rozliczone. Proszę przelać środki na konto bankowe.',
        notHereSubTitle: 'Proszę przelać swój saldo ze strony portfela',
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
        addFirstPaymentMethod: 'Dodaj metodę płatności, aby wysyłać i otrzymywać płatności bezpośrednio w aplikacji.',
        defaultPaymentMethod: 'Domyślne',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `Konto bankowe • ${lastFour}`,
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
        explainerText: 'Wybierz, czy #skupiać się tylko na nieprzeczytanych i przypiętych czatach, czy wyświetlać wszystko, z najnowszymi i przypiętymi czatami na górze.',
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
        generatingPDF: 'Generowanie pliku PDF...',
        waitForPDF: 'Proszę czekać, trwa generowanie pliku PDF',
        errorPDF: 'Wystąpił błąd podczas próby wygenerowania Twojego pliku PDF',
    },
    reportDescriptionPage: {
        roomDescription: 'Opis pokoju',
        roomDescriptionOptional: 'Opis pokoju (opcjonalnie)',
        explainerText: 'Ustaw niestandardowy opis dla pokoju.',
    },
    groupChat: {
        lastMemberTitle: 'Uwaga!',
        lastMemberWarning: 'Ponieważ jesteś ostatnią osobą w tym czacie, wyjście spowoduje, że czat stanie się niedostępny dla wszystkich członków. Czy na pewno chcesz opuścić czat?',
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
        license: `<muted-text-xs>Przekazy pieniężne są realizowane przez ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) na podstawie jego <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licencji</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Nie otrzymałeś(-aś) kodu magicznego?',
        enterAuthenticatorCode: 'Wprowadź swój kod uwierzytelniający',
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
        forgot: 'Nie pamiętasz?',
        requiredWhen2FAEnabled: 'Wymagane, gdy włączone jest 2FA',
        error: {
            incorrectPassword: 'Nieprawidłowe hasło. Spróbuj ponownie.',
            incorrectLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie.',
            incorrect2fa: 'Nieprawidłowy kod uwierzytelniania dwuskładnikowego. Spróbuj ponownie.',
            twoFactorAuthenticationEnabled: 'Masz włączone uwierzytelnianie dwuskładnikowe (2FA) na tym koncie. Zaloguj się, używając swojego adresu e‑mail lub numeru telefonu.',
            invalidLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie lub zresetuj hasło.',
            unableToResetPassword:
                'Nie udało nam się zmienić Twojego hasła. Prawdopodobnie jest to spowodowane wygasłym linkiem do resetowania hasła w starym e-mailu resetującym hasło. Wysłaliśmy Ci nowy link, abyś mógł spróbować ponownie. Sprawdź swoją skrzynkę odbiorczą oraz folder Spam; wiadomość powinna dotrzeć w ciągu kilku minut.',
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
        welcomeSignOffTitleManageTeam: 'Gdy ukończysz powyższe zadania, będziemy mogli poznać więcej funkcji, takich jak procesy akceptacji i reguły!',
        welcomeSignOffTitle: 'Miło cię poznać!',
        explanationModal: {
            title: 'Witamy w Expensify',
            description: 'Jedna aplikacja do obsługi wydatków firmowych i osobistych w tempie czatu. Wypróbuj ją i daj nam znać, co o niej sądzisz. To dopiero początek!',
            secondaryDescription: 'Aby wrócić do Expensify Classic, po prostu stuknij swoje zdjęcie profilowe > Przejdź do Expensify Classic.',
        },
        getStarted: 'Rozpocznij',
        whatsYourName: 'Jak masz na imię?',
        peopleYouMayKnow: 'Osoby, które możesz znać, są już tutaj! Zweryfikuj swój adres e-mail, aby do nich dołączyć.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Ktoś z ${domain} utworzył już przestrzeń roboczą. Wprowadź magiczny kod wysłany na adres ${email}.`,
        joinAWorkspace: 'Dołącz do przestrzeni roboczej',
        listOfWorkspaces: 'Oto lista przestrzeni roboczych, do których możesz dołączyć. Nie martw się, zawsze możesz dołączyć do nich później, jeśli wolisz.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} członek${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Gdzie pracujesz?',
        errorSelection: 'Wybierz opcję, aby przejść dalej',
        purpose: {
            title: 'Co chcesz dzisiaj zrobić?',
            errorContinue: 'Naciśnij „Kontynuuj”, aby przejść do konfiguracji',
            errorBackButton: 'Dokończ pytania konfiguracyjne, aby rozpocząć korzystanie z aplikacji',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Otrzymuję zwrot kosztów od mojego pracodawcy',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Zarządzaj wydatkami mojego zespołu',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Śledź i planuj wydatki',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Czat i dzielenie wydatków ze znajomymi',
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
            title: 'Jaki jest Twój służbowy e‑mail?',
            subtitle: 'Expensify działa najlepiej, gdy podłączysz służbowy adres e‑mail.',
            explanationModal: {
                descriptionOne: 'Przekaż na adres receipts@expensify.com do zeskanowania',
                descriptionTwo: 'Dołącz do swoich współpracowników, którzy już korzystają z Expensify',
                descriptionThree: 'Ciesz się bardziej spersonalizowanym doświadczeniem',
            },
            addWorkEmail: 'Dodaj służbowy e‑mail',
        },
        workEmailValidation: {
            title: 'Zweryfikuj służbowy adres e‑mail',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Wprowadź magiczny kod wysłany na adres ${workEmail}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        },
        workEmailValidationError: {
            publicEmail: 'Proszę wprowadzić poprawny służbowy adres e‑mail z prywatnej domeny, np. mitch@company.com',
            offline: 'Nie mogliśmy dodać Twojego służbowego adresu e-mail, ponieważ wydaje się, że jesteś offline',
        },
        mergeBlockScreen: {
            title: 'Nie udało się dodać służbowego adresu e-mail',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nie udało się dodać adresu ${workEmail}. Spróbuj ponownie później w Ustawieniach lub porozmawiaj z Concierge, aby uzyskać wskazówki.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Weź [jazdę próbną](${testDriveURL})`,
                description: ({testDriveURL}) =>
                    `[Weź udział w krótkim oprowadzaniu po produkcie](${testDriveURL}), aby zobaczyć, dlaczego Expensify jest najszybszym sposobem rozliczania wydatków.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Weź [jazdę próbną](${testDriveURL})`,
                description: ({testDriveURL}) => `Przetestuj nas podczas [jazdy próbnej](${testDriveURL}) i zapewnij swojemu zespołowi *3 darmowe miesiące Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Dodaj zatwierdzanie wydatków',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Dodaj zatwierdzanie wydatków*, aby przeglądać wydatki swojego zespołu i utrzymywać je pod kontrolą.

                        Oto jak:

                        1. Przejdź do *Workspaces*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *More features*.
                        4. Włącz *Workflows*.
                        5. Przejdź do *Workflows* w edytorze przestrzeni roboczej.
                        6. Włącz *Add approvals*.
                        7. Zostaniesz ustawiony jako osoba zatwierdzająca wydatki. Po zaproszeniu zespołu możesz zmienić tę rolę na dowolnego administratora.

                        [Przejdź do more features](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Utwórz](${workspaceConfirmationLink}) przestrzeń roboczą`,
                description: 'Utwórz przestrzeń roboczą i skonfiguruj ustawienia z pomocą swojego specjalisty ds. konfiguracji!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Utwórz [przestrzeń roboczą](${workspaceSettingsLink})`,
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
                        *Skonfiguruj kategorie*, aby Twój zespół mógł oznaczać wydatki dla łatwego raportowania.

                        1. Kliknij *Workspaces*.
                        3. Wybierz swoją przestrzeń roboczą.
                        4. Kliknij *Categories*.
                        5. Wyłącz kategorie, których nie potrzebujesz.
                        6. Dodaj własne kategorie w prawym górnym rogu.

                        [Przejdź do ustawień kategorii przestrzeni roboczej](${workspaceCategoriesLink}).

                        ![Skonfiguruj kategorie](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Zgłoś wydatek',
                description: dedent(`
                    *Zgłoś wydatek*, wprowadzając kwotę lub skanując paragon.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz wydatek*.
                    3. Wprowadź kwotę lub zeskanuj paragon.
                    4. Dodaj adres e-mail lub numer telefonu swojego szefa.
                    5. Kliknij *Utwórz*.

                    I gotowe!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Zgłoś wydatek',
                description: dedent(`
                    *Zgłoś wydatek*, wprowadzając kwotę lub skanując paragon.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz wydatek*.
                    3. Wprowadź kwotę lub zeskanuj paragon.
                    4. Potwierdź szczegóły.
                    5. Kliknij *Utwórz*.

                    I gotowe!
                `),
            },
            trackExpenseTask: {
                title: 'Śledź wydatek',
                description: dedent(`
                    *Śledź wydatek* w dowolnej walucie, niezależnie od tego, czy masz rachunek, czy nie.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Utwórz wydatek*.
                    3. Wprowadź kwotę lub zeskanuj rachunek.
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
                        Połącz ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'twój' : 'do'} ${integrationName}, aby automatycznie księgować i synchronizować wydatki, co znacznie ułatwia zamknięcie miesiąca.

                        1. Kliknij *Workspaces*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Accounting*.
                        4. Znajdź ${integrationName}.
                        5. Kliknij *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[Przejdź do księgowości](${workspaceAccountingLink}).

                                      ![Połącz z ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[Przejdź do księgowości](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Połącz [swoje karty firmowe](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Podłącz karty, które już masz, aby automatycznie importować transakcje, dopasowywać paragony i przeprowadzać uzgadnianie.

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

                        1. Kliknij *Workspaces*.
                        3. Wybierz swoją przestrzeń roboczą.
                        4. Kliknij *Members* > *Invite member*.
                        5. Wprowadź adresy e-mail lub numery telefonów.
                        6. Dodaj własną treść zaproszenia, jeśli chcesz!

                        [Przejdź do członków przestrzeni roboczej](${workspaceMembersLink}).

                        ![Zaproś swój zespół](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Skonfiguruj [kategorie](${workspaceCategoriesLink}) i [tagi](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Skonfiguruj kategorie i tagi*, aby Twój zespół mógł kodować wydatki dla łatwego raportowania.

                        Zaimportuj je automatycznie, [łącząc swoje oprogramowanie księgowe](${workspaceAccountingLink}), lub skonfiguruj je ręcznie w [ustawieniach przestrzeni roboczej](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Skonfiguruj [tagi](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Używaj tagów, aby dodać dodatkowe szczegóły wydatku, takie jak projekty, klienci, lokalizacje i działy. Jeśli potrzebujesz wielu poziomów tagów, możesz uaktualnić do planu Control.

                        1. Kliknij *Workspaces*.
                        3. Wybierz swój workspace.
                        4. Kliknij *More features*.
                        5. Włącz *Tags*.
                        6. Przejdź do *Tags* w edytorze workspace’a.
                        7. Kliknij *+ Add tag*, aby utworzyć własne.

                        [Przejdź do więcej funkcji](${workspaceMoreFeaturesLink}).

                        ![Skonfiguruj tagi](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Zaproś swojego [księgowego](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Zaproś swojego księgowego*, aby współpracował w Twojej przestrzeni roboczej i zarządzał wydatkami firmowymi.

                        1. Kliknij *Przestrzenie robocze*.
                        2. Wybierz swoją przestrzeń roboczą.
                        3. Kliknij *Członkowie*.
                        4. Kliknij *Zaproś członka*.
                        5. Wprowadź adres e‑mail swojego księgowego.

                        [Zaproś swojego księgowego teraz](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Rozpocznij czat',
                description: dedent(`
                    *Rozpocznij czat* z dowolną osobą, używając jej adresu e-mail lub numeru telefonu.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Rozpocznij czat*.
                    3. Wpisz adres e-mail lub numer telefonu.

                    Jeśli dana osoba nie korzysta jeszcze z Expensify, zostanie automatycznie zaproszona.

                    Każdy czat zostanie również wysłany jako e-mail lub SMS, na który można odpowiedzieć bezpośrednio.
                `),
            },
            splitExpenseTask: {
                title: 'Podziel wydatek',
                description: dedent(`
                    *Podziel wydatki* z jedną lub wieloma osobami.

                    1. Kliknij przycisk ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wybierz *Rozpocznij czat*.
                    3. Wprowadź adresy e-mail lub numery telefonów.
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
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Weź [jazdę próbną](${testDriveURL})` : 'Wypróbuj wersję demonstracyjną'),
            embeddedDemoIframeTitle: 'Jazda próbna',
            employeeFakeReceipt: {
                description: 'Mój paragon z jazdy próbnej!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Otrzymywanie zwrotów jest tak proste, jak wysłanie wiadomości. Omówmy podstawy.',
            onboardingPersonalSpendMessage: 'Oto jak w kilku kliknięciach śledzić swoje wydatki.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Twój bezpłatny okres próbny właśnie się rozpoczął! Skonfigurujmy wszystko.

                        👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Utworzyłem już przestrzeń roboczą, aby pomóc Ci zarządzać paragonami i wydatkami Twojego zespołu. Aby jak najlepiej wykorzystać 30-dniowy bezpłatny okres próbny, wykonaj pozostałe kroki konfiguracji poniżej!
                    `)
                    : dedent(`
                        # Twój darmowy okres próbny właśnie się rozpoczął! Skonfigurujmy wszystko.

                        👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Skoro utworzyłeś(-aś) już obszar roboczy, wykorzystaj w pełni swój 30-dniowy darmowy okres próbny, wykonując poniższe kroki!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Skonfigurujmy wszystko\n\n👋 Cześć, jestem Twoim specjalistą ds. konfiguracji Expensify. Utworzyłem już przestrzeń roboczą, aby pomóc Ci zarządzać paragonami i wydatkami. Aby jak najlepiej wykorzystać swój 30-dniowy bezpłatny okres próbny, po prostu wykonaj pozostałe kroki konfiguracji poniżej!',
            onboardingChatSplitMessage: 'Dzielenie rachunków ze znajomymi jest tak proste jak wysłanie wiadomości. Oto jak to działa.',
            onboardingAdminMessage: 'Dowiedz się, jak jako administrator zarządzać przestrzenią roboczą swojego zespołu i przesyłać własne wydatki.',
            onboardingLookingAroundMessage:
                'Expensify jest najlepiej znane z obsługi wydatków, podróży i kart służbowych, ale robimy znacznie więcej. Daj znać, czym jesteś zainteresowany, a pomogę Ci zacząć.',
            onboardingTestDriveReceiverMessage: 'Masz 3 miesiące za darmo! Zacznij poniżej.',
        },
        workspace: {
            title: 'Zachowaj porządek dzięki przestrzeni roboczej',
            subtitle: 'Odblokuj zaawansowane narzędzia, które upraszczają zarządzanie wydatkami – wszystko w jednym miejscu. Dzięki przestrzeni roboczej możesz:',
            explanationModal: {
                descriptionOne: 'Śledź i porządkuj paragony',
                descriptionTwo: 'Kategoryzuj i oznaczaj wydatki',
                descriptionThree: 'Twórz i udostępniaj raporty',
            },
            price: 'Wypróbuj za darmo przez 30 dni, a następnie przejdź na wyższy plan za jedyne <strong>5 USD/użytkownika/miesiąc</strong>.',
            createWorkspace: 'Utwórz przestrzeń roboczą',
        },
        confirmWorkspace: {
            title: 'Potwierdź przestrzeń roboczą',
            subtitle: 'Utwórz przestrzeń roboczą, aby śledzić paragony, rozliczać wydatki, zarządzać podróżami, tworzyć raporty i nie tylko — wszystko z prędkością rozmowy.',
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
            containsReservedWord: 'Nazwa nie może zawierać słów Expensify ani Concierge',
            hasInvalidCharacter: 'Nazwa nie może zawierać przecinka ani średnika',
            requiredFirstName: 'Imię nie może być puste',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Jakie jest Twoje imię i nazwisko zgodne z dokumentami?',
        enterDateOfBirth: 'Jaka jest twoja data urodzenia?',
        enterAddress: 'Jaki jest Twój adres?',
        enterPhoneNumber: 'Jaki jest Twój numer telefonu?',
        personalDetails: 'Dane osobowe',
        privateDataMessage: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane w Twoim publicznym profilu.',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        legalFirstName: 'Imię zgodne z dokumentem tożsamości',
        legalLastName: 'Prawne nazwisko',
        address: 'Adres',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `Data powinna być wcześniejsza niż ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Data powinna być późniejsza niż ${dateString}`,
            hasInvalidCharacter: 'Imię może zawierać wyłącznie znaki łacińskie',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Nieprawidłowy format kodu pocztowego${zipFormat ? `Akceptowalny format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Upewnij się, że numer telefonu jest prawidłowy (np. ${CONST.EXAMPLE_PHONE_NUMBER})`,
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
        successfullyUnlinkedLogin: 'Dodatkowy login został pomyślnie odłączony!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Nasz dostawca poczty e-mail tymczasowo wstrzymał wysyłanie wiadomości na adres ${login} z powodu problemów z dostarczaniem. Aby odblokować swój login, wykonaj następujące kroki:`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>Potwierdź, że ${login} jest poprawnie wpisany i jest prawdziwym, działającym adresem e‑mail.</strong> Alias e‑mail, taki jak „expenses@domain.com”, aby był prawidłowym loginem do Expensify, musi mieć dostęp do własnej skrzynki odbiorczej.`,
        ensureYourEmailClient: `<strong>Upewnij się, że Twój klient e‑mail akceptuje wiadomości z domeny expensify.com.</strong> Instrukcje, jak wykonać ten krok, znajdziesz <a href="${CONST.SET_NOTIFICATION_LINK}">tutaj</a>, ale możesz potrzebować pomocy działu IT przy konfiguracji ustawień poczty e‑mail.`,
        onceTheAbove: `Po wykonaniu powyższych kroków skontaktuj się z <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, aby odblokować swoje logowanie.`,
    },
    openAppFailureModal: {
        title: 'Coś poszło nie tak...',
        subtitle: `Nie udało nam się załadować wszystkich Twoich danych. Zostaliśmy o tym powiadomieni i sprawdzamy problem. Jeśli będzie się to powtarzać, skontaktuj się z`,
        refreshAndTryAgain: 'Odśwież i spróbuj ponownie',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nie mogliśmy dostarczyć wiadomości SMS na ${login}, więc tymczasowo go zawiesiliśmy. Spróbuj zweryfikować swój numer:`,
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
                return 'Proszę chwilę poczekać przed ponowną próbą.';
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
            return `Proszę zaczekać! Musisz odczekać ${timeText}, zanim ponownie spróbujesz zweryfikować swój numer.`;
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
        prompt: ({priorityModePageUrl}: FocusModeUpdateParams) =>
            `Bądź na bieżąco, wyświetlając tylko nieprzeczytane czaty lub czaty wymagające Twojej uwagi. Nie martw się, możesz to zmienić w dowolnym momencie w <a href="${priorityModePageUrl}">ustawieniach</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Nie można znaleźć czatu, którego szukasz.',
        getMeOutOfHere: 'Wyprowadź mnie stąd',
        iouReportNotFound: 'Nie można znaleźć szczegółów płatności, których szukasz.',
        notHere: 'Hmm... nie ma tego tutaj',
        pageNotFound: 'Ups, nie można znaleźć tej strony',
        noAccess: 'Ten czat lub wydatek mógł zostać usunięty albo nie masz do niego dostępu.\n\nW razie pytań skontaktuj się z concierge@expensify.com',
        goBackHome: 'Wróć do strony głównej',
        commentYouLookingForCannotBeFound: 'Komentarz, którego szukasz, nie został znaleziony.',
        goToChatInstead: 'Zamiast tego przejdź do czatu.',
        contactConcierge: 'W razie pytań prosimy o kontakt na concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups... ${isBreakLine ? '\n' : ''}Coś poszło nie tak`,
        subtitle: 'Twoje żądanie nie mogło zostać zrealizowane. Spróbuj ponownie później.',
        wrongTypeSubtitle: 'To wyszukiwanie jest nieprawidłowe. Spróbuj dostosować kryteria wyszukiwania.',
    },
    setPasswordPage: {
        enterPassword: 'Wprowadź hasło',
        setPassword: 'Ustaw hasło',
        newPasswordPrompt: 'Twoje hasło musi zawierać co najmniej 8 znaków, 1 wielką literę, 1 małą literę i 1 cyfrę.',
        passwordFormTitle: 'Witamy ponownie w nowym Expensify! Ustaw swoje hasło.',
        passwordNotSet: 'Nie udało się ustawić Twojego nowego hasła. Wysłaliśmy Ci nowy link do ustawienia hasła, aby spróbować ponownie.',
        setPasswordLinkInvalid: 'Ten link do ustawienia hasła jest nieprawidłowy lub wygasł. Nowy czeka już w Twojej skrzynce e-mail!',
        validateAccount: 'Zweryfikuj konto',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Dodaj emoji, aby ułatwić współpracownikom i znajomym zorientowanie się, co się dzieje. Opcjonalnie możesz dodać też wiadomość!',
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
        vacationDelegate: 'Zastępca na czas urlopu',
        setVacationDelegate: `Ustaw delegata na czas urlopu, aby zatwierdzał raporty w Twoim imieniu, gdy jesteś poza biurem.`,
        vacationDelegateError: 'Wystąpił błąd podczas aktualizowania Twojego zastępcy urlopowego.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `jako delegat urlopowy ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `do ${submittedToName} jako zastępca urlopowy dla ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Przypisujesz ${nameOrEmail} jako swojego zastępcę na czas urlopu. Ta osoba nie jest jeszcze we wszystkich Twoich przestrzeniach roboczych. Jeśli zdecydujesz się kontynuować, do wszystkich administratorów Twoich przestrzeni roboczych zostanie wysłany e-mail z prośbą o ich dodanie.`,
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
        desktopConnection: 'Uwaga: Aby połączyć się z Chase, Wells Fargo, Capital One lub Bank of America, kliknij tutaj, aby dokończyć ten proces w przeglądarce.',
        yourDataIsSecure: 'Twoje dane są bezpieczne',
        toGetStarted: 'Dodaj konto bankowe, aby zwracać wydatki, wydawać karty Expensify, przyjmować płatności za faktury i opłacać rachunki – wszystko w jednym miejscu.',
        plaidBodyCopy: 'Daj swoim pracownikom łatwiejszy sposób płacenia – i otrzymywania zwrotu – za wydatki firmowe.',
        checkHelpLine: 'Numer rozliczeniowy i numer rachunku można znaleźć na czeku powiązanym z tym kontem.',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `Aby połączyć konto bankowe, prosimy <a href="${contactMethodRoute}">dodać adres e‑mail jako główny login</a> i spróbować ponownie. Możesz dodać swój numer telefonu jako dodatkowy login.`,
        hasBeenThrottledError: 'Wystąpił błąd podczas dodawania Twojego konta bankowego. Poczekaj kilka minut i spróbuj ponownie.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Wygląda na to, że waluta Twojej przestrzeni roboczej jest ustawiona na inną niż USD. Aby kontynuować, przejdź do <a href="${workspaceRoute}">ustawień swojej przestrzeni roboczej</a>, ustaw ją na USD i spróbuj ponownie.`,
        bbaAdded: 'Dodano firmowe konto bankowe!',
        bbaAddedDescription: 'Jest gotowy do użycia w płatnościach.',
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
            addressStreet: 'Wprowadź prawidłowy adres ulicy',
            addressState: 'Wybierz prawidłowy stan',
            incorporationDateFuture: 'Data rejestracji nie może być w przyszłości',
            incorporationState: 'Wybierz prawidłowy stan',
            industryCode: 'Wprowadź prawidłowy sześciocyfrowy kod klasyfikacji branży',
            restrictedBusiness: 'Potwierdź, że firma nie znajduje się na liście działalności objętych ograniczeniami',
            routingNumber: 'Wprowadź prawidłowy numer rozliczeniowy',
            accountNumber: 'Wprowadź prawidłowy numer konta',
            routingAndAccountNumberCannotBeSame: 'Numery rozliczeniowe i konta nie mogą być takie same',
            companyType: 'Wybierz prawidłowy typ firmy',
            tooManyAttempts: 'Ze względu na dużą liczbę prób logowania ta opcja została wyłączona na 24 godziny. Spróbuj ponownie później lub wprowadź dane ręcznie.',
            address: 'Wprowadź prawidłowy adres',
            dob: 'Wybierz prawidłową datę urodzenia',
            age: 'Musi mieć ukończone 18 lat',
            ssnLast4: 'Wprowadź prawidłowe ostatnie 4 cyfry numeru SSN',
            firstName: 'Wprowadź prawidłowe imię',
            lastName: 'Proszę wprowadzić prawidłowe nazwisko',
            noDefaultDepositAccountOrDebitCardAvailable: 'Dodaj domyślne konto depozytowe lub kartę debetową',
            validationAmounts: 'Wprowadzone kwoty weryfikacyjne są nieprawidłowe. Sprawdź wyciąg bankowy i spróbuj ponownie.',
            fullName: 'Wprowadź prawidłowe imię i nazwisko',
            ownershipPercentage: 'Wprowadź prawidłową wartość procentową',
            deletePaymentBankAccount:
                'To tego konta bankowego nie można usunąć, ponieważ jest używane do płatności kartą Expensify. Jeśli mimo to chcesz usunąć to konto, skontaktuj się z Concierge.',
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
        failedToLoadPDF: 'Nie udało się wczytać pliku PDF',
        pdfPasswordForm: {
            title: 'Plik PDF chroniony hasłem',
            infoText: 'Ten plik PDF jest chroniony hasłem.',
            beforeLinkText: 'Proszę',
            linkText: 'wprowadź hasło',
            afterLinkText: 'aby to zobaczyć.',
            formLabel: 'Wyświetl PDF',
        },
        attachmentNotFound: 'Załącznik nie został znaleziony',
        retry: 'Ponów próbę',
    },
    messages: {
        errorMessageInvalidPhone: `Wprowadź prawidłowy numer telefonu bez nawiasów i myślników. Jeśli jesteś poza USA, dołącz kod swojego kraju (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Nieprawidłowy adres e-mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest już członkiem ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Kontynuując prośbę o aktywację portfela Expensify, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
        facialScan: 'Polityka skanowania twarzy Onfido i zgoda na wykorzystanie',
        tryAgain: 'Spróbuj ponownie',
        verifyIdentity: 'Zweryfikuj tożsamość',
        letsVerifyIdentity: 'Zweryfikujmy Twoją tożsamość',
        butFirst: `Ale najpierw ta nudniejsza część. Przeczytaj tekst prawny w kolejnym kroku i kliknij „Akceptuj”, gdy będziesz gotowy.`,
        genericError: 'Wystąpił błąd podczas przetwarzania tego kroku. Spróbuj ponownie.',
        cameraPermissionsNotGranted: 'Włącz dostęp do aparatu',
        cameraRequestMessage: 'Potrzebujemy dostępu do aparatu, aby ukończyć weryfikację konta bankowego. Włącz go w Ustawienia > New Expensify.',
        microphonePermissionsNotGranted: 'Włącz dostęp do mikrofonu',
        microphoneRequestMessage: 'Potrzebujemy dostępu do Twojego mikrofonu, aby zakończyć weryfikację konta bankowego. Włącz go w Ustawieniach > New Expensify.',
        originalDocumentNeeded: 'Prześlij oryginalne zdjęcie swojego dokumentu tożsamości zamiast zrzutu ekranu lub zeskanowanego obrazu.',
        documentNeedsBetterQuality:
            'Wygląda na to, że Twój dokument tożsamości jest uszkodzony lub brakuje w nim elementów zabezpieczających. Prześlij, proszę, oryginalne zdjęcie nieuszkodzonego dokumentu, który jest w całości widoczny.',
        imageNeedsBetterQuality: 'Wystąpił problem z jakością zdjęcia Twojego dokumentu tożsamości. Prześlij nowe zdjęcie, na którym cały dokument będzie wyraźnie widoczny.',
        selfieIssue: 'Wystąpił problem z Twoim selfie/wideo. Prześlij proszę aktualne selfie/wideo.',
        selfieNotMatching: 'Twoje selfie/wideo nie pasuje do Twojego dokumentu tożsamości. Prześlij nowe selfie/wideo, na którym Twoja twarz jest wyraźnie widoczna.',
        selfieNotLive: 'Twoje selfie/wideo nie wygląda na wykonane na żywo. Prześlij proszę selfie/wideo wykonane na żywo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dodatkowe szczegóły',
        helpText: 'Musimy potwierdzić następujące informacje, zanim będziesz mógł wysyłać i otrzymywać pieniądze ze swojego portfela.',
        helpTextIdologyQuestions: 'Musimy zadać Ci jeszcze kilka pytań, aby dokończyć weryfikację Twojej tożsamości.',
        helpLink: 'Dowiedz się więcej, dlaczego tego potrzebujemy.',
        legalFirstNameLabel: 'Imię zgodne z dokumentem tożsamości',
        legalMiddleNameLabel: 'Drugie imię (prawne)',
        legalLastNameLabel: 'Prawne nazwisko',
        selectAnswer: 'Wybierz odpowiedź, aby kontynuować',
        ssnFull9Error: 'Wprowadź prawidłowy dziewięciocyfrowy numer SSN',
        needSSNFull9: 'Mamy problem ze zweryfikowaniem Twojego numeru SSN. Wprowadź pełne dziewięć cyfr swojego numeru SSN.',
        weCouldNotVerify: 'Nie udało nam się zweryfikować',
        pleaseFixIt: 'Proszę poprawić te informacje przed kontynuowaniem',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Nie udało nam się zweryfikować Twojej tożsamości. Spróbuj ponownie później lub skontaktuj się z <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, jeśli masz jakiekolwiek pytania.`,
    },
    termsStep: {
        headerTitle: 'Warunki i opłaty',
        headerTitleRefactor: 'Opłaty i warunki',
        haveReadAndAgreePlain: 'Przeczytałem(-am) i zgadzam się na otrzymywanie elektronicznych ujawnień.',
        haveReadAndAgree: `Przeczytałem(-am) i zgadzam się na otrzymywanie <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">informacji w formie elektronicznej</a>.`,
        agreeToThePlain: 'Zgadzam się z Polityką prywatności i umową Portfela.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Zgadzam się z <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Polityką prywatności</a> oraz <a href="${walletAgreementUrl}">Regulaminem portfela</a>.`,
        enablePayments: 'Włącz płatności',
        monthlyFee: 'Miesięczna opłata',
        inactivity: 'Brak aktywności',
        noOverdraftOrCredit: 'Brak funkcji debetu/kredytu.',
        electronicFundsWithdrawal: 'Elektroniczne wycofanie środków',
        standard: 'Standard',
        reviewTheFees: 'Rzuć okiem na niektóre opłaty.',
        checkTheBoxes: 'Zaznacz pola poniżej.',
        agreeToTerms: 'Zaakceptuj warunki, a wszystko będzie gotowe!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Portfel Expensify jest wydawany przez ${walletProgram}.`,
            perPurchase: 'Za zakup',
            atmWithdrawal: 'Wypłata z bankomatu',
            cashReload: 'Doładowanie gotówką',
            inNetwork: 'w sieci',
            outOfNetwork: 'Poza siecią',
            atmBalanceInquiry: 'Sprawdzenie salda w bankomacie (w sieci lub poza siecią)',
            customerService: 'Obsługa klienta (zautomatyzowana lub z udziałem konsultanta)',
            inactivityAfterTwelveMonths: 'Nieaktywność (po 12 miesiącach bez transakcji)',
            weChargeOneFee: 'Pobieramy 1 inny rodzaj opłaty. Jest to:',
            fdicInsurance: 'Twoje środki kwalifikują się do ubezpieczenia FDIC.',
            generalInfo: `Aby uzyskać ogólne informacje na temat kont przedpłaconych, odwiedź <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Aby poznać szczegóły i warunki dotyczące wszystkich opłat i usług, odwiedź <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> lub zadzwoń pod numer +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektroniczne wycofanie środków (natychmiastowe)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Lista wszystkich opłat za Portfel Expensify',
            typeOfFeeHeader: 'Wszystkie opłaty',
            feeAmountHeader: 'Kwota',
            moreDetailsHeader: 'Szczegóły',
            openingAccountTitle: 'Otwarcie konta',
            openingAccountDetails: 'Otwarcie konta jest bezpłatne.',
            monthlyFeeDetails: 'Nie ma miesięcznej opłaty.',
            customerServiceTitle: 'Obsługa klienta',
            customerServiceDetails: 'Nie ma żadnych opłat za obsługę klienta.',
            inactivityDetails: 'Nie ma opłaty za nieaktywność.',
            sendingFundsTitle: 'Wysyłanie środków do innego posiadacza konta',
            sendingFundsDetails: 'Nie ma opłat za wysyłanie środków do innego posiadacza konta przy użyciu salda, konta bankowego lub karty debetowej.',
            electronicFundsStandardDetails:
                'Przelew środków z portfela Expensify na konto bankowe przy użyciu standardowej opcji jest bezpłatny. Taki przelew zazwyczaj zostaje zrealizowany w ciągu 1–3 dni roboczych.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'Przy natychmiastowym przelewie środków z Twojego portfela Expensify na powiązaną kartę debetową pobierana jest opłata. Taki przelew zazwyczaj zostaje zrealizowany w ciągu kilku minut.' +
                `Opłata wynosi ${percentage}% kwoty przelewu (z minimalną opłatą w wysokości ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Twoje środki kwalifikują się do ubezpieczenia FDIC. Twoje środki będą przechowywane w lub przekazywane do ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, instytucji ubezpieczonej przez FDIC.` +
                `Gdy już tam będą, Twoje środki są ubezpieczone do kwoty ${amount} przez FDIC na wypadek, gdyby ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} upadł, pod warunkiem spełnienia określonych wymogów dotyczących ubezpieczenia depozytów oraz zarejestrowania Twojej karty. Szczegóły znajdziesz w ${CONST.TERMS.FDIC_PREPAID}.`,
            contactExpensifyPayments: `Skontaktuj się z ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}, dzwoniąc pod numer +1 833-400-0904, wysyłając e-mail na adres ${CONST.EMAIL.CONCIERGE} lub logując się na ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Aby uzyskać ogólne informacje na temat kont przedpłaconych, odwiedź ${CONST.TERMS.CFPB_PREPAID}. Jeśli masz skargę dotyczącą konta przedpłaconego, zadzwoń do Biura Ochrony Finansowej Konsumenta pod numer 1-855-411-2372 lub odwiedź ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Wyświetl wersję przyjazną dla drukarki',
            automated: 'Zautomatyzowane',
            liveAgent: 'Konsultant na żywo',
            instant: 'Natychmiastowy',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min. ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Włącz płatności',
        activatedTitle: 'Portfel aktywowany!',
        activatedMessage: 'Gratulacje, Twój portfel jest skonfigurowany i gotowy do dokonywania płatności.',
        checkBackLaterTitle: 'Tylko chwileczkę…',
        checkBackLaterMessage: 'Wciąż sprawdzamy Twoje informacje. Spróbuj ponownie później.',
        continueToPayment: 'Przejdź do płatności',
        continueToTransfer: 'Kontynuuj przelew',
    },
    companyStep: {
        headerTitle: 'Informacje o firmie',
        subtitle: 'Prawie gotowe! Ze względów bezpieczeństwa musimy potwierdzić kilka informacji:',
        legalBusinessName: 'Oficjalna nazwa firmy',
        companyWebsite: 'Strona internetowa firmy',
        taxIDNumber: 'Numer identyfikacyjny podatkowy',
        taxIDNumberPlaceholder: '9 cyfr',
        companyType: 'Typ firmy',
        incorporationDate: 'Data rejestracji spółki',
        incorporationState: 'Stan rejestracji spółki',
        industryClassificationCode: 'Kod klasyfikacji branży',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        incorporationDatePlaceholder: 'Data rozpoczęcia (rrrr-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Firma',
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
        enterYourLegalFirstAndLast: 'Jakie jest Twoje imię i nazwisko zgodne z dokumentami?',
        legalFirstName: 'Imię zgodne z dokumentem tożsamości',
        legalLastName: 'Prawne nazwisko',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        enterYourDateOfBirth: 'Jaka jest twoja data urodzenia?',
        enterTheLast4: 'Jakie są ostatnie cztery cyfry Twojego numeru Social Security?',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych kontroli kredytowych!',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        enterYourAddress: 'Jaki jest Twój adres?',
        address: 'Adres',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
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
        businessName: 'Prawna nazwa firmy',
        enterYourCompanyTaxIdNumber: 'Jaki jest numer identyfikacji podatkowej Twojej firmy?',
        taxIDNumber: 'Numer identyfikacyjny podatkowy',
        taxIDNumberPlaceholder: '9 cyfr',
        enterYourCompanyWebsite: 'Jaka jest strona internetowa Twojej firmy?',
        companyWebsite: 'Strona internetowa firmy',
        enterYourCompanyPhoneNumber: 'Jaki jest numer telefonu Twojej firmy?',
        enterYourCompanyAddress: 'Jaki jest adres Twojej firmy?',
        selectYourCompanyType: 'Jakiego typu jest to firma?',
        companyType: 'Typ firmy',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Firma',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Spółdzielnia',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        selectYourCompanyIncorporationDate: 'Jaka jest data rejestracji Twojej firmy?',
        incorporationDate: 'Data rejestracji spółki',
        incorporationDatePlaceholder: 'Data rozpoczęcia (rrrr-mm-dd)',
        incorporationState: 'Stan rejestracji spółki',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'W którym stanie została zarejestrowana Twoja firma?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        companyAddress: 'Adres firmy',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        businessInfoTitle: 'Informacje o firmie',
        legalBusinessName: 'Oficjalna nazwa firmy',
        whatsTheBusinessName: 'Jaka jest nazwa firmy?',
        whatsTheBusinessAddress: 'Jaki jest adres firmy?',
        whatsTheBusinessContactInformation: 'Jakie są dane kontaktowe firmy?',
        whatsTheBusinessRegistrationNumber: ({country}: BusinessRegistrationNumberParams) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Jaki jest numer rejestracyjny firmy (CRN)?';
                default:
                    return 'Jaki jest numer rejestracyjny firmy?';
            }
        },
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Jaki jest Numer Identyfikacji Podatkowej pracodawcy (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Czym jest Numer Identyfikacyjny Przedsiębiorstwa (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Jaki jest numer rejestracyjny VAT (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Jaki jest Australijski Numer Identyfikacyjny (ABN)?';
                default:
                    return 'Jaki jest numer VAT UE?';
            }
        },
        whatsThisNumber: 'Co to za liczba?',
        whereWasTheBusinessIncorporated: 'Gdzie została zarejestrowana firma?',
        whatTypeOfBusinessIsIt: 'Jaki to rodzaj firmy?',
        whatsTheBusinessAnnualPayment: 'Jaki jest roczny wolumen płatności firmy?',
        whatsYourExpectedAverageReimbursements: 'Jaka jest oczekiwana średnia kwota zwrotu kosztów?',
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
        incorporation: 'Rejestracja spółki',
        incorporationCountry: 'Kraj rejestracji spółki',
        incorporationTypeName: 'Rodzaj formy prawnej',
        businessCategory: 'Kategoria biznesowa',
        annualPaymentVolume: 'Roczna wartość płatności',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Roczny wolumen płatności w ${currencyCode}`,
        averageReimbursementAmount: 'Średnia kwota zwrotu',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Średnia kwota zwrotu w ${currencyCode}`,
        selectIncorporationType: 'Wybierz typ rejestracji firmy',
        selectBusinessCategory: 'Wybierz kategorię firmy',
        selectAnnualPaymentVolume: 'Wybierz roczną wartość płatności',
        selectIncorporationCountry: 'Wybierz kraj rejestracji',
        selectIncorporationState: 'Wybierz stan rejestracji',
        selectAverageReimbursement: 'Wybierz średnią kwotę zwrotu',
        selectBusinessType: 'Wybierz typ firmy',
        findIncorporationType: 'Znajdź typ rejestracji firmy',
        findBusinessCategory: 'Znajdź kategorię firmy',
        findAnnualPaymentVolume: 'Znajdź roczny wolumen płatności',
        findIncorporationState: 'Znajdź stan rejestracji firmy',
        findAverageReimbursement: 'Znajdź średnią kwotę zwrotu',
        findBusinessType: 'Znajdź typ działalności',
        error: {
            registrationNumber: 'Proszę podać prawidłowy numer rejestracyjny',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Podaj prawidłowy numer identyfikacyjny pracodawcy (EIN)';
                    case CONST.COUNTRY.CA:
                        return 'Podaj prawidłowy numer identyfikacyjny firmy (BN)';
                    case CONST.COUNTRY.GB:
                        return 'Podaj prawidłowy numer VAT (VRN)';
                    case CONST.COUNTRY.AU:
                        return 'Podaj prawidłowy australijski numer biznesowy (ABN)';
                    default:
                        return 'Proszę podać prawidłowy numer VAT UE';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `Czy posiadasz 25% lub więcej udziałów w ${companyName}?`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `Czy jakiekolwiek osoby fizyczne posiadają 25% lub więcej udziałów w ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `Czy jest więcej osób, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        companyOwner: 'Właściciel firmy',
        enterLegalFirstAndLastName: 'Jakie jest prawne imię i nazwisko właściciela?',
        legalFirstName: 'Imię zgodne z dokumentem tożsamości',
        legalLastName: 'Prawne nazwisko',
        enterTheDateOfBirthOfTheOwner: 'Jaka jest data urodzenia właściciela?',
        enterTheLast4: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych kontroli kredytowych!',
        enterTheOwnersAddress: 'Jaki jest adres właściciela?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        address: 'Adres',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
        owners: 'Właściciele',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informacje o właścicielu',
        businessOwner: 'Właściciel firmy',
        signerInfo: 'Informacje o podpisującym',
        doYouOwn: ({companyName}: CompanyNameParams) => `Czy posiadasz 25% lub więcej udziałów w ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Czy jakiekolwiek osoby fizyczne posiadają 25% lub więcej udziałów w ${companyName}?`,
        regulationsRequire: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada ponad 25% udziałów w firmie.',
        legalFirstName: 'Imię zgodne z dokumentem tożsamości',
        legalLastName: 'Prawne nazwisko',
        whatsTheOwnersName: 'Jakie jest prawne imię i nazwisko właściciela?',
        whatsYourName: 'Jakie jest Twoje imię i nazwisko zgodne z dokumentami?',
        whatPercentage: 'Jaki procent firmy należy do właściciela?',
        whatsYoursPercentage: 'Jaki procent firmy posiadasz?',
        ownership: 'Własność',
        whatsTheOwnersDOB: 'Jaka jest data urodzenia właściciela?',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        whatsTheOwnersAddress: 'Jaki jest adres właściciela?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatAreTheLast: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        whatsYourLast: 'Jakie są ostatnie 4 cyfry Twojego numeru Social Security?',
        whatsYourNationality: 'Jakie jest Twoje obywatelstwo?',
        whatsTheOwnersNationality: 'Jaki jest kraj obywatelstwa właściciela?',
        countryOfCitizenship: 'Kraj obywatelstwa',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych kontroli kredytowych!',
        last4: 'Ostatnie 4 cyfry numeru SSN',
        whyDoWeAsk: 'Dlaczego o to prosimy?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        ownershipPercentage: 'Procent udziałów',
        areThereOther: ({companyName}: CompanyNameParams) => `Czy są inne osoby, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        owners: 'Właściciele',
        addCertified: 'Dodaj zatwierdzony schemat organizacyjny pokazujący beneficjentów rzeczywistych',
        regulationRequiresChart:
            'Przepisy wymagają od nas zebrania poświadczonej kopii schematu własności, który pokazuje każdą osobę fizyczną lub podmiot posiadający 25% lub więcej udziałów w firmie.',
        uploadEntity: 'Prześlij schemat własności podmiotu',
        noteEntity: 'Uwaga: wykres struktury własności podmiotu musi być podpisany przez Twojego księgowego, doradcę prawnego lub poświadczony notarialnie.',
        certified: 'Certyfikowany wykres struktury własności podmiotu',
        selectCountry: 'Wybierz kraj',
        findCountry: 'Znajdź kraj',
        address: 'Adres',
        chooseFile: 'Wybierz plik',
        uploadDocuments: 'Prześlij dodatkową dokumentację',
        pleaseUpload:
            'Prześlij poniżej dodatkowe dokumenty, aby pomóc nam zweryfikować Twoją tożsamość jako bezpośredniego lub pośredniego właściciela co najmniej 25% udziałów w podmiocie gospodarczym.',
        acceptedFiles: 'Akceptowane formaty plików: PDF, PNG, JPEG. Łączny rozmiar plików dla każdej sekcji nie może przekroczyć 5 MB.',
        proofOfBeneficialOwner: 'Dowód rzeczywistego właściciela',
        proofOfBeneficialOwnerDescription:
            'Proszę dostarczyć podpisane zaświadczenie oraz schemat organizacyjny od biegłego księgowego, notariusza lub prawnika potwierdzające posiadanie 25% lub więcej udziałów w firmie. Dokument musi być opatrzony datą z ostatnich trzech miesięcy i zawierać numer licencji osoby podpisującej.',
        copyOfID: 'Kopia dokumentu tożsamości beneficjenta rzeczywistego',
        copyOfIDDescription: 'Przykłady: paszport, prawo jazdy itp.',
        proofOfAddress: 'Potwierdzenie adresu dla beneficjenta rzeczywistego',
        proofOfAddressDescription: 'Przykłady: rachunek za media, umowa najmu itp.',
        codiceFiscale: 'Codice fiscale/Identyfikator podatkowy',
        codiceFiscaleDescription:
            'Prześlij nagranie wideo z wizyty w siedzibie firmy lub zarejestrowanej rozmowy z osobą upoważnioną do podpisu. Osoba ta musi podać: imię i nazwisko, datę urodzenia, nazwę firmy, numer rejestracyjny, numer identyfikacji podatkowej, zarejestrowany adres, rodzaj działalności oraz cel założenia konta.',
    },
    completeVerificationStep: {
        completeVerification: 'Zakończ weryfikację',
        confirmAgreements: 'Proszę potwierdzić poniższe zgody.',
        certifyTrueAndAccurate: 'Oświadczam, że podane informacje są prawdziwe i dokładne',
        certifyTrueAndAccurateError: 'Proszę potwierdzić, że informacje są prawdziwe i dokładne',
        isAuthorizedToUseBankAccount: 'Jestem upoważniony do korzystania z tego firmowego konta bankowego na potrzeby wydatków służbowych',
        isAuthorizedToUseBankAccountError: 'Musisz być osobą upoważnioną do kontroli z autoryzacją do obsługi firmowego rachunku bankowego',
        termsAndConditions: 'regulamin i warunki',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Zweryfikuj swoje konto bankowe',
        validateButtonText: 'Zweryfikuj',
        validationInputLabel: 'Transakcja',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego została wyłączona z powodu zbyt wielu nieprawidłowych prób.',
        description: `W ciągu 1–2 dni roboczych wyślemy trzy (3) małe transakcje na Twoje konto bankowe z nadawcy o nazwie podobnej do „Expensify, Inc. Validation”.`,
        descriptionCTA: 'Wprowadź kwotę każdej transakcji w pola poniżej. Przykład: 1,51.',
        letsChatText: 'Prawie gotowe! Potrzebujemy Twojej pomocy, aby zweryfikować jeszcze kilka ostatnich informacji na czacie. Gotowy/a?',
        enable2FATitle: 'Zapobiegaj oszustwom, włącz uwierzytelnianie dwuskładnikowe (2FA)',
        enable2FAText: 'Poważnie traktujemy Twoje bezpieczeństwo. Skonfiguruj teraz uwierzytelnianie dwuskładnikowe (2FA), aby dodać dodatkową warstwę ochrony do swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    countryStep: {
        confirmBusinessBank: 'Potwierdź walutę i kraj firmowego konta bankowego',
        confirmCurrency: 'Potwierdź walutę i kraj',
        yourBusiness: 'Waluta firmowego konta bankowego musi być taka sama jak waluta Twojej przestrzeni roboczej.',
        youCanChange: 'Możesz zmienić walutę swojego miejsca pracy w swoim',
        findCountry: 'Znajdź kraj',
        selectCountry: 'Wybierz kraj',
    },
    bankInfoStep: {
        whatAreYour: 'Jakie są dane Twojego firmowego rachunku bankowego?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda w porządku.',
        thisBankAccount: 'To konto bankowe będzie używane do płatności firmowych w Twoim obszarze roboczym',
        accountNumber: 'Numer konta',
        accountHolderNameDescription: 'Imię i nazwisko upoważnionego sygnatariusza',
    },
    signerInfoStep: {
        signerInfo: 'Informacje o podpisującym',
        areYouDirector: ({companyName}: CompanyNameParams) => `Jesteś dyrektorem w ${companyName}?`,
        regulationRequiresUs: 'Przepisy wymagają od nas zweryfikowania, czy osoba podpisująca ma uprawnienia do podjęcia tego działania w imieniu firmy.',
        whatsYourName: 'Jakie jest Twoje imię i nazwisko zgodnie z dokumentami prawnymi',
        fullName: 'Pełne imię i nazwisko',
        whatsYourJobTitle: 'Jakie jest twoje stanowisko?',
        jobTitle: 'Stanowisko',
        whatsYourDOB: 'Jaka jest twoja data urodzenia?',
        uploadID: 'Prześlij dowód tożsamości i potwierdzenie adresu',
        personalAddress: 'Potwierdzenie adresu zamieszkania (np. rachunek za media)',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
        legalName: 'Imię i nazwisko zgodne z dokumentami',
        proofOf: 'Potwierdzenie adresu zamieszkania',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Wprowadź adres e-mail dyrektora w firmie ${companyName}`,
        regulationRequiresOneMoreDirector: 'Przepisy wymagają co najmniej jeszcze jednego dyrektora jako sygnatariusza.',
        hangTight: 'Proszę czekać...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Wprowadź adresy e-mail dwóch dyrektorów w ${companyName}`,
        sendReminder: 'Wyślij przypomnienie',
        chooseFile: 'Wybierz plik',
        weAreWaiting: 'Czekamy, aż inni potwierdzą swoją tożsamość jako dyrektorzy firmy.',
        id: 'Kopia dokumentu tożsamości',
        proofOfDirectors: 'Dowód tożsamości dyrektora/dyrektorów',
        proofOfDirectorsDescription: 'Przykłady: Oncorp Corporate Profile lub Business Registration.',
        codiceFiscale: 'Kod fiskalny',
        codiceFiscaleDescription: 'Codice Fiscale dla sygnatariuszy, użytkowników upoważnionych i beneficjentów rzeczywistych.',
        PDSandFSG: 'Dokumenty ujawniające PDS + FSG',
        PDSandFSGDescription: dedent(`
            Nasze partnerstwo z Corpay wykorzystuje połączenie API, aby skorzystać z ich rozległej sieci międzynarodowych partnerów bankowych, napędzającej funkcję Global Reimbursements w Expensify. Zgodnie z australijskimi przepisami udostępniamy Ci Przewodnik po Usługach Finansowych (FSG) oraz Oświadczenie o Ujawnieniu Informacji o Produkcie (PDS) firmy Corpay.

            Prosimy o dokładne przeczytanie dokumentów FSG i PDS, ponieważ zawierają pełne informacje i istotne szczegóły dotyczące produktów i usług oferowanych przez Corpay. Zachowaj te dokumenty do przyszłego wglądu.
        `),
        pleaseUpload: 'Prześlij poniżej dodatkową dokumentację, aby pomóc nam zweryfikować Twoją tożsamość jako dyrektora firmy.',
        enterSignerInfo: 'Wprowadź dane sygnatariusza',
        thisStep: 'Ten krok został ukończony',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `łączy firmowe konto bankowe w ${currency} kończące się na ${bankAccountLastFour} z Expensify, aby wypłacać pracownikom wynagrodzenia w ${currency}. Następny krok wymaga informacji o sygnatariuszu od członka zarządu.`,
        error: {
            emailsMustBeDifferent: 'Adresy e-mail muszą być różne',
        },
    },
    agreementsStep: {
        agreements: 'Umowy',
        pleaseConfirm: 'Potwierdź poniższe zgody',
        regulationRequiresUs: 'Przepisy wymagają od nas zweryfikowania tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        iAmAuthorized: 'Jestem upoważniony do korzystania z firmowego konta bankowego na wydatki służbowe.',
        iCertify: 'Oświadczam, że podane informacje są prawdziwe i zgodne z rzeczywistością.',
        iAcceptTheTermsAndConditions: `Akceptuję <a href="https://cross-border.corpay.com/tc/">warunki</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Akceptuję regulamin i warunki.',
        accept: 'Zaakceptuj i dodaj konto bankowe',
        iConsentToThePrivacyNotice: 'Wyrażam zgodę na <a href="https://payments.corpay.com/compliance">informację o ochronie prywatności</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Wyrażam zgodę na informację o ochronie prywatności.',
        error: {
            authorized: 'Musisz być osobą upoważnioną do kontroli z autoryzacją do obsługi firmowego rachunku bankowego',
            certify: 'Proszę potwierdzić, że informacje są prawdziwe i dokładne',
            consent: 'Prosimy o wyrażenie zgody na informację o prywatności',
        },
    },
    docusignStep: {
        subheader: 'Formularz DocuSign',
        pleaseComplete:
            'Prosimy wypełnić formularz autoryzacji ACH za pomocą poniższego linku Docusign, a następnie przesłać tutaj podpisaną kopię, abyśmy mogli pobierać środki bezpośrednio z Twojego konta bankowego',
        pleaseCompleteTheBusinessAccount: 'Proszę wypełnić Wniosek o Konto Firmowe – Ustalenie Polecenia Zapłaty',
        pleaseCompleteTheDirect:
            'Prosimy uzupełnić Umowę Polecenia Zapłaty, korzystając z poniższego linku Docusign, a następnie przesłać tutaj jej podpisaną kopię, abyśmy mogli pobierać środki bezpośrednio z Twojego konta bankowego.',
        takeMeTo: 'Zabierz mnie do DocuSign',
        uploadAdditional: 'Prześlij dodatkową dokumentację',
        pleaseUpload: 'Proszę przesłać formularz DEFT oraz stronę z podpisem DocuSign.',
        pleaseUploadTheDirect: 'Prześlij proszę Uzgodnienia Dotyczące Polecenia Zapłaty oraz stronę z podpisem Docusign',
    },
    finishStep: {
        letsFinish: 'Dokończmy to na czacie!',
        thanksFor:
            'Dziękujemy za te informacje. Dedykowany agent wsparcia teraz je przejrzy. Skontaktujemy się z Tobą, jeśli będziemy potrzebować od Ciebie czegoś więcej, ale w międzyczasie możesz śmiało napisać do nas z wszelkimi pytaniami.',
        iHaveA: 'Mam pytanie',
        enable2FA: 'Włącz uwierzytelnianie dwuskładnikowe (2FA), aby zapobiec oszustwom',
        weTake: 'Poważnie traktujemy Twoje bezpieczeństwo. Skonfiguruj teraz uwierzytelnianie dwuskładnikowe (2FA), aby dodać dodatkową warstwę ochrony do swojego konta.',
        secure: 'Zabezpiecz swoje konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Chwileczkę',
        explanationLine: 'Sprawdzamy teraz Twoje dane. Wkrótce będziesz mógł/mogła przejść do kolejnych kroków.',
    },
    session: {
        offlineMessageRetry: 'Wygląda na to, że jesteś offline. Sprawdź swoje połączenie i spróbuj ponownie.',
    },
    travel: {
        header: 'Rezerwuj podróż',
        title: 'Podróżuj mądrze',
        subtitle: 'Korzystaj z Expensify Travel, aby uzyskać najlepsze oferty podróży i zarządzać wszystkimi wydatkami służbowymi w jednym miejscu.',
        features: {
            saveMoney: 'Oszczędzaj pieniądze na swoich rezerwacjach',
            alerts: 'Otrzymuj aktualizacje i alerty w czasie rzeczywistym',
        },
        bookTravel: 'Rezerwuj podróż',
        bookDemo: 'Zarezerwuj demo',
        bookADemo: 'Zarezerwuj demo',
        toLearnMore: ', aby dowiedzieć się więcej.',
        termsAndConditions: {
            header: 'Zanim będziemy kontynuować...',
            title: 'Regulamin',
            label: 'Zgadzam się z warunkami i zasadami użytkowania',
            subtitle: `Prosimy o zaakceptowanie <a href="${CONST.TRAVEL_TERMS_URL}">regulaminu i warunków</a> Expensify Travel.`,
            error: 'Musisz zaakceptować regulamin korzystania z Expensify Travel, aby kontynuować',
            defaultWorkspaceError:
                'Musisz ustawić domyślne miejsce pracy, aby włączyć Expensify Travel. Przejdź do Ustawienia > Miejsca pracy > kliknij trzy pionowe kropki obok miejsca pracy > Ustaw jako domyślne miejsce pracy, a następnie spróbuj ponownie!',
        },
        flight: 'Lot',
        flightDetails: {
            passenger: 'Pasażer',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Masz <strong>${layover} międzylądowanie</strong> przed tym lotem</muted-text-label>`,
            takeOff: 'Start',
            landing: 'Strona główna',
            seat: 'Miejsce',
            class: 'Klasa kabiny',
            recordLocator: 'Identyfikator rezerwacji',
            cabinClasses: {
                unknown: 'Nieznane',
                economy: 'Ekonomia',
                premiumEconomy: 'Ekonomiczna Premium',
                business: 'Firma',
                first: 'Pierwszy',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Gość',
            checkIn: 'Zameldowanie',
            checkOut: 'Wykwaterowanie',
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
            rentalCar: 'Wynajem samochodu',
            pickUp: 'Odbiór',
            dropOff: 'Miejsce wysadzenia',
            driver: 'Kierowca',
            carType: 'Typ samochodu',
            cancellation: 'Zasady anulowania',
            cancellationUntil: 'Bezpłatne anulowanie do',
            freeCancellation: 'Bezpłatne anulowanie',
            confirmation: 'Numer potwierdzenia',
        },
        train: 'Pasek boczny',
        trainDetails: {
            passenger: 'Pasażer',
            departs: 'Odlot',
            arrives: 'Przyjazdy',
            coachNumber: 'Numer wagonu',
            seat: 'Miejsce',
            fareDetails: 'Szczegóły taryfy',
            confirmation: 'Numer potwierdzenia',
        },
        viewTrip: 'Zobacz podróż',
        modifyTrip: 'Modyfikuj podróż',
        tripSupport: 'Wsparcie podróży',
        tripDetails: 'Szczegóły podróży',
        viewTripDetails: 'Zobacz szczegóły podróży',
        trip: 'Podróż',
        trips: 'Podróże',
        tripSummary: 'Podsumowanie podróży',
        departs: 'Odlot',
        errorMessage: 'Coś poszło nie tak. Spróbuj ponownie później.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Aby zarezerwować podróż, <a href="${phoneErrorMethodsRoute}">dodaj służbowy adres e-mail jako swój główny login</a>.</rbr>`,
        domainSelector: {
            title: 'Domena',
            subtitle: 'Wybierz domenę dla konfiguracji Expensify Travel.',
            recommended: 'Polecane',
        },
        domainPermissionInfo: {
            title: 'Domena',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) =>
                `Nie masz uprawnień, aby włączyć Expensify Travel dla domeny <strong>${domain}</strong>. Zamiast tego musisz poprosić kogoś z tej domeny o włączenie funkcji Travel.`,
            accountantInvitation: `Jeśli jesteś księgowym, rozważ dołączenie do programu <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a>, aby włączyć podróże dla tej domeny.`,
        },
        publicDomainError: {
            title: 'Rozpocznij korzystanie z Expensify Travel',
            message: `Musisz używać służbowego adresu e-mail (np. name@company.com) z Expensify Travel, a nie osobistego adresu e-mail (np. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel został wyłączony',
            message: `Twój administrator wyłączył Expensify Travel. Postępuj zgodnie z firmową polityką rezerwacji przy organizowaniu podróży.`,
        },
        verifyCompany: {
            title: 'Przeglądamy Twoje zgłoszenie…',
            message: `Przeprowadzamy kilka kontroli po naszej stronie, aby upewnić się, że Twoje konto jest gotowe na Expensify Travel. Wkrótce się z Tobą skontaktujemy!`,
            confirmText: 'Rozumiem',
            conciergeMessage: ({domain}: {domain: string}) => `Włączenie podróży nie powiodło się dla domeny: ${domain}. Proszę sprawdzić i włączyć podróże dla tej domeny.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zarezerwowany. Kod potwierdzenia: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Twój bilet na lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został unieważniony.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Twój bilet na lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zwrócony lub wymieniony.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate}} został odwołany przez linię lotniczą.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) => `Linie lotnicze zaproponowały zmianę rozkładu dla lotu ${airlineCode}; oczekujemy na potwierdzenie.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Zmiana harmonogramu potwierdzona: lot ${airlineCode} teraz odlatuje o ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zaktualizowany.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Twoja klasa podróży została zaktualizowana do ${cabinClass} na locie ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Twój przydział miejsca na locie ${airlineCode} został potwierdzony.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Twoje miejsce na locie ${airlineCode} zostało zmienione.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Twoje przydzielone miejsce na locie ${airlineCode} zostało usunięte.`,
            paymentDeclined: 'Płatność za Twoją rezerwację lotu nie powiodła się. Spróbuj ponownie.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Anulowano Twoją rezerwację ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Dostawca anulował Twoją rezerwację ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Twoja rezerwacja typu ${type} została ponownie zarezerwowana. Nowy numer potwierdzenia: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Twoja rezerwacja (${type}) została zaktualizowana. Sprawdź nowe szczegóły w planie podróży.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Twój bilet kolejowy z ${origin} → ${destination} na ${startDate} został zwrócony. Zostanie przetworzony kredyt.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Twój bilet kolejowy z ${origin} do ${destination} na ${startDate} został wymieniony.`,
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
            companyCards: 'Karty firmowe',
            workflows: 'Przepływy pracy',
            workspace: 'Obszar roboczy',
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
            reconcileCards: 'Uzgodnij karty',
            selectAll: 'Zaznacz wszystko',
            selected: () => ({
                one: 'Wybrano 1',
                other: (count: number) => `Wybrano: ${count}`,
            }),
            settlementFrequency: 'Częstotliwość rozliczeń',
            setAsDefault: 'Ustaw jako domyślną przestrzeń roboczą',
            defaultNote: `Paragony wysłane na adres ${CONST.EMAIL.RECEIPTS} pojawią się w tym obszarze roboczym.`,
            deleteConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą?',
            deleteWithCardsConfirmation: 'Czy na pewno chcesz usunąć ten workspace? Spowoduje to usunięcie wszystkich źródeł kart i przypisanych kart.',
            unavailable: 'Niedostępny workspace',
            memberNotFound: 'Nie znaleziono członka. Aby zaprosić nowego członka do przestrzeni roboczej, skorzystaj z przycisku „Zaproś” powyżej.',
            notAuthorized: `Nie masz dostępu do tej strony. Jeśli próbujesz dołączyć do tego workspace, poproś właściciela workspace, aby dodał Cię jako członka. Coś innego? Skontaktuj się z ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Przejdź do przestrzeni roboczej',
            duplicateWorkspace: 'Zduplikuj przestrzeń roboczą',
            duplicateWorkspacePrefix: 'Duplikuj',
            goToWorkspaces: 'Przejdź do obszarów roboczych',
            clearFilter: 'Wyczyść filtr',
            workspaceName: 'Nazwa przestrzeni roboczej',
            workspaceOwner: 'Właściciel',
            workspaceType: 'Typ przestrzeni roboczej',
            workspaceAvatar: 'Awatar przestrzeni roboczej',
            mustBeOnlineToViewMembers: 'Musisz być online, aby wyświetlić członków tego obszaru roboczego.',
            moreFeatures: 'Więcej funkcji',
            requested: 'Zażądano',
            distanceRates: 'Stawki za przejazd',
            defaultDescription: 'Jedno miejsce na wszystkie Twoje paragony i wydatki.',
            descriptionHint: 'Udostępnij informacje o tym obszarze roboczym wszystkim członkom.',
            welcomeNote: 'Prosimy o przesłanie paragonów do zwrotu kosztów za pomocą Expensify, dziękujemy!',
            subscription: 'Subskrypcja',
            markAsEntered: 'Oznacz jako wprowadzone ręcznie',
            markAsExported: 'Oznacz jako wyeksportowane',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Eksportuj do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
            lineItemLevel: 'Na poziomie pozycji',
            reportLevel: 'Poziom raportu',
            topLevel: 'Najwyższy poziom',
            appliedOnExport: 'Nie zaimportowano do Expensify, zastosowano przy eksporcie',
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
                `Ponieważ wcześniej połączyłeś się z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, możesz ponownie użyć istniejącego połączenia lub utworzyć nowe.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} – Ostatnia synchronizacja: ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Nie można połączyć z ${connectionName} z powodu błędu uwierzytelniania.`,
            learnMore: 'Dowiedz się więcej',
            memberAlternateText: 'Członkowie mogą przesyłać i zatwierdzać raporty.',
            adminAlternateText: 'Administratorzy mają pełny dostęp do edycji wszystkich raportów i ustawień przestrzeni roboczej.',
            auditorAlternateText: 'Audytorzy mogą przeglądać raporty i je komentować.',
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
            planType: 'Rodzaj planu',
            submitExpense: 'Prześlij swoje wydatki poniżej:',
            defaultCategory: 'Domyślna kategoria',
            viewTransactions: 'Wyświetl transakcje',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Wydatki użytkownika ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Transakcje kartą Expensify będą automatycznie eksportowane do „konta zobowiązań karty Expensify Card” utworzonego za pomocą <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">naszej integracji</a>.</muted-text-label>`,
        },
        receiptPartners: {
            connect: 'Połącz teraz',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Połączono z ${organizationName}` : 'Automatyzuj wydatki na podróże i dostawę posiłków w całej swojej organizacji.',
                sendInvites: 'Wyślij zaproszenia',
                sendInvitesDescription:
                    'Ci członkowie przestrzeni roboczej nie mają jeszcze konta Uber for Business. Odznacz wszystkich członków, których nie chcesz zapraszać w tym momencie.',
                confirmInvite: 'Potwierdź zaproszenie',
                manageInvites: 'Zarządzaj zaproszeniami',
                confirm: 'Potwierdź',
                allSet: 'Wszystko gotowe',
                readyToRoll: 'Wszystko gotowe do działania',
                takeBusinessRideMessage: 'Weź przejazd służbowy Uberem, a Twoje paragony zostaną zaimportowane do Expensify. Ruszaj!',
                all: 'Wszystkie',
                linked: 'Połączono',
                outstanding: 'Nierozliczone',
                status: {
                    resend: 'Wyślij ponownie',
                    invite: 'Zaproś',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Połączono',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Oczekujące',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Zawieszono',
                },
                centralBillingAccount: 'Główne konto rozliczeniowe',
                centralBillingDescription: 'Wybierz miejsce importu wszystkich paragonów z Uber.',
                invitationFailure: 'Nie udało się zaprosić członka do Uber for Business',
                autoInvite: 'Zaproś nowych członków przestrzeni roboczej do Uber for Business',
                autoRemove: 'Dezaktywuj usuniętych członków przestrzeni roboczej w Uber for Business',
                bannerTitle: 'Expensify + Uber for Business',
                bannerDescription: 'Połącz Uber for Business, aby zautomatyzować wydatki na podróże i dostawę posiłków w całej swojej organizacji.',
                emptyContent: {
                    title: 'Brak zaległych zaproszeń',
                    subtitle: 'Hura! Szukaliśmy wszędzie i nie znaleźliśmy żadnych zaległych zaproszeń.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Ustaw stawki diet, aby kontrolować dzienne wydatki pracowników. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Dowiedz się więcej</a>.</muted-text>`,
            amount: 'Kwota',
            deleteRates: () => ({
                one: 'Usuń kurs',
                other: 'Usuń stawki',
            }),
            deletePerDiemRate: 'Usuń stawkę diety',
            findPerDiemRate: 'Znajdź stawkę ryczałtową',
            areYouSureDelete: () => ({
                one: 'Czy na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }),
            emptyList: {
                title: 'Dieta',
                subtitle: 'Ustaw dzienne stawki ryczałtowe, aby kontrolować codzienne wydatki pracowników. Zaimportuj stawki z arkusza kalkulacyjnego, aby rozpocząć.',
            },
            importPerDiemRates: 'Importuj stawki diet',
            editPerDiemRate: 'Edytuj stawkę ryczałtową',
            editPerDiemRates: 'Edytuj stawki ryczałtowe',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `Zaktualizowanie tego miejsca docelowego spowoduje zmianę dla wszystkich podstawek diet ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Zaktualizowanie tej waluty spowoduje zmianę dla wszystkich podstawek diet ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportowania wydatków z własnej kieszeni do QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Oznacz czeki jako „wydrukuj później”',
            exportDescription: 'Skonfiguruj sposób eksportowania danych Expensify do QuickBooks Desktop.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje karty Expensify jako',
            account: 'Konto',
            accountDescription: 'Wybierz miejsce księgowania zapisów w dzienniku.',
            accountsPayable: 'Zobowiązania wobec dostawców',
            accountsPayableDescription: 'Wybierz miejsce tworzenia faktur kosztowych.',
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
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            exportCheckDescription: 'Utworzymy zindywidualizowany czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy zindeksowany wpis w dzienniku dla każdego raportu Expensify i zaksięgujemy go na poniższym koncie.',
            exportVendorBillDescription:
                'Utworzymy wyszczególniony rachunek od dostawcy dla każdego raportu w Expensify i dodamy go do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy go na 1. dzień następnego otwartego okresu.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop nie obsługuje podatków przy eksporcie zapisów w dzienniku. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Zapisy dziennika są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Zapis księgowy',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawdź',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Utworzymy zindywidualizowany czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą kredytową do odpowiadających jej dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Credit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz, dokąd eksportować transakcje kartą kredytową.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wybierz dostawcę, którego zastosować do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wybierz, skąd wysyłać czeki.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Faktury od dostawców są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Zapisy dziennika są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
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
            importDescription: 'Wybierz, które konfiguracje kodowania chcesz zaimportować z QuickBooks Desktop do Expensify.',
            classes: 'Klasy',
            items: 'Pozycje',
            customers: 'Klienci/projekty',
            exportCompanyCardsDescription: 'Ustaw sposób eksportowania zakupów na firmowe karty do QuickBooks Desktop.',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który będzie stosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            accountsDescription: 'Twój plan kont QuickBooks Desktop zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne dla członków do wyboru podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz sposób obsługi klas QuickBooks Desktop w Expensify.',
            tagsDisplayedAsDescription: 'Poziom pozycji liniowej',
            reportFieldsDisplayedAsDescription: 'Poziom raportu',
            customersDescription: 'Wybierz, jak obsługiwać klientów/projekty z QuickBooks Desktop w Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z QuickBooks Desktop każdego dnia.',
                createEntities: 'Automatyczne tworzenie jednostek',
                createEntitiesDescription: 'Expensify automatycznie utworzy dostawców w QuickBooks Desktop, jeśli jeszcze nie istnieją.',
            },
            itemsDescription: 'Wybierz, jak obsługiwać pozycje QuickBooks Desktop w Expensify.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy wyeksportować wydatki:',
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
            connectedTo: 'Połączono',
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z QuickBooks Online do Expensify.',
            classes: 'Klasy',
            locations: 'Lokalizacje',
            customers: 'Klienci/projekty',
            accountsDescription: 'Twój plan kont QuickBooks Online zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne dla członków do wyboru podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz sposób obsługi klas QuickBooks Online w Expensify.',
            customersDescription: 'Wybierz sposób obsługi klientów/projektów QuickBooks Online w Expensify.',
            locationsDescription: 'Wybierz sposób obsługi lokalizacji QuickBooks Online w Expensify.',
            taxesDescription: 'Wybierz sposób obsługi podatków QuickBooks Online w Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online nie obsługuje lokalizacji na poziomie wiersza dla czeków ani rachunków od dostawców. Jeśli chcesz mieć lokalizacje na poziomie wiersza, upewnij się, że używasz zapisów w dzienniku oraz wydatków kartą kredytową/debetową.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online nie obsługuje podatków w zapisach w dzienniku. Zmień opcję eksportu na rachunek dostawcy lub czek.',
            exportDescription: 'Skonfiguruj sposób eksportowania danych z Expensify do QuickBooks Online.',
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
                        label: 'Data wysłania',
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            receivable: 'Należności z tytułu dostaw i usług', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archiwum należności', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Użyj tego konta podczas eksportowania faktur do QuickBooks Online.',
            exportCompanyCardsDescription: 'Ustaw sposób eksportowania zakupów kartą firmową do QuickBooks Online.',
            vendor: 'Dostawca',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który będzie stosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportu wydatków z własnej kieszeni do QuickBooks Online.',
            exportCheckDescription: 'Utworzymy zindywidualizowany czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy zindeksowany wpis w dzienniku dla każdego raportu Expensify i zaksięgujemy go na poniższym koncie.',
            exportVendorBillDescription:
                'Utworzymy wyszczególniony rachunek od dostawcy dla każdego raportu w Expensify i dodamy go do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy go na 1. dzień następnego otwartego okresu.',
            account: 'Konto',
            accountDescription: 'Wybierz miejsce księgowania zapisów w dzienniku.',
            accountsPayable: 'Zobowiązania wobec dostawców',
            accountsPayableDescription: 'Wybierz miejsce tworzenia faktur kosztowych.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nieskonfigurowane',
            bankAccountDescription: 'Wybierz, skąd wysyłać czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online nie obsługuje lokalizacji przy eksporcie rachunków dostawców. Ponieważ masz włączone lokalizacje w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online nie obsługuje podatków przy eksporcie zapisów w dzienniku. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Zapisy dziennika są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z QuickBooks Online każdego dnia.',
                inviteEmployees: 'Zaproś pracowników',
                inviteEmployeesDescription: 'Importuj rekordy pracowników z QuickBooks Online i zaproś pracowników do tego obszaru roboczego.',
                createEntities: 'Automatyczne tworzenie jednostek',
                createEntitiesDescription:
                    'Expensify automatycznie utworzy dostawców w QuickBooks Online, jeśli jeszcze nie istnieją, oraz automatycznie utworzy klientów podczas eksportowania faktur.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie QuickBooks Online.',
                qboBillPaymentAccount: 'Konto płatności rachunków QuickBooks',
                qboInvoiceCollectionAccount: 'Konto windykacji faktur QuickBooks',
                accountSelectDescription: 'Wybierz, z którego konta chcesz opłacać rachunki, a my utworzymy płatność w QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie otrzymywać płatności za faktury, a my utworzymy płatność w QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Karta debetowa',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Zapis księgowy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawdź',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą debetową do odpowiednich kontrahentów w QuickBooks. Jeśli żaden kontrahent nie istnieje, utworzymy kontrahenta „Debit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy z transakcji kartą kredytową do odpowiadających jej dostawców w QuickBooks. Jeśli żaden dostawca nie istnieje, utworzymy dostawcę „Credit Card Misc.” do powiązania.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy ją na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji kartą debetową.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz, dokąd eksportować transakcje kartą kredytową.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wybierz dostawcę, którego zastosować do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Faktury od dostawców są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Wybierz inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Zapisy dziennika są niedostępne, gdy podatki są włączone. Wybierz inną opcję eksportu.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wybierz prawidłowe konto do eksportu rachunku dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wybierz prawidłowe konto do eksportu zapisów w dzienniku',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wybierz prawidłowe konto do eksportu czeku',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Aby korzystać z eksportu rachunków od dostawców, skonfiguruj konto zobowiązań w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Aby używać eksportu zapisów księgowych, skonfiguruj konto dziennika w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Aby użyć eksportu czeków, skonfiguruj konto bankowe w QuickBooks Online',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Online i zsynchronizuj połączenie ponownie.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy wyeksportować wydatki:',
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
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne dla członków do wyboru podczas tworzenia ich wydatków.',
            trackingCategories: 'Kategorie śledzenia',
            trackingCategoriesDescription: 'Wybierz sposób obsługi kategorii śledzenia Xero w Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mapuj Xero ${categoryName} do`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Wybierz, gdzie zmapować ${categoryName} podczas eksportu do Xero.`,
            customers: 'Refakturuj klientów',
            customersDescription:
                'Wybierz, czy ponownie obciążać klientów w Expensify. Twoje kontakty klientów z Xero mogą być przypisywane do wydatków i zostaną wyeksportowane do Xero jako faktura sprzedaży.',
            taxesDescription: 'Wybierz sposób obsługi podatków Xero w Expensify.',
            notImported: 'Nie zaimportowano',
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
            exportExpensesDescription: 'Raporty zostaną wyeksportowane jako faktura zakupu z datą i statusem wybranymi poniżej.',
            purchaseBillDate: 'Data zakupu rachunku',
            exportInvoices: 'Eksportuj faktury jako',
            salesInvoice: 'Faktura sprzedażowa',
            exportInvoicesDescription: 'Na fakturach sprzedaży zawsze wyświetlana jest data wysłania faktury.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Xero każdego dnia.',
                purchaseBillStatusTitle: 'Status rachunku zakupu',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na wskazanym poniżej koncie Xero.',
                xeroBillPaymentAccount: 'Konto do płatności rachunków w Xero',
                xeroInvoiceCollectionAccount: 'Konto windykacji faktur Xero',
                xeroBillPaymentAccountDescription: 'Wybierz, z którego konta opłacać rachunki, a my utworzymy płatność w Xero.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie chcesz otrzymywać płatności faktur, a my utworzymy płatność w Xero.',
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
                        description: 'Data przesłania raportu do zatwierdzenia.',
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
            noAccountsFoundDescription: 'Dodaj konto w Xero i zsynchronizuj połączenie ponownie',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy wyeksportować wydatki:',
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
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Ustaw domyślnego dostawcę, który będzie stosowany do ${isReimbursable ? '' : 'nie-'}wydatków podlegających zwrotowi, które nie mają pasującego dostawcy w Sage Intacct.`,
            exportDescription: 'Skonfiguruj sposób eksportu danych Expensify do Sage Intacct.',
            exportPreferredExporterNote:
                'Preferowanym eksporterem może być dowolny administrator przestrzeni roboczej, ale musi on również być Administratorem domeny, jeśli ustawisz różne konta eksportu dla poszczególnych kart firmowych w Ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy w swoim koncie raporty do wyeksportowania.',
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: `Dodaj proszę konto w Sage Intacct i ponownie zsynchronizuj połączenie`,
            autoSync: 'Automatyczna synchronizacja',
            autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Sage Intacct każdego dnia.',
            inviteEmployees: 'Zaproś pracowników',
            inviteEmployeesDescription:
                'Zaimportuj rekordy pracowników z Sage Intacct i zaproś pracowników do tego workspace’u. Twój przepływ akceptacji domyślnie będzie oparty na akceptacji przez menedżera i może zostać dalej skonfigurowany na stronie „Członkowie”.',
            syncReimbursedReports: 'Synchronizuj rozliczone raporty',
            syncReimbursedReportsDescription:
                'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Sage Intacct.',
            paymentAccount: 'Konto płatnicze Sage Intacct',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy wyeksportować wydatki:',
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
            subsidiarySelectDescription: 'Wybierz jednostkę zależną w NetSuite, z której chcesz zaimportować dane.',
            exportDescription: 'Skonfiguruj sposób eksportu danych Expensify do NetSuite.',
            exportInvoices: 'Eksportuj faktury do',
            journalEntriesTaxPostingAccount: 'Konto księgowania podatku zapisów w dzienniku',
            journalEntriesProvTaxPostingAccount: 'Konto księgowania podatku prowincjonalnego w dzienniku',
            foreignCurrencyAmount: 'Eksportuj kwotę w walucie obcej',
            exportToNextOpenPeriod: 'Eksportuj do następnego otwartego okresu',
            nonReimbursableJournalPostingAccount: 'Konto księgowania dziennika niepodlegające zwrotowi',
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
                        label: 'Utwórz dla mnie',
                        description: 'Utworzymy dla Ciebie „pozycję faktury Expensify” podczas eksportu (jeśli jeszcze nie istnieje).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Wybierz istniejące',
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
                        description: 'Data przesłania raportu do zatwierdzenia.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Raporty wydatków',
                        reimbursableDescription: 'Wydatki gotówkowe zostaną wyeksportowane do NetSuite jako raporty wydatków.',
                        nonReimbursableDescription: 'Wydatki z firmowych kart będą eksportowane do NetSuite jako raporty wydatków.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Rachunki od dostawców',
                        reimbursableDescription: dedent(`
                            Wydatki z własnej kieszeni zostaną wyeksportowane jako rachunki płatne na rzecz poniżej wskazanego dostawcy NetSuite.

                            Jeśli chcesz ustawić określonego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Wydatki z kart firmowych zostaną wyeksportowane jako rachunki płatne na rzecz dostawcy NetSuite określonego poniżej.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Zapisy w dzienniku',
                        reimbursableDescription: dedent(`
                            Wydatki z własnej kieszeni zostaną wyeksportowane jako zapisy w dzienniku do wskazanego poniżej konta NetSuite.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Firmowe karty*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Wydatki z kart firmowych zostaną wyeksportowane jako zapisy w dzienniku do wskazanego poniżej konta NetSuite.

                            Jeśli chcesz ustawić konkretnego dostawcę dla każdej karty, przejdź do *Ustawienia > Domeny > Karty firmowe*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Jeśli zmienisz ustawienie eksportu firmowej karty na raporty wydatków, dostawcy NetSuite i konta księgowań dla poszczególnych kart zostaną wyłączone.\n\nNie martw się, nadal zapiszemy Twoje wcześniejsze wybory, na wypadek gdybyś później chciał(a) wrócić do poprzednich ustawień.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z NetSuite każdego dnia.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport zostanie opłacony za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na koncie NetSuite poniżej.',
                reimbursementsAccount: 'Konto do zwrotów',
                reimbursementsAccountDescription: 'Wybierz konto bankowe, którego użyjesz do zwrotów kosztów, a my utworzymy powiązaną płatność w NetSuite.',
                collectionsAccount: 'Konto windykacyjne',
                collectionsAccountDescription: 'Gdy faktura zostanie oznaczona jako opłacona w Expensify i wyeksportowana do NetSuite, pojawi się na poniższym koncie.',
                approvalAccount: 'Konto zatwierdzania zobowiązań A/P',
                approvalAccountDescription:
                    'Wybierz konto, względem którego transakcje będą zatwierdzane w NetSuite. Jeśli synchronizujesz rozliczone raporty, będzie to również konto, względem którego tworzone będą płatności rachunków.',
                defaultApprovalAccount: 'Domyślne NetSuite',
                inviteEmployees: 'Zaproś pracowników i ustaw zatwierdzanie',
                inviteEmployeesDescription:
                    'Zaimportuj rekordy pracowników z NetSuite i zaproś pracowników do tego miejsca pracy. Domyślnym przepływem zatwierdzania będzie akceptacja przez menedżera i może on zostać dalej skonfigurowany na stronie *Członkowie*.',
                autoCreateEntities: 'Automatyczne tworzenie pracowników/dostawców',
                enableCategories: 'Włącz nowo zaimportowane kategorie',
                customFormID: 'Niestandardowy identyfikator formularza',
                customFormIDDescription:
                    'Domyślnie Expensify będzie tworzyć wpisy, używając preferowanego formularza transakcji ustawionego w NetSuite. Alternatywnie możesz wyznaczyć konkretny formularz transakcji, który ma być używany.',
                customFormIDReimbursable: 'Wydatek z własnej kieszeni',
                customFormIDNonReimbursable: 'Wydatek z karty służbowej',
                exportReportsTo: {
                    label: 'Poziom zatwierdzania raportu wydatków',
                    description:
                        'Po zatwierdzeniu raportu wydatków w Expensify i wyeksportowaniu go do NetSuite możesz ustawić w NetSuite dodatkowy poziom zatwierdzania przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Tylko zatwierdzone przez przełożonego',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Tylko zatwierdzone przez dział księgowości',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Zatwierdzone przez przełożonego i księgowość',
                    },
                },
                accountingMethods: {
                    label: 'Kiedy eksportować',
                    description: 'Wybierz, kiedy wyeksportować wydatki:',
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
                        'Gdy rachunek sprzedawcy zostanie zatwierdzony w Expensify i wyeksportowany do NetSuite, możesz ustawić w NetSuite dodatkowy poziom zatwierdzania przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zatwierdzono do opublikowania',
                    },
                },
                exportJournalsTo: {
                    label: 'Poziom zatwierdzania wpisu do dziennika',
                    description:
                        'Po zatwierdzeniu zapisu w dzienniku w Expensify i wyeksportowaniu go do NetSuite możesz ustawić dodatkowy poziom zatwierdzania w NetSuite przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Domyślne ustawienie NetSuite',
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
                        description: 'W NetSuite przejdź do *Setup > Company > Enable Features > SuiteCloud* > włącz *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Włącz usługi sieciowe SOAP',
                        description: 'W NetSuite przejdź do *Setup > Company > Enable Features > SuiteCloud* > włącz *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Utwórz token dostępu',
                        description:
                            'W NetSuite przejdź do *Setup > Users/Roles > Access Tokens* > utwórz token dostępu dla aplikacji „Expensify” oraz roli „Expensify Integration” lub „Administrator”.\n\n*Ważne:* Upewnij się, że zapiszesz *Token ID* i *Token Secret* z tego kroku. Będą one potrzebne w następnym kroku.',
                    },
                    enterCredentials: {
                        title: 'Wprowadź swoje dane logowania do NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'Identyfikator konta NetSuite',
                            netSuiteTokenID: 'Identyfikator tokena',
                            netSuiteTokenSecret: 'Sekret tokena',
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
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('i')}, ${importType}`,
                },
                importTaxDescription: 'Importuj grupy podatkowe z NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Wybierz jedną z poniższych opcji:',
                    label: ({importedTypes}: ImportedTypesParams) => `Zaimportowano jako ${importedTypes.join('i')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Wprowadź ${fieldName}`,
                    customSegments: {
                        title: 'Niestandardowe segmenty/rejestry',
                        addText: 'Dodaj niestandardowy segment/rekord',
                        recordTitle: 'Niestandardowy segment/rejestr',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Wyświetl szczegółowe instrukcje',
                        helpText: 'dotyczące konfigurowania niestandardowych segmentów/rejestrów.',
                        emptyTitle: 'Dodaj niestandardowy segment lub niestandardowy rekord',
                        fields: {
                            segmentName: 'Nazwa',
                            internalID: 'Wewnętrzny identyfikator',
                            scriptID: 'Identyfikator skryptu',
                            customRecordScriptID: 'Identyfikator kolumny transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń niestandardowy segment/rekord',
                        removePrompt: 'Czy na pewno chcesz usunąć ten niestandardowy segment/rejestr?',
                        addForm: {
                            customSegmentName: 'nazwa segmentu niestandardowego',
                            customRecordName: 'nazwa rekordu niestandardowego',
                            segmentTitle: 'Niestandardowy segment',
                            customSegmentAddTitle: 'Dodaj niestandardowy segment',
                            customRecordAddTitle: 'Dodaj niestandardowy rekord',
                            recordTitle: 'Niestandardowy rekord',
                            segmentRecordType: 'Czy chcesz dodać niestandardowy segment czy niestandardowy rekord?',
                            customSegmentNameTitle: 'Jaka jest nazwa niestandardowego segmentu?',
                            customRecordNameTitle: 'Jaka jest nazwa rekordu niestandardowego?',
                            customSegmentNameFooter: `Nazwy niestandardowych segmentów znajdziesz w NetSuite na stronie *Customizations > Links, Records & Fields > Custom Segments*.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Możesz znaleźć niestandardowe nazwy rekordów w NetSuite, wpisując „Transaction Column Field” w wyszukiwaniu globalnym.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Jaki jest identyfikator wewnętrzny?',
                            customSegmentInternalIDFooter: `Najpierw upewnij się, że włączyłeś(-aś) wewnętrzne ID w NetSuite w *Home > Set Preferences > Show Internal ID.*

Wewnętrzne ID niestandardowych segmentów możesz znaleźć w NetSuite w:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Kliknij wybrany niestandardowy segment.
3. Kliknij hiperłącze obok *Custom Record Type*.
4. Znajdź wewnętrzne ID w tabeli na dole.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Możesz znaleźć wewnętrzne ID niestandardowych rekordów w NetSuite, wykonując następujące kroki:

1. Wpisz „Transaction Line Fields” w wyszukiwaniu globalnym.
2. Kliknij niestandardowy rekord.
3. Znajdź wewnętrzne ID po lewej stronie.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Jaki jest identyfikator skryptu?',
                            customSegmentScriptIDFooter: `Identyfikatory skryptów segmentów niestandardowych można znaleźć w NetSuite w:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Kliknij wybrany segment niestandardowy.
3. Kliknij kartę *Application and Sourcing* na dole, a następnie:
    a. Jeśli chcesz wyświetlać segment niestandardowy jako *tag* (na poziomie pozycji) w Expensify, kliknij podkartę *Transaction Columns* i użyj *Field ID*.
    b. Jeśli chcesz wyświetlać segment niestandardowy jako *report field* (na poziomie raportu) w Expensify, kliknij podkartę *Transactions* i użyj *Field ID*.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Jaki jest identyfikator kolumny transakcji?',
                            customRecordScriptIDFooter: `Możesz znaleźć niestandardowe identyfikatory skryptów rekordów (script ID) w NetSuite w następujący sposób:

1. Wpisz „Transaction Line Fields” w wyszukiwaniu globalnym.
2. Kliknij, aby otworzyć niestandardowy rekord.
3. Znajdź script ID po lewej stronie.

_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'W jaki sposób ten niestandardowy segment powinien być wyświetlany w Expensify?',
                            customRecordMappingTitle: 'W jaki sposób ten niestandardowy rekord powinien być wyświetlany w Expensify?',
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
                        helpLinkText: 'Wyświetl szczegółowe instrukcje',
                        helpText: 'dotyczące konfigurowania list niestandardowych.',
                        emptyTitle: 'Dodaj listę niestandardową',
                        fields: {
                            listName: 'Nazwa',
                            internalID: 'Wewnętrzny identyfikator',
                            transactionFieldID: 'ID pola transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń listę niestandardową',
                        removePrompt: 'Czy na pewno chcesz usunąć tę listę niestandardową?',
                        addForm: {
                            listNameTitle: 'Wybierz listę niestandardową',
                            transactionFieldIDTitle: 'Jaki jest identyfikator pola transakcji?',
                            transactionFieldIDFooter: `Możesz znaleźć identyfikatory pól transakcji w NetSuite, wykonując następujące kroki:

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
                        label: 'Domyślne ustawienia pracownika NetSuite',
                        description: 'Nie zaimportowano do Expensify, zastosowano przy eksporcie',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Jeśli używasz ${importField} w NetSuite, zastosujemy domyślną wartość ustawioną w rekordzie pracownika podczas eksportu do Expense Report lub Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tagi',
                        description: 'Na poziomie pozycji',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} będzie można wybrać dla każdego poszczególnego wydatku w raporcie pracownika.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Pola raportu',
                        description: 'Poziom raportu',
                        footerContent: ({importField}: ImportFieldParams) => `Wybór ${startCase(importField)} zostanie zastosowany do wszystkich wydatków w raporcie pracownika.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Konfiguracja Sage Intacct',
            prerequisitesTitle: 'Zanim się połączysz...',
            downloadExpensifyPackage: 'Pobierz pakiet Expensify dla Sage Intacct',
            followSteps: 'Postępuj zgodnie z krokami zawartymi w naszych instrukcjach „How-to: Connect to Sage Intacct”',
            enterCredentials: 'Wprowadź swoje dane logowania do Sage Intacct',
            entity: 'Podmiot',
            employeeDefault: 'Domyślne ustawienie pracownika Sage Intacct',
            employeeDefaultDescription: 'Domyślny dział pracownika zostanie zastosowany do jego wydatków w Sage Intacct, jeśli taki istnieje.',
            displayedAsTagDescription: 'Dział będzie można wybrać osobno dla każdego wydatku w raporcie pracownika.',
            displayedAsReportFieldDescription: 'Wybór działu zostanie zastosowany do wszystkich wydatków w raporcie pracownika.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wybierz, jak obsługiwać Sage Intacct <strong>${mappingTitle}</strong> w Expensify.`,
            expenseTypes: 'Typy wydatków',
            expenseTypesDescription: 'Twoje typy wydatków z Sage Intacct zostaną zaimportowane do Expensify jako kategorie.',
            accountTypesDescription: 'Twój plan kont Sage Intacct zostanie zaimportowany do Expensify jako kategorie.',
            importTaxDescription: 'Importuj stawkę podatku od zakupu z Sage Intacct.',
            userDefinedDimensions: 'Wymiary zdefiniowane przez użytkownika',
            addUserDefinedDimension: 'Dodaj wymiar zdefiniowany przez użytkownika',
            integrationName: 'Nazwa integracji',
            dimensionExists: 'Wymiar o tej nazwie już istnieje.',
            removeDimension: 'Usuń zdefiniowany przez użytkownika wymiar',
            removeDimensionPrompt: 'Czy na pewno chcesz usunąć ten zdefiniowany przez użytkownika wymiar?',
            userDefinedDimension: 'Wymiar zdefiniowany przez użytkownika',
            addAUserDefinedDimension: 'Dodaj wymiar zdefiniowany przez użytkownika',
            detailedInstructionsLink: 'Wyświetl szczegółowe instrukcje',
            detailedInstructionsRestOfSentence: 'podczas dodawania własnych wymiarów użytkownika.',
            userDimensionsAdded: () => ({
                one: 'Dodano 1 UDD',
                other: (count: number) => `Dodano ${count} UDDs`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'działy';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'Klasy';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'Lokalizacje';
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
            control: 'Kontrola',
            collect: 'Zbierz',
        },
        companyCards: {
            addCards: 'Dodaj karty',
            selectCards: 'Wybierz karty',
            addNewCard: {
                other: 'Inne',
                cardProviders: {
                    gl1025: 'Karty korporacyjne American Express',
                    cdf: 'Karty komercyjne Mastercard',
                    vcf: 'Karty komercyjne Visa',
                    stripe: 'Karty Stripe',
                },
                yourCardProvider: `Kto jest wystawcą Twojej karty?`,
                whoIsYourBankAccount: 'Jaki jest Twój bank?',
                whereIsYourBankLocated: 'Gdzie znajduje się Twój bank?',
                howDoYouWantToConnect: 'Jak chcesz połączyć się ze swoim bankiem?',
                learnMoreAboutOptions: `<muted-text>Dowiedz się więcej o tych <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opcjach</a>.</muted-text>`,
                commercialFeedDetails: 'Wymaga konfiguracji z Twoim bankiem. Zwykle korzystają z tego większe firmy i często jest to najlepsza opcja, jeśli się kwalifikujesz.',
                commercialFeedPlaidDetails: `Wymaga konfiguracji z Twoim bankiem, ale przeprowadzimy Cię przez ten proces. Zazwyczaj jest to dostępne tylko dla większych firm.`,
                directFeedDetails: 'Najprostsze podejście. Połącz się od razu, używając swoich głównych danych logowania. Ta metoda jest najczęściej stosowana.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Włącz swój kanał ${provider}`,
                    heading:
                        'Mamy bezpośrednią integrację z Twoim wystawcą karty i możemy szybko oraz dokładnie zaimportować dane o Twoich transakcjach do Expensify.\n\nAby rozpocząć, po prostu:',
                    visa: 'Mamy globalne integracje z Visa, choć kwalifikowalność zależy od banku i programu karty.\n\nAby rozpocząć, po prostu:',
                    mastercard: 'Mamy globalne integracje z Mastercard, jednak dostępność zależy od banku i programu karty.\n\nAby rozpocząć, po prostu:',
                    vcf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby uzyskać szczegółowe instrukcje dotyczące konfiguracji kart Visa Commercial.

2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby potwierdzić, że obsługuje on komercyjny kanał danych dla Twojego programu, i poproś o jego włączenie.

3. *Gdy kanał zostanie włączony i będziesz mieć jego szczegóły, przejdź do następnego ekranu.*`,
                    gl1025: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), aby sprawdzić, czy American Express może włączyć komercyjny kanał dla Twojego programu.

2. Gdy kanał zostanie włączony, Amex wyśle Ci list produkcyjny.

3. *Gdy masz już informacje o kanale, przejdź do następnego ekranu.*`,
                    cdf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby uzyskać szczegółowe instrukcje dotyczące konfiguracji kart Mastercard Commercial Cards.

2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby potwierdzić, że obsługuje on komercyjny kanał danych dla Twojego programu, i poproś o jego włączenie.

3. *Gdy kanał danych zostanie włączony i będziesz mieć jego szczegóły, przejdź do następnego ekranu.*`,
                    stripe: `1. Odwiedź pulpit Stripe i przejdź do [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. W sekcji Product Integrations kliknij Enable obok Expensify.

3. Gdy kanał zostanie włączony, kliknij poniżej Submit, a my zajmiemy się jego dodaniem.`,
                },
                whatBankIssuesCard: 'Kto wydaje te karty?',
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
                        title: `Jaki jest identyfikator dystrybucji Mastercard?`,
                        distributionLabel: 'Identyfikator dystrybucji',
                        helpLabel: 'Gdzie znajdę identyfikator dystrybucji?',
                    },
                },
                amexCorporate: 'Wybierz tę opcję, jeśli na przodzie Twoich kart widnieje napis „Corporate”',
                amexBusiness: 'Wybierz tę opcję, jeśli na przodzie Twojej karty widnieje napis „Business”',
                amexPersonal: 'Wybierz tę opcję, jeśli Twoje karty są prywatne',
                error: {
                    pleaseSelectProvider: 'Wybierz dostawcę karty przed kontynuowaniem',
                    pleaseSelectBankAccount: 'Wybierz konto bankowe przed kontynuowaniem',
                    pleaseSelectBank: 'Proszę wybrać bank przed kontynuowaniem',
                    pleaseSelectCountry: 'Wybierz kraj przed kontynuowaniem',
                    pleaseSelectFeedType: 'Wybierz typ kanału przed kontynuowaniem',
                },
                exitModal: {
                    title: 'Coś nie działa?',
                    prompt: 'Zauważyliśmy, że nie dokończyłeś dodawania swoich kart. Jeśli napotkasz jakiś problem, daj nam znać, abyśmy mogli pomóc przywrócić wszystko na właściwe tory.',
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
            feedName: ({feedName}: CompanyCardFeedNameParams) => `Karty ${feedName}`,
            directFeed: 'Bezpośredni kanał',
            whoNeedsCardAssigned: 'Kto potrzebuje przypisanej karty?',
            chooseCard: 'Wybierz kartę',
            chooseCardFor: ({assignee}: AssigneeParams) =>
                `Wybierz kartę dla <strong>${assignee}</strong>. Nie możesz znaleźć karty, której szukasz? <concierge-link>Daj nam znać.</concierge-link>`,
            noActiveCards: 'Brak aktywnych kart w tym kanale',
            somethingMightBeBroken:
                '<muted-text><centered-text>Albo coś może być zepsute. Tak czy inaczej, jeśli masz jakieś pytania, po prostu <concierge-link>skontaktuj się z Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wybierz datę początkową transakcji',
            startDateDescription: 'Zaimportujemy wszystkie transakcje od tej daty. Jeśli nie określono daty, sięgniemy tak daleko wstecz, jak pozwala na to Twój bank.',
            fromTheBeginning: 'Od początku',
            customStartDate: 'Niestandardowa data rozpoczęcia',
            customCloseDate: 'Niestandardowa data zamknięcia',
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
            confirmationDescription: 'Natychmiast rozpoczniemy importowanie transakcji.',
            cardholder: 'Posiadacz karty',
            card: 'Karta',
            cardName: 'Nazwa karty',
            brokenConnectionError: '<rbr>Połączenie z kartą zostało przerwane. Proszę <a href="#">zalogować się do swojego banku</a>, abyśmy mogli ponownie nawiązać połączenie.</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `przypisał(a) ${assignee} ${link}! Zaimportowane transakcje pojawią się w tym czacie.`,
            companyCard: 'karta firmowa',
            chooseCardFeed: 'Wybierz źródło karty',
            ukRegulation:
                'Expensify Limited jest agentem Plaid Financial Ltd., autoryzowanej instytucji płatniczej regulowanej przez Financial Conduct Authority na mocy Payment Services Regulations 2017 (Numer Referencyjny Firmy: 804718). Plaid świadczy Ci regulowane usługi dostępu do informacji o rachunku za pośrednictwem Expensify Limited jako swojego agenta.',
        },
        expensifyCard: {
            issueAndManageCards: 'Wydawaj i zarządzaj swoimi kartami Expensify',
            getStartedIssuing: 'Zacznij, wydając swoją pierwszą wirtualną lub fizyczną kartę.',
            verificationInProgress: 'Trwa weryfikacja...',
            verifyingTheDetails: 'Weryfikujemy kilka szczegółów. Concierge poinformuje Cię, gdy karty Expensify będą gotowe do wydania.',
            disclaimer:
                'Karta Expensify Visa® Commercial jest wydawana przez The Bancorp Bank, N.A., członka FDIC, na podstawie licencji Visa U.S.A. Inc. i może nie być akceptowana u wszystkich sprzedawców honorujących karty Visa. Apple® i logo Apple® są znakami towarowymi Apple Inc., zarejestrowanymi w USA i innych krajach. App Store jest znakiem usługowym Apple Inc. Google Play i logo Google Play są znakami towarowymi Google LLC.',
            euUkDisclaimer:
                'Karty udostępniane rezydentom EOG są wydawane przez Transact Payments Malta Limited, a karty udostępniane rezydentom Wielkiej Brytanii są wydawane przez Transact Payments Limited na podstawie licencji udzielonej przez Visa Europe Limited. Transact Payments Malta Limited jest należycie upoważniona i regulowana przez Malta Financial Services Authority jako Instytucja Finansowa na mocy ustawy Financial Institution Act z 1994 roku. Numer rejestracyjny C 91879. Transact Payments Limited jest upoważniona i regulowana przez Gibraltar Financial Service Commission.',
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
            requestLimitIncrease: 'Zwiększenie limitu żądań',
            remainingLimitDescription:
                'Bierzemy pod uwagę kilka czynników przy obliczaniu Twojego pozostałego limitu: staż jako klient, informacje biznesowe podane podczas rejestracji oraz dostępne środki na firmowym rachunku bankowym. Twój pozostały limit może zmieniać się każdego dnia.',
            earnedCashback: 'Zwrot gotówki',
            earnedCashbackDescription: 'Saldo zwrotu gotówki jest obliczany na podstawie rozliczonych miesięcznych wydatków kartą Expensify w całej Twojej przestrzeni roboczej.',
            issueNewCard: 'Wydaj nową kartę',
            finishSetup: 'Zakończ konfigurację',
            chooseBankAccount: 'Wybierz konto bankowe',
            chooseExistingBank: 'Wybierz istniejące firmowe konto bankowe, aby spłacić saldo karty Expensify, lub dodaj nowe konto bankowe',
            accountEndingIn: 'Konto kończące się na',
            addNewBankAccount: 'Dodaj nowe konto bankowe',
            settlementAccount: 'Konto rozliczeniowe',
            settlementAccountDescription: 'Wybierz konto, z którego chcesz spłacić saldo karty Expensify.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Upewnij się, że to konto jest zgodne z Twoim <a href="${reconciliationAccountSettingsLink}">kontem uzgadniającym</a> (${accountNumber}), aby Ciągłe uzgadnianie działało prawidłowo.`,
            settlementFrequency: 'Częstotliwość rozliczeń',
            settlementFrequencyDescription: 'Wybierz, jak często będziesz spłacać saldo swojej karty Expensify.',
            settlementFrequencyInfo: 'Jeśli chcesz przejść na miesięczne rozliczenie, musisz połączyć swoje konto bankowe przez Plaid i mieć dodatnią historię salda z ostatnich 90 dni.',
            frequency: {
                daily: 'Codziennie',
                monthly: 'Miesięcznie',
            },
            cardDetails: 'Dane karty',
            cardPending: ({name}: {name: string}) => `Karta jest obecnie w oczekiwaniu i zostanie wydana po zweryfikowaniu konta użytkownika ${name}.`,
            virtual: 'Wirtualny',
            physical: 'Fizyczne',
            deactivate: 'Dezaktywuj kartę',
            changeCardLimit: 'Zmień limit karty',
            changeLimit: 'Zmień limit',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane, dopóki nie zatwierdzisz kolejnych wydatków na tej karcie.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane do następnego miesiąca.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje zostaną odrzucone.`,
            changeCardLimitType: 'Zmień typ limitu karty',
            changeLimitType: 'Zmień typ limitu',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Jeśli zmienisz typ limitu tej karty na Smart Limit, nowe transakcje zostaną odrzucone, ponieważ niezatwierdzony limit ${limit} został już osiągnięty.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Jeśli zmienisz typ limitu tej karty na miesięczny, nowe transakcje zostaną odrzucone, ponieważ miesięczny limit ${limit} został już osiągnięty.`,
            addShippingDetails: 'Dodaj szczegóły wysyłki',
            issuedCard: ({assignee}: AssigneeParams) => `wydano ${assignee} kartę Expensify! Karta dotrze w ciągu 2–3 dni roboczych.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `przyznał(-a) użytkownikowi ${assignee} kartę Expensify! Karta zostanie wysłana po potwierdzeniu danych wysyłki.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `wydano ${assignee} wirtualną kartę Expensify! ${link} może być użyty od razu.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} dodał(-a) dane wysyłki. Karta Expensify dotrze w ciągu 2–3 dni roboczych.`,
            replacedCard: ({assignee}: AssigneeParams) => `${assignee} wymienił(-a) swoją kartę Expensify. Nowa karta dotrze w ciągu 2–3 dni roboczych.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} wymienił(-a) swoją wirtualną kartę Expensify! ${link} można używać od razu.`,
            card: 'karta',
            replacementCard: 'Karta zastępcza',
            verifyingHeader: 'Weryfikowanie',
            bankAccountVerifiedHeader: 'Konto bankowe zweryfikowane',
            verifyingBankAccount: 'Weryfikowanie konta bankowego...',
            verifyingBankAccountDescription: 'Proszę czekać, aż potwierdzimy, że to konto może być użyte do wydawania kart Expensify.',
            bankAccountVerified: 'Konto bankowe zostało zweryfikowane!',
            bankAccountVerifiedDescription: 'Możesz teraz wydawać karty Expensify członkom swojego obszaru roboczego.',
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
            spendCategoriesDescription: 'Dostosuj sposób kategoryzowania wydatków według sprzedawców dla transakcji kartą kredytową i zeskanowanych paragonów.',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania kategorii, spróbuj ponownie',
            categoryName: 'Nazwa kategorii',
            requiresCategory: 'Członkowie muszą kategoryzować wszystkie wydatki',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Wszystkie wydatki muszą zostać skategoryzowane, aby można je było wyeksportować do ${connectionName}.`,
            subtitle: 'Uzyskaj lepszy wgląd w to, na co wydawane są pieniądze. Skorzystaj z naszych domyślnych kategorii lub dodaj własne.',
            emptyCategories: {
                title: 'Nie utworzyłeś jeszcze żadnych kategorii',
                subtitle: 'Dodaj kategorię, aby uporządkować swoje wydatki.',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Twoje kategorie są obecnie importowane z połączenia księgowego. Przejdź do <a href="${accountingPageURL}">księgowości</a>, aby wprowadzić zmiany.</centered-text></muted-text>`,
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
                description: `Co najmniej jedna kategoria musi pozostać włączona, ponieważ w Twoim workspace kategorie są wymagane.`,
            },
        },
        moreFeatures: {
            subtitle: 'Użyj przełączników poniżej, aby włączać kolejne funkcje w miarę rozwoju. Każda funkcja pojawi się w menu nawigacyjnym, aby można ją było dalej dostosować.',
            spendSection: {
                title: 'Wydatki',
                subtitle: 'Włącz funkcje, które pomogą Ci skalować Twój zespół.',
            },
            manageSection: {
                title: 'Zarządzaj',
                subtitle: 'Dodaj kontrolki, które pomogą utrzymać wydatki w ramach budżetu.',
            },
            earnSection: {
                title: 'Zdobywaj',
                subtitle: 'Usprawnij swoje przychody i otrzymuj płatności szybciej.',
            },
            organizeSection: {
                title: 'Organizuj',
                subtitle: 'Grupuj i analizuj wydatki, zapisuj każdy zapłacony podatek.',
            },
            integrateSection: {
                title: 'Zintegruj',
                subtitle: 'Połącz Expensify z popularnymi produktami finansowymi.',
            },
            distanceRates: {
                title: 'Stawki za przejazd',
                subtitle: 'Dodawaj, aktualizuj i egzekwuj stawki.',
            },
            perDiem: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki ryczałtowe, aby kontrolować dzienne wydatki pracowników.',
            },
            expensifyCard: {
                title: 'Karta Expensify',
                subtitle: 'Zyskaj wgląd i kontrolę nad wydatkami.',
                disableCardTitle: 'Wyłącz kartę Expensify',
                disableCardPrompt: 'Nie możesz wyłączyć karty Expensify, ponieważ jest już w użyciu. Skontaktuj się z Concierge, aby poznać kolejne kroki.',
                disableCardButton: 'Czat z Concierge',
                feed: {
                    title: 'Zdobądź kartę Expensify',
                    subTitle: 'Usprawnij zarządzanie wydatkami firmowymi i zaoszczędź do 50% na swoim rachunku Expensify, a także:',
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
                subtitle: 'Importuj wydatki z istniejących kart firmowych.',
                feed: {
                    title: 'Zaimportuj karty firmowe',
                    features: {
                        support: 'Obsługa wszystkich głównych dostawców kart',
                        assignCards: 'Przypisz karty do całego zespołu',
                        automaticImport: 'Automatyczny import transakcji',
                    },
                },
                bankConnectionError: 'Problem z połączeniem bankowym',
                connectWithPlaid: 'Połącz przez Plaid',
                connectWithExpensifyCard: 'wypróbuj kartę Expensify.',
                bankConnectionDescription: `Spróbuj dodać swoje karty jeszcze raz. W przeciwnym razie możesz`,
                disableCardTitle: 'Wyłącz firmowe karty',
                disableCardPrompt: 'Nie możesz wyłączyć kart firmowych, ponieważ ta funkcja jest aktualnie używana. Skontaktuj się z Concierge, aby poznać dalsze kroki.',
                disableCardButton: 'Czat z Concierge',
                cardDetails: 'Dane karty',
                cardNumber: 'Numer karty',
                cardholder: 'Posiadacz karty',
                cardName: 'Nazwa karty',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `Eksport ${integration} ${type.toLowerCase()}` : `${integration} eksport`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Wybierz konto ${integration}, do którego mają być eksportowane transakcje.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Wybierz konto ${integration}, do którego mają być eksportowane transakcje. Wybierz inną <a href="${exportPageLink}">opcję eksportu</a>, aby zmienić dostępne konta.`,
                lastUpdated: 'Ostatnio zaktualizowano',
                transactionStartDate: 'Data początkowa transakcji',
                updateCard: 'Zaktualizuj kartę',
                unassignCard: 'Cofnij przypisanie karty',
                unassign: 'Cofnij przypisanie',
                unassignCardDescription: 'Usunięcie przypisania tej karty spowoduje usunięcie wszystkich transakcji na raportach roboczych z konta posiadacza karty.',
                assignCard: 'Przypisz kartę',
                cardFeedName: 'Nazwa źródła karty',
                cardFeedNameDescription: 'Nadaj kanałowi karty unikalną nazwę, abyś mógł odróżnić go od innych.',
                cardFeedTransaction: 'Usuń transakcje',
                cardFeedTransactionDescription: 'Wybierz, czy posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą podlegać tym zasadom.',
                cardFeedRestrictDeletingTransaction: 'Ogranicz usuwanie transakcji',
                cardFeedAllowDeletingTransaction: 'Zezwól na usuwanie transakcji',
                removeCardFeed: 'Usuń źródło karty',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Usuń kanał ${feedName}`,
                removeCardFeedDescription: 'Czy na pewno chcesz usunąć ten kanał kart? Spowoduje to odpięcie wszystkich kart.',
                error: {
                    feedNameRequired: 'Nazwa źródła karty jest wymagana',
                    statementCloseDateRequired: 'Wybierz datę zamknięcia wyciągu.',
                },
                corporate: 'Ogranicz usuwanie transakcji',
                personal: 'Zezwól na usuwanie transakcji',
                setFeedNameDescription: 'Nadaj kanałowi karty unikalną nazwę, abyś mógł odróżnić go od pozostałych',
                setTransactionLiabilityDescription: 'Po włączeniu posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą przestrzegały tej reguły.',
                emptyAddedFeedTitle: 'Przypisz firmowe karty',
                emptyAddedFeedDescription: 'Zacznij od przypisania swojej pierwszej karty członkowi.',
                pendingFeedTitle: `Przeglądamy Twoje zgłoszenie…`,
                pendingFeedDescription: `Obecnie sprawdzamy szczegóły Twojego kanału. Gdy to zakończymy, skontaktujemy się z Tobą przez`,
                pendingBankTitle: 'Sprawdź okno przeglądarki',
                pendingBankDescription: ({bankName}: CompanyCardBankName) => `Połącz się z ${bankName} w oknie przeglądarki, które właśnie się otworzyło. Jeśli żadne się nie otworzyło,`,
                pendingBankLink: 'kliknij tutaj',
                giveItNameInstruction: 'Nadaj karcie nazwę, która wyróżni ją spośród innych.',
                updating: 'Aktualizowanie...',
                noAccountsFound: 'Nie znaleziono kont',
                defaultCard: 'Domyślna karta',
                downgradeTitle: `Nie można obniżyć poziomu miejsca pracy`,
                downgradeSubTitle: `Nie można obniżyć poziomu tego obszaru roboczego, ponieważ podłączonych jest wiele źródeł kart (z wyłączeniem kart Expensify). Aby kontynuować, prosimy <a href="#">pozostawić tylko jedno źródło kart</a>.`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Dodaj konto w ${connection} i zsynchronizuj połączenie ponownie`,
                expensifyCardBannerTitle: 'Zdobądź kartę Expensify',
                expensifyCardBannerSubtitle:
                    'Ciesz się zwrotem gotówki za każdy zakup w USA, rabatem do 50% na swój rachunek Expensify, nielimitowanymi kartami wirtualnymi i wieloma innymi korzyściami.',
                expensifyCardBannerLearnMoreButton: 'Dowiedz się więcej',
                statementCloseDateTitle: 'Data zamknięcia zestawienia',
                statementCloseDateDescription: 'Daj nam znać, kiedy zamknięty zostanie wyciąg z Twojej karty, a utworzymy pasujący wyciąg w Expensify.',
            },
            workflows: {
                title: 'Przepływy pracy',
                subtitle: 'Skonfiguruj sposób zatwierdzania i opłacania wydatków.',
                disableApprovalPrompt:
                    'Karty Expensify w tym obszarze roboczym obecnie polegają na zatwierdzaniu w celu określenia swoich Smart Limits. Zmień typy limitów wszystkich Kart Expensify z włączonymi Smart Limits przed wyłączeniem zatwierdzania.',
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
                subtitle: 'Udokumentuj i odzyskaj kwalifikujące się podatki.',
            },
            reportFields: {
                title: 'Pola raportu',
                subtitle: 'Skonfiguruj pola niestandardowe dla wydatków.',
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
                disconnectText: 'Aby wyłączyć księgowość, musisz odłączyć swoje połączenie księgowe od przestrzeni roboczej.',
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
                    'Karty Expensify w tym obszarze roboczym opierają się na obiegach zatwierdzania, aby określać ich Smart Limits.\n\nPrzed wyłączeniem obiegów pracy zmień typy limitów dla wszystkich kart z włączonymi Smart Limits.',
                confirmText: 'Przejdź do Expensify Cards',
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
            customNameDescription: `Wybierz własną nazwę dla raportów wydatków, korzystając z naszych <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">zaawansowanych formuł</a>.`,
            customNameInputLabel: 'Nazwa',
            customNameEmailPhoneExample: 'Adres e-mail lub telefon członka: {report:submit:from}',
            customNameStartDateExample: 'Data początkowa raportu: {report:startdate}',
            customNameWorkspaceNameExample: 'Nazwa obszaru roboczego: {report:workspacename}',
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
                subtitle: 'Dodaj niestandardowe pole (tekstowe, daty lub listy rozwijanej), które pojawi się w raportach.',
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
            typeInputSubtitle: 'Wybierz, jakiego typu pola raportu użyć.',
            initialValueInputSubtitle: 'Wprowadź wartość początkową, która ma być wyświetlana w polu raportu.',
            listValuesInputSubtitle: 'Te wartości pojawią się w rozwijanym polu raportu. Włączone wartości mogą być wybierane przez członków.',
            listInputSubtitle: 'Te wartości pojawią się na liście pól raportu. Włączone wartości mogą być wybierane przez członków.',
            deleteValue: 'Usuń wartość',
            deleteValues: 'Usuń wartości',
            disableValue: 'Wyłącz wartość',
            disableValues: 'Wyłącz wartości',
            enableValue: 'Włącz wartość',
            enableValues: 'Włącz wartości',
            emptyReportFieldsValues: {
                title: 'Nie utworzyłeś żadnych wartości listy',
                subtitle: 'Dodaj własne wartości, które będą wyświetlane w raportach.',
            },
            deleteValuePrompt: 'Czy na pewno chcesz usunąć tę wartość listy?',
            deleteValuesPrompt: 'Czy na pewno chcesz usunąć te wartości listy?',
            listValueRequiredError: 'Wprowadź nazwę wartości z listy',
            existingListValueError: 'Wartość listy o tej nazwie już istnieje',
            editValue: 'Edytuj wartość',
            listValues: 'Lista wartości',
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
            requiresTag: 'Członkowie muszą oznaczać wszystkie wydatki',
            trackBillable: 'Śledź fakturowalne wydatki',
            customTagName: 'Niestandardowa nazwa tagu',
            enableTag: 'Włącz znacznik',
            enableTags: 'Włącz tagi',
            requireTag: 'Wymagany znacznik',
            requireTags: 'Wymagaj tagów',
            notRequireTags: 'Nie wymagaj',
            disableTag: 'Wyłącz znacznik',
            disableTags: 'Wyłącz tagi',
            addTag: 'Dodaj tag',
            editTag: 'Edytuj tag',
            editTags: 'Edytuj tagi',
            findTag: 'Znajdź tag',
            subtitle: 'Tagi dodają bardziej szczegółowe sposoby klasyfikowania kosztów.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text>Używasz <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">zależnych tagów</a>. Możesz <a href="${importSpreadsheetLink}">ponownie zaimportować arkusz kalkulacyjny</a>, aby zaktualizować swoje tagi.</muted-text>`,
            emptyTags: {
                title: 'Nie utworzono jeszcze żadnych tagów',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Dodaj tag, aby śledzić projekty, lokalizacje, działy i więcej.',
                subtitleHTML: `<muted-text><centered-text>Zaimportuj arkusz kalkulacyjny, aby dodać tagi do śledzenia projektów, lokalizacji, działów i nie tylko. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Dowiedz się więcej</a> o formatowaniu plików tagów.</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Twoje tagi są obecnie importowane z połączenia księgowego. Przejdź do <a href="${accountingPageURL}">księgowości</a>, aby wprowadzić zmiany.</centered-text></muted-text>`,
            },
            deleteTag: 'Usuń znacznik',
            deleteTags: 'Usuń tagi',
            deleteTagConfirmation: 'Czy na pewno chcesz usunąć ten tag?',
            deleteTagsConfirmation: 'Czy na pewno chcesz usunąć te tagi?',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania tagu, spróbuj ponownie',
            tagRequiredError: 'Wymagana jest nazwa tagu',
            existingTagError: 'Tag o tej nazwie już istnieje',
            invalidTagNameError: 'Nazwa tagu nie może być 0. Wybierz inną wartość.',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania tagu, spróbuj ponownie',
            importedFromAccountingSoftware: 'Poniższe tagi zostały zaimportowane z twojego',
            glCode: 'Kod księgi głównej',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu GL, spróbuj ponownie',
            tagRules: 'Reguły tagów',
            approverDescription: 'Aprobujący',
            importTags: 'Importuj tagi',
            importTagsSupportingText: 'Zakoduj swoje wydatki jednym typem tagu lub wieloma.',
            configureMultiLevelTags: 'Skonfiguruj swoją listę tagów do tagowania wielopoziomowego.',
            importMultiLevelTagsSupportingText: `Oto podgląd Twoich tagów. Jeśli wszystko wygląda dobrze, kliknij poniżej, aby je zaimportować.`,
            importMultiLevelTags: {
                firstRowTitle: 'Pierwszy wiersz jest tytułem dla każdej listy tagów',
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
                prompt2: 'Sugerujemy, abyś najpierw',
                prompt3: 'pobierz kopię zapasową',
                prompt4: 'poprzez wyeksportowanie swoich tagów.',
                prompt5: 'Dowiedz się więcej',
                prompt6: 'o poziomach tagów.',
            },
            overrideMultiTagWarning: {
                title: 'Importuj tagi',
                prompt1: 'Czy na pewno?',
                prompt2: 'Istniejące tagi zostaną nadpisane, ale możesz',
                prompt3: 'pobierz kopię zapasową',
                prompt4: 'pierwszy.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Znaleźliśmy *${columnCounts} kolumny* w Twoim arkuszu kalkulacyjnym. Wybierz *Name* obok kolumny, która zawiera nazwy tagów. Możesz także wybrać *Enabled* obok kolumny, która ustawia status tagów.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Nie można usunąć ani wyłączyć wszystkich tagów',
                description: `Co najmniej jeden znacznik musi pozostać włączony, ponieważ w Twoim obszarze roboczym znaczniki są wymagane.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Nie można ustawić wszystkich tagów jako opcjonalnych',
                description: `Co najmniej jeden znacznik musi pozostać wymagany, ponieważ ustawienia Twojego obszaru roboczego wymagają znaczników.`,
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
            taxReclaimableOn: 'Podlegające odzyskaniu podatki',
            taxRate: 'Stawka podatku',
            findTaxRate: 'Znajdź stawkę podatku',
            error: {
                taxRateAlreadyExists: 'Ta nazwa podatku jest już w użyciu',
                taxCodeAlreadyExists: 'Ten kod podatkowy jest już używany',
                valuePercentageRange: 'Wprowadź prawidłowy procent w przedziale od 0 do 100',
                customNameRequired: 'Wymagana jest niestandardowa nazwa podatku',
                deleteFailureMessage: 'Wystąpił błąd podczas usuwania stawki podatkowej. Spróbuj ponownie lub poproś Concierge o pomoc.',
                updateFailureMessage: 'Wystąpił błąd podczas aktualizowania stawki podatku. Spróbuj ponownie lub poproś Concierge o pomoc.',
                createFailureMessage: 'Wystąpił błąd podczas tworzenia stawki podatkowej. Spróbuj ponownie lub poproś Concierge o pomoc.',
                updateTaxClaimableFailureMessage: 'Zwrotna część musi być mniejsza niż kwota stawki za przejazd',
            },
            deleteTaxConfirmation: 'Czy na pewno chcesz usunąć ten podatek?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Czy na pewno chcesz usunąć ${taxAmount} podatki?`,
            actions: {
                delete: 'Usuń kurs',
                deleteMultiple: 'Usuń stawki',
                enable: 'Włącz stawkę',
                disable: 'Wyłącz stawkę',
                enableTaxRates: () => ({
                    one: 'Włącz stawkę',
                    other: 'Włącz stawki',
                }),
                disableTaxRates: () => ({
                    one: 'Wyłącz stawkę',
                    other: 'Wyłącz kursy',
                }),
            },
            importedFromAccountingSoftware: 'Poniższe podatki są importowane z Twojego',
            taxCode: 'Kod podatkowy',
            updateTaxCodeFailureMessage: 'Wystąpił błąd podczas aktualizowania kodu podatkowego, spróbuj ponownie',
        },
        duplicateWorkspace: {
            title: 'Nazwij swoje nowe środowisko pracy',
            selectFeatures: 'Wybierz funkcje do skopiowania',
            whichFeatures: 'Które funkcje chcesz skopiować do swojego nowego workspace?',
            confirmDuplicate: 'Czy chcesz kontynuować?',
            categories: 'kategorie i Twoje zasady automatycznej kategoryzacji',
            reimbursementAccount: 'konto zwrotu kosztów',
            welcomeNote: 'Proszę, zacznij używać mojej nowej przestrzeni roboczej',
            delayedSubmission: 'Opóźnione zgłoszenie',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Zaraz utworzysz i udostępnisz ${newWorkspaceName ?? ''} ${totalMembers ?? 0} członkom z oryginalnego przestrzeni roboczej.`,
            error: 'Wystąpił błąd podczas duplikowania Twojej nowej przestrzeni roboczej. Spróbuj ponownie.',
        },
        emptyWorkspace: {
            title: 'Nie masz żadnych przestrzeni roboczych',
            subtitle: 'Śledź paragony, rozliczaj wydatki, zarządzaj podróżami, wysyłaj faktury i nie tylko.',
            createAWorkspaceCTA: 'Rozpocznij',
            features: {
                trackAndCollect: 'Śledź i zbieraj paragony',
                reimbursements: 'Zwracaj wydatki pracownikom',
                companyCards: 'Zarządzaj firmowymi kartami',
            },
            notFound: 'Nie znaleziono żadnego miejsca pracy',
            description: 'Pokoje są świetnym miejscem do dyskusji i pracy z wieloma osobami. Aby rozpocząć współpracę, utwórz lub dołącz do przestrzeni roboczej',
        },
        new: {
            newWorkspace: 'Nowy workspace',
            getTheExpensifyCardAndMore: 'Zdobądź kartę Expensify i więcej',
            confirmWorkspace: 'Potwierdź przestrzeń roboczą',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Moja grupa – Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace użytkownika ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Wystąpił błąd podczas usuwania członka z przestrzeni roboczej, spróbuj ponownie',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Czy na pewno chcesz usunąć ${memberName}?`,
                other: 'Czy na pewno chcesz usunąć tych członków?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} jest osobą akceptującą w tym obszarze roboczym. Gdy przestaniesz udostępniać im ten obszar roboczy, zastąpimy ich w procesie akceptacji właścicielem obszaru roboczego, ${ownerName}`,
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
            makeAdmin: 'Uczyń administratorem',
            makeAuditor: 'Uczyń audytorem',
            selectAll: 'Zaznacz wszystko',
            error: {
                genericAdd: 'Wystąpił problem z dodaniem tego członka przestrzeni roboczej',
                cannotRemove: 'Nie możesz usunąć siebie ani właściciela przestrzeni roboczej',
                genericRemove: 'Wystąpił problem z usunięciem tego członka przestrzeni roboczej',
            },
            addedWithPrimary: 'Niektórzy członkowie zostali dodani przy użyciu swoich głównych loginów.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Dodano przez dodatkowy login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Łączna liczba członków przestrzeni roboczej: ${count}`,
            importMembers: 'Importuj członków',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${approver} z tego przestrzeni roboczej, zastąpimy go w przepływie zatwierdzania przez ${workspaceOwner}, właściciela przestrzeni roboczej.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} ma zaległe raporty wydatków do zatwierdzenia. Poproś tę osobę o ich zatwierdzenie lub przejmij kontrolę nad jej raportami, zanim usuniesz ją z przestrzeni roboczej.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Nie możesz usunąć użytkownika ${memberName} z tego obszaru roboczego. Ustaw nową osobę dokonującą zwrotów w Workflows > Dokonaj lub śledź płatności, a następnie spróbuj ponownie.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${memberName} z tego obszaru roboczego, zastąpimy go jako preferowanego eksportera użytkownikiem ${workspaceOwner}, właścicielem obszaru roboczego.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Jeśli usuniesz ${memberName} z tego obszaru roboczego, zastąpimy tę osobę jako kontakt techniczny użytkownikiem ${workspaceOwner}, właścicielem obszaru roboczego.`,
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
                physicalCardDescription: 'Świetne dla osób często wydających pieniądze',
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
                cardLimitError: 'Wprowadź kwotę mniejszą niż 21 474 836 USD',
                giveItName: 'Nadaj nazwę',
                giveItNameInstruction: 'Uczyń go na tyle unikalnym, aby można go było odróżnić od innych kart. Jeszcze lepiej, jeśli opiszesz konkretne przypadki użycia!',
                cardName: 'Nazwa karty',
                letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda poprawnie.',
                willBeReady: 'Ta karta będzie gotowa do użycia natychmiast.',
                cardholder: 'Posiadacz karty',
                cardType: 'Typ karty',
                limit: 'Limit',
                limitType: 'Typ limitu',
                name: 'Nazwa',
                disabledApprovalForSmartLimitError: 'Włącz najpierw zatwierdzanie w <strong>Workflows > Add approvals</strong>, zanim skonfigurujesz inteligentne limity',
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
            talkYourAccountManager: 'Porozmawiaj ze swoim opiekunem klienta.',
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
            errorODIntegration: ({oldDotPolicyConnectionsURL}: ErrorODIntegrationParams) =>
                `Wystąpił błąd z połączeniem skonfigurowanym w Expensify Classic. [Przejdź do Expensify Classic, aby rozwiązać ten problem.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Przejdź do Expensify Classic, aby zarządzać swoimi ustawieniami.',
            setup: 'Połącz',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Ostatnia synchronizacja: ${relativeDate}`,
            notSync: 'Nie zsynchronizowano',
            import: 'Import',
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
            connectTitle: ({connectionName}: ConnectionNameParams) => `Połącz ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integracja z księgowością'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Nie można połączyć się z QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Nie można połączyć z Xero';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Zaimportowano jako pola raportu',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Domyślne ustawienia pracownika NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'to połączenie';
                return `Czy na pewno chcesz odłączyć ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Czy na pewno chcesz połączyć ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'to połączenie z systemem księgowym'}? Spowoduje to usunięcie wszystkich istniejących połączeń księgowych.`,
            enterCredentials: 'Wprowadź swoje dane logowania',
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
                            return 'Importowanie polityki zapisywania';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Wciąż synchronizujemy dane z QuickBooks... Upewnij się, że Web Connector jest uruchomiony';
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
                            return 'Oczekiwanie na załadowanie importowanych danych';
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
                            return 'Importowanie danych jako pól raportu Expensify';
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
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Brak tłumaczenia dla etapu: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Preferowany eksporter',
            exportPreferredExporterNote:
                'Preferowanym eksporterem może być dowolny administrator przestrzeni roboczej, ale musi on również być Administratorem domeny, jeśli ustawisz różne konta eksportu dla poszczególnych kart firmowych w Ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy w swoim koncie raporty do wyeksportowania.',
            exportAs: 'Eksportuj jako',
            exportOutOfPocket: 'Eksportuj wydatki z własnej kieszeni jako',
            exportCompanyCard: 'Eksportuj wydatki z firmowej karty jako',
            exportDate: 'Data eksportu',
            defaultVendor: 'Domyślny dostawca',
            autoSync: 'Automatyczna synchronizacja',
            autoSyncDescription: 'Automatycznie synchronizuj NetSuite i Expensify każdego dnia. Eksportuj sfinalizowany raport w czasie rzeczywistym',
            reimbursedReports: 'Synchronizuj rozliczone raporty',
            cardReconciliation: 'Uzgadnianie karty',
            reconciliationAccount: 'Konto uzgadniające',
            continuousReconciliation: 'Ciągłe uzgadnianie',
            saveHoursOnReconciliation:
                'Oszczędzaj godziny przy uzgadnianiu kont w każdym okresie rozliczeniowym, pozwalając Expensify na ciągłe uzgadnianie wyciągów i rozliczeń karty Expensify Card w Twoim imieniu.',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>Aby włączyć Ciągłe Uzgadnianie, włącz <a href="${accountingAdvancedSettingsLink}">automatyczną synchronizację</a> dla ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wybierz konto bankowe, z którym będą uzgadniane płatności kartą Expensify.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Upewnij się, że to konto jest takie samo jak <a href="${settlementAccountUrl}">konto rozliczeniowe karty Expensify</a> (kończące się na ${lastFourPAN}), aby funkcja Ciągłego Uzgadniania działała prawidłowo.`,
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
                personal: 'Osobiste',
                business: 'Firma',
                chooseInvoiceMethod: 'Wybierz poniższą metodę płatności:',
                payingAsIndividual: 'Płatność jako osoba prywatna',
                payingAsBusiness: 'Płacenie jako firma',
            },
            invoiceBalance: 'Saldo faktury',
            invoiceBalanceSubtitle: 'To jest Twój bieżący saldo z pobierania płatności za faktury. Zostanie automatycznie przelane na Twoje konto bankowe, jeśli je dodałeś.',
            bankAccountsSubtitle: 'Dodaj konto bankowe, aby wysyłać i otrzymywać płatności za faktury.',
        },
        invite: {
            member: 'Zaproś członka',
            members: 'Zaproś członków',
            invitePeople: 'Zaproś nowych członków',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Spróbuj ponownie.',
            pleaseEnterValidLogin: `Upewnij się, że adres e‑mail lub numer telefonu jest poprawny (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'użytkownik',
            users: 'użytkownicy',
            invited: 'zaproszony',
            removed: 'Usunięto',
            to: 'do',
            from: 'od',
        },
        inviteMessage: {
            confirmDetails: 'Potwierdź szczegóły',
            inviteMessagePrompt: 'Uczyń swoje zaproszenie wyjątkowym, dodając poniżej wiadomość!',
            personalMessagePrompt: 'Wiadomość',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Spróbuj ponownie.',
            inviteNoMembersError: 'Wybierz co najmniej jednego członka do zaproszenia',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} poprosił o dołączenie do ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nie tak prędko...',
            workspaceNeeds: 'Miejsce pracy musi mieć włączoną co najmniej jedną stawkę za przejazd.',
            distance: 'Dystans',
            centrallyManage: 'Centralnie zarządzaj stawkami, śledź w milach lub kilometrach i ustaw domyślną kategorię.',
            rate: 'Oceń',
            addRate: 'Dodaj stawkę',
            findRate: 'Znajdź stawkę',
            trackTax: 'Śledź podatek',
            deleteRates: () => ({
                one: 'Usuń kurs',
                other: 'Usuń stawki',
            }),
            enableRates: () => ({
                one: 'Włącz stawkę',
                other: 'Włącz stawki',
            }),
            disableRates: () => ({
                one: 'Wyłącz stawkę',
                other: 'Wyłącz kursy',
            }),
            enableRate: 'Włącz stawkę',
            status: 'Status',
            unit: 'Jednostka',
            taxFeatureNotEnabledMessage:
                '<muted-text>Aby korzystać z tej funkcji, musisz włączyć podatki w przestrzeni roboczej. Przejdź do <a href="#">Więcej funkcji</a>, aby wprowadzić tę zmianę.</muted-text>',
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
            nameIsRequiredError: 'Będziesz musiał nadać swojej przestrzeni roboczej nazwę',
            currencyInputLabel: 'Domyślna waluta',
            currencyInputHelpText: 'Wszystkie wydatki w tym obszarze roboczym zostaną przeliczone na tę walutę.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `Domyślna waluta nie może zostać zmieniona, ponieważ ten obszar roboczy jest połączony z rachunkiem bankowym w ${currency}.`,
            save: 'Zapisz',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizowania przestrzeni roboczej. Spróbuj ponownie.',
            avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Spróbuj ponownie.',
            addressContext: 'Aby włączyć Expensify Travel, wymagany jest adres przestrzeni roboczej. Wprowadź adres powiązany z Twoją firmą.',
            policy: 'Polityka wydatków',
        },
        bankAccount: {
            continueWithSetup: 'Kontynuuj konfigurację',
            youAreAlmostDone: 'Prawie zakończyłeś konfigurowanie swojego konta bankowego, które pozwoli Ci wydawać karty firmowe, zwracać wydatki, zbierać faktury i opłacać rachunki.',
            streamlinePayments: 'Usprawnij płatności',
            connectBankAccountNote: 'Uwaga: Prywatne konta bankowe nie mogą być używane do płatności w przestrzeniach roboczych.',
            oneMoreThing: 'Jeszcze jedna rzecz!',
            allSet: 'Wszystko gotowe!',
            accountDescriptionWithCards: 'To konto bankowe będzie używane do wydawania kart firmowych, zwrotu wydatków, pobierania faktur i opłacania rachunków.',
            letsFinishInChat: 'Dokończmy to na czacie!',
            finishInChat: 'Dokończ na czacie',
            almostDone: 'Prawie gotowe!',
            disconnectBankAccount: 'Odłącz konto bankowe',
            startOver: 'Zacznij od nowa',
            updateDetails: 'Zaktualizuj szczegóły',
            yesDisconnectMyBankAccount: 'Tak, odłącz moje konto bankowe',
            yesStartOver: 'Tak, zacznij od nowa',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) =>
                `Odłącz swoje konto bankowe <strong>${bankName}</strong>. Wszystkie nierozliczone transakcje dla tego konta zostaną nadal zrealizowane.`,
            clearProgress: 'Rozpoczęcie od nowa spowoduje usunięcie postępu, który do tej pory osiągnąłeś.',
            areYouSure: 'Czy na pewno?',
            workspaceCurrency: 'Waluta przestrzeni roboczej',
            updateCurrencyPrompt:
                'Wygląda na to, że w Twojej przestrzeni roboczej jest obecnie ustawiona inna waluta niż USD. Kliknij poniższy przycisk, aby teraz zaktualizować swoją walutę na USD.',
            updateToUSD: 'Zaktualizuj na USD',
            updateWorkspaceCurrency: 'Zaktualizuj walutę przestrzeni roboczej',
            workspaceCurrencyNotSupported: 'Waluta przestrzeni roboczej nie jest obsługiwana',
            yourWorkspace: `Twoje środowisko pracy jest ustawione na nieobsługiwaną walutę. Zobacz <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">listę obsługiwanych walut</a>.`,
            chooseAnExisting: 'Wybierz istniejące konto bankowe, aby opłacić wydatki, lub dodaj nowe.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Przenieś właściciela',
            addPaymentCardTitle: 'Wprowadź swoją kartę płatniczą, aby przenieść własność',
            addPaymentCardButtonText: 'Zaakceptuj warunki i dodaj kartę płatniczą',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Przeczytaj i zaakceptuj <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">warunki</a> oraz <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">politykę prywatności</a>, aby dodać swoją kartę.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Zgodne z PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Szyfrowanie na poziomie bankowym',
            addPaymentCardRedundant: 'Nadmiarowa infrastruktura',
            addPaymentCardLearnMore: `<muted-text>Dowiedz się więcej o naszym <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">zabezpieczeniu</a>.</muted-text>`,
            amountOwedTitle: 'Zaległe saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Na tym koncie pozostało nieuregulowane saldo z poprzedniego miesiąca.\n\nCzy chcesz wyczyścić saldo i przejąć rozliczanie tego obszaru roboczego?',
            ownerOwesAmountTitle: 'Zaległe saldo',
            ownerOwesAmountButtonText: 'Przenieś saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Konto będące właścicielem tej przestrzeni roboczej (${email}) ma zaległe saldo z poprzedniego miesiąca.

Czy chcesz przelać tę kwotę (${amount}), aby przejąć rozliczanie dla tej przestrzeni roboczej? Twoja karta płatnicza zostanie obciążona natychmiast.`,
            subscriptionTitle: 'Przejmij roczną subskrypcję',
            subscriptionButtonText: 'Przenieś subskrypcję',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Przejęcie tego areału roboczego połączy jego roczną subskrypcję z Twoją obecną subskrypcją. Zwiększy to rozmiar Twojej subskrypcji o ${usersCount} członków, co da nowy rozmiar subskrypcji wynoszący ${finalCount}. Czy chcesz kontynuować?`,
            duplicateSubscriptionTitle: 'Alert o zduplikowanej subskrypcji',
            duplicateSubscriptionButtonText: 'Kontynuuj',
            duplicateSubscriptionText: ({
                email,
                workspaceName,
            }: ChangeOwnerDuplicateSubscriptionParams) => `Wygląda na to, że próbujesz przejąć rozliczenia za przestrzenie robocze użytkownika ${email}, ale aby to zrobić, musisz najpierw być administratorem we wszystkich jego przestrzeniach roboczych.

Kliknij „Kontynuuj”, jeśli chcesz przejąć rozliczenia tylko dla przestrzeni roboczej ${workspaceName}.

Jeśli chcesz przejąć rozliczenia za cały ich abonament, poproś ich najpierw o dodanie Cię jako administratora do wszystkich ich przestrzeni roboczych, a dopiero potem przejmij rozliczenia.`,
            hasFailedSettlementsTitle: 'Nie można przenieść własności',
            hasFailedSettlementsButtonText: 'Rozumiem',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Nie możesz przejąć rozliczeń, ponieważ ${email} ma zaległe rozliczenie karty Expensify Card. Poproś tę osobę o kontakt z concierge@expensify.com w celu rozwiązania problemu. Następnie będziesz mógł przejąć rozliczenia dla tego obszaru roboczego.`,
            failedToClearBalanceTitle: 'Nie udało się wyczyścić salda',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Nie udało nam się wyczyścić salda. Spróbuj ponownie później.',
            successTitle: 'Hurra! Wszystko gotowe.',
            successDescription: 'Jesteś teraz właścicielem tego obszaru roboczego.',
            errorTitle: 'Ups! Nie tak prędko...',
            errorDescription: `<muted-text><centered-text>Wystąpił problem podczas przenoszenia własności tego workspace'u. Spróbuj ponownie lub <concierge-link>skontaktuj się z Concierge</concierge-link>, aby uzyskać pomoc.</centered-text></muted-text>`,
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
                description: `Pola raportu pozwalają określić szczegóły na poziomie nagłówka, odrębne od tagów odnoszących się do wydatków w poszczególnych pozycjach. Te szczegóły mogą obejmować konkretne nazwy projektów, informacje o podróżach służbowych, lokalizacje i inne.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Pola raportu są dostępne tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Ciesz się automatyczną synchronizacją i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + NetSuite. Uzyskaj dogłębne, aktualne w czasie rzeczywistym informacje finansowe dzięki obsłudze natywnych i niestandardowych segmentów, w tym mapowania projektów i klientów.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z NetSuite jest dostępna tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Korzystaj z automatycznej synchronizacji i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + Sage Intacct. Uzyskaj szczegółowy, aktualny w czasie rzeczywistym wgląd finansowy dzięki zdefiniowanym przez użytkownika wymiarom, a także kategoryzacji wydatków według działu, klasy, lokalizacji, klienta i projektu (zadań).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z Sage Intacct jest dostępna wyłącznie w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Korzystaj z automatycznej synchronizacji i ogranicz ręczne wprowadzanie danych dzięki integracji Expensify + QuickBooks Desktop. Zyskaj maksymalną efektywność dzięki dwukierunkowemu połączeniu w czasie rzeczywistym oraz kategoryzacji wydatków według klasy, pozycji, klienta i projektu.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Nasza integracja z QuickBooks Desktop jest dostępna tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Zaawansowane zatwierdzanie',
                description: `Jeśli chcesz dodać więcej poziomów akceptacji – albo po prostu mieć pewność, że największe wydatki zostaną przejrzane przez kolejną osobę – mamy na to rozwiązanie. Zaawansowane zatwierdzanie pomaga wdrożyć odpowiednie mechanizmy kontrolne na każdym etapie, aby utrzymać wydatki zespołu pod kontrolą.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Zaawansowane zatwierdzanie jest dostępne tylko w planie Control, który zaczyna się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            categories: {
                title: 'Kategorie',
                description: 'Kategorie umożliwiają śledzenie i organizowanie wydatków. Skorzystaj z naszych domyślnych kategorii lub dodaj własne.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorie są dostępne w planie Collect, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            glCodes: {
                title: 'Kody GL',
                description: `Dodaj kody GL do swoich kategorii i tagów, aby ułatwić eksport wydatków do systemów księgowych i kadrowo‑płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody GL są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Kody księgi głównej i płacowe',
                description: `Dodaj kody GL i płacowe do swoich kategorii, aby ułatwić eksport wydatków do systemów księgowych i kadrowo‑płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody GL i kody płacowe są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Kody podatkowe',
                description: `Dodaj kody podatkowe do swoich podatków, aby łatwo eksportować wydatki do swoich systemów księgowych i kadrowo-płacowych.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kody podatkowe są dostępne tylko w planie Control, od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            companyCards: {
                title: 'Nieograniczone firmowe karty płatnicze',
                description: `Musisz dodać więcej źródeł kart? Odblokuj nieograniczoną liczbę kart firmowych, aby synchronizować transakcje od wszystkich głównych wydawców kart.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>To jest dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            rules: {
                title: 'Zasady',
                description: `Reguły działają w tle i utrzymują Twoje wydatki pod kontrolą, żebyś nie musiał przejmować się drobiazgami.

Wymagaj szczegółów wydatków, takich jak paragony i opisy, ustawiaj limity i wartości domyślne oraz automatyzuj akceptacje i płatności – wszystko w jednym miejscu.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Zasady są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            perDiem: {
                title: 'Dieta',
                description:
                    'Ryczałt dzienny to świetny sposób, aby utrzymać codzienne koszty zgodne z zasadami i przewidywalne, gdy Twoi pracownicy podróżują. Korzystaj z funkcji takich jak niestandardowe stawki, domyślne kategorie oraz bardziej szczegółowe informacje, takie jak miejsca docelowe i podstawkowania.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Diety są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            travel: {
                title: 'Podróż',
                description:
                    'Expensify Travel to nowa korporacyjna platforma do rezerwacji i zarządzania podróżami służbowymi, która umożliwia członkom rezerwowanie zakwaterowania, lotów, transportu i nie tylko.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Podróże są dostępne w planie Collect, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            reports: {
                title: 'Raporty',
                description: 'Raporty umożliwiają grupowanie wydatków, co ułatwia ich śledzenie i organizację.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Raporty są dostępne w planie Collect, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tagi wielopoziomowe',
                description:
                    'Wielopoziomowe tagi pomagają śledzić wydatki z większą dokładnością. Przypisuj wiele tagów do każdego wiersza pozycji — takich jak dział, klient lub centrum kosztów — aby uchwycić pełny kontekst każdego wydatku. Umożliwia to bardziej szczegółowe raportowanie, przepływy zatwierdzania i eksporty do systemów księgowych.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Tagi wielopoziomowe są dostępne tylko w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Stawki za przejazd',
                description: 'Twórz i zarządzaj własnymi stawkami, śledź przejechany dystans w milach lub kilometrach i ustawiaj domyślne kategorie dla wydatków związanych z podróżą.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Stawki za przejechany dystans są dostępne w planie Collect, zaczynając od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            auditor: {
                title: 'Audytor',
                description: 'Audytorzy otrzymują dostęp tylko do odczytu do wszystkich raportów, zapewniając pełną przejrzystość i monitorowanie zgodności.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Audytorzy są dostępni wyłącznie w planie Control, zaczynającym się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Wiele poziomów zatwierdzania',
                description:
                    'Wielopoziomowa akceptacja to narzędzie workflow dla firm, które wymagają, aby więcej niż jedna osoba zatwierdziła raport, zanim będzie on mógł zostać rozliczony.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Wiele poziomów zatwierdzania jest dostępnych wyłącznie w planie Control, począwszy od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'za aktywnego członka miesięcznie.',
                perMember: 'za użytkownika miesięcznie.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Uaktualnij, aby uzyskać dostęp do tej funkcji, lub <a href="${subscriptionLink}">dowiedz się więcej</a> o naszych planach i cenach.</muted-text>`,
            upgradeToUnlock: 'Odblokuj tę funkcję',
            completed: {
                headline: `Zaktualizowano Twoją przestrzeń roboczą!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Pomyślnie zaktualizowano ${policyName} do planu Control! <a href="${subscriptionLink}">Wyświetl swoją subskrypcję</a>, aby uzyskać więcej szczegółów.</centered-text>`,
                categorizeMessage: `Udało Ci się przejść na plan Collect. Teraz możesz kategoryzować swoje wydatki!`,
                travelMessage: `Pomyślnie uaktualniono do planu Collect. Teraz możesz zacząć rezerwować i zarządzać podróżami!`,
                distanceRateMessage: `Pomyślnie uaktualniono do planu Collect. Teraz możesz zmienić stawkę za dystans!`,
                gotIt: 'Rozumiem, dziękuję',
                createdWorkspace: `Utworzono obszar roboczy!`,
            },
            commonFeatures: {
                title: 'Przejdź na plan Control',
                note: 'Odblokuj nasze najpotężniejsze funkcje, w tym:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Plan Control zaczyna się od <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `za użytkownika miesięcznie.` : `za aktywnego członka miesięcznie.`} <a href="${learnMoreMethodsRoute}">Dowiedz się więcej</a> o naszych planach i cenach.</muted-text>`,
                    benefit1: 'Zaawansowane połączenia księgowe (NetSuite, Sage Intacct i inne)',
                    benefit2: 'Inteligentne reguły wydatków',
                    benefit3: 'Wielopoziomowe przepływy pracy zatwierdzania',
                    benefit4: 'Zaawansowane zabezpieczenia',
                    toUpgrade: 'Aby uaktualnić, kliknij',
                    selectWorkspace: 'wybierz przestrzeń roboczą i zmień typ planu na',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Zmień plan na Collect',
                note: 'Jeśli obniżysz plan, stracisz dostęp do tych funkcji i innych:',
                benefits: {
                    note: 'Aby zapoznać się z pełnym porównaniem naszych planów, zobacz nasze',
                    pricingPage: 'strona z cenami',
                    confirm: 'Czy na pewno chcesz obniżyć wersję i usunąć swoje konfiguracje?',
                    warning: 'Tej operacji nie można cofnąć.',
                    benefit1: 'Połączenia księgowe (z wyjątkiem QuickBooks Online i Xero)',
                    benefit2: 'Inteligentne reguły wydatków',
                    benefit3: 'Wielopoziomowe przepływy pracy zatwierdzania',
                    benefit4: 'Zaawansowane zabezpieczenia',
                    headsUp: 'Uwaga!',
                    multiWorkspaceNote:
                        'Musisz obniżyć plan wszystkich swoich przestrzeni roboczych przed pierwszą miesięczną płatnością, aby rozpocząć subskrypcję w taryfie Collect. Kliknij',
                    selectStep: '> wybierz każde środowisko robocze > zmień typ planu na',
                },
            },
            completed: {
                headline: 'Twoje miejsce pracy zostało zdegradowane',
                description: 'Masz inne przestrzenie robocze w planie Control. Aby rozliczać je według stawki Collect, musisz obniżyć plan wszystkich przestrzeni roboczych.',
                gotIt: 'Rozumiem, dziękuję',
            },
        },
        payAndDowngrade: {
            title: 'Zapłać i zdegraduj',
            headline: 'Twoja ostatnia płatność',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Twój ostatni rachunek za tę subskrypcję wyniesie <strong>${formattedAmount}</strong>`,
            description2: ({date}: DateParams) => `Zobacz swoje zestawienie poniżej dla ${date}:`,
            subscription:
                'Uwaga! Ta akcja zakończy Twoją subskrypcję Expensify, usunie tę przestrzeń roboczą i usunie wszystkich jej członków. Jeśli chcesz zachować tę przestrzeń roboczą i jedynie usunąć siebie, poproś innego administratora, aby najpierw przejął rozliczenia.',
            genericFailureMessage: 'Wystąpił błąd podczas opłacania Twojego rachunku. Spróbuj ponownie.',
        },
        restrictedAction: {
            restricted: 'Ograniczone',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Działania w przestrzeni roboczej ${workspaceName} są obecnie ograniczone`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Właściciel przestrzeni roboczej, ${workspaceOwnerName}, musi dodać lub zaktualizować zapisaną kartę płatniczą, aby odblokować nowe działania w przestrzeni roboczej.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Aby odblokować nowe działania w przestrzeni roboczej, musisz dodać lub zaktualizować zapisaną kartę płatniczą.',
            addPaymentCardToUnlock: 'Dodaj kartę płatniczą, aby odblokować!',
            addPaymentCardToContinueUsingWorkspace: 'Dodaj kartę płatniczą, aby nadal korzystać z tego obszaru roboczego',
            pleaseReachOutToYourWorkspaceAdmin: 'W razie pytań skontaktuj się z administratorem swojego przestrzeni roboczej.',
            chatWithYourAdmin: 'Porozmawiaj ze swoim administratorem',
            chatInAdmins: 'Czat na #admins',
            addPaymentCard: 'Dodaj kartę płatniczą',
            goToSubscription: 'Przejdź do subskrypcji',
        },
        rules: {
            individualExpenseRules: {
                title: 'Wydatki',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>Ustaw limity wydatków i domyślne wartości dla pojedynczych wydatków. Możesz również tworzyć reguły dla <a href="${categoriesPageLink}">kategorii</a> i <a href="${tagsPageLink}">tagów</a>.</muted-text>`,
                receiptRequiredAmount: 'Wymagana kwota rachunku',
                receiptRequiredAmountDescription: 'Wymagaj paragonów, gdy wydatki przekraczają tę kwotę, chyba że zostanie to nadpisane przez regułę kategorii.',
                maxExpenseAmount: 'Maksymalna kwota wydatku',
                maxExpenseAmountDescription: 'Oznacz wydatki przekraczające tę kwotę, chyba że zostanie to nadpisane przez regułę kategorii.',
                maxAge: 'Maksymalny wiek',
                maxExpenseAge: 'Maksymalny wiek wydatku',
                maxExpenseAgeDescription: 'Oznacz wydatki starsze niż określona liczba dni.',
                maxExpenseAgeDays: () => ({
                    one: '1 dzień',
                    other: (count: number) => `${count} dni`,
                }),
                cashExpenseDefault: 'Domyślne ustawienie wydatków gotówkowych',
                cashExpenseDefaultDescription:
                    'Wybierz, w jaki sposób mają być tworzone wydatki gotówkowe. Wydatek jest uznawany za gotówkowy, jeśli nie jest zaimportowaną transakcją na firmowej karcie. Obejmuje to ręcznie utworzone wydatki, paragony, diety, wydatki za przejazdy i za czas.',
                reimbursableDefault: 'Podlegające zwrotowi',
                reimbursableDefaultDescription: 'Wydatki najczęściej są zwracane pracownikom',
                nonReimbursableDefault: 'Niezwracalne',
                nonReimbursableDefaultDescription: 'Wydatki są czasami zwracane pracownikom',
                alwaysReimbursable: 'Zawsze podlegający zwrotowi',
                alwaysReimbursableDescription: 'Wydatki są zawsze zwracane pracownikom',
                alwaysNonReimbursable: 'Zawsze bez zwrotu kosztów',
                alwaysNonReimbursableDescription: 'Wydatki nigdy nie są zwracane pracownikom',
                billableDefault: 'Domyślnie fakturowalne',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>Wybierz, czy wydatki gotówkowe i kartą kredytową mają być domyślnie fakturowane. Możliwość fakturowania wydatków jest włączana lub wyłączana w <a href="${tagsPageLink}">tagach</a>.</muted-text>`,
                billable: 'Fakturowalne',
                billableDescription: 'Wydatki najczęściej są refakturowane klientom',
                nonBillable: 'Niefakturowalne',
                nonBillableDescription: 'Wydatki są czasami ponownie fakturowane klientom',
                eReceipts: 'eParagony',
                eReceiptsHint: `eParagony są tworzone automatycznie [dla większości transakcji kredytowych w USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Śledzenie uczestników',
                attendeeTrackingHint: 'Śledź koszt przypadający na osobę dla każdego wydatku.',
                prohibitedDefaultDescription:
                    'Oznacz wszystkie paragony, na których pojawia się alkohol, hazard lub inne zabronione pozycje. Wydatki z paragonami zawierającymi takie pozycje będą wymagały ręcznego sprawdzenia.',
                prohibitedExpenses: 'Wydatki zabronione',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Dodatkowe opłaty hotelowe',
                gambling: 'Hazard',
                tobacco: 'Tytoń',
                adultEntertainment: 'Rozrywka dla dorosłych',
            },
            expenseReportRules: {
                title: 'Raporty wydatków',
                subtitle: 'Automatyzuj zgodność raportów wydatków, zatwierdzanie i płatności.',
                preventSelfApprovalsTitle: 'Zapobiegaj samodzielnym zatwierdzeniom',
                preventSelfApprovalsSubtitle: 'Uniemożliwiaj członkom przestrzeni roboczej zatwierdzanie własnych raportów wydatków.',
                autoApproveCompliantReportsTitle: 'Automatycznie zatwierdzaj zgodne raporty',
                autoApproveCompliantReportsSubtitle: 'Skonfiguruj, które raporty wydatków kwalifikują się do automatycznego zatwierdzania.',
                autoApproveReportsUnderTitle: 'Automatycznie zatwierdzaj raporty poniżej',
                autoApproveReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty będą automatycznie zatwierdzane.',
                randomReportAuditTitle: 'Losowa kontrola raportu',
                randomReportAuditDescription: 'Wymagaj, aby niektóre raporty były zatwierdzane ręcznie, nawet jeśli kwalifikują się do automatycznego zatwierdzania.',
                autoPayApprovedReportsTitle: 'Automatyczna płatność zatwierdzonych raportów',
                autoPayApprovedReportsSubtitle: 'Skonfiguruj, które raporty wydatków kwalifikują się do automatycznej płatności.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Wprowadź kwotę mniejszą niż ${currency ?? ''}20 000`,
                autoPayApprovedReportsLockedSubtitle: 'Przejdź do „Więcej funkcji” i włącz „Workflows”, a następnie dodaj „Payments”, aby odblokować tę funkcję.',
                autoPayReportsUnderTitle: 'Automatycznie opłacaj raporty poniżej',
                autoPayReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty zostaną opłacone automatycznie.',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Przejdź do [więcej funkcji](${moreFeaturesLink}) i włącz przepływy pracy, a następnie dodaj ${featureName}, aby odblokować tę funkcję.`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Przejdź do [więcej funkcji](${moreFeaturesLink}) i włącz ${featureName}, aby odblokować tę funkcję.`,
            },
            categoryRules: {
                title: 'Reguły kategorii',
                approver: 'Aprobujący',
                requireDescription: 'Wymagaj opisu',
                descriptionHint: 'Podpowiedź opisu',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Przypomnij pracownikom o podaniu dodatkowych informacji dotyczących wydatków w kategorii „${categoryName}”. Ta podpowiedź pojawi się w polu opisu przy wydatkach.`,
                descriptionHintLabel: 'Podpowiedź',
                descriptionHintSubtitle: 'Pro tip: Im krócej, tym lepiej!',
                maxAmount: 'Maksymalna kwota',
                flagAmountsOver: 'Oznacz kwoty powyżej',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Dotyczy kategorii „${categoryName}”.`,
                flagAmountsOverSubtitle: 'To zastępuje maksymalną kwotę dla wszystkich wydatków.',
                expenseLimitTypes: {
                    expense: 'Pojedynczy wydatek',
                    expenseSubtitle: 'Oznaczaj kwoty wydatków według kategorii. Ta reguła zastępuje ogólną regułę przestrzeni roboczej dotyczącą maksymalnej kwoty wydatku.',
                    daily: 'Suma kategorii',
                    dailySubtitle: 'Oznaczaj łączny wydatek w kategorii dla każdego raportu wydatków.',
                },
                requireReceiptsOver: 'Wymagaj paragonów powyżej',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Domyślne`,
                    never: 'Nigdy nie wymagaj paragonów',
                    always: 'Zawsze wymagaj paragonów',
                },
                defaultTaxRate: 'Domyślna stawka podatku',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Przejdź do [Więcej funkcji](${moreFeaturesLink}) i włącz procesy pracy, a następnie dodaj zatwierdzenia, aby odblokować tę funkcję.`,
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
                    label: 'Kontrola',
                    description: 'Dla organizacji z zaawansowanymi wymaganiami.',
                },
            },
            description: 'Wybierz plan, który jest dla Ciebie odpowiedni. Aby zapoznać się ze szczegółową listą funkcji i cen, odwiedź naszą',
            subscriptionLink: 'strona pomocy dotycząca typów planów i cen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Zobowiązałeś(-aś) się do 1 aktywnego członka w planie Control do końca rocznej subskrypcji, czyli do ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję z opłatą za użycie i zmienić plan na Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
                other: `Zobowiązałeś się do ${count} aktywnych członków w planie Control aż do zakończenia rocznej subskrypcji dnia ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję płatną za użycie i zmienić plan na Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
            }),
            subscriptions: 'Subskrypcje',
        },
    },
    getAssistancePage: {
        title: 'Uzyskaj pomoc',
        subtitle: 'Jesteśmy tutaj, aby utorować Ci drogę do wielkości!',
        description: 'Wybierz jedną z poniższych opcji pomocy:',
        chatWithConcierge: 'Czat z Concierge',
        scheduleSetupCall: 'Umów rozmowę konfiguracyjną',
        scheduleACall: 'Zaplanuj rozmowę',
        questionMarkButtonTooltip: 'Uzyskaj pomoc od naszego zespołu',
        exploreHelpDocs: 'Przeglądaj centrum pomocy',
        registerForWebinar: 'Zarejestruj się na webinar',
        onboardingHelp: 'Pomoc przy wdrożeniu',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Zmień domyślny odcień skóry',
        headers: {
            frequentlyUsed: 'Często używane',
            smileysAndEmotion: 'Buźki i emocje',
            peopleAndBody: 'Ludzie i ciało',
            animalsAndNature: 'Zwierzęta i przyroda',
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
        privateDescription: 'Osoby zaproszone do tego pokoju mogą go znaleźć',
        publicDescription: 'Każdy może znaleźć ten pokój',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Każdy może znaleźć ten pokój',
        createRoom: 'Utwórz pokój',
        roomAlreadyExistsError: 'Pokój o tej nazwie już istnieje',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} jest domyślnym pokojem we wszystkich przestrzeniach roboczych. Wybierz inną nazwę.`,
        roomNameInvalidError: 'Nazwy pokojów mogą zawierać tylko małe litery, cyfry i łączniki',
        pleaseEnterRoomName: 'Wprowadź nazwę pokoju',
        pleaseSelectWorkspace: 'Wybierz przestrzeń roboczą',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}zmienił nazwę na „${newName}” (wcześniej „${oldName}”)` : `${actor}zmienił nazwę tego pokoju na „${newName}” (wcześniej „${oldName}”)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Pokój został przemianowany na ${newName}`,
        social: 'Społecznościowe',
        selectAWorkspace: 'Wybierz przestrzeń roboczą',
        growlMessageOnRenameError: 'Nie można zmienić nazwy pokoju w przestrzeni roboczej. Sprawdź połączenie i spróbuj ponownie.',
        visibilityOptions: {
            restricted: 'Obszar roboczy', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Prywatne',
            public: 'Publiczne',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Publiczne ogłoszenie',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Prześlij i zamknij',
        submitAndApprove: 'Zatwierdź i zaakceptuj',
        advanced: 'Zaawansowane',
        dynamicExternal: 'Dynamiczne zewnętrzne',
        smartReport: 'INTELIGENTNY RAPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `dodano ${approverName} (${approverEmail}) jako osobę zatwierdzającą dla pola ${field} „${name}”`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `usunął(-ęła) ${approverName} (${approverEmail}) jako osobę zatwierdzającą dla pola ${field} „${name}”`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `zmieniono zatwierdzającego dla pola ${field} „${name}” na ${formatApprover(newApproverName, newApproverEmail)} (wcześniej ${formatApprover(oldApproverName, oldApproverEmail)})`;
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
            return `zmieniono kod listy płac kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodano kod GL „${newValue}” do kategorii „${categoryName}”`;
            }
            if (!newValue && oldValue) {
                return `usunięto kod księgowy „${oldValue}” z kategorii „${categoryName}”`;
            }
            return `zmienił(a) kod konta GL kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `zmieniono opis kategorii „${categoryName}” na ${!oldValue ? 'wymagane' : 'Niewymagane'} (wcześniej ${!oldValue ? 'Niewymagane' : 'wymagane'})`;
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
            return `zmienił(a) typ limitu kategorii „${categoryName}” na ${newValue} (wcześniej ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `zaktualizował kategorię „${categoryName}”, zmieniając Receipts na ${newValue}`;
            }
            return `zmienił kategorię „${categoryName}” na ${newValue} (wcześniej ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmienił nazwę kategorii „${oldName}” na „${newName}”`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `usunął podpowiedź opisu „${oldValue}” z kategorii „${categoryName}”`;
            }
            return !oldValue
                ? `dodano podpowiedź opisu „${newValue}” do kategorii „${categoryName}”`
                : `zmienił podpowiedź opisu kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmienił nazwę listy tagów na „${newName}” (wcześniej „${oldName}”)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `dodano znacznik „${tagName}” do listy „${tagListName}”`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `zaktualizował listę tagów „${tagListName}”, zmieniając tag „${oldName}” na „${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'włączone' : 'wyłączone'} tag "${tagName}" na liście "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `usunięto znacznik „${tagName}” z listy „${tagListName}”`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `usunięto tagi „${count}” z listy „${tagListName}”`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `zaktualizowano znacznik „${tagName}” na liście „${tagListName}”, zmieniając ${updatedField} na „${newValue}” (wcześniej „${oldValue}”)`;
            }
            return `zaktualizowano znacznik „${tagName}” na liście „${tagListName}”, dodając ${updatedField} o wartości „${newValue}”`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `zmienił(a) ${customUnitName} ${updatedField} na „${newValue}” (wcześniej „${oldValue}”)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Śledzenie podatku ${newValue ? 'włączone' : 'wyłączone'} przy stawkach za odległość`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `dodał nową stawkę „${customUnitName}” „${rateName}”`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `zmieniono stawkę ${customUnitName} ${updatedField} „${customUnitRateName}” na „${newValue}” (wcześniej „${oldValue}”)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `zmienił stawkę podatku w stawce za odległość „${customUnitRateName}” na „${newValue} (${newTaxPercentage})” (poprzednio „${oldValue} (${oldTaxPercentage})”)`;
            }
            return `dodano stawkę podatku „${newValue} (${newTaxPercentage})” do stawki za dystans „${customUnitRateName}”`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `zmienił zwrotną część podatku w stawce za dystans „${customUnitRateName}” na „${newValue}” (wcześniej „${oldValue}”)`;
            }
            return `dodał odzyskiwalną część podatku „${newValue}” do stawki za dystans „${customUnitRateName}`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `usunął stawkę „${rateName}” jednostki „${customUnitName}”`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `dodano pole raportu ${fieldType} „${fieldName}”`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) => `ustaw domyślną wartość pola raportu „${fieldName}” na „${defaultValue}”`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `dodano opcję „${optionName}” do pola raportu „${fieldName}”`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `usunął(a) opcję „${optionName}” z pola raportu „${fieldName}”`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'włączone' : 'wyłączone'} opcja „${optionName}” dla pola raportu „${fieldName}”`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'włączone' : 'wyłączone'} wszystkie opcje dla pola raportu „${fieldName}”`;
            }
            return `${allEnabled ? 'włączone' : 'wyłączone'} opcję „${optionName}” dla pola raportu „${fieldName}”, powodując, że wszystkie opcje są ${allEnabled ? 'włączone' : 'wyłączone'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `usunięto pole raportu ${fieldType} „${fieldName}”`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `zaktualizowano „Prevent self-approval” do „${newValue === 'true' ? 'Włączone' : 'Wyłączone'}” (wcześniej „${oldValue === 'true' ? 'Włączone' : 'Wyłączone'}”)`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zmienił maksymalną kwotę wydatku wymagającego paragonu na ${newValue} (wcześniej ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zmieniono maksymalną kwotę wydatku dla naruszeń na ${newValue} (wcześniej ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano „Maksymalny wiek wydatku (dni)” na „${newValue}” (wcześniej „${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}”)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `ustaw miesięczną datę przesyłania raportu na „${newValue}”`;
            }
            return `zaktualizowano datę przesyłania miesięcznego raportu na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `zaktualizowano „Obciąż koszty klientom” na „${newValue}” (wcześniej „${oldValue}”)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano „Domyślne wydatki gotówkowe” na „${newValue}” (wcześniej „${oldValue}”)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `włączono „Wymuszanie domyślnych tytułów raportów” ${value ? 'włączone' : 'Wyłączone'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `zaktualizowano nazwę tego obszaru roboczego na „${newName}” (poprzednio „${oldName}”)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription ? `ustaw opis tego obszaru roboczego na „${newDescription}”` : `zaktualizowano opis tego środowiska pracy na „${newDescription}” (wcześniej „${oldDescription}”)`,
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
                one: `usunął Cię z procesu zatwierdzania wydatków i czatu wydatków ${joinedNames}. Wcześniej złożone raporty pozostaną dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
                other: `usunął Cię z przepływów pracy zatwierdzania i czatów dotyczących wydatków użytkownika ${joinedNames}. Wcześniej przesłane raporty pozostaną dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `zaktualizował(a) Twoją rolę w ${policyName} z ${oldRole} na użytkownika. Zostałeś/Zostałaś usunięty(a) ze wszystkich czatów dotyczących wydatków zgłaszających, z wyjątkiem własnych.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `zaktualizowano domyślną walutę na ${newCurrency} (wcześniej ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `zaktualizowano częstotliwość automatycznego raportowania na „${newFrequency}” (wcześniej „${oldFrequency}”)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `zaktualizowano tryb akceptacji na „${newValue}” (wcześniej „${oldValue}”)`,
        upgradedWorkspace: 'zaktualizował(-a) tę przestrzeń roboczą do planu Control',
        forcedCorporateUpgrade: `Ta przestrzeń robocza została uaktualniona do planu Control. Kliknij <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">tutaj</a>, aby uzyskać więcej informacji.`,
        downgradedWorkspace: 'zmienił ten workspace na plan Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `zmieniono odsetek raportów losowo kierowanych do ręcznej akceptacji na ${Math.round(newAuditRate * 100)}% (wcześniej ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `zmienił ręczny limit zatwierdzania dla wszystkich wydatków na ${newLimit} (wcześniej ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'włączone' : 'wyłączone'} kategorie`;
                case 'tags':
                    return `${enabled ? 'włączone' : 'wyłączone'} tagi`;
                case 'workflows':
                    return `${enabled ? 'włączone' : 'wyłączone'} przepływy pracy`;
                case 'distance rates':
                    return `stawki za odległość ${enabled ? 'włączone' : 'wyłączone'}`;
                case 'accounting':
                    return `${enabled ? 'włączone' : 'wyłączone'} księgowość`;
                case 'Expensify Cards':
                    return `${enabled ? 'włączone' : 'wyłączone'} Karty Expensify`;
                case 'company cards':
                    return `${enabled ? 'włączone' : 'wyłączone'} karty firmowe`;
                case 'invoicing':
                    return `${enabled ? 'włączone' : 'wyłączone'} fakturowanie`;
                case 'per diem':
                    return `${enabled ? 'włączone' : 'wyłączone'} dieta`;
                case 'receipt partners':
                    return `${enabled ? 'włączone' : 'wyłączone'} partnerzy paragonów`;
                case 'rules':
                    return `${enabled ? 'włączone' : 'wyłączone'} zasady`;
                case 'tax tracking':
                    return `Śledzenie podatku ${enabled ? 'włączone' : 'wyłączone'}`;
                default:
                    return `${enabled ? 'włączone' : 'wyłączone'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'włączone' : 'wyłączone'} śledzenie uczestników`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `Zwroty ${enabled ? 'włączone' : 'wyłączone'} dla tego obszaru roboczego`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `dodano podatek „${taxName}”`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `usunięto podatek „${taxName}”`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `zmienił nazwę podatku „${oldValue}” na „${newValue}”`;
                }
                case 'code': {
                    return `zmienił kod podatkowy dla „${taxName}” z „${oldValue}” na „${newValue}”`;
                }
                case 'rate': {
                    return `zmienił stawkę podatku dla „${taxName}” z „${oldValue}” na „${newValue}”`;
                }
                case 'enabled': {
                    return `${oldValue ? 'wyłączone' : 'włączone'} podatek „${taxName}”`;
                }
                default: {
                    return '';
                }
            }
        },
    },
    roomMembersPage: {
        memberNotFound: 'Nie znaleziono członka.',
        useInviteButton: 'Aby zaprosić nowego członka do czatu, użyj przycisku zaproszenia powyżej.',
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
        assignTask: 'Przydziel zadanie',
        assignMe: 'Przypisz mnie',
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
        assignee: 'Przypisany',
        completed: 'Ukończono',
        action: 'Zakończ',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `zadanie dla ${title}`,
            completed: 'oznaczono jako ukończone',
            canceled: 'usunięte zadanie',
            reopened: 'oznaczono jako nieukończone',
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
            escape: 'Zamykanie okien dialogowych',
            search: 'Otwórz okno wyszukiwania',
            newChat: 'Nowy ekran czatu',
            copy: 'Kopiuj komentarz',
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
                title: 'Nic do wyświetlenia',
                subtitle: `Spróbuj zmienić kryteria wyszukiwania lub utwórz coś za pomocą przycisku +.`,
            },
            emptyExpenseResults: {
                title: 'Nie utworzyłeś jeszcze żadnych wydatków',
                subtitle: 'Utwórz wydatek lub wypróbuj Expensify w trybie testowym, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby utworzyć wydatek.',
            },
            emptyReportResults: {
                title: 'Nie utworzono jeszcze żadnych raportów',
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
                subtitle: 'Rozpocznij, rezerwując swoją pierwszą podróż poniżej.',
                buttonText: 'Zarezerwuj podróż',
            },
            emptySubmitResults: {
                title: 'Brak wydatków do przesłania',
                subtitle: 'Wszystko załatwione. Czas na rundę honorową!',
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
                title: 'Brak wydatków do wyeksportowania',
                subtitle: 'Czas trochę odetchnąć, dobra robota.',
            },
            emptyStatementsResults: {
                title: 'Brak wydatków do wyświetlenia',
                subtitle: 'Brak wyników. Spróbuj zmienić filtry.',
            },
            emptyUnapprovedResults: {
                title: 'Brak wydatków do zatwierdzenia',
                subtitle: 'Zero wydatków. Maksymalny relaks. Dobra robota!',
            },
        },
        statements: 'Wyciągi',
        unapprovedCash: 'Niezaakceptowana gotówka',
        unapprovedCard: 'Niezatwierdzona karta',
        reconciliation: 'Uzgodnienie',
        saveSearch: 'Zapisz wyszukiwanie',
        deleteSavedSearch: 'Usuń zapisaną wyszukiwarkę',
        deleteSavedSearchConfirm: 'Czy na pewno chcesz usunąć to wyszukiwanie?',
        searchName: 'Szukaj nazwy',
        savedSearchesMenuItemTitle: 'Zapisano',
        groupedExpenses: 'zgrupowane wydatki',
        bulkActions: {
            approve: 'Zatwierdź',
            pay: 'Zapłać',
            delete: 'Usuń',
            hold: 'Wstrzymane',
            unhold: 'Usuń wstrzymanie',
            reject: 'Odrzuć',
            noOptionsAvailable: 'Brak opcji dostępnych dla wybranej grupy wydatków.',
        },
        filtersHeader: 'Filtry',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Przed ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Po ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `W ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nigdy',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Zeszły miesiąc',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'W tym miesiącu',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Ostatni wyciąg',
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
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Między ${greaterThan} a ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Równe ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Indywidualne karty',
                closedCards: 'Zamknięte karty',
                cardFeeds: 'Źródła kart',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Wszystkie ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Wszystkie zaimportowane karty CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} to ${value}`,
            current: 'Bieżący',
            past: 'Przeszłe',
            submitted: 'Przesłano',
            approved: 'Zatwierdzone',
            paid: 'Zapłacone',
            exported: 'Wyeksportowano',
            posted: 'Opublikowano',
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
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Wyślij',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Zatwierdź',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Zapłać',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Eksportuj',
            },
        },
        has: 'Ma',
        groupBy: 'Grupuj według',
        moneyRequestReport: {
            emptyStateTitle: 'Ten raport nie zawiera wydatków.',
        },
        noCategory: 'Brak kategorii',
        noTag: 'Brak tagu',
        expenseType: 'Typ wydatku',
        withdrawalType: 'Rodzaj wypłaty',
        recentSearches: 'Ostatnie wyszukiwania',
        recentChats: 'Ostatnie czaty',
        searchIn: 'Szukaj w',
        searchPlaceholder: 'Wyszukaj coś',
        suggestions: 'Sugestie',
        exportSearchResults: {
            title: 'Utwórz eksport',
            description: 'Wow, to całkiem sporo pozycji! Zaraz je zbierzemy w paczkę, a Concierge wkrótce wyśle Ci plik.',
        },
        exportAll: {
            selectAllMatchingItems: 'Wybierz wszystkie pasujące elementy',
            allMatchingItemsSelected: 'Wybrano wszystkie pasujące pozycje',
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
                'Sprawdź folder ze zdjęciami lub pobranymi plikami, aby znaleźć kopię swojego kodu QR. Dobra rada: dodaj go do prezentacji, aby Twoja publiczność mogła go zeskanować i połączyć się z Tobą bezpośrednio.',
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
    desktopApplicationMenu: {
        mainMenu: 'Nowy Expensify',
        about: 'O Nowym Expensify',
        update: 'Zaktualizuj New Expensify',
        checkForUpdates: 'Sprawdź aktualizacje',
        toggleDevTools: 'Przełącz narzędzia dla deweloperów',
        viewShortcuts: 'Zobacz skróty klawiaturowe',
        services: 'Usługi',
        hide: 'Ukryj nowy Expensify',
        hideOthers: 'Ukryj inne',
        showAll: 'Pokaż wszystko',
        quit: 'Zakończ działanie New Expensify',
        fileMenu: 'Plik',
        closeWindow: 'Zamknij okno',
        editMenu: 'Edytuj',
        undo: 'Cofnij',
        redo: 'Ponów',
        cut: 'Wytnij',
        copy: 'Kopiuj',
        paste: 'Wklej',
        pasteAndMatchStyle: 'Wklej i dopasuj styl',
        pasteAsPlainText: 'Wklej jako zwykły tekst',
        delete: 'Usuń',
        selectAll: 'Zaznacz wszystko',
        speechSubmenu: 'Mowa',
        startSpeaking: 'Zacznij mówić',
        stopSpeaking: 'Przestań mówić',
        viewMenu: 'Zobacz',
        reload: 'Odśwież',
        forceReload: 'Wymuś przeładowanie',
        resetZoom: 'Rzeczywisty rozmiar',
        zoomIn: 'Powiększ',
        zoomOut: 'Oddal',
        togglefullscreen: 'Przełącz tryb pełnoekranowy',
        historyMenu: 'Historia',
        back: 'Wstecz',
        forward: 'Przekaż',
        windowMenu: 'Okno',
        minimize: 'Minimalizuj',
        zoom: 'Zoom',
        front: 'Przenieś wszystko na wierzch',
        helpMenu: 'Pomoc',
        learnMore: 'Dowiedz się więcej',
        documentation: 'Dokumentacja',
        communityDiscussions: 'Dyskusje społeczności',
        searchIssues: 'Wyszukaj problemy',
    },
    historyMenu: {
        forward: 'Przekaż',
        back: 'Wstecz',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Dostępna aktualizacja',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `Nowa wersja będzie wkrótce dostępna.${!isSilentUpdating ? 'Powiadomimy Cię, gdy będziemy gotowi do aktualizacji.' : ''}`,
            soundsGood: 'Brzmi dobrze',
        },
        notAvailable: {
            title: 'Aktualizacja niedostępna',
            message: 'W tej chwili nie ma dostępnej aktualizacji. Sprawdź ponownie później!',
            okay: 'OK',
        },
        error: {
            title: 'Aktualizacja nie powiodła się',
            message: 'Nie udało się sprawdzić dostępności aktualizacji. Spróbuj ponownie za chwilę.',
        },
    },
    settlement: {
        status: {
            pending: 'Oczekujące',
            cleared: 'Rozliczono',
            failed: 'Niepowodzenie',
        },
        failedError: ({link}: {link: string}) => `Ponówimy tę spłatę, gdy <a href="${link}">odblokujesz swoje konto</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • ID wypłaty: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Układ raportu',
        groupByLabel: 'Grupuj według:',
        selectGroupByOption: 'Wybierz sposób grupowania wydatków w raporcie',
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
            createReport: 'Utwórz raport',
            chooseWorkspace: 'Wybierz przestrzeń roboczą dla tego raportu.',
            emptyReportConfirmationTitle: 'Masz już pusty raport',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Czy na pewno chcesz utworzyć kolejny raport w ${workspaceName}? Możesz uzyskać dostęp do swoich pustych raportów w`,
            emptyReportConfirmationPromptLink: 'Raporty',
            genericWorkspaceName: 'to miejsce pracy',
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
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `ustaw ${fieldName} na "${newValue}"`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `zmienił(-a) przestrzeń roboczą${fromPolicyName ? `(uprzednio ${fromPolicyName})` : ''}`;
                    }
                    return `zmienił(-a) przestrzeń roboczą na ${toPolicyName}${fromPolicyName ? `(uprzednio ${fromPolicyName})` : ''}`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `zmieniono typ z ${oldType} na ${newType}`,
                exportedToCSV: `wyeksportowano do CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `wyeksportowano do ${translatedLabel}`;
                    },
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `wyeksportowano do ${label} przez`,
                    automaticActionTwo: 'ustawienia księgowe',
                    manual: ({label}: ExportedToIntegrationParams) => `oznaczył(a) ten raport jako ręcznie wyeksportowany do ${label}.`,
                    automaticActionThree: 'i pomyślnie utworzono rekord dla',
                    reimburseableLink: 'wydatki z własnej kieszeni',
                    nonReimbursableLink: 'wydatki z firmowej karty',
                    pending: ({label}: ExportedToIntegrationParams) => `rozpoczęto eksportowanie tego raportu do ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `nie udało się wyeksportować tego raportu do ${label} („${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}”)`,
                managerAttachReceipt: `dodał paragon`,
                managerDetachReceipt: `usunął(-ę) paragon`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `zapłacono ${currency}${amount} gdzie indziej`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `zapłacono ${currency}${amount} przez integrację`,
                outdatedBankAccount: `nie można było przetworzyć płatności z powodu problemu z rachunkiem bankowym płatnika`,
                reimbursementACHBounce: `nie można było przetworzyć płatności z powodu problemu z kontem bankowym`,
                reimbursementACHCancelled: `anulował płatność`,
                reimbursementAccountChanged: `nie udało się przetworzyć płatności, ponieważ płatnik zmienił konto bankowe`,
                reimbursementDelayed: `przetworzyliśmy płatność, ale jest opóźniona o kolejne 1–2 dni robocze`,
                selectedForRandomAudit: `losowo wybrane do weryfikacji`,
                selectedForRandomAuditMarkdown: `[losowo wybrany](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) do przeglądu`,
                share: ({to}: ShareParams) => `zaproszony członek ${to}`,
                unshare: ({to}: UnshareParams) => `usunięto członka ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `zapłacono ${currency}${amount}`,
                takeControl: `przejęto kontrolę`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `wystąpił problem z synchronizacją z ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Proszę naprawić problem w <a href="${workspaceAccountingLink}">ustawieniach przestrzeni roboczej</a>.`,
                addEmployee: ({email, role}: AddEmployeeParams) => `dodano ${email} jako ${role === 'member' ? 'a' : 'jakiś'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `zaktualizowano rolę użytkownika ${email} na ${newRole} (poprzednio ${currentRole})`,
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
                        return `usunął niestandardowe pole 2 użytkownika ${email} (wcześniej „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `dodano „${newValue}” do pola niestandardowego 2 użytkownika ${email}`
                        : `zmienił(a) własne pole 2 użytkownika ${email} na „${newValue}” (wcześniej „${previousValue}”)`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} opuścił(-a) przestrzeń roboczą`,
                removeMember: ({email, role}: AddEmployeeParams) => `usunięto ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `usunięto połączenie z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `połączono z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'opuścił czat',
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
        companyCreditCard: 'Karta firmowa',
        receiptScanningApp: 'Aplikacja do skanowania paragonów',
        billPay: 'Płatność rachunków',
        invoicing: 'Fakturowanie',
        CPACard: 'Karta CPA',
        payroll: 'Lista płac',
        travel: 'Podróż',
        resources: 'Zasoby',
        expensifyApproved: 'Zatwierdzone przez Expensify!',
        pressKit: 'Zestaw prasowy',
        support: 'Pomoc',
        expensifyHelp: 'Pomoc Expensify',
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
        chatWelcomeMessage: 'Powitalna wiadomość czatu',
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
        reversedTransaction: 'Odwrócona transakcja',
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
        copy: 'Kopiuj URL',
        copied: 'Skopiowano!',
    },
    moderation: {
        flagDescription: 'Wszystkie oflagowane wiadomości zostaną wysłane do moderatora do przejrzenia.',
        chooseAReason: 'Wybierz powód zgłoszenia poniżej:',
        spam: 'Spam',
        spamDescription: 'Niechciana, niezwiązana z tematem promocja',
        inconsiderate: 'Nierozważny',
        inconsiderateDescription: 'Obrażające lub lekceważące sformułowanie, o wątpliwych intencjach',
        intimidation: 'Zastraszanie',
        intimidationDescription: 'Agresywne forsowanie własnego programu pomimo uzasadnionych zastrzeżeń',
        bullying: 'Nękanie',
        bullyingDescription: 'Kierowanie się na jednostkę w celu uzyskania posłuszeństwa',
        harassment: 'Nękanie',
        harassmentDescription: 'Rasistowskie, mizoginistyczne lub inne szeroko dyskryminujące zachowania',
        assault: 'Napaść',
        assaultDescription: 'Celowo wymierzony atak emocjonalny z zamiarem wyrządzenia szkody',
        flaggedContent: 'Ta wiadomość została oznaczona jako naruszająca nasze zasady społeczności, a jej treść została ukryta.',
        hideMessage: 'Ukryj wiadomość',
        revealMessage: 'Pokaż wiadomość',
        levelOneResult: 'Wysyła anonimowe ostrzeżenie, a wiadomość jest zgłaszana do weryfikacji.',
        levelTwoResult: 'Wiadomość ukryta z kanału, wraz z anonimowym ostrzeżeniem, a wiadomość została zgłoszona do weryfikacji.',
        levelThreeResult: 'Wiadomość usunięta z kanału, wystosowano anonimowe ostrzeżenie, a wiadomość została zgłoszona do weryfikacji.',
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
        submit: 'Przekaż to komuś',
        categorize: 'Skategoryzuj to',
        share: 'Udostępnij to mojemu księgowemu',
        nothing: 'Na razie nic',
    },
    teachersUnitePage: {
        teachersUnite: 'Nauczyciele Razem',
        joinExpensifyOrg:
            'Dołącz do Expensify.org w eliminowaniu niesprawiedliwości na całym świecie. Obecna kampania „Teachers Unite” wspiera nauczycieli na całym świecie, dzieląc koszty niezbędnych przyborów szkolnych.',
        iKnowATeacher: 'Znam nauczyciela',
        iAmATeacher: 'Jestem nauczycielem',
        getInTouch: 'Świetnie! Proszę podaj ich dane kontaktowe, abyśmy mogli się z nimi skontaktować.',
        introSchoolPrincipal: 'Wprowadzenie do dyrektora szkoły',
        schoolPrincipalVerifyExpense:
            'Expensify.org dzieli koszty podstawowych przyborów szkolnych, aby uczniowie z rodzin o niskich dochodach mogli mieć lepsze warunki do nauki. Twój dyrektor zostanie poproszony o potwierdzenie Twoich wydatków.',
        principalFirstName: 'Imię głównego zleceniodawcy',
        principalLastName: 'Nazwisko dyrektora',
        principalWorkEmail: 'Główny służbowy e-mail',
        updateYourEmail: 'Zaktualizuj swój adres e-mail',
        updateEmail: 'Zaktualizuj adres e‑mail',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `Zanim przejdziesz dalej, upewnij się, że ustawiono szkolny adres e-mail jako domyślną metodę kontaktu. Możesz to zrobić w Ustawienia > Profil > <a href="${contactMethodsRoute}">Metody kontaktu</a>.`,
        error: {
            enterPhoneEmail: 'Wprowadź prawidłowy adres e‑mail lub numer telefonu',
            enterEmail: 'Wprowadź adres e‑mail',
            enterValidEmail: 'Wprowadź prawidłowy adres e‑mail',
            tryDifferentEmail: 'Spróbuj użyć innego adresu e-mail',
        },
    },
    cardTransactions: {
        notActivated: 'Nieaktywne',
        outOfPocket: 'Wydatki z własnej kieszeni',
        companySpend: 'Wydatki firmy',
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
            title: 'Mapowanie oczekujące',
            subtitle: 'Mapa zostanie wygenerowana, gdy wrócisz do trybu online',
            onlineSubtitle: 'Chwileczkę, konfigurujemy mapę',
            errorTitle: 'Błąd mapy',
            errorSubtitle: 'Wystąpił błąd podczas ładowania mapy. Spróbuj ponownie.',
        },
        error: {
            selectSuggestedAddress: 'Wybierz sugerowany adres lub użyj bieżącej lokalizacji',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Karta raportu zgubiona lub uszkodzona',
        nextButtonLabel: 'Dalej',
        reasonTitle: 'Dlaczego potrzebujesz nowej karty?',
        cardDamaged: 'Moja karta została uszkodzona',
        cardLostOrStolen: 'Moja karta została zgubiona lub skradziona',
        confirmAddressTitle: 'Potwierdź adres korespondencyjny dla swojej nowej karty.',
        cardDamagedInfo: 'Twoja nowa karta dotrze w ciągu 2–3 dni roboczych. Twoja obecna karta będzie działać do czasu aktywacji nowej.',
        cardLostOrStolenInfo: 'Twoja obecna karta zostanie trwale dezaktywowana, gdy tylko złożysz zamówienie. Większość kart dociera w ciągu kilku dni roboczych.',
        address: 'Adres',
        deactivateCardButton: 'Dezaktywuj kartę',
        shipNewCardButton: 'Wyślij nową kartę',
        addressError: 'Adres jest wymagany',
        reasonError: 'Powód jest wymagany',
        successTitle: 'Twoja nowa karta jest w drodze!',
        successDescription: 'Gdy karta dotrze za kilka dni roboczych, będziesz musiał(a) ją aktywować. W międzyczasie możesz korzystać z karty wirtualnej.',
    },
    eReceipt: {
        guaranteed: 'Gwarantowany eParagon',
        transactionDate: 'Data transakcji',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Rozpocznij czat, <success><strong>poleć znajomego</strong></success>.',
            header: 'Rozpocznij czat, poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi też korzystali z Expensify? Po prostu rozpocznij z nimi czat, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Złóż rozliczenie wydatku, <success><strong>poleć swój zespół</strong></success>.',
            header: 'Zgłoś wydatek, poleć swój zespół',
            body: 'Chcesz, aby Twój zespół też korzystał z Expensify? Po prostu wyślij im wydatek, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi też korzystali z Expensify? Po prostu porozmawiaj z nimi na czacie, zapłać im lub podziel się z nimi wydatkiem, a my zajmiemy się resztą. Albo po prostu udostępnij swój link zaproszeniowy!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Poleć znajomego',
            header: 'Poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi też korzystali z Expensify? Po prostu porozmawiaj z nimi na czacie, zapłać im lub podziel się z nimi wydatkiem, a my zajmiemy się resztą. Albo po prostu udostępnij swój link zaproszeniowy!',
        },
        copyReferralLink: 'Kopiuj link zaproszenia',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Porozmawiaj ze swoim specjalistą ds. konfiguracji w <a href="${href}">${adminReportName}</a>, aby uzyskać pomoc`,
        default: `Wyślij wiadomość do <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>, aby uzyskać pomoc z konfiguracją`,
    },
    violations: {
        allTagLevelsRequired: 'Wszystkie tagi wymagane',
        autoReportedRejectedExpense: 'Ten wydatek został odrzucony.',
        billableExpense: 'Rozliczalne już nieaktualne',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Wymagany paragon${formattedLimit ? `ponad ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategoria nie jest już ważna',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Zastosowano ${surcharge}% prowizji za przewalutowanie`,
        customUnitOutOfPolicy: 'Stawka nie jest prawidłowa dla tego obszaru roboczego',
        duplicatedTransaction: 'Możliwy duplikat',
        fieldRequired: 'Pola raportu są wymagane',
        futureDate: 'Przyszła data jest niedozwolona',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Podwyższono o ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data starsza niż ${maxAge} dni`,
        missingCategory: 'Brak kategorii',
        missingComment: 'Wymagany opis dla wybranej kategorii',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Brak ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Kwota różni się od obliczonego dystansu';
                case 'card':
                    return 'Kwota większa niż transakcja kartą';
                default:
                    if (displayPercentVariance) {
                        return `Kwota jest o ${displayPercentVariance}% wyższa niż zeskanowany paragon`;
                    }
                    return 'Kwota wyższa niż zeskanowany paragon';
            }
        },
        modifiedDate: 'Data różni się od zeskanowanego paragonu',
        nonExpensiworksExpense: 'Wydatek spoza Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Wydatek przekracza automatyczny limit zatwierdzania wynoszący ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Kwota powyżej limitu kategorii ${formattedLimit}/osobę`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota powyżej limitu ${formattedLimit}/osobę`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota powyżej limitu ${formattedLimit}/podróż`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota powyżej limitu ${formattedLimit}/osobę`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Kwota przekracza dzienny limit kategorii ${formattedLimit}/osobę`,
        receiptNotSmartScanned: 'Szczegóły paragonu i wydatku dodane ręcznie.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Wymagany paragon przy przekroczeniu limitu kategorii ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Paragon wymagany powyżej ${formattedLimit}`;
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
        reviewRequired: 'Wymagana recenzja',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Nie można automatycznie dopasować paragonu z powodu zerwanego połączenia z bankiem';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Połączenie z bankiem zostało przerwane. <a href="${companyCardPageURL}">Połącz ponownie, aby dopasować paragon</a>`
                    : 'Połączenie z bankiem zostało zerwane. Poproś administratora o ponowne połączenie, aby dopasować paragon.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Poproś ${member}, aby oznaczył to jako gotówkę lub poczekaj 7 dni i spróbuj ponownie` : 'Oczekiwanie na połączenie z transakcją z karty.';
            }
            return '';
        },
        brokenConnection530Error: 'Paragon oczekuje z powodu zerwanego połączenia z bankiem',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Paragon oczekuje z powodu przerwanego połączenia z bankiem. Rozwiąż problem w sekcji <a href="${workspaceCompanyCardRoute}">Karty firmowe</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Paragon oczekuje z powodu przerwanego połączenia z bankiem. Poproś administratora przestrzeni roboczej o rozwiązanie problemu.',
        markAsCashToIgnore: 'Oznacz jako gotówkę, aby zignorować i zażądać płatności.',
        smartscanFailed: ({canEdit = true}) => `Skanowanie paragonu nie powiodło się.${canEdit ? 'Wprowadź szczegóły ręcznie.' : ''}`,
        receiptGeneratedWithAI: 'Potencjalnie wygenerowany przez AI paragon',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Brak ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nie jest już ważny`,
        taxAmountChanged: 'Kwota podatku została zmieniona',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Podatek'} nie jest już ważny`,
        taxRateChanged: 'Stawka podatku została zmodyfikowana',
        taxRequired: 'Brak stawki podatku',
        none: 'Brak',
        taxCodeToKeep: 'Wybierz, który kod podatkowy zachować',
        tagToKeep: 'Wybierz, który tag zachować',
        isTransactionReimbursable: 'Wybierz, czy transakcja podlega zwrotowi',
        merchantToKeep: 'Wybierz, którego sprzedawcę zachować',
        descriptionToKeep: 'Wybierz opis, który chcesz zachować',
        categoryToKeep: 'Wybierz kategorię do zachowania',
        isTransactionBillable: 'Wybierz, czy transakcja jest fakturowalna',
        keepThisOne: 'Zachowaj ten',
        confirmDetails: `Potwierdź szczegóły, które zachowujesz`,
        confirmDuplicatesInfo: `Duplikaty, których nie zachowasz, zostaną pozostawione do usunięcia przez osobę, która je przesłała.`,
        hold: 'Ten wydatek został wstrzymany',
        resolvedDuplicates: 'rozwiązano duplikat',
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
            subtitle: 'Zanim odejdziesz, powiedz nam proszę, dlaczego chcesz przełączyć się na Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Potrzebuję funkcji, która jest dostępna tylko w Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Nie rozumiem, jak korzystać z New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Rozumiem, jak korzystać z New Expensify, ale wolę Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Jakiej funkcji potrzebujesz, której nie ma w nowym Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Co próbujesz zrobić?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Dlaczego wolisz Expensify Classic?',
        },
        responsePlaceholder: 'Twoja odpowiedź',
        thankYou: 'Dziękujemy za opinię!',
        thankYouSubtitle: 'Twoje odpowiedzi pomogą nam stworzyć lepszy produkt do załatwiania spraw. Bardzo dziękujemy!',
        goToExpensifyClassic: 'Przełącz na Expensify Classic',
        offlineTitle: 'Wygląda na to, że utknąłeś tutaj…',
        offline:
            'Wygląda na to, że jesteś offline. Niestety, Expensify Classic nie działa offline, ale Nowy Expensify działa. Jeśli wolisz korzystać z Expensify Classic, spróbuj ponownie, gdy będziesz mieć połączenie z internetem.',
        quickTip: 'Szybka wskazówka…',
        quickTipSubTitle: 'Możesz przejść bezpośrednio do Expensify Classic, odwiedzając stronę expensify.com. Dodaj ją do zakładek, aby mieć łatwy skrót!',
        bookACall: 'Umów rozmowę',
        bookACallTitle: 'Czy chcesz porozmawiać z product managerem?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Bezpośrednie czatowanie na wydatkach i raportach',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Możliwość robienia wszystkiego na urządzeniu mobilnym',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Podróże i wydatki w tempie czatu',
        },
        bookACallTextTop: 'Przechodząc na Expensify Classic, stracisz dostęp do:',
        bookACallTextBottom:
            'Bylibyśmy podekscytowani możliwością rozmowy telefonicznej z Tobą, aby zrozumieć dlaczego. Możesz umówić rozmowę z jednym z naszych starszych menedżerów produktu, aby omówić swoje potrzeby.',
        takeMeToExpensifyClassic: 'Przejdź do Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Wystąpił błąd podczas wczytywania kolejnych wiadomości',
        tryAgain: 'Spróbuj ponownie',
    },
    systemMessage: {
        mergedWithCashTransaction: 'dopasował(a) paragon do tej transakcji',
    },
    subscription: {
        authenticatePaymentCard: 'Uwierzytelnij kartę płatniczą',
        mobileReducedFunctionalityMessage: 'Nie możesz wprowadzać zmian w swojej subskrypcji w aplikacji mobilnej.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Darmowy okres próbny: pozostało ${numOfDays} ${numOfDays === 1 ? 'dzień' : 'dni'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Twoje informacje dotyczące płatności są nieaktualne',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Zaktualizuj swoją kartę płatniczą do ${date}, aby nadal korzystać ze wszystkich swoich ulubionych funkcji.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Twoja płatność nie mogła zostać przetworzona',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Twoja płatność z dnia ${date} na kwotę ${purchaseAmountOwed} nie mogła zostać przetworzona. Dodaj kartę płatniczą, aby uregulować należność.`
                        : 'Dodaj proszę kartę płatniczą, aby spłacić należną kwotę.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Twoje informacje dotyczące płatności są nieaktualne',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Twoja płatność jest przeterminowana. Prosimy o opłacenie faktury do ${date}, aby uniknąć przerwy w świadczeniu usługi.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Twoje informacje dotyczące płatności są nieaktualne',
                subtitle: 'Twoja płatność jest zaległa. Prosimy o opłacenie faktury.',
            },
            billingDisputePending: {
                title: 'Twoja karta nie mogła zostać obciążona',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Zakwestionowałeś/-aś obciążenie w wysokości ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto będzie zablokowane, dopóki spór nie zostanie rozwiązany z Twoim bankiem.`,
            },
            cardAuthenticationRequired: {
                title: 'Twoja karta płatnicza nie została w pełni uwierzytelniona.',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Dokończ proces uwierzytelniania, aby aktywować swoją kartę płatniczą kończącą się na ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Twoja karta nie mogła zostać obciążona',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Twoja karta płatnicza została odrzucona z powodu niewystarczających środków. Spróbuj ponownie lub dodaj nową kartę płatniczą, aby uregulować zaległe saldo w wysokości ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Twoja karta nie mogła zostać obciążona',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Twoja karta płatnicza wygasła. Dodaj nową kartę płatniczą, aby uregulować zaległe saldo w wysokości ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Twoja karta wkrótce traci ważność',
                subtitle:
                    'Twoja karta płatnicza wygaśnie z końcem tego miesiąca. Kliknij poniższe menu z trzema kropkami, aby ją zaktualizować i nadal korzystać ze wszystkich ulubionych funkcji.',
            },
            retryBillingSuccess: {
                title: 'Sukces!',
                subtitle: 'Twoja karta została pomyślnie obciążona.',
            },
            retryBillingError: {
                title: 'Twoja karta nie mogła zostać obciążona',
                subtitle:
                    'Zanim spróbujesz ponownie, skontaktuj się bezpośrednio ze swoim bankiem, aby autoryzować obciążenia Expensify i usunąć wszelkie blokady. W przeciwnym razie spróbuj dodać inną kartę płatniczą.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Zakwestionowałeś/-aś obciążenie w wysokości ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto będzie zablokowane, dopóki spór nie zostanie rozwiązany z Twoim bankiem.`,
            preTrial: {
                title: 'Rozpocznij bezpłatny okres próbny',
                subtitle: 'Jako kolejny krok <a href="#">dokończ swoją listę kontrolną konfiguracji</a>, aby Twój zespół mógł zacząć rozliczać wydatki.',
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
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>${discountType}% zniżki na pierwszy rok!</strong> Po prostu dodaj kartę płatniczą i rozpocznij roczną subskrypcję.`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `Oferta ograniczona czasowo: ${discountType}% zniżki na pierwszy rok!`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Zgłoś w ciągu ${days > 0 ? `${days}d :` : ''}${hours}g : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Płatność',
            subtitle: 'Dodaj kartę, aby opłacić swoją subskrypcję Expensify.',
            addCardButton: 'Dodaj kartę płatniczą',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Twoja następna data płatności to ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Karta kończąca się na ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nazwa: ${name}, Ważność: ${expiration}, Waluta: ${currency}`,
            changeCard: 'Zmień kartę płatniczą',
            changeCurrency: 'Zmień walutę płatności',
            cardNotFound: 'Nie dodano karty płatniczej',
            retryPaymentButton: 'Ponów płatność',
            authenticatePayment: 'Uwierzytelnij płatność',
            requestRefund: 'Poproś o zwrot',
            requestRefundModal: {
                full: 'Uzyskanie zwrotu jest proste: po prostu zdegraduj swoje konto przed następną datą rozliczenia, a otrzymasz zwrot. <br /> <br /> Uwaga: Degradacja konta oznacza, że Twoje obszary robocze zostaną usunięte. Tej czynności nie można cofnąć, ale zawsze możesz utworzyć nowy obszar roboczy, jeśli zmienisz zdanie.',
                confirm: 'Usuń przestrzenie robocze i obniż plan',
            },
            viewPaymentHistory: 'Zobacz historię płatności',
        },
        yourPlan: {
            title: 'Twój plan',
            exploreAllPlans: 'Poznaj wszystkie plany',
            customPricing: 'Niestandardowe ceny',
            asLowAs: ({price}: YourPlanPriceValueParams) => `już od ${price} za aktywnego członka/miesiąc`,
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
                benefit4: 'Zatwierdzanie wydatków i podróży',
                benefit5: 'Rezerwacja podróży i zasady',
                benefit6: 'Integracje z QuickBooks/Xero',
                benefit7: 'Czatuj o wydatkach, raportach i pokojach',
                benefit8: 'Wsparcie AI i człowieka',
            },
            control: {
                title: 'Kontrola',
                description: 'Wydatki, podróże służbowe i czat dla większych firm.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, ${upper}/aktywnego członka bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywnego członka z kartą Expensify, ${upper}/aktywnego członka bez karty Expensify.`,
                benefit1: 'Wszystko w planie Collect',
                benefit2: 'Wielopoziomowe przepływy pracy zatwierdzania',
                benefit3: 'Niestandardowe reguły wydatków',
                benefit4: 'Integracje z ERP (NetSuite, Sage Intacct, Oracle)',
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
            saveWithExpensifyDescription: 'Skorzystaj z naszego kalkulatora oszczędności, aby zobaczyć, jak zwrot gotówki z karty Expensify Card może obniżyć Twój rachunek w Expensify.',
            saveWithExpensifyButton: 'Dowiedz się więcej',
        },
        compareModal: {
            comparePlans: 'Porównaj plany',
            subtitle: `<muted-text>Odblokuj potrzebne funkcje dzięki planowi, który najlepiej do Ciebie pasuje. <a href="${CONST.PRICING}">Zobacz naszą stronę z cennikiem</a> lub pełne zestawienie funkcji w każdym z naszych planów.</muted-text>`,
        },
        details: {
            title: 'Szczegóły subskrypcji',
            annual: 'Roczna subskrypcja',
            taxExempt: 'Poproś o status zwolnienia z podatku',
            taxExemptEnabled: 'Zwolnione z podatku',
            taxExemptStatus: 'Status zwolnienia z podatku',
            payPerUse: 'Płatność za użycie',
            subscriptionSize: 'Rozmiar subskrypcji',
            headsUp:
                'Uwaga: jeśli nie ustawisz teraz rozmiaru swojej subskrypcji, automatycznie ustalimy go na liczbę aktywnych członków w pierwszym miesiącu. Następnie będziesz zobowiązany do opłacania co najmniej tej liczby członków przez kolejne 12 miesięcy. Możesz w każdej chwili zwiększyć rozmiar subskrypcji, ale nie możesz go zmniejszyć, dopóki Twoja subskrypcja się nie zakończy.',
            zeroCommitment: 'Zero zobowiązań przy obniżonej rocznej cenie subskrypcji',
        },
        subscriptionSize: {
            title: 'Rozmiar subskrypcji',
            yourSize: 'Rozmiar Twojej subskrypcji to liczba otwartych miejsc, które mogą zostać zajęte przez dowolnego aktywnego członka w danym miesiącu.',
            eachMonth:
                'Każdego miesiąca Twoja subskrypcja obejmuje liczbę aktywnych członków określoną powyżej. Za każdym razem, gdy zwiększysz rozmiar subskrypcji, rozpocznie się nowa 12-miesięczna subskrypcja w tym nowym rozmiarze.',
            note: 'Uwaga: Aktywny członek to każda osoba, która utworzyła, edytowała, przesłała, zatwierdziła, zrefundowała lub wyeksportowała dane wydatków powiązane z przestrzenią roboczą Twojej firmy.',
            confirmDetails: 'Potwierdź szczegóły nowej subskrypcji rocznej:',
            subscriptionSize: 'Rozmiar subskrypcji',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktywnych członków/miesiąc`,
            subscriptionRenews: 'Subskrypcja odnawia się',
            youCantDowngrade: 'Nie możesz zmienić planu na niższy w trakcie rocznej subskrypcji.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Masz już wykupioną roczną subskrypcję obejmującą ${size} aktywnych członków miesięcznie do ${date}. Możesz przejść na subskrypcję płatną za użycie w dniu ${date}, wyłączając automatyczne odnawianie.`,
            error: {
                size: 'Wprowadź prawidłowy rozmiar subskrypcji',
                sameSize: 'Wprowadź liczbę inną niż obecny rozmiar Twojej subskrypcji',
            },
        },
        paymentCard: {
            addPaymentCard: 'Dodaj kartę płatniczą',
            enterPaymentCardDetails: 'Wprowadź dane swojej karty płatniczej',
            security: 'Expensify jest zgodny z PCI-DSS, wykorzystuje szyfrowanie na poziomie bankowym i redundantną infrastrukturę do ochrony Twoich danych.',
            learnMoreAboutSecurity: 'Dowiedz się więcej o naszym bezpieczeństwie.',
        },
        subscriptionSettings: {
            title: 'Ustawienia subskrypcji',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Typ subskrypcji: ${subscriptionType}, Rozmiar subskrypcji: ${subscriptionSize}, Automatyczne odnawianie: ${autoRenew}, Automatyczne zwiększanie rocznej liczby miejsc: ${autoIncrease}`,
            none: 'brak',
            on: 'włączone',
            off: 'Wyłączone',
            annual: 'Roczny',
            autoRenew: 'Automatyczne odnawianie',
            autoIncrease: 'Automatyczne zwiększanie rocznych miejsc',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Oszczędzaj do ${amountWithCurrency}/miesiąc na aktywnego członka`,
            automaticallyIncrease:
                'Automatycznie zwiększ liczbę rocznych miejsc, aby uwzględnić aktywnych członków przekraczających rozmiar Twojej subskrypcji. Uwaga: spowoduje to wydłużenie daty zakończenia rocznej subskrypcji.',
            disableAutoRenew: 'Wyłącz automatyczne odnawianie',
            helpUsImprove: 'Pomóż nam ulepszyć Expensify',
            whatsMainReason: 'Jaki jest główny powód wyłączenia automatycznego odnawiania?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Odnowienie ${date}.`,
            pricingConfiguration: 'Cena zależy od konfiguracji. Aby uzyskać najniższą cenę, wybierz subskrypcję roczną i zamów kartę Expensify.',
            learnMore: {
                part1: 'Dowiedz się więcej na naszej',
                pricingPage: 'strona z cenami',
                part2: 'lub porozmawiaj z naszym zespołem w swoim',
                adminsRoom: '#pokój adminów.',
            },
            estimatedPrice: 'Szacowana cena',
            changesBasedOn: 'To zależy od korzystania z Twojej karty Expensify oraz od poniższych opcji subskrypcji.',
        },
        requestEarlyCancellation: {
            title: 'Poproś o wcześniejsze anulowanie',
            subtitle: 'Jaki jest główny powód, dla którego prosisz o wcześniejsze anulowanie?',
            subscriptionCanceled: {
                title: 'Subskrypcja anulowana',
                subtitle: 'Twoja roczna subskrypcja została anulowana.',
                info: 'Jeśli chcesz dalej korzystać ze swojego/swoich obszaru/obszarów roboczych w modelu płatności za użycie, wszystko jest gotowe.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Jeśli chcesz zapobiec przyszłej aktywności i obciążeniom, musisz <a href="${workspacesListRoute}">usunąć swoje przestrzenie robocze</a>. Pamiętaj, że po usunięciu przestrzeni roboczych zostaniesz obciążony za wszelką nierozliczoną aktywność powstałą w bieżącym miesiącu kalendarzowym.`,
            },
            requestSubmitted: {
                title: 'Żądanie zostało wysłane',
                subtitle:
                    'Dziękujemy za informację o chęci anulowania subskrypcji. Rozpatrujemy Twoją prośbę i wkrótce skontaktujemy się z Tobą przez czat z <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Składając wniosek o wcześniejsze rozwiązanie, potwierdzam i zgadzam się, że Expensify nie ma obowiązku uwzględnienia takiego wniosku na mocy <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Warunków świadczenia usług</a> Expensify ani innej obowiązującej umowy o świadczenie usług między mną a Expensify oraz że Expensify zachowuje wyłączną swobodę decyzji w zakresie uwzględnienia takiego wniosku.`,
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
        clearRoomDescription: 'wyczyścił opis pokoju',
        changedRoomAvatar: 'zmienił(a) awatar pokoju',
        removedRoomAvatar: 'usunął/usuwał awatar pokoju',
    },
    delegate: {
        switchAccount: 'Przełącz konta:',
        copilotDelegatedAccess: 'Copilot: Delegowany dostęp',
        copilotDelegatedAccessDescription: 'Pozwól innym członkom uzyskać dostęp do Twojego konta.',
        addCopilot: 'Dodaj kopilota',
        membersCanAccessYourAccount: 'Ci członkowie mogą uzyskać dostęp do Twojego konta:',
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
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `w imieniu ${delegator}`,
        accessLevel: 'Poziom dostępu',
        confirmCopilot: 'Potwierdź swojego kopilota poniżej.',
        accessLevelDescription: 'Wybierz poziom dostępu poniżej. Zarówno Pełny, jak i Ograniczony dostęp pozwalają kopilotom przeglądać wszystkie rozmowy i wydatki.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Zezwól innemu członkowi na wykonywanie wszystkich działań na Twoim koncie w Twoim imieniu. Obejmuje to czat, przesyłanie, zatwierdzanie, płatności, aktualizacje ustawień i więcej.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Zezwól innemu członkowi na wykonywanie większości działań na Twoim koncie w Twoim imieniu. Nie obejmuje to zatwierdzeń, płatności, odrzuceń i blokad.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Usuń Copilot',
        removeCopilotConfirmation: 'Czy na pewno chcesz usunąć tego copilota?',
        changeAccessLevel: 'Zmień poziom dostępu',
        makeSureItIsYou: 'Upewnijmy się, że to Ty',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby dodać copilota. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Wprowadź magiczny kod wysłany na ${contactMethod}, aby zaktualizować swojego copilota.`,
        notAllowed: 'Nie tak szybko...',
        noAccessMessage: dedent(`
            Jako kopilot nie masz dostępu do
            tej strony. Przepraszamy!
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `Jako <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> dla ${accountOwnerEmail} nie masz uprawnień do wykonania tej akcji. Przepraszamy!`,
        copilotAccess: 'Dostęp do Copilot',
    },
    debug: {
        debug: 'Debugowanie',
        details: 'Szczegóły',
        JSON: 'JSON',
        reportActions: 'Działania',
        reportActionPreview: 'Podgląd',
        nothingToPreview: 'Brak podglądu',
        editJson: 'Edytuj JSON:',
        preview: 'Podgląd:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Brak ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Nieprawidłowa właściwość: ${propertyName} - Oczekiwano: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Nieprawidłowa wartość – oczekiwano: ${expectedValues}`,
        missingValue: 'Brak wartości',
        createReportAction: 'Utwórz działanie raportu',
        reportAction: 'Akcja raportu',
        report: 'Raport',
        transaction: 'Transakcja',
        violations: 'Naruszenia',
        transactionViolation: 'Naruszenie transakcji',
        hint: 'Zmiany danych nie zostaną wysłane do backendu',
        textFields: 'Pola tekstowe',
        numberFields: 'Pola liczbowe',
        booleanFields: 'Pola typu Boolean',
        constantFields: 'Stałe pola',
        dateTimeFields: 'Pola DateTime',
        date: 'Data',
        time: 'Czas',
        none: 'Brak',
        visibleInLHN: 'Widoczne w LHN',
        GBR: 'Wielka Brytania',
        RBR: 'RBR',
        true: 'prawda',
        false: 'Fałsz',
        viewReport: 'Wyświetl raport',
        viewTransaction: 'Wyświetl transakcję',
        createTransactionViolation: 'Utwórz naruszenie transakcji',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ma wersję roboczą komentarza',
            hasGBR: 'Ma GBR',
            hasRBR: 'Ma RBR',
            pinnedByUser: 'Przypięte przez członka',
            hasIOUViolations: 'Ma naruszenia IOU',
            hasAddWorkspaceRoomErrors: 'Ma błędy podczas dodawania pokoju w przestrzeni roboczej',
            isUnread: 'Jest nieprzeczytane (tryb skupienia)',
            isArchived: 'Zarchiwizowane (najnowszy tryb)',
            isSelfDM: 'Jest własną wiadomością prywatną',
            isFocused: 'Jest tymczasowo skupiony',
        },
        reasonGBR: {
            hasJoinRequest: 'Ma prośbę o dołączenie (pokój administratora)',
            isUnreadWithMention: 'Nieprzeczytane z wzmianką',
            isWaitingForAssigneeToCompleteAction: 'Oczekiwanie, aż osoba przypisana wykona działanie',
            hasChildReportAwaitingAction: 'Raport podrzędny oczekuje na działanie',
            hasMissingInvoiceBankAccount: 'Brakuje rachunku bankowego faktury',
            hasUnresolvedCardFraudAlert: 'Ma nierozwiązane ostrzeżenie o oszustwie na karcie',
        },
        reasonRBR: {
            hasErrors: 'Zawiera błędy w danych raportu lub działaniach raportu',
            hasViolations: 'Ma naruszenia',
            hasTransactionThreadViolations: 'Ma naruszenia wątku transakcji',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Na raporcie czeka działanie',
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
        takeATestDrive: 'Wypróbuj wersję demonstracyjną',
    },
    migratedUserWelcomeModal: {
        title: 'Witamy w Nowym Expensify!',
        subtitle: 'Ma wszystko, co uwielbiasz w naszym klasycznym doświadczeniu, plus całą masę ulepszeń, które jeszcze bardziej ułatwią Ci życie:',
        confirmText: 'Zaczynajmy!',
        helpText: 'Wypróbuj 2‑minutowe demo',
        features: {
            search: 'Bardziej zaawansowane wyszukiwanie na urządzeniach mobilnych, w sieci i na komputerach stacjonarnych',
            concierge: 'Wbudowana sztuczna inteligencja Concierge, która pomoże zautomatyzować Twoje wydatki',
            chat: 'Czat na dowolnym wydatku, aby szybko rozwiązywać pytania',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Rozpocznij <strong>tutaj!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Zmień nazwę swoich zapisanych wyszukiwań</strong> tutaj!</tooltip>',
        accountSwitcher: '<tooltip>Uzyskaj dostęp do swoich <strong>kont Copilot</strong> tutaj</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Zeskanuj nasz przykładowy paragon</strong>, aby zobaczyć, jak to działa!</tooltip>',
            manager: '<tooltip>Wybierz naszego <strong>menedżera testów</strong>, aby go wypróbować!</tooltip>',
            confirmation: '<tooltip>Teraz <strong>złóż swój wydatek</strong> i zobacz, jak dzieje się magia!</tooltip>',
            tryItOut: 'Wypróbuj to',
        },
        outstandingFilter: '<tooltip>Filtruj wydatki,\nktóre <strong>wymagają zatwierdzenia</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Wyślij ten paragon, aby\n<strong>ukończyć jazdę testową!</strong></tooltip>',
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
            description: 'Upewnij się, że poniższe szczegóły wyglądają dla Ciebie dobrze. Gdy potwierdzisz rozmowę, wyślemy zaproszenie z dodatkowymi informacjami.',
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
        submittedExpensesTitle: 'Te wydatki zostały przesłane',
        submittedExpensesDescription: 'Te wydatki zostały wysłane do osoby zatwierdzającej, ale mogą być nadal edytowane, dopóki nie zostaną zatwierdzone.',
        pendingExpensesTitle: 'Oczekujące wydatki zostały przeniesione',
        pendingExpensesDescription: 'Wszelkie oczekujące wydatki z karty zostały przeniesione do osobnego raportu, dopóki nie zostaną zaksięgowane.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Wypróbuj w 2‑minutowym teście',
        },
        modal: {
            title: 'Wypróbuj nas w praktyce',
            description: 'Zrób krótką wycieczkę po produkcie, aby szybko nadrobić zaległości.',
            confirmText: 'Rozpocznij jazdę testową',
            helpText: 'Pomiń',
            employee: {
                description:
                    '<muted-text>Zapewnij swojemu zespołowi <strong>3 darmowe miesiące Expensify!</strong> Wpisz poniżej adres e‑mail swojego szefa i wyślij mu przykładowy wydatek.</muted-text>',
                email: 'Wpisz adres e-mail swojego szefa',
                error: 'Ten członek jest właścicielem przestrzeni roboczej, wprowadź nowego członka do testu.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Aktualnie testujesz Expensify',
            readyForTheRealThing: 'Gotowy na prawdziwą wersję?',
            getStarted: 'Rozpocznij',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) => `# ${name} zaprosił Cię do przetestowania Expensify
Cześć! Właśnie załatwiłem(-am) nam *3 miesiące za darmo*, aby przetestować Expensify, najszybszy sposób rozliczania wydatków.

Oto *paragon testowy*, aby pokazać Ci, jak to działa:`,
    },
    export: {
        basicExport: 'Podstawowy eksport',
        reportLevelExport: 'Wszystkie dane – poziom raportu',
        expenseLevelExport: 'Wszystkie dane – poziom wydatku',
        exportInProgress: 'Eksport w toku',
        conciergeWillSend: 'Concierge wkrótce wyśle Ci plik.',
    },
    domain: {
        notVerified: 'Niezweryfikowane',
        retry: 'Ponów próbę',
        verifyDomain: {
            title: 'Zweryfikuj domenę',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Zanim przejdziesz dalej, potwierdź, że jesteś właścicielem domeny <strong>${domainName}</strong>, aktualizując jej ustawienia DNS.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Uzyskaj dostęp do swojego dostawcy DNS i otwórz ustawienia DNS dla <strong>${domainName}</strong>.`,
            addTXTRecord: 'Dodaj następujący rekord TXT:',
            saveChanges: 'Zapisz zmiany i wróć tutaj, aby zweryfikować swoją domenę.',
            youMayNeedToConsult: `Możesz potrzebować pomocy działu IT swojej organizacji, aby dokończyć weryfikację. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Dowiedz się więcej</a>.`,
            warning: 'Po weryfikacji wszyscy członkowie Expensify w Twojej domenie otrzymają e-mail z informacją, że ich konto będzie zarządzane w ramach Twojej domeny.',
            codeFetchError: 'Nie można pobrać kodu weryfikacyjnego',
            genericError: 'Nie udało się zweryfikować Twojej domeny. Spróbuj ponownie i skontaktuj się z Concierge, jeśli problem będzie się powtarzał.',
        },
        domainVerified: {
            title: 'Domena zweryfikowana',
            header: 'Wooo! Twoja domena została zweryfikowana',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Domena <strong>${domainName}</strong> została pomyślnie zweryfikowana i możesz teraz skonfigurować SAML oraz inne funkcje zabezpieczeń.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Pojedyncze logowanie SAML (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> to funkcja zabezpieczeń, która daje Ci większą kontrolę nad tym, w jaki sposób członkowie korzystający z adresów e-mail <strong>${domainName}</strong> logują się do Expensify. Aby ją włączyć, musisz potwierdzić, że jesteś autoryzowanym administratorem firmy.</muted-text>`,
            fasterAndEasierLogin: 'Szybsze i łatwiejsze logowanie',
            moreSecurityAndControl: 'Większe bezpieczeństwo i kontrola',
            onePasswordForAnything: 'Jedno hasło do wszystkiego',
        },
        goToDomain: 'Przejdź do domeny',
        samlLogin: {
            title: 'Logowanie SAML',
            subtitle: `<muted-text>Skonfiguruj logowanie członków za pomocą <a href="${CONST.SAML_HELP_URL}">pojedynczego logowania SAML (SSO).</a></muted-text>`,
            enableSamlLogin: 'Włącz logowanie SAML',
            allowMembers: 'Zezwól członkom logować się za pomocą SAML.',
            requireSamlLogin: 'Wymagaj logowania SAML',
            anyMemberWillBeRequired: 'Każdy członek zalogowany inną metodą będzie musiał ponownie się uwierzytelnić przy użyciu SAML.',
            enableError: 'Nie można było zaktualizować ustawienia włączenia SAML',
            requireError: 'Nie udało się zaktualizować ustawienia wymogu SAML',
        },
        samlConfigurationDetails: {
            title: 'Szczegóły konfiguracji SAML',
            subtitle: 'Użyj tych danych, aby skonfigurować SAML.',
            identityProviderMetaData: 'MetaDane dostawcy tożsamości',
            entityID: 'Identyfikator jednostki',
            nameIDFormat: 'Format identyfikatora nazwy',
            loginUrl: 'Adres URL logowania',
            acsUrl: 'Adres URL usługi ACS (Assertion Consumer Service)',
            logoutUrl: 'Adres URL wylogowania',
            sloUrl: 'Adres URL SLO (Single Logout)',
            serviceProviderMetaData: 'Metadane dostawcy usługi',
            oktaScimToken: 'Token SCIM Okta',
            revealToken: 'Pokaż token',
            fetchError: 'Nie można pobrać szczegółów konfiguracji SAML',
            setMetadataGenericError: 'Nie można ustawić metadanych SAML',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
