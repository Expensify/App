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
        count: 'Compter',
        cancel: 'Annuler',
        dismiss: 'Ignorer',
        yes: 'Oui',
        no: 'Non',
        ok: "D'accord",
        notNow: 'Pas maintenant',
        learnMore: 'En savoir plus.',
        buttonConfirm: 'Compris',
        name: 'Nom',
        attachment: 'Pi\u00E8ce jointe',
        attachments: 'Pi\u00E8ces jointes',
        center: 'Centre',
        from: 'De',
        to: '\u00C0',
        in: 'Dans',
        optional: 'Optionnel',
        new: 'Nouveau',
        search: 'Recherche',
        reports: 'Rapports',
        find: 'Trouver',
        searchWithThreeDots: 'Rechercher...',
        next: 'Suivant',
        previous: 'Pr\u00E9c\u00E9dent',
        goBack: 'Retourner',
        create: 'Cr\u00E9er',
        add: 'Ajouter',
        resend: 'Renvoyer',
        save: 'Enregistrer',
        select: 'S\u00E9lectionner',
        deselect: 'D\u00E9s\u00E9lectionner',
        selectMultiple: 'S\u00E9lectionner plusieurs',
        saveChanges: 'Enregistrer les modifications',
        submit: 'Soumettre',
        rotate: 'Pivoter',
        zoom: 'Zoom',
        password: 'Mot de passe',
        magicCode: 'Code magique',
        twoFactorCode: 'Code \u00E0 deux facteurs',
        workspaces: 'Espaces de travail',
        inbox: 'Bo\u00EEte de r\u00E9ception',
        group: 'Groupe',
        profile: 'Profil',
        referral: 'Parrainage',
        payments: 'Paiements',
        approvals: 'Approbations',
        wallet: 'Portefeuille',
        preferences: 'Pr\u00E9f\u00E9rences',
        view: 'Voir',
        review: (reviewParams?: ReviewParams) => `Review${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Pas',
        signIn: 'Se connecter',
        signInWithGoogle: 'Se connecter avec Google',
        signInWithApple: 'Se connecter avec Apple',
        signInWith: 'Se connecter avec',
        continue: 'Continuer',
        firstName: 'Pr\u00E9nom',
        lastName: 'Nom de famille',
        scanning: 'Num\u00E9risation',
        addCardTermsOfService: "Conditions d'utilisation d'Expensify",
        perPerson: 'par personne',
        phone: 'T\u00E9l\u00E9phone',
        phoneNumber: 'Num\u00E9ro de t\u00E9l\u00E9phone',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'E-mail',
        and: 'et',
        or: 'ou',
        details: 'D\u00E9tails',
        privacy: 'Confidentialit\u00E9',
        privacyPolicy: 'Politique de confidentialit\u00E9',
        hidden: 'Cach\u00E9',
        visible: 'Visible',
        delete: 'Supprimer',
        archived: 'archiv\u00E9',
        contacts: 'Contacts',
        recents: 'R\u00E9cents',
        close: 'Fermer',
        download: 'T\u00E9l\u00E9charger',
        downloading: 'T\u00E9l\u00E9chargement en cours',
        uploading: 'T\u00E9l\u00E9chargement en cours',
        pin: '\u00C9pingler',
        unPin: 'D\u00E9tacher',
        back: 'Retour',
        saveAndContinue: 'Enregistrer et continuer',
        settings: 'Param\u00E8tres',
        termsOfService: "Conditions d'utilisation",
        members: 'Membres',
        invite: 'Inviter',
        here: 'ici',
        date: 'Date',
        dob: 'Date de naissance',
        currentYear: 'Ann\u00E9e en cours',
        currentMonth: 'Mois en cours',
        ssnLast4: 'Derniers 4 chiffres du SSN',
        ssnFull9: 'Les 9 chiffres complets du SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Ligne d'adresse ${lineNumber}`,
        personalAddress: 'Adresse personnelle',
        companyAddress: "Adresse de l'entreprise",
        noPO: "Pas de bo\u00EEtes postales ou d'adresses de d\u00E9p\u00F4t, s'il vous pla\u00EEt.",
        city: 'Ville',
        state: '\u00C9tat',
        streetAddress: 'Adresse postale',
        stateOrProvince: '\u00C9tat / Province',
        country: 'Pays',
        zip: 'Code postal',
        zipPostCode: 'Code postal',
        whatThis: "Qu'est-ce que c'est ?",
        iAcceptThe: "J'accepte le",
        remove: 'Supprimer',
        admin: 'Admin',
        owner: 'Propri\u00E9taire',
        dateFormat: 'YYYY-MM-DD',
        send: 'Envoyer',
        na: 'N/A',
        noResultsFound: 'Aucun r\u00E9sultat trouv\u00E9',
        noResultsFoundMatching: ({searchString}: {searchString: string}) => `Aucun r\u00E9sultat trouv\u00E9 correspondant \u00E0 "${searchString}"`,
        recentDestinations: 'Destinations r\u00E9centes',
        timePrefix: "C'est",
        conjunctionFor: 'pour',
        todayAt: "Aujourd'hui \u00E0",
        tomorrowAt: 'Demain \u00E0',
        yesterdayAt: 'Hier \u00E0',
        conjunctionAt: '\u00E0',
        conjunctionTo: '\u00E0',
        genericErrorMessage: "Oups... quelque chose a mal tourn\u00E9 et votre demande n'a pas pu \u00EAtre compl\u00E9t\u00E9e. Veuillez r\u00E9essayer plus tard.",
        percentage: 'Pourcentage',
        error: {
            invalidAmount: 'Montant invalide',
            acceptTerms: "Vous devez accepter les Conditions d'utilisation pour continuer.",
            phoneNumber: `Veuillez entrer un num\u00E9ro de t\u00E9l\u00E9phone valide, avec l'indicatif du pays (par exemple, ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Ce champ est requis',
            requestModified: 'Cette demande est en cours de modification par un autre membre.',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Limite de caract\u00E8res d\u00E9pass\u00E9e (${length}/${limit})`,
            dateInvalid: 'Veuillez s\u00E9lectionner une date valide',
            invalidDateShouldBeFuture: "Veuillez choisir aujourd'hui ou une date future",
            invalidTimeShouldBeFuture: 'Veuillez choisir une heure au moins une minute plus tard.',
            invalidCharacter: 'Caract\u00E8re invalide',
            enterMerchant: 'Entrez un nom de commer\u00E7ant',
            enterAmount: 'Entrez un montant',
            missingMerchantName: 'Nom du commer\u00E7ant manquant',
            missingAmount: 'Montant manquant',
            missingDate: 'Date manquante',
            enterDate: 'Entrez une date',
            invalidTimeRange: 'Veuillez entrer une heure au format 12 heures (par exemple, 14h30)',
            pleaseCompleteForm: 'Veuillez remplir le formulaire ci-dessus pour continuer',
            pleaseSelectOne: 'Veuillez s\u00E9lectionner une option ci-dessus',
            invalidRateError: 'Veuillez entrer un taux valide',
            lowRateError: 'Le taux doit \u00EAtre sup\u00E9rieur \u00E0 0',
            email: 'Veuillez entrer une adresse e-mail valide',
            login: "Une erreur s'est produite lors de la connexion. Veuillez r\u00E9essayer.",
        },
        comma: 'virgule',
        semicolon: 'semicolon',
        please: "S'il vous pla\u00EEt",
        contactUs: 'contactez-nous',
        pleaseEnterEmailOrPhoneNumber: 'Veuillez entrer un e-mail ou un num\u00E9ro de t\u00E9l\u00E9phone',
        fixTheErrors: 'corriger les erreurs',
        inTheFormBeforeContinuing: 'dans le formulaire avant de continuer',
        confirm: 'Confirmer',
        reset: 'R\u00E9initialiser',
        done: 'Fait',
        more: 'Plus',
        debitCard: 'Carte de d\u00E9bit',
        bankAccount: 'Compte bancaire',
        personalBankAccount: 'Compte bancaire personnel',
        businessBankAccount: 'Compte bancaire professionnel',
        join: 'Rejoindre',
        leave: 'Quitter',
        decline: 'Refuser',
        transferBalance: 'Transf\u00E9rer le solde',
        cantFindAddress: 'Impossible de trouver votre adresse ?',
        enterManually: 'Entrez-le manuellement',
        message: 'Message',
        leaveThread: 'Quitter la discussion',
        you: 'Vous',
        youAfterPreposition: 'vous',
        your: 'votre/vos (selon le contexte)',
        conciergeHelp: "Veuillez contacter Concierge pour obtenir de l'aide.",
        youAppearToBeOffline: 'Vous semblez \u00EAtre hors ligne.',
        thisFeatureRequiresInternet: 'Cette fonctionnalit\u00E9 n\u00E9cessite une connexion Internet active.',
        attachmentWillBeAvailableOnceBackOnline: 'La pi\u00E8ce jointe sera disponible une fois de retour en ligne.',
        errorOccurredWhileTryingToPlayVideo: "Une erreur s'est produite lors de la tentative de lecture de cette vid\u00E9o.",
        areYouSure: '\u00CAtes-vous s\u00FBr ?',
        verify: 'V\u00E9rifier',
        yesContinue: 'Oui, continuez',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: 'Description',
        title: 'Titre',
        assignee: 'Cessionnaire',
        createdBy: 'Cr\u00E9\u00E9 par',
        with: 'avec',
        shareCode: 'Partager le code',
        share: 'Partager',
        per: 'par',
        mi: 'mile',
        km: 'kilom\u00E8tre',
        copied: 'Copi\u00E9 !',
        someone: "Quelqu'un",
        total: 'Total',
        edit: 'Modifier',
        letsDoThis: `Allons-y !`,
        letsStart: `Commen\u00E7ons`,
        showMore: 'Afficher plus',
        merchant: 'Marchand',
        category: 'Cat\u00E9gorie',
        report: 'Rapport',
        billable: 'Facturable',
        nonBillable: 'Non facturable',
        tag: 'Tag',
        receipt: 'Re\u00E7u',
        verified: 'V\u00E9rifi\u00E9',
        replace: 'Remplacer',
        distance: 'Distance',
        mile: 'mile',
        miles: 'miles',
        kilometer: 'kilom\u00E8tre',
        kilometers: 'kilom\u00E8tres',
        recent: 'R\u00E9cent',
        all: 'Tous',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'S\u00E9lectionnez une devise',
        card: 'Carte',
        whyDoWeAskForThis: 'Pourquoi demandons-nous cela ?',
        required: 'Requis',
        showing: 'Affichage',
        of: 'of',
        default: 'Par d\u00E9faut',
        update: 'Mettre \u00E0 jour',
        member: 'Membre',
        auditor: 'Auditeur',
        role: 'R\u00F4le',
        currency: 'Devise',
        rate: 'Taux',
        emptyLHN: {
            title: 'Woohoo ! Tout est \u00E0 jour.',
            subtitleText1: 'Trouvez une discussion en utilisant le',
            subtitleText2: 'bouton ci-dessus, ou cr\u00E9ez quelque chose en utilisant le',
            subtitleText3: 'bouton ci-dessous.',
        },
        businessName: "Nom de l'entreprise",
        clear: 'Effacer',
        type: 'Tapez',
        action: 'Action',
        expenses: 'D\u00E9penses',
        tax: 'Taxe',
        shared: 'Partag\u00E9',
        drafts: 'Brouillons',
        finished: 'Termin\u00E9',
        upgrade: 'Mise \u00E0 niveau',
        downgradeWorkspace: "R\u00E9trograder l'espace de travail",
        companyID: "ID de l'entreprise",
        userID: 'ID utilisateur',
        disable: 'D\u00E9sactiver',
        export: 'Exporter',
        initialValue: 'Valeur initiale',
        currentDate: 'Date actuelle',
        value: 'Valeur',
        downloadFailedTitle: '\u00C9chec du t\u00E9l\u00E9chargement',
        downloadFailedDescription: "Votre t\u00E9l\u00E9chargement n'a pas pu \u00EAtre termin\u00E9. Veuillez r\u00E9essayer plus tard.",
        filterLogs: 'Filtrer les journaux',
        network: 'R\u00E9seau',
        reportID: 'ID de rapport',
        longID: 'ID long',
        bankAccounts: 'Comptes bancaires',
        chooseFile: 'Choisir le fichier',
        dropTitle: 'Laisse tomber',
        dropMessage: 'D\u00E9posez votre fichier ici',
        ignore: 'Ignore',
        enabled: 'Activ\u00E9',
        disabled: 'D\u00E9sactiv\u00E9',
        import: 'Importer',
        offlinePrompt: 'Vous ne pouvez pas effectuer cette action pour le moment.',
        outstanding: 'Exceptionnel',
        chats: 'Chats',
        tasks: 'T\u00E2ches',
        unread: 'Non lu',
        sent: 'Envoy\u00E9',
        links: 'Liens',
        days: 'jours',
        rename: 'Renommer',
        address: 'Adresse',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Passer',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Besoin de quelque chose de sp\u00E9cifique ? Discutez avec votre gestionnaire de compte, ${accountManagerDisplayName}.`,
        chatNow: 'Discuter maintenant',
        workEmail: 'Email professionnel',
        destination: 'Destination',
        subrate: 'Subrate',
        perDiem: 'Per diem',
        validate: 'Valider',
        downloadAsPDF: 'T\u00E9l\u00E9charger en PDF',
        downloadAsCSV: 'T\u00E9l\u00E9charger en tant que CSV',
        help: 'Aide',
        expenseReports: 'Rapports de frais',
        rateOutOfPolicy: 'Tarif hors politique',
        reimbursable: 'Remboursable',
        editYourProfile: 'Modifier votre profil',
        comments: 'Commentaires',
        sharedIn: 'Partag\u00E9 dans',
        unreported: 'Non d\u00E9clar\u00E9',
        explore: 'Explorer',
        todo: '\u00C0 faire',
        invoice: 'Facture',
        expense: 'D\u00E9pense',
        chat: 'Discussion',
        task: 'T\u00E2che',
        trip: 'Voyage',
        apply: 'Appliquer',
        status: 'Statut',
        on: 'Sur',
        before: 'Avant',
        after: 'Apr\u00E8s',
        reschedule: 'Reprogrammer',
        general: 'G\u00E9n\u00E9ral',
        never: 'Jamais',
        workspacesTabTitle: 'Espaces de travail',
        getTheApp: "Obtenez l'application",
        scanReceiptsOnTheGo: 'Num\u00E9risez les re\u00E7us depuis votre t\u00E9l\u00E9phone',
    },
    supportalNoAccess: {
        title: 'Pas si vite',
        description: "Vous n'\u00EAtes pas autoris\u00E9 \u00E0 effectuer cette action lorsque le support est connect\u00E9.",
    },
    lockedAccount: {
        title: 'Compte verrouill\u00E9',
        description:
            "Vous n'\u00EAtes pas autoris\u00E9 \u00E0 effectuer cette action car ce compte a \u00E9t\u00E9 verrouill\u00E9. Veuillez contacter concierge@expensify.com pour les prochaines \u00E9tapes.",
    },
    location: {
        useCurrent: 'Utiliser la position actuelle',
        notFound: "Nous n'avons pas pu trouver votre emplacement. Veuillez r\u00E9essayer ou entrer une adresse manuellement.",
        permissionDenied: "Il semble que vous ayez refus\u00E9 l'acc\u00E8s \u00E0 votre localisation.",
        please: "S'il vous pla\u00EEt",
        allowPermission: "autoriser l'acc\u00E8s \u00E0 la localisation dans les param\u00E8tres",
        tryAgain: 'et r\u00E9essayez.',
    },
    contact: {
        importContacts: 'Importer des contacts',
        importContactsTitle: 'Importez vos contacts',
        importContactsText: 'Importez les contacts de votre t\u00E9l\u00E9phone pour que vos personnes pr\u00E9f\u00E9r\u00E9es soient toujours \u00E0 port\u00E9e de main.',
        importContactsExplanation: 'ainsi, vos personnes pr\u00E9f\u00E9r\u00E9es sont toujours \u00E0 port\u00E9e de main.',
        importContactsNativeText: 'Encore une \u00E9tape ! Donnez-nous le feu vert pour importer vos contacts.',
    },
    anonymousReportFooter: {
        logoTagline: 'Rejoignez la discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Acc\u00E8s \u00E0 la cam\u00E9ra',
        expensifyDoesNotHaveAccessToCamera:
            'Expensify ne peut pas prendre de photos sans acc\u00E8s \u00E0 votre appareil photo. Appuyez sur param\u00E8tres pour mettre \u00E0 jour les autorisations.',
        attachmentError: 'Erreur de pi\u00E8ce jointe',
        errorWhileSelectingAttachment: "Une erreur s'est produite lors de la s\u00E9lection d'une pi\u00E8ce jointe. Veuillez r\u00E9essayer.",
        errorWhileSelectingCorruptedAttachment: "Une erreur s'est produite lors de la s\u00E9lection d'une pi\u00E8ce jointe corrompue. Veuillez essayer un autre fichier.",
        takePhoto: 'Prendre une photo',
        chooseFromGallery: 'Choisir depuis la galerie',
        chooseDocument: 'Choisir le fichier',
        attachmentTooLarge: 'La pi\u00E8ce jointe est trop volumineuse',
        sizeExceeded: 'La taille de la pi\u00E8ce jointe d\u00E9passe la limite de 24 Mo',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `La taille de la pi\u00E8ce jointe d\u00E9passe la limite de ${maxUploadSizeInMB} Mo`,
        attachmentTooSmall: 'La pi\u00E8ce jointe est trop petite',
        sizeNotMet: 'La taille de la pi\u00E8ce jointe doit \u00EAtre sup\u00E9rieure \u00E0 240 octets',
        wrongFileType: 'Type de fichier invalide',
        notAllowedExtension: "Ce type de fichier n'est pas autoris\u00E9. Veuillez essayer un autre type de fichier.",
        folderNotAllowedMessage: "Le t\u00E9l\u00E9chargement d'un dossier n'est pas autoris\u00E9. Veuillez essayer un autre fichier.",
        protectedPDFNotSupported: 'Les PDF prot\u00E9g\u00E9s par mot de passe ne sont pas pris en charge',
        attachmentImageResized: "Cette image a \u00E9t\u00E9 redimensionn\u00E9e pour l'aper\u00E7u. T\u00E9l\u00E9chargez pour la pleine r\u00E9solution.",
        attachmentImageTooLarge: 'Cette image est trop grande pour \u00EAtre pr\u00E9visualis\u00E9e avant le t\u00E9l\u00E9chargement.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Vous pouvez t\u00E9l\u00E9charger jusqu'\u00E0 ${fileLimit} fichiers \u00E0 la fois.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Les fichiers d\u00E9passent ${maxUploadSizeInMB} MB. Veuillez r\u00E9essayer.`,
    },
    dropzone: {
        addAttachments: 'Ajouter des pi\u00E8ces jointes',
        scanReceipts: 'Scanner les re\u00E7us',
        replaceReceipt: 'Remplacer le re\u00E7u',
    },
    filePicker: {
        fileError: 'Erreur de fichier',
        errorWhileSelectingFile: "Une erreur s'est produite lors de la s\u00E9lection d'un fichier. Veuillez r\u00E9essayer.",
    },
    connectionComplete: {
        title: 'Connexion termin\u00E9e',
        supportingText: "Vous pouvez fermer cette fen\u00EAtre et revenir \u00E0 l'application Expensify.",
    },
    avatarCropModal: {
        title: 'Modifier la photo',
        description: 'Faites glisser, zoomez et faites pivoter votre image comme vous le souhaitez.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Aucune extension trouv\u00E9e pour le type MIME',
        problemGettingImageYouPasted: "Il y a eu un probl\u00E8me pour obtenir l'image que vous avez coll\u00E9e.",
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La longueur maximale du commentaire est de ${formattedMaxLength} caract\u00E8res.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La longueur maximale du titre de la t\u00E2che est de ${formattedMaxLength} caract\u00E8res.`,
    },
    baseUpdateAppModal: {
        updateApp: "Mettre \u00E0 jour l'application",
        updatePrompt:
            "Une nouvelle version de cette application est disponible. Mettez \u00E0 jour maintenant ou red\u00E9marrez l'application plus tard pour t\u00E9l\u00E9charger les derni\u00E8res modifications.",
    },
    deeplinkWrapper: {
        launching: "Lancement d'Expensify",
        expired: 'Votre session a expir\u00E9.',
        signIn: 'Veuillez vous reconnecter.',
        redirectedToDesktopApp: "Nous vous avons redirig\u00E9 vers l'application de bureau.",
        youCanAlso: 'Vous pouvez \u00E9galement',
        openLinkInBrowser: 'ouvrez ce lien dans votre navigateur',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `Vous \u00EAtes connect\u00E9 en tant que ${email}. Cliquez sur "Ouvrir le lien" dans l'invite pour vous connecter \u00E0 l'application de bureau avec ce compte.`,
        doNotSeePrompt: "Impossible de voir l'invite ?",
        tryAgain: 'R\u00E9essayer',
        or: ', ou',
        continueInWeb: "continuer vers l'application web",
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra,\nvous \u00EAtes connect\u00E9 !',
        successfulSignInDescription: "Retournez \u00E0 votre onglet d'origine pour continuer.",
        title: 'Voici votre code magique',
        description: "Veuillez entrer le code depuis l'appareil o\u00F9 il a \u00E9t\u00E9 initialement demand\u00E9.",
        doNotShare: 'Ne partagez pas votre code avec qui que ce soit. Expensify ne vous le demandera jamais !',
        or: ', ou',
        signInHere: 'connectez-vous ici',
        expiredCodeTitle: 'Code magique expir\u00E9',
        expiredCodeDescription: "Retournez sur l'appareil d'origine et demandez un nouveau code.",
        successfulNewCodeRequest: 'Code demand\u00E9. Veuillez v\u00E9rifier votre appareil.',
        tfaRequiredTitle: 'Authentification \u00E0 deux facteurs requise',
        tfaRequiredDescription: "Veuillez entrer le code d'authentification \u00E0 deux facteurs\nl\u00E0 o\u00F9 vous essayez de vous connecter.",
        requestOneHere: 'demandez-en un ici.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Pay\u00E9 par',
        whatsItFor: '\u00C0 quoi \u00E7a sert ?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nom, e-mail ou num\u00E9ro de t\u00E9l\u00E9phone',
        findMember: 'Trouver un membre',
        searchForSomeone: "Rechercher quelqu'un",
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Soumettez une d\u00E9pense, parrainez votre patron',
            subtitleText: 'Vous voulez que votre patron utilise Expensify aussi ? Soumettez-lui simplement une d\u00E9pense et nous nous occuperons du reste.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'R\u00E9server un appel',
    },
    hello: 'Bonjour',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Commencez ci-dessous.',
        anotherLoginPageIsOpen: 'Une autre page de connexion est ouverte.',
        anotherLoginPageIsOpenExplanation: 'Vous avez ouvert la page de connexion dans un onglet s\u00E9par\u00E9. Veuillez vous connecter depuis cet onglet.',
        welcome: 'Bienvenue !',
        welcomeWithoutExclamation: 'Bienvenue',
        phrase2: "L'argent parle. Et maintenant que la discussion et les paiements sont au m\u00EAme endroit, c'est aussi facile.",
        phrase3: 'Vos paiements vous parviennent aussi rapidement que vous pouvez faire passer votre message.',
        enterPassword: 'Veuillez entrer votre mot de passe',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, c'est toujours un plaisir de voir un nouveau visage ici !`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Veuillez entrer le code magique envoy\u00E9 \u00E0 ${login}. Il devrait arriver dans une minute ou deux.`,
    },
    login: {
        hero: {
            header: 'Voyage et d\u00E9penses, \u00E0 la vitesse du chat',
            body: "Bienvenue dans la nouvelle g\u00E9n\u00E9ration d'Expensify, o\u00F9 vos voyages et d\u00E9penses avancent plus rapidement gr\u00E2ce \u00E0 un chat contextuel et en temps r\u00E9el.",
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Vous \u00EAtes d\u00E9j\u00E0 connect\u00E9 en tant que ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Vous ne voulez pas vous connecter avec ${provider} ?`,
        continueWithMyCurrentSession: 'Continuer avec ma session actuelle',
        redirectToDesktopMessage: "Nous vous redirigerons vers l'application de bureau une fois que vous aurez termin\u00E9 de vous connecter.",
        signInAgreementMessage: 'En vous connectant, vous acceptez les',
        termsOfService: "Conditions d'utilisation",
        privacy: 'Confidentialit\u00E9',
    },
    samlSignIn: {
        welcomeSAMLEnabled: "Continuez \u00E0 vous connecter avec l'authentification unique :",
        orContinueWithMagicCode: 'Vous pouvez \u00E9galement vous connecter avec un code magique',
        useSingleSignOn: "Utiliser l'authentification unique",
        useMagicCode: 'Utiliser le code magique',
        launching: 'Lancement...',
        oneMoment: 'Un instant pendant que nous vous redirigeons vers le portail de connexion unique de votre entreprise.',
    },
    reportActionCompose: {
        dropToUpload: 'D\u00E9poser pour t\u00E9l\u00E9charger',
        sendAttachment: 'Envoyer la pi\u00E8ce jointe',
        addAttachment: 'Ajouter une pi\u00E8ce jointe',
        writeSomething: '\u00C9cris quelque chose...',
        blockedFromConcierge: 'La communication est interdite',
        fileUploadFailed: "\u00C9chec du t\u00E9l\u00E9chargement. Le fichier n'est pas pris en charge.",
        localTime: ({user, time}: LocalTimeParams) => `Il est ${time} pour ${user}`,
        edited: '(\u00E9dit\u00E9)',
        emoji: 'Emoji',
        collapse: 'R\u00E9duire',
        expand: 'D\u00E9velopper',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Copier dans le presse-papiers',
        copied: 'Copi\u00E9 !',
        copyLink: 'Copier le lien',
        copyURLToClipboard: "Copier l'URL dans le presse-papiers",
        copyEmailToClipboard: "Copier l'email dans le presse-papiers",
        markAsUnread: 'Marquer comme non lu',
        markAsRead: 'Marquer comme lu',
        editAction: ({action}: EditActionParams) => `Modifier ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'd\u00E9pense' : 'commentaire'}`,
        deleteAction: ({action}: DeleteActionParams) => `Supprimer ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'd\u00E9pense' : 'commentaire'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `\u00CAtes-vous s\u00FBr de vouloir supprimer ce ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'd\u00E9pense' : 'commentaire'} ?`,
        onlyVisible: 'Visible uniquement par',
        replyInThread: 'R\u00E9pondre dans le fil de discussion',
        joinThread: 'Rejoindre le fil de discussion',
        leaveThread: 'Quitter la discussion',
        copyOnyxData: 'Copier les donn\u00E9es Onyx',
        flagAsOffensive: 'Signaler comme offensant',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Ajouter une r\u00E9action',
        reactedWith: 'a r\u00E9agi avec',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Vous avez manqu\u00E9 la f\u00EAte \u00E0',
        beginningOfArchivedRoomPartTwo: ", il n'y a rien \u00E0 voir ici.",
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `Cette discussion est avec tous les membres d'Expensify sur le domaine ${domainRoom}.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Utilisez-le pour discuter avec des coll\u00E8gues, partager des astuces et poser des questions.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Ce chat est avec',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: "Utilisez-le pour discuter de l'installation de l'espace de travail et plus encore.",
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) => `Cette discussion est avec tout le monde dans ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `Utilisez-le pour les annonces les plus importantes.`,
        beginningOfChatHistoryUserRoomPartOne: 'Ce salon de discussion est pour tout.',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: `Ce chat est pour les factures entre`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Utilisez le bouton + pour envoyer une facture.`,
        beginningOfChatHistory: 'Ce chat est avec',
        beginningOfChatHistoryPolicyExpenseChatPartOne: "C'est ici que",
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'va soumettre des d\u00E9penses \u00E0',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Utilisez simplement le bouton +.',
        beginningOfChatHistorySelfDM: 'Ceci est votre espace personnel. Utilisez-le pour des notes, des t\u00E2ches, des brouillons et des rappels.',
        beginningOfChatHistorySystemDM: 'Bienvenue ! Commen\u00E7ons votre configuration.',
        chatWithAccountManager: 'Discutez avec votre gestionnaire de compte ici',
        sayHello: 'Dites bonjour !',
        yourSpace: 'Votre espace',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Bienvenue dans ${roomName} !`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Utilisez le bouton + pour ${additionalText} une d\u00E9pense.`,
        askConcierge: 'Posez des questions et obtenez un support en temps r\u00E9el 24h/24 et 7j/7.',
        conciergeSupport: 'Assistance 24h/24 et 7j/7',
        create: 'cr\u00E9er',
        iouTypes: {
            pay: 'payer',
            split: 'split',
            submit: 'soumettre',
            track: 'suivre',
            invoice: 'facture',
        },
    },
    adminOnlyCanPost: 'Seuls les administrateurs peuvent envoyer des messages dans cette salle.',
    reportAction: {
        asCopilot: 'en tant que copilote pour',
    },
    mentionSuggestions: {
        hereAlternateText: 'Notifier tout le monde dans cette conversation',
    },
    newMessages: 'Nouveaux messages',
    youHaveBeenBanned: 'Remarque : Vous avez \u00E9t\u00E9 banni de la discussion dans ce canal.',
    reportTypingIndicator: {
        isTyping: 'est en train de taper...',
        areTyping: 'sont en train de taper...',
        multipleMembers: 'Plusieurs membres',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Cette salle de discussion a \u00E9t\u00E9 archiv\u00E9e.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Ce chat n'est plus actif car ${displayName} a ferm\u00E9 son compte.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Ce chat n'est plus actif car ${oldDisplayName} a fusionn\u00E9 son compte avec ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Ce chat n'est plus actif car <strong>vous</strong> n'\u00EAtes plus membre de l'espace de travail ${policyName}.`
                : `Ce chat n'est plus actif car ${displayName} n'est plus membre de l'espace de travail ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ce chat n'est plus actif car ${policyName} n'est plus un espace de travail actif.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ce chat n'est plus actif car ${policyName} n'est plus un espace de travail actif.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Cette r\u00E9servation est archiv\u00E9e.',
    },
    writeCapabilityPage: {
        label: 'Qui peut publier',
        writeCapability: {
            all: 'Tous les membres',
            admins: 'Administrateurs uniquement',
        },
    },
    sidebarScreen: {
        buttonFind: 'Trouver quelque chose...',
        buttonMySettings: 'Mes param\u00E8tres',
        fabNewChat: 'D\u00E9marrer le chat',
        fabNewChatExplained: 'D\u00E9marrer la discussion (Action flottante)',
        chatPinned: 'Discussion \u00E9pingl\u00E9e',
        draftedMessage: 'Message r\u00E9dig\u00E9',
        listOfChatMessages: 'Liste des messages de chat',
        listOfChats: 'Liste des discussions',
        saveTheWorld: 'Sauver le monde',
        tooltip: 'Commencez ici !',
        redirectToExpensifyClassicModal: {
            title: 'Bient\u00F4t disponible',
            description:
                "Nous ajustons encore quelques d\u00E9tails de New Expensify pour s'adapter \u00E0 votre configuration sp\u00E9cifique. En attendant, rendez-vous sur Expensify Classic.",
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domaines',
    },
    tabSelector: {
        chat: 'Discussion',
        room: 'Chambre',
        distance: 'Distance',
        manual: 'Manuel',
        scan: 'Scanner',
    },
    spreadsheet: {
        upload: 'T\u00E9l\u00E9charger une feuille de calcul',
        dragAndDrop: 'Faites glisser et d\u00E9posez votre feuille de calcul ici, ou choisissez un fichier ci-dessous. Formats pris en charge : .csv, .txt, .xls et .xlsx.',
        chooseSpreadsheet: 'S\u00E9lectionnez un fichier de feuille de calcul \u00E0 importer. Formats pris en charge : .csv, .txt, .xls et .xlsx.',
        fileContainsHeader: 'Le fichier contient des en-t\u00EAtes de colonnes',
        column: ({name}: SpreadSheetColumnParams) => `Colonne ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) =>
            `Oups ! Un champ requis (\u00AB ${fieldName} \u00BB) n'a pas \u00E9t\u00E9 associ\u00E9. Veuillez v\u00E9rifier et r\u00E9essayer.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `Oups ! Vous avez associ\u00E9 un seul champ ("${fieldName}") \u00E0 plusieurs colonnes. Veuillez v\u00E9rifier et r\u00E9essayer.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) =>
            `Oups ! Le champ (\u00AB ${fieldName} \u00BB) contient une ou plusieurs valeurs vides. Veuillez v\u00E9rifier et r\u00E9essayer.`,
        importSuccessfulTitle: 'Importation r\u00E9ussie',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) =>
            categories > 1 ? `${categories} cat\u00E9gories ont \u00E9t\u00E9 ajout\u00E9es.` : '1 cat\u00E9gorie a \u00E9t\u00E9 ajout\u00E9e.',
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return "Aucun membre n'a \u00E9t\u00E9 ajout\u00E9 ou mis \u00E0 jour.";
            }
            if (added && updated) {
                return `${added} membre${added > 1 ? 's' : ''} ajout\u00E9, ${updated} membre${updated > 1 ? 's' : ''} mis \u00E0 jour.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} membres ont \u00E9t\u00E9 mis \u00E0 jour.` : '1 membre a \u00E9t\u00E9 mis \u00E0 jour.';
            }
            return added > 1 ? `${added} membres ont \u00E9t\u00E9 ajout\u00E9s.` : '1 membre a \u00E9t\u00E9 ajout\u00E9.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) =>
            tags > 1 ? `${tags} tags ont \u00E9t\u00E9 ajout\u00E9s.` : '1 \u00E9tiquette a \u00E9t\u00E9 ajout\u00E9e.',
        importMultiLevelTagsSuccessfulDescription: 'Des balises multi-niveaux ont \u00E9t\u00E9 ajout\u00E9es.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `${rates} taux journaliers ont \u00E9t\u00E9 ajout\u00E9s.` : '1 taux de per diem a \u00E9t\u00E9 ajout\u00E9.',
        importFailedTitle: "\u00C9chec de l'importation",
        importFailedDescription: 'Veuillez vous assurer que tous les champs sont correctement remplis et r\u00E9essayez. Si le probl\u00E8me persiste, veuillez contacter Concierge.',
        importDescription:
            'Choisissez les champs \u00E0 mapper \u00E0 partir de votre feuille de calcul en cliquant sur le menu d\u00E9roulant \u00E0 c\u00F4t\u00E9 de chaque colonne import\u00E9e ci-dessous.',
        sizeNotMet: 'La taille du fichier doit \u00EAtre sup\u00E9rieure \u00E0 0 octet',
        invalidFileMessage:
            'Le fichier que vous avez t\u00E9l\u00E9charg\u00E9 est soit vide, soit contient des donn\u00E9es invalides. Veuillez vous assurer que le fichier est correctement format\u00E9 et contient les informations n\u00E9cessaires avant de le t\u00E9l\u00E9charger \u00E0 nouveau.',
        importSpreadsheet: 'Importer la feuille de calcul',
        downloadCSV: 'T\u00E9l\u00E9charger CSV',
    },
    receipt: {
        upload: 'T\u00E9l\u00E9charger le re\u00E7u',
        dragReceiptBeforeEmail: 'Faites glisser un re\u00E7u sur cette page, transf\u00E9rez un re\u00E7u \u00E0',
        dragReceiptAfterEmail: 'ou choisissez un fichier \u00E0 t\u00E9l\u00E9charger ci-dessous.',
        chooseReceipt: 'Choisissez un re\u00E7u \u00E0 t\u00E9l\u00E9charger ou transf\u00E9rez un re\u00E7u \u00E0',
        takePhoto: 'Prendre une photo',
        cameraAccess: "L'acc\u00E8s \u00E0 la cam\u00E9ra est n\u00E9cessaire pour prendre des photos des re\u00E7us.",
        deniedCameraAccess: "L'acc\u00E8s \u00E0 la cam\u00E9ra n'a toujours pas \u00E9t\u00E9 accord\u00E9, veuillez suivre",
        deniedCameraAccessInstructions: 'ces instructions',
        cameraErrorTitle: 'Erreur de cam\u00E9ra',
        cameraErrorMessage: "Une erreur s'est produite lors de la prise de la photo. Veuillez r\u00E9essayer.",
        locationAccessTitle: "Autoriser l'acc\u00E8s \u00E0 la localisation",
        locationAccessMessage: "L'acc\u00E8s \u00E0 la localisation nous aide \u00E0 garder votre fuseau horaire et votre devise pr\u00E9cis o\u00F9 que vous alliez.",
        locationErrorTitle: "Autoriser l'acc\u00E8s \u00E0 la localisation",
        locationErrorMessage: "L'acc\u00E8s \u00E0 la localisation nous aide \u00E0 garder votre fuseau horaire et votre devise pr\u00E9cis o\u00F9 que vous alliez.",
        allowLocationFromSetting: `L'acc\u00E8s \u00E0 la localisation nous aide \u00E0 maintenir votre fuseau horaire et votre devise pr\u00E9cis o\u00F9 que vous alliez. Veuillez autoriser l'acc\u00E8s \u00E0 la localisation dans les param\u00E8tres de permission de votre appareil.`,
        dropTitle: 'Laisse tomber',
        dropMessage: 'D\u00E9posez votre fichier ici',
        flash: 'flash',
        multiScan: 'multi-scan',
        shutter: 'obturateur',
        gallery: 'galerie',
        deleteReceipt: 'Supprimer le re\u00E7u',
        deleteConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce re\u00E7u ?',
        addReceipt: 'Ajouter un re\u00E7u',
    },
    quickAction: {
        scanReceipt: 'Scanner le re\u00E7u',
        recordDistance: 'Suivre la distance',
        requestMoney: 'Cr\u00E9er une d\u00E9pense',
        perDiem: 'Cr\u00E9er un per diem',
        splitBill: 'Fractionner la d\u00E9pense',
        splitScan: 'Diviser le re\u00E7u',
        splitDistance: 'Diviser la distance',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Payer ${name ?? "quelqu'un"}`,
        assignTask: 'Attribuer une t\u00E2che',
        header: 'Action rapide',
        noLongerHaveReportAccess: "Vous n'avez plus acc\u00E8s \u00E0 votre destination d'action rapide pr\u00E9c\u00E9dente. Choisissez-en une nouvelle ci-dessous.",
        updateDestination: 'Mettre \u00E0 jour la destination',
        createReport: 'Cr\u00E9er un rapport',
    },
    iou: {
        amount: 'Montant',
        taxAmount: 'Montant de la taxe',
        taxRate: "Taux d'imposition",
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Approuver ${formattedAmount}` : 'Approuver'),
        approved: 'Approuv\u00E9',
        cash: 'Esp\u00E8ces',
        card: 'Carte',
        original: 'Original',
        split: 'Diviser',
        splitExpense: 'Fractionner la d\u00E9pense',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} de ${merchant}`,
        addSplit: 'Ajouter une r\u00E9partition',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Le montant total est de ${amount} sup\u00E9rieur \u00E0 la d\u00E9pense originale.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Le montant total est de ${amount} inf\u00E9rieur \u00E0 la d\u00E9pense originale.`,
        splitExpenseZeroAmount: 'Veuillez entrer un montant valide avant de continuer.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Modifier ${amount} pour ${merchant}`,
        removeSplit: 'Supprimer la division',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Payer ${name ?? "quelqu'un"}`,
        expense: 'D\u00E9pense',
        categorize: 'Cat\u00E9goriser',
        share: 'Partager',
        participants: 'Participants',
        createExpense: 'Cr\u00E9er une d\u00E9pense',
        addExpense: 'Ajouter une d\u00E9pense',
        chooseRecipient: 'Choisir le destinataire',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Cr\u00E9er une d\u00E9pense de ${amount}`,
        confirmDetails: 'Confirmer les d\u00E9tails',
        pay: 'Payer',
        cancelPayment: 'Annuler le paiement',
        cancelPaymentConfirmation: '\u00CAtes-vous s\u00FBr de vouloir annuler ce paiement ?',
        viewDetails: 'Voir les d\u00E9tails',
        pending: 'En attente',
        canceled: 'Annul\u00E9',
        posted: 'Publi\u00E9',
        deleteReceipt: 'Supprimer le re\u00E7u',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `supprim\u00E9 une d\u00E9pense dans ce rapport, ${merchant} - ${amount}`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `a d\u00E9plac\u00E9 une d\u00E9pense${reportName ? `de ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `d\u00E9plac\u00E9 cette d\u00E9pense${reportName ? `\u00E0 <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: 'd\u00E9plac\u00E9 cette d\u00E9pense dans votre espace personnel',
        pendingMatchWithCreditCard: 'Re\u00E7u en attente de correspondance avec la transaction par carte',
        pendingMatch: 'Correspondance en attente',
        pendingMatchWithCreditCardDescription: 'Re\u00E7u en attente de correspondance avec la transaction par carte. Marquer comme esp\u00E8ce pour annuler.',
        markAsCash: 'Marquer comme esp\u00E8ce',
        routePending: 'Itin\u00E9raire en attente...',
        receiptScanning: () => ({
            one: 'Num\u00E9risation du re\u00E7u...',
            other: 'Num\u00E9risation des re\u00E7us...',
        }),
        scanMultipleReceipts: 'Scanner plusieurs re\u00E7us',
        scanMultipleReceiptsDescription: "Prenez des photos de tous vos re\u00E7us en une seule fois, puis confirmez les d\u00E9tails vous-m\u00EAme ou laissez SmartScan s'en charger.",
        receiptScanInProgress: 'Num\u00E9risation du re\u00E7u en cours',
        receiptScanInProgressDescription: 'Num\u00E9risation du re\u00E7u en cours. Revenez plus tard ou saisissez les d\u00E9tails maintenant.',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'D\u00E9penses potentiellement dupliqu\u00E9es identifi\u00E9es. V\u00E9rifiez les doublons pour permettre la soumission.'
                : "D\u00E9penses potentiellement dupliqu\u00E9es identifi\u00E9es. V\u00E9rifiez les doublons pour permettre l'approbation.",
        receiptIssuesFound: () => ({
            one: 'Probl\u00E8me trouv\u00E9',
            other: 'Probl\u00E8mes trouv\u00E9s',
        }),
        fieldPending: 'En attente...',
        defaultRate: 'Taux par d\u00E9faut',
        receiptMissingDetails: 'Re\u00E7u manquant de d\u00E9tails',
        missingAmount: 'Montant manquant',
        missingMerchant: 'Marchand manquant',
        receiptStatusTitle: 'Analyse en cours\u2026',
        receiptStatusText: 'Vous seul pouvez voir ce re\u00E7u lors de la num\u00E9risation. Revenez plus tard ou entrez les d\u00E9tails maintenant.',
        receiptScanningFailed: "L'analyse du re\u00E7u a \u00E9chou\u00E9. Veuillez entrer les d\u00E9tails manuellement.",
        transactionPendingDescription: 'Transaction en attente. Cela peut prendre quelques jours pour \u00EAtre affich\u00E9.',
        companyInfo: "Informations sur l'entreprise",
        companyInfoDescription: 'Nous avons besoin de quelques d\u00E9tails suppl\u00E9mentaires avant que vous puissiez envoyer votre premi\u00E8re facture.',
        yourCompanyName: 'Le nom de votre entreprise',
        yourCompanyWebsite: 'Le site web de votre entreprise',
        yourCompanyWebsiteNote: "Si vous n'avez pas de site web, vous pouvez fournir \u00E0 la place le profil LinkedIn ou le profil de m\u00E9dias sociaux de votre entreprise.",
        invalidDomainError: 'Vous avez saisi un domaine invalide. Pour continuer, veuillez entrer un domaine valide.',
        publicDomainError: 'Vous \u00EAtes entr\u00E9 dans un domaine public. Pour continuer, veuillez entrer un domaine priv\u00E9.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} en cours de num\u00E9risation`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} en attente`);
            }
            return {
                one: statusText.length > 0 ? `1 d\u00E9pense (${statusText.join(', ')})` : `1 d\u00E9pense`,
                other: (count: number) => (statusText.length > 0 ? `${count} d\u00E9penses (${statusText.join(', ')})` : `${count} d\u00E9penses`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 d\u00E9pense',
                other: (count: number) => `${count} d\u00E9penses`,
            };
        },
        deleteExpense: () => ({
            one: 'Supprimer la d\u00E9pense',
            other: 'Supprimer les d\u00E9penses',
        }),
        deleteConfirmation: () => ({
            one: '\u00CAtes-vous s\u00FBr de vouloir supprimer cette d\u00E9pense ?',
            other: '\u00CAtes-vous s\u00FBr de vouloir supprimer ces d\u00E9penses ?',
        }),
        deleteReport: 'Supprimer le rapport',
        deleteReportConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce rapport ?',
        settledExpensify: 'Pay\u00E9',
        done: 'Fait',
        settledElsewhere: 'Pay\u00E9 ailleurs',
        individual: 'Individuel',
        business: 'Business',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} avec Expensify` : `Payer avec Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} en tant qu'individu` : `Payer en tant qu'individu`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Payer ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} en tant qu'entreprise` : `Payer en tant qu'entreprise`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} ailleurs` : `Payer ailleurs`),
        nextStep: 'Prochaines \u00E9tapes',
        finished: 'Termin\u00E9',
        sendInvoice: ({amount}: RequestAmountParams) => `Envoyer la facture de ${amount}`,
        submitAmount: ({amount}: RequestAmountParams) => `Soumettre ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        submitted: `soumis`,
        automaticallySubmitted: `soumis via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">soumissions diff\u00E9r\u00E9es</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `suivi ${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `diviser ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Votre part ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} doit ${amount}${comment ? `pour ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} doit :`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''} a pay\u00E9 ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} a pay\u00E9 :`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} a d\u00E9pens\u00E9 ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} a d\u00E9pens\u00E9 :`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} a approuv\u00E9 :`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} a approuv\u00E9 ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `pay\u00E9 ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `pay\u00E9 ${amount}. Ajoutez un compte bancaire pour recevoir votre paiement.`,
        automaticallyApproved: `approuv\u00E9 via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">r\u00E8gles de l'espace de travail</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `approuv\u00E9 ${amount}`,
        approvedMessage: `approuv\u00E9`,
        unapproved: `non approuv\u00E9`,
        automaticallyForwarded: `approuv\u00E9 via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">r\u00E8gles de l'espace de travail</a>`,
        forwarded: `approuv\u00E9`,
        rejectedThisReport: 'a rejet\u00E9 ce rapport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `a commenc\u00E9 \u00E0 r\u00E9gler. Le paiement est en attente jusqu'\u00E0 ce que ${submitterDisplayName} ajoute un compte bancaire.`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''} a annul\u00E9 le paiement`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `a annul\u00E9 le paiement de ${amount}, car ${submitterDisplayName} n'a pas activ\u00E9 leur Expensify Wallet dans les 30 jours`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} a ajout\u00E9 un compte bancaire. Le paiement de ${amount} a \u00E9t\u00E9 effectu\u00E9.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}pay\u00E9 ailleurs`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''} pay\u00E9 avec Expensify`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''} pay\u00E9 avec Expensify via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">r\u00E8gles de l'espace de travail</a>`,
        noReimbursableExpenses: 'Ce rapport a un montant invalide',
        pendingConversionMessage: 'Le total sera mis \u00E0 jour lorsque vous serez de retour en ligne.',
        changedTheExpense: 'modifi\u00E9 la d\u00E9pense',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `le ${valueName} \u00E0 ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `d\u00E9finissez le ${translatedChangedField} sur ${newMerchant}, ce qui a d\u00E9fini le montant \u00E0 ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `le ${valueName} (pr\u00E9c\u00E9demment ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) =>
            `le ${valueName} \u00E0 ${newValueToDisplay} (pr\u00E9c\u00E9demment ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `a modifi\u00E9 le ${translatedChangedField} en ${newMerchant} (pr\u00E9c\u00E9demment ${oldMerchant}), ce qui a mis \u00E0 jour le montant \u00E0 ${newAmountToDisplay} (pr\u00E9c\u00E9demment ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `pour ${comment}` : 'd\u00E9pense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rapport de Facture n\u00B0${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} envoy\u00E9${comment ? `pour ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `a d\u00E9plac\u00E9 la d\u00E9pense de l'espace personnel vers ${workspaceName ?? `discuter avec ${reportName}`}`,
        movedToPersonalSpace: "d\u00E9plac\u00E9 la d\u00E9pense vers l'espace personnel",
        tagSelection: 'S\u00E9lectionnez une \u00E9tiquette pour mieux organiser vos d\u00E9penses.',
        categorySelection: 'S\u00E9lectionnez une cat\u00E9gorie pour mieux organiser vos d\u00E9penses.',
        error: {
            invalidCategoryLength: 'Le nom de la cat\u00E9gorie d\u00E9passe 255 caract\u00E8res. Veuillez le raccourcir ou choisir une autre cat\u00E9gorie.',
            invalidTagLength: "Le nom de l'\u00E9tiquette d\u00E9passe 255 caract\u00E8res. Veuillez le raccourcir ou choisir une autre \u00E9tiquette.",
            invalidAmount: 'Veuillez entrer un montant valide avant de continuer',
            invalidIntegerAmount: 'Veuillez entrer un montant en dollars entiers avant de continuer',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Le montant maximal de l'imp\u00F4t est ${amount}`,
            invalidSplit: 'La somme des r\u00E9partitions doit \u00EAtre \u00E9gale au montant total',
            invalidSplitParticipants: 'Veuillez entrer un montant sup\u00E9rieur \u00E0 z\u00E9ro pour au moins deux participants.',
            invalidSplitYourself: 'Veuillez entrer un montant non nul pour votre r\u00E9partition',
            noParticipantSelected: 'Veuillez s\u00E9lectionner un participant',
            other: 'Erreur inattendue. Veuillez r\u00E9essayer plus tard.',
            genericCreateFailureMessage: 'Erreur inattendue lors de la soumission de cette d\u00E9pense. Veuillez r\u00E9essayer plus tard.',
            genericCreateInvoiceFailureMessage: "Erreur inattendue lors de l'envoi de cette facture. Veuillez r\u00E9essayer plus tard.",
            genericHoldExpenseFailureMessage: 'Erreur inattendue lors de la mise en attente de cette d\u00E9pense. Veuillez r\u00E9essayer plus tard.',
            genericUnholdExpenseFailureMessage: 'Erreur inattendue lors de la suppression de la mise en attente de cette d\u00E9pense. Veuillez r\u00E9essayer plus tard.',
            receiptDeleteFailureError: 'Erreur inattendue lors de la suppression de ce re\u00E7u. Veuillez r\u00E9essayer plus tard.',
            receiptFailureMessage: "Une erreur s'est produite lors du t\u00E9l\u00E9chargement de votre re\u00E7u. Veuillez",
            receiptFailureMessageShort: "Une erreur s'est produite lors du t\u00E9l\u00E9chargement de votre re\u00E7u.",
            tryAgainMessage: 'r\u00E9essayer',
            saveFileMessage: 'enregistrer le re\u00E7u',
            uploadLaterMessage: '\u00E0 t\u00E9l\u00E9charger plus tard.',
            genericDeleteFailureMessage: 'Erreur inattendue lors de la suppression de cette d\u00E9pense. Veuillez r\u00E9essayer plus tard.',
            genericEditFailureMessage: 'Erreur inattendue lors de la modification de cette d\u00E9pense. Veuillez r\u00E9essayer plus tard.',
            genericSmartscanFailureMessage: 'La transaction a des champs manquants',
            duplicateWaypointsErrorMessage: 'Veuillez supprimer les points de passage en double',
            atLeastTwoDifferentWaypoints: 'Veuillez entrer au moins deux adresses diff\u00E9rentes.',
            splitExpenseMultipleParticipantsErrorMessage:
                "Une d\u00E9pense ne peut pas \u00EAtre r\u00E9partie entre un espace de travail et d'autres membres. Veuillez mettre \u00E0 jour votre s\u00E9lection.",
            invalidMerchant: 'Veuillez entrer un commer\u00E7ant valide',
            atLeastOneAttendee: 'Au moins un participant doit \u00EAtre s\u00E9lectionn\u00E9',
            invalidQuantity: 'Veuillez entrer une quantit\u00E9 valide',
            quantityGreaterThanZero: 'La quantit\u00E9 doit \u00EAtre sup\u00E9rieure \u00E0 z\u00E9ro',
            invalidSubrateLength: 'Il doit y avoir au moins un sous-taux',
            invalidRate: "Tarif non valide pour cet espace de travail. Veuillez s\u00E9lectionner un tarif disponible dans l'espace de travail.",
        },
        dismissReceiptError: "Ignorer l'erreur",
        dismissReceiptErrorConfirmation: 'Attention ! Ignorer cette erreur supprimera enti\u00E8rement votre re\u00E7u t\u00E9l\u00E9charg\u00E9. \u00CAtes-vous s\u00FBr ?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `a commenc\u00E9 \u00E0 r\u00E9gler. Le paiement est en attente jusqu'\u00E0 ce que ${submitterDisplayName} active son portefeuille.`,
        enableWallet: 'Activer le portefeuille',
        hold: 'Attente',
        unhold: 'Supprimer la suspension',
        holdExpense: 'Mettre la d\u00E9pense en attente',
        unholdExpense: 'D\u00E9bloquer la d\u00E9pense',
        heldExpense: 'a retenu cette d\u00E9pense',
        unheldExpense: 'annuler la retenue de cette d\u00E9pense',
        moveUnreportedExpense: 'D\u00E9placer la d\u00E9pense non signal\u00E9e',
        addUnreportedExpense: 'Ajouter une d\u00E9pense non d\u00E9clar\u00E9e',
        createNewExpense: 'Cr\u00E9er une nouvelle d\u00E9pense',
        selectUnreportedExpense: 'S\u00E9lectionnez au moins une d\u00E9pense \u00E0 ajouter au rapport.',
        emptyStateUnreportedExpenseTitle: 'Aucune d\u00E9pense non signal\u00E9e',
        emptyStateUnreportedExpenseSubtitle: "Il semble que vous n'ayez aucune d\u00E9pense non d\u00E9clar\u00E9e. Essayez d'en cr\u00E9er une ci-dessous.",
        addUnreportedExpenseConfirm: 'Ajouter au rapport',
        explainHold: 'Expliquez pourquoi vous retenez cette d\u00E9pense.',
        undoSubmit: 'Annuler la soumission',
        retracted: 'r\u00E9tract\u00E9',
        undoClose: 'Annuler la fermeture',
        reopened: 'rouvert',
        reopenReport: 'Rouvrir le rapport',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Ce rapport a d\u00E9j\u00E0 \u00E9t\u00E9 export\u00E9 vers ${connectionName}. Le modifier pourrait entra\u00EEner des \u00E9carts de donn\u00E9es. \u00CAtes-vous s\u00FBr de vouloir rouvrir ce rapport ?`,
        reason: 'Raison',
        holdReasonRequired: 'Un motif est requis lors de la mise en attente.',
        expenseWasPutOnHold: 'La d\u00E9pense a \u00E9t\u00E9 mise en attente',
        expenseOnHold: 'Cette d\u00E9pense a \u00E9t\u00E9 mise en attente. Veuillez consulter les commentaires pour les prochaines \u00E9tapes.',
        expensesOnHold: 'Toutes les d\u00E9penses ont \u00E9t\u00E9 mises en attente. Veuillez consulter les commentaires pour les prochaines \u00E9tapes.',
        expenseDuplicate: 'Cette d\u00E9pense a des d\u00E9tails similaires \u00E0 une autre. Veuillez examiner les doublons pour continuer.',
        someDuplicatesArePaid: 'Certains de ces doublons ont d\u00E9j\u00E0 \u00E9t\u00E9 approuv\u00E9s ou pay\u00E9s.',
        reviewDuplicates: 'Examiner les doublons',
        keepAll: 'Garder tout',
        confirmApprove: 'Confirmer le montant approuv\u00E9',
        confirmApprovalAmount: "Approuver uniquement les d\u00E9penses conformes, ou approuver l'ensemble du rapport.",
        confirmApprovalAllHoldAmount: () => ({
            one: "Cette d\u00E9pense est en attente. Voulez-vous l'approuver quand m\u00EAme ?",
            other: 'Ces d\u00E9penses sont en attente. Voulez-vous approuver quand m\u00EAme ?',
        }),
        confirmPay: 'Confirmer le montant du paiement',
        confirmPayAmount: "Payez ce qui n'est pas en attente, ou payez l'int\u00E9gralit\u00E9 du rapport.",
        confirmPayAllHoldAmount: () => ({
            one: 'Cette d\u00E9pense est en attente. Voulez-vous quand m\u00EAme payer ?',
            other: 'Ces d\u00E9penses sont en attente. Voulez-vous quand m\u00EAme payer ?',
        }),
        payOnly: 'Payer seulement',
        approveOnly: 'Approuver seulement',
        holdEducationalTitle: 'Cette demande est en cours',
        holdEducationalText: 'tenir',
        whatIsHoldExplain: "Mettre en attente, c'est comme appuyer sur \"pause\" pour demander plus de d\u00E9tails avant l'approbation ou le paiement d'une d\u00E9pense.",
        holdIsLeftBehind: "Les d\u00E9penses en attente sont d\u00E9plac\u00E9es vers un autre rapport lors de l'approbation ou du paiement.",
        unholdWhenReady: "Les approbateurs peuvent d\u00E9bloquer les d\u00E9penses lorsqu'elles sont pr\u00EAtes pour approbation ou paiement.",
        changePolicyEducational: {
            title: 'Vous avez d\u00E9plac\u00E9 ce rapport !',
            description: 'V\u00E9rifiez ces \u00E9l\u00E9ments, qui ont tendance \u00E0 changer lors du d\u00E9placement des rapports vers un nouvel espace de travail.',
            reCategorize: "<strong>Recat\u00E9gorisez toutes les d\u00E9penses</strong> pour respecter les r\u00E8gles de l'espace de travail.",
            workflows: "Ce rapport peut d\u00E9sormais \u00EAtre soumis \u00E0 un <strong>flux de travail d'approbation</strong> diff\u00E9rent.",
        },
        changeWorkspace: "Changer d'espace de travail",
        set: 'set',
        changed: 'chang\u00E9',
        removed: 'supprim\u00E9',
        transactionPending: 'Transaction en attente.',
        chooseARate: "S\u00E9lectionnez un taux de remboursement par mile ou kilom\u00E8tre pour l'espace de travail",
        unapprove: 'D\u00E9sapprouver',
        unapproveReport: 'D\u00E9sapprouver le rapport',
        headsUp: 'Attention !',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Ce rapport a d\u00E9j\u00E0 \u00E9t\u00E9 export\u00E9 vers ${accountingIntegration}. Le modifier pourrait entra\u00EEner des \u00E9carts de donn\u00E9es. \u00CAtes-vous s\u00FBr de vouloir d\u00E9sapprouver ce rapport ?`,
        reimbursable: 'remboursable',
        nonReimbursable: 'non-remboursable',
        bookingPending: 'Cette r\u00E9servation est en attente',
        bookingPendingDescription: "Cette r\u00E9servation est en attente car elle n'a pas encore \u00E9t\u00E9 pay\u00E9e.",
        bookingArchived: 'Cette r\u00E9servation est archiv\u00E9e',
        bookingArchivedDescription: 'Cette r\u00E9servation est archiv\u00E9e car la date du voyage est pass\u00E9e. Ajoutez une d\u00E9pense pour le montant final si n\u00E9cessaire.',
        attendees: 'Participants',
        whoIsYourAccountant: 'Qui est votre comptable ?',
        paymentComplete: 'Paiement termin\u00E9',
        time: 'Temps',
        startDate: 'Date de d\u00E9but',
        endDate: 'Date de fin',
        startTime: 'Heure de d\u00E9but',
        endTime: 'Heure de fin',
        deleteSubrate: 'Supprimer le sous-taux',
        deleteSubrateConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce sous-taux ?',
        quantity: 'Quantit\u00E9',
        subrateSelection: 'S\u00E9lectionnez un sous-taux et entrez une quantit\u00E9.',
        qty: 'Qt\u00E9',
        firstDayText: () => ({
            one: `Premier jour : 1 heure`,
            other: (count: number) => `Premier jour : ${count.toFixed(2)} heures`,
        }),
        lastDayText: () => ({
            one: `Dernier jour : 1 heure`,
            other: (count: number) => `Dernier jour : ${count.toFixed(2)} heures`,
        }),
        tripLengthText: () => ({
            one: `Voyage : 1 jour complet`,
            other: (count: number) => `Voyage : ${count} jours complets`,
        }),
        dates: 'Dates',
        rates: 'Tarifs',
        submitsTo: ({name}: SubmitsToParams) => `Soumet \u00E0 ${name}`,
        moveExpenses: () => ({one: 'D\u00E9placer la d\u00E9pense', other: 'D\u00E9placer les d\u00E9penses'}),
    },
    share: {
        shareToExpensify: 'Partager sur Expensify',
        messageInputLabel: 'Message',
    },
    notificationPreferencesPage: {
        header: 'Pr\u00E9f\u00E9rences de notification',
        label: 'Me notifier des nouveaux messages',
        notificationPreferences: {
            always: 'Imm\u00E9diatement',
            daily: 'Quotidiennement',
            mute: 'Muet',
            hidden: 'Cach\u00E9',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "Le num\u00E9ro n'a pas \u00E9t\u00E9 valid\u00E9. Cliquez sur le bouton pour renvoyer le lien de validation par SMS.",
        emailHasNotBeenValidated: "L'e-mail n'a pas \u00E9t\u00E9 valid\u00E9. Cliquez sur le bouton pour renvoyer le lien de validation par SMS.",
    },
    avatarWithImagePicker: {
        uploadPhoto: 'T\u00E9l\u00E9charger la photo',
        removePhoto: 'Supprimer la photo',
        editImage: 'Modifier la photo',
        viewPhoto: 'Voir la photo',
        imageUploadFailed: "\u00C9chec du t\u00E9l\u00E9chargement de l'image",
        deleteWorkspaceError: "D\u00E9sol\u00E9, un probl\u00E8me inattendu est survenu lors de la suppression de l'avatar de votre espace de travail.",
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `L'image s\u00E9lectionn\u00E9e d\u00E9passe la taille maximale de t\u00E9l\u00E9chargement de ${maxUploadSizeInMB} Mo.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Veuillez t\u00E9l\u00E9charger une image plus grande que ${minHeightInPx}x${minWidthInPx} pixels et plus petite que ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `La photo de profil doit \u00EAtre l'un des types suivants : ${allowedExtensions.join(', ')}.`,
    },
    modal: {
        backdropLabel: 'Toile de fond du modal',
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Pronoms pr\u00E9f\u00E9r\u00E9s',
        selectYourPronouns: 'S\u00E9lectionnez vos pronoms',
        selfSelectYourPronoun: 'S\u00E9lectionnez votre pronom vous-m\u00EAme',
        emailAddress: 'Adresse e-mail',
        setMyTimezoneAutomatically: 'D\u00E9finir mon fuseau horaire automatiquement',
        timezone: 'Fuseau horaire',
        invalidFileMessage: 'Fichier invalide. Veuillez essayer une autre image.',
        avatarUploadFailureMessage: "Une erreur s'est produite lors du t\u00E9l\u00E9chargement de l'avatar. Veuillez r\u00E9essayer.",
        online: 'En ligne',
        offline: 'Hors ligne',
        syncing: 'Synchronisation',
        profileAvatar: 'Avatar de profil',
        publicSection: {
            title: 'Public',
            subtitle: 'Ces d\u00E9tails sont affich\u00E9s sur votre profil public. Tout le monde peut les voir.',
        },
        privateSection: {
            title: 'Priv\u00E9',
            subtitle: 'Ces d\u00E9tails sont utilis\u00E9s pour les voyages et les paiements. Ils ne sont jamais affich\u00E9s sur votre profil public.',
        },
    },
    securityPage: {
        title: 'Options de s\u00E9curit\u00E9',
        subtitle: "Activez l'authentification \u00E0 deux facteurs pour s\u00E9curiser votre compte.",
        goToSecurity: 'Retourner \u00E0 la page de s\u00E9curit\u00E9',
    },
    shareCodePage: {
        title: 'Votre code',
        subtitle: 'Invitez des membres \u00E0 Expensify en partageant votre code QR personnel ou votre lien de parrainage.',
    },
    pronounsPage: {
        pronouns: 'Pronoms',
        isShownOnProfile: 'Vos pronoms sont affich\u00E9s sur votre profil.',
        placeholderText: 'Recherchez pour voir les options',
    },
    contacts: {
        contactMethod: 'M\u00E9thode de contact',
        contactMethods: 'M\u00E9thodes de contact',
        featureRequiresValidate: 'Cette fonctionnalit\u00E9 n\u00E9cessite que vous validiez votre compte.',
        validateAccount: 'Validez votre compte',
        helpTextBeforeEmail: 'Ajoutez plus de moyens pour que les gens vous trouvent, et transf\u00E9rez les re\u00E7us \u00E0',
        helpTextAfterEmail: '\u00E0 partir de plusieurs adresses e-mail.',
        pleaseVerify: 'Veuillez v\u00E9rifier cette m\u00E9thode de contact',
        getInTouch: 'Chaque fois que nous devons vous contacter, nous utiliserons cette m\u00E9thode de contact.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Veuillez entrer le code magique envoy\u00E9 \u00E0 ${contactMethod}. Il devrait arriver d'ici une \u00E0 deux minutes.`,
        setAsDefault: 'D\u00E9finir comme d\u00E9faut',
        yourDefaultContactMethod:
            'Ceci est votre m\u00E9thode de contact par d\u00E9faut actuelle. Avant de pouvoir la supprimer, vous devez choisir une autre m\u00E9thode de contact et cliquer sur \u00AB D\u00E9finir par d\u00E9faut \u00BB.',
        removeContactMethod: 'Supprimer la m\u00E9thode de contact',
        removeAreYouSure: '\u00CAtes-vous s\u00FBr de vouloir supprimer cette m\u00E9thode de contact ? Cette action est irr\u00E9versible.',
        failedNewContact: "\u00C9chec de l'ajout de ce moyen de contact.",
        genericFailureMessages: {
            requestContactMethodValidateCode: "\u00C9chec de l'envoi d'un nouveau code magique. Veuillez patienter un peu et r\u00E9essayer.",
            validateSecondaryLogin: 'Code magique incorrect ou invalide. Veuillez r\u00E9essayer ou demander un nouveau code.',
            deleteContactMethod: "\u00C9chec de la suppression de la m\u00E9thode de contact. Veuillez contacter Concierge pour obtenir de l'aide.",
            setDefaultContactMethod: "\u00C9chec de la d\u00E9finition d'une nouvelle m\u00E9thode de contact par d\u00E9faut. Veuillez contacter Concierge pour obtenir de l'aide.",
            addContactMethod: "\u00C9chec de l'ajout de cette m\u00E9thode de contact. Veuillez contacter Concierge pour obtenir de l'aide.",
            enteredMethodIsAlreadySubmitted: 'Cette m\u00E9thode de contact existe d\u00E9j\u00E0',
            passwordRequired: 'mot de passe requis.',
            contactMethodRequired: 'La m\u00E9thode de contact est requise',
            invalidContactMethod: 'M\u00E9thode de contact invalide',
        },
        newContactMethod: 'Nouvelle m\u00E9thode de contact',
        goBackContactMethods: 'Retourner aux m\u00E9thodes de contact',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Il / Lui / Son',
        heHimHisTheyThemTheirs: 'Il / Lui / Son / Ils / Eux / Leurs',
        sheHerHers: 'Elle / Elle / Sienne',
        sheHerHersTheyThemTheirs: 'Elle / Elle / Sienne / Iel / Iel / Leurs',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Par / Pers',
        theyThemTheirs: 'Ils / Elles / Leurs',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Appelle-moi par mon nom',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: "Nom d'affichage",
        isShownOnProfile: "Votre nom d'affichage est visible sur votre profil.",
    },
    timezonePage: {
        timezone: 'Fuseau horaire',
        isShownOnProfile: 'Votre fuseau horaire est affich\u00E9 sur votre profil.',
        getLocationAutomatically: 'D\u00E9terminer automatiquement votre emplacement',
    },
    updateRequiredView: {
        updateRequired: 'Mise \u00E0 jour requise',
        pleaseInstall: 'Veuillez mettre \u00E0 jour vers la derni\u00E8re version de New Expensify.',
        pleaseInstallExpensifyClassic: "Veuillez installer la derni\u00E8re version d'Expensify.",
        toGetLatestChanges: 'Pour mobile ou ordinateur de bureau, t\u00E9l\u00E9chargez et installez la derni\u00E8re version. Pour le web, actualisez votre navigateur.',
        newAppNotAvailable: "L'application New Expensify n'est plus disponible.",
    },
    initialSettingsPage: {
        about: '\u00C0 propos',
        aboutPage: {
            description:
                "La nouvelle application Expensify est construite par une communaut\u00E9 de d\u00E9veloppeurs open-source du monde entier. Aidez-nous \u00E0 construire l'avenir d'Expensify.",
            appDownloadLinks: "Liens de t\u00E9l\u00E9chargement de l'application",
            viewKeyboardShortcuts: 'Voir les raccourcis clavier',
            viewTheCode: 'Voir le code',
            viewOpenJobs: "Voir les offres d'emploi ouvertes",
            reportABug: 'Signaler un bug',
            troubleshoot: 'D\u00E9panner',
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
            clearCacheAndRestart: 'Effacer le cache et red\u00E9marrer',
            viewConsole: 'Afficher la console de d\u00E9bogage',
            debugConsole: 'Console de d\u00E9bogage',
            description:
                "Utilisez les outils ci-dessous pour vous aider \u00E0 r\u00E9soudre les probl\u00E8mes de l'exp\u00E9rience Expensify. Si vous rencontrez des probl\u00E8mes, veuillez",
            submitBug: 'soumettre un bug',
            confirmResetDescription: 'Tous les brouillons de messages non envoy\u00E9s seront perdus, mais le reste de vos donn\u00E9es est en s\u00E9curit\u00E9.',
            resetAndRefresh: 'R\u00E9initialiser et actualiser',
            clientSideLogging: 'Journalisation c\u00F4t\u00E9 client',
            noLogsToShare: 'Aucun journal \u00E0 partager',
            useProfiling: 'Utiliser le profilage',
            profileTrace: 'Trace de profil',
            releaseOptions: 'Options de publication',
            testingPreferences: 'Pr\u00E9f\u00E9rences de test',
            useStagingServer: 'Utiliser le serveur de staging',
            forceOffline: 'Forcer hors ligne',
            simulatePoorConnection: 'Simuler une mauvaise connexion Internet',
            simulateFailingNetworkRequests: 'Simuler des \u00E9checs de requ\u00EAtes r\u00E9seau',
            authenticationStatus: "Statut d'authentification",
            deviceCredentials: "Identifiants de l'appareil",
            invalidate: 'Invalider',
            destroy: 'D\u00E9truire',
            maskExportOnyxStateData: "Masquer les donn\u00E9es sensibles des membres lors de l'exportation de l'\u00E9tat Onyx",
            exportOnyxState: "Exporter l'\u00E9tat Onyx",
            importOnyxState: "Importer l'\u00E9tat Onyx",
            testCrash: 'Test crash',
            resetToOriginalState: "R\u00E9initialiser \u00E0 l'\u00E9tat d'origine",
            usingImportedState: 'Vous utilisez un \u00E9tat import\u00E9. Appuyez ici pour le r\u00E9initialiser.',
            debugMode: 'Mode d\u00E9bogage',
            invalidFile: 'Fichier invalide',
            invalidFileDescription: "Le fichier que vous essayez d'importer n'est pas valide. Veuillez r\u00E9essayer.",
            invalidateWithDelay: 'Invalider avec d\u00E9lai',
        },
        debugConsole: {
            saveLog: 'Enregistrer le journal',
            shareLog: 'Partager le journal',
            enterCommand: 'Entrer la commande',
            execute: 'Ex\u00E9cuter',
            noLogsAvailable: 'Aucun journal disponible',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `La taille du journal d\u00E9passe la limite de ${size} Mo. Veuillez utiliser "Enregistrer le journal" pour t\u00E9l\u00E9charger le fichier journal \u00E0 la place.`,
            logs: 'Journaux',
            viewConsole: 'Afficher la console',
        },
        security: 'S\u00E9curit\u00E9',
        signOut: 'D\u00E9connexion',
        restoreStashed: 'Restaurer la connexion mise en attente',
        signOutConfirmationText: 'Vous perdrez toutes les modifications hors ligne si vous vous d\u00E9connectez.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Lire le',
            phrase2: "Conditions d'utilisation",
            phrase3: 'et',
            phrase4: 'Confidentialit\u00E9',
        },
        help: 'Aide',
        accountSettings: 'Param\u00E8tres du compte',
        account: 'Compte',
        general: 'G\u00E9n\u00E9ral',
    },
    closeAccountPage: {
        closeAccount: 'Fermer le compte',
        reasonForLeavingPrompt: 'Nous serions d\u00E9sol\u00E9s de vous voir partir ! Pourriez-vous nous dire pourquoi, afin que nous puissions nous am\u00E9liorer ?',
        enterMessageHere: 'Entrez le message ici',
        closeAccountWarning: 'La fermeture de votre compte est irr\u00E9versible.',
        closeAccountPermanentlyDeleteData: '\u00CAtes-vous s\u00FBr de vouloir supprimer votre compte ? Cela supprimera d\u00E9finitivement toutes les d\u00E9penses en cours.',
        enterDefaultContactToConfirm:
            'Veuillez entrer votre m\u00E9thode de contact par d\u00E9faut pour confirmer que vous souhaitez fermer votre compte. Votre m\u00E9thode de contact par d\u00E9faut est :',
        enterDefaultContact: 'Entrez votre m\u00E9thode de contact par d\u00E9faut',
        defaultContact: 'M\u00E9thode de contact par d\u00E9faut :',
        enterYourDefaultContactMethod: 'Veuillez entrer votre m\u00E9thode de contact par d\u00E9faut pour fermer votre compte.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Fusionner les comptes',
        accountDetails: {
            accountToMergeInto: 'Entrez le compte que vous souhaitez fusionner avec',
            notReversibleConsent: "Je comprends que cela n'est pas r\u00E9versible.",
        },
        accountValidate: {
            confirmMerge: '\u00CAtes-vous s\u00FBr de vouloir fusionner les comptes ?',
            lossOfUnsubmittedData: `La fusion de vos comptes est irr\u00E9versible et entra\u00EEnera la perte de toutes les d\u00E9penses non soumises pour`,
            enterMagicCode: `Pour continuer, veuillez entrer le code magique envoy\u00E9 \u00E0`,
            errors: {
                incorrectMagicCode: 'Code magique incorrect ou invalide. Veuillez r\u00E9essayer ou demander un nouveau code.',
                fallback: "Une erreur s'est produite. Veuillez r\u00E9essayer plus tard.",
            },
        },
        mergeSuccess: {
            accountsMerged: 'Comptes fusionn\u00E9s !',
            successfullyMergedAllData: {
                beforeFirstEmail: `Vous avez fusionn\u00E9 avec succ\u00E8s toutes les donn\u00E9es de`,
                beforeSecondEmail: `dans`,
                afterSecondEmail: `. \u00C0 l'avenir, vous pouvez utiliser l'un ou l'autre identifiant pour ce compte.`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Nous y travaillons',
            limitedSupport: 'Nous ne prenons pas encore en charge la fusion des comptes sur New Expensify. Veuillez effectuer cette action sur Expensify Classic \u00E0 la place.',
            reachOutForHelp: {
                beforeLink: "N'h\u00E9sitez pas \u00E0",
                linkText: 'contactez Concierge',
                afterLink: 'si vous avez des questions !',
            },
            goToExpensifyClassic: 'Aller \u00E0 Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Vous ne pouvez pas fusionner',
            beforeDomain: "car c'est contr\u00F4l\u00E9 par",
            afterDomain: ". S'il vous pla\u00EEt",
            linkText: 'contactez Concierge',
            afterLink: 'pour assistance.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail:
                "dans d'autres comptes car votre administrateur de domaine l'a d\u00E9fini comme votre connexion principale. Veuillez plut\u00F4t fusionner d'autres comptes avec celui-ci.",
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Vous ne pouvez pas fusionner les comptes car',
                beforeSecondEmail: "a l'authentification \u00E0 deux facteurs (2FA) activ\u00E9e. Veuillez d\u00E9sactiver 2FA pour",
                afterSecondEmail: 'et essayez \u00E0 nouveau.',
            },
            learnMore: 'En savoir plus sur la fusion des comptes.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: 'car il est verrouill\u00E9. Veuillez',
            linkText: 'contactez Concierge',
            afterLink: `pour assistance.`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Vous ne pouvez pas fusionner les comptes car',
                afterEmail: "n'a pas de compte Expensify.",
            },
            addContactMethod: {
                beforeLink: "S'il vous pla\u00EEt",
                linkText: 'ajoutez-le comme m\u00E9thode de contact',
                afterLink: 'instead.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: "dans d'autres comptes. Veuillez fusionner les autres comptes avec celui-ci \u00E0 la place.",
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: "dans d'autres comptes car c'est le propri\u00E9taire de facturation d'un compte factur\u00E9. Veuillez plut\u00F4t fusionner d'autres comptes avec celui-ci.",
        },
        mergeFailureTooManyAttempts: {
            heading: 'R\u00E9essayez plus tard',
            description: 'Il y a eu trop de tentatives de fusion de comptes. Veuillez r\u00E9essayer plus tard.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "Vous ne pouvez pas fusionner avec d'autres comptes car il n'est pas valid\u00E9. Veuillez valider le compte et r\u00E9essayer.",
        },
        mergeFailureSelfMerge: {
            description: 'Vous ne pouvez pas fusionner un compte avec lui-m\u00EAme.',
        },
        mergeFailureGenericHeading: 'Impossible de fusionner les comptes',
    },
    lockAccountPage: {
        lockAccount: 'Verrouiller le compte',
        unlockAccount: 'D\u00E9verrouiller le compte',
        compromisedDescription:
            'Si vous soup\u00E7onnez que votre compte Expensify est compromis, vous pouvez le verrouiller pour emp\u00EAcher de nouvelles transactions avec la carte Expensify et bloquer les modifications ind\u00E9sirables du compte.',
        domainAdminsDescriptionPartOne: 'Pour les administrateurs de domaine,',
        domainAdminsDescriptionPartTwo: 'cette action arr\u00EAte toute activit\u00E9 de la carte Expensify et les actions administratives',
        domainAdminsDescriptionPartThree: "sur l'ensemble de votre/vos domaine(s).",
        warning: `Une fois que votre compte est verrouill\u00E9, notre \u00E9quipe enqu\u00EAtera et supprimera tout acc\u00E8s non autoris\u00E9. Pour retrouver l'acc\u00E8s, vous devrez travailler avec Concierge pour s\u00E9curiser votre compte.`,
    },
    failedToLockAccountPage: {
        failedToLockAccount: '\u00C9chec du verrouillage du compte',
        failedToLockAccountDescription: `Nous n'avons pas pu verrouiller votre compte. Veuillez discuter avec Concierge pour r\u00E9soudre ce probl\u00E8me.`,
        chatWithConcierge: 'Discuter avec Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Compte verrouill\u00E9',
        yourAccountIsLocked: 'Votre compte est verrouill\u00E9',
        chatToConciergeToUnlock: 'Discutez avec Concierge pour r\u00E9soudre les probl\u00E8mes de s\u00E9curit\u00E9 et d\u00E9bloquer votre compte.',
        chatWithConcierge: 'Discuter avec Concierge',
    },
    passwordPage: {
        changePassword: 'Changer le mot de passe',
        changingYourPasswordPrompt: 'Changer votre mot de passe mettra \u00E0 jour votre mot de passe pour vos comptes Expensify.com et New Expensify.',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        newPasswordPrompt:
            'Votre nouveau mot de passe doit \u00EAtre diff\u00E9rent de votre ancien mot de passe et contenir au moins 8 caract\u00E8res, 1 lettre majuscule, 1 lettre minuscule et 1 chiffre.',
    },
    twoFactorAuth: {
        headerTitle: 'Authentification \u00E0 deux facteurs',
        twoFactorAuthEnabled: 'Authentification \u00E0 deux facteurs activ\u00E9e',
        whatIsTwoFactorAuth:
            "L'authentification \u00E0 deux facteurs (2FA) aide \u00E0 s\u00E9curiser votre compte. Lors de la connexion, vous devrez entrer un code g\u00E9n\u00E9r\u00E9 par votre application d'authentification pr\u00E9f\u00E9r\u00E9e.",
        disableTwoFactorAuth: "D\u00E9sactiver l'authentification \u00E0 deux facteurs",
        explainProcessToRemove: "Pour d\u00E9sactiver l'authentification \u00E0 deux facteurs (2FA), veuillez entrer un code valide depuis votre application d'authentification.",
        disabled: "L'authentification \u00E0 deux facteurs est maintenant d\u00E9sactiv\u00E9e",
        noAuthenticatorApp: "Vous n'aurez plus besoin d'une application d'authentification pour vous connecter \u00E0 Expensify.",
        stepCodes: 'Codes de r\u00E9cup\u00E9ration',
        keepCodesSafe: 'Gardez ces codes de r\u00E9cup\u00E9ration en s\u00E9curit\u00E9 !',
        codesLoseAccess:
            "Si vous perdez l'acc\u00E8s \u00E0 votre application d'authentification et n'avez pas ces codes, vous perdrez l'acc\u00E8s \u00E0 votre compte.\n\nRemarque : La configuration de l'authentification \u00E0 deux facteurs vous d\u00E9connectera de toutes les autres sessions actives.",
        errorStepCodes: 'Veuillez copier ou t\u00E9l\u00E9charger les codes avant de continuer.',
        stepVerify: 'V\u00E9rifier',
        scanCode: 'Scannez le code QR avec votre',
        authenticatorApp: "application d'authentification",
        addKey: "Ou ajoutez cette cl\u00E9 secr\u00E8te \u00E0 votre application d'authentification :",
        enterCode: "Ensuite, entrez le code \u00E0 six chiffres g\u00E9n\u00E9r\u00E9 par votre application d'authentification.",
        stepSuccess: 'Termin\u00E9',
        enabled: 'Authentification \u00E0 deux facteurs activ\u00E9e',
        congrats: 'F\u00E9licitations ! Vous avez maintenant cette s\u00E9curit\u00E9 suppl\u00E9mentaire.',
        copy: 'Copier',
        disable: 'D\u00E9sactiver',
        enableTwoFactorAuth: "Activer l'authentification \u00E0 deux facteurs",
        pleaseEnableTwoFactorAuth: "Veuillez activer l'authentification \u00E0 deux facteurs.",
        twoFactorAuthIsRequiredDescription: "Pour des raisons de s\u00E9curit\u00E9, Xero exige une authentification \u00E0 deux facteurs pour connecter l'int\u00E9gration.",
        twoFactorAuthIsRequiredForAdminsHeader: 'Authentification \u00E0 deux facteurs requise',
        twoFactorAuthIsRequiredForAdminsTitle: "Veuillez activer l'authentification \u00E0 deux facteurs",
        twoFactorAuthIsRequiredForAdminsDescription:
            "Votre connexion comptable Xero n\u00E9cessite l'utilisation de l'authentification \u00E0 deux facteurs. Pour continuer \u00E0 utiliser Expensify, veuillez l'activer.",
        twoFactorAuthCannotDisable: 'Impossible de d\u00E9sactiver la 2FA',
        twoFactorAuthRequired: "L'authentification \u00E0 deux facteurs (2FA) est requise pour votre connexion Xero et ne peut pas \u00EAtre d\u00E9sactiv\u00E9e.",
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Veuillez entrer votre code de r\u00E9cup\u00E9ration',
            incorrectRecoveryCode: 'Code de r\u00E9cup\u00E9ration incorrect. Veuillez r\u00E9essayer.',
        },
        useRecoveryCode: 'Utiliser le code de r\u00E9cup\u00E9ration',
        recoveryCode: 'Code de r\u00E9cup\u00E9ration',
        use2fa: "Utilisez le code d'authentification \u00E0 deux facteurs",
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: "Veuillez entrer votre code d'authentification \u00E0 deux facteurs",
            incorrect2fa: "Code d'authentification \u00E0 deux facteurs incorrect. Veuillez r\u00E9essayer.",
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Mot de passe mis \u00E0 jour !',
        allSet: 'Vous \u00EAtes pr\u00EAt. Gardez votre nouveau mot de passe en s\u00E9curit\u00E9.',
    },
    privateNotes: {
        title: 'Notes priv\u00E9es',
        personalNoteMessage: 'Gardez des notes sur cette discussion ici. Vous \u00EAtes la seule personne qui peut ajouter, modifier ou voir ces notes.',
        sharedNoteMessage: "Conservez des notes sur cette discussion ici. Les employ\u00E9s d'Expensify et les autres membres du domaine team.expensify.com peuvent consulter ces notes.",
        composerLabel: 'Notes',
        myNote: 'Ma note',
        error: {
            genericFailureMessage: "Les notes priv\u00E9es n'ont pas pu \u00EAtre enregistr\u00E9es.",
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Veuillez entrer un code de s\u00E9curit\u00E9 valide',
        },
        securityCode: 'Code de s\u00E9curit\u00E9',
        changeBillingCurrency: 'Changer la devise de facturation',
        changePaymentCurrency: 'Changer la devise de paiement',
        paymentCurrency: 'Devise de paiement',
        paymentCurrencyDescription: 'S\u00E9lectionnez une devise standardis\u00E9e \u00E0 laquelle toutes les d\u00E9penses personnelles doivent \u00EAtre converties.',
        note: 'Remarque : Changer votre devise de paiement peut influencer le montant que vous paierez pour Expensify. Consultez notre',
        noteLink: 'page de tarification',
        noteDetails: 'pour plus de d\u00E9tails.',
    },
    addDebitCardPage: {
        addADebitCard: 'Ajouter une carte de d\u00E9bit',
        nameOnCard: 'Nom sur la carte',
        debitCardNumber: 'Num\u00E9ro de carte de d\u00E9bit',
        expiration: "Date d'expiration",
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adresse de facturation',
        growlMessageOnSave: 'Votre carte de d\u00E9bit a \u00E9t\u00E9 ajout\u00E9e avec succ\u00E8s',
        expensifyPassword: 'Mot de passe Expensify',
        error: {
            invalidName: 'Le nom ne peut inclure que des lettres',
            addressZipCode: 'Veuillez entrer un code postal valide',
            debitCardNumber: 'Veuillez entrer un num\u00E9ro de carte de d\u00E9bit valide',
            expirationDate: "Veuillez s\u00E9lectionner une date d'expiration valide",
            securityCode: 'Veuillez entrer un code de s\u00E9curit\u00E9 valide',
            addressStreet: "Veuillez entrer une adresse de facturation valide qui n'est pas une bo\u00EEte postale.",
            addressState: 'Veuillez s\u00E9lectionner un \u00E9tat',
            addressCity: 'Veuillez entrer une ville',
            genericFailureMessage: "Une erreur s'est produite lors de l'ajout de votre carte. Veuillez r\u00E9essayer.",
            password: 'Veuillez entrer votre mot de passe Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Ajouter une carte de paiement',
        nameOnCard: 'Nom sur la carte',
        paymentCardNumber: 'Num\u00E9ro de carte',
        expiration: "Date d'expiration",
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adresse de facturation',
        growlMessageOnSave: 'Votre carte de paiement a \u00E9t\u00E9 ajout\u00E9e avec succ\u00E8s',
        expensifyPassword: 'Mot de passe Expensify',
        error: {
            invalidName: 'Le nom ne peut inclure que des lettres',
            addressZipCode: 'Veuillez entrer un code postal valide',
            paymentCardNumber: 'Veuillez entrer un num\u00E9ro de carte valide',
            expirationDate: "Veuillez s\u00E9lectionner une date d'expiration valide",
            securityCode: 'Veuillez entrer un code de s\u00E9curit\u00E9 valide',
            addressStreet: "Veuillez entrer une adresse de facturation valide qui n'est pas une bo\u00EEte postale.",
            addressState: 'Veuillez s\u00E9lectionner un \u00E9tat',
            addressCity: 'Veuillez entrer une ville',
            genericFailureMessage: "Une erreur s'est produite lors de l'ajout de votre carte. Veuillez r\u00E9essayer.",
            password: 'Veuillez entrer votre mot de passe Expensify',
        },
    },
    walletPage: {
        balance: 'Solde',
        paymentMethodsTitle: 'M\u00E9thodes de paiement',
        setDefaultConfirmation: 'D\u00E9finir le mode de paiement par d\u00E9faut',
        setDefaultSuccess: 'M\u00E9thode de paiement par d\u00E9faut d\u00E9finie !',
        deleteAccount: 'Supprimer le compte',
        deleteConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce compte ?',
        error: {
            notOwnerOfBankAccount: "Une erreur s'est produite lors de la d\u00E9finition de ce compte bancaire comme m\u00E9thode de paiement par d\u00E9faut.",
            invalidBankAccount: 'Ce compte bancaire est temporairement suspendu',
            notOwnerOfFund: "Une erreur s'est produite lors de la d\u00E9finition de cette carte comme votre m\u00E9thode de paiement par d\u00E9faut.",
            setDefaultFailure: "Un probl\u00E8me est survenu. Veuillez discuter avec Concierge pour obtenir de l'aide.",
        },
        addBankAccountFailure: "Une erreur inattendue s'est produite lors de l'ajout de votre compte bancaire. Veuillez r\u00E9essayer.",
        getPaidFaster: 'Soyez pay\u00E9 plus rapidement',
        addPaymentMethod: "Ajoutez un moyen de paiement pour envoyer et recevoir des paiements directement dans l'application.",
        getPaidBackFaster: 'Soyez rembours\u00E9 plus rapidement',
        secureAccessToYourMoney: 'Acc\u00E9dez \u00E0 votre argent en toute s\u00E9curit\u00E9',
        receiveMoney: "Recevez de l'argent dans votre devise locale",
        expensifyWallet: 'Expensify Wallet (B\u00EAta)',
        sendAndReceiveMoney: "Envoyez et recevez de l'argent avec des amis. Comptes bancaires am\u00E9ricains uniquement.",
        enableWallet: 'Activer le portefeuille',
        addBankAccountToSendAndReceive: 'Soyez rembours\u00E9 pour les d\u00E9penses que vous soumettez \u00E0 un espace de travail.',
        addBankAccount: 'Ajouter un compte bancaire',
        assignedCards: 'Cartes assign\u00E9es',
        assignedCardsDescription: "Ce sont des cartes attribu\u00E9es par un administrateur d'espace de travail pour g\u00E9rer les d\u00E9penses de l'entreprise.",
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Nous examinons vos informations. Veuillez revenir dans quelques minutes !',
        walletActivationFailed:
            "Malheureusement, votre portefeuille ne peut pas \u00EAtre activ\u00E9 pour le moment. Veuillez discuter avec Concierge pour obtenir de l'aide suppl\u00E9mentaire.",
        addYourBankAccount: 'Ajoutez votre compte bancaire',
        addBankAccountBody: "Connectons votre compte bancaire \u00E0 Expensify pour qu'il soit plus facile que jamais d'envoyer et de recevoir des paiements directement dans l'application.",
        chooseYourBankAccount: 'Choisissez votre compte bancaire',
        chooseAccountBody: 'Assurez-vous de s\u00E9lectionner le bon.',
        confirmYourBankAccount: 'Confirmez votre compte bancaire',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Carte de voyage Expensify',
        availableSpend: 'Limite restante',
        smartLimit: {
            name: 'Limite intelligente',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Vous pouvez d\u00E9penser jusqu'\u00E0 ${formattedLimit} avec cette carte, et la limite sera r\u00E9initialis\u00E9e au fur et \u00E0 mesure que vos d\u00E9penses soumises sont approuv\u00E9es.`,
        },
        fixedLimit: {
            name: 'Limite fixe',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Vous pouvez d\u00E9penser jusqu'\u00E0 ${formattedLimit} avec cette carte, puis elle se d\u00E9sactivera.`,
        },
        monthlyLimit: {
            name: 'Limite mensuelle',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Vous pouvez d\u00E9penser jusqu'\u00E0 ${formattedLimit} sur cette carte par mois. La limite sera r\u00E9initialis\u00E9e le 1er jour de chaque mois calendaire.`,
        },
        virtualCardNumber: 'Num\u00E9ro de carte virtuelle',
        travelCardCvv: 'CVV de la carte de voyage',
        physicalCardNumber: 'Num\u00E9ro de carte physique',
        getPhysicalCard: 'Obtenir une carte physique',
        reportFraud: 'Signaler une fraude sur une carte virtuelle',
        reportTravelFraud: 'Signaler une fraude \u00E0 la carte de voyage',
        reviewTransaction: 'V\u00E9rifier la transaction',
        suspiciousBannerTitle: 'Transaction suspecte',
        suspiciousBannerDescription: 'Nous avons remarqu\u00E9 des transactions suspectes sur votre carte. Appuyez ci-dessous pour les examiner.',
        cardLocked: 'Votre carte est temporairement bloqu\u00E9e pendant que notre \u00E9quipe examine le compte de votre entreprise.',
        cardDetails: {
            cardNumber: 'Num\u00E9ro de carte virtuelle',
            expiration: 'Expiration',
            cvv: 'CVV',
            address: 'Adresse',
            revealDetails: 'R\u00E9v\u00E9ler les d\u00E9tails',
            revealCvv: 'R\u00E9v\u00E9ler le CVV',
            copyCardNumber: 'Copier le num\u00E9ro de carte',
            updateAddress: "Mettre \u00E0 jour l'adresse",
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Ajout\u00E9 au portefeuille ${platform}`,
        cardDetailsLoadingFailure: "Une erreur s'est produite lors du chargement des d\u00E9tails de la carte. Veuillez v\u00E9rifier votre connexion Internet et r\u00E9essayer.",
        validateCardTitle: "Assurons-nous que c'est bien vous",
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Veuillez entrer le code magique envoy\u00E9 \u00E0 ${contactMethod} pour voir les d\u00E9tails de votre carte. Il devrait arriver dans une minute ou deux.`,
    },
    workflowsPage: {
        workflowTitle: 'D\u00E9penser',
        workflowDescription: "Configurez un flux de travail d\u00E8s que la d\u00E9pense survient, y compris l'approbation et le paiement.",
        delaySubmissionTitle: 'Retarder les soumissions',
        delaySubmissionDescription:
            'Choisissez un calendrier personnalis\u00E9 pour soumettre les d\u00E9penses, ou laissez cette option d\u00E9sactiv\u00E9e pour des mises \u00E0 jour en temps r\u00E9el des d\u00E9penses.',
        submissionFrequency: 'Fr\u00E9quence de soumission',
        submissionFrequencyDateOfMonth: 'Date du mois',
        addApprovalsTitle: 'Ajouter des approbations',
        addApprovalButton: "Ajouter un flux de travail d'approbation",
        addApprovalTip: "Ce flux de travail par d\u00E9faut s'applique \u00E0 tous les membres, sauf s'il existe un flux de travail plus sp\u00E9cifique.",
        approver: 'Approbateur',
        connectBankAccount: 'Connecter le compte bancaire',
        addApprovalsDescription: "Exiger une approbation suppl\u00E9mentaire avant d'autoriser un paiement.",
        makeOrTrackPaymentsTitle: 'Effectuer ou suivre des paiements',
        makeOrTrackPaymentsDescription: 'Ajoutez un payeur autoris\u00E9 pour les paiements effectu\u00E9s dans Expensify ou suivez les paiements effectu\u00E9s ailleurs.',
        editor: {
            submissionFrequency: 'Choisissez combien de temps Expensify doit attendre avant de partager les d\u00E9penses sans erreur.',
        },
        frequencyDescription: 'Choisissez la fr\u00E9quence \u00E0 laquelle vous souhaitez que les d\u00E9penses soient soumises automatiquement, ou faites-le manuellement.',
        frequencies: {
            instant: 'Instantan\u00E9',
            weekly: 'Hebdomadaire',
            monthly: 'Mensuel',
            twiceAMonth: 'Deux fois par mois',
            byTrip: 'Par voyage',
            manually: 'Manuellement',
            daily: 'Quotidiennement',
            lastDayOfMonth: 'Dernier jour du mois',
            lastBusinessDayOfMonth: 'Dernier jour ouvrable du mois',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Premier',
                '2': 'Deuxi\u00E8me',
                '3': 'Troisi\u00E8me',
                '4': 'Quatri\u00E8me',
                '5': 'Cinqui\u00E8me',
                '6': 'Sixi\u00E8me',
                '7': 'Septi\u00E8me',
                '8': 'Huiti\u00E8me',
                '9': 'Neuvi\u00E8me',
                '10': 'Dixi\u00E8me',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows:
            "Ce membre appartient d\u00E9j\u00E0 \u00E0 un autre flux de travail d'approbation. Toute mise \u00E0 jour ici se refl\u00E9tera \u00E9galement l\u00E0-bas.",
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> approuve d\u00E9j\u00E0 les rapports pour <strong>${name2}</strong>. Veuillez choisir un autre approbateur pour \u00E9viter un flux de travail circulaire.`,
        emptyContent: {
            title: 'Aucun membre \u00E0 afficher',
            expensesFromSubtitle: "Tous les membres de l'espace de travail appartiennent d\u00E9j\u00E0 \u00E0 un flux de travail d'approbation existant.",
            approverSubtitle: 'Tous les approbateurs appartiennent \u00E0 un flux de travail existant.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: "La soumission retard\u00E9e n'a pas pu \u00EAtre modifi\u00E9e. Veuillez r\u00E9essayer ou contacter le support.",
        autoReportingFrequencyErrorMessage: "La fr\u00E9quence de soumission n'a pas pu \u00EAtre modifi\u00E9e. Veuillez r\u00E9essayer ou contacter le support.",
        monthlyOffsetErrorMessage: "La fr\u00E9quence mensuelle n'a pas pu \u00EAtre modifi\u00E9e. Veuillez r\u00E9essayer ou contacter le support.",
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirmer',
        header: "Ajoutez plus d'approbateurs et confirmez.",
        additionalApprover: 'Approbateur suppl\u00E9mentaire',
        submitButton: 'Ajouter un flux de travail',
    },
    workflowsEditApprovalsPage: {
        title: "Modifier le flux de travail d'approbation",
        deleteTitle: "Supprimer le flux de travail d'approbation",
        deletePrompt: "\u00CAtes-vous s\u00FBr de vouloir supprimer ce flux de travail d'approbation ? Tous les membres suivront ensuite le flux de travail par d\u00E9faut.",
    },
    workflowsExpensesFromPage: {
        title: 'D\u00E9penses de',
        header: 'Lorsque les membres suivants soumettent des d\u00E9penses :',
    },
    workflowsApproverPage: {
        genericErrorMessage: "L'approbateur n'a pas pu \u00EAtre modifi\u00E9. Veuillez r\u00E9essayer ou contacter le support.",
        header: 'Envoyer \u00E0 ce membre pour approbation :',
    },
    workflowsPayerPage: {
        title: 'Payeur autoris\u00E9',
        genericErrorMessage: "Le payeur autoris\u00E9 n'a pas pu \u00EAtre modifi\u00E9. Veuillez r\u00E9essayer.",
        admins: 'Admins',
        payer: 'Payer',
        paymentAccount: 'Compte de paiement',
    },
    reportFraudPage: {
        title: 'Signaler une fraude sur une carte virtuelle',
        description:
            'Si les d\u00E9tails de votre carte virtuelle ont \u00E9t\u00E9 vol\u00E9s ou compromis, nous d\u00E9sactiverons d\u00E9finitivement votre carte existante et vous fournirons une nouvelle carte virtuelle et un nouveau num\u00E9ro.',
        deactivateCard: 'D\u00E9sactiver la carte',
        reportVirtualCardFraud: 'Signaler une fraude sur une carte virtuelle',
    },
    reportFraudConfirmationPage: {
        title: 'Fraude \u00E0 la carte signal\u00E9e',
        description:
            'Nous avons d\u00E9sactiv\u00E9 votre carte existante de fa\u00E7on permanente. Lorsque vous reviendrez pour consulter les d\u00E9tails de votre carte, une nouvelle carte virtuelle sera disponible.',
        buttonText: 'Compris, merci !',
    },
    activateCardPage: {
        activateCard: 'Activer la carte',
        pleaseEnterLastFour: 'Veuillez entrer les quatre derniers chiffres de votre carte.',
        activatePhysicalCard: 'Activer la carte physique',
        error: {
            thatDidNotMatch: 'Cela ne correspondait pas aux 4 derniers chiffres de votre carte. Veuillez r\u00E9essayer.',
            throttled:
                'Vous avez saisi incorrectement les 4 derniers chiffres de votre carte Expensify trop de fois. Si vous \u00EAtes s\u00FBr que les chiffres sont corrects, veuillez contacter Concierge pour r\u00E9soudre le probl\u00E8me. Sinon, r\u00E9essayez plus tard.',
        },
    },
    getPhysicalCard: {
        header: 'Obtenir une carte physique',
        nameMessage: 'Entrez votre pr\u00E9nom et votre nom de famille, car ils seront affich\u00E9s sur votre carte.',
        legalName: 'Nom l\u00E9gal',
        legalFirstName: 'Pr\u00E9nom l\u00E9gal',
        legalLastName: 'Nom de famille l\u00E9gal',
        phoneMessage: 'Entrez votre num\u00E9ro de t\u00E9l\u00E9phone.',
        phoneNumber: 'Num\u00E9ro de t\u00E9l\u00E9phone',
        address: 'Adresse',
        addressMessage: 'Entrez votre adresse de livraison.',
        streetAddress: 'Adresse postale',
        city: 'Ville',
        state: '\u00C9tat',
        zipPostcode: 'Code postal',
        country: 'Pays',
        confirmMessage: 'Veuillez confirmer vos informations ci-dessous.',
        estimatedDeliveryMessage: 'Votre carte physique arrivera dans 2-3 jours ouvrables.',
        next: 'Suivant',
        getPhysicalCard: 'Obtenir une carte physique',
        shipCard: "Carte d'exp\u00E9dition",
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Instantan\u00E9 (Carte de d\u00E9bit)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% de frais (${minAmount} minimum)`,
        ach: '1-3 jours ouvrables (Compte bancaire)',
        achSummary: 'Pas de frais',
        whichAccount: 'Quel compte ?',
        fee: 'Frais',
        transferSuccess: 'Transfert r\u00E9ussi !',
        transferDetailBankAccount: 'Votre argent devrait arriver dans les 1 \u00E0 3 jours ouvrables.',
        transferDetailDebitCard: 'Votre argent devrait arriver imm\u00E9diatement.',
        failedTransfer: "Votre solde n'est pas enti\u00E8rement r\u00E9gl\u00E9. Veuillez transf\u00E9rer vers un compte bancaire.",
        notHereSubTitle: 'Veuillez transf\u00E9rer votre solde depuis la page du portefeuille.',
        goToWallet: 'Aller \u00E0 Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Choisir un compte',
    },
    paymentMethodList: {
        addPaymentMethod: 'Ajouter un mode de paiement',
        addNewDebitCard: 'Ajouter une nouvelle carte de d\u00E9bit',
        addNewBankAccount: 'Ajouter un nouveau compte bancaire',
        accountLastFour: 'Se terminant par',
        cardLastFour: 'Carte se terminant par',
        addFirstPaymentMethod: "Ajoutez un moyen de paiement pour envoyer et recevoir des paiements directement dans l'application.",
        defaultPaymentMethod: 'Par d\u00E9faut',
    },
    preferencesPage: {
        appSection: {
            title: "Pr\u00E9f\u00E9rences de l'application",
        },
        testSection: {
            title: 'Pr\u00E9f\u00E9rences de test',
            subtitle: "Param\u00E8tres pour aider \u00E0 d\u00E9boguer et tester l'application en pr\u00E9production.",
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: "Recevez des mises \u00E0 jour de fonctionnalit\u00E9s pertinentes et des nouvelles d'Expensify",
        muteAllSounds: "Couper tous les sons d'Expensify",
    },
    priorityModePage: {
        priorityMode: 'Mode priorit\u00E9',
        explainerText:
            'Choisissez de vous #focus sur les discussions non lues et \u00E9pingl\u00E9es uniquement, ou affichez tout avec les discussions les plus r\u00E9centes et \u00E9pingl\u00E9es en haut.',
        priorityModes: {
            default: {
                label: 'Le plus r\u00E9cent',
                description: 'Afficher toutes les discussions tri\u00E9es par les plus r\u00E9centes',
            },
            gsd: {
                label: '#focus',
                description: 'Afficher uniquement les non lus tri\u00E9s par ordre alphab\u00E9tique',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `dans ${policyName}`,
        generatingPDF: 'G\u00E9n\u00E9ration du PDF',
        waitForPDF: 'Veuillez patienter pendant que nous g\u00E9n\u00E9rons le PDF',
        errorPDF: "Une erreur s'est produite lors de la tentative de g\u00E9n\u00E9ration de votre PDF.",
        generatedPDF: 'Votre rapport PDF a \u00E9t\u00E9 g\u00E9n\u00E9r\u00E9 !',
    },
    reportDescriptionPage: {
        roomDescription: 'Description de la chambre',
        roomDescriptionOptional: 'Description de la salle (facultatif)',
        explainerText: 'D\u00E9finir une description personnalis\u00E9e pour la salle.',
    },
    groupChat: {
        lastMemberTitle: 'Attention !',
        lastMemberWarning: 'Puisque vous \u00EAtes la derni\u00E8re personne ici, partir rendra ce chat inaccessible \u00E0 tous les membres. \u00CAtes-vous s\u00FBr de vouloir partir ?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Discussion de groupe de ${displayName}`,
    },
    languagePage: {
        language: 'Langue',
        languages: {
            en: {
                label: 'Anglais',
            },
            es: {
                label: 'Espagnol',
            },
        },
    },
    themePage: {
        theme: 'Th\u00E8me',
        themes: {
            dark: {
                label: 'Sombre',
            },
            light: {
                label: 'Lumi\u00E8re',
            },
            system: {
                label: "Utiliser les param\u00E8tres de l'appareil",
            },
        },
        chooseThemeBelowOrSync: 'Choisissez un th\u00E8me ci-dessous ou synchronisez avec les param\u00E8tres de votre appareil.',
    },
    termsOfUse: {
        phrase1: 'En vous connectant, vous acceptez les',
        phrase2: "Conditions d'utilisation",
        phrase3: 'et',
        phrase4: 'Confidentialit\u00E9',
        phrase5: `La transmission d'argent est fournie par ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) conform\u00E9ment \u00E0 ses`,
        phrase6: 'licences',
    },
    validateCodeForm: {
        magicCodeNotReceived: "Vous n'avez pas re\u00E7u de code magique ?",
        enterAuthenticatorCode: "Veuillez entrer votre code d'authentification",
        enterRecoveryCode: 'Veuillez entrer votre code de r\u00E9cup\u00E9ration',
        requiredWhen2FAEnabled: "Requis lorsque l'authentification \u00E0 deux facteurs est activ\u00E9e",
        requestNewCode: 'Demander un nouveau code dans',
        requestNewCodeAfterErrorOccurred: 'Demander un nouveau code',
        error: {
            pleaseFillMagicCode: 'Veuillez entrer votre code magique',
            incorrectMagicCode: 'Code magique incorrect ou invalide. Veuillez r\u00E9essayer ou demander un nouveau code.',
            pleaseFillTwoFactorAuth: "Veuillez entrer votre code d'authentification \u00E0 deux facteurs",
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Veuillez remplir tous les champs',
        pleaseFillPassword: 'Veuillez entrer votre mot de passe',
        pleaseFillTwoFactorAuth: 'Veuillez entrer votre code de v\u00E9rification en deux \u00E9tapes',
        enterYourTwoFactorAuthenticationCodeToContinue: "Entrez votre code d'authentification \u00E0 deux facteurs pour continuer",
        forgot: 'Oubli\u00E9 ?',
        requiredWhen2FAEnabled: "Requis lorsque l'authentification \u00E0 deux facteurs est activ\u00E9e",
        error: {
            incorrectPassword: 'Mot de passe incorrect. Veuillez r\u00E9essayer.',
            incorrectLoginOrPassword: 'Identifiant ou mot de passe incorrect. Veuillez r\u00E9essayer.',
            incorrect2fa: "Code d'authentification \u00E0 deux facteurs incorrect. Veuillez r\u00E9essayer.",
            twoFactorAuthenticationEnabled:
                "Vous avez activ\u00E9 l'authentification \u00E0 deux facteurs sur ce compte. Veuillez vous connecter en utilisant votre email ou num\u00E9ro de t\u00E9l\u00E9phone.",
            invalidLoginOrPassword: 'Identifiant ou mot de passe invalide. Veuillez r\u00E9essayer ou r\u00E9initialiser votre mot de passe.',
            unableToResetPassword:
                "Nous n'avons pas pu changer votre mot de passe. Cela est probablement d\u00FB \u00E0 un lien de r\u00E9initialisation de mot de passe expir\u00E9 dans un ancien e-mail de r\u00E9initialisation de mot de passe. Nous vous avons envoy\u00E9 un nouveau lien par e-mail pour que vous puissiez r\u00E9essayer. V\u00E9rifiez votre bo\u00EEte de r\u00E9ception et votre dossier de spam ; il devrait arriver dans quelques minutes.",
            noAccess: "Vous n'avez pas acc\u00E8s \u00E0 cette application. Veuillez ajouter votre nom d'utilisateur GitHub pour obtenir l'acc\u00E8s.",
            accountLocked: 'Votre compte a \u00E9t\u00E9 verrouill\u00E9 apr\u00E8s trop de tentatives infructueuses. Veuillez r\u00E9essayer dans 1 heure.',
            fallback: "Une erreur s'est produite. Veuillez r\u00E9essayer plus tard.",
        },
    },
    loginForm: {
        phoneOrEmail: 'T\u00E9l\u00E9phone ou email',
        error: {
            invalidFormatEmailLogin: "L'email saisi est invalide. Veuillez corriger le format et r\u00E9essayer.",
        },
        cannotGetAccountDetails: 'Impossible de r\u00E9cup\u00E9rer les d\u00E9tails du compte. Veuillez essayer de vous reconnecter.',
        loginForm: 'Formulaire de connexion',
        notYou: ({user}: NotYouParams) => `Pas ${user} ?`,
    },
    onboarding: {
        welcome: 'Bienvenue !',
        welcomeSignOffTitleManageTeam:
            "Une fois que vous aurez termin\u00E9 les t\u00E2ches ci-dessus, nous pourrons explorer plus de fonctionnalit\u00E9s comme les flux de travail d'approbation et les r\u00E8gles !",
        welcomeSignOffTitle: 'Ravi de vous rencontrer !',
        explanationModal: {
            title: 'Bienvenue sur Expensify',
            description:
                'Une application pour g\u00E9rer vos d\u00E9penses professionnelles et personnelles \u00E0 la vitesse de la conversation. Essayez-la et faites-nous savoir ce que vous en pensez. Bien plus \u00E0 venir !',
            secondaryDescription: 'Pour revenir \u00E0 Expensify Classic, il suffit de taper sur votre photo de profil > Aller \u00E0 Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Bienvenue sur Expensify',
            description:
                'Une application pour g\u00E9rer toutes vos d\u00E9penses professionnelles et personnelles dans une discussion. Con\u00E7ue pour votre entreprise, votre \u00E9quipe et vos amis.',
        },
        getStarted: 'Commencer',
        whatsYourName: 'Quel est votre nom ?',
        peopleYouMayKnow: 'Des personnes que vous connaissez sont d\u00E9j\u00E0 ici ! V\u00E9rifiez votre email pour les rejoindre.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Quelqu'un de ${domain} a d\u00E9j\u00E0 cr\u00E9\u00E9 un espace de travail. Veuillez entrer le code magique envoy\u00E9 \u00E0 ${email}.`,
        joinAWorkspace: 'Rejoindre un espace de travail',
        listOfWorkspaces:
            'Voici la liste des espaces de travail que vous pouvez rejoindre. Ne vous inqui\u00E9tez pas, vous pouvez toujours les rejoindre plus tard si vous pr\u00E9f\u00E9rez.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membre${employeeCount > 1 ? 's' : ''} \u2022 ${policyOwner}`,
        whereYouWork: 'O\u00F9 travaillez-vous ?',
        errorSelection: 'S\u00E9lectionnez une option pour continuer',
        purpose: {
            title: "Que voulez-vous faire aujourd'hui ?",
            errorContinue: 'Veuillez appuyer sur continuer pour configurer',
            errorBackButton: "Veuillez terminer les questions de configuration pour commencer \u00E0 utiliser l'application.",
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '\u00CAtre rembours\u00E9 par mon employeur',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'G\u00E9rer les d\u00E9penses de mon \u00E9quipe',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Suivre et budg\u00E9tiser les d\u00E9penses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Discutez et partagez les d\u00E9penses avec des amis',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: "Quelque chose d'autre",
        },
        employees: {
            title: "Combien d'employ\u00E9s avez-vous ?",
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 employ\u00E9s',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 employ\u00E9s',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 employ\u00E9s',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1 000 employ\u00E9s',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Plus de 1 000 employ\u00E9s',
        },
        accounting: {
            title: 'Utilisez-vous un logiciel de comptabilit\u00E9 ?',
            none: 'Aucun',
        },
        error: {
            requiredFirstName: 'Veuillez saisir votre pr\u00E9nom pour continuer',
        },
        workEmail: {
            title: 'Quelle est votre adresse e-mail professionnelle ?',
            subtitle: 'Expensify fonctionne mieux lorsque vous connectez votre e-mail professionnel.',
            explanationModal: {
                descriptionOne: 'Transf\u00E9rer \u00E0 receipts@expensify.com pour num\u00E9risation',
                descriptionTwo: 'Rejoignez vos coll\u00E8gues qui utilisent d\u00E9j\u00E0 Expensify',
                descriptionThree: "Profitez d'une exp\u00E9rience plus personnalis\u00E9e",
            },
            addWorkEmail: 'Ajouter un e-mail professionnel',
        },
        workEmailValidation: {
            title: 'V\u00E9rifiez votre adresse e-mail professionnelle',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Veuillez entrer le code magique envoy\u00E9 \u00E0 ${workEmail}. Il devrait arriver dans une minute ou deux.`,
        },
        workEmailValidationError: {
            publicEmail: "Veuillez entrer une adresse e-mail professionnelle valide provenant d'un domaine priv\u00E9, par exemple mitch@company.com.",
            offline: "Nous n'avons pas pu ajouter votre e-mail professionnel car vous semblez \u00EAtre hors ligne.",
        },
        mergeBlockScreen: {
            title: "Impossible d'ajouter l'email professionnel",
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nous n'avons pas pu ajouter ${workEmail}. Veuillez r\u00E9essayer plus tard dans les Param\u00E8tres ou discuter avec Concierge pour obtenir de l'aide.`,
        },
        workspace: {
            title: 'Restez organis\u00E9 avec un espace de travail',
            subtitle: 'D\u00E9bloquez des outils puissants pour simplifier la gestion de vos d\u00E9penses, le tout en un seul endroit. Avec un espace de travail, vous pouvez :',
            explanationModal: {
                descriptionOne: 'Suivre et organiser les re\u00E7us',
                descriptionTwo: 'Cat\u00E9goriser et \u00E9tiqueter les d\u00E9penses',
                descriptionThree: 'Cr\u00E9er et partager des rapports',
            },
            price: 'Essayez-le gratuitement pendant 30 jours, puis passez \u00E0 la version sup\u00E9rieure pour seulement <strong>5 $/mois</strong>.',
            createWorkspace: 'Cr\u00E9er un espace de travail',
        },
        confirmWorkspace: {
            title: "Confirmer l'espace de travail",
            subtitle:
                'Cr\u00E9ez un espace de travail pour suivre les re\u00E7us, rembourser les d\u00E9penses, g\u00E9rer les voyages, cr\u00E9er des rapports, et plus encore \u2014 le tout \u00E0 la vitesse du chat.',
        },
        inviteMembers: {
            title: 'Inviter des membres',
            subtitle: 'G\u00E9rez et partagez vos d\u00E9penses avec un comptable ou cr\u00E9ez un groupe de voyage avec des amis.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Ne plus me montrer ceci',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Le nom ne peut pas contenir les mots Expensify ou Concierge',
            hasInvalidCharacter: 'Le nom ne peut pas contenir de virgule ou de point-virgule',
            requiredFirstName: 'Le pr\u00E9nom ne peut pas \u00EAtre vide',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Quel est votre nom l\u00E9gal ?',
        enterDateOfBirth: 'Quelle est votre date de naissance ?',
        enterAddress: 'Quelle est votre adresse ?',
        enterPhoneNumber: 'Quel est votre num\u00E9ro de t\u00E9l\u00E9phone ?',
        personalDetails: 'D\u00E9tails personnels',
        privateDataMessage: 'Ces d\u00E9tails sont utilis\u00E9s pour les voyages et les paiements. Ils ne sont jamais affich\u00E9s sur votre profil public.',
        legalName: 'Nom l\u00E9gal',
        legalFirstName: 'Pr\u00E9nom l\u00E9gal',
        legalLastName: 'Nom de famille l\u00E9gal',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `La date doit \u00EAtre avant ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `La date doit \u00EAtre apr\u00E8s ${dateString}`,
            hasInvalidCharacter: 'Le nom ne peut inclure que des caract\u00E8res latins',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Format de code postal incorrect${zipFormat ? `Format acceptable : ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Veuillez vous assurer que le num\u00E9ro de t\u00E9l\u00E9phone est valide (par exemple, ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Le lien a \u00E9t\u00E9 renvoy\u00E9',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `J'ai envoy\u00E9 un lien magique de connexion \u00E0 ${login}. Veuillez v\u00E9rifier votre ${loginType} pour vous connecter.`,
        resendLink: 'Renvoyer le lien',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Pour valider ${secondaryLogin}, veuillez renvoyer le code magique depuis les Param\u00E8tres du compte de ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Si vous n'avez plus acc\u00E8s \u00E0 ${primaryLogin}, veuillez dissocier vos comptes.`,
        unlink: 'Dissocier',
        linkSent: 'Lien envoy\u00E9 !',
        successfullyUnlinkedLogin: 'Connexion secondaire dissoci\u00E9e avec succ\u00E8s !',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Notre fournisseur de messagerie a temporairement suspendu les emails vers ${login} en raison de probl\u00E8mes de livraison. Pour d\u00E9bloquer votre connexion, veuillez suivre ces \u00E9tapes :`,
        confirmThat: ({login}: ConfirmThatParams) => `Confirmez que ${login} est orthographi\u00E9 correctement et est une adresse e-mail r\u00E9elle et livrable.`,
        emailAliases:
            'Les alias d\'e-mail tels que "expenses@domain.com" doivent avoir acc\u00E8s \u00E0 leur propre bo\u00EEte de r\u00E9ception pour \u00EAtre un identifiant Expensify valide.',
        ensureYourEmailClient: 'Assurez-vous que votre client de messagerie autorise les emails de expensify.com.',
        youCanFindDirections: 'Vous pouvez trouver des instructions sur la fa\u00E7on de compl\u00E9ter cette \u00E9tape',
        helpConfigure: 'mais vous pourriez avoir besoin de votre service informatique pour vous aider \u00E0 configurer vos param\u00E8tres de messagerie.',
        onceTheAbove: 'Une fois les \u00E9tapes ci-dessus termin\u00E9es, veuillez contacter',
        toUnblock: 'pour d\u00E9bloquer votre connexion.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nous n'avons pas pu livrer les messages SMS \u00E0 ${login}, nous l'avons donc suspendu temporairement. Veuillez essayer de valider votre num\u00E9ro :`,
        validationSuccess: 'Votre num\u00E9ro a \u00E9t\u00E9 valid\u00E9 ! Cliquez ci-dessous pour envoyer un nouveau code magique de connexion.',
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
                return 'Veuillez patienter un moment avant de r\u00E9essayer.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'jour' : 'jours'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'heure' : 'heures'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'minute' : 'minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Patientez ! Vous devez attendre ${timeText} avant d'essayer de valider votre num\u00E9ro \u00E0 nouveau.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Rejoindre',
    },
    detailsPage: {
        localTime: 'Heure locale',
    },
    newChatPage: {
        startGroup: 'D\u00E9marrer un groupe',
        addToGroup: 'Ajouter au groupe',
    },
    yearPickerPage: {
        year: 'Ann\u00E9e',
        selectYear: 'Veuillez s\u00E9lectionner une ann\u00E9e',
    },
    focusModeUpdateModal: {
        title: 'Bienvenue en mode #focus !',
        prompt: 'Restez au courant en ne voyant que les discussions non lues ou celles qui n\u00E9cessitent votre attention. Ne vous inqui\u00E9tez pas, vous pouvez changer cela \u00E0 tout moment dans',
        settings: 'param\u00E8tres',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Le chat que vous cherchez ne peut pas \u00EAtre trouv\u00E9.',
        getMeOutOfHere: "Sortez-moi d'ici",
        iouReportNotFound: 'Les d\u00E9tails de paiement que vous cherchez sont introuvables.',
        notHere: "Hmm... ce n'est pas l\u00E0",
        pageNotFound: 'Oups, cette page est introuvable',
        noAccess:
            "Ce chat ou cette d\u00E9pense a peut-\u00EAtre \u00E9t\u00E9 supprim\u00E9(e) ou vous n'y avez pas acc\u00E8s.\n\nPour toute question, veuillez contacter concierge@expensify.com",
        goBackHome: "Retourner \u00E0 la page d'accueil",
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oups... ${isBreakLine ? '\n' : ''}Quelque chose s'est mal pass\u00E9`,
        subtitle: "Votre demande n'a pas pu \u00EAtre compl\u00E9t\u00E9e. Veuillez r\u00E9essayer plus tard.",
    },
    setPasswordPage: {
        enterPassword: 'Entrez un mot de passe',
        setPassword: 'D\u00E9finir le mot de passe',
        newPasswordPrompt: 'Votre mot de passe doit comporter au moins 8 caract\u00E8res, 1 lettre majuscule, 1 lettre minuscule et 1 chiffre.',
        passwordFormTitle: 'Bienvenue dans le Nouveau Expensify ! Veuillez d\u00E9finir votre mot de passe.',
        passwordNotSet: "Nous n'avons pas pu d\u00E9finir votre nouveau mot de passe. Nous vous avons envoy\u00E9 un nouveau lien de mot de passe pour r\u00E9essayer.",
        setPasswordLinkInvalid: 'Ce lien de r\u00E9initialisation de mot de passe est invalide ou a expir\u00E9. Un nouveau vous attend dans votre bo\u00EEte de r\u00E9ception !',
        validateAccount: 'V\u00E9rifier le compte',
    },
    statusPage: {
        status: 'Statut',
        statusExplanation:
            'Ajoutez un emoji pour donner \u00E0 vos coll\u00E8gues et amis un moyen simple de savoir ce qui se passe. Vous pouvez \u00E9galement ajouter un message si vous le souhaitez !',
        today: "Aujourd'hui",
        clearStatus: 'Effacer le statut',
        save: 'Enregistrer',
        message: 'Message',
        timePeriods: {
            never: 'Jamais',
            thirtyMinutes: '30 minutes',
            oneHour: '1 heure',
            afterToday: "Aujourd'hui",
            afterWeek: 'Une semaine',
            custom: 'Personnalis\u00E9',
        },
        untilTomorrow: "Jusqu'\u00E0 demain",
        untilTime: ({time}: UntilTimeParams) => `Jusqu'\u00E0 ${time}`,
        date: 'Date',
        time: 'Temps',
        clearAfter: 'Effacer apr\u00E8s',
        whenClearStatus: 'Quand devrions-nous effacer votre statut ?',
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `\u00C9tape ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Informations bancaires',
        confirmBankInfo: 'Confirmer les informations bancaires',
        manuallyAdd: 'Ajoutez manuellement votre compte bancaire',
        letsDoubleCheck: 'V\u00E9rifions que tout est correct.',
        accountEnding: 'Compte se terminant par',
        thisBankAccount: 'Ce compte bancaire sera utilis\u00E9 pour les paiements professionnels sur votre espace de travail.',
        accountNumber: 'Num\u00E9ro de compte',
        routingNumber: "Num\u00E9ro d'acheminement",
        chooseAnAccountBelow: 'Choisissez un compte ci-dessous',
        addBankAccount: 'Ajouter un compte bancaire',
        chooseAnAccount: 'Choisissez un compte',
        connectOnlineWithPlaid: 'Connectez-vous \u00E0 votre banque',
        connectManually: 'Connecter manuellement',
        desktopConnection: 'Remarque : Pour vous connecter \u00E0 Chase, Wells Fargo, Capital One ou Bank of America, veuillez cliquer ici pour terminer ce processus dans un navigateur.',
        yourDataIsSecure: 'Vos donn\u00E9es sont s\u00E9curis\u00E9es',
        toGetStarted:
            'Ajoutez un compte bancaire pour rembourser les d\u00E9penses, \u00E9mettre des cartes Expensify, encaisser les paiements de factures et payer les factures, le tout depuis un seul endroit.',
        plaidBodyCopy: "Offrez \u00E0 vos employ\u00E9s un moyen plus simple de payer - et d'\u00EAtre rembours\u00E9s - pour les d\u00E9penses de l'entreprise.",
        checkHelpLine: 'Votre num\u00E9ro de routage et votre num\u00E9ro de compte peuvent \u00EAtre trouv\u00E9s sur un ch\u00E8que pour le compte.',
        hasPhoneLoginError: {
            phrase1: 'Pour connecter un compte bancaire, veuillez',
            link: 'ajoutez un e-mail comme votre identifiant principal',
            phrase2: 'et r\u00E9essayez. Vous pouvez ajouter votre num\u00E9ro de t\u00E9l\u00E9phone comme connexion secondaire.',
        },
        hasBeenThrottledError: "Une erreur s'est produite lors de l'ajout de votre compte bancaire. Veuillez attendre quelques minutes et r\u00E9essayer.",
        hasCurrencyError: {
            phrase1: "Oups ! Il semble que la devise de votre espace de travail soit diff\u00E9rente de l'USD. Pour continuer, veuillez aller \u00E0",
            link: "vos param\u00E8tres d'espace de travail",
            phrase2: 'pour le d\u00E9finir en USD et r\u00E9essayer.',
        },
        error: {
            youNeedToSelectAnOption: 'Veuillez s\u00E9lectionner une option pour continuer',
            noBankAccountAvailable: "D\u00E9sol\u00E9, aucun compte bancaire n'est disponible.",
            noBankAccountSelected: 'Veuillez choisir un compte',
            taxID: "Veuillez entrer un num\u00E9ro d'identification fiscale valide",
            website: 'Veuillez entrer un site web valide',
            zipCode: `Veuillez entrer un code postal valide en utilisant le format : ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Veuillez entrer un num\u00E9ro de t\u00E9l\u00E9phone valide',
            email: 'Veuillez entrer une adresse e-mail valide',
            companyName: "Veuillez entrer un nom d'entreprise valide",
            addressCity: 'Veuillez entrer une ville valide',
            addressStreet: 'Veuillez entrer une adresse de rue valide',
            addressState: 'Veuillez s\u00E9lectionner un \u00E9tat valide',
            incorporationDateFuture: "La date d'incorporation ne peut pas \u00EAtre dans le futur",
            incorporationState: 'Veuillez s\u00E9lectionner un \u00E9tat valide',
            industryCode: 'Veuillez entrer un code de classification industrielle valide \u00E0 six chiffres',
            restrictedBusiness: "Veuillez confirmer que l'entreprise ne figure pas sur la liste des entreprises restreintes.",
            routingNumber: "Veuillez entrer un num\u00E9ro d'acheminement valide",
            accountNumber: 'Veuillez entrer un num\u00E9ro de compte valide',
            routingAndAccountNumberCannotBeSame: 'Les num\u00E9ros de routage et de compte ne peuvent pas correspondre.',
            companyType: "Veuillez s\u00E9lectionner un type d'entreprise valide",
            tooManyAttempts:
                "En raison d'un nombre \u00E9lev\u00E9 de tentatives de connexion, cette option a \u00E9t\u00E9 d\u00E9sactiv\u00E9e pendant 24 heures. Veuillez r\u00E9essayer plus tard ou entrer les d\u00E9tails manuellement \u00E0 la place.",
            address: 'Veuillez entrer une adresse valide',
            dob: 'Veuillez s\u00E9lectionner une date de naissance valide',
            age: 'Doit avoir plus de 18 ans',
            ssnLast4: 'Veuillez entrer les 4 derniers chiffres valides du SSN',
            firstName: 'Veuillez entrer un pr\u00E9nom valide',
            lastName: 'Veuillez entrer un nom de famille valide',
            noDefaultDepositAccountOrDebitCardAvailable: 'Veuillez ajouter un compte de d\u00E9p\u00F4t par d\u00E9faut ou une carte de d\u00E9bit',
            validationAmounts: 'Les montants de validation que vous avez saisis sont incorrects. Veuillez v\u00E9rifier votre relev\u00E9 bancaire et r\u00E9essayer.',
            fullName: 'Veuillez entrer un nom complet valide',
            ownershipPercentage: 'Veuillez entrer un nombre de pourcentage valide',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'O\u00F9 se trouve votre compte bancaire ?',
        accountDetailsStepHeader: 'Quels sont les d\u00E9tails de votre compte ?',
        accountTypeStepHeader: 'Quel type de compte est-ce ?',
        bankInformationStepHeader: 'Quels sont vos coordonn\u00E9es bancaires ?',
        accountHolderInformationStepHeader: 'Quels sont les d\u00E9tails du titulaire du compte ?',
        howDoWeProtectYourData: 'Comment prot\u00E9geons-nous vos donn\u00E9es ?',
        currencyHeader: 'Quelle est la devise de votre compte bancaire ?',
        confirmationStepHeader: 'V\u00E9rifiez vos informations.',
        confirmationStepSubHeader: 'V\u00E9rifiez les d\u00E9tails ci-dessous, et cochez la case des conditions pour confirmer.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Entrez le mot de passe Expensify',
        alreadyAdded: 'Ce compte a d\u00E9j\u00E0 \u00E9t\u00E9 ajout\u00E9.',
        chooseAccountLabel: 'Compte',
        successTitle: 'Compte bancaire personnel ajout\u00E9 !',
        successMessage: 'F\u00E9licitations, votre compte bancaire est configur\u00E9 et pr\u00EAt \u00E0 recevoir des remboursements.',
    },
    attachmentView: {
        unknownFilename: 'Nom de fichier inconnu',
        passwordRequired: 'Veuillez entrer un mot de passe',
        passwordIncorrect: 'Mot de passe incorrect. Veuillez r\u00E9essayer.',
        failedToLoadPDF: '\u00C9chec du chargement du fichier PDF',
        pdfPasswordForm: {
            title: 'PDF prot\u00E9g\u00E9 par mot de passe',
            infoText: 'Ce PDF est prot\u00E9g\u00E9 par un mot de passe.',
            beforeLinkText: "S'il vous pla\u00EEt",
            linkText: 'entrez le mot de passe',
            afterLinkText: 'pour le voir.',
            formLabel: 'Voir le PDF',
        },
        attachmentNotFound: 'Pi\u00E8ce jointe introuvable',
    },
    messages: {
        errorMessageInvalidPhone: `Veuillez entrer un num\u00E9ro de t\u00E9l\u00E9phone valide sans parenth\u00E8ses ni tirets. Si vous \u00EAtes en dehors des \u00C9tats-Unis, veuillez inclure votre indicatif de pays (par exemple, ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'E-mail invalide',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} est d\u00E9j\u00E0 membre de ${name}`,
    },
    onfidoStep: {
        acceptTerms: "En continuant avec la demande d'activation de votre Expensify Wallet, vous confirmez que vous avez lu, compris et accept\u00E9",
        facialScan: "Politique et autorisation de scan facial d'Onfido",
        tryAgain: 'R\u00E9essayer',
        verifyIdentity: "V\u00E9rifier l'identit\u00E9",
        letsVerifyIdentity: 'V\u00E9rifions votre identit\u00E9',
        butFirst: `Mais d'abord, les choses ennuyeuses. Lisez les informations l\u00E9gales \u00E0 l'\u00E9tape suivante et cliquez sur "Accepter" lorsque vous \u00EAtes pr\u00EAt.`,
        genericError: "Une erreur s'est produite lors du traitement de cette \u00E9tape. Veuillez r\u00E9essayer.",
        cameraPermissionsNotGranted: "Activer l'acc\u00E8s \u00E0 la cam\u00E9ra",
        cameraRequestMessage:
            "Nous avons besoin d'acc\u00E9der \u00E0 votre cam\u00E9ra pour terminer la v\u00E9rification du compte bancaire. Veuillez l'activer via Param\u00E8tres > New Expensify.",
        microphonePermissionsNotGranted: "Activer l'acc\u00E8s au microphone",
        microphoneRequestMessage:
            "Nous avons besoin d'acc\u00E9der \u00E0 votre microphone pour terminer la v\u00E9rification du compte bancaire. Veuillez l'activer via Param\u00E8tres > New Expensify.",
        originalDocumentNeeded:
            "Veuillez t\u00E9l\u00E9charger une image originale de votre pi\u00E8ce d'identit\u00E9 plut\u00F4t qu'une capture d'\u00E9cran ou une image num\u00E9ris\u00E9e.",
        documentNeedsBetterQuality:
            "Votre pi\u00E8ce d'identit\u00E9 semble \u00EAtre endommag\u00E9e ou pr\u00E9senter des caract\u00E9ristiques de s\u00E9curit\u00E9 manquantes. Veuillez t\u00E9l\u00E9charger une image originale d'une pi\u00E8ce d'identit\u00E9 non endommag\u00E9e et enti\u00E8rement visible.",
        imageNeedsBetterQuality:
            "Il y a un probl\u00E8me avec la qualit\u00E9 de l'image de votre pi\u00E8ce d'identit\u00E9. Veuillez t\u00E9l\u00E9charger une nouvelle image o\u00F9 l'ensemble de votre pi\u00E8ce d'identit\u00E9 est clairement visible.",
        selfieIssue: 'Il y a un probl\u00E8me avec votre selfie/vid\u00E9o. Veuillez t\u00E9l\u00E9charger un selfie/vid\u00E9o en direct.',
        selfieNotMatching:
            "Votre selfie/vid\u00E9o ne correspond pas \u00E0 votre pi\u00E8ce d'identit\u00E9. Veuillez t\u00E9l\u00E9charger un nouveau selfie/vid\u00E9o o\u00F9 votre visage est clairement visible.",
        selfieNotLive: 'Votre selfie/vid\u00E9o ne semble pas \u00EAtre une photo/vid\u00E9o en direct. Veuillez t\u00E9l\u00E9charger un selfie/vid\u00E9o en direct.',
    },
    additionalDetailsStep: {
        headerTitle: 'D\u00E9tails suppl\u00E9mentaires',
        helpText: "Nous devons confirmer les informations suivantes avant que vous puissiez envoyer et recevoir de l'argent depuis votre portefeuille.",
        helpTextIdologyQuestions: 'Nous devons vous poser encore quelques questions pour terminer la validation de votre identit\u00E9.',
        helpLink: 'En savoir plus sur pourquoi nous en avons besoin.',
        legalFirstNameLabel: 'Pr\u00E9nom l\u00E9gal',
        legalMiddleNameLabel: 'Deuxi\u00E8me pr\u00E9nom l\u00E9gal',
        legalLastNameLabel: 'Nom de famille l\u00E9gal',
        selectAnswer: 'Veuillez s\u00E9lectionner une r\u00E9ponse pour continuer',
        ssnFull9Error: 'Veuillez entrer un num\u00E9ro de s\u00E9curit\u00E9 sociale valide de neuf chiffres.',
        needSSNFull9: 'Nous rencontrons des difficult\u00E9s pour v\u00E9rifier votre SSN. Veuillez entrer les neuf chiffres complets de votre SSN.',
        weCouldNotVerify: "Nous n'avons pas pu v\u00E9rifier",
        pleaseFixIt: 'Veuillez corriger ces informations avant de continuer',
        failedKYCTextBefore: "Nous n'avons pas pu v\u00E9rifier votre identit\u00E9. Veuillez r\u00E9essayer plus tard ou contacter",
        failedKYCTextAfter: 'si vous avez des questions.',
    },
    termsStep: {
        headerTitle: 'Conditions et frais',
        headerTitleRefactor: 'Frais et conditions',
        haveReadAndAgree: "J'ai lu et j'accepte de recevoir",
        electronicDisclosures: 'divulgations \u00E9lectroniques',
        agreeToThe: "J'accepte les",
        walletAgreement: 'Accord de portefeuille',
        enablePayments: 'Activer les paiements',
        monthlyFee: 'Frais mensuel',
        inactivity: 'Inactivit\u00E9',
        noOverdraftOrCredit: 'Pas de fonctionnalit\u00E9 de d\u00E9couvert/cr\u00E9dit.',
        electronicFundsWithdrawal: 'Retrait de fonds \u00E9lectronique',
        standard: 'Standard',
        reviewTheFees: "Jetez un coup d'\u0153il \u00E0 certains frais.",
        checkTheBoxes: 'Veuillez cocher les cases ci-dessous.',
        agreeToTerms: 'Acceptez les conditions et vous serez pr\u00EAt \u00E0 partir !',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Le portefeuille Expensify est \u00E9mis par ${walletProgram}.`,
            perPurchase: 'Par achat',
            atmWithdrawal: 'Retrait au guichet automatique',
            cashReload: 'Recharge en esp\u00E8ces',
            inNetwork: 'dans le r\u00E9seau',
            outOfNetwork: 'hors r\u00E9seau',
            atmBalanceInquiry: 'Demande de solde au distributeur automatique',
            inOrOutOfNetwork: '(dans le r\u00E9seau ou hors r\u00E9seau)',
            customerService: 'Service client',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(apr\u00E8s 12 mois sans transactions)',
            weChargeOneFee: "Nous facturons un autre type de frais. Il s'agit de :",
            fdicInsurance: "Vos fonds sont \u00E9ligibles \u00E0 l'assurance FDIC.",
            generalInfo: 'Pour des informations g\u00E9n\u00E9rales sur les comptes pr\u00E9pay\u00E9s, visitez',
            conditionsDetails: 'Pour plus de d\u00E9tails et conditions concernant tous les frais et services, visitez',
            conditionsPhone: 'ou en appelant le +1 833-400-0904.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Une liste de tous les frais du portefeuille Expensify',
            typeOfFeeHeader: 'Tous les frais',
            feeAmountHeader: 'Montant',
            moreDetailsHeader: 'D\u00E9tails',
            openingAccountTitle: "Ouverture d'un compte",
            openingAccountDetails: "Il n'y a pas de frais pour ouvrir un compte.",
            monthlyFeeDetails: "Il n'y a pas de frais mensuels.",
            customerServiceTitle: 'Service client',
            customerServiceDetails: "Il n'y a pas de frais de service client.",
            inactivityDetails: "Il n'y a pas de frais d'inactivit\u00E9.",
            sendingFundsTitle: 'Envoi de fonds \u00E0 un autre titulaire de compte',
            sendingFundsDetails:
                "Il n'y a pas de frais pour envoyer des fonds \u00E0 un autre titulaire de compte en utilisant votre solde, votre compte bancaire ou votre carte de d\u00E9bit.",
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
            fdicInsuranceBancorp2: 'pour plus de d\u00E9tails.',
            contactExpensifyPayments: `Contactez ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} en appelant le +1 833-400-0904, par email \u00E0`,
            contactExpensifyPayments2: 'ou connectez-vous \u00E0',
            generalInformation: 'Pour des informations g\u00E9n\u00E9rales sur les comptes pr\u00E9pay\u00E9s, visitez',
            generalInformation2:
                'Si vous avez une plainte concernant un compte pr\u00E9pay\u00E9, appelez le Bureau de Protection Financi\u00E8re des Consommateurs au 1-855-411-2372 ou visitez',
            printerFriendlyView: 'Voir la version imprimable',
            automated: 'Automatis\u00E9',
            liveAgent: 'Agent en direct',
            instant: 'Instantan\u00E9',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Activer les paiements',
        activatedTitle: 'Portefeuille activ\u00E9 !',
        activatedMessage: 'F\u00E9licitations, votre portefeuille est configur\u00E9 et pr\u00EAt \u00E0 effectuer des paiements.',
        checkBackLaterTitle: 'Juste une minute...',
        checkBackLaterMessage: 'Nous examinons toujours vos informations. Veuillez revenir plus tard.',
        continueToPayment: 'Continuer vers le paiement',
        continueToTransfer: 'Continuer \u00E0 transf\u00E9rer',
    },
    companyStep: {
        headerTitle: "Informations sur l'entreprise",
        subtitle: 'Presque termin\u00E9 ! Pour des raisons de s\u00E9curit\u00E9, nous devons confirmer certaines informations :',
        legalBusinessName: 'Nom commercial l\u00E9gal',
        companyWebsite: "Site web de l'entreprise",
        taxIDNumber: "Num\u00E9ro d'identification fiscale",
        taxIDNumberPlaceholder: '9 chiffres',
        companyType: "Type d'entreprise",
        incorporationDate: "Date d'incorporation",
        incorporationState: "\u00C9tat d'incorporation",
        industryClassificationCode: "Code de classification de l'industrie",
        confirmCompanyIsNot: "Je confirme que cette entreprise n'est pas sur la liste",
        listOfRestrictedBusinesses: 'liste des entreprises restreintes',
        incorporationDatePlaceholder: 'Date de d\u00E9but (aaaa-mm-jj)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partenariat',
            COOPERATIVE: 'Coop\u00E9rative',
            SOLE_PROPRIETORSHIP: 'Entreprise individuelle',
            OTHER: 'Autre',
        },
        industryClassification: "Dans quel secteur d'activit\u00E9 l'entreprise est-elle class\u00E9e ?",
        industryClassificationCodePlaceholder: "Rechercher le code de classification de l'industrie",
    },
    requestorStep: {
        headerTitle: 'Informations personnelles',
        learnMore: 'En savoir plus',
        isMyDataSafe: 'Mes donn\u00E9es sont-elles en s\u00E9curit\u00E9 ?',
    },
    personalInfoStep: {
        personalInfo: 'Informations personnelles',
        enterYourLegalFirstAndLast: 'Quel est votre nom l\u00E9gal ?',
        legalFirstName: 'Pr\u00E9nom l\u00E9gal',
        legalLastName: 'Nom de famille l\u00E9gal',
        legalName: 'Nom l\u00E9gal',
        enterYourDateOfBirth: 'Quelle est votre date de naissance ?',
        enterTheLast4: 'Quels sont les quatre derniers chiffres de votre num\u00E9ro de s\u00E9curit\u00E9 sociale ?',
        dontWorry: 'Ne vous inqui\u00E9tez pas, nous ne faisons aucune v\u00E9rification de cr\u00E9dit personnelle !',
        last4SSN: 'Derniers 4 du SSN',
        enterYourAddress: 'Quelle est votre adresse ?',
        address: 'Adresse',
        letsDoubleCheck: 'V\u00E9rifions que tout est correct.',
        byAddingThisBankAccount: 'En ajoutant ce compte bancaire, vous confirmez que vous avez lu, compris et accept\u00E9',
        whatsYourLegalName: 'Quel est votre nom l\u00E9gal ?',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        whatsYourAddress: 'Quelle est votre adresse ?',
        whatsYourSSN: 'Quels sont les quatre derniers chiffres de votre num\u00E9ro de s\u00E9curit\u00E9 sociale ?',
        noPersonalChecks: 'Ne vous inqui\u00E9tez pas, pas de v\u00E9rifications de cr\u00E9dit personnel ici !',
        whatsYourPhoneNumber: 'Quel est votre num\u00E9ro de t\u00E9l\u00E9phone ?',
        weNeedThisToVerify: 'Nous avons besoin de cela pour v\u00E9rifier votre portefeuille.',
    },
    businessInfoStep: {
        businessInfo: "Informations sur l'entreprise",
        enterTheNameOfYourBusiness: 'Quel est le nom de votre entreprise ?',
        businessName: "Nom l\u00E9gal de l'entreprise",
        enterYourCompanyTaxIdNumber: "Quel est le num\u00E9ro d'identification fiscale de votre entreprise ?",
        taxIDNumber: "Num\u00E9ro d'identification fiscale",
        taxIDNumberPlaceholder: '9 chiffres',
        enterYourCompanyWebsite: 'Quel est le site web de votre entreprise ?',
        companyWebsite: "Site web de l'entreprise",
        enterYourCompanyPhoneNumber: 'Quel est le num\u00E9ro de t\u00E9l\u00E9phone de votre entreprise ?',
        enterYourCompanyAddress: "Quelle est l'adresse de votre entreprise ?",
        selectYourCompanyType: "Quel type d'entreprise est-ce ?",
        companyType: "Type d'entreprise",
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partenariat',
            COOPERATIVE: 'Coop\u00E9rative',
            SOLE_PROPRIETORSHIP: 'Entreprise individuelle',
            OTHER: 'Autre',
        },
        selectYourCompanyIncorporationDate: "Quelle est la date d'incorporation de votre entreprise ?",
        incorporationDate: "Date d'incorporation",
        incorporationDatePlaceholder: 'Date de d\u00E9but (aaaa-mm-jj)',
        incorporationState: "\u00C9tat d'incorporation",
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'Dans quel \u00E9tat votre entreprise a-t-elle \u00E9t\u00E9 constitu\u00E9e ?',
        letsDoubleCheck: 'V\u00E9rifions que tout est correct.',
        companyAddress: "Adresse de l'entreprise",
        listOfRestrictedBusinesses: 'liste des entreprises restreintes',
        confirmCompanyIsNot: "Je confirme que cette entreprise n'est pas sur la liste",
        businessInfoTitle: "Informations sur l'entreprise",
        legalBusinessName: 'Nom commercial l\u00E9gal',
        whatsTheBusinessName: "Quel est le nom de l'entreprise ?",
        whatsTheBusinessAddress: "Quelle est l'adresse professionnelle ?",
        whatsTheBusinessContactInformation: "Quelles sont les coordonn\u00E9es de l'entreprise ?",
        whatsTheBusinessRegistrationNumber: "Quel est le num\u00E9ro d'enregistrement de l'entreprise ?",
        whatsTheBusinessTaxIDEIN: "Quel est le num\u00E9ro d'identification fiscale/de TVA/d'enregistrement GST de l'entreprise ?",
        whatsThisNumber: 'Quel est ce num\u00E9ro ?',
        whereWasTheBusinessIncorporated: "O\u00F9 l'entreprise a-t-elle \u00E9t\u00E9 constitu\u00E9e ?",
        whatTypeOfBusinessIsIt: "Quel type d'entreprise est-ce ?",
        whatsTheBusinessAnnualPayment: "Quel est le volume de paiement annuel de l'entreprise ?",
        whatsYourExpectedAverageReimbursements: 'Quel est votre montant moyen de remboursement attendu ?',
        registrationNumber: "Num\u00E9ro d'enregistrement",
        taxIDEIN: "Num\u00E9ro d'identification fiscale/EIN",
        businessAddress: 'Adresse professionnelle',
        businessType: "Type d'entreprise",
        incorporation: 'Incorporation',
        incorporationCountry: "Pays d'incorporation",
        incorporationTypeName: "Type d'incorporation",
        businessCategory: "Cat\u00E9gorie d'entreprise",
        annualPaymentVolume: 'Volume de paiement annuel',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Volume de paiement annuel en ${currencyCode}`,
        averageReimbursementAmount: 'Montant moyen de remboursement',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Montant moyen du remboursement en ${currencyCode}`,
        selectIncorporationType: 'S\u00E9lectionnez le type de constitution',
        selectBusinessCategory: "S\u00E9lectionner la cat\u00E9gorie d'entreprise",
        selectAnnualPaymentVolume: 'S\u00E9lectionnez le volume de paiement annuel',
        selectIncorporationCountry: "S\u00E9lectionnez le pays d'incorporation",
        selectIncorporationState: "S\u00E9lectionnez l'\u00E9tat d'incorporation",
        selectAverageReimbursement: 'S\u00E9lectionner le montant moyen du remboursement',
        findIncorporationType: "Trouver le type d'incorporation",
        findBusinessCategory: "Trouver la cat\u00E9gorie d'entreprise",
        findAnnualPaymentVolume: 'Trouver le volume de paiement annuel',
        findIncorporationState: "Trouver l'\u00E9tat d'incorporation",
        findAverageReimbursement: 'Trouver le montant moyen du remboursement',
        error: {
            registrationNumber: "Veuillez fournir un num\u00E9ro d'enregistrement valide",
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Poss\u00E9dez-vous 25 % ou plus de',
        doAnyIndividualOwn25percent: 'Des individus poss\u00E8dent-ils 25 % ou plus de',
        areThereMoreIndividualsWhoOwn25percent: 'Y a-t-il plus de personnes qui poss\u00E8dent 25 % ou plus de',
        regulationRequiresUsToVerifyTheIdentity: "La r\u00E9glementation nous oblige \u00E0 v\u00E9rifier l'identit\u00E9 de toute personne qui poss\u00E8de plus de 25% de l'entreprise.",
        companyOwner: "Propri\u00E9taire d'entreprise",
        enterLegalFirstAndLastName: 'Quel est le nom l\u00E9gal du propri\u00E9taire ?',
        legalFirstName: 'Pr\u00E9nom l\u00E9gal',
        legalLastName: 'Nom de famille l\u00E9gal',
        enterTheDateOfBirthOfTheOwner: 'Quelle est la date de naissance du propri\u00E9taire ?',
        enterTheLast4: 'Quels sont les 4 derniers chiffres du num\u00E9ro de s\u00E9curit\u00E9 sociale du propri\u00E9taire ?',
        last4SSN: 'Derniers 4 du SSN',
        dontWorry: 'Ne vous inqui\u00E9tez pas, nous ne faisons aucune v\u00E9rification de cr\u00E9dit personnelle !',
        enterTheOwnersAddress: "Quelle est l'adresse du propri\u00E9taire ?",
        letsDoubleCheck: 'V\u00E9rifions que tout est correct.',
        legalName: 'Nom l\u00E9gal',
        address: 'Adresse',
        byAddingThisBankAccount: 'En ajoutant ce compte bancaire, vous confirmez que vous avez lu, compris et accept\u00E9',
        owners: 'Propri\u00E9taires',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informations du propri\u00E9taire',
        businessOwner: "Propri\u00E9taire d'entreprise",
        signerInfo: 'Informations du signataire',
        doYouOwn: ({companyName}: CompanyNameParams) => `Poss\u00E9dez-vous 25 % ou plus de ${companyName} ?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Y a-t-il des individus qui poss\u00E8dent 25 % ou plus de ${companyName} ?`,
        regulationsRequire: "Les r\u00E9glementations nous obligent \u00E0 v\u00E9rifier l'identit\u00E9 de toute personne poss\u00E9dant plus de 25% de l'entreprise.",
        legalFirstName: 'Pr\u00E9nom l\u00E9gal',
        legalLastName: 'Nom de famille l\u00E9gal',
        whatsTheOwnersName: 'Quel est le nom l\u00E9gal du propri\u00E9taire ?',
        whatsYourName: 'Quel est votre nom l\u00E9gal ?',
        whatPercentage: "Quel pourcentage de l'entreprise appartient au propri\u00E9taire ?",
        whatsYoursPercentage: "Quel pourcentage de l'entreprise poss\u00E9dez-vous ?",
        ownership: 'Propri\u00E9t\u00E9',
        whatsTheOwnersDOB: 'Quelle est la date de naissance du propri\u00E9taire ?',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        whatsTheOwnersAddress: "Quelle est l'adresse du propri\u00E9taire ?",
        whatsYourAddress: 'Quelle est votre adresse ?',
        whatAreTheLast: 'Quels sont les 4 derniers chiffres du num\u00E9ro de s\u00E9curit\u00E9 sociale du propri\u00E9taire ?',
        whatsYourLast: 'Quels sont les 4 derniers chiffres de votre num\u00E9ro de s\u00E9curit\u00E9 sociale ?',
        dontWorry: 'Ne vous inqui\u00E9tez pas, nous ne faisons aucune v\u00E9rification de cr\u00E9dit personnelle !',
        last4: 'Derniers 4 du SSN',
        whyDoWeAsk: 'Pourquoi demandons-nous cela ?',
        letsDoubleCheck: 'V\u00E9rifions que tout est correct.',
        legalName: 'Nom l\u00E9gal',
        ownershipPercentage: 'Pourcentage de propri\u00E9t\u00E9',
        areThereOther: ({companyName}: CompanyNameParams) => `Y a-t-il d'autres personnes qui poss\u00E8dent 25 % ou plus de ${companyName} ?`,
        owners: 'Propri\u00E9taires',
        addCertified: 'Ajoutez un organigramme certifi\u00E9 qui montre les propri\u00E9taires b\u00E9n\u00E9ficiaires.',
        regulationRequiresChart:
            "La r\u00E9glementation nous oblige \u00E0 collecter une copie certifi\u00E9e du tableau de propri\u00E9t\u00E9 qui montre chaque individu ou entit\u00E9 poss\u00E9dant 25 % ou plus de l'entreprise.",
        uploadEntity: "T\u00E9l\u00E9charger le tableau de propri\u00E9t\u00E9 de l'entit\u00E9",
        noteEntity: 'Remarque : Le tableau de propri\u00E9t\u00E9 des entit\u00E9s doit \u00EAtre sign\u00E9 par votre comptable, conseiller juridique ou notari\u00E9.',
        certified: "Tableau de propri\u00E9t\u00E9 de l'entit\u00E9 certifi\u00E9e",
        selectCountry: 'S\u00E9lectionner le pays',
        findCountry: 'Trouver le pays',
        address: 'Adresse',
        chooseFile: 'Choisir le fichier',
        uploadDocuments: 'T\u00E9l\u00E9charger des documents suppl\u00E9mentaires',
        pleaseUpload:
            "Veuillez t\u00E9l\u00E9charger ci-dessous des documents suppl\u00E9mentaires pour nous aider \u00E0 v\u00E9rifier votre identit\u00E9 en tant que propri\u00E9taire direct ou indirect de 25 % ou plus de l'entit\u00E9 commerciale.",
        acceptedFiles: 'Formats de fichiers accept\u00E9s : PDF, PNG, JPEG. La taille totale des fichiers pour chaque section ne peut pas d\u00E9passer 5 Mo.',
        proofOfBeneficialOwner: 'Preuve du propri\u00E9taire b\u00E9n\u00E9ficiaire',
        proofOfBeneficialOwnerDescription:
            "Veuillez fournir une attestation sign\u00E9e et un organigramme d'un comptable public, notaire ou avocat v\u00E9rifiant la propri\u00E9t\u00E9 de 25 % ou plus de l'entreprise. Elle doit \u00EAtre dat\u00E9e des trois derniers mois et inclure le num\u00E9ro de licence du signataire.",
        copyOfID: "Copie de la pi\u00E8ce d'identit\u00E9 pour le b\u00E9n\u00E9ficiaire effectif",
        copyOfIDDescription: 'Exemples : passeport, permis de conduire, etc.',
        proofOfAddress: "Preuve d'adresse pour le b\u00E9n\u00E9ficiaire effectif",
        proofOfAddressDescription: 'Exemples : Facture de services publics, contrat de location, etc.',
        codiceFiscale: "Codice fiscale/Num\u00E9ro d'identification fiscale",
        codiceFiscaleDescription:
            "Veuillez t\u00E9l\u00E9charger une vid\u00E9o d'une visite sur site ou un appel enregistr\u00E9 avec le signataire. Le signataire doit fournir : nom complet, date de naissance, nom de l'entreprise, num\u00E9ro d'enregistrement, num\u00E9ro de code fiscal, adresse enregistr\u00E9e, nature de l'activit\u00E9 et objectif du compte.",
    },
    validationStep: {
        headerTitle: 'Valider le compte bancaire',
        buttonText: 'Terminer la configuration',
        maxAttemptsReached: 'La validation de ce compte bancaire a \u00E9t\u00E9 d\u00E9sactiv\u00E9e en raison de trop nombreuses tentatives incorrectes.',
        description: `Dans un d\u00E9lai de 1 \u00E0 2 jours ouvrables, nous enverrons trois (3) petites transactions sur votre compte bancaire sous un nom tel que "Expensify, Inc. Validation".`,
        descriptionCTA: 'Veuillez entrer chaque montant de transaction dans les champs ci-dessous. Exemple : 1,51.',
        reviewingInfo: 'Merci ! Nous examinons vos informations et nous vous contacterons sous peu. Veuillez v\u00E9rifier votre discussion avec Concierge.',
        forNextStep: 'pour les prochaines \u00E9tapes afin de terminer la configuration de votre compte bancaire.',
        letsChatCTA: 'Oui, discutons',
        letsChatText: 'Presque termin\u00E9 ! Nous avons besoin de votre aide pour v\u00E9rifier quelques derni\u00E8res informations par chat. Pr\u00EAt ?',
        letsChatTitle: 'Discutons !',
        enable2FATitle: "Pr\u00E9venez la fraude, activez l'authentification \u00E0 deux facteurs (2FA)",
        enable2FAText:
            "Nous prenons votre s\u00E9curit\u00E9 au s\u00E9rieux. Veuillez configurer l'authentification \u00E0 deux facteurs (2FA) maintenant pour ajouter une couche de protection suppl\u00E9mentaire \u00E0 votre compte.",
        secureYourAccount: 'S\u00E9curisez votre compte',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Informations suppl\u00E9mentaires',
        checkAllThatApply: "Cochez tout ce qui s'applique, sinon laissez vide.",
        iOwnMoreThan25Percent: 'Je poss\u00E8de plus de 25 % de',
        someoneOwnsMoreThan25Percent: "Quelqu'un d'autre poss\u00E8de plus de 25 % de",
        additionalOwner: 'B\u00E9n\u00E9ficiaire effectif suppl\u00E9mentaire',
        removeOwner: 'Supprimer ce b\u00E9n\u00E9ficiaire effectif',
        addAnotherIndividual: 'Ajouter une autre personne qui poss\u00E8de plus de 25 % de',
        agreement: 'Accord :',
        termsAndConditions: 'termes et conditions',
        certifyTrueAndAccurate: 'Je certifie que les informations fournies sont vraies et exactes.',
        error: {
            certify: 'Doit certifier que les informations sont vraies et exactes',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Terminer la v\u00E9rification',
        confirmAgreements: 'Veuillez confirmer les accords ci-dessous.',
        certifyTrueAndAccurate: 'Je certifie que les informations fournies sont vraies et exactes.',
        certifyTrueAndAccurateError: 'Veuillez certifier que les informations sont vraies et exactes.',
        isAuthorizedToUseBankAccount: 'Je suis autoris\u00E9 \u00E0 utiliser ce compte bancaire professionnel pour les d\u00E9penses professionnelles.',
        isAuthorizedToUseBankAccountError: "Vous devez \u00EAtre un agent de contr\u00F4le avec l'autorisation de g\u00E9rer le compte bancaire de l'entreprise.",
        termsAndConditions: 'termes et conditions',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Connecter le compte bancaire',
        finishButtonText: 'Terminer la configuration',
        validateYourBankAccount: 'Validez votre compte bancaire',
        validateButtonText: 'Valider',
        validationInputLabel: 'Transaction',
        maxAttemptsReached: 'La validation de ce compte bancaire a \u00E9t\u00E9 d\u00E9sactiv\u00E9e en raison de trop nombreuses tentatives incorrectes.',
        description: `Dans un d\u00E9lai de 1 \u00E0 2 jours ouvrables, nous enverrons trois (3) petites transactions sur votre compte bancaire sous un nom tel que "Expensify, Inc. Validation".`,
        descriptionCTA: 'Veuillez entrer chaque montant de transaction dans les champs ci-dessous. Exemple : 1,51.',
        reviewingInfo: 'Merci ! Nous examinons vos informations et nous vous contacterons sous peu. Veuillez v\u00E9rifier votre chat avec Concierge.',
        forNextSteps: 'pour les prochaines \u00E9tapes afin de terminer la configuration de votre compte bancaire.',
        letsChatCTA: 'Oui, discutons',
        letsChatText: 'Presque termin\u00E9 ! Nous avons besoin de votre aide pour v\u00E9rifier quelques derni\u00E8res informations par chat. Pr\u00EAt ?',
        letsChatTitle: 'Discutons !',
        enable2FATitle: "Pr\u00E9venez la fraude, activez l'authentification \u00E0 deux facteurs (2FA)",
        enable2FAText:
            "Nous prenons votre s\u00E9curit\u00E9 au s\u00E9rieux. Veuillez configurer l'authentification \u00E0 deux facteurs (2FA) maintenant pour ajouter une couche de protection suppl\u00E9mentaire \u00E0 votre compte.",
        secureYourAccount: 'S\u00E9curisez votre compte',
    },
    countryStep: {
        confirmBusinessBank: 'Confirmer la devise et le pays du compte bancaire professionnel',
        confirmCurrency: 'Confirmer la devise et le pays',
        yourBusiness: 'La devise de votre compte bancaire professionnel doit correspondre \u00E0 la devise de votre espace de travail.',
        youCanChange: 'Vous pouvez changer la devise de votre espace de travail dans votre',
        findCountry: 'Trouver le pays',
        selectCountry: 'S\u00E9lectionner le pays',
    },
    bankInfoStep: {
        whatAreYour: 'Quels sont les d\u00E9tails de votre compte bancaire professionnel ?',
        letsDoubleCheck: 'V\u00E9rifions que tout est en ordre.',
        thisBankAccount: 'Ce compte bancaire sera utilis\u00E9 pour les paiements professionnels sur votre espace de travail.',
        accountNumber: 'Num\u00E9ro de compte',
        accountHolderNameDescription: 'Nom complet du signataire autoris\u00E9',
    },
    signerInfoStep: {
        signerInfo: 'Informations du signataire',
        areYouDirector: ({companyName}: CompanyNameParams) => `\u00CAtes-vous un directeur ou un cadre sup\u00E9rieur chez ${companyName} ?`,
        regulationRequiresUs: "La r\u00E9glementation nous oblige \u00E0 v\u00E9rifier si le signataire a l'autorit\u00E9 pour prendre cette action au nom de l'entreprise.",
        whatsYourName: 'Quel est votre nom l\u00E9gal ?',
        fullName: 'Nom l\u00E9gal complet',
        whatsYourJobTitle: 'Quel est votre titre de poste ?',
        jobTitle: 'Intitul\u00E9 du poste',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        uploadID: "T\u00E9l\u00E9chargez une pi\u00E8ce d'identit\u00E9 et une preuve d'adresse",
        personalAddress: 'Justificatif de domicile personnel (par exemple, facture de services publics)',
        letsDoubleCheck: 'V\u00E9rifions que tout est correct.',
        legalName: 'Nom l\u00E9gal',
        proofOf: 'Justificatif de domicile personnel',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Entrez l'email du directeur ou d'un cadre sup\u00E9rieur chez ${companyName}`,
        regulationRequiresOneMoreDirector: 'La r\u00E9glementation exige au moins un autre directeur ou cadre sup\u00E9rieur en tant que signataire.',
        hangTight: 'Restez patient...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Entrez les e-mails de deux directeurs ou cadres sup\u00E9rieurs chez ${companyName}`,
        sendReminder: 'Envoyer un rappel',
        chooseFile: 'Choisir le fichier',
        weAreWaiting: "Nous attendons que d'autres v\u00E9rifient leur identit\u00E9 en tant que directeurs ou cadres sup\u00E9rieurs de l'entreprise.",
        id: "Copie de la pi\u00E8ce d'identit\u00E9",
        proofOfDirectors: 'Preuve du ou des directeur(s)',
        proofOfDirectorsDescription: "Exemples : Profil d'entreprise Oncorp ou Enregistrement d'entreprise.",
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale pour les signataires, utilisateurs autoris\u00E9s et b\u00E9n\u00E9ficiaires effectifs.',
        PDSandFSG: 'Documents de divulgation PDS + FSG',
        PDSandFSGDescription:
            "Notre partenariat avec Corpay utilise une connexion API pour tirer parti de leur vaste r\u00E9seau de partenaires bancaires internationaux afin d'alimenter les Remboursements Globaux dans Expensify. Conform\u00E9ment \u00E0 la r\u00E9glementation australienne, nous vous fournissons le Guide des Services Financiers (FSG) et le Document d'Information sur le Produit (PDS) de Corpay.\n\nVeuillez lire attentivement les documents FSG et PDS car ils contiennent des d\u00E9tails complets et des informations importantes sur les produits et services offerts par Corpay. Conservez ces documents pour r\u00E9f\u00E9rence future.",
        pleaseUpload:
            "Veuillez t\u00E9l\u00E9charger ci-dessous des documents suppl\u00E9mentaires pour nous aider \u00E0 v\u00E9rifier votre identit\u00E9 en tant que directeur ou cadre sup\u00E9rieur de l'entit\u00E9 commerciale.",
    },
    agreementsStep: {
        agreements: 'Accords',
        pleaseConfirm: 'Veuillez confirmer les accords ci-dessous',
        regulationRequiresUs: "La r\u00E9glementation nous oblige \u00E0 v\u00E9rifier l'identit\u00E9 de toute personne qui poss\u00E8de plus de 25% de l'entreprise.",
        iAmAuthorized: 'Je suis autoris\u00E9 \u00E0 utiliser le compte bancaire professionnel pour les d\u00E9penses professionnelles.',
        iCertify: 'Je certifie que les informations fournies sont vraies et exactes.',
        termsAndConditions: 'termes et conditions',
        accept: 'Accepter et ajouter un compte bancaire',
        iConsentToThe: 'Je consens \u00E0 la',
        privacyNotice: 'avis de confidentialit\u00E9',
        error: {
            authorized: "Vous devez \u00EAtre un agent de contr\u00F4le avec l'autorisation de g\u00E9rer le compte bancaire de l'entreprise.",
            certify: 'Veuillez certifier que les informations sont vraies et exactes.',
            consent: "Veuillez consentir \u00E0 l'avis de confidentialit\u00E9",
        },
    },
    finishStep: {
        connect: 'Connecter le compte bancaire',
        letsFinish: 'Finissons dans le chat !',
        thanksFor:
            "Merci pour ces d\u00E9tails. Un agent de support d\u00E9di\u00E9 va maintenant examiner vos informations. Nous reviendrons vers vous si nous avons besoin de quelque chose d'autre, mais en attendant, n'h\u00E9sitez pas \u00E0 nous contacter si vous avez des questions.",
        iHaveA: "J'ai une question",
        enable2FA: "Activez l'authentification \u00E0 deux facteurs (2FA) pour pr\u00E9venir la fraude",
        weTake: "Nous prenons votre s\u00E9curit\u00E9 au s\u00E9rieux. Veuillez configurer l'authentification \u00E0 deux facteurs (2FA) maintenant pour ajouter une couche de protection suppl\u00E9mentaire \u00E0 votre compte.",
        secure: 'S\u00E9curisez votre compte',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Un instant',
        explanationLine: 'Nous examinons vos informations. Vous pourrez bient\u00F4t continuer avec les prochaines \u00E9tapes.',
    },
    session: {
        offlineMessageRetry: 'Il semble que vous soyez hors ligne. Veuillez v\u00E9rifier votre connexion et r\u00E9essayer.',
    },
    travel: {
        header: 'R\u00E9server un voyage',
        title: 'Voyagez intelligemment',
        subtitle: 'Utilisez Expensify Travel pour obtenir les meilleures offres de voyage et g\u00E9rer toutes vos d\u00E9penses professionnelles en un seul endroit.',
        features: {
            saveMoney: "\u00C9conomisez de l'argent sur vos r\u00E9servations",
            alerts: 'Recevez des mises \u00E0 jour et des alertes en temps r\u00E9el',
        },
        bookTravel: 'R\u00E9server un voyage',
        bookDemo: 'R\u00E9server une d\u00E9monstration',
        bookADemo: 'R\u00E9server une d\u00E9mo',
        toLearnMore: 'pour en savoir plus.',
        termsAndConditions: {
            header: 'Avant de continuer...',
            title: 'Termes et conditions',
            subtitle: 'Veuillez accepter les conditions de Expensify Travel',
            termsAndConditions: 'termes et conditions',
            travelTermsAndConditions: 'termes et conditions',
            agree: "J'accepte les",
            error: "Vous devez accepter les termes et conditions d'Expensify Travel pour continuer.",
            defaultWorkspaceError:
                "Vous devez d\u00E9finir un espace de travail par d\u00E9faut pour activer Expensify Travel. Allez dans Param\u00E8tres > Espaces de travail > cliquez sur les trois points verticaux \u00E0 c\u00F4t\u00E9 d'un espace de travail > D\u00E9finir comme espace de travail par d\u00E9faut, puis r\u00E9essayez !",
        },
        flight: 'Vol',
        flightDetails: {
            passenger: 'Passager',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Vous avez une <strong>escale de ${layover}</strong> avant ce vol</muted-text-label>`,
            takeOff: 'D\u00E9collage',
            landing: "Page d'atterrissage",
            seat: 'Si\u00E8ge',
            class: 'Classe Cabine',
            recordLocator: "Localisateur d'enregistrement",
            cabinClasses: {
                unknown: 'Unknown',
                economy: '\u00C9conomie',
                premiumEconomy: 'Premium Economy',
                business: 'Business',
                first: 'Premier',
            },
        },
        hotel: 'H\u00F4tel',
        hotelDetails: {
            guest: 'Invit\u00E9',
            checkIn: 'Enregistrement',
            checkOut: 'Check-out',
            roomType: 'Type de chambre',
            cancellation: "Politique d'annulation",
            cancellationUntil: "Annulation gratuite jusqu'\u00E0",
            confirmation: 'Num\u00E9ro de confirmation',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Non remboursable',
                freeCancellationUntil: "Annulation gratuite jusqu'\u00E0",
                partiallyRefundable: 'Partiellement remboursable',
            },
        },
        car: 'Voiture',
        carDetails: {
            rentalCar: 'Location de voiture',
            pickUp: 'Ramassage',
            dropOff: 'D\u00E9p\u00F4t',
            driver: 'Conducteur',
            carType: 'Type de voiture',
            cancellation: "Politique d'annulation",
            cancellationUntil: "Annulation gratuite jusqu'\u00E0",
            freeCancellation: 'Annulation gratuite',
            confirmation: 'Num\u00E9ro de confirmation',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Passager',
            departs: 'D\u00E9parts',
            arrives: 'Arrive',
            coachNumber: 'Num\u00E9ro de coach',
            seat: 'Si\u00E8ge',
            fareDetails: 'D\u00E9tails du tarif',
            confirmation: 'Num\u00E9ro de confirmation',
        },
        viewTrip: 'Voir le voyage',
        modifyTrip: 'Modifier le voyage',
        tripSupport: 'Assistance de voyage',
        tripDetails: 'D\u00E9tails du voyage',
        viewTripDetails: 'Voir les d\u00E9tails du voyage',
        trip: 'Voyage',
        trips: 'Voyages',
        tripSummary: 'R\u00E9sum\u00E9 du voyage',
        departs: 'D\u00E9parts',
        errorMessage: "Une erreur s'est produite. Veuillez r\u00E9essayer plus tard.",
        phoneError: {
            phrase1: "S'il vous pla\u00EEt",
            link: 'ajoutez un e-mail professionnel comme votre identifiant principal',
            phrase2: 'pour r\u00E9server un voyage.',
        },
        domainSelector: {
            title: 'Domaine',
            subtitle: "Choisissez un domaine pour la configuration d'Expensify Travel.",
            recommended: 'Recommand\u00E9',
        },
        domainPermissionInfo: {
            title: 'Domaine',
            restrictionPrefix: `Vous n'avez pas la permission d'activer Expensify Travel pour le domaine`,
            restrictionSuffix: `Vous devrez demander \u00E0 quelqu'un de ce domaine d'activer les voyages \u00E0 la place.`,
            accountantInvitationPrefix: `Si vous \u00EAtes comptable, envisagez de rejoindre le`,
            accountantInvitationLink: `Programme ExpensifyApproved! pour comptables`,
            accountantInvitationSuffix: `pour activer les voyages pour ce domaine.`,
        },
        publicDomainError: {
            title: 'Commencez avec Expensify Travel',
            message: `Vous devrez utiliser votre adresse e-mail professionnelle (par exemple, nom@entreprise.com) avec Expensify Travel, et non votre adresse e-mail personnelle (par exemple, nom@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel a \u00E9t\u00E9 d\u00E9sactiv\u00E9',
            message: `Votre administrateur a d\u00E9sactiv\u00E9 Expensify Travel. Veuillez suivre la politique de r\u00E9servation de votre entreprise pour les arrangements de voyage.`,
        },
        verifyCompany: {
            title: "Commencez \u00E0 voyager d\u00E8s aujourd'hui !",
            message: `Veuillez contacter votre gestionnaire de compte ou salesteam@expensify.com pour obtenir une d\u00E9monstration du voyage et l'activer pour votre entreprise.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Votre vol ${airlineCode} (${origin} \u2192 ${destination}) le ${startDate} a \u00E9t\u00E9 r\u00E9serv\u00E9. Code de confirmation : ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Votre billet pour le vol ${airlineCode} (${origin} \u2192 ${destination}) le ${startDate} a \u00E9t\u00E9 annul\u00E9.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Votre billet pour le vol ${airlineCode} (${origin} \u2192 ${destination}) du ${startDate} a \u00E9t\u00E9 rembours\u00E9 ou \u00E9chang\u00E9.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Votre vol ${airlineCode} (${origin} \u2192 ${destination}) le ${startDate} a \u00E9t\u00E9 annul\u00E9 par la compagnie a\u00E9rienne.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `La compagnie a\u00E9rienne a propos\u00E9 un changement d'horaire pour le vol ${airlineCode} ; nous attendons la confirmation.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Changement d'horaire confirm\u00E9 : le vol ${airlineCode} part maintenant \u00E0 ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Votre vol ${airlineCode} (${origin} \u2192 ${destination}) du ${startDate} a \u00E9t\u00E9 mis \u00E0 jour.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Votre classe de cabine a \u00E9t\u00E9 mise \u00E0 jour en ${cabinClass} sur le vol ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Votre attribution de si\u00E8ge sur le vol ${airlineCode} a \u00E9t\u00E9 confirm\u00E9e.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Votre attribution de si\u00E8ge sur le vol ${airlineCode} a \u00E9t\u00E9 modifi\u00E9e.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Votre attribution de si\u00E8ge sur le vol ${airlineCode} a \u00E9t\u00E9 supprim\u00E9e.`,
            paymentDeclined: 'Le paiement de votre r\u00E9servation de vol a \u00E9chou\u00E9. Veuillez r\u00E9essayer.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Vous avez annul\u00E9 votre r\u00E9servation de ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Le fournisseur a annul\u00E9 votre r\u00E9servation de ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Votre r\u00E9servation de ${type} a \u00E9t\u00E9 re-r\u00E9serv\u00E9e. Nouveau num\u00E9ro de confirmation : ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Votre r\u00E9servation de ${type} a \u00E9t\u00E9 mise \u00E0 jour. Consultez les nouveaux d\u00E9tails dans l'itin\u00E9raire.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Votre billet de train pour ${origin} \u2192 ${destination} le ${startDate} a \u00E9t\u00E9 rembours\u00E9. Un cr\u00E9dit sera trait\u00E9.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) =>
                `Votre billet de train pour ${origin} \u2192 ${destination} le ${startDate} a \u00E9t\u00E9 \u00E9chang\u00E9.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) =>
                `Votre billet de train pour ${origin} \u2192 ${destination} le ${startDate} a \u00E9t\u00E9 mis \u00E0 jour.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Votre r\u00E9servation de ${type} a \u00E9t\u00E9 mise \u00E0 jour.`,
        },
    },
    workspace: {
        common: {
            card: 'Cartes',
            expensifyCard: 'Expensify Card',
            companyCards: "Cartes d'entreprise",
            workflows: 'Flux de travail',
            workspace: 'Espace de travail',
            findWorkspace: 'Trouver un espace de travail',
            edit: "Modifier l'espace de travail",
            enabled: 'Activ\u00E9',
            disabled: 'D\u00E9sactiv\u00E9',
            everyone: 'Tout le monde',
            delete: "Supprimer l'espace de travail",
            settings: 'Param\u00E8tres',
            reimburse: 'Remboursements',
            categories: 'Cat\u00E9gories',
            tags: 'Tags',
            customField1: 'Champ personnalis\u00E9 1',
            customField2: 'Champ personnalis\u00E9 2',
            customFieldHint: "Ajoutez un codage personnalis\u00E9 qui s'applique \u00E0 toutes les d\u00E9penses de ce membre.",
            reportFields: 'Champs de rapport',
            reportTitle: 'Titre du rapport',
            reportField: 'Champ de rapport',
            taxes: 'Taxes',
            bills: 'Factures',
            invoices: 'Factures',
            travel: 'Voyage',
            members: 'Membres',
            accounting: 'Comptabilit\u00E9',
            rules: 'R\u00E8gles',
            displayedAs: 'Affich\u00E9 comme',
            plan: 'Plan',
            profile: 'Aper\u00E7u',
            bankAccount: 'Compte bancaire',
            connectBankAccount: 'Connecter le compte bancaire',
            testTransactions: 'Transactions de test',
            issueAndManageCards: '\u00C9mettre et g\u00E9rer des cartes',
            reconcileCards: 'Rapprocher les cartes',
            selected: () => ({
                one: '1 s\u00E9lectionn\u00E9',
                other: (count: number) => `${count} s\u00E9lectionn\u00E9(s)`,
            }),
            settlementFrequency: 'Fr\u00E9quence de r\u00E8glement',
            setAsDefault: 'D\u00E9finir comme espace de travail par d\u00E9faut',
            defaultNote: `Les re\u00E7us envoy\u00E9s \u00E0 ${CONST.EMAIL.RECEIPTS} appara\u00EEtront dans cet espace de travail.`,
            deleteConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer cet espace de travail ?',
            deleteWithCardsConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer cet espace de travail ? Cela supprimera tous les flux de cartes et les cartes attribu\u00E9es.',
            unavailable: 'Espace de travail indisponible',
            memberNotFound: "Membre non trouv\u00E9. Pour inviter un nouveau membre \u00E0 l'espace de travail, veuillez utiliser le bouton d'invitation ci-dessus.",
            notAuthorized: `Vous n'avez pas acc\u00E8s \u00E0 cette page. Si vous essayez de rejoindre cet espace de travail, demandez simplement au propri\u00E9taire de l'espace de travail de vous ajouter en tant que membre. Autre chose ? Contactez ${CONST.EMAIL.CONCIERGE}.`,
            goToRoom: ({roomName}: GoToRoomParams) => `Aller \u00E0 la salle ${roomName}`,
            goToWorkspace: "Aller \u00E0 l'espace de travail",
            goToWorkspaces: 'Aller aux espaces de travail',
            clearFilter: 'Effacer le filtre',
            workspaceName: "Nom de l'espace de travail",
            workspaceOwner: 'Propri\u00E9taire',
            workspaceType: "Type d'espace de travail",
            workspaceAvatar: "Avatar de l'espace de travail",
            mustBeOnlineToViewMembers: 'Vous devez \u00EAtre en ligne pour voir les membres de cet espace de travail.',
            moreFeatures: 'Plus de fonctionnalit\u00E9s',
            requested: 'Demand\u00E9',
            distanceRates: 'Taux de distance',
            defaultDescription: 'Un seul endroit pour tous vos re\u00E7us et d\u00E9penses.',
            descriptionHint: 'Partager des informations sur cet espace de travail avec tous les membres.',
            welcomeNote: 'Veuillez utiliser Expensify pour soumettre vos re\u00E7us pour remboursement, merci !',
            subscription: 'Abonnement',
            markAsEntered: 'Marquer comme saisi manuellement',
            markAsExported: 'Marquer comme export\u00E9 manuellement',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exporter vers ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'V\u00E9rifions que tout est correct.',
            lineItemLevel: "Niveau de ligne d'article",
            reportLevel: 'Niveau de rapport',
            topLevel: 'Niveau sup\u00E9rieur',
            appliedOnExport: "Non import\u00E9 dans Expensify, appliqu\u00E9 \u00E0 l'exportation",
            shareNote: {
                header: "Partagez votre espace de travail avec d'autres membres",
                content: {
                    firstPart:
                        "Partagez ce code QR ou copiez le lien ci-dessous pour faciliter la demande d'acc\u00E8s des membres \u00E0 votre espace de travail. Toutes les demandes pour rejoindre l'espace de travail appara\u00EEtront dans le",
                    secondPart: 'espace pour votre avis.',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Connectez-vous \u00E0 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Cr\u00E9er une nouvelle connexion',
            reuseExistingConnection: 'R\u00E9utiliser la connexion existante',
            existingConnections: 'Connexions existantes',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Puisque vous vous \u00EAtes d\u00E9j\u00E0 connect\u00E9 \u00E0 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, vous pouvez choisir de r\u00E9utiliser une connexion existante ou d'en cr\u00E9er une nouvelle.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Derni\u00E8re synchronisation le ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Impossible de se connecter \u00E0 ${connectionName} en raison d'une erreur d'authentification`,
            learnMore: 'En savoir plus.',
            memberAlternateText: 'Les membres peuvent soumettre et approuver des rapports.',
            adminAlternateText: "Les administrateurs ont un acc\u00E8s complet pour modifier tous les rapports et les param\u00E8tres de l'espace de travail.",
            auditorAlternateText: 'Les auditeurs peuvent voir et commenter les rapports.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Auditeur';
                    case CONST.POLICY.ROLE.USER:
                        return 'Membre';
                    default:
                        return 'Membre';
                }
            },
            frequency: {
                manual: 'Manuellement',
                instant: 'Instantan\u00E9',
                immediate: 'Quotidiennement',
                trip: 'Par voyage',
                weekly: 'Hebdomadaire',
                semimonthly: 'Deux fois par mois',
                monthly: 'Mensuel',
            },
            planType: 'Type de plan',
            submitExpense: 'Soumettez vos d\u00E9penses ci-dessous :',
            defaultCategory: 'Cat\u00E9gorie par d\u00E9faut',
            viewTransactions: 'Voir les transactions',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `D\u00E9penses de ${displayName}`,
        },
        perDiem: {
            subtitle: 'D\u00E9finissez les taux de per diem pour contr\u00F4ler les d\u00E9penses quotidiennes des employ\u00E9s.',
            amount: 'Montant',
            deleteRates: () => ({
                one: 'Supprimer le taux',
                other: 'Supprimer les taux',
            }),
            deletePerDiemRate: 'Supprimer le taux de per diem',
            findPerDiemRate: 'Trouver le taux journalier',
            areYouSureDelete: () => ({
                one: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce tarif ?',
                other: '\u00CAtes-vous s\u00FBr de vouloir supprimer ces tarifs ?',
            }),
            emptyList: {
                title: 'Per diem',
                subtitle:
                    "D\u00E9finissez des taux de per diem pour contr\u00F4ler les d\u00E9penses quotidiennes des employ\u00E9s. Importez les taux \u00E0 partir d'une feuille de calcul pour commencer.",
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Un taux avec la valeur ${rate} existe d\u00E9j\u00E0`,
            },
            importPerDiemRates: 'Importer les taux de per diem',
            editPerDiemRate: 'Modifier le taux de per diem',
            editPerDiemRates: 'Modifier les taux de per diem',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `La mise \u00E0 jour de cette destination la modifiera pour tous les sous-taux de per diem ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `La mise \u00E0 jour de cette devise la modifiera pour tous les sous-taux de per diem de ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'D\u00E9finir comment les d\u00E9penses hors poche sont export\u00E9es vers QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Marquer les ch\u00E8ques comme \u00AB imprimer plus tard \u00BB',
            exportDescription: 'Configurez comment les donn\u00E9es Expensify sont export\u00E9es vers QuickBooks Desktop.',
            date: "Date d'exportation",
            exportInvoices: 'Exporter les factures vers',
            exportExpensifyCard: 'Exporter les transactions de la carte Expensify en tant que',
            account: 'Compte',
            accountDescription: 'Choisissez o\u00F9 publier les \u00E9critures de journal.',
            accountsPayable: 'Comptes fournisseurs',
            accountsPayableDescription: 'Choisissez o\u00F9 cr\u00E9er des factures fournisseurs.',
            bankAccount: 'Compte bancaire',
            notConfigured: 'Non configur\u00E9',
            bankAccountDescription: "Choisissez d'o\u00F9 envoyer les ch\u00E8ques.",
            creditCardAccount: 'Compte de carte de cr\u00E9dit',
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers QuickBooks Desktop.",
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la derni\u00E8re d\u00E9pense',
                        description: 'Date de la d\u00E9pense la plus r\u00E9cente sur le rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: "Date d'exportation",
                        description: 'Date \u00E0 laquelle le rapport a \u00E9t\u00E9 export\u00E9 vers QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date \u00E0 laquelle le rapport a \u00E9t\u00E9 soumis pour approbation.',
                    },
                },
            },
            exportCheckDescription: "Nous cr\u00E9erons un ch\u00E8que d\u00E9taill\u00E9 pour chaque rapport Expensify et l'enverrons depuis le compte bancaire ci-dessous.",
            exportJournalEntryDescription: 'Nous cr\u00E9erons une \u00E9criture de journal d\u00E9taill\u00E9e pour chaque rapport Expensify et la publierons sur le compte ci-dessous.',
            exportVendorBillDescription:
                "Nous cr\u00E9erons une facture d\u00E9taill\u00E9e pour chaque rapport Expensify et l'ajouterons au compte ci-dessous. Si cette p\u00E9riode est cl\u00F4tur\u00E9e, nous la publierons au 1er de la prochaine p\u00E9riode ouverte.",
            deepDiveExpensifyCard: 'Les transactions de la carte Expensify seront automatiquement export\u00E9es vers un "Compte de passif de carte Expensify" cr\u00E9\u00E9 avec',
            deepDiveExpensifyCardIntegration: 'notre int\u00E9gration.',
            outOfPocketTaxEnabledDescription:
                "QuickBooks Desktop ne prend pas en charge les taxes sur les exportations d'\u00E9critures de journal. Comme vous avez activ\u00E9 les taxes sur votre espace de travail, cette option d'exportation n'est pas disponible.",
            outOfPocketTaxEnabledError: "Les \u00E9critures de journal ne sont pas disponibles lorsque les taxes sont activ\u00E9es. Veuillez choisir une autre option d'exportation.",
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carte de cr\u00E9dit',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Facture fournisseur',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '\u00C9criture comptable',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'V\u00E9rifier',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "Nous cr\u00E9erons un ch\u00E8que d\u00E9taill\u00E9 pour chaque rapport Expensify et l'enverrons depuis le compte bancaire ci-dessous.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Nous associerons automatiquement le nom du commer\u00E7ant sur la transaction par carte de cr\u00E9dit \u00E0 tout fournisseur correspondant dans QuickBooks. Si aucun fournisseur n'existe, nous cr\u00E9erons un fournisseur 'Carte de cr\u00E9dit divers' pour l'association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "Nous cr\u00E9erons une facture fournisseur d\u00E9taill\u00E9e pour chaque rapport Expensify avec la date de la derni\u00E8re d\u00E9pense, et l'ajouterons au compte ci-dessous. Si cette p\u00E9riode est cl\u00F4tur\u00E9e, nous la publierons au 1er de la prochaine p\u00E9riode ouverte.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description du compte`]:
                    'Choisissez o\u00F9 exporter les transactions par carte de cr\u00E9dit.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}DescriptionDuCompte`]:
                    'Choisissez un fournisseur \u00E0 appliquer \u00E0 toutes les transactions par carte de cr\u00E9dit.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}DescriptionDuCompte`]: "Choisissez d'o\u00F9 envoyer les ch\u00E8ques.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Erreur`]:
                    "Les factures fournisseurs ne sont pas disponibles lorsque les emplacements sont activ\u00E9s. Veuillez choisir une autre option d'exportation.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Erreur`]:
                    "Les ch\u00E8ques ne sont pas disponibles lorsque les emplacements sont activ\u00E9s. Veuillez choisir une autre option d'exportation.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Erreur`]:
                    "Les \u00E9critures de journal ne sont pas disponibles lorsque les taxes sont activ\u00E9es. Veuillez choisir une autre option d'exportation.",
            },
            noAccountsFound: 'Aucun compte trouv\u00E9',
            noAccountsFoundDescription: 'Ajoutez le compte dans QuickBooks Desktop et synchronisez \u00E0 nouveau la connexion.',
            qbdSetup: 'Configuration de QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Impossible de se connecter depuis cet appareil',
                body1: "Vous devrez configurer cette connexion \u00E0 partir de l'ordinateur qui h\u00E9berge votre fichier d'entreprise QuickBooks Desktop.",
                body2: "Une fois connect\u00E9, vous pourrez synchroniser et exporter de n'importe o\u00F9.",
            },
            setupPage: {
                title: 'Ouvrez ce lien pour vous connecter.',
                body: "Pour terminer la configuration, ouvrez le lien suivant sur l'ordinateur o\u00F9 QuickBooks Desktop est en cours d'ex\u00E9cution.",
                setupErrorTitle: "Quelque chose s'est mal pass\u00E9",
                setupErrorBody1: 'La connexion QuickBooks Desktop ne fonctionne pas pour le moment. Veuillez r\u00E9essayer plus tard ou',
                setupErrorBody2: 'si le probl\u00E8me persiste.',
                setupErrorBodyContactConcierge: 'contactez Concierge',
            },
            importDescription: 'Choisissez quelles configurations de codage importer de QuickBooks Desktop vers Expensify.',
            classes: 'Classes',
            items: 'Articles',
            customers: 'Clients/projets',
            exportCompanyCardsDescription: "D\u00E9finir comment les achats par carte d'entreprise sont export\u00E9s vers QuickBooks Desktop.",
            defaultVendorDescription: "D\u00E9finir un fournisseur par d\u00E9faut qui s'appliquera \u00E0 toutes les transactions par carte de cr\u00E9dit lors de l'exportation.",
            accountsDescription: 'Votre plan comptable QuickBooks Desktop sera import\u00E9 dans Expensify en tant que cat\u00E9gories.',
            accountsSwitchTitle: "Choisissez d'importer de nouveaux comptes en tant que cat\u00E9gories activ\u00E9es ou d\u00E9sactiv\u00E9es.",
            accountsSwitchDescription:
                'Les cat\u00E9gories activ\u00E9es seront disponibles pour que les membres puissent les s\u00E9lectionner lors de la cr\u00E9ation de leurs d\u00E9penses.',
            classesDescription: 'Choisissez comment g\u00E9rer les classes QuickBooks Desktop dans Expensify.',
            tagsDisplayedAsDescription: "Niveau de ligne d'article",
            reportFieldsDisplayedAsDescription: 'Niveau de rapport',
            customersDescription: 'Choisissez comment g\u00E9rer les clients/projets QuickBooks Desktop dans Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec QuickBooks Desktop chaque jour.',
                createEntities: 'Auto-cr\u00E9er des entit\u00E9s',
                createEntitiesDescription: "Expensify cr\u00E9era automatiquement des fournisseurs dans QuickBooks Desktop s'ils n'existent pas d\u00E9j\u00E0.",
            },
            itemsDescription: 'Choisissez comment g\u00E9rer les \u00E9l\u00E9ments QuickBooks Desktop dans Expensify.',
        },
        qbo: {
            connectedTo: 'Connect\u00E9 \u00E0',
            importDescription: 'Choisissez quelles configurations de codage importer de QuickBooks Online vers Expensify.',
            classes: 'Classes',
            locations: 'Emplacements',
            customers: 'Clients/projets',
            accountsDescription: 'Votre plan comptable QuickBooks Online sera import\u00E9 dans Expensify en tant que cat\u00E9gories.',
            accountsSwitchTitle: "Choisissez d'importer de nouveaux comptes en tant que cat\u00E9gories activ\u00E9es ou d\u00E9sactiv\u00E9es.",
            accountsSwitchDescription:
                'Les cat\u00E9gories activ\u00E9es seront disponibles pour que les membres puissent les s\u00E9lectionner lors de la cr\u00E9ation de leurs d\u00E9penses.',
            classesDescription: 'Choisissez comment g\u00E9rer les classes QuickBooks Online dans Expensify.',
            customersDescription: 'Choisissez comment g\u00E9rer les clients/projets QuickBooks Online dans Expensify.',
            locationsDescription: 'Choisissez comment g\u00E9rer les emplacements QuickBooks Online dans Expensify.',
            taxesDescription: 'Choisissez comment g\u00E9rer les taxes QuickBooks Online dans Expensify.',
            locationsLineItemsRestrictionDescription:
                "QuickBooks Online ne prend pas en charge les emplacements au niveau des lignes pour les ch\u00E8ques ou les factures fournisseurs. Si vous souhaitez avoir des emplacements au niveau des lignes, assurez-vous d'utiliser les \u00E9critures de journal et les d\u00E9penses par carte de cr\u00E9dit/d\u00E9bit.",
            taxesJournalEntrySwitchNote:
                "QuickBooks Online ne prend pas en charge les taxes sur les \u00E9critures de journal. Veuillez changer votre option d'exportation en facture fournisseur ou ch\u00E8que.",
            exportDescription: 'Configurez comment les donn\u00E9es Expensify sont export\u00E9es vers QuickBooks Online.',
            date: "Date d'exportation",
            exportInvoices: 'Exporter les factures vers',
            exportExpensifyCard: 'Exporter les transactions de la carte Expensify en tant que',
            deepDiveExpensifyCard: 'Les transactions de la carte Expensify seront automatiquement export\u00E9es vers un "Compte de passif de carte Expensify" cr\u00E9\u00E9 avec',
            deepDiveExpensifyCardIntegration: 'notre int\u00E9gration.',
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers QuickBooks Online.",
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la derni\u00E8re d\u00E9pense',
                        description: 'Date de la d\u00E9pense la plus r\u00E9cente sur le rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: "Date d'exportation",
                        description: 'Date \u00E0 laquelle le rapport a \u00E9t\u00E9 export\u00E9 vers QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date \u00E0 laquelle le rapport a \u00E9t\u00E9 soumis pour approbation.',
                    },
                },
            },
            receivable: 'Comptes clients', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archive des comptes clients', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: "Utilisez ce compte lors de l'exportation des factures vers QuickBooks Online.",
            exportCompanyCardsDescription: "D\u00E9finissez comment les achats par carte d'entreprise sont export\u00E9s vers QuickBooks Online.",
            vendor: 'Fournisseur',
            defaultVendorDescription: "D\u00E9finir un fournisseur par d\u00E9faut qui s'appliquera \u00E0 toutes les transactions par carte de cr\u00E9dit lors de l'exportation.",
            exportOutOfPocketExpensesDescription: 'D\u00E9finissez comment les d\u00E9penses hors poche sont export\u00E9es vers QuickBooks Online.',
            exportCheckDescription: "Nous cr\u00E9erons un ch\u00E8que d\u00E9taill\u00E9 pour chaque rapport Expensify et l'enverrons depuis le compte bancaire ci-dessous.",
            exportJournalEntryDescription: 'Nous cr\u00E9erons une \u00E9criture de journal d\u00E9taill\u00E9e pour chaque rapport Expensify et la publierons sur le compte ci-dessous.',
            exportVendorBillDescription:
                "Nous cr\u00E9erons une facture d\u00E9taill\u00E9e pour chaque rapport Expensify et l'ajouterons au compte ci-dessous. Si cette p\u00E9riode est cl\u00F4tur\u00E9e, nous la publierons au 1er de la prochaine p\u00E9riode ouverte.",
            account: 'Compte',
            accountDescription: 'Choisissez o\u00F9 publier les \u00E9critures de journal.',
            accountsPayable: 'Comptes fournisseurs',
            accountsPayableDescription: 'Choisissez o\u00F9 cr\u00E9er des factures fournisseurs.',
            bankAccount: 'Compte bancaire',
            notConfigured: 'Non configur\u00E9',
            bankAccountDescription: "Choisissez d'o\u00F9 envoyer les ch\u00E8ques.",
            creditCardAccount: 'Compte de carte de cr\u00E9dit',
            companyCardsLocationEnabledDescription:
                "QuickBooks Online ne prend pas en charge les emplacements pour les exportations de factures fournisseurs. Comme vous avez activ\u00E9 les emplacements dans votre espace de travail, cette option d'exportation n'est pas disponible.",
            outOfPocketTaxEnabledDescription:
                "QuickBooks Online ne prend pas en charge les taxes sur les exportations d'\u00E9critures de journal. Comme vous avez activ\u00E9 les taxes sur votre espace de travail, cette option d'exportation n'est pas disponible.",
            outOfPocketTaxEnabledError: "Les \u00E9critures de journal ne sont pas disponibles lorsque les taxes sont activ\u00E9es. Veuillez choisir une autre option d'exportation.",
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec QuickBooks Online tous les jours.',
                inviteEmployees: 'Inviter des employ\u00E9s',
                inviteEmployeesDescription: 'Importer les dossiers des employ\u00E9s de QuickBooks Online et inviter les employ\u00E9s \u00E0 cet espace de travail.',
                createEntities: 'Auto-cr\u00E9er des entit\u00E9s',
                createEntitiesDescription:
                    "Expensify cr\u00E9era automatiquement des fournisseurs dans QuickBooks Online s'ils n'existent pas d\u00E9j\u00E0, et cr\u00E9era automatiquement des clients lors de l'exportation des factures.",
                reimbursedReportsDescription:
                    "Chaque fois qu'un rapport est pay\u00E9 en utilisant Expensify ACH, le paiement de facture correspondant sera cr\u00E9\u00E9 dans le compte QuickBooks Online ci-dessous.",
                qboBillPaymentAccount: 'Compte de paiement de factures QuickBooks',
                qboInvoiceCollectionAccount: 'Compte de recouvrement des factures QuickBooks',
                accountSelectDescription: "Choisissez d'o\u00F9 payer les factures et nous cr\u00E9erons le paiement dans QuickBooks Online.",
                invoiceAccountSelectorDescription: 'Choisissez o\u00F9 recevoir les paiements de factures et nous cr\u00E9erons le paiement dans QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Carte de d\u00E9bit',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carte de cr\u00E9dit',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Facture fournisseur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '\u00C9criture comptable',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'V\u00E9rifier',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "Nous associerons automatiquement le nom du commer\u00E7ant sur la transaction par carte de d\u00E9bit \u00E0 tout fournisseur correspondant dans QuickBooks. Si aucun fournisseur n'existe, nous cr\u00E9erons un fournisseur 'Carte de d\u00E9bit divers' pour l'association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Nous associerons automatiquement le nom du commer\u00E7ant sur la transaction par carte de cr\u00E9dit \u00E0 tout fournisseur correspondant dans QuickBooks. Si aucun fournisseur n'existe, nous cr\u00E9erons un fournisseur 'Carte de cr\u00E9dit divers' pour l'association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "Nous cr\u00E9erons une facture fournisseur d\u00E9taill\u00E9e pour chaque rapport Expensify avec la date de la derni\u00E8re d\u00E9pense, et l'ajouterons au compte ci-dessous. Si cette p\u00E9riode est cl\u00F4tur\u00E9e, nous la publierons au 1er de la prochaine p\u00E9riode ouverte.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}DescriptionDuCompte`]: 'Choisissez o\u00F9 exporter les transactions par carte de d\u00E9bit.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}DescriptionDuCompte`]: 'Choisissez o\u00F9 exporter les transactions par carte de cr\u00E9dit.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}DescriptionDuCompte`]:
                    'Choisissez un fournisseur \u00E0 appliquer \u00E0 toutes les transactions par carte de cr\u00E9dit.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Erreur`]:
                    "Les factures fournisseurs ne sont pas disponibles lorsque les emplacements sont activ\u00E9s. Veuillez choisir une autre option d'exportation.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Erreur`]:
                    "Les ch\u00E8ques ne sont pas disponibles lorsque les emplacements sont activ\u00E9s. Veuillez choisir une autre option d'exportation.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Erreur`]:
                    "Les \u00E9critures de journal ne sont pas disponibles lorsque les taxes sont activ\u00E9es. Veuillez choisir une autre option d'exportation.",
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: "Choisissez un compte valide pour l'exportation de la facture fournisseur",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: "Choisissez un compte valide pour l'exportation de l'\u00E9criture de journal",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: "Choisissez un compte valide pour l'exportation de ch\u00E8ques",
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]:
                    "Pour utiliser l'exportation de factures fournisseurs, configurez un compte de comptes fournisseurs dans QuickBooks Online.",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: "Pour utiliser l'exportation d'\u00E9critures de journal, configurez un compte de journal dans QuickBooks Online",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: "Pour utiliser l'exportation de ch\u00E8ques, configurez un compte bancaire dans QuickBooks Online",
            },
            noAccountsFound: 'Aucun compte trouv\u00E9',
            noAccountsFoundDescription: 'Ajoutez le compte dans QuickBooks Online et synchronisez \u00E0 nouveau la connexion.',
            accountingMethods: {
                label: 'Quand exporter',
                description: 'Choisissez quand exporter les d\u00E9penses :',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Esp\u00E8ces',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les d\u00E9penses personnelles seront export\u00E9es une fois approuv\u00E9es d\u00E9finitivement.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les d\u00E9penses hors de la poche seront export\u00E9es une fois pay\u00E9es',
                },
            },
        },
        workspaceList: {
            joinNow: 'Rejoignez maintenant',
            askToJoin: 'Demander \u00E0 rejoindre',
        },
        xero: {
            organization: 'organisation Xero',
            organizationDescription: "Choisissez l'organisation Xero \u00E0 partir de laquelle vous souhaitez importer des donn\u00E9es.",
            importDescription: 'Choisissez quelles configurations de codage importer de Xero vers Expensify.',
            accountsDescription: 'Votre plan comptable Xero sera import\u00E9 dans Expensify en tant que cat\u00E9gories.',
            accountsSwitchTitle: "Choisissez d'importer de nouveaux comptes en tant que cat\u00E9gories activ\u00E9es ou d\u00E9sactiv\u00E9es.",
            accountsSwitchDescription:
                'Les cat\u00E9gories activ\u00E9es seront disponibles pour que les membres puissent les s\u00E9lectionner lors de la cr\u00E9ation de leurs d\u00E9penses.',
            trackingCategories: 'Cat\u00E9gories de suivi',
            trackingCategoriesDescription: 'Choisissez comment g\u00E9rer les cat\u00E9gories de suivi Xero dans Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mapper ${categoryName} de Xero \u00E0`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Choisissez o\u00F9 mapper ${categoryName} lors de l'exportation vers Xero.`,
            customers: 'Refacturer les clients',
            customersDescription:
                'Choisissez si vous souhaitez refacturer les clients dans Expensify. Vos contacts clients Xero peuvent \u00EAtre associ\u00E9s \u00E0 des d\u00E9penses et seront export\u00E9s vers Xero en tant que facture de vente.',
            taxesDescription: 'Choisissez comment g\u00E9rer les taxes Xero dans Expensify.',
            notImported: 'Non import\u00E9',
            notConfigured: 'Non configur\u00E9',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contact par d\u00E9faut Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Champs de rapport',
            },
            exportDescription: "Configurez comment les donn\u00E9es Expensify s'exportent vers Xero.",
            purchaseBill: "Facture d'achat",
            exportDeepDiveCompanyCard:
                'Les d\u00E9penses export\u00E9es seront enregistr\u00E9es en tant que transactions bancaires sur le compte bancaire Xero ci-dessous, et les dates des transactions correspondront aux dates de votre relev\u00E9 bancaire.',
            bankTransactions: 'Transactions bancaires',
            xeroBankAccount: 'Compte bancaire Xero',
            xeroBankAccountDescription: 'Choisissez o\u00F9 les d\u00E9penses seront enregistr\u00E9es en tant que transactions bancaires.',
            exportExpensesDescription: "Les rapports seront export\u00E9s en tant que facture d'achat avec la date et le statut s\u00E9lectionn\u00E9s ci-dessous.",
            purchaseBillDate: "Date de la facture d'achat",
            exportInvoices: 'Exporter les factures en tant que',
            salesInvoice: 'Facture de vente',
            exportInvoicesDescription: 'Les factures de vente affichent toujours la date \u00E0 laquelle la facture a \u00E9t\u00E9 envoy\u00E9e.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec Xero tous les jours.',
                purchaseBillStatusTitle: "Statut de la facture d'achat",
                reimbursedReportsDescription:
                    "Chaque fois qu'un rapport est pay\u00E9 en utilisant Expensify ACH, le paiement de facture correspondant sera cr\u00E9\u00E9 dans le compte Xero ci-dessous.",
                xeroBillPaymentAccount: 'Compte de paiement de facture Xero',
                xeroInvoiceCollectionAccount: 'Compte de recouvrement des factures Xero',
                xeroBillPaymentAccountDescription: "Choisissez d'o\u00F9 payer les factures et nous cr\u00E9erons le paiement dans Xero.",
                invoiceAccountSelectorDescription: 'Choisissez o\u00F9 recevoir les paiements de factures et nous cr\u00E9erons le paiement dans Xero.',
            },
            exportDate: {
                label: "Date de la facture d'achat",
                description: "Utilisez cette date lors de l'exportation des rapports vers Xero.",
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la derni\u00E8re d\u00E9pense',
                        description: 'Date de la d\u00E9pense la plus r\u00E9cente sur le rapport.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: "Date d'exportation",
                        description: 'Date \u00E0 laquelle le rapport a \u00E9t\u00E9 export\u00E9 vers Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date \u00E0 laquelle le rapport a \u00E9t\u00E9 soumis pour approbation.',
                    },
                },
            },
            invoiceStatus: {
                label: "Statut de la facture d'achat",
                description: "Utilisez ce statut lors de l'exportation des factures d'achat vers Xero.",
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Brouillon',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: "En attente d'approbation",
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'En attente de paiement',
                },
            },
            noAccountsFound: 'Aucun compte trouv\u00E9',
            noAccountsFoundDescription: 'Veuillez ajouter le compte dans Xero et synchroniser \u00E0 nouveau la connexion.',
        },
        sageIntacct: {
            preferredExporter: 'Exportateur pr\u00E9f\u00E9r\u00E9',
            taxSolution: 'Solution fiscale',
            notConfigured: 'Non configur\u00E9',
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers Sage Intacct.",
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la derni\u00E8re d\u00E9pense',
                        description: 'Date de la d\u00E9pense la plus r\u00E9cente sur le rapport.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: "Date d'exportation",
                        description: 'Date \u00E0 laquelle le rapport a \u00E9t\u00E9 export\u00E9 vers Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date \u00E0 laquelle le rapport a \u00E9t\u00E9 soumis pour approbation.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'D\u00E9finissez comment les d\u00E9penses hors poche sont export\u00E9es vers Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Rapports de d\u00E9penses',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Factures fournisseurs',
                },
            },
            nonReimbursableExpenses: {
                description: "D\u00E9finissez comment les achats par carte d'entreprise sont export\u00E9s vers Sage Intacct.",
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Cartes de cr\u00E9dit',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Factures fournisseurs',
                },
            },
            creditCardAccount: 'Compte de carte de cr\u00E9dit',
            defaultVendor: 'Fournisseur par d\u00E9faut',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `D\u00E9finissez un fournisseur par d\u00E9faut qui s'appliquera aux d\u00E9penses remboursables ${isReimbursable ? '' : 'non-'} qui n'ont pas de fournisseur correspondant dans Sage Intacct.`,
            exportDescription: 'Configurez comment les donn\u00E9es Expensify sont export\u00E9es vers Sage Intacct.',
            exportPreferredExporterNote:
                "L'exportateur pr\u00E9f\u00E9r\u00E9 peut \u00EAtre n'importe quel administrateur d'espace de travail, mais doit \u00E9galement \u00EAtre un administrateur de domaine si vous d\u00E9finissez diff\u00E9rents comptes d'exportation pour les cartes d'entreprise individuelles dans les param\u00E8tres de domaine.",
            exportPreferredExporterSubNote: "Une fois d\u00E9fini, l'exportateur pr\u00E9f\u00E9r\u00E9 verra les rapports \u00E0 exporter dans son compte.",
            noAccountsFound: 'Aucun compte trouv\u00E9',
            noAccountsFoundDescription: `Veuillez ajouter le compte dans Sage Intacct et synchroniser \u00E0 nouveau la connexion.`,
            autoSync: 'Synchronisation automatique',
            autoSyncDescription: 'Expensify se synchronisera automatiquement avec Sage Intacct tous les jours.',
            inviteEmployees: 'Inviter des employ\u00E9s',
            inviteEmployeesDescription:
                "Importer les dossiers des employ\u00E9s de Sage Intacct et inviter les employ\u00E9s \u00E0 cet espace de travail. Votre flux de travail d'approbation sera par d\u00E9faut l'approbation par le gestionnaire et peut \u00EAtre configur\u00E9 davantage sur la page Membres.",
            syncReimbursedReports: 'Synchroniser les rapports rembours\u00E9s',
            syncReimbursedReportsDescription:
                "Chaque fois qu'un rapport est pay\u00E9 en utilisant Expensify ACH, le paiement de facture correspondant sera cr\u00E9\u00E9 dans le compte Sage Intacct ci-dessous.",
            paymentAccount: 'Compte de paiement Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Filiale',
            subsidiarySelectDescription: 'Choisissez la filiale dans NetSuite \u00E0 partir de laquelle vous souhaitez importer des donn\u00E9es.',
            exportDescription: 'Configurez comment les donn\u00E9es Expensify sont export\u00E9es vers NetSuite.',
            exportInvoices: 'Exporter les factures vers',
            journalEntriesTaxPostingAccount: 'Comptes de publication fiscale des \u00E9critures de journal',
            journalEntriesProvTaxPostingAccount: 'Entr\u00E9es de journal compte de publication de la taxe provinciale',
            foreignCurrencyAmount: 'Exporter le montant en devise \u00E9trang\u00E8re',
            exportToNextOpenPeriod: 'Exporter vers la prochaine p\u00E9riode ouverte',
            nonReimbursableJournalPostingAccount: 'Compte de publication de journal non remboursable',
            reimbursableJournalPostingAccount: 'Compte de publication de journal remboursable',
            journalPostingPreference: {
                label: 'Pr\u00E9f\u00E9rence de publication des \u00E9critures de journal',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Entr\u00E9e unique et d\u00E9taill\u00E9e pour chaque rapport',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Une seule entr\u00E9e pour chaque d\u00E9pense',
                },
            },
            invoiceItem: {
                label: 'Article de facture',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Cr\u00E9ez-en un pour moi',
                        description: 'Nous cr\u00E9erons un "\u00E9l\u00E9ment de ligne de facture Expensify" pour vous lors de l\'exportation (si un n\'existe pas d\u00E9j\u00E0).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'S\u00E9lectionner existant',
                        description: "Nous allons lier les factures d'Expensify \u00E0 l'\u00E9l\u00E9ment s\u00E9lectionn\u00E9 ci-dessous.",
                    },
                },
            },
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers NetSuite.",
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la derni\u00E8re d\u00E9pense',
                        description: 'Date de la d\u00E9pense la plus r\u00E9cente sur le rapport.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: "Date d'exportation",
                        description: 'Date \u00E0 laquelle le rapport a \u00E9t\u00E9 export\u00E9 vers NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date \u00E0 laquelle le rapport a \u00E9t\u00E9 soumis pour approbation.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Rapports de d\u00E9penses',
                        reimbursableDescription: 'Les d\u00E9penses personnelles seront export\u00E9es sous forme de rapports de d\u00E9penses vers NetSuite.',
                        nonReimbursableDescription: "Les d\u00E9penses de carte d'entreprise seront export\u00E9es sous forme de rapports de d\u00E9penses vers NetSuite.",
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Factures fournisseurs',
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
                        label: '\u00C9critures de journal',
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
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec NetSuite tous les jours.',
                reimbursedReportsDescription:
                    "Chaque fois qu'un rapport est pay\u00E9 en utilisant Expensify ACH, le paiement de facture correspondant sera cr\u00E9\u00E9 dans le compte NetSuite ci-dessous.",
                reimbursementsAccount: 'Compte de remboursements',
                reimbursementsAccountDescription: 'Choisissez le compte bancaire que vous utiliserez pour les remboursements, et nous cr\u00E9erons le paiement associ\u00E9 dans NetSuite.',
                collectionsAccount: 'Compte de recouvrement',
                collectionsAccountDescription:
                    "Une fois qu'une facture est marqu\u00E9e comme pay\u00E9e dans Expensify et export\u00E9e vers NetSuite, elle appara\u00EEtra sur le compte ci-dessous.",
                approvalAccount: "Compte d'approbation A/P",
                approvalAccountDescription:
                    "Choisissez le compte contre lequel les transactions seront approuv\u00E9es dans NetSuite. Si vous synchronisez des rapports rembours\u00E9s, c'est \u00E9galement le compte contre lequel les paiements de factures seront cr\u00E9\u00E9s.",
                defaultApprovalAccount: 'NetSuite par d\u00E9faut',
                inviteEmployees: 'Invitez des employ\u00E9s et d\u00E9finissez des approbations',
                inviteEmployeesDescription:
                    "Importer les dossiers des employ\u00E9s de NetSuite et inviter les employ\u00E9s \u00E0 cet espace de travail. Votre flux de travail d'approbation sera par d\u00E9faut l'approbation du gestionnaire et peut \u00EAtre configur\u00E9 davantage sur la page *Membres*.",
                autoCreateEntities: 'Cr\u00E9er automatiquement des employ\u00E9s/fournisseurs',
                enableCategories: 'Activer les cat\u00E9gories nouvellement import\u00E9es',
                customFormID: 'ID de formulaire personnalis\u00E9',
                customFormIDDescription:
                    'Par d\u00E9faut, Expensify cr\u00E9era des entr\u00E9es en utilisant le formulaire de transaction pr\u00E9f\u00E9r\u00E9 d\u00E9fini dans NetSuite. Vous pouvez \u00E9galement d\u00E9signer un formulaire de transaction sp\u00E9cifique \u00E0 utiliser.',
                customFormIDReimbursable: 'D\u00E9pense personnelle',
                customFormIDNonReimbursable: "D\u00E9pense de carte d'entreprise",
                exportReportsTo: {
                    label: "Niveau d'approbation du rapport de d\u00E9penses",
                    description:
                        "Une fois qu'un rapport de d\u00E9penses est approuv\u00E9 dans Expensify et export\u00E9 vers NetSuite, vous pouvez d\u00E9finir un niveau d'approbation suppl\u00E9mentaire dans NetSuite avant la publication.",
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Pr\u00E9f\u00E9rence par d\u00E9faut NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Approuv\u00E9 uniquement par le superviseur',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Seulement la comptabilit\u00E9 approuv\u00E9e',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Superviseur et comptabilit\u00E9 approuv\u00E9s',
                    },
                },
                accountingMethods: {
                    label: 'Quand exporter',
                    description: 'Choisissez quand exporter les d\u00E9penses :',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Esp\u00E8ces',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les d\u00E9penses personnelles seront export\u00E9es une fois approuv\u00E9es d\u00E9finitivement.',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les d\u00E9penses hors de la poche seront export\u00E9es une fois pay\u00E9es',
                    },
                },
                exportVendorBillsTo: {
                    label: "Niveau d'approbation des factures fournisseurs",
                    description:
                        "Une fois qu'une facture fournisseur est approuv\u00E9e dans Expensify et export\u00E9e vers NetSuite, vous pouvez d\u00E9finir un niveau d'approbation suppl\u00E9mentaire dans NetSuite avant la publication.",
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Pr\u00E9f\u00E9rence par d\u00E9faut NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: "En attente d'approbation",
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Approuv\u00E9 pour publication',
                    },
                },
                exportJournalsTo: {
                    label: "Niveau d'approbation de l'\u00E9criture comptable",
                    description:
                        "Une fois qu'une \u00E9criture de journal est approuv\u00E9e dans Expensify et export\u00E9e vers NetSuite, vous pouvez d\u00E9finir un niveau d'approbation suppl\u00E9mentaire dans NetSuite avant la publication.",
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Pr\u00E9f\u00E9rence par d\u00E9faut NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: "En attente d'approbation",
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Approuv\u00E9 pour publication',
                    },
                },
                error: {
                    customFormID: 'Veuillez entrer un identifiant de formulaire personnalis\u00E9 num\u00E9rique valide.',
                },
            },
            noAccountsFound: 'Aucun compte trouv\u00E9',
            noAccountsFoundDescription: 'Veuillez ajouter le compte dans NetSuite et synchroniser \u00E0 nouveau la connexion.',
            noVendorsFound: 'Aucun fournisseur trouv\u00E9',
            noVendorsFoundDescription: 'Veuillez ajouter des fournisseurs dans NetSuite et synchroniser \u00E0 nouveau la connexion.',
            noItemsFound: 'Aucun \u00E9l\u00E9ment de facture trouv\u00E9',
            noItemsFoundDescription: 'Veuillez ajouter des \u00E9l\u00E9ments de facture dans NetSuite et synchroniser \u00E0 nouveau la connexion.',
            noSubsidiariesFound: 'Aucune filiale trouv\u00E9e',
            noSubsidiariesFoundDescription: 'Veuillez ajouter une filiale dans NetSuite et synchroniser \u00E0 nouveau la connexion.',
            tokenInput: {
                title: 'Configuration de NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Installer le bundle Expensify',
                        description: 'Dans NetSuite, allez \u00E0 *Customization > SuiteBundler > Search & Install Bundles* > recherchez "Expensify" > installez le bundle.',
                    },
                    enableTokenAuthentication: {
                        title: "Activer l'authentification par jeton",
                        description: 'Dans NetSuite, allez \u00E0 *Setup > Company > Enable Features > SuiteCloud* > activez *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Activer les services web SOAP',
                        description: 'Dans NetSuite, allez \u00E0 *Setup > Company > Enable Features > SuiteCloud* > activez *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: "Cr\u00E9er un jeton d'acc\u00E8s",
                        description:
                            'Dans NetSuite, allez \u00E0 *Setup > Users/Roles > Access Tokens* > cr\u00E9ez un jeton d\'acc\u00E8s pour l\'application "Expensify" et soit le r\u00F4le "Expensify Integration" soit le r\u00F4le "Administrator".\n\n*Important :* Assurez-vous de sauvegarder le *Token ID* et le *Token Secret* de cette \u00E9tape. Vous en aurez besoin pour l\'\u00E9tape suivante.',
                    },
                    enterCredentials: {
                        title: 'Entrez vos identifiants NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'Dans NetSuite, allez \u00E0 *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Cat\u00E9gories de d\u00E9penses',
                expenseCategoriesDescription: 'Vos cat\u00E9gories de d\u00E9penses NetSuite seront import\u00E9es dans Expensify en tant que cat\u00E9gories.',
                crossSubsidiaryCustomers: 'Clients/projets inter-filiales',
                importFields: {
                    departments: {
                        title: 'D\u00E9partements',
                        subtitle: 'Choisissez comment g\u00E9rer les *d\u00E9partements* NetSuite dans Expensify.',
                    },
                    classes: {
                        title: 'Classes',
                        subtitle: 'Choisissez comment g\u00E9rer les *classes* dans Expensify.',
                    },
                    locations: {
                        title: 'Emplacements',
                        subtitle: 'Choisissez comment g\u00E9rer les *emplacements* dans Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clients/projets',
                    subtitle: 'Choisissez comment g\u00E9rer les *clients* et les *projets* NetSuite dans Expensify.',
                    importCustomers: 'Importer des clients',
                    importJobs: 'Importer des projets',
                    customers: 'clients',
                    jobs: 'projets',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('et')}, ${importType}`,
                },
                importTaxDescription: 'Importer des groupes de taxes depuis NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Choisissez une option ci-dessous :',
                    label: ({importedTypes}: ImportedTypesParams) => `Import\u00E9 en tant que ${importedTypes.join('et')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Veuillez entrer le ${fieldName}`,
                    customSegments: {
                        title: 'Segments/enregistrements personnalis\u00E9s',
                        addText: 'Ajouter un segment/enregistrement personnalis\u00E9',
                        recordTitle: 'Segment/enregistrement personnalis\u00E9',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Voir les instructions d\u00E9taill\u00E9es',
                        helpText: 'sur la configuration de segments/enregistrements personnalis\u00E9s.',
                        emptyTitle: 'Ajouter un segment personnalis\u00E9 ou un enregistrement personnalis\u00E9',
                        fields: {
                            segmentName: 'Nom',
                            internalID: 'ID interne',
                            scriptID: 'ID de script',
                            customRecordScriptID: 'ID de colonne de transaction',
                            mapping: 'Affich\u00E9 comme',
                        },
                        removeTitle: 'Supprimer le segment/enregistrement personnalis\u00E9',
                        removePrompt: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce segment/enregistrement personnalis\u00E9 ?',
                        addForm: {
                            customSegmentName: 'nom de segment personnalis\u00E9',
                            customRecordName: "nom d'enregistrement personnalis\u00E9",
                            segmentTitle: 'Segment personnalis\u00E9',
                            customSegmentAddTitle: 'Ajouter un segment personnalis\u00E9',
                            customRecordAddTitle: 'Ajouter un enregistrement personnalis\u00E9',
                            recordTitle: 'Enregistrement personnalis\u00E9',
                            segmentRecordType: 'Voulez-vous ajouter un segment personnalis\u00E9 ou un enregistrement personnalis\u00E9 ?',
                            customSegmentNameTitle: 'Quel est le nom du segment personnalis\u00E9 ?',
                            customRecordNameTitle: "Quel est le nom de l'enregistrement personnalis\u00E9 ?",
                            customSegmentNameFooter: `Vous pouvez trouver les noms de segments personnalis\u00E9s dans NetSuite sous la page *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Vous pouvez trouver les noms d'enregistrements personnalis\u00E9s dans NetSuite en entrant le "Transaction Column Field" dans la recherche globale.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "Quel est l'ID interne ?",
                            customSegmentInternalIDFooter: `Tout d'abord, assurez-vous d'avoir activ\u00E9 les ID internes dans NetSuite sous *Accueil > D\u00E9finir les pr\u00E9f\u00E9rences > Afficher l'ID interne.*\n\nVous pouvez trouver les ID internes des segments personnalis\u00E9s dans NetSuite sous :\n\n1. *Personnalisation > Listes, Enregistrements, & Champs > Segments Personnalis\u00E9s*.\n2. Cliquez sur un segment personnalis\u00E9.\n3. Cliquez sur le lien hypertexte \u00E0 c\u00F4t\u00E9 de *Type d'enregistrement personnalis\u00E9*.\n4. Trouvez l'ID interne dans le tableau en bas.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Vous pouvez trouver les IDs internes des enregistrements personnalis\u00E9s dans NetSuite en suivant ces \u00E9tapes :\n\n1. Entrez "Transaction Line Fields" dans la recherche globale.\n2. Cliquez sur un enregistrement personnalis\u00E9.\n3. Trouvez l'ID interne sur le c\u00F4t\u00E9 gauche.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "Quel est l'ID du script ?",
                            customSegmentScriptIDFooter: `Vous pouvez trouver les identifiants de script de segment personnalis\u00E9 dans NetSuite sous :\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Cliquez sur un segment personnalis\u00E9.\n3. Cliquez sur l'onglet *Application and Sourcing* en bas, puis :\n    a. Si vous souhaitez afficher le segment personnalis\u00E9 comme un *tag* (au niveau de l'\u00E9l\u00E9ment de ligne) dans Expensify, cliquez sur le sous-onglet *Transaction Columns* et utilisez l'*ID de champ*.\n    b. Si vous souhaitez afficher le segment personnalis\u00E9 comme un *champ de rapport* (au niveau du rapport) dans Expensify, cliquez sur le sous-onglet *Transactions* et utilisez l'*ID de champ*.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "Quel est l'ID de la colonne de transaction ?",
                            customRecordScriptIDFooter: `Vous pouvez trouver les ID de script d'enregistrement personnalis\u00E9 dans NetSuite sous :\n\n1. Entrez "Transaction Line Fields" dans la recherche globale.\n2. Cliquez sur un enregistrement personnalis\u00E9.\n3. Trouvez l'ID de script sur le c\u00F4t\u00E9 gauche.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Comment ce segment personnalis\u00E9 doit-il \u00EAtre affich\u00E9 dans Expensify ?',
                            customRecordMappingTitle: 'Comment cet enregistrement personnalis\u00E9 doit-il \u00EAtre affich\u00E9 dans Expensify ?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Un segment/enregistrement personnalis\u00E9 avec ce ${fieldName?.toLowerCase()} existe d\u00E9j\u00E0`,
                        },
                    },
                    customLists: {
                        title: 'Listes personnalis\u00E9es',
                        addText: 'Ajouter une liste personnalis\u00E9e',
                        recordTitle: 'Liste personnalis\u00E9e',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Voir les instructions d\u00E9taill\u00E9es',
                        helpText: 'sur la configuration des listes personnalis\u00E9es.',
                        emptyTitle: 'Ajouter une liste personnalis\u00E9e',
                        fields: {
                            listName: 'Nom',
                            internalID: 'ID interne',
                            transactionFieldID: 'ID du champ de transaction',
                            mapping: 'Affich\u00E9 comme',
                        },
                        removeTitle: 'Supprimer la liste personnalis\u00E9e',
                        removePrompt: '\u00CAtes-vous s\u00FBr de vouloir supprimer cette liste personnalis\u00E9e ?',
                        addForm: {
                            listNameTitle: 'Choisissez une liste personnalis\u00E9e',
                            transactionFieldIDTitle: "Quel est l'ID du champ de transaction ?",
                            transactionFieldIDFooter: `Vous pouvez trouver les identifiants de champ de transaction dans NetSuite en suivant ces \u00E9tapes :\n\n1. Entrez "Transaction Line Fields" dans la recherche globale.\n2. Cliquez sur une liste personnalis\u00E9e.\n3. Trouvez l'identifiant de champ de transaction sur le c\u00F4t\u00E9 gauche.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Comment cette liste personnalis\u00E9e doit-elle \u00EAtre affich\u00E9e dans Expensify ?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Une liste personnalis\u00E9e avec cet ID de champ de transaction existe d\u00E9j\u00E0`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Employ\u00E9 par d\u00E9faut de NetSuite',
                        description: "Non import\u00E9 dans Expensify, appliqu\u00E9 \u00E0 l'exportation",
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Si vous utilisez ${importField} dans NetSuite, nous appliquerons le param\u00E8tre par d\u00E9faut sur le dossier de l'employ\u00E9 lors de l'exportation vers le rapport de d\u00E9penses ou l'\u00E9criture de journal.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: "Niveau de ligne d'article",
                        footerContent: ({importField}: ImportFieldParams) =>
                            `${startCase(importField)} sera s\u00E9lectionnable pour chaque d\u00E9pense individuelle sur le rapport d'un employ\u00E9.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Champs de rapport',
                        description: 'Niveau de rapport',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `La s\u00E9lection ${startCase(importField)} s'appliquera \u00E0 toutes les d\u00E9penses sur le rapport d'un employ\u00E9.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configuration de Sage Intacct',
            prerequisitesTitle: 'Avant de vous connecter...',
            downloadExpensifyPackage: 'T\u00E9l\u00E9chargez le package Expensify pour Sage Intacct',
            followSteps: 'Suivez les \u00E9tapes de notre guide Comment faire : Connecter \u00E0 Sage Intacct.',
            enterCredentials: 'Entrez vos identifiants Sage Intacct',
            entity: 'Entit\u00E9',
            employeeDefault: 'Employ\u00E9 par d\u00E9faut de Sage Intacct',
            employeeDefaultDescription: "Le d\u00E9partement par d\u00E9faut de l'employ\u00E9 sera appliqu\u00E9 \u00E0 ses d\u00E9penses dans Sage Intacct si un existe.",
            displayedAsTagDescription: "Le d\u00E9partement sera s\u00E9lectionnable pour chaque d\u00E9pense individuelle sur le rapport d'un employ\u00E9.",
            displayedAsReportFieldDescription: "La s\u00E9lection du d\u00E9partement s'appliquera \u00E0 toutes les d\u00E9penses sur le rapport d'un employ\u00E9.",
            toggleImportTitleFirstPart: 'Choisissez comment g\u00E9rer Sage Intacct',
            toggleImportTitleSecondPart: 'dans Expensify.',
            expenseTypes: 'Types de d\u00E9penses',
            expenseTypesDescription: 'Vos types de d\u00E9penses Sage Intacct seront import\u00E9s dans Expensify en tant que cat\u00E9gories.',
            accountTypesDescription: 'Votre plan comptable Sage Intacct sera import\u00E9 dans Expensify en tant que cat\u00E9gories.',
            importTaxDescription: "Importer le taux de taxe d'achat depuis Sage Intacct.",
            userDefinedDimensions: "Dimensions d\u00E9finies par l'utilisateur",
            addUserDefinedDimension: "Ajouter une dimension d\u00E9finie par l'utilisateur",
            integrationName: "Nom de l'int\u00E9gration",
            dimensionExists: 'Une dimension avec ce nom existe d\u00E9j\u00E0.',
            removeDimension: "Supprimer la dimension d\u00E9finie par l'utilisateur",
            removeDimensionPrompt: "\u00CAtes-vous s\u00FBr de vouloir supprimer cette dimension d\u00E9finie par l'utilisateur ?",
            userDefinedDimension: "Dimension d\u00E9finie par l'utilisateur",
            addAUserDefinedDimension: "Ajouter une dimension d\u00E9finie par l'utilisateur",
            detailedInstructionsLink: 'Voir les instructions d\u00E9taill\u00E9es',
            detailedInstructionsRestOfSentence: "sur l'ajout de dimensions d\u00E9finies par l'utilisateur.",
            userDimensionsAdded: () => ({
                one: '1 UDD ajout\u00E9',
                other: (count: number) => `${count} UDDs ajout\u00E9s`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'd\u00E9partements';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'emplacements';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clients';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projets (emplois)';
                    default:
                        return 'mappings';
                }
            },
        },
        type: {
            free: 'Gratuit',
            control: 'Contr\u00F4le',
            collect: 'Collecter',
        },
        companyCards: {
            addCards: 'Ajouter des cartes',
            selectCards: 'S\u00E9lectionner des cartes',
            addNewCard: {
                other: 'Autre',
                cardProviders: {
                    gl1025: 'Cartes Corporate American Express',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Cartes Stripe',
                },
                yourCardProvider: `Qui est votre fournisseur de carte ?`,
                whoIsYourBankAccount: 'Quelle est votre banque ?',
                whereIsYourBankLocated: 'O\u00F9 se trouve votre banque ?',
                howDoYouWantToConnect: 'Comment souhaitez-vous vous connecter \u00E0 votre banque ?',
                learnMoreAboutOptions: {
                    text: 'En savoir plus sur ces',
                    linkText: 'options.',
                },
                commercialFeedDetails:
                    'N\u00E9cessite une configuration avec votre banque. Ceci est g\u00E9n\u00E9ralement utilis\u00E9 par les grandes entreprises et est souvent la meilleure option si vous \u00EAtes \u00E9ligible.',
                commercialFeedPlaidDetails: `N\u00E9cessite une configuration avec votre banque, mais nous vous guiderons. Cela est g\u00E9n\u00E9ralement limit\u00E9 aux grandes entreprises.`,
                directFeedDetails: "L'approche la plus simple. Connectez-vous imm\u00E9diatement en utilisant vos identifiants principaux. Cette m\u00E9thode est la plus courante.",
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Activez votre flux ${provider}`,
                    heading:
                        "Nous avons une int\u00E9gration directe avec l'\u00E9metteur de votre carte et pouvons importer vos donn\u00E9es de transaction dans Expensify rapidement et avec pr\u00E9cision.\n\nPour commencer, il vous suffit de :",
                    visa: "Nous avons des int\u00E9grations mondiales avec Visa, bien que l'\u00E9ligibilit\u00E9 varie selon la banque et le programme de carte.\n\nPour commencer, il vous suffit de :",
                    mastercard:
                        "Nous avons des int\u00E9grations mondiales avec Mastercard, bien que l'\u00E9ligibilit\u00E9 varie selon la banque et le programme de carte.\n\nPour commencer, il vous suffit de :",
                    vcf: `1. Consultez [cet article d'aide](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) pour obtenir des instructions d\u00E9taill\u00E9es sur la configuration de vos cartes commerciales Visa.\n\n2. [Contactez votre banque](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) pour v\u00E9rifier qu'elle prend en charge un flux commercial pour votre programme et demandez-lui de l'activer.\n\n3. *Une fois le flux activ\u00E9 et ses d\u00E9tails obtenus, passez \u00E0 l'\u00E9cran suivant.*`,
                    gl1025: `1. Visitez [cet article d'aide](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) pour savoir si American Express peut activer un flux commercial pour votre programme.\n\n2. Une fois le flux activ\u00E9, Amex vous enverra une lettre de production.\n\n3. *Une fois que vous avez les informations sur le flux, passez \u00E0 l'\u00E9cran suivant.*`,
                    cdf: `1. Consultez [cet article d'aide](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) pour des instructions d\u00E9taill\u00E9es sur la configuration de vos cartes Mastercard Commerciales.\n\n2. [Contactez votre banque](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) pour v\u00E9rifier qu'elle prend en charge un flux commercial pour votre programme, et demandez-lui de l'activer.\n\n3. *Une fois le flux activ\u00E9 et ses d\u00E9tails obtenus, passez \u00E0 l'\u00E9cran suivant.*`,
                    stripe: `1. Visitez le tableau de bord de Stripe et allez dans [Param\u00E8tres](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Sous Int\u00E9grations de produits, cliquez sur Activer \u00E0 c\u00F4t\u00E9 de Expensify.\n\n3. Une fois le flux activ\u00E9, cliquez sur Soumettre ci-dessous et nous travaillerons \u00E0 l'ajouter.`,
                },
                whatBankIssuesCard: 'Quelle banque \u00E9met ces cartes ?',
                enterNameOfBank: 'Entrez le nom de la banque',
                feedDetails: {
                    vcf: {
                        title: 'Quels sont les d\u00E9tails du flux Visa ?',
                        processorLabel: 'ID du processeur',
                        bankLabel: "ID de l'institution financi\u00E8re (banque)",
                        companyLabel: "ID de l'entreprise",
                        helpLabel: 'O\u00F9 puis-je trouver ces identifiants ?',
                    },
                    gl1025: {
                        title: `Quel est le nom du fichier de livraison Amex ?`,
                        fileNameLabel: 'Nom du fichier de livraison',
                        helpLabel: 'O\u00F9 puis-je trouver le nom du fichier de livraison ?',
                    },
                    cdf: {
                        title: `Quel est l'ID de distribution Mastercard ?`,
                        distributionLabel: 'ID de distribution',
                        helpLabel: "O\u00F9 puis-je trouver l'ID de distribution ?",
                    },
                },
                amexCorporate: 'S\u00E9lectionnez ceci si le recto de vos cartes indique \u00AB Corporate \u00BB',
                amexBusiness: 'S\u00E9lectionnez ceci si le recto de vos cartes indique \u00AB Business \u00BB',
                amexPersonal: 'S\u00E9lectionnez ceci si vos cartes sont personnelles',
                error: {
                    pleaseSelectProvider: 'Veuillez s\u00E9lectionner un fournisseur de carte avant de continuer',
                    pleaseSelectBankAccount: 'Veuillez s\u00E9lectionner un compte bancaire avant de continuer',
                    pleaseSelectBank: 'Veuillez s\u00E9lectionner une banque avant de continuer',
                    pleaseSelectCountry: 'Veuillez s\u00E9lectionner un pays avant de continuer',
                    pleaseSelectFeedType: 'Veuillez s\u00E9lectionner un type de flux avant de continuer',
                },
            },
            assignCard: 'Attribuer la carte',
            findCard: 'Trouver la carte',
            cardNumber: 'Num\u00E9ro de carte',
            commercialFeed: 'Flux commercial',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `Cartes ${feedName}`,
            directFeed: 'Flux direct',
            whoNeedsCardAssigned: "Qui a besoin d'une carte attribu\u00E9e ?",
            chooseCard: 'Choisissez une carte',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Choisissez une carte pour ${assignee} \u00E0 partir du flux de cartes ${feed}.`,
            noActiveCards: 'Aucune carte active sur ce flux',
            somethingMightBeBroken: "Ou quelque chose pourrait \u00EAtre cass\u00E9. Quoi qu'il en soit, si vous avez des questions, il suffit de",
            contactConcierge: 'contacter Concierge',
            chooseTransactionStartDate: 'Choisissez une date de d\u00E9but de transaction',
            startDateDescription:
                "Nous importerons toutes les transactions \u00E0 partir de cette date. Si aucune date n'est sp\u00E9cifi\u00E9e, nous remonterons aussi loin que votre banque le permet.",
            fromTheBeginning: 'Depuis le d\u00E9but',
            customStartDate: 'Date de d\u00E9but personnalis\u00E9',
            letsDoubleCheck: 'V\u00E9rifions que tout est correct.',
            confirmationDescription: 'Nous commencerons \u00E0 importer les transactions imm\u00E9diatement.',
            cardholder: 'Titulaire de carte',
            card: 'Carte',
            cardName: 'Nom de la carte',
            brokenConnectionErrorFirstPart: `La connexion du flux de carte est interrompue. Veuillez`,
            brokenConnectionErrorLink: 'connectez-vous \u00E0 votre banque',
            brokenConnectionErrorSecondPart: 'afin que nous puissions r\u00E9tablir la connexion.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `a attribu\u00E9 ${assignee} un ${link} ! Les transactions import\u00E9es appara\u00EEtront dans ce chat.`,
            companyCard: "carte d'entreprise",
            chooseCardFeed: 'Choisir le flux de cartes',
            ukRegulation:
                "Expensify Limited est un agent de Plaid Financial Ltd., une institution de paiement autoris\u00E9e r\u00E9glement\u00E9e par la Financial Conduct Authority en vertu des Payment Services Regulations 2017 (Num\u00E9ro de r\u00E9f\u00E9rence de l'entreprise : 804718). Plaid vous fournit des services d'information de compte r\u00E9glement\u00E9s par l'interm\u00E9diaire d'Expensify Limited en tant qu'agent.",
        },
        expensifyCard: {
            issueAndManageCards: '\u00C9mettre et g\u00E9rer vos cartes Expensify',
            getStartedIssuing: 'Commencez en \u00E9mettant votre premi\u00E8re carte virtuelle ou physique.',
            verificationInProgress: 'V\u00E9rification en cours...',
            verifyingTheDetails: 'Nous v\u00E9rifions quelques d\u00E9tails. Concierge vous informera lorsque les cartes Expensify seront pr\u00EAtes \u00E0 \u00EAtre \u00E9mises.',
            disclaimer:
                "La carte commerciale Expensify Visa\u00AE est \u00E9mise par The Bancorp Bank, N.A., membre FDIC, en vertu d'une licence de Visa U.S.A. Inc. et ne peut pas \u00EAtre utilis\u00E9e chez tous les commer\u00E7ants qui acceptent les cartes Visa. Apple\u00AE et le logo Apple\u00AE sont des marques d\u00E9pos\u00E9es d'Apple Inc., enregistr\u00E9es aux \u00C9tats-Unis et dans d'autres pays. App Store est une marque de service d'Apple Inc. Google Play et le logo Google Play sont des marques de Google LLC.",
            issueCard: '\u00C9mettre une carte',
            findCard: 'Trouver la carte',
            newCard: 'Nouvelle carte',
            name: 'Nom',
            lastFour: 'Derniers 4',
            limit: 'Limite',
            currentBalance: 'Solde actuel',
            currentBalanceDescription: 'Le solde actuel est la somme de toutes les transactions de carte Expensify enregistr\u00E9es depuis la derni\u00E8re date de r\u00E8glement.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Le solde sera r\u00E9gl\u00E9 le ${settlementDate}`,
            settleBalance: 'R\u00E9gler le solde',
            cardLimit: 'Limite de carte',
            remainingLimit: 'Limite restante',
            requestLimitIncrease: "Demande d'augmentation de la limite",
            remainingLimitDescription:
                "Nous prenons en compte plusieurs facteurs pour calculer votre limite restante : votre anciennet\u00E9 en tant que client, les informations li\u00E9es \u00E0 votre entreprise fournies lors de l'inscription, et la tr\u00E9sorerie disponible sur le compte bancaire de votre entreprise. Votre limite restante peut fluctuer quotidiennement.",
            earnedCashback: 'Cash back',
            earnedCashbackDescription: 'Le solde de cashback est bas\u00E9 sur les d\u00E9penses mensuelles r\u00E9gl\u00E9es avec la carte Expensify dans votre espace de travail.',
            issueNewCard: '\u00C9mettre une nouvelle carte',
            finishSetup: 'Terminer la configuration',
            chooseBankAccount: 'Choisir un compte bancaire',
            chooseExistingBank: 'Choisissez un compte bancaire professionnel existant pour payer le solde de votre carte Expensify, ou ajoutez un nouveau compte bancaire.',
            accountEndingIn: 'Compte se terminant par',
            addNewBankAccount: 'Ajouter un nouveau compte bancaire',
            settlementAccount: 'Compte de r\u00E8glement',
            settlementAccountDescription: 'Choisissez un compte pour payer le solde de votre carte Expensify.',
            settlementAccountInfoPt1: 'Assurez-vous que ce compte correspond au v\u00F4tre',
            settlementAccountInfoPt2: 'ainsi la R\u00E9conciliation Continue fonctionne correctement.',
            reconciliationAccount: 'Compte de rapprochement',
            settlementFrequency: 'Fr\u00E9quence de r\u00E8glement',
            settlementFrequencyDescription: 'Choisissez la fr\u00E9quence \u00E0 laquelle vous paierez le solde de votre carte Expensify.',
            settlementFrequencyInfo:
                'Si vous souhaitez passer \u00E0 un r\u00E8glement mensuel, vous devrez connecter votre compte bancaire via Plaid et avoir un historique de solde positif sur 90 jours.',
            frequency: {
                daily: 'Quotidiennement',
                monthly: 'Mensuel',
            },
            cardDetails: 'D\u00E9tails de la carte',
            virtual: 'Virtuel',
            physical: 'Physique',
            deactivate: 'D\u00E9sactiver la carte',
            changeCardLimit: 'Modifier la limite de la carte',
            changeLimit: 'Modifier la limite',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Si vous changez la limite de cette carte \u00E0 ${limit}, les nouvelles transactions seront refus\u00E9es jusqu'\u00E0 ce que vous approuviez plus de d\u00E9penses sur la carte.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) =>
                `Si vous changez la limite de cette carte \u00E0 ${limit}, les nouvelles transactions seront refus\u00E9es jusqu'au mois prochain.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Si vous changez la limite de cette carte \u00E0 ${limit}, les nouvelles transactions seront refus\u00E9es.`,
            changeCardLimitType: 'Modifier le type de limite de carte',
            changeLimitType: 'Modifier le type de limite',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Si vous changez le type de limite de cette carte en Limite Intelligente, les nouvelles transactions seront refus\u00E9es car la limite non approuv\u00E9e de ${limit} a d\u00E9j\u00E0 \u00E9t\u00E9 atteinte.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Si vous changez le type de limite de cette carte en Mensuel, les nouvelles transactions seront refus\u00E9es car la limite mensuelle de ${limit} a d\u00E9j\u00E0 \u00E9t\u00E9 atteinte.`,
            addShippingDetails: "Ajouter les d\u00E9tails d'exp\u00E9dition",
            issuedCard: ({assignee}: AssigneeParams) => `a \u00E9mis une carte Expensify \u00E0 ${assignee} ! La carte arrivera dans 2-3 jours ouvrables.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `a \u00E9mis une carte Expensify \u00E0 ${assignee} ! La carte sera exp\u00E9di\u00E9e une fois que les d\u00E9tails d'exp\u00E9dition seront ajout\u00E9s.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) =>
                `a \u00E9mis \u00E0 ${assignee} une ${link} virtuelle ! La carte peut \u00EAtre utilis\u00E9e imm\u00E9diatement.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} a ajout\u00E9 les d\u00E9tails d'exp\u00E9dition. La carte Expensify arrivera dans 2-3 jours ouvrables.`,
            verifyingHeader: 'V\u00E9rification',
            bankAccountVerifiedHeader: 'Compte bancaire v\u00E9rifi\u00E9',
            verifyingBankAccount: 'V\u00E9rification du compte bancaire...',
            verifyingBankAccountDescription: 'Veuillez patienter pendant que nous confirmons que ce compte peut \u00EAtre utilis\u00E9 pour \u00E9mettre des cartes Expensify.',
            bankAccountVerified: 'Compte bancaire v\u00E9rifi\u00E9 !',
            bankAccountVerifiedDescription: "Vous pouvez maintenant \u00E9mettre des cartes Expensify \u00E0 vos membres de l'espace de travail.",
            oneMoreStep: 'Encore une \u00E9tape...',
            oneMoreStepDescription:
                'Il semble que nous devions v\u00E9rifier manuellement votre compte bancaire. Veuillez vous rendre sur Concierge o\u00F9 vos instructions vous attendent.',
            gotIt: 'Compris',
            goToConcierge: 'Aller \u00E0 Concierge',
        },
        categories: {
            deleteCategories: 'Supprimer les cat\u00E9gories',
            deleteCategoriesPrompt: '\u00CAtes-vous s\u00FBr de vouloir supprimer ces cat\u00E9gories ?',
            deleteCategory: 'Supprimer la cat\u00E9gorie',
            deleteCategoryPrompt: '\u00CAtes-vous s\u00FBr de vouloir supprimer cette cat\u00E9gorie ?',
            disableCategories: 'D\u00E9sactiver les cat\u00E9gories',
            disableCategory: 'D\u00E9sactiver la cat\u00E9gorie',
            enableCategories: 'Activer les cat\u00E9gories',
            enableCategory: 'Activer la cat\u00E9gorie',
            defaultSpendCategories: 'Cat\u00E9gories de d\u00E9penses par d\u00E9faut',
            spendCategoriesDescription:
                'Personnalisez la cat\u00E9gorisation des d\u00E9penses des commer\u00E7ants pour les transactions par carte de cr\u00E9dit et les re\u00E7us scann\u00E9s.',
            deleteFailureMessage: "Une erreur s'est produite lors de la suppression de la cat\u00E9gorie, veuillez r\u00E9essayer.",
            categoryName: 'Nom de cat\u00E9gorie',
            requiresCategory: 'Les membres doivent cat\u00E9goriser toutes les d\u00E9penses',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Toutes les d\u00E9penses doivent \u00EAtre cat\u00E9goris\u00E9es afin d'exporter vers ${connectionName}.`,
            subtitle: "Obtenez une meilleure vue d'ensemble de l'endroit o\u00F9 l'argent est d\u00E9pens\u00E9. Utilisez nos cat\u00E9gories par d\u00E9faut ou ajoutez les v\u00F4tres.",
            emptyCategories: {
                title: "Vous n'avez cr\u00E9\u00E9 aucune cat\u00E9gorie",
                subtitle: 'Ajoutez une cat\u00E9gorie pour organiser vos d\u00E9penses.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: "Vos cat\u00E9gories sont actuellement import\u00E9es \u00E0 partir d'une connexion comptable. Rendez-vous sur",
                subtitle2: 'comptabilit\u00E9',
                subtitle3: 'pour apporter des modifications.',
            },
            updateFailureMessage: "Une erreur s'est produite lors de la mise \u00E0 jour de la cat\u00E9gorie, veuillez r\u00E9essayer.",
            createFailureMessage: "Une erreur s'est produite lors de la cr\u00E9ation de la cat\u00E9gorie, veuillez r\u00E9essayer.",
            addCategory: 'Ajouter une cat\u00E9gorie',
            editCategory: 'Modifier la cat\u00E9gorie',
            editCategories: 'Modifier les cat\u00E9gories',
            findCategory: 'Trouver la cat\u00E9gorie',
            categoryRequiredError: 'Le nom de la cat\u00E9gorie est requis',
            existingCategoryError: 'Une cat\u00E9gorie avec ce nom existe d\u00E9j\u00E0',
            invalidCategoryName: 'Nom de cat\u00E9gorie invalide',
            importedFromAccountingSoftware: 'Les cat\u00E9gories ci-dessous sont import\u00E9es de votre',
            payrollCode: 'Code de paie',
            updatePayrollCodeFailureMessage: "Une erreur s'est produite lors de la mise \u00E0 jour du code de paie, veuillez r\u00E9essayer.",
            glCode: 'code GL',
            updateGLCodeFailureMessage: "Une erreur s'est produite lors de la mise \u00E0 jour du code GL, veuillez r\u00E9essayer.",
            importCategories: 'Importer des cat\u00E9gories',
            cannotDeleteOrDisableAllCategories: {
                title: 'Impossible de supprimer ou d\u00E9sactiver toutes les cat\u00E9gories',
                description: `Au moins une cat\u00E9gorie doit rester activ\u00E9e car votre espace de travail n\u00E9cessite des cat\u00E9gories.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Utilisez les commutateurs ci-dessous pour activer plus de fonctionnalit\u00E9s \u00E0 mesure que vous vous d\u00E9veloppez. Chaque fonctionnalit\u00E9 appara\u00EEtra dans le menu de navigation pour une personnalisation suppl\u00E9mentaire.',
            spendSection: {
                title: 'D\u00E9penser',
                subtitle: 'Activez la fonctionnalit\u00E9 qui vous aide \u00E0 d\u00E9velopper votre \u00E9quipe.',
            },
            manageSection: {
                title: 'G\u00E9rer',
                subtitle: 'Ajoutez des contr\u00F4les qui aident \u00E0 maintenir les d\u00E9penses dans le budget.',
            },
            earnSection: {
                title: 'Gagner',
                subtitle: 'Rationalisez vos revenus et soyez pay\u00E9 plus rapidement.',
            },
            organizeSection: {
                title: 'Organiser',
                subtitle: 'Regroupez et analysez les d\u00E9penses, enregistrez chaque taxe pay\u00E9e.',
            },
            integrateSection: {
                title: 'Int\u00E9grer',
                subtitle: 'Connectez Expensify aux produits financiers populaires.',
            },
            distanceRates: {
                title: 'Taux de distance',
                subtitle: 'Ajouter, mettre \u00E0 jour et appliquer les tarifs.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'D\u00E9finissez des taux de per diem pour contr\u00F4ler les d\u00E9penses quotidiennes des employ\u00E9s.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Obtenez des informations et contr\u00F4lez les d\u00E9penses.',
                disableCardTitle: 'D\u00E9sactiver la carte Expensify',
                disableCardPrompt:
                    'Vous ne pouvez pas d\u00E9sactiver la carte Expensify car elle est d\u00E9j\u00E0 utilis\u00E9e. Contactez Concierge pour conna\u00EEtre les prochaines \u00E9tapes.',
                disableCardButton: 'Discuter avec Concierge',
                feed: {
                    title: 'Obtenez la carte Expensify',
                    subTitle: "Rationalisez vos d\u00E9penses professionnelles et \u00E9conomisez jusqu'\u00E0 50 % sur votre facture Expensify, plus :",
                    features: {
                        cashBack: 'Cashback sur chaque achat aux \u00C9tats-Unis',
                        unlimited: 'Cartes virtuelles illimit\u00E9es',
                        spend: 'Contr\u00F4les de d\u00E9penses et limites personnalis\u00E9es',
                    },
                    ctaTitle: '\u00C9mettre une nouvelle carte',
                },
            },
            companyCards: {
                title: "Cartes d'entreprise",
                subtitle: "Importer les d\u00E9penses \u00E0 partir des cartes d'entreprise existantes.",
                feed: {
                    title: "Importer des cartes d'entreprise",
                    features: {
                        support: 'Prise en charge de tous les principaux fournisseurs de cartes',
                        assignCards: "Attribuer des cartes \u00E0 toute l'\u00E9quipe",
                        automaticImport: 'Importation automatique des transactions',
                    },
                },
                disableCardTitle: "D\u00E9sactiver les cartes d'entreprise",
                disableCardPrompt:
                    "Vous ne pouvez pas d\u00E9sactiver les cartes d'entreprise car cette fonctionnalit\u00E9 est en cours d'utilisation. Contactez le Concierge pour conna\u00EEtre les prochaines \u00E9tapes.",
                disableCardButton: 'Discuter avec Concierge',
                cardDetails: 'D\u00E9tails de la carte',
                cardNumber: 'Num\u00E9ro de carte',
                cardholder: 'Titulaire de carte',
                cardName: 'Nom de la carte',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `${integration} ${type.toLowerCase()} exportation` : `exportation ${integration}`,
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) =>
                    `Choisissez le compte ${integration} vers lequel les transactions doivent \u00EAtre export\u00E9es.`,
                integrationExportTitlePart: 'S\u00E9lectionner un autre',
                integrationExportTitleLinkPart: "option d'exportation",
                integrationExportTitleSecondPart: 'pour changer les comptes disponibles.',
                lastUpdated: 'Derni\u00E8re mise \u00E0 jour',
                transactionStartDate: 'Date de d\u00E9but de la transaction',
                updateCard: 'Mettre \u00E0 jour la carte',
                unassignCard: 'D\u00E9sattribuer la carte',
                unassign: 'D\u00E9sattribuer',
                unassignCardDescription: 'D\u00E9saffecter cette carte supprimera toutes les transactions sur les rapports en brouillon du compte du titulaire de la carte.',
                assignCard: 'Attribuer la carte',
                cardFeedName: 'Nom du flux de cartes',
                cardFeedNameDescription: 'Donnez un nom unique au flux de cartes pour pouvoir le distinguer des autres.',
                cardFeedTransaction: 'Supprimer les transactions',
                cardFeedTransactionDescription:
                    'Choisissez si les d\u00E9tenteurs de carte peuvent supprimer les transactions par carte. Les nouvelles transactions suivront ces r\u00E8gles.',
                cardFeedRestrictDeletingTransaction: 'Restreindre la suppression des transactions',
                cardFeedAllowDeletingTransaction: 'Autoriser la suppression des transactions',
                removeCardFeed: 'Supprimer le flux de cartes',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Supprimer le flux ${feedName}`,
                removeCardFeedDescription: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce flux de cartes ? Cela d\u00E9sassignera toutes les cartes.',
                error: {
                    feedNameRequired: 'Le nom du flux de carte est requis',
                },
                corporate: 'Restreindre la suppression des transactions',
                personal: 'Autoriser la suppression des transactions',
                setFeedNameDescription: 'Donnez au flux de cartes un nom unique afin de pouvoir le distinguer des autres.',
                setTransactionLiabilityDescription:
                    "Lorsqu'elle est activ\u00E9e, les d\u00E9tenteurs de carte peuvent supprimer les transactions par carte. Les nouvelles transactions suivront cette r\u00E8gle.",
                emptyAddedFeedTitle: "Attribuer des cartes d'entreprise",
                emptyAddedFeedDescription: 'Commencez par attribuer votre premi\u00E8re carte \u00E0 un membre.',
                pendingFeedTitle: `Nous examinons votre demande...`,
                pendingFeedDescription: `Nous examinons actuellement les d\u00E9tails de votre flux. Une fois cela termin\u00E9, nous vous contacterons via`,
                pendingBankTitle: 'V\u00E9rifiez votre fen\u00EAtre de navigateur',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Veuillez vous connecter \u00E0 ${bankName} via la fen\u00EAtre de votre navigateur qui vient de s'ouvrir. Si aucune ne s'est ouverte,`,
                pendingBankLink: 'veuillez cliquer ici.',
                giveItNameInstruction: 'Donnez \u00E0 la carte un nom qui la distingue des autres.',
                updating: 'Mise \u00E0 jour...',
                noAccountsFound: 'Aucun compte trouv\u00E9',
                defaultCard: 'Carte par d\u00E9faut',
                downgradeTitle: `Impossible de r\u00E9trograder l'espace de travail`,
                downgradeSubTitleFirstPart: `Cet espace de travail ne peut pas \u00EAtre r\u00E9trograd\u00E9 car plusieurs flux de cartes sont connect\u00E9s (\u00E0 l'exception des cartes Expensify). S'il vous pla\u00EEt`,
                downgradeSubTitleMiddlePart: `conserver uniquement un flux de cartes`,
                downgradeSubTitleLastPart: 'pour continuer.',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Veuillez ajouter le compte dans ${connection} et synchroniser \u00E0 nouveau la connexion.`,
                expensifyCardBannerTitle: 'Obtenez la carte Expensify',
                expensifyCardBannerSubtitle:
                    "Profitez de remises en argent sur chaque achat aux \u00C9tats-Unis, jusqu'\u00E0 50 % de r\u00E9duction sur votre facture Expensify, des cartes virtuelles illimit\u00E9es, et bien plus encore.",
                expensifyCardBannerLearnMoreButton: 'En savoir plus',
            },
            workflows: {
                title: 'Flux de travail',
                subtitle: 'Configurez comment les d\u00E9penses sont approuv\u00E9es et pay\u00E9es.',
                disableApprovalPrompt:
                    "Les cartes Expensify de cet espace de travail d\u00E9pendent actuellement de l'approbation pour d\u00E9finir leurs limites intelligentes. Veuillez modifier les types de limites de toutes les cartes Expensify avec des limites intelligentes avant de d\u00E9sactiver les approbations.",
            },
            invoices: {
                title: 'Factures',
                subtitle: 'Envoyez et recevez des factures.',
            },
            categories: {
                title: 'Cat\u00E9gories',
                subtitle: 'Suivre et organiser les d\u00E9penses.',
            },
            tags: {
                title: 'Tags',
                subtitle: 'Classifiez les co\u00FBts et suivez les d\u00E9penses facturables.',
            },
            taxes: {
                title: 'Taxes',
                subtitle: 'Documentez et r\u00E9cup\u00E9rez les taxes \u00E9ligibles.',
            },
            reportFields: {
                title: 'Champs de rapport',
                subtitle: 'Configurer des champs personnalis\u00E9s pour les d\u00E9penses.',
            },
            connections: {
                title: 'Comptabilit\u00E9',
                subtitle: 'Synchronisez votre plan comptable et plus encore.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Pas si vite...',
                featureEnabledText: "Pour activer ou d\u00E9sactiver cette fonctionnalit\u00E9, vous devrez modifier vos param\u00E8tres d'importation comptable.",
                disconnectText: 'Pour d\u00E9sactiver la comptabilit\u00E9, vous devrez d\u00E9connecter votre connexion comptable de votre espace de travail.',
                manageSettings: 'G\u00E9rer les param\u00E8tres',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Pas si vite...',
                featureEnabledText:
                    "Les cartes Expensify dans cet espace de travail d\u00E9pendent des flux d'approbation pour d\u00E9finir leurs limites intelligentes.\n\nVeuillez changer les types de limites de toutes les cartes avec des limites intelligentes avant de d\u00E9sactiver les flux de travail.",
                confirmText: 'Aller aux cartes Expensify',
            },
            rules: {
                title: 'R\u00E8gles',
                subtitle: 'Exiger des re\u00E7us, signaler les d\u00E9penses \u00E9lev\u00E9es, et plus encore.',
            },
        },
        reportFields: {
            addField: 'Ajouter un champ',
            delete: 'Supprimer le champ',
            deleteFields: 'Supprimer les champs',
            findReportField: 'Trouver le champ du rapport',
            deleteConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce champ de rapport ?',
            deleteFieldsConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer ces champs de rapport ?',
            emptyReportFields: {
                title: "Vous n'avez cr\u00E9\u00E9 aucun champ de rapport",
                subtitle: 'Ajoutez un champ personnalis\u00E9 (texte, date ou liste d\u00E9roulante) qui appara\u00EEt sur les rapports.',
            },
            subtitle: "Les champs de rapport s'appliquent \u00E0 toutes les d\u00E9penses et peuvent \u00EAtre utiles lorsque vous souhaitez demander des informations suppl\u00E9mentaires.",
            disableReportFields: 'D\u00E9sactiver les champs de rapport',
            disableReportFieldsConfirmation: '\u00CAtes-vous s\u00FBr ? Les champs de texte et de date seront supprim\u00E9s, et les listes seront d\u00E9sactiv\u00E9es.',
            importedFromAccountingSoftware: 'Les champs de rapport ci-dessous sont import\u00E9s de votre',
            textType: 'Texte',
            dateType: 'Date',
            dropdownType: 'Liste',
            textAlternateText: 'Ajoutez un champ pour la saisie de texte libre.',
            dateAlternateText: 'Ajouter un calendrier pour la s\u00E9lection de la date.',
            dropdownAlternateText: "Ajoutez une liste d'options \u00E0 choisir.",
            nameInputSubtitle: 'Choisissez un nom pour le champ du rapport.',
            typeInputSubtitle: 'Choisissez le type de champ de rapport \u00E0 utiliser.',
            initialValueInputSubtitle: 'Entrez une valeur de d\u00E9part \u00E0 afficher dans le champ du rapport.',
            listValuesInputSubtitle:
                'Ces valeurs appara\u00EEtront dans le menu d\u00E9roulant du champ de votre rapport. Les valeurs activ\u00E9es peuvent \u00EAtre s\u00E9lectionn\u00E9es par les membres.',
            listInputSubtitle:
                'Ces valeurs appara\u00EEtront dans la liste des champs de votre rapport. Les valeurs activ\u00E9es peuvent \u00EAtre s\u00E9lectionn\u00E9es par les membres.',
            deleteValue: 'Supprimer la valeur',
            deleteValues: 'Supprimer les valeurs',
            disableValue: 'D\u00E9sactiver la valeur',
            disableValues: 'D\u00E9sactiver les valeurs',
            enableValue: 'Activer la valeur',
            enableValues: 'Activer les valeurs',
            emptyReportFieldsValues: {
                title: "Vous n'avez cr\u00E9\u00E9 aucune valeur de liste",
                subtitle: 'Ajoutez des valeurs personnalis\u00E9es pour appara\u00EEtre sur les rapports.',
            },
            deleteValuePrompt: '\u00CAtes-vous s\u00FBr de vouloir supprimer cette valeur de la liste ?',
            deleteValuesPrompt: '\u00CAtes-vous s\u00FBr de vouloir supprimer ces valeurs de la liste ?',
            listValueRequiredError: 'Veuillez entrer un nom de valeur de liste',
            existingListValueError: 'Une valeur de liste avec ce nom existe d\u00E9j\u00E0',
            editValue: 'Modifier la valeur',
            listValues: 'Lister les valeurs',
            addValue: 'Ajouter de la valeur',
            existingReportFieldNameError: 'Un champ de rapport avec ce nom existe d\u00E9j\u00E0',
            reportFieldNameRequiredError: 'Veuillez entrer un nom de champ de rapport',
            reportFieldTypeRequiredError: 'Veuillez choisir un type de champ de rapport',
            reportFieldInitialValueRequiredError: 'Veuillez choisir une valeur initiale pour le champ du rapport',
            genericFailureMessage: "Une erreur s'est produite lors de la mise \u00E0 jour du champ du rapport. Veuillez r\u00E9essayer.",
        },
        tags: {
            tagName: 'Nom de la balise',
            requiresTag: 'Les membres doivent taguer toutes les d\u00E9penses',
            trackBillable: 'Suivre les d\u00E9penses facturables',
            customTagName: 'Nom de balise personnalis\u00E9',
            enableTag: 'Activer le tag',
            enableTags: 'Activer les tags',
            requireTag: 'Requis le tag',
            requireTags: 'Requis les tags',
            notRequireTags: 'Non requis les tags',
            disableTag: 'D\u00E9sactiver le tag',
            disableTags: 'D\u00E9sactiver les balises',
            addTag: 'Ajouter un tag',
            editTag: 'Modifier le tag',
            editTags: 'Modifier les \u00E9tiquettes',
            findTag: 'Trouver la balise',
            subtitle: 'Les \u00E9tiquettes ajoutent des moyens plus d\u00E9taill\u00E9s pour classer les co\u00FBts.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: ' Vous utilisez ',
                phrase2: 'des tags dépendants',
                phrase3: '. Vous pouvez ',
                phrase4: 'réimporter une feuille de calcul',
                phrase5: ' pour mettre à jour vos tags.',
            },
            emptyTags: {
                title: "Vous n'avez cr\u00E9\u00E9 aucun tag",
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Ajoutez une \u00E9tiquette pour suivre les projets, les emplacements, les d\u00E9partements, et plus encore.',
                subtitle1: 'Importez une feuille de calcul pour ajouter des \u00E9tiquettes pour suivre les projets, les emplacements, les d\u00E9partements, et plus encore.',
                subtitle2: 'En savoir plus',
                subtitle3: 'concernant le formatage des fichiers de balises.',
            },
            emptyTagsWithAccounting: {
                subtitle1: "Vos \u00E9tiquettes sont actuellement import\u00E9es \u00E0 partir d'une connexion comptable. Rendez-vous sur",
                subtitle2: 'comptabilit\u00E9',
                subtitle3: 'pour apporter des modifications.',
            },
            deleteTag: 'Supprimer le tag',
            deleteTags: 'Supprimer les balises',
            deleteTagConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer cette \u00E9tiquette ?',
            deleteTagsConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer ces \u00E9tiquettes ?',
            deleteFailureMessage: "Une erreur s'est produite lors de la suppression du tag, veuillez r\u00E9essayer.",
            tagRequiredError: "Le nom de l'\u00E9tiquette est requis",
            existingTagError: 'Un tag avec ce nom existe d\u00E9j\u00E0',
            invalidTagNameError: "Le nom de l'\u00E9tiquette ne peut pas \u00EAtre 0. Veuillez choisir une autre valeur.",
            genericFailureMessage: "Une erreur s'est produite lors de la mise \u00E0 jour du tag, veuillez r\u00E9essayer.",
            importedFromAccountingSoftware: 'Les balises ci-dessous sont import\u00E9es de votre',
            glCode: 'code GL',
            updateGLCodeFailureMessage: "Une erreur s'est produite lors de la mise \u00E0 jour du code GL, veuillez r\u00E9essayer.",
            tagRules: 'R\u00E8gles de balise',
            approverDescription: 'Approbateur',
            importTags: 'Importer des \u00E9tiquettes',
            importTagsSupportingText: 'Codez vos d\u00E9penses avec un type de tag ou plusieurs.',
            configureMultiLevelTags: 'Configurez votre liste de tags pour un \u00E9tiquetage multi-niveaux.',
            importMultiLevelTagsSupportingText: `Voici un aper\u00E7u de vos \u00E9tiquettes. Si tout semble correct, cliquez ci-dessous pour les importer.`,
            importMultiLevelTags: {
                firstRowTitle: 'La premi\u00E8re ligne est le titre de chaque liste de balises',
                independentTags: 'Ce sont des balises ind\u00E9pendantes',
                glAdjacentColumn: 'Il y a un code GL dans la colonne adjacente',
            },
            tagLevel: {
                singleLevel: 'Niveau unique de balises',
                multiLevel: 'Balises multi-niveaux',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Changer les niveaux de balise',
                prompt1: 'Changer les niveaux de balises effacera toutes les balises actuelles.',
                prompt2: "Nous vous sugg\u00E9rons d'abord",
                prompt3: 't\u00E9l\u00E9charger une sauvegarde',
                prompt4: 'en exportant vos tags.',
                prompt5: 'En savoir plus',
                prompt6: '\u00E0 propos des niveaux de balises.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Nous avons trouv\u00E9 *${columnCounts} colonnes* dans votre feuille de calcul. S\u00E9lectionnez *Nom* \u00E0 c\u00F4t\u00E9 de la colonne contenant les noms des tags. Vous pouvez \u00E9galement s\u00E9lectionner *Activ\u00E9* \u00E0 c\u00F4t\u00E9 de la colonne qui d\u00E9finit le statut des tags.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Impossible de supprimer ou d\u00E9sactiver tous les tags',
                description: `Au moins une \u00E9tiquette doit rester activ\u00E9e car votre espace de travail n\u00E9cessite des \u00E9tiquettes.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Impossible de rendre tous les tags optionnels',
                description: `Au moins une \u00E9tiquette doit rester obligatoire car les param\u00E8tres de votre espace de travail exigent des \u00E9tiquettes.`,
            },
            tagCount: () => ({
                one: '1 \u00C9tiquette',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Ajouter des noms de taxes, des taux et d\u00E9finir les valeurs par d\u00E9faut.',
            addRate: 'Ajouter un tarif',
            workspaceDefault: "Devise par d\u00E9faut de l'espace de travail",
            foreignDefault: 'Devise \u00E9trang\u00E8re par d\u00E9faut',
            customTaxName: 'Nom de taxe personnalis\u00E9',
            value: 'Valeur',
            taxReclaimableOn: 'Taxe r\u00E9cup\u00E9rable sur',
            taxRate: "Taux d'imposition",
            findTaxRate: "Trouver le taux d'imposition",
            error: {
                taxRateAlreadyExists: 'Ce nom de taxe est d\u00E9j\u00E0 utilis\u00E9',
                taxCodeAlreadyExists: 'Ce code fiscal est d\u00E9j\u00E0 utilis\u00E9',
                valuePercentageRange: 'Veuillez entrer un pourcentage valide entre 0 et 100',
                customNameRequired: 'Le nom de la taxe personnalis\u00E9e est requis',
                deleteFailureMessage: "Une erreur s'est produite lors de la suppression du taux de taxe. Veuillez r\u00E9essayer ou demander de l'aide \u00E0 Concierge.",
                updateFailureMessage: "Une erreur s'est produite lors de la mise \u00E0 jour du taux de taxe. Veuillez r\u00E9essayer ou demander de l'aide \u00E0 Concierge.",
                createFailureMessage: "Une erreur s'est produite lors de la cr\u00E9ation du taux de taxe. Veuillez r\u00E9essayer ou demander de l'aide \u00E0 Concierge.",
                updateTaxClaimableFailureMessage: 'La portion r\u00E9cup\u00E9rable doit \u00EAtre inf\u00E9rieure au montant du taux de distance.',
            },
            deleteTaxConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer cette taxe ?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `\u00CAtes-vous s\u00FBr de vouloir supprimer les taxes de ${taxAmount} ?`,
            actions: {
                delete: 'Supprimer le taux',
                deleteMultiple: 'Supprimer les taux',
                enable: 'Activer le tarif',
                disable: 'D\u00E9sactiver le taux',
                enableTaxRates: () => ({
                    one: 'Activer le tarif',
                    other: 'Activer les tarifs',
                }),
                disableTaxRates: () => ({
                    one: 'D\u00E9sactiver le taux',
                    other: 'D\u00E9sactiver les tarifs',
                }),
            },
            importedFromAccountingSoftware: 'Les taxes ci-dessous sont import\u00E9es de votre',
            taxCode: 'Code fiscal',
            updateTaxCodeFailureMessage: "Une erreur s'est produite lors de la mise \u00E0 jour du code fiscal, veuillez r\u00E9essayer.",
        },
        emptyWorkspace: {
            title: 'Cr\u00E9er un espace de travail',
            subtitle:
                'Cr\u00E9ez un espace de travail pour suivre les re\u00E7us, rembourser les d\u00E9penses, g\u00E9rer les voyages, envoyer des factures, et plus encore \u2014 le tout \u00E0 la vitesse de la discussion.',
            createAWorkspaceCTA: 'Commencer',
            features: {
                trackAndCollect: 'Suivre et collecter les re\u00E7us',
                reimbursements: 'Rembourser les employ\u00E9s',
                companyCards: "G\u00E9rer les cartes d'entreprise",
            },
            notFound: 'Aucun espace de travail trouv\u00E9',
            description:
                'Les salles sont un excellent endroit pour discuter et travailler avec plusieurs personnes. Pour commencer \u00E0 collaborer, cr\u00E9ez ou rejoignez un espace de travail.',
        },
        new: {
            newWorkspace: 'Nouvel espace de travail',
            getTheExpensifyCardAndMore: 'Obtenez la carte Expensify et plus encore',
            confirmWorkspace: "Confirmer l'Espace de travail",
            myGroupWorkspace: 'Mon espace de travail de groupe',
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Espace de travail de ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: "Une erreur s'est produite lors de la suppression d'un membre de l'espace de travail, veuillez r\u00E9essayer.",
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `\u00CAtes-vous s\u00FBr de vouloir supprimer ${memberName} ?`,
                other: '\u00CAtes-vous s\u00FBr de vouloir supprimer ces membres ?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} est un approbateur dans cet espace de travail. Lorsque vous ne partagez plus cet espace de travail avec eux, nous les remplacerons dans le flux de travail d'approbation par le propri\u00E9taire de l'espace de travail, ${ownerName}.`,
            removeMembersTitle: () => ({
                one: 'Supprimer le membre',
                other: 'Supprimer des membres',
            }),
            findMember: 'Trouver un membre',
            removeWorkspaceMemberButtonTitle: "Supprimer de l'espace de travail",
            removeGroupMemberButtonTitle: 'Retirer du groupe',
            removeRoomMemberButtonTitle: 'Supprimer du chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `\u00CAtes-vous s\u00FBr de vouloir supprimer ${memberName} ?`,
            removeMemberTitle: 'Supprimer le membre',
            transferOwner: 'Transf\u00E9rer le propri\u00E9taire',
            makeMember: 'Cr\u00E9er un membre',
            makeAdmin: 'Nommer administrateur',
            makeAuditor: 'Cr\u00E9er un auditeur',
            selectAll: 'Tout s\u00E9lectionner',
            error: {
                genericAdd: "Il y a eu un probl\u00E8me lors de l'ajout de ce membre de l'espace de travail",
                cannotRemove: "Vous ne pouvez pas vous retirer ou retirer le propri\u00E9taire de l'espace de travail.",
                genericRemove: "Il y a eu un probl\u00E8me lors de la suppression de ce membre de l'espace de travail.",
            },
            addedWithPrimary: 'Certains membres ont \u00E9t\u00E9 ajout\u00E9s avec leurs identifiants principaux.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Ajout\u00E9 par la connexion secondaire ${secondaryLogin}.`,
            membersListTitle: "Annuaire de tous les membres de l'espace de travail.",
            importMembers: 'Importer des membres',
        },
        card: {
            getStartedIssuing: 'Commencez en \u00E9mettant votre premi\u00E8re carte virtuelle ou physique.',
            issueCard: '\u00C9mettre une carte',
            issueNewCard: {
                whoNeedsCard: "Qui a besoin d'une carte ?",
                findMember: 'Trouver un membre',
                chooseCardType: 'Choisissez un type de carte',
                physicalCard: 'Carte physique',
                physicalCardDescription: 'Id\u00E9al pour le d\u00E9pensier fr\u00E9quent',
                virtualCard: 'Carte virtuelle',
                virtualCardDescription: 'Instantan\u00E9 et flexible',
                chooseLimitType: 'Choisissez un type de limite',
                smartLimit: 'Limite Intelligente',
                smartLimitDescription: "D\u00E9penser jusqu'\u00E0 un certain montant avant de n\u00E9cessiter une approbation",
                monthly: 'Mensuel',
                monthlyDescription: "D\u00E9penser jusqu'\u00E0 un certain montant par mois",
                fixedAmount: 'Montant fixe',
                fixedAmountDescription: "D\u00E9penser jusqu'\u00E0 un certain montant une fois",
                setLimit: 'D\u00E9finir une limite',
                cardLimitError: 'Veuillez entrer un montant inf\u00E9rieur \u00E0 21 474 836 $.',
                giveItName: 'Donnez-lui un nom',
                giveItNameInstruction: "Rendez-la suffisamment unique pour la distinguer des autres cartes. Des cas d'utilisation sp\u00E9cifiques sont encore mieux !",
                cardName: 'Nom de la carte',
                letsDoubleCheck: 'V\u00E9rifions que tout est correct.',
                willBeReady: 'Cette carte sera pr\u00EAte \u00E0 \u00EAtre utilis\u00E9e imm\u00E9diatement.',
                cardholder: 'Titulaire de carte',
                cardType: 'Type de carte',
                limit: 'Limite',
                limitType: 'Type de limite',
                name: 'Nom',
            },
            deactivateCardModal: {
                deactivate: 'D\u00E9sactiver',
                deactivateCard: 'D\u00E9sactiver la carte',
                deactivateConfirmation: 'D\u00E9sactiver cette carte refusera toutes les transactions futures et ne pourra pas \u00EAtre annul\u00E9.',
            },
        },
        accounting: {
            settings: 'param\u00E8tres',
            title: 'Connexions',
            subtitle:
                'Connectez-vous \u00E0 votre syst\u00E8me comptable pour coder les transactions avec votre plan comptable, faire correspondre automatiquement les paiements et garder vos finances synchronis\u00E9es.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Discutez avec votre sp\u00E9cialiste de configuration.',
            talkYourAccountManager: 'Discutez avec votre gestionnaire de compte.',
            talkToConcierge: 'Discutez avec Concierge.',
            needAnotherAccounting: "Besoin d'un autre logiciel de comptabilit\u00E9 ?",
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
            errorODIntegration: 'Il y a une erreur avec une connexion qui a \u00E9t\u00E9 configur\u00E9e dans Expensify Classic.',
            goToODToFix: 'Allez sur Expensify Classic pour r\u00E9soudre ce probl\u00E8me.',
            goToODToSettings: 'Allez sur Expensify Classic pour g\u00E9rer vos param\u00E8tres.',
            setup: 'Connecter',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Derni\u00E8re synchronisation ${relativeDate}`,
            notSync: 'Non synchronis\u00E9',
            import: 'Importer',
            export: 'Exporter',
            advanced: 'Avanc\u00E9',
            other: 'Autre',
            syncNow: 'Synchroniser maintenant',
            disconnect: 'D\u00E9connecter',
            reinstall: 'R\u00E9installer le connecteur',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'int\u00E9gration';
                return `D\u00E9connecter ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Connecter ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'int\u00E9gration comptable'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Impossible de se connecter \u00E0 QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Impossible de se connecter \u00E0 Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Impossible de se connecter \u00E0 NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Impossible de se connecter \u00E0 QuickBooks Desktop';
                    default: {
                        return "Impossible de se connecter \u00E0 l'int\u00E9gration";
                    }
                }
            },
            accounts: 'Plan comptable',
            taxes: 'Taxes',
            imported: 'Import\u00E9',
            notImported: 'Non import\u00E9',
            importAsCategory: 'Import\u00E9 en tant que cat\u00E9gories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Import\u00E9',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Import\u00E9 en tant que tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Import\u00E9',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Non import\u00E9',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Non import\u00E9',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Import\u00E9 en tant que champs de rapport',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Employ\u00E9 par d\u00E9faut de NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'cette int\u00E9gration';
                return `\u00CAtes-vous s\u00FBr de vouloir d\u00E9connecter ${integrationName} ?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `\u00CAtes-vous s\u00FBr de vouloir connecter ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'cette int\u00E9gration comptable'} ? Cela supprimera toutes les connexions comptables existantes.`,
            enterCredentials: 'Entrez vos identifiants',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importation des clients';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importation des employ\u00E9s';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importation des comptes';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importation de classes';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importation des emplacements';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Traitement des donn\u00E9es import\u00E9es';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronisation des rapports rembours\u00E9s et des paiements de factures';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importation des codes fiscaux';
                        case 'quickbooksOnlineCheckConnection':
                            return 'V\u00E9rification de la connexion QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importation des donn\u00E9es QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importation des donn\u00E9es Xero';
                        case 'startingImportQBO':
                            return 'Importation des donn\u00E9es QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importation des donn\u00E9es QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return "Titre d'importation";
                        case 'quickbooksDesktopImportApproveCertificate':
                            return "Importation du certificat d'approbation";
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importation des dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importer la politique de sauvegarde';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return "Synchronisation des donn\u00E9es avec QuickBooks en cours... Veuillez vous assurer que le Web Connector est en cours d'ex\u00E9cution.";
                        case 'quickbooksOnlineSyncTitle':
                            return 'Synchronisation des donn\u00E9es QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Chargement des donn\u00E9es';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Mise \u00E0 jour des cat\u00E9gories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Mise \u00E0 jour des clients/projets';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Mise \u00E0 jour de la liste des personnes';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Mise \u00E0 jour des champs du rapport';
                        case 'jobDone':
                            return 'En attente du chargement des donn\u00E9es import\u00E9es';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Synchronisation du plan comptable';
                        case 'xeroSyncImportCategories':
                            return 'Synchronisation des cat\u00E9gories';
                        case 'xeroSyncImportCustomers':
                            return 'Synchronisation des clients';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Marquer les rapports Expensify comme rembours\u00E9s';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Marquer les factures et les factures Xero comme pay\u00E9es';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronisation des cat\u00E9gories de suivi';
                        case 'xeroSyncImportBankAccounts':
                            return 'Synchronisation des comptes bancaires';
                        case 'xeroSyncImportTaxRates':
                            return 'Synchronisation des taux de taxe';
                        case 'xeroCheckConnection':
                            return 'V\u00E9rification de la connexion Xero';
                        case 'xeroSyncTitle':
                            return 'Synchronisation des donn\u00E9es Xero';
                        case 'netSuiteSyncConnection':
                            return 'Initialisation de la connexion \u00E0 NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importation des clients';
                        case 'netSuiteSyncInitData':
                            return 'R\u00E9cup\u00E9ration des donn\u00E9es depuis NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importation des taxes';
                        case 'netSuiteSyncImportItems':
                            return 'Importation des articles';
                        case 'netSuiteSyncData':
                            return 'Importer des donn\u00E9es dans Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Synchronisation des comptes';
                        case 'netSuiteSyncCurrencies':
                            return 'Synchronisation des devises';
                        case 'netSuiteSyncCategories':
                            return 'Synchronisation des cat\u00E9gories';
                        case 'netSuiteSyncReportFields':
                            return 'Importation des donn\u00E9es en tant que champs de rapport Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importer des donn\u00E9es en tant que tags Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Mise \u00E0 jour des informations de connexion';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marquer les rapports Expensify comme rembours\u00E9s';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marquer les factures et les factures NetSuite comme pay\u00E9es';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importation des fournisseurs';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importation de listes personnalis\u00E9es';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importation de listes personnalis\u00E9es';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importation de filiales';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importation des fournisseurs';
                        case 'intacctCheckConnection':
                            return 'V\u00E9rification de la connexion Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importation des dimensions Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importation des donn\u00E9es Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Traduction manquante pour l'\u00E9tape : ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Exportateur pr\u00E9f\u00E9r\u00E9',
            exportPreferredExporterNote:
                "L'exportateur pr\u00E9f\u00E9r\u00E9 peut \u00EAtre n'importe quel administrateur d'espace de travail, mais doit \u00E9galement \u00EAtre un administrateur de domaine si vous d\u00E9finissez diff\u00E9rents comptes d'exportation pour les cartes d'entreprise individuelles dans les param\u00E8tres de domaine.",
            exportPreferredExporterSubNote: "Une fois d\u00E9fini, l'exportateur pr\u00E9f\u00E9r\u00E9 verra les rapports \u00E0 exporter dans son compte.",
            exportAs: 'Exporter sous forme de',
            exportOutOfPocket: 'Exporter les d\u00E9penses personnelles en tant que',
            exportCompanyCard: "Exporter les d\u00E9penses de la carte de l'entreprise en tant que",
            exportDate: "Date d'exportation",
            defaultVendor: 'Fournisseur par d\u00E9faut',
            autoSync: 'Synchronisation automatique',
            autoSyncDescription: 'Synchronisez NetSuite et Expensify automatiquement, chaque jour. Exportez le rapport finalis\u00E9 en temps r\u00E9el.',
            reimbursedReports: 'Synchroniser les rapports rembours\u00E9s',
            cardReconciliation: 'Rapprochement de carte',
            reconciliationAccount: 'Compte de rapprochement',
            continuousReconciliation: 'R\u00E9conciliation continue',
            saveHoursOnReconciliation:
                '\u00C9conomisez des heures sur le rapprochement \u00E0 chaque p\u00E9riode comptable en laissant Expensify rapprocher en continu les relev\u00E9s et r\u00E8glements de la carte Expensify en votre nom.',
            enableContinuousReconciliation: "Afin d'activer la R\u00E9conciliation Continue, veuillez activer",
            chooseReconciliationAccount: {
                chooseBankAccount: 'Choisissez le compte bancaire contre lequel les paiements de votre carte Expensify seront rapproch\u00E9s.',
                accountMatches: 'Assurez-vous que ce compte correspond \u00E0 votre',
                settlementAccount: 'Compte de r\u00E8glement de la carte Expensify',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) => `(terminant par ${lastFourPAN}) afin que la R\u00E9conciliation Continue fonctionne correctement.`,
            },
        },
        export: {
            notReadyHeading: 'Pas pr\u00EAt \u00E0 exporter',
            notReadyDescription:
                'Les rapports de d\u00E9penses brouillons ou en attente ne peuvent pas \u00EAtre export\u00E9s vers le syst\u00E8me comptable. Veuillez approuver ou payer ces d\u00E9penses avant de les exporter.',
        },
        invoices: {
            sendInvoice: 'Envoyer la facture',
            sendFrom: 'Envoyer depuis',
            invoicingDetails: 'D\u00E9tails de facturation',
            invoicingDetailsDescription: 'Ces informations appara\u00EEtront sur vos factures.',
            companyName: "Nom de l'entreprise",
            companyWebsite: "Site web de l'entreprise",
            paymentMethods: {
                personal: 'Personnel',
                business: 'Business',
                chooseInvoiceMethod: 'Choisissez un mode de paiement ci-dessous :',
                addBankAccount: 'Ajouter un compte bancaire',
                payingAsIndividual: "Payer en tant qu'individu",
                payingAsBusiness: "Payer en tant qu'entreprise",
            },
            invoiceBalance: 'Solde de la facture',
            invoiceBalanceSubtitle:
                "Voici votre solde actuel provenant de l'encaissement des paiements de factures. Il sera transf\u00E9r\u00E9 automatiquement sur votre compte bancaire si vous en avez ajout\u00E9 un.",
            bankAccountsSubtitle: 'Ajoutez un compte bancaire pour effectuer et recevoir des paiements de factures.',
        },
        invite: {
            member: 'Inviter un membre',
            members: 'Inviter des membres',
            invitePeople: 'Inviter de nouveaux membres',
            genericFailureMessage: "Une erreur s'est produite lors de l'invitation du membre \u00E0 l'espace de travail. Veuillez r\u00E9essayer.",
            pleaseEnterValidLogin: `Veuillez vous assurer que l'email ou le num\u00E9ro de t\u00E9l\u00E9phone est valide (par exemple, ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'utilisateur',
            users: 'utilisateurs',
            invited: 'invit\u00E9',
            removed: 'supprim\u00E9',
            to: '\u00E0',
            from: 'de',
        },
        inviteMessage: {
            confirmDetails: 'Confirmer les d\u00E9tails',
            inviteMessagePrompt: 'Rendez votre invitation encore plus sp\u00E9ciale en ajoutant un message ci-dessous !',
            personalMessagePrompt: 'Message',
            genericFailureMessage: "Une erreur s'est produite lors de l'invitation du membre \u00E0 l'espace de travail. Veuillez r\u00E9essayer.",
            inviteNoMembersError: 'Veuillez s\u00E9lectionner au moins un membre \u00E0 inviter',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} a demand\u00E9 \u00E0 rejoindre ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Oups ! Pas si vite...',
            workspaceNeeds: 'Un espace de travail n\u00E9cessite au moins un tarif de distance activ\u00E9.',
            distance: 'Distance',
            centrallyManage: 'G\u00E9rez les tarifs de mani\u00E8re centralis\u00E9e, suivez en miles ou en kilom\u00E8tres, et d\u00E9finissez une cat\u00E9gorie par d\u00E9faut.',
            rate: 'Taux',
            addRate: 'Ajouter un tarif',
            findRate: 'Trouver le tarif',
            trackTax: 'Suivre la taxe',
            deleteRates: () => ({
                one: 'Supprimer le taux',
                other: 'Supprimer les taux',
            }),
            enableRates: () => ({
                one: 'Activer le tarif',
                other: 'Activer les tarifs',
            }),
            disableRates: () => ({
                one: 'D\u00E9sactiver le taux',
                other: 'D\u00E9sactiver les tarifs',
            }),
            enableRate: 'Activer le tarif',
            status: 'Statut',
            unit: 'Unit\u00E9',
            taxFeatureNotEnabledMessage: "Les taxes doivent \u00EAtre activ\u00E9es sur l'espace de travail pour utiliser cette fonctionnalit\u00E9. Rendez-vous sur",
            changePromptMessage: 'pour effectuer ce changement.',
            deleteDistanceRate: 'Supprimer le tarif de distance',
            areYouSureDelete: () => ({
                one: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce tarif ?',
                other: '\u00CAtes-vous s\u00FBr de vouloir supprimer ces tarifs ?',
            }),
        },
        editor: {
            descriptionInputLabel: 'Description',
            nameInputLabel: 'Nom',
            typeInputLabel: 'Tapez',
            initialValueInputLabel: 'Valeur initiale',
            nameInputHelpText: "C'est le nom que vous verrez sur votre espace de travail.",
            nameIsRequiredError: 'Vous devrez donner un nom \u00E0 votre espace de travail',
            currencyInputLabel: 'Devise par d\u00E9faut',
            currencyInputHelpText: 'Toutes les d\u00E9penses de cet espace de travail seront converties dans cette devise.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `La devise par d\u00E9faut ne peut pas \u00EAtre modifi\u00E9e car cet espace de travail est li\u00E9 \u00E0 un compte bancaire en ${currency}.`,
            save: 'Enregistrer',
            genericFailureMessage: "Une erreur s'est produite lors de la mise \u00E0 jour de l'espace de travail. Veuillez r\u00E9essayer.",
            avatarUploadFailureMessage: "Une erreur s'est produite lors du t\u00E9l\u00E9chargement de l'avatar. Veuillez r\u00E9essayer.",
            addressContext: "Une adresse de l'espace de travail est requise pour activer Expensify Travel. Veuillez entrer une adresse associ\u00E9e \u00E0 votre entreprise.",
        },
        bankAccount: {
            continueWithSetup: 'Continuer la configuration',
            youAreAlmostDone:
                "Vous avez presque termin\u00E9 la configuration de votre compte bancaire, ce qui vous permettra d'\u00E9mettre des cartes d'entreprise, de rembourser des d\u00E9penses, de collecter des factures et de payer des factures.",
            streamlinePayments: 'Rationaliser les paiements',
            connectBankAccountNote: 'Remarque : Les comptes bancaires personnels ne peuvent pas \u00EAtre utilis\u00E9s pour les paiements sur les espaces de travail.',
            oneMoreThing: 'Encore une chose !',
            allSet: 'Vous \u00EAtes pr\u00EAt !',
            accountDescriptionWithCards:
                "Ce compte bancaire sera utilis\u00E9 pour \u00E9mettre des cartes d'entreprise, rembourser des d\u00E9penses, encaisser des factures et payer des factures.",
            letsFinishInChat: 'Finissons dans le chat !',
            finishInChat: 'Terminer dans le chat',
            almostDone: 'Presque termin\u00E9 !',
            disconnectBankAccount: 'D\u00E9connecter le compte bancaire',
            startOver: 'Recommencer',
            updateDetails: 'Mettre \u00E0 jour les d\u00E9tails',
            yesDisconnectMyBankAccount: 'Oui, d\u00E9connectez mon compte bancaire',
            yesStartOver: 'Oui, recommencez.',
            disconnectYour: 'D\u00E9connectez votre',
            bankAccountAnyTransactions: 'compte bancaire. Toutes les transactions en cours pour ce compte seront toujours compl\u00E9t\u00E9es.',
            clearProgress: "Recommencer effacera les progr\u00E8s que vous avez r\u00E9alis\u00E9s jusqu'\u00E0 pr\u00E9sent.",
            areYouSure: '\u00CAtes-vous s\u00FBr ?',
            workspaceCurrency: "Devise de l'espace de travail",
            updateCurrencyPrompt:
                "Il semble que votre espace de travail soit actuellement d\u00E9fini sur une devise diff\u00E9rente de l'USD. Veuillez cliquer sur le bouton ci-dessous pour mettre \u00E0 jour votre devise en USD maintenant.",
            updateToUSD: 'Mettre \u00E0 jour en USD',
            updateWorkspaceCurrency: "Mettre \u00E0 jour la devise de l'espace de travail",
            workspaceCurrencyNotSupported: "Devise de l'espace de travail non prise en charge",
            yourWorkspace: 'Votre espace de travail est configur\u00E9 sur une devise non prise en charge. Consultez le',
            listOfSupportedCurrencies: 'liste des devises prises en charge',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transf\u00E9rer le propri\u00E9taire',
            addPaymentCardTitle: 'Entrez votre carte de paiement pour transf\u00E9rer la propri\u00E9t\u00E9',
            addPaymentCardButtonText: 'Accepter les conditions et ajouter une carte de paiement',
            addPaymentCardReadAndAcceptTextPart1: 'Lire et accepter',
            addPaymentCardReadAndAcceptTextPart2: 'politique pour ajouter votre carte',
            addPaymentCardTerms: 'conditions',
            addPaymentCardPrivacy: 'confidentialit\u00E9',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Conforme \u00E0 la norme PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Chiffrement de niveau bancaire',
            addPaymentCardRedundant: 'Infrastructure redondante',
            addPaymentCardLearnMore: 'En savoir plus sur notre',
            addPaymentCardSecurity: 's\u00E9curit\u00E9',
            amountOwedTitle: 'Solde impay\u00E9',
            amountOwedButtonText: "D'accord",
            amountOwedText:
                "Ce compte a un solde impay\u00E9 d'un mois pr\u00E9c\u00E9dent.\n\nVoulez-vous r\u00E9gler le solde et prendre en charge la facturation de cet espace de travail ?",
            ownerOwesAmountTitle: 'Solde impay\u00E9',
            ownerOwesAmountButtonText: 'Transf\u00E9rer le solde',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `Le compte propri\u00E9taire de cet espace de travail (${email}) a un solde impay\u00E9 d'un mois pr\u00E9c\u00E9dent.\n\nSouhaitez-vous transf\u00E9rer ce montant (${amount}) afin de prendre en charge la facturation de cet espace de travail ? Votre carte de paiement sera d\u00E9bit\u00E9e imm\u00E9diatement.`,
            subscriptionTitle: "Prendre en charge l'abonnement annuel",
            subscriptionButtonText: "Transf\u00E9rer l'abonnement",
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Prendre en charge cet espace de travail fusionnera son abonnement annuel avec votre abonnement actuel. Cela augmentera la taille de votre abonnement de ${usersCount} membres, portant votre nouvelle taille d'abonnement \u00E0 ${finalCount}. Souhaitez-vous continuer ?`,
            duplicateSubscriptionTitle: "Alerte de duplication d'abonnement",
            duplicateSubscriptionButtonText: 'Continuer',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Il semble que vous essayiez de prendre en charge la facturation pour les espaces de travail de ${email}, mais pour cela, vous devez d'abord \u00EAtre administrateur de tous leurs espaces de travail.\n\nCliquez sur "Continuer" si vous souhaitez uniquement prendre en charge la facturation pour l'espace de travail ${workspaceName}.\n\nSi vous souhaitez prendre en charge la facturation de l'ensemble de leur abonnement, veuillez leur demander de vous ajouter en tant qu'administrateur \u00E0 tous leurs espaces de travail avant de prendre en charge la facturation.`,
            hasFailedSettlementsTitle: 'Impossible de transf\u00E9rer la propri\u00E9t\u00E9',
            hasFailedSettlementsButtonText: 'Compris',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Vous ne pouvez pas prendre en charge la facturation car ${email} a un r\u00E8glement de carte Expensify en retard. Veuillez leur demander de contacter concierge@expensify.com pour r\u00E9soudre le probl\u00E8me. Ensuite, vous pourrez prendre en charge la facturation de cet espace de travail.`,
            failedToClearBalanceTitle: '\u00C9chec de la remise \u00E0 z\u00E9ro du solde',
            failedToClearBalanceButtonText: "D'accord",
            failedToClearBalanceText: "Nous n'avons pas pu effacer le solde. Veuillez r\u00E9essayer plus tard.",
            successTitle: 'Woohoo ! Tout est pr\u00EAt.',
            successDescription: 'Vous \u00EAtes maintenant le propri\u00E9taire de cet espace de travail.',
            errorTitle: 'Oups ! Pas si vite...',
            errorDescriptionPartOne: 'Il y a eu un probl\u00E8me lors du transfert de la propri\u00E9t\u00E9 de cet espace de travail. R\u00E9essayez, ou',
            errorDescriptionPartTwo: 'contactez Concierge',
            errorDescriptionPartThree: "pour obtenir de l'aide.",
        },
        exportAgainModal: {
            title: 'Attention !',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `Les rapports suivants ont d\u00E9j\u00E0 \u00E9t\u00E9 export\u00E9s vers ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} :\n\n${reportName}\n\n\u00CAtes-vous s\u00FBr de vouloir les exporter \u00E0 nouveau ?`,
            confirmText: 'Oui, exporter \u00E0 nouveau',
            cancelText: 'Annuler',
        },
        upgrade: {
            reportFields: {
                title: 'Champs de rapport',
                description: `Les champs de rapport vous permettent de sp\u00E9cifier des d\u00E9tails au niveau de l'en-t\u00EAte, distincts des tags qui se rapportent aux d\u00E9penses sur des postes individuels. Ces d\u00E9tails peuvent inclure des noms de projets sp\u00E9cifiques, des informations sur les voyages d'affaires, des emplacements, et plus encore.`,
                onlyAvailableOnPlan: 'Les champs de rapport sont uniquement disponibles sur le plan Control, \u00E0 partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profitez de la synchronisation automatis\u00E9e et r\u00E9duisez les saisies manuelles gr\u00E2ce \u00E0 l'int\u00E9gration Expensify + NetSuite. Obtenez des informations financi\u00E8res approfondies et en temps r\u00E9el avec la prise en charge des segments natifs et personnalis\u00E9s, y compris la cartographie des projets et des clients.`,
                onlyAvailableOnPlan: 'Notre int\u00E9gration NetSuite est uniquement disponible avec le plan Control, \u00E0 partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profitez de la synchronisation automatis\u00E9e et r\u00E9duisez les saisies manuelles gr\u00E2ce \u00E0 l'int\u00E9gration Expensify + Sage Intacct. Obtenez des insights financiers approfondis et en temps r\u00E9el avec des dimensions d\u00E9finies par l'utilisateur, ainsi que le codage des d\u00E9penses par d\u00E9partement, classe, emplacement, client et projet (travail).`,
                onlyAvailableOnPlan: 'Notre int\u00E9gration Sage Intacct est uniquement disponible avec le plan Control, \u00E0 partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Profitez de la synchronisation automatis\u00E9e et r\u00E9duisez les saisies manuelles gr\u00E2ce \u00E0 l'int\u00E9gration Expensify + QuickBooks Desktop. Obtenez une efficacit\u00E9 ultime avec une connexion bidirectionnelle en temps r\u00E9el et un codage des d\u00E9penses par classe, article, client et projet.`,
                onlyAvailableOnPlan: 'Notre int\u00E9gration QuickBooks Desktop est uniquement disponible avec le plan Control, \u00E0 partir de',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Approvals avanc\u00E9s',
                description: `Si vous souhaitez ajouter plus de niveaux d'approbation au processus - ou simplement vous assurer que les d\u00E9penses les plus importantes soient examin\u00E9es par une autre personne - nous avons ce qu'il vous faut. Les approbations avanc\u00E9es vous aident \u00E0 mettre en place les contr\u00F4les appropri\u00E9s \u00E0 chaque niveau pour garder les d\u00E9penses de votre \u00E9quipe sous contr\u00F4le.`,
                onlyAvailableOnPlan: 'Les approbations avanc\u00E9es ne sont disponibles que sur le plan Control, qui commence \u00E0',
            },
            categories: {
                title: 'Cat\u00E9gories',
                description: `Les cat\u00E9gories vous aident \u00E0 mieux organiser vos d\u00E9penses pour suivre o\u00F9 vous d\u00E9pensez votre argent. Utilisez notre liste de cat\u00E9gories sugg\u00E9r\u00E9es ou cr\u00E9ez les v\u00F4tres.`,
                onlyAvailableOnPlan: 'Les cat\u00E9gories sont disponibles sur le plan Collect, \u00E0 partir de',
            },
            glCodes: {
                title: 'codes GL',
                description: `Ajoutez des codes GL \u00E0 vos cat\u00E9gories et \u00E9tiquettes pour faciliter l'exportation des d\u00E9penses vers vos syst\u00E8mes de comptabilit\u00E9 et de paie.`,
                onlyAvailableOnPlan: 'Les codes GL sont uniquement disponibles sur le plan Control, \u00E0 partir de',
            },
            glAndPayrollCodes: {
                title: 'Codes GL et de paie',
                description: `Ajoutez des codes de Grand Livre et de Paie \u00E0 vos cat\u00E9gories pour faciliter l'exportation des d\u00E9penses vers vos syst\u00E8mes de comptabilit\u00E9 et de paie.`,
                onlyAvailableOnPlan: 'Les codes GL et de paie sont uniquement disponibles sur le plan Control, \u00E0 partir de',
            },
            taxCodes: {
                title: 'Codes fiscaux',
                description: `Ajoutez des codes fiscaux \u00E0 vos taxes pour faciliter l'exportation des d\u00E9penses vers vos syst\u00E8mes de comptabilit\u00E9 et de paie.`,
                onlyAvailableOnPlan: 'Les codes fiscaux sont uniquement disponibles sur le plan Control, \u00E0 partir de',
            },
            companyCards: {
                title: "Cartes d'entreprise illimit\u00E9es",
                description: `Besoin d'ajouter plus de flux de cartes ? D\u00E9bloquez des cartes d'entreprise illimit\u00E9es pour synchroniser les transactions de tous les principaux \u00E9metteurs de cartes.`,
                onlyAvailableOnPlan: 'Ceci est uniquement disponible sur le plan Control, \u00E0 partir de',
            },
            rules: {
                title: 'R\u00E8gles',
                description: `Les r\u00E8gles fonctionnent en arri\u00E8re-plan et gardent vos d\u00E9penses sous contr\u00F4le pour que vous n'ayez pas \u00E0 vous soucier des petits d\u00E9tails.\n\nExigez des d\u00E9tails de d\u00E9pense comme les re\u00E7us et les descriptions, d\u00E9finissez des limites et des valeurs par d\u00E9faut, et automatisez les approbations et les paiements \u2013 tout en un seul endroit.`,
                onlyAvailableOnPlan: 'Les r\u00E8gles sont uniquement disponibles sur le plan Control, \u00E0 partir de',
            },
            perDiem: {
                title: 'Per diem',
                description:
                    'Le per diem est un excellent moyen de garder vos co\u00FBts quotidiens conformes et pr\u00E9visibles lorsque vos employ\u00E9s voyagent. Profitez de fonctionnalit\u00E9s telles que des tarifs personnalis\u00E9s, des cat\u00E9gories par d\u00E9faut, et des d\u00E9tails plus pr\u00E9cis comme les destinations et les sous-tarifs.',
                onlyAvailableOnPlan: 'Les indemnit\u00E9s journali\u00E8res ne sont disponibles que sur le plan Control, \u00E0 partir de',
            },
            travel: {
                title: 'Voyage',
                description:
                    "Expensify Travel est une nouvelle plateforme de r\u00E9servation et de gestion de voyages d'affaires qui permet aux membres de r\u00E9server des h\u00E9bergements, des vols, des transports, et plus encore.",
                onlyAvailableOnPlan: 'Le voyage est disponible sur le plan Collect, \u00E0 partir de',
            },
            multiLevelTags: {
                title: 'Balises multi-niveaux',
                description:
                    "Les balises multi-niveaux vous aident \u00E0 suivre les d\u00E9penses avec plus de pr\u00E9cision. Attribuez plusieurs balises \u00E0 chaque ligne d'article, telles que d\u00E9partement, client ou centre de co\u00FBt, pour capturer le contexte complet de chaque d\u00E9pense. Cela permet des rapports plus d\u00E9taill\u00E9s, des flux de travail d'approbation et des exportations comptables.",
                onlyAvailableOnPlan: 'Les balises multi-niveaux sont uniquement disponibles sur le plan Control, \u00E0 partir de',
            },
            pricing: {
                perActiveMember: 'par membre actif par mois.',
                perMember: 'par membre par mois.',
            },
            note: {
                upgradeWorkspace: 'Mettez \u00E0 niveau votre espace de travail pour acc\u00E9der \u00E0 cette fonctionnalit\u00E9, ou',
                learnMore: 'en savoir plus',
                aboutOurPlans: '\u00E0 propos de nos plans et tarifs.',
            },
            upgradeToUnlock: 'D\u00E9bloquez cette fonctionnalit\u00E9',
            completed: {
                headline: `Vous avez mis \u00E0 niveau votre espace de travail !`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `Vous avez r\u00E9ussi \u00E0 passer ${policyName} au plan Control !`,
                categorizeMessage: `Vous avez r\u00E9ussi \u00E0 passer \u00E0 un espace de travail sur le plan Collect. Vous pouvez maintenant cat\u00E9goriser vos d\u00E9penses !`,
                travelMessage: `Vous avez r\u00E9ussi \u00E0 passer \u00E0 un espace de travail sur le plan Collect. Vous pouvez maintenant commencer \u00E0 r\u00E9server et g\u00E9rer vos voyages !`,
                viewSubscription: 'Voir votre abonnement',
                moreDetails: 'pour plus de d\u00E9tails.',
                gotIt: 'Compris, merci',
            },
            commonFeatures: {
                title: 'Passez au plan Control',
                note: 'D\u00E9bloquez nos fonctionnalit\u00E9s les plus puissantes, y compris :',
                benefits: {
                    startsAt: 'Le plan Control commence \u00E0',
                    perMember: 'par membre actif par mois.',
                    learnMore: 'En savoir plus',
                    pricing: '\u00E0 propos de nos plans et tarifs.',
                    benefit1: 'Connexions comptables avanc\u00E9es (NetSuite, Sage Intacct, et plus)',
                    benefit2: 'R\u00E8gles de d\u00E9penses intelligentes',
                    benefit3: "Flux de travail d'approbation multi-niveaux",
                    benefit4: 'Contr\u00F4les de s\u00E9curit\u00E9 am\u00E9lior\u00E9s',
                    toUpgrade: 'Pour mettre \u00E0 niveau, cliquez',
                    selectWorkspace: 's\u00E9lectionnez un espace de travail et changez le type de plan en',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Passer au plan Collect',
                note: "Si vous r\u00E9trogradez, vous perdrez l'acc\u00E8s \u00E0 ces fonctionnalit\u00E9s et plus encore :",
                benefits: {
                    note: 'Pour une comparaison compl\u00E8te de nos forfaits, consultez notre',
                    pricingPage: 'page de tarification',
                    confirm: '\u00CAtes-vous s\u00FBr de vouloir r\u00E9trograder et supprimer vos configurations ?',
                    warning: 'Cela ne peut pas \u00EAtre annul\u00E9.',
                    benefit1: 'Connexions comptables (sauf QuickBooks Online et Xero)',
                    benefit2: 'R\u00E8gles de d\u00E9penses intelligentes',
                    benefit3: "Flux de travail d'approbation multi-niveaux",
                    benefit4: 'Contr\u00F4les de s\u00E9curit\u00E9 am\u00E9lior\u00E9s',
                    headsUp: 'Attention !',
                    multiWorkspaceNote:
                        'Vous devrez r\u00E9trograder tous vos espaces de travail avant votre premier paiement mensuel pour commencer un abonnement au tarif Collect. Cliquez',
                    selectStep: '> s\u00E9lectionnez chaque espace de travail > changez le type de plan en',
                },
            },
            completed: {
                headline: 'Votre espace de travail a \u00E9t\u00E9 r\u00E9trograd\u00E9',
                description:
                    "Vous avez d'autres espaces de travail sur le plan Control. Pour \u00EAtre factur\u00E9 au tarif Collect, vous devez r\u00E9trograder tous les espaces de travail.",
                gotIt: 'Compris, merci',
            },
        },
        payAndDowngrade: {
            title: 'Payer et r\u00E9trograder',
            headline: 'Votre paiement final',
            description1: 'Votre facture finale pour cet abonnement sera',
            description2: ({date}: DateParams) => `Voir votre r\u00E9partition ci-dessous pour le ${date} :`,
            subscription:
                "Attention ! Cette action mettra fin \u00E0 votre abonnement Expensify, supprimera cet espace de travail et retirera tous les membres de l'espace de travail. Si vous souhaitez conserver cet espace de travail et seulement vous retirer, demandez \u00E0 un autre administrateur de prendre en charge la facturation d'abord.",
            genericFailureMessage: "Une erreur s'est produite lors du paiement de votre facture. Veuillez r\u00E9essayer.",
        },
        restrictedAction: {
            restricted: 'Restreint',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Les actions sur l'espace de travail ${workspaceName} sont actuellement restreintes.`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Le propri\u00E9taire de l'espace de travail, ${workspaceOwnerName}, devra ajouter ou mettre \u00E0 jour la carte de paiement enregistr\u00E9e pour d\u00E9bloquer la nouvelle activit\u00E9 de l'espace de travail.`,
            youWillNeedToAddOrUpdatePaymentCard:
                "Vous devrez ajouter ou mettre \u00E0 jour la carte de paiement enregistr\u00E9e pour d\u00E9bloquer de nouvelles activit\u00E9s de l'espace de travail.",
            addPaymentCardToUnlock: 'Ajoutez une carte de paiement pour d\u00E9bloquer !',
            addPaymentCardToContinueUsingWorkspace: 'Ajoutez une carte de paiement pour continuer \u00E0 utiliser cet espace de travail.',
            pleaseReachOutToYourWorkspaceAdmin: "Veuillez contacter l'administrateur de votre espace de travail pour toute question.",
            chatWithYourAdmin: 'Discutez avec votre administrateur',
            chatInAdmins: 'Discussion dans #admins',
            addPaymentCard: 'Ajouter une carte de paiement',
        },
        rules: {
            individualExpenseRules: {
                title: 'D\u00E9penses',
                subtitle:
                    'D\u00E9finissez des contr\u00F4les de d\u00E9penses et des valeurs par d\u00E9faut pour les d\u00E9penses individuelles. Vous pouvez \u00E9galement cr\u00E9er des r\u00E8gles pour',
                receiptRequiredAmount: 'Montant requis pour le re\u00E7u',
                receiptRequiredAmountDescription: 'Exiger des re\u00E7us lorsque les d\u00E9penses d\u00E9passent ce montant, sauf si une r\u00E8gle de cat\u00E9gorie le remplace.',
                maxExpenseAmount: 'Montant maximal de d\u00E9pense',
                maxExpenseAmountDescription: 'Signaler les d\u00E9penses qui d\u00E9passent ce montant, sauf si une r\u00E8gle de cat\u00E9gorie les remplace.',
                maxAge: '\u00C2ge maximum',
                maxExpenseAge: '\u00C2ge maximal de la d\u00E9pense',
                maxExpenseAgeDescription: "Signaler les d\u00E9penses plus anciennes qu'un certain nombre de jours.",
                maxExpenseAgeDays: () => ({
                    one: '1 jour',
                    other: (count: number) => `${count} jours`,
                }),
                billableDefault: 'Facturable par d\u00E9faut',
                billableDefaultDescription:
                    'Choisissez si les d\u00E9penses en esp\u00E8ces et par carte de cr\u00E9dit doivent \u00EAtre facturables par d\u00E9faut. Les d\u00E9penses facturables sont activ\u00E9es ou d\u00E9sactiv\u00E9es dans',
                billable: 'Facturable',
                billableDescription: 'Les d\u00E9penses sont le plus souvent refactur\u00E9es aux clients.',
                nonBillable: 'Non facturable',
                nonBillableDescription: 'Les d\u00E9penses sont occasionnellement refactur\u00E9es aux clients.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'Les eReceipts sont cr\u00E9\u00E9s automatiquement',
                eReceiptsHintLink: 'pour la plupart des transactions de cr\u00E9dit en USD',
                attendeeTracking: 'Suivi des participants',
                attendeeTrackingHint: 'Suivre le co\u00FBt par personne pour chaque d\u00E9pense.',
                prohibitedDefaultDescription:
                    "Signalez tous les re\u00E7us o\u00F9 apparaissent de l'alcool, des jeux d'argent ou d'autres articles restreints. Les d\u00E9penses avec des re\u00E7us contenant ces articles n\u00E9cessiteront une r\u00E9vision manuelle.",
                prohibitedExpenses: 'D\u00E9penses interdites',
                alcohol: 'Alcool',
                hotelIncidentals: "Frais accessoires d'h\u00F4tel",
                gambling: "Jeu d'argent",
                tobacco: 'Tabac',
                adultEntertainment: 'Divertissement pour adultes',
            },
            expenseReportRules: {
                examples: 'Exemples :',
                title: 'Rapports de d\u00E9penses',
                subtitle: 'Automatisez la conformit\u00E9, les approbations et le paiement des rapports de d\u00E9penses.',
                customReportNamesSubtitle: 'Personnalisez les titres des rapports en utilisant notre',
                customNameTitle: 'Titre de rapport par d\u00E9faut',
                customNameDescription: 'Choisissez un nom personnalis\u00E9 pour les rapports de d\u00E9penses en utilisant notre',
                customNameDescriptionLink: 'formules \u00E9tendues',
                customNameInputLabel: 'Nom',
                customNameEmailPhoneExample: 'E-mail ou t\u00E9l\u00E9phone du membre : {report:submit:from}',
                customNameStartDateExample: 'Date de d\u00E9but du rapport : {report:startdate}',
                customNameWorkspaceNameExample: "Nom de l'espace de travail : {report:workspacename}",
                customNameReportIDExample: 'Report ID: {report:id}',
                customNameTotalExample: 'Total : {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Emp\u00EAcher les membres de modifier les noms des rapports personnalis\u00E9s',
                preventSelfApprovalsTitle: 'Emp\u00EAcher les auto-approbations',
                preventSelfApprovalsSubtitle: "Emp\u00EAcher les membres de l'espace de travail d'approuver leurs propres rapports de d\u00E9penses.",
                autoApproveCompliantReportsTitle: 'Approuver automatiquement les rapports conformes',
                autoApproveCompliantReportsSubtitle: "Configurez quels rapports de d\u00E9penses sont \u00E9ligibles pour l'approbation automatique.",
                autoApproveReportsUnderTitle: 'Approuver automatiquement les rapports sous',
                autoApproveReportsUnderDescription: 'Les rapports de d\u00E9penses enti\u00E8rement conformes en dessous de ce montant seront automatiquement approuv\u00E9s.',
                randomReportAuditTitle: 'Audit de rapport al\u00E9atoire',
                randomReportAuditDescription: "Exiger que certains rapports soient approuv\u00E9s manuellement, m\u00EAme s'ils sont \u00E9ligibles pour une approbation automatique.",
                autoPayApprovedReportsTitle: 'Rapports approuv\u00E9s de paiement automatique',
                autoPayApprovedReportsSubtitle: 'Configurez quels rapports de d\u00E9penses sont \u00E9ligibles pour le paiement automatique.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Veuillez entrer un montant inf\u00E9rieur \u00E0 ${currency ?? ''}20 000`,
                autoPayApprovedReportsLockedSubtitle:
                    'Allez dans plus de fonctionnalit\u00E9s et activez les flux de travail, puis ajoutez des paiements pour d\u00E9bloquer cette fonctionnalit\u00E9.',
                autoPayReportsUnderTitle: 'Rapports de paiement automatique sous',
                autoPayReportsUnderDescription: 'Les rapports de d\u00E9penses enti\u00E8rement conformes en dessous de ce montant seront automatiquement pay\u00E9s.',
                unlockFeatureGoToSubtitle: 'Aller \u00E0',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) =>
                    `et activez les flux de travail, puis ajoutez ${featureName} pour d\u00E9bloquer cette fonctionnalit\u00E9.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `et activez ${featureName} pour d\u00E9bloquer cette fonctionnalit\u00E9.`,
            },
            categoryRules: {
                title: 'R\u00E8gles de cat\u00E9gorie',
                approver: 'Approbateur',
                requireDescription: 'Exiger une description',
                descriptionHint: 'Indice de description',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Rappelez aux employ\u00E9s de fournir des informations suppl\u00E9mentaires pour les d\u00E9penses de \u00AB ${categoryName} \u00BB. Cet indice appara\u00EEt dans le champ de description des d\u00E9penses.`,
                descriptionHintLabel: 'Indice',
                descriptionHintSubtitle: "Astuce : Plus c'est court, mieux c'est !",
                maxAmount: 'Montant maximum',
                flagAmountsOver: 'Signaler les montants sup\u00E9rieurs \u00E0',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `S'applique \u00E0 la cat\u00E9gorie \u00AB ${categoryName} \u00BB.`,
                flagAmountsOverSubtitle: 'Cela remplace le montant maximum pour toutes les d\u00E9penses.',
                expenseLimitTypes: {
                    expense: 'D\u00E9pense individuelle',
                    expenseSubtitle:
                        "Signaler les montants des d\u00E9penses par cat\u00E9gorie. Cette r\u00E8gle remplace la r\u00E8gle g\u00E9n\u00E9rale de l'espace de travail pour le montant maximal des d\u00E9penses.",
                    daily: 'Total de la cat\u00E9gorie',
                    dailySubtitle: 'Signaler le total des d\u00E9penses par cat\u00E9gorie pour chaque rapport de d\u00E9penses.',
                },
                requireReceiptsOver: 'Exiger des re\u00E7us au-del\u00E0 de',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Par d\u00E9faut`,
                    never: 'Ne jamais exiger de re\u00E7us',
                    always: 'Toujours exiger des re\u00E7us',
                },
                defaultTaxRate: "Taux d'imposition par d\u00E9faut",
                goTo: 'Aller \u00E0',
                andEnableWorkflows: 'et activez les flux de travail, puis ajoutez des approbations pour d\u00E9bloquer cette fonctionnalit\u00E9.',
            },
            customRules: {
                title: 'R\u00E8gles personnalis\u00E9es',
                subtitle: 'Description',
                description: 'Saisir des r\u00E8gles personnalis\u00E9es pour les rapports de d\u00E9penses',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Collecter',
                    description: 'Pour les \u00E9quipes cherchant \u00E0 automatiser leurs processus.',
                },
                corporate: {
                    label: 'Contr\u00F4le',
                    description: 'Pour les organisations ayant des exigences avanc\u00E9es.',
                },
            },
            description: 'Choisissez un plan qui vous convient. Pour une liste d\u00E9taill\u00E9e des fonctionnalit\u00E9s et des tarifs, consultez notre',
            subscriptionLink: "types de plans et page d'aide sur les tarifs",
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Vous vous \u00EAtes engag\u00E9 \u00E0 avoir 1 membre actif sur le plan Control jusqu'\u00E0 la fin de votre abonnement annuel le ${annualSubscriptionEndDate}. Vous pouvez passer \u00E0 un abonnement \u00E0 l'utilisation et r\u00E9trograder vers le plan Collect \u00E0 partir du ${annualSubscriptionEndDate} en d\u00E9sactivant le renouvellement automatique dans`,
                other: `Vous vous \u00EAtes engag\u00E9 \u00E0 avoir ${count} membres actifs sur le plan Control jusqu'\u00E0 la fin de votre abonnement annuel le ${annualSubscriptionEndDate}. Vous pouvez passer \u00E0 un abonnement \u00E0 l'utilisation et r\u00E9trograder au plan Collect \u00E0 partir du ${annualSubscriptionEndDate} en d\u00E9sactivant le renouvellement automatique dans`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: "Obtenir de l'aide",
        subtitle: 'Nous sommes ici pour d\u00E9gager votre chemin vers la grandeur !',
        description: 'Choisissez parmi les options de support ci-dessous :',
        chatWithConcierge: 'Discuter avec Concierge',
        scheduleSetupCall: 'Planifier un appel de configuration',
        scheduleACall: 'Planifier un appel',
        questionMarkButtonTooltip: "Obtenez de l'aide de notre \u00E9quipe",
        exploreHelpDocs: "Explorer les documents d'aide",
        registerForWebinar: "S'inscrire au webinaire",
        onboardingHelp: "Aide \u00E0 l'int\u00E9gration",
    },
    emojiPicker: {
        skinTonePickerLabel: 'Changer la teinte de peau par d\u00E9faut',
        headers: {
            frequentlyUsed: 'Fr\u00E9quemment utilis\u00E9',
            smileysAndEmotion: 'Smileys & Emotion',
            peopleAndBody: 'Personnes et Corps',
            animalsAndNature: 'Animaux et Nature',
            foodAndDrink: 'Nourriture et Boissons',
            travelAndPlaces: 'Voyages et lieux',
            activities: 'Activit\u00E9s',
            objects: 'Objets',
            symbols: 'Symboles',
            flags: 'Drapeaux',
        },
    },
    newRoomPage: {
        newRoom: 'Nouvelle salle',
        groupName: 'Nom du groupe',
        roomName: 'Nom de la salle',
        visibility: 'Visibilit\u00E9',
        restrictedDescription: 'Les personnes dans votre espace de travail peuvent trouver cette salle',
        privateDescription: 'Les personnes invit\u00E9es \u00E0 cette salle peuvent la trouver.',
        publicDescription: "N'importe qui peut trouver cette salle",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: "N'importe qui peut trouver cette salle",
        createRoom: 'Cr\u00E9er une salle',
        roomAlreadyExistsError: 'Une salle avec ce nom existe d\u00E9j\u00E0',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) =>
            `${reservedName} est une salle par d\u00E9faut sur tous les espaces de travail. Veuillez choisir un autre nom.`,
        roomNameInvalidError: 'Les noms de salle ne peuvent inclure que des lettres minuscules, des chiffres et des tirets.',
        pleaseEnterRoomName: 'Veuillez entrer un nom de salle',
        pleaseSelectWorkspace: 'Veuillez s\u00E9lectionner un espace de travail',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport
                ? `${actor} renomm\u00E9 en "${newName}" (pr\u00E9c\u00E9demment "${oldName}")`
                : `${actor} a renomm\u00E9 cette salle en "${newName}" (auparavant "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Salle renomm\u00E9e en ${newName}`,
        social: 'social',
        selectAWorkspace: 'S\u00E9lectionnez un espace de travail',
        growlMessageOnRenameError: "Impossible de renommer la salle de l'espace de travail. Veuillez v\u00E9rifier votre connexion et r\u00E9essayer.",
        visibilityOptions: {
            restricted: 'Espace de travail', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Priv\u00E9',
            public: 'Public',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Annonce publique',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Soumettre et Fermer',
        submitAndApprove: 'Soumettre et approuver',
        advanced: 'AVANC\u00C9',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `ajout\u00E9 ${approverName} (${approverEmail}) comme approbateur pour le ${field} "${name}"`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `supprim\u00E9 ${approverName} (${approverEmail}) en tant qu'approbateur pour le ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `a chang\u00E9 l'approbateur pour le ${field} "${name}" \u00E0 ${formatApprover(newApproverName, newApproverEmail)} (pr\u00E9c\u00E9demment ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `a ajout\u00E9 la cat\u00E9gorie "${categoryName}"`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `a supprim\u00E9 la cat\u00E9gorie "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'd\u00E9sactiv\u00E9' : 'activ\u00E9'} la cat\u00E9gorie "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `a ajout\u00E9 le code de paie "${newValue}" \u00E0 la cat\u00E9gorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `a supprim\u00E9 le code de paie "${oldValue}" de la cat\u00E9gorie "${categoryName}"`;
            }
            return `a chang\u00E9 le code de paie de la cat\u00E9gorie "${categoryName}" en \u201C${newValue}\u201D (pr\u00E9c\u00E9demment \u201C${oldValue}\u201D)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `a ajout\u00E9 le code GL "${newValue}" \u00E0 la cat\u00E9gorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `a supprim\u00E9 le code GL "${oldValue}" de la cat\u00E9gorie "${categoryName}"`;
            }
            return `a chang\u00E9 le code GL de la cat\u00E9gorie \u201C${categoryName}\u201D en \u201C${newValue}\u201D (pr\u00E9c\u00E9demment \u201C${oldValue}\u201C)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `a chang\u00E9 la description de la cat\u00E9gorie "${categoryName}" en ${!oldValue ? 'requis' : 'pas requis'} (pr\u00E9c\u00E9demment ${!oldValue ? 'pas requis' : 'requis'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `ajout\u00E9 un montant maximum de ${newAmount} \u00E0 la cat\u00E9gorie "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `supprim\u00E9 le montant maximum de ${oldAmount} de la cat\u00E9gorie "${categoryName}"`;
            }
            return `a chang\u00E9 le montant maximum de la cat\u00E9gorie "${categoryName}" \u00E0 ${newAmount} (pr\u00E9c\u00E9demment ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `ajout\u00E9 un type de limite de ${newValue} \u00E0 la cat\u00E9gorie "${categoryName}"`;
            }
            return `a chang\u00E9 le type de limite de la cat\u00E9gorie "${categoryName}" \u00E0 ${newValue} (auparavant ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `a mis \u00E0 jour la cat\u00E9gorie "${categoryName}" en changeant Re\u00E7us en ${newValue}`;
            }
            return `a chang\u00E9 la cat\u00E9gorie "${categoryName}" \u00E0 ${newValue} (pr\u00E9c\u00E9demment ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `a renomm\u00E9 la cat\u00E9gorie "${oldName}" en "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `a supprim\u00E9 l'indication de description "${oldValue}" de la cat\u00E9gorie "${categoryName}"`;
            }
            return !oldValue
                ? `a ajout\u00E9 l'indice de description "${newValue}" \u00E0 la cat\u00E9gorie "${categoryName}"`
                : `a chang\u00E9 l'indication de description de la cat\u00E9gorie "${categoryName}" en \u201C${newValue}\u201D (pr\u00E9c\u00E9demment \u201C${oldValue}\u201D)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `a chang\u00E9 le nom de la liste de tags en "${newName}" (auparavant "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `a ajout\u00E9 le tag "${tagName}" \u00E0 la liste "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `a mis \u00E0 jour la liste des \u00E9tiquettes "${tagListName}" en changeant l'\u00E9tiquette "${oldName}" en "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) =>
            `${enabled ? 'activ\u00E9' : 'd\u00E9sactiv\u00E9'} l'\u00E9tiquette "${tagName}" sur la liste "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `a supprim\u00E9 le tag "${tagName}" de la liste "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `supprim\u00E9 les balises "${count}" de la liste "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `mis \u00E0 jour le tag "${tagName}" dans la liste "${tagListName}" en changeant le ${updatedField} \u00E0 "${newValue}" (pr\u00E9c\u00E9demment "${oldValue}")`;
            }
            return `mis \u00E0 jour le tag "${tagName}" dans la liste "${tagListName}" en ajoutant un ${updatedField} de "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `a chang\u00E9 le ${customUnitName} ${updatedField} en "${newValue}" (auparavant "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Suivi fiscal ${newValue ? 'activ\u00E9' : 'd\u00E9sactiv\u00E9'} sur les taux de distance`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `a ajout\u00E9 un nouveau taux "${customUnitName}" "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `a modifi\u00E9 le taux de ${customUnitName} ${updatedField} "${customUnitRateName}" \u00E0 "${newValue}" (auparavant "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `a modifi\u00E9 le taux de taxe sur le taux de distance "${customUnitRateName}" \u00E0 "${newValue} (${newTaxPercentage})" (auparavant "${oldValue} (${oldTaxPercentage})")`;
            }
            return `a ajout\u00E9 le taux de taxe "${newValue} (${newTaxPercentage})" au taux de distance "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `a modifi\u00E9 la partie r\u00E9cup\u00E9rable de la taxe sur le taux de distance "${customUnitRateName}" \u00E0 "${newValue}" (pr\u00E9c\u00E9demment "${oldValue}")`;
            }
            return `ajout\u00E9 une portion r\u00E9cup\u00E9rable de taxe de "${newValue}" au taux de distance "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `supprim\u00E9 le taux "${rateName}" de "${customUnitName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `ajout\u00E9 le champ de rapport ${fieldType} "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `d\u00E9finir la valeur par d\u00E9faut du champ de rapport "${fieldName}" \u00E0 "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `ajout\u00E9 l'option "${optionName}" au champ de rapport "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `a supprim\u00E9 l'option "${optionName}" du champ de rapport "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'activ\u00E9' : 'd\u00E9sactiv\u00E9'} l'option "${optionName}" pour le champ de rapport "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'activ\u00E9' : 'd\u00E9sactiv\u00E9'} toutes les options pour le champ de rapport "${fieldName}"`;
            }
            return `${allEnabled ? 'activ\u00E9' : 'd\u00E9sactiv\u00E9'} l'option "${optionName}" pour le champ de rapport "${fieldName}", rendant toutes les options ${allEnabled ? 'activ\u00E9' : 'd\u00E9sactiv\u00E9'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `supprim\u00E9 le champ de rapport ${fieldType} "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `mis \u00E0 jour "Prevent self-approval" \u00E0 "${newValue === 'true' ? 'Activ\u00E9' : 'D\u00E9sactiv\u00E9'}" (pr\u00E9c\u00E9demment "${oldValue === 'true' ? 'Activ\u00E9' : 'D\u00E9sactiv\u00E9'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a modifi\u00E9 le montant maximum requis pour les d\u00E9penses avec re\u00E7u \u00E0 ${newValue} (auparavant ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a chang\u00E9 le montant maximum des d\u00E9penses pour les violations \u00E0 ${newValue} (pr\u00E9c\u00E9demment ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `mis \u00E0 jour "\u00C2ge maximum de la d\u00E9pense (jours)" \u00E0 "${newValue}" (pr\u00E9c\u00E9demment "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `d\u00E9finir la date de soumission du rapport mensuel sur "${newValue}"`;
            }
            return `a mis \u00E0 jour la date de soumission du rapport mensuel \u00E0 "${newValue}" (pr\u00E9c\u00E9demment "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `mis \u00E0 jour "Refacturer les d\u00E9penses aux clients" \u00E0 "${newValue}" (pr\u00E9c\u00E9demment "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `activ\u00E9 "Imposer les titres de rapport par d\u00E9faut" ${value ? 'sur' : 'd\u00E9sactiv\u00E9'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) =>
            `a mis \u00E0 jour le nom de cet espace de travail en "${newName}" (pr\u00E9c\u00E9demment "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `d\u00E9finir la description de cet espace de travail sur "${newDescription}"`
                : `a mis \u00E0 jour la description de cet espace de travail en "${newDescription}" (pr\u00E9c\u00E9demment "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('et');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `vous a retir\u00E9 du flux de travail d'approbation et du chat de d\u00E9penses de ${joinedNames}. Les rapports pr\u00E9c\u00E9demment soumis resteront disponibles pour approbation dans votre bo\u00EEte de r\u00E9ception.`,
                other: `vous a retir\u00E9 des flux de travail d'approbation et des discussions de d\u00E9penses de ${joinedNames}. Les rapports pr\u00E9c\u00E9demment soumis resteront disponibles pour approbation dans votre bo\u00EEte de r\u00E9ception.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `a mis \u00E0 jour votre r\u00F4le dans ${policyName} de ${oldRole} \u00E0 utilisateur. Vous avez \u00E9t\u00E9 retir\u00E9 de toutes les discussions de d\u00E9penses des soumissionnaires sauf la v\u00F4tre.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) =>
            `a mis \u00E0 jour la devise par d\u00E9faut en ${newCurrency} (pr\u00E9c\u00E9demment ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `a mis \u00E0 jour la fr\u00E9quence de rapport automatique \u00E0 "${newFrequency}" (pr\u00E9c\u00E9demment "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `a mis \u00E0 jour le mode d'approbation en "${newValue}" (auparavant "${oldValue}")`,
        upgradedWorkspace: 'a mis \u00E0 niveau cet espace de travail vers le plan Control',
        downgradedWorkspace: 'a r\u00E9trograd\u00E9 cet espace de travail au plan Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `a chang\u00E9 le taux de rapports achemin\u00E9s al\u00E9atoirement pour approbation manuelle \u00E0 ${Math.round(newAuditRate * 100)}% (pr\u00E9c\u00E9demment ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `a modifi\u00E9 la limite d'approbation manuelle pour toutes les d\u00E9penses \u00E0 ${newLimit} (auparavant ${oldLimit})`,
    },
    roomMembersPage: {
        memberNotFound: 'Membre non trouv\u00E9.',
        useInviteButton: "Pour inviter un nouveau membre \u00E0 la discussion, veuillez utiliser le bouton d'invitation ci-dessus.",
        notAuthorized: `Vous n'avez pas acc\u00E8s \u00E0 cette page. Si vous essayez de rejoindre cette salle, demandez simplement \u00E0 un membre de la salle de vous ajouter. Autre chose ? Contactez ${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `\u00CAtes-vous s\u00FBr de vouloir retirer ${memberName} de la salle ?`,
            other: '\u00CAtes-vous s\u00FBr de vouloir supprimer les membres s\u00E9lectionn\u00E9s de la salle ?',
        }),
        error: {
            genericAdd: "Un probl\u00E8me est survenu lors de l'ajout de ce membre \u00E0 la salle.",
        },
    },
    newTaskPage: {
        assignTask: 'Attribuer une t\u00E2che',
        assignMe: 'Assigner \u00E0 moi',
        confirmTask: 'Confirmer la t\u00E2che',
        confirmError: 'Veuillez entrer un titre et s\u00E9lectionner une destination de partage',
        descriptionOptional: 'Description (facultatif)',
        pleaseEnterTaskName: 'Veuillez entrer un titre',
        pleaseEnterTaskDestination: 'Veuillez s\u00E9lectionner o\u00F9 vous souhaitez partager cette t\u00E2che.',
    },
    task: {
        task: 'T\u00E2che',
        title: 'Titre',
        description: 'Description',
        assignee: 'Cessionnaire',
        completed: 'Termin\u00E9',
        action: 'Termin\u00E9',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `t\u00E2che pour ${title}`,
            completed: 'marqu\u00E9 comme termin\u00E9',
            canceled: 't\u00E2che supprim\u00E9e',
            reopened: 'marqu\u00E9 comme incomplet',
            error: "Vous n'avez pas la permission d'effectuer l'action demand\u00E9e.",
        },
        markAsComplete: 'Marquer comme termin\u00E9',
        markAsIncomplete: 'Marquer comme incomplet',
        assigneeError: "Une erreur s'est produite lors de l'attribution de cette t\u00E2che. Veuillez essayer un autre assign\u00E9.",
        genericCreateTaskFailureMessage: "Une erreur s'est produite lors de la cr\u00E9ation de cette t\u00E2che. Veuillez r\u00E9essayer plus tard.",
        deleteTask: 'Supprimer la t\u00E2che',
        deleteConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer cette t\u00E2che ?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Relev\u00E9 de ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Raccourcis clavier',
        subtitle: 'Gagnez du temps avec ces raccourcis clavier pratiques :',
        shortcuts: {
            openShortcutDialog: 'Ouvre la bo\u00EEte de dialogue des raccourcis clavier',
            markAllMessagesAsRead: 'Marquer tous les messages comme lus',
            escape: '\u00C9chapper aux dialogues',
            search: 'Ouvrir la bo\u00EEte de dialogue de recherche',
            newChat: 'Nouvel \u00E9cran de chat',
            copy: 'Copier le commentaire',
            openDebug: 'Ouvrir la bo\u00EEte de dialogue des pr\u00E9f\u00E9rences de test',
        },
    },
    guides: {
        screenShare: "Partage d'\u00E9cran",
        screenShareRequest: "Expensify vous invite \u00E0 un partage d'\u00E9cran",
    },
    search: {
        resultsAreLimited: 'Les r\u00E9sultats de recherche sont limit\u00E9s.',
        viewResults: 'Voir les r\u00E9sultats',
        resetFilters: 'R\u00E9initialiser les filtres',
        searchResults: {
            emptyResults: {
                title: 'Rien \u00E0 afficher',
                subtitle: "Essayez d'ajuster vos crit\u00E8res de recherche ou de cr\u00E9er quelque chose avec le bouton vert +.",
            },
            emptyExpenseResults: {
                title: "Vous n'avez pas encore cr\u00E9\u00E9 de d\u00E9penses.",
                subtitle: "Cr\u00E9ez une d\u00E9pense ou faites un essai d'Expensify pour en savoir plus.",
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour cr\u00E9er une d\u00E9pense.',
            },
            emptyReportResults: {
                title: "Vous n'avez pas encore cr\u00E9\u00E9 de rapports.",
                subtitle: "Cr\u00E9ez un rapport ou faites un essai d'Expensify pour en savoir plus.",
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour cr\u00E9er un rapport.',
            },
            emptyInvoiceResults: {
                title: "Vous n'avez pas encore cr\u00E9\u00E9 de factures.",
                subtitle: "Envoyez une facture ou faites un essai d'Expensify pour en savoir plus.",
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour envoyer une facture.',
            },
            emptyTripResults: {
                title: 'Aucun voyage \u00E0 afficher',
                subtitle: 'Commencez en r\u00E9servant votre premier voyage ci-dessous.',
                buttonText: 'R\u00E9server un voyage',
            },
            emptySubmitResults: {
                title: 'Aucune d\u00E9pense \u00E0 soumettre',
                subtitle: 'Tout est en ordre. Faites un tour de victoire !',
                buttonText: 'Cr\u00E9er un rapport',
            },
            emptyApproveResults: {
                title: 'Aucune d\u00E9pense \u00E0 approuver',
                subtitle: 'Z\u00E9ro d\u00E9penses. Maximum d\u00E9tente. Bien jou\u00E9 !',
            },
            emptyPayResults: {
                title: 'Aucune d\u00E9pense \u00E0 payer',
                subtitle: "F\u00E9licitations ! Vous avez franchi la ligne d'arriv\u00E9e.",
            },
            emptyExportResults: {
                title: 'Aucune d\u00E9pense \u00E0 exporter',
                subtitle: 'Il est temps de se d\u00E9tendre, beau travail.',
            },
        },
        saveSearch: 'Enregistrer la recherche',
        deleteSavedSearch: 'Supprimer la recherche enregistr\u00E9e',
        deleteSavedSearchConfirm: '\u00CAtes-vous s\u00FBr de vouloir supprimer cette recherche ?',
        searchName: 'Rechercher un nom',
        savedSearchesMenuItemTitle: 'Enregistr\u00E9',
        groupedExpenses: 'd\u00E9penses group\u00E9es',
        bulkActions: {
            approve: 'Approuver',
            pay: 'Payer',
            delete: 'Supprimer',
            hold: 'Attente',
            unhold: 'Supprimer la suspension',
            noOptionsAvailable: 'Aucune option disponible pour le groupe de d\u00E9penses s\u00E9lectionn\u00E9.',
        },
        filtersHeader: 'Filtres',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Avant ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Apr\u00E8s ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
            },
            status: 'Statut',
            keyword: 'Mot-cl\u00E9',
            hasKeywords: 'A des mots-cl\u00E9s',
            currency: 'Devise',
            link: 'Lien',
            pinned: '\u00C9pingl\u00E9',
            unread: 'Non lu',
            completed: 'Termin\u00E9',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Moins de ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Sup\u00E9rieur \u00E0 ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Entre ${greaterThan} et ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Cartes individuelles',
                closedCards: 'Cartes ferm\u00E9es',
                cardFeeds: 'Flux de cartes',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Tout ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Toutes les cartes import\u00E9es CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Actuel',
            past: 'Pass\u00E9',
            submitted: 'Date de soumission',
            approved: 'Date approuv\u00E9e',
            paid: 'Date de paiement',
            exported: 'Date export\u00E9e',
            posted: 'Date de publication',
            billable: 'Facturable',
            reimbursable: 'Remboursable',
        },
        moneyRequestReport: {
            emptyStateTitle: "Ce rapport n'a aucune d\u00E9pense.",
            emptyStateSubtitle: 'Vous pouvez ajouter des d\u00E9penses \u00E0 ce rapport en utilisant le bouton ci-dessus.',
        },
        noCategory: 'Aucune cat\u00E9gorie',
        noTag: 'Pas de balise',
        expenseType: 'Type de d\u00E9pense',
        recentSearches: 'Recherches r\u00E9centes',
        recentChats: 'Discussions r\u00E9centes',
        searchIn: 'Rechercher dans',
        searchPlaceholder: 'Rechercher quelque chose',
        suggestions: 'Suggestions',
        exportSearchResults: {
            title: 'Cr\u00E9er une exportation',
            description: "Whoa, \u00E7a fait beaucoup d'articles ! Nous allons les regrouper, et Concierge vous enverra un fichier sous peu.",
        },
        exportAll: {
            selectAllMatchingItems: 'S\u00E9lectionnez tous les \u00E9l\u00E9ments correspondants',
            allMatchingItemsSelected: 'Tous les \u00E9l\u00E9ments correspondants s\u00E9lectionn\u00E9s',
        },
    },
    genericErrorPage: {
        title: "Oh-oh, quelque chose s'est mal pass\u00E9 !",
        body: {
            helpTextMobile: "Veuillez fermer et rouvrir l'application, ou passer \u00E0",
            helpTextWeb: 'web.',
            helpTextConcierge: 'Si le probl\u00E8me persiste, contactez',
        },
        refresh: 'Rafra\u00EEchir',
    },
    fileDownload: {
        success: {
            title: 'T\u00E9l\u00E9charg\u00E9 !',
            message: 'Pi\u00E8ce jointe t\u00E9l\u00E9charg\u00E9e avec succ\u00E8s !',
            qrMessage:
                'V\u00E9rifiez votre dossier de photos ou de t\u00E9l\u00E9chargements pour une copie de votre code QR. Astuce : Ajoutez-le \u00E0 une pr\u00E9sentation pour que votre audience puisse le scanner et se connecter directement avec vous.',
        },
        generalError: {
            title: 'Erreur de pi\u00E8ce jointe',
            message: 'La pi\u00E8ce jointe ne peut pas \u00EAtre t\u00E9l\u00E9charg\u00E9e',
        },
        permissionError: {
            title: 'Acc\u00E8s au stockage',
            message: 'Expensify ne peut pas enregistrer les pi\u00E8ces jointes sans acc\u00E8s au stockage. Appuyez sur param\u00E8tres pour mettre \u00E0 jour les autorisations.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nouveau Expensify',
        about: '\u00C0 propos de New Expensify',
        update: 'Mettre \u00E0 jour New Expensify',
        checkForUpdates: 'V\u00E9rifier les mises \u00E0 jour',
        toggleDevTools: 'Basculer les outils de d\u00E9veloppement',
        viewShortcuts: 'Voir les raccourcis clavier',
        services: 'Services',
        hide: 'Masquer New Expensify',
        hideOthers: 'Masquer les autres',
        showAll: 'Afficher tout',
        quit: 'Quitter New Expensify',
        fileMenu: 'Fichier',
        closeWindow: 'Fermer la fen\u00EAtre',
        editMenu: 'Modifier',
        undo: 'Annuler',
        redo: 'Refaire',
        cut: 'Couper',
        copy: 'Copier',
        paste: 'Coller',
        pasteAndMatchStyle: 'Coller et adapter le style',
        pasteAsPlainText: 'Coller en texte brut',
        delete: 'Supprimer',
        selectAll: 'Tout s\u00E9lectionner',
        speechSubmenu: 'Discours',
        startSpeaking: 'Commencer \u00E0 parler',
        stopSpeaking: 'Arr\u00EAte de parler',
        viewMenu: 'Voir',
        reload: 'Recharger',
        forceReload: 'Recharger de force',
        resetZoom: 'Taille r\u00E9elle',
        zoomIn: 'Zoomer',
        zoomOut: 'D\u00E9zoomer',
        togglefullscreen: 'Basculer en plein \u00E9cran',
        historyMenu: 'Historique',
        back: 'Retour',
        forward: 'Transf\u00E9rer',
        windowMenu: 'Fen\u00EAtre',
        minimize: 'Minimiser',
        zoom: 'Zoom',
        front: 'Tout amener au premier plan',
        helpMenu: 'Aide',
        learnMore: 'En savoir plus',
        documentation: 'Documentation',
        communityDiscussions: 'Discussions Communautaires',
        searchIssues: 'Rechercher des probl\u00E8mes',
    },
    historyMenu: {
        forward: 'Transf\u00E9rer',
        back: 'Retour',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Mise \u00E0 jour disponible',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `La nouvelle version sera disponible sous peu.${!isSilentUpdating ? 'Nous vous informerons lorsque nous serons pr\u00EAts \u00E0 mettre \u00E0 jour.' : ''}`,
            soundsGood: '\u00C7a marche',
        },
        notAvailable: {
            title: 'Mise \u00E0 jour indisponible',
            message: "Aucune mise \u00E0 jour n'est disponible pour le moment. Veuillez v\u00E9rifier plus tard !",
            okay: "D'accord",
        },
        error: {
            title: '\u00C9chec de la v\u00E9rification de mise \u00E0 jour',
            message: "Nous n'avons pas pu v\u00E9rifier la mise \u00E0 jour. Veuillez r\u00E9essayer dans un moment.",
        },
    },
    report: {
        newReport: {
            createReport: 'Cr\u00E9er un rapport',
            chooseWorkspace: 'Choisissez un espace de travail pour ce rapport.',
        },
        genericCreateReportFailureMessage: 'Erreur inattendue lors de la cr\u00E9ation de ce chat. Veuillez r\u00E9essayer plus tard.',
        genericAddCommentFailureMessage: 'Erreur inattendue lors de la publication du commentaire. Veuillez r\u00E9essayer plus tard.',
        genericUpdateReportFieldFailureMessage: 'Erreur inattendue lors de la mise \u00E0 jour du champ. Veuillez r\u00E9essayer plus tard.',
        genericUpdateReportNameEditFailureMessage: 'Erreur inattendue lors du renommage du rapport. Veuillez r\u00E9essayer plus tard.',
        noActivityYet: 'Aucune activit\u00E9 pour le moment',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `modifi\u00E9 ${fieldName} de ${oldValue} \u00E0 ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `chang\u00E9 ${fieldName} \u00E0 ${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `a chang\u00E9 l'espace de travail en ${toPolicyName}${fromPolicyName ? `(pr\u00E9c\u00E9demment ${fromPolicyName})` : ''}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `chang\u00E9 le type de ${oldType} \u00E0 ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `envoy\u00E9 ce rapport \u00E0 ${delegateUser} puisque ${originalManager} est en vacances`,
                exportedToCSV: `export\u00E9 en CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `export\u00E9 vers ${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `export\u00E9 vers ${label} via`,
                    automaticActionTwo: 'param\u00E8tres de comptabilit\u00E9',
                    manual: ({label}: ExportedToIntegrationParams) => `a marqu\u00E9 ce rapport comme export\u00E9 manuellement vers ${label}.`,
                    automaticActionThree: 'et a cr\u00E9\u00E9 avec succ\u00E8s un enregistrement pour',
                    reimburseableLink: 'd\u00E9penses personnelles',
                    nonReimbursableLink: "d\u00E9penses de carte d'entreprise",
                    pending: ({label}: ExportedToIntegrationParams) => `a commenc\u00E9 \u00E0 exporter ce rapport vers ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `\u00E9chec de l'exportation de ce rapport vers ${label} ("${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `ajout\u00E9 un re\u00E7u`,
                managerDetachReceipt: `a supprim\u00E9 un re\u00E7u`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `pay\u00E9 ${currency}${amount} ailleurs`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `pay\u00E9 ${currency}${amount} via int\u00E9gration`,
                outdatedBankAccount: `impossible de traiter le paiement en raison d'un probl\u00E8me avec le compte bancaire du payeur`,
                reimbursementACHBounce: `impossible de traiter le paiement, car le payeur n'a pas suffisamment de fonds`,
                reimbursementACHCancelled: `annul\u00E9 le paiement`,
                reimbursementAccountChanged: `Impossible de traiter le paiement, car le payeur a chang\u00E9 de compte bancaire.`,
                reimbursementDelayed: `a trait\u00E9 le paiement mais il est retard\u00E9 de 1 \u00E0 2 jours ouvrables suppl\u00E9mentaires`,
                selectedForRandomAudit: `s\u00E9lectionn\u00E9 au hasard pour r\u00E9vision`,
                selectedForRandomAuditMarkdown: `[s\u00E9lectionn\u00E9 au hasard](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) pour r\u00E9vision`,
                share: ({to}: ShareParams) => `membre invit\u00E9 ${to}`,
                unshare: ({to}: UnshareParams) => `membre supprim\u00E9 ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `pay\u00E9 ${currency}${amount}`,
                takeControl: `a pris le contr\u00F4le`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `\u00E9chec de la synchronisation avec ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `ajout\u00E9 ${email} en tant que ${role === 'member' ? 'a' : 'an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `mis \u00E0 jour le r\u00F4le de ${email} \u00E0 ${newRole} (pr\u00E9c\u00E9demment ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `supprim\u00E9 le champ personnalis\u00E9 1 de ${email} (pr\u00E9c\u00E9demment "${previousValue}")`;
                    }
                    return !previousValue
                        ? `ajout\u00E9 "${newValue}" au champ personnalis\u00E9 1 de ${email}`
                        : `a chang\u00E9 le champ personnalis\u00E9 1 de ${email} en "${newValue}" (pr\u00E9c\u00E9demment "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `supprim\u00E9 le champ personnalis\u00E9 2 de ${email} (pr\u00E9c\u00E9demment "${previousValue}")`;
                    }
                    return !previousValue
                        ? `ajout\u00E9 "${newValue}" au champ personnalis\u00E9 2 de ${email}`
                        : `a chang\u00E9 le champ personnalis\u00E9 2 de ${email} en "${newValue}" (pr\u00E9c\u00E9demment "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} a quitt\u00E9 l'espace de travail`,
                removeMember: ({email, role}: AddEmployeeParams) => `supprim\u00E9 ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `connexion supprim\u00E9e \u00E0 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `connect\u00E9 \u00E0 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'a quitt\u00E9 le chat',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} pour ${dayCount} ${dayCount === 1 ? 'jour' : 'jours'} jusqu'\u00E0 ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} de ${timePeriod} le ${date}`,
    },
    footer: {
        features: 'Fonctionnalit\u00E9s',
        expenseManagement: 'Gestion des d\u00E9penses',
        spendManagement: 'Gestion des d\u00E9penses',
        expenseReports: 'Rapports de frais',
        companyCreditCard: "Carte de cr\u00E9dit d'entreprise",
        receiptScanningApp: 'Application de num\u00E9risation de re\u00E7us',
        billPay: 'Bill Pay',
        invoicing: 'Facturation',
        CPACard: 'Carte CPA',
        payroll: 'Paie',
        travel: 'Voyage',
        resources: 'Ressources',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Kit de presse',
        support: 'Assistance',
        expensifyHelp: 'ExpensifyHelp',
        terms: "Conditions d'utilisation",
        privacy: 'Confidentialit\u00E9',
        learnMore: 'En savoir plus',
        aboutExpensify: "\u00C0 propos d'Expensify",
        blog: 'Blog',
        jobs: 'Emplois',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relations avec les investisseurs',
        getStarted: 'Commencer',
        createAccount: 'Cr\u00E9er un nouveau compte',
        logIn: 'Se connecter',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Revenir \u00E0 la liste des discussions',
        chatWelcomeMessage: 'Message de bienvenue du chat',
        navigatesToChat: 'Navigue vers une discussion',
        newMessageLineIndicator: 'Indicateur de nouvelle ligne de message',
        chatMessage: 'Message de chat',
        lastChatMessagePreview: 'Aper\u00E7u du dernier message de chat',
        workspaceName: "Nom de l'espace de travail",
        chatUserDisplayNames: "Noms d'affichage des membres du chat",
        scrollToNewestMessages: "Faites d\u00E9filer jusqu'aux messages les plus r\u00E9cents",
        preStyledText: 'Texte pr\u00E9-styl\u00E9',
        viewAttachment: 'Voir la pi\u00E8ce jointe',
    },
    parentReportAction: {
        deletedReport: 'Rapport supprim\u00E9',
        deletedMessage: 'Message supprim\u00E9',
        deletedExpense: 'D\u00E9pense supprim\u00E9e',
        reversedTransaction: 'Transaction invers\u00E9e',
        deletedTask: 'T\u00E2che supprim\u00E9e',
        hiddenMessage: 'Message cach\u00E9',
    },
    threads: {
        thread: 'Fil de discussion',
        replies: 'R\u00E9ponses',
        reply: 'R\u00E9pondre',
        from: 'De',
        in: 'dans',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `De ${reportName}${workspaceName ? `dans ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: "Copier l'URL",
        copied: 'Copi\u00E9 !',
    },
    moderation: {
        flagDescription: 'Tous les messages signal\u00E9s seront envoy\u00E9s \u00E0 un mod\u00E9rateur pour examen.',
        chooseAReason: 'Choisissez une raison pour signaler ci-dessous :',
        spam: 'Spam',
        spamDescription: 'Promotion hors sujet non sollicit\u00E9e',
        inconsiderate: 'Inconsid\u00E9r\u00E9',
        inconsiderateDescription: 'Phras\u00E9ologie insultante ou irrespectueuse, avec des intentions douteuses',
        intimidation: 'Intimidation',
        intimidationDescription: 'Poursuivre agressivement un programme malgr\u00E9 des objections valides',
        bullying: 'Harc\u00E8lement',
        bullyingDescription: 'Cibler un individu pour obtenir son ob\u00E9issance',
        harassment: 'Harc\u00E8lement',
        harassmentDescription: 'Comportement raciste, misogyne ou autre comportement largement discriminatoire',
        assault: 'Agression',
        assaultDescription: "Attaque \u00E9motionnelle sp\u00E9cifiquement cibl\u00E9e avec l'intention de nuire",
        flaggedContent: 'Ce message a \u00E9t\u00E9 signal\u00E9 comme enfreignant nos r\u00E8gles communautaires et le contenu a \u00E9t\u00E9 masqu\u00E9.',
        hideMessage: 'Masquer le message',
        revealMessage: 'R\u00E9v\u00E9ler le message',
        levelOneResult: 'Envoie un avertissement anonyme et le message est signal\u00E9 pour examen.',
        levelTwoResult: 'Message masqu\u00E9 du canal, avec avertissement anonyme et le message est signal\u00E9 pour examen.',
        levelThreeResult: 'Message supprim\u00E9 du canal plus avertissement anonyme et le message est signal\u00E9 pour examen.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Invitez-les',
        nothing: 'Ne rien faire',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accepter',
        decline: 'Refuser',
    },
    actionableMentionTrackExpense: {
        submit: "Soumettez-le \u00E0 quelqu'un",
        categorize: 'Cat\u00E9gorisez-le',
        share: 'Partager avec mon comptable',
        nothing: "Rien pour l'instant",
    },
    teachersUnitePage: {
        teachersUnite: 'Teachers Unite',
        joinExpensifyOrg:
            'Rejoignez Expensify.org pour \u00E9liminer l\'injustice dans le monde entier. La campagne actuelle "Teachers Unite" soutient les \u00E9ducateurs partout en partageant les co\u00FBts des fournitures scolaires essentielles.',
        iKnowATeacher: 'Je connais un enseignant',
        iAmATeacher: 'Je suis enseignant(e)',
        getInTouch: 'Excellent ! Veuillez partager leurs informations afin que nous puissions les contacter.',
        introSchoolPrincipal: "Pr\u00E9sentation \u00E0 votre directeur d'\u00E9cole",
        schoolPrincipalVerifyExpense:
            "Expensify.org partage le co\u00FBt des fournitures scolaires essentielles afin que les \u00E9l\u00E8ves de m\u00E9nages \u00E0 faible revenu puissent avoir une meilleure exp\u00E9rience d'apprentissage. Votre principal sera invit\u00E9 \u00E0 v\u00E9rifier vos d\u00E9penses.",
        principalFirstName: 'Pr\u00E9nom du principal',
        principalLastName: 'Nom de famille du principal',
        principalWorkEmail: 'Email professionnel principal',
        updateYourEmail: 'Mettre \u00E0 jour votre adresse e-mail',
        updateEmail: "Mettre \u00E0 jour l'adresse e-mail",
        contactMethods: 'M\u00E9thodes de contact.',
        schoolMailAsDefault:
            'Avant de continuer, veuillez vous assurer de d\u00E9finir votre e-mail scolaire comme m\u00E9thode de contact par d\u00E9faut. Vous pouvez le faire dans Param\u00E8tres > Profil >',
        error: {
            enterPhoneEmail: 'Entrez un e-mail ou un num\u00E9ro de t\u00E9l\u00E9phone valide',
            enterEmail: 'Entrez un e-mail',
            enterValidEmail: 'Entrez une adresse e-mail valide',
            tryDifferentEmail: 'Veuillez essayer un autre e-mail',
        },
    },
    cardTransactions: {
        notActivated: 'Non activ\u00E9',
        outOfPocket: 'D\u00E9penses personnelles',
        companySpend: "D\u00E9penses de l'entreprise",
    },
    distance: {
        addStop: 'Ajouter un arr\u00EAt',
        deleteWaypoint: 'Supprimer le point de passage',
        deleteWaypointConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce point de passage ?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Commencer',
            stop: 'Arr\u00EAter',
        },
        mapPending: {
            title: 'Carte en attente',
            subtitle: 'La carte sera g\u00E9n\u00E9r\u00E9e lorsque vous serez de nouveau en ligne.',
            onlineSubtitle: 'Un instant pendant que nous configurons la carte',
            errorTitle: 'Erreur de carte',
            errorSubtitle: "Une erreur s'est produite lors du chargement de la carte. Veuillez r\u00E9essayer.",
        },
        error: {
            selectSuggestedAddress: 'Veuillez s\u00E9lectionner une adresse sugg\u00E9r\u00E9e ou utiliser la localisation actuelle',
        },
    },
    reportCardLostOrDamaged: {
        report: "Signaler la perte / l'endommagement de la carte physique",
        screenTitle: 'Bulletin perdu ou endommag\u00E9',
        nextButtonLabel: 'Suivant',
        reasonTitle: "Pourquoi avez-vous besoin d'une nouvelle carte ?",
        cardDamaged: 'Ma carte a \u00E9t\u00E9 endommag\u00E9e',
        cardLostOrStolen: 'Ma carte a \u00E9t\u00E9 perdue ou vol\u00E9e',
        confirmAddressTitle: "Veuillez confirmer l'adresse postale pour votre nouvelle carte.",
        cardDamagedInfo: "Votre nouvelle carte arrivera dans 2-3 jours ouvrables. Votre carte actuelle continuera de fonctionner jusqu'\u00E0 ce que vous activiez la nouvelle.",
        cardLostOrStolenInfo:
            'Votre carte actuelle sera d\u00E9finitivement d\u00E9sactiv\u00E9e d\u00E8s que votre commande sera pass\u00E9e. La plupart des cartes arrivent en quelques jours ouvrables.',
        address: 'Adresse',
        deactivateCardButton: 'D\u00E9sactiver la carte',
        shipNewCardButton: 'Exp\u00E9dier une nouvelle carte',
        addressError: "L'adresse est requise",
        reasonError: 'La raison est requise',
    },
    eReceipt: {
        guaranteed: 'eRe\u00E7u garanti',
        transactionDate: 'Date de transaction',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'D\u00E9marrer une discussion,',
            buttonText2: 'parrainez un ami.',
            header: 'D\u00E9marrer une discussion, recommander un ami',
            body: 'Vous voulez que vos amis utilisent aussi Expensify ? Commencez simplement une discussion avec eux et nous nous occuperons du reste.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Soumettre une d\u00E9pense,',
            buttonText2: 'parrainez votre patron.',
            header: 'Soumettez une d\u00E9pense, parrainez votre patron',
            body: 'Vous voulez que votre patron utilise Expensify aussi ? Soumettez-lui simplement une d\u00E9pense et nous nous occuperons du reste.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Parrainez un ami',
            body: "Vous voulez que vos amis utilisent Expensify aussi ? Discutez, payez ou partagez une d\u00E9pense avec eux et nous nous occupons du reste. Ou partagez simplement votre lien d'invitation !",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Parrainez un ami',
            header: 'Parrainez un ami',
            body: "Vous voulez que vos amis utilisent Expensify aussi ? Discutez, payez ou partagez une d\u00E9pense avec eux et nous nous occupons du reste. Ou partagez simplement votre lien d'invitation !",
        },
        copyReferralLink: "Copier le lien d'invitation",
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Discutez avec votre sp\u00E9cialiste de configuration en',
            phrase2: "pour obtenir de l'aide",
        },
        default: {
            phrase1: 'Message',
            phrase2: "pour obtenir de l'aide avec la configuration",
        },
    },
    violations: {
        allTagLevelsRequired: 'Tous les tags requis',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) =>
            `${rejectedBy} a rejet\u00E9 cette d\u00E9pense avec le commentaire "${rejectReason}"`,
        billableExpense: "Facturable n'est plus valide",
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Re\u00E7u requis${formattedLimit ? `au-dessus de ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Cat\u00E9gorie non valide',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Appliqu\u00E9 une surcharge de conversion de ${surcharge}%`,
        customUnitOutOfPolicy: 'Tarif non valide pour cet espace de travail',
        duplicatedTransaction: 'Dupliquer',
        fieldRequired: 'Les champs du rapport sont obligatoires.',
        futureDate: 'Date future non autoris\u00E9e',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Major\u00E9 de ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Date ant\u00E9rieure \u00E0 ${maxAge} jours`,
        missingCategory: 'Cat\u00E9gorie manquante',
        missingComment: 'Description requise pour la cat\u00E9gorie s\u00E9lectionn\u00E9e',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Manquant ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Le montant diff\u00E8re de la distance calcul\u00E9e';
                case 'card':
                    return 'Montant sup\u00E9rieur \u00E0 la transaction par carte';
                default:
                    if (displayPercentVariance) {
                        return `Montant ${displayPercentVariance}% sup\u00E9rieur au re\u00E7u scann\u00E9`;
                    }
                    return 'Montant sup\u00E9rieur au re\u00E7u scann\u00E9';
            }
        },
        modifiedDate: 'La date diff\u00E8re du re\u00E7u scann\u00E9',
        nonExpensiworksExpense: 'D\u00E9pense non-Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `La d\u00E9pense d\u00E9passe la limite d'approbation automatique de ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Montant d\u00E9passant la limite de cat\u00E9gorie de ${formattedLimit}/personne`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Montant au-del\u00E0 de la limite de ${formattedLimit}/personne`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Montant au-del\u00E0 de la limite de ${formattedLimit}/personne`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Montant d\u00E9passant la limite quotidienne de ${formattedLimit}/personne pour la cat\u00E9gorie`,
        receiptNotSmartScanned:
            'D\u00E9tails de la d\u00E9pense et re\u00E7u ajout\u00E9s manuellement. Veuillez v\u00E9rifier les d\u00E9tails. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">En savoir plus</a> sur la v\u00E9rification automatique de tous les re\u00E7us.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = 'Re\u00E7u requis';
            if (formattedLimit ?? category) {
                message += 'over';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += 'limite de cat\u00E9gorie';
                }
            }
            return message;
        },
        prohibitedExpense: ({prohibitedExpenseType}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'D\u00E9pense interdite :';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return `${preMessage} alcool`;
                case 'gambling':
                    return `${preMessage} jeux d'argent`;
                case 'tobacco':
                    return `${preMessage} tabac`;
                case 'adultEntertainment':
                    return `${preMessage} divertissement pour adultes`;
                case 'hotelIncidentals':
                    return `${preMessage} frais accessoires d'h\u00F4tel`;
                default:
                    return `${preMessage}${prohibitedExpenseType}`;
            }
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: 'R\u00E9vision requise',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return '';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `Impossible de faire correspondre automatiquement le re\u00E7u en raison d'une connexion bancaire d\u00E9fectueuse que ${email} doit r\u00E9parer.`
                    : "Impossible de faire correspondre automatiquement le re\u00E7u en raison d'une connexion bancaire d\u00E9faillante que vous devez r\u00E9parer.";
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Demandez \u00E0 ${member} de marquer comme esp\u00E8ce ou attendez 7 jours et r\u00E9essayez` : 'En attente de fusion avec la transaction par carte.';
            }
            return '';
        },
        brokenConnection530Error: "Re\u00E7u en attente en raison d'une connexion bancaire d\u00E9faillante",
        adminBrokenConnectionError: "Re\u00E7u en attente en raison d'une connexion bancaire interrompue. Veuillez r\u00E9soudre dans",
        memberBrokenConnectionError:
            "Re\u00E7u en attente en raison d'une connexion bancaire d\u00E9faillante. Veuillez demander \u00E0 un administrateur de l'espace de travail de r\u00E9soudre le probl\u00E8me.",
        markAsCashToIgnore: 'Marquer comme esp\u00E8ce pour ignorer et demander un paiement.',
        smartscanFailed: ({canEdit = true}) => `\u00C9chec de la num\u00E9risation du re\u00E7u.${canEdit ? 'Saisir les d\u00E9tails manuellement.' : ''}`,
        receiptGeneratedWithAI: 'Re\u00E7u potentiellement g\u00E9n\u00E9r\u00E9 par IA',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Missing ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} n'est plus valide`,
        taxAmountChanged: 'Le montant de la taxe a \u00E9t\u00E9 modifi\u00E9',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Taxe'} n'est plus valide`,
        taxRateChanged: 'Le taux de taxe a \u00E9t\u00E9 modifi\u00E9',
        taxRequired: 'Taux de taxe manquant',
        none: 'Aucun',
        taxCodeToKeep: 'Choisissez quel code fiscal conserver',
        tagToKeep: 'Choisissez quelle balise conserver',
        isTransactionReimbursable: 'Choisissez si la transaction est remboursable',
        merchantToKeep: 'Choisissez quel commer\u00E7ant conserver',
        descriptionToKeep: 'Choisissez quelle description conserver',
        categoryToKeep: 'Choisissez quelle cat\u00E9gorie conserver',
        isTransactionBillable: 'Choisir si la transaction est facturable',
        keepThisOne: 'Garde celui-ci',
        confirmDetails: `Confirmez les d\u00E9tails que vous conservez`,
        confirmDuplicatesInfo: `Les demandes en double que vous ne conservez pas seront conserv\u00E9es pour que le membre puisse les supprimer.`,
        hold: 'Cette d\u00E9pense a \u00E9t\u00E9 mise en attente',
        resolvedDuplicates: 'r\u00E9solu le doublon',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} est requis`,
    },
    violationDismissal: {
        rter: {
            manual: 'a marqu\u00E9 ce re\u00E7u comme esp\u00E8ces',
        },
        duplicatedTransaction: {
            manual: 'r\u00E9solu le doublon',
        },
    },
    videoPlayer: {
        play: 'Jouer',
        pause: 'Pause',
        fullscreen: 'Plein \u00E9cran',
        playbackSpeed: 'Vitesse de lecture',
        expand: 'D\u00E9velopper',
        mute: 'Muet',
        unmute: 'R\u00E9activer le son',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Avant de partir',
        reasonPage: {
            title: 'Veuillez nous dire pourquoi vous partez',
            subtitle: 'Avant de partir, veuillez nous dire pourquoi vous souhaitez passer \u00E0 Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "J'ai besoin d'une fonctionnalit\u00E9 qui n'est disponible que dans Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Je ne comprends pas comment utiliser New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Je comprends comment utiliser New Expensify, mais je pr\u00E9f\u00E8re Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "Quelle fonctionnalit\u00E9 avez-vous besoin qui n'est pas disponible dans New Expensify ?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Que cherchez-vous \u00E0 faire ?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Pourquoi pr\u00E9f\u00E9rez-vous Expensify Classic ?',
        },
        responsePlaceholder: 'Votre r\u00E9ponse',
        thankYou: 'Merci pour le retour !',
        thankYouSubtitle: 'Vos r\u00E9ponses nous aideront \u00E0 cr\u00E9er un meilleur produit pour accomplir les t\u00E2ches. Merci beaucoup !',
        goToExpensifyClassic: 'Passer \u00E0 Expensify Classic',
        offlineTitle: 'On dirait que vous \u00EAtes coinc\u00E9 ici...',
        offline:
            'Il semble que vous soyez hors ligne. Malheureusement, Expensify Classic ne fonctionne pas hors ligne, mais le nouveau Expensify le fait. Si vous pr\u00E9f\u00E9rez utiliser Expensify Classic, r\u00E9essayez lorsque vous aurez une connexion Internet.',
        quickTip: 'Astuce rapide...',
        quickTipSubTitle: 'Vous pouvez acc\u00E9der directement \u00E0 Expensify Classic en visitant expensify.com. Ajoutez-le \u00E0 vos favoris pour un acc\u00E8s rapide !',
        bookACall: 'R\u00E9server un appel',
        noThanks: 'Non merci',
        bookACallTitle: 'Souhaitez-vous parler \u00E0 un chef de produit ?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Discussion directe sur les d\u00E9penses et les rapports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Possibilit\u00E9 de tout faire sur mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Voyage et d\u00E9penses \u00E0 la vitesse de la conversation',
        },
        bookACallTextTop: 'En passant \u00E0 Expensify Classic, vous manquerez :',
        bookACallTextBottom:
            "Nous serions ravis de vous appeler pour comprendre pourquoi. Vous pouvez planifier un appel avec l'un de nos chefs de produit senior pour discuter de vos besoins.",
        takeMeToExpensifyClassic: 'Emmenez-moi \u00E0 Expensify Classic',
    },
    listBoundary: {
        errorMessage: "Une erreur s'est produite lors du chargement de plus de messages",
        tryAgain: 'R\u00E9essayer',
    },
    systemMessage: {
        mergedWithCashTransaction: 'a associ\u00E9 un re\u00E7u \u00E0 cette transaction',
    },
    subscription: {
        authenticatePaymentCard: 'Authentifier la carte de paiement',
        mobileReducedFunctionalityMessage: "Vous ne pouvez pas apporter de modifications \u00E0 votre abonnement dans l'application mobile.",
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Essai gratuit : ${numOfDays} ${numOfDays === 1 ? 'jour' : 'jours'} restants`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Vos informations de paiement sont obsol\u00E8tes',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Mettez \u00E0 jour votre carte de paiement avant le ${date} pour continuer \u00E0 utiliser toutes vos fonctionnalit\u00E9s pr\u00E9f\u00E9r\u00E9es.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: "Votre paiement n'a pas pu \u00EAtre trait\u00E9",
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Votre pr\u00E9l\u00E8vement du ${date} de ${purchaseAmountOwed} n'a pas pu \u00EAtre trait\u00E9. Veuillez ajouter une carte de paiement pour r\u00E9gler le montant d\u00FB.`
                        : 'Veuillez ajouter une carte de paiement pour r\u00E9gler le montant d\u00FB.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Vos informations de paiement sont obsol\u00E8tes',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Votre paiement est en retard. Veuillez r\u00E9gler votre facture avant le ${date} pour \u00E9viter une interruption de service.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Vos informations de paiement sont obsol\u00E8tes',
                subtitle: 'Votre paiement est en retard. Veuillez r\u00E9gler votre facture.',
            },
            billingDisputePending: {
                title: "Votre carte n'a pas pu \u00EAtre d\u00E9bit\u00E9e",
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Vous avez contest\u00E9 le pr\u00E9l\u00E8vement de ${amountOwed} sur la carte se terminant par ${cardEnding}. Votre compte sera verrouill\u00E9 jusqu'\u00E0 ce que le litige soit r\u00E9solu avec votre banque.`,
            },
            cardAuthenticationRequired: {
                title: "Votre carte n'a pas pu \u00EAtre d\u00E9bit\u00E9e",
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Votre carte de paiement n'a pas \u00E9t\u00E9 enti\u00E8rement authentifi\u00E9e. Veuillez compl\u00E9ter le processus d'authentification pour activer votre carte de paiement se terminant par ${cardEnding}.`,
            },
            insufficientFunds: {
                title: "Votre carte n'a pas pu \u00EAtre d\u00E9bit\u00E9e",
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Votre carte de paiement a \u00E9t\u00E9 refus\u00E9e en raison de fonds insuffisants. Veuillez r\u00E9essayer ou ajouter une nouvelle carte de paiement pour r\u00E9gler votre solde impay\u00E9 de ${amountOwed}.`,
            },
            cardExpired: {
                title: "Votre carte n'a pas pu \u00EAtre d\u00E9bit\u00E9e",
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Votre carte de paiement a expir\u00E9. Veuillez ajouter une nouvelle carte de paiement pour r\u00E9gler votre solde impay\u00E9 de ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Votre carte expire bient\u00F4t',
                subtitle:
                    'Votre carte de paiement expirera \u00E0 la fin de ce mois. Cliquez sur le menu \u00E0 trois points ci-dessous pour la mettre \u00E0 jour et continuer \u00E0 utiliser toutes vos fonctionnalit\u00E9s pr\u00E9f\u00E9r\u00E9es.',
            },
            retryBillingSuccess: {
                title: 'Succ\u00E8s !',
                subtitle: 'Votre carte a \u00E9t\u00E9 d\u00E9bit\u00E9e avec succ\u00E8s.',
            },
            retryBillingError: {
                title: "Votre carte n'a pas pu \u00EAtre d\u00E9bit\u00E9e",
                subtitle:
                    "Avant de r\u00E9essayer, veuillez appeler directement votre banque pour autoriser les frais Expensify et lever toute restriction. Sinon, essayez d'ajouter une autre carte de paiement.",
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Vous avez contest\u00E9 le pr\u00E9l\u00E8vement de ${amountOwed} sur la carte se terminant par ${cardEnding}. Votre compte sera verrouill\u00E9 jusqu'\u00E0 ce que le litige soit r\u00E9solu avec votre banque.`,
            preTrial: {
                title: 'Commencer un essai gratuit',
                subtitleStart: 'Comme prochaine \u00E9tape,',
                subtitleLink: "compl\u00E9tez votre liste de v\u00E9rification d'installation",
                subtitleEnd: 'afin que votre \u00E9quipe puisse commencer \u00E0 soumettre des notes de frais.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Essai : ${numOfDays} ${numOfDays === 1 ? 'jour' : 'jours'} restants !`,
                subtitle: 'Ajoutez une carte de paiement pour continuer \u00E0 utiliser toutes vos fonctionnalit\u00E9s pr\u00E9f\u00E9r\u00E9es.',
            },
            trialEnded: {
                title: 'Votre essai gratuit est termin\u00E9',
                subtitle: 'Ajoutez une carte de paiement pour continuer \u00E0 utiliser toutes vos fonctionnalit\u00E9s pr\u00E9f\u00E9r\u00E9es.',
            },
            earlyDiscount: {
                claimOffer: "R\u00E9clamer l'offre",
                noThanks: 'Non merci',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% de r\u00E9duction sur votre premi\u00E8re ann\u00E9e !`,
                    phrase2: `Il suffit d'ajouter une carte de paiement et de commencer un abonnement annuel.`,
                },
                onboardingChatTitle: {
                    phrase1: 'Offre \u00E0 dur\u00E9e limit\u00E9e :',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% de r\u00E9duction sur votre premi\u00E8re ann\u00E9e !`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `R\u00E9clamer dans ${days > 0 ? `${days}j :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Paiement',
            subtitle: 'Ajoutez une carte pour payer votre abonnement Expensify.',
            addCardButton: 'Ajouter une carte de paiement',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Votre prochaine date de paiement est le ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Carte se terminant par ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nom : ${name}, Expiration : ${expiration}, Devise : ${currency}`,
            changeCard: 'Changer la carte de paiement',
            changeCurrency: 'Changer la devise de paiement',
            cardNotFound: 'Aucune carte de paiement ajout\u00E9e',
            retryPaymentButton: 'R\u00E9essayer le paiement',
            authenticatePayment: 'Authentifier le paiement',
            requestRefund: 'Demander un remboursement',
            requestRefundModal: {
                phrase1: 'Obtenir un remboursement est facile, il suffit de r\u00E9trograder votre compte avant votre prochaine date de facturation et vous recevrez un remboursement.',
                phrase2:
                    "Attention : La r\u00E9trogradation de votre compte entra\u00EEnera la suppression de votre ou vos espaces de travail. Cette action est irr\u00E9versible, mais vous pouvez toujours cr\u00E9er un nouvel espace de travail si vous changez d'avis.",
                confirm: 'Supprimer le(s) espace(s) de travail et r\u00E9trograder',
            },
            viewPaymentHistory: "Voir l'historique des paiements",
        },
        yourPlan: {
            title: 'Votre plan',
            exploreAllPlans: 'Explorer tous les forfaits',
            customPricing: 'Tarification personnalis\u00E9e',
            asLowAs: ({price}: YourPlanPriceValueParams) => `\u00E0 partir de ${price} par membre actif/mois`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} par membre/mois`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} par membre par mois`,
            perMemberMonth: 'par membre/mois',
            collect: {
                title: 'Collecter',
                description: 'Le plan pour petites entreprises qui vous offre des fonctionnalit\u00E9s de gestion des d\u00E9penses, de voyage et de chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, ${upper}/membre actif sans la carte Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, ${upper}/membre actif sans la carte Expensify.`,
                benefit1: 'Num\u00E9risation de re\u00E7us',
                benefit2: 'Remboursements',
                benefit3: "Gestion des cartes d'entreprise",
                benefit4: 'Approbations de d\u00E9penses et de voyages',
                benefit5: 'R\u00E9servation de voyage et r\u00E8gles',
                benefit6: 'Int\u00E9grations QuickBooks/Xero',
                benefit7: 'Discuter des d\u00E9penses, rapports et salles',
                benefit8: 'Assistance par IA et humaine',
            },
            control: {
                title: 'Contr\u00F4le',
                description: 'D\u00E9penses, voyages et messagerie pour les grandes entreprises.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, ${upper}/membre actif sans la carte Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, ${upper}/membre actif sans la carte Expensify.`,
                benefit1: 'Tout dans le plan Collect',
                benefit2: "Flux de travail d'approbation multi-niveaux",
                benefit3: 'R\u00E8gles de frais personnalis\u00E9es',
                benefit4: 'Int\u00E9grations ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Int\u00E9grations RH (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Informations et rapports personnalis\u00E9s',
                benefit8: 'Budg\u00E9tisation',
            },
            thisIsYourCurrentPlan: 'Voici votre plan actuel',
            downgrade: 'R\u00E9trograder vers Collect',
            upgrade: 'Passer \u00E0 Control',
            addMembers: 'Ajouter des membres',
            saveWithExpensifyTitle: '\u00C9conomisez avec la carte Expensify',
            saveWithExpensifyDescription: "Utilisez notre calculateur d'\u00E9conomies pour voir comment le cashback de la carte Expensify peut r\u00E9duire votre facture Expensify.",
            saveWithExpensifyButton: 'En savoir plus',
        },
        compareModal: {
            comparePlans: 'Comparer les plans',
            unlockTheFeatures: 'D\u00E9bloquez les fonctionnalit\u00E9s dont vous avez besoin avec le plan qui vous convient.',
            viewOurPricing: 'Consultez notre page de tarification',
            forACompleteFeatureBreakdown: 'pour une r\u00E9partition compl\u00E8te des fonctionnalit\u00E9s de chacun de nos forfaits.',
        },
        details: {
            title: "D\u00E9tails de l'abonnement",
            annual: 'Abonnement annuel',
            taxExempt: "Demander le statut d'exon\u00E9ration fiscale",
            taxExemptEnabled: "Exon\u00E9r\u00E9 d'imp\u00F4t",
            taxExemptStatus: "Statut d'exon\u00E9ration fiscale",
            payPerUse: "Paiement \u00E0 l'utilisation",
            subscriptionSize: "Taille de l'abonnement",
            headsUp:
                "Attention : Si vous ne d\u00E9finissez pas la taille de votre abonnement maintenant, nous la d\u00E9finirons automatiquement en fonction du nombre de membres actifs de votre premier mois. Vous serez alors engag\u00E9 \u00E0 payer pour au moins ce nombre de membres pendant les 12 prochains mois. Vous pouvez augmenter la taille de votre abonnement \u00E0 tout moment, mais vous ne pouvez pas la diminuer jusqu'\u00E0 la fin de votre abonnement.",
            zeroCommitment: "Z\u00E9ro engagement au tarif d'abonnement annuel r\u00E9duit",
        },
        subscriptionSize: {
            title: "Taille de l'abonnement",
            yourSize: "La taille de votre abonnement est le nombre de places disponibles qui peuvent \u00EAtre occup\u00E9es par tout membre actif au cours d'un mois donn\u00E9.",
            eachMonth:
                "Chaque mois, votre abonnement couvre jusqu'au nombre de membres actifs d\u00E9fini ci-dessus. Chaque fois que vous augmentez la taille de votre abonnement, vous commencerez un nouvel abonnement de 12 mois \u00E0 cette nouvelle taille.",
            note: "Remarque : Un membre actif est toute personne qui a cr\u00E9\u00E9, modifi\u00E9, soumis, approuv\u00E9, rembours\u00E9 ou export\u00E9 des donn\u00E9es de d\u00E9penses li\u00E9es \u00E0 l'espace de travail de votre entreprise.",
            confirmDetails: 'Confirmez les d\u00E9tails de votre nouvel abonnement annuel :',
            subscriptionSize: "Taille de l'abonnement",
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membres actifs/mois`,
            subscriptionRenews: "Renouvellement de l'abonnement",
            youCantDowngrade: 'Vous ne pouvez pas r\u00E9trograder pendant votre abonnement annuel.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Vous vous \u00EAtes d\u00E9j\u00E0 engag\u00E9 \u00E0 un abonnement annuel de ${size} membres actifs par mois jusqu'au ${date}. Vous pouvez passer \u00E0 un abonnement \u00E0 l'utilisation le ${date} en d\u00E9sactivant le renouvellement automatique.`,
            error: {
                size: "Veuillez entrer une taille d'abonnement valide",
                sameSize: 'Veuillez entrer un nombre diff\u00E9rent de la taille actuelle de votre abonnement.',
            },
        },
        paymentCard: {
            addPaymentCard: 'Ajouter une carte de paiement',
            enterPaymentCardDetails: 'Entrez les d\u00E9tails de votre carte de paiement',
            security:
                'Expensify est conforme \u00E0 la norme PCI-DSS, utilise un chiffrement de niveau bancaire et utilise une infrastructure redondante pour prot\u00E9ger vos donn\u00E9es.',
            learnMoreAboutSecurity: 'En savoir plus sur notre s\u00E9curit\u00E9.',
        },
        subscriptionSettings: {
            title: "Param\u00E8tres d'abonnement",
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Type d'abonnement : ${subscriptionType}, Taille de l'abonnement : ${subscriptionSize}, Renouvellement automatique : ${autoRenew}, Augmentation automatique des si\u00E8ges annuels : ${autoIncrease}`,
            none: 'aucun',
            on: 'sur',
            off: 'd\u00E9sactiv\u00E9',
            annual: 'Annuel',
            autoRenew: 'Renouvellement automatique',
            autoIncrease: 'Augmenter automatiquement les si\u00E8ges annuels',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `\u00C9conomisez jusqu'\u00E0 ${amountWithCurrency}/mois par membre actif`,
            automaticallyIncrease:
                'Augmentez automatiquement vos si\u00E8ges annuels pour accueillir les membres actifs qui d\u00E9passent la taille de votre abonnement. Remarque : Cela prolongera la date de fin de votre abonnement annuel.',
            disableAutoRenew: 'D\u00E9sactiver le renouvellement automatique',
            helpUsImprove: 'Aidez-nous \u00E0 am\u00E9liorer Expensify',
            whatsMainReason: 'Quelle est la principale raison pour laquelle vous d\u00E9sactivez le renouvellement automatique ?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Renouvelle le ${date}.`,
            pricingConfiguration: 'Le prix d\u00E9pend de la configuration. Pour le prix le plus bas, choisissez un abonnement annuel et obtenez la carte Expensify.',
            learnMore: {
                part1: 'En savoir plus sur notre',
                pricingPage: 'page de tarification',
                part2: 'ou discutez avec notre \u00E9quipe dans votre',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Prix estim\u00E9',
            changesBasedOn: "Cela change en fonction de votre utilisation de la carte Expensify et des options d'abonnement ci-dessous.",
        },
        requestEarlyCancellation: {
            title: 'Demander une annulation anticip\u00E9e',
            subtitle: 'Quelle est la principale raison pour laquelle vous demandez une annulation anticip\u00E9e ?',
            subscriptionCanceled: {
                title: 'Abonnement annul\u00E9',
                subtitle: 'Votre abonnement annuel a \u00E9t\u00E9 annul\u00E9.',
                info: "Si vous souhaitez continuer \u00E0 utiliser votre/vos espace(s) de travail sur une base de paiement \u00E0 l'utilisation, vous \u00EAtes pr\u00EAt.",
                preventFutureActivity: {
                    part1: 'Si vous souhaitez \u00E9viter toute activit\u00E9 et frais futurs, vous devez',
                    link: 'supprimer votre/vos espace(s) de travail',
                    part2: '. Notez que lorsque vous supprimez votre/vos espace(s) de travail, vous serez factur\u00E9 pour toute activit\u00E9 en cours qui a \u00E9t\u00E9 engag\u00E9e au cours du mois civil en cours.',
                },
            },
            requestSubmitted: {
                title: 'Demande soumise',
                subtitle: {
                    part1: "Merci de nous avoir inform\u00E9s de votre int\u00E9r\u00EAt pour l'annulation de votre abonnement. Nous examinons votre demande et nous vous contacterons bient\u00F4t via votre chat avec",
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: {
                part1: "En demandant une annulation anticip\u00E9e, je reconnais et accepte qu'Expensify n'a aucune obligation d'accorder une telle demande en vertu de l'Expensify.",
                link: "Conditions d'utilisation",
                part2: "ou tout autre accord de services applicable entre moi et Expensify et qu'Expensify conserve l'enti\u00E8re discr\u00E9tion quant \u00E0 l'octroi de toute demande de ce type.",
            },
        },
    },
    feedbackSurvey: {
        tooLimited: 'La fonctionnalit\u00E9 n\u00E9cessite des am\u00E9liorations',
        tooExpensive: 'Trop cher',
        inadequateSupport: 'Assistance client insuffisante',
        businessClosing: "Fermeture de l'entreprise, r\u00E9duction des effectifs ou acquisition",
        additionalInfoTitle: 'Vers quel logiciel passez-vous et pourquoi ?',
        additionalInfoInputLabel: 'Votre r\u00E9ponse',
    },
    roomChangeLog: {
        updateRoomDescription: 'd\u00E9finir la description de la salle sur :',
        clearRoomDescription: 'effac\u00E9 la description de la salle',
    },
    delegate: {
        switchAccount: 'Changer de compte :',
        copilotDelegatedAccess: 'Copilot : Acc\u00E8s d\u00E9l\u00E9gu\u00E9',
        copilotDelegatedAccessDescription: "Permettre \u00E0 d'autres membres d'acc\u00E9der \u00E0 votre compte.",
        addCopilot: 'Ajouter copilote',
        membersCanAccessYourAccount: 'Ces membres peuvent acc\u00E9der \u00E0 votre compte :',
        youCanAccessTheseAccounts: 'Vous pouvez acc\u00E9der \u00E0 ces comptes via le s\u00E9lecteur de compte :',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Complet';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Limit\u00E9';
                default:
                    return '';
            }
        },
        genericError: "Oups, quelque chose s'est mal pass\u00E9. Veuillez r\u00E9essayer.",
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `au nom de ${delegator}`,
        accessLevel: "Niveau d'acc\u00E8s",
        confirmCopilot: 'Confirmez votre copilote ci-dessous.',
        accessLevelDescription:
            "Choisissez un niveau d'acc\u00E8s ci-dessous. Les acc\u00E8s Complet et Limit\u00E9 permettent aux copilotes de voir toutes les conversations et d\u00E9penses.",
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Permettre \u00E0 un autre membre de prendre toutes les actions sur votre compte, en votre nom. Comprend les discussions, les soumissions, les approbations, les paiements, les mises \u00E0 jour des param\u00E8tres, et plus encore.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Autoriser un autre membre \u00E0 effectuer la plupart des actions sur votre compte, en votre nom. Exclut les approbations, paiements, rejets et suspensions.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Supprimer le copilote',
        removeCopilotConfirmation: '\u00CAtes-vous s\u00FBr de vouloir supprimer ce copilote ?',
        changeAccessLevel: "Modifier le niveau d'acc\u00E8s",
        makeSureItIsYou: "Assurons-nous que c'est bien vous",
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Veuillez entrer le code magique envoy\u00E9 \u00E0 ${contactMethod} pour ajouter un copilote. Il devrait arriver dans une minute ou deux.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Veuillez entrer le code magique envoy\u00E9 \u00E0 ${contactMethod} pour mettre \u00E0 jour votre copilote.`,
        notAllowed: 'Pas si vite...',
        noAccessMessage: "En tant que copilote, vous n'avez pas acc\u00E8s \u00E0 cette page. D\u00E9sol\u00E9 !",
        notAllowedMessageStart: `En tant que`,
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => `pour ${accountOwnerEmail}, vous n'avez pas la permission d'effectuer cette action. D\u00E9sol\u00E9 !`,
        copilotAccess: 'Acc\u00E8s Copilot',
    },
    debug: {
        debug: 'D\u00E9boguer',
        details: 'D\u00E9tails',
        JSON: 'JSON',
        reportActions: 'Actions',
        reportActionPreview: 'Aper\u00E7u',
        nothingToPreview: 'Rien \u00E0 pr\u00E9visualiser',
        editJson: 'Modifier JSON :',
        preview: 'Aper\u00E7u :',
        missingProperty: ({propertyName}: MissingPropertyParams) => `${propertyName} manquant`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Propri\u00E9t\u00E9 invalide : ${propertyName} - Attendu : ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valeur invalide - Attendu : ${expectedValues}`,
        missingValue: 'Valeur manquante',
        createReportAction: 'Cr\u00E9er une action de rapport',
        reportAction: 'Signaler une action',
        report: 'Rapport',
        transaction: 'Transaction',
        violations: 'Violations',
        transactionViolation: 'Violation de transaction',
        hint: 'Les modifications de donn\u00E9es ne seront pas envoy\u00E9es au backend',
        textFields: 'Champs de texte',
        numberFields: 'Champs num\u00E9riques',
        booleanFields: 'Champs bool\u00E9ens',
        constantFields: 'Champs constants',
        dateTimeFields: 'Champs DateTime',
        date: 'Date',
        time: 'Temps',
        none: 'Aucun',
        visibleInLHN: 'Visible dans LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Voir le rapport',
        viewTransaction: 'Voir la transaction',
        createTransactionViolation: 'Cr\u00E9er une violation de transaction',
        reasonVisibleInLHN: {
            hasDraftComment: 'A un commentaire brouillon',
            hasGBR: 'Has GBR',
            hasRBR: 'A RBR',
            pinnedByUser: '\u00C9pingl\u00E9 par un membre',
            hasIOUViolations: 'A des violations de dette',
            hasAddWorkspaceRoomErrors: "A des erreurs d'ajout de salle de l'espace de travail",
            isUnread: 'Est non lu (mode concentration)',
            isArchived: 'Est archiv\u00E9 (mode le plus r\u00E9cent)',
            isSelfDM: 'Est une auto DM',
            isFocused: 'Est temporairement concentr\u00E9',
        },
        reasonGBR: {
            hasJoinRequest: 'A une demande de rejoindre (salle admin)',
            isUnreadWithMention: 'Est non lu avec mention',
            isWaitingForAssigneeToCompleteAction: "Attend que le responsable termine l'action",
            hasChildReportAwaitingAction: "A un rapport enfant en attente d'action",
            hasMissingInvoiceBankAccount: 'Il manque le compte bancaire de la facture',
        },
        reasonRBR: {
            hasErrors: 'Contient des erreurs dans les donn\u00E9es du rapport ou des actions du rapport',
            hasViolations: 'A des violations',
            hasTransactionThreadViolations: 'A des violations de fil de transaction',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "Il y a un rapport en attente d'action",
            theresAReportWithErrors: 'Il y a un rapport avec des erreurs.',
            theresAWorkspaceWithCustomUnitsErrors: "Il y a un espace de travail avec des erreurs d'unit\u00E9s personnalis\u00E9es.",
            theresAProblemWithAWorkspaceMember: "Il y a un probl\u00E8me avec un membre de l'espace de travail",
            theresAProblemWithAWorkspaceQBOExport: "Il y a eu un probl\u00E8me avec le param\u00E8tre d'exportation de la connexion de l'espace de travail.",
            theresAProblemWithAContactMethod: 'Il y a un probl\u00E8me avec un moyen de contact',
            aContactMethodRequiresVerification: 'Une m\u00E9thode de contact n\u00E9cessite une v\u00E9rification',
            theresAProblemWithAPaymentMethod: 'Il y a un probl\u00E8me avec un moyen de paiement',
            theresAProblemWithAWorkspace: 'Il y a un probl\u00E8me avec un espace de travail',
            theresAProblemWithYourReimbursementAccount: 'Il y a un probl\u00E8me avec votre compte de remboursement',
            theresABillingProblemWithYourSubscription: 'Il y a un probl\u00E8me de facturation avec votre abonnement.',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Votre abonnement a \u00E9t\u00E9 renouvel\u00E9 avec succ\u00E8s',
            theresWasAProblemDuringAWorkspaceConnectionSync: "Un probl\u00E8me est survenu lors de la synchronisation de la connexion de l'espace de travail",
            theresAProblemWithYourWallet: 'Il y a un probl\u00E8me avec votre portefeuille',
            theresAProblemWithYourWalletTerms: 'Il y a un probl\u00E8me avec les conditions de votre portefeuille',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Faites un essai',
    },
    migratedUserWelcomeModal: {
        title: 'Voyage et d\u00E9penses, \u00E0 la vitesse du chat',
        subtitle: 'Le nouveau Expensify offre la m\u00EAme excellente automatisation, mais maintenant avec une collaboration incroyable :',
        confirmText: 'Allons-y !',
        features: {
            chat: "<strong>Discutez directement sur n'importe quelle d\u00E9pense</strong>, rapport ou espace de travail",
            scanReceipt: '<strong>Scannez les re\u00E7us</strong> et soyez rembours\u00E9',
            crossPlatform: 'Faites <strong>tout</strong> depuis votre t\u00E9l\u00E9phone ou navigateur',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: 'Commencer',
            part2: 'ici !',
        },
        saveSearchTooltip: {
            part1: 'Renommez vos recherches sauvegard\u00E9es',
            part2: 'ici !',
        },
        bottomNavInboxTooltip: {
            part1: 'V\u00E9rifier quoi',
            part2: 'n\u00E9cessite votre attention',
            part3: 'et',
            part4: 'discuter des d\u00E9penses.',
        },
        workspaceChatTooltip: {
            part1: 'Discuter avec',
            part2: 'approbateurs',
        },
        globalCreateTooltip: {
            part1: 'Cr\u00E9er des d\u00E9penses',
            part2: ', commencer \u00E0 discuter,',
            part3: 'et plus.',
            part4: 'Essayez-le !',
        },
        GBRRBRChat: {
            part1: 'Vous verrez \uD83D\uDFE2 sur',
            part2: 'actions \u00E0 entreprendre',
            part3: ',\net \uD83D\uDD34 sur',
            part4: '\u00E9l\u00E9ments \u00E0 examiner.',
        },
        accountSwitcher: {
            part1: 'Acc\u00E9dez \u00E0 votre',
            part2: 'Comptes Copilot',
            part3: 'ici',
        },
        expenseReportsFilter: {
            part1: 'Bienvenue ! Trouvez tous vos',
            part2: "rapports de l'entreprise",
            part3: 'ici.',
        },
        scanTestTooltip: {
            part1: 'Vous voulez voir comment fonctionne Scan ?',
            part2: 'Essayez un re\u00E7u de test !',
            part3: 'Choisissez notre',
            part4: 'responsable des tests',
            part5: "pour l'essayer !",
            part6: 'Maintenant,',
            part7: 'soumettez votre d\u00E9pense',
            part8: 'et regardez la magie op\u00E9rer !',
            tryItOut: 'Essayez-le',
            noThanks: 'Non merci',
        },
        outstandingFilter: {
            part1: 'Filtrer les d\u00E9penses\nqui',
            part2: "besoin d'approbation",
        },
        scanTestDriveTooltip: {
            part1: 'Envoyer ce re\u00E7u \u00E0',
            part2: 'compl\u00E9tez le test de conduite !',
        },
    },
    discardChangesConfirmation: {
        title: 'Annuler les modifications ?',
        body: '\u00CAtes-vous s\u00FBr de vouloir abandonner les modifications que vous avez apport\u00E9es ?',
        confirmText: 'Annuler les modifications',
    },
    scheduledCall: {
        book: {
            title: 'Planifier un appel',
            description: 'Trouvez un moment qui vous convient.',
            slots: 'Heures disponibles pour',
        },
        confirmation: {
            title: "Confirmer l'appel",
            description:
                "Assurez-vous que les d\u00E9tails ci-dessous vous conviennent. Une fois que vous aurez confirm\u00E9 l'appel, nous enverrons une invitation avec plus d'informations.",
            setupSpecialist: 'Votre sp\u00E9cialiste de configuration',
            meetingLength: 'Dur\u00E9e de la r\u00E9union',
            dateTime: 'Date et heure',
            minutes: '30 minutes',
        },
        callScheduled: 'Appel programm\u00E9',
    },
    autoSubmitModal: {
        title: 'Tout est clair et soumis !',
        description: 'Tous les avertissements et infractions ont \u00E9t\u00E9 lev\u00E9s, donc :',
        submittedExpensesTitle: 'Ces d\u00E9penses ont \u00E9t\u00E9 soumises',
        submittedExpensesDescription:
            "Ces d\u00E9penses ont \u00E9t\u00E9 envoy\u00E9es \u00E0 votre approbateur, mais peuvent encore \u00EAtre modifi\u00E9es jusqu'\u00E0 ce qu'elles soient approuv\u00E9es.",
        pendingExpensesTitle: 'Les d\u00E9penses en attente ont \u00E9t\u00E9 d\u00E9plac\u00E9es',
        pendingExpensesDescription:
            "Toutes les d\u00E9penses de carte en attente ont \u00E9t\u00E9 d\u00E9plac\u00E9es vers un rapport s\u00E9par\u00E9 jusqu'\u00E0 ce qu'elles soient publi\u00E9es.",
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Faites un essai de 2 minutes',
        },
        modal: {
            title: 'Prenez-nous pour un essai',
            description: "Faites une visite rapide du produit pour vous mettre \u00E0 jour rapidement. Pas d'arr\u00EAts n\u00E9cessaires !",
            confirmText: "Commencer l'essai",
            helpText: 'Passer',
            employee: {
                description:
                    "<muted-text>Offrez \u00E0 votre \u00E9quipe <strong>3 mois gratuits d'Expensify !</strong> Entrez simplement l'email de votre patron ci-dessous et envoyez-lui une d\u00E9pense test.</muted-text>",
                email: "Entrez l'email de votre patron",
                error: 'Ce membre poss\u00E8de un espace de travail, veuillez entrer un nouveau membre pour tester.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Vous \u00EAtes actuellement en train de tester Expensify',
            readyForTheRealThing: 'Pr\u00EAt pour le vrai d\u00E9fi ?',
            getStarted: 'Commencer',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} vous a invit\u00E9 \u00E0 essayer Expensify\nSalut ! Je viens de nous obtenir *3 mois gratuits* pour essayer Expensify, le moyen le plus rapide de g\u00E9rer les d\u00E9penses.\n\nVoici un *re\u00E7u de test* pour vous montrer comment cela fonctionne :`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
