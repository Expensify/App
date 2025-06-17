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
        ok: 'OK',
        notNow: 'Pas maintenant',
        learnMore: 'En savoir plus.',
        buttonConfirm: 'Compris',
        name: 'Nom',
        attachment: 'Pièce jointe',
        attachments: 'Pièces jointes',
        center: 'Centrer',
        from: 'De',
        to: 'À',
        in: 'En',
        optional: 'Optionnel',
        new: 'Nouveau',
        search: 'Rechercher',
        reports: 'Rapports',
        find: 'Trouver',
        searchWithThreeDots: 'Rechercher...',
        next: 'Suivant',
        previous: 'Précédent',
        goBack: 'Retourner',
        create: 'Créer',
        add: 'Ajouter',
        resend: 'Renvoyer',
        save: 'Enregistrer',
        select: 'Sélectionner',
        deselect: 'Désélectionner',
        selectMultiple: 'Sélectionner plusieurs',
        saveChanges: 'Enregistrer les modifications',
        submit: 'Soumettre',
        rotate: 'Faire pivoter',
        zoom: 'Zoom',
        password: 'Mot de passe',
        magicCode: 'Code magique',
        twoFactorCode: 'Code à deux facteurs',
        workspaces: 'Espaces de travail',
        inbox: 'Boîte de réception',
        group: 'Groupe',
        profile: 'Profil',
        referral: 'Parrainage',
        payments: 'Paiements',
        approvals: 'Approbations',
        wallet: 'Portefeuille',
        preferences: 'Préférences',
        view: 'Afficher',
        review: (reviewParams?: ReviewParams) => `Revue${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Pas',
        signIn: 'Se connecter',
        signInWithGoogle: 'Se connecter avec Google',
        signInWithApple: 'Se connecter avec Apple',
        signInWith: 'Se connecter avec',
        continue: 'Continuer',
        firstName: 'Prénom',
        lastName: 'Nom de famille',
        scanning: 'Analyse en cours',
        addCardTermsOfService: "Conditions d'utilisation d'Expensify",
        perPerson: 'par personne',
        phone: 'Téléphone',
        phoneNumber: 'Numéro de téléphone',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'et',
        or: 'ou',
        details: 'Détails',
        privacy: 'Confidentialité',
        privacyPolicy: 'Politique de confidentialité',
        hidden: 'Hidden',
        visible: 'Visible',
        delete: 'Supprimer',
        archived: 'archived',
        contacts: 'Contacts',
        recents: 'Récents',
        close: 'Fermer',
        download: 'Télécharger',
        downloading: 'Téléchargement',
        uploading: 'Téléchargement en cours',
        pin: 'Épingler',
        unPin: 'Détacher',
        back: 'Retour',
        saveAndContinue: 'Enregistrer et continuer',
        settings: 'Paramètres',
        termsOfService: "Conditions d'utilisation",
        members: 'Membres',
        invite: 'Inviter',
        here: 'ici',
        date: 'Date',
        dob: 'Date de naissance',
        currentYear: 'Année en cours',
        currentMonth: 'Mois en cours',
        ssnLast4: 'Les 4 derniers chiffres du SSN',
        ssnFull9: 'Les 9 chiffres complets du SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Adresse ligne ${lineNumber}`,
        personalAddress: 'Adresse personnelle',
        companyAddress: "Adresse de l'entreprise",
        noPO: "Pas de boîtes postales ni d'adresses de dépôt postal, s'il vous plaît.",
        city: 'Ville',
        state: 'État',
        streetAddress: 'Adresse postale',
        stateOrProvince: 'État / Province',
        country: 'Pays',
        zip: 'Code postal',
        zipPostCode: 'Code postal',
        whatThis: "Qu'est-ce que c'est ?",
        iAcceptThe: "J'accepte les conditions",
        remove: 'Supprimer',
        admin: 'Administrateur',
        owner: 'Propriétaire',
        dateFormat: 'YYYY-MM-DD',
        send: 'Envoyer',
        na: 'N/A',
        noResultsFound: 'Aucun résultat trouvé',
        noResultsFoundMatching: ({searchString}: {searchString: string}) => `Aucun résultat trouvé correspondant à "${searchString}"`,
        recentDestinations: 'Destinations récentes',
        timePrefix: "C'est",
        conjunctionFor: 'pour',
        todayAt: "Aujourd'hui à",
        tomorrowAt: 'Demain à',
        yesterdayAt: 'Hier à',
        conjunctionAt: 'à',
        conjunctionTo: 'à',
        genericErrorMessage: "Oups... une erreur s'est produite et votre demande n'a pas pu être traitée. Veuillez réessayer plus tard.",
        percentage: 'Pourcentage',
        error: {
            invalidAmount: 'Montant invalide',
            acceptTerms: "Vous devez accepter les Conditions d'utilisation pour continuer",
            phoneNumber: `Veuillez saisir un numéro de téléphone valide, avec l'indicatif du pays (par exemple ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Ce champ est obligatoire',
            requestModified: 'Cette demande est en cours de modification par un autre membre',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Limite de caractères dépassé (${length}/${limit})`,
            dateInvalid: 'Veuillez sélectionner une date valide',
            invalidDateShouldBeFuture: "Veuillez choisir aujourd'hui ou une date future",
            invalidTimeShouldBeFuture: "Veuillez choisir une heure au moins une minute à l'avance",
            invalidCharacter: 'Caractère invalide',
            enterMerchant: 'Entrez un nom de commerçant',
            enterAmount: 'Entrez un montant',
            missingMerchantName: 'Nom du commerçant manquant',
            missingAmount: 'Montant manquant',
            missingDate: 'Date manquante',
            enterDate: 'Entrez une date',
            invalidTimeRange: 'Veuillez saisir une heure au format 12 heures (par exemple, 14h30 PM)',
            pleaseCompleteForm: 'Veuillez remplir le formulaire ci-dessus pour continuer',
            pleaseSelectOne: 'Veuillez sélectionner une option ci-dessus',
            invalidRateError: 'Veuillez entrer un taux valide',
            lowRateError: 'Le taux doit être supérieur à 0',
            email: 'Veuillez saisir une adresse e-mail valide',
            login: "Une erreur s'est produite lors de la connexion. Veuillez réessayer.",
        },
        comma: 'virgule',
        semicolon: 'point-virgule',
        please: "S'il vous plaît",
        contactUs: 'contactez-nous',
        pleaseEnterEmailOrPhoneNumber: 'Veuillez saisir une adresse e-mail ou un numéro de téléphone',
        fixTheErrors: 'corriger les erreurs',
        inTheFormBeforeContinuing: 'dans le formulaire avant de continuer',
        confirm: 'Confirmer',
        reset: 'Réinitialiser',
        done: 'Terminé',
        more: 'Plus',
        debitCard: 'Carte de débit',
        bankAccount: 'Compte bancaire',
        personalBankAccount: 'Compte bancaire personnel',
        businessBankAccount: 'Compte bancaire professionnel',
        join: 'Rejoindre',
        leave: 'Quitter',
        decline: 'Refuser',
        transferBalance: 'Transférer le solde',
        cantFindAddress: 'Vous ne trouvez pas votre adresse ?',
        enterManually: 'Entrez-le manuellement',
        message: 'Message',
        leaveThread: 'Quitter la conversation',
        you: 'Vous',
        youAfterPreposition: 'vous',
        your: 'votre',
        conciergeHelp: "Veuillez contacter Concierge pour obtenir de l'aide.",
        youAppearToBeOffline: 'Vous semblez être hors ligne.',
        thisFeatureRequiresInternet: 'Cette fonctionnalité nécessite une connexion Internet active.',
        attachmentWillBeAvailableOnceBackOnline: 'La pièce jointe sera disponible une fois de nouveau en ligne.',
        errorOccurredWhileTryingToPlayVideo: "Une erreur s'est produite lors de la tentative de lecture de cette vidéo.",
        areYouSure: 'Êtes-vous sûr ?',
        verify: 'Vérifier',
        yesContinue: 'Oui, continuez',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `par ex. ${zipSampleFormat}` : ''),
        description: 'Description',
        title: 'Titre',
        assignee: 'Assigné',
        createdBy: 'Créé par',
        with: 'avec',
        shareCode: 'Partager le code',
        share: 'Partager',
        per: 'par',
        mi: 'mile',
        km: 'kilomètre',
        copied: 'Copié !',
        someone: "Quelqu'un",
        total: 'Total',
        edit: 'Modifier',
        letsDoThis: `Allons-y !`,
        letsStart: `Commençons`,
        showMore: 'Afficher plus',
        merchant: 'Commerçant',
        category: 'Catégorie',
        report: 'Rapport',
        billable: 'Facturable',
        nonBillable: 'Non facturable',
        tag: 'Étiquette',
        receipt: 'Reçu',
        verified: 'Vérifié',
        replace: 'Remplacer',
        distance: 'Distance',
        mile: 'mile',
        miles: 'miles',
        kilometer: 'kilomètre',
        kilometers: 'kilomètres',
        recent: 'Récent',
        all: 'Tous',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Sélectionnez une devise',
        card: 'Carte',
        whyDoWeAskForThis: 'Pourquoi demandons-nous cela ?',
        required: 'Requis',
        showing: 'Affichage',
        of: 'de',
        default: 'Par défaut',
        update: 'Mettre à jour',
        member: 'Membre',
        auditor: 'Auditeur',
        role: 'Rôle',
        currency: 'Devise',
        rate: 'Évaluer',
        emptyLHN: {
            title: 'Youpi ! Tout est à jour.',
            subtitleText1: 'Trouvez une conversation en utilisant le',
            subtitleText2: 'bouton ci-dessus, ou créez quelque chose en utilisant le',
            subtitleText3: 'bouton ci-dessous.',
        },
        businessName: "Nom de l'entreprise",
        clear: 'Effacer',
        type: 'Type',
        action: 'Action',
        expenses: 'Dépenses',
        tax: 'Taxe',
        shared: 'Partagé',
        drafts: 'Brouillons',
        finished: 'Terminé',
        upgrade: 'Mettre à niveau',
        downgradeWorkspace: "Rétrograder l'espace de travail",
        companyID: "ID de l'entreprise",
        userID: 'ID utilisateur',
        disable: 'Désactiver',
        export: 'Exporter',
        initialValue: 'Valeur initiale',
        currentDate: 'Date actuelle',
        value: 'Valeur',
        downloadFailedTitle: 'Échec du téléchargement',
        downloadFailedDescription: "Votre téléchargement n'a pas pu être terminé. Veuillez réessayer plus tard.",
        filterLogs: 'Filtrer les journaux',
        network: 'Réseau',
        reportID: 'ID du rapport',
        longID: 'ID long',
        bankAccounts: 'Comptes bancaires',
        chooseFile: 'Choisir un fichier',
        dropTitle: 'Laisse tomber',
        dropMessage: 'Déposez votre fichier ici',
        ignore: 'Ignore',
        enabled: 'Activé',
        disabled: 'Désactivé',
        import: 'Importer',
        offlinePrompt: 'Vous ne pouvez pas effectuer cette action pour le moment.',
        outstanding: 'Impayé',
        chats: 'Discussions',
        tasks: 'Tâches',
        unread: 'Non lu',
        sent: 'Envoyé',
        links: 'Liens',
        days: 'jours',
        rename: 'Renommer',
        address: 'Adresse',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Skip',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Vous avez besoin de quelque chose de spécifique ? Discutez avec votre gestionnaire de compte, ${accountManagerDisplayName}.`,
        chatNow: 'Discuter maintenant',
        workEmail: 'Email professionnel',
        destination: 'Destination',
        subrate: 'Sous-noter',
        perDiem: 'Indemnité journalière',
        validate: 'Valider',
        downloadAsPDF: 'Télécharger en PDF',
        downloadAsCSV: 'Télécharger en CSV',
        help: 'Aide',
        expenseReports: 'Rapports de dépenses',
        rateOutOfPolicy: 'Taux hors politique',
        reimbursable: 'Remboursable',
        editYourProfile: 'Modifier votre profil',
        comments: 'Commentaires',
        sharedIn: 'Partagé dans',
        unreported: 'Non signalé',
        explore: 'Explorer',
        todo: 'À faire',
        invoice: 'Facture',
        expense: 'Dépense',
        chat: 'Discussion',
        task: 'Tâche',
        trip: 'Voyage',
        apply: 'Appliquer',
        status: 'Statut',
        on: 'Activé',
        before: 'Avant',
        after: 'Après',
        reschedule: 'Reprogrammer',
        general: 'Général',
        never: 'Jamais',
        workspacesTabTitle: 'Espaces de travail',
        getTheApp: "Obtenez l'application",
        scanReceiptsOnTheGo: 'Scannez les reçus depuis votre téléphone',
    },
    supportalNoAccess: {
        title: 'Pas si vite',
        description: "Vous n'êtes pas autorisé à effectuer cette action lorsque le support est connecté.",
    },
    lockedAccount: {
        title: 'Compte verrouillé',
        description: "Vous n'êtes pas autorisé à effectuer cette action car ce compte a été verrouillé. Veuillez contacter concierge@expensify.com pour les étapes suivantes.",
    },
    location: {
        useCurrent: 'Utiliser la position actuelle',
        notFound: "Nous n'avons pas pu trouver votre emplacement. Veuillez réessayer ou saisir une adresse manuellement.",
        permissionDenied: "Il semble que vous ayez refusé l'accès à votre position.",
        please: "S'il vous plaît",
        allowPermission: "autoriser l'accès à la localisation dans les paramètres",
        tryAgain: 'et réessayez.',
    },
    contact: {
        importContacts: 'Importer des contacts',
        importContactsTitle: 'Importer vos contacts',
        importContactsText: 'Importez les contacts de votre téléphone pour que vos personnes préférées soient toujours à portée de main.',
        importContactsExplanation: 'ainsi, vos personnes préférées sont toujours à portée de main.',
        importContactsNativeText: 'Encore une étape ! Donnez-nous le feu vert pour importer vos contacts.',
    },
    anonymousReportFooter: {
        logoTagline: 'Rejoindre la discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Accès à la caméra',
        expensifyDoesNotHaveAccessToCamera: 'Expensify ne peut pas prendre de photos sans accès à votre caméra. Appuyez sur paramètres pour mettre à jour les autorisations.',
        attachmentError: 'Erreur de pièce jointe',
        errorWhileSelectingAttachment: "Une erreur s'est produite lors de la sélection d'une pièce jointe. Veuillez réessayer.",
        errorWhileSelectingCorruptedAttachment: "Une erreur s'est produite lors de la sélection d'une pièce jointe corrompue. Veuillez essayer un autre fichier.",
        takePhoto: 'Prendre une photo',
        chooseFromGallery: 'Choisir dans la galerie',
        chooseDocument: 'Choisir un fichier',
        attachmentTooLarge: 'La pièce jointe est trop volumineuse',
        sizeExceeded: 'La taille de la pièce jointe dépasse la limite de 24 Mo',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `La taille de la pièce jointe dépasse la limite de ${maxUploadSizeInMB} Mo.`,
        attachmentTooSmall: 'La pièce jointe est trop petite',
        sizeNotMet: 'La taille de la pièce jointe doit être supérieure à 240 octets',
        wrongFileType: 'Type de fichier invalide',
        notAllowedExtension: "Ce type de fichier n'est pas autorisé. Veuillez essayer un autre type de fichier.",
        folderNotAllowedMessage: "Le téléchargement d'un dossier n'est pas autorisé. Veuillez essayer un fichier différent.",
        protectedPDFNotSupported: 'Les fichiers PDF protégés par mot de passe ne sont pas pris en charge',
        attachmentImageResized: "Cette image a été redimensionnée pour l'aperçu. Téléchargez-la pour la résolution complète.",
        attachmentImageTooLarge: 'Cette image est trop grande pour être prévisualisée avant le téléchargement.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Vous ne pouvez télécharger que jusqu'à ${fileLimit} fichiers à la fois.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Le fichier dépasse ${maxUploadSizeInMB} Mo. Veuillez réessayer.`,
    },
    dropzone: {
        addAttachments: 'Ajouter des pièces jointes',
        scanReceipts: 'Scanner les reçus',
        replaceReceipt: 'Remplacer le reçu',
    },
    filePicker: {
        fileError: 'Erreur de fichier',
        errorWhileSelectingFile: "Une erreur s'est produite lors de la sélection d'un fichier. Veuillez réessayer.",
    },
    connectionComplete: {
        title: 'Connexion terminée',
        supportingText: "Vous pouvez fermer cette fenêtre et retourner à l'application Expensify.",
    },
    avatarCropModal: {
        title: 'Modifier la photo',
        description: 'Faites glisser, zoomer et faire pivoter votre image comme vous le souhaitez.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Aucune extension trouvée pour le type mime',
        problemGettingImageYouPasted: "Un problème est survenu lors de la récupération de l'image que vous avez collée",
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La longueur maximale du commentaire est de ${formattedMaxLength} caractères.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La longueur maximale du titre de la tâche est de ${formattedMaxLength} caractères.`,
    },
    baseUpdateAppModal: {
        updateApp: "Mettre à jour l'application",
        updatePrompt:
            "Une nouvelle version de cette application est disponible.\nMettez à jour maintenant ou redémarrez l'application plus tard pour télécharger les dernières modifications.",
    },
    deeplinkWrapper: {
        launching: "Lancement d'Expensify",
        expired: 'Votre session a expiré.',
        signIn: 'Veuillez vous reconnecter.',
        redirectedToDesktopApp: "Nous vous avons redirigé vers l'application de bureau.",
        youCanAlso: 'Vous pouvez également',
        openLinkInBrowser: 'ouvrez ce lien dans votre navigateur',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `Vous êtes connecté en tant que ${email}. Cliquez sur « Ouvrir le lien » dans l'invite pour vous connecter à l'application de bureau avec ce compte.`,
        doNotSeePrompt: "Impossible de voir l'invite ?",
        tryAgain: 'Réessayez',
        or: ', ou',
        continueInWeb: "continuer vers l'application web",
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra,\nvous êtes connecté !',
        successfulSignInDescription: "Retournez à votre onglet d'origine pour continuer.",
        title: 'Voici votre code magique',
        description: "Veuillez saisir le code depuis l'appareil où il a été initialement demandé",
        doNotShare: 'Ne partagez votre code avec personne.\nExpensify ne vous le demandera jamais !',
        or: ', ou',
        signInHere: 'connectez-vous simplement ici',
        expiredCodeTitle: 'Le code magique a expiré',
        expiredCodeDescription: "Retournez à l'appareil d'origine et demandez un nouveau code",
        successfulNewCodeRequest: 'Code demandé. Veuillez vérifier votre appareil.',
        tfaRequiredTitle: 'Authentification à deux facteurs\nrequise',
        tfaRequiredDescription: "Veuillez saisir le code d'authentification à deux facteurs\nlà où vous essayez de vous connecter.",
        requestOneHere: 'demandez-en un ici.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Payé par',
        whatsItFor: 'À quoi ça sert ?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nom, e-mail ou numéro de téléphone',
        findMember: 'Trouver un membre',
        searchForSomeone: "Rechercher quelqu'un",
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Soumettre une dépense, référer à votre patron',
            subtitleText: 'Vous voulez que votre patron utilise Expensify aussi ? Il vous suffit de lui soumettre une dépense et nous nous occupons du reste.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Planifier un appel',
    },
    hello: 'Bonjour',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Commencez ci-dessous.',
        anotherLoginPageIsOpen: 'Une autre page de connexion est ouverte.',
        anotherLoginPageIsOpenExplanation: 'Vous avez ouvert la page de connexion dans un onglet séparé. Veuillez vous connecter depuis cet onglet.',
        welcome: 'Bienvenue !',
        welcomeWithoutExclamation: 'Bienvenue',
        phrase2: "L'argent parle. Et maintenant que le chat et les paiements sont réunis en un seul endroit, c'est aussi facile.",
        phrase3: 'Vos paiements vous parviennent aussi rapidement que vous pouvez faire passer votre message.',
        enterPassword: 'Veuillez entrer votre mot de passe',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, c'est toujours un plaisir de voir un nouveau visage ici !`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Veuillez saisir le code magique envoyé à ${login}. Il devrait arriver dans une minute ou deux.`,
    },
    login: {
        hero: {
            header: 'Voyage et dépenses, à la vitesse du chat',
            body: "Bienvenue dans la nouvelle génération d'Expensify, où vos déplacements et dépenses avancent plus rapidement grâce à un chat contextuel en temps réel.",
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Vous êtes déjà connecté en tant que ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Vous ne souhaitez pas vous connecter avec ${provider} ?`,
        continueWithMyCurrentSession: 'Continuer avec ma session actuelle',
        redirectToDesktopMessage: "Nous vous redirigerons vers l'application de bureau une fois que vous aurez terminé la connexion.",
        signInAgreementMessage: 'En vous connectant, vous acceptez les conditions de',
        termsOfService: "Conditions d'utilisation",
        privacy: 'Confidentialité',
    },
    samlSignIn: {
        welcomeSAMLEnabled: "Continuer la connexion avec l'authentification unique :",
        orContinueWithMagicCode: 'Vous pouvez également vous connecter avec un code magique',
        useSingleSignOn: 'Utiliser la connexion unique',
        useMagicCode: 'Utiliser le code magique',
        launching: 'Lancement...',
        oneMoment: "Un instant pendant que nous vous redirigeons vers le portail d'authentification unique de votre entreprise.",
    },
    reportActionCompose: {
        dropToUpload: 'Glisser pour télécharger',
        sendAttachment: 'Envoyer la pièce jointe',
        addAttachment: 'Ajouter une pièce jointe',
        writeSomething: 'Écrivez quelque chose...',
        blockedFromConcierge: 'La communication est interdite',
        fileUploadFailed: "Échec du téléchargement. Le fichier n'est pas pris en charge.",
        localTime: ({user, time}: LocalTimeParams) => `C'est ${time} pour ${user}`,
        edited: '(edited)',
        emoji: 'Emoji',
        collapse: 'Réduire',
        expand: 'Développer',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Copier dans le presse-papiers',
        copied: 'Copié !',
        copyLink: 'Copier le lien',
        copyURLToClipboard: "Copier l'URL dans le presse-papiers",
        copyEmailToClipboard: "Copier l'email dans le presse-papiers",
        markAsUnread: 'Marquer comme non lu',
        markAsRead: 'Marquer comme lu',
        editAction: ({action}: EditActionParams) => `Modifier ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'dépense' : 'commentaire'}`,
        deleteAction: ({action}: DeleteActionParams) => `Supprimer ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'dépense' : 'commentaire'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `Êtes-vous sûr de vouloir supprimer ce ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'dépense' : 'commentaire'} ?`,
        onlyVisible: 'Visible uniquement par',
        replyInThread: 'Répondre dans le fil de discussion',
        joinThread: 'Rejoindre la conversation',
        leaveThread: 'Quitter la conversation',
        copyOnyxData: 'Copier les données Onyx',
        flagAsOffensive: 'Signaler comme offensant',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Ajouter une réaction',
        reactedWith: 'a réagi avec',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Vous avez manqué la fête à',
        beginningOfArchivedRoomPartTwo: ", il n'y a rien à voir ici.",
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `Cette discussion regroupe tous les membres Expensify du domaine ${domainRoom}.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Utilisez-le pour discuter avec des collègues, partager des astuces et poser des questions.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Cette conversation est avec',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: "Utilisez-le pour discuter de la configuration de l'espace de travail et plus encore.",
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) => `Cette conversation est avec tout le monde dans ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `Utilisez-le pour les annonces les plus importantes.`,
        beginningOfChatHistoryUserRoomPartOne: 'Cette salle de discussion est pour tout.',
        beginningOfChatHistoryUserRoomPartTwo: 'lié.',
        beginningOfChatHistoryInvoiceRoomPartOne: `Cette conversation est pour les factures entre`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `Utilisez le bouton + pour envoyer une facture.`,
        beginningOfChatHistory: 'Cette conversation est avec',
        beginningOfChatHistoryPolicyExpenseChatPartOne: "C'est ici que",
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'soumettra des dépenses à',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Utilisez simplement le bouton +.',
        beginningOfChatHistorySelfDM: 'Ceci est votre espace personnel. Utilisez-le pour des notes, des tâches, des brouillons et des rappels.',
        beginningOfChatHistorySystemDM: 'Bienvenue ! Commençons votre configuration.',
        chatWithAccountManager: 'Discutez avec votre responsable de compte ici',
        sayHello: 'Dis bonjour !',
        yourSpace: 'Votre espace',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Bienvenue dans ${roomName} !`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Utilisez le bouton + pour ${additionalText} une dépense.`,
        askConcierge: "Posez des questions et bénéficiez d'une assistance en temps réel 24h/24 et 7j/7.",
        conciergeSupport: 'Support 24h/24 et 7j/7',
        create: 'créer',
        iouTypes: {
            pay: 'payer',
            split: 'séparer',
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
    youHaveBeenBanned: 'Note : Vous avez été banni de la discussion dans ce canal.',
    reportTypingIndicator: {
        isTyping: "est en train d'écrire...",
        areTyping: 'est en train de taper...',
        multipleMembers: 'Plusieurs membres',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Cette salle de discussion a été archivée.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Cette conversation n'est plus active car ${displayName} a fermé son compte.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Cette conversation n'est plus active car ${oldDisplayName} a fusionné son compte avec celui de ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Cette conversation n'est plus active car <strong>vous</strong> ne faites plus partie de l'espace de travail ${policyName}.`
                : `Cette conversation n'est plus active car ${displayName} n'est plus membre de l'espace de travail ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Cette discussion n'est plus active car ${policyName} n'est plus un espace de travail actif.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Cette discussion n'est plus active car ${policyName} n'est plus un espace de travail actif.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Cette réservation est archivée.',
    },
    writeCapabilityPage: {
        label: 'Qui peut publier',
        writeCapability: {
            all: 'Tous les membres',
            admins: 'Administrateurs uniquement',
        },
    },
    sidebarScreen: {
        buttonFind: 'Trouvez quelque chose...',
        buttonMySettings: 'Mes paramètres',
        fabNewChat: 'Commencer la conversation',
        fabNewChatExplained: 'Démarrer le chat (Action flottante)',
        chatPinned: 'Chat épinglé',
        draftedMessage: 'Message rédigé',
        listOfChatMessages: 'Liste des messages de chat',
        listOfChats: 'Liste des discussions',
        saveTheWorld: 'Sauver le monde',
        tooltip: 'Commencez ici !',
        redirectToExpensifyClassicModal: {
            title: 'Bientôt disponible',
            description:
                "Nous peaufinons encore quelques détails de la nouvelle version d'Expensify pour l'adapter à votre configuration spécifique. En attendant, rendez-vous sur Expensify Classic.",
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
        upload: 'Télécharger une feuille de calcul',
        dragAndDrop: 'Glissez et déposez votre feuille de calcul ici, ou choisissez un fichier ci-dessous. Formats pris en charge : .csv, .txt, .xls et .xlsx.',
        chooseSpreadsheet: 'Sélectionnez un fichier de feuille de calcul à importer. Formats pris en charge : .csv, .txt, .xls et .xlsx.',
        fileContainsHeader: 'Le fichier contient des en-têtes de colonnes',
        column: ({name}: SpreadSheetColumnParams) => `Colonne ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Oups ! Un champ obligatoire ("${fieldName}") n'a pas été mappé. Veuillez vérifier et réessayer.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `Oups ! Vous avez mappé un seul champ ("${fieldName}") à plusieurs colonnes. Veuillez vérifier et réessayer.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Oups ! Le champ ("${fieldName}") contient une ou plusieurs valeurs vides. Veuillez vérifier et réessayer.`,
        importSuccessfulTitle: 'Importation réussie',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `${categories} catégories ont été ajoutées.` : '1 catégorie a été ajoutée.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return "Aucun membre n'a été ajouté ou mis à jour.";
            }
            if (added && updated) {
                return `${added} membre${added > 1 ? 's' : ''} ajouté, ${updated} membre${updated > 1 ? 's' : ''} mis à jour.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} membres ont été mis à jour.` : '1 membre a été mis à jour.';
            }
            return added > 1 ? `${added} membres ont été ajoutés.` : '1 membre a été ajouté.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `${tags} étiquettes ont été ajoutées.` : '1 étiquette a été ajoutée.'),
        importMultiLevelTagsSuccessfulDescription: 'Des étiquettes à plusieurs niveaux ont été ajoutées.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `${rates} taux journaliers ont été ajoutés.` : '1 taux de per diem a été ajouté.',
        importFailedTitle: "Échec de l'importation",
        importFailedDescription: 'Veuillez vous assurer que tous les champs sont correctement remplis et réessayez. Si le problème persiste, veuillez contacter Concierge.',
        importDescription: 'Choisissez les champs à mapper depuis votre feuille de calcul en cliquant sur le menu déroulant à côté de chaque colonne importée ci-dessous.',
        sizeNotMet: 'La taille du fichier doit être supérieure à 0 octet',
        invalidFileMessage:
            'Le fichier que vous avez téléchargé est soit vide, soit contient des données invalides. Veuillez vous assurer que le fichier est correctement formaté et contient les informations nécessaires avant de le télécharger à nouveau.',
        importSpreadsheet: 'Importer une feuille de calcul',
        downloadCSV: 'Télécharger CSV',
    },
    receipt: {
        upload: 'Télécharger le reçu',
        dragReceiptBeforeEmail: 'Faites glisser un reçu sur cette page, transférez un reçu à',
        dragReceiptAfterEmail: 'ou choisissez un fichier à télécharger ci-dessous.',
        chooseReceipt: 'Choisissez un reçu à télécharger ou transférez un reçu à',
        takePhoto: 'Prendre une photo',
        cameraAccess: "L'accès à la caméra est nécessaire pour prendre des photos des reçus.",
        deniedCameraAccess: "L'accès à la caméra n'a toujours pas été accordé, veuillez suivre",
        deniedCameraAccessInstructions: 'ces instructions',
        cameraErrorTitle: 'Erreur de caméra',
        cameraErrorMessage: "Une erreur s'est produite lors de la prise de la photo. Veuillez réessayer.",
        locationAccessTitle: "Autoriser l'accès à la localisation",
        locationAccessMessage: "L'accès à la localisation nous aide à maintenir votre fuseau horaire et votre devise exacts où que vous soyez.",
        locationErrorTitle: "Autoriser l'accès à la localisation",
        locationErrorMessage: "L'accès à la localisation nous aide à maintenir votre fuseau horaire et votre devise exacts où que vous soyez.",
        allowLocationFromSetting: `L'accès à la localisation nous aide à maintenir votre fuseau horaire et votre devise à jour où que vous soyez. Veuillez autoriser l'accès à la localisation dans les paramètres de permission de votre appareil.`,
        dropTitle: 'Laisse tomber',
        dropMessage: 'Déposez votre fichier ici',
        flash: 'flash',
        multiScan: 'multi-scan',
        shutter: 'obturateur',
        gallery: 'galerie',
        deleteReceipt: 'Supprimer le reçu',
        deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer ce reçu ?',
        addReceipt: 'Ajouter un reçu',
    },
    quickAction: {
        scanReceipt: 'Scanner le reçu',
        recordDistance: 'Suivre la distance',
        requestMoney: 'Créer une dépense',
        perDiem: 'Créer un per diem',
        splitBill: 'Diviser la dépense',
        splitScan: 'Diviser le reçu',
        splitDistance: 'Distance de fractionnement',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Payer ${name ?? "quelqu'un"}`,
        assignTask: 'Attribuer la tâche',
        header: 'Action rapide',
        noLongerHaveReportAccess: "Vous n'avez plus accès à votre destination d'action rapide précédente. Choisissez-en une nouvelle ci-dessous.",
        updateDestination: 'Mettre à jour la destination',
        createReport: 'Créer un rapport',
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
        approved: 'Approuvé',
        cash: 'Espèces',
        card: 'Carte',
        original: 'Original',
        split: 'Diviser',
        splitExpense: 'Diviser la dépense',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} de ${merchant}`,
        addSplit: 'Ajouter une répartition',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Le montant total est supérieur de ${amount} à la dépense initiale.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Le montant total est de ${amount} inférieur à la dépense originale.`,
        splitExpenseZeroAmount: 'Veuillez saisir un montant valide avant de continuer.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Modifier ${amount} pour ${merchant}`,
        removeSplit: 'Supprimer la division',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Payer ${name ?? "quelqu'un"}`,
        expense: 'Dépense',
        categorize: 'Catégoriser',
        share: 'Partager',
        participants: 'Participants',
        createExpense: 'Créer une dépense',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Créer ${expensesNumber} dépenses`,
        addExpense: 'Ajouter une dépense',
        chooseRecipient: 'Choisir le destinataire',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Créer une dépense de ${amount}`,
        confirmDetails: 'Confirmer les détails',
        pay: 'Payer',
        cancelPayment: 'Annuler le paiement',
        cancelPaymentConfirmation: 'Êtes-vous sûr de vouloir annuler ce paiement ?',
        viewDetails: 'Voir les détails',
        pending: 'En attente',
        canceled: 'Annulé',
        posted: 'Publié',
        deleteReceipt: 'Supprimer le reçu',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `a supprimé une dépense sur ce rapport, ${merchant} - ${amount}`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `a déplacé une dépense${reportName ? `de ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `dépense déplacée${reportName ? `vers <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: 'a déplacé cette dépense dans votre espace personnel',
        pendingMatchWithCreditCard: 'Reçu en attente de correspondance avec une transaction par carte',
        pendingMatch: 'Correspondance en attente',
        pendingMatchWithCreditCardDescription: 'Reçu en attente de correspondance avec une transaction par carte. Marquer comme espèces pour annuler.',
        markAsCash: 'Marquer comme espèces',
        routePending: 'Itinéraire en attente...',
        receiptScanning: () => ({
            one: 'Analyse du reçu en cours...',
            other: 'Analyse des reçus en cours...',
        }),
        scanMultipleReceipts: 'Scanner plusieurs reçus',
        scanMultipleReceiptsDescription: "Prenez en photo tous vos reçus en une seule fois, puis confirmez les détails vous-même ou laissez SmartScan s'en charger.",
        receiptScanInProgress: 'Analyse du reçu en cours',
        receiptScanInProgressDescription: 'Analyse du reçu en cours. Revenez plus tard ou saisissez les détails maintenant.',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Des dépenses en double potentielles ont été identifiées. Veuillez vérifier les doublons pour permettre la soumission.'
                : "Des dépenses potentiellement en double ont été identifiées. Veuillez examiner les doublons pour permettre l'approbation.",
        receiptIssuesFound: () => ({
            one: 'Problème détecté',
            other: 'Problèmes détectés',
        }),
        fieldPending: 'En attente...',
        defaultRate: 'Taux par défaut',
        receiptMissingDetails: 'Reçu avec des détails manquants',
        missingAmount: 'Montant manquant',
        missingMerchant: 'Commerçant manquant',
        receiptStatusTitle: 'Analyse en cours…',
        receiptStatusText: 'Vous êtes le seul à pouvoir voir ce reçu pendant son scan. Revenez plus tard ou saisissez les détails maintenant.',
        receiptScanningFailed: 'La numérisation du reçu a échoué. Veuillez saisir les détails manuellement.',
        transactionPendingDescription: 'Transaction en attente. La validation peut prendre quelques jours.',
        companyInfo: "Informations sur l'entreprise",
        companyInfoDescription: 'Nous avons besoin de quelques informations supplémentaires avant que vous puissiez envoyer votre première facture.',
        yourCompanyName: 'Le nom de votre entreprise',
        yourCompanyWebsite: 'Le site web de votre entreprise',
        yourCompanyWebsiteNote: "Si vous n'avez pas de site web, vous pouvez fournir le profil LinkedIn ou les réseaux sociaux de votre entreprise à la place.",
        invalidDomainError: 'Vous avez saisi un domaine invalide. Pour continuer, veuillez entrer un domaine valide.',
        publicDomainError: 'Vous êtes entré dans un domaine public. Pour continuer, veuillez entrer un domaine privé.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} en cours de numérisation`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} en attente`);
            }
            return {
                one: statusText.length > 0 ? `1 dépense (${statusText.join(', ')})` : `1 dépense`,
                other: (count: number) => (statusText.length > 0 ? `${count} dépenses (${statusText.join(', ')})` : `${count} dépenses`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 dépense',
                other: (count: number) => `${count} dépenses`,
            };
        },
        deleteExpense: () => ({
            one: 'Supprimer la dépense',
            other: 'Supprimer les dépenses',
        }),
        deleteConfirmation: () => ({
            one: 'Êtes-vous sûr de vouloir supprimer cette dépense ?',
            other: 'Êtes-vous sûr de vouloir supprimer ces dépenses ?',
        }),
        deleteReport: 'Supprimer le rapport',
        deleteReportConfirmation: 'Êtes-vous sûr de vouloir supprimer ce rapport ?',
        settledExpensify: 'Payé',
        done: 'Terminé',
        settledElsewhere: 'Payé ailleurs',
        individual: 'Individuel',
        business: 'Entreprise',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} avec Expensify` : `Payer avec Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} en tant qu'individu` : `Payer en tant qu'individu`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Payer ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} en tant qu'entreprise` : `Payer en tant qu'entreprise`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} ailleurs` : `Payer ailleurs`),
        nextStep: 'Étapes suivantes',
        finished: 'Terminé',
        sendInvoice: ({amount}: RequestAmountParams) => `Envoyer une facture de ${amount}`,
        submitAmount: ({amount}: RequestAmountParams) => `Soumettre ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        submitted: `soumis`,
        automaticallySubmitted: `soumis via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">soumissions différées</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `suivi de ${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `diviser ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `séparer ${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Votre part de ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} doit ${amount}${comment ? `pour ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} doit :`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''} a payé ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} a payé :`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} a dépensé ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} a dépensé :`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} a approuvé :`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} a approuvé ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `payé ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `payé ${amount}. Ajoutez un compte bancaire pour recevoir votre paiement.`,
        automaticallyApproved: `approuvé via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles de l’espace de travail</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `approuvé ${amount}`,
        approvedMessage: `approuvé`,
        unapproved: `non approuvé`,
        automaticallyForwarded: `approuvé via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles de l’espace de travail</a>`,
        forwarded: `approuvé`,
        rejectedThisReport: 'a rejeté ce rapport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `a commencé à régler. Le paiement est en attente jusqu'à ce que ${submitterDisplayName} ajoute un compte bancaire.`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''} a annulé le paiement`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `a annulé le paiement de ${amount}, car ${submitterDisplayName} n'a pas activé son Expensify Wallet dans les 30 jours`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} a ajouté un compte bancaire. Le paiement de ${amount} a été effectué.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}payé ailleurs`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''} payé avec Expensify`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''} payé avec Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles de l’espace de travail</a>`,
        noReimbursableExpenses: 'Ce rapport contient un montant invalide',
        pendingConversionMessage: 'Le total sera mis à jour lorsque vous serez de nouveau en ligne',
        changedTheExpense: 'modifié la dépense',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `le ${valueName} à ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `définir le ${translatedChangedField} sur ${newMerchant}, ce qui définit le montant à ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `le ${valueName} (précédemment ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `le ${valueName} à ${newValueToDisplay} (précédemment ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `a changé le ${translatedChangedField} en ${newMerchant} (précédemment ${oldMerchant}), ce qui a mis à jour le montant à ${newAmountToDisplay} (précédemment ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `pour ${comment}` : 'dépense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rapport de facture n°${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} envoyé${comment ? `pour ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `dépense déplacée de l'espace personnel vers ${workspaceName ?? `discuter avec ${reportName}`}`,
        movedToPersonalSpace: "dépense déplacée vers l'espace personnel",
        tagSelection: 'Sélectionnez une étiquette pour mieux organiser vos dépenses.',
        categorySelection: 'Sélectionnez une catégorie pour mieux organiser vos dépenses.',
        error: {
            invalidCategoryLength: 'Le nom de la catégorie dépasse 255 caractères. Veuillez le raccourcir ou choisir une catégorie différente.',
            invalidTagLength: 'Le nom de la balise dépasse 255 caractères. Veuillez le raccourcir ou choisir une autre balise.',
            invalidAmount: 'Veuillez saisir un montant valide avant de continuer',
            invalidIntegerAmount: 'Veuillez saisir un montant en dollars entiers avant de continuer',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Le montant maximal de la taxe est de ${amount}`,
            invalidSplit: 'La somme des répartitions doit être égale au montant total',
            invalidSplitParticipants: 'Veuillez saisir un montant supérieur à zéro pour au moins deux participants',
            invalidSplitYourself: 'Veuillez saisir un montant non nul pour votre répartition',
            noParticipantSelected: 'Veuillez sélectionner un participant',
            other: 'Erreur inattendue. Veuillez réessayer plus tard.',
            genericCreateFailureMessage: 'Erreur inattendue lors de la soumission de cette dépense. Veuillez réessayer plus tard.',
            genericCreateInvoiceFailureMessage: "Erreur inattendue lors de l'envoi de cette facture. Veuillez réessayer plus tard.",
            genericHoldExpenseFailureMessage: 'Erreur inattendue lors de la gestion de cette dépense. Veuillez réessayer plus tard.',
            genericUnholdExpenseFailureMessage: 'Erreur inattendue lors de la suppression de la mise en attente de cette dépense. Veuillez réessayer plus tard.',
            receiptDeleteFailureError: 'Erreur inattendue lors de la suppression de ce reçu. Veuillez réessayer plus tard.',
            receiptFailureMessage: 'Une erreur est survenue lors du téléchargement de votre reçu. Veuillez',
            receiptFailureMessageShort: 'Une erreur est survenue lors du téléchargement de votre reçu.',
            tryAgainMessage: 'réessayer',
            saveFileMessage: 'enregistrer le reçu',
            uploadLaterMessage: 'à télécharger plus tard.',
            genericDeleteFailureMessage: 'Erreur inattendue lors de la suppression de cette dépense. Veuillez réessayer plus tard.',
            genericEditFailureMessage: 'Erreur inattendue lors de la modification de cette dépense. Veuillez réessayer plus tard.',
            genericSmartscanFailureMessage: 'La transaction manque de champs',
            duplicateWaypointsErrorMessage: 'Veuillez supprimer les points de passage en double',
            atLeastTwoDifferentWaypoints: 'Veuillez saisir au moins deux adresses différentes',
            splitExpenseMultipleParticipantsErrorMessage: "Une dépense ne peut pas être partagée entre un espace de travail et d'autres membres. Veuillez mettre à jour votre sélection.",
            invalidMerchant: 'Veuillez saisir un commerçant valide',
            atLeastOneAttendee: 'Au moins un participant doit être sélectionné',
            invalidQuantity: 'Veuillez saisir une quantité valide',
            quantityGreaterThanZero: 'La quantité doit être supérieure à zéro',
            invalidSubrateLength: 'Il doit y avoir au moins un sous-taux',
            invalidRate: "Taux non valide pour cet espace de travail. Veuillez sélectionner un taux disponible dans l'espace de travail.",
        },
        dismissReceiptError: "Ignorer l'erreur",
        dismissReceiptErrorConfirmation: 'Attention ! Ignorer cette erreur supprimera entièrement votre reçu téléchargé. Êtes-vous sûr ?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `le règlement a commencé. Le paiement est en attente jusqu'à ce que ${submitterDisplayName} active son portefeuille.`,
        enableWallet: 'Activer le portefeuille',
        hold: 'Attendez',
        unhold: 'Supprimer la mise en attente',
        holdExpense: 'Mettre la dépense en attente',
        unholdExpense: 'Réactiver la dépense',
        heldExpense: 'retenu cette dépense',
        unheldExpense: 'dépense non réglée',
        moveUnreportedExpense: 'Déplacer la dépense non déclarée',
        addUnreportedExpense: 'Ajouter une dépense non déclarée',
        createNewExpense: 'Créer une nouvelle dépense',
        selectUnreportedExpense: 'Sélectionnez au moins une dépense à ajouter au rapport.',
        emptyStateUnreportedExpenseTitle: 'Aucune dépense non déclarée',
        emptyStateUnreportedExpenseSubtitle: "On dirait que vous n'avez aucune dépense non déclarée. Essayez d'en créer une ci-dessous.",
        addUnreportedExpenseConfirm: 'Ajouter au rapport',
        explainHold: 'Expliquez pourquoi vous avez engagé cette dépense.',
        undoSubmit: 'Annuler la soumission',
        retracted: 'retracted',
        undoClose: 'Annuler la fermeture',
        reopened: 'rouvert',
        reopenReport: 'Rouvrir le rapport',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Ce rapport a déjà été exporté vers ${connectionName}. Le modifier pourrait entraîner des divergences de données. Êtes-vous sûr de vouloir rouvrir ce rapport ?`,
        reason: 'Raison',
        holdReasonRequired: 'Une raison est requise lors de la mise en attente.',
        expenseWasPutOnHold: 'La dépense a été mise en attente',
        expenseOnHold: 'Cette dépense a été mise en attente. Veuillez consulter les commentaires pour les prochaines étapes.',
        expensesOnHold: 'Toutes les dépenses ont été mises en attente. Veuillez consulter les commentaires pour les prochaines étapes.',
        expenseDuplicate: 'Cette dépense présente des détails similaires à une autre. Veuillez vérifier les doublons pour continuer.',
        someDuplicatesArePaid: 'Certains de ces doublons ont déjà été approuvés ou payés.',
        reviewDuplicates: 'Examiner les doublons',
        keepAll: 'Tout conserver',
        confirmApprove: "Confirmer le montant de l'approbation",
        confirmApprovalAmount: 'Approuvez uniquement les dépenses conformes, ou approuvez le rapport entier.',
        confirmApprovalAllHoldAmount: () => ({
            one: "Cette dépense est en attente. Voulez-vous l'approuver quand même ?",
            other: 'Ces dépenses sont en attente. Voulez-vous quand même les approuver ?',
        }),
        confirmPay: 'Confirmer le montant du paiement',
        confirmPayAmount: "Payez ce qui n'est pas en attente, ou payez le rapport entier.",
        confirmPayAllHoldAmount: () => ({
            one: 'Cette dépense est en attente. Voulez-vous quand même payer ?',
            other: 'Ces dépenses sont en attente. Voulez-vous quand même les payer ?',
        }),
        payOnly: 'Payer uniquement',
        approveOnly: 'Approuver uniquement',
        holdEducationalTitle: 'Cette demande est en cours',
        holdEducationalText: 'attendre',
        whatIsHoldExplain: "Mettre en attente, c'est comme appuyer sur « pause » sur une dépense pour demander plus de détails avant l'approbation ou le paiement.",
        holdIsLeftBehind: 'Les dépenses en attente sont déplacées vers un autre rapport après approbation ou paiement.',
        unholdWhenReady: "Les approbateurs peuvent lever la suspension des dépenses lorsqu'elles sont prêtes pour approbation ou paiement.",
        changePolicyEducational: {
            title: 'Vous avez déplacé ce rapport !',
            description: 'Vérifiez ces éléments, qui ont tendance à changer lors du déplacement des rapports vers un nouvel espace de travail.',
            reCategorize: '<strong>Re-catégorisez toutes les dépenses</strong> pour respecter les règles de l’espace de travail.',
            workflows: "Ce rapport peut désormais être soumis à un <strong>flux d'approbation</strong> différent.",
        },
        changeWorkspace: "Changer d'espace de travail",
        set: 'définir',
        changed: 'modifié',
        removed: 'supprimé',
        transactionPending: 'Transaction en attente.',
        chooseARate: 'Sélectionnez un taux de remboursement par mile ou kilomètre pour un espace de travail',
        unapprove: 'Désapprouver',
        unapproveReport: 'Désapprouver le rapport',
        headsUp: 'Attention !',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Ce rapport a déjà été exporté vers ${accountingIntegration}. Le modifier peut entraîner des divergences de données. Êtes-vous sûr de vouloir désapprouver ce rapport ?`,
        reimbursable: 'remboursable',
        nonReimbursable: 'non remboursable',
        bookingPending: 'Cette réservation est en attente',
        bookingPendingDescription: "Cette réservation est en attente car elle n'a pas encore été payée.",
        bookingArchived: 'Cette réservation est archivée',
        bookingArchivedDescription: 'Cette réservation est archivée car la date du voyage est passée. Ajoutez une dépense pour le montant final si nécessaire.',
        attendees: 'Participants',
        whoIsYourAccountant: 'Qui est votre comptable ?',
        paymentComplete: 'Paiement terminé',
        time: 'Heure',
        startDate: 'Date de début',
        endDate: 'Date de fin',
        startTime: 'Heure de début',
        endTime: 'Heure de fin',
        deleteSubrate: 'Supprimer le sous-taux',
        deleteSubrateConfirmation: 'Êtes-vous sûr de vouloir supprimer ce sous-taux ?',
        quantity: 'Quantité',
        subrateSelection: 'Sélectionnez un sous-taux et saisissez une quantité.',
        qty: 'Qté',
        firstDayText: () => ({
            one: `Premier jour : 1 heure`,
            other: (count: number) => `Premier jour : ${count.toFixed(2)} heures`,
        }),
        lastDayText: () => ({
            one: `Dernier jour : 1 heure`,
            other: (count: number) => `Dernier jour : ${count.toFixed(2)} heures`,
        }),
        tripLengthText: () => ({
            one: `Voyage : 1 journée complète`,
            other: (count: number) => `Voyage : ${count} jours complets`,
        }),
        dates: 'Dates',
        rates: 'Tarifs',
        submitsTo: ({name}: SubmitsToParams) => `Soumet à ${name}`,
        moveExpenses: () => ({one: 'Déplacer la dépense', other: 'Déplacer les dépenses'}),
    },
    share: {
        shareToExpensify: 'Partager sur Expensify',
        messageInputLabel: 'Message',
    },
    notificationPreferencesPage: {
        header: 'Préférences de notification',
        label: "M'avertir des nouveaux messages",
        notificationPreferences: {
            always: 'Immédiatement',
            daily: 'Quotidien',
            mute: 'Muet',
            hidden: 'Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "Le numéro n'a pas été validé. Cliquez sur le bouton pour renvoyer le lien de validation par SMS.",
        emailHasNotBeenValidated: "L'email n'a pas été validé. Cliquez sur le bouton pour renvoyer le lien de validation par SMS.",
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Télécharger la photo',
        removePhoto: 'Supprimer la photo',
        editImage: 'Modifier la photo',
        viewPhoto: 'Voir la photo',
        imageUploadFailed: "Échec du téléchargement de l'image",
        deleteWorkspaceError: "Désolé, un problème inattendu est survenu lors de la suppression de l'avatar de votre espace de travail",
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `L'image sélectionnée dépasse la taille maximale de téléchargement de ${maxUploadSizeInMB} Mo.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Veuillez télécharger une image plus grande que ${minHeightInPx}x${minWidthInPx} pixels et plus petite que ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `La photo de profil doit être l'un des types suivants : ${allowedExtensions.join(', ')}.`,
    },
    modal: {
        backdropLabel: 'Fond du modal',
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Pronoms préférés',
        selectYourPronouns: 'Sélectionnez vos pronoms',
        selfSelectYourPronoun: 'Choisissez vous-même votre pronom',
        emailAddress: 'Adresse e-mail',
        setMyTimezoneAutomatically: 'Définir automatiquement mon fuseau horaire',
        timezone: 'Fuseau horaire',
        invalidFileMessage: 'Fichier invalide. Veuillez essayer une autre image.',
        avatarUploadFailureMessage: "Une erreur est survenue lors du téléchargement de l'avatar. Veuillez réessayer.",
        online: 'En ligne',
        offline: 'Hors ligne',
        syncing: 'Synchronisation en cours',
        profileAvatar: 'Avatar de profil',
        publicSection: {
            title: 'Public',
            subtitle: 'Ces informations sont affichées sur votre profil public. Tout le monde peut les voir.',
        },
        privateSection: {
            title: 'Privé',
            subtitle: 'Ces informations sont utilisées pour les voyages et les paiements. Elles ne sont jamais affichées sur votre profil public.',
        },
    },
    securityPage: {
        title: 'Options de sécurité',
        subtitle: "Activez l'authentification à deux facteurs pour sécuriser votre compte.",
        goToSecurity: 'Retourner à la page de sécurité',
    },
    shareCodePage: {
        title: 'Votre code',
        subtitle: 'Invitez des membres à Expensify en partageant votre code QR personnel ou votre lien de parrainage.',
    },
    pronounsPage: {
        pronouns: 'Pronoms',
        isShownOnProfile: 'Vos pronoms sont affichés sur votre profil.',
        placeholderText: 'Rechercher pour voir les options',
    },
    contacts: {
        contactMethod: 'Méthode de contact',
        contactMethods: 'Méthodes de contact',
        featureRequiresValidate: 'Cette fonctionnalité nécessite que vous validiez votre compte.',
        validateAccount: 'Validez votre compte',
        helpTextBeforeEmail: 'Ajoutez plus de moyens pour que les gens puissent vous trouver, et transférez les reçus à',
        helpTextAfterEmail: 'à partir de plusieurs adresses e-mail.',
        pleaseVerify: 'Veuillez vérifier ce mode de contact',
        getInTouch: 'Chaque fois que nous aurons besoin de vous contacter, nous utiliserons ce moyen de contact.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Veuillez entrer le code magique envoyé à ${contactMethod}. Il devrait arriver dans une minute ou deux.`,
        setAsDefault: 'Définir par défaut',
        yourDefaultContactMethod:
            'Ceci est votre méthode de contact par défaut actuelle. Avant de pouvoir la supprimer, vous devez choisir une autre méthode de contact et cliquer sur « Définir par défaut ».',
        removeContactMethod: 'Supprimer la méthode de contact',
        removeAreYouSure: 'Êtes-vous sûr de vouloir supprimer ce mode de contact ? Cette action est irréversible.',
        failedNewContact: "Échec de l'ajout de ce mode de contact.",
        genericFailureMessages: {
            requestContactMethodValidateCode: "Échec de l'envoi d'un nouveau code magique. Veuillez patienter un moment et réessayer.",
            validateSecondaryLogin: 'Code magique incorrect ou invalide. Veuillez réessayer ou demander un nouveau code.',
            deleteContactMethod: "Échec de la suppression du mode de contact. Veuillez contacter Concierge pour obtenir de l'aide.",
            setDefaultContactMethod: "Échec de la définition d'une nouvelle méthode de contact par défaut. Veuillez contacter Concierge pour obtenir de l'aide.",
            addContactMethod: "Échec de l'ajout de ce mode de contact. Veuillez contacter Concierge pour obtenir de l'aide.",
            enteredMethodIsAlreadySubmitted: 'Cette méthode de contact existe déjà',
            passwordRequired: 'mot de passe requis.',
            contactMethodRequired: 'La méthode de contact est requise',
            invalidContactMethod: 'Méthode de contact invalide',
        },
        newContactMethod: 'Nouvelle méthode de contact',
        goBackContactMethods: 'Retourner aux méthodes de contact',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Il / Lui / Son',
        heHimHisTheyThemTheirs: 'Il / Lui / Son / Ils / Eux / Leurs',
        sheHerHers: 'Elle / Elle / À elle',
        sheHerHersTheyThemTheirs: 'Elle / Elle / À elle / Ils / Eux / À eux',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Par / Pers',
        theyThemTheirs: 'Ils / Eux / Leurs',
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
        headerTitle: 'Nom affiché',
        isShownOnProfile: "Votre nom d'affichage est affiché sur votre profil.",
    },
    timezonePage: {
        timezone: 'Fuseau horaire',
        isShownOnProfile: 'Votre fuseau horaire est affiché sur votre profil.',
        getLocationAutomatically: 'Déterminez automatiquement votre position',
    },
    updateRequiredView: {
        updateRequired: 'Mise à jour requise',
        pleaseInstall: 'Veuillez mettre à jour vers la dernière version de New Expensify',
        pleaseInstallExpensifyClassic: "Veuillez installer la dernière version d'Expensify",
        toGetLatestChanges: 'Pour mobile ou ordinateur de bureau, téléchargez et installez la dernière version. Pour le web, actualisez votre navigateur.',
        newAppNotAvailable: "La nouvelle application Expensify n'est plus disponible.",
    },
    initialSettingsPage: {
        about: 'À propos',
        aboutPage: {
            description: "La nouvelle application Expensify est développée par une communauté de développeurs open-source du monde entier. Aidez-nous à construire le futur d'Expensify.",
            appDownloadLinks: "Liens de téléchargement de l'application",
            viewKeyboardShortcuts: 'Voir les raccourcis clavier',
            viewTheCode: 'Voir le code',
            viewOpenJobs: "Voir les offres d'emploi ouvertes",
            reportABug: 'Signaler un bug',
            troubleshoot: 'Dépanner',
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
            clearCacheAndRestart: 'Vider le cache et redémarrer',
            viewConsole: 'Afficher la console de débogage',
            debugConsole: 'Console de débogage',
            description: "Utilisez les outils ci-dessous pour vous aider à résoudre les problèmes liés à l'expérience Expensify. Si vous rencontrez des problèmes, veuillez",
            submitBug: 'signaler un bug',
            confirmResetDescription: 'Tous les brouillons non envoyés seront perdus, mais le reste de vos données est en sécurité.',
            resetAndRefresh: 'Réinitialiser et actualiser',
            clientSideLogging: 'Journalisation côté client',
            noLogsToShare: 'Aucun journal à partager',
            useProfiling: 'Utiliser le profilage',
            profileTrace: 'Trace de profil',
            releaseOptions: 'Options de publication',
            testingPreferences: 'Test des préférences',
            useStagingServer: 'Utiliser le serveur de préproduction',
            forceOffline: 'Forcer hors ligne',
            simulatePoorConnection: 'Simuler une connexion Internet lente',
            simulateFailingNetworkRequests: 'Simuler des requêtes réseau échouées',
            authenticationStatus: "Statut d'authentification",
            deviceCredentials: "Identifiants de l'appareil",
            invalidate: 'Invalider',
            destroy: 'Détruire',
            maskExportOnyxStateData: "Masquer les données sensibles des membres lors de l'exportation de l'état Onyx",
            exportOnyxState: "Exporter l'état Onyx",
            importOnyxState: "Importer l'état Onyx",
            testCrash: 'Test crash',
            resetToOriginalState: "Réinitialiser à l'état d'origine",
            usingImportedState: 'Vous utilisez un état importé. Appuyez ici pour le réinitialiser.',
            debugMode: 'Mode débogage',
            invalidFile: 'Fichier invalide',
            invalidFileDescription: "Le fichier que vous essayez d'importer n'est pas valide. Veuillez réessayer.",
            invalidateWithDelay: 'Invalider avec délai',
        },
        debugConsole: {
            saveLog: 'Enregistrer le journal',
            shareLog: 'Partager le journal',
            enterCommand: 'Entrer la commande',
            execute: 'Exécuter',
            noLogsAvailable: 'Aucun journal disponible',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `La taille du journal dépasse la limite de ${size} Mo. Veuillez utiliser "Enregistrer le journal" pour télécharger le fichier journal à la place.`,
            logs: 'Journaux',
            viewConsole: 'Afficher la console',
        },
        security: 'Sécurité',
        signOut: 'Se déconnecter',
        restoreStashed: 'Restaurer la connexion mise en réserve',
        signOutConfirmationText: 'Vous perdrez toutes les modifications hors ligne si vous vous déconnectez.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Lire le',
            phrase2: "Conditions d'utilisation",
            phrase3: 'et',
            phrase4: 'Confidentialité',
        },
        help: 'Aide',
        accountSettings: 'Paramètres du compte',
        account: 'Compte',
        general: 'Général',
    },
    closeAccountPage: {
        closeAccount: 'Fermer le compte',
        reasonForLeavingPrompt: 'Nous détesterions vous voir partir ! Pourriez-vous nous dire pourquoi, afin que nous puissions nous améliorer ?',
        enterMessageHere: 'Entrez le message ici',
        closeAccountWarning: 'La fermeture de votre compte est irréversible.',
        closeAccountPermanentlyDeleteData: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cela supprimera définitivement toutes les dépenses en cours.',
        enterDefaultContactToConfirm: 'Veuillez saisir votre méthode de contact par défaut pour confirmer que vous souhaitez fermer votre compte. Votre méthode de contact par défaut est :',
        enterDefaultContact: 'Entrez votre méthode de contact par défaut',
        defaultContact: 'Méthode de contact par défaut :',
        enterYourDefaultContactMethod: 'Veuillez saisir votre méthode de contact par défaut pour clôturer votre compte.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Fusionner les comptes',
        accountDetails: {
            accountToMergeInto: 'Entrez le compte dans lequel vous souhaitez fusionner',
            notReversibleConsent: "Je comprends que cela n'est pas réversible",
        },
        accountValidate: {
            confirmMerge: 'Êtes-vous sûr de vouloir fusionner les comptes ?',
            lossOfUnsubmittedData: `La fusion de vos comptes est irréversible et entraînera la perte de toutes les dépenses non soumises pour`,
            enterMagicCode: `Pour continuer, veuillez saisir le code magique envoyé à`,
            errors: {
                incorrectMagicCode: 'Code magique incorrect ou invalide. Veuillez réessayer ou demander un nouveau code.',
                fallback: 'Quelque chose a mal tourné. Veuillez réessayer plus tard.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Comptes fusionnés !',
            successfullyMergedAllData: {
                beforeFirstEmail: `Vous avez fusionné avec succès toutes les données de`,
                beforeSecondEmail: `dans`,
                afterSecondEmail: `. Dorénavant, vous pouvez utiliser l'un ou l'autre des identifiants pour ce compte.`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Nous y travaillons',
            limitedSupport: 'Nous ne supportons pas encore la fusion des comptes sur New Expensify. Veuillez effectuer cette action sur Expensify Classic à la place.',
            reachOutForHelp: {
                beforeLink: "N'hésitez pas à",
                linkText: 'contacter Concierge',
                afterLink: 'si vous avez des questions !',
            },
            goToExpensifyClassic: 'Aller à Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Vous ne pouvez pas fusionner',
            beforeDomain: "parce qu'il est contrôlé par",
            afterDomain: ". S'il vous plaît",
            linkText: 'contacter Concierge',
            afterLink: 'pour assistance.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: "dans d'autres comptes car votre administrateur de domaine l'a défini comme votre connexion principale. Veuillez plutôt fusionner les autres comptes avec celui-ci.",
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Vous ne pouvez pas fusionner les comptes parce que',
                beforeSecondEmail: "a activé l'authentification à deux facteurs (2FA). Veuillez désactiver la 2FA pour",
                afterSecondEmail: 'et réessayez.',
            },
            learnMore: 'En savoir plus sur la fusion des comptes.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: "parce qu'il est verrouillé. Veuillez",
            linkText: 'contactez Concierge',
            afterLink: `pour assistance.`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Vous ne pouvez pas fusionner les comptes parce que',
                afterEmail: "n'a pas de compte Expensify.",
            },
            addContactMethod: {
                beforeLink: "S'il vous plaît",
                linkText: 'ajoutez-le comme méthode de contact',
                afterLink: 'à la place.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: "dans d'autres comptes. Veuillez plutôt fusionner les autres comptes avec celui-ci.",
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: "dans d'autres comptes car il s'agit du propriétaire de la facturation d'un compte facturé. Veuillez plutôt fusionner les autres comptes avec celui-ci.",
        },
        mergeFailureTooManyAttempts: {
            heading: 'Réessayez plus tard',
            description: 'Il y a eu trop de tentatives de fusion des comptes. Veuillez réessayer plus tard.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "Vous ne pouvez pas fusionner avec d'autres comptes car il n'est pas validé. Veuillez valider le compte et réessayer.",
        },
        mergeFailureSelfMerge: {
            description: 'Vous ne pouvez pas fusionner un compte avec lui-même.',
        },
        mergeFailureGenericHeading: 'Impossible de fusionner les comptes',
    },
    lockAccountPage: {
        lockAccount: 'Verrouiller le compte',
        unlockAccount: 'Déverrouiller le compte',
        compromisedDescription:
            'Si vous pensez que votre compte Expensify est compromis, vous pouvez le verrouiller pour empêcher les nouvelles transactions avec la carte Expensify et bloquer les modifications indésirables du compte.',
        domainAdminsDescriptionPartOne: 'Pour les administrateurs de domaine,',
        domainAdminsDescriptionPartTwo: 'cette action arrête toute activité de la carte Expensify ainsi que les actions administratives',
        domainAdminsDescriptionPartThree: 'à travers votre(s) domaine(s).',
        warning: `Une fois que votre compte est verrouillé, notre équipe enquêtera et supprimera tout accès non autorisé. Pour retrouver l'accès, vous devrez collaborer avec Concierge pour sécuriser votre compte.`,
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Échec du verrouillage du compte',
        failedToLockAccountDescription: `Nous n'avons pas pu verrouiller votre compte. Veuillez discuter avec Concierge pour résoudre ce problème.`,
        chatWithConcierge: 'Discuter avec Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Compte verrouillé',
        yourAccountIsLocked: 'Votre compte est verrouillé',
        chatToConciergeToUnlock: 'Discutez avec Concierge pour résoudre les problèmes de sécurité et débloquer votre compte.',
        chatWithConcierge: 'Discuter avec Concierge',
    },
    passwordPage: {
        changePassword: 'Changer le mot de passe',
        changingYourPasswordPrompt: 'Changer votre mot de passe mettra à jour votre mot de passe pour vos comptes Expensify.com et New Expensify.',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        newPasswordPrompt:
            'Votre nouveau mot de passe doit être différent de votre ancien mot de passe et contenir au moins 8 caractères, 1 lettre majuscule, 1 lettre minuscule et 1 chiffre.',
    },
    twoFactorAuth: {
        headerTitle: 'Authentification à deux facteurs',
        twoFactorAuthEnabled: 'Authentification à deux facteurs activée',
        whatIsTwoFactorAuth:
            "L'authentification à deux facteurs (2FA) aide à sécuriser votre compte. Lors de la connexion, vous devrez saisir un code généré par votre application d'authentification préférée.",
        disableTwoFactorAuth: "Désactiver l'authentification à deux facteurs",
        explainProcessToRemove: "Pour désactiver l'authentification à deux facteurs (2FA), veuillez saisir un code valide provenant de votre application d'authentification.",
        disabled: "L'authentification à deux facteurs est maintenant désactivée",
        noAuthenticatorApp: "Vous n'aurez plus besoin d'une application d'authentification pour vous connecter à Expensify.",
        stepCodes: 'Codes de récupération',
        keepCodesSafe: 'Gardez ces codes de récupération en sécurité !',
        codesLoseAccess:
            "Si vous perdez l'accès à votre application d'authentification et que vous ne disposez pas de ces codes, vous perdrez l'accès à votre compte.\n\nRemarque : La configuration de l'authentification à deux facteurs vous déconnectera de toutes les autres sessions actives.",
        errorStepCodes: 'Veuillez copier ou télécharger les codes avant de continuer',
        stepVerify: 'Vérifier',
        scanCode: 'Scannez le code QR en utilisant votre',
        authenticatorApp: "application d'authentification",
        addKey: "Ou ajoutez cette clé secrète à votre application d'authentification :",
        enterCode: "Ensuite, saisissez le code à six chiffres généré par votre application d'authentification.",
        stepSuccess: 'Terminé',
        enabled: 'Authentification à deux facteurs activée',
        congrats: 'Félicitations ! Vous bénéficiez maintenant de cette sécurité supplémentaire.',
        copy: 'Copier',
        disable: 'Désactiver',
        enableTwoFactorAuth: "Activer l'authentification à deux facteurs",
        pleaseEnableTwoFactorAuth: "Veuillez activer l'authentification à deux facteurs.",
        twoFactorAuthIsRequiredDescription: "Pour des raisons de sécurité, Xero nécessite une authentification à deux facteurs pour connecter l'intégration.",
        twoFactorAuthIsRequiredForAdminsHeader: 'Authentification à deux facteurs requise',
        twoFactorAuthIsRequiredForAdminsTitle: "Veuillez activer l'authentification à deux facteurs",
        twoFactorAuthIsRequiredForAdminsDescription:
            "Votre connexion comptable Xero nécessite l'utilisation de l'authentification à deux facteurs. Pour continuer à utiliser Expensify, veuillez l'activer.",
        twoFactorAuthCannotDisable: 'Impossible de désactiver la 2FA',
        twoFactorAuthRequired: "L'authentification à deux facteurs (2FA) est requise pour votre connexion Xero et ne peut pas être désactivée.",
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Veuillez entrer votre code de récupération',
            incorrectRecoveryCode: 'Code de récupération incorrect. Veuillez réessayer.',
        },
        useRecoveryCode: 'Utiliser le code de récupération',
        recoveryCode: 'Code de récupération',
        use2fa: "Utiliser le code d'authentification à deux facteurs",
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: "Veuillez saisir votre code d'authentification à deux facteurs",
            incorrect2fa: "Code d'authentification à deux facteurs incorrect. Veuillez réessayer.",
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Mot de passe mis à jour !',
        allSet: 'Tout est prêt. Gardez votre nouveau mot de passe en sécurité.',
    },
    privateNotes: {
        title: 'Notes privées',
        personalNoteMessage: 'Conservez des notes sur cette conversation ici. Vous êtes la seule personne à pouvoir ajouter, modifier ou consulter ces notes.',
        sharedNoteMessage: "Conservez ici les notes concernant cette conversation. Les employés d'Expensify et les autres membres du domaine team.expensify.com peuvent consulter ces notes.",
        composerLabel: 'Notes',
        myNote: 'Ma note',
        error: {
            genericFailureMessage: "Les notes privées n'ont pas pu être enregistrées",
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Veuillez saisir un code de sécurité valide',
        },
        securityCode: 'Code de sécurité',
        changeBillingCurrency: 'Changer la devise de facturation',
        changePaymentCurrency: 'Changer la devise de paiement',
        paymentCurrency: 'Devise de paiement',
        paymentCurrencyDescription: 'Sélectionnez une devise standardisée à laquelle toutes les dépenses personnelles doivent être converties',
        note: 'Remarque : Modifier votre devise de paiement peut influencer le montant que vous paierez pour Expensify. Consultez notre',
        noteLink: 'page de tarification',
        noteDetails: 'pour plus de détails.',
    },
    addDebitCardPage: {
        addADebitCard: 'Ajouter une carte de débit',
        nameOnCard: 'Nom sur la carte',
        debitCardNumber: 'Numéro de carte de débit',
        expiration: "Date d'expiration",
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adresse de facturation',
        growlMessageOnSave: 'Votre carte de débit a été ajoutée avec succès',
        expensifyPassword: 'Mot de passe Expensify',
        error: {
            invalidName: 'Le nom ne peut contenir que des lettres',
            addressZipCode: 'Veuillez saisir un code postal valide',
            debitCardNumber: 'Veuillez saisir un numéro de carte de débit valide',
            expirationDate: "Veuillez sélectionner une date d'expiration valide",
            securityCode: 'Veuillez saisir un code de sécurité valide',
            addressStreet: "Veuillez saisir une adresse de facturation valide qui n'est pas une boîte postale.",
            addressState: 'Veuillez sélectionner un état',
            addressCity: 'Veuillez saisir une ville',
            genericFailureMessage: "Une erreur s'est produite lors de l'ajout de votre carte. Veuillez réessayer.",
            password: 'Veuillez saisir votre mot de passe Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Ajouter une carte de paiement',
        nameOnCard: 'Nom sur la carte',
        paymentCardNumber: 'Numéro de carte',
        expiration: "Date d'expiration",
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adresse de facturation',
        growlMessageOnSave: 'Votre carte de paiement a été ajoutée avec succès',
        expensifyPassword: 'Mot de passe Expensify',
        error: {
            invalidName: 'Le nom ne peut contenir que des lettres',
            addressZipCode: 'Veuillez saisir un code postal valide',
            paymentCardNumber: 'Veuillez saisir un numéro de carte valide',
            expirationDate: "Veuillez sélectionner une date d'expiration valide",
            securityCode: 'Veuillez saisir un code de sécurité valide',
            addressStreet: "Veuillez saisir une adresse de facturation valide qui n'est pas une boîte postale.",
            addressState: 'Veuillez sélectionner un état',
            addressCity: 'Veuillez saisir une ville',
            genericFailureMessage: "Une erreur s'est produite lors de l'ajout de votre carte. Veuillez réessayer.",
            password: 'Veuillez saisir votre mot de passe Expensify',
        },
    },
    walletPage: {
        balance: 'Solde',
        paymentMethodsTitle: 'Méthodes de paiement',
        setDefaultConfirmation: 'Définir le mode de paiement par défaut',
        setDefaultSuccess: 'Méthode de paiement par défaut définie !',
        deleteAccount: 'Supprimer le compte',
        deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer ce compte ?',
        error: {
            notOwnerOfBankAccount: "Une erreur s'est produite lors de la définition de ce compte bancaire comme votre méthode de paiement par défaut",
            invalidBankAccount: 'Ce compte bancaire est temporairement suspendu',
            notOwnerOfFund: "Une erreur s'est produite lors de la définition de cette carte comme méthode de paiement par défaut",
            setDefaultFailure: "Une erreur s'est produite. Veuillez discuter avec Concierge pour obtenir une assistance supplémentaire.",
        },
        addBankAccountFailure: "Une erreur inattendue s'est produite lors de la tentative d'ajout de votre compte bancaire. Veuillez réessayer.",
        getPaidFaster: 'Recevez vos paiements plus rapidement',
        addPaymentMethod: "Ajoutez un mode de paiement pour envoyer et recevoir des paiements directement dans l'application.",
        getPaidBackFaster: 'Soyez remboursé plus rapidement',
        secureAccessToYourMoney: 'Accès sécurisé à votre argent',
        receiveMoney: "Recevez de l'argent dans votre devise locale",
        expensifyWallet: 'Portefeuille Expensify (Bêta)',
        sendAndReceiveMoney: "Envoyez et recevez de l'argent avec des amis. Comptes bancaires américains uniquement.",
        enableWallet: 'Activer le portefeuille',
        addBankAccountToSendAndReceive: 'Soyez remboursé des dépenses que vous soumettez à un espace de travail.',
        addBankAccount: 'Ajouter un compte bancaire',
        assignedCards: 'Cartes attribuées',
        assignedCardsDescription: "Ce sont des cartes attribuées par un administrateur d'espace de travail pour gérer les dépenses de l'entreprise.",
        expensifyCard: 'Carte Expensify',
        walletActivationPending: 'Nous examinons vos informations. Veuillez revenir dans quelques minutes !',
        walletActivationFailed: 'Malheureusement, votre portefeuille ne peut pas être activé pour le moment. Veuillez discuter avec Concierge pour obtenir une assistance supplémentaire.',
        addYourBankAccount: 'Ajouter votre compte bancaire',
        addBankAccountBody: "Connectons votre compte bancaire à Expensify pour que ce soit plus facile que jamais d'envoyer et de recevoir des paiements directement dans l'application.",
        chooseYourBankAccount: 'Choisissez votre compte bancaire',
        chooseAccountBody: 'Assurez-vous de choisir le bon.',
        confirmYourBankAccount: 'Confirmez votre compte bancaire',
    },
    cardPage: {
        expensifyCard: 'Carte Expensify',
        expensifyTravelCard: 'Carte de voyage Expensify',
        availableSpend: 'Limite restant',
        smartLimit: {
            name: 'Limite intelligent',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Vous pouvez dépenser jusqu'à ${formattedLimit} avec cette carte, et la limite sera réinitialisée au fur et à mesure que vos dépenses soumises seront approuvées.`,
        },
        fixedLimit: {
            name: 'Limite fixe',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Vous pouvez dépenser jusqu'à ${formattedLimit} sur cette carte, puis elle sera désactivée.`,
        },
        monthlyLimit: {
            name: 'Limite mensuel',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Vous pouvez dépenser jusqu'à ${formattedLimit} sur cette carte par mois. La limite sera réinitialisée le 1er jour de chaque mois calendaire.`,
        },
        virtualCardNumber: 'Numéro de carte virtuelle',
        travelCardCvv: 'CVV de la carte de voyage',
        physicalCardNumber: 'Numéro de carte physique',
        getPhysicalCard: 'Obtenir une carte physique',
        reportFraud: 'Signaler une fraude par carte virtuelle',
        reportTravelFraud: 'Signaler une fraude liée à une carte de voyage',
        reviewTransaction: 'Revoir la transaction',
        suspiciousBannerTitle: 'Transaction suspecte',
        suspiciousBannerDescription: 'Nous avons détecté des transactions suspectes sur votre carte. Appuyez ci-dessous pour les examiner.',
        cardLocked: 'Votre carte est temporairement bloquée pendant que notre équipe examine le compte de votre entreprise.',
        cardDetails: {
            cardNumber: 'Numéro de carte virtuelle',
            expiration: 'Expiration',
            cvv: 'CVV',
            address: 'Adresse',
            revealDetails: 'Afficher les détails',
            revealCvv: 'Afficher le CVV',
            copyCardNumber: 'Copier le numéro de carte',
            updateAddress: "Mettre à jour l'adresse",
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Ajouté au portefeuille ${platform}`,
        cardDetailsLoadingFailure: 'Une erreur est survenue lors du chargement des détails de la carte. Veuillez vérifier votre connexion Internet et réessayer.',
        validateCardTitle: "Assurons-nous que c'est bien vous",
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Veuillez saisir le code magique envoyé à ${contactMethod} pour voir les détails de votre carte. Il devrait arriver dans une minute ou deux.`,
    },
    workflowsPage: {
        workflowTitle: 'Dépense',
        workflowDescription: "Configurez un flux de travail à partir du moment où la dépense est engagée, incluant l'approbation et le paiement.",
        delaySubmissionTitle: 'Retarder les soumissions',
        delaySubmissionDescription:
            'Choisissez un calendrier personnalisé pour la soumission des dépenses, ou laissez cette option désactivée pour des mises à jour en temps réel des dépenses.',
        submissionFrequency: 'Fréquence de soumission',
        submissionFrequencyDateOfMonth: 'Date du mois',
        addApprovalsTitle: 'Ajouter des approbations',
        addApprovalButton: "Ajouter un flux de travail d'approbation",
        addApprovalTip: "Ce flux de travail par défaut s'applique à tous les membres, sauf si un flux de travail plus spécifique existe.",
        approver: 'Approbateur',
        connectBankAccount: 'Connecter un compte bancaire',
        addApprovalsDescription: "Exiger une approbation supplémentaire avant d'autoriser un paiement.",
        makeOrTrackPaymentsTitle: 'Effectuer ou suivre les paiements',
        makeOrTrackPaymentsDescription: 'Ajoutez un payeur autorisé pour les paiements effectués dans Expensify ou suivez les paiements effectués ailleurs.',
        editor: {
            submissionFrequency: 'Choisissez la durée pendant laquelle Expensify doit attendre avant de partager les dépenses sans erreur.',
        },
        frequencyDescription: 'Choisissez la fréquence à laquelle vous souhaitez que les dépenses soient soumises automatiquement, ou choisissez de le faire manuellement',
        frequencies: {
            instant: 'Instantané',
            weekly: 'Hebdomadaire',
            monthly: 'Mensuel',
            twiceAMonth: 'Deux fois par mois',
            byTrip: 'Par voyage',
            manually: 'Manuellement',
            daily: 'Quotidien',
            lastDayOfMonth: 'Dernier jour du mois',
            lastBusinessDayOfMonth: 'Dernier jour ouvrable du mois',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Premier',
                '2': 'Seconde',
                '3': 'Troisième',
                '4': 'Quatrième',
                '5': 'Cinquième',
                '6': 'Sixième',
                '7': 'Septième',
                '8': 'Huitième',
                '9': 'Neuvième',
                '10': 'Dixième',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: "Ce membre appartient déjà à un autre flux d'approbation. Toute mise à jour ici sera également reflétée là-bas.",
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> approuve déjà les rapports de <strong>${name2}</strong>. Veuillez choisir un autre approbateur pour éviter un flux de travail circulaire.`,
        emptyContent: {
            title: 'Aucun membre à afficher',
            expensesFromSubtitle: "Tous les membres de l'espace de travail appartiennent déjà à un flux d'approbation existant.",
            approverSubtitle: 'Tous les approbateurs appartiennent à un flux de travail existant.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: "La soumission retardée n'a pas pu être modifiée. Veuillez réessayer ou contacter le support.",
        autoReportingFrequencyErrorMessage: "La fréquence de soumission n'a pas pu être modifiée. Veuillez réessayer ou contacter le support.",
        monthlyOffsetErrorMessage: "La fréquence mensuelle n'a pas pu être modifiée. Veuillez réessayer ou contacter le support.",
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirmer',
        header: "Ajoutez plus d'approbateurs et confirmez.",
        additionalApprover: 'Approbateur supplémentaire',
        submitButton: 'Ajouter un flux de travail',
    },
    workflowsEditApprovalsPage: {
        title: "Modifier le flux d'approbation",
        deleteTitle: "Supprimer le flux d'approbation",
        deletePrompt: "Êtes-vous sûr de vouloir supprimer ce flux d'approbation ? Tous les membres suivront ensuite le flux de travail par défaut.",
    },
    workflowsExpensesFromPage: {
        title: 'Dépenses de',
        header: 'Lorsque les membres suivants soumettent des dépenses :',
    },
    workflowsApproverPage: {
        genericErrorMessage: "Le validateur n'a pas pu être modifié. Veuillez réessayer ou contacter le support.",
        header: 'Envoyer à ce membre pour approbation :',
    },
    workflowsPayerPage: {
        title: 'Payeur autorisé',
        genericErrorMessage: "Le payeur autorisé n'a pas pu être modifié. Veuillez réessayer.",
        admins: 'Administrateurs',
        payer: 'Payer',
        paymentAccount: 'Compte de paiement',
    },
    reportFraudPage: {
        title: 'Signaler une fraude par carte virtuelle',
        description:
            'Si les détails de votre carte virtuelle ont été volés ou compromis, nous désactiverons définitivement votre carte existante et vous fournirons une nouvelle carte virtuelle avec un nouveau numéro.',
        deactivateCard: 'Désactiver la carte',
        reportVirtualCardFraud: 'Signaler une fraude par carte virtuelle',
    },
    reportFraudConfirmationPage: {
        title: 'Fraude par carte signalée',
        description: 'Nous avons désactivé définitivement votre carte existante. Lorsque vous reviendrez consulter les détails de votre carte, une nouvelle carte virtuelle sera disponible.',
        buttonText: 'Compris, merci !',
    },
    activateCardPage: {
        activateCard: 'Activer la carte',
        pleaseEnterLastFour: 'Veuillez saisir les quatre derniers chiffres de votre carte.',
        activatePhysicalCard: 'Activer la carte physique',
        error: {
            thatDidNotMatch: 'Les 4 derniers chiffres ne correspondent pas à ceux de votre carte. Veuillez réessayer.',
            throttled:
                'Vous avez saisi incorrectement les 4 derniers chiffres de votre carte Expensify trop de fois. Si vous êtes sûr que les chiffres sont corrects, veuillez contacter Concierge pour résoudre le problème. Sinon, réessayez plus tard.',
        },
    },
    getPhysicalCard: {
        header: 'Obtenir une carte physique',
        nameMessage: 'Entrez votre prénom et votre nom de famille, car ils seront affichés sur votre carte.',
        legalName: 'Nom légal',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        phoneMessage: 'Entrez votre numéro de téléphone.',
        phoneNumber: 'Numéro de téléphone',
        address: 'Adresse',
        addressMessage: 'Entrez votre adresse de livraison.',
        streetAddress: 'Adresse postale',
        city: 'Ville',
        state: 'État',
        zipPostcode: 'Code postal',
        country: 'Pays',
        confirmMessage: 'Veuillez confirmer vos informations ci-dessous.',
        estimatedDeliveryMessage: 'Votre carte physique arrivera dans 2 à 3 jours ouvrables.',
        next: 'Suivant',
        getPhysicalCard: 'Obtenir une carte physique',
        shipCard: "Carte d'expédition",
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transférer${amount ? ` ${amount}` : ''}`,
        instant: 'Instantané (carte de débit)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `Frais de ${rate}% (${minAmount} minimum)`,
        ach: '1-3 jours ouvrables (compte bancaire)',
        achSummary: 'Sans frais',
        whichAccount: 'Quel compte ?',
        fee: 'Frais',
        transferSuccess: 'Transfert réussi !',
        transferDetailBankAccount: 'Votre argent devrait arriver dans les 1 à 3 jours ouvrables suivants.',
        transferDetailDebitCard: 'Votre argent devrait arriver immédiatement.',
        failedTransfer: 'Votre solde n’est pas entièrement réglé. Veuillez effectuer un virement vers un compte bancaire.',
        notHereSubTitle: 'Veuillez transférer votre solde depuis la page du portefeuille.',
        goToWallet: 'Aller au Portefeuille',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Choisir un compte',
    },
    paymentMethodList: {
        addPaymentMethod: 'Ajouter un mode de paiement',
        addNewDebitCard: 'Ajouter une nouvelle carte de débit',
        addNewBankAccount: 'Ajouter un nouveau compte bancaire',
        accountLastFour: 'Se terminant par',
        cardLastFour: 'Carte se terminant par',
        addFirstPaymentMethod: "Ajoutez un mode de paiement pour envoyer et recevoir des paiements directement dans l'application.",
        defaultPaymentMethod: 'Par défaut',
    },
    preferencesPage: {
        appSection: {
            title: "Préférences de l'application",
        },
        testSection: {
            title: 'Préférences de test',
            subtitle: "Paramètres pour aider à déboguer et tester l'application en staging.",
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: "Recevez les mises à jour des fonctionnalités pertinentes et les actualités d'Expensify",
        muteAllSounds: "Désactiver tous les sons d'Expensify",
    },
    priorityModePage: {
        priorityMode: 'Mode prioritaire',
        explainerText: "Choisissez de #vous concentrer uniquement sur les discussions non lues et épinglées, ou d'afficher tout avec les discussions les plus récentes et épinglées en haut.",
        priorityModes: {
            default: {
                label: 'Le plus récent',
                description: 'Afficher toutes les discussions triées par les plus récentes',
            },
            gsd: {
                label: '#focus',
                description: 'Afficher uniquement les non lus triés par ordre alphabétique',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `dans ${policyName}`,
        generatingPDF: 'Génération du PDF',
        waitForPDF: 'Veuillez patienter pendant que nous générons le PDF',
        errorPDF: "Une erreur s'est produite lors de la tentative de génération de votre PDF",
        generatedPDF: 'Le PDF de votre rapport a été généré !',
    },
    reportDescriptionPage: {
        roomDescription: 'Description de la chambre',
        roomDescriptionOptional: 'Description de la chambre (optionnel)',
        explainerText: 'Définissez une description personnalisée pour la salle.',
    },
    groupChat: {
        lastMemberTitle: 'Attention !',
        lastMemberWarning: 'Puisque vous êtes la dernière personne ici, partir rendra cette conversation inaccessible à tous les membres. Êtes-vous sûr de vouloir partir ?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Le chat de groupe de ${displayName}`,
    },
    languagePage: {
        language: 'Langue',
        aiGenerated: 'Les traductions pour cette langue sont générées automatiquement et peuvent contenir des erreurs.',
    },
    themePage: {
        theme: 'Thème',
        themes: {
            dark: {
                label: 'Sombre',
            },
            light: {
                label: 'Clair',
            },
            system: {
                label: "Utiliser les paramètres de l'appareil",
            },
        },
        chooseThemeBelowOrSync: 'Choisissez un thème ci-dessous, ou synchronisez avec les paramètres de votre appareil.',
    },
    termsOfUse: {
        phrase1: 'En vous connectant, vous acceptez les conditions de',
        phrase2: "Conditions d'utilisation",
        phrase3: 'et',
        phrase4: 'Confidentialité',
        phrase5: `La transmission d'argent est fournie par ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (ID NMLS : 2017010) conformément à ses`,
        phrase6: 'licences',
    },
    validateCodeForm: {
        magicCodeNotReceived: "Vous n'avez pas reçu de code magique ?",
        enterAuthenticatorCode: "Veuillez entrer votre code d'authentification",
        enterRecoveryCode: 'Veuillez entrer votre code de récupération',
        requiredWhen2FAEnabled: "Requis lorsque l'authentification à deux facteurs est activée",
        requestNewCode: 'Demander un nouveau code dans',
        requestNewCodeAfterErrorOccurred: 'Demander un nouveau code',
        error: {
            pleaseFillMagicCode: 'Veuillez entrer votre code magique',
            incorrectMagicCode: 'Code magique incorrect ou invalide. Veuillez réessayer ou demander un nouveau code.',
            pleaseFillTwoFactorAuth: "Veuillez saisir votre code d'authentification à deux facteurs",
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Veuillez remplir tous les champs',
        pleaseFillPassword: 'Veuillez entrer votre mot de passe',
        pleaseFillTwoFactorAuth: 'Veuillez saisir votre code à deux facteurs',
        enterYourTwoFactorAuthenticationCodeToContinue: "Entrez votre code d'authentification à deux facteurs pour continuer",
        forgot: 'Oublié ?',
        requiredWhen2FAEnabled: "Requis lorsque l'authentification à deux facteurs est activée",
        error: {
            incorrectPassword: 'Mot de passe incorrect. Veuillez réessayer.',
            incorrectLoginOrPassword: 'Identifiant ou mot de passe incorrect. Veuillez réessayer.',
            incorrect2fa: "Code d'authentification à deux facteurs incorrect. Veuillez réessayer.",
            twoFactorAuthenticationEnabled: 'Vous avez activé la 2FA sur ce compte. Veuillez vous connecter en utilisant votre email ou numéro de téléphone.',
            invalidLoginOrPassword: 'Identifiant ou mot de passe invalide. Veuillez réessayer ou réinitialiser votre mot de passe.',
            unableToResetPassword:
                "Nous n'avons pas pu changer votre mot de passe. Cela est probablement dû à un lien de réinitialisation de mot de passe expiré dans un ancien email de réinitialisation. Nous vous avons envoyé un nouveau lien par email afin que vous puissiez réessayer. Vérifiez votre boîte de réception ainsi que votre dossier Spam ; il devrait arriver dans quelques minutes.",
            noAccess: "Vous n'avez pas accès à cette application. Veuillez ajouter votre nom d'utilisateur GitHub pour obtenir l'accès.",
            accountLocked: 'Votre compte a été verrouillé après trop de tentatives infructueuses. Veuillez réessayer après 1 heure.',
            fallback: 'Quelque chose a mal tourné. Veuillez réessayer plus tard.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Téléphone ou email',
        error: {
            invalidFormatEmailLogin: "L'adresse e-mail saisie est invalide. Veuillez corriger le format et réessayer.",
        },
        cannotGetAccountDetails: 'Impossible de récupérer les détails du compte. Veuillez essayer de vous connecter à nouveau.',
        loginForm: 'Formulaire de connexion',
        notYou: ({user}: NotYouParams) => `Pas ${user} ?`,
    },
    onboarding: {
        welcome: 'Bienvenue !',
        welcomeSignOffTitleManageTeam:
            "Une fois que vous aurez terminé les tâches ci-dessus, nous pourrons explorer davantage de fonctionnalités telles que les flux d'approbation et les règles !",
        welcomeSignOffTitle: 'Ravi de vous rencontrer !',
        explanationModal: {
            title: 'Bienvenue sur Expensify',
            description:
                'Une application pour gérer vos dépenses professionnelles et personnelles à la vitesse du chat. Essayez-la et dites-nous ce que vous en pensez. Beaucoup plus à venir !',
            secondaryDescription: "Pour revenir à Expensify Classic, il suffit d'appuyer sur votre photo de profil > Aller à Expensify Classic.",
        },
        welcomeVideo: {
            title: 'Bienvenue sur Expensify',
            description: 'Une application pour gérer toutes vos dépenses professionnelles et personnelles dans une conversation. Conçue pour votre entreprise, votre équipe et vos amis.',
        },
        getStarted: 'Commencer',
        whatsYourName: 'Comment vous appelez-vous ?',
        peopleYouMayKnow: 'Les personnes que vous connaissez sont déjà ici ! Vérifiez votre e-mail pour les rejoindre.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Quelqu'un de ${domain} a déjà créé un espace de travail. Veuillez saisir le code magique envoyé à ${email}.`,
        joinAWorkspace: 'Rejoindre un espace de travail',
        listOfWorkspaces: 'Voici la liste des espaces de travail que vous pouvez rejoindre. Ne vous inquiétez pas, vous pouvez toujours les rejoindre plus tard si vous préférez.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membre${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Où travaillez-vous ?',
        errorSelection: 'Sélectionnez une option pour continuer',
        purpose: {
            title: "Que souhaitez-vous faire aujourd'hui ?",
            errorContinue: 'Veuillez appuyer sur continuer pour commencer la configuration',
            errorBackButton: "Veuillez terminer les questions de configuration pour commencer à utiliser l'application",
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Me faire rembourser par mon employeur',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gérer les dépenses de mon équipe',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Suivre et budgétiser les dépenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Discuter et partager les dépenses avec des amis',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: "Quelque chose d'autre",
        },
        employees: {
            title: "Combien d'employés avez-vous ?",
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1 000 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Plus de 1 000 employés',
        },
        accounting: {
            title: 'Utilisez-vous un logiciel de comptabilité ?',
            none: 'Aucun',
        },
        error: {
            requiredFirstName: 'Veuillez saisir votre prénom pour continuer',
        },
        workEmail: {
            title: 'Quelle est votre adresse e-mail professionnelle ?',
            subtitle: 'Expensify fonctionne mieux lorsque vous connectez votre email professionnel.',
            explanationModal: {
                descriptionOne: 'Transférez à receipts@expensify.com pour numérisation',
                descriptionTwo: 'Rejoignez vos collègues qui utilisent déjà Expensify',
                descriptionThree: "Profitez d'une expérience plus personnalisée",
            },
            addWorkEmail: 'Ajouter un e-mail professionnel',
        },
        workEmailValidation: {
            title: 'Vérifiez votre e-mail professionnel',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Veuillez saisir le code magique envoyé à ${workEmail}. Il devrait arriver dans une minute ou deux.`,
        },
        workEmailValidationError: {
            publicEmail: "Veuillez saisir une adresse e-mail professionnelle valide provenant d'un domaine privé, par exemple mitch@company.com",
            offline: "Nous n'avons pas pu ajouter votre e-mail professionnel car vous semblez être hors ligne",
        },
        mergeBlockScreen: {
            title: "Impossible d'ajouter l'email professionnel",
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nous n'avons pas pu ajouter ${workEmail}. Veuillez réessayer plus tard dans les Paramètres ou discuter avec Concierge pour obtenir de l'aide.`,
        },
        workspace: {
            title: 'Restez organisé avec un espace de travail',
            subtitle: 'Débloquez des outils puissants pour simplifier la gestion de vos dépenses, le tout en un seul endroit. Avec un espace de travail, vous pouvez :',
            explanationModal: {
                descriptionOne: 'Suivre et organiser les reçus',
                descriptionTwo: 'Catégoriser et taguer les dépenses',
                descriptionThree: 'Créer et partager des rapports',
            },
            price: 'Essayez gratuitement pendant 30 jours, puis passez à la version supérieure pour seulement <strong>5 $/mois</strong>.',
            createWorkspace: 'Créer un espace de travail',
        },
        confirmWorkspace: {
            title: "Confirmer l'espace de travail",
            subtitle: 'Créez un espace de travail pour suivre les reçus, rembourser les dépenses, gérer les voyages, créer des rapports, et plus encore — le tout à la vitesse du chat.',
        },
        inviteMembers: {
            title: 'Inviter des membres',
            subtitle: 'Gérez et partagez vos dépenses avec un comptable ou créez un groupe de voyage avec des amis.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Ne plus me montrer ceci',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Le nom ne peut pas contenir les mots Expensify ou Concierge',
            hasInvalidCharacter: 'Le nom ne peut pas contenir de virgule ni de point-virgule',
            requiredFirstName: 'Le prénom ne peut pas être vide',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Quel est votre nom légal ?',
        enterDateOfBirth: 'Quelle est votre date de naissance ?',
        enterAddress: 'Quelle est votre adresse ?',
        enterPhoneNumber: 'Quel est votre numéro de téléphone ?',
        personalDetails: 'Détails personnels',
        privateDataMessage: 'Ces informations sont utilisées pour les voyages et les paiements. Elles ne sont jamais affichées sur votre profil public.',
        legalName: 'Nom légal',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `La date doit être antérieure au ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `La date doit être après ${dateString}`,
            hasInvalidCharacter: 'Le nom ne peut inclure que des caractères latins',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Format de code postal incorrect${zipFormat ? `Format acceptable : ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Veuillez vous assurer que le numéro de téléphone est valide (par exemple ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Le lien a été renvoyé',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `J'ai envoyé un lien de connexion magique à ${login}. Veuillez vérifier votre ${loginType} pour vous connecter.`,
        resendLink: 'Renvoyer le lien',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Pour valider ${secondaryLogin}, veuillez renvoyer le code magique depuis les Paramètres du compte de ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Si vous n'avez plus accès à ${primaryLogin}, veuillez dissocier vos comptes.`,
        unlink: 'Dissocier',
        linkSent: 'Lien envoyé !',
        successfullyUnlinkedLogin: 'Connexion secondaire dissociée avec succès !',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Notre fournisseur de messagerie a temporairement suspendu les e-mails vers ${login} en raison de problèmes de livraison. Pour débloquer votre connexion, veuillez suivre ces étapes :`,
        confirmThat: ({login}: ConfirmThatParams) => `Confirmez que ${login} est correctement orthographié et qu'il s'agit d'une adresse e-mail réelle et distribuable.`,
        emailAliases: 'Les alias email tels que "expenses@domain.com" doivent avoir accès à leur propre boîte de réception pour que ce soit une connexion Expensify valide.',
        ensureYourEmailClient: 'Assurez-vous que votre client de messagerie autorise les e-mails provenant de expensify.com.',
        youCanFindDirections: 'Vous pouvez trouver les instructions pour compléter cette étape',
        helpConfigure: "mais vous pourriez avoir besoin de l'aide de votre service informatique pour configurer les paramètres de votre messagerie.",
        onceTheAbove: 'Une fois les étapes ci-dessus terminées, veuillez contacter',
        toUnblock: 'pour débloquer votre connexion.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nous n'avons pas pu envoyer de messages SMS à ${login}, nous l'avons donc suspendu temporairement. Veuillez essayer de valider votre numéro :`,
        validationSuccess: 'Votre numéro a été validé ! Cliquez ci-dessous pour envoyer un nouveau code magique de connexion.',
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
                return 'Veuillez patienter un instant avant de réessayer.';
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
            return `Accrochez-vous ! Vous devez attendre ${timeText} avant de tenter de valider votre numéro à nouveau.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Rejoindre',
    },
    detailsPage: {
        localTime: 'Heure locale',
    },
    newChatPage: {
        startGroup: 'Démarrer un groupe',
        addToGroup: 'Ajouter au groupe',
    },
    yearPickerPage: {
        year: 'Année',
        selectYear: 'Veuillez sélectionner une année',
    },
    focusModeUpdateModal: {
        title: 'Bienvenue en mode #focus !',
        prompt: 'Restez au courant en ne voyant que les discussions non lues ou celles qui nécessitent votre attention. Ne vous inquiétez pas, vous pouvez modifier cela à tout moment dans',
        settings: 'paramètres',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'La conversation que vous recherchez est introuvable.',
        getMeOutOfHere: "Sors-moi d'ici",
        iouReportNotFound: 'Les détails de paiement que vous recherchez sont introuvables.',
        notHere: "Hmm... ce n'est pas ici",
        pageNotFound: 'Oups, cette page est introuvable',
        noAccess: 'Cette discussion ou dépense a peut-être été supprimée ou vous n’y avez pas accès.\n\nPour toute question, veuillez contacter concierge@expensify.com',
        goBackHome: "Retour à la page d'accueil",
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oups... ${isBreakLine ? '\n' : ''}Quelque chose a mal tourné`,
        subtitle: "Votre demande n'a pas pu être traitée. Veuillez réessayer plus tard.",
    },
    setPasswordPage: {
        enterPassword: 'Entrez un mot de passe',
        setPassword: 'Définir le mot de passe',
        newPasswordPrompt: 'Votre mot de passe doit contenir au moins 8 caractères, 1 lettre majuscule, 1 lettre minuscule et 1 chiffre.',
        passwordFormTitle: 'Bienvenue dans le nouveau Expensify ! Veuillez définir votre mot de passe.',
        passwordNotSet: "Nous n'avons pas pu définir votre nouveau mot de passe. Nous vous avons envoyé un lien pour créer un nouveau mot de passe afin que vous puissiez réessayer.",
        setPasswordLinkInvalid: 'Ce lien de définition de mot de passe est invalide ou a expiré. Un nouveau vous attend dans votre boîte de réception e-mail !',
        validateAccount: 'Vérifier le compte',
    },
    statusPage: {
        status: 'Statut',
        statusExplanation: 'Ajoutez un emoji pour permettre à vos collègues et amis de savoir facilement ce qui se passe. Vous pouvez également ajouter un message si vous le souhaitez !',
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
            custom: 'Personnalisé',
        },
        untilTomorrow: 'À demain',
        untilTime: ({time}: UntilTimeParams) => `Jusqu'à ${time}`,
        date: 'Date',
        time: 'Heure',
        clearAfter: 'Effacer après',
        whenClearStatus: 'Quand devons-nous effacer votre statut ?',
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Étape ${step}`;
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
        manuallyAdd: 'Ajouter manuellement votre compte bancaire',
        letsDoubleCheck: 'Vérifions une seconde fois que tout semble correct.',
        accountEnding: 'Compte se terminant par',
        thisBankAccount: 'Ce compte bancaire sera utilisé pour les paiements professionnels dans votre espace de travail.',
        accountNumber: 'Numéro de compte',
        routingNumber: "Numéro d'acheminement",
        chooseAnAccountBelow: 'Choisissez un compte ci-dessous',
        addBankAccount: 'Ajouter un compte bancaire',
        chooseAnAccount: 'Choisissez un compte',
        connectOnlineWithPlaid: 'Connectez-vous à votre banque',
        connectManually: 'Se connecter manuellement',
        desktopConnection: 'Remarque : Pour vous connecter avec Chase, Wells Fargo, Capital One ou Bank of America, veuillez cliquer ici pour terminer ce processus dans un navigateur.',
        yourDataIsSecure: 'Vos données sont sécurisées',
        toGetStarted:
            'Ajoutez un compte bancaire pour rembourser les dépenses, émettre des cartes Expensify, collecter les paiements de factures et régler les factures, le tout depuis un seul endroit.',
        plaidBodyCopy: "Offrez à vos employés un moyen plus simple de payer - et de se faire rembourser - les dépenses de l'entreprise.",
        checkHelpLine: "Votre numéro d'acheminement et votre numéro de compte peuvent être trouvés sur un chèque du compte.",
        hasPhoneLoginError: {
            phrase1: "Pour connecter un compte bancaire, veuillez s'il vous plaît",
            link: 'ajoutez un e-mail comme connexion principale',
            phrase2: 'et réessayez. Vous pouvez ajouter votre numéro de téléphone comme connexion secondaire.',
        },
        hasBeenThrottledError: "Une erreur s'est produite lors de l'ajout de votre compte bancaire. Veuillez patienter quelques minutes et réessayer.",
        hasCurrencyError: {
            phrase1: "Oups ! Il semble que la devise de votre espace de travail soit définie sur une devise différente de l'USD. Pour continuer, veuillez vous rendre sur",
            link: "vos paramètres d'espace de travail",
            phrase2: 'à le régler sur USD et réessayer.',
        },
        error: {
            youNeedToSelectAnOption: 'Veuillez sélectionner une option pour continuer',
            noBankAccountAvailable: 'Désolé, aucun compte bancaire disponible',
            noBankAccountSelected: 'Veuillez choisir un compte',
            taxID: "Veuillez saisir un numéro d'identification fiscale valide",
            website: 'Veuillez entrer un site web valide',
            zipCode: `Veuillez saisir un code postal valide en utilisant le format : ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Veuillez saisir un numéro de téléphone valide',
            email: 'Veuillez saisir une adresse e-mail valide',
            companyName: "Veuillez entrer un nom d'entreprise valide",
            addressCity: 'Veuillez entrer une ville valide',
            addressStreet: 'Veuillez saisir une adresse postale valide',
            addressState: 'Veuillez sélectionner un état valide',
            incorporationDateFuture: 'La date de constitution ne peut pas être dans le futur',
            incorporationState: 'Veuillez sélectionner un état valide',
            industryCode: "Veuillez saisir un code de classification d'industrie valide comportant six chiffres",
            restrictedBusiness: "Veuillez confirmer que l'entreprise ne figure pas sur la liste des entreprises restreintes.",
            routingNumber: "Veuillez saisir un numéro d'acheminement valide",
            accountNumber: 'Veuillez saisir un numéro de compte valide',
            routingAndAccountNumberCannotBeSame: 'Les numéros de routage et de compte ne peuvent pas correspondre',
            companyType: "Veuillez sélectionner un type d'entreprise valide",
            tooManyAttempts:
                "En raison d'un grand nombre de tentatives de connexion, cette option a été désactivée pendant 24 heures. Veuillez réessayer plus tard ou saisir les informations manuellement.",
            address: 'Veuillez saisir une adresse valide',
            dob: 'Veuillez sélectionner une date de naissance valide',
            age: 'Vous devez avoir plus de 18 ans',
            ssnLast4: 'Veuillez saisir les 4 derniers chiffres valides du SSN',
            firstName: 'Veuillez entrer un prénom valide',
            lastName: 'Veuillez saisir un nom de famille valide',
            noDefaultDepositAccountOrDebitCardAvailable: 'Veuillez ajouter un compte de dépôt par défaut ou une carte de débit',
            validationAmounts: 'Les montants de validation que vous avez saisis sont incorrects. Veuillez vérifier à nouveau votre relevé bancaire et réessayer.',
            fullName: 'Veuillez saisir un nom complet valide',
            ownershipPercentage: 'Veuillez saisir un pourcentage valide',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Où se trouve votre compte bancaire ?',
        accountDetailsStepHeader: 'Quels sont les détails de votre compte ?',
        accountTypeStepHeader: 'Quel type de compte est-ce ?',
        bankInformationStepHeader: 'Quels sont vos coordonnées bancaires ?',
        accountHolderInformationStepHeader: 'Quels sont les détails du titulaire du compte ?',
        howDoWeProtectYourData: 'Comment protégeons-nous vos données ?',
        currencyHeader: 'Quelle est la devise de votre compte bancaire ?',
        confirmationStepHeader: 'Vérifiez vos informations.',
        confirmationStepSubHeader: 'Vérifiez à nouveau les détails ci-dessous, puis cochez la case des conditions pour confirmer.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Entrez le mot de passe Expensify',
        alreadyAdded: 'Ce compte a déjà été ajouté.',
        chooseAccountLabel: 'Compte',
        successTitle: 'Compte bancaire personnel ajouté !',
        successMessage: 'Félicitations, votre compte bancaire est configuré et prêt à recevoir les remboursements.',
    },
    attachmentView: {
        unknownFilename: 'Nom de fichier inconnu',
        passwordRequired: 'Veuillez entrer un mot de passe',
        passwordIncorrect: 'Mot de passe incorrect. Veuillez réessayer.',
        failedToLoadPDF: 'Échec du chargement du fichier PDF',
        pdfPasswordForm: {
            title: 'PDF protégé par mot de passe',
            infoText: 'Ce PDF est protégé par un mot de passe.',
            beforeLinkText: "S'il vous plaît",
            linkText: 'entrez le mot de passe',
            afterLinkText: 'pour le voir.',
            formLabel: 'Voir le PDF',
        },
        attachmentNotFound: 'Pièce jointe introuvable',
    },
    messages: {
        errorMessageInvalidPhone: `Veuillez saisir un numéro de téléphone valide sans parenthèses ni tirets. Si vous êtes en dehors des États-Unis, veuillez inclure votre indicatif pays (par exemple ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Email invalide',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} est déjà membre de ${name}`,
    },
    onfidoStep: {
        acceptTerms: "En poursuivant la demande d'activation de votre Expensify Wallet, vous confirmez avoir lu, compris et accepté",
        facialScan: "Politique et autorisation de scan facial d'Onfido",
        tryAgain: 'Réessayez',
        verifyIdentity: "Vérifier l'identité",
        letsVerifyIdentity: 'Vérifions votre identité',
        butFirst: `Mais d'abord, les choses ennuyeuses. Lisez les mentions légales à l'étape suivante et cliquez sur "Accepter" lorsque vous êtes prêt.`,
        genericError: "Une erreur s'est produite lors du traitement de cette étape. Veuillez réessayer.",
        cameraPermissionsNotGranted: "Activer l'accès à la caméra",
        cameraRequestMessage: "Nous avons besoin d'accéder à votre caméra pour compléter la vérification du compte bancaire. Veuillez l'activer via Réglages > New Expensify.",
        microphonePermissionsNotGranted: "Activer l'accès au microphone",
        microphoneRequestMessage: "Nous avons besoin d'accéder à votre microphone pour compléter la vérification du compte bancaire. Veuillez l'activer via Réglages > New Expensify.",
        originalDocumentNeeded: "Veuillez télécharger une image originale de votre pièce d'identité plutôt qu'une capture d'écran ou une image scannée.",
        documentNeedsBetterQuality:
            "Votre pièce d'identité semble être endommagée ou présente des éléments de sécurité manquants. Veuillez télécharger une image originale d'une pièce d'identité intacte et entièrement visible.",
        imageNeedsBetterQuality:
            "Il y a un problème avec la qualité de l'image de votre pièce d'identité. Veuillez télécharger une nouvelle image où l'intégralité de votre pièce d'identité est clairement visible.",
        selfieIssue: 'Il y a un problème avec votre selfie/vidéo. Veuillez télécharger un selfie/vidéo en direct.',
        selfieNotMatching: "Votre selfie/vidéo ne correspond pas à votre pièce d'identité. Veuillez télécharger un nouveau selfie/vidéo où votre visage est clairement visible.",
        selfieNotLive: 'Votre selfie/vidéo ne semble pas être une photo/vidéo en direct. Veuillez télécharger un selfie/vidéo en direct.',
    },
    additionalDetailsStep: {
        headerTitle: 'Détails supplémentaires',
        helpText: "Nous devons confirmer les informations suivantes avant que vous puissiez envoyer et recevoir de l'argent depuis votre portefeuille.",
        helpTextIdologyQuestions: 'Nous devons vous poser encore quelques questions pour terminer la validation de votre identité.',
        helpLink: 'En savoir plus sur les raisons pour lesquelles nous en avons besoin.',
        legalFirstNameLabel: 'Prénom légal',
        legalMiddleNameLabel: 'Deuxième prénom légal',
        legalLastNameLabel: 'Nom de famille légal',
        selectAnswer: 'Veuillez sélectionner une réponse pour continuer',
        ssnFull9Error: 'Veuillez entrer un numéro de sécurité sociale valide à neuf chiffres',
        needSSNFull9: 'Nous rencontrons des difficultés pour vérifier votre SSN. Veuillez saisir les neuf chiffres complets de votre SSN.',
        weCouldNotVerify: "Nous n'avons pas pu vérifier",
        pleaseFixIt: 'Veuillez corriger ces informations avant de continuer',
        failedKYCTextBefore: "Nous n'avons pas pu vérifier votre identité. Veuillez réessayer plus tard ou contacter",
        failedKYCTextAfter: 'si vous avez des questions.',
    },
    termsStep: {
        headerTitle: 'Conditions et frais',
        headerTitleRefactor: 'Frais et conditions',
        haveReadAndAgree: "J'ai lu et j'accepte de recevoir",
        electronicDisclosures: 'divulgations électroniques',
        agreeToThe: "Je suis d'accord avec le",
        walletAgreement: 'Accord du portefeuille',
        enablePayments: 'Activer les paiements',
        monthlyFee: 'Frais mensuels',
        inactivity: 'Inactivité',
        noOverdraftOrCredit: 'Pas de fonction de découvert/crédit.',
        electronicFundsWithdrawal: 'Retrait de fonds électroniques',
        standard: 'Standard',
        reviewTheFees: 'Jetez un œil à certains frais.',
        checkTheBoxes: 'Veuillez cocher les cases ci-dessous.',
        agreeToTerms: 'Acceptez les conditions et vous serez prêt à partir !',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Le portefeuille Expensify est émis par ${walletProgram}.`,
            perPurchase: 'Par achat',
            atmWithdrawal: 'Retrait au distributeur automatique',
            cashReload: 'Rechargement en espèces',
            inNetwork: 'dans le réseau',
            outOfNetwork: 'hors réseau',
            atmBalanceInquiry: 'Consultation du solde au distributeur automatique',
            inOrOutOfNetwork: '(dans le réseau ou hors réseau)',
            customerService: 'Service client',
            automatedOrLive: '(automatisé ou agent en direct)',
            afterTwelveMonths: '(après 12 mois sans transactions)',
            weChargeOneFee: "Nous facturons un autre type de frais. Il s'agit de :",
            fdicInsurance: "Vos fonds sont éligibles à l'assurance FDIC.",
            generalInfo: 'Pour des informations générales sur les comptes prépayés, visitez',
            conditionsDetails: 'Pour les détails et conditions de tous les frais et services, visitez',
            conditionsPhone: 'ou en appelant le +1 833-400-0904.',
            instant: '(instantané)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Une liste de tous les frais du Wallet Expensify',
            typeOfFeeHeader: 'Tous les frais',
            feeAmountHeader: 'Montant',
            moreDetailsHeader: 'Détails',
            openingAccountTitle: "Ouverture d'un compte",
            openingAccountDetails: "Il n'y a pas de frais pour ouvrir un compte.",
            monthlyFeeDetails: "Il n'y a pas de frais mensuels.",
            customerServiceTitle: 'Service client',
            customerServiceDetails: "Il n'y a pas de frais de service client.",
            inactivityDetails: "Il n'y a pas de frais d'inactivité.",
            sendingFundsTitle: 'Envoi de fonds à un autre titulaire de compte',
            sendingFundsDetails: "Il n'y a aucun frais pour envoyer des fonds à un autre titulaire de compte en utilisant votre solde, compte bancaire ou carte de débit.",
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
            fdicInsuranceBancorp2: 'pour plus de détails.',
            contactExpensifyPayments: `Contactez ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} en appelant le +1 833-400-0904, par email à`,
            contactExpensifyPayments2: 'ou connectez-vous à',
            generalInformation: 'Pour des informations générales sur les comptes prépayés, visitez',
            generalInformation2: 'Si vous avez une plainte concernant un compte prépayé, appelez le Consumer Financial Protection Bureau au 1-855-411-2372 ou visitez',
            printerFriendlyView: 'Voir la version imprimable',
            automated: 'Automatisé',
            liveAgent: 'Agent en direct',
            instant: 'Instantané',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Activer les paiements',
        activatedTitle: 'Portefeuille activé !',
        activatedMessage: 'Félicitations, votre portefeuille est configuré et prêt à effectuer des paiements.',
        checkBackLaterTitle: 'Juste une minute...',
        checkBackLaterMessage: 'Nous examinons toujours vos informations. Veuillez revenir plus tard.',
        continueToPayment: 'Continuer vers le paiement',
        continueToTransfer: 'Continuer le transfert',
    },
    companyStep: {
        headerTitle: "Informations sur l'entreprise",
        subtitle: 'Presque terminé ! Pour des raisons de sécurité, nous devons confirmer certaines informations :',
        legalBusinessName: 'Raison sociale',
        companyWebsite: "Site web de l'entreprise",
        taxIDNumber: "Numéro d'identification fiscale",
        taxIDNumberPlaceholder: '9 chiffres',
        companyType: "Type d'entreprise",
        incorporationDate: "Date d'incorporation",
        incorporationState: "État d'incorporation",
        industryClassificationCode: 'Code de classification industrielle',
        confirmCompanyIsNot: 'Je confirme que cette entreprise ne figure pas sur la',
        listOfRestrictedBusinesses: 'liste des entreprises restreintes',
        incorporationDatePlaceholder: 'Date de début (aaaa-mm-jj)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partenariat',
            COOPERATIVE: 'Coopératif',
            SOLE_PROPRIETORSHIP: 'Entreprise individuelle',
            OTHER: 'Autre',
        },
        industryClassification: "Dans quelle industrie l'entreprise est-elle classée ?",
        industryClassificationCodePlaceholder: 'Rechercher un code de classification industrielle',
    },
    requestorStep: {
        headerTitle: 'Informations personnelles',
        learnMore: 'En savoir plus',
        isMyDataSafe: 'Mes données sont-elles en sécurité ?',
    },
    personalInfoStep: {
        personalInfo: 'Informations personnelles',
        enterYourLegalFirstAndLast: 'Quel est votre nom légal ?',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        legalName: 'Nom légal',
        enterYourDateOfBirth: 'Quelle est votre date de naissance ?',
        enterTheLast4: 'Quels sont les quatre derniers chiffres de votre numéro de sécurité sociale ?',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucune vérification de crédit personnelle !',
        last4SSN: 'Les 4 derniers chiffres du SSN',
        enterYourAddress: 'Quelle est votre adresse ?',
        address: 'Adresse',
        letsDoubleCheck: 'Vérifions une seconde fois que tout semble correct.',
        byAddingThisBankAccount: 'En ajoutant ce compte bancaire, vous confirmez avoir lu, compris et accepté',
        whatsYourLegalName: 'Quel est votre nom légal ?',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        whatsYourAddress: 'Quelle est votre adresse ?',
        whatsYourSSN: 'Quels sont les quatre derniers chiffres de votre numéro de sécurité sociale ?',
        noPersonalChecks: 'Ne vous inquiétez pas, aucune vérification de crédit personnelle ici !',
        whatsYourPhoneNumber: 'Quel est votre numéro de téléphone ?',
        weNeedThisToVerify: 'Nous avons besoin de cela pour vérifier votre portefeuille.',
    },
    businessInfoStep: {
        businessInfo: "Informations sur l'entreprise",
        enterTheNameOfYourBusiness: 'Quel est le nom de votre entreprise ?',
        businessName: "Nom légal de l'entreprise",
        enterYourCompanyTaxIdNumber: "Quel est le numéro d'identification fiscale de votre entreprise ?",
        taxIDNumber: "Numéro d'identification fiscale",
        taxIDNumberPlaceholder: '9 chiffres',
        enterYourCompanyWebsite: 'Quel est le site web de votre entreprise ?',
        companyWebsite: "Site web de l'entreprise",
        enterYourCompanyPhoneNumber: 'Quel est le numéro de téléphone de votre entreprise ?',
        enterYourCompanyAddress: "Quelle est l'adresse de votre entreprise ?",
        selectYourCompanyType: "Quel type d'entreprise est-ce ?",
        companyType: "Type d'entreprise",
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partenariat',
            COOPERATIVE: 'Coopératif',
            SOLE_PROPRIETORSHIP: 'Entreprise individuelle',
            OTHER: 'Autre',
        },
        selectYourCompanyIncorporationDate: 'Quelle est la date de constitution de votre entreprise ?',
        incorporationDate: "Date d'incorporation",
        incorporationDatePlaceholder: 'Date de début (aaaa-mm-jj)',
        incorporationState: "État d'incorporation",
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'Dans quel état votre entreprise a-t-elle été constituée ?',
        letsDoubleCheck: 'Vérifions une seconde fois que tout semble correct.',
        companyAddress: "Adresse de l'entreprise",
        listOfRestrictedBusinesses: 'liste des entreprises restreintes',
        confirmCompanyIsNot: 'Je confirme que cette entreprise ne figure pas sur la',
        businessInfoTitle: 'Informations commerciales',
        legalBusinessName: 'Raison sociale',
        whatsTheBusinessName: "Quel est le nom de l'entreprise ?",
        whatsTheBusinessAddress: "Quelle est l'adresse professionnelle ?",
        whatsTheBusinessContactInformation: 'Quelles sont les coordonnées professionnelles ?',
        whatsTheBusinessRegistrationNumber: "Quel est le numéro d'enregistrement de l'entreprise ?",
        whatsTheBusinessTaxIDEIN: "Quel est le numéro d'identification fiscale/de l'EIN/de la TVA/du GST de l'entreprise ?",
        whatsThisNumber: 'Quel est ce numéro ?',
        whereWasTheBusinessIncorporated: "Où l'entreprise a-t-elle été constituée ?",
        whatTypeOfBusinessIsIt: "Quel type d'entreprise est-ce ?",
        whatsTheBusinessAnnualPayment: "Quel est le volume annuel des paiements de l'entreprise ?",
        whatsYourExpectedAverageReimbursements: 'Quel est le montant moyen de remboursement que vous attendez ?',
        registrationNumber: "Numéro d'enregistrement",
        taxIDEIN: "Numéro d'identification fiscale/EIN",
        businessAddress: 'Adresse professionnelle',
        businessType: "Type d'entreprise",
        incorporation: 'Incorporation',
        incorporationCountry: "Pays d'incorporation",
        incorporationTypeName: "Type d'incorporation",
        businessCategory: "Catégorie d'entreprise",
        annualPaymentVolume: 'Volume annuel des paiements',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Volume annuel des paiements en ${currencyCode}`,
        averageReimbursementAmount: 'Montant moyen de remboursement',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Montant moyen de remboursement en ${currencyCode}`,
        selectIncorporationType: "Sélectionnez le type d'incorporation",
        selectBusinessCategory: "Sélectionnez la catégorie d'entreprise",
        selectAnnualPaymentVolume: 'Sélectionnez le volume de paiement annuel',
        selectIncorporationCountry: "Sélectionnez le pays d'incorporation",
        selectIncorporationState: "Sélectionnez l'état d'incorporation",
        selectAverageReimbursement: 'Sélectionnez le montant moyen de remboursement',
        findIncorporationType: "Trouver le type d'incorporation",
        findBusinessCategory: "Trouver la catégorie d'entreprise",
        findAnnualPaymentVolume: 'Trouver le volume de paiement annuel',
        findIncorporationState: "Trouver l'état d'incorporation",
        findAverageReimbursement: 'Trouver le montant moyen de remboursement',
        error: {
            registrationNumber: "Veuillez fournir un numéro d'enregistrement valide",
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Possédez-vous 25 % ou plus de',
        doAnyIndividualOwn25percent: 'Des particuliers détiennent-ils 25 % ou plus de',
        areThereMoreIndividualsWhoOwn25percent: 'Y a-t-il plus de personnes détenant 25 % ou plus de',
        regulationRequiresUsToVerifyTheIdentity: "La réglementation nous oblige à vérifier l'identité de toute personne détenant plus de 25 % de l'entreprise.",
        companyOwner: "Propriétaire d'entreprise",
        enterLegalFirstAndLastName: 'Quel est le nom légal du propriétaire ?',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        enterTheDateOfBirthOfTheOwner: 'Quelle est la date de naissance du propriétaire ?',
        enterTheLast4: 'Quels sont les 4 derniers chiffres du numéro de sécurité sociale du propriétaire ?',
        last4SSN: 'Les 4 derniers chiffres du SSN',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucune vérification de crédit personnelle !',
        enterTheOwnersAddress: "Quelle est l'adresse du propriétaire ?",
        letsDoubleCheck: 'Vérifions une seconde fois que tout semble correct.',
        legalName: 'Nom légal',
        address: 'Adresse',
        byAddingThisBankAccount: 'En ajoutant ce compte bancaire, vous confirmez avoir lu, compris et accepté',
        owners: 'Propriétaires',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informations sur le propriétaire',
        businessOwner: "Propriétaire d'entreprise",
        signerInfo: 'Informations de signature',
        doYouOwn: ({companyName}: CompanyNameParams) => `Possédez-vous 25 % ou plus de ${companyName} ?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Est-ce qu'une ou plusieurs personnes détiennent 25 % ou plus de ${companyName} ?`,
        regulationsRequire: "Les réglementations nous obligent à vérifier l'identité de toute personne détenant plus de 25 % de l'entreprise.",
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        whatsTheOwnersName: 'Quel est le nom légal du propriétaire ?',
        whatsYourName: 'Quel est votre nom légal ?',
        whatPercentage: "Quel pourcentage de l'entreprise appartient au propriétaire ?",
        whatsYoursPercentage: "Quel pourcentage de l'entreprise possédez-vous ?",
        ownership: 'Propriété',
        whatsTheOwnersDOB: 'Quelle est la date de naissance du propriétaire ?',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        whatsTheOwnersAddress: "Quelle est l'adresse du propriétaire ?",
        whatsYourAddress: 'Quelle est votre adresse ?',
        whatAreTheLast: 'Quels sont les 4 derniers chiffres du numéro de sécurité sociale du propriétaire ?',
        whatsYourLast: 'Quels sont les 4 derniers chiffres de votre numéro de sécurité sociale ?',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucune vérification de crédit personnelle !',
        last4: 'Les 4 derniers chiffres du SSN',
        whyDoWeAsk: 'Pourquoi demandons-nous cela ?',
        letsDoubleCheck: 'Vérifions une seconde fois que tout semble correct.',
        legalName: 'Nom légal',
        ownershipPercentage: 'Pourcentage de propriété',
        areThereOther: ({companyName}: CompanyNameParams) => `Y a-t-il d'autres personnes détenant 25 % ou plus de ${companyName} ?`,
        owners: 'Propriétaires',
        addCertified: 'Ajouter un organigramme certifié qui montre les propriétaires bénéficiaires',
        regulationRequiresChart:
            "La réglementation nous oblige à collecter une copie certifiée conforme de l'organigramme de propriété qui montre chaque individu ou entité possédant 25 % ou plus de l'entreprise.",
        uploadEntity: "Télécharger le graphique de propriété de l'entité",
        noteEntity: 'Remarque : Le tableau de propriété des entités doit être signé par votre comptable, conseiller juridique ou être notarié.',
        certified: "Organigramme de propriété certifié de l'entité",
        selectCountry: 'Sélectionner le pays',
        findCountry: 'Trouver un pays',
        address: 'Adresse',
        chooseFile: 'Choisir un fichier',
        uploadDocuments: 'Télécharger des documents supplémentaires',
        pleaseUpload:
            "Veuillez télécharger ci-dessous des documents supplémentaires pour nous aider à vérifier votre identité en tant que propriétaire direct ou indirect de 25 % ou plus de l'entité commerciale.",
        acceptedFiles: 'Formats de fichier acceptés : PDF, PNG, JPEG. La taille totale des fichiers pour chaque section ne peut pas dépasser 5 Mo.',
        proofOfBeneficialOwner: 'Preuve du bénéficiaire effectif',
        proofOfBeneficialOwnerDescription:
            "Veuillez fournir une attestation signée et un organigramme émanant d'un expert-comptable, notaire ou avocat public, vérifiant une propriété de 25 % ou plus de l'entreprise. Le document doit dater des trois derniers mois et inclure le numéro de licence du signataire.",
        copyOfID: "Copie de la pièce d'identité du bénéficiaire effectif",
        copyOfIDDescription: 'Exemples : Passeport, permis de conduire, etc.',
        proofOfAddress: "Justificatif d'adresse pour le bénéficiaire effectif",
        proofOfAddressDescription: 'Exemples : facture de services publics, contrat de location, etc.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            "Veuillez télécharger une vidéo d'une visite sur site ou un appel enregistré avec l'agent signataire. L'agent doit fournir : nom complet, date de naissance, nom de l'entreprise, numéro d'enregistrement, numéro de code fiscal, adresse enregistrée, nature de l'activité et objectif du compte.",
    },
    validationStep: {
        headerTitle: 'Valider le compte bancaire',
        buttonText: 'Terminer la configuration',
        maxAttemptsReached: 'La validation de ce compte bancaire a été désactivée en raison de trop nombreuses tentatives incorrectes.',
        description: `Dans un délai de 1 à 2 jours ouvrables, nous enverrons trois (3) petites transactions à votre compte bancaire au nom de "Expensify, Inc. Validation".`,
        descriptionCTA: 'Veuillez saisir chaque montant de transaction dans les champs ci-dessous. Exemple : 1.51.',
        reviewingInfo: 'Merci ! Nous examinons vos informations et vous contacterons sous peu. Veuillez vérifier votre conversation avec Concierge.',
        forNextStep: 'pour les prochaines étapes afin de terminer la configuration de votre compte bancaire.',
        letsChatCTA: 'Oui, discutons',
        letsChatText: 'Presque terminé ! Nous avons besoin de votre aide pour vérifier quelques dernières informations par chat. Prêt ?',
        letsChatTitle: 'Discutons !',
        enable2FATitle: "Prévenir la fraude, activer l'authentification à deux facteurs (2FA)",
        enable2FAText: 'Nous prenons votre sécurité au sérieux. Veuillez configurer la 2FA maintenant pour ajouter une couche supplémentaire de protection à votre compte.',
        secureYourAccount: 'Sécurisez votre compte',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Informations supplémentaires',
        checkAllThatApply: "Cochez tout ce qui s'applique, sinon laissez vide.",
        iOwnMoreThan25Percent: 'Je possède plus de 25 % de',
        someoneOwnsMoreThan25Percent: "Quelqu'un d'autre possède plus de 25 % de",
        additionalOwner: 'Propriétaire bénéficiaire supplémentaire',
        removeOwner: 'Supprimer ce bénéficiaire effectif',
        addAnotherIndividual: 'Ajouter une autre personne détenant plus de 25 % de',
        agreement: 'Accord :',
        termsAndConditions: 'termes et conditions',
        certifyTrueAndAccurate: 'Je certifie que les informations fournies sont vraies et exactes',
        error: {
            certify: 'Doit certifier que les informations sont vraies et exactes',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Terminer la vérification',
        confirmAgreements: 'Veuillez confirmer les accords ci-dessous.',
        certifyTrueAndAccurate: 'Je certifie que les informations fournies sont vraies et exactes',
        certifyTrueAndAccurateError: 'Veuillez certifier que les informations sont vraies et exactes',
        isAuthorizedToUseBankAccount: 'Je suis autorisé à utiliser ce compte bancaire professionnel pour les dépenses professionnelles.',
        isAuthorizedToUseBankAccountError: 'Vous devez être un agent de contrôle autorisé à gérer le compte bancaire professionnel.',
        termsAndConditions: 'termes et conditions',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Connecter un compte bancaire',
        finishButtonText: 'Terminer la configuration',
        validateYourBankAccount: 'Validez votre compte bancaire',
        validateButtonText: 'Valider',
        validationInputLabel: 'Transaction',
        maxAttemptsReached: 'La validation de ce compte bancaire a été désactivée en raison de trop nombreuses tentatives incorrectes.',
        description: `Dans un délai de 1 à 2 jours ouvrables, nous enverrons trois (3) petites transactions à votre compte bancaire au nom de "Expensify, Inc. Validation".`,
        descriptionCTA: 'Veuillez saisir chaque montant de transaction dans les champs ci-dessous. Exemple : 1.51.',
        reviewingInfo: 'Merci ! Nous examinons vos informations et vous contacterons sous peu. Veuillez vérifier votre conversation avec Concierge.',
        forNextSteps: 'pour les prochaines étapes afin de terminer la configuration de votre compte bancaire.',
        letsChatCTA: 'Oui, discutons',
        letsChatText: 'Presque terminé ! Nous avons besoin de votre aide pour vérifier quelques dernières informations par chat. Prêt ?',
        letsChatTitle: 'Discutons !',
        enable2FATitle: "Prévenir la fraude, activer l'authentification à deux facteurs (2FA)",
        enable2FAText: 'Nous prenons votre sécurité au sérieux. Veuillez configurer la 2FA maintenant pour ajouter une couche supplémentaire de protection à votre compte.',
        secureYourAccount: 'Sécurisez votre compte',
    },
    countryStep: {
        confirmBusinessBank: 'Confirmer la devise et le pays du compte bancaire professionnel',
        confirmCurrency: 'Confirmer la devise et le pays',
        yourBusiness: 'La devise de votre compte bancaire professionnel doit correspondre à la devise de votre espace de travail.',
        youCanChange: 'Vous pouvez changer la devise de votre espace de travail dans votre',
        findCountry: 'Trouver un pays',
        selectCountry: 'Sélectionner le pays',
    },
    bankInfoStep: {
        whatAreYour: 'Quels sont les détails de votre compte bancaire professionnel ?',
        letsDoubleCheck: 'Vérifions une seconde fois que tout semble correct.',
        thisBankAccount: 'Ce compte bancaire sera utilisé pour les paiements professionnels dans votre espace de travail.',
        accountNumber: 'Numéro de compte',
        accountHolderNameDescription: 'Nom complet du signataire autorisé',
    },
    signerInfoStep: {
        signerInfo: 'Informations de signature',
        areYouDirector: ({companyName}: CompanyNameParams) => `Êtes-vous un directeur ou un cadre supérieur chez ${companyName} ?`,
        regulationRequiresUs: "La réglementation nous oblige à vérifier si le signataire a l'autorité pour effectuer cette action au nom de l'entreprise.",
        whatsYourName: 'Quel est votre nom légal ?',
        fullName: 'Nom légal complet',
        whatsYourJobTitle: 'Quel est votre poste ?',
        jobTitle: 'Intitulé du poste',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        uploadID: "Télécharger une pièce d'identité et un justificatif de domicile",
        personalAddress: 'Justificatif de domicile personnel (par exemple facture de services publics)',
        letsDoubleCheck: 'Vérifions une seconde fois que tout semble correct.',
        legalName: 'Nom légal',
        proofOf: 'Justificatif de domicile personnel',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Entrez l'email du directeur ou d'un cadre supérieur chez ${companyName}`,
        regulationRequiresOneMoreDirector: 'La réglementation exige au moins un directeur ou un cadre supérieur supplémentaire comme signataire.',
        hangTight: 'Patientez un instant...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Entrez les e-mails de deux directeurs ou cadres supérieurs chez ${companyName}`,
        sendReminder: 'Envoyer un rappel',
        chooseFile: 'Choisir un fichier',
        weAreWaiting: "Nous attendons que d'autres personnes vérifient leur identité en tant qu'administrateurs ou cadres supérieurs de l'entreprise.",
        id: "Copie de la pièce d'identité",
        proofOfDirectors: 'Preuve du ou des directeur(s)',
        proofOfDirectorsDescription: "Exemples : Profil d'entreprise Oncorp ou Enregistrement commercial.",
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Code Fiscal pour les Signataires, Utilisateurs Autorisés et Bénéficiaires Effectifs.',
        PDSandFSG: 'Documents de divulgation PDS + FSG',
        PDSandFSGDescription:
            "Notre partenariat avec Corpay utilise une connexion API pour tirer parti de leur vaste réseau de partenaires bancaires internationaux afin d'alimenter les Remboursements Globaux dans Expensify. Conformément à la réglementation australienne, nous vous fournissons le Guide des Services Financiers (FSG) et la Déclaration de Divulgation des Produits (PDS) de Corpay.\n\nVeuillez lire attentivement les documents FSG et PDS car ils contiennent des détails complets et des informations importantes sur les produits et services offerts par Corpay. Conservez ces documents pour référence future.",
        pleaseUpload:
            "Veuillez télécharger ci-dessous des documents supplémentaires pour nous aider à vérifier votre identité en tant que directeur ou cadre supérieur de l'entité commerciale.",
    },
    agreementsStep: {
        agreements: 'Accords',
        pleaseConfirm: 'Veuillez confirmer les accords ci-dessous',
        regulationRequiresUs: "La réglementation nous oblige à vérifier l'identité de toute personne détenant plus de 25 % de l'entreprise.",
        iAmAuthorized: 'Je suis autorisé à utiliser le compte bancaire professionnel pour les dépenses professionnelles.',
        iCertify: 'Je certifie que les informations fournies sont vraies et exactes.',
        termsAndConditions: 'termes et conditions',
        accept: 'Accepter et ajouter un compte bancaire',
        iConsentToThe: 'Je consens à la',
        privacyNotice: 'avis de confidentialité',
        error: {
            authorized: 'Vous devez être un agent de contrôle autorisé à gérer le compte bancaire professionnel.',
            certify: 'Veuillez certifier que les informations sont vraies et exactes',
            consent: "Veuillez consentir à l'avis de confidentialité",
        },
    },
    finishStep: {
        connect: 'Connecter un compte bancaire',
        letsFinish: 'Finissons dans le chat !',
        thanksFor:
            "Merci pour ces informations. Un agent de support dédié va maintenant examiner vos données. Nous reviendrons vers vous si nous avons besoin de quelque chose d'autre, mais en attendant, n'hésitez pas à nous contacter pour toute question.",
        iHaveA: "J'ai une question",
        enable2FA: "Activez l'authentification à deux facteurs (2FA) pour prévenir la fraude",
        weTake: 'Nous prenons votre sécurité au sérieux. Veuillez configurer la 2FA maintenant pour ajouter une couche supplémentaire de protection à votre compte.',
        secure: 'Sécurisez votre compte',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Un instant',
        explanationLine: 'Nous examinons vos informations. Vous pourrez poursuivre les prochaines étapes sous peu.',
    },
    session: {
        offlineMessageRetry: 'On dirait que vous êtes hors ligne. Veuillez vérifier votre connexion et réessayer.',
    },
    travel: {
        header: 'Réserver un voyage',
        title: 'Voyagez malin',
        subtitle: 'Utilisez Expensify Travel pour obtenir les meilleures offres de voyage et gérer toutes vos dépenses professionnelles en un seul endroit.',
        features: {
            saveMoney: "Économisez de l'argent sur vos réservations",
            alerts: 'Recevez des mises à jour et alertes en temps réel',
        },
        bookTravel: 'Réserver un voyage',
        bookDemo: 'Réserver une démo',
        bookADemo: 'Réserver une démo',
        toLearnMore: 'pour en savoir plus.',
        termsAndConditions: {
            header: 'Avant de continuer...',
            title: 'Termes et conditions',
            subtitle: 'Veuillez accepter les conditions de Expensify Travel',
            termsAndConditions: 'termes et conditions',
            travelTermsAndConditions: 'termes et conditions',
            agree: "Je suis d'accord avec les conditions",
            error: 'Vous devez accepter les conditions générales de voyage Expensify pour continuer',
            defaultWorkspaceError:
                "Vous devez définir un espace de travail par défaut pour activer Expensify Travel. Allez dans Paramètres > Espaces de travail > cliquez sur les trois points verticaux à côté d'un espace de travail > Définir comme espace de travail par défaut, puis réessayez !",
        },
        flight: 'Vol',
        flightDetails: {
            passenger: 'Passager',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Vous avez une <strong>escale de ${layover}</strong> avant ce vol</muted-text-label>`,
            takeOff: 'Décollage',
            landing: "Page d'accueil",
            seat: 'Siège',
            class: 'Classe cabine',
            recordLocator: 'Référence de réservation',
            cabinClasses: {
                unknown: 'Inconnu',
                economy: 'Économie',
                premiumEconomy: 'Économie Premium',
                business: 'Entreprise',
                first: 'Premier',
            },
        },
        hotel: 'Hôtel',
        hotelDetails: {
            guest: 'Invité',
            checkIn: 'Enregistrement',
            checkOut: 'Check-out',
            roomType: 'Type de chambre',
            cancellation: "Politique d'annulation",
            cancellationUntil: "Annulation gratuite jusqu'à",
            confirmation: 'Numéro de confirmation',
            cancellationPolicies: {
                unknown: 'Inconnu',
                nonRefundable: 'Non remboursable',
                freeCancellationUntil: "Annulation gratuite jusqu'à",
                partiallyRefundable: 'Partiellement remboursable',
            },
        },
        car: 'Voiture',
        carDetails: {
            rentalCar: 'Location de voiture',
            pickUp: 'Ramassage',
            dropOff: 'Dépôt',
            driver: 'Conducteur',
            carType: 'Type de voiture',
            cancellation: "Politique d'annulation",
            cancellationUntil: "Annulation gratuite jusqu'à",
            freeCancellation: 'Annulation gratuite',
            confirmation: 'Numéro de confirmation',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Passager',
            departs: 'Départs',
            arrives: 'Arrivées',
            coachNumber: 'Numéro de coach',
            seat: 'Siège',
            fareDetails: 'Détails du tarif',
            confirmation: 'Numéro de confirmation',
        },
        viewTrip: 'Voir le voyage',
        modifyTrip: 'Modifier le voyage',
        tripSupport: 'Assistance voyage',
        tripDetails: 'Détails du voyage',
        viewTripDetails: 'Voir les détails du voyage',
        trip: 'Voyage',
        trips: 'Voyages',
        tripSummary: 'Résumé du voyage',
        departs: 'Départs',
        errorMessage: 'Quelque chose a mal tourné. Veuillez réessayer plus tard.',
        phoneError: {
            phrase1: "S'il vous plaît",
            link: 'ajoutez un email professionnel comme identifiant principal',
            phrase2: 'pour réserver un voyage.',
        },
        domainSelector: {
            title: 'Domaine',
            subtitle: "Choisissez un domaine pour la configuration d'Expensify Travel.",
            recommended: 'Recommandé',
        },
        domainPermissionInfo: {
            title: 'Domaine',
            restrictionPrefix: `Vous n'avez pas la permission d'activer Expensify Travel pour le domaine`,
            restrictionSuffix: `Vous devrez plutôt demander à quelqu'un de ce domaine d'activer les voyages.`,
            accountantInvitationPrefix: `Si vous êtes comptable, envisagez de rejoindre le`,
            accountantInvitationLink: `Programme ExpensifyApproved! pour comptables`,
            accountantInvitationSuffix: `pour activer les déplacements pour ce domaine.`,
        },
        publicDomainError: {
            title: 'Commencez avec Expensify Travel',
            message: `Vous devrez utiliser votre adresse e-mail professionnelle (par exemple, nom@entreprise.com) avec Expensify Travel, et non votre adresse e-mail personnelle (par exemple, nom@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel a été désactivé',
            message: `Votre administrateur a désactivé Expensify Travel. Veuillez suivre la politique de réservation de votre entreprise pour les arrangements de voyage.`,
        },
        verifyCompany: {
            title: "Commencez à voyager dès aujourd'hui !",
            message: `Veuillez contacter votre responsable de compte ou salesteam@expensify.com pour obtenir une démonstration des voyages et l'activer pour votre entreprise.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Votre vol ${airlineCode} (${origin} → ${destination}) le ${startDate} a été réservé. Code de confirmation : ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Votre billet pour le vol ${airlineCode} (${origin} → ${destination}) du ${startDate} a été annulé.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Votre billet pour le vol ${airlineCode} (${origin} → ${destination}) du ${startDate} a été remboursé ou échangé.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Votre vol ${airlineCode} (${origin} → ${destination}) du ${startDate}} a été annulé par la compagnie aérienne.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `La compagnie aérienne a proposé un changement d'horaire pour le vol ${airlineCode} ; nous attendons la confirmation.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Changement d'horaire confirmé : le vol ${airlineCode} part maintenant à ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Votre vol ${airlineCode} (${origin} → ${destination}) du ${startDate} a été mis à jour.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Votre classe cabine a été mise à jour en ${cabinClass} sur le vol ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Votre siège attribué sur le vol ${airlineCode} a été confirmé.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Votre siège attribué sur le vol ${airlineCode} a été modifié.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Votre attribution de siège sur le vol ${airlineCode} a été supprimée.`,
            paymentDeclined: 'Le paiement de votre réservation de vol a échoué. Veuillez réessayer.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Vous avez annulé votre réservation ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Le fournisseur a annulé votre réservation ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Votre réservation ${type} a été reprogrammée. Nouveau numéro de confirmation : ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Votre réservation ${type} a été mise à jour. Consultez les nouveaux détails dans l'itinéraire.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Votre billet de train pour ${origin} → ${destination} le ${startDate} a été remboursé. Un crédit sera traité.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Votre billet de train pour ${origin} → ${destination} le ${startDate} a été échangé.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Votre billet de train pour ${origin} → ${destination} le ${startDate} a été mis à jour.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Votre réservation ${type} a été mise à jour.`,
        },
    },
    workspace: {
        common: {
            card: 'Cartes',
            expensifyCard: 'Carte Expensify',
            companyCards: "Cartes d'entreprise",
            workflows: 'Flux de travail',
            workspace: 'Espace de travail',
            findWorkspace: 'Trouver un espace de travail',
            edit: "Modifier l'espace de travail",
            enabled: 'Activé',
            disabled: 'Désactivé',
            everyone: 'Tout le monde',
            delete: "Supprimer l'espace de travail",
            settings: 'Paramètres',
            reimburse: 'Remboursements',
            categories: 'Catégories',
            tags: 'Étiquettes',
            customField1: 'Champ personnalisé 1',
            customField2: 'Champ personnalisé 2',
            customFieldHint: "Ajoutez un codage personnalisé qui s'applique à toutes les dépenses de ce membre.",
            reportFields: 'Champs du rapport',
            reportTitle: 'Titre du rapport',
            reportField: 'Champ de rapport',
            taxes: 'Taxes',
            bills: 'Factures',
            invoices: 'Factures',
            travel: 'Voyage',
            members: 'Membres',
            accounting: 'Comptabilité',
            rules: 'Règles',
            displayedAs: 'Affiché comme',
            plan: 'Plan',
            profile: 'Aperçu',
            bankAccount: 'Compte bancaire',
            connectBankAccount: 'Connecter un compte bancaire',
            testTransactions: 'Transactions de test',
            issueAndManageCards: 'Émettre et gérer des cartes',
            reconcileCards: 'Rapprocher les cartes',
            selected: () => ({
                one: '1 sélectionné',
                other: (count: number) => `${count} sélectionné(s)`,
            }),
            settlementFrequency: 'Fréquence de règlement',
            setAsDefault: 'Définir comme espace de travail par défaut',
            defaultNote: `Les reçus envoyés à ${CONST.EMAIL.RECEIPTS} apparaîtront dans cet espace de travail.`,
            deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer cet espace de travail ?',
            deleteWithCardsConfirmation: 'Êtes-vous sûr de vouloir supprimer cet espace de travail ? Cela supprimera tous les flux de cartes et les cartes attribuées.',
            unavailable: 'Espace de travail indisponible',
            memberNotFound: "Membre non trouvé. Pour inviter un nouveau membre dans l'espace de travail, veuillez utiliser le bouton d'invitation ci-dessus.",
            notAuthorized: `Vous n'avez pas accès à cette page. Si vous essayez de rejoindre cet espace de travail, demandez simplement au propriétaire de l'espace de travail de vous ajouter en tant que membre. Autre chose ? Contactez ${CONST.EMAIL.CONCIERGE}.`,
            goToRoom: ({roomName}: GoToRoomParams) => `Aller dans la salle ${roomName}`,
            goToWorkspace: "Aller à l'espace de travail",
            goToWorkspaces: 'Aller aux espaces de travail',
            clearFilter: 'Effacer le filtre',
            workspaceName: "Nom de l'espace de travail",
            workspaceOwner: 'Propriétaire',
            workspaceType: "Type d'espace de travail",
            workspaceAvatar: "Avatar de l'espace de travail",
            mustBeOnlineToViewMembers: 'Vous devez être en ligne pour voir les membres de cet espace de travail.',
            moreFeatures: 'Plus de fonctionnalités',
            requested: 'Demandé',
            distanceRates: 'Tarifs au kilomètre',
            defaultDescription: 'Un endroit pour tous vos reçus et dépenses.',
            descriptionHint: 'Partager les informations de cet espace de travail avec tous les membres.',
            welcomeNote: 'Veuillez utiliser Expensify pour soumettre vos reçus pour remboursement, merci !',
            subscription: 'Abonnement',
            markAsEntered: 'Marquer comme saisi manuellement',
            markAsExported: 'Marquer comme exporté manuellement',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exporter vers ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Vérifions une seconde fois que tout semble correct.',
            lineItemLevel: 'Niveau de ligne détaillée',
            reportLevel: 'Niveau du rapport',
            topLevel: 'Niveau supérieur',
            appliedOnExport: "Non importé dans Expensify, appliqué à l'exportation",
            shareNote: {
                header: "Partagez votre espace de travail avec d'autres membres",
                content: {
                    firstPart:
                        "Partagez ce code QR ou copiez le lien ci-dessous pour faciliter la demande d'accès des membres à votre espace de travail. Toutes les demandes de rejoindre l'espace de travail apparaîtront dans le",
                    secondPart: 'espace pour votre revue.',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Se connecter à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Créer une nouvelle connexion',
            reuseExistingConnection: 'Réutiliser la connexion existante',
            existingConnections: 'Connexions existantes',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Puisque vous vous êtes déjà connecté à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, vous pouvez choisir de réutiliser une connexion existante ou d'en créer une nouvelle.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Dernière synchronisation le ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Impossible de se connecter à ${connectionName} en raison d'une erreur d'authentification`,
            learnMore: 'En savoir plus.',
            memberAlternateText: 'Les membres peuvent soumettre et approuver des rapports.',
            adminAlternateText: "Les administrateurs ont un accès complet en modification à tous les rapports et paramètres de l'espace de travail.",
            auditorAlternateText: 'Les auditeurs peuvent consulter et commenter les rapports.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Administrateur';
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
                instant: 'Instantané',
                immediate: 'Quotidien',
                trip: 'Par voyage',
                weekly: 'Hebdomadaire',
                semimonthly: 'Deux fois par mois',
                monthly: 'Mensuel',
            },
            planType: 'Type de plan',
            submitExpense: 'Soumettez vos dépenses ci-dessous :',
            defaultCategory: 'Catégorie par défaut',
            viewTransactions: 'Voir les transactions',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Dépenses de ${displayName}`,
        },
        perDiem: {
            subtitle: 'Définissez les taux de per diem pour contrôler les dépenses quotidiennes des employés.',
            amount: 'Montant',
            deleteRates: () => ({
                one: 'Taux de suppression',
                other: 'Supprimer les tarifs',
            }),
            deletePerDiemRate: 'Supprimer le taux de per diem',
            findPerDiemRate: 'Trouver le taux de per diem',
            areYouSureDelete: () => ({
                one: 'Êtes-vous sûr de vouloir supprimer ce tarif ?',
                other: 'Êtes-vous sûr de vouloir supprimer ces tarifs ?',
            }),
            emptyList: {
                title: 'Indemnité journalière',
                subtitle: 'Définissez les taux de per diem pour contrôler les dépenses quotidiennes des employés. Importez les taux depuis une feuille de calcul pour commencer.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Un taux avec la valeur ${rate} existe déjà`,
            },
            importPerDiemRates: 'Importer les tarifs par diem',
            editPerDiemRate: 'Modifier le taux de per diem',
            editPerDiemRates: 'Modifier les taux de per diem',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `La mise à jour de cette destination la modifiera pour tous les sous-taux journaliers ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `La mise à jour de cette devise la modifiera pour tous les sous-taux de per diem ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Définissez comment les dépenses personnelles sont exportées vers QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Marquer comme « imprimer plus tard »',
            exportDescription: 'Configurez la manière dont les données Expensify sont exportées vers QuickBooks Desktop.',
            date: "Date d'exportation",
            exportInvoices: 'Exporter les factures vers',
            exportExpensifyCard: 'Exporter les transactions de la carte Expensify en tant que',
            account: 'Compte',
            accountDescription: 'Choisissez où publier les écritures comptables.',
            accountsPayable: 'Comptes fournisseurs',
            accountsPayableDescription: 'Choisissez où créer les factures fournisseurs.',
            bankAccount: 'Compte bancaire',
            notConfigured: 'Non configuré',
            bankAccountDescription: "Choisissez l'endroit d'où envoyer les chèques.",
            creditCardAccount: 'Compte de carte de crédit',
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers QuickBooks Desktop.",
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur le rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: "Date d'exportation",
                        description: 'Date à laquelle le rapport a été exporté vers QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                },
            },
            exportCheckDescription: "Nous créerons un chèque détaillé pour chaque rapport Expensify et l'enverrons depuis le compte bancaire ci-dessous.",
            exportJournalEntryDescription: 'Nous créerons une écriture de journal détaillée pour chaque rapport Expensify et la publierons sur le compte ci-dessous.',
            exportVendorBillDescription:
                "Nous créerons une facture détaillée pour chaque rapport Expensify et l'ajouterons au compte ci-dessous. Si cette période est clôturée, nous enregistrerons au premier jour de la prochaine période ouverte.",
            deepDiveExpensifyCard: 'Les transactions de la carte Expensify seront automatiquement exportées vers un « Compte de passif de carte Expensify » créé avec',
            deepDiveExpensifyCardIntegration: 'notre intégration.',
            outOfPocketTaxEnabledDescription:
                "QuickBooks Desktop ne prend pas en charge les taxes sur les exports d'écritures comptables. Comme vous avez activé les taxes dans votre espace de travail, cette option d'exportation n'est pas disponible.",
            outOfPocketTaxEnabledError: "Les écritures comptables ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d'exportation.",
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carte de crédit',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Facture fournisseur',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Écriture de journal',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Vérifier',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "Nous créerons un chèque détaillé pour chaque rapport Expensify et l'enverrons depuis le compte bancaire ci-dessous.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Nous associerons automatiquement le nom du commerçant sur la transaction par carte de crédit à tout fournisseur correspondant dans QuickBooks. Si aucun fournisseur n'existe, nous créerons un fournisseur « Credit Card Misc. » pour l'association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "Nous créerons une facture fournisseur détaillée pour chaque rapport Expensify avec la date de la dernière dépense, et l'ajouterons au compte ci-dessous. Si cette période est clôturée, nous enregistrerons au 1er du prochain exercice ouvert.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Choisissez où exporter les transactions de carte de crédit.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Choisissez un fournisseur à appliquer à toutes les transactions par carte de crédit.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: "Choisissez l'endroit d'où envoyer les chèques.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    "Les factures fournisseurs ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d'exportation.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    "Les chèques ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d'exportation.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    "Les écritures comptables ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d'exportation.",
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Ajoutez le compte dans QuickBooks Desktop et synchronisez à nouveau la connexion.',
            qbdSetup: 'Configuration de QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Impossible de se connecter depuis cet appareil',
                body1: "Vous devrez configurer cette connexion depuis l'ordinateur qui héberge votre fichier de société QuickBooks Desktop.",
                body2: "Une fois connecté, vous pourrez synchroniser et exporter depuis n'importe où.",
            },
            setupPage: {
                title: 'Ouvrez ce lien pour vous connecter',
                body: "Pour terminer la configuration, ouvrez le lien suivant sur l'ordinateur où QuickBooks Desktop est en cours d'exécution.",
                setupErrorTitle: 'Quelque chose a mal tourné',
                setupErrorBody1: 'La connexion QuickBooks Desktop ne fonctionne pas pour le moment. Veuillez réessayer plus tard ou',
                setupErrorBody2: 'si le problème persiste.',
                setupErrorBodyContactConcierge: 'contacter Concierge',
            },
            importDescription: 'Choisissez les configurations de codage à importer de QuickBooks Desktop vers Expensify.',
            classes: 'Classes',
            items: 'Articles',
            customers: 'Clients/projets',
            exportCompanyCardsDescription: "Définir la façon dont les achats par carte d'entreprise sont exportés vers QuickBooks Desktop.",
            defaultVendorDescription: "Définissez un fournisseur par défaut qui s'appliquera à toutes les transactions par carte de crédit lors de l'exportation.",
            accountsDescription: 'Votre plan comptable QuickBooks Desktop sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: "Choisissez d'importer les nouveaux comptes en tant que catégories activées ou désactivées.",
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour que les membres puissent les sélectionner lors de la création de leurs dépenses.',
            classesDescription: 'Choisissez comment gérer les classes QuickBooks Desktop dans Expensify.',
            tagsDisplayedAsDescription: "Niveau de ligne d'article",
            reportFieldsDisplayedAsDescription: 'Niveau du rapport',
            customersDescription: 'Choisissez comment gérer les clients/projets QuickBooks Desktop dans Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec QuickBooks Desktop chaque jour.',
                createEntities: 'Créer automatiquement des entités',
                createEntitiesDescription: "Expensify créera automatiquement des fournisseurs dans QuickBooks Desktop s'ils n'existent pas déjà.",
            },
            itemsDescription: 'Choisissez comment gérer les éléments QuickBooks Desktop dans Expensify.',
        },
        qbo: {
            connectedTo: 'Connecté à',
            importDescription: 'Choisissez les configurations de codage à importer de QuickBooks Online vers Expensify.',
            classes: 'Classes',
            locations: 'Emplacements',
            customers: 'Clients/projets',
            accountsDescription: 'Votre plan comptable QuickBooks Online sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: "Choisissez d'importer les nouveaux comptes en tant que catégories activées ou désactivées.",
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour que les membres puissent les sélectionner lors de la création de leurs dépenses.',
            classesDescription: 'Choisissez comment gérer les classes QuickBooks Online dans Expensify.',
            customersDescription: 'Choisissez comment gérer les clients/projets QuickBooks Online dans Expensify.',
            locationsDescription: 'Choisissez comment gérer les emplacements QuickBooks Online dans Expensify.',
            taxesDescription: 'Choisissez comment gérer les taxes QuickBooks Online dans Expensify.',
            locationsLineItemsRestrictionDescription:
                "QuickBooks Online ne prend pas en charge les emplacements au niveau des lignes pour les chèques ou les factures fournisseurs. Si vous souhaitez avoir des emplacements au niveau des lignes, assurez-vous d'utiliser des écritures comptables et des dépenses par carte de crédit/débit.",
            taxesJournalEntrySwitchNote:
                "QuickBooks Online ne prend pas en charge les taxes sur les écritures de journal. Veuillez modifier votre option d'exportation en facture fournisseur ou chèque.",
            exportDescription: 'Configurez la manière dont les données Expensify sont exportées vers QuickBooks Online.',
            date: "Date d'exportation",
            exportInvoices: 'Exporter les factures vers',
            exportExpensifyCard: 'Exporter les transactions de la carte Expensify en tant que',
            deepDiveExpensifyCard: 'Les transactions de la carte Expensify seront automatiquement exportées vers un « Compte de passif de carte Expensify » créé avec',
            deepDiveExpensifyCardIntegration: 'notre intégration.',
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers QuickBooks Online.",
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur le rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: "Date d'exportation",
                        description: 'Date à laquelle le rapport a été exporté vers QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                },
            },
            receivable: 'Comptes clients', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archive des comptes clients', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: "Utilisez ce compte lors de l'exportation des factures vers QuickBooks Online.",
            exportCompanyCardsDescription: "Définissez comment les achats par carte d'entreprise sont exportés vers QuickBooks Online.",
            vendor: 'Fournisseur',
            defaultVendorDescription: "Définissez un fournisseur par défaut qui s'appliquera à toutes les transactions par carte de crédit lors de l'exportation.",
            exportOutOfPocketExpensesDescription: 'Définissez comment les dépenses personnelles sont exportées vers QuickBooks Online.',
            exportCheckDescription: "Nous créerons un chèque détaillé pour chaque rapport Expensify et l'enverrons depuis le compte bancaire ci-dessous.",
            exportJournalEntryDescription: 'Nous créerons une écriture de journal détaillée pour chaque rapport Expensify et la publierons sur le compte ci-dessous.',
            exportVendorBillDescription:
                "Nous créerons une facture détaillée pour chaque rapport Expensify et l'ajouterons au compte ci-dessous. Si cette période est clôturée, nous enregistrerons au premier jour de la prochaine période ouverte.",
            account: 'Compte',
            accountDescription: 'Choisissez où publier les écritures comptables.',
            accountsPayable: 'Comptes fournisseurs',
            accountsPayableDescription: 'Choisissez où créer les factures fournisseurs.',
            bankAccount: 'Compte bancaire',
            notConfigured: 'Non configuré',
            bankAccountDescription: "Choisissez l'endroit d'où envoyer les chèques.",
            creditCardAccount: 'Compte de carte de crédit',
            companyCardsLocationEnabledDescription:
                "QuickBooks Online ne prend pas en charge les emplacements lors des exportations de factures fournisseurs. Comme vous avez activé les emplacements dans votre espace de travail, cette option d'exportation n'est pas disponible.",
            outOfPocketTaxEnabledDescription:
                "QuickBooks Online ne prend pas en charge les taxes sur les exports d'écritures comptables. Comme vous avez activé les taxes dans votre espace de travail, cette option d'exportation n'est pas disponible.",
            outOfPocketTaxEnabledError: "Les écritures comptables ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d'exportation.",
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec QuickBooks Online chaque jour.',
                inviteEmployees: 'Inviter des employés',
                inviteEmployeesDescription: 'Importer les dossiers des employés de QuickBooks Online et inviter les employés à cet espace de travail.',
                createEntities: 'Créer automatiquement des entités',
                createEntitiesDescription:
                    "Expensify créera automatiquement des fournisseurs dans QuickBooks Online s'ils n'existent pas déjà, et créera automatiquement des clients lors de l'exportation des factures.",
                reimbursedReportsDescription:
                    "Chaque fois qu'un rapport est payé via Expensify ACH, le paiement de facture correspondant sera créé dans le compte QuickBooks Online ci-dessous.",
                qboBillPaymentAccount: 'Compte de paiement de factures QuickBooks',
                qboInvoiceCollectionAccount: 'Compte de recouvrement des factures QuickBooks',
                accountSelectDescription: "Choisissez d'où payer les factures et nous créerons le paiement dans QuickBooks Online.",
                invoiceAccountSelectorDescription: 'Choisissez où recevoir les paiements de factures et nous créerons le paiement dans QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Carte de débit',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carte de crédit',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Facture fournisseur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Écriture de journal',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Vérifier',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "Nous associerons automatiquement le nom du commerçant sur la transaction par carte de débit à tout fournisseur correspondant dans QuickBooks. Si aucun fournisseur n'existe, nous créerons un fournisseur « Debit Card Misc. » pour l'association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Nous associerons automatiquement le nom du commerçant sur la transaction par carte de crédit à tout fournisseur correspondant dans QuickBooks. Si aucun fournisseur n'existe, nous créerons un fournisseur « Credit Card Misc. » pour l'association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "Nous créerons une facture fournisseur détaillée pour chaque rapport Expensify avec la date de la dernière dépense, et l'ajouterons au compte ci-dessous. Si cette période est clôturée, nous enregistrerons au 1er du prochain exercice ouvert.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Choisissez où exporter les transactions par carte de débit.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Choisissez où exporter les transactions de carte de crédit.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Choisissez un fournisseur à appliquer à toutes les transactions par carte de crédit.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    "Les factures fournisseurs ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d'exportation.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    "Les chèques ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d'exportation.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    "Les écritures comptables ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d'exportation.",
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: "Choisissez un compte valide pour l'exportation de la facture fournisseur",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: "Choisissez un compte valide pour l'exportation de l'écriture comptable",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: "Choisissez un compte valide pour l'exportation de chèques",
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]:
                    "Pour utiliser l'exportation des factures fournisseurs, configurez un compte de comptes fournisseurs dans QuickBooks Online.",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: "Pour utiliser l'exportation des écritures comptables, configurez un compte de journal dans QuickBooks Online",
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: "Pour utiliser l'exportation de chèques, configurez un compte bancaire dans QuickBooks Online",
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Ajoutez le compte dans QuickBooks Online et synchronisez à nouveau la connexion.',
            accountingMethods: {
                label: 'Quand exporter',
                description: 'Choisissez quand exporter les dépenses :',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilisation des charges et produits',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses personnelles seront exportées une fois définitivement approuvées',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: "Les dépenses avancées seront exportées lorsqu'elles seront payées",
                },
            },
        },
        workspaceList: {
            joinNow: 'Rejoindre maintenant',
            askToJoin: 'Demander à rejoindre',
        },
        xero: {
            organization: 'Organisation Xero',
            organizationDescription: "Choisissez l'organisation Xero à partir de laquelle vous souhaitez importer des données.",
            importDescription: 'Choisissez les configurations de codage à importer de Xero vers Expensify.',
            accountsDescription: 'Votre plan comptable Xero sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: "Choisissez d'importer les nouveaux comptes en tant que catégories activées ou désactivées.",
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour que les membres puissent les sélectionner lors de la création de leurs dépenses.',
            trackingCategories: 'Catégories de suivi',
            trackingCategoriesDescription: 'Choisissez comment gérer les catégories de suivi Xero dans Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mapper Xero ${categoryName} vers`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Choisissez où mapper ${categoryName} lors de l'exportation vers Xero.`,
            customers: 'Refacturer les clients',
            customersDescription:
                'Choisissez si vous souhaitez refacturer les clients dans Expensify. Vos contacts clients Xero peuvent être associés aux dépenses et seront exportés vers Xero sous forme de facture de vente.',
            taxesDescription: 'Choisissez comment gérer les taxes Xero dans Expensify.',
            notImported: 'Non importé',
            notConfigured: 'Non configuré',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contact Xero par défaut',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Étiquettes',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Champs du rapport',
            },
            exportDescription: 'Configurez la manière dont les données Expensify sont exportées vers Xero.',
            purchaseBill: "Facture d'achat",
            exportDeepDiveCompanyCard:
                'Les dépenses exportées seront enregistrées comme des transactions bancaires sur le compte bancaire Xero ci-dessous, et les dates des transactions correspondront aux dates de votre relevé bancaire.',
            bankTransactions: 'Transactions bancaires',
            xeroBankAccount: 'Compte bancaire Xero',
            xeroBankAccountDescription: 'Choisissez où les dépenses seront enregistrées en tant que transactions bancaires.',
            exportExpensesDescription: "Les rapports seront exportés en tant que facture d'achat avec la date et le statut sélectionnés ci-dessous.",
            purchaseBillDate: "Date de facturation d'achat",
            exportInvoices: 'Exporter les factures en tant que',
            salesInvoice: 'Facture de vente',
            exportInvoicesDescription: 'Les factures de vente affichent toujours la date à laquelle la facture a été envoyée.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec Xero chaque jour.',
                purchaseBillStatusTitle: "Statut de la facture d'achat",
                reimbursedReportsDescription: "Chaque fois qu'un rapport est payé via Expensify ACH, le paiement de facture correspondant sera créé dans le compte Xero ci-dessous.",
                xeroBillPaymentAccount: 'Compte de paiement des factures Xero',
                xeroInvoiceCollectionAccount: 'Compte de recouvrement des factures Xero',
                xeroBillPaymentAccountDescription: "Choisissez l'endroit depuis lequel payer les factures et nous créerons le paiement dans Xero.",
                invoiceAccountSelectorDescription: 'Choisissez où recevoir les paiements des factures et nous créerons le paiement dans Xero.',
            },
            exportDate: {
                label: "Date de facturation d'achat",
                description: "Utilisez cette date lors de l'exportation des rapports vers Xero.",
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur le rapport.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: "Date d'exportation",
                        description: 'Date à laquelle le rapport a été exporté vers Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
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
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Veuillez ajouter le compte dans Xero et synchroniser à nouveau la connexion.',
        },
        sageIntacct: {
            preferredExporter: 'Exportateur préféré',
            taxSolution: 'Solution fiscale',
            notConfigured: 'Non configuré',
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers Sage Intacct.",
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur le rapport.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: "Date d'exportation",
                        description: 'Date à laquelle le rapport a été exporté vers Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Définissez comment les dépenses personnelles sont exportées vers Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Rapports de dépenses',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Factures fournisseurs',
                },
            },
            nonReimbursableExpenses: {
                description: "Définir comment les achats par carte d'entreprise sont exportés vers Sage Intacct.",
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Cartes de crédit',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Factures fournisseurs',
                },
            },
            creditCardAccount: 'Compte de carte de crédit',
            defaultVendor: 'Fournisseur par défaut',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Définissez un fournisseur par défaut qui s'appliquera aux ${isReimbursable ? '' : 'non-'} dépenses remboursables ne correspondant à aucun fournisseur dans Sage Intacct.`,
            exportDescription: 'Configurez la manière dont les données Expensify sont exportées vers Sage Intacct.',
            exportPreferredExporterNote:
                "L'exportateur préféré peut être n'importe quel administrateur d'espace de travail, mais doit également être un administrateur de domaine si vous définissez des comptes d'exportation différents pour les cartes d'entreprise individuelles dans les Paramètres de domaine.",
            exportPreferredExporterSubNote: "Une fois défini, l'exportateur préféré verra les rapports à exporter dans son compte.",
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: `Veuillez ajouter le compte dans Sage Intacct et synchroniser à nouveau la connexion.`,
            autoSync: 'Synchronisation automatique',
            autoSyncDescription: 'Expensify se synchronisera automatiquement avec Sage Intacct chaque jour.',
            inviteEmployees: 'Inviter des employés',
            inviteEmployeesDescription:
                "Importez les dossiers des employés Sage Intacct et invitez les employés à cet espace de travail. Votre flux d'approbation sera par défaut l'approbation du manager et pourra être configuré davantage sur la page Membres.",
            syncReimbursedReports: 'Synchroniser les rapports remboursés',
            syncReimbursedReportsDescription: "Chaque fois qu'un rapport est payé via Expensify ACH, le paiement de facture correspondant sera créé dans le compte Sage Intacct ci-dessous.",
            paymentAccount: 'Compte de paiement Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Filiale',
            subsidiarySelectDescription: 'Choisissez la filiale dans NetSuite à partir de laquelle vous souhaitez importer des données.',
            exportDescription: 'Configurez la manière dont les données Expensify sont exportées vers NetSuite.',
            exportInvoices: 'Exporter les factures vers',
            journalEntriesTaxPostingAccount: 'Compte de publication fiscale des écritures comptables',
            journalEntriesProvTaxPostingAccount: 'Compte de publication de la taxe provinciale des écritures de journal',
            foreignCurrencyAmount: 'Exporter le montant en devise étrangère',
            exportToNextOpenPeriod: 'Exporter vers la prochaine période ouverte',
            nonReimbursableJournalPostingAccount: 'Compte de saisie de journal non remboursable',
            reimbursableJournalPostingAccount: 'Compte de publication de journal remboursable',
            journalPostingPreference: {
                label: 'Préférence de publication des écritures comptables',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Entrée unique et détaillée pour chaque rapport',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Une seule saisie par dépense',
                },
            },
            invoiceItem: {
                label: 'Article de facture',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Créez-en un pour moi',
                        description: "Nous créerons une « ligne d'article de facture Expensify » pour vous lors de l'exportation (si elle n'existe pas déjà).",
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Sélectionner existant',
                        description: "Nous lierons les factures d'Expensify à l'article sélectionné ci-dessous.",
                    },
                },
            },
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers NetSuite.",
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur le rapport.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: "Date d'exportation",
                        description: 'Date à laquelle le rapport a été exporté vers NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Rapports de dépenses',
                        reimbursableDescription: 'Les dépenses personnelles seront exportées sous forme de rapports de dépenses vers NetSuite.',
                        nonReimbursableDescription: "Les dépenses par carte d'entreprise seront exportées sous forme de rapports de dépenses vers NetSuite.",
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
                        label: 'Écritures comptables',
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
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec NetSuite chaque jour.',
                reimbursedReportsDescription: "Chaque fois qu'un rapport est payé via Expensify ACH, le paiement de facture correspondant sera créé dans le compte NetSuite ci-dessous.",
                reimbursementsAccount: 'Compte de remboursements',
                reimbursementsAccountDescription: 'Choisissez le compte bancaire que vous utiliserez pour les remboursements, et nous créerons le paiement associé dans NetSuite.',
                collectionsAccount: 'Compte de recouvrement',
                collectionsAccountDescription: "Une fois qu'une facture est marquée comme payée dans Expensify et exportée vers NetSuite, elle apparaîtra sur le compte ci-dessous.",
                approvalAccount: "Compte d'approbation A/P",
                approvalAccountDescription:
                    'Choisissez le compte contre lequel les transactions seront approuvées dans NetSuite. Si vous synchronisez des rapports remboursés, c’est également le compte contre lequel les paiements de factures seront créés.',
                defaultApprovalAccount: 'NetSuite par défaut',
                inviteEmployees: 'Inviter les employés et définir les approbations',
                inviteEmployeesDescription:
                    "Importez les dossiers des employés NetSuite et invitez les employés à cet espace de travail. Votre flux d'approbation sera par défaut l'approbation du manager et pourra être configuré davantage sur la page *Membres*.",
                autoCreateEntities: 'Créer automatiquement des employés/fournisseurs',
                enableCategories: 'Activer les catégories nouvellement importées',
                customFormID: 'ID de formulaire personnalisé',
                customFormIDDescription:
                    'Par défaut, Expensify créera des entrées en utilisant le formulaire de transaction préféré défini dans NetSuite. Alternativement, vous pouvez désigner un formulaire de transaction spécifique à utiliser.',
                customFormIDReimbursable: 'Dépense personnelle',
                customFormIDNonReimbursable: "Dépense de carte d'entreprise",
                exportReportsTo: {
                    label: "Niveau d'approbation du rapport de dépenses",
                    description:
                        "Une fois qu'un rapport de dépenses est approuvé dans Expensify et exporté vers NetSuite, vous pouvez définir un niveau d'approbation supplémentaire dans NetSuite avant la publication.",
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Préférence par défaut NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Seulement approuvé par le superviseur',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Uniquement approuvé par la comptabilité',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Approuvé par le superviseur et la comptabilité',
                    },
                },
                accountingMethods: {
                    label: 'Quand exporter',
                    description: 'Choisissez quand exporter les dépenses :',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilisation des charges et produits',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses personnelles seront exportées une fois définitivement approuvées',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: "Les dépenses avancées seront exportées lorsqu'elles seront payées",
                    },
                },
                exportVendorBillsTo: {
                    label: "Niveau d'approbation de la facture fournisseur",
                    description:
                        "Une fois qu'une facture fournisseur est approuvée dans Expensify et exportée vers NetSuite, vous pouvez définir un niveau d'approbation supplémentaire dans NetSuite avant la publication.",
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Préférence par défaut NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: "En attente d'approbation",
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Approuvé pour publication',
                    },
                },
                exportJournalsTo: {
                    label: "Niveau d'approbation de l'écriture comptable",
                    description:
                        "Une fois qu'une écriture comptable est approuvée dans Expensify et exportée vers NetSuite, vous pouvez définir un niveau d'approbation supplémentaire dans NetSuite avant la publication.",
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Préférence par défaut NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: "En attente d'approbation",
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Approuvé pour publication',
                    },
                },
                error: {
                    customFormID: 'Veuillez entrer un ID de formulaire personnalisé numérique valide',
                },
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Veuillez ajouter le compte dans NetSuite et synchroniser à nouveau la connexion.',
            noVendorsFound: 'Aucun fournisseur trouvé',
            noVendorsFoundDescription: 'Veuillez ajouter des fournisseurs dans NetSuite et synchroniser à nouveau la connexion.',
            noItemsFound: 'Aucun élément de facture trouvé',
            noItemsFoundDescription: 'Veuillez ajouter des articles de facture dans NetSuite et synchroniser à nouveau la connexion.',
            noSubsidiariesFound: 'Aucune filiale trouvée',
            noSubsidiariesFoundDescription: 'Veuillez ajouter une filiale dans NetSuite et synchroniser à nouveau la connexion.',
            tokenInput: {
                title: 'Configuration NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Installer le bundle Expensify',
                        description: 'Dans NetSuite, allez dans *Customization > SuiteBundler > Search & Install Bundles* > recherchez "Expensify" > installez le bundle.',
                    },
                    enableTokenAuthentication: {
                        title: "Activer l'authentification basée sur les jetons",
                        description: 'Dans NetSuite, allez dans *Setup > Company > Enable Features > SuiteCloud* > activez *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Activer les services web SOAP',
                        description: 'Dans NetSuite, allez dans *Setup > Company > Enable Features > SuiteCloud* > activez *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: "Créer un jeton d'accès",
                        description:
                            'Dans NetSuite, allez à *Setup > Users/Roles > Access Tokens* > créez un jeton d\'accès pour l\'application "Expensify" et soit le rôle "Expensify Integration" soit "Administrator".\n\n*Important :* Assurez-vous de sauvegarder le *Token ID* et le *Token Secret* à cette étape. Vous en aurez besoin pour l\'étape suivante.',
                    },
                    enterCredentials: {
                        title: 'Entrez vos identifiants NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID de compte NetSuite',
                            netSuiteTokenID: 'ID de jeton',
                            netSuiteTokenSecret: 'Secret de jeton',
                        },
                        netSuiteAccountIDDescription: 'Dans NetSuite, allez à *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Catégories de dépenses',
                expenseCategoriesDescription: 'Vos catégories de dépenses NetSuite seront importées dans Expensify en tant que catégories.',
                crossSubsidiaryCustomers: 'Clients/projets inter-filiales',
                importFields: {
                    departments: {
                        title: 'Départements',
                        subtitle: 'Choisissez comment gérer les *départements* NetSuite dans Expensify.',
                    },
                    classes: {
                        title: 'Classes',
                        subtitle: 'Choisissez comment gérer les *classes* dans Expensify.',
                    },
                    locations: {
                        title: 'Emplacements',
                        subtitle: 'Choisissez comment gérer les *emplacements* dans Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clients/projets',
                    subtitle: 'Choisissez comment gérer les *clients* et les *projets* NetSuite dans Expensify.',
                    importCustomers: 'Importer des clients',
                    importJobs: 'Importer des projets',
                    customers: 'clients',
                    jobs: 'projets',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('et')}, ${importType}`,
                },
                importTaxDescription: 'Importer les groupes de taxes depuis NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Choisissez une option ci-dessous :',
                    label: ({importedTypes}: ImportedTypesParams) => `Importé en tant que ${importedTypes.join('et')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Veuillez saisir le ${fieldName}`,
                    customSegments: {
                        title: 'Segments/enregistrements personnalisés',
                        addText: 'Ajouter un segment/enregistrement personnalisé',
                        recordTitle: 'Segment/enregistrement personnalisé',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Voir les instructions détaillées',
                        helpText: 'sur la configuration des segments/enregistrements personnalisés.',
                        emptyTitle: 'Ajouter un segment personnalisé ou un enregistrement personnalisé',
                        fields: {
                            segmentName: 'Nom',
                            internalID: 'ID interne',
                            scriptID: 'ID de script',
                            customRecordScriptID: 'ID de colonne de transaction',
                            mapping: 'Affiché comme',
                        },
                        removeTitle: 'Supprimer le segment/enregistrement personnalisé',
                        removePrompt: 'Êtes-vous sûr de vouloir supprimer ce segment/enregistrement personnalisé ?',
                        addForm: {
                            customSegmentName: 'nom de segment personnalisé',
                            customRecordName: "nom d'enregistrement personnalisé",
                            segmentTitle: 'Segment personnalisé',
                            customSegmentAddTitle: 'Ajouter un segment personnalisé',
                            customRecordAddTitle: 'Ajouter un enregistrement personnalisé',
                            recordTitle: 'Enregistrement personnalisé',
                            segmentRecordType: 'Voulez-vous ajouter un segment personnalisé ou un enregistrement personnalisé ?',
                            customSegmentNameTitle: 'Quel est le nom du segment personnalisé ?',
                            customRecordNameTitle: "Quel est le nom de l'enregistrement personnalisé ?",
                            customSegmentNameFooter: `Vous pouvez trouver les noms de segments personnalisés dans NetSuite sous la page *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Pour des instructions plus détaillées, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Vous pouvez trouver les noms d'enregistrements personnalisés dans NetSuite en saisissant le "Transaction Column Field" dans la recherche globale.\n\n_Pour des instructions plus détaillées, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "Quel est l'ID interne ?",
                            customSegmentInternalIDFooter: `Tout d'abord, assurez-vous d'avoir activé les identifiants internes dans NetSuite sous *Accueil > Définir les préférences > Afficher l'identifiant interne.*\n\nVous pouvez trouver les identifiants internes des segments personnalisés dans NetSuite sous :\n\n1. *Personnalisation > Listes, enregistrements et champs > Segments personnalisés*.\n2. Cliquez sur un segment personnalisé.\n3. Cliquez sur le lien hypertexte à côté de *Type d'enregistrement personnalisé*.\n4. Trouvez l'identifiant interne dans le tableau en bas.\n\n_Pour des instructions plus détaillées, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Vous pouvez trouver les ID internes des enregistrements personnalisés dans NetSuite en suivant ces étapes :\n\n1. Saisissez "Transaction Line Fields" dans la recherche globale.\n2. Cliquez sur un enregistrement personnalisé.\n3. Trouvez l'ID interne sur le côté gauche.\n\n_Pour des instructions plus détaillées, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "Quel est l'ID du script ?",
                            customSegmentScriptIDFooter: `Vous pouvez trouver les ID de script des segments personnalisés dans NetSuite sous :\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Cliquez sur un segment personnalisé.\n3. Cliquez sur l’onglet *Application and Sourcing* près du bas, puis :\n    a. Si vous souhaitez afficher le segment personnalisé comme une *étiquette* (au niveau de la ligne d'article) dans Expensify, cliquez sur le sous-onglet *Transaction Columns* et utilisez le *Field ID*.\n    b. Si vous souhaitez afficher le segment personnalisé comme un *champ de rapport* (au niveau du rapport) dans Expensify, cliquez sur le sous-onglet *Transactions* et utilisez le *Field ID*.\n\n_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "Quel est l'ID de la colonne de transaction ?",
                            customRecordScriptIDFooter: `Vous pouvez trouver les IDs de script des enregistrements personnalisés dans NetSuite sous :\n\n1. Saisissez "Transaction Line Fields" dans la recherche globale.\n2. Cliquez sur un enregistrement personnalisé.\n3. Trouvez l'ID du script sur le côté gauche.\n\n_Pour des instructions plus détaillées, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Comment ce segment personnalisé doit-il être affiché dans Expensify ?',
                            customRecordMappingTitle: 'Comment cet enregistrement personnalisé doit-il être affiché dans Expensify ?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Un segment/enregistrement personnalisé avec ce ${fieldName?.toLowerCase()} existe déjà`,
                        },
                    },
                    customLists: {
                        title: 'Listes personnalisées',
                        addText: 'Ajouter une liste personnalisée',
                        recordTitle: 'Liste personnalisée',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Voir les instructions détaillées',
                        helpText: 'sur la configuration des listes personnalisées.',
                        emptyTitle: 'Ajouter une liste personnalisée',
                        fields: {
                            listName: 'Nom',
                            internalID: 'ID interne',
                            transactionFieldID: 'ID du champ de transaction',
                            mapping: 'Affiché comme',
                        },
                        removeTitle: 'Supprimer la liste personnalisée',
                        removePrompt: 'Êtes-vous sûr de vouloir supprimer cette liste personnalisée ?',
                        addForm: {
                            listNameTitle: 'Choisissez une liste personnalisée',
                            transactionFieldIDTitle: "Quel est l'ID du champ de transaction ?",
                            transactionFieldIDFooter: `Vous pouvez trouver les ID des champs de transaction dans NetSuite en suivant ces étapes :\n\n1. Saisissez "Transaction Line Fields" dans la recherche globale.\n2. Cliquez sur une liste personnalisée.\n3. Trouvez l'ID du champ de transaction sur le côté gauche.\n\n_Pour des instructions plus détaillées, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Comment cette liste personnalisée doit-elle être affichée dans Expensify ?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Une liste personnalisée avec cet ID de champ de transaction existe déjà`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Employé par défaut NetSuite',
                        description: "Non importé dans Expensify, appliqué à l'exportation",
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Si vous utilisez ${importField} dans NetSuite, nous appliquerons le paramètre par défaut défini dans le dossier employé lors de l'exportation vers le Rapport de dépenses ou l'Écriture comptable.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Étiquettes',
                        description: 'Niveau de ligne détaillée',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} sera sélectionnable pour chaque dépense individuelle sur le rapport d'un employé.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Champs du rapport',
                        description: 'Niveau du rapport',
                        footerContent: ({importField}: ImportFieldParams) => `La sélection ${startCase(importField)} s'appliquera à toutes les dépenses sur le rapport d'un employé.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configuration de Sage Intacct',
            prerequisitesTitle: 'Avant de vous connecter...',
            downloadExpensifyPackage: 'Téléchargez le package Expensify pour Sage Intacct',
            followSteps: 'Suivez les étapes de notre guide Comment faire : Se connecter à Sage Intacct',
            enterCredentials: 'Entrez vos identifiants Sage Intacct',
            entity: 'Entité',
            employeeDefault: 'Employé par défaut Sage Intacct',
            employeeDefaultDescription: "Le département par défaut de l'employé sera appliqué à ses dépenses dans Sage Intacct s'il en existe un.",
            displayedAsTagDescription: "Le département sera sélectionnable pour chaque dépense individuelle sur le rapport d'un employé.",
            displayedAsReportFieldDescription: "La sélection du département s'appliquera à toutes les dépenses du rapport d'un employé.",
            toggleImportTitleFirstPart: 'Choisissez comment gérer Sage Intacct',
            toggleImportTitleSecondPart: 'dans Expensify.',
            expenseTypes: 'Types de dépenses',
            expenseTypesDescription: 'Vos types de dépenses Sage Intacct seront importés dans Expensify en tant que catégories.',
            accountTypesDescription: 'Votre plan comptable Sage Intacct sera importé dans Expensify en tant que catégories.',
            importTaxDescription: "Importer le taux de taxe d'achat depuis Sage Intacct.",
            userDefinedDimensions: "Dimensions définies par l'utilisateur",
            addUserDefinedDimension: "Ajouter une dimension définie par l'utilisateur",
            integrationName: "Nom de l'intégration",
            dimensionExists: 'Une dimension avec ce nom existe déjà.',
            removeDimension: "Supprimer la dimension définie par l'utilisateur",
            removeDimensionPrompt: "Êtes-vous sûr de vouloir supprimer cette dimension définie par l'utilisateur ?",
            userDefinedDimension: "Dimension définie par l'utilisateur",
            addAUserDefinedDimension: "Ajouter une dimension définie par l'utilisateur",
            detailedInstructionsLink: 'Voir les instructions détaillées',
            detailedInstructionsRestOfSentence: "sur l'ajout de dimensions définies par l'utilisateur.",
            userDimensionsAdded: () => ({
                one: '1 UDD ajouté',
                other: (count: number) => `${count} UDD ajoutés`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'départements';
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
            control: 'Contrôle',
            collect: 'Collecter',
        },
        companyCards: {
            addCards: 'Ajouter des cartes',
            selectCards: 'Sélectionner les cartes',
            addNewCard: {
                other: 'Autre',
                cardProviders: {
                    gl1025: "Cartes d'entreprise American Express",
                    cdf: 'Cartes Commerciales Mastercard',
                    vcf: 'Cartes commerciales Visa',
                    stripe: 'Cartes Stripe',
                },
                yourCardProvider: `Quel est votre fournisseur de carte ?`,
                whoIsYourBankAccount: 'Quelle est votre banque ?',
                whereIsYourBankLocated: 'Où se trouve votre banque ?',
                howDoYouWantToConnect: 'Comment souhaitez-vous vous connecter à votre banque ?',
                learnMoreAboutOptions: {
                    text: 'En savoir plus à propos de ceux-ci',
                    linkText: 'options.',
                },
                commercialFeedDetails:
                    'Nécessite une configuration avec votre banque. Cela est généralement utilisé par les grandes entreprises et est souvent la meilleure option si vous êtes éligible.',
                commercialFeedPlaidDetails: `Nécessite une configuration avec votre banque, mais nous vous guiderons. Cela est généralement réservé aux grandes entreprises.`,
                directFeedDetails: "L'approche la plus simple. Connectez-vous immédiatement en utilisant vos identifiants principaux. Cette méthode est la plus courante.",
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Activer votre flux ${provider}`,
                    heading:
                        "Nous avons une intégration directe avec l'émetteur de votre carte et pouvons importer vos données de transaction dans Expensify rapidement et avec précision.\n\nPour commencer, il vous suffit de :",
                    visa: "Nous avons des intégrations mondiales avec Visa, bien que l'éligibilité varie selon la banque et le programme de carte.\n\nPour commencer, il vous suffit de :",
                    mastercard:
                        "Nous avons des intégrations mondiales avec Mastercard, bien que l'éligibilité varie selon la banque et le programme de carte.\n\nPour commencer, il suffit de :",
                    vcf: `1. Consultez [cet article d'aide](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) pour des instructions détaillées sur la configuration de vos Cartes Commerciales Visa.\n\n2. [Contactez votre banque](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) pour vérifier qu'elle prend en charge un flux commercial pour votre programme, et demandez-lui de l'activer.\n\n3. *Une fois le flux activé et que vous disposez de ses détails, continuez à l'écran suivant.*`,
                    gl1025: `1. Consultez [cet article d'aide](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) pour savoir si American Express peut activer un flux commercial pour votre programme.\n\n2. Une fois le flux activé, Amex vous enverra une lettre de production.\n\n3. *Une fois que vous avez les informations du flux, continuez à l'écran suivant.*`,
                    cdf: `1. Consultez [cet article d'aide](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) pour des instructions détaillées sur la configuration de vos Mastercard Commercial Cards.\n\n2. [Contactez votre banque](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) pour vérifier qu'elle prend en charge un flux commercial pour votre programme, et demandez-lui de l'activer.\n\n3. *Une fois le flux activé et que vous en avez les détails, passez à l'écran suivant.*`,
                    stripe: `1. Visitez le tableau de bord Stripe, et allez dans [Paramètres](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Sous Intégrations de produit, cliquez sur Activer à côté de Expensify.\n\n3. Une fois le flux activé, cliquez sur Soumettre ci-dessous et nous nous chargerons de l’ajouter.`,
                },
                whatBankIssuesCard: 'Quelle banque émet ces cartes ?',
                enterNameOfBank: 'Entrez le nom de la banque',
                feedDetails: {
                    vcf: {
                        title: 'Quels sont les détails du flux Visa ?',
                        processorLabel: 'ID du processeur',
                        bankLabel: "Identifiant de l'institution financière (banque)",
                        companyLabel: "ID de l'entreprise",
                        helpLabel: 'Où puis-je trouver ces identifiants ?',
                    },
                    gl1025: {
                        title: `Quel est le nom du fichier de livraison Amex ?`,
                        fileNameLabel: 'Nom du fichier de livraison',
                        helpLabel: 'Où puis-je trouver le nom du fichier de livraison ?',
                    },
                    cdf: {
                        title: `Quel est l'identifiant de distribution Mastercard ?`,
                        distributionLabel: 'ID de distribution',
                        helpLabel: "Où puis-je trouver l'ID de distribution ?",
                    },
                },
                amexCorporate: 'Sélectionnez ceci si le devant de vos cartes indique « Corporate »',
                amexBusiness: 'Sélectionnez ceci si le devant de vos cartes indique « Business »',
                amexPersonal: 'Sélectionnez ceci si vos cartes sont personnelles',
                error: {
                    pleaseSelectProvider: 'Veuillez sélectionner un fournisseur de carte avant de continuer',
                    pleaseSelectBankAccount: 'Veuillez sélectionner un compte bancaire avant de continuer',
                    pleaseSelectBank: 'Veuillez sélectionner une banque avant de continuer',
                    pleaseSelectCountry: 'Veuillez sélectionner un pays avant de continuer',
                    pleaseSelectFeedType: 'Veuillez sélectionner un type de flux avant de continuer',
                },
            },
            assignCard: 'Attribuer la carte',
            findCard: 'Trouver la carte',
            cardNumber: 'Numéro de carte',
            commercialFeed: "Fil d'actualités commercial",
            feedName: ({feedName}: CompanyCardFeedNameParams) => `Cartes ${feedName}`,
            directFeed: 'Flux direct',
            whoNeedsCardAssigned: "Qui a besoin d'une carte attribuée ?",
            chooseCard: 'Choisissez une carte',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Choisissez une carte pour ${assignee} dans le fil de cartes ${feed}.`,
            noActiveCards: 'Aucune carte active sur ce flux',
            somethingMightBeBroken: 'Ou quelque chose pourrait être cassé. Dans tous les cas, si vous avez des questions, il suffit de',
            contactConcierge: 'contacter Concierge',
            chooseTransactionStartDate: 'Choisissez une date de début de transaction',
            startDateDescription: "Nous importerons toutes les transactions à partir de cette date. Si aucune date n'est spécifiée, nous remonterons aussi loin que votre banque le permet.",
            fromTheBeginning: 'Depuis le début',
            customStartDate: 'Date de début personnalisée',
            letsDoubleCheck: 'Vérifions une seconde fois que tout semble correct.',
            confirmationDescription: 'Nous commencerons immédiatement à importer les transactions.',
            cardholder: 'Titulaire de la carte',
            card: 'Carte',
            cardName: 'Nom de la carte',
            brokenConnectionErrorFirstPart: `La connexion du flux de carte est interrompue. Veuillez`,
            brokenConnectionErrorLink: 'connectez-vous à votre banque',
            brokenConnectionErrorSecondPart: 'pour que nous puissions rétablir la connexion.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `a attribué ${assignee} un ${link} ! Les transactions importées apparaîtront dans cette conversation.`,
            companyCard: "carte d'entreprise",
            chooseCardFeed: 'Choisir le fil de la carte',
            ukRegulation:
                "Expensify, Inc. est un agent de Plaid Financial Ltd., une institution de paiement autorisée réglementée par la Financial Conduct Authority en vertu du Payment Services Regulations 2017 (numéro de référence de l'entreprise : 804718). Plaid vous fournit des services d'information sur les comptes réglementés via Expensify Limited en tant que son agent.",
        },
        expensifyCard: {
            issueAndManageCards: 'Émettre et gérer vos Cartes Expensify',
            getStartedIssuing: 'Commencez en émettant votre première carte virtuelle ou physique.',
            verificationInProgress: 'Vérification en cours...',
            verifyingTheDetails: 'Nous vérifions quelques détails. Concierge vous informera lorsque les Cartes Expensify seront prêtes à être émises.',
            disclaimer:
                "La carte commerciale Expensify Visa® est émise par The Bancorp Bank, N.A., membre de la FDIC, sous licence de Visa U.S.A. Inc. et ne peut pas être utilisée chez tous les commerçants acceptant les cartes Visa. Apple® et le logo Apple® sont des marques déposées d'Apple Inc., enregistrées aux États-Unis et dans d'autres pays. App Store est une marque de service d'Apple Inc. Google Play et le logo Google Play sont des marques déposées de Google LLC.",
            issueCard: 'Émettre une carte',
            findCard: 'Trouver la carte',
            newCard: 'Nouvelle carte',
            name: 'Nom',
            lastFour: '4 derniers',
            limit: 'Limite',
            currentBalance: 'Solde actuel',
            currentBalanceDescription: 'Le solde actuel est la somme de toutes les transactions de la carte Expensify enregistrées depuis la dernière date de règlement.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Le solde sera réglé le ${settlementDate}`,
            settleBalance: 'Régler le solde',
            cardLimit: 'Limite de carte',
            remainingLimit: 'Limite restant',
            requestLimitIncrease: "Demande d'augmentation de la limite",
            remainingLimitDescription:
                "Nous prenons en compte plusieurs facteurs pour calculer votre limite restante : votre ancienneté en tant que client, les informations liées à votre entreprise que vous avez fournies lors de l'inscription, et la trésorerie disponible sur le compte bancaire de votre entreprise. Votre limite restante peut fluctuer quotidiennement.",
            earnedCashback: 'Cash back',
            earnedCashbackDescription: 'Le solde de cashback est basé sur les dépenses mensuelles réglées avec la carte Expensify dans votre espace de travail.',
            issueNewCard: 'Émettre une nouvelle carte',
            finishSetup: 'Terminer la configuration',
            chooseBankAccount: 'Choisir un compte bancaire',
            chooseExistingBank: 'Choisissez un compte bancaire professionnel existant pour payer le solde de votre carte Expensify, ou ajoutez un nouveau compte bancaire.',
            accountEndingIn: 'Compte se terminant par',
            addNewBankAccount: 'Ajouter un nouveau compte bancaire',
            settlementAccount: 'Compte de règlement',
            settlementAccountDescription: 'Choisissez un compte pour payer le solde de votre carte Expensify.',
            settlementAccountInfoPt1: 'Assurez-vous que ce compte correspond à votre compte',
            settlementAccountInfoPt2: 'ainsi la Réconciliation Continue fonctionne correctement.',
            reconciliationAccount: 'Compte de rapprochement',
            settlementFrequency: 'Fréquence de règlement',
            settlementFrequencyDescription: 'Choisissez la fréquence à laquelle vous paierez le solde de votre carte Expensify.',
            settlementFrequencyInfo:
                'Si vous souhaitez passer à un règlement mensuel, vous devrez connecter votre compte bancaire via Plaid et avoir un historique de solde positif sur 90 jours.',
            frequency: {
                daily: 'Quotidien',
                monthly: 'Mensuel',
            },
            cardDetails: 'Détails de la carte',
            virtual: 'Virtuel',
            physical: 'Physique',
            deactivate: 'Désactiver la carte',
            changeCardLimit: 'Modifier la limite de la carte',
            changeLimit: 'Modifier la limite',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Si vous modifiez la limite de cette carte à ${limit}, les nouvelles transactions seront refusées jusqu'à ce que vous approuviez plus de dépenses sur la carte.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) =>
                `Si vous modifiez la limite de cette carte à ${limit}, les nouvelles transactions seront refusées jusqu'au mois prochain.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Si vous modifiez la limite de cette carte à ${limit}, les nouvelles transactions seront refusées.`,
            changeCardLimitType: 'Changer le type de limite de carte',
            changeLimitType: 'Changer le type de limite',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Si vous changez le type de limite de cette carte en Limite Intelligente, les nouvelles transactions seront refusées car la limite non approuvée de ${limit} a déjà été atteinte.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Si vous changez le type de limite de cette carte en Mensuelle, les nouvelles transactions seront refusées car la limite mensuelle de ${limit} a déjà été atteinte.`,
            addShippingDetails: "Ajouter les détails d'expédition",
            issuedCard: ({assignee}: AssigneeParams) => `a émis une carte Expensify à ${assignee} ! La carte arrivera dans 2 à 3 jours ouvrables.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `a émis une carte Expensify à ${assignee} ! La carte sera expédiée une fois que les détails d'expédition auront été ajoutés.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `a émis à ${assignee} une ${link} virtuelle ! La carte peut être utilisée immédiatement.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} a ajouté les détails d'expédition. La carte Expensify arrivera dans 2 à 3 jours ouvrables.`,
            verifyingHeader: 'Vérification en cours',
            bankAccountVerifiedHeader: 'Compte bancaire vérifié',
            verifyingBankAccount: 'Vérification du compte bancaire...',
            verifyingBankAccountDescription: 'Veuillez patienter pendant que nous confirmons que ce compte peut être utilisé pour émettre des Cartes Expensify.',
            bankAccountVerified: 'Compte bancaire vérifié !',
            bankAccountVerifiedDescription: 'Vous pouvez désormais émettre des Cartes Expensify aux membres de votre espace de travail.',
            oneMoreStep: 'Encore une étape...',
            oneMoreStepDescription: 'Il semble que nous devons vérifier manuellement votre compte bancaire. Veuillez vous rendre sur Concierge où vos instructions vous attendent.',
            gotIt: 'Compris',
            goToConcierge: 'Aller à Concierge',
        },
        categories: {
            deleteCategories: 'Supprimer les catégories',
            deleteCategoriesPrompt: 'Êtes-vous sûr de vouloir supprimer ces catégories ?',
            deleteCategory: 'Supprimer la catégorie',
            deleteCategoryPrompt: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
            disableCategories: 'Désactiver les catégories',
            disableCategory: 'Désactiver la catégorie',
            enableCategories: 'Activer les catégories',
            enableCategory: 'Activer la catégorie',
            defaultSpendCategories: 'Catégories de dépenses par défaut',
            spendCategoriesDescription: 'Personnalisez la manière dont les dépenses chez les commerçants sont catégorisées pour les transactions par carte de crédit et les reçus scannés.',
            deleteFailureMessage: 'Une erreur est survenue lors de la suppression de la catégorie, veuillez réessayer.',
            categoryName: 'Nom de la catégorie',
            requiresCategory: 'Les membres doivent catégoriser toutes les dépenses',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Toutes les dépenses doivent être catégorisées afin d'être exportées vers ${connectionName}.`,
            subtitle: "Obtenez une meilleure vue d'ensemble des dépenses. Utilisez nos catégories par défaut ou ajoutez les vôtres.",
            emptyCategories: {
                title: "Vous n'avez créé aucune catégorie",
                subtitle: 'Ajoutez une catégorie pour organiser vos dépenses.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Vos catégories sont actuellement importées depuis une connexion comptable. Rendez-vous sur',
                subtitle2: 'comptabilité',
                subtitle3: 'pour effectuer des modifications.',
            },
            updateFailureMessage: 'Une erreur est survenue lors de la mise à jour de la catégorie, veuillez réessayer.',
            createFailureMessage: 'Une erreur est survenue lors de la création de la catégorie, veuillez réessayer.',
            addCategory: 'Ajouter une catégorie',
            editCategory: 'Modifier la catégorie',
            editCategories: 'Modifier les catégories',
            findCategory: 'Trouver une catégorie',
            categoryRequiredError: 'Le nom de la catégorie est requis',
            existingCategoryError: 'Une catégorie portant ce nom existe déjà',
            invalidCategoryName: 'Nom de catégorie invalide',
            importedFromAccountingSoftware: 'Les catégories ci-dessous sont importées de votre',
            payrollCode: 'Code de paie',
            updatePayrollCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code de paie, veuillez réessayer.",
            glCode: 'Code GL',
            updateGLCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code GL, veuillez réessayer.",
            importCategories: 'Importer les catégories',
            cannotDeleteOrDisableAllCategories: {
                title: 'Impossible de supprimer ou de désactiver toutes les catégories',
                description: `Au moins une catégorie doit rester activée car votre espace de travail nécessite des catégories.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Utilisez les interrupteurs ci-dessous pour activer plus de fonctionnalités à mesure que vous développez. Chaque fonctionnalité apparaîtra dans le menu de navigation pour une personnalisation supplémentaire.',
            spendSection: {
                title: 'Dépense',
                subtitle: 'Activez une fonctionnalité qui vous aide à développer votre équipe.',
            },
            manageSection: {
                title: 'Gérer',
                subtitle: 'Ajoutez des contrôles pour aider à maintenir les dépenses dans le budget.',
            },
            earnSection: {
                title: 'Gagner',
                subtitle: 'Rationalisez vos revenus et soyez payé plus rapidement.',
            },
            organizeSection: {
                title: 'Organiser',
                subtitle: 'Regroupez et analysez les dépenses, enregistrez chaque taxe payée.',
            },
            integrateSection: {
                title: 'Intégrer',
                subtitle: 'Connectez Expensify aux produits financiers populaires.',
            },
            distanceRates: {
                title: 'Tarifs au kilomètre',
                subtitle: 'Ajouter, mettre à jour et appliquer les tarifs.',
            },
            perDiem: {
                title: 'Indemnité journalière',
                subtitle: 'Définissez les taux de per diem pour contrôler les dépenses quotidiennes des employés.',
            },
            expensifyCard: {
                title: 'Carte Expensify',
                subtitle: 'Obtenez des informations et maîtrisez les dépenses.',
                disableCardTitle: 'Désactiver la carte Expensify',
                disableCardPrompt: 'Vous ne pouvez pas désactiver la Carte Expensify car elle est déjà utilisée. Contactez Concierge pour les prochaines étapes.',
                disableCardButton: 'Discuter avec Concierge',
                feed: {
                    title: 'Obtenez la carte Expensify',
                    subTitle: "Rationalisez vos dépenses professionnelles et économisez jusqu'à 50 % sur votre facture Expensify, plus :",
                    features: {
                        cashBack: 'Cash back sur chaque achat aux États-Unis',
                        unlimited: 'Cartes virtuelles illimitées',
                        spend: 'Contrôles des dépenses et limites personnalisées',
                    },
                    ctaTitle: 'Émettre une nouvelle carte',
                },
            },
            companyCards: {
                title: "Cartes d'entreprise",
                subtitle: "Importer les dépenses des cartes d'entreprise existantes.",
                feed: {
                    title: "Importer les cartes d'entreprise",
                    features: {
                        support: 'Prise en charge de tous les principaux fournisseurs de cartes',
                        assignCards: "Attribuer des cartes à toute l'équipe",
                        automaticImport: 'Importation automatique des transactions',
                    },
                },
                disableCardTitle: "Désactiver les cartes d'entreprise",
                disableCardPrompt: "Vous ne pouvez pas désactiver les cartes d'entreprise car cette fonctionnalité est utilisée. Contactez le Concierge pour les prochaines étapes.",
                disableCardButton: 'Discuter avec Concierge',
                cardDetails: 'Détails de la carte',
                cardNumber: 'Numéro de carte',
                cardholder: 'Titulaire de la carte',
                cardName: 'Nom de la carte',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `Exportation ${integration} ${type.toLowerCase()}` : `Exportation ${integration}`,
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) => `Choisissez le compte ${integration} vers lequel les transactions doivent être exportées.`,
                integrationExportTitlePart: 'Sélectionner un autre',
                integrationExportTitleLinkPart: "option d'exportation",
                integrationExportTitleSecondPart: 'pour changer les comptes disponibles.',
                lastUpdated: 'Dernière mise à jour',
                transactionStartDate: 'Date de début de la transaction',
                updateCard: 'Mettre à jour la carte',
                unassignCard: 'Désaffecter la carte',
                unassign: 'Désassigner',
                unassignCardDescription: 'La désaffectation de cette carte supprimera toutes les transactions sur les rapports brouillons du compte du titulaire de la carte.',
                assignCard: 'Attribuer la carte',
                cardFeedName: 'Nom du flux de carte',
                cardFeedNameDescription: 'Donnez un nom unique au flux de cartes afin de pouvoir le distinguer des autres.',
                cardFeedTransaction: 'Supprimer les transactions',
                cardFeedTransactionDescription: 'Choisissez si les titulaires de carte peuvent supprimer les transactions de carte. Les nouvelles transactions suivront ces règles.',
                cardFeedRestrictDeletingTransaction: 'Restreindre la suppression des transactions',
                cardFeedAllowDeletingTransaction: 'Autoriser la suppression des transactions',
                removeCardFeed: 'Supprimer le fil de la carte',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Supprimer le fil ${feedName}`,
                removeCardFeedDescription: 'Êtes-vous sûr de vouloir supprimer ce flux de carte ? Cela désaffectera toutes les cartes.',
                error: {
                    feedNameRequired: 'Le nom du flux de carte est requis',
                },
                corporate: 'Restreindre la suppression des transactions',
                personal: 'Autoriser la suppression des transactions',
                setFeedNameDescription: 'Donnez un nom unique au flux de cartes afin de pouvoir le distinguer des autres',
                setTransactionLiabilityDescription:
                    "Lorsqu'elle est activée, les titulaires de carte peuvent supprimer les transactions de carte. Les nouvelles transactions suivront cette règle.",
                emptyAddedFeedTitle: "Attribuer des cartes d'entreprise",
                emptyAddedFeedDescription: 'Commencez par attribuer votre première carte à un membre.',
                pendingFeedTitle: `Nous examinons votre demande...`,
                pendingFeedDescription: `Nous examinons actuellement les détails de votre flux. Une fois cela terminé, nous vous contacterons via`,
                pendingBankTitle: 'Vérifiez la fenêtre de votre navigateur',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Veuillez vous connecter à ${bankName} via la fenêtre de votre navigateur qui vient de s'ouvrir. Si aucune fenêtre ne s'est ouverte,`,
                pendingBankLink: 'veuillez cliquer ici.',
                giveItNameInstruction: 'Donnez une nom à la carte qui la distingue des autres.',
                updating: 'Mise à jour...',
                noAccountsFound: 'Aucun compte trouvé',
                defaultCard: 'Carte par défaut',
                downgradeTitle: `Impossible de rétrograder l'espace de travail`,
                downgradeSubTitleFirstPart: `Cet espace de travail ne peut pas être rétrogradé car plusieurs flux de cartes sont connectés (à l'exclusion des Cartes Expensify). Veuillez`,
                downgradeSubTitleMiddlePart: `ne conserver qu'un seul flux de carte`,
                downgradeSubTitleLastPart: 'pour continuer.',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Veuillez ajouter le compte dans ${connection} et synchroniser à nouveau la connexion.`,
                expensifyCardBannerTitle: 'Obtenez la carte Expensify',
                expensifyCardBannerSubtitle:
                    "Profitez de remises en argent sur chaque achat aux États-Unis, jusqu'à 50 % de réduction sur votre facture Expensify, des cartes virtuelles illimitées, et bien plus encore.",
                expensifyCardBannerLearnMoreButton: 'En savoir plus',
            },
            workflows: {
                title: 'Flux de travail',
                subtitle: 'Configurez la manière dont les dépenses sont approuvées et payées.',
                disableApprovalPrompt:
                    "Les cartes Expensify de cet espace de travail dépendent actuellement de l'approbation pour définir leurs limites intelligentes. Veuillez modifier les types de limites de toutes les cartes Expensify avec des limites intelligentes avant de désactiver les approbations.",
            },
            invoices: {
                title: 'Factures',
                subtitle: 'Envoyez et recevez des factures.',
            },
            categories: {
                title: 'Catégories',
                subtitle: 'Suivez et organisez les dépenses.',
            },
            tags: {
                title: 'Étiquettes',
                subtitle: 'Classifiez les coûts et suivez les dépenses facturables.',
            },
            taxes: {
                title: 'Taxes',
                subtitle: 'Documentez et récupérez les taxes éligibles.',
            },
            reportFields: {
                title: 'Champs du rapport',
                subtitle: 'Configurez des champs personnalisés pour les dépenses.',
            },
            connections: {
                title: 'Comptabilité',
                subtitle: 'Synchronisez votre plan comptable et plus encore.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Pas si vite...',
                featureEnabledText: "Pour activer ou désactiver cette fonctionnalité, vous devrez modifier vos paramètres d'importation comptable.",
                disconnectText: 'Pour désactiver la comptabilité, vous devrez déconnecter votre connexion comptable de votre espace de travail.',
                manageSettings: 'Gérer les paramètres',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Pas si vite...',
                featureEnabledText:
                    "Les cartes Expensify dans cet espace de travail dépendent des flux d'approbation pour définir leurs limites intelligentes.\n\nVeuillez modifier les types de limites de toutes les cartes avec des limites intelligentes avant de désactiver les flux de travail.",
                confirmText: 'Aller aux Cartes Expensify',
            },
            rules: {
                title: 'Règles',
                subtitle: 'Exiger des reçus, signaler les dépenses élevées, et plus encore.',
            },
        },
        reportFields: {
            addField: 'Ajouter un champ',
            delete: 'Supprimer le champ',
            deleteFields: 'Supprimer les champs',
            findReportField: 'Trouver le champ de rapport',
            deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer ce champ de rapport ?',
            deleteFieldsConfirmation: 'Êtes-vous sûr de vouloir supprimer ces champs de rapport ?',
            emptyReportFields: {
                title: "Vous n'avez créé aucun champ de rapport",
                subtitle: 'Ajoutez un champ personnalisé (texte, date ou liste déroulante) qui apparaît dans les rapports.',
            },
            subtitle: "Les champs de rapport s'appliquent à toutes les dépenses et peuvent être utiles lorsque vous souhaitez demander des informations supplémentaires.",
            disableReportFields: 'Désactiver les champs du rapport',
            disableReportFieldsConfirmation: 'Êtes-vous sûr ? Les champs de texte et de date seront supprimés, et les listes seront désactivées.',
            importedFromAccountingSoftware: 'Les champs de rapport ci-dessous sont importés de votre',
            textType: 'Texte',
            dateType: 'Date',
            dropdownType: 'Liste',
            textAlternateText: 'Ajouter un champ pour la saisie de texte libre.',
            dateAlternateText: 'Ajouter un calendrier pour la sélection de la date.',
            dropdownAlternateText: "Ajouter une liste d'options parmi lesquelles choisir.",
            nameInputSubtitle: 'Choisissez un nom pour le champ du rapport.',
            typeInputSubtitle: 'Choisissez le type de champ de rapport à utiliser.',
            initialValueInputSubtitle: 'Entrez une valeur de départ à afficher dans le champ du rapport.',
            listValuesInputSubtitle: 'Ces valeurs apparaîtront dans le menu déroulant de votre champ de rapport. Les valeurs activées peuvent être sélectionnées par les membres.',
            listInputSubtitle: 'Ces valeurs apparaîtront dans la liste des champs de votre rapport. Les valeurs activées peuvent être sélectionnées par les membres.',
            deleteValue: 'Supprimer la valeur',
            deleteValues: 'Supprimer les valeurs',
            disableValue: 'Désactiver la valeur',
            disableValues: 'Désactiver les valeurs',
            enableValue: 'Activer la valeur',
            enableValues: 'Activer les valeurs',
            emptyReportFieldsValues: {
                title: "Vous n'avez créé aucune valeur de liste",
                subtitle: 'Ajouter des valeurs personnalisées à afficher dans les rapports.',
            },
            deleteValuePrompt: 'Êtes-vous sûr de vouloir supprimer cette valeur de liste ?',
            deleteValuesPrompt: 'Êtes-vous sûr de vouloir supprimer ces valeurs de liste ?',
            listValueRequiredError: 'Veuillez saisir un nom de valeur de liste',
            existingListValueError: 'Une valeur de liste portant ce nom existe déjà',
            editValue: 'Modifier la valeur',
            listValues: 'Lister les valeurs',
            addValue: 'Ajouter de la valeur',
            existingReportFieldNameError: 'Un champ de rapport portant ce nom existe déjà',
            reportFieldNameRequiredError: 'Veuillez saisir un nom de champ de rapport',
            reportFieldTypeRequiredError: 'Veuillez choisir un type de champ de rapport',
            reportFieldInitialValueRequiredError: 'Veuillez choisir une valeur initiale pour le champ du rapport',
            genericFailureMessage: "Une erreur s'est produite lors de la mise à jour du champ du rapport. Veuillez réessayer.",
        },
        tags: {
            tagName: "Nom de l'étiquette",
            requiresTag: 'Les membres doivent taguer toutes les dépenses',
            trackBillable: 'Suivre les dépenses facturables',
            customTagName: 'Nom de balise personnalisé',
            enableTag: 'Activer le tag',
            enableTags: 'Activer les tags',
            requireTag: 'Requête de tag',
            requireTags: 'Exiger des tags',
            notRequireTags: 'Ne pas exiger',
            disableTag: 'Désactiver le tag',
            disableTags: 'Désactiver les tags',
            addTag: 'Ajouter un tag',
            editTag: 'Modifier le tag',
            editTags: 'Modifier les tags',
            findTag: 'Trouver une étiquette',
            subtitle: 'Les tags ajoutent des moyens plus détaillés de classifier les coûts.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: 'Vous utilisez',
                phrase2: 'étiquettes dépendantes',
                phrase3: '. Vous pouvez',
                phrase4: 'réimporter une feuille de calcul',
                phrase5: 'pour mettre à jour vos tags.',
            },
            emptyTags: {
                title: "Vous n'avez créé aucune étiquette",
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Ajoutez une étiquette pour suivre les projets, les emplacements, les départements, et plus encore.',
                subtitle1: 'Importez une feuille de calcul pour ajouter des tags afin de suivre les projets, les emplacements, les départements, et plus encore.',
                subtitle2: 'En savoir plus',
                subtitle3: 'à propos du formatage des fichiers de balises.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'Vos tags sont actuellement importés depuis une connexion comptable. Rendez-vous sur',
                subtitle2: 'comptabilité',
                subtitle3: 'pour effectuer des modifications.',
            },
            deleteTag: 'Supprimer la balise',
            deleteTags: 'Supprimer les tags',
            deleteTagConfirmation: 'Êtes-vous sûr de vouloir supprimer cette étiquette ?',
            deleteTagsConfirmation: 'Êtes-vous sûr de vouloir supprimer ces tags ?',
            deleteFailureMessage: "Une erreur s'est produite lors de la suppression du tag, veuillez réessayer.",
            tagRequiredError: 'Le nom de la balise est requis',
            existingTagError: 'Une étiquette portant ce nom existe déjà',
            invalidTagNameError: "Le nom de l'étiquette ne peut pas être 0. Veuillez choisir une autre valeur.",
            genericFailureMessage: "Une erreur s'est produite lors de la mise à jour du tag, veuillez réessayer.",
            importedFromAccountingSoftware: 'Les tags ci-dessous sont importés de votre',
            glCode: 'Code GL',
            updateGLCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code GL, veuillez réessayer.",
            tagRules: 'Règles de balisage',
            approverDescription: 'Approbateur',
            importTags: 'Importer des tags',
            importTagsSupportingText: 'Codez vos dépenses avec un type de tag ou plusieurs.',
            configureMultiLevelTags: 'Configurez votre liste de tags pour le marquage multi-niveaux.',
            importMultiLevelTagsSupportingText: `Voici un aperçu de vos tags. Si tout vous semble correct, cliquez ci-dessous pour les importer.`,
            importMultiLevelTags: {
                firstRowTitle: 'La première ligne est le titre de chaque liste de tags',
                independentTags: 'Ce sont des balises indépendantes',
                glAdjacentColumn: 'Il y a un code GL dans la colonne adjacente',
            },
            tagLevel: {
                singleLevel: 'Niveau unique de balises',
                multiLevel: 'Tags à plusieurs niveaux',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Changer les niveaux de balise',
                prompt1: 'Changer le niveau des tags effacera tous les tags actuels.',
                prompt2: "Nous vous suggérons d'abord",
                prompt3: 'télécharger une sauvegarde',
                prompt4: 'en exportant vos tags.',
                prompt5: 'En savoir plus',
                prompt6: 'à propos des niveaux de tags.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Nous avons trouvé *${columnCounts} colonnes* dans votre feuille de calcul. Sélectionnez *Nom* à côté de la colonne qui contient les noms des tags. Vous pouvez également sélectionner *Activé* à côté de la colonne qui définit le statut des tags.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Impossible de supprimer ou de désactiver toutes les étiquettes',
                description: `Au moins une étiquette doit rester activée car votre espace de travail nécessite des étiquettes.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Impossible de rendre toutes les balises optionnelles',
                description: `Au moins une étiquette doit rester obligatoire car les paramètres de votre espace de travail exigent des étiquettes.`,
            },
            tagCount: () => ({
                one: '1 Étiquette',
                other: (count: number) => `${count} Étiquettes`,
            }),
        },
        taxes: {
            subtitle: 'Ajoutez les noms des taxes, les taux, et définissez les valeurs par défaut.',
            addRate: 'Ajouter un tarif',
            workspaceDefault: "Devise par défaut de l'espace de travail",
            foreignDefault: 'Devise étrangère par défaut',
            customTaxName: 'Nom de taxe personnalisé',
            value: 'Valeur',
            taxReclaimableOn: 'Taxe récupérable sur',
            taxRate: "Taux d'imposition",
            findTaxRate: "Trouver le taux d'imposition",
            error: {
                taxRateAlreadyExists: 'Ce nom de taxe est déjà utilisé',
                taxCodeAlreadyExists: 'Ce code fiscal est déjà utilisé',
                valuePercentageRange: 'Veuillez entrer un pourcentage valide entre 0 et 100',
                customNameRequired: 'Le nom de taxe personnalisé est requis',
                deleteFailureMessage: "Une erreur est survenue lors de la suppression du taux de taxe. Veuillez réessayer ou demander de l'aide à Concierge.",
                updateFailureMessage: "Une erreur s'est produite lors de la mise à jour du taux de taxe. Veuillez réessayer ou demander de l'aide à Concierge.",
                createFailureMessage: "Une erreur s'est produite lors de la création du taux de taxe. Veuillez réessayer ou demander de l'aide à Concierge.",
                updateTaxClaimableFailureMessage: 'La partie récupérable doit être inférieure au montant du tarif au kilomètre',
            },
            deleteTaxConfirmation: 'Êtes-vous sûr de vouloir supprimer cette taxe ?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Êtes-vous sûr de vouloir supprimer ${taxAmount} taxes ?`,
            actions: {
                delete: 'Taux de suppression',
                deleteMultiple: 'Supprimer les tarifs',
                enable: 'Activer le taux',
                disable: 'Désactiver le taux',
                enableTaxRates: () => ({
                    one: 'Activer le taux',
                    other: 'Activer les tarifs',
                }),
                disableTaxRates: () => ({
                    one: 'Désactiver le taux',
                    other: 'Désactiver les tarifs',
                }),
            },
            importedFromAccountingSoftware: 'Les taxes ci-dessous sont importées de votre',
            taxCode: 'Code fiscal',
            updateTaxCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code fiscal, veuillez réessayer.",
        },
        emptyWorkspace: {
            title: 'Créer un espace de travail',
            subtitle:
                'Créez un espace de travail pour suivre les reçus, rembourser les dépenses, gérer les voyages, envoyer des factures, et plus encore — le tout à la vitesse de la conversation.',
            createAWorkspaceCTA: 'Commencer',
            features: {
                trackAndCollect: 'Suivre et collecter les reçus',
                reimbursements: 'Rembourser les employés',
                companyCards: "Gérer les cartes d'entreprise",
            },
            notFound: 'Aucun espace de travail trouvé',
            description: 'Les Rooms sont un excellent endroit pour discuter et travailler avec plusieurs personnes. Pour commencer à collaborer, créez ou rejoignez un espace de travail.',
        },
        new: {
            newWorkspace: 'Nouvel espace de travail',
            getTheExpensifyCardAndMore: 'Obtenez la carte Expensify et plus encore',
            confirmWorkspace: "Confirmer l'espace de travail",
            myGroupWorkspace: 'Mon espace de travail de groupe',
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Espace de travail de ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: "Une erreur est survenue lors de la suppression d'un membre de l'espace de travail, veuillez réessayer.",
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Êtes-vous sûr de vouloir supprimer ${memberName} ?`,
                other: 'Êtes-vous sûr de vouloir supprimer ces membres ?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} est un approbateur dans cet espace de travail. Lorsque vous cesserez de partager cet espace de travail avec lui, nous le remplacerons dans le flux d'approbation par le propriétaire de l'espace de travail, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Supprimer le membre',
                other: 'Supprimer des membres',
            }),
            findMember: 'Trouver un membre',
            removeWorkspaceMemberButtonTitle: "Supprimer de l'espace de travail",
            removeGroupMemberButtonTitle: 'Supprimer du groupe',
            removeRoomMemberButtonTitle: 'Supprimer de la conversation',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Êtes-vous sûr de vouloir supprimer ${memberName} ?`,
            removeMemberTitle: 'Supprimer le membre',
            transferOwner: 'Transférer le propriétaire',
            makeMember: 'Créer un membre',
            makeAdmin: 'Rendre administrateur',
            makeAuditor: 'Créer un auditeur',
            selectAll: 'Tout sélectionner',
            error: {
                genericAdd: "Il y a eu un problème lors de l'ajout de ce membre à l'espace de travail",
                cannotRemove: "Vous ne pouvez pas vous supprimer ni supprimer le propriétaire de l'espace de travail",
                genericRemove: "Un problème est survenu lors de la suppression de ce membre de l'espace de travail",
            },
            addedWithPrimary: 'Certains membres ont été ajoutés avec leurs identifiants principaux.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Ajouté par la connexion secondaire ${secondaryLogin}.`,
            membersListTitle: "Annuaire de tous les membres de l'espace de travail.",
            importMembers: 'Importer des membres',
        },
        card: {
            getStartedIssuing: 'Commencez en émettant votre première carte virtuelle ou physique.',
            issueCard: 'Émettre une carte',
            issueNewCard: {
                whoNeedsCard: "Qui a besoin d'une carte ?",
                findMember: 'Trouver un membre',
                chooseCardType: 'Choisissez un type de carte',
                physicalCard: 'Carte physique',
                physicalCardDescription: 'Idéal pour les dépensiers fréquents',
                virtualCard: 'Carte virtuelle',
                virtualCardDescription: 'Instantané et flexible',
                chooseLimitType: 'Choisissez un type de limite',
                smartLimit: 'Limite intelligent',
                smartLimitDescription: "Dépensez jusqu'à un certain montant avant de nécessiter une approbation",
                monthly: 'Mensuel',
                monthlyDescription: "Dépensez jusqu'à un certain montant par mois",
                fixedAmount: 'Montant fixe',
                fixedAmountDescription: "Dépensez jusqu'à un certain montant une seule fois",
                setLimit: 'Définir une limite',
                cardLimitError: 'Veuillez saisir un montant inférieur à 21 474 836 $',
                giveItName: 'Donnez-lui un nom',
                giveItNameInstruction: "Rendez-la suffisamment unique pour la distinguer des autres cartes. Les cas d'utilisation spécifiques sont encore mieux !",
                cardName: 'Nom de la carte',
                letsDoubleCheck: 'Vérifions une seconde fois que tout semble correct.',
                willBeReady: "Cette carte sera prête à l'emploi immédiatement.",
                cardholder: 'Titulaire de la carte',
                cardType: 'Type de carte',
                limit: 'Limite',
                limitType: 'Type de limite',
                name: 'Nom',
            },
            deactivateCardModal: {
                deactivate: 'Désactiver',
                deactivateCard: 'Désactiver la carte',
                deactivateConfirmation: 'Désactiver cette carte refusera toutes les transactions futures et ne peut pas être annulé.',
            },
        },
        accounting: {
            settings: 'paramètres',
            title: 'Connexions',
            subtitle:
                'Connectez-vous à votre système comptable pour coder les transactions avec votre plan comptable, faire correspondre automatiquement les paiements et garder vos finances synchronisées.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Discutez avec votre spécialiste de configuration.',
            talkYourAccountManager: 'Discutez avec votre gestionnaire de compte.',
            talkToConcierge: 'Discuter avec Concierge.',
            needAnotherAccounting: "Besoin d'un autre logiciel de comptabilité ?",
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
            errorODIntegration: 'Il y a une erreur avec une connexion qui a été configurée dans Expensify Classic.',
            goToODToFix: 'Allez dans Expensify Classic pour résoudre ce problème.',
            goToODToSettings: 'Allez dans Expensify Classic pour gérer vos paramètres.',
            setup: 'Se connecter',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Dernière synchronisation ${relativeDate}`,
            notSync: 'Non synchronisé',
            import: 'Importer',
            export: 'Exporter',
            advanced: 'Avancé',
            other: 'Autre',
            syncNow: 'Synchroniser maintenant',
            disconnect: 'Déconnecter',
            reinstall: 'Réinstaller le connecteur',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'intégration';
                return `Déconnecter ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Connecter ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'intégration comptable'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Impossible de se connecter à QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Impossible de se connecter à Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Impossible de se connecter à NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Impossible de se connecter à QuickBooks Desktop';
                    default: {
                        return "Impossible de se connecter à l'intégration";
                    }
                }
            },
            accounts: 'Plan comptable',
            taxes: 'Taxes',
            imported: 'Importé',
            notImported: 'Non importé',
            importAsCategory: 'Importé en tant que catégories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Importé en tant que tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Non importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Non importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Importé en tant que champs de rapport',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Employé par défaut NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'cette intégration';
                return `Êtes-vous sûr de vouloir déconnecter ${integrationName} ?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Êtes-vous sûr de vouloir connecter ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'cette intégration comptable'} ? Cela supprimera toutes les connexions comptables existantes.`,
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
                            return 'Importation des employés';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importation des comptes';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importation des classes';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importation des emplacements';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Traitement des données importées';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronisation des rapports remboursés et des paiements de factures';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importation des codes fiscaux';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Vérification de la connexion QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importation des données QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importation des données Xero';
                        case 'startingImportQBO':
                            return 'Importation des données QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importation des données QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importation du titre';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return "Importation du certificat d'approbation";
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importation des dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return "Importation de la politique d'enregistrement";
                        case 'quickbooksDesktopWebConnectorReminder':
                            return "Synchronisation des données avec QuickBooks en cours... Veuillez vous assurer que le Web Connector est en cours d'exécution";
                        case 'quickbooksOnlineSyncTitle':
                            return 'Synchronisation des données QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Chargement des données';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Mise à jour des catégories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Mise à jour des clients/projets';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Mise à jour de la liste des personnes';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Mise à jour des champs du rapport';
                        case 'jobDone':
                            return 'En attente du chargement des données importées';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Synchronisation du plan comptable';
                        case 'xeroSyncImportCategories':
                            return 'Synchronisation des catégories';
                        case 'xeroSyncImportCustomers':
                            return 'Synchronisation des clients';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Marquer les rapports Expensify comme remboursés';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Marquer les factures et notes de frais Xero comme payées';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronisation des catégories de suivi';
                        case 'xeroSyncImportBankAccounts':
                            return 'Synchronisation des comptes bancaires';
                        case 'xeroSyncImportTaxRates':
                            return 'Synchronisation des taux de taxe';
                        case 'xeroCheckConnection':
                            return 'Vérification de la connexion Xero';
                        case 'xeroSyncTitle':
                            return 'Synchronisation des données Xero';
                        case 'netSuiteSyncConnection':
                            return 'Initialisation de la connexion à NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importation des clients';
                        case 'netSuiteSyncInitData':
                            return 'Récupération des données depuis NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importation des taxes';
                        case 'netSuiteSyncImportItems':
                            return 'Importation des articles';
                        case 'netSuiteSyncData':
                            return 'Importation de données dans Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Synchronisation des comptes';
                        case 'netSuiteSyncCurrencies':
                            return 'Synchronisation des devises';
                        case 'netSuiteSyncCategories':
                            return 'Synchronisation des catégories';
                        case 'netSuiteSyncReportFields':
                            return 'Importation des données en tant que champs de rapport Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importation des données en tant que tags Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Mise à jour des informations de connexion';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marquer les rapports Expensify comme remboursés';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marquer les factures et notes de frais NetSuite comme payées';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importation des fournisseurs';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importation de listes personnalisées';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importation de listes personnalisées';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importation des filiales';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importation des fournisseurs';
                        case 'intacctCheckConnection':
                            return 'Vérification de la connexion Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importation des dimensions Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importation des données Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Traduction manquante pour l'étape : ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Exportateur préféré',
            exportPreferredExporterNote:
                "L'exportateur préféré peut être n'importe quel administrateur d'espace de travail, mais doit également être un administrateur de domaine si vous définissez des comptes d'exportation différents pour les cartes d'entreprise individuelles dans les Paramètres de domaine.",
            exportPreferredExporterSubNote: "Une fois défini, l'exportateur préféré verra les rapports à exporter dans son compte.",
            exportAs: 'Exporter en',
            exportOutOfPocket: 'Exporter les dépenses personnelles en tant que',
            exportCompanyCard: 'Exporter les dépenses de la carte entreprise en tant que',
            exportDate: "Date d'exportation",
            defaultVendor: 'Fournisseur par défaut',
            autoSync: 'Synchronisation automatique',
            autoSyncDescription: 'Synchronisez NetSuite et Expensify automatiquement, chaque jour. Exportez le rapport finalisé en temps réel',
            reimbursedReports: 'Synchroniser les rapports remboursés',
            cardReconciliation: 'Rapprochement de carte',
            reconciliationAccount: 'Compte de rapprochement',
            continuousReconciliation: 'Rapprochement continu',
            saveHoursOnReconciliation:
                'Gagnez des heures sur la réconciliation à chaque période comptable en laissant Expensify réconcilier en continu les relevés et règlements de la carte Expensify pour vous.',
            enableContinuousReconciliation: 'Pour activer la Réconciliation Continue, veuillez activer',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Choisissez le compte bancaire contre lequel les paiements de votre carte Expensify seront rapprochés.',
                accountMatches: 'Assurez-vous que ce compte correspond à votre',
                settlementAccount: 'Compte de règlement de la carte Expensify',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) => `(se terminant par ${lastFourPAN}) afin que la Réconciliation Continue fonctionne correctement.`,
            },
        },
        export: {
            notReadyHeading: 'Pas prêt à exporter',
            notReadyDescription:
                'Les rapports de dépenses en brouillon ou en attente ne peuvent pas être exportés vers le système comptable. Veuillez approuver ou payer ces dépenses avant de les exporter.',
        },
        invoices: {
            sendInvoice: 'Envoyer la facture',
            sendFrom: 'Envoyé depuis',
            invoicingDetails: 'Détails de facturation',
            invoicingDetailsDescription: 'Ces informations apparaîtront sur vos factures.',
            companyName: "Nom de l'entreprise",
            companyWebsite: "Site web de l'entreprise",
            paymentMethods: {
                personal: 'Personnel',
                business: 'Entreprise',
                chooseInvoiceMethod: 'Choisissez un mode de paiement ci-dessous :',
                addBankAccount: 'Ajouter un compte bancaire',
                payingAsIndividual: "Payer en tant qu'individu",
                payingAsBusiness: "Payer en tant qu'entreprise",
            },
            invoiceBalance: 'Solde de la facture',
            invoiceBalanceSubtitle:
                'Ceci est votre solde actuel provenant des paiements de factures collectés. Il sera transféré automatiquement sur votre compte bancaire si vous en avez ajouté un.',
            bankAccountsSubtitle: 'Ajoutez un compte bancaire pour effectuer et recevoir des paiements de factures.',
        },
        invite: {
            member: 'Inviter un membre',
            members: 'Inviter des membres',
            invitePeople: 'Inviter de nouveaux membres',
            genericFailureMessage: "Une erreur s'est produite lors de l'invitation du membre dans l'espace de travail. Veuillez réessayer.",
            pleaseEnterValidLogin: `Veuillez vous assurer que l'adresse e-mail ou le numéro de téléphone est valide (par exemple ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'utilisateur',
            users: 'utilisateurs',
            invited: 'invité',
            removed: 'supprimé',
            to: 'à',
            from: 'de',
        },
        inviteMessage: {
            confirmDetails: 'Confirmer les détails',
            inviteMessagePrompt: 'Rendez votre invitation encore plus spéciale en ajoutant un message ci-dessous !',
            personalMessagePrompt: 'Message',
            genericFailureMessage: "Une erreur s'est produite lors de l'invitation du membre dans l'espace de travail. Veuillez réessayer.",
            inviteNoMembersError: 'Veuillez sélectionner au moins un membre à inviter',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} a demandé à rejoindre ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Oups ! Pas si vite...',
            workspaceNeeds: 'Un espace de travail nécessite au moins un tarif de distance activé.',
            distance: 'Distance',
            centrallyManage: 'Gérez les tarifs de manière centralisée, suivez en miles ou en kilomètres, et définissez une catégorie par défaut.',
            rate: 'Évaluer',
            addRate: 'Ajouter un tarif',
            findRate: 'Trouver le taux',
            trackTax: 'Suivre les taxes',
            deleteRates: () => ({
                one: 'Taux de suppression',
                other: 'Supprimer les tarifs',
            }),
            enableRates: () => ({
                one: 'Activer le taux',
                other: 'Activer les tarifs',
            }),
            disableRates: () => ({
                one: 'Désactiver le taux',
                other: 'Désactiver les tarifs',
            }),
            enableRate: 'Activer le taux',
            status: 'Statut',
            unit: 'Unité',
            taxFeatureNotEnabledMessage: 'Les taxes doivent être activées dans l’espace de travail pour utiliser cette fonctionnalité. Rendez-vous sur',
            changePromptMessage: 'pour effectuer ce changement.',
            deleteDistanceRate: 'Supprimer le tarif au kilomètre',
            areYouSureDelete: () => ({
                one: 'Êtes-vous sûr de vouloir supprimer ce tarif ?',
                other: 'Êtes-vous sûr de vouloir supprimer ces tarifs ?',
            }),
        },
        editor: {
            descriptionInputLabel: 'Description',
            nameInputLabel: 'Nom',
            typeInputLabel: 'Type',
            initialValueInputLabel: 'Valeur initiale',
            nameInputHelpText: "C'est le nom que vous verrez sur votre espace de travail.",
            nameIsRequiredError: 'Vous devrez donner un nom à votre espace de travail',
            currencyInputLabel: 'Devise par défaut',
            currencyInputHelpText: 'Toutes les dépenses de cet espace de travail seront converties dans cette devise.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `La devise par défaut ne peut pas être modifiée car cet espace de travail est lié à un compte bancaire en ${currency}.`,
            save: 'Enregistrer',
            genericFailureMessage: "Une erreur s'est produite lors de la mise à jour de l'espace de travail. Veuillez réessayer.",
            avatarUploadFailureMessage: "Une erreur est survenue lors du téléchargement de l'avatar. Veuillez réessayer.",
            addressContext: "Une adresse d'espace de travail est requise pour activer Expensify Travel. Veuillez saisir une adresse associée à votre entreprise.",
        },
        bankAccount: {
            continueWithSetup: 'Continuer la configuration',
            youAreAlmostDone:
                "Vous avez presque terminé la configuration de votre compte bancaire, ce qui vous permettra d'émettre des cartes d'entreprise, de rembourser des dépenses, de collecter des factures et de payer des factures.",
            streamlinePayments: 'Rationaliser les paiements',
            connectBankAccountNote: 'Remarque : Les comptes bancaires personnels ne peuvent pas être utilisés pour les paiements sur les espaces de travail.',
            oneMoreThing: 'Encore une chose !',
            allSet: 'Vous êtes prêt !',
            accountDescriptionWithCards: "Ce compte bancaire sera utilisé pour émettre des cartes d'entreprise, rembourser les dépenses, collecter les factures et payer les factures.",
            letsFinishInChat: 'Finissons dans le chat !',
            finishInChat: 'Terminer dans le chat',
            almostDone: 'Presque terminé !',
            disconnectBankAccount: 'Déconnecter le compte bancaire',
            startOver: 'Recommencer',
            updateDetails: 'Mettre à jour les détails',
            yesDisconnectMyBankAccount: 'Oui, déconnectez mon compte bancaire',
            yesStartOver: 'Oui, recommencez',
            disconnectYour: 'Déconnectez votre',
            bankAccountAnyTransactions: 'compte bancaire. Toutes les transactions en cours pour ce compte seront tout de même finalisées.',
            clearProgress: "Recommencer effacera les progrès que vous avez réalisés jusqu'à présent.",
            areYouSure: 'Êtes-vous sûr ?',
            workspaceCurrency: "Devise de l'espace de travail",
            updateCurrencyPrompt:
                "Il semble que votre espace de travail soit actuellement configuré dans une devise différente de l'USD. Veuillez cliquer sur le bouton ci-dessous pour mettre à jour votre devise en USD dès maintenant.",
            updateToUSD: 'Mettre à jour en USD',
            updateWorkspaceCurrency: "Mettre à jour la devise de l'espace de travail",
            workspaceCurrencyNotSupported: "La devise de l'espace de travail n'est pas prise en charge",
            yourWorkspace: 'Votre espace de travail est configuré avec une devise non prise en charge. Voir le',
            listOfSupportedCurrencies: 'liste des devises prises en charge',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transférer le propriétaire',
            addPaymentCardTitle: 'Entrez votre carte de paiement pour transférer la propriété',
            addPaymentCardButtonText: 'Accepter les conditions et ajouter une carte de paiement',
            addPaymentCardReadAndAcceptTextPart1: 'Lire et accepter',
            addPaymentCardReadAndAcceptTextPart2: 'politique pour ajouter votre carte',
            addPaymentCardTerms: 'conditions',
            addPaymentCardPrivacy: 'confidentialité',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Conforme à la norme PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Chiffrement de niveau bancaire',
            addPaymentCardRedundant: 'Infrastructure redondante',
            addPaymentCardLearnMore: 'En savoir plus sur notre',
            addPaymentCardSecurity: 'sécurité',
            amountOwedTitle: 'Solde impayé',
            amountOwedButtonText: 'OK',
            amountOwedText: "Ce compte présente un solde impayé d'un mois précédent.\n\nSouhaitez-vous régler ce solde et prendre en charge la facturation de cet espace de travail ?",
            ownerOwesAmountTitle: 'Solde impayé',
            ownerOwesAmountButtonText: 'Transférer le solde',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `Le compte propriétaire de cet espace de travail (${email}) a un solde impayé d'un mois précédent.\n\nSouhaitez-vous transférer ce montant (${amount}) afin de prendre en charge la facturation de cet espace de travail ? Votre carte de paiement sera débitée immédiatement.`,
            subscriptionTitle: "Prendre en charge l'abonnement annuel",
            subscriptionButtonText: "Transférer l'abonnement",
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `La prise en charge de cet espace de travail fusionnera son abonnement annuel avec votre abonnement actuel. Cela augmentera la taille de votre abonnement de ${usersCount} membres, portant la taille de votre nouvel abonnement à ${finalCount}. Souhaitez-vous continuer ?`,
            duplicateSubscriptionTitle: 'Alerte de double abonnement',
            duplicateSubscriptionButtonText: 'Continuer',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Il semble que vous essayiez de prendre en charge la facturation des espaces de travail de ${email}, mais pour cela, vous devez d'abord être administrateur de tous leurs espaces de travail.\n\nCliquez sur "Continuer" si vous souhaitez uniquement prendre en charge la facturation de l'espace de travail ${workspaceName}.\n\nSi vous souhaitez prendre en charge la facturation de l'ensemble de leur abonnement, veuillez leur demander de vous ajouter comme administrateur à tous leurs espaces de travail avant de prendre en charge la facturation.`,
            hasFailedSettlementsTitle: 'Impossible de transférer la propriété',
            hasFailedSettlementsButtonText: 'Compris',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Vous ne pouvez pas reprendre la facturation car ${email} a un règlement en retard de la carte Expensify Expensify. Veuillez leur demander de contacter concierge@expensify.com pour résoudre le problème. Ensuite, vous pourrez reprendre la facturation pour cet espace de travail.`,
            failedToClearBalanceTitle: 'Échec de la réinitialisation du solde',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: "Nous n'avons pas pu régler le solde. Veuillez réessayer plus tard.",
            successTitle: 'Youpi ! Tout est prêt.',
            successDescription: 'Vous êtes maintenant le propriétaire de cet espace de travail.',
            errorTitle: 'Oups ! Pas si vite...',
            errorDescriptionPartOne: 'Un problème est survenu lors du transfert de la propriété de cet espace de travail. Réessayez, ou',
            errorDescriptionPartTwo: 'contacter Concierge',
            errorDescriptionPartThree: 'pour aide.',
        },
        exportAgainModal: {
            title: 'Attention !',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `Les rapports suivants ont déjà été exportés vers ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} :\n\n${reportName}\n\nÊtes-vous sûr de vouloir les exporter à nouveau ?`,
            confirmText: 'Oui, exporter à nouveau',
            cancelText: 'Annuler',
        },
        upgrade: {
            reportFields: {
                title: 'Champs du rapport',
                description: `Les champs de rapport vous permettent de spécifier des détails au niveau de l'en-tête, distincts des tags qui concernent les dépenses sur des lignes individuelles. Ces détails peuvent inclure des noms de projets spécifiques, des informations sur les voyages d'affaires, des emplacements, et plus encore.`,
                onlyAvailableOnPlan: 'Les champs de rapport sont disponibles uniquement dans le plan Control, à partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profitez de la synchronisation automatisée et réduisez les saisies manuelles grâce à l'intégration Expensify + NetSuite. Obtenez des informations financières approfondies en temps réel avec la prise en charge native et personnalisée des segments, y compris la cartographie des projets et des clients.`,
                onlyAvailableOnPlan: 'Notre intégration NetSuite est uniquement disponible avec le plan Control, à partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profitez de la synchronisation automatisée et réduisez les saisies manuelles grâce à l'intégration Expensify + Sage Intacct. Obtenez des informations financières approfondies et en temps réel avec des dimensions définies par l'utilisateur, ainsi que le codage des dépenses par département, classe, emplacement, client et projet (travail).`,
                onlyAvailableOnPlan: 'Notre intégration Sage Intacct est uniquement disponible avec le plan Control, à partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Profitez de la synchronisation automatisée et réduisez les saisies manuelles grâce à l'intégration Expensify + QuickBooks Desktop. Gagnez en efficacité ultime avec une connexion bidirectionnelle en temps réel et un codage des dépenses par classe, article, client et projet.`,
                onlyAvailableOnPlan: 'Notre intégration QuickBooks Desktop est uniquement disponible avec le plan Control, à partir de',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Approbations avancées',
                description: `Si vous souhaitez ajouter davantage de niveaux d'approbation – ou simplement vous assurer que les dépenses les plus importantes soient examinées une fois de plus – nous avons ce qu'il vous faut. Les approbations avancées vous aident à mettre en place les contrôles appropriés à chaque niveau afin de garder les dépenses de votre équipe sous contrôle.`,
                onlyAvailableOnPlan: 'Les approbations avancées sont uniquement disponibles dans le plan Control, qui commence à',
            },
            categories: {
                title: 'Catégories',
                description: `Les catégories vous aident à mieux organiser vos dépenses afin de suivre où vous dépensez votre argent. Utilisez notre liste de catégories suggérées ou créez la vôtre.`,
                onlyAvailableOnPlan: 'Les catégories sont disponibles avec le plan Collect, à partir de',
            },
            glCodes: {
                title: 'Codes GL',
                description: `Ajoutez des codes GL à vos catégories et tags pour faciliter l'exportation des dépenses vers vos systèmes de comptabilité et de paie.`,
                onlyAvailableOnPlan: 'Les codes GL sont disponibles uniquement dans le plan Control, à partir de',
            },
            glAndPayrollCodes: {
                title: 'Codes GL et de paie',
                description: `Ajoutez des codes GL et de paie à vos catégories pour faciliter l'exportation des dépenses vers vos systèmes de comptabilité et de paie.`,
                onlyAvailableOnPlan: 'Les codes GL et de paie sont uniquement disponibles dans le plan Control, à partir de',
            },
            taxCodes: {
                title: 'Codes fiscaux',
                description: `Ajoutez des codes fiscaux à vos taxes pour faciliter l'exportation des dépenses vers vos systèmes de comptabilité et de paie.`,
                onlyAvailableOnPlan: 'Les codes fiscaux sont disponibles uniquement avec le plan Control, à partir de',
            },
            companyCards: {
                title: "Cartes d'entreprise illimitées",
                description: `Besoin d'ajouter plus de flux de cartes ? Débloquez un nombre illimité de cartes d'entreprise pour synchroniser les transactions de tous les principaux émetteurs de cartes.`,
                onlyAvailableOnPlan: 'Ceci est uniquement disponible dans le plan Control, à partir de',
            },
            rules: {
                title: 'Règles',
                description: `Les règles fonctionnent en arrière-plan et vous aident à garder vos dépenses sous contrôle pour que vous n'ayez pas à vous soucier des détails.\n\nExigez des informations sur les dépenses comme les reçus et les descriptions, définissez des limites et des valeurs par défaut, et automatisez les approbations et les paiements – le tout en un seul endroit.`,
                onlyAvailableOnPlan: 'Les règles sont uniquement disponibles avec le plan Control, à partir de',
            },
            perDiem: {
                title: 'Indemnité journalière',
                description:
                    'Le per diem est un excellent moyen de garder vos coûts quotidiens conformes et prévisibles chaque fois que vos employés voyagent. Profitez de fonctionnalités telles que des tarifs personnalisés, des catégories par défaut, et des détails plus précis comme les destinations et les sous-tarifs.',
                onlyAvailableOnPlan: 'Les per diem sont uniquement disponibles avec le plan Control, à partir de',
            },
            travel: {
                title: 'Voyage',
                description:
                    "Expensify Travel est une nouvelle plateforme de réservation et de gestion de voyages d'affaires qui permet aux membres de réserver des hébergements, des vols, des transports, et plus encore.",
                onlyAvailableOnPlan: 'Le voyage est disponible avec le plan Collect, à partir de',
            },
            multiLevelTags: {
                title: 'Tags à plusieurs niveaux',
                description:
                    "Les tags à plusieurs niveaux vous aident à suivre les dépenses avec une plus grande précision. Assignez plusieurs tags à chaque poste—comme département, client ou centre de coûts—pour capturer le contexte complet de chaque dépense. Cela permet des rapports plus détaillés, des flux d'approbation et des exports comptables plus précis.",
                onlyAvailableOnPlan: 'Les balises à plusieurs niveaux sont disponibles uniquement dans le plan Control, à partir de',
            },
            pricing: {
                perActiveMember: 'par membre actif par mois.',
                perMember: 'par membre par mois.',
            },
            note: {
                upgradeWorkspace: 'Mettez à niveau votre espace de travail pour accéder à cette fonctionnalité, ou',
                learnMore: 'en savoir plus',
                aboutOurPlans: 'à propos de nos plans et tarifs.',
            },
            upgradeToUnlock: 'Déverrouiller cette fonctionnalité',
            completed: {
                headline: `Vous avez mis à niveau votre espace de travail !`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `Vous avez réussi à passer ${policyName} au plan Control !`,
                categorizeMessage: `Vous avez réussi à passer à un espace de travail avec le plan Collect. Vous pouvez maintenant catégoriser vos dépenses !`,
                travelMessage: `Vous avez réussi à passer à un espace de travail avec le plan Collect. Vous pouvez maintenant commencer à réserver et gérer vos voyages !`,
                viewSubscription: 'Voir votre abonnement',
                moreDetails: 'pour plus de détails.',
                gotIt: 'Compris, merci',
            },
            commonFeatures: {
                title: 'Passez au plan Control',
                note: 'Débloquez nos fonctionnalités les plus puissantes, y compris :',
                benefits: {
                    startsAt: 'Le plan Contrôle commence à',
                    perMember: 'par membre actif par mois.',
                    learnMore: 'En savoir plus',
                    pricing: 'à propos de nos plans et tarifs.',
                    benefit1: 'Connexions comptables avancées (NetSuite, Sage Intacct, et plus)',
                    benefit2: 'Règles de dépenses intelligentes',
                    benefit3: "Flux de travail d'approbation à plusieurs niveaux",
                    benefit4: 'Contrôles de sécurité renforcés',
                    toUpgrade: 'Pour mettre à niveau, cliquez',
                    selectWorkspace: 'sélectionnez un espace de travail, et changez le type de plan en',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Rétrograder vers le plan Collect',
                note: "Si vous rétrogradez, vous perdrez l'accès à ces fonctionnalités et plus encore :",
                benefits: {
                    note: 'Pour une comparaison complète de nos forfaits, consultez notre',
                    pricingPage: 'page de tarification',
                    confirm: 'Êtes-vous sûr de vouloir rétrograder et supprimer vos configurations ?',
                    warning: 'Cela ne peut pas être annulé.',
                    benefit1: 'Connexions comptables (sauf QuickBooks Online et Xero)',
                    benefit2: 'Règles de dépenses intelligentes',
                    benefit3: "Flux de travail d'approbation à plusieurs niveaux",
                    benefit4: 'Contrôles de sécurité renforcés',
                    headsUp: 'Attention !',
                    multiWorkspaceNote: 'Vous devrez rétrograder tous vos espaces de travail avant votre premier paiement mensuel pour commencer un abonnement au tarif Collect. Cliquez',
                    selectStep: '> sélectionnez chaque espace de travail > changez le type de plan en',
                },
            },
            completed: {
                headline: 'Votre espace de travail a été rétrogradé',
                description: "Vous avez d'autres espaces de travail sur le plan Control. Pour être facturé au tarif Collect, vous devez rétrograder tous les espaces de travail.",
                gotIt: 'Compris, merci',
            },
        },
        payAndDowngrade: {
            title: 'Payer et rétrograder',
            headline: 'Votre paiement final',
            description1: 'Votre facture finale pour cet abonnement sera',
            description2: ({date}: DateParams) => `Voir votre répartition ci-dessous pour le ${date} :`,
            subscription:
                "Attention ! Cette action mettra fin à votre abonnement Expensify, supprimera cet espace de travail et retirera tous les membres de l'espace de travail. Si vous souhaitez conserver cet espace de travail et seulement vous retirer, demandez d'abord à un autre administrateur de prendre en charge la facturation.",
            genericFailureMessage: 'Une erreur est survenue lors du paiement de votre facture. Veuillez réessayer.',
        },
        restrictedAction: {
            restricted: 'Restreint',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Les actions sur l'espace de travail ${workspaceName} sont actuellement restreintes`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Le propriétaire de l'espace de travail, ${workspaceOwnerName}, devra ajouter ou mettre à jour la carte de paiement enregistrée pour débloquer la nouvelle activité de l'espace de travail.`,
            youWillNeedToAddOrUpdatePaymentCard: "Vous devrez ajouter ou mettre à jour la carte de paiement enregistrée pour débloquer la nouvelle activité de l'espace de travail.",
            addPaymentCardToUnlock: 'Ajoutez une carte de paiement pour débloquer !',
            addPaymentCardToContinueUsingWorkspace: 'Ajoutez une carte de paiement pour continuer à utiliser cet espace de travail',
            pleaseReachOutToYourWorkspaceAdmin: "Veuillez contacter l'administrateur de votre espace de travail pour toute question.",
            chatWithYourAdmin: 'Discutez avec votre administrateur',
            chatInAdmins: 'Discuter dans #admins',
            addPaymentCard: 'Ajouter une carte de paiement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Dépenses',
                subtitle: 'Définissez des contrôles de dépenses et des valeurs par défaut pour les dépenses individuelles. Vous pouvez également créer des règles pour',
                receiptRequiredAmount: 'Montant requis pour le reçu',
                receiptRequiredAmountDescription: "Exiger des reçus lorsque les dépenses dépassent ce montant, sauf si une règle de catégorie l'emporte.",
                maxExpenseAmount: 'Montant maximal des dépenses',
                maxExpenseAmountDescription: 'Signaler les dépenses qui dépassent ce montant, sauf si une règle de catégorie les remplace.',
                maxAge: 'Âge maximum',
                maxExpenseAge: 'Âge maximal des dépenses',
                maxExpenseAgeDescription: 'Signaler une dépense datant de plus d’un certain nombre de jours.',
                maxExpenseAgeDays: () => ({
                    one: '1 jour',
                    other: (count: number) => `${count} jours`,
                }),
                billableDefault: 'Facturable par défaut',
                billableDefaultDescription:
                    'Choisissez si les dépenses en espèces et par carte de crédit doivent être facturables par défaut. Les dépenses facturables sont activées ou désactivées dans',
                billable: 'Facturable',
                billableDescription: 'Les dépenses sont le plus souvent refacturées aux clients',
                nonBillable: 'Non facturable',
                nonBillableDescription: 'Les dépenses sont occasionnellement refacturées aux clients',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'Les eReçus sont créés automatiquement',
                eReceiptsHintLink: 'pour la plupart des transactions de crédit en USD',
                attendeeTracking: 'Suivi des participants',
                attendeeTrackingHint: 'Suivez le coût par personne pour chaque dépense.',
                prohibitedDefaultDescription:
                    "Signalez tous les reçus contenant de l'alcool, des jeux d'argent ou d'autres articles restreints. Les dépenses avec des reçus comportant ces articles nécessiteront une révision manuelle.",
                prohibitedExpenses: 'Dépenses interdites',
                alcohol: 'Alcool',
                hotelIncidentals: "Dépenses annexes à l'hôtel",
                gambling: "Jeux d'argent",
                tobacco: 'Tabac',
                adultEntertainment: 'Divertissement pour adultes',
            },
            expenseReportRules: {
                examples: 'Exemples :',
                title: 'Rapports de dépenses',
                subtitle: 'Automatisez la conformité des rapports de dépenses, les approbations et les paiements.',
                customReportNamesSubtitle: 'Personnalisez les titres de rapport en utilisant notre',
                customNameTitle: 'Titre de rapport par défaut',
                customNameDescription: 'Choisissez un nom personnalisé pour les rapports de dépenses en utilisant notre',
                customNameDescriptionLink: 'formules étendues',
                customNameInputLabel: 'Nom',
                customNameEmailPhoneExample: 'E-mail ou téléphone du membre : {report:submit:from}',
                customNameStartDateExample: 'Date de début du rapport : {report:startdate}',
                customNameWorkspaceNameExample: "Nom de l'espace de travail : {report:workspacename}",
                customNameReportIDExample: 'ID du rapport : {report:id}',
                customNameTotalExample: 'Total : {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Empêcher les membres de modifier les noms des rapports personnalisés',
                preventSelfApprovalsTitle: 'Empêcher les auto-approbations',
                preventSelfApprovalsSubtitle: 'Empêcher les membres de l’espace de travail d’approuver leurs propres notes de frais.',
                autoApproveCompliantReportsTitle: 'Approuver automatiquement les rapports conformes',
                autoApproveCompliantReportsSubtitle: "Configurez quels rapports de dépenses sont éligibles à l'approbation automatique.",
                autoApproveReportsUnderTitle: 'Approuver automatiquement les rapports inférieurs à',
                autoApproveReportsUnderDescription: 'Les rapports de dépenses entièrement conformes inférieurs à ce montant seront automatiquement approuvés.',
                randomReportAuditTitle: 'Audit aléatoire du rapport',
                randomReportAuditDescription: "Exiger que certains rapports soient approuvés manuellement, même s'ils sont éligibles à l'approbation automatique.",
                autoPayApprovedReportsTitle: 'Paiement automatique des rapports approuvés',
                autoPayApprovedReportsSubtitle: 'Configurez quels rapports de dépenses sont éligibles au paiement automatique.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Veuillez saisir un montant inférieur à ${currency ?? ''}20 000`,
                autoPayApprovedReportsLockedSubtitle: 'Allez dans plus de fonctionnalités et activez les workflows, puis ajoutez des paiements pour débloquer cette fonctionnalité.',
                autoPayReportsUnderTitle: 'Paiement automatique des rapports sous',
                autoPayReportsUnderDescription: 'Les rapports de dépenses entièrement conformes inférieurs à ce montant seront automatiquement payés.',
                unlockFeatureGoToSubtitle: 'Aller à',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) =>
                    `et activez les flux de travail, puis ajoutez ${featureName} pour débloquer cette fonctionnalité.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `et activez ${featureName} pour débloquer cette fonctionnalité.`,
            },
            categoryRules: {
                title: 'Règles de catégorie',
                approver: 'Approbateur',
                requireDescription: 'Description requise',
                descriptionHint: 'Indice de description',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Rappelez aux employés de fournir des informations supplémentaires pour les dépenses « ${categoryName} ». Cet indice apparaît dans le champ de description des dépenses.`,
                descriptionHintLabel: 'Indice',
                descriptionHintSubtitle: "Astuce : Plus c'est court, mieux c'est !",
                maxAmount: 'Montant maximum',
                flagAmountsOver: 'Signaler les montants supérieurs à',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `S'applique à la catégorie « ${categoryName} ».`,
                flagAmountsOverSubtitle: 'Cela remplace le montant maximum pour toutes les dépenses.',
                expenseLimitTypes: {
                    expense: 'Dépense individuelle',
                    expenseSubtitle:
                        "Signaler les montants des dépenses par catégorie. Cette règle remplace la règle générale de l'espace de travail concernant le montant maximal des dépenses.",
                    daily: 'Total de la catégorie',
                    dailySubtitle: 'Marquer la dépense totale par catégorie pour chaque note de frais.',
                },
                requireReceiptsOver: 'Exiger des reçus supérieurs à',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Par défaut`,
                    never: 'Ne jamais exiger de reçus',
                    always: 'Toujours exiger des reçus',
                },
                defaultTaxRate: 'Taux de taxe par défaut',
                goTo: 'Aller à',
                andEnableWorkflows: 'et activez les flux de travail, puis ajoutez des approbations pour débloquer cette fonctionnalité.',
            },
            customRules: {
                title: 'Règles personnalisées',
                subtitle: 'Description',
                description: 'Saisir des règles personnalisées pour les rapports de dépenses',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Collecter',
                    description: 'Pour les équipes souhaitant automatiser leurs processus.',
                },
                corporate: {
                    label: 'Contrôle',
                    description: 'Pour les organisations ayant des exigences avancées.',
                },
            },
            description: 'Choisissez un plan qui vous convient. Pour une liste détaillée des fonctionnalités et des tarifs, consultez notre',
            subscriptionLink: "page d'aide sur les types de forfaits et les tarifs",
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Vous vous êtes engagé à 1 membre actif sur le plan Control jusqu'à la fin de votre abonnement annuel le ${annualSubscriptionEndDate}. Vous pouvez passer à un abonnement à l'utilisation et rétrograder vers le plan Collect à partir du ${annualSubscriptionEndDate} en désactivant le renouvellement automatique dans`,
                other: `Vous vous êtes engagé à ${count} membres actifs sur le plan Control jusqu'à la fin de votre abonnement annuel le ${annualSubscriptionEndDate}. Vous pouvez passer à un abonnement à l'utilisation et rétrograder au plan Collect à partir du ${annualSubscriptionEndDate} en désactivant le renouvellement automatique dans`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: "Obtenir de l'aide",
        subtitle: 'Nous sommes là pour dégager votre chemin vers la grandeur !',
        description: "Choisissez parmi les options d'assistance ci-dessous :",
        chatWithConcierge: 'Discuter avec Concierge',
        scheduleSetupCall: 'Planifier un appel de configuration',
        scheduleACall: 'Planifier un appel',
        questionMarkButtonTooltip: "Obtenez de l'aide de notre équipe",
        exploreHelpDocs: "Explorer les documents d'aide",
        registerForWebinar: 'Inscrivez-vous au webinaire',
        onboardingHelp: "Aide à l'intégration",
    },
    emojiPicker: {
        skinTonePickerLabel: 'Changer la couleur de peau par défaut',
        headers: {
            frequentlyUsed: 'Fréquemment utilisé',
            smileysAndEmotion: 'Émoticônes & Émotion',
            peopleAndBody: 'Personnes & Corps',
            animalsAndNature: 'Animaux & Nature',
            foodAndDrink: 'Nourriture & Boissons',
            travelAndPlaces: 'Voyages & Lieux',
            activities: 'Activités',
            objects: 'Objets',
            symbols: 'Symboles',
            flags: 'Drapeaux',
        },
    },
    newRoomPage: {
        newRoom: 'Nouvelle salle',
        groupName: 'Nom du groupe',
        roomName: 'Nom de la salle',
        visibility: 'Visibilité',
        restrictedDescription: 'Les personnes dans votre espace de travail peuvent trouver cette salle',
        privateDescription: 'Les personnes invitées dans cette salle peuvent la trouver',
        publicDescription: "N'importe qui peut trouver cette salle",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: "N'importe qui peut trouver cette salle",
        createRoom: 'Créer une chambre',
        roomAlreadyExistsError: 'Une pièce portant ce nom existe déjà',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} est une salle par défaut dans tous les espaces de travail. Veuillez choisir un autre nom.`,
        roomNameInvalidError: 'Les noms de salle ne peuvent inclure que des lettres minuscules, des chiffres et des tirets.',
        pleaseEnterRoomName: 'Veuillez entrer un nom de salle',
        pleaseSelectWorkspace: 'Veuillez sélectionner un espace de travail',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor} a renommé en "${newName}" (précédemment "${oldName}")` : `${actor} a renommé cette salle en "${newName}" (précédemment "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Salle renommée en ${newName}`,
        social: 'social',
        selectAWorkspace: 'Sélectionnez un espace de travail',
        growlMessageOnRenameError: "Impossible de renommer la salle de l'espace de travail. Veuillez vérifier votre connexion et réessayer.",
        visibilityOptions: {
            restricted: 'Espace de travail', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privé',
            public: 'Public',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Annonce Publique',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Soumettre et Fermer',
        submitAndApprove: 'Soumettre et approuver',
        advanced: 'AVANCÉ',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `a ajouté ${approverName} (${approverEmail}) en tant qu'approbateur pour le ${field} « ${name} »`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `a supprimé ${approverName} (${approverEmail}) en tant qu'approbateur pour le ${field} « ${name} »`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `a changé l'approbateur pour le ${field} « ${name} » en ${formatApprover(newApproverName, newApproverEmail)} (précédemment ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `a ajouté la catégorie « ${categoryName} »`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `catégorie supprimée « ${categoryName} »`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'désactivé' : 'activé'} la catégorie "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `a ajouté le code de paie "${newValue}" à la catégorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `a supprimé le code de paie "${oldValue}" de la catégorie "${categoryName}"`;
            }
            return `a modifié le code de paie de la catégorie "${categoryName}" en “${newValue}” (précédemment “${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `a ajouté le code GL "${newValue}" à la catégorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `a supprimé le code GL "${oldValue}" de la catégorie "${categoryName}"`;
            }
            return `a modifié le code GL de la catégorie « ${categoryName} » en « ${newValue} » (précédemment « ${oldValue} »)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `a modifié la description de la catégorie "${categoryName}" en ${!oldValue ? 'requis' : 'pas obligatoire'} (précédemment ${!oldValue ? 'pas obligatoire' : 'requis'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `ajouté un montant maximum de ${newAmount} à la catégorie « ${categoryName} »`;
            }
            if (oldAmount && !newAmount) {
                return `a supprimé le montant maximum de ${oldAmount} de la catégorie "${categoryName}"`;
            }
            return `a modifié le montant maximal de la catégorie "${categoryName}" à ${newAmount} (précédemment ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `a ajouté un type de limite de ${newValue} à la catégorie "${categoryName}"`;
            }
            return `a modifié le type de limite de catégorie "${categoryName}" en ${newValue} (précédemment ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `a mis à jour la catégorie "${categoryName}" en changeant Reçus en ${newValue}`;
            }
            return `a changé la catégorie "${categoryName}" en ${newValue} (précédemment ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `a renommé la catégorie "${oldName}" en "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `a supprimé l'indice de description "${oldValue}" de la catégorie "${categoryName}"`;
            }
            return !oldValue
                ? `a ajouté l'indice de description "${newValue}" à la catégorie "${categoryName}"`
                : `a modifié l'indice de description de la catégorie "${categoryName}" en « ${newValue} » (précédemment « ${oldValue} »)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `a changé le nom de la liste de tags en "${newName}" (précédemment "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `a ajouté le tag "${tagName}" à la liste "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `a mis à jour la liste de tags "${tagListName}" en modifiant le tag "${oldName}" en "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'activé' : 'désactivé'} le tag "${tagName}" sur la liste "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `a supprimé le tag "${tagName}" de la liste "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `supprimé les balises "${count}" de la liste "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `a mis à jour la balise "${tagName}" dans la liste "${tagListName}" en modifiant le ${updatedField} à "${newValue}" (précédemment "${oldValue}")`;
            }
            return `a mis à jour le tag "${tagName}" dans la liste "${tagListName}" en ajoutant un ${updatedField} de "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `a modifié le ${customUnitName} ${updatedField} en "${newValue}" (précédemment "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Suivi fiscal ${newValue ? 'activé' : 'désactivé'} sur les tarifs au kilomètre`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `ajouté un nouveau tarif "${customUnitName}" "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `a modifié le taux de ${customUnitName} ${updatedField} "${customUnitRateName}" à "${newValue}" (précédemment "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `a modifié le taux de taxe sur le tarif à distance "${customUnitRateName}" à "${newValue} (${newTaxPercentage})" (précédemment "${oldValue} (${oldTaxPercentage})")`;
            }
            return `a ajouté le taux de taxe « ${newValue} (${newTaxPercentage}) » au tarif de distance « ${customUnitRateName} »`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `a modifié la partie récupérable de la taxe sur le taux de distance "${customUnitRateName}" à "${newValue}" (précédemment "${oldValue}")`;
            }
            return `a ajouté une partie récupérable de taxe de "${newValue}" au tarif de distance "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `a supprimé le taux "${rateName}" de "${customUnitName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `champ de rapport ${fieldType} ajouté "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `définir la valeur par défaut du champ de rapport "${fieldName}" à "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `a ajouté l'option "${optionName}" au champ de rapport "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `a supprimé l'option "${optionName}" du champ de rapport "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'activé' : 'désactivé'} l'option "${optionName}" pour le champ de rapport "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'activé' : 'désactivé'} toutes les options pour le champ de rapport "${fieldName}"`;
            }
            return `${allEnabled ? 'activé' : 'désactivé'} l'option "${optionName}" pour le champ de rapport "${fieldName}", rendant toutes les options ${allEnabled ? 'activé' : 'désactivé'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `champ de rapport ${fieldType} "${fieldName}" supprimé`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `mis à jour "Empêcher l'auto-approbation" en "${newValue === 'true' ? 'Activé' : 'Désactivé'}" (précédemment "${oldValue === 'true' ? 'Activé' : 'Désactivé'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a modifié le montant maximum de la dépense nécessitant un reçu à ${newValue} (précédemment ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a modifié le montant maximal des dépenses pour les violations à ${newValue} (précédemment ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `mis à jour "Âge maximal des dépenses (jours)" à "${newValue}" (précédemment "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `définir la date de soumission du rapport mensuel à "${newValue}"`;
            }
            return `mise à jour de la date de soumission du rapport mensuel à "${newValue}" (précédemment "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `mis à jour "Re-bill expenses to clients" en "${newValue}" (précédemment "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `activé "Appliquer les titres de rapport par défaut" ${value ? 'allumé' : 'désactivé'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `a mis à jour le nom de cet espace de travail en "${newName}" (précédemment "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `définir la description de cet espace de travail à "${newDescription}"`
                : `a mis à jour la description de cet espace de travail en "${newDescription}" (précédemment "${oldDescription}")`,
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
                one: `vous a retiré du flux d'approbation et du chat des dépenses de ${joinedNames}. Les rapports soumis précédemment resteront disponibles pour approbation dans votre boîte de réception.`,
                other: `vous a retiré des flux d'approbation et des discussions de dépenses de ${joinedNames}. Les rapports soumis précédemment resteront disponibles pour approbation dans votre boîte de réception.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `a mis à jour votre rôle dans ${policyName} de ${oldRole} à utilisateur. Vous avez été retiré de toutes les discussions de soumission de dépenses sauf la vôtre.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `a mis à jour la devise par défaut en ${newCurrency} (précédemment ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `a mis à jour la fréquence de rapport automatique à "${newFrequency}" (précédemment "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `a mis à jour le mode d'approbation en "${newValue}" (précédemment "${oldValue}")`,
        upgradedWorkspace: 'a mis à niveau cet espace de travail vers le plan Control',
        downgradedWorkspace: 'a rétrogradé cet espace de travail vers le plan Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `a modifié le taux des rapports acheminés aléatoirement pour approbation manuelle à ${Math.round(newAuditRate * 100)}% (précédemment ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `a modifié la limite d'approbation manuelle pour toutes les dépenses à ${newLimit} (précédemment ${oldLimit})`,
    },
    roomMembersPage: {
        memberNotFound: 'Membre non trouvé.',
        useInviteButton: "Pour inviter un nouveau membre à la discussion, veuillez utiliser le bouton d'invitation ci-dessus.",
        notAuthorized: `Vous n'avez pas accès à cette page. Si vous essayez de rejoindre cette salle, demandez simplement à un membre de la salle de vous ajouter. Autre chose ? Contactez ${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Êtes-vous sûr de vouloir retirer ${memberName} de la salle ?`,
            other: 'Êtes-vous sûr de vouloir retirer les membres sélectionnés de la salle ?',
        }),
        error: {
            genericAdd: "Un problème est survenu lors de l'ajout de ce membre à la salle",
        },
    },
    newTaskPage: {
        assignTask: 'Attribuer la tâche',
        assignMe: 'Attribuez-moi',
        confirmTask: 'Confirmer la tâche',
        confirmError: 'Veuillez saisir un titre et sélectionner une destination de partage',
        descriptionOptional: 'Description (optionnel)',
        pleaseEnterTaskName: 'Veuillez saisir un titre',
        pleaseEnterTaskDestination: 'Veuillez sélectionner où vous souhaitez partager cette tâche',
    },
    task: {
        task: 'Tâche',
        title: 'Titre',
        description: 'Description',
        assignee: 'Assigné',
        completed: 'Terminé',
        action: 'Completé',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `tâche pour ${title}`,
            completed: 'marqué comme terminé',
            canceled: 'tâche supprimée',
            reopened: 'marqué comme incomplet',
            error: "Vous n'avez pas la permission d'effectuer l'action demandée",
        },
        markAsComplete: 'Marquer comme terminé',
        markAsIncomplete: 'Marquer comme incomplet',
        assigneeError: "Une erreur s'est produite lors de l'attribution de cette tâche. Veuillez essayer un autre assigné.",
        genericCreateTaskFailureMessage: 'Une erreur est survenue lors de la création de cette tâche. Veuillez réessayer plus tard.',
        deleteTask: 'Supprimer la tâche',
        deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer cette tâche ?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Relevé de ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Raccourcis clavier',
        subtitle: 'Gagnez du temps avec ces raccourcis clavier pratiques :',
        shortcuts: {
            openShortcutDialog: 'Ouvre la boîte de dialogue des raccourcis clavier',
            markAllMessagesAsRead: 'Marquer tous les messages comme lus',
            escape: "Dialogues d'échappement",
            search: 'Ouvrir la boîte de dialogue de recherche',
            newChat: 'Nouvel écran de chat',
            copy: 'Copier le commentaire',
            openDebug: 'Ouvrir la boîte de dialogue des préférences de test',
        },
    },
    guides: {
        screenShare: "Partage d'écran",
        screenShareRequest: 'Expensify vous invite à partager votre écran',
    },
    search: {
        resultsAreLimited: 'Les résultats de la recherche sont limités.',
        viewResults: 'Voir les résultats',
        resetFilters: 'Réinitialiser les filtres',
        searchResults: {
            emptyResults: {
                title: 'Rien à afficher',
                subtitle: "Essayez d'ajuster vos critères de recherche ou de créer quelque chose avec le bouton vert +.",
            },
            emptyExpenseResults: {
                title: "Vous n'avez encore créé aucune dépense",
                subtitle: "Créez une dépense ou faites un essai d'Expensify pour en savoir plus.",
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour créer une dépense.',
            },
            emptyReportResults: {
                title: "Vous n'avez encore créé aucun rapport",
                subtitle: "Créez un rapport ou faites un essai d'Expensify pour en savoir plus.",
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour créer un rapport.',
            },
            emptyInvoiceResults: {
                title: "Vous n'avez encore créé aucune \nfacture",
                subtitle: 'Envoyez une facture ou essayez Expensify pour en savoir plus.',
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour envoyer une facture.',
            },
            emptyTripResults: {
                title: 'Aucun voyage à afficher',
                subtitle: 'Commencez en réservant votre premier voyage ci-dessous.',
                buttonText: 'Réserver un voyage',
            },
            emptySubmitResults: {
                title: 'Aucune dépense à soumettre',
                subtitle: 'Vous êtes tout bon. Faites un tour de victoire !',
                buttonText: 'Créer un rapport',
            },
            emptyApproveResults: {
                title: 'Aucune dépense à approuver',
                subtitle: 'Aucune dépense. Détente maximale. Bien joué !',
            },
            emptyPayResults: {
                title: 'Aucune dépense à payer',
                subtitle: "Félicitations ! Vous avez franchi la ligne d'arrivée.",
            },
            emptyExportResults: {
                title: 'Aucune dépense à exporter',
                subtitle: 'Il est temps de se détendre, bon travail.',
            },
        },
        saveSearch: 'Enregistrer la recherche',
        deleteSavedSearch: 'Supprimer la recherche enregistrée',
        deleteSavedSearchConfirm: 'Êtes-vous sûr de vouloir supprimer cette recherche ?',
        searchName: 'Rechercher un nom',
        savedSearchesMenuItemTitle: 'Enregistré',
        groupedExpenses: 'dépenses groupées',
        bulkActions: {
            approve: 'Approuver',
            pay: 'Payer',
            delete: 'Supprimer',
            hold: 'Attendez',
            unhold: 'Supprimer la mise en attente',
            noOptionsAvailable: 'Aucune option disponible pour le groupe de dépenses sélectionné.',
        },
        filtersHeader: 'Filtres',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Avant ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Après ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `Le ${date ?? ''}`,
            },
            status: 'Statut',
            keyword: 'Mot-clé',
            hasKeywords: 'A des mots-clés',
            currency: 'Devise',
            link: 'Lien',
            pinned: 'Épinglé',
            unread: 'Non lu',
            completed: 'Terminé',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Moins de ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Supérieur à ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Entre ${greaterThan} et ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Cartes individuelles',
                closedCards: 'Cartes fermées',
                cardFeeds: 'Flux de cartes',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Tous les ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Toutes les cartes importées CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Actuel',
            past: 'Passé',
            submitted: 'Date de soumission',
            approved: 'Date approuvée',
            paid: 'Date de paiement',
            exported: "Date d'exportation",
            posted: 'Date de publication',
            billable: 'Facturable',
            reimbursable: 'Remboursable',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Ce rapport ne contient aucune dépense.',
            emptyStateSubtitle: 'Vous pouvez ajouter des dépenses à ce rapport en utilisant le bouton ci-dessus.',
        },
        noCategory: 'Pas de catégorie',
        noTag: "Pas d'étiquette",
        expenseType: 'Type de dépense',
        recentSearches: 'Recherches récentes',
        recentChats: 'Discussions récentes',
        searchIn: 'Rechercher dans',
        searchPlaceholder: 'Rechercher quelque chose',
        suggestions: 'Suggestions',
        exportSearchResults: {
            title: 'Créer une exportation',
            description: "Waouh, cela fait beaucoup d'articles ! Nous allons les regrouper, et Concierge vous enverra un fichier sous peu.",
        },
        exportAll: {
            selectAllMatchingItems: 'Sélectionnez tous les éléments correspondants',
            allMatchingItemsSelected: 'Tous les éléments correspondants sélectionnés',
        },
    },
    genericErrorPage: {
        title: 'Oups, quelque chose a mal tourné !',
        body: {
            helpTextMobile: "Veuillez fermer et rouvrir l'application, ou passer à",
            helpTextWeb: 'web.',
            helpTextConcierge: 'Si le problème persiste, contactez',
        },
        refresh: 'Actualiser',
    },
    fileDownload: {
        success: {
            title: 'Téléchargé !',
            message: 'Pièce jointe téléchargée avec succès !',
            qrMessage:
                'Vérifiez votre dossier photos ou téléchargements pour une copie de votre code QR. Astuce : Ajoutez-le à une présentation pour que votre audience puisse le scanner et se connecter directement avec vous.',
        },
        generalError: {
            title: 'Erreur de pièce jointe',
            message: 'La pièce jointe ne peut pas être téléchargée',
        },
        permissionError: {
            title: 'Accès au stockage',
            message: 'Expensify ne peut pas enregistrer les pièces jointes sans accès au stockage. Appuyez sur paramètres pour mettre à jour les autorisations.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nouveau Expensify',
        about: 'À propos de New Expensify',
        update: 'Mettre à jour New Expensify',
        checkForUpdates: 'Vérifier les mises à jour',
        toggleDevTools: 'Basculer les outils de développement',
        viewShortcuts: 'Voir les raccourcis clavier',
        services: 'Services',
        hide: 'Masquer Nouveau Expensify',
        hideOthers: 'Masquer les autres',
        showAll: 'Tout afficher',
        quit: 'Quitter New Expensify',
        fileMenu: 'Fichier',
        closeWindow: 'Fermer la fenêtre',
        editMenu: 'Modifier',
        undo: 'Annuler',
        redo: 'Recommencer',
        cut: 'Couper',
        copy: 'Copier',
        paste: 'Coller',
        pasteAndMatchStyle: 'Coller et adapter le style',
        pasteAsPlainText: 'Coller en texte brut',
        delete: 'Supprimer',
        selectAll: 'Tout sélectionner',
        speechSubmenu: 'Discours',
        startSpeaking: 'Commencer à parler',
        stopSpeaking: 'Arrêtez de parler',
        viewMenu: 'Afficher',
        reload: 'Recharger',
        forceReload: 'Forcer le rechargement',
        resetZoom: 'Taille réelle',
        zoomIn: 'Zoomer',
        zoomOut: 'Dézoomer',
        togglefullscreen: 'Basculer en plein écran',
        historyMenu: 'Historique',
        back: 'Retour',
        forward: 'Transférer',
        windowMenu: 'Fenêtre',
        minimize: 'Minimiser',
        zoom: 'Zoom',
        front: 'Tout mettre au premier plan',
        helpMenu: 'Aide',
        learnMore: 'En savoir plus',
        documentation: 'Documentation',
        communityDiscussions: 'Discussions Communautaires',
        searchIssues: 'Rechercher des problèmes',
    },
    historyMenu: {
        forward: 'Transférer',
        back: 'Retour',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Mise à jour disponible',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `La nouvelle version sera disponible sous peu.${!isSilentUpdating ? 'Nous vous informerons lorsque nous serons prêts à effectuer la mise à jour.' : ''}`,
            soundsGood: 'Ça marche bien',
        },
        notAvailable: {
            title: 'Mise à jour indisponible',
            message: "Il n'y a pas de mise à jour disponible pour le moment. Veuillez revenir plus tard !",
            okay: "D'accord",
        },
        error: {
            title: 'La vérification de mise à jour a échoué',
            message: "Nous n'avons pas pu vérifier la mise à jour. Veuillez réessayer dans un instant.",
        },
    },
    report: {
        newReport: {
            createReport: 'Créer un rapport',
            chooseWorkspace: 'Choisissez un espace de travail pour ce rapport.',
        },
        genericCreateReportFailureMessage: 'Erreur inattendue lors de la création de cette conversation. Veuillez réessayer plus tard.',
        genericAddCommentFailureMessage: 'Erreur inattendue lors de la publication du commentaire. Veuillez réessayer plus tard.',
        genericUpdateReportFieldFailureMessage: 'Erreur inattendue lors de la mise à jour du champ. Veuillez réessayer plus tard.',
        genericUpdateReportNameEditFailureMessage: 'Erreur inattendue lors du renommage du rapport. Veuillez réessayer plus tard.',
        noActivityYet: 'Aucune activité pour le moment',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `a modifié ${fieldName} de ${oldValue} à ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `changé ${fieldName} en ${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `a changé l'espace de travail en ${toPolicyName}${fromPolicyName ? `(auparavant ${fromPolicyName})` : ''}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `type modifié de ${oldType} à ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `a envoyé ce rapport à ${delegateUser} puisque ${originalManager} est en vacances`,
                exportedToCSV: `exporté en CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `exporté vers ${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `exporté vers ${label} via`,
                    automaticActionTwo: 'paramètres comptables',
                    manual: ({label}: ExportedToIntegrationParams) => `a marqué ce rapport comme exporté manuellement vers ${label}.`,
                    automaticActionThree: 'et a créé avec succès un enregistrement pour',
                    reimburseableLink: 'dépenses personnelles',
                    nonReimbursableLink: "dépenses de carte d'entreprise",
                    pending: ({label}: ExportedToIntegrationParams) => `début de l'exportation de ce rapport vers ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `échec de l'exportation de ce rapport vers ${label} ("${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `ajouté un reçu`,
                managerDetachReceipt: `reçu supprimé`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `payé ${currency}${amount} ailleurs`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `payé ${currency}${amount} via intégration`,
                outdatedBankAccount: `impossible de traiter le paiement en raison d’un problème avec le compte bancaire du payeur`,
                reimbursementACHBounce: `le paiement n'a pas pu être traité, car le payeur n'a pas de fonds suffisants`,
                reimbursementACHCancelled: `paiement annulé`,
                reimbursementAccountChanged: `impossible de traiter le paiement, car le payeur a changé de compte bancaire`,
                reimbursementDelayed: `le paiement a été traité mais il est retardé de 1 à 2 jours ouvrables supplémentaires`,
                selectedForRandomAudit: `sélectionné au hasard pour révision`,
                selectedForRandomAuditMarkdown: `[aléatoirement sélectionné](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) pour révision`,
                share: ({to}: ShareParams) => `membre invité ${to}`,
                unshare: ({to}: UnshareParams) => `membre supprimé ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `payé ${currency}${amount}`,
                takeControl: `a pris le contrôle`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `échec de la synchronisation avec ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `a ajouté ${email} en tant que ${role === 'member' ? 'a' : 'un'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `a mis à jour le rôle de ${email} en ${newRole} (précédemment ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `champ personnalisé 1 de ${email} supprimé (précédemment « ${previousValue} »)`;
                    }
                    return !previousValue
                        ? `a ajouté « ${newValue} » au champ personnalisé 1 de ${email}`
                        : `a modifié le champ personnalisé 1 de ${email} en "${newValue}" (précédemment "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `a supprimé le champ personnalisé 2 de ${email} (précédemment "${previousValue}")`;
                    }
                    return !previousValue
                        ? `a ajouté "${newValue}" au champ personnalisé 2 de ${email}`
                        : `a modifié le champ personnalisé 2 de ${email} en "${newValue}" (précédemment "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} a quitté l’espace de travail`,
                removeMember: ({email, role}: AddEmployeeParams) => `supprimé ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `connexion à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} supprimée`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `connecté à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'a quitté la conversation',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} pour ${dayCount} ${dayCount === 1 ? 'jour' : 'jours'} jusqu'au ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} de ${timePeriod} le ${date}`,
    },
    footer: {
        features: 'Fonctionnalités',
        expenseManagement: 'Gestion des dépenses',
        spendManagement: 'Gestion des dépenses',
        expenseReports: 'Rapports de dépenses',
        companyCreditCard: "Carte de crédit d'entreprise",
        receiptScanningApp: 'Application de numérisation des reçus',
        billPay: 'Paiement de factures',
        invoicing: 'Facturation',
        CPACard: 'Carte CPA',
        payroll: 'Paie',
        travel: 'Voyage',
        resources: 'Ressources',
        expensifyApproved: 'ExpensifyApprouvé !',
        pressKit: 'Kit de presse',
        support: 'Support',
        expensifyHelp: 'ExpensifyHelp',
        terms: "Conditions d'utilisation",
        privacy: 'Confidentialité',
        learnMore: 'En savoir plus',
        aboutExpensify: "À propos d'Expensify",
        blog: 'Blog',
        jobs: 'Emplois',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relations avec les investisseurs',
        getStarted: 'Commencer',
        createAccount: 'Créer un nouveau compte',
        logIn: 'Se connecter',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Retourner à la liste des discussions',
        chatWelcomeMessage: 'Message de bienvenue du chat',
        navigatesToChat: 'Navigue vers une discussion',
        newMessageLineIndicator: 'Indicateur de nouvelle ligne de message',
        chatMessage: 'Message de chat',
        lastChatMessagePreview: 'Aperçu du dernier message de chat',
        workspaceName: "Nom de l'espace de travail",
        chatUserDisplayNames: "Noms d'affichage des membres du chat",
        scrollToNewestMessages: "Faire défiler jusqu'aux messages les plus récents",
        preStyledText: 'Texte pré-stylé',
        viewAttachment: 'Voir la pièce jointe',
    },
    parentReportAction: {
        deletedReport: 'Rapport supprimé',
        deletedMessage: 'Message supprimé',
        deletedExpense: 'Dépense supprimée',
        reversedTransaction: 'Transaction inversée',
        deletedTask: 'Tâche supprimée',
        hiddenMessage: 'Message caché',
    },
    threads: {
        thread: 'Fil de discussion',
        replies: 'Réponses',
        reply: 'Répondre',
        from: 'De',
        in: 'dans',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `De ${reportName}${workspaceName ? `dans ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: "Copier l'URL",
        copied: 'Copié !',
    },
    moderation: {
        flagDescription: 'Tous les messages signalés seront envoyés à un modérateur pour examen.',
        chooseAReason: 'Choisissez une raison pour signaler ci-dessous :',
        spam: 'Spam',
        spamDescription: 'Promotion hors sujet non sollicitée',
        inconsiderate: 'Inconsiderate',
        inconsiderateDescription: 'Formulation insultante ou irrespectueuse, avec des intentions douteuses',
        intimidation: 'Intimidation',
        intimidationDescription: 'Poursuivre agressivement un programme malgré des objections valides',
        bullying: 'Harcèlement',
        bullyingDescription: 'Cibler un individu pour obtenir son obéissance',
        harassment: 'Harcèlement',
        harassmentDescription: 'Comportement raciste, misogyne ou autre comportement discriminatoire généralisé',
        assault: 'Agression',
        assaultDescription: "Attaque émotionnelle spécifiquement ciblée avec l'intention de nuire",
        flaggedContent: 'Ce message a été signalé comme violant nos règles communautaires et le contenu a été masqué.',
        hideMessage: 'Masquer le message',
        revealMessage: 'Afficher le message',
        levelOneResult: 'Envoie un avertissement anonyme et le message est signalé pour examen.',
        levelTwoResult: 'Message masqué du canal, avec avertissement anonyme et message signalé pour révision.',
        levelThreeResult: 'Message supprimé du canal, avertissement anonyme ajouté et message signalé pour examen.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Invitez-les',
        nothing: 'Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accepter',
        decline: 'Refuser',
    },
    actionableMentionTrackExpense: {
        submit: "Soumettre à quelqu'un",
        categorize: 'Catégorisez-le',
        share: 'Partagez-le avec mon comptable',
        nothing: 'Rien pour le moment',
    },
    teachersUnitePage: {
        teachersUnite: 'Enseignants Unis',
        joinExpensifyOrg:
            'Rejoignez Expensify.org pour éliminer l\'injustice dans le monde. La campagne actuelle "Teachers Unite" soutient les enseignants partout en partageant les coûts des fournitures scolaires essentielles.',
        iKnowATeacher: 'Je connais un professeur',
        iAmATeacher: 'Je suis enseignant(e)',
        getInTouch: 'Excellent ! Veuillez partager leurs informations afin que nous puissions les contacter.',
        introSchoolPrincipal: "Présentation à votre directeur d'école",
        schoolPrincipalVerifyExpense:
            "Expensify.org répartit le coût des fournitures scolaires essentielles afin que les élèves issus de familles à faible revenu puissent bénéficier d'une meilleure expérience d'apprentissage. Votre directeur sera invité à vérifier vos dépenses.",
        principalFirstName: 'Prénom du principal',
        principalLastName: 'Nom de famille principal',
        principalWorkEmail: 'Email professionnel principal',
        updateYourEmail: 'Mettez à jour votre adresse e-mail',
        updateEmail: "Mettre à jour l'adresse e-mail",
        contactMethods: 'Méthodes de contact.',
        schoolMailAsDefault:
            'Avant de continuer, veuillez vous assurer de définir votre e-mail scolaire comme méthode de contact par défaut. Vous pouvez le faire dans Paramètres > Profil >',
        error: {
            enterPhoneEmail: 'Entrez un e-mail ou un numéro de téléphone valide',
            enterEmail: 'Entrez un e-mail',
            enterValidEmail: 'Entrez une adresse e-mail valide',
            tryDifferentEmail: 'Veuillez essayer une autre adresse e-mail',
        },
    },
    cardTransactions: {
        notActivated: 'Non activé',
        outOfPocket: 'Dépenses personnelles',
        companySpend: "Dépenses de l'entreprise",
    },
    distance: {
        addStop: 'Ajouter une pause',
        deleteWaypoint: 'Supprimer le point de passage',
        deleteWaypointConfirmation: 'Êtes-vous sûr de vouloir supprimer ce point de passage ?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Commencer',
            stop: 'Arrêter',
        },
        mapPending: {
            title: 'Cartographie en attente',
            subtitle: 'La carte sera générée lorsque vous serez de nouveau en ligne',
            onlineSubtitle: 'Un instant pendant que nous configurons la carte',
            errorTitle: 'Erreur de cartographie',
            errorSubtitle: 'Une erreur est survenue lors du chargement de la carte. Veuillez réessayer.',
        },
        error: {
            selectSuggestedAddress: 'Veuillez sélectionner une adresse suggérée ou utiliser la position actuelle',
        },
    },
    reportCardLostOrDamaged: {
        report: 'Signaler la perte / détérioration de la carte physique',
        screenTitle: 'Bulletin perdu ou endommagé',
        nextButtonLabel: 'Suivant',
        reasonTitle: "Pourquoi avez-vous besoin d'une nouvelle carte ?",
        cardDamaged: 'Ma carte a été endommagée',
        cardLostOrStolen: 'Ma carte a été perdue ou volée',
        confirmAddressTitle: "Veuillez confirmer l'adresse postale pour votre nouvelle carte.",
        cardDamagedInfo: "Votre nouvelle carte arrivera dans 2 à 3 jours ouvrables. Votre carte actuelle continuera de fonctionner jusqu'à ce que vous activiez la nouvelle.",
        cardLostOrStolenInfo: 'Votre carte actuelle sera désactivée définitivement dès que votre commande sera passée. La plupart des cartes arrivent en quelques jours ouvrables.',
        address: 'Adresse',
        deactivateCardButton: 'Désactiver la carte',
        shipNewCardButton: 'Envoyer une nouvelle carte',
        addressError: "L'adresse est requise",
        reasonError: 'La raison est obligatoire',
    },
    eReceipt: {
        guaranteed: 'eReçu garanti',
        transactionDate: 'Date de la transaction',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'Commencer une conversation,',
            buttonText2: 'parrainer un ami.',
            header: 'Commencer une discussion, parrainer un ami',
            body: 'Vous voulez que vos amis utilisent Expensify aussi ? Commencez simplement une conversation avec eux et nous nous occuperons du reste.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Soumettre une dépense,',
            buttonText2: 'référez votre patron.',
            header: 'Soumettre une dépense, référer à votre patron',
            body: 'Vous voulez que votre patron utilise Expensify aussi ? Il vous suffit de lui soumettre une dépense et nous nous occupons du reste.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Parrainer un ami',
            body: "Vous voulez que vos amis utilisent Expensify aussi ? Il vous suffit de discuter, payer ou partager une dépense avec eux et nous nous occupons du reste. Ou simplement partagez votre lien d'invitation !",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Parrainer un ami',
            header: 'Parrainer un ami',
            body: "Vous voulez que vos amis utilisent Expensify aussi ? Il vous suffit de discuter, payer ou partager une dépense avec eux et nous nous occupons du reste. Ou simplement partagez votre lien d'invitation !",
        },
        copyReferralLink: "Copier le lien d'invitation",
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Discutez avec votre spécialiste de configuration dans',
            phrase2: 'pour aide',
        },
        default: {
            phrase1: 'Message',
            phrase2: "pour obtenir de l'aide pour la configuration",
        },
    },
    violations: {
        allTagLevelsRequired: 'Tous les tags requis',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) =>
            `${rejectedBy} a rejeté cette dépense avec le commentaire « ${rejectReason} »`,
        billableExpense: "Facturable n'est plus valide",
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Reçu requis${formattedLimit ? `au-delà de ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Catégorie non valide',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Surcharge de conversion appliquée de ${surcharge}%`,
        customUnitOutOfPolicy: 'Taux non valide pour cet espace de travail',
        duplicatedTransaction: 'Dupliquer',
        fieldRequired: 'Les champs du rapport sont obligatoires',
        futureDate: 'Date future non autorisée',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Majoration de ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Date antérieure à ${maxAge} jours`,
        missingCategory: 'Catégorie manquante',
        missingComment: 'Description requise pour la catégorie sélectionnée',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Manquant ${tagName ?? 'étiquette'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Le montant diffère de la distance calculée';
                case 'card':
                    return 'Montant supérieur à la transaction par carte';
                default:
                    if (displayPercentVariance) {
                        return `Montant supérieur de ${displayPercentVariance}% à celui du reçu scanné`;
                    }
                    return 'Montant supérieur au reçu scanné';
            }
        },
        modifiedDate: 'La date diffère de celle du reçu scanné',
        nonExpensiworksExpense: 'Dépense hors Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `La dépense dépasse la limite d'auto-approbation de ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Montant dépassant la limite de ${formattedLimit} par personne et par catégorie`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Montant dépassant la limite de ${formattedLimit}/personne`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Montant dépassant la limite de ${formattedLimit}/personne`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Montant dépassant la limite quotidienne de ${formattedLimit}/personne pour la catégorie`,
        receiptNotSmartScanned:
            'Détails des dépenses et reçu ajoutés manuellement. Veuillez vérifier les détails. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">En savoir plus</a> sur l\'audit automatique de tous les reçus.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = 'Reçu requis';
            if (formattedLimit ?? category) {
                message += 'terminé';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += 'limite de catégorie';
                }
            }
            return message;
        },
        prohibitedExpense: ({prohibitedExpenseType}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Dépense interdite :';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return `${preMessage} alcool`;
                case 'gambling':
                    return `${preMessage} jeu d'argent`;
                case 'tobacco':
                    return `${preMessage} tabac`;
                case 'adultEntertainment':
                    return `${preMessage} divertissement pour adultes`;
                case 'hotelIncidentals':
                    return `${preMessage} frais accessoires d'hôtel`;
                default:
                    return `${preMessage}${prohibitedExpenseType}`;
            }
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: 'Examen requis',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return '';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `Impossible d'associer automatiquement le reçu en raison d'une connexion bancaire interrompue que ${email} doit réparer`
                    : "Impossible d'associer automatiquement le reçu en raison d'une connexion bancaire interrompue que vous devez réparer.";
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Demandez à ${member} de marquer comme espèces ou attendez 7 jours et réessayez.` : 'En attente de fusion avec la transaction de carte.';
            }
            return '';
        },
        brokenConnection530Error: "Reçu en attente en raison d'une connexion bancaire interrompue",
        adminBrokenConnectionError: "Reçu en attente en raison d'une connexion bancaire interrompue. Veuillez résoudre dans",
        memberBrokenConnectionError: "Reçu en attente en raison d'une connexion bancaire interrompue. Veuillez demander à un administrateur de l'espace de travail de résoudre le problème.",
        markAsCashToIgnore: 'Marquer comme espèces pour ignorer et demander le paiement.',
        smartscanFailed: ({canEdit = true}) => `La numérisation du reçu a échoué.${canEdit ? 'Saisir les détails manuellement.' : ''}`,
        receiptGeneratedWithAI: 'Reçu potentiellement généré par IA',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Manquant ${tagName ?? 'Étiquette'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Étiquette'} n'est plus valide`,
        taxAmountChanged: 'Le montant de la taxe a été modifié',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Taxe'} n'est plus valide`,
        taxRateChanged: 'Le taux de taxe a été modifié',
        taxRequired: 'Taux de taxe manquant',
        none: 'Aucun',
        taxCodeToKeep: 'Choisissez quel code fiscal conserver',
        tagToKeep: 'Choisissez quelle balise conserver',
        isTransactionReimbursable: 'Choisissez si la transaction est remboursable',
        merchantToKeep: 'Choisissez quel commerçant conserver',
        descriptionToKeep: 'Choisissez la description à conserver',
        categoryToKeep: 'Choisissez la catégorie à conserver',
        isTransactionBillable: 'Choisissez si la transaction est facturable',
        keepThisOne: 'Conservez celui-ci',
        confirmDetails: `Confirmez les détails que vous conservez`,
        confirmDuplicatesInfo: `Les demandes en double que vous ne conservez pas seront retenues pour que le membre puisse les supprimer.`,
        hold: 'Cette dépense a été mise en attente',
        resolvedDuplicates: 'résolu le doublon',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} est requis`,
    },
    violationDismissal: {
        rter: {
            manual: 'a marqué ce reçu comme espèces',
        },
        duplicatedTransaction: {
            manual: 'résolu le doublon',
        },
    },
    videoPlayer: {
        play: 'Jouer',
        pause: 'Pause',
        fullscreen: 'Plein écran',
        playbackSpeed: 'Vitesse de lecture',
        expand: 'Développer',
        mute: 'Muet',
        unmute: 'Réactiver le son',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Avant de partir',
        reasonPage: {
            title: 'Veuillez nous dire pourquoi vous partez',
            subtitle: 'Avant de partir, veuillez nous dire pourquoi vous souhaitez passer à Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "J'ai besoin d'une fonctionnalité disponible uniquement dans Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Je ne comprends pas comment utiliser New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Je comprends comment utiliser New Expensify, mais je préfère Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Quelle fonctionnalité vous manque-t-il dans New Expensify ?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Que cherchez-vous à faire ?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Pourquoi préférez-vous Expensify Classic ?',
        },
        responsePlaceholder: 'Votre réponse',
        thankYou: 'Merci pour vos retours !',
        thankYouSubtitle: 'Vos réponses nous aideront à créer un meilleur produit pour accomplir les tâches. Merci beaucoup !',
        goToExpensifyClassic: 'Passer à Expensify Classic',
        offlineTitle: 'On dirait que vous êtes coincé ici...',
        offline:
            'Vous semblez être hors ligne. Malheureusement, Expensify Classic ne fonctionne pas hors ligne, mais New Expensify oui. Si vous préférez utiliser Expensify Classic, réessayez lorsque vous aurez une connexion internet.',
        quickTip: 'Astuce rapide...',
        quickTipSubTitle: 'Vous pouvez accéder directement à Expensify Classic en visitant expensify.com. Mettez-le en favori pour un accès rapide !',
        bookACall: 'Planifier un appel',
        noThanks: 'Non merci',
        bookACallTitle: 'Souhaitez-vous parler à un chef de produit ?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Discuter directement des dépenses et des rapports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Capacité à tout faire sur mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Voyage et dépenses à la vitesse du chat',
        },
        bookACallTextTop: 'En passant à Expensify Classic, vous manquerez :',
        bookACallTextBottom:
            "Nous serions ravis d'avoir un appel avec vous pour comprendre pourquoi. Vous pouvez réserver un appel avec l'un de nos chefs de produit senior pour discuter de vos besoins.",
        takeMeToExpensifyClassic: 'Emmène-moi à Expensify Classic',
    },
    listBoundary: {
        errorMessage: "Une erreur s'est produite lors du chargement de plus de messages",
        tryAgain: 'Réessayez',
    },
    systemMessage: {
        mergedWithCashTransaction: 'a associé un reçu à cette transaction',
    },
    subscription: {
        authenticatePaymentCard: 'Authentifier la carte de paiement',
        mobileReducedFunctionalityMessage: "Vous ne pouvez pas modifier votre abonnement dans l'application mobile.",
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Essai gratuit : ${numOfDays} ${numOfDays === 1 ? 'jour' : 'jours'} restants`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Vos informations de paiement sont obsolètes',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Mettez à jour votre carte de paiement avant le ${date} pour continuer à utiliser toutes vos fonctionnalités préférées.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: "Votre paiement n'a pas pu être traité",
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Votre charge du ${date} de ${purchaseAmountOwed} n'a pas pu être traitée. Veuillez ajouter une carte de paiement pour régler le montant dû.`
                        : 'Veuillez ajouter une carte de paiement pour régler le montant dû.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Vos informations de paiement sont obsolètes',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Votre paiement est en retard. Veuillez régler votre facture avant le ${date} pour éviter une interruption de service.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Vos informations de paiement sont obsolètes',
                subtitle: 'Votre paiement est en retard. Veuillez régler votre facture.',
            },
            billingDisputePending: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Vous avez contesté le montant de ${amountOwed} sur la carte se terminant par ${cardEnding}. Votre compte sera bloqué jusqu'à ce que le litige soit résolu avec votre banque.`,
            },
            cardAuthenticationRequired: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Votre carte de paiement n’a pas été entièrement authentifiée. Veuillez compléter le processus d’authentification pour activer votre carte de paiement se terminant par ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Votre carte de paiement a été refusée en raison de fonds insuffisants. Veuillez réessayer ou ajouter une nouvelle carte de paiement pour régler votre solde impayé de ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Votre carte de paiement a expiré. Veuillez ajouter une nouvelle carte de paiement pour régler votre solde impayé de ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Votre carte expire bientôt',
                subtitle:
                    'Votre carte de paiement expirera à la fin de ce mois. Cliquez sur le menu à trois points ci-dessous pour la mettre à jour et continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            retryBillingSuccess: {
                title: 'Succès !',
                subtitle: 'Votre carte a été débitée avec succès.',
            },
            retryBillingError: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle:
                    "Avant de réessayer, veuillez appeler directement votre banque pour autoriser les prélèvements Expensify et lever toute retenue. Sinon, essayez d'ajouter une autre carte de paiement.",
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Vous avez contesté le montant de ${amountOwed} sur la carte se terminant par ${cardEnding}. Votre compte sera bloqué jusqu'à ce que le litige soit résolu avec votre banque.`,
            preTrial: {
                title: 'Commencer un essai gratuit',
                subtitleStart: 'Comme prochaine étape,',
                subtitleLink: 'complétez votre liste de contrôle de configuration',
                subtitleEnd: 'pour que votre équipe puisse commencer à enregistrer les dépenses.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Essai : ${numOfDays} ${numOfDays === 1 ? 'jour' : 'jours'} restants !`,
                subtitle: 'Ajoutez une carte de paiement pour continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            trialEnded: {
                title: "Votre période d'essai gratuite est terminée",
                subtitle: 'Ajoutez une carte de paiement pour continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            earlyDiscount: {
                claimOffer: "Réclamer l'offre",
                noThanks: 'Non merci',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% de réduction sur votre première année !`,
                    phrase2: `Ajoutez simplement une carte de paiement et commencez un abonnement annuel.`,
                },
                onboardingChatTitle: {
                    phrase1: 'Offre à durée limitée :',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% de réduction sur votre première année !`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Réclamer dans ${days > 0 ? `${days}j :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Paiement',
            subtitle: 'Ajoutez une carte pour payer votre abonnement Expensify.',
            addCardButton: 'Ajouter une carte de paiement',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Votre prochaine date de paiement est le ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Carte se terminant par ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nom : ${name}, Expiration : ${expiration}, Devise : ${currency}`,
            changeCard: 'Changer de carte de paiement',
            changeCurrency: 'Changer la devise de paiement',
            cardNotFound: 'Aucune carte de paiement ajoutée',
            retryPaymentButton: 'Réessayer le paiement',
            authenticatePayment: 'Authentifier le paiement',
            requestRefund: 'Demander un remboursement',
            requestRefundModal: {
                phrase1: 'Obtenir un remboursement est facile, il vous suffit de rétrograder votre compte avant votre prochaine date de facturation et vous recevrez un remboursement.',
                phrase2:
                    "Attention : Rétrograder votre compte signifie que votre/vos espace(s) de travail seront supprimé(s). Cette action est irréversible, mais vous pouvez toujours créer un nouvel espace de travail si vous changez d'avis.",
                confirm: 'Supprimer l(es) espace(s) de travail et rétrograder',
            },
            viewPaymentHistory: "Voir l'historique des paiements",
        },
        yourPlan: {
            title: 'Votre forfait',
            exploreAllPlans: 'Découvrez tous les plans',
            customPricing: 'Tarification personnalisée',
            asLowAs: ({price}: YourPlanPriceValueParams) => `à partir de ${price} par membre actif/mois`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} par membre/mois`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} par membre par mois`,
            perMemberMonth: 'par membre/mois',
            collect: {
                title: 'Collecter',
                description: 'Le plan pour petites entreprises qui vous offre dépenses, voyages et chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, ${upper}/membre actif sans la carte Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, ${upper}/membre actif sans la carte Expensify.`,
                benefit1: 'Numérisation des reçus',
                benefit2: 'Remboursements',
                benefit3: "Gestion des cartes d'entreprise",
                benefit4: 'Approbations des dépenses et des voyages',
                benefit5: 'Réservation de voyage et règles',
                benefit6: 'Intégrations QuickBooks/Xero',
                benefit7: 'Discuter des dépenses, rapports et salles',
                benefit8: 'Assistance par IA et humaine',
            },
            control: {
                title: 'Contrôle',
                description: 'Dépenses, voyages et chat pour les grandes entreprises.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, ${upper}/membre actif sans la carte Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, ${upper}/membre actif sans la carte Expensify.`,
                benefit1: 'Tout dans le plan Collect',
                benefit2: "Flux de travail d'approbation à plusieurs niveaux",
                benefit3: 'Règles de dépenses personnalisées',
                benefit4: 'Intégrations ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Intégrations RH (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Informations personnalisées et rapports',
                benefit8: 'Budgétisation',
            },
            thisIsYourCurrentPlan: 'Ceci est votre forfait actuel',
            downgrade: 'Rétrograder vers Collect',
            upgrade: 'Passer à Control',
            addMembers: 'Ajouter des membres',
            saveWithExpensifyTitle: 'Économisez avec la carte Expensify',
            saveWithExpensifyDescription: "Utilisez notre calculateur d'économies pour voir comment le cashback de la carte Expensify peut réduire votre facture Expensify.",
            saveWithExpensifyButton: 'En savoir plus',
        },
        compareModal: {
            comparePlans: 'Comparer les forfaits',
            unlockTheFeatures: 'Débloquez les fonctionnalités dont vous avez besoin avec le forfait qui vous convient.',
            viewOurPricing: 'Voir notre page de tarification',
            forACompleteFeatureBreakdown: 'pour une description complète des fonctionnalités de chacun de nos plans.',
        },
        details: {
            title: "Détails de l'abonnement",
            annual: 'Abonnement annuel',
            taxExempt: "Demander le statut d'exonération fiscale",
            taxExemptEnabled: 'Exonéré de taxe',
            taxExemptStatus: "Statut d'exonération fiscale",
            payPerUse: "Paiement à l'utilisation",
            subscriptionSize: "Taille de l'abonnement",
            headsUp:
                'Attention : Si vous ne définissez pas la taille de votre abonnement maintenant, nous la fixerons automatiquement en fonction du nombre de membres actifs lors de votre premier mois. Vous vous engagerez alors à payer pour au moins ce nombre de membres pendant les 12 mois suivants. Vous pouvez augmenter la taille de votre abonnement à tout moment, mais vous ne pouvez pas la diminuer avant la fin de votre abonnement.',
            zeroCommitment: 'Aucun engagement au tarif annuel réduit',
        },
        subscriptionSize: {
            title: "Taille de l'abonnement",
            yourSize: "La taille de votre abonnement correspond au nombre de places disponibles pouvant être occupées par n'importe quel membre actif au cours d'un mois donné.",
            eachMonth:
                "Chaque mois, votre abonnement couvre jusqu'au nombre de membres actifs défini ci-dessus. Chaque fois que vous augmentez la taille de votre abonnement, vous commencerez un nouvel abonnement de 12 mois à cette nouvelle taille.",
            note: "Remarque : Un membre actif est toute personne ayant créé, modifié, soumis, approuvé, remboursé ou exporté des données de dépenses liées à votre espace de travail d'entreprise.",
            confirmDetails: 'Confirmez les détails de votre nouvel abonnement annuel :',
            subscriptionSize: "Taille de l'abonnement",
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membres actifs/mois`,
            subscriptionRenews: 'Abonnement renouvelé',
            youCantDowngrade: 'Vous ne pouvez pas rétrograder pendant votre abonnement annuel.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Vous vous êtes déjà engagé à un abonnement annuel de ${size} membres actifs par mois jusqu'au ${date}. Vous pouvez passer à un abonnement à l'usage le ${date} en désactivant le renouvellement automatique.`,
            error: {
                size: "Veuillez saisir une taille d'abonnement valide",
                sameSize: 'Veuillez saisir un nombre différent de la taille actuelle de votre abonnement',
            },
        },
        paymentCard: {
            addPaymentCard: 'Ajouter une carte de paiement',
            enterPaymentCardDetails: 'Entrez les détails de votre carte de paiement',
            security: 'Expensify est conforme à la norme PCI-DSS, utilise un chiffrement de niveau bancaire et utilise une infrastructure redondante pour protéger vos données.',
            learnMoreAboutSecurity: 'En savoir plus sur notre sécurité.',
        },
        subscriptionSettings: {
            title: "Paramètres d'abonnement",
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Type d'abonnement : ${subscriptionType}, Taille de l'abonnement : ${subscriptionSize}, Renouvellement automatique : ${autoRenew}, Augmentation automatique des sièges annuels : ${autoIncrease}`,
            none: 'aucun',
            on: 'allumé',
            off: 'désactivé',
            annual: 'Annuel',
            autoRenew: 'Renouvellement automatique',
            autoIncrease: 'Augmentation automatique des sièges annuels',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Économisez jusqu'à ${amountWithCurrency}/mois par membre actif`,
            automaticallyIncrease:
                'Augmentez automatiquement vos places annuelles pour accueillir les membres actifs dépassant la taille de votre abonnement. Remarque : Cela prolongera la date de fin de votre abonnement annuel.',
            disableAutoRenew: 'Désactiver le renouvellement automatique',
            helpUsImprove: 'Aidez-nous à améliorer Expensify',
            whatsMainReason: 'Quelle est la principale raison pour laquelle vous désactivez le renouvellement automatique ?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Renouvelle le ${date}.`,
            pricingConfiguration: 'Les tarifs dépendent de la configuration. Pour le prix le plus bas, choisissez un abonnement annuel et obtenez la Carte Expensify.',
            learnMore: {
                part1: 'En savoir plus sur notre',
                pricingPage: 'page de tarification',
                part2: 'ou discutez avec notre équipe dans votre',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Prix estimé',
            changesBasedOn: "Cela varie en fonction de votre utilisation de la Carte Expensify et des options d'abonnement ci-dessous.",
        },
        requestEarlyCancellation: {
            title: 'Demander une annulation anticipée',
            subtitle: 'Quelle est la principale raison pour laquelle vous demandez une annulation anticipée ?',
            subscriptionCanceled: {
                title: 'Abonnement annulé',
                subtitle: 'Votre abonnement annuel a été annulé.',
                info: "Si vous souhaitez continuer à utiliser votre(s) espace(s) de travail sur une base de paiement à l'utilisation, tout est prêt.",
                preventFutureActivity: {
                    part1: 'Si vous souhaitez empêcher toute activité et facturation future, vous devez',
                    link: 'supprimer votre/vos espace(s) de travail',
                    part2: '. Notez que lorsque vous supprimez votre/vos espace(s) de travail, des frais vous seront facturés pour toute activité en cours engagée pendant le mois calendaire en cours.',
                },
            },
            requestSubmitted: {
                title: 'Demande soumise',
                subtitle: {
                    part1: "Merci de nous avoir informés de votre souhait d'annuler votre abonnement. Nous examinons votre demande et vous contacterons bientôt via votre chat avec",
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: {
                part1: "En demandant une annulation anticipée, je reconnais et accepte qu'Expensify n'a aucune obligation d'accéder à cette demande conformément à Expensify",
                link: "Conditions d'utilisation",
                part2: "ou tout autre accord de services applicable entre moi et Expensify et qu'Expensify conserve la seule discrétion concernant l'octroi de toute demande de ce type.",
            },
        },
    },
    feedbackSurvey: {
        tooLimited: 'La fonctionnalité doit être améliorée',
        tooExpensive: 'Trop cher',
        inadequateSupport: 'Support client insuffisant',
        businessClosing: "Fermeture, réduction d'effectifs ou acquisition de l'entreprise",
        additionalInfoTitle: 'Vers quel logiciel migrez-vous et pourquoi ?',
        additionalInfoInputLabel: 'Votre réponse',
    },
    roomChangeLog: {
        updateRoomDescription: 'définir la description de la salle sur :',
        clearRoomDescription: 'description de la pièce effacée',
    },
    delegate: {
        switchAccount: 'Changer de compte :',
        copilotDelegatedAccess: 'Copilot : Accès délégué',
        copilotDelegatedAccessDescription: 'Autoriser les autres membres à accéder à votre compte.',
        addCopilot: 'Ajouter copilote',
        membersCanAccessYourAccount: 'Ces membres peuvent accéder à votre compte :',
        youCanAccessTheseAccounts: 'Vous pouvez accéder à ces comptes via le sélecteur de compte :',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Complet';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Limité';
                default:
                    return '';
            }
        },
        genericError: 'Oups, quelque chose a mal tourné. Veuillez réessayer.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `au nom de ${delegator}`,
        accessLevel: "Niveau d'accès",
        confirmCopilot: 'Confirmez votre copilote ci-dessous.',
        accessLevelDescription: "Choisissez un niveau d'accès ci-dessous. Les accès Complet et Limité permettent tous deux aux copilotes de voir toutes les conversations et dépenses.",
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return "Permettre à un autre membre d'effectuer toutes les actions dans votre compte, en votre nom. Cela inclut le chat, les soumissions, les approbations, les paiements, les mises à jour des paramètres, et plus encore.";
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Autoriser un autre membre à effectuer la plupart des actions dans votre compte, en votre nom. Exclut les approbations, paiements, rejets et mises en attente.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Supprimer copilot',
        removeCopilotConfirmation: 'Êtes-vous sûr de vouloir supprimer ce copilote ?',
        changeAccessLevel: "Modifier le niveau d'accès",
        makeSureItIsYou: "Assurons-nous que c'est bien vous",
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Veuillez saisir le code magique envoyé à ${contactMethod} pour ajouter un copilote. Il devrait arriver dans une minute ou deux.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Veuillez saisir le code magique envoyé à ${contactMethod} pour mettre à jour votre copilote.`,
        notAllowed: 'Pas si vite...',
        noAccessMessage: "En tant que copilote, vous n'avez pas accès à cette page. Désolé !",
        notAllowedMessageStart: `En tant que`,
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => `Pour ${accountOwnerEmail}, vous n'avez pas la permission d'effectuer cette action. Désolé !`,
        copilotAccess: 'Accès Copilot',
    },
    debug: {
        debug: 'Déboguer',
        details: 'Détails',
        JSON: 'JSON',
        reportActions: 'Actions',
        reportActionPreview: 'Aperçu',
        nothingToPreview: 'Rien à prévisualiser',
        editJson: '{\n  "Edit JSON": "Modifier JSON"\n}',
        preview: 'Aperçu :',
        missingProperty: ({propertyName}: MissingPropertyParams) => `${propertyName} manquant`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Propriété invalide : ${propertyName} - Attendu : ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valeur invalide - Attendu : ${expectedValues}`,
        missingValue: 'Valeur manquante',
        createReportAction: 'Créer une action de rapport',
        reportAction: 'Action du rapport',
        report: 'Rapport',
        transaction: 'Transaction',
        violations: 'Infractions',
        transactionViolation: 'Violation de transaction',
        hint: 'Les modifications des données ne seront pas envoyées au backend',
        textFields: 'Champs de texte',
        numberFields: 'Champs numériques',
        booleanFields: 'Champs booléens',
        constantFields: 'Champs constants',
        dateTimeFields: 'Champs DateTime',
        date: 'Date',
        time: 'Heure',
        none: 'Aucun',
        visibleInLHN: 'Visible dans LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'vrai',
        false: 'false',
        viewReport: 'Voir le rapport',
        viewTransaction: 'Voir la transaction',
        createTransactionViolation: 'Créer une violation de transaction',
        reasonVisibleInLHN: {
            hasDraftComment: 'A un commentaire en brouillon',
            hasGBR: 'Has GBR',
            hasRBR: 'A un RBR',
            pinnedByUser: 'Épinglé par un membre',
            hasIOUViolations: 'A des violations IOU',
            hasAddWorkspaceRoomErrors: "Des erreurs ont été ajoutées à la salle de l'espace de travail",
            isUnread: 'Est non lu (mode focus)',
            isArchived: 'Est archivé (mode le plus récent)',
            isSelfDM: 'Est-ce un message direct à soi-même ?',
            isFocused: 'Est temporairement concentré',
        },
        reasonGBR: {
            hasJoinRequest: "A une demande d'adhésion (salle admin)",
            isUnreadWithMention: 'Est non lu avec mention',
            isWaitingForAssigneeToCompleteAction: "En attente que l'assigné termine l'action",
            hasChildReportAwaitingAction: 'Le rapport enfant attend une action',
            hasMissingInvoiceBankAccount: 'Le compte bancaire de la facture est manquant',
        },
        reasonRBR: {
            hasErrors: 'Contient des erreurs dans les données du rapport ou des actions du rapport',
            hasViolations: 'Contient des violations',
            hasTransactionThreadViolations: 'A des violations de fil de transaction',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "Il y a un rapport en attente d'action",
            theresAReportWithErrors: 'Il y a un rapport avec des erreurs',
            theresAWorkspaceWithCustomUnitsErrors: "Il y a un espace de travail avec des erreurs d'unités personnalisées",
            theresAProblemWithAWorkspaceMember: "Il y a un problème avec un membre de l'espace de travail",
            theresAProblemWithAWorkspaceQBOExport: "Il y a eu un problème avec un paramètre d'exportation de connexion d'espace de travail.",
            theresAProblemWithAContactMethod: 'Il y a un problème avec un moyen de contact',
            aContactMethodRequiresVerification: 'Une méthode de contact nécessite une vérification',
            theresAProblemWithAPaymentMethod: 'Il y a un problème avec un mode de paiement',
            theresAProblemWithAWorkspace: 'Il y a un problème avec un espace de travail',
            theresAProblemWithYourReimbursementAccount: 'Il y a un problème avec votre compte de remboursement',
            theresABillingProblemWithYourSubscription: 'Il y a un problème de facturation avec votre abonnement',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Votre abonnement a été renouvelé avec succès',
            theresWasAProblemDuringAWorkspaceConnectionSync: "Un problème est survenu lors de la synchronisation de la connexion de l'espace de travail",
            theresAProblemWithYourWallet: 'Il y a un problème avec votre portefeuille',
            theresAProblemWithYourWalletTerms: 'Il y a un problème avec les conditions de votre portefeuille',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Faire un essai',
    },
    migratedUserWelcomeModal: {
        title: 'Voyage et dépenses, à la vitesse du chat',
        subtitle: "La nouvelle version d'Expensify offre la même excellente automatisation, mais maintenant avec une collaboration incroyable :",
        confirmText: 'Allons-y !',
        features: {
            chat: '<strong>Discutez directement sur toute dépense</strong>, rapport ou espace de travail',
            scanReceipt: '<strong>Scannez les reçus</strong> et soyez remboursé',
            crossPlatform: 'Faites <strong>tout</strong> depuis votre téléphone ou navigateur',
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
            part1: 'Renommez vos recherches enregistrées',
            part2: 'ici !',
        },
        bottomNavInboxTooltip: {
            part1: 'Vérifier ce que',
            part2: 'nécessite votre attention',
            part3: 'et',
            part4: 'discuter des dépenses.',
        },
        workspaceChatTooltip: {
            part1: 'Discuter avec',
            part2: 'approvers',
        },
        globalCreateTooltip: {
            part1: 'Créer des dépenses',
            part2: ', commencer à discuter,',
            part3: 'et plus.',
            part4: 'Essayez-le !',
        },
        GBRRBRChat: {
            part1: 'Vous verrez 🟢 sur',
            part2: 'actions à entreprendre',
            part3: ',\net 🔴 sur',
            part4: 'éléments à examiner.',
        },
        accountSwitcher: {
            part1: 'Accédez à votre',
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
            part2: 'Essayez un reçu test !',
            part3: 'Choisissez notre',
            part4: 'responsable de test',
            part5: "pour l'essayer !",
            part6: 'Maintenant,',
            part7: 'soumettre votre dépense',
            part8: 'et regardez la magie opérer !',
            tryItOut: 'Essayez-le',
            noThanks: 'Non merci',
        },
        outstandingFilter: {
            part1: 'Filtrer les dépenses\nqui',
            part2: "besoin d'approbation",
        },
        scanTestDriveTooltip: {
            part1: 'Envoyer ce reçu à',
            part2: "complétez l'essai !",
        },
    },
    discardChangesConfirmation: {
        title: 'Ignorer les modifications ?',
        body: 'Êtes-vous sûr de vouloir abandonner les modifications que vous avez apportées ?',
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
            description: "Assurez-vous que les détails ci-dessous vous conviennent. Une fois que vous aurez confirmé l'appel, nous enverrons une invitation avec plus d'informations.",
            setupSpecialist: 'Votre spécialiste de configuration',
            meetingLength: 'Durée de la réunion',
            dateTime: 'Date et heure',
            minutes: '30 minutes',
        },
        callScheduled: 'Appel programmé',
    },
    autoSubmitModal: {
        title: 'Tout est clair et soumis !',
        description: 'Tous les avertissements et violations ont été levés donc :',
        submittedExpensesTitle: 'Ces dépenses ont été soumises',
        submittedExpensesDescription: "Ces dépenses ont été envoyées à votre approbateur mais peuvent encore être modifiées jusqu'à leur approbation.",
        pendingExpensesTitle: 'Les dépenses en attente ont été déplacées',
        pendingExpensesDescription: "Toutes les dépenses en attente sur la carte ont été déplacées vers un rapport séparé jusqu'à leur validation.",
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Faites un essai de 2 minutes',
        },
        modal: {
            title: 'Faites-nous essayer',
            description: 'Faites une visite rapide du produit pour vous mettre à jour rapidement. Aucun arrêt nécessaire !',
            confirmText: "Commencer l'essai",
            helpText: 'Skip',
            employee: {
                description:
                    "<muted-text>Offrez à votre équipe <strong>3 mois gratuits d'Expensify !</strong> Il vous suffit d'entrer l'email de votre patron ci-dessous et de lui envoyer une dépense test.</muted-text>",
                email: "Entrez l'email de votre patron",
                error: 'Ce membre possède un espace de travail, veuillez saisir un nouveau membre pour tester.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Vous êtes actuellement en train de tester Expensify',
            readyForTheRealThing: 'Prêt pour la vraie expérience ?',
            getStarted: 'Commencer',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} vous a invité à essayer Expensify  \nSalut ! Je viens de nous obtenir *3 mois gratuits* pour essayer Expensify, la manière la plus rapide de gérer les dépenses.\n\nVoici un *reçu test* pour vous montrer comment cela fonctionne :`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
