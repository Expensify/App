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
/* eslint-disable max-len */
const translations: TranslationDeepObject<typeof en> = {
    common: {
        // @context Used as a noun meaning a numerical total or quantity, not the verb “to count.”
        count: 'Conteggio',
        cancel: 'Annulla',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Chiudi',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Continua',
        unshare: 'Rimuovi condivisione',
        yes: 'Sì',
        no: 'No',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Non ora',
        noThanks: 'No grazie',
        learnMore: 'Scopri di più',
        buttonConfirm: 'Ricevuto',
        name: 'Nome',
        attachment: 'Allegato',
        attachments: 'Allegati',
        center: 'Centro',
        from: 'Da',
        to: 'A',
        in: 'Dentro',
        optional: 'Opzionale',
        new: 'Nuovo',
        newFeature: 'Nuova funzionalità',
        search: 'Cerca',
        reports: 'Report',
        find: 'Trova',
        searchWithThreeDots: 'Cerca...',
        next: 'Avanti',
        previous: 'Precedente',
        // @context Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.
        goBack: 'Indietro',
        create: 'Crea',
        add: 'Aggiungi',
        resend: 'Invia di nuovo',
        save: 'Salva',
        select: 'Seleziona',
        deselect: 'Deseleziona',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Selezione multipla',
        saveChanges: 'Salva le modifiche',
        submit: 'Invia',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Inviato',
        rotate: 'Ruota',
        zoom: 'Zoom',
        password: 'Password',
        magicCode: 'Codice magico',
        digits: 'cifre',
        twoFactorCode: 'Codice a due fattori',
        workspaces: 'Spazi di lavoro',
        home: 'Home',
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
        review: (reviewParams?: ReviewParams) => `Revisiona${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Non',
        signIn: 'Accedi',
        signInWithGoogle: 'Accedi con Google',
        signInWithApple: 'Accedi con Apple',
        signInWith: 'Accedi con',
        continue: 'Continua',
        firstName: 'NomeNomeNome',
        lastName: 'Cognome',
        scanning: 'Scansione',
        analyzing: 'Analisi in corso...',
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
        archived: 'archiviato',
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
        unPin: 'Rimuovi dalla bacheca',
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
        ssnFull9: 'Tutte le 9 cifre del SSN',
        addressLine: (lineNumber: number) => `Riga indirizzo ${lineNumber}`,
        personalAddress: 'Indirizzo personale',
        companyAddress: 'Indirizzo aziendale',
        noPO: 'Niente caselle postali o indirizzi di recapito, per favore.',
        city: 'Città',
        state: 'Stato',
        streetAddress: 'Indirizzo strada',
        stateOrProvince: 'Stato / Provincia',
        country: 'Paese',
        zip: 'CAP',
        zipPostCode: 'CAP / Codice postale',
        whatThis: "Che cos'è?",
        iAcceptThe: 'Accetto i',
        acceptTermsAndPrivacy: `Accetto i <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termini di servizio di Expensify</a> e l'<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Informativa sulla privacy</a>`,
        acceptTermsAndConditions: `Accetto i <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">termini e condizioni</a>`,
        acceptTermsOfService: `Accetto i <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termini di servizio di Expensify</a>`,
        remove: 'Rimuovi',
        admin: 'Amministratore',
        owner: 'Proprietario',
        dateFormat: 'YYYY-MM-DD',
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
        genericErrorMessage: 'Ops... si è verificato un problema e la tua richiesta non può essere completata. Riprova più tardi.',
        percentage: 'Percentuale',
        converted: 'Convertito',
        error: {
            invalidAmount: 'Importo non valido',
            acceptTerms: 'Devi accettare i Termini di servizio per continuare',
            phoneNumber: `Inserisci un numero di telefono completo
(ad es. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Questo campo è obbligatorio',
            requestModified: 'Questa richiesta è in fase di modifica da parte di un altro membro',
            characterLimitExceedCounter: (length: number, limit: number) => `Limite di caratteri superato (${length}/${limit})`,
            dateInvalid: 'Seleziona una data valida',
            invalidDateShouldBeFuture: 'Scegli una data odierna o futura',
            invalidTimeShouldBeFuture: 'Scegli un orario almeno un minuto avanti',
            invalidCharacter: 'Carattere non valido',
            enterMerchant: 'Inserisci il nome dell’esercente',
            enterAmount: 'Inserisci un importo',
            missingMerchantName: 'Nome esercente mancante',
            missingAmount: 'Importo mancante',
            missingDate: 'Data mancante',
            enterDate: 'Inserisci una data',
            invalidTimeRange: 'Inserisci un orario utilizzando il formato a 12 ore (ad es. 2:30 PM)',
            pleaseCompleteForm: 'Completa il modulo sopra per continuare',
            pleaseSelectOne: "Seleziona un'opzione sopra",
            invalidRateError: 'Inserisci un valore valido per la tariffa',
            lowRateError: 'La tariffa deve essere maggiore di 0',
            email: 'Inserisci un indirizzo email valido',
            login: 'Si è verificato un errore durante l’accesso. Riprova.',
        },
        comma: 'virgola',
        semicolon: 'punto e virgola',
        please: 'Per favore',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'contattaci',
        pleaseEnterEmailOrPhoneNumber: "Inserisci un'email o un numero di telefono",
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'correggi gli errori',
        inTheFormBeforeContinuing: 'nel modulo prima di continuare',
        confirm: 'Conferma',
        reset: 'Reimposta',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: 'Completato',
        more: 'Altro',
        debitCard: 'Carta di debito',
        bankAccount: 'Conto bancario',
        personalBankAccount: 'Conto bancario personale',
        businessBankAccount: 'Conto bancario aziendale',
        join: 'Partecipa',
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
        me: 'io',
        youAfterPreposition: 'tu',
        your: 'il tuo',
        conciergeHelp: 'Contatta Concierge per assistenza.',
        youAppearToBeOffline: 'Sembra che tu sia offline.',
        thisFeatureRequiresInternet: 'Questa funzione richiede una connessione Internet attiva.',
        attachmentWillBeAvailableOnceBackOnline: 'L’allegato sarà disponibile quando torni online.',
        errorOccurredWhileTryingToPlayVideo: 'Si è verificato un errore durante il tentativo di riprodurre questo video.',
        areYouSure: 'Sei sicuro?',
        verify: 'Verifica',
        yesContinue: 'Sì, continua',
        // @context Provides an example format for a website URL.
        websiteExample: 'es. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `es. ${zipSampleFormat}` : ''),
        description: 'Descrizione',
        title: 'Titolo',
        assignee: 'Assegnatario',
        createdBy: 'Creato da',
        with: 'con',
        shareCode: 'Condividi codice',
        share: 'Condividi',
        per: 'per',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: 'miglia',
        km: 'chilometro',
        copied: 'Copiato!',
        someone: 'Qualcuno',
        total: 'Totale',
        edit: 'Modifica',
        letsDoThis: `Facciamolo!`,
        letsStart: `Iniziamo`,
        showMore: 'Mostra altro',
        showLess: 'Mostra meno',
        merchant: 'Commerciante',
        change: 'Modifica',
        category: 'Categoria',
        report: 'Report',
        billable: 'Fatturabile',
        nonBillable: 'Non rimborsabile',
        tag: 'Tag',
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
        showing: 'Visualizzazione',
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
            title: 'Evviva! Hai sistemato tutto.',
            subtitleText1: 'Trova una chat usando la',
            subtitleText2: 'pulsante sopra oppure crea qualcosa usando il',
            subtitleText3: 'pulsante qui sotto.',
        },
        businessName: 'Nome azienda',
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
        disable: 'Disattiva',
        export: 'Esporta',
        initialValue: 'Valore iniziale',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Data odierna',
        value: 'Valore',
        downloadFailedTitle: 'Download non riuscito',
        downloadFailedDescription: 'Il download non può essere completato. Riprova più tardi.',
        filterLogs: 'Filtra log',
        network: 'Rete',
        reportID: 'ID rapporto',
        longReportID: 'ID rapporto lungo',
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
        disabled: 'Disattivato',
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
        secondAbbreviation: 's',
        skip: 'Salta',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Ti serve qualcosa in particolare? Chatta con il tuo account manager, ${accountManagerDisplayName}.`,
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
        leaveWorkspaceConfirmation: 'Se abbandoni questo spazio di lavoro, non potrai più inviare spese ad esso.',
        leaveWorkspaceConfirmationAuditor: 'Se lasci questo workspace, non potrai più visualizzarne i report e le impostazioni.',
        leaveWorkspaceConfirmationAdmin: 'Se lasci questo spazio di lavoro, non potrai più gestirne le impostazioni.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Se lasci questo spazio di lavoro, verrai sostituito nel flusso di approvazione da ${workspaceOwner}, il proprietario dello spazio di lavoro.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Se lasci questo workspace, verrai sostituito come esportatore preferito con ${workspaceOwner}, il proprietario del workspace.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Se lasci questo spazio di lavoro, verrai sostituito come referente tecnico con ${workspaceOwner}, il proprietario dello spazio di lavoro.`,
        leaveWorkspaceReimburser:
            'Non puoi lasciare questo spazio di lavoro in qualità di rimborsatore. Imposta un nuovo rimborsatore in Spazi di lavoro > Effettua o monitora i pagamenti, quindi riprova.',
        reimbursable: 'Rimborsabile',
        editYourProfile: 'Modifica il tuo profilo',
        comments: 'Commenti',
        sharedIn: 'Condiviso in',
        unreported: 'Non rendicontato',
        explore: 'Esplora',
        insights: 'Approfondimenti',
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
        unstableInternetConnection: 'Connessione a Internet instabile. Controlla la rete e riprova.',
        enableGlobalReimbursements: 'Abilita i rimborsi globali',
        purchaseAmount: 'Importo dell’acquisto',
        originalAmount: 'Importo originale',
        frequency: 'Frequenza',
        link: 'Collega',
        pinned: 'In evidenza',
        read: 'Letto',
        copyToClipboard: 'Copia negli appunti',
        thisIsTakingLongerThanExpected: 'Sta richiedendo più tempo del previsto...',
        domains: 'Domini',
        actionRequired: 'Azione richiesta',
        duplicate: 'Duplica',
        duplicated: 'Duplicato',
        duplicateExpense: 'Spesa duplicata',
        exchangeRate: 'Tasso di cambio',
        reimbursableTotal: 'Totale rimborsabile',
        nonReimbursableTotal: 'Totale non rimborsabile',
        month: 'Mese',
        week: 'Settimana',
        year: 'Anno',
        quarter: 'Trimestre',
    },
    supportalNoAccess: {
        title: 'Non così in fretta',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Non sei autorizzato a eseguire questa azione quando il supporto ha effettuato l’accesso (comando: ${command ?? ''}). Se ritieni che Success debba poter eseguire questa azione, avvia una conversazione in Slack.`,
    },
    lockedAccount: {
        title: 'Account bloccato',
        description: 'Non ti è consentito completare questa azione perché questo account è stato bloccato. Contatta concierge@expensify.com per i prossimi passi',
    },
    location: {
        useCurrent: 'Usa posizione attuale',
        notFound: 'Impossibile trovare la tua posizione. Riprova oppure inserisci un indirizzo manualmente.',
        permissionDenied: 'Sembra che tu abbia negato l’accesso alla tua posizione.',
        please: 'Per favore',
        allowPermission: 'consenti l’accesso alla posizione nelle impostazioni',
        tryAgain: 'e riprova.',
    },
    contact: {
        importContacts: 'Importa contatti',
        importContactsTitle: 'Importa i tuoi contatti',
        importContactsText: 'Importa i contatti dal tuo telefono così le persone preferite sono sempre a portata di tocco.',
        importContactsExplanation: 'così le tue persone preferite sono sempre a portata di tocco.',
        importContactsNativeText: 'Ancora un passo! Dacci il via libera per importare i tuoi contatti.',
    },
    anonymousReportFooter: {
        logoTagline: 'Partecipa alla discussione.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Accesso alla fotocamera',
        expensifyDoesNotHaveAccessToCamera: 'Expensify non può scattare foto senza accesso alla fotocamera. Tocca Impostazioni per aggiornare le autorizzazioni.',
        attachmentError: 'Errore allegato',
        errorWhileSelectingAttachment: 'Si è verificato un errore durante la selezione di un allegato. Riprova.',
        errorWhileSelectingCorruptedAttachment: 'Si è verificato un errore durante la selezione di un allegato danneggiato. Prova con un altro file.',
        takePhoto: 'Scatta foto',
        chooseFromGallery: 'Scegli dalla galleria',
        chooseDocument: 'Scegli file',
        attachmentTooLarge: "L'allegato è troppo grande",
        sizeExceeded: 'La dimensione dell’allegato supera il limite di 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `La dimensione dell’allegato supera il limite di ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'L’allegato è troppo piccolo',
        sizeNotMet: 'La dimensione dell’allegato deve essere superiore a 240 byte',
        wrongFileType: 'Tipo di file non valido',
        notAllowedExtension: 'Questo tipo di file non è consentito. Prova con un tipo di file diverso.',
        folderNotAllowedMessage: 'Il caricamento di una cartella non è consentito. Prova con un file diverso.',
        protectedPDFNotSupported: 'I PDF protetti da password non sono supportati',
        attachmentImageResized: 'Questa immagine è stata ridimensionata per l’anteprima. Scarica per la risoluzione completa.',
        attachmentImageTooLarge: 'Questa immagine è troppo grande per essere visualizzata in anteprima prima del caricamento.',
        tooManyFiles: (fileLimit: number) => `Puoi caricare fino a ${fileLimit} file alla volta.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `I file superano ${maxUploadSizeInMB} MB. Riprova.`,
        someFilesCantBeUploaded: 'Alcuni file non possono essere caricati',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `I file devono essere inferiori a ${maxUploadSizeInMB} MB. I file più grandi non verranno caricati.`,
        maxFileLimitExceeded: 'Puoi caricare fino a 30 ricevute alla volta. Le eventuali in più non verranno caricate.',
        unsupportedFileType: (fileType: string) => `I file ${fileType} non sono supportati. Verranno caricati solo i tipi di file supportati.`,
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
        supportingText: "Puoi chiudere questa finestra e tornare all'app Expensify.",
    },
    avatarCropModal: {
        title: 'Modifica foto',
        description: 'Trascina, ingrandisci e ruota l’immagine come preferisci.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nessuna estensione trovata per il tipo MIME',
        problemGettingImageYouPasted: 'Si è verificato un problema durante l’acquisizione dell’immagine incollata',
        commentExceededMaxLength: (formattedMaxLength: string) => `La lunghezza massima del commento è di ${formattedMaxLength} caratteri.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `La lunghezza massima del titolo dell’attività è di ${formattedMaxLength} caratteri.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Aggiorna app',
        updatePrompt: 'È disponibile una nuova versione di questa app.\nAggiorna ora oppure riavvia l’app più tardi per scaricare le ultime modifiche.',
    },
    deeplinkWrapper: {
        launching: 'Avvio di Expensify',
        expired: 'La tua sessione è scaduta.',
        signIn: 'Accedi di nuovo.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Test biometrico',
            authenticationSuccessful: 'Autenticazione riuscita',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `Autenticazione completata con ${authType}.`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Dati biometrici (${registered ? 'Registrato' : 'Non registrato'})`,
            yourAttemptWasUnsuccessful: 'Il tuo tentativo di autenticazione non è riuscito.',
            youCouldNotBeAuthenticated: 'Impossibile autenticarti',
            areYouSureToReject: 'Sei sicuro? Il tentativo di autenticazione verrà rifiutato se chiudi questa schermata.',
            rejectAuthentication: 'Rifiuta autenticazione',
            test: 'Test',
            biometricsAuthentication: 'Autenticazione biometrica',
        },
        pleaseEnableInSystemSettings: {
            start: 'Attiva la verifica tramite volto/impronta digitale o imposta un codice di sblocco del dispositivo nel tuo',
            link: 'impostazioni di sistema',
            end: '.',
        },
        oops: 'Ops, qualcosa è andato storto',
        looksLikeYouRanOutOfTime: 'Sembra che il tempo a disposizione sia scaduto! Per favore riprova presso l’esercente.',
        youRanOutOfTime: 'Il tempo è scaduto',
        letsVerifyItsYou: 'Verifichiamo che sia tu',
        verifyYourself: {
            biometrics: 'Verificati con il tuo volto o la tua impronta digitale',
        },
        enableQuickVerification: {
            biometrics: 'Abilita una verifica rapida e sicura usando il volto o l’impronta digitale. Nessuna password o codice richiesto.',
        },
        revoke: {
            remove: 'Rimuovi',
            title: 'Volto/impronta digitale e passkey',
            explanation:
                'La verifica tramite volto/impronta digitale o passkey è abilitata su uno o più dispositivi. Revocare l’accesso richiederà un codice magico per la prossima verifica su qualsiasi dispositivo.',
            confirmationPrompt: 'Sei sicuro? Ti servirà un codice magico per la prossima verifica su qualsiasi dispositivo.',
            cta: 'Revoca l’accesso',
            noDevices: 'Non hai alcun dispositivo registrato per la verifica tramite volto/impronta o passkey. Se ne registri uno, potrai revocare tale accesso da qui.',
            dismiss: 'Ricevuto',
            error: 'Richiesta non riuscita. Riprova più tardi.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abracadabra,
            hai effettuato l’accesso!
        `),
        successfulSignInDescription: 'Torna alla scheda originale per continuare.',
        title: 'Ecco il tuo codice magico',
        description: dedent(`
            Inserisci il codice dal dispositivo
            in cui è stato originariamente richiesto
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
            dal dispositivo da cui stai tentando di accedere.
        `),
        requestOneHere: 'richiedine una qui.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Pagato da',
        whatsItFor: 'A cosa serve?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nome, email o numero di telefono',
        findMember: 'Trova un membro',
        searchForSomeone: 'Cerca una persona',
    },
    customApprovalWorkflow: {
        title: 'Flusso di approvazione personalizzato',
        description: 'La tua azienda utilizza un flusso di approvazione personalizzato in questo spazio di lavoro. Per favore esegui questa azione in Expensify Classic',
        goToExpensifyClassic: 'Passa a Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Invia una spesa, invita il tuo team',
            subtitleText: 'Vuoi che anche il tuo team usi Expensify? Basta inviare loro una spesa e noi ci occuperemo del resto.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Prenota una chiamata',
    },
    hello: 'Ciao',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Inizia qui sotto.',
        anotherLoginPageIsOpen: "È aperta un'altra pagina di accesso.",
        anotherLoginPageIsOpenExplanation: 'Hai aperto la pagina di accesso in una scheda separata. Accedi da quella scheda.',
        welcome: 'Benvenuto!',
        welcomeWithoutExclamation: 'Benvenuto',
        phrase2: 'Il denaro parla. E ora che chat e pagamenti sono in un unico posto, è anche facile.',
        phrase3: 'I tuoi pagamenti arrivano veloci quanto riesci a far passare il tuo messaggio.',
        enterPassword: 'Inserisci la tua password',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, è sempre un piacere vedere una nuova faccia da queste parti!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Inserisci il codice magico inviato a ${login}. Dovrebbe arrivare entro uno o due minuti.`,
    },
    login: {
        hero: {
            header: 'Viaggi e spese, alla velocità della chat',
            body: 'Benvenuto nella nuova generazione di Expensify, dove i tuoi viaggi e le tue spese procedono più velocemente grazie a chat contestuali in tempo reale.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continua ad accedere con l’accesso Single Sign-On:',
        orContinueWithMagicCode: 'Puoi anche accedere con un codice magico',
        useSingleSignOn: 'Usa l’accesso Single Sign-On',
        useMagicCode: 'Usa codice magico',
        launching: 'Avvio in corso...',
        oneMoment: 'Un momento mentre ti reindirizziamo al portale Single Sign-On della tua azienda.',
    },
    reportActionCompose: {
        dropToUpload: 'Rilascia per caricare',
        sendAttachment: 'Invia allegato',
        addAttachment: 'Aggiungi allegato',
        writeSomething: 'Scrivi qualcosa...',
        blockedFromConcierge: 'Comunicazione bloccata',
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
            return `Sei sicuro di voler eliminare questo/la ${type}?`;
        },
        onlyVisible: 'Visibile solo a',
        explain: 'Spiega',
        explainMessage: 'Per favore spiegamelo.',
        replyInThread: 'Rispondi nel thread',
        joinThread: 'Partecipa al thread',
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
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Ti sei perso la festa in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, qui non c’è niente da vedere.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Questa chat è con tutti i membri di Expensify sul dominio <strong>${domainRoom}</strong>. Usala per chattare con i colleghi, condividere suggerimenti e fare domande.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Questa chat è con l’amministratore di <strong>${workspaceName}</strong>. Usala per parlare della configurazione dello spazio di lavoro e altro ancora.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Questa chat è con tutti in <strong>${workspaceName}</strong>. Usala per gli annunci più importanti.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Questa chat è per tutto ciò che riguarda <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Questa chat è per le fatture tra <strong>${invoicePayer}</strong> e <strong>${invoiceReceiver}</strong>. Usa il pulsante + per inviare una fattura.`,
        beginningOfChatHistory: (users: string) => `Questa chat è con ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Qui è dove <strong>${submitterDisplayName}</strong> invierà le spese a <strong>${workspaceName}</strong>. Basta usare il pulsante +.`,
        beginningOfChatHistorySelfDM: 'Questo è il tuo spazio personale. Usalo per note, attività, bozze e promemoria.',
        beginningOfChatHistorySystemDM: 'Benvenuto/a! Procediamo con la configurazione.',
        chatWithAccountManager: 'Chatta qui con il tuo account manager',
        askMeAnything: 'Chiedimi qualsiasi cosa!',
        sayHello: 'Di’ ciao!',
        yourSpace: 'Il tuo spazio',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Benvenuto in ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Usa il pulsante + per ${additionalText} una spesa.`,
        askConcierge: 'Fai domande e ottieni supporto in tempo reale 24/7.',
        conciergeSupport: 'Assistenza 24/7',
        create: 'crea',
        iouTypes: {
            pay: 'paga',
            split: 'dividi',
            submit: 'invia',
            track: 'traccia',
            invoice: 'fattura',
        },
    },
    adminOnlyCanPost: 'Solo gli amministratori possono inviare messaggi in questa stanza.',
    reportAction: {
        asCopilot: 'come copilota per',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `ha creato questo report per includere tutte le spese da <a href="${reportUrl}">${reportName}</a> che non potevano essere inviate con la frequenza da te scelta`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `ha creato questo resoconto per tutte le spese in sospeso da <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Notifica tutti in questa conversazione',
    },
    newMessages: 'Nuovi messaggi',
    latestMessages: 'Ultimi messaggi',
    youHaveBeenBanned: 'Nota: ti è stato vietato di chattare in questo canale.',
    reportTypingIndicator: {
        isTyping: 'sta scrivendo...',
        areTyping: 'stanno scrivendo...',
        multipleMembers: 'Più membri',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Questa chat è stata archiviata.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Questa chat non è più attiva perché ${displayName} ha chiuso il proprio account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Questa chat non è più attiva perché ${oldDisplayName} ha unito il suo account con ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Questa chat non è più attiva perché <strong>tu</strong> non fai più parte dello spazio di lavoro ${policyName}.`
                : `Questa chat non è più attiva perché ${displayName} non è più membro dello spazio di lavoro ${policyName}.`,
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
        fabNewChatExplained: 'Apri il menu delle azioni',
        fabScanReceiptExplained: 'Scansiona ricevuta',
        chatPinned: 'Chat fissata',
        draftedMessage: 'Messaggio in bozza',
        listOfChatMessages: 'Elenco dei messaggi chat',
        listOfChats: 'Elenco chat',
        saveTheWorld: 'Salva il mondo',
        tooltip: 'Inizia qui!',
        redirectToExpensifyClassicModal: {
            title: 'Prossimamente',
            description: 'Stiamo ancora perfezionando alcuni dettagli della New Expensify per adattarla alla tua configurazione specifica. Nel frattempo, passa a Expensify Classic.',
        },
    },
    homePage: {
        forYou: 'Per te',
        timeSensitiveSection: {
            title: 'Urgente',
            cta: 'Richiesta',
            offer50off: {
                title: 'Ottieni il 50% di sconto sul primo anno!',
                subtitle: ({formattedTime}: {formattedTime: string}) => `${formattedTime} rimanenti`,
            },
            offer25off: {
                title: 'Ottieni il 25% di sconto sul primo anno!',
                subtitle: ({days}: {days: number}) => `${days} ${days === 1 ? 'giorno' : 'giorni'} rimanenti`,
            },
            addShippingAddress: {
                title: 'Ci serve il tuo indirizzo di spedizione',
                subtitle: 'Fornisci un indirizzo per ricevere la tua Expensify Card.',
                cta: 'Aggiungi indirizzo',
            },
            activateCard: {
                title: 'Attiva la tua Expensify Card',
                subtitle: 'Convalida la tua carta e inizia a spendere.',
                cta: 'Attiva',
            },
        },
        announcements: 'Annunci',
        discoverSection: {
            title: 'Scopri',
            menuItemTitleNonAdmin: 'Scopri come creare spese e inviare report.',
            menuItemTitleAdmin: 'Scopri come invitare i membri, modificare i flussi di approvazione e riconciliare le carte aziendali.',
            menuItemDescription: 'Scopri cosa può fare Expensify in 2 minuti',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `Invia ${count} ${count === 1 ? 'resoconto' : 'report'}`,
            approve: ({count}: {count: number}) => `Approva ${count} ${count === 1 ? 'resoconto' : 'report'}`,
            pay: ({count}: {count: number}) => `Paga ${count} ${count === 1 ? 'resoconto' : 'report'}`,
            export: ({count}: {count: number}) => `Esporta ${count} ${count === 1 ? 'resoconto' : 'report'}`,
            begin: 'Inizia',
            emptyStateMessages: {
                nicelyDone: 'Ben fatto',
                keepAnEyeOut: 'Tieni d’occhio cosa arriverà dopo!',
                allCaughtUp: 'Sei a posto così',
                upcomingTodos: 'Le attività da fare in arrivo verranno visualizzate qui.',
            },
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
        gps: 'GPS',
        odometer: 'Contachilometri',
    },
    spreadsheet: {
        upload: 'Carica un foglio di calcolo',
        import: 'Importa foglio di calcolo',
        dragAndDrop: '<muted-link>Trascina e rilascia qui il tuo foglio di calcolo oppure scegli un file qui sotto. Formati supportati: .csv, .txt, .xls e .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Trascina e rilascia qui il tuo foglio di calcolo oppure seleziona un file qui sotto. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Scopri di più</a> sui formati di file supportati.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Seleziona un file di foglio di calcolo da importare. Formati supportati: .csv, .txt, .xls e .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Seleziona un file di foglio di calcolo da importare. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Scopri di più</a> sui formati di file supportati.</muted-link>`,
        fileContainsHeader: 'Il file contiene intestazioni di colonna',
        column: (name: string) => `Colonna ${name}`,
        fieldNotMapped: (fieldName: string) => `Ops! Un campo obbligatorio (“${fieldName}”) non è stato mappato. Controlla e riprova.`,
        singleFieldMultipleColumns: (fieldName: string) => `Ops! Hai associato un singolo campo ("${fieldName}") a più colonne. Controlla e riprova.`,
        emptyMappedField: (fieldName: string) => `Ops! Il campo ("${fieldName}") contiene uno o più valori vuoti. Controlla e riprova.`,
        importSuccessfulTitle: 'Importazione riuscita',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `Sono state aggiunte ${categories} categorie.` : 'È stata aggiunta 1 categoria.'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'Non è stato aggiunto o aggiornato alcun membro.';
            }
            if (added && updated) {
                return `${added} membro${added > 1 ? 's' : ''} aggiunto, ${updated} membro${updated > 1 ? 's' : ''} aggiornato.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} membri sono stati aggiornati.` : '1 membro è stato aggiornato.';
            }
            return added > 1 ? `${added} membri sono stati aggiunti.` : 'È stato aggiunto 1 membro.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `Sono stati aggiunti ${tags} tag.` : '1 etichetta è stata aggiunta.'),
        importMultiLevelTagsSuccessfulDescription: 'Sono stati aggiunti tag multilivello.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) =>
            rates > 1 ? `Sono state aggiunte le diarie giornaliere ${rates}.` : 'È stata aggiunta 1 indennità giornaliera.',
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} transazioni sono state importate.` : 'È stata importata 1 transazione.',
        importFailedTitle: 'Importazione non riuscita',
        importFailedDescription: 'Assicurati che tutti i campi siano compilati correttamente e riprova. Se il problema persiste, contatta Concierge.',
        importDescription: 'Scegli quali campi mappare dal tuo foglio di calcolo facendo clic sul menu a discesa accanto a ciascuna colonna importata qui sotto.',
        sizeNotMet: 'La dimensione del file deve essere maggiore di 0 byte',
        invalidFileMessage:
            'Il file che hai caricato è vuoto o contiene dati non validi. Assicurati che il file sia formattato correttamente e contenga le informazioni necessarie prima di caricarlo di nuovo.',
        importSpreadsheetLibraryError: 'Impossibile caricare il modulo del foglio di calcolo. Controlla la connessione a Internet e riprova.',
        importSpreadsheet: 'Importa foglio di calcolo',
        downloadCSV: 'Scarica CSV',
        importMemberConfirmation: () => ({
            one: `Conferma i dettagli seguenti per un nuovo membro dello spazio di lavoro che verrà aggiunto come parte di questo caricamento. I membri esistenti non riceveranno aggiornamenti di ruolo né messaggi di invito.`,
            other: (count: number) =>
                `Conferma i dettagli riportati di seguito per i ${count} nuovi membri dello spazio di lavoro che verranno aggiunti come parte di questo caricamento. I membri esistenti non riceveranno aggiornamenti del ruolo né messaggi di invito.`,
        }),
    },
    receipt: {
        upload: 'Carica ricevuta',
        uploadMultiple: 'Carica ricevute',
        desktopSubtitleSingle: `o trascinalo qui`,
        desktopSubtitleMultiple: `o trascinali qui`,
        alternativeMethodsTitle: 'Altri modi per aggiungere ricevute:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Scarica l'app</a> per scansionare dal tuo telefono</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Inoltra le ricevute a <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Aggiungi il tuo numero</a> per inviare le ricevute via SMS a ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Invia ricevute via SMS al ${phoneNumber} (solo numeri USA)</label-text>`,
        takePhoto: 'Scatta una foto',
        cameraAccess: 'Per scattare foto delle ricevute è necessario l’accesso alla fotocamera.',
        deniedCameraAccess: `L’accesso alla fotocamera non è ancora stato concesso, segui <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">queste istruzioni</a>.`,
        cameraErrorTitle: 'Errore fotocamera',
        cameraErrorMessage: 'Si è verificato un errore durante lo scatto della foto. Riprova.',
        locationAccessTitle: 'Consenti accesso alla posizione',
        locationAccessMessage: 'L’accesso alla posizione ci aiuta a mantenere fusi orari e valute accurati ovunque tu vada.',
        locationErrorTitle: 'Consenti accesso alla posizione',
        locationErrorMessage: 'L’accesso alla posizione ci aiuta a mantenere fusi orari e valute accurati ovunque tu vada.',
        allowLocationFromSetting: `L’accesso alla posizione ci aiuta a mantenere fusi orari e valute accurati ovunque tu vada. Consenti l’accesso alla posizione dalle impostazioni dei permessi del tuo dispositivo.`,
        dropTitle: 'Lascia andare',
        dropMessage: 'Rilascia il tuo file qui',
        flash: 'flash',
        multiScan: 'scansione multipla',
        shutter: 'otturatore',
        gallery: 'galleria',
        deleteReceipt: 'Elimina ricevuta',
        deleteConfirmation: 'Sei sicuro di voler eliminare questa ricevuta?',
        addReceipt: 'Aggiungi ricevuta',
        scanFailed: 'La ricevuta non può essere acquisita perché manca il nome dell’esercente, la data o l’importo.',
        addAReceipt: {
            phrase1: 'Aggiungi una ricevuta',
            phrase2: 'o trascinalo qui',
        },
    },
    quickAction: {
        scanReceipt: 'Scansiona ricevuta',
        recordDistance: 'Tieni traccia della distanza',
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
        percent: 'Percentuale',
        date: 'Data',
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
        original: 'Original',
        split: 'Dividi',
        splitExpense: 'Dividi spesa',
        splitDates: 'Suddividi date',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `dal ${startDate} al ${endDate} (${count} giorni)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} da ${merchant}`,
        splitByPercentage: 'Dividi per percentuale',
        splitByDate: 'Dividi per data',
        addSplit: 'Aggiungi suddivisione',
        makeSplitsEven: 'Rendi le divisioni eque',
        editSplits: 'Modifica suddivisioni',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `L'importo totale è superiore di ${amount} rispetto alla spesa originale.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `L’importo totale è di ${amount} in meno rispetto alla spesa originale.`,
        splitExpenseZeroAmount: 'Inserisci un importo valido prima di continuare.',
        splitExpenseOneMoreSplit: 'Nessuna suddivisione aggiunta. Aggiungine almeno una per salvare.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Modifica ${amount} per ${merchant}`,
        removeSplit: 'Rimuovi suddivisione',
        splitExpenseCannotBeEditedModalTitle: 'Questa spesa non può essere modificata',
        splitExpenseCannotBeEditedModalDescription: 'Le spese approvate o pagate non possono essere modificate',
        splitExpenseDistanceErrorModalDescription: 'Correggi l’errore nella tariffa distanza e riprova.',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Paga ${name ?? 'qualcuno'}`,
        expense: 'Spesa',
        categorize: 'Classifica',
        share: 'Condividi',
        participants: 'Partecipanti',
        createExpense: 'Crea spesa',
        trackDistance: 'Tieni traccia della distanza',
        createExpenses: (expensesNumber: number) => `Crea ${expensesNumber} spese`,
        removeExpense: 'Rimuovi spesa',
        removeThisExpense: 'Rimuovi questa spesa',
        removeExpenseConfirmation: 'Sei sicuro di voler rimuovere questa ricevuta? Questa azione non può essere annullata.',
        addExpense: 'Aggiungi spesa',
        chooseRecipient: 'Scegli destinatario',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Crea una spesa di ${amount}`,
        confirmDetails: 'Conferma i dettagli',
        pay: 'Paga',
        cancelPayment: 'Annulla pagamento',
        cancelPaymentConfirmation: 'Sei sicuro di voler annullare questo pagamento?',
        viewDetails: 'Visualizza dettagli',
        pending: 'In sospeso',
        canceled: 'Annullato',
        posted: 'Registrato',
        deleteReceipt: 'Elimina ricevuta',
        findExpense: 'Trova spesa',
        deletedTransaction: (amount: string, merchant: string) => `ha eliminato una spesa (${amount} per ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `ha spostato una spesa${reportName ? `da ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `ha spostato questa spesa${reportName ? `a <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `ha spostato questa spesa${reportName ? `da <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `ha spostato questa spesa nel tuo <a href="${reportUrl}">spazio personale</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `ha spostato questo report nello spazio di lavoro <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `ha spostato questo <a href="${movedReportUrl}">report</a> nello spazio di lavoro <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Ricevuta in attesa di abbinamento con transazione su carta',
        pendingMatch: 'Corrispondenza in sospeso',
        pendingMatchWithCreditCardDescription: 'Ricevuta in attesa di abbinamento con transazione su carta. Contrassegna come contante per annullare.',
        markAsCash: 'Segna come contante',
        routePending: 'Indirizzamento in sospeso...',
        receiptScanning: () => ({
            one: 'Scansione ricevuta in corso...',
            other: 'Scansione delle ricevute in corso...',
        }),
        scanMultipleReceipts: 'Scansiona più ricevute',
        scanMultipleReceiptsDescription: 'Scatta foto di tutte le tue ricevute in una volta sola, poi conferma i dettagli tu oppure lasciali confermare a noi.',
        receiptScanInProgress: 'Scansione ricevuta in corso',
        receiptScanInProgressDescription: 'Scansione della ricevuta in corso. Controlla più tardi o inserisci subito i dettagli.',
        removeFromReport: 'Rimuovi dal report',
        moveToPersonalSpace: 'Sposta le spese nel tuo spazio personale',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Sono state rilevate possibili note spese duplicate. Controlla i duplicati per consentire l’invio.'
                : 'Spese potenzialmente duplicate individuate. Controlla i duplicati per abilitare l’approvazione.',
        receiptIssuesFound: () => ({
            one: 'Problema trovato',
            other: 'Problemi riscontrati',
        }),
        fieldPending: 'In sospeso...',
        defaultRate: 'Tariffa predefinita',
        receiptMissingDetails: 'Dettagli della ricevuta mancanti',
        missingAmount: 'Importo mancante',
        missingMerchant: 'Esercente mancante',
        receiptStatusTitle: 'Scansione in corso…',
        receiptStatusText: 'Solo tu puoi vedere questa ricevuta mentre è in scansione. Riprova più tardi o inserisci subito i dettagli.',
        receiptScanningFailed: 'Scansione della ricevuta non riuscita. Inserisci i dettagli manualmente.',
        transactionPendingDescription: 'Transazione in sospeso. La registrazione potrebbe richiedere alcuni giorni.',
        companyInfo: 'Informazioni azienda',
        companyInfoDescription: 'Ci servono ancora alcuni dettagli prima che tu possa inviare la tua prima fattura.',
        yourCompanyName: 'Nome della tua azienda',
        yourCompanyWebsite: 'Sito web della tua azienda',
        yourCompanyWebsiteNote: 'Se non hai un sito web, puoi fornire invece il profilo LinkedIn o il profilo sui social media della tua azienda.',
        invalidDomainError: 'Hai inserito un dominio non valido. Per continuare, inserisci un dominio valido.',
        publicDomainError: 'Hai inserito un dominio pubblico. Per continuare, inserisci un dominio privato.',
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
        individual: 'Individual',
        business: 'Business',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} con Expensify` : `Paga con Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} come individuo` : `Paga con conto personale`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} con il portafoglio` : `Paga con il portafoglio`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Paga ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Paga ${formattedAmount} come azienda` : `Paga con conto aziendale`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Segna ${formattedAmount} come pagato` : `Segna come pagato`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `ha pagato ${amount} con conto personale ${last4Digits}` : `Pagato con conto personale`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `ha pagato ${amount} con il conto aziendale ${last4Digits}` : `Pagato con conto aziendale`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Paga ${formattedAmount} tramite ${policyName}` : `Paga tramite ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `ha pagato ${amount} con il conto bancario ${last4Digits}` : `pagato con conto bancario ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `pagato ${amount ? `${amount} ` : ''} con il conto bancario ${last4Digits} tramite le <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole dello spazio di lavoro</a>`,
        invoicePersonalBank: (lastFour: string) => `Conto personale • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Conto aziendale • ${lastFour}`,
        nextStep: 'Prossimi passaggi',
        finished: 'Completato',
        flip: 'Capovolgi',
        sendInvoice: ({amount}: RequestAmountParams) => `Invia fattura di ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `per ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `inviato${memo ? `, con nota ${memo}` : ''}`,
        automaticallySubmitted: `inviato tramite <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">invio posticipato</a>`,
        queuedToSubmitViaDEW: 'in coda per l’invio tramite flusso di approvazione personalizzato',
        queuedToApproveViaDEW: 'in coda per l’approvazione tramite workflow di approvazione personalizzato',
        trackedAmount: (formattedAmount: string, comment?: string) => `monitoraggio di ${formattedAmount}${comment ? `per ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `dividi ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `suddividi ${formattedAmount}${comment ? `per ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `La tua quota ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} deve ${amount}${comment ? `per ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} deve:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}ha pagato ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} ha pagato:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} ha speso ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} ha speso:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} ha approvato:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} ha approvato ${amount}`,
        payerSettled: (amount: number | string) => `pagato ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `ha pagato ${amount}. Collega un conto bancario per ricevere il pagamento.`,
        automaticallyApproved: `approvato tramite <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole dello spazio di lavoro</a>`,
        approvedAmount: (amount: number | string) => `approvato ${amount}`,
        approvedMessage: `approvato`,
        unapproved: `non approvato`,
        automaticallyForwarded: `approvato tramite <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole dello spazio di lavoro</a>`,
        forwarded: `approvato`,
        rejectedThisReport: 'ha rifiutato questo report',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `ha avviato il pagamento, ma sta aspettando che ${submitterDisplayName} aggiunga un conto bancario.`,
        adminCanceledRequest: 'ha annullato il pagamento',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `ha annullato il pagamento di ${amount}, perché ${submitterDisplayName} non ha attivato il suo Portafoglio Expensify entro 30 giorni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} ha aggiunto un conto bancario. Il pagamento di ${amount} è stato effettuato.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}contrassegnato come pagato${comment ? `, dicendo «${comment}»` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}pagato con portafoglio`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}pagato con Expensify tramite <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regole dello spazio di lavoro</a>`,
        noReimbursableExpenses: 'Questo report contiene un importo non valido',
        pendingConversionMessage: 'Il totale verrà aggiornato quando torni online',
        changedTheExpense: 'ha modificato la spesa',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} a ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `imposta ${translatedChangedField} su ${newMerchant}, il che ha impostato l'importo su ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `il/la ${valueName} (in precedenza ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} in ${newValueToDisplay} (precedentemente ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `ha cambiato ${translatedChangedField} in ${newMerchant} (in precedenza ${oldMerchant}), aggiornando l’importo a ${newAmountToDisplay} (in precedenza ${oldAmountToDisplay})`,
        basedOnAI: "in base all'attività precedente",
        basedOnMCC: ({rulesLink}: {rulesLink: string}) =>
            rulesLink ? `in base alle <a href="${rulesLink}">regole dello spazio di lavoro</a>` : 'in base alle regole dello spazio di lavoro',
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `per ${comment}` : 'spesa'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Report fattura n. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} inviato${comment ? `per ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `spesa spostata dallo spazio personale a ${workspaceName ?? `chatta con ${reportName}`}`,
        movedToPersonalSpace: 'ha spostato la spesa nello spazio personale',
        error: {
            invalidCategoryLength: "Il nome della categoria supera i 255 caratteri. Riducilo oppure scegli un'altra categoria.",
            invalidTagLength: 'Il nome del tag supera i 255 caratteri. Accorcialo o scegli un altro tag.',
            invalidAmount: 'Inserisci un importo valido prima di continuare',
            invalidDistance: 'Inserisci una distanza valida prima di continuare',
            invalidReadings: 'Inserisci sia la lettura iniziale che quella finale',
            negativeDistanceNotAllowed: 'La lettura finale deve essere maggiore della lettura iniziale',
            invalidIntegerAmount: 'Inserisci un importo in dollari intero prima di continuare',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `L'importo massimo dell'imposta è ${amount}`,
            invalidSplit: 'La somma delle suddivisioni deve essere uguale all’importo totale',
            invalidSplitParticipants: 'Inserisci un importo maggiore di zero per almeno due partecipanti',
            invalidSplitYourself: 'Inserisci un importo diverso da zero per la tua suddivisione',
            noParticipantSelected: 'Seleziona un partecipante',
            other: 'Errore imprevisto. Riprova più tardi.',
            genericCreateFailureMessage: 'Errore imprevisto nell’invio di questa spesa. Riprova più tardi.',
            genericCreateInvoiceFailureMessage: 'Errore imprevisto durante l’invio di questa fattura. Riprova più tardi.',
            genericHoldExpenseFailureMessage: 'Errore imprevisto durante la sospensione di questa spesa. Riprova più tardi.',
            genericUnholdExpenseFailureMessage: 'Errore imprevisto durante la rimozione della sospensione di questa spesa. Riprova più tardi.',
            receiptDeleteFailureError: 'Errore imprevisto durante l’eliminazione di questa ricevuta. Riprova più tardi.',
            receiptFailureMessage:
                '<rbr>Si è verificato un errore durante il caricamento della ricevuta. Per favore <a href="download">salva la ricevuta</a> e <a href="retry">riprova</a> più tardi.</rbr>',
            receiptFailureMessageShort: 'Si è verificato un errore durante il caricamento della ricevuta.',
            genericDeleteFailureMessage: 'Errore imprevisto nell’eliminazione di questa spesa. Riprova più tardi.',
            genericEditFailureMessage: 'Errore imprevisto durante la modifica di questa spesa. Riprova più tardi.',
            genericSmartscanFailureMessage: 'Alla transazione mancano dei campi',
            duplicateWaypointsErrorMessage: 'Rimuovi i punti di passaggio duplicati',
            atLeastTwoDifferentWaypoints: 'Inserisci almeno due indirizzi diversi',
            splitExpenseMultipleParticipantsErrorMessage: 'Una spesa non può essere divisa tra uno spazio di lavoro e altri membri. Aggiorna la tua selezione.',
            invalidMerchant: 'Inserisci un esercente valido',
            atLeastOneAttendee: 'Devi selezionare almeno un partecipante',
            invalidQuantity: 'Inserisci una quantità valida',
            quantityGreaterThanZero: 'La quantità deve essere maggiore di zero',
            invalidSubrateLength: 'Deve esserci almeno un sottotariffa',
            invalidRate: 'Tariffa non valida per questo workspace. Seleziona una tariffa disponibile dal workspace.',
            endDateBeforeStartDate: 'La data di fine non può essere precedente alla data di inizio',
            endDateSameAsStartDate: 'La data di fine non può essere uguale alla data di inizio',
            manySplitsProvided: `Il numero massimo di suddivisioni consentite è ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `L'intervallo di date non può superare ${CONST.IOU.SPLITS_LIMIT} giorni.`,
        },
        dismissReceiptError: 'Ignora errore',
        dismissReceiptErrorConfirmation: 'Attenzione! Ignorare questo errore rimuoverà completamente la ricevuta che hai caricato. Sei sicuro?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `ha iniziato a saldare i conti. Il pagamento è in sospeso finché ${submitterDisplayName} non abilita il proprio portafoglio.`,
        enableWallet: 'Abilita wallet',
        hold: 'In sospeso',
        unhold: 'Rimuovi sospensione',
        holdExpense: () => ({
            one: 'Metti spesa in sospeso',
            other: 'Trattenere spese',
        }),
        unholdExpense: 'Sblocca spesa',
        heldExpense: 'ha messo in sospeso questa spesa',
        unheldExpense: 'ha sbloccato questa spesa',
        moveUnreportedExpense: 'Sposta spesa non rendicontata',
        addUnreportedExpense: 'Aggiungi spesa non rendicontata',
        selectUnreportedExpense: 'Seleziona almeno una spesa da aggiungere al report.',
        emptyStateUnreportedExpenseTitle: 'Nessuna spesa non contabilizzata',
        emptyStateUnreportedExpenseSubtitle: 'Sembra che tu non abbia alcuna spesa non rendicontata. Prova a crearne una qui sotto.',
        addUnreportedExpenseConfirm: 'Aggiungi al report',
        newReport: 'Nuovo report',
        explainHold: () => ({
            one: 'Spiega perché stai trattenendo questa spesa.',
            other: 'Spiega perché stai trattenendo queste spese.',
        }),
        retracted: 'ritirato',
        retract: 'Revoca',
        reopened: 'riaperto',
        reopenReport: 'Riapri resoconto',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Questo rendiconto è già stato esportato su ${connectionName}. Modificarlo potrebbe causare discrepanze nei dati. Sei sicuro di voler riaprire questo rendiconto?`,
        reason: 'Motivo',
        holdReasonRequired: 'È obbligatorio indicare un motivo quando si mette in attesa.',
        expenseWasPutOnHold: 'La spesa è stata messa in sospeso',
        expenseOnHold: 'Questa spesa è stata messa in sospeso. Controlla i commenti per i prossimi passi.',
        expensesOnHold: 'Tutte le spese sono state messe in sospeso. Ti preghiamo di rivedere i commenti per i prossimi passi.',
        expenseDuplicate: 'Questa spesa ha dettagli simili a un’altra. Controlla i duplicati per continuare.',
        someDuplicatesArePaid: 'Alcuni di questi duplicati sono già stati approvati o pagati.',
        reviewDuplicates: 'Esamina i duplicati',
        keepAll: 'Mantieni tutto',
        confirmApprove: 'Conferma l’importo di approvazione',
        confirmApprovalAmount: 'Approva solo le spese conformi oppure approva l’intero report.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Questa nota spese è in sospeso. Vuoi approvarla comunque?',
            other: 'Queste spese sono in sospeso. Vuoi approvarle comunque?',
        }),
        confirmPay: 'Conferma l’importo del pagamento',
        confirmPayAmount: 'Paga ciò che non è in sospeso oppure paga l’intero rapporto.',
        confirmPayAllHoldAmount: () => ({
            one: 'Questa spesa è in sospeso. Vuoi pagarla comunque?',
            other: 'Queste spese sono in sospeso. Vuoi pagarle comunque?',
        }),
        payOnly: 'Paga solo',
        approveOnly: 'Solo approvazione',
        holdEducationalTitle: 'Devi trattenere questa spesa?',
        whatIsHoldExplain: 'Mettere in sospeso è come premere “pausa” su una spesa finché non sei prontə a inviarla.',
        holdIsLeftBehind: 'Le spese bloccate vengono lasciate indietro anche se invii un intero report.',
        unholdWhenReady: 'Sblocca le spese quando sei pronto per inviarle.',
        changePolicyEducational: {
            title: 'Hai spostato questo report!',
            description: 'Ricontrolla questi elementi, che tendono a cambiare quando si spostano i report in un nuovo spazio di lavoro.',
            reCategorize: '<strong>Ricategorizza tutte le spese</strong> per rispettare le regole dello spazio di lavoro.',
            workflows: 'Questo resoconto potrebbe ora essere soggetto a un diverso <strong>flusso di approvazione.</strong>',
        },
        changeWorkspace: 'Cambia workspace',
        set: 'imposta',
        changed: 'modificato',
        removed: 'rimosso',
        transactionPending: 'Transazione in sospeso.',
        chooseARate: 'Seleziona una tariffa di rimborso per miglio o chilometro per lo spazio di lavoro',
        unapprove: 'Revoca approvazione',
        unapproveReport: 'Revoca approvazione report',
        headsUp: 'Attenzione!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Questo report è già stato esportato su ${accountingIntegration}. Modificarlo potrebbe causare discrepanze nei dati. Sei sicuro di voler revocare l’approvazione di questo report?`,
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
        endTime: 'Orario di fine',
        deleteSubrate: 'Elimina sottotariffa',
        deleteSubrateConfirmation: 'Sei sicuro di voler eliminare questa sotto-tariffa?',
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
            educationalTitle: 'Vuoi mettere in sospeso o rifiutare?',
            educationalText: 'Se non sei pronto ad approvare o pagare una spesa, puoi metterla in sospeso oppure rifiutarla.',
            holdExpenseTitle: 'Metti in sospeso una spesa per chiedere maggiori dettagli prima dell’approvazione o del pagamento.',
            approveExpenseTitle: 'Approva le altre note spese mentre quelle in sospeso restano assegnate a te.',
            heldExpenseLeftBehindTitle: 'Le spese in sospeso vengono escluse quando approvi un intero rapporto.',
            rejectExpenseTitle: 'Rifiuta una spesa che non intendi approvare o rimborsare.',
            reasonPageTitle: 'Rifiuta spesa',
            reasonPageDescription: 'Spiega perché rifiuti questa spesa.',
            rejectReason: 'Motivo del rifiuto',
            markAsResolved: 'Contrassegna come risolto',
            rejectedStatus: 'Questa spesa è stata rifiutata. Attendiamo che tu risolva i problemi e la contrassegni come risolta per poterla inviare.',
            reportActions: {
                rejectedExpense: 'ha rifiutato questa spesa',
                markedAsResolved: 'ha contrassegnato il motivo del rifiuto come risolto',
            },
        },
        moveExpenses: () => ({one: 'Sposta spesa', other: 'Sposta le spese'}),
        moveExpensesError: 'Non puoi spostare le spese forfettarie (per diem) ai report di altri spazi di lavoro, perché le tariffe per diem potrebbero differire tra gli spazi di lavoro.',
        changeApprover: {
            title: 'Cambia approvatore',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Scegli un’opzione per cambiare l’approvatore di questo report. (Aggiorna le <a href="${workflowSettingLink}">impostazioni dello spazio di lavoro</a> per modificarlo in modo permanente per tutti i report.)`,
            changedApproverMessage: (managerID: number) => `ha cambiato l'approvatore in <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Aggiungi approvatore',
                addApproverSubtitle: 'Aggiungi un ulteriore approvatore al flusso di approvazione esistente.',
                bypassApprovers: 'Ignora approvatori',
                bypassApproversSubtitle: 'Impostati come approvatore finale e salta gli eventuali approvatori rimanenti.',
            },
            addApprover: {
                subtitle: 'Scegli un approvatore aggiuntivo per questo report prima che venga instradato attraverso il resto del flusso di approvazione.',
            },
        },
        chooseWorkspace: 'Scegli uno spazio di lavoro',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `report indirizzato a ${to} a causa del workflow di approvazione personalizzato`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'ora' : 'ore'} @ ${rate} / ora`,
            hrs: 'ore',
            hours: 'Ore',
            ratePreview: (rate: string) => `${rate} / ora`,
            amountTooLargeError: 'L’importo totale è troppo alto. Riduci le ore o diminuisci la tariffa.',
        },
        correctDistanceRateError: 'Correggi l’errore della tariffa distanza e riprova.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>Spiega</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);
            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;
                if (key === 'reimbursable') {
                    return value ? 'ha contrassegnato la spesa come "rimborsabile"' : 'ha contrassegnato la spesa come "non rimborsabile"';
                }
                if (key === 'billable') {
                    return value ? 'ha contrassegnato la spesa come "fatturabile"' : 'ha contrassegnato la spesa come "non addebitabile"';
                }
                if (key === 'tax') {
                    const taxEntry = value as PolicyRulesModifiedFields['tax'];
                    const taxRateName = taxEntry?.field_id_TAX.name ?? '';
                    if (isFirst) {
                        return `imposta l'aliquota fiscale su "${taxRateName}"`;
                    }
                    return `aliquota fiscale a "${taxRateName}"`;
                }
                const updatedValue = value as string | boolean;
                if (isFirst) {
                    return `imposta ${translations.common[key].toLowerCase()} su "${updatedValue}"`;
                }
                return `${translations.common[key].toLowerCase()} in "${updatedValue}"`;
            });
            return `${formatList(fragments)} tramite le <a href="${policyRulesRoute}">regole dello spazio di lavoro</a>`;
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Unisci spese',
            noEligibleExpenseFound: 'Nessuna spesa idonea trovata',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Non hai nessuna spesa che possa essere unita a questa. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Scopri di più</a> sulle spese idonee.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Seleziona una <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">spesa idonea</a> da unire a <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Seleziona ricevuta',
            pageTitle: 'Seleziona la ricevuta che vuoi tenere:',
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
            pageTitle: 'Conferma i dettagli che desideri mantenere. I dettagli che non manterrai verranno eliminati.',
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
            daily: 'Quotidiana',
            mute: 'Silenzia',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Nascosto',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Il numero non è stato convalidato. Fai clic sul pulsante per rinviare il link di convalida tramite SMS.',
        emailHasNotBeenValidated: "L'email non è stata convalidata. Fai clic sul pulsante per inviare di nuovo il link di convalida via SMS.",
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Carica foto',
        removePhoto: 'Rimuovi foto',
        editImage: 'Modifica foto',
        viewPhoto: 'Visualizza foto',
        imageUploadFailed: "Caricamento dell'immagine non riuscito",
        deleteWorkspaceError: 'Spiacenti, si è verificato un problema imprevisto durante l’eliminazione dell’avatar del tuo spazio di lavoro',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `L’immagine selezionata supera la dimensione massima di caricamento di ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Carica un’immagine più grande di ${minHeightInPx}x${minWidthInPx} pixel e più piccola di ${maxHeightInPx}x${maxWidthInPx} pixel.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `L’immagine del profilo deve essere di uno dei seguenti tipi: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Modifica immagine del profilo',
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
                        return `In attesa che un admin aggiunga delle spese.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> invii le spese.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che <strong>${actor}</strong> invii le note spese.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore invii le spese.`;
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
                        return `In attesa che le <strong>tue</strong> spese vengano inviate automaticamente${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che le spese di <strong>${actor}</strong> vengano inviate automaticamente${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che le note spese di un amministratore vengano inviate automaticamente${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> risolva i problemi.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che <strong>${actor}</strong> risolva i problemi.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore risolva i problemi.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa di <strong>te</strong> per approvare le spese.`;
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
                        return `In attesa che <strong>${actor}</strong> esporti questo report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore esporti questo report.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> rimborsi le spese.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In attesa che <strong>${actor}</strong> paghi le spese.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `In attesa che un amministratore rimborsi le spese.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In attesa che <strong>tu</strong> completi la configurazione di un conto bancario aziendale.`;
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Ops! Sembra che tu stia inviando a <strong>te stessə</strong>. L’approvazione dei propri report è <strong>vietata</strong> nel tuo workspace. Invia questo report a un’altra persona oppure contatta l’amministratore per cambiare la persona a cui lo invii.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'a breve',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'più tardi oggi',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'di domenica',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'il 1º e il 16 di ogni mese',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'nell’ultimo giorno lavorativo del mese',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: "l'ultimo giorno del mese",
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
        invalidFileMessage: "File non valido. Prova con un'altra immagine.",
        avatarUploadFailureMessage: "Si è verificato un errore durante il caricamento dell'avatar. Riprova.",
        online: 'In linea',
        offline: 'Offline',
        syncing: 'Sincronizzazione',
        profileAvatar: 'Avatar profilo',
        publicSection: {
            title: 'Pubblico',
            subtitle: 'Questi dettagli vengono visualizzati sul tuo profilo pubblico. Chiunque può vederli.',
        },
        privateSection: {
            title: 'Privato',
            subtitle: 'Questi dati vengono utilizzati per i viaggi e i pagamenti. Non verranno mai mostrati sul tuo profilo pubblico.',
        },
    },
    securityPage: {
        title: 'Opzioni di sicurezza',
        subtitle: 'Abilita l’autenticazione a due fattori per mantenere il tuo account al sicuro.',
        goToSecurity: 'Torna alla pagina di sicurezza',
    },
    shareCodePage: {
        title: 'Il tuo codice',
        subtitle: 'Invita membri su Expensify condividendo il tuo codice QR personale o il tuo link di riferimento.',
    },
    pronounsPage: {
        pronouns: 'Pronomi',
        isShownOnProfile: 'I tuoi pronomi vengono mostrati sul tuo profilo.',
        placeholderText: 'Cerca per vedere le opzioni',
    },
    contacts: {
        contactMethods: 'Metodi di contatto',
        featureRequiresValidate: 'Questa funzionalità richiede la verifica del tuo account.',
        validateAccount: 'Convalida il tuo account',
        helpText: ({email}: {email: string}) =>
            `Aggiungi altri modi per accedere e inviare ricevute a Expensify.<br/><br/>Aggiungi un indirizzo email per inoltrare le ricevute a <a href="mailto:${email}">${email}</a> oppure aggiungi un numero di telefono per inviare le ricevute via SMS al 47777 (solo numeri degli Stati Uniti).`,
        pleaseVerify: 'Verifica questo metodo di contatto.',
        getInTouch: 'Useremo questo metodo per contattarti.',
        enterMagicCode: (contactMethod: string) => `Inserisci il codice magico inviato a ${contactMethod}. Dovrebbe arrivare entro uno o due minuti.`,
        setAsDefault: 'Imposta come predefinito',
        yourDefaultContactMethod:
            'Questo è il tuo metodo di contatto predefinito. Prima di poterlo eliminare, devi scegliere un altro metodo di contatto e fare clic su “Imposta come predefinito”.',
        removeContactMethod: 'Rimuovi metodo di contatto',
        removeAreYouSure: 'Sei sicuro di voler rimuovere questo metodo di contatto? Questa azione non può essere annullata.',
        failedNewContact: 'Impossibile aggiungere questo metodo di contatto.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Impossibile inviare un nuovo codice magico. Attendi un momento e riprova.',
            validateSecondaryLogin: 'Codice magico errato o non valido. Riprova oppure richiedi un nuovo codice.',
            deleteContactMethod: 'Impossibile eliminare il metodo di contatto. Contatta Concierge per assistenza.',
            setDefaultContactMethod: 'Impossibile impostare un nuovo metodo di contatto predefinito. Contatta Concierge per ricevere assistenza.',
            addContactMethod: 'Impossibile aggiungere questo metodo di contatto. Contatta Concierge per ricevere assistenza.',
            enteredMethodIsAlreadySubmitted: 'Questo metodo di contatto esiste già',
            passwordRequired: 'password richiesta.',
            contactMethodRequired: 'Metodo di contatto obbligatorio',
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
        heHimHisTheyThemTheirs: 'Lui / Lo / Suo / Loro / Li / Loro',
        sheHerHers: 'Lei / Sua / Sue',
        sheHerHersTheyThemTheirs: 'Lei / La / Sua / Loro / Loro / Loro',
        merMers: 'Mer / Meri',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'They / Them / Theirs',
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
        pleaseInstallExpensifyClassic: 'Installa l’ultima versione di Expensify',
        toGetLatestChanges: 'Per dispositivi mobili, scarica e installa la versione più recente. Per il web, aggiorna il browser.',
        newAppNotAvailable: 'La nuova app Expensify non è più disponibile.',
    },
    initialSettingsPage: {
        about: 'Informazioni',
        aboutPage: {
            description: 'La nuova app Expensify è sviluppata da una comunità di sviluppatori open source da tutto il mondo. Aiutaci a costruire il futuro di Expensify.',
            appDownloadLinks: 'Link per scaricare l’app',
            viewKeyboardShortcuts: 'Mostra le scorciatoie da tastiera',
            viewTheCode: 'Visualizza il codice',
            viewOpenJobs: 'Visualizza offerte aperte',
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
        },
        troubleshoot: {
            clearCacheAndRestart: 'Svuota cache e riavvia',
            viewConsole: 'Mostra console di debug',
            debugConsole: 'Console di debug',
            description:
                '<muted-text>Usa gli strumenti qui sotto per risolvere i problemi con l’esperienza Expensify. Se riscontri qualsiasi problema, ti preghiamo di <concierge-link>segnalare un bug</concierge-link>.</muted-text>',
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
            forceOffline: 'Forza offline',
            simulatePoorConnection: 'Simula connessione internet scarsa',
            simulateFailingNetworkRequests: 'Simula l’errore delle richieste di rete',
            authenticationStatus: 'Stato di autenticazione',
            deviceCredentials: 'Credenziali del dispositivo',
            invalidate: 'Invalida',
            destroy: 'Elimina',
            maskExportOnyxStateData: 'Offusca i dati sensibili dei membri durante l’esportazione dello stato di Onyx',
            exportOnyxState: 'Esporta stato Onyx',
            importOnyxState: 'Importa stato Onyx',
            testCrash: 'Arresto anomalo di test',
            resetToOriginalState: 'Reimposta allo stato originale',
            usingImportedState: 'Stai utilizzando uno stato importato. Premi qui per cancellarlo.',
            debugMode: 'Modalità debug',
            invalidFile: 'File non valido',
            invalidFileDescription: 'Il file che stai tentando di importare non è valido. Riprova.',
            invalidateWithDelay: 'Invalida con ritardo',
            leftHandNavCache: 'Cache del menu di navigazione sinistro',
            clearleftHandNavCache: 'Cancella',
            recordTroubleshootData: 'Registra dati di risoluzione problemi',
            softKillTheApp: "Arresta dolcemente l'app",
            kill: 'Uccidi',
            sentryDebug: 'Debug Sentry',
            sentryDebugDescription: 'Registra le richieste Sentry nella console',
            sentryHighlightedSpanOps: 'Nomi degli span evidenziati',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interazione.clic, navigazione, ui.caricamento',
        },
        debugConsole: {
            saveLog: 'Salva log',
            shareLog: 'Condividi registro',
            enterCommand: 'Inserisci comando',
            execute: 'Esegui',
            noLogsAvailable: 'Nessun registro disponibile',
            logSizeTooLarge: ({size}: LogSizeParams) => `La dimensione del log supera il limite di ${size} MB. Usa "Salva log" per scaricare il file di log.`,
            logs: 'Registri',
            viewConsole: 'Visualizza console',
        },
        security: 'Sicurezza',
        signOut: 'Esci',
        restoreStashed: 'Ripristina login memorizzato',
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
        enterMessageHere: 'Inserisci qui il messaggio',
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
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Inserisci l'account che vuoi unire in <strong>${login}</strong>.`,
            notReversibleConsent: 'Capisco che questa operazione non è reversibile',
        },
        accountValidate: {
            confirmMerge: 'Sei sicuro di voler unire gli account?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Unire i tuoi account è irreversibile e comporterà la perdita di tutte le note spese non inviate per <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Per continuare, inserisci il codice magico inviato a <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Codice magico errato o non valido. Riprova oppure richiedi un nuovo codice.',
                fallback: 'Si è verificato un errore. Riprova più tardi.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Account uniti!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Hai unito correttamente tutti i dati da <strong>${from}</strong> a <strong>${to}</strong>. D’ora in poi, puoi usare uno qualsiasi dei due accessi per questo account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Ci stiamo lavorando',
            limitedSupport: 'Non supportiamo ancora l’unione degli account nella nuova Expensify. Effettua questa operazione su Expensify Classic.',
            reachOutForHelp: '<muted-text><centered-text>Non esitare a <concierge-link>contattare Concierge</concierge-link> se hai domande!</centered-text></muted-text>',
            goToExpensifyClassic: 'Vai a Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Non puoi unire <strong>${email}</strong> perché è gestito da <strong>${email.split('@').at(1) ?? ''}</strong>. Per assistenza, <concierge-link>contatta Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Non puoi unire <strong>${email}</strong> ad altri account perché l’amministratore del dominio l’ha impostata come login principale. Unisci invece gli altri account a questo.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Non puoi unire gli account perché <strong>${email}</strong> ha l’autenticazione a due fattori (2FA) attivata. Disattiva la 2FA per <strong>${email}</strong> e riprova.</centered-text></muted-text>`,
            learnMore: 'Scopri di più sull’unione degli account.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Non puoi unire <strong>${email}</strong> perché è bloccato. <concierge-link>Contatta Concierge</concierge-link> per assistenza.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Non puoi unire gli account perché <strong>${email}</strong> non ha un account Expensify. Per favore <a href="${contactMethodLink}">aggiungilo come metodo di contatto</a> invece.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Non puoi unire <strong>${email}</strong> ad altri account. Unisci invece gli altri account a questo.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Non puoi unire gli account in <strong>${email}</strong> perché questo account possiede una relazione di fatturazione con fattura emessa.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Riprova più tardi',
            description: 'Sono stati effettuati troppi tentativi di unire gli account. Riprova più tardi.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Non puoi unire ad altri account perché non è stato convalidato. Convalida l’account e riprova.',
        },
        mergeFailureSelfMerge: {
            description: 'Non puoi unire un conto con se stesso.',
        },
        mergeFailureGenericHeading: 'Impossibile unire gli account',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Segnala attività sospetta',
        lockAccount: 'Blocca account',
        unlockAccount: 'Sblocca account',
        compromisedDescription:
            'Noti qualcosa di strano nel tuo account? Segnalarlo bloccherà immediatamente il tuo account, impedirà nuove transazioni con la Expensify Card e eviterà qualsiasi modifica all’account.',
        domainAdminsDescription: 'Per gli amministratori di dominio: questo mette anche in pausa tutta l’attività delle Expensify Card e le azioni amministrative in tutti i tuoi domini.',
        areYouSure: 'Sei sicuro di voler bloccare il tuo account Expensify?',
        onceLocked: 'Una volta bloccato, il tuo account sarà limitato in attesa di una richiesta di sblocco e di una verifica di sicurezza',
    },
    failedToLockAccountPage: {
        failedToLockAccount: "Impossibile bloccare l'account",
        failedToLockAccountDescription: `Non siamo riusciti a bloccare il tuo account. Chatta con Concierge per risolvere questo problema.`,
        chatWithConcierge: 'Chatta con Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Account bloccato',
        yourAccountIsLocked: 'Il tuo account è bloccato',
        chatToConciergeToUnlock: 'Chatta con Concierge per risolvere i problemi di sicurezza e sbloccare il tuo account.',
        chatWithConcierge: 'Chatta con Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Autenticazione a due fattori',
        twoFactorAuthEnabled: 'Autenticazione a due fattori abilitata',
        whatIsTwoFactorAuth:
            'L’autenticazione a due fattori (2FA) aiuta a mantenere al sicuro il tuo account. Quando accedi, dovrai inserire un codice generato dalla tua app di autenticazione preferita.',
        disableTwoFactorAuth: 'Disattiva l’autenticazione a due fattori',
        explainProcessToRemove: 'Per disattivare l’autenticazione a due fattori (2FA), inserisci un codice valido dalla tua app di autenticazione.',
        explainProcessToRemoveWithRecovery: 'Per disabilitare l’autenticazione a due fattori (2FA), inserisci un codice di recupero valido.',
        disabled: 'L’autenticazione a due fattori è ora disattivata',
        noAuthenticatorApp: "Non sarà più necessaria un'app di autenticazione per accedere a Expensify.",
        stepCodes: 'Codici di recupero',
        keepCodesSafe: 'Conserva questi codici di recupero al sicuro!',
        codesLoseAccess: dedent(`
            Se perdi l’accesso alla tua app di autenticazione e non hai questi codici, perderai l’accesso al tuo account.

            Nota: La configurazione dell’autenticazione a due fattori ti disconnetterà da tutte le altre sessioni attive.
        `),
        errorStepCodes: 'Copia o scarica i codici prima di continuare',
        stepVerify: 'Verifica',
        scanCode: 'Scansiona il codice QR usando il tuo',
        authenticatorApp: 'app di autenticazione',
        addKey: 'Oppure aggiungi questa chiave segreta alla tua app di autenticazione:',
        enterCode: 'Quindi inserisci il codice a sei cifre generato dalla tua app di autenticazione.',
        stepSuccess: 'Completato',
        enabled: 'Autenticazione a due fattori abilitata',
        congrats: 'Congratulazioni! Ora hai questa sicurezza extra.',
        copy: 'Copia',
        disable: 'Disattiva',
        enableTwoFactorAuth: 'Abilita l’autenticazione a due fattori',
        pleaseEnableTwoFactorAuth: 'Abilita l’autenticazione a due fattori.',
        twoFactorAuthIsRequiredDescription: 'Per motivi di sicurezza, Xero richiede l’autenticazione a due fattori per collegare l’integrazione.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Autenticazione a due fattori richiesta',
        twoFactorAuthIsRequiredForAdminsTitle: "Abilita l'autenticazione a due fattori",
        twoFactorAuthIsRequiredXero: 'La tua connessione contabile Xero richiede l’autenticazione a due fattori.',
        twoFactorAuthIsRequiredCompany: "La tua azienda richiede l'autenticazione a due fattori.",
        twoFactorAuthCannotDisable: "Impossibile disattivare l'autenticazione a due fattori",
        twoFactorAuthRequired: 'Per la connessione a Xero è richiesta l’autenticazione a due fattori (2FA) e non può essere disattivata.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Inserisci il tuo codice di recupero',
            incorrectRecoveryCode: 'Codice di recupero non corretto. Riprova.',
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
        personalNoteMessage: 'Tieni delle note su questa chat qui. Solo tu puoi aggiungere, modificare o visualizzare queste note.',
        sharedNoteMessage: 'Annota qui le note su questa chat. I dipendenti Expensify e gli altri membri del dominio team.expensify.com possono visualizzarle.',
        composerLabel: 'Note',
        myNote: 'La mia nota',
        error: {
            genericFailureMessage: 'Non è stato possibile salvare le note private',
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
        expirationDate: 'MMAA',
        cvv: 'CVV',
        billingAddress: 'Indirizzo di fatturazione',
        growlMessageOnSave: 'La tua carta di debito è stata aggiunta correttamente',
        expensifyPassword: 'Password Expensify',
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
        growlMessageOnSave: 'La tua carta di pagamento è stata aggiunta correttamente',
        expensifyPassword: 'Password Expensify',
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
        setDefaultConfirmation: 'Imposta metodo di pagamento predefinito',
        setDefaultSuccess: 'Metodo di pagamento predefinito impostato!',
        deleteAccount: 'Elimina account',
        deleteConfirmation: 'Sei sicuro di voler eliminare questo account?',
        deleteCard: 'Elimina carta',
        deleteCardConfirmation:
            'Tutte le transazioni con carta non inviate, comprese quelle nei report aperti, verranno rimosse. Sei sicuro di voler eliminare questa carta? Non puoi annullare questa azione.',
        error: {
            notOwnerOfBankAccount: 'Si è verificato un errore durante l’impostazione di questo conto bancario come metodo di pagamento predefinito',
            invalidBankAccount: 'Questo conto bancario è temporaneamente sospeso',
            notOwnerOfFund: 'Si è verificato un errore durante l’impostazione di questa carta come metodo di pagamento predefinito',
            setDefaultFailure: 'Si è verificato un problema. Chatta con Concierge per ulteriore assistenza.',
        },
        addBankAccountFailure: 'Si è verificato un errore imprevisto durante il tentativo di aggiungere il tuo conto bancario. Riprova.',
        getPaidFaster: 'Ricevi i pagamenti più rapidamente',
        addPaymentMethod: 'Aggiungi un metodo di pagamento per inviare e ricevere pagamenti direttamente nell’app.',
        getPaidBackFaster: 'Ricevi i rimborsi più velocemente',
        secureAccessToYourMoney: 'Accesso sicuro al tuo denaro',
        receiveMoney: 'Ricevi denaro nella tua valuta locale',
        expensifyWallet: 'Portafoglio Expensify (Beta)',
        sendAndReceiveMoney: 'Invia e ricevi denaro con gli amici. Solo conti bancari USA.',
        enableWallet: 'Abilita wallet',
        addBankAccountToSendAndReceive: 'Aggiungi un conto bancario per effettuare o ricevere pagamenti.',
        addDebitOrCreditCard: 'Aggiungi carta di debito o di credito',
        assignedCards: 'Carte assegnate',
        assignedCardsDescription: 'Le transazioni da queste carte si sincronizzano automaticamente.',
        expensifyCard: 'Carta Expensify',
        walletActivationPending: 'Stiamo verificando le tue informazioni. Riprova tra qualche minuto!',
        walletActivationFailed: 'Purtroppo il tuo portafoglio non può essere abilitato in questo momento. Chatta con Concierge per ulteriore assistenza.',
        addYourBankAccount: 'Aggiungi il tuo conto bancario',
        addBankAccountBody: 'Colleghiamo il tuo conto bancario a Expensify così sarà più facile che mai inviare e ricevere pagamenti direttamente nell’app.',
        chooseYourBankAccount: 'Scegli il tuo conto bancario',
        chooseAccountBody: 'Assicurati di selezionare quello giusto.',
        confirmYourBankAccount: 'Conferma il tuo conto bancario',
        personalBankAccounts: 'Conti bancari personali',
        businessBankAccounts: 'Conti bancari aziendali',
        shareBankAccount: 'Condividi conto bancario',
        bankAccountShared: 'Conto bancario condiviso',
        shareBankAccountTitle: 'Seleziona gli amministratori con cui condividere questo conto bancario:',
        shareBankAccountSuccess: 'Conto bancario condiviso!',
        shareBankAccountSuccessDescription: 'Gli amministratori selezionati riceveranno un messaggio di conferma da Concierge.',
        shareBankAccountFailure: 'Si è verificato un errore imprevisto durante il tentativo di condividere il conto bancario. Riprova.',
        shareBankAccountEmptyTitle: 'Nessun amministratore disponibile',
        shareBankAccountEmptyDescription: 'Non ci sono amministratori dello spazio di lavoro con cui puoi condividere questo conto bancario.',
        shareBankAccountNoAdminsSelected: 'Seleziona un amministratore prima di continuare',
        unshareBankAccount: 'Rimuovi condivisione conto bancario',
        unshareBankAccountDescription:
            'Tutte le persone indicate di seguito hanno accesso a questo conto bancario. Puoi revocare l’accesso in qualsiasi momento. Completeremo comunque tutti i pagamenti in corso.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} perderà l’accesso a questo conto bancario aziendale. Completeremo comunque tutti i pagamenti in corso.`,
        reachOutForHelp: 'È in uso con la Carta Expensify. <concierge-link>Contatta Concierge</concierge-link> se devi interrompere la condivisione.',
        unshareErrorModalTitle: 'Impossibile annullare la condivisione del conto bancario',
    },
    cardPage: {
        expensifyCard: 'Carta Expensify',
        expensifyTravelCard: 'Carta Viaggi Expensify',
        availableSpend: 'Limite rimanente',
        smartLimit: {
            name: 'Limite intelligente',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Puoi spendere fino a ${formattedLimit} con questa carta e il limite si azzererà man mano che le tue spese inviate vengono approvate.`,
        },
        fixedLimit: {
            name: 'Limite fisso',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Puoi spendere fino a ${formattedLimit} con questa carta, dopodiché verrà disattivata.`,
        },
        monthlyLimit: {
            name: 'Limite mensile',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Puoi spendere fino a ${formattedLimit} con questa carta al mese. Il limite verrà reimpostato il primo giorno di ogni mese di calendario.`,
        },
        virtualCardNumber: 'Numero della carta virtuale',
        travelCardCvv: 'CVV della carta di viaggio',
        physicalCardNumber: 'Numero carta fisica',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Richiedi carta fisica',
        reportFraud: 'Segnala frode con carta virtuale',
        reportTravelFraud: 'Segnala una frode sulla carta di viaggio',
        reviewTransaction: 'Verifica transazione',
        suspiciousBannerTitle: 'Transazione sospetta',
        suspiciousBannerDescription: 'Abbiamo notato transazioni sospette sulla tua carta. Tocca qui sotto per controllare.',
        cardLocked: 'La tua carta è temporaneamente bloccata mentre il nostro team esamina l’account della tua azienda.',
        markTransactionsAsReimbursable: 'Contrassegna le transazioni come rimborsabili',
        markTransactionsDescription: 'Quando è abilitata, le transazioni importate da questa carta sono contrassegnate come rimborsabili per impostazione predefinita.',
        csvCardDescription: 'Importazione CSV',
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
        validateCardTitle: 'Verifichiamo che sia davvero tu',
        enterMagicCode: (contactMethod: string) =>
            `Inserisci il codice magico inviato a ${contactMethod} per visualizzare i dettagli della tua carta. Dovrebbe arrivare entro uno o due minuti.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Per favore <a href="${missingDetailsLink}">aggiungi i tuoi dati personali</a>, poi riprova.`,
        unexpectedError: 'Si è verificato un errore durante il recupero dei dettagli della tua carta Expensify. Per favore riprova.',
        cardFraudAlert: {
            confirmButtonText: 'Sì, lo faccio',
            reportFraudButtonText: 'No, non ero io',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `ha risolto l’attività sospetta e riattivato la carta x${cardLastFour}. Tutto pronto per continuare a registrare le spese!`,
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
            }) => `attività sospetta rilevata sulla carta che termina con ${cardLastFour}. Riconosci questo addebito?

${amount} per ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Spesa',
        workflowDescription: 'Configura un flusso di lavoro dal momento in cui si verifica la spesa, includendo approvazione e pagamento.',
        submissionFrequency: 'Invii',
        submissionFrequencyDescription: 'Scegli una pianificazione personalizzata per l’invio delle spese.',
        submissionFrequencyDateOfMonth: 'Giorno del mese',
        disableApprovalPromptDescription: 'La disattivazione delle approvazioni eliminerà tutti i flussi di lavoro di approvazione esistenti.',
        addApprovalsTitle: 'Approvazioni',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `spese da ${members} e l'approvatore è ${approvers}`,
        addApprovalButton: 'Aggiungi workflow di approvazione',
        addApprovalTip: 'Questo workflow predefinito si applica a tutti i membri, a meno che non esista un workflow più specifico.',
        approver: 'Approvante',
        addApprovalsDescription: 'Richiedi un’approvazione aggiuntiva prima di autorizzare un pagamento.',
        makeOrTrackPaymentsTitle: 'Pagamenti',
        makeOrTrackPaymentsDescription: 'Aggiungi un pagatore autorizzato per i pagamenti effettuati in Expensify o traccia i pagamenti effettuati altrove.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>In questo workspace è attivato un flusso di approvazione personalizzato. Per rivedere o modificare questo flusso, contatta il tuo <account-manager-link>Account Manager</account-manager-link> o <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>In questo spazio di lavoro è attivato un flusso di approvazione personalizzato. Per rivedere o modificare questo flusso di lavoro, contatta <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Scegli per quanto tempo Expensify deve attendere prima di condividere le spese senza errori.',
        },
        frequencyDescription: 'Scegli con quale frequenza desideri inviare automaticamente le spese oppure imposta l’invio manuale',
        frequencies: {
            instant: 'Immediatamente',
            weekly: 'Settimanale',
            monthly: 'Mensile',
            twiceAMonth: 'Due volte al mese',
            byTrip: 'Per viaggio',
            manually: 'Manuale',
            daily: 'Quotidiana',
            lastDayOfMonth: 'Ultimo giorno del mese',
            lastBusinessDayOfMonth: 'Ultimo giorno lavorativo del mese',
            ordinals: {
                one: 'esimo',
                two: 'nd',
                few: 'gggg',
                other: 'gio',
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
        approverInMultipleWorkflows: 'Questo membro appartiene già a un altro flusso di approvazione. Qualsiasi aggiornamento qui si rifletterà anche lì.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> approva già i report di <strong>${name2}</strong>. Scegli un approvatore diverso per evitare un flusso di lavoro circolare.`,
        emptyContent: {
            title: 'Nessun membro da visualizzare',
            expensesFromSubtitle: 'Tutti i membri dello spazio di lavoro appartengono già a un flusso di approvazione esistente.',
            approverSubtitle: 'Tutti gli approvatori appartengono a un flusso di lavoro esistente.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'La frequenza di invio non può essere modificata. Riprova o contatta l’assistenza.',
        monthlyOffsetErrorMessage: 'Impossibile modificare la frequenza mensile. Riprova o contatta l’assistenza.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Conferma',
        header: 'Aggiungi altri approvatori e conferma.',
        additionalApprover: 'Approvazione aggiuntiva',
        submitButton: 'Aggiungi workflow',
    },
    workflowsEditApprovalsPage: {
        title: 'Modifica flusso di approvazione',
        deleteTitle: 'Elimina flusso di approvazione',
        deletePrompt: 'Sei sicuro di voler eliminare questo flusso di approvazione? Tutti i membri seguiranno successivamente il flusso predefinito.',
    },
    workflowsExpensesFromPage: {
        title: 'Spese da',
        header: 'Quando i seguenti membri inviano note spese:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "Impossibile modificare l'approvatore. Riprova o contatta l'assistenza.",
        title: 'Imposta approvatore',
        description: 'Questa persona approverà le spese.',
    },
    workflowsApprovalLimitPage: {
        title: 'Approvante',
        header: '(Facoltativo) Vuoi aggiungere un limite di approvazione?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Aggiungi un altro approvatore quando <strong>${approverName}</strong> è l’approvatore e il resoconto supera l’importo seguente:`
                : 'Aggiungi un altro approvatore quando un report supera l’importo seguente:',
        reportAmountLabel: 'Importo del report',
        additionalApproverLabel: 'Approvazione aggiuntiva',
        skip: 'Salta',
        next: 'Avanti',
        removeLimit: 'Rimuovi limite',
        enterAmountError: 'Inserisci un importo valido',
        enterApproverError: 'È necessario un approvatore quando imposti un limite del report',
        enterBothError: 'Inserisci un importo del report e un approvatore aggiuntivo',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) =>
            `I report superiori a ${approvalLimit} vengono inoltrati a ${approverName}`,
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
            'Se i dati della tua carta virtuale sono stati rubati o compromessi, disattiveremo definitivamente la carta esistente e ti forniremo una nuova carta virtuale con un nuovo numero.',
        deactivateCard: 'Disattiva carta',
        reportVirtualCardFraud: 'Segnala frode con carta virtuale',
    },
    reportFraudConfirmationPage: {
        title: 'Frode con carta segnalata',
        description: 'Abbiamo disattivato definitivamente la tua carta esistente. Quando tornerai a visualizzare i dettagli della carta, avrai a disposizione una nuova carta virtuale.',
        buttonText: 'Ricevuto, grazie!',
    },
    activateCardPage: {
        activateCard: 'Attiva carta',
        pleaseEnterLastFour: 'Inserisci le ultime quattro cifre della tua carta.',
        activatePhysicalCard: 'Attiva carta fisica',
        error: {
            thatDidNotMatch: 'Quello non corrispondeva alle ultime 4 cifre della tua carta. Riprova.',
            throttled:
                'Hai inserito troppe volte in modo errato le ultime 4 cifre della tua Expensify Card. Se sei sicuro che i numeri siano corretti, contatta Concierge per risolvere il problema. Altrimenti, riprova più tardi.',
        },
    },
    getPhysicalCard: {
        header: 'Richiedi carta fisica',
        nameMessage: 'Inserisci il tuo nome e cognome, poiché verranno mostrati sulla tua carta.',
        legalName: 'Nome legale',
        legalFirstName: 'Nome legale di battesimo',
        legalLastName: 'Cognome legale',
        phoneMessage: 'Inserisci il tuo numero di telefono.',
        phoneNumber: 'Numero di telefono',
        address: 'Indirizzo',
        addressMessage: 'Inserisci il tuo indirizzo di spedizione.',
        streetAddress: 'Indirizzo (via)',
        city: 'Città',
        state: 'Stato',
        zipPostcode: 'CAP/Codice postale',
        country: 'Paese',
        confirmMessage: 'Conferma i tuoi dati qui sotto.',
        estimatedDeliveryMessage: 'La tua carta fisica arriverà in 2-3 giorni lavorativi.',
        next: 'Avanti',
        getPhysicalCard: 'Richiedi carta fisica',
        shipCard: 'Spedisci carta',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Trasferisci${amount ? ` ${amount}` : ''}`,
        instant: 'Immediato (carta di debito)',
        instantSummary: (rate: string, minAmount: string) => `Commissione del ${rate}% (${minAmount} minimo)`,
        ach: '1-3 giorni lavorativi (Conto bancario)',
        achSummary: 'Nessuna commissione',
        whichAccount: 'Quale conto?',
        fee: 'Commissione',
        transferSuccess: 'Trasferimento riuscito!',
        transferDetailBankAccount: 'Il tuo denaro dovrebbe arrivare entro 1-3 giorni lavorativi.',
        transferDetailDebitCard: 'Il tuo denaro dovrebbe arrivare immediatamente.',
        failedTransfer: 'Il tuo saldo non è interamente saldato. Effettua un trasferimento su un conto bancario.',
        notHereSubTitle: 'Trasferisci il tuo saldo dalla pagina del portafoglio',
        goToWallet: 'Vai a Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Scegli account',
    },
    paymentMethodList: {
        addPaymentMethod: 'Aggiungi metodo di pagamento',
        addNewDebitCard: 'Aggiungi nuova carta di debito',
        addNewBankAccount: 'Aggiungi nuovo conto bancario',
        accountLastFour: 'Terminante con',
        cardLastFour: 'Carta che termina con',
        addFirstPaymentMethod: 'Aggiungi un metodo di pagamento per inviare e ricevere pagamenti direttamente nell’app.',
        defaultPaymentMethod: 'Predefinito',
        bankAccountLastFour: (lastFour: string) => `Conto bancario • ${lastFour}`,
    },
    expenseRulesPage: {
        title: 'Regole spese',
        subtitle: 'Queste regole verranno applicate alle tue spese. Se le invii a uno spazio di lavoro, le regole di quello spazio di lavoro potrebbero sostituirle.',
        findRule: 'Trova regola',
        emptyRules: {
            title: 'Non hai creato alcuna regola',
            subtitle: 'Aggiungi una regola per automatizzare la rendicontazione delle spese.',
        },
        changes: {
            billableUpdate: (value: boolean) => `Aggiorna la spesa ${value ? 'fatturabile' : 'non fatturabile'}`,
            categoryUpdate: (value: string) => `Aggiorna la categoria in "${value}"`,
            commentUpdate: (value: string) => `Aggiorna la descrizione in "${value}"`,
            merchantUpdate: (value: string) => `Aggiorna esercente in "${value}"`,
            reimbursableUpdate: (value: boolean) => `Aggiorna spesa ${value ? 'rimborsabile' : 'non rimborsabile'}`,
            tagUpdate: (value: string) => `Aggiorna il tag a "${value}"`,
            taxUpdate: (value: string) => `Aggiorna l’aliquota fiscale a "${value}"`,
            billable: (value: boolean) => `spesa ${value ? 'fatturabile' : 'non fatturabile'}`,
            category: (value: string) => `categoria in "${value}"`,
            comment: (value: string) => `descrizione in "${value}"`,
            merchant: (value: string) => `esercente in "${value}"`,
            reimbursable: (value: boolean) => `spesa ${value ? 'rimborsabile' : 'non rimborsabile'}`,
            tag: (value: string) => `tagga come "${value}"`,
            tax: (value: string) => `aliquota fiscale a "${value}"`,
            report: (value: string) => `aggiungi a un report chiamato "${value}"`,
        },
        newRule: 'Nuova regola',
        addRule: {
            title: 'Aggiungi regola',
            expenseContains: 'Se la spesa contiene:',
            applyUpdates: 'Poi applica questi aggiornamenti:',
            merchantHint: 'Digita . per creare una regola che si applica a tutti gli esercenti',
            addToReport: 'Aggiungi a un report chiamato',
            createReport: 'Crea report se necessario',
            applyToExistingExpenses: 'Applica alle note spese corrispondenti esistenti',
            confirmError: 'Inserisci l’esercente e applica almeno un aggiornamento',
            confirmErrorMerchant: 'Inserisci commerciante',
            confirmErrorUpdate: 'Applica almeno un aggiornamento',
            saveRule: 'Salva regola',
        },
        editRule: {
            title: 'Modifica regola',
        },
        deleteRule: {
            deleteSingle: 'Elimina regola',
            deleteMultiple: 'Elimina regole',
            deleteSinglePrompt: 'Sei sicuro di voler eliminare questa regola?',
            deleteMultiplePrompt: 'Sei sicuro di voler eliminare queste regole?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'Preferenze app',
        },
        testSection: {
            title: 'Preferenze di test',
            subtitle: 'Impostazioni per aiutare a eseguire il debug e testare l’app in staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Ricevi aggiornamenti rilevanti sulle funzionalità e notizie su Expensify',
        muteAllSounds: 'Disattiva tutti i suoni di Expensify',
    },
    priorityModePage: {
        priorityMode: 'Modalità prioritaria',
        explainerText: 'Scegli se #concentrarti solo sulle chat non lette e fissate, oppure mostrare tutto con le chat più recenti e fissate in alto.',
        priorityModes: {
            default: {
                label: 'Più recenti',
                description: 'Mostra tutte le chat ordinate per le più recenti',
            },
            gsd: {
                label: '#focus',
                description: 'Mostra solo i non letti in ordine alfabetico',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'Genera PDF',
        waitForPDF: 'Attendi mentre generiamo il PDF.',
        errorPDF: 'Si è verificato un errore durante il tentativo di generare il tuo PDF',
        successPDF: 'Il tuo PDF è stato generato! Se non è stato scaricato automaticamente, usa il pulsante qui sotto.',
    },
    reportDescriptionPage: {
        roomDescription: 'Descrizione della stanza',
        roomDescriptionOptional: 'Descrizione della stanza (facoltativa)',
        explainerText: 'Imposta una descrizione personalizzata per la stanza.',
    },
    groupChat: {
        lastMemberTitle: 'Attenzione!',
        lastMemberWarning: 'Poiché sei l’ultima persona qui, se te ne vai questa chat diventerà inaccessibile a tutti i membri. Vuoi davvero uscire?',
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
                label: 'Usa impostazioni dispositivo',
            },
        },
        chooseThemeBelowOrSync: 'Scegli un tema qui sotto oppure sincronizza con le impostazioni del dispositivo.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Accedendo, accetti i <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Termini di servizio</a> e l'<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Informativa sulla privacy</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Il servizio di trasferimento di denaro è fornito da ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) in base alle sue <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenze</a>.</muted-text-xs>`,
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
            incorrectMagicCode: 'Codice magico errato o non valido. Riprova oppure richiedi un nuovo codice.',
            pleaseFillTwoFactorAuth: 'Inserisci il tuo codice di autenticazione a due fattori',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Compila tutti i campi',
        pleaseFillPassword: 'Inserisci la tua password',
        pleaseFillTwoFactorAuth: 'Inserisci il tuo codice di verifica in due passaggi',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Inserisci il tuo codice di autenticazione a due fattori per continuare',
        forgot: 'Password dimenticata?',
        requiredWhen2FAEnabled: 'Obbligatorio quando l’autenticazione a due fattori è abilitata',
        error: {
            incorrectPassword: 'Password errata. Riprova.',
            incorrectLoginOrPassword: 'Accesso o password non corretti. Riprova.',
            incorrect2fa: 'Codice di autenticazione a due fattori non corretto. Riprova.',
            twoFactorAuthenticationEnabled: "Hai attivato l'autenticazione a due fattori (2FA) su questo account. Accedi utilizzando la tua email o il tuo numero di telefono.",
            invalidLoginOrPassword: 'Accesso o password non validi. Riprova o reimposta la password.',
            unableToResetPassword:
                'Non siamo riusciti a cambiare la tua password. Probabilmente il link per reimpostare la password presente in una vecchia email è scaduto. Ti abbiamo inviato un nuovo link così puoi riprovare. Controlla la tua posta in arrivo e la cartella Spam; dovrebbe arrivare tra pochi minuti.',
            noAccess: 'Non hai accesso a questa applicazione. Aggiungi il tuo nome utente GitHub per ottenere l’accesso.',
            accountLocked: 'Il tuo account è stato bloccato dopo troppi tentativi non riusciti. Riprova tra 1 ora.',
            fallback: 'Si è verificato un errore. Riprova più tardi.',
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
            description: 'Un’unica app per gestire le tue spese aziendali e personali alla velocità di una chat. Provala e facci sapere cosa ne pensi. E questo è solo l’inizio!',
            secondaryDescription: 'Per tornare a Expensify Classic, tocca l’immagine del tuo profilo > Vai a Expensify Classic.',
        },
        getStarted: 'Inizia',
        whatsYourName: 'Come ti chiami?',
        peopleYouMayKnow: 'Persone che potresti conoscere sono già qui! Verifica la tua email per unirti a loro.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Qualcuno di ${domain} ha già creato uno spazio di lavoro. Inserisci il codice magico inviato a ${email}.`,
        joinAWorkspace: 'Unisciti a uno spazio di lavoro',
        listOfWorkspaces: "Ecco l'elenco degli spazi di lavoro a cui puoi unirti. Non preoccuparti, potrai sempre unirti anche in un secondo momento se preferisci.",
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membro${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Dove lavori?',
        errorSelection: 'Seleziona un’opzione per procedere',
        purpose: {
            title: 'Cosa vuoi fare oggi?',
            errorContinue: 'Premi Continua per completare la configurazione',
            errorBackButton: "Completa le domande di configurazione per iniziare a usare l'app",
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Ricevire il rimborso dal mio datore di lavoro',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gestisci le spese del mio team',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Monitora e pianifica le spese',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatta e dividi le spese con gli amici',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Altro',
        },
        employees: {
            title: 'Quanti dipendenti hai?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: 'Da 101 a 1.000 dipendenti',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Più di 1.000 dipendenti',
        },
        accounting: {
            title: 'Usi un software di contabilità?',
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
                descriptionTwo: 'Unisciti ai tuoi colleghi che già usano Expensify',
                descriptionThree: "Goditi un'esperienza più personalizzata",
            },
            addWorkEmail: 'Aggiungi email di lavoro',
        },
        workEmailValidation: {
            title: 'Verifica la tua email di lavoro',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Inserisci il codice magico inviato a ${workEmail}. Dovrebbe arrivare tra uno o due minuti.`,
        },
        workEmailValidationError: {
            publicEmail: 'Inserisci un’email di lavoro valida con un dominio privato, ad es. mitch@company.com',
            offline: 'Non è stato possibile aggiungere la tua email di lavoro perché sembri offline',
        },
        mergeBlockScreen: {
            title: 'Impossibile aggiungere l’email di lavoro',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Non è stato possibile aggiungere ${workEmail}. Riprova più tardi in Impostazioni oppure chiedi assistenza a Concierge per indicazioni.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Fai un [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[Fai un breve tour del prodotto](${testDriveURL}) per scoprire perché Expensify è il modo più veloce per gestire le tue spese.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Fai un [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `Fai un [test drive](${testDriveURL}) con noi e ottieni per il tuo team *3 mesi gratuiti di Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Aggiungi approvazioni spese',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Aggiungi le approvazioni spese* per rivedere le spese del tuo team e tenerle sotto controllo.

                        Ecco come fare:

                        1. Vai su *Spazi di lavoro*.
                        2. Seleziona il tuo spazio di lavoro.
                        3. Fai clic su *Altre funzionalità*.
                        4. Attiva *Flussi di lavoro*.
                        5. Vai a *Flussi di lavoro* nell’editor dello spazio di lavoro.
                        6. Attiva *Approvazioni*.
                        7. Verrai impostato come approvatore delle spese. Potrai cambiarlo in qualsiasi amministratore dopo aver invitato il tuo team.

                        [Portami alle altre funzionalità](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Crea](${workspaceConfirmationLink}) uno spazio di lavoro`,
                description: 'Crea uno spazio di lavoro e configura le impostazioni con l’aiuto del tuo specialista di configurazione!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Crea uno [spazio di lavoro](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Crea uno spazio di lavoro* per tenere traccia delle spese, scannerizzare le ricevute, chattare e altro ancora.

                        1. Fai clic su *Spazi di lavoro* > *Nuovo spazio di lavoro*.

                        *Il tuo nuovo spazio di lavoro è pronto!* [Dagli un'occhiata](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Configura le [categorie](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Configura le categorie* così il tuo team può codificare le spese per report facili da leggere.

                        1. Fai clic su *Spazi di lavoro*.
                        2. Seleziona il tuo spazio di lavoro.
                        3. Fai clic su *Categorie*.
                        4. Disattiva le categorie di cui non hai bisogno.
                        5. Aggiungi le tue categorie in alto a destra.

                        [Portami alle impostazioni delle categorie dello spazio di lavoro](${workspaceCategoriesLink}).

                        ![Configura le categorie](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Invia una spesa',
                description: dedent(`
                    *Invia una spesa* inserendo un importo o scansionando una ricevuta.

                    1. Fai clic sul pulsante ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Scegli *Crea spesa*.
                    3. Inserisci un importo o scansiona una ricevuta.
                    4. Aggiungi l’email o il numero di telefono del tuo responsabile.
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
                title: 'Tieni traccia di una spesa',
                description: dedent(`
                    *Traccia una spesa* in qualsiasi valuta, che tu abbia una ricevuta o meno.

                    1. Fai clic sul pulsante ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Scegli *Crea spesa*.
                    3. Inserisci un importo o scansiona una ricevuta.
                    4. Scegli il tuo spazio *personale*.
                    5. Fai clic su *Crea*.

                    E hai finito! Sì, è davvero così semplice.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Connetti${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'a'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'il tuo' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Collega ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'il tuo' : 'a'} ${integrationName} per la codifica automatica delle spese e la sincronizzazione che rendono la chiusura di fine mese semplicissima.

                        1. Fai clic su *Spazi di lavoro*.
                        2. Seleziona il tuo spazio di lavoro.
                        3. Fai clic su *Contabilità*.
                        4. Trova ${integrationName}.
                        5. Fai clic su *Collega*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Portami alla contabilità](${workspaceAccountingLink}).

                        ![Connetti a ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Portami alla contabilità](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Collega [le tue carte aziendali](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Collega le carte che hai già per importare automaticamente le transazioni, abbinare le ricevute e riconciliare i movimenti.

                        1. Fai clic su *Spazi di lavoro*.
                        2. Seleziona il tuo spazio di lavoro.
                        3. Fai clic su *Carte aziendali*.
                        4. Segui le istruzioni per collegare le tue carte.

                        [Portami alle carte aziendali](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Invita [il tuo team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invita il tuo team* su Expensify così potrà iniziare a tenere traccia delle spese oggi stesso.

                        1. Fai clic su *Spazi di lavoro*.
                        2. Seleziona il tuo spazio di lavoro.
                        3. Fai clic su *Membri* > *Invita membro*.
                        4. Inserisci email o numeri di telefono.
                        5. Aggiungi un messaggio di invito personalizzato, se vuoi!

                        [Portami ai membri dello spazio di lavoro](${workspaceMembersLink}).

                        ![Invita il tuo team](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Configura [categorie](${workspaceCategoriesLink}) e [etichette](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Imposta categorie ed etichette* in modo che il tuo team possa codificare le spese per una rendicontazione semplice.

                        Importale automaticamente [collegando il tuo software di contabilità](${workspaceAccountingLink}) oppure impostale manualmente nelle [impostazioni dello spazio di lavoro](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Configura le [etichette](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Usa i tag per aggiungere ulteriori dettagli sulle spese, come progetti, clienti, sedi e reparti. Se hai bisogno di più livelli di tag, puoi eseguire l’upgrade al piano Control.

                        1. Fai clic su *Spazi di lavoro*.
                        2. Seleziona il tuo spazio di lavoro.
                        3. Fai clic su *Altre funzionalità*.
                        4. Attiva *Tag*.
                        5. Vai a *Tag* nell’editor dello spazio di lavoro.
                        6. Fai clic su *+ Aggiungi tag* per crearne di tuoi.

                        [Portami alle altre funzionalità](${workspaceMoreFeaturesLink}).

                        ![Configura i tag](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Invita il tuo/la tua [commercialista](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invita il tuo commercialista* a collaborare nel tuo spazio di lavoro e a gestire le spese della tua attività.

                        1. Fai clic su *Spazi di lavoro*.
                        2. Seleziona il tuo spazio di lavoro.
                        3. Fai clic su *Membri*.
                        4. Fai clic su *Invita membro*.
                        5. Inserisci l'indirizzo email del tuo commercialista.

                        [Invita il tuo commercialista ora](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Avvia una chat',
                description: dedent(`
                    *Avvia una chat* con chiunque utilizzando il suo indirizzo email o numero di telefono.

                    1. Fai clic sul pulsante ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Scegli *Avvia chat*.
                    3. Inserisci un indirizzo email o un numero di telefono.

                    Se non stanno già usando Expensify, verranno invitati automaticamente.

                    Ogni chat verrà anche inviata come email o SMS a cui potranno rispondere direttamente.
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

                    Se vuoi, puoi aggiungere altri dettagli oppure inviarla subito. Così verrai rimborsato in un attimo!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Controlla le impostazioni del tuo [spazio di lavoro](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Ecco come rivedere e aggiornare le impostazioni del tuo workspace:
                        1. Clicca su Workspace.
                        2. Seleziona il tuo workspace.
                        3. Rivedi e aggiorna le impostazioni.
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

                    Hai finito!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Fai un [test drive](${testDriveURL})` : 'Fai un giro di prova'),
            embeddedDemoIframeTitle: 'Prova su strada',
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
                        # La tua prova gratuita è iniziata! Configuriamo il tuo account.
                        👋 Ciao, sono il tuo specialista di configurazione Expensify. Ho già creato uno spazio di lavoro per aiutarti a gestire le ricevute e le spese del tuo team. Per sfruttare al massimo la tua prova gratuita di 30 giorni, segui i passaggi di configurazione rimanenti qui sotto!
                    `)
                    : dedent(`
                        # La tua prova gratuita è iniziata! Configuriamo il tuo account.
                        👋 Ciao, sono il tuo specialista di configurazione Expensify. Ora che hai creato uno spazio di lavoro, sfrutta al massimo i tuoi 30 giorni di prova gratuita seguendo i passaggi qui sotto!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Configuriamo il tuo account\n👋 Ciao, sono il tuo specialista per la configurazione di Expensify. Ho già creato un workspace per aiutarti a gestire ricevute e spese. Per sfruttare al meglio la tua prova gratuita di 30 giorni, segui i passaggi di configurazione rimanenti qui sotto!',
            onboardingChatSplitMessage: 'Dividere le spese con gli amici è facile come inviare un messaggio. Ecco come.',
            onboardingAdminMessage: 'Scopri come gestire l’area di lavoro del tuo team come amministratore e inviare le tue spese.',
            onboardingLookingAroundMessage:
                'Expensify è conosciuta soprattutto per la gestione di note spese, viaggi e carte aziendali, ma fa molto di più. Dimmi cosa ti interessa e ti aiuterò a iniziare.',
            onboardingTestDriveReceiverMessage: '*Hai 3 mesi gratis! Inizia qui sotto.*',
        },
        workspace: {
            title: 'Resta organizzato con uno spazio di lavoro',
            subtitle: 'Sblocca potenti strumenti per semplificare la gestione delle tue spese, tutto in un unico posto. Con uno spazio di lavoro, puoi:',
            explanationModal: {
                descriptionOne: 'Tieni traccia e organizza le ricevute',
                descriptionTwo: 'Classifica e etichetta le spese',
                descriptionThree: 'Crea e condividi report',
            },
            price: 'Provalo gratis per 30 giorni, poi passa al piano superiore per soli <strong>$5/utente/mese</strong>.',
            createWorkspace: 'Crea spazio di lavoro',
        },
        confirmWorkspace: {
            title: 'Conferma spazio di lavoro',
            subtitle: 'Crea uno spazio di lavoro per tenere traccia delle ricevute, rimborsare le spese, gestire i viaggi, creare report e molto altro, tutto alla velocità della chat.',
        },
        inviteMembers: {
            title: 'Invita membri',
            subtitle: 'Aggiungi il tuo team o invita il tuo commercialista. Più siamo, meglio è!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Non mostrarlo più',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'Il nome non può contenere caratteri speciali',
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
        personalDetails: 'Dati personali',
        privateDataMessage: 'Questi dati vengono utilizzati per viaggi e pagamenti. Non vengono mai mostrati sul tuo profilo pubblico.',
        legalName: 'Nome legale',
        legalFirstName: 'Nome legale di battesimo',
        legalLastName: 'Cognome legale',
        address: 'Indirizzo',
        error: {
            dateShouldBeBefore: (dateString: string) => `La data deve essere precedente a ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `La data deve essere successiva a ${dateString}`,
            hasInvalidCharacter: 'Il nome può includere solo caratteri latini',
            incorrectZipFormat: (zipFormat?: string) => `Formato del CAP non valido${zipFormat ? `Formato accettabile: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Assicurati che il numero di telefono sia valido (ad es. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Il link è stato reinviato',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Ho inviato un link magico di accesso a ${login}. Controlla il tuo ${loginType} per accedere.`,
        resendLink: 'Invia di nuovo il link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Per convalidare ${secondaryLogin}, reinvia il codice magico dalle Impostazioni account di ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Se non hai più accesso a ${primaryLogin}, scollega i tuoi account.`,
        unlink: 'Scollega',
        linkSent: 'Link inviato!',
        successfullyUnlinkedLogin: 'Accesso secondario scollegato correttamente!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Il nostro provider di posta elettronica ha temporaneamente sospeso l’invio di email a ${login} a causa di problemi di recapito. Per sbloccare il tuo accesso, segui questi passaggi:`,
        confirmThat: (login: string) =>
            `<strong>Conferma che ${login} sia scritto correttamente e che sia un indirizzo email reale e recapitabile.</strong> Gli alias email come "expenses@domain.com" devono avere accesso a una propria casella di posta per essere un login Expensify valido.`,
        ensureYourEmailClient: `<strong>Assicurati che il tuo client di posta elettronica consenta le email da expensify.com.</strong> Puoi trovare le istruzioni su come completare questo passaggio <a href="${CONST.SET_NOTIFICATION_LINK}">qui</a>, ma potresti aver bisogno del reparto IT per configurare le impostazioni della tua email.`,
        onceTheAbove: `Una volta completati i passaggi sopra indicati, contatta <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> per sbloccare il tuo accesso.`,
    },
    openAppFailureModal: {
        title: 'Qualcosa è andato storto...',
        subtitle: `Non siamo riusciti a caricare tutti i tuoi dati. Siamo stati informati e stiamo verificando il problema. Se il problema persiste, contatta`,
        refreshAndTryAgain: 'Aggiorna e riprova',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Non siamo riusciti a recapitare i messaggi SMS a ${login}, quindi lo abbiamo sospeso temporaneamente. Prova a convalidare il tuo numero:`,
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
            return `Attendi un attimo! Devi aspettare ${timeText} prima di provare di nuovo a convalidare il tuo numero.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Partecipa',
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
        prompt: (priorityModePageUrl: string) =>
            `Tieni tutto sotto controllo visualizzando solo le chat non lette o quelle che richiedono la tua attenzione. Non preoccuparti, puoi modificare questa impostazione in qualsiasi momento nelle <a href="${priorityModePageUrl}">impostazioni</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'La chat che stai cercando non può essere trovata.',
        getMeOutOfHere: 'Portami fuori di qui',
        iouReportNotFound: 'Impossibile trovare i dettagli di pagamento che stai cercando.',
        notHere: 'Uhm... non è qui',
        pageNotFound: 'Ops, questa pagina non può essere trovata',
        noAccess: 'Questa chat o spesa potrebbe essere stata eliminata oppure non hai accesso.\n\nPer qualsiasi domanda, contatta concierge@expensify.com',
        goBackHome: 'Torna alla home page',
        commentYouLookingForCannotBeFound: 'Il commento che stai cercando non è stato trovato.',
        goToChatInstead: 'Vai invece alla chat.',
        contactConcierge: 'Per qualsiasi domanda, contatta concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ops... ${isBreakLine ? '\n' : ''}Qualcosa è andato storto`,
        subtitle: 'La tua richiesta non può essere completata. Riprova più tardi.',
        wrongTypeSubtitle: 'Questa ricerca non è valida. Prova a modificare i criteri di ricerca.',
    },
    statusPage: {
        status: 'Stato',
        statusExplanation: "Aggiungi un'emoji per dare a colleghi e amici un modo semplice per sapere cosa sta succedendo. Puoi anche aggiungere un messaggio facoltativo!",
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
        vacationDelegate: 'Delegato ferie',
        setVacationDelegate: `Imposta una delega per le ferie per approvare i report per tuo conto mentre sei fuori ufficio.`,
        vacationDelegateError: 'Si è verificato un errore durante l’aggiornamento del tuo delegato per le ferie.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `come delegato/a per le ferie di ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) =>
            `a ${submittedToName} come delegato/a per le vacanze di ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Stai assegnando ${nameOrEmail} come tuo delegato per le ferie. Non fa ancora parte di tutti i tuoi spazi di lavoro. Se scegli di continuare, verrà inviata un’email a tutti gli amministratori dei tuoi spazi di lavoro per aggiungerlo.`,
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
        bankInfo: 'Dati bancari',
        confirmBankInfo: 'Conferma dati bancari',
        manuallyAdd: 'Aggiungi manualmente il tuo conto bancario',
        letsDoubleCheck: 'Controlliamo un attimo che sia tutto corretto.',
        accountEnding: 'Conto che termina con',
        thisBankAccount: 'Questo conto bancario verrà utilizzato per i pagamenti aziendali nel tuo spazio di lavoro',
        accountNumber: 'Numero di conto',
        routingNumber: 'Numero di instradamento',
        chooseAnAccountBelow: 'Scegli un account qui sotto',
        addBankAccount: 'Aggiungi conto bancario',
        chooseAnAccount: 'Scegli un conto',
        connectOnlineWithPlaid: 'Accedi alla tua banca',
        connectManually: 'Connetti manualmente',
        desktopConnection: 'Nota: per connetterti con Chase, Wells Fargo, Capital One o Bank of America, fai clic qui per completare questo processo in un browser.',
        yourDataIsSecure: 'I tuoi dati sono al sicuro',
        toGetStarted: 'Aggiungi un conto bancario per rimborsare le spese, emettere carte Expensify, riscuotere i pagamenti delle fatture e pagare le bollette, tutto da un unico posto.',
        plaidBodyCopy: 'Offri ai tuoi dipendenti un modo più semplice per pagare — e farsi rimborsare — le spese aziendali.',
        checkHelpLine: 'Il tuo numero di instradamento e il numero di conto si trovano sull’assegno del conto.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Per collegare un conto bancario, <a href="${contactMethodRoute}">aggiungi un’email come login principale</a> e riprova. Puoi aggiungere il tuo numero di telefono come login secondario.`,
        hasBeenThrottledError: 'Si è verificato un errore durante l’aggiunta del tuo conto bancario. Attendi qualche minuto e riprova.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ops! Sembra che la valuta del tuo workspace sia impostata su una valuta diversa da USD. Per continuare, vai alle <a href="${workspaceRoute}">impostazioni del tuo workspace</a>, imposta la valuta su USD e riprova.`,
        bbaAdded: 'Conto bancario aziendale aggiunto!',
        bbaAddedDescription: 'È pronto per essere utilizzato per i pagamenti.',
        error: {
            youNeedToSelectAnOption: "Seleziona un'opzione per procedere",
            noBankAccountAvailable: 'Spiacenti, non è disponibile alcun conto bancario',
            noBankAccountSelected: 'Scegli un conto per favore',
            taxID: 'Inserisci un numero di partita IVA valido',
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
            industryCode: 'Inserisci un codice di classificazione del settore valido con sei cifre',
            restrictedBusiness: 'Conferma che l’azienda non sia nell’elenco delle attività soggette a restrizioni',
            routingNumber: 'Inserisci un numero di instradamento valido',
            accountNumber: 'Inserisci un numero di conto valido',
            routingAndAccountNumberCannotBeSame: 'I numeri di routing e di conto non possono coincidere',
            companyType: 'Seleziona un tipo di azienda valido',
            tooManyAttempts: 'A causa dell’elevato numero di tentativi di accesso, questa opzione è stata disattivata per 24 ore. Riprova più tardi oppure inserisci i dati manualmente.',
            address: 'Inserisci un indirizzo valido',
            dob: 'Seleziona una data di nascita valida',
            age: 'Devi avere più di 18 anni',
            ssnLast4: 'Inserisci le ultime 4 cifre valide del SSN',
            firstName: 'Inserisci un nome di battesimo valido',
            lastName: 'Inserisci un cognome valido',
            noDefaultDepositAccountOrDebitCardAvailable: 'Aggiungi un conto di deposito predefinito o una carta di debito',
            validationAmounts: 'Gli importi di convalida inseriti non sono corretti. Controlla di nuovo il tuo estratto conto bancario e riprova.',
            fullName: 'Inserisci un nome completo valido',
            ownershipPercentage: 'Inserisci un numero percentuale valido',
            deletePaymentBankAccount:
                'Questo conto bancario non può essere eliminato perché viene utilizzato per i pagamenti della Expensify Card. Se desideri comunque eliminare questo conto, contatta Concierge.',
            sameDepositAndWithdrawalAccount: 'I conti di deposito e di prelievo sono gli stessi.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Dove si trova il tuo conto bancario?',
        accountDetailsStepHeader: 'Quali sono i dettagli del tuo account?',
        accountTypeStepHeader: 'Che tipo di conto è questo?',
        bankInformationStepHeader: 'Quali sono i dati del tuo conto bancario?',
        accountHolderInformationStepHeader: 'Quali sono i dati dell’intestatario del conto?',
        howDoWeProtectYourData: 'Come proteggiamo i tuoi dati?',
        currencyHeader: 'Qual è la valuta del tuo conto bancario?',
        confirmationStepHeader: 'Controlla le tue informazioni.',
        confirmationStepSubHeader: 'Ricontrolla i dettagli qui sotto e seleziona la casella dei termini per confermare.',
        toGetStarted: 'Aggiungi un conto bancario personale per ricevere rimborsi, pagare fatture o abilitare il Portafoglio Expensify.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Inserisci la password di Expensify',
        alreadyAdded: 'Questo conto è già stato aggiunto.',
        chooseAccountLabel: 'Account',
        successTitle: 'Conto bancario personale aggiunto!',
        successMessage: 'Complimenti, il tuo conto bancario è configurato ed è pronto a ricevere rimborsi.',
    },
    attachmentView: {
        unknownFilename: 'Nome file sconosciuto',
        passwordRequired: 'Inserisci una password',
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
        errorMessageInvalidPhone: `Inserisci un numero di telefono valido senza parentesi né trattini. Se ti trovi fuori dagli Stati Uniti, includi il prefisso internazionale del tuo Paese (ad es. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Email non valida',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} è già membro di ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} è già un amministratore di ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Continuando con la richiesta di attivazione del tuo Expensify Wallet, confermi di aver letto, compreso e accettato',
        facialScan: 'Informativa e liberatoria per la scansione facciale di Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Informativa e liberatoria di Onfido per la scansione del volto</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Informativa sulla privacy</a> e <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Termini di servizio</a>.</muted-text-micro>`,
        tryAgain: 'Riprova',
        verifyIdentity: 'Verifica identità',
        letsVerifyIdentity: 'Verifichiamo la tua identità',
        butFirst: `Ma prima, le cose noiose. Leggi il legalese nel prossimo passaggio e fai clic su "Accetta" quando sei pronto.`,
        genericError: "Si è verificato un errore durante l'elaborazione di questo passaggio. Riprova.",
        cameraPermissionsNotGranted: 'Abilita l’accesso alla fotocamera',
        cameraRequestMessage: 'Abbiamo bisogno di accedere alla fotocamera per completare la verifica del conto bancario. Abilita l’accesso tramite Impostazioni > New Expensify.',
        microphonePermissionsNotGranted: 'Abilita l’accesso al microfono',
        microphoneRequestMessage: 'Abbiamo bisogno di accedere al tuo microfono per completare la verifica del conto bancario. Abilitalo tramite Impostazioni > New Expensify.',
        originalDocumentNeeded: 'Carica un’immagine originale del tuo documento d’identità invece di uno screenshot o di una scansione.',
        documentNeedsBetterQuality:
            'Il tuo documento d’identità sembra danneggiato o privo di alcune caratteristiche di sicurezza. Carica un’immagine originale di un documento integro che sia interamente visibile.',
        imageNeedsBetterQuality: 'C’è un problema con la qualità dell’immagine del tuo documento. Carica una nuova immagine in cui l’intero documento sia visibile chiaramente.',
        selfieIssue: 'C’è un problema con il tuo selfie/video. Carica un selfie/video in tempo reale.',
        selfieNotMatching: 'Il tuo selfie/video non corrisponde al tuo documento d’identità. Carica un nuovo selfie/video in cui il tuo viso sia chiaramente visibile.',
        selfieNotLive: 'Il tuo selfie/video non sembra essere una foto/video in diretta. Carica un selfie/video in diretta.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dettagli aggiuntivi',
        helpText: 'Dobbiamo confermare le seguenti informazioni prima che tu possa inviare e ricevere denaro dal tuo portafoglio.',
        helpTextIdologyQuestions: 'Dobbiamo porti ancora poche domande per completare la verifica della tua identità.',
        helpLink: 'Scopri di più sul perché ci serve questo.',
        legalFirstNameLabel: 'Nome legale di battesimo',
        legalMiddleNameLabel: 'Secondo nome legale',
        legalLastNameLabel: 'Cognome legale',
        selectAnswer: 'Seleziona una risposta per procedere',
        ssnFull9Error: 'Inserisci un SSN valido di nove cifre',
        needSSNFull9: 'Stiamo riscontrando problemi nel verificare il tuo SSN. Inserisci tutti e nove i numeri del tuo SSN.',
        weCouldNotVerify: 'Impossibile verificare',
        pleaseFixIt: 'Correggi queste informazioni prima di continuare',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Non siamo riusciti a verificare la tua identità. Riprova più tardi o contatta <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> se hai domande.`,
    },
    termsStep: {
        headerTitle: 'Termini e commissioni',
        headerTitleRefactor: 'Commissioni e condizioni',
        haveReadAndAgreePlain: 'Ho letto e accetto di ricevere le informative elettroniche.',
        haveReadAndAgree: `Ho letto e accetto di ricevere le <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">informative elettroniche</a>.`,
        agreeToThePlain: 'Accetto l’Informativa sulla privacy e il contratto del Portafoglio.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Accetto l’<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Informativa sulla privacy</a> e l’<a href="${walletAgreementUrl}">Accordo Wallet</a>.`,
        enablePayments: 'Abilita pagamenti',
        monthlyFee: 'Commissione mensile',
        inactivity: 'Inattività',
        noOverdraftOrCredit: 'Nessuna funzione di scoperto/credito.',
        electronicFundsWithdrawal: 'Prelievo di fondi elettronico',
        standard: 'Standard',
        reviewTheFees: "Dai un'occhiata ad alcune commissioni.",
        checkTheBoxes: 'Seleziona le caselle qui sotto.',
        agreeToTerms: 'Accetta i termini e sarai pronto per iniziare!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Il Portafoglio Expensify è emesso da ${walletProgram}.`,
            perPurchase: 'Per acquisto',
            atmWithdrawal: 'Prelievo bancomat',
            cashReload: 'Ricarica in contanti',
            inNetwork: "all'interno della rete",
            outOfNetwork: 'fuori rete',
            atmBalanceInquiry: 'Verifica saldo bancomat (in rete o fuori rete)',
            customerService: 'Servizio clienti (automatico o con operatore)',
            inactivityAfterTwelveMonths: 'Inattività (dopo 12 mesi senza transazioni)',
            weChargeOneFee: 'Applichiamo 1 altro tipo di commissione. È:',
            fdicInsurance: "I tuoi fondi sono idonei per l'assicurazione FDIC.",
            generalInfo: `Per informazioni generali sui conti prepagati, visita <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Per dettagli e condizioni su tutte le commissioni e i servizi, visita <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> o chiama il numero +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Prelievo elettronico di fondi (immediato)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(${amount} min)`,
        },
        longTermsForm: {
            listOfAllFees: 'Un elenco di tutte le commissioni di Expensify Wallet',
            typeOfFeeHeader: 'Tutte le commissioni',
            feeAmountHeader: 'Importo',
            moreDetailsHeader: 'Dettagli',
            openingAccountTitle: 'Apertura di un conto',
            openingAccountDetails: 'Non è prevista alcuna commissione per aprire un conto.',
            monthlyFeeDetails: 'Non c’è alcun canone mensile.',
            customerServiceTitle: 'Assistenza clienti',
            customerServiceDetails: 'Non sono previsti costi per il servizio clienti.',
            inactivityDetails: "Non c'è alcuna commissione di inattività.",
            sendingFundsTitle: 'Invio di fondi a un altro titolare di conto',
            sendingFundsDetails: 'Non è prevista alcuna commissione per inviare fondi a un altro titolare di conto utilizzando il tuo saldo, conto bancario o carta di debito.',
            electronicFundsStandardDetails:
                'Non è prevista alcuna commissione per trasferire fondi dal tuo Portafoglio Expensify al tuo conto bancario utilizzando l’opzione standard. Questo trasferimento di solito viene completato entro 1-3 giorni lavorativi.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'È prevista una commissione per trasferire fondi dal tuo Wallet Expensify alla carta di debito collegata usando l’opzione di trasferimento istantaneo. Questo trasferimento di solito viene completato entro pochi minuti.' +
                `La commissione è pari al ${percentage}% dell’importo del trasferimento (con una commissione minima di ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `I tuoi fondi hanno diritto all’assicurazione FDIC. I tuoi fondi saranno detenuti presso o trasferiti a ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, un istituto assicurato dalla FDIC.` +
                `Una volta lì, i tuoi fondi sono assicurati fino a ${amount} dalla FDIC nel caso in cui ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fallisca, se sono soddisfatti i requisiti specifici per l’assicurazione dei depositi e la tua carta è registrata. Consulta ${CONST.TERMS.FDIC_PREPAID} per i dettagli.`,
            contactExpensifyPayments: `Contatta ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} chiamando il numero +1 833-400-0904, via email all'indirizzo ${CONST.EMAIL.CONCIERGE} oppure accedi su ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Per informazioni generali sui conti prepagati, visita ${CONST.TERMS.CFPB_PREPAID}. Se hai un reclamo relativo a un conto prepagato, chiama il Consumer Financial Protection Bureau al 1-855-411-2372 o visita ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Visualizza versione stampabile',
            automated: 'Automatizzato',
            liveAgent: 'Agente in tempo reale',
            instant: 'Immediato',
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
        headerTitle: 'Informazioni sull’azienda',
        subtitle: 'Quasi fatto! Per motivi di sicurezza, dobbiamo confermare alcune informazioni:',
        legalBusinessName: 'Ragione sociale',
        companyWebsite: 'Sito web dell’azienda',
        taxIDNumber: 'Codice fiscale',
        taxIDNumberPlaceholder: '9 cifre',
        companyType: 'Tipo di azienda',
        incorporationDate: 'Data di costituzione',
        incorporationState: 'Stato di costituzione',
        industryClassificationCode: "Codice di classificazione dell'industria",
        confirmCompanyIsNot: "Confermo che questa azienda non è nell'elenco",
        listOfRestrictedBusinesses: 'elenco delle attività soggette a restrizioni',
        incorporationDatePlaceholder: 'Data di inizio (aaaa-mm-gg)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Società',
            PARTNERSHIP: 'Collaborazione',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Ditta individuale',
            OTHER: 'Altro',
        },
        industryClassification: 'A quale settore appartiene l’azienda?',
        industryClassificationCodePlaceholder: 'Cerca il codice di classificazione dell’industria',
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
        dontWorry: 'Nessun problema, non effettuiamo alcun controllo del credito personale!',
        last4SSN: 'Ultime 4 cifre del SSN',
        enterYourAddress: 'Qual è il tuo indirizzo?',
        address: 'Indirizzo',
        letsDoubleCheck: 'Controlliamo un attimo che sia tutto corretto.',
        byAddingThisBankAccount: 'Aggiungendo questo conto bancario, confermi di aver letto, compreso e accettato',
        whatsYourLegalName: 'Qual è il tuo nome legale?',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        whatsYourAddress: 'Qual è il tuo indirizzo?',
        whatsYourSSN: 'Quali sono le ultime quattro cifre del tuo numero di previdenza sociale?',
        noPersonalChecks: 'Nessun problema, qui non facciamo controlli sul tuo credito personale!',
        whatsYourPhoneNumber: 'Qual è il tuo numero di telefono?',
        weNeedThisToVerify: 'Ci serve per verificare il tuo portafoglio.',
    },
    businessInfoStep: {
        businessInfo: 'Informazioni azienda',
        enterTheNameOfYourBusiness: 'Come si chiama la tua azienda?',
        businessName: 'Ragione sociale legale',
        enterYourCompanyTaxIdNumber: 'Qual è il numero di partita IVA della tua azienda?',
        taxIDNumber: 'Codice fiscale',
        taxIDNumberPlaceholder: '9 cifre',
        enterYourCompanyWebsite: 'Qual è il sito web della tua azienda?',
        companyWebsite: 'Sito web dell’azienda',
        enterYourCompanyPhoneNumber: 'Qual è il numero di telefono della tua azienda?',
        enterYourCompanyAddress: 'Qual è l’indirizzo della tua azienda?',
        selectYourCompanyType: 'Che tipo di azienda è?',
        companyType: 'Tipo di azienda',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Società',
            PARTNERSHIP: 'Collaborazione',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Ditta individuale',
            OTHER: 'Altro',
        },
        selectYourCompanyIncorporationDate: 'Qual è la data di costituzione della tua azienda?',
        incorporationDate: 'Data di costituzione',
        incorporationDatePlaceholder: 'Data di inizio (aaaa-mm-gg)',
        incorporationState: 'Stato di costituzione',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In quale stato è stata costituita la tua società?',
        letsDoubleCheck: 'Controlliamo un attimo che sia tutto corretto.',
        companyAddress: 'Indirizzo aziendale',
        listOfRestrictedBusinesses: 'elenco delle attività soggette a restrizioni',
        confirmCompanyIsNot: "Confermo che questa azienda non è nell'elenco",
        businessInfoTitle: 'Informazioni aziendali',
        legalBusinessName: 'Ragione sociale',
        whatsTheBusinessName: 'Qual è il nome dell’azienda?',
        whatsTheBusinessAddress: 'Qual è l’indirizzo dell’azienda?',
        whatsTheBusinessContactInformation: 'Quali sono le informazioni di contatto aziendali?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Qual è il numero di registrazione dell’azienda (CRN)?';
                default:
                    return 'Qual è il numero di registrazione dell’azienda?';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Qual è il numero di identificazione del datore di lavoro (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Che cos’è il numero aziendale (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Qual è il numero di partita IVA (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Che cos’è l’Australian Business Number (ABN)?';
                default:
                    return 'Qual è il numero di partita IVA UE?';
            }
        },
        whatsThisNumber: 'Che numero è questo?',
        whereWasTheBusinessIncorporated: 'Dove è stata costituita l’azienda?',
        whatTypeOfBusinessIsIt: 'Che tipo di attività è?',
        whatsTheBusinessAnnualPayment: 'Qual è il volume annuo dei pagamenti dell’azienda?',
        whatsYourExpectedAverageReimbursements: 'Qual è l’importo medio di rimborso previsto?',
        registrationNumber: 'Numero di registrazione',
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
                    return 'IVA UE';
            }
        },
        businessAddress: 'Indirizzo aziendale',
        businessType: 'Tipo di attività',
        incorporation: 'Costituzione',
        incorporationCountry: 'Paese di costituzione',
        incorporationTypeName: 'Tipo di costituzione',
        businessCategory: 'Categoria aziendale',
        annualPaymentVolume: 'Volume annuo dei pagamenti',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Volume annuale dei pagamenti in ${currencyCode}`,
        averageReimbursementAmount: 'Importo medio del rimborso',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Importo medio di rimborso in ${currencyCode}`,
        selectIncorporationType: 'Seleziona il tipo di costituzione',
        selectBusinessCategory: 'Seleziona categoria aziendale',
        selectAnnualPaymentVolume: 'Seleziona il volume annuo dei pagamenti',
        selectIncorporationCountry: 'Seleziona il paese di costituzione',
        selectIncorporationState: 'Seleziona lo stato di costituzione',
        selectAverageReimbursement: 'Seleziona l’importo medio di rimborso',
        selectBusinessType: 'Seleziona il tipo di attività',
        findIncorporationType: 'Trova tipo di costituzione',
        findBusinessCategory: 'Trova categoria aziendale',
        findAnnualPaymentVolume: 'Trova il volume annuale dei pagamenti',
        findIncorporationState: 'Trova stato di costituzione',
        findAverageReimbursement: 'Trova l’importo medio del rimborso',
        findBusinessType: 'Trova tipo di attività',
        error: {
            registrationNumber: 'Inserisci un numero di registrazione valido',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Inserisci un numero di identificazione del datore di lavoro (EIN) valido';
                    case CONST.COUNTRY.CA:
                        return 'Per favore inserisci un numero di partita IVA (BN) valido';
                    case CONST.COUNTRY.GB:
                        return 'Inserisci un numero di partita IVA (VRN) valido';
                    case CONST.COUNTRY.AU:
                        return 'Inserisci un Australian Business Number (ABN) valido';
                    default:
                        return 'Fornisci un numero di partita IVA UE valido';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Possiedi il 25% o più di ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Qualcuno possiede il 25% o più di ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Ci sono altre persone che possiedono il 25% o più di ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'La normativa richiede che verifichiamo l’identità di ogni individuo che possiede più del 25% dell’azienda.',
        companyOwner: 'Titolare d’azienda',
        enterLegalFirstAndLastName: 'Qual è il nome legale del titolare?',
        legalFirstName: 'Nome legale di battesimo',
        legalLastName: 'Cognome legale',
        enterTheDateOfBirthOfTheOwner: 'Qual è la data di nascita del titolare?',
        enterTheLast4: 'Quali sono le ultime 4 cifre del codice fiscale del titolare?',
        last4SSN: 'Ultime 4 cifre del SSN',
        dontWorry: 'Nessun problema, non effettuiamo alcun controllo del credito personale!',
        enterTheOwnersAddress: "Qual è l'indirizzo del proprietario?",
        letsDoubleCheck: 'Controlliamo che sia tutto corretto.',
        legalName: 'Nome legale',
        address: 'Indirizzo',
        byAddingThisBankAccount: 'Aggiungendo questo conto bancario, confermi di aver letto, compreso e accettato',
        owners: 'Proprietari',
    },
    ownershipInfoStep: {
        ownerInfo: 'Info proprietario',
        businessOwner: 'Titolare d’azienda',
        signerInfo: 'Informazioni sul firmatario',
        doYouOwn: (companyName: string) => `Possiedi il 25% o più di ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Qualcuno possiede il 25% o più di ${companyName}?`,
        regulationsRequire: 'I regolamenti ci impongono di verificare l’identità di ogni individuo che possiede più del 25% dell’azienda.',
        legalFirstName: 'Nome legale di battesimo',
        legalLastName: 'Cognome legale',
        whatsTheOwnersName: 'Qual è il nome legale del titolare?',
        whatsYourName: 'Qual è il tuo nome legale?',
        whatPercentage: 'Quale percentuale dell’attività appartiene al titolare?',
        whatsYoursPercentage: 'Qual è la percentuale dell’azienda che possiedi?',
        ownership: 'Proprietà',
        whatsTheOwnersDOB: 'Qual è la data di nascita del titolare?',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        whatsTheOwnersAddress: "Qual è l'indirizzo del proprietario?",
        whatsYourAddress: 'Qual è il tuo indirizzo?',
        whatAreTheLast: 'Quali sono le ultime 4 cifre del codice fiscale del titolare?',
        whatsYourLast: 'Quali sono le ultime 4 cifre del tuo numero di previdenza sociale?',
        whatsYourNationality: 'Qual è il tuo paese di cittadinanza?',
        whatsTheOwnersNationality: 'Qual è il paese di cittadinanza del titolare?',
        countryOfCitizenship: 'Paese di cittadinanza',
        dontWorry: 'Nessun problema, non effettuiamo alcun controllo del credito personale!',
        last4: 'Ultime 4 cifre del SSN',
        whyDoWeAsk: 'Perché lo chiediamo?',
        letsDoubleCheck: 'Controlliamo che sia tutto corretto.',
        legalName: 'Nome legale',
        ownershipPercentage: 'Percentuale di partecipazione',
        areThereOther: (companyName: string) => `Ci sono altre persone che possiedono il 25% o più di ${companyName}?`,
        owners: 'Proprietari',
        addCertified: 'Aggiungi un organigramma certificato che mostri i titolari effettivi',
        regulationRequiresChart:
            'La normativa ci impone di raccogliere una copia certificata dell’organigramma societario che mostri ogni persona fisica o entità che possiede il 25% o più dell’azienda.',
        uploadEntity: 'Carica organigramma di proprietà dell’entità',
        noteEntity: 'Nota: il grafico di proprietà dell’entità deve essere firmato dal tuo commercialista, dal tuo consulente legale o essere autenticato da un notaio.',
        certified: "Schema di proprietà dell'entità certificata",
        selectCountry: 'Seleziona paese',
        findCountry: 'Trova paese',
        address: 'Indirizzo',
        chooseFile: 'Scegli file',
        uploadDocuments: 'Carica documentazione aggiuntiva',
        pleaseUpload: 'Carica qui sotto la documentazione aggiuntiva per aiutarci a verificare la tua identità come titolare diretto o indiretto del 25% o più dell’entità commerciale.',
        acceptedFiles: 'Formati di file accettati: PDF, PNG, JPEG. La dimensione totale dei file per ogni sezione non può superare 5 MB.',
        proofOfBeneficialOwner: 'Prova di titolare effettivo',
        proofOfBeneficialOwnerDescription:
            'Fornisci un’attestazione firmata e un organigramma da parte di un commercialista, notaio o avvocato che certifichi la titolarità del 25% o più dell’azienda. Deve essere datata negli ultimi tre mesi e includere il numero di licenza di chi la firma.',
        copyOfID: 'Copia del documento d’identità del titolare effettivo',
        copyOfIDDescription: 'Esempi: passaporto, patente di guida, ecc.',
        proofOfAddress: 'Prova di indirizzo per il titolare effettivo',
        proofOfAddressDescription: 'Esempi: bolletta delle utenze, contratto d’affitto, ecc.',
        codiceFiscale: 'Codice fiscale/Partita IVA',
        codiceFiscaleDescription:
            'Carica un video di una visita in sede o di una chiamata registrata con il firmatario. Il firmatario deve fornire: nome e cognome, data di nascita, ragione sociale, numero di registrazione, codice fiscale, sede legale, settore di attività e finalità del conto.',
    },
    completeVerificationStep: {
        completeVerification: 'Completa la verifica',
        confirmAgreements: 'Conferma gli accordi qui sotto.',
        certifyTrueAndAccurate: 'Dichiaro che le informazioni fornite sono veritiere e accurate',
        certifyTrueAndAccurateError: 'Conferma che le informazioni sono veritiere e accurate',
        isAuthorizedToUseBankAccount: 'Sono autorizzato/a a usare questo conto bancario aziendale per le spese aziendali',
        isAuthorizedToUseBankAccountError: 'Devi essere un responsabile con l’autorizzazione a operare sul conto bancario aziendale',
        termsAndConditions: 'termini e condizioni',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Convalida il tuo conto bancario',
        validateButtonText: 'Convalida',
        validationInputLabel: 'Transazione',
        maxAttemptsReached: 'La verifica di questo conto bancario è stata disattivata a causa di troppi tentativi non riusciti.',
        description: `Entro 1-2 giorni lavorativi invieremo tre (3) piccole transazioni al tuo conto bancario da un nome simile a "Expensify, Inc. Validation".`,
        descriptionCTA: 'Inserisci l’importo di ciascuna transazione nei campi sottostanti. Esempio: 1.51.',
        letsChatText: 'Ci siamo quasi! Abbiamo bisogno del tuo aiuto per verificare ancora alcune informazioni in chat. Prontə?',
        enable2FATitle: 'Previeni le frodi, abilita l’autenticazione a due fattori (2FA)',
        enable2FAText: 'Prendiamo molto seriamente la tua sicurezza. Configura subito l’autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.',
        secureYourAccount: 'Proteggi il tuo account',
    },
    countryStep: {
        confirmBusinessBank: 'Conferma valuta e paese del conto bancario aziendale',
        confirmCurrency: 'Conferma valuta e paese',
        yourBusiness: 'La valuta del conto bancario aziendale deve corrispondere alla valuta dello spazio di lavoro.',
        youCanChange: 'Puoi modificare la valuta del tuo spazio di lavoro nelle tue',
        findCountry: 'Trova paese',
        selectCountry: 'Seleziona paese',
    },
    bankInfoStep: {
        whatAreYour: 'Quali sono i dati del tuo conto bancario aziendale?',
        letsDoubleCheck: 'Controlliamo di nuovo che sia tutto a posto.',
        thisBankAccount: 'Questo conto bancario verrà utilizzato per i pagamenti aziendali nel tuo spazio di lavoro',
        accountNumber: 'Numero di conto',
        accountHolderNameDescription: 'Nome completo del firmatario autorizzato',
    },
    signerInfoStep: {
        signerInfo: 'Informazioni sul firmatario',
        areYouDirector: (companyName: string) => `Sei un amministratore presso ${companyName}?`,
        regulationRequiresUs: 'La normativa ci impone di verificare se il firmatario abbia l’autorità per intraprendere questa azione per conto dell’azienda.',
        whatsYourName: 'Qual è il tuo nome legale',
        fullName: 'Nome completo legale',
        whatsYourJobTitle: 'Qual è il tuo titolo di lavoro?',
        jobTitle: 'Titolo di lavoro',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        uploadID: 'Carica un documento d’identità e una prova di indirizzo',
        personalAddress: 'Prova di indirizzo personale (ad es. bolletta di utenze)',
        letsDoubleCheck: 'Controlliamo che sia tutto corretto.',
        legalName: 'Nome legale',
        proofOf: 'Prova di indirizzo personale',
        enterOneEmail: (companyName: string) => `Inserisci l’email di un/una dirigente di ${companyName}`,
        regulationRequiresOneMoreDirector: 'La normativa richiede almeno un altro direttore come firmatario.',
        hangTight: 'Resisti un attimo...',
        enterTwoEmails: (companyName: string) => `Inserisci le email di due direttori di ${companyName}`,
        sendReminder: 'Invia un promemoria',
        chooseFile: 'Scegli file',
        weAreWaiting: 'Stiamo aspettando che altre persone verifichino la propria identità come amministratori dell’azienda.',
        id: 'Copia del documento di identità',
        proofOfDirectors: 'Prova del(i) direttore(i)',
        proofOfDirectorsDescription: 'Esempi: Profilo aziendale Oncorp o Registrazione dell’attività.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale per Firmatari, Utenti Autorizzati e Titolari Effettivi.',
        PDSandFSG: 'Documentazione informativa PDS + FSG',
        PDSandFSGDescription: dedent(`
            La nostra partnership con Corpay utilizza una connessione API per sfruttare la loro vasta rete di partner bancari internazionali e alimentare i Rimborsi Globali in Expensify. In conformità con la normativa australiana, ti forniamo la Financial Services Guide (FSG) e il Product Disclosure Statement (PDS) di Corpay.

            Leggi con attenzione i documenti FSG e PDS, poiché contengono tutti i dettagli e informazioni importanti sui prodotti e servizi offerti da Corpay. Conserva questi documenti per riferimento futuro.
        `),
        pleaseUpload: 'Carica qui sotto ulteriore documentazione per aiutarci a verificare la tua identità come amministratore dell’azienda.',
        enterSignerInfo: 'Inserisci le informazioni del firmatario',
        thisStep: 'Questo passaggio è stato completato',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `sta collegando un conto bancario aziendale in ${currency} che termina con ${bankAccountLastFour} a Expensify per pagare i dipendenti in ${currency}. Il prossimo passaggio richiede le informazioni del firmatario da parte di un direttore.`,
        error: {
            emailsMustBeDifferent: 'Le email devono essere diverse',
        },
    },
    agreementsStep: {
        agreements: 'Accordi',
        pleaseConfirm: 'Conferma gli accordi qui sotto',
        regulationRequiresUs: 'La normativa richiede che verifichiamo l’identità di ogni individuo che possiede più del 25% dell’azienda.',
        iAmAuthorized: 'Sono autorizzato/a a usare il conto bancario aziendale per le spese aziendali.',
        iCertify: 'Dichiaro che le informazioni fornite sono veritiere e accurate.',
        iAcceptTheTermsAndConditions: `Accetto i <a href="https://cross-border.corpay.com/tc/">termini e condizioni</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Accetto i termini e le condizioni.',
        accept: 'Accetta e aggiungi conto bancario',
        iConsentToThePrivacyNotice: 'Acconsento all’<a href="https://payments.corpay.com/compliance">informativa sulla privacy</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Acconsento all’informativa sulla privacy.',
        error: {
            authorized: 'Devi essere un responsabile con l’autorizzazione a operare sul conto bancario aziendale',
            certify: 'Conferma che le informazioni sono veritiere e accurate',
            consent: 'Acconsenti all’informativa sulla privacy',
        },
    },
    docusignStep: {
        subheader: 'Modulo DocuSign',
        pleaseComplete:
            'Completa il modulo di autorizzazione ACH tramite il link DocuSign qui sotto e poi carica qui la copia firmata, così potremo prelevare i fondi direttamente dal tuo conto bancario',
        pleaseCompleteTheBusinessAccount: 'Completa la richiesta di addebito diretto per il conto aziendale',
        pleaseCompleteTheDirect:
            'Completa l’accordo di addebito diretto usando il link Docusign qui sotto, quindi carica qui la copia firmata così potremo prelevare i fondi direttamente dal tuo conto bancario.',
        takeMeTo: 'Portami a DocuSign',
        uploadAdditional: 'Carica documentazione aggiuntiva',
        pleaseUpload: 'Carica il modulo DEFT e la pagina della firma Docusign',
        pleaseUploadTheDirect: 'Carica la pagina degli accordi di addebito diretto e la pagina della firma DocuSign',
    },
    finishStep: {
        letsFinish: 'Concludiamo in chat!',
        thanksFor:
            'Grazie per questi dettagli. Un agente di assistenza dedicato esaminerà ora le tue informazioni. Ti ricontatteremo se avremo bisogno di altro, ma nel frattempo non esitare a contattarci per qualsiasi domanda.',
        iHaveA: 'Ho una domanda',
        enable2FA: 'Abilita l’autenticazione a due fattori (2FA) per prevenire le frodi',
        weTake: 'Prendiamo molto seriamente la tua sicurezza. Configura subito l’autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.',
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
            alerts: 'Ricevi avvisi in tempo reale se i tuoi piani di viaggio cambiano',
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
                'Devi impostare uno spazio di lavoro predefinito per abilitare Expensify Travel. Vai su Impostazioni > Spazi di lavoro > fai clic sui tre punti verticali accanto a uno spazio di lavoro > Imposta come spazio di lavoro predefinito, quindi riprova!',
        },
        flight: 'Volo',
        flightDetails: {
            passenger: 'Passeggero',
            layover: (layover: string) => `<muted-text-label>Hai uno <strong>scalo di ${layover}</strong> prima di questo volo</muted-text-label>`,
            takeOff: 'Decollo',
            landing: 'Pagina iniziale',
            seat: 'Posto',
            class: 'Classe cabina',
            recordLocator: 'Localizzatore del record',
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
            checkIn: 'Check-in',
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
            coachNumber: 'Numero carrozza',
            seat: 'Posto',
            fareDetails: 'Dettagli tariffa',
            confirmation: 'Numero di conferma',
        },
        viewTrip: 'Vedi viaggio',
        modifyTrip: 'Modifica viaggio',
        tripSupport: 'Assistenza viaggio',
        tripDetails: 'Dettagli viaggio',
        viewTripDetails: 'Visualizza i dettagli del viaggio',
        trip: 'Viaggio',
        trips: 'Viaggi',
        tripSummary: 'Riepilogo viaggio',
        departs: 'Partenza',
        errorMessage: 'Si è verificato un errore. Riprova più tardi.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Per favore <a href="${phoneErrorMethodsRoute}">aggiungi un'email di lavoro come accesso principale</a> per prenotare i viaggi.</rbr>`,
        domainSelector: {
            title: 'Dominio',
            subtitle: 'Scegli un dominio per la configurazione di Expensify Travel.',
            recommended: 'Consigliato',
        },
        domainPermissionInfo: {
            title: 'Dominio',
            restriction: (domain: string) =>
                `Non hai l'autorizzazione per abilitare Expensify Travel per il dominio <strong>${domain}</strong>. Devi chiedere a qualcuno di quel dominio di abilitare Expensify Travel al suo posto.`,
            accountantInvitation: `Se sei un commercialista, valuta di unirti al <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">programma per commercialisti ExpensifyApproved!</a> per abilitare i viaggi per questo dominio.`,
        },
        publicDomainError: {
            title: 'Inizia con Expensify Travel',
            message: `Dovrai usare la tua email di lavoro (ad es. name@company.com) con Expensify Travel, non la tua email personale (ad es. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel è stato disattivato',
            message: `L’amministratore ha disattivato Expensify Travel. Segui la policy di prenotazione viaggi della tua azienda per organizzare gli spostamenti.`,
        },
        verifyCompany: {
            title: 'Stiamo esaminando la tua richiesta...',
            message: `Stiamo effettuando alcuni controlli da parte nostra per verificare che il tuo account sia pronto per Expensify Travel. Ti ricontatteremo a breve!`,
            confirmText: 'Ricevuto',
            conciergeMessage: ({domain}: {domain: string}) => `Abilitazione dei viaggi non riuscita per il dominio: ${domain}. Controlla e abilita i viaggi per questo dominio.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Il tuo volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato prenotato. Codice di conferma: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Il tuo biglietto per il volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato annullato.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Il tuo biglietto per il volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato rimborsato o cambiato.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Il tuo volo ${airlineCode} (${origin} → ${destination}) del ${startDate}} è stato cancellato dalla compagnia aerea.`,
            flightScheduleChangePending: (airlineCode: string) => `La compagnia aerea ha proposto una modifica dell’orario per il volo ${airlineCode}; siamo in attesa di conferma.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Cambio di programma confermato: il volo ${airlineCode} ora parte alle ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Il tuo volo ${airlineCode} (${origin} → ${destination}) del ${startDate} è stato aggiornato.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `La tua classe di cabina è stata aggiornata a ${cabinClass} sul volo ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `La tua assegnazione del posto sul volo ${airlineCode} è stata confermata.`,
            flightSeatChanged: (airlineCode: string) => `La tua assegnazione del posto sul volo ${airlineCode} è stata modificata.`,
            flightSeatCancelled: (airlineCode: string) => `La tua assegnazione del posto sul volo ${airlineCode} è stata rimossa.`,
            paymentDeclined: 'Il pagamento per la tua prenotazione aerea non è andato a buon fine. Per favore riprova.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Hai annullato la tua prenotazione ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Il fornitore ha annullato la tua prenotazione ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `La tua prenotazione ${type} è stata nuovamente effettuata. Nuovo numero di conferma: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `La tua prenotazione ${type} è stata aggiornata. Controlla i nuovi dettagli nell'itinerario.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Il tuo biglietto del treno per ${origin} → ${destination} del ${startDate} è stato rimborsato. Un accredito verrà elaborato.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Il tuo biglietto del treno per ${origin} → ${destination} del ${startDate} è stato cambiato.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Il tuo biglietto del treno per ${origin} → ${destination} del ${startDate} è stato aggiornato.`,
            defaultUpdate: ({type}: TravelTypeParams) => `La tua prenotazione ${type} è stata aggiornata.`,
        },
        flightTo: 'Volo per',
        trainTo: 'Treno per',
        carRental: 'autonoleggio',
        nightIn: 'notte in',
        nightsIn: 'notti a',
    },
    workspace: {
        common: {
            card: 'Carte',
            expensifyCard: 'Carta Expensify',
            companyCards: 'Carte aziendali',
            workflows: 'Flussi di lavoro',
            workspace: 'Workspace',
            findWorkspace: 'Trova workspace',
            edit: 'Modifica spazio di lavoro',
            enabled: 'Abilitato',
            disabled: 'Disattivato',
            everyone: 'Tutti',
            delete: 'Elimina spazio di lavoro',
            settings: 'Impostazioni',
            reimburse: 'Rimborsi',
            categories: 'Categorie',
            tags: 'Tag',
            customField1: 'Campo personalizzato 1',
            customField2: 'Campo personalizzato 2',
            customFieldHint: 'Aggiungi una codifica personalizzata che si applichi a tutte le spese di questo membro.',
            reports: 'Report',
            reportFields: 'Campi del report',
            reportTitle: 'Titolo del report',
            reportField: 'Campo report',
            taxes: 'Tasse',
            bills: 'Fatture',
            invoices: 'Fatture',
            perDiem: 'Diaria',
            travel: 'Viaggi',
            members: 'Membri',
            accounting: 'Contabilità',
            receiptPartners: 'Partner ricevute',
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
                other: (count: number) => `${count} selezionati`,
            }),
            settlementFrequency: 'Frequenza di liquidazione',
            setAsDefault: 'Imposta come spazio di lavoro predefinito',
            defaultNote: `Le ricevute inviate a ${CONST.EMAIL.RECEIPTS} verranno visualizzate in questo spazio di lavoro.`,
            deleteConfirmation: 'Sei sicuro di voler eliminare questo workspace?',
            deleteWithCardsConfirmation: 'Sei sicuro di voler eliminare questo workspace? Verranno rimossi tutti i flussi di carte e le carte assegnate.',
            unavailable: 'Workspace non disponibile',
            memberNotFound: 'Membro non trovato. Per invitare un nuovo membro allo spazio di lavoro, usa il pulsante di invito qui sopra.',
            notAuthorized: `Non hai accesso a questa pagina. Se stai cercando di entrare in questo spazio di lavoro, chiedi al proprietario dello spazio di lavoro di aggiungerti come membro. Qualcos'altro? Contatta ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Vai allo spazio di lavoro',
            duplicateWorkspace: 'Duplica spazio di lavoro',
            duplicateWorkspacePrefix: 'Duplica',
            goToWorkspaces: 'Vai agli spazi di lavoro',
            clearFilter: 'Cancella filtro',
            workspaceName: 'Nome spazio di lavoro',
            workspaceOwner: 'Proprietario',
            workspaceType: 'Tipo di workspace',
            workspaceAvatar: 'Avatar dello spazio di lavoro',
            mustBeOnlineToViewMembers: 'Devi essere online per visualizzare i membri di questo workspace.',
            moreFeatures: 'Altre funzionalità',
            requested: 'Richiesto',
            distanceRates: 'Tariffe distanza',
            defaultDescription: 'Un unico posto per tutte le tue ricevute e spese.',
            descriptionHint: 'Condividi le informazioni su questo spazio di lavoro con tutti i membri.',
            welcomeNote: 'Usa Expensify per inviare le tue ricevute per il rimborso, grazie!',
            subscription: 'Abbonamento',
            markAsEntered: 'Segna come inserito manualmente',
            markAsExported: 'Segna come esportato',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Esporta su ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Controlliamo un attimo che sia tutto corretto.',
            lineItemLevel: 'Livello voce di dettaglio',
            reportLevel: 'Livello report',
            topLevel: 'Livello superiore',
            appliedOnExport: 'Non importato in Expensify, applicato all’esportazione',
            shareNote: {
                header: 'Condividi il tuo spazio di lavoro con altri membri',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Condividi questo codice QR o copia il link qui sotto per consentire ai membri di richiedere facilmente l’accesso al tuo spazio di lavoro. Tutte le richieste di adesione allo spazio di lavoro verranno visualizzate nella stanza <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> per la tua revisione.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Collega a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Crea nuova connessione',
            reuseExistingConnection: 'Riutilizza la connessione esistente',
            existingConnections: 'Connessioni esistenti',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Dato che hai già effettuato la connessione a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, puoi scegliere se riutilizzare una connessione esistente o crearne una nuova.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Ultima sincronizzazione ${formattedDate}`,
            authenticationError: (connectionName: string) => `Impossibile connettersi a ${connectionName} a causa di un errore di autenticazione.`,
            learnMore: 'Scopri di più',
            memberAlternateText: 'Invia e approva i report.',
            adminAlternateText: 'Gestisci i report e le impostazioni dello spazio di lavoro.',
            auditorAlternateText: 'Visualizza e commenta i report.',
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
                instant: 'Immediato',
                immediate: 'Quotidiana',
                trip: 'Per viaggio',
                weekly: 'Settimanale',
                semimonthly: 'Due volte al mese',
                monthly: 'Mensile',
            },
            planType: 'Tipo di piano',
            youCantDowngradeInvoicing:
                'Non puoi effettuare il downgrade del tuo piano su un abbonamento con fatturazione. Per discutere o apportare modifiche al tuo abbonamento, contatta il tuo account manager o Concierge per ricevere assistenza.',
            defaultCategory: 'Categoria predefinita',
            viewTransactions: 'Visualizza transazioni',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Spese di ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Le transazioni della Expensify Card verranno esportate automaticamente in un “Conto passività Expensify Card” creato con <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">la nostra integrazione</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Collegato a ${organizationName}` : 'Automatizza le spese di viaggio e di consegna pasti in tutta la tua organizzazione.',
                sendInvites: 'Invia inviti',
                sendInvitesDescription:
                    'Questi membri dello spazio di lavoro non hanno ancora un account Uber for Business. Deseleziona i membri che non desideri invitare in questo momento.',
                confirmInvite: 'Conferma invito',
                manageInvites: 'Gestisci inviti',
                confirm: 'Conferma',
                allSet: 'Tutto pronto',
                readyToRoll: 'Sei pronto per iniziare',
                takeBusinessRideMessage: 'Fai una corsa di lavoro e le ricevute Uber verranno importate in Expensify. Parti!',
                all: 'Tutti',
                linked: 'Collegato',
                outstanding: 'In sospeso',
                status: {
                    resend: 'Invia di nuovo',
                    invite: 'Invita',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Collegato',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'In sospeso',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Sospeso',
                },
                centralBillingAccount: 'Account di fatturazione centrale',
                centralBillingDescription: 'Scegli dove importare tutte le ricevute Uber.',
                invitationFailure: 'Invito del membro a Uber for Business non riuscito',
                autoInvite: 'Invita nuovi membri del workspace a Uber for Business',
                autoRemove: 'Disattiva i membri rimossi dallo spazio di lavoro da Uber for Business',
                emptyContent: {
                    title: 'Nessun invito in sospeso',
                    subtitle: 'Urrà! Abbiamo cercato ovunque e non abbiamo trovato inviti in sospeso.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Imposta le tariffe di diaria per controllare la spesa giornaliera dei dipendenti. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Scopri di più</a>.</muted-text>`,
            amount: 'Importo',
            deleteRates: () => ({
                one: 'Elimina tariffa',
                other: 'Elimina tariffe',
            }),
            deletePerDiemRate: 'Elimina tariffa diaria',
            findPerDiemRate: 'Trova tariffa diaria',
            areYouSureDelete: () => ({
                one: 'Sei sicuro di voler eliminare questa tariffa?',
                other: 'Sei sicuro di voler eliminare queste tariffe?',
            }),
            emptyList: {
                title: 'Diaria',
                subtitle: 'Imposta le tariffe di diaria per controllare la spesa giornaliera dei dipendenti. Importa le tariffe da un foglio di calcolo per iniziare.',
            },
            importPerDiemRates: 'Importa tariffe di diaria',
            editPerDiemRate: 'Modifica tariffa diaria',
            editPerDiemRates: 'Modifica le tariffe di diaria',
            editDestinationSubtitle: (destination: string) => `L’aggiornamento di questa destinazione la modificherà per tutte le sottotariffe di diaria ${destination}.`,
            editCurrencySubtitle: (destination: string) => `L’aggiornamento di questa valuta la modificherà per tutte le sottotariffe di diaria ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Imposta come esportare in QuickBooks Desktop le spese anticipate di tasca propria.',
            exportOutOfPocketExpensesCheckToggle: 'Contrassegna gli assegni come "stampa più tardi"',
            exportDescription: 'Configura come i dati di Expensify vengono esportati in QuickBooks Desktop.',
            date: 'Data di esportazione',
            exportInvoices: 'Esporta fatture su',
            exportExpensifyCard: 'Esporta le transazioni Expensify Card come',
            account: 'Account',
            accountDescription: 'Scegli dove registrare le scritture contabili.',
            accountsPayable: 'Debiti verso fornitori',
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
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato in QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: 'Data in cui il report è stato inviato per l’approvazione.',
                    },
                },
            },
            exportCheckDescription: 'Creeremo un assegno dettagliato per ciascun report Expensify e lo invieremo dal conto bancario sottostante.',
            exportJournalEntryDescription: 'Creeremo una registrazione contabile dettagliata per ogni report Expensify e la registreremo sul conto qui sotto.',
            exportVendorBillDescription:
                'Creeremo una fattura fornitore con dettaglio voci per ogni report Expensify e la aggiungeremo al conto qui sotto. Se questo periodo è chiuso, registreremo al 1º del periodo aperto successivo.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop non supporta le imposte nelle esportazioni delle registrazioni contabili. Poiché le imposte sono abilitate nel tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledError: 'Le registrazioni contabili non sono disponibili quando le imposte sono abilitate. Scegli un’altra opzione di esportazione.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carta di credito',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fattura fornitore',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Registrazione contabile',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Assegno',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Creeremo un assegno dettagliato per ciascun report Expensify e lo invieremo dal conto bancario sottostante.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Assoceremo automaticamente il nome dell’esercente sulla transazione con carta di credito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore “Spese varie carta di credito” per l’associazione.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Creeremo una fattura fornitore dettagliata per ciascun report Expensify con la data dell’ultima spesa e la aggiungeremo al conto qui sotto. Se questo periodo è chiuso, registreremo alla data del 1° del successivo periodo aperto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Scegli dove esportare le transazioni della carta di credito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Scegli un fornitore da applicare a tutte le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Scegli da dove inviare gli assegni.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Le fatture dei fornitori non sono disponibili quando le sedi sono abilitate. Scegli un’opzione di esportazione diversa.',
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
                    `<muted-text><centered-text>Al momento la connessione a QuickBooks Desktop non funziona. Riprova più tardi oppure <a href="${conciergeLink}">contatta Concierge</a> se il problema persiste.</centered-text></muted-text>`,
            },
            importDescription: 'Scegli quali configurazioni di codifica importare da QuickBooks Desktop in Expensify.',
            classes: 'Classi',
            items: 'Elementi',
            customers: 'Clienti/progetti',
            exportCompanyCardsDescription: 'Imposta come le spese con carta aziendale vengono esportate in QuickBooks Desktop.',
            defaultVendorDescription: 'Imposta un fornitore predefinito che verrà applicato a tutte le transazioni con carta di credito al momento dell’esportazione.',
            accountsDescription: 'Il tuo piano dei conti di QuickBooks Desktop verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli se importare i nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per la selezione da parte dei membri quando creano le loro spese.',
            classesDescription: 'Scegli come gestire le classi di QuickBooks Desktop in Expensify.',
            tagsDisplayedAsDescription: 'Livello voce di dettaglio',
            reportFieldsDisplayedAsDescription: 'Livello report',
            customersDescription: 'Scegli come gestire clienti/progetti di QuickBooks Desktop in Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con QuickBooks Desktop ogni giorno.',
                createEntities: 'Crea automaticamente entità',
                createEntitiesDescription: 'Expensify creerà automaticamente i fornitori in QuickBooks Desktop se non esistono già.',
            },
            itemsDescription: 'Scegli come gestire gli elementi di QuickBooks Desktop in Expensify.',
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
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per la selezione da parte dei membri quando creano le loro spese.',
            classesDescription: 'Scegli come gestire le classi di QuickBooks Online in Expensify.',
            customersDescription: 'Scegli come gestire i clienti/progetti di QuickBooks Online in Expensify.',
            locationsDescription: 'Scegli come gestire le sedi di QuickBooks Online in Expensify.',
            taxesDescription: 'Scegli come gestire le tasse di QuickBooks Online in Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online non supporta le ubicazioni a livello di riga per gli assegni o le fatture fornitore. Se desideri avere le ubicazioni a livello di riga, assicurati di utilizzare scritture contabili e spese con carta di credito/debito.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online non supporta le imposte sulle registrazioni contabili. Modifica l’opzione di esportazione in fattura fornitore o assegno.',
            exportDescription: 'Configura come i dati di Expensify vengono esportati in QuickBooks Online.',
            date: 'Data di esportazione',
            exportInvoices: 'Esporta fatture su',
            exportExpensifyCard: 'Esporta le transazioni Expensify Card come',
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report in QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato in QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: 'Data in cui il report è stato inviato per l’approvazione.',
                    },
                },
            },
            receivable: 'Crediti verso clienti', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archivio crediti clienti', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Usa questo conto quando esporti le fatture su QuickBooks Online.',
            exportCompanyCardsDescription: 'Imposta come le spese con carta aziendale vengono esportate in QuickBooks Online.',
            vendor: 'Fornitore',
            defaultVendorDescription: 'Imposta un fornitore predefinito che verrà applicato a tutte le transazioni con carta di credito al momento dell’esportazione.',
            exportOutOfPocketExpensesDescription: 'Imposta come esportare le spese anticipate in QuickBooks Online.',
            exportCheckDescription: 'Creeremo un assegno dettagliato per ciascun report Expensify e lo invieremo dal conto bancario sottostante.',
            exportJournalEntryDescription: 'Creeremo una registrazione contabile dettagliata per ogni report Expensify e la registreremo sul conto qui sotto.',
            exportVendorBillDescription:
                'Creeremo una fattura fornitore con dettaglio voci per ogni report Expensify e la aggiungeremo al conto qui sotto. Se questo periodo è chiuso, registreremo al 1º del periodo aperto successivo.',
            account: 'Account',
            accountDescription: 'Scegli dove registrare le scritture contabili.',
            accountsPayable: 'Debiti verso fornitori',
            accountsPayableDescription: 'Scegli dove creare le fatture fornitore.',
            bankAccount: 'Conto bancario',
            notConfigured: 'Non configurato',
            bankAccountDescription: 'Scegli da dove inviare gli assegni.',
            creditCardAccount: 'Conto carta di credito',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online non supporta le località nelle esportazioni delle fatture fornitore. Poiché nel tuo spazio di lavoro le località sono abilitate, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online non supporta le imposte nelle esportazioni di registrazioni contabili. Poiché le imposte sono abilitate sul tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledError: 'Le registrazioni contabili non sono disponibili quando le imposte sono abilitate. Scegli un’altra opzione di esportazione.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con QuickBooks Online ogni giorno.',
                inviteEmployees: 'Invita dipendenti',
                inviteEmployeesDescription: 'Importa i record dei dipendenti da QuickBooks Online e invita i dipendenti a questo spazio di lavoro.',
                createEntities: 'Crea automaticamente entità',
                createEntitiesDescription:
                    'Expensify creerà automaticamente i fornitori in QuickBooks Online se non esistono già e creerà automaticamente i clienti durante l’esportazione delle fatture.',
                reimbursedReportsDescription:
                    'Ogni volta che un report viene pagato utilizzando Expensify ACH, il pagamento della fattura corrispondente verrà creato nell’account QuickBooks Online qui sotto.',
                qboBillPaymentAccount: 'Conto di pagamento fatture QuickBooks',
                qboInvoiceCollectionAccount: 'Conto incassi fatture QuickBooks',
                accountSelectDescription: 'Scegli da dove pagare le fatture e creeremo il pagamento in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Scegli dove ricevere i pagamenti delle fatture e creeremo il pagamento in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Carta di debito',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carta di credito',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fattura fornitore',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Registrazione contabile',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Assegno',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Assoceremo automaticamente il nome dell’esercente sulla transazione con carta di debito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore “Varie carta di debito” per l’associazione.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Assoceremo automaticamente il nome dell’esercente sulla transazione con carta di credito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore “Spese varie carta di credito” per l’associazione.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Creeremo una fattura fornitore dettagliata per ciascun report Expensify con la data dell’ultima spesa e la aggiungeremo al conto qui sotto. Se questo periodo è chiuso, registreremo alla data del 1° del successivo periodo aperto.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Scegli dove esportare le transazioni della carta di debito.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Scegli dove esportare le transazioni della carta di credito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Scegli un fornitore da applicare a tutte le transazioni con carta di credito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Le fatture dei fornitori non sono disponibili quando le sedi sono abilitate. Scegli un’opzione di esportazione diversa.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Gli assegni non sono disponibili quando le sedi sono abilitate. Scegli un’altra opzione di esportazione.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Le registrazioni contabili non sono disponibili quando le imposte sono abilitate. Scegli un’altra opzione di esportazione.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Scegli un conto valido per l’esportazione delle fatture fornitore',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Scegli un conto valido per l’esportazione della registrazione contabile',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Scegli un conto valido per l’esportazione dell’assegno',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]:
                    'Per utilizzare l’esportazione delle fatture fornitore, configura un conto debiti verso fornitori in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Per usare l’esportazione delle registrazioni contabili, configura un conto giornale in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Per utilizzare l’esportazione degli assegni, configura un conto bancario in QuickBooks Online',
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: 'Aggiungi il conto in QuickBooks Online e sincronizza nuovamente la connessione.',
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
            askToJoin: 'Chiedi di partecipare',
        },
        xero: {
            organization: 'Organizzazione Xero',
            organizationDescription: 'Scegli l’organizzazione Xero da cui desideri importare i dati.',
            importDescription: 'Scegli quali configurazioni di codifica importare da Xero in Expensify.',
            accountsDescription: 'Il tuo piano dei conti Xero verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli se importare i nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per la selezione da parte dei membri quando creano le loro spese.',
            trackingCategories: 'Categorie di monitoraggio',
            trackingCategoriesDescription: 'Scegli come gestire le categorie di monitoraggio Xero in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `Mappa Xero ${categoryName} a`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Scegli dove mappare ${categoryName} durante l’esportazione su Xero.`,
            customers: 'Rifattura ai clienti',
            customersDescription:
                'Scegli se rifatturare i clienti in Expensify. I tuoi contatti cliente di Xero possono essere assegnati alle spese e verranno esportati in Xero come fatture di vendita.',
            taxesDescription: 'Scegli come gestire le imposte Xero in Expensify.',
            notImported: 'Non importato',
            notConfigured: 'Non configurato',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Predefinito contatto Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tag',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Campi del report',
            },
            exportDescription: 'Configura come i dati di Expensify vengono esportati in Xero.',
            purchaseBill: 'Fattura di acquisto',
            exportDeepDiveCompanyCard:
                'Le spese esportate verranno registrate come transazioni bancarie sul conto bancario Xero indicato di seguito e le date delle transazioni corrisponderanno alle date dell’estratto conto bancario.',
            bankTransactions: 'Transazioni bancarie',
            xeroBankAccount: 'Conto bancario Xero',
            xeroBankAccountDescription: 'Scegli dove le spese verranno registrate come transazioni bancarie.',
            exportExpensesDescription: 'I report verranno esportati come fatture di acquisto con la data e lo stato selezionati di seguito.',
            purchaseBillDate: 'Data fattura di acquisto',
            exportInvoices: 'Esporta fatture come',
            salesInvoice: 'Fattura di vendita',
            exportInvoicesDescription: 'Le fatture di vendita mostrano sempre la data in cui la fattura è stata inviata.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con Xero ogni giorno.',
                purchaseBillStatusTitle: 'Stato della fattura di acquisto',
                reimbursedReportsDescription:
                    'Ogni volta che un report viene pagato tramite Expensify ACH, il corrispondente pagamento della fattura verrà creato nell’account Xero qui sotto.',
                xeroBillPaymentAccount: 'Conto per il pagamento delle fatture Xero',
                xeroInvoiceCollectionAccount: 'Conto incassi fatture Xero',
                xeroBillPaymentAccountDescription: 'Scegli da dove pagare le fatture e creeremo il pagamento in Xero.',
                invoiceAccountSelectorDescription: 'Scegli dove ricevere i pagamenti delle fatture e creeremo il pagamento in Xero.',
            },
            exportDate: {
                label: 'Data fattura di acquisto',
                description: 'Usa questa data quando esporti i report in Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato in Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data di invio',
                        description: 'Data in cui il report è stato inviato per l’approvazione.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Stato della fattura di acquisto',
                description: 'Usa questo stato quando esporti le fatture di acquisto su Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Bozza',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'In attesa di approvazione',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'In attesa di pagamento',
                },
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: 'Aggiungi l’account in Xero e sincronizza di nuovo la connessione',
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
                description: 'Usa questa data quando esporti i report in Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato in Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data di invio',
                        description: 'Data in cui il report è stato inviato per l’approvazione.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Imposta come esportare in Sage Intacct le spese anticipate di tasca propria.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Note spese',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Fatture fornitori',
                },
            },
            nonReimbursableExpenses: {
                description: 'Imposta come esportare gli acquisti con carte aziendali su Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Carte di credito',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Fatture fornitori',
                },
            },
            creditCardAccount: 'Conto carta di credito',
            defaultVendor: 'Fornitore predefinito',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Imposta un fornitore predefinito che verrà applicato alle spese rimborsabili di ${isReimbursable ? '' : 'non-'} che non hanno un fornitore corrispondente in Sage Intacct.`,
            exportDescription: 'Configura come i dati di Expensify vengono esportati in Sage Intacct.',
            exportPreferredExporterNote:
                'L’esportatore preferito può essere qualsiasi amministratore dello spazio di lavoro, ma deve anche essere un amministratore di dominio se imposti conti di esportazione diversi per le singole carte aziendali nelle Impostazioni di dominio.',
            exportPreferredExporterSubNote: 'Una volta impostato, l’esportatore preferito vedrà nel proprio account i report da esportare.',
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: `Aggiungi l’account in Sage Intacct e sincronizza di nuovo la connessione`,
            autoSync: 'Sincronizzazione automatica',
            autoSyncDescription: 'Expensify si sincronizzerà automaticamente con Sage Intacct ogni giorno.',
            inviteEmployees: 'Invita dipendenti',
            inviteEmployeesDescription:
                'Importa i record dei dipendenti Sage Intacct e invita i dipendenti a questo spazio di lavoro. Il tuo flusso di approvazione verrà impostato di default sull’approvazione del responsabile e potrà essere ulteriormente configurato nella pagina Membri.',
            syncReimbursedReports: 'Sincronizza i report rimborsati',
            syncReimbursedReportsDescription:
                'Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura verrà creato nel conto Sage Intacct sottostante.',
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
            subsidiary: 'Società controllata',
            subsidiarySelectDescription: 'Scegli la consociata in NetSuite da cui desideri importare i dati.',
            exportDescription: 'Configura come i dati di Expensify vengono esportati in NetSuite.',
            exportInvoices: 'Esporta fatture su',
            journalEntriesTaxPostingAccount: 'Conto imposte per registrazioni contabili',
            journalEntriesProvTaxPostingAccount: 'Conto di registrazione del giornale per l’imputazione dell’imposta provinciale',
            foreignCurrencyAmount: 'Esporta importo in valuta estera',
            exportToNextOpenPeriod: 'Esporta al prossimo periodo aperto',
            nonReimbursableJournalPostingAccount: 'Conto di registrazione per movimenti non rimborsabili',
            reimbursableJournalPostingAccount: 'Conto di registrazione per i rimborsabili',
            journalPostingPreference: {
                label: 'Preferenze di registrazione delle scritture contabili',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Voce singola e dettagliata per ogni rapporto',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Registrazione singola per ogni spesa',
                },
            },
            invoiceItem: {
                label: 'Voce della fattura',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Creane uno per me',
                        description: 'Creeremo una “voce di riga fattura Expensify” per te all’esportazione (se non ne esiste già una).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Seleziona esistente',
                        description: "Assoceremo le fatture da Expensify all'elemento selezionato qui sotto.",
                    },
                },
            },
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report in NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato in NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data di invio',
                        description: 'Data in cui il report è stato inviato per l’approvazione.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Note spese',
                        reimbursableDescription: 'Le spese anticipate esportate verranno inviate a NetSuite come note spese.',
                        nonReimbursableDescription: 'Le spese delle carte aziendali verranno esportate come note spese su NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Fatture fornitori',
                        reimbursableDescription: dedent(`
                            Le spese anticipate verranno esportate come fatture pagabili al fornitore NetSuite specificato di seguito.

                            Se desideri impostare un fornitore specifico per ogni carta, vai su *Impostazioni > Domini > Carte aziendali*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Le spese con carta aziendale verranno esportate come fatture da pagare al fornitore NetSuite specificato qui sotto.

                            Se desideri impostare un fornitore specifico per ogni carta, vai su *Impostazioni > Domini > Carte aziendali*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Registrazioni contabili',
                        reimbursableDescription: dedent(`
                            Le spese anticipate verranno esportate come registrazioni contabili sul conto NetSuite specificato di seguito.

                            Se desideri impostare un fornitore specifico per ciascuna carta, vai su *Impostazioni > Domini > Carte aziendali*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Le spese con carta aziendale verranno esportate come registrazioni contabili sull’account NetSuite specificato di seguito.

                            Se desideri impostare un fornitore specifico per ciascuna carta, vai su *Impostazioni > Domini > Carte aziendali*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Se passi l’esportazione delle carte aziendali ai report spese, i fornitori NetSuite e i conti di registrazione per le singole carte verranno disattivati.\n\nNon preoccuparti, salveremo comunque le tue selezioni precedenti nel caso volessi tornare indietro più tardi.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con NetSuite ogni giorno.',
                reimbursedReportsDescription:
                    'Ogni volta che un report viene pagato usando Expensify ACH, il corrispondente pagamento della fattura verrà creato nell’account NetSuite qui sotto.',
                reimbursementsAccount: 'Conto rimborsi',
                reimbursementsAccountDescription: 'Scegli il conto bancario che utilizzerai per i rimborsi e creeremo il pagamento associato in NetSuite.',
                collectionsAccount: 'Conto incassi',
                collectionsAccountDescription: 'Una volta che una fattura è contrassegnata come pagata in Expensify ed esportata in NetSuite, verrà riportata sul conto qui sotto.',
                approvalAccount: 'Conto di approvazione A/P',
                approvalAccountDescription:
                    'Scegli il conto su cui verranno approvate le transazioni in NetSuite. Se stai sincronizzando i report rimborsati, questo è anche il conto su cui verranno creati i pagamenti delle fatture.',
                defaultApprovalAccount: 'Predefinito NetSuite',
                inviteEmployees: 'Invita i dipendenti e imposta le approvazioni',
                inviteEmployeesDescription:
                    'Importa i record dei dipendenti NetSuite e invita i dipendenti a questo spazio di lavoro. Il tuo flusso di approvazione verrà impostato di default sull’approvazione del responsabile e potrà essere ulteriormente configurato nella pagina *Members*.',
                autoCreateEntities: 'Crea automaticamente dipendenti/fornitori',
                enableCategories: 'Abilita le nuove categorie importate',
                customFormID: 'ID modulo personalizzato',
                customFormIDDescription:
                    'Per impostazione predefinita, Expensify creerà le registrazioni utilizzando il modello di transazione preferito impostato in NetSuite. In alternativa, puoi indicare uno specifico modello di transazione da utilizzare.',
                customFormIDReimbursable: 'Spesa fuori tasca',
                customFormIDNonReimbursable: 'Spesa con carta aziendale',
                exportReportsTo: {
                    label: 'Livello di approvazione del report spese',
                    description:
                        'Una volta che un report di spesa è stato approvato in Expensify ed esportato in NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Preferenza predefinita NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Solo approvato dal supervisore',
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
                        'Una volta che una fattura fornitore è approvata in Expensify ed esportata in NetSuite, puoi impostare in NetSuite un ulteriore livello di approvazione prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Preferenza predefinita NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Approvazione in sospeso',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Approvato per la registrazione',
                    },
                },
                exportJournalsTo: {
                    label: 'Livello di approvazione della registrazione contabile',
                    description:
                        'Una volta che una registrazione contabile è approvata in Expensify ed esportata in NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Preferenza predefinita NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Approvazione in sospeso',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Approvato per la registrazione',
                    },
                },
                error: {
                    customFormID: 'Inserisci un ID numerico valido per il modulo personalizzato',
                },
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Aggiungi l'account in NetSuite e sincronizza nuovamente la connessione",
            noVendorsFound: 'Nessun fornitore trovato',
            noVendorsFoundDescription: 'Aggiungi fornitori in NetSuite e sincronizza di nuovo la connessione',
            noItemsFound: 'Nessun elemento fattura trovato',
            noItemsFoundDescription: 'Aggiungi le voci della fattura in NetSuite e sincronizza di nuovo la connessione',
            noSubsidiariesFound: 'Nessuna consociata trovata',
            noSubsidiariesFoundDescription: 'Aggiungi una consociata in NetSuite e sincronizza nuovamente la connessione',
            tokenInput: {
                title: 'Configurazione NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Installa il bundle Expensify',
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
                            'In NetSuite, vai su *Setup > Users/Roles > Access Tokens* > crea un token di accesso per l’app "Expensify" e per il ruolo "Expensify Integration" o "Administrator".\n\n*Importante:* Assicurati di salvare il *Token ID* e il *Token Secret* da questo passaggio. Ti serviranno per il prossimo passaggio.',
                    },
                    enterCredentials: {
                        title: 'Inserisci le tue credenziali NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID account NetSuite',
                            netSuiteTokenID: 'ID token',
                            netSuiteTokenSecret: 'Token segreto',
                        },
                        netSuiteAccountIDDescription: 'In NetSuite, vai su *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Categorie di spesa',
                expenseCategoriesDescription: 'Le tue categorie di spesa NetSuite verranno importate in Expensify come categorie.',
                crossSubsidiaryCustomers: 'Clienti/progetti intersocietari',
                importFields: {
                    departments: {
                        title: 'Reparti',
                        subtitle: 'Scegli come gestire i *reparti* di NetSuite in Expensify.',
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
                    label: (importFields: string[], importType: string) => `${importFields.join('e')}, ${importType}`,
                },
                importTaxDescription: 'Importa gruppi fiscali da NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: "Scegli un'opzione qui sotto:",
                    label: (importedTypes: string[]) => `Importato come ${importedTypes.join('e')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Inserisci ${fieldName}`,
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
                            internalID: 'ID interna',
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
                            customSegmentInternalIDFooter: `Per prima cosa, assicurati di avere abilitato gli ID interni in NetSuite in *Home > Set Preferences > Show Internal ID.*

Puoi trovare gli ID interni dei segmenti personalizzati in NetSuite in:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Fai clic su un segmento personalizzato.
3. Fai clic sul collegamento ipertestuale accanto a *Custom Record Type*.
4. Trova l’ID interno nella tabella in basso.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Puoi trovare gli ID interni dei record personalizzati in NetSuite seguendo questi passaggi:

1. Inserisci "Transaction Line Fields" nella ricerca globale.
2. Fai clic su un record personalizzato.
3. Trova l’ID interno sul lato sinistro.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "Qual è l'ID dello script?",
                            customSegmentScriptIDFooter: `Puoi trovare gli ID di script dei segmenti personalizzati in NetSuite in: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Fai clic su un segmento personalizzato.
3. Fai clic sulla scheda *Application and Sourcing* vicino al fondo, quindi:
    a. Se vuoi visualizzare il segmento personalizzato come *tag* (a livello di voce di riga) in Expensify, fai clic sulla sotto-scheda *Transaction Columns* e utilizza il *Field ID*.
    b. Se vuoi visualizzare il segmento personalizzato come *campo di report* (a livello di report) in Expensify, fai clic sulla sotto-scheda *Transactions* e utilizza il *Field ID*.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Qual è l’ID della colonna transazione?',
                            customRecordScriptIDFooter: `Puoi trovare gli ID script dei record personalizzati in NetSuite in:

1. Inserisci "Transaction Line Fields" nella ricerca globale.
2. Fai clic su un record personalizzato.
3. Trova l’ID script sul lato sinistro.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Come dovrebbe essere visualizzato questo segmento personalizzato in Expensify?',
                            customRecordMappingTitle: 'Come dovrebbe essere visualizzato questo record personalizzato in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Esiste già un segmento/record personalizzato con questo ${fieldName?.toLowerCase()}`,
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
                            internalID: 'ID interna',
                            transactionFieldID: 'ID campo transazione',
                            mapping: 'Visualizzato come',
                        },
                        removeTitle: 'Rimuovi elenco personalizzato',
                        removePrompt: 'Sei sicuro di voler rimuovere questa lista personalizzata?',
                        addForm: {
                            listNameTitle: 'Scegli un elenco personalizzato',
                            transactionFieldIDTitle: 'Qual è l’ID del campo transazione?',
                            transactionFieldIDFooter: `Puoi trovare gli ID dei campi transazione in NetSuite seguendo questi passaggi:

1. Inserisci "Transaction Line Fields" nella ricerca globale.
2. Fai clic su un elenco personalizzato.
3. Trova l’ID del campo transazione sul lato sinistro.

_Per istruzioni più dettagliate, [visita il nostro sito di assistenza](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Come deve essere visualizzato questo elenco personalizzato in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Esiste già un elenco personalizzato con questo ID di campo transazione`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Impostazione predefinita dipendente NetSuite',
                        description: 'Non importato in Expensify, applicato all’esportazione',
                        footerContent: (importField: string) =>
                            `Se utilizzi ${importField} in NetSuite, applicheremo il valore predefinito impostato sul record del dipendente all’esportazione verso il Report spese o la Registrazione contabile.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tag',
                        description: 'Livello voce di dettaglio',
                        footerContent: (importField: string) => `${startCase(importField)} sarà selezionabile per ogni singola spesa nel report di un dipendente.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Campi del report',
                        description: 'Livello report',
                        footerContent: (importField: string) => `La selezione di ${startCase(importField)} verrà applicata a tutte le spese nel report di un dipendente.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configurazione di Sage Intacct',
            prerequisitesTitle: 'Prima di collegarti...',
            downloadExpensifyPackage: 'Scarica il pacchetto Expensify per Sage Intacct',
            followSteps: 'Segui i passaggi nelle nostre istruzioni della guida pratica: Connettersi a Sage Intacct',
            enterCredentials: 'Inserisci le tue credenziali Sage Intacct',
            entity: 'Entità',
            employeeDefault: 'Impostazione predefinita dipendente Sage Intacct',
            employeeDefaultDescription: 'Il reparto predefinito del dipendente verrà applicato alle sue spese in Sage Intacct, se esistente.',
            displayedAsTagDescription: 'Il reparto sarà selezionabile per ogni singola spesa nel report di un dipendente.',
            displayedAsReportFieldDescription: 'La selezione del reparto verrà applicata a tutte le spese nel report di un dipendente.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Scegli come gestire Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: 'Tipi di spesa',
            expenseTypesDescription: 'I tuoi tipi di spesa Sage Intacct verranno importati in Expensify come categorie.',
            accountTypesDescription: 'Il tuo piano dei conti di Sage Intacct verrà importato in Expensify come categorie.',
            importTaxDescription: 'Importa l’aliquota dell’imposta sugli acquisti da Sage Intacct.',
            userDefinedDimensions: 'Dimensioni definite dall’utente',
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
                one: '1 UDD aggiunto',
                other: (count: number) => `${count} UDD aggiunti`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'reparti';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classi';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'sedi';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clienti';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'progetti (commesse)';
                    default:
                        return 'mappature';
                }
            },
        },
        type: {
            free: 'Gratis',
            control: 'Controllo',
            collect: 'Riscossi',
        },
        companyCards: {
            addCards: 'Aggiungi carte',
            selectCards: 'Seleziona carte',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Impossibile caricare i feed delle carte',
                workspaceFeedsCouldNotBeLoadedMessage:
                    'Si è verificato un errore durante il caricamento dei feed delle carte dello spazio di lavoro. Riprova o contatta il tuo amministratore.',
                feedCouldNotBeLoadedTitle: 'Impossibile caricare questo feed',
                feedCouldNotBeLoadedMessage: 'Si è verificato un errore durante il caricamento di questo feed. Riprova o contatta il tuo amministratore.',
                tryAgain: 'Riprova',
            },
            addNewCard: {
                other: 'Altro',
                cardProviders: {
                    gl1025: 'American Express Corporate Card',
                    cdf: 'Carte commerciali Mastercard',
                    vcf: 'Carte commerciali Visa',
                    stripe: 'Carte Stripe',
                },
                yourCardProvider: `Chi è l’emittente della tua carta?`,
                whoIsYourBankAccount: 'Qual è la tua banca?',
                whereIsYourBankLocated: 'Dove si trova la tua banca?',
                howDoYouWantToConnect: 'Come vuoi collegarti alla tua banca?',
                learnMoreAboutOptions: `<muted-text>Scopri di più su queste <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opzioni</a>.</muted-text>`,
                commercialFeedDetails: 'Richiede una configurazione con la tua banca. Di solito è utilizzata da aziende più grandi ed è spesso l’opzione migliore se ne hai i requisiti.',
                commercialFeedPlaidDetails: `Richiede una configurazione con la tua banca, ma ti guideremo noi. Di solito è limitato alle aziende più grandi.`,
                directFeedDetails: 'L’approccio più semplice. Connettiti subito utilizzando le tue credenziali principali. Questo metodo è il più comune.',
                enableFeed: {
                    title: (provider: string) => `Abilita il tuo feed ${provider}`,
                    heading:
                        'Abbiamo un’integrazione diretta con l’emittente della tua carta e possiamo importare rapidamente e con precisione i dati delle tue transazioni in Expensify.\n\nPer iniziare, ti basta:',
                    visa: 'Abbiamo integrazioni globali con Visa, anche se l’idoneità varia a seconda della banca e del programma della carta.\n\nPer iniziare, ti basta:',
                    mastercard: 'Abbiamo integrazioni globali con Mastercard, anche se l’idoneità varia in base alla banca e al programma della carta.\n\nPer iniziare, ti basta:',
                    vcf: `1. Visita [questo articolo della guida](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) per istruzioni dettagliate su come configurare le tue Visa Commercial Cards.

2. [Contatta la tua banca](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) per verificare che supporti un feed commerciale per il tuo programma e chiedi di abilitarlo.

3. *Una volta che il feed è stato abilitato e ne hai i dettagli, continua alla schermata successiva.*`,
                    gl1025: `1. Visita [questo articolo di assistenza](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) per scoprire se American Express può attivare un feed commerciale per il tuo programma.

2. Una volta che il feed è stato attivato, Amex ti invierà una lettera di produzione.

3. *Una volta che hai le informazioni sul feed, continua alla schermata successiva.*`,
                    cdf: `1. Visita [questo articolo della guida](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) per istruzioni dettagliate su come configurare le tue Mastercard Commercial Cards.

 2. [Contatta la tua banca](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) per verificare che supporti un feed commerciale per il tuo programma e chiedi che venga abilitato.

3. *Una volta che il feed è stato abilitato e ne hai i dettagli, prosegui alla schermata successiva.*`,
                    stripe: `1. Visita la Dashboard di Stripe e vai su [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. In Product Integrations, fai clic su Enable accanto a Expensify.

3. Una volta abilitato il feed, fai clic su Invia qui sotto e noi ci occuperemo di aggiungerlo.`,
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
                        fileNameLabel: 'Nome file di consegna',
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
                    prompt: 'Abbiamo notato che non hai finito di aggiungere le tue carte. Se hai riscontrato un problema, faccelo sapere così possiamo aiutarti a rimettere tutto in carreggiata.',
                    confirmText: 'Segnala problema',
                    cancelText: 'Salta',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Ultimo giorno del mese',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Ultimo giorno lavorativo del mese',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Giorno del mese personalizzato',
            },
            assign: 'Assegna',
            assignCard: 'Assegna carta',
            findCard: 'Trova carta',
            cardNumber: 'Numero carta',
            commercialFeed: 'Feed commerciale',
            feedName: (feedName: string) => `Carte ${feedName}`,
            directFeed: 'Feed diretto',
            whoNeedsCardAssigned: 'Chi ha bisogno che gli venga assegnata una carta?',
            chooseTheCardholder: 'Scegli il titolare della carta',
            chooseCard: 'Scegli una carta',
            chooseCardFor: (assignee: string) => `Scegli una carta per <strong>${assignee}</strong>. Non trovi la carta che stai cercando? <concierge-link>Facci sapere.</concierge-link>`,
            noActiveCards: 'Nessuna carta attiva in questo feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Oppure qualcosa potrebbe non funzionare. In ogni caso, se hai domande, <concierge-link>contatta Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Scegli una data di inizio transazione',
            startDateDescription: 'Scegli la data di inizio dell’importazione. Sincronizzeremo tutte le transazioni da questa data in poi.',
            editStartDateDescription: 'Scegli una nuova data di inizio delle transazioni. Sincronizzeremo tutte le transazioni da quella data in poi, escludendo quelle già importate.',
            fromTheBeginning: 'Dall’inizio',
            customStartDate: 'Data di inizio personalizzata',
            customCloseDate: 'Data di chiusura personalizzata',
            letsDoubleCheck: 'Controlliamo un attimo che sia tutto corretto.',
            confirmationDescription: 'Inizieremo subito a importare le transazioni.',
            card: 'Carta',
            cardName: 'Nome carta',
            brokenConnectionError: '<rbr>La connessione al feed della carta è interrotta. <a href="#">Accedi alla tua banca</a> per poter ristabilire la connessione.</rbr>',
            assignedCard: (assignee: string, link: string) => `ha assegnato ${assignee} a ${link}! Le transazioni importate appariranno in questa chat.`,
            companyCard: 'carta aziendale',
            chooseCardFeed: 'Scegli flusso carta',
            ukRegulation:
                'Expensify Limited è un agente di Plaid Financial Ltd., un istituto di pagamento autorizzato e regolato dalla Financial Conduct Authority ai sensi del Payment Services Regulations 2017 (Numero di riferimento dell’impresa: 804718). Plaid ti fornisce servizi regolamentati di informazione sui conti tramite Expensify Limited in qualità di suo agente.',
            assignCardFailedError: 'Assegnazione della carta non riuscita.',
            unassignCardFailedError: 'Rimozione della carta non riuscita.',
            cardAlreadyAssignedError: 'Questa carta è già assegnata a un utente in un altro spazio di lavoro.',
            importTransactions: {
                title: 'Importa transazioni da file',
                description: 'Regola le impostazioni per il tuo file che verranno applicate all’importazione.',
                cardDisplayName: 'Nome visualizzato della carta',
                currency: 'Valuta',
                transactionsAreReimbursable: 'Le transazioni sono rimborsabili',
                flipAmountSign: 'Inverti segno importo',
                importButton: 'Importa transazioni',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Emetti e gestisci le tue Expensify Card',
            getStartedIssuing: 'Inizia emettendo la tua prima carta virtuale o fisica.',
            verificationInProgress: 'Verifica in corso...',
            verifyingTheDetails: 'Stiamo verificando alcuni dettagli. Concierge ti avviserà quando le Expensify Card saranno pronte per essere emesse.',
            disclaimer:
                'La carta commerciale Expensify Visa® è emessa da The Bancorp Bank, N.A., membro FDIC, in virtù di una licenza di Visa U.S.A. Inc. e potrebbe non essere accettata presso tutti gli esercenti che accettano carte Visa. Apple® e il logo Apple® sono marchi di Apple Inc., registrati negli Stati Uniti e in altri Paesi. App Store è un marchio di servizio di Apple Inc. Google Play e il logo Google Play sono marchi di Google LLC.',
            euUkDisclaimer:
                'Le carte fornite ai residenti nello SEE sono emesse da Transact Payments Malta Limited e le carte fornite ai residenti nel Regno Unito sono emesse da Transact Payments Limited in virtù di una licenza concessa da Visa Europe Limited. Transact Payments Malta Limited è debitamente autorizzata e regolamentata dalla Malta Financial Services Authority come Istituto Finanziario ai sensi del Financial Institution Act 1994. Numero di registrazione C 91879. Transact Payments Limited è autorizzata e regolamentata dalla Gibraltar Financial Service Commission.',
            issueCard: 'Emetti carta',
            findCard: 'Trova carta',
            newCard: 'Nuova carta',
            name: 'Nome',
            lastFour: 'Ultime 4',
            limit: 'Limite',
            currentBalance: 'Saldo attuale',
            currentBalanceDescription: 'Il saldo attuale è la somma di tutte le transazioni effettuate con la Expensify Card registrate dalla data dell’ultima compensazione.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Il saldo sarà regolato il ${settlementDate}`,
            settleBalance: 'Regola saldo',
            cardLimit: 'Limite carta',
            remainingLimit: 'Limite rimanente',
            requestLimitIncrease: 'Richiedi aumento limite',
            remainingLimitDescription:
                'Prendiamo in considerazione diversi fattori quando calcoliamo il tuo limite residuo: la tua anzianità come cliente, le informazioni relative all’attività che hai fornito durante la registrazione e la liquidità disponibile sul conto bancario della tua azienda. Il tuo limite residuo può variare quotidianamente.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Il saldo del cashback si basa sulle spese mensili con carta Expensify contabilizzate nel tuo spazio di lavoro.',
            issueNewCard: 'Emetti nuova carta',
            finishSetup: 'Completa configurazione',
            chooseBankAccount: 'Scegli conto bancario',
            chooseExistingBank: 'Scegli un conto bancario aziendale esistente per pagare il saldo della tua Expensify Card oppure aggiungi un nuovo conto bancario',
            accountEndingIn: 'Conto che termina con',
            addNewBankAccount: 'Aggiungi un nuovo conto bancario',
            settlementAccount: 'Conto di regolamento',
            settlementAccountDescription: 'Scegli un conto per pagare il saldo della tua Expensify Card.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Assicurati che questo conto corrisponda al tuo <a href="${reconciliationAccountSettingsLink}">Conto di riconciliazione</a> (${accountNumber}) così la Riconciliazione continua funzionerà correttamente.`,
            settlementFrequency: 'Frequenza di liquidazione',
            settlementFrequencyDescription: 'Scegli la frequenza con cui pagherai il saldo della tua Expensify Card.',
            settlementFrequencyInfo:
                'Se desideri passare alla liquidazione mensile, dovrai collegare il tuo conto bancario tramite Plaid e avere una cronologia del saldo positiva degli ultimi 90 giorni.',
            frequency: {
                daily: 'Quotidiana',
                monthly: 'Mensile',
            },
            cardDetails: 'Dettagli carta',
            cardPending: ({name}: {name: string}) => `La carta è attualmente in sospeso e verrà emessa una volta che l’account di ${name} sarà stato verificato.`,
            virtual: 'Virtuale',
            physical: 'Fisico',
            deactivate: 'Disattiva carta',
            changeCardLimit: 'Modifica limite carta',
            changeLimit: 'Modifica limite',
            smartLimitWarning: (limit: number | string) =>
                `Se modifichi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate finché non approvi altre spese sulla carta.`,
            monthlyLimitWarning: (limit: number | string) => `Se cambi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate fino al mese prossimo.`,
            fixedLimitWarning: (limit: number | string) => `Se modifichi il limite di questa carta a ${limit}, le nuove transazioni verranno rifiutate.`,
            changeCardLimitType: 'Modifica tipo di limite carta',
            changeLimitType: 'Modifica tipo di limite',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Se cambi il tipo di limite di questa carta in Limite Intelligente, le nuove transazioni verranno rifiutate perché il limite non approvato di ${limit} è già stato raggiunto.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Se cambi il tipo di limite di questa carta a Mensile, le nuove transazioni verranno rifiutate perché il limite mensile di ${limit} è già stato raggiunto.`,
            addShippingDetails: 'Aggiungi dettagli di spedizione',
            issuedCard: (assignee: string) => `ha emesso una Expensify Card per ${assignee}! La carta arriverà in 2-3 giorni lavorativi.`,
            issuedCardNoShippingDetails: (assignee: string) => `ha emesso una Expensify Card per ${assignee}! La carta verrà spedita non appena i dettagli di spedizione saranno confermati.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `ha emesso una Carta Expensify virtuale per ${assignee}! Il/la ${link} può essere usato/a subito.`,
            addedShippingDetails: (assignee: string) => `${assignee} ha aggiunto i dettagli di spedizione. La Expensify Card arriverà tra 2-3 giorni lavorativi.`,
            replacedCard: (assignee: string) => `${assignee} ha sostituito la propria Expensify Card. La nuova carta arriverà tra 2-3 giorni lavorativi.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} ha sostituito la sua carta virtuale Expensify! Il ${link} può essere usato subito.`,
            card: 'carta',
            replacementCard: 'carta sostitutiva',
            verifyingHeader: 'Verifica in corso',
            bankAccountVerifiedHeader: 'Conto bancario verificato',
            verifyingBankAccount: 'Verifica del conto bancario in corso...',
            verifyingBankAccountDescription: 'Attendi mentre verifichiamo che questo account possa essere utilizzato per emettere Expensify Card.',
            bankAccountVerified: 'Conto bancario verificato!',
            bankAccountVerifiedDescription: 'Ora puoi emettere Expensify Card ai membri del tuo workspace.',
            oneMoreStep: 'Ancora un passaggio...',
            oneMoreStepDescription: 'Sembra che sia necessario verificare manualmente il tuo conto bancario. Vai su Concierge, dove ti aspettano le istruzioni.',
            gotIt: 'Ricevuto',
            goToConcierge: 'Vai a Concierge',
        },
        categories: {
            deleteCategories: 'Elimina categorie',
            deleteCategoriesPrompt: 'Sei sicuro di voler eliminare queste categorie?',
            deleteCategory: 'Elimina categoria',
            deleteCategoryPrompt: 'Sei sicuro di voler eliminare questa categoria?',
            disableCategories: 'Disattiva categorie',
            disableCategory: 'Disattiva categoria',
            enableCategories: 'Abilita categorie',
            enableCategory: 'Abilita categoria',
            defaultSpendCategories: 'Categorie di spesa predefinite',
            spendCategoriesDescription: 'Personalizza come viene categorizzata la spesa dei fornitori per le transazioni con carta di credito e le ricevute scannerizzate.',
            deleteFailureMessage: 'Si è verificato un errore durante l’eliminazione della categoria, riprova per favore',
            categoryName: 'Nome della categoria',
            requiresCategory: 'I membri devono categorizzare tutte le spese',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Tutte le spese devono essere categorizzate per poter essere esportate in ${connectionName}.`,
            subtitle: 'Ottieni una panoramica migliore di dove vengono spesi i soldi. Usa le nostre categorie predefinite oppure aggiungi le tue.',
            emptyCategories: {
                title: 'Non hai creato alcuna categoria',
                subtitle: 'Aggiungi una categoria per organizzare le tue spese.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Le tue categorie sono attualmente importate da una connessione contabile. Vai alla sezione <a href="${accountingPageURL}">contabilità</a> per apportare eventuali modifiche.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Si è verificato un errore durante l’aggiornamento della categoria, riprova per favore',
            createFailureMessage: 'Si è verificato un errore durante la creazione della categoria, riprova per favore',
            addCategory: 'Aggiungi categoria',
            editCategory: 'Modifica categoria',
            editCategories: 'Modifica categorie',
            findCategory: 'Trova categoria',
            categoryRequiredError: 'Il nome della categoria è obbligatorio',
            existingCategoryError: 'Esiste già una categoria con questo nome',
            invalidCategoryName: 'Nome categoria non valido',
            importedFromAccountingSoftware: 'Le categorie sottostanti sono importate dal tuo',
            payrollCode: 'Codice paghe',
            updatePayrollCodeFailureMessage: 'Si è verificato un errore durante l’aggiornamento del codice paghe, riprova per favore',
            glCode: 'Codice GL',
            updateGLCodeFailureMessage: 'Si è verificato un errore durante l’aggiornamento del codice GL, riprova per favore',
            importCategories: 'Importa categorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Impossibile eliminare o disattivare tutte le categorie',
                description: `Almeno una categoria deve rimanere abilitata perché il tuo spazio di lavoro richiede le categorie.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Usa i pulsanti di attivazione qui sotto per abilitare più funzioni man mano che cresci. Ogni funzione apparirà nel menu di navigazione per ulteriori personalizzazioni.',
            spendSection: {
                title: 'Spesa',
                subtitle: 'Abilita funzionalità che ti aiutano a far crescere il tuo team.',
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
                subtitle: 'Collega Expensify ai più diffusi prodotti finanziari.',
            },
            distanceRates: {
                title: 'Tariffe distanza',
                subtitle: 'Aggiungi, aggiorna e applica le tariffe.',
            },
            perDiem: {
                title: 'Diaria',
                subtitle: 'Imposta tariffe di diaria per controllare la spesa giornaliera dei dipendenti.',
            },
            travel: {
                title: 'Viaggi',
                subtitle: 'Prenota, gestisci e riconcilia tutti i tuoi viaggi di lavoro.',
                getStarted: {
                    title: 'Inizia con Expensify Travel',
                    subtitle: 'Ci servono solo ancora alcune informazioni sulla tua azienda, poi sarai pronto al decollo.',
                    ctaText: 'Andiamo',
                },
                reviewingRequest: {
                    title: 'Prepara le valigie, abbiamo ricevuto la tua richiesta...',
                    subtitle: 'Stiamo attualmente esaminando la tua richiesta di attivare Expensify Travel. Non preoccuparti, ti faremo sapere quando sarà pronto.',
                    ctaText: 'Richiesta inviata',
                },
                bookOrManageYourTrip: {
                    title: 'Prenota o gestisci il tuo viaggio',
                    subtitle: 'Usa Expensify Travel per ottenere le migliori offerte di viaggio e gestire tutte le tue spese di lavoro in un unico posto.',
                    ctaText: 'Prenota o gestisci',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Prenotazione viaggi',
                        subtitle: 'Complimenti! Sei pronto per prenotare e gestire i viaggi in questo spazio di lavoro.',
                        manageTravelLabel: 'Gestisci viaggi',
                    },
                    centralInvoicingSection: {
                        title: 'Fatturazione centralizzata',
                        subtitle: 'Centralizza tutte le spese di viaggio in una fattura mensile invece di pagarle al momento dell’acquisto.',
                        learnHow: 'Scopri come.',
                        subsections: {
                            currentTravelSpendLabel: 'Spesa di viaggio attuale',
                            currentTravelSpendCta: 'Paga saldo',
                            currentTravelLimitLabel: 'Limite di viaggio attuale',
                            settlementAccountLabel: 'Conto di regolamento',
                            settlementFrequencyLabel: 'Frequenza di liquidazione',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Carta Expensify',
                subtitle: 'Ottieni informazioni approfondite e controllo sulle spese.',
                disableCardTitle: 'Disattiva carta Expensify',
                disableCardPrompt: 'Non puoi disabilitare la Expensify Card perché è già in uso. Contatta Concierge per i prossimi passaggi.',
                disableCardButton: 'Chatta con Concierge',
                feed: {
                    title: 'Ottieni la Expensify Card',
                    subTitle: 'Ottimizza le spese aziendali e risparmia fino al 50% sulla tua fattura Expensify, più:',
                    features: {
                        cashBack: 'Cashback su ogni acquisto negli USA',
                        unlimited: 'Carte virtuali illimitate',
                        spend: 'Controlli di spesa e limiti personalizzati',
                    },
                    ctaTitle: 'Emetti nuova carta',
                },
            },
            companyCards: {
                title: 'Carte aziendali',
                subtitle: 'Collega le carte che hai già.',
                feed: {
                    title: 'Porta le tue carte (BYOC)',
                    subtitle: 'Collega le carte che hai già per l’importazione automatica delle transazioni, l’abbinamento delle ricevute e la riconciliazione.',
                    features: {
                        support: 'Collega carte da oltre 10.000 banche',
                        assignCards: 'Collega le carte esistenti del tuo team',
                        automaticImport: 'Importeremo automaticamente le transazioni',
                    },
                },
                bankConnectionError: 'Problema di collegamento bancario',
                connectWithPlaid: 'collega tramite Plaid',
                connectWithExpensifyCard: 'prova la Expensify Card.',
                bankConnectionDescription: `Prova ad aggiungere di nuovo le tue carte. Altrimenti, puoi`,
                disableCardTitle: 'Disattiva carte aziendali',
                disableCardPrompt: 'Non puoi disattivare le carte aziendali perché questa funzione è in uso. Contatta Concierge per i prossimi passi.',
                disableCardButton: 'Chatta con Concierge',
                cardDetails: 'Dettagli carta',
                cardNumber: 'Numero carta',
                cardholder: 'Titolare della carta',
                cardName: 'Nome carta',
                allCards: 'Tutte le carte',
                assignedCards: 'Assegnata',
                unassignedCards: 'Non assegnato',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `esportazione ${integration} ${type.toLowerCase()}` : `Esportazione ${integration}`,
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Scegli il conto ${integration} in cui esportare le transazioni.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Scegli il conto ${integration} in cui esportare le transazioni. Seleziona un’altra <a href="${exportPageLink}">opzione di esportazione</a> per modificare i conti disponibili.`,
                lastUpdated: 'Ultimo aggiornamento',
                transactionStartDate: 'Data inizio transazione',
                updateCard: 'Aggiorna carta',
                unassignCard: 'Rimuovi carta',
                unassign: 'Rimuovi assegnazione',
                unassignCardDescription: 'La rimozione dell’assegnazione di questa carta eliminerà tutte le transazioni nei report in bozza dall’account del titolare della carta.',
                assignCard: 'Assegna carta',
                cardFeedName: 'Nome feed carta',
                cardFeedNameDescription: 'Dai al feed della carta un nome univoco così puoi distinguerlo dagli altri.',
                cardFeedTransaction: 'Elimina transazioni',
                cardFeedTransactionDescription: 'Scegli se i titolari di carta possono eliminare le transazioni della carta. Le nuove transazioni seguiranno queste regole.',
                cardFeedRestrictDeletingTransaction: 'Limita l’eliminazione delle transazioni',
                cardFeedAllowDeletingTransaction: 'Consenti l’eliminazione delle transazioni',
                removeCardFeed: 'Rimuovi flusso carta',
                removeCardFeedTitle: (feedName: string) => `Rimuovi feed ${feedName}`,
                removeCardFeedDescription: 'Sei sicuro di voler rimuovere questo feed di carte? Tutte le carte verranno disassociate.',
                error: {
                    feedNameRequired: 'Il nome del feed della carta è obbligatorio',
                    statementCloseDateRequired: 'Seleziona una data di chiusura dell’estratto conto.',
                },
                corporate: 'Limita l’eliminazione delle transazioni',
                personal: 'Consenti l’eliminazione delle transazioni',
                setFeedNameDescription: 'Dai al feed della carta un nome univoco così puoi distinguerlo dagli altri',
                setTransactionLiabilityDescription: 'Quando è abilitata, i titolari di carta possono eliminare le transazioni della carta. Le nuove transazioni seguiranno questa regola.',
                emptyAddedFeedTitle: 'Nessuna carta in questo feed',
                emptyAddedFeedDescription: 'Assicurati che ci siano carte nel feed delle carte della tua banca.',
                pendingFeedTitle: `Stiamo esaminando la tua richiesta...`,
                pendingFeedDescription: `Al momento stiamo esaminando i dettagli del tuo feed. Una volta terminato, ti contatteremo tramite`,
                pendingBankTitle: 'Controlla la finestra del browser',
                pendingBankDescription: (bankName: string) => `Connettiti a ${bankName} tramite la finestra del browser che si è appena aperta. Se non se ne è aperta una,`,
                pendingBankLink: 'fai clic qui',
                giveItNameInstruction: 'Dai alla carta un nome che la distingua dalle altre.',
                updating: 'Aggiornamento in corso...',
                neverUpdated: 'Mai',
                noAccountsFound: 'Nessun account trovato',
                defaultCard: 'Carta predefinita',
                downgradeTitle: `Impossibile effettuare il downgrade dello spazio di lavoro`,
                downgradeSubTitle: `Questo spazio di lavoro non può essere declassato perché sono connessi più flussi di carte (escluse le Expensify Card). Per procedere, <a href="#">mantieni un solo flusso di carte</a>.`,
                noAccountsFoundDescription: (connection: string) => `Aggiungi l’account in ${connection} e sincronizza di nuovo la connessione`,
                expensifyCardBannerTitle: 'Ottieni la Expensify Card',
                expensifyCardBannerSubtitle:
                    'Goditi il cashback su ogni acquisto negli Stati Uniti, fino al 50% di sconto sulla tua fattura Expensify, carte virtuali illimitate e molto altro ancora.',
                expensifyCardBannerLearnMoreButton: 'Scopri di più',
                statementCloseDateTitle: 'Data di chiusura dell’estratto conto',
                statementCloseDateDescription: 'Facci sapere quando si chiude l’estratto conto della tua carta e creeremo un estratto conto corrispondente in Expensify.',
            },
            workflows: {
                title: 'Flussi di lavoro',
                subtitle: 'Configura come vengono approvate e pagate le spese.',
                disableApprovalPrompt:
                    'Le Expensify Card di questo spazio di lavoro attualmente si basano sulle approvazioni per definire i loro Smart Limit. Modifica i tipi di limite di tutte le Expensify Card con Smart Limit prima di disattivare le approvazioni.',
            },
            invoices: {
                title: 'Fatture',
                subtitle: 'Invia e ricevi fatture.',
            },
            categories: {
                title: 'Categorie',
                subtitle: 'Tieni traccia e organizza le spese.',
            },
            tags: {
                title: 'Tag',
                subtitle: 'Classifica i costi e monitora le spese fatturabili.',
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
                title: 'Partner ricevute',
                subtitle: 'Importa automaticamente le ricevute.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Non così in fretta...',
                featureEnabledText: 'Per abilitare o disabilitare questa funzione, devi modificare le impostazioni di importazione contabile.',
                disconnectText: 'Per disattivare la contabilità, devi scollegare il collegamento contabile dal tuo spazio di lavoro.',
                manageSettings: 'Gestisci impostazioni',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Disconnetti Uber',
                disconnectText: 'Per disattivare questa funzione, disconnetti prima l’integrazione Uber for Business.',
                description: 'Sei sicuro di voler disconnettere questa integrazione?',
                confirmText: 'Ricevuto',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Non così in fretta...',
                featureEnabledText:
                    'Le Expensify Card in questo workspace dipendono dai flussi di approvazione per definire i loro Smart Limit.\n\nModifica i tipi di limite di tutte le carte con Smart Limit prima di disattivare i flussi di lavoro.',
                confirmText: 'Vai alle Carte Expensify',
            },
            rules: {
                title: 'Regole',
                subtitle: 'Richiedi ricevute, segnala spese elevate e altro.',
            },
            timeTracking: {
                title: 'Ora',
                subtitle: 'Imposta una tariffa oraria fatturabile per il tracciamento del tempo.',
                defaultHourlyRate: 'Tariffa oraria predefinita',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Esempi:',
            customReportNamesSubtitle: `<muted-text>Personalizza i titoli dei report usando le nostre <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">ampie formule</a>.</muted-text>`,
            customNameTitle: 'Titolo predefinito del report',
            customNameDescription: `Scegli un nome personalizzato per i report spese usando le nostre <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">ampie formule</a>.`,
            customNameInputLabel: 'Nome',
            customNameEmailPhoneExample: 'Email o telefono del membro: {report:submit:from}',
            customNameStartDateExample: 'Data di inizio report: {report:startdate}',
            customNameWorkspaceNameExample: 'Nome spazio di lavoro: {report:workspacename}',
            customNameReportIDExample: 'ID rapporto: {report:id}',
            customNameTotalExample: 'Totale: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Impedisci ai membri di modificare i titoli personalizzati dei report',
        },
        reportFields: {
            addField: 'Aggiungi campo',
            delete: 'Elimina campo',
            deleteFields: 'Elimina campi',
            findReportField: 'Trova campo report',
            deleteConfirmation: 'Sei sicuro di voler eliminare questo campo del report?',
            deleteFieldsConfirmation: 'Sei sicuro di voler eliminare questi campi del report?',
            emptyReportFields: {
                title: 'Non hai creato alcun campo di rendiconto',
                subtitle: 'Aggiungi un campo personalizzato (testo, data o menu a discesa) che viene visualizzato nei report.',
            },
            subtitle: 'I campi del report si applicano a tutte le spese e possono essere utili quando vuoi richiedere informazioni aggiuntive.',
            disableReportFields: 'Disattiva i campi del report',
            disableReportFieldsConfirmation: 'Sei sicuro? I campi di testo e data verranno eliminati e gli elenchi verranno disattivati.',
            importedFromAccountingSoftware: 'I campi del report riportati di seguito sono importati dal tuo',
            textType: 'Testo',
            dateType: 'Data',
            dropdownType: 'Elenco',
            formulaType: 'Formula',
            textAlternateText: 'Aggiungi un campo per l’inserimento di testo libero.',
            dateAlternateText: 'Aggiungi un calendario per la selezione della data.',
            dropdownAlternateText: 'Aggiungi un elenco di opzioni tra cui scegliere.',
            formulaAlternateText: 'Aggiungi un campo formula.',
            nameInputSubtitle: 'Scegli un nome per il campo del report.',
            typeInputSubtitle: 'Scegli quale tipo di campo report utilizzare.',
            initialValueInputSubtitle: 'Inserisci un valore iniziale da mostrare nel campo del report.',
            listValuesInputSubtitle: 'Questi valori verranno visualizzati nel menu a discesa del campo del tuo report. I valori abilitati possono essere selezionati dai membri.',
            listInputSubtitle: 'Questi valori verranno visualizzati nell’elenco dei campi del tuo report. I valori abilitati possono essere selezionati dai membri.',
            deleteValue: 'Elimina valore',
            deleteValues: 'Elimina valori',
            disableValue: 'Disattiva valore',
            disableValues: 'Disabilita valori',
            enableValue: 'Abilita valore',
            enableValues: 'Abilita valori',
            emptyReportFieldsValues: {
                title: 'Non hai creato alcun valore elenco',
                subtitle: 'Aggiungi valori personalizzati da visualizzare nei report.',
            },
            deleteValuePrompt: 'Sei sicuro di voler eliminare questo valore dell’elenco?',
            deleteValuesPrompt: "Sei sicuro di voler eliminare questi valori dell'elenco?",
            listValueRequiredError: "Inserisci un nome per il valore dell'elenco",
            existingListValueError: 'Esiste già un valore dell’elenco con questo nome',
            editValue: 'Modifica valore',
            listValues: 'Elenca valori',
            addValue: 'Aggiungi valore',
            existingReportFieldNameError: 'Un campo di report con questo nome esiste già',
            reportFieldNameRequiredError: 'Inserisci un nome per il campo del resoconto',
            reportFieldTypeRequiredError: 'Scegli un tipo di campo del report',
            circularReferenceError: 'Questo campo non può fare riferimento a sé stesso. Aggiorna per favore.',
            reportFieldInitialValueRequiredError: 'Scegli un valore iniziale per il campo del report',
            genericFailureMessage: 'Si è verificato un errore durante l’aggiornamento del campo del report. Riprova.',
        },
        tags: {
            tagName: 'Nome etichetta',
            requiresTag: 'I membri devono taggare tutte le spese',
            trackBillable: 'Monitora le spese fatturabili',
            customTagName: 'Nome tag personalizzato',
            enableTag: 'Abilita tag',
            enableTags: 'Abilita tag',
            requireTag: 'Tag obbligatorio',
            requireTags: 'Tag obbligatori',
            notRequireTags: 'Non richiedere',
            disableTag: 'Disabilita tag',
            disableTags: 'Disattiva tag',
            addTag: 'Aggiungi etichetta',
            editTag: 'Modifica tag',
            editTags: 'Modifica tag',
            findTag: 'Trova tag',
            subtitle: 'I tag aggiungono modi più dettagliati per classificare i costi.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Stai usando i <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">tag dipendenti</a>. Puoi <a href="${importSpreadsheetLink}">importare nuovamente un foglio di calcolo</a> per aggiornare i tuoi tag.</muted-text>`,
            emptyTags: {
                title: 'Non hai creato alcun tag',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Aggiungi un tag per tenere traccia di progetti, sedi, reparti e altro ancora.',
                subtitleHTML: `<muted-text><centered-text>Aggiungi tag per tenere traccia di progetti, sedi, reparti e altro ancora. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Scopri di più</a> sulla formattazione dei file di tag per l’importazione.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>I tuoi tag vengono attualmente importati da una connessione contabile. Vai alla sezione <a href="${accountingPageURL}">contabilità</a> per apportare eventuali modifiche.</centered-text></muted-text>`,
            },
            deleteTag: 'Elimina etichetta',
            deleteTags: 'Elimina tag',
            deleteTagConfirmation: 'Sei sicuro di voler eliminare questo tag?',
            deleteTagsConfirmation: 'Sei sicuro di voler eliminare questi tag?',
            deleteFailureMessage: 'Si è verificato un errore durante l’eliminazione dell’etichetta, riprova',
            tagRequiredError: 'Il nome del tag è obbligatorio',
            existingTagError: 'Esiste già un tag con questo nome',
            invalidTagNameError: 'Il nome del tag non può essere 0. Scegli un valore diverso.',
            genericFailureMessage: 'Si è verificato un errore durante l’aggiornamento del tag, riprova per favore',
            importedFromAccountingSoftware: 'I tag sottostanti sono importati dal tuo',
            glCode: 'Codice GL',
            updateGLCodeFailureMessage: 'Si è verificato un errore durante l’aggiornamento del codice GL, riprova per favore',
            tagRules: 'Regole dei tag',
            approverDescription: 'Approvante',
            importTags: 'Importa tag',
            importTagsSupportingText: 'Codifica le tue spese con un solo tipo di tag o con molti.',
            configureMultiLevelTags: 'Configura il tuo elenco di tag per la categorizzazione multilivello.',
            importMultiLevelTagsSupportingText: `Ecco un’anteprima dei tuoi tag. Se ti sembra tutto corretto, fai clic qui sotto per importarli.`,
            importMultiLevelTags: {
                firstRowTitle: 'La prima riga è il titolo di ciascun elenco di tag',
                independentTags: 'Questi sono tag indipendenti',
                glAdjacentColumn: "C'è un codice GL nella colonna adiacente",
            },
            tagLevel: {
                singleLevel: 'Livello singolo di tag',
                multiLevel: 'Tag multilivello',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Cambia livello etichetta',
                prompt1: 'Il cambio dei livelli di tag cancellerà tutti i tag attuali.',
                prompt2: 'Ti consigliamo prima di',
                prompt3: 'scarica un backup',
                prompt4: 'esportando le tue etichette.',
                prompt5: 'Scopri di più',
                prompt6: 'sui livelli dei tag.',
            },
            overrideMultiTagWarning: {
                title: 'Importa tag',
                prompt1: 'Sei sicuro?',
                prompt2: 'I tag esistenti verranno sovrascritti, ma puoi',
                prompt3: 'scarica un backup',
                prompt4: 'prima.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `Abbiamo trovato *${columnCounts} colonne* nel tuo foglio di calcolo. Seleziona *Nome* accanto alla colonna che contiene i nomi dei tag. Puoi anche selezionare *Abilitato* accanto alla colonna che imposta lo stato dei tag.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Impossibile eliminare o disattivare tutti i tag',
                description: `Almeno un tag deve rimanere abilitato perché il tuo spazio di lavoro richiede i tag.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Impossibile rendere tutti i tag facoltativi',
                description: `Almeno un tag deve rimanere obbligatorio perché le impostazioni del tuo workspace richiedono i tag.`,
            },
            cannotMakeTagListRequired: {
                title: 'Impossibile rendere l’elenco tag obbligatorio',
                description: 'Puoi rendere obbligatorio un elenco di tag solo se nella tua policy sono configurati più livelli di tag.',
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
            taxReclaimableOn: 'Imposta rimborsabile su',
            taxRate: 'Aliquota fiscale',
            findTaxRate: 'Trova aliquota fiscale',
            error: {
                taxRateAlreadyExists: 'Questo nome di imposta è già in uso',
                taxCodeAlreadyExists: 'Questo codice fiscale è già in uso',
                valuePercentageRange: 'Inserisci una percentuale valida compresa tra 0 e 100',
                customNameRequired: 'È necessario indicare un nome fiscale personalizzato',
                deleteFailureMessage: 'Si è verificato un errore durante l’eliminazione dell’aliquota fiscale. Riprova o chiedi assistenza a Concierge.',
                updateFailureMessage: 'Si è verificato un errore durante l’aggiornamento dell’aliquota fiscale. Riprova oppure chiedi aiuto a Concierge.',
                createFailureMessage: 'Si è verificato un errore durante la creazione dell’aliquota fiscale. Riprova oppure chiedi aiuto a Concierge.',
                updateTaxClaimableFailureMessage: 'La parte rimborsabile deve essere inferiore all’importo della tariffa per distanza',
            },
            deleteTaxConfirmation: 'Sei sicuro di voler eliminare questa imposta?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Sei sicuro di voler eliminare le imposte ${taxAmount}?`,
            actions: {
                delete: 'Elimina tariffa',
                deleteMultiple: 'Elimina tariffe',
                enable: 'Abilita tariffa',
                disable: 'Disattiva tariffa',
                enableTaxRates: () => ({
                    one: 'Abilita tariffa',
                    other: 'Abilita tariffe',
                }),
                disableTaxRates: () => ({
                    one: 'Disattiva tariffa',
                    other: 'Disattiva tariffe',
                }),
            },
            importedFromAccountingSoftware: 'Le imposte riportate di seguito sono importate dal tuo',
            taxCode: 'Codice fiscale',
            updateTaxCodeFailureMessage: 'Si è verificato un errore durante l’aggiornamento del codice fiscale, riprova',
        },
        duplicateWorkspace: {
            title: 'Dai un nome al tuo nuovo spazio di lavoro',
            selectFeatures: 'Seleziona le funzionalità da copiare',
            whichFeatures: 'Quali funzionalità vuoi copiare nel tuo nuovo spazio di lavoro?',
            confirmDuplicate: 'Vuoi continuare?',
            categories: 'categorie e le tue regole di autoclassificazione',
            reimbursementAccount: 'conto di rimborso',
            welcomeNote: 'Inizia a usare il mio nuovo spazio di lavoro',
            delayedSubmission: 'invio posticipato',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Stai per creare e condividere ${newWorkspaceName ?? ''} con ${totalMembers ?? 0} membri dell'area di lavoro originale.`,
            error: 'Si è verificato un errore durante la duplicazione del tuo nuovo spazio di lavoro. Riprova.',
        },
        emptyWorkspace: {
            title: 'Non hai nessun workspace',
            subtitle: 'Tieni traccia delle ricevute, rimborsa le spese, gestisci i viaggi, invia le fatture e molto altro.',
            createAWorkspaceCTA: 'Inizia',
            features: {
                trackAndCollect: 'Monitora e raccogli le ricevute',
                reimbursements: 'Rimborsa i dipendenti',
                companyCards: 'Gestisci carte aziendali',
            },
            notFound: 'Nessun workspace trovato',
            description: 'Le stanze sono un ottimo posto per discutere e lavorare con più persone. Per iniziare a collaborare, crea o unisciti a un workspace',
        },
        new: {
            newWorkspace: 'Nuovo spazio di lavoro',
            getTheExpensifyCardAndMore: 'Ottieni la Expensify Card e altro',
            confirmWorkspace: 'Conferma spazio di lavoro',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `La mia area di lavoro di gruppo${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace di ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Si è verificato un errore durante la rimozione di un membro dallo spazio di lavoro, riprova',
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
            removeWorkspaceMemberButtonTitle: 'Rimuovi dallo spazio di lavoro',
            removeGroupMemberButtonTitle: 'Rimuovi dal gruppo',
            removeRoomMemberButtonTitle: 'Rimuovi dalla chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Sei sicuro di voler rimuovere ${memberName}?`,
            removeMemberTitle: 'Rimuovi membro',
            transferOwner: 'Trasferisci proprietario',
            makeMember: () => ({
                one: 'Rendi membro',
                other: 'Rendi membri',
            }),
            makeAdmin: () => ({
                one: 'Rendi amministratore',
                other: 'Rendi amministratori',
            }),
            makeAuditor: () => ({
                one: 'Rendi revisore',
                other: 'Crea revisori',
            }),
            selectAll: 'Seleziona tutto',
            error: {
                genericAdd: "Si è verificato un problema nell'aggiungere questo membro dello spazio di lavoro",
                cannotRemove: 'Non puoi rimuovere te stessə o il proprietario dello spazio di lavoro',
                genericRemove: 'Si è verificato un problema durante la rimozione di quel membro dello spazio di lavoro',
            },
            addedWithPrimary: 'Alcuni membri sono stati aggiunti con i loro accessi principali.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Aggiunto dall’accesso secondario ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Membri totali dell'area di lavoro: ${count}`,
            importMembers: 'Importa membri',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Se rimuovi ${approver} da questo spazio di lavoro, lo/la sostituiremo nel flusso di approvazione con ${workspaceOwner}, il proprietario dello spazio di lavoro.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} ha rapporti spese in sospeso da approvare. Chiedi loro di approvarli o prendi il controllo dei loro rapporti prima di rimuoverli dallo spazio di lavoro.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Non puoi rimuovere ${memberName} da questo spazio di lavoro. Imposta un nuovo rimborsatore in Flussi di lavoro > Effettua o tieni traccia dei pagamenti, quindi riprova.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Se rimuovi ${memberName} da questo spazio di lavoro, sostituiremo il suo ruolo di esportatore preferito con ${workspaceOwner}, il proprietario dello spazio di lavoro.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Se rimuovi ${memberName} da questo spazio di lavoro, sostituiremo il suo ruolo di referente tecnico con ${workspaceOwner}, il proprietario dello spazio di lavoro.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} ha un report in elaborazione su cui deve intervenire. Chiedi loro di completare l’azione richiesta prima di rimuoverlə dallo spazio di lavoro.`,
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
                physicalCardDescription: 'Ideale per chi spende spesso',
                virtualCard: 'Carta virtuale',
                virtualCardDescription: 'Immediato e flessibile',
                chooseLimitType: 'Scegli un tipo di limite',
                smartLimit: 'Limite intelligente',
                smartLimitDescription: 'Spendi fino a un certo importo prima di richiedere l’approvazione',
                monthly: 'Mensile',
                monthlyDescription: 'Spendi fino a un certo importo al mese',
                fixedAmount: 'Importo fisso',
                fixedAmountDescription: 'Spendi fino a un certo importo una sola volta',
                setLimit: 'Imposta un limite',
                cardLimitError: 'Inserisci un importo inferiore a $21.474.836',
                giveItName: 'Dagli un nome',
                giveItNameInstruction: 'Rendila abbastanza unica da distinguerla dalle altre carte. Casi d’uso specifici sono ancora meglio!',
                cardName: 'Nome carta',
                letsDoubleCheck: 'Controlliamo che sia tutto corretto.',
                willBeReadyToUse: "Questa carta sarà pronta per l'uso immediatamente.",
                willBeReadyToShip: 'Questa carta sarà pronta per la spedizione immediatamente.',
                cardholder: 'Titolare della carta',
                cardType: 'Tipo di carta',
                limit: 'Limite',
                limitType: 'Tipo di limite',
                disabledApprovalForSmartLimitError:
                    'Abilita prima le approvazioni in <strong>Flussi di lavoro &gt; Aggiungi approvazioni</strong> prima di configurare i limiti intelligenti',
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
            talkYourOnboardingSpecialist: 'Chatta con il tuo/a specialista dell’installazione.',
            talkYourAccountManager: 'Chatta con il tuo account manager.',
            talkToConcierge: 'Chatta con Concierge.',
            needAnotherAccounting: 'Ti serve un altro software di contabilità?',
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
            connectTitle: ({connectionName}: ConnectionNameParams) => `Collega ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integrazione contabile'}`,
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
                `Sei sicuro di voler collegare ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'questa integrazione contabile'}? Questo rimuoverà tutte le connessioni contabili esistenti.`,
            enterCredentials: 'Inserisci le tue credenziali',
            claimOffer: {
                badgeText: 'Offerta disponibile!',
                xero: {
                    headline: 'Ottieni Xero gratis per 6 mesi!',
                    description: '<muted-text><centered-text>Nuovo su Xero? I clienti Expensify ricevono 6 mesi gratis. Richiedi la tua offerta qui sotto.</centered-text></muted-text>',
                    connectButton: 'Connetti a Xero',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Ottieni il 5% di sconto sulle corse Uber',
                    description: `<muted-text><centered-text>Attiva Uber for Business tramite Expensify e risparmia il 5% su tutte le corse di lavoro fino a giugno. <a href="${CONST.UBER_TERMS_LINK}">Si applicano termini e condizioni.</a></centered-text></muted-text>`,
                    connectButton: 'Collega Uber for Business',
                },
            },
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
                            return 'Importazione dei dipendenti';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importazione di conti';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importazione classi';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importazione delle sedi';
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
                            return 'Importazione dei dati di QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importazione titolo';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importazione certificato di approvazione';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importazione dimensioni';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importazione della polizza di risparmio';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Sincronizzazione dei dati con QuickBooks ancora in corso... Assicurati che il Web Connector sia in esecuzione';
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
                            return 'Aggiornamento elenco persone';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Aggiornamento dei campi del report';
                        case 'jobDone':
                            return 'In attesa del caricamento dei dati importati';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Sincronizzazione del piano dei conti';
                        case 'xeroSyncImportCategories':
                            return 'Sincronizzazione delle categorie';
                        case 'xeroSyncImportCustomers':
                            return 'Sincronizzazione clienti';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Contrassegnare i report Expensify come rimborsati';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Contrassegnare le fatture e le note di Xero come pagate';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Sincronizzazione delle categorie di monitoraggio';
                        case 'xeroSyncImportBankAccounts':
                            return 'Sincronizzazione dei conti bancari';
                        case 'xeroSyncImportTaxRates':
                            return 'Sincronizzazione delle aliquote fiscali';
                        case 'xeroCheckConnection':
                            return 'Verifica della connessione a Xero';
                        case 'xeroSyncTitle':
                            return 'Sincronizzazione dei dati Xero';
                        case 'netSuiteSyncConnection':
                            return 'Inizializzazione della connessione a NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importazione clienti';
                        case 'netSuiteSyncInitData':
                            return 'Recupero dei dati da NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importazione tasse';
                        case 'netSuiteSyncImportItems':
                            return 'Importazione elementi';
                        case 'netSuiteSyncData':
                            return 'Importazione dei dati in Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Sincronizzazione degli account';
                        case 'netSuiteSyncCurrencies':
                            return 'Sincronizzazione valute';
                        case 'netSuiteSyncCategories':
                            return 'Sincronizzazione delle categorie';
                        case 'netSuiteSyncReportFields':
                            return 'Importazione dei dati come campi dei report di Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importazione dei dati come tag di Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Aggiornamento delle informazioni di connessione';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Contrassegnare i report Expensify come rimborsati';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Contrassegnare le fatture e le note spese NetSuite come pagate';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importazione fornitori';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importazione di elenchi personalizzati';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importazione di elenchi personalizzati';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importazione filiali';
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
                            return `Traduzione mancante per la fase: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Esportatore preferito',
            exportPreferredExporterNote:
                'L’esportatore preferito può essere qualsiasi amministratore dello spazio di lavoro, ma deve anche essere un amministratore di dominio se imposti conti di esportazione diversi per le singole carte aziendali nelle Impostazioni di dominio.',
            exportPreferredExporterSubNote: 'Una volta impostato, l’esportatore preferito vedrà nel proprio account i report da esportare.',
            exportAs: 'Esporta come',
            exportOutOfPocket: 'Esporta le spese anticipate come',
            exportCompanyCard: 'Esporta le spese su carta aziendale come',
            exportDate: 'Data di esportazione',
            defaultVendor: 'Fornitore predefinito',
            autoSync: 'Sincronizzazione automatica',
            autoSyncDescription: 'Sincronizza automaticamente NetSuite ed Expensify ogni giorno. Esporta i report finalizzati in tempo reale',
            reimbursedReports: 'Sincronizza i report rimborsati',
            cardReconciliation: 'Riconciliazione carta',
            reconciliationAccount: 'Conto di riconciliazione',
            continuousReconciliation: 'Riconciliazione continua',
            saveHoursOnReconciliation:
                'Risparmia ore in ogni periodo contabile lasciando che Expensify riconcili in modo continuo, al posto tuo, gli estratti conto e i pagamenti delle carte Expensify.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Per abilitare la Riconciliazione Continua, attiva la <a href="${accountingAdvancedSettingsLink}">sincronizzazione automatica</a> per ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Scegli il conto bancario con cui verranno riconciliati i pagamenti della tua Expensify Card.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Assicurati che questo conto corrisponda al tuo <a href="${settlementAccountUrl}">conto di regolamento Expensify Card</a> (che termina con ${lastFourPAN}) affinché la Riconciliazione Continua funzioni correttamente.`,
            },
        },
        export: {
            notReadyHeading: "Non pronto per l'esportazione",
            notReadyDescription: 'I report spesa in bozza o in sospeso non possono essere esportati nel sistema di contabilità. Approva oppure paga queste spese prima di esportarle.',
        },
        invoices: {
            sendInvoice: 'Invia fattura',
            sendFrom: 'Invia da',
            invoicingDetails: 'Dettagli di fatturazione',
            invoicingDetailsDescription: 'Queste informazioni appariranno sulle tue fatture.',
            companyName: 'Nome azienda',
            companyWebsite: 'Sito web dell’azienda',
            paymentMethods: {
                personal: 'Personale',
                business: 'Business',
                chooseInvoiceMethod: 'Scegli un metodo di pagamento qui sotto:',
                payingAsIndividual: 'Pagare come individuo',
                payingAsBusiness: 'Pagare come azienda',
            },
            invoiceBalance: 'Saldo fattura',
            invoiceBalanceSubtitle: 'Questo è il saldo attuale derivante dall’incasso delle fatture. Verrà trasferito automaticamente sul tuo conto bancario se ne hai aggiunto uno.',
            bankAccountsSubtitle: 'Aggiungi un conto bancario per inviare e ricevere pagamenti delle fatture.',
        },
        invite: {
            member: 'Invita membro',
            members: 'Invita membri',
            invitePeople: 'Invita nuovi membri',
            genericFailureMessage: "Si è verificato un errore durante l'invito del membro allo spazio di lavoro. Riprova.",
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
            genericFailureMessage: "Si è verificato un errore durante l'invito del membro allo spazio di lavoro. Riprova.",
            inviteNoMembersError: 'Seleziona almeno un membro da invitare',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} ha richiesto di unirsi a ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ops! Non così in fretta...',
            workspaceNeeds: 'Uno spazio di lavoro deve avere almeno una tariffa chilometrica abilitata.',
            distance: 'Distanza',
            centrallyManage: 'Gestisci centralmente le tariffe, tieni traccia in miglia o chilometri e imposta una categoria predefinita.',
            rate: 'Valuta',
            addRate: 'Aggiungi tariffa',
            findRate: 'Trova tariffa',
            trackTax: 'Monitora imposte',
            deleteRates: () => ({
                one: 'Elimina tariffa',
                other: 'Elimina tariffe',
            }),
            enableRates: () => ({
                one: 'Abilita tariffa',
                other: 'Abilita tariffe',
            }),
            disableRates: () => ({
                one: 'Disattiva tariffa',
                other: 'Disattiva tariffe',
            }),
            enableRate: 'Abilita tariffa',
            status: 'Stato',
            unit: 'Unit',
            taxFeatureNotEnabledMessage:
                '<muted-text>Le imposte devono essere abilitate nello spazio di lavoro per usare questa funzione. Vai su <a href="#">Altre funzionalità</a> per effettuare questa modifica.</muted-text>',
            deleteDistanceRate: 'Elimina tariffa distanza',
            areYouSureDelete: () => ({
                one: 'Sei sicuro di voler eliminare questa tariffa?',
                other: 'Sei sicuro di voler eliminare queste tariffe?',
            }),
            errors: {
                rateNameRequired: 'Il nome della tariffa è obbligatorio',
                existingRateName: 'Esiste già una tariffa di distanza con questo nome',
            },
        },
        editor: {
            descriptionInputLabel: 'Descrizione',
            nameInputLabel: 'Nome',
            typeInputLabel: 'Tipo',
            initialValueInputLabel: 'Valore iniziale',
            nameInputHelpText: 'Questo è il nome che vedrai sul tuo spazio di lavoro.',
            nameIsRequiredError: 'Dovrai assegnare un nome al tuo spazio di lavoro',
            currencyInputLabel: 'Valuta predefinita',
            currencyInputHelpText: 'Tutte le spese in questo workspace saranno convertite in questa valuta.',
            currencyInputDisabledText: (currency: string) => `La valuta predefinita non può essere modificata perché questo spazio di lavoro è collegato a un conto bancario in ${currency}.`,
            save: 'Salva',
            genericFailureMessage: 'Si è verificato un errore durante l’aggiornamento dello spazio di lavoro. Riprova.',
            avatarUploadFailureMessage: "Si è verificato un errore durante il caricamento dell'avatar. Riprova.",
            addressContext: 'Per abilitare Expensify Travel è necessario un indirizzo della Workspace. Inserisci un indirizzo associato alla tua attività.',
            policy: 'Policy di spesa',
        },
        bankAccount: {
            continueWithSetup: 'Continua configurazione',
            youAreAlmostDone:
                'Hai quasi terminato la configurazione del tuo conto bancario, che ti permetterà di emettere carte aziendali, rimborsare spese, riscuotere fatture e pagare bollette.',
            streamlinePayments: 'Rendi i pagamenti più efficienti',
            connectBankAccountNote: 'Nota: i conti bancari personali non possono essere usati per i pagamenti negli spazi di lavoro.',
            oneMoreThing: "Un'ultima cosa!",
            allSet: 'Tutto pronto!',
            accountDescriptionWithCards: 'Questo conto bancario verrà utilizzato per emettere carte aziendali, rimborsare le spese, incassare le fatture e pagare i conti.',
            letsFinishInChat: 'Concludiamo in chat!',
            finishInChat: 'Termina nella chat',
            almostDone: 'Quasi fatto!',
            disconnectBankAccount: 'Disconnetti conto bancario',
            startOver: 'Ricomincia',
            updateDetails: 'Aggiorna dettagli',
            yesDisconnectMyBankAccount: 'Sì, disconnetti il mio conto bancario',
            yesStartOver: 'Sì, ricomincia',
            disconnectYourBankAccount: (bankName: string) =>
                `Disconnetti il conto bancario <strong>${bankName}</strong>. Tutte le transazioni in sospeso per questo conto verranno comunque completate.`,
            clearProgress: 'Ricominciare azzererà i progressi fatti finora.',
            areYouSure: 'Sei sicuro?',
            workspaceCurrency: 'Valuta dello spazio di lavoro',
            updateCurrencyPrompt:
                'Sembra che il tuo spazio di lavoro sia attualmente impostato su una valuta diversa da USD. Fai clic sul pulsante qui sotto per aggiornare subito la tua valuta in USD.',
            updateToUSD: 'Aggiorna in USD',
            updateWorkspaceCurrency: 'Aggiorna la valuta dello spazio di lavoro',
            workspaceCurrencyNotSupported: 'Valuta dello spazio di lavoro non supportata',
            yourWorkspace: `La tua area di lavoro è impostata su una valuta non supportata. Visualizza l’<a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">elenco delle valute supportate</a>.`,
            chooseAnExisting: 'Scegli un conto bancario esistente per pagare le spese o aggiungine uno nuovo.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Trasferisci proprietario',
            addPaymentCardTitle: 'Inserisci la tua carta di pagamento per trasferire la proprietà',
            addPaymentCardButtonText: 'Accetta i termini e aggiungi la carta di pagamento',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Leggi e accetta i <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">termini</a> e l’<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">informativa sulla privacy</a> per aggiungere la tua carta.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Conforme allo standard PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Crittografia a livello bancario',
            addPaymentCardRedundant: 'Infrastruttura ridondante',
            addPaymentCardLearnMore: `<muted-text>Scopri di più sulla nostra <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">sicurezza</a>.</muted-text>`,
            amountOwedTitle: 'Saldo in sospeso',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Questo account ha un saldo in sospeso da un mese precedente.\n\nVuoi azzerare il saldo e assumerti la fatturazione di questo workspace?',
            ownerOwesAmountTitle: 'Saldo in sospeso',
            ownerOwesAmountButtonText: 'Trasferisci saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `L’account proprietario di questo spazio di lavoro (${email}) ha un saldo in sospeso da un mese precedente.

Vuoi trasferire questo importo (${amount}) per assumerti la fatturazione di questo spazio di lavoro? La tua carta di pagamento verrà addebitata immediatamente.`,
            subscriptionTitle: 'Subentra all’abbonamento annuale',
            subscriptionButtonText: 'Trasferisci abbonamento',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Assumere il controllo di questo spazio di lavoro unirà il suo abbonamento annuale con il tuo abbonamento attuale. Questo aumenterà le dimensioni del tuo abbonamento di ${usersCount} membri rendendo la nuova dimensione del tuo abbonamento ${finalCount}. Vuoi continuare?`,
            duplicateSubscriptionTitle: 'Avviso di abbonamento duplicato',
            duplicateSubscriptionButtonText: 'Continua',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Sembra che tu stia cercando di assumerti la fatturazione per gli spazi di lavoro di ${email}, ma per farlo devi prima essere admin di tutti i loro spazi di lavoro.

Fai clic su "Continua" se vuoi assumerti la fatturazione solo per lo spazio di lavoro ${workspaceName}.

Se vuoi assumerti la fatturazione per l’intero abbonamento, chiedi prima a questa persona di aggiungerti come admin a tutti i suoi spazi di lavoro, e solo dopo assumi la fatturazione.`,
            hasFailedSettlementsTitle: 'Impossibile trasferire la proprietà',
            hasFailedSettlementsButtonText: 'Ricevuto',
            hasFailedSettlementsText: (email: string) =>
                `Non puoi assumere la fatturazione perché ${email} ha un saldo in sospeso per la Expensify Card. Chiedi a questa persona di contattare concierge@expensify.com per risolvere il problema. Dopo di ciò, potrai assumere la fatturazione per questo spazio di lavoro.`,
            failedToClearBalanceTitle: 'Impossibile azzerare il saldo',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Non siamo riusciti ad azzerare il saldo. Riprova più tardi.',
            successTitle: 'Fantastico! Tutto pronto.',
            successDescription: 'Ora sei il proprietario di questo spazio di lavoro.',
            errorTitle: 'Ops! Non così in fretta...',
            errorDescription: `<muted-text><centered-text>Si è verificato un problema nel trasferimento della proprietà di questo spazio di lavoro. Riprova oppure <concierge-link>contatta Concierge</concierge-link> per assistenza.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Attenzione!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `I seguenti report sono già stati esportati su ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Sei sicuro di volerli esportare di nuovo?`,
            confirmText: 'Sì, esporta di nuovo',
            cancelText: 'Annulla',
        },
        upgrade: {
            reportFields: {
                title: 'Campi del report',
                description: `I campi del report ti permettono di specificare dettagli a livello di intestazione, distinti dai tag che si riferiscono alle spese delle singole voci. Questi dettagli possono includere nomi di progetti specifici, informazioni sui viaggi di lavoro, località e altro ancora.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I campi del report sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Approfitta della sincronizzazione automatica e riduci le registrazioni manuali con l’integrazione Expensify + NetSuite. Ottieni approfondite informazioni finanziarie in tempo reale con il supporto di segmenti nativi e personalizzati, inclusa la mappatura di progetti e clienti.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>La nostra integrazione con NetSuite è disponibile solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Approfitta della sincronizzazione automatica e riduci le registrazioni manuali con l’integrazione Expensify + Sage Intacct. Ottieni approfondite informazioni finanziarie in tempo reale con dimensioni definite dall’utente, oltre alla codifica delle spese per dipartimento, classe, sede, cliente e progetto (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>La nostra integrazione con Sage Intacct è disponibile solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Goditi la sincronizzazione automatica e riduci le registrazioni manuali con l’integrazione Expensify + QuickBooks Desktop. Ottieni la massima efficienza con una connessione bidirezionale in tempo reale e la codifica delle spese per classe, articolo, cliente e progetto.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>La nostra integrazione con QuickBooks Desktop è disponibile solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Approvazioni avanzate',
                description: `Se vuoi aggiungere più livelli di approvazione al processo – o semplicemente assicurarti che le spese più elevate ricevano un’ulteriore verifica – ci pensiamo noi. Le approvazioni avanzate ti aiutano a impostare i giusti controlli a ogni livello, così puoi mantenere sotto controllo le spese del tuo team.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le approvazioni avanzate sono disponibili solo con il piano Control, che parte da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            categories: {
                title: 'Categorie',
                description: 'Le categorie ti permettono di monitorare e organizzare le spese. Usa le nostre categorie predefinite oppure aggiungi le tue.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le categorie sono disponibili con il piano Collect, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            glCodes: {
                title: 'Codici Co.Ge.',
                description: `Aggiungi i codici GL alle tue categorie e ai tuoi tag per esportare facilmente le spese nei tuoi sistemi contabili e paghe.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I codici GL sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Codici contabili e stipendi',
                description: `Aggiungi codici contabili e paghe alle tue categorie per esportare facilmente le spese nei tuoi sistemi di contabilità e payroll.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I codici GL e Payroll sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Codici fiscali',
                description: `Aggiungi codici imposta alle tue tasse per esportare facilmente le spese nei tuoi sistemi di contabilità e paghe.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I codici IVA sono disponibili solo nel piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            companyCards: {
                title: 'Carte aziendali illimitate',
                description: `Hai bisogno di aggiungere altri feed di carte? Sblocca carte aziendali illimitate per sincronizzare le transazioni da tutti i principali emittenti di carte.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Questo è disponibile solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            rules: {
                title: 'Regole',
                description: `Le regole vengono eseguite in background e mantengono le tue spese sotto controllo, così non devi preoccuparti dei dettagli.

Richiedi dettagli sulle spese come ricevute e descrizioni, imposta limiti e valori predefiniti e automatizza approvazioni e pagamenti, tutto in un unico posto.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le regole sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            perDiem: {
                title: 'Diaria',
                description:
                    'Il per diem è un ottimo modo per mantenere i tuoi costi giornalieri conformi e prevedibili quando i tuoi dipendenti viaggiano. Sfrutta funzionalità come tariffe personalizzate, categorie predefinite e dettagli più specifici come destinazioni e sottotariffe.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le diarie sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            travel: {
                title: 'Viaggi',
                description:
                    'Expensify Travel è una nuova piattaforma aziendale per la prenotazione e la gestione dei viaggi che consente ai membri di prenotare alloggi, voli, trasporti e altro ancora.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Viaggi è disponibile con il piano Collect, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            reports: {
                title: 'Report',
                description: 'I report ti permettono di raggruppare le spese per facilitarne il monitoraggio e l’organizzazione.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I report sono disponibili con il piano Collect, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tag multilivello',
                description:
                    'I tag multilivello ti aiutano a tenere traccia delle spese con maggiore precisione. Assegna più tag a ogni voce, ad esempio reparto, cliente o centro di costo, per catturare il contesto completo di ogni spesa. Questo consente reportistica più dettagliata, flussi di approvazione e esportazioni contabili.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>I tag multilivello sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Tariffe distanza',
                description: 'Crea e gestisci le tue tariffe, tieni traccia in miglia o chilometri e imposta categorie predefinite per le spese chilometriche.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le tariffe distanza sono disponibili con il piano Collect, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            auditor: {
                title: 'Revisore',
                description: 'I revisori ottengono accesso in sola lettura a tutti i report per una visibilità completa e il monitoraggio della conformità.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Gli auditor sono disponibili solo con il piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Più livelli di approvazione',
                description:
                    'I livelli di approvazione multipli sono uno strumento di workflow per le aziende che richiedono l’approvazione di più persone su un report prima che possa essere rimborsato.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Più livelli di approvazione sono disponibili solo nel piano Control, a partire da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'per ogni membro attivo al mese.',
                perMember: 'per membro al mese.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Effettua l’upgrade per accedere a questa funzionalità oppure <a href="${subscriptionLink}">scopri di più</a> sui nostri piani e prezzi.</muted-text>`,
            upgradeToUnlock: 'Sblocca questa funzione',
            completed: {
                headline: `Hai aggiornato il tuo spazio di lavoro!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Hai effettuato l'upgrade di ${policyName} al piano Control! <a href="${subscriptionLink}">Visualizza il tuo abbonamento</a> per maggiori dettagli.</centered-text>`,
                categorizeMessage: `Hai eseguito l’upgrade al piano Collect. Ora puoi categorizzare le tue spese!`,
                travelMessage: `Hai eseguito l’upgrade al piano Collect. Ora puoi iniziare a prenotare e gestire i viaggi!`,
                distanceRateMessage: `Hai eseguito l’upgrade al piano Collect. Ora puoi modificare la tariffa chilometrica!`,
                gotIt: 'Capito, grazie',
                createdWorkspace: `Hai creato uno spazio di lavoro!`,
            },
            commonFeatures: {
                title: 'Passa al piano Control',
                note: 'Sblocca le nostre funzionalità più potenti, tra cui:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Il piano Control parte da <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per membro al mese.` : `per ogni membro attivo al mese.`} <a href="${learnMoreMethodsRoute}">Scopri di più</a> sui nostri piani e prezzi.</muted-text>`,
                    benefit1: 'Connessioni di contabilità avanzate (NetSuite, Sage Intacct e altro)',
                    benefit2: 'Regole spese intelligenti',
                    benefit3: 'Flussi di approvazione multilivello',
                    benefit4: 'Controlli di sicurezza avanzati',
                    toUpgrade: 'Per eseguire l’upgrade, fai clic',
                    selectWorkspace: 'seleziona uno spazio di lavoro e cambia il tipo di piano in',
                },
                upgradeWorkspaceWarning: `Impossibile aggiornare lo spazio di lavoro`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: 'La tua azienda ha limitato la creazione di spazi di lavoro. Contatta un amministratore per assistenza.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Passa al piano Collect',
                note: 'Se effettui il downgrade, perderai l’accesso a queste funzionalità e ad altre ancora:',
                benefits: {
                    note: 'Per un confronto completo dei nostri piani, guarda la nostra',
                    pricingPage: 'pagina dei prezzi',
                    confirm: 'Sei sicuro di voler effettuare il downgrade e rimuovere le tue configurazioni?',
                    warning: 'Questa operazione non può essere annullata.',
                    benefit1: 'Connessioni contabili (tranne QuickBooks Online e Xero)',
                    benefit2: 'Regole spese intelligenti',
                    benefit3: 'Flussi di approvazione multilivello',
                    benefit4: 'Controlli di sicurezza avanzati',
                    headsUp: 'Attenzione!',
                    multiWorkspaceNote:
                        'Dovrai eseguire il downgrade di tutti i tuoi spazi di lavoro prima del tuo primo pagamento mensile per iniziare un abbonamento alla tariffa Collect. Fai clic',
                    selectStep: '> seleziona ogni spazio di lavoro > cambia il tipo di piano in',
                },
            },
            completed: {
                headline: 'Il tuo spazio di lavoro è stato declassato',
                description: 'Hai altri spazi di lavoro con il piano Control. Per essere fatturato alla tariffa Collect, devi effettuare il downgrade di tutti gli spazi di lavoro.',
                gotIt: 'Capito, grazie',
            },
        },
        payAndDowngrade: {
            title: 'Paga e declassa',
            headline: 'Il tuo pagamento finale',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `L’importo finale da pagare per questo abbonamento sarà di <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Ecco il tuo riepilogo per ${date}:`,
            subscription:
                'Attenzione! Questa azione terminerà il tuo abbonamento a Expensify, eliminerà questo workspace e rimuoverà tutti i membri del workspace. Se vuoi mantenere questo workspace ed eliminare solo te stessə, chiedi prima a un altro amministratore di subentrare nella fatturazione.',
            genericFailureMessage: 'Si è verificato un errore durante il pagamento della tua fattura. Riprova.',
        },
        restrictedAction: {
            restricted: 'Limitato',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Le azioni nello spazio di lavoro ${workspaceName} sono attualmente limitate`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Il/la proprietario/a dello spazio di lavoro, ${workspaceOwnerName}, dovrà aggiungere o aggiornare la carta di pagamento registrata per sbloccare la nuova attività nello spazio di lavoro.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Dovrai aggiungere o aggiornare la carta di pagamento registrata per sbloccare la nuova attività dello spazio di lavoro.',
            addPaymentCardToUnlock: 'Aggiungi una carta di pagamento per sbloccare!',
            addPaymentCardToContinueUsingWorkspace: 'Aggiungi una carta di pagamento per continuare a utilizzare questo spazio di lavoro',
            pleaseReachOutToYourWorkspaceAdmin: 'Per qualsiasi domanda, contatta l’amministratore del tuo workspace.',
            chatWithYourAdmin: 'Chatta con il tuo amministratore',
            chatInAdmins: 'Chatta in #admins',
            addPaymentCard: 'Aggiungi carta di pagamento',
            goToSubscription: 'Vai a Sottoscrizione',
        },
        rules: {
            individualExpenseRules: {
                title: 'Spese',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Imposta controlli di spesa e valori predefiniti per le singole note spese. Puoi anche creare regole per le <a href="${categoriesPageLink}">categorie</a> e i <a href="${tagsPageLink}">tag</a>.</muted-text>`,
                receiptRequiredAmount: 'Importo richiesto per la ricevuta',
                receiptRequiredAmountDescription: 'Richiedi ricevute quando la spesa supera questo importo, salvo che una regola di categoria disponga diversamente.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `L’importo non può essere superiore all’importo richiesto per la ricevuta dettagliata (${amount})`,
                itemizedReceiptRequiredAmount: 'Importo richiesto per ricevuta dettagliata',
                itemizedReceiptRequiredAmountDescription: 'Richiedi ricevute dettagliate quando la spesa supera questo importo, a meno che non sia sostituito da una regola di categoria.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `L’importo non può essere inferiore all’importo richiesto per le ricevute normali (${amount})`,
                maxExpenseAmount: 'Importo massimo spesa',
                maxExpenseAmountDescription: 'Contrassegna le spese che superano questo importo, salvo diversa indicazione da una regola di categoria.',
                maxAge: 'Età massima',
                maxExpenseAge: 'Età massima spesa',
                maxExpenseAgeDescription: 'Segnala le spese più vecchie di un numero specifico di giorni.',
                maxExpenseAgeDays: () => ({
                    one: '1 giorno',
                    other: (count: number) => `${count} giorni`,
                }),
                cashExpenseDefault: 'Impostazione predefinita spesa in contanti',
                cashExpenseDefaultDescription:
                    'Scegli come devono essere create le spese in contanti. Una spesa è considerata in contanti se non è una transazione di carta aziendale importata. Questo include le spese create manualmente, le ricevute, le indennità di diaria, le spese chilometriche e le spese basate sul tempo.',
                reimbursableDefault: 'Rimborsabile',
                reimbursableDefaultDescription: 'Le spese vengono per lo più rimborsate ai dipendenti',
                nonReimbursableDefault: 'Non rimborsabile',
                nonReimbursableDefaultDescription: 'Le spese vengono occasionalmente rimborsate ai dipendenti',
                alwaysReimbursable: 'Sempre rimborsabile',
                alwaysReimbursableDescription: 'Le spese sono sempre rimborsate ai dipendenti',
                alwaysNonReimbursable: 'Sempre non rimborsabile',
                alwaysNonReimbursableDescription: 'Le spese non vengono mai rimborsate ai dipendenti',
                billableDefault: 'Addebito predefinito',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Scegli se le spese in contanti e con carta di credito devono essere fatturabili per impostazione predefinita. Le spese fatturabili sono abilitate o disabilitate nei <a href="${tagsPageLink}">tag</a>.</muted-text>`,
                billable: 'Fatturabile',
                billableDescription: 'Le spese vengono più spesso riaddebitate ai clienti',
                nonBillable: 'Non rimborsabile',
                nonBillableDescription: 'Le spese vengono occasionalmente riaddebitate ai clienti',
                eReceipts: 'Ricevute elettroniche',
                eReceiptsHint: `Le eReceipt vengono create automaticamente [per la maggior parte delle transazioni con carta in USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Monitoraggio partecipanti',
                attendeeTrackingHint: 'Tieni traccia del costo per persona per ogni spesa.',
                prohibitedDefaultDescription:
                    'Contrassegna tutte le ricevute in cui compaiono alcolici, gioco d’azzardo o altri articoli soggetti a restrizioni. Le spese con ricevute che includono queste voci richiederanno una revisione manuale.',
                prohibitedExpenses: 'Spese vietate',
                alcohol: 'Alcol',
                hotelIncidentals: 'Spese accessorie dell’hotel',
                gambling: 'Gioco d’azzardo',
                tobacco: 'Tabacco',
                adultEntertainment: 'Intrattenimento per adulti',
                requireCompanyCard: 'Richiedi le carte aziendali per tutti gli acquisti',
                requireCompanyCardDescription: 'Contrassegna tutte le spese in contanti, incluse le spese chilometriche e le diarie.',
            },
            expenseReportRules: {
                title: 'Avanzate',
                subtitle: 'Automatizza la conformità, le approvazioni e i pagamenti dei report spese.',
                preventSelfApprovalsTitle: 'Impedisci le auto-approvazioni',
                preventSelfApprovalsSubtitle: 'Impedisci ai membri dell’area di lavoro di approvare i propri report spese.',
                autoApproveCompliantReportsTitle: 'Approva automaticamente i report conformi',
                autoApproveCompliantReportsSubtitle: 'Configura quali note spese sono idonee per l’approvazione automatica.',
                autoApproveReportsUnderTitle: 'Approva automaticamente i report inferiori a',
                autoApproveReportsUnderDescription: 'Le note spese completamente conformi inferiori a questo importo saranno approvate automaticamente.',
                randomReportAuditTitle: 'Verifica casuale del report',
                randomReportAuditDescription: 'Richiedi che alcuni report siano approvati manualmente, anche se idonei per l’approvazione automatica.',
                autoPayApprovedReportsTitle: 'Pagamento automatico delle note approvate',
                autoPayApprovedReportsSubtitle: 'Configura quali note spese sono idonee per il pagamento automatico.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Inserisci un importo inferiore a ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Vai su altre funzionalità e abilita i workflow, quindi aggiungi i pagamenti per sbloccare questa funzionalità.',
                autoPayReportsUnderTitle: 'Imposta pagamento automatico dei rapporti in',
                autoPayReportsUnderDescription: 'Le note spese completamente conformi inferiori a questo importo saranno rimborsate automaticamente.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Aggiungi ${featureName} per sbloccare questa funzionalità.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Vai a [altre funzionalità](${moreFeaturesLink}) e abilita ${featureName} per sbloccare questa funzione.`,
            },
            merchantRules: {
                title: 'Commerciante',
                subtitle: 'Imposta le regole per gli esercenti in modo che le spese arrivino già codificate correttamente e richiedano meno correzioni.',
                addRule: 'Aggiungi regola esercente',
                addRuleTitle: 'Aggiungi regola',
                editRuleTitle: 'Modifica regola',
                expensesWith: 'Per le spese con:',
                expensesExactlyMatching: 'Per le spese che corrispondono esattamente a:',
                applyUpdates: 'Applica questi aggiornamenti:',
                saveRule: 'Salva regola',
                previewMatches: 'Anteprima corrispondenze',
                confirmError: 'Inserisci l’esercente e applica almeno un aggiornamento',
                confirmErrorMerchant: 'Inserisci commerciante',
                confirmErrorUpdate: 'Applica almeno un aggiornamento',
                previewMatchesEmptyStateTitle: 'Niente da mostrare',
                previewMatchesEmptyStateSubtitle: 'Nessuna spesa non inviata corrisponde a questa regola.',
                deleteRule: 'Elimina regola',
                deleteRuleConfirmation: 'Sei sicuro di voler eliminare questa regola?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Se l’esercente ${isExactMatch ? 'corrisponde esattamente' : 'contiene'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Rinomina esercente in "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Aggiorna ${fieldName} in "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Contrassegna come "${reimbursable ? 'rimborsabile' : 'non rimborsabile'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Contrassegna come "${billable ? 'fatturabile' : 'non fatturabile'}"`,
                matchType: 'Tipo di corrispondenza',
                matchTypeContains: 'Contiene',
                matchTypeExact: 'Corrisponde esattamente',
                duplicateRuleTitle: 'Esiste già una regola simile per l’esercente',
                duplicateRulePrompt: (merchantName: string) => `Vuoi salvare una nuova regola per «${merchantName}» anche se ne hai già una esistente?`,
                saveAnyway: 'Salva comunque',
                applyToExistingUnsubmittedExpenses: 'Applica alle spese esistenti non inviate',
            },
            categoryRules: {
                title: 'Regole di categoria',
                approver: 'Approvante',
                requireDescription: 'Descrizione obbligatoria',
                requireFields: 'Campi obbligatori',
                requiredFieldsTitle: 'Campi obbligatori',
                requiredFieldsDescription: (categoryName: string) => `Questo verrà applicato a tutte le spese categorizzate come <strong>${categoryName}</strong>.`,
                requireAttendees: 'Rendi obbligatoria la partecipazione',
                descriptionHint: 'Suggerimento descrizione',
                descriptionHintDescription: (categoryName: string) =>
                    `Ricorda a chi sostiene spese di fornire informazioni aggiuntive per le spese di “${categoryName}”. Questo suggerimento appare nel campo descrizione delle spese.`,
                descriptionHintLabel: 'Suggerimento',
                descriptionHintSubtitle: 'Suggerimento: più è breve, meglio è!',
                maxAmount: 'Importo massimo',
                flagAmountsOver: 'Segnala importi superiori a',
                flagAmountsOverDescription: (categoryName: string) => `Si applica alla categoria “${categoryName}”.`,
                flagAmountsOverSubtitle: 'Questo sostituisce l’importo massimo per tutte le spese.',
                expenseLimitTypes: {
                    expense: 'Spesa individuale',
                    expenseSubtitle:
                        'Contrassegna gli importi delle spese per categoria. Questa regola sostituisce la regola generale dello spazio di lavoro per l’importo massimo della spesa.',
                    daily: 'Totale categoria',
                    dailySubtitle: 'Contrassegna la spesa totale giornaliera per categoria per ogni report di spesa.',
                },
                requireReceiptsOver: 'Richiedi ricevute superiori a',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Predefinito`,
                    never: 'Non richiedere mai ricevute',
                    always: 'Richiedi sempre le ricevute',
                },
                requireItemizedReceiptsOver: 'Richiedi ricevute dettagliate superiori a',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Predefinito`,
                    never: 'Non richiedere mai ricevute dettagliate',
                    always: 'Richiedi sempre ricevute dettagliate',
                },
                defaultTaxRate: 'Aliquota fiscale predefinita',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Vai su [Altre funzionalità](${moreFeaturesLink}) e abilita i workflow, quindi aggiungi le approvazioni per sbloccare questa funzione.`,
            },
            customRules: {
                title: 'Policy di spesa',
                cardSubtitle: 'Qui trovi la policy spese del tuo team, così tutti sono allineati su ciò che è coperto.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Riscossi',
                    description: 'Per i team che vogliono automatizzare i propri processi.',
                },
                corporate: {
                    label: 'Controllo',
                    description: 'Per organizzazioni con requisiti avanzati.',
                },
            },
            description: 'Scegli il piano più adatto a te. Per un elenco dettagliato di funzionalità e prezzi, consulta la nostra',
            subscriptionLink: 'pagina di assistenza su tipi di piano e prezzi',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Hai sottoscritto 1 membro attivo nel piano Control fino alla fine del tuo abbonamento annuale il ${annualSubscriptionEndDate}. Puoi passare a un abbonamento a consumo e effettuare il downgrade al piano Collect a partire dal ${annualSubscriptionEndDate} disattivando il rinnovo automatico in`,
                other: `Ti sei impegnato per ${count} membri attivi nel piano Control fino alla fine dell’abbonamento annuale, il ${annualSubscriptionEndDate}. A partire dal ${annualSubscriptionEndDate} puoi passare a un abbonamento a consumo e effettuare il downgrade al piano Collect disattivando il rinnovo automatico in`,
            }),
            subscriptions: 'Abbonamenti',
        },
    },
    getAssistancePage: {
        title: 'Ottieni assistenza',
        subtitle: 'Siamo qui per spianarti la strada verso la grandezza!',
        description: 'Scegli una delle opzioni di assistenza qui sotto:',
        chatWithConcierge: 'Chatta con Concierge',
        scheduleSetupCall: 'Pianifica una chiamata di configurazione',
        scheduleACall: 'Programma chiamata',
        questionMarkButtonTooltip: 'Ottieni assistenza dal nostro team',
        exploreHelpDocs: 'Esplora la guida',
        registerForWebinar: 'Registrati al webinar',
        onboardingHelp: 'Guida alla configurazione',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Cambia il tono della pelle predefinito',
        headers: {
            frequentlyUsed: 'Usati di frequente',
            smileysAndEmotion: 'Faccine ed emozioni',
            peopleAndBody: 'Persone e corpo',
            animalsAndNature: 'Animali e natura',
            foodAndDrink: 'Cibo e bevande',
            travelAndPlaces: 'Viaggi e luoghi',
            activities: 'Attività',
            objects: 'Oggetti',
            symbols: 'Simboli',
            flags: 'Flag',
        },
    },
    newRoomPage: {
        newRoom: 'Nuova stanza',
        groupName: 'Nome gruppo',
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
        pleaseSelectWorkspace: 'Seleziona uno spazio di lavoro',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor} rinominato in "${newName}" (in precedenza "${oldName}")` : `${actor} ha rinominato questa stanza in "${newName}" (in precedenza "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Stanza rinominata in ${newName}`,
        social: 'sociale',
        selectAWorkspace: 'Seleziona uno spazio di lavoro',
        growlMessageOnRenameError: 'Impossibile rinominare la stanza dello spazio di lavoro. Controlla la connessione e riprova.',
        visibilityOptions: {
            restricted: 'Workspace', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privato',
            public: 'Pubblico',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Annuncio pubblico',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Invia e chiudi',
        submitAndApprove: 'Invia e approva',
        advanced: 'AVANZATE',
        dynamicExternal: 'DINAMICO_ESTERNO',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `imposta il conto bancario aziendale predefinito su "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `ha rimosso il conto bancario aziendale predefinito "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `ha cambiato il conto bancario aziendale predefinito in "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (in precedenza "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `ha modificato l’indirizzo dell’azienda in “${newAddress}” (in precedenza “${previousAddress}”)` : `imposta l’indirizzo dell’azienda su "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `ha aggiunto ${approverName} (${approverEmail}) come approvatore per il campo ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `ha rimosso ${approverName} (${approverEmail}) come approvatore per il campo ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `ha cambiato l'approvatore per il campo ${field} «${name}» in ${formatApprover(newApproverName, newApproverEmail)} (in precedenza ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `ha aggiunto la categoria "${categoryName}"`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `ha rimosso la categoria "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'disattivato' : 'abilitato'} la categoria "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `ha aggiunto il codice paghe "${newValue}" alla categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `ha rimosso il codice paghe "${oldValue}" dalla categoria "${categoryName}"`;
            }
            return `ha modificato il codice paghe della categoria "${categoryName}" in “${newValue}” (precedentemente “${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `ha aggiunto il codice GL "${newValue}" alla categoria "${categoryName}"`;
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
            return `ha modificato l’importo massimo della categoria "${categoryName}" a ${newAmount} (precedentemente ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `ha aggiunto un tipo di limite di ${newValue} alla categoria "${categoryName}"`;
            }
            return `ha modificato il tipo di limite della categoria "${categoryName}" in ${newValue} (precedentemente ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `ha aggiornato la categoria "${categoryName}" modificando Ricevute in ${newValue}`;
            }
            return `ha modificato la categoria "${categoryName}" in ${newValue} (precedentemente ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `ha aggiornato la categoria "${categoryName}" modificando Ricevute dettagliate in ${newValue}`;
            }
            return `ha modificato la voce Ricevute dettagliate della categoria "${categoryName}" in ${newValue} (in precedenza ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `ha rinominato la categoria "${oldName}" in "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `ha rimosso il suggerimento di descrizione "${oldValue}" dalla categoria "${categoryName}"`;
            }
            return !oldValue
                ? `ha aggiunto il suggerimento di descrizione "${newValue}" alla categoria "${categoryName}"`
                : `ha modificato il suggerimento della descrizione della categoria "${categoryName}" in “${newValue}” (in precedenza “${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `ha cambiato il nome dell'elenco di tag in "${newName}" (precedentemente "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `ha aggiunto il tag "${tagName}" all'elenco "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `ha aggiornato l’elenco dei tag "${tagListName}" cambiando il tag "${oldName}" in "${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'abilitato' : 'disattivato'} il tag "${tagName}" nella lista "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `ha rimosso il tag «${tagName}» dall’elenco «${tagListName}»`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `rimosso "${count}" tag dall'elenco "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `ha aggiornato il tag "${tagName}" nell'elenco "${tagListName}" cambiando ${updatedField} in "${newValue}" (in precedenza "${oldValue}")`;
            }
            return `ha aggiornato il tag "${tagName}" nell'elenco "${tagListName}" aggiungendo un ${updatedField} di "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `ha modificato ${customUnitName} ${updatedField} in "${newValue}" (precedentemente "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Monitoraggio fiscale ${newValue ? 'abilitato' : 'disattivato'} sulle tariffe chilometriche`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `ha aggiunto una nuova tariffa "${rateName}" per "${customUnitName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `ha modificato la tariffa di ${customUnitName} ${updatedField} "${customUnitRateName}" in "${newValue}" (in precedenza "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `ha modificato l’aliquota fiscale sulla tariffa distanza "${customUnitRateName}" in "${newValue} (${newTaxPercentage})" (in precedenza "${oldValue} (${oldTaxPercentage})")`;
            }
            return `ha aggiunto l'aliquota fiscale "${newValue} (${newTaxPercentage})" alla tariffa chilometrica "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `ha modificato la parte rimborsabile delle tasse sulla tariffa distanza "${customUnitRateName}" a "${newValue}" (in precedenza "${oldValue}")`;
            }
            return `ha aggiunto una parte rimborsabile delle tasse di "${newValue}" alla tariffa per distanza "${customUnitRateName}`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'abilitato' : 'disattivato'} la tariffa ${customUnitName} "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `ha rimosso la tariffa di "${customUnitName}" "${rateName}"`,
        addedReportField: (fieldType: string, fieldName?: string) => `aggiunto il campo report ${fieldType} "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `imposta il valore predefinito del campo report "${fieldName}" su "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `ha aggiunto l’opzione «${optionName}» al campo del report «${fieldName}»`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `ha rimosso l’opzione «${optionName}» dal campo del report «${fieldName}»`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'abilitato' : 'disattivato'} l'opzione "${optionName}" per il campo del report "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'abilitato' : 'disattivato'} tutte le opzioni per il campo del report "${fieldName}"`;
            }
            return `${allEnabled ? 'abilitato' : 'disattivato'} l’opzione "${optionName}" per il campo del report "${fieldName}", rendendo tutte le opzioni ${allEnabled ? 'abilitato' : 'disattivato'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `ha rimosso il campo ${fieldType} del report "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `aggiornato "Impedisci l'auto-approvazione" in "${newValue === 'true' ? 'Abilitato' : 'Disattivato'}" (precedentemente "${oldValue === 'true' ? 'Abilitato' : 'Disattivato'}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `imposta la data di invio del report mensile su "${newValue}"`;
            }
            return `ha aggiornato la data di invio del rapporto mensile a "${newValue}" (in precedenza "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aggiornato "Rifattura le spese ai clienti" in "${newValue}" (in precedenza "${oldValue}")`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `ha aggiornato "Impostazione predefinita per le spese in contanti" a "${newValue}" (in precedenza "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `ha attivato "Applica titoli predefiniti ai report" ${value ? 'attivo' : 'disattivato'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `ha modificato la formula del nome del report personalizzato in "${newValue}" (in precedenza "${oldValue}")`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) =>
            `ha aggiornato il nome di questo spazio di lavoro in "${newName}" (precedentemente "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `imposta la descrizione di questo spazio di lavoro su "${newDescription}"`
                : `ha aggiornato la descrizione di questo spazio di lavoro in "${newDescription}" (precedentemente "${oldDescription}")`,
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
                one: `ti ha rimosso dal workflow di approvazione e dalla chat spese di ${joinedNames}. Le note spese inviate in precedenza resteranno disponibili per l’approvazione nella tua Posta in arrivo.`,
                other: `ti ha rimosso dai flussi di approvazione e dalle chat spese di ${joinedNames}. I report inviati in precedenza rimarranno disponibili per l’approvazione nella tua Posta in arrivo.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `ha aggiornato il tuo ruolo in ${policyName} da ${oldRole} a utente. Sei statə rimosso da tutte le chat spese dei mittenti tranne che dalla tua.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `ha aggiornato la valuta predefinita in ${newCurrency} (precedentemente ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `ha aggiornato la frequenza di creazione automatica dei report in "${newFrequency}" (in precedenza "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `ha aggiornato la modalità di approvazione in "${newValue}" (precedentemente "${oldValue}")`,
        upgradedWorkspace: 'ha aggiornato questo spazio di lavoro al piano Control',
        forcedCorporateUpgrade: `Questo workspace è stato aggiornato al piano Control. Fai clic <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">qui</a> per maggiori informazioni.`,
        downgradedWorkspace: 'ha declassato questo spazio di lavoro al piano Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `ha modificato la percentuale di rapporti instradati casualmente per l’approvazione manuale a ${Math.round(newAuditRate * 100)}% (in precedenza ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `ha modificato il limite di approvazione manuale per tutte le spese a ${newLimit} (precedentemente ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'abilitato' : 'disattivato'} categorie`;
                case 'tags':
                    return `${enabled ? 'abilitato' : 'disattivato'} tag`;
                case 'workflows':
                    return `workflow ${enabled ? 'abilitato' : 'disattivato'}`;
                case 'distance rates':
                    return `Tariffe di distanza ${enabled ? 'abilitato' : 'disattivato'}`;
                case 'accounting':
                    return `${enabled ? 'abilitato' : 'disattivato'} contabilità`;
                case 'Expensify Cards':
                    return `${enabled ? 'abilitato' : 'disattivato'} Carte Expensify`;
                case 'company cards':
                    return `${enabled ? 'abilitato' : 'disattivato'} carte aziendali`;
                case 'invoicing':
                    return `Fatturazione ${enabled ? 'abilitato' : 'disattivato'}`;
                case 'per diem':
                    return `${enabled ? 'abilitato' : 'disattivato'} diaria`;
                case 'receipt partners':
                    return `partner ricevute ${enabled ? 'abilitato' : 'disattivato'}`;
                case 'rules':
                    return `${enabled ? 'abilitato' : 'disattivato'} regole`;
                case 'tax tracking':
                    return `Monitoraggio imposta ${enabled ? 'abilitato' : 'disattivato'}`;
                default:
                    return `${enabled ? 'abilitato' : 'disattivato'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `monitoraggio dei partecipanti ${enabled ? 'abilitato' : 'disattivato'}`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'abilitato' : 'disattivato'} report con approvazione automatica`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `imposta la soglia per l'autopagamento dei report approvati su "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `ha modificato la soglia per i report approvati con pagamento automatico a "${newLimit}" (in precedenza "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: 'ha rimosso la soglia di approvazione automatica dei report pagati automaticamente',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover
                ? `ha modificato l'approvatore predefinito in ${newApprover} (precedentemente ${previousApprover})`
                : `ha modificato l'approvatore predefinito in ${newApprover}`,
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
            let text = `ha modificato il flusso di approvazione per ${members} per inviare i report a ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `(approvatore predefinito precedente ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(in precedenza approvatore predefinito)';
            } else if (previousApprover) {
                text += `(precedentemente ${previousApprover})`;
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
                ? `ha modificato il flusso di approvazione per ${members} affinché inviino i report all’approvatore predefinito ${approver}`
                : `ha modificato il workflow di approvazione per ${members} per inviare i report all'approvatore predefinito`;
            if (wasDefaultApprover && previousApprover) {
                text += `(approvatore predefinito precedente ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(in precedenza approvatore predefinito)';
            } else if (previousApprover) {
                text += `(precedentemente ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `ha modificato il flusso di approvazione per ${approver} per inoltrare le note spese approvate a ${forwardsTo} (in precedenza inoltrate a ${previousForwardsTo})`
                : `ha modificato il flusso di approvazione per ${approver} per inoltrare le note spese approvate a ${forwardsTo} (in precedenza solo le note spese definitivamente approvate)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `ha modificato il flusso di approvazione per ${approver} in modo che smetta di inoltrare le note spese approvate (in precedenza inoltrate a ${previousForwardsTo})`
                : `ha modificato il flusso di approvazione per ${approver} in modo da interrompere l’inoltro delle note spese approvate`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `ha modificato il nome azienda in fattura in "${newValue}" (precedentemente "${oldValue}")` : `imposta il nome azienda della fattura su "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `ha cambiato il sito web dell’azienda della fattura in "${newValue}" (precedentemente "${oldValue}")` : `imposta il sito web dell’azienda in fattura su "${newValue}"`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `ha modificato il pagatore autorizzato in "${newReimburser}" (precedentemente "${previousReimburser}")`
                : `ha modificato il pagatore autorizzato in "${newReimburser}"`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'abilitato' : 'disattivato'} rimborsi`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `ha aggiunto l'imposta «${taxName}»`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `ha rimosso l'imposta "${taxName}"`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `ha rinominato l’imposta da "${oldValue}" a "${newValue}"`;
                }
                case 'code': {
                    return `ha modificato il codice fiscale per "${taxName}" da "${oldValue}" a "${newValue}"`;
                }
                case 'rate': {
                    return `ha modificato l’aliquota fiscale per "${taxName}" da "${oldValue}" a "${newValue}"`;
                }
                case 'enabled': {
                    return `${oldValue ? 'disattivato' : 'abilitato'} l’imposta "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `imposta l’importo richiesto per la ricevuta su "${newValue}"`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `ha modificato l’importo richiesto per la ricevuta a "${newValue}" (precedentemente "${oldValue}")`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `rimosso importo obbligatorio della ricevuta (precedentemente "${oldValue}")`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `imposta l’importo massimo della spesa su "${newValue}"`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `ha modificato l'importo massimo della spesa a "${newValue}" (in precedenza "${oldValue}")`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `rimosso l'importo massimo di spesa (precedentemente "${oldValue}")`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `imposta l’età massima della spesa a "${newValue}" giorni`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `ha modificato l’età massima della spesa a "${newValue}" giorni (in precedenza "${oldValue}")`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `ha rimosso l’anzianità massima delle spese (in precedenza “${oldValue}” giorni)`,
    },
    roomMembersPage: {
        memberNotFound: 'Membro non trovato.',
        useInviteButton: 'Per invitare un nuovo membro alla chat, utilizza il pulsante di invito qui sopra.',
        notAuthorized: `Non hai accesso a questa pagina. Se stai tentando di unirti a questa stanza, chiedi semplicemente a un membro della stanza di aggiungerti. Qualcos'altro? Contatta ${CONST.EMAIL.CONCIERGE}`,
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
        action: 'Completato',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `attività per ${title}`,
            completed: 'segnato come completato',
            canceled: 'attività eliminata',
            reopened: 'segnato come incompleto',
            error: "Non hai l'autorizzazione per eseguire l'azione richiesta",
        },
        markAsComplete: 'Segna come completato',
        markAsIncomplete: 'Segna come incompleto',
        assigneeError: 'Si è verificato un errore durante l’assegnazione di questa attività. Prova a selezionare un altro assegnatario.',
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
            openShortcutDialog: 'Apre la finestra di scelta rapida da tastiera',
            markAllMessagesAsRead: 'Segna tutti i messaggi come letti',
            escape: 'Esegui le finestre di dialogo',
            search: 'Apri finestra di ricerca',
            newChat: 'Nuova schermata chat',
            copy: 'Copia commento',
            openDebug: 'Apri la finestra delle preferenze di test',
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
                subtitle: `Prova a modificare i criteri di ricerca o a creare qualcosa con il pulsante +.`,
            },
            emptyExpenseResults: {
                title: 'Non hai ancora creato nessuna spesa',
                subtitle: 'Crea una spesa o fai un giro di prova su Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per creare una spesa.',
            },
            emptyReportResults: {
                title: 'Non hai ancora creato alcun report',
                subtitle: 'Crea un report o prova Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per creare un report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Non hai ancora creato
                    alcuna fattura
                `),
                subtitle: 'Invia una fattura o fai un giro di prova con Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per inviare una fattura.',
            },
            emptyTripResults: {
                title: 'Nessun viaggio da visualizzare',
                subtitle: 'Inizia prenotando il tuo primo viaggio qui sotto.',
                buttonText: 'Prenota un viaggio',
            },
            emptySubmitResults: {
                title: 'Nessuna spesa da inviare',
                subtitle: 'Tutto a posto. Goditi il giro della vittoria!',
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
                subtitle: 'È ora di prendertela comoda, bel lavoro.',
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
        columns: 'Colonne',
        resetColumns: 'Reimposta colonne',
        groupColumns: 'Raggruppa colonne',
        expenseColumns: 'Colonne di spesa',
        statements: 'Estratti conto',
        unapprovedCash: 'Contanti non approvati',
        unapprovedCard: 'Carta non approvata',
        reconciliation: 'Riconciliazione',
        topSpenders: 'Maggiori spendaccioni',
        saveSearch: 'Salva ricerca',
        deleteSavedSearch: 'Elimina ricerca salvata',
        deleteSavedSearchConfirm: 'Sei sicuro di voler eliminare questa ricerca?',
        searchName: 'Cerca nome',
        savedSearchesMenuItemTitle: 'Salvato',
        topCategories: 'Categorie principali',
        topMerchants: 'Migliori esercenti',
        groupedExpenses: 'spese raggruppate',
        bulkActions: {
            approve: 'Approva',
            pay: 'Paga',
            delete: 'Elimina',
            hold: 'In sospeso',
            unhold: 'Rimuovi sospensione',
            reject: 'Rifiuta',
            noOptionsAvailable: 'Nessuna opzione disponibile per il gruppo di spese selezionato.',
        },
        filtersHeader: 'Filtri',
        filters: {
            date: {
                before: (date?: string) => `Prima di ${date ?? ''}`,
                after: (date?: string) => `Dopo ${date ?? ''}`,
                on: (date?: string) => `Su ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Mai',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Lo scorso mese',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Questo mese',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Da inizio anno',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Ultimo estratto conto',
                },
            },
            status: 'Stato',
            keyword: 'Parola chiave',
            keywords: 'Parole chiave',
            limit: 'Limite',
            limitDescription: 'Imposta un limite per i risultati della tua ricerca.',
            currency: 'Valuta',
            completed: 'Completato',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Meno di ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Maggiore di ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `Tra ${greaterThan} e ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Uguale a ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Carte individuali',
                closedCards: 'Carte chiuse',
                cardFeeds: 'Flussi carta',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Tutti i ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Tutte le carte CSV importate${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} è ${value}`,
            current: 'Corrente',
            past: 'Passato',
            submitted: 'Inviato',
            approved: 'Approvato',
            paid: 'Pagato',
            exported: 'Esportato',
            posted: 'Registrato',
            withdrawn: 'Ritirato',
            billable: 'Fatturabile',
            reimbursable: 'Rimborsabile',
            purchaseCurrency: 'Valuta di acquisto',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'Da',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Carta',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'ID prelievo',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Categoria',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Commerciante',
                [CONST.SEARCH.GROUP_BY.TAG]: 'Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: 'Mese',
                [CONST.SEARCH.GROUP_BY.WEEK]: 'Settimana',
                [CONST.SEARCH.GROUP_BY.YEAR]: 'Anno',
                [CONST.SEARCH.GROUP_BY.QUARTER]: 'Trimestre',
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
        view: {
            label: 'Visualizza',
            table: 'Tabella',
            bar: 'Bar',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: 'Da',
            [CONST.SEARCH.GROUP_BY.CARD]: 'Carte',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Esportazioni',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Categorie',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Esercenti',
            [CONST.SEARCH.GROUP_BY.TAG]: 'Tag',
            [CONST.SEARCH.GROUP_BY.MONTH]: 'Mesi',
            [CONST.SEARCH.GROUP_BY.WEEK]: 'Settimane',
            [CONST.SEARCH.GROUP_BY.YEAR]: 'Anni',
            [CONST.SEARCH.GROUP_BY.QUARTER]: 'Trimestri',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Questo report non ha spese.',
            accessPlaceHolder: 'Apri per i dettagli',
        },
        noCategory: 'Nessuna categoria',
        noMerchant: 'Nessun esercente',
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
            description: 'Accidenti, sono davvero tanti elementi! Li raggrupperemo e Concierge ti invierà a breve un file.',
        },
        exportedTo: 'Esportato in',
        exportAll: {
            selectAllMatchingItems: 'Seleziona tutti gli elementi corrispondenti',
            allMatchingItemsSelected: 'Tutti gli elementi corrispondenti selezionati',
        },
    },
    genericErrorPage: {
        title: 'Ops, qualcosa è andato storto!',
        body: {
            helpTextMobile: "Chiudi e riapri l'app oppure passa a",
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
                'Controlla la cartella delle foto o dei download per una copia del tuo codice QR. Suggerimento: aggiungilo a una presentazione così il tuo pubblico potrà scansionalo e connettersi direttamente con te.',
        },
        generalError: {
            title: 'Errore allegato',
            message: "Impossibile scaricare l'allegato",
        },
        permissionError: {
            title: 'Accesso all’archiviazione',
            message: 'Expensify non può salvare gli allegati senza l’accesso all’archiviazione. Tocca impostazioni per aggiornare le autorizzazioni.',
        },
    },
    settlement: {
        status: {
            pending: 'In sospeso',
            cleared: 'Liquidato',
            failed: 'Non riuscito',
        },
        failedError: ({link}: {link: string}) => `Riproveremo a elaborare questo pagamento quando <a href="${link}">sbloccherai il tuo account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • ID prelievo: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Layout report',
        groupByLabel: 'Raggruppa per:',
        selectGroupByOption: 'Seleziona come raggruppare le spese del rapporto',
        uncategorized: 'Senza categoria',
        noTag: 'Nessun tag',
        selectGroup: ({groupName}: {groupName: string}) => `Seleziona tutte le spese in ${groupName}`,
        groupBy: {
            category: 'Categoria',
            tag: 'Tag',
        },
    },
    report: {
        newReport: {
            createExpense: 'Crea spesa',
            createReport: 'Crea report',
            chooseWorkspace: 'Scegli uno spazio di lavoro per questo report.',
            emptyReportConfirmationTitle: 'Hai già un rapporto vuoto',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Sei sicuro di voler creare un altro report in ${workspaceName}? Puoi accedere ai tuoi report vuoti in`,
            emptyReportConfirmationPromptLink: 'Report',
            emptyReportConfirmationDontShowAgain: 'Non mostrarlo più',
            genericWorkspaceName: 'questo spazio di lavoro',
        },
        genericCreateReportFailureMessage: 'Errore imprevisto durante la creazione di questa chat. Riprova più tardi.',
        genericAddCommentFailureMessage: 'Errore imprevisto durante la pubblicazione del commento. Riprova più tardi.',
        genericUpdateReportFieldFailureMessage: 'Errore imprevisto durante l’aggiornamento del campo. Riprova più tardi.',
        genericUpdateReportNameEditFailureMessage: 'Errore imprevisto durante la rinomina del report. Riprova più tardi.',
        noActivityYet: 'Nessuna attività ancora',
        connectionSettings: 'Impostazioni di connessione',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `ha modificato ${fieldName} in "${newValue}" (precedentemente "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `imposta ${fieldName} su "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `ha modificato lo spazio di lavoro${fromPolicyName ? `(precedentemente ${fromPolicyName})` : ''}`;
                    }
                    return `ha modificato lo spazio di lavoro in ${toPolicyName}${fromPolicyName ? `(precedentemente ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `ha cambiato il tipo da ${oldType} a ${newType}`,
                exportedToCSV: `esportato in CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `esportato in ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `esportato su ${label} tramite`,
                    automaticActionTwo: 'impostazioni contabilità',
                    manual: (label: string) => `ha contrassegnato questo resoconto come esportato manualmente in ${label}.`,
                    automaticActionThree: 'e ha creato correttamente un record per',
                    reimburseableLink: 'spese vive',
                    nonReimbursableLink: 'spese con carta aziendale',
                    pending: (label: string) => `ha iniziato a esportare questo report in ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `impossibile esportare questo report in ${label} ("${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `ha aggiunto una ricevuta`,
                managerDetachReceipt: `ha rimosso una ricevuta`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `pagato ${currency}${amount} altrove`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `ha pagato ${currency}${amount} tramite integrazione`,
                outdatedBankAccount: `non è stato possibile elaborare il pagamento a causa di un problema con il conto bancario del pagatore`,
                reimbursementACHBounce: `impossibile elaborare il pagamento a causa di un problema con il conto bancario`,
                reimbursementACHCancelled: `ha annullato il pagamento`,
                reimbursementAccountChanged: `impossibile elaborare il pagamento, poiché il pagatore ha cambiato conto bancario`,
                reimbursementDelayed: `ha elaborato il pagamento ma è in ritardo di 1-2 ulteriori giorni lavorativi`,
                selectedForRandomAudit: `selezionato casualmente per la revisione`,
                selectedForRandomAuditMarkdown: `[selezionato casualmente](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) per la revisione`,
                share: ({to}: ShareParams) => `ha invitato il membro ${to}`,
                unshare: ({to}: UnshareParams) => `ha rimosso il membro ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `pagato ${currency}${amount}`,
                takeControl: `ha preso il controllo`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `si è verificato un problema di sincronizzazione con ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Risolvi il problema nelle <a href="${workspaceAccountingLink}">impostazioni della workspace</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `La connessione ${feedName} è interrotta. Per ripristinare l’importazione delle carte, <a href='${workspaceCompanyCardRoute}'>accedi alla tua banca</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `la connessione Plaid al conto bancario aziendale non funziona. Per favore, <a href='${walletRoute}'>ricollega il conto bancario ${maskedAccountNumber}</a> per poter continuare a usare le tue Expensify Card.`,
                addEmployee: (email: string, role: string) => `aggiunto ${email} come ${role === 'member' ? 'a' : 'un'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `ha aggiornato il ruolo di ${email} in ${newRole} (in precedenza ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `rimossa la personalizzazione del campo 1 di ${email} (precedentemente "${previousValue}")`;
                    }
                    return !previousValue
                        ? `ha aggiunto "${newValue}" al campo personalizzato 1 di ${email}`
                        : `ha modificato il campo personalizzato 1 di ${email} in "${newValue}" (precedentemente "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `ha rimosso il campo personalizzato 2 di ${email} (in precedenza "${previousValue}")`;
                    }
                    return !previousValue
                        ? `ha aggiunto "${newValue}" al campo personalizzato 2 di ${email}`
                        : `ha modificato il campo personalizzato 2 di ${email} in "${newValue}" (precedentemente "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} ha lasciato lo spazio di lavoro`,
                removeMember: (email: string, role: string) => `ha rimosso ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `connessione a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} rimossa`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `collegato a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'ha lasciato la chat',
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `il conto bancario aziendale ${maskedBankAccountNumber} è stato bloccato automaticamente a causa di un problema con il rimborso o con la liquidazione della Carta Expensify. Risolvi il problema nelle <a href="${linkURL}">impostazioni dello spazio di lavoro</a>.`,
            },
            error: {
                invalidCredentials: 'Credenziali non valide, controlla la configurazione della connessione.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} per ${dayCount} ${dayCount === 1 ? 'giorno' : 'giorni'} fino al ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} dal ${timePeriod} del ${date}`,
    },
    footer: {
        features: 'Funzionalità',
        expenseManagement: 'Gestione spese',
        spendManagement: 'Gestione delle spese',
        expenseReports: 'Note spese',
        companyCreditCard: 'Carta di credito aziendale',
        receiptScanningApp: 'App di scansione ricevute',
        billPay: 'Pagamento fatture',
        invoicing: 'Fatturazione',
        CPACard: 'Carta CPA',
        payroll: 'Libro paga',
        travel: 'Viaggi',
        resources: 'Risorse',
        expensifyApproved: 'Approvato da Expensify!',
        pressKit: 'Kit stampa',
        support: 'Assistenza',
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
        navigateToChatsList: "Torna all'elenco chat",
        chatWelcomeMessage: 'Messaggio di benvenuto in chat',
        navigatesToChat: 'Va a una chat',
        newMessageLineIndicator: 'Indicatore di nuova riga di messaggio',
        chatMessage: 'Messaggio chat',
        lastChatMessagePreview: 'Anteprima ultimo messaggio chat',
        workspaceName: 'Nome spazio di lavoro',
        chatUserDisplayNames: 'Nomi visualizzati dei membri della chat',
        scrollToNewestMessages: 'Scorri ai messaggi più recenti',
        preStyledText: 'Testo preformattato',
        viewAttachment: 'Visualizza allegato',
    },
    parentReportAction: {
        deletedReport: 'Resoconto eliminato',
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
        flagDescription: 'Tutti i messaggi segnalati saranno inviati a un moderatore per la revisione.',
        chooseAReason: 'Scegli un motivo per la segnalazione qui sotto:',
        spam: 'Spam',
        spamDescription: 'Promozione indesiderata fuori tema',
        inconsiderate: 'Sgarbato',
        inconsiderateDescription: 'Formulazioni offensive o irrispettose, con intenzioni discutibili',
        intimidation: 'Intimidazione',
        intimidationDescription: 'Portare avanti con insistenza un programma nonostante obiezioni fondate',
        bullying: 'Bullismo',
        bullyingDescription: 'Prendere di mira una persona per ottenerne l’obbedienza',
        harassment: 'Molestie',
        harassmentDescription: 'Comportamento razzista, misogino o comunque ampiamente discriminatorio',
        assault: 'Aggressione',
        assaultDescription: 'Attacco emotivo specificamente mirato con l’intenzione di causare danno',
        flaggedContent: 'Questo messaggio è stato segnalato per violazione delle nostre regole della community e il contenuto è stato nascosto.',
        hideMessage: 'Nascondi messaggio',
        revealMessage: 'Mostra messaggio',
        levelOneResult: 'Invia un avviso anonimo e il messaggio viene segnalato per revisione.',
        levelTwoResult: 'Messaggio nascosto dal canale, più avviso anonimo e messaggio segnalato per revisione.',
        levelThreeResult: 'Messaggio rimosso dal canale, avviso anonimo inviato e messaggio segnalato per revisione.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Invita a inviare spese',
        inviteToChat: 'Invita solo alla chat',
        nothing: 'Non fare nulla',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accetta',
        decline: 'Rifiuta',
    },
    actionableMentionTrackExpense: {
        submit: 'Inoltra a qualcuno',
        categorize: 'Classificala',
        share: 'Condividilo con il mio commercialista',
        nothing: 'Niente per ora',
    },
    teachersUnitePage: {
        teachersUnite: 'Insegnanti uniti',
        joinExpensifyOrg:
            'Unisciti a Expensify.org per eliminare le ingiustizie in tutto il mondo. L’attuale campagna “Teachers Unite” sostiene gli insegnanti ovunque, dividendo i costi dei materiali scolastici essenziali.',
        iKnowATeacher: 'Conosco un insegnante',
        iAmATeacher: 'Sono un insegnante',
        getInTouch: 'Eccellente! Condividi le loro informazioni così possiamo metterci in contatto con loro.',
        introSchoolPrincipal: 'Presentazione del/lla dirigente scolastico',
        schoolPrincipalVerifyExpense:
            'Expensify.org divide il costo dei materiali scolastici essenziali in modo che gli studenti provenienti da famiglie a basso reddito possano avere un’esperienza di apprendimento migliore. Al/alla tuo/a preside verrà chiesto di verificare le tue spese.',
        principalFirstName: 'Nome di battesimo del titolare',
        principalLastName: 'Cognome del titolare',
        principalWorkEmail: 'Email di lavoro principale',
        updateYourEmail: 'Aggiorna il tuo indirizzo email',
        updateEmail: 'Aggiorna indirizzo email',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Prima di procedere, assicurati di impostare l’indirizzo email della scuola come metodo di contatto predefinito. Puoi farlo in Impostazioni > Profilo > <a href="${contactMethodsRoute}">Metodi di contatto</a>.`,
        error: {
            enterPhoneEmail: 'Inserisci un’email o un numero di telefono validi',
            enterEmail: "Inserisci un'email",
            enterValidEmail: "Inserisci un'email valida",
            tryDifferentEmail: "Prova con un'altra email",
        },
    },
    cardTransactions: {
        notActivated: 'Non attivato',
        outOfPocket: 'Spese vive',
        companySpend: 'Spese aziendali',
    },
    distance: {
        addStop: 'Aggiungi fermata',
        deleteWaypoint: 'Elimina waypoint',
        deleteWaypointConfirmation: 'Sei sicuro di voler eliminare questo waypoint?',
        address: 'Indirizzo',
        waypointDescription: {
            start: 'Avvia',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Mappa in sospeso',
            subtitle: 'La mappa verrà generata quando torni online',
            onlineSubtitle: 'Un momento mentre configuriamo la mappa',
            errorTitle: 'Errore mappa',
            errorSubtitle: 'Si è verificato un errore durante il caricamento della mappa. Riprova.',
        },
        error: {
            selectSuggestedAddress: 'Seleziona un indirizzo suggerito o usa la posizione attuale',
        },
        odometer: {
            startReading: 'Inizia a leggere',
            endReading: 'Fine lettura',
            saveForLater: 'Salva per dopo',
            totalDistance: 'Distanza totale',
        },
    },
    gps: {
        disclaimer: 'Usa il GPS per creare una spesa dal tuo viaggio. Tocca Avvia qui sotto per iniziare il tracciamento.',
        error: {
            failedToStart: 'Impossibile avviare il tracciamento della posizione.',
            failedToGetPermissions: 'Impossibile ottenere le autorizzazioni di posizione richieste.',
        },
        trackingDistance: 'Tracciamento della distanza in corso...',
        stopped: 'Interrotto',
        start: 'Avvia',
        stop: 'Stop',
        discard: 'Scarta',
        stopGpsTrackingModal: {
            title: 'Interrompi rilevamento GPS',
            prompt: 'Sei sicuro? Questo terminerà il tuo percorso attuale.',
            cancel: 'Riprendi monitoraggio',
            confirm: 'Interrompi rilevamento GPS',
        },
        discardDistanceTrackingModal: {
            title: 'Annulla rilevamento distanza',
            prompt: 'Sei sicurə? Questo annullerà il tuo percorso attuale e non potrà essere annullato.',
            confirm: 'Annulla rilevamento distanza',
        },
        zeroDistanceTripModal: {
            title: 'Impossibile creare la spesa',
            prompt: 'Non puoi creare una spesa con lo stesso luogo di partenza e di arrivo.',
        },
        locationRequiredModal: {
            title: 'Accesso alla posizione richiesto',
            prompt: 'Consenti l’accesso alla posizione nelle impostazioni del dispositivo per avviare il rilevamento della distanza tramite GPS.',
            allow: 'Consenti',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'È necessario l’accesso alla posizione in background',
            prompt: 'Consenti l’accesso alla posizione in background nelle impostazioni del dispositivo (opzione «Consenti sempre») per avviare il tracciamento della distanza tramite GPS.',
        },
        preciseLocationRequiredModal: {
            title: 'Posizione precisa richiesta',
            prompt: 'Attiva “posizione precisa” nelle impostazioni del dispositivo per iniziare il tracciamento della distanza tramite GPS.',
        },
        desktop: {
            title: 'Tieni traccia della distanza sul tuo telefono',
            subtitle: 'Registra automaticamente miglia o chilometri con il GPS e trasforma i viaggi in spese all’istante.',
            button: 'Scarica l’app',
        },
        notification: {
            title: 'Monitoraggio GPS in corso',
            body: "Vai all'app per completare",
        },
        continueGpsTripModal: {
            title: 'Continuare la registrazione del viaggio GPS?',
            prompt: 'Sembra che l’app si sia chiusa durante il tuo ultimo viaggio GPS. Vuoi continuare la registrazione da quel viaggio?',
            confirm: 'Continua viaggio',
            cancel: 'Vedi viaggio',
        },
        signOutWarningTripInProgress: {
            title: 'Monitoraggio GPS in corso',
            prompt: 'Sei sicuro di voler annullare il viaggio e disconnetterti?',
            confirm: 'Scarta e disconnetti',
        },
        locationServicesRequiredModal: {
            title: 'Accesso alla posizione richiesto',
            confirm: 'Apri impostazioni',
            prompt: 'Consenti l’accesso alla posizione nelle impostazioni del dispositivo per avviare il rilevamento della distanza tramite GPS.',
        },
        fabGpsTripExplained: 'Vai alla schermata GPS (azione flottante)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Pagella smarrita o danneggiata',
        nextButtonLabel: 'Avanti',
        reasonTitle: 'Perché hai bisogno di una nuova carta?',
        cardDamaged: 'La mia carta è danneggiata',
        cardLostOrStolen: 'La mia carta è stata smarrita o rubata',
        confirmAddressTitle: 'Conferma l’indirizzo postale per la tua nuova carta.',
        cardDamagedInfo: 'La tua nuova carta arriverà tra 2-3 giorni lavorativi. La tua carta attuale continuerà a funzionare finché non attivi quella nuova.',
        cardLostOrStolenInfo:
            'La tua carta attuale verrà disattivata definitivamente non appena l’ordine sarà effettuato. La maggior parte delle carte arriva entro pochi giorni lavorativi.',
        address: 'Indirizzo',
        deactivateCardButton: 'Disattiva carta',
        shipNewCardButton: 'Spedisci nuova carta',
        addressError: "L'indirizzo è obbligatorio",
        reasonError: 'Il motivo è obbligatorio',
        successTitle: 'La tua nuova carta è in arrivo!',
        successDescription: 'Dovrai attivarla quando arriverà tra qualche giorno lavorativo. Nel frattempo, puoi usare una carta virtuale.',
    },
    eReceipt: {
        guaranteed: 'Ricevuta elettronica garantita',
        transactionDate: 'Data transazione',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Avvia una chat, <success><strong>presenta un amico</strong></success>.',
            header: 'Avvia una chat, invita un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Inizia una chat con loro e al resto penseremo noi.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Invia una spesa, <success><strong>presenta il tuo team</strong></success>.',
            header: 'Invia una spesa, invita il tuo team',
            body: 'Vuoi che anche il tuo team usi Expensify? Basta inviare loro una spesa e noi ci occuperemo del resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Presenta un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Basta chattare, pagare o dividere una spesa con loro e noi ci occuperemo del resto. Oppure condividi semplicemente il tuo link d’invito!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Presenta un amico',
            header: 'Presenta un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Basta chattare, pagare o dividere una spesa con loro e noi ci occuperemo del resto. Oppure condividi semplicemente il tuo link d’invito!',
        },
        copyReferralLink: 'Copia link invito',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chatta con il tuo/tuа specialista di configurazione in <a href="${href}">${adminReportName}</a> per ricevere aiuto`,
        default: `Invia un messaggio a <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> per assistenza con la configurazione`,
    },
    violations: {
        allTagLevelsRequired: 'Tutti i tag obbligatori',
        autoReportedRejectedExpense: 'Questa spesa è stata rifiutata.',
        billableExpense: 'Fatturabile non più valido',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Ricevuta richiesta${formattedLimit ? `oltre ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categoria non più valida',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Sovrapprezzo di conversione applicato del ${surcharge}%`,
        customUnitOutOfPolicy: 'Tariffa non valida per questo workspace',
        duplicatedTransaction: 'Possibile duplicato',
        fieldRequired: 'I campi del report sono obbligatori',
        futureDate: 'Data futura non consentita',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Maggiorato del ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data precedente a ${maxAge} giorni`,
        missingCategory: 'Categoria mancante',
        missingComment: 'Descrizione richiesta per la categoria selezionata',
        missingAttendees: 'Più partecipanti obbligatori per questa categoria',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Manca ${tagName ?? 'etichetta'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'L’importo differisce dalla distanza calcolata';
                case 'card':
                    return 'Importo superiore alla transazione con carta';
                default:
                    if (displayPercentVariance) {
                        return `Importo superiore del ${displayPercentVariance}% rispetto alla ricevuta acquisita`;
                    }
                    return 'Importo maggiore rispetto alla ricevuta acquisita';
            }
        },
        modifiedDate: 'La data è diversa da quella sulla ricevuta scannerizzata',
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
                return `Ricevuta obbligatoria oltre il limite di categoria di ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Ricevuta richiesta oltre ${formattedLimit}`;
            }
            if (category) {
                return `Ricevuta richiesta oltre il limite della categoria`;
            }
            return 'Ricevuta obbligatoria';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Ricevuta dettagliata richiesta${formattedLimit ? `oltre ${formattedLimit}` : ''}`,
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Spesa proibita:';
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
                return isAdmin ? `Chiedi a ${member} di contrassegnarlo come contante oppure attendi 7 giorni e riprova` : 'In attesa di unione con la transazione della carta.';
            }
            return '';
        },
        brokenConnection530Error: 'Ricevuta in sospeso a causa di un collegamento bancario interrotto',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Ricevuta in sospeso a causa di un collegamento bancario interrotto. Risolvi il problema in <a href="${workspaceCompanyCardRoute}">Carte aziendali</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Ricevuta in sospeso a causa di una connessione bancaria interrotta. Chiedi a un amministratore dello spazio di lavoro di risolvere il problema.',
        markAsCashToIgnore: 'Segna come contante per ignorare e richiedere il pagamento.',
        smartscanFailed: ({canEdit = true}) => `Scansione della ricevuta non riuscita.${canEdit ? 'Inserisci i dettagli manualmente.' : ''}`,
        receiptGeneratedWithAI: 'Ricevuta potenzialmente generata dall’IA',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Manca ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} non più valido`,
        taxAmountChanged: "L'importo dell'imposta è stato modificato",
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
        keepThisOne: 'Tieni questo',
        confirmDetails: `Conferma i dettagli che mantieni`,
        confirmDuplicatesInfo: `I duplicati che non mantieni verranno conservati affinché chi li ha inviati possa eliminarli.`,
        hold: 'Questa spesa è stata sospesa',
        resolvedDuplicates: 'ha risolto il duplicato',
        companyCardRequired: 'Acquisti con carta aziendale obbligatori',
        noRoute: 'Seleziona un indirizzo valido',
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
            subtitle: 'Prima di procedere, dicci perché desideri passare a Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ho bisogno di una funzionalità disponibile solo in Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Non capisco come usare il nuovo Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Capisco come usare il nuovo Expensify, ma preferisco Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Quale funzionalità ti serve che non è disponibile nella nuova Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Che cosa stai cercando di fare?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Perché preferisci Expensify Classic?',
        },
        responsePlaceholder: 'La tua risposta',
        thankYou: 'Grazie per il feedback!',
        thankYouSubtitle: 'Le tue risposte ci aiuteranno a creare un prodotto migliore per portare a termine le attività. Grazie mille!',
        goToExpensifyClassic: 'Passa a Expensify Classic',
        offlineTitle: 'Sembra che tu sia bloccato qui...',
        offline:
            'Sembra che tu sia offline. Purtroppo Expensify Classic non funziona offline, ma la nuova Expensify sì. Se preferisci usare Expensify Classic, riprova quando avrai una connessione a internet.',
        quickTip: 'Suggerimento rapido...',
        quickTipSubTitle: 'Puoi andare direttamente a Expensify Classic visitando expensify.com. Aggiungilo ai preferiti per un accesso rapido!',
        bookACall: 'Prenota una chiamata',
        bookACallTitle: 'Vorresti parlare con un product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Chatta direttamente su spese e report',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Possibilità di fare tutto da mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Viaggi e note spese alla velocità della chat',
        },
        bookACallTextTop: 'Passando a Expensify Classic, rinuncerai a:',
        bookACallTextBottom:
            'Saremmo felici di fare una chiamata con te per capire il motivo. Puoi prenotare una chiamata con uno dei nostri senior product manager per discutere delle tue esigenze.',
        takeMeToExpensifyClassic: 'Portami a Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Si è verificato un errore durante il caricamento di altri messaggi',
        tryAgain: 'Riprova',
    },
    systemMessage: {
        mergedWithCashTransaction: 'ha associato una ricevuta a questa transazione',
    },
    subscription: {
        authenticatePaymentCard: 'Autentica carta di pagamento',
        mobileReducedFunctionalityMessage: 'Non puoi modificare il tuo abbonamento nell’app per dispositivi mobili.',
        badge: {
            freeTrial: (numOfDays: number) => `Prova gratuita: ${numOfDays} ${numOfDays === 1 ? 'giorno' : 'giorni'} rimanenti`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Le tue informazioni di pagamento non sono aggiornate',
                subtitle: (date: string) => `Aggiorna la tua carta di pagamento entro il ${date} per continuare a usare tutte le tue funzionalità preferite.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Impossibile elaborare il tuo pagamento',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `L’addebito del ${date} di ${purchaseAmountOwed} non può essere elaborato. Aggiungi una carta di pagamento per saldare l’importo dovuto.`
                        : 'Aggiungi una carta di pagamento per saldare l’importo dovuto.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Le tue informazioni di pagamento non sono aggiornate',
                subtitle: (date: string) => `Il tuo pagamento è in ritardo. Paga la tua fattura entro il ${date} per evitare l’interruzione del servizio.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Le tue informazioni di pagamento non sono aggiornate',
                subtitle: 'Il tuo pagamento è scaduto. Ti preghiamo di saldare la tua fattura.',
            },
            billingDisputePending: {
                title: 'Impossibile addebitare la tua carta',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Hai contestato l’addebito di ${amountOwed} sulla carta che termina con ${cardEnding}. Il tuo conto sarà bloccato finché la contestazione non sarà risolta con la tua banca.`,
            },
            cardAuthenticationRequired: {
                title: 'La tua carta di pagamento non è stata completamente autenticata.',
                subtitle: (cardEnding: string) => `Completa la procedura di autenticazione per attivare la tua carta di pagamento che termina con ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Impossibile addebitare la tua carta',
                subtitle: (amountOwed: number) =>
                    `La tua carta di pagamento è stata rifiutata per fondi insufficienti. Riprova oppure aggiungi una nuova carta di pagamento per saldare il saldo in sospeso di ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Impossibile addebitare la tua carta',
                subtitle: (amountOwed: number) => `La tua carta di pagamento è scaduta. Aggiungi una nuova carta di pagamento per saldare il saldo in sospeso di ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'La tua carta sta per scadere',
                subtitle:
                    'La tua carta di pagamento scadrà alla fine di questo mese. Clicca sul menu con i tre puntini qui sotto per aggiornarla e continuare a usare tutte le tue funzionalità preferite.',
            },
            retryBillingSuccess: {
                title: 'Operazione riuscita!',
                subtitle: 'La tua carta è stata addebitata correttamente.',
            },
            retryBillingError: {
                title: 'Impossibile addebitare la tua carta',
                subtitle:
                    'Prima di riprovare, contatta direttamente la tua banca per autorizzare gli addebiti Expensify e rimuovere eventuali blocchi. In alternativa, prova ad aggiungere un’altra carta di pagamento.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Hai contestato l’addebito di ${amountOwed} sulla carta che termina con ${cardEnding}. Il tuo conto sarà bloccato finché la contestazione non sarà risolta con la tua banca.`,
            preTrial: {
                title: 'Inizia una prova gratuita',
                subtitle: 'Come prossimo passo, <a href="#">completa la checklist di configurazione</a> così il tuo team può iniziare a registrare le spese.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Prova: ${numOfDays} ${numOfDays === 1 ? 'giorno' : 'giorni'} rimanenti!`,
                subtitle: 'Aggiungi una carta di pagamento per continuare a usare tutte le tue funzioni preferite.',
            },
            trialEnded: {
                title: 'La tua prova gratuita è terminata',
                subtitle: 'Aggiungi una carta di pagamento per continuare a usare tutte le tue funzioni preferite.',
            },
            earlyDiscount: {
                claimOffer: 'Richiedi offerta',
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>${discountType}% di sconto sul primo anno!</strong> Aggiungi un metodo di pagamento e attiva un abbonamento annuale.`,
                onboardingChatTitle: (discountType: number) => `Offerta a tempo limitato: ${discountType}% di sconto sul primo anno!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Richiedi entro ${days > 0 ? `${days}g :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Pagamento',
            subtitle: 'Aggiungi una carta per pagare il tuo abbonamento Expensify.',
            addCardButton: 'Aggiungi carta di pagamento',
            cardInfo: (name: string, expiration: string, currency: string) => `Nome: ${name}, Scadenza: ${expiration}, Valuta: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `La tua prossima data di pagamento è il ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Carta che termina con ${cardNumber}`,
            changeCard: 'Cambia carta di pagamento',
            changeCurrency: 'Modifica valuta di pagamento',
            cardNotFound: 'Nessuna carta di pagamento aggiunta',
            retryPaymentButton: 'Riprova il pagamento',
            authenticatePayment: 'Autentica pagamento',
            requestRefund: 'Richiedi rimborso',
            requestRefundModal: {
                full: 'Ottenere un rimborso è semplice, ti basta effettuare il downgrade del tuo account prima della prossima data di fatturazione e riceverai un rimborso. <br /> <br /> Attenzione: Effettuare il downgrade del tuo account significa che i tuoi workspace verranno eliminati. Questa azione non può essere annullata, ma puoi sempre creare un nuovo workspace se cambi idea.',
                confirm: 'Elimina workspace e esegui il downgrade',
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
                title: 'Riscossi',
                description: 'Il piano per piccole imprese che ti offre note spese, viaggi e chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Carta Expensify, ${upper}/membro attivo senza la Carta Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Carta Expensify, ${upper}/membro attivo senza la Carta Expensify.`,
                benefit1: 'Scansione ricevute',
                benefit2: 'Rimborsi',
                benefit3: 'Gestione carte aziendali',
                benefit4: 'Approvazioni di spese e viaggi',
                benefit5: 'Prenotazioni di viaggio e regole',
                benefit6: 'Integrazioni QuickBooks/Xero',
                benefit7: 'Chatta su spese, report e stanze',
                benefit8: 'Assistenza umana e AI',
            },
            control: {
                title: 'Controllo',
                description: 'Spese, viaggi e chat per aziende più grandi.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Carta Expensify, ${upper}/membro attivo senza la Carta Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Da ${lower}/membro attivo con la Carta Expensify, ${upper}/membro attivo senza la Carta Expensify.`,
                benefit1: 'Tutto nel piano Collect',
                benefit2: 'Flussi di approvazione multilivello',
                benefit3: 'Regole spese personalizzate',
                benefit4: 'Integrazioni ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integrazioni HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Analisi e report personalizzati',
                benefit8: 'Budgeting',
            },
            thisIsYourCurrentPlan: 'Questo è il tuo piano attuale',
            downgrade: 'Esegui downgrade a Collect',
            upgrade: 'Passa a Control',
            addMembers: 'Aggiungi membri',
            saveWithExpensifyTitle: 'Risparmia con la Carta Expensify',
            saveWithExpensifyDescription: 'Usa il nostro calcolatore di risparmio per vedere come il cashback della Expensify Card può ridurre la tua fattura Expensify.',
            saveWithExpensifyButton: 'Scopri di più',
        },
        compareModal: {
            comparePlans: 'Confronta piani',
            subtitle: `<muted-text>Sblocca le funzionalità di cui hai bisogno con il piano più adatto a te. <a href="${CONST.PRICING}">Visita la nostra pagina dei prezzi</a> per una panoramica completa delle funzionalità incluse in ciascun piano.</muted-text>`,
        },
        details: {
            title: "Dettagli dell'abbonamento",
            annual: 'Abbonamento annuale',
            taxExempt: 'Richiedi lo stato di esenzione fiscale',
            taxExemptEnabled: 'Esente da imposte',
            taxExemptStatus: 'Stato di esenzione fiscale',
            payPerUse: 'A consumo',
            subscriptionSize: 'Dimensione abbonamento',
            headsUp:
                'Attenzione: se non imposti ora la dimensione del tuo abbonamento, la imposteremo automaticamente in base al numero di membri attivi del tuo primo mese. Sarai quindi vincolato a pagare per almeno questo numero di membri per i prossimi 12 mesi. Puoi aumentare la dimensione del tuo abbonamento in qualsiasi momento, ma non puoi ridurla finché il tuo abbonamento non sarà terminato.',
            zeroCommitment: 'Zero vincoli alla tariffa scontata dell’abbonamento annuale',
        },
        subscriptionSize: {
            title: 'Dimensione abbonamento',
            yourSize: 'La dimensione dell’abbonamento è il numero di posti liberi che possono essere occupati da qualsiasi membro attivo in un determinato mese.',
            eachMonth:
                'Ogni mese, il tuo abbonamento copre fino al numero di membri attivi impostato sopra. Ogni volta che aumenti la dimensione del tuo abbonamento, inizierai un nuovo abbonamento di 12 mesi con la nuova dimensione.',
            note: 'Nota: è considerato membro attivo chiunque abbia creato, modificato, inviato, approvato, rimborsato o esportato dati di spesa collegati allo spazio di lavoro della tua azienda.',
            confirmDetails: 'Conferma i dettagli del tuo nuovo abbonamento annuale:',
            subscriptionSize: 'Dimensione abbonamento',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membri attivi/mese`,
            subscriptionRenews: 'Rinnovo dell’abbonamento',
            youCantDowngrade: 'Non puoi effettuare il downgrade durante l’abbonamento annuale.',
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
            security: 'Expensify è conforme allo standard PCI-DSS, utilizza la crittografia a livello bancario e un’infrastruttura ridondante per proteggere i tuoi dati.',
            learnMoreAboutSecurity: 'Scopri di più sulla nostra sicurezza.',
        },
        subscriptionSettings: {
            title: 'Impostazioni abbonamento',
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
                'Aumenta automaticamente i posti annuali per includere i membri attivi che superano le dimensioni del tuo abbonamento. Nota: questo estenderà la data di fine del tuo abbonamento annuale.',
            disableAutoRenew: 'Disattiva rinnovo automatico',
            helpUsImprove: 'Aiutaci a migliorare Expensify',
            whatsMainReason: 'Qual è il motivo principale per cui stai disattivando il rinnovo automatico?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Si rinnova il ${date}.`,
            pricingConfiguration: 'Il prezzo dipende dalla configurazione. Per ottenere il prezzo più basso, scegli un abbonamento annuale e richiedi la Expensify Card.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Scopri di più nella nostra <a href="${CONST.PRICING}">pagina dei prezzi</a> o chatta con il nostro team nel tuo ${hasAdminsRoom ? `<a href="adminsRoom">#stanza-admin.</a>` : 'stanza #admins.'}</muted-text>`,
            estimatedPrice: 'Prezzo stimato',
            changesBasedOn: 'Questo cambia in base all’utilizzo della tua Expensify Card e alle opzioni di abbonamento qui sotto.',
        },
        requestEarlyCancellation: {
            title: 'Richiedi annullamento anticipato',
            subtitle: 'Qual è il principale motivo per cui stai richiedendo la risoluzione anticipata?',
            subscriptionCanceled: {
                title: 'Abbonamento annullato',
                subtitle: 'Il tuo abbonamento annuale è stato annullato.',
                info: 'Se vuoi continuare a usare il tuo workspace (o i tuoi workspace) con il pagamento a consumo, è tutto pronto.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Se desideri evitare attività e addebiti futuri, devi <a href="${workspacesListRoute}">eliminare il tuo spazio di lavoro (i tuoi spazi di lavoro)</a>. Nota che, quando elimini il tuo spazio di lavoro (i tuoi spazi di lavoro), ti verrà addebitata qualsiasi attività in sospeso sostenuta durante l’attuale mese di calendario.`,
            },
            requestSubmitted: {
                title: 'Richiesta inviata',
                subtitle:
                    'Grazie per averci fatto sapere che sei interessato/a a disdire il tuo abbonamento. Stiamo esaminando la tua richiesta e ti contatteremo presto tramite la tua chat con <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Richiedendo l’annullamento anticipato, riconosco e accetto che Expensify non ha alcun obbligo di concedere tale richiesta ai sensi dei <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Termini di servizio</a> di Expensify o di altro accordo sui servizi applicabile tra me ed Expensify e che Expensify mantiene la piena discrezionalità in merito alla concessione di qualsiasi tale richiesta.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'La funzionalità necessita di miglioramenti',
        tooExpensive: 'Troppo costoso',
        inadequateSupport: 'Assistenza clienti inadeguata',
        businessClosing: 'Chiusura, ridimensionamento o acquisizione dell’azienda',
        additionalInfoTitle: 'A quale software stai passando e perché?',
        additionalInfoInputLabel: 'La tua risposta',
    },
    roomChangeLog: {
        updateRoomDescription: 'imposta la descrizione della stanza su:',
        clearRoomDescription: 'ha cancellato la descrizione della stanza',
        changedRoomAvatar: 'ha cambiato l’avatar della stanza',
        removedRoomAvatar: "ha rimosso l'avatar della stanza",
    },
    delegate: {
        switchAccount: 'Passa ad un altro account:',
        copilotDelegatedAccess: 'Copilota: Accesso delegato',
        copilotDelegatedAccessDescription: 'Consenti agli altri membri di accedere al tuo account.',
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
        onBehalfOfMessage: (delegator: string) => `per conto di ${delegator}`,
        accessLevel: 'Livello di accesso',
        confirmCopilot: 'Conferma il tuo copilota qui sotto.',
        accessLevelDescription:
            'Scegli un livello di accesso qui sotto. Sia l’accesso completo che quello limitato consentono ai copiloti di visualizzare tutte le conversazioni e le spese.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Consenti a un altro membro di eseguire tutte le azioni nel tuo account per tuo conto. Include chat, invii, approvazioni, pagamenti, aggiornamenti delle impostazioni e altro ancora.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Consenti a un altro membro di svolgere la maggior parte delle azioni nel tuo account per tuo conto. Sono escluse approvazioni, pagamenti, rifiuti e sospensioni.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Rimuovi copilota',
        removeCopilotConfirmation: 'Sei sicuro di voler rimuovere questo copilota?',
        changeAccessLevel: 'Modifica livello di accesso',
        makeSureItIsYou: 'Verifichiamo che sia davvero tu',
        enterMagicCode: (contactMethod: string) => `Inserisci il codice magico inviato a ${contactMethod} per aggiungere un copilota. Dovrebbe arrivare entro uno o due minuti.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Inserisci il codice magico inviato a ${contactMethod} per aggiornare il tuo copilota.`,
        notAllowed: 'Non così in fretta...',
        noAccessMessage: dedent(`
            Come copilota non hai accesso a
            questa pagina. Spiacenti!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Come <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilota</a> per ${accountOwnerEmail}, non hai l'autorizzazione per eseguire questa azione. Spiacenti!`,
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
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valore non valido - previsto: ${expectedValues}`,
        missingValue: 'Valore mancante',
        createReportAction: 'Crea azione rapporto',
        reportAction: 'Azione del rapporto',
        report: 'Report',
        transaction: 'Transazione',
        violations: 'Violazioni',
        transactionViolation: 'Violazione della transazione',
        hint: 'Le modifiche ai dati non verranno inviate al backend',
        textFields: 'Campi di testo',
        numberFields: 'Campi numerici',
        booleanFields: 'Campi booleani',
        constantFields: 'Campi costanti',
        dateTimeFields: 'Campi data/ora',
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
        createTransactionViolation: 'Crea violazione di transazione',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ha un commento in bozza',
            hasGBR: 'Ha GBR',
            hasRBR: 'Ha RBR',
            pinnedByUser: 'Fissato da membro',
            hasIOUViolations: 'Presenta violazioni IOU',
            hasAddWorkspaceRoomErrors: "Presenta errori nell'aggiunta della stanza dell'area di lavoro",
            isUnread: 'È non letto (modalità concentrazione)',
            isArchived: 'È archiviata (modalità più recente)',
            isSelfDM: 'È un DM a sé stesso',
            isFocused: 'È temporaneamente in primo piano',
        },
        reasonGBR: {
            hasJoinRequest: 'Ha una richiesta di adesione (stanza amministratore)',
            isUnreadWithMention: 'È non letto con menzione',
            isWaitingForAssigneeToCompleteAction: 'In attesa che l’assegnatario completi l’azione',
            hasChildReportAwaitingAction: 'Ha un report figlio in attesa di azione',
            hasMissingInvoiceBankAccount: 'Ha un conto bancario della fattura mancante',
            hasUnresolvedCardFraudAlert: 'Ha un avviso di frode sulla carta non risolto',
            hasDEWApproveFailed: 'Approvazione DEW non riuscita',
        },
        reasonRBR: {
            hasErrors: 'Presenta errori nei dati del report o nelle azioni del report',
            hasViolations: 'Presenta violazioni',
            hasTransactionThreadViolations: 'Presenta violazioni del thread di transazione',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'C’è un report in attesa di azione',
            theresAReportWithErrors: "C'è un report con errori",
            theresAWorkspaceWithCustomUnitsErrors: 'C’è uno spazio di lavoro con errori nelle unità personalizzate',
            theresAProblemWithAWorkspaceMember: 'C’è un problema con un membro dello spazio di lavoro',
            theresAProblemWithAWorkspaceQBOExport: "Si è verificato un problema con un'impostazione di esportazione della connessione dello spazio di lavoro.",
            theresAProblemWithAContactMethod: 'C’è un problema con un metodo di contatto',
            aContactMethodRequiresVerification: 'Un metodo di contatto richiede la verifica',
            theresAProblemWithAPaymentMethod: 'Si è verificato un problema con un metodo di pagamento',
            theresAProblemWithAWorkspace: 'C’è un problema con uno spazio di lavoro',
            theresAProblemWithYourReimbursementAccount: 'C’è un problema con il tuo conto di rimborso',
            theresABillingProblemWithYourSubscription: 'C’è un problema di fatturazione con il tuo abbonamento',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Il tuo abbonamento è stato rinnovato con successo',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Si è verificato un problema durante la sincronizzazione della connessione dello spazio di lavoro',
            theresAProblemWithYourWallet: 'Si è verificato un problema con il tuo wallet',
            theresAProblemWithYourWalletTerms: 'C’è un problema con i termini del tuo portafoglio',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Fai un giro di prova',
    },
    migratedUserWelcomeModal: {
        title: 'Benvenuto nella nuova Expensify!',
        subtitle: 'Include tutto ciò che ami della nostra esperienza classica, con una serie di miglioramenti per renderti la vita ancora più facile:',
        confirmText: 'Andiamo!',
        helpText: 'Prova demo di 2 minuti',
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
        accountSwitcher: '<tooltip>Accedi qui ai tuoi <strong>conti Copilot</strong></tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scansiona la nostra ricevuta di prova</strong> per vedere come funziona!</tooltip>',
            manager: '<tooltip>Scegli il nostro <strong>responsabile di test</strong> per provarlo!</tooltip>',
            confirmation: '<tooltip>Ora, <strong>invia la tua spesa</strong> e guarda la magia!</tooltip>',
            tryItOut: 'Provalo',
        },
        outstandingFilter: '<tooltip>Filtra le spese\nche <strong>necessitano di approvazione</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Invia questa ricevuta per\n<strong>completare il test drive!</strong></tooltip>',
        gpsTooltip: '<tooltip>Tracciamento GPS in corso! Quando hai finito, interrompi il tracciamento qui sotto.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Eliminare le modifiche?',
        body: 'Sei sicuro di voler annullare le modifiche apportate?',
        confirmText: 'Annulla modifiche',
    },
    scheduledCall: {
        book: {
            title: 'Programma chiamata',
            description: 'Trova un orario che vada bene per te.',
            slots: ({date}: {date: string}) => `<muted-text>Orari disponibili per il <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Conferma chiamata',
            description: 'Assicurati che i dettagli qui sotto ti sembrino corretti. Una volta confermata la chiamata, invieremo un invito con maggiori informazioni.',
            setupSpecialist: 'Il tuo/La tua specialista di configurazione',
            meetingLength: 'Durata riunione',
            dateTime: 'Data e ora',
            minutes: '30 minuti',
        },
        callScheduled: 'Chiamata programmata',
    },
    autoSubmitModal: {
        title: 'Tutto chiaro e inviato!',
        description: 'Tutti gli avvisi e le violazioni sono stati eliminati, quindi:',
        submittedExpensesTitle: 'Queste spese sono state inviate',
        submittedExpensesDescription: 'Queste spese sono state inviate al tuo approvatore, ma possono ancora essere modificate finché non vengono approvate.',
        pendingExpensesTitle: 'Le spese in sospeso sono state spostate',
        pendingExpensesDescription: 'Tutte le spese in sospeso con carta sono state spostate in un report separato finché non verranno contabilizzate.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Fai una prova di 2 minuti',
        },
        modal: {
            title: 'Mettici alla prova',
            description: 'Fai un rapido tour del prodotto per metterti subito al passo.',
            confirmText: 'Avvia prova di test',
            helpText: 'Salta',
            employee: {
                description:
                    '<muted-text>Ottieni per il tuo team <strong>3 mesi gratis di Expensify!</strong> Inserisci l’email del tuo capo qui sotto e inviagli una nota spese di prova.</muted-text>',
                email: "Inserisci l'email del tuo capo",
                error: 'Quel membro possiede uno spazio di lavoro, inserisci un nuovo membro da testare.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Al momento stai provando Expensify',
            readyForTheRealThing: 'Prontə per la cosa vera?',
            getStarted: 'Inizia',
        },
        employeeInviteMessage: (name: string) => `# ${name} ti ha invitato a provare Expensify
Ciao! Ho appena ottenuto per noi *3 mesi gratis* per provare Expensify, il modo più veloce per gestire le spese.

Ecco una *ricevuta di prova* per mostrarti come funziona:`,
    },
    export: {
        basicExport: 'Esportazione di base',
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
                `Prima di procedere, verifica di essere il/la proprietario/a di <strong>${domainName}</strong> aggiornando le sue impostazioni DNS.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Accedi al tuo provider DNS e apri le impostazioni DNS per <strong>${domainName}</strong>.`,
            addTXTRecord: 'Aggiungi il seguente record TXT:',
            saveChanges: 'Salva le modifiche e torna qui per verificare il tuo dominio.',
            youMayNeedToConsult: `Potrebbe essere necessario consultare il reparto IT della tua organizzazione per completare la verifica. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Scopri di più</a>.`,
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
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> è una funzionalità di sicurezza che ti offre maggiore controllo su come i membri con email <strong>${domainName}</strong> accedono a Expensify. Per abilitarla, dovrai verificare di essere un amministratore autorizzato dell’azienda.</muted-text>`,
            fasterAndEasierLogin: 'Accesso più veloce e semplice',
            moreSecurityAndControl: 'Più sicurezza e controllo',
            onePasswordForAnything: "Un'unica password per tutto",
        },
        goToDomain: 'Vai al dominio',
        samlLogin: {
            title: 'Accesso SAML',
            subtitle: `<muted-text>Configura l’accesso dei membri con <a href="${CONST.SAML_HELP_URL}">SSO (Single Sign-On) SAML.</a></muted-text>`,
            enableSamlLogin: 'Abilita accesso SAML',
            allowMembers: 'Consenti ai membri di accedere con SAML.',
            requireSamlLogin: 'Richiedi accesso SAML',
            anyMemberWillBeRequired: 'A qualsiasi membro che ha effettuato l’accesso con un metodo diverso verrà richiesto di autenticarsi nuovamente utilizzando SAML.',
            enableError: "Impossibile aggiornare l'impostazione di abilitazione SAML",
            requireError: "Impossibile aggiornare l'impostazione del requisito SAML",
            disableSamlRequired: 'Disattiva requisito SAML',
            oktaWarningPrompt: 'Sei sicuro? Questo disattiverà anche Okta SCIM.',
            requireWithEmptyMetadataError: 'Aggiungi i metadati del provider di identità qui sotto per abilitare',
        },
        samlConfigurationDetails: {
            title: 'Dettagli di configurazione SAML',
            subtitle: 'Usa questi dettagli per configurare SAML.',
            identityProviderMetadata: 'Metadati del provider di identità',
            entityID: 'ID entità',
            nameIDFormat: 'Formato ID nome',
            loginUrl: 'URL di accesso',
            acsUrl: 'URL ACS (Assertion Consumer Service)',
            logoutUrl: 'URL di logout',
            sloUrl: 'URL SLO (Single Logout)',
            serviceProviderMetaData: 'Metadati del Service Provider',
            oktaScimToken: 'Token SCIM Okta',
            revealToken: 'Mostra token',
            fetchError: 'Impossibile recuperare i dettagli della configurazione SAML',
            setMetadataGenericError: 'Impossibile impostare i metadati SAML',
        },
        accessRestricted: {
            title: 'Accesso limitato',
            subtitle: (domainName: string) => `Verifica di essere un amministratore autorizzato dell’azienda per <strong>${domainName}</strong> se hai bisogno di controllare:`,
            companyCardManagement: 'Gestione delle carte aziendali',
            accountCreationAndDeletion: 'Creazione e cancellazione dell’account',
            workspaceCreation: 'Creazione spazio di lavoro',
            samlSSO: 'SSO SAML',
        },
        addDomain: {
            title: 'Aggiungi dominio',
            subtitle: 'Inserisci il nome del dominio privato a cui vuoi accedere (ad es. expensify.com).',
            domainName: 'Nome di dominio',
            newDomain: 'Nuovo dominio',
        },
        domainAdded: {
            title: 'Dominio aggiunto',
            description: 'Successivamente, dovrai verificare la proprietà del dominio e modificare le impostazioni di sicurezza.',
            configure: 'Configura',
        },
        enhancedSecurity: {
            title: 'Sicurezza avanzata',
            subtitle: 'Richiedi ai membri del tuo dominio di accedere tramite single sign-on, limita la creazione di spazi di lavoro e altro ancora.',
            enable: 'Abilita',
        },
        domainAdmins: 'Amministratori di dominio',
        admins: {
            title: 'Amministratori',
            findAdmin: 'Trova amministratore',
            primaryContact: 'Contatto principale',
            addPrimaryContact: 'Aggiungi contatto principale',
            setPrimaryContactError: 'Impossibile impostare il contatto principale. Riprova più tardi.',
            settings: 'Impostazioni',
            consolidatedDomainBilling: 'Fatturazione dominio consolidata',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Se abilitata, il contatto principale pagherà per tutti gli spazi di lavoro di proprietà dei membri di <strong>${domainName}</strong> e riceverà tutte le ricevute di fatturazione.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'La fatturazione del dominio consolidata non può essere modificata. Riprova più tardi.',
            addAdmin: 'Aggiungi amministratore',
            addAdminError: 'Impossibile aggiungere questo membro come amministratore. Riprova.',
            revokeAdminAccess: 'Revoca accesso amministratore',
            cantRevokeAdminAccess: 'Impossibile revocare i permessi di amministratore dal referente tecnico',
            error: {
                removeAdmin: 'Impossibile rimuovere questo utente come amministratore. Riprova.',
                removeDomain: 'Impossibile rimuovere questo dominio. Riprova.',
                removeDomainNameInvalid: 'Inserisci il tuo nome di dominio per reimpostarlo.',
            },
            resetDomain: 'Reimposta dominio',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Digita <strong>${domainName}</strong> per confermare il ripristino del dominio.`,
            enterDomainName: 'Inserisci qui il nome del tuo dominio',
            resetDomainInfo: `Questa azione è <strong>definitiva</strong> e i seguenti dati verranno eliminati: <br/> <ul><li>Connessioni con carte aziendali e tutte le spese non rendicontate da tali carte</li> <li>Impostazioni SAML e di gruppo</li> </ul> Tutti gli account, gli spazi di lavoro, i report, le spese e gli altri dati rimarranno. <br/><br/>Nota: puoi rimuovere questo dominio dall’elenco dei tuoi domini eliminando l’email associata dai tuoi <a href="#">metodi di contatto</a>.`,
        },
        members: {
            title: 'Membri',
            findMember: 'Trova membro',
            addMember: 'Aggiungi membro',
            email: 'Indirizzo email',
            errors: {
                addMember: 'Impossibile aggiungere questo membro. Riprova.',
            },
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
