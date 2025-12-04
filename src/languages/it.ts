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
        count: 'Conteggio',
        cancel: 'Annulla',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Chiudi',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Procedi',
        yes: 'Sì',
        no: 'No',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Non ora',
        noThanks: 'No grazie',
        learnMore: 'Scopri di più',
        buttonConfirm: 'Ho capito',
        name: 'Nome',
        attachment: 'Allegato',
        attachments: 'Allegati',
        center: 'Centro',
        from: 'Da',
        to: 'A',
        in: 'In',
        optional: 'Facoltativo',
        new: 'Nuovo',
        search: 'Cerca',
        reports: 'Report',
        find: 'Trova',
        searchWithThreeDots: 'Cerca...',
        next: 'Avanti',
        previous: 'Precedente',
        // @context Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.
        goBack: 'Torna indietro',
        create: 'Crea',
        add: 'Aggiungi',
        resend: 'Reinvia',
        save: 'Salva',
        select: 'Seleziona',
        deselect: 'Deseleziona',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Selezione multipla',
        saveChanges: 'Salva modifiche',
        submit: 'Invia',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Inviato',
        rotate: 'Ruota',
        zoom: 'Zoom',
        password: 'Password',
        magicCode: 'Codice magico',
        twoFactorCode: 'Codice a due fattori',
        workspaces: 'Spazi di lavoro',
        inbox: 'Posta in arrivo',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: 'Operazione riuscita',
        group: 'Gruppo',
        profile: 'Profilo',
        referral: 'Referral',
        payments: 'Pagamenti',
        approvals: 'Approvazioni',
        wallet: 'Portafoglio',
        preferences: 'Preferenze',
        view: 'Visualizza',
        review: (reviewParams?: ReviewParams) => `Rivedi${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
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
        or: 'oppure',
        details: 'Dettagli',
        privacy: 'Privacy',
        privacyPolicy: 'Informativa sulla privacy',
        hidden: 'Nascosto',
        visible: 'Visibile',
        delete: 'Elimina',
        // @context UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.
        archived: 'Archiviato',
        contacts: 'Contatti',
        recents: 'Recenti',
        close: 'Chiudi',
        comment: 'Commento',
        download: 'Scarica',
        downloading: 'Download in corso',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: 'Caricamento in corso',
        // @context as a verb, not a noun
        pin: 'Fissa',
        unPin: 'Sblocca dalla parte superiore',
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
        ssnFull9: 'Tutte e 9 le cifre del SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Riga indirizzo ${lineNumber}`,
        personalAddress: 'Indirizzo personale',
        companyAddress: 'Indirizzo aziendale',
        noPO: 'Niente caselle postali o indirizzi di recapito postale, per favore.',
        city: 'Città',
        state: 'Stato',
        streetAddress: 'Indirizzo улица',
        stateOrProvince: 'Stato / Provincia',
        country: 'Paese',
        zip: 'CAP',
        zipPostCode: 'CAP / Codice postale',
        whatThis: "Che cos'è?",
        iAcceptThe: 'Accetto il',
        acceptTermsAndPrivacy: `Accetto i <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termini di servizio di Expensify</a> e l'<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Informativa sulla privacy</a>`,
        acceptTermsAndConditions: `Accetto i <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">termini e condizioni</a>`,
        acceptTermsOfService: `Accetto i <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termini di servizio di Expensify</a>`,
        remove: 'Rimuovi',
        admin: 'Amministratore',
        owner: 'Proprietario',
        dateFormat: 'AAAA-MM-GG',
        send: 'Invia',
        na: 'N/D',
        noResultsFound: 'Nessun risultato trovato',
        noResultsFoundMatching: (searchString: string) => `Nessun risultato trovato corrispondente a "${searchString}"`,
        recentDestinations: 'Destinazioni recenti',
        timePrefix: 'È',
        conjunctionFor: 'per',
        todayAt: 'Oggi alle',
        tomorrowAt: 'Domani alle',
        yesterdayAt: 'Ieri alle',
        conjunctionAt: 'a',
        conjunctionTo: 'a',
        genericErrorMessage: 'Ops... si è verificato un errore e la tua richiesta non può essere completata. Riprova più tardi.',
        percentage: 'Percentuale',
        error: {
            invalidAmount: 'Importo non valido',
            acceptTerms: 'Devi accettare i Termini di servizio per continuare',
            phoneNumber: `Inserisci un numero di telefono completo
(ad es. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Questo campo è obbligatorio',
            requestModified: 'Questa richiesta è in fase di modifica da parte di un altro membro',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Limite di caratteri superato (${length}/${limit})`,
            dateInvalid: 'Seleziona una data valida',
            invalidDateShouldBeFuture: 'Scegli la data di oggi o una data futura',
            invalidTimeShouldBeFuture: 'Scegli un orario almeno un minuto più avanti',
            invalidCharacter: 'Carattere non valido',
            enterMerchant: 'Inserisci il nome dell’esercente',
            enterAmount: 'Inserisci un importo',
            missingMerchantName: 'Nome esercente mancante',
            missingAmount: 'Importo mancante',
            missingDate: 'Data mancante',
            enterDate: 'Inserisci una data',
            invalidTimeRange: 'Inserisci un orario utilizzando il formato a 12 ore (es.: 14:30 PM)',
            pleaseCompleteForm: 'Completa il modulo sopra per continuare',
            pleaseSelectOne: "Seleziona un'opzione sopra",
            invalidRateError: 'Inserisci un tasso valido',
            lowRateError: 'La tariffa deve essere maggiore di 0',
            email: 'Inserisci un indirizzo email valido',
            login: 'Si è verificato un errore durante l’accesso. Riprova.',
        },
        comma: 'virgola',
        semicolon: 'punto e virgola',
        please: 'Per favore',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'Contattaci',
        pleaseEnterEmailOrPhoneNumber: "Inserisci un'email o un numero di telefono",
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'Correggi gli errori',
        inTheFormBeforeContinuing: 'nel modulo prima di continuare',
        confirm: 'Conferma',
        reset: 'Reimposta',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: 'Fatto',
        more: 'Altro',
        debitCard: 'Carta di debito',
        bankAccount: 'Conto bancario',
        personalBankAccount: 'Conto bancario personale',
        businessBankAccount: 'Conto bancario aziendale',
        join: 'Unisciti',
        leave: 'Esci',
        decline: 'Rifiuta',
        reject: 'Rifiuta',
        transferBalance: 'Trasferisci saldo',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: 'Inseriscilo manualmente',
        message: 'Messaggio',
        leaveThread: 'Abbandona conversazione',
        you: 'Tu',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'Io',
        youAfterPreposition: 'tu',
        your: 'il tuo',
        conciergeHelp: 'Contatta Concierge per ottenere assistenza.',
        youAppearToBeOffline: 'Sembra che tu sia offline.',
        thisFeatureRequiresInternet: 'Questa funzionalità richiede una connessione Internet attiva.',
        attachmentWillBeAvailableOnceBackOnline: 'L’allegato sarà disponibile non appena tornerai online.',
        errorOccurredWhileTryingToPlayVideo: 'Si è verificato un errore durante il tentativo di riprodurre questo video.',
        areYouSure: 'Sei sicuro?',
        verify: 'Verifica',
        yesContinue: 'Sì, continua',
        // @context Provides an example format for a website URL.
        websiteExample: 'es. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `ad es. ${zipSampleFormat}` : ''),
        description: 'Descrizione',
        title: 'Titolo',
        assignee: 'Assegnatario',
        createdBy: 'Creato da',
        with: 'con',
        shareCode: 'Condividi codice',
        share: 'Condividi',
        per: 'per',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: 'miglio',
        km: 'chilometro',
        copied: 'Copiato!',
        someone: 'Qualcuno',
        total: 'Totale',
        edit: 'Modifica',
        letsDoThis: `Facciamolo!`,
        letsStart: `Iniziamo`,
        showMore: 'Mostra altro',
        showLess: 'Mostra meno',
        merchant: 'Esercente',
        category: 'Categoria',
        report: 'Report',
        billable: 'Fatturabile',
        nonBillable: 'Non fatturabile',
        tag: 'Etichetta',
        receipt: 'Ricevuta',
        verified: 'Verificato',
        replace: 'Sostituisci',
        distance: 'Distanza',
        mile: 'miglio',
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: 'miglia',
        kilometer: 'chilometro',
        kilometers: 'chilometri',
        recent: 'Recenti',
        all: 'Tutti',
        am: 'AM',
        pm: 'PM',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: 'Da definire',
        selectCurrency: 'Seleziona una valuta',
        selectSymbolOrCurrency: 'Seleziona un simbolo o una valuta',
        card: 'Carta',
        whyDoWeAskForThis: 'Perché lo chiediamo?',
        required: 'Obbligatorio',
        showing: 'Mostrando',
        of: 'di',
        default: 'Predefinito',
        update: 'Aggiorna',
        member: 'Membro',
        auditor: 'Revisore',
        role: 'Ruolo',
        currency: 'Valuta',
        groupCurrency: 'Valuta del gruppo',
        rate: 'Valuta',
        emptyLHN: {
            title: 'Urrà! Sei in pari con tutto.',
            subtitleText1: 'Trova una chat utilizzando il',
            subtitleText2: 'pulsante qui sopra o crea qualcosa usando il',
            subtitleText3: 'pulsante qui sotto.',
        },
        businessName: 'Nome dell’azienda',
        clear: 'Cancella',
        type: 'Tipo',
        reportName: 'Nome report',
        action: 'Azione',
        expenses: 'Spese',
        totalSpend: 'Spesa totale',
        tax: 'Imposta',
        shared: 'Condiviso',
        drafts: 'Bozze',
        // @context as a noun, not a verb
        draft: 'Bozza',
        finished: 'Completato',
        upgrade: 'Aggiorna',
        downgradeWorkspace: 'Declassa spazio di lavoro',
        companyID: 'ID azienda',
        userID: 'ID utente',
        disable: 'Disabilita',
        export: 'Esporta',
        initialValue: 'Valore iniziale',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Data odierna',
        value: 'Valore',
        downloadFailedTitle: 'Download non riuscito',
        downloadFailedDescription: 'Il tuo download non può essere completato. Riprova più tardi.',
        filterLogs: 'Filtra registri',
        network: 'Rete',
        reportID: 'ID report',
        longID: 'ID lungo',
        withdrawalID: 'ID prelievo',
        bankAccounts: 'Conti bancari',
        chooseFile: 'Scegli file',
        chooseFiles: 'Scegli file',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Rilascia qui',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Rilascia qui il tuo file',
        ignore: 'Ignora',
        enabled: 'Abilitato',
        disabled: 'Disabilitato',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'Importa',
        offlinePrompt: 'Non puoi eseguire questa azione in questo momento.',
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: 'In sospeso',
        chats: 'Chat',
        tasks: 'Attività',
        unread: 'Non letti',
        sent: 'Inviato',
        links: 'Link',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: 'giorno',
        days: 'giorni',
        rename: 'Rinomina',
        address: 'Indirizzo',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Salta',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Hai bisogno di qualcosa in particolare? Chatta con il tuo account manager, ${accountManagerDisplayName}.`,
        chatNow: 'Chatta ora',
        workEmail: 'Email di lavoro',
        destination: 'Destinazione',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Tariffa secondaria',
        perDiem: 'Diaria',
        validate: 'Convalida',
        downloadAsPDF: 'Scarica come PDF',
        downloadAsCSV: 'Scarica come CSV',
        help: 'Aiuto',
        expenseReport: 'Nota spese',
        expenseReports: 'Note spese',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Tariffa fuori dalla policy',
        leaveWorkspace: 'Abbandona spazio di lavoro',
        leaveWorkspaceConfirmation: 'Se lasci questo workspace, non potrai più inviarvi note spese.',
        leaveWorkspaceConfirmationAuditor: 'Se lasci questo spazio di lavoro, non potrai più visualizzarne i report e le impostazioni.',
        leaveWorkspaceConfirmationAdmin: 'Se lasci questo workspace, non potrai più gestirne le impostazioni.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Se lasci questo spazio di lavoro, verrai sostituito nel flusso di approvazione da ${workspaceOwner}, il proprietario dello spazio di lavoro.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Se lasci questo spazio di lavoro, verrai sostituito come esportatore preferito con ${workspaceOwner}, il proprietario dello spazio di lavoro.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Se lasci questo spazio di lavoro, verrai sostituito come referente tecnico con ${workspaceOwner}, il proprietario dello spazio di lavoro.`,
        leaveWorkspaceReimburser: 'Non puoi lasciare questo workspace in qualità di rimborsatore. Imposta un nuovo rimborsatore in Workspaces > Make or track payments, quindi riprova.',
        reimbursable: 'Rimborsabile',
        editYourProfile: 'Modifica il tuo profilo',
        comments: 'Commenti',
        sharedIn: 'Condiviso in',
        unreported: 'Non rendicontato',
        explore: 'Esplora',
        todo: 'Da fare',
        invoice: 'Fattura',
        expense: 'Spesa',
        chat: 'Chat',
        task: 'Attività',
        trip: 'Viaggio',
        apply: 'Applica',
        status: 'Stato',
        on: 'Attivo',
        before: 'Prima',
        after: 'Dopo',
        reschedule: 'Ripianifica',
        general: 'Generale',
        workspacesTabTitle: 'Spazi di lavoro',
        headsUp: 'Attenzione!',
        submitTo: 'Invia a',
        forwardTo: 'Inoltra a',
        merge: 'Unisci',
        none: 'Nessuno',
        unstableInternetConnection: 'Connessione Internet instabile. Controlla la rete e riprova.',
        enableGlobalReimbursements: 'Abilita rimborsi globali',
        purchaseAmount: 'Importo acquisto',
        frequency: 'Frequenza',
        link: 'Link',
        pinned: 'In evidenza',
        read: 'Leggi',
        copyToClipboard: 'Copia negli appunti',
        thisIsTakingLongerThanExpected: 'Sta richiedendo più tempo del previsto...',
        domains: 'Domini',
        actionRequired: 'Azione richiesta',
    },
    supportalNoAccess: {
        title: 'Non così in fretta',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Non sei autorizzato a eseguire questa azione quando l’assistenza ha effettuato l’accesso (comando: ${command ?? ''}). Se ritieni che Success debba poter eseguire questa azione, avvia una conversazione su Slack.`,
    },
    lockedAccount: {
        title: 'Account bloccato',
        description: 'Non ti è consentito completare questa azione perché questo account è stato bloccato. Contatta concierge@expensify.com per i prossimi passi.',
    },
    location: {
        useCurrent: 'Usa posizione attuale',
        notFound: 'Non siamo riusciti a trovare la tua posizione. Riprova oppure inserisci un indirizzo manualmente.',
        permissionDenied: 'Sembra che tu abbia negato l’accesso alla tua posizione.',
        please: 'Per favore',
        allowPermission: 'consenti l’accesso alla posizione nelle impostazioni',
        tryAgain: 'e riprova.',
    },
    contact: {
        importContacts: 'Importa contatti',
        importContactsTitle: 'Importa i tuoi contatti',
        importContactsText: 'Importa i contatti dal tuo telefono così le tue persone preferite saranno sempre a portata di tocco.',
        importContactsExplanation: 'così le tue persone preferite sono sempre a portata di tocco.',
        importContactsNativeText: 'Ancora un solo passaggio! Dacci il via libera per importare i tuoi contatti.',
    },
    anonymousReportFooter: {
        logoTagline: 'Partecipa alla discussione.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Accesso alla fotocamera',
        expensifyDoesNotHaveAccessToCamera: 'Expensify non può scattare foto senza l’accesso alla fotocamera. Tocca Impostazioni per aggiornare le autorizzazioni.',
        attachmentError: 'Errore allegato',
        errorWhileSelectingAttachment: 'Si è verificato un errore durante la selezione di un allegato. Riprova.',
        errorWhileSelectingCorruptedAttachment: 'Si è verificato un errore durante la selezione di un allegato danneggiato. Prova un altro file.',
        takePhoto: 'Scatta foto',
        chooseFromGallery: 'Scegli dalla galleria',
        chooseDocument: 'Scegli file',
        attachmentTooLarge: 'L’allegato è troppo grande',
        sizeExceeded: "La dimensione dell'allegato supera il limite di 24 MB",
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `La dimensione dell’allegato supera il limite di ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'L’allegato è troppo piccolo',
        sizeNotMet: "La dimensione dell'allegato deve essere superiore a 240 byte",
        wrongFileType: 'Tipo di file non valido',
        notAllowedExtension: 'Questo tipo di file non è consentito. Prova con un tipo di file diverso.',
        folderNotAllowedMessage: 'Non è consentito caricare una cartella. Prova con un file diverso.',
        protectedPDFNotSupported: 'I PDF protetti da password non sono supportati',
        attachmentImageResized: 'Questa immagine è stata ridimensionata per l’anteprima. Scarica per la risoluzione completa.',
        attachmentImageTooLarge: 'Questa immagine è troppo grande per essere visualizzata in anteprima prima del caricamento.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Puoi caricare solo fino a ${fileLimit} file alla volta.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `I file superano ${maxUploadSizeInMB} MB. Riprova.`,
        someFilesCantBeUploaded: 'Alcuni file non possono essere caricati',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `I file devono essere inferiori a ${maxUploadSizeInMB} MB. I file più grandi non verranno caricati.`,
        maxFileLimitExceeded: 'Puoi caricare fino a 30 ricevute alla volta. Le eventuali ricevute in più non verranno caricate.',
        unsupportedFileType: ({fileType}: FileTypeParams) => `I file ${fileType} non sono supportati. Verranno caricati solo i tipi di file supportati.`,
        learnMoreAboutSupportedFiles: 'Scopri di più sui formati supportati.',
        passwordProtected: 'I PDF protetti da password non sono supportati. Verranno caricati solo i file supportati.',
    },
    dropzone: {
        addAttachments: 'Aggiungi allegati',
        addReceipt: 'Aggiungi ricevuta',
        scanReceipts: 'Scansiona ricevute',
        replaceReceipt: 'Sostituisci ricevuta',
    },
    filePicker: {
        fileError: 'Errore file',
        errorWhileSelectingFile: 'Si è verificato un errore durante la selezione di un file. Riprova.',
    },
    connectionComplete: {
        title: 'Connessione completata',
        supportingText: 'Puoi chiudere questa finestra e tornare all’app Expensify.',
    },
    avatarCropModal: {
        title: 'Modifica foto',
        description: 'Trascina, ingrandisci e ruota l’immagine come preferisci.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nessuna estensione trovata per il tipo MIME',
        problemGettingImageYouPasted: "Si è verificato un problema durante il recupero dell'immagine che hai incollato",
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La lunghezza massima del commento è di ${formattedMaxLength} caratteri.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La lunghezza massima del titolo dell’attività è di ${formattedMaxLength} caratteri.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Aggiorna app',
        updatePrompt: "È disponibile una nuova versione di questa app.\nAggiorna ora o riavvia l'app più tardi per scaricare le modifiche più recenti.",
    },
    deeplinkWrapper: {
        launching: 'Avvio di Expensify',
        expired: 'La tua sessione è scaduta.',
        signIn: 'Accedi di nuovo.',
        redirectedToDesktopApp: "Ti abbiamo reindirizzato all'app desktop.",
        youCanAlso: 'Puoi anche',
        openLinkInBrowser: 'apri questo link nel tuo browser',
        loggedInAs: ({email}: LoggedInAsParams) => `Hai effettuato l’accesso come ${email}. Fai clic su "Apri link" nel prompt per accedere all’app desktop con questo account.`,
        doNotSeePrompt: 'Non riesci a vedere il prompt?',
        tryAgain: 'Riprova',
        or: ', oppure',
        continueInWeb: "continua all'app web",
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abracadabra,
            sei connesso!
        `),
        successfulSignInDescription: 'Torna alla tua scheda originale per continuare.',
        title: 'Ecco il tuo codice magico',
        description: dedent(`
            Inserisci il codice dal dispositivo
            su cui è stato richiesto originariamente
        `),
        doNotShare: dedent(`
            Non condividere il tuo codice con nessuno.
            Expensify non te lo chiederà mai!
        `),
        or: ', oppure',
        signInHere: 'accedi qui',
        expiredCodeTitle: 'Codice magico scaduto',
        expiredCodeDescription: 'Torna al dispositivo originale e richiedi un nuovo codice',
        successfulNewCodeRequest: 'Codice richiesto. Controlla il tuo dispositivo.',
        tfaRequiredTitle: dedent(`
            Autenticazione a due fattori  
            obbligatoria
        `),
        tfaRequiredDescription: dedent(`
            Inserisci il codice di autenticazione a due fattori
            nel luogo da cui stai tentando di accedere.
        `),
        requestOneHere: 'richiesta uno qui.',
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
    customApprovalWorkflow: {
        title: 'Flusso di approvazione personalizzato',
        description: 'La tua azienda utilizza un flusso di approvazione personalizzato in questo spazio di lavoro. Esegui questa operazione in Expensify Classic',
        goToExpensifyClassic: 'Passa a Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Invia una nota spese, invita il tuo team',
            subtitleText: 'Vuoi che anche il tuo team usi Expensify? Basta inviare loro una nota spese e noi ci occuperemo del resto.',
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
        anotherLoginPageIsOpenExplanation: 'Hai aperto la pagina di accesso in una scheda separata. Effettua l’accesso da quella scheda.',
        welcome: 'Benvenuto!',
        welcomeWithoutExclamation: 'Benvenuto',
        phrase2: 'I soldi parlano. E ora che chat e pagamenti sono in un unico posto, è anche facile.',
        phrase3: 'I tuoi pagamenti arrivano da te veloci quanto riesci a far passare il tuo messaggio.',
        enterPassword: 'Per favore inserisci la tua password',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, è sempre bello vedere una nuova faccia da queste parti!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Inserisci il codice magico inviato a ${login}. Dovrebbe arrivare entro uno o due minuti.`,
    },
    login: {
        hero: {
            header: 'Viaggi e spese, alla velocità della chat',
            body: 'Benvenuto nella nuova generazione di Expensify, dove i tuoi viaggi e le tue spese diventano più rapidi grazie a una chat contestuale in tempo reale.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Hai già effettuato l’accesso come ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Non vuoi accedere con ${provider}?`,
        continueWithMyCurrentSession: 'Continua con la mia sessione attuale',
        redirectToDesktopMessage: 'Ti reindirizzeremo all’app desktop una volta completato l’accesso.',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continua ad accedere con Single Sign-On:',
        orContinueWithMagicCode: 'Puoi anche accedere con un codice magico',
        useSingleSignOn: 'Usa l’accesso Single Sign-On',
        useMagicCode: 'Usa codice magico',
        launching: 'Avvio...',
        oneMoment: 'Un momento mentre ti reindirizziamo al portale di single sign-on della tua azienda.',
    },
    reportActionCompose: {
        dropToUpload: 'Rilascia per caricare',
        sendAttachment: 'Invia allegato',
        addAttachment: 'Aggiungi allegato',
        writeSomething: 'Scrivi qualcosa...',
        blockedFromConcierge: 'La comunicazione è vietata',
        fileUploadFailed: 'Caricamento non riuscito. File non supportato.',
        localTime: ({user, time}: LocalTimeParams) => `È ${time} per ${user}`,
        edited: '(modificato)',
        emoji: 'Emoji',
        collapse: 'Comprimi',
        expand: 'Espandi',
    },
    reportActionContextMenu: {
        copyMessage: 'Copia messaggio',
        copied: 'Copiato!',
        copyLink: 'Copia link',
        copyURLToClipboard: 'Copia URL negli appunti',
        copyEmailToClipboard: 'Copia email negli appunti',
        markAsUnread: 'Segna come non letto',
        markAsRead: 'Segna come letto',
        editAction: ({action}: EditActionParams) => `Modifica ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'spesa' : 'commento'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'commento';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Elimina ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'commento';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Sei sicuro di voler eliminare questo ${type}?`;
        },
        onlyVisible: 'Visibile solo a',
        replyInThread: 'Rispondi nel thread',
        joinThread: 'Unisciti alla discussione',
        leaveThread: 'Abbandona conversazione',
        copyOnyxData: 'Copia dati Onyx',
        flagAsOffensive: 'Segnala come offensivo',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Aggiungi reazione',
        reactedWith: 'ha reagito con',
    },
    reportActionsView: {
        beginningOfArchivedRoom: ({reportName, reportDetailsLink}: BeginningOfArchivedRoomParams) =>
            `Ti sei perso la festa in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, qui non c'è niente da vedere.`,
        beginningOfChatHistoryDomainRoom: ({domainRoom}: BeginningOfChatHistoryDomainRoomParams) =>
            `Questa chat è con tutti i membri di Expensify sul dominio <strong>${domainRoom}</strong>. Usala per chattare con i colleghi, condividere suggerimenti e fare domande.`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `Questa chat è con l’amministratore di <strong>${workspaceName}</strong>. Usala per parlare della configurazione dello spazio di lavoro e altro ancora.`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `Questa chat è con tutti in <strong>${workspaceName}</strong>. Usala per gli annunci più importanti.`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `Questa chat è dedicata a tutto ciò che riguarda <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `Questa chat è per le fatture tra <strong>${invoicePayer}</strong> e <strong>${invoiceReceiver}</strong>. Usa il pulsante + per inviare una fattura.`,
        beginningOfChatHistory: 'Questa chat è con',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `Qui è dove <strong>${submitterDisplayName}</strong> invierà le spese a <strong>${workspaceName}</strong>. Usa semplicemente il pulsante +.`,
        beginningOfChatHistorySelfDM: 'Questo è il tuo spazio personale. Usalo per appunti, attività, bozze e promemoria.',
        beginningOfChatHistorySystemDM: 'Benvenuto! Configuriamo il tuo account.',
        chatWithAccountManager: 'Chatta con il tuo account manager qui',
        sayHello: 'Dì ciao!',
        yourSpace: 'Il tuo spazio',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Benvenuto in ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Usa il pulsante + per ${additionalText} una spesa.`,
        askConcierge: 'Fai domande e ricevi assistenza in tempo reale 24/7.',
        conciergeSupport: 'Assistenza 24/7',
        create: 'Crea',
        iouTypes: {
            pay: 'Paga',
            split: 'Dividi',
            submit: 'Invia',
            track: 'Traccia',
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
    latestMessages: 'Ultimi messaggi',
    youHaveBeenBanned: 'Nota: Sei stato bannato dalla chat in questo canale.',
    reportTypingIndicator: {
        isTyping: 'sta scrivendo...',
        areTyping: 'stanno scrivendo...',
        multipleMembers: 'Più membri',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Questa chat è stata archiviata.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Questa chat non è più attiva perché ${displayName} ha chiuso il proprio account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Questa chat non è più attiva perché ${oldDisplayName} ha unito il proprio account con ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Questa chat non è più attiva perché <strong>tu</strong> non fai più parte dello spazio di lavoro ${policyName}.`
                : `Questa chat non è più attiva perché ${displayName} non è più membro dell’area di lavoro ${policyName}.`,
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
        fabNewChat: 'Avvia chat',
        fabNewChatExplained: 'Avvia chat (Azione flottante)',
        fabScanReceiptExplained: 'Scansiona ricevuta (Azione rapida)',
        chatPinned: 'Chat fissata',
        draftedMessage: 'Messaggio in bozza',
        listOfChatMessages: 'Elenco dei messaggi della chat',
        listOfChats: 'Elenco chat',
        saveTheWorld: 'Salva il mondo',
        tooltip: 'Inizia qui!',
        redirectToExpensifyClassicModal: {
            title: 'Prossimamente',
            description: 'Stiamo perfezionando ancora alcuni dettagli di New Expensify per adattarla alla tua configurazione specifica. Nel frattempo, vai su Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abbonamento',
        domains: 'Domini',
    },
    tabSelector: {
        chat: 'Chat',
        room: 'Stanza',
        distance: 'Distanza',
        manual: 'Manuale',
        scan: 'Scansiona',
        map: 'Mappa',
    },
    spreadsheet: {
        upload: 'Carica un foglio di calcolo',
        import: 'Importa foglio di calcolo',
        dragAndDrop: '<muted-link>Trascina e rilascia qui il tuo foglio di calcolo o scegli un file qui sotto. Formati supportati: .csv, .txt, .xls e .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Trascina e rilascia il tuo foglio di calcolo qui oppure scegli un file qui sotto. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Scopri di più</a> sui formati di file supportati.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Seleziona un file di foglio di calcolo da importare. Formati supportati: .csv, .txt, .xls e .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Seleziona un file di foglio di calcolo da importare. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Scopri di più</a> sui formati di file supportati.</muted-link>`,
        fileContainsHeader: 'Il file contiene intestazioni di colonna',
        column: ({name}: SpreadSheetColumnParams) => `Colonna ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Ops! Un campo obbligatorio ("${fieldName}") non è stato mappato. Controlla e riprova.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `Ops! Hai associato un singolo campo ("${fieldName}") a più colonne. Controlla e riprova.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Ops! Il campo ("${fieldName}") contiene uno o più valori vuoti. Controlla e riprova.`,
        importSuccessfulTitle: 'Importazione riuscita',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `Sono state aggiunte ${categories} categorie.` : '1 categoria è stata aggiunta.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Non è stato aggiunto o aggiornato alcun membro.';
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
            rates > 1 ? `Sono state aggiunte tariffe di diaria ${rates}.` : 'È stata aggiunta 1 indennità giornaliera.',
        importFailedTitle: 'Importazione non riuscita',
        importFailedDescription: 'Assicurati che tutti i campi siano compilati correttamente e riprova. Se il problema persiste, contatta Concierge.',
        importDescription: 'Scegli quali campi mappare dal tuo foglio di calcolo facendo clic sul menu a discesa accanto a ogni colonna importata qui sotto.',
        sizeNotMet: 'La dimensione del file deve essere maggiore di 0 byte',
        invalidFileMessage:
            'Il file che hai caricato è vuoto o contiene dati non validi. Assicurati che il file sia formattato correttamente e contenga le informazioni necessarie prima di caricarlo di nuovo.',
        importSpreadsheetLibraryError: 'Impossibile caricare il modulo del foglio di calcolo. Controlla la connessione a Internet e riprova.',
        importSpreadsheet: 'Importa foglio di calcolo',
        downloadCSV: 'Scarica CSV',
        importMemberConfirmation: () => ({
            one: `Conferma i dettagli seguenti per il nuovo membro dello spazio di lavoro che verrà aggiunto come parte di questo caricamento. I membri esistenti non riceveranno aggiornamenti del ruolo o messaggi di invito.`,
            other: (count: number) =>
                `Conferma i dettagli riportati di seguito per i ${count} nuovi membri dello spazio di lavoro che verranno aggiunti come parte di questo caricamento. I membri esistenti non riceveranno alcun aggiornamento del ruolo o messaggi di invito.`,
        }),
    },
    receipt: {
        upload: 'Carica ricevuta',
        uploadMultiple: 'Carica le ricevute',
        desktopSubtitleSingle: `oppure trascinalo qui`,
        desktopSubtitleMultiple: `oppure trascinali qui`,
        alternativeMethodsTitle: 'Altri modi per aggiungere ricevute:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Scarica l'app</a> per scannerizzare dal tuo telefono</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Inoltra le ricevute a <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Aggiungi il tuo numero</a> per inviare le ricevute via SMS a ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Invia le ricevute via SMS al ${phoneNumber} (solo numeri USA)</label-text>`,
        takePhoto: 'Scatta una foto',
        cameraAccess: 'L’accesso alla fotocamera è necessario per scattare foto delle ricevute.',
        deniedCameraAccess: `L’accesso alla fotocamera non è ancora stato concesso, segui <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">queste istruzioni</a>.`,
        cameraErrorTitle: 'Errore fotocamera',
        cameraErrorMessage: 'Si è verificato un errore durante l’acquisizione della foto. Riprova.',
        locationAccessTitle: 'Consenti l’accesso alla posizione',
        locationAccessMessage: 'L’accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta accurati ovunque tu vada.',
        locationErrorTitle: 'Consenti l’accesso alla posizione',
        locationErrorMessage: 'L’accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta accurati ovunque tu vada.',
        allowLocationFromSetting: `L’accesso alla posizione ci aiuta a mantenere fuso orario e valuta accurati ovunque tu vada. Consenti l’accesso alla posizione dalle impostazioni dei permessi del tuo dispositivo.`,
        dropTitle: 'Lascia perdere',
        dropMessage: 'Rilascia il tuo file qui',
        flash: 'flash',
        multiScan: 'scans multipli',
        shutter: 'otturatore',
        gallery: 'galleria',
        deleteReceipt: 'Elimina ricevuta',
        deleteConfirmation: 'Sei sicuro di voler eliminare questa ricevuta?',
        addReceipt: 'Aggiungi ricevuta',
        scanFailed: "Non è stato possibile scansionare la ricevuta perché manca il commerciante, la data o l'importo.",
    },
    quickAction: {
        scanReceipt: 'Scansiona ricevuta',
        recordDistance: 'Traccia distanza',
        requestMoney: 'Crea spesa',
        perDiem: 'Crea diaria',
        splitBill: 'Dividi spesa',
        splitScan: 'Dividi ricevuta',
        splitDistance: 'Suddividi distanza',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Paga ${name ?? 'qualcuno'}`,
        assignTask: 'Assegna attività',
        header: 'Azione rapida',
        noLongerHaveReportAccess: 'Non hai più accesso alla tua precedente destinazione di azione rapida. Scegline una nuova qui sotto.',
        updateDestination: 'Aggiorna destinazione',
        createReport: 'Crea report',
    },
    iou: {
        amount: 'Importo',
        taxAmount: 'Importo imposta',
        taxRate: 'Aliquota fiscale',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Approva ${formattedAmount}` : 'Approva'),
        approved: 'Approvato',
        cash: 'Contanti',
        card: 'Carta',
        original: 'Originale',
        split: 'Dividi',
        splitExpense: 'Dividi spesa',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} da ${merchant}`,
        addSplit: 'Aggiungi suddivisione',
        makeSplitsEven: 'Ripartisci in parti uguali',
        editSplits: 'Modifica ripartizioni',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `L’importo totale è ${amount} superiore rispetto alla spesa originale.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `L'importo totale è inferiore di ${amount} rispetto alla spesa originale.`,
        splitExpenseZeroAmount: 'Inserisci un importo valido prima di continuare.',
        splitExpenseOneMoreSplit: 'Nessuna suddivisione aggiunta. Aggiungine almeno una per salvare.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Modifica ${amount} per ${merchant}`,
        removeSplit: 'Rimuovi suddivisione',
        splitExpenseCannotBeEditedModalTitle: 'Questa spesa non può essere modificata',
        splitExpenseCannotBeEditedModalDescription: 'Le spese approvate o pagate non possono essere modificate',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Paga ${name ?? 'qualcuno'}`,
        expense: 'Spesa',
        categorize: 'Classifica',
        share: 'Condividi',
        participants: 'Partecipanti',
        createExpense: 'Crea spesa',
        trackDistance: 'Traccia distanza',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Crea ${expensesNumber} spese`,
        removeExpense: 'Rimuovi spesa',
        removeThisExpense: 'Rimuovi questa spesa',
        removeExpenseConfirmation: 'Sei sicuro di voler rimuovere questa ricevuta? Questa azione non può essere annullata.',
        addExpense: 'Aggiungi spesa',
        chooseRecipient: 'Scegli destinatario',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Crea spesa da ${amount}`,
        confirmDetails: 'Conferma i dettagli',
        pay: 'Paga',
        cancelPayment: 'Annulla pagamento',
        cancelPaymentConfirmation: 'Sei sicuro di voler annullare questo pagamento?',
        viewDetails: 'Visualizza dettagli',
        pending: 'In sospeso',
        canceled: 'Annullata',
        posted: 'Pubblicato',
        deleteReceipt: 'Elimina ricevuta',
        findExpense: 'Trova spesa',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `ha eliminato una spesa (${amount} per ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `ha spostato una spesa${reportName ? `da ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `ha spostato questa spesa${reportName ? `a <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `spostato questa spesa${reportName ? `da <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedUnreportedTransaction: ({reportUrl}: MovedTransactionParams) => `ha spostato questa spesa dal tuo <a href="${reportUrl}">spazio personale</a>`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `ha spostato questa spesa nel tuo <a href="${reportUrl}">spazio personale</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `ha spostato questo report nello spazio di lavoro <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `ha spostato questo <a href="${movedReportUrl}">report</a> nello spazio di lavoro <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Ricevuta in attesa di abbinamento con la transazione della carta',
        pendingMatch: 'Abbinamento in sospeso',
        pendingMatchWithCreditCardDescription: 'Ricevuta in attesa di abbinamento con la transazione della carta. Segna come contanti per annullare.',
        markAsCash: 'Contrassegna come contanti',
        routePending: 'Instradamento in sospeso...',
        receiptScanning: () => ({
            one: 'Scan della ricevuta in corso...',
            other: 'Scansione delle ricevute in corso...',
        }),
        scanMultipleReceipts: 'Scansiona più ricevute',
        scanMultipleReceiptsDescription: 'Scatta foto di tutte le tue ricevute in una volta sola, poi conferma tu stesso i dettagli oppure lascialo fare a noi.',
        receiptScanInProgress: 'Scansione ricevuta in corso',
        receiptScanInProgressDescription: 'Scansione della ricevuta in corso. Torna più tardi o inserisci i dettagli ora.',
        removeFromReport: 'Rimuovi dal rapporto',
        moveToPersonalSpace: 'Sposta le spese nel tuo spazio personale',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Sono state individuate potenziali spese duplicate. Controlla i duplicati per poter inviare.'
                : 'Spese potenzialmente duplicate individuate. Controlla i duplicati per consentire l’approvazione.',
        receiptIssuesFound: () => ({
            one: 'Problema rilevato',
            other: 'Problemi rilevati',
        }),
        fieldPending: 'In sospeso...',
        defaultRate: 'Tariffa predefinita',
        receiptMissingDetails: 'Ricevuta con dettagli mancanti',
        missingAmount: 'Importo mancante',
        missingMerchant: 'Commerciante mancante',
        receiptStatusTitle: 'Scansione in corso…',
        receiptStatusText: 'Solo tu puoi vedere questa ricevuta mentre viene scansionata. Torna più tardi o inserisci subito i dettagli.',
        receiptScanningFailed: 'Acquisizione della ricevuta non riuscita. Inserisci i dettagli manualmente.',
        transactionPendingDescription: 'Transazione in sospeso. Potrebbero essere necessari alcuni giorni per la registrazione.',
        companyInfo: 'Informazioni aziendali',
        companyInfoDescription: 'Ci servono ancora alcuni dettagli prima che tu possa inviare la tua prima fattura.',
        yourCompanyName: 'Nome della tua azienda',
        yourCompanyWebsite: 'Il sito web della tua azienda',
        yourCompanyWebsiteNote: 'Se non hai un sito web, puoi fornire il profilo LinkedIn o il profilo sui social media della tua azienda.',
        invalidDomainError: 'Hai inserito un dominio non valido. Per continuare, inserisci un dominio valido.',
        publicDomainError: 'Hai inserito un dominio pubblico. Per continuare, inserisci un dominio privato.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} ricevute in scansione`);
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
        deleteReport: 'Elimina report',
        deleteReportConfirmation: 'Sei sicuro di voler eliminare questo report?',
        settledExpensify: 'Pagato',
        done: 'Fatto',
        settledElsewhere: 'Pagato altrove',
        individual: 'Individuale',
        business: 'Business',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} con Expensify` : `Paga con Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} come individuo` : `Paga con conto personale`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} con il wallet` : `Paga con portafoglio`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Paga ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} come azienda` : `Paga con conto aziendale`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Segna ${formattedAmount} come pagato` : `Segna come pagato`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `pagato ${amount} con conto personale ${last4Digits}` : `Pagato con conto personale`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `pagato ${amount} con conto aziendale ${last4Digits}` : `Pagato con conto aziendale`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Paga ${formattedAmount} tramite ${policyName}` : `Paga tramite ${policyName}`),
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `pagato ${amount} con conto bancario ${last4Digits}` : `pagato con conto bancario ${last4Digits}`,
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `pagato ${amount ? `${amount} ` : ''} con conto bancario ${last4Digits} tramite <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole della workspace</a>`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `Account personale • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `Conto Business • ${lastFour}`,
        nextStep: 'Prossimi passi',
        finished: 'Completato',
        flip: 'Capovolgi',
        sendInvoice: ({amount}: RequestAmountParams) => `Invia fattura di ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `per ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `inviato${memo ? `, dicendo ${memo}` : ''}`,
        automaticallySubmitted: `inviato tramite <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">invio ritardato</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `monitoraggio ${formattedAmount}${comment ? `per ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `dividi ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `suddividi ${formattedAmount}${comment ? `per ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `La tua parte ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} deve ${amount}${comment ? `per ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} deve:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}ha pagato ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} ha pagato:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} ha speso ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} ha speso:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} ha approvato:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} ha approvato ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `pagato ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `pagato ${amount}. Aggiungi un conto bancario per ricevere il tuo pagamento.`,
        automaticallyApproved: `approvato tramite le <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole dello spazio di lavoro</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `approvato ${amount}`,
        approvedMessage: `Approvato`,
        unapproved: `non approvato`,
        automaticallyForwarded: `approvato tramite le <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole dello spazio di lavoro</a>`,
        forwarded: `Approvato`,
        rejectedThisReport: 'ha rifiutato questo resoconto',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `ha avviato il pagamento, ma è in attesa che ${submitterDisplayName} aggiunga un conto bancario.`,
        adminCanceledRequest: 'ha annullato il pagamento',
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `ha annullato il pagamento di ${amount}, perché ${submitterDisplayName} non ha attivato il proprio Expensify Wallet entro 30 giorni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} ha aggiunto un conto bancario. Il pagamento di ${amount} è stato effettuato.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}segnato come pagato`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}pagato con portafoglio`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}pagato con Expensify tramite le <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole della workspace</a>`,
        noReimbursableExpenses: 'Questo report contiene un importo non valido',
        pendingConversionMessage: 'Il totale verrà aggiornato quando torni online',
        changedTheExpense: 'ha modificato la spesa',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `il ${valueName} in ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `imposta ${translatedChangedField} su ${newMerchant}, che ha impostato l'importo su ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `il ${valueName} (precedentemente ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `il ${valueName} a ${newValueToDisplay} (precedentemente ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `ha modificato ${translatedChangedField} in ${newMerchant} (precedentemente ${oldMerchant}), aggiornando l'importo a ${newAmountToDisplay} (precedentemente ${oldAmountToDisplay})`,
        basedOnAI: "in base all'attività precedente",
        basedOnMCC: ({rulesLink}: {rulesLink: string}) =>
            rulesLink ? `in base alle <a href="${rulesLink}">regole dello spazio di lavoro</a>` : 'in base alla regola dello spazio di lavoro',
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `per ${comment}` : 'spesa'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Report fattura n. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} inviato${comment ? `per ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `ha spostato la spesa dallo spazio personale a ${workspaceName ?? `chatta con ${reportName}`}`,
        movedToPersonalSpace: 'ha spostato la spesa nello spazio personale',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => {
            const article = policyTagListName && StringUtils.startsWithVowel(policyTagListName) ? 'un' : 'a';
            const tag = policyTagListName ?? 'etichetta';
            return `Seleziona ${article} ${tag} per organizzare meglio le tue spese.`;
        },
        categorySelection: 'Seleziona una categoria per organizzare meglio le tue spese.',
        error: {
            invalidCategoryLength: 'Il nome della categoria supera i 255 caratteri. Per favore abbrevialo o scegli un’altra categoria.',
            invalidTagLength: 'Il nome del tag supera i 255 caratteri. Riducilo oppure scegli un tag diverso.',
            invalidAmount: 'Inserisci un importo valido prima di continuare',
            invalidDistance: 'Inserisci una distanza valida prima di continuare',
            invalidIntegerAmount: 'Inserisci un importo in dollari intero prima di continuare',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `L'importo massimo dell'imposta è ${amount}`,
            invalidSplit: 'La somma delle suddivisioni deve essere uguale all’importo totale',
            invalidSplitParticipants: 'Inserisci un importo maggiore di zero per almeno due partecipanti',
            invalidSplitYourself: 'Inserisci un importo diverso da zero per la tua suddivisione',
            noParticipantSelected: 'Seleziona un partecipante',
            other: 'Errore imprevisto. Riprova più tardi.',
            genericCreateFailureMessage: "Errore imprevisto durante l'invio di questa spesa. Riprova più tardi.",
            genericCreateInvoiceFailureMessage: "Errore imprevisto durante l'invio di questa fattura. Riprova più tardi.",
            genericHoldExpenseFailureMessage: 'Errore imprevisto durante il blocco di questa nota spese. Riprova più tardi.',
            genericUnholdExpenseFailureMessage: 'Errore imprevisto durante la rimozione della sospensione di questa spesa. Riprova più tardi.',
            receiptDeleteFailureError: "Errore imprevisto durante l'eliminazione di questa ricevuta. Riprova più tardi.",
            receiptFailureMessage:
                '<rbr>Si è verificato un errore durante il caricamento della ricevuta. Per favore, <a href="download">salva la ricevuta</a> e <a href="retry">riprova</a> più tardi.</rbr>',
            receiptFailureMessageShort: 'Si è verificato un errore durante il caricamento della tua ricevuta.',
            genericDeleteFailureMessage: 'Errore imprevisto durante l’eliminazione di questa spesa. Riprova più tardi.',
            genericEditFailureMessage: 'Errore imprevisto durante la modifica di questa spesa. Riprova più tardi.',
            genericSmartscanFailureMessage: 'Alla transazione mancano dei campi',
            duplicateWaypointsErrorMessage: 'Rimuovi i waypoint duplicati',
            atLeastTwoDifferentWaypoints: 'Inserisci almeno due indirizzi diversi',
            splitExpenseMultipleParticipantsErrorMessage: 'Una spesa non può essere suddivisa tra uno spazio di lavoro e altri membri. Aggiorna la tua selezione.',
            invalidMerchant: 'Inserisci un esercente valido',
            atLeastOneAttendee: 'È necessario selezionare almeno un partecipante',
            invalidQuantity: 'Per favore inserisci una quantità valida',
            quantityGreaterThanZero: 'La quantità deve essere maggiore di zero',
            invalidSubrateLength: 'Deve esserci almeno una sottotariffa',
            invalidRate: 'Tariffa non valida per questo workspace. Seleziona una tariffa disponibile dal workspace.',
        },
        dismissReceiptError: 'Ignora errore',
        dismissReceiptErrorConfirmation: 'Attenzione! Chiudendo questo errore rimuoverai completamente la ricevuta caricata. Sei sicuro?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `ha iniziato a saldare il conto. Il pagamento è in sospeso finché ${submitterDisplayName} non abilita il proprio portafoglio.`,
        enableWallet: 'Abilita portafoglio',
        hold: 'In attesa',
        unhold: 'Rimuovi blocco',
        holdExpense: () => ({
            one: 'Trattieni spesa',
            other: 'Trattenere spese',
        }),
        unholdExpense: 'Sblocca spesa',
        heldExpense: 'ha trattenuto questa spesa',
        unheldExpense: 'ha sbloccato questa spesa',
        moveUnreportedExpense: 'Sposta spesa non rendicontata',
        addUnreportedExpense: 'Aggiungi spesa non rendicontata',
        selectUnreportedExpense: 'Seleziona almeno una spesa da aggiungere al report.',
        emptyStateUnreportedExpenseTitle: 'Nessuna spesa non riportata',
        emptyStateUnreportedExpenseSubtitle: 'Sembra che tu non abbia nessuna spesa non rendicontata. Prova a crearne una qui sotto.',
        addUnreportedExpenseConfirm: 'Aggiungi al report',
        newReport: 'Nuovo report',
        explainHold: () => ({
            one: 'Spiega perché stai trattenendo questa spesa.',
            other: 'Spiega perché stai trattenendo queste spese.',
        }),
        retracted: 'Ritirato',
        retract: 'Revoca',
        reopened: 'Riaperto',
        reopenReport: 'Riapri rendiconto',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Questo report è già stato esportato su ${connectionName}. Modificarlo potrebbe causare discrepanze nei dati. Sei sicuro di voler riaprire questo report?`,
        reason: 'Motivo',
        holdReasonRequired: 'È necessario fornire un motivo per mettere in sospeso.',
        expenseWasPutOnHold: 'La spesa è stata messa in sospeso',
        expenseOnHold: 'Questa spesa è stata messa in sospeso. Consulta i commenti per i prossimi passi.',
        expensesOnHold: 'Tutte le spese sono state sospese. Controlla i commenti per i prossimi passaggi.',
        expenseDuplicate: "Questa spesa presenta dettagli simili a un'altra. Controlla i duplicati per continuare.",
        someDuplicatesArePaid: 'Alcuni di questi duplicati sono già stati approvati o pagati.',
        reviewDuplicates: 'Esamina duplicati',
        keepAll: 'Mantieni tutto',
        confirmApprove: 'Conferma l’importo di approvazione',
        confirmApprovalAmount: 'Approva solo le spese conformi oppure approva l’intero report.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Questa spesa è in sospeso. Vuoi approvarla comunque?',
            other: 'Queste spese sono in sospeso. Vuoi approvarle comunque?',
        }),
        confirmPay: "Conferma l'importo del pagamento",
        confirmPayAmount: 'Paga ciò che non è in sospeso oppure paga l’intero rapporto.',
        confirmPayAllHoldAmount: () => ({
            one: 'Questa spesa è in sospeso. Vuoi pagarla comunque?',
            other: 'Queste spese sono in sospeso. Vuoi pagarle comunque?',
        }),
        payOnly: 'Paga solo',
        approveOnly: 'Solo approva',
        holdEducationalTitle: 'Devi trattenere questa spesa?',
        whatIsHoldExplain: 'Mettere in sospeso è come premere “pausa” su una spesa finché non sei pronto a inviarla.',
        holdIsLeftBehind: 'Le spese in sospeso vengono lasciate indietro anche se invii un intero report.',
        unholdWhenReady: 'Sblocca le spese quando sei pronto per inviarle.',
        changePolicyEducational: {
            title: 'Hai spostato questo report!',
            description: 'Ricontrolla questi elementi, che tendono a cambiare quando si spostano i report in un nuovo spazio di lavoro.',
            reCategorize: '<strong>Ricategorizza tutte le spese</strong> per rispettare le regole dello spazio di lavoro.',
            workflows: 'Questo resoconto potrebbe ora essere soggetto a un diverso <strong>flusso di approvazione.</strong>',
        },
        changeWorkspace: 'Cambia spazio di lavoro',
        set: 'imposta',
        changed: 'modificato',
        removed: 'Rimosso',
        transactionPending: 'Transazione in sospeso.',
        chooseARate: 'Seleziona una tariffa di rimborso workspace per miglio o chilometro',
        unapprove: 'Revoca approvazione',
        unapproveReport: 'Revoca approvazione del report',
        headsUp: 'Attenzione!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Questo rendiconto è già stato esportato in ${accountingIntegration}. Modificarlo potrebbe causare discrepanze nei dati. Sei sicuro di voler revocare l’approvazione di questo rendiconto?`,
        reimbursable: 'rimborsabile',
        nonReimbursable: 'non rimborsabile',
        bookingPending: 'Questa prenotazione è in sospeso',
        bookingPendingDescription: 'Questa prenotazione è in sospeso perché non è ancora stata pagata.',
        bookingArchived: 'Questa prenotazione è archiviata',
        bookingArchivedDescription: 'Questa prenotazione è archiviata perché la data del viaggio è passata. Aggiungi una spesa per l’importo finale, se necessario.',
        attendees: 'Partecipanti',
        whoIsYourAccountant: 'Chi è il tuo commercialista?',
        paymentComplete: 'Pagamento completato',
        time: 'Ora',
        startDate: 'Data di inizio',
        endDate: 'Data di fine',
        startTime: 'Ora di inizio',
        endTime: 'Ora di fine',
        deleteSubrate: 'Elimina sottotariffa',
        deleteSubrateConfirmation: 'Sei sicuro di voler eliminare questa sottotariffa?',
        quantity: 'Quantità',
        subrateSelection: 'Seleziona una sottotariffa e inserisci una quantità.',
        qty: 'Qtà',
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
        dates: 'Date',
        rates: 'Tariffe',
        submitsTo: ({name}: SubmitsToParams) => `Invia a ${name}`,
        reject: {
            educationalTitle: 'Dovresti trattenere o rifiutare?',
            educationalText: 'Se non sei pronto ad approvare o pagare una spesa, puoi metterla in attesa o rifiutarla.',
            holdExpenseTitle: 'Blocca una spesa per chiedere maggiori dettagli prima dell’approvazione o del pagamento.',
            approveExpenseTitle: 'Approva le altre spese mentre le spese in sospeso restano assegnate a te.',
            heldExpenseLeftBehindTitle: 'Le spese in sospeso vengono lasciate indietro quando approvi un intero report.',
            rejectExpenseTitle: 'Rifiuta una spesa che non intendi approvare o pagare.',
            reasonPageTitle: 'Rifiuta spesa',
            reasonPageDescription: 'Spiega perché stai rifiutando questa spesa.',
            rejectReason: 'Motivo del rifiuto',
            markAsResolved: 'Contrassegna come risolto',
            rejectedStatus: 'Questa spesa è stata rifiutata. In attesa che tu risolva i problemi e la contrassegni come risolta per permettere l’invio.',
            reportActions: {
                rejectedExpense: 'ha rifiutato questa spesa',
                markedAsResolved: 'ha contrassegnato il motivo del rifiuto come risolto',
            },
        },
        moveExpenses: () => ({one: 'Sposta spesa', other: 'Sposta spese'}),
        changeApprover: {
            title: 'Cambia approvatore',
            subtitle: "Scegli un'opzione per cambiare l'approvatore di questo rapporto.",
            description: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Puoi anche modificare in modo permanente l'approvatore per tutti i report nelle tue <a href="${workflowSettingLink}">impostazioni del flusso di lavoro</a>.`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `ha cambiato l'approvatore in <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Aggiungi approvatore',
                addApproverSubtitle: 'Aggiungi un approvatore aggiuntivo al flusso di approvazione esistente.',
                bypassApprovers: 'Ignora approvatori',
                bypassApproversSubtitle: 'Impostati come approvatore finale e salta tutti gli approvatori rimanenti.',
            },
            addApprover: {
                subtitle: 'Scegli un approvatore aggiuntivo per questo resoconto prima che venga instradato attraverso il resto del flusso di approvazione.',
            },
        },
        chooseWorkspace: 'Scegli un workspace',
    },
    transactionMerge: {
        listPage: {
            header: 'Unisci spese',
            noEligibleExpenseFound: 'Nessuna spesa idonea trovata',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Non hai spese che possano essere unite a questa. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Ulteriori informazioni</a> sulle spese idonee.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Seleziona una <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">spesa idonea</a> da unire con <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Seleziona ricevuta',
            pageTitle: 'Seleziona la ricevuta che vuoi conservare:',
        },
        detailsPage: {
            header: 'Seleziona dettagli',
            pageTitle: 'Seleziona i dettagli che vuoi mantenere:',
            noDifferences: 'Nessuna differenza trovata tra le transazioni',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'un' : 'a';
                return `Seleziona ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Seleziona i partecipanti',
            selectAllDetailsError: 'Seleziona tutti i dettagli prima di continuare.',
        },
        confirmationPage: {
            header: 'Conferma i dettagli',
            pageTitle: 'Conferma i dati che desideri conservare. I dati che non conserverai verranno eliminati.',
            confirmButton: 'Unisci spese',
        },
    },
    share: {
        shareToExpensify: 'Condividi su Expensify',
        messageInputLabel: 'Messaggio',
    },
    notificationPreferencesPage: {
        header: 'Preferenze di notifica',
        label: 'Avvisami dei nuovi messaggi',
        notificationPreferences: {
            always: 'Immediatamente',
            daily: 'Giornaliero',
            mute: 'Silenzia',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Nascosto',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Il numero non è stato convalidato. Clicca il pulsante per inviare nuovamente il link di convalida tramite SMS.',
        emailHasNotBeenValidated: "L'email non è stata convalidata. Fai clic sul pulsante per inviare nuovamente il link di convalida tramite SMS.",
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Carica foto',
        removePhoto: 'Rimuovi foto',
        editImage: 'Modifica foto',
        viewPhoto: 'Visualizza foto',
        imageUploadFailed: 'Caricamento dell’immagine non riuscito',
        deleteWorkspaceError: 'Spiacenti, si è verificato un problema imprevisto nell’eliminazione dell’avatar del tuo workspace',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `L'immagine selezionata supera la dimensione massima di caricamento di ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Carica un'immagine più grande di ${minHeightInPx}x${minWidthInPx} pixel e più piccola di ${maxHeightInPx}x${maxWidthInPx} pixel.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `L’immagine del profilo deve essere di uno dei seguenti tipi: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Modifica immagine profilo',
        upload: 'Carica',
        uploadPhoto: 'Carica foto',
        selectAvatar: 'Seleziona avatar',
        choosePresetAvatar: 'Oppure scegli un avatar personalizzato',
    },
    modal: {
        backdropLabel: 'Sfondo modale',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> aggiunga delle spese.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che <strong>${actor}</strong> aggiunga le spese.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore aggiunga le spese.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Nessuna ulteriore azione richiesta!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> aggiunga un conto bancario.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che <strong>${actor}</strong> aggiunga un conto bancario.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore aggiunga un conto bancario.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `il ${eta}` : ` ${eta}`;
                }
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>le tue</strong> spese vengano inviate automaticamente${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che le spese di <strong>${actor}</strong> vengano inviate automaticamente${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che le spese di un amministratore vengano inviate automaticamente${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> risolva il/i problema/i.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che <strong>${actor}</strong> risolva i problemi.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore risolva il/i problema/i.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> approvi le spese.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che <strong>${actor}</strong> approvi le spese.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore approvi le spese.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> esporti questo resoconto.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che <strong>${actor}</strong> esporti questo resoconto.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore esporti questo rendiconto.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> paghi le spese.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che <strong>${actor}</strong> rimborsi le spese.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore paghi le spese.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> finisca di configurare un conto bancario aziendale.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che <strong>${actor}</strong> completi la configurazione di un conto bancario aziendale.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore completi la configurazione di un conto bancario aziendale.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `entro le ${eta}` : ` ${eta}`;
                }
                return `In attesa che il pagamento venga completato${formattedETA}.`;
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'a breve',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'più tardi oggi',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'domenica',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'il 1° e il 16 di ogni mese',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'nell’ultimo giorno lavorativo del mese',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: "nell'ultimo giorno del mese",
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'alla fine del tuo viaggio',
        },
    },
    profilePage: {
        profile: 'Profilo',
        preferredPronouns: 'Pronomi preferiti',
        selectYourPronouns: 'Seleziona i tuoi pronomi',
        selfSelectYourPronoun: 'Seleziona autonomamente il tuo pronome',
        emailAddress: 'Indirizzo email',
        setMyTimezoneAutomatically: 'Imposta automaticamente il mio fuso orario',
        timezone: 'Fuso orario',
        invalidFileMessage: 'File non valido. Prova con un’immagine diversa.',
        avatarUploadFailureMessage: "Si è verificato un errore durante il caricamento dell'avatar. Riprova.",
        online: 'Online',
        offline: 'Offline',
        syncing: 'Sincronizzazione in corso',
        profileAvatar: 'Avatar profilo',
        publicSection: {
            title: 'Pubblico',
            subtitle: 'Questi dettagli sono visualizzati sul tuo profilo pubblico. Chiunque può vederli.',
        },
        privateSection: {
            title: 'Privato',
            subtitle: 'Questi dati vengono utilizzati per i viaggi e i pagamenti. Non vengono mai mostrati sul tuo profilo pubblico.',
        },
    },
    securityPage: {
        title: 'Opzioni di sicurezza',
        subtitle: 'Abilita l’autenticazione a due fattori per mantenere al sicuro il tuo account.',
        goToSecurity: 'Torna alla pagina di sicurezza',
    },
    shareCodePage: {
        title: 'Il tuo codice',
        subtitle: 'Invita membri su Expensify condividendo il tuo codice QR personale o link di referenza.',
    },
    pronounsPage: {
        pronouns: 'Pronomi',
        isShownOnProfile: 'I tuoi pronomi vengono mostrati sul tuo profilo.',
        placeholderText: 'Cerca per visualizzare le opzioni',
    },
    contacts: {
        contactMethods: 'Metodi di contatto',
        featureRequiresValidate: 'Questa funzione richiede la convalida del tuo account.',
        validateAccount: 'Convalida il tuo account',
        helpText: ({email}: {email: string}) =>
            `Aggiungi altri modi per accedere e inviare ricevute a Expensify.<br/><br/>Aggiungi un indirizzo email a cui inoltrare le ricevute a <a href="mailto:${email}">${email}</a> oppure aggiungi un numero di telefono per inviare le ricevute via SMS al 47777 (solo numeri degli Stati Uniti).`,
        pleaseVerify: 'Verifica questo metodo di contatto.',
        getInTouch: 'Useremo questo metodo per contattarti.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Inserisci il codice magico inviato a ${contactMethod}. Dovrebbe arrivare entro uno o due minuti.`,
        setAsDefault: 'Imposta come predefinito',
        yourDefaultContactMethod:
            'Questo è il tuo metodo di contatto predefinito. Prima di poterlo eliminare, devi scegliere un altro metodo di contatto e fare clic su “Imposta come predefinito”.',
        removeContactMethod: 'Rimuovi metodo di contatto',
        removeAreYouSure: 'Sei sicuro di voler rimuovere questo metodo di contatto? Questa azione non può essere annullata.',
        failedNewContact: 'Impossibile aggiungere questo metodo di contatto.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Invio di un nuovo codice magico non riuscito. Attendi un momento e riprova.',
            validateSecondaryLogin: 'Codice magico non corretto o non valido. Riprova o richiedi un nuovo codice.',
            deleteContactMethod: 'Impossibile eliminare il metodo di contatto. Contatta Concierge per assistenza.',
            setDefaultContactMethod: 'Impossibile impostare un nuovo metodo di contatto predefinito. Contatta Concierge per assistenza.',
            addContactMethod: 'Impossibile aggiungere questo metodo di contatto. Contatta Concierge per ricevere assistenza.',
            enteredMethodIsAlreadySubmitted: 'Questo metodo di contatto esiste già',
            passwordRequired: 'password richiesta.',
            contactMethodRequired: 'È necessario specificare un metodo di contatto',
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
        heHimHis: 'Lui / Lo / Suo',
        heHimHisTheyThemTheirs: 'Lui / Lo / Suo / Loro / Loro / Loro',
        sheHerHers: 'Lei / Sua / Sue',
        sheHerHersTheyThemTheirs: 'Lei / Lei / Suo / Loro / Loro / Loro',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Persone',
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
        isShownOnProfile: 'Il tuo nome visualizzato viene mostrato nel tuo profilo.',
    },
    timezonePage: {
        timezone: 'Fuso orario',
        isShownOnProfile: 'Il tuo fuso orario è mostrato nel tuo profilo.',
        getLocationAutomatically: 'Determina automaticamente la tua posizione',
    },
    updateRequiredView: {
        updateRequired: 'Aggiornamento richiesto',
        pleaseInstall: 'Aggiorna alla versione più recente di New Expensify',
        pleaseInstallExpensifyClassic: 'Installa la versione più recente di Expensify',
        toGetLatestChanges: 'Per dispositivi mobili o desktop, scarica e installa la versione più recente. Per il web, aggiorna il browser.',
        newAppNotAvailable: 'La nuova app Expensify non è più disponibile.',
    },
    initialSettingsPage: {
        about: 'Informazioni',
        aboutPage: {
            description: 'La nuova app Expensify è creata da una community di sviluppatori open source di tutto il mondo. Aiutaci a costruire il futuro di Expensify.',
            appDownloadLinks: 'Link per scaricare l’app',
            viewKeyboardShortcuts: 'Visualizza le scorciatoie da tastiera',
            viewTheCode: 'Visualizza il codice',
            viewOpenJobs: 'Visualizza lavori aperti',
            reportABug: 'Segnala un bug',
            troubleshoot: 'Risolvi problemi',
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
            description:
                "<muted-text>Utilizza gli strumenti qui sotto per aiutarti a risolvere i problemi con l'esperienza Expensify. Se riscontri qualche problema, ti preghiamo di <concierge-link>inviare una segnalazione di bug</concierge-link>.</muted-text>",
            confirmResetDescription: 'Tutti i messaggi in bozza non inviati andranno persi, ma il resto dei tuoi dati è al sicuro.',
            resetAndRefresh: 'Reimposta e aggiorna',
            clientSideLogging: 'Registrazione lato client',
            noLogsToShare: 'Nessun registro da condividere',
            useProfiling: 'Usa il profiling',
            profileTrace: 'Traccia profilo',
            results: 'Risultati',
            releaseOptions: 'Opzioni di rilascio',
            testingPreferences: 'Preferenze di test',
            useStagingServer: 'Usa server di staging',
            forceOffline: 'Forza modalità offline',
            simulatePoorConnection: 'Simula connessione Internet scadente',
            simulateFailingNetworkRequests: 'Simula il fallimento delle richieste di rete',
            authenticationStatus: 'Stato di autenticazione',
            deviceCredentials: 'Credenziali del dispositivo',
            invalidate: 'Invalidare',
            destroy: 'Elimina',
            maskExportOnyxStateData: 'Offusca i dati sensibili dei membri durante l’esportazione dello stato di Onyx',
            exportOnyxState: 'Esporta stato Onyx',
            importOnyxState: 'Importa stato Onyx',
            testCrash: 'Test arresto',
            resetToOriginalState: 'Ripristina allo stato originale',
            usingImportedState: 'Stai utilizzando uno stato importato. Premi qui per cancellarlo.',
            debugMode: 'Modalità debug',
            invalidFile: 'File non valido',
            invalidFileDescription: 'Il file che stai tentando di importare non è valido. Riprova.',
            invalidateWithDelay: 'Invalida con ritardo',
            recordTroubleshootData: 'Registrare dati per la risoluzione dei problemi',
            softKillTheApp: "Chiusura morbida dell'app",
            kill: 'Termina',
        },
        debugConsole: {
            saveLog: 'Salva registro',
            shareLog: 'Condividi registro',
            enterCommand: 'Inserisci comando',
            execute: 'Esegui',
            noLogsAvailable: 'Nessun log disponibile',
            logSizeTooLarge: ({size}: LogSizeParams) => `La dimensione del registro supera il limite di ${size} MB. Usa "Salva registro" per scaricare il file di registro.`,
            logs: 'Log',
            viewConsole: 'Visualizza console',
        },
        security: 'Sicurezza',
        signOut: 'Esci',
        restoreStashed: 'Ripristina accesso salvato',
        signOutConfirmationText: 'Perderai tutte le modifiche offline se esci.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Leggi i <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termini di servizio</a> e l'<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Informativa sulla privacy</a>.</muted-text-micro>`,
        help: 'Aiuto',
        whatIsNew: 'Novità',
        accountSettings: 'Impostazioni account',
        account: 'Account',
        general: 'Generale',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Chiudi account',
        reasonForLeavingPrompt: 'Ci dispiacerebbe vederti andare via! Potresti gentilmente dirci il motivo, così possiamo migliorarci?',
        enterMessageHere: 'Inserisci il messaggio qui',
        closeAccountWarning: 'La chiusura del tuo account non può essere annullata.',
        closeAccountPermanentlyDeleteData: 'Sei sicuro di voler eliminare il tuo account? Questa operazione eliminerà in modo permanente tutte le spese in sospeso.',
        enterDefaultContactToConfirm: 'Inserisci il tuo metodo di contatto predefinito per confermare che desideri chiudere il tuo account. Il tuo metodo di contatto predefinito è:',
        enterDefaultContact: 'Inserisci il tuo metodo di contatto predefinito',
        defaultContact: 'Metodo di contatto predefinito:',
        enterYourDefaultContactMethod: 'Inserisci il tuo metodo di contatto predefinito per chiudere il tuo account.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Unisci account',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Inserisci l’account che vuoi unire in <strong>${login}</strong>.`,
            notReversibleConsent: 'Capisco che questo non è reversibile',
        },
        accountValidate: {
            confirmMerge: 'Sei sicuro di voler unire gli account?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `L'unione dei tuoi account è irreversibile e comporterà la perdita di tutte le spese non inviate per <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Per continuare, inserisci il codice magico inviato a <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Codice magico non corretto o non valido. Riprova o richiedi un nuovo codice.',
                fallback: 'Qualcosa è andato storto. Riprova più tardi.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Account uniti!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Hai unito correttamente tutti i dati da <strong>${from}</strong> a <strong>${to}</strong>. D’ora in poi, puoi usare uno qualsiasi dei due accessi per questo account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Ci stiamo lavorando',
            limitedSupport: "Al momento non supportiamo ancora l'unione degli account su New Expensify. Effettua invece questa operazione su Expensify Classic.",
            reachOutForHelp: '<muted-text><centered-text>Non esitare a <concierge-link>contattare Concierge</concierge-link> se hai domande!</centered-text></muted-text>',
            goToExpensifyClassic: 'Vai a Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Non puoi unire <strong>${email}</strong> perché è controllata da <strong>${email.split('@').at(1) ?? ''}</strong>. Per assistenza, <concierge-link>contatta Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Non puoi unire <strong>${email}</strong> ad altri account perché l’amministratore del tuo dominio l’ha impostato come login principale. Unisci invece gli altri account a questo.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Non puoi unire gli account perché <strong>${email}</strong> ha l’autenticazione a due fattori (2FA) abilitata. Disabilita la 2FA per <strong>${email}</strong> e riprova.</centered-text></muted-text>`,
            learnMore: 'Scopri di più sull’unione degli account.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Non puoi unire <strong>${email}</strong> perché è bloccato. <concierge-link>Contatta Concierge</concierge-link> per assistenza.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Non puoi unire gli account perché <strong>${email}</strong> non ha un account Expensify. Per favore <a href="${contactMethodLink}">aggiungila come metodo di contatto</a> invece.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Non puoi unire <strong>${email}</strong> ad altri account. Unisci invece gli altri account a questo.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Non è possibile unire gli account in <strong>${email}</strong> perché questo account possiede un rapporto di fatturazione fatturato.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Riprova più tardi',
            description: 'Sono stati effettuati troppi tentativi di unire gli account. Riprova più tardi.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Non puoi unire altri account perché non è convalidato. Convalida l’account e riprova.',
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
        compromisedDescription:
            'Hai notato qualcosa di strano nel tuo account? Segnalarlo bloccherà immediatamente il tuo account, impedirà nuove transazioni con la Expensify Card e impedirà qualsiasi modifica all’account.',
        domainAdminsDescription:
            'Per gli amministratori di dominio: questo mette anche in pausa tutta l’attività delle Expensify Card e le azioni degli amministratori in tutti i tuoi domini.',
        areYouSure: 'Sei sicuro di voler bloccare il tuo account Expensify?',
        onceLocked: 'Una volta bloccato, il tuo account sarà limitato in attesa di una richiesta di sblocco e di una verifica di sicurezza',
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
        changingYourPasswordPrompt: 'La modifica della password aggiornerà la tua password sia per il tuo account Expensify.com sia per il tuo account New Expensify.',
        currentPassword: 'Password attuale',
        newPassword: 'Nuova password',
        newPasswordPrompt: 'La nuova password deve essere diversa dalla vecchia password e contenere almeno 8 caratteri, 1 lettera maiuscola, 1 lettera minuscola e 1 numero.',
    },
    twoFactorAuth: {
        headerTitle: 'Autenticazione a due fattori',
        twoFactorAuthEnabled: 'Autenticazione a due fattori abilitata',
        whatIsTwoFactorAuth:
            'L’autenticazione a due fattori (2FA) contribuisce a mantenere il tuo account al sicuro. Quando effettui l’accesso, dovrai inserire un codice generato dalla tua app di autenticazione preferita.',
        disableTwoFactorAuth: 'Disabilita l’autenticazione a due fattori',
        explainProcessToRemove: 'Per disattivare l’autenticazione a due fattori (2FA), inserisci un codice valido dalla tua app di autenticazione.',
        explainProcessToRemoveWithRecovery: 'Per disabilitare l’autenticazione a due fattori (2FA), inserisci un codice di recupero valido.',
        disabled: "L'autenticazione a due fattori è ora disattivata",
        noAuthenticatorApp: 'Non sarà più necessario utilizzare un’app di autenticazione per accedere a Expensify.',
        stepCodes: 'Codici di recupero',
        keepCodesSafe: 'Conserva questi codici di recupero al sicuro!',
        codesLoseAccess: dedent(`
            Se perdi l'accesso alla tua app di autenticazione e non hai questi codici, perderai l'accesso al tuo account.

            Nota: La configurazione dell'autenticazione a due fattori ti disconnetterà da tutte le altre sessioni attive.
        `),
        errorStepCodes: 'Copia o scarica i codici prima di continuare',
        stepVerify: 'Verifica',
        scanCode: 'Scansiona il codice QR usando il tuo',
        authenticatorApp: 'app di autenticazione',
        addKey: 'Oppure aggiungi questa chiave segreta alla tua app di autenticazione:',
        enterCode: 'Quindi inserisci il codice di sei cifre generato dalla tua app di autenticazione.',
        stepSuccess: 'Completato',
        enabled: 'Autenticazione a due fattori abilitata',
        congrats: 'Congratulazioni! Ora hai quella sicurezza extra.',
        copy: 'Copia',
        disable: 'Disabilita',
        enableTwoFactorAuth: "Abilita l'autenticazione a due fattori",
        pleaseEnableTwoFactorAuth: 'Abilita l’autenticazione a due fattori.',
        twoFactorAuthIsRequiredDescription: 'Per motivi di sicurezza, Xero richiede l’autenticazione a due fattori per collegare l’integrazione.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Autenticazione a due fattori richiesta',
        twoFactorAuthIsRequiredForAdminsTitle: 'Abilita l’autenticazione a due fattori',
        twoFactorAuthIsRequiredXero: 'La tua connessione contabile con Xero richiede l’uso dell’autenticazione a due fattori. Per continuare a utilizzare Expensify, abilitala.',
        twoFactorAuthIsRequiredCompany: 'La tua azienda richiede l’uso dell’autenticazione a due fattori. Per continuare a utilizzare Expensify, abilitala.',
        twoFactorAuthCannotDisable: "Impossibile disattivare l'autenticazione a due fattori",
        twoFactorAuthRequired: "L'autenticazione a due fattori (2FA) è obbligatoria per la tua connessione a Xero e non può essere disattivata.",
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Inserisci il tuo codice di recupero',
            incorrectRecoveryCode: 'Codice di ripristino non corretto. Riprova.',
        },
        useRecoveryCode: 'Usa codice di recupero',
        recoveryCode: 'Codice di recupero',
        use2fa: 'Usa il codice di autenticazione a due fattori',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Inserisci il tuo codice di autenticazione a due fattori',
            incorrect2fa: 'Codice di autenticazione a due fattori non corretto. Riprova.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Password aggiornata!',
        allSet: 'Tutto pronto. Conserva al sicuro la tua nuova password.',
    },
    privateNotes: {
        title: 'Note private',
        personalNoteMessage: "Tieni le note su questa chat qui. Sei l'unica persona che può aggiungere, modificare o visualizzare queste note.",
        sharedNoteMessage: 'Tieni delle note su questa chat qui. I dipendenti di Expensify e gli altri membri del dominio team.expensify.com possono visualizzare queste note.',
        composerLabel: 'Note',
        myNote: 'La mia nota',
        error: {
            genericFailureMessage: 'Le note private non possono essere salvate',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Inserisci un codice di sicurezza valido',
        },
        securityCode: 'Codice di sicurezza',
        changeBillingCurrency: 'Modifica valuta di fatturazione',
        changePaymentCurrency: 'Modifica valuta di pagamento',
        paymentCurrency: 'Valuta di pagamento',
        paymentCurrencyDescription: 'Seleziona una valuta standardizzata in cui convertire tutte le spese personali',
        note: `Nota: la modifica della valuta di pagamento può influire sull’importo che pagherai per Expensify. Consulta la nostra <a href="${CONST.PRICING}">pagina dei prezzi</a> per tutti i dettagli.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Aggiungi una carta di debito',
        nameOnCard: 'Nome sulla carta',
        debitCardNumber: 'Numero carta di debito',
        expiration: 'Data di scadenza',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Indirizzo di fatturazione',
        growlMessageOnSave: 'La tua carta di debito è stata aggiunta correttamente',
        expensifyPassword: 'Password di Expensify',
        error: {
            invalidName: 'Il nome può contenere solo lettere',
            addressZipCode: 'Inserisci un CAP valido',
            debitCardNumber: 'Inserisci un numero di carta di debito valido',
            expirationDate: 'Seleziona una data di scadenza valida',
            securityCode: 'Inserisci un codice di sicurezza valido',
            addressStreet: 'Inserisci un indirizzo di fatturazione valido che non sia una casella postale',
            addressState: 'Seleziona uno stato',
            addressCity: 'Inserisci una città',
            genericFailureMessage: 'Si è verificato un errore durante l’aggiunta della tua carta. Riprova.',
            password: 'Inserisci la tua password Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Aggiungi carta di pagamento',
        nameOnCard: 'Nome sulla carta',
        paymentCardNumber: 'Numero carta',
        expiration: 'Data di scadenza',
        expirationDate: 'MM/AA',
        cvv: 'CVV',
        billingAddress: 'Indirizzo di fatturazione',
        growlMessageOnSave: 'La tua carta di pagamento è stata aggiunta con successo',
        expensifyPassword: 'Password di Expensify',
        error: {
            invalidName: 'Il nome può contenere solo lettere',
            addressZipCode: 'Inserisci un CAP valido',
            paymentCardNumber: 'Inserisci un numero di carta valido',
            expirationDate: 'Seleziona una data di scadenza valida',
            securityCode: 'Inserisci un codice di sicurezza valido',
            addressStreet: 'Inserisci un indirizzo di fatturazione valido che non sia una casella postale',
            addressState: 'Seleziona uno stato',
            addressCity: 'Inserisci una città',
            genericFailureMessage: 'Si è verificato un errore durante l’aggiunta della tua carta. Riprova.',
            password: 'Inserisci la tua password Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Metodi di pagamento',
        setDefaultConfirmation: 'Imposta come metodo di pagamento predefinito',
        setDefaultSuccess: 'Metodo di pagamento predefinito impostato!',
        deleteAccount: 'Elimina account',
        deleteConfirmation: 'Sei sicuro di voler eliminare questo account?',
        error: {
            notOwnerOfBankAccount: "Si è verificato un errore durante l'impostazione di questo conto bancario come metodo di pagamento predefinito",
            invalidBankAccount: 'Questo conto bancario è temporaneamente sospeso',
            notOwnerOfFund: "Si è verificato un errore durante l'impostazione di questa carta come metodo di pagamento predefinito",
            setDefaultFailure: 'Qualcosa è andato storto. Chatta con Concierge per ulteriore assistenza.',
        },
        addBankAccountFailure: 'Si è verificato un errore imprevisto durante il tentativo di aggiungere il tuo conto bancario. Riprova.',
        getPaidFaster: 'Ricevi i pagamenti più velocemente',
        addPaymentMethod: 'Aggiungi un metodo di pagamento per inviare e ricevere pagamenti direttamente nell’app.',
        getPaidBackFaster: 'Ricevi rimborsi più rapidamente',
        secureAccessToYourMoney: 'Accesso sicuro al tuo denaro',
        receiveMoney: 'Ricevi denaro nella tua valuta locale',
        expensifyWallet: 'Portafoglio Expensify (Beta)',
        sendAndReceiveMoney: 'Invia e ricevi denaro con gli amici. Solo conti bancari statunitensi.',
        enableWallet: 'Abilita portafoglio',
        addBankAccountToSendAndReceive: 'Aggiungi un conto bancario per effettuare o ricevere pagamenti.',
        addDebitOrCreditCard: 'Aggiungi carta di debito o di credito',
        assignedCards: 'Carte assegnate',
        assignedCardsDescription: 'Queste sono carte assegnate da un amministratore dello spazio di lavoro per gestire le spese dell’azienda.',
        expensifyCard: 'Carta Expensify',
        walletActivationPending: 'Stiamo esaminando le tue informazioni. Per favore, ricontrolla tra qualche minuto!',
        walletActivationFailed: 'Purtroppo, il tuo wallet non può essere abilitato in questo momento. Chatta con Concierge per ulteriore assistenza.',
        addYourBankAccount: 'Aggiungi il tuo conto bancario',
        addBankAccountBody: "Colleghiamo il tuo conto bancario a Expensify così sarà più facile che mai inviare e ricevere pagamenti direttamente nell'app.",
        chooseYourBankAccount: 'Scegli il tuo conto bancario',
        chooseAccountBody: 'Assicurati di selezionare quello giusto.',
        confirmYourBankAccount: 'Conferma il tuo conto bancario',
        personalBankAccounts: 'Conti bancari personali',
        businessBankAccounts: 'Conti bancari aziendali',
    },
    cardPage: {
        expensifyCard: 'Carta Expensify',
        expensifyTravelCard: 'Carta Viaggio Expensify',
        availableSpend: 'Limite rimanente',
        smartLimit: {
            name: 'Limite intelligente',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Puoi spendere fino a ${formattedLimit} con questa carta e il limite verrà ripristinato man mano che le tue note spese inviate vengono approvate.`,
        },
        fixedLimit: {
            name: 'Limite fisso',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Puoi spendere fino a ${formattedLimit} con questa carta, dopodiché verrà disattivata.`,
        },
        monthlyLimit: {
            name: 'Limite mensile',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Puoi spendere fino a ${formattedLimit} al mese con questa carta. Il limite verrà reimpostato il primo giorno di ogni mese di calendario.`,
        },
        virtualCardNumber: 'Numero della carta virtuale',
        travelCardCvv: 'CVV della carta di viaggio',
        physicalCardNumber: 'Numero della carta fisica',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Ottieni carta fisica',
        reportFraud: 'Segnala frode con carta virtuale',
        reportTravelFraud: 'Segnala frode sulla carta di viaggio',
        reviewTransaction: 'Rivedi transazione',
        suspiciousBannerTitle: 'Transazione sospetta',
        suspiciousBannerDescription: 'Abbiamo rilevato transazioni sospette sulla tua carta. Tocca qui sotto per esaminarle.',
        cardLocked: "La tua carta è temporaneamente bloccata mentre il nostro team esamina l'account della tua azienda.",
        cardDetails: {
            cardNumber: 'Numero della carta virtuale',
            expiration: 'Scadenza',
            cvv: 'CVV',
            address: 'Indirizzo',
            revealDetails: 'Mostra dettagli',
            revealCvv: 'Mostra CVV',
            copyCardNumber: 'Copia numero carta',
            updateAddress: 'Aggiorna indirizzo',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Aggiunto al Wallet ${platform}`,
        cardDetailsLoadingFailure: 'Si è verificato un errore durante il caricamento dei dettagli della carta. Controlla la connessione a Internet e riprova.',
        validateCardTitle: 'Verifichiamo che tu sia davvero tu',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Inserisci il codice magico inviato a ${contactMethod} per visualizzare i dettagli della tua carta. Dovrebbe arrivare entro uno o due minuti.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Per favore <a href="${missingDetailsLink}">aggiungi i tuoi dati personali</a>, quindi riprova.`,
        unexpectedError: 'Si è verificato un errore durante il tentativo di recuperare i dettagli della tua carta Expensify. Riprova.',
        cardFraudAlert: {
            confirmButtonText: 'Sì, lo faccio',
            reportFraudButtonText: 'No, non sono stato io',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `ha eliminato l’attività sospetta e riattivato la carta x${cardLastFour}. Tutto pronto per continuare a registrare le spese!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `ha disattivato la carta che termina con ${cardLastFour}`,
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
            }) => `attività sospetta individuata sulla carta che termina con ${cardLastFour}. Riconosci questo addebito?

${amount} per ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Spesa',
        workflowDescription: 'Configura un flusso di lavoro dal momento in cui si verifica la spesa, includendo approvazione e pagamento.',
        submissionFrequency: 'Frequenza di invio',
        submissionFrequencyDescription: 'Scegli una pianificazione personalizzata per l’invio delle spese.',
        submissionFrequencyDateOfMonth: 'Data del mese',
        disableApprovalPromptDescription: 'La disattivazione delle approvazioni eliminerà tutti i flussi di lavoro di approvazione esistenti.',
        addApprovalsTitle: 'Aggiungi approvazioni',
        addApprovalButton: 'Aggiungi flusso di approvazione',
        addApprovalTip: 'Questo flusso di lavoro predefinito si applica a tutti i membri, a meno che non esista un flusso di lavoro più specifico.',
        approver: 'Approvatore',
        addApprovalsDescription: "Richiedi un'approvazione aggiuntiva prima di autorizzare un pagamento.",
        makeOrTrackPaymentsTitle: 'Effettua o monitora i pagamenti',
        makeOrTrackPaymentsDescription: 'Aggiungi un pagatore autorizzato per i pagamenti effettuati in Expensify o monitora i pagamenti effettuati altrove.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>In questo workspace è abilitato un flusso di approvazione personalizzato. Per rivedere o modificare questo flusso, contatta il tuo <account-manager-link>Account Manager</account-manager-link> o <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Un flusso di approvazione personalizzato è abilitato in questo spazio di lavoro. Per rivedere o modificare questo flusso di lavoro, contatta <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Scegli per quanto tempo Expensify deve attendere prima di condividere le spese prive di errori.',
        },
        frequencyDescription: 'Scegli con quale frequenza desideri che le spese vengano inviate automaticamente oppure imposta l’invio manuale',
        frequencies: {
            instant: 'Immediatamente',
            weekly: 'Settimanale',
            monthly: 'Mensile',
            twiceAMonth: 'Due volte al mese',
            byTrip: 'Per viaggio',
            manually: 'Manuale',
            daily: 'Giornaliero',
            lastDayOfMonth: 'Ultimo giorno del mese',
            lastBusinessDayOfMonth: 'Ultimo giorno lavorativo del mese',
            ordinals: {
                one: 'º',
                two: 'e',
                few: 'º',
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
        approverInMultipleWorkflows: 'Questo membro appartiene già a un altro flusso di approvazione. Qualsiasi modifica effettuata qui si rifletterà anche lì.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> approva già i report per <strong>${name2}</strong>. Scegli un altro approvatore per evitare un flusso di lavoro circolare.`,
        emptyContent: {
            title: 'Nessun membro da visualizzare',
            expensesFromSubtitle: 'Tutti i membri dello spazio di lavoro appartengono già a un flusso di approvazione esistente.',
            approverSubtitle: 'Tutti gli approvatori appartengono a un flusso di lavoro esistente.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "La frequenza di invio non può essere modificata. Riprova oppure contatta l'assistenza.",
        monthlyOffsetErrorMessage: 'La frequenza mensile non può essere modificata. Riprova o contatta l’assistenza.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Conferma',
        header: 'Aggiungi altri approvatori e conferma.',
        additionalApprover: 'Approvatore aggiuntivo',
        submitButton: 'Aggiungi flusso di lavoro',
    },
    workflowsEditApprovalsPage: {
        title: 'Modifica flusso di approvazione',
        deleteTitle: 'Elimina flusso di approvazione',
        deletePrompt: 'Sei sicuro di voler eliminare questo flusso di approvazione? Tutti i membri seguiranno successivamente il flusso predefinito.',
    },
    workflowsExpensesFromPage: {
        title: 'Spese da',
        header: 'Quando i seguenti membri inviano delle spese:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "Non è stato possibile modificare l'approvatore. Riprova o contatta l'assistenza.",
        header: 'Invia a questo membro per approvazione:',
    },
    workflowsPayerPage: {
        title: 'Pagatore autorizzato',
        genericErrorMessage: 'Non è stato possibile modificare il pagatore autorizzato. Riprova.',
        admins: 'Amministratori',
        payer: 'Pagatore',
        paymentAccount: 'Conto di pagamento',
    },
    reportFraudPage: {
        title: 'Segnala frode con carta virtuale',
        description:
            'Se i dati della tua carta virtuale sono stati rubati o compromessi, disattiveremo definitivamente la tua carta esistente e ti forniremo una nuova carta virtuale con un nuovo numero.',
        deactivateCard: 'Disattiva carta',
        reportVirtualCardFraud: 'Segnala frode con carta virtuale',
    },
    reportFraudConfirmationPage: {
        title: 'Frode sulla carta segnalata',
        description:
            'Abbiamo disattivato in modo permanente la tua carta esistente. Quando tornerai a visualizzare i dettagli della tua carta, avrai a disposizione una nuova carta virtuale.',
        buttonText: 'Capito, grazie!',
    },
    activateCardPage: {
        activateCard: 'Attiva carta',
        pleaseEnterLastFour: 'Inserisci le ultime quattro cifre della tua carta.',
        activatePhysicalCard: 'Attiva carta fisica',
        error: {
            thatDidNotMatch: 'Le ultime 4 cifre inserite non corrispondono a quelle della tua carta. Riprova.',
            throttled:
                'Hai inserito in modo errato le ultime 4 cifre della tua Expensify Card troppe volte. Se sei sicuro che i numeri siano corretti, contatta Concierge per risolvere il problema. Altrimenti, riprova più tardi.',
        },
    },
    getPhysicalCard: {
        header: 'Ottieni carta fisica',
        nameMessage: 'Inserisci il tuo nome e cognome, poiché verranno mostrati sulla tua carta.',
        legalName: 'Nome legale',
        legalFirstName: 'Nome legale di battesimo',
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
        confirmMessage: 'Conferma i tuoi dati qui sotto.',
        estimatedDeliveryMessage: 'La tua carta fisica arriverà entro 2-3 giorni lavorativi.',
        next: 'Avanti',
        getPhysicalCard: 'Ottieni carta fisica',
        shipCard: 'Spedisci carta',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Trasferimento${amount ? ` ${amount}` : ''}`,
        instant: 'Immediato (carta di debito)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `Commissione del ${rate}% (${minAmount} minimo)`,
        ach: '1-3 giorni lavorativi (Conto bancario)',
        achSummary: 'Nessuna commissione',
        whichAccount: 'Quale conto?',
        fee: 'Commissione',
        transferSuccess: 'Trasferimento riuscito!',
        transferDetailBankAccount: 'Il tuo denaro dovrebbe arrivare entro 1-3 giorni lavorativi.',
        transferDetailDebitCard: 'Il tuo denaro dovrebbe arrivare immediatamente.',
        failedTransfer: 'Il tuo saldo non è completamente saldato. Effettua un trasferimento su un conto bancario.',
        notHereSubTitle: 'Trasferisci il tuo saldo dalla pagina del wallet',
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
        addFirstPaymentMethod: 'Aggiungi un metodo di pagamento per inviare e ricevere pagamenti direttamente nell’app.',
        defaultPaymentMethod: 'Predefinito',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `Conto bancario • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'Preferenze app',
        },
        testSection: {
            title: 'Preferenze di test',
            subtitle: 'Impostazioni per aiutare a eseguire il debug e testare l’app in staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Ricevi aggiornamenti rilevanti sulle funzionalità e notizie da Expensify',
        muteAllSounds: 'Silenzia tutti i suoni da Expensify',
    },
    priorityModePage: {
        priorityMode: 'Modalità prioritaria',
        explainerText: 'Scegli se #focus deve mostrare solo le chat non lette e fissate, oppure tutto, con le chat più recenti e fissate in cima.',
        priorityModes: {
            default: {
                label: 'Più recenti',
                description: 'Mostra tutte le chat ordinate dalla più recente',
            },
            gsd: {
                label: '#concentrazione',
                description: 'Mostra solo i non letti in ordine alfabetico',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'Generazione del PDF in corso...',
        waitForPDF: 'Attendi mentre generiamo il PDF',
        errorPDF: 'Si è verificato un errore durante il tentativo di generare il tuo PDF',
    },
    reportDescriptionPage: {
        roomDescription: 'Descrizione della stanza',
        roomDescriptionOptional: 'Descrizione della stanza (facoltativa)',
        explainerText: 'Imposta una descrizione personalizzata per la stanza.',
    },
    groupChat: {
        lastMemberTitle: 'Attenzione!',
        lastMemberWarning: 'Dal momento che sei l’ultima persona qui, se lasci questa chat diventerà inaccessibile a tutti i membri. Sei sicuro di voler uscire?',
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
                label: 'Chiaro',
            },
            system: {
                label: 'Usa impostazioni del dispositivo',
            },
        },
        chooseThemeBelowOrSync: 'Scegli un tema qui sotto o sincronizza con le impostazioni del tuo dispositivo.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Accedendo, accetti i <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termini di servizio</a> e l’<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Informativa sulla privacy</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Il trasferimento di denaro è fornito da ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) in conformità alle sue <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenze</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Non hai ricevuto un codice magico?',
        enterAuthenticatorCode: "Inserisci il tuo codice dell'autenticatore",
        enterRecoveryCode: 'Inserisci il tuo codice di recupero',
        requiredWhen2FAEnabled: 'Obbligatorio quando l’autenticazione a due fattori è abilitata',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Richiedi un nuovo codice tra <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Richiedi un nuovo codice',
        error: {
            pleaseFillMagicCode: 'Inserisci il tuo codice magico',
            incorrectMagicCode: 'Codice magico non corretto o non valido. Riprova o richiedi un nuovo codice.',
            pleaseFillTwoFactorAuth: 'Inserisci il tuo codice di autenticazione a due fattori',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Compila tutti i campi',
        pleaseFillPassword: 'Per favore inserisci la tua password',
        pleaseFillTwoFactorAuth: 'Inserisci il tuo codice di autenticazione a due fattori',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Inserisci il tuo codice di autenticazione a due fattori per continuare',
        forgot: 'Hai dimenticato?',
        requiredWhen2FAEnabled: 'Obbligatorio quando l’autenticazione a due fattori è abilitata',
        error: {
            incorrectPassword: 'Password errata. Riprova.',
            incorrectLoginOrPassword: 'Login o password non corretti. Riprova.',
            incorrect2fa: 'Codice di autenticazione a due fattori non corretto. Riprova.',
            twoFactorAuthenticationEnabled: 'Hai l’autenticazione a due fattori (2FA) attivata su questo account. Accedi utilizzando la tua email o il tuo numero di telefono.',
            invalidLoginOrPassword: 'Accesso o password non validi. Riprova o reimposta la password.',
            unableToResetPassword:
                'Non siamo riusciti a modificare la tua password. Questo è probabilmente dovuto a un link di reimpostazione della password scaduto in una vecchia email di reimpostazione della password. Ti abbiamo inviato un nuovo link via email così puoi riprovare. Controlla la Posta in arrivo e la cartella Spam; dovrebbe arrivare tra pochi minuti.',
            noAccess: 'Non hai accesso a questa applicazione. Aggiungi il tuo nome utente GitHub per ottenere l’accesso.',
            accountLocked: 'Il tuo account è stato bloccato dopo troppi tentativi non riusciti. Riprova tra 1 ora.',
            fallback: 'Qualcosa è andato storto. Riprova più tardi.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefono o email',
        error: {
            invalidFormatEmailLogin: 'L’email inserita non è valida. Correggi il formato e riprova.',
        },
        cannotGetAccountDetails: 'Impossibile recuperare i dettagli dell’account. Prova ad accedere di nuovo.',
        loginForm: 'Modulo di accesso',
        notYou: ({user}: NotYouParams) => `Non sei ${user}?`,
    },
    onboarding: {
        welcome: 'Benvenuto!',
        welcomeSignOffTitleManageTeam: 'Una volta completate le attività sopra, potremo esplorare altre funzionalità come i flussi di approvazione e le regole!',
        welcomeSignOffTitle: 'È un piacere conoscerti!',
        explanationModal: {
            title: 'Benvenuto in Expensify',
            description: 'Un’unica app per gestire le tue spese aziendali e personali alla velocità della chat. Provala e facci sapere cosa ne pensi. Molto altro in arrivo!',
            secondaryDescription: 'Per tornare a Expensify Classic, tocca semplicemente la tua immagine del profilo > Vai a Expensify Classic.',
        },
        getStarted: 'Inizia',
        whatsYourName: 'Come ti chiami?',
        peopleYouMayKnow: 'Persone che potresti conoscere sono già qui! Verifica la tua email per unirti a loro.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Qualcuno di ${domain} ha già creato uno spazio di lavoro. Inserisci il codice magico inviato a ${email}.`,
        joinAWorkspace: 'Unisciti a un workspace',
        listOfWorkspaces: 'Ecco l’elenco degli spazi di lavoro a cui puoi unirti. Non preoccuparti, puoi sempre unirti più tardi se preferisci.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membro${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Dove lavori?',
        errorSelection: "Seleziona un'opzione per procedere",
        purpose: {
            title: 'Cosa vuoi fare oggi?',
            errorContinue: 'Premi Continua per completare la configurazione',
            errorBackButton: 'Completa le domande di configurazione per iniziare a usare l’app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Essere rimborsato dal mio datore di lavoro',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gestisci le spese del mio team',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Tieni traccia e pianifica le spese',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatta e dividi le spese con gli amici',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Altro',
        },
        employees: {
            title: 'Quanti dipendenti avete?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: 'Da 101 a 1.000 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Più di 1.000 dipendenti',
        },
        accounting: {
            title: 'Utilizzi un software di contabilità?',
            none: 'Nessuno',
        },
        interestedFeatures: {
            title: 'Quali funzionalità ti interessano?',
            featuresAlreadyEnabled: 'Ecco le nostre funzionalità più popolari:',
            featureYouMayBeInterestedIn: 'Abilita funzionalità aggiuntive:',
        },
        error: {
            requiredFirstName: 'Inserisci il tuo nome per continuare',
        },
        workEmail: {
            title: 'Qual è la tua email di lavoro?',
            subtitle: 'Expensify funziona al meglio quando colleghi la tua email di lavoro.',
            explanationModal: {
                descriptionOne: 'Inoltra a receipts@expensify.com per la scansione',
                descriptionTwo: 'Unisciti ai colleghi che già usano Expensify',
                descriptionThree: "Goditi un'esperienza più personalizzata",
            },
            addWorkEmail: 'Aggiungi email di lavoro',
        },
        workEmailValidation: {
            title: 'Verifica la tua email di lavoro',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Inserisci il codice magico inviato a ${workEmail}. Dovrebbe arrivare tra un minuto o due.`,
        },
        workEmailValidationError: {
            publicEmail: "Inserisci un'email di lavoro valida da un dominio privato, ad es. mitch@company.com",
            offline: 'Non è stato possibile aggiungere la tua email di lavoro perché sembri essere offline',
        },
        mergeBlockScreen: {
            title: 'Impossibile aggiungere l’email di lavoro',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Non siamo riusciti ad aggiungere ${workEmail}. Riprova più tardi in Impostazioni oppure chatta con Concierge per ricevere assistenza.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Fai un [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[Fai un breve tour del prodotto](${testDriveURL}) per scoprire perché Expensify è il modo più veloce per gestire le tue note spese.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Fai un [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `Fai un [test drive](${testDriveURL}) con noi e ottieni per il tuo team *3 mesi gratuiti di Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Aggiungi approvazioni delle spese',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Aggiungi approvazioni delle spese* per rivedere le spese del tuo team e tenerle sotto controllo.

                        Ecco come fare:

                        1. Vai su *Spazi di lavoro*.
                        2. Seleziona il tuo spazio di lavoro.
                        3. Fai clic su *Altre funzionalità*.
                        4. Abilita *Flussi di lavoro*.
                        5. Vai a *Flussi di lavoro* nell’editor dello spazio di lavoro.
                        6. Abilita *Aggiungi approvazioni*.
                        7. Verrai impostato come approvatore delle spese. Puoi cambiarlo in qualsiasi amministratore dopo aver invitato il tuo team.

                        [Portami a altre funzionalità](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Crea](${workspaceConfirmationLink}) uno spazio di lavoro`,
                description: 'Crea uno spazio di lavoro e configura le impostazioni con l’aiuto del tuo specialista per la configurazione!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Crea uno [spazio di lavoro](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Crea uno spazio di lavoro* per tenere traccia delle spese, scansionare le ricevute, chattare e altro ancora.

                        1. Fai clic su *Spazi di lavoro* > *Nuovo spazio di lavoro*.

                        *Il tuo nuovo spazio di lavoro è pronto!* [Dai un’occhiata](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Imposta le [categorie](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Imposta le categorie* così il tuo team può codificare le spese per semplificare la reportistica.

                        1. Clicca su *Spazi di lavoro*.
                        3. Seleziona il tuo spazio di lavoro.
                        4. Clicca su *Categorie*.
                        5. Disabilita le categorie di cui non hai bisogno.
                        6. Aggiungi le tue categorie in alto a destra.

                        [Portami alle impostazioni delle categorie dello spazio di lavoro](${workspaceCategoriesLink}).

                        ![Imposta le categorie](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Invia una spesa',
                description: dedent(`
                    *Invia una spesa* inserendo un importo o scansionando una ricevuta.

                    1. Fai clic sul pulsante ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Scegli *Crea spesa*.
                    3. Inserisci un importo o scansiona una ricevuta.
                    4. Aggiungi l'email o il numero di telefono del tuo capo.
                    5. Fai clic su *Crea*.

                    E hai finito!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Invia una spesa',
                description: dedent(`
                    *Invia una spesa* inserendo un importo o scansionando una ricevuta.

                    1. Fai clic sul pulsante ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Seleziona *Crea spesa*.
                    3. Inserisci un importo o scansiona una ricevuta.
                    4. Conferma i dettagli.
                    5. Fai clic su *Crea*.

                    E hai finito!
                `),
            },
            trackExpenseTask: {
                title: 'Traccia una spesa',
                description: dedent(`
                    *Registra una spesa* in qualsiasi valuta, che tu abbia una ricevuta o meno.

                    1. Fai clic sul pulsante ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Seleziona *Crea spesa*.
                    3. Inserisci un importo o scansiona una ricevuta.
                    4. Scegli il tuo spazio *personale*.
                    5. Fai clic su *Crea*.

                    E il gioco è fatto! Sì, è davvero così semplice.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Connetti${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'a'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'il tuo' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Collega ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'il tuo' : 'a'} ${integrationName} per la codifica automatica delle spese e la sincronizzazione che rendono la chiusura di fine mese semplicissima.

                        1. Fai clic su *Workspaces*.
                        2. Seleziona il tuo workspace.
                        3. Fai clic su *Accounting*.
                        4. Trova ${integrationName}.
                        5. Fai clic su *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[Portami alla contabilità](${workspaceAccountingLink}).

                                      ![Connetti a ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[Portami alla contabilità](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Collega [le tue carte aziendali](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Collega le carte che hai già per l’importazione automatica delle transazioni, l’abbinamento delle ricevute e la riconciliazione.

                        1. Fai clic su *Workspaces*.
                        2. Seleziona il tuo workspace.
                        3. Fai clic su *Company cards*.
                        4. Segui le istruzioni per collegare le tue carte.

                        [Portami alle company cards](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Invita [il tuo team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invita il tuo team* su Expensify così che possano iniziare a tracciare le spese oggi stesso.

                        1. Fai clic su *Workspaces*.
                        3. Seleziona il tuo workspace.
                        4. Fai clic su *Members* > *Invite member*.
                        5. Inserisci email o numeri di telefono.
                        6. Aggiungi un messaggio di invito personalizzato se vuoi!

                        [Portami ai membri del workspace](${workspaceMembersLink}).

                        ![Invita il tuo team](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Configura [categorie](${workspaceCategoriesLink}) e [tag](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Configura categorie e tag* in modo che il tuo team possa codificare le spese per una rendicontazione semplice.

                        Importale automaticamente [collegando il tuo software di contabilità](${workspaceAccountingLink}) oppure configuarale manualmente nelle [impostazioni dello spazio di lavoro](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Imposta [etichette](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Usa i tag per aggiungere dettagli extra alle spese, come progetti, clienti, sedi e reparti. Se hai bisogno di più livelli di tag, puoi eseguire l’upgrade al piano Control.

                        1. Clicca su *Workspaces*.
                        3. Seleziona il tuo workspace.
                        4. Clicca su *More features*.
                        5. Abilita *Tags*.
                        6. Vai a *Tags* nell’editor del workspace.
                        7. Clicca su *+ Add tag* per creare il tuo.

                        [Portami a more features](${workspaceMoreFeaturesLink}).

                        ![Configura i tag](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Invita il tuo [commercialista](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invita il tuo commercialista* a collaborare sul tuo spazio di lavoro e gestire le spese della tua attività.

                        1. Fai clic su *Spazi di lavoro*.
                        2. Seleziona il tuo spazio di lavoro.
                        3. Fai clic su *Membri*.
                        4. Fai clic su *Invita membro*.
                        5. Inserisci l'indirizzo email del tuo commercialista.

                        [Invita subito il tuo commercialista](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Avvia una chat',
                description: dedent(`
                    *Avvia una chat* con chiunque utilizzando la sua email o il suo numero di telefono.

                    1. Fai clic sul pulsante ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Scegli *Avvia chat*.
                    3. Inserisci un’email o un numero di telefono.

                    Se non stanno ancora usando Expensify, verranno invitati automaticamente.

                    Ogni chat verrà anche trasformata in un’email o in un SMS a cui potranno rispondere direttamente.
                `),
            },
            splitExpenseTask: {
                title: 'Dividi una spesa',
                description: dedent(`
                    *Dividi le spese* con una o più persone.

                    1. Fai clic sul pulsante ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Scegli *Avvia chat*.
                    3. Inserisci email o numeri di telefono.
                    4. Fai clic sul pulsante grigio *+* nella chat > *Dividi spesa*.
                    5. Crea la spesa selezionando *Manuale*, *Scansione* o *Distanza*.

                    Sentiti libero di aggiungere più dettagli se vuoi, oppure inviala direttamente. Così potrai farti rimborsare!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Rivedi le tue [impostazioni spazio di lavoro](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Ecco come rivedere e aggiornare le impostazioni del tuo workspace:
                        1. Fai clic su Workspace.
                        2. Seleziona il tuo workspace.
                        3. Verifica e aggiorna le tue impostazioni.
                        [Vai al tuo workspace.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Crea il tuo primo report',
                description: dedent(`
                    Ecco come creare un report:

                    1. Fai clic sul pulsante ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Scegli *Crea report*.
                    3. Fai clic su *Aggiungi spesa*.
                    4. Aggiungi la tua prima spesa.

                    E hai finito!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Fai un [test drive](${testDriveURL})` : 'Fai un test drive'),
            embeddedDemoIframeTitle: 'Test drive',
            employeeFakeReceipt: {
                description: 'La ricevuta del mio test drive!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Essere rimborsati è facile come inviare un messaggio. Vediamo le basi.',
            onboardingPersonalSpendMessage: 'Ecco come tenere traccia delle tue spese in pochi clic.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # La tua prova gratuita è iniziata! Configuriamoti al meglio.
                        👋 Ciao, sono il tuo specialista di configurazione Expensify. Ho già creato uno spazio di lavoro per aiutarti a gestire le ricevute e le spese del tuo team. Per sfruttare al massimo i 30 giorni di prova gratuita, segui semplicemente i passaggi di configurazione rimanenti qui sotto!
                    `)
                    : dedent(`
                        # La tua prova gratuita è iniziata! Configuriamoti al meglio.
                        👋 Ciao, sono il tuo specialista di configurazione Expensify. Ora che hai creato uno spazio di lavoro, sfrutta al massimo i tuoi 30 giorni di prova gratuita seguendo i passaggi qui sotto!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Iniziamo la configurazione\n👋 Ciao, sono il tuo specialista di configurazione Expensify. Ho già creato uno spazio di lavoro per aiutarti a gestire le tue ricevute e spese. Per sfruttare al massimo la tua prova gratuita di 30 giorni, segui semplicemente i passaggi rimanenti di configurazione qui sotto!',
            onboardingChatSplitMessage: 'Dividere le spese con gli amici è facile come inviare un messaggio. Ecco come.',
            onboardingAdminMessage: 'Scopri come gestire lo spazio di lavoro del tuo team come amministratore e inviare le tue spese.',
            onboardingLookingAroundMessage:
                'Expensify è conosciuta soprattutto per la gestione di note spese, viaggi e carte aziendali, ma facciamo molto di più. Fammi sapere cosa ti interessa e ti aiuterò a iniziare.',
            onboardingTestDriveReceiverMessage: '*Hai 3 mesi gratis! Inizia qui sotto.*',
        },
        workspace: {
            title: 'Rimani organizzato con uno spazio di lavoro',
            subtitle: 'Sblocca potenti strumenti per semplificare la gestione delle tue spese, tutto in un unico posto. Con uno spazio di lavoro puoi:',
            explanationModal: {
                descriptionOne: 'Tieni traccia e organizza le ricevute',
                descriptionTwo: 'Classifica e tagga le spese',
                descriptionThree: 'Crea e condividi report',
            },
            price: 'Provalo gratis per 30 giorni, poi esegui l’upgrade a soli <strong>$5/utente/mese</strong>.',
            createWorkspace: 'Crea spazio di lavoro',
        },
        confirmWorkspace: {
            title: 'Conferma spazio di lavoro',
            subtitle: 'Crea uno spazio di lavoro per tenere traccia delle ricevute, rimborsare le spese, gestire i viaggi, creare report e altro ancora — tutto alla velocità di una chat.',
        },
        inviteMembers: {
            title: 'Invita membri',
            subtitle: 'Aggiungi il tuo team o invita il tuo commercialista. Più siamo, meglio è!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Non mostrarlo di nuovo',
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
        privateDataMessage: 'Questi dettagli vengono utilizzati per i viaggi e i pagamenti. Non vengono mai mostrati sul tuo profilo pubblico.',
        legalName: 'Nome legale',
        legalFirstName: 'Nome legale di battesimo',
        legalLastName: 'Cognome legale',
        address: 'Indirizzo',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `La data deve essere precedente a ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `La data deve essere successiva a ${dateString}`,
            hasInvalidCharacter: 'Il nome può includere solo caratteri latini',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Formato CAP non corretto${zipFormat ? `Formato accettabile: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Assicurati che il numero di telefono sia valido (ad es. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Il link è stato reinviato',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Ho inviato un link magico di accesso a ${login}. Controlla il tuo ${loginType} per accedere.`,
        resendLink: 'Reinvia link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Per convalidare ${secondaryLogin}, invia nuovamente il codice magico dalle Impostazioni account di ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Se non hai più accesso a ${primaryLogin}, scollega i tuoi account.`,
        unlink: 'Scollega',
        linkSent: 'Link inviato!',
        successfullyUnlinkedLogin: 'Accesso secondario scollegato con successo!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Il nostro provider di posta elettronica ha temporaneamente sospeso l’invio di email a ${login} a causa di problemi di recapito. Per sbloccare il tuo login, segui questi passaggi:`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>Conferma che ${login} sia scritto correttamente e che sia un indirizzo email reale e recapitabile.</strong> Gli alias email come "expenses@domain.com" devono avere accesso alla propria casella di posta per essere un login Expensify valido.`,
        ensureYourEmailClient: `<strong>Assicurati che il tuo client email consenta le email da expensify.com.</strong> Puoi trovare le istruzioni su come completare questo passaggio <a href="${CONST.SET_NOTIFICATION_LINK}">qui</a>, ma potresti aver bisogno che il reparto IT ti aiuti a configurare le impostazioni della tua email.`,
        onceTheAbove: `Una volta completati i passaggi sopra indicati, contatta <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> per sbloccare il tuo accesso.`,
    },
    openAppFailureModal: {
        title: 'Qualcosa è andato storto...',
        subtitle: `Non siamo riusciti a caricare tutti i tuoi dati. Siamo stati informati e stiamo esaminando il problema. Se persiste, contatta`,
        refreshAndTryAgain: 'Aggiorna e riprova',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Non siamo riusciti a consegnare i messaggi SMS a ${login}, quindi è stato temporaneamente sospeso. Prova a convalidare il tuo numero:`,
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
                return 'Attendi un momento prima di riprovare.';
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
            return `Tieniti forte! Devi aspettare ${timeText} prima di provare a convalidare di nuovo il tuo numero.`;
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
        selectYear: 'Seleziona un anno',
    },
    focusModeUpdateModal: {
        title: 'Benvenuto nella modalità #focus!',
        prompt: ({priorityModePageUrl}: FocusModeUpdateParams) =>
            `Rimani sempre aggiornato visualizzando solo le chat non lette o quelle che richiedono la tua attenzione. Non preoccuparti, puoi modificare questa impostazione in qualsiasi momento nelle <a href="${priorityModePageUrl}">impostazioni</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'La chat che stai cercando non può essere trovata.',
        getMeOutOfHere: 'Fammi uscire di qui',
        iouReportNotFound: 'I dettagli di pagamento che stai cercando non possono essere trovati.',
        notHere: 'Uhm... non è qui',
        pageNotFound: 'Oops, questa pagina non può essere trovata',
        noAccess: 'Questa chat o questa spesa potrebbe essere stata eliminata oppure non hai accesso.\n\nPer qualsiasi domanda contatta concierge@expensify.com',
        goBackHome: 'Torna alla home page',
        commentYouLookingForCannotBeFound: 'Il commento che stai cercando non può essere trovato.',
        goToChatInstead: 'Vai invece alla chat.',
        contactConcierge: 'Per qualsiasi domanda contatta concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ops... ${isBreakLine ? '\n' : ''}Qualcosa è andato storto`,
        subtitle: 'La tua richiesta non può essere completata. Riprova più tardi.',
        wrongTypeSubtitle: 'Questa ricerca non è valida. Prova a modificare i criteri di ricerca.',
    },
    setPasswordPage: {
        enterPassword: 'Inserisci una password',
        setPassword: 'Imposta password',
        newPasswordPrompt: 'La password deve contenere almeno 8 caratteri, 1 lettera maiuscola, 1 lettera minuscola e 1 numero.',
        passwordFormTitle: 'Bentornato nella nuova Expensify! Imposta la tua password.',
        passwordNotSet: 'Non siamo riusciti a impostare la tua nuova password. Ti abbiamo inviato un nuovo link per reimpostare la password e riprovare.',
        setPasswordLinkInvalid: 'Questo link per impostare la password non è valido o è scaduto. Un nuovo link ti sta aspettando nella tua casella di posta elettronica!',
        validateAccount: 'Verifica account',
    },
    statusPage: {
        status: 'Stato',
        statusExplanation: "Aggiungi un'emoji per dare ai tuoi colleghi e amici un modo semplice per sapere cosa sta succedendo. Puoi anche aggiungere un messaggio, se vuoi!",
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
            custom: 'Personalizzato',
        },
        untilTomorrow: 'Fino a domani',
        untilTime: ({time}: UntilTimeParams) => `Fino alle ${time}`,
        date: 'Data',
        time: 'Ora',
        clearAfter: 'Cancella dopo',
        whenClearStatus: 'Quando dobbiamo cancellare il tuo stato?',
        vacationDelegate: 'Delegato per le vacanze',
        setVacationDelegate: `Imposta un delegato per le ferie che approvi i report per tuo conto mentre sei fuori ufficio.`,
        vacationDelegateError: "Si è verificato un errore durante l'aggiornamento del tuo delegato per le ferie.",
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `come delegato per le vacanze di ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `a ${submittedToName} come delegato ferie per ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Stai assegnando ${nameOrEmail} come tuo delegato per le vacanze. Non fanno ancora parte di tutti i tuoi workspace. Se scegli di continuare, verrà inviata un’e-mail a tutti gli amministratori dei tuoi workspace per aggiungerli.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Passaggio ${step}`;
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
        confirmBankInfo: 'Conferma informazioni bancarie',
        manuallyAdd: 'Aggiungi manualmente il tuo conto bancario',
        letsDoubleCheck: 'Controlliamo ancora una volta che sia tutto corretto.',
        accountEnding: 'Account che termina con',
        thisBankAccount: 'Questo conto bancario verrà utilizzato per i pagamenti aziendali nel tuo workspace',
        accountNumber: 'Numero di conto',
        routingNumber: 'Numero di instradamento',
        chooseAnAccountBelow: 'Scegli un account qui sotto',
        addBankAccount: 'Aggiungi conto bancario',
        chooseAnAccount: 'Scegli un account',
        connectOnlineWithPlaid: 'Accedi alla tua banca',
        connectManually: 'Connetti manualmente',
        desktopConnection: 'Nota: per connetterti con Chase, Wells Fargo, Capital One o Bank of America, fai clic qui per completare questo processo in un browser.',
        yourDataIsSecure: 'I tuoi dati sono al sicuro',
        toGetStarted: 'Aggiungi un conto bancario per rimborsare le spese, emettere Expensify Card, riscuotere i pagamenti delle fatture e pagare le bollette, tutto da un unico posto.',
        plaidBodyCopy: 'Offri ai tuoi dipendenti un modo più semplice per pagare – e farsi rimborsare – le spese aziendali.',
        checkHelpLine: 'Il tuo numero di instradamento e il numero di conto si trovano sull’assegno relativo al conto.',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `Per collegare un conto bancario, <a href="${contactMethodRoute}">aggiungi un'email come login principale</a> e riprova. Puoi aggiungere il tuo numero di telefono come login secondario.`,
        hasBeenThrottledError: "Si è verificato un errore durante l'aggiunta del tuo conto bancario. Attendi alcuni minuti e riprova.",
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ops! Sembra che la valuta del tuo workspace sia impostata su una valuta diversa da USD. Per procedere, vai alle <a href="${workspaceRoute}">impostazioni del tuo workspace</a>, impostala su USD e riprova.`,
        bbaAdded: 'Conto bancario aziendale aggiunto!',
        bbaAddedDescription: 'È pronto per essere usato per i pagamenti.',
        error: {
            youNeedToSelectAnOption: "Seleziona un'opzione per procedere",
            noBankAccountAvailable: 'Spiacenti, non è disponibile alcun conto bancario',
            noBankAccountSelected: 'Seleziona un conto',
            taxID: 'Inserisci un numero di identificazione fiscale valido',
            website: 'Inserisci un sito web valido',
            zipCode: `Inserisci un CAP valido utilizzando il formato: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Inserisci un numero di telefono valido',
            email: 'Inserisci un indirizzo email valido',
            companyName: 'Inserisci un nome aziendale valido',
            addressCity: 'Inserisci una città valida',
            addressStreet: 'Inserisci un indirizzo stradale valido',
            addressState: 'Seleziona uno stato valido',
            incorporationDateFuture: 'La data di costituzione non può essere nel futuro',
            incorporationState: 'Seleziona uno stato valido',
            industryCode: 'Inserisci un codice di classificazione dell’industria valido di sei cifre',
            restrictedBusiness: 'Conferma che l’azienda non sia nell’elenco delle attività soggette a restrizioni',
            routingNumber: 'Inserisci un numero di instradamento valido',
            accountNumber: 'Inserisci un numero di conto valido',
            routingAndAccountNumberCannotBeSame: 'I numeri di routing e di conto non possono coincidere',
            companyType: 'Seleziona un tipo di azienda valido',
            tooManyAttempts: 'A causa dell’elevato numero di tentativi di accesso, questa opzione è stata disabilitata per 24 ore. Riprova più tardi oppure inserisci i dati manualmente.',
            address: 'Inserisci un indirizzo valido',
            dob: 'Seleziona una data di nascita valida',
            age: 'Devi avere più di 18 anni',
            ssnLast4: 'Inserisci le ultime 4 cifre valide del SSN',
            firstName: 'Inserisci un nome di battesimo valido',
            lastName: 'Inserisci un cognome valido',
            noDefaultDepositAccountOrDebitCardAvailable: 'Aggiungi un conto di deposito predefinito o una carta di debito',
            validationAmounts: 'Gli importi di verifica che hai inserito non sono corretti. Controlla nuovamente il tuo estratto conto bancario e riprova.',
            fullName: 'Per favore inserisci un nome completo valido',
            ownershipPercentage: 'Inserisci un numero percentuale valido',
            deletePaymentBankAccount:
                'Questo conto bancario non può essere eliminato perché viene utilizzato per i pagamenti con Expensify Card. Se desideri comunque eliminare questo conto, contatta Concierge.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Dove si trova il tuo conto bancario?',
        accountDetailsStepHeader: 'Quali sono i dettagli del tuo account?',
        accountTypeStepHeader: 'Che tipo di account è questo?',
        bankInformationStepHeader: 'Quali sono i tuoi dati bancari?',
        accountHolderInformationStepHeader: 'Quali sono i dettagli dell’intestatario del conto?',
        howDoWeProtectYourData: 'Come proteggiamo i tuoi dati?',
        currencyHeader: 'Qual è la valuta del tuo conto bancario?',
        confirmationStepHeader: 'Controlla le tue informazioni.',
        confirmationStepSubHeader: 'Controlla attentamente i dettagli qui sotto e seleziona la casella dei termini per confermare.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Inserisci la password di Expensify',
        alreadyAdded: 'Questo account è già stato aggiunto.',
        chooseAccountLabel: 'Account',
        successTitle: 'Conto bancario personale aggiunto!',
        successMessage: 'Congratulazioni, il tuo conto bancario è configurato ed è pronto a ricevere rimborsi.',
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
        retry: 'Riprova',
    },
    messages: {
        errorMessageInvalidPhone: `Inserisci un numero di telefono valido senza parentesi né trattini. Se ti trovi fuori dagli Stati Uniti, includi il prefisso del tuo Paese (es. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Email non valido',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} è già un membro di ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Continuando con la richiesta di attivazione del tuo Expensify Wallet, confermi di aver letto, compreso e accettato',
        facialScan: 'Informativa e Liberatoria per la Scansione Facciale di Onfido',
        tryAgain: 'Riprova',
        verifyIdentity: 'Verifica identità',
        letsVerifyIdentity: 'Verifichiamo la tua identità',
        butFirst: `Ma prima, le cose noiose. Leggi le informazioni legali nel prossimo passaggio e fai clic su "Accetta" quando sei pronto.`,
        genericError: "Si è verificato un errore durante l'elaborazione di questo passaggio. Riprova.",
        cameraPermissionsNotGranted: 'Abilita accesso alla fotocamera',
        cameraRequestMessage: 'Abbiamo bisogno di accedere alla tua fotocamera per completare la verifica del conto bancario. Abilitala tramite Impostazioni > New Expensify.',
        microphonePermissionsNotGranted: 'Abilita l’accesso al microfono',
        microphoneRequestMessage: 'Abbiamo bisogno di accedere al tuo microfono per completare la verifica del conto bancario. Abilitalo tramite Impostazioni > New Expensify.',
        originalDocumentNeeded: 'Carica un’immagine originale del tuo documento d’identità invece di uno screenshot o di un’immagine scansita.',
        documentNeedsBetterQuality:
            'Il tuo documento d’identità sembra danneggiato o privo di alcune caratteristiche di sicurezza. Carica un’immagine originale di un documento integro, completamente visibile.',
        imageNeedsBetterQuality: 'C’è un problema con la qualità dell’immagine del tuo documento di identità. Carica una nuova immagine in cui l’intero documento sia visibile chiaramente.',
        selfieIssue: 'Si è verificato un problema con il tuo selfie/video. Carica un selfie/video in tempo reale.',
        selfieNotMatching: 'Il tuo selfie/video non corrisponde al tuo documento d’identità. Carica un nuovo selfie/video in cui il tuo viso sia chiaramente visibile.',
        selfieNotLive: 'Il tuo selfie/video non sembra essere una foto/video dal vivo. Carica un selfie/video dal vivo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dettagli aggiuntivi',
        helpText: 'Dobbiamo confermare le seguenti informazioni prima che tu possa inviare e ricevere denaro dal tuo portafoglio.',
        helpTextIdologyQuestions: 'Dobbiamo farti ancora poche domande per completare la verifica della tua identità.',
        helpLink: 'Scopri di più sul perché ne abbiamo bisogno.',
        legalFirstNameLabel: 'Nome legale di battesimo',
        legalMiddleNameLabel: 'Secondo nome legale',
        legalLastNameLabel: 'Cognome legale',
        selectAnswer: 'Seleziona una risposta per procedere',
        ssnFull9Error: 'Inserisci un SSN valido di nove cifre',
        needSSNFull9: 'Stiamo riscontrando problemi nella verifica del tuo SSN. Inserisci per favore tutte e nove le cifre del tuo SSN.',
        weCouldNotVerify: 'Impossibile verificare',
        pleaseFixIt: 'Correggi queste informazioni prima di continuare',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Non siamo riusciti a verificare la tua identità. Riprova più tardi oppure contatta <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> se hai domande.`,
    },
    termsStep: {
        headerTitle: 'Termini e commissioni',
        headerTitleRefactor: 'Commissioni e condizioni',
        haveReadAndAgreePlain: 'Ho letto e accetto di ricevere comunicazioni elettroniche.',
        haveReadAndAgree: `Ho letto e accetto di ricevere le <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">comunicazioni elettroniche</a>.`,
        agreeToThePlain: 'Accetto l’Informativa sulla privacy e l’Accordo del portafoglio.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Accetto l’<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Informativa sulla privacy</a> e il <a href="${walletAgreementUrl}">Contratto del Wallet</a>.`,
        enablePayments: 'Abilita pagamenti',
        monthlyFee: 'Canone mensile',
        inactivity: 'Inattività',
        noOverdraftOrCredit: 'Nessuna funzione di scoperto/credito.',
        electronicFundsWithdrawal: 'Prelievo di fondi elettronico',
        standard: 'Standard',
        reviewTheFees: "Dai un'occhiata ad alcune commissioni.",
        checkTheBoxes: 'Seleziona le caselle qui sotto.',
        agreeToTerms: 'Accetta i termini e sarai pronto per iniziare!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Il Wallet Expensify è emesso da ${walletProgram}.`,
            perPurchase: 'Per acquisto',
            atmWithdrawal: 'Prelievo bancomat',
            cashReload: 'Ricarica in contanti',
            inNetwork: 'in rete',
            outOfNetwork: 'Fuori dalla rete',
            atmBalanceInquiry: 'Richiesta saldo ATM (in rete o fuori rete)',
            customerService: 'Assistenza clienti (automatica o con agente dal vivo)',
            inactivityAfterTwelveMonths: 'Inattività (dopo 12 mesi senza transazioni)',
            weChargeOneFee: 'Addebitiamo 1 altro tipo di commissione. È:',
            fdicInsurance: 'I tuoi fondi sono idonei per l’assicurazione FDIC.',
            generalInfo: `Per informazioni generali sui conti prepagati, visita <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Per dettagli e condizioni relativi a tutte le commissioni e i servizi, visita <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> o chiama il numero +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Prelievo di fondi elettronico (istantaneo)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Un elenco di tutte le commissioni del Portafoglio Expensify',
            typeOfFeeHeader: 'Tutte le commissioni',
            feeAmountHeader: 'Importo',
            moreDetailsHeader: 'Dettagli',
            openingAccountTitle: 'Apertura di un conto',
            openingAccountDetails: "Non c'è alcuna commissione per aprire un account.",
            monthlyFeeDetails: "Non c'è alcun canone mensile.",
            customerServiceTitle: 'Assistenza clienti',
            customerServiceDetails: 'Non ci sono commissioni per il servizio clienti.',
            inactivityDetails: 'Non c’è alcuna commissione di inattività.',
            sendingFundsTitle: 'Invio di fondi a un altro titolare di conto',
            sendingFundsDetails: 'Non è prevista alcuna commissione per inviare fondi a un altro titolare di conto utilizzando il tuo saldo, conto bancario o carta di debito.',
            electronicFundsStandardDetails:
                'Non è prevista alcuna commissione per trasferire fondi dal tuo Portafoglio Expensify al tuo conto bancario utilizzando l’opzione standard. Questo trasferimento viene solitamente completato entro 1-3 giorni lavorativi.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'È prevista una commissione per trasferire fondi dal tuo Wallet Expensify alla carta di debito collegata utilizzando l’opzione di trasferimento istantaneo. Questo trasferimento di solito viene completato entro pochi minuti.' +
                `La commissione è pari al ${percentage}% dell'importo del trasferimento (con una commissione minima di ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `I tuoi fondi sono idonei per la copertura assicurativa FDIC. I tuoi fondi saranno detenuti presso o trasferiti a ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, un istituto assicurato dalla FDIC.` +
                `Una volta lì, i tuoi fondi sono assicurati fino a ${amount} dalla FDIC nel caso in cui ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fallisca, se sono soddisfatti i requisiti specifici dell’assicurazione sui depositi e la tua carta è registrata. Consulta ${CONST.TERMS.FDIC_PREPAID} per i dettagli.`,
            contactExpensifyPayments: `Contatta ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} chiamando il numero +1 833-400-0904, via email all'indirizzo ${CONST.EMAIL.CONCIERGE} oppure accedi a ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Per informazioni generali sui conti prepagati, visita ${CONST.TERMS.CFPB_PREPAID}. Se hai un reclamo su un conto prepagato, chiama il Consumer Financial Protection Bureau al 1-855-411-2372 o visita ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Visualizza versione stampabile',
            automated: 'Automatico',
            liveAgent: 'Agente in tempo reale',
            instant: 'Istantanea',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Abilita pagamenti',
        activatedTitle: 'Portafoglio attivato!',
        activatedMessage: 'Complimenti, il tuo portafoglio è configurato ed è pronto per effettuare pagamenti.',
        checkBackLaterTitle: 'Solo un minuto...',
        checkBackLaterMessage: 'Stiamo ancora esaminando le tue informazioni. Per favore, riprova più tardi.',
        continueToPayment: 'Continua al pagamento',
        continueToTransfer: 'Continua il trasferimento',
    },
    companyStep: {
        headerTitle: "Informazioni sull'azienda",
        subtitle: 'Quasi fatto! Per motivi di sicurezza, dobbiamo confermare alcune informazioni:',
        legalBusinessName: 'Ragione sociale legale',
        companyWebsite: 'Sito web aziendale',
        taxIDNumber: 'Codice fiscale',
        taxIDNumberPlaceholder: '9 cifre',
        companyType: 'Tipo di azienda',
        incorporationDate: 'Data di costituzione',
        incorporationState: 'Stato di costituzione',
        industryClassificationCode: 'Codice di classificazione dell’industria',
        confirmCompanyIsNot: 'Confermo che questa azienda non è nella',
        listOfRestrictedBusinesses: 'elenco delle attività soggette a restrizioni',
        incorporationDatePlaceholder: 'Data di inizio (aaaa-mm-gg)',
        incorporationTypes: {
            LLC: 'SRL',
            CORPORATION: 'Società',
            PARTNERSHIP: 'Partnership',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Ditta individuale',
            OTHER: 'Altro',
        },
        industryClassification: 'In quale settore è classificata l’azienda?',
        industryClassificationCodePlaceholder: 'Cerca il codice di classificazione del settore',
    },
    requestorStep: {
        headerTitle: 'Informazioni personali',
        learnMore: 'Scopri di più',
        isMyDataSafe: 'I miei dati sono al sicuro?',
    },
    personalInfoStep: {
        personalInfo: 'Informazioni personali',
        enterYourLegalFirstAndLast: 'Qual è il tuo nome legale?',
        legalFirstName: 'Nome legale di battesimo',
        legalLastName: 'Cognome legale',
        legalName: 'Nome legale',
        enterYourDateOfBirth: 'Qual è la tua data di nascita?',
        enterTheLast4: 'Quali sono le ultime quattro cifre del tuo numero di previdenza sociale?',
        dontWorry: 'Non preoccuparti, non effettuiamo alcuna verifica del credito personale!',
        last4SSN: 'Ultime 4 cifre del SSN',
        enterYourAddress: 'Qual è il tuo indirizzo?',
        address: 'Indirizzo',
        letsDoubleCheck: 'Controlliamo ancora una volta che sia tutto corretto.',
        byAddingThisBankAccount: 'Aggiungendo questo conto bancario, confermi di aver letto, compreso e accettato',
        whatsYourLegalName: 'Qual è il tuo nome legale?',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        whatsYourAddress: 'Qual è il tuo indirizzo?',
        whatsYourSSN: 'Quali sono le ultime quattro cifre del tuo numero di previdenza sociale?',
        noPersonalChecks: 'Nessun problema, qui non facciamo controlli del credito personali!',
        whatsYourPhoneNumber: 'Qual è il tuo numero di telefono?',
        weNeedThisToVerify: 'Ci serve questo per verificare il tuo wallet.',
    },
    businessInfoStep: {
        businessInfo: 'Informazioni aziendali',
        enterTheNameOfYourBusiness: 'Come si chiama la tua azienda?',
        businessName: 'Ragione sociale legale',
        enterYourCompanyTaxIdNumber: 'Qual è il numero di partita IVA della tua azienda?',
        taxIDNumber: 'Codice fiscale',
        taxIDNumberPlaceholder: '9 cifre',
        enterYourCompanyWebsite: 'Qual è il sito web della tua azienda?',
        companyWebsite: 'Sito web aziendale',
        enterYourCompanyPhoneNumber: 'Qual è il numero di telefono della tua azienda?',
        enterYourCompanyAddress: 'Qual è l’indirizzo della tua azienda?',
        selectYourCompanyType: 'Che tipo di azienda è?',
        companyType: 'Tipo di azienda',
        incorporationType: {
            LLC: 'SRL',
            CORPORATION: 'Società',
            PARTNERSHIP: 'Partnership',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Ditta individuale',
            OTHER: 'Altro',
        },
        selectYourCompanyIncorporationDate: 'Qual è la data di costituzione della tua azienda?',
        incorporationDate: 'Data di costituzione',
        incorporationDatePlaceholder: 'Data di inizio (aaaa-mm-gg)',
        incorporationState: 'Stato di costituzione',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In quale stato è stata costituita la tua azienda?',
        letsDoubleCheck: 'Controlliamo ancora una volta che sia tutto corretto.',
        companyAddress: 'Indirizzo aziendale',
        listOfRestrictedBusinesses: 'elenco delle attività soggette a restrizioni',
        confirmCompanyIsNot: 'Confermo che questa azienda non è nella',
        businessInfoTitle: 'Informazioni aziendali',
        legalBusinessName: 'Ragione sociale legale',
        whatsTheBusinessName: "Qual è il nome dell'azienda?",
        whatsTheBusinessAddress: 'Qual è l’indirizzo dell’azienda?',
        whatsTheBusinessContactInformation: 'Quali sono le informazioni di contatto aziendali?',
        whatsTheBusinessRegistrationNumber: ({country}: BusinessRegistrationNumberParams) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Qual è il numero di registrazione dell’azienda (CRN)?';
                default:
                    return 'Qual è il numero di registrazione dell’azienda?';
            }
        },
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Qual è il numero di identificazione del datore di lavoro (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Che cos’è il Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Qual è il numero di partita IVA (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Qual è l’Australian Business Number (ABN)?';
                default:
                    return 'Qual è il numero di partita IVA UE?';
            }
        },
        whatsThisNumber: "Che cos'è questo numero?",
        whereWasTheBusinessIncorporated: 'Dove è stata costituita l’azienda?',
        whatTypeOfBusinessIsIt: 'Che tipo di attività è?',
        whatsTheBusinessAnnualPayment: 'Qual è il volume annuo dei pagamenti dell’azienda?',
        whatsYourExpectedAverageReimbursements: 'Qual è il tuo importo medio di rimborso previsto?',
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
        incorporation: 'Costituzione',
        incorporationCountry: 'Paese di costituzione',
        incorporationTypeName: 'Tipo di costituzione',
        businessCategory: 'Categoria aziendale',
        annualPaymentVolume: 'Volume di pagamento annuale',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Volume annuo dei pagamenti in ${currencyCode}`,
        averageReimbursementAmount: 'Importo medio del rimborso',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Importo medio del rimborso in ${currencyCode}`,
        selectIncorporationType: 'Seleziona il tipo di costituzione',
        selectBusinessCategory: 'Seleziona categoria aziendale',
        selectAnnualPaymentVolume: 'Seleziona il volume annuo dei pagamenti',
        selectIncorporationCountry: 'Seleziona il paese di costituzione',
        selectIncorporationState: 'Seleziona lo stato di costituzione',
        selectAverageReimbursement: 'Seleziona l’importo medio del rimborso',
        selectBusinessType: 'Seleziona il tipo di attività',
        findIncorporationType: 'Trova il tipo di costituzione',
        findBusinessCategory: 'Trova categoria aziendale',
        findAnnualPaymentVolume: 'Trova il volume annuale dei pagamenti',
        findIncorporationState: 'Trova stato di costituzione',
        findAverageReimbursement: "Trova l'importo medio del rimborso",
        findBusinessType: 'Trova tipo di attività',
        error: {
            registrationNumber: 'Inserisci un numero di registrazione valido',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Fornisci un valido Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return 'Fornisci un numero di Partita IVA (BN) valido';
                    case CONST.COUNTRY.GB:
                        return 'Inserisci un numero di partita IVA (VRN) valido';
                    case CONST.COUNTRY.AU:
                        return 'Per favore, fornisci un Australian Business Number (ABN) valido';
                    default:
                        return 'Fornisci un numero di partita IVA UE valido';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `Possiedi il 25% o più di ${companyName}?`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `Alcuna persona possiede il 25% o più di ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `Ci sono altre persone che possiedono il 25% o più di ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'La normativa ci impone di verificare l’identità di chiunque possieda più del 25% dell’azienda.',
        companyOwner: "Titolare d'azienda",
        enterLegalFirstAndLastName: 'Qual è il nome legale del proprietario?',
        legalFirstName: 'Nome legale di battesimo',
        legalLastName: 'Cognome legale',
        enterTheDateOfBirthOfTheOwner: 'Qual è la data di nascita del proprietario?',
        enterTheLast4: 'Quali sono le ultime 4 cifre del numero di Social Security del titolare?',
        last4SSN: 'Ultime 4 cifre del SSN',
        dontWorry: 'Non preoccuparti, non effettuiamo alcuna verifica del credito personale!',
        enterTheOwnersAddress: 'Qual è l’indirizzo del proprietario?',
        letsDoubleCheck: 'Facciamo un ultimo controllo per assicurarci che sia tutto corretto.',
        legalName: 'Nome legale',
        address: 'Indirizzo',
        byAddingThisBankAccount: 'Aggiungendo questo conto bancario, confermi di aver letto, compreso e accettato',
        owners: 'Proprietari',
    },
    ownershipInfoStep: {
        ownerInfo: 'Info proprietario',
        businessOwner: "Titolare d'azienda",
        signerInfo: 'Informazioni sul firmatario',
        doYouOwn: ({companyName}: CompanyNameParams) => `Possiedi il 25% o più di ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Alcuna persona possiede il 25% o più di ${companyName}?`,
        regulationsRequire: 'I regolamenti ci impongono di verificare l’identità di ogni individuo che possiede più del 25% dell’azienda.',
        legalFirstName: 'Nome legale di battesimo',
        legalLastName: 'Cognome legale',
        whatsTheOwnersName: 'Qual è il nome legale del proprietario?',
        whatsYourName: 'Qual è il tuo nome legale?',
        whatPercentage: 'Quale percentuale dell’attività appartiene al titolare?',
        whatsYoursPercentage: 'Quale percentuale dell’azienda possiedi?',
        ownership: 'Proprietà',
        whatsTheOwnersDOB: 'Qual è la data di nascita del proprietario?',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        whatsTheOwnersAddress: 'Qual è l’indirizzo del proprietario?',
        whatsYourAddress: 'Qual è il tuo indirizzo?',
        whatAreTheLast: 'Quali sono le ultime 4 cifre del numero di Social Security del titolare?',
        whatsYourLast: 'Quali sono le ultime 4 cifre del tuo numero di previdenza sociale?',
        whatsYourNationality: 'Qual è il tuo paese di cittadinanza?',
        whatsTheOwnersNationality: 'Qual è il paese di cittadinanza del titolare?',
        countryOfCitizenship: 'Paese di cittadinanza',
        dontWorry: 'Non preoccuparti, non effettuiamo alcuna verifica del credito personale!',
        last4: 'Ultime 4 cifre del SSN',
        whyDoWeAsk: 'Perché lo chiediamo?',
        letsDoubleCheck: 'Facciamo un ultimo controllo per assicurarci che sia tutto corretto.',
        legalName: 'Nome legale',
        ownershipPercentage: 'Percentuale di proprietà',
        areThereOther: ({companyName}: CompanyNameParams) => `Ci sono altre persone che possiedono il 25% o più di ${companyName}?`,
        owners: 'Proprietari',
        addCertified: 'Aggiungi un organigramma certificato che mostri i titolari effettivi',
        regulationRequiresChart:
            'La normativa richiede che raccogliamo una copia certificata dell’organigramma di proprietà che mostri ogni persona fisica o entità che possiede il 25% o più dell’azienda.',
        uploadEntity: 'Carica schema di proprietà dell’entità',
        noteEntity: 'Nota: Il grafico di proprietà dell’entità deve essere firmato dal tuo commercialista, dal tuo consulente legale o essere autenticato da un notaio.',
        certified: "Schema certificato della struttura proprietaria dell'entità",
        selectCountry: 'Seleziona paese',
        findCountry: 'Trova paese',
        address: 'Indirizzo',
        chooseFile: 'Scegli file',
        uploadDocuments: 'Carica documentazione aggiuntiva',
        pleaseUpload: 'Carica di seguito la documentazione aggiuntiva per aiutarci a verificare la tua identità come titolare diretto o indiretto del 25% o più dell’entità aziendale.',
        acceptedFiles: 'Formati di file accettati: PDF, PNG, JPEG. La dimensione totale dei file per ogni sezione non può superare 5 MB.',
        proofOfBeneficialOwner: 'Prova del titolare effettivo',
        proofOfBeneficialOwnerDescription:
            'Fornisci un’attestazione firmata e un organigramma da parte di un commercialista, notaio o avvocato che verifichi la proprietà del 25% o più dell’azienda. Il documento deve essere datato entro gli ultimi tre mesi e includere il numero di licenza del firmatario.',
        copyOfID: 'Copia del documento d’identità del titolare effettivo',
        copyOfIDDescription: 'Esempi: Passaporto, patente di guida, ecc.',
        proofOfAddress: 'Prova di indirizzo per il titolare effettivo',
        proofOfAddressDescription: 'Esempi: Bolletta, contratto di locazione, ecc.',
        codiceFiscale: 'Codice fiscale/ID fiscale',
        codiceFiscaleDescription:
            'Carica un video di una visita in sede o di una chiamata registrata con il firmatario autorizzato. Il firmatario deve fornire: nome e cognome, data di nascita, ragione sociale, numero di registrazione, codice fiscale, sede legale, settore di attività e finalità del conto.',
    },
    completeVerificationStep: {
        completeVerification: 'Completa la verifica',
        confirmAgreements: 'Conferma gli accordi riportati di seguito.',
        certifyTrueAndAccurate: 'Dichiaro che le informazioni fornite sono veritiere e accurate',
        certifyTrueAndAccurateError: 'Si prega di certificare che le informazioni sono vere e accurate',
        isAuthorizedToUseBankAccount: 'Sono autorizzato a utilizzare questo conto bancario aziendale per spese aziendali',
        isAuthorizedToUseBankAccountError: 'Devi essere un responsabile autorizzato a operare sul conto bancario aziendale',
        termsAndConditions: 'termini e condizioni',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Convalida il tuo conto bancario',
        validateButtonText: 'Convalida',
        validationInputLabel: 'Transazione',
        maxAttemptsReached: 'La verifica di questo conto bancario è stata disattivata a causa di troppi tentativi non corretti.',
        description: `Entro 1-2 giorni lavorativi, invieremo tre (3) piccole transazioni al tuo conto bancario da un nome simile a "Expensify, Inc. Validation".`,
        descriptionCTA: "Inserisci l'importo di ogni transazione nei campi sottostanti. Esempio: 1,51.",
        letsChatText: 'Ci siamo quasi! Abbiamo bisogno del tuo aiuto per verificare le ultime informazioni via chat. Pronto?',
        enable2FATitle: 'Previeni le frodi, abilita l’autenticazione a due fattori (2FA)',
        enable2FAText: 'Prendiamo molto sul serio la tua sicurezza. Imposta ora la 2FA per aggiungere un ulteriore livello di protezione al tuo account.',
        secureYourAccount: 'Proteggi il tuo account',
    },
    countryStep: {
        confirmBusinessBank: 'Conferma valuta e paese del conto bancario aziendale',
        confirmCurrency: 'Conferma valuta e paese',
        yourBusiness: 'La valuta del conto bancario aziendale deve corrispondere alla valuta del tuo spazio di lavoro.',
        youCanChange: 'Puoi cambiare la valuta del tuo spazio di lavoro nelle tue',
        findCountry: 'Trova paese',
        selectCountry: 'Seleziona paese',
    },
    bankInfoStep: {
        whatAreYour: 'Quali sono i dettagli del tuo conto bancario aziendale?',
        letsDoubleCheck: 'Verifichiamo ancora una volta che sia tutto a posto.',
        thisBankAccount: 'Questo conto bancario verrà utilizzato per i pagamenti aziendali nel tuo workspace',
        accountNumber: 'Numero di conto',
        accountHolderNameDescription: 'Nome completo del firmatario autorizzato',
    },
    signerInfoStep: {
        signerInfo: 'Informazioni sul firmatario',
        areYouDirector: ({companyName}: CompanyNameParams) => `Sei un dirigente presso ${companyName}?`,
        regulationRequiresUs: 'I regolamenti ci impongono di verificare che il firmatario abbia l’autorità per intraprendere questa azione per conto dell’azienda.',
        whatsYourName: 'Qual è il tuo nome legale',
        fullName: 'Nome legale completo',
        whatsYourJobTitle: 'Qual è il tuo titolo di lavoro?',
        jobTitle: 'Titolo di lavoro',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        uploadID: 'Carica documento d’identità e prova di indirizzo',
        personalAddress: 'Prova di indirizzo personale (ad es. bolletta di un’utenza)',
        letsDoubleCheck: 'Facciamo un ultimo controllo per assicurarci che sia tutto corretto.',
        legalName: 'Nome legale',
        proofOf: 'Prova dell’indirizzo personale',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Inserisci l'email di un dirigente di ${companyName}`,
        regulationRequiresOneMoreDirector: 'La normativa richiede almeno un altro amministratore come firmatario.',
        hangTight: 'Resisti ancora un attimo...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Inserisci le email di due direttori di ${companyName}`,
        sendReminder: 'Invia un promemoria',
        chooseFile: 'Scegli file',
        weAreWaiting: 'Stiamo aspettando che altri verifichino la loro identità come direttori dell’azienda.',
        id: 'Copia del documento d’identità',
        proofOfDirectors: 'Prova del/dei direttore/i',
        proofOfDirectorsDescription: 'Esempi: Profilo aziendale Oncorp o Registrazione dell’azienda.',
        codiceFiscale: 'Codice fiscale',
        codiceFiscaleDescription: 'Codice Fiscale per Firmatari, Utenti Autorizzati e Titolari Effettivi.',
        PDSandFSG: 'Documenti di divulgazione PDS + FSG',
        PDSandFSGDescription: dedent(`
            La nostra partnership con Corpay utilizza una connessione API per sfruttare la loro vasta rete di partner bancari internazionali e alimentare i Rimborsi Globali in Expensify. In conformità alla normativa australiana, ti forniamo la Financial Services Guide (FSG) e il Product Disclosure Statement (PDS) di Corpay.

            Leggi attentamente i documenti FSG e PDS, poiché contengono tutti i dettagli e le informazioni importanti sui prodotti e servizi offerti da Corpay. Conserva questi documenti per consultazioni future.
        `),
        pleaseUpload: 'Carica qui sotto ulteriore documentazione per aiutarci a verificare la tua identità come amministratore dell’azienda.',
        enterSignerInfo: 'Inserisci le informazioni del firmatario',
        thisStep: 'Questo passaggio è stato completato',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `sta collegando un conto bancario aziendale in ${currency} che termina con ${bankAccountLastFour} a Expensify per pagare i dipendenti in ${currency}. Il prossimo passaggio richiede le informazioni del firmatario da un direttore.`,
        error: {
            emailsMustBeDifferent: 'Le email devono essere diverse',
        },
    },
    agreementsStep: {
        agreements: 'Accordi',
        pleaseConfirm: 'Conferma gli accordi qui sotto',
        regulationRequiresUs: 'La normativa ci impone di verificare l’identità di chiunque possieda più del 25% dell’azienda.',
        iAmAuthorized: 'Sono autorizzato a usare il conto bancario aziendale per le spese aziendali.',
        iCertify: 'Dichiaro che le informazioni fornite sono vere e accurate.',
        iAcceptTheTermsAndConditions: `Accetto i <a href="https://cross-border.corpay.com/tc/">termini e condizioni</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Accetto i termini e le condizioni.',
        accept: 'Accetta e aggiungi conto bancario',
        iConsentToThePrivacyNotice: 'Acconsento all’<a href="https://payments.corpay.com/compliance">informativa sulla privacy</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Acconsento all’informativa sulla privacy.',
        error: {
            authorized: 'Devi essere un responsabile autorizzato a operare sul conto bancario aziendale',
            certify: 'Si prega di certificare che le informazioni sono vere e accurate',
            consent: 'Acconsenti all’informativa sulla privacy',
        },
    },
    docusignStep: {
        subheader: 'Modulo Docusign',
        pleaseComplete:
            'Completa il modulo di autorizzazione ACH utilizzando il link Docusign qui sotto e poi carica qui la copia firmata, così potremo prelevare i fondi direttamente dal tuo conto bancario',
        pleaseCompleteTheBusinessAccount: 'Completa l’Accordo di Addebito Diretto per la Domanda di Conto Business',
        pleaseCompleteTheDirect:
            'Completa l’Accordo di Addebito Diretto utilizzando il link Docusign qui sotto e carica qui la copia firmata, così potremo prelevare i fondi direttamente dal tuo conto bancario.',
        takeMeTo: 'Portami a DocuSign',
        uploadAdditional: 'Carica documentazione aggiuntiva',
        pleaseUpload: 'Carica il modulo DEFT e la pagina della firma Docusign',
        pleaseUploadTheDirect: 'Carica per favore gli Accordi di Addebito Diretto e la pagina della firma DocuSign',
    },
    finishStep: {
        letsFinish: 'Finiamo in chat!',
        thanksFor:
            'Grazie per queste informazioni. Un agente di supporto dedicato esaminerà ora i tuoi dati. Ti ricontatteremo se avremo bisogno di altro da parte tua ma, nel frattempo, non esitare a contattarci per qualsiasi domanda.',
        iHaveA: 'Ho una domanda',
        enable2FA: 'Abilita l’autenticazione a due fattori (2FA) per prevenire le frodi',
        weTake: 'Prendiamo molto sul serio la tua sicurezza. Imposta ora la 2FA per aggiungere un ulteriore livello di protezione al tuo account.',
        secure: 'Proteggi il tuo account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Un momento',
        explanationLine: 'Stiamo esaminando le tue informazioni. Potrai procedere con i prossimi passaggi a breve.',
    },
    session: {
        offlineMessageRetry: 'Sembra che tu sia offline. Controlla la connessione e riprova.',
    },
    travel: {
        header: 'Prenota viaggio',
        title: 'Viaggia in modo intelligente',
        subtitle: 'Usa Expensify Travel per ottenere le migliori offerte di viaggio e gestire tutte le tue spese di lavoro in un unico posto.',
        features: {
            saveMoney: 'Risparmia denaro sulle tue prenotazioni',
            alerts: 'Ricevi aggiornamenti e avvisi in tempo reale',
        },
        bookTravel: 'Prenota viaggio',
        bookDemo: 'Prenota demo',
        bookADemo: 'Prenota una demo',
        toLearnMore: 'per saperne di più.',
        termsAndConditions: {
            header: 'Prima di continuare...',
            title: 'Termini e condizioni',
            label: 'Accetto i termini e le condizioni',
            subtitle: `Accetta i <a href="${CONST.TRAVEL_TERMS_URL}">termini e condizioni</a> di Expensify Travel.`,
            error: 'Devi accettare i termini e le condizioni di Expensify Travel per continuare',
            defaultWorkspaceError:
                'Devi impostare uno spazio di lavoro predefinito per abilitare Expensify Travel. Vai su Impostazioni > Spazi di lavoro > clicca sui tre puntini verticali accanto a uno spazio di lavoro > Imposta come spazio di lavoro predefinito, quindi riprova!',
        },
        flight: 'Volo',
        flightDetails: {
            passenger: 'Passeggero',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Hai uno <strong>scalo di ${layover}</strong> prima di questo volo</muted-text-label>`,
            takeOff: 'Decollo',
            landing: 'Pagina iniziale',
            seat: 'Posto',
            class: 'Classe cabina',
            recordLocator: 'Localizzatore record',
            cabinClasses: {
                unknown: 'Sconosciuto',
                economy: 'Economia',
                premiumEconomy: 'Premium Economy',
                business: 'Business',
                first: 'Primo',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Ospite',
            checkIn: 'Registrazione',
            checkOut: 'Check-out',
            roomType: 'Tipo di camera',
            cancellation: 'Politica di cancellazione',
            cancellationUntil: 'Cancellazione gratuita fino al',
            confirmation: 'Numero di conferma',
            cancellationPolicies: {
                unknown: 'Sconosciuto',
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
        train: 'Treno',
        trainDetails: {
            passenger: 'Passeggero',
            departs: 'Partenza',
            arrives: 'Arriva',
            coachNumber: 'Numero di carrozza',
            seat: 'Posto',
            fareDetails: 'Dettagli corsa',
            confirmation: 'Numero di conferma',
        },
        viewTrip: 'Visualizza viaggio',
        modifyTrip: 'Modifica viaggio',
        tripSupport: 'Assistenza viaggio',
        tripDetails: 'Dettagli del viaggio',
        viewTripDetails: 'Visualizza dettagli del viaggio',
        trip: 'Viaggio',
        trips: 'Viaggi',
        tripSummary: 'Riepilogo viaggio',
        departs: 'Partenza',
        errorMessage: 'Qualcosa è andato storto. Riprova più tardi.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr><a href="${phoneErrorMethodsRoute}">Aggiungi un'email di lavoro come accesso principale</a> per prenotare i viaggi.</rbr>`,
        domainSelector: {
            title: 'Dominio',
            subtitle: 'Scegli un dominio per la configurazione di Expensify Travel.',
            recommended: 'Consigliato',
        },
        domainPermissionInfo: {
            title: 'Dominio',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) =>
                `Non hai l'autorizzazione per abilitare Expensify Travel per il dominio <strong>${domain}</strong>. Dovrai chiedere a qualcuno di quel dominio di abilitare Travel al posto tuo.`,
            accountantInvitation: `Se sei un contabile, valuta di unirti al <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">programma per contabili ExpensifyApproved!</a> per abilitare i viaggi per questo dominio.`,
        },
        publicDomainError: {
            title: 'Inizia con Expensify Travel',
            message: `Dovrai utilizzare la tua email di lavoro (ad es. nome@company.com) con Expensify Travel, non la tua email personale (ad es. nome@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel è stato disabilitato',
            message: `Il tuo amministratore ha disattivato Expensify Travel. Segui l’informativa della tua azienda per le prenotazioni di viaggio.`,
        },
        verifyCompany: {
            title: 'Stiamo esaminando la tua richiesta...',
            message: `Stiamo effettuando alcuni controlli da parte nostra per verificare che il tuo account sia pronto per Expensify Travel. Ti ricontatteremo a breve!`,
            confirmText: 'Ho capito',
            conciergeMessage: ({domain}: {domain: string}) => `Abilitazione dei viaggi non riuscita per il dominio: ${domain}. Verifica e abilita i viaggi per questo dominio.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Il tuo volo ${airlineCode} (${origin} → ${destination}) per il ${startDate} è stato prenotato. Codice di conferma: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Il tuo biglietto per il volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato annullato.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Il tuo biglietto per il volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato rimborsato o cambiato.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Il tuo volo ${airlineCode} (${origin} → ${destination}) del ${startDate}} è stato cancellato dalla compagnia aerea.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) => `La compagnia aerea ha proposto una modifica dell’orario per il volo ${airlineCode}; siamo in attesa di conferma.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Cambio di orario confermato: il volo ${airlineCode} ora parte alle ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Il tuo volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato aggiornato.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `La tua classe di cabina è stata aggiornata a ${cabinClass} sul volo ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `La tua assegnazione del posto sul volo ${airlineCode} è stata confermata.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `La tua assegnazione del posto sul volo ${airlineCode} è stata modificata.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `La tua assegnazione del posto sul volo ${airlineCode} è stata rimossa.`,
            paymentDeclined: 'Pagamento per la tua prenotazione aerea non riuscito. Riprova.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Hai annullato la tua prenotazione ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Il fornitore ha annullato la tua prenotazione di ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `La tua prenotazione ${type} è stata nuovamente effettuata. Nuovo numero di conferma: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `La tua prenotazione di ${type} è stata aggiornata. Controlla i nuovi dettagli nell’itinerario.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Il tuo biglietto del treno da ${origin} → ${destination} del ${startDate} è stato rimborsato. Un accredito verrà elaborato.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Il tuo biglietto ferroviario per ${origin} → ${destination} del ${startDate} è stato cambiato.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Il tuo biglietto ferroviario per ${origin} → ${destination} del ${startDate} è stato aggiornato.`,
            defaultUpdate: ({type}: TravelTypeParams) => `La tua prenotazione ${type} è stata aggiornata.`,
        },
        flightTo: 'Volo per',
        trainTo: 'Treno per',
        carRental: 'noleggio auto',
        nightIn: 'notte in',
        nightsIn: 'notti in',
    },
    workspace: {
        common: {
            card: 'Carte',
            expensifyCard: 'Carta Expensify',
            companyCards: 'Carte aziendali',
            workflows: 'Flussi di lavoro',
            workspace: 'Spazio di lavoro',
            findWorkspace: 'Trova spazio di lavoro',
            edit: 'Modifica spazio di lavoro',
            enabled: 'Abilitato',
            disabled: 'Disabilitato',
            everyone: 'Tutti',
            delete: 'Elimina spazio di lavoro',
            settings: 'Impostazioni',
            reimburse: 'Rimborsi',
            categories: 'Categorie',
            tags: 'Tag',
            customField1: 'Campo personalizzato 1',
            customField2: 'Campo personalizzato 2',
            customFieldHint: 'Aggiungi una codifica personalizzata che si applica a tutte le spese di questo membro.',
            reports: 'Report',
            reportFields: 'Campi del report',
            reportTitle: 'Titolo del report',
            reportField: 'Campo rapporto',
            taxes: 'Tasse',
            bills: 'Fatture',
            invoices: 'Fatture',
            perDiem: 'Diaria',
            travel: 'Viaggio',
            members: 'Membri',
            accounting: 'Contabilità',
            receiptPartners: 'Partner per le ricevute',
            rules: 'Regole',
            displayedAs: 'Visualizzato come',
            plan: 'Piano',
            profile: 'Panoramica',
            bankAccount: 'Conto bancario',
            testTransactions: 'Transazioni di prova',
            issueAndManageCards: 'Emetti e gestisci carte',
            reconcileCards: 'Riconcilia carte',
            selectAll: 'Seleziona tutto',
            selected: () => ({
                one: '1 selezionato',
                other: (count: number) => `${count} selezionato`,
            }),
            settlementFrequency: 'Frequenza di liquidazione',
            setAsDefault: 'Imposta come workspace predefinito',
            defaultNote: `Le ricevute inviate a ${CONST.EMAIL.RECEIPTS} verranno visualizzate in questo workspace.`,
            deleteConfirmation: 'Sei sicuro di voler eliminare questo spazio di lavoro?',
            deleteWithCardsConfirmation: 'Sei sicuro di voler eliminare questo workspace? Questa azione rimuoverà tutti i flussi di carte e le carte assegnate.',
            unavailable: 'Spazio di lavoro non disponibile',
            memberNotFound: 'Membro non trovato. Per invitare un nuovo membro allo spazio di lavoro, utilizza il pulsante di invito qui sopra.',
            notAuthorized: `Non hai accesso a questa pagina. Se stai cercando di unirti a questo spazio di lavoro, chiedi semplicemente al proprietario dello spazio di lavoro di aggiungerti come membro. Qualcos'altro? Contatta ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Vai allo spazio di lavoro',
            duplicateWorkspace: 'Duplica spazio di lavoro',
            duplicateWorkspacePrefix: 'Duplicato',
            goToWorkspaces: 'Vai agli spazi di lavoro',
            clearFilter: 'Cancella filtro',
            workspaceName: "Nome dell'area di lavoro",
            workspaceOwner: 'Proprietario',
            workspaceType: 'Tipo di workspace',
            workspaceAvatar: 'Avatar spazio di lavoro',
            mustBeOnlineToViewMembers: 'Devi essere online per visualizzare i membri di questo workspace.',
            moreFeatures: 'Altre funzionalità',
            requested: 'Richiesto',
            distanceRates: 'Tariffe distanza',
            defaultDescription: 'Un unico posto per tutte le tue ricevute e spese.',
            descriptionHint: 'Condividi le informazioni su questo workspace con tutti i membri.',
            welcomeNote: 'Per favore usa Expensify per inviare le tue ricevute per il rimborso, grazie!',
            subscription: 'Abbonamento',
            markAsEntered: 'Segna come inserito manualmente',
            markAsExported: 'Segna come esportato',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Esporta in ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Controlliamo ancora una volta che sia tutto corretto.',
            lineItemLevel: 'A livello di voce di dettaglio',
            reportLevel: 'Livello report',
            topLevel: 'Livello principale',
            appliedOnExport: "Non importato in Expensify, applicato all'esportazione",
            shareNote: {
                header: 'Condividi il tuo spazio di lavoro con altri membri',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Condividi questo codice QR o copia il link sottostante per permettere facilmente ai membri di richiedere l’accesso al tuo spazio di lavoro. Tutte le richieste di adesione allo spazio di lavoro appariranno nella stanza <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> per la tua revisione.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Connetti a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Crea nuova connessione',
            reuseExistingConnection: 'Riutilizza connessione esistente',
            existingConnections: 'Connessioni esistenti',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Poiché in passato ti sei già connesso a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, puoi scegliere di riutilizzare una connessione esistente o crearne una nuova.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Ultima sincronizzazione ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Impossibile connettersi a ${connectionName} a causa di un errore di autenticazione.`,
            learnMore: 'Scopri di più',
            memberAlternateText: 'I membri possono inviare e approvare i report.',
            adminAlternateText: 'Gli amministratori hanno pieno accesso in modifica a tutti i report e alle impostazioni dello spazio di lavoro.',
            auditorAlternateText: 'I revisori possono visualizzare e commentare i report.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Amministratore';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Revisore';
                    case CONST.POLICY.ROLE.USER:
                        return 'Membro';
                    default:
                        return 'Membro';
                }
            },
            frequency: {
                manual: 'Manuale',
                instant: 'Istantanea',
                immediate: 'Giornaliero',
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
            deepDiveExpensifyCard: `<muted-text-label>Le transazioni della Expensify Card verranno esportate automaticamente in un "Conto di responsabilità Expensify Card" creato con <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">la nostra integrazione</a>.</muted-text-label>`,
        },
        receiptPartners: {
            connect: 'Connetti ora',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Connesso a ${organizationName}` : 'Automatizza le spese di viaggio e di consegna dei pasti in tutta la tua organizzazione.',
                sendInvites: 'Invia inviti',
                sendInvitesDescription:
                    'Questi membri dello spazio di lavoro non hanno ancora un account Uber for Business. Deseleziona i membri che non desideri invitare in questo momento.',
                confirmInvite: 'Conferma invito',
                manageInvites: 'Gestisci inviti',
                confirm: 'Conferma',
                allSet: 'Tutto pronto',
                readyToRoll: 'Sei pronto a partire',
                takeBusinessRideMessage: 'Fai una corsa di lavoro e le tue ricevute Uber verranno importate in Expensify. Sfreccia!',
                all: 'Tutti',
                linked: 'Collegato',
                outstanding: 'In sospeso',
                status: {
                    resend: 'Reinvia',
                    invite: 'Invita',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Collegato',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'In sospeso',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Sospeso',
                },
                centralBillingAccount: 'Account di fatturazione centralizzata',
                centralBillingDescription: 'Scegli dove importare tutte le ricevute Uber.',
                invitationFailure: 'Invito del membro a Uber for Business non riuscito',
                autoInvite: 'Invita nuovi membri dello spazio di lavoro a Uber for Business',
                autoRemove: 'Disattiva i membri rimossi dallo spazio di lavoro da Uber for Business',
                bannerTitle: 'Expensify + Uber for Business',
                bannerDescription: 'Collega Uber for Business per automatizzare le spese di viaggio e di consegna dei pasti in tutta la tua organizzazione.',
                emptyContent: {
                    title: 'Nessun invito in sospeso',
                    subtitle: 'Evviva! Abbiamo cercato ovunque e non abbiamo trovato alcun invito in sospeso.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Imposta le tariffe del per diem per controllare la spesa giornaliera dei dipendenti. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Scopri di più</a>.</muted-text>`,
            amount: 'Importo',
            deleteRates: () => ({
                one: 'Elimina tariffa',
                other: 'Elimina tariffe',
            }),
            deletePerDiemRate: 'Elimina tariffa diaria',
            findPerDiemRate: 'Trova indennità giornaliera',
            areYouSureDelete: () => ({
                one: 'Sei sicuro di voler eliminare questa tariffa?',
                other: 'Sei sicuro di voler eliminare queste tariffe?',
            }),
            emptyList: {
                title: 'Diaria',
                subtitle: 'Imposta tariffe di diaria per controllare la spesa giornaliera dei dipendenti. Importa le tariffe da un foglio di calcolo per iniziare.',
            },
            importPerDiemRates: 'Importa tariffe di diaria',
            editPerDiemRate: 'Modifica tariffa diaria',
            editPerDiemRates: 'Modifica le tariffe di diaria',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `L’aggiornamento di questa destinazione la modificherà per tutte le sottotariffe di diaria ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `L’aggiornamento di questa valuta la modificherà per tutte le sottotariffe di diaria ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Imposta come esportare in QuickBooks Desktop le spese anticipate di tasca propria.',
            exportOutOfPocketExpensesCheckToggle: 'Contrassegna gli assegni come “stampa in seguito”',
            exportDescription: 'Configura come i dati di Expensify vengono esportati in QuickBooks Desktop.',
            date: 'Data di esportazione',
            exportInvoices: 'Esporta fatture in',
            exportExpensifyCard: 'Esporta le transazioni della carta Expensify come',
            account: 'Account',
            accountDescription: 'Scegli dove registrare le scritture contabili.',
            accountsPayable: 'Conti da pagare',
            accountsPayableDescription: 'Scegli dove creare le fatture fornitore.',
            bankAccount: 'Conto bancario',
            notConfigured: 'Non configurato',
            bankAccountDescription: 'Scegli da dove inviare gli assegni.',
            creditCardAccount: 'Conto carta di credito',
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report in QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data dell’ultima spesa',
                        description: 'Data della spesa più recente nel report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato in QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: 'Data in cui il report è stato inviato per approvazione.',
                    },
                },
            },
            exportCheckDescription: 'Creeremo un assegno dettagliato per ogni report Expensify e lo invieremo dal conto bancario indicato di seguito.',
            exportJournalEntryDescription: 'Creeremo una scrittura contabile dettagliata per ogni report di Expensify e la registreremo sul conto sottostante.',
            exportVendorBillDescription:
                'Creeremo una fattura fornitore dettagliata per ogni report di Expensify e la aggiungeremo al conto qui sotto. Se questo periodo è chiuso, registreremo il movimento al 1º del successivo periodo aperto.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop non supporta le tasse nelle esportazioni delle registrazioni contabili. Poiché le tasse sono abilitate nel tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledError: 'Le registrazioni contabili non sono disponibili quando le imposte sono abilitate. Scegli un’altra opzione di esportazione.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carta di credito',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fattura fornitore',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Scrittura contabile',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controlla',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Creeremo un assegno dettagliato per ogni report Expensify e lo invieremo dal conto bancario indicato di seguito.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Abbineremo automaticamente il nome dell’esercente nella transazione con carta di credito ai fornitori corrispondenti in QuickBooks. Se non esistono fornitori, creeremo un fornitore “Credit Card Misc.” per l’associazione.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Creeremo una fattura fornitore dettagliata per ogni report Expensify con la data dell’ultima spesa e la aggiungeremo al conto qui sotto. Se questo periodo è chiuso, registreremo alla data del 1º del periodo aperto successivo.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Scegli dove esportare le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Scegli un fornitore da applicare a tutte le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Scegli da dove inviare gli assegni.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Le fatture fornitore non sono disponibili quando le sedi sono abilitate. Scegli un’altra opzione di esportazione.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Gli assegni non sono disponibili quando le sedi sono abilitate. Scegli un’altra opzione di esportazione.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Le registrazioni contabili non sono disponibili quando le imposte sono abilitate. Scegli un’altra opzione di esportazione.',
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: 'Aggiungi il conto in QuickBooks Desktop e sincronizza nuovamente la connessione',
            qbdSetup: 'Configurazione di QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Impossibile connettersi da questo dispositivo',
                body1: 'Dovrai configurare questa connessione dal computer che ospita il file aziendale di QuickBooks Desktop.',
                body2: 'Una volta connesso, potrai sincronizzare ed esportare da qualsiasi luogo.',
            },
            setupPage: {
                title: 'Apri questo link per connetterti',
                body: 'Per completare la configurazione, apri il seguente link sul computer in cui è in esecuzione QuickBooks Desktop.',
                setupErrorTitle: 'Qualcosa è andato storto',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>La connessione a QuickBooks Desktop non funziona al momento. Riprova più tardi oppure <a href="${conciergeLink}">contatta Concierge</a> se il problema persiste.</centered-text></muted-text>`,
            },
            importDescription: 'Scegli quali configurazioni di codifica importare da QuickBooks Desktop in Expensify.',
            classes: 'Classi',
            items: 'Elementi',
            customers: 'Clienti/progetti',
            exportCompanyCardsDescription: 'Imposta come esportare in QuickBooks Desktop gli acquisti effettuati con la carta aziendale.',
            defaultVendorDescription: 'Imposta un fornitore predefinito che verrà applicato a tutte le transazioni con carta di credito durante l’esportazione.',
            accountsDescription: 'Il tuo piano dei conti di QuickBooks Desktop verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli se importare i nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            classesDescription: 'Scegli come gestire le classi di QuickBooks Desktop in Expensify.',
            tagsDisplayedAsDescription: 'Livello della voce di dettaglio',
            reportFieldsDisplayedAsDescription: 'Livello report',
            customersDescription: 'Scegli come gestire i clienti/progetti di QuickBooks Desktop in Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con QuickBooks Desktop ogni giorno.',
                createEntities: 'Creazione automatica delle entità',
                createEntitiesDescription: 'Expensify creerà automaticamente i fornitori in QuickBooks Desktop se non esistono già.',
            },
            itemsDescription: 'Scegli come gestire gli articoli di QuickBooks Desktop in Expensify.',
            accountingMethods: {
                label: 'Quando esportare',
                description: 'Scegli quando esportare le spese:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Competenza',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contanti',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Le spese anticipate verranno esportate una volta approvate definitivamente',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Le spese anticipate verranno esportate al momento del pagamento',
                },
            },
        },
        qbo: {
            connectedTo: 'Connesso a',
            importDescription: 'Scegli quali configurazioni di codifica importare da QuickBooks Online in Expensify.',
            classes: 'Classi',
            locations: 'Sedi',
            customers: 'Clienti/progetti',
            accountsDescription: 'Il tuo piano dei conti di QuickBooks Online verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli se importare i nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            classesDescription: 'Scegli come gestire le classi di QuickBooks Online in Expensify.',
            customersDescription: 'Scegli come gestire i clienti/progetti QuickBooks Online in Expensify.',
            locationsDescription: 'Scegli come gestire le sedi di QuickBooks Online in Expensify.',
            taxesDescription: 'Scegli come gestire le imposte di QuickBooks Online in Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online non supporta le Località a livello di riga per Assegni o Fatture Fornitore. Se desideri avere le località a livello di riga, assicurati di utilizzare Registrazioni di Prima Nota e spese con Carta di Credito/Debito.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online non supporta le imposte sulle registrazioni contabili. Modifica l’opzione di esportazione in fattura fornitore o assegno.',
            exportDescription: 'Configura come i dati di Expensify vengono esportati in QuickBooks Online.',
            date: 'Data di esportazione',
            exportInvoices: 'Esporta fatture in',
            exportExpensifyCard: 'Esporta le transazioni della carta Expensify come',
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report in QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data dell’ultima spesa',
                        description: 'Data della spesa più recente nel report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato in QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: 'Data in cui il report è stato inviato per approvazione.',
                    },
                },
            },
            receivable: 'Crediti verso clienti', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archivio crediti verso clienti', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Usa questo conto quando esporti le fatture su QuickBooks Online.',
            exportCompanyCardsDescription: 'Imposta come le spese con carta aziendale vengono esportate in QuickBooks Online.',
            vendor: 'Fornitore',
            defaultVendorDescription: 'Imposta un fornitore predefinito che verrà applicato a tutte le transazioni con carta di credito durante l’esportazione.',
            exportOutOfPocketExpensesDescription: 'Imposta come esportare le spese anticipate su QuickBooks Online.',
            exportCheckDescription: 'Creeremo un assegno dettagliato per ogni report Expensify e lo invieremo dal conto bancario indicato di seguito.',
            exportJournalEntryDescription: 'Creeremo una scrittura contabile dettagliata per ogni report di Expensify e la registreremo sul conto sottostante.',
            exportVendorBillDescription:
                'Creeremo una fattura fornitore dettagliata per ogni report di Expensify e la aggiungeremo al conto qui sotto. Se questo periodo è chiuso, registreremo il movimento al 1º del successivo periodo aperto.',
            account: 'Account',
            accountDescription: 'Scegli dove registrare le scritture contabili.',
            accountsPayable: 'Conti da pagare',
            accountsPayableDescription: 'Scegli dove creare le fatture fornitore.',
            bankAccount: 'Conto bancario',
            notConfigured: 'Non configurato',
            bankAccountDescription: 'Scegli da dove inviare gli assegni.',
            creditCardAccount: 'Conto carta di credito',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online non supporta le sedi nelle esportazioni delle note spese fornitore. Poiché le sedi sono abilitate nel tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online non supporta le imposte nelle esportazioni delle registrazioni contabili. Poiché hai le imposte abilitate nel tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledError: 'Le registrazioni contabili non sono disponibili quando le imposte sono abilitate. Scegli un’altra opzione di esportazione.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con QuickBooks Online ogni giorno.',
                inviteEmployees: 'Invita dipendenti',
                inviteEmployeesDescription: 'Importa i registri dei dipendenti da QuickBooks Online e invita i dipendenti a questo spazio di lavoro.',
                createEntities: 'Creazione automatica delle entità',
                createEntitiesDescription:
                    'Expensify creerà automaticamente i fornitori in QuickBooks Online se non esistono già e creerà automaticamente i clienti durante l’esportazione delle fatture.',
                reimbursedReportsDescription:
                    'Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura verrà creato nell’account QuickBooks Online qui sotto.',
                qboBillPaymentAccount: 'Conto di pagamento fatture QuickBooks',
                qboInvoiceCollectionAccount: 'Conto incassi fatture QuickBooks',
                accountSelectDescription: 'Scegli da dove pagare le fatture e creeremo il pagamento in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Scegli dove ricevere i pagamenti delle fatture e noi creeremo il pagamento in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Carta di debito',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carta di credito',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fattura fornitore',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Scrittura contabile',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controlla',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Assoceremo automaticamente il nome dell’esercente della transazione con carta di debito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore "Spese misc. carta di debito" per l’associazione.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Abbineremo automaticamente il nome dell’esercente nella transazione con carta di credito ai fornitori corrispondenti in QuickBooks. Se non esistono fornitori, creeremo un fornitore “Credit Card Misc.” per l’associazione.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Creeremo una fattura fornitore dettagliata per ogni report Expensify con la data dell’ultima spesa e la aggiungeremo al conto qui sotto. Se questo periodo è chiuso, registreremo alla data del 1º del periodo aperto successivo.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Scegli dove esportare le transazioni della carta di debito.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Scegli dove esportare le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Scegli un fornitore da applicare a tutte le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Le fatture fornitore non sono disponibili quando le sedi sono abilitate. Scegli un’altra opzione di esportazione.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Gli assegni non sono disponibili quando le sedi sono abilitate. Scegli un’altra opzione di esportazione.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Le registrazioni contabili non sono disponibili quando le imposte sono abilitate. Scegli un’altra opzione di esportazione.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Scegli un conto valido per l’esportazione delle fatture fornitore',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Scegli un conto valido per l’esportazione della registrazione contabile',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: "Scegli un conto valido per l'esportazione degli assegni",
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]:
                    'Per utilizzare l’esportazione delle fatture fornitore, configura un conto di contabilità fornitori in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Per utilizzare l’esportazione delle registrazioni contabili, configura un conto giornale in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Per utilizzare l’esportazione degli assegni, configura un conto bancario in QuickBooks Online',
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: 'Aggiungi il conto in QuickBooks Online e sincronizza di nuovo la connessione.',
            accountingMethods: {
                label: 'Quando esportare',
                description: 'Scegli quando esportare le spese:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Competenza',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contanti',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Le spese anticipate verranno esportate una volta approvate definitivamente',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Le spese anticipate verranno esportate al momento del pagamento',
                },
            },
        },
        workspaceList: {
            joinNow: 'Iscriviti ora',
            askToJoin: 'Richiedi di partecipare',
        },
        xero: {
            organization: 'Organizzazione Xero',
            organizationDescription: 'Scegli l’organizzazione Xero da cui desideri importare i dati.',
            importDescription: 'Scegli quali configurazioni di codifica importare da Xero in Expensify.',
            accountsDescription: 'Il tuo piano dei conti Xero verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli se importare i nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            trackingCategories: 'Categorie di tracciamento',
            trackingCategoriesDescription: 'Scegli come gestire le categorie di tracciamento Xero in Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mappa ${categoryName} di Xero a`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Scegli dove mappare ${categoryName} durante l’esportazione in Xero.`,
            customers: 'Riaddebita ai clienti',
            customersDescription:
                'Scegli se rifatturare i clienti in Expensify. I contatti cliente di Xero possono essere associati alle spese e verranno esportati in Xero come fattura di vendita.',
            taxesDescription: 'Scegli come gestire le imposte Xero in Expensify.',
            notImported: 'Non importato',
            notConfigured: 'Non configurato',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contatto predefinito Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tag',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Campi del report',
            },
            exportDescription: 'Configura come i dati di Expensify vengono esportati in Xero.',
            purchaseBill: 'Acquista fattura',
            exportDeepDiveCompanyCard:
                'Le note spese esportate verranno registrate come transazioni bancarie sul conto bancario Xero riportato di seguito e le date delle transazioni corrisponderanno alle date del tuo estratto conto bancario.',
            bankTransactions: 'Transazioni bancarie',
            xeroBankAccount: 'Conto bancario Xero',
            xeroBankAccountDescription: 'Scegli dove verranno registrate le spese come transazioni bancarie.',
            exportExpensesDescription: 'I report verranno esportati come fatture di acquisto con la data e lo stato selezionati di seguito.',
            purchaseBillDate: 'Data fattura di acquisto',
            exportInvoices: 'Esporta fatture come',
            salesInvoice: 'Fattura di vendita',
            exportInvoicesDescription: 'Le fatture di vendita mostrano sempre la data in cui la fattura è stata inviata.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con Xero ogni giorno.',
                purchaseBillStatusTitle: "Stato della fattura d'acquisto",
                reimbursedReportsDescription: 'Ogni volta che un report viene pagato tramite Expensify ACH, il relativo pagamento della fattura verrà creato nell’account Xero sottostante.',
                xeroBillPaymentAccount: 'Conto di pagamento fatture Xero',
                xeroInvoiceCollectionAccount: 'Conto incassi fatture Xero',
                xeroBillPaymentAccountDescription: 'Scegli da dove pagare le fatture e creeremo il pagamento in Xero.',
                invoiceAccountSelectorDescription: 'Scegli dove ricevere i pagamenti delle fatture e creeremo il pagamento in Xero.',
            },
            exportDate: {
                label: 'Data fattura di acquisto',
                description: 'Usa questa data quando esporti i report su Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data dell’ultima spesa',
                        description: 'Data della spesa più recente nel report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato in Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: 'Data in cui il report è stato inviato per approvazione.',
                    },
                },
            },
            invoiceStatus: {
                label: "Stato della fattura d'acquisto",
                description: 'Usa questo stato quando esporti le note di acquisto su Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Bozza',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'In attesa di approvazione',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'In attesa di pagamento',
                },
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: 'Aggiungi l’account in Xero e sincronizza nuovamente la connessione',
            accountingMethods: {
                label: 'Quando esportare',
                description: 'Scegli quando esportare le spese:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Competenza',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contanti',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Le spese anticipate verranno esportate una volta approvate definitivamente',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Le spese anticipate verranno esportate al momento del pagamento',
                },
            },
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
                        label: 'Data dell’ultima spesa',
                        description: 'Data della spesa più recente nel report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato in Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data di invio',
                        description: 'Data in cui il report è stato inviato per approvazione.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Imposta come esportare in Sage Intacct le spese anticipate di tasca propria.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Note spese',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Fatture fornitore',
                },
            },
            nonReimbursableExpenses: {
                description: 'Imposta come le spese con carta aziendale vengono esportate in Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Carte di credito',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Fatture fornitore',
                },
            },
            creditCardAccount: 'Conto carta di credito',
            defaultVendor: 'Fornitore predefinito',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Imposta un fornitore predefinito che verrà applicato alle ${isReimbursable ? '' : 'non-'}spese rimborsabili che non hanno un fornitore corrispondente in Sage Intacct.`,
            exportDescription: 'Configura come i dati di Expensify vengono esportati in Sage Intacct.',
            exportPreferredExporterNote:
                'L’esportatore preferito può essere qualsiasi amministratore dello spazio di lavoro, ma deve anche essere un Amministratore di Dominio se imposti conti di esportazione diversi per le singole carte aziendali nelle Impostazioni di Dominio.',
            exportPreferredExporterSubNote: 'Una volta impostato, l’esportatore preferito vedrà i report da esportare nel proprio account.',
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: `Aggiungi l’account in Sage Intacct e sincronizza nuovamente la connessione`,
            autoSync: 'Sincronizzazione automatica',
            autoSyncDescription: 'Expensify si sincronizzerà automaticamente con Sage Intacct ogni giorno.',
            inviteEmployees: 'Invita dipendenti',
            inviteEmployeesDescription:
                'Importa i registri dei dipendenti da Sage Intacct e invita i dipendenti a questo spazio di lavoro. Il tuo flusso di approvazione predefinito sarà l’approvazione da parte del responsabile e potrà essere ulteriormente configurato nella pagina Membri.',
            syncReimbursedReports: 'Sincronizza report rimborsati',
            syncReimbursedReportsDescription:
                'Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura sarà creato nel conto Sage Intacct qui sotto.',
            paymentAccount: 'Conto di pagamento Sage Intacct',
            accountingMethods: {
                label: 'Quando esportare',
                description: 'Scegli quando esportare le spese:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Competenza',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contanti',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Le spese anticipate verranno esportate una volta approvate definitivamente',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Le spese anticipate verranno esportate al momento del pagamento',
                },
            },
        },
        netsuite: {
            subsidiary: 'Sussidiaria',
            subsidiarySelectDescription: 'Scegli la consociata in NetSuite da cui desideri importare i dati.',
            exportDescription: 'Configura come i dati di Expensify vengono esportati in NetSuite.',
            exportInvoices: 'Esporta fatture in',
            journalEntriesTaxPostingAccount: 'Conto imposte per registrazioni contabili',
            journalEntriesProvTaxPostingAccount: "Conto di registrazione dell'imposta provinciale per le scritture contabili",
            foreignCurrencyAmount: 'Esporta importo in valuta estera',
            exportToNextOpenPeriod: 'Esporta al prossimo periodo aperto',
            nonReimbursableJournalPostingAccount: 'Conto di registrazione per scritture non rimborsabili',
            reimbursableJournalPostingAccount: 'Conto per la registrazione contabile dei rimborsabili',
            journalPostingPreference: {
                label: 'Preferenza di registrazione delle scritture contabili',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Voce singola, dettagliata, per ogni report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Voce singola per ogni spesa',
                },
            },
            invoiceItem: {
                label: 'Voce fattura',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Creane uno per me',
                        description: 'Creeremo una “voce di riga fattura Expensify” per te al momento dell’esportazione (se non ne esiste già una).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Seleziona esistente',
                        description: 'Assoceremo le fatture da Expensify all’elemento selezionato qui sotto.',
                    },
                },
            },
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report su NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data dell’ultima spesa',
                        description: 'Data della spesa più recente nel report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato in NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data di invio',
                        description: 'Data in cui il report è stato inviato per approvazione.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Note spese',
                        reimbursableDescription: 'Le spese anticipate verranno esportate come note spese in NetSuite.',
                        nonReimbursableDescription: 'Le spese con carta aziendale verranno esportate come note spese in NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Fatture fornitore',
                        reimbursableDescription: dedent(`
                            Le spese anticipate verranno esportate come fatture pagabili al fornitore NetSuite specificato di seguito.

                            Se desideri impostare un fornitore specifico per ciascuna carta, vai su *Impostazioni > Domini > Carte aziendali*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Le spese con carta aziendale verranno esportate come fatture pagabili al fornitore NetSuite specificato di seguito.

                            Se desideri impostare un fornitore specifico per ogni carta, vai su *Impostazioni > Domini > Carte aziendali*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Registrazioni contabili',
                        reimbursableDescription: dedent(`
                            Le spese fuori tasca verranno esportate come registrazioni contabili sul conto NetSuite specificato di seguito.

                            Se desideri impostare un fornitore specifico per ogni carta, vai su *Impostazioni > Domini > Carte aziendali*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Le spese con carta aziendale saranno esportate come registrazioni contabili sul conto NetSuite specificato di seguito.

                            Se desideri impostare un fornitore specifico per ciascuna carta, vai su *Impostazioni > Domini > Carte aziendali*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Se modifichi l’impostazione di esportazione della carta aziendale su note spese, i fornitori NetSuite e i conti di registrazione per le singole carte verranno disabilitati.\n\nNon preoccuparti, salveremo comunque le tue selezioni precedenti nel caso in cui tu voglia tornare indietro in seguito.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con NetSuite ogni giorno.',
                reimbursedReportsDescription:
                    'Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura verrà creato nell’account NetSuite qui sotto.',
                reimbursementsAccount: 'Conto rimborsi',
                reimbursementsAccountDescription: 'Scegli il conto bancario che utilizzerai per i rimborsi e creeremo il relativo pagamento in NetSuite.',
                collectionsAccount: 'Conto di riscossione',
                collectionsAccountDescription: 'Una volta che una fattura è contrassegnata come pagata in Expensify ed esportata in NetSuite, verrà visualizzata sul conto seguente.',
                approvalAccount: 'Conto di approvazione A/P',
                approvalAccountDescription:
                    'Scegli il conto su cui verranno approvate le transazioni in NetSuite. Se stai sincronizzando i report rimborsati, questo è anche il conto su cui verranno creati i pagamenti delle fatture.',
                defaultApprovalAccount: 'Predefinito NetSuite',
                inviteEmployees: 'Invita i dipendenti e imposta le approvazioni',
                inviteEmployeesDescription:
                    'Importa i registri dei dipendenti NetSuite e invita i dipendenti a questo workspace. Il tuo flusso di approvazione sarà impostato di default sull’approvazione del manager e potrà essere ulteriormente configurato nella pagina *Membri*.',
                autoCreateEntities: 'Crea automaticamente dipendenti/fornitori',
                enableCategories: 'Abilita le categorie appena importate',
                customFormID: 'ID modulo personalizzato',
                customFormIDDescription:
                    'Per impostazione predefinita, Expensify creerà le registrazioni utilizzando il modulo di transazione preferito impostato in NetSuite. In alternativa, puoi indicare un modulo di transazione specifico da utilizzare.',
                customFormIDReimbursable: 'Spesa fuori tasca',
                customFormIDNonReimbursable: 'Spesa con carta aziendale',
                exportReportsTo: {
                    label: 'Livello di approvazione del rapporto di spesa',
                    description:
                        'Una volta che un report spese è approvato in Expensify ed esportato in NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Preferenza predefinita NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Solo approvati dal supervisore',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Solo contabilità approvata',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Approvato da supervisore e contabilità',
                    },
                },
                accountingMethods: {
                    label: 'Quando esportare',
                    description: 'Scegli quando esportare le spese:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Competenza',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contanti',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Le spese anticipate verranno esportate una volta approvate definitivamente',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Le spese anticipate verranno esportate al momento del pagamento',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Livello di approvazione della fattura fornitore',
                    description:
                        'Una volta che una fattura del fornitore è stata approvata in Expensify ed esportata in NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Preferenza predefinita NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Approvazione in sospeso',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Approvato per la pubblicazione',
                    },
                },
                exportJournalsTo: {
                    label: 'Livello di approvazione della registrazione contabile',
                    description:
                        'Dopo che una registrazione contabile è stata approvata in Expensify ed esportata in NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della contabilizzazione.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Preferenza predefinita NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Approvazione in sospeso',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Approvato per la pubblicazione',
                    },
                },
                error: {
                    customFormID: 'Inserisci un ID numerico valido per il modulo personalizzato',
                },
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: 'Aggiungi l’account in NetSuite e sincronizza nuovamente la connessione',
            noVendorsFound: 'Nessun fornitore trovato',
            noVendorsFoundDescription: 'Aggiungi i fornitori in NetSuite e sincronizza nuovamente la connessione',
            noItemsFound: 'Nessuna voce di fattura trovata',
            noItemsFoundDescription: 'Aggiungi le voci della fattura in NetSuite e sincronizza nuovamente la connessione',
            noSubsidiariesFound: 'Nessuna consociata trovata',
            noSubsidiariesFoundDescription: 'Aggiungi una controllata in NetSuite e sincronizza nuovamente la connessione',
            tokenInput: {
                title: 'Configurazione NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Installa il bundle di Expensify',
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
                            'In NetSuite, vai su *Setup > Users/Roles > Access Tokens* > crea un token di accesso per l\'app "Expensify" e per il ruolo "Expensify Integration" o "Administrator".\n\n*Importante:* Assicurati di salvare il *Token ID* e il *Token Secret* di questo passaggio. Ti serviranno per il passaggio successivo.',
                    },
                    enterCredentials: {
                        title: 'Inserisci le tue credenziali NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID account NetSuite',
                            netSuiteTokenID: 'ID token',
                            netSuiteTokenSecret: 'Segreto del token',
                        },
                        netSuiteAccountIDDescription: 'In NetSuite, vai su *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Categorie di spesa',
                expenseCategoriesDescription: 'Le tue categorie di spesa NetSuite verranno importate in Expensify come categorie.',
                crossSubsidiaryCustomers: 'Clienti/progetti tra consociate',
                importFields: {
                    departments: {
                        title: 'Reparti',
                        subtitle: 'Scegli come gestire i *departments* di NetSuite in Expensify.',
                    },
                    classes: {
                        title: 'Classi',
                        subtitle: 'Scegli come gestire le *classi* in Expensify.',
                    },
                    locations: {
                        title: 'Sedi',
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
                importTaxDescription: 'Importa i gruppi fiscali da NetSuite.',
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
                            scriptID: 'ID script',
                            customRecordScriptID: 'ID colonna transazione',
                            mapping: 'Visualizzato come',
                        },
                        removeTitle: 'Rimuovi segmento/record personalizzato',
                        removePrompt: 'Sei sicuro di voler rimuovere questo segmento/record personalizzato?',
                        addForm: {
                            customSegmentName: 'nome segmento personalizzato',
                            customRecordName: 'nome record personalizzato',
                            segmentTitle: 'Segmento personalizzato',
                            customSegmentAddTitle: 'Aggiungi segmento personalizzato',
                            customRecordAddTitle: 'Aggiungi record personalizzato',
                            recordTitle: 'Record personalizzato',
                            segmentRecordType: 'Vuoi aggiungere un segmento personalizzato o un record personalizzato?',
                            customSegmentNameTitle: 'Qual è il nome del segmento personalizzato?',
                            customRecordNameTitle: 'Qual è il nome del record personalizzato?',
                            customSegmentNameFooter: `Puoi trovare i nomi dei segmenti personalizzati in NetSuite nella pagina *Customizations > Links, Records & Fields > Custom Segments*.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Puoi trovare i nomi dei record personalizzati in NetSuite inserendo "Transaction Column Field" nella ricerca globale.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "Qual è l'ID interno?",
                            customSegmentInternalIDFooter: `Per prima cosa, assicurati di aver abilitato gli ID interni in NetSuite in *Home > Set Preferences > Show Internal ID.*

Puoi trovare gli ID interni dei segmenti personalizzati in NetSuite in:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Fai clic su un segmento personalizzato.
3. Fai clic sul collegamento ipertestuale accanto a *Custom Record Type*.
4. Trova l’ID interno nella tabella in fondo.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Puoi trovare gli ID interni dei record personalizzati in NetSuite seguendo questi passaggi:

1. Inserisci "Transaction Line Fields" nella ricerca globale.
2. Fai clic su un record personalizzato.
3. Trova l’ID interno sul lato sinistro.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Qual è l’ID dello script?',
                            customSegmentScriptIDFooter: `Puoi trovare gli script ID dei segmenti personalizzati in NetSuite in:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Fai clic su un segmento personalizzato.
3. Fai clic sulla scheda *Application and Sourcing* vicino al fondo, quindi:
    a. Se vuoi visualizzare il segmento personalizzato come *tag* (a livello di riga) in Expensify, fai clic sulla sotto-scheda *Transaction Columns* e utilizza il *Field ID*.
    b. Se vuoi visualizzare il segmento personalizzato come *report field* (a livello di report) in Expensify, fai clic sulla sotto-scheda *Transactions* e utilizza il *Field ID*.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "Qual è l'ID della colonna di transazione?",
                            customRecordScriptIDFooter: `Puoi trovare gli ID script dei record personalizzati in NetSuite in:

1. Inserisci "Transaction Line Fields" nella ricerca globale.
2. Fai clic su un record personalizzato.
3. Trova l’ID script sul lato sinistro.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
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
                        helpText: 'sulla configurazione di elenchi personalizzati.',
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
                            transactionFieldIDFooter: `Puoi trovare gli ID dei campi delle transazioni in NetSuite seguendo questi passaggi:

1. Inserisci "Transaction Line Fields" nella ricerca globale.
2. Fai clic su un elenco personalizzato.
3. Trova l'ID del campo della transazione sul lato sinistro.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Come dovrebbe essere visualizzato questo elenco personalizzato in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Esiste già un elenco personalizzato con questo ID di campo transazione`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Impostazione predefinita dipendente NetSuite',
                        description: "Non importato in Expensify, applicato all'esportazione",
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Se utilizzi ${importField} in NetSuite, applicheremo il valore predefinito impostato nella scheda del dipendente al momento dell’esportazione in Expense Report o Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tag',
                        description: 'A livello di voce di dettaglio',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} sarà selezionabile per ogni singola spesa nel report di un dipendente.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Campi del report',
                        description: 'Livello report',
                        footerContent: ({importField}: ImportFieldParams) => `La selezione ${startCase(importField)} verrà applicata a tutte le spese nel report di un dipendente.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configurazione Sage Intacct',
            prerequisitesTitle: 'Prima di connetterti...',
            downloadExpensifyPackage: 'Scarica il pacchetto Expensify per Sage Intacct',
            followSteps: 'Segui i passaggi nelle nostre istruzioni della guida “Come collegarsi a Sage Intacct”',
            enterCredentials: 'Inserisci le tue credenziali Sage Intacct',
            entity: 'Entità',
            employeeDefault: 'Impostazione predefinita dipendente Sage Intacct',
            employeeDefaultDescription: 'Il reparto predefinito del dipendente verrà applicato alle sue spese in Sage Intacct, se esistente.',
            displayedAsTagDescription: 'Il reparto sarà selezionabile per ogni singola spesa nel report di un dipendente.',
            displayedAsReportFieldDescription: 'La selezione del reparto verrà applicata a tutte le spese nel report di un dipendente.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Scegli come gestire <strong>${mappingTitle}</strong> di Sage Intacct in Expensify.`,
            expenseTypes: 'Tipi di spesa',
            expenseTypesDescription: 'I tuoi tipi di spesa Sage Intacct verranno importati in Expensify come categorie.',
            accountTypesDescription: 'Il tuo piano dei conti di Sage Intacct verrà importato in Expensify come categorie.',
            importTaxDescription: 'Importare aliquota dell’imposta sugli acquisti da Sage Intacct.',
            userDefinedDimensions: "Dimensioni definite dall'utente",
            addUserDefinedDimension: 'Aggiungi dimensione definita dall’utente',
            integrationName: 'Nome integrazione',
            dimensionExists: 'Esiste già una dimensione con questo nome.',
            removeDimension: 'Rimuovi dimensione definita dall’utente',
            removeDimensionPrompt: 'Sei sicuro di voler rimuovere questa dimensione definita dall’utente?',
            userDefinedDimension: 'Dimensione definita dall’utente',
            addAUserDefinedDimension: 'Aggiungi una dimensione definita dall’utente',
            detailedInstructionsLink: 'Visualizza istruzioni dettagliate',
            detailedInstructionsRestOfSentence: 'sull’aggiunta di dimensioni definite dall’utente.',
            userDimensionsAdded: () => ({
                one: '1 CCU aggiunta',
                other: (count: number) => `${count} UDD aggiunti`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'reparti';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classi';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'posizioni';
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
            free: 'Gratis',
            control: 'Controllo',
            collect: 'Raccogli',
        },
        companyCards: {
            addCards: 'Aggiungi carte',
            selectCards: 'Seleziona carte',
            addNewCard: {
                other: 'Altro',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Carte Commerciali Mastercard',
                    vcf: 'Carte Commerciali Visa',
                    stripe: 'Carte Stripe',
                },
                yourCardProvider: `Chi è l’emittente della tua carta?`,
                whoIsYourBankAccount: 'Qual è la tua banca?',
                whereIsYourBankLocated: 'Dove si trova la tua banca?',
                howDoYouWantToConnect: 'Come vuoi collegarti alla tua banca?',
                learnMoreAboutOptions: `<muted-text>Scopri di più su queste <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opzioni</a>.</muted-text>`,
                commercialFeedDetails:
                    'Richiede la configurazione con la tua banca. Questo metodo è generalmente utilizzato dalle aziende più grandi ed è spesso l’opzione migliore se ne hai i requisiti.',
                commercialFeedPlaidDetails: `Richiede la configurazione con la tua banca, ma ti guideremo noi. Di solito è limitato alle aziende più grandi.`,
                directFeedDetails: 'L’approccio più semplice. Connettiti subito utilizzando le tue credenziali master. Questo metodo è il più comune.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Abilita il tuo feed ${provider}`,
                    heading:
                        'Abbiamo un’integrazione diretta con l’emittente della tua carta e possiamo importare rapidamente e con precisione i tuoi dati di transazione in Expensify.\n\nPer iniziare, ti basta:',
                    visa: 'Abbiamo integrazioni globali con Visa, anche se l’idoneità varia in base alla banca e al programma della carta.\n\nPer iniziare, è sufficiente:',
                    mastercard: 'Abbiamo integrazioni globali con Mastercard, anche se l’idoneità varia in base alla banca e al programma della carta.\n\nPer iniziare, è sufficiente:',
                    vcf: `1. Visita [questo articolo della guida](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) per istruzioni dettagliate su come configurare le tue Visa Commercial Cards.

2. [Contatta la tua banca](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) per verificare che supporti un feed commerciale per il tuo programma e chiedi che venga abilitato.

3. *Una volta che il feed è stato abilitato e ne hai i dettagli, continua alla schermata successiva.*`,
                    gl1025: `1. Visita [questo articolo di assistenza](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) per scoprire se American Express può attivare un feed commerciale per il tuo programma.

2. Una volta che il feed è stato attivato, Amex ti invierà una lettera di produzione.

3. *Una volta che disponi delle informazioni sul feed, continua alla schermata successiva.*`,
                    cdf: `1. Visita [questo articolo della guida](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) per istruzioni dettagliate su come configurare le tue Mastercard Commercial Cards.

2. [Contatta la tua banca](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) per verificare che supporti un feed commerciale per il tuo programma e chiedi che lo abiliti.

3. *Una volta che il feed è stato abilitato e ne hai i dettagli, continua alla schermata successiva.*`,
                    stripe: `1. Visita la Dashboard di Stripe e vai su [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. In Product Integrations, fai clic su Enable accanto a Expensify.

3. Una volta abilitato il feed, fai clic su Submit qui sotto e ci occuperemo di aggiungerlo.`,
                },
                whatBankIssuesCard: 'Quale banca emette queste carte?',
                enterNameOfBank: 'Inserisci il nome della banca',
                feedDetails: {
                    vcf: {
                        title: 'Quali sono i dettagli del feed Visa?',
                        processorLabel: 'ID processore',
                        bankLabel: 'ID istituto finanziario (banca)',
                        companyLabel: 'ID azienda',
                        helpLabel: 'Dove posso trovare questi ID?',
                    },
                    gl1025: {
                        title: `Qual è il nome del file di consegna Amex?`,
                        fileNameLabel: 'Nome del file di consegna',
                        helpLabel: 'Dove posso trovare il nome del file di consegna?',
                    },
                    cdf: {
                        title: `Qual è l’ID di distribuzione Mastercard?`,
                        distributionLabel: 'ID distribuzione',
                        helpLabel: 'Dove posso trovare l’ID di distribuzione?',
                    },
                },
                amexCorporate: 'Seleziona questa opzione se sul fronte delle tue carte è presente la dicitura “Corporate”',
                amexBusiness: 'Seleziona questa opzione se sulla parte frontale delle tue carte è presente la dicitura “Business”',
                amexPersonal: 'Seleziona questa opzione se le tue carte sono personali',
                error: {
                    pleaseSelectProvider: 'Seleziona un fornitore di carte prima di continuare',
                    pleaseSelectBankAccount: 'Seleziona un conto bancario prima di continuare',
                    pleaseSelectBank: 'Seleziona una banca prima di continuare',
                    pleaseSelectCountry: 'Seleziona un paese prima di continuare',
                    pleaseSelectFeedType: 'Seleziona un tipo di feed prima di continuare',
                },
                exitModal: {
                    title: 'Qualcosa non funziona?',
                    prompt: 'Abbiamo notato che non hai finito di aggiungere le tue carte. Se hai riscontrato un problema, faccelo sapere così possiamo aiutarti a rimettere le cose in carreggiata.',
                    confirmText: 'Segnala problema',
                    cancelText: 'Salta',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Ultimo giorno del mese',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Ultimo giorno lavorativo del mese',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Giorno personalizzato del mese',
            },
            assignCard: 'Assegna carta',
            findCard: 'Trova carta',
            cardNumber: 'Numero carta',
            commercialFeed: 'Feed commerciale',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `Carte ${feedName}`,
            directFeed: 'Feed diretto',
            whoNeedsCardAssigned: 'Chi ha bisogno di una carta assegnata?',
            chooseCard: 'Scegli una carta',
            chooseCardFor: ({assignee}: AssigneeParams) =>
                `Scegli una carta per <strong>${assignee}</strong>. Non riesci a trovare la carta che stai cercando? <concierge-link>Facci sapere.</concierge-link>`,
            noActiveCards: 'Nessuna carta attiva in questo feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Oppure qualcosa potrebbe essere rotto. In ogni caso, se hai domande, <concierge-link>contatta Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Scegli una data di inizio transazione',
            startDateDescription: 'Importeremo tutte le transazioni a partire da questa data. Se non viene specificata alcuna data, risaliremo fino al limite consentito dalla tua banca.',
            fromTheBeginning: "Dall'inizio",
            customStartDate: 'Data di inizio personalizzata',
            customCloseDate: 'Data di chiusura personalizzata',
            letsDoubleCheck: 'Facciamo un ultimo controllo per assicurarci che sia tutto corretto.',
            confirmationDescription: 'Inizieremo immediatamente a importare le transazioni.',
            cardholder: 'Titolare della carta',
            card: 'Carta',
            cardName: 'Nome carta',
            brokenConnectionError: '<rbr>La connessione al feed della carta è interrotta. Per favore <a href="#">accedi alla tua banca</a> così possiamo ristabilire la connessione.</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `ha assegnato a ${assignee} un ${link}! Le transazioni importate appariranno in questa chat.`,
            companyCard: 'carta aziendale',
            chooseCardFeed: 'Scegli flusso carta',
            ukRegulation:
                'Expensify Limited è un agente di Plaid Financial Ltd., un’istituzione di pagamento autorizzata e regolamentata dalla Financial Conduct Authority ai sensi del Payment Services Regulations 2017 (Numero di Riferimento della Società: 804718). Plaid ti fornisce servizi regolamentati di informazione sui conti tramite Expensify Limited in qualità di suo agente.',
        },
        expensifyCard: {
            issueAndManageCards: 'Emetti e gestisci le tue Expensify Card',
            getStartedIssuing: 'Inizia emettendo la tua prima carta virtuale o fisica.',
            verificationInProgress: 'Verifica in corso...',
            verifyingTheDetails: 'Stiamo verificando alcuni dettagli. Concierge ti avviserà quando le Expensify Card saranno pronte per essere emesse.',
            disclaimer:
                'La carta commerciale Expensify Visa® è emessa da The Bancorp Bank, N.A., membro FDIC, in virtù di una licenza di Visa U.S.A. Inc. e potrebbe non essere accettata da tutti gli esercenti che accettano carte Visa. Apple® e il logo Apple® sono marchi di Apple Inc., registrati negli Stati Uniti e in altri Paesi. App Store è un marchio di servizio di Apple Inc. Google Play e il logo Google Play sono marchi di Google LLC.',
            euUkDisclaimer:
                'Le carte fornite ai residenti dello SEE sono emesse da Transact Payments Malta Limited e le carte fornite ai residenti del Regno Unito sono emesse da Transact Payments Limited in virtù di una licenza di Visa Europe Limited. Transact Payments Malta Limited è debitamente autorizzata e regolamentata dalla Malta Financial Services Authority come Istituto Finanziario ai sensi del Financial Institution Act 1994. Numero di registrazione C 91879. Transact Payments Limited è autorizzata e regolamentata dalla Gibraltar Financial Service Commission.',
            issueCard: 'Emetti carta',
            findCard: 'Trova carta',
            newCard: 'Nuova carta',
            name: 'Nome',
            lastFour: 'Ultime 4',
            limit: 'Limite',
            currentBalance: 'Saldo attuale',
            currentBalanceDescription: 'Il saldo attuale è la somma di tutte le transazioni contabilizzate della Expensify Card avvenute dall’ultima data di regolamento.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Il saldo sarà regolato il ${settlementDate}`,
            settleBalance: 'Regola saldo',
            cardLimit: 'Limite carta',
            remainingLimit: 'Limite rimanente',
            requestLimitIncrease: 'Aumento limite richieste',
            remainingLimitDescription:
                'Consideriamo diversi fattori quando calcoliamo il tuo limite residuo: la tua anzianità come cliente, le informazioni aziendali che hai fornito durante la registrazione e la liquidità disponibile sul conto bancario della tua azienda. Il tuo limite residuo può variare quotidianamente.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Il saldo del cashback si basa sulle spese mensili effettuate con la Expensify Card già contabilizzate all’interno del tuo workspace.',
            issueNewCard: 'Emetti nuova carta',
            finishSetup: 'Completa configurazione',
            chooseBankAccount: 'Scegli conto bancario',
            chooseExistingBank: 'Scegli un conto bancario aziendale esistente per pagare il saldo della tua Expensify Card oppure aggiungi un nuovo conto bancario',
            accountEndingIn: 'Account che termina con',
            addNewBankAccount: 'Aggiungi un nuovo conto bancario',
            settlementAccount: 'Conto di regolamento',
            settlementAccountDescription: 'Scegli un conto per pagare il saldo della tua Expensify Card.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Assicurati che questo conto corrisponda al tuo <a href="${reconciliationAccountSettingsLink}">Conto di riconciliazione</a> (${accountNumber}) affinché la Riconciliazione continua funzioni correttamente.`,
            settlementFrequency: 'Frequenza di liquidazione',
            settlementFrequencyDescription: 'Scegli la frequenza con cui pagherai il saldo della tua Expensify Card.',
            settlementFrequencyInfo:
                'Se desideri passare alla liquidazione mensile, dovrai collegare il tuo conto bancario tramite Plaid e avere una cronologia del saldo positiva degli ultimi 90 giorni.',
            frequency: {
                daily: 'Giornaliero',
                monthly: 'Mensile',
            },
            cardDetails: 'Dettagli carta',
            cardPending: ({name}: {name: string}) => `La carta è attualmente in sospeso e verrà emessa non appena l'account di ${name} sarà convalidato.`,
            virtual: 'Virtuale',
            physical: 'Fisico',
            deactivate: 'Disattiva carta',
            changeCardLimit: 'Modifica limite della carta',
            changeLimit: 'Modifica limite',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Se modifichi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate finché non approverai altre spese sulla carta.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Se cambi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate fino al mese prossimo.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Se modifichi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate.`,
            changeCardLimitType: 'Modifica tipo di limite carta',
            changeLimitType: 'Modifica tipo di limite',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Se cambi il tipo di limite di questa carta in Smart Limit, le nuove transazioni verranno rifiutate perché il limite non approvato di ${limit} è già stato raggiunto.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Se cambi il tipo di limite di questa carta a Mensile, le nuove transazioni verranno rifiutate perché il limite mensile di ${limit} è già stato raggiunto.`,
            addShippingDetails: 'Aggiungi dettagli di spedizione',
            issuedCard: ({assignee}: AssigneeParams) => `ha emesso una Expensify Card per ${assignee}! La carta arriverà in 2-3 giorni lavorativi.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `ha emesso una Expensify Card a ${assignee}! La carta verrà spedita non appena i dettagli di spedizione saranno confermati.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `ha emesso a ${assignee} una Expensify Card virtuale! Il ${link} può essere utilizzato subito.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} ha aggiunto i dettagli di spedizione. La Expensify Card arriverà in 2-3 giorni lavorativi.`,
            replacedCard: ({assignee}: AssigneeParams) => `${assignee} ha sostituito la sua Expensify Card. La nuova carta arriverà tra 2-3 giorni lavorativi.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} ha sostituito la sua carta virtuale Expensify! Il ${link} può essere usato subito.`,
            card: 'carta',
            replacementCard: 'carta sostitutiva',
            verifyingHeader: 'Verifica in corso',
            bankAccountVerifiedHeader: 'Conto bancario verificato',
            verifyingBankAccount: 'Verifica del conto bancario in corso...',
            verifyingBankAccountDescription: 'Attendi mentre confermiamo che questo account possa essere utilizzato per emettere Expensify Card.',
            bankAccountVerified: 'Conto bancario verificato!',
            bankAccountVerifiedDescription: 'Ora puoi emettere Expensify Card ai membri del tuo spazio di lavoro.',
            oneMoreStep: 'Ancora un passo...',
            oneMoreStepDescription: 'Sembra che sia necessario verificare manualmente il tuo conto bancario. Vai su Concierge, dove ti attendono le istruzioni.',
            gotIt: 'Ho capito',
            goToConcierge: 'Vai a Concierge',
        },
        categories: {
            deleteCategories: 'Elimina categorie',
            deleteCategoriesPrompt: 'Sei sicuro di voler eliminare queste categorie?',
            deleteCategory: 'Elimina categoria',
            deleteCategoryPrompt: 'Sei sicuro di voler eliminare questa categoria?',
            disableCategories: 'Disabilita categorie',
            disableCategory: 'Disattiva categoria',
            enableCategories: 'Abilita categorie',
            enableCategory: 'Abilita categoria',
            defaultSpendCategories: 'Categorie di spesa predefinite',
            spendCategoriesDescription: 'Personalizza come viene categorizzata la spesa dei fornitori per le transazioni con carta di credito e le ricevute scannerizzate.',
            deleteFailureMessage: "Si è verificato un errore durante l'eliminazione della categoria, riprova",
            categoryName: 'Nome categoria',
            requiresCategory: 'I membri devono categorizzare tutte le spese',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Tutte le spese devono essere categorizzate per poter essere esportate su ${connectionName}.`,
            subtitle: 'Ottieni una migliore panoramica di dove vengono spesi i soldi. Usa le nostre categorie predefinite oppure aggiungi le tue.',
            emptyCategories: {
                title: 'Non hai creato alcuna categoria',
                subtitle: 'Aggiungi una categoria per organizzare le tue spese.',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Le tue categorie sono attualmente importate da una connessione di contabilità. Vai su <a href="${accountingPageURL}">contabilità</a> per apportare modifiche.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Si è verificato un errore durante l’aggiornamento della categoria, riprova',
            createFailureMessage: 'Si è verificato un errore durante la creazione della categoria, riprova per favore',
            addCategory: 'Aggiungi categoria',
            editCategory: 'Modifica categoria',
            editCategories: 'Modifica categorie',
            findCategory: 'Trova categoria',
            categoryRequiredError: 'Il nome della categoria è obbligatorio',
            existingCategoryError: 'Esiste già una categoria con questo nome',
            invalidCategoryName: 'Nome categoria non valido',
            importedFromAccountingSoftware: 'Le categorie sottostanti sono importate dal tuo',
            payrollCode: 'Codice payroll',
            updatePayrollCodeFailureMessage: 'Si è verificato un errore durante l’aggiornamento del codice paghe, riprova.',
            glCode: 'Codice contabile',
            updateGLCodeFailureMessage: 'Si è verificato un errore durante l’aggiornamento del codice GL, riprova',
            importCategories: 'Importa categorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Impossibile eliminare o disattivare tutte le categorie',
                description: `Almeno una categoria deve rimanere abilitata perché il tuo spazio di lavoro richiede le categorie.`,
            },
        },
        moreFeatures: {
            subtitle: 'Utilizza i toggle qui sotto per abilitare più funzionalità man mano che cresci. Ogni funzionalità apparirà nel menu di navigazione per ulteriori personalizzazioni.',
            spendSection: {
                title: 'Spesa',
                subtitle: 'Abilita funzionalità che ti aiutano a far crescere il tuo team su larga scala.',
            },
            manageSection: {
                title: 'Gestisci',
                subtitle: 'Aggiungi controlli che aiutano a mantenere le spese entro il budget.',
            },
            earnSection: {
                title: 'Guadagna',
                subtitle: 'Ottimizza i tuoi ricavi e fatti pagare più velocemente.',
            },
            organizeSection: {
                title: 'Organizza',
                subtitle: 'Raggruppa e analizza le spese, registra ogni imposta pagata.',
            },
            integrateSection: {
                title: 'Integra',
                subtitle: 'Collega Expensify ai principali prodotti finanziari.',
            },
            distanceRates: {
                title: 'Tariffe distanza',
                subtitle: 'Aggiungi, aggiorna e applica le tariffe.',
            },
            perDiem: {
                title: 'Diaria',
                subtitle: 'Imposta le tariffe di diaria per controllare la spesa giornaliera dei dipendenti.',
            },
            expensifyCard: {
                title: 'Carta Expensify',
                subtitle: 'Ottieni informazioni dettagliate e controllo sulle spese.',
                disableCardTitle: 'Disattiva Expensify Card',
                disableCardPrompt: 'Non puoi disattivare la Expensify Card perché è già in uso. Contatta Concierge per i prossimi passaggi.',
                disableCardButton: 'Chatta con Concierge',
                feed: {
                    title: 'Ottieni la Expensify Card',
                    subTitle: 'Ottimizza le spese aziendali e risparmia fino al 50% sulla tua fattura Expensify, più:',
                    features: {
                        cashBack: 'Rimborso in contanti su ogni acquisto negli USA',
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
                        support: 'Supporto per tutti i principali emittenti di carte',
                        assignCards: 'Assegna le carte all’intero team',
                        automaticImport: 'Importazione automatica delle transazioni',
                    },
                },
                bankConnectionError: 'Problema di connessione bancaria',
                connectWithPlaid: 'connetti tramite Plaid',
                connectWithExpensifyCard: 'prova la Expensify Card.',
                bankConnectionDescription: `Prova ad aggiungere di nuovo le tue carte. In caso contrario, puoi`,
                disableCardTitle: 'Disattiva carte aziendali',
                disableCardPrompt: 'Non puoi disabilitare le carte aziendali perché questa funzionalità è in uso. Contatta il Concierge per i prossimi passaggi.',
                disableCardButton: 'Chatta con Concierge',
                cardDetails: 'Dettagli carta',
                cardNumber: 'Numero carta',
                cardholder: 'Titolare della carta',
                cardName: 'Nome carta',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `esportazione ${integration} ${type.toLowerCase()}` : `Esportazione ${integration}`,
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Scegli l’account ${integration} in cui esportare le transazioni.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Scegli il conto ${integration} in cui esportare le transazioni. Seleziona una <a href="${exportPageLink}">opzione di esportazione</a> diversa per modificare i conti disponibili.`,
                lastUpdated: 'Ultimo aggiornamento',
                transactionStartDate: 'Data di inizio transazione',
                updateCard: 'Aggiorna carta',
                unassignCard: 'Rimuovi assegnazione carta',
                unassign: 'Rimuovi assegnazione',
                unassignCardDescription: 'Disassociare questa carta rimuoverà tutte le transazioni sui report in bozza dall’account del titolare della carta.',
                assignCard: 'Assegna carta',
                cardFeedName: 'Nome flusso carta',
                cardFeedNameDescription: 'Dai al feed della carta un nome univoco così puoi distinguerlo dagli altri.',
                cardFeedTransaction: 'Elimina transazioni',
                cardFeedTransactionDescription: 'Scegli se i titolari di carta possono eliminare le transazioni della carta. Le nuove transazioni seguiranno queste regole.',
                cardFeedRestrictDeletingTransaction: 'Limita l’eliminazione delle transazioni',
                cardFeedAllowDeletingTransaction: "Consenti l'eliminazione delle transazioni",
                removeCardFeed: 'Rimuovi feed carta',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Rimuovi il feed ${feedName}`,
                removeCardFeedDescription: 'Sei sicuro di voler rimuovere questo feed della carta? In questo modo tutte le carte verranno disassociate.',
                error: {
                    feedNameRequired: 'Il nome del feed della carta è obbligatorio',
                    statementCloseDateRequired: 'Seleziona una data di chiusura dell’estratto conto.',
                },
                corporate: 'Limita l’eliminazione delle transazioni',
                personal: "Consenti l'eliminazione delle transazioni",
                setFeedNameDescription: 'Dai al feed della carta un nome univoco in modo da poterlo distinguere dagli altri',
                setTransactionLiabilityDescription: 'Quando è abilitata, i titolari della carta possono eliminare le transazioni della carta. Le nuove transazioni seguiranno questa regola.',
                emptyAddedFeedTitle: 'Assegna carte aziendali',
                emptyAddedFeedDescription: 'Inizia assegnando la tua prima carta a un membro.',
                pendingFeedTitle: `Stiamo esaminando la tua richiesta...`,
                pendingFeedDescription: `Stiamo attualmente esaminando i dettagli del tuo feed. Una volta terminato, ti contatteremo tramite`,
                pendingBankTitle: 'Controlla la finestra del browser',
                pendingBankDescription: ({bankName}: CompanyCardBankName) => `Collegati a ${bankName} tramite la finestra del browser che si è appena aperta. Se non se ne è aperta una,`,
                pendingBankLink: 'fai clic qui',
                giveItNameInstruction: 'Dai alla carta un nome che la distingua dalle altre.',
                updating: 'Aggiornamento in corso...',
                noAccountsFound: 'Nessun account trovato',
                defaultCard: 'Carta predefinita',
                downgradeTitle: `Impossibile effettuare il downgrade dello spazio di lavoro`,
                downgradeSubTitle: `Questo spazio di lavoro non può essere declassato perché sono collegati più flussi di carte (escluse le Expensify Card). Per procedere, <a href="#">mantieni un solo flusso di carte</a>.`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Aggiungi l’account in ${connection} e sincronizza nuovamente la connessione`,
                expensifyCardBannerTitle: 'Ottieni la Expensify Card',
                expensifyCardBannerSubtitle:
                    'Approfitta del cashback su ogni acquisto negli USA, fino al 50% di sconto sulla tua fattura Expensify, carte virtuali illimitate e molto altro ancora.',
                expensifyCardBannerLearnMoreButton: 'Scopri di più',
                statementCloseDateTitle: 'Data di chiusura dell’estratto conto',
                statementCloseDateDescription: 'Facci sapere quando si chiude l’estratto conto della tua carta e creeremo un estratto conto corrispondente in Expensify.',
            },
            workflows: {
                title: 'Flussi di lavoro',
                subtitle: 'Configura come le spese vengono approvate e pagate.',
                disableApprovalPrompt:
                    'Le Expensify Card di questo workspace si basano attualmente sulle approvazioni per definire i loro Smart Limit. Modifica i tipi di limite di tutte le Expensify Card con Smart Limit prima di disabilitare le approvazioni.',
            },
            invoices: {
                title: 'Fatture',
                subtitle: 'Invia e ricevi fatture.',
            },
            categories: {
                title: 'Categorie',
                subtitle: 'Monitora e organizza le spese.',
            },
            tags: {
                title: 'Tag',
                subtitle: 'Classifica i costi e tieni traccia delle spese fatturabili.',
            },
            taxes: {
                title: 'Tasse',
                subtitle: 'Documenta e recupera le imposte ammissibili.',
            },
            reportFields: {
                title: 'Campi del report',
                subtitle: 'Configura campi personalizzati per le spese.',
            },
            connections: {
                title: 'Contabilità',
                subtitle: 'Sincronizza il tuo piano dei conti e altro ancora.',
            },
            receiptPartners: {
                title: 'Partner per le ricevute',
                subtitle: 'Importazione automatica delle ricevute.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Non così in fretta...',
                featureEnabledText: 'Per abilitare o disabilitare questa funzione, devi modificare le impostazioni di importazione contabile.',
                disconnectText: 'Per disattivare la contabilità, dovrai disconnettere la connessione di contabilità dal tuo workspace.',
                manageSettings: 'Gestisci impostazioni',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Disconnetti Uber',
                disconnectText: 'Per disattivare questa funzione, disconnetti prima l’integrazione Uber for Business.',
                description: 'Sei sicuro di voler disconnettere questa integrazione?',
                confirmText: 'Ho capito',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Non così in fretta...',
                featureEnabledText:
                    'Le Expensify Card in questo spazio di lavoro si basano sui flussi di approvazione per definire i loro Smart Limit.\n\nModifica i tipi di limite di tutte le carte con Smart Limit prima di disabilitare i flussi di lavoro.',
                confirmText: 'Vai a Expensify Cards',
            },
            rules: {
                title: 'Regole',
                subtitle: 'Richiedi ricevute, segnala spese elevate e altro ancora.',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Esempi:',
            customReportNamesSubtitle: `<muted-text>Personalizza i titoli dei report utilizzando le nostre <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">ampie formule</a>.</muted-text>`,
            customNameTitle: 'Titolo predefinito del rapporto',
            customNameDescription: `Scegli un nome personalizzato per i report di spesa usando le nostre <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">formule avanzate</a>.`,
            customNameInputLabel: 'Nome',
            customNameEmailPhoneExample: 'Email o telefono del membro: {report:submit:from}',
            customNameStartDateExample: 'Data di inizio rapporto: {report:startdate}',
            customNameWorkspaceNameExample: 'Nome spazio di lavoro: {report:workspacename}',
            customNameReportIDExample: 'ID Rapporto: {report:id}',
            customNameTotalExample: 'Totale: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Impedisci ai membri di modificare i titoli personalizzati dei report',
        },
        reportFields: {
            addField: 'Aggiungi campo',
            delete: 'Elimina campo',
            deleteFields: 'Elimina campi',
            findReportField: 'Trova campo del report',
            deleteConfirmation: 'Sei sicuro di voler eliminare questo campo del report?',
            deleteFieldsConfirmation: 'Sei sicuro di voler eliminare questi campi del report?',
            emptyReportFields: {
                title: 'Non hai creato nessun campo di report',
                subtitle: 'Aggiungi un campo personalizzato (testo, data o menu a discesa) che appare nei report.',
            },
            subtitle: 'I campi del report si applicano a tutte le spese e possono essere utili quando vuoi richiedere informazioni aggiuntive.',
            disableReportFields: 'Disabilita i campi del report',
            disableReportFieldsConfirmation: 'Sei sicuro? I campi di testo e data verranno eliminati e gli elenchi saranno disabilitati.',
            importedFromAccountingSoftware: 'I campi del report riportati di seguito sono importati dal tuo',
            textType: 'Testo',
            dateType: 'Data',
            dropdownType: 'Elenco',
            formulaType: 'Formula',
            textAlternateText: "Aggiungi un campo per l'inserimento di testo libero.",
            dateAlternateText: 'Aggiungi un calendario per la selezione della data.',
            dropdownAlternateText: 'Aggiungi un elenco di opzioni tra cui scegliere.',
            formulaAlternateText: 'Aggiungi un campo formula.',
            nameInputSubtitle: 'Scegli un nome per il campo del report.',
            typeInputSubtitle: 'Scegli quale tipo di campo report utilizzare.',
            initialValueInputSubtitle: 'Inserisci un valore iniziale da mostrare nel campo del report.',
            listValuesInputSubtitle: 'Questi valori appariranno nel menu a discesa del campo del tuo report. I valori abilitati possono essere selezionati dai membri.',
            listInputSubtitle: 'Questi valori appariranno nell’elenco dei campi del tuo report. I valori abilitati possono essere selezionati dai membri.',
            deleteValue: 'Elimina valore',
            deleteValues: 'Elimina valori',
            disableValue: 'Disattiva valore',
            disableValues: 'Disattiva valori',
            enableValue: 'Abilita valore',
            enableValues: 'Abilita valori',
            emptyReportFieldsValues: {
                title: 'Non hai creato alcun valore elenco',
                subtitle: 'Aggiungi valori personalizzati da visualizzare nei report.',
            },
            deleteValuePrompt: "Sei sicuro di voler eliminare questo valore dell'elenco?",
            deleteValuesPrompt: "Sei sicuro di voler eliminare questi valori dell'elenco?",
            listValueRequiredError: 'Inserisci un nome per il valore dell’elenco',
            existingListValueError: 'Un valore di elenco con questo nome esiste già',
            editValue: 'Modifica valore',
            listValues: 'Elenca valori',
            addValue: 'Aggiungi valore',
            existingReportFieldNameError: 'Un campo report con questo nome esiste già',
            reportFieldNameRequiredError: 'Inserisci un nome per il campo del resoconto',
            reportFieldTypeRequiredError: 'Scegli un tipo di campo del report',
            circularReferenceError: 'Questo campo non può fare riferimento a se stesso. Aggiorna per favore.',
            reportFieldInitialValueRequiredError: 'Scegli un valore iniziale per il campo del report',
            genericFailureMessage: "Si è verificato un errore durante l'aggiornamento del campo del report. Riprova.",
        },
        tags: {
            tagName: 'Nome tag',
            requiresTag: 'I membri devono aggiungere un tag a tutte le spese',
            trackBillable: 'Tieni traccia delle spese fatturabili',
            customTagName: 'Nome tag personalizzato',
            enableTag: 'Abilita tag',
            enableTags: 'Abilita tag',
            requireTag: 'Richiedi tag',
            requireTags: 'Tag obbligatori',
            notRequireTags: 'Non richiedere',
            disableTag: 'Disattiva tag',
            disableTags: 'Disattiva tag',
            addTag: 'Aggiungi tag',
            editTag: 'Modifica tag',
            editTags: 'Modifica tag',
            findTag: 'Trova tag',
            subtitle: 'I tag offrono modi più dettagliati per classificare i costi.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text>Stai usando i <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">tag dipendenti</a>. Puoi <a href="${importSpreadsheetLink}">importare nuovamente un foglio di calcolo</a> per aggiornare i tuoi tag.</muted-text>`,
            emptyTags: {
                title: 'Non hai creato alcun tag',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Aggiungi un tag per tenere traccia di progetti, sedi, reparti e altro.',
                subtitleHTML: `<muted-text><centered-text>Importa un foglio di calcolo per aggiungere tag per monitorare progetti, sedi, reparti e altro ancora. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Scopri di più</a> sulla formattazione dei file dei tag.</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>I tuoi tag vengono attualmente importati da una connessione contabile. Vai alla sezione <a href="${accountingPageURL}">contabilità</a> per apportare eventuali modifiche.</centered-text></muted-text>`,
            },
            deleteTag: 'Elimina tag',
            deleteTags: 'Elimina tag',
            deleteTagConfirmation: 'Sei sicuro di voler eliminare questo tag?',
            deleteTagsConfirmation: 'Sei sicuro di voler eliminare questi tag?',
            deleteFailureMessage: 'Si è verificato un errore durante l’eliminazione del tag, riprova per favore',
            tagRequiredError: 'Il nome del tag è obbligatorio',
            existingTagError: 'Esiste già un tag con questo nome',
            invalidTagNameError: 'Il nome del tag non può essere 0. Scegli un valore diverso.',
            genericFailureMessage: 'Si è verificato un errore durante l’aggiornamento dell’etichetta, riprova',
            importedFromAccountingSoftware: 'I tag sottostanti sono importati dal tuo',
            glCode: 'Codice contabile',
            updateGLCodeFailureMessage: 'Si è verificato un errore durante l’aggiornamento del codice GL, riprova',
            tagRules: 'Regole dei tag',
            approverDescription: 'Approvatore',
            importTags: 'Importa tag',
            importTagsSupportingText: 'Classifica le tue spese con un solo tipo di tag o con molti.',
            configureMultiLevelTags: 'Configura il tuo elenco di tag per il tagging multilivello.',
            importMultiLevelTagsSupportingText: `Ecco un’anteprima dei tuoi tag. Se tutto sembra corretto, fai clic qui sotto per importarli.`,
            importMultiLevelTags: {
                firstRowTitle: 'La prima riga è il titolo per ciascun elenco di tag',
                independentTags: 'Queste sono tag indipendenti',
                glAdjacentColumn: "C'è un codice GL nella colonna adiacente",
            },
            tagLevel: {
                singleLevel: 'Livello singolo di tag',
                multiLevel: 'Tag multilivello',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Cambia livelli tag',
                prompt1: 'Il cambio dei livelli di tag cancellerà tutti i tag correnti.',
                prompt2: 'Ti suggeriamo prima di tutto',
                prompt3: 'scarica un backup',
                prompt4: 'esportando i tuoi tag.',
                prompt5: 'Scopri di più',
                prompt6: 'sui livelli dei tag.',
            },
            overrideMultiTagWarning: {
                title: 'Importa tag',
                prompt1: 'Sei sicuro?',
                prompt2: 'I tag esistenti verranno sovrascritti, ma puoi',
                prompt3: 'scarica un backup',
                prompt4: 'Primo.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Abbiamo trovato *${columnCounts} colonne* nel tuo foglio di calcolo. Seleziona *Nome* accanto alla colonna che contiene i nomi dei tag. Puoi anche selezionare *Abilitato* accanto alla colonna che imposta lo stato dei tag.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Impossibile eliminare o disattivare tutti i tag',
                description: `Almeno un tag deve rimanere abilitato perché il tuo workspace richiede i tag.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Impossibile rendere tutti i tag facoltativi',
                description: `Almeno un tag deve rimanere obbligatorio perché le impostazioni del tuo spazio di lavoro richiedono i tag.`,
            },
            cannotMakeTagListRequired: {
                title: 'Impossibile rendere obbligatorio l’elenco dei tag',
                description: 'Puoi rendere obbligatoria una lista di tag solo se la tua policy ha più livelli di tag configurati.',
            },
            tagCount: () => ({
                one: '1 giorno',
                other: (count: number) => `${count} tag`,
            }),
        },
        taxes: {
            subtitle: 'Aggiungi nomi delle imposte, aliquote e imposta predefinita.',
            addRate: 'Aggiungi tariffa',
            workspaceDefault: 'Valuta predefinita dello spazio di lavoro',
            foreignDefault: 'Valuta estera predefinita',
            customTaxName: 'Nome imposta personalizzata',
            value: 'Valore',
            taxReclaimableOn: 'Imposta recuperabile su',
            taxRate: 'Aliquota fiscale',
            findTaxRate: 'Trova aliquota fiscale',
            error: {
                taxRateAlreadyExists: 'Questo nome di imposta è già in uso',
                taxCodeAlreadyExists: 'Questo codice fiscale è già in uso',
                valuePercentageRange: 'Inserisci una percentuale valida compresa tra 0 e 100',
                customNameRequired: 'Il nome personalizzato dell’imposta è obbligatorio',
                deleteFailureMessage: 'Si è verificato un errore durante l’eliminazione dell’aliquota fiscale. Riprova oppure chiedi aiuto a Concierge.',
                updateFailureMessage: 'Si è verificato un errore durante l’aggiornamento dell’aliquota fiscale. Riprova o chiedi aiuto a Concierge.',
                createFailureMessage: 'Si è verificato un errore durante la creazione dell’aliquota fiscale. Riprova oppure chiedi aiuto a Concierge.',
                updateTaxClaimableFailureMessage: 'La parte rimborsabile deve essere inferiore all’importo della tariffa chilometrica',
            },
            deleteTaxConfirmation: 'Sei sicuro di voler eliminare questa imposta?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Sei sicuro di voler eliminare le imposte ${taxAmount}?`,
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
                    other: 'Disattiva tariffe',
                }),
            },
            importedFromAccountingSoftware: 'Le imposte riportate di seguito sono state importate dal tuo',
            taxCode: 'Codice fiscale',
            updateTaxCodeFailureMessage: 'Si è verificato un errore durante l’aggiornamento del codice fiscale, riprova',
        },
        duplicateWorkspace: {
            title: 'Dai un nome al tuo nuovo workspace',
            selectFeatures: 'Seleziona le funzionalità da copiare',
            whichFeatures: 'Quali funzionalità vuoi copiare nel tuo nuovo spazio di lavoro?',
            confirmDuplicate: 'Vuoi continuare?',
            categories: 'categorie e le tue regole di categorizzazione automatica',
            reimbursementAccount: 'conto di rimborso',
            welcomeNote: 'Per favore inizia a usare il mio nuovo workspace',
            delayedSubmission: 'invio in ritardo',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Stai per creare e condividere ${newWorkspaceName ?? ''} con ${totalMembers ?? 0} membri dall’area di lavoro originale.`,
            error: 'Si è verificato un errore durante la duplicazione del tuo nuovo workspace. Riprova.',
        },
        emptyWorkspace: {
            title: 'Non hai alcuno spazio di lavoro',
            subtitle: 'Tieni traccia delle ricevute, rimborsa le spese, gestisci i viaggi, invia fatture e altro ancora.',
            createAWorkspaceCTA: 'Inizia',
            features: {
                trackAndCollect: 'Tieni traccia e raccogli le ricevute',
                reimbursements: 'Rimborsa i dipendenti',
                companyCards: 'Gestisci le carte aziendali',
            },
            notFound: 'Nessun workspace trovato',
            description: 'Le stanze sono un ottimo posto per discutere e lavorare con più persone. Per iniziare a collaborare, crea o unisciti a uno spazio di lavoro',
        },
        new: {
            newWorkspace: 'Nuovo spazio di lavoro',
            getTheExpensifyCardAndMore: 'Ottieni la Expensify Card e altro ancora',
            confirmWorkspace: 'Conferma spazio di lavoro',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Il mio spazio di lavoro di gruppo${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace di ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Si è verificato un errore durante la rimozione di un membro dallo spazio di lavoro, riprova',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Sei sicuro di voler rimuovere ${memberName}?`,
                other: 'Sei sicuro di voler rimuovere questi membri?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} è un approvatore in questo workspace. Quando smetti di condividere questo workspace con loro, li sostituiremo nel flusso di approvazione con il proprietario del workspace, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Rimuovi membro',
                other: 'Rimuovi membri',
            }),
            findMember: 'Trova membro',
            removeWorkspaceMemberButtonTitle: 'Rimuovi dallo spazio di lavoro',
            removeGroupMemberButtonTitle: 'Rimuovi dal gruppo',
            removeRoomMemberButtonTitle: 'Rimuovi dalla chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Sei sicuro di voler rimuovere ${memberName}?`,
            removeMemberTitle: 'Rimuovi membro',
            transferOwner: 'Trasferisci proprietario',
            makeMember: 'Rendi membro',
            makeAdmin: 'Rendi amministratore',
            makeAuditor: 'Rendi revisore',
            selectAll: 'Seleziona tutto',
            error: {
                genericAdd: "Si è verificato un problema nell'aggiunta di questo membro dello spazio di lavoro",
                cannotRemove: 'Non puoi rimuovere te stesso o il proprietario dello spazio di lavoro',
                genericRemove: 'Si è verificato un problema durante la rimozione di quel membro dello spazio di lavoro',
            },
            addedWithPrimary: 'Alcuni membri sono stati aggiunti con il loro login principale.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Aggiunto dall’accesso secondario ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Membri totali dell'area di lavoro: ${count}`,
            importMembers: 'Importa membri',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Se rimuovi ${approver} da questo workspace, lo sostituiremo nel flusso di approvazione con ${workspaceOwner}, il proprietario del workspace.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} ha note spese in sospeso da approvare. Chiedi loro di approvarle o prendi il controllo delle loro note spese prima di rimuoverli dallo spazio di lavoro.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Non puoi rimuovere ${memberName} da questo workspace. Imposta un nuovo rimborsatore in Flussi di lavoro > Effettua o monitora pagamenti, quindi riprova.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Se rimuovi ${memberName} da questo spazio di lavoro, lo sostituiremo come esportatore preferito con ${workspaceOwner}, il proprietario dello spazio di lavoro.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Se rimuovi ${memberName} da questo workspace, lo sostituiremo come referente tecnico con ${workspaceOwner}, il proprietario del workspace.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} ha un report in elaborazione su cui deve intervenire. Chiedi loro di completare l’azione richiesta prima di rimuoverli dallo spazio di lavoro.`,
        },
        card: {
            getStartedIssuing: 'Inizia emettendo la tua prima carta virtuale o fisica.',
            issueCard: 'Emetti carta',
            issueNewCard: {
                whoNeedsCard: 'Chi ha bisogno di una carta?',
                inviteNewMember: 'Invita nuovo membro',
                findMember: 'Trova membro',
                chooseCardType: 'Scegli un tipo di carta',
                physicalCard: 'Carta fisica',
                physicalCardDescription: 'Ottimo per chi spende spesso',
                virtualCard: 'Carta virtuale',
                virtualCardDescription: 'Immediato e flessibile',
                chooseLimitType: 'Scegli un tipo di limite',
                smartLimit: 'Limite Intelligente',
                smartLimitDescription: 'Spendi fino a un certo importo prima di richiedere l’approvazione',
                monthly: 'Mensile',
                monthlyDescription: 'Spendi fino a un determinato importo al mese',
                fixedAmount: 'Importo fisso',
                fixedAmountDescription: 'Spendi fino a un determinato importo una sola volta',
                setLimit: 'Imposta un limite',
                cardLimitError: 'Inserisci un importo inferiore a $21.474.836',
                giveItName: 'Assegna un nome',
                giveItNameInstruction: 'Rendila abbastanza unica da distinguerla dalle altre carte. Casi d’uso specifici sono ancora meglio!',
                cardName: 'Nome carta',
                letsDoubleCheck: 'Facciamo un ultimo controllo per assicurarci che sia tutto corretto.',
                willBeReady: "Questa carta sarà pronta per l'uso immediatamente.",
                cardholder: 'Titolare della carta',
                cardType: 'Tipo di carta',
                limit: 'Limite',
                limitType: 'Tipo di limite',
                name: 'Nome',
                disabledApprovalForSmartLimitError: 'Abilita le approvazioni in <strong>Flussi di lavoro > Aggiungi approvazioni</strong> prima di configurare i limiti intelligenti',
            },
            deactivateCardModal: {
                deactivate: 'Disattiva',
                deactivateCard: 'Disattiva carta',
                deactivateConfirmation: 'La disattivazione di questa carta rifiuterà tutte le transazioni future e non può essere annullata.',
            },
        },
        accounting: {
            settings: 'impostazioni',
            title: 'Connessioni',
            subtitle:
                'Collega il tuo sistema contabile per codificare le transazioni con il tuo piano dei conti, abbinare automaticamente i pagamenti e mantenere le tue finanze sincronizzate.',
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
            errorODIntegration: ({oldDotPolicyConnectionsURL}: ErrorODIntegrationParams) =>
                `Si è verificato un errore con una connessione configurata in Expensify Classic. [Vai a Expensify Classic per risolvere questo problema.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Vai a Expensify Classic per gestire le tue impostazioni.',
            setup: 'Connetti',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Ultima sincronizzazione ${relativeDate}`,
            notSync: 'Non sincronizzato',
            import: 'Importa',
            export: 'Esporta',
            advanced: 'Avanzate',
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
                `Sei sicuro di voler connettere ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'questa integrazione contabile'}? Questo rimuoverà tutte le connessioni di contabilità esistenti.`,
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
                            return 'Importazione account';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importazione di classi';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importazione località';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Elaborazione dei dati importati';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Sincronizzazione dei report rimborsati e dei pagamenti delle fatture';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importazione codici fiscali';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Verifica della connessione a QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importazione dei dati di QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importazione dei dati Xero';
                        case 'startingImportQBO':
                            return 'Importazione dei dati di QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importazione dei dati da QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importazione titolo';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importazione del certificato di approvazione';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importazione delle dimensioni';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importazione della politica di salvataggio';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Sincronizzazione dei dati con QuickBooks ancora in corso... Assicurati che il Web Connector sia in esecuzione';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Sincronizzazione dei dati di QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Caricamento dei dati';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Aggiornamento categorie';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Aggiornamento clienti/progetti';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Aggiornamento elenco persone';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Aggiornamento dei campi del resoconto';
                        case 'jobDone':
                            return 'In attesa del caricamento dei dati importati';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Sincronizzazione piano dei conti';
                        case 'xeroSyncImportCategories':
                            return 'Sincronizzazione categorie';
                        case 'xeroSyncImportCustomers':
                            return 'Sincronizzazione clienti';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Contrassegnare i report di Expensify come rimborsati';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Contrassegnare le fatture e le note di credito Xero come pagate';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Sincronizzazione delle categorie di monitoraggio';
                        case 'xeroSyncImportBankAccounts':
                            return 'Sincronizzazione dei conti bancari';
                        case 'xeroSyncImportTaxRates':
                            return 'Sincronizzazione aliquote fiscali';
                        case 'xeroCheckConnection':
                            return 'Verifica della connessione Xero';
                        case 'xeroSyncTitle':
                            return 'Sincronizzazione dati Xero';
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
                            return 'Importazione di dati in Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Sincronizzazione account';
                        case 'netSuiteSyncCurrencies':
                            return 'Sincronizzazione valute';
                        case 'netSuiteSyncCategories':
                            return 'Sincronizzazione categorie';
                        case 'netSuiteSyncReportFields':
                            return 'Importazione dei dati come campi del report Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importazione dei dati come tag di Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Aggiornamento delle informazioni di connessione';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Contrassegnare i report di Expensify come rimborsati';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Contrassegnare le fatture e le note di addebito NetSuite come pagate';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importazione fornitori';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importazione di elenchi personalizzati';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importazione di elenchi personalizzati';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importazione delle filiali';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importazione fornitori';
                        case 'intacctCheckConnection':
                            return 'Verifica della connessione Sage Intacct';
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
                'L’esportatore preferito può essere qualsiasi amministratore dello spazio di lavoro, ma deve anche essere un Amministratore di Dominio se imposti conti di esportazione diversi per le singole carte aziendali nelle Impostazioni di Dominio.',
            exportPreferredExporterSubNote: 'Una volta impostato, l’esportatore preferito vedrà i report da esportare nel proprio account.',
            exportAs: 'Esporta come',
            exportOutOfPocket: 'Esporta le spese anticipate come',
            exportCompanyCard: 'Esporta le spese delle carte aziendali come',
            exportDate: 'Data di esportazione',
            defaultVendor: 'Fornitore predefinito',
            autoSync: 'Sincronizzazione automatica',
            autoSyncDescription: 'Sincronizza automaticamente NetSuite ed Expensify, ogni giorno. Esporta i report finalizzati in tempo reale',
            reimbursedReports: 'Sincronizza report rimborsati',
            cardReconciliation: 'Riconciliazione carta',
            reconciliationAccount: 'Conto di riconciliazione',
            continuousReconciliation: 'Riconciliazione continua',
            saveHoursOnReconciliation:
                'Risparmia ore di riconciliazione a ogni periodo contabile facendo sì che Expensify riconcili in modo continuo, per tuo conto, gli estratti conto e i regolamenti della Expensify Card.',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>Per abilitare la Riconciliazione Continua, abilita la <a href="${accountingAdvancedSettingsLink}">sincronizzazione automatica</a> per ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Scegli il conto bancario con cui verranno riconciliate le spese della tua Expensify Card.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Assicurati che questo conto corrisponda al tuo <a href="${settlementAccountUrl}">conto di regolamento della Expensify Card</a> (che termina con ${lastFourPAN}) affinché la Riconciliazione Continua funzioni correttamente.`,
            },
        },
        export: {
            notReadyHeading: 'Non pronto per l’esportazione',
            notReadyDescription: 'I report spesa in bozza o in sospeso non possono essere esportati nel sistema contabile. Approva o paga queste spese prima di esportarle.',
        },
        invoices: {
            sendInvoice: 'Invia fattura',
            sendFrom: 'Invia da',
            invoicingDetails: 'Dettagli fatturazione',
            invoicingDetailsDescription: 'Queste informazioni appariranno sulle tue fatture.',
            companyName: "Nome dell'azienda",
            companyWebsite: 'Sito web aziendale',
            paymentMethods: {
                personal: 'Personale',
                business: 'Business',
                chooseInvoiceMethod: 'Scegli un metodo di pagamento qui sotto:',
                payingAsIndividual: 'Pagare come individuo',
                payingAsBusiness: 'Pagare come azienda',
            },
            invoiceBalance: 'Saldo fattura',
            invoiceBalanceSubtitle:
                "Questo è il tuo saldo attuale derivante dall'incasso dei pagamenti delle fatture. Verrà trasferito automaticamente sul tuo conto bancario se ne hai aggiunto uno.",
            bankAccountsSubtitle: 'Aggiungi un conto bancario per effettuare e ricevere pagamenti delle fatture.',
        },
        invite: {
            member: 'Invita membro',
            members: 'Invita membri',
            invitePeople: 'Invita nuovi membri',
            genericFailureMessage: "Si è verificato un errore durante l'invito del membro allo spazio di lavoro. Riprova.",
            pleaseEnterValidLogin: `Assicurati che l’email o il numero di telefono siano validi (ad es. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'utente',
            users: 'utenti',
            invited: 'invitato',
            removed: 'Rimosso',
            to: 'a',
            from: 'da',
        },
        inviteMessage: {
            confirmDetails: 'Conferma i dettagli',
            inviteMessagePrompt: 'Rendi il tuo invito ancora più speciale aggiungendo un messaggio qui sotto!',
            personalMessagePrompt: 'Messaggio',
            genericFailureMessage: "Si è verificato un errore durante l'invito del membro allo spazio di lavoro. Riprova.",
            inviteNoMembersError: 'Seleziona almeno un membro da invitare',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} ha richiesto di unirsi a ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ops! Non così in fretta...',
            workspaceNeeds: 'Uno spazio di lavoro necessita di almeno una tariffa chilometrica abilitata.',
            distance: 'Distanza',
            centrallyManage: 'Gestisci centralmente le tariffe, monitora in miglia o chilometri e imposta una categoria predefinita.',
            rate: 'Valuta',
            addRate: 'Aggiungi tariffa',
            findRate: 'Trova tasso',
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
                other: 'Disattiva tariffe',
            }),
            enableRate: 'Abilita tariffa',
            status: 'Stato',
            unit: 'Unità',
            taxFeatureNotEnabledMessage:
                '<muted-text>Le imposte devono essere abilitate nello spazio di lavoro per utilizzare questa funzionalità. Vai su <a href="#">Altre funzionalità</a> per apportare questa modifica.</muted-text>',
            deleteDistanceRate: 'Elimina tariffa distanza',
            areYouSureDelete: () => ({
                one: 'Sei sicuro di voler eliminare questa tariffa?',
                other: 'Sei sicuro di voler eliminare queste tariffe?',
            }),
            errors: {
                rateNameRequired: 'Il nome della tariffa è obbligatorio',
                existingRateName: 'Esiste già una tariffa distanza con questo nome',
            },
        },
        editor: {
            descriptionInputLabel: 'Descrizione',
            nameInputLabel: 'Nome',
            typeInputLabel: 'Tipo',
            initialValueInputLabel: 'Valore iniziale',
            nameInputHelpText: 'Questo è il nome che vedrai nel tuo spazio di lavoro.',
            nameIsRequiredError: 'Dovrai dare un nome al tuo spazio di lavoro',
            currencyInputLabel: 'Valuta predefinita',
            currencyInputHelpText: 'Tutte le spese in questo workspace verranno convertite in questa valuta.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `La valuta predefinita non può essere modificata perché questo spazio di lavoro è collegato a un conto bancario in ${currency}.`,
            save: 'Salva',
            genericFailureMessage: 'Si è verificato un errore durante l’aggiornamento dello spazio di lavoro. Riprova.',
            avatarUploadFailureMessage: "Si è verificato un errore durante il caricamento dell'avatar. Riprova.",
            addressContext: 'È necessario un Indirizzo Spazio di lavoro per abilitare Expensify Travel. Inserisci un indirizzo associato alla tua azienda.',
            policy: 'Policy di spesa',
        },
        bankAccount: {
            continueWithSetup: 'Continua configurazione',
            youAreAlmostDone: 'Hai quasi finito di configurare il tuo conto bancario, che ti permetterà di emettere carte aziendali, rimborsare spese, riscuotere fatture e pagare bollette.',
            streamlinePayments: 'Ottimizza i pagamenti',
            connectBankAccountNote: 'Nota: i conti bancari personali non possono essere utilizzati per i pagamenti negli spazi di lavoro.',
            oneMoreThing: 'Un’ultima cosa!',
            allSet: 'Hai finito!',
            accountDescriptionWithCards: 'Questo conto bancario sarà utilizzato per emettere carte aziendali, rimborsare spese, riscuotere fatture e pagare conti.',
            letsFinishInChat: 'Finiamo in chat!',
            finishInChat: 'Completa in chat',
            almostDone: 'Quasi finito!',
            disconnectBankAccount: 'Disconnetti conto bancario',
            startOver: 'Ricomincia',
            updateDetails: 'Aggiorna dettagli',
            yesDisconnectMyBankAccount: 'Sì, disconnetti il mio conto bancario',
            yesStartOver: 'Sì, ricomincia',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) =>
                `Disconnetti il tuo conto bancario <strong>${bankName}</strong>. Tutte le transazioni in sospeso per questo conto verranno comunque completate.`,
            clearProgress: 'Ricominciando, verranno cancellati i progressi che hai fatto finora.',
            areYouSure: 'Sei sicuro?',
            workspaceCurrency: 'Valuta dello spazio di lavoro',
            updateCurrencyPrompt:
                'Sembra che il tuo spazio di lavoro sia attualmente impostato su una valuta diversa da USD. Fai clic sul pulsante qui sotto per aggiornare subito la tua valuta a USD.',
            updateToUSD: 'Aggiorna in USD',
            updateWorkspaceCurrency: 'Aggiorna valuta spazio di lavoro',
            workspaceCurrencyNotSupported: 'Valuta della workspace non supportata',
            yourWorkspace: `Il tuo workspace è impostato su una valuta non supportata. Visualizza l’<a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">elenco delle valute supportate</a>.`,
            chooseAnExisting: 'Scegli un conto bancario esistente per pagare le spese oppure aggiungine uno nuovo.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Trasferisci proprietario',
            addPaymentCardTitle: 'Inserisci la tua carta di pagamento per trasferire la proprietà',
            addPaymentCardButtonText: 'Accetta i termini e aggiungi carta di pagamento',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Leggi e accetta i <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">termini</a> e l’<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">informativa sulla privacy</a> per aggiungere la tua carta.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Conforme allo standard PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Crittografia a livello bancario',
            addPaymentCardRedundant: 'Infrastruttura ridondante',
            addPaymentCardLearnMore: `<muted-text>Scopri di più sulla nostra <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">sicurezza</a>.</muted-text>`,
            amountOwedTitle: 'Saldo in sospeso',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Questo account ha un saldo in sospeso da un mese precedente.\n\nVuoi azzerare il saldo e assumerti la gestione della fatturazione di questo workspace?',
            ownerOwesAmountTitle: 'Saldo in sospeso',
            ownerOwesAmountButtonText: 'Trasferisci saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `L’account proprietario di questo spazio di lavoro (${email}) ha un saldo in sospeso da un mese precedente.

Vuoi trasferire questo importo (${amount}) per assumerti la fatturazione di questo spazio di lavoro? La tua carta di pagamento verrà addebitata immediatamente.`,
            subscriptionTitle: "Subentra nell'abbonamento annuale",
            subscriptionButtonText: 'Trasferisci abbonamento',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Assumere il controllo di questo workspace unirà il suo abbonamento annuale al tuo abbonamento attuale. Questo aumenterà le dimensioni del tuo abbonamento di ${usersCount} membri, rendendo la nuova dimensione del tuo abbonamento pari a ${finalCount}. Vuoi continuare?`,
            duplicateSubscriptionTitle: 'Avviso di abbonamento duplicato',
            duplicateSubscriptionButtonText: 'Continua',
            duplicateSubscriptionText: ({
                email,
                workspaceName,
            }: ChangeOwnerDuplicateSubscriptionParams) => `Sembra che tu stia tentando di assumere la fatturazione per gli spazi di lavoro di ${email}, ma per farlo devi prima essere un amministratore di tutti i loro spazi di lavoro.

Fai clic su "Continua" se vuoi assumere la fatturazione solo per lo spazio di lavoro ${workspaceName}.

Se desideri assumere la fatturazione per l’intero abbonamento, chiedi prima che ti aggiungano come amministratore a tutti i loro spazi di lavoro, prima di assumere la fatturazione.`,
            hasFailedSettlementsTitle: 'Impossibile trasferire la proprietà',
            hasFailedSettlementsButtonText: 'Ho capito',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Non puoi assumere la fatturazione perché ${email} ha una regolazione in sospeso e scaduta per la Expensify Card. Chiedi loro di contattare concierge@expensify.com per risolvere il problema. Dopodiché, potrai assumere la fatturazione per questo spazio di lavoro.`,
            failedToClearBalanceTitle: 'Impossibile azzerare il saldo',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Non è stato possibile azzerare il saldo. Riprova più tardi.',
            successTitle: 'Evviva! Tutto pronto.',
            successDescription: 'Ora sei il proprietario di questo spazio di lavoro.',
            errorTitle: 'Ops! Non così in fretta...',
            errorDescription: `<muted-text><centered-text>Si è verificato un problema durante il trasferimento della proprietà di questo spazio di lavoro. Riprova oppure <concierge-link>contatta Concierge</concierge-link> per assistenza.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Attenzione!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `I seguenti report sono già stati esportati in ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Sei sicuro di volerli esportare di nuovo?`,
            confirmText: 'Sì, esporta di nuovo',
            cancelText: 'Annulla',
        },
        upgrade: {
            reportFields: {
                title: 'Campi del report',
                description: `I campi del report ti permettono di specificare dettagli a livello di intestazione, distinti dai tag che riguardano le spese delle singole voci. Questi dettagli possono includere nomi di progetti specifici, informazioni sui viaggi di lavoro, località e altro ancora.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I campi del report sono disponibili solo nel piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Goditi la sincronizzazione automatizzata e riduci le registrazioni manuali con l’integrazione Expensify + NetSuite. Ottieni approfondite informazioni finanziarie in tempo reale con il supporto per segmenti nativi e personalizzati, inclusa la mappatura di progetti e clienti.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>L'integrazione con NetSuite è disponibile solo nel piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Goditi la sincronizzazione automatica e riduci le registrazioni manuali con l’integrazione Expensify + Sage Intacct. Ottieni approfondimenti finanziari dettagliati e in tempo reale con dimensioni definite dall’utente, oltre alla codifica delle spese per reparto, classe, sede, cliente e progetto (lavoro).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>La nostra integrazione con Sage Intacct è disponibile solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Goditi la sincronizzazione automatizzata e riduci le registrazioni manuali con l’integrazione Expensify + QuickBooks Desktop. Ottieni la massima efficienza con una connessione bidirezionale in tempo reale e la codifica delle spese per classe, articolo, cliente e progetto.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>La nostra integrazione con QuickBooks Desktop è disponibile solo nel piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Approvazioni avanzate',
                description: `Se vuoi aggiungere più livelli di approvazione al processo – o semplicemente assicurarti che le spese più grandi ricevano un’ulteriore verifica – ci pensiamo noi. Le approvazioni avanzate ti aiutano a inserire i controlli giusti a ogni livello, così da mantenere sotto controllo le spese del tuo team.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le approvazioni avanzate sono disponibili solo nel piano Control, che parte da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            categories: {
                title: 'Categorie',
                description: 'Le categorie ti permettono di monitorare e organizzare le spese. Usa le nostre categorie predefinite oppure aggiungi le tue.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le categorie sono disponibili con il piano Collect, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            glCodes: {
                title: 'Codici contabili',
                description: `Aggiungi codici GL alle tue categorie e ai tuoi tag per esportare facilmente le spese nei tuoi sistemi di contabilità e paghe.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I codici GL sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Codici contabili e paghe',
                description: `Aggiungi codici contabili e di libro paga alle tue categorie per esportare facilmente le spese nei tuoi sistemi di contabilità e paghe.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I codici GL e Payroll sono disponibili solo nel piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Codici imposta',
                description: `Aggiungi codici IVA alle tue imposte per esportare facilmente le spese nei tuoi sistemi di contabilità e paghe.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I codici fiscali sono disponibili solo nel piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            companyCards: {
                title: 'Carte aziendali illimitate',
                description: `Devi aggiungere altri feed di carte? Sblocca carte aziendali illimitate per sincronizzare le transazioni da tutti i principali emittenti di carte.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Questa funzione è disponibile solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            rules: {
                title: 'Regole',
                description: `Le regole vengono eseguite in background e tengono sotto controllo le tue spese, così non devi preoccuparti delle piccole cose.

Richiedi dettagli di spesa come ricevute e descrizioni, imposta limiti e valori predefiniti e automatizza approvazioni e pagamenti, tutto in un unico posto.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le regole sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            perDiem: {
                title: 'Diaria',
                description:
                    'Il per diem è un ottimo modo per mantenere prevedibili e conformi ai requisiti i costi giornalieri ogni volta che i tuoi dipendenti viaggiano. Sfrutta funzionalità come tariffe personalizzate, categorie predefinite e dettagli più granulari come destinazioni e sotto-tariffe.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le indennità giornaliere sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            travel: {
                title: 'Viaggio',
                description:
                    'Expensify Travel è una nuova piattaforma aziendale per la prenotazione e la gestione dei viaggi che consente ai membri di prenotare alloggi, voli, trasporti e altro ancora.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Travel è disponibile con il piano Collect, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            reports: {
                title: 'Report',
                description: 'I report ti permettono di raggruppare le spese per una più semplice tracciabilità e organizzazione.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I report sono disponibili con il piano Collect, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tag multilivello',
                description:
                    'I Tag Multilivello ti aiutano a monitorare le spese con maggiore precisione. Assegna più tag a ogni voce di spesa, ad esempio reparto, cliente o centro di costo, per acquisire il contesto completo di ogni spesa. Questo consente reportistica più dettagliata, flussi di approvazione e esportazioni contabili.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I tag multilivello sono disponibili solo nel piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Tariffe distanza',
                description: 'Crea e gestisci le tue tariffe, monitora in miglia o chilometri e imposta categorie predefinite per le spese di distanza.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le tariffe per la distanza sono disponibili con il piano Collect, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            auditor: {
                title: 'Revisore',
                description: 'I revisori ottengono accesso in sola lettura a tutti i report per una visibilità completa e il monitoraggio della conformità.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Gli auditor sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Livelli di approvazione multipli',
                description:
                    'I livelli multipli di approvazione sono uno strumento di workflow per le aziende che richiedono che più di una persona approvi un report prima che possa essere rimborsato.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Livelli di approvazione multipli sono disponibili solo nel piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'per membro attivo al mese.',
                perMember: 'per membro al mese.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Esegui l’upgrade per accedere a questa funzione oppure <a href="${subscriptionLink}">scopri di più</a> sui nostri piani e prezzi.</muted-text>`,
            upgradeToUnlock: 'Sblocca questa funzionalità',
            completed: {
                headline: `Hai aggiornato il tuo spazio di lavoro!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Hai aggiornato correttamente ${policyName} al piano Control! <a href="${subscriptionLink}">Visualizza il tuo abbonamento</a> per maggiori dettagli.</centered-text>`,
                categorizeMessage: `Hai effettuato l’upgrade al piano Collect con successo. Ora puoi categorizzare le tue spese!`,
                travelMessage: `Hai eseguito correttamente l’upgrade al piano Collect. Ora puoi iniziare a prenotare e gestire i viaggi!`,
                distanceRateMessage: `Hai effettuato correttamente l’upgrade al piano Collect. Ora puoi modificare la tariffa distanza!`,
                gotIt: 'Ho capito, grazie',
                createdWorkspace: `Hai creato uno spazio di lavoro!`,
            },
            commonFeatures: {
                title: 'Passa al piano Control',
                note: 'Sblocca le nostre funzionalità più potenti, tra cui:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Il piano Control parte da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per membro attivo al mese.`} <a href="${learnMoreMethodsRoute}">Scopri di più</a> sui nostri piani e prezzi.</muted-text>`,
                    benefit1: 'Connessioni avanzate di contabilità (NetSuite, Sage Intacct e altro)',
                    benefit2: 'Regole intelligenti per le spese',
                    benefit3: 'Flussi di approvazione multilivello',
                    benefit4: 'Controlli di sicurezza avanzati',
                    toUpgrade: 'Per eseguire l’upgrade, fai clic',
                    selectWorkspace: 'seleziona uno spazio di lavoro e modifica il tipo di piano in',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Esegui il downgrade al piano Collect',
                note: 'Se esegui il downgrade, perderai l’accesso a queste funzionalità e ad altre ancora:',
                benefits: {
                    note: 'Per un confronto completo dei nostri piani, consulta la nostra',
                    pricingPage: 'pagina dei prezzi',
                    confirm: 'Sei sicuro di voler effettuare il downgrade e rimuovere le tue configurazioni?',
                    warning: 'Questa operazione non può essere annullata.',
                    benefit1: 'Connessioni contabili (tranne QuickBooks Online e Xero)',
                    benefit2: 'Regole intelligenti per le spese',
                    benefit3: 'Flussi di approvazione multilivello',
                    benefit4: 'Controlli di sicurezza avanzati',
                    headsUp: 'Attenzione!',
                    multiWorkspaceNote:
                        'Dovrai effettuare il downgrade di tutti i tuoi workspace prima del primo pagamento mensile per iniziare un abbonamento alla tariffa Collect. Fai clic',
                    selectStep: '> seleziona ogni spazio di lavoro > cambia il tipo di piano in',
                },
            },
            completed: {
                headline: 'Il tuo spazio di lavoro è stato declassato',
                description: 'Hai altri spazi di lavoro sul piano Control. Per essere fatturato alla tariffa Collect, devi effettuare il downgrade di tutti gli spazi di lavoro.',
                gotIt: 'Ho capito, grazie',
            },
        },
        payAndDowngrade: {
            title: 'Paga e effettua il downgrade',
            headline: 'Il tuo pagamento finale',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Il tuo conto finale per questo abbonamento sarà di <strong>${formattedAmount}</strong>`,
            description2: ({date}: DateParams) => `Vedi il tuo riepilogo qui sotto per il ${date}:`,
            subscription:
                'Attenzione! Questa azione terminerà il tuo abbonamento a Expensify, eliminerà questo spazio di lavoro e rimuoverà tutti i membri dello spazio di lavoro. Se vuoi mantenere questo spazio di lavoro e rimuovere solo te stesso, fai prima assumere la gestione della fatturazione a un altro amministratore.',
            genericFailureMessage: 'Si è verificato un errore durante il pagamento della tua fattura. Riprova.',
        },
        restrictedAction: {
            restricted: 'Limitato',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Le azioni nello spazio di lavoro ${workspaceName} sono attualmente limitate`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Il proprietario dello spazio di lavoro, ${workspaceOwnerName}, dovrà aggiungere o aggiornare la carta di pagamento salvata per sbloccare le nuove attività dello spazio di lavoro.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Dovrai aggiungere o aggiornare la carta di pagamento registrata per sbloccare la nuova attività dell’area di lavoro.',
            addPaymentCardToUnlock: 'Aggiungi una carta di pagamento per sbloccare!',
            addPaymentCardToContinueUsingWorkspace: 'Aggiungi una carta di pagamento per continuare a utilizzare questo spazio di lavoro',
            pleaseReachOutToYourWorkspaceAdmin: 'Contatta l’amministratore del tuo workspace per qualsiasi domanda.',
            chatWithYourAdmin: 'Chatta con il tuo amministratore',
            chatInAdmins: 'Chatta in #admins',
            addPaymentCard: 'Aggiungi carta di pagamento',
            goToSubscription: 'Vai all’abbonamento',
        },
        rules: {
            individualExpenseRules: {
                title: 'Spese',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>Imposta controlli di spesa e valori predefiniti per le singole spese. Puoi anche creare regole per le <a href="${categoriesPageLink}">categorie</a> e i <a href="${tagsPageLink}">tag</a>.</muted-text>`,
                receiptRequiredAmount: 'Importo richiesto per la ricevuta',
                receiptRequiredAmountDescription: 'Richiedi ricevute quando la spesa supera questo importo, a meno che non venga sostituito da una regola di categoria.',
                maxExpenseAmount: 'Importo massimo spesa',
                maxExpenseAmountDescription: 'Contrassegna le spese che superano questo importo, a meno che non siano sostituite da una regola di categoria.',
                maxAge: 'Età massima',
                maxExpenseAge: 'Età massima spesa',
                maxExpenseAgeDescription: 'Segnala le spese più vecchie di un numero specifico di giorni.',
                maxExpenseAgeDays: () => ({
                    one: '1 giorno',
                    other: (count: number) => `${count} giorni`,
                }),
                cashExpenseDefault: 'Impostazione predefinita per spese in contanti',
                cashExpenseDefaultDescription:
                    'Scegli come devono essere create le spese in contanti. Una spesa è considerata una spesa in contanti se non è una transazione di carta aziendale importata. Questo include le spese create manualmente, le ricevute, le indennità giornaliere, le spese di distanza e di tempo.',
                reimbursableDefault: 'Rimborsabile',
                reimbursableDefaultDescription: 'Le spese vengono più spesso rimborsate ai dipendenti',
                nonReimbursableDefault: 'Non rimborsabile',
                nonReimbursableDefaultDescription: 'Le spese vengono occasionalmente rimborsate ai dipendenti',
                alwaysReimbursable: 'Sempre rimborsabile',
                alwaysReimbursableDescription: 'Le spese vengono sempre rimborsate ai dipendenti',
                alwaysNonReimbursable: 'Sempre non rimborsabile',
                alwaysNonReimbursableDescription: 'Le spese non vengono mai rimborsate ai dipendenti',
                billableDefault: 'Addebitabile predefinito',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>Scegli se le spese in contanti e con carta di credito devono essere fatturabili per impostazione predefinita. Le spese fatturabili vengono abilitate o disabilitate in <a href="${tagsPageLink}">tag</a>.</muted-text>`,
                billable: 'Fatturabile',
                billableDescription: 'Le spese vengono più spesso rifatturate ai clienti',
                nonBillable: 'Non fatturabile',
                nonBillableDescription: 'Le spese vengono occasionalmente rifatturate ai clienti',
                eReceipts: 'eRicevute',
                eReceiptsHint: `Le eReceipt vengono create automaticamente [per la maggior parte delle transazioni con carta di credito in USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Monitoraggio partecipanti',
                attendeeTrackingHint: 'Tieni traccia del costo per persona per ogni spesa.',
                prohibitedDefaultDescription:
                    'Contrassegna tutte le ricevute in cui compaiono alcolici, gioco d’azzardo o altri articoli soggetti a restrizioni. Le spese con ricevute in cui compaiono queste voci richiederanno una revisione manuale.',
                prohibitedExpenses: 'Spese vietate',
                alcohol: 'Alcol',
                hotelIncidentals: "Spese accessorie dell'hotel",
                gambling: "Gioco d'azzardo",
                tobacco: 'Tabacco',
                adultEntertainment: 'Intrattenimento per adulti',
            },
            expenseReportRules: {
                title: 'Note spese',
                subtitle: 'Automatizza la conformità, le approvazioni e il pagamento dei report spese.',
                preventSelfApprovalsTitle: 'Impedisci auto-approvazioni',
                preventSelfApprovalsSubtitle: 'Impedisci ai membri dell’area di lavoro di approvare le proprie note spese.',
                autoApproveCompliantReportsTitle: 'Approva automaticamente i report conformi',
                autoApproveCompliantReportsSubtitle: "Configura quali note spese sono idonee per l'approvazione automatica.",
                autoApproveReportsUnderTitle: 'Approvazione automatica dei report inferiori a',
                autoApproveReportsUnderDescription: 'Le note spese completamente conformi inferiori a questo importo saranno approvate automaticamente.',
                randomReportAuditTitle: 'Verifica casuale del report',
                randomReportAuditDescription: 'Richiedi che alcuni report siano approvati manualmente, anche se idonei per l’approvazione automatica.',
                autoPayApprovedReportsTitle: 'Report approvati con pagamento automatico',
                autoPayApprovedReportsSubtitle: 'Configura quali note spese sono idonee per il pagamento automatico.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Inserisci un importo inferiore a ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Vai su Altre funzionalità e abilita i Workflow, quindi aggiungi i Pagamenti per sbloccare questa funzionalità.',
                autoPayReportsUnderTitle: 'Paga automaticamente i report inferiori a',
                autoPayReportsUnderDescription: 'Le note spese pienamente conformi inferiori a questo importo saranno pagate automaticamente.',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Vai a [altre funzionalità](${moreFeaturesLink}) e abilita i flussi di lavoro, quindi aggiungi ${featureName} per sbloccare questa funzionalità.`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Vai a [altre funzionalità](${moreFeaturesLink}) e abilita ${featureName} per sbloccare questa funzionalità.`,
            },
            categoryRules: {
                title: 'Regole di categoria',
                approver: 'Approvatore',
                requireDescription: 'Richiedi descrizione',
                descriptionHint: 'Suggerimento descrizione',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Ricorda ai dipendenti di fornire informazioni aggiuntive per le spese nella categoria “${categoryName}”. Questo suggerimento viene visualizzato nel campo descrizione delle spese.`,
                descriptionHintLabel: 'Suggerimento',
                descriptionHintSubtitle: 'Suggerimento: più è breve, meglio è!',
                maxAmount: 'Importo massimo',
                flagAmountsOver: 'Contrassegna gli importi superiori a',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Si applica alla categoria “${categoryName}”.`,
                flagAmountsOverSubtitle: 'Questa impostazione sostituisce l’importo massimo per tutte le spese.',
                expenseLimitTypes: {
                    expense: 'Spesa singola',
                    expenseSubtitle:
                        'Contrassegna gli importi delle spese per categoria. Questa regola sostituisce la regola generale dello spazio di lavoro per l’importo massimo della spesa.',
                    daily: 'Totale categoria',
                    dailySubtitle: 'Contrassegna la spesa totale per categoria per ogni rapporto spese.',
                },
                requireReceiptsOver: 'Richiedi ricevute superiori a',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Predefinito`,
                    never: 'Non richiedere mai ricevute',
                    always: 'Richiedi sempre le ricevute',
                },
                defaultTaxRate: 'Aliquota fiscale predefinita',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Vai su [Altre funzionalità](${moreFeaturesLink}) e abilita i flussi di lavoro, quindi aggiungi le approvazioni per sbloccare questa funzione.`,
            },
            customRules: {
                title: 'Policy di spesa',
                cardSubtitle: 'Qui è dove si trova la policy spese del tuo team, così tutti sanno esattamente cosa è coperto.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Raccogli',
                    description: 'Per i team che desiderano automatizzare i propri processi.',
                },
                corporate: {
                    label: 'Controllo',
                    description: 'Per le organizzazioni con requisiti avanzati.',
                },
            },
            description: 'Scegli un piano adatto a te. Per un elenco dettagliato di funzionalità e prezzi, consulta la nostra',
            subscriptionLink: 'pagina di aiuto sui tipi di piani e sui prezzi',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Ti sei impegnato a mantenere 1 membro attivo nel piano Control fino alla fine dell’abbonamento annuale il ${annualSubscriptionEndDate}. Puoi passare a un abbonamento a consumo e effettuare il downgrade al piano Collect a partire dal ${annualSubscriptionEndDate} disattivando il rinnovo automatico in`,
                other: `Hai sottoscritto ${count} membri attivi nel piano Control fino alla fine del tuo abbonamento annuale il ${annualSubscriptionEndDate}. Puoi passare a un abbonamento a consumo e effettuare il downgrade al piano Collect a partire dal ${annualSubscriptionEndDate} disattivando il rinnovo automatico in`,
            }),
            subscriptions: 'Abbonamenti',
        },
    },
    getAssistancePage: {
        title: 'Ottieni assistenza',
        subtitle: 'Siamo qui per spianarti la strada verso la grandezza!',
        description: 'Scegli tra le seguenti opzioni di supporto:',
        chatWithConcierge: 'Chatta con Concierge',
        scheduleSetupCall: 'Programma una chiamata di configurazione',
        scheduleACall: 'Pianifica chiamata',
        questionMarkButtonTooltip: 'Ottieni assistenza dal nostro team',
        exploreHelpDocs: 'Esplora la documentazione di supporto',
        registerForWebinar: 'Registrati al webinar',
        onboardingHelp: 'Guida alla configurazione iniziale',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Cambia tono della pelle predefinito',
        headers: {
            frequentlyUsed: 'Utilizzati di frequente',
            smileysAndEmotion: 'Faccine ed emozioni',
            peopleAndBody: 'Persone e corpo',
            animalsAndNature: 'Animali e natura',
            foodAndDrink: 'Cibo e bevande',
            travelAndPlaces: 'Viaggi e luoghi',
            activities: 'Attività',
            objects: 'Oggetti',
            symbols: 'Simboli',
            flags: 'Contrassegni',
        },
    },
    newRoomPage: {
        newRoom: 'Nuova stanza',
        groupName: 'Nome del gruppo',
        roomName: 'Nome stanza',
        visibility: 'Visibilità',
        restrictedDescription: 'Le persone nel tuo spazio di lavoro possono trovare questa stanza',
        privateDescription: 'Le persone invitate a questa stanza possono trovarla',
        publicDescription: 'Chiunque può trovare questa stanza',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Chiunque può trovare questa stanza',
        createRoom: 'Crea stanza',
        roomAlreadyExistsError: 'Esiste già una stanza con questo nome',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} è una stanza predefinita in tutti gli spazi di lavoro. Scegli un altro nome.`,
        roomNameInvalidError: 'I nomi delle stanze possono includere solo lettere minuscole, numeri e trattini',
        pleaseEnterRoomName: 'Inserisci un nome per la stanza',
        pleaseSelectWorkspace: 'Seleziona un workspace',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport
                ? `${actor}rinominato in "${newName}" (precedentemente "${oldName}")`
                : `${actor}ha rinominato questa stanza in "${newName}" (precedentemente "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Stanza rinominata in ${newName}`,
        social: 'social',
        selectAWorkspace: 'Seleziona uno spazio di lavoro',
        growlMessageOnRenameError: 'Impossibile rinominare la stanza dello spazio di lavoro. Controlla la connessione e riprova.',
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
        submitAndApprove: 'Invia e approva',
        advanced: 'AVANZATO',
        dynamicExternal: 'DINAMICO_ESTERNO',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `ha aggiunto ${approverName} (${approverEmail}) come approvatore per il campo ${field} "${name}"`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `ha rimosso ${approverName} (${approverEmail}) come approvatore per il campo ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `ha modificato l’approvatore per il ${field} "${name}" in ${formatApprover(newApproverName, newApproverEmail)} (in precedenza ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `ha aggiunto la categoria "${categoryName}"`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `ha rimosso la categoria "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'disabilitato' : 'abilitato'} la categoria "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `ha aggiunto il codice paghe "${newValue}" alla categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `ha rimosso il codice paghe "${oldValue}" dalla categoria "${categoryName}"`;
            }
            return `ha modificato il codice paghe della categoria "${categoryName}" in “${newValue}” (in precedenza “${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `aggiunto il codice GL "${newValue}" alla categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `ha rimosso il codice GL "${oldValue}" dalla categoria "${categoryName}"`;
            }
            return `ha modificato il codice GL della categoria “${categoryName}” in “${newValue}” (precedentemente “${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `ha modificato la descrizione della categoria "${categoryName}" in ${!oldValue ? 'obbligatorio' : 'non obbligatorio'} (in precedenza ${!oldValue ? 'non obbligatorio' : 'obbligatorio'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `ha aggiunto un importo massimo di ${newAmount} alla categoria "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `ha rimosso l’importo massimo di ${oldAmount} dalla categoria "${categoryName}"`;
            }
            return `ha modificato l’importo massimo della categoria "${categoryName}" a ${newAmount} (in precedenza ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `ha aggiunto un tipo di limite di ${newValue} alla categoria "${categoryName}"`;
            }
            return `ha modificato il tipo di limite della categoria "${categoryName}" in ${newValue} (in precedenza ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `ha aggiornato la categoria "${categoryName}" modificando Ricevute in ${newValue}`;
            }
            return `ha modificato la categoria "${categoryName}" in ${newValue} (precedentemente ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `ha rinominato la categoria da "${oldName}" a "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `ha rimosso il suggerimento di descrizione «${oldValue}» dalla categoria «${categoryName}»`;
            }
            return !oldValue
                ? `ha aggiunto il suggerimento di descrizione "${newValue}" alla categoria "${categoryName}"`
                : `ha modificato il suggerimento della descrizione della categoria "${categoryName}" in “${newValue}” (in precedenza “${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `ha cambiato il nome dell’elenco tag in "${newName}" (in precedenza "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `ha aggiunto il tag "${tagName}" all'elenco "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `ha aggiornato l’elenco dei tag "${tagListName}" modificando il tag "${oldName}" in "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'abilitato' : 'disabilitato'} il tag "${tagName}" nell'elenco "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `ha rimosso il tag "${tagName}" dall'elenco "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `rimossi i tag "${count}" dall'elenco "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `ha aggiornato il tag "${tagName}" nell'elenco "${tagListName}" cambiando ${updatedField} in "${newValue}" (precedentemente "${oldValue}")`;
            }
            return `ha aggiornato il tag "${tagName}" nella lista "${tagListName}" aggiungendo un ${updatedField} di "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `ha modificato ${customUnitName} ${updatedField} in "${newValue}" (in precedenza "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Monitoraggio imposte ${newValue ? 'abilitato' : 'disabilitato'} sulle tariffe per distanza`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `ha aggiunto una nuova tariffa "${customUnitName}" "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `ha modificato la tariffa di ${customUnitName} ${updatedField} "${customUnitRateName}" in "${newValue}" (precedentemente "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `ha modificato l’aliquota fiscale sulla tariffa per distanza "${customUnitRateName}" in "${newValue} (${newTaxPercentage})" (precedentemente "${oldValue} (${oldTaxPercentage})")`;
            }
            return `ha aggiunto l'aliquota fiscale "${newValue} (${newTaxPercentage})" alla tariffa chilometrica "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `ha modificato la parte rimborsabile delle tasse sulla tariffa distanza "${customUnitRateName}" a "${newValue}" (in precedenza "${oldValue}")`;
            }
            return `ha aggiunto una parte di imposta rimborsabile di "${newValue}" alla tariffa distanza "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `ha rimosso l’aliquota "${rateName}" per l’unità personalizzata "${customUnitName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `aggiunto campo di report ${fieldType} "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `imposta il valore predefinito del campo report "${fieldName}" su "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `ha aggiunto l’opzione "${optionName}" al campo del report "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `ha rimosso l’opzione «${optionName}» dal campo report «${fieldName}»`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'abilitato' : 'disabilitato'} l'opzione "${optionName}" per il campo del report "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'abilitato' : 'disabilitato'} tutte le opzioni per il campo del report "${fieldName}"`;
            }
            return `${allEnabled ? 'abilitato' : 'disabilitato'} l'opzione "${optionName}" per il campo report "${fieldName}", rendendo tutte le opzioni ${allEnabled ? 'abilitato' : 'disabilitato'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `campo ${fieldType} del report "${fieldName}" rimosso`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `aggiornato "Impedisci l'auto-approvazione" in "${newValue === 'true' ? 'Abilitato' : 'Disabilitato'}" (precedentemente "${oldValue === 'true' ? 'Abilitato' : 'Disabilitato'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `ha modificato l’importo massimo spesa che richiede ricevuta a ${newValue} (in precedenza ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `ha modificato l'importo massimo della spesa per le violazioni a ${newValue} (in precedenza ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aggiornato "Età massima rimborso (giorni)" in "${newValue}" (in precedenza "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `imposta la data di invio del report mensile su "${newValue}"`;
            }
            return `ha aggiornato la data di invio del report mensile a "${newValue}" (in precedenza "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aggiornato "Ri-addebita le spese ai clienti" in "${newValue}" (in precedenza "${oldValue}")`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aggiornato "Impostazione predefinita per le spese in contanti" in "${newValue}" (precedentemente "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `ha attivato "Applicare i titoli predefiniti dei report" ${value ? 'attivo' : 'disattivato'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `ha aggiornato il nome di questo workspace in "${newName}" (precedentemente "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `imposta la descrizione di questo workspace su "${newDescription}"`
                : `ha aggiornato la descrizione di questo workspace in "${newDescription}" (precedentemente "${oldDescription}")`,
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
                one: `ti ha rimosso dal workflow di approvazione e dalla chat delle spese di ${joinedNames}. I report inviati in precedenza rimarranno disponibili per l’approvazione nella tua Posta in arrivo.`,
                other: `ti ha rimosso dai flussi di approvazione e dalle chat sulle spese di ${joinedNames}. I report inviati in precedenza resteranno disponibili per l’approvazione nella tua Posta in arrivo.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `ha aggiornato il tuo ruolo in ${policyName} da ${oldRole} a utente. Sei stato rimosso da tutte le chat di spesa degli autori, tranne dalla tua.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `ha aggiornato la valuta predefinita in ${newCurrency} (precedentemente ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `ha aggiornato la frequenza di creazione automatica dei report su "${newFrequency}" (in precedenza "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `ha aggiornato la modalità di approvazione in "${newValue}" (precedentemente "${oldValue}")`,
        upgradedWorkspace: 'ha eseguito l’upgrade di questo spazio di lavoro al piano Control',
        forcedCorporateUpgrade: `Questo spazio di lavoro è stato aggiornato al piano Control. Fai clic <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">qui</a> per maggiori informazioni.`,
        downgradedWorkspace: 'ha effettuato il downgrade di questo workspace al piano Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `ha modificato la percentuale dei report instradati casualmente per l’approvazione manuale al ${Math.round(newAuditRate * 100)}% (in precedenza ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `ha modificato il limite di approvazione manuale per tutte le spese a ${newLimit} (in precedenza ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'abilitato' : 'disabilitato'} categorie`;
                case 'tags':
                    return `${enabled ? 'abilitato' : 'disabilitato'} etichette`;
                case 'workflows':
                    return `${enabled ? 'abilitato' : 'disabilitato'} flussi di lavoro`;
                case 'distance rates':
                    return `Tariffe distanza ${enabled ? 'abilitato' : 'disabilitato'}`;
                case 'accounting':
                    return `${enabled ? 'abilitato' : 'disabilitato'} contabilità`;
                case 'Expensify Cards':
                    return `${enabled ? 'abilitato' : 'disabilitato'} Carte Expensify`;
                case 'company cards':
                    return `${enabled ? 'abilitato' : 'disabilitato'} carte aziendali`;
                case 'invoicing':
                    return `Fatturazione ${enabled ? 'abilitato' : 'disabilitato'}`;
                case 'per diem':
                    return `${enabled ? 'abilitato' : 'disabilitato'} diaria`;
                case 'receipt partners':
                    return `${enabled ? 'abilitato' : 'disabilitato'} partner delle ricevute`;
                case 'rules':
                    return `${enabled ? 'abilitato' : 'disabilitato'} regole`;
                case 'tax tracking':
                    return `Monitoraggio imposta ${enabled ? 'abilitato' : 'disabilitato'}`;
                default:
                    return `${enabled ? 'abilitato' : 'disabilitato'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `Monitoraggio partecipanti ${enabled ? 'abilitato' : 'disabilitato'}`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'abilitato' : 'disabilitato'} rimborsi per questo spazio di lavoro`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `ha aggiunto l'imposta "${taxName}"`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `ha rimosso l’imposta "${taxName}"`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `ha rinominato l’imposta da “${oldValue}” a “${newValue}”`;
                }
                case 'code': {
                    return `ha modificato il codice fiscale per "${taxName}" da "${oldValue}" a "${newValue}"`;
                }
                case 'rate': {
                    return `ha modificato l’aliquota fiscale per "${taxName}" da "${oldValue}" a "${newValue}"`;
                }
                case 'enabled': {
                    return `${oldValue ? 'disabilitato' : 'abilitato'} l’imposta "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
    },
    roomMembersPage: {
        memberNotFound: 'Membro non trovato.',
        useInviteButton: 'Per invitare un nuovo membro alla chat, utilizza il pulsante di invito qui sopra.',
        notAuthorized: `Non hai accesso a questa pagina. Se stai cercando di unirti a questa stanza, chiedi semplicemente a un membro della stanza di aggiungerti. Altro? Contatta ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Sembra che questa stanza sia stata archiviata. Per domande, contatta ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Sei sicuro di voler rimuovere ${memberName} dalla stanza?`,
            other: 'Sei sicuro di voler rimuovere i membri selezionati dalla stanza?',
        }),
        error: {
            genericAdd: 'Si è verificato un problema nell’aggiunta di questo membro della stanza',
        },
    },
    newTaskPage: {
        assignTask: 'Assegna attività',
        assignMe: 'Assegna a me',
        confirmTask: 'Conferma attività',
        confirmError: 'Inserisci un titolo e seleziona una destinazione di condivisione',
        descriptionOptional: 'Descrizione (facoltativo)',
        pleaseEnterTaskName: 'Inserisci un titolo',
        pleaseEnterTaskDestination: 'Seleziona dove vuoi condividere questa attività',
    },
    task: {
        task: 'Attività',
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
            error: 'Non hai l’autorizzazione per eseguire l’azione richiesta',
        },
        markAsComplete: 'Segna come completato',
        markAsIncomplete: 'Contrassegna come incompleto',
        assigneeError: "Si è verificato un errore durante l'assegnazione di questa attività. Prova con un altro assegnatario.",
        genericCreateTaskFailureMessage: 'Si è verificato un errore durante la creazione di questa attività. Riprova più tardi.',
        deleteTask: 'Elimina attività',
        deleteConfirmation: 'Sei sicuro di voler eliminare questa attività?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Estratto conto di ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Scorciatoie da tastiera',
        subtitle: 'Risparmia tempo con queste comode scorciatoie da tastiera:',
        shortcuts: {
            openShortcutDialog: 'Apre la finestra di dialogo delle scorciatoie da tastiera',
            markAllMessagesAsRead: 'Segna tutti i messaggi come letti',
            escape: 'Finestre di dialogo di uscita',
            search: 'Apri finestra di ricerca',
            newChat: 'Nuova schermata chat',
            copy: 'Copia commento',
            openDebug: 'Apri la finestra di dialogo delle preferenze di test',
        },
    },
    guides: {
        screenShare: 'Condivisione schermo',
        screenShareRequest: 'Expensify ti sta invitando a una condivisione dello schermo',
    },
    search: {
        resultsAreLimited: 'I risultati di ricerca sono limitati.',
        viewResults: 'Visualizza risultati',
        resetFilters: 'Reimposta filtri',
        searchResults: {
            emptyResults: {
                title: 'Niente da mostrare',
                subtitle: `Prova a modificare i criteri di ricerca o a creare qualcosa con il pulsante +.`,
            },
            emptyExpenseResults: {
                title: 'Non hai ancora creato alcuna spesa',
                subtitle: 'Crea una spesa o prova Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per creare una spesa.',
            },
            emptyReportResults: {
                title: 'Non hai ancora creato alcun rapporto',
                subtitle: 'Crea un report o prova Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per creare un report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Non hai ancora creato
                    alcuna fattura
                `),
                subtitle: 'Invia una fattura o prova Expensify per saperne di più.',
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
                buttonText: 'Crea report',
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
                subtitle: 'È il momento di rilassarsi, bel lavoro.',
            },
            emptyStatementsResults: {
                title: 'Nessuna spesa da visualizzare',
                subtitle: 'Nessun risultato. Prova a modificare i filtri.',
            },
            emptyUnapprovedResults: {
                title: 'Nessuna spesa da approvare',
                subtitle: 'Zero spese. Massimo relax. Ben fatto!',
            },
        },
        statements: 'Estratti conto',
        unapprovedCash: 'Contanti non approvati',
        unapprovedCard: 'Carta non approvata',
        reconciliation: 'Riconciliazione',
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
            hold: 'In attesa',
            unhold: 'Rimuovi blocco',
            reject: 'Rifiuta',
            noOptionsAvailable: 'Nessuna opzione disponibile per il gruppo di spese selezionato.',
        },
        filtersHeader: 'Filtri',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Prima di ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Dopo ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `Su ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Mai',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Lo scorso mese',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Questo mese',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Ultimo estratto conto',
                },
            },
            status: 'Stato',
            keyword: 'Parola chiave',
            keywords: 'Parole chiave',
            currency: 'Valuta',
            completed: 'Completato',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Meno di ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Maggiore di ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Tra ${greaterThan} e ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Uguale a ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Carte individuali',
                closedCards: 'Carte chiuse',
                cardFeeds: 'Flussi carta',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Tutte le ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Tutte le carte CSV importate${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} è ${value}`,
            current: 'Attuale',
            past: 'Passato',
            submitted: 'Inviato',
            approved: 'Approvato',
            paid: 'Pagato',
            exported: 'Esportato',
            posted: 'Pubblicato',
            withdrawn: 'Ritirato',
            billable: 'Fatturabile',
            reimbursable: 'Rimborsabile',
            purchaseCurrency: 'Valuta di acquisto',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'Da',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Carta',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'ID prelievo',
            },
            feed: 'Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Carta Expensify',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Rimborso',
            },
            is: 'È',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Invia',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Approva',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Paga',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Esporta',
            },
        },
        has: 'Ha',
        groupBy: 'Raggruppa per',
        moneyRequestReport: {
            emptyStateTitle: 'Questo report non ha spese.',
        },
        noCategory: 'Nessuna categoria',
        noTag: 'Nessun tag',
        expenseType: 'Tipo di spesa',
        withdrawalType: 'Tipo di prelievo',
        recentSearches: 'Ricerche recenti',
        recentChats: 'Chat recenti',
        searchIn: 'Cerca in',
        searchPlaceholder: 'Cerca qualcosa',
        suggestions: 'Suggerimenti',
        exportSearchResults: {
            title: 'Crea esportazione',
            description: 'Wow, sono davvero tanti elementi! Li raggrupperemo e Concierge ti invierà a breve un file.',
        },
        exportAll: {
            selectAllMatchingItems: 'Seleziona tutti gli elementi corrispondenti',
            allMatchingItemsSelected: 'Tutti gli elementi corrispondenti sono stati selezionati',
        },
    },
    genericErrorPage: {
        title: 'Oh-oh, qualcosa è andato storto!',
        body: {
            helpTextMobile: 'Chiudi e riapri l’app oppure passa a',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Se il problema persiste, contatta',
        },
        refresh: 'Aggiorna',
    },
    fileDownload: {
        success: {
            title: 'Scaricato!',
            message: 'Allegato scaricato correttamente!',
            qrMessage:
                'Controlla la cartella delle foto o dei download per una copia del tuo codice QR. Suggerimento: aggiungilo a una presentazione così il tuo pubblico può scannerizzarlo e connettersi direttamente con te.',
        },
        generalError: {
            title: 'Errore allegato',
            message: "Impossibile scaricare l'allegato",
        },
        permissionError: {
            title: "Accesso all'archiviazione",
            message: 'Expensify non può salvare gli allegati senza accesso all’archiviazione. Tocca Impostazioni per aggiornare le autorizzazioni.',
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
        redo: 'Ripeti',
        cut: 'Taglia',
        copy: 'Copia',
        paste: 'Incolla',
        pasteAndMatchStyle: 'Incolla e adatta lo stile',
        pasteAsPlainText: 'Incolla come testo semplice',
        delete: 'Elimina',
        selectAll: 'Seleziona tutto',
        speechSubmenu: 'Voce',
        startSpeaking: 'Inizia a parlare',
        stopSpeaking: 'Smetti di parlare',
        viewMenu: 'Visualizza',
        reload: 'Ricarica',
        forceReload: 'Forza ricarica',
        resetZoom: 'Dimensioni effettive',
        zoomIn: 'Ingrandisci',
        zoomOut: 'Riduci ingrandimento',
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
        communityDiscussions: 'Discussioni della community',
        searchIssues: 'Cerca problemi',
    },
    historyMenu: {
        forward: 'Inoltra',
        back: 'Indietro',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Aggiornamento disponibile',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `La nuova versione sarà disponibile a breve.${!isSilentUpdating ? 'Ti avviseremo quando saremo pronti per eseguire l’aggiornamento.' : ''}`,
            soundsGood: 'Sembra buono',
        },
        notAvailable: {
            title: 'Aggiornamento non disponibile',
            message: 'Al momento non sono disponibili aggiornamenti. Per favore riprova più tardi!',
            okay: 'OK',
        },
        error: {
            title: 'Verifica aggiornamenti non riuscita',
            message: "Non è stato possibile verificare la presenza di un aggiornamento. Riprova tra un po'.",
        },
    },
    settlement: {
        status: {
            pending: 'In sospeso',
            cleared: 'Contabilizzato',
            failed: 'Non riuscito',
        },
        failedError: ({link}: {link: string}) => `Riproveremo questo regolamento quando <a href="${link}">sbloccherai il tuo account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • ID prelievo: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Layout del report',
        groupByLabel: 'Raggruppa per:',
        selectGroupByOption: 'Seleziona come raggruppare le spese del report',
        uncategorized: 'Senza categoria',
        noTag: 'Nessun tag',
        selectGroup: ({groupName}: {groupName: string}) => `Seleziona tutte le spese in ${groupName}`,
        groupBy: {
            category: 'Categoria',
            tag: 'Etichetta',
        },
    },
    report: {
        newReport: {
            createReport: 'Crea report',
            chooseWorkspace: 'Scegli uno spazio di lavoro per questo report.',
            emptyReportConfirmationTitle: 'Hai già un report vuoto',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Sei sicuro di voler creare un altro report in ${workspaceName}? Puoi accedere ai tuoi report vuoti in`,
            emptyReportConfirmationPromptLink: 'Report',
            genericWorkspaceName: 'questo spazio di lavoro',
        },
        genericCreateReportFailureMessage: 'Errore imprevisto durante la creazione di questa chat. Riprova più tardi.',
        genericAddCommentFailureMessage: 'Errore imprevisto durante l’invio del commento. Riprova più tardi.',
        genericUpdateReportFieldFailureMessage: "Errore imprevisto durante l'aggiornamento del campo. Riprova più tardi.",
        genericUpdateReportNameEditFailureMessage: 'Errore imprevisto durante la rinomina del report. Riprova più tardi.',
        noActivityYet: 'Ancuna nessuna attività',
        connectionSettings: 'Impostazioni di connessione',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `ha modificato ${fieldName} in "${newValue}" (precedentemente "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `imposta ${fieldName} su "${newValue}"`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `ha modificato lo spazio di lavoro${fromPolicyName ? `(in precedenza ${fromPolicyName})` : ''}`;
                    }
                    return `ha modificato lo spazio di lavoro in ${toPolicyName}${fromPolicyName ? `(in precedenza ${fromPolicyName})` : ''}`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `tipo modificato da ${oldType} a ${newType}`,
                exportedToCSV: `esportato in CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `esportato in ${translatedLabel}`;
                    },
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `esportato in ${label} tramite`,
                    automaticActionTwo: 'impostazioni contabilità',
                    manual: ({label}: ExportedToIntegrationParams) => `ha contrassegnato questo resoconto come esportato manualmente in ${label}.`,
                    automaticActionThree: 'e ha creato correttamente un record per',
                    reimburseableLink: 'spese vive',
                    nonReimbursableLink: 'spese con carta aziendale',
                    pending: ({label}: ExportedToIntegrationParams) => `ha iniziato a esportare questo report su ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `impossibile esportare questo report su ${label} ("${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `ha aggiunto una ricevuta`,
                managerDetachReceipt: `ha rimosso una ricevuta`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `pagato ${currency}${amount} altrove`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `pagato ${currency}${amount} tramite integrazione`,
                outdatedBankAccount: `non è stato possibile elaborare il pagamento a causa di un problema con il conto bancario del pagatore`,
                reimbursementACHBounce: `impossibile elaborare il pagamento a causa di un problema con il conto bancario`,
                reimbursementACHCancelled: `ha annullato il pagamento`,
                reimbursementAccountChanged: `impossibile elaborare il pagamento, poiché il pagatore ha cambiato conto bancario`,
                reimbursementDelayed: `ha elaborato il pagamento ma è in ritardo di 1-2 giorni lavorativi in più`,
                selectedForRandomAudit: `selezionato casualmente per la revisione`,
                selectedForRandomAuditMarkdown: `[selezionato casualmente](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) per la revisione`,
                share: ({to}: ShareParams) => `membro invitato ${to}`,
                unshare: ({to}: UnshareParams) => `membro rimosso ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `pagato ${currency}${amount}`,
                takeControl: `ha preso il controllo`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `si è verificato un problema durante la sincronizzazione con ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Risolvi il problema nelle <a href="${workspaceAccountingLink}">impostazioni dello spazio di lavoro</a>.`,
                addEmployee: ({email, role}: AddEmployeeParams) => `aggiunto ${email} come ${role === 'member' ? 'a' : 'un'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `ha aggiornato il ruolo di ${email} a ${newRole} (precedentemente ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `rimosso il campo personalizzato 1 di ${email} (in precedenza “${previousValue}”)`;
                    }
                    return !previousValue
                        ? `ha aggiunto "${newValue}" al campo personalizzato 1 di ${email}`
                        : `ha modificato il campo personalizzato 1 di ${email} in "${newValue}" (in precedenza "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `rimosso il campo personalizzato 2 di ${email} (precedentemente "${previousValue}")`;
                    }
                    return !previousValue
                        ? `ha aggiunto "${newValue}" al campo personalizzato 2 di ${email}`
                        : `ha modificato il campo personalizzato 2 di ${email} in "${newValue}" (in precedenza "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} ha lasciato lo spazio di lavoro`,
                removeMember: ({email, role}: AddEmployeeParams) => `${role} ${email} rimosso`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `connessione rimossa da ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `collegato a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'ha lasciato la chat',
            },
            error: {
                invalidCredentials: 'Credenziali non valide, verifica la configurazione della connessione.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} per ${dayCount} ${dayCount === 1 ? 'giorno' : 'giorni'} fino a ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} da ${timePeriod} il ${date}`,
    },
    footer: {
        features: 'Funzionalità',
        expenseManagement: 'Gestione delle spese',
        spendManagement: 'Gestione delle spese',
        expenseReports: 'Note spese',
        companyCreditCard: 'Carta di credito aziendale',
        receiptScanningApp: 'App per la scansione delle ricevute',
        billPay: 'Pagamento fatture',
        invoicing: 'Fatturazione',
        CPACard: 'Carta CPA',
        payroll: 'Paghe',
        travel: 'Viaggio',
        resources: 'Risorse',
        expensifyApproved: 'Approvato da Expensify!',
        pressKit: 'Kit stampa',
        support: 'Support',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Termini di servizio',
        privacy: 'Privacy',
        learnMore: 'Scopri di più',
        aboutExpensify: 'Informazioni su Expensify',
        blog: 'Blog',
        jobs: 'Lavori',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relazioni con gli investitori',
        getStarted: 'Inizia',
        createAccount: 'Crea un nuovo account',
        logIn: 'Accedi',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Torna all’elenco delle chat',
        chatWelcomeMessage: 'Messaggio di benvenuto della chat',
        navigatesToChat: 'Va a una chat',
        newMessageLineIndicator: 'Indicatore di nuova riga messaggio',
        chatMessage: 'Messaggio chat',
        lastChatMessagePreview: 'Anteprima ultimo messaggio di chat',
        workspaceName: "Nome dell'area di lavoro",
        chatUserDisplayNames: 'Nomi visualizzati dei membri della chat',
        scrollToNewestMessages: 'Scorri ai messaggi più recenti',
        preStyledText: 'Testo preformattato',
        viewAttachment: 'Visualizza allegato',
    },
    parentReportAction: {
        deletedReport: 'Report eliminato',
        deletedMessage: 'Messaggio eliminato',
        deletedExpense: 'Spesa eliminata',
        reversedTransaction: 'Transazione stornata',
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
        chooseAReason: 'Scegli un motivo per la segnalazione qui sotto:',
        spam: 'Spam',
        spamDescription: 'Promozione indesiderata fuori tema',
        inconsiderate: 'Sconsiderato',
        inconsiderateDescription: 'Frasi offensive o irrispettose, con intenzioni discutibili',
        intimidation: 'Intimidazione',
        intimidationDescription: 'Perseguire insistentemente un’agenda nonostante obiezioni valide',
        bullying: 'Bullismo',
        bullyingDescription: 'Prendere di mira un individuo per ottenere obbedienza',
        harassment: 'Molestie',
        harassmentDescription: 'Comportamento razzista, misogino o altre forme di discriminazione',
        assault: 'Aggressione',
        assaultDescription: 'Attacco emotivo mirato specificamente con l’intenzione di causare danno',
        flaggedContent: 'Questo messaggio è stato contrassegnato come non conforme alle nostre regole della community e il contenuto è stato nascosto.',
        hideMessage: 'Nascondi messaggio',
        revealMessage: 'Mostra messaggio',
        levelOneResult: 'Invia un avviso anonimo e il messaggio viene segnalato per la revisione.',
        levelTwoResult: 'Messaggio nascosto dal canale, con avviso anonimo, e il messaggio viene segnalato per la revisione.',
        levelThreeResult: 'Messaggio rimosso dal canale con avviso anonimo e messaggio segnalato per revisione.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Invita a inviare note spese',
        inviteToChat: 'Invita solo alla chat',
        nothing: 'Non fare nulla',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accetta',
        decline: 'Rifiuta',
    },
    actionableMentionTrackExpense: {
        submit: 'Invialo a qualcuno',
        categorize: 'Classificala',
        share: 'Condividilo con il mio commercialista',
        nothing: 'Niente per ora',
    },
    teachersUnitePage: {
        teachersUnite: 'Insegnanti uniti',
        joinExpensifyOrg:
            'Unisciti a Expensify.org per eliminare le ingiustizie nel mondo. L’attuale campagna “Teachers Unite” sostiene gli insegnanti ovunque, dividendo i costi delle forniture scolastiche essenziali.',
        iKnowATeacher: 'Conosco un insegnante',
        iAmATeacher: 'Sono un insegnante',
        getInTouch: 'Eccellente! Condividi le loro informazioni così possiamo metterci in contatto con loro.',
        introSchoolPrincipal: 'Introduzione al preside della tua scuola',
        schoolPrincipalVerifyExpense:
            'Expensify.org divide il costo del materiale scolastico essenziale affinché gli studenti provenienti da famiglie a basso reddito possano avere un’esperienza di apprendimento migliore. Al tuo preside verrà chiesto di verificare le tue spese.',
        principalFirstName: 'Nome principale',
        principalLastName: 'Cognome del titolare',
        principalWorkEmail: 'Email di lavoro principale',
        updateYourEmail: 'Aggiorna il tuo indirizzo email',
        updateEmail: 'Aggiorna indirizzo email',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `Prima di procedere, assicurati di impostare la tua email scolastica come metodo di contatto predefinito. Puoi farlo in Impostazioni > Profilo > <a href="${contactMethodsRoute}">Metodi di contatto</a>.`,
        error: {
            enterPhoneEmail: 'Inserisci un indirizzo email o un numero di telefono valido',
            enterEmail: "Inserisci un'email",
            enterValidEmail: "Inserisci un'email valida",
            tryDifferentEmail: 'Per favore prova con un’altra email',
        },
    },
    cardTransactions: {
        notActivated: 'Non attivato',
        outOfPocket: 'Spese vive',
        companySpend: 'Spesa aziendale',
    },
    distance: {
        addStop: 'Aggiungi fermata',
        deleteWaypoint: 'Elimina punto di passaggio',
        deleteWaypointConfirmation: 'Sei sicuro di voler eliminare questo waypoint?',
        address: 'Indirizzo',
        waypointDescription: {
            start: 'Inizia',
            stop: 'Interrompi',
        },
        mapPending: {
            title: 'Mappatura in sospeso',
            subtitle: 'La mappa verrà generata quando torni online',
            onlineSubtitle: 'Un momento mentre configuriamo la mappa',
            errorTitle: 'Errore mappa',
            errorSubtitle: 'Si è verificato un errore durante il caricamento della mappa. Riprova.',
        },
        error: {
            selectSuggestedAddress: 'Seleziona un indirizzo suggerito o usa la posizione attuale',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Pagella smarrita o danneggiata',
        nextButtonLabel: 'Avanti',
        reasonTitle: 'Perché ti serve una nuova carta?',
        cardDamaged: 'La mia carta è danneggiata',
        cardLostOrStolen: 'La mia carta è stata smarrita o rubata',
        confirmAddressTitle: "Conferma l'indirizzo postale per la tua nuova carta.",
        cardDamagedInfo: 'La tua nuova carta arriverà in 2-3 giorni lavorativi. La tua carta attuale continuerà a funzionare finché non attivi quella nuova.',
        cardLostOrStolenInfo:
            'La tua carta attuale verrà disattivata definitivamente non appena l’ordine sarà effettuato. La maggior parte delle carte arriva entro pochi giorni lavorativi.',
        address: 'Indirizzo',
        deactivateCardButton: 'Disattiva carta',
        shipNewCardButton: 'Spedisci nuova carta',
        addressError: "L'indirizzo è obbligatorio",
        reasonError: 'Motivo obbligatorio',
        successTitle: 'La tua nuova carta è in arrivo!',
        successDescription: 'Dovrai attivarla quando arriverà tra pochi giorni lavorativi. Nel frattempo, puoi usare una carta virtuale.',
    },
    eReceipt: {
        guaranteed: 'Scontrino elettronico garantito',
        transactionDate: 'Data transazione',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Inizia una chat, <success><strong>invita un amico</strong></success>.',
            header: 'Avvia una chat, invita un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Inizia una chat con loro e noi ci occuperemo del resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Invia una spesa, <success><strong>presenta il tuo team</strong></success>.',
            header: 'Invia una nota spese, invita il tuo team',
            body: 'Vuoi che anche il tuo team usi Expensify? Basta inviare loro una nota spese e noi ci occuperemo del resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Presenta un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Basta chattare, pagare o dividere una spesa con loro e penseremo noi al resto. Oppure condividi semplicemente il tuo link di invito!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Presenta un amico',
            header: 'Presenta un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Basta chattare, pagare o dividere una spesa con loro e penseremo noi al resto. Oppure condividi semplicemente il tuo link di invito!',
        },
        copyReferralLink: 'Copia link di invito',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chatta con il tuo specialista di configurazione in <a href="${href}">${adminReportName}</a> per assistenza`,
        default: `Invia un messaggio a <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> per assistenza con la configurazione`,
    },
    violations: {
        allTagLevelsRequired: 'Tutte le etichette obbligatorie',
        autoReportedRejectedExpense: 'Questa spesa è stata rifiutata.',
        billableExpense: 'Fatturabile non più valido',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Ricevuta richiesta${formattedLimit ? `oltre ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categoria non più valida',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Sovrapprezzo di conversione applicato del ${surcharge}%`,
        customUnitOutOfPolicy: 'Tariffa non valida per questo spazio di lavoro',
        duplicatedTransaction: 'Possibile duplicato',
        fieldRequired: 'I campi del report sono obbligatori',
        futureDate: 'Data futura non consentita',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Maggiorato del ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data precedente a ${maxAge} giorni`,
        missingCategory: 'Categoria mancante',
        missingComment: 'Descrizione obbligatoria per la categoria selezionata',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Manca ${tagName ?? 'etichetta'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return "L'importo è diverso dalla distanza calcolata";
                case 'card':
                    return 'Importo superiore alla transazione con carta';
                default:
                    if (displayPercentVariance) {
                        return `Importo superiore del ${displayPercentVariance}% rispetto alla ricevuta acquisita`;
                    }
                    return 'Importo maggiore della ricevuta scansionata';
            }
        },
        modifiedDate: 'La data è diversa da quella della ricevuta scansionata',
        nonExpensiworksExpense: 'Spesa non Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `La spesa supera il limite di approvazione automatica di ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Importo oltre il limite di categoria di ${formattedLimit}/persona`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Importo oltre il limite di ${formattedLimit}/persona`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Importo oltre il limite di ${formattedLimit}/viaggio`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Importo oltre il limite di ${formattedLimit}/persona`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Importo oltre il limite di categoria giornaliero di ${formattedLimit}/persona`,
        receiptNotSmartScanned: 'Dettagli di ricevuta e spesa aggiunti manualmente.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Ricevuta richiesta oltre il limite di categoria di ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Ricevuta richiesta per importi superiori a ${formattedLimit}`;
            }
            if (category) {
                return `Ricevuta richiesta oltre il limite della categoria`;
            }
            return 'Ricevuta richiesta';
        },
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Spesa vietata:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `alcol`;
                    case 'gambling':
                        return `gioco d'azzardo`;
                    case 'tobacco':
                        return `tabacco`;
                    case 'adultEntertainment':
                        return `intrattenimento per adulti`;
                    case 'hotelIncidentals':
                        return `spese accessorie dell’hotel`;
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
        reviewRequired: 'Revisione richiesta',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Impossibile abbinare automaticamente la ricevuta a causa di un collegamento bancario interrotto';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Connessione bancaria interrotta. <a href="${companyCardPageURL}">Riconnetti per abbinare la ricevuta</a>`
                    : 'Connessione bancaria interrotta. Chiedi a un amministratore di riconnetterla per abbinare la ricevuta.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Chiedi a ${member} di contrassegnarla come contante oppure attendi 7 giorni e riprova` : "In attesa dell'unione con la transazione della carta.";
            }
            return '';
        },
        brokenConnection530Error: 'Ricevuta in sospeso a causa di connessione bancaria interrotta',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Ricevuta in sospeso a causa di un collegamento bancario interrotto. Risolvi in <a href="${workspaceCompanyCardRoute}">Carte aziendali</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Ricevuta in sospeso a causa di un collegamento bancario interrotto. Chiedi a un amministratore dell’area di lavoro di risolvere il problema.',
        markAsCashToIgnore: 'Contrassegna come contante per ignorare e richiedere il pagamento.',
        smartscanFailed: ({canEdit = true}) => `Scansione della ricevuta non riuscita.${canEdit ? 'Inserisci i dettagli manualmente.' : ''}`,
        receiptGeneratedWithAI: "Ricevuta potenzialmente generata dall'IA",
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Manca ${tagName ?? 'Etichetta'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Etichetta'} non è più valido`,
        taxAmountChanged: 'L’importo delle imposte è stato modificato',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Imposta'} non è più valido`,
        taxRateChanged: 'L’aliquota fiscale è stata modificata',
        taxRequired: 'Aliquota fiscale mancante',
        none: 'Nessuno',
        taxCodeToKeep: 'Scegli quale codice fiscale mantenere',
        tagToKeep: 'Scegli quale tag mantenere',
        isTransactionReimbursable: 'Scegli se la transazione è rimborsabile',
        merchantToKeep: 'Scegli quale esercente mantenere',
        descriptionToKeep: 'Scegli quale descrizione mantenere',
        categoryToKeep: 'Scegli quale categoria mantenere',
        isTransactionBillable: 'Scegli se la transazione è fatturabile',
        keepThisOne: 'Mantieni questo',
        confirmDetails: `Conferma i dettagli che stai mantenendo`,
        confirmDuplicatesInfo: `I duplicati che non mantieni saranno conservati affinché l’autore dell’invio li elimini.`,
        hold: 'Questa spesa è stata messa in sospeso',
        resolvedDuplicates: 'ha risolto il duplicato',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} è obbligatorio`,
        reportContainsExpensesWithViolations: 'Il report contiene spese con violazioni.',
    },
    violationDismissal: {
        rter: {
            manual: 'ha contrassegnato questa ricevuta come contante',
        },
        duplicatedTransaction: {
            manual: 'ha risolto il duplicato',
        },
    },
    videoPlayer: {
        play: 'Riproduci',
        pause: 'Pausa',
        fullscreen: 'Schermo intero',
        playbackSpeed: 'Velocità di riproduzione',
        expand: 'Espandi',
        mute: 'Silenzia',
        unmute: 'Riattiva audio',
        normal: 'Normale',
    },
    exitSurvey: {
        header: 'Prima di andare',
        reasonPage: {
            title: 'Dicci perché stai andando via',
            subtitle: 'Prima di andare, dicci perché desideri passare a Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ho bisogno di una funzionalità disponibile solo in Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Non capisco come usare la nuova Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Capisco come usare il nuovo Expensify, ma preferisco Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Quale funzionalità ti serve che non è disponibile nel nuovo Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Cosa stai cercando di fare?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Perché preferisci Expensify Classic?',
        },
        responsePlaceholder: 'La tua risposta',
        thankYou: 'Grazie per il feedback!',
        thankYouSubtitle: 'Le tue risposte ci aiuteranno a creare un prodotto migliore per portare a termine le attività. Grazie mille!',
        goToExpensifyClassic: 'Passa a Expensify Classic',
        offlineTitle: 'Sembra che tu sia bloccato qui...',
        offline:
            'Sembra che tu sia offline. Purtroppo, Expensify Classic non funziona offline, ma la New Expensify sì. Se preferisci usare Expensify Classic, riprova quando avrai una connessione a internet.',
        quickTip: 'Suggerimento rapido...',
        quickTipSubTitle: 'Puoi accedere direttamente a Expensify Classic visitando expensify.com. Aggiungilo ai preferiti per un accesso rapido!',
        bookACall: 'Prenota una chiamata',
        bookACallTitle: 'Vuoi parlare con un product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Chatta direttamente su spese e report',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Possibilità di fare tutto da mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Viaggi e spese alla velocità della chat',
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
                title: 'Le tue informazioni di pagamento non sono aggiornate',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Aggiorna la tua carta di pagamento entro il ${date} per continuare a utilizzare tutte le tue funzioni preferite.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Il tuo pagamento non può essere elaborato',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Il tuo addebito del ${date} di ${purchaseAmountOwed} non può essere elaborato. Aggiungi una carta di pagamento per saldare l’importo dovuto.`
                        : 'Aggiungi una carta di pagamento per saldare l’importo dovuto.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Le tue informazioni di pagamento non sono aggiornate',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Il tuo pagamento è in ritardo. Ti preghiamo di pagare la fattura entro il ${date} per evitare l’interruzione del servizio.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Le tue informazioni di pagamento non sono aggiornate',
                subtitle: 'Il tuo pagamento è in ritardo. Ti preghiamo di pagare la tua fattura.',
            },
            billingDisputePending: {
                title: 'La tua carta non può essere addebitata',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Hai contestato l’addebito di ${amountOwed} sulla carta che termina con ${cardEnding}. Il tuo account rimarrà bloccato finché la contestazione non sarà risolta con la tua banca.`,
            },
            cardAuthenticationRequired: {
                title: 'La tua carta di pagamento non è stata autenticata completamente.',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Completa il processo di autenticazione per attivare la tua carta di pagamento che termina con ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'La tua carta non può essere addebitata',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `La tua carta di pagamento è stata rifiutata per fondi insufficienti. Riprova oppure aggiungi una nuova carta di pagamento per saldare il tuo saldo in sospeso di ${amountOwed}.`,
            },
            cardExpired: {
                title: 'La tua carta non può essere addebitata',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `La tua carta di pagamento è scaduta. Aggiungi una nuova carta di pagamento per saldare il tuo saldo in sospeso di ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'La tua carta sta per scadere',
                subtitle:
                    'La tua carta di pagamento scadrà alla fine di questo mese. Clicca sul menu a tre punti qui sotto per aggiornarla e continuare a usare tutte le tue funzionalità preferite.',
            },
            retryBillingSuccess: {
                title: 'Successo!',
                subtitle: 'La tua carta è stata addebitata correttamente.',
            },
            retryBillingError: {
                title: 'La tua carta non può essere addebitata',
                subtitle:
                    'Prima di riprovare, chiama direttamente la tua banca per autorizzare gli addebiti di Expensify e rimuovere eventuali blocchi. In alternativa, prova ad aggiungere un’altra carta di pagamento.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Hai contestato l’addebito di ${amountOwed} sulla carta che termina con ${cardEnding}. Il tuo account rimarrà bloccato finché la contestazione non sarà risolta con la tua banca.`,
            preTrial: {
                title: 'Inizia una prova gratuita',
                subtitle: 'Come passo successivo, <a href="#">completa la tua checklist di configurazione</a> così il tuo team può iniziare a usare le note spese.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Prova: ${numOfDays} ${numOfDays === 1 ? 'giorno' : 'giorni'} rimanenti!`,
                subtitle: 'Aggiungi una carta di pagamento per continuare a utilizzare tutte le tue funzionalità preferite.',
            },
            trialEnded: {
                title: 'La tua prova gratuita è terminata',
                subtitle: 'Aggiungi una carta di pagamento per continuare a utilizzare tutte le tue funzionalità preferite.',
            },
            earlyDiscount: {
                claimOffer: 'Riscatta offerta',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>${discountType}% di sconto sul tuo primo anno!</strong> Aggiungi semplicemente una carta di pagamento e attiva un abbonamento annuale.`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `Offerta a tempo limitato: ${discountType}% di sconto sul tuo primo anno!`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Richiedi entro ${days > 0 ? `${days}g :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Pagamento',
            subtitle: 'Aggiungi una carta per pagare il tuo abbonamento a Expensify.',
            addCardButton: 'Aggiungi carta di pagamento',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `La tua prossima data di pagamento è il ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Carta che termina con ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nome: ${name}, Scadenza: ${expiration}, Valuta: ${currency}`,
            changeCard: 'Cambia carta di pagamento',
            changeCurrency: 'Modifica valuta di pagamento',
            cardNotFound: 'Nessuna carta di pagamento aggiunta',
            retryPaymentButton: 'Riprova pagamento',
            authenticatePayment: 'Autentica pagamento',
            requestRefund: 'Richiedi rimborso',
            requestRefundModal: {
                full: 'Ottenere un rimborso è facile, ti basta effettuare il downgrade del tuo account prima della prossima data di fatturazione e riceverai un rimborso. <br /> <br /> Attenzione: Effettuare il downgrade del tuo account significa che il/i tuo/i workspace verrà/verranno eliminato/i. Questa azione non può essere annullata, ma puoi sempre creare un nuovo workspace se cambi idea.',
                confirm: 'Elimina spazio(i) di lavoro e declassa',
            },
            viewPaymentHistory: 'Visualizza cronologia pagamenti',
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
                title: 'Raccogli',
                description: 'Il piano per piccole imprese che ti offre spese, viaggi e chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Expensify Card, ${upper}/membro attivo senza la Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Expensify Card, ${upper}/membro attivo senza la Expensify Card.`,
                benefit1: 'Scansione ricevute',
                benefit2: 'Rimborsi',
                benefit3: 'Gestione carte aziendali',
                benefit4: 'Approvazioni di spese e viaggi',
                benefit5: 'Prenotazione viaggi e regole',
                benefit6: 'Integrazioni QuickBooks/Xero',
                benefit7: 'Chatta su spese, report e stanze',
                benefit8: 'Supporto IA e umano',
            },
            control: {
                title: 'Controllo',
                description: 'Spese, viaggi e chat per le aziende più grandi.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Expensify Card, ${upper}/membro attivo senza la Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Expensify Card, ${upper}/membro attivo senza la Expensify Card.`,
                benefit1: 'Tutto nel piano Collect',
                benefit2: 'Flussi di approvazione multilivello',
                benefit3: 'Regole personalizzate per le spese',
                benefit4: 'Integrazioni ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integrazioni HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Analisi e report personalizzati',
                benefit8: 'Budgeting',
            },
            thisIsYourCurrentPlan: 'Questo è il tuo piano attuale',
            downgrade: 'Passa a Collect',
            upgrade: 'Passa a Control',
            addMembers: 'Aggiungi membri',
            saveWithExpensifyTitle: 'Risparmia con la Expensify Card',
            saveWithExpensifyDescription: 'Usa il nostro calcolatore di risparmio per vedere come il cash back della Expensify Card può ridurre la tua fattura Expensify.',
            saveWithExpensifyButton: 'Scopri di più',
        },
        compareModal: {
            comparePlans: 'Confronta piani',
            subtitle: `<muted-text>Sblocca le funzionalità di cui hai bisogno con il piano più adatto a te. <a href="${CONST.PRICING}">Visita la nostra pagina dei prezzi</a> per una descrizione completa delle funzionalità incluse in ciascun piano.</muted-text>`,
        },
        details: {
            title: 'Dettagli dell’abbonamento',
            annual: 'Abbonamento annuale',
            taxExempt: 'Richiedi stato di esenzione fiscale',
            taxExemptEnabled: 'Esente da imposte',
            taxExemptStatus: 'Stato di esenzione fiscale',
            payPerUse: 'A consumo',
            subscriptionSize: 'Dimensione abbonamento',
            headsUp:
                'Attenzione: se non imposti ora la dimensione del tuo abbonamento, la imposteremo automaticamente in base al numero di membri attivi del tuo primo mese. Sarai quindi vincolato a pagare almeno per questo numero di membri per i successivi 12 mesi. Puoi aumentare la dimensione del tuo abbonamento in qualsiasi momento, ma non puoi ridurla finché il tuo abbonamento non sarà terminato.',
            zeroCommitment: 'Zero impegno alla tariffa scontata dell’abbonamento annuale',
        },
        subscriptionSize: {
            title: 'Dimensione abbonamento',
            yourSize: 'La dimensione del tuo abbonamento è il numero di posti disponibili che possono essere occupati da qualsiasi membro attivo in un dato mese.',
            eachMonth:
                'Ogni mese, il tuo abbonamento copre fino al numero di membri attivi impostato sopra. Ogni volta che aumenti la dimensione del tuo abbonamento, inizierai un nuovo abbonamento di 12 mesi con quella nuova dimensione.',
            note: 'Nota: un membro attivo è chiunque abbia creato, modificato, inviato, approvato, rimborsato o esportato dati di spesa collegati allo spazio di lavoro della tua azienda.',
            confirmDetails: 'Conferma i dettagli del tuo nuovo abbonamento annuale:',
            subscriptionSize: 'Dimensione abbonamento',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membri attivi/mese`,
            subscriptionRenews: "L'abbonamento si rinnova",
            youCantDowngrade: 'Non puoi effettuare il downgrade durante il tuo abbonamento annuale.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Hai già sottoscritto un abbonamento annuale per ${size} membri attivi al mese fino al ${date}. Puoi passare a un abbonamento a consumo il ${date} disattivando il rinnovo automatico.`,
            error: {
                size: 'Inserisci una dimensione di abbonamento valida',
                sameSize: 'Inserisci un numero diverso dalla dimensione attuale del tuo abbonamento',
            },
        },
        paymentCard: {
            addPaymentCard: 'Aggiungi carta di pagamento',
            enterPaymentCardDetails: 'Inserisci i dati della tua carta di pagamento',
            security: 'Expensify è conforme allo standard PCI-DSS, utilizza una crittografia a livello bancario e si avvale di un’infrastruttura ridondante per proteggere i tuoi dati.',
            learnMoreAboutSecurity: 'Scopri di più sulla nostra sicurezza.',
        },
        subscriptionSettings: {
            title: 'Impostazioni di abbonamento',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Tipo di abbonamento: ${subscriptionType}, Dimensione abbonamento: ${subscriptionSize}, Rinnovo automatico: ${autoRenew}, Aumento automatico posti annuali: ${autoIncrease}`,
            none: 'nessuno',
            on: 'attivo',
            off: 'disattivato',
            annual: 'Annuale',
            autoRenew: 'Rinnovo automatico',
            autoIncrease: 'Aumento automatico dei posti annuali',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Risparmia fino a ${amountWithCurrency}/mese per membro attivo`,
            automaticallyIncrease:
                'Aumenta automaticamente i posti annuali per tenere conto dei membri attivi che superano le dimensioni del tuo abbonamento. Nota: questa operazione prolungherà la data di fine del tuo abbonamento annuale.',
            disableAutoRenew: 'Disattiva rinnovo automatico',
            helpUsImprove: 'Aiutaci a migliorare Expensify',
            whatsMainReason: 'Qual è il motivo principale per cui stai disattivando il rinnovo automatico?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Si rinnova il ${date}.`,
            pricingConfiguration: 'Il prezzo dipende dalla configurazione. Per ottenere il prezzo più basso, scegli un abbonamento annuale e richiedi la Expensify Card.',
            learnMore: {
                part1: 'Scopri di più sul nostro',
                pricingPage: 'pagina dei prezzi',
                part2: 'o chatta con il nostro team nella tua',
                adminsRoom: 'Stanza #admins.',
            },
            estimatedPrice: 'Prezzo stimato',
            changesBasedOn: 'Questo cambia in base all’utilizzo della tua Expensify Card e alle opzioni di abbonamento riportate di seguito.',
        },
        requestEarlyCancellation: {
            title: 'Richiedi annullamento anticipato',
            subtitle: 'Qual è il motivo principale per cui stai richiedendo la cancellazione anticipata?',
            subscriptionCanceled: {
                title: 'Abbonamento annullato',
                subtitle: 'Il tuo abbonamento annuale è stato annullato.',
                info: 'Se vuoi continuare a usare il tuo workspace (o i tuoi workspace) con pagamento a consumo, sei a posto.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Se desideri impedire attività e addebiti futuri, devi <a href="${workspacesListRoute}">eliminare il/i tuo/i workspace</a>. Tieni presente che, quando elimini il/i tuo/i workspace, ti verrà addebitata qualsiasi attività in sospeso maturata durante l’attuale mese di calendario.`,
            },
            requestSubmitted: {
                title: 'Richiesta inviata',
                subtitle:
                    'Grazie per averci fatto sapere che sei interessato a disdire il tuo abbonamento. Stiamo esaminando la tua richiesta e ti contatteremo presto tramite la tua chat con <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Richiedendo la cancellazione anticipata, riconosco e accetto che Expensify non ha alcun obbligo di concedere tale richiesta ai sensi dei <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Termini di servizio</a> di Expensify o di qualsiasi altro accordo sui servizi applicabile tra me ed Expensify e che Expensify mantiene la piena discrezione in merito alla concessione di qualsiasi tale richiesta.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'La funzionalità necessita di miglioramenti',
        tooExpensive: 'Troppo costoso',
        inadequateSupport: 'Assistenza clienti insufficiente',
        businessClosing: 'Chiusura, ridimensionamento o acquisizione dell’azienda',
        additionalInfoTitle: 'A quale software stai passando e perché?',
        additionalInfoInputLabel: 'La tua risposta',
    },
    roomChangeLog: {
        updateRoomDescription: 'imposta la descrizione della stanza su:',
        clearRoomDescription: 'ha cancellato la descrizione della stanza',
        changedRoomAvatar: 'ha modificato l’avatar della stanza',
        removedRoomAvatar: 'ha rimosso l’avatar della stanza',
    },
    delegate: {
        switchAccount: 'Passa ad un altro account:',
        copilotDelegatedAccess: 'Copilot: Accesso delegato',
        copilotDelegatedAccessDescription: 'Consenti agli altri membri di accedere al tuo account.',
        addCopilot: 'Aggiungi copilota',
        membersCanAccessYourAccount: 'Questi membri possono accedere al tuo account:',
        youCanAccessTheseAccounts: 'Puoi accedere a questi account tramite il selettore di account:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Completo';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Limitato';
                default:
                    return '';
            }
        },
        genericError: 'Ops, qualcosa è andato storto. Riprova.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `per conto di ${delegator}`,
        accessLevel: 'Livello di accesso',
        confirmCopilot: 'Conferma il tuo copilota qui sotto.',
        accessLevelDescription:
            'Scegli un livello di accesso qui sotto. Sia l’accesso Completo che quello Limitato consentono ai copiloti di visualizzare tutte le conversazioni e le spese.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Consenti a un altro membro di effettuare tutte le azioni nel tuo account per tuo conto. Include chat, invii, approvazioni, pagamenti, aggiornamenti delle impostazioni e altro ancora.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Consenti a un altro membro di svolgere la maggior parte delle azioni nel tuo account per tuo conto. Esclude approvazioni, pagamenti, rifiuti e blocchi.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Rimuovi copilota',
        removeCopilotConfirmation: 'Sei sicuro di voler rimuovere questo copilot?',
        changeAccessLevel: 'Modifica livello di accesso',
        makeSureItIsYou: 'Verifichiamo che tu sia davvero tu',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Inserisci il codice magico inviato a ${contactMethod} per aggiungere un copilota. Dovrebbe arrivare entro uno o due minuti.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Inserisci il codice magico inviato a ${contactMethod} per aggiornare il tuo copilota.`,
        notAllowed: 'Non così in fretta...',
        noAccessMessage: dedent(`
            Come copilota, non hai accesso
            a questa pagina. Spiacenti!
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `Come <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilota</a> per ${accountOwnerEmail}, non hai l’autorizzazione per eseguire questa azione. Spiacenti!`,
        copilotAccess: 'Accesso a Copilot',
    },
    debug: {
        debug: 'Debug',
        details: 'Dettagli',
        JSON: 'JSON',
        reportActions: 'Azioni',
        reportActionPreview: 'Anteprima',
        nothingToPreview: 'Niente da visualizzare',
        editJson: 'Modifica JSON:',
        preview: 'Anteprima:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Manca ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Proprietà non valida: ${propertyName} - Previsto: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valore non valido - Atteso: ${expectedValues}`,
        missingValue: 'Valore mancante',
        createReportAction: 'Crea azione rapporto',
        reportAction: 'Azione del report',
        report: 'Report',
        transaction: 'Transazione',
        violations: 'Violazioni',
        transactionViolation: 'Violazione della transazione',
        hint: 'Le modifiche ai dati non verranno inviate al backend',
        textFields: 'Campi di testo',
        numberFields: 'Campi numerici',
        booleanFields: 'Campi booleani',
        constantFields: 'Campi costanti',
        dateTimeFields: 'Campi data e ora',
        date: 'Data',
        time: 'Ora',
        none: 'Nessuno',
        visibleInLHN: 'Visibile in LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'vero',
        false: 'falso',
        viewReport: 'Visualizza report',
        viewTransaction: 'Visualizza transazione',
        createTransactionViolation: 'Crea infrazione di transazione',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ha un commento in bozza',
            hasGBR: 'Ha GBR',
            hasRBR: 'Ha RBR',
            pinnedByUser: 'Fissato dal membro',
            hasIOUViolations: 'Presenta violazioni IOU',
            hasAddWorkspaceRoomErrors: "Ha errori nell'aggiunta della stanza dell'area di lavoro",
            isUnread: 'È non letto (modalità concentrazione)',
            isArchived: 'È archiviato (modalità più recente)',
            isSelfDM: 'È un DM a se stessi',
            isFocused: 'È temporaneamente attivo',
        },
        reasonGBR: {
            hasJoinRequest: 'Ha richiesta di adesione (stanza amministratore)',
            isUnreadWithMention: 'È non letto con menzione',
            isWaitingForAssigneeToCompleteAction: "In attesa che il assegnatario completi l'azione",
            hasChildReportAwaitingAction: 'Ha un report figlio in attesa di azione',
            hasMissingInvoiceBankAccount: 'Manca il conto bancario della fattura',
            hasUnresolvedCardFraudAlert: 'Ha un avviso di frode sulla carta non risolto',
        },
        reasonRBR: {
            hasErrors: 'Presenta errori nei dati del rendiconto o nelle azioni del rendiconto',
            hasViolations: 'Ha violazioni',
            hasTransactionThreadViolations: 'Presenta violazioni nel thread delle transazioni',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'C’è un report in attesa di azione',
            theresAReportWithErrors: "C'è un report con errori",
            theresAWorkspaceWithCustomUnitsErrors: "C'è uno spazio di lavoro con errori nelle unità personalizzate",
            theresAProblemWithAWorkspaceMember: 'C’è un problema con un membro dello spazio di lavoro',
            theresAProblemWithAWorkspaceQBOExport: "Si è verificato un problema con un'impostazione di esportazione della connessione dello spazio di lavoro.",
            theresAProblemWithAContactMethod: 'Si è verificato un problema con un metodo di contatto',
            aContactMethodRequiresVerification: 'Un metodo di contatto richiede verifica',
            theresAProblemWithAPaymentMethod: 'Si è verificato un problema con un metodo di pagamento',
            theresAProblemWithAWorkspace: 'C’è un problema con uno spazio di lavoro',
            theresAProblemWithYourReimbursementAccount: 'Si è verificato un problema con il tuo conto di rimborso',
            theresABillingProblemWithYourSubscription: 'C’è un problema di fatturazione con il tuo abbonamento',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Il tuo abbonamento è stato rinnovato con successo',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Si è verificato un problema durante una sincronizzazione della connessione dello spazio di lavoro',
            theresAProblemWithYourWallet: 'Si è verificato un problema con il tuo portafoglio',
            theresAProblemWithYourWalletTerms: 'C’è un problema con i termini del tuo portafoglio',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Fai un test drive',
    },
    migratedUserWelcomeModal: {
        title: 'Benvenuto in New Expensify!',
        subtitle: 'Ha tutto ciò che ami della nostra esperienza classica con un sacco di miglioramenti per renderti la vita ancora più facile:',
        confirmText: 'Andiamo!',
        helpText: 'Prova la demo di 2 minuti',
        features: {
            search: 'Ricerca più potente su dispositivi mobili, web e desktop',
            concierge: 'Concierge AI integrato per aiutarti ad automatizzare le tue spese',
            chat: 'Chatta su qualsiasi spesa per risolvere rapidamente i dubbi',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Inizia <strong>qui!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Rinomina qui le tue ricerche salvate</strong>!</tooltip>',
        accountSwitcher: '<tooltip>Accedi ai tuoi <strong>account Copilot</strong> qui</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scansiona la nostra ricevuta di prova</strong> per vedere come funziona!</tooltip>',
            manager: '<tooltip>Scegli il nostro <strong>test manager</strong> per provarlo!</tooltip>',
            confirmation: '<tooltip>Ora, <strong>invia la tua spesa</strong> e guarda la magia che accade!</tooltip>',
            tryItOut: 'Provalo',
        },
        outstandingFilter: '<tooltip>Filtra le spese\nche <strong>necessitano di approvazione</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Invia questa ricevuta per\n<strong>completare la prova su strada!</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Scartare le modifiche?',
        body: 'Sei sicuro di voler eliminare le modifiche apportate?',
        confirmText: 'Scarta modifiche',
    },
    scheduledCall: {
        book: {
            title: 'Pianifica chiamata',
            description: 'Trova un orario che vada bene per te.',
            slots: ({date}: {date: string}) => `<muted-text>Orari disponibili per <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Conferma chiamata',
            description: 'Assicurati che i dettagli qui sotto ti sembrino corretti. Una volta confermata la chiamata, ti invieremo un invito con maggiori informazioni.',
            setupSpecialist: 'Il tuo specialista di configurazione',
            meetingLength: 'Durata riunione',
            dateTime: 'Data e ora',
            minutes: '30 minuti',
        },
        callScheduled: 'Chiamata programmata',
    },
    autoSubmitModal: {
        title: 'Tutto chiaro e inviato!',
        description: 'Tutti gli avvisi e le violazioni sono stati risolti, quindi:',
        submittedExpensesTitle: 'Queste spese sono state inviate',
        submittedExpensesDescription: 'Queste spese sono state inviate al tuo approvatore, ma possono ancora essere modificate finché non vengono approvate.',
        pendingExpensesTitle: 'Le spese in sospeso sono state spostate',
        pendingExpensesDescription: 'Le spese in sospeso della carta sono state spostate in un report separato finché non vengono contabilizzate.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Fai una prova di 2 minuti',
        },
        modal: {
            title: 'Mettici alla prova',
            description: 'Fai un rapido tour del prodotto per metterti subito al passo.',
            confirmText: 'Avvia test drive',
            helpText: 'Salta',
            employee: {
                description:
                    '<muted-text>Offri al tuo team <strong>3 mesi gratis di Expensify!</strong> Inserisci l’email del tuo capo qui sotto e inviagli una nota spese di prova.</muted-text>',
                email: "Inserisci l'email del tuo capo",
                error: 'Quel membro possiede uno spazio di lavoro, inserisci un nuovo membro per effettuare il test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Stai attualmente provando Expensify',
            readyForTheRealThing: 'Pronto per la vera esperienza?',
            getStarted: 'Inizia',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) => `# ${name} ti ha invitato a provare Expensify
Ehi! Ho appena ottenuto *3 mesi gratis* per farci provare Expensify, il modo più veloce per gestire le note spese.

Ecco una *ricevuta di prova* per mostrarti come funziona:`,
    },
    export: {
        basicExport: 'Esportazione base',
        reportLevelExport: 'Tutti i dati - livello report',
        expenseLevelExport: 'Tutti i dati - livello spesa',
        exportInProgress: 'Esportazione in corso',
        conciergeWillSend: 'Concierge ti invierà il file a breve.',
    },
    domain: {
        notVerified: 'Non verificato',
        retry: 'Riprova',
        verifyDomain: {
            title: 'Verifica dominio',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Prima di procedere, verifica di essere il proprietario di <strong>${domainName}</strong> aggiornando le sue impostazioni DNS.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Accedi al tuo provider DNS e apri le impostazioni DNS per <strong>${domainName}</strong>.`,
            addTXTRecord: 'Aggiungi il seguente record TXT:',
            saveChanges: 'Salva le modifiche e torna qui per verificare il tuo dominio.',
            youMayNeedToConsult: `Potresti dover contattare il reparto IT della tua organizzazione per completare la verifica. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Scopri di più</a>.`,
            warning: 'Dopo la verifica, tutti i membri di Expensify nel tuo dominio riceveranno un’email che informa che il loro account sarà gestito sotto il tuo dominio.',
            codeFetchError: 'Impossibile recuperare il codice di verifica',
            genericError: 'Non siamo riusciti a verificare il tuo dominio. Riprova e contatta Concierge se il problema persiste.',
        },
        domainVerified: {
            title: 'Dominio verificato',
            header: 'Wooo! Il tuo dominio è stato verificato',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Il dominio <strong>${domainName}</strong> è stato verificato correttamente e ora puoi configurare SAML e altre funzionalità di sicurezza.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Accesso Single Sign-On (SSO) SAML',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> è una funzionalità di sicurezza che ti offre un controllo maggiore su come i membri con email <strong>${domainName}</strong> accedono a Expensify. Per abilitarla, dovrai verificare di essere un amministratore aziendale autorizzato.</muted-text>`,
            fasterAndEasierLogin: 'Accesso più rapido e semplice',
            moreSecurityAndControl: 'Maggiore sicurezza e controllo',
            onePasswordForAnything: 'Un’unica password per tutto',
        },
        goToDomain: 'Vai al dominio',
        samlLogin: {
            title: 'Accesso SAML',
            subtitle: `<muted-text>Configura l’accesso dei membri con <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'Abilita accesso SAML',
            allowMembers: 'Consenti ai membri di accedere con SAML.',
            requireSamlLogin: 'Richiedi accesso SAML',
            anyMemberWillBeRequired: 'Qualsiasi membro che ha effettuato l’accesso con un metodo diverso dovrà effettuare nuovamente l’autenticazione utilizzando SAML.',
            enableError: "Impossibile aggiornare l'impostazione di abilitazione SAML",
            requireError: "Impossibile aggiornare l'impostazione del requisito SAML",
        },
        samlConfigurationDetails: {
            title: 'Dettagli di configurazione SAML',
            subtitle: 'Usa questi dettagli per configurare SAML.',
            identityProviderMetaData: 'MetaDati del provider di identità',
            entityID: 'ID entità',
            nameIDFormat: 'Formato ID nome',
            loginUrl: 'URL di accesso',
            acsUrl: 'URL ACS (Assertion Consumer Service)',
            logoutUrl: 'URL di disconnessione',
            sloUrl: 'URL SLO (Single Logout)',
            serviceProviderMetaData: 'Metadati del provider di servizi',
            oktaScimToken: 'Token SCIM Okta',
            revealToken: 'Mostra token',
            fetchError: 'Impossibile recuperare i dettagli della configurazione SAML',
            setMetadataGenericError: 'Impossibile impostare i metadati SAML',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
