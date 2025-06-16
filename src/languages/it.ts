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
        count: 'Conteggio',
        cancel: 'Annulla',
        dismiss: 'Ignora',
        yes: 'S\u00EC',
        no: 'No',
        ok: 'OK',
        notNow: 'Non ora',
        learnMore: 'Scopri di pi\u00F9.',
        buttonConfirm: 'Ho capito',
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
        resend: 'Reinvia',
        save: 'Salva',
        select: 'Seleziona',
        deselect: 'Deseleziona',
        selectMultiple: 'Seleziona multipli',
        saveChanges: 'Salva modifiche',
        submit: 'Invia',
        rotate: 'Ruota',
        zoom: 'Zoom',
        password: 'Password',
        magicCode: 'Magic code',
        twoFactorCode: 'Codice a due fattori',
        workspaces: 'Spazi di lavoro',
        inbox: 'Posta in arrivo',
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
        termsOfService: 'Termini di servizio',
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
        city: 'Citt\u00E0',
        state: 'Stato',
        streetAddress: 'Indirizzo stradale',
        stateOrProvince: 'Stato / Provincia',
        country: 'Paese',
        zip: 'Codice postale',
        zipPostCode: 'CAP / Codice postale',
        whatThis: "Cos'\u00E8 questo?",
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
        timePrefix: '\u00C8',
        conjunctionFor: 'per',
        todayAt: 'Oggi alle',
        tomorrowAt: 'Domani alle',
        yesterdayAt: 'Ieri alle',
        conjunctionAt: 'a',
        conjunctionTo: 'a',
        genericErrorMessage: 'Ops... qualcosa \u00E8 andato storto e la tua richiesta non pu\u00F2 essere completata. Per favore riprova pi\u00F9 tardi.',
        percentage: 'Percentuale',
        error: {
            invalidAmount: 'Importo non valido',
            acceptTerms: 'Devi accettare i Termini di Servizio per continuare',
            phoneNumber: `Si prega di inserire un numero di telefono valido, con il prefisso internazionale (es. ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Questo campo \u00E8 obbligatorio',
            requestModified: 'Questa richiesta \u00E8 in fase di modifica da un altro membro',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Limite di caratteri superato (${length}/${limit})`,
            dateInvalid: 'Si prega di selezionare una data valida',
            invalidDateShouldBeFuture: 'Si prega di scegliere oggi o una data futura',
            invalidTimeShouldBeFuture: 'Si prega di scegliere un orario almeno un minuto avanti.',
            invalidCharacter: 'Carattere non valido',
            enterMerchant: 'Inserisci un nome commerciante',
            enterAmount: 'Inserisci un importo',
            missingMerchantName: 'Nome del commerciante mancante',
            missingAmount: 'Importo mancante',
            missingDate: 'Data mancante',
            enterDate: 'Inserisci una data',
            invalidTimeRange: 'Inserisci un orario utilizzando il formato a 12 ore (es. 14:30)',
            pleaseCompleteForm: 'Si prega di completare il modulo sopra per continuare',
            pleaseSelectOne: "Si prega di selezionare un'opzione sopra",
            invalidRateError: 'Inserisci una tariffa valida',
            lowRateError: 'La tariffa deve essere maggiore di 0',
            email: 'Per favore, inserisci un indirizzo email valido',
            login: "Si \u00E8 verificato un errore durante l'accesso. Per favore riprova.",
        },
        comma: 'virgola',
        semicolon: 'semicolon',
        please: 'Per favore',
        contactUs: 'contattaci',
        pleaseEnterEmailOrPhoneNumber: "Per favore, inserisci un'email o un numero di telefono",
        fixTheErrors: 'correggi gli errori',
        inTheFormBeforeContinuing: 'nel modulo prima di continuare',
        confirm: 'Conferma',
        reset: 'Reimposta',
        done: 'Fatto',
        more: 'Di pi\u00F9',
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
        youAfterPreposition: 'tu',
        your: 'tuo/tuoi/tuoi/tuo (depending on the context and gender/number agreement)',
        conciergeHelp: 'Si prega di contattare Concierge per assistenza.',
        youAppearToBeOffline: 'Sembri essere offline.',
        thisFeatureRequiresInternet: 'Questa funzione richiede una connessione internet attiva.',
        attachmentWillBeAvailableOnceBackOnline: "L'allegato sar\u00E0 disponibile una volta tornato online.",
        errorOccurredWhileTryingToPlayVideo: 'Si \u00E8 verificato un errore durante il tentativo di riprodurre questo video.',
        areYouSure: 'Sei sicuro?',
        verify: 'Verifica',
        yesContinue: 'S\u00EC, continua',
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
        mi: 'mile',
        km: 'chilometro',
        copied: 'Copiato!',
        someone: 'Qualcuno',
        total: 'Totale',
        edit: 'Modifica',
        letsDoThis: `Facciamolo!`,
        letsStart: `Iniziamo pure`,
        showMore: 'Mostra di pi\u00F9',
        merchant: 'Commerciante',
        category: 'Categoria',
        report: 'Rapporto',
        billable: 'Fatturabile',
        nonBillable: 'Non fatturabile',
        tag: 'Tag',
        receipt: 'Ricevuta',
        verified: 'Verificato',
        replace: 'Sostituire',
        distance: 'Distanza',
        mile: 'mile',
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
        whyDoWeAskForThis: 'Perch\u00E9 lo chiediamo?',
        required: 'Richiesto',
        showing: 'Mostrando',
        of: 'di',
        default: 'Predefinito',
        update: 'Aggiorna',
        member: 'Membro',
        auditor: 'Revisore dei conti',
        role: 'Ruolo',
        currency: 'Valuta',
        rate: 'Tariffa',
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
        downgradeWorkspace: 'Declassa workspace',
        companyID: 'Company ID',
        userID: 'ID utente',
        disable: 'Disabilita',
        export: 'Esporta',
        initialValue: 'Valore iniziale',
        currentDate: 'Data attuale',
        value: 'Valore',
        downloadFailedTitle: 'Download non riuscito',
        downloadFailedDescription: 'Il tuo download non \u00E8 stato completato. Per favore riprova pi\u00F9 tardi.',
        filterLogs: 'Filtra Registri',
        network: 'Network',
        reportID: 'Report ID',
        longID: 'ID lungo',
        bankAccounts: 'Conti bancari',
        chooseFile: 'Scegli file',
        dropTitle: 'Lascia perdere',
        dropMessage: 'Trascina qui il tuo file',
        ignore: 'Ignore',
        enabled: 'Abilitato',
        disabled: 'Disabilitato',
        import: 'Importa',
        offlinePrompt: 'Non puoi eseguire questa azione in questo momento.',
        outstanding: 'Eccezionale',
        chats: 'Chat',
        tasks: 'Attivit\u00E0',
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
        on: 'Acceso',
        before: 'Prima',
        after: 'Dopo',
        reschedule: 'Ripianificare',
        general: 'Generale',
        never: 'Mai',
        workspacesTabTitle: 'Spazi di lavoro',
        getTheApp: "Scarica l'app",
        scanReceiptsOnTheGo: 'Scansiona le ricevute dal tuo telefono',
    },
    supportalNoAccess: {
        title: 'Non cos\u00EC in fretta',
        description: 'Non sei autorizzato a eseguire questa azione quando il supporto \u00E8 connesso.',
    },
    lockedAccount: {
        title: 'Account Bloccato',
        description: 'Non sei autorizzato a completare questa azione poich\u00E9 questo account \u00E8 stato bloccato. Per favore contatta concierge@expensify.com per i prossimi passi.',
    },
    location: {
        useCurrent: 'Usa posizione attuale',
        notFound: 'Non siamo riusciti a trovare la tua posizione. Riprova o inserisci un indirizzo manualmente.',
        permissionDenied: "Sembra che tu abbia negato l'accesso alla tua posizione.",
        please: 'Per favore',
        allowPermission: "consenti l'accesso alla posizione nelle impostazioni",
        tryAgain: 'e prova di nuovo.',
    },
    contact: {
        importContacts: 'Importa contatti',
        importContactsTitle: 'Importa i tuoi contatti',
        importContactsText: 'Importa i contatti dal tuo telefono in modo che le tue persone preferite siano sempre a portata di tocco.',
        importContactsExplanation: 'cos\u00EC le tue persone preferite sono sempre a portata di tocco.',
        importContactsNativeText: 'Solo un altro passo! Dacci il via libera per importare i tuoi contatti.',
    },
    anonymousReportFooter: {
        logoTagline: 'Unisciti alla discussione.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Accesso alla fotocamera',
        expensifyDoesNotHaveAccessToCamera: 'Expensify non pu\u00F2 scattare foto senza accesso alla tua fotocamera. Tocca impostazioni per aggiornare le autorizzazioni.',
        attachmentError: 'Errore allegato',
        errorWhileSelectingAttachment: 'Si \u00E8 verificato un errore durante la selezione di un allegato. Per favore riprova.',
        errorWhileSelectingCorruptedAttachment: 'Si \u00E8 verificato un errore durante la selezione di un allegato danneggiato. Si prega di provare un altro file.',
        takePhoto: 'Scatta foto',
        chooseFromGallery: 'Scegli dalla galleria',
        chooseDocument: 'Scegli file',
        attachmentTooLarge: "L'allegato \u00E8 troppo grande",
        sizeExceeded: "La dimensione dell'allegato supera il limite di 24 MB",
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `La dimensione dell'allegato supera il limite di ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: "L'allegato \u00E8 troppo piccolo",
        sizeNotMet: "La dimensione dell'allegato deve essere maggiore di 240 byte",
        wrongFileType: 'Tipo di file non valido',
        notAllowedExtension: 'Questo tipo di file non \u00E8 consentito. Si prega di provare un tipo di file diverso.',
        folderNotAllowedMessage: 'Il caricamento di una cartella non \u00E8 consentito. Prova con un file diverso.',
        protectedPDFNotSupported: 'PDF protetto da password non \u00E8 supportato',
        attachmentImageResized: "Questa immagine \u00E8 stata ridimensionata per l'anteprima. Scarica per la risoluzione completa.",
        attachmentImageTooLarge: 'Questa immagine \u00E8 troppo grande per essere visualizzata in anteprima prima del caricamento.',
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
        errorWhileSelectingFile: 'Si \u00E8 verificato un errore durante la selezione di un file. Per favore riprova.',
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
        noExtensionFoundForMimeType: 'Nessuna estensione trovata per il tipo mime',
        problemGettingImageYouPasted: "Si \u00E8 verificato un problema nel recuperare l'immagine che hai incollato.",
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La lunghezza massima del commento \u00E8 di ${formattedMaxLength} caratteri.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La lunghezza massima del titolo del compito \u00E8 di ${formattedMaxLength} caratteri.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Aggiorna app',
        updatePrompt: "\u00C8 disponibile una nuova versione di questa app.  \nAggiorna ora o riavvia l'app pi\u00F9 tardi per scaricare le ultime modifiche.",
    },
    deeplinkWrapper: {
        launching: 'Avvio di Expensify',
        expired: 'La tua sessione \u00E8 scaduta.',
        signIn: 'Per favore, accedi di nuovo.',
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
        successfulSignInTitle: 'Abracadabra, sei connesso!',
        successfulSignInDescription: 'Torna alla tua scheda originale per continuare.',
        title: 'Ecco il tuo codice magico',
        description: 'Inserisci il codice dal dispositivo dove \u00E8 stato originariamente richiesto',
        doNotShare: 'Non condividere il tuo codice con nessuno. Expensify non te lo chieder\u00E0 mai!',
        or: ', o',
        signInHere: 'accedi qui',
        expiredCodeTitle: 'Codice magico scaduto',
        expiredCodeDescription: 'Torna al dispositivo originale e richiedi un nuovo codice',
        successfulNewCodeRequest: 'Codice richiesto. Si prega di controllare il dispositivo.',
        tfaRequiredTitle: 'Autenticazione a due fattori richiesta',
        tfaRequiredDescription: 'Per favore, inserisci il codice di autenticazione a due fattori dove stai cercando di accedere.',
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
            subtitleText: 'Vuoi che anche il tuo capo utilizzi Expensify? Basta inviare loro una spesa e ci occuperemo del resto.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Prenota una chiamata',
    },
    hello: 'Ciao',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Inizia qui sotto.',
        anotherLoginPageIsOpen: "Un'altra pagina di accesso \u00E8 aperta.",
        anotherLoginPageIsOpenExplanation: 'Hai aperto la pagina di accesso in una scheda separata. Effettua il login da quella scheda.',
        welcome: 'Benvenuto!',
        welcomeWithoutExclamation: 'Benvenuto',
        phrase2: 'Il denaro parla. E ora che chat e pagamenti sono in un unico posto, \u00E8 anche facile.',
        phrase3: 'I tuoi pagamenti ti arrivano velocemente quanto riesci a far capire il tuo punto di vista.',
        enterPassword: 'Per favore, inserisci la tua password',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, \u00E8 sempre bello vedere una nuova faccia da queste parti!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Inserisci il codice magico inviato a ${login}. Dovrebbe arrivare entro un minuto o due.`,
    },
    login: {
        hero: {
            header: 'Viaggi e spese, alla velocit\u00E0 della chat',
            body: "Benvenuto nella nuova generazione di Expensify, dove i tuoi viaggi e le tue spese si muovono pi\u00F9 velocemente con l'aiuto di una chat contestuale in tempo reale.",
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Sei gi\u00E0 connesso come ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Non vuoi accedere con ${provider}?`,
        continueWithMyCurrentSession: 'Continua con la mia sessione attuale',
        redirectToDesktopMessage: "Ti reindirizzeremo all'app desktop una volta completato l'accesso.",
        signInAgreementMessage: 'Accedendo, accetti i',
        termsOfService: 'Termini di servizio',
        privacy: 'Privacy',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continua ad accedere con single sign-on:',
        orContinueWithMagicCode: 'Puoi anche accedere con un codice magico',
        useSingleSignOn: 'Usa il single sign-on',
        useMagicCode: 'Usa il codice magico',
        launching: 'Avvio...',
        oneMoment: 'Un momento mentre ti reindirizziamo al portale single sign-on della tua azienda.',
    },
    reportActionCompose: {
        dropToUpload: 'Trascina per caricare',
        sendAttachment: 'Invia allegato',
        addAttachment: 'Aggiungi allegato',
        writeSomething: 'Scrivi qualcosa...',
        blockedFromConcierge: 'La comunicazione \u00E8 bloccata',
        fileUploadFailed: 'Caricamento fallito. File non supportato.',
        localTime: ({user, time}: LocalTimeParams) => `Sono le ${time} per ${user}`,
        edited: '(edited)',
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
        beginningOfArchivedRoomPartOne: 'Hai perso la festa a',
        beginningOfArchivedRoomPartTwo: ", non c'\u00E8 niente da vedere qui.",
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `Questa chat \u00E8 con tutti i membri di Expensify nel dominio ${domainRoom}.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Usalo per chattare con i colleghi, condividere suggerimenti e fare domande.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Questa chat \u00E8 con',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: "Usalo per discutere dell'allestimento dell'area di lavoro e altro ancora.",
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) => `Questa chat \u00E8 con tutti in ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `Usalo per gli annunci pi\u00F9 importanti.`,
        beginningOfChatHistoryUserRoomPartOne: 'Questa chat room \u00E8 per qualsiasi cosa',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: `Questa chat \u00E8 per le fatture tra`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Usa il pulsante + per inviare una fattura.`,
        beginningOfChatHistory: 'Questa chat \u00E8 con',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'Questo \u00E8 dove',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'invier\u00E0 le spese a',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Basta usare il pulsante +.',
        beginningOfChatHistorySelfDM: 'Questo \u00E8 il tuo spazio personale. Usalo per appunti, compiti, bozze e promemoria.',
        beginningOfChatHistorySystemDM: 'Benvenuto! Iniziamo con la configurazione.',
        chatWithAccountManager: 'Chatta con il tuo account manager qui',
        sayHello: "Di' ciao!",
        yourSpace: 'Il tuo spazio',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Benvenuto in ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Usa il pulsante + per ${additionalText} una spesa.`,
        askConcierge: 'Fai domande e ottieni supporto in tempo reale 24/7.',
        conciergeSupport: 'Supporto 24/7',
        create: 'creare',
        iouTypes: {
            pay: 'paga',
            split: 'split',
            submit: 'invia',
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
        multipleMembers: 'Pi\u00F9 membri',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Questa chat \u00E8 stata archiviata.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 ${displayName} ha chiuso il loro account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 ${oldDisplayName} ha unito il loro account con ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 <strong>tu</strong> non sei pi\u00F9 un membro dello spazio di lavoro ${policyName}.`
                : `Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 ${displayName} non \u00E8 pi\u00F9 un membro dello spazio di lavoro ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 ${policyName} non \u00E8 pi\u00F9 un workspace attivo.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 ${policyName} non \u00E8 pi\u00F9 un workspace attivo.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Questa prenotazione \u00E8 archiviata.',
    },
    writeCapabilityPage: {
        label: 'Chi pu\u00F2 pubblicare?',
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
        chatPinned: 'Chat fissato',
        draftedMessage: 'Messaggio in bozza',
        listOfChatMessages: 'Elenco dei messaggi di chat',
        listOfChats: 'Elenco delle chat',
        saveTheWorld: 'Salva il mondo',
        tooltip: 'Inizia qui!',
        redirectToExpensifyClassicModal: {
            title: 'Prossimamente',
            description: 'Stiamo perfezionando alcuni dettagli di New Expensify per adattarli alla tua configurazione specifica. Nel frattempo, vai su Expensify Classic.',
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
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Ops! Un campo obbligatorio ("${fieldName}") non \u00E8 stato mappato. Si prega di controllare e riprovare.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `Ops! Hai associato un singolo campo ("${fieldName}") a pi\u00F9 colonne. Per favore, rivedi e riprova.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Ops! Il campo ("${fieldName}") contiene uno o pi\u00F9 valori vuoti. Si prega di controllare e riprovare.`,
        importSuccessfulTitle: 'Importazione riuscita',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) =>
            categories > 1 ? `Sono state aggiunte ${categories} categorie.` : '1 categoria \u00E8 stata aggiunta.',
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Nessun membro \u00E8 stato aggiunto o aggiornato.';
            }
            if (added && updated) {
                return `${added} membro${added > 1 ? 's' : ''} aggiunto, ${updated} membro${updated > 1 ? 's' : ''} aggiornato.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} membri sono stati aggiornati.` : '1 membro \u00E8 stato aggiornato.';
            }
            return added > 1 ? `${added} membri sono stati aggiunti.` : '\u00C8 stato aggiunto 1 membro.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `Sono stati aggiunti i tag ${tags}.` : '\u00C8 stato aggiunto 1 tag.'),
        importMultiLevelTagsSuccessfulDescription: 'Sono stati aggiunti tag multilivello.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `Sono stati aggiunti i tassi per diem di ${rates}.` : '\u00C8 stata aggiunta 1 tariffa giornaliera.',
        importFailedTitle: 'Importazione fallita',
        importFailedDescription: 'Assicurati che tutti i campi siano compilati correttamente e riprova. Se il problema persiste, contatta Concierge.',
        importDescription: 'Scegli quali campi mappare dal tuo foglio di calcolo facendo clic sul menu a discesa accanto a ciascuna colonna importata qui sotto.',
        sizeNotMet: 'La dimensione del file deve essere maggiore di 0 byte',
        invalidFileMessage:
            'Il file che hai caricato \u00E8 vuoto o contiene dati non validi. Assicurati che il file sia formattato correttamente e contenga le informazioni necessarie prima di caricarlo di nuovo.',
        importSpreadsheet: 'Importa foglio di calcolo',
        downloadCSV: 'Scarica CSV',
    },
    receipt: {
        upload: 'Carica ricevuta',
        dragReceiptBeforeEmail: 'Trascina una ricevuta su questa pagina, inoltra una ricevuta a',
        dragReceiptAfterEmail: 'o scegli un file da caricare qui sotto.',
        chooseReceipt: 'Scegli una ricevuta da caricare o inoltra una ricevuta a',
        takePhoto: 'Scatta una foto',
        cameraAccess: "L'accesso alla fotocamera \u00E8 necessario per scattare foto delle ricevute.",
        deniedCameraAccess: "L'accesso alla fotocamera non \u00E8 ancora stato concesso, per favore segui",
        deniedCameraAccessInstructions: 'queste istruzioni',
        cameraErrorTitle: 'Errore della fotocamera',
        cameraErrorMessage: 'Si \u00E8 verificato un errore durante lo scatto della foto. Riprova.',
        locationAccessTitle: "Consenti l'accesso alla posizione",
        locationAccessMessage: "L'accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta accurati ovunque tu vada.",
        locationErrorTitle: "Consenti l'accesso alla posizione",
        locationErrorMessage: "L'accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta accurati ovunque tu vada.",
        allowLocationFromSetting: `L'accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta accurati ovunque tu vada. Si prega di consentire l'accesso alla posizione dalle impostazioni delle autorizzazioni del dispositivo.`,
        dropTitle: 'Lascia perdere',
        dropMessage: 'Trascina qui il tuo file',
        flash: 'flash',
        multiScan: 'multi-scan',
        shutter: 'otturatore',
        gallery: 'galleria',
        deleteReceipt: 'Elimina ricevuta',
        deleteConfirmation: 'Sei sicuro di voler eliminare questa ricevuta?',
        addReceipt: 'Aggiungi ricevuta',
    },
    quickAction: {
        scanReceipt: 'Scansiona ricevuta',
        recordDistance: 'Traccia distanza',
        requestMoney: 'Crea spesa',
        perDiem: 'Crea diaria',
        splitBill: 'Dividi spesa',
        splitScan: 'Dividi ricevuta',
        splitDistance: 'Distanza divisa',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Paga ${name ?? 'qualcuno'}`,
        assignTask: 'Assegna compito',
        header: 'Azione rapida',
        noLongerHaveReportAccess: 'Non hai pi\u00F9 accesso alla tua precedente destinazione di azione rapida. Scegline una nuova qui sotto.',
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
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `L'importo totale \u00E8 ${amount} superiore alla spesa originale.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `L'importo totale \u00E8 di ${amount} inferiore alla spesa originale.`,
        splitExpenseZeroAmount: 'Per favore inserisci un importo valido prima di continuare.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Modifica ${amount} per ${merchant}`,
        removeSplit: 'Rimuovi divisione',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Paga ${name ?? 'qualcuno'}`,
        expense: 'Spesa',
        categorize: 'Categorizza',
        share: 'Condividi',
        participants: 'Partecipanti',
        createExpense: 'Crea spesa',
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
        movedFromReport: ({reportName}: MovedFromReportParams) => `spostato una spesa${reportName ? `da ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `spostato questa spesa${reportName ? `a <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: 'spostato questa spesa nel tuo spazio personale',
        pendingMatchWithCreditCard: 'Ricevuta in attesa di abbinamento con transazione della carta',
        pendingMatch: 'Partita in sospeso',
        pendingMatchWithCreditCardDescription: 'Ricevuta in attesa di abbinamento con transazione della carta. Segna come contanti per annullare.',
        markAsCash: 'Segna come contante',
        routePending: 'Instradamento in sospeso...',
        receiptScanning: () => ({
            one: 'Scansione della ricevuta...',
            other: 'Scansione delle ricevute...',
        }),
        scanMultipleReceipts: 'Scansiona pi\u00F9 ricevute',
        scanMultipleReceiptsDescription: 'Scatta foto di tutte le tue ricevute in una volta, poi conferma i dettagli tu stesso o lascia che SmartScan se ne occupi.',
        receiptScanInProgress: 'Scansione della ricevuta in corso',
        receiptScanInProgressDescription: 'Scansione della ricevuta in corso. Controlla pi\u00F9 tardi o inserisci i dettagli ora.',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? "Spese potenzialmente duplicate identificate. Rivedi i duplicati per abilitare l'invio."
                : "Spese potenzialmente duplicate identificate. Rivedi i duplicati per abilitare l'approvazione.",
        receiptIssuesFound: () => ({
            one: 'Problema riscontrato',
            other: 'Problemi riscontrati',
        }),
        fieldPending: 'In sospeso...',
        defaultRate: 'Tariffa predefinita',
        receiptMissingDetails: 'Ricevuta mancante di dettagli',
        missingAmount: 'Importo mancante',
        missingMerchant: 'Commerciante mancante',
        receiptStatusTitle: 'Scansione in corso\u2026',
        receiptStatusText: 'Solo tu puoi vedere questa ricevuta mentre viene scansionata. Controlla pi\u00F9 tardi o inserisci i dettagli ora.',
        receiptScanningFailed: 'La scansione della ricevuta non \u00E8 riuscita. Inserisci i dettagli manualmente.',
        transactionPendingDescription: 'Transazione in sospeso. Potrebbero essere necessari alcuni giorni per la registrazione.',
        companyInfo: "Informazioni sull'azienda",
        companyInfoDescription: 'Abbiamo bisogno di alcuni dettagli in pi\u00F9 prima che tu possa inviare la tua prima fattura.',
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
        deleteReportConfirmation: 'Sei sicuro di voler eliminare questo rapporto?',
        settledExpensify: 'Pagato',
        done: 'Fatto',
        settledElsewhere: 'Pagato altrove',
        individual: 'Individuale',
        business: 'Business',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} con Expensify` : `Paga con Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} come individuo` : `Paga come individuo`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Paga ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} come azienda` : `Paga come azienda`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} altrove` : `Paga altrove`),
        nextStep: 'Prossimi passi',
        finished: 'Finito',
        sendInvoice: ({amount}: RequestAmountParams) => `Invia fattura di ${amount}`,
        submitAmount: ({amount}: RequestAmountParams) => `Invia ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `per ${comment}` : ''}`,
        submitted: `inviato`,
        automaticallySubmitted: `inviato tramite <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">ritarda invii</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `tracciamento ${formattedAmount}${comment ? `per ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `dividi ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? `per ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `La tua quota ${amount}`,
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
        automaticallyApproved: `approvato tramite <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole del workspace</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `approvato ${amount}`,
        approvedMessage: `approvato`,
        unapproved: `non approvato`,
        automaticallyForwarded: `approvato tramite <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole del workspace</a>`,
        forwarded: `approvato`,
        rejectedThisReport: 'ha respinto questo rapporto',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `ha iniziato a saldare. Il pagamento \u00E8 in sospeso fino a quando ${submitterDisplayName} non aggiunge un conto bancario.`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''} ha annullato il pagamento`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `annullato il pagamento di ${amount}, perch\u00E9 ${submitterDisplayName} non ha abilitato il loro Expensify Wallet entro 30 giorni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} ha aggiunto un conto bancario. Il pagamento di ${amount} \u00E8 stato effettuato.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}pagato altrove`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''} pagato con Expensify`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''} ha pagato con Expensify tramite <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole del workspace</a>`,
        noReimbursableExpenses: 'Questo rapporto ha un importo non valido',
        pendingConversionMessage: 'Il totale verr\u00E0 aggiornato quando sarai di nuovo online',
        changedTheExpense: 'ha modificato la spesa',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `il ${valueName} a ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `imposta ${translatedChangedField} su ${newMerchant}, che imposta l'importo a ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `il ${valueName} (precedentemente ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `il ${valueName} a ${newValueToDisplay} (precedentemente ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `ha cambiato il ${translatedChangedField} in ${newMerchant} (precedentemente ${oldMerchant}), il che ha aggiornato l'importo a ${newAmountToDisplay} (precedentemente ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `per ${comment}` : 'spesa'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rapporto Fattura #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} inviato${comment ? `per ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `spostato la spesa dallo spazio personale a ${workspaceName ?? `chatta con ${reportName}`}`,
        movedToPersonalSpace: 'spostato la spesa nello spazio personale',
        tagSelection: 'Seleziona un tag per organizzare meglio le tue spese.',
        categorySelection: 'Seleziona una categoria per organizzare meglio le tue spese.',
        error: {
            invalidCategoryLength: 'Il nome della categoria supera i 255 caratteri. Si prega di accorciarlo o scegliere una categoria diversa.',
            invalidTagLength: 'Il nome del tag supera i 255 caratteri. Si prega di accorciarlo o scegliere un tag diverso.',
            invalidAmount: 'Per favore, inserisci un importo valido prima di continuare',
            invalidIntegerAmount: 'Si prega di inserire un importo intero in dollari prima di continuare',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `L'importo massimo delle tasse \u00E8 ${amount}`,
            invalidSplit: "La somma delle divisioni deve essere uguale all'importo totale",
            invalidSplitParticipants: 'Inserisci un importo maggiore di zero per almeno due partecipanti',
            invalidSplitYourself: 'Inserisci un importo diverso da zero per la tua divisione',
            noParticipantSelected: 'Si prega di selezionare un partecipante',
            other: 'Errore imprevisto. Per favore riprova pi\u00F9 tardi.',
            genericCreateFailureMessage: "Errore imprevisto durante l'invio di questa spesa. Per favore riprova pi\u00F9 tardi.",
            genericCreateInvoiceFailureMessage: "Errore imprevisto nell'invio di questa fattura. Per favore riprova pi\u00F9 tardi.",
            genericHoldExpenseFailureMessage: 'Errore imprevisto durante il blocco di questa spesa. Per favore riprova pi\u00F9 tardi.',
            genericUnholdExpenseFailureMessage: 'Errore imprevisto nel rimuovere questa spesa dalla sospensione. Per favore riprova pi\u00F9 tardi.',
            receiptDeleteFailureError: "Errore imprevisto durante l'eliminazione di questa ricevuta. Per favore riprova pi\u00F9 tardi.",
            receiptFailureMessage: 'Si \u00E8 verificato un errore durante il caricamento della tua ricevuta. Per favore',
            receiptFailureMessageShort: 'Si \u00E8 verificato un errore durante il caricamento della tua ricevuta.',
            tryAgainMessage: 'riprova',
            saveFileMessage: 'salva la ricevuta',
            uploadLaterMessage: 'da caricare pi\u00F9 tardi.',
            genericDeleteFailureMessage: "Errore imprevisto durante l'eliminazione di questa spesa. Per favore riprova pi\u00F9 tardi.",
            genericEditFailureMessage: 'Errore imprevisto durante la modifica di questa spesa. Riprova pi\u00F9 tardi.',
            genericSmartscanFailureMessage: 'La transazione ha campi mancanti',
            duplicateWaypointsErrorMessage: 'Si prega di rimuovere i punti di passaggio duplicati',
            atLeastTwoDifferentWaypoints: 'Inserisci almeno due indirizzi diversi',
            splitExpenseMultipleParticipantsErrorMessage: 'Una spesa non pu\u00F2 essere suddivisa tra un workspace e altri membri. Si prega di aggiornare la selezione.',
            invalidMerchant: 'Per favore inserisci un commerciante valido',
            atLeastOneAttendee: 'Deve essere selezionato almeno un partecipante',
            invalidQuantity: 'Per favore, inserisci una quantit\u00E0 valida',
            quantityGreaterThanZero: 'La quantit\u00E0 deve essere maggiore di zero',
            invalidSubrateLength: 'Deve esserci almeno una sottotariffa',
            invalidRate: 'Tariffa non valida per questo spazio di lavoro. Si prega di selezionare una tariffa disponibile dallo spazio di lavoro.',
        },
        dismissReceiptError: 'Ignora errore',
        dismissReceiptErrorConfirmation: 'Attenzione! Ignorare questo errore rimuover\u00E0 completamente la ricevuta caricata. Sei sicuro?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `ha iniziato a saldare. Il pagamento \u00E8 in sospeso fino a quando ${submitterDisplayName} non abilita il loro portafoglio.`,
        enableWallet: 'Abilita portafoglio',
        hold: 'Attesa',
        unhold: 'Rimuovi blocco',
        holdExpense: 'Trattenere spesa',
        unholdExpense: 'Sblocca spesa',
        heldExpense: 'trattenuto questa spesa',
        unheldExpense: 'annullato questa spesa',
        moveUnreportedExpense: 'Sposta spesa non segnalata',
        addUnreportedExpense: 'Aggiungi spesa non segnalata',
        createNewExpense: 'Crea nuova spesa',
        selectUnreportedExpense: 'Seleziona almeno una spesa da aggiungere al rapporto.',
        emptyStateUnreportedExpenseTitle: 'Nessuna spesa non segnalata',
        emptyStateUnreportedExpenseSubtitle: 'Sembra che non hai spese non segnalate. Prova a crearne una qui sotto.',
        addUnreportedExpenseConfirm: 'Aggiungi al report',
        explainHold: 'Spiega perch\u00E9 stai trattenendo questa spesa.',
        undoSubmit: 'Annulla invio',
        retracted: 'ritirato',
        undoClose: 'Annulla chiusura',
        reopened: 'riaperto',
        reopenReport: 'Riapri rapporto',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Questo report \u00E8 gi\u00E0 stato esportato su ${connectionName}. Modificarlo potrebbe portare a discrepanze nei dati. Sei sicuro di voler riaprire questo report?`,
        reason: 'Motivo',
        holdReasonRequired: '\u00C8 richiesta una motivazione per la sospensione.',
        expenseWasPutOnHold: 'La spesa \u00E8 stata messa in attesa',
        expenseOnHold: 'Questa spesa \u00E8 stata messa in sospeso. Si prega di rivedere i commenti per i prossimi passi.',
        expensesOnHold: 'Tutte le spese sono state sospese. Si prega di rivedere i commenti per i prossimi passi.',
        expenseDuplicate: "Questa spesa ha dettagli simili a un'altra. Si prega di rivedere i duplicati per continuare.",
        someDuplicatesArePaid: 'Alcuni di questi duplicati sono gi\u00E0 stati approvati o pagati.',
        reviewDuplicates: 'Rivedi duplicati',
        keepAll: 'Mantieni tutto',
        confirmApprove: "Conferma l'importo dell'approvazione",
        confirmApprovalAmount: "Approva solo le spese conformi o approva l'intero rapporto.",
        confirmApprovalAllHoldAmount: () => ({
            one: 'Questa spesa \u00E8 in sospeso. Vuoi approvare comunque?',
            other: 'Queste spese sono in sospeso. Vuoi approvarle comunque?',
        }),
        confirmPay: "Conferma l'importo del pagamento",
        confirmPayAmount: "Paga ci\u00F2 che non \u00E8 in sospeso o paga l'intero rapporto.",
        confirmPayAllHoldAmount: () => ({
            one: 'Questa spesa \u00E8 in sospeso. Vuoi pagare comunque?',
            other: 'Queste spese sono in sospeso. Vuoi pagare comunque?',
        }),
        payOnly: 'Paga solo',
        approveOnly: 'Approva solo',
        holdEducationalTitle: 'Questa richiesta \u00E8 attiva',
        holdEducationalText: 'tieni',
        whatIsHoldExplain: 'Mettere in sospeso \u00E8 come premere "pausa" su una spesa per chiedere ulteriori dettagli prima dell\'approvazione o del pagamento.',
        holdIsLeftBehind: "Le spese in sospeso vengono spostate su un altro report al momento dell'approvazione o del pagamento.",
        unholdWhenReady: "Gli approvatori possono sbloccare le spese quando sono pronte per l'approvazione o il pagamento.",
        changePolicyEducational: {
            title: 'Hai spostato questo rapporto!',
            description: 'Ricontrolla questi elementi, che tendono a cambiare quando si spostano i rapporti in un nuovo spazio di lavoro.',
            reCategorize: '<strong>Ricategorizza qualsiasi spesa</strong> per rispettare le regole dello spazio di lavoro.',
            workflows: 'Questo report potrebbe ora essere soggetto a un diverso <strong>flusso di approvazione.</strong>',
        },
        changeWorkspace: 'Cambia spazio di lavoro',
        set: 'set',
        changed: 'cambiato',
        removed: 'removed',
        transactionPending: 'Transazione in sospeso.',
        chooseARate: "Seleziona una tariffa di rimborso per miglio o chilometro per l'area di lavoro",
        unapprove: 'Non approvare',
        unapproveReport: 'Disapprova rapporto',
        headsUp: 'Attenzione!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Questo report \u00E8 gi\u00E0 stato esportato su ${accountingIntegration}. Modificarlo potrebbe portare a discrepanze nei dati. Sei sicuro di voler disapprovare questo report?`,
        reimbursable: 'rimborsabile',
        nonReimbursable: 'non-rimborsabile',
        bookingPending: 'Questa prenotazione \u00E8 in sospeso',
        bookingPendingDescription: 'Questa prenotazione \u00E8 in sospeso perch\u00E9 non \u00E8 stata ancora pagata.',
        bookingArchived: 'Questa prenotazione \u00E8 archiviata',
        bookingArchivedDescription: "Questa prenotazione \u00E8 archiviata perch\u00E9 la data del viaggio \u00E8 passata. Aggiungi una spesa per l'importo finale, se necessario.",
        attendees: 'Partecipanti',
        whoIsYourAccountant: 'Chi \u00E8 il tuo commercialista?',
        paymentComplete: 'Pagamento completato',
        time: 'Tempo',
        startDate: 'Data di inizio',
        endDate: 'Data di fine',
        startTime: 'Ora di inizio',
        endTime: 'Ora di fine',
        deleteSubrate: 'Elimina subrate',
        deleteSubrateConfirmation: 'Sei sicuro di voler eliminare questo sottotasso?',
        quantity: 'Quantit\u00E0',
        subrateSelection: 'Seleziona una sottotariffa e inserisci una quantit\u00E0.',
        qty: 'Qt\u00E0',
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
        dates: 'Date di scadenza',
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
        label: 'Notificami sui nuovi messaggi',
        notificationPreferences: {
            always: 'Immediatamente',
            daily: 'Quotidiano',
            mute: 'Silenzia',
            hidden: 'Nascosto',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Il numero non \u00E8 stato convalidato. Clicca il pulsante per rinviare il link di convalida tramite SMS.',
        emailHasNotBeenValidated: "L'email non \u00E8 stata convalidata. Fai clic sul pulsante per rinviare il link di convalida tramite SMS.",
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Carica foto',
        removePhoto: 'Rimuovi foto',
        editImage: 'Modifica foto',
        viewPhoto: 'Visualizza foto',
        imageUploadFailed: "Caricamento dell'immagine non riuscito",
        deleteWorkspaceError: "Spiacenti, si \u00E8 verificato un problema imprevisto nell'eliminare l'avatar del tuo spazio di lavoro.",
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `L'immagine selezionata supera la dimensione massima di caricamento di ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Si prega di caricare un'immagine pi\u00F9 grande di ${minHeightInPx}x${minWidthInPx} pixel e pi\u00F9 piccola di ${maxHeightInPx}x${maxWidthInPx} pixel.`,
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
        avatarUploadFailureMessage: "Si \u00E8 verificato un errore durante il caricamento dell'avatar. Per favore, riprova.",
        online: 'Online',
        offline: 'Offline',
        syncing: 'Sincronizzazione',
        profileAvatar: 'Avatar del profilo',
        publicSection: {
            title: 'Pubblico',
            subtitle: 'Questi dettagli sono visualizzati nel tuo profilo pubblico. Chiunque pu\u00F2 vederli.',
        },
        privateSection: {
            title: 'Privato',
            subtitle: 'Questi dettagli sono utilizzati per viaggi e pagamenti. Non vengono mai mostrati nel tuo profilo pubblico.',
        },
    },
    securityPage: {
        title: 'Opzioni di sicurezza',
        subtitle: "Abilita l'autenticazione a due fattori per mantenere il tuo account sicuro.",
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
        helpTextBeforeEmail: 'Aggiungi pi\u00F9 modi per farti trovare dalle persone e inoltra le ricevute a',
        helpTextAfterEmail: 'da pi\u00F9 indirizzi email.',
        pleaseVerify: 'Si prega di verificare questo metodo di contatto',
        getInTouch: 'Ogni volta che dobbiamo contattarti, useremo questo metodo di contatto.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Per favore, inserisci il codice magico inviato a ${contactMethod}. Dovrebbe arrivare entro un minuto o due.`,
        setAsDefault: 'Imposta come predefinito',
        yourDefaultContactMethod:
            'Questo \u00E8 il tuo metodo di contatto predefinito attuale. Prima di poterlo eliminare, dovrai scegliere un altro metodo di contatto e cliccare su "Imposta come predefinito".',
        removeContactMethod: 'Rimuovi metodo di contatto',
        removeAreYouSure: 'Sei sicuro di voler rimuovere questo metodo di contatto? Questa azione non pu\u00F2 essere annullata.',
        failedNewContact: 'Impossibile aggiungere questo metodo di contatto.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Impossibile inviare un nuovo codice magico. Attendere un momento e riprovare.',
            validateSecondaryLogin: 'Codice magico errato o non valido. Per favore riprova o richiedi un nuovo codice.',
            deleteContactMethod: 'Impossibile eliminare il metodo di contatto. Si prega di contattare Concierge per assistenza.',
            setDefaultContactMethod: 'Impossibile impostare un nuovo metodo di contatto predefinito. Si prega di contattare Concierge per assistenza.',
            addContactMethod: 'Impossibile aggiungere questo metodo di contatto. Per favore contatta Concierge per assistenza.',
            enteredMethodIsAlreadySubmitted: 'Questo metodo di contatto esiste gi\u00E0',
            passwordRequired: 'password richiesto.',
            contactMethodRequired: 'Il metodo di contatto \u00E8 obbligatorio',
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
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Chiamami per nome',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Nome visualizzato',
        isShownOnProfile: 'Il tuo nome visualizzato \u00E8 mostrato sul tuo profilo.',
    },
    timezonePage: {
        timezone: 'Fuso orario',
        isShownOnProfile: 'Il tuo fuso orario \u00E8 mostrato nel tuo profilo.',
        getLocationAutomatically: 'Determina automaticamente la tua posizione',
    },
    updateRequiredView: {
        updateRequired: 'Aggiornamento richiesto',
        pleaseInstall: "Per favore aggiorna all'ultima versione di New Expensify",
        pleaseInstallExpensifyClassic: "Si prega di installare l'ultima versione di Expensify",
        toGetLatestChanges: "Per mobile o desktop, scarica e installa l'ultima versione. Per il web, aggiorna il tuo browser.",
        newAppNotAvailable: 'La nuova app Expensify non \u00E8 pi\u00F9 disponibile.',
    },
    initialSettingsPage: {
        about: 'Informazioni su',
        aboutPage: {
            description:
                'La nuova app Expensify \u00E8 costruita da una comunit\u00E0 di sviluppatori open-source provenienti da tutto il mondo. Aiutaci a costruire il futuro di Expensify.',
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
            clearCacheAndRestart: 'Cancella la cache e riavvia',
            viewConsole: 'Visualizza console di debug',
            debugConsole: 'Console di debug',
            description: "Usa gli strumenti qui sotto per aiutarti a risolvere i problemi con l'esperienza Expensify. Se incontri problemi, per favore",
            submitBug: 'segnala un bug',
            confirmResetDescription: 'Tutti i messaggi di bozza non inviati andranno persi, ma il resto dei tuoi dati \u00E8 al sicuro.',
            resetAndRefresh: 'Reimposta e aggiorna',
            clientSideLogging: 'Registrazione lato client',
            noLogsToShare: 'Nessun registro da condividere',
            useProfiling: 'Usa il profiling',
            profileTrace: 'Traccia del profilo',
            releaseOptions: 'Opzioni di rilascio',
            testingPreferences: 'Preferenze di test',
            useStagingServer: 'Usa il server di staging',
            forceOffline: 'Forza offline',
            simulatePoorConnection: 'Simula connessione internet scadente',
            simulateFailingNetworkRequests: 'Simula richieste di rete non riuscite',
            authenticationStatus: 'Stato di autenticazione',
            deviceCredentials: 'Credenziali del dispositivo',
            invalidate: 'Invalidare',
            destroy: 'Distruggi',
            maskExportOnyxStateData: "Maschera i dati sensibili dei membri durante l'esportazione dello stato di Onyx",
            exportOnyxState: 'Esporta stato Onyx',
            importOnyxState: 'Importa stato Onyx',
            testCrash: 'Test crash',
            resetToOriginalState: 'Ripristina allo stato originale',
            usingImportedState: 'Stai utilizzando uno stato importato. Premi qui per cancellarlo.',
            debugMode: 'Modalit\u00E0 di debug',
            invalidFile: 'File non valido',
            invalidFileDescription: 'Il file che stai tentando di importare non \u00E8 valido. Per favore riprova.',
            invalidateWithDelay: 'Invalidare con ritardo',
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
        restoreStashed: 'Ripristina login nascosto',
        signOutConfirmationText: 'Perderai tutte le modifiche offline se esci.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Leggi il',
            phrase2: 'Termini di servizio',
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
        reasonForLeavingPrompt: 'Ci dispiacerebbe vederti andare via! Potresti gentilmente dirci il motivo, cos\u00EC possiamo migliorare?',
        enterMessageHere: 'Inserisci il messaggio qui',
        closeAccountWarning: 'La chiusura del tuo account non pu\u00F2 essere annullata.',
        closeAccountPermanentlyDeleteData: 'Sei sicuro di voler eliminare il tuo account? Questo eliminer\u00E0 definitivamente tutte le spese in sospeso.',
        enterDefaultContactToConfirm: 'Inserisci il tuo metodo di contatto predefinito per confermare che desideri chiudere il tuo account. Il tuo metodo di contatto predefinito \u00E8:',
        enterDefaultContact: 'Inserisci il tuo metodo di contatto predefinito',
        defaultContact: 'Metodo di contatto predefinito:',
        enterYourDefaultContactMethod: 'Inserisci il tuo metodo di contatto predefinito per chiudere il tuo account.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Unisci account',
        accountDetails: {
            accountToMergeInto: "Inserisci l'account in cui vuoi unire",
            notReversibleConsent: 'Capisco che questo non \u00E8 reversibile',
        },
        accountValidate: {
            confirmMerge: 'Sei sicuro di voler unire gli account?',
            lossOfUnsubmittedData: `Unire i tuoi account \u00E8 irreversibile e comporter\u00E0 la perdita di eventuali spese non inviate per`,
            enterMagicCode: `Per continuare, inserisci il codice magico inviato a`,
            errors: {
                incorrectMagicCode: 'Codice magico errato o non valido. Per favore riprova o richiedi un nuovo codice.',
                fallback: 'Qualcosa \u00E8 andato storto. Per favore riprova pi\u00F9 tardi.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Account uniti!',
            successfullyMergedAllData: {
                beforeFirstEmail: `Hai unito con successo tutti i dati da`,
                beforeSecondEmail: `in`,
                afterSecondEmail: `. D'ora in avanti, puoi utilizzare entrambi i login per questo account.`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Ci stiamo lavorando su',
            limitedSupport: 'Non supportiamo ancora la fusione degli account su New Expensify. Si prega di eseguire questa operazione su Expensify Classic.',
            reachOutForHelp: {
                beforeLink: 'Sentiti libero di',
                linkText: 'contatta Concierge',
                afterLink: 'se hai domande!',
            },
            goToExpensifyClassic: 'Vai a Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Non puoi unire',
            beforeDomain: 'perch\u00E9 \u00E8 controllato da',
            afterDomain: '. Per favore',
            linkText: 'contatta Concierge',
            afterLink: 'per assistenza.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Non puoi unire',
            afterEmail: "in altri account perch\u00E9 l'amministratore del dominio l'ha impostato come login principale. Unisci invece altri account in questo.",
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Non puoi unire gli account perch\u00E9',
                beforeSecondEmail: "ha l'autenticazione a due fattori (2FA) abilitata. Si prega di disabilitare 2FA per",
                afterSecondEmail: 'e riprova.',
            },
            learnMore: 'Scopri di pi\u00F9 sulla fusione degli account.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Non puoi unire',
            afterEmail: 'perch\u00E9 \u00E8 bloccato. Per favore',
            linkText: 'contatta Concierge',
            afterLink: `per assistenza.`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Non puoi unire gli account perch\u00E9',
                afterEmail: 'non ha un account Expensify.',
            },
            addContactMethod: {
                beforeLink: 'Per favore',
                linkText: 'aggiungilo come metodo di contatto',
                afterLink: 'instead.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Non puoi unire',
            afterEmail: 'in altri account. Si prega di unire altri account in esso invece.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Non puoi unire',
            afterEmail: 'in altri account perch\u00E9 \u00E8 il proprietario della fatturazione di un account fatturato. Si prega di unire altri account in questo invece.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Riprova pi\u00F9 tardi',
            description: 'Ci sono stati troppi tentativi di unire gli account. Per favore riprova pi\u00F9 tardi.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "Non puoi unire in altri account perch\u00E9 non \u00E8 convalidato. Per favore, convalida l'account e riprova.",
        },
        mergeFailureSelfMerge: {
            description: 'Non puoi unire un account con se stesso.',
        },
        mergeFailureGenericHeading: 'Impossibile unire gli account',
    },
    lockAccountPage: {
        lockAccount: 'Blocca account',
        unlockAccount: 'Sblocca account',
        compromisedDescription:
            "Se sospetti che il tuo account Expensify sia compromesso, puoi bloccarlo per impedire nuove transazioni con la carta Expensify e bloccare modifiche indesiderate all'account.",
        domainAdminsDescriptionPartOne: 'Per gli amministratori di dominio,',
        domainAdminsDescriptionPartTwo: 'questa azione interrompe tutte le attivit\u00E0 della Carta Expensify e le azioni amministrative',
        domainAdminsDescriptionPartThree: 'attraverso il tuo dominio/i tuoi domini.',
        warning: `Una volta che il tuo account \u00E8 bloccato, il nostro team indagher\u00E0 e rimuover\u00E0 qualsiasi accesso non autorizzato. Per riottenere l'accesso, dovrai collaborare con Concierge per mettere in sicurezza il tuo account.`,
    },
    failedToLockAccountPage: {
        failedToLockAccount: "Impossibile bloccare l'account",
        failedToLockAccountDescription: `Non siamo riusciti a bloccare il tuo account. Per favore, chatta con Concierge per risolvere questo problema.`,
        chatWithConcierge: 'Chatta con Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Account bloccato',
        yourAccountIsLocked: 'Il tuo account \u00E8 bloccato',
        chatToConciergeToUnlock: 'Chatta con Concierge per risolvere le preoccupazioni sulla sicurezza e sbloccare il tuo account.',
        chatWithConcierge: 'Chatta con Concierge',
    },
    passwordPage: {
        changePassword: 'Cambia password',
        changingYourPasswordPrompt: 'Cambiare la tua password aggiorner\u00E0 la password sia per il tuo account Expensify.com che per il tuo account New Expensify.',
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
        disabled: "L'autenticazione a due fattori \u00E8 ora disabilitata",
        noAuthenticatorApp: "Non avrai pi\u00F9 bisogno di un'app autenticatrice per accedere a Expensify.",
        stepCodes: 'Codici di recupero',
        keepCodesSafe: 'Conserva questi codici di recupero al sicuro!',
        codesLoseAccess:
            "Se perdi l'accesso alla tua app di autenticazione e non hai questi codici, perderai l'accesso al tuo account.\n\nNota: Configurare l'autenticazione a due fattori ti disconnetter\u00E0 da tutte le altre sessioni attive.",
        errorStepCodes: 'Si prega di copiare o scaricare i codici prima di continuare',
        stepVerify: 'Verifica',
        scanCode: 'Scansiona il codice QR utilizzando il tuo',
        authenticatorApp: 'app di autenticazione',
        addKey: 'Oppure aggiungi questa chiave segreta alla tua app di autenticazione:',
        enterCode: 'Quindi inserisci il codice a sei cifre generato dalla tua app di autenticazione.',
        stepSuccess: 'Finito',
        enabled: 'Autenticazione a due fattori abilitata',
        congrats: 'Congratulazioni! Ora hai quella sicurezza in pi\u00F9.',
        copy: 'Copia',
        disable: 'Disabilita',
        enableTwoFactorAuth: "Abilita l'autenticazione a due fattori",
        pleaseEnableTwoFactorAuth: "Si prega di abilitare l'autenticazione a due fattori.",
        twoFactorAuthIsRequiredDescription: "Per motivi di sicurezza, Xero richiede l'autenticazione a due fattori per connettere l'integrazione.",
        twoFactorAuthIsRequiredForAdminsHeader: 'Autenticazione a due fattori richiesta',
        twoFactorAuthIsRequiredForAdminsTitle: "Si prega di abilitare l'autenticazione a due fattori",
        twoFactorAuthIsRequiredForAdminsDescription:
            "La tua connessione contabile Xero richiede l'uso dell'autenticazione a due fattori. Per continuare a utilizzare Expensify, ti preghiamo di abilitarla.",
        twoFactorAuthCannotDisable: "Impossibile disabilitare l'autenticazione a due fattori (2FA)",
        twoFactorAuthRequired: "L'autenticazione a due fattori (2FA) \u00E8 richiesta per la tua connessione Xero e non pu\u00F2 essere disabilitata.",
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Per favore, inserisci il tuo codice di recupero',
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
        personalNoteMessage: "Tieni note su questa chat qui. Sei l'unica persona che pu\u00F2 aggiungere, modificare o visualizzare queste note.",
        sharedNoteMessage: 'Tieni traccia delle note su questa chat qui. I dipendenti di Expensify e altri membri del dominio team.expensify.com possono visualizzare queste note.',
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
        changePaymentCurrency: 'Cambia valuta di pagamento',
        paymentCurrency: 'Valuta di pagamento',
        paymentCurrencyDescription: 'Seleziona una valuta standardizzata a cui tutte le spese personali dovrebbero essere convertite',
        note: 'Nota: Cambiare la valuta di pagamento pu\u00F2 influire su quanto pagherai per Expensify. Consulta il nostro',
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
        growlMessageOnSave: 'La tua carta di debito \u00E8 stata aggiunta con successo',
        expensifyPassword: 'Password di Expensify',
        error: {
            invalidName: 'Il nome pu\u00F2 includere solo lettere',
            addressZipCode: 'Per favore, inserisci un CAP valido',
            debitCardNumber: 'Inserisci un numero di carta di debito valido',
            expirationDate: 'Si prega di selezionare una data di scadenza valida',
            securityCode: 'Per favore, inserisci un codice di sicurezza valido',
            addressStreet: 'Inserisci un indirizzo di fatturazione valido che non sia una casella postale',
            addressState: 'Seleziona uno stato per favore',
            addressCity: 'Per favore inserisci una citt\u00E0',
            genericFailureMessage: "Si \u00E8 verificato un errore durante l'aggiunta della tua carta. Per favore riprova.",
            password: 'Per favore, inserisci la tua password di Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Aggiungi carta di pagamento',
        nameOnCard: 'Nome sulla carta',
        paymentCardNumber: 'Numero della carta',
        expiration: 'Data di scadenza',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Indirizzo di fatturazione',
        growlMessageOnSave: 'La tua carta di pagamento \u00E8 stata aggiunta con successo',
        expensifyPassword: 'Password di Expensify',
        error: {
            invalidName: 'Il nome pu\u00F2 includere solo lettere',
            addressZipCode: 'Per favore, inserisci un CAP valido',
            paymentCardNumber: 'Inserisci un numero di carta valido',
            expirationDate: 'Si prega di selezionare una data di scadenza valida',
            securityCode: 'Per favore, inserisci un codice di sicurezza valido',
            addressStreet: 'Inserisci un indirizzo di fatturazione valido che non sia una casella postale',
            addressState: 'Seleziona uno stato per favore',
            addressCity: 'Per favore inserisci una citt\u00E0',
            genericFailureMessage: "Si \u00E8 verificato un errore durante l'aggiunta della tua carta. Per favore riprova.",
            password: 'Per favore, inserisci la tua password di Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Metodi di pagamento',
        setDefaultConfirmation: 'Imposta metodo di pagamento predefinito',
        setDefaultSuccess: 'Metodo di pagamento predefinito impostato!',
        deleteAccount: 'Elimina account',
        deleteConfirmation: 'Sei sicuro di voler eliminare questo account?',
        error: {
            notOwnerOfBankAccount: "Si \u00E8 verificato un errore durante l'impostazione di questo conto bancario come metodo di pagamento predefinito.",
            invalidBankAccount: 'Questo conto bancario \u00E8 temporaneamente sospeso',
            notOwnerOfFund: "Si \u00E8 verificato un errore durante l'impostazione di questa carta come metodo di pagamento predefinito",
            setDefaultFailure: 'Qualcosa \u00E8 andato storto. Si prega di contattare Concierge per ulteriore assistenza.',
        },
        addBankAccountFailure: 'Si \u00E8 verificato un errore imprevisto durante il tentativo di aggiungere il tuo conto bancario. Per favore riprova.',
        getPaidFaster: 'Ricevi il pagamento pi\u00F9 velocemente',
        addPaymentMethod: "Aggiungi un metodo di pagamento per inviare e ricevere pagamenti direttamente nell'app.",
        getPaidBackFaster: 'Ricevi il rimborso pi\u00F9 velocemente',
        secureAccessToYourMoney: 'Accesso sicuro ai tuoi soldi',
        receiveMoney: 'Ricevi denaro nella tua valuta locale',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Invia e ricevi denaro con gli amici. Solo conti bancari statunitensi.',
        enableWallet: 'Abilita portafoglio',
        addBankAccountToSendAndReceive: 'Ricevi il rimborso per le spese che invii a uno spazio di lavoro.',
        addBankAccount: 'Aggiungi conto bancario',
        assignedCards: 'Carte assegnate',
        assignedCardsDescription: 'Queste sono carte assegnate da un amministratore dello spazio di lavoro per gestire le spese aziendali.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Stiamo esaminando le tue informazioni. Torna a controllare tra qualche minuto!',
        walletActivationFailed: 'Purtroppo, il tuo portafoglio non pu\u00F2 essere attivato in questo momento. Per favore, chatta con Concierge per ulteriore assistenza.',
        addYourBankAccount: 'Aggiungi il tuo conto bancario',
        addBankAccountBody: "Colleghiamo il tuo conto bancario a Expensify in modo che sia pi\u00F9 facile che mai inviare e ricevere pagamenti direttamente nell'app.",
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
                `Puoi spendere fino a ${formattedLimit} su questa carta, e il limite verr\u00E0 ripristinato man mano che le tue spese inviate vengono approvate.`,
        },
        fixedLimit: {
            name: 'Limite fisso',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Puoi spendere fino a ${formattedLimit} su questa carta, dopodich\u00E9 si disattiver\u00E0.`,
        },
        monthlyLimit: {
            name: 'Limite mensile',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Puoi spendere fino a ${formattedLimit} su questa carta al mese. Il limite si resetter\u00E0 il primo giorno di ogni mese del calendario.`,
        },
        virtualCardNumber: 'Numero di carta virtuale',
        travelCardCvv: 'CVV della carta di viaggio',
        physicalCardNumber: 'Numero della carta fisica',
        getPhysicalCard: 'Ottieni carta fisica',
        reportFraud: 'Segnala frode con carta virtuale',
        reportTravelFraud: 'Segnala frode sulla carta di viaggio',
        reviewTransaction: 'Rivedi transazione',
        suspiciousBannerTitle: 'Transazione sospetta',
        suspiciousBannerDescription: 'Abbiamo notato transazioni sospette sulla tua carta. Tocca qui sotto per rivederle.',
        cardLocked: 'La tua carta \u00E8 temporaneamente bloccata mentre il nostro team esamina il conto della tua azienda.',
        cardDetails: {
            cardNumber: 'Numero di carta virtuale',
            expiration: 'Scadenza',
            cvv: 'CVV',
            address: 'Indirizzo',
            revealDetails: 'Mostra dettagli',
            revealCvv: 'Rivela CVV',
            copyCardNumber: 'Copia numero della carta',
            updateAddress: 'Aggiorna indirizzo',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Aggiunto al portafoglio ${platform}`,
        cardDetailsLoadingFailure: 'Si \u00E8 verificato un errore durante il caricamento dei dettagli della carta. Controlla la tua connessione a Internet e riprova.',
        validateCardTitle: 'Verifichiamo che sei tu',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Inserisci il codice magico inviato a ${contactMethod} per visualizzare i dettagli della tua carta. Dovrebbe arrivare entro un minuto o due.`,
    },
    workflowsPage: {
        workflowTitle: 'Spesa',
        workflowDescription: 'Configura un flusso di lavoro dal momento in cui si verifica una spesa, includendo approvazione e pagamento.',
        delaySubmissionTitle: 'Ritarda invii',
        delaySubmissionDescription: "Scegli un programma personalizzato per l'invio delle spese, oppure lascia disattivato per aggiornamenti in tempo reale sulle spese.",
        submissionFrequency: 'Frequenza di invio',
        submissionFrequencyDateOfMonth: 'Data del mese',
        addApprovalsTitle: 'Aggiungi approvazioni',
        addApprovalButton: 'Aggiungi flusso di lavoro di approvazione',
        addApprovalTip: 'Questo flusso di lavoro predefinito si applica a tutti i membri, a meno che non esista un flusso di lavoro pi\u00F9 specifico.',
        approver: 'Approvante',
        connectBankAccount: 'Collega conto bancario',
        addApprovalsDescription: "Richiedi un'approvazione aggiuntiva prima di autorizzare un pagamento.",
        makeOrTrackPaymentsTitle: 'Effettua o traccia i pagamenti',
        makeOrTrackPaymentsDescription: 'Aggiungi un pagatore autorizzato per i pagamenti effettuati in Expensify o traccia i pagamenti effettuati altrove.',
        editor: {
            submissionFrequency: 'Scegli quanto tempo Expensify dovrebbe aspettare prima di condividere le spese senza errori.',
        },
        frequencyDescription: 'Scegli con quale frequenza desideri che le spese vengano inviate automaticamente, oppure rendile manuali',
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
        approverInMultipleWorkflows: 'Questo membro appartiene gi\u00E0 a un altro flusso di approvazione. Qualsiasi aggiornamento qui si rifletter\u00E0 anche l\u00EC.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> approva gi\u00E0 i report per <strong>${name2}</strong>. Si prega di scegliere un approvatore diverso per evitare un flusso di lavoro circolare.`,
        emptyContent: {
            title: 'Nessun membro da visualizzare',
            expensesFromSubtitle: 'Tutti i membri dello spazio di lavoro appartengono gi\u00E0 a un flusso di approvazione esistente.',
            approverSubtitle: 'Tutti gli approvatori appartengono a un flusso di lavoro esistente.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'La presentazione ritardata non pu\u00F2 essere modificata. Per favore riprova o contatta il supporto.',
        autoReportingFrequencyErrorMessage: 'La frequenza di invio non pu\u00F2 essere modificata. Riprova o contatta il supporto.',
        monthlyOffsetErrorMessage: 'La frequenza mensile non pu\u00F2 essere modificata. Per favore riprova o contatta il supporto.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Conferma',
        header: 'Aggiungi pi\u00F9 approvatori e conferma.',
        additionalApprover: 'Approvazione aggiuntiva',
        submitButton: 'Aggiungi flusso di lavoro',
    },
    workflowsEditApprovalsPage: {
        title: 'Modifica il flusso di lavoro di approvazione',
        deleteTitle: 'Elimina flusso di approvazione',
        deletePrompt: 'Sei sicuro di voler eliminare questo flusso di lavoro di approvazione? Tutti i membri seguiranno successivamente il flusso di lavoro predefinito.',
    },
    workflowsExpensesFromPage: {
        title: 'Spese da',
        header: 'Quando i seguenti membri presentano spese:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "L'approvatore non pu\u00F2 essere cambiato. Per favore, riprova o contatta il supporto.",
        header: 'Invia a questo membro per approvazione:',
    },
    workflowsPayerPage: {
        title: 'Pagatore autorizzato',
        genericErrorMessage: 'Il pagatore autorizzato non pu\u00F2 essere modificato. Per favore riprova.',
        admins: 'Amministratori',
        payer: 'Pagatore',
        paymentAccount: 'Account di pagamento',
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
        buttonText: 'Capito, grazie!',
    },
    activateCardPage: {
        activateCard: 'Attiva carta',
        pleaseEnterLastFour: 'Inserisci le ultime quattro cifre della tua carta.',
        activatePhysicalCard: 'Attiva carta fisica',
        error: {
            thatDidNotMatch: 'Non corrispondeva alle ultime 4 cifre della tua carta. Per favore riprova.',
            throttled:
                'Hai inserito troppe volte in modo errato le ultime 4 cifre della tua Expensify Card. Se sei sicuro che i numeri siano corretti, contatta Concierge per risolvere. Altrimenti, riprova pi\u00F9 tardi.',
        },
    },
    getPhysicalCard: {
        header: 'Ottieni carta fisica',
        nameMessage: 'Inserisci il tuo nome e cognome, poich\u00E9 verr\u00E0 mostrato sulla tua carta.',
        legalName: 'Nome legale',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        phoneMessage: 'Inserisci il tuo numero di telefono.',
        phoneNumber: 'Numero di telefono',
        address: 'Indirizzo',
        addressMessage: 'Inserisci il tuo indirizzo di spedizione.',
        streetAddress: 'Indirizzo stradale',
        city: 'Citt\u00E0',
        state: 'Stato',
        zipPostcode: 'CAP/Codice postale',
        country: 'Paese',
        confirmMessage: 'Si prega di confermare i propri dati qui sotto.',
        estimatedDeliveryMessage: 'La tua carta fisica arriver\u00E0 in 2-3 giorni lavorativi.',
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
        failedTransfer: 'Il tuo saldo non \u00E8 completamente regolato. Si prega di trasferire su un conto bancario.',
        notHereSubTitle: 'Per favore trasferisci il tuo saldo dalla pagina del portafoglio',
        goToWallet: 'Vai al Portafoglio',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Scegli account',
    },
    paymentMethodList: {
        addPaymentMethod: 'Aggiungi metodo di pagamento',
        addNewDebitCard: 'Aggiungi nuova carta di debito',
        addNewBankAccount: 'Aggiungi nuovo conto bancario',
        accountLastFour: 'Termina con',
        cardLastFour: 'Carta che termina con',
        addFirstPaymentMethod: "Aggiungi un metodo di pagamento per inviare e ricevere pagamenti direttamente nell'app.",
        defaultPaymentMethod: 'Predefinito',
    },
    preferencesPage: {
        appSection: {
            title: "Preferenze dell'app",
        },
        testSection: {
            title: 'Preferenze di test',
            subtitle: "Impostazioni per aiutare a eseguire il debug e testare l'app su staging.",
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Ricevi aggiornamenti sulle funzionalit\u00E0 rilevanti e notizie di Expensify',
        muteAllSounds: 'Disattiva tutti i suoni di Expensify',
    },
    priorityModePage: {
        priorityMode: 'Modalit\u00E0 prioritaria',
        explainerText: 'Scegli se #focus sui messaggi non letti e fissati, o mostra tutto con i messaggi pi\u00F9 recenti e fissati in cima.',
        priorityModes: {
            default: {
                label: 'Pi\u00F9 recente',
                description: 'Mostra tutte le chat ordinate per le pi\u00F9 recenti',
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
        errorPDF: 'Si \u00E8 verificato un errore durante il tentativo di generare il tuo PDF.',
        generatedPDF: 'Il tuo PDF del report \u00E8 stato generato!',
    },
    reportDescriptionPage: {
        roomDescription: 'Descrizione della stanza',
        roomDescriptionOptional: 'Descrizione della stanza (facoltativa)',
        explainerText: 'Imposta una descrizione personalizzata per la stanza.',
    },
    groupChat: {
        lastMemberTitle: 'Attenzione!',
        lastMemberWarning: "Poich\u00E9 sei l'ultima persona qui, uscire render\u00E0 questa chat inaccessibile a tutti i membri. Sei sicuro di voler uscire?",
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Chat di gruppo di ${displayName}`,
    },
    languagePage: {
        language: 'Lingua',
        languages: {
            en: {
                label: 'Inglese',
            },
            es: {
                label: 'Spagnolo',
            },
        },
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
        phrase2: 'Termini di servizio',
        phrase3: 'e',
        phrase4: 'Privacy',
        phrase5: `Il trasferimento di denaro \u00E8 fornito da ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) ai sensi del suo`,
        phrase6: 'licenze',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Non hai ricevuto un codice magico?',
        enterAuthenticatorCode: "Per favore, inserisci il tuo codice dell'autenticatore",
        enterRecoveryCode: 'Per favore, inserisci il tuo codice di recupero',
        requiredWhen2FAEnabled: "Richiesto quando l'autenticazione a due fattori \u00E8 abilitata",
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
        pleaseFillPassword: 'Per favore, inserisci la tua password',
        pleaseFillTwoFactorAuth: 'Inserisci il tuo codice a due fattori',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Inserisci il tuo codice di autenticazione a due fattori per continuare',
        forgot: 'Dimenticato?',
        requiredWhen2FAEnabled: "Richiesto quando l'autenticazione a due fattori \u00E8 abilitata",
        error: {
            incorrectPassword: 'Password errata. Riprova.',
            incorrectLoginOrPassword: 'Accesso o password errati. Per favore riprova.',
            incorrect2fa: 'Codice di autenticazione a due fattori errato. Per favore riprova.',
            twoFactorAuthenticationEnabled: "Hai l'autenticazione a due fattori abilitata su questo account. Accedi utilizzando la tua email o il tuo numero di telefono.",
            invalidLoginOrPassword: 'Accesso o password non validi. Riprova o reimposta la tua password.',
            unableToResetPassword:
                'Non siamo riusciti a cambiare la tua password. Questo \u00E8 probabilmente dovuto a un link di reimpostazione della password scaduto in una vecchia email di reimpostazione della password. Ti abbiamo inviato un nuovo link via email, cos\u00EC puoi riprovare. Controlla la tua Posta in arrivo e la cartella Spam; dovrebbe arrivare tra pochi minuti.',
            noAccess: "Non hai accesso a questa applicazione. Per favore aggiungi il tuo nome utente GitHub per ottenere l'accesso.",
            accountLocked: 'Il tuo account \u00E8 stato bloccato dopo troppi tentativi non riusciti. Riprova tra 1 ora.',
            fallback: 'Qualcosa \u00E8 andato storto. Per favore riprova pi\u00F9 tardi.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefono o email',
        error: {
            invalidFormatEmailLogin: "L'email inserita non \u00E8 valida. Si prega di correggere il formato e riprovare.",
        },
        cannotGetAccountDetails: "Impossibile recuperare i dettagli dell'account. Per favore, prova ad accedere di nuovo.",
        loginForm: 'Modulo di accesso',
        notYou: ({user}: NotYouParams) => `Non ${user}?`,
    },
    onboarding: {
        welcome: 'Benvenuto!',
        welcomeSignOffTitleManageTeam: 'Una volta completati i compiti sopra, possiamo esplorare pi\u00F9 funzionalit\u00E0 come i flussi di lavoro di approvazione e le regole!',
        welcomeSignOffTitle: '\u00C8 un piacere conoscerti!',
        explanationModal: {
            title: 'Benvenuto su Expensify',
            description: "Un'app per gestire le tue spese aziendali e personali alla velocit\u00E0 della chat. Provala e facci sapere cosa ne pensi. Molto altro in arrivo!",
            secondaryDescription: 'Per tornare a Expensify Classic, basta toccare la tua immagine del profilo > Vai a Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Benvenuto su Expensify',
            description: "Un'app per gestire tutte le tue spese aziendali e personali in una chat. Creata per la tua azienda, il tuo team e i tuoi amici.",
        },
        getStarted: 'Inizia',
        whatsYourName: 'Qual \u00E8 il tuo nome?',
        peopleYouMayKnow: 'Persone che potresti conoscere sono gi\u00E0 qui! Verifica la tua email per unirti a loro.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Qualcuno da ${domain} ha gi\u00E0 creato uno spazio di lavoro. Inserisci il codice magico inviato a ${email}.`,
        joinAWorkspace: 'Unisciti a uno spazio di lavoro',
        listOfWorkspaces: "Ecco l'elenco degli spazi di lavoro a cui puoi unirti. Non preoccuparti, puoi sempre unirti in seguito se preferisci.",
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membro${employeeCount > 1 ? 's' : ''} \u2022 ${policyOwner}`,
        whereYouWork: 'Dove lavori?',
        errorSelection: "Seleziona un'opzione per procedere",
        purpose: {
            title: 'Cosa vuoi fare oggi?',
            errorContinue: 'Premi continua per configurare',
            errorBackButton: "Per favore, completa le domande di configurazione per iniziare a utilizzare l'app",
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Essere rimborsato dal mio datore di lavoro',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gestisci le spese del mio team',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Traccia e pianifica le spese',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatta e dividi le spese con gli amici',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: "Qualcos'altro",
        },
        employees: {
            title: 'Quanti dipendenti avete?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Pi\u00F9 di 1.000 dipendenti',
        },
        accounting: {
            title: 'Utilizzi qualche software di contabilit\u00E0?',
            none: 'Nessuno',
        },
        error: {
            requiredFirstName: 'Per favore, inserisci il tuo nome per continuare',
        },
        workEmail: {
            title: 'Qual \u00E8 la tua email di lavoro?',
            subtitle: 'Expensify funziona meglio quando colleghi la tua email di lavoro.',
            explanationModal: {
                descriptionOne: 'Inoltra a receipts@expensify.com per la scansione',
                descriptionTwo: 'Unisciti ai tuoi colleghi che gi\u00E0 utilizzano Expensify',
                descriptionThree: "Goditi un'esperienza pi\u00F9 personalizzata",
            },
            addWorkEmail: 'Aggiungi email di lavoro',
        },
        workEmailValidation: {
            title: 'Verifica il tuo indirizzo email di lavoro',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Per favore inserisci il codice magico inviato a ${workEmail}. Dovrebbe arrivare tra un minuto o due.`,
        },
        workEmailValidationError: {
            publicEmail: "Per favore, inserisci un'email di lavoro valida da un dominio privato, ad esempio mitch@company.com",
            offline: 'Non siamo riusciti ad aggiungere la tua email di lavoro poich\u00E9 sembri essere offline.',
        },
        mergeBlockScreen: {
            title: "Impossibile aggiungere l'email di lavoro",
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Non siamo riusciti ad aggiungere ${workEmail}. Riprova pi\u00F9 tardi nelle Impostazioni o chatta con Concierge per assistenza.`,
        },
        workspace: {
            title: 'Rimani organizzato con uno spazio di lavoro',
            subtitle: 'Sblocca strumenti potenti per semplificare la gestione delle tue spese, tutto in un unico posto. Con uno spazio di lavoro, puoi:',
            explanationModal: {
                descriptionOne: 'Traccia e organizza le ricevute',
                descriptionTwo: 'Classifica e tagga le spese',
                descriptionThree: 'Crea e condividi report',
            },
            price: 'Provalo gratis per 30 giorni, poi passa al piano a soli <strong>5$/mese</strong>.',
            createWorkspace: 'Crea workspace',
        },
        confirmWorkspace: {
            title: 'Conferma spazio di lavoro',
            subtitle: 'Crea uno spazio di lavoro per tracciare le ricevute, rimborsare le spese, gestire i viaggi, creare report e altro ancora, tutto alla velocit\u00E0 della chat.',
        },
        inviteMembers: {
            title: 'Invita membri',
            subtitle: 'Gestisci e condividi le tue spese con un commercialista o avvia un gruppo di viaggio con gli amici.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Non mostrarmelo di nuovo',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Il nome non pu\u00F2 contenere le parole Expensify o Concierge',
            hasInvalidCharacter: 'Il nome non pu\u00F2 contenere una virgola o un punto e virgola',
            requiredFirstName: 'Il nome non pu\u00F2 essere vuoto',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Qual \u00E8 il tuo nome legale?',
        enterDateOfBirth: 'Qual \u00E8 la tua data di nascita?',
        enterAddress: 'Qual \u00E8 il tuo indirizzo?',
        enterPhoneNumber: 'Qual \u00E8 il tuo numero di telefono?',
        personalDetails: 'Dettagli personali',
        privateDataMessage: 'Questi dettagli sono utilizzati per viaggi e pagamenti. Non vengono mai mostrati sul tuo profilo pubblico.',
        legalName: 'Nome legale',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        address: 'Indirizzo',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `La data dovrebbe essere prima di ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `La data dovrebbe essere successiva a ${dateString}`,
            hasInvalidCharacter: 'Il nome pu\u00F2 includere solo caratteri latini',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Formato del codice postale errato${zipFormat ? `Formato accettabile: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Assicurati che il numero di telefono sia valido (ad es. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Il link \u00E8 stato inviato nuovamente',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Ho inviato un link magico di accesso a ${login}. Controlla il tuo ${loginType} per accedere.`,
        resendLink: 'Invia nuovamente il link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Per convalidare ${secondaryLogin}, si prega di rinviare il codice magico dalle Impostazioni dell'Account di ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Se non hai pi\u00F9 accesso a ${primaryLogin}, scollega i tuoi account.`,
        unlink: 'Scollega',
        linkSent: 'Link inviato!',
        successfullyUnlinkedLogin: 'Accesso secondario scollegato con successo!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Il nostro provider di posta elettronica ha temporaneamente sospeso le email a ${login} a causa di problemi di consegna. Per sbloccare il tuo login, segui questi passaggi:`,
        confirmThat: ({login}: ConfirmThatParams) => `Conferma che ${login} sia scritto correttamente e sia un indirizzo email reale e consegnabile.`,
        emailAliases: 'Gli alias email come "expenses@domain.com" devono avere accesso alla propria casella di posta elettronica per essere un login valido su Expensify.',
        ensureYourEmailClient: 'Assicurati che il tuo client di posta elettronica consenta le email da expensify.com.',
        youCanFindDirections: 'Puoi trovare le istruzioni su come completare questo passaggio',
        helpConfigure: 'ma potresti aver bisogno del tuo reparto IT per aiutarti a configurare le impostazioni della tua email.',
        onceTheAbove: 'Una volta completati i passaggi sopra indicati, contatta per favore',
        toUnblock: 'per sbloccare il tuo accesso.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Non siamo riusciti a consegnare i messaggi SMS a ${login}, quindi lo abbiamo sospeso temporaneamente. Per favore, prova a convalidare il tuo numero:`,
        validationSuccess: 'Il tuo numero \u00E8 stato convalidato! Clicca qui sotto per inviare un nuovo codice magico di accesso.',
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
            return `Tieni duro! Devi aspettare ${timeText} prima di provare a convalidare nuovamente il tuo numero.`;
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
        title: 'Benvenuto in modalit\u00E0 #focus!',
        prompt: 'Rimani aggiornato visualizzando solo le chat non lette o quelle che richiedono la tua attenzione. Non preoccuparti, puoi cambiare questa impostazione in qualsiasi momento in',
        settings: 'impostazioni',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'La chat che stai cercando non pu\u00F2 essere trovata.',
        getMeOutOfHere: 'Portami via da qui',
        iouReportNotFound: 'I dettagli di pagamento che stai cercando non possono essere trovati.',
        notHere: 'Hmm... non \u00E8 qui',
        pageNotFound: 'Ops, questa pagina non pu\u00F2 essere trovata',
        noAccess: 'Questa chat o spesa potrebbe essere stata eliminata o potresti non avere accesso ad essa.\n\nPer qualsiasi domanda, contatta concierge@expensify.com',
        goBackHome: 'Torna alla pagina principale',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ops... ${isBreakLine ? '\n' : ''}Qualcosa \u00E8 andato storto`,
        subtitle: 'La tua richiesta non pu\u00F2 essere completata. Per favore riprova pi\u00F9 tardi.',
    },
    setPasswordPage: {
        enterPassword: 'Inserisci una password',
        setPassword: 'Imposta password',
        newPasswordPrompt: 'La tua password deve contenere almeno 8 caratteri, 1 lettera maiuscola, 1 lettera minuscola e 1 numero.',
        passwordFormTitle: 'Bentornato su New Expensify! Imposta la tua password.',
        passwordNotSet: 'Non siamo riusciti a impostare la tua nuova password. Ti abbiamo inviato un nuovo link per riprovare.',
        setPasswordLinkInvalid: 'Questo link per impostare la password non \u00E8 valido o \u00E8 scaduto. Uno nuovo ti sta aspettando nella tua casella di posta elettronica!',
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
            never: 'Mai',
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
        accountEnding: 'Account con termine in',
        thisBankAccount: 'Questo conto bancario verr\u00E0 utilizzato per i pagamenti aziendali nel tuo spazio di lavoro.',
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
        plaidBodyCopy: 'Offri ai tuoi dipendenti un modo pi\u00F9 semplice per pagare - e farsi rimborsare - le spese aziendali.',
        checkHelpLine: 'Il tuo numero di instradamento e il numero di conto possono essere trovati su un assegno per il conto.',
        hasPhoneLoginError: {
            phrase1: 'Per collegare un conto bancario, per favore',
            link: "aggiungi un'email come login principale",
            phrase2: 'e riprova. Puoi aggiungere il tuo numero di telefono come login secondario.',
        },
        hasBeenThrottledError: "Si \u00E8 verificato un errore durante l'aggiunta del tuo conto bancario. Attendi qualche minuto e riprova.",
        hasCurrencyError: {
            phrase1: 'Ops! Sembra che la valuta del tuo spazio di lavoro sia impostata su una valuta diversa da USD. Per procedere, vai a',
            link: 'le impostazioni del tuo spazio di lavoro',
            phrase2: 'impostarlo su USD e riprovare.',
        },
        error: {
            youNeedToSelectAnOption: "Si prega di selezionare un'opzione per procedere",
            noBankAccountAvailable: "Spiacenti, non c'\u00E8 nessun conto bancario disponibile",
            noBankAccountSelected: 'Si prega di scegliere un account',
            taxID: 'Si prega di inserire un numero di identificazione fiscale valido',
            website: 'Per favore inserisci un sito web valido',
            zipCode: `Inserisci un CAP valido utilizzando il formato: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Per favore, inserisci un numero di telefono valido',
            email: 'Per favore, inserisci un indirizzo email valido',
            companyName: 'Per favore, inserisci un nome aziendale valido',
            addressCity: 'Per favore, inserisci una citt\u00E0 valida',
            addressStreet: 'Per favore, inserisci un indirizzo valido',
            addressState: 'Seleziona un stato valido per favore',
            incorporationDateFuture: 'La data di costituzione non pu\u00F2 essere nel futuro',
            incorporationState: 'Seleziona un stato valido per favore',
            industryCode: "Inserisci un codice di classificazione dell'industria valido con sei cifre",
            restrictedBusiness: "Si prega di confermare che l'azienda non \u00E8 nell'elenco delle attivit\u00E0 commerciali soggette a restrizioni.",
            routingNumber: 'Si prega di inserire un numero di instradamento valido',
            accountNumber: 'Per favore inserisci un numero di conto valido',
            routingAndAccountNumberCannotBeSame: 'I numeri di routing e di conto non possono corrispondere',
            companyType: 'Si prega di selezionare un tipo di azienda valido',
            tooManyAttempts:
                'A causa di un numero elevato di tentativi di accesso, questa opzione \u00E8 stata disabilitata per 24 ore. Si prega di riprovare pi\u00F9 tardi o inserire i dettagli manualmente.',
            address: 'Per favore inserisci un indirizzo valido',
            dob: 'Si prega di selezionare una data di nascita valida',
            age: 'Devi avere pi\u00F9 di 18 anni',
            ssnLast4: 'Inserisci gli ultimi 4 cifre valide del SSN',
            firstName: 'Per favore, inserisci un nome valido.',
            lastName: 'Per favore, inserisci un cognome valido',
            noDefaultDepositAccountOrDebitCardAvailable: 'Si prega di aggiungere un conto di deposito predefinito o una carta di debito',
            validationAmounts: "Gli importi di convalida inseriti sono errati. Si prega di ricontrollare l'estratto conto bancario e riprovare.",
            fullName: 'Per favore, inserisci un nome completo valido',
            ownershipPercentage: 'Inserisci un numero percentuale valido',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Dove si trova il tuo conto bancario?',
        accountDetailsStepHeader: 'Quali sono i dettagli del tuo account?',
        accountTypeStepHeader: 'Che tipo di account \u00E8 questo?',
        bankInformationStepHeader: 'Quali sono i tuoi dati bancari?',
        accountHolderInformationStepHeader: 'Quali sono i dettagli del titolare del conto?',
        howDoWeProtectYourData: 'Come proteggiamo i tuoi dati?',
        currencyHeader: 'Qual \u00E8 la valuta del tuo conto bancario?',
        confirmationStepHeader: 'Controlla le tue informazioni.',
        confirmationStepSubHeader: 'Controlla nuovamente i dettagli qui sotto e seleziona la casella dei termini per confermare.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Inserisci la password di Expensify',
        alreadyAdded: 'Questo account \u00E8 gi\u00E0 stato aggiunto.',
        chooseAccountLabel: 'Account',
        successTitle: 'Conto bancario personale aggiunto!',
        successMessage: 'Congratulazioni, il tuo conto bancario \u00E8 configurato e pronto a ricevere rimborsi.',
    },
    attachmentView: {
        unknownFilename: 'Nome file sconosciuto',
        passwordRequired: 'Per favore, inserisci una password',
        passwordIncorrect: 'Password errata. Riprova.',
        failedToLoadPDF: 'Impossibile caricare il file PDF',
        pdfPasswordForm: {
            title: 'PDF protetto da password',
            infoText: 'Questo PDF \u00E8 protetto da password.',
            beforeLinkText: 'Per favore',
            linkText: 'inserisci la password',
            afterLinkText: 'per visualizzarlo.',
            formLabel: 'Visualizza PDF',
        },
        attachmentNotFound: 'Allegato non trovato',
    },
    messages: {
        errorMessageInvalidPhone: `Per favore, inserisci un numero di telefono valido senza parentesi o trattini. Se sei fuori dagli Stati Uniti, includi il tuo prefisso internazionale (es. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Email non valido',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} \u00E8 gi\u00E0 un membro di ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Continuando con la richiesta di attivare il tuo Expensify Wallet, confermi di aver letto, compreso e accettato',
        facialScan: 'Politica e Rilascio della Scansione Facciale di Onfido',
        tryAgain: 'Riprova',
        verifyIdentity: 'Verifica identit\u00E0',
        letsVerifyIdentity: 'Verifichiamo la tua identit\u00E0',
        butFirst: `Ma prima, le cose noiose. Leggi le informazioni legali nel passaggio successivo e fai clic su "Accetta" quando sei pronto.`,
        genericError: "Si \u00E8 verificato un errore durante l'elaborazione di questo passaggio. Per favore riprova.",
        cameraPermissionsNotGranted: "Abilita l'accesso alla fotocamera",
        cameraRequestMessage: 'Abbiamo bisogno di accedere alla tua fotocamera per completare la verifica del conto bancario. Abilita tramite Impostazioni > New Expensify.',
        microphonePermissionsNotGranted: "Abilita l'accesso al microfono",
        microphoneRequestMessage: "Abbiamo bisogno dell'accesso al tuo microfono per completare la verifica del conto bancario. Abilitalo tramite Impostazioni > New Expensify.",
        originalDocumentNeeded: "Si prega di caricare un'immagine originale del tuo documento d'identit\u00E0 piuttosto che uno screenshot o un'immagine scannerizzata.",
        documentNeedsBetterQuality:
            "Il tuo documento d'identit\u00E0 sembra essere danneggiato o mancano delle caratteristiche di sicurezza. Carica un'immagine originale di un documento d'identit\u00E0 non danneggiato e completamente visibile.",
        imageNeedsBetterQuality:
            "C'\u00E8 un problema con la qualit\u00E0 dell'immagine del tuo documento d'identit\u00E0. Per favore, carica una nuova immagine in cui l'intero documento d'identit\u00E0 sia chiaramente visibile.",
        selfieIssue: "C'\u00E8 un problema con il tuo selfie/video. Per favore carica un selfie/video dal vivo.",
        selfieNotMatching: "Il tuo selfie/video non corrisponde al tuo documento d'identit\u00E0. Carica un nuovo selfie/video in cui il tuo viso sia chiaramente visibile.",
        selfieNotLive: 'La tua selfie/video non sembra essere una foto/video dal vivo. Per favore carica una selfie/video dal vivo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dettagli aggiuntivi',
        helpText: 'Dobbiamo confermare le seguenti informazioni prima che tu possa inviare e ricevere denaro dal tuo portafoglio.',
        helpTextIdologyQuestions: 'Abbiamo bisogno di farti solo alcune altre domande per completare la convalida della tua identit\u00E0.',
        helpLink: 'Scopri di pi\u00F9 sul perch\u00E9 ne abbiamo bisogno.',
        legalFirstNameLabel: 'Nome legale',
        legalMiddleNameLabel: 'Secondo nome legale',
        legalLastNameLabel: 'Cognome legale',
        selectAnswer: 'Seleziona una risposta per procedere',
        ssnFull9Error: 'Inserisci un SSN valido di nove cifre',
        needSSNFull9: 'Stiamo riscontrando problemi nel verificare il tuo SSN. Inserisci tutti e nove i numeri del tuo SSN.',
        weCouldNotVerify: 'Non siamo riusciti a verificare',
        pleaseFixIt: 'Si prega di correggere queste informazioni prima di continuare',
        failedKYCTextBefore: 'Non siamo riusciti a verificare la tua identit\u00E0. Riprova pi\u00F9 tardi o contatta',
        failedKYCTextAfter: 'se hai domande.',
    },
    termsStep: {
        headerTitle: 'Termini e commissioni',
        headerTitleRefactor: 'Commissioni e termini',
        haveReadAndAgree: 'Ho letto e accetto di ricevere',
        electronicDisclosures: 'divulgazioni elettroniche',
        agreeToThe: 'Accetto il',
        walletAgreement: 'Accordo del portafoglio',
        enablePayments: 'Abilita pagamenti',
        monthlyFee: 'Tariffa mensile',
        inactivity: 'Inattivit\u00E0',
        noOverdraftOrCredit: 'Nessuna funzione di scoperto/credito.',
        electronicFundsWithdrawal: 'Prelievo di fondi elettronico',
        standard: 'Standard',
        reviewTheFees: "Dai un'occhiata ad alcune commissioni.",
        checkTheBoxes: 'Si prega di selezionare le caselle sottostanti.',
        agreeToTerms: 'Accetta i termini e sarai pronto per partire!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Il Portafoglio Expensify \u00E8 emesso da ${walletProgram}.`,
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
            weChargeOneFee: 'Addebitiamo 1 altro tipo di commissione. \u00C8:',
            fdicInsurance: "I tuoi fondi sono idonei per l'assicurazione FDIC.",
            generalInfo: 'Per informazioni generali sui conti prepagati, visita',
            conditionsDetails: 'Per dettagli e condizioni su tutte le commissioni e i servizi, visita',
            conditionsPhone: 'o chiamando il +1 833-400-0904.',
            instant: '(istantaneo)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Un elenco di tutte le commissioni del portafoglio Expensify',
            typeOfFeeHeader: 'Tutte le commissioni',
            feeAmountHeader: 'Importo',
            moreDetailsHeader: 'Dettagli',
            openingAccountTitle: 'Apertura di un account',
            openingAccountDetails: "Non c'\u00E8 alcuna commissione per aprire un account.",
            monthlyFeeDetails: "Non c'\u00E8 nessun costo mensile.",
            customerServiceTitle: 'Servizio clienti',
            customerServiceDetails: 'Non ci sono commissioni per il servizio clienti.',
            inactivityDetails: 'Non ci sono commissioni di inattivit\u00E0.',
            sendingFundsTitle: 'Invio di fondi a un altro titolare di conto',
            sendingFundsDetails: 'Non ci sono commissioni per inviare fondi a un altro titolare di conto utilizzando il tuo saldo, conto bancario o carta di debito.',
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
        activatedMessage: 'Congratulazioni, il tuo portafoglio \u00E8 configurato e pronto per effettuare pagamenti.',
        checkBackLaterTitle: 'Un minuto...',
        checkBackLaterMessage: 'Stiamo ancora esaminando le tue informazioni. Si prega di ricontrollare pi\u00F9 tardi.',
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
        incorporationState: 'Stato di costituzione',
        industryClassificationCode: 'Codice di classificazione industriale',
        confirmCompanyIsNot: 'Confermo che questa azienda non \u00E8 nella',
        listOfRestrictedBusinesses: 'elenco di attivit\u00E0 commerciali soggette a restrizioni',
        incorporationDatePlaceholder: 'Data di inizio (aaaa-mm-gg)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnership',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Ditta individuale',
            OTHER: 'Altro',
        },
        industryClassification: "In quale settore \u00E8 classificata l'azienda?",
        industryClassificationCodePlaceholder: "Cerca il codice di classificazione dell'industria",
    },
    requestorStep: {
        headerTitle: 'Informazioni personali',
        learnMore: 'Scopri di pi\u00F9',
        isMyDataSafe: 'I miei dati sono al sicuro?',
    },
    personalInfoStep: {
        personalInfo: 'Informazioni personali',
        enterYourLegalFirstAndLast: 'Qual \u00E8 il tuo nome legale?',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        legalName: 'Nome legale',
        enterYourDateOfBirth: 'Qual \u00E8 la tua data di nascita?',
        enterTheLast4: 'Quali sono le ultime quattro cifre del tuo numero di previdenza sociale?',
        dontWorry: 'Non preoccuparti, non facciamo alcun controllo del credito personale!',
        last4SSN: 'Ultime 4 del SSN',
        enterYourAddress: 'Qual \u00E8 il tuo indirizzo?',
        address: 'Indirizzo',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        byAddingThisBankAccount: 'Aggiungendo questo conto bancario, confermi di aver letto, compreso e accettato',
        whatsYourLegalName: 'Qual \u00E8 il tuo nome legale?',
        whatsYourDOB: 'Qual \u00E8 la tua data di nascita?',
        whatsYourAddress: 'Qual \u00E8 il tuo indirizzo?',
        whatsYourSSN: 'Quali sono le ultime quattro cifre del tuo numero di previdenza sociale?',
        noPersonalChecks: 'Non preoccuparti, qui non ci sono controlli del credito personali!',
        whatsYourPhoneNumber: 'Qual \u00E8 il tuo numero di telefono?',
        weNeedThisToVerify: 'Abbiamo bisogno di questo per verificare il tuo portafoglio.',
    },
    businessInfoStep: {
        businessInfo: "Informazioni sull'azienda",
        enterTheNameOfYourBusiness: 'Qual \u00E8 il nome della tua azienda?',
        businessName: "Nome legale dell'azienda",
        enterYourCompanyTaxIdNumber: 'Qual \u00E8 il numero di partita IVA della tua azienda?',
        taxIDNumber: 'Numero di identificazione fiscale',
        taxIDNumberPlaceholder: '9 cifre',
        enterYourCompanyWebsite: 'Qual \u00E8 il sito web della tua azienda?',
        companyWebsite: "Sito web dell'azienda",
        enterYourCompanyPhoneNumber: 'Qual \u00E8 il numero di telefono della tua azienda?',
        enterYourCompanyAddress: "Qual \u00E8 l'indirizzo della tua azienda?",
        selectYourCompanyType: 'Che tipo di azienda \u00E8?',
        companyType: 'Tipo di azienda',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnership',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Ditta individuale',
            OTHER: 'Altro',
        },
        selectYourCompanyIncorporationDate: 'Qual \u00E8 la data di costituzione della tua azienda?',
        incorporationDate: 'Data di costituzione',
        incorporationDatePlaceholder: 'Data di inizio (aaaa-mm-gg)',
        incorporationState: 'Stato di costituzione',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In quale stato \u00E8 stata costituita la tua azienda?',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        companyAddress: "Indirizzo dell'azienda",
        listOfRestrictedBusinesses: 'elenco di attivit\u00E0 commerciali soggette a restrizioni',
        confirmCompanyIsNot: 'Confermo che questa azienda non \u00E8 nella',
        businessInfoTitle: 'Informazioni aziendali',
        legalBusinessName: "Nome legale dell'azienda",
        whatsTheBusinessName: "Qual \u00E8 il nome dell'azienda?",
        whatsTheBusinessAddress: "Qual \u00E8 l'indirizzo dell'azienda?",
        whatsTheBusinessContactInformation: 'Quali sono le informazioni di contatto aziendali?',
        whatsTheBusinessRegistrationNumber: "Qual \u00E8 il numero di registrazione dell'azienda?",
        whatsTheBusinessTaxIDEIN: 'Qual \u00E8 il numero di identificazione fiscale aziendale/ID fiscale/VAT/GST?',
        whatsThisNumber: 'Qual \u00E8 questo numero?',
        whereWasTheBusinessIncorporated: "Dove \u00E8 stata costituita l'azienda?",
        whatTypeOfBusinessIsIt: 'Che tipo di attivit\u00E0 \u00E8?',
        whatsTheBusinessAnnualPayment: "Qual \u00E8 il volume annuale dei pagamenti dell'azienda?",
        whatsYourExpectedAverageReimbursements: "Qual \u00E8 l'importo medio di rimborso che ti aspetti?",
        registrationNumber: 'Numero di registrazione',
        taxIDEIN: 'Numero di identificazione fiscale/EIN',
        businessAddress: 'Indirizzo aziendale',
        businessType: 'Tipo di attivit\u00E0',
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
        selectIncorporationCountry: 'Seleziona il paese di costituzione',
        selectIncorporationState: 'Seleziona lo stato di incorporazione',
        selectAverageReimbursement: "Seleziona l'importo medio del rimborso",
        findIncorporationType: 'Trova il tipo di incorporazione',
        findBusinessCategory: 'Trova categoria aziendale',
        findAnnualPaymentVolume: 'Trova il volume di pagamento annuale',
        findIncorporationState: 'Trova lo stato di incorporazione',
        findAverageReimbursement: "Trova l'importo medio del rimborso",
        error: {
            registrationNumber: 'Si prega di fornire un numero di registrazione valido',
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Possiedi il 25% o pi\u00F9 di',
        doAnyIndividualOwn25percent: 'Qualcuno possiede il 25% o pi\u00F9 di',
        areThereMoreIndividualsWhoOwn25percent: 'Ci sono pi\u00F9 individui che possiedono il 25% o pi\u00F9 di',
        regulationRequiresUsToVerifyTheIdentity: "La normativa richiede di verificare l'identit\u00E0 di qualsiasi individuo che possieda pi\u00F9 del 25% dell'azienda.",
        companyOwner: "Proprietario dell'azienda",
        enterLegalFirstAndLastName: 'Qual \u00E8 il nome legale del proprietario?',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        enterTheDateOfBirthOfTheOwner: 'Qual \u00E8 la data di nascita del proprietario?',
        enterTheLast4: 'Quali sono le ultime 4 cifre del numero di previdenza sociale del proprietario?',
        last4SSN: 'Ultime 4 del SSN',
        dontWorry: 'Non preoccuparti, non facciamo alcun controllo del credito personale!',
        enterTheOwnersAddress: "Qual \u00E8 l'indirizzo del proprietario?",
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        legalName: 'Nome legale',
        address: 'Indirizzo',
        byAddingThisBankAccount: 'Aggiungendo questo conto bancario, confermi di aver letto, compreso e accettato',
        owners: 'Proprietari',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informazioni del proprietario',
        businessOwner: "Proprietario dell'azienda",
        signerInfo: 'Informazioni sul firmatario',
        doYouOwn: ({companyName}: CompanyNameParams) => `Possiedi il 25% o pi\u00F9 di ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Qualcuno possiede il 25% o pi\u00F9 di ${companyName}?`,
        regulationsRequire: "Le normative ci impongono di verificare l'identit\u00E0 di qualsiasi individuo che possieda pi\u00F9 del 25% dell'azienda.",
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        whatsTheOwnersName: 'Qual \u00E8 il nome legale del proprietario?',
        whatsYourName: 'Qual \u00E8 il tuo nome legale?',
        whatPercentage: "Quale percentuale dell'azienda appartiene al proprietario?",
        whatsYoursPercentage: "Quale percentuale dell'azienda possiedi?",
        ownership: 'Propriet\u00E0',
        whatsTheOwnersDOB: 'Qual \u00E8 la data di nascita del proprietario?',
        whatsYourDOB: 'Qual \u00E8 la tua data di nascita?',
        whatsTheOwnersAddress: "Qual \u00E8 l'indirizzo del proprietario?",
        whatsYourAddress: 'Qual \u00E8 il tuo indirizzo?',
        whatAreTheLast: 'Quali sono le ultime 4 cifre del numero di previdenza sociale del proprietario?',
        whatsYourLast: 'Quali sono le ultime 4 cifre del tuo numero di previdenza sociale?',
        dontWorry: 'Non preoccuparti, non facciamo alcun controllo del credito personale!',
        last4: 'Ultime 4 del SSN',
        whyDoWeAsk: 'Perch\u00E9 lo chiediamo?',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        legalName: 'Nome legale',
        ownershipPercentage: 'Percentuale di propriet\u00E0',
        areThereOther: ({companyName}: CompanyNameParams) => `Ci sono altre persone che possiedono il 25% o pi\u00F9 di ${companyName}?`,
        owners: 'Proprietari',
        addCertified: 'Aggiungi un organigramma certificato che mostri i proprietari beneficiari',
        regulationRequiresChart:
            "La normativa richiede di raccogliere una copia certificata dell'organigramma di propriet\u00E0 che mostri ogni individuo o entit\u00E0 che possiede il 25% o pi\u00F9 dell'azienda.",
        uploadEntity: "Carica il grafico di propriet\u00E0 dell'entit\u00E0",
        noteEntity: "Nota: Il grafico di propriet\u00E0 dell'entit\u00E0 deve essere firmato dal tuo commercialista, consulente legale o notarizzato.",
        certified: "Grafico di propriet\u00E0 dell'entit\u00E0 certificata",
        selectCountry: 'Seleziona paese',
        findCountry: 'Trova paese',
        address: 'Indirizzo',
        chooseFile: 'Scegli file',
        uploadDocuments: 'Carica documentazione aggiuntiva',
        pleaseUpload:
            "Si prega di caricare la documentazione aggiuntiva qui sotto per aiutarci a verificare la vostra identit\u00E0 come proprietario diretto o indiretto del 25% o pi\u00F9 dell'entit\u00E0 aziendale.",
        acceptedFiles: 'Formati di file accettati: PDF, PNG, JPEG. La dimensione totale del file per ciascuna sezione non pu\u00F2 superare i 5 MB.',
        proofOfBeneficialOwner: 'Prova del beneficiario effettivo',
        proofOfBeneficialOwnerDescription:
            "Si prega di fornire un'attestazione firmata e un organigramma da un contabile pubblico, notaio o avvocato che verifichi la propriet\u00E0 del 25% o pi\u00F9 dell'azienda. Deve essere datato negli ultimi tre mesi e includere il numero di licenza del firmatario.",
        copyOfID: "Copia del documento d'identit\u00E0 per il titolare effettivo",
        copyOfIDDescription: 'Esempi: passaporto, patente di guida, ecc.',
        proofOfAddress: 'Prova di indirizzo per il beneficiario effettivo',
        proofOfAddressDescription: 'Esempi: Bolletta delle utenze, contratto di affitto, ecc.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            "Si prega di caricare un video di una visita al sito o una chiamata registrata con il responsabile della firma. L'ufficiale deve fornire: nome completo, data di nascita, nome dell'azienda, numero di registrazione, codice fiscale, indirizzo registrato, natura dell'attivit\u00E0 e scopo del conto.",
    },
    validationStep: {
        headerTitle: 'Convalida conto bancario',
        buttonText: 'Completa la configurazione',
        maxAttemptsReached: 'La convalida per questo conto bancario \u00E8 stata disabilitata a causa di troppi tentativi errati.',
        description: `Entro 1-2 giorni lavorativi, invieremo tre (3) piccole transazioni al tuo conto bancario da un nome come "Expensify, Inc. Validation".`,
        descriptionCTA: "Inserisci l'importo di ciascuna transazione nei campi sottostanti. Esempio: 1.51.",
        reviewingInfo: 'Grazie! Stiamo esaminando le tue informazioni e ti contatteremo a breve. Per favore, controlla la tua chat con Concierge.',
        forNextStep: 'per i prossimi passi per completare la configurazione del tuo conto bancario.',
        letsChatCTA: 'S\u00EC, parliamo',
        letsChatText: 'Quasi fatto! Abbiamo bisogno del tuo aiuto per verificare alcune ultime informazioni tramite chat. Pronto?',
        letsChatTitle: 'Parliamo!',
        enable2FATitle: "Previeni le frodi, abilita l'autenticazione a due fattori (2FA)",
        enable2FAText: "Prendiamo sul serio la tua sicurezza. Configura ora l'autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.",
        secureYourAccount: 'Proteggi il tuo account',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Informazioni aggiuntive',
        checkAllThatApply: 'Seleziona tutte le opzioni applicabili, altrimenti lascia vuoto.',
        iOwnMoreThan25Percent: 'Possiedo pi\u00F9 del 25% di',
        someoneOwnsMoreThan25Percent: 'Qualcun altro possiede pi\u00F9 del 25% di',
        additionalOwner: 'Proprietario beneficiario aggiuntivo',
        removeOwner: 'Rimuovi questo titolare effettivo',
        addAnotherIndividual: "Aggiungi un'altra persona che possiede pi\u00F9 del 25% di",
        agreement: 'Accordo:',
        termsAndConditions: 'termini e condizioni',
        certifyTrueAndAccurate: 'Certifico che le informazioni fornite sono veritiere e accurate.',
        error: {
            certify: 'Deve certificare che le informazioni sono veritiere e accurate',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Completa la verifica',
        confirmAgreements: 'Si prega di confermare gli accordi di seguito.',
        certifyTrueAndAccurate: 'Certifico che le informazioni fornite sono veritiere e accurate.',
        certifyTrueAndAccurateError: 'Si prega di certificare che le informazioni sono veritiere e accurate',
        isAuthorizedToUseBankAccount: 'Sono autorizzato a utilizzare questo conto bancario aziendale per le spese aziendali',
        isAuthorizedToUseBankAccountError: "Devi essere un responsabile di controllo con l'autorizzazione a operare sul conto bancario aziendale.",
        termsAndConditions: 'termini e condizioni',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Collega conto bancario',
        finishButtonText: 'Completa la configurazione',
        validateYourBankAccount: 'Convalida il tuo conto bancario',
        validateButtonText: 'Convalida',
        validationInputLabel: 'Transazione',
        maxAttemptsReached: 'La convalida per questo conto bancario \u00E8 stata disabilitata a causa di troppi tentativi errati.',
        description: `Entro 1-2 giorni lavorativi, invieremo tre (3) piccole transazioni al tuo conto bancario da un nome come "Expensify, Inc. Validation".`,
        descriptionCTA: "Inserisci l'importo di ciascuna transazione nei campi sottostanti. Esempio: 1.51.",
        reviewingInfo: 'Grazie! Stiamo esaminando le tue informazioni e ti contatteremo a breve. Controlla la tua chat con Concierge.',
        forNextSteps: 'per i prossimi passi per completare la configurazione del tuo conto bancario.',
        letsChatCTA: 'S\u00EC, parliamo',
        letsChatText: 'Quasi fatto! Abbiamo bisogno del tuo aiuto per verificare alcune ultime informazioni tramite chat. Pronto?',
        letsChatTitle: 'Parliamo!',
        enable2FATitle: "Previeni le frodi, abilita l'autenticazione a due fattori (2FA)",
        enable2FAText: "Prendiamo sul serio la tua sicurezza. Configura ora l'autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.",
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
        thisBankAccount: 'Questo conto bancario verr\u00E0 utilizzato per i pagamenti aziendali nel tuo spazio di lavoro.',
        accountNumber: 'Numero di conto',
        accountHolderNameDescription: 'Nome completo del firmatario autorizzato',
    },
    signerInfoStep: {
        signerInfo: 'Informazioni sul firmatario',
        areYouDirector: ({companyName}: CompanyNameParams) => `Sei un direttore o un dirigente senior presso ${companyName}?`,
        regulationRequiresUs: "La normativa richiede di verificare se il firmatario ha l'autorit\u00E0 di intraprendere questa azione per conto dell'azienda.",
        whatsYourName: 'Qual \u00E8 il tuo nome legale?',
        fullName: 'Nome completo legale',
        whatsYourJobTitle: 'Qual \u00E8 il tuo titolo di lavoro?',
        jobTitle: 'Titolo di lavoro',
        whatsYourDOB: 'Qual \u00E8 la tua data di nascita?',
        uploadID: "Carica documento d'identit\u00E0 e prova di indirizzo",
        personalAddress: 'Prova di indirizzo personale (ad esempio, bolletta)',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        legalName: 'Nome legale',
        proofOf: 'Prova di indirizzo personale',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Inserisci l'email del direttore o dirigente senior presso ${companyName}`,
        regulationRequiresOneMoreDirector: 'La normativa richiede almeno un altro direttore o dirigente senior come firmatario.',
        hangTight: 'Aspetta un attimo...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Inserisci le email di due direttori o dirigenti senior presso ${companyName}`,
        sendReminder: 'Invia un promemoria',
        chooseFile: 'Scegli file',
        weAreWaiting: "Stiamo aspettando che altri verifichino la loro identit\u00E0 come direttori o dirigenti senior dell'azienda.",
        id: "Copia di documento d'identit\u00E0",
        proofOfDirectors: 'Prova del/i direttore/i',
        proofOfDirectorsDescription: 'Esempi: Profilo aziendale Oncorp o registrazione aziendale.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale per Firmatari, Utenti Autorizzati e Beneficiari Effettivi.',
        PDSandFSG: 'Documentazione di divulgazione PDS + FSG',
        PDSandFSGDescription:
            'La nostra partnership con Corpay utilizza una connessione API per sfruttare la loro vasta rete di partner bancari internazionali per alimentare i Rimborsi Globali in Expensify. In conformit\u00E0 con la normativa australiana, ti forniamo la Guida ai Servizi Finanziari (FSG) e la Dichiarazione di Informazioni sui Prodotti (PDS) di Corpay.\n\nSi prega di leggere attentamente i documenti FSG e PDS in quanto contengono dettagli completi e informazioni importanti sui prodotti e servizi offerti da Corpay. Conserva questi documenti per riferimento futuro.',
        pleaseUpload: "Si prega di caricare ulteriore documentazione qui sotto per aiutarci a verificare la tua identit\u00E0 come direttore o dirigente senior dell'entit\u00E0 aziendale.",
    },
    agreementsStep: {
        agreements: 'Accordi',
        pleaseConfirm: 'Si prega di confermare gli accordi di seguito',
        regulationRequiresUs: "La normativa richiede di verificare l'identit\u00E0 di qualsiasi individuo che possieda pi\u00F9 del 25% dell'azienda.",
        iAmAuthorized: 'Sono autorizzato a utilizzare il conto bancario aziendale per le spese aziendali.',
        iCertify: 'Certifico che le informazioni fornite sono veritiere e accurate.',
        termsAndConditions: 'termini e condizioni',
        accept: 'Accetta e aggiungi conto bancario',
        iConsentToThe: 'Acconsento al',
        privacyNotice: 'informativa sulla privacy',
        error: {
            authorized: "Devi essere un responsabile di controllo con l'autorizzazione a operare sul conto bancario aziendale.",
            certify: 'Si prega di certificare che le informazioni sono veritiere e accurate',
            consent: "Si prega di acconsentire all'informativa sulla privacy",
        },
    },
    finishStep: {
        connect: 'Collega conto bancario',
        letsFinish: 'Finiamo in chat!',
        thanksFor:
            'Grazie per questi dettagli. Un agente di supporto dedicato ora esaminer\u00E0 le tue informazioni. Ti ricontatteremo se avremo bisogno di ulteriori informazioni da parte tua, ma nel frattempo, non esitare a contattarci per qualsiasi domanda.',
        iHaveA: 'Ho una domanda',
        enable2FA: "Abilita l'autenticazione a due fattori (2FA) per prevenire le frodi",
        weTake: "Prendiamo sul serio la tua sicurezza. Configura ora l'autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.",
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
        title: 'Viaggia intelligente',
        subtitle: 'Usa Expensify Travel per ottenere le migliori offerte di viaggio e gestire tutte le tue spese aziendali in un unico posto.',
        features: {
            saveMoney: 'Risparmia sui tuoi prenotazioni',
            alerts: 'Ricevi aggiornamenti e avvisi in tempo reale',
        },
        bookTravel: 'Prenota viaggio',
        bookDemo: 'Prenota una demo',
        bookADemo: 'Prenota una demo',
        toLearnMore: 'per saperne di pi\u00F9.',
        termsAndConditions: {
            header: 'Prima di continuare...',
            title: 'Termini e condizioni',
            subtitle: 'Si prega di accettare Expensify Travel',
            termsAndConditions: 'termini e condizioni',
            travelTermsAndConditions: 'termini e condizioni',
            agree: 'Accetto il',
            error: 'Devi accettare i termini e le condizioni di Expensify Travel per continuare',
            defaultWorkspaceError:
                'Devi impostare un workspace predefinito per abilitare Expensify Travel. Vai su Impostazioni > Workspaces > clicca sui tre punti verticali accanto a un workspace > Imposta come workspace predefinito, quindi riprova!',
        },
        flight: 'Volo',
        flightDetails: {
            passenger: 'Passeggero',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Hai uno <strong>scalo di ${layover}</strong> prima di questo volo</muted-text-label>`,
            takeOff: 'Decollo',
            landing: 'Atterraggio',
            seat: 'Posto',
            class: 'Classe Cabina',
            recordLocator: 'Localizzatore di record',
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
            roomType: 'Tipo di camera',
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
        tripSupport: 'Supporto per viaggi',
        tripDetails: 'Dettagli del viaggio',
        viewTripDetails: 'Visualizza i dettagli del viaggio',
        trip: 'Viaggio',
        trips: 'Viaggi',
        tripSummary: 'Riepilogo del viaggio',
        departs: 'Parte',
        errorMessage: 'Qualcosa \u00E8 andato storto. Per favore riprova pi\u00F9 tardi.',
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
            accountantInvitationPrefix: `Se sei un commercialista, considera di unirti al`,
            accountantInvitationLink: `Programma ExpensifyApproved! accountants`,
            accountantInvitationSuffix: `per abilitare i viaggi per questo dominio.`,
        },
        publicDomainError: {
            title: 'Inizia con Expensify Travel',
            message: `Dovrai usare la tua email di lavoro (ad esempio, name@company.com) con Expensify Travel, non la tua email personale (ad esempio, name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel \u00E8 stato disabilitato',
            message: `Il tuo amministratore ha disattivato Expensify Travel. Si prega di seguire la politica di prenotazione della tua azienda per le disposizioni di viaggio.`,
        },
        verifyCompany: {
            title: 'Inizia oggi con i viaggi!',
            message: `Si prega di contattare il proprio Account manager o salesteam@expensify.com per ottenere una demo di viaggio e attivarla per la propria azienda.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Il tuo volo ${airlineCode} (${origin} \u2192 ${destination}) del ${startDate} \u00E8 stato prenotato. Codice di conferma: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Il tuo biglietto per il volo ${airlineCode} (${origin} \u2192 ${destination}) del ${startDate} \u00E8 stato annullato.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Il tuo biglietto per il volo ${airlineCode} (${origin} \u2192 ${destination}) del ${startDate} \u00E8 stato rimborsato o scambiato.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Il tuo volo ${airlineCode} (${origin} \u2192 ${destination}) del ${startDate} \u00E8 stato cancellato dalla compagnia aerea.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `La compagnia aerea ha proposto una modifica dell'orario per il volo ${airlineCode}; stiamo aspettando la conferma.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Cambio di programma confermato: il volo ${airlineCode} ora parte alle ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Il tuo volo ${airlineCode} (${origin} \u2192 ${destination}) del ${startDate} \u00E8 stato aggiornato.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `La tua classe di cabina \u00E8 stata aggiornata a ${cabinClass} sul volo ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Il tuo posto assegnato sul volo ${airlineCode} \u00E8 stato confermato.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `La tua assegnazione del posto sul volo ${airlineCode} \u00E8 stata modificata.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `La tua assegnazione del posto sul volo ${airlineCode} \u00E8 stata rimossa.`,
            paymentDeclined: 'Il pagamento per la tua prenotazione aerea non \u00E8 riuscito. Per favore riprova.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Hai annullato la tua prenotazione ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Il fornitore ha annullato la tua prenotazione ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `La tua prenotazione ${type} \u00E8 stata riprenotata. Nuovo numero di conferma: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `La tua prenotazione ${type} \u00E8 stata aggiornata. Controlla i nuovi dettagli nell'itinerario.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Il tuo biglietto ferroviario per ${origin} \u2192 ${destination} del ${startDate} \u00E8 stato rimborsato. Un credito verr\u00E0 elaborato.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) =>
                `Il tuo biglietto ferroviario per ${origin} \u2192 ${destination} del ${startDate} \u00E8 stato cambiato.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) =>
                `Il tuo biglietto ferroviario per ${origin} \u2192 ${destination} del ${startDate} \u00E8 stato aggiornato.`,
            defaultUpdate: ({type}: TravelTypeParams) => `La tua prenotazione ${type} \u00E8 stata aggiornata.`,
        },
    },
    workspace: {
        common: {
            card: 'Carte',
            expensifyCard: 'Expensify Card',
            companyCards: 'Carte aziendali',
            workflows: 'Flussi di lavoro',
            workspace: 'Workspace',
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
            reportFields: 'Campi del report',
            reportTitle: 'Titolo del report',
            reportField: 'Campo del report',
            taxes: 'Tasse',
            bills: 'Fatture',
            invoices: 'Fatture',
            travel: 'Viaggio',
            members: 'Membri',
            accounting: 'Contabilit\u00E0',
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
            deleteWithCardsConfirmation: 'Sei sicuro di voler eliminare questo spazio di lavoro? Questo rimuover\u00E0 tutti i feed delle carte e le carte assegnate.',
            unavailable: 'Spazio di lavoro non disponibile',
            memberNotFound: 'Membro non trovato. Per invitare un nuovo membro al workspace, utilizza il pulsante di invito sopra.',
            notAuthorized: `Non hai accesso a questa pagina. Se stai cercando di unirti a questo workspace, chiedi semplicemente al proprietario del workspace di aggiungerti come membro. Qualcos'altro? Contatta ${CONST.EMAIL.CONCIERGE}.`,
            goToRoom: ({roomName}: GoToRoomParams) => `Vai alla stanza ${roomName}`,
            goToWorkspace: 'Vai allo spazio di lavoro',
            goToWorkspaces: 'Vai ai workspace',
            clearFilter: 'Cancella filtro',
            workspaceName: 'Nome del workspace',
            workspaceOwner: 'Proprietario',
            workspaceType: 'Tipo di spazio di lavoro',
            workspaceAvatar: 'Avatar del workspace',
            mustBeOnlineToViewMembers: 'Devi essere online per visualizzare i membri di questo spazio di lavoro.',
            moreFeatures: 'Pi\u00F9 funzionalit\u00E0',
            requested: 'Richiesto',
            distanceRates: 'Tariffe di distanza',
            defaultDescription: 'Un unico posto per tutte le tue ricevute e spese.',
            descriptionHint: 'Condividi informazioni su questo spazio di lavoro con tutti i membri.',
            welcomeNote: 'Per favore, usa Expensify per inviare le tue ricevute per il rimborso, grazie!',
            subscription: 'Abbonamento',
            markAsEntered: 'Segna come inserito manualmente',
            markAsExported: 'Contrassegna come esportato manualmente',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Esporta su ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
            lineItemLevel: 'Livello voce di dettaglio',
            reportLevel: 'Livello del report',
            topLevel: 'Livello superiore',
            appliedOnExport: "Non importato in Expensify, applicato all'esportazione",
            shareNote: {
                header: 'Condividi il tuo spazio di lavoro con altri membri',
                content: {
                    firstPart:
                        'Condividi questo codice QR o copia il link qui sotto per facilitare ai membri la richiesta di accesso al tuo spazio di lavoro. Tutte le richieste di adesione allo spazio di lavoro appariranno nel',
                    secondPart: 'spazio per la tua recensione.',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Connetti a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Crea nuova connessione',
            reuseExistingConnection: 'Riutilizza la connessione esistente',
            existingConnections: 'Connessioni esistenti',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Poich\u00E9 ti sei gi\u00E0 connesso a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, puoi scegliere di riutilizzare una connessione esistente o crearne una nuova.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Ultima sincronizzazione ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Impossibile connettersi a ${connectionName} a causa di un errore di autenticazione`,
            learnMore: 'Scopri di pi\u00F9.',
            memberAlternateText: 'I membri possono inviare e approvare i rapporti.',
            adminAlternateText: 'Gli amministratori hanno pieno accesso di modifica a tutti i report e alle impostazioni dello spazio di lavoro.',
            auditorAlternateText: 'Gli auditor possono visualizzare e commentare i report.',
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
            deletePerDiemRate: 'Elimina tariffa di diaria',
            findPerDiemRate: 'Trova la tariffa di diaria',
            areYouSureDelete: () => ({
                one: 'Sei sicuro di voler eliminare questa tariffa?',
                other: 'Sei sicuro di voler eliminare queste tariffe?',
            }),
            emptyList: {
                title: 'Per diem',
                subtitle: 'Imposta le tariffe diarie per controllare le spese giornaliere dei dipendenti. Importa le tariffe da un foglio di calcolo per iniziare.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Una tariffa con valore ${rate} esiste gi\u00E0`,
            },
            importPerDiemRates: 'Importa le tariffe diarie',
            editPerDiemRate: 'Modifica la tariffa di diaria',
            editPerDiemRates: 'Modifica le tariffe diarie',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `Aggiornare questa destinazione la modificher\u00E0 per tutte le sottotariffe di diaria ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Aggiornare questa valuta la cambier\u00E0 per tutte le sotto-tariffe di diaria di ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Imposta come esportare le spese anticipate su QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Contrassegna gli assegni come "stampa pi\u00F9 tardi"',
            exportDescription: 'Configura come i dati di Expensify vengono esportati su QuickBooks Desktop.',
            date: 'Data di esportazione',
            exportInvoices: 'Esporta fatture su',
            exportExpensifyCard: 'Esporta le transazioni della Expensify Card come',
            account: 'Account',
            accountDescription: 'Scegli dove pubblicare le registrazioni contabili.',
            accountsPayable: 'Contabilit\u00E0 fornitori',
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
                        description: 'Data della spesa pi\u00F9 recente nel rapporto.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report \u00E8 stato esportato su QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto \u00E8 stato inviato per l'approvazione.",
                    },
                },
            },
            exportCheckDescription: 'Creeremo un assegno dettagliato per ogni report di Expensify e lo invieremo dal conto bancario sottostante.',
            exportJournalEntryDescription: "Creeremo una registrazione contabile dettagliata per ogni report di Expensify e la pubblicheremo sull'account qui sotto.",
            exportVendorBillDescription:
                'Creeremo una fattura dettagliata del fornitore per ogni report di Expensify e la aggiungeremo al conto sottostante. Se questo periodo \u00E8 chiuso, la registreremo al 1\u00B0 del prossimo periodo aperto.',
            deepDiveExpensifyCard: 'Le transazioni della Expensify Card verranno esportate automaticamente in un "Conto di Passivit\u00E0 della Expensify Card" creato con',
            deepDiveExpensifyCardIntegration: 'la nostra integrazione.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop non supporta le tasse sulle esportazioni di registrazioni contabili. Poich\u00E9 hai abilitato le tasse nel tuo spazio di lavoro, questa opzione di esportazione non \u00E8 disponibile.',
            outOfPocketTaxEnabledError: "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'altra opzione di esportazione.",
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carta di credito',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fattura fornitore',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Voce di diario',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controlla',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Descrizione`]:
                    'Creeremo un assegno dettagliato per ogni report di Expensify e lo invieremo dal conto bancario sottostante.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Descrizione`]:
                    "Abbineremo automaticamente il nome del commerciante sulla transazione con carta di credito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore 'Credit Card Misc.' per l'associazione.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Descrizione`]:
                    "Creeremo una fattura dettagliata del fornitore per ogni report di Expensify con la data dell'ultima spesa e la aggiungeremo al conto sottostante. Se questo periodo \u00E8 chiuso, la registreremo al 1\u00B0 del prossimo periodo aperto.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}DescrizioneAccount`]: 'Scegli dove esportare le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}DescrizioneAccount`]: 'Scegli un fornitore da applicare a tutte le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}DescrizioneAccount`]: 'Scegli da dove inviare gli assegni.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Errore`]:
                    "Le fatture dei fornitori non sono disponibili quando le localit\u00E0 sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Errore`]:
                    "Gli assegni non sono disponibili quando le localit\u00E0 sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Errore`]:
                    "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'altra opzione di esportazione.",
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Aggiungi l'account in QuickBooks Desktop e sincronizza nuovamente la connessione",
            qbdSetup: 'Configurazione di QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Impossibile connettersi da questo dispositivo',
                body1: 'Dovrai configurare questa connessione dal computer che ospita il file aziendale di QuickBooks Desktop.',
                body2: 'Una volta connesso, potrai sincronizzare ed esportare da qualsiasi luogo.',
            },
            setupPage: {
                title: 'Apri questo link per connetterti',
                body: 'Per completare la configurazione, apri il seguente link sul computer dove \u00E8 in esecuzione QuickBooks Desktop.',
                setupErrorTitle: 'Qualcosa \u00E8 andato storto',
                setupErrorBody1: 'La connessione a QuickBooks Desktop non funziona al momento. Per favore riprova pi\u00F9 tardi o',
                setupErrorBody2: 'se il problema persiste.',
                setupErrorBodyContactConcierge: 'contatta Concierge',
            },
            importDescription: 'Scegli quali configurazioni di codifica importare da QuickBooks Desktop a Expensify.',
            classes: 'Classi',
            items: 'Elementi',
            customers: 'Clienti/progetti',
            exportCompanyCardsDescription: 'Imposta come le spese con carta aziendale vengono esportate su QuickBooks Desktop.',
            defaultVendorDescription: "Imposta un fornitore predefinito che verr\u00E0 applicato a tutte le transazioni con carta di credito al momento dell'esportazione.",
            accountsDescription: 'Il tuo piano dei conti di QuickBooks Desktop verr\u00E0 importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli di importare nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            classesDescription: 'Scegli come gestire le classi di QuickBooks Desktop in Expensify.',
            tagsDisplayedAsDescription: 'Livello voce di spesa',
            reportFieldsDisplayedAsDescription: 'Livello del report',
            customersDescription: 'Scegli come gestire i clienti/progetti di QuickBooks Desktop in Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzer\u00E0 automaticamente con QuickBooks Desktop ogni giorno.',
                createEntities: 'Crea automaticamente entit\u00E0',
                createEntitiesDescription: 'Expensify creer\u00E0 automaticamente fornitori in QuickBooks Desktop se non esistono gi\u00E0.',
            },
            itemsDescription: 'Scegli come gestire gli elementi di QuickBooks Desktop in Expensify.',
        },
        qbo: {
            connectedTo: 'Collegato a',
            importDescription: 'Scegli quali configurazioni di codifica importare da QuickBooks Online a Expensify.',
            classes: 'Classi',
            locations: 'Localit\u00E0',
            customers: 'Clienti/progetti',
            accountsDescription: 'Il tuo piano dei conti di QuickBooks Online verr\u00E0 importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli di importare nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            classesDescription: 'Scegli come gestire le classi di QuickBooks Online in Expensify.',
            customersDescription: 'Scegli come gestire i clienti/progetti di QuickBooks Online in Expensify.',
            locationsDescription: 'Scegli come gestire le sedi di QuickBooks Online in Expensify.',
            taxesDescription: 'Scegli come gestire le tasse di QuickBooks Online in Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online non supporta le Posizioni a livello di riga per Assegni o Fatture Fornitori. Se desideri avere le posizioni a livello di riga, assicurati di utilizzare le Scritture Contabili e le spese con Carta di Credito/Debito.',
            taxesJournalEntrySwitchNote:
                "QuickBooks Online non supporta le tasse sulle registrazioni contabili. Si prega di cambiare l'opzione di esportazione in fattura fornitore o assegno.",
            exportDescription: 'Configura come i dati di Expensify vengono esportati su QuickBooks Online.',
            date: 'Data di esportazione',
            exportInvoices: 'Esporta fatture su',
            exportExpensifyCard: 'Esporta le transazioni della Expensify Card come',
            deepDiveExpensifyCard: 'Le transazioni della Expensify Card verranno esportate automaticamente in un "Conto di Passivit\u00E0 della Expensify Card" creato con',
            deepDiveExpensifyCardIntegration: 'la nostra integrazione.',
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report su QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa pi\u00F9 recente nel rapporto.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report \u00E8 stato esportato su QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto \u00E8 stato inviato per l'approvazione.",
                    },
                },
            },
            receivable: 'Crediti verso clienti', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archivio crediti verso clienti', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Usa questo account quando esporti le fatture su QuickBooks Online.',
            exportCompanyCardsDescription: 'Imposta come esportare gli acquisti con carta aziendale su QuickBooks Online.',
            vendor: 'Fornitore',
            defaultVendorDescription: "Imposta un fornitore predefinito che verr\u00E0 applicato a tutte le transazioni con carta di credito al momento dell'esportazione.",
            exportOutOfPocketExpensesDescription: 'Imposta come esportare le spese anticipate su QuickBooks Online.',
            exportCheckDescription: 'Creeremo un assegno dettagliato per ogni report di Expensify e lo invieremo dal conto bancario sottostante.',
            exportJournalEntryDescription: "Creeremo una registrazione contabile dettagliata per ogni report di Expensify e la pubblicheremo sull'account qui sotto.",
            exportVendorBillDescription:
                'Creeremo una fattura dettagliata del fornitore per ogni report di Expensify e la aggiungeremo al conto sottostante. Se questo periodo \u00E8 chiuso, la registreremo al 1\u00B0 del prossimo periodo aperto.',
            account: 'Account',
            accountDescription: 'Scegli dove pubblicare le registrazioni contabili.',
            accountsPayable: 'Contabilit\u00E0 fornitori',
            accountsPayableDescription: 'Scegli dove creare le fatture dei fornitori.',
            bankAccount: 'Conto bancario',
            notConfigured: 'Non configurato',
            bankAccountDescription: 'Scegli da dove inviare gli assegni.',
            creditCardAccount: 'Account di carta di credito',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online non supporta le localit\u00E0 nelle esportazioni delle fatture dei fornitori. Poich\u00E9 hai abilitato le localit\u00E0 nel tuo spazio di lavoro, questa opzione di esportazione non \u00E8 disponibile.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online non supporta le tasse sulle esportazioni delle registrazioni contabili. Poich\u00E9 hai abilitato le tasse nel tuo spazio di lavoro, questa opzione di esportazione non \u00E8 disponibile.',
            outOfPocketTaxEnabledError: "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'altra opzione di esportazione.",
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzer\u00E0 automaticamente con QuickBooks Online ogni giorno.',
                inviteEmployees: 'Invita dipendenti',
                inviteEmployeesDescription: 'Importa i record dei dipendenti di QuickBooks Online e invita i dipendenti a questo spazio di lavoro.',
                createEntities: 'Crea automaticamente entit\u00E0',
                createEntitiesDescription:
                    'Expensify creer\u00E0 automaticamente i fornitori in QuickBooks Online se non esistono gi\u00E0, e creer\u00E0 automaticamente i clienti quando si esportano le fatture.',
                reimbursedReportsDescription:
                    "Ogni volta che un report viene pagato utilizzando Expensify ACH, il pagamento della fattura corrispondente verr\u00E0 creato nell'account QuickBooks Online qui sotto.",
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
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Descrizione`]:
                    "Abbineremo automaticamente il nome del commerciante sulla transazione con carta di debito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore 'Misc. Carta di Debito' per l'associazione.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Descrizione`]:
                    "Abbineremo automaticamente il nome del commerciante sulla transazione con carta di credito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore 'Credit Card Misc.' per l'associazione.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Descrizione`]:
                    "Creeremo una fattura dettagliata del fornitore per ogni report di Expensify con la data dell'ultima spesa e la aggiungeremo al conto sottostante. Se questo periodo \u00E8 chiuso, la registreremo al 1\u00B0 del prossimo periodo aperto.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}DescrizioneAccount`]: 'Scegli dove esportare le transazioni con carta di debito.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}DescrizioneAccount`]: 'Scegli dove esportare le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}DescrizioneAccount`]: 'Scegli un fornitore da applicare a tutte le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Errore`]:
                    "Le fatture dei fornitori non sono disponibili quando le localit\u00E0 sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Errore`]:
                    "Gli assegni non sono disponibili quando le localit\u00E0 sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Errore`]:
                    "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'altra opzione di esportazione.",
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: "Scegli un account valido per l'esportazione della fattura del fornitore",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: "Scegli un account valido per l'esportazione della registrazione contabile",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: "Scegli un account valido per l'esportazione dell'assegno",
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: "Per utilizzare l'esportazione delle fatture dei fornitori, configura un conto contabile in QuickBooks Online.",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]:
                    "Per utilizzare l'esportazione delle registrazioni contabili, configura un account di registrazione in QuickBooks Online.",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: "Per utilizzare l'esportazione degli assegni, configura un conto bancario in QuickBooks Online",
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: 'Aggiungi il conto in QuickBooks Online e sincronizza di nuovo la connessione.',
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
            accountsDescription: 'Il tuo piano dei conti Xero verr\u00E0 importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli di importare nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            trackingCategories: 'Categorie di monitoraggio',
            trackingCategoriesDescription: 'Scegli come gestire le categorie di tracciamento Xero in Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mappa Xero ${categoryName} a`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Scegli dove mappare ${categoryName} quando esporti su Xero.`,
            customers: 'Riaddebita clienti',
            customersDescription:
                'Scegli se riaddebitare i clienti in Expensify. I contatti dei clienti Xero possono essere associati alle spese e verranno esportati in Xero come fattura di vendita.',
            taxesDescription: 'Scegli come gestire le tasse di Xero in Expensify.',
            notImported: 'Non importato',
            notConfigured: 'Non configurato',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contatto predefinito Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tag',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Campi del report',
            },
            exportDescription: 'Configura come i dati di Expensify vengono esportati su Xero.',
            purchaseBill: 'Acquisto fattura',
            exportDeepDiveCompanyCard:
                'Le spese esportate verranno registrate come transazioni bancarie sul conto bancario Xero qui sotto, e le date delle transazioni corrisponderanno alle date sul tuo estratto conto bancario.',
            bankTransactions: 'Transazioni bancarie',
            xeroBankAccount: 'Conto bancario Xero',
            xeroBankAccountDescription: 'Scegli dove le spese verranno registrate come transazioni bancarie.',
            exportExpensesDescription: 'I rapporti verranno esportati come fattura di acquisto con la data e lo stato selezionati di seguito.',
            purchaseBillDate: "Data fattura d'acquisto",
            exportInvoices: 'Esporta fatture come',
            salesInvoice: 'Fattura di vendita',
            exportInvoicesDescription: 'Le fatture di vendita mostrano sempre la data in cui la fattura \u00E8 stata inviata.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzer\u00E0 automaticamente con Xero ogni giorno.',
                purchaseBillStatusTitle: "Stato della fattura d'acquisto",
                reimbursedReportsDescription:
                    "Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura verr\u00E0 creato nell'account Xero sottostante.",
                xeroBillPaymentAccount: 'Account di pagamento fatture Xero',
                xeroInvoiceCollectionAccount: 'Account di riscossione fatture Xero',
                xeroBillPaymentAccountDescription: 'Scegli da dove pagare le bollette e creeremo il pagamento in Xero.',
                invoiceAccountSelectorDescription: 'Scegli dove ricevere i pagamenti delle fatture e creeremo il pagamento in Xero.',
            },
            exportDate: {
                label: "Data fattura d'acquisto",
                description: 'Usa questa data quando esporti i report su Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa pi\u00F9 recente nel rapporto.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report \u00E8 stato esportato su Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto \u00E8 stato inviato per l'approvazione.",
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
                        description: 'Data della spesa pi\u00F9 recente nel rapporto.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report \u00E8 stato esportato su Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto \u00E8 stato inviato per l'approvazione.",
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
                description: 'Imposta come le spese con carta aziendale vengono esportate su Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Carte di credito',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Fatture fornitore',
                },
            },
            creditCardAccount: 'Account di carta di credito',
            defaultVendor: 'Fornitore predefinito',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Imposta un fornitore predefinito che verr\u00E0 applicato alle spese rimborsabili ${isReimbursable ? '' : 'non-'} che non hanno un fornitore corrispondente in Sage Intacct.`,
            exportDescription: 'Configura come i dati di Expensify vengono esportati su Sage Intacct.',
            exportPreferredExporterNote:
                "L'esportatore preferito pu\u00F2 essere qualsiasi amministratore dello spazio di lavoro, ma deve anche essere un Amministratore di Dominio se imposti account di esportazione diversi per le singole carte aziendali nelle Impostazioni di Dominio.",
            exportPreferredExporterSubNote: "Una volta impostato, l'esportatore preferito vedr\u00E0 i report per l'esportazione nel proprio account.",
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: `Per favore aggiungi l'account in Sage Intacct e sincronizza nuovamente la connessione.`,
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Expensify si sincronizzer\u00E0 automaticamente con Sage Intacct ogni giorno.',
            inviteEmployees: 'Invita dipendenti',
            inviteEmployeesDescription:
                "Importa i record dei dipendenti di Sage Intacct e invita i dipendenti a questo spazio di lavoro. Il tuo flusso di approvazione predefinito sar\u00E0 l'approvazione del manager e pu\u00F2 essere ulteriormente configurato nella pagina Membri.",
            syncReimbursedReports: 'Sincronizza i report rimborsati',
            syncReimbursedReportsDescription:
                "Ogni volta che un report viene pagato utilizzando Expensify ACH, il pagamento della fattura corrispondente sar\u00E0 creato nell'account Sage Intacct qui sotto.",
            paymentAccount: 'Account di pagamento Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Sussidiaria',
            subsidiarySelectDescription: 'Scegli la filiale in NetSuite da cui desideri importare i dati.',
            exportDescription: 'Configura come i dati di Expensify vengono esportati su NetSuite.',
            exportInvoices: 'Esporta fatture su',
            journalEntriesTaxPostingAccount: 'Voci del giornale conto di registrazione fiscale',
            journalEntriesProvTaxPostingAccount: 'Voci di diario conto di registrazione imposta provinciale',
            foreignCurrencyAmount: 'Esporta importo in valuta estera',
            exportToNextOpenPeriod: 'Esporta al prossimo periodo aperto',
            nonReimbursableJournalPostingAccount: 'Account di registrazione giornaliera non rimborsabile',
            reimbursableJournalPostingAccount: 'Account di registrazione giornaliera rimborsabile',
            journalPostingPreference: {
                label: 'Preferenze di registrazione delle voci contabili',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Voce singola e dettagliata per ogni rapporto',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Singola voce per ogni spesa',
                },
            },
            invoiceItem: {
                label: 'Voce della fattura',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Creane uno per me',
                        description: 'Creeremo una "voce di fattura Expensify" per te al momento dell\'esportazione (se non esiste gi\u00E0).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Seleziona esistente',
                        description: "Collegheremo le fatture di Expensify all'elemento selezionato qui sotto.",
                    },
                },
            },
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report su NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa pi\u00F9 recente nel rapporto.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report \u00E8 stato esportato su NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto \u00E8 stato inviato per l'approvazione.",
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
                autoSyncDescription: 'Expensify si sincronizzer\u00E0 automaticamente con NetSuite ogni giorno.',
                reimbursedReportsDescription:
                    "Ogni volta che un report viene pagato utilizzando Expensify ACH, il pagamento della fattura corrispondente verr\u00E0 creato nell'account NetSuite sottostante.",
                reimbursementsAccount: 'Account di rimborso',
                reimbursementsAccountDescription: 'Scegli il conto bancario che utilizzerai per i rimborsi e creeremo il pagamento associato in NetSuite.',
                collectionsAccount: 'Account di riscossione',
                collectionsAccountDescription: "Una volta che una fattura \u00E8 contrassegnata come pagata in Expensify ed esportata su NetSuite, apparir\u00E0 contro l'account qui sotto.",
                approvalAccount: 'Account di approvazione A/P',
                approvalAccountDescription:
                    "Scegli l'account contro cui verranno approvate le transazioni in NetSuite. Se stai sincronizzando i report rimborsati, questo \u00E8 anche l'account contro cui verranno creati i pagamenti delle fatture.",
                defaultApprovalAccount: 'NetSuite predefinito',
                inviteEmployees: 'Invita i dipendenti e imposta le approvazioni',
                inviteEmployeesDescription:
                    "Importa i record dei dipendenti NetSuite e invita i dipendenti a questo spazio di lavoro. Il tuo flusso di approvazione predefinito sar\u00E0 l'approvazione del manager e pu\u00F2 essere ulteriormente configurato nella pagina *Membri*.",
                autoCreateEntities: 'Crea automaticamente dipendenti/fornitori',
                enableCategories: 'Abilita le categorie appena importate',
                customFormID: 'ID modulo personalizzato',
                customFormIDDescription:
                    'Per impostazione predefinita, Expensify creer\u00E0 voci utilizzando il modulo di transazione preferito impostato in NetSuite. In alternativa, puoi designare un modulo di transazione specifico da utilizzare.',
                customFormIDReimbursable: 'Spesa fuori tasca',
                customFormIDNonReimbursable: 'Spesa con carta aziendale',
                exportReportsTo: {
                    label: 'Livello di approvazione del rapporto spese',
                    description:
                        'Una volta che un report di spese \u00E8 approvato in Expensify ed esportato su NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Preferenza predefinita di NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Solo supervisore approvato',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Solo contabilit\u00E0 approvata',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisore e contabilit\u00E0 approvati',
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
                        'Una volta che una fattura del fornitore \u00E8 approvata in Expensify ed esportata in NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Preferenza predefinita di NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'In attesa di approvazione',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Approvato per la pubblicazione',
                    },
                },
                exportJournalsTo: {
                    label: 'Livello di approvazione della registrazione contabile',
                    description:
                        'Una volta che una registrazione contabile \u00E8 approvata in Expensify ed esportata in NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Preferenza predefinita di NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'In attesa di approvazione',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Approvato per la pubblicazione',
                    },
                },
                error: {
                    customFormID: 'Si prega di inserire un ID modulo personalizzato numerico valido',
                },
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Per favore aggiungi l'account in NetSuite e sincronizza nuovamente la connessione.",
            noVendorsFound: 'Nessun fornitore trovato',
            noVendorsFoundDescription: 'Si prega di aggiungere i fornitori in NetSuite e sincronizzare nuovamente la connessione.',
            noItemsFound: 'Nessun elemento della fattura trovato',
            noItemsFoundDescription: 'Per favore, aggiungi gli articoli della fattura in NetSuite e sincronizza nuovamente la connessione.',
            noSubsidiariesFound: 'Nessuna filiale trovata',
            noSubsidiariesFoundDescription: 'Per favore, aggiungi una filiale in NetSuite e sincronizza nuovamente la connessione.',
            tokenInput: {
                title: 'Configurazione di NetSuite',
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
                            'In NetSuite, vai su *Setup > Users/Roles > Access Tokens* > crea un token di accesso per l\'app "Expensify" e per il ruolo "Expensify Integration" o "Administrator".\n\n*Importante:* Assicurati di salvare il *Token ID* e il *Token Secret* da questo passaggio. Ti serviranno per il passaggio successivo.',
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
                expenseCategoriesDescription: 'Le tue categorie di spesa di NetSuite verranno importate in Expensify come categorie.',
                crossSubsidiaryCustomers: 'Clienti/progetti tra filiali',
                importFields: {
                    departments: {
                        title: 'Dipartimenti',
                        subtitle: 'Scegli come gestire i *reparti* di NetSuite in Expensify.',
                    },
                    classes: {
                        title: 'Classi',
                        subtitle: 'Scegli come gestire le *classi* in Expensify.',
                    },
                    locations: {
                        title: 'Localit\u00E0',
                        subtitle: 'Scegli come gestire le *posizioni* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clienti/progetti',
                    subtitle: 'Scegli come gestire *customers* e *projects* di NetSuite in Expensify.',
                    importCustomers: 'Importa clienti',
                    importJobs: 'Importa progetti',
                    customers: 'clienti',
                    jobs: 'progetti',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('e')}, ${importType}`,
                },
                importTaxDescription: 'Importa gruppi fiscali da NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: "Scegli un'opzione qui sotto:",
                    label: ({importedTypes}: ImportedTypesParams) => `Importato come ${importedTypes.join('e')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Per favore inserisci il ${fieldName}`,
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
                            scriptID: 'Script ID',
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
                            customSegmentNameTitle: 'Qual \u00E8 il nome del segmento personalizzato?',
                            customRecordNameTitle: 'Qual \u00E8 il nome del record personalizzato?',
                            customSegmentNameFooter: `Puoi trovare i nomi dei segmenti personalizzati in NetSuite nella pagina *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Puoi trovare i nomi dei record personalizzati in NetSuite inserendo "Transaction Column Field" nella ricerca globale.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "Qual \u00E8 l'ID interno?",
                            customSegmentInternalIDFooter: `Prima di tutto, assicurati di aver abilitato gli ID interni in NetSuite sotto *Home > Set Preferences > Show Internal ID.*\n\nPuoi trovare gli ID interni dei segmenti personalizzati in NetSuite sotto:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clicca su un segmento personalizzato.\n3. Clicca sul collegamento ipertestuale accanto a *Custom Record Type*.\n4. Trova l'ID interno nella tabella in basso.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Puoi trovare gli ID interni dei record personalizzati in NetSuite seguendo questi passaggi:\n\n1. Inserisci "Transaction Line Fields" nella ricerca globale.\n2. Clicca su un record personalizzato.\n3. Trova l'ID interno sul lato sinistro.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di aiuto](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "Qual \u00E8 l'ID dello script?",
                            customSegmentScriptIDFooter: `Puoi trovare gli ID degli script dei segmenti personalizzati in NetSuite sotto:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clicca su un segmento personalizzato.\n3. Clicca sulla scheda *Application and Sourcing* vicino al fondo, poi:\n    a. Se vuoi visualizzare il segmento personalizzato come un *tag* (a livello di voce di linea) in Expensify, clicca sulla sotto-scheda *Transaction Columns* e usa l'*ID del Campo*.\n    b. Se vuoi visualizzare il segmento personalizzato come un *campo di report* (a livello di report) in Expensify, clicca sulla sotto-scheda *Transactions* e usa l'*ID del Campo*.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di supporto](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "Qual \u00E8 l'ID della colonna delle transazioni?",
                            customRecordScriptIDFooter: `Puoi trovare gli ID script dei record personalizzati in NetSuite sotto:\n\n1. Inserisci "Transaction Line Fields" nella ricerca globale.\n2. Clicca su un record personalizzato.\n3. Trova l'ID script sul lato sinistro.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di aiuto](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Come dovrebbe essere visualizzato questo segmento personalizzato in Expensify?',
                            customRecordMappingTitle: 'Come dovrebbe essere visualizzato questo record personalizzato in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Un segmento/record personalizzato con questo ${fieldName?.toLowerCase()} esiste gi\u00E0`,
                        },
                    },
                    customLists: {
                        title: 'Elenchi personalizzati',
                        addText: 'Aggiungi elenco personalizzato',
                        recordTitle: 'Elenco personalizzato',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Visualizza istruzioni dettagliate',
                        helpText: 'sulla configurazione di elenchi personalizzati.',
                        emptyTitle: 'Aggiungi un elenco personalizzato',
                        fields: {
                            listName: 'Nome',
                            internalID: 'ID interno',
                            transactionFieldID: 'ID campo transazione',
                            mapping: 'Visualizzato come',
                        },
                        removeTitle: 'Rimuovi elenco personalizzato',
                        removePrompt: 'Sei sicuro di voler rimuovere questo elenco personalizzato?',
                        addForm: {
                            listNameTitle: 'Scegli un elenco personalizzato',
                            transactionFieldIDTitle: "Qual \u00E8 l'ID del campo transazione?",
                            transactionFieldIDFooter: `Puoi trovare gli ID dei campi di transazione in NetSuite seguendo questi passaggi:\n\n1. Inserisci "Transaction Line Fields" nella ricerca globale.\n2. Clicca su una lista personalizzata.\n3. Trova l'ID del campo di transazione sul lato sinistro.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Come dovrebbe essere visualizzato questo elenco personalizzato in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Esiste gi\u00E0 un elenco personalizzato con questo ID campo transazione.`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Predefinito dipendente NetSuite',
                        description: "Non importato in Expensify, applicato all'esportazione",
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Se utilizzi ${importField} in NetSuite, applicheremo il set predefinito sul record del dipendente al momento dell'esportazione nel Rapporto Spese o nella Registrazione Contabile.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tag',
                        description: 'Livello voce di dettaglio',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} sar\u00E0 selezionabile per ogni singola spesa nel rapporto di un dipendente.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Campi del report',
                        description: 'Livello del report',
                        footerContent: ({importField}: ImportFieldParams) => `La selezione ${startCase(importField)} si applicher\u00E0 a tutte le spese nel rapporto di un dipendente.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct setup',
            prerequisitesTitle: 'Prima di connetterti...',
            downloadExpensifyPackage: 'Scarica il pacchetto Expensify per Sage Intacct',
            followSteps: 'Segui i passaggi nelle nostre istruzioni "Come fare: Collegarsi a Sage Intacct"',
            enterCredentials: 'Inserisci le tue credenziali Sage Intacct',
            entity: 'Entit\u00E0',
            employeeDefault: 'Sage Intacct impiegato predefinito',
            employeeDefaultDescription: 'Il dipartimento predefinito del dipendente verr\u00E0 applicato alle sue spese in Sage Intacct, se esiste.',
            displayedAsTagDescription: 'Il dipartimento sar\u00E0 selezionabile per ogni singola spesa nel rapporto di un dipendente.',
            displayedAsReportFieldDescription: 'La selezione del dipartimento verr\u00E0 applicata a tutte le spese nel rapporto di un dipendente.',
            toggleImportTitleFirstPart: 'Scegli come gestire Sage Intacct',
            toggleImportTitleSecondPart: 'in Expensify.',
            expenseTypes: 'Tipi di spesa',
            expenseTypesDescription: 'I tuoi tipi di spesa Sage Intacct verranno importati in Expensify come categorie.',
            accountTypesDescription: 'Il tuo piano dei conti Sage Intacct verr\u00E0 importato in Expensify come categorie.',
            importTaxDescription: "Importa l'aliquota fiscale sugli acquisti da Sage Intacct.",
            userDefinedDimensions: "Dimensioni definite dall'utente",
            addUserDefinedDimension: "Aggiungi dimensione definita dall'utente",
            integrationName: "Nome dell'integrazione",
            dimensionExists: 'Una dimensione con questo nome esiste gi\u00E0.',
            removeDimension: "Rimuovi dimensione definita dall'utente",
            removeDimensionPrompt: "Sei sicuro di voler rimuovere questa dimensione definita dall'utente?",
            userDefinedDimension: "Dimensione definita dall'utente",
            addAUserDefinedDimension: "Aggiungi una dimensione definita dall'utente",
            detailedInstructionsLink: 'Visualizza istruzioni dettagliate',
            detailedInstructionsRestOfSentence: "sull'aggiunta di dimensioni definite dall'utente.",
            userDimensionsAdded: () => ({
                one: '1 UDD aggiunto',
                other: (count: number) => `${count} UDDs aggiunti`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'dipartimenti';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classi';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'localit\u00E0';
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
                    vcf: 'Carte Commerciali Visa',
                    stripe: 'Carte Stripe',
                },
                yourCardProvider: `Chi \u00E8 il tuo fornitore di carta?`,
                whoIsYourBankAccount: 'Qual \u00E8 la tua banca?',
                whereIsYourBankLocated: 'Dove si trova la tua banca?',
                howDoYouWantToConnect: 'Come vuoi connetterti alla tua banca?',
                learnMoreAboutOptions: {
                    text: 'Scopri di pi\u00F9 su questi',
                    linkText: 'opzioni.',
                },
                commercialFeedDetails:
                    'Richiede la configurazione con la tua banca. Questo \u00E8 tipicamente utilizzato da aziende pi\u00F9 grandi ed \u00E8 spesso la migliore opzione se si \u00E8 idonei.',
                commercialFeedPlaidDetails: `Richiede la configurazione con la tua banca, ma ti guideremo noi. Questo \u00E8 generalmente limitato alle aziende pi\u00F9 grandi.`,
                directFeedDetails: "L'approccio pi\u00F9 semplice. Connettiti immediatamente utilizzando le tue credenziali master. Questo metodo \u00E8 il pi\u00F9 comune.",
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Abilita il tuo feed ${provider}`,
                    heading:
                        "Abbiamo un'integrazione diretta con l'emittente della tua carta e possiamo importare i dati delle tue transazioni in Expensify in modo rapido e preciso.\n\nPer iniziare, semplicemente:",
                    visa: "Abbiamo integrazioni globali con Visa, anche se l'idoneit\u00E0 varia a seconda della banca e del programma della carta.\n\nPer iniziare, semplicemente:",
                    mastercard:
                        "Abbiamo integrazioni globali con Mastercard, anche se l'idoneit\u00E0 varia a seconda della banca e del programma della carta.\n\nPer iniziare, semplicemente:",
                    vcf: `1. Visita [questo articolo di aiuto](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) per istruzioni dettagliate su come configurare le tue Visa Commercial Cards.\n\n2. [Contatta la tua banca](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) per verificare che supportino un feed commerciale per il tuo programma e chiedi loro di abilitarlo.\n\n3. *Una volta che il feed \u00E8 abilitato e hai i suoi dettagli, continua alla schermata successiva.*`,
                    gl1025: `1. Visita [questo articolo di aiuto](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) per scoprire se American Express pu\u00F2 abilitare un feed commerciale per il tuo programma.\n\n2. Una volta abilitato il feed, Amex ti invier\u00E0 una lettera di produzione.\n\n3. *Una volta che hai le informazioni sul feed, continua alla schermata successiva.*`,
                    cdf: `1. Visita [questo articolo di aiuto](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) per istruzioni dettagliate su come configurare le tue Mastercard Commercial Cards.\n\n2. [Contatta la tua banca](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) per verificare che supporti un feed commerciale per il tuo programma e chiedi loro di abilitarlo.\n\n3. *Una volta che il feed \u00E8 abilitato e hai i suoi dettagli, continua alla schermata successiva.*`,
                    stripe: `1. Visita il Dashboard di Stripe e vai su [Impostazioni](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Sotto Integrazioni di prodotto, clicca su Abilita accanto a Expensify.\n\n3. Una volta abilitato il feed, clicca su Invia qui sotto e ci occuperemo di aggiungerlo.`,
                },
                whatBankIssuesCard: 'Quale banca emette queste carte?',
                enterNameOfBank: 'Inserisci il nome della banca',
                feedDetails: {
                    vcf: {
                        title: 'Quali sono i dettagli del feed Visa?',
                        processorLabel: 'ID processore',
                        bankLabel: "ID dell'istituto finanziario (banca)",
                        companyLabel: 'Company ID',
                        helpLabel: 'Dove trovo questi ID?',
                    },
                    gl1025: {
                        title: `Qual \u00E8 il nome del file di consegna Amex?`,
                        fileNameLabel: 'Nome del file di consegna',
                        helpLabel: 'Dove trovo il nome del file di consegna?',
                    },
                    cdf: {
                        title: `Qual \u00E8 l'ID di distribuzione Mastercard?`,
                        distributionLabel: 'ID di distribuzione',
                        helpLabel: "Dove trovo l'ID di distribuzione?",
                    },
                },
                amexCorporate: 'Seleziona questo se sul fronte delle tue carte c\'\u00E8 scritto "Corporate"',
                amexBusiness: 'Seleziona questo se sul fronte delle tue carte c\'\u00E8 scritto "Business"',
                amexPersonal: 'Seleziona questo se le tue carte sono personali',
                error: {
                    pleaseSelectProvider: 'Seleziona un fornitore di carte prima di continuare',
                    pleaseSelectBankAccount: 'Si prega di selezionare un conto bancario prima di continuare',
                    pleaseSelectBank: 'Si prega di selezionare una banca prima di continuare',
                    pleaseSelectCountry: 'Si prega di selezionare un paese prima di continuare',
                    pleaseSelectFeedType: 'Si prega di selezionare un tipo di feed prima di continuare',
                },
            },
            assignCard: 'Assegna carta',
            findCard: 'Trova carta',
            cardNumber: 'Numero della carta',
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
            startDateDescription: 'Importeremo tutte le transazioni da questa data in poi. Se non viene specificata una data, risaliremo fino a quanto consentito dalla tua banca.',
            fromTheBeginning: "Dall'inizio",
            customStartDate: 'Data di inizio personalizzata',
            letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
            confirmationDescription: 'Inizieremo immediatamente a importare le transazioni.',
            cardholder: 'Titolare della carta',
            card: 'Carta',
            cardName: 'Nome della carta',
            brokenConnectionErrorFirstPart: `La connessione al feed della carta \u00E8 interrotta. Per favore`,
            brokenConnectionErrorLink: 'accedi alla tua banca',
            brokenConnectionErrorSecondPart: 'cos\u00EC possiamo ristabilire la connessione.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `ha assegnato ${assignee} un ${link}! Le transazioni importate appariranno in questa chat.`,
            companyCard: 'carta aziendale',
            chooseCardFeed: 'Scegli feed carta',
            ukRegulation:
                "Expensify Limited \u00E8 un agente di Plaid Financial Ltd., un'istituzione di pagamento autorizzata regolata dalla Financial Conduct Authority secondo le Payment Services Regulations 2017 (Numero di Riferimento Aziendale: 804718). Plaid ti fornisce servizi di informazione sui conti regolamentati tramite Expensify Limited come suo agente.",
        },
        expensifyCard: {
            issueAndManageCards: 'Emetti e gestisci le tue carte Expensify',
            getStartedIssuing: 'Inizia emettendo la tua prima carta virtuale o fisica.',
            verificationInProgress: 'Verifica in corso...',
            verifyingTheDetails: 'Stiamo verificando alcuni dettagli. Concierge ti informer\u00E0 quando le Expensify Cards saranno pronte per essere emesse.',
            disclaimer:
                'La Expensify Visa\u00AE Commercial Card \u00E8 emessa da The Bancorp Bank, N.A., Membro FDIC, in base a una licenza di Visa U.S.A. Inc. e potrebbe non essere accettata da tutti i commercianti che accettano carte Visa. Apple\u00AE e il logo Apple\u00AE sono marchi di Apple Inc., registrati negli Stati Uniti e in altri paesi. App Store \u00E8 un marchio di servizio di Apple Inc. Google Play e il logo Google Play sono marchi di Google LLC.',
            issueCard: 'Emetti carta',
            findCard: 'Trova carta',
            newCard: 'Nuova carta',
            name: 'Nome',
            lastFour: 'Ultimi 4',
            limit: 'Limite',
            currentBalance: 'Saldo attuale',
            currentBalanceDescription: "Il saldo attuale \u00E8 la somma di tutte le transazioni con la carta Expensify registrate che sono avvenute dalla data dell'ultimo regolamento.",
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Il saldo sar\u00E0 regolato il ${settlementDate}`,
            settleBalance: 'Regola il saldo',
            cardLimit: 'Limite della carta',
            remainingLimit: 'Limite rimanente',
            requestLimitIncrease: 'Richiesta aumento limite',
            remainingLimitDescription:
                "Consideriamo diversi fattori quando calcoliamo il tuo limite residuo: la tua anzianit\u00E0 come cliente, le informazioni relative all'attivit\u00E0 che hai fornito durante la registrazione e la liquidit\u00E0 disponibile nel conto bancario della tua azienda. Il tuo limite residuo pu\u00F2 variare su base giornaliera.",
            earnedCashback: 'Cash back',
            earnedCashbackDescription: 'Il saldo del cashback si basa sulle spese mensili regolate con la Expensify Card nel tuo spazio di lavoro.',
            issueNewCard: 'Emetti nuova carta',
            finishSetup: 'Completa la configurazione',
            chooseBankAccount: 'Scegli conto bancario',
            chooseExistingBank: 'Scegli un conto bancario aziendale esistente per pagare il saldo della tua Expensify Card, oppure aggiungi un nuovo conto bancario.',
            accountEndingIn: 'Account con termine in',
            addNewBankAccount: 'Aggiungi un nuovo conto bancario',
            settlementAccount: 'Conto di regolamento',
            settlementAccountDescription: 'Scegli un account per pagare il saldo della tua Expensify Card.',
            settlementAccountInfoPt1: 'Assicurati che questo account corrisponda al tuo',
            settlementAccountInfoPt2: 'quindi il Continuous Reconciliation funziona correttamente.',
            reconciliationAccount: 'Conto di riconciliazione',
            settlementFrequency: 'Frequenza di liquidazione',
            settlementFrequencyDescription: 'Scegli la frequenza con cui pagherai il saldo della tua Expensify Card.',
            settlementFrequencyInfo:
                'Se desideri passare alla liquidazione mensile, dovrai collegare il tuo conto bancario tramite Plaid e avere uno storico del saldo positivo di 90 giorni.',
            frequency: {
                daily: 'Quotidiano',
                monthly: 'Mensile',
            },
            cardDetails: 'Dettagli della carta',
            virtual: 'Virtuale',
            physical: 'Fisico',
            deactivate: 'Disattiva carta',
            changeCardLimit: 'Modifica il limite della carta',
            changeLimit: 'Cambia limite',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Se cambi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate finch\u00E9 non approvi ulteriori spese sulla carta.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Se cambi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate fino al mese prossimo.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Se modifichi il limite di questa carta a ${limit}, le nuove transazioni saranno rifiutate.`,
            changeCardLimitType: 'Cambia tipo di limite della carta',
            changeLimitType: 'Cambia tipo di limite',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Se cambi il tipo di limite di questa carta in Limite Intelligente, le nuove transazioni verranno rifiutate perch\u00E9 il limite non approvato di ${limit} \u00E8 gi\u00E0 stato raggiunto.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Se cambi il tipo di limite di questa carta a Mensile, le nuove transazioni verranno rifiutate perch\u00E9 il limite mensile di ${limit} \u00E8 gi\u00E0 stato raggiunto.`,
            addShippingDetails: 'Aggiungi dettagli di spedizione',
            issuedCard: ({assignee}: AssigneeParams) => `ha emesso una Expensify Card a ${assignee}! La carta arriver\u00E0 in 2-3 giorni lavorativi.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `ha emesso una carta Expensify a ${assignee}! La carta verr\u00E0 spedita una volta aggiunti i dettagli di spedizione.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `ha emesso a ${assignee} una ${link} virtuale! La carta pu\u00F2 essere utilizzata immediatamente.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} ha aggiunto i dettagli di spedizione. La Expensify Card arriver\u00E0 in 2-3 giorni lavorativi.`,
            verifyingHeader: 'Verifica',
            bankAccountVerifiedHeader: 'Conto bancario verificato',
            verifyingBankAccount: 'Verifica del conto bancario in corso...',
            verifyingBankAccountDescription: 'Attendere mentre confermiamo che questo account pu\u00F2 essere utilizzato per emettere le carte Expensify.',
            bankAccountVerified: 'Conto bancario verificato!',
            bankAccountVerifiedDescription: 'Ora puoi emettere le Expensify Card ai membri del tuo spazio di lavoro.',
            oneMoreStep: 'Un altro passo...',
            oneMoreStepDescription: 'Sembra che dobbiamo verificare manualmente il tuo conto bancario. Per favore, vai su Concierge dove le tue istruzioni ti stanno aspettando.',
            gotIt: 'Ho capito',
            goToConcierge: 'Vai su Concierge',
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
            deleteFailureMessage: "Si \u00E8 verificato un errore durante l'eliminazione della categoria, per favore riprova.",
            categoryName: 'Nome categoria',
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
                subtitle2: 'contabilit\u00E0',
                subtitle3: 'per apportare eventuali modifiche.',
            },
            updateFailureMessage: "Si \u00E8 verificato un errore durante l'aggiornamento della categoria, riprova.",
            createFailureMessage: 'Si \u00E8 verificato un errore durante la creazione della categoria, riprova per favore.',
            addCategory: 'Aggiungi categoria',
            editCategory: 'Modifica categoria',
            editCategories: 'Modifica categorie',
            findCategory: 'Trova categoria',
            categoryRequiredError: 'Il nome della categoria \u00E8 obbligatorio',
            existingCategoryError: 'Una categoria con questo nome esiste gi\u00E0',
            invalidCategoryName: 'Nome categoria non valido',
            importedFromAccountingSoftware: 'Le categorie sotto sono importate dal tuo',
            payrollCode: 'Codice busta paga',
            updatePayrollCodeFailureMessage: "Si \u00E8 verificato un errore durante l'aggiornamento del codice di pagamento, per favore riprova.",
            glCode: 'Codice GL',
            updateGLCodeFailureMessage: "Si \u00E8 verificato un errore durante l'aggiornamento del codice GL, per favore riprova.",
            importCategories: 'Importa categorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Non \u00E8 possibile eliminare o disabilitare tutte le categorie',
                description: `Almeno una categoria deve rimanere abilitata perch\u00E9 il tuo spazio di lavoro richiede categorie.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Usa i toggle qui sotto per abilitare pi\u00F9 funzionalit\u00E0 man mano che cresci. Ogni funzionalit\u00E0 apparir\u00E0 nel menu di navigazione per ulteriori personalizzazioni.',
            spendSection: {
                title: 'Spesa',
                subtitle: 'Abilita la funzionalit\u00E0 che ti aiuta a far crescere il tuo team.',
            },
            manageSection: {
                title: 'Gestisci',
                subtitle: 'Aggiungi controlli che aiutano a mantenere le spese entro il budget.',
            },
            earnSection: {
                title: 'Guadagna',
                subtitle: 'Ottimizza i tuoi ricavi e ricevi i pagamenti pi\u00F9 velocemente.',
            },
            organizeSection: {
                title: 'Organizza',
                subtitle: 'Raggruppa e analizza le spese, registra ogni tassa pagata.',
            },
            integrateSection: {
                title: 'Integrare',
                subtitle: 'Collega Expensify a prodotti finanziari popolari.',
            },
            distanceRates: {
                title: 'Tariffe di distanza',
                subtitle: 'Aggiungi, aggiorna e applica le tariffe.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'Imposta le tariffe di diaria per controllare la spesa giornaliera dei dipendenti.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Ottieni informazioni e controllo sulle spese.',
                disableCardTitle: 'Disabilita Expensify Card',
                disableCardPrompt: 'Non puoi disabilitare la Expensify Card perch\u00E9 \u00E8 gi\u00E0 in uso. Contatta Concierge per i prossimi passi.',
                disableCardButton: 'Chatta con Concierge',
                feed: {
                    title: 'Ottieni la Expensify Card',
                    subTitle: 'Ottimizza le spese aziendali e risparmia fino al 50% sulla tua fattura Expensify, oltre a:',
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
                disableCardPrompt: 'Non puoi disabilitare le carte aziendali perch\u00E9 questa funzione \u00E8 in uso. Contatta il Concierge per i prossimi passi.',
                disableCardButton: 'Chatta con Concierge',
                cardDetails: 'Dettagli della carta',
                cardNumber: 'Numero della carta',
                cardholder: 'Titolare della carta',
                cardName: 'Nome della carta',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `${integration} ${type.toLowerCase()} esportazione` : `esportazione ${integration}`,
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) => `Scegli l'account ${integration} dove le transazioni dovrebbero essere esportate.`,
                integrationExportTitlePart: 'Seleziona un diverso',
                integrationExportTitleLinkPart: 'opzione di esportazione',
                integrationExportTitleSecondPart: 'per cambiare i conti disponibili.',
                lastUpdated: 'Ultimo aggiornamento',
                transactionStartDate: 'Data di inizio transazione',
                updateCard: 'Aggiorna carta',
                unassignCard: 'Rimuovi assegnazione carta',
                unassign: 'Rimuovi assegnazione',
                unassignCardDescription: "Rimuovere l'assegnazione di questa carta rimuover\u00E0 tutte le transazioni sui rapporti in bozza dall'account del titolare della carta.",
                assignCard: 'Assegna carta',
                cardFeedName: 'Nome del feed della carta',
                cardFeedNameDescription: 'Dai al feed della carta un nome unico in modo da poterlo distinguere dagli altri.',
                cardFeedTransaction: 'Elimina transazioni',
                cardFeedTransactionDescription: 'Scegli se i titolari di carta possono eliminare le transazioni con carta. Le nuove transazioni seguiranno queste regole.',
                cardFeedRestrictDeletingTransaction: "Limita l'eliminazione delle transazioni",
                cardFeedAllowDeletingTransaction: "Consenti l'eliminazione delle transazioni",
                removeCardFeed: 'Rimuovi feed della carta',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Rimuovi il feed ${feedName}`,
                removeCardFeedDescription: 'Sei sicuro di voler rimuovere questo feed di carte? Questo disassegner\u00E0 tutte le carte.',
                error: {
                    feedNameRequired: 'Il nome del feed della carta \u00E8 obbligatorio',
                },
                corporate: "Limita l'eliminazione delle transazioni",
                personal: "Consenti l'eliminazione delle transazioni",
                setFeedNameDescription: 'Dai al feed della carta un nome univoco in modo da poterlo distinguere dagli altri.',
                setTransactionLiabilityDescription: 'Quando abilitato, i titolari di carta possono eliminare le transazioni con carta. Le nuove transazioni seguiranno questa regola.',
                emptyAddedFeedTitle: 'Assegna carte aziendali',
                emptyAddedFeedDescription: 'Inizia assegnando la tua prima carta a un membro.',
                pendingFeedTitle: `Stiamo esaminando la tua richiesta...`,
                pendingFeedDescription: `Attualmente stiamo esaminando i dettagli del tuo feed. Una volta completato, ti contatteremo tramite`,
                pendingBankTitle: 'Controlla la finestra del tuo browser',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Si prega di connettersi a ${bankName} tramite la finestra del browser che si \u00E8 appena aperta. Se non si \u00E8 aperta,`,
                pendingBankLink: 'per favore clicca qui.',
                giveItNameInstruction: 'Dai alla carta un nome che la distingua dalle altre.',
                updating: 'Aggiornamento in corso...',
                noAccountsFound: 'Nessun account trovato',
                defaultCard: 'Carta predefinita',
                downgradeTitle: `Impossibile eseguire il downgrade dello spazio di lavoro`,
                downgradeSubTitleFirstPart: `Questo workspace non pu\u00F2 essere declassato perch\u00E9 sono collegati pi\u00F9 flussi di carte (escludendo le carte Expensify). Per favore`,
                downgradeSubTitleMiddlePart: `mantieni solo un feed di carte`,
                downgradeSubTitleLastPart: 'procedere.',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Per favore, aggiungi l'account in ${connection} e sincronizza nuovamente la connessione.`,
                expensifyCardBannerTitle: 'Ottieni la Expensify Card',
                expensifyCardBannerSubtitle:
                    'Goditi il cashback su ogni acquisto negli Stati Uniti, fino al 50% di sconto sulla tua fattura Expensify, carte virtuali illimitate e molto altro ancora.',
                expensifyCardBannerLearnMoreButton: 'Scopri di pi\u00F9',
            },
            workflows: {
                title: 'Flussi di lavoro',
                subtitle: 'Configura come viene approvata e pagata la spesa.',
                disableApprovalPrompt:
                    "Le carte Expensify di questo spazio di lavoro attualmente si basano sull'approvazione per definire i loro Limiti Intelligenti. Si prega di modificare i tipi di limite di qualsiasi carta Expensify con Limiti Intelligenti prima di disabilitare le approvazioni.",
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
                subtitle: 'Classifica i costi e traccia le spese fatturabili.',
            },
            taxes: {
                title: 'Tasse',
                subtitle: 'Documenta e recupera le tasse ammissibili.',
            },
            reportFields: {
                title: 'Campi del report',
                subtitle: 'Configura campi personalizzati per le spese.',
            },
            connections: {
                title: 'Contabilit\u00E0',
                subtitle: 'Sincronizza il tuo piano dei conti e altro.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Non cos\u00EC in fretta...',
                featureEnabledText: 'Per abilitare o disabilitare questa funzione, dovrai modificare le impostazioni di importazione contabile.',
                disconnectText: 'Per disabilitare la contabilit\u00E0, dovrai disconnettere la tua connessione contabile dal tuo spazio di lavoro.',
                manageSettings: 'Gestisci impostazioni',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Non cos\u00EC in fretta...',
                featureEnabledText:
                    'Le carte Expensify in questo spazio di lavoro si basano su flussi di approvazione per definire i loro limiti intelligenti.\n\nSi prega di modificare i tipi di limite di qualsiasi carta con limiti intelligenti prima di disabilitare i flussi di lavoro.',
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
                title: 'Non hai creato alcun campo del report',
                subtitle: 'Aggiungi un campo personalizzato (testo, data o menu a discesa) che appare nei report.',
            },
            subtitle: 'I campi del report si applicano a tutte le spese e possono essere utili quando si desidera richiedere informazioni aggiuntive.',
            disableReportFields: 'Disabilita i campi del report',
            disableReportFieldsConfirmation: 'Sei sicuro? I campi di testo e data verranno eliminati e le liste verranno disabilitate.',
            importedFromAccountingSoftware: 'I campi del report qui sotto sono importati dal tuo',
            textType: 'Testo',
            dateType: 'Data',
            dropdownType: 'Elenco',
            textAlternateText: "Aggiungi un campo per l'inserimento di testo libero.",
            dateAlternateText: 'Aggiungi un calendario per la selezione della data.',
            dropdownAlternateText: 'Aggiungi un elenco di opzioni tra cui scegliere.',
            nameInputSubtitle: 'Scegli un nome per il campo del report.',
            typeInputSubtitle: 'Scegli quale tipo di campo del report utilizzare.',
            initialValueInputSubtitle: 'Inserisci un valore iniziale da mostrare nel campo del report.',
            listValuesInputSubtitle: 'Questi valori appariranno nel menu a discesa del campo del tuo report. I valori abilitati possono essere selezionati dai membri.',
            listInputSubtitle: 'Questi valori appariranno nella lista dei campi del tuo report. I valori abilitati possono essere selezionati dai membri.',
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
            deleteValuePrompt: 'Sei sicuro di voler eliminare questo valore dalla lista?',
            deleteValuesPrompt: "Sei sicuro di voler eliminare questi valori dell'elenco?",
            listValueRequiredError: "Si prega di inserire un nome di valore dell'elenco",
            existingListValueError: 'Un valore di elenco con questo nome esiste gi\u00E0',
            editValue: 'Modifica valore',
            listValues: 'Elenca i valori',
            addValue: 'Aggiungi valore',
            existingReportFieldNameError: 'Un campo di report con questo nome esiste gi\u00E0',
            reportFieldNameRequiredError: 'Per favore, inserisci un nome per il campo del report',
            reportFieldTypeRequiredError: 'Si prega di scegliere un tipo di campo del report',
            reportFieldInitialValueRequiredError: 'Si prega di scegliere un valore iniziale del campo del report',
            genericFailureMessage: "Si \u00E8 verificato un errore durante l'aggiornamento del campo del report. Per favore riprova.",
        },
        tags: {
            tagName: 'Nome tag',
            requiresTag: 'I membri devono etichettare tutte le spese',
            trackBillable: 'Traccia le spese fatturabili',
            customTagName: 'Nome tag personalizzato',
            enableTag: 'Abilita tag',
            enableTags: 'Abilita tag',
            disableTag: 'Disabilita tag',
            disableTags: 'Disabilita tag',
            addTag: 'Aggiungi etichetta',
            editTag: 'Modifica tag',
            editTags: 'Modifica tag',
            findTag: 'Trova tag',
            subtitle: 'I tag aggiungono modi pi\u00F9 dettagliati per classificare i costi.',
            requireTag: 'Richiedi tag',
            requireTags: 'Richiedi tag',
            notRequireTags: 'Non richiedere',

            dependentMultiLevelTagsSubtitle: {
                phrase1: ' Stai utilizzando ',
                phrase2: 'tag dipendenti',
                phrase3: '. Puoi ',
                phrase4: 'reimportare un foglio di calcolo',
                phrase5: ' per aggiornare i tuoi tag.',
            },

            emptyTags: {
                title: 'Non hai creato alcun tag',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Aggiungi un tag per tracciare progetti, sedi, reparti e altro.',
                subtitle1: 'Importa un foglio di calcolo per aggiungere tag per tracciare progetti, sedi, reparti e altro.',
                subtitle2: 'Scopri di pi\u00F9',
                subtitle3: 'sui file di tag di formattazione.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'I tuoi tag sono attualmente importati da una connessione contabile. Vai su',
                subtitle2: 'contabilit\u00E0',
                subtitle3: 'per apportare eventuali modifiche.',
            },
            deleteTag: 'Elimina tag',
            deleteTags: 'Elimina tag',
            deleteTagConfirmation: 'Sei sicuro di voler eliminare questo tag?',
            deleteTagsConfirmation: 'Sei sicuro di voler eliminare questi tag?',
            deleteFailureMessage: "Si \u00E8 verificato un errore durante l'eliminazione del tag, riprova per favore.",
            tagRequiredError: 'Il nome del tag \u00E8 obbligatorio',
            existingTagError: 'Esiste gi\u00E0 un tag con questo nome',
            invalidTagNameError: 'Il nome del tag non pu\u00F2 essere 0. Si prega di scegliere un valore diverso.',
            genericFailureMessage: "Si \u00E8 verificato un errore durante l'aggiornamento del tag, riprova per favore.",
            importedFromAccountingSoftware: 'I tag qui sotto sono importati dal tuo',
            glCode: 'Codice GL',
            updateGLCodeFailureMessage: "Si \u00E8 verificato un errore durante l'aggiornamento del codice GL, per favore riprova.",
            tagRules: 'Tag rules',
            approverDescription: 'Approvante',
            importTags: 'Importa tag',
            importTagsSupportingText: 'Codifica le tue spese con un tipo di etichetta o molte.',
            configureMultiLevelTags: 'Configura il tuo elenco di tag per il tagging multi-livello.',
            importMultiLevelTagsSupportingText: `Ecco un'anteprima dei tuoi tag. Se tutto sembra a posto, clicca qui sotto per importarli.`,
            importMultiLevelTags: {
                firstRowTitle: 'La prima riga \u00E8 il titolo per ogni elenco di tag',
                independentTags: 'Questi sono tag indipendenti',
                glAdjacentColumn: "C'\u00E8 un codice GL nella colonna adiacente",
            },
            tagLevel: {
                singleLevel: 'Singolo livello di tag',
                multiLevel: 'Tag multi-livello',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Cambia i livelli dei tag',
                prompt1: 'Cambiare i livelli dei tag canceller\u00E0 tutti i tag attuali.',
                prompt2: 'Ti suggeriamo prima di tutto di',
                prompt3: 'scarica un backup',
                prompt4: 'esportando i tuoi tag.',
                prompt5: 'Scopri di pi\u00F9',
                prompt6: 'informazioni sui livelli dei tag.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Abbiamo trovato *${columnCounts} colonne* nel tuo foglio di calcolo. Seleziona *Nome* accanto alla colonna che contiene i nomi dei tag. Puoi anche selezionare *Abilitato* accanto alla colonna che imposta lo stato dei tag.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Non \u00E8 possibile eliminare o disabilitare tutti i tag',
                description: `Almeno un tag deve rimanere abilitato perch\u00E9 il tuo spazio di lavoro richiede tag.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Non \u00E8 possibile rendere tutti i tag opzionali',
                description: `Almeno un tag deve rimanere obbligatorio perch\u00E9 le impostazioni del tuo spazio di lavoro richiedono tag.`,
            },
            tagCount: () => ({
                one: '1 Giorno',
                other: (count: number) => `${count} Tag`,
            }),
        },
        taxes: {
            subtitle: 'Aggiungi nomi delle tasse, aliquote e imposta i valori predefiniti.',
            addRate: 'Aggiungi tariffa',
            workspaceDefault: 'Valuta predefinita dello spazio di lavoro',
            foreignDefault: 'Valuta estera predefinita',
            customTaxName: 'Nome tassa personalizzata',
            value: 'Valore',
            taxReclaimableOn: 'Imposta recuperabile su',
            taxRate: 'Aliquota fiscale',
            findTaxRate: "Trova l'aliquota fiscale",
            error: {
                taxRateAlreadyExists: 'Questo nome fiscale \u00E8 gi\u00E0 in uso',
                taxCodeAlreadyExists: 'Questo codice fiscale \u00E8 gi\u00E0 in uso',
                valuePercentageRange: 'Inserisci una percentuale valida tra 0 e 100',
                customNameRequired: "\u00C8 richiesto un nome personalizzato per l'imposta",
                deleteFailureMessage: "Si \u00E8 verificato un errore durante l'eliminazione dell'aliquota fiscale. Per favore riprova o chiedi aiuto a Concierge.",
                updateFailureMessage: "Si \u00E8 verificato un errore durante l'aggiornamento dell'aliquota fiscale. Riprova o chiedi aiuto a Concierge.",
                createFailureMessage: "Si \u00E8 verificato un errore durante la creazione dell'aliquota fiscale. Riprova o chiedi aiuto a Concierge.",
                updateTaxClaimableFailureMessage: "La parte recuperabile deve essere inferiore all'importo della tariffa per la distanza.",
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
            updateTaxCodeFailureMessage: "Si \u00E8 verificato un errore durante l'aggiornamento del codice fiscale, per favore riprova.",
        },
        emptyWorkspace: {
            title: 'Crea uno spazio di lavoro',
            subtitle: 'Crea uno spazio di lavoro per tracciare le ricevute, rimborsare le spese, gestire i viaggi, inviare fatture e altro ancora, tutto alla velocit\u00E0 della chat.',
            createAWorkspaceCTA: 'Inizia',
            features: {
                trackAndCollect: 'Traccia e raccogli ricevute',
                reimbursements: 'Rimborsare i dipendenti',
                companyCards: 'Gestisci carte aziendali',
            },
            notFound: 'Nessun workspace trovato',
            description: 'Le stanze sono un ottimo luogo per discutere e lavorare con pi\u00F9 persone. Per iniziare a collaborare, crea o unisciti a uno spazio di lavoro.',
        },
        new: {
            newWorkspace: 'Nuovo spazio di lavoro',
            getTheExpensifyCardAndMore: 'Ottieni la Expensify Card e altro ancora',
            confirmWorkspace: 'Conferma Workspace',
            myGroupWorkspace: 'Il mio spazio di lavoro di gruppo',
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace di ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Si \u00E8 verificato un errore durante la rimozione di un membro dallo spazio di lavoro, riprova per favore.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Sei sicuro di voler rimuovere ${memberName}?`,
                other: 'Sei sicuro di voler rimuovere questi membri?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} \u00E8 un approvatore in questo spazio di lavoro. Quando smetterai di condividere questo spazio di lavoro con loro, li sostituiremo nel flusso di approvazione con il proprietario dello spazio di lavoro, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Rimuovi membro',
                other: 'Rimuovi membri',
            }),
            findMember: 'Trova membro',
            removeWorkspaceMemberButtonTitle: 'Rimuovi dal workspace',
            removeGroupMemberButtonTitle: 'Rimuovi dal gruppo',
            removeRoomMemberButtonTitle: 'Rimuovi dalla chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Sei sicuro di voler rimuovere ${memberName}?`,
            removeMemberTitle: 'Rimuovi membro',
            transferOwner: 'Trasferisci proprietario',
            makeMember: 'Rendi membro',
            makeAdmin: 'Rendi amministratore',
            makeAuditor: 'Crea revisore dei conti',
            selectAll: 'Seleziona tutto',
            error: {
                genericAdd: "Si \u00E8 verificato un problema nell'aggiungere questo membro dello spazio di lavoro",
                cannotRemove: 'Non puoi rimuovere te stesso o il proprietario dello spazio di lavoro',
                genericRemove: 'Si \u00E8 verificato un problema nel rimuovere quel membro dello spazio di lavoro',
            },
            addedWithPrimary: 'Alcuni membri sono stati aggiunti con i loro accessi primari.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Aggiunto dal login secondario ${secondaryLogin}.`,
            membersListTitle: 'Elenco di tutti i membri del workspace.',
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
                fixedAmountDescription: 'Spendi fino a un certo importo una volta',
                setLimit: 'Imposta un limite',
                cardLimitError: 'Inserisci un importo inferiore a $21,474,836',
                giveItName: 'Dagli un nome',
                giveItNameInstruction: "Rendila abbastanza unica da distinguerla dalle altre carte. Casi d'uso specifici sono ancora meglio!",
                cardName: 'Nome della carta',
                letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
                willBeReady: "Questa carta sar\u00E0 pronta per l'uso immediatamente.",
                cardholder: 'Titolare della carta',
                cardType: 'Tipo di carta',
                limit: 'Limite',
                limitType: 'Tipo di limite',
                name: 'Nome',
            },
            deactivateCardModal: {
                deactivate: 'Disattiva',
                deactivateCard: 'Disattiva carta',
                deactivateConfirmation: 'Disattivare questa carta rifiuter\u00E0 tutte le transazioni future e non potr\u00E0 essere annullato.',
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
            needAnotherAccounting: 'Hai bisogno di un altro software di contabilit\u00E0?',
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
            errorODIntegration: "C'\u00E8 un errore con una connessione che \u00E8 stata configurata in Expensify Classic.",
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Predefinito dipendente NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'questa integrazione';
                return `Sei sicuro di voler disconnettere ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Sei sicuro di voler connettere ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'questa integrazione contabile'}? Questo rimuover\u00E0 tutte le connessioni contabili esistenti.`,
            enterCredentials: 'Inserisci le tue credenziali',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importazione clienti';
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
                            return 'Importazione di classi';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importazione delle localit\u00E0';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Elaborazione dei dati importati';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Sincronizzazione dei rapporti rimborsati e dei pagamenti delle fatture';
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
                            return 'Importazione titolo';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importazione certificato di approvazione';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importazione delle dimensioni';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importazione della politica di salvataggio';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Sincronizzazione dei dati con QuickBooks in corso... Assicurati che il Web Connector sia in esecuzione';
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
                            return 'Contrassegnare le fatture e le bollette Xero come pagate';
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
                            return 'Importazione clienti';
                        case 'netSuiteSyncInitData':
                            return 'Recupero dei dati da NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importazione delle tasse';
                        case 'netSuiteSyncImportItems':
                            return 'Importazione di elementi';
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
                            return 'Importazione delle dimensioni Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importazione dei dati Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Traduzione mancante per fase: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Esportatore preferito',
            exportPreferredExporterNote:
                "L'esportatore preferito pu\u00F2 essere qualsiasi amministratore dello spazio di lavoro, ma deve anche essere un Amministratore di Dominio se imposti account di esportazione diversi per le singole carte aziendali nelle Impostazioni di Dominio.",
            exportPreferredExporterSubNote: "Una volta impostato, l'esportatore preferito vedr\u00E0 i report per l'esportazione nel proprio account.",
            exportAs: 'Esporta come',
            exportOutOfPocket: 'Esporta le spese anticipate come',
            exportCompanyCard: 'Esporta le spese della carta aziendale come',
            exportDate: 'Data di esportazione',
            defaultVendor: 'Fornitore predefinito',
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Sincronizza automaticamente NetSuite ed Expensify ogni giorno. Esporta il rapporto finale in tempo reale.',
            reimbursedReports: 'Sincronizza i report rimborsati',
            cardReconciliation: 'Riconciliazione della carta',
            reconciliationAccount: 'Conto di riconciliazione',
            continuousReconciliation: 'Riconciliazione Continua',
            saveHoursOnReconciliation:
                'Risparmia ore nel riconciliare ogni periodo contabile facendo in modo che Expensify riconcili continuamente gli estratti conto e i regolamenti della Expensify Card per tuo conto.',
            enableContinuousReconciliation: 'Per abilitare la Riconciliazione Continua, si prega di abilitare',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Scegli il conto bancario su cui verranno riconciliati i pagamenti della tua Expensify Card.',
                accountMatches: 'Assicurati che questo account corrisponda al tuo',
                settlementAccount: 'Conto di regolamento della carta Expensify',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) => `(terminante in ${lastFourPAN}) affinch\u00E9 la Riconciliazione Continua funzioni correttamente.`,
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
                'Questo \u00E8 il tuo saldo attuale derivante dalla riscossione dei pagamenti delle fatture. Verr\u00E0 trasferito automaticamente sul tuo conto bancario se ne hai aggiunto uno.',
            bankAccountsSubtitle: 'Aggiungi un conto bancario per effettuare e ricevere pagamenti delle fatture.',
        },
        invite: {
            member: 'Invita membro',
            members: 'Invita membri',
            invitePeople: 'Invita nuovi membri',
            genericFailureMessage: "Si \u00E8 verificato un errore durante l'invito del membro allo spazio di lavoro. Per favore riprova.",
            pleaseEnterValidLogin: `Assicurati che l'email o il numero di telefono siano validi (ad es. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'utente',
            users: 'utenti',
            invited: 'invitato',
            removed: 'removed',
            to: 'a',
            from: 'da',
        },
        inviteMessage: {
            confirmDetails: 'Conferma i dettagli',
            inviteMessagePrompt: 'Rendi il tuo invito ancora pi\u00F9 speciale aggiungendo un messaggio qui sotto!',
            personalMessagePrompt: 'Messaggio',
            genericFailureMessage: "Si \u00E8 verificato un errore durante l'invito del membro allo spazio di lavoro. Per favore riprova.",
            inviteNoMembersError: 'Seleziona almeno un membro da invitare',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} ha richiesto di unirsi a ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ops! Non cos\u00EC in fretta...',
            workspaceNeeds: 'Un workspace necessita di almeno una tariffa di distanza abilitata.',
            distance: 'Distanza',
            centrallyManage: 'Gestisci centralmente le tariffe, traccia in miglia o chilometri e imposta una categoria predefinita.',
            rate: 'Tariffa',
            addRate: 'Aggiungi tariffa',
            findRate: 'Trova tariffa',
            trackTax: 'Traccia tasse',
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
            taxFeatureNotEnabledMessage: "Le tasse devono essere abilitate nell'area di lavoro per utilizzare questa funzione. Vai su",
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
            nameInputHelpText: 'Questo \u00E8 il nome che vedrai nel tuo spazio di lavoro.',
            nameIsRequiredError: 'Dovrai dare un nome al tuo spazio di lavoro',
            currencyInputLabel: 'Valuta predefinita',
            currencyInputHelpText: 'Tutte le spese in questo spazio di lavoro saranno convertite in questa valuta.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `La valuta predefinita non pu\u00F2 essere modificata perch\u00E9 questo spazio di lavoro \u00E8 collegato a un conto bancario in ${currency}.`,
            save: 'Salva',
            genericFailureMessage: "Si \u00E8 verificato un errore durante l'aggiornamento dello spazio di lavoro. Per favore riprova.",
            avatarUploadFailureMessage: "Si \u00E8 verificato un errore durante il caricamento dell'avatar. Per favore, riprova.",
            addressContext: '\u00C8 necessario un Indirizzo del Workspace per abilitare Expensify Travel. Inserisci un indirizzo associato alla tua attivit\u00E0.',
        },
        bankAccount: {
            continueWithSetup: 'Continua configurazione',
            youAreAlmostDone:
                'Sei quasi pronto a configurare il tuo conto bancario, il che ti permetter\u00E0 di emettere carte aziendali, rimborsare spese, riscuotere fatture e pagare bollette.',
            streamlinePayments: 'Ottimizza i pagamenti',
            connectBankAccountNote: 'Nota: I conti bancari personali non possono essere utilizzati per i pagamenti negli spazi di lavoro.',
            oneMoreThing: "Un'altra cosa!",
            allSet: 'Tutto pronto!',
            accountDescriptionWithCards: 'Questo conto bancario sar\u00E0 utilizzato per emettere carte aziendali, rimborsare spese, riscuotere fatture e pagare bollette.',
            letsFinishInChat: 'Finiamo in chat!',
            finishInChat: 'Finisci in chat',
            almostDone: 'Quasi finito!',
            disconnectBankAccount: 'Disconnetti conto bancario',
            startOver: 'Ricomincia',
            updateDetails: 'Aggiorna dettagli',
            yesDisconnectMyBankAccount: 'S\u00EC, scollega il mio conto bancario',
            yesStartOver: 'S\u00EC, ricomincia',
            disconnectYour: 'Disconnetti il tuo',
            bankAccountAnyTransactions: 'conto bancario. Qualsiasi transazione in sospeso per questo conto verr\u00E0 comunque completata.',
            clearProgress: 'Ricominciando, cancellerai i progressi fatti finora.',
            areYouSure: 'Sei sicuro?',
            workspaceCurrency: 'Valuta del workspace',
            updateCurrencyPrompt:
                "Sembra che il tuo spazio di lavoro sia attualmente impostato su una valuta diversa dall'USD. Clicca il pulsante qui sotto per aggiornare la tua valuta a USD ora.",
            updateToUSD: 'Aggiorna a USD',
            updateWorkspaceCurrency: 'Aggiorna la valuta dello spazio di lavoro',
            workspaceCurrencyNotSupported: 'Valuta del workspace non supportata',
            yourWorkspace: 'La tua area di lavoro \u00E8 impostata su una valuta non supportata. Visualizza il',
            listOfSupportedCurrencies: 'elenco delle valute supportate',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Trasferisci proprietario',
            addPaymentCardTitle: 'Inserisci la tua carta di pagamento per trasferire la propriet\u00E0',
            addPaymentCardButtonText: 'Accetta i termini e aggiungi la carta di pagamento',
            addPaymentCardReadAndAcceptTextPart1: 'Leggi e accetta',
            addPaymentCardReadAndAcceptTextPart2: 'politica per aggiungere la tua carta',
            addPaymentCardTerms: 'termini',
            addPaymentCardPrivacy: 'privacy',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Conforme a PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Crittografia a livello bancario',
            addPaymentCardRedundant: 'Infrastruttura ridondante',
            addPaymentCardLearnMore: 'Scopri di pi\u00F9 sui nostri',
            addPaymentCardSecurity: 'sicurezza',
            amountOwedTitle: 'Saldo in sospeso',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Questo account ha un saldo in sospeso da un mese precedente.\n\nVuoi saldare il saldo e prendere in carico la fatturazione di questo spazio di lavoro?',
            ownerOwesAmountTitle: 'Saldo in sospeso',
            ownerOwesAmountButtonText: 'Trasferisci saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `L'account che possiede questo workspace (${email}) ha un saldo in sospeso da un mese precedente.\n\nVuoi trasferire questo importo (${amount}) per assumere la fatturazione di questo workspace? La tua carta di pagamento verr\u00E0 addebitata immediatamente.`,
            subscriptionTitle: "Assumere l'abbonamento annuale",
            subscriptionButtonText: 'Trasferisci abbonamento',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Assumere il controllo di questo spazio di lavoro unir\u00E0 il suo abbonamento annuale con il tuo abbonamento attuale. Questo aumenter\u00E0 la dimensione del tuo abbonamento di ${usersCount} membri, portando la nuova dimensione del tuo abbonamento a ${finalCount}. Vuoi continuare?`,
            duplicateSubscriptionTitle: 'Avviso di abbonamento duplicato',
            duplicateSubscriptionButtonText: 'Continua',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Sembra che tu stia cercando di assumere la gestione della fatturazione per gli spazi di lavoro di ${email}, ma per farlo, devi essere un amministratore su tutti i loro spazi di lavoro prima.\n\nClicca "Continua" se vuoi solo assumere la gestione della fatturazione per lo spazio di lavoro ${workspaceName}.\n\nSe vuoi assumere la gestione della fatturazione per l'intero abbonamento, ti preghiamo di far s\u00EC che ti aggiungano come amministratore a tutti i loro spazi di lavoro prima di assumere la gestione della fatturazione.`,
            hasFailedSettlementsTitle: 'Impossibile trasferire la propriet\u00E0',
            hasFailedSettlementsButtonText: 'Ho capito',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Non puoi prendere in carico la fatturazione perch\u00E9 ${email} ha un saldo scaduto della Expensify Card. Per favore, chiedi loro di contattare concierge@expensify.com per risolvere il problema. Successivamente, potrai prendere in carico la fatturazione per questo workspace.`,
            failedToClearBalanceTitle: 'Impossibile azzerare il saldo',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Non siamo riusciti a saldare il saldo. Per favore riprova pi\u00F9 tardi.',
            successTitle: 'Woohoo! Tutto pronto.',
            successDescription: 'Sei ora il proprietario di questo spazio di lavoro.',
            errorTitle: 'Ops! Non cos\u00EC in fretta...',
            errorDescriptionPartOne: 'Si \u00E8 verificato un problema nel trasferire la propriet\u00E0 di questo workspace. Riprova, oppure',
            errorDescriptionPartTwo: 'contatta Concierge',
            errorDescriptionPartThree: 'per assistenza.',
        },
        exportAgainModal: {
            title: 'Attento!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `I seguenti rapporti sono gi\u00E0 stati esportati su ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\nSei sicuro di volerli esportare di nuovo?`,
            confirmText: 'S\u00EC, esporta di nuovo',
            cancelText: 'Annulla',
        },
        upgrade: {
            reportFields: {
                title: 'Campi del report',
                description: `I campi del report ti permettono di specificare dettagli a livello di intestazione, distinti dai tag che si riferiscono alle spese su singoli elementi di linea. Questi dettagli possono includere nomi di progetti specifici, informazioni sui viaggi di lavoro, localit\u00E0 e altro.`,
                onlyAvailableOnPlan: 'I campi del report sono disponibili solo nel piano Control, a partire da',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Goditi la sincronizzazione automatica e riduci le immissioni manuali con l'integrazione Expensify + NetSuite. Ottieni approfondimenti finanziari in tempo reale con il supporto per segmenti nativi e personalizzati, inclusa la mappatura di progetti e clienti.`,
                onlyAvailableOnPlan: 'La nostra integrazione con NetSuite \u00E8 disponibile solo nel piano Control, a partire da',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Goditi la sincronizzazione automatica e riduci le voci manuali con l'integrazione Expensify + Sage Intacct. Ottieni approfondimenti finanziari dettagliati e in tempo reale con dimensioni definite dall'utente, oltre alla codifica delle spese per dipartimento, classe, posizione, cliente e progetto (lavoro).`,
                onlyAvailableOnPlan: 'La nostra integrazione con Sage Intacct \u00E8 disponibile solo nel piano Control, a partire da',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Goditi la sincronizzazione automatica e riduci le registrazioni manuali con l'integrazione di Expensify + QuickBooks Desktop. Ottieni la massima efficienza con una connessione bidirezionale in tempo reale e la codifica delle spese per classe, articolo, cliente e progetto.`,
                onlyAvailableOnPlan: 'La nostra integrazione con QuickBooks Desktop \u00E8 disponibile solo con il piano Control, a partire da',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Approvazioni Avanzate',
                description: `Se vuoi aggiungere pi\u00F9 livelli di approvazione al mix \u2013 o semplicemente assicurarti che le spese pi\u00F9 grandi ricevano un ulteriore controllo \u2013 ti abbiamo coperto. Le approvazioni avanzate ti aiutano a mettere in atto i controlli giusti a ogni livello, cos\u00EC da mantenere sotto controllo le spese del tuo team.`,
                onlyAvailableOnPlan: 'Le approvazioni avanzate sono disponibili solo nel piano Control, che inizia da',
            },
            categories: {
                title: 'Categorie',
                description: `Le categorie ti aiutano a organizzare meglio le spese per tenere traccia di dove stai spendendo i tuoi soldi. Usa la nostra lista di categorie suggerite o crea le tue.`,
                onlyAvailableOnPlan: 'Le categorie sono disponibili nel piano Collect, a partire da',
            },
            glCodes: {
                title: 'Codici GL',
                description: `Aggiungi codici GL alle tue categorie e tag per esportare facilmente le spese nei tuoi sistemi di contabilit\u00E0 e gestione stipendi.`,
                onlyAvailableOnPlan: 'I codici GL sono disponibili solo nel piano Control, a partire da',
            },
            glAndPayrollCodes: {
                title: 'Codici GL e Payroll',
                description: `Aggiungi codici GL e Payroll alle tue categorie per esportare facilmente le spese nei tuoi sistemi contabili e di gestione stipendi.`,
                onlyAvailableOnPlan: 'I codici GL e Payroll sono disponibili solo nel piano Control, a partire da',
            },
            taxCodes: {
                title: 'Codici fiscali',
                description: `Aggiungi i codici fiscali alle tue tasse per un facile esportazione delle spese nei tuoi sistemi di contabilit\u00E0 e gestione stipendi.`,
                onlyAvailableOnPlan: 'I codici fiscali sono disponibili solo nel piano Control, a partire da',
            },
            companyCards: {
                title: 'Carte aziendali illimitate',
                description: `Hai bisogno di aggiungere pi\u00F9 feed di carte? Sblocca carte aziendali illimitate per sincronizzare le transazioni da tutti i principali emittenti di carte.`,
                onlyAvailableOnPlan: 'Questo \u00E8 disponibile solo nel piano Control, a partire da',
            },
            rules: {
                title: 'Regole',
                description: `Le regole funzionano in background e mantengono le tue spese sotto controllo, cos\u00EC non devi preoccuparti delle piccole cose.\n\nRichiedi dettagli delle spese come ricevute e descrizioni, imposta limiti e predefiniti, e automatizza approvazioni e pagamenti, tutto in un unico posto.`,
                onlyAvailableOnPlan: 'Le regole sono disponibili solo nel piano Control, a partire da',
            },
            perDiem: {
                title: 'Per diem',
                description:
                    'Il "per diem" \u00E8 un ottimo modo per mantenere i costi giornalieri conformi e prevedibili ogni volta che i tuoi dipendenti viaggiano. Goditi funzionalit\u00E0 come tariffe personalizzate, categorie predefinite e dettagli pi\u00F9 granulari come destinazioni e sottotariffe.',
                onlyAvailableOnPlan: 'I diari sono disponibili solo nel piano Control, a partire da',
            },
            travel: {
                title: 'Viaggio',
                description:
                    'Expensify Travel \u00E8 una nuova piattaforma aziendale per la prenotazione e la gestione dei viaggi che consente ai membri di prenotare alloggi, voli, trasporti e altro.',
                onlyAvailableOnPlan: 'Il viaggio \u00E8 disponibile nel piano Collect, a partire da',
            },
            multiLevelTags: {
                title: 'Tag multi-livello',
                description:
                    'I Tag Multi-Livello ti aiutano a tracciare le spese con maggiore precisione. Assegna pi\u00F9 tag a ciascun elemento\u2014come reparto, cliente o centro di costo\u2014per catturare il contesto completo di ogni spesa. Questo consente report pi\u00F9 dettagliati, flussi di lavoro di approvazione ed esportazioni contabili.',
                onlyAvailableOnPlan: 'I tag multilivello sono disponibili solo nel piano Control, a partire da',
            },
            pricing: {
                perActiveMember: 'per membro attivo al mese.',
                perMember: 'per membro al mese.',
            },
            note: {
                upgradeWorkspace: 'Aggiorna il tuo spazio di lavoro per accedere a questa funzione, oppure',
                learnMore: 'scopri di pi\u00F9',
                aboutOurPlans: 'informazioni sui nostri piani e prezzi.',
            },
            upgradeToUnlock: 'Sblocca questa funzione',
            completed: {
                headline: `Hai aggiornato il tuo spazio di lavoro!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `Hai aggiornato con successo ${policyName} al piano Control!`,
                categorizeMessage: `Hai eseguito con successo l'upgrade a un workspace sul piano Collect. Ora puoi categorizzare le tue spese!`,
                travelMessage: `Hai effettuato con successo l'upgrade a un workspace con il piano Collect. Ora puoi iniziare a prenotare e gestire i viaggi!`,
                viewSubscription: 'Visualizza il tuo abbonamento',
                moreDetails: 'per maggiori dettagli.',
                gotIt: 'Capito, grazie',
            },
            commonFeatures: {
                title: 'Passa al piano Control',
                note: 'Sblocca le nostre funzionalit\u00E0 pi\u00F9 potenti, tra cui:',
                benefits: {
                    startsAt: 'Il piano Control parte da',
                    perMember: 'per membro attivo al mese.',
                    learnMore: 'Scopri di pi\u00F9',
                    pricing: 'informazioni sui nostri piani e prezzi.',
                    benefit1: 'Connessioni contabili avanzate (NetSuite, Sage Intacct e altro)',
                    benefit2: 'Regole intelligenti per le spese',
                    benefit3: 'Flussi di approvazione multilivello',
                    benefit4: 'Controlli di sicurezza avanzati',
                    toUpgrade: 'Per aggiornare, fai clic',
                    selectWorkspace: "seleziona un'area di lavoro e cambia il tipo di piano in",
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Effettua il downgrade al piano Collect',
                note: "Se effettui il downgrade, perderai l'accesso a queste funzionalit\u00E0 e altro ancora:",
                benefits: {
                    note: "Per un confronto completo dei nostri piani, dai un'occhiata al nostro",
                    pricingPage: 'pagina dei prezzi',
                    confirm: 'Sei sicuro di voler effettuare il downgrade e rimuovere le tue configurazioni?',
                    warning: 'Questo non pu\u00F2 essere annullato.',
                    benefit1: 'Connessioni contabili (eccetto QuickBooks Online e Xero)',
                    benefit2: 'Regole intelligenti per le spese',
                    benefit3: 'Flussi di approvazione multilivello',
                    benefit4: 'Controlli di sicurezza avanzati',
                    headsUp: 'Attenzione!',
                    multiWorkspaceNote:
                        'Dovrai effettuare il downgrade di tutti i tuoi spazi di lavoro prima del tuo primo pagamento mensile per iniziare un abbonamento al tasso Collect. Clicca',
                    selectStep: '> seleziona ciascun workspace > cambia il tipo di piano in',
                },
            },
            completed: {
                headline: 'Il tuo spazio di lavoro \u00E8 stato declassato',
                description: 'Hai altri spazi di lavoro sul piano Control. Per essere fatturato al tasso Collect, devi effettuare il downgrade di tutti gli spazi di lavoro.',
                gotIt: 'Capito, grazie',
            },
        },
        payAndDowngrade: {
            title: 'Paga e declassa',
            headline: 'Il tuo pagamento finale',
            description1: 'La tua fattura finale per questo abbonamento sar\u00E0',
            description2: ({date}: DateParams) => `Vedi il tuo resoconto qui sotto per il ${date}:`,
            subscription:
                'Attenzione! Questa azione terminer\u00E0 il tuo abbonamento a Expensify, eliminer\u00E0 questo spazio di lavoro e rimuover\u00E0 tutti i membri dello spazio di lavoro. Se vuoi mantenere questo spazio di lavoro e rimuovere solo te stesso, fai in modo che un altro amministratore si occupi prima della fatturazione.',
            genericFailureMessage: 'Si \u00E8 verificato un errore durante il pagamento della tua fattura. Per favore, riprova.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Le azioni nello spazio di lavoro ${workspaceName} sono attualmente limitate.`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Il proprietario dello spazio di lavoro, ${workspaceOwnerName}, dovr\u00E0 aggiungere o aggiornare la carta di pagamento registrata per sbloccare la nuova attivit\u00E0 dello spazio di lavoro.`,
            youWillNeedToAddOrUpdatePaymentCard: "Dovrai aggiungere o aggiornare la carta di pagamento registrata per sbloccare la nuova attivit\u00E0 dell'area di lavoro.",
            addPaymentCardToUnlock: 'Aggiungi una carta di pagamento per sbloccare!',
            addPaymentCardToContinueUsingWorkspace: 'Aggiungi una carta di pagamento per continuare a utilizzare questo spazio di lavoro',
            pleaseReachOutToYourWorkspaceAdmin: "Si prega di contattare l'amministratore del workspace per qualsiasi domanda.",
            chatWithYourAdmin: 'Chatta con il tuo amministratore',
            chatInAdmins: 'Chatta in #admins',
            addPaymentCard: 'Aggiungi carta di pagamento',
        },
        rules: {
            individualExpenseRules: {
                title: 'Spese',
                subtitle: 'Imposta controlli di spesa e predefiniti per le singole spese. Puoi anche creare regole per',
                receiptRequiredAmount: 'Importo richiesto per la ricevuta',
                receiptRequiredAmountDescription: 'Richiedi ricevute quando la spesa supera questo importo, a meno che non sia annullata da una regola di categoria.',
                maxExpenseAmount: 'Importo massimo spesa',
                maxExpenseAmountDescription: 'Segnala le spese che superano questo importo, a meno che non siano escluse da una regola di categoria.',
                maxAge: 'Et\u00E0 massima',
                maxExpenseAge: 'Et\u00E0 massima della spesa',
                maxExpenseAgeDescription: 'Contrassegna le spese pi\u00F9 vecchie di un numero specifico di giorni.',
                maxExpenseAgeDays: () => ({
                    one: '1 giorno',
                    other: (count: number) => `${count} giorni`,
                }),
                billableDefault: 'Predefinito fatturabile',
                billableDefaultDescription:
                    'Scegli se le spese in contanti e con carta di credito devono essere fatturabili per impostazione predefinita. Le spese fatturabili sono abilitate o disabilitate in',
                billable: 'Fatturabile',
                billableDescription: 'Le spese sono pi\u00F9 spesso riaddebitate ai clienti.',
                nonBillable: 'Non fatturabile',
                nonBillableDescription: 'Le spese sono occasionalmente riaddebitate ai clienti.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'Le eReceipts sono create automaticamente',
                eReceiptsHintLink: 'per la maggior parte delle transazioni di credito in USD',
                attendeeTracking: 'Tracciamento dei partecipanti',
                attendeeTrackingHint: 'Tieni traccia del costo per persona per ogni spesa.',
                prohibitedDefaultDescription:
                    "Segnala tutte le ricevute in cui compaiono alcolici, gioco d'azzardo o altri articoli vietati. Le spese con ricevute in cui compaiono questi articoli richiederanno una revisione manuale.",
                prohibitedExpenses: 'Spese proibite',
                alcohol: 'Alcol',
                hotelIncidentals: "Spese accessorie dell'hotel",
                gambling: "Gioco d'azzardo",
                tobacco: 'Tabacco',
                adultEntertainment: 'Intrattenimento per adulti',
            },
            expenseReportRules: {
                examples: 'Esempi:',
                title: 'Report di spesa',
                subtitle: 'Automatizza la conformit\u00E0, le approvazioni e il pagamento dei report di spesa.',
                customReportNamesSubtitle: 'Personalizza i titoli dei rapporti utilizzando il nostro',
                customNameTitle: 'Titolo predefinito del report',
                customNameDescription: 'Scegli un nome personalizzato per i rapporti di spesa utilizzando il nostro',
                customNameDescriptionLink: 'formule estese',
                customNameInputLabel: 'Nome',
                customNameEmailPhoneExample: 'Email o telefono del membro: {report:submit:from}',
                customNameStartDateExample: 'Data di inizio del report: {report:startdate}',
                customNameWorkspaceNameExample: 'Nome dello spazio di lavoro: {report:workspacename}',
                customNameReportIDExample: 'Report ID: {report:id}',
                customNameTotalExample: 'Totale: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Impedisci ai membri di modificare i nomi dei report personalizzati',
                preventSelfApprovalsTitle: 'Impedisci auto-approvazioni',
                preventSelfApprovalsSubtitle: 'Impedisci ai membri del workspace di approvare i propri report di spesa.',
                autoApproveCompliantReportsTitle: 'Approva automaticamente i report conformi',
                autoApproveCompliantReportsSubtitle: "Configura quali report di spesa sono idonei per l'approvazione automatica.",
                autoApproveReportsUnderTitle: 'Approvare automaticamente i rapporti sotto',
                autoApproveReportsUnderDescription: 'I rapporti spese completamente conformi sotto questo importo saranno approvati automaticamente.',
                randomReportAuditTitle: 'Revisione casuale del report',
                randomReportAuditDescription: "Richiedi che alcuni rapporti siano approvati manualmente, anche se idonei per l'approvazione automatica.",
                autoPayApprovedReportsTitle: 'Rapporti approvati per il pagamento automatico',
                autoPayApprovedReportsSubtitle: 'Configura quali report spese sono idonei per il pagamento automatico.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Per favore, inserisci un importo inferiore a ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Vai su altre funzionalit\u00E0 e abilita i flussi di lavoro, quindi aggiungi i pagamenti per sbloccare questa funzione.',
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
                    `Ricorda ai dipendenti di fornire ulteriori informazioni per la spesa \u201C${categoryName}\u201D. Questo suggerimento appare nel campo descrizione delle spese.`,
                descriptionHintLabel: 'Suggerimento',
                descriptionHintSubtitle: 'Suggerimento: Pi\u00F9 \u00E8 breve, meglio \u00E8!',
                maxAmount: 'Importo massimo',
                flagAmountsOver: 'Segnala importi superiori a',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Si applica alla categoria \u201C${categoryName}\u201D.`,
                flagAmountsOverSubtitle: "Questo sostituisce l'importo massimo per tutte le spese.",
                expenseLimitTypes: {
                    expense: 'Spesa individuale',
                    expenseSubtitle:
                        "Contrassegna gli importi delle spese per categoria. Questa regola sostituisce la regola generale dello spazio di lavoro per l'importo massimo della spesa.",
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
                description: 'Inserisci regole personalizzate per i rapporti di spesa',
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
            description: 'Scegli un piano adatto a te. Per un elenco dettagliato delle funzionalit\u00E0 e dei prezzi, consulta il nostro',
            subscriptionLink: 'pagina di aiuto per tipi di piano e prezzi',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Hai impegnato 1 membro attivo nel piano Control fino alla fine del tuo abbonamento annuale il ${annualSubscriptionEndDate}. Puoi passare all'abbonamento a consumo e fare il downgrade al piano Collect a partire dal ${annualSubscriptionEndDate} disabilitando il rinnovo automatico in`,
                other: `Hai impegnato ${count} membri attivi sul piano Control fino alla fine del tuo abbonamento annuale il ${annualSubscriptionEndDate}. Puoi passare all'abbonamento a consumo e effettuare il downgrade al piano Collect a partire dal ${annualSubscriptionEndDate} disabilitando il rinnovo automatico in`,
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
        onboardingHelp: "Assistenza per l'onboarding",
    },
    emojiPicker: {
        skinTonePickerLabel: 'Cambia il tono della pelle predefinito',
        headers: {
            frequentlyUsed: 'Usato di frequente',
            smileysAndEmotion: 'Smileys & Emotion',
            peopleAndBody: 'Persone e Corpo',
            animalsAndNature: 'Animali e Natura',
            foodAndDrink: 'Cibo e Bevande',
            travelAndPlaces: 'Viaggi e Luoghi',
            activities: 'Attivit\u00E0',
            objects: 'Oggetti',
            symbols: 'Simboli',
            flags: 'Bandiere',
        },
    },
    newRoomPage: {
        newRoom: 'Nuova stanza',
        groupName: 'Nome del gruppo',
        roomName: 'Nome della stanza',
        visibility: 'Visibilit\u00E0',
        restrictedDescription: 'Le persone nel tuo spazio di lavoro possono trovare questa stanza',
        privateDescription: 'Le persone invitate a questa stanza possono trovarla',
        publicDescription: 'Chiunque pu\u00F2 trovare questa stanza',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Chiunque pu\u00F2 trovare questa stanza',
        createRoom: 'Crea stanza',
        roomAlreadyExistsError: 'Una stanza con questo nome esiste gi\u00E0',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) =>
            `${reservedName} \u00E8 una stanza predefinita in tutti gli spazi di lavoro. Si prega di scegliere un altro nome.`,
        roomNameInvalidError: 'I nomi delle stanze possono includere solo lettere minuscole, numeri e trattini',
        pleaseEnterRoomName: 'Per favore, inserisci un nome per la stanza',
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
        growlMessageOnRenameError: "Impossibile rinominare la stanza dell'area di lavoro. Si prega di controllare la connessione e riprovare.",
        visibilityOptions: {
            restricted: 'Workspace', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
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
                return `aggiunto il codice di busta paga "${newValue}" alla categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `rimosso il codice payroll "${oldValue}" dalla categoria "${categoryName}"`;
            }
            return `ha cambiato il codice di libro paga della categoria "${categoryName}" in "${newValue}" (precedentemente "${oldValue}")`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `ha aggiunto il codice GL "${newValue}" alla categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `rimosso il codice GL "${oldValue}" dalla categoria "${categoryName}"`;
            }
            return `ha cambiato il codice GL della categoria \u201C${categoryName}\u201D in \u201C${newValue}\u201D (precedentemente \u201C${oldValue}\u201C)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `ha cambiato la descrizione della categoria "${categoryName}" in ${!oldValue ? 'richiesto' : 'non richiesto'} (precedentemente ${!oldValue ? 'non richiesto' : 'richiesto'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `aggiunto un importo massimo di ${newAmount} alla categoria "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `rimosso l'importo massimo di ${oldAmount} dalla categoria "${categoryName}"`;
            }
            return `ha cambiato l'importo massimo della categoria "${categoryName}" a ${newAmount} (precedentemente ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `ha aggiunto un tipo di limite di ${newValue} alla categoria "${categoryName}"`;
            }
            return `ha cambiato il tipo di limite della categoria "${categoryName}" in ${newValue} (precedentemente ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `ha aggiornato la categoria "${categoryName}" cambiando Ricevute in ${newValue}`;
            }
            return `ha cambiato la categoria "${categoryName}" in ${newValue} (precedentemente ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `rinominato la categoria "${oldName}" in "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `rimosso il suggerimento della descrizione "${oldValue}" dalla categoria "${categoryName}"`;
            }
            return !oldValue
                ? `aggiunto il suggerimento della descrizione "${newValue}" alla categoria "${categoryName}"`
                : `ha cambiato il suggerimento della descrizione della categoria "${categoryName}" in \u201C${newValue}\u201D (precedentemente \u201C${oldValue}\u201D)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `ha cambiato il nome dell'elenco dei tag in "${newName}" (precedentemente "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `ha aggiunto il tag "${tagName}" alla lista "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `ha aggiornato l'elenco dei tag "${tagListName}" cambiando il tag "${oldName}" in "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'abilitato' : 'disabilitato'} il tag "${tagName}" nella lista "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `rimosso il tag "${tagName}" dalla lista "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `rimosso "${count}" tag dall'elenco "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `aggiornato il tag "${tagName}" nella lista "${tagListName}" cambiando il ${updatedField} in "${newValue}" (precedentemente "${oldValue}")`;
            }
            return `ha aggiornato il tag "${tagName}" nella lista "${tagListName}" aggiungendo un ${updatedField} di "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `ha cambiato il ${customUnitName} ${updatedField} in "${newValue}" (precedentemente "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Tracciamento fiscale ${newValue ? 'abilitato' : 'disabilitato'} sulle tariffe di distanza`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `aggiunto un nuovo tasso "${customUnitName}" "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `ha cambiato il tasso dell'unit\u00E0 personalizzata ${customUnitName} ${updatedField} "${customUnitRateName}" a "${newValue}" (precedentemente "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `ha cambiato l'aliquota fiscale sulla tariffa di distanza "${customUnitRateName}" a "${newValue} (${newTaxPercentage})" (precedentemente "${oldValue} (${oldTaxPercentage})")`;
            }
            return `aggiunto l'aliquota fiscale "${newValue} (${newTaxPercentage})" alla tariffa di distanza "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `ha modificato la parte recuperabile delle tasse sulla tariffa di distanza "${customUnitRateName}" a "${newValue}" (precedentemente "${oldValue}")`;
            }
            return `aggiunto una parte rimborsabile delle tasse di "${newValue}" alla tariffa di distanza "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `rimosso la tariffa "${rateName}" dell'unit\u00E0 personalizzata "${customUnitName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `aggiunto campo di report ${fieldType} "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `imposta il valore predefinito del campo report "${fieldName}" su "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `aggiunta l'opzione "${optionName}" al campo del report "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `rimosso l'opzione "${optionName}" dal campo del report "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'abilitato' : 'disabilitato'} l'opzione "${optionName}" per il campo del report "${fieldName}"`,
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
            `ha modificato l'importo massimo richiesto per la ricevuta a ${newValue} (precedentemente ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `ha modificato l'importo massimo delle spese per le violazioni a ${newValue} (precedentemente ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aggiornato "Et\u00E0 massima della spesa (giorni)" a "${newValue}" (precedentemente "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `imposta la data di invio del rapporto mensile su "${newValue}"`;
            }
            return `aggiornato la data di presentazione del rapporto mensile a "${newValue}" (precedentemente "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aggiornato "Riaddebita spese ai clienti" a "${newValue}" (precedentemente "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `ha attivato "Imponi titoli predefiniti dei report" ${value ? 'su' : 'spento'}`,
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
                other: `ti ha rimosso dai flussi di approvazione e dalle chat delle spese di ${joinedNames}. I rapporti precedentemente inviati rimarranno disponibili per l'approvazione nella tua Posta in arrivo.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `ha aggiornato il tuo ruolo in ${policyName} da ${oldRole} a utente. Sei stato rimosso da tutte le chat delle spese dei presentatori tranne la tua.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `ha aggiornato la valuta predefinita a ${newCurrency} (precedentemente ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `ha aggiornato la frequenza di auto-reporting a "${newFrequency}" (precedentemente "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `ha aggiornato la modalit\u00E0 di approvazione a "${newValue}" (precedentemente "${oldValue}")`,
        upgradedWorkspace: 'ha aggiornato questo spazio di lavoro al piano Control',
        downgradedWorkspace: 'ha declassato questo spazio di lavoro al piano Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `ha modificato la percentuale di report instradati casualmente per l'approvazione manuale a ${Math.round(newAuditRate * 100)}% (precedentemente ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `ha modificato il limite di approvazione manuale per tutte le spese a ${newLimit} (precedentemente ${oldLimit})`,
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
            genericAdd: "Si \u00E8 verificato un problema nell'aggiungere questo membro alla stanza",
        },
    },
    newTaskPage: {
        assignTask: 'Assegna compito',
        assignMe: 'Assegnami',
        confirmTask: 'Conferma attivit\u00E0',
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
            created: ({title}: TaskCreatedActionParams) => `attivit\u00E0 per ${title}`,
            completed: 'contrassegnato come completato',
            canceled: 'attivit\u00E0 eliminata',
            reopened: 'segnato come incompleto',
            error: "Non hai il permesso di eseguire l'azione richiesta.",
        },
        markAsComplete: 'Segna come completato',
        markAsIncomplete: 'Segna come incompleto',
        assigneeError: "Si \u00E8 verificato un errore durante l'assegnazione di questo compito. Si prega di provare con un altro assegnatario.",
        genericCreateTaskFailureMessage: 'Si \u00E8 verificato un errore durante la creazione di questa attivit\u00E0. Riprova pi\u00F9 tardi.',
        deleteTask: 'Elimina attivit\u00E0',
        deleteConfirmation: 'Sei sicuro di voler eliminare questo compito?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Estratto conto di ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Scorciatoie da tastiera',
        subtitle: 'Risparmia tempo con queste pratiche scorciatoie da tastiera:',
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
        screenShareRequest: 'Expensify ti invita a una condivisione dello schermo',
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
                title: 'Non hai ancora creato nessuna spesa',
                subtitle: 'Crea una spesa o fai un test drive di Expensify per saperne di pi\u00F9.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per creare una spesa.',
            },
            emptyReportResults: {
                title: 'Non hai ancora creato nessun report',
                subtitle: 'Crea un report o fai un test drive di Expensify per saperne di pi\u00F9.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per creare un report.',
            },
            emptyInvoiceResults: {
                title: 'Non hai ancora creato nessuna fattura',
                subtitle: 'Invia una fattura o fai un test drive di Expensify per saperne di pi\u00F9.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per inviare una fattura.',
            },
            emptyTripResults: {
                title: 'Nessun viaggio da visualizzare',
                subtitle: 'Inizia prenotando il tuo primo viaggio qui sotto.',
                buttonText: 'Prenota un viaggio',
            },
            emptySubmitResults: {
                title: 'Nessuna spesa da inviare',
                subtitle: 'Tutto a posto. Fai un giro di vittoria!',
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
                subtitle: '\u00C8 ora di rilassarsi, bel lavoro.',
            },
        },
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
            hold: 'Attesa',
            unhold: 'Rimuovi blocco',
            noOptionsAvailable: 'Nessuna opzione disponibile per il gruppo di spese selezionato.',
        },
        filtersHeader: 'Filtri',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Prima di ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Dopo ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
            },
            status: 'Stato',
            keyword: 'Parola chiave',
            hasKeywords: 'Ha parole chiave',
            currency: 'Valuta',
            link: 'Link',
            pinned: 'Fissato',
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
        },
        moneyRequestReport: {
            emptyStateTitle: 'Questo rapporto non ha spese.',
            emptyStateSubtitle: 'Puoi aggiungere spese a questo report utilizzando il pulsante sopra.',
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
            description: 'Wow, sono molti articoli! Li raggrupperemo e Concierge ti invier\u00E0 un file a breve.',
        },
        exportAll: {
            selectAllMatchingItems: 'Seleziona tutti gli elementi corrispondenti',
            allMatchingItemsSelected: 'Tutti gli elementi corrispondenti selezionati',
        },
    },
    genericErrorPage: {
        title: 'Oh-oh, qualcosa \u00E8 andato storto!',
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
                'Controlla la tua cartella delle foto o dei download per una copia del tuo codice QR. Suggerimento: aggiungilo a una presentazione affinch\u00E9 il tuo pubblico possa scansionarlo e connettersi direttamente con te.',
        },
        generalError: {
            title: 'Errore allegato',
            message: "Impossibile scaricare l'allegato",
        },
        permissionError: {
            title: 'Accesso allo storage',
            message: 'Expensify non pu\u00F2 salvare gli allegati senza accesso allo spazio di archiviazione. Tocca impostazioni per aggiornare le autorizzazioni.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nuovo Expensify',
        about: 'Informazioni su New Expensify',
        update: 'Aggiorna New Expensify',
        checkForUpdates: 'Controlla aggiornamenti',
        toggleDevTools: 'Attiva/Disattiva Strumenti per sviluppatori',
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
        copy: 'Copia',
        paste: 'Incolla',
        pasteAndMatchStyle: 'Incolla e Abbina Stile',
        pasteAsPlainText: 'Incolla come testo normale',
        delete: 'Elimina',
        selectAll: 'Seleziona tutto',
        speechSubmenu: 'Discorso',
        startSpeaking: 'Inizia a parlare',
        stopSpeaking: 'Smetti di parlare',
        viewMenu: 'Visualizza',
        reload: 'Ricarica',
        forceReload: 'Forza Ricarica',
        resetZoom: 'Dimensione effettiva',
        zoomIn: 'Ingrandisci',
        zoomOut: 'Riduci lo zoom',
        togglefullscreen: 'Attiva/Disattiva Schermo Intero',
        historyMenu: 'Cronologia',
        back: 'Indietro',
        forward: 'Inoltra',
        windowMenu: 'Finestra',
        minimize: 'Minimizza',
        zoom: 'Zoom',
        front: 'Porta tutto in primo piano',
        helpMenu: 'Aiuto',
        learnMore: 'Scopri di pi\u00F9',
        documentation: 'Documentazione',
        communityDiscussions: 'Discussioni della Comunit\u00E0',
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
                `La nuova versione sar\u00E0 disponibile a breve.${!isSilentUpdating ? 'Ti informeremo quando saremo pronti per aggiornare.' : ''}`,
            soundsGood: 'Va bene',
        },
        notAvailable: {
            title: 'Aggiornamento non disponibile',
            message: 'Non ci sono aggiornamenti disponibili al momento. Per favore, ricontrolla pi\u00F9 tardi!',
            okay: 'Okay',
        },
        error: {
            title: 'Aggiornamento controllo fallito',
            message: "Non siamo riusciti a verificare la disponibilit\u00E0 di un aggiornamento. Riprova tra un po'.",
        },
    },
    report: {
        newReport: {
            createReport: 'Crea rapporto',
            chooseWorkspace: "Scegli un'area di lavoro per questo report.",
        },
        genericCreateReportFailureMessage: 'Errore imprevisto durante la creazione di questa chat. Per favore riprova pi\u00F9 tardi.',
        genericAddCommentFailureMessage: "Errore imprevisto durante l'invio del commento. Per favore riprova pi\u00F9 tardi.",
        genericUpdateReportFieldFailureMessage: "Errore imprevisto durante l'aggiornamento del campo. Per favore riprova pi\u00F9 tardi.",
        genericUpdateReportNameEditFailureMessage: 'Errore imprevisto durante la rinomina del report. Per favore riprova pi\u00F9 tardi.',
        noActivityYet: 'Nessuna attivit\u00E0 ancora',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `cambiato ${fieldName} da ${oldValue} a ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `cambiato ${fieldName} in ${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `cambiato l'area di lavoro in ${toPolicyName}${fromPolicyName ? `(precedentemente ${fromPolicyName})` : ''}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `cambiato tipo da ${oldType} a ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `inviato questo rapporto a ${delegateUser} poich\u00E9 ${originalManager} \u00E8 in vacanza`,
                exportedToCSV: `esportato in CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `esportato in ${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `esportato in ${label} tramite`,
                    automaticActionTwo: 'impostazioni contabili',
                    manual: ({label}: ExportedToIntegrationParams) => `ha contrassegnato questo rapporto come esportato manualmente su ${label}.`,
                    automaticActionThree: 'e ha creato con successo un record per',
                    reimburseableLink: 'spese vive',
                    nonReimbursableLink: 'spese con carta aziendale',
                    pending: ({label}: ExportedToIntegrationParams) => `ha iniziato l'esportazione di questo rapporto su ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `impossibile esportare questo report su ${label} ("${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `ha aggiunto una ricevuta`,
                managerDetachReceipt: `rimosso una ricevuta`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `pagato ${currency}${amount} altrove`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `pagato ${currency}${amount} tramite integrazione`,
                outdatedBankAccount: `impossibile elaborare il pagamento a causa di un problema con il conto bancario del pagatore`,
                reimbursementACHBounce: `impossibile elaborare il pagamento, poich\u00E9 il pagatore non ha fondi sufficienti`,
                reimbursementACHCancelled: `ha annullato il pagamento`,
                reimbursementAccountChanged: `impossibile elaborare il pagamento, poich\u00E9 il pagatore ha cambiato conto bancario`,
                reimbursementDelayed: `elaborato il pagamento ma \u00E8 in ritardo di 1-2 giorni lavorativi in pi\u00F9`,
                selectedForRandomAudit: `selezionato casualmente per la revisione`,
                selectedForRandomAuditMarkdown: `[selezionato casualmente](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) per revisione`,
                share: ({to}: ShareParams) => `membro invitato ${to}`,
                unshare: ({to}: UnshareParams) => `membro rimosso ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `pagato ${currency}${amount}`,
                takeControl: `ha preso il controllo`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `impossibile sincronizzare con ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `aggiunto ${email} come ${role === 'member' ? 'a' : 'un/una'} ${role}`,
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
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} per ${dayCount} ${dayCount === 1 ? 'giorno' : 'giorni'} fino a ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} da ${timePeriod} il ${date}`,
    },
    footer: {
        features: 'Funzionalit\u00E0',
        expenseManagement: 'Gestione delle Spese',
        spendManagement: 'Gestione delle spese',
        expenseReports: 'Report di spesa',
        companyCreditCard: 'Carta di credito aziendale',
        receiptScanningApp: 'App di scansione delle ricevute',
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
        terms: 'Termini di servizio',
        privacy: 'Privacy',
        learnMore: 'Scopri di pi\u00F9',
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
        lastChatMessagePreview: "Anteprima dell'ultimo messaggio in chat",
        workspaceName: 'Nome del workspace',
        chatUserDisplayNames: 'Nomi visualizzati dei membri della chat',
        scrollToNewestMessages: 'Scorri ai messaggi pi\u00F9 recenti',
        preStyledText: 'Testo preformattato',
        viewAttachment: 'Visualizza allegato',
    },
    parentReportAction: {
        deletedReport: 'Rapporto eliminato',
        deletedMessage: 'Messaggio eliminato',
        deletedExpense: 'Spesa eliminata',
        reversedTransaction: 'Transazione annullata',
        deletedTask: 'Attivit\u00E0 eliminata',
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
        harassmentDescription: 'Comportamento razzista, misogino o altro comportamento ampiamente discriminatorio',
        assault: 'Assalto',
        assaultDescription: "Attacco emotivo specificamente mirato con l'intenzione di fare del male",
        flaggedContent: 'Questo messaggio \u00E8 stato segnalato per violazione delle nostre regole della comunit\u00E0 e il contenuto \u00E8 stato nascosto.',
        hideMessage: 'Nascondi messaggio',
        revealMessage: 'Rivela messaggio',
        levelOneResult: 'Invia avviso anonimo e il messaggio viene segnalato per la revisione.',
        levelTwoResult: 'Messaggio nascosto dal canale, pi\u00F9 avviso anonimo e il messaggio \u00E8 segnalato per la revisione.',
        levelThreeResult: 'Messaggio rimosso dal canale pi\u00F9 avviso anonimo e messaggio segnalato per revisione.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Invitali',
        nothing: 'Non fare nulla',
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
            'Unisciti a Expensify.org per eliminare le ingiustizie nel mondo. L\'attuale campagna "Teachers Unite" supporta gli educatori ovunque dividendo i costi dei materiali scolastici essenziali.',
        iKnowATeacher: 'Conosco un insegnante',
        iAmATeacher: 'Sono un insegnante',
        getInTouch: 'Eccellente! Per favore condividi le loro informazioni cos\u00EC possiamo metterci in contatto con loro.',
        introSchoolPrincipal: 'Introduzione al tuo preside',
        schoolPrincipalVerifyExpense:
            "Expensify.org divide il costo dei materiali scolastici essenziali in modo che gli studenti di famiglie a basso reddito possano avere un'esperienza di apprendimento migliore. Il tuo preside sar\u00E0 invitato a verificare le tue spese.",
        principalFirstName: 'Nome principale',
        principalLastName: 'Cognome del preside',
        principalWorkEmail: 'Email di lavoro principale',
        updateYourEmail: 'Aggiorna il tuo indirizzo email',
        updateEmail: 'Aggiorna indirizzo email',
        contactMethods: 'Metodi di contatto.',
        schoolMailAsDefault: 'Prima di procedere, assicurati di impostare la tua email scolastica come metodo di contatto predefinito. Puoi farlo in Impostazioni > Profilo >',
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
        deleteWaypoint: 'Elimina punto di passaggio',
        deleteWaypointConfirmation: 'Sei sicuro di voler eliminare questo punto di passaggio?',
        address: 'Indirizzo',
        waypointDescription: {
            start: 'Inizia',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Mappa in sospeso',
            subtitle: 'La mappa verr\u00E0 generata quando torni online',
            onlineSubtitle: 'Un momento mentre configuriamo la mappa',
            errorTitle: 'Errore mappa',
            errorSubtitle: 'Si \u00E8 verificato un errore durante il caricamento della mappa. Riprova.',
        },
        error: {
            selectSuggestedAddress: 'Seleziona un indirizzo suggerito o usa la posizione attuale',
        },
    },
    reportCardLostOrDamaged: {
        report: 'Segnala la perdita / il danneggiamento della carta fisica',
        screenTitle: 'Scheda di valutazione persa o danneggiata',
        nextButtonLabel: 'Successivo',
        reasonTitle: 'Perch\u00E9 hai bisogno di una nuova carta?',
        cardDamaged: 'La mia carta \u00E8 stata danneggiata',
        cardLostOrStolen: 'La mia carta \u00E8 stata persa o rubata',
        confirmAddressTitle: "Per favore, conferma l'indirizzo postale per la tua nuova carta.",
        cardDamagedInfo: 'La tua nuova carta arriver\u00E0 entro 2-3 giorni lavorativi. La tua carta attuale continuer\u00E0 a funzionare finch\u00E9 non attiverai quella nuova.',
        cardLostOrStolenInfo:
            'La tua carta attuale verr\u00E0 disattivata permanentemente non appena il tuo ordine sar\u00E0 effettuato. La maggior parte delle carte arriva in pochi giorni lavorativi.',
        address: 'Indirizzo',
        deactivateCardButton: 'Disattiva carta',
        shipNewCardButton: 'Spedisci nuova carta',
        addressError: 'Indirizzo richiesto',
        reasonError: 'Motivo richiesto',
    },
    eReceipt: {
        guaranteed: 'eReceipt garantito',
        transactionDate: 'Data della transazione',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'Inizia una chat,',
            buttonText2: 'presenta un amico.',
            header: 'Inizia una chat, invita un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Inizia una chat con loro e ci occuperemo del resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Invia una spesa,',
            buttonText2: 'riferisci il tuo capo.',
            header: 'Invia una spesa, riferisci al tuo capo',
            body: 'Vuoi che anche il tuo capo utilizzi Expensify? Basta inviare loro una spesa e ci occuperemo del resto.',
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
        billableExpense: 'Fatturabile non pi\u00F9 valido',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Ricevuta richiesta${formattedLimit ? `oltre ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categoria non pi\u00F9 valida',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Applicata una sovrattassa di conversione del ${surcharge}%`,
        customUnitOutOfPolicy: 'Tariffa non valida per questo workspace',
        duplicatedTransaction: 'Duplicato',
        fieldRequired: 'I campi del report sono obbligatori',
        futureDate: 'Data futura non consentita',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Contrassegnato con un aumento del ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data pi\u00F9 vecchia di ${maxAge} giorni`,
        missingCategory: 'Categoria mancante',
        missingComment: 'Descrizione richiesta per la categoria selezionata',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Mancante ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return "L'importo differisce dalla distanza calcolata";
                case 'card':
                    return 'Importo superiore alla transazione con carta';
                default:
                    if (displayPercentVariance) {
                        return `Importo ${displayPercentVariance}% maggiore della ricevuta scansionata`;
                    }
                    return 'Importo superiore alla ricevuta scansionata';
            }
        },
        modifiedDate: 'La data \u00E8 diversa dalla ricevuta scansionata',
        nonExpensiworksExpense: 'Spesa non-Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `La spesa supera il limite di approvazione automatica di ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Importo oltre il limite di categoria di ${formattedLimit}/persona`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Importo oltre il limite di ${formattedLimit}/persona`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Importo oltre il limite di ${formattedLimit}/persona`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Importo oltre il limite giornaliero di ${formattedLimit}/persona per categoria`,
        receiptNotSmartScanned:
            'Dettagli della spesa e ricevuta aggiunti manualmente. Si prega di verificare i dettagli. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Scopri di pi\u00F9</a> sull\'audit automatico per tutte le ricevute.',
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
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return '';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `Impossibile abbinare automaticamente la ricevuta a causa di una connessione bancaria interrotta che ${email} deve risolvere.`
                    : 'Impossibile abbinare automaticamente la ricevuta a causa di un problema di connessione bancaria che devi risolvere.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Chiedi a ${member} di segnare come contante o aspetta 7 giorni e riprova` : 'In attesa di unire con la transazione della carta.';
            }
            return '';
        },
        brokenConnection530Error: 'Ricevuta in sospeso a causa di una connessione bancaria interrotta',
        adminBrokenConnectionError: 'Ricevuta in sospeso a causa di una connessione bancaria interrotta. Si prega di risolvere in',
        memberBrokenConnectionError: 'Ricevuta in sospeso a causa di una connessione bancaria interrotta. Si prega di chiedere a un amministratore dello spazio di lavoro di risolvere.',
        markAsCashToIgnore: 'Contrassegna come contante per ignorare e richiedere il pagamento.',
        smartscanFailed: ({canEdit = true}) => `Scansione della ricevuta fallita.${canEdit ? 'Inserisci i dettagli manualmente.' : ''}`,
        receiptGeneratedWithAI: 'Ricevuta potenzialmente generata da AI',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Mancante ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} non pi\u00F9 valido`,
        taxAmountChanged: "L'importo delle tasse \u00E8 stato modificato",
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Tassa'} non pi\u00F9 valido`,
        taxRateChanged: "L'aliquota fiscale \u00E8 stata modificata",
        taxRequired: 'Aliquota fiscale mancante',
        none: 'Nessuno',
        taxCodeToKeep: 'Scegli quale codice fiscale mantenere',
        tagToKeep: 'Scegli quale tag mantenere',
        isTransactionReimbursable: 'Scegli se la transazione \u00E8 rimborsabile',
        merchantToKeep: 'Scegli quale commerciante mantenere',
        descriptionToKeep: 'Scegli quale descrizione mantenere',
        categoryToKeep: 'Scegli quale categoria mantenere',
        isTransactionBillable: 'Scegli se la transazione \u00E8 fatturabile',
        keepThisOne: 'Tieni questo',
        confirmDetails: `Conferma i dettagli che stai conservando`,
        confirmDuplicatesInfo: `Le richieste duplicate che non conservi saranno tenute in attesa che il membro le elimini.`,
        hold: 'Questa spesa \u00E8 stata messa in sospeso',
        resolvedDuplicates: 'risolto il duplicato',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} \u00E8 obbligatorio`,
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
        playbackSpeed: 'Velocit\u00E0 di riproduzione',
        expand: 'Espandi',
        mute: 'Silenzia',
        unmute: "Riattiva l'audio",
        normal: 'Normale',
    },
    exitSurvey: {
        header: 'Prima di andare',
        reasonPage: {
            title: 'Per favore, dicci perch\u00E9 te ne vai',
            subtitle: 'Prima di andare, per favore dicci perch\u00E9 vorresti passare a Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ho bisogno di una funzione disponibile solo in Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Non capisco come usare New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Capisco come usare New Expensify, ma preferisco Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Quale funzionalit\u00E0 ti serve che non \u00E8 disponibile nel nuovo Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Cosa stai cercando di fare?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Perch\u00E9 preferisci Expensify Classic?',
        },
        responsePlaceholder: 'La tua risposta',
        thankYou: 'Grazie per il feedback!',
        thankYouSubtitle: 'Le tue risposte ci aiuteranno a costruire un prodotto migliore per portare a termine le cose. Grazie mille!',
        goToExpensifyClassic: 'Passa a Expensify Classic',
        offlineTitle: 'Sembra che tu sia bloccato qui...',
        offline:
            'Sembra che tu sia offline. Purtroppo, Expensify Classic non funziona offline, ma New Expensify s\u00EC. Se preferisci usare Expensify Classic, riprova quando hai una connessione internet.',
        quickTip: 'Suggerimento rapido...',
        quickTipSubTitle: 'Puoi andare direttamente a Expensify Classic visitando expensify.com. Aggiungilo ai segnalibri per un facile accesso rapido!',
        bookACall: 'Prenota una chiamata',
        noThanks: 'No grazie',
        bookACallTitle: 'Vuoi parlare con un product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Chattare direttamente su spese e rapporti',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Possibilit\u00E0 di fare tutto su mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Viaggi e spese alla velocit\u00E0 della chat',
        },
        bookACallTextTop: 'Passando a Expensify Classic, perderai:',
        bookACallTextBottom:
            'Saremmo entusiasti di fare una chiamata con te per capire il motivo. Puoi prenotare una chiamata con uno dei nostri senior product manager per discutere le tue esigenze.',
        takeMeToExpensifyClassic: 'Portami a Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Si \u00E8 verificato un errore durante il caricamento di altri messaggi',
        tryAgain: 'Riprova',
    },
    systemMessage: {
        mergedWithCashTransaction: 'ha abbinato una ricevuta a questa transazione',
    },
    subscription: {
        authenticatePaymentCard: 'Autentica carta di pagamento',
        mobileReducedFunctionalityMessage: "Non puoi apportare modifiche al tuo abbonamento nell'app mobile.",
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Prova gratuita: ${numOfDays} ${numOfDays === 1 ? 'giorno' : 'giorni'} rimanenti`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Le tue informazioni di pagamento sono obsolete',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Aggiorna la tua carta di pagamento entro il ${date} per continuare a utilizzare tutte le tue funzionalit\u00E0 preferite.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Il tuo pagamento non \u00E8 stato elaborato',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Il tuo addebito del ${date} di ${purchaseAmountOwed} non \u00E8 stato elaborato. Si prega di aggiungere una carta di pagamento per saldare l'importo dovuto.`
                        : "Per favore, aggiungi una carta di pagamento per saldare l'importo dovuto.",
            },
            policyOwnerUnderInvoicing: {
                title: 'Le tue informazioni di pagamento sono obsolete',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Il tuo pagamento \u00E8 scaduto. Si prega di pagare la fattura entro il ${date} per evitare l'interruzione del servizio.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Le tue informazioni di pagamento sono obsolete',
                subtitle: 'Il tuo pagamento \u00E8 in ritardo. Si prega di pagare la tua fattura.',
            },
            billingDisputePending: {
                title: 'La tua carta non pu\u00F2 essere addebitata',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Hai contestato l'addebito di ${amountOwed} sulla carta che termina con ${cardEnding}. Il tuo account sar\u00E0 bloccato fino a quando la controversia non sar\u00E0 risolta con la tua banca.`,
            },
            cardAuthenticationRequired: {
                title: 'La tua carta non pu\u00F2 essere addebitata',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `La tua carta di pagamento non \u00E8 stata completamente autenticata. Completa il processo di autenticazione per attivare la tua carta di pagamento che termina con ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'La tua carta non pu\u00F2 essere addebitata',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `La tua carta di pagamento \u00E8 stata rifiutata a causa di fondi insufficienti. Riprova o aggiungi una nuova carta di pagamento per saldare il tuo saldo in sospeso di ${amountOwed}.`,
            },
            cardExpired: {
                title: 'La tua carta non pu\u00F2 essere addebitata',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `La tua carta di pagamento \u00E8 scaduta. Aggiungi una nuova carta di pagamento per saldare il tuo saldo in sospeso di ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'La tua carta sta per scadere presto',
                subtitle:
                    'La tua carta di pagamento scadr\u00E0 alla fine di questo mese. Clicca sul menu a tre punti qui sotto per aggiornarla e continuare a utilizzare tutte le tue funzionalit\u00E0 preferite.',
            },
            retryBillingSuccess: {
                title: 'Successo!',
                subtitle: 'La tua carta \u00E8 stata addebitata con successo.',
            },
            retryBillingError: {
                title: 'La tua carta non pu\u00F2 essere addebitata',
                subtitle:
                    "Prima di riprovare, chiama direttamente la tua banca per autorizzare gli addebiti di Expensify e rimuovere eventuali blocchi. Altrimenti, prova ad aggiungere un'altra carta di pagamento.",
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Hai contestato l'addebito di ${amountOwed} sulla carta che termina con ${cardEnding}. Il tuo account sar\u00E0 bloccato fino a quando la controversia non sar\u00E0 risolta con la tua banca.`,
            preTrial: {
                title: 'Inizia una prova gratuita',
                subtitleStart: 'Come prossimo passo,',
                subtitleLink: 'completa la tua lista di controllo per la configurazione',
                subtitleEnd: 'cos\u00EC il tuo team pu\u00F2 iniziare a fare spese.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Prova: ${numOfDays} ${numOfDays === 1 ? 'giorno' : 'giorni'} rimasti!`,
                subtitle: 'Aggiungi una carta di pagamento per continuare a utilizzare tutte le tue funzionalit\u00E0 preferite.',
            },
            trialEnded: {
                title: 'Il tuo periodo di prova gratuito \u00E8 terminato',
                subtitle: 'Aggiungi una carta di pagamento per continuare a utilizzare tutte le tue funzionalit\u00E0 preferite.',
            },
            earlyDiscount: {
                claimOffer: 'Richiedi offerta',
                noThanks: 'No grazie',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% di sconto sul tuo primo anno!`,
                    phrase2: `Basta aggiungere una carta di pagamento e iniziare un abbonamento annuale.`,
                },
                onboardingChatTitle: {
                    phrase1: 'Offerta a tempo limitato:',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% di sconto sul tuo primo anno!`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Richiedi entro ${days > 0 ? `${days}g :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Pagamento',
            subtitle: 'Aggiungi una carta per pagare il tuo abbonamento Expensify.',
            addCardButton: 'Aggiungi carta di pagamento',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `La tua prossima data di pagamento \u00E8 ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Carta che termina con ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nome: ${name}, Scadenza: ${expiration}, Valuta: ${currency}`,
            changeCard: 'Cambia carta di pagamento',
            changeCurrency: 'Cambia valuta di pagamento',
            cardNotFound: 'Nessuna carta di pagamento aggiunta',
            retryPaymentButton: 'Riprova il pagamento',
            authenticatePayment: 'Autentica pagamento',
            requestRefund: 'Richiedi rimborso',
            requestRefundModal: {
                phrase1: 'Ottenere un rimborso \u00E8 facile, basta effettuare il downgrade del tuo account prima della prossima data di fatturazione e riceverai un rimborso.',
                phrase2:
                    "Attenzione: Il downgrade del tuo account comporta l'eliminazione del/dei tuo/i spazio/i di lavoro. Questa azione non pu\u00F2 essere annullata, ma puoi sempre creare un nuovo spazio di lavoro se cambi idea.",
                confirm: 'Elimina spazio(i) di lavoro e declassa',
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
                benefit5: 'Prenotazione viaggi e regole',
                benefit6: 'Integrazioni QuickBooks/Xero',
                benefit7: 'Chatta su spese, rapporti e stanze',
                benefit8: 'Supporto AI e umano',
            },
            control: {
                title: 'Controllo',
                description: 'Spese, viaggi e chat per le grandi aziende.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Expensify Card, ${upper}/membro attivo senza la Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Expensify Card, ${upper}/membro attivo senza la Expensify Card.`,
                benefit1: 'Tutto nel piano Collect',
                benefit2: 'Flussi di approvazione multilivello',
                benefit3: 'Regole personalizzate per le spese',
                benefit4: 'Integrazioni ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integrazioni HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Approfondimenti e report personalizzati',
                benefit8: 'Budgeting',
            },
            thisIsYourCurrentPlan: 'Questo \u00E8 il tuo piano attuale',
            downgrade: 'Effettua il downgrade a Collect',
            upgrade: 'Aggiorna a Control',
            addMembers: 'Aggiungi membri',
            saveWithExpensifyTitle: 'Risparmia con la Expensify Card',
            saveWithExpensifyDescription: 'Usa il nostro calcolatore di risparmio per vedere come il cashback dalla Expensify Card pu\u00F2 ridurre la tua fattura Expensify.',
            saveWithExpensifyButton: 'Scopri di pi\u00F9',
        },
        compareModal: {
            comparePlans: 'Confronta i piani',
            unlockTheFeatures: 'Sblocca le funzionalit\u00E0 di cui hai bisogno con il piano giusto per te.',
            viewOurPricing: 'Visualizza la nostra pagina dei prezzi',
            forACompleteFeatureBreakdown: 'per una descrizione completa delle funzionalit\u00E0 di ciascuno dei nostri piani.',
        },
        details: {
            title: "Dettagli dell'abbonamento",
            annual: 'Abbonamento annuale',
            taxExempt: 'Richiedi lo status di esenzione fiscale',
            taxExemptEnabled: 'Esente da tasse',
            taxExemptStatus: 'Stato di esenzione fiscale',
            payPerUse: 'Pagamento a consumo',
            subscriptionSize: "Dimensione dell'abbonamento",
            headsUp:
                'Attenzione: Se non imposti ora la dimensione del tuo abbonamento, la imposteremo automaticamente sul numero di membri attivi del primo mese. Sarai quindi impegnato a pagare per almeno questo numero di membri per i prossimi 12 mesi. Puoi aumentare la dimensione del tuo abbonamento in qualsiasi momento, ma non puoi diminuirla fino alla fine del tuo abbonamento.',
            zeroCommitment: 'Zero impegno al tasso di abbonamento annuale scontato',
        },
        subscriptionSize: {
            title: "Dimensione dell'abbonamento",
            yourSize: 'La dimensione del tuo abbonamento \u00E8 il numero di posti disponibili che possono essere occupati da qualsiasi membro attivo in un determinato mese.',
            eachMonth:
                'Ogni mese, il tuo abbonamento copre fino al numero di membri attivi impostato sopra. Ogni volta che aumenti la dimensione del tuo abbonamento, inizierai un nuovo abbonamento di 12 mesi a quella nuova dimensione.',
            note: 'Nota: Un membro attivo \u00E8 chiunque abbia creato, modificato, inviato, approvato, rimborsato o esportato dati di spesa collegati allo spazio di lavoro della tua azienda.',
            confirmDetails: 'Conferma i dettagli del tuo nuovo abbonamento annuale:',
            subscriptionSize: "Dimensione dell'abbonamento",
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membri attivi/mese`,
            subscriptionRenews: "Il rinnovo dell'abbonamento",
            youCantDowngrade: 'Non puoi effettuare il downgrade durante il tuo abbonamento annuale.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Hai gi\u00E0 sottoscritto un abbonamento annuale di ${size} membri attivi al mese fino al ${date}. Puoi passare a un abbonamento a consumo il ${date} disabilitando il rinnovo automatico.`,
            error: {
                size: 'Si prega di inserire una dimensione di abbonamento valida',
                sameSize: 'Inserisci un numero diverso dalla dimensione attuale del tuo abbonamento',
            },
        },
        paymentCard: {
            addPaymentCard: 'Aggiungi carta di pagamento',
            enterPaymentCardDetails: 'Inserisci i dettagli della tua carta di pagamento',
            security: "Expensify \u00E8 conforme a PCI-DSS, utilizza la crittografia a livello bancario e utilizza un'infrastruttura ridondante per proteggere i tuoi dati.",
            learnMoreAboutSecurity: 'Scopri di pi\u00F9 sulla nostra sicurezza.',
        },
        subscriptionSettings: {
            title: "Impostazioni dell'abbonamento",
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Tipo di abbonamento: ${subscriptionType}, Dimensione dell'abbonamento: ${subscriptionSize}, Rinnovo automatico: ${autoRenew}, Aumento automatico dei posti annuali: ${autoIncrease}`,
            none: 'none',
            on: 'su',
            off: 'spento',
            annual: 'Annuale',
            autoRenew: 'Rinnovo automatico',
            autoIncrease: 'Aumento automatico dei posti annuali',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Risparmia fino a ${amountWithCurrency}/mese per membro attivo`,
            automaticallyIncrease:
                'Aumenta automaticamente i tuoi posti annuali per accogliere i membri attivi che superano la dimensione del tuo abbonamento. Nota: Questo estender\u00E0 la data di fine del tuo abbonamento annuale.',
            disableAutoRenew: 'Disattiva rinnovo automatico',
            helpUsImprove: 'Aiutaci a migliorare Expensify',
            whatsMainReason: 'Qual \u00E8 il motivo principale per cui stai disabilitando il rinnovo automatico?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Rinnova il ${date}.`,
            pricingConfiguration: 'Il prezzo dipende dalla configurazione. Per ottenere il prezzo pi\u00F9 basso, scegli un abbonamento annuale e ottieni la Expensify Card.',
            learnMore: {
                part1: 'Scopri di pi\u00F9 sul nostro',
                pricingPage: 'pagina dei prezzi',
                part2: 'o chatta con il nostro team nel tuo',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Prezzo stimato',
            changesBasedOn: "Questo cambia in base all'utilizzo della tua Expensify Card e alle opzioni di abbonamento riportate di seguito.",
        },
        requestEarlyCancellation: {
            title: 'Richiedi cancellazione anticipata',
            subtitle: 'Qual \u00E8 il motivo principale per cui stai richiedendo la cancellazione anticipata?',
            subscriptionCanceled: {
                title: 'Abbonamento annullato',
                subtitle: 'Il tuo abbonamento annuale \u00E8 stato annullato.',
                info: 'Se desideri continuare a utilizzare il tuo workspace su base pay-per-use, sei a posto.',
                preventFutureActivity: {
                    part1: 'Se desideri impedire attivit\u00E0 e addebiti futuri, devi',
                    link: 'elimina il tuo/i tuoi workspace(s)',
                    part2: '. Nota che quando elimini il tuo workspace, ti verr\u00E0 addebitata qualsiasi attivit\u00E0 in sospeso che \u00E8 stata sostenuta durante il mese di calendario corrente.',
                },
            },
            requestSubmitted: {
                title: 'Richiesta inviata',
                subtitle: {
                    part1: 'Grazie per averci informato che sei interessato a cancellare il tuo abbonamento. Stiamo esaminando la tua richiesta e ti contatteremo presto tramite la tua chat con',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: {
                part1: 'Richiedendo la cancellazione anticipata, riconosco e accetto che Expensify non ha alcun obbligo di concedere tale richiesta ai sensi di Expensify.',
                link: 'Termini di servizio',
                part2: 'o un altro accordo di servizi applicabile tra me e Expensify e che Expensify mantiene la sola discrezione riguardo alla concessione di qualsiasi richiesta del genere.',
            },
        },
    },
    feedbackSurvey: {
        tooLimited: 'La funzionalit\u00E0 necessita di miglioramenti.',
        tooExpensive: 'Troppo costoso',
        inadequateSupport: 'Assistenza clienti inadeguata',
        businessClosing: "Chiusura dell'azienda, ridimensionamento o acquisizione",
        additionalInfoTitle: 'A quale software ti stai trasferendo e perch\u00E9?',
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
        genericError: 'Ops, qualcosa \u00E8 andato storto. Per favore riprova.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `per conto di ${delegator}`,
        accessLevel: 'Livello di accesso',
        confirmCopilot: 'Conferma il tuo copilota qui sotto.',
        accessLevelDescription: "Scegli un livello di accesso qui sotto. Sia l'accesso Completo che Limitato consentono ai copiloti di visualizzare tutte le conversazioni e le spese.",
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Consenti a un altro membro di compiere tutte le azioni nel tuo account, per tuo conto. Include chat, invii, approvazioni, pagamenti, aggiornamenti delle impostazioni e altro ancora.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Consenti a un altro membro di eseguire la maggior parte delle azioni nel tuo account, per tuo conto. Esclude approvazioni, pagamenti, rifiuti e sospensioni.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Rimuovi copilot',
        removeCopilotConfirmation: 'Sei sicuro di voler rimuovere questo copilota?',
        changeAccessLevel: 'Cambia livello di accesso',
        makeSureItIsYou: 'Verifichiamo che sei tu',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Inserisci il codice magico inviato a ${contactMethod} per aggiungere un copilota. Dovrebbe arrivare entro uno o due minuti.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Per favore, inserisci il codice magico inviato a ${contactMethod} per aggiornare il tuo copilota.`,
        notAllowed: 'Non cos\u00EC in fretta...',
        noAccessMessage: 'In qualit\u00E0 di copilota, non hai accesso a questa pagina. Mi dispiace!',
        notAllowedMessageStart: `Come un/una`,
        notAllowedMessageHyperLinked: 'copilot',
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
        editJson: 'Modifica JSON:',
        preview: 'Anteprima:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Manca ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Propriet\u00E0 non valida: ${propertyName} - Previsto: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valore non valido - Previsto: ${expectedValues}`,
        missingValue: 'Valore mancante',
        createReportAction: 'Crea Azione Rapporto',
        reportAction: 'Segnala azione',
        report: 'Rapporto',
        transaction: 'Transazione',
        violations: 'Violazioni',
        transactionViolation: 'Violazione della transazione',
        hint: 'Le modifiche ai dati non verranno inviate al backend',
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
        createTransactionViolation: 'Crea violazione della transazione',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ha commento in bozza',
            hasGBR: 'Has GBR',
            hasRBR: 'Ha RBR',
            pinnedByUser: 'Aggiunto ai preferiti da un membro',
            hasIOUViolations: 'Ha violazioni IOU',
            hasAddWorkspaceRoomErrors: "Ha errori di aggiunta della stanza dell'area di lavoro",
            isUnread: '\u00C8 non letto (modalit\u00E0 di concentrazione)',
            isArchived: '\u00C8 archiviato (modalit\u00E0 pi\u00F9 recente)',
            isSelfDM: '\u00C8 un messaggio diretto a se stessi',
            isFocused: '\u00C8 temporaneamente concentrato',
        },
        reasonGBR: {
            hasJoinRequest: 'Ha richiesto di unirsi (stanza amministratore)',
            isUnreadWithMention: '\u00C8 non letto con menzione',
            isWaitingForAssigneeToCompleteAction: "\u00C8 in attesa che l'assegnatario completi l'azione",
            hasChildReportAwaitingAction: 'Ha un report figlio in attesa di azione',
            hasMissingInvoiceBankAccount: 'Manca il conto bancario della fattura',
        },
        reasonRBR: {
            hasErrors: 'Ha errori nei dati del report o delle azioni del report',
            hasViolations: 'Ha violazioni',
            hasTransactionThreadViolations: 'Ha violazioni del thread delle transazioni',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "C'\u00E8 un report in attesa di azione",
            theresAReportWithErrors: "C'\u00E8 un rapporto con errori",
            theresAWorkspaceWithCustomUnitsErrors: "C'\u00E8 un workspace con errori di unit\u00E0 personalizzate",
            theresAProblemWithAWorkspaceMember: "C'\u00E8 un problema con un membro dello spazio di lavoro",
            theresAProblemWithAWorkspaceQBOExport: "Si \u00E8 verificato un problema con l'impostazione di esportazione della connessione dello spazio di lavoro.",
            theresAProblemWithAContactMethod: "C'\u00E8 un problema con un metodo di contatto",
            aContactMethodRequiresVerification: 'Un metodo di contatto richiede la verifica',
            theresAProblemWithAPaymentMethod: "C'\u00E8 un problema con un metodo di pagamento",
            theresAProblemWithAWorkspace: "C'\u00E8 un problema con uno spazio di lavoro",
            theresAProblemWithYourReimbursementAccount: "C'\u00E8 un problema con il tuo conto di rimborso",
            theresABillingProblemWithYourSubscription: "C'\u00E8 un problema di fatturazione con il tuo abbonamento",
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Il tuo abbonamento \u00E8 stato rinnovato con successo',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Si \u00E8 verificato un problema durante la sincronizzazione della connessione dello spazio di lavoro.',
            theresAProblemWithYourWallet: "C'\u00E8 un problema con il tuo portafoglio",
            theresAProblemWithYourWalletTerms: "C'\u00E8 un problema con i termini del tuo portafoglio",
        },
    },
    emptySearchView: {
        takeATestDrive: 'Fai un test drive',
    },
    migratedUserWelcomeModal: {
        title: 'Viaggi e spese, alla velocit\u00E0 della chat',
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
            part1: 'Controlla cosa',
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
            part3: 'e altro.',
            part4: 'Provalo!',
        },
        GBRRBRChat: {
            part1: 'Vedrai \uD83D\uDFE2 su',
            part2: 'azioni da intraprendere',
            part3: ',\ne \uD83D\uDD34 su',
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
            part2: 'completa la prova su strada!',
        },
    },
    discardChangesConfirmation: {
        title: 'Eliminare le modifiche?',
        body: 'Sei sicuro di voler annullare le modifiche apportate?',
        confirmText: 'Annulla modifiche',
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
        description: 'Tutti gli avvertimenti e le violazioni sono stati risolti quindi:',
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
            title: 'Fai un giro di prova con noi',
            description: 'Fai un rapido tour del prodotto per aggiornarti velocemente. Nessuna sosta necessaria!',
            confirmText: 'Inizia la prova',
            helpText: 'Salta',
            employee: {
                description:
                    "<muted-text>Ottieni per il tuo team <strong>3 mesi gratuiti di Expensify!</strong> Inserisci l'email del tuo capo qui sotto e invia loro una spesa di prova.</muted-text>",
                email: "Inserisci l'email del tuo capo",
                error: 'Quel membro possiede uno spazio di lavoro, per favore inserisci un nuovo membro per il test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Attualmente stai provando Expensify',
            readyForTheRealThing: 'Pronto per la cosa reale?',
            getStarted: 'Inizia',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} ti ha invitato a provare Expensify\nEhi! Ho appena ottenuto *3 mesi gratis* per provare Expensify, il modo pi\u00F9 veloce per gestire le spese.\n\nEcco una *ricevuta di prova* per mostrarti come funziona:`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
