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
        cancel: 'Anuleaz\u0103',
        dismiss: 'Respinge',
        yes: 'Da',
        no: 'As an AI, I need the text you want to translate to Romanian. Please provide the text.',
        ok: "Since you didn't provide any text to translate, I can't assist you. Please provide the text you want translated.",
        notNow: 'Nu acum',
        learnMore: 'Afla\u021Bi mai multe.',
        buttonConfirm: 'Am \u00EEn\u021Beles',
        name: 'Nume',
        attachment: 'Ata\u0219ament',
        attachments: 'Ata\u0219amente',
        center: 'Centru',
        from: 'Din',
        to: 'La',
        in: '\u00CEmi pare r\u0103u, dar nu a\u021Bi furnizat niciun text pentru a fi tradus.',
        optional: 'Op\u021Bional',
        new: 'Nou',
        search: 'C\u0103utare',
        reports: 'Rapoarte',
        find: 'G\u0103se\u0219te',
        searchWithThreeDots: 'Caut\u0103...',
        next: 'Urm\u0103torul',
        previous: 'Anterior',
        goBack: '\u00CEnapoi',
        create: 'Creeaz\u0103',
        add: 'Adaug\u0103',
        resend: 'Retrimite',
        save: 'Salveaz\u0103',
        select: 'Selecteaz\u0103',
        selectMultiple: 'Selecteaz\u0103 multiple',
        saveChanges: 'Salveaz\u0103 modific\u0103rile',
        submit: 'Trimite',
        rotate: 'Roteaz\u0103',
        zoom: 'Zoom',
        password: 'Parol\u0103',
        magicCode: 'Cod magic',
        twoFactorCode: 'Codul cu dou\u0103 factori',
        workspaces: 'Spa\u021Bii de lucru',
        inbox: 'Inbox',
        group: 'Grup',
        profile: 'Profil',
        referral: 'Recomandare',
        payments: 'Pl\u0103\u021Bi',
        approvals: 'Aprob\u0103ri',
        wallet: 'Portofel',
        preferences: 'Preferin\u021Be',
        view: 'Vizualizeaz\u0103',
        review: 'Recenzie',
        not: "Sorry, there's no text provided for translation. Please provide the text you want to be translated.",
        signIn: 'Conecteaz\u0103-te',
        signInWithGoogle: 'Conecteaz\u0103-te cu Google',
        signInWithApple: 'Conecteaz\u0103-te cu Apple',
        signInWith: 'Conecteaz\u0103-te cu',
        continue:
            '\u00CEmi pare r\u0103u, dar nu a\u021Bi furnizat niciun text pentru a fi tradus. V\u0103 rug\u0103m s\u0103 furniza\u021Bi textul pe care dori\u021Bi s\u0103 \u00EEl traduc.',
        firstName: 'Prenume',
        lastName: 'Nume de familie',
        addCardTermsOfService: 'Termeni \u0219i Condi\u021Bii de Utilizare Expensify',
        perPerson: 'pe persoan\u0103',
        phone: 'Telefon',
        phoneNumber: 'Num\u0103r de telefon',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: '\u0219i',
        or: 'sau',
        details: 'Detalii',
        privacy: 'Confiden\u021Bialitate',
        privacyPolicy: 'Politica de Confiden\u021Bialitate',
        hidden: 'Ascuns',
        visible: 'Vizibil',
        delete: '\u0218terge',
        archived: 'arhivat',
        contacts: 'Contacte',
        recents: 'Recente',
        close: '\u00CEnchide',
        download: 'Descarc\u0103',
        downloading: 'Desc\u0103rcare',
        uploading: '\u00CEnc\u0103rcare',
        pin: 'Ace',
        unPin: 'Anuleaz\u0103 fixarea',
        back: '\u00CEnapoi',
        saveAndContinue: 'Salveaz\u0103 & continu\u0103',
        settings: 'Set\u0103ri',
        termsOfService: 'Termeni \u0219i Condi\u021Bii',
        members: 'Membri',
        invite: 'Invita\u021Bie',
        here: 'aici',
        date: 'Data',
        dob: 'Data na\u0219terii',
        currentYear: 'Anul curent',
        currentMonth: 'Luna curent\u0103',
        ssnLast4: 'Ultimele 4 cifre ale CNP',
        ssnFull9: 'Cele 9 cifre ale CNP',
        addressLine: ({lineNumber}: AddressLineParams) => `Linia de adres\u0103 ${lineNumber}`,
        personalAddress: 'Adres\u0103 personal\u0103',
        companyAddress: 'Adresa companiei',
        noPO: 'F\u0103r\u0103 cutii po\u0219tale sau adrese de depozitare a coresponden\u021Bei, v\u0103 rog.',
        city: 'Ora\u0219',
        state: 'Stare',
        streetAddress: 'Adresa str\u0103zii',
        stateOrProvince: 'Stat / Provincie',
        country: '\u021Aar\u0103',
        zip: 'Cod po\u0219tal',
        zipPostCode: 'Cod po\u0219tal',
        whatThis: "I'm sorry, but there's no text provided for translation. Could you please provide the text you want translated?",
        iAcceptThe: 'Eu accept',
        remove: 'Elimina\u021Bi',
        admin: 'Admin',
        owner: 'Proprietar',
        dateFormat: 'AAAA-LL-ZZ',
        send: 'Trimite',
        na: 'The task does not provide a specific text to translate. Please provide the text for translation.',
        noResultsFound: 'Nu au fost g\u0103site rezultate',
        recentDestinations: 'Destina\u021Bii recente',
        timePrefix: 'Este',
        conjunctionFor: 'pentru',
        todayAt: 'Ast\u0103zi la',
        tomorrowAt: 'M\u00E2ine la',
        yesterdayAt: 'Ieri la',
        conjunctionAt: 'la',
        conjunctionTo:
            "translate: \"E\u0219ti un traduc\u0103tor profesionist. Tradu textul urm\u0103tor \u00EEn ro. Acesta poate fi un \u0219ir simplu sau o func\u021Bie TypeScript care returneaz\u0103 un \u0219ir de \u0219abloane. P\u0103streaz\u0103 substituen\u021Bii ca ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc f\u0103r\u0103 a le modifica con\u021Binutul sau a elimina parantezele. Con\u021Binutul substituen\u021Bilor este descriptiv pentru ceea ce reprezint\u0103 \u00EEn fraz\u0103, dar poate include expresii ternare sau alt cod TypeScript.\"",
        genericErrorMessage: 'Hopa... ceva nu a mers bine \u0219i cererea ta nu a putut fi finalizat\u0103. Te rog \u00EEncearc\u0103 din nou mai t\u00E2rziu.',
        percentage: 'Procentaj',
        error: {
            invalidAmount: 'Sum\u0103 invalid\u0103.',
            acceptTerms: 'Trebuie s\u0103 accep\u021Bi Termenii \u0219i Condi\u021Biile pentru a continua.',
            phoneNumber: `V\u0103 rug\u0103m s\u0103 introduce\u021Bi un num\u0103r de telefon valid, cu codul \u021B\u0103rii (de exemplu, ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Acest c\u00E2mp este obligatoriu.',
            requestModified: 'Aceast\u0103 cerere este modificat\u0103 de un alt membru.',
            characterLimit: ({limit}: CharacterLimitParams) => `Dep\u0103\u0219e\u0219te lungimea maxim\u0103 de ${limit} caractere`,
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Limita de caractere dep\u0103\u0219it\u0103 (${length}/${limit})`,
            dateInvalid: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi o dat\u0103 valid\u0103.',
            invalidDateShouldBeFuture: 'V\u0103 rug\u0103m s\u0103 alege\u021Bi data de ast\u0103zi sau o dat\u0103 viitoare.',
            invalidTimeShouldBeFuture: 'V\u0103 rug\u0103m s\u0103 alege\u021Bi un moment cel pu\u021Bin un minut \u00EEnainte.',
            invalidCharacter: 'Caracter invalid.',
            enterMerchant: 'Introduce\u021Bi un nume de comerciant.',
            enterAmount: 'Introduce\u021Bi o sum\u0103.',
            enterDate: 'Introduce\u021Bi o dat\u0103.',
            invalidTimeRange: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi ora folosind formatul de 12 ore (de exemplu, 2:30 PM).',
            pleaseCompleteForm: 'V\u0103 rug\u0103m s\u0103 completa\u021Bi formularul de mai sus pentru a continua.',
            pleaseSelectOne: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi o op\u021Biune de mai sus.',
            invalidRateError: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o rat\u0103 valid\u0103.',
            lowRateError: 'Rata trebuie s\u0103 fie mai mare dec\u00E2t 0.',
            email: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o adres\u0103 de email valid\u0103.',
        },
        comma: 'virgul\u0103',
        semicolon: 'punct \u0219i virgul\u0103',
        please: 'Te rog',
        contactUs: 'contacteaz\u0103-ne',
        pleaseEnterEmailOrPhoneNumber: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un email sau un num\u0103r de telefon',
        fixTheErrors: 'corecteaz\u0103 erorile',
        inTheFormBeforeContinuing: '\u00EEn formular \u00EEnainte de a continua',
        confirm: 'Confirm\u0103',
        reset: 'Resetare',
        done: 'Pentru a putea traduce, am nevoie de un text sau o func\u021Bie TypeScript pe care s\u0103 o traduc. V\u0103 rug\u0103m s\u0103 furniza\u021Bi textul sau func\u021Bia TypeScript.',
        more: 'Mai mult',
        debitCard: 'Card de debit',
        bankAccount: 'Cont bancar',
        personalBankAccount: 'Cont personal bancar',
        businessBankAccount: 'Cont bancar de afaceri',
        join: 'Al\u0103tur\u0103-te',
        leave: 'Pleac\u0103',
        decline: 'Refuz\u0103',
        transferBalance: 'Transfera\u021Bi soldul',
        cantFindAddress: 'Nu g\u0103si\u021Bi adresa dumneavoastr\u0103?',
        enterManually: 'Introduce\u021Bi-l manual',
        message: 'Mesaj',
        leaveThread: 'P\u0103r\u0103se\u0219te firul',
        you: 'Tu',
        youAfterPreposition: 'tu',
        your: 't\u0103u',
        conciergeHelp: 'V\u0103 rug\u0103m s\u0103 contacta\u021Bi Concierge pentru ajutor.',
        youAppearToBeOffline: 'Se pare c\u0103 e\u0219ti deconectat.',
        thisFeatureRequiresInternet: 'Aceast\u0103 func\u021Bie necesit\u0103 o conexiune la internet activ\u0103.',
        attachementWillBeAvailableOnceBackOnline: 'Ata\u0219amentul va deveni disponibil odat\u0103 ce te reconectezi la internet.',
        areYouSure: 'E\u0219ti sigur?',
        verify: 'Verific\u0103',
        yesContinue: 'Da, continu\u0103',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) =>
            zipSampleFormat
                ? `de ex. ${zipSampleFormat}`
                : 'As a language model AI developed by OpenAI, I need the original text in order to provide the translation. Please provide the text you want to be translated.',
        description: 'Descriere',
        with: 'cu',
        shareCode: '\u00CEmp\u0103rt\u0103\u0219e\u0219te codul',
        share: 'Distribuie',
        per: "\"Tu e\u0219ti un traduc\u0103tor profesionist. Tradu urm\u0103torul text \u00EEn ro. Acesta poate fi un \u0219ir simplu sau o func\u021Bie TypeScript care returneaz\u0103 un \u0219ir de caractere. P\u0103streaz\u0103 substituen\u021Bii ca ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc f\u0103r\u0103 a modifica con\u021Binutul lor sau a elimina parantezele. Con\u021Binutul substituen\u021Bilor este descriptiv pentru ceea ce reprezint\u0103 \u00EEn fraz\u0103, dar poate include expresii ternare sau alt cod TypeScript.\"",
        mi: 'kilometru',
        km: 'kilometru',
        copied: 'Copiat!',
        someone: 'Cineva',
        total: 'Total',
        edit: 'Editare',
        letsDoThis: `Let's do this!`,
        letsStart: `Let's start`,
        showMore: 'Arat\u0103 mai mult',
        merchant: 'Comerciant',
        category: 'Categorie',
        billable: 'Facturabil',
        nonBillable: 'Nefacturabil',
        tag: 'Etichet\u0103',
        receipt: 'Chitan\u021B\u0103',
        verified: 'Verificat',
        replace: '\u00CEnlocuie\u0219te',
        distance: 'Distan\u021B\u0103',
        mile: 'kilometru',
        miles: 'mile',
        kilometer: 'kilometru',
        kilometers: 'kilometri',
        recent: 'Recent',
        all: 'Toate',
        am: "Sunte\u021Bi un traduc\u0103tor profesionist. Traduce\u021Bi urm\u0103torul text \u00EEn ro. Este fie un \u0219ir simplu, fie o func\u021Bie TypeScript care returneaz\u0103 un \u0219ir de caractere \u0219ablon. P\u0103stra\u021Bi substituen\u021Bii ca ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc f\u0103r\u0103 a le modifica con\u021Binutul sau a elimina parantezele. Con\u021Binutul substituen\u021Bilor este descriptiv pentru ceea ce reprezint\u0103 \u00EEn fraz\u0103, dar poate include expresii ternare sau alt cod TypeScript.",
        pm: '\u00CEmi pare r\u0103u, dar nu a\u021Bi furnizat niciun text pentru a fi tradus. V\u0103 rug\u0103m s\u0103 furniza\u021Bi textul pe care dori\u021Bi s\u0103 \u00EEl traduc.',
        tbd: 'Fiindc\u0103 nu a\u021Bi furnizat niciun text pentru a fi tradus, nu pot realiza traducerea. V\u0103 rug\u0103m s\u0103 furniza\u021Bi un text sau o func\u021Bie TypeScript pentru a continua.',
        selectCurrency: 'Selecteaz\u0103 o moned\u0103',
        card: 'Carte',
        whyDoWeAskForThis: 'De ce solicit\u0103m acest lucru?',
        required: 'Necesar',
        showing: 'Afi\u0219are',
        of: 'de',
        default: 'Implicit',
        update: 'Actualizare',
        member: 'Membru',
        auditor: 'Auditor',
        role: 'Rol',
        currency: 'Moned\u0103',
        rate: 'Rat\u0103',
        emptyLHN: {
            title: 'Woohoo! E\u0219ti la zi.',
            subtitleText1: 'G\u0103se\u0219te o conversa\u021Bie folosind ${username}',
            subtitleText2: 'butonul de mai sus, sau crea\u021Bi ceva folosind',
            subtitleText3: 'butonul de mai jos.',
        },
        businessName: 'Numele afacerii',
        clear: 'Clar',
        type: 'The original text is missing. Please provide the text you want to translate.',
        action: 'Ac\u021Biune',
        expenses: 'Cheltuieli',
        tax: 'Impozit',
        shared: '\u00CEmp\u0103rt\u0103\u0219it',
        drafts: 'Schi\u021Be',
        finished: 'Finalizat',
        upgrade: 'Actualizare',
        downgradeWorkspace: 'Retrogradeaz\u0103 spa\u021Biul de lucru',
        companyID: 'ID-ul companiei',
        userID: 'ID utilizator',
        disable: 'Dezactiveaz\u0103',
        export: 'Export\u0103',
        initialValue: 'Valoare ini\u021Bial\u0103',
        currentDate: 'Data curent\u0103',
        value: 'Valoare',
        downloadFailedTitle: 'Desc\u0103rcarea a e\u0219uat',
        downloadFailedDescription: 'Desc\u0103rcarea dvs. nu a putut fi finalizat\u0103. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
        filterLogs: 'Filtreaz\u0103 Jurnalele',
        network: 'Re\u021Bea',
        reportID: 'ID raport',
        bankAccounts: 'Conturi bancare',
        chooseFile: 'Alege\u021Bi fi\u0219ierul',
        dropTitle: 'Lasa-o balta',
        dropMessage: 'Arunca\u021Bi fi\u0219ierul dvs. aici',
        ignore: 'As a language model AI developed by OpenAI, I need the text you want to translate into Romanian to provide an accurate translation. Please provide the text in your next input.',
        enabled: 'Activat',
        disabled: 'Dezactivat',
        import: 'Import\u0103',
        offlinePrompt: 'Nu po\u021Bi \u00EEntreprinde aceast\u0103 ac\u021Biune acum.',
        outstanding: 'Remarcabil',
        chats: 'Discu\u021Bii',
        unread: 'Necitit',
        sent: 'Trimis',
        links: 'Leg\u0103turi',
        days: 'zile',
        rename: 'Redenumire',
        address: 'Adres\u0103',
        hourAbbreviation: "You haven't provided any text to translate. Please provide the text you want translated.",
        minuteAbbreviation: "Sorry, but you haven't provided any text to translate. Please provide the text you want to translate.",
        skip: 'Omite\u021Bi',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Ai nevoie de ceva anume? Discut\u0103 cu managerul t\u0103u de cont, ${accountManagerDisplayName}.`,
        chatNow: 'Discut\u0103 acum',
        destination: 'Destina\u021Bie',
        subrate:
            "E\u0219ti un traduc\u0103tor profesionist. Tradu textul urm\u0103tor \u00EEn ro. Acesta poate fi fie un \u0219ir simplu, fie o func\u021Bie TypeScript care returneaz\u0103 un \u0219ir de caractere model. P\u0103streaz\u0103 substituen\u021Bii ca ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc f\u0103r\u0103 a le modifica con\u021Binutul sau a \u00EEnl\u0103tura parantezele. Con\u021Binutul substituen\u021Bilor descrie ceea ce reprezint\u0103 \u00EEn fraz\u0103, dar poate include expresii ternare sau alt cod TypeScript.",
        perDiem: 'Pe zi',
        validate: 'Valida\u021Bi',
    },
    supportalNoAccess: {
        title: 'Nu at\u00E2t de repede',
        description: 'Nu ave\u021Bi autorizarea pentru a efectua aceast\u0103 ac\u021Biune c\u00E2nd suportul este conectat.',
    },
    location: {
        useCurrent: 'Utiliza\u021Bi loca\u021Bia curent\u0103',
        notFound: 'Nu am putut g\u0103si loca\u021Bia dvs. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou sau s\u0103 introduce\u021Bi o adres\u0103 manual.',
        permissionDenied: 'Se pare c\u0103 ai refuzat accesul la loca\u021Bia ta.',
        please: 'Te rog',
        allowPermission: 'permite accesul la loca\u021Bie \u00EEn set\u0103ri',
        tryAgain: '\u0219i \u00EEncearc\u0103 din nou.',
    },
    anonymousReportFooter: {
        logoTagline: 'Al\u0103tur\u0103-te discu\u021Biei.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Acces la camer\u0103',
        expensifyDoesntHaveAccessToCamera: 'Expensify nu poate face fotografii f\u0103r\u0103 acces la camera dvs. Ap\u0103sa\u021Bi pe set\u0103ri pentru a actualiza permisiunile.',
        attachmentError: 'Eroare de ata\u0219ament',
        errorWhileSelectingAttachment: 'A ap\u0103rut o eroare la selectarea unui ata\u0219ament. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        errorWhileSelectingCorruptedAttachment:
            'A ap\u0103rut o eroare \u00EEn timpul select\u0103rii unui ata\u0219ament corupt. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi un alt fi\u0219ier.',
        takePhoto: 'F\u0103 o fotografie',
        chooseFromGallery: 'Alege\u021Bi din galerie',
        chooseDocument: 'Alege\u021Bi fi\u0219ierul',
        attachmentTooLarge: 'Ata\u0219amentul este prea mare',
        sizeExceeded: 'Dimensiunea ata\u0219amentului este mai mare dec\u00E2t limita de 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Dimensiunea ata\u0219amentului este mai mare dec\u00E2t limita de ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Ata\u0219amentul este prea mic',
        sizeNotMet: 'Dimensiunea ata\u0219amentului trebuie s\u0103 fie mai mare de 240 de bytes',
        wrongFileType: 'Tip de fi\u0219ier invalid',
        notAllowedExtension: 'Acest tip de fi\u0219ier nu este permis. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi un alt tip de fi\u0219ier.',
        folderNotAllowedMessage: '\u00CEnc\u0103rcarea unui dosar nu este permis\u0103. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi un fi\u0219ier diferit.',
        protectedPDFNotSupported: 'PDF-ul protejat cu parol\u0103 nu este suportat',
        attachmentImageResized: 'Aceast\u0103 imagine a fost redimensionat\u0103 pentru previzualizare. Desc\u0103rca\u021Bi pentru rezolu\u021Bie complet\u0103.',
        attachmentImageTooLarge: 'Aceast\u0103 imagine este prea mare pentru a fi previzualizat\u0103 \u00EEnainte de \u00EEnc\u0103rcare.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Pute\u021Bi \u00EEnc\u0103rca doar p\u00E2n\u0103 la ${fileLimit} fi\u0219iere odat\u0103.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) =>
            `Fi\u0219ierele dep\u0103\u0219esc ${maxUploadSizeInMB} MB. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.`,
    },
    filePicker: {
        fileError: 'Eroare de fi\u0219ier',
        errorWhileSelectingFile: 'A ap\u0103rut o eroare \u00EEn timpul select\u0103rii unui fi\u0219ier. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
    },
    connectionComplete: {
        title: 'Conexiune complet\u0103',
        supportingText: 'Pute\u021Bi \u00EEnchide aceast\u0103 fereastr\u0103 \u0219i s\u0103 v\u0103 \u00EEntoarce\u021Bi la aplica\u021Bia Expensify.',
    },
    avatarCropModal: {
        title: 'Editeaz\u0103 fotografia',
        description: 'Trage\u021Bi, m\u0103ri\u021Bi \u0219i roti\u021Bi imaginea dup\u0103 cum dori\u021Bi.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nu a fost g\u0103sit\u0103 nicio extensie pentru tipul mime',
        problemGettingImageYouPasted: 'A ap\u0103rut o problem\u0103 la ob\u021Binerea imaginii pe care ai lipit-o',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Lungimea maxim\u0103 a comentariului este de ${formattedMaxLength} caractere.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Lungimea maxim\u0103 a titlului unei sarcini este de ${formattedMaxLength} caractere.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Actualizeaz\u0103 aplica\u021Bia',
        updatePrompt:
            'O nou\u0103 versiune a acestei aplica\u021Bii este disponibil\u0103.\nActualiza\u021Bi acum sau reporni\u021Bi aplica\u021Bia mai t\u00E2rziu pentru a desc\u0103rca cele mai recente modific\u0103ri.',
    },
    deeplinkWrapper: {
        launching: 'Lansarea Expensify',
        expired: 'Sesiunea dvs. a expirat.',
        signIn: 'V\u0103 rug\u0103m s\u0103 v\u0103 autentifica\u021Bi din nou.',
        redirectedToDesktopApp: 'V-am redirec\u021Bionat c\u0103tre aplica\u021Bia pentru desktop.',
        youCanAlso: 'De asemenea, po\u021Bi',
        openLinkInBrowser: 'deschide acest link \u00EEn browserul t\u0103u',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `Sunte\u021Bi conectat ca ${email}. Face\u021Bi clic pe "Deschide\u021Bi link-ul" \u00EEn prompt pentru a v\u0103 conecta la aplica\u021Bia de desktop cu acest cont.`,
        doNotSeePrompt: 'Nu po\u021Bi vedea promptul?',
        tryAgain: '\u00CEncearc\u0103 din nou',
        or: ', sau',
        continueInWeb: 'continua\u021Bi la aplica\u021Bia web',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra,\ne\u0219ti autentificat!',
        successfulSignInDescription: 'Reveni\u021Bi la fila original\u0103 pentru a continua.',
        title: 'Iat\u0103 codul t\u0103u magic',
        description: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul de pe dispozitivul\nunde a fost cerut ini\u021Bial',
        doNotShare: 'Nu \u00EEmp\u0103rt\u0103\u0219i\u021Bi codul dvs. cu nimeni.\nExpensify nu v\u0103 va cere niciodat\u0103 acest lucru!',
        or: ', sau',
        signInHere: 'doar conecteaz\u0103-te aici',
        expiredCodeTitle: 'Codul magic a expirat',
        expiredCodeDescription: '\u00CEntoarce-te la dispozitivul original \u0219i cere un cod nou',
        successfulNewCodeRequest: 'Cod solicitat. Te rog verific\u0103-\u021Bi dispozitivul.',
        tfaRequiredTitle: 'Este necesar\u0103 autentificarea \u00EEn doi pa\u0219i',
        tfaRequiredDescription: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul de autentificare \u00EEn doi pa\u0219i\nunde \u00EEncerca\u021Bi s\u0103 v\u0103 autentifica\u021Bi.',
        requestOneHere: 'solicita\u021Bi unul aici.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Pl\u0103tit de',
        whatsItFor: 'La ce folose\u0219te?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nume, email sau num\u0103r de telefon',
        findMember: 'G\u0103se\u0219te un membru',
    },
    emptyList: {
        [CONST.IOU.TYPE.SUBMIT]: {
            title: 'Trimite o cheltuial\u0103',
            subtitleText1: 'Supune-te cuiva \u0219i',
            subtitleText2: `ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            subtitleText3: 'c\u00E2nd devin un client.',
        },
        [CONST.IOU.TYPE.SPLIT]: {
            title: '\u00CEmparte o cheltuial\u0103',
            subtitleText1: '\u00CEmparte cu un prieten \u0219i',
            subtitleText2: `ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            subtitleText3: 'c\u00E2nd devin un client.',
        },
        [CONST.IOU.TYPE.PAY]: {
            title: 'Pl\u0103te\u0219te pe cineva',
            subtitleText1: 'Pl\u0103te\u0219te oricine \u0219i',
            subtitleText2: `ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            subtitleText3: 'c\u00E2nd devin un client.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Rezerva\u021Bi un apel',
    },
    hello: 'Bun\u0103',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '\u00CEncepe\u021Bi mai jos.',
        anotherLoginPageIsOpen: 'O alt\u0103 pagin\u0103 de autentificare este deschis\u0103.',
        anotherLoginPageIsOpenExplanation: 'Ai deschis pagina de autentificare \u00EEntr-un tab separat. Te rog s\u0103 te autentifici din acel tab.',
        welcome: 'Bine ai venit!',
        welcomeWithoutExclamation: 'Bine ai venit',
        phrase2: 'Banii vorbesc. \u0218i acum c\u0103 chatul \u0219i pl\u0103\u021Bile sunt \u00EEn acela\u0219i loc, este de asemenea u\u0219or.',
        phrase3: 'Pl\u0103\u021Bile tale ajung la tine la fel de repede cum po\u021Bi s\u0103-\u021Bi exprimi punctul de vedere.',
        enterPassword: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi parola dvs.',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul magic trimis la ${login}. Ar trebui s\u0103 ajung\u0103 \u00EEntr-un minut sau dou\u0103.`,
    },
    login: {
        hero: {
            header: 'C\u0103l\u0103torii \u0219i cheltuieli, la viteza unei conversa\u021Bii',
            body: 'Bine a\u021Bi venit la urm\u0103toarea genera\u021Bie de Expensify, unde c\u0103l\u0103toriile \u0219i cheltuielile dvs. se mi\u0219c\u0103 mai repede cu ajutorul chatului contextual, \u00EEn timp real.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Sunte\u021Bi deja autentificat ca ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Nu vrei s\u0103 te autentifici cu ${provider}?`,
        continueWithMyCurrentSession: 'Continua\u021Bi cu sesiunea mea curent\u0103',
        redirectToDesktopMessage: 'Te vom redirec\u021Biona c\u0103tre aplica\u021Bia de desktop odat\u0103 ce ai terminat procesul de autentificare.',
        signInAgreementMessage: 'Prin autentificare, e\u0219ti de acord cu',
        termsOfService: 'Termeni \u0219i Condi\u021Bii',
        privacy: 'Confiden\u021Bialitate',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continua\u021Bi conectarea cu autentificare unic\u0103:',
        orContinueWithMagicCode: 'De asemenea, te po\u021Bi autentifica cu un cod magic',
        useSingleSignOn: 'Utiliza\u021Bi autentificarea unic\u0103',
        useMagicCode: 'Folose\u0219te codul magic',
        launching: 'Lansare...',
        oneMoment: 'Un moment \u00EEn timp ce v\u0103 redirec\u021Bion\u0103m c\u0103tre portalul de autentificare unic al companiei dumneavoastr\u0103.',
    },
    reportActionCompose: {
        dropToUpload: 'Glisa\u021Bi pentru a \u00EEnc\u0103rca',
        sendAttachment: 'Trimite ata\u0219amentul',
        addAttachment: 'Adaug\u0103 ata\u0219ament',
        writeSomething: 'Could you please provide the text that needs to be translated?',
        blockedFromConcierge: 'Comunicarea este interzis\u0103',
        fileUploadFailed: '\u00CEnc\u0103rcarea a e\u0219uat. Fi\u0219ierul nu este suportat.',
        localTime: ({user, time}: LocalTimeParams) => `Este ${time} pentru ${user}`,
        edited: "You didn't provide any text to translate. Please provide the text you want translated.",
        emoji: 'Emoji',
        collapse: 'Restr\u00E2nge\u021Bi',
        expand: 'Sure, I can help you with that. However, I need the text or TypeScript function that you want to translate into Romanian. Please provide the text or code.',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Copia\u021Bi \u00EEn clipboard',
        copied: 'Copiat!',
        copyLink: 'Copia\u021Bi linkul',
        copyURLToClipboard: 'Copia\u021Bi URL-ul \u00EEn clipboard',
        copyEmailToClipboard: 'Copia\u021Bi emailul \u00EEn clipboard',
        markAsUnread: 'Marcheaz\u0103 ca necitit',
        markAsRead: 'Marcheaz\u0103 ca citit',
        editAction: ({action}: EditActionParams) => `Edita\u021Bi ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'cheltuiala' : 'comentariu'}`,
        deleteAction: ({action}: DeleteActionParams) => `\u0218terge\u021Bi ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'cheltuiala' : 'comentariu'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi acest ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'cheltuială' : 'comentariu'}?`,
        onlyVisible: 'Vizibil doar pentru',
        replyInThread: 'R\u0103spunde \u00EEn firul de discu\u021Bii',
        joinThread: 'Al\u0103tur\u0103-te discu\u021Biei',
        leaveThread: 'P\u0103r\u0103se\u0219te firul',
        copyOnyxData: 'Copia\u021Bi datele Onyx',
        flagAsOffensive: 'Semnalizeaz\u0103 ca fiind ofensator',
        menu: 'Meniu',
    },
    emojiReactions: {
        addReactionTooltip: 'Adaug\u0103 reac\u021Bie',
        reactedWith: 'a reactionat cu',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Ai ratat petrecerea \u00EEn',
        beginningOfArchivedRoomPartTwo: ', nu este nimic de v\u0103zut aici.',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `Aceast\u0103 conversa\u021Bie este cu to\u021Bi membrii Expensify de pe domeniul ${domainRoom}.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Utiliza\u021Bi-l pentru a discuta cu colegii, a \u00EEmp\u0103rt\u0103\u0219i sfaturi \u0219i a pune \u00EEntreb\u0103ri.',
        beginningOfChatHistoryAdminRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => `Aceast\u0103 conversa\u021Bie este cu administratorii ${workspaceName}.`,
        beginningOfChatHistoryAdminRoomPartTwo: 'Folose\u0219te-l pentru a discuta despre configurarea spa\u021Biului de lucru \u0219i multe altele.',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) =>
            `Aceast\u0103 conversa\u021Bie este cu toat\u0103 lumea din ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: ` Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoomPartOne: 'Aceast\u0103 camer\u0103 de chat este pentru orice',
        beginningOfChatHistoryUserRoomPartTwo: 'asociat.',
        beginningOfChatHistoryInvoiceRoomPartOne: `This chat is for invoices between `,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Use the + button to send an invoice.`,
        beginningOfChatHistory: 'Aceast\u0103 conversa\u021Bie este cu ${username}',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'Acesta este locul unde',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'va trimite cheltuielile la',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Folose\u0219te doar butonul +.',
        beginningOfChatHistorySelfDM: 'Acesta este spa\u021Biul t\u0103u personal. Folose\u0219te-l pentru noti\u021Be, sarcini, schi\u021Be \u0219i memento-uri.',
        beginningOfChatHistorySystemDM: 'Bun venit! Haide s\u0103 te configur\u0103m.',
        chatWithAccountManager: 'Discuta\u021Bi cu managerul dvs. de cont aici',
        sayHello: 'Spune salut!',
        yourSpace: 'Spa\u021Biul t\u0103u',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Bine ai venit la ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Utiliza\u021Bi butonul + pentru a ${additionalText} o cheltuial\u0103.`,
        askConcierge: 'Pune \u00EEntreb\u0103ri \u0219i prime\u0219te suport \u00EEn timp real 24/7.',
        conciergeSupport: 'Asisten\u021B\u0103 non-stop',
        create: 'creaz\u0103',
        iouTypes: {
            pay: 'pl\u0103te\u0219te',
            split: 'desparte',
            submit: 'trimite',
            track: 'urm\u0103ri',
            invoice: 'factur\u0103',
        },
    },
    adminOnlyCanPost: 'Doar administratorii pot trimite mesaje \u00EEn aceast\u0103 camer\u0103.',
    reportAction: {
        asCopilot: 'ca copilot pentru',
    },
    mentionSuggestions: {
        hereAlternateText: 'Anun\u021B\u0103 pe toat\u0103 lumea din aceast\u0103 conversa\u021Bie',
    },
    newMessages: 'Mesaje noi',
    youHaveBeenBanned: 'Not\u0103: Ai fost interzis de la a discuta pe acest canal.',
    reportTypingIndicator: {
        isTyping: 'scrie...',
        areTyping:
            "E\u0219ti un traduc\u0103tor profesionist. Tradu textul urm\u0103tor \u00EEn ro. Este fie un \u0219ir simplu, fie o func\u021Bie TypeScript care returneaz\u0103 un \u0219ir de \u0219abloane. P\u0103streaz\u0103 substituen\u021Bii ca ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc f\u0103r\u0103 a le modifica con\u021Binutul sau a elimina parantezele. Con\u021Binutul substituen\u021Bilor este descriptiv pentru ceea ce reprezint\u0103 \u00EEn fraz\u0103, dar poate include expresii ternare sau alt cod TypeScript.",
        multipleMembers: 'Membri multipli',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Aceast\u0103 camer\u0103 de chat a fost arhivat\u0103.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Aceast\u0103 conversa\u021Bie nu mai este activ\u0103 deoarece ${displayName} \u0219i-a \u00EEnchis contul.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Aceast\u0103 conversa\u021Bie nu mai este activ\u0103 deoarece ${oldDisplayName} \u0219i-a unit contul cu ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Aceast\u0103 conversa\u021Bie nu mai este activ\u0103 deoarece <strong>nu</strong> mai e\u0219ti membru al spa\u021Biului de lucru ${policyName}.`
                : `Aceast\u0103 conversa\u021Bie nu mai este activ\u0103 deoarece ${displayName} nu mai este membru al spa\u021Biului de lucru ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Aceast\u0103 conversa\u021Bie nu mai este activ\u0103 deoarece ${policyName} nu mai este un spa\u021Biu de lucru activ.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Aceast\u0103 conversa\u021Bie nu mai este activ\u0103 deoarece ${policyName} nu mai este un spa\u021Biu de lucru activ.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Aceast\u0103 rezervare este arhivat\u0103.',
    },
    writeCapabilityPage: {
        label: 'Cine poate posta',
        writeCapability: {
            all: 'To\u021Bi membrii',
            admins: 'Doar pentru administratori',
        },
    },
    sidebarScreen: {
        buttonFind: 'G\u0103se\u0219te ceva...',
        buttonMySettings: 'Set\u0103rile mele',
        fabNewChat: '\u00CEncepe\u021Bi chatul',
        fabNewChatExplained: '\u00CEncepe\u021Bi chatul (Ac\u021Biune flotant\u0103)',
        chatPinned: 'Chat fixat',
        draftedMessage: 'Mesaj proiectat',
        listOfChatMessages: 'Lista mesajelor de chat',
        listOfChats: 'Lista de chat-uri',
        saveTheWorld: 'Salveaz\u0103 lumea',
        tooltip: '\u00CEncepe\u021Bi aici!',
        redirectToExpensifyClassicModal: {
            title: '\u00CEn cur\u00E2nd',
            description:
                'Ne ocup\u0103m de reglarea c\u00E2torva detalii \u00EEn plus pentru New Expensify pentru a se potrivi cu configura\u021Bia ta specific\u0103. \u00CEntre timp, mergi la Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abonament',
        domains: 'Domenii',
    },
    tabSelector: {
        chat: 'Conversa\u021Bie',
        room: 'Camer\u0103',
        distance: 'Distan\u021B\u0103',
        manual: "E\u0219ti un traduc\u0103tor profesionist. Tradu textul urm\u0103tor \u00EEn ro. Poate fi un \u0219ir simplu sau o func\u021Bie TypeScript care returneaz\u0103 un \u0219ir de caractere. P\u0103streaz\u0103 substituen\u021Bii ca ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc f\u0103r\u0103 a modifica con\u021Binutul lor sau a \u00EEnl\u0103tura parantezele. Con\u021Binutul substituen\u021Bilor descrie ceea ce reprezint\u0103 \u00EEn fraz\u0103, dar poate include expresii ternare sau alt cod TypeScript.",
        scan: 'Scanare',
    },
    spreadsheet: {
        upload: '\u00CEnc\u0103rca\u021Bi un fi\u0219ier Excel',
        dragAndDrop: 'Trage\u021Bi \u0219i fixa\u021Bi aici tabelul dvs., sau alege\u021Bi un fi\u0219ier de mai jos. Formate acceptate: .csv, .txt, .xls \u0219i .xlsx.',
        chooseSpreadsheet: 'Selecta\u021Bi un fi\u0219ier de foaie de calcul pentru import. Formate acceptate: .csv, .txt, .xls \u0219i .xlsx.',
        fileContainsHeader: 'Fi\u0219ierul con\u021Bine anteturi de coloan\u0103',
        column: ({name}: SpreadSheetColumnParams) => `Coloana ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) =>
            `Hopa! Un c\u00E2mp necesar ("${fieldName}") nu a fost mapat. Te rog s\u0103 revizuie\u0219ti \u0219i s\u0103 \u00EEncerci din nou.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `Oops! Ai mapat un singur c\u00E2mp ("${fieldName}") la mai multe coloane. Te rog s\u0103 revizuie\u0219ti \u0219i s\u0103 \u00EEncerci din nou.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) =>
            `Oops! C\u00E2mpul ("${fieldName}") con\u021Bine una sau mai multe valori goale. Te rog s\u0103 revizuie\u0219ti \u0219i s\u0103 \u00EEncerci din nou.`,
        importSuccessfullTitle: 'Importul a fost realizat cu succes',
        importCategoriesSuccessfullDescription: ({categories}: SpreadCategoriesParams) =>
            categories > 1 ? `Au fost ad\u0103ugate ${categories} categorii.` : 'A fost ad\u0103ugat\u0103 1 categorie.',
        importMembersSuccessfullDescription: ({members}: ImportMembersSuccessfullDescriptionParams) =>
            members > 1 ? `${members} members have been added.` : '1 membru a fost ad\u0103ugat.',
        importTagsSuccessfullDescription: ({tags}: ImportTagsSuccessfullDescriptionParams) => (tags > 1 ? `Au fost ad\u0103ugate ${tags} etichete.` : 'A fost ad\u0103ugat 1 tag.'),
        importPerDiemRatesSuccessfullDescription: ({rates}: ImportPerDiemRatesSuccessfullDescriptionParams) =>
            rates > 1 ? `Au fost ad\u0103ugate ratele per diem ${rates}.` : 'A fost ad\u0103ugat\u0103 o rat\u0103 per diem.',
        importFailedTitle: 'Importul a e\u0219uat',
        importFailedDescription:
            'V\u0103 rug\u0103m s\u0103 v\u0103 asigura\u021Bi c\u0103 toate c\u00E2mpurile sunt completate corect \u0219i \u00EEncerca\u021Bi din nou. Dac\u0103 problema persist\u0103, v\u0103 rug\u0103m s\u0103 contacta\u021Bi Concierge.',
        importDescription:
            'Alege\u021Bi ce c\u00E2mpuri s\u0103 mapa\u021Bi din foaia dvs. de calcul f\u0103c\u00E2nd clic pe meniul derulant de l\u00E2ng\u0103 fiecare coloan\u0103 importat\u0103 de mai jos.',
        sizeNotMet: 'Dimensiunea fi\u0219ierului trebuie s\u0103 fie mai mare de 0 bytes',
        invalidFileMessage:
            'Fi\u0219ierul pe care l-ai \u00EEnc\u0103rcat este fie gol, fie con\u021Bine date invalide. Te rog s\u0103 te asiguri c\u0103 fi\u0219ierul este formatat corect \u0219i con\u021Bine informa\u021Biile necesare \u00EEnainte de a-l \u00EEnc\u0103rca din nou.',
        importSpreadsheet: 'Import\u0103 foaia de calcul',
        downloadCSV: 'Descarc\u0103 CSV',
    },
    receipt: {
        upload: '\u00CEncarc\u0103 chitan\u021Ba',
        dragReceiptBeforeEmail: 'Trage\u021Bi un bon pe aceast\u0103 pagin\u0103, trimite\u021Bi un bon la',
        dragReceiptAfterEmail: 'sau alege\u021Bi un fi\u0219ier pentru \u00EEnc\u0103rcare mai jos.',
        chooseReceipt: 'Alege\u021Bi un bon pentru \u00EEnc\u0103rcare sau redirec\u021Biona\u021Bi un bon c\u0103tre',
        takePhoto: 'F\u0103 o fotografie',
        cameraAccess: 'Este necesar accesul la camer\u0103 pentru a face fotografii ale chitan\u021Belor.',
        deniedCameraAccess: 'Accesul la camer\u0103 \u00EEnc\u0103 nu a fost acordat, v\u0103 rug\u0103m s\u0103 urma\u021Bi',
        deniedCameraAccessInstructions: 'aceste instruc\u021Biuni',
        cameraErrorTitle: 'Eroare de camer\u0103',
        cameraErrorMessage: 'A ap\u0103rut o eroare \u00EEn timp ce se f\u0103cea o fotografie. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        locationAccessTitle: 'Permite accesul la loca\u021Bie',
        locationAccessMessage: 'Accesul la loca\u021Bie ne ajut\u0103 s\u0103 men\u021Binem fusul orar \u0219i moneda corecte oriunde v\u0103 deplasa\u021Bi.',
        locationErrorTitle: 'Permite accesul la loca\u021Bie',
        locationErrorMessage: 'Accesul la loca\u021Bie ne ajut\u0103 s\u0103 men\u021Binem fusul orar \u0219i moneda corecte oriunde v\u0103 deplasa\u021Bi.',
        allowLocationFromSetting: `Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: 'Lasa-o balta',
        dropMessage: 'Arunca\u021Bi fi\u0219ierul dvs. aici',
        flash: 'flash',
        shutter: 'obturator',
        gallery: 'galerie',
        deleteReceipt: '\u0218terge chitan\u021Ba',
        deleteConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi acest bon fiscal?',
        addReceipt: 'Adaug\u0103 chitan\u021B\u0103',
    },
    quickAction: {
        scanReceipt: 'Scaneaz\u0103 chitan\u021Ba',
        recordDistance: 'Distan\u021B\u0103 \u00EEnregistrat\u0103',
        requestMoney: 'Creeaz\u0103 cheltuial\u0103',
        splitBill: '\u00CEmparte cheltuiala',
        splitScan: '\u00CEmparte chitan\u021Ba',
        splitDistance: 'Distan\u021Ba de divizare',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pl\u0103te\u0219te ${name ?? 'cineva'}`,
        assignTask: 'Atribuie sarcina',
        header: 'Ac\u021Biune rapid\u0103',
        trackManual: 'Creeaz\u0103 cheltuial\u0103',
        trackScan: 'Scaneaz\u0103 chitan\u021Ba',
        trackDistance: 'Distan\u021Ba parcurs\u0103',
        noLongerHaveReportAccess: 'Nu mai ave\u021Bi acces la destina\u021Bia anterioar\u0103 a ac\u021Biunii rapide. Alege\u021Bi una nou\u0103 mai jos.',
        updateDestination: 'Actualizeaz\u0103 destina\u021Bia',
    },
    iou: {
        amount: 'Cantitate',
        taxAmount: 'Suma impozitului',
        taxRate: 'Rata impozitului',
        approve: 'Aprob\u0103',
        approved: 'Aprobat',
        cash: 'Numerar',
        card: 'Carte',
        original: 'Original',
        split: 'Desparte',
        splitExpense: '\u00CEmparte cheltuiala',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pl\u0103te\u0219te ${name ?? 'cineva'}`,
        expense: 'Cheltuial\u0103',
        categorize: 'Categorizeaz\u0103',
        share: 'Distribuie',
        participants: 'Participan\u021Bi',
        createExpense: 'Creeaz\u0103 cheltuial\u0103',
        chooseRecipient: 'Alege\u021Bi destinatarul',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Creeaz\u0103 o cheltuial\u0103 de ${amount}`,
        confirmDetails: 'Confirma\u021Bi detaliile',
        pay: 'Pl\u0103te\u0219te',
        cancelPayment: 'Anuleaz\u0103 plata',
        cancelPaymentConfirmation: 'Sunte\u021Bi sigur c\u0103 dori\u021Bi s\u0103 anula\u021Bi aceast\u0103 plat\u0103?',
        viewDetails: 'Vezi detalii',
        pending: '\u00CEn a\u0219teptare',
        canceled: 'Anulat',
        posted: 'Postat',
        deleteReceipt: '\u0218terge chitan\u021Ba',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `a \u0219ters o cheltuial\u0103 din acest raport, ${merchant} - ${amount}`,
        pendingMatchWithCreditCard: 'Chitan\u021B\u0103 \u00EEn a\u0219teptare de potrivire cu tranzac\u021Bia cu cardul',
        pendingMatchWithCreditCardDescription: 'Chitan\u021B\u0103 \u00EEn a\u0219teptarea potrivirii cu tranzac\u021Bia cu cardul. Marcheaz\u0103 ca numerar pentru a anula.',
        markAsCash: 'Marcheaz\u0103 ca numerar',
        routePending: 'Traseu \u00EEn a\u0219teptare...',
        receiptScanning: () => ({
            one: 'Scanarea chitan\u021Bei...',
            other: 'Scanarea chitan\u021Belor...',
        }),
        receiptScanInProgress: 'Scanarea chitan\u021Bei \u00EEn curs',
        receiptScanInProgressDescription: 'Scanarea chitan\u021Bei este \u00EEn desf\u0103\u0219urare. Verifica\u021Bi mai t\u00E2rziu sau introduce\u021Bi detaliile acum.',
        receiptIssuesFound: () => ({
            one: 'Problema identificat\u0103',
            other: 'Probleme g\u0103site',
        }),
        fieldPending: '\u00CEn a\u0219teptare...',
        defaultRate: 'Rat\u0103 implicit\u0103',
        receiptMissingDetails: 'Lipse\u0219te detalii pe chitan\u021B\u0103',
        missingAmount: 'Cantitate lips\u0103',
        missingMerchant: 'Lips\u0103 comerciant',
        receiptStatusTitle: 'Analizeaz\u0103\u2026',
        receiptStatusText: 'Doar tu po\u021Bi vedea acest bon atunci c\u00E2nd este scanat. Verific\u0103 mai t\u00E2rziu sau introdu detaliile acum.',
        receiptScanningFailed: 'Scanarea bonului a e\u0219uat. V\u0103 rug\u0103m s\u0103 introduce\u021Bi detaliile manual.',
        transactionPendingDescription: 'Tranzac\u021Bie \u00EEn a\u0219teptare. Poate dura c\u00E2teva zile p\u00E2n\u0103 la postare.',
        companyInfo: 'Informa\u021Bii despre companie',
        companyInfoDescription: 'Avem nevoie de c\u00E2teva detalii \u00EEn plus \u00EEnainte s\u0103 pute\u021Bi trimite prima factur\u0103.',
        yourCompanyName: 'Numele companiei tale',
        yourCompanyWebsite: 'Site-ul web al companiei dvs.',
        yourCompanyWebsiteNote: 'Dac\u0103 nu ave\u021Bi un site web, pute\u021Bi furniza \u00EEn schimb profilul LinkedIn sau de social media al companiei dumneavoastr\u0103.',
        invalidDomainError: 'Ai introdus un domeniu invalid. Pentru a continua, te rug\u0103m s\u0103 introduci un domeniu valid.',
        publicDomainError: 'Ai intrat \u00EEntr-un domeniu public. Pentru a continua, te rug\u0103m s\u0103 introduci un domeniu privat.',
        expenseCount: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} scanning`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} pending`);
            }
            return {
                one: statusText.length > 0 ? `1 cheltuial\u0103 (${statusText.join(', ')})` : `1 expense`,
                other: (count: number) => (statusText.length > 0 ? `${count} expenses (${statusText.join(', ')})` : `${count} expenses`),
            };
        },
        deleteExpense: () => ({
            one: '\u0218terge cheltuiala',
            other: '\u0218terge cheltuielile',
        }),
        deleteConfirmation: () => ({
            one: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 cheltuial\u0103?',
            other: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceste cheltuieli?',
        }),
        settledExpensify: 'Pl\u0103tit',
        settledElsewhere: 'Pl\u0103tit \u00EEn alt\u0103 parte',
        individual: 'Individ',
        business: 'Afaceri',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pl\u0103te\u0219te ${formattedAmount} cu Expensify` : `Pay with Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pl\u0103te\u0219te ${formattedAmount} ca individ` : `Pay as an individual`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Pl\u0103te\u0219te ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pl\u0103te\u0219te ${formattedAmount} ca o afacere` : `Pay as a business`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pl\u0103te\u0219te ${formattedAmount} \u00EEn alt\u0103 parte` : `Pay elsewhere`),
        nextStep: 'Urm\u0103torii pa\u0219i',
        finished: 'Finalizat',
        sendInvoice: ({amount}: RequestAmountParams) => `Trimite factura ${amount}`,
        submitAmount: ({amount}: RequestAmountParams) => `trimite ${amount}`,
        submittedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `submitted ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        automaticallySubmittedAmount: ({formattedAmount}: RequestedAmountMessageParams) =>
            `trimis automat ${formattedAmount} prin <a href="${CONST.DELAYED_SUBMISSION_HELP_URL}">trimitere \u00EEnt\u00E2rziat\u0103</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `tracking ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `desparte ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Divizarea ta ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} owes ${amount}${comment ? ` for ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} owes: `,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} paid: `,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} spent ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} spent: `,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} approved:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} approved ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `pl\u0103tit ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `ai pl\u0103tit ${amount}. Adaug\u0103 un cont bancar pentru a primi plata.`,
        automaticallyApprovedAmount: ({amount}: ApprovedAmountParams) =>
            `aprobat automat ${amount} prin intermediul <a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">regulilor de spa\u021Biu de lucru</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `aprobat ${amount}`,
        unapprovedAmount: ({amount}: UnapprovedParams) => `neaprobat ${amount}`,
        automaticallyForwardedAmount: ({amount}: ForwardedAmountParams) =>
            `aprobat automat ${amount} prin intermediul <a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">regulilor de spa\u021Biu de lucru</a>`,
        forwardedAmount: ({amount}: ForwardedAmountParams) => `aprobat ${amount}`,
        rejectedThisReport: 'a respins acest raport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `a \u00EEnceput s\u0103 se stabileasc\u0103. Plata este \u00EEn a\u0219teptare p\u00E2n\u0103 c\u00E2nd ${submitterDisplayName} adaug\u0103 un cont bancar.`,
        adminCanceledRequest: ({manager, amount}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''}canceled the ${amount} payment`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `a anulat plata de ${amount}, deoarece ${submitterDisplayName} nu \u0219i-a activat portofelul Expensify \u00EEn termen de 30 de zile`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhereWithAmount: ({payer, amount}: PaidElsewhereWithAmountParams) => `${payer ? `${payer} ` : ''}paid ${amount} elsewhere`,
        paidWithExpensifyWithAmount: ({payer, amount}: PaidWithExpensifyWithAmountParams) => `${payer ? `${payer} ` : ''}paid ${amount} with Expensify`,
        automaticallyPaidWithExpensify: ({payer, amount}: PaidWithExpensifyWithAmountParams) =>
            `${payer ? `${payer} ` : ''}automatically paid ${amount} with Expensify via <a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">workspace rules</a>`,
        noReimbursableExpenses: 'Acest raport are o sum\u0103 nevalid\u0103',
        pendingConversionMessage: 'Totalul se va actualiza c\u00E2nd vei fi din nou online',
        changedTheExpense: 'a schimbat cheltuiala',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `seteaz\u0103 ${translatedChangedField} la ${newMerchant}, care stabile\u0219te suma la ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `a schimbat ${translatedChangedField} \u00EEn ${newMerchant} (anterior ${oldMerchant}), ceea ce a actualizat suma la ${newAmountToDisplay} (anterior ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `for ${comment}` : 'expense'}`,
        threadTrackReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `Urm\u0103rire ${formattedAmount} ${comment ? `pentru ${comment}` : ''}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} sent${comment ? ` for ${comment}` : ''}`,
        movedFromSelfDM: ({workspaceName, reportName}: MovedFromSelfDMParams) => `a mutat cheltuiala din DM personal la ${workspaceName ?? `chat cu ${reportName}`}`,
        movedToSelfDM: 'mutat cheltuiala la DM personal',
        tagSelection: 'Selecteaz\u0103 o etichet\u0103 pentru a-\u021Bi organiza mai bine cheltuielile.',
        categorySelection: 'Selecteaz\u0103 o categorie pentru a-\u021Bi organiza mai bine cheltuielile.',
        error: {
            invalidCategoryLength: 'Numele categoriei dep\u0103\u0219e\u0219te 255 de caractere. V\u0103 rug\u0103m s\u0103-l scurta\u021Bi sau s\u0103 alege\u021Bi o alt\u0103 categorie.',
            invalidAmount: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o sum\u0103 valid\u0103 \u00EEnainte de a continua.',
            invalidIntegerAmount: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o sum\u0103 \u00EEntreag\u0103 \u00EEn dolari \u00EEnainte de a continua.',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Suma maxim\u0103 a taxei este ${amount}`,
            invalidSplit: 'Suma diviz\u0103rilor trebuie s\u0103 fie egal\u0103 cu suma total\u0103.',
            invalidSplitParticipants: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o sum\u0103 mai mare dec\u00E2t zero pentru cel pu\u021Bin doi participan\u021Bi.',
            invalidSplitYourself: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o sum\u0103 non-zero pentru divizarea dumneavoastr\u0103.',
            noParticipantSelected: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un participant.',
            other: 'Eroare nea\u0219teptat\u0103. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
            genericCreateFailureMessage: 'Eroare nea\u0219teptat\u0103 la trimiterea acestei cheltuieli. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
            genericCreateInvoiceFailureMessage: 'Eroare nea\u0219teptat\u0103 la trimiterea acestei facturi. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
            genericHoldExpenseFailureMessage: 'Eroare nea\u0219teptat\u0103 la procesarea acestei cheltuieli. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
            genericUnholdExpenseFailureMessage: 'Eroare nea\u0219teptat\u0103 la deblocarea acestei cheltuieli. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
            receiptDeleteFailureError: 'Eroare nea\u0219teptat\u0103 la \u0219tergerea acestui bon fiscal. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
            receiptFailureMessage: 'Chitan\u021Ba nu a fost \u00EEnc\u0103rcat\u0103.',
            // eslint-disable-next-line rulesdir/use-periods-for-error-messages
            saveFileMessage: 'Desc\u0103rca\u021Bi fi\u0219ierul',
            loseFileMessage: 'sau ignora\u021Bi aceast\u0103 eroare \u0219i pierde\u021Bi-o.',
            genericDeleteFailureMessage: 'Eroare nea\u0219teptat\u0103 la \u0219tergerea acestei cheltuieli. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
            genericEditFailureMessage: 'Eroare nea\u0219teptat\u0103 la editarea acestei cheltuieli. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
            genericSmartscanFailureMessage: 'Tranzac\u021Bia \u00EEi lipsesc c\u00E2mpuri.',
            duplicateWaypointsErrorMessage: 'V\u0103 rug\u0103m s\u0103 elimina\u021Bi punctele de reper duplicate.',
            atLeastTwoDifferentWaypoints: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi cel pu\u021Bin dou\u0103 adrese diferite.',
            splitExpenseMultipleParticipantsErrorMessage:
                'O cheltuial\u0103 nu poate fi \u00EEmp\u0103r\u021Bit\u0103 \u00EEntre un spa\u021Biu de lucru \u0219i al\u021Bi membri. V\u0103 rug\u0103m s\u0103 actualiza\u021Bi selec\u021Bia dumneavoastr\u0103.',
            invalidMerchant: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un comerciant corect.',
            atLeastOneAttendee: 'Cel pu\u021Bin un participant trebuie s\u0103 fie selectat',
            invalidQuantity: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o cantitate valid\u0103.',
            quantityGreaterThanZero: 'Cantitatea trebuie s\u0103 fie mai mare dec\u00E2t zero.',
            invalidSubrateLength: 'Trebuie s\u0103 existe cel pu\u021Bin un subtarif.',
            invalidRate: 'Rata nu este valabil\u0103 pentru acest spa\u021Biu de lucru. V\u0103 rug\u0103m s\u0103 selecta\u021Bi o rat\u0103 disponibil\u0103 din spa\u021Biul de lucru.',
        },
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `a \u00EEnceput s\u0103 se stabileasc\u0103. Plata este \u00EEn a\u0219teptare p\u00E2n\u0103 c\u00E2nd ${submitterDisplayName} \u00EE\u0219i activeaz\u0103 portofelul.`,
        enableWallet: 'Activeaz\u0103 portofelul',
        hold: 'Re\u021Bine',
        unhold: 'Nesustinut',
        holdExpense: '\u021Aine cheltuielile',
        unholdExpense: 'Cheltuial\u0103 ne\u021Binut\u0103 \u00EEn fr\u00E2u',
        heldExpense: 'a \u021Binut aceast\u0103 cheltuial\u0103',
        unheldExpense: 'ne\u021Binut aceast\u0103 cheltuial\u0103',
        explainHold: 'Explica de ce \u021Bii aceast\u0103 cheltuial\u0103.',
        reason: 'Motiv',
        holdReasonRequired: 'Este necesar un motiv atunci c\u00E2nd re\u021Bii.',
        expenseOnHold: 'Aceast\u0103 cheltuial\u0103 a fost pus\u0103 \u00EEn a\u0219teptare. V\u0103 rug\u0103m s\u0103 revizui\u021Bi comentariile pentru urm\u0103torii pa\u0219i.',
        expensesOnHold: 'Toate cheltuielile au fost puse \u00EEn a\u0219teptare. V\u0103 rug\u0103m s\u0103 revizui\u021Bi comentariile pentru urm\u0103torii pa\u0219i.',
        expenseDuplicate: 'Aceast\u0103 cheltuial\u0103 are acelea\u0219i detalii ca o alta. V\u0103 rug\u0103m s\u0103 revizui\u021Bi duplicatele pentru a elimina blocarea.',
        someDuplicatesArePaid: 'Unele dintre aceste duplicate au fost deja aprobate sau pl\u0103tite.',
        reviewDuplicates: 'Revizuie\u0219te duplicatele',
        keepAll: 'P\u0103streaz\u0103 tot',
        confirmApprove: 'Confirm\u0103 suma aprob\u0103rii',
        confirmApprovalAmount: 'Aproba\u021Bi doar cheltuielile conforme, sau aproba\u021Bi \u00EEntregul raport.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Aceast\u0103 cheltuial\u0103 este \u00EEn a\u0219teptare. Dori\u021Bi s\u0103 aproba\u021Bi oricum?',
            other: 'Aceste cheltuieli sunt \u00EEn a\u0219teptare. Dori\u021Bi s\u0103 aproba\u021Bi oricum?',
        }),
        confirmPay: 'Confirma\u021Bi suma de plat\u0103',
        confirmPayAmount: 'Pl\u0103te\u0219te ce nu este \u00EEn a\u0219teptare, sau pl\u0103te\u0219te \u00EEntregul raport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Aceast\u0103 cheltuial\u0103 este \u00EEn a\u0219teptare. Dori\u021Bi s\u0103 pl\u0103ti\u021Bi oricum?',
            other: 'Aceste cheltuieli sunt \u00EEn a\u0219teptare. Dori\u021Bi s\u0103 pl\u0103ti\u021Bi oricum?',
        }),
        payOnly: 'Pl\u0103te\u0219te doar',
        approveOnly: 'Aprob\u0103 doar',
        holdEducationalTitle: 'Aceast\u0103 cerere este activ\u0103',
        holdEducationalText: '\u021Bine',
        whatIsHoldExplain:
            'A \u021Bine \u00EEn a\u0219teptare este ca \u0219i cum ai ap\u0103sa pe "pauz\u0103" pentru o cheltuial\u0103 pentru a cere mai multe detalii \u00EEnainte de aprobare sau plat\u0103.',
        holdIsLeftBehind: 'Cheltuielile re\u021Binute sunt l\u0103sate \u00EEn urm\u0103 chiar dac\u0103 aprob\u0103 un raport \u00EEntreg.',
        unholdWhenReady: 'Debloca\u021Bi cheltuielile c\u00E2nd sunte\u021Bi gata s\u0103 aproba\u021Bi sau s\u0103 pl\u0103ti\u021Bi.',
        set: 'set',
        changed: 'schimbat',
        removed: 'eliminat',
        transactionPending: 'Tranzac\u021Bie \u00EEn a\u0219teptare.',
        chooseARate: 'Selecta\u021Bi un tarif de decontare pentru spa\u021Biul de lucru pe mil\u0103 sau kilometru',
        unapprove: 'Dezaprob\u0103',
        unapproveReport: 'Dezaprob\u0103 raportul',
        headsUp: 'Aten\u021Bie!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Acest raport a fost deja exportat c\u0103tre ${accountingIntegration}. Modific\u0103rile aduse acestui raport \u00EEn Expensify pot duce la discrepan\u021Be de date \u0219i probleme de reconciliere a cardului Expensify. E\u0219ti sigur c\u0103 vrei s\u0103 dezaprobi acest raport?`,
        reimbursable: 'rambursabil',
        nonReimbursable: 'nerambursabil',
        bookingPending: 'Aceast\u0103 rezervare este \u00EEn a\u0219teptare',
        bookingPendingDescription: 'Aceast\u0103 rezervare este \u00EEn a\u0219teptare deoarece nu a fost \u00EEnc\u0103 pl\u0103tit\u0103.',
        bookingArchived: 'Aceast\u0103 rezervare este arhivat\u0103',
        bookingArchivedDescription:
            'Aceast\u0103 rezervare este arhivat\u0103 deoarece data c\u0103l\u0103toriei a trecut. Ad\u0103uga\u021Bi o cheltuial\u0103 pentru suma final\u0103 dac\u0103 este necesar.',
        attendees: 'Participan\u021Bi',
        paymentComplete: 'Plata finalizat\u0103',
        time: 'Timp',
        startDate: 'Data de \u00EEnceput',
        endDate: 'Data de \u00EEncheiere',
        startTime: 'Timp de \u00EEnceput',
        endTime: 'Timp de \u00EEncheiere',
        deleteSubrate: '\u0218terge subrata',
        deleteSubrateConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi acest subtarif?',
        quantity: 'Cantitate',
        subrateSelection: 'Selecta\u021Bi un subtarif \u0219i introduce\u021Bi o cantitate.',
        qty: 'Cantitate',
        firstDayText: () => ({
            one: `First day: 1 hour`,
            other: (count: number) => `Prima zi: ${count.toFixed(2)} ore`,
        }),
        lastDayText: () => ({
            one: `Last day: 1 hour`,
            other: (count: number) => `Ultima zi: ${count.toFixed(2)} ore`,
        }),
        tripLengthText: () => ({
            one: `Trip: 1 full day`,
            other: (count: number) => `C\u0103l\u0103torie: ${count} zile \u00EEntregi`,
        }),
        dates: 'Date',
        rates: 'Rate',
        submitsTo: ({name}: SubmitsToParams) => `Trimite la ${name}`,
    },
    notificationPreferencesPage: {
        header: 'Preferin\u021Be de notificare',
        label: 'Anun\u021B\u0103-m\u0103 despre mesajele noi',
        notificationPreferences: {
            always: 'Imediat',
            daily: 'Zilnic',
            mute: 'Mutare',
            hidden: 'Ascuns',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Num\u0103rul nu a fost validat. Face\u021Bi clic pe buton pentru a retrimite link-ul de validare prin text.',
        emailHasNotBeenValidated: 'Emailul nu a fost validat. Face\u021Bi clic pe buton pentru a retrimite linkul de validare prin text.',
    },
    avatarWithImagePicker: {
        uploadPhoto: '\u00CEncarc\u0103 fotografia',
        removePhoto: '\u0218terge fotografia',
        editImage: 'Editeaz\u0103 fotografia',
        viewPhoto: 'Vizualizeaz\u0103 fotografia',
        imageUploadFailed: '\u00CEnc\u0103rcarea imaginii a e\u0219uat',
        deleteWorkspaceError: 'Ne pare r\u0103u, a ap\u0103rut o problem\u0103 nea\u0219teptat\u0103 la \u0219tergerea avatarului spa\u021Biului t\u0103u de lucru',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) =>
            `Imaginea selectat\u0103 dep\u0103\u0219e\u0219te dimensiunea maxim\u0103 de \u00EEnc\u0103rcare de ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `V\u0103 rug\u0103m s\u0103 \u00EEnc\u0103rca\u021Bi o imagine mai mare de ${minHeightInPx}x${minWidthInPx} pixeli \u0219i mai mic\u0103 de ${maxHeightInPx}x${maxWidthInPx} pixeli.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) =>
            `Imaginea de profil trebuie s\u0103 fie de unul dintre urm\u0103toarele tipuri: ${allowedExtensions.join(', ')}.`,
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Pronume preferate',
        selectYourPronouns: 'Selecta\u021Bi pronumele dvs.',
        selfSelectYourPronoun: 'Selecta\u021Bi-v\u0103 propriul pronume',
        emailAddress: 'Adresa de email',
        setMyTimezoneAutomatically: 'Seteaz\u0103-mi fusul orar automat',
        timezone: 'Fus orar',
        invalidFileMessage: 'Fi\u0219ier invalid. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi o alt\u0103 imagine.',
        avatarUploadFailureMessage: 'A ap\u0103rut o eroare la \u00EEnc\u0103rcarea avatarului. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        online: 'Online',
        offline: 'Deconectat',
        syncing: 'Sincronizare',
        profileAvatar: 'Avatar de profil',
        publicSection: {
            title: 'Public',
            subtitle: 'Aceste detalii sunt afi\u0219ate pe profilul t\u0103u public. Oricine le poate vedea.',
        },
        privateSection: {
            title: 'Privat',
            subtitle: 'Aceste detalii sunt utilizate pentru c\u0103l\u0103torii \u0219i pl\u0103\u021Bi. Ele nu sunt niciodat\u0103 afi\u0219ate pe profilul t\u0103u public.',
        },
    },
    securityPage: {
        title: 'Op\u021Biuni de securitate',
        subtitle: 'Activa\u021Bi autentificarea \u00EEn doi pa\u0219i pentru a v\u0103 men\u021Bine contul \u00EEn siguran\u021B\u0103.',
    },
    shareCodePage: {
        title: 'Codul t\u0103u',
        subtitle: 'Invit\u0103 membrii \u00EEn Expensify prin partajarea codului t\u0103u QR personal sau a linkului de recomandare.',
    },
    pronounsPage: {
        pronouns: 'Pronume',
        isShownOnProfile: 'Pronumele tale sunt afi\u0219ate pe profilul t\u0103u.',
        placeholderText: 'Caut\u0103 pentru a vedea op\u021Biuni',
    },
    contacts: {
        contactMethod: 'Metoda de contact',
        contactMethods: 'Metode de contact',
        featureRequiresValidate: 'Aceast\u0103 func\u021Bie necesit\u0103 validarea contului t\u0103u.',
        validateAccount: 'Valideaz\u0103-\u021Bi contul',
        helpTextBeforeEmail: 'Adaug\u0103 mai multe modalit\u0103\u021Bi pentru ca oamenii s\u0103 te g\u0103seasc\u0103 \u0219i trimite chitan\u021Be c\u0103tre',
        helpTextAfterEmail: 'de la mai multe adrese de email.',
        pleaseVerify: 'V\u0103 rug\u0103m s\u0103 verifica\u021Bi aceast\u0103 metod\u0103 de contact',
        getInTouch: 'De fiecare dat\u0103 c\u00E2nd avem nevoie s\u0103 lu\u0103m leg\u0103tura cu tine, vom folosi aceast\u0103 metod\u0103 de contact.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul magic trimis la ${contactMethod}. Ar trebui s\u0103 ajung\u0103 \u00EEntr-un minut sau dou\u0103.`,
        setAsDefault: 'Seteaz\u0103 ca implicit',
        yourDefaultContactMethod:
            'Aceasta este metoda ta de contact implicit\u0103 curent\u0103. \u00CEnainte de a o putea \u0219terge, va trebui s\u0103 alegi o alt\u0103 metod\u0103 de contact \u0219i s\u0103 dai click pe \u201ESeteaz\u0103 ca implicit\u0103\u201D.',
        removeContactMethod: '\u0218terge metoda de contact',
        removeAreYouSure: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 metod\u0103 de contact? Aceast\u0103 ac\u021Biune nu poate fi anulat\u0103.',
        failedNewContact: 'Nu s-a reu\u0219it ad\u0103ugarea acestei metode de contact.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Nu am reu\u0219it s\u0103 trimitem un nou cod magic. Te rug\u0103m s\u0103 a\u0219tep\u021Bi pu\u021Bin \u0219i s\u0103 \u00EEncerci din nou.',
            validateSecondaryLogin: 'Cod magic incorect sau invalid. Te rog \u00EEncearc\u0103 din nou sau cere un cod nou.',
            deleteContactMethod: 'Nu s-a reu\u0219it \u0219tergerea metodei de contact. V\u0103 rug\u0103m s\u0103 contacta\u021Bi Concierge pentru ajutor.',
            setDefaultContactMethod: 'Nu s-a reu\u0219it stabilirea unei noi metode de contact implicit\u0103. V\u0103 rug\u0103m s\u0103 contacta\u021Bi Concierge pentru ajutor.',
            addContactMethod: 'Nu am reu\u0219it s\u0103 ad\u0103ug\u0103m aceast\u0103 metod\u0103 de contact. V\u0103 rug\u0103m s\u0103 contacta\u021Bi Concierge pentru ajutor.',
            enteredMethodIsAlreadySubmited: 'Aceast\u0103 metod\u0103 de contact exist\u0103 deja.',
            passwordRequired: 'este necesar\u0103 parola.',
            contactMethodRequired: 'Metoda de contact este necesar\u0103.',
            invalidContactMethod: 'Metod\u0103 de contact invalid\u0103',
        },
        newContactMethod: 'Metod\u0103 nou\u0103 de contact',
        goBackContactMethods: '\u00CEnapoi la metodele de contact',
    },
    pronouns: {
        coCos: "The text you provided doesn't seem to be a string or a TypeScript function that needs translation. Please provide the correct text for translation.",
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'El / Lui / Al lui',
        heHimHisTheyThemTheirs: 'El / Lui / Al lui / Ei / Lor / Al lor',
        sheHerHers: 'Ea / Al ei / Al ei',
        sheHerHersTheyThemTheirs: 'Ea / Al ei / Al ei / Ei / Lor / Al lor',
        merMers:
            "E\u0219ti un traduc\u0103tor profesionist. Tradu textul urm\u0103tor \u00EEn ro. Este fie un \u0219ir simplu, fie o func\u021Bie TypeScript care returneaz\u0103 un \u0219ir de caractere \u0219ablon. P\u0103streaz\u0103 substituen\u021Bii ca ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc f\u0103r\u0103 a le modifica con\u021Binutul sau a elimina parantezele. Con\u021Binutul substituen\u021Bilor este descriptiv pentru ceea ce reprezint\u0103 \u00EEn fraz\u0103, dar poate include expresii ternare sau alt cod TypeScript.",
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: "I'm sorry, but there is no text provided to translate. Please provide the text you want to be translated into Romanian.",
        theyThemTheirs: 'Ei / Lor / Al lor',
        thonThons: 'Thon / Thons',
        veVerVis: 'Your input seems to be missing the text that needs to be translated. Please provide a complete sentence or paragraph for translation.',
        viVir: "Sunte\u021Bi un traduc\u0103tor profesionist. Traduce\u021Bi urm\u0103torul text \u00EEn ro. Este fie un \u0219ir simplu, fie o func\u021Bie TypeScript care returneaz\u0103 un \u0219ir de \u0219abloane. P\u0103stra\u021Bi substituen\u021Bi precum ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc f\u0103r\u0103 a modifica con\u021Binutul lor sau a elimina parantezele. Con\u021Binutul substituen\u021Bilor este descriptiv pentru ceea ce reprezint\u0103 \u00EEn fraz\u0103, dar poate include expresii ternare sau alt cod TypeScript.",
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Cheam\u0103-m\u0103 dup\u0103 numele meu',
    },
    displayNamePage: {
        headerTitle: 'Afi\u0219eaz\u0103 numele',
        isShownOnProfile: 'Numele t\u0103u de afi\u0219are este ar\u0103tat pe profilul t\u0103u.',
    },
    timezonePage: {
        timezone: 'Fus orar',
        isShownOnProfile: 'Fusul t\u0103u orar este afi\u0219at pe profilul t\u0103u.',
        getLocationAutomatically: 'Determina\u021Bi automat loca\u021Bia dvs.',
    },
    updateRequiredView: {
        updateRequired: 'Actualizare necesar\u0103',
        pleaseInstall: 'V\u0103 rug\u0103m s\u0103 actualiza\u021Bi la cea mai recent\u0103 versiune a New Expensify',
        pleaseInstallExpensifyClassic: 'V\u0103 rug\u0103m s\u0103 instala\u021Bi cea mai recent\u0103 versiune a Expensify',
        toGetLatestChanges: 'Pentru mobil sau desktop, desc\u0103rca\u021Bi \u0219i instala\u021Bi cea mai recent\u0103 versiune. Pentru web, re\u00EEmprosp\u0103ta\u021Bi browserul.',
        newAppNotAvailable: 'Noua aplica\u021Bie Expensify nu mai este disponibil\u0103.',
    },
    initialSettingsPage: {
        about: 'Despre',
        aboutPage: {
            description:
                'Noua aplica\u021Bie Expensify este construit\u0103 de o comunitate de dezvoltatori open-source din \u00EEntreaga lume. Ajut\u0103-ne s\u0103 construim viitorul Expensify.',
            appDownloadLinks: 'Link-uri pentru desc\u0103rcarea aplica\u021Biei',
            viewKeyboardShortcuts: 'Vizualiza\u021Bi scurt\u0103turile de la tastatur\u0103',
            viewTheCode: 'Vizualiza\u021Bi codul',
            viewOpenJobs: 'Vizualiza\u021Bi locurile de munc\u0103 disponibile',
            reportABug: 'Raporteaz\u0103 o eroare',
            troubleshoot: 'Depanare',
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
            clearCacheAndRestart: '\u0218terge cache-ul \u0219i reporne\u0219te',
            viewConsole: 'Vizualiza\u021Bi consola de depanare',
            debugConsole: 'Consola de depanare',
            description: 'Utiliza\u021Bi instrumentele de mai jos pentru a ajuta la depanarea experien\u021Bei Expensify. Dac\u0103 \u00EEnt\u00E2mpina\u021Bi probleme, v\u0103 rug\u0103m',
            submitBug: 'trimite un bug',
            confirmResetDescription: 'Toate mesajele nefinalizate nesim\u021Bite vor fi pierdute, dar restul datelor tale sunt \u00EEn siguran\u021B\u0103.',
            resetAndRefresh: 'Resetare \u0219i re\u00EEmprosp\u0103tare',
            clientSideLogging: 'Jurnalizare pe partea clientului',
            noLogsToShare: 'Niciun jurnal de partajat',
            useProfiling: 'Folose\u0219te profilul',
            profileTrace: 'Urm\u0103rire profil',
            releaseOptions: 'Op\u021Biuni de lansare',
            testingPreferences: 'Preferin\u021Be de testare',
            useStagingServer: 'Utiliza\u021Bi Serverul Staging',
            forceOffline: 'For\u021Beaz\u0103 offline',
            simulatePoorConnection: 'Simuleaz\u0103 o conexiune slab\u0103 la internet',
            simulatFailingNetworkRequests: 'Simuleaz\u0103 solicit\u0103rile de re\u021Bea care e\u0219ueaz\u0103',
            authenticationStatus: 'Stare de autentificare',
            deviceCredentials: 'Creden\u021Bialele dispozitivului',
            invalidate: 'Invalideaz\u0103',
            destroy: 'Distruge',
            maskExportOnyxStateData: 'Mascheaz\u0103 datele fragile ale membrilor \u00EEn timp ce exporti starea Onyx',
            exportOnyxState: 'Export\u0103 starea Onyx',
            importOnyxState: 'Importa\u021Bi starea Onyx',
            testCrash: 'Test de pr\u0103bu\u0219ire',
            resetToOriginalState: 'Resetare la starea ini\u021Bial\u0103',
            usingImportedState: 'Folose\u0219ti starea importat\u0103. Apas\u0103 aici pentru a o \u0219terge.',
            debugMode: 'Modul de depanare',
            invalidFile: 'Fi\u0219ier invalid',
            invalidFileDescription: 'Fi\u0219ierul pe care \u00EEncerci s\u0103 \u00EEl impor\u021Bi nu este valid. Te rog \u00EEncearc\u0103 din nou.',
            invalidateWithDelay: 'Invalidare cu \u00EEnt\u00E2rziere',
        },
        debugConsole: {
            saveLog: 'Salveaz\u0103 jurnalul',
            shareLog: '\u00CEmp\u0103rt\u0103\u0219e\u0219te jurnalul',
            enterCommand: 'Introduce\u021Bi comanda',
            execute: 'Execut\u0103',
            noLogsAvailable: 'Nu sunt disponibile \u00EEnregistr\u0103ri',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `Dimensiunea jurnalului dep\u0103\u0219e\u0219te limita de ${size} MB. V\u0103 rug\u0103m s\u0103 utiliza\u021Bi "Salveaz\u0103 jurnalul" pentru a desc\u0103rca fi\u0219ierul jurnal \u00EEn schimb.`,
            logs: 'Jurnale',
            viewConsole: 'Vizualizeaz\u0103 consola',
        },
        security: 'Securitate',
        signOut: 'Deconecteaz\u0103-te',
        restoreStashed: 'Restaureaz\u0103 autentificarea stocat\u0103',
        signOutConfirmationText: 'Vei pierde orice modific\u0103ri offline dac\u0103 te deconectezi.',
        versionLetter:
            'Pentru a putea traduce textul, este necesar s\u0103 \u00EEmi furniza\u021Bi textul \u00EEn cauz\u0103. \u00CEn prezent, nu exist\u0103 niciun text specificat pentru traducere.',
        readTheTermsAndPrivacy: {
            phrase1: 'Cite\u0219te',
            phrase2: 'Termeni \u0219i Condi\u021Bii',
            phrase3: '\u0219i',
            phrase4: 'Confiden\u021Bialitate',
        },
        help: 'Ajutor',
        accountSettings: 'Set\u0103ri cont',
        account: 'Cont',
        general: 'General',
    },
    closeAccountPage: {
        closeAccount: '\u00CEnchide contul',
        reasonForLeavingPrompt:
            'Ne-ar p\u0103rea r\u0103u s\u0103 te vedem plec\u00E2nd! Ai putea s\u0103 ne spui de ce, astfel \u00EEnc\u00E2t s\u0103 ne putem \u00EEmbun\u0103t\u0103\u021Bi?',
        enterMessageHere: 'Introduce\u021Bi mesajul aici',
        closeAccountWarning: '\u00CEnchiderea contului t\u0103u nu poate fi anulat\u0103.',
        closeAccountPermanentlyDeleteData: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u00EE\u021Bi \u0219tergi contul? Acest lucru va \u0219terge permanent orice cheltuieli restante.',
        enterDefaultContactToConfirm:
            'V\u0103 rug\u0103m s\u0103 introduce\u021Bi metoda dvs. de contact implicit\u0103 pentru a confirma c\u0103 dori\u021Bi s\u0103 \u00EEnchide\u021Bi contul. Metoda dvs. de contact implicit\u0103 este:',
        enterDefaultContact: 'Introduce\u021Bi metoda dvs. de contact implicit\u0103',
        defaultContact: 'Metoda de contact implicit\u0103:',
        enterYourDefaultContactMethod: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi metoda dvs. de contact implicit\u0103 pentru a \u00EEnchide contul.',
    },
    passwordPage: {
        changePassword: 'Schimb\u0103 parola',
        changingYourPasswordPrompt: 'Schimbarea parolei dvs. va actualiza parola at\u00E2t pentru contul dvs. de pe Expensify.com c\u00E2t \u0219i pentru cel de pe New Expensify.',
        currentPassword: 'Parola curent\u0103',
        newPassword: 'Parol\u0103 nou\u0103',
        newPasswordPrompt:
            'Parola dumneavoastr\u0103 nou\u0103 trebuie s\u0103 fie diferit\u0103 de parola veche \u0219i s\u0103 con\u021Bin\u0103 cel pu\u021Bin 8 caractere, 1 liter\u0103 mare, 1 liter\u0103 mic\u0103 \u0219i 1 num\u0103r.',
    },
    twoFactorAuth: {
        headerTitle: 'Autentificare \u00EEn doi pa\u0219i',
        twoFactorAuthEnabled: 'Autentificare \u00EEn doi pa\u0219i activat\u0103',
        whatIsTwoFactorAuth:
            'Autentificarea \u00EEn doi pa\u0219i (2FA) ajut\u0103 la men\u021Binerea securit\u0103\u021Bii contului t\u0103u. La autentificare, va trebui s\u0103 introduci un cod generat de aplica\u021Bia ta de autentificare preferat\u0103.',
        disableTwoFactorAuth: 'Dezactiveaz\u0103 autentificarea \u00EEn doi pa\u0219i',
        explainProcessToRemove:
            'Pentru a dezactiva autentificarea \u00EEn doi pa\u0219i (2FA), v\u0103 rug\u0103m s\u0103 introduce\u021Bi un cod valid din aplica\u021Bia dvs. de autentificare.',
        disabled: 'Autentificarea \u00EEn doi pa\u0219i este acum dezactivat\u0103',
        noAuthenticatorApp: 'Nu vei mai avea nevoie de o aplica\u021Bie de autentificare pentru a te conecta la Expensify.',
        stepCodes: 'Coduri de recuperare',
        keepCodesSafe: 'P\u0103stra\u021Bi aceste coduri de recuperare \u00EEn siguran\u021B\u0103!',
        codesLoseAccess:
            'Dac\u0103 pierzi accesul la aplica\u021Bia ta de autentificare \u0219i nu ai aceste coduri, vei pierde accesul la contul t\u0103u.\n\nNot\u0103: Configurarea autentific\u0103rii cu doi factori te va deconecta de la toate celelalte sesiuni active.',
        errorStepCodes: 'V\u0103 rug\u0103m s\u0103 copia\u021Bi sau s\u0103 desc\u0103rca\u021Bi codurile \u00EEnainte de a continua.',
        stepVerify: 'Verific\u0103',
        scanCode: 'Scaneaz\u0103 codul QR folosind',
        authenticatorApp: 'aplica\u021Bie de autentificare',
        addKey: 'Sau ad\u0103uga\u021Bi aceast\u0103 cheie secret\u0103 \u00EEn aplica\u021Bia dvs. de autentificare:',
        enterCode: 'Apoi introduce\u021Bi codul de \u0219ase cifre generat de aplica\u021Bia dvs. de autentificare.',
        stepSuccess: 'Finalizat',
        enabled: 'Autentificare \u00EEn doi pa\u0219i activat\u0103',
        congrats: 'Felicit\u0103ri! Acum ai acea securitate suplimentar\u0103.',
        copy: 'Copiaz\u0103',
        disable: 'Dezactiveaz\u0103',
        enableTwoFactorAuth: 'Activeaz\u0103 autentificarea cu doi factori',
        pleaseEnableTwoFactorAuth: 'V\u0103 rug\u0103m s\u0103 activa\u021Bi autentificarea \u00EEn doi pa\u0219i.',
        twoFactorAuthIsRequiredDescription: 'Pentru motive de securitate, Xero necesit\u0103 autentificare \u00EEn doi pa\u0219i pentru a conecta integrarea.',
        twoFactorAuthIsRequiredForAdminsDescription:
            'Este necesar\u0103 autentificarea \u00EEn doi pa\u0219i pentru administratorii spa\u021Biului de lucru Xero. V\u0103 rug\u0103m s\u0103 activa\u021Bi autentificarea \u00EEn doi pa\u0219i pentru a continua.',
        twoFactorAuthCannotDisable: 'Nu se poate dezactiva 2FA',
        twoFactorAuthRequired: 'Autentificarea \u00EEn doi pa\u0219i (2FA) este necesar\u0103 pentru conexiunea ta Xero \u0219i nu poate fi dezactivat\u0103.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul dvs. de recuperare.',
            incorrectRecoveryCode: 'Cod de recuperare incorect. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        },
        useRecoveryCode: 'Utilizeaz\u0103 codul de recuperare',
        recoveryCode: 'Cod de recuperare',
        use2fa: 'Utiliza\u021Bi codul de autentificare \u00EEn doi pa\u0219i',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul dvs. de autentificare \u00EEn doi pa\u0219i.',
            incorrect2fa: 'Cod de autentificare \u00EEn doi pa\u0219i incorect. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Parola actualizat\u0103!',
        allSet: 'E\u0219ti preg\u0103tit. P\u0103streaz\u0103-\u021Bi \u00EEn siguran\u021B\u0103 noua parol\u0103.',
    },
    privateNotes: {
        title: 'Note private',
        personalNoteMessage:
            'P\u0103streaz\u0103 noti\u021Be despre aceast\u0103 conversa\u021Bie aici. E\u0219ti singura persoan\u0103 care poate ad\u0103uga, edita sau vizualiza aceste noti\u021Be.',
        sharedNoteMessage:
            'P\u0103stra\u021Bi note despre aceast\u0103 conversa\u021Bie aici. Angaja\u021Bii Expensify \u0219i al\u021Bi membri pe domeniul team.expensify.com pot vizualiza aceste note.',
        composerLabel: 'Noti\u021Be',
        myNote: 'Noti\u021Ba mea',
        error: {
            genericFailureMessage: 'Notele private nu au putut fi salvate.',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un cod de securitate valid.',
        },
        securityCode: 'Cod de securitate',
        changeBillingCurrency: 'Schimb\u0103 moneda de facturare',
        changePaymentCurrency: 'Schimb\u0103 moneda de plat\u0103',
        paymentCurrency: 'Moneda de plat\u0103',
        note: 'Not\u0103: Schimbarea monedei de plat\u0103 poate influen\u021Ba c\u00E2t ve\u021Bi pl\u0103ti pentru Expensify. Consulta\u021Bi-ne',
        noteLink: 'pagina de pre\u021Buri',
        noteDetails: 'pentru detalii complete.',
    },
    addDebitCardPage: {
        addADebitCard: 'Ad\u0103uga\u021Bi un card de debit',
        nameOnCard: 'Nume pe card',
        debitCardNumber: 'Num\u0103rul cardului de debit',
        expiration: 'Data expir\u0103rii',
        expirationDate: 'LLAA',
        cvv: 'CVV',
        billingAddress: 'Adresa de facturare',
        growlMessageOnSave: 'Cardul t\u0103u de debit a fost ad\u0103ugat cu succes',
        expensifyPassword: 'Parola Expensify',
        error: {
            invalidName: 'Numele poate include doar litere.',
            addressZipCode: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un cod po\u0219tal valid.',
            debitCardNumber: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un num\u0103r valid de card de debit.',
            expirationDate: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi o dat\u0103 de expirare valid\u0103.',
            securityCode: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un cod de securitate valid.',
            addressStreet: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o adres\u0103 de facturare valid\u0103 care s\u0103 nu fie o cutie po\u0219tal\u0103.',
            addressState: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un stat.',
            addressCity: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un ora\u0219.',
            genericFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul ad\u0103ug\u0103rii cardului t\u0103u. Te rog \u00EEncearc\u0103 din nou.',
            password: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi parola dvs. Expensify.',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Adaug\u0103 card de plat\u0103',
        nameOnCard: 'Nume pe card',
        paymentCardNumber: 'Num\u0103rul cardului',
        expiration: 'Data expir\u0103rii',
        expirationDate: 'LLAA',
        cvv: 'CVV',
        billingAddress: 'Adresa de facturare',
        growlMessageOnSave: 'Cardul dvs. de plat\u0103 a fost ad\u0103ugat cu succes',
        expensifyPassword: 'Parola Expensify',
        error: {
            invalidName: 'Numele poate include doar litere.',
            addressZipCode: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un cod po\u0219tal valid.',
            paymentCardNumber: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un num\u0103r de card valid.',
            expirationDate: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi o dat\u0103 de expirare valid\u0103.',
            securityCode: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un cod de securitate valid.',
            addressStreet: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o adres\u0103 de facturare valid\u0103 care s\u0103 nu fie o cutie po\u0219tal\u0103.',
            addressState: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un stat.',
            addressCity: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un ora\u0219.',
            genericFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul ad\u0103ug\u0103rii cardului t\u0103u. Te rog \u00EEncearc\u0103 din nou.',
            password: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi parola dvs. Expensify.',
        },
    },
    walletPage: {
        balance: 'Echilibru',
        paymentMethodsTitle: 'Metode de plat\u0103',
        setDefaultConfirmation: 'Seteaz\u0103 metoda de plat\u0103 implicit\u0103',
        setDefaultSuccess: 'Metoda de plat\u0103 implicit\u0103 a fost setat\u0103!',
        deleteAccount: '\u0218terge contul',
        deleteConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi acest cont?',
        error: {
            notOwnerOfBankAccount: 'A ap\u0103rut o eroare \u00EEn timpul set\u0103rii acestui cont bancar ca metod\u0103 de plat\u0103 implicit\u0103.',
            invalidBankAccount: 'Acest cont bancar este temporar suspendat.',
            notOwnerOfFund: 'A ap\u0103rut o eroare \u00EEn timpul set\u0103rii acestui card ca metod\u0103 de plat\u0103 implicit\u0103.',
            setDefaultFailure: 'Ceva nu a mers bine. V\u0103 rug\u0103m s\u0103 discuta\u021Bi cu Concierge pentru asisten\u021B\u0103 suplimentar\u0103.',
        },
        addBankAccountFailure:
            'A ap\u0103rut o eroare nea\u0219teptat\u0103 \u00EEn timp ce \u00EEncerca\u021Bi s\u0103 ad\u0103uga\u021Bi contul dvs. bancar. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        getPaidFaster: 'Fii pl\u0103tit mai repede',
        addPaymentMethod: 'Ad\u0103uga\u021Bi o metod\u0103 de plat\u0103 pentru a trimite \u0219i a primi pl\u0103\u021Bi direct \u00EEn aplica\u021Bie.',
        getPaidBackFaster: 'Fii rambursat mai repede',
        secureAccessToYourMoney: 'Acces securizat la banii t\u0103i',
        receiveMoney: 'Primi\u021Bi bani \u00EEn moneda local\u0103',
        expensifyWallet: 'Portofelul Expensify (Beta)',
        sendAndReceiveMoney: 'Trimite \u0219i prime\u0219te bani cu prietenii. Doar conturi bancare din SUA.',
        enableWallet: 'Activeaz\u0103 portofelul',
        addBankAccountToSendAndReceive: 'Primi\u021Bi banii \u00EEnapoi pentru cheltuielile pe care le trimite\u021Bi la un spa\u021Biu de lucru.',
        addBankAccount: 'Adaug\u0103 cont bancar',
        assignedCards: 'C\u0103r\u021Bi atribuite',
        assignedCardsDescription: 'Acestea sunt carduri atribuite de un administrator al spa\u021Biului de lucru pentru a gestiona cheltuielile companiei.',
        expensifyCard: 'Cardul Expensify',
        walletActivationPending: 'Revizuim informa\u021Biile dumneavoastr\u0103. V\u0103 rug\u0103m s\u0103 reveni\u021Bi \u00EEn c\u00E2teva minute!',
        walletActivationFailed:
            'Din p\u0103cate, portofelul t\u0103u nu poate fi activat \u00EEn acest moment. Te rug\u0103m s\u0103 discu\u021Bi cu Concierge pentru asisten\u021B\u0103 suplimentar\u0103.',
        addYourBankAccount: 'Adaug\u0103 contul t\u0103u bancar',
        addBankAccountBody:
            'Haide\u021Bi s\u0103 v\u0103 conect\u0103m contul bancar la Expensify, astfel \u00EEnc\u00E2t s\u0103 fie mai u\u0219or ca niciodat\u0103 s\u0103 trimite\u021Bi \u0219i s\u0103 primi\u021Bi pl\u0103\u021Bi direct \u00EEn aplica\u021Bie.',
        chooseYourBankAccount: 'Alege\u021Bi contul dvs. bancar',
        chooseAccountBody: 'Asigura\u021Bi-v\u0103 c\u0103 selecta\u021Bi cel corect.',
        confirmYourBankAccount: 'Confirm\u0103-\u021Bi contul bancar',
    },
    cardPage: {
        expensifyCard: 'Cardul Expensify',
        availableSpend: 'Limit\u0103 r\u0103mas\u0103',
        smartLimit: {
            name: 'Limit\u0103 inteligent\u0103',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Pute\u021Bi cheltui p\u00E2n\u0103 la ${formattedLimit} pe acest card, iar limita se va reseta pe m\u0103sur\u0103 ce cheltuielile trimise sunt aprobate.`,
        },
        fixedLimit: {
            name: 'Limit fix',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Pute\u021Bi cheltui p\u00E2n\u0103 la ${formattedLimit} pe acest card, iar apoi acesta se va dezactiva.`,
        },
        monthlyLimit: {
            name: 'Limita lunar\u0103',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Pute\u021Bi cheltui p\u00E2n\u0103 la ${formattedLimit} pe aceast\u0103 cartel\u0103 pe lun\u0103. Limita se va reseta \u00EEn prima zi a fiec\u0103rei luni calendaristice.`,
        },
        virtualCardNumber: 'Num\u0103rul cardului virtual',
        physicalCardNumber: 'Num\u0103rul fizic al cardului',
        getPhysicalCard: 'Ob\u021Bine\u021Bi cardul fizic',
        reportFraud: 'Raporteaz\u0103 frauda cu cardul virtual',
        reviewTransaction: 'Revizui\u021Bi tranzac\u021Bia',
        suspiciousBannerTitle: 'Tranzac\u021Bie suspect\u0103',
        suspiciousBannerDescription: 'Am observat tranzac\u021Bii suspecte pe cardul t\u0103u. Apas\u0103 mai jos pentru a le revizui.',
        cardLocked: 'Cardul dvs. este temporar blocat \u00EEn timp ce echipa noastr\u0103 revizuie\u0219te contul companiei dvs.',
        cardDetails: {
            cardNumber: 'Num\u0103rul cardului virtual',
            expiration: 'Expirare',
            cvv: 'CVV',
            address: 'Adres\u0103',
            revealDetails: 'Dezv\u0103luie detalii',
            copyCardNumber: 'Copia\u021Bi num\u0103rul cardului',
            updateAddress: 'Actualizeaz\u0103 adresa',
        },
        cardDetailsLoadingFailure:
            'A ap\u0103rut o eroare \u00EEn timpul \u00EEnc\u0103rc\u0103rii detaliilor cardului. V\u0103 rug\u0103m s\u0103 verifica\u021Bi conexiunea la internet \u0219i \u00EEncerca\u021Bi din nou.',
        validateCardTitle: 'S\u0103 ne asigur\u0103m c\u0103 e\u0219ti tu',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul magic trimis la ${contactMethod} pentru a vizualiza detaliile cardului dvs. Ar trebui s\u0103 ajung\u0103 \u00EEntr-un minut sau dou\u0103.`,
    },
    workflowsPage: {
        workflowTitle: 'Cheltuie',
        workflowDescription: 'Configura\u021Bi un flux de lucru de la momentul \u00EEn care are loc cheltuirea, inclusiv aprobarea \u0219i plata.',
        delaySubmissionTitle: '\u00CEnt\u00E2rziere trimitere',
        delaySubmissionDescription:
            'Alege\u021Bi un program personalizat pentru trimiterea cheltuielilor, sau l\u0103sa\u021Bi acest lucru oprit pentru actualiz\u0103ri \u00EEn timp real privind cheltuielile.',
        submissionFrequency: 'Frecven\u021Ba de trimitere',
        submissionFrequencyDateOfMonth: 'Data lunii',
        addApprovalsTitle: 'Adaug\u0103 aprob\u0103ri',
        addApprovalButton: 'Adaug\u0103 fluxul de aprobare',
        addApprovalTip: 'Acest flux de lucru implicit se aplic\u0103 tuturor membrilor, cu excep\u021Bia cazului \u00EEn care exist\u0103 un flux de lucru mai specific.',
        approver: 'Aprobator',
        connectBankAccount: 'Conecteaz\u0103 contul bancar',
        addApprovalsDescription: 'Este necesar\u0103 aprobare suplimentar\u0103 \u00EEnainte de autorizarea unei pl\u0103\u021Bi.',
        makeOrTrackPaymentsTitle: 'Efectueaz\u0103 sau urm\u0103re\u0219te pl\u0103\u021Bile',
        makeOrTrackPaymentsDescription:
            'Ad\u0103uga\u021Bi un pl\u0103titor autorizat pentru pl\u0103\u021Bi efectuate \u00EEn Expensify, sau pur \u0219i simplu urm\u0103ri\u021Bi pl\u0103\u021Bile efectuate \u00EEn alt\u0103 parte.',
        editor: {
            submissionFrequency: 'Alege\u021Bi c\u00E2t timp ar trebui s\u0103 a\u0219tepte Expensify \u00EEnainte de a \u00EEmp\u0103rt\u0103\u0219i cheltuielile f\u0103r\u0103 erori.',
        },
        frequencyDescription: 'Alege\u021Bi c\u00E2t de des dori\u021Bi s\u0103 trimite\u021Bi cheltuielile automat, sau face\u021Bi-o manual',
        frequencies: {
            weekly: 'S\u0103pt\u0103m\u00E2nal',
            monthly: 'Lunar',
            twiceAMonth: 'De dou\u0103 ori pe lun\u0103',
            byTrip: 'Prin c\u0103l\u0103torie',
            manually: 'Manual',
            daily: 'Zilnic',
            lastDayOfMonth: 'Ultima zi a lunii',
            lastBusinessDayOfMonth: 'Ultima zi lucr\u0103toare a lunii',
            ordinals: {
                one: 'The original text is missing. Please provide the text that needs to be translated.',
                two: 'Your request seems incomplete. Could you please provide the text or TypeScript function that you want to be translated into Romanian?',
                few: "Sorry, but you didn't provide any text to translate.",
                other: "You didn't provide any text to translate. Please provide the text you want translated.",
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Primul',
                '2': 'AL doilea',
                '3': 'Al treilea',
                '4': 'Al patrulea',
                '5': 'Al cincilea',
                '6': 'Al \u0219aselea',
                '7': 'Al \u0219aptelea',
                '8': 'Al optulea',
                '9': 'Al nou\u0103lea',
                '10': 'Al zecelea',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Acest membru apar\u021Bine deja unui alt flux de aprobare. Orice actualiz\u0103ri aici se vor reflecta \u0219i acolo.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> deja aprob\u0103 rapoartele pentru <strong>${name2}</strong>. V\u0103 rug\u0103m s\u0103 alege\u021Bi un alt aprobator pentru a evita un flux de lucru circular.`,
        emptyContent: {
            title: 'Niciun membru de afi\u0219at',
            expensesFromSubtitle: 'To\u021Bi membrii spa\u021Biului de lucru apar\u021Bin deja unui flux de aprobare existent.',
            approverSubtitle: 'To\u021Bi aprobatorii apar\u021Bin unui flux de lucru existent.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage:
            'Trimiterea \u00EEnt\u00E2rziat\u0103 nu a putut fi modificat\u0103. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou sau s\u0103 contacta\u021Bi suportul.',
        autoReportingFrequencyErrorMessage:
            'Frecven\u021Ba de trimitere nu a putut fi modificat\u0103. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou sau s\u0103 contacta\u021Bi suportul.',
        monthlyOffsetErrorMessage: 'Frecven\u021Ba lunar\u0103 nu a putut fi modificat\u0103. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou sau s\u0103 contacta\u021Bi suportul.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirm\u0103',
        header: 'Ad\u0103uga\u021Bi mai mul\u021Bi aprobatori \u0219i confirma\u021Bi.',
        additionalApprover: 'Aprobator suplimentar',
        submitButton: 'Adaug\u0103 flux de lucru',
    },
    workflowsEditApprovalsPage: {
        title: 'Flux de lucru pentru aprobarea edit\u0103rii',
        deleteTitle: '\u0218terge fluxul de aprobare',
        deletePrompt: 'Sunte\u021Bi sigur c\u0103 dori\u021Bi s\u0103 \u0219terge\u021Bi acest flux de aprobare? To\u021Bi membrii vor urma ulterior fluxul implicit.',
    },
    workflowsExpensesFromPage: {
        title: 'Cheltuieli de la',
        header: 'C\u00E2nd urm\u0103torii membri trimit cheltuieli:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Aprobatorul nu a putut fi schimbat. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou sau s\u0103 contacta\u021Bi suportul.',
        header: 'Trimite acestui membru pentru aprobare:',
    },
    workflowsPayerPage: {
        title: 'Pl\u0103titor autorizat',
        genericErrorMessage: 'Pl\u0103titorul autorizat nu a putut fi schimbat. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        admins: 'Administratori',
        payer: 'Pl\u0103titor',
        paymentAccount: 'Cont de plat\u0103',
    },
    reportFraudPage: {
        title: 'Raporteaz\u0103 frauda cu cardul virtual',
        description:
            'Dac\u0103 detaliile cardului t\u0103u virtual au fost furate sau compromise, vom dezactiva permanent cardul t\u0103u existent \u0219i \u00EE\u021Bi vom furniza un nou card virtual \u0219i num\u0103r.',
        deactivateCard: 'Dezactiveaz\u0103 cardul',
        reportVirtualCardFraud: 'Raporteaz\u0103 frauda cu cardul virtual',
    },
    reportFraudConfirmationPage: {
        title: 'Frauda cu cardul raportat\u0103',
        description:
            'Ne-am deactivat permanent cardul dvs. existent. C\u00E2nd v\u0103 \u00EEntoarce\u021Bi s\u0103 vede\u021Bi detaliile cardului, ve\u021Bi avea disponibil un nou card virtual.',
        buttonText: 'Am \u00EEn\u021Beles, mul\u021Bumesc!',
    },
    activateCardPage: {
        activateCard: 'Activeaz\u0103 cardul',
        pleaseEnterLastFour: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi ultimele patru cifre ale cardului dvs.',
        activatePhysicalCard: 'Activa\u021Bi cardul fizic',
        error: {
            thatDidntMatch: 'Aceasta nu se potrive\u0219te cu ultimele 4 cifre de pe cardul t\u0103u. Te rog \u00EEncearc\u0103 din nou.',
            throttled:
                'A\u021Bi introdus incorect ultimele 4 cifre ale Cardului Expensify de prea multe ori. Dac\u0103 sunte\u021Bi sigur c\u0103 numerele sunt corecte, v\u0103 rug\u0103m s\u0103 contacta\u021Bi Concierge pentru a rezolva. \u00CEn caz contrar, \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
        },
    },
    getPhysicalCard: {
        header: 'Ob\u021Bine\u021Bi cardul fizic',
        nameMessage: 'Introduce\u021Bi numele \u0219i prenumele dvs., deoarece acestea vor fi afi\u0219ate pe cardul dvs.',
        legalName: 'Nume legal',
        legalFirstName: 'Prenume legal',
        legalLastName: 'Nume de familie legal',
        phoneMessage: 'Introduce\u021Bi num\u0103rul dvs. de telefon.',
        phoneNumber: 'Num\u0103r de telefon',
        address: 'Adres\u0103',
        addressMessage: 'Introduce\u021Bi adresa dvs. de livrare.',
        streetAddress: 'Adresa Str\u0103zii',
        city: 'Ora\u0219',
        state: 'Stare',
        zipPostcode: 'Cod po\u0219tal',
        country: '\u021Aar\u0103',
        confirmMessage: 'V\u0103 rug\u0103m s\u0103 confirma\u021Bi detaliile de mai jos.',
        estimatedDeliveryMessage: 'Cardul t\u0103u fizic va ajunge \u00EEn 2-3 zile lucr\u0103toare.',
        next: 'Urm\u0103torul',
        getPhysicalCard: 'Ob\u021Bine\u021Bi cardul fizic',
        shipCard: 'Carte de nav\u0103',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer\u0103${amount ? ` ${amount}` : ''}`,
        instant: 'Instant (Card de debit)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `comision de ${rate}% (${minAmount} minim)`,
        ach: '1-3 zile lucr\u0103toare (Cont bancar)',
        achSummary: 'F\u0103r\u0103 tax\u0103',
        whichAccount: 'Ce cont?',
        fee: 'Tax\u0103',
        transferSuccess: 'Transfer reu\u0219it!',
        transferDetailBankAccount: 'Banii dvs. ar trebui s\u0103 ajung\u0103 \u00EEn urm\u0103toarele 1-3 zile lucr\u0103toare.',
        transferDetailDebitCard: 'Banii t\u0103i ar trebui s\u0103 ajung\u0103 imediat.',
        failedTransfer: 'Soldul dvs. nu este complet achitat. V\u0103 rug\u0103m s\u0103 transfera\u021Bi \u00EEntr-un cont bancar.',
        notHereSubTitle: 'V\u0103 rug\u0103m s\u0103 transfera\u021Bi soldul dvs. de pe pagina portofelului',
        goToWallet: 'Mergi la Portofel',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Alege contul',
    },
    paymentMethodList: {
        addPaymentMethod: 'Adaug\u0103 metoda de plat\u0103',
        addNewDebitCard: 'Adaug\u0103 un nou card de debit',
        addNewBankAccount: 'Adaug\u0103 un cont bancar nou',
        accountLastFour: 'Se \u00EEncheie \u00EEn',
        cardLastFour: 'Card care se termin\u0103 \u00EEn',
        addFirstPaymentMethod: 'Ad\u0103uga\u021Bi o metod\u0103 de plat\u0103 pentru a trimite \u0219i a primi pl\u0103\u021Bi direct \u00EEn aplica\u021Bie.',
        defaultPaymentMethod: 'Implicit',
    },
    preferencesPage: {
        appSection: {
            title: 'Preferin\u021Be aplica\u021Bie',
        },
        testSection: {
            title: 'Preferin\u021Be de test',
            subtitle: 'Set\u0103ri pentru a ajuta la depanarea \u0219i testarea aplica\u021Biei pe staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Primi\u021Bi actualiz\u0103ri relevante ale caracteristicilor \u0219i \u0219tiri Expensify',
        muteAllSounds: 'Dezactiveaz\u0103 toate sunetele de la Expensify',
    },
    priorityModePage: {
        priorityMode: 'Mod de prioritate',
        explainerText:
            'Alege dac\u0103 s\u0103 te #concentrezi doar pe chat-urile necitite \u0219i fixate, sau s\u0103 ar\u0103\u021Bi totul cu cele mai recente \u0219i chat-urile fixate \u00EEn partea de sus.',
        priorityModes: {
            default: {
                label: 'Cel mai recent',
                description: 'Afi\u0219eaz\u0103 toate conversa\u021Biile sortate dup\u0103 cele mai recente',
            },
            gsd: {
                label: "Sunte\u021Bi un traduc\u0103tor profesionist. Traduce\u021Bi urm\u0103torul text \u00EEn ro. Este fie un \u0219ir simplu, fie o func\u021Bie TypeScript care returneaz\u0103 un \u0219ir de \u0219abloane. P\u0103stra\u021Bi substituen\u021Bii ca ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc f\u0103r\u0103 a modifica con\u021Binutul lor sau a elimina parantezele. Con\u021Binutul substituen\u021Bilor este descriptiv pentru ceea ce reprezint\u0103 \u00EEn fraz\u0103, dar poate include expresii ternare sau alt cod TypeScript.",
                description: 'Afi\u0219eaz\u0103 doar necitite sortate alfabetic',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `\u00EEn ${policyName}`,
    },
    reportDescriptionPage: {
        roomDescription: 'Descrierea camerei',
        roomDescriptionOptional: 'Descrierea camerei (op\u021Bional)',
        explainerText: 'Seteaz\u0103 o descriere personalizat\u0103 pentru camer\u0103.',
    },
    groupChat: {
        lastMemberTitle: 'Aten\u021Bie!',
        lastMemberWarning:
            'Deoarece e\u0219ti ultima persoan\u0103 aici, plecarea ta va face aceast\u0103 conversa\u021Bie inaccesibil\u0103 pentru to\u021Bi membrii. E\u0219ti sigur c\u0103 vrei s\u0103 pleci?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Grupul de chat al lui ${displayName}`,
    },
    languagePage: {
        language: 'Limba',
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
            ro: {label: 'Română'}
        },
        translateMessage: 'Tradu mesajele',
        viewOriginal: 'Vezi originalul',
        showTranslation: 'Afișează traducerea',
    },
    themePage: {
        theme: 'Tem\u0103',
        themes: {
            dark: {
                label: '\u00CEntunecat',
            },
            light: {
                label: 'Lumin\u0103',
            },
            system: {
                label: 'Utiliza\u021Bi set\u0103rile dispozitivului',
            },
        },
        chooseThemeBelowOrSync: 'Alege\u021Bi o tem\u0103 de mai jos sau sincroniza\u021Bi cu set\u0103rile dispozitivului dvs.',
    },
    termsOfUse: {
        phrase1: 'Prin autentificare, e\u0219ti de acord cu',
        phrase2: 'Termeni \u0219i Condi\u021Bii',
        phrase3: '\u0219i',
        phrase4: 'Confiden\u021Bialitate',
        phrase5: `Transmiterea banilor este asigurat\u0103 de ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) \u00EEn conformitate cu`,
        phrase6: 'licen\u021Be',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Nu ai primit un cod magic?',
        enterAuthenticatorCode: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul dvs. de autentificare',
        enterRecoveryCode: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul dvs. de recuperare',
        requiredWhen2FAEnabled: 'Necesar c\u00E2nd 2FA este activat',
        requestNewCode: 'Solicita\u021Bi un cod nou \u00EEn',
        requestNewCodeAfterErrorOccurred: 'Solicita\u021Bi un cod nou',
        error: {
            pleaseFillMagicCode: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul dvs. magic.',
            incorrectMagicCode: 'Cod magic incorect.',
            pleaseFillTwoFactorAuth: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul dvs. de autentificare \u00EEn doi pa\u0219i.',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'V\u0103 rug\u0103m s\u0103 completa\u021Bi toate c\u00E2mpurile',
        pleaseFillPassword: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi parola dvs.',
        pleaseFillTwoFactorAuth: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul dvs. de autentificare \u00EEn doi pa\u0219i',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Introduce\u021Bi codul dvs. de autentificare \u00EEn doi pa\u0219i pentru a continua',
        forgot: 'Ai uitat?',
        requiredWhen2FAEnabled: 'Necesar c\u00E2nd 2FA este activat',
        error: {
            incorrectPassword: 'Parol\u0103 incorect\u0103. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            incorrectLoginOrPassword: 'Conectare sau parol\u0103 incorect\u0103. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            incorrect2fa: 'Cod de autentificare \u00EEn doi pa\u0219i incorect. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            twoFactorAuthenticationEnabled:
                'Ave\u021Bi 2FA activat pe acest cont. V\u0103 rug\u0103m s\u0103 v\u0103 autentifica\u021Bi folosind adresa de email sau num\u0103rul de telefon.',
            invalidLoginOrPassword: 'Autentificare sau parol\u0103 invalide. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou sau s\u0103 v\u0103 reseta\u021Bi parola.',
            unableToResetPassword:
                'Nu am putut s\u0103 v\u0103 schimb\u0103m parola. Acest lucru se datoreaz\u0103 probabil unui link de resetare a parolei expirat dintr-un email vechi de resetare a parolei. V-am trimis un nou link prin email, astfel \u00EEnc\u00E2t s\u0103 pute\u021Bi \u00EEncerca din nou. Verifica\u021Bi-v\u0103 Inbox-ul \u0219i folderul Spam; ar trebui s\u0103 ajung\u0103 \u00EEn doar c\u00E2teva minute.',
            noAccess: 'Nu ave\u021Bi acces la aceast\u0103 aplica\u021Bie. V\u0103 rug\u0103m s\u0103 ad\u0103uga\u021Bi numele dvs. de utilizator GitHub pentru acces.',
            accountLocked: 'Contul dvs. a fost blocat dup\u0103 prea multe \u00EEncerc\u0103ri nereu\u0219ite. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou dup\u0103 1 or\u0103.',
            fallback: 'Ceva nu a mers bine. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon sau email',
        error: {
            invalidFormatEmailLogin: 'Emailul introdus este invalid. V\u0103 rug\u0103m s\u0103 corecta\u021Bi formatul \u0219i s\u0103 \u00EEncerca\u021Bi din nou.',
        },
        cannotGetAccountDetails: 'Nu am putut prelua detaliile contului. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi s\u0103 v\u0103 conecta\u021Bi din nou.',
        loginForm: 'Formular de autentificare',
        notYou: ({user}: NotYouParams) => `Nu ${user}?`,
    },
    onboarding: {
        welcome: 'Bine ai venit!',
        welcomeSignOffTitle: 'Este minunat s\u0103 te cunosc!',
        explanationModal: {
            title: 'Bine ai venit la Expensify',
            description:
                'O aplica\u021Bie pentru a gestiona cheltuielile tale de afaceri \u0219i personale la viteza unui chat. \u00CEncearc-o \u0219i spune-ne ce p\u0103rere ai. Mai multe urmeaz\u0103!',
            secondaryDescription: 'Pentru a reveni la Expensify Classic, doar ap\u0103sa\u021Bi pe fotografia dvs. de profil > Mergi la Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Bine ai venit la Expensify',
            description:
                'O aplica\u021Bie pentru a gestiona toate cheltuielile tale de afaceri \u0219i personale \u00EEntr-un chat. Construit\u0103 pentru afacerea ta, echipa ta \u0219i prietenii t\u0103i.',
        },
        getStarted: '\u00CEncepe\u021Bi',
        whatsYourName: 'Care este numele t\u0103u?',
        peopleYouMayKnow: 'Persoane pe care s-ar putea s\u0103 le cuno\u0219ti sunt deja aici! Verific\u0103-\u021Bi emailul pentru a te al\u0103tura lor.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Cineva de la ${domain} a creat deja un spa\u021Biu de lucru. V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul magic trimis la ${email}.`,
        joinAWorkspace: 'Al\u0103tur\u0103-te unui spa\u021Biu de lucru',
        listOfWorkspaces:
            'Iat\u0103 lista de spa\u021Bii de lucru la care te po\u021Bi al\u0103tura. Nu-\u021Bi face griji, \u00EEntotdeauna te po\u021Bi al\u0103tura mai t\u00E2rziu dac\u0103 preferi.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} member${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Unde lucrezi?',
        errorSelection: 'V\u0103 rug\u0103m s\u0103 face\u021Bi o selec\u021Bie pentru a continua.',
        purpose: {
            title: 'Ce vrei s\u0103 faci ast\u0103zi?',
            errorContinue: 'V\u0103 rug\u0103m s\u0103 ap\u0103sa\u021Bi continuare pentru a v\u0103 configura.',
            errorBackButton: 'V\u0103 rug\u0103m s\u0103 finaliza\u021Bi \u00EEntreb\u0103rile de configurare pentru a \u00EEncepe s\u0103 utiliza\u021Bi aplica\u021Bia.',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Fi pl\u0103tit \u00EEnapoi de c\u0103tre angajatorul meu',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gestioneaz\u0103 cheltuielile echipei mele',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Urm\u0103re\u0219te \u0219i bugeteaz\u0103 cheltuielile',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Discut\u0103 \u0219i \u00EEmparte cheltuielile cu prietenii',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Altceva',
        },
        employees: {
            title: 'C\u00E2\u021Bi angaja\u021Bi ave\u021Bi?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 angaja\u021Bi',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 de angaja\u021Bi',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 de angaja\u021Bi',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1,000 de angaja\u021Bi',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Mai mult de 1,000 de angaja\u021Bi',
        },
        accounting: {
            title: 'Folose\u0219ti vreun software de contabilitate?',
            noneOfAbove: 'None of the above',
        },
        error: {
            requiredFirstName: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi prenumele pentru a continua.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nu-mi ar\u0103ta asta din nou',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Numele nu poate con\u021Bine cuvintele Expensify sau Concierge.',
            hasInvalidCharacter: 'Numele nu poate con\u021Bine o virgul\u0103 sau punct \u0219i virgul\u0103.',
            requiredFirstName: 'Prenumele nu poate fi gol.',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Care este numele t\u0103u legal?',
        enterDateOfBirth: 'Care este data ta de na\u0219tere?',
        enterAddress: 'Care este adresa ta?',
        enterPhoneNumber: 'Care este num\u0103rul t\u0103u de telefon?',
        personalDetails: 'Detalii personale',
        privateDataMessage: 'Aceste detalii sunt utilizate pentru c\u0103l\u0103torii \u0219i pl\u0103\u021Bi. Ele nu sunt niciodat\u0103 afi\u0219ate pe profilul t\u0103u public.',
        legalName: 'Nume legal',
        legalFirstName: 'Prenume legal',
        legalLastName: 'Nume de familie legal',
        address: 'Adres\u0103',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `Data ar trebui s\u0103 fie \u00EEnainte de ${dateString}.`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Data ar trebui s\u0103 fie dup\u0103 ${dateString}.`,
            hasInvalidCharacter: 'Numele poate include doar caractere latine.',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Formatul codului po\u0219tal este incorect.${zipFormat ? ` Format acceptabil: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `V\u0103 rug\u0103m s\u0103 v\u0103 asigura\u021Bi c\u0103 num\u0103rul de telefon este valid (de exemplu, ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link-ul a fost retrimis',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Am trimis un link magic de autentificare la ${login}. Te rog s\u0103 verifici ${loginType} pentru a te autentifica.`,
        resendLink: 'Retrimite linkul',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Pentru a valida ${secondaryLogin}, v\u0103 rug\u0103m s\u0103 retrimiteti codul magic din Set\u0103rile de cont ale ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Dac\u0103 nu mai ave\u021Bi acces la ${primaryLogin}, v\u0103 rug\u0103m s\u0103 dezlega\u021Bi conturile.`,
        unlink: 'Deconectare',
        linkSent: 'Link trimis!',
        succesfullyUnlinkedLogin: 'Conectarea secundar\u0103 a fost deconectat\u0103 cu succes!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Furnizorul nostru de e-mail a suspendat temporar e-mailurile c\u0103tre ${login} din cauza problemelor de livrare. Pentru a debloca autentificarea, v\u0103 rug\u0103m s\u0103 urma\u021Bi ace\u0219ti pa\u0219i:`,
        confirmThat: ({login}: ConfirmThatParams) => `Confirma\u021Bi c\u0103 ${login} este scris corect \u0219i este o adres\u0103 de e-mail real\u0103 \u0219i livrabil\u0103.`,
        emailAliases: 'Aliasurile de e-mail, cum ar fi "expenses@domain.com", trebuie s\u0103 aib\u0103 acces la propriul lor inbox pentru a fi un login valid pentru Expensify.',
        ensureYourEmailClient: 'Asigura\u021Bi-v\u0103 c\u0103 clientul dvs. de e-mail permite e-mailurile de la expensify.com.',
        youCanFindDirections: 'Pute\u021Bi g\u0103si instruc\u021Biuni despre cum s\u0103 finaliza\u021Bi acest pas',
        helpConfigure: 'dar s-ar putea s\u0103 ave\u021Bi nevoie de ajutorul departamentului dvs. de IT pentru a configura set\u0103rile de e-mail.',
        onceTheAbove: 'Odat\u0103 ce pa\u0219ii de mai sus sunt finaliza\u021Bi, v\u0103 rug\u0103m s\u0103 ne contacta\u021Bi',
        toUnblock: 'pentru a debloca autentificarea ta.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nu am putut livra mesaje SMS c\u0103tre ${login}, a\u0219a c\u0103 l-am suspendat pentru 24 de ore. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi s\u0103 valida\u021Bi num\u0103rul dvs:`,
        validationFailed: 'Validarea a e\u0219uat deoarece nu au trecut 24 de ore de la ultima \u00EEncercare.',
        validationSuccess: 'Num\u0103rul t\u0103u a fost validat! Apas\u0103 mai jos pentru a trimite un nou cod de autentificare magic.',
    },
    welcomeSignUpForm: {
        join: 'Al\u0103tur\u0103-te',
    },
    detailsPage: {
        localTime: 'Ora local\u0103',
    },
    newChatPage: {
        startGroup: '\u00CEncepe grupul',
        addToGroup: 'Adaug\u0103 la grup',
    },
    yearPickerPage: {
        year: 'An',
        selectYear: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un an',
    },
    focusModeUpdateModal: {
        title: 'Bine ai venit \u00EEn modul #focus!',
        prompt: 'R\u0103m\u00E2i la curent doar v\u0103z\u00E2nd conversa\u021Biile necitite sau conversa\u021Biile care necesit\u0103 aten\u021Bia ta. Nu-\u021Bi face griji, po\u021Bi schimba acest lucru \u00EEn orice moment \u00EEn',
        settings: 'set\u0103ri',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Chatul pe care \u00EEl c\u0103uta\u021Bi nu poate fi g\u0103sit.',
        getMeOutOfHere: 'Scoate-m\u0103 de aici',
        iouReportNotFound: 'Detaliile de plat\u0103 pe care le c\u0103uta\u021Bi nu pot fi g\u0103site.',
        notHere: 'Hmm... nu este aici',
        pageNotFound: 'Hopa, aceast\u0103 pagin\u0103 nu poate fi g\u0103sit\u0103',
        noAccess: 'Acel chat nu exist\u0103 sau nu ai acces la el. \u00CEncearc\u0103 s\u0103 folose\u0219ti c\u0103utarea pentru a g\u0103si un chat.',
        goBackHome: '\u00CEnapoi la pagina principal\u0103',
    },
    setPasswordPage: {
        enterPassword: 'Introduce\u021Bi o parol\u0103',
        setPassword: 'Seteaz\u0103 parola',
        newPasswordPrompt: 'Parola dvs. trebuie s\u0103 aib\u0103 cel pu\u021Bin 8 caractere, 1 liter\u0103 mare, 1 liter\u0103 mic\u0103 \u0219i 1 num\u0103r.',
        passwordFormTitle: 'Bine ai revenit la noul Expensify! Te rog s\u0103 \u00EE\u021Bi setezi parola.',
        passwordNotSet: 'Nu am reu\u0219it s\u0103 v\u0103 stabilim noua parol\u0103. V-am trimis un link pentru noua parol\u0103 pentru a \u00EEncerca din nou.',
        setPasswordLinkInvalid: 'Acest link de setare a parolei este invalid sau a expirat. Unul nou te a\u0219teapt\u0103 \u00EEn cutia ta de email!',
        validateAccount: 'Verific\u0103 contul',
    },
    statusPage: {
        status: 'Stare',
        statusExplanation:
            'Adaug\u0103 un emoji pentru a le oferi colegilor \u0219i prietenilor t\u0103i un mod u\u0219or de a \u0219ti ce se \u00EEnt\u00E2mpl\u0103. Po\u021Bi ad\u0103uga op\u021Bional \u0219i un mesaj!',
        today: 'Ast\u0103zi',
        clearStatus: '\u0218terge statusul',
        save: 'Salveaz\u0103',
        message: 'Mesaj',
        timePeriods: {
            never: 'Niciodat\u0103',
            thirtyMinutes: '30 de minute',
            oneHour: '1 or\u0103',
            afterToday: 'Ast\u0103zi',
            afterWeek: 'O s\u0103pt\u0103m\u00E2n\u0103',
            custom: 'Personalizat',
        },
        untilTomorrow: 'P\u00E2n\u0103 m\u00E2ine',
        untilTime: ({time}: UntilTimeParams) => `P\u00E2n\u0103 la ${time}`,
        date: 'Data',
        time: 'Timp',
        clearAfter: '\u0218terge dup\u0103',
        whenClearStatus: 'C\u00E2nd ar trebui s\u0103 \u00EE\u021Bi \u0219tergem statusul?',
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Pasul ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Informa\u021Bii bancare',
        confirmBankInfo: 'Confirm\u0103 informa\u021Biile bancare',
        manuallyAdd: 'Adaug\u0103 manual contul t\u0103u bancar',
        letsDoubleCheck: 'S\u0103 ne asigur\u0103m \u00EEnc\u0103 o dat\u0103 c\u0103 totul arat\u0103 corect.',
        accountEnding: 'Cont \u00EEncheiat \u00EEn',
        thisBankAccount: 'Acest cont bancar va fi folosit pentru pl\u0103\u021Bi de afaceri pe spa\u021Biul t\u0103u de lucru',
        accountNumber: 'Num\u0103r de cont',
        routingNumber: 'Num\u0103r de rutare',
        chooseAnAccountBelow: 'Alege\u021Bi un cont de mai jos',
        addBankAccount: 'Adaug\u0103 cont bancar',
        chooseAnAccount: 'Alege un cont',
        connectOnlineWithPlaid: 'Conecteaz\u0103-te la banca ta',
        connectManually: 'Conecteaz\u0103 manual',
        desktopConnection:
            'Not\u0103: Pentru a v\u0103 conecta cu Chase, Wells Fargo, Capital One sau Bank of America, v\u0103 rug\u0103m s\u0103 face\u021Bi clic aici pentru a finaliza acest proces \u00EEntr-un browser.',
        yourDataIsSecure: 'Datele tale sunt \u00EEn siguran\u021B\u0103',
        toGetStarted:
            'Ad\u0103uga\u021Bi un cont bancar pentru a rambursa cheltuielile, a emite carduri Expensify, a colecta pl\u0103\u021Bi de facturi \u0219i a pl\u0103ti facturi, toate dintr-un singur loc.',
        plaidBodyCopy:
            'Oferi\u021Bi angaja\u021Bilor dvs. o modalitate mai u\u0219oar\u0103 de a pl\u0103ti - \u0219i de a fi pl\u0103ti\u021Bi \u00EEnapoi - pentru cheltuielile companiei.',
        checkHelpLine: 'Num\u0103rul de rutare \u0219i num\u0103rul contului pot fi g\u0103site pe un cec pentru cont.',
        validateAccountError: {
            phrase1: 'Stai pu\u021Bin! Avem nevoie mai \u00EEnt\u00E2i s\u0103 \u00EE\u021Bi validezi contul. Pentru a face asta,',
            phrase2: 'conecteaz\u0103-te din nou cu un cod magic',
            phrase3: "You didn't provide any text to translate. Please provide the text you want translated into Romanian.",
            phrase4: 'verifica\u021Bi-v\u0103 contul aici',
        },
        hasPhoneLoginError:
            'Pentru a ad\u0103uga un cont bancar verificat, asigura\u021Bi-v\u0103 c\u0103 autentificarea primar\u0103 este un e-mail valid \u0219i \u00EEncerca\u021Bi din nou. Pute\u021Bi ad\u0103uga num\u0103rul dvs. de telefon ca autentificare secundar\u0103.',
        hasBeenThrottledError:
            'A ap\u0103rut o eroare \u00EEn timpul ad\u0103ug\u0103rii contului t\u0103u bancar. Te rug\u0103m s\u0103 a\u0219tep\u021Bi c\u00E2teva minute \u0219i s\u0103 \u00EEncerci din nou.',
        hasCurrencyError:
            'Oops! Se pare c\u0103 moneda spa\u021Biului t\u0103u de lucru este setat\u0103 la o alt\u0103 moned\u0103 dec\u00E2t USD. Pentru a continua, te rog s\u0103 o setezi la USD \u0219i \u00EEncearc\u0103 din nou.',
        error: {
            youNeedToSelectAnOption: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi o op\u021Biune pentru a continua.',
            noBankAccountAvailable: '\u00CEmi pare r\u0103u, nu exist\u0103 niciun cont bancar disponibil.',
            noBankAccountSelected: 'V\u0103 rug\u0103m s\u0103 alege\u021Bi un cont.',
            taxID: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un num\u0103r de identificare fiscal\u0103 valid.',
            website: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un site web valid.',
            zipCode: `V\u0103 rug\u0103m s\u0103 introduce\u021Bi un cod po\u0219tal valid folosind formatul: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}.`,
            phoneNumber: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un num\u0103r de telefon valid.',
            email: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o adres\u0103 de email valid\u0103.',
            companyName: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un nume de afacere valid.',
            addressCity: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un ora\u0219 valid.',
            addressStreet: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o adres\u0103 stradal\u0103 valid\u0103.',
            addressState: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un stat valid.',
            incorporationDateFuture: 'Data \u00EEnregistr\u0103rii nu poate fi \u00EEn viitor.',
            incorporationState: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un stat valid.',
            industryCode: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un cod valid de clasificare a industriei cu \u0219ase cifre.',
            restrictedBusiness: 'V\u0103 rug\u0103m s\u0103 confirma\u021Bi c\u0103 afacerea nu se afl\u0103 pe lista afacerilor restric\u021Bionate.',
            routingNumber: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un num\u0103r de rutare valid.',
            accountNumber: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un num\u0103r de cont valid.',
            routingAndAccountNumberCannotBeSame: 'Numerele de rutare \u0219i de cont nu se pot potrivi.',
            companyType: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un tip de companie valid.',
            tooManyAttempts:
                'Datorit\u0103 unui num\u0103r mare de \u00EEncerc\u0103ri de autentificare, aceast\u0103 op\u021Biune a fost dezactivat\u0103 pentru 24 de ore. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu sau s\u0103 introduce\u021Bi detaliile manual \u00EEn schimb.',
            address: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o adres\u0103 valid\u0103.',
            dob: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi o dat\u0103 de na\u0219tere valid\u0103.',
            age: 'Trebuie s\u0103 aib\u0103 peste 18 ani.',
            ssnLast4: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi ultimele 4 cifre valide ale CNP-ului.',
            firstName: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un prenume valid.',
            lastName: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un nume de familie valid.',
            noDefaultDepositAccountOrDebitCardAvailable: 'V\u0103 rug\u0103m s\u0103 ad\u0103uga\u021Bi un cont de depozit sau un card de debit implicit.',
            validationAmounts:
                'Valorile de validare pe care le-a\u021Bi introdus sunt incorecte. V\u0103 rug\u0103m s\u0103 verifica\u021Bi din nou extrasul de cont \u0219i s\u0103 \u00EEncerca\u021Bi din nou.',
            fullName: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un nume complet valid.',
            ownershipPercentage: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un num\u0103r procentual valid.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Unde este situat contul t\u0103u bancar?',
        accountDetailsStepHeader: 'Care sunt detaliile contului t\u0103u?',
        accountTypeStepHeader: 'Ce tip de cont este acesta?',
        bankInformationStepHeader: 'Care sunt detaliile tale bancare?',
        accountHolderInformationStepHeader: 'Care sunt detaliile titularului contului?',
        howDoWeProtectYourData: 'Cum protej\u0103m datele tale?',
        currencyHeader: 'Care este moneda contului t\u0103u bancar?',
        confirmationStepHeader: 'Verific\u0103-\u021Bi informa\u021Biile.',
        confirmationStepSubHeader: 'Verifica\u021Bi cu aten\u021Bie detaliile de mai jos \u0219i bifa\u021Bi caseta de termeni pentru a confirma.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Introduce\u021Bi parola Expensify',
        alreadyAdded: 'Acest cont a fost deja ad\u0103ugat.',
        chooseAccountLabel: 'Cont',
        successTitle: 'Contul bancar personal a fost ad\u0103ugat!',
        successMessage: 'Felicit\u0103ri, contul t\u0103u bancar este configurat \u0219i preg\u0103tit s\u0103 primeasc\u0103 ramburs\u0103ri.',
    },
    attachmentView: {
        unknownFilename: 'Nume de fi\u0219ier necunoscut',
        passwordRequired: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o parol\u0103',
        passwordIncorrect: 'Parol\u0103 incorect\u0103. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        failedToLoadPDF: '\u00CEnc\u0103rcarea fi\u0219ierului PDF a e\u0219uat.',
        pdfPasswordForm: {
            title: 'PDF protejat cu parol\u0103',
            infoText: 'Acest PDF este protejat de parol\u0103.',
            beforeLinkText: 'Te rog',
            linkText: 'introduce\u021Bi parola',
            afterLinkText: 'pentru a-l vizualiza.',
            formLabel: 'Vizualizeaz\u0103 PDF',
        },
        attachmentNotFound: 'Ata\u0219amentul nu a fost g\u0103sit',
    },
    messages: {
        errorMessageInvalidPhone: `V\u0103 rug\u0103m s\u0103 introduce\u021Bi un num\u0103r de telefon valid f\u0103r\u0103 paranteze sau liniu\u021Be. Dac\u0103 v\u0103 afla\u021Bi \u00EEn afara SUA, include\u021Bi codul \u021B\u0103rii dvs. (de exemplu, ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Email invalid',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} is already a member of ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Continu\u00E2nd cu solicitarea de a activa portofelul dvs. Expensify, confirma\u021Bi c\u0103 a\u021Bi citit, \u00EEn\u021Beles \u0219i acceptat',
        facialScan: 'Politica Onfido privind scanarea facial\u0103 \u0219i eliberarea',
        tryAgain: '\u00CEncearc\u0103 din nou',
        verifyIdentity: 'Verifica\u021Bi identitatea',
        letsVerifyIdentity: 'Haide s\u0103-\u021Bi verific\u0103m identitatea',
        butFirst: `But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: 'A ap\u0103rut o eroare \u00EEn timpul proces\u0103rii acestui pas. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        cameraPermissionsNotGranted: 'Permite accesul la camer\u0103',
        cameraRequestMessage: 'Avem nevoie de acces la camera dvs. pentru a finaliza verificarea contului bancar. V\u0103 rug\u0103m s\u0103 activa\u021Bi prin Set\u0103ri > New Expensify.',
        microphonePermissionsNotGranted: 'Activeaz\u0103 accesul la microfon',
        microphoneRequestMessage:
            'Avem nevoie de acces la microfonul t\u0103u pentru a finaliza verificarea contului bancar. Te rug\u0103m s\u0103 activezi prin Set\u0103ri > New Expensify.',
        originalDocumentNeeded:
            'V\u0103 rug\u0103m s\u0103 \u00EEnc\u0103rca\u021Bi o imagine original\u0103 a c\u0103r\u021Bii dvs. de identitate, nu un screenshot sau o imagine scanat\u0103.',
        documentNeedsBetterQuality:
            'ID-ul dvs. pare a fi deteriorat sau are caracteristici de securitate lips\u0103. V\u0103 rug\u0103m s\u0103 \u00EEnc\u0103rca\u021Bi o imagine original\u0103 a unui ID nedeteriorat care este complet vizibil.',
        imageNeedsBetterQuality:
            'Exist\u0103 o problem\u0103 cu calitatea imaginii ID-ului t\u0103u. Te rug\u0103m s\u0103 \u00EEncarci o nou\u0103 imagine \u00EEn care \u00EEntregul t\u0103u ID poate fi v\u0103zut clar.',
        selfieIssue: 'Exist\u0103 o problem\u0103 cu selfie-ul/t\u0103u video. Te rog \u00EEncarc\u0103 un selfie/video live.',
        selfieNotMatching:
            'Selfie-ul/t\u0103u video nu se potrive\u0219te cu ID-ul t\u0103u. Te rog \u00EEncarc\u0103 un nou selfie/video \u00EEn care fa\u021Ba ta poate fi v\u0103zut\u0103 clar.',
        selfieNotLive: 'Selfie-ul/t\u0103u video nu pare s\u0103 fie o fotografie/un videoclip live. Te rog \u00EEncarc\u0103 un selfie/un videoclip live.',
    },
    additionalDetailsStep: {
        headerTitle: 'Detalii suplimentare',
        helpText: 'Trebuie s\u0103 confirm\u0103m urm\u0103toarele informa\u021Bii \u00EEnainte de a putea trimite \u0219i primi bani din portofelul t\u0103u.',
        helpTextIdologyQuestions: 'Trebuie s\u0103 v\u0103 mai punem doar c\u00E2teva \u00EEntreb\u0103ri pentru a finaliza validarea identit\u0103\u021Bii dumneavoastr\u0103.',
        helpLink: 'Afla\u021Bi mai multe despre motivul pentru care avem nevoie de acest lucru.',
        legalFirstNameLabel: 'Prenume legal',
        legalMiddleNameLabel: 'Numele de mijloc legal',
        legalLastNameLabel: 'Nume de familie legal',
        selectAnswer: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un r\u0103spuns pentru a continua.',
        ssnFull9Error: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un CNP valid de nou\u0103 cifre.',
        needSSNFull9: 'Avem probleme cu verificarea SSN-ului dvs. V\u0103 rug\u0103m s\u0103 introduce\u021Bi toate cele nou\u0103 cifre ale SSN-ului dvs.',
        weCouldNotVerify: 'Nu am putut verifica',
        pleaseFixIt: 'V\u0103 rug\u0103m s\u0103 corecta\u021Bi aceste informa\u021Bii \u00EEnainte de a continua',
        failedKYCTextBefore: 'Nu am reu\u0219it s\u0103 verific\u0103m identitatea ta. Te rug\u0103m s\u0103 \u00EEncerci din nou mai t\u00E2rziu sau s\u0103 ne contactezi.',
        failedKYCTextAfter: 'dac\u0103 ave\u021Bi \u00EEntreb\u0103ri.',
    },
    termsStep: {
        headerTitle: 'Termeni \u0219i taxe',
        headerTitleRefactor: 'Taxe \u0219i termeni',
        haveReadAndAgree: 'Am citit \u0219i sunt de acord s\u0103 primesc',
        electronicDisclosures: 'divulg\u0103ri electronice',
        agreeToThe: 'Sunt de acord cu',
        walletAgreement: 'Acordul portofelului',
        enablePayments: 'Activeaz\u0103 pl\u0103\u021Bile',
        monthlyFee: 'Tax\u0103 lunar\u0103',
        inactivity: 'Inactivitate',
        noOverdraftOrCredit: 'F\u0103r\u0103 func\u021Bie de descoperire de cont/credit.',
        electronicFundsWithdrawal: 'Retragere electronic\u0103 de fonduri',
        standard: 'Standard',
        reviewTheFees: 'V\u0103 rug\u0103m s\u0103 revizui\u021Bi taxele de mai jos.',
        checkTheBoxes: 'V\u0103 rug\u0103m s\u0103 bifa\u021Bi c\u0103su\u021Bele de mai jos.',
        agreeToTerms: 'Accept\u0103 termenii \u0219i vei fi gata de plecare!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Portofelul Expensify este emis de c\u0103tre ${walletProgram}.`,
            perPurchase: 'Pe cump\u0103r\u0103tur\u0103',
            atmWithdrawal: 'Retragere de la bancomat',
            cashReload: 'Re\u00EEnc\u0103rcare cash',
            inNetwork: '\u00EEn re\u021Bea',
            outOfNetwork: '\u00EEn afara re\u021Belei',
            atmBalanceInquiry: 'Interogare sold ATM',
            inOrOutOfNetwork: '(\u00EEn re\u021Bea sau \u00EEn afara re\u021Belei)',
            customerService: 'Serviciul clien\u021Bi',
            automatedOrLive: '(agent automatizat sau live)',
            afterTwelveMonths: '(dup\u0103 12 luni f\u0103r\u0103 tranzac\u021Bii)',
            weChargeOneFee: 'Percepem un tip de tax\u0103.',
            fdicInsurance: 'Fondurile dumneavoastr\u0103 sunt eligibile pentru asigurarea FDIC.',
            generalInfo: 'Pentru informa\u021Bii generale despre conturile prepl\u0103tite, vizita\u021Bi',
            conditionsDetails: 'Pentru detalii \u0219i condi\u021Bii pentru toate taxele \u0219i serviciile, vizita\u021Bi',
            conditionsPhone: 'sau apel\u00E2nd +1 833-400-0904.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'O list\u0103 cu toate taxele pentru Portofelul Expensify',
            typeOfFeeHeader: 'Tip de tax\u0103',
            feeAmountHeader: 'Suma taxei',
            moreDetailsHeader: "I'm sorry but you didn't provide any text to translate. Could you please provide the text you want to translate into Romanian?",
            openingAccountTitle: 'Deschiderea unui cont',
            openingAccountDetails: 'Nu exist\u0103 niciun cost pentru a deschide un cont.',
            monthlyFeeDetails: 'Nu exist\u0103 o tax\u0103 lunar\u0103.',
            customerServiceTitle: 'Serviciul clien\u021Bi',
            customerServiceDetails: 'Nu exist\u0103 taxe pentru serviciul clien\u021Bi.',
            inactivityDetails: 'Nu exist\u0103 tax\u0103 pentru inactivitate.',
            sendingFundsTitle: 'Trimiterea fondurilor c\u0103tre un alt de\u021Bin\u0103tor de cont',
            sendingFundsDetails: 'Nu exist\u0103 niciun comision pentru a trimite fonduri altui titular de cont folosind soldul t\u0103u, contul bancar sau cardul de debit.',
            electronicFundsStandardDetails:
                'Nu exist\u0103 niciun comision pentru a transfera fonduri din portofelul t\u0103u Expensify' +
                '\u00EEn contul t\u0103u bancar folosind op\u021Biunea standard. Aceast\u0103 transfer se finalizeaz\u0103 de obicei \u00EEn 1-3 zile lucr\u0103toare.' +
                'zile.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'Exist\u0103 un comision pentru transferul de fonduri din portofelul t\u0103u Expensify c\u0103tre' +
                'cardul t\u0103u de debit asociat folosind op\u021Biunea de transfer instant. Acest transfer se finalizeaz\u0103 de obicei \u00EEn' +
                `c\u00E2teva minute. Taxa este de ${percentage}% din suma transferat\u0103 (cu o tax\u0103 minim\u0103 de ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                'Fondurile dumneavoastr\u0103 sunt eligibile pentru asigurarea FDIC. Fondurile dumneavoastr\u0103 vor fi \u021Binute la sau' +
                `transferat c\u0103tre ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, o institu\u021Bie asigurat\u0103 de FDIC. Odat\u0103 ajunse acolo, fondurile tale sunt asigurate p\u00E2n\u0103 la` +
                `la ${amount} de FDIC \u00EEn cazul \u00EEn care ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} e\u0219ueaz\u0103. Vezi`,
            fdicInsuranceBancorp2: 'pentru detalii.',
            contactExpensifyPayments: `Contacta\u021Bi ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} apel\u00E2nd +1 833-400-0904, prin email la`,
            contactExpensifyPayments2: 'sau autentifica\u021Bi-v\u0103 la',
            generalInformation: 'Pentru informa\u021Bii generale despre conturile prepl\u0103tite, vizita\u021Bi',
            generalInformation2:
                'Dac\u0103 ave\u021Bi o pl\u00E2ngere despre un cont prepl\u0103tit, suna\u021Bi la Biroul de Protec\u021Bie Financiar\u0103 a Consumatorilor la num\u0103rul 1-855-411-2372 sau vizita\u021Bi',
            printerFriendlyView: 'Vizualiza\u021Bi versiunea pentru imprimant\u0103',
            automated: 'Automatizat',
            liveAgent: 'Agent live',
            instant: 'Instant',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Activeaz\u0103 pl\u0103\u021Bile',
        activatedTitle: 'Portofel activat!',
        activatedMessage: 'Felicit\u0103ri, portofelul t\u0103u este configurat \u0219i gata s\u0103 fac\u0103 pl\u0103\u021Bi.',
        checkBackLaterTitle: 'Doar un minut...',
        checkBackLaterMessage: '\u00CEnc\u0103 \u00EE\u021Bi revizuim informa\u021Biile. Te rug\u0103m s\u0103 revii mai t\u00E2rziu.',
        continueToPayment: 'Continua\u021Bi la plat\u0103',
        continueToTransfer: 'Continua\u021Bi transferul',
    },
    companyStep: {
        headerTitle: 'Informa\u021Bii despre companie',
        subtitle: 'Aproape gata! Din motive de securitate, trebuie s\u0103 confirm\u0103m unele informa\u021Bii:',
        legalBusinessName: 'Denumirea legal\u0103 a afacerii',
        companyWebsite: 'Website-ul companiei',
        taxIDNumber: 'Num\u0103r de identificare fiscal\u0103',
        taxIDNumberPlaceholder: '9 cifre',
        companyType: 'Tip de companie',
        incorporationDate: 'Data incorpor\u0103rii',
        incorporationState: 'Stat de incorporare',
        industryClassificationCode: 'Codul de clasificare a industriei',
        confirmCompanyIsNot: 'Confirm c\u0103 aceast\u0103 companie nu se afl\u0103 pe lista',
        listOfRestrictedBusinesses: 'lista de afaceri restric\u021Bionate',
        incorporationDatePlaceholder: 'Data de \u00EEncepere (aaaa-ll-zz)',
        incorporationTypes: {
            LLC: 'SRL',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Parteneriat',
            COOPERATIVE: 'Cooperativ\u0103',
            SOLE_PROPRIETORSHIP: '\u00CEntreprindere individual\u0103',
            OTHER: 'Alte',
        },
    },
    requestorStep: {
        headerTitle: 'Informa\u021Bii personale',
        learnMore: 'Afla\u021Bi mai multe',
        isMyDataSafe: 'Datele mele sunt \u00EEn siguran\u021B\u0103?',
    },
    personalInfoStep: {
        personalInfo: 'Informa\u021Bii personale',
        enterYourLegalFirstAndLast: 'Care este numele t\u0103u legal?',
        legalFirstName: 'Prenume legal',
        legalLastName: 'Nume de familie legal',
        legalName: 'Nume legal',
        enterYourDateOfBirth: 'Care este data ta de na\u0219tere?',
        enterTheLast4: 'Care sunt ultimele patru cifre ale Num\u0103rului t\u0103u de Securitate Social\u0103?',
        dontWorry: 'Nu v\u0103 face\u021Bi griji, nu efectu\u0103m niciun control al creditului personal!',
        last4SSN: 'Ultimele 4 cifre ale CNP',
        enterYourAddress: 'Care este adresa ta?',
        address: 'Adres\u0103',
        letsDoubleCheck: 'S\u0103 ne asigur\u0103m \u00EEnc\u0103 o dat\u0103 c\u0103 totul arat\u0103 corect.',
        byAddingThisBankAccount: 'Prin ad\u0103ugarea acestui cont bancar, confirma\u021Bi c\u0103 a\u021Bi citit, \u00EEn\u021Beles \u0219i acceptat',
        whatsYourLegalName: 'Care este numele t\u0103u legal?',
        whatsYourDOB: 'Care este data ta de na\u0219tere?',
        whatsYourAddress: 'Care este adresa ta?',
        whatsYourSSN: 'Care sunt ultimele patru cifre ale Num\u0103rului t\u0103u de Securitate Social\u0103?',
        noPersonalChecks: 'Nu v\u0103 face\u021Bi griji, aici nu se fac verific\u0103ri de credit personale!',
        whatsYourPhoneNumber: 'Care este num\u0103rul t\u0103u de telefon?',
        weNeedThisToVerify: 'Avem nevoie de acest lucru pentru a verifica portofelul t\u0103u.',
    },
    businessInfoStep: {
        businessInfo: 'Informa\u021Bii despre companie',
        enterTheNameOfYourBusiness: 'Care este numele companiei tale?',
        businessName: 'Denumirea legal\u0103 a companiei',
        enterYourCompanysTaxIdNumber: 'Care este num\u0103rul de identificare fiscal\u0103 al companiei tale?',
        taxIDNumber: 'Num\u0103r de identificare fiscal\u0103',
        taxIDNumberPlaceholder: '9 cifre',
        enterYourCompanysWebsite: 'Care este site-ul companiei tale?',
        companyWebsite: 'Website-ul companiei',
        enterYourCompanysPhoneNumber: 'Care este num\u0103rul de telefon al companiei tale?',
        enterYourCompanysAddress: 'Care este adresa companiei tale?',
        selectYourCompanysType: 'Ce tip de companie este?',
        companyType: 'Tip de companie',
        incorporationType: {
            LLC: 'SRL',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Parteneriat',
            COOPERATIVE: 'Cooperativ\u0103',
            SOLE_PROPRIETORSHIP: '\u00CEntreprindere individual\u0103',
            OTHER: 'Alte',
        },
        selectYourCompanysIncorporationDate: 'Care este data \u00EEnfiin\u021B\u0103rii companiei tale?',
        incorporationDate: 'Data incorpor\u0103rii',
        incorporationDatePlaceholder: 'Data de \u00EEncepere (aaaa-ll-zz)',
        incorporationState: 'Stat de incorporare',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '\u00CEn ce stat a fost \u00EEnfiin\u021Bat\u0103 compania dvs?',
        letsDoubleCheck: 'S\u0103 ne asigur\u0103m \u00EEnc\u0103 o dat\u0103 c\u0103 totul arat\u0103 corect.',
        companyAddress: 'Adresa companiei',
        listOfRestrictedBusinesses: 'lista de afaceri restric\u021Bionate',
        confirmCompanyIsNot: 'Confirm c\u0103 aceast\u0103 companie nu se afl\u0103 pe lista',
        businessInfoTitle: 'Informa\u021Bii despre afaceri',
        legalBusinessName: 'Denumirea legal\u0103 a afacerii',
        whatsTheBusinessName: 'Care este numele afacerii?',
        whatsTheBusinessAddress: 'Care este adresa afacerii?',
        whatsTheBusinessContactInformation: 'Care sunt informa\u021Biile de contact pentru afaceri?',
        whatsTheBusinessRegistrationNumber: 'Care este num\u0103rul de \u00EEnregistrare a afacerii?',
        whatsTheBusinessTaxIDEIN: 'Care este num\u0103rul de \u00EEnregistrare a taxei pe afaceri/ID-ul EIN/VAT/GST?',
        whatsThisNumber: 'Ce num\u0103r este acesta?',
        whereWasTheBusinessIncorporated: 'Unde a fost \u00EEnfiin\u021Bat\u0103 afacerea?',
        whatTypeOfBusinessIsIt: 'Ce tip de afacere este?',
        whatsTheBusinessAnnualPayment: 'Care este volumul anual de pl\u0103\u021Bi al afacerii?',
        whatsYourExpectedAverageReimbursements: 'Care este suma medie de rambursare pe care v\u0103 a\u0219tepta\u021Bi?',
        registrationNumber: 'Num\u0103r de \u00EEnregistrare',
        taxIDEIN: 'Cod fiscal/Num\u0103r EIN',
        businessAddress: 'Adresa de afaceri',
        businessType: 'Tip de afacere',
        incorporation: 'Incorporare',
        incorporationCountry: '\u021Aara de \u00EEnregistrare',
        incorporationTypeName: 'Tipul de incorporare',
        businessCategory: 'Categorie de afaceri',
        annualPaymentVolume: 'Volumul anual al pl\u0103\u021Bilor',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Volumul anual de pl\u0103\u021Bi \u00EEn ${currencyCode}`,
        averageReimbursementAmount: 'Suma medie de rambursare',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Suma medie de rambursare \u00EEn ${currencyCode}`,
        selectIncorporationType: 'Selecta\u021Bi tipul de incorporare',
        selectBusinessCategory: 'Selecteaz\u0103 categoria de afaceri',
        selectAnnualPaymentVolume: 'Selecteaz\u0103 volumul anual de plat\u0103',
        selectIncorporationCountry: 'Selecteaz\u0103 \u021Bara de \u00EEnfiin\u021Bare',
        selectIncorporationState: 'Selecta\u021Bi statul de \u00EEnfiin\u021Bare',
        selectAverageReimbursement: 'Selecteaz\u0103 suma medie de rambursare',
        findIncorporationType: 'G\u0103se\u0219te tipul de incorporare',
        findBusinessCategory: 'G\u0103se\u0219te categoria de afaceri',
        findAnnualPaymentVolume: 'G\u0103se\u0219te volumul anual al pl\u0103\u021Bilor',
        findIncorporationState: 'G\u0103se\u0219te statul de \u00EEnfiin\u021Bare',
        findAverageReimbursement: 'G\u0103si\u021Bi suma medie de rambursare',
        error: {
            registrationNumber: 'V\u0103 rug\u0103m s\u0103 furniza\u021Bi un num\u0103r de \u00EEnregistrare valid.',
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'De\u021Bii 25% sau mai mult din',
        doAnyIndividualOwn25percent: 'Exist\u0103 persoane care de\u021Bin 25% sau mai mult din',
        areThereMoreIndividualsWhoOwn25percent: 'Exist\u0103 mai multe persoane care de\u021Bin 25% sau mai mult din',
        regulationRequiresUsToVerifyTheIdentity: 'Regulamentul ne oblig\u0103 s\u0103 verific\u0103m identitatea oric\u0103rei persoane care de\u021Bine mai mult de 25% din afacere.',
        companyOwner: 'Proprietar de afaceri',
        enterLegalFirstAndLastName: 'Care este numele legal al proprietarului?',
        legalFirstName: 'Prenume legal',
        legalLastName: 'Nume de familie legal',
        enterTheDateOfBirthOfTheOwner: 'Care este data de na\u0219tere a proprietarului?',
        enterTheLast4: 'Care sunt ultimele 4 cifre ale Num\u0103rului de Securitate Social\u0103 al proprietarului?',
        last4SSN: 'Ultimele 4 cifre ale CNP',
        dontWorry: 'Nu v\u0103 face\u021Bi griji, nu efectu\u0103m niciun control al creditului personal!',
        enterTheOwnersAddress: 'Care este adresa proprietarului?',
        letsDoubleCheck: 'S\u0103 ne asigur\u0103m \u00EEnc\u0103 o dat\u0103 c\u0103 totul arat\u0103 corect.',
        legalName: 'Nume legal',
        address: 'Adres\u0103',
        byAddingThisBankAccount: 'Prin ad\u0103ugarea acestui cont bancar, confirma\u021Bi c\u0103 a\u021Bi citit, \u00EEn\u021Beles \u0219i acceptat',
        owners: 'Proprietari',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informa\u021Bii despre proprietar',
        businessOwner: 'Proprietar de afaceri',
        signerInfo: 'Informa\u021Bii despre semnatar',
        doYouOwn: ({companyName}: CompanyNameParams) => `De\u021Bii 25% sau mai mult din ${companyName}`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Exist\u0103 vreun individ care de\u021Bine 25% sau mai mult din ${companyName}`,
        regulationsRequire: 'Regulamentele ne oblig\u0103 s\u0103 verific\u0103m identitatea oric\u0103rei persoane care de\u021Bine mai mult de 25% din afacere.',
        legalFirstName: 'Prenume legal',
        legalLastName: 'Nume de familie legal',
        whatsTheOwnersName: 'Care este numele legal al proprietarului?',
        whatsYourName: 'Care este numele t\u0103u legal?',
        whatPercentage: 'Ce procent din afacere apar\u021Bine proprietarului?',
        whatsYoursPercentage: 'Ce procent din afacere de\u021Bii?',
        ownership: 'Proprietate',
        whatsTheOwnersDOB: 'Care este data de na\u0219tere a proprietarului?',
        whatsYourDOB: 'Care este data ta de na\u0219tere?',
        whatsTheOwnersAddress: 'Care este adresa proprietarului?',
        whatsYourAddress: 'Care este adresa ta?',
        whatAreTheLast: 'Care sunt ultimele 4 cifre ale Num\u0103rului de Securitate Social\u0103 al proprietarului?',
        whatsYourLast: 'Care sunt ultimele 4 cifre ale Num\u0103rului t\u0103u de Securitate Social\u0103?',
        dontWorry: 'Nu v\u0103 face\u021Bi griji, nu efectu\u0103m niciun control al creditului personal!',
        last4: 'Ultimele 4 cifre ale CNP',
        whyDoWeAsk: 'De ce solicit\u0103m acest lucru?',
        letsDoubleCheck: 'S\u0103 ne asigur\u0103m \u00EEnc\u0103 o dat\u0103 c\u0103 totul arat\u0103 corect.',
        legalName: 'Nume legal',
        ownershipPercentage: 'Procent de proprietate',
        areThereOther: ({companyName}: CompanyNameParams) => `Exist\u0103 alte persoane care de\u021Bin 25% sau mai mult din ${companyName}`,
        owners: 'Proprietari',
        addCertified: 'Ad\u0103uga\u021Bi un organigram\u0103 certificat\u0103 care arat\u0103 proprietarii beneficiari',
        regulationRequiresChart:
            'Regulamentul ne oblig\u0103 s\u0103 colect\u0103m o copie certificat\u0103 a diagram\u0103 de proprietate care arat\u0103 fiecare individ sau entitate care de\u021Bine 25% sau mai mult din afacere.',
        uploadEntity: '\u00CEncarc\u0103 graficul de proprietate a entit\u0103\u021Bii',
        noteEntity: 'Not\u0103: Graficul de proprietate al entit\u0103\u021Bii trebuie semnat de contabilul dvs., consilierul juridic sau autentificat.',
        certified: 'Diagram\u0103 certificat\u0103 a propriet\u0103\u021Bii entit\u0103\u021Bii',
        selectCountry: 'Selecteaz\u0103 \u021Bara',
        findCountry: 'G\u0103se\u0219te \u021Bara',
        address: 'Adres\u0103',
    },
    validationStep: {
        headerTitle: 'Valida\u021Bi contul bancar',
        buttonText: 'Finalizeaz\u0103 configurarea',
        maxAttemptsReached: 'Validarea pentru acest cont bancar a fost dezactivat\u0103 din cauza prea multor \u00EEncerc\u0103ri incorecte.',
        description: `Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi suma fiec\u0103rei tranzac\u021Bii \u00EEn c\u00E2mpurile de mai jos. Exemplu: 1.51.',
        reviewingInfo: 'Mul\u021Bumim! \u00CE\u021Bi verific\u0103m informa\u021Biile \u0219i vom lua leg\u0103tura \u00EEn cur\u00E2nd. Te rug\u0103m s\u0103 verifici chatul cu Concierge.',
        forNextStep: 'pentru urm\u0103torii pa\u0219i pentru a finaliza configurarea contului t\u0103u bancar.',
        letsChatCTA: 'Da, hai s\u0103 discut\u0103m',
        letsChatText: 'Aproape am terminat! Avem nevoie de ajutorul t\u0103u pentru a verifica ultimele detalii prin chat. E\u0219ti preg\u0103tit?',
        letsChatTitle: 'Hai s\u0103 discut\u0103m!',
        enable2FATitle: 'Preveni\u021Bi frauda, activa\u021Bi autentificarea \u00EEn doi pa\u0219i (2FA)',
        enable2FAText:
            'Ne lu\u0103m \u00EEn serios securitatea dumneavoastr\u0103. V\u0103 rug\u0103m s\u0103 configura\u021Bi acum 2FA pentru a ad\u0103uga un strat suplimentar de protec\u021Bie contului dumneavoastr\u0103.',
        secureYourAccount: 'Securizeaz\u0103-\u021Bi contul',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Informa\u021Bii suplimentare',
        checkAllThatApply: 'Bifa\u021Bi tot ce se aplic\u0103, altfel l\u0103sa\u021Bi necompletat.',
        iOwnMoreThan25Percent: 'De\u021Bin mai mult de 25% din',
        someoneOwnsMoreThan25Percent: 'Cineva altcineva de\u021Bine mai mult de 25% din',
        additionalOwner: 'Proprietar beneficiar suplimentar',
        removeOwner: 'Elimina\u021Bi acest beneficiar real',
        addAnotherIndividual: 'Ad\u0103uga\u021Bi o alt\u0103 persoan\u0103 care de\u021Bine mai mult de 25%',
        agreement: 'Acord:',
        termsAndConditions: 'termeni \u0219i condi\u021Bii',
        certifyTrueAndAccurate: 'Certific c\u0103 informa\u021Biile furnizate sunt adev\u0103rate \u0219i exacte',
        error: {
            certify: 'Trebuie s\u0103 certifica\u021Bi c\u0103 informa\u021Biile sunt adev\u0103rate \u0219i exacte.',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Verificare complet\u0103',
        confirmAgreements: 'V\u0103 rug\u0103m s\u0103 confirma\u021Bi acordurile de mai jos.',
        certifyTrueAndAccurate: 'Certific c\u0103 informa\u021Biile furnizate sunt adev\u0103rate \u0219i exacte',
        certifyTrueAndAccurateError: 'V\u0103 rug\u0103m s\u0103 certifica\u021Bi c\u0103 informa\u021Biile sunt adev\u0103rate \u0219i exacte',
        isAuthorizedToUseBankAccount: 'Sunt autorizat s\u0103 folosesc acest cont bancar de afaceri pentru cheltuieli de afaceri',
        isAuthorizedToUseBankAccountError: 'Trebuie s\u0103 fii un ofi\u021Ber de control cu autoriza\u021Bie pentru a opera contul bancar al afacerii.',
        termsAndConditions: 'termeni \u0219i condi\u021Bii',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Conecteaz\u0103 contul bancar',
        finishButtonText: 'Finalizeaz\u0103 configurarea',
        validateYourBankAccount: 'Valida\u021Bi-v\u0103 contul bancar',
        validateButtonText: 'Valida\u021Bi',
        validationInputLabel: 'Tranzac\u021Bie',
        maxAttemptsReached: 'Validarea pentru acest cont bancar a fost dezactivat\u0103 din cauza prea multor \u00EEncerc\u0103ri incorecte.',
        description: `Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi suma fiec\u0103rei tranzac\u021Bii \u00EEn c\u00E2mpurile de mai jos. Exemplu: 1.51.',
        reviewingInfo: 'Mul\u021Bumim! Revizuim informa\u021Biile dvs. \u0219i vom lua leg\u0103tura \u00EEn cur\u00E2nd. V\u0103 rug\u0103m s\u0103 verifica\u021Bi chatul cu Concierge.',
        forNextSteps: 'pentru urm\u0103torii pa\u0219i pentru a finaliza configurarea contului t\u0103u bancar.',
        letsChatCTA: 'Da, hai s\u0103 discut\u0103m',
        letsChatText: 'Aproape am terminat! Avem nevoie de ajutorul t\u0103u pentru a verifica ultimele detalii prin chat. E\u0219ti preg\u0103tit?',
        letsChatTitle: 'Hai s\u0103 discut\u0103m!',
        enable2FATitle: 'Preveni\u021Bi frauda, activa\u021Bi autentificarea \u00EEn doi pa\u0219i (2FA)',
        enable2FAText:
            'Ne lu\u0103m \u00EEn serios securitatea dumneavoastr\u0103. V\u0103 rug\u0103m s\u0103 configura\u021Bi acum 2FA pentru a ad\u0103uga un strat suplimentar de protec\u021Bie contului dumneavoastr\u0103.',
        secureYourAccount: 'Securizeaz\u0103-\u021Bi contul',
    },
    countryStep: {
        confirmBusinessBank: 'Confirma\u021Bi moneda \u0219i \u021Bara contului bancar al afacerii',
        confirmCurrency: 'Confirma\u021Bi moneda \u0219i \u021Bara',
        yourBusiness: 'Moneda contului t\u0103u bancar de afaceri trebuie s\u0103 se potriveasc\u0103 cu moneda spa\u021Biului t\u0103u de lucru.',
        youCanChange: 'Pute\u021Bi schimba moneda spa\u021Biului de lucru \u00EEn',
        findCountry: 'G\u0103se\u0219te \u021Bara',
        selectCountry: 'Selecteaz\u0103 \u021Bara',
    },
    bankInfoStep: {
        whatAreYour: 'Care sunt detaliile contului t\u0103u bancar de afaceri?',
        letsDoubleCheck: 'S\u0103 ne asigur\u0103m \u00EEnc\u0103 o dat\u0103 c\u0103 totul arat\u0103 bine.',
        thisBankAccount: 'Acest cont bancar va fi folosit pentru pl\u0103\u021Bi de afaceri pe spa\u021Biul t\u0103u de lucru',
        accountNumber: 'Num\u0103r de cont',
        bankStatement: 'Extras de cont',
        chooseFile: 'Alege\u021Bi fi\u0219ierul',
        uploadYourLatest: '\u00CEncarc\u0103 ultima ta declara\u021Bie',
        pleaseUpload: ({lastFourDigits}: LastFourDigitsParams) =>
            `V\u0103 rug\u0103m s\u0103 \u00EEnc\u0103rca\u021Bi cel mai recent extras de cont lunar pentru contul dvs. bancar de afaceri care se termin\u0103 \u00EEn ${lastFourDigits}.`,
    },
    signerInfoStep: {
        signerInfo: 'Informa\u021Bii despre semnatar',
        areYouDirector: ({companyName}: CompanyNameParams) => `E\u0219ti director sau ofi\u021Ber superior la ${companyName}?`,
        regulationRequiresUs: 'Regulamentul ne oblig\u0103 s\u0103 verific\u0103m dac\u0103 semnatarul are autoritatea de a lua aceast\u0103 ac\u021Biune \u00EEn numele afacerii.',
        whatsYourName: 'Care este numele t\u0103u legal?',
        fullName: 'Numele complet legal',
        whatsYourJobTitle: 'Care este titlul t\u0103u profesional?',
        jobTitle: 'Titlu de job',
        whatsYourDOB: 'Care este data ta de na\u0219tere?',
        uploadID: '\u00CEnc\u0103rca\u021Bi ID-ul \u0219i dovada adresei',
        id: 'ID (permis de conducere sau pa\u0219aport)',
        personalAddress: 'Dovad\u0103 a adresei personale (de exemplu, factura de utilit\u0103\u021Bi)',
        letsDoubleCheck: 'S\u0103 ne asigur\u0103m \u00EEnc\u0103 o dat\u0103 c\u0103 totul arat\u0103 corect.',
        legalName: 'Nume legal',
        proofOf: 'Dovad\u0103 de domiciliu personal',
        enterOneEmail: 'Introduce\u021Bi e-mailul directorului sau al unui ofi\u021Ber superior la',
        regulationRequiresOneMoreDirector: 'Regulamentul cere \u00EEnc\u0103 un director sau ofi\u021Ber superior ca semnatar.',
        hangTight: 'Stai lini\u0219tit...',
        enterTwoEmails: 'Introduce\u021Bi e-mailurile a doi directori sau ofi\u021Beri superiori la',
        sendReminder: 'Trimite un memento',
        chooseFile: 'Alege\u021Bi fi\u0219ierul',
        weAreWaiting: 'A\u0219tept\u0103m ca ceilal\u021Bi s\u0103-\u0219i verifice identit\u0103\u021Bile ca directori sau ofi\u021Beri superiori ai afacerii.',
    },
    agreementsStep: {
        agreements: 'Acorduri',
        pleaseConfirm: 'V\u0103 rug\u0103m s\u0103 confirma\u021Bi acordurile de mai jos',
        regulationRequiresUs: 'Regulamentul ne oblig\u0103 s\u0103 verific\u0103m identitatea oric\u0103rei persoane care de\u021Bine mai mult de 25% din afacere.',
        iAmAuthorized: 'Sunt autorizat s\u0103 folosesc contul bancar de afaceri pentru cheltuielile de afaceri.',
        iCertify: 'Certific c\u0103 informa\u021Biile furnizate sunt adev\u0103rate \u0219i exacte.',
        termsAndConditions: 'termeni \u0219i condi\u021Bii.',
        accept: 'Accept\u0103 \u0219i adaug\u0103 cont bancar',
        error: {
            authorized: 'Trebuie s\u0103 fii un ofi\u021Ber de control cu autoriza\u021Bie pentru a opera contul bancar al afacerii',
            certify: 'V\u0103 rug\u0103m s\u0103 certifica\u021Bi c\u0103 informa\u021Biile sunt adev\u0103rate \u0219i exacte',
        },
    },
    finishStep: {
        connect: 'Conecteaz\u0103 contul bancar',
        letsFinish: 'S\u0103 termin\u0103m \u00EEn chat!',
        thanksFor:
            'Mul\u021Bumim pentru aceste detalii. Un agent de suport dedicat va revizui acum informa\u021Biile dvs. Ne vom \u00EEntoarce dac\u0103 avem nevoie de altceva de la dvs., dar \u00EEntre timp, nu ezita\u021Bi s\u0103 ne contacta\u021Bi cu orice \u00EEntreb\u0103ri.',
        iHaveA: 'Am o \u00EEntrebare',
        enable2FA: 'Activa\u021Bi autentificarea \u00EEn doi pa\u0219i (2FA) pentru a preveni frauda',
        weTake: 'Ne lu\u0103m \u00EEn serios securitatea dumneavoastr\u0103. V\u0103 rug\u0103m s\u0103 configura\u021Bi acum 2FA pentru a ad\u0103uga un strat suplimentar de protec\u021Bie contului dumneavoastr\u0103.',
        secure: 'Securizeaz\u0103-\u021Bi contul',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Un moment',
        explanationLine: 'Ne uit\u0103m la informa\u021Biile tale. Vei putea continua cu urm\u0103torii pa\u0219i \u00EEn cur\u00E2nd.',
    },
    session: {
        offlineMessageRetry: 'Se pare c\u0103 e\u0219ti deconectat. Te rog verific\u0103-\u021Bi conexiunea \u0219i \u00EEncearc\u0103 din nou.',
    },
    travel: {
        header: 'Rezerva\u021Bi c\u0103l\u0103torie',
        title: 'C\u0103l\u0103tore\u0219te inteligent',
        subtitle:
            'Utiliza\u021Bi Expensify Travel pentru a ob\u021Bine cele mai bune oferte de c\u0103l\u0103torie \u0219i pentru a gestiona toate cheltuielile de afaceri \u00EEntr-un singur loc.',
        features: {
            saveMoney: 'Economisi\u021Bi bani la rezerv\u0103rile dvs.',
            alerts: 'Ob\u021Bine\u021Bi actualiz\u0103ri \u0219i alerte \u00EEn timp real',
        },
        bookTravel: 'Rezerva\u021Bi c\u0103l\u0103torie',
        bookDemo: 'Rezerva\u021Bi o demonstra\u021Bie',
        bookADemo: 'Rezerva\u021Bi o demonstra\u021Bie',
        toLearnMore: 'pentru a afla mai multe.',
        termsAndConditions: {
            header: '\u00CEnainte de a continua...',
            title: 'V\u0103 rug\u0103m s\u0103 citi\u021Bi Termenii \u0219i Condi\u021Biile pentru c\u0103l\u0103torie',
            subtitle: 'Pentru a activa c\u0103l\u0103toriile \u00EEn spa\u021Biul t\u0103u de lucru, trebuie s\u0103 fii de acord cu',
            termsconditions: 'termeni & condi\u021Bii',
            travelTermsAndConditions: 'termeni & condi\u021Bii',
            helpDocIntro: 'Verifica\u021Bi acest',
            helpDocOutro: 'pentru mai multe informa\u021Bii sau contacta\u021Bi Concierge sau Managerul dvs. de Cont.',
            helpDoc: 'Document de ajutor',
            agree: 'Sunt de acord cu c\u0103l\u0103toria',
            error: 'Trebuie s\u0103 accep\u021Bi Termenii \u0219i Condi\u021Biile pentru c\u0103l\u0103torie pentru a continua',
        },
        flight: 'Zbor',
        flightDetails: {
            passenger: 'Pasager',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Ai o <strong>escal\u0103 de ${layover}</strong> \u00EEnainte de acest zbor</muted-text-label>`,
            takeOff: 'Decolare',
            landing: 'Aterizare',
            seat: 'Scaun',
            class: 'Clasa Cabinei',
            recordLocator: 'Localizator de \u00EEnregistr\u0103ri',
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Oaspete',
            checkIn: '\u00CEnregistrare',
            checkOut: 'Verificare',
            roomType: 'Tip de camer\u0103',
            cancellation: 'Politica de anulare',
            cancellationUntil: 'Anulare gratuit\u0103 p\u00E2n\u0103 la',
            confirmation: 'Num\u0103r de confirmare',
            cancellationPolicies: {
                unknown: "Without a specific text provided, I'm unable to provide a translation. Please provide the text or TypeScript function you want translated.",
                nonRefundable: 'Nerambursabil',
                freeCancellationUntil: 'Anulare gratuit\u0103 p\u00E2n\u0103 la',
                partiallyRefundable: 'Par\u021Bial rambursabil',
            },
        },
        car: 'Ma\u0219in\u0103',
        carDetails: {
            rentalCar: '\u00CEnchiriere auto',
            pickUp: 'Ridicare',
            dropOff: 'Depunere',
            driver: '\u0218ofer',
            carType: 'Tip de ma\u0219in\u0103',
            cancellation: 'Politica de anulare',
            cancellationUntil: 'Anulare gratuit\u0103 p\u00E2n\u0103 la',
            freeCancellation: 'Anulare gratuit\u0103',
            confirmation: 'Num\u0103r de confirmare',
        },
        train: 'Cale ferat\u0103',
        trainDetails: {
            passenger: 'Pasager',
            departs: 'Plec\u0103ri',
            arrives: 'Sosesc',
            coachNumber: 'Num\u0103rul antrenorului',
            seat: 'Scaun',
            fareDetails: 'Detalii despre tarif',
            confirmation: 'Num\u0103r de confirmare',
        },
        viewTrip: 'Vizualizeaz\u0103 c\u0103l\u0103toria',
        modifyTrip: 'Modifica\u021Bi c\u0103l\u0103toria',
        tripSupport: 'Suport pentru c\u0103l\u0103torie',
        tripDetails: 'Detalii c\u0103l\u0103torie',
        viewTripDetails: 'Vezi detalii c\u0103l\u0103torie',
        trip: 'C\u0103l\u0103torie',
        trips: 'C\u0103l\u0103torii',
        tripSummary: 'Rezumatul c\u0103l\u0103toriei',
        departs: 'Plec\u0103ri',
        errorMessage: 'Ceva nu a mers bine. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
        phoneError: 'Pentru a rezerva o c\u0103l\u0103torie, metoda ta de contact implicit\u0103 trebuie s\u0103 fie un email valid',
        domainSelector: {
            title: 'Domeniu',
            subtitle: 'Alege\u021Bi un domeniu pentru configurarea Expensify Travel.',
            recommended: 'Recomandat',
        },
        domainPermissionInfo: {
            title: 'Domeniu',
            restrictionPrefix: `You don't have permission to enable Expensify Travel for the domain`,
            restrictionSuffix: `You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitationPrefix: `If you're an accountant, consider joining the`,
            accountantInvitationLink: `ExpensifyApproved! accountants program`,
            accountantInvitationSuffix: `to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '\u00CEncepe\u021Bi cu Expensify Travel',
            message: `You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
    },
    workspace: {
        common: {
            card: 'C\u0103r\u021Bi',
            expensifyCard: 'Cardul Expensify',
            companyCards: 'Carduri de companie',
            workflows: 'Fluxuri de lucru',
            workspace: 'Spa\u021Biu de lucru',
            edit: 'Edita\u021Bi spa\u021Biul de lucru',
            enabled: 'Activat',
            disabled: 'Dezactivat',
            everyone: 'Toat\u0103 lumea',
            delete: '\u0218terge spa\u021Biul de lucru',
            settings: 'Set\u0103ri',
            reimburse: 'Ramburs\u0103ri',
            categories: 'Categorii',
            tags: 'Etichete',
            reportFields: 'C\u00E2mpuri de raportare',
            reportField: 'C\u00E2mp de raport',
            taxes: 'Impozite',
            bills: 'Facturi',
            invoices: 'Facturi',
            travel: 'C\u0103l\u0103torie',
            members: 'Membri',
            accounting: 'Contabilitate',
            rules: 'Reguli',
            displayedAs: 'Afi\u0219at ca',
            plan: 'Plan',
            profile: 'Prezentare general\u0103',
            bankAccount: 'Cont bancar',
            connectBankAccount: 'Conecteaz\u0103 contul bancar',
            testTransactions: 'Tranzac\u021Bii de test',
            issueAndManageCards: 'Emitere \u0219i gestionare carduri',
            reconcileCards: 'Reconcilia\u021Bi cardurile',
            selected: () => ({
                one: '1 selectat',
                other: (count: number) => `${count} selected`,
            }),
            settlementFrequency: 'Frecven\u021Ba de reglementare',
            setAsDefault: 'Seteaz\u0103 ca spa\u021Biu de lucru implicit',
            defaultNote: `Chitan\u021Bele trimise la ${CONST.EMAIL.RECEIPTS} vor ap\u0103rea \u00EEn acest spa\u021Biu de lucru.`,
            deleteConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi acest spa\u021Biu de lucru?',
            deleteWithCardsConfirmation:
                'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi acest spa\u021Biu de lucru? Acest lucru va elimina toate fluxurile de carduri \u0219i cardurile atribuite.',
            unavailable: 'Spa\u021Biu de lucru indisponibil',
            memberNotFound:
                'Membru nu a fost g\u0103sit. Pentru a invita un nou membru la spa\u021Biul de lucru, v\u0103 rug\u0103m s\u0103 utiliza\u021Bi butonul de invita\u021Bie de mai sus.',
            notAuthorized: `Nu ave\u021Bi acces la aceast\u0103 pagin\u0103. Dac\u0103 \u00EEncerca\u021Bi s\u0103 v\u0103 al\u0103tura\u021Bi acestui spa\u021Biu de lucru, pur \u0219i simplu cere\u021Bi proprietarului spa\u021Biului de lucru s\u0103 v\u0103 adauge ca membru. Alte \u00EEntreb\u0103ri? Contacta\u021Bi ${CONST.EMAIL.CONCIERGE}.`,
            goToRoom: ({roomName}: GoToRoomParams) => `Mergi la camera ${roomName}`,
            goToWorkspace: 'Mergi la spa\u021Biul de lucru',
            goToWorkspaces: 'Mergi la spa\u021Bii de lucru',
            clearFilter: '\u0218terge filtrul',
            workspaceName: 'Numele spa\u021Biului de lucru',
            workspaceOwner: 'Proprietar',
            workspaceType: 'Tip de spa\u021Biu de lucru',
            workspaceAvatar: 'Avatarul spa\u021Biului de lucru',
            mustBeOnlineToViewMembers: 'Trebuie s\u0103 fii online pentru a vedea membrii acestui spa\u021Biu de lucru.',
            moreFeatures: 'Mai multe caracteristici',
            requested: 'Solicitat',
            distanceRates: 'Tarife de distan\u021B\u0103',
            defaultDescription: 'Un loc pentru toate chitan\u021Bele \u0219i cheltuielile tale.',
            welcomeNote: 'V\u0103 rug\u0103m s\u0103 folosi\u021Bi Expensify pentru a trimite chitan\u021Bele pentru rambursare, mul\u021Bumesc!',
            subscription: 'Abonament',
            markAsExported: 'Marcheaz\u0103 ca introdus manual',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Export\u0103 la ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'S\u0103 ne asigur\u0103m \u00EEnc\u0103 o dat\u0103 c\u0103 totul arat\u0103 corect.',
            lineItemLevel: 'La nivel de element de linie',
            reportLevel: 'Nivelul raportului',
            topLevel: 'Nivel superior',
            appliedOnExport: 'Nu a fost importat \u00EEn Expensify, aplicat la export',
            shareNote: {
                header: '\u00CEmp\u0103rt\u0103\u0219e\u0219te-\u021Bi spa\u021Biul de lucru cu al\u021Bi membri',
                content: {
                    firstPart:
                        "Distribui\u021Bi acest cod QR sau copia\u021Bi linkul de mai jos pentru a facilita membrilor solicitarea de acces la spa\u021Biul dumneavoastr\u0103 de lucru. Toate cererile de a se al\u0103tura spa\u021Biului de lucru vor ap\u0103rea \u00EEn ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc.",
                    secondPart: 'camera pentru recenzia ta.',
                },
            },
            createNewConnection: 'Creeaz\u0103 o nou\u0103 conexiune',
            reuseExistingConnection: 'Refolose\u0219te conexiunea existent\u0103',
            existingConnections: 'Conexiuni existente',
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Last synced ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Nu se poate conecta la ${connectionName} din cauza unei erori de autentificare.`,
            learnMore: 'Afla\u021Bi mai multe.',
            memberAlternateText: 'Membrii pot trimite \u0219i aproba rapoarte.',
            adminAlternateText: 'Administratorii au acces complet de editare la toate rapoartele \u0219i set\u0103rile spa\u021Biului de lucru.',
            auditorAlternateText: 'Auditorii pot vizualiza \u0219i comenta rapoartele.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return 'Membru';
                    default:
                        return 'Membru';
                }
            },
            planType: 'Tip de plan',
            submitExpense: 'Trimite\u021Bi cheltuielile dvs. mai jos:',
            defaultCategory: 'Categorie implicit\u0103',
            viewTransactions: 'Vizualizeaz\u0103 tranzac\u021Biile',
        },
        perDiem: {
            subtitle: 'Seteaz\u0103 tarifele per diem pentru a controla cheltuielile zilnice ale angaja\u021Bilor.',
            amount: 'Cantitate',
            deleteRates: () => ({
                one: 'Rat\u0103 de \u0219tergere',
                other: '\u0218terge ratele',
            }),
            deletePerDiemRate: '\u0218terge rata per diem',
            areYouSureDelete: () => ({
                one: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 rat\u0103?',
                other: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceste rate?',
            }),
            emptyList: {
                title: 'Pe zi',
                subtitle: 'Seta\u021Bi tarifele per diem pentru a controla cheltuielile zilnice ale angaja\u021Bilor. Importa\u021Bi tarifele dintr-un spreadsheet pentru a \u00EEncepe.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Un tarif cu valoarea ${rate} exist\u0103 deja.`,
            },
            importPerDiemRates: 'Importa tarifele per diem',
            editPerDiemRate: 'Editeaz\u0103 rata per diem',
            editPerDiemRates: 'Editeaz\u0103 ratele per diem',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `Actualizarea acestei destina\u021Bii o va schimba pentru toate subratele diurne ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Actualizarea acestei monede o va schimba pentru toate subratele diurne ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Seteaz\u0103 cum se export\u0103 cheltuielile personale \u00EEn QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToogle: 'Marcheaz\u0103 verific\u0103rile ca "de tip\u0103rit mai t\u00E2rziu"',
            exportDescription: 'Configura\u021Bi modul \u00EEn care datele Expensify sunt exportate c\u0103tre QuickBooks Desktop.',
            date: 'Exporta\u021Bi data',
            exportInvoices: 'Export\u0103 facturile c\u0103tre',
            exportExpensifyCard: 'Export\u0103 tranzac\u021Biile cu cardul Expensify ca',
            account: 'Cont',
            accountDescription: 'Alege unde s\u0103 postezi intr\u0103rile \u00EEn jurnal.',
            accountsPayable: 'Conturi de pl\u0103tit',
            accountsPayableDescription: 'Alege\u021Bi unde s\u0103 crea\u021Bi facturile furnizorului.',
            bankAccount: 'Cont bancar',
            notConfigured: 'Neconfigurat',
            bankAccountDescription: 'Alege\u021Bi de unde s\u0103 trimite\u021Bi cecurile.',
            creditCardAccount: 'Cont de card de credit',
            exportDate: {
                label: 'Exporta\u021Bi data',
                description: 'Utiliza\u021Bi aceast\u0103 dat\u0103 c\u00E2nd exporta\u021Bi rapoarte \u00EEn QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ultimei cheltuieli',
                        description: 'Data celei mai recente cheltuieli din raport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exporta\u021Bi data',
                        description: 'Data la care raportul a fost exportat \u00EEn QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data trimiterii',
                        description: 'Data la care raportul a fost trimis pentru aprobare.',
                    },
                },
            },
            exportCheckDescription: 'Vom crea un cec detaliat pentru fiecare raport Expensify \u0219i \u00EEl vom trimite din contul bancar de mai jos.',
            exportJournalEntryDescription: 'Vom crea o \u00EEnregistrare de jurnal detaliat\u0103 pentru fiecare raport Expensify \u0219i \u00EEl vom posta \u00EEn contul de mai jos.',
            exportVendorBillDescription:
                'Vom crea o factur\u0103 detaliat\u0103 pentru fiecare raport Expensify \u0219i o vom ad\u0103uga la contul de mai jos. Dac\u0103 aceast\u0103 perioad\u0103 este \u00EEnchis\u0103, vom posta pe data de 1 a urm\u0103toarei perioade deschise.',
            deepDiveExpensifyCard: 'Tranzac\u021Biile cu cardul Expensify vor fi exportate automat \u00EEntr-un "Cont de r\u0103spundere pentru cardul Expensify" creat cu',
            deepDiveExpensifyCardIntegration: 'integrarea noastr\u0103.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop nu suport\u0103 taxele la exporturile de intr\u0103ri \u00EEn jurnal. Deoarece ave\u021Bi taxele activate \u00EEn spa\u021Biul dvs. de lucru, aceast\u0103 op\u021Biune de export nu este disponibil\u0103.',
            outOfPocketTaxEnabledError:
                'Intr\u0103rile \u00EEn jurnal nu sunt disponibile c\u00E2nd taxele sunt activate. V\u0103 rug\u0103m s\u0103 alege\u021Bi o alt\u0103 op\u021Biune de export.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Card de credit',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Factura furnizor',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Intrare \u00EEn jurnal',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Verific\u0103',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Vom crea un cec detaliat pentru fiecare raport Expensify \u0219i \u00EEl vom trimite din contul bancar de mai jos.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Vom potrivi automat numele comerciantului de pe tranzac\u021Bia cu cardul de credit cu orice furnizori coresponden\u021Bi din QuickBooks. Dac\u0103 nu exist\u0103 furnizori, vom crea un furnizor 'Credit Card Misc.' pentru asociere.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Vom crea o factur\u0103 detaliat\u0103 de la furnizor pentru fiecare raport Expensify cu data ultimei cheltuieli \u0219i o vom ad\u0103uga la contul de mai jos. Dac\u0103 aceast\u0103 perioad\u0103 este \u00EEnchis\u0103, vom posta pe data de 1 a urm\u0103toarei perioade deschise.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    'Alege\u021Bi unde s\u0103 exporta\u021Bi tranzac\u021Biile cu cardul de credit.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Alege\u021Bi un furnizor pentru a se aplica la toate tranzac\u021Biile cu cardul de credit.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Alege\u021Bi de unde s\u0103 trimite\u021Bi cecurile.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Facturile furnizorilor nu sunt disponibile atunci c\u00E2nd loca\u021Biile sunt activate. V\u0103 rug\u0103m s\u0103 alege\u021Bi o alt\u0103 op\u021Biune de export.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Verific\u0103rile nu sunt disponibile c\u00E2nd loca\u021Biile sunt activate. V\u0103 rug\u0103m s\u0103 alege\u021Bi o alt\u0103 op\u021Biune de export.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Intr\u0103rile \u00EEn jurnal nu sunt disponibile c\u00E2nd taxele sunt activate. V\u0103 rug\u0103m s\u0103 alege\u021Bi o alt\u0103 op\u021Biune de export.',
            },
            noAccountsFound: 'Nu au fost g\u0103site conturi',
            noAccountsFoundDescription: 'Ad\u0103uga\u021Bi contul \u00EEn QuickBooks Desktop \u0219i sincroniza\u021Bi din nou conexiunea.',
            qbdSetup: 'Configurarea QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Nu se poate conecta de pe acest dispozitiv',
                body1: 'Va trebui s\u0103 configura\u021Bi aceast\u0103 conexiune de pe computerul care g\u0103zduie\u0219te fi\u0219ierul companiei dvs. QuickBooks Desktop.',
                body2: 'Odat\u0103 ce e\u0219ti conectat, vei putea sincroniza \u0219i exporta de oriunde.',
            },
            setupPage: {
                title: 'Deschide\u021Bi acest link pentru a v\u0103 conecta',
                body: 'Pentru a finaliza configurarea, deschide\u021Bi urm\u0103torul link pe computerul unde ruleaz\u0103 QuickBooks Desktop.',
                setupErrorTitle: 'Ceva nu a mers bine',
                setupErrorBody1:
                    'Conexiunea la QuickBooks Desktop nu func\u021Bioneaz\u0103 \u00EEn acest moment. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu sau',
                setupErrorBody2: 'dac\u0103 problema persist\u0103.',
                setupErrorBodyContactConcierge: 'contacta\u021Bi Concierge',
            },
            importDescription: 'Alege\u021Bi ce configura\u021Bii de codare s\u0103 importa\u021Bi din QuickBooks Desktop \u00EEn Expensify.',
            classes: 'Clase',
            items: 'Articole',
            customers: 'Clien\u021Bi/proiecte',
            exportCompanyCardsDescription: 'Seteaz\u0103 modul \u00EEn care achizi\u021Biile de carduri de companie sunt exportate c\u0103tre QuickBooks Desktop.',
            defaultVendorDescription: 'Seteaz\u0103 un furnizor implicit care se va aplica la toate tranzac\u021Biile cu cardul de credit la export.',
            accountsDescription: 'Diagrama conturilor dvs. QuickBooks Desktop se va importa \u00EEn Expensify ca categorii.',
            accountsSwitchTitle: 'Alege\u021Bi s\u0103 importa\u021Bi conturi noi ca categorii activate sau dezactivate.',
            accountsSwitchDescription: 'Categoriile activate vor fi disponibile pentru membrii atunci c\u00E2nd \u00EE\u0219i creeaz\u0103 cheltuielile.',
            classesDescription: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi clasele QuickBooks Desktop \u00EEn Expensify.',
            tagsDisplayedAsDescription: 'Nivelul elementului de linie',
            reportFieldsDisplayedAsDescription: 'Nivelul raportului',
            customersDescription: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi clien\u021Bii/proiectele QuickBooks Desktop \u00EEn Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se va sincroniza automat cu QuickBooks Desktop \u00EEn fiecare zi.',
                createEntities: 'Auto-creaz\u0103 entit\u0103\u021Bi',
                createEntitiesDescription: 'Expensify va crea automat furnizorii \u00EEn QuickBooks Desktop dac\u0103 ace\u0219tia nu exist\u0103 deja.',
            },
            itemsDescription: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi elementele QuickBooks Desktop \u00EEn Expensify.',
        },
        qbo: {
            importDescription: 'Alege\u021Bi care configura\u021Bii de codificare s\u0103 importa\u021Bi din QuickBooks Online \u00EEn Expensify.',
            classes: 'Clase',
            locations: 'Loca\u021Bii',
            customers: 'Clien\u021Bi/proiecte',
            accountsDescription: 'Diagrama dvs. de conturi QuickBooks Online se va importa \u00EEn Expensify ca categorii.',
            accountsSwitchTitle: 'Alege\u021Bi s\u0103 importa\u021Bi conturi noi ca categorii activate sau dezactivate.',
            accountsSwitchDescription: 'Categoriile activate vor fi disponibile pentru membrii atunci c\u00E2nd \u00EE\u0219i creeaz\u0103 cheltuielile.',
            classesDescription: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi clasele QuickBooks Online \u00EEn Expensify.',
            customersDescription: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi clien\u021Bii/proiectele QuickBooks Online \u00EEn Expensify.',
            locationsDescription: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi loca\u021Biile QuickBooks Online \u00EEn Expensify.',
            taxesDescription: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi taxele QuickBooks Online \u00EEn Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online nu suport\u0103 Loca\u021Biile la nivel de linie pentru Cecuri sau Facturi de la Furnizori. Dac\u0103 dori\u021Bi s\u0103 ave\u021Bi loca\u021Bii la nivel de linie, asigura\u021Bi-v\u0103 c\u0103 utiliza\u021Bi Intr\u0103ri \u00EEn Jurnal \u0219i cheltuieli cu Cardul de Credit/Debit.',
            taxesJournalEntrySwitchNote:
                'QuickBooks Online nu suport\u0103 taxele pe \u00EEnregistr\u0103rile \u00EEn jurnal. V\u0103 rug\u0103m s\u0103 schimba\u021Bi op\u021Biunea de export \u00EEn factur\u0103 de furnizor sau verificare.',
            exportDescription: 'Configura\u021Bi modul \u00EEn care datele Expensify sunt exportate c\u0103tre QuickBooks Online.',
            date: 'Exporta\u021Bi data',
            exportInvoices: 'Export\u0103 facturile c\u0103tre',
            exportExpensifyCard: 'Export\u0103 tranzac\u021Biile cu cardul Expensify ca',
            deepDiveExpensifyCard: 'Tranzac\u021Biile cu cardul Expensify vor fi exportate automat \u00EEntr-un "Cont de r\u0103spundere pentru cardul Expensify" creat cu',
            deepDiveExpensifyCardIntegration: 'integrarea noastr\u0103.',
            exportDate: {
                label: 'Exporta\u021Bi data',
                description: 'Utiliza\u021Bi aceast\u0103 dat\u0103 c\u00E2nd exporta\u021Bi rapoarte \u00EEn QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ultimei cheltuieli',
                        description: 'Data celei mai recente cheltuieli din raport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exporta\u021Bi data',
                        description: 'Data la care raportul a fost exportat c\u0103tre QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data trimiterii',
                        description: 'Data la care raportul a fost trimis pentru aprobare.',
                    },
                },
            },
            receivable: 'Conturi de \u00EEncasat', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Arhiva conturi de \u00EEncasat', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Utiliza\u021Bi acest cont c\u00E2nd exporta\u021Bi facturi c\u0103tre QuickBooks Online.',
            exportCompanyCardsDescription: 'Seteaz\u0103 cum achizi\u021Biile de carduri de companie sunt exportate c\u0103tre QuickBooks Online.',
            vendor: 'Furnizor',
            defaultVendorDescription: 'Seteaz\u0103 un furnizor implicit care se va aplica la toate tranzac\u021Biile cu cardul de credit la export.',
            exportOutOfPocketExpensesDescription: 'Seteaz\u0103 cum se export\u0103 cheltuielile personale \u00EEn QuickBooks Online.',
            exportCheckDescription: 'Vom crea un cec detaliat pentru fiecare raport Expensify \u0219i \u00EEl vom trimite din contul bancar de mai jos.',
            exportJournalEntryDescription: 'Vom crea o \u00EEnregistrare de jurnal detaliat\u0103 pentru fiecare raport Expensify \u0219i \u00EEl vom posta \u00EEn contul de mai jos.',
            exportVendorBillDescription:
                'Vom crea o factur\u0103 detaliat\u0103 pentru fiecare raport Expensify \u0219i o vom ad\u0103uga la contul de mai jos. Dac\u0103 aceast\u0103 perioad\u0103 este \u00EEnchis\u0103, vom posta pe data de 1 a urm\u0103toarei perioade deschise.',
            account: 'Cont',
            accountDescription: 'Alege unde s\u0103 postezi intr\u0103rile \u00EEn jurnal.',
            accountsPayable: 'Conturi de pl\u0103tit',
            accountsPayableDescription: 'Alege\u021Bi unde s\u0103 crea\u021Bi facturile furnizorului.',
            bankAccount: 'Cont bancar',
            notConfigured: 'Neconfigurat',
            bankAccountDescription: 'Alege\u021Bi de unde s\u0103 trimite\u021Bi cecurile.',
            creditCardAccount: 'Cont de card de credit',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online nu suport\u0103 loca\u021Biile la exporturile de facturi furnizor. Deoarece ave\u021Bi loca\u021Bii activate \u00EEn spa\u021Biul dvs. de lucru, aceast\u0103 op\u021Biune de export nu este disponibil\u0103.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online nu suport\u0103 taxele la exporturile de intr\u0103ri \u00EEn jurnal. Deoarece ave\u021Bi taxele activate \u00EEn spa\u021Biul dvs. de lucru, aceast\u0103 op\u021Biune de export nu este disponibil\u0103.',
            outOfPocketTaxEnabledError:
                'Intr\u0103rile \u00EEn jurnal nu sunt disponibile c\u00E2nd taxele sunt activate. V\u0103 rug\u0103m s\u0103 alege\u021Bi o alt\u0103 op\u021Biune de export.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se va sincroniza automat cu QuickBooks Online \u00EEn fiecare zi.',
                inviteEmployees: 'Invita\u021Bi angaja\u021Bii',
                inviteEmployeesDescription:
                    'Import\u0103 \u00EEnregistr\u0103rile angaja\u021Bilor din QuickBooks Online \u0219i invit\u0103 angaja\u021Bii \u00EEn acest spa\u021Biu de lucru.',
                createEntities: 'Auto-creaz\u0103 entit\u0103\u021Bi',
                createEntitiesDescription:
                    'Expensify va crea automat furnizori \u00EEn QuickBooks Online dac\u0103 ace\u0219tia nu exist\u0103 deja, \u0219i va crea automat clien\u021Bi atunci c\u00E2nd export\u0103 facturi.',
                reimbursedReportsDescription:
                    'De fiecare dat\u0103 c\u00E2nd un raport este pl\u0103tit folosind Expensify ACH, plata facturii corespunz\u0103toare va fi creat\u0103 \u00EEn contul QuickBooks Online de mai jos.',
                qboBillPaymentAccount: 'Cont de plat\u0103 pentru facturi QuickBooks',
                qboInvoiceCollectionAccount: 'Contul de colectare a facturilor QuickBooks',
                accountSelectDescription: 'Alege\u021Bi de unde s\u0103 pl\u0103ti\u021Bi facturile \u0219i noi vom crea plata \u00EEn QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Alege\u021Bi unde s\u0103 primi\u021Bi pl\u0103\u021Bile facturilor \u0219i vom crea plata \u00EEn QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Card de debit',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Card de credit',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Factura furnizor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Intrare \u00EEn jurnal',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Verific\u0103',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "Vom potrivi automat numele comerciantului de pe tranzac\u021Bia cu cardul de debit cu orice furnizori corespunz\u0103tori din QuickBooks. Dac\u0103 nu exist\u0103 furnizori, vom crea un furnizor 'Debit Card Misc.' pentru asociere.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Vom potrivi automat numele comerciantului de pe tranzac\u021Bia cu cardul de credit cu orice furnizori coresponden\u021Bi din QuickBooks. Dac\u0103 nu exist\u0103 furnizori, vom crea un furnizor 'Credit Card Misc.' pentru asociere.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Vom crea o factur\u0103 detaliat\u0103 de la furnizor pentru fiecare raport Expensify cu data ultimei cheltuieli \u0219i o vom ad\u0103uga la contul de mai jos. Dac\u0103 aceast\u0103 perioad\u0103 este \u00EEnchis\u0103, vom posta pe data de 1 a urm\u0103toarei perioade deschise.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Alege\u021Bi unde s\u0103 exporta\u021Bi tranzac\u021Biile cu cardul de debit.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Alege\u021Bi unde s\u0103 exporta\u021Bi tranzac\u021Biile cu cardul de credit.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Alege\u021Bi un furnizor pentru a se aplica la toate tranzac\u021Biile cu cardul de credit.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Facturile furnizorilor nu sunt disponibile atunci c\u00E2nd loca\u021Biile sunt activate. V\u0103 rug\u0103m s\u0103 alege\u021Bi o alt\u0103 op\u021Biune de export.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Verific\u0103rile nu sunt disponibile c\u00E2nd loca\u021Biile sunt activate. V\u0103 rug\u0103m s\u0103 alege\u021Bi o alt\u0103 op\u021Biune de export.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Intr\u0103rile \u00EEn jurnal nu sunt disponibile c\u00E2nd taxele sunt activate. V\u0103 rug\u0103m s\u0103 alege\u021Bi o alt\u0103 op\u021Biune de export.',
            },
            noAccountsFound: 'Nu au fost g\u0103site conturi',
            noAccountsFoundDescription: 'Ad\u0103uga\u021Bi contul \u00EEn QuickBooks Online \u0219i sincroniza\u021Bi din nou conexiunea.',
        },
        workspaceList: {
            joinNow: 'Al\u0103tur\u0103-te acum',
            askToJoin: 'Cere s\u0103 te al\u0103turi',
        },
        xero: {
            organization: 'Organiza\u021Bia Xero',
            organizationDescription: 'Alege\u021Bi organiza\u021Bia Xero din care dori\u021Bi s\u0103 importa\u021Bi date.',
            importDescription: 'Alege\u021Bi care configura\u021Bii de codificare s\u0103 importa\u021Bi din Xero \u00EEn Expensify.',
            accountsDescription: 'Diagrama dvs. de conturi Xero se va importa \u00EEn Expensify ca categorii.',
            accountsSwitchTitle: 'Alege\u021Bi s\u0103 importa\u021Bi conturi noi ca categorii activate sau dezactivate.',
            accountsSwitchDescription: 'Categoriile activate vor fi disponibile pentru membrii atunci c\u00E2nd \u00EE\u0219i creeaz\u0103 cheltuielile.',
            trackingCategories: 'Urm\u0103rire categorii',
            trackingCategoriesDescription: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi categoriile de urm\u0103rire Xero \u00EEn Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Asocia\u021Bi Xero ${categoryName} cu`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Alege\u021Bi unde s\u0103 mapa\u021Bi ${categoryName} c\u00E2nd exporta\u021Bi c\u0103tre Xero.`,
            customers: 'Refactureaz\u0103 clien\u021Bii',
            customersDescription:
                'Alege\u021Bi dac\u0103 s\u0103 refactura\u021Bi clien\u021Bii \u00EEn Expensify. Contactele dvs. de clien\u021Bi Xero pot fi etichetate la cheltuieli \u0219i vor fi exportate c\u0103tre Xero ca o factur\u0103 de v\u00E2nzare.',
            taxesDescription: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi taxele Xero \u00EEn Expensify.',
            notImported: 'Nu a fost importat',
            notConfigured: 'Neconfigurat',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contact implicit Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Etichete',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'C\u00E2mpuri de raportare',
            },
            exportDescription: 'Configura\u021Bi modul \u00EEn care datele Expensify sunt exportate c\u0103tre Xero.',
            purchaseBill: 'Factur\u0103 de achizi\u021Bie',
            exportDeepDiveCompanyCard:
                'Cheltuielile exportate se vor posta ca tranzac\u021Bii bancare \u00EEn contul de banc\u0103 Xero de mai jos, iar datele tranzac\u021Biilor vor corespunde cu datele de pe extrasul t\u0103u bancar.',
            bankTransactions: 'Tranzac\u021Bii bancare',
            xeroBankAccount: 'Cont bancar Xero',
            xeroBankAccountDescription: 'Alege\u021Bi unde vor fi postate cheltuielile ca tranzac\u021Bii bancare.',
            exportExpensesDescription: 'Rapoartele vor fi exportate ca o factur\u0103 de achizi\u021Bie cu data \u0219i starea selectate mai jos.',
            purchaseBillDate: 'Data facturii de achizi\u021Bie',
            exportInvoices: 'Export\u0103 facturile ca',
            salesInvoice: 'Factur\u0103 de v\u00E2nzare',
            exportInvoicesDescription: 'Facturile de v\u00E2nzare afi\u0219eaz\u0103 \u00EEntotdeauna data la care a fost trimis\u0103 factura.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se va sincroniza automat cu Xero \u00EEn fiecare zi.',
                purchaseBillStatusTitle: 'Starea facturii de achizi\u021Bie',
                reimbursedReportsDescription:
                    'De fiecare dat\u0103 c\u00E2nd un raport este pl\u0103tit folosind Expensify ACH, plata facturii corespunz\u0103toare va fi creat\u0103 \u00EEn contul Xero de mai jos.',
                xeroBillPaymentAccount: 'Cont de plat\u0103 pentru facturi Xero',
                xeroInvoiceCollectionAccount: 'Contul de colectare a facturilor Xero',
                xeroBillPaymentAccountDescription: 'Alege\u021Bi de unde s\u0103 pl\u0103ti\u021Bi facturile \u0219i noi vom crea plata \u00EEn Xero.',
                invoiceAccountSelectorDescription: 'Alege\u021Bi unde s\u0103 primi\u021Bi pl\u0103\u021Bile facturilor \u0219i noi vom crea plata \u00EEn Xero.',
            },
            exportDate: {
                label: 'Data facturii de achizi\u021Bie',
                description: 'Utiliza\u021Bi aceast\u0103 dat\u0103 c\u00E2nd exporta\u021Bi rapoarte \u00EEn Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ultimei cheltuieli',
                        description: 'Data celei mai recente cheltuieli din raport.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exporta\u021Bi data',
                        description: 'Data la care raportul a fost exportat c\u0103tre Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data trimiterii',
                        description: 'Data la care raportul a fost trimis pentru aprobare.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Starea facturii de achizi\u021Bie',
                description: 'Utiliza\u021Bi acest status c\u00E2nd exporta\u021Bi facturile de cump\u0103rare c\u0103tre Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Ciorn\u0103',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '\u00CEn a\u0219teptarea aprob\u0103rii',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '\u00CEn a\u0219teptarea pl\u0103\u021Bii',
                },
            },
            noAccountsFound: 'Nu au fost g\u0103site conturi',
            noAccountsFoundDescription: 'V\u0103 rug\u0103m s\u0103 ad\u0103uga\u021Bi contul \u00EEn Xero \u0219i s\u0103 sincroniza\u021Bi din nou conexiunea.',
        },
        sageIntacct: {
            preferredExporter: 'Exporter preferat',
            notConfigured: 'Neconfigurat',
            exportDate: {
                label: 'Exporta\u021Bi data',
                description: 'Utiliza\u021Bi aceast\u0103 dat\u0103 c\u00E2nd exporta\u021Bi rapoarte \u00EEn Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ultimei cheltuieli',
                        description: 'Data celei mai recente cheltuieli din raport.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Exporta\u021Bi data',
                        description: 'Data la care raportul a fost exportat c\u0103tre Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data trimiterii',
                        description: 'Data la care raportul a fost trimis pentru aprobare.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Seteaz\u0103 cum cheltuielile personale se export\u0103 \u00EEn Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Rapoarte de cheltuieli',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Facturi furnizor',
                },
            },
            nonReimbursableExpenses: {
                description: 'Seta\u021Bi modul \u00EEn care achizi\u021Biile de carduri ale companiei sunt exportate c\u0103tre Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Carduri de credit',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Facturi furnizor',
                },
            },
            creditCardAccount: 'Cont de card de credit',
            defaultVendor: 'Furnizor implicit',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Seteaz\u0103 un furnizor implicit care se va aplica la cheltuielile ${isReimbursable ? '' : 'non-'}rambursabile care nu au un furnizor corespondent \u00EEn Sage Intacct.`,
            exportDescription: 'Configura\u021Bi modul \u00EEn care datele Expensify sunt exportate c\u0103tre Sage Intacct.',
            exportPreferredExporterNote:
                'Exporterul preferat poate fi orice administrator de spa\u021Biu de lucru, dar trebuie s\u0103 fie \u0219i un Administrator de Domeniu dac\u0103 a\u021Bi setat conturi de export diferite pentru cardurile de companie individuale \u00EEn Set\u0103rile de Domeniu.',
            exportPreferredExporterSubNote: 'Odat\u0103 setat, exportatorul preferat va vedea rapoartele pentru export \u00EEn contul lor.',
            noAccountsFound: 'Nu au fost g\u0103site conturi',
            noAccountsFoundDescription: `Please add the account in Sage Intacct and sync the connection again.`,
            autoSync: 'Auto-sincronizare',
            autoSyncDescription: 'Expensify se va sincroniza automat cu Sage Intacct \u00EEn fiecare zi.',
            inviteEmployees: 'Invita\u021Bi angaja\u021Bii',
            inviteEmployeesDescription:
                'Importa\u021Bi \u00EEnregistr\u0103rile angaja\u021Bilor Sage Intacct \u0219i invita\u021Bi angaja\u021Bii \u00EEn acest spa\u021Biu de lucru. Fluxul dvs. de aprobare va fi setat implicit pe aprobarea managerului \u0219i poate fi configurat ulterior pe pagina Membri.',
            syncReimbursedReports: 'Sincronizeaz\u0103 rapoartele rambursate',
            syncReimbursedReportsDescription:
                'De fiecare dat\u0103 c\u00E2nd un raport este pl\u0103tit folosind Expensify ACH, plata facturii corespunz\u0103toare va fi creat\u0103 \u00EEn contul Sage Intacct de mai jos.',
            paymentAccount: 'Cont de plat\u0103 Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Filial\u0103',
            subsidiarySelectDescription: 'Alege\u021Bi filiala din NetSuite de la care dori\u021Bi s\u0103 importa\u021Bi date.',
            exportDescription: 'Configura\u021Bi modul \u00EEn care datele Expensify sunt exportate c\u0103tre NetSuite.',
            exportInvoices: 'Export\u0103 facturile c\u0103tre',
            journalEntriesTaxPostingAccount: 'Inregistrari jurnal cont postare impozit',
            journalEntriesProvTaxPostingAccount: 'Intr\u0103ri \u00EEn jurnal contul de postare a taxei provinciale',
            foreignCurrencyAmount: 'Export\u0103 suma \u00EEn valut\u0103 str\u0103in\u0103',
            exportToNextOpenPeriod: 'Export\u0103 c\u0103tre urm\u0103toarea perioad\u0103 deschis\u0103',
            nonReimbursableJournalPostingAccount: 'Cont de postare a jurnalului non-rambursabil',
            reimbursableJournalPostingAccount: 'Cont de postare a jurnalului rambursabil',
            journalPostingPreference: {
                label: 'Preferin\u021Ba de postare a \u00EEnregistr\u0103rilor \u00EEn jurnal',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Intrare individual\u0103, detaliat\u0103 pentru fiecare raport',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Intrare unic\u0103 pentru fiecare cheltuial\u0103',
                },
            },
            invoiceItem: {
                label: 'Articol factur\u0103',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Creeaz\u0103 unul pentru mine',
                        description: 'Vom crea pentru tine un "articol de factur\u0103 Expensify" la export (dac\u0103 nu exist\u0103 deja unul).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Selecteaz\u0103 existent',
                        description: 'Vom lega facturile de la Expensify la elementul selectat mai jos.',
                    },
                },
            },
            exportDate: {
                label: 'Exporta\u021Bi data',
                description: 'Utiliza\u021Bi aceast\u0103 dat\u0103 c\u00E2nd exporta\u021Bi rapoarte c\u0103tre NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ultimei cheltuieli',
                        description: 'Data celei mai recente cheltuieli din raport.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Exporta\u021Bi data',
                        description: 'Data la care raportul a fost exportat c\u0103tre NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data trimiterii',
                        description: 'Data la care raportul a fost trimis pentru aprobare.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Rapoarte de cheltuieli',
                        reimbursableDescription: 'Cheltuielile personale vor fi exportate ca rapoarte de cheltuieli c\u0103tre NetSuite.',
                        nonReimbursableDescription: 'Cheltuielile pe cardul companiei se vor exporta ca rapoarte de cheltuieli \u00EEn NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Facturi furnizor',
                        reimbursableDescription:
                            'Cheltuielile personale vor fi exportate ca facturi de pl\u0103tit c\u0103tre furnizorul NetSuite specificat mai jos.' +
                            'Fiindc\u0103 nu a\u021Bi oferit niciun text pentru a fi tradus, nu pot oferi o traducere. V\u0103 rug\u0103m s\u0103 furniza\u021Bi textul care trebuie tradus.' +
                            'Dac\u0103 dori\u021Bi s\u0103 seta\u021Bi un anumit furnizor pentru fiecare card, merge\u021Bi la *Set\u0103ri > Domenii > Carduri de companie*.',
                        nonReimbursableDescription:
                            'Cheltuielile cu cardul companiei se vor exporta ca facturi de plat\u0103 c\u0103tre furnizorul NetSuite specificat mai jos.' +
                            'Fiindc\u0103 nu a\u021Bi oferit niciun text pentru a fi tradus, nu pot oferi o traducere. V\u0103 rug\u0103m s\u0103 furniza\u021Bi textul care trebuie tradus.' +
                            'Dac\u0103 dori\u021Bi s\u0103 seta\u021Bi un anumit furnizor pentru fiecare card, merge\u021Bi la *Set\u0103ri > Domenii > Carduri de companie*.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Intr\u0103ri \u00EEn jurnal',
                        reimbursableDescription:
                            'Cheltuielile personale vor fi exportate ca \u00EEnregistr\u0103ri \u00EEn jurnal \u00EEn contul NetSuite specificat mai jos.' +
                            'Fiindc\u0103 nu a\u021Bi oferit niciun text pentru a fi tradus, nu pot oferi o traducere. V\u0103 rug\u0103m s\u0103 furniza\u021Bi textul care trebuie tradus.' +
                            'Dac\u0103 dori\u021Bi s\u0103 seta\u021Bi un anumit furnizor pentru fiecare card, merge\u021Bi la *Set\u0103ri > Domenii > Carduri de companie*.',
                        nonReimbursableDescription:
                            'Cheltuielile pe cardul companiei vor fi exportate ca intr\u0103ri \u00EEn jurnal \u00EEn contul NetSuite specificat mai jos.' +
                            'Fiindc\u0103 nu a\u021Bi oferit niciun text pentru a fi tradus, nu pot oferi o traducere. V\u0103 rug\u0103m s\u0103 furniza\u021Bi textul care trebuie tradus.' +
                            'Dac\u0103 dori\u021Bi s\u0103 seta\u021Bi un anumit furnizor pentru fiecare card, merge\u021Bi la *Set\u0103ri > Domenii > Carduri de companie*.',
                    },
                },
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify se va sincroniza automat cu NetSuite \u00EEn fiecare zi.',
                reimbursedReportsDescription:
                    'De fiecare dat\u0103 c\u00E2nd un raport este pl\u0103tit folosind Expensify ACH, plata facturii corespunz\u0103toare va fi creat\u0103 \u00EEn contul NetSuite de mai jos.',
                reimbursementsAccount: 'Cont de ramburs\u0103ri',
                reimbursementsAccountDescription:
                    'Alege\u021Bi contul bancar pe care \u00EEl ve\u021Bi folosi pentru ramburs\u0103ri, iar noi vom crea plata asociat\u0103 \u00EEn NetSuite.',
                collectionsAccount: 'Cont de colec\u021Bii',
                collectionsAccountDescription:
                    'Odat\u0103 ce o factur\u0103 este marcat\u0103 ca pl\u0103tit\u0103 \u00EEn Expensify \u0219i exportat\u0103 \u00EEn NetSuite, aceasta va ap\u0103rea \u00EEn contul de mai jos.',
                approvalAccount: 'Cont de aprobare A/P',
                approvalAccountDescription:
                    'Alege\u021Bi contul \u00EEn care tranzac\u021Biile vor fi aprobate \u00EEn NetSuite. Dac\u0103 sincroniza\u021Bi rapoartele rambursate, acesta este \u0219i contul \u00EEn care vor fi create pl\u0103\u021Bile facturilor.',
                defaultApprovalAccount: 'Implicit NetSuite',
                inviteEmployees: 'Invita\u021Bi angaja\u021Bii \u0219i seta\u021Bi aprob\u0103rile',
                inviteEmployeesDescription:
                    'Importa\u021Bi \u00EEnregistr\u0103rile angaja\u021Bilor NetSuite \u0219i invita\u021Bi angaja\u021Bii \u00EEn acest spa\u021Biu de lucru. Fluxul dvs. de aprobare va fi setat implicit pe aprobarea managerului \u0219i poate fi configurat suplimentar pe pagina *Membri*.',
                autoCreateEntities: 'Auto-creaz\u0103 angaja\u021Bi/furnizori',
                enableCategories: 'Activeaz\u0103 categoriile importate recent',
                customFormID: 'ID formular personalizat',
                customFormIDDescription:
                    '\u00CEn mod implicit, Expensify va crea intr\u0103ri folosind formularul de tranzac\u021Bie preferat setat \u00EEn NetSuite. Alternativ, pute\u021Bi desemna un formular de tranzac\u021Bie specific care s\u0103 fie utilizat.',
                customFormIDReimbursable: 'Cheltuial\u0103 din propriul buzunar',
                customFormIDNonReimbursable: 'Cheltuiala cu cardul companiei',
                exportReportsTo: {
                    label: 'Nivel de aprobare a raportului de cheltuieli',
                    description:
                        'Odat\u0103 ce un raport de cheltuieli este aprobat \u00EEn Expensify \u0219i exportat \u00EEn NetSuite, pute\u021Bi seta un nivel suplimentar de aprobare \u00EEn NetSuite \u00EEnainte de postare.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Preferin\u021Ba implicit\u0103 NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Doar supervisorul a aprobat',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Doar contabilitatea a aprobat',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervizorul \u0219i contabilitatea au aprobat',
                    },
                },
                accountingMethods: {
                    label: 'C\u00E2nd s\u0103 Exporta\u021Bi',
                    description: 'Alege\u021Bi c\u00E2nd s\u0103 exporta\u021Bi cheltuielile:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Acumulare',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Numerar',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Cheltuielile din propriul buzunar vor fi exportate c\u00E2nd sunt aprobate definitiv',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Cheltuielile personale se vor exporta atunci c\u00E2nd sunt pl\u0103tite',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Nivel de aprobare a facturii furnizorului',
                    description:
                        'Odat\u0103 ce o factur\u0103 de la furnizor este aprobat\u0103 \u00EEn Expensify \u0219i exportat\u0103 \u00EEn NetSuite, pute\u021Bi seta un nivel suplimentar de aprobare \u00EEn NetSuite \u00EEnainte de postare.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Preferin\u021Ba implicit\u0103 NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '\u00CEn a\u0219teptarea aprob\u0103rii',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Aprobat pentru postare',
                    },
                },
                exportJournalsTo: {
                    label: 'Nivel de aprobare a intr\u0103rii \u00EEn jurnal',
                    description:
                        'Odat\u0103 ce o \u00EEnregistrare \u00EEn jurnal este aprobat\u0103 \u00EEn Expensify \u0219i exportat\u0103 \u00EEn NetSuite, pute\u021Bi seta un nivel suplimentar de aprobare \u00EEn NetSuite \u00EEnainte de postare.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Preferin\u021Ba implicit\u0103 NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '\u00CEn a\u0219teptarea aprob\u0103rii',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Aprobat pentru postare',
                    },
                },
                error: {
                    customFormID: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un ID numeric valid pentru formularul personalizat.',
                },
            },
            noAccountsFound: 'Nu au fost g\u0103site conturi',
            noAccountsFoundDescription: 'V\u0103 rug\u0103m s\u0103 ad\u0103uga\u021Bi contul \u00EEn NetSuite \u0219i s\u0103 sincroniza\u021Bi din nou conexiunea.',
            noVendorsFound: 'Nu s-au g\u0103sit furnizori',
            noVendorsFoundDescription: 'V\u0103 rug\u0103m s\u0103 ad\u0103uga\u021Bi furnizori \u00EEn NetSuite \u0219i s\u0103 sincroniza\u021Bi conexiunea din nou.',
            noItemsFound: 'Nu au fost g\u0103site elemente de factur\u0103',
            noItemsFoundDescription: 'V\u0103 rug\u0103m s\u0103 ad\u0103uga\u021Bi elemente de factur\u0103 \u00EEn NetSuite \u0219i s\u0103 sincroniza\u021Bi din nou conexiunea.',
            noSubsidiariesFound: 'Nu au fost g\u0103site filiale',
            noSubsidiariesFoundDescription: 'V\u0103 rug\u0103m s\u0103 ad\u0103uga\u021Bi o filial\u0103 \u00EEn NetSuite \u0219i s\u0103 sincroniza\u021Bi din nou conexiunea.',
            tokenInput: {
                title: 'Configurare NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Instaleaz\u0103 pachetul Expensify',
                        description: '\u00CEn NetSuite, du-te la *Personalizare > SuiteBundler > C\u0103utare & Instalare Pachete* > caut\u0103 "Expensify" > instaleaz\u0103 pachetul.',
                    },
                    enableTokenAuthentication: {
                        title: 'Activeaz\u0103 autentificarea bazat\u0103 pe token',
                        description: '\u00CEn NetSuite, mergi la *Configurare > Companie > Activeaz\u0103 func\u021Bii > SuiteCloud* > activeaz\u0103 *autentificarea bazat\u0103 pe token*.',
                    },
                    enableSoapServices: {
                        title: 'Activa\u021Bi serviciile web SOAP',
                        description: '\u00CEn NetSuite, accesa\u021Bi *Configurare > Companie > Activeaz\u0103 Func\u021Bii > SuiteCloud* > activa\u021Bi *Servicii Web SOAP*.',
                    },
                    createAccessToken: {
                        title: 'Creeaz\u0103 un token de acces',
                        description:
                            '\u00CEn NetSuite, accesa\u021Bi *Configurare > Utilizatori/Roluri > Token-uri de acces* > crea\u021Bi un token de acces pentru aplica\u021Bia "Expensify" \u0219i fie rolul "Integrare Expensify", fie "Administrator".\n\n*Important:* Asigura\u021Bi-v\u0103 c\u0103 salva\u021Bi *ID-ul Token-ului* \u0219i *Secretul Token-ului* din acest pas. Ve\u021Bi avea nevoie de el pentru urm\u0103torul pas.',
                    },
                    enterCredentials: {
                        title: 'Introduce\u021Bi datele dvs. de autentificare NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID cont NetSuite',
                            netSuiteTokenID: 'ID-ul tokenului',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: '\u00CEn NetSuite, merge\u021Bi la *Configurare > Integrare > Preferin\u021Be SOAP Web Services*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Categorii de cheltuieli',
                expenseCategoriesDescription: 'Categoriile dvs. de cheltuieli NetSuite se vor importa \u00EEn Expensify ca categorii.',
                crossSubsidiaryCustomers: 'Clien\u021Bi/proiecte inter-subsidiare',
                importFields: {
                    departments: {
                        title: 'Departamente',
                        subtitle: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi *departamentele* NetSuite \u00EEn Expensify.',
                    },
                    classes: {
                        title: 'Clase',
                        subtitle: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi *clasele* \u00EEn Expensify.',
                    },
                    locations: {
                        title: 'Loca\u021Bii',
                        subtitle: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi *locurile* \u00EEn Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clien\u021Bi/proiecte',
                    subtitle: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi *clien\u021Bii* \u0219i *proiectele* NetSuite \u00EEn Expensify.',
                    importCustomers: 'Import\u0103 clien\u021Bi',
                    importJobs: 'Import\u0103 proiecte',
                    customers: 'clien\u021Bi',
                    jobs: 'proiecte',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join(' and ')}, ${importType}`,
                },
                importTaxDescription: 'Import\u0103 grupuri de taxe din NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Alege\u021Bi o op\u021Biune de mai jos:',
                    label: ({importedTypes}: ImportedTypesParams) => `Importat ca ${importedTypes.join(' și ')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `V\u0103 rug\u0103m s\u0103 introduce\u021Bi ${fieldName}`,
                    customSegments: {
                        title: 'Segmente/\u00EEnregistr\u0103ri personalizate',
                        addText: 'Adaug\u0103 segment/personalizat \u00EEnregistrare',
                        recordTitle: 'Segment personalizat/\u00EEnregistrare',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Vizualizeaz\u0103 instruc\u021Biuni detaliate',
                        helpText: 'despre configurarea segmentelor/\u00EEnregistr\u0103rilor personalizate.',
                        emptyTitle: 'Ad\u0103uga\u021Bi un segment personalizat sau o \u00EEnregistrare personalizat\u0103',
                        fields: {
                            segmentName: 'Nume',
                            internalID: 'ID intern',
                            scriptID: 'ID script',
                            customRecordScriptID: 'Coloana ID a tranzac\u021Biei',
                            mapping: 'Afi\u0219at ca',
                        },
                        removeTitle: '\u0218terge segmentul/\u00EEnregistrarea personalizat\u0103',
                        removePrompt: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi acest segment/\u00EEnregistrare personalizat(\u0103)?',
                        addForm: {
                            customSegmentName: 'nume personalizat al segmentului',
                            customRecordName: 'nume personalizat al \u00EEnregistr\u0103rii',
                            segmentTitle: 'Segment personalizat',
                            customSegmentAddTitle: 'Adaug\u0103 segment personalizat',
                            customRecordAddTitle: 'Adaug\u0103 \u00EEnregistrare personalizat\u0103',
                            recordTitle: '\u00CEnregistrare personalizat\u0103',
                            segmentRecordType: 'Dori\u021Bi s\u0103 ad\u0103uga\u021Bi un segment personalizat sau o \u00EEnregistrare personalizat\u0103?',
                            customSegmentNameTitle: 'Care este numele segmentului personalizat?',
                            customRecordNameTitle: 'Care este numele \u00EEnregistr\u0103rii personalizate?',
                            customSegmentNameFooter: `Pute\u021Bi g\u0103si numele segmentelor personalizate \u00EEn NetSuite sub *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Pentru instruc\u021Biuni mai detaliate, [vizita\u021Bi site-ul nostru de ajutor](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Pute\u021Bi g\u0103si numele \u00EEnregistr\u0103rilor personalizate \u00EEn NetSuite introduc\u00E2nd "C\u00E2mpul coloanei de tranzac\u021Bii" \u00EEn c\u0103utarea global\u0103.\n\n_Pentru instruc\u021Biuni mai detaliate, [vizita\u021Bi site-ul nostru de ajutor](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Care este ID-ul intern?',
                            customSegmentInternalIDFooter: `\u00CEn primul r\u00E2nd, asigura\u021Bi-v\u0103 c\u0103 a\u021Bi activat ID-urile interne \u00EEn NetSuite sub *Acas\u0103 > Seteaz\u0103 preferin\u021Bele > Arat\u0103 ID intern.*\n\nPute\u021Bi g\u0103si ID-urile interne ale segmentelor personalizate \u00EEn NetSuite sub:\n\n1. *Personalizare > Liste, \u00CEnregistr\u0103ri, & C\u00E2mpuri > Segmentele personalizate*.\n2. Face\u021Bi clic pe un segment personalizat.\n3. Face\u021Bi clic pe hyperlink-ul de l\u00E2ng\u0103 *Tipul de \u00EEnregistrare personalizat\u0103*.\n4. G\u0103si\u021Bi ID-ul intern \u00EEn tabelul de la partea de jos.\n\n_Pentru instruc\u021Biuni mai detaliate, [vizita\u021Bi site-ul nostru de ajutor](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Pute\u021Bi g\u0103si ID-urile interne ale \u00EEnregistr\u0103rilor personalizate \u00EEn NetSuite urm\u00E2nd ace\u0219ti pa\u0219i:\n\n1. Introduce\u021Bi "Transaction Line Fields" \u00EEn c\u0103utarea global\u0103.\n2. Face\u021Bi clic pe o \u00EEnregistrare personalizat\u0103.\n3. G\u0103si\u021Bi ID-ul intern pe partea st\u00E2ng\u0103.\n\n_Pentru instruc\u021Biuni mai detaliate, [vizita\u021Bi site-ul nostru de ajutor](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Care este ID-ul scriptului?',
                            customSegmentScriptIDFooter: `Pute\u021Bi g\u0103si ID-urile scripturilor de segment personalizate \u00EEn NetSuite sub:\n\n1. *Personalizare > Liste, \u00CEnregistr\u0103ri, & C\u00E2mpuri > Segment Personalizat*.\n2. Face\u021Bi clic pe un segment personalizat.\n3. Face\u021Bi clic pe fila *Aplica\u021Bie \u0219i Surs\u0103* aproape de partea de jos, apoi:\n    a. Dac\u0103 dori\u021Bi s\u0103 afi\u0219a\u021Bi segmentul personalizat ca un *tag* (la nivel de linie de articol) \u00EEn Expensify, face\u021Bi clic pe sub-fila *Coloane Tranzac\u021Bii* \u0219i utiliza\u021Bi *ID-ul C\u00E2mpului*.\n    b. Dac\u0103 dori\u021Bi s\u0103 afi\u0219a\u021Bi segmentul personalizat ca un *c\u00E2mp de raport* (la nivel de raport) \u00EEn Expensify, face\u021Bi clic pe sub-fila *Tranzac\u021Bii* \u0219i utiliza\u021Bi *ID-ul C\u00E2mpului*.\n\n_Pentru instruc\u021Biuni mai detaliate, [vizita\u021Bi site-ul nostru de ajutor](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Care este ID-ul coloanei de tranzac\u021Bii?',
                            customRecordScriptIDFooter: `Pute\u021Bi g\u0103si ID-uri de script pentru \u00EEnregistr\u0103ri personalizate \u00EEn NetSuite sub:\n\n1. Introduce\u021Bi "Transaction Line Fields" \u00EEn c\u0103utarea global\u0103.\n2. Face\u021Bi clic pe o \u00EEnregistrare personalizat\u0103.\n3. G\u0103si\u021Bi ID-ul scriptului pe partea st\u00E2ng\u0103.\n\n_Pentru instruc\u021Biuni mai detaliate, [vizita\u021Bi site-ul nostru de ajutor](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Cum ar trebui s\u0103 fie afi\u0219at acest segment personalizat \u00EEn Expensify?',
                            customRecordMappingTitle: 'Cum ar trebui s\u0103 fie afi\u0219at\u0103 aceast\u0103 \u00EEnregistrare personalizat\u0103 \u00EEn Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Un segment/\u00EEnregistrare personalizat cu acest ${fieldName?.toLowerCase()} exist\u0103 deja.`,
                        },
                    },
                    customLists: {
                        title: 'Liste personalizate',
                        addText: 'Adaug\u0103 list\u0103 personalizat\u0103',
                        recordTitle: 'List\u0103 personalizat\u0103',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Vizualizeaz\u0103 instruc\u021Biuni detaliate',
                        helpText: 'despre configurarea listelor personalizate.',
                        emptyTitle: 'Adaug\u0103 o list\u0103 personalizat\u0103',
                        fields: {
                            listName: 'Nume',
                            internalID: 'ID intern',
                            transactionFieldID: 'ID c\u00E2mp tranzac\u021Bie',
                            mapping: 'Afi\u0219at ca',
                        },
                        removeTitle: '\u0218terge lista personalizat\u0103',
                        removePrompt: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 list\u0103 personalizat\u0103?',
                        addForm: {
                            listNameTitle: 'Alege\u021Bi o list\u0103 personalizat\u0103',
                            transactionFieldIDTitle: 'Care este ID-ul c\u00E2mpului de tranzac\u021Bie?',
                            transactionFieldIDFooter: `Pute\u021Bi g\u0103si ID-urile de c\u00E2mpuri de tranzac\u021Bie \u00EEn NetSuite urm\u00E2nd ace\u0219ti pa\u0219i:\n\n1. Introduce\u021Bi "Transaction Line Fields" \u00EEn c\u0103utarea global\u0103.\n2. Face\u021Bi clic pe o list\u0103 personalizat\u0103.\n3. G\u0103si\u021Bi ID-ul c\u00E2mpului de tranzac\u021Bie pe partea st\u00E2ng\u0103.\n\n_Pentru instruc\u021Biuni mai detaliate, [vizita\u021Bi site-ul nostru de ajutor](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Cum ar trebui s\u0103 fie afi\u0219at\u0103 aceast\u0103 list\u0103 personalizat\u0103 \u00EEn Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `A custom list with this transaction field ID already exists.`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Angajat implicit NetSuite',
                        description: 'Nu a fost importat \u00EEn Expensify, aplicat la export',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Dac\u0103 folose\u0219ti ${importField} \u00EEn NetSuite, vom aplica setul implicit pe \u00EEnregistrarea angajatului la exportarea c\u0103tre Raportul de cheltuieli sau \u00CEnregistrarea \u00EEn jurnal.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Etichete',
                        description: 'La nivel de element de linie',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'C\u00E2mpuri de raportare',
                        description: 'Nivelul raportului',
                        footerContent: ({importField}: ImportFieldParams) => `Selec\u021Bia ${startCase(importField)} se va aplica la toate cheltuielile din raportul unui angajat.`,
                    },
                },
            },
        },
        nsqs: {
            setup: {
                title: 'Configurare NSQS',
                description: 'Introduce\u021Bi ID-ul contului dvs. NSQS',
                formInputs: {
                    netSuiteAccountID: 'ID cont NSQS',
                },
            },
            import: {
                expenseCategories: 'Categorii de cheltuieli',
                expenseCategoriesDescription: 'Categoriile de cheltuieli NSQS se import\u0103 \u00EEn Expensify ca categorii.',
                importTypes: {
                    [CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Etichete',
                        description: 'La nivel de element de linie',
                    },
                    [CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'C\u00E2mpuri de raportare',
                        description: 'Nivelul raportului',
                    },
                },
                importFields: {
                    customers: {
                        title: 'Clien\u021Bi',
                        subtitle: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi *clien\u021Bii* NSQS \u00EEn Expensify.',
                    },
                    projects: {
                        title: 'Proiecte',
                        subtitle: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi *proiectele* NSQS \u00EEn Expensify.',
                    },
                },
            },
            export: {
                description: 'Configura\u021Bi modul \u00EEn care datele Expensify sunt exportate c\u0103tre NSQS.',
                exportDate: {
                    label: 'Exporta\u021Bi data',
                    description: 'Utiliza\u021Bi aceast\u0103 dat\u0103 c\u00E2nd exporta\u021Bi rapoarte c\u0103tre NSQS.',
                    values: {
                        [CONST.NSQS_EXPORT_DATE.LAST_EXPENSE]: {
                            label: 'Data ultimei cheltuieli',
                            description: 'Data celei mai recente cheltuieli din raport.',
                        },
                        [CONST.NSQS_EXPORT_DATE.EXPORTED]: {
                            label: 'Exporta\u021Bi data',
                            description: 'Data la care raportul a fost exportat c\u0103tre NSQS.',
                        },
                        [CONST.NSQS_EXPORT_DATE.SUBMITTED]: {
                            label: 'Data trimiterii',
                            description: 'Data la care raportul a fost trimis pentru aprobare.',
                        },
                    },
                },
                expense: 'Cheltuial\u0103',
                reimbursableExpenses: 'Exporta\u021Bi cheltuielile rambursabile ca',
                nonReimbursableExpenses: 'Export\u0103 cheltuielile nerambursabile ca',
            },
            advanced: {
                autoSyncDescription: 'Sincronizeaz\u0103 NSQS \u0219i Expensify automat, \u00EEn fiecare zi. Export\u0103 raportul finalizat \u00EEn timp real',
                defaultApprovalAccount: 'NSQS implicit',
                approvalAccount: 'Cont de aprobare A/P',
                approvalAccountDescription:
                    'Alege\u021Bi contul \u00EEn care tranzac\u021Biile vor fi aprobate \u00EEn NSQS. Dac\u0103 sincroniza\u021Bi rapoartele rambursate, acesta este \u0219i contul \u00EEn care vor fi create pl\u0103\u021Bile facturilor.',
            },
        },
        intacct: {
            sageIntacctSetup: 'Configurare Sage Intacct',
            prerequisitesTitle: '\u00CEnainte de a te conecta...',
            downloadExpensifyPackage: 'Desc\u0103rca\u021Bi pachetul Expensify pentru Sage Intacct',
            followSteps: 'Urma\u021Bi pa\u0219ii din instruc\u021Biunile noastre Cum s\u0103: Conecta\u021Bi-v\u0103 la Sage Intacct',
            enterCredentials: 'Introduce\u021Bi datele dvs. de autentificare Sage Intacct',
            entity: 'Entitate',
            employeeDefault: 'Angajatul implicit Sage Intacct',
            employeeDefaultDescription: 'Departamentul implicit al angajatului va fi aplicat cheltuielilor acestuia \u00EEn Sage Intacct, dac\u0103 exist\u0103 unul.',
            displayedAsTagDescription: 'Departamentul va fi selectabil pentru fiecare cheltuial\u0103 individual\u0103 din raportul unui angajat.',
            displayedAsReportFieldDescription: 'Selec\u021Bia departamentului se va aplica tuturor cheltuielilor din raportul unui angajat.',
            toggleImportTitleFirstPart: 'Alege\u021Bi cum s\u0103 gestiona\u021Bi Sage Intacct',
            toggleImportTitleSecondPart: '\u00EEn Expensify.',
            expenseTypes: 'Tipuri de cheltuieli',
            expenseTypesDescription: 'Tipurile dvs. de cheltuieli Sage Intacct se vor importa \u00EEn Expensify ca categorii.',
            importTaxDescription: 'Importa\u021Bi rata taxei de achizi\u021Bie din Sage Intacct.',
            userDefinedDimensions: 'Dimensiuni definite de utilizator',
            addUserDefinedDimension: 'Adaug\u0103 dimensiune definit\u0103 de utilizator',
            integrationName: 'Numele integr\u0103rii',
            dimensionExists: 'O dimensiune cu acest nume exist\u0103 deja.',
            removeDimension: 'Elimina\u021Bi dimensiunea definit\u0103 de utilizator',
            removeDimensionPrompt: 'E\u0219ti sigur c\u0103 vrei s\u0103 elimini aceast\u0103 dimensiune definit\u0103 de utilizator?',
            userDefinedDimension: 'Dimensiune definit\u0103 de utilizator',
            addAUserDefinedDimension: 'Adaug\u0103 o dimensiune definit\u0103 de utilizator',
            detailedInstructionsLink: 'Vizualizeaz\u0103 instruc\u021Biuni detaliate',
            detailedInstructionsRestOfSentence: 'la ad\u0103ugarea dimensiunilor definite de utilizator.',
            userDimensionsAdded: () => ({
                one: '1 UDD ad\u0103ugat',
                other: (count: number) => `${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'departamente';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'clase';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'locatii';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clien\u021Bi';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'proiecte (locuri de munc\u0103)';
                    default:
                        return 'map\u0103ri';
                }
            },
        },
        multiConnectionSelector: {
            title: ({connectionName}: ConnectionNameParams) => `Configurarea ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            description: ({connectionName}: ConnectionNameParams) => `Selecta\u021Bi versiunea dvs. ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} pentru a continua.`,
        },
        type: {
            free: 'Gratuit',
            control: 'Control',
            collect: 'Colecteaz\u0103',
        },
        companyCards: {
            addCards: 'Adaug\u0103 c\u0103r\u021Bi',
            selectCards: 'Selecteaz\u0103 c\u0103r\u021Bi',
            addNewCard: {
                other: 'Alte',
                cardProviders: {
                    gl1025: 'Carduri Corporate American Express',
                    cdf: 'Carduri Comerciale Mastercard',
                    vcf: 'Carduri Comerciale Visa',
                    stripe: 'Carduri Stripe',
                },
                yourCardProvider: `Who's your card provider?`,
                whoIsYourBankAccount: 'Care este banca ta?',
                howDoYouWantToConnect: 'Cum dori\u021Bi s\u0103 v\u0103 conecta\u021Bi la banca dvs?',
                learnMoreAboutOptions: {
                    text: 'Afla\u021Bi mai multe despre acestea',
                    linkText: 'op\u021Biuni.',
                },
                commercialFeedDetails:
                    'Necesit\u0103 configurare cu banca ta. Aceasta este utilizat\u0103 \u00EEn mod tipic de c\u0103tre companiile mai mari \u0219i este adesea cea mai bun\u0103 op\u021Biune dac\u0103 te califici.',
                directFeedDetails:
                    'Abordarea cea mai simpl\u0103. Conecteaz\u0103-te imediat folosind datele tale de autentificare principale. Aceast\u0103 metod\u0103 este cea mai comun\u0103.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Activeaz\u0103 fluxul t\u0103u ${provider}`,
                    heading:
                        'Avem o integrare direct\u0103 cu emitentul dvs. de card \u0219i putem importa datele tranzac\u021Biilor dvs. \u00EEn Expensify rapid \u0219i precis.\n\nPentru a \u00EEncepe, pur \u0219i simplu:',
                    visa: 'Avem integr\u0103ri globale cu Visa, de\u0219i eligibilitatea variaz\u0103 \u00EEn func\u021Bie de banc\u0103 \u0219i programul de carduri.\n\nPentru a \u00EEncepe, pur \u0219i simplu:',
                    mastercard:
                        'Avem integr\u0103ri globale cu Mastercard, de\u0219i eligibilitatea variaz\u0103 \u00EEn func\u021Bie de banc\u0103 \u0219i programul cardului.\n\nPentru a \u00EEncepe, pur \u0219i simplu:',
                    vcf: `1. Vizita\u021Bi [acest articol de ajutor](${CONST.COMPANY_CARDS_HELP}) pentru instruc\u021Biuni detaliate despre cum s\u0103 v\u0103 configura\u021Bi Cardurile Comerciale Visa.\n\n2. [Contacta\u021Bi-v\u0103 banca](${CONST.COMPANY_CARDS_HELP}) pentru a verifica dac\u0103 aceasta suport\u0103 un flux comercial pentru programul dvs. \u0219i solicita\u021Bi-le s\u0103 \u00EEl activeze.\n\n3. *Odat\u0103 ce fluxul este activat \u0219i ave\u021Bi detaliile acestuia, continua\u021Bi la ecranul urm\u0103tor.*`,
                    gl1025: `1. Vizita\u021Bi [acest articol de ajutor](${CONST.COMPANY_CARDS_HELP}) pentru a afla dac\u0103 American Express poate activa un flux comercial pentru programul dvs.\n\n2. Odat\u0103 ce fluxul este activat, Amex v\u0103 va trimite o scrisoare de produc\u021Bie.\n\n3. *Odat\u0103 ce ave\u021Bi informa\u021Biile despre flux, continua\u021Bi la ecranul urm\u0103tor.*`,
                    cdf: `1. Vizita\u021Bi [acest articol de ajutor](${CONST.COMPANY_CARDS_HELP}) pentru instruc\u021Biuni detaliate despre cum s\u0103 configura\u021Bi Cardurile Comerciale Mastercard.\n\n2. [Contacta\u021Bi-v\u0103 banca](${CONST.COMPANY_CARDS_HELP}) pentru a verifica dac\u0103 suport\u0103 un flux comercial pentru programul dvs. \u0219i cere\u021Bi-le s\u0103 \u00EEl activeze.\n\n3. *Odat\u0103 ce fluxul este activat \u0219i ave\u021Bi detaliile acestuia, continua\u021Bi la ecranul urm\u0103tor.*`,
                    stripe: `1. Vizita\u021Bi Dashboard-ul Stripe \u0219i merge\u021Bi la [Set\u0103ri](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Sub Integr\u0103ri Produs, face\u021Bi clic pe Activare l\u00E2ng\u0103 Expensify.\n\n3. Odat\u0103 ce fluxul este activat, face\u021Bi clic pe Trimitere mai jos \u0219i vom lucra la ad\u0103ugarea acestuia.`,
                },
                whatBankIssuesCard: 'Ce banc\u0103 emite aceste carduri?',
                enterNameOfBank: 'Introduce\u021Bi numele b\u0103ncii',
                feedDetails: {
                    vcf: {
                        title: 'Care sunt detaliile fluxului Visa?',
                        processorLabel: 'ID procesor',
                        bankLabel: 'ID-ul institu\u021Biei financiare (banc\u0103)',
                        companyLabel: 'ID-ul companiei',
                        helpLabel: 'Unde pot g\u0103si aceste ID-uri?',
                    },
                    gl1025: {
                        title: `What's the Amex delivery file name?`,
                        fileNameLabel: 'Numele fi\u0219ierului de livrare',
                        helpLabel: 'Unde g\u0103sesc numele fi\u0219ierului de livrare?',
                    },
                    cdf: {
                        title: `What's the Mastercard distribution ID?`,
                        distributionLabel: 'ID de distribu\u021Bie',
                        helpLabel: 'Unde g\u0103sesc ID-ul de distribu\u021Bie?',
                    },
                },
                amexCorporate: 'Selecteaz\u0103 aceasta dac\u0103 partea din fa\u021B\u0103 a c\u0103r\u021Bilor tale spune "Corporativ"',
                amexBusiness: 'Selecta\u021Bi acest lucru dac\u0103 partea din fa\u021B\u0103 a c\u0103r\u021Bilor dvs. spune "Afaceri"',
                amexPersonal: 'Selecteaz\u0103 aceasta dac\u0103 cardurile tale sunt personale',
                error: {
                    pleaseSelectProvider: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un furnizor de carduri \u00EEnainte de a continua.',
                    pleaseSelectBankAccount: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un cont bancar \u00EEnainte de a continua.',
                    pleaseSelectBank: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi o banc\u0103 \u00EEnainte de a continua.',
                    pleaseSelectFeedType: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un tip de flux \u00EEnainte de a continua.',
                },
            },
            assignCard: 'Atribui\u021Bi cardul',
            cardNumber: 'Num\u0103rul cardului',
            commercialFeed: 'Hran\u0103 comercial\u0103',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `Carduri ${feedName}`,
            directFeed: 'Alimentare direct\u0103',
            whoNeedsCardAssigned: 'Cine are nevoie de o carte atribuit\u0103?',
            chooseCard: 'Alege un card',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Alege\u021Bi un card pentru ${assignee} din fluxul de carduri ${feed}.`,
            noActiveCards: 'Nu exist\u0103 carduri active pe acest flux',
            somethingMightBeBroken: 'Sau ceva ar putea fi stricat. Oricum, dac\u0103 ave\u021Bi \u00EEntreb\u0103ri, doar',
            contactConcierge: 'contacteaz\u0103 Concierge',
            chooseTransactionStartDate: 'Alege\u021Bi o dat\u0103 de \u00EEnceput pentru tranzac\u021Bie',
            startDateDescription:
                'Vom importa toate tranzac\u021Biile de la aceast\u0103 dat\u0103 \u00EEnainte. Dac\u0103 nu este specificat\u0103 nicio dat\u0103, vom merge c\u00E2t de departe permite banca ta.',
            fromTheBeginning: 'De la \u00EEnceput',
            customStartDate: 'Data de \u00EEncepere personalizat\u0103',
            letsDoubleCheck: 'S\u0103 ne asigur\u0103m \u00EEnc\u0103 o dat\u0103 c\u0103 totul arat\u0103 corect.',
            confirmationDescription: 'Vom \u00EEncepe imediat importarea tranzac\u021Biilor.',
            cardholder: 'De\u021Bin\u0103tor de card',
            card: 'Carte',
            cardName: 'Numele cardului',
            brokenConnectionErrorFirstPart: `Card feed connection is broken. Please `,
            brokenConnectionErrorLink: 'conecteaz\u0103-te la banca ta',
            brokenConnectionErrorSecondPart: 'astfel \u00EEnc\u00E2t s\u0103 putem stabili din nou conexiunea.',
            assignedCard: ({assignee, link}: AssignedCardParams) =>
                `i-a atribuit lui ${assignee} un ${link}! Tranzac\u021Biile importate vor ap\u0103rea \u00EEn aceast\u0103 conversa\u021Bie.`,
            companyCard: 'cardul companiei',
            chooseCardFeed: 'Alege\u021Bi fluxul de carduri',
        },
        expensifyCard: {
            issueAndManageCards: 'Emitere \u0219i gestionare a cardurilor tale Expensify',
            getStartedIssuing: '\u00CEncepe\u021Bi prin emiterea primului dvs. card virtual sau fizic.',
            verificationInProgress: 'Verificare \u00EEn curs...',
            verifyingTheDetails: 'Verific\u0103m c\u00E2teva detalii. Concierge v\u0103 va anun\u021Ba c\u00E2nd Cardurile Expensify sunt gata de eliberare.',
            disclaimer:
                'Cardul comercial Expensify Visa\u00AE este emis de The Bancorp Bank, N.A., Membru FDIC, \u00EEn conformitate cu o licen\u021B\u0103 de la Visa U.S.A. Inc. \u0219i este posibil s\u0103 nu fie acceptat de to\u021Bi comercian\u021Bii care accept\u0103 carduri Visa. Apple\u00AE \u0219i logo-ul Apple\u00AE sunt m\u0103rci comerciale ale Apple Inc., \u00EEnregistrate \u00EEn S.U.A. \u0219i \u00EEn alte \u021B\u0103ri. App Store este o marc\u0103 de serviciu a Apple Inc. Google Play \u0219i logo-ul Google Play sunt m\u0103rci comerciale ale Google LLC.',
            issueCard: 'Elibereaz\u0103 cardul',
            newCard: 'Carte nou\u0103',
            name: 'Nume',
            lastFour: 'Ultimele 4',
            limit: 'Limit\u0103',
            currentBalance: 'Sold curent',
            currentBalanceDescription: 'Soldul curent este suma tuturor tranzac\u021Biilor postate cu cardul Expensify care au avut loc de la ultima dat\u0103 de reglementare.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Balanta va fi stabilit\u0103 pe ${settlementDate}`,
            settleBalance: 'Achit\u0103 soldul',
            cardLimit: 'Limit\u0103 de card',
            remainingLimit: 'Limit\u0103 r\u0103mas\u0103',
            requestLimitIncrease: 'Cere cre\u0219terea limit\u0103',
            remainingLimitDescription:
                'Lu\u0103m \u00EEn considerare un num\u0103r de factori c\u00E2nd calcul\u0103m limita dvs. r\u0103mas\u0103: vechimea dvs. ca client, informa\u021Biile legate de afaceri pe care le-a\u021Bi furnizat la \u00EEnscriere \u0219i banii disponibili \u00EEn contul dvs. bancar de afaceri. Limita dvs. r\u0103mas\u0103 poate fluctua zilnic.',
            earnedCashback: 'Bani \u00EEnapoi',
            earnedCashbackDescription: 'Soldul de bani \u00EEnapoi se bazeaz\u0103 pe cheltuielile lunare stabilite cu Cardul Expensify din spa\u021Biul t\u0103u de lucru.',
            issueNewCard: 'Elibereaz\u0103 un card nou',
            finishSetup: 'Finalizeaz\u0103 configurarea',
            chooseBankAccount: 'Alege\u021Bi contul bancar',
            chooseExistingBank: 'Alege\u021Bi un cont bancar de afaceri existent pentru a pl\u0103ti soldul cardului Expensify, sau ad\u0103uga\u021Bi un cont bancar nou',
            accountEndingIn: 'Cont \u00EEncheiat \u00EEn',
            addNewBankAccount: 'Adaug\u0103 un cont bancar nou',
            settlementAccount: 'Cont de decontare',
            settlementAccountDescription: 'Alege\u021Bi un cont pentru a pl\u0103ti soldul cardului dvs. Expensify.',
            settlementAccountInfoPt1: 'Asigura\u021Bi-v\u0103 c\u0103 acest cont se potrive\u0219te cu al t\u0103u',
            settlementAccountInfoPt2: 'astfel \u00EEnc\u00E2t Reconcilierea Continu\u0103 s\u0103 func\u021Bioneze corect.',
            reconciliationAccount: 'Cont de reconciliere',
            settlementFrequency: 'Frecven\u021Ba de reglementare',
            settlementFrequencyDescription: 'Alege\u021Bi c\u00E2t de des ve\u021Bi pl\u0103ti soldul Cardului Expensify.',
            settlementFrequencyInfo:
                'Dac\u0103 dori\u021Bi s\u0103 trece\u021Bi la reglementarea lunar\u0103, va trebui s\u0103 v\u0103 conecta\u021Bi contul bancar prin Plaid \u0219i s\u0103 ave\u021Bi un istoric pozitiv al soldului pe 90 de zile.',
            frequency: {
                daily: 'Zilnic',
                monthly: 'Lunar',
            },
            cardDetails: 'Detalii ale cardului',
            virtual: 'Virtual',
            physical: 'Fizic',
            deactivate: 'Dezactiveaz\u0103 cardul',
            changeCardLimit: 'Schimb\u0103 limita cardului',
            changeLimit: 'Schimb\u0103 limita',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Dac\u0103 modifici limita acestei carduri la ${limit}, tranzac\u021Biile noi vor fi respinse p\u00E2n\u0103 c\u00E2nd aprobi mai multe cheltuieli pe card.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) =>
                `Dac\u0103 schimbi limita acestei c\u0103r\u021Bi la ${limit}, tranzac\u021Biile noi vor fi respinse p\u00E2n\u0103 luna viitoare.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Dac\u0103 schimbi limita acestei c\u0103r\u021Bi la ${limit}, tranzac\u021Biile noi vor fi respinse.`,
            changeCardLimitType: 'Schimb\u0103 tipul limit\u0103 al cardului',
            changeLimitType: 'Schimb\u0103 tipul de limit\u0103',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Dac\u0103 schimbi tipul de limit\u0103 al acestui card la Limit\u0103 Inteligent\u0103, tranzac\u021Biile noi vor fi refuzate deoarece limita neaprobat\u0103 de ${limit} a fost deja atins\u0103.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Dac\u0103 schimba\u021Bi tipul de limit\u0103 al acestui card la Lunar, tranzac\u021Biile noi vor fi respinse deoarece limita lunar\u0103 de ${limit} a fost deja atins\u0103.`,
            addShippingDetails: 'Adaug\u0103 detalii de livrare',
            issuedCard: ({assignee}: AssigneeParams) => `a emis ${assignee} un card Expensify! Cardul va ajunge \u00EEn 2-3 zile lucr\u0103toare.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `a emis ${assignee} un Card Expensify! Cardul va fi expediat odat\u0103 ce detaliile de livrare sunt ad\u0103ugate.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `a emis ${assignee} un ${link} virtual! Cardul poate fi folosit imediat.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            verifyingHeader: 'Verificare',
            bankAccountVerifiedHeader: 'Cont bancar verificat',
            verifyingBankAccount: 'Verificare cont bancar...',
            verifyingBankAccountDescription:
                'V\u0103 rug\u0103m s\u0103 a\u0219tepta\u021Bi \u00EEn timp ce confirm\u0103m c\u0103 acest cont poate fi folosit pentru a emite Carduri Expensify.',
            bankAccountVerified: 'Cont banc verificat!',
            bankAccountVerifiedDescription: 'Acum pute\u021Bi emite Carduri Expensify membrilor spa\u021Biului dvs. de lucru.',
            oneMoreStep: '\u00CEnc\u0103 un pas...',
            oneMoreStepDescription:
                'Se pare c\u0103 trebuie s\u0103 verific\u0103m manual contul t\u0103u bancar. Te rug\u0103m s\u0103 mergi la Concierge unde \u00EE\u021Bi a\u0219teapt\u0103 instruc\u021Biunile.',
            gotIt: 'Am \u00EEn\u021Beles',
            goToConcierge: 'Mergi la Concierge',
        },
        categories: {
            deleteCategories: '\u0218terge categoriile',
            deleteCategoriesPrompt: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceste categorii?',
            deleteCategory: '\u0218terge categoria',
            deleteCategoryPrompt: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 categorie?',
            disableCategories: 'Dezactiveaz\u0103 categoriile',
            disableCategory: 'Dezactiveaz\u0103 categoria',
            enableCategories: 'Activeaz\u0103 categoriile',
            enableCategory: 'Activeaz\u0103 categoria',
            defaultSpendCategories: 'Categorii de cheltuieli implicite',
            spendCategoriesDescription:
                'Personalizeaz\u0103 modul \u00EEn care cheltuielile comerciantului sunt categorisite pentru tranzac\u021Biile cu cardul de credit \u0219i chitan\u021Bele scanate.',
            deleteFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul \u0219tergerii categoriei, v\u0103 rug\u0103m \u00EEncerca\u021Bi din nou.',
            categoryName: 'Numele categoriei',
            requiresCategory: 'Membrii trebuie s\u0103 categorizeze toate cheltuielile',
            needCategoryForExportToIntegration: 'Este necesar\u0103 o categorie pentru fiecare cheltuial\u0103 pentru a exporta c\u0103tre',
            subtitle:
                'Ob\u021Bine\u021Bi o imagine de ansamblu mai bun\u0103 despre unde se cheltuie banii. Utiliza\u021Bi categoriile noastre prestabilite sau ad\u0103uga\u021Bi propriile categorii.',
            emptyCategories: {
                title: 'Nu ai creat nicio categorie',
                subtitle: 'Ad\u0103uga\u021Bi o categorie pentru a v\u0103 organiza cheltuielile.',
            },
            updateFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul actualiz\u0103rii categoriei, v\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            createFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul cre\u0103rii categoriei, v\u0103 rug\u0103m \u00EEncerca\u021Bi din nou.',
            addCategory: 'Adaug\u0103 categorie',
            editCategory: 'Editeaz\u0103 categoria',
            editCategories: 'Editeaz\u0103 categoriile',
            categoryRequiredError: 'Numele categoriei este necesar.',
            existingCategoryError: 'O categorie cu acest nume exist\u0103 deja.',
            invalidCategoryName: 'Nume de categorie invalid.',
            importedFromAccountingSoftware: 'Categoriile de mai jos sunt importate din contul t\u0103u',
            payrollCode: 'Codul de salarizare',
            updatePayrollCodeFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul actualiz\u0103rii codului de salarizare, v\u0103 rug\u0103m \u00EEncerca\u021Bi din nou.',
            glCode: 'Cod GL',
            updateGLCodeFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul actualiz\u0103rii codului GL, v\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            importCategories: 'Import\u0103 categorii',
        },
        moreFeatures: {
            subtitle:
                'Utiliza\u021Bi \u00EEntrerup\u0103toarele de mai jos pentru a activa mai multe func\u021Bii pe m\u0103sur\u0103 ce cre\u0219te\u021Bi. Fiecare func\u021Bie va ap\u0103rea \u00EEn meniul de navigare pentru personalizare ulterioar\u0103.',
            spendSection: {
                title: 'Cheltuie',
                subtitle: 'Activa\u021Bi func\u021Bionalitatea care v\u0103 ajut\u0103 s\u0103 v\u0103 extinde\u021Bi echipa.',
            },
            manageSection: {
                title: 'Administreaz\u0103',
                subtitle: 'Ad\u0103uga\u021Bi controale care ajut\u0103 la men\u021Binerea cheltuielilor \u00EEn cadrul bugetului.',
            },
            earnSection: {
                title: 'C\u00E2\u0219tig\u0103',
                subtitle: 'Eficientizeaz\u0103-\u021Bi veniturile \u0219i fii pl\u0103tit mai repede.',
            },
            organizeSection: {
                title: 'Organizeaz\u0103',
                subtitle: 'Grup \u0219i analizeaz\u0103 cheltuielile, \u00EEnregistreaz\u0103 fiecare tax\u0103 pl\u0103tit\u0103.',
            },
            integrateSection: {
                title: 'Integreaz\u0103',
                subtitle: 'Conecteaz\u0103 Expensify la produsele financiare populare.',
            },
            distanceRates: {
                title: 'Tarife de distan\u021B\u0103',
                subtitle: 'Adaug\u0103, actualizeaz\u0103 \u0219i impune tarife.',
            },
            perDiem: {
                title: 'Pe zi',
                subtitle: 'Seteaz\u0103 tarifele Per diem pentru a controla cheltuielile zilnice ale angaja\u021Bilor.',
            },
            expensifyCard: {
                title: 'Cardul Expensify',
                subtitle: 'Ob\u021Bine\u021Bi informa\u021Bii \u0219i control asupra cheltuielilor.',
                disableCardTitle: 'Dezactiveaz\u0103 Cardul Expensify',
                disableCardPrompt: 'Nu pute\u021Bi dezactiva Cardul Expensify deoarece este deja \u00EEn uz. Contacta\u021Bi Concierge pentru urm\u0103torii pa\u0219i.',
                disableCardButton: 'Discut\u0103 cu Concierge',
                feed: {
                    title: 'Ob\u021Bine\u021Bi cardul Expensify',
                    subTitle: 'Eficientizeaz\u0103-\u021Bi cheltuielile de afaceri \u0219i economise\u0219te p\u00E2n\u0103 la 50% la factura ta Expensify, plus:',
                    features: {
                        cashBack: 'Bani \u00EEnapoi la fiecare achizi\u021Bie din SUA',
                        unlimited: 'Carduri virtuale nelimitate',
                        spend: 'Controlul cheltuielilor \u0219i limite personalizate',
                    },
                    ctaTitle: 'Elibereaz\u0103 un card nou',
                },
            },
            companyCards: {
                title: 'Carduri de companie',
                subtitle: 'Importa\u021Bi cheltuielile de pe cardurile existente ale companiei.',
                feed: {
                    title: 'Import\u0103 cardurile companiei',
                    features: {
                        support: 'Suport pentru to\u021Bi furnizorii majori de carduri',
                        assignCards: 'Atribui\u021Bi c\u0103r\u021Bi \u00EEntregii echipe',
                        automaticImport: 'Import automat de tranzac\u021Bii',
                    },
                },
                disableCardTitle: 'Dezactiveaz\u0103 cardurile companiei',
                disableCardPrompt:
                    'Nu pute\u021Bi dezactiva cardurile companiei deoarece aceast\u0103 func\u021Bie este \u00EEn uz. Lua\u021Bi leg\u0103tura cu Concierge pentru urm\u0103torii pa\u0219i.',
                disableCardButton: 'Discut\u0103 cu Concierge',
                cardDetails: 'Detalii ale cardului',
                cardNumber: 'Num\u0103rul cardului',
                cardholder: 'De\u021Bin\u0103tor de card',
                cardName: 'Numele cardului',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `exportul ${integration} ${type.toLowerCase()}` : `${integration} export`),
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) => `Alege\u021Bi contul ${integration} unde ar trebui exportate tranzac\u021Biile.`,
                integrationExportTitlePart: 'Selecteaz\u0103 unul diferit',
                integrationExportTitleLinkPart: 'exporta\u021Bi op\u021Biunea',
                integrationExportTitleSecondPart: 'pentru a schimba conturile disponibile.',
                lastUpdated: 'Ultima actualizare',
                transactionStartDate: 'Data de \u00EEncepere a tranzac\u021Biei',
                updateCard: 'Actualizeaz\u0103 cardul',
                unassignCard: 'Dezasocia\u021Bi cardul',
                unassign: 'Dezasocia\u021Bi',
                unassignCardDescription: 'Dezasocierea acestui card va elimina toate tranzac\u021Biile de pe rapoartele de proiect din contul titularului de card.',
                assignCard: 'Atribui\u021Bi cardul',
                cardFeedName: 'Numele fluxului de carduri',
                cardFeedNameDescription: 'D\u0103 un nume unic fluxului de carduri pentru a-l putea deosebi de celelalte.',
                cardFeedTransaction: '\u0218terge tranzac\u021Biile',
                cardFeedTransactionDescription: 'Alege\u021Bi dac\u0103 titularii de carduri pot \u0219terge tranzac\u021Biile cu cardul. Tranzac\u021Biile noi vor urma aceste reguli.',
                cardFeedRestrictDeletingTransaction: 'Restric\u021Bioneaz\u0103 \u0219tergerea tranzac\u021Biilor',
                cardFeedAllowDeletingTransaction: 'Permite \u0219tergerea tranzac\u021Biilor',
                removeCardFeed: 'Elimina\u021Bi fluxul de carduri',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `\u0218terge fluxul ${feedName}`,
                removeCardFeedDescription: 'E\u0219ti sigur c\u0103 vrei s\u0103 elimini acest flux de c\u0103r\u021Bi? Acest lucru va dezaloca toate c\u0103r\u021Bile.',
                error: {
                    feedNameRequired: 'Numele fluxului de carduri este necesar.',
                },
                corporate: 'Restric\u021Bioneaz\u0103 \u0219tergerea tranzac\u021Biilor',
                personal: 'Permite \u0219tergerea tranzac\u021Biilor',
                setFeedNameDescription: 'D\u0103 un nume unic fluxului de carduri pentru a-l putea deosebi de celelalte.',
                setTransactionLiabilityDescription:
                    'C\u00E2nd este activat\u0103, titularii de card pot \u0219terge tranzac\u021Biile cu cardul. Tranzac\u021Biile noi vor urma aceast\u0103 regul\u0103.',
                emptyAddedFeedTitle: 'Atribui\u021Bi carduri de companie',
                emptyAddedFeedDescription: '\u00CEncepe\u021Bi prin a atribui primul dvs. card unui membru.',
                pendingFeedTitle: `We're reviewing your request...`,
                pendingFeedDescription: `We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: 'Verifica\u021Bi fereastra browserului dvs.',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `V\u0103 rug\u0103m s\u0103 v\u0103 conecta\u021Bi la ${bankName} prin fereastra browserului dvs. care tocmai s-a deschis. Dac\u0103 nu s-a deschis una,`,
                pendingBankLink: 'v\u0103 rug\u0103m s\u0103 face\u021Bi clic aici.',
                giveItNameInstruction: 'D\u0103-i c\u0103r\u021Bii un nume care s\u0103 o deosebeasc\u0103 de celelalte.',
                updating: 'Actualizare...',
                noAccountsFound: 'Nu au fost g\u0103site conturi',
                defaultCard: 'Carte implicit\u0103',
                noAccountsFoundDescription: ({connection}: ConnectionParams) =>
                    `V\u0103 rug\u0103m s\u0103 ad\u0103uga\u021Bi contul \u00EEn ${connection} \u0219i s\u0103 sincroniza\u021Bi din nou conexiunea.`,
            },
            workflows: {
                title: 'Fluxuri de lucru',
                subtitle: 'Configura\u021Bi modul \u00EEn care cheltuielile sunt aprobate \u0219i pl\u0103tite.',
            },
            invoices: {
                title: 'Facturi',
                subtitle: 'Trimite \u0219i prime\u0219te facturi.',
            },
            categories: {
                title: 'Categorii',
                subtitle: 'Urm\u0103re\u0219te \u0219i organizeaz\u0103 cheltuielile.',
            },
            tags: {
                title: 'Etichete',
                subtitle: 'Clasifica\u021Bi costurile \u0219i urm\u0103ri\u021Bi cheltuielile facturabile.',
            },
            taxes: {
                title: 'Impozite',
                subtitle: 'Documenteaz\u0103 \u0219i recupereaz\u0103 taxele eligibile.',
            },
            reportFields: {
                title: 'C\u00E2mpuri de raportare',
                subtitle: 'Seteaz\u0103 c\u00E2mpuri personalizate pentru cheltuieli.',
            },
            connections: {
                title: 'Contabilitate',
                subtitle: 'Sincronizeaz\u0103-\u021Bi contul de rezultate \u0219i multe altele.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nu a\u0219a de repede...',
                featureEnabledText: 'Pentru a activa sau dezactiva aceast\u0103 func\u021Bie, va trebui s\u0103 modifica\u021Bi set\u0103rile de import contabil.',
                disconnectText: 'Pentru a dezactiva contabilitatea, va trebui s\u0103 deconecta\u021Bi conexiunea dvs. de contabilitate de la spa\u021Biul dvs. de lucru.',
                manageSettings: 'Gestioneaz\u0103 set\u0103rile',
            },
            rules: {
                title: 'Reguli',
                subtitle: 'Solicita\u021Bi chitan\u021Be, semnala\u021Bi cheltuieli mari \u0219i multe altele.',
            },
        },
        reportFields: {
            addField: 'Adaug\u0103 c\u00E2mp',
            delete: '\u0218terge c\u00E2mpul',
            deleteFields: '\u0218terge c\u00E2mpurile',
            deleteConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi acest c\u00E2mp de raport?',
            deleteFieldsConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceste c\u00E2mpuri de raport?',
            emptyReportFields: {
                title: 'Nu a\u021Bi creat niciun c\u00E2mp de raport',
                subtitle: 'Ad\u0103uga\u021Bi un c\u00E2mp personalizat (text, dat\u0103 sau meniu derulant) care apare \u00EEn rapoarte.',
            },
            subtitle: 'C\u00E2mpurile de raport se aplic\u0103 la toate cheltuielile \u0219i pot fi utile c\u00E2nd dori\u021Bi s\u0103 solicita\u021Bi informa\u021Bii suplimentare.',
            disableReportFields: 'Dezactiveaz\u0103 c\u00E2mpurile raportului',
            disableReportFieldsConfirmation: 'E\u0219ti sigur? C\u00E2mpurile de text \u0219i date vor fi \u0219terse, iar listele vor fi dezactivate.',
            importedFromAccountingSoftware: 'C\u00E2mpurile de raport de mai jos sunt importate din contul t\u0103u',
            textType: 'Text',
            dateType: 'Data',
            dropdownType: 'List\u0103',
            textAlternateText: 'Adaug\u0103 un c\u00E2mp pentru introducerea textului liber.',
            dateAlternateText: 'Ad\u0103uga\u021Bi un calendar pentru selectarea datei.',
            dropdownAlternateText: 'Adaug\u0103 o list\u0103 de op\u021Biuni din care s\u0103 alegi.',
            nameInputSubtitle: 'Alege\u021Bi un nume pentru c\u00E2mpul raportului.',
            typeInputSubtitle: 'Alege\u021Bi ce tip de c\u00E2mp de raport s\u0103 utiliza\u021Bi.',
            initialValueInputSubtitle: 'Introduce\u021Bi o valoare de \u00EEnceput pentru a fi afi\u0219at\u0103 \u00EEn c\u00E2mpul raportului.',
            listValuesInputSubtitle: 'Aceste valori vor ap\u0103rea \u00EEn meniul derulant al c\u00E2mpului raportului t\u0103u. Valorile activate pot fi selectate de membri.',
            listInputSubtitle: 'Aceste valori vor ap\u0103rea \u00EEn lista de c\u00E2mpuri a raportului t\u0103u. Valorile activate pot fi selectate de membri.',
            deleteValue: '\u0218terge valoarea',
            deleteValues: '\u0218terge valorile',
            disableValue: 'Dezactiveaz\u0103 valoarea',
            disableValues: 'Dezactiveaz\u0103 valorile',
            enableValue: 'Activeaz\u0103 valoarea',
            enableValues: 'Activeaz\u0103 valorile',
            emptyReportFieldsValues: {
                title: 'Nu ai creat nicio valoare de list\u0103',
                subtitle: 'Adaug\u0103 valori personalizate pentru a ap\u0103rea \u00EEn rapoarte.',
            },
            deleteValuePrompt: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 valoare din list\u0103?',
            deleteValuesPrompt: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceste valori din list\u0103?',
            listValueRequiredError: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un nume pentru valoarea listei',
            existingListValueError: 'O valoare de list\u0103 cu acest nume exist\u0103 deja',
            editValue: 'Editeaz\u0103 valoarea',
            listValues: 'Listeaz\u0103 valorile',
            addValue: 'Adaug\u0103 valoare',
            existingReportFieldNameError: 'Un c\u00E2mp de raport cu acest nume exist\u0103 deja',
            reportFieldNameRequiredError: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un nume de c\u00E2mp pentru raport',
            reportFieldTypeRequiredError: 'V\u0103 rug\u0103m s\u0103 alege\u021Bi un tip de c\u00E2mp pentru raport',
            reportFieldInitialValueRequiredError: 'V\u0103 rug\u0103m s\u0103 alege\u021Bi o valoare ini\u021Bial\u0103 pentru c\u00E2mpul raportului',
            genericFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul actualiz\u0103rii c\u00E2mpului raportului. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        },
        tags: {
            tagName: 'Numele etichetei',
            requiresTag: 'Membrii trebuie s\u0103 eticheteze toate cheltuielile',
            trackBillable: 'Urm\u0103re\u0219te cheltuielile facturabile',
            customTagName: 'Nume personalizat pentru etichet\u0103',
            enableTag: 'Activeaz\u0103 eticheta',
            enableTags: 'Activeaz\u0103 etichetele',
            disableTag: 'Dezactiveaz\u0103 eticheta',
            disableTags: 'Dezactiveaz\u0103 etichetele',
            addTag: 'Adaug\u0103 etichet\u0103',
            editTag: 'Editeaz\u0103 eticheta',
            editTags: 'Editeaz\u0103 etichetele',
            subtitle: 'Tag-urile adaug\u0103 modalit\u0103\u021Bi mai detaliate de a clasifica costurile.',
            emptyTags: {
                title: 'Nu ai creat niciun tag',
                subtitle: 'Adaug\u0103 o etichet\u0103 pentru a urm\u0103ri proiecte, loca\u021Bii, departamente \u0219i multe altele.',
            },
            deleteTag: '\u0218terge eticheta',
            deleteTags: '\u0218terge etichetele',
            deleteTagConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 etichet\u0103?',
            deleteTagsConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceste etichete?',
            deleteFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul \u0219tergerii etichetei, v\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            tagRequiredError: 'Numele tag-ului este necesar.',
            existingTagError: 'Un tag cu acest nume exist\u0103 deja.',
            invalidTagNameError: 'Numele etichetei nu poate fi 0. V\u0103 rug\u0103m s\u0103 alege\u021Bi o valoare diferit\u0103.',
            genericFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul actualiz\u0103rii etichetei, v\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            importedFromAccountingSoftware: 'Tag-urile de mai jos sunt importate din contul t\u0103u',
            glCode: 'Cod GL',
            updateGLCodeFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul actualiz\u0103rii codului GL, v\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            tagRules: 'Reguli de etichetare',
            approverDescription: 'Aprobator',
            importTags: 'Import\u0103 etichete',
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Am g\u0103sit *${columnCounts} coloane* \u00EEn foaia ta de calcul. Selecteaz\u0103 *Nume* l\u00E2ng\u0103 coloana care con\u021Bine numele etichetelor. De asemenea, po\u021Bi selecta *Activat* l\u00E2ng\u0103 coloana care seteaz\u0103 starea etichetelor.`,
        },
        taxes: {
            subtitle: 'Ad\u0103uga\u021Bi nume de taxe, rate \u0219i seta\u021Bi valorile implicite.',
            addRate: 'Adaug\u0103 rat\u0103',
            workspaceDefault: 'Moneda implicit\u0103 a spa\u021Biului de lucru',
            foreignDefault: 'Implicit \u00EEn valut\u0103 str\u0103in\u0103',
            customTaxName: 'Nume personalizat pentru tax\u0103',
            value: 'Valoare',
            taxReclaimableOn: 'Taxa recuperabil\u0103 pe',
            taxRate: 'Rata impozitului',
            error: {
                taxRateAlreadyExists: 'Acest nume de impozit este deja \u00EEn uz.',
                taxCodeAlreadyExists: 'Acest cod fiscal este deja \u00EEn uz.',
                valuePercentageRange: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un procent valid \u00EEntre 0 \u0219i 100.',
                customNameRequired: 'Numele personalizat al taxei este necesar.',
                deleteFailureMessage:
                    'A ap\u0103rut o eroare \u00EEn timpul \u0219tergerii ratei de impozitare. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou sau s\u0103 cere\u021Bi ajutor de la Concierge.',
                updateFailureMessage:
                    'A ap\u0103rut o eroare \u00EEn timpul actualiz\u0103rii ratei de impozitare. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou sau s\u0103 cere\u021Bi ajutor de la Concierge.',
                createFailureMessage:
                    'A ap\u0103rut o eroare \u00EEn timpul cre\u0103rii ratei de impozitare. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou sau s\u0103 cere\u021Bi ajutorul Concierge.',
                updateTaxClaimableFailureMessage: 'Partea recuperabil\u0103 trebuie s\u0103 fie mai mic\u0103 dec\u00E2t suma ratei distan\u021Bei.',
            },
            deleteTaxConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 tax\u0103?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi ${taxAmount} taxe?`,
            actions: {
                delete: 'Rat\u0103 de \u0219tergere',
                deleteMultiple: '\u0218terge ratele',
                enable: 'Activeaz\u0103 rata',
                disable: 'Dezactiveaz\u0103 rata',
                enableTaxRates: () => ({
                    one: 'Activeaz\u0103 rata',
                    other: 'Activeaz\u0103 tarifele',
                }),
                disableTaxRates: () => ({
                    one: 'Dezactiveaz\u0103 rata',
                    other: 'Dezactiveaz\u0103 tarifele',
                }),
            },
            importedFromAccountingSoftware: 'Taxele de mai jos sunt importate din contul t\u0103u',
            taxCode: 'Cod fiscal',
            updateTaxCodeFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul actualiz\u0103rii codului fiscal, v\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        },
        emptyWorkspace: {
            title: 'Creeaz\u0103 un spa\u021Biu de lucru',
            subtitle:
                'Creeaz\u0103 un spa\u021Biu de lucru pentru a urm\u0103ri chitan\u021Bele, pentru a rambursa cheltuielile, a gestiona c\u0103l\u0103toriile, a trimite facturi \u0219i multe altele - toate la viteza unei conversa\u021Bii.',
            createAWorkspaceCTA: '\u00CEncepe\u021Bi',
            features: {
                trackAndCollect: 'Urm\u0103re\u0219te \u0219i colecteaz\u0103 chitan\u021Be',
                reimbursements: 'Ramburseaz\u0103 angaja\u021Bii',
                companyCards: 'Gestioneaz\u0103 cardurile companiei',
            },
            notFound: 'Nu a fost g\u0103sit niciun spa\u021Biu de lucru',
            description:
                'Camerele sunt un loc excelent pentru a discuta \u0219i a lucra cu mai multe persoane. Pentru a \u00EEncepe colaborarea, creeaz\u0103 sau al\u0103tur\u0103-te unui spa\u021Biu de lucru',
        },
        switcher: {
            headerTitle: 'Filtreaz\u0103 dup\u0103 spa\u021Biul de lucru',
            everythingSection: 'Totul',
            placeholder: 'G\u0103se\u0219te un spa\u021Biu de lucru',
        },
        new: {
            newWorkspace: 'Noul spa\u021Biu de lucru',
            getTheExpensifyCardAndMore: 'Ob\u021Bine\u021Bi cardul Expensify \u0219i mai mult',
            confirmWorkspace: 'Confirm\u0103 spa\u021Biul de lucru',
        },
        people: {
            genericFailureMessage: 'A ap\u0103rut o eroare la eliminarea unui membru din spa\u021Biul de lucru, v\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `E\u0219ti sigur c\u0103 vrei s\u0103 \u00EEnl\u0103turi pe ${memberName}?`,
                other: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u00EEnl\u0103turi ace\u0219ti membri?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Elimina\u021Bi membrul',
                other: 'Elimina\u021Bi membrii',
            }),
            removeWorkspaceMemberButtonTitle: 'Elimina\u021Bi din spa\u021Biul de lucru',
            removeGroupMemberButtonTitle: 'Elimina\u021Bi din grup',
            removeRoomMemberButtonTitle: 'Elimina\u021Bi din chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `E\u0219ti sigur c\u0103 vrei s\u0103 \u00EEnl\u0103turi pe ${memberName}?`,
            removeMemberTitle: 'Elimina\u021Bi membrul',
            transferOwner: 'Transfer proprietar',
            makeMember: 'F\u0103 face\u021Bi membru',
            makeAdmin: 'F\u0103 admin',
            makeAuditor: 'F\u0103 face\u021Bi auditor',
            selectAll: 'Selecteaz\u0103 tot',
            error: {
                genericAdd: 'A ap\u0103rut o problem\u0103 la ad\u0103ugarea acestui membru al spa\u021Biului de lucru.',
                cannotRemove: 'Nu te po\u021Bi elimina pe tine \u00EEnsu\u021Bi sau pe proprietarul spa\u021Biului de lucru.',
                genericRemove: 'A ap\u0103rut o problem\u0103 la eliminarea acelui membru al spa\u021Biului de lucru.',
            },
            addedWithPrimary: 'Unii membri au fost ad\u0103uga\u021Bi cu login-urile lor principale.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Ad\u0103ugat de autentificare secundar\u0103 ${secondaryLogin}.`,
            membersListTitle: 'Directorul tuturor membrilor spa\u021Biului de lucru.',
            importMembers: 'Importa\u021Bi membrii',
        },
        card: {
            getStartedIssuing: '\u00CEncepe\u021Bi prin emiterea primului dvs. card virtual sau fizic.',
            issueCard: 'Elibereaz\u0103 cardul',
            issueNewCard: {
                whoNeedsCard: 'Cine are nevoie de un card?',
                findMember: 'G\u0103se\u0219te membru',
                chooseCardType: 'Alege\u021Bi un tip de card',
                physicalCard: 'Card fizic',
                physicalCardDescription: 'Minunat pentru cel care cheltuie\u0219te frecvent',
                virtualCard: 'Card virtual',
                virtualCardDescription: 'Instant \u0219i flexibil',
                chooseLimitType: 'Alege un tip de limit\u0103',
                smartLimit: 'Limit\u0103 Inteligent\u0103',
                smartLimitDescription: 'Cheltui\u021Bi p\u00E2n\u0103 la o anumit\u0103 sum\u0103 \u00EEnainte de a necesita aprobare',
                monthly: 'Lunar',
                monthlyDescription: 'Cheltui\u021Bi p\u00E2n\u0103 la o anumit\u0103 sum\u0103 pe lun\u0103',
                fixedAmount: 'Sum\u0103 fix\u0103',
                fixedAmountDescription: 'Cheltui\u021Bi p\u00E2n\u0103 la o anumit\u0103 sum\u0103 o dat\u0103',
                setLimit: 'Seteaz\u0103 o limit\u0103',
                cardLimitError: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o sum\u0103 mai mic\u0103 de $21,474,836',
                giveItName: 'D\u0103-i un nume',
                giveItNameInstruction: 'F\u0103-o suficient de unic\u0103 pentru a o deosebi de alte c\u0103r\u021Bi. Cazurile de utilizare specifice sunt chiar mai bune!',
                cardName: 'Numele cardului',
                letsDoubleCheck: 'S\u0103 ne asigur\u0103m \u00EEnc\u0103 o dat\u0103 c\u0103 totul arat\u0103 corect.',
                willBeReady: 'Acest card va fi gata de utilizat imediat.',
                cardholder: 'De\u021Bin\u0103tor de card',
                cardType: 'Tip de card',
                limit: 'Limit\u0103',
                limitType: 'Tip limit\u0103',
                name: 'Nume',
            },
            deactivateCardModal: {
                deactivate: 'Dezactiveaz\u0103',
                deactivateCard: 'Dezactiveaz\u0103 cardul',
                deactivateConfirmation: 'Dezactivarea acestui card va refuza toate tranzac\u021Biile viitoare \u0219i nu poate fi anulat\u0103.',
            },
        },
        accounting: {
            settings: 'set\u0103ri',
            title: 'Conexiuni',
            subtitle:
                'Conecta\u021Bi-v\u0103 la sistemul dvs. de contabilitate pentru a codifica tranzac\u021Biile cu schema dvs. de conturi, pentru a potrivi automat pl\u0103\u021Bile \u0219i pentru a v\u0103 men\u021Bine finan\u021Bele sincronizate.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            nsqs: 'NSQS',
            intacct: 'Sage Intacct',
            talkYourOnboardingSpecialist: 'Discuta\u021Bi cu specialistul dvs. de configurare.',
            talkYourAccountManager: 'Discuta\u021Bi cu managerul dvs. de cont.',
            talkToConcierge: 'Discuta\u021Bi cu Concierge.',
            needAnotherAccounting: 'Ai nevoie de un alt software de contabilitate?',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.NSQS:
                        return 'NSQS';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return 'Sage Intacct';
                    default: {
                        return 'As a language model AI developed by OpenAI, I need the original text in order to provide the translation. Please provide the text you want to be translated.';
                    }
                }
            },
            errorODIntegration: 'Exist\u0103 o eroare cu o conexiune care a fost configurat\u0103 \u00EEn Expensify Classic.',
            goToODToFix: 'Mergi la Expensify Classic pentru a rezolva aceast\u0103 problem\u0103.',
            goToODToSettings: 'Mergi la Expensify Classic pentru a-\u021Bi gestiona set\u0103rile.',
            setup: 'Conecteaz\u0103',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Ultima sincronizare ${relativeDate}`,
            import: 'Import\u0103',
            export: 'Export\u0103',
            advanced: 'Avansat',
            other: 'Alte integr\u0103ri',
            syncNow: 'Sincronizeaz\u0103 acum',
            disconnect: 'Deconectare',
            reinstall: 'Reinstaleaz\u0103 conectorul',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integrare';
                return `Deconecteaz\u0103 ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Conecteaz\u0103 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integrarea contabilității'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Nu se poate conecta la QuickBooks Online.';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Nu se poate conecta la Xero.';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Nu se poate conecta la NetSuite.';
                    case CONST.POLICY.CONNECTIONS.NAME.NSQS:
                        return 'Nu se poate conecta la NSQS.';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Nu se poate conecta la QuickBooks Desktop.';
                    default: {
                        return 'Nu se poate conecta la integrare.';
                    }
                }
            },
            accounts: 'Diagrama conturilor',
            taxes: 'Impozite',
            imported: 'Importat',
            notImported: 'Nu a fost importat',
            importAsCategory: 'Importat ca \u0219i categorii',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importat',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Importat ca etichete',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importat',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Nu a fost importat',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Nu a fost importat',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Importat ca \u0219i c\u00E2mpuri de raport',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Angajat implicit NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'aceast\u0103 integrare';
                return `E\u0219ti sigur c\u0103 vrei s\u0103 deconectezi ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `E\u0219ti sigur c\u0103 vrei s\u0103 te conectezi la ${
                    CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'această integrare contabilă'
                }? Aceasta va elimina orice conexiuni contabile existente.`,
            enterCredentials: 'Introduce\u021Bi datele de autentificare',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importarea clien\u021Bilor';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importarea angaja\u021Bilor';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importarea conturilor';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importarea claselor';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importarea loca\u021Biilor';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Prelucrarea datelor importate';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Sincronizarea rapoartelor de rambursare \u0219i a pl\u0103\u021Bilor facturilor';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importarea codurilor fiscale';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Verificarea conexiunii QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importarea datelor QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importarea datelor Xero';
                        case 'startingImportQBO':
                            return 'Importarea datelor QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importarea datelor QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importarea titlului';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importarea certificatului aprobat';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importarea dimensiunilor';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importarea politicii de salvare';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '\u00CEnc\u0103 se sincronizeaz\u0103 datele cu QuickBooks... V\u0103 rug\u0103m s\u0103 v\u0103 asigura\u021Bi c\u0103 Web Connector este \u00EEn func\u021Biune';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Sincronizarea datelor QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '\u00CEnc\u0103rcare date';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Actualizarea categoriilor';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Actualizarea clien\u021Bilor/proiectelor';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Actualizarea listei de persoane';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Actualizarea c\u00E2mpurilor raportului';
                        case 'jobDone':
                            return 'A\u0219tept\u00E2nd \u00EEnc\u0103rcarea datelor importate';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Sincronizarea conturilor de grafic';
                        case 'xeroSyncImportCategories':
                            return 'Sincronizarea categoriilor';
                        case 'xeroSyncImportCustomers':
                            return 'Sincronizare clien\u021Bi';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Marcarea rapoartelor Expensify ca rambursate';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Marcarea facturilor \u0219i a facturilor Xero ca pl\u0103tite';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Sincronizarea categoriilor de urm\u0103rire';
                        case 'xeroSyncImportBankAccounts':
                            return 'Sincronizarea conturilor bancare';
                        case 'xeroSyncImportTaxRates':
                            return 'Sincronizarea ratelor de impozitare';
                        case 'xeroCheckConnection':
                            return 'Verificarea conexiunii Xero';
                        case 'xeroSyncTitle':
                            return 'Sincronizarea datelor Xero';
                        case 'netSuiteSyncConnection':
                            return 'Ini\u021Bializarea conexiunii la NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importarea clien\u021Bilor';
                        case 'netSuiteSyncInitData':
                            return 'Extragerea datelor din NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Taxe de import';
                        case 'netSuiteSyncImportItems':
                            return 'Importarea articolelor';
                        case 'netSuiteSyncData':
                            return 'Importarea datelor \u00EEn Expensify';
                        case 'netSuiteSyncAccounts':
                        case 'nsqsSyncAccounts':
                            return 'Sincronizarea conturilor';
                        case 'netSuiteSyncCurrencies':
                            return 'Sincronizarea monedelor';
                        case 'netSuiteSyncCategories':
                            return 'Sincronizarea categoriilor';
                        case 'netSuiteSyncReportFields':
                            return 'Importarea datelor ca \u0219i c\u00E2mpuri de raport Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importarea datelor ca etichete Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Actualizarea informa\u021Biilor de conexiune';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marcarea rapoartelor Expensify ca rambursate';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marcarea facturilor \u0219i a facturilor NetSuite ca fiind pl\u0103tite';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importarea furnizorilor';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importarea listelor personalizate';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importarea listelor personalizate';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importarea filialelor';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importarea furnizorilor';
                        case 'nsqsSyncConnection':
                            return 'Ini\u021Bializarea conexiunii la NSQS';
                        case 'nsqsSyncEmployees':
                            return 'Sincronizarea angaja\u021Bilor';
                        case 'nsqsSyncCustomers':
                            return 'Sincronizare clien\u021Bi';
                        case 'nsqsSyncProjects':
                            return 'Sincronizarea proiectelor';
                        case 'nsqsSyncCurrency':
                            return 'Sincronizarea monedei';
                        case 'intacctCheckConnection':
                            return 'Verificarea conexiunii Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importarea dimensiunilor Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importarea datelor Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Lipse\u0219te traducerea pentru etapa: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Exporter preferat',
            exportPreferredExporterNote:
                'Exporterul preferat poate fi orice administrator de spa\u021Biu de lucru, dar trebuie s\u0103 fie \u0219i un Administrator de Domeniu dac\u0103 a\u021Bi setat conturi de export diferite pentru cardurile de companie individuale \u00EEn Set\u0103rile de Domeniu.',
            exportPreferredExporterSubNote: 'Odat\u0103 setat, exportatorul preferat va vedea rapoartele pentru export \u00EEn contul lor.',
            exportAs: 'Export\u0103 ca',
            exportOutOfPocket: 'Export\u0103 cheltuielile personale ca',
            exportCompanyCard: 'Export\u0103 cheltuielile de pe cardul companiei ca',
            exportDate: 'Exporta\u021Bi data',
            defaultVendor: 'Furnizor implicit',
            autoSync: 'Auto-sincronizare',
            autoSyncDescription: 'Sincronizeaz\u0103 NetSuite \u0219i Expensify automat, \u00EEn fiecare zi. Export\u0103 raportul finalizat \u00EEn timp real',
            reimbursedReports: 'Sincronizeaz\u0103 rapoartele rambursate',
            cardReconciliation: 'Reconcilierea cardului',
            reconciliationAccount: 'Cont de reconciliere',
            continuousReconciliation: 'Reconciliere Continu\u0103',
            saveHoursOnReconciliation:
                'Economisi\u021Bi ore de reconciliere \u00EEn fiecare perioad\u0103 contabil\u0103 av\u00E2nd Expensify care reconciliaz\u0103 continuu declara\u021Biile \u0219i reglement\u0103rile cardului Expensify \u00EEn numele dvs.',
            enableContinuousReconciliation: 'Pentru a activa Reconcilierea Continu\u0103, v\u0103 rug\u0103m s\u0103 activa\u021Bi',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Alege\u021Bi contul bancar cu care se vor reconcilia pl\u0103\u021Bile dvs. cu cardul Expensify.',
                accountMatches: 'Asigura\u021Bi-v\u0103 c\u0103 acest cont se potrive\u0219te cu al t\u0103u',
                settlementAccount: 'Cont de reglementare a cardului Expensify',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) =>
                    `(se \u00EEncheie \u00EEn ${lastFourPAN}) astfel \u00EEnc\u00E2t Reconcilierea Continu\u0103 s\u0103 func\u021Bioneze corect.`,
            },
        },
        export: {
            notReadyHeading: 'Nu este gata pentru export',
            notReadyDescription:
                'Rapoartele de cheltuieli \u00EEn a\u0219teptare sau \u00EEn proiect nu pot fi exportate \u00EEn sistemul de contabilitate. V\u0103 rug\u0103m s\u0103 aproba\u021Bi sau s\u0103 pl\u0103ti\u021Bi aceste cheltuieli \u00EEnainte de a le exporta.',
        },
        invoices: {
            sendInvoice: 'Trimite factura',
            sendFrom: 'Trimite de la',
            invoicingDetails: 'Detalii de facturare',
            invoicingDetailsDescription: 'Aceste informa\u021Bii vor ap\u0103rea pe facturile dvs.',
            companyName: 'Numele companiei',
            companyWebsite: 'Website-ul companiei',
            paymentMethods: {
                personal: 'Personal',
                business: 'Afaceri',
                chooseInvoiceMethod: 'Alege\u021Bi o metod\u0103 de plat\u0103 de mai jos:',
                addBankAccount: 'Adaug\u0103 cont bancar',
                payingAsIndividual: 'Pl\u0103tind ca individ',
                payingAsBusiness: 'Plata ca o afacere',
            },
            invoiceBalance: 'Soldul facturii',
            invoiceBalanceSubtitle:
                'Acesta este soldul curent din \u00EEncasarea pl\u0103\u021Bilor facturilor. Se va transfera automat \u00EEn contul t\u0103u bancar dac\u0103 ai ad\u0103ugat unul.',
            bankAccountsSubtitle: 'Ad\u0103uga\u021Bi un cont bancar pentru a efectua \u0219i a primi pl\u0103\u021Bi de facturi.',
        },
        invite: {
            member: 'Invit\u0103 membru',
            members: 'Invit\u0103 membrii',
            invitePeople: 'Invit\u0103 membri noi',
            genericFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul invita\u021Biei membrului \u00EEn spa\u021Biul de lucru. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            pleaseEnterValidLogin: `V\u0103 rug\u0103m s\u0103 v\u0103 asigura\u021Bi c\u0103 adresa de e-mail sau num\u0103rul de telefon sunt valide (de exemplu, ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'utilizator',
            users: 'utilizatori',
            invited: 'invitat',
            removed: 'eliminat',
            to: "translate: \"E\u0219ti un traduc\u0103tor profesionist. Tradu textul urm\u0103tor \u00EEn ro. Acesta poate fi un \u0219ir simplu sau o func\u021Bie TypeScript care returneaz\u0103 un \u0219ir de \u0219abloane. P\u0103streaz\u0103 substituen\u021Bii ca ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} etc f\u0103r\u0103 a le modifica con\u021Binutul sau a elimina parantezele. Con\u021Binutul substituen\u021Bilor este descriptiv pentru ceea ce reprezint\u0103 \u00EEn fraz\u0103, dar poate include expresii ternare sau alt cod TypeScript.\"",
            from: 'Din',
        },
        inviteMessage: {
            confirmDetails: 'Confirma\u021Bi detaliile',
            inviteMessagePrompt: 'F\u0103-\u021Bi invita\u021Bia extra special\u0103 ad\u0103ug\u00E2nd un mesaj mai jos!',
            personalMessagePrompt: 'Mesaj',
            genericFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul invita\u021Biei membrului \u00EEn spa\u021Biul de lucru. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            inviteNoMembersError: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi cel pu\u021Bin un membru pentru a invita.',
        },
        distanceRates: {
            oopsNotSoFast: 'Oops! Nu at\u00E2t de repede...',
            workspaceNeeds: 'Un spa\u021Biu de lucru necesit\u0103 cel pu\u021Bin o rat\u0103 de distan\u021B\u0103 activat\u0103.',
            distance: 'Distan\u021B\u0103',
            centrallyManage: 'Gestioneaz\u0103 centralizat tarifele, urm\u0103re\u0219te \u00EEn mile sau kilometri \u0219i seteaz\u0103 o categorie implicit\u0103.',
            rate: 'Rat\u0103',
            addRate: 'Adaug\u0103 rat\u0103',
            trackTax: 'Urm\u0103re\u0219te taxele',
            deleteRates: () => ({
                one: 'Rat\u0103 de \u0219tergere',
                other: '\u0218terge ratele',
            }),
            enableRates: () => ({
                one: 'Activeaz\u0103 rata',
                other: 'Activeaz\u0103 tarifele',
            }),
            disableRates: () => ({
                one: 'Dezactiveaz\u0103 rata',
                other: 'Dezactiveaz\u0103 tarifele',
            }),
            enableRate: 'Activeaz\u0103 rata',
            status: 'Stare',
            unit: 'Unitate',
            taxFeatureNotEnabledMessage: 'Impozitele trebuie activate pe spa\u021Biul de lucru pentru a utiliza aceast\u0103 func\u021Bie. Mergi la',
            changePromptMessage: 'pentru a face acea schimbare.',
            deleteDistanceRate: '\u0218terge rata distan\u021Bei',
            areYouSureDelete: () => ({
                one: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 rat\u0103?',
                other: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceste rate?',
            }),
        },
        editor: {
            descriptionInputLabel: 'Descriere',
            nameInputLabel: 'Nume',
            typeInputLabel: 'The original text is missing. Please provide the text you want to translate.',
            initialValueInputLabel: 'Valoare ini\u021Bial\u0103',
            nameInputHelpText: 'Acesta este numele pe care \u00EEl vei vedea pe spa\u021Biul t\u0103u de lucru.',
            nameIsRequiredError: 'Va trebui s\u0103 \u00EEi da\u021Bi un nume spa\u021Biului dumneavoastr\u0103 de lucru.',
            currencyInputLabel: 'Moneda implicit\u0103',
            currencyInputHelpText: 'Toate cheltuielile din acest spa\u021Biu de lucru vor fi convertite \u00EEn aceast\u0103 moned\u0103.',
            currencyInputDisabledText: 'Moneda implicit\u0103 nu poate fi schimbat\u0103 deoarece acest spa\u021Biu de lucru este legat de un cont bancar \u00EEn USD.',
            save: 'Salveaz\u0103',
            genericFailureMessage: 'A ap\u0103rut o eroare \u00EEn timpul actualiz\u0103rii spa\u021Biului de lucru. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            avatarUploadFailureMessage: 'A ap\u0103rut o eroare la \u00EEnc\u0103rcarea avatarului. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
            addressContext:
                'Este necesar\u0103 o adres\u0103 de Workspace pentru a activa Expensify Travel. V\u0103 rug\u0103m s\u0103 introduce\u021Bi o adres\u0103 asociat\u0103 afacerii dumneavoastr\u0103.',
        },
        bankAccount: {
            continueWithSetup: 'Continua\u021Bi configurarea',
            youreAlmostDone:
                'Sunte\u021Bi aproape gata cu configurarea contului dvs. bancar, care v\u0103 va permite s\u0103 elibera\u021Bi carduri corporative, s\u0103 deconta\u021Bi cheltuieli, s\u0103 colecta\u021Bi facturi \u0219i s\u0103 pl\u0103ti\u021Bi facturi.',
            streamlinePayments: 'Simplifica\u021Bi pl\u0103\u021Bile',
            connectBankAccountNote: 'Not\u0103: Conturile bancare personale nu pot fi utilizate pentru pl\u0103\u021Bi \u00EEn spa\u021Biile de lucru.',
            oneMoreThing: '\u00CEnc\u0103 un lucru!',
            allSet: 'E\u0219ti preg\u0103tit!',
            accountDescriptionWithCards: 'Acest cont bancar va fi folosit pentru a emite carduri corporative, a rambursa cheltuieli, a colecta facturi \u0219i a pl\u0103ti facturi.',
            letsFinishInChat: 'S\u0103 termin\u0103m \u00EEn chat!',
            almostDone: 'Aproape gata!',
            disconnectBankAccount: 'Deconecteaz\u0103 contul bancar',
            noLetsStartOver: 'Nu, hai s\u0103 \u00EEncepem de la \u00EEnceput',
            startOver: '\u00CEncepe de la \u00EEnceput',
            yesDisconnectMyBankAccount: 'Da, deconecteaz\u0103 contul meu bancar',
            yesStartOver: 'Da, \u00EEncepe de la \u00EEnceput',
            disconnectYour: 'Deconecteaz\u0103-te',
            bankAccountAnyTransactions: 'cont bancar. Orice tranzac\u021Bii \u00EEn a\u0219teptare pentru acest cont vor fi totu\u0219i finalizate.',
            clearProgress: 'A \u00EEncepe de la cap\u0103t va \u0219terge progresul pe care l-ai f\u0103cut p\u00E2n\u0103 acum.',
            areYouSure: 'E\u0219ti sigur?',
            workspaceCurrency: 'Moneda spa\u021Biului de lucru',
            updateCurrencyPrompt:
                'Se pare c\u0103 spa\u021Biul t\u0103u de lucru este setat \u00EEn prezent pe o alt\u0103 moned\u0103 dec\u00E2t USD. Te rog s\u0103 ape\u0219i butonul de mai jos pentru a-\u021Bi actualiza moneda la USD acum.',
            updateToUSD: 'Actualizare la USD',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transfer proprietar',
            addPaymentCardTitle: 'Introduce\u021Bi cardul dvs. de plat\u0103 pentru a transfera proprietatea',
            addPaymentCardButtonText: 'Accepta\u021Bi termenii \u0219i ad\u0103uga\u021Bi cardul de plat\u0103',
            addPaymentCardReadAndAcceptTextPart1: 'Cite\u0219te \u0219i accept\u0103',
            addPaymentCardReadAndAcceptTextPart2: 'politica de a ad\u0103uga cardul t\u0103u',
            addPaymentCardTerms: 'termeni',
            addPaymentCardPrivacy: 'confiden\u021Bialitate',
            addPaymentCardAnd: "You didn't provide any text to translate. Could you please provide the text?",
            addPaymentCardPciCompliant: 'Conform cu PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Criptare la nivel de banc\u0103',
            addPaymentCardRedundant: 'Infrastructur\u0103 redundant\u0103',
            addPaymentCardLearnMore: 'Afla\u021Bi mai multe despre noi',
            addPaymentCardSecurity: 'securitate',
            amountOwedTitle: 'Sold remanent',
            amountOwedButtonText: "Since you didn't provide any text to translate, I can't assist you. Please provide the text you want translated.",
            amountOwedText:
                'Acest cont are un sold restant din luna anterioar\u0103.\n\nDori\u021Bi s\u0103 achita\u021Bi soldul \u0219i s\u0103 prelua\u021Bi facturarea acestui spa\u021Biu de lucru?',
            ownerOwesAmountTitle: 'Sold remanent',
            ownerOwesAmountButtonText: 'Transfera\u021Bi soldul',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `Contul care de\u021Bine acest spa\u021Biu de lucru (${email}) are un sold restant din luna anterioar\u0103.\n\nDori\u021Bi s\u0103 transfera\u021Bi aceast\u0103 sum\u0103 (${amount}) pentru a prelua facturarea pentru acest spa\u021Biu de lucru? Cardul dvs. de plat\u0103 va fi debitat imediat.`,
            subscriptionTitle: 'Preia abonamentul anual',
            subscriptionButtonText: 'Transfer\u0103 abonamentul',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Preluarea acestui spa\u021Biu de lucru va combina abonamentul s\u0103u anual cu abonamentul dvs. curent. Acest lucru va cre\u0219te dimensiunea abonamentului dvs. cu ${usersCount} membri, f\u0103c\u00E2nd ca noul dvs. abonament s\u0103 aib\u0103 dimensiunea de ${finalCount}. Dori\u021Bi s\u0103 continua\u021Bi?`,
            duplicateSubscriptionTitle: 'Alert\u0103 de abonament duplicat',
            duplicateSubscriptionButtonText:
                '\u00CEmi pare r\u0103u, dar nu a\u021Bi furnizat niciun text pentru a fi tradus. V\u0103 rug\u0103m s\u0103 furniza\u021Bi textul pe care dori\u021Bi s\u0103 \u00EEl traduc.',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Se pare c\u0103 \u00EEncerci s\u0103 preiei facturarea pentru spa\u021Biile de lucru ale ${email}, dar pentru a face asta, trebuie s\u0103 fii un administrator pe toate spa\u021Biile lor de lucru mai \u00EEnt\u00E2i.\n\nApas\u0103 "Continu\u0103" dac\u0103 vrei doar s\u0103 preiei facturarea pentru spa\u021Biul de lucru ${workspaceName}.\n\nDac\u0103 vrei s\u0103 preiei facturarea pentru \u00EEntregul lor abonament, te rug\u0103m s\u0103 \u00EEi rogi s\u0103 te adauge ca administrator pe toate spa\u021Biile lor de lucru \u00EEnainte de a prelua facturarea.`,
            hasFailedSettlementsTitle: 'Nu se poate transfera proprietatea',
            hasFailedSettlementsButtonText: 'Am \u00EEn\u021Beles',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Nu pute\u021Bi prelua facturarea deoarece ${email} are o plat\u0103 restant\u0103 pentru cardul Expensify. V\u0103 rug\u0103m s\u0103 \u00EEi cere\u021Bi s\u0103 contacteze concierge@expensify.com pentru a rezolva problema. Apoi, pute\u021Bi prelua facturarea pentru acest spa\u021Biu de lucru.`,
            failedToClearBalanceTitle: 'E\u0219ec la golirea soldului',
            failedToClearBalanceButtonText: "Since you didn't provide any text to translate, I can't assist you. Please provide the text you want translated.",
            failedToClearBalanceText: 'Nu am putut s\u0103 golim soldul. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
            successTitle: 'Woohoo! Totul este preg\u0103tit.',
            successDescription: 'Acum e\u0219ti proprietarul acestui spa\u021Biu de lucru.',
            errorTitle: 'Oops! Nu at\u00E2t de repede...',
            errorDescriptionPartOne: 'A ap\u0103rut o problem\u0103 la transferul propriet\u0103\u021Bii acestui spa\u021Biu de lucru. \u00CEncerca\u021Bi din nou, sau',
            errorDescriptionPartTwo: 'contacta\u021Bi Concierge',
            errorDescriptionPartThree: 'pentru ajutor.',
        },
        exportAgainModal: {
            title: 'Aten\u021Bie!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `Urm\u0103toarele rapoarte au fost deja exportate c\u0103tre ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\nSunte\u021Bi sigur c\u0103 dori\u021Bi s\u0103 le exporta\u021Bi din nou?`,
            confirmText: 'Da, export\u0103 din nou',
            cancelText: 'Anuleaz\u0103',
        },
        upgrade: {
            reportFields: {
                title: 'C\u00E2mpuri de raportare',
                description: `Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: 'C\u00E2mpurile de raport sunt disponibile doar pe planul Control, \u00EEncep\u00E2nd de la',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: 'Integrarea noastr\u0103 NetSuite este disponibil\u0103 doar pe planul Control, \u00EEncep\u00E2nd de la',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: 'Integrarea noastr\u0103 Sage Intacct este disponibil\u0103 numai pe planul Control, \u00EEncep\u00E2nd de la',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: 'Integrarea noastr\u0103 QuickBooks Desktop este disponibil\u0103 numai pe planul Control, \u00EEncep\u00E2nd de la',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Aprob\u0103ri Avansate',
                description: `If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: 'Aprob\u0103rile avansate sunt disponibile doar pe planul Control, care \u00EEncepe de la',
            },
            categories: {
                title: 'Categorii',
                description: `Categories help you better organize expenses to keep track of where you're spending your money. Use our suggested categories list or create your own.`,
                onlyAvailableOnPlan: 'Categoriile sunt disponibile pe planul Collect, \u00EEncep\u00E2nd de la',
            },
            glCodes: {
                title: 'Coduri GL',
                description: `Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: 'Codurile GL sunt disponibile doar pe planul Control, \u00EEncep\u00E2nd de la',
            },
            glAndPayrollCodes: {
                title: 'Coduri GL & Payroll',
                description: `Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: 'Codurile GL \u0219i Payroll sunt disponibile doar pe planul Control, \u00EEncep\u00E2nd de la',
            },
            taxCodes: {
                title: 'Coduri fiscale',
                description: `Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: 'Codurile fiscale sunt disponibile doar pe planul Control, \u00EEncep\u00E2nd de la',
            },
            companyCards: {
                title: 'Carduri de companie',
                description: `Connect your existing corporate cards to Expensify, assign them to employees, and automatically import transactions.`,
                onlyAvailableOnPlan: 'Cardurile companiei sunt disponibile doar pe planul Control, \u00EEncep\u00E2nd de la',
            },
            rules: {
                title: 'Reguli',
                description: `Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.\n\nRequire expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: 'Regulile sunt disponibile numai pe planul Control, \u00EEncep\u00E2nd de la',
            },
            perDiem: {
                title: 'Pe zi',
                description:
                    'Per diem este o modalitate excelent\u0103 de a men\u021Bine costurile zilnice conforme \u0219i previzibile ori de c\u00E2te ori angaja\u021Bii dvs. c\u0103l\u0103toresc. Bucura\u021Bi-v\u0103 de func\u021Bii precum rate personalizate, categorii implicite \u0219i detalii mai granulare precum destina\u021Bii \u0219i subrate.',
                onlyAvailableOnPlan: 'Per diem sunt disponibile doar pe planul Control, \u00EEncep\u00E2nd de la',
            },
            travel: {
                title: 'C\u0103l\u0103torie',
                description:
                    'Expensify Travel este o nou\u0103 platform\u0103 de rezervare \u0219i gestionare a c\u0103l\u0103toriilor corporative care permite membrilor s\u0103 rezerve cazare, zboruri, transport \u0219i multe altele.',
                onlyAvailableOnPlan: 'C\u0103l\u0103toriile sunt disponibile pe planul Collect, \u00EEncep\u00E2nd de la',
            },
            pricing: {
                perActiveMember: 'pe membru activ pe lun\u0103.',
            },
            note: {
                upgradeWorkspace: 'Actualiza\u021Bi-v\u0103 spa\u021Biul de lucru pentru a accesa aceast\u0103 func\u021Bie, sau',
                learnMore: 'afl\u0103 mai mult',
                aboutOurPlans: 'despre planurile \u0219i pre\u021Burile noastre.',
            },
            upgradeToUnlock: 'Deblocheaz\u0103 aceast\u0103 func\u021Bie',
            completed: {
                headline: `You've upgraded your workspace!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `A\u021Bi actualizat cu succes ${policyName} la planul Control!`,
                categorizeMessage: `You've successfully upgraded to a workspace on the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `You've successfully upgraded to a workspace on the Collect plan. Now you can start booking and managing travel!`,
                viewSubscription: 'Vizualiza\u021Bi abonamentul dvs.',
                moreDetails: 'pentru mai multe detalii.',
                gotIt: 'Am \u00EEn\u021Beles, mul\u021Bumesc',
            },
            commonFeatures: {
                title: 'Actualiza\u021Bi la planul Control',
                note: 'Deblocheaz\u0103 cele mai puternice caracteristici ale noastre, inclusiv:',
                benefits: {
                    startsAt: 'Planul Control \u00EEncepe de la',
                    perMember: 'pe membru activ pe lun\u0103.',
                    learnMore: 'Afla\u021Bi mai multe',
                    pricing: 'despre planurile \u0219i pre\u021Burile noastre.',
                    benefit1: 'Conexiuni contabile avansate (NetSuite, Sage Intacct, \u0219i altele)',
                    benefit2: 'Reguli inteligente de cheltuieli',
                    benefit3: 'Fluxuri de aprobare multi-nivel',
                    benefit4: 'Controale de securitate \u00EEmbun\u0103t\u0103\u021Bite',
                    toUpgrade: 'Pentru a face upgrade, da\u021Bi click',
                    selectWorkspace: 'selecteaz\u0103 un spa\u021Biu de lucru \u0219i schimb\u0103 tipul de plan \u00EEn',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Retrogradeaz\u0103 la planul Collect',
                note: 'Dac\u0103 alege\u021Bi o versiune inferioar\u0103, ve\u021Bi pierde accesul la aceste func\u021Bii \u0219i multe altele:',
                benefits: {
                    note: 'Pentru o compara\u021Bie complet\u0103 a planurilor noastre, verifica\u021Bi',
                    pricingPage: 'pagina de pre\u021Buri',
                    confirm: 'E\u0219ti sigur c\u0103 vrei s\u0103 retrogradezi \u0219i s\u0103 \u00EE\u021Bi \u0219tergi configura\u021Biile?',
                    warning: 'Acest lucru nu poate fi anulat.',
                    benefit1: 'Conexiuni contabile (cu excep\u021Bia QuickBooks Online \u0219i Xero)',
                    benefit2: 'Reguli inteligente de cheltuieli',
                    benefit3: 'Fluxuri de aprobare multi-nivel',
                    benefit4: 'Controale de securitate \u00EEmbun\u0103t\u0103\u021Bite',
                    headsUp: 'Aten\u021Bie!',
                    multiWorkspaceNote:
                        'Va trebui s\u0103 retrograda\u021Bi toate spa\u021Biile de lucru \u00EEnainte de prima plat\u0103 lunar\u0103 pentru a \u00EEncepe un abonament la tariful Collect. Click',
                    selectStep: '> selecteaz\u0103 fiecare spa\u021Biu de lucru > schimb\u0103 tipul planului \u00EEn',
                },
            },
            completed: {
                headline: 'Spa\u021Biul t\u0103u de lucru a fost retrogradat',
                description:
                    'Ave\u021Bi alte spa\u021Bii de lucru pe planul Control. Pentru a fi facturat la tariful Collect, trebuie s\u0103 retrograda\u021Bi toate spa\u021Biile de lucru.',
                gotIt: 'Am \u00EEn\u021Beles, mul\u021Bumesc',
            },
        },
        restrictedAction: {
            restricted: 'Restric\u021Bionat',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) =>
                `Ac\u021Biunile \u00EEn spa\u021Biul de lucru ${workspaceName} sunt \u00EEn prezent restric\u021Bionate`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Proprietarul spa\u021Biului de lucru, ${workspaceOwnerName} va trebui s\u0103 adauge sau s\u0103 actualizeze cardul de plat\u0103 \u00EEnregistrat pentru a debloca activitatea nou\u0103 \u00EEn spa\u021Biul de lucru.`,
            youWillNeedToAddOrUpdatePaymentCard:
                'Va trebui s\u0103 ad\u0103uga\u021Bi sau s\u0103 actualiza\u021Bi cardul de plat\u0103 \u00EEnregistrat pentru a debloca activitatea nou\u0103 \u00EEn spa\u021Biul de lucru.',
            addPaymentCardToUnlock: 'Adaug\u0103 o carte de plat\u0103 pentru a debloca!',
            addPaymentCardToContinueUsingWorkspace: 'Ad\u0103uga\u021Bi un card de plat\u0103 pentru a continua utilizarea acestui spa\u021Biu de lucru',
            pleaseReachOutToYourWorkspaceAdmin: 'V\u0103 rug\u0103m s\u0103 contacta\u021Bi administratorul spa\u021Biului de lucru pentru orice \u00EEntreb\u0103ri.',
            chatWithYourAdmin: 'Discut\u0103 cu administratorul t\u0103u',
            chatInAdmins: 'Chat \u00EEn #admins',
            addPaymentCard: 'Adaug\u0103 card de plat\u0103',
        },
        rules: {
            individualExpenseRules: {
                title: 'Cheltuieli',
                subtitle: 'Seteaz\u0103 controalele de cheltuieli \u0219i valorile implicite pentru cheltuielile individuale. De asemenea, po\u021Bi crea reguli pentru',
                receiptRequiredAmount: 'Suma necesar\u0103 pentru chitan\u021B\u0103',
                receiptRequiredAmountDescription:
                    'Solicit\u0103 chitan\u021Be c\u00E2nd cheltuielile dep\u0103\u0219esc aceast\u0103 sum\u0103, cu excep\u021Bia cazului \u00EEn care este suprascris\u0103 de o regul\u0103 a categoriei.',
                maxExpenseAmount: 'Suma maxim\u0103 de cheltuieli',
                maxExpenseAmountDescription:
                    'Semnalizeaz\u0103 cheltuielile care dep\u0103\u0219esc aceast\u0103 sum\u0103, cu excep\u021Bia cazului \u00EEn care sunt suprascrise de o regul\u0103 a categoriei.',
                maxAge: 'V\u00E2rst\u0103 maxim\u0103',
                maxExpenseAge: 'V\u00E2rsta maxim\u0103 a cheltuielilor',
                maxExpenseAgeDescription: 'Marca\u021Bi cheltuielile mai vechi de un anumit num\u0103r de zile.',
                maxExpenseAgeDays: () => ({
                    one: '1 zi',
                    other: (count: number) => `${count} days`,
                }),
                billableDefault: 'Implicit facturabil',
                billableDefaultDescription:
                    'Alege\u021Bi dac\u0103 cheltuielile cu numerarul \u0219i cu cardul de credit ar trebui s\u0103 fie facturabile \u00EEn mod implicit. Cheltuielile facturabile sunt activate sau dezactivate \u00EEn',
                billable: 'Facturabil',
                billableDescription: 'Cheltuielile sunt cel mai adesea refacturate clien\u021Bilor',
                nonBillable: 'Nefacturabil',
                nonBillableDescription: 'Cheltuielile sunt ocazional refacturate c\u0103tre clien\u021Bi',
                eReceipts: 'eChitan\u021Be',
                eReceiptsHint: 'Chitan\u021Bele electronice sunt create automat',
                eReceiptsHintLink: 'pentru majoritatea tranzac\u021Biilor de credit \u00EEn USD',
            },
            expenseReportRules: {
                examples:
                    '1. "Hello, ${username}! You have ${count} new messages."\n   Translation: "Bun\u0103, ${username}! Ai ${count} mesaje noi."\n\n2. "The item is ${someBoolean ? \'available\' : \'not available\'}."\n   Translation: "Produsul este ${someBoolean ? \'disponibil\' : \'indisponibil\'}."\n\n3. "You have ${count} new notifications."\n   Translation: "Ai ${count} notific\u0103ri noi."\n\n4. "${username}, you have successfully updated your profile."\n   Translation: "${username}, \u021Bi-ai actualizat cu succes profilul."\n\n5. "There are ${count} items in your shopping cart."\n   Translation: "Sunt ${count} produse \u00EEn co\u0219ul t\u0103u de cump\u0103r\u0103turi."\n\n6. "The operation was ${someBoolean ? \'successful\' : \'unsuccessful\'}."\n   Translation: "Opera\u021Biunea a fost ${someBoolean ? \'reu\u015Fit\u0103\' : \'nereu\u015Fit\u0103\'}."\n\nPlease note that the placeholders ${username}, ${count}, ${someBoolean ? \'valueIfTrue\' : \'valueIfFalse\'} etc are preserved as they are in the translation.',
                title: 'Rapoarte de cheltuieli',
                subtitle: 'Automatizeaz\u0103 conformitatea raportului de cheltuieli, aprob\u0103rile \u0219i plata.',
                customReportNamesTitle: 'Nume personalizate pentru rapoarte',
                customReportNamesSubtitle: 'Creeaz\u0103 nume personalizate folosind formulele noastre extinse.',
                customNameTitle: 'Nume personalizat',
                customNameDescription: 'Alege\u021Bi un nume personalizat pentru rapoartele de cheltuieli folosindu-ne',
                customNameDescriptionLink: 'formule extinse',
                customNameInputLabel: 'Nume',
                customNameEmailPhoneExample: 'E-mail-ul sau num\u0103rul de telefon al membrului: {report:submit:from}',
                customNameStartDateExample: 'Data de \u00EEncepere a raportului: {report:startdate}',
                customNameWorkspaceNameExample: 'Numele spa\u021Biului de lucru: {report:policyname}',
                customNameReportIDExample: 'ID Raport: {report:id}',
                customNameTotalExample: 'Total: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Preveni\u021Bi membrii s\u0103 schimbe numele personalizate ale rapoartelor',
                preventSelfApprovalsTitle: 'Preveni\u021Bi auto-aprob\u0103rile',
                preventSelfApprovalsSubtitle: 'Preveni\u021Bi membrii spa\u021Biului de lucru s\u0103 \u00EE\u0219i aprobe propriile rapoarte de cheltuieli.',
                autoApproveCompliantReportsTitle: 'Aprob\u0103 automat rapoartele conforme',
                autoApproveCompliantReportsSubtitle: 'Configura\u021Bi care rapoarte de cheltuieli sunt eligibile pentru aprobare automat\u0103.',
                autoApproveReportsUnderTitle: 'Aprob\u0103 automat rapoartele sub',
                autoApproveReportsUnderDescription: 'Rapoartele de cheltuieli complet conforme sub aceast\u0103 sum\u0103 vor fi aprobate automat.',
                randomReportAuditTitle: 'Audit aleatoriu al raportului',
                randomReportAuditDescription: 'Cere ca unele rapoarte s\u0103 fie aprobate manual, chiar dac\u0103 sunt eligibile pentru aprobare automat\u0103.',
                autoPayApprovedReportsTitle: 'Rapoarte de plat\u0103 automat\u0103 aprobate',
                autoPayApprovedReportsSubtitle: 'Configura\u021Bi care rapoarte de cheltuieli sunt eligibile pentru plata automat\u0103.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) =>
                    `V\u0103 rug\u0103m s\u0103 introduce\u021Bi o sum\u0103 mai mic\u0103 de ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle:
                    'Mergi la mai multe func\u021Bii \u0219i activeaz\u0103 fluxurile de lucru, apoi adaug\u0103 pl\u0103\u021Bi pentru a debloca aceast\u0103 func\u021Bie.',
                autoPayReportsUnderTitle: 'Rapoarte de plata automat\u0103 sub',
                autoPayReportsUnderDescription: 'Rapoartele de cheltuieli complet conforme sub aceast\u0103 sum\u0103 vor fi pl\u0103tite automat.',
                unlockFeatureGoToSubtitle: 'Mergi la',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) =>
                    `\u0219i activeaz\u0103 fluxurile de lucru, apoi adaug\u0103 ${featureName} pentru a debloca aceast\u0103 caracteristic\u0103.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `\u0219i activeaz\u0103 ${featureName} pentru a debloca aceast\u0103 func\u021Bie.`,
                preventSelfApprovalsModalText: ({managerEmail}: {managerEmail: string}) =>
                    `Orice membri care \u00EE\u0219i aprob\u0103 \u00EEn prezent propriile cheltuieli vor fi elimina\u021Bi \u0219i \u00EEnlocui\u021Bi cu aprobatorul implicit pentru acest spa\u021Biu de lucru (${managerEmail}).`,
                preventSelfApprovalsConfirmButton: 'Preveni\u021Bi auto-aprob\u0103rile',
                preventSelfApprovalsModalTitle: 'Preveni\u021Bi auto-aprob\u0103rile?',
                preventSelfApprovalsDisabledSubtitle: 'Aprob\u0103rile automate nu pot fi activate p\u00E2n\u0103 c\u00E2nd acest spa\u021Biu de lucru are cel pu\u021Bin doi membri.',
            },
            categoryRules: {
                title: 'Reguli de categorie',
                approver: 'Aprobator',
                requireDescription: 'Cere descriere',
                descriptionHint: 'Indiciu descriere',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Reaminti\u021Bi angaja\u021Bilor s\u0103 furnizeze informa\u021Bii suplimentare pentru cheltuielile de la categoria \u201E${categoryName}\u201D. Acest indiciu apare \u00EEn c\u00E2mpul de descriere al cheltuielilor.`,
                descriptionHintLabel: 'Sugestie',
                descriptionHintSubtitle: 'Sfat profesionist: Cu c\u00E2t e mai scurt, cu at\u00E2t e mai bine!',
                maxAmount: 'Cantitate maxim\u0103',
                flagAmountsOver: 'Marca\u021Bi sumele peste',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Se aplic\u0103 categoriei "${categoryName}".`,
                flagAmountsOverSubtitle: 'Acest lucru \u00EEnlocuie\u0219te suma maxim\u0103 pentru toate cheltuielile.',
                expenseLimitTypes: {
                    expense: 'Cheltuial\u0103 individual\u0103',
                    expenseSubtitle:
                        'Marcheaz\u0103 sumele cheltuielilor dup\u0103 categorie. Aceast\u0103 regul\u0103 \u00EEnlocuie\u0219te regula general\u0103 a spa\u021Biului de lucru pentru suma maxim\u0103 a cheltuielilor.',
                    daily: 'Total categorie',
                    dailySubtitle: 'Marcheaz\u0103 totalul cheltuielilor pe categorie per raport de cheltuieli.',
                },
                requireReceiptsOver: 'Cere chitan\u021Be peste',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: 'Niciodat\u0103 nu cere chitan\u021Be',
                    always: 'Solicita\u021Bi \u00EEntotdeauna chitan\u021Be',
                },
                defaultTaxRate: 'Rata implicit\u0103 a impozitului',
                goTo: 'Mergi la',
                andEnableWorkflows: '\u0219i activeaz\u0103 fluxurile de lucru, apoi adaug\u0103 aprob\u0103ri pentru a debloca aceast\u0103 caracteristic\u0103.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Colecteaz\u0103',
                    description: 'Pentru echipele care doresc s\u0103 \u00EE\u0219i automatizeze procesele.',
                },
                corporate: {
                    label: 'Control',
                    description: 'Pentru organiza\u021Bii cu cerin\u021Be avansate.',
                },
            },
            description: 'Alege\u021Bi un plan care este potrivit pentru dvs. Pentru o list\u0103 detaliat\u0103 de caracteristici \u0219i pre\u021Buri, consulta\u021Bi',
            subscriptionLink: 'pagina de ajutor pentru tipuri de planuri \u0219i pre\u021Buri',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `V-a\u021Bi angajat pentru 1 membru activ \u00EEn planul Control p\u00E2n\u0103 c\u00E2nd abonamentul dvs. anual se \u00EEncheie la ${annualSubscriptionEndDate}. Pute\u021Bi trece la abonamentul cu plat\u0103-per-utilizare \u0219i pute\u021Bi retrograda la planul Collect \u00EEncep\u00E2nd cu ${annualSubscriptionEndDate} dezactiv\u00E2nd re\u00EEnnoirea automat\u0103 \u00EEn`,
                other: `V-a\u021Bi angajat pentru ${count} membri activi pe planul Control p\u00E2n\u0103 c\u00E2nd abonamentul dvs. anual se \u00EEncheie la ${annualSubscriptionEndDate}. Pute\u021Bi trece la abonamentul cu plat\u0103-per-utilizare \u0219i pute\u021Bi retrograda la planul Collect \u00EEncep\u00E2nd cu ${annualSubscriptionEndDate} dezactiv\u00E2nd re\u00EEnnoirea automat\u0103 \u00EEn`,
            }),
            subscriptions: 'Abonamente',
        },
    },
    getAssistancePage: {
        title: 'Ob\u021Bine asisten\u021B\u0103',
        subtitle: 'Suntem aici pentru a-\u021Bi deschide calea c\u0103tre m\u0103re\u021Bie!',
        description: 'Alege\u021Bi din op\u021Biunile de suport de mai jos:',
        chatWithConcierge: 'Discut\u0103 cu Concierge',
        scheduleSetupCall: 'Programeaz\u0103 un apel de configurare',
        scheduleADemo: 'Programeaz\u0103 demonstra\u021Bia',
        questionMarkButtonTooltip: 'Ob\u021Bine\u021Bi asisten\u021B\u0103 de la echipa noastr\u0103',
        exploreHelpDocs: 'Explora\u021Bi documentele de ajutor',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Schimb\u0103 tonul de piele implicit',
        headers: {
            frequentlyUsed: 'Folosit frecvent',
            smileysAndEmotion: 'Z\u00E2mbete & Emo\u021Bie',
            peopleAndBody: 'Oameni & Corp',
            animalsAndNature: 'Animale & Natur\u0103',
            foodAndDrink: 'M\u00E2ncare & B\u0103uturi',
            travelAndPlaces: 'C\u0103l\u0103torii & Locuri',
            activities: 'Activit\u0103\u021Bi',
            objects: 'Obiecte',
            symbols: 'Simboluri',
            flags: 'Steaguri',
        },
    },
    newRoomPage: {
        newRoom: 'Camer\u0103 nou\u0103',
        groupName: 'Numele grupului',
        roomName: 'Numele camerei',
        visibility: 'Vizibilitate',
        restrictedDescription: 'Persoanele din spa\u021Biul t\u0103u de lucru pot g\u0103si aceast\u0103 camer\u0103',
        privateDescription: 'Persoanele invitate \u00EEn aceast\u0103 camer\u0103 o pot g\u0103si',
        publicDescription: 'Oricine poate g\u0103si aceast\u0103 camer\u0103',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Oricine poate g\u0103si aceast\u0103 camer\u0103',
        createRoom: 'Creeaz\u0103 camer\u0103',
        roomAlreadyExistsError: 'O camer\u0103 cu acest nume exist\u0103 deja.',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: 'Numele camerelor pot include doar litere mici, numere \u0219i liniu\u021Be.',
        pleaseEnterRoomName: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un nume de camer\u0103.',
        pleaseSelectWorkspace: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi un spa\u021Biu de lucru.',
        renamedRoomAction: ({oldName, newName}: RenamedRoomActionParams) => `a redenumit aceast\u0103 camer\u0103 "${newName}" (anterior "${oldName}")`,
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Camera redenumit\u0103 \u00EEn ${newName}`,
        social: 'social',
        selectAWorkspace: 'Selecteaz\u0103 un spa\u021Biu de lucru',
        growlMessageOnRenameError: 'Imposibil de redenumit camera de lucru. Verifica\u021Bi conexiunea \u0219i \u00EEncerca\u021Bi din nou.',
        visibilityOptions: {
            restricted: 'Spa\u021Biu de lucru', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privat',
            public: 'Public',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Anun\u021B Public',
        },
    },
    workspaceActions: {
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedRoomActionParams) => `a actualizat numele acestui spa\u021Biu de lucru la "${newName}" (anterior "${oldName}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = 'As a language model AI developed by OpenAI, I need the original text in order to provide the translation. Please provide the text you want to be translated.';
            if (submittersNames.length === 1) {
                joinedNames =
                    submittersNames.at(0) ??
                    'As a language model AI developed by OpenAI, I need the original text in order to provide the translation. Please provide the text you want to be translated.';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('\u0219i');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `te-a eliminat din fluxul de aprobare \u0219i chatul spa\u021Biului de lucru al ${joinedNames}. Rapoartele trimise anterior vor r\u0103m\u00E2ne disponibile pentru aprobare \u00EEn Inbox-ul t\u0103u.`,
                other: `te-a eliminat din fluxurile de aprobare \u0219i chat-urile de lucru ale ${joinedNames}. Rapoartele trimise anterior vor r\u0103m\u00E2ne disponibile pentru aprobare \u00EEn Inbox-ul t\u0103u.`,
            };
        },
        upgradedWorkspace: 'a actualizat acest spa\u021Biu de lucru la planul Control',
        downgradedWorkspace: 'a retrogradat acest spa\u021Biu de lucru la planul Collect',
    },
    roomMembersPage: {
        memberNotFound: 'Membru nu a fost g\u0103sit.',
        useInviteButton: 'Pentru a invita un nou membru la chat, v\u0103 rug\u0103m s\u0103 utiliza\u021Bi butonul de invita\u021Bie de mai sus.',
        notAuthorized: `Nu ave\u021Bi acces la aceast\u0103 pagin\u0103. Dac\u0103 \u00EEncerca\u021Bi s\u0103 v\u0103 al\u0103tura\u021Bi acestei camere, pur \u0219i simplu cere\u021Bi unui membru al camerei s\u0103 v\u0103 adauge. Alte \u00EEntreb\u0103ri? Contacta\u021Bi ${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `E\u0219ti sigur c\u0103 vrei s\u0103 \u00EEnl\u0103turi pe ${memberName} din camer\u0103?`,
            other: 'E\u0219ti sigur c\u0103 vrei s\u0103 elimini membrii selecta\u021Bi din camer\u0103?',
        }),
        error: {
            genericAdd: 'A ap\u0103rut o problem\u0103 la ad\u0103ugarea acestui membru \u00EEn camer\u0103.',
        },
    },
    newTaskPage: {
        assignTask: 'Atribuie sarcina',
        assignMe: 'Atribuie-mi',
        confirmTask: 'Confirm\u0103 sarcina',
        confirmError: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un titlu \u0219i s\u0103 selecta\u021Bi o destina\u021Bie de partajare.',
        descriptionOptional: 'Descriere (op\u021Bional)',
        pleaseEnterTaskName: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un titlu',
        pleaseEnterTaskDestination: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi unde dori\u021Bi s\u0103 partaja\u021Bi aceast\u0103 sarcin\u0103.',
    },
    task: {
        task: 'Sarcin\u0103',
        title: 'Titlu',
        description: 'Descriere',
        assignee: 'Alocat',
        completed: 'Finalizat',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `sarcin\u0103 pentru ${title}`,
            completed: 'marcat ca fiind complet',
            canceled: 'sarcin\u0103 \u0219tears\u0103',
            reopened: 'marcat ca fiind incomplet',
            error: 'Nu ave\u021Bi permisiunea de a efectua ac\u021Biunea solicitat\u0103.',
        },
        markAsComplete: 'Marcheaz\u0103 ca fiind complet',
        markAsIncomplete: 'Marcheaz\u0103 ca incomplet',
        assigneeError: 'A ap\u0103rut o eroare \u00EEn timpul atribuirii acestei sarcini. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi un alt destinatar.',
        genericCreateTaskFailureMessage: 'A ap\u0103rut o eroare la crearea acestei sarcini. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
        deleteTask: '\u0218terge sarcina',
        deleteConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 sarcin\u0103?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Declara\u021Bia ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Comenzi rapide de la tastatur\u0103',
        subtitle: 'Economisi\u021Bi timp cu aceste comenzi rapide de la tastatur\u0103:',
        shortcuts: {
            openShortcutDialog: 'Deschide dialogul pentru scurt\u0103turi de tastatur\u0103',
            escape: 'Dialoguri de evadare',
            search: 'Deschide dialogul de c\u0103utare',
            newChat: 'Ecran nou de chat',
            copy: 'Copia\u021Bi comentariul',
            openDebug: 'Deschide\u021Bi dialogul de preferin\u021Be pentru testare',
        },
    },
    guides: {
        screenShare: 'Partajare ecran',
        screenShareRequest: 'Expensify te invit\u0103 la un partajare de ecran',
    },
    search: {
        resultsAreLimited: 'Rezultatele c\u0103ut\u0103rii sunt limitate.',
        viewResults: 'Vizualizeaz\u0103 rezultatele',
        resetFilters: 'Reseteaz\u0103 filtrele',
        searchResults: {
            emptyResults: {
                title: 'Nimic de ar\u0103tat',
                subtitle: '\u00CEncearc\u0103 s\u0103-\u021Bi ajustezi criteriile de c\u0103utare sau s\u0103 creezi ceva cu butonul verde +.',
            },
            emptyExpenseResults: {
                title: 'Nu ai creat \u00EEnc\u0103 nicio cheltuial\u0103',
                subtitle: 'Utiliza\u021Bi butonul verde de mai jos pentru a crea o cheltuial\u0103 sau face\u021Bi un tur al Expensify pentru a afla mai multe.',
            },
            emptyInvoiceResults: {
                title: 'Nu ai creat \u00EEnc\u0103 nicio factur\u0103',
                subtitle: 'Utiliza\u021Bi butonul verde de mai jos pentru a trimite o factur\u0103 sau face\u021Bi un tur al Expensify pentru a afla mai multe.',
            },
            emptyTripResults: {
                title: 'Nu exist\u0103 c\u0103l\u0103torii de afi\u0219at',
                subtitle: '\u00CEncepe\u021Bi prin a rezerva prima dumneavoastr\u0103 c\u0103l\u0103torie mai jos.',
                buttonText: 'Rezerva\u021Bi o c\u0103l\u0103torie',
            },
        },
        saveSearch: 'Salveaz\u0103 c\u0103utarea',
        deleteSavedSearch: '\u0218terge c\u0103utarea salvat\u0103',
        deleteSavedSearchConfirm: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi aceast\u0103 c\u0103utare?',
        searchName: 'Caut\u0103 nume',
        savedSearchesMenuItemTitle: 'Salvat',
        groupedExpenses: 'cheltuieli grupate',
        bulkActions: {
            approve: 'Aprob\u0103',
            pay: 'Pl\u0103te\u0219te',
            delete: '\u0218terge',
            hold: 'Re\u021Bine',
            unhold: 'Nesustinut',
            noOptionsAvailable: 'Nu exist\u0103 op\u021Biuni disponibile pentru grupul selectat de cheltuieli.',
        },
        filtersHeader: 'Filtre',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `\u00CEnainte de ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Dup\u0103 ${date ?? ''}`,
            },
            status: 'Stare',
            keyword: 'Cuv\u00E2nt cheie',
            hasKeywords: 'Are cuvinte cheie',
            currency: 'Moned\u0103',
            link: 'Leg\u0103tur\u0103',
            pinned: 'Fixat',
            unread: 'Necitit',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Mai pu\u021Bin de ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Mai mare dec\u00E2t ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `\u00CEntre ${greaterThan} \u0219i ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'C\u0103r\u021Bi individuale',
                cardFeeds: 'Fluxuri de carduri',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Curent',
            past: 'Trecut',
            submitted: 'Trimis',
            approved: 'Aprobat',
            paid: 'Pl\u0103tit',
            exported: 'Exportat',
            posted: 'Postat',
        },
        noCategory: 'Nicio categorie',
        noTag: 'F\u0103r\u0103 etichet\u0103',
        expenseType: 'Tip de cheltuial\u0103',
        recentSearches: 'C\u0103ut\u0103ri recente',
        recentChats: 'Chat-uri recente',
        searchIn: 'Caut\u0103 \u00EEn',
        searchPlaceholder: 'Caut\u0103 ceva',
        suggestions: 'Sugestii',
    },
    genericErrorPage: {
        title: 'Uh-oh, ceva nu a mers bine!',
        body: {
            helpTextMobile: 'V\u0103 rug\u0103m s\u0103 \u00EEnchide\u021Bi \u0219i s\u0103 redeschide\u021Bi aplica\u021Bia, sau s\u0103 comuta\u021Bi la',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Dac\u0103 problema persist\u0103, contacteaz\u0103',
        },
        refresh: 'Re\u00EEmprosp\u0103tare',
    },
    fileDownload: {
        success: {
            title: 'Desc\u0103rcat!',
            message: 'Ata\u0219ament desc\u0103rcat cu succes!',
            qrMessage:
                'Verifica\u021Bi dosarul dvs. de fotografii sau desc\u0103rc\u0103ri pentru o copie a codului dvs. QR. Sfat: Ad\u0103uga\u021Bi-l la o prezentare pentru ca publicul dvs. s\u0103 \u00EEl scaneze \u0219i s\u0103 se conecteze direct cu dvs.',
        },
        generalError: {
            title: 'Eroare de ata\u0219ament',
            message: 'Ata\u0219amentul nu poate fi desc\u0103rcat.',
        },
        permissionError: {
            title: 'Acces la stocare',
            message: 'Expensify nu poate salva ata\u0219amente f\u0103r\u0103 acces la stocare. Ap\u0103sa\u021Bi pe set\u0103ri pentru a actualiza permisiunile.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Noua Expensify',
        about: 'Despre New Expensify',
        update: 'Actualizeaz\u0103 New Expensify',
        checkForUpdates: 'Verific\u0103 pentru actualiz\u0103ri',
        toggleDevTools: 'Comuta\u021Bi Instrumentele de Dezvoltator',
        viewShortcuts: 'Vizualiza\u021Bi scurt\u0103turile de la tastatur\u0103',
        services: 'Servicii',
        hide: 'Ascunde New Expensify',
        hideOthers: 'Ascunde pe ceilal\u021Bi',
        showAll: 'Arat\u0103 Toate',
        quit: 'Ie\u0219i din New Expensify',
        fileMenu: 'Fi\u0219ier',
        closeWindow: '\u00CEnchide Fereastra',
        editMenu: 'Editare',
        undo: 'Anuleaz\u0103',
        redo: 'Refac\u0103',
        cut: 'T\u0103iere',
        copy: 'Copiaz\u0103',
        paste: 'Lipe\u0219te',
        pasteAndMatchStyle: 'Lipe\u0219te \u0219i potrive\u0219te stilul',
        pasteAsPlainText: 'Lipe\u0219te ca Text Simplu',
        delete: '\u0218terge',
        selectAll: 'Selecteaz\u0103 Tot',
        speechSubmenu: 'Discurs',
        startSpeaking: '\u00CEncepe s\u0103 vorbe\u0219ti',
        stopSpeaking: 'Opri\u021Bi-v\u0103 din vorbit',
        viewMenu: 'Vizualizeaz\u0103',
        reload: 'Re\u00EEncarc\u0103',
        forceReload: 'Re\u00EEnc\u0103rcare For\u021Bat\u0103',
        resetZoom: 'Dimensiune real\u0103',
        zoomIn: 'M\u0103rire',
        zoomOut: 'Zoom Out',
        togglefullscreen: 'Comuta\u021Bi ecranul complet',
        historyMenu: 'Istorie',
        back: '\u00CEnapoi',
        forward: '\u00CEnainte',
        windowMenu: 'Fereastr\u0103',
        minimize: 'Minimizeaz\u0103',
        zoom: 'Zoom',
        front: 'Adu Totul \u00EEn Fa\u021B\u0103',
        helpMenu: 'Ajutor',
        learnMore: 'Afla\u021Bi mai multe',
        documentation: 'Documenta\u021Bie',
        communityDiscussions: 'Discu\u021Bii \u00EEn Comunitate',
        searchIssues: 'Caut\u0103 probleme',
    },
    historyMenu: {
        forward: '\u00CEnainte',
        back: '\u00CEnapoi',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Actualizare disponibil\u0103',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `Noua versiune va fi disponibil\u0103 \u00EEn cur\u00E2nd.${!isSilentUpdating ? ' Te vom anunța când suntem gata să actualizăm.' : ''}`,
            soundsGood: 'Sun\u0103 bine',
        },
        notAvailable: {
            title: 'Actualizare indisponibil\u0103',
            message: 'Nu exist\u0103 nicio actualizare disponibil\u0103 \u00EEn acest moment. V\u0103 rug\u0103m s\u0103 reveni\u021Bi mai t\u00E2rziu!',
            okay: "Sure, but you haven't provided any text to translate. Could you please provide the text?",
        },
        error: {
            title: 'Verificarea actualiz\u0103rii a e\u0219uat.',
            message: 'Nu am putut verifica dac\u0103 exist\u0103 un update. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou \u00EEntr-un timp.',
        },
    },
    report: {
        genericCreateReportFailureMessage: 'Eroare nea\u0219teptat\u0103 la crearea acestui chat. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
        genericAddCommentFailureMessage: 'Eroare nea\u0219teptat\u0103 la postarea comentariului. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
        genericUpdateReportFieldFailureMessage: 'Eroare nea\u0219teptat\u0103 la actualizarea c\u00E2mpului. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
        genericUpdateReporNameEditFailureMessage: 'Eroare nea\u0219teptat\u0103 la redenumirea raportului. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou mai t\u00E2rziu.',
        noActivityYet: 'Nicio activitate \u00EEnc\u0103',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `a schimbat ${fieldName} din ${oldValue} \u00EEn ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `a schimbat ${fieldName} \u00EEn ${newValue}`,
                changePolicy: ({fromPolicy, toPolicy}: ChangePolicyParams) => `a schimbat spa\u021Biul de lucru de la ${fromPolicy} la ${toPolicy}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `tipul a fost schimbat de la ${oldType} la ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) =>
                    `a trimis acest raport c\u0103tre ${delegateUser} deoarece ${originalManager} este \u00EEn vacan\u021B\u0103`,
                exportedToCSV: `exported this report to CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `a exportat acest raport la ${label}.`,
                    manual: ({label}: ExportedToIntegrationParams) => `a marcat acest raport ca fiind exportat manual la ${label}.`,
                    reimburseableLink: 'Vizualiza\u021Bi cheltuielile din buzunarul propriu.',
                    nonReimbursableLink: 'Vizualiza\u021Bi cheltuielile pe cardul companiei.',
                    pending: ({label}: ExportedToIntegrationParams) => `a \u00EEnceput exportarea acestui raport c\u0103tre ${label}...`,
                },
                integrationsMessage: ({errorMessage, label}: IntegrationSyncFailedParams) => `nu s-a reu\u0219it exportarea acestui raport c\u0103tre ${label} ("${errorMessage}")`,
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
                share: ({to}: ShareParams) => `membru invitat ${to}`,
                unshare: ({to}: UnshareParams) => `membru eliminat ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `paid ${currency}${amount}`,
                takeControl: `took control`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `failed to sync with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `a ad\u0103ugat ${email} ca ${role === 'member' || role === 'user' ? 'un membru' : 'un admin'}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) =>
                    `a actualizat rolul lui ${email} la ${newRole === 'member' || newRole === 'user' ? 'membru' : newRole} (anterior ${
                        currentRole === 'member' || currentRole === 'user' ? 'membru' : currentRole
                    })`,
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} left the workspace`,
                removeMember: ({email, role}: AddEmployeeParams) => `eliminat ${role === 'member' || role === 'user' ? 'member' : 'admin'} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `conexiunea la ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} a fost eliminat\u0103`,
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} for ${dayCount} ${dayCount === 1 ? 'day' : 'days'} until ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} from ${timePeriod} on ${date}`,
    },
    footer: {
        features: 'Caracteristici',
        expenseManagement: 'Gestionarea Cheltuielilor',
        spendManagement: 'Gestionarea Cheltuielilor',
        expenseReports: 'Rapoarte de cheltuieli',
        companyCreditCard: 'Card de Credit al Companiei',
        receiptScanningApp: 'Aplica\u021Bie de scanare a chitan\u021Belor',
        billPay: 'Plata facturilor',
        invoicing: 'Facturare',
        CPACard: 'Card CPA',
        payroll: 'Salarii',
        travel: 'C\u0103l\u0103torie',
        resources: 'Resurse',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Kit de pres\u0103',
        support: 'Asisten\u021B\u0103',
        expensifyHelp: 'AjutorExpensify',
        terms: 'Termeni \u0219i Condi\u021Bii',
        privacy: 'Confiden\u021Bialitate',
        learnMore: 'Afla\u021Bi mai multe',
        aboutExpensify: 'Despre Expensify',
        blog: 'Blog',
        jobs: 'Locuri de munc\u0103',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Rela\u021Bii cu Investitorii',
        getStarted: '\u00CEncepe\u021Bi',
        createAccount: 'Creeaz\u0103 Un Cont Nou',
        logIn: 'Conectare',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Naviga\u021Bi \u00EEnapoi la lista de chat-uri',
        chatWelcomeMessage: 'Mesaj de bun venit la chat',
        navigatesToChat: 'Navigheaz\u0103 c\u0103tre o conversa\u021Bie',
        newMessageLineIndicator: 'Indicator nou\u0103 linie de mesaj',
        chatMessage: 'Mesaj de chat',
        lastChatMessagePreview: 'Previzualizare ultimul mesaj de chat',
        workspaceName: 'Numele spa\u021Biului de lucru',
        chatUserDisplayNames: 'Numele de afi\u0219are ale membrilor din chat',
        scrollToNewestMessages: 'Deruleaz\u0103 p\u00E2n\u0103 la cele mai noi mesaje',
        prestyledText: 'Text predefinit',
        viewAttachment: 'Vizualiza\u021Bi ata\u0219amentul',
    },
    parentReportAction: {
        deletedReport: 'Raport \u0219ters',
        deletedMessage: 'Mesaj \u0219ters',
        deletedExpense: 'Cheltuial\u0103 \u0219tears\u0103',
        reversedTransaction: 'Tranzac\u021Bie inversat\u0103',
        deletedTask: 'Sarcin\u0103 \u0219tears\u0103',
        hiddenMessage: 'Mesaj ascuns',
    },
    threads: {
        thread: 'Fir',
        replies: 'R\u0103spunsuri',
        reply: 'R\u0103spuns',
        from: 'Din',
        in: '\u00CEmi pare r\u0103u, dar nu a\u021Bi furnizat niciun text pentru a fi tradus. V\u0103 rug\u0103m s\u0103 furniza\u021Bi textul pe care dori\u021Bi s\u0103 \u00EEl traduc.',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `From ${reportName}${workspaceName ? ` in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'Copia\u021Bi URL',
        copied: 'Copiat!',
    },
    moderation: {
        flagDescription: 'Toate mesajele marcate vor fi trimise unui moderator pentru revizuire.',
        chooseAReason: 'Alege\u021Bi un motiv pentru semnalare mai jos:',
        spam: 'Spam',
        spamDescription: 'Promovare nesolicitat\u0103 \u0219i neconexat\u0103 cu subiectul',
        inconsiderate: 'Nesocotit',
        inconsiderateDescription: 'Formul\u0103ri insult\u0103toare sau lipsite de respect, cu inten\u021Bii discutabile',
        intimidation: 'Intimidare',
        intimidationDescription: 'Urm\u0103rind agresiv o agend\u0103 \u00EEn pofida obiec\u021Biilor valide',
        bullying: 'H\u0103r\u021Buire',
        bullyingDescription: '\u021Aintirea unei persoane pentru a ob\u021Bine ascultare',
        harassment: 'H\u0103r\u021Buire',
        harassmentDescription: 'Comportament rasist, misogin sau alt tip de comportament larg discriminatoriu',
        assault: 'Asalt',
        assaultDescription: 'Atac emo\u021Bional \u021Bintit specific cu inten\u021Bia de a face r\u0103u',
        flaggedContent: 'Acest mesaj a fost marcat ca \u00EEnc\u0103lc\u00E2nd regulile noastre comunitare \u0219i con\u021Binutul a fost ascuns.',
        hideMessage: 'Ascunde mesajul',
        revealMessage: 'Dezv\u0103luie mesaj',
        levelOneResult: 'Trimite avertisment anonim \u0219i mesajul este raportat pentru revizuire.',
        levelTwoResult: 'Mesaj ascuns de pe canal, plus avertisment anonim \u0219i mesajul este raportat pentru revizuire.',
        levelThreeResult: 'Mesajul a fost eliminat din canal plus avertisment anonim \u0219i mesajul este raportat pentru revizuire.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Invit\u0103-i',
        nothing: 'Nu face nimic',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accepta',
        decline: 'Refuz\u0103',
    },
    actionableMentionTrackExpense: {
        submit: 'Trimite-l la cineva',
        categorize: 'Categorizeaz\u0103-l',
        share: '\u00CEmp\u0103rt\u0103\u0219e\u0219te-o cu contabilul meu',
        nothing: 'Nimic pentru moment',
    },
    teachersUnitePage: {
        teachersUnite: 'Profesorii se Unesc',
        joinExpensifyOrg:
            'Al\u0103tura\u021Bi-v\u0103 Expensify.org \u00EEn eliminarea nedrept\u0103\u021Bii din \u00EEntreaga lume. Campania actual\u0103 "Teachers Unite" sus\u021Bine educatori din toat\u0103 lumea prin \u00EEmp\u0103r\u021Birea costurilor pentru materialele \u0219colare esen\u021Biale.',
        iKnowATeacher: '\u0218tiu un profesor',
        iAmATeacher: 'Sunt profesor',
        getInTouch: 'Excelent! V\u0103 rug\u0103m s\u0103 \u00EEmp\u0103rt\u0103\u0219i\u021Bi informa\u021Biile lor astfel \u00EEnc\u00E2t s\u0103 putem lua leg\u0103tura cu ei.',
        introSchoolPrincipal: 'Introducere c\u0103tre directorul \u0219colii dvs.',
        schoolPrincipalVerfiyExpense:
            'Expensify.org \u00EEmparte costul materialelor \u0219colare esen\u021Biale astfel \u00EEnc\u00E2t elevii din gospod\u0103riile cu venituri mici s\u0103 poat\u0103 avea o experien\u021B\u0103 de \u00EEnv\u0103\u021Bare mai bun\u0103. Directorul t\u0103u va fi rugat s\u0103 verifice cheltuielile tale.',
        principalFirstName: 'Prenumele principal',
        principalLastName: 'Numele de familie al directorului',
        principalWorkEmail: 'Email principal de lucru',
        updateYourEmail: 'Actualiza\u021Bi adresa dvs. de email',
        updateEmail: 'Actualizeaz\u0103 adresa de email',
        contactMethods: 'Metode de contact.',
        schoolMailAsDefault:
            '\u00CEnainte de a continua, asigura\u021Bi-v\u0103 c\u0103 a\u021Bi setat adresa de e-mail a \u0219colii ca metod\u0103 de contact implicit\u0103. Pute\u021Bi face acest lucru \u00EEn Set\u0103ri > Profil >',
        error: {
            enterPhoneEmail: 'Introduce\u021Bi un email sau num\u0103r de telefon valid.',
            enterEmail: 'Introduce\u021Bi un email.',
            enterValidEmail: 'Introduce\u021Bi un email valid.',
            tryDifferentEmail: 'V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi cu un alt email.',
        },
    },
    cardTransactions: {
        notActivated: 'Nu este activat',
        outOfPocket: 'Cheltuieli din propriul buzunar',
        companySpend: 'Cheltuieli ale companiei',
    },
    distance: {
        addStop: 'Adaug\u0103 oprire',
        deleteWaypoint: '\u0218terge punctul de reper',
        deleteWaypointConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u0219tergi acest punct de reper?',
        address: 'Adres\u0103',
        waypointDescription: {
            start: '\u00CEncepe',
            stop: 'Oprire',
        },
        mapPending: {
            title: 'Hart\u0103 \u00EEn a\u0219teptare',
            subtitle: 'Harta va fi generat\u0103 c\u00E2nd te vei reconecta la internet',
            onlineSubtitle: 'Un moment \u00EEn timp ce set\u0103m harta',
            errorTitle: 'Eroare de hart\u0103',
            errorSubtitle: 'A ap\u0103rut o eroare la \u00EEnc\u0103rcarea h\u0103r\u021Bii. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou.',
        },
        error: {
            selectSuggestedAddress: 'V\u0103 rug\u0103m s\u0103 selecta\u021Bi o adres\u0103 sugerat\u0103 sau s\u0103 utiliza\u021Bi loca\u021Bia curent\u0103.',
        },
    },
    reportCardLostOrDamaged: {
        report: 'Raporteaz\u0103 pierderea / deteriorarea cardului fizic',
        screenTitle: 'Raporteaz\u0103 cardul pierdut sau deteriorat',
        nextButtonLabel: 'Urm\u0103torul',
        reasonTitle: 'De ce ai nevoie de un card nou?',
        cardDamaged: 'Cardul meu a fost deteriorat',
        cardLostOrStolen: 'Cardul meu a fost pierdut sau furat',
        confirmAddressTitle: 'V\u0103 rug\u0103m s\u0103 confirma\u021Bi adresa de expediere pentru noul dvs. card.',
        cardDamagedInfo: 'Noul dvs. card va sosi \u00EEn 2-3 zile lucr\u0103toare. Cardul dvs. actual va continua s\u0103 func\u021Bioneze p\u00E2n\u0103 c\u00E2nd activa\u021Bi noul card.',
        cardLostOrStolenInfo:
            'Cardul dvs. curent va fi dezactivat permanent imediat ce comanda dvs. este plasat\u0103. Majoritatea cardurilor ajung \u00EEn c\u00E2teva zile lucr\u0103toare.',
        address: 'Adres\u0103',
        deactivateCardButton: 'Dezactiveaz\u0103 cardul',
        shipNewCardButton: 'Expediaz\u0103 un card nou',
        addressError: 'Adresa este necesar\u0103',
        reasonError: 'Este necesar un motiv',
    },
    eReceipt: {
        guaranteed: 'Chitan\u021B\u0103 garantat\u0103',
        transactionDate: 'Data tranzac\u021Biei',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: '\u00CEncepe\u021Bi o conversa\u021Bie,',
            buttonText2: `ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `\u00CEncepe\u021Bi o conversa\u021Bie, ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            body: `Prime\u0219te bani pentru a vorbi cu prietenii t\u0103i! \u00CEncepe o conversa\u021Bie cu un cont nou Expensify \u0219i prime\u0219te $${CONST.REFERRAL_PROGRAM.REVENUE} c\u00E2nd devin clien\u021Bi.`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Trimite o cheltuial\u0103,',
            buttonText2: `ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `Trimite o cheltuial\u0103, prime\u0219ti $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            body: `Merit\u0103 s\u0103 fii pl\u0103tit! Trimite o cheltuial\u0103 c\u0103tre un cont nou Expensify \u0219i prime\u0219ti $${CONST.REFERRAL_PROGRAM.REVENUE} c\u00E2nd ei devin clien\u021Bi.`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.PAY_SOMEONE]: {
            buttonText1: 'Pl\u0103te\u0219te pe cineva,',
            buttonText2: `ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `Pl\u0103te\u0219te pe cineva, prime\u0219ti $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            body: `Trebuie s\u0103 cheltuie\u0219ti bani pentru a face bani! Pl\u0103te\u0219te pe cineva cu Expensify \u0219i prime\u0219ti $${CONST.REFERRAL_PROGRAM.REVENUE} c\u00E2nd devin client.`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            buttonText1: 'Invit\u0103 un prieten,',
            buttonText2: `ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `Ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            body: `Discut\u0103, pl\u0103te\u0219te, trimite sau \u00EEmparte o cheltuial\u0103 cu un prieten \u0219i prime\u0219ti $${CONST.REFERRAL_PROGRAM.REVENUE} c\u00E2nd acesta devine client. Altfel, doar \u00EEmparte linkul t\u0103u de invita\u021Bie!`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText1: `Ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            header: `Ob\u021Bine\u021Bi $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            body: `Discut\u0103, pl\u0103te\u0219te, trimite sau \u00EEmparte o cheltuial\u0103 cu un prieten \u0219i prime\u0219ti $${CONST.REFERRAL_PROGRAM.REVENUE} c\u00E2nd acesta devine client. Altfel, doar \u00EEmparte linkul t\u0103u de invita\u021Bie!`,
        },
        copyReferralLink: 'Copia\u021Bi linkul de invita\u021Bie',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Discut\u0103 cu specialistul t\u0103u de configurare \u00EEn',
            phrase2: 'pentru ajutor',
        },
        default: {
            phrase1: 'Mesaj',
            phrase2: 'pentru ajutor cu configurarea',
        },
    },
    violations: {
        allTagLevelsRequired: 'Toate etichetele sunt necesare',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) => `${rejectedBy} rejected this expense with the comment "${rejectReason}"`,
        billableExpense: 'Facturabil nu mai este valid',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Este necesar\u0103 chitan\u021Ba${formattedLimit ? ` peste ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categoria nu mai este valid\u0103',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `S-a aplicat o supratax\u0103 de conversie de ${surcharge}%`,
        customUnitOutOfPolicy: 'Rata nu este valabil\u0103 pentru acest spa\u021Biu de lucru',
        duplicatedTransaction: 'Duplicat',
        fieldRequired: 'C\u00E2mpurile raportului sunt necesare',
        futureDate: 'Data viitoare nu este permis\u0103',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Marcat cu ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Date mai vechi de ${maxAge} zile`,
        missingCategory: 'Categorie lips\u0103',
        missingComment: 'Descriere necesar\u0103 pentru categoria selectat\u0103',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Lipse\u0219te ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Suma difer\u0103 de distan\u021Ba calculat\u0103';
                case 'card':
                    return 'Suma mai mare dec\u00E2t tranzac\u021Bia cu cardul';
                default:
                    if (displayPercentVariance) {
                        return `Cantitate ${displayPercentVariance}% mai mare dec\u00E2t chitan\u021Ba scanat\u0103`;
                    }
                    return 'Suma mai mare dec\u00E2t bonul scanat';
            }
        },
        modifiedDate: 'Data difer\u0103 de chitan\u021Ba scanat\u0103',
        nonExpensiworksExpense: 'Cheltuial\u0103 non-Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Cheltuiala dep\u0103\u0219e\u0219te limita de aprobare automat\u0103 de ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Suma peste limita de ${formattedLimit}/persoan\u0103 pentru categorie`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Suma peste limita de ${formattedLimit}/persoan\u0103`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Suma peste limita de ${formattedLimit}/persoan\u0103`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Suma peste limita zilnic\u0103 ${formattedLimit}/persoan\u0103 pentru categorie`,
        receiptNotSmartScanned: 'Scanarea chitan\u021Bei este incomplet\u0103. V\u0103 rug\u0103m s\u0103 verifica\u021Bi detaliile manual.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = 'Este necesar\u0103 chitan\u021Ba';
            if (formattedLimit ?? category) {
                message += 'peste';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += ' limita de categorie';
                }
            }
            return message;
        },
        reviewRequired: 'Este necesar\u0103 o revizuire',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return 'As a language model AI developed by OpenAI, I need the original text in order to provide the translation. Please provide the text you want to be translated.';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `Nu se poate potrivi automat chitan\u021Ba din cauza conexiunii \u00EEntrerupte cu banca pe care ${email} trebuie s\u0103 o repare`
                    : 'Nu se poate potrivi automat chitan\u021Ba din cauza conexiunii \u00EEntrerupte cu banca pe care trebuie s\u0103 o repari';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin
                    ? `Cere-i lui ${member} s\u0103 marcheze ca \u0219i cash sau a\u0219teapt\u0103 7 zile \u0219i \u00EEncearc\u0103 din nou`
                    : '\u00CEn a\u0219teptarea fuziunii cu tranzac\u021Bia cardului.';
            }
            return 'As a language model AI developed by OpenAI, I need the original text in order to provide the translation. Please provide the text you want to be translated.';
        },
        brokenConnection530Error: 'Chitan\u021B\u0103 \u00EEn a\u0219teptare din cauza conexiunii bancare \u00EEntrerupte.',
        adminBrokenConnectionError: 'Chitan\u021B\u0103 \u00EEn a\u0219teptare din cauza conexiunii bancare \u00EEntrerupte. V\u0103 rug\u0103m s\u0103 rezolva\u021Bi \u00EEn',
        memberBrokenConnectionError:
            'Chitan\u021B\u0103 \u00EEn a\u0219teptare din cauza unei conexiuni bancare \u00EEntrerupte. V\u0103 rug\u0103m s\u0103 solicita\u021Bi unui administrator de spa\u021Biu de lucru s\u0103 rezolve.',
        markAsCashToIgnore: 'Marcheaz\u0103 ca numerar pentru a ignora \u0219i a solicita plat\u0103.',
        smartscanFailed: 'Scanarea chitan\u021Bei a e\u0219uat. Introduce\u021Bi detaliile manual.',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Lipse\u0219te ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} no longer valid`,
        taxAmountChanged: 'Suma impozitului a fost modificat\u0103',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Tax'} no longer valid`,
        taxRateChanged: 'Rata de impozitare a fost modificat\u0103',
        taxRequired: 'Lips\u0103 rat\u0103 de impozitare',
        none: "Your request doesn't include any text to translate. Could you please provide the text you want to be translated?",
        taxCodeToKeep: 'Alege\u021Bi ce cod fiscal s\u0103 p\u0103stra\u021Bi',
        tagToKeep: 'Alege\u021Bi ce etichet\u0103 s\u0103 p\u0103stra\u021Bi',
        isTransactionReimbursable: 'Alege\u021Bi dac\u0103 tranzac\u021Bia este rambursabil\u0103',
        merchantToKeep: 'Alege\u021Bi ce comerciant s\u0103 p\u0103stra\u021Bi',
        descriptionToKeep: 'Alege\u021Bi ce descriere s\u0103 p\u0103stra\u021Bi',
        categoryToKeep: 'Alege\u021Bi ce categorie s\u0103 p\u0103stra\u021Bi',
        isTransactionBillable: 'Alege\u021Bi dac\u0103 tranzac\u021Bia este facturabil\u0103',
        keepThisOne: 'P\u0103streaz\u0103 acesta',
        confirmDetails: `Confirm the details you're keeping`,
        confirmDuplicatesInfo: `The duplicate requests you don't keep will be held for the member to delete`,
        hold: 'Re\u021Bine',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} is required`,
    },
    violationDismissal: {
        rter: {
            manual: 'a marcat acest bon ca fiind cash',
        },
        duplicatedTransaction: {
            manual: 'a rezolvat duplicatul',
        },
    },
    videoPlayer: {
        play: 'Joac\u0103',
        pause: 'Pauz\u0103',
        fullscreen: 'Ecran complet',
        playbackSpeed: 'Vitez\u0103 de redare',
        expand: 'Sure, I can help you with that. However, I need the text or TypeScript function that you want to translate into Romanian. Please provide the text or code.',
        mute: 'Mutare',
        unmute: 'Dezactivare mutare',
        normal: 'Normal',
    },
    exitSurvey: {
        header: '\u00CEnainte de a pleca',
        reasonPage: {
            title: 'V\u0103 rug\u0103m s\u0103 ne spune\u021Bi de ce pleca\u021Bi',
            subtitle: '\u00CEnainte de a pleca, v\u0103 rug\u0103m s\u0103 ne spune\u021Bi de ce a\u021Bi dori s\u0103 trece\u021Bi la Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Am nevoie de o func\u021Bie care este disponibil\u0103 doar \u00EEn Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Nu \u00EEn\u021Beleg cum s\u0103 folosesc New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '\u00CEn\u021Beleg cum s\u0103 folosesc New Expensify, dar prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ce func\u021Bionalitate ave\u021Bi nevoie care nu este disponibil\u0103 \u00EEn New Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ce \u00EEncerci s\u0103 faci?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'De ce preferi Expensify Classic?',
        },
        responsePlaceholder: 'As a language model AI developed by OpenAI, I need the text to be translated in order to provide the correct translation.',
        thankYou: 'Mul\u021Bumim pentru feedback!',
        thankYouSubtitle: 'R\u0103spunsurile tale ne vor ajuta s\u0103 construim un produs mai bun pentru a realiza lucruri. Mul\u021Bumim foarte mult!',
        goToExpensifyClassic: 'Comuta\u021Bi la Expensify Classic',
        offlineTitle: 'Se pare c\u0103 ai r\u0103mas blocat aici...',
        offline:
            'Se pare c\u0103 e\u0219ti offline. Din p\u0103cate, Expensify Classic nu func\u021Bioneaz\u0103 offline, dar New Expensify func\u021Bioneaz\u0103. Dac\u0103 preferi s\u0103 folose\u0219ti Expensify Classic, \u00EEncearc\u0103 din nou c\u00E2nd ai o conexiune la internet.',
        quickTip: 'Sfat rapid...',
        quickTipSubTitle: 'Pute\u021Bi merge direct la Expensify Classic vizit\u00E2nd expensify.com. Ad\u0103uga\u021Bi-l la favorite pentru o scurt\u0103tur\u0103 u\u0219oar\u0103!',
        bookACall: 'Rezerva\u021Bi un apel',
        noThanks: 'Nu, mul\u021Bumesc',
        bookACallTitle: 'Dori\u021Bi s\u0103 vorbi\u021Bi cu un manager de produs?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Discut\u00E2nd direct despre cheltuieli \u0219i rapoarte',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Capacitatea de a face totul pe mobil',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'C\u0103l\u0103torii \u0219i cheltuieli la viteza unei conversa\u021Bii',
        },
        bookACallTextTop: 'Prin trecerea la Expensify Classic, vei pierde:',
        bookACallTextBottom:
            'Am fi \u00EEnc\u00E2nta\u021Bi s\u0103 avem o convorbire cu tine pentru a \u00EEn\u021Belege de ce. Po\u021Bi programa o apelare cu unul dintre managerii no\u0219tri de produs seniori pentru a discuta nevoile tale.',
        takeMeToExpensifyClassic: 'Du-m\u0103 la Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'A ap\u0103rut o eroare \u00EEn timpul \u00EEnc\u0103rc\u0103rii mai multor mesaje.',
        tryAgain: '\u00CEncearc\u0103 din nou',
    },
    systemMessage: {
        mergedWithCashTransaction: 'a asociat un bon fiscal cu aceast\u0103 tranzac\u021Bie',
    },
    subscription: {
        authenticatePaymentCard: 'Autentifica\u021Bi cardul de plat\u0103',
        mobileReducedFunctionalityMessage: 'Nu pute\u021Bi face modific\u0103ri la abonamentul dvs. \u00EEn aplica\u021Bia mobil\u0103.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Perioad\u0103 de \u00EEncercare gratuit\u0103: ${numOfDays} ${numOfDays === 1 ? 'zi' : 'zile'} r\u0103mase`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Informa\u021Biile dvs. de plat\u0103 sunt dep\u0103\u0219ite',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Actualiza\u021Bi cardul de plat\u0103 p\u00E2n\u0103 la ${date} pentru a continua s\u0103 utiliza\u021Bi toate caracteristicile preferate.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Informa\u021Biile dvs. de plat\u0103 sunt dep\u0103\u0219ite',
                subtitle: 'V\u0103 rug\u0103m s\u0103 actualiza\u021Bi informa\u021Biile de plat\u0103.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Informa\u021Biile dvs. de plat\u0103 sunt dep\u0103\u0219ite',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Plata dvs. este restant\u0103. V\u0103 rug\u0103m s\u0103 pl\u0103ti\u021Bi factura p\u00E2n\u0103 la ${date} pentru a evita \u00EEntreruperea serviciului.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Informa\u021Biile dvs. de plat\u0103 sunt dep\u0103\u0219ite',
                subtitle: 'Plata dvs. este \u00EEnt\u00E2rziat\u0103. V\u0103 rug\u0103m s\u0103 achita\u021Bi factura.',
            },
            billingDisputePending: {
                title: 'Cardul dvs. nu a putut fi debitat',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Ai contestat suma de ${amountOwed} facturat\u0103 pe cardul care se termin\u0103 \u00EEn ${cardEnding}. Contul t\u0103u va fi blocat p\u00E2n\u0103 c\u00E2nd disputa este rezolvat\u0103 cu banca ta.`,
            },
            cardAuthenticationRequired: {
                title: 'Cardul dvs. nu a putut fi debitat',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Cardul dvs. de plat\u0103 nu a fost autentificat complet. V\u0103 rug\u0103m s\u0103 finaliza\u021Bi procesul de autentificare pentru a activa cardul dvs. de plat\u0103 care se termin\u0103 \u00EEn ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Cardul dvs. nu a putut fi debitat',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Cardul dvs. de plat\u0103 a fost refuzat din cauza fondurilor insuficiente. V\u0103 rug\u0103m s\u0103 \u00EEncerca\u021Bi din nou sau s\u0103 ad\u0103uga\u021Bi un nou card de plat\u0103 pentru a achita soldul dvs. de ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Cardul dvs. nu a putut fi debitat',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Cardul dvs. de plat\u0103 a expirat. V\u0103 rug\u0103m s\u0103 ad\u0103uga\u021Bi un nou card de plat\u0103 pentru a achita soldul dvs. restant de ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Cardul t\u0103u expir\u0103 \u00EEn cur\u00E2nd',
                subtitle:
                    'Cardul dvs. de plat\u0103 va expira la sf\u00E2r\u0219itul acestei luni. Face\u021Bi clic pe meniul cu trei puncte de mai jos pentru a-l actualiza \u0219i a continua s\u0103 utiliza\u021Bi toate func\u021Biile dvs. preferate.',
            },
            retryBillingSuccess: {
                title: 'Succes!',
                subtitle: 'Cardul dvs. a fost facturat cu succes.',
            },
            retryBillingError: {
                title: 'Cardul dvs. nu a putut fi debitat',
                subtitle:
                    '\u00CEnainte de a \u00EEncerca din nou, v\u0103 rug\u0103m s\u0103 suna\u021Bi direct la banca dvs. pentru a autoriza pl\u0103\u021Bile Expensify \u0219i pentru a elimina orice bloc\u0103ri. Altfel, \u00EEncerca\u021Bi s\u0103 ad\u0103uga\u021Bi un alt card de plat\u0103.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Ai contestat suma de ${amountOwed} facturat\u0103 pe cardul care se termin\u0103 \u00EEn ${cardEnding}. Contul t\u0103u va fi blocat p\u00E2n\u0103 c\u00E2nd disputa este rezolvat\u0103 cu banca ta.`,
            preTrial: {
                title: '\u00CEncepe\u021Bi un proces gratuit',
                subtitleStart: 'Ca urm\u0103tor pas,',
                subtitleLink: 'finaliza\u021Bi lista dvs. de configurare',
                subtitleEnd: 'astfel \u00EEnc\u00E2t echipa ta poate \u00EEncepe s\u0103 cheltuie.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Perioada de prob\u0103: mai sunt ${numOfDays} ${numOfDays === 1 ? 'zi' : 'zile'}!`,
                subtitle: 'Ad\u0103uga\u021Bi un card de plat\u0103 pentru a continua s\u0103 utiliza\u021Bi toate func\u021Biile dvs. preferate.',
            },
            trialEnded: {
                title: 'Perioada ta de \u00EEncercare gratuit\u0103 s-a \u00EEncheiat',
                subtitle: 'Ad\u0103uga\u021Bi un card de plat\u0103 pentru a continua s\u0103 utiliza\u021Bi toate func\u021Biile dvs. preferate.',
            },
            earlyDiscount: {
                claimOffer: 'Revendica\u021Bi oferta',
                noThanks: 'Nu, mul\u021Bumesc',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% off your first year!`,
                    phrase2: `Just add a payment card and start an annual subscription.`,
                },
                onboardingChatTitle: {
                    phrase1: 'Ofert\u0103 limitat\u0103 \u00EEn timp:',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% off your first year!`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Claim within ${days > 0 ? `${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Plat\u0103',
            subtitle: 'Ad\u0103uga\u021Bi un card pentru a pl\u0103ti abonamentul dvs. Expensify.',
            addCardButton: 'Adaug\u0103 card de plat\u0103',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Data urm\u0103toarei pl\u0103\u021Bi este ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Cardul se termin\u0103 \u00EEn ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nume: ${name}, Expirare: ${expiration}, Moned\u0103: ${currency}`,
            changeCard: 'Schimb\u0103 cardul de plat\u0103',
            changeCurrency: 'Schimb\u0103 moneda de plat\u0103',
            cardNotFound: 'Niciun card de plat\u0103 ad\u0103ugat',
            retryPaymentButton: 'Re\u00EEncearc\u0103 plata',
            authenticatePayment: 'Autentifica\u021Bi plata',
            requestRefund: 'Solicitare rambursare',
            requestRefundModal: {
                phrase1:
                    'Ob\u021Binerea unei ramburs\u0103ri este u\u0219oar\u0103, trebuie doar s\u0103-\u021Bi retrogradezi contul \u00EEnainte de urm\u0103toarea dat\u0103 de facturare \u0219i vei primi o rambursare.',
                phrase2:
                    'Aten\u021Bie: Dac\u0103 \u00EE\u021Bi retrogradezi contul, spa\u021Biul/spa\u021Biile tale de lucru vor fi \u0219terse. Aceast\u0103 ac\u021Biune nu poate fi anulat\u0103, dar \u00EEntotdeauna po\u021Bi crea un nou spa\u021Biu de lucru dac\u0103 \u00EE\u021Bi schimbi p\u0103rerea.',
                confirm: '\u0218terge spa\u021Biul/spa\u021Biile de lucru \u0219i retrogradeaz\u0103',
            },
            viewPaymentHistory: 'Vizualizeaz\u0103 istoricul pl\u0103\u021Bilor',
        },
        yourPlan: {
            title: 'Planul t\u0103u',
            collect: {
                title: 'Colecteaz\u0103',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De la ${lower}/membru activ cu Cardul Expensify, la ${upper}/membru activ f\u0103r\u0103 Cardul Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De la ${lower}/membru activ cu Cardul Expensify, la ${upper}/membru activ f\u0103r\u0103 Cardul Expensify.`,
                benefit1: 'Scan\u0103ri Smart nelimitate \u0219i urm\u0103rirea distan\u021Bei',
                benefit2: 'Carduri Expensify cu Limite Inteligente',
                benefit3: 'Plata facturilor \u0219i facturare',
                benefit4: 'Aprob\u0103ri de cheltuieli',
                benefit5: 'Rambursare ACH',
                benefit6: 'Integr\u0103ri QuickBooks \u0219i Xero',
                benefit7: 'Informa\u021Bii personalizate \u0219i raportare',
            },
            control: {
                title: 'Control',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De la ${lower}/membru activ cu Cardul Expensify, la ${upper}/membru activ f\u0103r\u0103 Cardul Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De la ${lower}/membru activ cu Cardul Expensify, la ${upper}/membru activ f\u0103r\u0103 Cardul Expensify.`,
                benefit1: 'Totul \u00EEn Collect, plus:',
                benefit2: 'Integr\u0103ri NetSuite \u0219i Sage Intacct',
                benefit3: 'Sincronizarea dintre Certinia \u0219i Workday',
                benefit4: 'Aprobatori multipli de cheltuieli',
                benefit5: 'SAML/SSO',
                benefit6: 'Bugetare',
            },
            saveWithExpensifyTitle: 'Economisi\u021Bi cu cardul Expensify',
            saveWithExpensifyDescription: 'Utiliza\u021Bi calculatorul nostru de economii pentru a vedea cum banii \u00EEnapoi de la Cardul Expensify pot reduce factura dvs. Expensify.',
            saveWithExpensifyButton: 'Afla\u021Bi mai multe',
        },
        details: {
            title: 'Detalii abonament',
            annual: 'Abonament anual',
            taxExempt: 'Solicit\u0103 statutul de scutire de taxe',
            taxExemptEnabled: 'Exempt de taxe',
            payPerUse: 'Plat\u0103-per-utilizare',
            subscriptionSize: 'Dimensiunea abonamentului',
            headsUp:
                'Aten\u021Bie: Dac\u0103 nu stabile\u0219ti acum dimensiunea abonamentului t\u0103u, o vom seta automat la num\u0103rul de membri activi din prima lun\u0103. Apoi, te vei angaja s\u0103 pl\u0103te\u0219ti pentru cel pu\u021Bin acest num\u0103r de membri pentru urm\u0103toarele 12 luni. \u00CE\u021Bi po\u021Bi m\u0103ri dimensiunea abonamentului \u00EEn orice moment, dar nu o po\u021Bi mic\u0219ora p\u00E2n\u0103 c\u00E2nd abonamentul t\u0103u se termin\u0103.',
            zeroCommitment: 'Zero angajament la rata de abonament anual\u0103 redus\u0103',
        },
        subscriptionSize: {
            title: 'Dimensiunea abonamentului',
            yourSize: 'Dimensiunea abonamentului dvs. este num\u0103rul de locuri deschise care pot fi ocupate de orice membru activ \u00EEntr-o lun\u0103 dat\u0103.',
            eachMonth:
                '\u00CEn fiecare lun\u0103, abonamentul t\u0103u acoper\u0103 p\u00E2n\u0103 la num\u0103rul de membri activi stabilit mai sus. De fiecare dat\u0103 c\u00E2nd m\u0103re\u0219ti dimensiunea abonamentului t\u0103u, vei \u00EEncepe un nou abonament de 12 luni la acea nou\u0103 dimensiune.',
            note: 'Not\u0103: Un membru activ este oricine a creat, editat, trimis, aprobat, decontat sau exportat date despre cheltuieli legate de spa\u021Biul de lucru al companiei dumneavoastr\u0103.',
            confirmDetails: 'Confirma\u021Bi detaliile noii dvs. abonamente anuale:',
            subscriptionSize: 'Dimensiunea abonamentului',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} active members/month`,
            subscriptionRenews: 'Abonamentul se re\u00EEnnoie\u0219te',
            youCantDowngrade: 'Nu pute\u021Bi retrograda \u00EEn timpul abonamentului dvs. anual.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `V-a\u021Bi angajat deja la un abonament anual de ${size} membri activi pe lun\u0103 p\u00E2n\u0103 la ${date}. Pute\u021Bi trece la un abonament pay-per-use pe ${date} dezactiv\u00E2nd re\u00EEnnoirea automat\u0103.`,
            error: {
                size: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi o dimensiune valid\u0103 a abonamentului.',
                sameSize: 'V\u0103 rug\u0103m s\u0103 introduce\u021Bi un num\u0103r diferit fa\u021B\u0103 de dimensiunea actual\u0103 a abonamentului dvs.',
            },
        },
        paymentCard: {
            addPaymentCard: 'Adaug\u0103 card de plat\u0103',
            enterPaymentCardDetails: 'Introduce\u021Bi detaliile cardului dvs. de plat\u0103',
            security:
                'Expensify respect\u0103 normele PCI-DSS, utilizeaz\u0103 criptare la nivel de banc\u0103 \u0219i folose\u0219te o infrastructur\u0103 redundant\u0103 pentru a proteja datele tale.',
            learnMoreAboutSecurity: 'Afla\u021Bi mai multe despre securitatea noastr\u0103.',
        },
        subscriptionSettings: {
            title: 'Set\u0103ri abonament',
            autoRenew: 'Re\u00EEnnoire automat\u0103',
            autoIncrease: 'Auto-cre\u0219tere anual\u0103 a locurilor',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Economisi\u021Bi p\u00E2n\u0103 la ${amountWithCurrency}/lun\u0103 per membru activ`,
            automaticallyIncrease:
                'Cre\u0219te\u021Bi automat num\u0103rul locurilor anuale pentru a face fa\u021B\u0103 membrilor activi care dep\u0103\u0219esc dimensiunea abonamentului dvs. Not\u0103: Acest lucru va prelungi data de \u00EEncheiere a abonamentului dvs. anual.',
            disableAutoRenew: 'Dezactiveaz\u0103 re\u00EEnnoirea automat\u0103',
            helpUsImprove: 'Ajut\u0103-ne s\u0103 \u00EEmbun\u0103t\u0103\u021Bim Expensify',
            whatsMainReason: 'Care este principalul motiv pentru care dezactivezi re\u00EEnnoirea automat\u0103?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Se re\u00EEnnoie\u0219te pe ${date}.`,
        },
        requestEarlyCancellation: {
            title: 'Solicit\u0103 anularea anticipat\u0103',
            subtitle: 'Care este principalul motiv pentru care solicita\u021Bi anularea anticipat\u0103?',
            subscriptionCanceled: {
                title: 'Abonament anulat',
                subtitle: 'Abonamentul t\u0103u anual a fost anulat.',
                info: 'Dac\u0103 dori\u021Bi s\u0103 continua\u021Bi s\u0103 utiliza\u021Bi spa\u021Biul/spa\u021Biile dvs. de lucru pe baza de plat\u0103-per-utilizare, sunte\u021Bi preg\u0103tit.',
                preventFutureActivity: {
                    part1: 'Dac\u0103 dori\u021Bi s\u0103 preveni\u021Bi activitatea \u0219i taxele viitoare, trebuie s\u0103',
                    link: '\u0219terge\u021Bi spa\u021Biul/spa\u021Biile dvs. de lucru',
                    part2: 'Re\u021Bine\u021Bi c\u0103 atunci c\u00E2nd \u0219terge\u021Bi spa\u021Biul/spa\u021Biile dvs. de lucru, vi se va percepe orice activitate restant\u0103 care a fost acumulat\u0103 \u00EEn cursul lunii calendaristice curente.',
                },
            },
            requestSubmitted: {
                title: 'Cerere trimis\u0103',
                subtitle: {
                    part1: 'Mul\u021Bumim c\u0103 ne-ai informat c\u0103 e\u0219ti interesat s\u0103 \u00EE\u021Bi anulezi abonamentul. \u00CE\u021Bi vom analiza cererea \u0219i vom reveni \u00EEn cur\u00E2nd prin intermediul chat-ului t\u0103u.',
                    link: 'Concierge',
                    part2: "The task doesn't provide any text to translate. Please provide the text for translation.",
                },
            },
            acknowledgement: {
                part1: 'Prin solicitarea anul\u0103rii anticipate, recunosc \u0219i sunt de acord c\u0103 Expensify nu are nicio obliga\u021Bie de a acorda o astfel de cerere \u00EEn conformitate cu Expensify',
                link: 'Termeni \u0219i Condi\u021Bii',
                part2: 'sau alt acord de servicii aplicabil \u00EEntre mine \u0219i Expensify \u0219i c\u0103 Expensify p\u0103streaz\u0103 discre\u021Bia exclusiv\u0103 \u00EEn ceea ce prive\u0219te acordarea oric\u0103rei astfel de cereri.',
            },
        },
    },
    feedbackSurvey: {
        tooLimited: 'Func\u021Bionalitatea necesit\u0103 \u00EEmbun\u0103t\u0103\u021Bire',
        tooExpensive: 'Prea scump',
        inadequateSupport: 'Suport pentru clien\u021Bi inadecvat',
        businessClosing: 'Compania se \u00EEnchide, se restr\u00E2nge sau este achizi\u021Bionat\u0103',
        additionalInfoTitle: 'La ce software te mu\u021Bi \u0219i de ce?',
        additionalInfoInputLabel: 'As a language model AI developed by OpenAI, I need the text to be translated in order to provide the correct translation.',
    },
    roomChangeLog: {
        updateRoomDescription: 'seteaz\u0103 descrierea camerei la:',
        clearRoomDescription: 'a \u0219ters descrierea camerei',
    },
    delegate: {
        switchAccount: 'Schimb\u0103 conturile:',
        copilotDelegatedAccess: 'Copilot: Acces delegat',
        copilotDelegatedAccessDescription: 'Permite\u021Bi altor membri s\u0103 acceseze contul dvs.',
        addCopilot: 'Adaug\u0103 copilot',
        membersCanAccessYourAccount: 'Ace\u0219ti membri pot accesa contul t\u0103u:',
        youCanAccessTheseAccounts: 'Pute\u021Bi accesa aceste conturi prin intermediul comutatorului de conturi:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Complet';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Limitat';
                default:
                    return 'As a language model AI developed by OpenAI, I need the original text in order to provide the translation. Please provide the text you want to be translated.';
            }
        },
        genericError: 'Hopa, ceva nu a mers bine. Te rog \u00EEncearc\u0103 din nou.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `\u00EEn numele lui ${delegator}`,
        accessLevel: 'Nivel de acces',
        confirmCopilot: 'Confirm\u0103 copilotul t\u0103u de mai jos.',
        accessLevelDescription:
            'Alege\u021Bi un nivel de acces de mai jos. At\u00E2t accesul complet, c\u00E2t \u0219i cel limitat permit copilo\u021Bilor s\u0103 vizualizeze toate conversa\u021Biile \u0219i cheltuielile.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Permite\u021Bi unui alt membru s\u0103 efectueze toate ac\u021Biunile \u00EEn contul dvs., \u00EEn numele dvs. Include chat, trimitere, aprob\u0103ri, pl\u0103\u021Bi, actualiz\u0103ri de set\u0103ri \u0219i multe altele.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Permite\u021Bi unui alt membru s\u0103 efectueze majoritatea ac\u021Biunilor \u00EEn contul dvs., \u00EEn numele dvs. Exclude aprob\u0103rile, pl\u0103\u021Bile, respingerile \u0219i re\u021Binerile.';
                default:
                    return 'As a language model AI developed by OpenAI, I need the original text in order to provide the translation. Please provide the text you want to be translated.';
            }
        },
        removeCopilot: 'Elimina\u021Bi copilotul',
        removeCopilotConfirmation: 'E\u0219ti sigur c\u0103 vrei s\u0103 \u00EEnl\u0103turi acest copilot?',
        changeAccessLevel: 'Schimb\u0103 nivelul de acces',
        makeSureItIsYou: 'S\u0103 ne asigur\u0103m c\u0103 e\u0219ti tu',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul magic trimis la ${contactMethod} pentru a ad\u0103uga un copilot. Acesta ar trebui s\u0103 ajung\u0103 \u00EEntr-un minut sau dou\u0103.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) =>
            `V\u0103 rug\u0103m s\u0103 introduce\u021Bi codul magic trimis la ${contactMethod} pentru a actualiza copilotul dumneavoastr\u0103.`,
        notAllowed: 'Nu a\u0219a de repede...',
        noAccessMessage: 'Ca \u0219i copilot, nu ai acces la \naceast\u0103 pagin\u0103. Ne pare r\u0103u!',
        notAllowedMessageStart: `As a`,
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => `pentru ${accountOwnerEmail}, nu ave\u021Bi permisiunea de a efectua aceast\u0103 ac\u021Biune. Ne pare r\u0103u!`,
    },
    debug: {
        debug: 'Depanare',
        details: 'Detalii',
        JSON: 'JSON',
        reportActions: 'Ac\u021Biuni',
        reportActionPreview: 'Previzualizare',
        nothingToPreview: 'Nimic de previzualizat',
        editJson: 'Editeaz\u0103 JSON:',
        preview: 'Previzualizare:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Lipse\u0219te ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Proprietate invalid\u0103: ${propertyName} - A\u0219teptat: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valoare invalid\u0103 - A\u0219teptat: ${expectedValues}`,
        missingValue: 'Valoare lips\u0103',
        createReportAction: 'Creeaz\u0103 Ac\u021Biunea Raport',
        reportAction: 'Raporteaz\u0103 Ac\u021Biunea',
        report: 'Raport',
        transaction: 'Tranzac\u021Bie',
        violations: '\u00CEnc\u0103lc\u0103ri',
        transactionViolation: '\u00CEnc\u0103lcare a Tranzac\u021Biei',
        hint: 'Modific\u0103rile de date nu vor fi trimise la backend',
        textFields: 'C\u00E2mpuri de text',
        numberFields: 'C\u00E2mpuri numerice',
        booleanFields: 'C\u00E2mpuri booleane',
        constantFields: 'C\u00E2mpuri constante',
        dateTimeFields: 'C\u00E2mpuri DateTime',
        date: 'Data',
        time: 'Timp',
        none: "Your request doesn't include any text to translate. Could you please provide the text you want to be translated?",
        visibleInLHN: 'Vizibil \u00EEn LHN',
        GBR: 'ROU',
        RBR: 'Your request is not clear. Could you please provide the text or TypeScript function that you want to translate into Romanian?',
        true: 'adev\u0103rat',
        false: 'false',
        viewReport: 'Vizualizeaz\u0103 Raportul',
        viewTransaction: 'Vizualizeaz\u0103 tranzac\u021Bia',
        createTransactionViolation: 'Creeaz\u0103 \u00EEnc\u0103lcarea tranzac\u021Biei',
        reasonVisibleInLHN: {
            hasDraftComment: 'Are comentariu \u00EEn ciorn\u0103',
            hasGBR: 'Are GBR',
            hasRBR: 'Are RBR',
            pinnedByUser: 'Fixat de membru',
            hasIOUViolations: 'Are \u00EEnc\u0103lc\u0103ri IOU',
            hasAddWorkspaceRoomErrors: 'Are erori la ad\u0103ugarea camerei de lucru',
            isUnread: 'Este necitit (mod focalizare)',
            isArchived: 'Este arhivat (modul cel mai recent)',
            isSelfDM: 'Este DM personal',
            isFocused: 'Este temporar concentrat',
        },
        reasonGBR: {
            hasJoinRequest: 'Are cerere de al\u0103turare (camera admin)',
            isUnreadWithMention: 'Este necitit cu men\u021Biune',
            isWaitingForAssigneeToCompleteAction: 'A\u0219teapt\u0103 ca destinatarul s\u0103 finalizeze ac\u021Biunea',
            hasChildReportAwaitingAction: 'Are raportul copil \u00EEn a\u0219teptare de ac\u021Biune',
            hasMissingInvoiceBankAccount: 'Lipse\u0219te contul bancar pentru factur\u0103',
        },
        reasonRBR: {
            hasErrors: 'Are erori \u00EEn raport sau \u00EEn datele ac\u021Biunilor raportului',
            hasViolations: 'Are \u00EEnc\u0103lc\u0103ri',
            hasTransactionThreadViolations: 'Are \u00EEnc\u0103lc\u0103ri ale firului de tranzac\u021Bie',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Exist\u0103 un raport care a\u0219teapt\u0103 ac\u021Biune',
            theresAReportWithErrors: 'Exist\u0103 un raport cu erori',
            theresAWorkspaceWithCustomUnitsErrors: 'Exist\u0103 un spa\u021Biu de lucru cu erori de unit\u0103\u021Bi personalizate',
            theresAProblemWithAWorkspaceMember: 'Exist\u0103 o problem\u0103 cu un membru al spa\u021Biului de lucru',
            theresAProblemWithAContactMethod: 'Exist\u0103 o problem\u0103 cu o metod\u0103 de contact',
            aContactMethodRequiresVerification: 'O metod\u0103 de contact necesit\u0103 verificare',
            theresAProblemWithAPaymentMethod: 'Exist\u0103 o problem\u0103 cu o metod\u0103 de plat\u0103',
            theresAProblemWithAWorkspace: 'Exist\u0103 o problem\u0103 cu un spa\u021Biu de lucru',
            theresAProblemWithYourReimbursementAccount: 'Exist\u0103 o problem\u0103 cu contul t\u0103u de rambursare',
            theresABillingProblemWithYourSubscription: 'Exist\u0103 o problem\u0103 de facturare cu abonamentul dvs.',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Abonamentul dumneavoastr\u0103 a fost re\u00EEnnoit cu succes',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'A ap\u0103rut o problem\u0103 \u00EEn timpul sincroniz\u0103rii unei conexiuni de spa\u021Biu de lucru',
            theresAProblemWithYourWallet: 'Exist\u0103 o problem\u0103 cu portofelul t\u0103u',
            theresAProblemWithYourWalletTerms: 'Exist\u0103 o problem\u0103 cu termenii portofelului t\u0103u',
        },
    },
    emptySearchView: {
        takeATour: 'F\u0103 o tur\u0103',
    },
    tour: {
        takeATwoMinuteTour: 'Face\u021Bi un tur de 2 minute',
        exploreExpensify: 'Explora\u021Bi tot ceea ce Expensify are de oferit',
    },
    migratedUserWelcomeModal: {
        title: 'C\u0103l\u0103torii \u0219i cheltuieli, la viteza unei conversa\u021Bii',
        subtitle: 'Noul Expensify are aceea\u0219i automatizare excelent\u0103, dar acum cu o colaborare uimitoare:',
        confirmText: 'Hai s\u0103 mergem!',
        features: {
            chat: '<strong>Discut\u0103 direct pe orice cheltuial\u0103</strong>, raport, sau spa\u021Biu de lucru',
            scanReceipt: '<strong>Scaneaz\u0103 chitan\u021Be</strong> \u0219i prime\u0219te banii \u00EEnapoi',
            crossPlatform: 'Face\u021Bi <strong>totul</strong> de pe telefonul dvs sau browser',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: {
            part1: '\u00CEncepe\u021Bi',
            part2: 'aici!',
        },
        saveSearchTooltip: {
            part1: 'Redenumi\u021Bi c\u0103ut\u0103rile salvate dvs.',
            part2: 'aici!',
        },
        quickActionButton: {
            part1: 'Ac\u021Biune rapid\u0103!',
            part2: 'Doar la o atingere distan\u021B\u0103',
        },
        workspaceChatCreate: {
            part1: 'Trimite-\u021Bi',
            part2: 'cheltuieli',
            part3: 'aici!',
        },
        searchFilterButtonTooltip: {
            part1: 'Personalizeaz\u0103-\u021Bi c\u0103utarea',
            part2: 'aici!',
        },
        bottomNavInboxTooltip: {
            part1: 'Lista ta de lucruri de f\u0103cut',
            part2: '\uD83D\uDFE2 = gata pentru tine',
            part3: '\u00CEmi pare r\u0103u, dar nu a\u021Bi furnizat niciun text pentru a fi tradus. V\u0103 rug\u0103m s\u0103 furniza\u021Bi textul pe care dori\u021Bi s\u0103 \u00EEl traduc.',
        },
        workspaceChatTooltip: {
            part1: 'Trimite cheltuieli',
            part2: '\u0219i discut\u0103 cu',
            part3: 'aprobatori aici!',
        },
        globalCreateTooltip: {
            part1: 'Creeaz\u0103 cheltuieli',
            part2: ', \u00EEncepe\u021Bi s\u0103 discuta\u021Bi,',
            part3: '\u0219i multe altele!',
        },
        scanTestTooltip: {
            part1: 'Vrei s\u0103 vezi cum func\u021Bioneaz\u0103 Scan?',
            part2: '\u00CEncearc\u0103 un bon de test!',
            part3: 'Alege\u021Bi-ne',
            part4: 'manager de testare',
            part5: 'pentru a-l \u00EEncerca!',
            part6: 'Acum,',
            part7: 'trimite cheltuiala ta',
            part8: '\u0219i urm\u0103re\u0219te magia cum se \u00EEnt\u00E2mpl\u0103!',
        },
    },
    discardChangesConfirmation: {
        title: 'Renun\u021Ba\u021Bi la modific\u0103ri?',
        body: 'E\u0219ti sigur c\u0103 vrei s\u0103 renun\u021Bi la modific\u0103rile pe care le-ai f\u0103cut?',
        confirmText: 'Renun\u021B\u0103 la modific\u0103ri',
    },
};
export default translations satisfies TranslationDeepObject<typeof translations>;
