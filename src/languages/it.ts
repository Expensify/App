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
        count: 'Contare',
        cancel: 'Annulla',
        dismiss: 'Ignora',
        yes: 'Sì',
        no: 'No',
        ok: 'OK',
        notNow: 'Non ora',
        learnMore: 'Scopri di più.',
        buttonConfirm: 'Capito',
        name: 'Nome',
        attachment: 'Allegato',
        attachments: 'Allegati',
        center: 'Centro',
        from: 'Da',
        to: 'A',
        in: 'In',
        optional: 'Opzionale',
        new: 'Nuovo',
        search: 'Cerca',
        reports: 'Report',
        find: 'Trova',
        searchWithThreeDots: 'Cerca...',
        next: 'Successivo',
        previous: 'Precedente',
        goBack: 'Torna indietro',
        create: 'Crea',
        add: 'Aggiungi',
        resend: 'Invia di nuovo',
        save: 'Salva',
        select: 'Seleziona',
        deselect: 'Deseleziona',
        selectMultiple: 'Seleziona multipli',
        saveChanges: 'Salva le modifiche',
        submit: 'Invia',
        rotate: 'Ruota',
        zoom: 'Zoom',
        password: 'Password',
        magicCode: 'Magic code',
        twoFactorCode: 'Codice a due fattori',
        workspaces: 'Spazi di lavoro',
        inbox: 'Posta in arrivo',
        success: 'Successo',
        group: 'Gruppo',
        profile: 'Profilo',
        referral: 'Referenza',
        payments: 'Pagamenti',
        approvals: 'Approvazioni',
        wallet: 'Portafoglio',
        preferences: 'Preferenze',
        view: 'Visualizza',
        review: (reviewParams?: ReviewParams) => `Review${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Non',
        signIn: 'Accedi',
        signInWithGoogle: 'Accedi con Google',
        signInWithApple: 'Accedi con Apple',
        signInWith: 'Accedi con',
        continue: 'Continua',
        firstName: 'Nome',
        lastName: 'Cognome',
        scanning: 'Scansione',
        addCardTermsOfService: 'Termini di servizio di Expensify',
        perPerson: 'per persona',
        phone: 'Telefono',
        phoneNumber: 'Numero di telefono',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'e',
        or: 'o',
        details: 'Dettagli',
        privacy: 'Privacy',
        privacyPolicy: 'Informativa sulla privacy',
        hidden: 'Nascosto',
        visible: 'Visibile',
        delete: 'Elimina',
        archived: 'archiviato',
        contacts: 'Contatti',
        recents: 'Recenti',
        close: 'Chiudi',
        download: 'Scarica',
        downloading: 'Scaricamento',
        uploading: 'Caricamento in corso',
        pin: 'Pin',
        unPin: 'Rimuovi dal pin',
        back: 'Indietro',
        saveAndContinue: 'Salva e continua',
        settings: 'Impostazioni',
        termsOfService: 'Termini di Servizio',
        members: 'Membri',
        invite: 'Invita',
        here: 'qui',
        date: 'Data',
        dob: 'Data di nascita',
        currentYear: 'Anno corrente',
        currentMonth: 'Mese corrente',
        ssnLast4: 'Ultime 4 cifre del SSN',
        ssnFull9: 'Tutti i 9 cifre del SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Indirizzo linea ${lineNumber}`,
        personalAddress: 'Indirizzo personale',
        companyAddress: "Indirizzo dell'azienda",
        noPO: 'Niente caselle postali o indirizzi di caselle postali, per favore.',
        city: 'Città',
        state: 'Stato',
        streetAddress: 'Indirizzo stradale',
        stateOrProvince: 'Stato / Provincia',
        country: 'Paese',
        zip: 'Codice postale',
        zipPostCode: 'CAP / Codice postale',
        whatThis: "Cos'è questo?",
        iAcceptThe: 'Accetto il',
        remove: 'Rimuovi',
        admin: 'Admin',
        owner: 'Proprietario',
        dateFormat: 'YYYY-MM-DD',
        send: 'Invia',
        na: 'N/A',
        noResultsFound: 'Nessun risultato trovato',
        noResultsFoundMatching: ({searchString}: {searchString: string}) => `Nessun risultato trovato corrispondente a "${searchString}"`,
        recentDestinations: 'Destinazioni recenti',
        timePrefix: 'È',
        conjunctionFor: 'per',
        todayAt: 'Oggi alle',
        tomorrowAt: 'Domani alle',
        yesterdayAt: 'Ieri alle',
        conjunctionAt: 'at',
        conjunctionTo: 'a',
        genericErrorMessage: 'Ops... qualcosa è andato storto e la tua richiesta non può essere completata. Per favore riprova più tardi.',
        percentage: 'Percentuale',
        error: {
            invalidAmount: 'Importo non valido',
            acceptTerms: 'Devi accettare i Termini di Servizio per continuare',
            phoneNumber: `Per favore, inserisci un numero di telefono valido, con il prefisso internazionale (ad es. ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Questo campo è obbligatorio',
            requestModified: 'Questa richiesta è in fase di modifica da un altro membro.',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Limite di caratteri superato (${length}/${limit})`,
            dateInvalid: 'Si prega di selezionare una data valida',
            invalidDateShouldBeFuture: 'Si prega di scegliere oggi o una data futura',
            invalidTimeShouldBeFuture: 'Si prega di scegliere un orario almeno un minuto avanti',
            invalidCharacter: 'Carattere non valido',
            enterMerchant: 'Inserisci il nome di un commerciante',
            enterAmount: 'Inserisci un importo',
            missingMerchantName: 'Nome del commerciante mancante',
            missingAmount: 'Importo mancante',
            missingDate: 'Data mancante',
            enterDate: 'Inserisci una data',
            invalidTimeRange: 'Inserisci un orario utilizzando il formato a 12 ore (es. 14:30)',
            pleaseCompleteForm: 'Si prega di completare il modulo sopra per continuare',
            pleaseSelectOne: "Si prega di selezionare un'opzione sopra",
            invalidRateError: 'Per favore, inserisci una tariffa valida',
            lowRateError: 'La tariffa deve essere maggiore di 0',
            email: 'Per favore, inserisci un indirizzo email valido',
            login: "Si è verificato un errore durante l'accesso. Per favore riprova.",
        },
        comma: 'virgola',
        semicolon: 'semicolon',
        please: 'Per favore',
        contactUs: 'contattaci',
        pleaseEnterEmailOrPhoneNumber: "Per favore inserisci un'email o un numero di telefono",
        fixTheErrors: 'correggi gli errori',
        inTheFormBeforeContinuing: 'nel modulo prima di continuare',
        confirm: 'Conferma',
        reset: 'Reimposta',
        done: 'Fatto',
        more: 'Di più',
        debitCard: 'Carta di debito',
        bankAccount: 'Conto bancario',
        personalBankAccount: 'Conto bancario personale',
        businessBankAccount: 'Conto bancario aziendale',
        join: 'Unisciti',
        leave: 'Lasciare',
        decline: 'Rifiuta',
        transferBalance: 'Trasferisci saldo',
        cantFindAddress: 'Non riesci a trovare il tuo indirizzo?',
        enterManually: 'Inseriscilo manualmente',
        message: 'Messaggio',
        leaveThread: 'Abbandona discussione',
        you: 'Tu',
        youAfterPreposition: 'tu/voi (depending on the context)',
        your: 'tuo/tuoi/tuoi/tuo (depending on context and gender/number)',
        conciergeHelp: 'Si prega di contattare Concierge per assistenza.',
        youAppearToBeOffline: 'Sembri essere offline.',
        thisFeatureRequiresInternet: 'Questa funzione richiede una connessione internet attiva.',
        attachmentWillBeAvailableOnceBackOnline: "L'allegato sarà disponibile una volta tornato online.",
        errorOccurredWhileTryingToPlayVideo: 'Si è verificato un errore durante il tentativo di riprodurre questo video.',
        areYouSure: 'Sei sicuro?',
        verify: 'Verifica',
        yesContinue: 'Sì, continua.',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: 'Descrizione',
        title: 'Titolo',
        assignee: 'Assegnatario',
        createdBy: 'Creato da',
        with: 'con',
        shareCode: 'Condividi codice',
        share: 'Condividi',
        per: 'per',
        mi: 'miglio',
        km: 'chilometro',
        copied: 'Copiato!',
        someone: 'Qualcuno',
        total: 'Totale',
        edit: 'Modifica',
        letsDoThis: `Facciamolo!`,
        letsStart: `Iniziamo pure!`,
        showMore: 'Mostra di più',
        merchant: 'Commerciante',
        category: 'Categoria',
        report: 'Rapporto',
        billable: 'Fatturabile',
        nonBillable: 'Non-fatturabile',
        tag: 'Etichetta',
        receipt: 'Ricevuta',
        verified: 'Verificato',
        replace: 'Sostituire',
        distance: 'Distanza',
        mile: 'miglio',
        miles: 'miglia',
        kilometer: 'chilometro',
        kilometers: 'chilometri',
        recent: 'Recente',
        all: 'Tutti',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Seleziona una valuta',
        card: 'Carta',
        whyDoWeAskForThis: 'Perché lo chiediamo?',
        required: 'Richiesto',
        showing: 'Mostrando',
        of: 'di',
        default: 'Predefinito',
        update: 'Aggiorna',
        member: 'Membro',
        auditor: 'Revisore dei conti',
        role: 'Ruolo',
        currency: 'Valuta',
        rate: 'Valuta',
        emptyLHN: {
            title: 'Woohoo! Tutto aggiornato.',
            subtitleText1: 'Trova una chat utilizzando il',
            subtitleText2: 'pulsante sopra, o crea qualcosa usando il',
            subtitleText3: 'pulsante qui sotto.',
        },
        businessName: "Nome dell'azienda",
        clear: 'Chiaro',
        type: 'Tipo',
        action: 'Azione',
        expenses: 'Spese',
        tax: 'Tassa',
        shared: 'Condiviso',
        drafts: 'Bozze',
        finished: 'Finito',
        upgrade: 'Aggiorna',
        downgradeWorkspace: 'Declassa spazio di lavoro',
        companyID: 'ID azienda',
        userID: 'User ID',
        disable: 'Disabilita',
        export: 'Esporta',
        basicExport: 'Esportazione basica',
        initialValue: 'Valore iniziale',
        currentDate: 'La data odierna',
        value: 'Valore',
        downloadFailedTitle: 'Download non riuscito',
        downloadFailedDescription: 'Il tuo download non è stato completato. Per favore riprova più tardi.',
        filterLogs: 'Filtra registri',
        network: 'Rete',
        reportID: 'ID Rapporto',
        longID: 'ID lungo',
        bankAccounts: 'Conti bancari',
        chooseFile: 'Scegli file',
        dropTitle: 'Lascia andare',
        dropMessage: 'Trascina qui il tuo file',
        ignore: 'Ignore',
        enabled: 'Abilitato',
        disabled: 'Disabilitato',
        import: 'Importa',
        offlinePrompt: 'Non puoi eseguire questa azione in questo momento.',
        outstanding: 'Eccezionale',
        chats: 'Chat',
        tasks: 'Attività',
        unread: 'Non letto',
        sent: 'Inviato',
        links: 'Link',
        days: 'giorni',
        rename: 'Rinomina',
        address: 'Indirizzo',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Salta',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Hai bisogno di qualcosa di specifico? Chatta con il tuo account manager, ${accountManagerDisplayName}.`,
        chatNow: 'Chatta ora',
        workEmail: 'Email di lavoro',
        destination: 'Destinazione',
        subrate: 'Subrate',
        perDiem: 'Per diem',
        validate: 'Convalida',
        downloadAsPDF: 'Scarica come PDF',
        downloadAsCSV: 'Scarica come CSV',
        help: 'Aiuto',
        expenseReports: 'Report di spesa',
        rateOutOfPolicy: 'Valuta fuori politica',
        reimbursable: 'Rimborsabile',
        editYourProfile: 'Modifica il tuo profilo',
        comments: 'Commenti',
        sharedIn: 'Condiviso in',
        unreported: 'Non segnalato',
        explore: 'Esplora',
        todo: 'Da fare',
        invoice: 'Fattura',
        expense: 'Spesa',
        chat: 'Chatta',
        task: 'Compito',
        trip: 'Viaggio',
        apply: 'Applica',
        status: 'Stato',
        on: 'Su',
        before: 'Prima',
        after: 'Dopo',
        reschedule: 'Ripianifica',
        general: 'Generale',
        workspacesTabTitle: 'Spazi di lavoro',
        getTheApp: "Scarica l'app",
        scanReceiptsOnTheGo: 'Scansiona le ricevute dal tuo telefono',
        headsUp: 'Attenzione!',
    },
    supportalNoAccess: {
        title: 'Non così in fretta',
        description: 'Non sei autorizzato a eseguire questa azione quando il supporto è connesso.',
    },
    lockedAccount: {
        title: 'Account bloccato',
        description: 'Non sei autorizzato a completare questa azione poiché questo account è stato bloccato. Si prega di contattare concierge@expensify.com per i prossimi passi.',
    },
    location: {
        useCurrent: 'Usa la posizione attuale',
        notFound: 'Non siamo riusciti a trovare la tua posizione. Per favore riprova o inserisci un indirizzo manualmente.',
        permissionDenied: "Sembra che tu abbia negato l'accesso alla tua posizione.",
        please: 'Per favore',
        allowPermission: "consenti l'accesso alla posizione nelle impostazioni",
        tryAgain: 'e riprova.',
    },
    contact: {
        importContacts: 'Importa contatti',
        importContactsTitle: 'Importa i tuoi contatti',
        importContactsText: 'Importa i contatti dal tuo telefono così le tue persone preferite sono sempre a portata di tocco.',
        importContactsExplanation: 'così le tue persone preferite sono sempre a portata di tocco.',
        importContactsNativeText: 'Ancora un passo! Dacci il via libera per importare i tuoi contatti.',
    },
    anonymousReportFooter: {
        logoTagline: 'Unisciti alla discussione.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Accesso alla fotocamera',
        expensifyDoesNotHaveAccessToCamera: 'Expensify non può scattare foto senza accesso alla tua fotocamera. Tocca le impostazioni per aggiornare i permessi.',
        attachmentError: 'Errore allegato',
        errorWhileSelectingAttachment: 'Si è verificato un errore durante la selezione di un allegato. Per favore, riprova.',
        errorWhileSelectingCorruptedAttachment: 'Si è verificato un errore durante la selezione di un allegato danneggiato. Si prega di provare un altro file.',
        takePhoto: 'Scatta foto',
        chooseFromGallery: 'Scegli dalla galleria',
        chooseDocument: 'Scegli file',
        attachmentTooLarge: "L'allegato è troppo grande",
        sizeExceeded: "La dimensione dell'allegato supera il limite di 24 MB",
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `La dimensione dell'allegato supera il limite di ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: "L'allegato è troppo piccolo",
        sizeNotMet: "La dimensione dell'allegato deve essere superiore a 240 byte.",
        wrongFileType: 'Tipo di file non valido',
        notAllowedExtension: 'Questo tipo di file non è consentito. Si prega di provare un tipo di file diverso.',
        folderNotAllowedMessage: 'Il caricamento di una cartella non è consentito. Si prega di provare con un file diverso.',
        protectedPDFNotSupported: 'PDF protetto da password non è supportato',
        attachmentImageResized: "Questa immagine è stata ridimensionata per l'anteprima. Scarica per la risoluzione completa.",
        attachmentImageTooLarge: 'Questa immagine è troppo grande per essere visualizzata in anteprima prima del caricamento.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Puoi caricare solo fino a ${fileLimit} file alla volta.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `I file superano ${maxUploadSizeInMB} MB. Per favore riprova.`,
    },
    dropzone: {
        addAttachments: 'Aggiungi allegati',
        scanReceipts: 'Scansiona ricevute',
        replaceReceipt: 'Sostituisci ricevuta',
    },
    filePicker: {
        fileError: 'Errore del file',
        errorWhileSelectingFile: 'Si è verificato un errore durante la selezione di un file. Per favore riprova.',
    },
    connectionComplete: {
        title: 'Connessione completata',
        supportingText: "Puoi chiudere questa finestra e tornare all'app Expensify.",
    },
    avatarCropModal: {
        title: 'Modifica foto',
        description: 'Trascina, ingrandisci e ruota la tua immagine come preferisci.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nessuna estensione trovata per il tipo MIME',
        problemGettingImageYouPasted: "Si è verificato un problema nel recuperare l'immagine che hai incollato.",
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La lunghezza massima del commento è di ${formattedMaxLength} caratteri.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La lunghezza massima del titolo del compito è di ${formattedMaxLength} caratteri.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Aggiorna app',
        updatePrompt: "È disponibile una nuova versione di questa app.  \nAggiorna ora o riavvia l'app più tardi per scaricare le ultime modifiche.",
    },
    deeplinkWrapper: {
        launching: 'Avvio di Expensify',
        expired: 'La tua sessione è scaduta.',
        signIn: 'Per favore accedi di nuovo.',
        redirectedToDesktopApp: "Ti abbiamo reindirizzato all'app desktop.",
        youCanAlso: 'Puoi anche',
        openLinkInBrowser: 'apri questo link nel tuo browser',
        loggedInAs: ({email}: LoggedInAsParams) => `Sei connesso come ${email}. Fai clic su "Apri link" nel prompt per accedere all'app desktop con questo account.`,
        doNotSeePrompt: 'Non riesci a vedere il prompt?',
        tryAgain: 'Riprova',
        or: ', o',
        continueInWeb: "continua all'app web",
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra,\nsei connesso!',
        successfulSignInDescription: 'Torna alla tua scheda originale per continuare.',
        title: 'Ecco il tuo codice magico',
        description: 'Inserisci il codice dal dispositivo dove è stato originariamente richiesto',
        doNotShare: 'Non condividere il tuo codice con nessuno. Expensify non te lo chiederà mai!',
        or: ', o',
        signInHere: 'accedi qui',
        expiredCodeTitle: 'Codice magico scaduto',
        expiredCodeDescription: 'Torna al dispositivo originale e richiedi un nuovo codice',
        successfulNewCodeRequest: 'Codice richiesto. Si prega di controllare il dispositivo.',
        tfaRequiredTitle: 'Autenticazione a due fattori richiesta',
        tfaRequiredDescription: 'Inserisci il codice di autenticazione a due fattori dove stai cercando di accedere.',
        requestOneHere: 'richiedine uno qui.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Pagato da',
        whatsItFor: 'A cosa serve?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nome, email o numero di telefono',
        findMember: 'Trova un membro',
        searchForSomeone: 'Cerca qualcuno',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Invia una spesa, riferisci al tuo capo',
            subtitleText: 'Vuoi che anche il tuo capo usi Expensify? Basta inviare loro una spesa e ci occuperemo del resto.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Prenota una chiamata',
    },
    hello: 'Ciao',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Inizia qui sotto.',
        anotherLoginPageIsOpen: "Un'altra pagina di accesso è aperta.",
        anotherLoginPageIsOpenExplanation: 'Hai aperto la pagina di accesso in una scheda separata. Effettua il login da quella scheda.',
        welcome: 'Benvenuto!',
        welcomeWithoutExclamation: 'Benvenuto',
        phrase2: 'I soldi parlano. E ora che chat e pagamenti sono in un unico posto, è anche facile.',
        phrase3: 'I tuoi pagamenti ti arrivano velocemente quanto riesci a far capire il tuo punto di vista.',
        enterPassword: 'Per favore inserisci la tua password',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, è sempre un piacere vedere una nuova faccia da queste parti!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Inserisci il codice magico inviato a ${login}. Dovrebbe arrivare entro un minuto o due.`,
    },
    login: {
        hero: {
            header: 'Viaggi e spese, alla velocità della chat',
            body: "Benvenuto nella nuova generazione di Expensify, dove i tuoi viaggi e le tue spese si muovono più velocemente con l'aiuto di una chat contestuale e in tempo reale.",
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Sei già connesso come ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Non vuoi accedere con ${provider}?`,
        continueWithMyCurrentSession: 'Continua con la mia sessione attuale',
        redirectToDesktopMessage: "Ti reindirizzeremo all'app desktop una volta completato l'accesso.",
        signInAgreementMessage: 'Accedendo, accetti i',
        termsOfService: 'Termini di Servizio',
        privacy: 'Privacy',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continua ad accedere con single sign-on:',
        orContinueWithMagicCode: 'Puoi anche accedere con un codice magico',
        useSingleSignOn: 'Usa il single sign-on',
        useMagicCode: 'Usa il codice magico',
        launching: 'Avvio in corso...',
        oneMoment: 'Un momento mentre ti reindirizziamo al portale di single sign-on della tua azienda.',
    },
    reportActionCompose: {
        dropToUpload: 'Trascina per caricare',
        sendAttachment: 'Invia allegato',
        addAttachment: 'Aggiungi allegato',
        writeSomething: 'Scrivi qualcosa...',
        blockedFromConcierge: 'La comunicazione è bloccata',
        fileUploadFailed: 'Caricamento fallito. Il file non è supportato.',
        localTime: ({user, time}: LocalTimeParams) => `Sono le ${time} per ${user}`,
        edited: '(modificato)',
        emoji: 'Emoji',
        collapse: 'Comprimi',
        expand: 'Espandi',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Copia negli appunti',
        copied: 'Copiato!',
        copyLink: 'Copia link',
        copyURLToClipboard: 'Copia URL negli appunti',
        copyEmailToClipboard: 'Copia email negli appunti',
        markAsUnread: 'Segna come non letto',
        markAsRead: 'Segna come letto',
        editAction: ({action}: EditActionParams) => `Modifica ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'spesa' : 'commento'}`,
        deleteAction: ({action}: DeleteActionParams) => `Elimina ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'spesa' : 'commento'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) => `Sei sicuro di voler eliminare questo ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'spesa' : 'commento'}?`,
        onlyVisible: 'Visibile solo a',
        replyInThread: 'Rispondi nel thread',
        joinThread: 'Unisciti al thread',
        leaveThread: 'Abbandona discussione',
        copyOnyxData: 'Copia i dati Onyx',
        flagAsOffensive: 'Segnala come offensivo',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Aggiungi reazione',
        reactedWith: 'ha reagito con',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Ti sei perso la festa in',
        beginningOfArchivedRoomPartTwo: ", non c'è niente da vedere qui.",
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) => `Questa chat è con tutti i membri di Expensify nel dominio ${domainRoom}.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Usalo per chattare con i colleghi, condividere consigli e fare domande.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Questa chat è con',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: "Usalo per discutere dell'allestimento dello spazio di lavoro e altro ancora.",
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) => `Questa chat è con tutti in ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `Usalo per gli annunci più importanti.`,
        beginningOfChatHistoryUserRoomPartOne: 'Questa chat room è per qualsiasi cosa',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: `Questa chat è per le fatture tra`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Usa il pulsante + per inviare una fattura.`,
        beginningOfChatHistory: 'Questa chat è con',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'Questo è dove',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'invierà le spese a',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Basta usare il pulsante +.',
        beginningOfChatHistorySelfDM: 'Questo è il tuo spazio personale. Usalo per appunti, compiti, bozze e promemoria.',
        beginningOfChatHistorySystemDM: 'Benvenuto! Iniziamo con la configurazione.',
        chatWithAccountManager: 'Chatta con il tuo account manager qui',
        sayHello: 'Ciao!',
        yourSpace: 'Il tuo spazio',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Benvenuto in ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Usa il pulsante + per ${additionalText} una spesa.`,
        askConcierge: 'Fai domande e ricevi supporto in tempo reale 24/7.',
        conciergeSupport: 'Supporto 24/7',
        create: 'creare',
        iouTypes: {
            pay: 'paga',
            split: 'split',
            submit: 'inviare',
            track: 'tracciare',
            invoice: 'fattura',
        },
    },
    adminOnlyCanPost: 'Solo gli amministratori possono inviare messaggi in questa stanza.',
    reportAction: {
        asCopilot: 'come copilota per',
    },
    mentionSuggestions: {
        hereAlternateText: 'Notifica tutti in questa conversazione',
    },
    newMessages: 'Nuovi messaggi',
    youHaveBeenBanned: 'Nota: Sei stato bannato dalla chat in questo canale.',
    reportTypingIndicator: {
        isTyping: 'sta scrivendo...',
        areTyping: 'sta digitando...',
        multipleMembers: 'Più membri',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Questa chat è stata archiviata.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Questa chat non è più attiva perché ${displayName} ha chiuso il loro account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Questa chat non è più attiva perché ${oldDisplayName} ha unito il proprio account con ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Questa chat non è più attiva perché <strong>tu</strong> non sei più un membro dello spazio di lavoro ${policyName}.`
                : `Questa chat non è più attiva perché ${displayName} non è più un membro dello spazio di lavoro ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Questa chat non è più attiva perché ${policyName} non è più uno spazio di lavoro attivo.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Questa chat non è più attiva perché ${policyName} non è più uno spazio di lavoro attivo.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Questa prenotazione è archiviata.',
    },
    writeCapabilityPage: {
        label: 'Chi può pubblicare',
        writeCapability: {
            all: 'Tutti i membri',
            admins: 'Solo amministratori',
        },
    },
    sidebarScreen: {
        buttonFind: 'Trova qualcosa...',
        buttonMySettings: 'Le mie impostazioni',
        fabNewChat: 'Inizia chat',
        fabNewChatExplained: 'Avvia chat (Azione flottante)',
        chatPinned: 'Chat fissata',
        draftedMessage: 'Messaggio redatto',
        listOfChatMessages: 'Elenco dei messaggi di chat',
        listOfChats: 'Elenco delle chat',
        saveTheWorld: 'Salva il mondo',
        tooltip: 'Inizia qui!',
        redirectToExpensifyClassicModal: {
            title: 'In arrivo presto',
            description: 'Stiamo perfezionando alcuni dettagli di New Expensify per adattarci alla tua configurazione specifica. Nel frattempo, vai su Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abbonamento',
        domains: 'Domini',
    },
    tabSelector: {
        chat: 'Chatta',
        room: 'Stanza',
        distance: 'Distanza',
        manual: 'Manuale',
        scan: 'Scansiona',
    },
    spreadsheet: {
        upload: 'Carica un foglio di calcolo',
        dragAndDrop: 'Trascina e rilascia il tuo foglio di calcolo qui, oppure scegli un file qui sotto. Formati supportati: .csv, .txt, .xls e .xlsx.',
        chooseSpreadsheet: 'Seleziona un file di foglio di calcolo da importare. Formati supportati: .csv, .txt, .xls e .xlsx.',
        fileContainsHeader: 'Il file contiene intestazioni di colonna',
        column: ({name}: SpreadSheetColumnParams) => `Colonna ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Ops! Un campo obbligatorio ("${fieldName}") non è stato mappato. Si prega di controllare e riprovare.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `Ops! Hai mappato un singolo campo ("${fieldName}") a più colonne. Per favore, controlla e riprova.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Ops! Il campo ("${fieldName}") contiene uno o più valori vuoti. Si prega di controllare e riprovare.`,
        importSuccessfulTitle: 'Importazione riuscita',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `Sono state aggiunte ${categories} categorie.` : '1 categoria è stata aggiunta.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Nessun membro è stato aggiunto o aggiornato.';
            }
            if (added && updated) {
                return `${added} membro${added > 1 ? 's' : ''} aggiunto, ${updated} membro${updated > 1 ? 's' : ''} aggiornato.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} membri sono stati aggiornati.` : '1 membro è stato aggiornato.';
            }
            return added > 1 ? `${added} membri sono stati aggiunti.` : '1 membro è stato aggiunto.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `Sono stati aggiunti ${tags} tag.` : '1 tag è stato aggiunto.'),
        importMultiLevelTagsSuccessfulDescription: 'Sono stati aggiunti tag multilivello.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `Sono state aggiunte ${rates} tariffe giornaliere.` : 'È stata aggiunta 1 tariffa di diaria.',
        importFailedTitle: 'Importazione fallita',
        importFailedDescription: 'Assicurati che tutti i campi siano compilati correttamente e riprova. Se il problema persiste, contatta Concierge.',
        importDescription: 'Scegli quali campi mappare dal tuo foglio di calcolo facendo clic sul menu a discesa accanto a ciascuna colonna importata qui sotto.',
        sizeNotMet: 'La dimensione del file deve essere maggiore di 0 byte',
        invalidFileMessage:
            'Il file che hai caricato è vuoto o contiene dati non validi. Assicurati che il file sia formattato correttamente e contenga le informazioni necessarie prima di caricarlo di nuovo.',
        importSpreadsheet: 'Importa foglio di calcolo',
        downloadCSV: 'Scarica CSV',
    },
    receipt: {
        upload: 'Carica ricevuta',
        dragReceiptBeforeEmail: 'Trascina una ricevuta su questa pagina, inoltra una ricevuta a',
        dragReceiptAfterEmail: 'oppure scegli un file da caricare qui sotto.',
        chooseReceipt: 'Scegli una ricevuta da caricare o inoltra una ricevuta a',
        takePhoto: 'Scatta una foto',
        cameraAccess: "L'accesso alla fotocamera è necessario per scattare foto delle ricevute.",
        deniedCameraAccess: "L'accesso alla fotocamera non è ancora stato concesso, si prega di seguire",
        deniedCameraAccessInstructions: 'queste istruzioni',
        cameraErrorTitle: 'Errore della fotocamera',
        cameraErrorMessage: 'Si è verificato un errore durante lo scatto della foto. Riprova.',
        locationAccessTitle: "Consenti l'accesso alla posizione",
        locationAccessMessage: "L'accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta accurati ovunque tu vada.",
        locationErrorTitle: "Consenti l'accesso alla posizione",
        locationErrorMessage: "L'accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta accurati ovunque tu vada.",
        allowLocationFromSetting: `L'accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta precisi ovunque tu vada. Consenti l'accesso alla posizione dalle impostazioni delle autorizzazioni del tuo dispositivo.`,
        dropTitle: 'Lascia andare',
        dropMessage: 'Trascina qui il tuo file',
        flash: 'flash',
        multiScan: 'multi-scan',
        shutter: 'otturatore',
        gallery: 'galleria',
        deleteReceipt: 'Elimina ricevuta',
        deleteConfirmation: 'Sei sicuro di voler eliminare questa ricevuta?',
        addReceipt: 'Aggiungi ricevuta',
        scanFailed: 'La ricevuta non può essere scansionata perché mancano il commerciante, la data o l’importo.',
    },
    quickAction: {
        scanReceipt: 'Scansiona ricevuta',
        recordDistance: 'Traccia distanza',
        requestMoney: 'Crea spesa',
        perDiem: 'Crea diaria',
        splitBill: 'Dividi spesa',
        splitScan: 'Dividi ricevuta',
        splitDistance: 'Dividi distanza',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Paga ${name ?? 'qualcuno'}`,
        assignTask: 'Assegna compito',
        header: 'Azione rapida',
        noLongerHaveReportAccess: 'Non hai più accesso alla tua precedente destinazione di azione rapida. Scegline una nuova qui sotto.',
        updateDestination: 'Aggiorna destinazione',
        createReport: 'Crea rapporto',
    },
    iou: {
        amount: 'Importo',
        taxAmount: 'Importo fiscale',
        taxRate: 'Aliquota fiscale',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Approva ${formattedAmount}` : 'Approva'),
        approved: 'Approvato',
        cash: 'Contanti',
        card: 'Carta',
        original: 'Original',
        split: 'Dividi',
        splitExpense: 'Dividi spesa',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} da ${merchant}`,
        addSplit: 'Aggiungi divisione',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `L'importo totale è ${amount} maggiore della spesa originale.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `L'importo totale è ${amount} inferiore alla spesa originale.`,
        splitExpenseZeroAmount: 'Per favore inserisci un importo valido prima di continuare.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Modifica ${amount} per ${merchant}`,
        removeSplit: 'Rimuovi divisione',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Paga ${name ?? 'qualcuno'}`,
        expense: 'Spesa',
        categorize: 'Categorizza',
        share: 'Condividi',
        participants: 'Partecipanti',
        createExpense: 'Crea spesa',
        trackDistance: 'Traccia distanza',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Crea ${expensesNumber} spese`,
        addExpense: 'Aggiungi spesa',
        chooseRecipient: 'Scegli destinatario',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Crea ${amount} spesa`,
        confirmDetails: 'Conferma i dettagli',
        pay: 'Paga',
        cancelPayment: 'Annulla pagamento',
        cancelPaymentConfirmation: 'Sei sicuro di voler annullare questo pagamento?',
        viewDetails: 'Visualizza dettagli',
        pending: 'In sospeso',
        canceled: 'Annullato',
        posted: 'Pubblicato',
        deleteReceipt: 'Elimina ricevuta',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `ha eliminato una spesa in questo rapporto, ${merchant} - ${amount}`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `ha spostato una spesa${reportName ? `da ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `spostato questa spesa${reportName ? `a <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: 'spostato questa spesa nel tuo spazio personale',
        pendingMatchWithCreditCard: 'Ricevuta in attesa di abbinamento con transazione della carta',
        pendingMatch: 'Partita in sospeso',
        pendingMatchWithCreditCardDescription: 'Ricevuta in attesa di abbinamento con transazione della carta. Segna come contante per annullare.',
        markAsCash: 'Segna come contante',
        routePending: 'Instradamento in corso...',
        receiptScanning: () => ({
            one: 'Scansione della ricevuta...',
            other: 'Scansione delle ricevute...',
        }),
        scanMultipleReceipts: 'Scansiona più ricevute',
        scanMultipleReceiptsDescription: 'Scatta foto di tutte le tue ricevute in una volta, poi conferma i dettagli tu stesso o lascia che SmartScan se ne occupi.',
        receiptScanInProgress: 'Scansione della ricevuta in corso',
        receiptScanInProgressDescription: 'Scansione della ricevuta in corso. Controlla più tardi o inserisci i dettagli ora.',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? "Spese potenzialmente duplicate identificate. Rivedi i duplicati per consentire l'invio."
                : "Spese potenzialmente duplicate identificate. Rivedi i duplicati per abilitare l'approvazione.",
        receiptIssuesFound: () => ({
            one: 'Problema riscontrato',
            other: 'Problemi riscontrati',
        }),
        fieldPending: 'In sospeso...',
        defaultRate: 'Tariffa predefinita',
        receiptMissingDetails: 'Dettagli della ricevuta mancanti',
        missingAmount: 'Importo mancante',
        missingMerchant: 'Commerciante mancante',
        receiptStatusTitle: 'Scansione in corso…',
        receiptStatusText: 'Solo tu puoi vedere questa ricevuta mentre viene scansionata. Controlla più tardi o inserisci i dettagli ora.',
        receiptScanningFailed: 'La scansione della ricevuta non è riuscita. Inserisci i dettagli manualmente.',
        transactionPendingDescription: 'Transazione in sospeso. Potrebbe richiedere alcuni giorni per essere registrata.',
        companyInfo: "Informazioni sull'azienda",
        companyInfoDescription: 'Abbiamo bisogno di alcuni dettagli in più prima che tu possa inviare la tua prima fattura.',
        yourCompanyName: 'Il nome della tua azienda',
        yourCompanyWebsite: 'Il sito web della tua azienda',
        yourCompanyWebsiteNote: 'Se non hai un sito web, puoi fornire il profilo LinkedIn della tua azienda o un profilo sui social media.',
        invalidDomainError: 'Hai inserito un dominio non valido. Per continuare, inserisci un dominio valido.',
        publicDomainError: 'Sei entrato in un dominio pubblico. Per continuare, inserisci un dominio privato.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} scansione`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} in sospeso`);
            }
            return {
                one: statusText.length > 0 ? `1 spesa (${statusText.join(', ')})` : `1 spesa`,
                other: (count: number) => (statusText.length > 0 ? `${count} spese (${statusText.join(', ')})` : `${count} spese`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 spesa',
                other: (count: number) => `${count} spese`,
            };
        },
        deleteExpense: () => ({
            one: 'Elimina spesa',
            other: 'Elimina spese',
        }),
        deleteConfirmation: () => ({
            one: 'Sei sicuro di voler eliminare questa spesa?',
            other: 'Sei sicuro di voler eliminare queste spese?',
        }),
        deleteReport: 'Elimina rapporto',
        deleteReportConfirmation: 'Sei sicuro di voler eliminare questo report?',
        settledExpensify: 'Pagato',
        done: 'Fatto',
        settledElsewhere: 'Pagato altrove',
        individual: 'Individuale',
        business: 'Business',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} con Expensify` : `Paga con Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} come individuo` : `Paga con conto personale`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} con portafoglio` : `Paga con portafoglio`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Paga ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} come azienda` : `Paga con conto aziendale`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Segna ${formattedAmount} come pagato` : `Segna come pagato`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `Pagato ${amount} con conto personale ${last4Digits}` : `Pagato con conto personale`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `Pagato ${amount} con conto aziendale ${last4Digits}` : `Pagato con conto aziendale`),
        payWithPolicy: ({formattedAmount, policyName}: SettleExpensifyCardParams & {policyName: string}) =>
            formattedAmount ? `Paga ${formattedAmount} tramite ${policyName}` : `Paga tramite ${policyName}`,
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) => `Pagato ${amount} con conto bancario ${last4Digits}.`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `Conto personale • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `Conto aziendale • ${lastFour}`,
        nextStep: 'Prossimi passi',
        finished: 'Finito',
        sendInvoice: ({amount}: RequestAmountParams) => `Invia fattura di ${amount}`,
        submitAmount: ({amount}: RequestAmountParams) => `Invia ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `per ${comment}` : ''}`,
        submitted: `inviato`,
        automaticallySubmitted: `inviato tramite <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">invio ritardato</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `tracking ${formattedAmount}${comment ? `per ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `dividi ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? `per ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `La tua parte ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} deve ${amount}${comment ? `per ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} deve:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}ha pagato ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} ha pagato:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} ha speso ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} ha speso:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} approvato:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} ha approvato ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `pagato ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `pagato ${amount}. Aggiungi un conto bancario per ricevere il tuo pagamento.`,
        automaticallyApproved: `approvato tramite <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole dello spazio di lavoro</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `approvato ${amount}`,
        approvedMessage: `approvato`,
        unapproved: `non approvato`,
        automaticallyForwarded: `approvato tramite <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole dello spazio di lavoro</a>`,
        forwarded: `approvato`,
        rejectedThisReport: 'ha respinto questo rapporto',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `ha iniziato a saldare. Il pagamento è in sospeso fino a quando ${submitterDisplayName} non aggiunge un conto bancario.`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''} ha annullato il pagamento`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `annullato il pagamento di ${amount}, perché ${submitterDisplayName} non ha attivato il loro Expensify Wallet entro 30 giorni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} ha aggiunto un conto bancario. Il pagamento di ${amount} è stato effettuato.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}segnato come pagato`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}pagato con portafoglio`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''} ha pagato con Expensify tramite <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole dello spazio di lavoro</a>`,
        noReimbursableExpenses: 'Questo rapporto ha un importo non valido',
        pendingConversionMessage: 'Il totale verrà aggiornato quando sarai di nuovo online.',
        changedTheExpense: 'modificato la spesa',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `il ${valueName} a ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `imposta il ${translatedChangedField} su ${newMerchant}, che imposta l'importo su ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `il ${valueName} (precedentemente ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `il ${valueName} a ${newValueToDisplay} (precedentemente ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `ha cambiato il ${translatedChangedField} in ${newMerchant} (precedentemente ${oldMerchant}), il che ha aggiornato l'importo a ${newAmountToDisplay} (precedentemente ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `per ${comment}` : 'spesa'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rapporto Fattura n. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} inviato${comment ? `per ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `spostato la spesa dallo spazio personale a ${workspaceName ?? `chatta con ${reportName}`}`,
        movedToPersonalSpace: 'spesa spostata nello spazio personale',
        tagSelection: 'Seleziona un tag per organizzare meglio le tue spese.',
        categorySelection: 'Seleziona una categoria per organizzare meglio le tue spese.',
        error: {
            invalidCategoryLength: 'Il nome della categoria supera i 255 caratteri. Si prega di accorciarlo o scegliere una categoria diversa.',
            invalidTagLength: 'Il nome del tag supera i 255 caratteri. Per favore, accorcialo o scegli un tag diverso.',
            invalidAmount: 'Si prega di inserire un importo valido prima di continuare',
            invalidIntegerAmount: 'Inserisci un importo in dollari intero prima di continuare',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `L'importo massimo delle tasse è ${amount}`,
            invalidSplit: "La somma delle suddivisioni deve essere uguale all'importo totale",
            invalidSplitParticipants: 'Inserisci un importo maggiore di zero per almeno due partecipanti',
            invalidSplitYourself: 'Inserisci un importo diverso da zero per la tua divisione',
            noParticipantSelected: 'Seleziona un partecipante per favore',
            other: 'Errore imprevisto. Per favore riprova più tardi.',
            genericCreateFailureMessage: "Errore imprevisto durante l'invio di questa spesa. Per favore riprova più tardi.",
            genericCreateInvoiceFailureMessage: "Errore imprevisto nell'invio di questa fattura. Per favore riprova più tardi.",
            genericHoldExpenseFailureMessage: 'Errore imprevisto nel trattenere questa spesa. Per favore riprova più tardi.',
            genericUnholdExpenseFailureMessage: 'Errore imprevisto nel rimuovere questa spesa dalla sospensione. Per favore riprova più tardi.',
            receiptDeleteFailureError: "Errore imprevisto durante l'eliminazione di questa ricevuta. Per favore, riprova più tardi.",
            receiptFailureMessage: 'Si è verificato un errore durante il caricamento della tua ricevuta. Per favore',
            receiptFailureMessageShort: 'Si è verificato un errore durante il caricamento della tua ricevuta.',
            tryAgainMessage: 'riprova',
            saveFileMessage: 'salva la ricevuta',
            uploadLaterMessage: 'da caricare più tardi.',
            genericDeleteFailureMessage: "Errore imprevisto nell'eliminazione di questa spesa. Per favore riprova più tardi.",
            genericEditFailureMessage: 'Errore imprevisto durante la modifica di questa spesa. Per favore riprova più tardi.',
            genericSmartscanFailureMessage: 'La transazione manca di campi',
            duplicateWaypointsErrorMessage: 'Si prega di rimuovere i punti di passaggio duplicati',
            atLeastTwoDifferentWaypoints: 'Inserisci almeno due indirizzi diversi per favore.',
            splitExpenseMultipleParticipantsErrorMessage: 'Una spesa non può essere suddivisa tra un workspace e altri membri. Si prega di aggiornare la selezione.',
            invalidMerchant: 'Per favore, inserisci un commerciante valido',
            atLeastOneAttendee: 'Deve essere selezionato almeno un partecipante',
            invalidQuantity: 'Per favore, inserisci una quantità valida',
            quantityGreaterThanZero: 'La quantità deve essere maggiore di zero',
            invalidSubrateLength: 'Deve esserci almeno una sottotariffa',
            invalidRate: 'Tariffa non valida per questo spazio di lavoro. Si prega di selezionare una tariffa disponibile dallo spazio di lavoro.',
        },
        dismissReceiptError: 'Ignora errore',
        dismissReceiptErrorConfirmation: 'Attenzione! Ignorare questo errore rimuoverà completamente la ricevuta caricata. Sei sicuro?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `ha iniziato a regolare. Il pagamento è in sospeso fino a quando ${submitterDisplayName} non abilita il loro portafoglio.`,
        enableWallet: 'Abilita portafoglio',
        hold: 'Attendere',
        unhold: 'Rimuovi blocco',
        holdExpense: 'Trattieni spesa',
        unholdExpense: 'Sblocca spesa',
        heldExpense: 'trattenuto questa spesa',
        unheldExpense: 'sblocca questa spesa',
        moveUnreportedExpense: 'Sposta spesa non segnalata',
        addUnreportedExpense: 'Aggiungi spesa non segnalata',
        createNewExpense: 'Crea nuova spesa',
        selectUnreportedExpense: 'Seleziona almeno una spesa da aggiungere al rapporto.',
        emptyStateUnreportedExpenseTitle: 'Nessuna spesa non segnalata',
        emptyStateUnreportedExpenseSubtitle: 'Sembra che non hai spese non segnalate. Prova a crearne una qui sotto.',
        addUnreportedExpenseConfirm: 'Aggiungi al report',
        explainHold: 'Spiega perché stai trattenendo questa spesa.',
        undoSubmit: 'Annulla invio',
        retracted: 'retratato',
        undoClose: 'Annulla chiusura',
        reopened: 'riaperto',
        reopenReport: 'Riapri rapporto',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Questo report è già stato esportato su ${connectionName}. Modificarlo potrebbe causare discrepanze nei dati. Sei sicuro di voler riaprire questo report?`,
        reason: 'Motivo',
        holdReasonRequired: 'È necessario fornire una motivazione quando si mette in attesa.',
        expenseWasPutOnHold: 'La spesa è stata messa in sospeso',
        expenseOnHold: 'Questa spesa è stata messa in sospeso. Si prega di controllare i commenti per i prossimi passi.',
        expensesOnHold: 'Tutte le spese sono state sospese. Si prega di rivedere i commenti per i prossimi passi.',
        expenseDuplicate: "Questa spesa ha dettagli simili a un'altra. Si prega di controllare i duplicati per continuare.",
        someDuplicatesArePaid: 'Alcuni di questi duplicati sono già stati approvati o pagati.',
        reviewDuplicates: 'Rivedi duplicati',
        keepAll: 'Tieni tutto',
        confirmApprove: "Conferma l'importo approvato",
        confirmApprovalAmount: "Approva solo le spese conformi o approva l'intero rapporto.",
        confirmApprovalAllHoldAmount: () => ({
            one: 'Questa spesa è in sospeso. Vuoi approvarla comunque?',
            other: 'Queste spese sono in sospeso. Vuoi approvarle comunque?',
        }),
        confirmPay: "Conferma l'importo del pagamento",
        confirmPayAmount: "Paga ciò che non è in sospeso o paga l'intero rapporto.",
        confirmPayAllHoldAmount: () => ({
            one: 'Questa spesa è in sospeso. Vuoi pagare comunque?',
            other: 'Queste spese sono in sospeso. Vuoi pagare comunque?',
        }),
        payOnly: 'Paga solo',
        approveOnly: 'Approva solo',
        holdEducationalTitle: 'Questa richiesta è attiva',
        holdEducationalText: 'tieni',
        whatIsHoldExplain: 'Mettere in sospeso è come premere "pausa" su una spesa per chiedere ulteriori dettagli prima dell\'approvazione o del pagamento.',
        holdIsLeftBehind: "Le spese trattenute vengono spostate in un altro report al momento dell'approvazione o del pagamento.",
        unholdWhenReady: "Gli approvatori possono sbloccare le spese quando sono pronte per l'approvazione o il pagamento.",
        changePolicyEducational: {
            title: 'Hai spostato questo report!',
            description: 'Ricontrolla questi elementi, che tendono a cambiare quando si spostano i report in un nuovo spazio di lavoro.',
            reCategorize: '<strong>Ricategorizza qualsiasi spesa</strong> per conformarti alle regole dello spazio di lavoro.',
            workflows: 'Questo rapporto potrebbe ora essere soggetto a un diverso <strong>flusso di approvazione.</strong>',
        },
        changeWorkspace: 'Cambia spazio di lavoro',
        set: 'set',
        changed: 'cambiato',
        removed: 'rimosso',
        transactionPending: 'Transazione in sospeso.',
        chooseARate: "Seleziona una tariffa di rimborso per miglio o chilometro per l'area di lavoro",
        unapprove: 'Non approvare',
        unapproveReport: 'Disapprova rapporto',
        headsUp: 'Attenzione!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Questo report è già stato esportato su ${accountingIntegration}. Modificarlo potrebbe portare a discrepanze nei dati. Sei sicuro di voler disapprovare questo report?`,
        reimbursable: 'rimborsabile',
        nonReimbursable: 'non-rimborsabile',
        bookingPending: 'Questa prenotazione è in sospeso',
        bookingPendingDescription: 'Questa prenotazione è in sospeso perché non è stata ancora pagata.',
        bookingArchived: 'Questa prenotazione è archiviata',
        bookingArchivedDescription: "Questa prenotazione è archiviata perché la data del viaggio è passata. Aggiungi una spesa per l'importo finale, se necessario.",
        attendees: 'Partecipanti',
        whoIsYourAccountant: 'Chi è il tuo contabile?',
        paymentComplete: 'Pagamento completato',
        time: 'Tempo',
        startDate: 'Data di inizio',
        endDate: 'Data di fine',
        startTime: 'Ora di inizio',
        endTime: 'Ora di fine',
        deleteSubrate: 'Elimina sottotariffa',
        deleteSubrateConfirmation: 'Sei sicuro di voler eliminare questa sottotariffa?',
        quantity: 'Quantità',
        subrateSelection: 'Seleziona una sottotariffa e inserisci una quantità.',
        qty: 'Qtà.',
        firstDayText: () => ({
            one: `Primo giorno: 1 ora`,
            other: (count: number) => `Primo giorno: ${count.toFixed(2)} ore`,
        }),
        lastDayText: () => ({
            one: `Ultimo giorno: 1 ora`,
            other: (count: number) => `Ultimo giorno: ${count.toFixed(2)} ore`,
        }),
        tripLengthText: () => ({
            one: `Viaggio: 1 giorno intero`,
            other: (count: number) => `Viaggio: ${count} giorni interi`,
        }),
        dates: 'Date di calendario',
        rates: 'Tariffe',
        submitsTo: ({name}: SubmitsToParams) => `Invia a ${name}`,
        moveExpenses: () => ({one: 'Sposta spesa', other: 'Sposta spese'}),
    },
    share: {
        shareToExpensify: 'Condividi su Expensify',
        messageInputLabel: 'Messaggio',
    },
    notificationPreferencesPage: {
        header: 'Preferenze di notifica',
        label: 'Notificami dei nuovi messaggi',
        notificationPreferences: {
            always: 'Immediatamente',
            daily: 'Quotidiano',
            mute: 'Disattiva audio',
            hidden: 'Nascosto',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Il numero non è stato convalidato. Clicca il pulsante per rinviare il link di convalida tramite SMS.',
        emailHasNotBeenValidated: "L'email non è stata convalidata. Clicca il pulsante per rinviare il link di convalida tramite SMS.",
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Carica foto',
        removePhoto: 'Rimuovi foto',
        editImage: 'Modifica foto',
        viewPhoto: 'Visualizza foto',
        imageUploadFailed: "Caricamento dell'immagine non riuscito",
        deleteWorkspaceError: "Spiacenti, si è verificato un problema inaspettato nell'eliminazione dell'avatar del tuo spazio di lavoro.",
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `L'immagine selezionata supera la dimensione massima di caricamento di ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Carica un'immagine più grande di ${minHeightInPx}x${minWidthInPx} pixel e più piccola di ${maxHeightInPx}x${maxWidthInPx} pixel.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `L'immagine del profilo deve essere di uno dei seguenti tipi: ${allowedExtensions.join(', ')}.`,
    },
    modal: {
        backdropLabel: 'Sfondo del Modale',
    },
    profilePage: {
        profile: 'Profilo',
        preferredPronouns: 'Pronomi preferiti',
        selectYourPronouns: 'Seleziona i tuoi pronomi',
        selfSelectYourPronoun: 'Seleziona il tuo pronome',
        emailAddress: 'Indirizzo email',
        setMyTimezoneAutomatically: 'Imposta automaticamente il mio fuso orario',
        timezone: 'Fuso orario',
        invalidFileMessage: "File non valido. Per favore prova con un'immagine diversa.",
        avatarUploadFailureMessage: "Si è verificato un errore durante il caricamento dell'avatar. Per favore riprova.",
        online: 'Online',
        offline: 'Offline',
        syncing: 'Sincronizzazione',
        profileAvatar: 'Avatar del profilo',
        publicSection: {
            title: 'Pubblico',
            subtitle: 'Questi dettagli sono visualizzati sul tuo profilo pubblico. Chiunque può vederli.',
        },
        privateSection: {
            title: 'Privato',
            subtitle: 'Questi dettagli sono utilizzati per viaggi e pagamenti. Non vengono mai mostrati nel tuo profilo pubblico.',
        },
    },
    securityPage: {
        title: 'Opzioni di sicurezza',
        subtitle: "Abilita l'autenticazione a due fattori per mantenere sicuro il tuo account.",
        goToSecurity: 'Torna alla pagina di sicurezza',
    },
    shareCodePage: {
        title: 'Il tuo codice',
        subtitle: 'Invita i membri a Expensify condividendo il tuo codice QR personale o il link di riferimento.',
    },
    pronounsPage: {
        pronouns: 'Pronomi',
        isShownOnProfile: 'I tuoi pronomi sono mostrati nel tuo profilo.',
        placeholderText: 'Cerca per vedere le opzioni',
    },
    contacts: {
        contactMethod: 'Metodo di contatto',
        contactMethods: 'Metodi di contatto',
        featureRequiresValidate: 'Questa funzione richiede di convalidare il tuo account.',
        validateAccount: 'Convalida il tuo account',
        helpTextBeforeEmail: 'Aggiungi più modi per farti trovare e inoltra le ricevute a',
        helpTextAfterEmail: 'da più indirizzi email.',
        pleaseVerify: 'Si prega di verificare questo metodo di contatto',
        getInTouch: 'Ogni volta che avremo bisogno di contattarti, useremo questo metodo di contatto.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Per favore, inserisci il codice magico inviato a ${contactMethod}. Dovrebbe arrivare entro un minuto o due.`,
        setAsDefault: 'Imposta come predefinito',
        yourDefaultContactMethod:
            'Questo è il tuo metodo di contatto predefinito attuale. Prima di poterlo eliminare, dovrai scegliere un altro metodo di contatto e fare clic su "Imposta come predefinito".',
        removeContactMethod: 'Rimuovi metodo di contatto',
        removeAreYouSure: 'Sei sicuro di voler rimuovere questo metodo di contatto? Questa azione non può essere annullata.',
        failedNewContact: 'Impossibile aggiungere questo metodo di contatto.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Impossibile inviare un nuovo codice magico. Attendere un momento e riprovare.',
            validateSecondaryLogin: 'Codice magico errato o non valido. Per favore riprova o richiedi un nuovo codice.',
            deleteContactMethod: 'Impossibile eliminare il metodo di contatto. Si prega di contattare Concierge per assistenza.',
            setDefaultContactMethod: 'Impossibile impostare un nuovo metodo di contatto predefinito. Si prega di contattare Concierge per assistenza.',
            addContactMethod: 'Impossibile aggiungere questo metodo di contatto. Si prega di contattare Concierge per assistenza.',
            enteredMethodIsAlreadySubmitted: 'Questo metodo di contatto esiste già',
            passwordRequired: 'password richiesto.',
            contactMethodRequired: 'Il metodo di contatto è obbligatorio',
            invalidContactMethod: 'Metodo di contatto non valido',
        },
        newContactMethod: 'Nuovo metodo di contatto',
        goBackContactMethods: 'Torna ai metodi di contatto',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Lui / Lui / Suo',
        heHimHisTheyThemTheirs: 'Lui / Lui / Suo / Loro / Loro / Loro',
        sheHerHers: 'Lei / Lei / Suoi',
        sheHerHersTheyThemTheirs: 'Lei / Lei / Suo / Loro / Loro / Loro',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'Loro / Loro / Loro',
        thonThons: 'Thon / Thons',
        veVerVis: 'Vai / Vedi / Visibilità',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Chiamami per nome',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Nome visualizzato',
        isShownOnProfile: 'Il tuo nome visualizzato è mostrato sul tuo profilo.',
    },
    timezonePage: {
        timezone: 'Fuso orario',
        isShownOnProfile: 'Il tuo fuso orario è mostrato nel tuo profilo.',
        getLocationAutomatically: 'Determina automaticamente la tua posizione',
    },
    updateRequiredView: {
        updateRequired: 'Aggiornamento richiesto',
        pleaseInstall: "Si prega di aggiornare all'ultima versione di New Expensify",
        pleaseInstallExpensifyClassic: "Si prega di installare l'ultima versione di Expensify",
        toGetLatestChanges: "Per dispositivi mobili o desktop, scarica e installa l'ultima versione. Per il web, aggiorna il tuo browser.",
        newAppNotAvailable: 'La nuova app Expensify non è più disponibile.',
    },
    initialSettingsPage: {
        about: 'Informazioni su',
        aboutPage: {
            description: 'La nuova app Expensify è costruita da una comunità di sviluppatori open-source provenienti da tutto il mondo. Aiutaci a costruire il futuro di Expensify.',
            appDownloadLinks: "Link per il download dell'app",
            viewKeyboardShortcuts: 'Visualizza le scorciatoie da tastiera',
            viewTheCode: 'Visualizza il codice',
            viewOpenJobs: 'Visualizza lavori aperti',
            reportABug: 'Segnala un bug',
            troubleshoot: 'Risoluzione dei problemi',
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
            clearCacheAndRestart: 'Cancella cache e riavvia',
            viewConsole: 'Visualizza console di debug',
            debugConsole: 'Console di debug',
            description: "Usa gli strumenti qui sotto per aiutarti a risolvere i problemi con l'esperienza Expensify. Se incontri problemi, per favore",
            submitBug: 'segnala un bug',
            confirmResetDescription: 'Tutti i messaggi di bozza non inviati andranno persi, ma il resto dei tuoi dati è al sicuro.',
            resetAndRefresh: 'Reimposta e aggiorna',
            clientSideLogging: 'Registrazione lato client',
            noLogsToShare: 'Nessun registro da condividere',
            useProfiling: 'Usa il profiling',
            profileTrace: 'Traccia profilo',
            results: 'Risultati',
            releaseOptions: 'Opzioni di rilascio',
            testingPreferences: 'Preferenze di test',
            useStagingServer: 'Usa il server di staging',
            forceOffline: 'Forza offline',
            simulatePoorConnection: 'Simula una connessione internet scadente.',
            simulateFailingNetworkRequests: 'Simula richieste di rete non riuscite',
            authenticationStatus: 'Stato di autenticazione',
            deviceCredentials: 'Credenziali del dispositivo',
            invalidate: 'Invalidare',
            destroy: 'Distruggere',
            maskExportOnyxStateData: "Maschera i dati sensibili dei membri durante l'esportazione dello stato di Onyx",
            exportOnyxState: 'Esporta stato Onyx',
            importOnyxState: 'Importa lo stato di Onyx',
            testCrash: 'Test crash',
            resetToOriginalState: 'Ripristina allo stato originale',
            usingImportedState: 'Stai utilizzando uno stato importato. Premi qui per cancellarlo.',
            debugMode: 'Modalità debug',
            invalidFile: 'File non valido',
            invalidFileDescription: 'Il file che stai cercando di importare non è valido. Per favore riprova.',
            invalidateWithDelay: 'Invalidare con ritardo',
            recordTroubleshootData: 'Registrazione dei dati di risoluzione dei problemi',
        },
        debugConsole: {
            saveLog: 'Salva registro',
            shareLog: 'Condividi registro',
            enterCommand: 'Inserisci comando',
            execute: 'Esegui',
            noLogsAvailable: 'Nessun registro disponibile',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `La dimensione del registro supera il limite di ${size} MB. Si prega di utilizzare "Salva registro" per scaricare il file di registro.`,
            logs: 'Registri',
            viewConsole: 'Visualizza console',
        },
        security: 'Sicurezza',
        signOut: 'Esci',
        restoreStashed: 'Ripristina accesso nascosto',
        signOutConfirmationText: 'Perderai tutte le modifiche offline se esci.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Leggi il',
            phrase2: 'Termini di Servizio',
            phrase3: 'e',
            phrase4: 'Privacy',
        },
        help: 'Aiuto',
        accountSettings: 'Impostazioni account',
        account: 'Account',
        general: 'Generale',
    },
    closeAccountPage: {
        closeAccount: 'Chiudi account',
        reasonForLeavingPrompt: 'Ci dispiacerebbe vederti andare via! Potresti gentilmente dirci il motivo, così possiamo migliorare?',
        enterMessageHere: 'Inserisci il messaggio qui',
        closeAccountWarning: 'La chiusura del tuo account non può essere annullata.',
        closeAccountPermanentlyDeleteData: 'Sei sicuro di voler eliminare il tuo account? Questo eliminerà definitivamente tutte le spese in sospeso.',
        enterDefaultContactToConfirm: 'Inserisci il tuo metodo di contatto predefinito per confermare che desideri chiudere il tuo account. Il tuo metodo di contatto predefinito è:',
        enterDefaultContact: 'Inserisci il tuo metodo di contatto predefinito',
        defaultContact: 'Metodo di contatto predefinito:',
        enterYourDefaultContactMethod: 'Inserisci il tuo metodo di contatto predefinito per chiudere il tuo account.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Unisci account',
        accountDetails: {
            accountToMergeInto: "Inserisci l'account in cui vuoi unire",
            notReversibleConsent: 'Capisco che questo non è reversibile.',
        },
        accountValidate: {
            confirmMerge: 'Sei sicuro di voler unire gli account?',
            lossOfUnsubmittedData: `Unire i tuoi account è irreversibile e comporterà la perdita di eventuali spese non inviate per`,
            enterMagicCode: `Per continuare, inserisci il codice magico inviato a`,
            errors: {
                incorrectMagicCode: 'Codice magico errato o non valido. Per favore riprova o richiedi un nuovo codice.',
                fallback: 'Qualcosa è andato storto. Per favore riprova più tardi.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Account uniti!',
            successfullyMergedAllData: {
                beforeFirstEmail: `Hai unito con successo tutti i dati da`,
                beforeSecondEmail: `in`,
                afterSecondEmail: `. D'ora in poi, puoi utilizzare entrambi i login per questo account.`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Ci stiamo lavorando su.',
            limitedSupport: 'Non supportiamo ancora la fusione degli account su New Expensify. Si prega di effettuare questa operazione su Expensify Classic.',
            reachOutForHelp: {
                beforeLink: 'Sentiti libero di',
                linkText: 'contatta Concierge',
                afterLink: 'se hai domande!',
            },
            goToExpensifyClassic: 'Vai a Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Non puoi unire',
            beforeDomain: 'perché è controllato da',
            afterDomain: '. Per favore',
            linkText: 'contatta Concierge',
            afterLink: 'per assistenza.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Non puoi unire',
            afterEmail: "in altri account perché l'amministratore del tuo dominio l'ha impostato come login principale. Unisci invece altri account in questo.",
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Non puoi unire gli account perché',
                beforeSecondEmail: "ha l'autenticazione a due fattori (2FA) abilitata. Si prega di disabilitare 2FA per",
                afterSecondEmail: 'e riprova.',
            },
            learnMore: 'Scopri di più sulla fusione degli account.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Non puoi unire',
            afterEmail: 'perché è bloccato. Per favore',
            linkText: 'contatta Concierge',
            afterLink: `per assistenza.`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Non puoi unire gli account perché',
                afterEmail: 'non ha un account Expensify.',
            },
            addContactMethod: {
                beforeLink: 'Per favore',
                linkText: 'aggiungilo come metodo di contatto',
                afterLink: 'invece.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Non puoi unire',
            afterEmail: 'in altri account. Si prega di unire altri account in esso invece.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Non puoi unire',
            afterEmail: 'in altri account perché è il proprietario della fatturazione di un account fatturato. Si prega di unire altri account in esso invece.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Riprova più tardi',
            description: 'Ci sono stati troppi tentativi di unire gli account. Per favore riprova più tardi.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "Non puoi unire ad altri account perché non è convalidato. Per favore, convalida l'account e riprova.",
        },
        mergeFailureSelfMerge: {
            description: 'Non puoi unire un account con se stesso.',
        },
        mergeFailureGenericHeading: 'Impossibile unire gli account',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Segnala attività sospetta',
        lockAccount: 'Blocca account',
        unlockAccount: 'Sblocca account',
        compromisedDescription: 'Notato qualcosa di strano nel tuo account? Segnalandolo lo bloccherai immediatamente, fermerai le transazioni con la carta Expensify e impedirai modifiche.',
        domainAdminsDescription: 'Per gli amministratori di dominio: questo sospende anche tutta l’attività delle carte Expensify e le azioni amministrative.',
        areYouSure: 'Sei sicuro di voler bloccare il tuo account Expensify?',
        ourTeamWill: 'Il nostro team indagherà e rimuoverà eventuali accessi non autorizzati. Per riottenere l’accesso, dovrai collaborare con Concierge.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: "Impossibile bloccare l'account",
        failedToLockAccountDescription: `Non siamo riusciti a bloccare il tuo account. Per favore, chatta con Concierge per risolvere questo problema.`,
        chatWithConcierge: 'Chatta con Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Account bloccato',
        yourAccountIsLocked: 'Il tuo account è bloccato',
        chatToConciergeToUnlock: 'Chatta con Concierge per risolvere i problemi di sicurezza e sbloccare il tuo account.',
        chatWithConcierge: 'Chatta con Concierge',
    },
    passwordPage: {
        changePassword: 'Cambia password',
        changingYourPasswordPrompt: 'Cambiare la tua password aggiornerà la password sia per il tuo account Expensify.com che per il tuo account New Expensify.',
        currentPassword: 'Password attuale',
        newPassword: 'Nuova password',
        newPasswordPrompt: 'La tua nuova password deve essere diversa dalla tua vecchia password e contenere almeno 8 caratteri, 1 lettera maiuscola, 1 lettera minuscola e 1 numero.',
    },
    twoFactorAuth: {
        headerTitle: 'Autenticazione a due fattori',
        twoFactorAuthEnabled: 'Autenticazione a due fattori abilitata',
        whatIsTwoFactorAuth:
            "L'autenticazione a due fattori (2FA) aiuta a mantenere sicuro il tuo account. Quando accedi, dovrai inserire un codice generato dalla tua app di autenticazione preferita.",
        disableTwoFactorAuth: "Disabilita l'autenticazione a due fattori",
        explainProcessToRemove: "Per disabilitare l'autenticazione a due fattori (2FA), inserisci un codice valido dalla tua app di autenticazione.",
        disabled: "L'autenticazione a due fattori è ora disabilitata",
        noAuthenticatorApp: "Non avrai più bisogno di un'app di autenticazione per accedere a Expensify.",
        stepCodes: 'Codici di recupero',
        keepCodesSafe: 'Conserva questi codici di recupero al sicuro!',
        codesLoseAccess:
            "Se perdi l'accesso alla tua app di autenticazione e non hai questi codici, perderai l'accesso al tuo account.\n\nNota: Configurare l'autenticazione a due fattori ti disconnetterà da tutte le altre sessioni attive.",
        errorStepCodes: 'Si prega di copiare o scaricare i codici prima di continuare',
        stepVerify: 'Verifica',
        scanCode: 'Scansiona il codice QR utilizzando il tuo',
        authenticatorApp: 'app di autenticazione',
        addKey: 'Oppure aggiungi questa chiave segreta alla tua app di autenticazione:',
        enterCode: 'Quindi inserisci il codice a sei cifre generato dalla tua app di autenticazione.',
        stepSuccess: 'Finito',
        enabled: 'Autenticazione a due fattori abilitata',
        congrats: 'Congratulazioni! Ora hai quella sicurezza in più.',
        copy: 'Copiare',
        disable: 'Disabilita',
        enableTwoFactorAuth: "Abilita l'autenticazione a due fattori",
        pleaseEnableTwoFactorAuth: "Si prega di abilitare l'autenticazione a due fattori.",
        twoFactorAuthIsRequiredDescription: "Per motivi di sicurezza, Xero richiede l'autenticazione a due fattori per connettere l'integrazione.",
        twoFactorAuthIsRequiredForAdminsHeader: 'Autenticazione a due fattori richiesta',
        twoFactorAuthIsRequiredForAdminsTitle: "Si prega di abilitare l'autenticazione a due fattori",
        twoFactorAuthIsRequiredForAdminsDescription:
            "La tua connessione contabile Xero richiede l'uso dell'autenticazione a due fattori. Per continuare a utilizzare Expensify, ti preghiamo di abilitarla.",
        twoFactorAuthCannotDisable: "Impossibile disabilitare l'autenticazione a due fattori (2FA)",
        twoFactorAuthRequired: "L'autenticazione a due fattori (2FA) è necessaria per la tua connessione Xero e non può essere disabilitata.",
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Per favore inserisci il tuo codice di recupero',
            incorrectRecoveryCode: 'Codice di recupero errato. Per favore riprova.',
        },
        useRecoveryCode: 'Usa il codice di recupero',
        recoveryCode: 'Codice di recupero',
        use2fa: 'Usa il codice di autenticazione a due fattori',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Inserisci il tuo codice di autenticazione a due fattori',
            incorrect2fa: 'Codice di autenticazione a due fattori errato. Per favore riprova.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Password aggiornato!',
        allSet: 'Tutto pronto. Tieni al sicuro la tua nuova password.',
    },
    privateNotes: {
        title: 'Note private',
        personalNoteMessage: "Tieni appunti su questa chat qui. Sei l'unica persona che può aggiungere, modificare o visualizzare questi appunti.",
        sharedNoteMessage: 'Tieni appunti su questa chat qui. I dipendenti di Expensify e altri membri del dominio team.expensify.com possono visualizzare questi appunti.',
        composerLabel: 'Note',
        myNote: 'La mia nota',
        error: {
            genericFailureMessage: 'Le note private non possono essere salvate',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Per favore, inserisci un codice di sicurezza valido',
        },
        securityCode: 'Codice di sicurezza',
        changeBillingCurrency: 'Cambia valuta di fatturazione',
        changePaymentCurrency: 'Cambia la valuta di pagamento',
        paymentCurrency: 'Valuta di pagamento',
        paymentCurrencyDescription: 'Seleziona una valuta standard a cui tutte le spese personali dovrebbero essere convertite',
        note: 'Nota: Cambiare la valuta di pagamento può influire su quanto pagherai per Expensify. Consulta il nostro',
        noteLink: 'pagina dei prezzi',
        noteDetails: 'per i dettagli completi.',
    },
    addDebitCardPage: {
        addADebitCard: 'Aggiungi una carta di debito',
        nameOnCard: 'Nome sulla carta',
        debitCardNumber: 'Numero della carta di debito',
        expiration: 'Data di scadenza',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Indirizzo di fatturazione',
        growlMessageOnSave: 'La tua carta di debito è stata aggiunta con successo',
        expensifyPassword: 'Password di Expensify',
        error: {
            invalidName: 'Il nome può includere solo lettere',
            addressZipCode: 'Si prega di inserire un codice postale valido',
            debitCardNumber: 'Inserisci un numero di carta di debito valido',
            expirationDate: 'Si prega di selezionare una data di scadenza valida',
            securityCode: 'Per favore, inserisci un codice di sicurezza valido',
            addressStreet: 'Inserisci un indirizzo di fatturazione valido che non sia una casella postale',
            addressState: 'Seleziona uno stato per favore',
            addressCity: 'Per favore inserisci una città',
            genericFailureMessage: "Si è verificato un errore durante l'aggiunta della tua carta. Per favore riprova.",
            password: 'Per favore inserisci la tua password di Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Aggiungi carta di pagamento',
        nameOnCard: 'Nome sulla carta',
        paymentCardNumber: 'Numero di carta',
        expiration: 'Data di scadenza',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Indirizzo di fatturazione',
        growlMessageOnSave: 'La tua carta di pagamento è stata aggiunta con successo',
        expensifyPassword: 'Password di Expensify',
        error: {
            invalidName: 'Il nome può includere solo lettere',
            addressZipCode: 'Si prega di inserire un codice postale valido',
            paymentCardNumber: 'Per favore, inserisci un numero di carta valido',
            expirationDate: 'Si prega di selezionare una data di scadenza valida',
            securityCode: 'Per favore, inserisci un codice di sicurezza valido',
            addressStreet: 'Inserisci un indirizzo di fatturazione valido che non sia una casella postale',
            addressState: 'Seleziona uno stato per favore',
            addressCity: 'Per favore inserisci una città',
            genericFailureMessage: "Si è verificato un errore durante l'aggiunta della tua carta. Per favore riprova.",
            password: 'Per favore inserisci la tua password di Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Metodi di pagamento',
        setDefaultConfirmation: 'Imposta il metodo di pagamento predefinito',
        setDefaultSuccess: 'Metodo di pagamento predefinito impostato!',
        deleteAccount: 'Elimina account',
        deleteConfirmation: 'Sei sicuro di voler eliminare questo account?',
        error: {
            notOwnerOfBankAccount: "Si è verificato un errore durante l'impostazione di questo conto bancario come metodo di pagamento predefinito.",
            invalidBankAccount: 'Questo conto bancario è temporaneamente sospeso.',
            notOwnerOfFund: "Si è verificato un errore durante l'impostazione di questa carta come metodo di pagamento predefinito.",
            setDefaultFailure: 'Qualcosa è andato storto. Si prega di contattare Concierge per ulteriore assistenza.',
        },
        addBankAccountFailure: 'Si è verificato un errore imprevisto durante il tentativo di aggiungere il tuo conto bancario. Per favore riprova.',
        getPaidFaster: 'Ricevi pagamenti più velocemente',
        addPaymentMethod: "Aggiungi un metodo di pagamento per inviare e ricevere pagamenti direttamente nell'app.",
        getPaidBackFaster: 'Ricevi il rimborso più velocemente',
        secureAccessToYourMoney: 'Accesso sicuro ai tuoi soldi',
        receiveMoney: 'Ricevi denaro nella tua valuta locale',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Invia e ricevi denaro con gli amici. Solo conti bancari statunitensi.',
        enableWallet: 'Abilita portafoglio',
        addBankAccountToSendAndReceive: "Ricevi il rimborso per le spese che invii a un'area di lavoro.",
        addBankAccount: 'Aggiungi conto bancario',
        addDebitOrCreditCard: 'Aggiungi carta di debito o di credito',
        assignedCards: 'Carte assegnate',
        assignedCardsDescription: 'Queste sono carte assegnate da un amministratore del workspace per gestire le spese aziendali.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Stiamo esaminando le tue informazioni. Per favore, ricontrolla tra qualche minuto!',
        walletActivationFailed: 'Purtroppo, il tuo portafoglio non può essere attivato in questo momento. Per favore, contatta Concierge per ulteriore assistenza.',
        addYourBankAccount: 'Aggiungi il tuo conto bancario',
        addBankAccountBody: "Colleghiamo il tuo conto bancario a Expensify in modo che sia più facile che mai inviare e ricevere pagamenti direttamente nell'app.",
        chooseYourBankAccount: 'Scegli il tuo conto bancario',
        chooseAccountBody: 'Assicurati di selezionare quello giusto.',
        confirmYourBankAccount: 'Conferma il tuo conto bancario',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Carta Viaggio Expensify',
        availableSpend: 'Limite rimanente',
        smartLimit: {
            name: 'Limite intelligente',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Puoi spendere fino a ${formattedLimit} su questa carta, e il limite verrà ripristinato man mano che le tue spese inviate vengono approvate.`,
        },
        fixedLimit: {
            name: 'Limite fisso',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Puoi spendere fino a ${formattedLimit} su questa carta, dopodiché si disattiverà.`,
        },
        monthlyLimit: {
            name: 'Limite mensile',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Puoi spendere fino a ${formattedLimit} su questa carta al mese. Il limite verrà reimpostato il primo giorno di ogni mese di calendario.`,
        },
        virtualCardNumber: 'Numero della carta virtuale',
        travelCardCvv: 'CVV della carta di viaggio',
        physicalCardNumber: 'Numero della carta fisica',
        getPhysicalCard: 'Ottieni carta fisica',
        reportFraud: 'Segnala frode con carta virtuale',
        reportTravelFraud: 'Segnala frode con carta di viaggio',
        reviewTransaction: 'Rivedi transazione',
        suspiciousBannerTitle: 'Transazione sospetta',
        suspiciousBannerDescription: 'Abbiamo notato transazioni sospette sulla tua carta. Tocca qui sotto per rivederle.',
        cardLocked: 'La tua carta è temporaneamente bloccata mentre il nostro team esamina il conto della tua azienda.',
        cardDetails: {
            cardNumber: 'Numero della carta virtuale',
            expiration: 'Scadenza',
            cvv: 'CVV',
            address: 'Indirizzo',
            revealDetails: 'Rivela dettagli',
            revealCvv: 'Mostra CVV',
            copyCardNumber: 'Copia numero di carta',
            updateAddress: 'Aggiorna indirizzo',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Aggiunto al portafoglio ${platform}`,
        cardDetailsLoadingFailure: 'Si è verificato un errore durante il caricamento dei dettagli della carta. Controlla la tua connessione internet e riprova.',
        validateCardTitle: 'Verifichiamo che sei tu',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Inserisci il codice magico inviato a ${contactMethod} per visualizzare i dettagli della tua carta. Dovrebbe arrivare entro un minuto o due.`,
    },
    workflowsPage: {
        workflowTitle: 'Spendere',
        workflowDescription: 'Configura un flusso di lavoro dal momento in cui si verifica una spesa, inclusi approvazione e pagamento.',
        delaySubmissionTitle: 'Ritarda invii',
        delaySubmissionDescription: "Scegli un programma personalizzato per l'invio delle spese, oppure lascia disattivato per aggiornamenti in tempo reale sulle spese.",
        submissionFrequency: 'Frequenza di invio',
        submissionFrequencyDateOfMonth: 'Data del mese',
        addApprovalsTitle: 'Aggiungi approvazioni',
        addApprovalButton: 'Aggiungi flusso di lavoro di approvazione',
        addApprovalTip: 'Questo flusso di lavoro predefinito si applica a tutti i membri, a meno che non esista un flusso di lavoro più specifico.',
        approver: 'Approvante',
        connectBankAccount: 'Collega conto bancario',
        addApprovalsDescription: "Richiedi un'approvazione aggiuntiva prima di autorizzare un pagamento.",
        makeOrTrackPaymentsTitle: 'Effettua o traccia pagamenti',
        makeOrTrackPaymentsDescription: 'Aggiungi un pagatore autorizzato per i pagamenti effettuati in Expensify o traccia i pagamenti effettuati altrove.',
        editor: {
            submissionFrequency: 'Scegli quanto tempo Expensify dovrebbe aspettare prima di condividere le spese senza errori.',
        },
        frequencyDescription: 'Scegli con quale frequenza desideri che le spese vengano inviate automaticamente, oppure impostale manualmente.',
        frequencies: {
            instant: 'Istantaneo',
            weekly: 'Settimanale',
            monthly: 'Mensile',
            twiceAMonth: 'Due volte al mese',
            byTrip: 'Per viaggio',
            manually: 'Manuale',
            daily: 'Quotidiano',
            lastDayOfMonth: 'Ultimo giorno del mese',
            lastBusinessDayOfMonth: 'Ultimo giorno lavorativo del mese',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Primo',
                '2': 'Secondo',
                '3': 'Terzo',
                '4': 'Quarto',
                '5': 'Quinto',
                '6': 'Sesto',
                '7': 'Settimo',
                '8': 'Ottavo',
                '9': 'Nono',
                '10': 'Decimo',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Questo membro appartiene già a un altro flusso di approvazione. Eventuali aggiornamenti qui si rifletteranno anche lì.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> approva già i report a <strong>${name2}</strong>. Si prega di scegliere un approvatore diverso per evitare un flusso di lavoro circolare.`,
        emptyContent: {
            title: 'Nessun membro da visualizzare',
            expensesFromSubtitle: 'Tutti i membri dello spazio di lavoro appartengono già a un flusso di approvazione esistente.',
            approverSubtitle: 'Tutti gli approvatori appartengono a un flusso di lavoro esistente.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'La presentazione ritardata non può essere modificata. Per favore, riprova o contatta il supporto.',
        autoReportingFrequencyErrorMessage: "La frequenza di invio non può essere modificata. Riprova o contatta l'assistenza.",
        monthlyOffsetErrorMessage: 'La frequenza mensile non può essere modificata. Riprova o contatta il supporto.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Conferma',
        header: 'Aggiungi altri approvatori e conferma.',
        additionalApprover: 'Approvazione aggiuntiva',
        submitButton: 'Aggiungi flusso di lavoro',
    },
    workflowsEditApprovalsPage: {
        title: 'Modifica il flusso di lavoro di approvazione',
        deleteTitle: 'Elimina il flusso di lavoro di approvazione',
        deletePrompt: 'Sei sicuro di voler eliminare questo flusso di lavoro di approvazione? Tutti i membri seguiranno successivamente il flusso di lavoro predefinito.',
    },
    workflowsExpensesFromPage: {
        title: 'Spese da',
        header: 'Quando i seguenti membri inviano spese:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "L'approvatore non può essere modificato. Per favore riprova o contatta il supporto.",
        header: "Invia a questo membro per l'approvazione:",
    },
    workflowsPayerPage: {
        title: 'Pagatore autorizzato',
        genericErrorMessage: 'Il pagatore autorizzato non può essere modificato. Per favore riprova.',
        admins: 'Amministratori',
        payer: 'Pagatore',
        paymentAccount: 'Conto di pagamento',
    },
    reportFraudPage: {
        title: 'Segnala frode con carta virtuale',
        description:
            'Se i dettagli della tua carta virtuale sono stati rubati o compromessi, disattiveremo permanentemente la tua carta esistente e ti forniremo una nuova carta virtuale e un nuovo numero.',
        deactivateCard: 'Disattiva carta',
        reportVirtualCardFraud: 'Segnala frode con carta virtuale',
    },
    reportFraudConfirmationPage: {
        title: 'Frode con carta segnalato',
        description: 'Abbiamo disattivato permanentemente la tua carta esistente. Quando torni a visualizzare i dettagli della tua carta, avrai una nuova carta virtuale disponibile.',
        buttonText: 'Ricevuto, grazie!',
    },
    activateCardPage: {
        activateCard: 'Attiva carta',
        pleaseEnterLastFour: 'Per favore, inserisci le ultime quattro cifre della tua carta.',
        activatePhysicalCard: 'Attiva carta fisica',
        error: {
            thatDidNotMatch: 'Quello non corrispondeva alle ultime 4 cifre della tua carta. Per favore riprova.',
            throttled:
                'Hai inserito in modo errato le ultime 4 cifre della tua Expensify Card troppe volte. Se sei sicuro che i numeri siano corretti, contatta Concierge per risolvere il problema. Altrimenti, riprova più tardi.',
        },
    },
    getPhysicalCard: {
        header: 'Ottieni carta fisica',
        nameMessage: 'Inserisci il tuo nome e cognome, poiché verranno mostrati sulla tua carta.',
        legalName: 'Nome legale',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        phoneMessage: 'Inserisci il tuo numero di telefono.',
        phoneNumber: 'Numero di telefono',
        address: 'Indirizzo',
        addressMessage: 'Inserisci il tuo indirizzo di spedizione.',
        streetAddress: 'Indirizzo stradale',
        city: 'Città',
        state: 'Stato',
        zipPostcode: 'CAP/Codice postale',
        country: 'Paese',
        confirmMessage: 'Si prega di confermare i tuoi dati qui sotto.',
        estimatedDeliveryMessage: 'La tua carta fisica arriverà in 2-3 giorni lavorativi.',
        next: 'Successivo',
        getPhysicalCard: 'Ottieni carta fisica',
        shipCard: 'Spedisci carta',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Instantaneo (Carta di debito)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% di commissione (${minAmount} minimo)`,
        ach: '1-3 giorni lavorativi (Conto bancario)',
        achSummary: 'Nessuna commissione',
        whichAccount: 'Quale account?',
        fee: 'Tariffa',
        transferSuccess: 'Trasferimento riuscito!',
        transferDetailBankAccount: 'Il tuo denaro dovrebbe arrivare nei prossimi 1-3 giorni lavorativi.',
        transferDetailDebitCard: 'Il tuo denaro dovrebbe arrivare immediatamente.',
        failedTransfer: 'Il tuo saldo non è completamente regolato. Si prega di trasferire su un conto bancario.',
        notHereSubTitle: 'Si prega di trasferire il saldo dalla pagina del portafoglio',
        goToWallet: 'Vai al Portafoglio',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Scegli account',
    },
    paymentMethodList: {
        addPaymentMethod: 'Aggiungi metodo di pagamento',
        addNewDebitCard: 'Aggiungi nuova carta di debito',
        addNewBankAccount: 'Aggiungi nuovo conto bancario',
        accountLastFour: 'Terminante in',
        cardLastFour: 'Carta che termina con',
        addFirstPaymentMethod: "Aggiungi un metodo di pagamento per inviare e ricevere pagamenti direttamente nell'app.",
        defaultPaymentMethod: 'Predefinito',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `Conto bancario • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: "Preferenze dell'app",
        },
        testSection: {
            title: 'Preferenze di prova',
            subtitle: "Impostazioni per aiutare a fare il debug e testare l'app in staging.",
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Ricevi aggiornamenti sulle funzionalità e notizie di Expensify rilevanti',
        muteAllSounds: 'Disattiva tutti i suoni da Expensify',
    },
    priorityModePage: {
        priorityMode: 'Modalità prioritaria',
        explainerText: 'Scegli se #focus sui messaggi non letti e fissati solo, o mostra tutto con i messaggi più recenti e fissati in cima.',
        priorityModes: {
            default: {
                label: 'Più recente',
                description: 'Mostra tutte le chat ordinate per le più recenti',
            },
            gsd: {
                label: '#focus',
                description: 'Mostra solo i non letti ordinati alfabeticamente',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'Generazione PDF',
        waitForPDF: 'Attendere mentre generiamo il PDF',
        errorPDF: 'Si è verificato un errore durante il tentativo di generare il tuo PDF.',
        generatedPDF: 'Il tuo PDF del rapporto è stato generato!',
    },
    reportDescriptionPage: {
        roomDescription: 'Descrizione della stanza',
        roomDescriptionOptional: 'Descrizione della stanza (opzionale)',
        explainerText: 'Imposta una descrizione personalizzata per la stanza.',
    },
    groupChat: {
        lastMemberTitle: 'Attenzione!',
        lastMemberWarning: "Poiché sei l'ultima persona qui, andartene renderà questa chat inaccessibile a tutti i membri. Sei sicuro di voler uscire?",
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Chat di gruppo di ${displayName}`,
    },
    languagePage: {
        language: 'Lingua',
        aiGenerated: 'Le traduzioni per questa lingua sono generate automaticamente e potrebbero contenere errori.',
    },
    themePage: {
        theme: 'Tema',
        themes: {
            dark: {
                label: 'Scuro',
            },
            light: {
                label: 'Luce',
            },
            system: {
                label: 'Usa le impostazioni del dispositivo',
            },
        },
        chooseThemeBelowOrSync: 'Scegli un tema qui sotto o sincronizza con le impostazioni del tuo dispositivo.',
    },
    termsOfUse: {
        phrase1: 'Accedendo, accetti i',
        phrase2: 'Termini di Servizio',
        phrase3: 'e',
        phrase4: 'Privacy',
        phrase5: `La trasmissione di denaro è fornita da ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) in base al suo`,
        phrase6: 'licenze',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Non hai ricevuto un codice magico?',
        enterAuthenticatorCode: "Per favore, inserisci il tuo codice dell'autenticatore",
        enterRecoveryCode: 'Per favore inserisci il tuo codice di recupero',
        requiredWhen2FAEnabled: "Richiesto quando l'autenticazione a due fattori è abilitata",
        requestNewCode: 'Richiedi un nuovo codice in',
        requestNewCodeAfterErrorOccurred: 'Richiedi un nuovo codice',
        error: {
            pleaseFillMagicCode: 'Per favore, inserisci il tuo codice magico',
            incorrectMagicCode: 'Codice magico errato o non valido. Per favore riprova o richiedi un nuovo codice.',
            pleaseFillTwoFactorAuth: 'Inserisci il tuo codice di autenticazione a due fattori',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Si prega di compilare tutti i campi',
        pleaseFillPassword: 'Per favore inserisci la tua password',
        pleaseFillTwoFactorAuth: 'Per favore, inserisci il tuo codice a due fattori',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Inserisci il tuo codice di autenticazione a due fattori per continuare',
        forgot: 'Dimenticato?',
        requiredWhen2FAEnabled: "Richiesto quando l'autenticazione a due fattori è abilitata",
        error: {
            incorrectPassword: 'Password errata. Riprova.',
            incorrectLoginOrPassword: 'Login o password errati. Riprova.',
            incorrect2fa: 'Codice di autenticazione a due fattori errato. Per favore riprova.',
            twoFactorAuthenticationEnabled: "Hai l'autenticazione a due fattori abilitata su questo account. Accedi utilizzando la tua email o il tuo numero di telefono.",
            invalidLoginOrPassword: 'Accesso o password non validi. Riprova o reimposta la tua password.',
            unableToResetPassword:
                'Non siamo riusciti a cambiare la tua password. Questo è probabilmente dovuto a un link di reimpostazione della password scaduto in una vecchia email di reimpostazione della password. Ti abbiamo inviato un nuovo link via email, così puoi riprovare. Controlla la tua Posta in arrivo e la cartella Spam; dovrebbe arrivare tra pochi minuti.',
            noAccess: "Non hai accesso a questa applicazione. Per favore aggiungi il tuo nome utente GitHub per ottenere l'accesso.",
            accountLocked: 'Il tuo account è stato bloccato dopo troppi tentativi non riusciti. Riprova tra 1 ora.',
            fallback: 'Qualcosa è andato storto. Per favore riprova più tardi.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefono o email',
        error: {
            invalidFormatEmailLogin: "L'email inserita non è valida. Si prega di correggere il formato e riprovare.",
        },
        cannotGetAccountDetails: "Impossibile recuperare i dettagli dell'account. Per favore, prova ad accedere di nuovo.",
        loginForm: 'Modulo di accesso',
        notYou: ({user}: NotYouParams) => `Non ${user}?`,
    },
    onboarding: {
        welcome: 'Benvenuto!',
        welcomeSignOffTitleManageTeam: 'Una volta completati i compiti sopra, possiamo esplorare più funzionalità come i flussi di lavoro di approvazione e le regole!',
        welcomeSignOffTitle: 'È un piacere conoscerti!',
        explanationModal: {
            title: 'Benvenuto in Expensify',
            description: "Un'app per gestire le tue spese aziendali e personali alla velocità della chat. Provala e facci sapere cosa ne pensi. Molto altro in arrivo!",
            secondaryDescription: 'Per tornare a Expensify Classic, basta toccare la tua immagine del profilo > Vai a Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Benvenuto in Expensify',
            description: "Un'app per gestire tutte le tue spese aziendali e personali in una chat. Progettata per la tua azienda, il tuo team e i tuoi amici.",
        },
        getStarted: 'Inizia',
        whatsYourName: 'Qual è il tuo nome?',
        peopleYouMayKnow: 'Persone che potresti conoscere sono già qui! Verifica la tua email per unirti a loro.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Qualcuno da ${domain} ha già creato uno spazio di lavoro. Inserisci il codice magico inviato a ${email}.`,
        joinAWorkspace: 'Unisciti a uno spazio di lavoro',
        listOfWorkspaces: "Ecco l'elenco degli spazi di lavoro a cui puoi unirti. Non preoccuparti, puoi sempre unirti più tardi se preferisci.",
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membro${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Dove lavori?',
        errorSelection: "Seleziona un'opzione per procedere",
        purpose: {
            title: 'Cosa vuoi fare oggi?',
            errorContinue: 'Premi continua per configurare',
            errorBackButton: "Per favore, completa le domande di configurazione per iniziare a usare l'app",
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Essere rimborsato dal mio datore di lavoro',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gestisci le spese del mio team',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Traccia e gestisci le spese',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatta e dividi le spese con gli amici',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: "Qualcos'altro",
        },
        employees: {
            title: 'Quanti dipendenti avete?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Più di 1.000 dipendenti',
        },
        accounting: {
            title: 'Usi qualche software di contabilità?',
            none: 'Nessuno',
        },
        error: {
            requiredFirstName: 'Per favore, inserisci il tuo nome per continuare',
        },
        workEmail: {
            title: 'Qual è la tua email di lavoro?',
            subtitle: 'Expensify funziona al meglio quando colleghi la tua email di lavoro.',
            explanationModal: {
                descriptionOne: 'Inoltra a receipts@expensify.com per la scansione',
                descriptionTwo: 'Unisciti ai tuoi colleghi che già utilizzano Expensify',
                descriptionThree: "Goditi un'esperienza più personalizzata",
            },
            addWorkEmail: 'Aggiungi email di lavoro',
        },
        workEmailValidation: {
            title: 'Verifica la tua email di lavoro',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Inserisci il codice magico inviato a ${workEmail}. Dovrebbe arrivare tra un minuto o due.`,
        },
        workEmailValidationError: {
            publicEmail: "Inserisci un'email di lavoro valida da un dominio privato, ad esempio mitch@company.com",
            offline: 'Non siamo riusciti ad aggiungere la tua email di lavoro poiché sembri essere offline.',
        },
        mergeBlockScreen: {
            title: "Impossibile aggiungere l'email di lavoro",
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Non siamo riusciti ad aggiungere ${workEmail}. Riprova più tardi in Impostazioni o chatta con Concierge per assistenza.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Fai un [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[Fai un breve tour del prodotto](${testDriveURL}) per scoprire perché Expensify è il modo più veloce per gestire le tue spese.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Fai un [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `Prova un [test drive](${testDriveURL}) e ottieni *3 mesi gratuiti di Expensify!* per il tuo team`,
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Crea](${workspaceConfirmationLink}) uno spazio di lavoro`,
                description: 'Crea uno spazio di lavoro e configura le impostazioni con l’aiuto del tuo specialista di configurazione!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Crea uno [spazio di lavoro](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    '*Crea uno spazio di lavoro* per monitorare le spese, scansionare ricevute, chattare e altro.\n' +
                    '\n' +
                    '1. Clicca su *Spazi di lavoro* > *Nuovo spazio di lavoro*.\n' +
                    '\n' +
                    `*Il tuo nuovo spazio di lavoro è pronto!* [Dai un’occhiata](${workspaceSettingsLink}).`,
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Configura le [categorie](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    '*Configura le categorie* in modo che il tuo team possa codificare le spese per una rendicontazione semplice.\n' +
                    '\n' +
                    '1. Clicca su *Spazi di lavoro*.\n' +
                    '3. Seleziona il tuo spazio di lavoro.\n' +
                    '4. Clicca su *Categorie*.\n' +
                    '5. Disattiva le categorie che non ti servono.\n' +
                    '6. Aggiungi le tue categorie in alto a destra.\n' +
                    '\n' +
                    `[Vai alle impostazioni delle categorie dello spazio di lavoro](${workspaceCategoriesLink}).\n` +
                    '\n' +
                    `![Configura le categorie](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`,
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Invia una spesa',
                description:
                    '*Invia una spesa* inserendo un importo o scansionando una ricevuta.\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Crea spesa*.\n' +
                    '3. Inserisci un importo o scansiona una ricevuta.\n' +
                    `4. Aggiungi l’email o il numero di telefono del tuo responsabile.\n` +
                    '5. Clicca su *Crea*.\n' +
                    '\n' +
                    'E il gioco è fatto!',
            },
            adminSubmitExpenseTask: {
                title: 'Invia una spesa',
                description:
                    '*Invia una spesa* inserendo un importo o scansionando una ricevuta.\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Crea spesa*.\n' +
                    '3. Inserisci un importo o scansiona una ricevuta.\n' +
                    '4. Conferma i dettagli.\n' +
                    '5. Clicca su *Crea*.\n' +
                    '\n' +
                    'E il gioco è fatto!',
            },
            trackExpenseTask: {
                title: 'Monitora una spesa',
                description:
                    '*Monitora una spesa* in qualsiasi valuta, con o senza ricevuta.\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Crea spesa*.\n' +
                    '3. Inserisci un importo o scansiona una ricevuta.\n' +
                    '4. Scegli il tuo spazio *personale*.\n' +
                    '5. Clicca su *Crea*.\n' +
                    '\n' +
                    'E il gioco è fatto! Sì, è davvero così facile.',
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Connetti${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' a'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'il tuo' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    `Connetti${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? ' il tuo' : ' a'} ${integrationName} per una codifica automatica delle spese e sincronizzazione che semplifica la chiusura di fine mese.\n` +
                    '\n' +
                    '1. Clicca su *Impostazioni*.\n' +
                    '2. Vai a *Spazi di lavoro*.\n' +
                    '3. Seleziona il tuo spazio di lavoro.\n' +
                    '4. Clicca su *Contabilità*.\n' +
                    `5. Trova ${integrationName}.\n` +
                    '6. Clicca su *Connetti*.\n' +
                    '\n' +
                    `${
                        integrationName && CONST.connectionsVideoPaths[integrationName]
                            ? `[Vai alla contabilità](${workspaceAccountingLink}).\n\n![Connetti a ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
                            : `[Vai alla contabilità](${workspaceAccountingLink}).`
                    }`,
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Collega [la tua carta aziendale](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    `Collega la tua carta aziendale per importare e codificare automaticamente le spese.\n` +
                    '\n' +
                    '1. Clicca su *Spazi di lavoro*.\n' +
                    '2. Seleziona il tuo spazio di lavoro.\n' +
                    '3. Clicca su *Carte aziendali*.\n' +
                    '4. Segui le istruzioni per collegare la tua carta.\n' +
                    '\n' +
                    `[Vai per collegare le mie carte aziendali](${corporateCardLink}).`,
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Invita [il tuo team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    '*Invita il tuo team* su Expensify così possono iniziare a monitorare le spese oggi stesso.\n' +
                    '\n' +
                    '1. Clicca su *Spazi di lavoro*.\n' +
                    '3. Seleziona il tuo spazio di lavoro.\n' +
                    '4. Clicca su *Membri* > *Invita membro*.\n' +
                    '5. Inserisci email o numeri di telefono.\n' +
                    '6. Aggiungi un messaggio personalizzato se vuoi!\n' +
                    '\n' +
                    `[Vai ai membri dello spazio di lavoro](${workspaceMembersLink}).\n` +
                    '\n' +
                    `![Invita il tuo team](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`,
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceMoreFeaturesLink}) => `Configura [categorie](${workspaceCategoriesLink}) e [tag](${workspaceMoreFeaturesLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    '*Configura categorie e tag* in modo che il tuo team possa codificare le spese per una rendicontazione semplice.\n' +
                    '\n' +
                    `Importale automaticamente [collegando il software di contabilità](${workspaceAccountingLink}), oppure configuralo manualmente nelle [impostazioni dello spazio di lavoro](${workspaceCategoriesLink}).`,
            },
            setupTagsTask: {
                title: ({workspaceMoreFeaturesLink}) => `Configura i [tag](${workspaceMoreFeaturesLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    'Usa i tag per aggiungere dettagli extra alle spese come progetti, clienti, sedi e reparti. Se ti servono più livelli di tag, puoi passare al piano Control.\n' +
                    '\n' +
                    '1. Clicca su *Spazi di lavoro*.\n' +
                    '3. Seleziona il tuo spazio di lavoro.\n' +
                    '4. Clicca su *Altre funzionalità*.\n' +
                    '5. Abilita *Tag*.\n' +
                    '6. Vai a *Tag* nell’editor dello spazio di lavoro.\n' +
                    '7. Clicca su *+ Aggiungi tag* per crearne uno tuo.\n' +
                    '\n' +
                    `[Vai a altre funzionalità](${workspaceMoreFeaturesLink}).\n` +
                    '\n' +
                    `![Configura i tag](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`,
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Invita il tuo [commercialista](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    '*Invita il tuo commercialista* a collaborare nel tuo spazio di lavoro e a gestire le spese aziendali.\n' +
                    '\n' +
                    '1. Clicca su *Spazi di lavoro*.\n' +
                    '2. Seleziona il tuo spazio di lavoro.\n' +
                    '3. Clicca su *Membri*.\n' +
                    '4. Clicca su *Invita un membro*.\n' +
                    "5. Inserisci l'indirizzo email del tuo commercialista.\n" +
                    '\n' +
                    `[Invita ora il tuo commercialista](${workspaceMembersLink}).`,
            },
            startChatTask: {
                title: 'Avvia una chat',
                description:
                    '*Avvia una chat* con chiunque utilizzando la loro email o numero di telefono.\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Avvia chat*.\n' +
                    '3. Inserisci un’email o numero di telefono.\n' +
                    '\n' +
                    'Se non stanno già usando Expensify, riceveranno automaticamente un invito.\n' +
                    '\n' +
                    'Ogni chat si trasformerà anche in un’email o messaggio a cui potranno rispondere direttamente.',
            },
            splitExpenseTask: {
                title: 'Dividi una spesa',
                description:
                    '*Dividi le spese* con una o più persone.\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Avvia chat*.\n' +
                    '3. Inserisci email o numeri di telefono.\n' +
                    '4. Clicca sul pulsante grigio *+* nella chat > *Dividi spesa*.\n' +
                    '5. Crea la spesa selezionando *Manuale*, *Scansione* o *Distanza*.\n' +
                    '\n' +
                    'Puoi aggiungere altri dettagli se vuoi, oppure inviarla subito. Recuperiamo i tuoi soldi!',
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Rivedi le [impostazioni dello spazio di lavoro](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    'Ecco come rivedere e aggiornare le impostazioni dello spazio di lavoro:\n' +
                    '1. Clicca sulla scheda delle impostazioni.\n' +
                    '2. Clicca su *Spazi di lavoro* > [Il tuo spazio di lavoro].\n' +
                    `[Vai al tuo spazio di lavoro](${workspaceSettingsLink}). Le tracceremo nella stanza #admins.`,
            },
            createReportTask: {
                title: 'Crea il tuo primo report',
                description:
                    'Ecco come creare un report:\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Crea report*.\n' +
                    '3. Clicca su *Aggiungi spesa*.\n' +
                    '4. Aggiungi la tua prima spesa.\n' +
                    '\n' +
                    'E il gioco è fatto!',
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Fai un [test drive](${testDriveURL})` : 'Fai un test drive'),
            embeddedDemoIframeTitle: 'Test Drive',
            employeeFakeReceipt: {
                description: 'La mia ricevuta del test drive!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Ricevere un rimborso è facile come inviare un messaggio. Vediamo le basi.',
            onboardingPersonalSpendMessage: 'Ecco come monitorare le tue spese in pochi clic.',
            onboardingMangeTeamMessage: ({onboardingCompanySize}: {onboardingCompanySize?: OnboardingCompanySize}) =>
                `Ecco un elenco di attività che consiglio per un’azienda delle tue dimensioni con ${onboardingCompanySize} persone che inviano spese:`,
            onboardingTrackWorkspaceMessage:
                '# Iniziamo\n👋 Sono qui per aiutarti! Per iniziare, ho personalizzato le impostazioni dello spazio di lavoro per ditte individuali e aziende simili. Puoi modificarle cliccando il link qui sotto!\n\nEcco come monitorare le tue spese in pochi clic:',
            onboardingChatSplitMessage: 'Dividere le spese con gli amici è facile come inviare un messaggio. Ecco come.',
            onboardingAdminMessage: 'Scopri come gestire lo spazio di lavoro del tuo team come admin e inviare le tue spese.',
            onboardingLookingAroundMessage:
                'Expensify è noto per la gestione di spese, viaggi e carte aziendali, ma facciamo molto di più. Fammi sapere cosa ti interessa e ti aiuterò a iniziare.',
            onboardingTestDriveReceiverMessage: '*Hai ottenuto 3 mesi gratuiti! Inizia da qui sotto.*',
        },
        workspace: {
            title: 'Rimani organizzato con uno spazio di lavoro',
            subtitle: 'Sblocca strumenti potenti per semplificare la gestione delle tue spese, tutto in un unico posto. Con uno spazio di lavoro, puoi:',
            explanationModal: {
                descriptionOne: 'Traccia e organizza le ricevute',
                descriptionTwo: 'Categorizza e tagga le spese',
                descriptionThree: 'Crea e condividi rapporti',
            },
            price: 'Provalo gratis per 30 giorni, poi passa al piano superiore per soli <strong>$5/mese</strong>.',
            createWorkspace: 'Crea workspace',
        },
        confirmWorkspace: {
            title: 'Conferma workspace',
            subtitle: 'Crea uno spazio di lavoro per tracciare le ricevute, rimborsare le spese, gestire i viaggi, creare report e altro ancora — tutto alla velocità della chat.',
        },
        inviteMembers: {
            title: 'Invita membri',
            subtitle: 'Gestisci e condividi le tue spese con un commercialista o avvia un gruppo di viaggio con gli amici.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Non mostrarmelo più',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Il nome non può contenere le parole Expensify o Concierge',
            hasInvalidCharacter: 'Il nome non può contenere una virgola o un punto e virgola',
            requiredFirstName: 'Il nome non può essere vuoto',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Qual è il tuo nome legale?',
        enterDateOfBirth: 'Qual è la tua data di nascita?',
        enterAddress: 'Qual è il tuo indirizzo?',
        enterPhoneNumber: 'Qual è il tuo numero di telefono?',
        personalDetails: 'Dettagli personali',
        privateDataMessage: 'Questi dettagli sono utilizzati per viaggi e pagamenti. Non vengono mai mostrati sul tuo profilo pubblico.',
        legalName: 'Nome legale',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        address: 'Indirizzo',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `La data dovrebbe essere precedente a ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `La data deve essere successiva a ${dateString}`,
            hasInvalidCharacter: 'Il nome può includere solo caratteri latini',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Formato del codice postale errato${zipFormat ? `Formato accettabile: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Si prega di assicurarsi che il numero di telefono sia valido (ad esempio ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Il link è stato reinviato',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Ho inviato un link magico per l'accesso a ${login}. Controlla il tuo ${loginType} per accedere.`,
        resendLink: 'Invia nuovamente il link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Per convalidare ${secondaryLogin}, per favore reinvia il codice magico dalle Impostazioni dell'Account di ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Se non hai più accesso a ${primaryLogin}, scollega i tuoi account.`,
        unlink: 'Scollega',
        linkSent: 'Link inviato!',
        successfullyUnlinkedLogin: 'Accesso secondario scollegato con successo!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Il nostro provider di posta elettronica ha temporaneamente sospeso le email a ${login} a causa di problemi di consegna. Per sbloccare il tuo login, segui questi passaggi:`,
        confirmThat: ({login}: ConfirmThatParams) => `Conferma che ${login} sia scritto correttamente e sia un indirizzo email reale e consegnabile.`,
        emailAliases: 'Gli alias email come "expenses@domain.com" devono avere accesso alla propria casella di posta elettronica per essere un login valido di Expensify.',
        ensureYourEmailClient: 'Assicurati che il tuo client di posta elettronica consenta le email da expensify.com.',
        youCanFindDirections: 'Puoi trovare le indicazioni su come completare questo passaggio',
        helpConfigure: 'ma potresti aver bisogno del tuo reparto IT per aiutarti a configurare le impostazioni email.',
        onceTheAbove: 'Una volta completati i passaggi sopra indicati, contatta per favore',
        toUnblock: 'per sbloccare il tuo accesso.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Non siamo riusciti a consegnare i messaggi SMS a ${login}, quindi lo abbiamo sospeso temporaneamente. Si prega di provare a convalidare il proprio numero:`,
        validationSuccess: 'Il tuo numero è stato convalidato! Clicca qui sotto per inviare un nuovo codice magico di accesso.',
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
                return 'Attendere un momento prima di riprovare.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'giorno' : 'giorni'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'ora' : 'ore'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'minuto' : 'minuti'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Aspetta! Devi attendere ${timeText} prima di provare a convalidare nuovamente il tuo numero.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Unisciti',
    },
    detailsPage: {
        localTime: 'Ora locale',
    },
    newChatPage: {
        startGroup: 'Avvia gruppo',
        addToGroup: 'Aggiungi al gruppo',
    },
    yearPickerPage: {
        year: 'Anno',
        selectYear: 'Si prega di selezionare un anno',
    },
    focusModeUpdateModal: {
        title: 'Benvenuto in modalità #focus!',
        prompt: 'Rimani al passo vedendo solo le chat non lette o quelle che richiedono la tua attenzione. Non preoccuparti, puoi cambiare questa impostazione in qualsiasi momento in',
        settings: 'impostazioni',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'La chat che stai cercando non può essere trovata.',
        getMeOutOfHere: 'Portami via di qui',
        iouReportNotFound: 'I dettagli di pagamento che stai cercando non possono essere trovati.',
        notHere: 'Hmm... non è qui',
        pageNotFound: 'Ops, questa pagina non può essere trovata',
        noAccess: 'Questa chat o spesa potrebbe essere stata eliminata o potresti non avere accesso ad essa.\n\nPer qualsiasi domanda, contatta concierge@expensify.com',
        goBackHome: 'Torna alla pagina principale',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oops... ${isBreakLine ? '\n' : ''}Qualcosa è andato storto`,
        subtitle: 'La tua richiesta non può essere completata. Per favore riprova più tardi.',
    },
    setPasswordPage: {
        enterPassword: 'Inserisci una password',
        setPassword: 'Imposta password',
        newPasswordPrompt: 'La tua password deve avere almeno 8 caratteri, 1 lettera maiuscola, 1 lettera minuscola e 1 numero.',
        passwordFormTitle: 'Bentornato nel nuovo Expensify! Per favore, imposta la tua password.',
        passwordNotSet: 'Non siamo riusciti a impostare la tua nuova password. Ti abbiamo inviato un nuovo link per riprovare.',
        setPasswordLinkInvalid: 'Questo link per impostare la password non è valido o è scaduto. Un nuovo link ti sta aspettando nella tua casella di posta elettronica!',
        validateAccount: 'Verifica account',
    },
    statusPage: {
        status: 'Stato',
        statusExplanation: "Aggiungi un'emoji per dare ai tuoi colleghi e amici un modo semplice per sapere cosa sta succedendo. Puoi anche aggiungere un messaggio opzionale!",
        today: 'Oggi',
        clearStatus: 'Cancella stato',
        save: 'Salva',
        message: 'Messaggio',
        timePeriods: {
            never: 'Never',
            thirtyMinutes: '30 minuti',
            oneHour: '1 ora',
            afterToday: 'Oggi',
            afterWeek: 'Una settimana',
            custom: 'Customizzato',
        },
        untilTomorrow: 'Fino a domani',
        untilTime: ({time}: UntilTimeParams) => `Fino a ${time}`,
        date: 'Data',
        time: 'Tempo',
        clearAfter: 'Cancella dopo',
        whenClearStatus: 'Quando dovremmo cancellare il tuo stato?',
        vacationDelegate: 'Delegato per le vacanze',
        setVacationDelegate: `Imposta un delegato per le vacanze per approvare i report al tuo posto mentre sei fuori ufficio.`,
        vacationDelegateError: 'Si è verificato un errore durante l’aggiornamento del delegato per le vacanze.',
        asVacationDelegate: ({nameOrEmail: managerName}: VacationDelegateParams) => `come delegato per le vacanze di ${managerName}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `a ${submittedToName} come delegato per le vacanze di ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Stai assegnando ${nameOrEmail} come tuo delegato per le vacanze. Non è ancora presente in tutti i tuoi workspace. Se scegli di continuare, verrà inviata un'e-mail a tutti gli amministratori dei tuoi workspace per aggiungerlo.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Passo ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Informazioni bancarie',
        confirmBankInfo: 'Conferma le informazioni bancarie',
        manuallyAdd: 'Aggiungi manualmente il tuo conto bancario',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        accountEnding: 'Account con terminazione in',
        thisBankAccount: 'Questo conto bancario sarà utilizzato per i pagamenti aziendali nel tuo spazio di lavoro.',
        accountNumber: 'Numero di conto',
        routingNumber: 'Numero di instradamento',
        chooseAnAccountBelow: 'Scegli un account qui sotto',
        addBankAccount: 'Aggiungi conto bancario',
        chooseAnAccount: 'Scegli un account',
        connectOnlineWithPlaid: 'Accedi alla tua banca',
        connectManually: 'Connetti manualmente',
        desktopConnection: 'Nota: Per connettersi con Chase, Wells Fargo, Capital One o Bank of America, fare clic qui per completare questo processo in un browser.',
        yourDataIsSecure: 'I tuoi dati sono al sicuro',
        toGetStarted: 'Aggiungi un conto bancario per rimborsare le spese, emettere le carte Expensify, riscuotere i pagamenti delle fatture e pagare le bollette tutto da un unico posto.',
        plaidBodyCopy: 'Offri ai tuoi dipendenti un modo più semplice per pagare - e farsi rimborsare - le spese aziendali.',
        checkHelpLine: 'Il tuo numero di instradamento e il numero di conto possono essere trovati su un assegno per il conto.',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `Per collegare un conto bancario, per favore <a href="${contactMethodRoute}">aggiungi un'email come login principale</a> e riprova. Puoi aggiungere il tuo numero di telefono come login secondario.`,
        hasBeenThrottledError: "Si è verificato un errore durante l'aggiunta del tuo conto bancario. Attendi qualche minuto e riprova.",
        hasCurrencyError: {
            phrase1: 'Ops! Sembra che la valuta del tuo spazio di lavoro sia impostata su una valuta diversa da USD. Per procedere, vai a',
            link: 'le impostazioni del tuo spazio di lavoro',
            phrase2: 'impostarlo su USD e riprovare.',
        },
        error: {
            youNeedToSelectAnOption: "Seleziona un'opzione per procedere",
            noBankAccountAvailable: 'Spiacente, non è disponibile alcun conto bancario.',
            noBankAccountSelected: 'Per favore, scegli un account',
            taxID: 'Inserisci un numero di partita IVA valido',
            website: 'Per favore, inserisci un sito web valido',
            zipCode: `Inserisci un codice postale valido utilizzando il formato: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Per favore, inserisci un numero di telefono valido',
            email: 'Per favore, inserisci un indirizzo email valido',
            companyName: 'Per favore inserisci un nome aziendale valido',
            addressCity: 'Per favore, inserisci una città valida',
            addressStreet: 'Per favore, inserisci un indirizzo stradale valido',
            addressState: 'Seleziona un stato valido per favore',
            incorporationDateFuture: 'La data di costituzione non può essere nel futuro',
            incorporationState: 'Seleziona un stato valido per favore',
            industryCode: 'Inserisci un codice di classificazione industriale valido composto da sei cifre',
            restrictedBusiness: "Per favore conferma che l'azienda non è nell'elenco delle attività commerciali ristrette.",
            routingNumber: 'Inserisci un numero di instradamento valido',
            accountNumber: 'Per favore, inserisci un numero di conto valido',
            routingAndAccountNumberCannotBeSame: 'I numeri di routing e di conto non possono corrispondere',
            companyType: 'Seleziona un tipo di azienda valido',
            tooManyAttempts:
                'A causa di un elevato numero di tentativi di accesso, questa opzione è stata disabilitata per 24 ore. Si prega di riprovare più tardi o di inserire i dettagli manualmente.',
            address: 'Per favore, inserisci un indirizzo valido',
            dob: 'Si prega di selezionare una data di nascita valida',
            age: 'Devi avere più di 18 anni',
            ssnLast4: 'Inserisci gli ultimi 4 cifre validi del SSN',
            firstName: 'Per favore, inserisci un nome valido',
            lastName: 'Per favore, inserisci un cognome valido',
            noDefaultDepositAccountOrDebitCardAvailable: 'Si prega di aggiungere un conto di deposito predefinito o una carta di debito',
            validationAmounts: "Gli importi di convalida inseriti non sono corretti. Si prega di ricontrollare l'estratto conto bancario e riprovare.",
            fullName: 'Per favore, inserisci un nome completo valido',
            ownershipPercentage: 'Per favore, inserisci un numero percentuale valido',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Dove si trova il tuo conto bancario?',
        accountDetailsStepHeader: 'Quali sono i dettagli del tuo account?',
        accountTypeStepHeader: 'Che tipo di account è questo?',
        bankInformationStepHeader: 'Quali sono i tuoi dettagli bancari?',
        accountHolderInformationStepHeader: 'Quali sono i dettagli del titolare del conto?',
        howDoWeProtectYourData: 'Come proteggiamo i tuoi dati?',
        currencyHeader: 'Qual è la valuta del tuo conto bancario?',
        confirmationStepHeader: 'Controlla le tue informazioni.',
        confirmationStepSubHeader: 'Ricontrolla i dettagli qui sotto e seleziona la casella dei termini per confermare.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Inserisci la password di Expensify',
        alreadyAdded: 'Questo account è già stato aggiunto.',
        chooseAccountLabel: 'Account',
        successTitle: 'Conto bancario personale aggiunto!',
        successMessage: 'Congratulazioni, il tuo conto bancario è configurato ed è pronto a ricevere i rimborsi.',
    },
    attachmentView: {
        unknownFilename: 'Nome file sconosciuto',
        passwordRequired: 'Per favore inserisci una password',
        passwordIncorrect: 'Password errata. Riprova.',
        failedToLoadPDF: 'Impossibile caricare il file PDF',
        pdfPasswordForm: {
            title: 'PDF protetto da password',
            infoText: 'Questo PDF è protetto da password.',
            beforeLinkText: 'Per favore',
            linkText: 'inserisci la password',
            afterLinkText: 'per visualizzarlo.',
            formLabel: 'Visualizza PDF',
        },
        attachmentNotFound: 'Allegato non trovato',
    },
    messages: {
        errorMessageInvalidPhone: `Per favore, inserisci un numero di telefono valido senza parentesi o trattini. Se ti trovi al di fuori degli Stati Uniti, includi il tuo prefisso internazionale (ad es. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Email non valido',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} è già un membro di ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Continuando con la richiesta di attivare il tuo Expensify Wallet, confermi di aver letto, compreso e accettato',
        facialScan: 'Politica e Rilascio della Scansione Facciale di Onfido',
        tryAgain: 'Riprova',
        verifyIdentity: 'Verifica identità',
        letsVerifyIdentity: 'Verifichiamo la tua identità',
        butFirst: `Ma prima, le cose noiose. Leggi le informazioni legali nel prossimo passaggio e fai clic su "Accetta" quando sei pronto.`,
        genericError: "Si è verificato un errore durante l'elaborazione di questo passaggio. Per favore riprova.",
        cameraPermissionsNotGranted: "Abilita l'accesso alla fotocamera",
        cameraRequestMessage: 'Abbiamo bisogno di accedere alla tua fotocamera per completare la verifica del conto bancario. Abilitala tramite Impostazioni > New Expensify.',
        microphonePermissionsNotGranted: "Abilita l'accesso al microfono",
        microphoneRequestMessage: 'Abbiamo bisogno di accedere al tuo microfono per completare la verifica del conto bancario. Abilitalo tramite Impostazioni > New Expensify.',
        originalDocumentNeeded: "Per favore carica un'immagine originale del tuo documento d'identità invece di uno screenshot o un'immagine scansionata.",
        documentNeedsBetterQuality:
            "Il tuo documento d'identità sembra essere danneggiato o mancano caratteristiche di sicurezza. Carica un'immagine originale di un documento d'identità non danneggiato che sia completamente visibile.",
        imageNeedsBetterQuality:
            "C'è un problema con la qualità dell'immagine del tuo documento d'identità. Per favore, carica una nuova immagine in cui il tuo documento d'identità sia visibile chiaramente.",
        selfieIssue: "C'è un problema con il tuo selfie/video. Per favore carica un selfie/video dal vivo.",
        selfieNotMatching: "Il tuo selfie/video non corrisponde al tuo documento d'identità. Per favore carica un nuovo selfie/video in cui il tuo viso sia chiaramente visibile.",
        selfieNotLive: 'Il tuo selfie/video non sembra essere una foto/video dal vivo. Per favore, carica un selfie/video dal vivo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dettagli aggiuntivi',
        helpText: 'Dobbiamo confermare le seguenti informazioni prima che tu possa inviare e ricevere denaro dal tuo portafoglio.',
        helpTextIdologyQuestions: 'Abbiamo bisogno di farti solo alcune altre domande per completare la validazione della tua identità.',
        helpLink: 'Scopri di più sul perché ne abbiamo bisogno.',
        legalFirstNameLabel: 'Nome legale',
        legalMiddleNameLabel: 'Secondo nome legale',
        legalLastNameLabel: 'Cognome legale',
        selectAnswer: 'Seleziona una risposta per procedere',
        ssnFull9Error: 'Inserisci un SSN valido di nove cifre',
        needSSNFull9: 'Stiamo riscontrando problemi nel verificare il tuo SSN. Inserisci tutti i nove numeri del tuo SSN.',
        weCouldNotVerify: 'Non siamo riusciti a verificare',
        pleaseFixIt: 'Si prega di correggere queste informazioni prima di continuare.',
        failedKYCTextBefore: 'Non siamo riusciti a verificare la tua identità. Per favore riprova più tardi o contatta',
        failedKYCTextAfter: 'se hai domande.',
    },
    termsStep: {
        headerTitle: 'Termini e tariffe',
        headerTitleRefactor: 'Commissioni e termini',
        haveReadAndAgree: 'Ho letto e accetto di ricevere',
        electronicDisclosures: 'informative elettroniche',
        agreeToThe: 'Accetto il',
        walletAgreement: 'Accordo del portafoglio',
        enablePayments: 'Abilita pagamenti',
        monthlyFee: 'Tariffa mensile',
        inactivity: 'Inattività',
        noOverdraftOrCredit: 'Nessuna funzione di scoperto/credito.',
        electronicFundsWithdrawal: 'Prelievo di fondi elettronici',
        standard: 'Standard',
        reviewTheFees: "Dai un'occhiata ad alcune tariffe.",
        checkTheBoxes: 'Si prega di selezionare le caselle qui sotto.',
        agreeToTerms: 'Accetta i termini e sarai pronto per partire!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Il Portafoglio Expensify è emesso da ${walletProgram}.`,
            perPurchase: 'Per acquisto',
            atmWithdrawal: 'Prelievo bancomat',
            cashReload: 'Ricarica in contanti',
            inNetwork: 'in-network',
            outOfNetwork: 'fuori rete',
            atmBalanceInquiry: 'Richiesta saldo bancomat',
            inOrOutOfNetwork: '(in-network o out-of-network)',
            customerService: 'Servizio clienti',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(dopo 12 mesi senza transazioni)',
            weChargeOneFee: 'Addebitiamo un altro tipo di commissione. È:',
            fdicInsurance: "I tuoi fondi sono idonei per l'assicurazione FDIC.",
            generalInfo: 'Per informazioni generali sui conti prepagati, visita',
            conditionsDetails: 'Per dettagli e condizioni su tutte le tariffe e i servizi, visita',
            conditionsPhone: 'o chiamando il +1 833-400-0904.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Un elenco di tutte le commissioni del Portafoglio Expensify',
            typeOfFeeHeader: 'Tutte le commissioni',
            feeAmountHeader: 'Importo',
            moreDetailsHeader: 'Dettagli',
            openingAccountTitle: 'Apertura di un account',
            openingAccountDetails: "Non c'è alcuna commissione per aprire un account.",
            monthlyFeeDetails: 'Non ci sono costi mensili.',
            customerServiceTitle: 'Servizio clienti',
            customerServiceDetails: 'Non ci sono commissioni per il servizio clienti.',
            inactivityDetails: 'Non ci sono commissioni di inattività.',
            sendingFundsTitle: 'Invio di fondi a un altro titolare di conto',
            sendingFundsDetails: "Non c'è alcuna commissione per inviare fondi a un altro titolare di conto utilizzando il tuo saldo, conto bancario o carta di debito.",
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
            fdicInsuranceBancorp2: 'per dettagli.',
            contactExpensifyPayments: `Contatta ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} chiamando il numero +1 833-400-0904, via email a`,
            contactExpensifyPayments2: 'oppure accedi su',
            generalInformation: 'Per informazioni generali sui conti prepagati, visita',
            generalInformation2: 'Se hai un reclamo su un account prepagato, chiama il Consumer Financial Protection Bureau al numero 1-855-411-2372 o visita',
            printerFriendlyView: 'Visualizza la versione stampabile',
            automated: 'Automatizzato',
            liveAgent: 'Agente dal vivo',
            instant: 'Istantaneo',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Abilita pagamenti',
        activatedTitle: 'Portafoglio attivato!',
        activatedMessage: 'Congratulazioni, il tuo portafoglio è configurato e pronto per effettuare pagamenti.',
        checkBackLaterTitle: 'Solo un minuto...',
        checkBackLaterMessage: 'Stiamo ancora esaminando le tue informazioni. Per favore, ricontrolla più tardi.',
        continueToPayment: 'Continua al pagamento',
        continueToTransfer: 'Continua a trasferire',
    },
    companyStep: {
        headerTitle: "Informazioni sull'azienda",
        subtitle: 'Quasi fatto! Per motivi di sicurezza, dobbiamo confermare alcune informazioni:',
        legalBusinessName: "Nome legale dell'azienda",
        companyWebsite: "Sito web dell'azienda",
        taxIDNumber: 'Numero di identificazione fiscale',
        taxIDNumberPlaceholder: '9 cifre',
        companyType: 'Tipo di azienda',
        incorporationDate: 'Data di costituzione',
        incorporationState: 'Stato di incorporazione',
        industryClassificationCode: 'Codice di classificazione industriale',
        confirmCompanyIsNot: 'Confermo che questa azienda non è nel',
        listOfRestrictedBusinesses: 'elenco delle attività commerciali soggette a restrizioni',
        incorporationDatePlaceholder: 'Data di inizio (aaaa-mm-gg)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnership',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Ditta individuale',
            OTHER: 'Altro',
        },
        industryClassification: "In quale settore è classificata l'azienda?",
        industryClassificationCodePlaceholder: "Cerca il codice di classificazione dell'industria",
    },
    requestorStep: {
        headerTitle: 'Informazioni personali',
        learnMore: 'Scopri di più',
        isMyDataSafe: 'I miei dati sono al sicuro?',
    },
    personalInfoStep: {
        personalInfo: 'Informazioni personali',
        enterYourLegalFirstAndLast: 'Qual è il tuo nome legale?',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        legalName: 'Nome legale',
        enterYourDateOfBirth: 'Qual è la tua data di nascita?',
        enterTheLast4: 'Quali sono le ultime quattro cifre del tuo numero di previdenza sociale?',
        dontWorry: 'Non preoccuparti, non facciamo alcun controllo del credito personale!',
        last4SSN: 'Ultime 4 cifre del SSN',
        enterYourAddress: 'Qual è il tuo indirizzo?',
        address: 'Indirizzo',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        byAddingThisBankAccount: 'Aggiungendo questo conto bancario, confermi di aver letto, compreso e accettato',
        whatsYourLegalName: 'Qual è il tuo nome legale?',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        whatsYourAddress: 'Qual è il tuo indirizzo?',
        whatsYourSSN: 'Quali sono le ultime quattro cifre del tuo numero di previdenza sociale?',
        noPersonalChecks: 'Non preoccuparti, qui non ci sono controlli del credito personali!',
        whatsYourPhoneNumber: 'Qual è il tuo numero di telefono?',
        weNeedThisToVerify: 'Abbiamo bisogno di questo per verificare il tuo portafoglio.',
    },
    businessInfoStep: {
        businessInfo: "Informazioni sull'azienda",
        enterTheNameOfYourBusiness: 'Qual è il nome della tua azienda?',
        businessName: "Nome legale dell'azienda",
        enterYourCompanyTaxIdNumber: 'Qual è il numero di partita IVA della tua azienda?',
        taxIDNumber: 'Numero di identificazione fiscale',
        taxIDNumberPlaceholder: '9 cifre',
        enterYourCompanyWebsite: 'Qual è il sito web della tua azienda?',
        companyWebsite: "Sito web dell'azienda",
        enterYourCompanyPhoneNumber: 'Qual è il numero di telefono della tua azienda?',
        enterYourCompanyAddress: "Qual è l'indirizzo della tua azienda?",
        selectYourCompanyType: 'Che tipo di azienda è?',
        companyType: 'Tipo di azienda',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnership',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Ditta individuale',
            OTHER: 'Altro',
        },
        selectYourCompanyIncorporationDate: 'Qual è la data di costituzione della tua azienda?',
        incorporationDate: 'Data di costituzione',
        incorporationDatePlaceholder: 'Data di inizio (aaaa-mm-gg)',
        incorporationState: 'Stato di incorporazione',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In quale stato è stata costituita la tua azienda?',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        companyAddress: "Indirizzo dell'azienda",
        listOfRestrictedBusinesses: 'elenco delle attività commerciali soggette a restrizioni',
        confirmCompanyIsNot: 'Confermo che questa azienda non è nel',
        businessInfoTitle: 'Informazioni aziendali',
        legalBusinessName: "Nome legale dell'azienda",
        whatsTheBusinessName: "Qual è il nome dell'azienda?",
        whatsTheBusinessAddress: "Qual è l'indirizzo dell'azienda?",
        whatsTheBusinessContactInformation: 'Quali sono le informazioni di contatto aziendali?',
        whatsTheBusinessRegistrationNumber: "Qual è il numero di registrazione dell'azienda?",
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Qual è il numero di identificazione del datore di lavoro (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Qual è il numero aziendale (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Qual è il numero di partita IVA (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Qual è il numero aziendale australiano (ABN)?';
                default:
                    return 'Qual è il numero di partita IVA UE?';
            }
        },
        whatsThisNumber: 'Qual è questo numero?',
        whereWasTheBusinessIncorporated: "Dove è stata costituita l'azienda?",
        whatTypeOfBusinessIsIt: 'Che tipo di attività è?',
        whatsTheBusinessAnnualPayment: "Qual è il volume di pagamento annuale dell'azienda?",
        whatsYourExpectedAverageReimbursements: "Qual è l'importo medio di rimborso previsto?",
        registrationNumber: 'Numero di registrazione',
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
                    return 'IVA UE';
            }
        },
        businessAddress: 'Indirizzo aziendale',
        businessType: 'Tipo di attività',
        incorporation: 'Incorporazione',
        incorporationCountry: 'Paese di costituzione',
        incorporationTypeName: 'Tipo di incorporazione',
        businessCategory: 'Categoria aziendale',
        annualPaymentVolume: 'Volume di pagamento annuale',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Volume di pagamento annuale in ${currencyCode}`,
        averageReimbursementAmount: 'Importo medio del rimborso',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Importo medio del rimborso in ${currencyCode}`,
        selectIncorporationType: 'Seleziona il tipo di incorporazione',
        selectBusinessCategory: 'Seleziona categoria aziendale',
        selectAnnualPaymentVolume: 'Seleziona il volume di pagamento annuale',
        selectIncorporationCountry: 'Seleziona il paese di incorporazione',
        selectIncorporationState: 'Seleziona lo stato di incorporazione',
        selectAverageReimbursement: "Seleziona l'importo medio del rimborso",
        findIncorporationType: 'Trova il tipo di incorporazione',
        findBusinessCategory: 'Trova categoria aziendale',
        findAnnualPaymentVolume: 'Trova il volume dei pagamenti annuali',
        findIncorporationState: 'Trova lo stato di incorporazione',
        findAverageReimbursement: "Trova l'importo medio del rimborso",
        error: {
            registrationNumber: 'Si prega di fornire un numero di registrazione valido',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Si prega di fornire un numero di identificazione del datore di lavoro (EIN) valido';
                    case CONST.COUNTRY.CA:
                        return 'Si prega di fornire un numero aziendale (BN) valido';
                    case CONST.COUNTRY.GB:
                        return 'Si prega di fornire un numero di partita IVA (VRN) valido';
                    case CONST.COUNTRY.AU:
                        return 'Si prega di fornire un numero aziendale australiano (ABN) valido';
                    default:
                        return 'Si prega di fornire un numero di partita IVA UE valido';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Possiedi il 25% o più di',
        doAnyIndividualOwn25percent: 'Qualcuno possiede il 25% o più di',
        areThereMoreIndividualsWhoOwn25percent: 'Ci sono più individui che possiedono il 25% o più di',
        regulationRequiresUsToVerifyTheIdentity: "La normativa ci impone di verificare l'identità di qualsiasi individuo che possieda più del 25% dell'azienda.",
        companyOwner: "Proprietario dell'azienda",
        enterLegalFirstAndLastName: 'Qual è il nome legale del proprietario?',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        enterTheDateOfBirthOfTheOwner: 'Qual è la data di nascita del proprietario?',
        enterTheLast4: 'Quali sono le ultime 4 cifre del numero di previdenza sociale del proprietario?',
        last4SSN: 'Ultime 4 cifre del SSN',
        dontWorry: 'Non preoccuparti, non facciamo alcun controllo del credito personale!',
        enterTheOwnersAddress: "Qual è l'indirizzo del proprietario?",
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        legalName: 'Nome legale',
        address: 'Indirizzo',
        byAddingThisBankAccount: 'Aggiungendo questo conto bancario, confermi di aver letto, compreso e accettato',
        owners: 'Proprietari',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informazioni sul proprietario',
        businessOwner: "Proprietario dell'azienda",
        signerInfo: 'Informazioni sul firmatario',
        doYouOwn: ({companyName}: CompanyNameParams) => `Possiedi il 25% o più di ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Qualcuno possiede il 25% o più di ${companyName}?`,
        regulationsRequire: "Le normative ci impongono di verificare l'identità di qualsiasi individuo che possieda più del 25% dell'azienda.",
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        whatsTheOwnersName: 'Qual è il nome legale del proprietario?',
        whatsYourName: 'Qual è il tuo nome legale?',
        whatPercentage: "Quale percentuale dell'azienda appartiene al proprietario?",
        whatsYoursPercentage: "Quale percentuale dell'azienda possiedi?",
        ownership: 'Proprietà',
        whatsTheOwnersDOB: 'Qual è la data di nascita del proprietario?',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        whatsTheOwnersAddress: "Qual è l'indirizzo del proprietario?",
        whatsYourAddress: 'Qual è il tuo indirizzo?',
        whatAreTheLast: 'Quali sono le ultime 4 cifre del numero di previdenza sociale del proprietario?',
        whatsYourLast: 'Quali sono le ultime 4 cifre del tuo numero di previdenza sociale?',
        dontWorry: 'Non preoccuparti, non facciamo alcun controllo del credito personale!',
        last4: 'Ultime 4 cifre del SSN',
        whyDoWeAsk: 'Perché lo chiediamo?',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        legalName: 'Nome legale',
        ownershipPercentage: 'Percentuale di proprietà',
        areThereOther: ({companyName}: CompanyNameParams) => `Ci sono altre persone che possiedono il 25% o più di ${companyName}?`,
        owners: 'Proprietari',
        addCertified: 'Aggiungi un organigramma certificato che mostri i proprietari beneficiari',
        regulationRequiresChart:
            "La normativa ci impone di raccogliere una copia certificata dell'organigramma di proprietà che mostra ogni individuo o entità che possiede il 25% o più dell'azienda.",
        uploadEntity: "Carica il grafico di proprietà dell'entità",
        noteEntity: "Nota: Il grafico di proprietà dell'entità deve essere firmato dal tuo commercialista, consulente legale o notarizzato.",
        certified: "Grafico di proprietà dell'entità certificata",
        selectCountry: 'Seleziona paese',
        findCountry: 'Trova paese',
        address: 'Indirizzo',
        chooseFile: 'Scegli file',
        uploadDocuments: 'Carica documentazione aggiuntiva',
        pleaseUpload:
            "Si prega di caricare ulteriore documentazione qui sotto per aiutarci a verificare la tua identità come proprietario diretto o indiretto del 25% o più dell'entità aziendale.",
        acceptedFiles: 'Formati di file accettati: PDF, PNG, JPEG. La dimensione totale del file per ciascuna sezione non può superare i 5 MB.',
        proofOfBeneficialOwner: 'Prova del titolare effettivo',
        proofOfBeneficialOwnerDescription:
            "Si prega di fornire un'attestazione firmata e un organigramma da un commercialista, notaio o avvocato che verifichi la proprietà del 25% o più dell'azienda. Deve essere datato negli ultimi tre mesi e includere il numero di licenza del firmatario.",
        copyOfID: "Copia del documento d'identità per il titolare effettivo",
        copyOfIDDescription: 'Esempi: passaporto, patente di guida, ecc.',
        proofOfAddress: 'Prova di indirizzo per il titolare effettivo',
        proofOfAddressDescription: 'Esempi: bolletta delle utenze, contratto di locazione, ecc.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            "Si prega di caricare un video di una visita al sito o una chiamata registrata con l'ufficiale firmatario. L'ufficiale deve fornire: nome completo, data di nascita, nome dell'azienda, numero di registrazione, codice fiscale, indirizzo registrato, natura dell'attività e scopo del conto.",
    },
    validationStep: {
        headerTitle: 'Convalida conto bancario',
        buttonText: 'Completa la configurazione',
        maxAttemptsReached: 'La convalida per questo conto bancario è stata disabilitata a causa di troppi tentativi errati.',
        description: `Entro 1-2 giorni lavorativi, invieremo tre (3) piccole transazioni al tuo conto bancario da un nome come "Expensify, Inc. Validation".`,
        descriptionCTA: "Inserisci l'importo di ciascuna transazione nei campi sottostanti. Esempio: 1.51.",
        reviewingInfo: 'Grazie! Stiamo esaminando le tue informazioni e ti contatteremo a breve. Per favore, controlla la tua chat con Concierge.',
        forNextStep: 'per i prossimi passaggi per completare la configurazione del tuo conto bancario.',
        letsChatCTA: 'Sì, parliamo.',
        letsChatText: 'Quasi fatto! Abbiamo bisogno del tuo aiuto per verificare alcune ultime informazioni tramite chat. Pronto?',
        letsChatTitle: 'Parliamo!',
        enable2FATitle: "Previeni le frodi, abilita l'autenticazione a due fattori (2FA)",
        enable2FAText: "Prendiamo la tua sicurezza sul serio. Imposta ora l'autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.",
        secureYourAccount: 'Proteggi il tuo account',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Informazioni aggiuntive',
        checkAllThatApply: 'Seleziona tutte le opzioni applicabili, altrimenti lascia vuoto.',
        iOwnMoreThan25Percent: 'Possiedo più del 25% di',
        someoneOwnsMoreThan25Percent: 'Qualcun altro possiede più del 25% di',
        additionalOwner: 'Proprietario beneficiario aggiuntivo',
        removeOwner: 'Rimuovi questo titolare effettivo',
        addAnotherIndividual: "Aggiungi un'altra persona che possiede più del 25% di",
        agreement: 'Accordo:',
        termsAndConditions: 'termini e condizioni',
        certifyTrueAndAccurate: 'Certifico che le informazioni fornite sono veritiere e accurate.',
        error: {
            certify: 'Deve certificare che le informazioni siano veritiere e accurate',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Completa la verifica',
        confirmAgreements: 'Per favore, conferma gli accordi qui sotto.',
        certifyTrueAndAccurate: 'Certifico che le informazioni fornite sono veritiere e accurate.',
        certifyTrueAndAccurateError: 'Si prega di certificare che le informazioni sono veritiere e accurate',
        isAuthorizedToUseBankAccount: 'Sono autorizzato a utilizzare questo conto bancario aziendale per le spese aziendali.',
        isAuthorizedToUseBankAccountError: "Devi essere un ufficiale di controllo con l'autorizzazione per operare sul conto bancario aziendale.",
        termsAndConditions: 'termini e condizioni',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Collega conto bancario',
        finishButtonText: 'Completa la configurazione',
        validateYourBankAccount: 'Convalida il tuo conto bancario',
        validateButtonText: 'Convalida',
        validationInputLabel: 'Transazione',
        maxAttemptsReached: 'La convalida per questo conto bancario è stata disabilitata a causa di troppi tentativi errati.',
        description: `Entro 1-2 giorni lavorativi, invieremo tre (3) piccole transazioni al tuo conto bancario da un nome come "Expensify, Inc. Validation".`,
        descriptionCTA: "Inserisci l'importo di ciascuna transazione nei campi sottostanti. Esempio: 1.51.",
        reviewingInfo: 'Grazie! Stiamo esaminando le tue informazioni e ti contatteremo a breve. Controlla la tua chat con Concierge.',
        forNextSteps: 'per i prossimi passaggi per completare la configurazione del tuo conto bancario.',
        letsChatCTA: 'Sì, parliamo.',
        letsChatText: 'Quasi fatto! Abbiamo bisogno del tuo aiuto per verificare alcune ultime informazioni tramite chat. Pronto?',
        letsChatTitle: 'Parliamo!',
        enable2FATitle: "Previeni le frodi, abilita l'autenticazione a due fattori (2FA)",
        enable2FAText: "Prendiamo la tua sicurezza sul serio. Imposta ora l'autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.",
        secureYourAccount: 'Proteggi il tuo account',
    },
    countryStep: {
        confirmBusinessBank: 'Conferma la valuta e il paese del conto bancario aziendale',
        confirmCurrency: 'Conferma valuta e paese',
        yourBusiness: 'La valuta del conto bancario aziendale deve corrispondere alla valuta dello spazio di lavoro.',
        youCanChange: 'Puoi cambiare la valuta del tuo spazio di lavoro nel tuo',
        findCountry: 'Trova paese',
        selectCountry: 'Seleziona paese',
    },
    bankInfoStep: {
        whatAreYour: 'Quali sono i dettagli del tuo conto bancario aziendale?',
        letsDoubleCheck: 'Verifichiamo che tutto sia a posto.',
        thisBankAccount: 'Questo conto bancario sarà utilizzato per i pagamenti aziendali nel tuo spazio di lavoro.',
        accountNumber: 'Numero di conto',
        accountHolderNameDescription: 'Nome completo del firmatario autorizzato',
    },
    signerInfoStep: {
        signerInfo: 'Informazioni sul firmatario',
        areYouDirector: ({companyName}: CompanyNameParams) => `Sei un direttore o un dirigente senior presso ${companyName}?`,
        regulationRequiresUs: "La normativa ci impone di verificare se il firmatario ha l'autorità di intraprendere questa azione per conto dell'azienda.",
        whatsYourName: 'Qual è il tuo nome legale?',
        fullName: 'Nome completo legale',
        whatsYourJobTitle: 'Qual è il tuo titolo di lavoro?',
        jobTitle: 'Titolo di lavoro',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        uploadID: "Carica documento d'identità e prova di indirizzo",
        personalAddress: 'Prova di indirizzo personale (ad esempio, bolletta)',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        legalName: 'Nome legale',
        proofOf: 'Prova di indirizzo personale',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Inserisci l'email del direttore o dirigente senior presso ${companyName}`,
        regulationRequiresOneMoreDirector: 'La normativa richiede almeno un altro direttore o dirigente senior come firmatario.',
        hangTight: 'Attendi un attimo...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Inserisci le email di due direttori o dirigenti senior presso ${companyName}`,
        sendReminder: 'Invia un promemoria',
        chooseFile: 'Scegli file',
        weAreWaiting: "Stiamo aspettando che altri verifichino la loro identità come direttori o dirigenti senior dell'azienda.",
        id: "Copia del documento d'identità",
        proofOfDirectors: 'Prova del/i direttore/i',
        proofOfDirectorsDescription: 'Esempi: Profilo aziendale Oncorp o registrazione aziendale.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale per Firmatari, Utenti Autorizzati e Beneficiari Effettivi.',
        PDSandFSG: 'Documentazione di divulgazione PDS + FSG',
        PDSandFSGDescription:
            'La nostra partnership con Corpay utilizza una connessione API per sfruttare la loro vasta rete di partner bancari internazionali per alimentare i Rimborsi Globali in Expensify. Secondo la normativa australiana, ti forniamo la Guida ai Servizi Finanziari (FSG) e la Dichiarazione di Divulgazione del Prodotto (PDS) di Corpay.\n\nSi prega di leggere attentamente i documenti FSG e PDS poiché contengono dettagli completi e informazioni importanti sui prodotti e servizi offerti da Corpay. Conserva questi documenti per riferimento futuro.',
        pleaseUpload: "Si prega di caricare ulteriore documentazione qui sotto per aiutarci a verificare la tua identità come direttore o dirigente senior dell'entità aziendale.",
    },
    agreementsStep: {
        agreements: 'Accordi',
        pleaseConfirm: 'Si prega di confermare gli accordi di seguito',
        regulationRequiresUs: "La normativa ci impone di verificare l'identità di qualsiasi individuo che possieda più del 25% dell'azienda.",
        iAmAuthorized: 'Sono autorizzato a utilizzare il conto bancario aziendale per le spese aziendali.',
        iCertify: 'Certifico che le informazioni fornite sono veritiere e accurate.',
        termsAndConditions: 'termini e condizioni',
        accept: 'Accetta e aggiungi conto bancario',
        iConsentToThe: 'Acconsento al',
        privacyNotice: 'informativa sulla privacy',
        error: {
            authorized: "Devi essere un ufficiale di controllo con l'autorizzazione per operare sul conto bancario aziendale.",
            certify: 'Si prega di certificare che le informazioni sono veritiere e accurate',
            consent: "Si prega di acconsentire all'informativa sulla privacy",
        },
    },
    finishStep: {
        connect: 'Collega conto bancario',
        letsFinish: 'Finisciamo in chat!',
        thanksFor:
            'Grazie per questi dettagli. Un agente di supporto dedicato esaminerà ora le tue informazioni. Ti ricontatteremo se avremo bisogno di ulteriori informazioni da parte tua, ma nel frattempo, non esitare a contattarci per qualsiasi domanda.',
        iHaveA: 'Ho una domanda',
        enable2FA: "Abilita l'autenticazione a due fattori (2FA) per prevenire le frodi",
        weTake: "Prendiamo la tua sicurezza sul serio. Imposta ora l'autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.",
        secure: 'Proteggi il tuo account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Un momento',
        explanationLine: 'Stiamo esaminando le tue informazioni. Potrai continuare con i prossimi passaggi a breve.',
    },
    session: {
        offlineMessageRetry: 'Sembra che tu sia offline. Controlla la tua connessione e riprova.',
    },
    travel: {
        header: 'Prenota viaggio',
        title: 'Viaggia con intelligenza',
        subtitle: 'Usa Expensify Travel per ottenere le migliori offerte di viaggio e gestire tutte le tue spese aziendali in un unico posto.',
        features: {
            saveMoney: 'Risparmia sui tuoi prenotazioni',
            alerts: 'Ricevi aggiornamenti e avvisi in tempo reale',
        },
        bookTravel: 'Prenota viaggio',
        bookDemo: 'Prenota una demo',
        bookADemo: 'Prenota una demo',
        toLearnMore: 'per saperne di più.',
        termsAndConditions: {
            header: 'Prima di continuare...',
            title: 'Termini e condizioni',
            subtitle: 'Si prega di accettare Expensify Travel',
            termsAndConditions: 'termini e condizioni',
            travelTermsAndConditions: 'termini e condizioni',
            agree: 'Accetto i',
            error: 'Devi accettare i termini e le condizioni di Expensify Travel per continuare',
            defaultWorkspaceError:
                "Devi impostare un'area di lavoro predefinita per abilitare Expensify Travel. Vai su Impostazioni > Aree di lavoro > clicca sui tre punti verticali accanto a un'area di lavoro > Imposta come area di lavoro predefinita, quindi riprova!",
        },
        flight: 'Volo',
        flightDetails: {
            passenger: 'Passeggero',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Hai uno <strong>scalo di ${layover}</strong> prima di questo volo</muted-text-label>`,
            takeOff: 'Decollo',
            landing: 'Atterraggio',
            seat: 'Posto',
            class: 'Classe Cabina',
            recordLocator: 'Localizzatore di registrazione',
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Economia',
                premiumEconomy: 'Premium Economy',
                business: 'Business',
                first: 'Primo',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Ospite',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            roomType: 'Tipo di stanza',
            cancellation: 'Politica di cancellazione',
            cancellationUntil: 'Cancellazione gratuita fino al',
            confirmation: 'Numero di conferma',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Non rimborsabile',
                freeCancellationUntil: 'Cancellazione gratuita fino al',
                partiallyRefundable: 'Parzialmente rimborsabile',
            },
        },
        car: 'Auto',
        carDetails: {
            rentalCar: 'Noleggio auto',
            pickUp: 'Ritiro',
            dropOff: 'Consegna',
            driver: 'Autista',
            carType: 'Tipo di auto',
            cancellation: 'Politica di cancellazione',
            cancellationUntil: 'Cancellazione gratuita fino al',
            freeCancellation: 'Cancellazione gratuita',
            confirmation: 'Numero di conferma',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Passeggero',
            departs: 'Parte',
            arrives: 'Arriva',
            coachNumber: 'Numero del coach',
            seat: 'Posto',
            fareDetails: 'Dettagli della tariffa',
            confirmation: 'Numero di conferma',
        },
        viewTrip: 'Visualizza viaggio',
        modifyTrip: 'Modifica viaggio',
        tripSupport: 'Supporto per i viaggi',
        tripDetails: 'Dettagli del viaggio',
        viewTripDetails: 'Visualizza i dettagli del viaggio',
        trip: 'Viaggio',
        trips: 'Viaggi',
        tripSummary: 'Riepilogo del viaggio',
        departs: 'Parte',
        errorMessage: 'Qualcosa è andato storto. Per favore riprova più tardi.',
        phoneError: {
            phrase1: 'Per favore',
            link: "aggiungi un'email di lavoro come login principale",
            phrase2: 'per prenotare viaggi.',
        },
        domainSelector: {
            title: 'Dominio',
            subtitle: 'Scegli un dominio per la configurazione di Expensify Travel.',
            recommended: 'Consigliato',
        },
        domainPermissionInfo: {
            title: 'Dominio',
            restrictionPrefix: `Non hai il permesso di abilitare Expensify Travel per il dominio`,
            restrictionSuffix: `Dovrai chiedere a qualcuno di quel dominio di abilitare i viaggi invece.`,
            accountantInvitationPrefix: `Se sei un contabile, considera di unirti al`,
            accountantInvitationLink: `Programma per contabili ExpensifyApproved!`,
            accountantInvitationSuffix: `abilitare i viaggi per questo dominio.`,
        },
        publicDomainError: {
            title: 'Inizia con Expensify Travel',
            message: `Dovrai utilizzare la tua email di lavoro (ad esempio, nome@azienda.com) con Expensify Travel, non la tua email personale (ad esempio, nome@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel è stato disabilitato',
            message: `Il tuo amministratore ha disattivato Expensify Travel. Si prega di seguire la politica di prenotazione della tua azienda per le disposizioni di viaggio.`,
        },
        verifyCompany: {
            title: 'Inizia a viaggiare oggi stesso!',
            message: `Si prega di contattare il proprio Account Manager o salesteam@expensify.com per ottenere una demo di viaggio e attivarla per la vostra azienda.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Il tuo volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato prenotato. Codice di conferma: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Il tuo biglietto per il volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato annullato.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Il tuo biglietto per il volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato rimborsato o cambiato.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Il tuo volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato cancellato dalla compagnia aerea.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) => `La compagnia aerea ha proposto una modifica all'orario per il volo ${airlineCode}; stiamo aspettando conferma.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Conferma del cambio di orario: il volo ${airlineCode} ora parte alle ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Il tuo volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato aggiornato.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `La tua classe di cabina è stata aggiornata a ${cabinClass} sul volo ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Il tuo posto assegnato sul volo ${airlineCode} è stato confermato.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Il tuo posto assegnato sul volo ${airlineCode} è stato cambiato.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `La tua assegnazione del posto sul volo ${airlineCode} è stata rimossa.`,
            paymentDeclined: 'Il pagamento per la tua prenotazione aerea non è riuscito. Per favore, riprova.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Hai annullato la tua prenotazione ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Il fornitore ha cancellato la tua prenotazione ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `La tua prenotazione ${type} è stata riprenotata. Nuovo numero di conferma: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `La tua prenotazione ${type} è stata aggiornata. Controlla i nuovi dettagli nell'itinerario.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Il tuo biglietto ferroviario per ${origin} → ${destination} del ${startDate} è stato rimborsato. Un credito verrà elaborato.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Il tuo biglietto ferroviario per ${origin} → ${destination} del ${startDate} è stato scambiato.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Il tuo biglietto ferroviario per ${origin} → ${destination} del ${startDate} è stato aggiornato.`,
            defaultUpdate: ({type}: TravelTypeParams) => `La tua prenotazione ${type} è stata aggiornata.`,
        },
    },
    workspace: {
        common: {
            card: 'Carte',
            expensifyCard: 'Expensify Card',
            companyCards: 'Carte aziendali',
            workflows: 'Flussi di lavoro',
            workspace: 'Spazio di lavoro',
            findWorkspace: 'Trova spazio di lavoro',
            edit: 'Modifica spazio di lavoro',
            enabled: 'Abilitato',
            disabled: 'Disabilitato',
            everyone: 'Tutti quanti',
            delete: 'Elimina spazio di lavoro',
            settings: 'Impostazioni',
            reimburse: 'Rimborsi',
            categories: 'Categorie',
            tags: 'Tag',
            customField1: 'Campo personalizzato 1',
            customField2: 'Campo personalizzato 2',
            customFieldHint: 'Aggiungi una codifica personalizzata che si applica a tutte le spese di questo membro.',
            reportFields: 'Campi del rapporto',
            reportTitle: 'Titolo del rapporto',
            reportField: 'Campo del report',
            taxes: 'Tasse',
            bills: 'Fatture',
            invoices: 'Fatture',
            travel: 'Viaggio',
            members: 'Membri',
            accounting: 'Contabilità',
            rules: 'Regole',
            displayedAs: 'Visualizzato come',
            plan: 'Piano',
            profile: 'Panoramica',
            bankAccount: 'Conto bancario',
            connectBankAccount: 'Collega conto bancario',
            testTransactions: 'Transazioni di prova',
            issueAndManageCards: 'Emetti e gestisci carte',
            reconcileCards: 'Riconcilia carte',
            selected: () => ({
                one: '1 selezionato',
                other: (count: number) => `${count} selezionati`,
            }),
            settlementFrequency: 'Frequenza di liquidazione',
            setAsDefault: 'Imposta come spazio di lavoro predefinito',
            defaultNote: `Le ricevute inviate a ${CONST.EMAIL.RECEIPTS} appariranno in questo spazio di lavoro.`,
            deleteConfirmation: 'Sei sicuro di voler eliminare questo spazio di lavoro?',
            deleteWithCardsConfirmation: 'Sei sicuro di voler eliminare questo spazio di lavoro? Questo rimuoverà tutti i feed delle carte e le carte assegnate.',
            unavailable: 'Spazio di lavoro non disponibile',
            memberNotFound: 'Membro non trovato. Per invitare un nuovo membro al workspace, utilizza il pulsante di invito sopra.',
            notAuthorized: `Non hai accesso a questa pagina. Se stai cercando di unirti a questo spazio di lavoro, chiedi semplicemente al proprietario dello spazio di lavoro di aggiungerti come membro. Qualcos'altro? Contatta ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Vai allo spazio di lavoro',
            goToWorkspaces: 'Vai agli spazi di lavoro',
            clearFilter: 'Cancella filtro',
            workspaceName: 'Nome del workspace',
            workspaceOwner: 'Proprietario',
            workspaceType: 'Tipo di spazio di lavoro',
            workspaceAvatar: 'Avatar del workspace',
            mustBeOnlineToViewMembers: 'Devi essere online per visualizzare i membri di questo spazio di lavoro.',
            moreFeatures: 'Più funzionalità',
            requested: 'Richiesto',
            distanceRates: 'Tariffe a distanza',
            defaultDescription: 'Un unico posto per tutte le tue ricevute e spese.',
            descriptionHint: 'Condividi informazioni su questo spazio di lavoro con tutti i membri.',
            welcomeNote: 'Per favore, usa Expensify per inviare le tue ricevute per il rimborso, grazie!',
            subscription: 'Abbonamento',
            markAsEntered: 'Segna come inserito manualmente',
            markAsExported: 'Segna come esportato',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Esporta in ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
            lineItemLevel: 'Livello voce di dettaglio',
            reportLevel: 'Livello del report',
            topLevel: 'Livello superiore',
            appliedOnExport: "Non importato in Expensify, applicato all'esportazione",
            shareNote: {
                header: 'Condividi il tuo spazio di lavoro con altri membri',
                content: {
                    firstPart:
                        'Condividi questo codice QR o copia il link qui sotto per facilitare ai membri la richiesta di accesso al tuo spazio di lavoro. Tutte le richieste di adesione allo spazio di lavoro appariranno nella',
                    secondPart: 'spazio per la tua recensione.',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Connettiti a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Crea nuova connessione',
            reuseExistingConnection: 'Riutilizza la connessione esistente',
            existingConnections: 'Connessioni esistenti',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Poiché ti sei connesso a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} in precedenza, puoi scegliere di riutilizzare una connessione esistente o crearne una nuova.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Ultima sincronizzazione ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Impossibile connettersi a ${connectionName} a causa di un errore di autenticazione`,
            learnMore: 'Scopri di più.',
            memberAlternateText: 'I membri possono inviare e approvare i rapporti.',
            adminAlternateText: 'Gli amministratori hanno pieno accesso di modifica a tutti i report e alle impostazioni dello spazio di lavoro.',
            auditorAlternateText: 'Gli auditor possono visualizzare e commentare i rapporti.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Revisore dei conti';
                    case CONST.POLICY.ROLE.USER:
                        return 'Membro';
                    default:
                        return 'Membro';
                }
            },
            frequency: {
                manual: 'Manuale',
                instant: 'Istantaneo',
                immediate: 'Quotidiano',
                trip: 'Per viaggio',
                weekly: 'Settimanale',
                semimonthly: 'Due volte al mese',
                monthly: 'Mensile',
            },
            planType: 'Tipo di piano',
            submitExpense: 'Invia le tue spese qui sotto:',
            defaultCategory: 'Categoria predefinita',
            viewTransactions: 'Visualizza transazioni',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Spese di ${displayName}`,
        },
        perDiem: {
            subtitle: 'Imposta le tariffe di diaria per controllare la spesa giornaliera dei dipendenti.',
            amount: 'Importo',
            deleteRates: () => ({
                one: 'Elimina tariffa',
                other: 'Elimina tariffe',
            }),
            deletePerDiemRate: 'Elimina la tariffa di diaria',
            findPerDiemRate: 'Trova la tariffa giornaliera',
            areYouSureDelete: () => ({
                one: 'Sei sicuro di voler eliminare questa tariffa?',
                other: 'Sei sicuro di voler eliminare queste tariffe?',
            }),
            emptyList: {
                title: 'Per diem',
                subtitle: 'Imposta le tariffe diarie per controllare la spesa giornaliera dei dipendenti. Importa le tariffe da un foglio di calcolo per iniziare.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Una tariffa con valore ${rate} esiste già`,
            },
            importPerDiemRates: 'Importa le tariffe diarie',
            editPerDiemRate: 'Modifica la tariffa di diaria',
            editPerDiemRates: 'Modifica le tariffe di diaria',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `Aggiornare questa destinazione cambierà tutte le sottotariffe di diaria per ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Aggiornare questa valuta la modificherà per tutte le sottotariffe di diaria di ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Imposta come esportare le spese anticipate su QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Contrassegna gli assegni come "stampa più tardi"',
            exportDescription: 'Configura come i dati di Expensify vengono esportati su QuickBooks Desktop.',
            date: 'Data di esportazione',
            exportInvoices: 'Esporta fatture su',
            exportExpensifyCard: 'Esporta le transazioni della Expensify Card come',
            account: 'Account',
            accountDescription: 'Scegli dove pubblicare le registrazioni contabili.',
            accountsPayable: 'Conti da pagare',
            accountsPayableDescription: 'Scegli dove creare le fatture dei fornitori.',
            bankAccount: 'Conto bancario',
            notConfigured: 'Non configurato',
            bankAccountDescription: 'Scegli da dove inviare gli assegni.',
            creditCardAccount: 'Account di carta di credito',
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report su QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel rapporto.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato su QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto è stato inviato per l'approvazione.",
                    },
                },
            },
            exportCheckDescription: 'Creeremo un assegno dettagliato per ogni report di Expensify e lo invieremo dal conto bancario sottostante.',
            exportJournalEntryDescription: "Creeremo una registrazione contabile dettagliata per ogni report di Expensify e la pubblicheremo sull'account qui sotto.",
            exportVendorBillDescription:
                "Creeremo una fattura dettagliata del fornitore per ogni report di Expensify e la aggiungeremo all'account sottostante. Se questo periodo è chiuso, la registreremo al 1° del prossimo periodo aperto.",
            deepDiveExpensifyCard: 'Le transazioni della Expensify Card verranno esportate automaticamente in un "Conto di responsabilità della Expensify Card" creato con',
            deepDiveExpensifyCardIntegration: 'la nostra integrazione.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop non supporta le tasse sulle esportazioni delle registrazioni contabili. Poiché hai le tasse abilitate nel tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledError: "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carta di credito',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fattura fornitore',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Voce di diario',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controlla',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Creeremo un assegno dettagliato per ogni report di Expensify e lo invieremo dal conto bancario sottostante.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Abbineremo automaticamente il nome del commerciante sulla transazione con carta di credito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore 'Credit Card Misc.' per l'associazione.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "Creeremo una fattura dettagliata del fornitore per ogni report di Expensify con la data dell'ultima spesa e la aggiungeremo al conto sottostante. Se questo periodo è chiuso, la registreremo al 1° del prossimo periodo aperto.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Scegli dove esportare le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Scegli un fornitore da applicare a tutte le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Scegli da dove inviare gli assegni.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    "Le fatture dei fornitori non sono disponibili quando le località sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    "Gli assegni non sono disponibili quando le località sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Aggiungi l'account in QuickBooks Desktop e sincronizza nuovamente la connessione",
            qbdSetup: 'Configurazione di QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Impossibile connettersi da questo dispositivo',
                body1: 'Dovrai configurare questa connessione dal computer che ospita il file della tua azienda QuickBooks Desktop.',
                body2: 'Una volta connesso, sarai in grado di sincronizzare ed esportare da qualsiasi luogo.',
            },
            setupPage: {
                title: 'Apri questo link per connetterti',
                body: 'Per completare la configurazione, apri il seguente link sul computer dove è in esecuzione QuickBooks Desktop.',
                setupErrorTitle: 'Qualcosa è andato storto',
                setupErrorBody1: 'La connessione a QuickBooks Desktop non funziona al momento. Per favore, riprova più tardi o',
                setupErrorBody2: 'se il problema persiste.',
                setupErrorBodyContactConcierge: 'contatta Concierge',
            },
            importDescription: 'Scegli quali configurazioni di codifica importare da QuickBooks Desktop a Expensify.',
            classes: 'Classi',
            items: 'Articoli',
            customers: 'Clienti/progetti',
            exportCompanyCardsDescription: 'Imposta come le spese con carta aziendale vengono esportate su QuickBooks Desktop.',
            defaultVendorDescription: "Imposta un fornitore predefinito che verrà applicato a tutte le transazioni con carta di credito al momento dell'esportazione.",
            accountsDescription: 'Il tuo piano dei conti di QuickBooks Desktop verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli di importare nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            classesDescription: 'Scegli come gestire le classi di QuickBooks Desktop in Expensify.',
            tagsDisplayedAsDescription: 'Livello voce di spesa',
            reportFieldsDisplayedAsDescription: 'Livello del report',
            customersDescription: 'Scegli come gestire i clienti/progetti di QuickBooks Desktop in Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con QuickBooks Desktop ogni giorno.',
                createEntities: 'Crea automaticamente entità',
                createEntitiesDescription: 'Expensify creerà automaticamente i fornitori in QuickBooks Desktop se non esistono già.',
            },
            itemsDescription: 'Scegli come gestire gli elementi di QuickBooks Desktop in Expensify.',
        },
        qbo: {
            connectedTo: 'Connesso a',
            importDescription: 'Scegli quali configurazioni di codifica importare da QuickBooks Online a Expensify.',
            classes: 'Classi',
            locations: 'Località',
            customers: 'Clienti/progetti',
            accountsDescription: 'Il tuo piano dei conti di QuickBooks Online verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli di importare nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            classesDescription: 'Scegli come gestire le classi di QuickBooks Online in Expensify.',
            customersDescription: 'Scegli come gestire i clienti/progetti di QuickBooks Online in Expensify.',
            locationsDescription: 'Scegli come gestire le sedi di QuickBooks Online in Expensify.',
            taxesDescription: 'Scegli come gestire le tasse di QuickBooks Online in Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online non supporta le Località a livello di riga per Assegni o Fatture Fornitori. Se desideri avere località a livello di riga, assicurati di utilizzare le Scritture Contabili e le spese con Carta di Credito/Debito.',
            taxesJournalEntrySwitchNote:
                "QuickBooks Online non supporta le tasse sulle registrazioni contabili. Si prega di cambiare l'opzione di esportazione in fattura fornitore o assegno.",
            exportDescription: 'Configura come i dati di Expensify vengono esportati su QuickBooks Online.',
            date: 'Data di esportazione',
            exportInvoices: 'Esporta fatture su',
            exportExpensifyCard: 'Esporta le transazioni della Expensify Card come',
            deepDiveExpensifyCard: 'Le transazioni della Expensify Card verranno esportate automaticamente in un "Conto di responsabilità della Expensify Card" creato con',
            deepDiveExpensifyCardIntegration: 'la nostra integrazione.',
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i rapporti su QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel rapporto.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato su QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto è stato inviato per l'approvazione.",
                    },
                },
            },
            receivable: 'Crediti verso clienti', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archivio contabilità clienti', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Usa questo account quando esporti le fatture su QuickBooks Online.',
            exportCompanyCardsDescription: 'Imposta come esportare gli acquisti con carta aziendale su QuickBooks Online.',
            vendor: 'Fornitore',
            defaultVendorDescription: "Imposta un fornitore predefinito che verrà applicato a tutte le transazioni con carta di credito al momento dell'esportazione.",
            exportOutOfPocketExpensesDescription: 'Imposta come esportare le spese anticipate su QuickBooks Online.',
            exportCheckDescription: 'Creeremo un assegno dettagliato per ogni report di Expensify e lo invieremo dal conto bancario sottostante.',
            exportJournalEntryDescription: "Creeremo una registrazione contabile dettagliata per ogni report di Expensify e la pubblicheremo sull'account qui sotto.",
            exportVendorBillDescription:
                "Creeremo una fattura dettagliata del fornitore per ogni report di Expensify e la aggiungeremo all'account sottostante. Se questo periodo è chiuso, la registreremo al 1° del prossimo periodo aperto.",
            account: 'Account',
            accountDescription: 'Scegli dove pubblicare le registrazioni contabili.',
            accountsPayable: 'Conti da pagare',
            accountsPayableDescription: 'Scegli dove creare le fatture dei fornitori.',
            bankAccount: 'Conto bancario',
            notConfigured: 'Non configurato',
            bankAccountDescription: 'Scegli da dove inviare gli assegni.',
            creditCardAccount: 'Account di carta di credito',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online non supporta le località nelle esportazioni delle fatture dei fornitori. Poiché hai abilitato le località nel tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online non supporta le tasse sulle esportazioni delle registrazioni contabili. Poiché hai abilitato le tasse nel tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledError: "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con QuickBooks Online ogni giorno.',
                inviteEmployees: 'Invita dipendenti',
                inviteEmployeesDescription: 'Importa i record dei dipendenti di QuickBooks Online e invita i dipendenti a questo spazio di lavoro.',
                createEntities: 'Crea automaticamente entità',
                createEntitiesDescription:
                    "Expensify creerà automaticamente fornitori in QuickBooks Online se non esistono già e creerà automaticamente clienti durante l'esportazione delle fatture.",
                reimbursedReportsDescription:
                    "Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura verrà creato nell'account QuickBooks Online qui sotto.",
                qboBillPaymentAccount: 'Account di pagamento fatture QuickBooks',
                qboInvoiceCollectionAccount: 'Account di riscossione fatture QuickBooks',
                accountSelectDescription: 'Scegli da dove pagare le fatture e creeremo il pagamento in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Scegli dove ricevere i pagamenti delle fatture e creeremo il pagamento in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Carta di debito',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carta di credito',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fattura fornitore',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Voce di diario',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controlla',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "Abbineremo automaticamente il nome del commerciante sulla transazione con carta di debito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore 'Carta di Debito Varie' per l'associazione.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Abbineremo automaticamente il nome del commerciante sulla transazione con carta di credito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore 'Credit Card Misc.' per l'associazione.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "Creeremo una fattura dettagliata del fornitore per ogni report di Expensify con la data dell'ultima spesa e la aggiungeremo al conto sottostante. Se questo periodo è chiuso, la registreremo al 1° del prossimo periodo aperto.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Scegli dove esportare le transazioni con carta di debito.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Scegli dove esportare le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Scegli un fornitore da applicare a tutte le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    "Le fatture dei fornitori non sono disponibili quando le località sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    "Gli assegni non sono disponibili quando le località sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: "Scegli un account valido per l'esportazione delle fatture fornitore",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: "Scegli un account valido per l'esportazione della registrazione contabile",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: "Scegli un account valido per l'esportazione dell'assegno",
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]:
                    "Per utilizzare l'esportazione delle fatture dei fornitori, configura un conto contabile fornitori in QuickBooks Online.",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: "Per utilizzare l'esportazione delle registrazioni contabili, configura un conto contabile in QuickBooks Online.",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: "Per utilizzare l'esportazione degli assegni, configura un conto bancario in QuickBooks Online.",
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Aggiungi l'account in QuickBooks Online e sincronizza nuovamente la connessione.",
            accountingMethods: {
                label: 'Quando Esportare',
                description: 'Scegli quando esportare le spese:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contanti',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Le spese anticipate verranno esportate quando approvate definitivamente.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Le spese anticipate verranno esportate quando pagate',
                },
            },
        },
        workspaceList: {
            joinNow: 'Iscriviti ora',
            askToJoin: 'Chiedi di unirti',
        },
        xero: {
            organization: 'Organizzazione Xero',
            organizationDescription: "Scegli l'organizzazione Xero da cui desideri importare i dati.",
            importDescription: 'Scegli quali configurazioni di codifica importare da Xero a Expensify.',
            accountsDescription: 'Il tuo piano dei conti Xero verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli di importare nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            trackingCategories: 'Categorie di tracciamento',
            trackingCategoriesDescription: 'Scegli come gestire le categorie di tracciamento Xero in Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mappa ${categoryName} di Xero a`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Scegli dove mappare ${categoryName} quando esporti su Xero.`,
            customers: 'Riaddebita clienti',
            customersDescription:
                'Scegli se rifatturare i clienti in Expensify. I contatti dei clienti Xero possono essere associati alle spese e verranno esportati in Xero come fattura di vendita.',
            taxesDescription: 'Scegli come gestire le tasse di Xero in Expensify.',
            notImported: 'Non importato',
            notConfigured: 'Non configurato',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contatto predefinito Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tag',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Campi del rapporto',
            },
            exportDescription: 'Configura come i dati di Expensify vengono esportati su Xero.',
            purchaseBill: 'Acquisto fattura',
            exportDeepDiveCompanyCard:
                'Le spese esportate verranno registrate come transazioni bancarie sul conto bancario Xero qui sotto, e le date delle transazioni corrisponderanno alle date sul tuo estratto conto bancario.',
            bankTransactions: 'Transazioni bancarie',
            xeroBankAccount: 'Conto bancario Xero',
            xeroBankAccountDescription: 'Scegli dove le spese verranno registrate come transazioni bancarie.',
            exportExpensesDescription: "I rapporti verranno esportati come fattura d'acquisto con la data e lo stato selezionati di seguito.",
            purchaseBillDate: 'Data di acquisto della fattura',
            exportInvoices: 'Esporta fatture come',
            salesInvoice: 'Fattura di vendita',
            exportInvoicesDescription: 'Le fatture di vendita mostrano sempre la data in cui la fattura è stata inviata.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con Xero ogni giorno.',
                purchaseBillStatusTitle: "Stato della fattura d'acquisto",
                reimbursedReportsDescription:
                    "Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura verrà creato nell'account Xero qui sotto.",
                xeroBillPaymentAccount: 'Account di pagamento fatture Xero',
                xeroInvoiceCollectionAccount: 'Account di incasso fatture Xero',
                xeroBillPaymentAccountDescription: 'Scegli da dove pagare le fatture e creeremo il pagamento in Xero.',
                invoiceAccountSelectorDescription: 'Scegli dove ricevere i pagamenti delle fatture e creeremo il pagamento in Xero.',
            },
            exportDate: {
                label: 'Data di acquisto della fattura',
                description: 'Usa questa data quando esporti i report su Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel rapporto.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato su Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto è stato inviato per l'approvazione.",
                    },
                },
            },
            invoiceStatus: {
                label: "Stato della fattura d'acquisto",
                description: 'Usa questo stato quando esporti le fatture di acquisto su Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Bozza',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'In attesa di approvazione',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'In attesa di pagamento',
                },
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Per favore, aggiungi l'account in Xero e sincronizza nuovamente la connessione.",
        },
        sageIntacct: {
            preferredExporter: 'Esportatore preferito',
            taxSolution: 'Soluzione fiscale',
            notConfigured: 'Non configurato',
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report su Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel rapporto.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato su Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto è stato inviato per l'approvazione.",
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Imposta come esportare le spese anticipate su Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Report di spesa',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Fatture fornitore',
                },
            },
            nonReimbursableExpenses: {
                description: 'Imposta come esportare gli acquisti con carta aziendale su Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Carte di credito',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Fatture fornitore',
                },
            },
            creditCardAccount: 'Account di carta di credito',
            defaultVendor: 'Fornitore predefinito',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Imposta un fornitore predefinito che verrà applicato alle spese rimborsabili ${isReimbursable ? '' : 'non-'} che non hanno un fornitore corrispondente in Sage Intacct.`,
            exportDescription: 'Configura come i dati di Expensify vengono esportati su Sage Intacct.',
            exportPreferredExporterNote:
                "L'esportatore preferito può essere qualsiasi amministratore dello spazio di lavoro, ma deve anche essere un amministratore di dominio se imposti conti di esportazione diversi per singole carte aziendali nelle impostazioni del dominio.",
            exportPreferredExporterSubNote: "Una volta impostato, l'esportatore preferito vedrà i report per l'esportazione nel proprio account.",
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: `Si prega di aggiungere l'account in Sage Intacct e sincronizzare nuovamente la connessione.`,
            autoSync: 'Sincronizzazione automatica',
            autoSyncDescription: 'Expensify si sincronizzerà automaticamente con Sage Intacct ogni giorno.',
            inviteEmployees: 'Invita dipendenti',
            inviteEmployeesDescription:
                "Importa i record dei dipendenti di Sage Intacct e invita i dipendenti a questo spazio di lavoro. Il tuo flusso di approvazione predefinito sarà l'approvazione del manager e può essere ulteriormente configurato nella pagina Membri.",
            syncReimbursedReports: 'Sincronizza i rapporti rimborsati',
            syncReimbursedReportsDescription:
                "Ogni volta che un report viene pagato utilizzando Expensify ACH, il pagamento della fattura corrispondente verrà creato nell'account Sage Intacct qui sotto.",
            paymentAccount: 'Account di pagamento Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Sussidiaria',
            subsidiarySelectDescription: 'Scegli la filiale in NetSuite da cui desideri importare i dati.',
            exportDescription: 'Configura come i dati di Expensify vengono esportati su NetSuite.',
            exportInvoices: 'Esporta fatture su',
            journalEntriesTaxPostingAccount: 'Registrazioni contabili conto di registrazione delle imposte',
            journalEntriesProvTaxPostingAccount: 'Voci di diario conto di registrazione imposta provinciale',
            foreignCurrencyAmount: 'Esporta importo in valuta estera',
            exportToNextOpenPeriod: 'Esporta al prossimo periodo aperto',
            nonReimbursableJournalPostingAccount: 'Account di registrazione giornaliera non rimborsabile',
            reimbursableJournalPostingAccount: 'Account di registrazione giornaliera rimborsabile',
            journalPostingPreference: {
                label: 'Preferenza di registrazione delle scritture contabili',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Singola voce dettagliata per ciascun report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Voce singola per ogni spesa',
                },
            },
            invoiceItem: {
                label: 'Voce di fattura',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Creane uno per me',
                        description: 'Creeremo una "voce di fattura Expensify" per te al momento dell\'esportazione (se non esiste già).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Seleziona esistente',
                        description: "Assoceremo le fatture di Expensify all'elemento selezionato qui sotto.",
                    },
                },
            },
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i rapporti su NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel rapporto.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato su NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto è stato inviato per l'approvazione.",
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Report di spesa',
                        reimbursableDescription: 'Le spese anticipate verranno esportate come report di spesa su NetSuite.',
                        nonReimbursableDescription: 'Le spese con carta aziendale verranno esportate come report di spesa su NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Fatture fornitore',
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
                        label: 'Voci di diario',
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
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con NetSuite ogni giorno.',
                reimbursedReportsDescription:
                    "Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura verrà creato nell'account NetSuite qui sotto.",
                reimbursementsAccount: 'Account di rimborso',
                reimbursementsAccountDescription: 'Scegli il conto bancario che utilizzerai per i rimborsi e creeremo il pagamento associato in NetSuite.',
                collectionsAccount: 'Account di riscossione',
                collectionsAccountDescription: "Una volta che una fattura è contrassegnata come pagata in Expensify ed esportata su NetSuite, apparirà contro l'account qui sotto.",
                approvalAccount: 'Account di approvazione A/P',
                approvalAccountDescription:
                    "Scegli l'account contro cui verranno approvate le transazioni in NetSuite. Se stai sincronizzando i report rimborsati, questo è anche l'account contro cui verranno creati i pagamenti delle fatture.",
                defaultApprovalAccount: 'Predefinito di NetSuite',
                inviteEmployees: 'Invita i dipendenti e imposta le approvazioni',
                inviteEmployeesDescription:
                    "Importa i record dei dipendenti di NetSuite e invita i dipendenti a questo spazio di lavoro. Il tuo flusso di approvazione predefinito sarà l'approvazione del manager e può essere ulteriormente configurato nella pagina *Membri*.",
                autoCreateEntities: 'Crea automaticamente dipendenti/fornitori',
                enableCategories: 'Abilita le categorie appena importate',
                customFormID: 'ID modulo personalizzato',
                customFormIDDescription:
                    'Per impostazione predefinita, Expensify creerà voci utilizzando il modulo di transazione preferito impostato in NetSuite. In alternativa, puoi designare un modulo di transazione specifico da utilizzare.',
                customFormIDReimbursable: 'Spesa personale',
                customFormIDNonReimbursable: 'Spesa con carta aziendale',
                exportReportsTo: {
                    label: 'Livello di approvazione del rapporto spese',
                    description:
                        'Una volta che un rapporto spese è approvato in Expensify ed esportato su NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Preferenza predefinita di NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Solo supervisore approvato',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Solo contabilità approvata',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisore e contabilità approvati',
                    },
                },
                accountingMethods: {
                    label: 'Quando Esportare',
                    description: 'Scegli quando esportare le spese:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contanti',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Le spese anticipate verranno esportate quando approvate definitivamente.',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Le spese anticipate verranno esportate quando pagate',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Livello di approvazione della fattura del fornitore',
                    description:
                        'Una volta che una fattura del fornitore è approvata in Expensify ed esportata in NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Preferenza predefinita di NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'In attesa di approvazione',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Approvato per la pubblicazione',
                    },
                },
                exportJournalsTo: {
                    label: 'Livello di approvazione della registrazione contabile',
                    description:
                        'Una volta che una registrazione contabile è approvata in Expensify ed esportata su NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Preferenza predefinita di NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'In attesa di approvazione',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Approvato per la pubblicazione',
                    },
                },
                error: {
                    customFormID: 'Inserisci un ID modulo personalizzato numerico valido',
                },
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Si prega di aggiungere l'account in NetSuite e sincronizzare nuovamente la connessione.",
            noVendorsFound: 'Nessun fornitore trovato',
            noVendorsFoundDescription: 'Si prega di aggiungere i fornitori in NetSuite e sincronizzare nuovamente la connessione.',
            noItemsFound: 'Nessun elemento della fattura trovato',
            noItemsFoundDescription: 'Per favore, aggiungi gli articoli della fattura in NetSuite e sincronizza nuovamente la connessione.',
            noSubsidiariesFound: 'Nessuna filiale trovata',
            noSubsidiariesFoundDescription: 'Per favore, aggiungi una filiale in NetSuite e sincronizza nuovamente la connessione.',
            tokenInput: {
                title: 'NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: 'Installa il pacchetto Expensify',
                        description: 'In NetSuite, vai su *Customization > SuiteBundler > Search & Install Bundles* > cerca "Expensify" > installa il bundle.',
                    },
                    enableTokenAuthentication: {
                        title: "Abilita l'autenticazione basata su token",
                        description: 'In NetSuite, vai su *Setup > Company > Enable Features > SuiteCloud* > abilita *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Abilita i servizi web SOAP',
                        description: 'In NetSuite, vai su *Setup > Company > Enable Features > SuiteCloud* > abilita *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Crea un token di accesso',
                        description:
                            'In NetSuite, vai su *Setup > Users/Roles > Access Tokens* > crea un token di accesso per l\'app "Expensify" e per il ruolo "Expensify Integration" o "Administrator".\n\n*Importante:* Assicurati di salvare il *Token ID* e il *Token Secret* da questo passaggio. Ne avrai bisogno per il passaggio successivo.',
                    },
                    enterCredentials: {
                        title: 'Inserisci le tue credenziali NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'In NetSuite, vai su *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Categorie di spesa',
                expenseCategoriesDescription: 'Le tue categorie di spesa NetSuite verranno importate in Expensify come categorie.',
                crossSubsidiaryCustomers: 'Clienti/progetti tra sussidiarie',
                importFields: {
                    departments: {
                        title: 'Dipartimenti',
                        subtitle: 'Scegli come gestire i *dipartimenti* di NetSuite in Expensify.',
                    },
                    classes: {
                        title: 'Classi',
                        subtitle: 'Scegli come gestire le *classi* in Expensify.',
                    },
                    locations: {
                        title: 'Località',
                        subtitle: 'Scegli come gestire le *posizioni* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clienti/progetti',
                    subtitle: 'Scegli come gestire i *clienti* e i *progetti* di NetSuite in Expensify.',
                    importCustomers: 'Importa clienti',
                    importJobs: 'Importa progetti',
                    customers: 'clienti',
                    jobs: 'progetti',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('e')}, ${importType}`,
                },
                importTaxDescription: 'Importa gruppi fiscali da NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: "Scegli un'opzione qui sotto:",
                    label: ({importedTypes}: ImportedTypesParams) => `Imported as ${importedTypes.join('e')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Per favore, inserisci il ${fieldName}`,
                    customSegments: {
                        title: 'Segmenti/record personalizzati',
                        addText: 'Aggiungi segmento/record personalizzato',
                        recordTitle: 'Segmento/record personalizzato',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Visualizza istruzioni dettagliate',
                        helpText: 'sulla configurazione di segmenti/record personalizzati.',
                        emptyTitle: 'Aggiungi un segmento personalizzato o un record personalizzato',
                        fields: {
                            segmentName: 'Nome',
                            internalID: 'ID interno',
                            scriptID: 'ID script',
                            customRecordScriptID: 'ID colonna transazione',
                            mapping: 'Visualizzato come',
                        },
                        removeTitle: 'Rimuovi segmento/record personalizzato',
                        removePrompt: 'Sei sicuro di voler rimuovere questo segmento/record personalizzato?',
                        addForm: {
                            customSegmentName: 'nome segmento personalizzato',
                            customRecordName: 'nome del record personalizzato',
                            segmentTitle: 'Segmento personalizzato',
                            customSegmentAddTitle: 'Aggiungi segmento personalizzato',
                            customRecordAddTitle: 'Aggiungi record personalizzato',
                            recordTitle: 'Record personalizzato',
                            segmentRecordType: 'Vuoi aggiungere un segmento personalizzato o un record personalizzato?',
                            customSegmentNameTitle: 'Qual è il nome del segmento personalizzato?',
                            customRecordNameTitle: 'Qual è il nome del record personalizzato?',
                            customSegmentNameFooter: `Puoi trovare i nomi dei segmenti personalizzati in NetSuite nella pagina *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Puoi trovare i nomi dei record personalizzati in NetSuite inserendo "Transaction Column Field" nella ricerca globale.\n\n_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "Qual è l'ID interno?",
                            customSegmentInternalIDFooter: `Prima di tutto, assicurati di aver abilitato gli ID interni in NetSuite sotto *Home > Set Preferences > Show Internal ID.*\n\nPuoi trovare gli ID interni dei segmenti personalizzati in NetSuite sotto:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clicca su un segmento personalizzato.\n3. Clicca sul collegamento ipertestuale accanto a *Custom Record Type*.\n4. Trova l'ID interno nella tabella in fondo.\n\n_Per istruzioni più dettagliate, [visita il nostro sito di aiuto](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Puoi trovare gli ID interni dei record personalizzati in NetSuite seguendo questi passaggi:\n\n1. Inserisci "Transaction Line Fields" nella ricerca globale.\n2. Clicca su un record personalizzato.\n3. Trova l'ID interno sul lato sinistro.\n\n_Per istruzioni più dettagliate, [visita il nostro sito di aiuto](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "Qual è l'ID dello script?",
                            customSegmentScriptIDFooter: `Puoi trovare gli ID script dei segmenti personalizzati in NetSuite sotto:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clicca su un segmento personalizzato.\n3. Clicca sulla scheda *Application and Sourcing* vicino al fondo, poi:\n    a. Se vuoi visualizzare il segmento personalizzato come *tag* (a livello di voce) in Expensify, clicca sulla sotto-scheda *Transaction Columns* e usa il *Field ID*.\n    b. Se vuoi visualizzare il segmento personalizzato come *campo di report* (a livello di report) in Expensify, clicca sulla sotto-scheda *Transactions* e usa il *Field ID*.\n\n_Per istruzioni più dettagliate, [visita il nostro sito di aiuto](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "Qual è l'ID della colonna della transazione?",
                            customRecordScriptIDFooter: `Puoi trovare gli ID script dei record personalizzati in NetSuite sotto:\n\n1. Inserisci "Transaction Line Fields" nella ricerca globale.\n2. Clicca su un record personalizzato.\n3. Trova l'ID script sul lato sinistro.\n\n_Per istruzioni più dettagliate, [visita il nostro sito di aiuto](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Come dovrebbe essere visualizzato questo segmento personalizzato in Expensify?',
                            customRecordMappingTitle: 'Come dovrebbe essere visualizzato questo record personalizzato in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Un segmento/record personalizzato con questo ${fieldName?.toLowerCase()} esiste già`,
                        },
                    },
                    customLists: {
                        title: 'Elenchi personalizzati',
                        addText: 'Aggiungi elenco personalizzato',
                        recordTitle: 'Elenco personalizzato',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Visualizza istruzioni dettagliate',
                        helpText: 'su come configurare elenchi personalizzati.',
                        emptyTitle: 'Aggiungi un elenco personalizzato',
                        fields: {
                            listName: 'Nome',
                            internalID: 'ID interno',
                            transactionFieldID: 'ID campo transazione',
                            mapping: 'Visualizzato come',
                        },
                        removeTitle: 'Rimuovi elenco personalizzato',
                        removePrompt: 'Sei sicuro di voler rimuovere questa lista personalizzata?',
                        addForm: {
                            listNameTitle: 'Scegli un elenco personalizzato',
                            transactionFieldIDTitle: "Qual è l'ID del campo transazione?",
                            transactionFieldIDFooter: `Puoi trovare gli ID dei campi di transazione in NetSuite seguendo questi passaggi:\n\n1. Inserisci "Transaction Line Fields" nella ricerca globale.\n2. Clicca su una lista personalizzata.\n3. Trova l'ID del campo di transazione sul lato sinistro.\n\n_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Come dovrebbe essere visualizzato questo elenco personalizzato in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Esiste già un elenco personalizzato con questo ID campo transazione.`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Impostazione predefinita dipendente NetSuite',
                        description: "Non importato in Expensify, applicato all'esportazione",
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Se utilizzi ${importField} in NetSuite, applicheremo il valore predefinito impostato nel record del dipendente al momento dell'esportazione su Report Spese o Registrazione Contabile.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tag',
                        description: 'Livello voce di dettaglio',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} sarà selezionabile per ogni singola spesa nel report di un dipendente.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Campi del rapporto',
                        description: 'Livello del report',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} selezione verrà applicata a tutte le spese nel rapporto di un dipendente.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configurazione di Sage Intacct',
            prerequisitesTitle: 'Prima di connetterti...',
            downloadExpensifyPackage: 'Scarica il pacchetto Expensify per Sage Intacct',
            followSteps: 'Segui i passaggi nelle nostre istruzioni How-to: Connect to Sage Intacct.',
            enterCredentials: 'Inserisci le tue credenziali Sage Intacct',
            entity: 'Entità',
            employeeDefault: 'Impostazione predefinita dipendente Sage Intacct',
            employeeDefaultDescription: 'Il dipartimento predefinito del dipendente verrà applicato alle sue spese in Sage Intacct, se esiste.',
            displayedAsTagDescription: 'Il dipartimento sarà selezionabile per ogni singola spesa nel rapporto di un dipendente.',
            displayedAsReportFieldDescription: 'La selezione del dipartimento verrà applicata a tutte le spese nel rapporto di un dipendente.',
            toggleImportTitleFirstPart: 'Scegli come gestire Sage Intacct',
            toggleImportTitleSecondPart: 'in Expensify.',
            expenseTypes: 'Tipi di spesa',
            expenseTypesDescription: 'I tuoi tipi di spesa Sage Intacct verranno importati in Expensify come categorie.',
            accountTypesDescription: 'Il tuo piano dei conti di Sage Intacct verrà importato in Expensify come categorie.',
            importTaxDescription: "Importa l'aliquota fiscale sugli acquisti da Sage Intacct.",
            userDefinedDimensions: "Dimensioni definite dall'utente",
            addUserDefinedDimension: "Aggiungi dimensione definita dall'utente",
            integrationName: "Nome dell'integrazione",
            dimensionExists: 'Una dimensione con questo nome esiste già.',
            removeDimension: "Rimuovi dimensione definita dall'utente",
            removeDimensionPrompt: "Sei sicuro di voler rimuovere questa dimensione definita dall'utente?",
            userDefinedDimension: "Dimensione definita dall'utente",
            addAUserDefinedDimension: "Aggiungi una dimensione definita dall'utente",
            detailedInstructionsLink: 'Visualizza istruzioni dettagliate',
            detailedInstructionsRestOfSentence: "sull'aggiunta di dimensioni definite dall'utente.",
            userDimensionsAdded: () => ({
                one: '1 UDD aggiunto',
                other: (count: number) => `${count} UDD aggiunti`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'dipartimenti';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classi';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'località';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clienti';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'progetti (lavori)';
                    default:
                        return 'mappature';
                }
            },
        },
        type: {
            free: 'Gratuito',
            control: 'Controllo',
            collect: 'Raccogliere',
        },
        companyCards: {
            addCards: 'Aggiungi carte',
            selectCards: 'Seleziona carte',
            addNewCard: {
                other: 'Altro',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Carte Stripe',
                },
                yourCardProvider: `Chi è il tuo fornitore di carte?`,
                whoIsYourBankAccount: 'Qual è la tua banca?',
                whereIsYourBankLocated: 'Dove si trova la tua banca?',
                howDoYouWantToConnect: 'Come vuoi connetterti alla tua banca?',
                learnMoreAboutOptions: {
                    text: 'Scopri di più su questi',
                    linkText: 'opzioni.',
                },
                commercialFeedDetails: 'Richiede la configurazione con la tua banca. Questo è tipicamente utilizzato da aziende più grandi ed è spesso la migliore opzione se si è idonei.',
                commercialFeedPlaidDetails: `Richiede la configurazione con la tua banca, ma ti guideremo noi. Questo è generalmente limitato alle aziende più grandi.`,
                directFeedDetails: "L'approccio più semplice. Connettiti subito utilizzando le tue credenziali master. Questo metodo è il più comune.",
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Abilita il tuo feed ${provider}`,
                    heading:
                        "Abbiamo un'integrazione diretta con l'emittente della tua carta e possiamo importare i tuoi dati di transazione in Expensify in modo rapido e preciso.\n\nPer iniziare, semplicemente:",
                    visa: "Abbiamo integrazioni globali con Visa, anche se l'idoneità varia a seconda della banca e del programma della carta.\n\nPer iniziare, semplicemente:",
                    mastercard: "Abbiamo integrazioni globali con Mastercard, sebbene l'idoneità vari a seconda della banca e del programma della carta.\n\nPer iniziare, semplicemente:",
                    vcf: `1. Visita [questo articolo di aiuto](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) per istruzioni dettagliate su come configurare le tue Visa Commercial Cards.\n\n2. [Contatta la tua banca](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) per verificare che supportino un feed commerciale per il tuo programma e chiedi loro di abilitarlo.\n\n3. *Una volta che il feed è abilitato e hai i suoi dettagli, continua alla schermata successiva.*`,
                    gl1025: `1. Visita [questo articolo di aiuto](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) per scoprire se American Express può abilitare un feed commerciale per il tuo programma.\n\n2. Una volta abilitato il feed, Amex ti invierà una lettera di produzione.\n\n3. *Una volta che hai le informazioni sul feed, continua alla schermata successiva.*`,
                    cdf: `1. Visita [questo articolo di aiuto](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) per istruzioni dettagliate su come configurare le tue Mastercard Commercial Cards.\n\n2. [Contatta la tua banca](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) per verificare che supportino un feed commerciale per il tuo programma e chiedi loro di abilitarlo.\n\n3. *Una volta che il feed è abilitato e hai i suoi dettagli, continua alla schermata successiva.*`,
                    stripe: `1. Visita il Dashboard di Stripe e vai su [Impostazioni](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Sotto Integrazioni di Prodotto, clicca su Abilita accanto a Expensify.\n\n3. Una volta abilitato il feed, clicca su Invia qui sotto e ci occuperemo di aggiungerlo.`,
                },
                whatBankIssuesCard: 'Quale banca emette queste carte?',
                enterNameOfBank: 'Inserisci il nome della banca',
                feedDetails: {
                    vcf: {
                        title: 'Quali sono i dettagli del feed Visa?',
                        processorLabel: 'ID processore',
                        bankLabel: "ID dell'istituzione finanziaria (banca)",
                        companyLabel: 'ID azienda',
                        helpLabel: 'Dove trovo questi ID?',
                    },
                    gl1025: {
                        title: `Qual è il nome del file di consegna Amex?`,
                        fileNameLabel: 'Nome del file di consegna',
                        helpLabel: 'Dove trovo il nome del file di consegna?',
                    },
                    cdf: {
                        title: `Qual è l'ID di distribuzione Mastercard?`,
                        distributionLabel: 'ID di distribuzione',
                        helpLabel: "Dove trovo l'ID di distribuzione?",
                    },
                },
                amexCorporate: 'Seleziona questo se sul fronte delle tue carte è scritto "Corporate"',
                amexBusiness: 'Seleziona questo se sul fronte delle tue carte c\'è scritto "Business"',
                amexPersonal: 'Seleziona questo se le tue carte sono personali',
                error: {
                    pleaseSelectProvider: 'Si prega di selezionare un fornitore di carte prima di continuare',
                    pleaseSelectBankAccount: 'Si prega di selezionare un conto bancario prima di continuare',
                    pleaseSelectBank: 'Si prega di selezionare una banca prima di continuare',
                    pleaseSelectCountry: 'Si prega di selezionare un paese prima di continuare',
                    pleaseSelectFeedType: 'Si prega di selezionare un tipo di feed prima di continuare',
                },
            },
            assignCard: 'Assegna carta',
            findCard: 'Trova carta',
            cardNumber: 'Numero di carta',
            commercialFeed: 'Feed commerciale',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `Carte ${feedName}`,
            directFeed: 'Feed diretto',
            whoNeedsCardAssigned: 'Chi ha bisogno di una carta assegnata?',
            chooseCard: 'Scegli una carta',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Scegli una carta per ${assignee} dal feed delle carte ${feed}.`,
            noActiveCards: 'Nessuna carta attiva in questo feed',
            somethingMightBeBroken: 'Oppure qualcosa potrebbe essere rotto. In ogni caso, se hai domande, basta',
            contactConcierge: 'contatta Concierge',
            chooseTransactionStartDate: 'Scegli una data di inizio transazione',
            startDateDescription:
                'Importeremo tutte le transazioni da questa data in poi. Se non viene specificata alcuna data, risaliremo indietro fino a quanto consentito dalla tua banca.',
            fromTheBeginning: "Dall'inizio",
            customStartDate: 'Data di inizio personalizzata',
            letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
            confirmationDescription: 'Inizieremo immediatamente a importare le transazioni.',
            cardholder: 'Titolare della carta',
            card: 'Carta',
            cardName: 'Nome della carta',
            brokenConnectionErrorFirstPart: `La connessione del feed della carta è interrotta. Per favore`,
            brokenConnectionErrorLink: 'accedi al tuo conto bancario',
            brokenConnectionErrorSecondPart: 'così possiamo ristabilire la connessione.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `assegnato ${assignee} un ${link}! Le transazioni importate appariranno in questa chat.`,
            companyCard: 'carta aziendale',
            chooseCardFeed: 'Scegli il feed della carta',
            ukRegulation:
                "Expensify, Inc. è un agente di Plaid Financial Ltd., un'istituzione di pagamento autorizzata regolata dalla Financial Conduct Authority ai sensi delle Payment Services Regulations 2017 (Numero di riferimento aziendale: 804718). Plaid ti fornisce servizi di informazione sui conti regolamentati tramite Expensify Limited come suo agente.",
        },
        expensifyCard: {
            issueAndManageCards: 'Emetti e gestisci le tue carte Expensify',
            getStartedIssuing: 'Inizia emettendo la tua prima carta virtuale o fisica.',
            verificationInProgress: 'Verifica in corso...',
            verifyingTheDetails: 'Stiamo verificando alcuni dettagli. Concierge ti farà sapere quando le Expensify Card saranno pronte per essere emesse.',
            disclaimer:
                'La Expensify Visa® Commercial Card è emessa da The Bancorp Bank, N.A., Membro FDIC, in base a una licenza di Visa U.S.A. Inc. e potrebbe non essere accettata da tutti i commercianti che accettano carte Visa. Apple® e il logo Apple® sono marchi di Apple Inc., registrati negli Stati Uniti e in altri paesi. App Store è un marchio di servizio di Apple Inc. Google Play e il logo di Google Play sono marchi di Google LLC.',
            issueCard: 'Emetti carta',
            findCard: 'Trova carta',
            newCard: 'Nuova carta',
            name: 'Nome',
            lastFour: 'Ultimi 4',
            limit: 'Limite',
            currentBalance: 'Saldo attuale',
            currentBalanceDescription: "Il saldo attuale è la somma di tutte le transazioni con la carta Expensify registrate che sono avvenute dalla data dell'ultimo saldo.",
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Il saldo sarà regolato il ${settlementDate}`,
            settleBalance: 'Regola il saldo',
            cardLimit: 'Limite della carta',
            remainingLimit: 'Limite rimanente',
            requestLimitIncrease: 'Richiesta aumento limite',
            remainingLimitDescription:
                'Consideriamo diversi fattori quando calcoliamo il tuo limite rimanente: la tua anzianità come cliente, le informazioni aziendali fornite durante la registrazione e la liquidità disponibile nel conto bancario della tua azienda. Il tuo limite rimanente può variare su base giornaliera.',
            earnedCashback: 'Rimborso',
            earnedCashbackDescription: 'Il saldo del cashback si basa sulla spesa mensile regolata con la Expensify Card nel tuo spazio di lavoro.',
            issueNewCard: 'Emetti nuova carta',
            finishSetup: 'Completa la configurazione',
            chooseBankAccount: 'Scegli conto bancario',
            chooseExistingBank: 'Scegli un conto bancario aziendale esistente per pagare il saldo della tua Expensify Card, oppure aggiungi un nuovo conto bancario',
            accountEndingIn: 'Account con terminazione in',
            addNewBankAccount: 'Aggiungi un nuovo conto bancario',
            settlementAccount: 'Conto di regolamento',
            settlementAccountDescription: 'Scegli un account per pagare il saldo della tua Expensify Card.',
            settlementAccountInfoPt1: 'Assicurati che questo account corrisponda al tuo',
            settlementAccountInfoPt2: 'quindi il Riconciliazione Continua funziona correttamente.',
            reconciliationAccount: 'Conto di riconciliazione',
            settlementFrequency: 'Frequenza di liquidazione',
            settlementFrequencyDescription: 'Scegli la frequenza con cui pagherai il saldo della tua Expensify Card.',
            settlementFrequencyInfo: 'Se desideri passare al regolamento mensile, dovrai collegare il tuo conto bancario tramite Plaid e avere uno storico del saldo positivo di 90 giorni.',
            frequency: {
                daily: 'Quotidiano',
                monthly: 'Mensile',
            },
            cardDetails: 'Dettagli della carta',
            virtual: 'Virtuale',
            physical: 'Fisico',
            deactivate: 'Disattiva carta',
            changeCardLimit: 'Cambia il limite della carta',
            changeLimit: 'Cambia limite',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Se cambi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate finché non approvi ulteriori spese sulla carta.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Se cambi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate fino al mese prossimo.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Se cambi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate.`,
            changeCardLimitType: 'Cambia il tipo di limite della carta',
            changeLimitType: 'Cambia tipo di limite',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Se cambi il tipo di limite di questa carta a Limite Intelligente, le nuove transazioni verranno rifiutate perché il limite non approvato di ${limit} è già stato raggiunto.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Se cambi il tipo di limite di questa carta a Mensile, le nuove transazioni verranno rifiutate perché il limite mensile di ${limit} è già stato raggiunto.`,
            addShippingDetails: 'Aggiungi dettagli di spedizione',
            issuedCard: ({assignee}: AssigneeParams) => `ha emesso a ${assignee} una Expensify Card! La carta arriverà in 2-3 giorni lavorativi.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `ha emesso una Expensify Card per ${assignee}! La carta verrà spedita una volta aggiunti i dettagli di spedizione.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `ha emesso ${assignee} una ${link} virtuale! La carta può essere utilizzata immediatamente.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} ha aggiunto i dettagli di spedizione. La carta Expensify arriverà in 2-3 giorni lavorativi.`,
            verifyingHeader: 'Verifica in corso',
            bankAccountVerifiedHeader: 'Conto bancario verificato',
            verifyingBankAccount: 'Verifica del conto bancario in corso...',
            verifyingBankAccountDescription: 'Attendere mentre confermiamo che questo account possa essere utilizzato per emettere le carte Expensify.',
            bankAccountVerified: 'Conto bancario verificato!',
            bankAccountVerifiedDescription: 'Ora puoi emettere le Expensify Card ai membri del tuo spazio di lavoro.',
            oneMoreStep: 'Un altro passo...',
            oneMoreStepDescription: 'Sembra che dobbiamo verificare manualmente il tuo conto bancario. Per favore, vai su Concierge dove le tue istruzioni ti stanno aspettando.',
            gotIt: 'Capito',
            goToConcierge: 'Vai a Concierge',
        },
        categories: {
            deleteCategories: 'Elimina categorie',
            deleteCategoriesPrompt: 'Sei sicuro di voler eliminare queste categorie?',
            deleteCategory: 'Elimina categoria',
            deleteCategoryPrompt: 'Sei sicuro di voler eliminare questa categoria?',
            disableCategories: 'Disabilita categorie',
            disableCategory: 'Disabilita categoria',
            enableCategories: 'Abilita categorie',
            enableCategory: 'Abilita categoria',
            defaultSpendCategories: 'Categorie di spesa predefinite',
            spendCategoriesDescription: 'Personalizza come viene categorizzata la spesa del commerciante per le transazioni con carta di credito e le ricevute scansionate.',
            deleteFailureMessage: "Si è verificato un errore durante l'eliminazione della categoria, per favore riprova.",
            categoryName: 'Nome della categoria',
            requiresCategory: 'I membri devono categorizzare tutte le spese',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Tutte le spese devono essere categorizzate per poter essere esportate su ${connectionName}.`,
            subtitle: 'Ottieni una panoramica migliore di dove vengono spesi i soldi. Usa le nostre categorie predefinite o aggiungi le tue.',
            emptyCategories: {
                title: 'Non hai creato nessuna categoria',
                subtitle: 'Aggiungi una categoria per organizzare le tue spese.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Le tue categorie sono attualmente in fase di importazione da una connessione contabile. Vai su',
                subtitle2: 'contabilità',
                subtitle3: 'per apportare qualsiasi modifica.',
            },
            updateFailureMessage: "Si è verificato un errore durante l'aggiornamento della categoria, riprova.",
            createFailureMessage: 'Si è verificato un errore durante la creazione della categoria, per favore riprova.',
            addCategory: 'Aggiungi categoria',
            editCategory: 'Modifica categoria',
            editCategories: 'Modifica categorie',
            findCategory: 'Trova categoria',
            categoryRequiredError: 'Il nome della categoria è obbligatorio',
            existingCategoryError: 'Una categoria con questo nome esiste già',
            invalidCategoryName: 'Nome categoria non valido',
            importedFromAccountingSoftware: 'Le categorie sottostanti sono importate dal tuo',
            payrollCode: 'Codice busta paga',
            updatePayrollCodeFailureMessage: "Si è verificato un errore durante l'aggiornamento del codice delle buste paga, riprova.",
            glCode: 'Codice GL',
            updateGLCodeFailureMessage: "Si è verificato un errore durante l'aggiornamento del codice GL, riprova.",
            importCategories: 'Importa categorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Non è possibile eliminare o disabilitare tutte le categorie',
                description: `Almeno una categoria deve rimanere abilitata perché il tuo spazio di lavoro richiede categorie.`,
            },
        },
        moreFeatures: {
            subtitle: 'Usa i toggle qui sotto per abilitare più funzionalità man mano che cresci. Ogni funzionalità apparirà nel menu di navigazione per ulteriori personalizzazioni.',
            spendSection: {
                title: 'Spendere',
                subtitle: 'Abilita la funzionalità che ti aiuta a far crescere il tuo team.',
            },
            manageSection: {
                title: 'Gestisci',
                subtitle: 'Aggiungi controlli che aiutano a mantenere le spese entro il budget.',
            },
            earnSection: {
                title: 'Guadagna',
                subtitle: 'Ottimizza i tuoi ricavi e ricevi pagamenti più velocemente.',
            },
            organizeSection: {
                title: 'Organizza',
                subtitle: 'Raggruppa e analizza le spese, registra ogni tassa pagata.',
            },
            integrateSection: {
                title: 'Integrare',
                subtitle: 'Connetti Expensify ai prodotti finanziari più popolari.',
            },
            distanceRates: {
                title: 'Tariffe a distanza',
                subtitle: 'Aggiungi, aggiorna e applica le tariffe.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'Imposta le tariffe diarie per controllare le spese giornaliere dei dipendenti.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Ottieni informazioni e controllo sulle spese.',
                disableCardTitle: 'Disabilita Expensify Card',
                disableCardPrompt: 'Non puoi disabilitare la Expensify Card perché è già in uso. Contatta Concierge per i prossimi passi.',
                disableCardButton: 'Chatta con Concierge',
                feed: {
                    title: 'Ottieni la Expensify Card',
                    subTitle: 'Ottimizza le spese aziendali e risparmia fino al 50% sulla tua fattura Expensify, inoltre:',
                    features: {
                        cashBack: 'Cashback su ogni acquisto negli Stati Uniti',
                        unlimited: 'Carte virtuali illimitate',
                        spend: 'Controlli di spesa e limiti personalizzati',
                    },
                    ctaTitle: 'Emetti nuova carta',
                },
            },
            companyCards: {
                title: 'Carte aziendali',
                subtitle: 'Importa le spese dalle carte aziendali esistenti.',
                feed: {
                    title: 'Importa carte aziendali',
                    features: {
                        support: 'Supporto per tutti i principali fornitori di carte',
                        assignCards: "Assegna le carte all'intero team",
                        automaticImport: 'Importazione automatica delle transazioni',
                    },
                },
                disableCardTitle: 'Disabilita carte aziendali',
                disableCardPrompt: 'Non puoi disabilitare le carte aziendali perché questa funzione è in uso. Contatta il Concierge per i prossimi passi.',
                disableCardButton: 'Chatta con Concierge',
                cardDetails: 'Dettagli della carta',
                cardNumber: 'Numero di carta',
                cardholder: 'Titolare della carta',
                cardName: 'Nome della carta',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `${integration} ${type.toLowerCase()} esportazione` : `Esportazione ${integration}`,
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) => `Scegli l'account ${integration} in cui esportare le transazioni.`,
                integrationExportTitlePart: 'Seleziona un diverso',
                integrationExportTitleLinkPart: 'opzione di esportazione',
                integrationExportTitleSecondPart: 'per cambiare gli account disponibili.',
                lastUpdated: 'Ultimo aggiornamento',
                transactionStartDate: 'Data di inizio transazione',
                updateCard: 'Aggiorna carta',
                unassignCard: 'Rimuovi assegnazione carta',
                unassign: 'Rimuovi assegnazione',
                unassignCardDescription: "Rimuovere l'assegnazione di questa carta eliminerà tutte le transazioni sui rapporti in bozza dall'account del titolare della carta.",
                assignCard: 'Assegna carta',
                cardFeedName: 'Nome del feed della carta',
                cardFeedNameDescription: 'Dai al feed della carta un nome unico in modo da poterlo distinguere dagli altri.',
                cardFeedTransaction: 'Elimina transazioni',
                cardFeedTransactionDescription: 'Scegli se i titolari di carta possono eliminare le transazioni con carta. Le nuove transazioni seguiranno queste regole.',
                cardFeedRestrictDeletingTransaction: "Limita l'eliminazione delle transazioni",
                cardFeedAllowDeletingTransaction: "Consenti l'eliminazione delle transazioni",
                removeCardFeed: 'Rimuovi feed della carta',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Rimuovi feed ${feedName}`,
                removeCardFeedDescription: 'Sei sicuro di voler rimuovere questo feed di carte? Questo disassegnerà tutte le carte.',
                error: {
                    feedNameRequired: 'Il nome del feed della carta è obbligatorio',
                },
                corporate: "Limita l'eliminazione delle transazioni",
                personal: "Consenti l'eliminazione delle transazioni",
                setFeedNameDescription: 'Dai al feed della carta un nome univoco in modo da poterlo distinguere dagli altri',
                setTransactionLiabilityDescription: 'Quando abilitato, i titolari di carta possono eliminare le transazioni della carta. Le nuove transazioni seguiranno questa regola.',
                emptyAddedFeedTitle: 'Assegna carte aziendali',
                emptyAddedFeedDescription: 'Inizia assegnando la tua prima carta a un membro.',
                pendingFeedTitle: `Stiamo esaminando la tua richiesta...`,
                pendingFeedDescription: `Attualmente stiamo esaminando i dettagli del tuo feed. Una volta completato, ti contatteremo tramite`,
                pendingBankTitle: 'Controlla la finestra del tuo browser',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Si prega di connettersi a ${bankName} tramite la finestra del browser che si è appena aperta. Se non si è aperta,`,
                pendingBankLink: 'per favore clicca qui',
                giveItNameInstruction: 'Dai alla carta un nome che la distingua dalle altre.',
                updating: 'Aggiornamento in corso...',
                noAccountsFound: 'Nessun account trovato',
                defaultCard: 'Carta predefinita',
                downgradeTitle: `Impossibile effettuare il downgrade dello spazio di lavoro`,
                downgradeSubTitleFirstPart: `Questo workspace non può essere declassato perché sono collegati più flussi di carte (escludendo le carte Expensify). Per favore`,
                downgradeSubTitleMiddlePart: `mantieni solo un feed di carte`,
                downgradeSubTitleLastPart: 'per procedere.',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Per favore, aggiungi l'account in ${connection} e sincronizza nuovamente la connessione.`,
                expensifyCardBannerTitle: 'Ottieni la Expensify Card',
                expensifyCardBannerSubtitle:
                    'Goditi il cashback su ogni acquisto negli Stati Uniti, fino al 50% di sconto sulla tua fattura Expensify, carte virtuali illimitate e molto altro ancora.',
                expensifyCardBannerLearnMoreButton: 'Scopri di più',
            },
            workflows: {
                title: 'Flussi di lavoro',
                subtitle: 'Configura come viene approvata e pagata la spesa.',
                disableApprovalPrompt:
                    "Le carte Expensify di questo spazio di lavoro attualmente si basano sull'approvazione per definire i loro limiti intelligenti. Si prega di modificare i tipi di limiti di qualsiasi carta Expensify con limiti intelligenti prima di disabilitare le approvazioni.",
            },
            invoices: {
                title: 'Fatture',
                subtitle: 'Invia e ricevi fatture.',
            },
            categories: {
                title: 'Categorie',
                subtitle: 'Traccia e organizza le spese.',
            },
            tags: {
                title: 'Tag',
                subtitle: 'Classifica i costi e tieni traccia delle spese fatturabili.',
            },
            taxes: {
                title: 'Tasse',
                subtitle: 'Documenta e recupera le tasse ammissibili.',
            },
            reportFields: {
                title: 'Campi del rapporto',
                subtitle: 'Configura campi personalizzati per le spese.',
            },
            connections: {
                title: 'Contabilità',
                subtitle: 'Sincronizza il tuo piano dei conti e altro ancora.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Non così in fretta...',
                featureEnabledText: 'Per abilitare o disabilitare questa funzione, dovrai modificare le impostazioni di importazione contabile.',
                disconnectText: 'Per disabilitare la contabilità, dovrai disconnettere la tua connessione contabile dal tuo spazio di lavoro.',
                manageSettings: 'Gestisci impostazioni',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Non così in fretta...',
                featureEnabledText:
                    'Le carte Expensify in questo spazio di lavoro si basano su flussi di approvazione per definire i loro Limiti Intelligenti.\n\nSi prega di modificare i tipi di limite di qualsiasi carta con Limiti Intelligenti prima di disabilitare i flussi di lavoro.',
                confirmText: 'Vai a Expensify Cards',
            },
            rules: {
                title: 'Regole',
                subtitle: 'Richiedi ricevute, segnala spese elevate e altro ancora.',
            },
        },
        reportFields: {
            addField: 'Aggiungi campo',
            delete: 'Elimina campo',
            deleteFields: 'Elimina campi',
            findReportField: 'Trova campo del report',
            deleteConfirmation: 'Sei sicuro di voler eliminare questo campo del report?',
            deleteFieldsConfirmation: 'Sei sicuro di voler eliminare questi campi del report?',
            emptyReportFields: {
                title: 'Non hai creato alcun campo di report',
                subtitle: 'Aggiungi un campo personalizzato (testo, data o menu a discesa) che appare nei report.',
            },
            subtitle: 'I campi del report si applicano a tutte le spese e possono essere utili quando si desidera richiedere informazioni aggiuntive.',
            disableReportFields: 'Disabilita i campi del report',
            disableReportFieldsConfirmation: 'Sei sicuro? I campi di testo e data verranno eliminati e le liste verranno disabilitate.',
            importedFromAccountingSoftware: 'I campi del report sottostanti sono importati dal tuo',
            textType: 'Testo',
            dateType: 'Data',
            dropdownType: 'Elenco',
            textAlternateText: "Aggiungi un campo per l'inserimento di testo libero.",
            dateAlternateText: 'Aggiungi un calendario per la selezione delle date.',
            dropdownAlternateText: 'Aggiungi un elenco di opzioni tra cui scegliere.',
            nameInputSubtitle: 'Scegli un nome per il campo del rapporto.',
            typeInputSubtitle: 'Scegli quale tipo di campo del report utilizzare.',
            initialValueInputSubtitle: 'Inserisci un valore iniziale da mostrare nel campo del report.',
            listValuesInputSubtitle: 'Questi valori appariranno nel menu a discesa del campo del tuo report. I valori abilitati possono essere selezionati dai membri.',
            listInputSubtitle: "Questi valori appariranno nell'elenco dei campi del tuo report. I valori abilitati possono essere selezionati dai membri.",
            deleteValue: 'Elimina valore',
            deleteValues: 'Elimina valori',
            disableValue: 'Disabilita valore',
            disableValues: 'Disabilita valori',
            enableValue: 'Abilita valore',
            enableValues: 'Abilita valori',
            emptyReportFieldsValues: {
                title: 'Non hai creato alcun valore di elenco',
                subtitle: 'Aggiungi valori personalizzati da visualizzare nei report.',
            },
            deleteValuePrompt: "Sei sicuro di voler eliminare questo valore dall'elenco?",
            deleteValuesPrompt: 'Sei sicuro di voler eliminare questi valori dalla lista?',
            listValueRequiredError: "Per favore inserisci un nome per il valore dell'elenco",
            existingListValueError: 'Un valore di elenco con questo nome esiste già',
            editValue: 'Modifica valore',
            listValues: 'Elenca i valori',
            addValue: 'Aggiungi valore',
            existingReportFieldNameError: 'Un campo del report con questo nome esiste già',
            reportFieldNameRequiredError: 'Inserisci un nome per il campo del report',
            reportFieldTypeRequiredError: 'Si prega di scegliere un tipo di campo del report',
            reportFieldInitialValueRequiredError: 'Si prega di scegliere un valore iniziale per il campo del report',
            genericFailureMessage: "Si è verificato un errore durante l'aggiornamento del campo del report. Per favore riprova.",
        },
        tags: {
            tagName: 'Nome tag',
            requiresTag: 'I membri devono etichettare tutte le spese',
            trackBillable: 'Traccia le spese fatturabili',
            customTagName: 'Nome tag personalizzato',
            enableTag: 'Abilita tag',
            enableTags: 'Abilita tag',
            requireTag: 'Require tag',
            requireTags: 'Tag obbligatori',
            notRequireTags: 'Non richiedere',
            disableTag: 'Disabilita tag',
            disableTags: 'Disabilita tag',
            addTag: 'Aggiungi tag',
            editTag: 'Modifica tag',
            editTags: 'Modifica tag',
            findTag: 'Trova tag',
            subtitle: 'I tag aggiungono modi più dettagliati per classificare i costi.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: 'Stai usando',
                phrase2: 'tag dipendenti',
                phrase3: 'Puoi',
                phrase4: 'reimporta un foglio di calcolo',
                phrase5: 'aggiornare i tuoi tag.',
            },
            emptyTags: {
                title: 'Non hai creato alcun tag',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Aggiungi un tag per tracciare progetti, sedi, reparti e altro.',
                subtitle1: 'Importa un foglio di calcolo per aggiungere tag per il monitoraggio di progetti, sedi, dipartimenti e altro.',
                subtitle2: 'Scopri di più',
                subtitle3: 'about formatting tag files.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'I tuoi tag sono attualmente in fase di importazione da una connessione contabile. Vai su',
                subtitle2: 'contabilità',
                subtitle3: 'per apportare qualsiasi modifica.',
            },
            deleteTag: 'Elimina tag',
            deleteTags: 'Elimina tag',
            deleteTagConfirmation: 'Sei sicuro di voler eliminare questo tag?',
            deleteTagsConfirmation: 'Sei sicuro di voler eliminare questi tag?',
            deleteFailureMessage: "Si è verificato un errore durante l'eliminazione del tag, riprova.",
            tagRequiredError: 'Il nome del tag è obbligatorio',
            existingTagError: 'Un tag con questo nome esiste già',
            invalidTagNameError: 'Il nome del tag non può essere 0. Si prega di scegliere un valore diverso.',
            genericFailureMessage: "Si è verificato un errore durante l'aggiornamento del tag, riprova.",
            importedFromAccountingSoftware: 'I tag qui sotto sono importati dal tuo',
            glCode: 'Codice GL',
            updateGLCodeFailureMessage: "Si è verificato un errore durante l'aggiornamento del codice GL, riprova.",
            tagRules: 'Regole dei tag',
            approverDescription: 'Approvante',
            importTags: 'Importa tag',
            importTagsSupportingText: 'Codifica le tue spese con un tipo di etichetta o molte.',
            configureMultiLevelTags: 'Configura il tuo elenco di tag per la classificazione multi-livello.',
            importMultiLevelTagsSupportingText: `Ecco un'anteprima dei tuoi tag. Se tutto sembra a posto, clicca qui sotto per importarli.`,
            importMultiLevelTags: {
                firstRowTitle: 'La prima riga è il titolo per ogni elenco di tag',
                independentTags: 'Questi sono tag indipendenti',
                glAdjacentColumn: "C'è un codice GL nella colonna adiacente",
            },
            tagLevel: {
                singleLevel: 'Singolo livello di tag',
                multiLevel: 'Tag multi-livello',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Cambia i livelli dei tag',
                prompt1: 'Cambiare i livelli dei tag cancellerà tutti i tag attuali.',
                prompt2: 'Ti suggeriamo prima di',
                prompt3: 'scarica un backup',
                prompt4: 'esportando i tuoi tag.',
                prompt5: 'Scopri di più',
                prompt6: 'about tag levels.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Abbiamo trovato *${columnCounts} colonne* nel tuo foglio di calcolo. Seleziona *Nome* accanto alla colonna che contiene i nomi dei tag. Puoi anche selezionare *Abilitato* accanto alla colonna che imposta lo stato dei tag.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Impossibile eliminare o disabilitare tutti i tag',
                description: `Almeno un tag deve rimanere abilitato perché il tuo spazio di lavoro richiede tag.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Impossibile rendere tutti i tag opzionali',
                description: `Almeno un tag deve rimanere obbligatorio perché le impostazioni del tuo spazio di lavoro richiedono tag.`,
            },
            tagCount: () => ({
                one: '1 giorno',
                other: (count: number) => `${count} Tag`,
            }),
        },
        taxes: {
            subtitle: 'Aggiungi nomi delle tasse, aliquote e imposta predefiniti.',
            addRate: 'Aggiungi tariffa',
            workspaceDefault: 'Valuta predefinita del workspace',
            foreignDefault: 'Valuta estera predefinita',
            customTaxName: 'Nome tassa personalizzato',
            value: 'Valore',
            taxReclaimableOn: 'Imposta recuperabile su',
            taxRate: 'Aliquota fiscale',
            findTaxRate: "Trova l'aliquota fiscale",
            error: {
                taxRateAlreadyExists: 'Questo nome fiscale è già in uso',
                taxCodeAlreadyExists: 'Questo codice fiscale è già in uso',
                valuePercentageRange: 'Si prega di inserire una percentuale valida tra 0 e 100',
                customNameRequired: 'È richiesto un nome personalizzato per la tassa',
                deleteFailureMessage: "Si è verificato un errore durante l'eliminazione dell'aliquota fiscale. Riprova o chiedi aiuto a Concierge.",
                updateFailureMessage: "Si è verificato un errore durante l'aggiornamento dell'aliquota fiscale. Riprova o chiedi aiuto a Concierge.",
                createFailureMessage: "Si è verificato un errore durante la creazione dell'aliquota fiscale. Riprova o chiedi aiuto a Concierge.",
                updateTaxClaimableFailureMessage: "La parte recuperabile deve essere inferiore all'importo della tariffa di distanza.",
            },
            deleteTaxConfirmation: 'Sei sicuro di voler eliminare questa tassa?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Sei sicuro di voler eliminare le tasse di ${taxAmount}?`,
            actions: {
                delete: 'Elimina tariffa',
                deleteMultiple: 'Elimina tariffe',
                enable: 'Abilita tariffa',
                disable: 'Disabilita tariffa',
                enableTaxRates: () => ({
                    one: 'Abilita tariffa',
                    other: 'Abilita tariffe',
                }),
                disableTaxRates: () => ({
                    one: 'Disabilita tariffa',
                    other: 'Disabilita tariffe',
                }),
            },
            importedFromAccountingSoftware: 'Le tasse sottostanti sono importate dal tuo',
            taxCode: 'Codice fiscale',
            updateTaxCodeFailureMessage: "Si è verificato un errore durante l'aggiornamento del codice fiscale, riprova.",
        },
        emptyWorkspace: {
            title: "Crea un'area di lavoro",
            subtitle: 'Crea uno spazio di lavoro per tracciare le ricevute, rimborsare le spese, gestire i viaggi, inviare fatture e altro ancora, tutto alla velocità della chat.',
            createAWorkspaceCTA: 'Inizia',
            features: {
                trackAndCollect: 'Traccia e raccogli ricevute',
                reimbursements: 'Rimborsare i dipendenti',
                companyCards: 'Gestisci carte aziendali',
            },
            notFound: 'Nessun workspace trovato',
            description: 'Le stanze sono un ottimo posto per discutere e lavorare con più persone. Per iniziare a collaborare, crea o unisciti a un workspace.',
        },
        new: {
            newWorkspace: 'Nuovo spazio di lavoro',
            getTheExpensifyCardAndMore: 'Ottieni la Expensify Card e altro ancora',
            confirmWorkspace: 'Conferma Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Il mio spazio di lavoro di gruppo${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Spazio di lavoro di ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Si è verificato un errore durante la rimozione di un membro dallo spazio di lavoro, per favore riprova.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Sei sicuro di voler rimuovere ${memberName}?`,
                other: 'Sei sicuro di voler rimuovere questi membri?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} è un approvatore in questo spazio di lavoro. Quando smetti di condividere questo spazio di lavoro con loro, li sostituiremo nel flusso di approvazione con il proprietario dello spazio di lavoro, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Rimuovi membro',
                other: 'Rimuovi membri',
            }),
            findMember: 'Trova membro',
            removeWorkspaceMemberButtonTitle: "Rimuovi dall'area di lavoro",
            removeGroupMemberButtonTitle: 'Rimuovi dal gruppo',
            removeRoomMemberButtonTitle: 'Rimuovi dalla chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Sei sicuro di voler rimuovere ${memberName}?`,
            removeMemberTitle: 'Rimuovi membro',
            transferOwner: 'Trasferisci proprietario',
            makeMember: 'Rendi membro',
            makeAdmin: 'Rendi amministratore',
            makeAuditor: 'Crea revisore contabile',
            selectAll: 'Seleziona tutto',
            error: {
                genericAdd: "Si è verificato un problema nell'aggiungere questo membro dello spazio di lavoro",
                cannotRemove: 'Non puoi rimuovere te stesso o il proprietario dello spazio di lavoro',
                genericRemove: 'Si è verificato un problema durante la rimozione di quel membro del workspace',
            },
            addedWithPrimary: 'Alcuni membri sono stati aggiunti con i loro accessi principali.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Aggiunto da login secondario ${secondaryLogin}.`,
            membersListTitle: 'Directory di tutti i membri del workspace.',
            importMembers: 'Importa membri',
        },
        card: {
            getStartedIssuing: 'Inizia emettendo la tua prima carta virtuale o fisica.',
            issueCard: 'Emetti carta',
            issueNewCard: {
                whoNeedsCard: 'Chi ha bisogno di una carta?',
                findMember: 'Trova membro',
                chooseCardType: 'Scegli un tipo di carta',
                physicalCard: 'Carta fisica',
                physicalCardDescription: 'Ottimo per chi spende frequentemente',
                virtualCard: 'Carta virtuale',
                virtualCardDescription: 'Istantaneo e flessibile',
                chooseLimitType: 'Scegli un tipo di limite',
                smartLimit: 'Limite Intelligente',
                smartLimitDescription: "Spendere fino a un certo importo prima di richiedere l'approvazione",
                monthly: 'Mensile',
                monthlyDescription: 'Spendere fino a un certo importo al mese',
                fixedAmount: 'Importo fisso',
                fixedAmountDescription: 'Spendere fino a un certo importo una volta sola',
                setLimit: 'Imposta un limite',
                cardLimitError: 'Inserisci un importo inferiore a $21,474,836',
                giveItName: 'Dagli un nome',
                giveItNameInstruction: "Rendila abbastanza unica da distinguerla dalle altre carte. Casi d'uso specifici sono ancora meglio!",
                cardName: 'Nome della carta',
                letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
                willBeReady: 'Questa carta sarà pronta per essere utilizzata immediatamente.',
                cardholder: 'Titolare della carta',
                cardType: 'Tipo di carta',
                limit: 'Limite',
                limitType: 'Tipo di limite',
                name: 'Nome',
            },
            deactivateCardModal: {
                deactivate: 'Disattiva',
                deactivateCard: 'Disattiva carta',
                deactivateConfirmation: 'Disattivare questa carta rifiuterà tutte le transazioni future e non potrà essere annullato.',
            },
        },
        accounting: {
            settings: 'impostazioni',
            title: 'Connessioni',
            subtitle:
                'Connettiti al tuo sistema contabile per codificare le transazioni con il tuo piano dei conti, abbinare automaticamente i pagamenti e mantenere le tue finanze sincronizzate.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatta con il tuo specialista di configurazione.',
            talkYourAccountManager: 'Chatta con il tuo account manager.',
            talkToConcierge: 'Chatta con Concierge.',
            needAnotherAccounting: 'Hai bisogno di un altro software di contabilità?',
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
            errorODIntegration: "C'è un errore con una connessione che è stata impostata in Expensify Classic.",
            goToODToFix: 'Vai su Expensify Classic per risolvere questo problema.',
            goToODToSettings: 'Vai su Expensify Classic per gestire le tue impostazioni.',
            setup: 'Connetti',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Ultima sincronizzazione ${relativeDate}`,
            notSync: 'Non sincronizzato',
            import: 'Importa',
            export: 'Esporta',
            advanced: 'Avanzato',
            other: 'Altro',
            syncNow: 'Sincronizza ora',
            disconnect: 'Disconnetti',
            reinstall: 'Reinstalla connettore',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integrazione';
                return `Disconnetti ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Connetti ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integrazione contabile'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Impossibile connettersi a QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Impossibile connettersi a Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Impossibile connettersi a NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Impossibile connettersi a QuickBooks Desktop';
                    default: {
                        return "Impossibile connettersi all'integrazione";
                    }
                }
            },
            accounts: 'Piano dei conti',
            taxes: 'Tasse',
            imported: 'Importato',
            notImported: 'Non importato',
            importAsCategory: 'Importato come categorie',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importato',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Importato come tag',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importato',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Non importato',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Non importato',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Importato come campi del report',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Impostazione predefinita dipendente NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'questa integrazione';
                return `Sei sicuro di voler disconnettere ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Sei sicuro di voler connettere ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'questa integrazione contabile'}? Questo rimuoverà tutte le connessioni contabili esistenti.`,
            enterCredentials: 'Inserisci le tue credenziali',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importazione dei clienti';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importazione dipendenti';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importazione degli account';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importazione delle classi';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importazione di località';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Elaborazione dei dati importati';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Sincronizzazione dei report rimborsati e dei pagamenti delle fatture';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importazione dei codici fiscali';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Verifica connessione QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importazione dei dati di QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importazione dei dati Xero';
                        case 'startingImportQBO':
                            return 'Importazione dei dati di QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importazione dei dati di QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return "Titolo dell'importazione";
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importazione certificato di approvazione';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importazione delle dimensioni';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importazione della politica di salvataggio';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Ancora in fase di sincronizzazione dei dati con QuickBooks... Assicurati che il Web Connector sia in esecuzione';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Sincronizzazione dei dati di QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Caricamento dei dati';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Aggiornamento delle categorie';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Aggiornamento clienti/progetti';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return "Aggiornamento dell'elenco delle persone";
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Aggiornamento dei campi del report';
                        case 'jobDone':
                            return 'In attesa che i dati importati vengano caricati';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Sincronizzazione del piano dei conti';
                        case 'xeroSyncImportCategories':
                            return 'Sincronizzazione delle categorie';
                        case 'xeroSyncImportCustomers':
                            return 'Sincronizzazione dei clienti';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Contrassegnare i report di Expensify come rimborsati';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Contrassegnare le fatture e le ricevute di Xero come pagate';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Sincronizzazione delle categorie di tracciamento';
                        case 'xeroSyncImportBankAccounts':
                            return 'Sincronizzazione dei conti bancari';
                        case 'xeroSyncImportTaxRates':
                            return 'Sincronizzazione delle aliquote fiscali';
                        case 'xeroCheckConnection':
                            return 'Verifica connessione Xero';
                        case 'xeroSyncTitle':
                            return 'Sincronizzazione dei dati Xero';
                        case 'netSuiteSyncConnection':
                            return 'Inizializzazione della connessione a NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importazione dei clienti';
                        case 'netSuiteSyncInitData':
                            return 'Recupero dati da NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importazione delle tasse';
                        case 'netSuiteSyncImportItems':
                            return 'Importazione degli articoli';
                        case 'netSuiteSyncData':
                            return 'Importazione dei dati in Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Sincronizzazione degli account';
                        case 'netSuiteSyncCurrencies':
                            return 'Sincronizzazione delle valute';
                        case 'netSuiteSyncCategories':
                            return 'Sincronizzazione delle categorie';
                        case 'netSuiteSyncReportFields':
                            return 'Importazione dei dati come campi del report di Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importazione dei dati come tag di Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Aggiornamento delle informazioni di connessione';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Contrassegnare i report di Expensify come rimborsati';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Contrassegnare le fatture e le bollette di NetSuite come pagate';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importazione fornitori';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importazione di elenchi personalizzati';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importazione di elenchi personalizzati';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importazione di filiali';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importazione fornitori';
                        case 'intacctCheckConnection':
                            return 'Verifica connessione Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importazione delle dimensioni di Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importazione dei dati Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Traduzione mancante per la fase: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Esportatore preferito',
            exportPreferredExporterNote:
                "L'esportatore preferito può essere qualsiasi amministratore dello spazio di lavoro, ma deve anche essere un amministratore di dominio se imposti conti di esportazione diversi per singole carte aziendali nelle impostazioni del dominio.",
            exportPreferredExporterSubNote: "Una volta impostato, l'esportatore preferito vedrà i report per l'esportazione nel proprio account.",
            exportAs: 'Esporta come',
            exportOutOfPocket: 'Esporta le spese anticipate come',
            exportCompanyCard: 'Esporta le spese della carta aziendale come',
            exportDate: 'Data di esportazione',
            defaultVendor: 'Fornitore predefinito',
            autoSync: 'Sincronizzazione automatica',
            autoSyncDescription: 'Sincronizza automaticamente NetSuite ed Expensify ogni giorno. Esporta il report finalizzato in tempo reale.',
            reimbursedReports: 'Sincronizza i rapporti rimborsati',
            cardReconciliation: 'Riconciliazione della carta',
            reconciliationAccount: 'Conto di riconciliazione',
            continuousReconciliation: 'Riconciliazione Continua',
            saveHoursOnReconciliation:
                'Risparmia ore di riconciliazione ogni periodo contabile facendo riconciliare continuamente a Expensify gli estratti conto e i regolamenti della Expensify Card per tuo conto.',
            enableContinuousReconciliation: 'Per abilitare la Riconciliazione Continua, si prega di abilitare',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Scegli il conto bancario su cui verranno riconciliati i pagamenti della tua carta Expensify.',
                accountMatches: 'Assicurati che questo account corrisponda al tuo',
                settlementAccount: 'Conto di regolamento della carta Expensify',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) => `(termine con ${lastFourPAN}) affinché la Riconciliazione Continua funzioni correttamente.`,
            },
        },
        export: {
            notReadyHeading: "Non pronto per l'esportazione",
            notReadyDescription:
                'I rapporti di spesa in bozza o in sospeso non possono essere esportati nel sistema contabile. Si prega di approvare o pagare queste spese prima di esportarle.',
        },
        invoices: {
            sendInvoice: 'Invia fattura',
            sendFrom: 'Invia da',
            invoicingDetails: 'Dettagli di fatturazione',
            invoicingDetailsDescription: 'Queste informazioni appariranno sulle tue fatture.',
            companyName: "Nome dell'azienda",
            companyWebsite: "Sito web dell'azienda",
            paymentMethods: {
                personal: 'Personale',
                business: 'Business',
                chooseInvoiceMethod: 'Scegli un metodo di pagamento qui sotto:',
                addBankAccount: 'Aggiungi conto bancario',
                payingAsIndividual: 'Pagare come individuo',
                payingAsBusiness: "Pagare come un'azienda",
            },
            invoiceBalance: 'Saldo fattura',
            invoiceBalanceSubtitle:
                'Questo è il tuo saldo attuale derivante dalla riscossione dei pagamenti delle fatture. Verrà trasferito automaticamente sul tuo conto bancario se ne hai aggiunto uno.',
            bankAccountsSubtitle: 'Aggiungi un conto bancario per effettuare e ricevere pagamenti delle fatture.',
        },
        invite: {
            member: 'Invita membro',
            members: 'Invita membri',
            invitePeople: 'Invita nuovi membri',
            genericFailureMessage: "Si è verificato un errore durante l'invito del membro allo spazio di lavoro. Per favore, riprova.",
            pleaseEnterValidLogin: `Assicurati che l'email o il numero di telefono siano validi (ad es. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'utente',
            users: 'utenti',
            invited: 'invitato',
            removed: 'rimosso',
            to: 'a',
            from: 'da',
        },
        inviteMessage: {
            confirmDetails: 'Conferma i dettagli',
            inviteMessagePrompt: 'Rendi il tuo invito ancora più speciale aggiungendo un messaggio qui sotto!',
            personalMessagePrompt: 'Messaggio',
            genericFailureMessage: "Si è verificato un errore durante l'invito del membro allo spazio di lavoro. Per favore, riprova.",
            inviteNoMembersError: 'Seleziona almeno un membro da invitare',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} ha richiesto di unirsi a ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ops! Non così in fretta...',
            workspaceNeeds: 'Un workspace necessita di almeno una tariffa di distanza abilitata.',
            distance: 'Distanza',
            centrallyManage: 'Gestisci centralmente le tariffe, traccia in miglia o chilometri e imposta una categoria predefinita.',
            rate: 'Valuta',
            addRate: 'Aggiungi tariffa',
            findRate: 'Trova tariffa',
            trackTax: 'Traccia imposta',
            deleteRates: () => ({
                one: 'Elimina tariffa',
                other: 'Elimina tariffe',
            }),
            enableRates: () => ({
                one: 'Abilita tariffa',
                other: 'Abilita tariffe',
            }),
            disableRates: () => ({
                one: 'Disabilita tariffa',
                other: 'Disabilita tariffe',
            }),
            enableRate: 'Abilita tariffa',
            status: 'Stato',
            unit: 'Unit',
            taxFeatureNotEnabledMessage: 'Le tasse devono essere abilitate nello spazio di lavoro per utilizzare questa funzione. Vai su',
            changePromptMessage: 'per apportare quella modifica.',
            deleteDistanceRate: 'Elimina tariffa distanza',
            areYouSureDelete: () => ({
                one: 'Sei sicuro di voler eliminare questa tariffa?',
                other: 'Sei sicuro di voler eliminare queste tariffe?',
            }),
        },
        editor: {
            descriptionInputLabel: 'Descrizione',
            nameInputLabel: 'Nome',
            typeInputLabel: 'Tipo',
            initialValueInputLabel: 'Valore iniziale',
            nameInputHelpText: 'Questo è il nome che vedrai nel tuo spazio di lavoro.',
            nameIsRequiredError: 'Dovrai dare un nome al tuo spazio di lavoro',
            currencyInputLabel: 'Valuta predefinita',
            currencyInputHelpText: 'Tutte le spese in questo spazio di lavoro saranno convertite in questa valuta.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `La valuta predefinita non può essere modificata perché questo spazio di lavoro è collegato a un conto bancario in ${currency}.`,
            save: 'Salva',
            genericFailureMessage: "Si è verificato un errore durante l'aggiornamento dello spazio di lavoro. Per favore riprova.",
            avatarUploadFailureMessage: "Si è verificato un errore durante il caricamento dell'avatar. Per favore riprova.",
            addressContext: 'È necessario un indirizzo Workspace per abilitare Expensify Travel. Si prega di inserire un indirizzo associato alla tua attività.',
        },
        bankAccount: {
            continueWithSetup: 'Continua configurazione',
            youAreAlmostDone:
                'Hai quasi finito di configurare il tuo conto bancario, il che ti permetterà di emettere carte aziendali, rimborsare spese, riscuotere fatture e pagare bollette.',
            streamlinePayments: 'Ottimizza i pagamenti',
            connectBankAccountNote: 'Nota: I conti bancari personali non possono essere utilizzati per i pagamenti negli spazi di lavoro.',
            oneMoreThing: "Un'altra cosa!",
            allSet: 'Tutto pronto!',
            accountDescriptionWithCards: 'Questo conto bancario sarà utilizzato per emettere carte aziendali, rimborsare spese, riscuotere fatture e pagare bollette.',
            letsFinishInChat: 'Finisciamo in chat!',
            finishInChat: 'Termina in chat',
            almostDone: 'Quasi finito!',
            disconnectBankAccount: 'Disconnetti conto bancario',
            startOver: 'Ricomincia',
            updateDetails: 'Aggiorna dettagli',
            yesDisconnectMyBankAccount: 'Sì, disconnetti il mio conto bancario',
            yesStartOver: 'Sì, ricomincia',
            disconnectYour: 'Disconnetti il tuo',
            bankAccountAnyTransactions: 'conto bancario. Qualsiasi transazione in sospeso per questo conto verrà comunque completata.',
            clearProgress: 'Ricominciando si cancellerà il progresso che hai fatto finora.',
            areYouSure: 'Sei sicuro?',
            workspaceCurrency: 'Valuta del workspace',
            updateCurrencyPrompt:
                'Sembra che il tuo spazio di lavoro sia attualmente impostato su una valuta diversa da USD. Clicca il pulsante qui sotto per aggiornare la tua valuta a USD ora.',
            updateToUSD: 'Aggiorna a USD',
            updateWorkspaceCurrency: 'Aggiorna la valuta dello spazio di lavoro',
            workspaceCurrencyNotSupported: "Valuta dell'area di lavoro non supportata",
            yourWorkspace: 'La tua area di lavoro è impostata su una valuta non supportata. Visualizza il',
            listOfSupportedCurrencies: 'elenco delle valute supportate',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Trasferisci proprietario',
            addPaymentCardTitle: 'Inserisci la tua carta di pagamento per trasferire la proprietà',
            addPaymentCardButtonText: 'Accetta i termini e aggiungi una carta di pagamento',
            addPaymentCardReadAndAcceptTextPart1: 'Leggi e accetta',
            addPaymentCardReadAndAcceptTextPart2: 'politica per aggiungere la tua carta',
            addPaymentCardTerms: 'termini',
            addPaymentCardPrivacy: 'privacy',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Conforme a PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Crittografia a livello bancario',
            addPaymentCardRedundant: 'Infrastruttura ridondante',
            addPaymentCardLearnMore: 'Scopri di più sui nostri',
            addPaymentCardSecurity: 'sicurezza',
            amountOwedTitle: 'Saldo in sospeso',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Questo account ha un saldo in sospeso da un mese precedente.\n\nVuoi saldare il saldo e assumere la gestione della fatturazione di questo spazio di lavoro?',
            ownerOwesAmountTitle: 'Saldo in sospeso',
            ownerOwesAmountButtonText: 'Trasferisci saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `L'account che possiede questo workspace (${email}) ha un saldo in sospeso da un mese precedente.\n\nVuoi trasferire questo importo (${amount}) per assumere la fatturazione di questo workspace? La tua carta di pagamento verrà addebitata immediatamente.`,
            subscriptionTitle: "Assumere l'abbonamento annuale",
            subscriptionButtonText: 'Trasferisci abbonamento',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Assumere il controllo di questo spazio di lavoro unirà il suo abbonamento annuale con il tuo abbonamento attuale. Questo aumenterà la dimensione del tuo abbonamento di ${usersCount} membri, portando la nuova dimensione dell'abbonamento a ${finalCount}. Vuoi continuare?`,
            duplicateSubscriptionTitle: 'Avviso di abbonamento duplicato',
            duplicateSubscriptionButtonText: 'Continua',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Sembra che tu stia cercando di assumere la gestione della fatturazione per gli spazi di lavoro di ${email}, ma per farlo devi prima essere un amministratore di tutti i loro spazi di lavoro.\n\nClicca su "Continua" se vuoi solo assumere la gestione della fatturazione per lo spazio di lavoro ${workspaceName}.\n\nSe desideri assumere la gestione della fatturazione per l'intero abbonamento, chiedi loro di aggiungerti come amministratore a tutti i loro spazi di lavoro prima di prendere in carico la fatturazione.`,
            hasFailedSettlementsTitle: 'Impossibile trasferire la proprietà',
            hasFailedSettlementsButtonText: 'Capito',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Non puoi assumere la gestione della fatturazione perché ${email} ha un saldo scaduto della Expensify Card. Per favore chiedi loro di contattare concierge@expensify.com per risolvere il problema. Successivamente, potrai assumere la gestione della fatturazione per questo workspace.`,
            failedToClearBalanceTitle: 'Impossibile azzerare il saldo',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Non siamo riusciti a saldare il saldo. Per favore riprova più tardi.',
            successTitle: 'Woohoo! Tutto pronto.',
            successDescription: 'Ora sei il proprietario di questo spazio di lavoro.',
            errorTitle: 'Ops! Non così in fretta...',
            errorDescriptionPartOne: 'Si è verificato un problema nel trasferimento della proprietà di questo spazio di lavoro. Riprova, oppure',
            errorDescriptionPartTwo: 'contatta Concierge',
            errorDescriptionPartThree: 'per assistenza.',
        },
        exportAgainModal: {
            title: 'Attento!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `I seguenti report sono già stati esportati su ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\nSei sicuro di volerli esportare di nuovo?`,
            confirmText: 'Sì, esporta di nuovo',
            cancelText: 'Annulla',
        },
        upgrade: {
            reportFields: {
                title: 'Campi del rapporto',
                description: `I campi del report ti permettono di specificare dettagli a livello di intestazione, distinti dai tag che si riferiscono alle spese su singoli articoli. Questi dettagli possono includere nomi di progetti specifici, informazioni sui viaggi di lavoro, località e altro ancora.`,
                onlyAvailableOnPlan: 'I campi del report sono disponibili solo nel piano Control, a partire da',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Goditi la sincronizzazione automatica e riduci le immissioni manuali con l'integrazione Expensify + NetSuite. Ottieni approfondimenti finanziari dettagliati e in tempo reale con il supporto di segmenti nativi e personalizzati, inclusa la mappatura di progetti e clienti.`,
                onlyAvailableOnPlan: 'La nostra integrazione con NetSuite è disponibile solo con il piano Control, a partire da',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Goditi la sincronizzazione automatica e riduci le immissioni manuali con l'integrazione Expensify + Sage Intacct. Ottieni approfondimenti finanziari in tempo reale con dimensioni definite dall'utente, oltre alla codifica delle spese per dipartimento, classe, posizione, cliente e progetto (lavoro).`,
                onlyAvailableOnPlan: 'La nostra integrazione con Sage Intacct è disponibile solo nel piano Control, a partire da',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Goditi la sincronizzazione automatica e riduci le immissioni manuali con l'integrazione Expensify + QuickBooks Desktop. Ottieni la massima efficienza con una connessione bidirezionale in tempo reale e la codifica delle spese per classe, articolo, cliente e progetto.`,
                onlyAvailableOnPlan: 'La nostra integrazione con QuickBooks Desktop è disponibile solo con il piano Control, a partire da',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Approvazioni Avanzate',
                description: `Se desideri aggiungere più livelli di approvazione al processo – o semplicemente assicurarti che le spese più grandi ricevano un ulteriore controllo – ti abbiamo coperto. Le approvazioni avanzate ti aiutano a mettere in atto i controlli giusti a ogni livello, in modo da mantenere sotto controllo le spese del tuo team.`,
                onlyAvailableOnPlan: 'Le approvazioni avanzate sono disponibili solo nel piano Control, che parte da',
            },
            categories: {
                title: 'Categorie',
                description: `Le categorie ti aiutano a organizzare meglio le spese per tenere traccia di dove stai spendendo i tuoi soldi. Usa la nostra lista di categorie suggerite o crea le tue.`,
                onlyAvailableOnPlan: 'Le categorie sono disponibili nel piano Collect, a partire da',
            },
            glCodes: {
                title: 'Codici GL',
                description: `Aggiungi codici GL alle tue categorie e tag per esportare facilmente le spese nei tuoi sistemi di contabilità e gestione stipendi.`,
                onlyAvailableOnPlan: 'I codici GL sono disponibili solo nel piano Control, a partire da',
            },
            glAndPayrollCodes: {
                title: 'Codici GL e Payroll',
                description: `Aggiungi codici GL e Payroll alle tue categorie per esportare facilmente le spese nei tuoi sistemi contabili e di gestione stipendi.`,
                onlyAvailableOnPlan: 'I codici GL e Payroll sono disponibili solo nel piano Control, a partire da',
            },
            taxCodes: {
                title: 'Codici fiscali',
                description: `Aggiungi i codici fiscali alle tue tasse per esportare facilmente le spese nei tuoi sistemi di contabilità e paghe.`,
                onlyAvailableOnPlan: 'I codici fiscali sono disponibili solo nel piano Control, a partire da',
            },
            companyCards: {
                title: 'Carte aziendali illimitate',
                description: `Hai bisogno di aggiungere più feed di carte? Sblocca carte aziendali illimitate per sincronizzare le transazioni da tutti i principali emittenti di carte.`,
                onlyAvailableOnPlan: 'Questo è disponibile solo nel piano Control, a partire da',
            },
            rules: {
                title: 'Regole',
                description: `Le regole funzionano in background e tengono sotto controllo le tue spese, così non devi preoccuparti delle piccole cose.\n\nRichiedi dettagli delle spese come ricevute e descrizioni, imposta limiti e predefiniti, e automatizza approvazioni e pagamenti, tutto in un unico posto.`,
                onlyAvailableOnPlan: 'Le regole sono disponibili solo nel piano Control, a partire da',
            },
            perDiem: {
                title: 'Per diem',
                description:
                    'Il "per diem" è un ottimo modo per mantenere i costi giornalieri conformi e prevedibili ogni volta che i tuoi dipendenti viaggiano. Goditi funzionalità come tariffe personalizzate, categorie predefinite e dettagli più granulari come destinazioni e sottotariffe.',
                onlyAvailableOnPlan: 'I diari sono disponibili solo nel piano Control, a partire da',
            },
            travel: {
                title: 'Viaggio',
                description:
                    'Expensify Travel è una nuova piattaforma aziendale per la prenotazione e la gestione dei viaggi che consente ai membri di prenotare alloggi, voli, trasporti e altro.',
                onlyAvailableOnPlan: 'Il viaggio è disponibile nel piano Collect, a partire da',
            },
            multiLevelTags: {
                title: 'Tag multi-livello',
                description:
                    'I tag multilivello ti aiutano a monitorare le spese con maggiore precisione. Assegna più tag a ciascuna voce, come reparto, cliente o centro di costo, per catturare il contesto completo di ogni spesa. Questo consente report più dettagliati, flussi di lavoro di approvazione ed esportazioni contabili.',
                onlyAvailableOnPlan: 'I tag multilivello sono disponibili solo nel piano Control, a partire da',
            },
            pricing: {
                perActiveMember: 'per membro attivo al mese.',
                perMember: 'per membro al mese.',
            },
            note: {
                upgradeWorkspace: 'Aggiorna il tuo spazio di lavoro per accedere a questa funzione, oppure',
                learnMore: 'scopri di più',
                aboutOurPlans: 'informazioni sui nostri piani e prezzi.',
            },
            upgradeToUnlock: 'Sblocca questa funzione',
            completed: {
                headline: `Hai aggiornato il tuo spazio di lavoro!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `Hai aggiornato con successo ${policyName} al piano Control!`,
                categorizeMessage: `Hai effettuato con successo l'upgrade a un workspace con il piano Collect. Ora puoi categorizzare le tue spese!`,
                travelMessage: `Hai eseguito con successo l'upgrade a un workspace con il piano Collect. Ora puoi iniziare a prenotare e gestire i viaggi!`,
                viewSubscription: 'Visualizza il tuo abbonamento',
                moreDetails: 'per maggiori dettagli.',
                gotIt: 'Ricevuto, grazie',
            },
            commonFeatures: {
                title: 'Passa al piano Control',
                note: 'Sblocca le nostre funzionalità più potenti, tra cui:',
                benefits: {
                    startsAt: 'Il piano Control parte da',
                    perMember: 'per membro attivo al mese.',
                    learnMore: 'Scopri di più',
                    pricing: 'informazioni sui nostri piani e prezzi.',
                    benefit1: 'Connessioni contabili avanzate (NetSuite, Sage Intacct e altro)',
                    benefit2: 'Regole intelligenti per le spese',
                    benefit3: 'Flussi di lavoro di approvazione multilivello',
                    benefit4: 'Controlli di sicurezza avanzati',
                    toUpgrade: 'Per aggiornare, fai clic',
                    selectWorkspace: 'seleziona uno spazio di lavoro e cambia il tipo di piano in',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Effettua il downgrade al piano Collect',
                note: "Se effettui il downgrade, perderai l'accesso a queste funzionalità e altro ancora:",
                benefits: {
                    note: "Per un confronto completo dei nostri piani, dai un'occhiata al nostro",
                    pricingPage: 'pagina dei prezzi',
                    confirm: 'Sei sicuro di voler effettuare il downgrade e rimuovere le tue configurazioni?',
                    warning: 'Questo non può essere annullato.',
                    benefit1: 'Connessioni contabili (eccetto QuickBooks Online e Xero)',
                    benefit2: 'Regole intelligenti per le spese',
                    benefit3: 'Flussi di lavoro di approvazione multilivello',
                    benefit4: 'Controlli di sicurezza avanzati',
                    headsUp: 'Attenzione!',
                    multiWorkspaceNote:
                        'Dovrai eseguire il downgrade di tutti i tuoi spazi di lavoro prima del tuo primo pagamento mensile per iniziare un abbonamento al tasso Collect. Clicca',
                    selectStep: '> seleziona ogni spazio di lavoro > cambia il tipo di piano in',
                },
            },
            completed: {
                headline: 'Il tuo spazio di lavoro è stato declassato',
                description: 'Hai altri spazi di lavoro nel piano Control. Per essere fatturato al tasso Collect, devi eseguire il downgrade di tutti gli spazi di lavoro.',
                gotIt: 'Ricevuto, grazie',
            },
        },
        payAndDowngrade: {
            title: 'Paga e declassa',
            headline: 'Il tuo pagamento finale',
            description1: 'La tua fattura finale per questo abbonamento sarà',
            description2: ({date}: DateParams) => `Vedi il tuo dettaglio qui sotto per ${date}:`,
            subscription:
                'Attenzione! Questa azione terminerà il tuo abbonamento a Expensify, eliminerà questo spazio di lavoro e rimuoverà tutti i membri dello spazio di lavoro. Se desideri mantenere questo spazio di lavoro e rimuovere solo te stesso, fai in modo che un altro amministratore si occupi prima della fatturazione.',
            genericFailureMessage: 'Si è verificato un errore durante il pagamento della tua fattura. Per favore riprova.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Le azioni nello spazio di lavoro ${workspaceName} sono attualmente limitate`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Il proprietario dello spazio di lavoro, ${workspaceOwnerName}, dovrà aggiungere o aggiornare la carta di pagamento registrata per sbloccare la nuova attività dello spazio di lavoro.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Dovrai aggiungere o aggiornare la carta di pagamento registrata per sbloccare la nuova attività dello spazio di lavoro.',
            addPaymentCardToUnlock: 'Aggiungi una carta di pagamento per sbloccare!',
            addPaymentCardToContinueUsingWorkspace: 'Aggiungi una carta di pagamento per continuare a utilizzare questo spazio di lavoro',
            pleaseReachOutToYourWorkspaceAdmin: "Si prega di contattare l'amministratore del proprio spazio di lavoro per qualsiasi domanda.",
            chatWithYourAdmin: 'Chatta con il tuo amministratore',
            chatInAdmins: 'Chatta in #admins',
            addPaymentCard: 'Aggiungi carta di pagamento',
        },
        rules: {
            individualExpenseRules: {
                title: 'Spese',
                subtitle: 'Imposta controlli di spesa e predefiniti per le singole spese. Puoi anche creare regole per',
                receiptRequiredAmount: 'Importo richiesto della ricevuta',
                receiptRequiredAmountDescription: 'Richiedi ricevute quando la spesa supera questo importo, a meno che non sia derogato da una regola di categoria.',
                maxExpenseAmount: 'Importo massimo spesa',
                maxExpenseAmountDescription: 'Contrassegna la spesa che supera questo importo, a meno che non sia sostituita da una regola di categoria.',
                maxAge: 'Età massima',
                maxExpenseAge: 'Età massima della spesa',
                maxExpenseAgeDescription: 'Contrassegna le spese più vecchie di un determinato numero di giorni.',
                maxExpenseAgeDays: () => ({
                    one: '1 giorno',
                    other: (count: number) => `${count} giorni`,
                }),
                billableDefault: 'Predefinito fatturabile',
                billableDefaultDescription:
                    'Scegli se le spese in contanti e con carta di credito devono essere fatturabili per impostazione predefinita. Le spese fatturabili sono abilitate o disabilitate in',
                billable: 'Fatturabile',
                billableDescription: 'Le spese sono più spesso riaddebitate ai clienti.',
                nonBillable: 'Non-fatturabile',
                nonBillableDescription: 'Le spese sono occasionalmente riaddebitate ai clienti.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'Gli eReceipts sono creati automaticamente',
                eReceiptsHintLink: 'per la maggior parte delle transazioni di credito in USD',
                attendeeTracking: 'Monitoraggio dei partecipanti',
                attendeeTrackingHint: 'Tieni traccia del costo per persona per ogni spesa.',
                prohibitedDefaultDescription:
                    "Segnala tutte le ricevute in cui compaiono alcolici, giochi d'azzardo o altri articoli vietati. Le spese con ricevute in cui compaiono questi articoli richiederanno una revisione manuale.",
                prohibitedExpenses: 'Spese vietate',
                alcohol: 'Alcol',
                hotelIncidentals: 'Extra alberghieri',
                gambling: "Gioco d'azzardo",
                tobacco: 'Tabacco',
                adultEntertainment: 'Intrattenimento per adulti',
            },
            expenseReportRules: {
                examples: 'Esempi:',
                title: 'Report di spesa',
                subtitle: 'Automatizza la conformità, le approvazioni e il pagamento dei report di spesa.',
                customReportNamesSubtitle: 'Personalizza i titoli dei report utilizzando il nostro',
                customNameTitle: 'Titolo predefinito del report',
                customNameDescription: 'Scegli un nome personalizzato per i report di spesa utilizzando il nostro',
                customNameDescriptionLink: 'formule estese',
                customNameInputLabel: 'Nome',
                customNameEmailPhoneExample: 'Email o telefono del membro: {report:submit:from}',
                customNameStartDateExample: 'Data di inizio del report: {report:startdate}',
                customNameWorkspaceNameExample: "Nome dell'area di lavoro: {report:workspacename}",
                customNameReportIDExample: 'Report ID: {report:id}',
                customNameTotalExample: 'Totale: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Impedisci ai membri di modificare i nomi dei report personalizzati',
                preventSelfApprovalsTitle: 'Impedisci auto-approvazioni',
                preventSelfApprovalsSubtitle: 'Impedisci ai membri del workspace di approvare i propri report di spesa.',
                autoApproveCompliantReportsTitle: 'Approva automaticamente i rapporti conformi',
                autoApproveCompliantReportsSubtitle: "Configura quali report di spesa sono idonei per l'approvazione automatica.",
                autoApproveReportsUnderTitle: 'Approvare automaticamente i rapporti sotto',
                autoApproveReportsUnderDescription: 'I rapporti spese completamente conformi sotto questo importo saranno approvati automaticamente.',
                randomReportAuditTitle: 'Verifica casuale del report',
                randomReportAuditDescription: "Richiedi che alcuni rapporti siano approvati manualmente, anche se idonei per l'approvazione automatica.",
                autoPayApprovedReportsTitle: 'Rapporti approvati con pagamento automatico',
                autoPayApprovedReportsSubtitle: 'Configura quali report di spesa sono idonei per il pagamento automatico.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Per favore inserisci un importo inferiore a ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Vai su altre funzionalità e abilita i flussi di lavoro, quindi aggiungi i pagamenti per sbloccare questa funzione.',
                autoPayReportsUnderTitle: 'Rapporti di pagamento automatico sotto',
                autoPayReportsUnderDescription: 'I rapporti spese completamente conformi sotto questo importo verranno pagati automaticamente.',
                unlockFeatureGoToSubtitle: 'Vai a',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) => `e abilita i flussi di lavoro, quindi aggiungi ${featureName} per sbloccare questa funzione.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `e abilita ${featureName} per sbloccare questa funzione.`,
            },
            categoryRules: {
                title: 'Regole di categoria',
                approver: 'Approvante',
                requireDescription: 'Richiede descrizione',
                descriptionHint: 'Suggerimento descrizione',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Ricorda ai dipendenti di fornire informazioni aggiuntive per la spesa di “${categoryName}”. Questo suggerimento appare nel campo descrizione delle spese.`,
                descriptionHintLabel: 'Suggerimento',
                descriptionHintSubtitle: 'Suggerimento: Più è breve, meglio è!',
                maxAmount: 'Importo massimo',
                flagAmountsOver: 'Segnala importi superiori a',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Si applica alla categoria "${categoryName}".`,
                flagAmountsOverSubtitle: "Questo sostituisce l'importo massimo per tutte le spese.",
                expenseLimitTypes: {
                    expense: 'Spesa individuale',
                    expenseSubtitle:
                        "Contrassegna gli importi delle spese per categoria. Questa regola sostituisce la regola generale dello spazio di lavoro per l'importo massimo delle spese.",
                    daily: 'Totale categoria',
                    dailySubtitle: 'Segnala la spesa totale per categoria per ogni rapporto di spesa.',
                },
                requireReceiptsOver: 'Richiedi ricevute superiori a',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Predefinito`,
                    never: 'Non richiedere mai ricevute',
                    always: 'Richiedi sempre le ricevute',
                },
                defaultTaxRate: 'Aliquota fiscale predefinita',
                goTo: 'Vai a',
                andEnableWorkflows: 'e abilita i flussi di lavoro, quindi aggiungi approvazioni per sbloccare questa funzione.',
            },
            customRules: {
                title: 'Regole personalizzate',
                subtitle: 'Descrizione',
                description: 'Inserisci regole personalizzate per i report di spesa',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Raccogliere',
                    description: 'Per i team che cercano di automatizzare i loro processi.',
                },
                corporate: {
                    label: 'Controllo',
                    description: 'Per organizzazioni con requisiti avanzati.',
                },
            },
            description: 'Scegli un piano che fa per te. Per un elenco dettagliato delle funzionalità e dei prezzi, consulta il nostro',
            subscriptionLink: 'tipi di piano e pagina di aiuto sui prezzi',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Ti sei impegnato per 1 membro attivo sul piano Control fino alla scadenza del tuo abbonamento annuale il ${annualSubscriptionEndDate}. Puoi passare all'abbonamento a consumo e effettuare il downgrade al piano Collect a partire dal ${annualSubscriptionEndDate} disabilitando il rinnovo automatico in`,
                other: `Hai impegnato ${count} membri attivi nel piano Control fino alla fine del tuo abbonamento annuale il ${annualSubscriptionEndDate}. Puoi passare all'abbonamento a consumo e fare il downgrade al piano Collect a partire dal ${annualSubscriptionEndDate} disabilitando il rinnovo automatico in`,
            }),
            subscriptions: 'Abbonamenti',
        },
    },
    getAssistancePage: {
        title: 'Ottieni assistenza',
        subtitle: 'Siamo qui per spianare la tua strada verso la grandezza!',
        description: 'Scegli tra le opzioni di supporto qui sotto:',
        chatWithConcierge: 'Chatta con Concierge',
        scheduleSetupCall: 'Pianifica una chiamata di configurazione',
        scheduleACall: 'Pianifica chiamata',
        questionMarkButtonTooltip: 'Ottieni assistenza dal nostro team',
        exploreHelpDocs: 'Esplora i documenti di aiuto',
        registerForWebinar: 'Registrati per il webinar',
        onboardingHelp: "Assistenza per l'integrazione",
    },
    emojiPicker: {
        skinTonePickerLabel: 'Cambia il tono della pelle predefinito',
        headers: {
            frequentlyUsed: 'Frequentemente usato',
            smileysAndEmotion: 'Smileys & Emozioni',
            peopleAndBody: 'Persone e Corpo',
            animalsAndNature: 'Animali e Natura',
            foodAndDrink: 'Cibo e Bevande',
            travelAndPlaces: 'Viaggi e Luoghi',
            activities: 'Attività',
            objects: 'Oggetti',
            symbols: 'Simboli',
            flags: 'Bandiere',
        },
    },
    newRoomPage: {
        newRoom: 'Nuova stanza',
        groupName: 'Nome del gruppo',
        roomName: 'Nome della stanza',
        visibility: 'Visibilità',
        restrictedDescription: 'Le persone nel tuo spazio di lavoro possono trovare questa stanza',
        privateDescription: 'Le persone invitate a questa stanza possono trovarla',
        publicDescription: 'Chiunque può trovare questa stanza',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Chiunque può trovare questa stanza',
        createRoom: 'Crea stanza',
        roomAlreadyExistsError: 'Una stanza con questo nome esiste già',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} è una stanza predefinita in tutti gli spazi di lavoro. Si prega di scegliere un altro nome.`,
        roomNameInvalidError: 'I nomi delle stanze possono includere solo lettere minuscole, numeri e trattini',
        pleaseEnterRoomName: 'Per favore inserisci un nome per la stanza',
        pleaseSelectWorkspace: "Seleziona un'area di lavoro per favore",
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport
                ? `${actor} rinominato in "${newName}" (precedentemente "${oldName}")`
                : `${actor} ha rinominato questa stanza in "${newName}" (precedentemente "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Stanza rinominata in ${newName}`,
        social: 'sociale',
        selectAWorkspace: "Seleziona un'area di lavoro",
        growlMessageOnRenameError: 'Impossibile rinominare la stanza del workspace. Controlla la tua connessione e riprova.',
        visibilityOptions: {
            restricted: 'Spazio di lavoro', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privato',
            public: 'Pubblico',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Annuncio pubblico',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Invia e Chiudi',
        submitAndApprove: 'Invia e Approva',
        advanced: 'AVANZATO',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `aggiunto ${approverName} (${approverEmail}) come approvatore per il ${field} "${name}"`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `rimosso ${approverName} (${approverEmail}) come approvatore per il ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `ha cambiato l'approvatore per il ${field} "${name}" a ${formatApprover(newApproverName, newApproverEmail)} (precedentemente ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `ha aggiunto la categoria "${categoryName}"`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `rimosso la categoria "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'disabilitato' : 'abilitato'} la categoria "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `aggiunto il codice di retribuzione "${newValue}" alla categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `rimosso il codice di payroll "${oldValue}" dalla categoria "${categoryName}"`;
            }
            return `ha cambiato il codice payroll della categoria "${categoryName}" in “${newValue}” (precedentemente “${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `ha aggiunto il codice GL "${newValue}" alla categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `rimosso il codice GL "${oldValue}" dalla categoria "${categoryName}"`;
            }
            return `ha cambiato il codice GL della categoria “${categoryName}” in “${newValue}” (precedentemente “${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `ha cambiato la descrizione della categoria "${categoryName}" in ${!oldValue ? 'richiesto' : 'non richiesto'} (precedentemente ${!oldValue ? 'non richiesto' : 'richiesto'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `ha aggiunto un importo massimo di ${newAmount} alla categoria "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `rimosso l'importo massimo di ${oldAmount} dalla categoria "${categoryName}"`;
            }
            return `ha modificato l'importo massimo della categoria "${categoryName}" a ${newAmount} (precedentemente ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `ha aggiunto un tipo di limite di ${newValue} alla categoria "${categoryName}"`;
            }
            return `ha cambiato il tipo di limite della categoria "${categoryName}" a ${newValue} (precedentemente ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `aggiornata la categoria "${categoryName}" cambiando Ricevute in ${newValue}`;
            }
            return `ha cambiato la categoria "${categoryName}" in ${newValue} (precedentemente ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `rinominato la categoria "${oldName}" in "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `rimosso il suggerimento di descrizione "${oldValue}" dalla categoria "${categoryName}"`;
            }
            return !oldValue
                ? `aggiunto il suggerimento della descrizione "${newValue}" alla categoria "${categoryName}"`
                : `ha cambiato il suggerimento della descrizione della categoria "${categoryName}" in "${newValue}" (precedentemente "${oldValue}")`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `ha cambiato il nome dell'elenco di tag in "${newName}" (precedentemente "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `ha aggiunto il tag "${tagName}" alla lista "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `aggiornato l'elenco dei tag "${tagListName}" cambiando il tag "${oldName}" in "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'abilitato' : 'disabilitato'} il tag "${tagName}" nella lista "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `rimosso il tag "${tagName}" dalla lista "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `rimosso "${count}" tag dall'elenco "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `aggiornato il tag "${tagName}" nella lista "${tagListName}" cambiando il ${updatedField} in "${newValue}" (precedentemente "${oldValue}")`;
            }
            return `aggiornato il tag "${tagName}" nella lista "${tagListName}" aggiungendo un ${updatedField} di "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `ha cambiato il ${customUnitName} ${updatedField} in "${newValue}" (precedentemente "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Tracciamento fiscale ${newValue ? 'abilitato' : 'disabilitato'} sui tassi di distanza`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `aggiunto un nuovo tasso "${customUnitName}" "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `ha modificato la tariffa del ${customUnitName} ${updatedField} "${customUnitRateName}" a "${newValue}" (precedentemente "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `ha modificato l'aliquota fiscale sulla tariffa di distanza "${customUnitRateName}" a "${newValue} (${newTaxPercentage})" (precedentemente "${oldValue} (${oldTaxPercentage})")`;
            }
            return `ha aggiunto l'aliquota fiscale "${newValue} (${newTaxPercentage})" alla tariffa di distanza "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `ha modificato la parte recuperabile delle tasse sulla tariffa di distanza "${customUnitRateName}" a "${newValue}" (in precedenza "${oldValue}")`;
            }
            return `ha aggiunto una parte recuperabile di tasse di "${newValue}" alla tariffa di distanza "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `rimosso il tasso "${rateName}" di "${customUnitName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `aggiunto campo di report ${fieldType} "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `imposta il valore predefinito del campo del report "${fieldName}" su "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `aggiunto l'opzione "${optionName}" al campo del report "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `rimosso l'opzione "${optionName}" dal campo del report "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'abilitato' : 'disabilitato'} l'opzione "${optionName}" per il campo del rapporto "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'abilitato' : 'disabilitato'} tutte le opzioni per il campo del report "${fieldName}"`;
            }
            return `${allEnabled ? 'abilitato' : 'disabilitato'} l'opzione "${optionName}" per il campo del report "${fieldName}", rendendo tutte le opzioni ${allEnabled ? 'abilitato' : 'disabilitato'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `rimosso il campo del report ${fieldType} "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `aggiornato "Prevent self-approval" a "${newValue === 'true' ? 'Abilitato' : 'Disabilitato'}" (precedentemente "${oldValue === 'true' ? 'Abilitato' : 'Disabilitato'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `ha modificato l'importo massimo richiesto per la spesa con ricevuta a ${newValue} (precedentemente ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `ha modificato l'importo massimo della spesa per le violazioni a ${newValue} (precedentemente ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aggiornato "Età massima della spesa (giorni)" a "${newValue}" (precedentemente "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `imposta la data di invio del rapporto mensile su "${newValue}"`;
            }
            return `aggiornata la data di presentazione del rapporto mensile a "${newValue}" (precedentemente "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aggiornato "Riaddebita le spese ai clienti" a "${newValue}" (precedentemente "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `trasformato "Imponi titoli di report predefiniti" ${value ? 'su' : 'spento'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) =>
            `ha aggiornato il nome di questo spazio di lavoro in "${newName}" (precedentemente "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `imposta la descrizione di questo spazio di lavoro su "${newDescription}"`
                : `ha aggiornato la descrizione di questo spazio di lavoro a "${newDescription}" (precedentemente "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('e');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `ti ha rimosso dal flusso di approvazione e dalla chat delle spese di ${joinedNames}. I rapporti precedentemente inviati rimarranno disponibili per l'approvazione nella tua Posta in arrivo.`,
                other: `ti ha rimosso dai flussi di approvazione e dalle chat delle spese di ${joinedNames}. I report inviati in precedenza rimarranno disponibili per l'approvazione nella tua Posta in arrivo.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `aggiornato il tuo ruolo in ${policyName} da ${oldRole} a utente. Sei stato rimosso da tutte le chat delle spese dei presentatori tranne la tua.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `aggiornata la valuta predefinita a ${newCurrency} (precedentemente ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `aggiornata la frequenza di auto-reporting a "${newFrequency}" (precedentemente "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `aggiornata la modalità di approvazione a "${newValue}" (precedentemente "${oldValue}")`,
        upgradedWorkspace: 'ha aggiornato questo spazio di lavoro al piano Control',
        downgradedWorkspace: 'ha declassato questo spazio di lavoro al piano Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `ha cambiato la percentuale di rapporti instradati casualmente per l'approvazione manuale a ${Math.round(newAuditRate * 100)}% (precedentemente ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `ha cambiato il limite di approvazione manuale per tutte le spese a ${newLimit} (precedentemente ${oldLimit})`,
    },
    roomMembersPage: {
        memberNotFound: 'Membro non trovato.',
        useInviteButton: 'Per invitare un nuovo membro alla chat, utilizza il pulsante di invito sopra.',
        notAuthorized: `Non hai accesso a questa pagina. Se stai cercando di unirti a questa stanza, chiedi a un membro della stanza di aggiungerti. Qualcos'altro? Contatta ${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Sei sicuro di voler rimuovere ${memberName} dalla stanza?`,
            other: 'Sei sicuro di voler rimuovere i membri selezionati dalla stanza?',
        }),
        error: {
            genericAdd: "Si è verificato un problema nell'aggiungere questo membro alla stanza",
        },
    },
    newTaskPage: {
        assignTask: 'Assegna compito',
        assignMe: 'Assegna a me',
        confirmTask: 'Conferma attività',
        confirmError: 'Inserisci un titolo e seleziona una destinazione di condivisione',
        descriptionOptional: 'Descrizione (facoltativa)',
        pleaseEnterTaskName: 'Per favore inserisci un titolo',
        pleaseEnterTaskDestination: 'Seleziona dove desideri condividere questo compito',
    },
    task: {
        task: 'Compito',
        title: 'Titolo',
        description: 'Descrizione',
        assignee: 'Assegnatario',
        completed: 'Completato',
        action: 'Completa',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `attività per ${title}`,
            completed: 'contrassegnato come completato',
            canceled: 'attività eliminata',
            reopened: 'contrassegnato come incompleto',
            error: "Non hai il permesso di eseguire l'azione richiesta.",
        },
        markAsComplete: 'Segna come completato',
        markAsIncomplete: 'Segna come incompleto',
        assigneeError: "Si è verificato un errore durante l'assegnazione di questo compito. Si prega di provare con un altro assegnatario.",
        genericCreateTaskFailureMessage: 'Si è verificato un errore durante la creazione di questa attività. Per favore riprova più tardi.',
        deleteTask: 'Elimina attività',
        deleteConfirmation: 'Sei sicuro di voler eliminare questo compito?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Estratto conto di ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Scorciatoie da tastiera',
        subtitle: 'Risparmia tempo con queste utili scorciatoie da tastiera:',
        shortcuts: {
            openShortcutDialog: 'Apre la finestra di dialogo delle scorciatoie da tastiera',
            markAllMessagesAsRead: 'Segna tutti i messaggi come letti',
            escape: 'Fuggi dialoghi',
            search: 'Apri la finestra di dialogo di ricerca',
            newChat: 'Nuova schermata chat',
            copy: 'Copia commento',
            openDebug: 'Apri la finestra di dialogo delle preferenze di test',
        },
    },
    guides: {
        screenShare: 'Condivisione schermo',
        screenShareRequest: 'Expensify ti invita a condividere lo schermo',
    },
    search: {
        resultsAreLimited: 'I risultati della ricerca sono limitati.',
        viewResults: 'Visualizza risultati',
        resetFilters: 'Reimposta filtri',
        searchResults: {
            emptyResults: {
                title: 'Niente da mostrare',
                subtitle: 'Prova a modificare i criteri di ricerca o a creare qualcosa con il pulsante verde +.',
            },
            emptyExpenseResults: {
                title: 'Non hai ancora creato nessuna spesa.',
                subtitle: 'Crea una spesa o fai un giro di prova di Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per creare una spesa.',
            },
            emptyReportResults: {
                title: 'Non hai ancora creato alcun report',
                subtitle: 'Crea un report o fai un test drive di Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per creare un rapporto.',
            },
            emptyInvoiceResults: {
                title: 'Non hai ancora creato nessuna fattura.',
                subtitle: 'Invia una fattura o fai un test drive di Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Utilizza il pulsante verde qui sotto per inviare una fattura.',
            },
            emptyTripResults: {
                title: 'Nessun viaggio da visualizzare',
                subtitle: 'Inizia prenotando il tuo primo viaggio qui sotto.',
                buttonText: 'Prenota un viaggio',
            },
            emptySubmitResults: {
                title: 'Nessuna spesa da inviare',
                subtitle: 'Tutto chiaro. Fai un giro di vittoria!',
                buttonText: 'Crea rapporto',
            },
            emptyApproveResults: {
                title: 'Nessuna spesa da approvare',
                subtitle: 'Zero spese. Massimo relax. Ben fatto!',
            },
            emptyPayResults: {
                title: 'Nessuna spesa da pagare',
                subtitle: 'Congratulazioni! Hai tagliato il traguardo.',
            },
            emptyExportResults: {
                title: 'Nessuna spesa da esportare',
                subtitle: 'È ora di rilassarsi, bel lavoro.',
            },
            emptyUnapprovedResults: {
                title: 'Nessuna spesa da approvare',
                subtitle: 'Zero spese. Massimo relax. Ben fatto!',
            },
        },
        unapproved: 'Non approvato',
        unapprovedCash: 'Contanti non approvati',
        unapprovedCompanyCards: 'Carte aziendali non approvate',
        saveSearch: 'Salva ricerca',
        deleteSavedSearch: 'Elimina ricerca salvata',
        deleteSavedSearchConfirm: 'Sei sicuro di voler eliminare questa ricerca?',
        searchName: 'Cerca nome',
        savedSearchesMenuItemTitle: 'Salvato',
        groupedExpenses: 'spese raggruppate',
        bulkActions: {
            approve: 'Approva',
            pay: 'Paga',
            delete: 'Elimina',
            hold: 'Attendere',
            unhold: 'Rimuovi blocco',
            noOptionsAvailable: 'Nessuna opzione disponibile per il gruppo di spese selezionato.',
        },
        filtersHeader: 'Filtri',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Prima di ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `After ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Mai',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Ultimo mese',
                },
            },
            status: 'Stato',
            keyword: 'Parola chiave',
            hasKeywords: 'Contiene parole chiave',
            currency: 'Valuta',
            link: 'Link',
            pinned: 'Aggiunto ai preferiti',
            unread: 'Non letto',
            completed: 'Completato',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Meno di ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Maggiore di ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Tra ${greaterThan} e ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Carte individuali',
                closedCards: 'Carte chiuse',
                cardFeeds: 'Feed delle carte',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Tutto ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Tutte le carte importate CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Corrente',
            past: 'Passato',
            submitted: 'Data di invio',
            approved: 'Data approvata',
            paid: 'Data di pagamento',
            exported: 'Data esportata',
            posted: 'Data di pubblicazione',
            billable: 'Fatturabile',
            reimbursable: 'Rimborsabile',
            groupBy: {
                reports: 'Rapporto',
                members: 'Membro',
                cards: 'Carta',
            },
        },
        groupBy: 'Gruppo per',
        moneyRequestReport: {
            emptyStateTitle: 'Questo report non ha spese.',
            emptyStateSubtitle: 'Puoi aggiungere spese a questo rapporto utilizzando il pulsante sopra.',
        },
        noCategory: 'Nessuna categoria',
        noTag: 'Nessun tag',
        expenseType: 'Tipo di spesa',
        recentSearches: 'Ricerche recenti',
        recentChats: 'Chat recenti',
        searchIn: 'Cerca in',
        searchPlaceholder: 'Cerca qualcosa',
        suggestions: 'Suggerimenti',
        exportSearchResults: {
            title: 'Crea esportazione',
            description: 'Wow, sono molti articoli! Li raggrupperemo e Concierge ti invierà un file a breve.',
        },
        exportAll: {
            selectAllMatchingItems: 'Seleziona tutti gli elementi corrispondenti',
            allMatchingItemsSelected: 'Tutti gli elementi corrispondenti selezionati',
        },
    },
    genericErrorPage: {
        title: 'Uh-oh, qualcosa è andato storto!',
        body: {
            helpTextMobile: "Chiudi e riapri l'app, oppure passa a",
            helpTextWeb: 'web.',
            helpTextConcierge: 'Se il problema persiste, contatta',
        },
        refresh: 'Aggiorna',
    },
    fileDownload: {
        success: {
            title: 'Scaricato!',
            message: 'Allegato scaricato con successo!',
            qrMessage:
                'Controlla la cartella delle foto o dei download per una copia del tuo codice QR. Suggerimento: Aggiungilo a una presentazione affinché il tuo pubblico possa scansionarlo e connettersi direttamente con te.',
        },
        generalError: {
            title: 'Errore allegato',
            message: "Impossibile scaricare l'allegato",
        },
        permissionError: {
            title: 'Accesso allo storage',
            message: 'Expensify non può salvare gli allegati senza accesso alla memoria. Tocca impostazioni per aggiornare i permessi.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nuovo Expensify',
        about: 'Informazioni su New Expensify',
        update: 'Aggiorna New Expensify',
        checkForUpdates: 'Controlla aggiornamenti',
        toggleDevTools: 'Attiva/Disattiva Strumenti per Sviluppatori',
        viewShortcuts: 'Visualizza le scorciatoie da tastiera',
        services: 'Servizi',
        hide: 'Nascondi New Expensify',
        hideOthers: 'Nascondi altri',
        showAll: 'Mostra tutto',
        quit: 'Esci da New Expensify',
        fileMenu: 'File',
        closeWindow: 'Chiudi finestra',
        editMenu: 'Modifica',
        undo: 'Annulla',
        redo: 'Rifare',
        cut: 'Tagliare',
        copy: 'Copiare',
        paste: 'Incolla',
        pasteAndMatchStyle: 'Incolla e Adatta Stile',
        pasteAsPlainText: 'Incolla come testo normale',
        delete: 'Elimina',
        selectAll: 'Seleziona tutto',
        speechSubmenu: 'Discorso',
        startSpeaking: 'Inizia a parlare',
        stopSpeaking: 'Smettila di parlare',
        viewMenu: 'Visualizza',
        reload: 'Ricarica',
        forceReload: 'Forza Ricarica',
        resetZoom: 'Dimensione reale',
        zoomIn: 'Ingrandisci',
        zoomOut: 'Riduci lo zoom',
        togglefullscreen: 'Attiva/disattiva schermo intero',
        historyMenu: 'Cronologia',
        back: 'Indietro',
        forward: 'Inoltra',
        windowMenu: 'Finestra',
        minimize: 'Minimizza',
        zoom: 'Zoom',
        front: 'Porta tutto in primo piano',
        helpMenu: 'Aiuto',
        learnMore: 'Scopri di più',
        documentation: 'Documentazione',
        communityDiscussions: 'Discussioni della Comunità',
        searchIssues: 'Cerca Problemi',
    },
    historyMenu: {
        forward: 'Inoltra',
        back: 'Indietro',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Aggiornamento disponibile',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `La nuova versione sarà disponibile a breve.${!isSilentUpdating ? "Ti avviseremo quando saremo pronti per l'aggiornamento." : ''}`,
            soundsGood: 'Sembra buono',
        },
        notAvailable: {
            title: 'Aggiornamento non disponibile',
            message: 'Non ci sono aggiornamenti disponibili al momento. Si prega di ricontrollare più tardi!',
            okay: 'Okay',
        },
        error: {
            title: 'Aggiornamento del controllo fallito',
            message: "Non siamo riusciti a verificare la presenza di un aggiornamento. Riprova tra un po'.",
        },
    },
    report: {
        newReport: {
            createReport: 'Crea rapporto',
            chooseWorkspace: "Scegli un'area di lavoro per questo report.",
        },
        genericCreateReportFailureMessage: 'Errore imprevisto durante la creazione di questa chat. Si prega di riprovare più tardi.',
        genericAddCommentFailureMessage: 'Errore imprevisto durante la pubblicazione del commento. Per favore riprova più tardi.',
        genericUpdateReportFieldFailureMessage: "Errore imprevisto durante l'aggiornamento del campo. Si prega di riprovare più tardi.",
        genericUpdateReportNameEditFailureMessage: 'Errore imprevisto durante la rinomina del rapporto. Per favore riprova più tardi.',
        noActivityYet: 'Nessuna attività ancora',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `modificato ${fieldName} da ${oldValue} a ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `modificato ${fieldName} in ${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `cambiato l'area di lavoro in ${toPolicyName}${fromPolicyName ? `(in precedenza ${fromPolicyName})` : ''}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `cambiato tipo da ${oldType} a ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `inviato questo rapporto a ${delegateUser} poiché ${originalManager} è in vacanza`,
                exportedToCSV: `esportato in CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `esportato in ${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `esportato su ${label} tramite`,
                    automaticActionTwo: 'impostazioni contabili',
                    manual: ({label}: ExportedToIntegrationParams) => `ha contrassegnato questo report come esportato manualmente su ${label}.`,
                    automaticActionThree: 'e creato con successo un record per',
                    reimburseableLink: 'spese personali',
                    nonReimbursableLink: 'spese con carta aziendale',
                    pending: ({label}: ExportedToIntegrationParams) => `iniziato a esportare questo report su ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `impossibile esportare questo report su ${label} ("${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `ha aggiunto una ricevuta`,
                managerDetachReceipt: `rimosso una ricevuta`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `pagato ${currency}${amount} altrove`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `pagato ${currency}${amount} tramite integrazione`,
                outdatedBankAccount: `impossibile elaborare il pagamento a causa di un problema con il conto bancario del pagatore`,
                reimbursementACHBounce: `impossibile elaborare il pagamento, poiché il pagatore non ha fondi sufficienti`,
                reimbursementACHCancelled: `annullato il pagamento`,
                reimbursementAccountChanged: `non è stato possibile elaborare il pagamento, poiché il pagatore ha cambiato conto bancario`,
                reimbursementDelayed: `elaborato il pagamento ma è in ritardo di 1-2 giorni lavorativi in più`,
                selectedForRandomAudit: `selezionato casualmente per la revisione`,
                selectedForRandomAuditMarkdown: `[selezionato casualmente](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) per revisione`,
                share: ({to}: ShareParams) => `membro invitato ${to}`,
                unshare: ({to}: UnshareParams) => `membro rimosso ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `pagato ${currency}${amount}`,
                takeControl: `ha preso il controllo`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `impossibile sincronizzarsi con ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `aggiunto ${email} come ${role === 'member' ? 'a' : 'un/una (depending on the context)'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `ha aggiornato il ruolo di ${email} a ${newRole} (precedentemente ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `rimosso il campo personalizzato 1 di ${email} (precedentemente "${previousValue}")`;
                    }
                    return !previousValue
                        ? `aggiunto "${newValue}" al campo personalizzato 1 di ${email}`
                        : `ha cambiato il campo personalizzato 1 di ${email} in "${newValue}" (precedentemente "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `rimosso il campo personalizzato 2 di ${email} (precedentemente "${previousValue}")`;
                    }
                    return !previousValue
                        ? `aggiunto "${newValue}" al campo personalizzato 2 di ${email}`
                        : `ha cambiato il campo personalizzato 2 di ${email} in "${newValue}" (precedentemente "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} ha lasciato lo spazio di lavoro`,
                removeMember: ({email, role}: AddEmployeeParams) => `rimosso ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `rimosso il collegamento a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `connesso a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'ha lasciato la chat',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} per ${dayCount} ${dayCount === 1 ? 'giorno' : 'giorni'} fino al ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} da ${timePeriod} il ${date}`,
    },
    footer: {
        features: 'Caratteristiche',
        expenseManagement: 'Gestione delle spese',
        spendManagement: 'Gestione delle Spese',
        expenseReports: 'Report di spesa',
        companyCreditCard: 'Carta di Credito Aziendale',
        receiptScanningApp: 'App di scansione ricevute',
        billPay: 'Bill Pay',
        invoicing: 'Fatturazione',
        CPACard: 'Carta CPA',
        payroll: 'Payroll',
        travel: 'Viaggio',
        resources: 'Risorse',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Press Kit',
        support: 'Supporto',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Termini di Servizio',
        privacy: 'Privacy',
        learnMore: 'Scopri di più',
        aboutExpensify: 'Informazioni su Expensify',
        blog: 'Blog',
        jobs: 'Lavori',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Investor Relations',
        getStarted: 'Inizia',
        createAccount: 'Crea un nuovo account',
        logIn: 'Accedi',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: "Torna all'elenco delle chat",
        chatWelcomeMessage: 'Messaggio di benvenuto in chat',
        navigatesToChat: 'Naviga a una chat',
        newMessageLineIndicator: 'Indicatore di nuova linea di messaggio',
        chatMessage: 'Messaggio di chat',
        lastChatMessagePreview: "Anteprima dell'ultimo messaggio della chat",
        workspaceName: 'Nome del workspace',
        chatUserDisplayNames: 'Nomi visualizzati dei membri della chat',
        scrollToNewestMessages: 'Scorri ai messaggi più recenti',
        preStyledText: 'Testo pre-stilizzato',
        viewAttachment: 'Visualizza allegato',
    },
    parentReportAction: {
        deletedReport: 'Rapporto eliminato',
        deletedMessage: 'Messaggio eliminato',
        deletedExpense: 'Spesa eliminata',
        reversedTransaction: 'Transazione annullata',
        deletedTask: 'Attività eliminata',
        hiddenMessage: 'Messaggio nascosto',
    },
    threads: {
        thread: 'Discussione',
        replies: 'Risposte',
        reply: 'Rispondi',
        from: 'Da',
        in: 'in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `Da ${reportName}${workspaceName ? `in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'Copia URL',
        copied: 'Copiato!',
    },
    moderation: {
        flagDescription: 'Tutti i messaggi contrassegnati saranno inviati a un moderatore per la revisione.',
        chooseAReason: 'Scegli un motivo per segnalare qui sotto:',
        spam: 'Spam',
        spamDescription: 'Promozione non richiesta fuori tema',
        inconsiderate: 'Sconsiderato',
        inconsiderateDescription: 'Frasi offensive o irrispettose, con intenzioni discutibili',
        intimidation: 'Intimidazione',
        intimidationDescription: "Perseguire aggressivamente un'agenda nonostante obiezioni valide",
        bullying: 'Bullismo',
        bullyingDescription: 'Prendere di mira un individuo per ottenere obbedienza',
        harassment: 'Molestia',
        harassmentDescription: 'Comportamento razzista, misogino o altrimenti ampiamente discriminatorio',
        assault: 'Aggressione',
        assaultDescription: "Attacco emotivo mirato specificamente con l'intenzione di nuocere",
        flaggedContent: 'Questo messaggio è stato segnalato per violazione delle nostre regole della comunità e il contenuto è stato nascosto.',
        hideMessage: 'Nascondi messaggio',
        revealMessage: 'Rivela messaggio',
        levelOneResult: 'Invia un avviso anonimo e il messaggio viene segnalato per la revisione.',
        levelTwoResult: 'Messaggio nascosto dal canale, più avviso anonimo e il messaggio è segnalato per revisione.',
        levelThreeResult: 'Messaggio rimosso dal canale più avviso anonimo e messaggio segnalato per revisione.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Invitali',
        nothing: 'Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accetta',
        decline: 'Rifiuta',
    },
    actionableMentionTrackExpense: {
        submit: 'Invialo a qualcuno',
        categorize: 'Categorizzalo',
        share: 'Condividilo con il mio commercialista',
        nothing: 'Niente per ora',
    },
    teachersUnitePage: {
        teachersUnite: 'Insegnanti Uniti',
        joinExpensifyOrg:
            'Unisciti a Expensify.org nell\'eliminare le ingiustizie nel mondo. L\'attuale campagna "Teachers Unite" supporta gli educatori ovunque dividendo i costi dei materiali scolastici essenziali.',
        iKnowATeacher: 'Conosco un insegnante',
        iAmATeacher: 'Sono un insegnante',
        getInTouch: 'Eccellente! Per favore condividi le loro informazioni così possiamo metterci in contatto con loro.',
        introSchoolPrincipal: 'Introduzione al tuo preside',
        schoolPrincipalVerifyExpense:
            "Expensify.org divide il costo dei materiali scolastici essenziali affinché gli studenti provenienti da famiglie a basso reddito possano avere un'esperienza di apprendimento migliore. Il tuo preside sarà invitato a verificare le tue spese.",
        principalFirstName: 'Nome principale',
        principalLastName: 'Cognome del preside',
        principalWorkEmail: 'Email di lavoro principale',
        updateYourEmail: 'Aggiorna il tuo indirizzo email',
        updateEmail: 'Aggiorna indirizzo email',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `Prima di procedere, assicurati di impostare la tua email scolastica come metodo di contatto predefinito. Puoi farlo in Impostazioni > Profilo > <a href="${contactMethodsRoute}">Metodi di contatto</a>.`,
        error: {
            enterPhoneEmail: "Inserisci un'email o un numero di telefono valido",
            enterEmail: "Inserisci un'email",
            enterValidEmail: "Inserisci un'email valida",
            tryDifferentEmail: "Per favore, prova un'email diversa",
        },
    },
    cardTransactions: {
        notActivated: 'Non attivato',
        outOfPocket: 'Spese personali',
        companySpend: 'Spese aziendali',
    },
    distance: {
        addStop: 'Aggiungi fermata',
        deleteWaypoint: 'Elimina waypoint',
        deleteWaypointConfirmation: 'Sei sicuro di voler eliminare questo punto di passaggio?',
        address: 'Indirizzo',
        waypointDescription: {
            start: 'Inizia',
            stop: 'Ferma',
        },
        mapPending: {
            title: 'Mappa in sospeso',
            subtitle: 'La mappa verrà generata quando torni online',
            onlineSubtitle: 'Un momento mentre configuriamo la mappa',
            errorTitle: 'Errore della mappa',
            errorSubtitle: 'Si è verificato un errore durante il caricamento della mappa. Per favore riprova.',
        },
        error: {
            selectSuggestedAddress: 'Seleziona un indirizzo suggerito o usa la posizione attuale',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Pagella persa o danneggiata',
        nextButtonLabel: 'Successivo',
        reasonTitle: 'Perché hai bisogno di una nuova carta?',
        cardDamaged: 'La mia carta è stata danneggiata',
        cardLostOrStolen: 'La mia carta è stata persa o rubata',
        confirmAddressTitle: "Conferma l'indirizzo di spedizione per la tua nuova carta.",
        cardDamagedInfo: 'La tua nuova carta arriverà in 2-3 giorni lavorativi. La tua carta attuale continuerà a funzionare fino a quando non attiverai quella nuova.',
        cardLostOrStolenInfo: "La tua carta attuale verrà disattivata permanentemente non appena l'ordine sarà effettuato. La maggior parte delle carte arriva in pochi giorni lavorativi.",
        address: 'Indirizzo',
        deactivateCardButton: 'Disattiva carta',
        shipNewCardButton: 'Spedisci nuova carta',
        addressError: 'Indirizzo richiesto',
        successTitle: 'La tua nuova carta è in arrivo!',
        successDescription: "Dovrai attivarla quando arriverà tra pochi giorni lavorativi. Nel frattempo, la tua carta virtuale è pronta all'uso.",
        reasonError: 'Il motivo è obbligatorio',
    },
    eReceipt: {
        guaranteed: 'eReceipt garantito',
        transactionDate: 'Data della transazione',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'Avvia una chat,',
            buttonText2: 'consiglia un amico.',
            header: 'Inizia una chat, invita un amico',
            body: 'Vuoi che i tuoi amici usino Expensify, anche loro? Inizia una chat con loro e ci occuperemo del resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Invia una spesa,',
            buttonText2: 'riferisci il tuo capo.',
            header: 'Invia una spesa, riferisci al tuo capo',
            body: 'Vuoi che anche il tuo capo usi Expensify? Basta inviare loro una spesa e ci occuperemo del resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Segnala un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Basta chattare, pagare o dividere una spesa con loro e ci occuperemo noi del resto. Oppure condividi semplicemente il tuo link di invito!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Segnala un amico',
            header: 'Segnala un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Basta chattare, pagare o dividere una spesa con loro e ci occuperemo noi del resto. Oppure condividi semplicemente il tuo link di invito!',
        },
        copyReferralLink: 'Copia il link di invito',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Chatta con il tuo specialista di configurazione in',
            phrase2: 'per assistenza',
        },
        default: {
            phrase1: 'Messaggio',
            phrase2: 'per assistenza con la configurazione',
        },
    },
    violations: {
        allTagLevelsRequired: 'Tutti i tag richiesti',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) => `${rejectedBy} ha rifiutato questa spesa con il commento "${rejectReason}"`,
        billableExpense: 'Fatturabile non più valido',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Receipt required${formattedLimit ? `oltre ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categoria non più valida',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Applicata una maggiorazione di conversione del ${surcharge}%`,
        customUnitOutOfPolicy: 'Tariffa non valida per questo spazio di lavoro',
        duplicatedTransaction: 'Duplicato',
        fieldRequired: 'I campi del report sono obbligatori',
        futureDate: 'Data futura non consentita',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Contrassegnato con un aumento del ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data più vecchia di ${maxAge} giorni`,
        missingCategory: 'Categoria mancante',
        missingComment: 'Descrizione richiesta per la categoria selezionata',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Missing ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return "L'importo differisce dalla distanza calcolata";
                case 'card':
                    return 'Importo superiore alla transazione con carta';
                default:
                    if (displayPercentVariance) {
                        return `Importo ${displayPercentVariance}% superiore alla ricevuta scansionata`;
                    }
                    return 'Importo superiore alla ricevuta scansionata';
            }
        },
        modifiedDate: 'La data differisce dalla ricevuta scansionata',
        nonExpensiworksExpense: 'Spesa non-Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `La spesa supera il limite di approvazione automatica di ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Importo superiore al limite di categoria di ${formattedLimit}/persona`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Importo oltre il limite di ${formattedLimit}/persona`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Importo oltre il limite di ${formattedLimit}/persona`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Importo oltre il limite giornaliero ${formattedLimit}/persona per categoria`,
        receiptNotSmartScanned:
            'Dettagli della spesa e ricevuta aggiunti manualmente. Si prega di verificare i dettagli. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Scopri di più</a> sulla verifica automatica di tutte le ricevute.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = 'Ricevuta richiesta';
            if (formattedLimit ?? category) {
                message += 'oltre';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += 'limite categoria';
                }
            }
            return message;
        },
        prohibitedExpense: ({prohibitedExpenseType}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Spesa vietata:';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return `${preMessage} alcol`;
                case 'gambling':
                    return `${preMessage} gioco d'azzardo`;
                case 'tobacco':
                    return `${preMessage} tabacco`;
                case 'adultEntertainment':
                    return `${preMessage} intrattenimento per adulti`;
                case 'hotelIncidentals':
                    return `${preMessage} spese accessorie dell'hotel`;
                default:
                    return `${preMessage}${prohibitedExpenseType}`;
            }
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: 'Revisione richiesta',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Impossibile associare automaticamente la ricevuta a causa di una connessione bancaria interrotta.';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Impossibile abbinare automaticamente la ricevuta a causa di una connessione bancaria interrotta che ${email} deve risolvere.`
                    : 'Impossibile abbinare automaticamente la ricevuta a causa di una connessione bancaria interrotta che devi risolvere.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Chiedi a ${member} di contrassegnarlo come contante o attendi 7 giorni e riprova` : 'In attesa di unione con la transazione della carta.';
            }
            return '';
        },
        brokenConnection530Error: 'Ricevuta in sospeso a causa di una connessione bancaria interrotta',
        adminBrokenConnectionError: 'Ricevuta in sospeso a causa di una connessione bancaria interrotta. Si prega di risolvere in',
        memberBrokenConnectionError: 'Ricevuta in sospeso a causa di una connessione bancaria interrotta. Si prega di chiedere a un amministratore dello spazio di lavoro di risolvere.',
        markAsCashToIgnore: 'Segna come contante per ignorare e richiedere il pagamento.',
        smartscanFailed: ({canEdit = true}) => `Scansione della ricevuta fallita.${canEdit ? 'Inserisci i dettagli manualmente.' : ''}`,
        receiptGeneratedWithAI: "Ricevuta potenzialmente generata dall'IA",
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Missing ${tagName ?? 'Etichetta'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Etichetta'} non più valido`,
        taxAmountChanged: "L'importo fiscale è stato modificato",
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Tassa'} non più valido`,
        taxRateChanged: "L'aliquota fiscale è stata modificata",
        taxRequired: 'Aliquota fiscale mancante',
        none: 'Nessuno',
        taxCodeToKeep: 'Scegli quale codice fiscale mantenere',
        tagToKeep: 'Scegli quale tag mantenere',
        isTransactionReimbursable: 'Scegli se la transazione è rimborsabile',
        merchantToKeep: 'Scegli quale commerciante mantenere',
        descriptionToKeep: 'Scegli quale descrizione mantenere',
        categoryToKeep: 'Scegli quale categoria mantenere',
        isTransactionBillable: 'Scegli se la transazione è fatturabile',
        keepThisOne: 'Mantieni questo',
        confirmDetails: `Conferma i dettagli che stai conservando`,
        confirmDuplicatesInfo: `Le richieste duplicate che non conservi saranno tenute in attesa che il membro le elimini.`,
        hold: 'Questa spesa è stata messa in sospeso',
        resolvedDuplicates: 'risolto il duplicato',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} è obbligatorio`,
    },
    violationDismissal: {
        rter: {
            manual: 'ha contrassegnato questa ricevuta come contante',
        },
        duplicatedTransaction: {
            manual: 'risolto il duplicato',
        },
    },
    videoPlayer: {
        play: 'Gioca',
        pause: 'Pausa',
        fullscreen: 'Schermo intero',
        playbackSpeed: 'Velocità di riproduzione',
        expand: 'Espandi',
        mute: 'Disattiva audio',
        unmute: "Riattiva l'audio",
        normal: 'Normale',
    },
    exitSurvey: {
        header: 'Prima di andare',
        reasonPage: {
            title: 'Per favore, dicci perché te ne vai',
            subtitle: 'Prima di andare, per favore dicci perché vorresti passare a Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ho bisogno di una funzionalità disponibile solo in Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Non capisco come usare New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Capisco come utilizzare New Expensify, ma preferisco Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Quale funzionalità ti serve che non è disponibile nel nuovo Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Cosa stai cercando di fare?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Perché preferisci Expensify Classic?',
        },
        responsePlaceholder: 'La tua risposta',
        thankYou: 'Grazie per il feedback!',
        thankYouSubtitle: 'Le tue risposte ci aiuteranno a costruire un prodotto migliore per portare a termine le cose. Grazie mille!',
        goToExpensifyClassic: 'Passa a Expensify Classic',
        offlineTitle: 'Sembra che tu sia bloccato qui...',
        offline:
            'Sembra che tu sia offline. Purtroppo, Expensify Classic non funziona offline, ma il Nuovo Expensify sì. Se preferisci usare Expensify Classic, riprova quando hai una connessione internet.',
        quickTip: 'Suggerimento rapido...',
        quickTipSubTitle: 'Puoi andare direttamente a Expensify Classic visitando expensify.com. Aggiungilo ai segnalibri per un facile accesso rapido!',
        bookACall: 'Prenota una chiamata',
        noThanks: 'No grazie',
        bookACallTitle: 'Vuoi parlare con un product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Chattare direttamente su spese e report',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Possibilità di fare tutto su mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Viaggia e gestisci le spese alla velocità della chat',
        },
        bookACallTextTop: 'Passando a Expensify Classic, ti perderai:',
        bookACallTextBottom:
            'Saremmo entusiasti di fare una chiamata con te per capire il motivo. Puoi prenotare una chiamata con uno dei nostri senior product manager per discutere le tue esigenze.',
        takeMeToExpensifyClassic: 'Portami a Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Si è verificato un errore durante il caricamento di altri messaggi',
        tryAgain: 'Riprova',
    },
    systemMessage: {
        mergedWithCashTransaction: 'abbinato una ricevuta a questa transazione',
    },
    subscription: {
        authenticatePaymentCard: 'Autentica carta di pagamento',
        mobileReducedFunctionalityMessage: "Non puoi apportare modifiche al tuo abbonamento nell'app mobile.",
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Prova gratuita: ${numOfDays} ${numOfDays === 1 ? 'giorno' : 'giorni'} rimasti`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Le tue informazioni di pagamento sono obsolete',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Aggiorna la tua carta di pagamento entro il ${date} per continuare a utilizzare tutte le tue funzionalità preferite.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Il tuo pagamento non può essere elaborato.',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Il tuo addebito del ${date} di ${purchaseAmountOwed} non è stato elaborato. Si prega di aggiungere una carta di pagamento per saldare l'importo dovuto.`
                        : "Si prega di aggiungere una carta di pagamento per saldare l'importo dovuto.",
            },
            policyOwnerUnderInvoicing: {
                title: 'Le tue informazioni di pagamento sono obsolete',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Il tuo pagamento è in ritardo. Ti preghiamo di pagare la tua fattura entro il ${date} per evitare l'interruzione del servizio.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Le tue informazioni di pagamento sono obsolete',
                subtitle: 'Il tuo pagamento è in ritardo. Si prega di pagare la fattura.',
            },
            billingDisputePending: {
                title: 'La tua carta non può essere addebitata',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Hai contestato l'addebito di ${amountOwed} sulla carta che termina con ${cardEnding}. Il tuo account sarà bloccato fino a quando la disputa non sarà risolta con la tua banca.`,
            },
            cardAuthenticationRequired: {
                title: 'La tua carta non può essere addebitata',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `La tua carta di pagamento non è stata completamente autenticata. Completa il processo di autenticazione per attivare la tua carta di pagamento che termina con ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'La tua carta non può essere addebitata',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `La tua carta di pagamento è stata rifiutata a causa di fondi insufficienti. Riprova o aggiungi una nuova carta di pagamento per saldare il tuo saldo in sospeso di ${amountOwed}.`,
            },
            cardExpired: {
                title: 'La tua carta non può essere addebitata',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `La tua carta di pagamento è scaduta. Aggiungi una nuova carta di pagamento per saldare il tuo saldo in sospeso di ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'La tua carta sta per scadere presto',
                subtitle:
                    'La tua carta di pagamento scadrà alla fine di questo mese. Clicca sul menu a tre punti qui sotto per aggiornarla e continuare a utilizzare tutte le tue funzionalità preferite.',
            },
            retryBillingSuccess: {
                title: 'Successo!',
                subtitle: 'La tua carta è stata addebitata con successo.',
            },
            retryBillingError: {
                title: 'La tua carta non può essere addebitata',
                subtitle:
                    "Prima di riprovare, chiama direttamente la tua banca per autorizzare gli addebiti di Expensify e rimuovere eventuali blocchi. Altrimenti, prova ad aggiungere un'altra carta di pagamento.",
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Hai contestato l'addebito di ${amountOwed} sulla carta che termina con ${cardEnding}. Il tuo account sarà bloccato fino a quando la disputa non sarà risolta con la tua banca.`,
            preTrial: {
                title: 'Inizia una prova gratuita',
                subtitleStart: 'Come passo successivo,',
                subtitleLink: 'completa la tua lista di controllo per la configurazione',
                subtitleEnd: 'così il tuo team può iniziare a registrare le spese.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Prova: ${numOfDays} ${numOfDays === 1 ? 'giorno' : 'giorni'} rimasti!`,
                subtitle: 'Aggiungi una carta di pagamento per continuare a utilizzare tutte le tue funzionalità preferite.',
            },
            trialEnded: {
                title: 'Il tuo periodo di prova gratuito è terminato',
                subtitle: 'Aggiungi una carta di pagamento per continuare a utilizzare tutte le tue funzionalità preferite.',
            },
            earlyDiscount: {
                claimOffer: 'Richiedi offerta',
                noThanks: 'No grazie',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>${discountType}% di sconto sul tuo primo anno!</strong> Basta aggiungere una carta di pagamento e iniziare un abbonamento annuale.`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `Offerta a tempo limitato: ${discountType}% di sconto sul tuo primo anno!`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Richiedi entro ${days > 0 ? `${days}g :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Pagamento',
            subtitle: 'Aggiungi una carta per pagare il tuo abbonamento Expensify.',
            addCardButton: 'Aggiungi carta di pagamento',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `La tua prossima data di pagamento è ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Carta che termina con ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nome: ${name}, Scadenza: ${expiration}, Valuta: ${currency}`,
            changeCard: 'Cambia carta di pagamento',
            changeCurrency: 'Cambia la valuta di pagamento',
            cardNotFound: 'Nessuna carta di pagamento aggiunta',
            retryPaymentButton: 'Riprova pagamento',
            authenticatePayment: 'Autentica pagamento',
            requestRefund: 'Richiedi rimborso',
            requestRefundModal: {
                phrase1: 'Ottenere un rimborso è facile, basta declassare il tuo account prima della prossima data di fatturazione e riceverai un rimborso.',
                phrase2:
                    "Attenzione: il downgrade del tuo account comporta l'eliminazione del/dei tuo/i spazio/i di lavoro. Questa azione non può essere annullata, ma puoi sempre creare un nuovo spazio di lavoro se cambi idea.",
                confirm: 'Elimina workspace e declassa',
            },
            viewPaymentHistory: 'Visualizza cronologia dei pagamenti',
        },
        yourPlan: {
            title: 'Il tuo piano',
            exploreAllPlans: 'Esplora tutti i piani',
            customPricing: 'Prezzi personalizzati',
            asLowAs: ({price}: YourPlanPriceValueParams) => `a partire da ${price} per membro attivo/mese`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} per membro/mese`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} per membro al mese`,
            perMemberMonth: 'per membro/mese',
            collect: {
                title: 'Raccogliere',
                description: 'Il piano per piccole imprese che ti offre spese, viaggi e chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Expensify Card, ${upper}/membro attivo senza la Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Expensify Card, ${upper}/membro attivo senza la Expensify Card.`,
                benefit1: 'Scansione delle ricevute',
                benefit2: 'Rimborsi',
                benefit3: 'Gestione delle carte aziendali',
                benefit4: 'Approvazioni di spese e viaggi',
                benefit5: 'Prenotazione di viaggi e regole',
                benefit6: 'Integrazioni QuickBooks/Xero',
                benefit7: 'Chatta su spese, rapporti e stanze',
                benefit8: 'Supporto AI e umano',
            },
            control: {
                title: 'Controllo',
                description: 'Spese, viaggi e chat per aziende più grandi.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Expensify Card, ${upper}/membro attivo senza la Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Expensify Card, ${upper}/membro attivo senza la Expensify Card.`,
                benefit1: 'Tutto nel piano Collect',
                benefit2: 'Flussi di lavoro di approvazione multilivello',
                benefit3: 'Regole personalizzate per le spese',
                benefit4: 'Integrazioni ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integrazioni HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Approfondimenti e report personalizzati',
                benefit8: 'Budgeting',
            },
            thisIsYourCurrentPlan: 'Questo è il tuo piano attuale',
            downgrade: 'Effettua il downgrade a Collect',
            upgrade: 'Aggiorna a Control',
            addMembers: 'Aggiungi membri',
            saveWithExpensifyTitle: 'Risparmia con la Expensify Card',
            saveWithExpensifyDescription: 'Usa il nostro calcolatore di risparmio per vedere come il cashback dalla Expensify Card può ridurre la tua fattura Expensify.',
            saveWithExpensifyButton: 'Scopri di più',
        },
        compareModal: {
            comparePlans: 'Confronta i piani',
            unlockTheFeatures: 'Sblocca le funzionalità di cui hai bisogno con il piano giusto per te.',
            viewOurPricing: 'Visualizza la nostra pagina dei prezzi',
            forACompleteFeatureBreakdown: 'per una panoramica completa delle funzionalità di ciascuno dei nostri piani.',
        },
        details: {
            title: "Dettagli dell'abbonamento",
            annual: 'Abbonamento annuale',
            taxExempt: 'Richiedi lo stato di esenzione fiscale',
            taxExemptEnabled: 'Esente da tasse',
            taxExemptStatus: 'Stato di esenzione fiscale',
            payPerUse: 'Pagamento a consumo',
            subscriptionSize: "Dimensione dell'abbonamento",
            headsUp:
                "Attenzione: Se non imposti ora la dimensione del tuo abbonamento, la imposteremo automaticamente in base al numero di membri attivi del primo mese. Sarai quindi impegnato a pagare almeno questo numero di membri per i prossimi 12 mesi. Puoi aumentare la dimensione del tuo abbonamento in qualsiasi momento, ma non puoi diminuirla fino alla scadenza dell'abbonamento.",
            zeroCommitment: 'Zero impegno al tasso di abbonamento annuale scontato',
        },
        subscriptionSize: {
            title: "Dimensione dell'abbonamento",
            yourSize: 'La dimensione del tuo abbonamento è il numero di posti disponibili che possono essere occupati da qualsiasi membro attivo in un determinato mese.',
            eachMonth:
                'Ogni mese, il tuo abbonamento copre fino al numero di membri attivi impostato sopra. Ogni volta che aumenti la dimensione del tuo abbonamento, inizierai un nuovo abbonamento di 12 mesi a quella nuova dimensione.',
            note: 'Nota: Un membro attivo è chiunque abbia creato, modificato, inviato, approvato, rimborsato o esportato dati di spesa legati allo spazio di lavoro della tua azienda.',
            confirmDetails: 'Conferma i dettagli del tuo nuovo abbonamento annuale:',
            subscriptionSize: "Dimensione dell'abbonamento",
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membri attivi/mese`,
            subscriptionRenews: "Il rinnovo dell'abbonamento",
            youCantDowngrade: 'Non puoi effettuare il downgrade durante il tuo abbonamento annuale.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Hai già sottoscritto un abbonamento annuale per ${size} membri attivi al mese fino al ${date}. Puoi passare a un abbonamento a consumo il ${date} disabilitando il rinnovo automatico.`,
            error: {
                size: 'Si prega di inserire una dimensione di abbonamento valida',
                sameSize: 'Inserisci un numero diverso dalla dimensione attuale del tuo abbonamento',
            },
        },
        paymentCard: {
            addPaymentCard: 'Aggiungi carta di pagamento',
            enterPaymentCardDetails: 'Inserisci i dettagli della tua carta di pagamento',
            security: "Expensify è conforme a PCI-DSS, utilizza la crittografia a livello bancario e impiega un'infrastruttura ridondante per proteggere i tuoi dati.",
            learnMoreAboutSecurity: 'Scopri di più sulla nostra sicurezza.',
        },
        subscriptionSettings: {
            title: 'Impostazioni di abbonamento',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Tipo di abbonamento: ${subscriptionType}, Dimensione dell'abbonamento: ${subscriptionSize}, Rinnovo automatico: ${autoRenew}, Aumento automatico dei posti annuali: ${autoIncrease}`,
            none: 'nessuno',
            on: 'su',
            off: 'spento',
            annual: 'Annuale',
            autoRenew: 'Rinnovo automatico',
            autoIncrease: 'Aumento automatico dei posti annuali',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Risparmia fino a ${amountWithCurrency}/mese per membro attivo`,
            automaticallyIncrease:
                'Aumenta automaticamente i tuoi posti annuali per accogliere i membri attivi che superano la dimensione del tuo abbonamento. Nota: Questo estenderà la data di fine del tuo abbonamento annuale.',
            disableAutoRenew: 'Disattiva il rinnovo automatico',
            helpUsImprove: 'Aiutaci a migliorare Expensify',
            whatsMainReason: 'Qual è il motivo principale per cui stai disabilitando il rinnovo automatico?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Rinnova il ${date}.`,
            pricingConfiguration: 'Il prezzo dipende dalla configurazione. Per il prezzo più basso, scegli un abbonamento annuale e ottieni la Expensify Card.',
            learnMore: {
                part1: 'Scopri di più sul nostro',
                pricingPage: 'pagina dei prezzi',
                part2: 'o chatta con il nostro team nella tua',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Prezzo stimato',
            changesBasedOn: "Questo cambia in base all'uso della tua Expensify Card e alle opzioni di abbonamento qui sotto.",
        },
        requestEarlyCancellation: {
            title: 'Richiedi cancellazione anticipata',
            subtitle: 'Qual è il motivo principale per cui stai richiedendo la cancellazione anticipata?',
            subscriptionCanceled: {
                title: 'Abbonamento annullato',
                subtitle: 'Il tuo abbonamento annuale è stato annullato.',
                info: 'Se vuoi continuare a utilizzare il tuo workspace su base pay-per-use, sei a posto.',
                preventFutureActivity: {
                    part1: 'Se desideri prevenire attività e addebiti futuri, devi',
                    link: 'elimina il tuo/i tuoi spazio/i di lavoro',
                    part2: '. Si noti che quando si eliminano i propri workspace, verrà addebitata qualsiasi attività in sospeso che è stata sostenuta durante il mese di calendario corrente.',
                },
            },
            requestSubmitted: {
                title: 'Richiesta inviata',
                subtitle: {
                    part1: "Grazie per averci informato del tuo interesse a cancellare l'abbonamento. Stiamo esaminando la tua richiesta e ti contatteremo presto tramite la tua chat con",
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: `Richiedendo la cancellazione anticipata, riconosco e accetto che Expensify non ha alcun obbligo di concedere tale richiesta ai sensi di Expensify.<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Termini di Servizio</a>o un altro accordo sui servizi applicabile tra me e Expensify e che Expensify mantiene la sola discrezione riguardo alla concessione di qualsiasi richiesta del genere.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'La funzionalità necessita di miglioramenti',
        tooExpensive: 'Troppo costoso',
        inadequateSupport: 'Supporto clienti inadeguato',
        businessClosing: "Chiusura, ridimensionamento o acquisizione dell'azienda",
        additionalInfoTitle: 'A quale software ti stai trasferendo e perché?',
        additionalInfoInputLabel: 'La tua risposta',
    },
    roomChangeLog: {
        updateRoomDescription: 'imposta la descrizione della stanza su:',
        clearRoomDescription: 'cancellato la descrizione della stanza',
    },
    delegate: {
        switchAccount: 'Cambia account:',
        copilotDelegatedAccess: 'Copilot: Accesso delegato',
        copilotDelegatedAccessDescription: 'Consenti ad altri membri di accedere al tuo account.',
        addCopilot: 'Aggiungi copilota',
        membersCanAccessYourAccount: 'Questi membri possono accedere al tuo account:',
        youCanAccessTheseAccounts: 'Puoi accedere a questi account tramite il selettore di account:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Pieno';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Limitato';
                default:
                    return '';
            }
        },
        genericError: 'Ops, qualcosa è andato storto. Per favore riprova.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `per conto di ${delegator}`,
        accessLevel: 'Livello di accesso',
        confirmCopilot: 'Conferma il tuo copilota qui sotto.',
        accessLevelDescription: "Scegli un livello di accesso qui sotto. Sia l'accesso Completo che Limitato consentono ai copiloti di visualizzare tutte le conversazioni e le spese.",
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Consenti a un altro membro di eseguire tutte le azioni nel tuo account, per tuo conto. Include chat, invii, approvazioni, pagamenti, aggiornamenti delle impostazioni e altro.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Consenti a un altro membro di eseguire la maggior parte delle azioni nel tuo account, per tuo conto. Esclude approvazioni, pagamenti, rifiuti e sospensioni.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Rimuovi copilot',
        removeCopilotConfirmation: 'Sei sicuro di voler rimuovere questo copilota?',
        changeAccessLevel: 'Modifica il livello di accesso',
        makeSureItIsYou: 'Verifichiamo che sei tu',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Inserisci il codice magico inviato a ${contactMethod} per aggiungere un copilota. Dovrebbe arrivare entro un minuto o due.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Inserisci il codice magico inviato a ${contactMethod} per aggiornare il tuo copilota.`,
        notAllowed: 'Non così in fretta...',
        noAccessMessage: 'Come copilota, non hai accesso a questa pagina. Mi dispiace!',
        notAllowedMessageStart: `Come un/una`,
        notAllowedMessageHyperLinked: 'copilota',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => `per ${accountOwnerEmail}, non hai il permesso di eseguire questa azione. Mi dispiace!`,
        copilotAccess: 'Accesso Copilot',
    },
    debug: {
        debug: 'Debug',
        details: 'Dettagli',
        JSON: 'JSON',
        reportActions: 'Azioni',
        reportActionPreview: 'Anteprima',
        nothingToPreview: 'Niente da visualizzare in anteprima',
        editJson: 'Edita JSON:',
        preview: 'Anteprima:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Manca ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Proprietà non valida: ${propertyName} - Atteso: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valore non valido - Atteso: ${expectedValues}`,
        missingValue: 'Valore mancante',
        createReportAction: 'Crea Azione Rapporto',
        reportAction: 'Segnala azione',
        report: 'Rapporto',
        transaction: 'Transazione',
        violations: 'Violazioni',
        transactionViolation: 'Violazione della Transazione',
        hint: 'Le modifiche ai dati non saranno inviate al backend',
        textFields: 'Campi di testo',
        numberFields: 'Campi numerici',
        booleanFields: 'Campi booleani',
        constantFields: 'Campi costanti',
        dateTimeFields: 'Campi DateTime',
        date: 'Data',
        time: 'Tempo',
        none: 'Nessuno',
        visibleInLHN: 'Visibile nel LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Visualizza rapporto',
        viewTransaction: 'Visualizza transazione',
        createTransactionViolation: 'Crea violazione di transazione',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ha commento in bozza',
            hasGBR: 'Has GBR',
            hasRBR: 'Ha RBR',
            pinnedByUser: 'Fissato da un membro',
            hasIOUViolations: 'Ha violazioni IOU',
            hasAddWorkspaceRoomErrors: "Ha errori nell'aggiunta della stanza di lavoro",
            isUnread: 'È non letto (modalità di concentrazione)',
            isArchived: 'È archiviato (modalità più recente)',
            isSelfDM: 'È un DM a se stessi',
            isFocused: 'È temporaneamente concentrato/a',
        },
        reasonGBR: {
            hasJoinRequest: 'Richiesta di adesione (stanza amministratore)',
            isUnreadWithMention: 'È non letto con menzione',
            isWaitingForAssigneeToCompleteAction: "In attesa che l'assegnatario completi l'azione",
            hasChildReportAwaitingAction: 'Ha un rapporto figlio in attesa di azione',
            hasMissingInvoiceBankAccount: 'Manca il conto bancario della fattura',
        },
        reasonRBR: {
            hasErrors: 'Ha errori nei dati del report o delle azioni del report',
            hasViolations: 'Ha violazioni',
            hasTransactionThreadViolations: 'Ha violazioni nel thread delle transazioni',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "C'è un report in attesa di azione",
            theresAReportWithErrors: "C'è un report con errori",
            theresAWorkspaceWithCustomUnitsErrors: "C'è un'area di lavoro con errori nelle unità personalizzate",
            theresAProblemWithAWorkspaceMember: "C'è un problema con un membro dello spazio di lavoro",
            theresAProblemWithAWorkspaceQBOExport: "Si è verificato un problema con l'impostazione di esportazione della connessione dello spazio di lavoro.",
            theresAProblemWithAContactMethod: "C'è un problema con un metodo di contatto",
            aContactMethodRequiresVerification: 'Un metodo di contatto richiede la verifica',
            theresAProblemWithAPaymentMethod: "C'è un problema con un metodo di pagamento",
            theresAProblemWithAWorkspace: "C'è un problema con uno spazio di lavoro",
            theresAProblemWithYourReimbursementAccount: "C'è un problema con il tuo conto di rimborso",
            theresABillingProblemWithYourSubscription: "C'è un problema di fatturazione con il tuo abbonamento",
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Il tuo abbonamento è stato rinnovato con successo',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Si è verificato un problema durante la sincronizzazione della connessione dello spazio di lavoro',
            theresAProblemWithYourWallet: "C'è un problema con il tuo portafoglio",
            theresAProblemWithYourWalletTerms: "C'è un problema con i termini del tuo portafoglio",
        },
    },
    emptySearchView: {
        takeATestDrive: 'Fai un giro di prova',
    },
    migratedUserWelcomeModal: {
        title: 'Viaggi e spese, alla velocità della chat',
        subtitle: 'Il nuovo Expensify ha la stessa fantastica automazione, ma ora con una collaborazione straordinaria:',
        confirmText: 'Andiamo!',
        features: {
            chat: '<strong>Chatta direttamente su qualsiasi spesa</strong>, report o spazio di lavoro',
            scanReceipt: '<strong>Scansiona le ricevute</strong> e ricevi il rimborso',
            crossPlatform: 'Fai <strong>tutto</strong> dal tuo telefono o browser',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: 'Inizia',
            part2: 'qui!',
        },
        saveSearchTooltip: {
            part1: 'Rinomina le tue ricerche salvate',
            part2: 'qui!',
        },
        bottomNavInboxTooltip: {
            part1: 'Check what',
            part2: 'richiede la tua attenzione',
            part3: 'e',
            part4: 'chatta sulle spese.',
        },
        workspaceChatTooltip: {
            part1: 'Chatta con',
            part2: 'approvatori',
        },
        globalCreateTooltip: {
            part1: 'Crea spese',
            part2: ', inizia a chattare,',
            part3: 'e altro ancora.',
            part4: 'Provalo!',
        },
        GBRRBRChat: {
            part1: 'Vedrai 🟢 su',
            part2: 'azioni da intraprendere',
            part3: ',\ne 🔴 su',
            part4: 'elementi da rivedere.',
        },
        accountSwitcher: {
            part1: 'Accedi al tuo',
            part2: 'Account Copilot',
            part3: 'qui',
        },
        expenseReportsFilter: {
            part1: 'Benvenuto! Trova tutti i tuoi',
            part2: "rapporti dell'azienda",
            part3: 'qui.',
        },
        scanTestTooltip: {
            part1: 'Vuoi vedere come funziona Scan?',
            part2: 'Prova una ricevuta di test!',
            part3: 'Scegli il nostro',
            part4: 'responsabile dei test',
            part5: 'per provarlo!',
            part6: 'Ora,',
            part7: 'invia la tua spesa',
            part8: 'e guarda la magia accadere!',
            tryItOut: 'Provalo',
            noThanks: 'No grazie',
        },
        outstandingFilter: {
            part1: 'Filtra per spese che',
            part2: 'necessita approvazione',
        },
        scanTestDriveTooltip: {
            part1: 'Invia questa ricevuta a',
            part2: 'completa il test drive!',
        },
    },
    discardChangesConfirmation: {
        title: 'Eliminare le modifiche?',
        body: 'Sei sicuro di voler annullare le modifiche apportate?',
        confirmText: 'Scarta modifiche',
    },
    scheduledCall: {
        book: {
            title: 'Pianifica chiamata',
            description: 'Trova un orario che funzioni per te.',
            slots: 'Orari disponibili per',
        },
        confirmation: {
            title: 'Conferma chiamata',
            description: 'Assicurati che i dettagli qui sotto siano corretti. Una volta confermata la chiamata, invieremo un invito con ulteriori informazioni.',
            setupSpecialist: 'Il tuo specialista di configurazione',
            meetingLength: 'Durata della riunione',
            dateTime: 'Data e ora',
            minutes: '30 minuti',
        },
        callScheduled: 'Chiamata programmata',
    },
    autoSubmitModal: {
        title: 'Tutto chiaro e inviato!',
        description: 'Tutti gli avvisi e le violazioni sono stati risolti quindi:',
        submittedExpensesTitle: 'Queste spese sono state inviate',
        submittedExpensesDescription: 'Queste spese sono state inviate al tuo approvatore ma possono ancora essere modificate fino a quando non vengono approvate.',
        pendingExpensesTitle: 'Le spese in sospeso sono state spostate',
        pendingExpensesDescription: 'Eventuali spese con carta in sospeso sono state spostate in un rapporto separato fino a quando non vengono registrate.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Fai un test drive di 2 minuti',
        },
        modal: {
            title: 'Mettici alla prova',
            description: 'Fai un rapido tour del prodotto per metterti al passo velocemente. Nessuna sosta necessaria!',
            confirmText: 'Inizia la prova',
            helpText: 'Salta',
            employee: {
                description:
                    "<muted-text>Ottieni per il tuo team <strong>3 mesi gratuiti di Expensify!</strong> Basta inserire l'email del tuo capo qui sotto e inviare loro una spesa di prova.</muted-text>",
                email: "Inserisci l'email del tuo capo",
                error: 'Quel membro possiede uno spazio di lavoro, inserisci un nuovo membro per testare.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Stai attualmente provando Expensify',
            readyForTheRealThing: 'Pronto per la vera sfida?',
            getStarted: 'Inizia',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} ti ha invitato a provare Expensify\nEhi! Ho appena ottenuto *3 mesi gratis* per provare Expensify, il modo più veloce per gestire le spese.\n\nEcco una *ricevuta di prova* per mostrarti come funziona:`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
